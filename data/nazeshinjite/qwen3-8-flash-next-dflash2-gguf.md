# nazeshinjite/Qwen3.8-Flash-Next-DFlash2-GGUF

## Resumen

Qwen3.8-Flash-Next-DFlash2-GGUF es una conversión a formato GGUF, publicada por el usuario nazeshinjite, del modelo DFlash 2 de incoai, que actúa como *draft model* (modelo borrador) para la decodificación especulativa sobre Qwen3.8-Flash-Next de Qwen. No es un modelo de lenguaje autónomo: su función es proponer bloques de tokens que el modelo objetivo (Qwen3.8-Flash-Next) verifica, acelerando la generación sin alterar la distribución de salida. La verificación es sin pérdidas: en modo greedy la salida coincide exactamente con la del modelo objetivo, y en modo muestreo se conserva su distribución.

La relevancia de esta ficha radica en que DFlash 2 es un *drafter* de difusión por bloques (*block-diffusion*): propone un bloque completo de tokens en una sola pasada, conserva los mejores candidatos en cada posición y un pequeño selector elige un camino coherente entre ellos. Según las mediciones del propio autor, sobre un objetivo UD-Q4_K_XL en un Apple M5 Max con Metal, se obtiene una mejora geométrica del 17 % en velocidad de decodificación frente al *MTP head* nativo (87,9 t/s frente a 75,1 t/s), con ganancias de hasta el 39 % en salidas tipo lista.

