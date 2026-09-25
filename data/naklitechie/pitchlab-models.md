# naklitechie/pitchlab-models

## Resumen

`naklitechie/pitchlab-models` no es un modelo único, sino el almacén de trabajo del proyecto Pitch, un asistente de compras en tienda que responde a preguntas de clientes a partir del catálogo propio de un comerciante. El repositorio, publicado por naklitechie (Chirag Patnaik), recoge los adaptadores LoRA, los modelos fusionados y las compilaciones GGUF generadas durante el entrenamiento de asistentes por comerciante, además de los GGUF base sobre los que se sirvieron. El propio autor lo describe como un archivo de experimentos y no como una release curada.

El contenido se organiza en tres carpetas. `adapters/` reúne 24 adaptadores PEFT LoRA de rango 32, algunos con checkpoints de entrenamiento. `merged/` contiene tres modelos LFM2.5-230M con un adaptador ya fusionado en formato safetensors. `serve/` aloja las compilaciones GGUF empleadas para servir: modelos base, LoRA en GGUF y builds LFM2 fusionados. Los adaptadores se entrenaron sobre cinco modelos base distintos: `LiquidAI/LFM2.5-230M` (230 millones de parámetros), `google/gemma-4-E4B`, `google/gemma-4-12B-it-qat-q4_0-unquantized`, `Qwen/Qwen3-4B-Instruct-2507` y `Qwen/Qwen3-8B`.

