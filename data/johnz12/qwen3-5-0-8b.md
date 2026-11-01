# johnz12/Qwen3.5-0.8B

## Resumen

Qwen3.5-0.8B es la variante de menor escala de la familia Qwen3.5, desarrollada por el equipo Qwen (Alibaba). Este repositorio concreto (johnz12/Qwen3.5-0.8B) es una publicacion derivada del modelo base oficial Qwen/Qwen3.5-0.8B-Base, con pesos en formato Transformers y orientada a prototipado, ajuste fino especifico de tarea e investigacion. El modelo combina un encoder de vision con un modelo de lenguaje causal, lo que lo situa en la categoria image-text-to-text.

La arquitectura es hibrida: intercala capas de Gated DeltaNet (atencion lineal) con capas de atencion con compuerta, sobre un backbone transformer de 24 capas y dimension oculta de 1024. Con 873 millones de parametros reales (0,8B nominales) y un contexto nativo de 262.144 tokens, ofrece una ventana de contexto desproporcionada respecto a su tamano, lo que lo hace util para tareas de contexto largo en entornos con recursos limitados.

Su relevancia actual radica en la eficiencia: el entrenamiento con fusion temprana de tokens multimodales y la atencion lineal reducen el coste de inferencia, mientras que la licencia Apache 2.0 permite uso comercial sin restricciones adicionales. Es un modelo de nicho para despliegue en hardware modesto y para experimentacion con arquitecturas hibridas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido con encoder de vision (Gated DeltaNet + atencion con compuerta) |
| Parametros totales | 873.438.784 (0,8B nominales) |
| Parametros activos | no disponible (no se declara como MoE en esta variante) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | 201 idiomas y dialectos (segun la model card de la familia) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con encoder de vision y entrenamiento de fusion temprana sobre tokens multimodales. El layout de capas es 6 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), es decir, por cada bloque de cuatro subcapas hay tres de atencion lineal Gated DeltaNet y una de atencion con compuerta. Las capas Gated DeltaNet usan 16 cabezas de atencion lineal para V y 16 para QK con dimension de cabeza 128; las capas Gated Attention usan 8 cabezas para Q y 2 para KV con dimension de cabeza 256 y RoPE de dimension 64. La FFN tiene dimension intermedia 3584 y el embedding de tokens es de 248.320 entradas (con padding), atado a la salida del LM.

El entrenamiento consta de pre-entrenamiento y post-entrenamiento, con MTP (multi-token prediction) entrenado con multiples pasos, lo que habilita decodificacion especulativa. La familia se entreno con RL escalado sobre entornos multiagente y con una infraestructura que declara casi un 100% de eficiencia de entrenamiento multimodal frente al entrenamiento solo texto. No se especifican en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion del dataset.

## Capacidades

- Generacion de texto y razonamiento en modo no-thinking (los resultados de benchmark publicados corresponden a este modo).
- Comprension de imagenes y texto conjuntos (pipeline image-text-to-text).
- Codigo y matematicas, con paridad declarada frente a Qwen3 y superacion de Qwen3-VL en benchmarks de razonamiento, codigo, agentes y comprension visual.
- Soporte multilingue amplio: 201 idiomas y dialectos.
- Capacidad de agentes y razonamiento multi-paso, respaldada por el entrenamiento RL en entornos multiagente.
- MTP (multi-token prediction) que permite decodificacion especulativa para acelerar la generacion.
- Tool calling / function calling: no se documenta explicitamente en la informacion disponible para esta variante.

## Casos de uso

