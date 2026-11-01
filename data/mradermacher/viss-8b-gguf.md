# mradermacher/ViSS-8B-GGUF

## Resumen

ViSS-8B es un modelo de vision-language orientado a la comprension de video en streaming, desarrollado a partir de Qwen3-VL 8B por el equipo detras del repositorio mis2/ViSS-8B. Su especialidad es la respuesta a preguntas visuales sobre video de forma causal: el modelo procesa la senal de video de manera continua y en linea, sin necesidad de tener el clip completo disponible de antemano, lo que lo hace adecuado para escenarios de analisis en tiempo real. Este repositorio concreto no es el modelo original, sino una coleccion de cuantizaciones estaticas en formato GGUF publicadas por mradermacher, un cuantizador conocido de la comunidad de Hugging Face.

La relevancia de esta ficha radica en que las cuantizaciones GGUF permiten ejecutar un modelo multimodal de video de 8 mil millones de parametros en hardware de consumo, desde portatiles con GPU modesta hasta estaciones de trabajo, usando backends como llama.cpp u Ollama. El repo incluye cuants desde Q2_K (3,4 GB) hasta f16 (16,5 GB), ademas de los suplementos multimodales mmproj necesarios para el procesamiento visual.

El modelo original se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. El idioma principal declarado es el ingles, y la tarea asignada en el pipeline es visual-question-answering.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Qwen3-VL (transformer multimodal con soporte de video causal en streaming); detalles completos no disponibles |
| Parametros totales | 8.190.735.360 (8,19 B, segun safetensors del modelo base) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estaticas; sin imatrix por ahora) |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); el modelo base mis2/ViSS-8B esta en safetensors |

## Arquitectura y entrenamiento

ViSS-8B se construye sobre Qwen3-VL 8B, la familia multimodal de Alibaba, y hereda su arquitectura de transformer con codificador visual conectado al LLM mediante un proyector (los archivos mmproj de este repo corresponden a ese componente). La innovacion principal del modelo, segun sus etiquetas, es el enfoque de video causal en streaming: en lugar de muestrear fotogramas de un clip completo y procesarlos en lote, el modelo consume el video de forma secuencial y causal, manteniendo un estado que le permite responder preguntas en cualquier momento sin reprocessar todo el historial. Los detalles internos concretos (mecanismo exacto de memoria, numero de tokens por fotograma, etc.) no estan disponibles en la informacion proporcionada.

Sobre el entrenamiento del modelo base no hay datos publicados en este repositorio: no se especifica el numero de tokens de preentrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Para esa informacion habria que consultar la model card o el paper de mis2/ViSS-8B. En cuanto a las cuantizaciones de este repo, son estaticas (no imatrix ni weighted), generadas por mradermacher con conversion desde los pesos safetensors originales.

## Capacidades

- Respuesta a preguntas visuales sobre video (visual question answering), la tarea principal del pipeline.
- Comprension de video en streaming de forma causal: puede procesar video a medida que llega, sin esperar al clip completo.
- Comprension de imagen estatica, al heredar las capacidades multimodales de Qwen3-VL (con el componente mmproj correspondiente).
- Generacion de texto conversacional en ingles, descrita como modelo conversacional en los metadatos.
- Ejecucion local en hardware de consumo gracias al formato GGUF, con 12 niveles de cuantizacion y soporte de proyector multimodal en Q8_0 y f16.
- No hay informacion disponible sobre tool calling, capacidades de agente, ni soporte de audio.

## Casos de uso

