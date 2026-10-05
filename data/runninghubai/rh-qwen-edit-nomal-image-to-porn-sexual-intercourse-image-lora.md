# RunningHubAI/rh-qwen-edit-nomal-image-to-porn-sexual-intercourse-image-lora

## Resumen

El modelo `RunningHubAI/rh-qwen-edit-nomal-image-to-porn-sexual-intercourse-image-lora` es un adaptador LoRA de edición de imagen publicado por RunningHub (autor acreditado en la plataforma como @aaronPP) y distribuido a través de Hugging Face. Se trata de un ajuste fino derivado de Qwen-Edit-2509, orientado a transformar fotografías de entrada en imágenes de contenido sexual explícito entre adultos, manteniendo la identidad y la pose de la persona retratada según las instrucciones textuales del usuario. El repositorio tiene un tamano de 0,6 GB y contiene un único archivo de pesos en formato safetensors de 563 MiB.

El modelo se enmarca en la categoría de adaptadores LoRA para pipelines `image-text-to-image` y está etiquetado para uso en ComfyUI y en la plataforma propietaria RunningHub. La ficha de Hugging Face lo marca como `not-for-all-audiences`, lo que implica contenido restringido a personas adultas. En el momento de la consulta acumula 0 descargas y 0 likes, y su licencia no está declarada de forma explícita más allá de una referencia genérica a la licencia del proyecto original o del modelo base.

Su relevancia técnica es doble: por un lado, ilustra el estado actual de la personalización de modelos de edición de imagen mediante LoRA de bajo coste (menos de 1 GB); por otro, es un caso representativo de los problemas de moderación, consentimiento y cumplimiento normativo que plantean los adaptadores NSFW publicados en repositorios abiertos, donde la trazabilidad del dataset y las condiciones de uso quedan habitualmente sin documentar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el modelo de edición de imagen Qwen-Edit-2509 (no se detalla la arquitectura interna del modelo base en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE; es un adaptador LoRA) |
| Longitud de contexto | no disponible (depende del modelo base Qwen-Edit-2509; no declarada) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos safetensors del adaptador; no se declaran versiones cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card indica "follow the original project or upstream license" y que el copyright permanece en el autor |
| Formato de pesos | safetensors (un unico archivo: `girl+before+during+sex_000006000.safetensors`, 563 MiB) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo base Qwen-Edit-2509 ni detalla la configuracion interna del adaptador. Por el tipo de artefacto publicado (un único archivo safetensors de 563 MiB y la etiqueta `lora`) se trata de un ajuste de bajo rango sobre un modelo de difusion de edición de imagen texto-a-imagen. No se especifican el rango, el alpha, el dropout ni las capas objetivo del LoRA.

Respecto al entrenamiento, el repositorio no publica número de pasos, composición del dataset, resolución, tasa de aprendizaje ni si se aplicaron técnicas de alineación como RLHF o DPO. El nombre del archivo de pesos incluye el sufijo `_000006000`, lo que sugiere un checkpoint guardado en el paso 6000, pero se trata de una observación sobre el nombre del fichero y no de un dato confirmado por el autor. El campo `Training at RunningHub` de la model card apunta a la plataforma de entrenamiento del proveedor, sin aportar métricas del proceso.

## Capacidades

- Edición de imagen guiada por texto: transforma una fotografía de entrada según una descripción textual, manteniendo la identidad de la persona retratada.
- Generación de contenido sexual explícito entre adultos, incluyendo la descripción de posiciones concretas en el prompt.
- Integración con ComfyUI mediante el nodo estándar de carga de LoRA sobre el modelo base Qwen-Edit-2509.
- Compatibilidad declarada con la plataforma RunningHub y con Hugging Face como repositorio de pesos.
- Condicionamiento `image-text-to-image`: requiere simultáneamente una imagen de referencia y un prompt de texto.
- No se declaran capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo de pensamiento, dado que es un adaptador de generación de imagen y no un modelo de lenguaje.

## Casos de uso