Su relevancia es práctica más que competitiva: documenta un flujo completo de personalización por cliente sobre modelos pequeños y medianos, con despliegue vía llama.cpp y licencias heredadas de cada base. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta, y las seis demos públicas del proyecto no cargan desde este repositorio, sino desde `naklitechie/pitch-demo-weights`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es una arquitectura única. Adaptadores LoRA (PEFT) sobre modelos transformer de las familias LFM2.5, Gemma 4 y Qwen3; la model card no detalla la arquitectura interna de cada base |
| Parametros totales | No aplica un valor único. Segun el artefacto: 230 M (LFM2.5-230M), 4 B (Gemma 4 E4B, Qwen3-4B-Instruct-2507), 8 B (Qwen3-8B) y 12 B (Gemma 4 12B QAT) |
| Parametros activos | No disponible (no se declara ninguna arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_M, Q8_0 y Q4_0 en los builds LFM2; Gemma 4 12B en q4_0 (base QAT) y Q8 para los adaptadores LoRA; LoRA GGUF en q8 para Gemma; LoRA PEFT en safetensors sin cuantizar (rango 32) |
| Idiomas soportados | No disponible |
| Licencia | Mixta (campo `license: other`, `license_name: mixed-see-readme`). Cada fichero hereda la licencia de su base: LFM Open License v1.0 para LFM2.5-230M y sus derivados; Apache-2.0 para Gemma 4 E4B, Gemma 4 12B y sus derivados; Apache-2.0 para Qwen3-4B-Instruct-2507, Qwen3-8B y sus derivados |
| Formato de pesos | safetensors (adaptadores PEFT y modelos fusionados) y GGUF (bases, LoRA y builds fusionados) |

Nota de consistencia: HuggingFace informa de un tamaño de repositorio de 1,0 GB, mientras que la model card declara 4,7 GB en `adapters/`, 1,3 GB en `merged/` y 28 GB en `serve/`. La discrepancia no está explicada en la información disponible.

## Arquitectura y entrenamiento

El repositorio no entrena un modelo desde cero: produce adaptadores LoRA sobre bases ya existentes. En los adaptadores LFM2 los módulos objetivo son las proyecciones de atención y de MLP (`q_proj`, `k_proj`, `v_proj`, `out_proj`, `in_proj`, `w1`, `w2`, `w3`); en los adaptadores de Gemma y Qwen el ajuste se limita a atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`). Todos los adaptadores son de rango 32.

El repositorio distingue entre adaptadores simples y adaptadores "stacked" (apilados). En estos últimos, el adaptador se entrenó sobre una base que ya incorporaba un adaptador anterior fusionado; `adapter_config.json` registra la ruta local de esa base fusionada, de modo que para reproducirla hay que fusionar primero el adaptador previo indicado sobre LFM2.5-230M. Los nombres de carpeta hacen referencia a comerciantes concretos (Headphone Zone / `hz`, Equippers, Decathlon, 111Skin, Great Jones, Nicobar), que identifican la demo para la que se construyó cada modelo y no implican patrocinio ni revisión por su parte. No se especifican en la model card el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Responder preguntas de clientes a partir del catálogo de un comerciante concreto, que es el objetivo declarado del proyecto Pitch.
- Conversación multi-turno de atención al cliente (la model card no detalla la ventana de contexto soportada).
- Comportamiento de rechazo o derivación: existen adaptadores con sufijos `decline` y `esc` (`lfm2-230m-hz-decline`, `lfm2-230m-equippers-esc`, `-esc-v2`, `-esc-v3`, `-headphonezone-escv2`, `-headphonezone-escv3-stock`, `-decathlon-escv2`, `-nicobar-escv2`). La model card no define qué significan exactamente esos sufijos.
- Uso de herramientas: hay adaptadores con sufijo `toolpack` (`lfm2-230m-hz-toolpack`, `qwen3-4b-hz-toolpack`). La model card no documenta el esquema de tool calling ni su formato.
- Adaptación por comerciante: la misma base puede personalizarse con adaptadores distintos para catálogos distintos.
- Capacidades multilingües, de visión, audio o modo de razonamiento explícito: no disponible.

Advertencia: las capacidades anteriores se deducen del propósito declarado y de los nombres de carpeta. La model card solo indica que las salidas se evaluaron para las demos concretas para las que se construyó cada modelo.

## Casos de uso

- Asistentes de compra por comerciante en producción: se carga el GGUF base correspondiente y se aplica el adaptador LoRA de ese comerciante con `llama-server -m .gguf --lora <adaptador>.gguf`, de forma que un mismo binario sirve varios catálogos intercambiando el adaptador.
- Estudio de personalización con LoRA en modelos pequeños: el repositorio contiene 24 adaptadores de rango 32 con distintos módulos objetivo (atención y MLP en LFM2, solo atención en Gemma y Qwen), lo que permite comparar el efecto de la cobertura del adaptador sobre el mismo tipo de tarea.
- Investigación sobre apilamiento de adaptadores: los adaptadores `stacked` documentan una cadena de fusiones sucesivas sobre LFM2.5-230M, útil para estudiar degradación o interferencia entre adaptadores entrenados en secuencia.
- Despliegue en hardware de gama baja o en CPU: los builds LFM2.5-230M en Q4_K_M y Q8_0 (aproximadamente 230 M de parámetros) permiten servir un asistente de catálogo en equipos sin GPU dedicada.
- Comparativa de bases para una misma tarea: el repositorio incluye adaptadores equivalentes sobre Qwen3-4B, Gemma 4 12B y LFM2.5-230M, lo que permite evaluar la relación entre tamaño de base y calidad en preguntas sobre catálogo.
- Réplica de un pipeline de QAT en producción: el uso de `gemma-4-12b-it-qat-q4_0-unquantized` como base con adaptadores LoRA en q8 sirve como referencia para servir un modelo de 12 B cuantizado a 4 bits con personalización encima.
- Generación de material de evaluación interna: los checkpoints de entrenamiento incluidos en algunos adaptadores permiten analizar la evolución del ajuste sin volver a entrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que las salidas se evaluaron para las demos concretas para las que se construyó cada modelo, sin publicar métricas.

## Requisitos de hardware

Los valores de VRAM que aparecen a continuación son estimaciones calculadas a partir del número de parámetros y del ancho de bits de cada cuantización; el autor no publica requisitos de hardware.

| Artefacto | Cuantizacion | VRAM aproximada de pesos |
|---|---|---|
| LFM2.5-230M | Q4_K_M / Q4_0 | ~0,15 GB |
| LFM2.5-230M | Q8_0 | ~0,25 GB |
| Qwen3-4B-Instruct-2507 / Gemma 4 E4B | Q4 | ~2,5 GB |
| Qwen3-4B-Instruct-2507 / Gemma 4 E4B | Q8 | ~4,5 GB |
| Qwen3-8B | Q4 | ~5 GB |
| Qwen3-8B | Q8 | ~8,5 GB |
| Gemma 4 12B QAT | q4_0 | ~7 GB |

- Cabe en GPU de consumo: LFM2.5-230M en cualquier GPU e incluso en CPU; los modelos de 4 B en Q4 o Q8 en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB); Qwen3-8B en Q4 en tarjetas de 8 GB con holgura justa; Gemma 4 12B en q4_0 en tarjetas de 12-16 GB.
- GPU recomendadas: RTX 4090 (24 GB) para 12 B en Q4/Q8 o para 8 B con contexto largo; A100 40/80 GB y H100 para FP16 o para servicio concurrente de los modelos mayores.
- Opciones de despliegue: llama.cpp / `llama-server` para los GGUF y los LoRA GGUF (el propio autor documenta `llama-server -m serve/12b-base/gemma-4-12b-it-qat-q4_0.gguf --lora serve/hz-12b/hz-12b-lora-q8.gguf`); Ollama para los GGUF convertibles; vLLM o TGI para los modelos fusionados en safetensors; la librería PEFT para cargar los adaptadores sobre su base en PyTorch.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se conocen en la información proporcionada otros repositorios públicos equivalentes (almacenes de adaptadores LoRA para asistentes de compra por comerciante) con los que comparar. La comparación pertinente es entre las bases empleadas dentro del propio repositorio:

| Base | Parametros | Contexto | Licencia | Formatos en el repo | Uso comercial |
|---|---|---|---|---|---|
| LiquidAI/LFM2.5-230M | 230 M | no disponible | LFM Open License v1.0 | safetensors (LoRA y fusionado), GGUF Q4_K_M, Q8_0, Q4_0 | Condicionado por la LFM Open License v1.0 |
| google/gemma-4-E4B | 4 B (nominal) | no disponible | Apache-2.0 (segun la model card del repo) | GGUF Q8 | Permitido por Apache-2.0 |
| google/gemma-4-12B-it-qat-q4_0-unquantized | 12 B | no disponible | Apache-2.0 (segun la model card del repo) | GGUF q4_0, LoRA GGUF q8 | Permitido por Apache-2.0 |
| Qwen/Qwen3-4B-Instruct-2507 | 4 B | no disponible | Apache-2.0 | GGUF base + LoRA GGUF + PEFT | Permitido por Apache-2.0 |
| Qwen/Qwen3-8B | 8 B | no disponible | Apache-2.0 | GGUF base + LoRA GGUF + PEFT | Permitido por Apache-2.0 |

Datos de rendimiento comparado: no disponible.

## Limitaciones y advertencias

- No es una release curada: el autor lo describe explícitamente como un archivo de experimentos, con 0 descargas y 0 likes, y sin garantía de ningún tipo.
- Licencia mixta: el repositorio no tiene una licencia única. Cada fichero hereda la de su base, y los derivados de LFM2.5-230M quedan bajo la LFM Open License v1.0, que puede imponer condiciones distintas a las de los derivados Apache-2.0. Hay que comprobar la licencia concreta del fichero antes de cualquier uso comercial.
- Nombres de comerciantes: las carpetas llevan nombres de comercios reales (Headphone Zone, Equippers, Decathlon, 111Skin, Great Jones, Nicobar) únicamente como etiqueta de la demo para la que se construyó cada modelo; no implican que el comercio haya creado, revisado o respaldado el modelo.
- Los adaptadores apilados no son autónomos: requieren reconstruir antes la base fusionada que indica `adapter_config.json`, fusionando el adaptador previo sobre LFM2.5-230M. Usarlos sobre la base original daría resultados incorrectos.
- Riesgo de alucinación: no hay evaluación publicada sobre fidelidad al catálogo, y un asistente que responde sobre productos es especialmente sensible a inventar precios, disponibilidad o especificaciones.
- Idiomas soportados: no disponibles. No se puede asumir cobertura multilingüe.
- Longitud de contexto: no disponible, lo que impide planificar conversaciones largas o catálogos extensos sin pruebas previas.
- Sesgos: no se documenta ninguna evaluación de sesgos ni la composición del dataset de entrenamiento.
- Sin métricas: no hay benchmarks ni evaluación cuantitativa publicada, solo una validación cualitativa para las demos concretas.
- Inconsistencia de tamaño: HuggingFace declara 1,0 GB de repositorio frente a los 4,7 GB + 1,3 GB + 28 GB que indica la model card, lo que puede afectar a la planificación de la descarga.
- Las demos públicas no usan este repositorio: cargan desde `naklitechie/pitch-demo-weights`, de modo que el comportamiento observado en las demos no refleja necesariamente el de estos ficheros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/naklitechie/pitchlab-models
- Pesos de las demos: https://huggingface.co/naklitechie/pitch-demo-weights
- Demos en vivo: https://demos.chiragpatnaik.com
- Modelo base LiquidAI/LFM2.5-230M: https://huggingface.co/LiquidAI/LFM2.5-230M
- Modelo base google/gemma-4-E4B: https://huggingface.co/google/gemma-4-E4B
- Modelo base google/gemma-4-12B-it-qat-q4_0-unquantized: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Modelo base Qwen/Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo base Qwen/Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Perfil del autor en HuggingFace: https://huggingface.co/naklitechie
- Perfil del autor en GitHub: https://github.com/naklitechie
- Sitio personal: https://www.chiragpatnaik.com
- Sitio del proyecto: https://naklitechie.com
- Página personal del autor: https://naklitechie.github.io/
