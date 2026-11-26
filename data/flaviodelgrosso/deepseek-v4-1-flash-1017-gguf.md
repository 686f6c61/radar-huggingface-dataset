# flaviodelgrosso/DeepSeek-V4.1-Flash-1017-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017 es un modelo de lenguaje de gran escala desarrollado por DeepSeek, distribuido en este repositorio como una cuantización GGUF empaquetada por el usuario flaviodelgrosso para su ejecución local en Apple Silicon mediante el runtime Razor. El checkpoint original cuenta con 329.965.689.984 parámetros (aproximadamente 330 mil millones) y una arquitectura de mezcla de expertos (MoE), según se deduce del tratamiento diferenciado de los "routed experts" descrito en la model card. El modelo soporta generación de texto, razonamiento, código y entrada de imágenes mediante un sidecar de visión opcional.

La relevancia de esta ficha radica en que el repositorio no distribuye el modelo en un formato GGUF convencional, sino en un empaquetado propietario que solo puede cargarse con Razor, un runtime que, en la fecha de publicación de la model card, no era de código abierto. El modelo completo ocupa 349,3 GB y requiere streaming desde SSD, ya que excede la memoria unificada de 128 GB del hardware objetivo. Se incluye además un modelo draft de 8,6 GB para decodificación especulativa y un codificador de visión de 972 MB en BF16.

