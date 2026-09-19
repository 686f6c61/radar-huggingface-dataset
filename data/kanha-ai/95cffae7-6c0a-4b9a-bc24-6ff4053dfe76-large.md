# Kanha-AI/95cffae7-6c0a-4b9a-bc24-6ff4053dfe76-large

## Resumen

El modelo identificado como `Kanha-AI/95cffae7-6c0a-4b9a-bc24-6ff4053dfe76-large` es un checkpoint de chatbot de tipo "custom-trained", generado por la plataforma Kanha (kanha.ai) mediante fine-tuning sobre el contenido de un sitio web concreto. No se trata de un modelo de propósito general: la propia model card indica explícitamente que está entrenado para responder preguntas sobre el contenido de una web específica, y no para tareas abiertas de razonamiento, código o conocimiento general.

Su rasgo diferencial es el modo de despliegue: el checkpoint está empaquetado para MLC-LLM y se ejecuta íntegramente en el dispositivo del usuario (navegador) mediante WebGPU, sin llamadas a API de servidor. Esto implica que las consultas del usuario no salen del dispositivo y que no existe facturación por token. El repositorio ocupa 2,3 GB, pero no se publican el número de parámetros, la longitud de contexto ni la licencia.

La relevancia actual del modelo es más arquitectónica que de rendimiento: representa el patrón de "chatbot embebible con inferencia local en el navegador", una alternativa a los asistentes basados en RAG contra API propietarias. No obstante, la ficha pública es prácticamente vacía en cuanto a especificaciones técnicas, benchmarks y condiciones de uso, lo que limita seriamente cualquier evaluación rigurosa previa a su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag de libreria es `mlc-llm`, lo que implica un transformer compilado para MLC; no se detalla la familia base) |
| Parametros totales | no disponible |
| Parametros activos | no aplica / no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (MLC-LLM suele usar formatos q4f16/q4f32, pero no se confirma en la informacion proporcionada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pesos para MLC-LLM (libreria declarada: `mlc-llm`); no se especifica si incluye safetensors o GGUF |
| Tamano del repositorio | 2,3 GB |
| Autor / organizacion | Kanha-AI |
| Fecha de creacion | 2026-09-18 |
| Fecha de ultima actualizacion | 2026-09-18 |
| Descargas | 0 |
| Likes | 0 |
| Pipeline declarado | no disponible |
| Tags | `mlc-llm`, `kanha`, `on-device`, `webgpu`, `fine-tuned`, `large`, `region:us` |

Nota: el tag `large` es una etiqueta de tamano interna de la plataforma Kanha (los widgets del SDK aceptan `model-size="large"`), no una indicacion del numero de parametros. El unico indicio indirecto de tamano es el peso del repositorio (2,3 GB), insuficiente para derivar la cifra de parametros sin conocer el esquema de cuantizacion.

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna, el modelo base sobre el que se hizo el fine-tuning, el numero de tokens de entrenamiento ni la composicion del dataset. La model card describe el pipeline de la plataforma: Kanha rastrea (crawl) el sitio web del cliente, genera datos de entrenamiento a partir de ese contenido y realiza un fine-tuning sobre un modelo compacto. El resultado se compila con MLC-LLM para ejecutarse con WebGPU en el navegador. Se desconoce si el entrenamiento incluyo etapas de RLHF, DPO u otra forma de alineamiento.

La innovacion tecnica relevante no esta en la arquitectura del modelo, sino en el stack de despliegue: inferencia on-device en el navegador mediante WebGPU, con pesos servidos como ficheros estaticos desde el Hub. Esto elimina la necesidad de infraestructura de servidor y de claves de API, traslada el coste computacional al cliente y garantiza que las consultas no salen del dispositivo. Como contrapartida, el rendimiento depende por completo de la GPU del usuario y del soporte de WebGPU en su navegador.

## Capacidades

- Generacion de texto conversacional restringida al dominio del sitio web sobre el que se entreno. La model card indica explicitamente que el modelo "no es de proposito general".
- Respuesta a preguntas sobre el contenido de una web concreta (caso de uso declarado por el autor).
- Ejecucion on-device: inferencia local en el navegador via WebGPU, sin llamadas a API.
- Privacidad por diseno: las consultas del usuario no se envian a ningun servidor.
- Integracion como widget embebible: componente `<kanha-bot>` via script de CDN, o componente React `KanhaBot` importado desde el paquete npm `kanha-ai`.
- Tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas en la ficha).
- Vision, audio, modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Atencion al cliente en el propio sitio web: el modelo se embebe como widget y responde dudas de visitantes usando exclusivamente el contenido de la web de la empresa. Es adecuado porque el fine-tuning esta limitado a ese corpus y no requiere backend ni coste por consulta.
- Soporte postventa con garantia de privacidad: en sectores regulados (salud, banca, legal), el hecho de que las consultas no salgan del dispositivo simplifica el cumplimiento de requisitos de tratamiento de datos personales.
- Buscador conversacional sobre documentacion de producto: en lugar de un buscador por palabras clave, el usuario formula preguntas en lenguaje natural y recibe respuestas extraidas de la documentacion publicada, con el modelo corriendo en su navegador.
- Onboarding de usuarios en aplicaciones SaaS: el bot puede resolver las preguntas frecuentes de primeros pasos sin que el equipo de soporte tenga que mantener un arbol de decisiones ni pagar inferencia en la nube.
- Despliegue en entornos con conectividad limitada o coste de red alto: al servirse los pesos una sola vez como ficheros estaticos y ejecutarse localmente, el trafico posterior de consultas es nulo, lo que reduce costes de ancho de banda en sitios con mucho trafico.
- Demos comerciales y prototipos de bajo coste: para validar la viabilidad de un asistente conversacional antes de invertir en un modelo generalista con RAG e infraestructura propia.
- Integracion en aplicaciones React existentes: mediante el componente `KanhaBot` del paquete npm, se puede anadir asistencia conversacional a una interfaz ya construida sin desplegar servicios adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica. Tampoco se publican datos de latencia o throughput en el repositorio.

