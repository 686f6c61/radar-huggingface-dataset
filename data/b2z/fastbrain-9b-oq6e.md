# b2z/FastBrain-9B-oQ6e

## Resumen

FastBrain-9B es un modelo de decisión estructurada no autorregresivo desarrollado por el usuario b2z (a partir del trabajo original del proyecto FastBrain, atribuido a camera-2018 en GitHub). Se construye sobre un backbone híbrido derivado de Qwen3.5-9B que combina 24 bloques de atención lineal Gated DeltaNet con 8 bloques de atención completa, y añade una cabeza de esquema conjunta (JointSchemaHead) de 116 millones de parámetros. El modelo está diseñado para responder en un único pase de prefill a peticiones de tipo "System-1": recibe un estado JSON y un conjunto de opciones, y puntúa todas las opciones de todas las preguntas simultáneamente, sin generar texto token a token.

La variante aquí descrita, FastBrain-9B-oQ6e, es una cuantización mixta realizada con oQ (oMLX v0.7.4.dev1) en formato MLX, pensada para ejecución en hardware Apple Silicon. El checkpoint emplea una mezcla de precisión con un promedio efectivo de 7,264 bits por peso: un 84,574 % de los pesos lógicos en 6 bits afín con grupo 64, un 9,354 % en 8 bits afín y un 6,073 % en BF16 sin cuantizar. El resultado ocupa 8,060 GiB en disco (8,655 GB) para 9.532 millones de pesos lógicos.

Su relevancia radica en la aproximación no autorregresiva: en lugar de generar una respuesta secuencial, el modelo evalúa opciones de forma paralela en un solo pase, lo que reduce la latencia en tareas de clasificación de intención, enrutamiento y puntuación de alternativas. La variante incluye además componentes de visión (0,456 mil millones de pesos) y una cabeza de esquema conjunta (0,122 mil millones), lo que sugiere capacidades multimodales de entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (24 bloques Gated DeltaNet de atención lineal + 8 bloques de atención completa) con JointSchemaHead de 116M parámetros; no autorregresivo |
| Parametros totales | 9.409.813.744 (safetensors); 9.532M pesos lógicos según model card |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | 32K (según ficha de despliegue de Featherless) |
| Tipos de cuantizacion | Cuantización mixta oQ: 6 bits afín grupo 64 (84,574 %), 8 bits afín grupo 64 (9,354 %), BF16 (6,073 %); promedio efectivo 7,264 bits/peso |
| Idiomas soportados | No disponible (la model card de la variante GGUF relacionada menciona inglés) |
| Licencia | No disponible en esta variante; la variante GGUF de mradermacher indica Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx) |

## Arquitectura y entrenamiento

El modelo se apoya en un backbone híbrido Qwen3.5-9B que alterna 24 bloques de atención lineal Gated DeltaNet con 8 bloques de atención completa, una configuración que busca reducir el coste computacional del contexto largo manteniendo capacidad de atención global en capas seleccionadas. Sobre este backbone se acopla una JointSchemaHead de 116M parámetros que transforma el estado oculto en puntuaciones sobre un esquema conjunto de opciones, lo que permite el enfoque no autorregresivo: el modelo procesa el estado de entrada y el conjunto de alternativas en un único pase de prefill y emite puntuaciones para todas ellas.

La variante oQ6e no introduce cambios arquitectónicos; es una cuantización mixta de precisión realizada con oMLX v0.7.4.dev1. La distribución de bits es selectiva: los pesos del modelo de lenguaje (8,954B lógicos, 6,984 GiB) y la visión (0,456B, 0,849 GiB) se cuantizan mayoritariamente a 6 bits, mientras que la cabeza de esquema conjunta (0,122B, 0,227 GiB) se mantiene en BF16, presumiblemente para preservar la precisión de las puntuaciones de decisión. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Decisión estructurada no autorregresiva: puntúa todas las opciones de todas las preguntas en un solo pase de prefill, sin generación secuencial.
- Puntuación de alternativas tipo "noul" o "score": evalúa cada opción de un esquema JSON de entrada.
- Clasificación de intención (intent classification) y enrutamiento de peticiones.
- Tool calling y function calling: la variante GGUF relacionada incluye las etiquetas `tool-calling` y `function-calling`.
- Salida estructurada tipada (typed output): la etiqueta `image-text-to-typed-output` sugiere transformación de entrada imagen-texto a salida estructurada.
- Procesamiento multimodal de entrada: incluye un componente de visión de 0,456B parámetros.
- Razonamiento de tipo System-1: respuestas rápidas en un único pase, orientado a decisiones más que a deliberación extendida.
- Capacidades multilingües: no disponible en detalle; la variante GGUF indica inglés.

## Casos de uso

