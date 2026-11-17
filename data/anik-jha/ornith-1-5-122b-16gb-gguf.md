# anik-jha/Ornith-1.5-122B-16GB-GGUF

## Resumen

Ornith-1.5-122B-16GB-GGUF es una cuantización GGUF podada del modelo Ornith-1.5-122B (desarrollado por Ornith AI), publicada por el usuario anik-jha. El objetivo del artefacto es permitir la ejecución de un modelo MoE de gran tamaño en una GPU de 16 GB de VRAM, algo imposible con las cuantizaciones convencionales: la versión más pequeña de unsloth (UD-IQ1_M) ocupa 37,6 GB. Para lograrlo se aplica una poda de expertos mediante la técnica REAP, conservando 66 de los 256 expertos enrutados por capa, junto con un adaptador LoRA de recuperación que corrige la degradación introducida por la poda.

El paquete completo (GGUF de 11,9 GB más adaptador de 1,2 GB) requiere 13,6 GB de memoria de GPU con contexto de 32K y caché KV de 8 bits, y 15,1 GB con contexto de 128K. Está pensado específicamente para generación de código y razonamiento, y se distribuye bajo licencia MIT. La relevancia actual radica en que demuestra una vía práctica para desplegar modelos de mezcla de expertos de escala grande en hardware de consumo, a costa de una pérdida medible de rendimiento frente al modelo sin podar.

La arquitectura subyacente es Qwen3.5-MoE (etiqueta `qwen3_5_moe`), con 36.016.392.192 parámetros totales según los safetensors del modelo base. El repositorio incluye además un cliente de parada y reintento (`redraw.py`) y el fichero de selección de expertos, elementos necesarios para que la inferencia sea utilizable en la práctica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), familia Qwen3.5-MoE; poda de expertos REAP con adaptador LoRA de recuperación |
| Parámetros totales | 36.016.392.192 (modelo base); el GGUF podado conserva 66 de 256 expertos enrutados por capa |
| Parámetros activos | no disponible |
| Longitud de contexto | 32.768 tokens en la configuración medida; hasta 131.072 tokens con 15,1 GB de VRAM |
| Tipos de cuantización | GGUF UD-IQ2_XXS (aproximadamente 2 bits) para el modelo podado; adaptador LoRA en GGUF |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp), más adaptador LoRA GGUF separado |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-122B emplea una arquitectura de mezcla de expertos de la familia Qwen3.5-MoE, con 256 expertos enrutados por capa según se deduce del proceso de poda descrito. Sobre ese modelo se aplica REAP (expert pruning por puntuación), que retiene el 25 % de los expertos de cada capa (64 de 256) y después restaura y reentrena dos expertos adicionales por capa, resultando en 66. El adaptador de recuperación aporta correcciones de bajo rango sobre los 64 expertos conservados en cada capa y se entrena junto con los dos expertos restaurados; el GGUF sin el adaptador no fue evaluado por el autor.

Los pesos se cuantizan a UD-IQ2_XXS partiendo de la versión UD-IQ2_XXS de unsloth (39,1 GB). El adaptador no se fusiona en los pesos cuantizados: llama.cpp calcula su corrección durante la inferencia, lo que incrementa el coste computacional. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo base. La innovación destacable es el propio pipeline de poda más recuperación, que permite reducir un modelo de 74,2 GB (UD-Q4_K_XL) a 13,1 GB de pesos manteniendo una fracción sustancial de su capacidad en tareas de código.

## Capacidades

- Generación de texto conversacional y razonamiento con modo de razonamiento activable (las evaluaciones de HumanEval+ y MBPP+ se realizaron con razonamiento activado).
- Generación de código en Python y otros lenguajes, evaluada en HumanEval+, MBPP+ y LiveCodeBench.
- Razonamiento multi-paso orientado a resolución de problemas de programación.
- Soporte de conversación multi-turno a través de la API de chat de llama-server.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes, visión, audio ni otras modalidades.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistencia de código en estación de trabajo con GPU de 16 GB: el modelo cabe en tarjetas como la RTX 4080 o 4090 con contexto de 32K, lo que permite autocompletado y generación de funciones en local sin depender de servicios en la nube.
- Prototipado de pipelines de código en CI/CD: con HumanEval+ de 0,884 y MBPP+ de 0,712 usando el recetario completo, puede emplearse para generar parches y tests unitarios en entornos con hardware limitado.
- Evaluación de técnicas de poda de MoE: el repositorio incluye el fichero de selección de expertos y el adaptador, lo que lo convierte en una referencia reproducible para investigar REAP y recuperación con LoRA.
- Despliegue en servidores con múltiples ranuras paralelas: las pruebas del autor se ejecutaron con 32 ranuras paralelas en llama-server, lo que indica viabilidad para servir peticiones concurrentes de generación de código en un solo nodo pequeño.
- Educación y experimentación con modelos grandes: permite a desarrolladores sin acceso a A100/H100 estudiar el comportamiento de un MoE de 36.000 millones de parámetros en hardware de consumo.
- Generación de código con razonamiento en entornos aislados: al ser un GGUF ejecutable con llama.cpp y licencia MIT, encaja en despliegues on-premise con requisitos de privacidad, aceptando la tasa de repetición documentada y aplicando el cliente de parada y reintento.

