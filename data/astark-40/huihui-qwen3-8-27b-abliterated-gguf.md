# Astark-40/Huihui-Qwen3.8-27B-abliterated-GGUF

## Resumen

El modelo Huihui-Qwen3.8-27B-abliterated-GGUF es una versión modificada del modelo multimodal Qwen/Qwen3.8-27B de Alibaba, desarrollada por huihui-ai mediante la técnica de abliteración, que elimina los mecanismos de rechazo y censura del modelo original. El resultado es un modelo "sin censura" que responde a peticiones que el modelo base rechazaría por políticas de seguridad, presentado como una prueba de concepto para demostrar la viabilidad de la técnica sin depender de TransformerLens.

El modelo conserva la arquitectura multimodal del original (image-text-to-text) y está disponible exclusivamente en formato GGUF, con múltiples niveles de cuantización que van desde Q2_K hasta Q8_0, incluyendo variantes especiales denominadas "L" que mantienen los tensores críticos en mayor precisión para mejorar la calidad de respuesta. Con 27.320.697.856 parámetros, es un modelo de tamaño medio-grande que puede ejecutarse en hardware de consumo con las cuantizaciones más bajas.

La relevancia de este modelo reside en su enfoque experimental: no es una versión pulida para producción, sino una demostración de que la abliteración puede aplicarse con herramientas estándar de transformers. El autor advierte explícitamente sobre los riesgos de su uso, recomendando emplearlo únicamente en entornos de investigación controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal de la serie Qwen3.8, con componentes visuales y de lenguaje; se mencionan tensores SSM y atención) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (según comando de ejemplo en llama.cpp) |
| Tipos de cuantizacion | Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0 (variantes L para tensores de alta precision) |
| Idiomas soportados | no disponible (heredados del modelo base Qwen3.8-27B) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte del Qwen3.8-27B de Alibaba, un modelo multimodal que procesa tanto imagenes como texto (pipeline image-text-to-text). La arquitectura interna no se detalla en la informacion disponible, pero el README menciona tensores como `ssm_out`, lo que sugiere la presencia de componentes de espacio de estados (SSM) junto a mecanismos de atencion clasicos (`attn_output`), apuntando a una arquitectura hibrida.

La tecnica aplicada es la **abliteracion**, implementada con la libreria `remove-refusals-with-transformers` (de Sumandora). Este metodo identifica y elimina las direcciones en el espacio de activaciones que correlacionan con el comportamiento de rechazo del modelo, sin necesidad de reentrenar. En este caso, las primeras 15 capas se conservan sin ablacion, y los componentes de vision y MTP (Multi-Token Prediction) tampoco se modifican. Los pesos ablacionados se re-cuantizan a Q8_0 o BF16 en las versiones L para mitigar la perdida de calidad.

El entrenamiento original del Qwen3.8-27B incluye datos multimodales y alineacion con preferencias humanas, pero no se proporcionan detalles sobre el dataset o el numero de tokens de entrenamiento. La version abliterated no anade entrenamiento adicional; solo modifica los pesos existentes.

## Capacidades

- Generacion de texto y razonamiento en lenguaje natural, manteniendo las capacidades del modelo base Qwen3.8-27B.
- Procesamiento multimodal: acepta entrada de imagenes y texto (pipeline image-text-to-text), lo que permite descripcion de imagenes, respuesta a preguntas visuales y razonamiento multimodal.
- Generacion de codigo y soporte de funciones de programacion, heredadas del modelo base.
- Capacidad de tool calling y function calling, si el modelo base las soporta (tipico de la serie Qwen3).
- Razonamiento multi-step y soporte para agentes, sujeto a las capacidades del modelo base.
- Capacidad multilingue, heredada del modelo base (idiomas concretos no disponibles).
- Respuesta sin filtros de seguridad: no rechaza peticiones que el modelo original censuraria, incluyendo contenido sensible o controvertido.
- Soporte de contexto largo de hasta 262.144 tokens, lo que permite mantener conversaciones extensas y analizar documentos largos.

## Casos de uso

