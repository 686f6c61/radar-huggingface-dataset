# nace-ai/Qwen3.8-Flash-Next-MLX

## Resumen

Qwen3.8-Flash-Next-MLX es una cuantización de 4 bits del modelo multimodal Qwen/Qwen3.8-Flash-Next, empaquetada en formato MLX para su ejecución en Apple Silicon. La publica el usuario nace-ai como parte de su motor propietario Kapitsa, orientado a servir modelos Qwen en Mac. El modelo base resuelve tareas de imagen-texto a texto (pipeline `image-text-to-text`), con capacidades conversacionales, razonamiento explícito y tool calling. El pack ocupa 107,6 GB descargables y declara 179.999.981.459 parámetros totales según los safetensors.

La relevancia del artefacto no está en el modelo base, sino en la técnica de cuantización: el autor reporta una divergencia KL de 0,067 frente al modelo BF16 original, frente a 0,249 del pack 4-bit de mlx-community, con un peso de lenguaje de 105,20 GB frente a 110,62 GB. Es decir, se obtiene mayor fidelidad con menos peso. El checkpoint usa grupos de 64 con 696 módulos elevados a 8 bits.

El repo está pensado exclusivamente para Macs con Apple Silicon. La librería declarada es mlx, y el autor advierte de que mlx-lm 0.32.2 no puede cargar esta arquitectura todavía. El modelo piensa antes de responder por defecto, con control de profundidad de razonamiento (`low`, `medium`, `xhigh`) y soporte de tool calling vía API compatible con OpenAI, Anthropic y Ollama a través de Kapitsa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag `qwen4_exp`; el autor no detalla la arquitectura interna) |
| Parametros totales | 179.999.981.459 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card menciona hasta 32.768 tokens de salida en modo thinking) |
| Tipos de cuantizacion | 4-bit en grupos de 64, con 696 modulos a 8-bit (grupos de 64 o 128) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en la model card) |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen3.8-Flash-Next en la documentación proporcionada. La etiqueta `qwen4_exp` sugiere una variante experimental de la familia Qwen, y el pipeline `image-text-to-text` confirma que acepta imágenes además de texto. Tampoco se detallan los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo RLHF o DPO.

La innovación destacable de este artefacto es el esquema de cuantización. Frente a un 4-bit uniforme, el pack de nace-ai combina grupos de 64 con 696 módulos a 8 bits, lo que reduce la divergencia KL a 0,067 respecto a BF16 mientras recorta 5,4 GB de pesos de lenguaje respecto al pack de mlx-community. El autor incluye una gráfica comparativa de KL frente a tamaño de fichero con packs rivales (TensorFold 4-bit, TensorFold oQ4-MTP, mlx-community 4-bit y Nace plain 4-bit). El modelo base incorpora modo thinking con profundidad configurable, lo que implica un entrenamiento orientado a razonamiento multi-paso.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat propia.
- Procesamiento de imagen y texto de entrada (pipeline `image-text-to-text`).
- Razonamiento explícito con modo thinking activado por defecto; la respuesta razonada se devuelve en el campo `reasoning_content`.
- Control de profundidad de razonamiento mediante `reasoning_effort` con valores `none`, `low`, `medium` y `xhigh`.
- Tool calling / function calling con definiciones de herramientas en formato OpenAI, incluyendo round trip completo con el SDK de OpenAI.
- Servicio mediante APIs compatibles con OpenAI, Anthropic y Ollama a través de Kapitsa.
- Generación de hasta 32.768 tokens de salida en modo thinking para la mayoría de tareas.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el pack se sirve con `kapitsa serve` y expone una página de chat y API en `http://127.0.0.1:8000`, lo que permite tener un asistente privado sin salida a la nube.
- Automatización de atención al cliente con herramientas: el soporte de tool calling en formato OpenAI permite conectar el modelo a funciones internas (consultas de estado, clima, bases de datos) y completar el ciclo llamada-resultado-respuesta, como muestra el ejemplo de `get_weather` de la model card.
- Análisis de documentos con imágenes: al aceptar entrada imagen-texto, puede emplearse para extraer información de capturas, formularios o gráficos combinados con instrucciones textuales.
- Razonamiento asistido con control de coste: el parámetro `reasoning_effort` permite bajar a `none` o `low` para consultas simples y subir a `xhigh` para problemas que requieren cadenas de razonamiento largas, ajustando latencia y consumo.
- Desarrollo y depuración de pipelines LLM en local: la compatibilidad con el SDK de OpenAI y con los endpoints de Anthropic y Ollama facilita probar aplicaciones escritas para la nube contra un servidor local sin cambiar el código cliente.
- Investigación sobre cuantización: el repo publica métricas de KL frente a BF16 y comparativas con packs rivales, lo que lo convierte en un punto de referencia para estudiar el impacto de esquemas mixtos 4/8 bits en modelos de gran tamaño.
- Prototipado de agentes multi-paso: la combinación de thinking mode, tool calling y contexto conversacional permite construir agentes que planifican, invocan herramientas y sintetizan resultados en una sola sesión local.

