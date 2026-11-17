# LlamaPal/granite-4.2-8b-Q4_0-GGUF

## Resumen

Granite 4.2 8B es un modelo de lenguaje de tamano medio desarrollado por IBM, disenado para combinar razonamiento explicito (modo *thinking*) con capacidades solidas de conversacion, generacion de codigo y soporte para 12 idiomas. Esta ficha concreta, publicada por el usuario LlamaPal, no es un modelo nuevo sino un espejo del archivo `granite-4.2-8b-Q4_0.gguf` original de IBM, cuantizado en Q4_0 y empaquetado en formato GGUF para su ejecucion en llama.cpp y aplicaciones derivadas.

El repositorio existe para alimentar a LlamaPal, una aplicacion Android de chat con IA totalmente offline: el modelo se descarga una vez y posteriormente funciona sin conexion, sin cuenta y sin enviar datos fuera del dispositivo. Esto lo convierte en una opcion practica para inferencia en movil y en entornos con requisitos estrictos de privacidad.

Con 8.791.592.960 parametros (aproximadamente 8,8 mil millones) y una ventana de contexto de 128K tokens segun la model card, Granite 4.2 8B se posiciona en la gama media de modelos densos con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no se detalla variante especifica en la informacion disponible) |
| Parametros totales | 8.791.592.960 (~8,8 B) |
| Parametros activos | no disponible (no es un modelo MoE segun los datos disponibles) |
| Longitud de contexto | 128K tokens (segun model card) |
| Tipos de cuantizacion | Q4_0 (esta ficha); el repositorio original de IBM ofrece otras variantes GGUF |
| Idiomas soportados | 12 idiomas (segun model card; no se enumeran) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `granite-4.2-8b-Q4_0.gguf`, 5,1 GB) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un transformer denso de aproximadamente 8,8 mil millones de parametros con soporte de contexto de 128K tokens. La model card menciona un "modo thinking" integrado y un modo no-thinking para respuestas mas rapidas, lo que sugiere un entrenamiento orientado a razonamiento explicito seguido de una fase de adaptacion para conversacion directa.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, arquitecturas hibridas) en la informacion proporcionada. Esta ficha es un espejo byte a byte del archivo original de IBM (mismo SHA-256: `82af51c80f8c2913430aa020f97bd3d4708c5fc49c5bfbff09ac012f3c2132d2`), por lo que cualquier detalle adicional debe consultarse en el repositorio oficial `ibm-granite/granite-4.2-8b-GGUF`.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento explicito mediante modo *thinking* integrado, con posibilidad de desactivarlo para respuestas mas rapidas.
- Generacion de codigo (la model card menciona "solid coding").
- Soporte de 12 idiomas.
- Ventana de contexto de 128K tokens, adecuada para documentos largos y conversaciones extensas.
- Compatibilidad con llama.cpp y cualquier aplicacion construida sobre el, incluida inferencia offline en Android.
- Capacidades de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Chat offline en Android: mediante la app LlamaPal, el modelo se ejecuta completamente en el dispositivo tras una descarga unica de 5,1 GB, sin conexion ni cuentas, lo que encaja en escenarios de privacidad estricta (periodistas, profesionales sanitarios, entornos sin red).
- Asistente personal sin conexion: conversaciones multi-turno con contexto de 128K tokens permiten mantener historiales largos o cargar documentos extensos sin perder el hilo.
- Generacion de codigo en local: util para autocompletado, explicacion de fragmentos o generacion de scripts en entornos de desarrollo sin acceso a APIs externas.
- Procesamiento de documentos largos: la ventana de 128K tokens permite resumir o extraer informacion de contratos, informes o articulos extensos en un solo paso.
- Atencion al cliente en despliegues air-gapped: al ser Apache 2.0 y funcionar con llama.cpp, puede integrarse en infraestructura propia sin dependencia de servicios cloud.
- Educacion y tutoria multilingue: el soporte de 12 idiomas y el modo thinking lo hacen adecuado para explicaciones paso a paso en distintos idiomas.
- Prototipado rapido en movil: desarrolladores que quieran validar una idea de app con LLM integrado pueden usar este GGUF como base sin montar infraestructura de servidores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el archivo Q4_0 ocupa 5,1 GB, por lo que se necesita al menos esa cantidad de memoria disponible (mas overhead de contexto KV). Con contexto de 128K tokens el consumo de KV cache crece de forma significativa y puede requerir varios GB adicionales.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, una GPU consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 4070) seria suficiente para el archivo Q4_0 con contexto moderado; no confirmado por el autor.
- Cabe en GPU consumer: si, segun el tamano del archivo, en GPUs con 8 GB o mas de VRAM para contexto corto/medio.
- Despliegue: llama.cpp y aplicaciones basadas en el (la model card lo confirma); Ollama, vLLM o TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| Granite 4.2 8B (esta ficha) | ~8,8 B | 128K | Apache 2.0 | GGUF Q4_0 | Modo thinking, 12 idiomas |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | No se proporcionan datos de modelos comparables en la informacion recibida |

No se dispone de informacion suficiente para establecer una comparativa rigurosa con alternativas concretas (por ejemplo, Llama 3.1 8B, Qwen 2.5 7B o Mistral 7B) sin datos verificados en la fuente proporcionada.

## Limitaciones y advertencias

- La cuantizacion Q4_0 introduce perdida de precision respecto a los pesos originales; puede degradar tareas sensibles como matematicas o codigo complejo.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas en esta ficha.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Idiomas: se indican 12 idiomas pero no se enumeran; el rendimiento relativo entre ellos no esta documentado.
- Contexto de 128K: el uso intensivo de contexto largo incrementa mucho el consumo de memoria (KV cache) y puede no ser viable en dispositivos moviles con RAM limitada.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero se recomienda revisar el archivo `LICENSE` del repositorio y la model card original de IBM para los terminos completos.
- Este repositorio es un espejo no oficial: para soporte, actualizaciones y documentacion completa debe consultarse el repositorio original de IBM.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validacion independiente de esta copia concreta.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/LlamaPal/granite-4.2-8b-Q4_0-GGUF
- Modelo base original: https://huggingface.co/ibm-granite/granite-4.2-8b
- Repositorio GGUF original de IBM: https://huggingface.co/ibm-granite/granite-4.2-8b-GGUF
- Commit exacto del archivo espejo: https://huggingface.co/ibm-granite/granite-4.2-8b-GGUF/tree/93f3f6a8938ee922b784cf4e5b4203cd3428df8f
- App LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Sitio web de LlamaPal: https://llamapal.cc/
- Instagram de LlamaPal: https://www.instagram.com/llamapalhq/
