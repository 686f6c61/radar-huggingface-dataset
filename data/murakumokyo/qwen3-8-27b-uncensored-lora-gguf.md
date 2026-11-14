# MurakumoKyo/Qwen3.8-27B-Uncensored-LoRA-GGUF

## Resumen

Qwen3.8-27B-Uncensored-LoRA-GGUF es una conversión a formato GGUF del adaptador LoRA `PhalaCloud/Qwen3.8-27B-Uncensored-LoRA`, publicado por el usuario MurakumoKyo. No se trata de un modelo completo, sino de un adaptador PEFT de rango 3 (aproximadamente 13 MB en su versión original en safetensors) diseñado para aplicarse sobre el checkpoint oficial Qwen3.8-27B con el objetivo de eliminar las respuestas de rechazo del modelo base.

El adaptador fue construido con la herramienta Heretic v1.3.0 mediante técnicas de abliteration: se identifican y ortogonalizan las direcciones del espacio de activaciones asociadas a comportamientos de rechazo, y se entrena un LoRA de bajo rango que modifica las proyecciones `o_proj`, `out_proj` y `down_proj`. El resultado permite servir tanto el modelo base como la variante sin censura en el mismo motor de inferencia, seleccionando el adaptador por petición.

La relevancia de esta ficha es doble: por un lado, documenta un caso de uso de adaptadores LoRA de bajo rango para modificar comportamiento sin reentrenar el modelo completo; por otro, advierte de las implicaciones legales y de seguridad de los modelos "uncensored", dado que el dataset de construcción deriva de Stanford Alpaca (CC BY-NC 4.0, uso exclusivamente de investigación) y de AdvBench (MIT). La licencia Apache-2.0 declarada cubre únicamente los pesos del adaptador, no los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) de rango 3 sobre transformer Qwen3.8-27B; módulos objetivo `o_proj`, `out_proj`, `down_proj` |
| Parametros totales | 6.488.064 (adaptador LoRA; el modelo base Qwen3.8-27B no se distribuye en este repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.8-27B; no especificada en la información) |
| Tipos de cuantizacion | GGUF (conversión del adaptador); el modelo base se sirve en FP8 según la model card |
| Idiomas soportados | en |
| Licencia | apache-2.0 (solo pesos del adaptador; datasets upstream con licencias separadas) |
| Formato de pesos | GGUF (repo actual); safetensors (adaptador original en el repo de PhalaCloud) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 3 entrenado con Heretic v1.3.0 sobre Qwen3.8-27B cargado en NF4 con cómputo en BF16. El proceso de construcción aplica normalización completa de filas y una dirección ortogonalizada para localizar y neutralizar las direcciones de activación responsables de los rechazos. Los factores nativos se conservaron antes de la fusión y se castearon explícitamente a BF16. La búsqueda de hiperparámetros usó semilla 20261108, batch 16, thinking desactivado y un límite de 100 tokens por construcción, con un presupuesto de 200 trials (60 de arranque, 7.200 segundos de límite, 85 completados). La selección minimizó los rechazos en construcción entre los trials de Pareto con KL <= 0,22, y eligió el trial 61 (KL 0,1080). Los scores de evaluación no participaron en la selección del ganador.

Los datos de construcción provienen de `mlabonne/harmless_alpaca` (400 train / 100 test, derivado de Stanford Alpaca, CC BY-NC 4.0) y `mlabonne/harmful_behaviors` (400 train / 96 test, derivado de AdvBench, MIT upstream). Se excluyeron solapamientos exactos normalizados con la evaluación, aunque puede persistir solapamiento semántico o por familia de tareas. No se documenta el número total de tokens de entrenamiento ni la composición completa del dataset más allá de estas dos fuentes.

## Capacidades

- Generación de texto en inglés sobre el modelo base Qwen3.8-27B, con el comportamiento de rechazo reducido drásticamente (0/60 rechazos en StrongREJECT con el juez primario, frente a 59/60 del base).
- Razonamiento matemático: GSM8K flexible-extract con thinking off alcanza 1.275/1.319 (96,66%), una mejora de +0,30 pp respecto al base.
- Seguimiento de instrucciones: IFEval prompt-level strict con thinking off obtiene 442/541 (81,70%), una caída de -0,74 pp respecto al base.
- Tool calling con parser `qwen3_coder`: 1/300 rondas rotas frente a 6/300 del base en modo reasoning-on.
- Compatibilidad con modo thinking (on/off) heredada del modelo base Qwen3.8.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni agentes multi-paso más allá del tool calling evaluado.

## Casos de uso

- Investigación sobre alineación y rechazos: el adaptador permite comparar el comportamiento del mismo checkpoint con y sin la dirección de rechazo activa, sirviendo base y adaptador en el mismo motor SGLang y seleccionando por nombre de modelo (`qwen/qwen3.8-27b` frente a `qwen/qwen3.8-27b:unc-r3-1abf13b2`).
- Evaluación de robustez de filtros de seguridad: al reducir los rechazos a 0/60 en StrongREJECT, sirve para medir si los clasificadores de salida externos detectan contenido que el modelo ya no bloquea internamente.
- Generación creativa sin restricciones de rechazo: diálogos de ficción, guiones o narrativa donde el modelo base rechazaría por contenido sensible, con la advertencia de que la salida puede ser dañina o fabricada.
- Experimentación con LoRA en producción: el adaptador de rango 3 y ~13 MB permite probar carga dinámica de adaptadores por petición con `--enable-lora --lora-strict-loading` y `--max-loras-per-batch 2` en SGLang.
- Benchmarking de cuantizaciones: la conversión a GGUF permite evaluar la degradación del adaptador bajo cuantización, aunque la model card advierte que otras cuantizaciones requieren evaluación fresca.
- Estudio de tool calling tras abliteration: con 1/300 rondas rotas frente a 6/300 del base, es útil para analizar si la eliminación de rechazos afecta a la fiabilidad de las llamadas a herramientas en pipelines agénticos.
- Docencia sobre seguridad en IA: como ejemplo práctico de cómo un LoRA de bajo rango puede alterar el comportamiento de seguridad de un modelo de 27B sin reentrenarlo.