El repositorio pesa 1,0 GB y ofrece dos cuantizaciones (Q4_0 y Q8_0), recomendándose Q4_0 por igualar a Q8_0 en aceptación y velocidad ocupando 287 MiB menos. Requiere llama.cpp v0.8.0 o superior y funciona mediante el modo `draft-dflash` de decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Draft model de difusión por bloques (block-diffusion), 5 capas, attention sliding-window de 2048 tokens, block size 8 |
| Parametros totales | 603.065.600 (aprox. 603 M) |
| Parametros activos | no disponible (no se indica si es MoE; al ser un drafter, todos los parámetros se usan en cada pasada) |
| Longitud de contexto | Ventana deslizante de 2048 tokens en su propia atención (el contexto efectivo lo fija el modelo objetivo, hasta 262.144 tokens) |
| Tipos de cuantizacion | Q4_0 (recomendada), Q8_0; fuente BF16 (1.150 MiB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

DFlash 2 es un *drafter* de difusión por bloques de 5 capas con dimensión oculta de 2560 y atención por ventana deslizante de 2048 tokens. A diferencia de un modelo borrador autorregresivo clásico, genera un bloque completo de 8 tokens en una sola pasada, conserva los mejores candidatos por posición y emplea un pequeño selector para elegir un camino coherente entre ellos. Lee representaciones internas de las capas 5, 15, 25, 35 y 45 del modelo objetivo, lo que le permite alinear sus borradores con el estado computacional real de Qwen3.8-Flash-Next.

El modelo base es incoai/Qwen3.8-Flash-Next-DFlash2, diseñado específicamente como compañero de decodificación especulativa para Qwen/Qwen3.8-Flash-Next, un modelo híbrido basado en Gated DeltaNet. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO para este drafter. Como detalle de ingeniería relevante: al ser híbrido el modelo objetivo, este mantiene una instantánea de estado recurrente por cada token borrador (112,6 MiB por paso) para poder deshacer borradores rechazados.

## Capacidades

- **Generación de borradores para decodificación especulativa**: propone bloques de hasta 5 tokens (configurable con `--spec-draft-n-max`, admitiendo hasta 8) que el modelo objetivo verifica sin pérdida de calidad.
- **Verificación sin pérdidas**: la salida greedy coincide exactamente con la del modelo objetivo y el muestreo preserva su distribución.
- **Continuación sobre prompts con imágenes**: mantiene el borrado de tokens incluso cuando el prompt incluye contenido visual (usando `--mmproj` en llama.cpp).
- **Compatibilidad con cascading**: puede combinarse con `ngram-mod` (`--spec-type ngram-mod,draft-dflash`) para generar borradores más largos que n-max.
- **Uso exclusivo como acompañante**: no genera texto por sí mismo; requiere el modelo objetivo Qwen3.8-Flash-Next.
- No soporta tool calling, agentes ni razonamiento autónomo por sí mismo: esas capacidades dependen del modelo objetivo.

## Casos de uso

- **Aceleración de inferencia local de Qwen3.8-Flash-Next en Apple Silicon**: en un M5 Max con Metal, el drafter eleva la velocidad geométrica de 75,1 a 87,9 t/s (+17 %) frente al MTP head, ideal para quien ya ejecuta el modelo objetivo en local con llama.cpp.
- **Generación de código en local**: es el escenario con mayor ganancia relativa tras las listas; en prompts de código se pasa de 80,5 a 95,1 t/s (+18 %), útil para autocompletado y asistentes de programación que ejecutan el modelo en un Mac.
- **Salidas estructuradas tipo lista (JSON, enumeraciones, tablas)**: con ganancias de +39 % en prompts de listas (91,4 a 127,0 t/s), es especialmente adecuado para pipelines que generan JSON, YAML o respuestas enumeradas.
- **Procesamiento de contextos largos**: con contexto de 5,8k tokens se mide +19 % de mejora (80,2 a 95,3 t/s), adecuado para resumen o análisis de documentos largos con el modelo objetivo configurado a 131.072 o 262.144 tokens de contexto.
- **Servidores de inferencia de un slot en local**: el comando `llama-server` recomendado con `-np 1` y `-ub 1024` permite montar un endpoint OpenAI-compatible acelerado; conviene tener en cuenta que el comportamiento multi-slot en Metal no ha sido probado.
- **Chat con razonamiento (thinking mode)**: la configuración de muestreo recomendada corresponde al perfil *thinking* oficial de Flash-Next (`--temp 1.0 --top-p 0.95 --top-k 20`), por lo que se integra directamente en flujos conversacionales con razonamiento del modelo objetivo.
- **Cargas de trabajo intensivas en listas**: si el volumen de trabajo es mayoritariamente de listas, puede configurarse n-max 8 para obtener hasta +48 % frente a MTP, a costa de una ligera penalización en prosa (-5 %).

## Benchmarks y rendimiento

Resultados publicados por el autor del repositorio (Apple M5 Max, Metal, llama.cpp v0.8.0, objetivo UD-Q4_K_XL, `-c 262144`, n-max 5, p-min 0,75), comparando DFlash 2 Q4_0 frente al MTP head nativo (n3):

| Prompt | MTP n3 / p0.75 | DFlash 2 Q4_0 n5 / p0.75 | Diferencia |
| :--- | ---: | ---: | ---: |
| Prosa | 53,8 t/s | 51,9 t/s | -3 % |
| Código | 80,5 t/s | 95,1 t/s | +18 % |
| Lista | 91,4 t/s | 127,0 t/s | +39 % |
| Contexto (5,8k) | 80,2 t/s | 95,3 t/s | +19 % |
| **Media geométrica** | **75,1 t/s** | **87,9 t/s** | **+17 %** |

Comparativa de cuantizaciones del drafter (mismo objetivo y ajustes):

| Drafter | Aceptación | Decodificación (geomean) | Pesos cargados |
| :--- | ---: | ---: | ---: |
| Q8_0 | 85,4 % | 74,3 t/s | 611 MiB |
| Q4_0 | 86,4 % | 74,6 t/s | 324 MiB |

Otros datos medidos: n-max 5/6/7/8 arrojan 74,5/75,2/75,8/76,2 t/s (empate técnico); p-min 0,75 supera a 0,3 (72,6 t/s), 0,0 (69,6 t/s) y 0,9 (70,9 t/s); el muestreo probabilístico del drafter es un 0,7 % peor que greedy. No se han publicado benchmarks de MMLU, HumanEval, GSM8K ni similares, lo cual es esperable al tratarse de un drafter y no de un modelo de lenguaje autónomo.

## Requisitos de hardware

- **VRAM / memoria estimada para el drafter (Q4_0)**: 324 MiB de pesos + 60 MiB de caché KV + 2.926 MiB de buffer de cómputo + 563 MiB de rollback de estado recurrente del objetivo + 48 MiB de crecimiento del buffer del objetivo ≈ **3,9 GiB adicionales** sobre lo que consume el modelo objetivo. Con Q8_0, el total sube a ≈ 4,2 GiB.
- **Comparativa de memoria con el MTP head**: aunque en disco DFlash 2 es unas 6 veces más pequeño (334 MiB frente a 2.098 MiB), en ejecución el coste es similar (3.921 MiB frente a 3.636 MiB) por el gran buffer de cómputo del drafter.
- **Hardware de referencia**: Apple M5 Max con 128 GB de memoria unificada y backend Metal. No hay mediciones en GPU NVIDIA ni en otras plataformas.
- **Consumer hardware**: al ocupar solo ~324 MiB de pesos, el drafter cabe en cualquier GPU moderna; el requisito real lo impone el modelo objetivo Qwen3.8-Flash-Next (cuantizado en 6 archivos GGUF UD-Q5_K_XL) junto con los ~3,9 GiB extra de este drafter.
- **Despliegue**: exclusivamente mediante llama.cpp (v0.8.0 o superior) con `llama-server` o `llama-cli` y el modo `--spec-type draft-dflash`. No hay soporte documentado para vLLM, TGI u Ollama; la evaluación upstream del método se realizó con SGLang sobre GB300.
- **Latencia y throughput**: 87,9 t/s de media geométrica en M5 Max con el objetivo UD-Q4_K_XL; el objetivo solo (sin drafter) no se reporta en la ficha.
- **Ajustes recomendados**: `--spec-draft-n-max 5 --spec-draft-p-min 0.75`, muestreo greedy por defecto del drafter, un slot (`-np 1`), `-ub 1024`, `-ngl 99`, `-fa on`.

## Comparativa con modelos similares

| Caracteristica | DFlash 2 (este modelo) | MTP head de Flash-Next (ggml-org) | Drafter autorregresivo clasico (p. ej. EAGLE) |
|---|---|---|---|
| Tipo | Block-diffusion, 5 capas | Multi-token prediction nativa | Transformer autorregresivo pequeño |
| Tamano en disco (Q4_0) | 334 MiB | 2.098 MiB | no disponible |
| Coste en ejecucion | ~3,9 GiB extra | ~3,6 GiB extra | no disponible |
| Tokens por borrador | Hasta 5-8 por pasada | Hasta 3 | Tipicamente 1 por pasada |
| Velocidad geomean (M5 Max) | 87,9 t/s | 75,1 t/s | no disponible |
| Mejora relativa | +17 % (hasta +39 % en listas) | Baseline | no disponible |
| Cache KV | Fija, 60 MiB (ventana 2048) | Crece con el contexto (~640 MiB a 262k, extrapolado) | Crece con el contexto |
| Licencia | Apache 2.0 | no disponible | no disponible |

## Limitaciones y advertencias

- **No es un modelo de lenguaje autónomo**: no puede usarse solo para generar texto; requiere obligatoriamente el modelo objetivo Qwen3.8-Flash-Next cargado en llama.cpp.
- **Requiere llama.cpp v0.8.0 o superior**: versiones anteriores abortan en la primera petición (corregido en el PR #30927 de ggml-org/llama.cpp). Para cascading con `ngram-mod` en objetivos híbridos se necesita la compilación b11996 o posterior (PR #31350).
- **Parámetros de especulación fijos al arranque**: el modo `draft-dflash` ignora los valores por solicitud de `speculative.n_max` / `speculative.p_min`; cambiarlos exige reiniciar el servidor.
- **Penalización en prosa**: frente al MTP head, DFlash 2 es un 3 % más lento en prosa (51,9 frente a 53,8 t/s); su ventaja se concentra en código, listas y contextos largos.
- **Coste de memoria en ejecución no trivial**: pese a su pequeño tamaño en disco, el buffer de cómputo de 2,9 GiB hace que su huella en runtime sea comparable a la del MTP head; además, cada nivel adicional de `--spec-draft-n-max` cuesta ~113 MiB por el rollback del estado recurrente del objetivo híbrido.
- **Sin pruebas multi-slot**: todas las mediciones se hicieron con `-np 1` en Metal; el comportamiento con varios slots concurrentes no está verificado.
- **Sesgos y alucinaciones**: al ser un drafter con verificación sin pérdidas, no introduce sesgo ni alucinaciones propias; los sesgos y el riesgo de alucinación son los del modelo objetivo Qwen3.8-Flash-Next, no documentados en esta ficha.
- **Idiomas**: no se declara el soporte de idiomas; hereda el del modelo base Qwen.
- **Plataforma de validación limitada**: los datos de rendimiento provienen únicamente de Apple M5 Max con Metal; en NVIDIA u otras plataformas los resultados pueden diferir.

## Enlaces

- Repositorio del modelo (GGUF): https://huggingface.co/nazeshinjite/Qwen3.8-Flash-Next-DFlash2-GGUF
- Modelo base (drafter upstream): https://huggingface.co/incoai/Qwen3.8-Flash-Next-DFlash2
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog sobre DFlash 2: https://inco.ai/blog/dflash2/
- Repositorio del método: https://github.com/z-lab/dflash
- PR de corrección en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/30927
- PR de cascading en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31350
- MTP head cuantizado (ggml-org): https://huggingface.co/ggml-org