- Vigilancia y monitorizacion inteligente: el modo streaming causal permite analizar camaras en directo y responder preguntas ("hay alguien en la zona restringida?") sin almacenar ni reprocessar horas de grabacion.
- Asistentes de video bajo demanda: indexacion y consulta conversacional de grabaciones largas (reuniones, clases, directos), donde el usuario pregunta sobre el contenido y el modelo responde con base visual.
- Moderacion de contenido en directo: clasificacion de escenas o deteccion de contenido problematico en streams, aprovechando la inferencia local para evitar subir video a la nube.
- Robotica y drones con vision en linea: en dispositivos con GPU integrada, un cuant Q4_K_S (4,9 GB) cabe en hardware modesto y permite razonamiento visual sobre el feed en tiempo real.
- Accesibilidad: descripcion de video en tiempo real para usuarios con discapacidad visual, ejecutandose offline en un portatil sin dependencia de servicios externos.
- Analisis deportivo o de eventos en directo: extraccion de momentos clave y respuestas a preguntas sobre el transcurso del evento mientras ocurre.
- Prototipado rapido de aplicaciones multimodales: la disponibilidad en GGUF con Ollama o llama.cpp permite a desarrolladores probar integraciones de video sin aprovisionar GPUs de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del LLM): unos 3,4 GB con Q2_K, 4,9-5,1 GB con Q4_K_S/Q4_K_M, 6,8 GB con Q6_K, 8,8 GB con Q8_0 y 16,5 GB con f16. Hay que anadir 0,9-1,3 GB del archivo mmproj para la parte visual.
- GPU recomendadas: cualquier GPU con 6 GB de VRAM o mas ejecuta comoda-mente los cuants Q4; una RTX 3060 de 12 GB o RTX 4060 Ti cubre Q6_K/Q8_0; para f16 conviene una RTX 4090 (24 GB). Tambien es viable inferencia en CPU pura o hibrida CPU+GPU con llama.cpp, a costa de latencia.
- Cabe en consumer GPU: si. Con Q4_K_M (5,1 GB + 0,9 GB mmproj) funciona en GPUs de 8 GB como la RTX 4060 o RTX 3070.
- Opciones de despliegue: llama.cpp (formato nativo GGUF, con soporte mmproj para la parte multimodal), Ollama, LM Studio y cualquier backend compatible con GGUF. vLLM y TGI no aplican directamente a este repo, ya que requieren los pesos originales de mis2/ViSS-8B.
- Latencia y throughput: no disponible; dependeran del cuant elegido, del backend y del hardware, siendo Q4_K_S/Q4_K_M los marcados como "fast, recommended" por el cuantizador.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Contexto | Licencia | Disponibilidad GGUF |
|---|---|---|---|---|---|
| ViSS-8B (este repo) | 8,19 B | Video en streaming + imagen + texto | no disponible | Apache 2.0 | Si (12 cuants estaticos) |
| Qwen3-VL 8B (base) | 8 B | Imagen + video + texto | no disponible en esta ficha | Segun repo original (Apache 2.0 en la familia Qwen3) | Si (oficiales y comunitarios) |
| LLaVA-Video 7B | 7 B | Video + imagen + texto | no disponible | Licencia del modelo base (Apache 2.0 en la familia Qwen2) | Si (cuants comunitarios) |
| Qwen2.5-VL 7B | 7 B | Imagen + video + texto | Hasta 128K segun documentacion de la familia | Apache 2.0 | Si (oficiales y comunitarios) |

La diferencia diferenciadora de ViSS-8B frente a los alternativos es su enfoque explicito en video causal en streaming, mientras que la mayoria de modelos VLM de video procesan clips completos de forma por lotes.

## Limitaciones y advertencias

- Idioma: la model card declara unicamente ingles; no hay garantia de rendimiento en castellano ni otros idiomas.
- Sesgos: no documentados en este repositorio. Al derivar de Qwen3-VL, podria heredar los sesgos de sus datos de entrenamiento, pero no hay analisis publicado aqui.
- Alucinaciones: como todo modelo VLM generativo, puede describir contenido que no esta en el video o responder con confianza a preguntas sobre detalles visuales inexistentes; se recomienda verificacion en usos criticos.
- Las cuants mas agresivas (Q2_K, Q3_K_S/M) degradan apreciablemente la calidad, especialmente en tareas visuales finas; el propio cuantizador marca Q3_K_M como "lower quality".
- Son cuants estaticas sin imatrix; las weighted/imatrix podrian no llegar nunca si el cuantizador no las planifica (el propio README lo indica y sugiere pedirlo por Community Discussion).
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base mis2/ViSS-8B y del Qwen3-VL subyacente para el caso de uso concreto.
- La longitud de contexto y los detalles de la ventana de video no estan disponibles en esta ficha, lo que dificulta planificar el procesamiento de videos muy largos.
- Este repo es una cuantizacion de terceros: los problemas del modelo original (arquitectura, entrenamiento, comportamiento) deben reportarse a mis2/ViSS-8B, no al cuantizador.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/ViSS-8B-GGUF
- Modelo base original: https://huggingface.co/mis2/ViSS-8B
- Pagina de descargas resumida del cuantizador: https://hf.tst.eu/model#ViSS-8B-GGUF
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador (nethype GmbH): https://www.nethype.de/
- Paper o blog del modelo original: no disponible