## Benchmarks y rendimiento

Datos de la model card del adaptador original (medidos en H200 con Qwen3.8-27B-FP8, KV cache FP8 y EAGLE; "Stock" es el mismo serving sin LoRA en runtime):

| Evaluacion | Stock | Adaptador |
|---|---|---|
| StrongREJECT rechazos, juez primario (off / on) | 59/60 / 60/60 | 0/60 / 0/60 |
| StrongREJECT rechazos, segundo juez (off / on) | 60/60 / 60/60 | 4/60 / 1/60 |
| XSTest rechazos seguros, primario (off / on) | 3/50 / 2/50 | 0/49 / 0/49 validos |
| Rechazos en tareas de producto, primario (off / on) | 2/30 / 3/30 | 0/30 / 0/30 |
| GSM8K flexible-extract, thinking off | 1.271/1.319 (96,36%) | 1.275/1.319 (96,66%; +0,30 pp) |
| IFEval prompt-level strict, thinking off | 446/541 (82,44%) | 442/541 (81,70%; -0,74 pp) |
| Plantillas de capacidad | 44 plantillas que pasan en stock | 44/44 pasan |
| Tool calling con reasoning on, rondas rotas / 300 | 6/300 | 1/300 |

La generación de calidad usó un límite de 4.096 tokens; las respuestas vacías o truncadas del adaptador fueron 1/1.319 en GSM8K y 6/541 en IFEval. Se ejercitaron las 52 plantillas, y las 44 que pasaban en stock definen la comparación de regresión. Los rechazos fueron etiquetados por dos jueces LLM independientes con la misma rúbrica; las etiquetas automáticas no son ground truth humano.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador aislado (es un LoRA de ~13 MB); el modelo base Qwen3.8-27B en FP8 requiere aproximadamente 27 GB de pesos más overhead de KV cache, aunque la cifra exacta no se especifica en la información.
- GPU recomendadas: la evaluación se realizó en H200; el serving probado usa la imagen `ghcr.io/phala-network/sglang:phala-v0.5.21-10` con SGLang.
- ¿Cabe en consumer GPU? No disponible; un modelo de 27B en FP8 no cabe en GPUs de 24 GB sin cuantización adicional, pero no se documentan pruebas en consumer.
- Opciones de despliegue: SGLang (probado y documentado); vLLM no está probado según la model card. La conversión a GGUF sugiere compatibilidad con llama.cpp/Ollama, pero no se documenta su funcionamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-LoRA-GGUF (este) | 6,49 M (adaptador) sobre 27B | no disponible | Abliteration vía LoRA rango 3 | Apache-2.0 (adaptador) | Hugging Face, 0 descargas |
| Qwen3.8-27B (base oficial) | 27B | no disponible | Modelo completo | según Qwen | Hugging Face oficial |
| PhalaCloud/Qwen3.8-27B-Uncensored-LoRA | 6,49 M (adaptador) | no disponible | Mismo adaptador en safetensors | Apache-2.0 (adaptador) | Hugging Face |

No se dispone de datos de benchmarks de terceros para comparar con otras variantes uncensored de la misma familia en la información proporcionada.

## Limitaciones y advertencias

- El adaptador elimina rechazos pero no garantiza precisión ni seguridad: las salidas pueden ser dañinas, fabricadas o poco fiables, según advierte explícitamente la model card.
- El dataset `mlabonne/harmless_alpaca` deriva de Stanford Alpaca, con licencia CC BY-NC 4.0 y guía de uso exclusivamente de investigación para los modelos entrenados; la licencia Apache-2.0 del adaptador no otorga derechos sobre los datos upstream.
- El adaptador está entrenado y evaluado solo en inglés; no se documenta soporte multilingüe.
- Los benchmarks de rechazo usan etiquetado automático por dos jueces LLM, no ground truth humano.
- Otras cuantizaciones, runtimes y perfiles de serving requieren evaluación fresca; vLLM no está probado.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-14), sin validación comunitaria.
- El tamaño del repo es 0.0 GB según Hugging Face, lo que puede indicar que los pesos GGUF no están efectivamente subidos o que la conversión está incompleta.
- La selección del adaptador en SGLang requiere el nombre completo `base:adapter`; un alias suelto puede seleccionar silenciosamente el modelo base.
- El modelo base Qwen3.8-27B no se distribuye en este repositorio; el usuario debe obtenerlo por separado y verificar la revisión `017b9c7af6b5689d5dd426a76e0bc077eb5ca20a` para reproducir la evaluación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MurakumoKyo/Qwen3.8-27B-Uncensored-LoRA-GGUF
- Adaptador original en safetensors: https://huggingface.co/PhalaCloud/Qwen3.8-27B-Uncensored-LoRA
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic/tree/9b7624ddfa69d97dde13615768566fd93c74f82c
- Dataset mlabonne/harmless_alpaca: https://huggingface.co/datasets/mlabonne/harmless_alpaca/tree/02c6a92cfcf11bb0c387334f8146d149d65b587f
- Dataset mlabonne/harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors/tree/01cead01398926d81f7c52bdb790ee8cf77ebba7
- Licencia del adaptador: https://huggingface.co/PhalaCloud/Qwen3.8-27B-Uncensored-LoRA/blob/main/LICENSE
