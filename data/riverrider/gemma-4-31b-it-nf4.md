# RiverRider/gemma-4-31B-it-nf4

## Resumen

El modelo `RiverRider/gemma-4-31B-it-nf4` es una cuantización en 4 bits (NF4) del modelo multimodal `google/gemma-4-31B-it` de Google DeepMind, realizada por el usuario RiverRider. El objetivo principal es permitir la carga del modelo en entornos con memoria limitada (por ejemplo, un Space de Hugging Face) sin necesidad de descargar los 62 GB del modelo original ni cuantizar en tiempo de arranque. El repositorio ocupa 18,3 GB y contiene los pesos en formato `safetensors` con cuantización `bitsandbytes` NF4 y doble cuantización, manteniendo el cómputo en `bfloat16`.

El modelo base `gemma-4-31B-it` es un transformer denso de 31 273 millones de parámetros, con una ventana de contexto de hasta 256 000 tokens y soporte para más de 140 idiomas. Es multimodal: acepta entradas de texto e imagen (y video como secuencia de frames) y genera texto. Está diseñado para tareas de razonamiento, generación de código, agentes y comprensión visual. La cuantización NF4 no altera la arquitectura ni las capacidades funcionales del modelo, aunque introduce una ligera degradación en la precisión de las representaciones internas, como documenta el autor en su model card.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de 31B en GPUs de consumo (24 GB de VRAM) manteniendo un buen equilibrio entre calidad y requisitos de hardware. Además, el autor ha realizado una validación específica de la cuantización mediante métricas de recuperación (retrieval) sobre imágenes COCO, lo que aporta datos útiles para quien necesite usar el modelo en tareas de búsqueda o indexación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4), multimodal (texto + imagen) |
| Parametros totales | 31 273 088 876 (31,3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 000 tokens (según el modelo base) |
| Tipos de cuantizacion | NF4 (4 bits) con doble cuantizacion, cómputo en bfloat16 |
| Idiomas soportados | Más de 140 idiomas (según el modelo base) |
| Licencia | Gemma Terms of Use (licencia propietaria de Google con restricciones de uso comercial) |
| Formato de pesos | Safetensors (cuantización bitsandbytes) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-31B-it` es un transformer denso de 31 273 millones de parámetros, diseñado por Google DeepMind como parte de la familia Gemma 4. A diferencia de otras variantes de Gemma 4 que usan arquitectura Mixture-of-Experts (por ejemplo, la versión 26B A4B), este modelo es completamente denso, lo que simplifica su despliegue y evita la sobrecarga de enrutamiento. La ventana de contexto alcanza los 256 000 tokens, lo que permite manejar documentos largos, conversaciones extensas o secuencias de video como frames. El modelo acepta entradas de imagen y texto, y genera texto, con capacidades de razonamiento y código de nivel frontera, según la documentación de NVIDIA NIM.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni las técnicas de alineación (RLHF, DPO, etc.) del modelo base. La cuantización NF4 aplicada por RiverRider no modifica el entrenamiento: se trata de una conversión posterior de los pesos a 4 bits con `bitsandbytes`, activando la doble cuantización para reducir el error de cuantización y manteniendo el cómputo en `bfloat16`. El autor justifica esta elección mediante un análisis de la estabilidad de las representaciones internas (capa 47) ante la cuantización, midiendo la similitud coseno y la recuperación en un índice de imágenes COCO. Los resultados muestran que la recuperación a nivel de imagen (r@1) se mantiene perfecta (1.000) incluso con NF4, aunque la concordancia de vecinos top-10 desciende a 0.704, lo que indica que los índices cuantizados no son intercambiables con los de precisión completa para búsquedas de mayor profundidad.

## Capacidades

- Generación de texto: producción de respuestas coherentes y contextualizadas en más de 140 idiomas.
- Razonamiento: resolución de problemas lógicos, matemáticos y de sentido común, con capacidad de razonamiento multi-paso.
- Generación de código: escritura y depuración de código en diversos lenguajes de programación, así como explicación de fragmentos.
- Comprensión multimodal: acepta imágenes como entrada y puede describirlas, responder preguntas sobre su contenido o extraer información visual.
- Procesamiento de video: puede tratar secuencias de frames de video como entrada para tareas de análisis o resumen.
- Soporte para agentes: según NVIDIA NIM, el modelo está diseñado para flujos de trabajo agénticos, lo que implica capacidad de planificación y ejecución de tareas complejas.
- Multilingüismo: cobertura de más de 140 idiomas, lo que permite su uso en aplicaciones internacionales.
- Conversación: optimizado para diálogo multi-turno, con manejo de contexto largo gracias a su ventana de 256K tokens.

No se especifica en la información disponible si el modelo soporta tool calling o function calling de forma nativa; la descripción de NVIDIA NIM menciona "agentic workflows", pero no detalla la interfaz de herramientas.

## Casos de uso

- Atención al cliente automatizada: gracias a su ventana de contexto de 256K tokens, el modelo puede mantener conversaciones largas y recordar detalles de interacciones previas, gestionando consultas complejas de usuarios en múltiples idiomas.
- Generación de código en producción: el modelo puede integrarse en pipelines de CI/CD para autocompletar, revisar o documentar código. Su capacidad de razonamiento permite detectar errores lógicos y sugerir correcciones.
- Análisis de imágenes en entornos empresariales: al aceptar entradas visuales, puede clasificar imágenes de productos, extraer texto de capturas (OCR) o generar descripciones para accesibilidad.
- Resumen de documentos extensos: con 256K tokens de contexto, puede procesar manuales, informes o contratos completos y generar resúmenes ejecutivos o extraer cláusulas relevantes.
- Asistente de investigación multilingüe: dado su soporte de más de 140 idiomas, puede traducir, resumir y comparar literatura científica o técnica en diferentes lenguas.
- Prototipado de agentes autónomos: el modelo puede servir como cerebro de un agente que planifica tareas, razona sobre el entorno (con entrada de imágenes) y ejecuta acciones mediante llamadas a APIs externas, aunque se requiere verificar la compatibilidad con frameworks de agentes.
- Despliegue en hardware de consumo: al ocupar solo 18,3 GB en NF4, puede ejecutarse en una GPU de 24 GB (por ejemplo, RTX 4090) para aplicaciones de investigación o desarrollo local sin necesidad de infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta cuantización específica. El autor de la cuantización proporciona métricas de validación de la calidad de representación interna, basadas en 100 imágenes de COCO val2017:

| Metrica | bf16 | NF4 |
|---|---|---|
| Distancia a la media de entrenamiento del lector | 13.43 | 14.51 |
| Auto-recuperacion en indice bf16 de 2000 imagenes, r@1 | 1.000 | 1.000 |
| Concordancia de vecinos top-10 con bf16 | 1.000 | 0.704 |

Estos datos indican que la cuantización NF4 preserva la capacidad de recuperación a nivel de imagen (r@1 perfecto), pero altera el orden de los vecinos más cercanos en búsquedas profundas. Además, el autor señala que la verbalización (generación de descripciones) es estable en contenido pero no en tokens exactos: de 8 pares muestreados, todos nombran el mismo sujeto, pero solo 2 producen cadenas idénticas. No se dispone de mediciones de latencia o throughput para esta cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 18,3 GB en formato NF4. Para inferencia con `bitsandbytes`, se recomienda al menos 20-24 GB de VRAM para dejar margen para activaciones y caché de contexto. En una GPU de 24 GB (RTX 3090, RTX 4090, A10G) el modelo cabe con comodidad.
- GPUs recomendadas: RTX 3090/4090 (24 GB), A10G (24 GB), A100 (40/80 GB) o H100 (80 GB) para mayor margen y velocidad. También puede ejecutarse en GPUs de 16 GB con cuantización adicional o limitando el contexto, aunque no se ha probado.
- Opciones de despliegue: al ser pesos `safetensors` cuantizados con `bitsandbytes`, se puede cargar con la librería `transformers` usando `load_in_4bit=True`. Para servir en producción, se recomienda usar `vLLM` (si soporta esta cuantización), `Text Generation Inference` (TGI) o `Ollama` (si se convierte a GGUF). No se incluye formato GGUF en este repositorio.
- Latencia y throughput: no disponibles. Dependerán de la GPU, el tamaño del lote y la longitud del contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| google/gemma-4-31B-it (base) | 31,3B | 256K | Denso, multimodal | Gemma | Safetensors (bf16) |
| RiverRider/gemma-4-31B-it-nf4 (este) | 31,3B | 256K | Denso, multimodal | Gemma | Safetensors (NF4) |
| google/gemma-4-26B-A4B (MoE) | 26B total, 4B activos | 256K | MoE, multimodal | Gemma | Safetensors |
| Llama 3.1 8B (referencia) | 8B | 128K | Denso, texto | Llama 3.1 | Safetensors, GGUF |

La comparación directa con el modelo base muestra que esta cuantización reduce el tamaño de 62 GB a 18,3 GB (aproximadamente un 70% menos) a costa de una ligera pérdida de fidelidad en representaciones internas. Frente a la variante MoE de 26B, este modelo denso ofrece mayor capacidad total pero requiere más memoria por token. No se dispone de resultados de benchmarks que permitan comparar el rendimiento real en tareas de razonamiento o código.

## Limitaciones y advertencias

- La cuantización NF4 introduce una degradación en la precisión de las representaciones internas, especialmente en búsquedas de vecinos profundos (concordancia top-10 de 0.704 frente a bf16). Para tareas de recuperación o indexación, se recomienda usar el modelo en bf16 si la memoria lo permite.
- La generación de texto puede no ser token-estable: el mismo prompt puede producir descripciones con el mismo contenido pero con redacción diferente según la precisión utilizada. Cualquier ejemplo citado debe indicar qué precisión lo generó.
- La licencia Gemma de Google impone restricciones de uso comercial para organizaciones con ingresos superiores a 700 millones de dólares anuales. Es necesario revisar los términos completos antes de usar el modelo en producción.
- No se dispone de información sobre sesgos específicos de este modelo cuantizado. El modelo base puede heredar sesgos de sus datos de entrenamiento, y la cuantización no los corrige.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- El repositorio no incluye un archivo de configuración de tokenizer ni de preprocesador; se debe cargar el modelo base `google/gemma-4-31B-it` para obtener los componentes auxiliares necesarios.
- No se han publicado pruebas de rendimiento en tareas estándar (MMLU, HumanEval, etc.) para esta cuantización; los únicos datos disponibles son las métricas de validación del autor sobre COCO.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/RiverRider/gemma-4-31B-it-nf4
- Modelo base en HuggingFace: https://huggingface.co/google/gemma-4-31B
- Model card de NVIDIA NIM para gemma-4-31b-it: https://build.nvidia.com/google/gemma-4-31b-it/modelcard
- Página oficial de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Artefactos de interpretabilidad del autor (SRT): https://huggingface.co/RiverRider/srt-nla-gemma4-artifacts
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