- Enrutamiento de intenciones en asistentes conversacionales: el modelo recibe el estado de la conversación y un conjunto de intenciones candidatas, y puntúa todas en un solo pase, lo que permite seleccionar la ruta adecuada con latencia mínima comparado con un modelo generativo.
- Clasificación de tickets de soporte: dado un texto de incidencia y un esquema de categorías, el modelo asigna puntuaciones a cada categoría en una única pasada de prefill, adecuado para volúmenes altos de tickets.
- Selección de herramientas en agentes: con tool calling y salida estructurada, puede puntuar qué función de un catálogo es la más apropiada para una petición dada, integrándose en pipelines de agentes multi-paso.
- Puntuación de respuestas candidatas en sistemas de ranking: dado un contexto y varias respuestas generadas por otro modelo, FastBrain-9B puede puntuar cada una en paralelo para seleccionar la mejor, útil en pipelines de RLHF o evaluación automática.
- Extracción de decisiones desde entrada multimodal: gracias al componente de visión (0,456B), puede procesar imagen y texto y emitir una salida estructurada tipada, por ejemplo para clasificar documentos escaneados según un esquema predefinido.
- Despliegue en Apple Silicon para prototipado: al estar cuantizado en formato MLX con 8,060 GiB, cabe en equipos con memoria unificada de 16 GB o superior, lo que facilita pruebas locales de modelos de decisión sin GPU dedicada.
- Moderación y filtrado de contenido estructurado: puntuación de múltiples etiquetas de política sobre un mismo contenido en un solo pase, aprovechando el contexto de 32K para incluir guías extensas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,1 GiB de pesos en disco; en memoria se requiere espacio adicional para el estado de activaciones y el contexto. Con 32K de contexto, se recomienda al menos 12-16 GB de memoria unificada o VRAM.
- GPU recomendadas: al ser un checkpoint MLX, está orientado a Apple Silicon (M1/M2/M3/M4 con memoria unificada). Para GPUs NVIDIA no se distribuye una variante específica en esta ficha; existe una variante GGUF (mradermacher/FastBrain-9B-GGUF) para llama.cpp.
- Cabe en consumer GPU: en Apple Silicon con 16 GB o más de memoria unificada; en GPUs NVIDIA consumer (RTX 4090 con 24 GB) cabría mediante la variante GGUF, no con este checkpoint MLX.
- Opciones de despliegue: MLX (librería nativa para Apple Silicon), llama.cpp y SGLang para la variante GGUF, y API compatible con OpenAI vía Featherless (32K de contexto).
- Latencia y throughput estimados: no disponible. El diseño no autorregresivo de un solo pase de prefill sugiere latencia inferior a la generación token a token, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| FastBrain-9B-oQ6e | 9,4B (9,53B lógicos) | 32K | Híbrido Gated DeltaNet + atención completa, no autorregresivo | No disponible (variante GGUF: Apache-2.0) | MLX safetensors |
| Qwen3.5-9B (backbone base) | ~9B | No disponible | Transformer híbrido | No disponible | Safetensors |
| FastBrain-9B (original) | ~9B | No disponible | Híbrido con JointSchemaHead | Apache-2.0 (según variante GGUF) | Safetensors, GGUF |

La comparación con modelos generativos convencionales de 9B no es directa, ya que FastBrain-9B no genera texto libre sino que puntúa opciones de un esquema. Frente a su backbone Qwen3.5-9B, la diferencia principal es la cabeza de esquema conjunta y el modo de inferencia no autorregresivo. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Modelo especializado en decisión estructurada: no está pensado para generación de texto libre ni para razonamiento multi-paso extenso; su uso fuera del esquema de puntuación de opciones puede dar resultados pobres.
- Licencia no disponible en esta variante concreta: antes de uso comercial debe verificarse la licencia del checkpoint original y del backbone Qwen3.5-9B, ya que la variante GGUF indica Apache-2.0 pero esta variante MLX no la declara.
- Idiomas no especificados: la variante GGUF relacionada indica inglés; el soporte multilingüe no está confirmado.
- Riesgo de alucinación en las puntuaciones: al ser un modelo de scoring, puede asignar puntuaciones altas a opciones incorrectas si el esquema de entrada es ambiguo o si el estado JSON no está bien formado.
- Dependencia de formato: requiere entrada en JSON estructurado con un esquema de opciones; entradas mal formadas o fuera de distribución pueden degradar la calidad de las puntuaciones.
- Cuantización mixta: aunque la cabeza de esquema se mantiene en BF16, el cuerpo del modelo en 6 bits puede introducir una ligera pérdida de precisión frente al checkpoint original en BF16.
- Ecosistema limitado: formato MLX restringe el despliegue a Apple Silicon; para otros entornos hay que recurrir a la variante GGUF.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas, lo que dificulta la evaluación previa a producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy reducido.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/b2z/FastBrain-9B-oQ6e
- Hugging Face (modelo original): https://huggingface.co/TypeScript/FastBrain-9B
- Hugging Face (variante GGUF): https://huggingface.co/mradermacher/FastBrain-9B-GGUF
- GitHub del proyecto FastBrain: https://github.com/camera-2018/FastBrain
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
- Ficha en Jevlist: https://jevlist.ai/projects/fastbrain-9b
- Despliegue en Featherless: https://featherless.ai/models/TypeScript/FastBrain-9B
