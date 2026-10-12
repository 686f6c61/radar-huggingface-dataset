# Jundot/clef-flash-oQ3e

## Resumen

clef-flash-oQ3e es un checkpoint cuantizado en formato MLX del modelo Cloudflare/clef-flash, un modelo de decisión de unos 9B de parámetros post-entrenado a partir de Qwen/Qwen3.5-9B. Lo publica el usuario Jundot mediante su herramienta oQ (oMLX v0.7.1) con cuantización mixta de precisión, y conserva intactos los tres componentes del modelo original: el backbone de lenguaje, el codificador de visión y la cabeza de esquema conjunta (joint schema head).

A diferencia de un modelo generativo convencional, clef-flash está orientado a la toma de decisiones estructurada: recibe un estado (state) y un esquema (schema) de preguntas tipadas y devuelve, en una única pasada forward, una probabilidad para cada opción permitida de cada pregunta. Es, por tanto, un modelo multimodal (texto e imagen) de tipo image-text-to-text especializado en producir distribuciones de probabilidad sobre conjuntos cerrados de respuestas, no texto libre.

Este checkpoint es relevante para quien necesite ejecutar ese tipo de modelo de decisión en hardware Apple Silicon con un peso de almacenamiento reducido: el repo ocupa 5,2 GB gracias a una media efectiva de 4,359 bits por peso, frente a los pesos bf16 del modelo original. La licencia Apache-2.0 heredada del origen facilita su reutilización, si bien no hay resultados de benchmarks publicados ni idiomas declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen/Qwen3.5-9B: backbone de lenguaje + codificador de visión (vision encoder) + cabeza de esquema conjunta (joint schema head). No se especifica si es denso o MoE |
| Parametros totales | 9.409.813.744 (según safetensors); la model card declara 9.532B de pesos lógicos totales |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta oQ3e: affine 3-bit grupo 64 (88,953% de los pesos), affine 5-bit grupo 64 (4,974%) y BF16 sin cuantizar (6,073%). Media efectiva de 4,359 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX; incluye joint_head.safetensors y joint_head_config.json |

## Arquitectura y entrenamiento

El modelo base, Cloudflare/clef-flash, es un modelo de decisión de 9B post-entrenado desde Qwen/Qwen3.5-9B. Su salida no es texto generado token a token, sino un vector de probabilidades sobre las opciones permitidas de cada pregunta de un esquema tipado, calculado en una sola pasada forward. La arquitectura combina un backbone de lenguaje de 8,954B de pesos lógicos, un codificador de visión de 0,456B y una cabeza de esquema conjunta de 0,122B que se copia sin modificar desde el modelo origen.

Sobre este checkpoint, no se ha realizado entrenamiento nuevo: la model card describe únicamente el proceso de cuantización. oQ3e asigna bits según la sensibilidad medida de cada capa y redondea cada grupo con una matriz de importancia (128 muestras x 512 tokens) y un reajuste de escala y sesgo por mínimos cuadrados ponderados. El resultado es una mezcla de precisión (3-bit, 5-bit y BF16) que reduce los pesos lógicos a 4,836 GiB. No se indica el número de tokens de entrenamiento, la composición del dataset ni si el modelo base usó RLHF o DPO.

## Capacidades