- Producción de contenido para plataformas de suscripción para adultos: el LoRA permite generar variaciones de escenas explícitas a partir de una fotografía base, reduciendo el coste de producción frente a sesiones fotográficas completas. Requiere verificación de edad de los sujetos y consentimiento documentado.
- Postproducción en estudios de contenido adulto: edición de poses y encuadres sobre material ya rodado, siempre que exista cesión de derechos de imagen por parte de las personas retratadas.
- Investigación en seguridad de modelos generativos (red teaming): evaluación de la facilidad con la que un adaptador de menos de 1 GB puede convertir un modelo de edición de propósito general en un generador de contenido explícito, útil para disenar políticas de moderación en repositorios.
- Entrenamiento y validación de clasificadores NSFW: generación de muestras sintéticas etiquetadas para probar la robustez de filtros de contenido en plataformas, CDN y sistemas de moderación automatizada.
- Auditoría de cumplimiento normativo: análisis de si un despliegue concreto cumple requisitos de verificación de edad, etiquetado de contenido y trazabilidad de consentimiento en jurisdicciones con regulación específica.
- Investigación sobre deepfakes y material íntimo no consentido (NCII): estudio de la viabilidad técnica de generar este tipo de material para desarrollar detectores y protocolos de respuesta.
- Pruebas de pipelines ComfyUI con adaptadores de alto impacto: validación de flujos de trabajo, gestión de memoria y encadenado de nodos cuando el LoRA altera de forma agresiva la distribución de salida del modelo base.
- Docencia y divulgación sobre riesgos de IA generativa: uso controlado en entornos académicos para ilustrar los límites entre personalización legítima y usos daninos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 563 MiB en disco y anade aproximadamente 0,6 GB al peso total del modelo base durante la inferencia. El requisito real de VRAM lo determina Qwen-Edit-2509, no el adaptador.
- El repositorio no publica cifras oficiales de VRAM, GPU recomendadas, latencia ni throughput para este LoRA.
- A modo orientativo, y como estimacion no confirmada por el autor: un modelo de difusion de edición de imagen de gran tamano requiere GPUs de gama alta con 24 GB de VRAM o más para trabajar en precision completa o FP8; las cuantizaciones de tipo GGUF o NF4 del modelo base pueden reducir el requisito, a costa de calidad.
- En GPUs de consumo (RTX 3090, RTX 4090 con 24 GB, o modelos con 16 GB aplicando cuantizacion) el despliegue es posible en funcion de la cuantizacion elegida para el modelo base; no hay confirmacion por parte del autor.
- Opciones de despliegue: ComfyUI (escenario principal indicado en la model card), la plataforma RunningHub y, en funcion del soporte del modelo base, backends de difusion compatibles con LoRA en safetensors. No se declara compatibilidad con vLLM, TGI, llama.cpp ni Ollama, que no son backends de generacion de imagen.
- No se dispone de datos de latencia ni de imagenes por segundo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento, parametros del modelo base ni metricas que permitan una comparacion cuantitativa con otros adaptadores LoRA de edicion de imagen. Cualquier comparacion seria requeriria reproducir inferencias bajo el mismo pipeline y la misma configuracion de muestreo.

## Limitaciones y advertencias

- Consentimiento: el modelo esta disenado para insertar a una persona real en una escena sexual explicita a partir de una fotografia. Su uso sin consentimiento expreso y verificable de la persona retratada puede constituir material intimo no consentido (NCII) y ser ilegal en numerosas jurisdicciones.
- Menores: no existe ningun mecanismo tecnico en el adaptador que impida generar contenido con personas menores de edad. La verificacion de edad recae por completo en el operador del pipeline.
- Licencia: no esta declarada de forma explicita. La model card remite a la licencia del proyecto original o del modelo base y mantiene el copyright en el autor, lo que deja en una situacion juridica ambigua el uso comercial del adaptador.
- Licencia del modelo base: no se especifica en el repositorio cual es la licencia de Qwen-Edit-2509 aplicable a este derivado, ni si permite el uso comercial o la redistribucion de adaptadores.
- Alucinacion y artefactos: al ser un modelo de difusion, puede producir anatomia incorrecta, fusiones de miembros, incoherencias de iluminacion y perdida de identidad facial, especialmente con prompts muy detallados o imagenes de entrada de baja resolucion.
- Sesgos: no hay informacion sobre la composicion del dataset de entrenamiento. Es previsible un sesgo hacia los tipos corporales, etnias y estilos presentes en los datos de ajuste, pero no puede cuantificarse con la informacion disponible.
- Idioma: no se declaran idiomas soportados. El rendimiento con prompts en castellano frente a otros idiomas no esta documentado.
- Trazabilidad: cero descargas y cero likes en el momento de la consulta, sin historial de uso, sin issues publicas y sin versionado mas alla de un unico checkpoint.
- Moderacion de plataforma: el repositorio lleva la etiqueta `not-for-all-audiences`; muchos proveedores de alojamiento, CDN y pasarelas de pago prohiben el contenido sexual explicito generado, lo que limita su uso en produccion comercial.
- Reputacion y responsabilidad legal: el despliegue en la Union Europea queda sujeto a normativa de proteccion de datos y a las obligaciones de transparencia de contenido generado por IA; en otras jurisdicciones el contenido sexual explicito esta directamente prohibido.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-qwen-edit-nomal-image-to-porn-sexual-intercourse-image-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/1974464885117554689
- Pagina del autor en RunningHub (@aaronPP): https://www.runninghub.ai/user-center/1931299605898764290
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Pagina de entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Detalle del modelo Seedance 2.5 en la API de RunningHub: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
