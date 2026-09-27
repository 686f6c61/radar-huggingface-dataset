# SoAIHQ/gpt-oss-20b-VISION-GGUF

## Resumen

SoAIHQ/gpt-oss-20b-VISION-GGUF es una distribucion en formato GGUF del modelo de pesos abiertos openai/gpt-oss-20b, publicada por SoAI. Se trata de una conversion de contenedor que conserva los pesos originales de OpenAI sin recuantizar: los tensores de los expertos de la mezcla (MoE) permanecen en el formato MXFP4 con el que OpenAI los post-entreno y evaluo, mientras que el resto de tensores mantienen su precision BF16 de origen. El resultado es un unico build de 13,8 GB pensado para su ejecucion en llama.cpp, con servidor compatible con la API de OpenAI incluido.

La novedad frente al modelo base es la incorporacion experimental de entrada de imagenes. El modelo original solo procesa texto; esta version anade el codificador visual y el proyector de OpenGVLab/InternVL3_5-GPT-OSS-20B-A4B-Preview mediante un archivo mmproj separado de 651,1 MB, que se carga con el flag `--mmproj`. Se trata, por tanto, de un modelo multimodal de tipo image-text-to-text construido sobre un modelo de razonamiento de proposito general.

El modelo es relevante porque combina un modelo de razonamiento de OpenAI con pesos abiertos (licencia Apache 2.0), una arquitectura MoE eficiente (21B parametros totales, 3,6B activos) y una ventana de contexto de 128K tokens, todo ello empaquetado para inferencia local en GPU o CPU. La adicion de vision, aunque experimental, amplia los casos de uso hacia tareas que requieren interpretar imagenes junto con razonamiento en lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of experts (MoE), transformer; 32 expertos con 4 activos |
| Parametros totales | 20.914.757.184 (aproximadamente 21B) |
| Parametros activos | 3,6B |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | MXFP4 en los pesos de los expertos; BF16 en el resto de tensores; mmproj en F16 |
| Idiomas soportados | Principalmente ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) + mmproj GGUF para vision |

## Arquitectura y entrenamiento

El modelo base openai/gpt-oss-20b es un transformer con arquitectura de mezcla de expertos (MoE) compuesta por 32 expertos, de los cuales 4 se activan por token, lo que da lugar a 3,6B parametros activos sobre un total de aproximadamente 21B. OpenAI post-entreno el modelo con los pesos de los expertos ya en formato MXFP4 y ejecuto sus evaluaciones publicadas en ese mismo formato. Esta distribucion respeta esa decision: no recuantiza los expertos (lo que anadiria error de redondeo sobre el original) ni publica builds Q4_K_M o Q8_0, ya que el primero expandiria los expertos de 4 bits y los redondearia de nuevo, y el segundo duplicaria el tamano sin recuperar precision.

El razonamiento esta siempre activo y su profundidad se controla mediante el parametro `reasoning_effort`, que acepta los valores `low`, `medium` y `high`. El modelo funciona exclusivamente con el formato de prompt harmony de OpenAI, cuya plantilla de chat original va embebida en el propio GGUF, de modo que los runtimes la aplican de forma automatica. Durante el proceso de conversion se verifica que los marcadores de chat, razonamiento y llamada a herramientas queden almacenados como tokens especiales y que la plantilla embebida coincida con la original, deteniendo la publicacion del archivo si la conversion los importa como texto plano. La entrada de imagenes se implementa mediante el codificador visual y el proyector de InternVL3_5-GPT-OSS-20B-A4B-Preview (revision aaabe6aa48), cargados como add-on independiente.

## Capacidades

- Generacion de texto y razonamiento de proposito general, con modo de pensamiento siempre activo y profundidad configurable (`low`, `medium`, `high`).
- Llamada a herramientas (tool calling / function calling): llama.cpp parsea las llamadas de vuelta al formato `tool_calls` compatible con la API de OpenAI.
- Entrada de imagenes de forma experimental (image-text-to-text) mediante el archivo mmproj F16 y el flag `--mmproj`.
- Ventana de contexto de 128K tokens, adecuada para conversaciones multi-turno y documentos largos.
- Compatibilidad con la API de OpenAI a traves de `llama-server`, incluyendo interfaz de chat integrada.
- Capacidades multilingues limitadas: el modelo esta pensado principalmente para ingles.
- Sin soporte de audio segun la informacion disponible.

## Casos de uso