- Prototipado rapido de asistentes multimodales: el modelo acepta pares imagen-texto y cabe en una sola GPU consumer, lo que permite iterar sobre prompts y flujos de vision-lenguaje sin infraestructura dedicada.
- Ajuste fino especifico de tarea: con 0,8B parametros y licencia Apache 2.0, es viable entrenar variantes especializadas (clasificacion de documentos escaneados, extraccion de campos de imagenes) sobre datasets propios.
- Procesamiento de documentos largos: los 262.144 tokens de contexto permiten resumir o extraer informacion de contratos, informes o transcripciones extensas en una sola pasada.
- Despliegue en el borde (edge): su tamano reducido posibilita inferencia en dispositivos con VRAM limitada o incluso en CPU mediante runtimes optimizados, para tareas de asistencia local.
- Traduccion y atencion multilingue: la cobertura de 201 idiomas lo hace adecuado para preprocesado o traduccion de baja latencia en pipelines con muchos idiomas.
- Generacion asistida en pipelines de agentes: el entrenamiento RL multiagente y el MTP lo hacen util como componente de bajo coste en bucles de razonamiento de varios pasos, donde el modelo grande solo se invoca en los pasos criticos.
- Investigacion sobre arquitecturas hibridas: sirve como banco de pruebas para estudiar el comportamiento de Gated DeltaNet frente a atencion clasica a escala pequena.

## Benchmarks y rendimiento

Resultados publicados en la model card (modo non-thinking):

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69,6 | 40,2 | 55,3 | 29,7 |
| MMLU-Redux | 84,2 | 64,4 | 69,2 | 48,5 |
| C-Eval | 80,2 | 61,0 | 65,2 | 46,4 |

No se han publicado en la informacion disponible resultados de HumanEval, GSM8K ni benchmarks de vision para esta variante concreta.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 1,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica unos 3-4 GB para contextos moderados.
- En cuantizacion de 8 bits, los pesos bajan a alrededor de 0,9 GB; en 4 bits, a unos 0,5 GB (estimaciones a partir del recuento de parametros, no publicadas por el autor).
- Cabe holgadamente en GPU consumer: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090, e incluso en GPUs de 4-6 GB con cuantizacion.
- GPU de datacenter (A100, H100) no son necesarias para inferencia; resultan utiles solo para entrenamiento o ajuste fino a mayor throughput.
- Opciones de despliegue declaradas: Hugging Face Transformers, vLLM, SGLang y KTransformers. El repo no confirma soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la atencion lineal y el MTP deberian reducir coste frente a un transformer denso equivalente, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B | 0,8B | 262.144 | 29,7 | Apache 2.0 | Hugging Face |
| Qwen3.5-2B | ~2B | no disponible en la informacion | 55,3 | Apache 2.0 | Hugging Face |
| Qwen3-1.7B | 1,7B | no disponible en la informacion | 40,2 | Apache 2.0 | Hugging Face |
| Qwen3-4B-2507 | 4B | no disponible en la informacion | 69,6 | Apache 2.0 | Hugging Face |

La comparativa muestra que el salto de calidad es marcado entre 0,8B y 2B (29,7 frente a 55,3 en MMLU-Pro); el modelo de 0,8B se posiciona por debajo incluso de Qwen3-1.7B en ese benchmark, lo que refleja el coste de la escala reducida. Su ventaja diferencial es el contexto de 262.144 tokens y la naturaleza multimodal.

## Limitaciones y advertencias

- Rendimiento de razonamiento limitado: 29,7 en MMLU-Pro y 46,4 en C-Eval lo situan por debajo de alternativas de mayor tamano; no es adecuado para tareas que exijan precision factual alta sin verificacion.
- Riesgo de alucinacion elevado en modelos de esta escala, especialmente en dominios especializados y en contextos muy largos.
- El repositorio es una publicacion derivada de un tercero (johnz12), no el repositorio oficial de Qwen; conviene validar la integridad de los pesos antes de usarlos en produccion.
- No se documentan en la informacion disponible los tipos de cuantizacion ni el soporte de tool calling para esta variante.
- La cobertura de 201 idiomas se declara a nivel de familia; el rendimiento real por idioma no esta cuantificado en la informacion disponible.
- El contexto nativo de 262.144 tokens implica un coste de cache KV considerable en contextos largos, aunque el modelo es pequeno.
- Licencia Apache 2.0: permite uso comercial, pero exige conservar avisos de licencia y atribucion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/johnz12/Qwen3.5-0.8B
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Licencia oficial: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Blog de la familia Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