## Benchmarks y rendimiento

| Benchmark | Ornith UD-Q4_K_XL (referencia) | Este repositorio (con redraw) | Este repositorio (primer intento) |
|---|---|---|---|
| HumanEval+ (fracción resuelta) | 0,945 (un intento) | 0,884 | 0,860 (141/164) |
| MBPP+ (fracción resuelta) | 0,810 (un intento) | 0,712 | 0,693 (262/378) |
| LiveCodeBench (130 problemas fáciles y medios) | no disponible | 116/130 (100 en el primer intento) | no disponible |

En LiveCodeBench, la poda simple del 25 % (64 expertos, sin adaptador) resolvió 104 de 130 problemas frente a 116 del repositorio, una ganancia de 9,2 puntos (IC 95 % de +3,1 a +15,4; McNemar p = 0,0075). Por dificultad: 62 de 63 en fáciles y 54 de 67 en medios, frente a 60 de 63 y 44 de 67 de la poda simple. En MBPP+ el adaptador rindió ligeramente peor que la poda simple (269 frente a 276 de 378, diferencia no significativa, p = 0,382). El modelo sin podar no se evaluó en LiveCodeBench.

## Requisitos de hardware

- VRAM medida al arrancar el servidor: 13,6 GB con contexto de 32K y caché KV de 8 bits; 13,9 GB con caché de 16 bits; 15,1 GB con contexto de 128K y caché de 8 bits.
- Cabe en GPU de consumo de 16 GB, como RTX 4080, RTX 4090 o RTX 5070 Ti; no cabe en tarjetas de 12 GB o menos.
- Despliegue mediante llama.cpp con soporte Qwen3.5-MoE (`qwen35moe`); evaluado con el commit `36cbf415` más un parche local menor.
- Flags de inferencia recomendados: `-ngl 99 -c 32768 -ctk q8_0 -ctv q8_0 -fa on --temp 0.6 --top-p 0.95 --top-k 20 --min-p 0 --presence-penalty 1.5 --repeat-last-n 20480`.
- El adaptador debe cargarse con `--lora-scaled ...:1`; sin él el modelo no fue evaluado.
- Rendimiento: en la prueba de LiveCodeBench el adaptador supuso 1,7 veces el tiempo de pared de la poda simple (16.655 s frente a 9.815 s con 32 ranuras paralelas) para 1,12 veces más tokens. La velocidad con un solo usuario no se midió.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HumanEval+ | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-122B-16GB-GGUF (este) | 36.016 M totales, 66 expertos/capa | 32K (medido), hasta 128K | 0,884 con redraw | MIT | GGUF en Hugging Face |
| Ornith-1.5-122B UD-Q4_K_XL (unsloth) | 36.016 M totales, sin podar | no disponible | 0,945 | MIT | GGUF en Hugging Face |
| Ornith-1.5-122B UD-IQ1_M (unsloth) | 36.016 M totales, sin podar | no disponible | no disponible | MIT | GGUF de 37,6 GB |
| Ornith-1.5-122B poda simple 25 % (64 expertos, sin adaptador) | 36.016 M totales, 64 expertos/capa | no disponible | 144/164 con redraw | MIT | no disponible como artefacto independiente |

## Limitaciones y advertencias

- Pérdida de rendimiento frente al modelo sin podar: HumanEval+ baja de 0,945 a 0,884 y MBPP+ de 0,810 a 0,712; la comparación mezcla poda y paso de 4 a 2 bits, por lo que el desglose de cada efecto no está aislado.
- Tendencia a bucles de repetición: 22 de 130 primeros intentos en LiveCodeBench se detuvieron por repetición; tras tres intentos, 4 problemas seguían en bucle y 2 alcanzaron el límite de tokens. Requiere el cliente `redraw.py` o una regla equivalente.
- El adaptador es obligatorio: el GGUF sin él no fue evaluado y su comportamiento es incierto.
- Las flags de penalización (`--presence-penalty 1.5 --repeat-last-n 20480`) forman parte de todas las puntuaciones publicadas; alterarlas invalida los resultados reportados.
- Mayor latencia: el adaptador no está fusionado y se computa en tiempo de inferencia, con 1,7 veces el tiempo de pared en la prueba de 32 ranuras.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo general de los modelos de código.
- Idiomas soportados: no disponible; las evaluaciones se centran en código, presumiblemente en inglés.
- Licencia MIT, que permite uso comercial, pero el modelo base y los datos de entrenamiento pueden arrastrar obligaciones adicionales no detalladas.
- Requiere una compilación de llama.cpp con soporte `qwen35moe`; versiones sin ese soporte no cargarán el modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/anik-jha/Ornith-1.5-122B-16GB-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Paper REAP (referencia en tags): arXiv:2611.20419
- Paper adicional (referencia en tags): arXiv:2607.16721
- Cuantizaciones de unsloth del modelo base: no disponible como enlace directo en la información proporcionada
- Cliente `redraw.py` y fichero de selección de expertos: incluidos en el repositorio de Hugging Face