- Razonamiento asistido en local: ejecucion de consultas con modo de pensamiento de alta profundidad (`reasoning_effort: high`) en hardware propio, sin depender de APIs externas, gracias al formato GGUF y al soporte de llama.cpp en CPU y GPU.
- Agentes con llamada a herramientas: integracion en flujos de agente que necesitan invocar funciones externas, ya que el modelo emite `tool_calls` en formato compatible con OpenAI y permite orquestacion multi-paso.
- Analisis de documentos extensos con contexto de 128K tokens: resumen, extraccion y preguntas sobre contratos, informes o bases de conocimiento largas en una sola pasada.
- Asistente de atencion al cliente multi-turno: gestion de conversaciones con historial amplio en ingles y posibilidad de conectar con sistemas internos mediante tool calling.
- Interpretacion de imagenes en prototipos: descripcion o razonamiento sobre capturas, diagramas o imagenes medicas simples en fase de experimentacion, asumiendo el caracter experimental del soporte visual.
- Despliegue en entornos con recursos limitados: al tener solo 3,6B parametros activos, el modelo es mas ligero en computo que un modelo denso de 21B, lo que facilita su ejecucion en una unica GPU o incluso con reparto entre CPU y GPU.
- Generacion asistida de codigo y explicaciones tecnicas en ingles, aprovechando el modo de razonamiento para tareas de depuracion o diseno de algoritmos.
- Base para fine-tuning o investigacion sobre modelos MoE con soporte multimodal experimental, dado que la licencia Apache 2.0 lo permite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo principal MXFP4 ocupa 13,8 GB; el add-on mmproj F16 anade 651,1 MB. A ello hay que sumar la memoria destinada al contexto, que crece con la longitud de contexto configurada. Con contexto reducido, un presupuesto de 16-20 GB de VRAM resulta razonable; con contexto cercano a 128K la demanda aumenta de forma notable.
- GPU recomendadas: tarjetas profesionales como A100 o H100 cubren el modelo con margen amplio. En el segmento de consumo, una RTX 4090 (24 GB) deberia poder ejecutarlo con contexto moderado gracias al peso reducido de los expertos activos.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas de VRAM para contexto moderado; en GPUs con menos VRAM puede recurrirse al reparto de capas entre CPU y GPU.
- Opciones de despliegue: llama.cpp (version v0.5.0 referenciada) y `llama-server`, que ofrece API compatible con OpenAI e interfaz de chat. El formato GGUF tambien es compatible con otros runtimes basados en llama.cpp, como Ollama.
- Ajustes recomendados: temperatura 1.0 y top_p 1.0 para todas las tareas, segun la model card. Se recomienda reservar al menos 16K tokens de salida para dejar espacio a las respuestas tras el razonamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SoAIHQ/gpt-oss-20b-VISION-GGUF | 21B totales / 3,6B activos | 128K | Experimental | Apache 2.0 | GGUF en HuggingFace |
| openai/gpt-oss-20b | 21B totales / 3,6B activos | 128K | No | Apache 2.0 | Pesos originales |
| OpenGVLab/InternVL3_5-GPT-OSS-20B-A4B-Preview | No disponible | No disponible | Si | No disponible | HuggingFace |

El modelo se diferencia de openai/gpt-oss-20b principalmente por el empaquetado GGUF para llama.cpp y por la adicion experimental de vision. Frente a InternVL3_5-GPT-OSS-20B-A4B-Preview, del que toma el codificador visual, esta distribucion se centra en la inferencia local mediante llama.cpp. No se dispone de datos de rendimiento comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- El soporte de imagenes es experimental; puede presentar errores o un rendimiento inferior al de modelos de vision consolidados.
- El modelo esta orientado principalmente al ingles; el rendimiento en otros idiomas, incluido el castellano, no esta documentado.
- El razonamiento no puede desactivarse; siempre esta activo, lo que incrementa el consumo de tokens de salida y la latencia. Para respuestas rapidas debe usarse `reasoning_effort: low`.
- Aunque el modelo base es de un proveedor reconocido, todo modelo generativo presenta riesgo de alucinacion; no se han publicado tasas concretas en la informacion disponible.
- No se dispone de informacion sobre sesgos especificos del modelo.
- El formato de prompt es exclusivamente harmony; usar plantillas distintas puede romper turnos, razonamiento y llamadas a herramientas sin mostrar errores.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base y del componente de vision (InternVL3_5) antes de un despliegue en produccion.
- Al ejecutarse con cuantizacion MXFP4 en los expertos, existe una perdida de precision respecto a la version BF16 completa, aunque es la misma que OpenAI uso en sus evaluaciones publicadas.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, por lo que carece de validacion comunitaria amplia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SoAIHQ/gpt-oss-20b-VISION-GGUF
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Licencia del modelo base: https://huggingface.co/openai/gpt-oss-20b/blob/main/LICENSE
- Modelo de vision de origen (InternVL3_5-GPT-OSS-20B-A4B-Preview): https://huggingface.co/OpenGVLab/InternVL3_5-GPT-OSS-20B-A4B-Preview
- Revision del modelo de vision: https://huggingface.co/OpenGVLab/InternVL3_5-GPT-OSS-20B-A4B-Preview/tree/aaabe6aa487a7b3db734b104e72b7e85afcd9093
- Formato de prompt harmony: https://github.com/openai/harmony
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Sitio del autor (SoAI): https://soai.to