La licencia declarada es MIT, heredada del modelo base, aunque la model card advierte explícitamente de que los pesos no son ejecutables con llama.cpp ni con otros runtimes GGUF estándar. Esta restricción práctica es el dato más importante para cualquier evaluador que considere su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) según referencias a "routed experts"; detalles completos no disponibles |
| Parametros totales | 329.965.689.984 (≈330 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF propietario: expertos enrutados a ~2 bits por peso, resto en precisión original del checkpoint; sidecar de visión en BF16 |
| Idiomas soportados | no disponible (la model card menciona "non-English text" sin enumerar idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF propietario (solo cargable con Razor; incompatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con aproximadamente 330 mil millones de parámetros totales. La model card del repositorio cuantizado no detalla el número de expertos, la proporción de parámetros activos por token ni la longitud de contexto nativa. La cuantización aplicada por el autor del repositorio es selectiva: los expertos enrutados se comprimen a unos 2 bits por peso, con mayor precisión asignada a los expertos más relevantes para chat y texto no inglés, mientras que el resto de componentes conserva la precisión del checkpoint original.

El empaquetado incluye tres artefactos: el modelo principal (349,3 GB), un modelo draft DSpark de 8,6 GB para decodificación especulativa y un sidecar de visión de 972 MB que contiene el codificador de imágenes y la proyección imagen-texto copiados sin modificar en BF16. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento multi-turno.
- Generación de código, con un 97,8 % de acuerdo de siguiente token respecto al modelo completo en la categoría de coding.
- Razonamiento, con un 96,0 % de acuerdo respecto al modelo completo.
- Entrada de imágenes mediante el sidecar de visión: admite PNG y JPEG en mensajes de usuario con formatos OpenAI `image_url`, Responses `input_image`, bloques `image` de Anthropic y el comando `/image <path>` en el cliente de chat de Razor.
- Decodificación especulativa mediante el modelo draft DSpark, con aceleración de hasta 71-79 tokens/s en texto predecible.
- Servido de APIs compatibles con OpenAI y Anthropic, lo que permite conectar agentes de código y clientes de chat.
- Capacidades multilingües presentes pero degradadas por la cuantización: 79,8 % de acuerdo con el modelo completo en la categoría multilingual.
- No se documenta soporte explícito de tool calling ni de function calling en la model card del repositorio cuantizado.

## Casos de uso

- Asistencia de código en local: el modelo mantiene un 97,8 % de acuerdo con la versión completa en coding, por lo que puede usarse como asistente de programación en un Mac de 128 GB sin depender de la nube, conectándolo a agentes de código mediante la API compatible con OpenAI.
- Razonamiento y análisis de documentos extensos: la naturaleza MoE con streaming de expertos permite procesar prompts largos en local, aunque el rendimiento depende críticamente de la velocidad del SSD interno.
- Análisis de imágenes con preguntas de seguimiento: el sidecar de visión codifica imágenes en hasta 1.024 tokens de prompt y reutiliza la codificación en preguntas posteriores sobre la misma imagen, lo que resulta adecuado para inspección de capturas, diagramas o documentos escaneados.
- Prototipado de agentes conversacionales: la API compatible con Anthropic y OpenAI permite integrar el modelo en frameworks de agentes existentes sin adaptadores personalizados.
- Evaluación de cuantizaciones agresivas: el repositorio sirve como caso de estudio de compresión selectiva a ~2 bits en expertos enrutados, útil para investigadores que estudien la degradación por cuantización en modelos MoE.
- Procesamiento de texto en inglés y chat general: con un 88,2 % de acuerdo en chat, es viable para conversación general, aunque con pérdida perceptible frente al modelo completo.
- Inferencia offline en hardware Apple: para entornos sin conectividad o con requisitos de privacidad, el modelo se ejecuta íntegramente en local en un M5 Max con 128 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card proporciona métricas de acuerdo de siguiente token frente al modelo completo de precisión original sobre 48 prompts reservados:

| Categoria | Acuerdo con el modelo completo |
|---|---:|
| Coding | 97,8 % |
| Reasoning | 96,0 % |
| Chat | 88,2 % |
| Multilingual | 79,8 % |

Rendimiento medido en Apple M5 Max con 128 GB (prompt de 2.048 tokens, 256 tokens generados, caché de expertos automática):

| Escenario | Velocidad |
|---|---:|
| Texto ordinario, caché caliente | ~36 tokens/s (27,3-27,5 ms/token) |
| Primera petición tras carga | ~34 tokens/s |
| Con draft DSpark en texto predecible | 71-79 tokens/s |
| Codificación de imagen grande | ~1,6 s |

## Requisitos de hardware

- Apple Silicon Mac con 128 GB de memoria unificada; el autor desarrolló y probó el modelo en un M5 Max.
- macOS 15 o posterior.
- Aproximadamente 360 GB de espacio libre en disco para los tres archivos (349,3 GB + 8,6 GB + 972 MB).
- El modelo excede los 128 GB de RAM: Razor hace streaming de los expertos necesarios desde el SSD interno a una caché en memoria, por lo que la velocidad del SSD es determinante para el rendimiento.
- No es compatible con GPU NVIDIA, llama.cpp, Ollama, vLLM ni TGI; únicamente funciona con el runtime Razor, no publicado como código abierto en la fecha de la model card.
- Latencia estimada: 27,3-27,5 ms por token en régimen estable; el rendimiento sostenido cae unos pocos puntos porcentuales por calentamiento del equipo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base ni de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. A nivel cualitativo, el punto diferencial frente a otras distribuciones GGUF es que este repositorio no es ejecutable con runtimes estándar: requiere Razor y hardware Apple Silicon con 128 GB, lo que lo sitúa en una categoría de despliegue distinta a la de las cuantizaciones convencionales de llama.cpp.

| Modelo | Parametros | Contexto | Licencia | Runtime |
|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (este repo) | ≈330 B | no disponible | MIT | Razor (Apple Silicon) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El runtime Razor no es de código abierto según la model card; los pesos se pueden descargar pero no ejecutar hasta su publicación.
- Incompatibilidad total con llama.cpp y otros runtimes GGUF: el formato es propietario.
- La cuantización a ~2 bits en expertos enrutados degrada especialmente el texto no inglés (79,8 % de acuerdo) y el chat (88,2 %), con pérdida menor en código y razonamiento.
- El modelo supera la memoria unificada de 128 GB, lo que obliga a streaming desde SSD y hace que el rendimiento dependa del almacenamiento interno.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones de contexto o idioma más allá de la degradación multilingual.
- La licencia es MIT, lo que permite uso comercial, pero la dependencia de un runtime propietario condiciona la viabilidad en producción.
- Las URLs remotas de imágenes no se descargan: solo se admiten imágenes en base64 o rutas locales.
- El rendimiento sostenido cae por calentamiento del equipo; las cifras de velocidad corresponden a un M5 Max concreto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/flaviodelgrosso/DeepSeek-V4.1-Flash-1017-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Licencia del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/blob/main/LICENSE
