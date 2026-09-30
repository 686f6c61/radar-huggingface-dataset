# hyperneocloud/NEO

## Resumen

NEO (Neural Expert Orchestrator) es el nombre comercial de servicio que HYPERneocloud utiliza para exponer el modelo DeepSeek-V4-Flash-0731 a traves de Cloudflare Workers AI, bajo el identificador explicito `@cf/deepseek-ai/deepseek-v4-flash-0731`. Es importante subrayar que el repositorio `hyperneocloud/NEO` no contiene pesos, adaptadores entrenados ni artefactos de inferencia: es unicamente una model card de caracter informativo y de procedencia. Por tanto, NEO no es un modelo entrenado por HYPERneocloud, sino una capa de enrutamiento y servicio sobre un modelo upstream de DeepSeek.

La relevancia de esta ficha es metodologica: documenta un patron cada vez mas habitual en el ecosistema, en el que un proveedor de infraestructura publica un identificador propio para un modelo de terceros servido de forma gestionada. El autor declara la revision publica de pesos upstream `7872f01b1d1fe23eabc4c98b48bffcef5a386062` como referencia de procedencia, pero advierte explicitamente de que no puede probar que el runtime gestionado de Cloudflare cargue exactamente ese commit de Hugging Face. Tampoco se reclama ningun adaptador afinado propio.

El servicio mantiene el texto de respuesta final en el campo `content` y el razonamiento en el campo separado `reasoning_content`, y aplica una politica de fallo cerrado ante limites de salida no verificados. El precio declarado es de 0,68 USD por millon de tokens de entrada y 1,88 USD por millon de tokens de salida. No se publican especificaciones de arquitectura, parametros, contexto ni resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no describe la arquitectura del modelo upstream) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la inferencia es gestionada por Cloudflare Workers AI; no se publica el esquema de cuantizacion) |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | MIT (heredada del modelo upstream; se debe preservar la atribucion original en artefactos redistribuidos) |
| Formato de pesos | no disponible (este repositorio no publica pesos ni adaptadores) |
| Identificador de servicio | `@cf/deepseek-ai/deepseek-v4-flash-0731` |
| Modelo upstream | deepseek-ai/DeepSeek-V4-Flash-0731 |
| Revision upstream declarada | `7872f01b1d1fe23eabc4c98b48bffcef5a386062` |
| Precio declarado | 0,68 USD por millon de tokens de entrada; 1,88 USD por millon de tokens de salida |
| Campos de respuesta | `content` (respuesta final) y `reasoning_content` (razonamiento) |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura interna (transformer denso, MoE, hibrida u otra), el numero de parametros, la composicion del dataset de entrenamiento, el volumen de tokens o las etapas de alineamiento (RLHF, DPO u otras) ni del modelo upstream DeepSeek-V4-Flash-0731 en la informacion proporcionada. La model card de NEO no documenta el entrenamiento porque NEO no es un artefacto entrenado: es un nombre de servicio con fines de enrutamiento.