## Benchmarks y rendimiento

| Metrica | Nace Q4 (este repo) | mlx-community 4-bit | TensorFold 4-bit | TensorFold oQ4-MTP |
|---|---|---|---|---|
| KL frente a BF16 (menor es mejor) | 0,067 | 0,249 | no disponible en el texto | no disponible en el texto |
| Peso del modelo de lenguaje | 105,20 GB | 110,62 GB | no disponible en el texto | no disponible en el texto |
| Tamano de descarga | 107,6 GB | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los únicos datos cuantitativos son las métricas de fidelidad de cuantización y tamaño de pesos recogidas en la tabla.

## Requisitos de hardware

- VRAM/RAM unificada estimada: el autor indica que el pack encaja en equipos con 192 GB o más de memoria, calculado como el tamaño de descarga más 2 GB para una conversación según el reparto por defecto de la GPU en macOS. Kapitsa, al omitir partes que no usa, podría encajar en una talla menos; `kapitsa doctor` verifica el equipo concreto.
- GPU recomendadas: el release check se ejecutó con mlx-vlm 0.7.8 y MLX 0.32.4 sobre una NVIDIA H200 en CUDA, no en un Mac. Para Apple Silicon, se requiere un equipo con memoria unificada de 192 GB o superior (Mac Studio o Mac Pro de gama alta).
- Cabe en GPU de consumo: no. El tamaño de 107,6 GB descargables y la regla de 192 GB de memoria lo excluyen de cualquier GPU consumer convencional (RTX 4090 con 24 GB, por ejemplo).
- Opciones de despliegue: mlx-vlm 0.7.8 o superior para carga directa; Kapitsa (instalable vía `brew install nace-ai/tap/kapitsa`) para servir con APIs OpenAI, Anthropic y Ollama. mlx-lm 0.32.2 no puede cargar esta arquitectura según el autor.
- Latencia y throughput: no disponibles. El autor no publica medidas de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-MLX (Nace Q4) | 179.999.981.459 | no disponible | MLX safetensors 4-bit mixto | qwen-community-1.0 | Hugging Face, 1.688 descargas |
| mlx-community 4-bit de Qwen3.8-Flash-Next | mismo modelo base | no disponible | MLX 4-bit | qwen-community-1.0 | Hugging Face |
| TensorFold 4-bit de Qwen3.8-Flash-Next | mismo modelo base | no disponible | MLX 4-bit | qwen-community-1.0 | Hugging Face |
| TensorFold oQ4-MTP de Qwen3.8-Flash-Next | mismo modelo base | no disponible | MLX 4-bit | qwen-community-1.0 | Hugging Face |

Los tres packs comparados derivan del mismo modelo base, por lo que la diferencia relevante es la fidelidad de cuantización y el tamaño de pesos. Nace Q4 declara KL 0,067 frente a 0,249 de mlx-community, con 5,4 GB menos de pesos de lenguaje. No se dispone de datos de rendimiento en tareas para ninguno de los packs.

## Limitaciones y advertencias

- Solo para Apple Silicon: el pack está empaquetado en MLX y el autor no lo ha probado en Mac; el único test publicado se ejecutó en una H200 con CUDA.
- Incompatibilidad con mlx-lm 0.32.2: la arquitectura no se carga con esa versión; se requiere mlx-vlm 0.7.8 o superior.
- Kapitsa 0.2.36 sirve una revisión anterior del repo (`8fda1047`), no los ficheros de `Q4/`; el soporte para `Q4/` llegará en una release posterior.
- Requisito de memoria muy alto: 192 GB de memoria unificada como regla de referencia, lo que restringe el despliegue a equipos de gama alta.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo LLM generativo, es susceptible de producir contenido incorrecto, especialmente en modo thinking con cadenas largas.
- Sesgos conocidos: no documentados en la model card.
- Limitaciones de idioma: los idiomas soportados no están indicados; la licencia y la documentación están en inglés.
- Restricciones de licencia: la licencia qwen-community-1.0 puede imponer condiciones al uso comercial; debe revisarse el fichero LICENSE del repo antes de desplegar en producción.
- Configuración de generación sensible: el autor recomienda mantener `repetition_penalty` en 1.0 y usar parámetros distintos según el modo thinking (temperatura 1.0 frente a 0.7), lo que exige ajustar los clientes.
- El modelo piensa por defecto: si no se desactiva con `reasoning_effort: none` o `enable_thinking: false`, las respuestas incluyen razonamiento y consumen más tokens de salida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Mejores prácticas del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next#best-practices
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Revisión anterior servida por Kapitsa 0.2.36: https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX/tree/8fda104737236c4bbe1d6fb2784fb499ffd0a4cd
- Descarga directa de `Q4/`: https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX/tree/main/Q4
- Licencia: https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX/blob/main/LICENSE