- Toma de decisiones estructurada: dada una entrada de estado y un esquema de preguntas tipadas, devuelve la probabilidad de cada opción permitida en una sola pasada forward.
- Preguntas tipadas: la ficha del modelo hermano oQ4e menciona los tipos choice y score, además de un tercer tipo, para consultas sobre texto e imágenes.
- Entrada multimodal: acepta texto e imágenes (pipeline image-text-to-text) gracias al codificador de visión incluido.
- Modo conversacional: el modelo lleva la etiqueta conversational.
- Eficiencia de inferencia: al resolver todas las preguntas del esquema en un único forward pass, no requiere decodificación autoregresiva larga para producir la respuesta.
- Servicio mediante oMLX: el checkpoint se sirve a través del endpoint POST /v1/systemone.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Clasificación y enrutado de peticiones: dado un texto o una imagen de entrada y un esquema de opciones cerradas, el modelo devuelve la probabilidad de cada categoría en una sola pasada, lo que permite integrarlo como clasificador en un enrutador de peticiones con umbrales de confianza.
- Puntuación (scoring) de contenido: usando preguntas de tipo score, se puede evaluar la calidad, adecuación o riesgo de una respuesta en una escala definida por el esquema, por ejemplo para filtrado o ranking.
- Evaluación automática como juez: el modelo puede actuar como evaluador que asigna probabilidades a opciones de un rubric tipado, útil en pipelines de evaluación de respuestas de otros modelos.
- Verificación multimodal: con el codificador de visión, se pueden plantear preguntas tipadas sobre imágenes (por ejemplo, presencia de objetos o cumplimiento de criterios visuales) y obtener distribuciones de probabilidad.
- Moderación de contenido: definiendo un esquema con opciones de categoría y severidad, el modelo produce probabilidades por opción que un sistema posterior puede usar para decidir si bloquea o escala una revisión.
- Módulo de decisión dentro de un agente: al ser un resolutor de esquemas determinista en su formato de salida, encaja como componente que decide entre acciones predefinidas sin generar texto libre, reduciendo la necesidad de parsear lenguaje natural.
- Despliegue local en Apple Silicon: gracias a su formato MLX y a sus 5,2 GB de repo, permite ejecutar un modelo de decisión de 9B en portátiles y equipos de escritorio con memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 4,836 GiB (5,193 GB según el desglose de almacenamiento; el repo completo son 5,2 GB). Conviene prever entre 6 y 8 GB de memoria unificada o VRAM para pesos, caché de activaciones y el codificador de visión.
- GPU compatibles: al estar en formato MLX, el destino natural son los chips Apple Silicon (series M1, M2, M3 y M4). No se indica soporte nativo para GPU NVIDIA (A100, H100, RTX 4090) en la información disponible, dado que MLX está orientado a Apple Silicon.
- GPU de consumo: el modelo cabe en equipos con memoria unificada de 8 GB o superior (por ejemplo, Mac con 8-16 GB), aunque el margen es ajustado con 8 GB.
- Opciones de despliegue: oMLX sirve el checkpoint mediante POST /v1/systemone; la librería declarada es mlx. No se indican otras opciones (vLLM, llama.cpp, Ollama, TGI) en la información proporcionada.
- Latencia y throughput: no disponible. La model card menciona mejoras de batched prefill para peticiones concurrentes en oMLX, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Almacenamiento | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jundot/clef-flash-oQ3e | 9,4B (safetensors) | 4,836 GiB (5,2 GB repo) | oQ3e mixta, 4,359 bits/peso | apache-2.0 | HuggingFace (MLX) |
| Jundot/clef-flash-oQ4e | ~9,5B | no disponible | oQ mixta (4-bit) | apache-2.0 (heredada) | HuggingFace (MLX) |
| Cloudflare/clef-flash | 9B | no disponible (en bf16 sería del orden de 17-18 GiB, estimado) | bf16 sin cuantizar | apache-2.0 | HuggingFace |
| Clef (27B, texto e imagen) | 27B | no disponible | no disponible | no disponible | HuggingFace |

La comparación principal es contra el modelo base sin cuantizar y contra el checkpoint hermano oQ4e, de mayor precisión. La familia incluye también una variante Clef de 27B (texto e imagen) y OpenJev 27B (texto y una imagen), según las notas de publicación de oMLX.

## Limitaciones y advertencias

- Modelo especializado, no generativo: produce probabilidades sobre opciones de un esquema, por lo que no sirve como generador de texto libre ni como asistente conversacional general.
- Pérdida por cuantización: al operar a 3/5 bits en la mayor parte de los pesos, puede degradar la calibración de las probabilidades en comparación con el modelo base en bf16. No hay métricas publicadas que cuantifiquen esa pérdida.
- Idiomas no declarados: no se especifica qué lenguas soporta, lo que impide asumir cobertura multilingüe.
- Contexto no especificado: se desconoce la longitud máxima de contexto, un dato crítico para entradas largas o esquemas grandes.
- Sin benchmarks ni validación de la comunidad: el repo registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente.
- Compatibilidad limitada: el formato MLX restringe el uso a Apple Silicon y a las herramientas compatibles (oMLX, mlx). No se documenta un GGUF ni una ruta para GPU NVIDIA.
- Dependencia de oMLX: el servicio se expone a través del endpoint propietario POST /v1/systemone de oMLX, lo que ata el despliegue a esa herramienta.
- Fechas del repositorio: la información indica fecha de creación y actualización del 11 de octubre de 2026; conviene verificar la vigencia de los artefactos si esa marca temporal no coincide con la fecha real de publicación.
- Licencia: Apache-2.0, apta para uso comercial, pero el usuario debe respetar además las condiciones del modelo base Cloudflare/clef-flash y de Qwen/Qwen3.5-9B del que deriva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jundot/clef-flash-oQ3e
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Variante hermana de 4 bits: https://huggingface.co/Jundot/clef-flash-oQ4e
- Repositorio oQ (oMLX): https://github.com/jundot/omlx
- Pull request de la cuantización Improved oQe: https://github.com/jundot/omlx/pull/4385
- Notas de publicación de oMLX (menciones a Clef, Clef-Flash y OpenJev): https://github.com/jundot/omlx/releases
- Modelo Qwen base referenciado: Qwen/Qwen3.5-9B (referencia en la model card; enlace directo no proporcionado)