Los unicos datos tecnicos verificables que aporta la model card son de naturaleza operativa. Primero, la separacion explicita entre `content` y `reasoning_content`, que implica que el modelo upstream expone un modo de razonamiento diferenciado del texto final. Segundo, el comportamiento de streaming: la salida se almacena en buffer hasta completarse y se aplica un criterio de fallo cerrado sobre limites de salida no verificados. Tercero, la existencia de una via prototipo anterior autoalojada basada en R1-Distill-Qwen-14B, que el autor describe como linea de prototipo y no como base de servicio actual de NEO 1, y que no forma parte de esta release ni constituye un mecanismo de fallback automatico.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation`.
- Razonamiento explicito: la API separa el razonamiento (`reasoning_content`) de la respuesta final (`content`), lo que permite auditar o reutilizar la traza de razonamiento en turnos posteriores.
- Tool calling / function calling: la model card menciona pruebas de humo de bucle de herramientas (tool-loop smoke tests) ejecutadas en entorno privado de Workers AI.
- Uso en clientes de tipo agente: se menciona compatibilidad con Cursor, aunque el propio autor indica que la compatibilidad extremo a extremo con Cursor permanece sin verificar.
- Streaming: soportado, con almacenamiento en buffer hasta completar la respuesta y fallo cerrado ante limites no verificados.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.
- Fine-tuning o adaptadores propios: no. El autor declara explicitamente que no reclama ningun adaptador afinado de NEO.

## Casos de uso

- Orquestacion de agentes con enrutamiento de modelos: NEO se posiciona como capa de enrutamiento ("Neural Expert Orchestrator") que recibe la llamada de un agente, selecciona el modelo adecuado, infiere y devuelve los tokens con las llamadas a herramientas resueltas. Encaja en arquitecturas multiagente donde se necesita un punto de entrada unico con medicion de tokens por millon.
- Agentes con tool calling en produccion: al soportar function calling y preservar `reasoning_content` entre turnos, permite construir flujos de varios pasos donde el modelo decide que herramienta invocar y el estado de razonamiento se conserva para el siguiente turno.
- Asistentes conversacionales con separacion de razonamiento: la distincion entre `content` y `reasoning_content` permite mostrar al usuario final solo la respuesta y registrar la traza interna por separado, util para auditoria, depuracion o cumplimiento.
- Generacion de codigo asistida en editor: el escenario declarado incluye integracion con Cursor. Es aplicable a autocompletado y refactorizacion asistida, aunque la compatibilidad end-to-end no esta verificada segun el propio autor.
- Despliegue sin gestion de infraestructura: al ejecutarse sobre Cloudflare Workers AI, es adecuado para equipos que quieren inferencia gestionada sin aprovisionar GPU ni mantener pesos, con facturacion por token.
- Aplicaciones sensibles al coste por token: con tarifas declaradas de 0,68 USD por millon de entrada y 1,88 USD por millon de salida, es apropiado para cargas con presupuesto acotado y trafico variable donde no se justifica capacidad reservada.
- Prototipado y evaluacion de proveedores: util para comparar una ruta gestionada frente a alternativas autoalojadas antes de comprometer infraestructura, dado que no requiere descargar pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que las pruebas de humo privadas (saludo y bucle de herramientas en Workers AI) no constituyen un benchmark de capacidades, y que una peticion autenticada de produccion a NEO sigue sin verificarse.

## Requisitos de hardware

- VRAM para inferencia local: no aplica. NEO se sirve como API gestionada a traves de Cloudflare Workers AI; el usuario no ejecuta los pesos.
- GPU recomendadas: no aplica para el consumidor de la API. La infraestructura subyacente no se documenta.
- Compatibilidad con GPU de consumo: no aplica, al no existir pesos descargables en este repositorio.
- Opciones de despliegue: exclusivamente la ruta gestionada de Cloudflare Workers AI mediante el identificador `@cf/deepseek-ai/deepseek-v4-flash-0731`. No se ofrece vLLM, llama.cpp, Ollama ni TGI desde este repositorio.
- Latencia y throughput: no disponible. La unica caracteristica de rendimiento documentada es que el streaming se almacena en buffer hasta completar la respuesta.
- Coste operativo declarado: 0,68 USD por millon de tokens de entrada y 1,88 USD por millon de tokens de salida. El autor indica que claves de cliente, checkout y lanzamiento comercial estan sujetos a verificacion de release.

## Comparativa con modelos similares

No hay datos cuantitativos publicados que permitan una comparativa rigurosa de parametros, contexto o rendimiento. La siguiente tabla recoge unicamente lo que la informacion disponible permite afirmar.

| Modelo | Relacion con NEO | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NEO 1 | Nombre de servicio de HYPERneocloud | no disponible | no disponible | MIT (upstream) | API gestionada en Cloudflare Workers AI |
| DeepSeek-V4-Flash-0731 | Modelo upstream servido | no disponible | no disponible | MIT | Pesos publicados en Hugging Face; revision declarada `7872f01b...` |
| R1-Distill-Qwen-14B (via prototipo autoalojado) | Linea de prototipo anterior, no es la base actual de NEO 1 | 14B (segun la designacion del modelo citado) | no disponible | no disponible en la informacion aportada | Autoalojado; sin inferencia ni fallback automatico en esta release |

## Limitaciones y advertencias

- No es un modelo entrenado por el publicador: el repositorio contiene una model card, no pesos ni adaptadores. Cualquier expectativa de fine-tuning, pesos descargables o artefactos propios es incorrecta.
- Procedencia no verificada en tiempo de ejecucion: el autor advierte que la revision de pesos upstream citada identifica el artefacto de origen, pero no prueba que el runtime gestionado de Cloudflare cargue exactamente ese commit.
- Peticion de produccion sin verificar: una peticion autenticada a NEO en produccion y la compatibilidad extremo a extremo con Cursor permanecen sin verificar segun la propia model card.
- Ausencia total de benchmarks: no hay datos publicos de MMLU, HumanEval, GSM8K ni equivalentes, y el autor declara que las pruebas de humo no son un benchmark de capacidades.
- Riesgo de alucinacion: inherente a los modelos generativos de lenguaje; no se documentan tasas de error ni evaluaciones de fidelidad.
- Idiomas soportados sin declarar: la model card no lista idiomas, por lo que no puede garantizarse un rendimiento homogeneo fuera de los idiomas mayoritarios del modelo upstream.
- Dependencia de un unico proveedor de servicio: el acceso depende de Cloudflare Workers AI y del identificador especifico de DeepSeek; no hay ruta alternativa desde este repositorio.
- Condiciones comerciales no consolidadas: claves de cliente, checkout y lanzamiento comercial estan sujetos a verificacion de release, y el precio puede cambiar.
- Comportamiento de streaming restrictivo: al almacenar en buffer hasta completar la respuesta y fallar de forma cerrada, puede no ser adecuado para interfaces que exigen tokens incrementales en tiempo real.
- Licencia y atribucion: aunque la licencia es MIT, se exige preservar la licencia y atribucion originales en artefactos redistribuidos; no se debe atribuir a HYPERneocloud la autoria del modelo subyacente.
- Cambio de linaje historico: la configuracion anterior basada en R1-Distill-Qwen-14B es una via de prototipo y no la base de servicio actual; no debe asumirse continuidad tecnica entre ambas.
- Advertencia de seguridad relevante: la model card indica que aplicaciones que consumen la API deberian mostrar unicamente `content` como respuesta final y no exponer `reasoning_content` al usuario final.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hyperneocloud/NEO
- Modelo upstream en Hugging Face: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Documentacion de Cloudflare Workers AI para el modelo: https://developers.cloudflare.com/workers-ai/models/deepseek-v4-flash-0731/
- Sitio web de HYPERneocloud: https://hyperneocloud.com/
- Organizacion en GitHub (corporativa): https://github.com/HYPERneocloud-corporation/
- Perfil en GitHub: https://github.com/HYPERneocloud
- Analisis de McKinsey sobre neoclouds: https://www.mckinsey.com/capabilities/tech-and-ai/our-insights/the-evolution-of-neoclouds-and-their-next-moves
- Publicacion en X de HYPERneocloud: https://x.com/HYPERneocloud/status/2069999441373786310