## Comparativa con modelos similares

El modelo no es directamente comparable con LLMs generalistas, porque esta especializado en el contenido de un unico sitio web y carece de especificaciones publicas. Se incluye una comparativa orientativa con modelos compactos que suelen emplearse para escenarios on-device o de inferencia local, basada en la documentacion publica de esos terceros modelos (no en la informacion proporcionada en esta busqueda).

| Modelo | Parametros | Contexto | Licencia | Ejecucion local | Notas |
|---|---|---|---|---|---|
| Kanha large (este modelo) | no disponible | no disponible | no disponible | Si, WebGPU en navegador (MLC-LLM) | Especializado en una web concreta; sin benchmarks publicos |
| Familia Phi-3 mini | 3,8 B (segun documentacion publica de Microsoft) | 4k u 128k segun variante | MIT (variante instruct) | Si, via llama.cpp/ONNX | Proposito general; requiere cuantizacion para navegador |
| Familia Qwen2.5 1.5B | 1,5 B | 32k segun documentacion publica | Apache-2.0 en la mayoria de variantes | Si | Proposito general, buen rendimiento en codigo y matematicas para su tamano |
| Familia Llama 3.2 1B / 3B | 1,2 B / 3,2 B aprox. | 128k segun documentacion publica | Licencia comunitaria Llama | Si | Proposito general; requiere conversion a GGUF o MLC |

Las cifras de los modelos alternativos deben verificarse en sus fichas oficiales antes de tomar decisiones. La ventaja competitiva de este checkpoint no es el rendimiento bruto, sino el empaquetado listo para WebGPU y el ajuste al dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un repositorio de 2,3 GB de pesos sugiere un consumo de memoria del orden de 3 a 4 GB durante la inferencia (pesos mas cache KV y buffers de runtime), pero esta cifra es una estimacion derivada del tamano del repositorio y no un dato publicado.
- GPU recomendadas: no disponible. Al ejecutarse via WebGPU, depende del navegador y del adaptador grafico del usuario (GPU integrada moderna, GPU dedicada de escritorio o GPU de portatil con soporte WebGPU).
- Compatibilidad con GPU de consumo: probablemente si, dado el tamano del repositorio, pero sin confirmacion oficial. No se especifican modelos concretos (RTX 4090, etc.).
- Opciones de despliegue: MLC-LLM (libreria declarada), con ejecucion en navegador mediante WebGPU. Widget `<kanha-bot>` via CDN o componente React desde el paquete npm `kanha-ai`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible. Dependen del hardware del cliente, del navegador y de la cantidad de pesos que deban descargarse en la primera carga.
- Requisito previo del cliente: navegador con soporte de WebGPU y descarga inicial de los ficheros de pesos (2,3 GB en el repositorio, aunque no se especifica que subconjunto debe descargar el runtime).

## Limitaciones y advertencias

- Ambito restringido: la model card afirma explicitamente que el modelo no es de proposito general y que solo esta entrenado para responder sobre el contenido de un sitio web concreto. Usarlo fuera de ese dominio producira respuestas poco fiables.
- Riesgo de alucinacion: no se documentan tecnicas de mitigacion (grounding estricto, citas de fuente, abstención). Al ser un fine-tuning sobre contenido web, puede generar afirmaciones plausibles pero incorrectas sobre el sitio.
- Sesgos conocidos: no disponibles. No se publica informacion sobre composicion del dataset, filtrado, ni evaluaciones de sesgo.
- Limitaciones de contexto e idioma: no disponibles. No se declara ventana de contexto ni idiomas soportados, lo que impide planificar conversaciones multi-turno largas o despliegues multilingues.
- Licencia no especificada: al no declararse licencia, no puede asumirse permiso de uso comercial, redistribucion ni modificacion. Es un bloqueante para produccion hasta que el autor lo aclare por escrito.
- Ausencia de benchmarks: no hay ninguna metrica publica que permita estimar calidad, tasa de alucinacion o utilidad frente a alternativas.
- Dependencia del cliente: el rendimiento y la disponibilidad dependen del soporte de WebGPU del navegador del usuario y de su hardware grafico. No hay control sobre la latencia en produccion.
- Modelo con cero adopcion: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso ni issues que permitan contrastar su comportamiento real.
- Fechas del repositorio: la fecha de creacion registrada (2026-09-18) resulta anomala y conviene verificarla antes de citarla.
- Contenido de la busqueda web: los resultados recuperados no guardan relacion con el modelo (versan sobre indices de precios al consumo y sobre Outlook) y no aportan informacion tecnica utilizable.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/Kanha-AI/95cffae7-6c0a-4b9a-bc24-6ff4053dfe76-large
- Sitio de Kanha: https://kanha.ai
- Documentacion: https://kanha.ai/docs
- SDK en npm: https://www.npmjs.com/package/kanha-ai
- Repositorio en GitHub: https://github.com/Kanha-AI
- CDN del widget: https://cdn.jsdelivr.net/npm/kanha-ai/dist/widget.js
- Paper: no disponible
- Blog tecnico: no disponible
- Demo interactiva: no disponible

Nota: la busqueda web realizada no devolvio enlaces relevantes sobre este modelo ni sobre la plataforma Kanha; los resultados obtenidos eran ajenos al objeto de la ficha y se han descartado.