- **Investigacion en alineacion de modelos**: el modelo permite estudiar el comportamiento de un LLM sin restricciones de seguridad, para analizar como la abliteracion afecta a la utilidad, la coherencia y la toxicidad de las respuestas.
- **Creacion de contenido creativo sin restricciones**: escritores y creadores pueden explorar temas tabu o estilos provocativos en narrativa, poesia o guiones, sin que el modelo rechace la peticion.
- **Evaluacion de robustez en sistemas de moderacion**: puede servir como generador de contenido adversario para probar y mejorar filtros de contenido en aplicaciones de produccion.
- **Pruebas de red teaming**: se puede utilizar para generar prompts de ataque o contenido sensible de forma controlada, con el fin de entrenar sistemas de deteccion de contenido inapropiado.
- **Estudio de la tecnica de abliteracion**: el modelo sirve como ejemplo de referencia para investigar como la eliminacion de direcciones de rechazo afecta a la representacion interna y al comportamiento del LLM.
- **Prototipos de asistentes de escritura creativa**: para autores que necesitan explorar dialogos o narrativas con personajes moralmente ambiguos o situaciones limite, sin interrupciones por parte del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras pruebas estandar para esta version abliterated. El rendimiento cualitativo se describe como "mejorado" en las variantes L gracias a la re-cuantizacion de tensores clave, pero no hay metricas cuantitativas que lo respalden.

## Requisitos de hardware

- **VRAM estimada para inferencia**: para una cuantizacion Q4_K (la mas comun en uso local), un modelo de 27B requiere aproximadamente 16-18 GB de VRAM. La variante Q8_0 necesita alrededor de 28-30 GB.
- **GPU recomendadas**: una RTX 4090 (24 GB) puede ejecutar Q4_K con margen; para Q8_0 se recomienda una A100 (40/80 GB) o H100. GPU de consumo como RTX 3090/4080 (24 GB) pueden usar Q4_K con secuencias cortas.
- **En consumer GPU**: si, las variantes Q2_K y Q3_K caben en GPU de 12-16 GB (RTX 3060/4070), aunque con perdida de calidad notable.
- **Opciones de despliegue**: llama.cpp, Ollama (con la version mas reciente), y cualquier backend compatible con GGUF (llama-cpp-python, KoboldCpp, etc.).
- **Latencia y throughput**: no disponibles. Dependen de la GPU, la cuantizacion y la longitud de secuencia. En una RTX 4090 con Q4_K se puede esperar entre 15-30 tokens por segundo para secuencias de hasta 4K tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated | 27,3B | 262K | Apache-2.0 | GGUF | Sin censura, multimodal |
| Qwen/Qwen3.8-27B (original) | 27,3B | 262K | Apache-2.0 | safetensors | Con censura, multimodal |
| Qwen/Qwen3-27B (generico) | 27B | 128K | Apache-2.0 | safetensors | Sin vision, solo texto |

No se dispone de datos de rendimiento comparativo entre estos modelos. La diferencia principal es la eliminacion de rechazos en la version abliterated y el formato GGUF, que facilita su uso en entornos locales con llama.cpp. Otras alternativas abliterated de huihui-ai existen para otros modelos de la serie Qwen, pero no hay datos comparativos concretos.

## Limitaciones y advertencias

- **Contenido sensible**: el modelo puede generar contenido controvertido, inapropiado o ilegal. El autor recomienda no usarlo en entornos publicos o con menores.
- **Riesgo de alucinacion**: al ser un modelo sin alineacion reforzada, la coherencia y la exactitud de las respuestas pueden degradarse, aumentando el riesgo de alucinaciones y respuestas incorrectas.
- **Calidad de respuesta**: la abliteracion puede afectar negativamente a la utilidad y la coherencia en algunos dominios, especialmente en tareas que requieren seguir instrucciones de seguridad.
- **Licencia y responsabilidad**: aunque la licencia es Apache-2.0, el autor declina toda responsabilidad por el uso del modelo. Los usuarios deben asegurar el cumplimiento de las leyes locales y etica.
- **No apto para produccion**: el autor lo describe como una prueba de concepto "cruda", no recomendada para despliegue en entornos de produccion o aplicaciones comerciales publicas.
- **Idiomas y contexto**: no se especifican los idiomas soportados ni el contexto maximo real; el valor de 262K tokens proviene del comando de ejemplo de llama.cpp, pero el rendimiento en secuencias largas no esta garantizado.
- **Limitaciones de vision**: el componente visual no fue modificado, pero no hay datos sobre su calidad tras la abliteracion.

## Enlaces

- HuggingFace (repo del autor): https://huggingface.co/Astark-40/Huihui-Qwen3.8-27B-abliterated-GGUF
- Repo original (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Repo GGUF original (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF
- Repo del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de abliteracion: https://github.com/Sumandora/remove-refusals-with-transformers
- Repo espejo en GitHub: https://github.com/Ahaa43443/huihui-qwen3.8-27b-abliterated-mirror
- Noticia sobre el lanzamiento: https://vgtimes.com/tech-and-hardware/164540-huihui-qwen3.8-27b-abliterated-launches-as-an-uncensored-ai-model-for-free.html
- Perfil en interfaze.ai: https://interfaze.ai/models/huihui-aihuihui-qwen38-27b-abliterated-gguf
