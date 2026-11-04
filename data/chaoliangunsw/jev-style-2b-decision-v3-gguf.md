# chaoliangUNSW/Jev-Style-2B-Decision-v3-GGUF

## Resumen

Jev-Style-2B-Decision-v3-GGUF es la distribucion en formato GGUF del modelo Jev-Style-2B-Decision-v3, un modelo de decision y clasificacion de texto de aproximadamente 1.880 millones de parametros (1.881.825.088 exactos) desarrollado por Chaoliang Yan (usuario chaoliangUNSW). No es un modelo generativo de proposito general, sino un modelo especializado en "decision-making estilo Jev": recibe un contexto y un conjunto de opciones fijas, y emite un veredicto por opcion (por ejemplo, clasificacion si/no, eleccion multiple o puntuacion calibrada). Se distribuye bajo licencia Apache 2.0 y esta pensado para inferencia local con llama.cpp y el paquete `jev-style`.

El modelo se construye sobre una base de la familia Qwen3.5 (segun las etiquetas del autor) y se presenta como un sistema "system-one": respuestas rapidas y deterministas orientadas a enrutamiento de LLM, guardarrailes y clasificacion en dispositivo. La version v3 (27 de septiembre de 2026) es solo texto; el autor indica que la version recomendada actual es la v4, que anade imagenes y se entreno en parte con etiquetas suaves destiladas de TypeSafe Jev 1.14 a traves de su API publica. La v3 se mantiene por compatibilidad con integraciones existentes.

La relevancia practica esta en su tamano reducido y su formato GGUF: los pesos cuantizados Q4_K_M ocupan 1,27 GB, lo que permite ejecutarlo en hardware de consumo y en Apple Silicon sin GPU dedicada. El repo completo pesa 7,1 GB e incluye los pesos F16, Q8_0 y Q4_K_M, ademas de un pequeno scorer (`jev-score-v2`) que interpreta la decision en un slot de veredicto por opcion. En el momento de la consulta acumula 7.128 descargas y 14 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base de la familia Qwen3.5, segun etiquetas del autor); no se detalla la configuracion exacta |
| Parametros totales | 1.881.825.088 (~1,88B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | Entrenamiento/evaluacion con 25.600 tokens por llamada segun el banner del autor; la API alojada de la v4 usa 8.192 tokens, pero ese dato corresponde a v4 y no a esta version |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M (1,27 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que el modelo se apoya en una base de la familia Qwen3.5 y que se distribuye como un transformer denso de ~1,88B parametros. El autor describe el sistema como "decision model" con un mecanismo de lectura de veredictos por slot: en lugar de generar texto libre, el modelo produce una senal por cada opcion planteada, que un scorer externo (`jev-score-v2`) convierte en una decision calibrada. Este diseno es el que permite clasificacion de opcion fija, `noul` (si/no) y `choice` (eleccion entre alternativas) con un coste de inferencia bajo.

Sobre el entrenamiento, la model card de esta version indica que la v3 "no uso salidas de Jev" y que las fuentes de entrenamiento estan documentadas en la tarjeta del modelo base. No se especifican en la informacion proporcionada el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO. La v4 posterior si incorpora etiquetas suaves destiladas de TypeSafe Jev 1.14 via API, pero ese dato no aplica a la v3. El autor declara independencia respecto a TypeSafe, sin afiliacion ni respaldo.

## Capacidades

- Clasificacion de texto con opciones fijas: asignacion de una etiqueta entre un conjunto cerrado de alternativas.
- Decisiones si/no (`noul`) sobre un contexto, por ejemplo "este ticket es de facturacion".
- Eleccion multiple (`choice`) con puntuacion por opcion, util para enrutamiento y triaje.
- Puntuacion calibrada por opcion, leida a traves del scorer `jev-score-v2`.
- Procesamiento de contexto largo: el autor reporta llamadas de hasta 25.600 tokens sin limite de opciones.
- Enrutamiento de LLM (llm-routing): seleccion de que modelo o herramienta debe atender una peticion.
- Guardarrailes y filtros de seguridad basados en decisiones binarias o multietiqueta.
- Inferencia en dispositivo (on-device) via llama.cpp, sin dependencia de API alojada.
- Integracion con el paquete `jev-style` mediante un endpoint local `/v1/systemone`.
- Capacidades conversacionales limitadas al formato de decision; no es un modelo de dialogo abierto.
- No dispone de vision en esta version (la v4 anade imagenes y requiere la build de PyTorch).

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket y un conjunto de categorias (`billing`, `technical`, `account`) y devuelve la etiqueta con puntuacion. El ejemplo de la model card muestra exactamente este flujo con `noul` y `choice`.
- Enrutamiento de peticiones entre modelos: dado un prompt de usuario, decidir si debe ir a un modelo grande, a uno pequeno o a una herramienta externa, con contexto de hasta 25.600 tokens para incluir historial o documentos largos.
- Guardarrailes de entrada y salida: clasificar si una peticion o respuesta cumple una politica (si/no) antes de dejarla pasar a un LLM mayor, reduciendo coste y latencia en el camino critico.
- Clasificacion de sentimiento y tono en atencion al cliente: el ejemplo de la model card usa `choice` con las opciones `calm`, `frustrated`, `angry` sobre el mismo ticket, en una sola llamada.
- Moderacion de contenido en dispositivo: ejecutar el modelo en local para decidir si un texto requiere revision humana, sin enviar datos a un servicio externo.
- Extraccion de decisiones en pipelines de datos: etiquetar grandes volumenes de registros con categorias cerradas usando llama.cpp y cuantizacion Q4_K_M en CPU o Apple Silicon.
- Sistemas de agentes con verificacion por paso: usar el modelo como "critico" que valida si una accion propuesta cumple una condicion antes de ejecutarse, aprovechando su bajo coste por llamada.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks publicos, pero el contenido proporcionado esta truncado y solo muestra el encabezado. El unico dato numerico completo es el del banner: 73,6% en JevBench v1.4.1 sobre items publicos, el mas alto entre los sistemas de la familia Qwen3.5-2B del tablon, con Jev (API) por delante al 86,6%. El autor indica ademas que 42 de los 82 sistemas del tablon puntuan mas alto. No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible.

| Benchmark | Jev-Style v3 · 2B | Jev-Style v3 · 0.8B | Jev 1.13 (API) |
|---|---|---|---|
| JevBench v1.4.1 (items publicos) | 73,6% | no disponible en el extracto | 86,6% |
| Otros benchmarks estandar | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada: Q4_K_M ocupa 1,27 GB en disco y requiere aproximadamente 1,5-2 GB de memoria en inferencia; Q8_0 y F16 escalan hasta cerca de 2 GB y 3,8 GB respectivamente.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para Q4_K_M; RTX 3060, RTX 4060, RTX 4090 y A100 lo ejecutan sin problema, aunque el modelo esta claramente sobredimensionado para GPU de datacenter.
- Cabe en GPU de consumo: si, en practicamente todas las GPU consumer modernas con 4 GB o mas; tambien en Apple Silicon via Metal con llama.cpp.
- Despliegue: llama.cpp como backend principal (formato GGUF), paquete `jev-style` con `jev-style serve --release 2b-v3 --backend gguf`, y endpoint local `/v1/systemone`. No se mencionan vLLM ni TGI para esta version.
- Requisito adicional: el scorer `jev-score-v2` debe compilarse una vez desde `build_jev_score.sh`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Jev-Style-2B-Decision-v3 | ~1,88B | 25.600 tokens por llamada (segun autor) | Apache 2.0 | GGUF, safetensors | Especializado en decision y clasificacion; 73,6% en JevBench v1.4.1 |
| Jev-Style-0.8B-Decision-v3 | ~0,8B | no disponible | Apache 2.0 | GGUF (0,53 GB) | Version menor de la misma serie, para equipos mas limitados |
| Jev-Style-2B-Decision-v4 | ~2B | 8.192 tokens en API alojada | Apache 2.0 | GGUF, PyTorch | Version recomendada actual; anade vision y usa destilacion de Jev 1.14 |
| Jev 1.13 / 1.14 (API TypeSafe) | no disponible | no disponible | no disponible | API alojada | Referencia de maxima calidad en JevBench (86,6% en v1.13) |

## Limitaciones y advertencias

- Modelo especializado: no es adecuado para generacion de texto abierta, dialogo libre ni tareas creativas; su salida esta restringida a decisiones sobre opciones predefinidas.
- Version desactualizada: el propio autor marca la v3 como no recomendada frente a la v4, y la API alojada ya no sirve esta version.
- Dependencia del scorer: requiere compilar `jev-score-v2` y usar el paquete `jev-style` 0.6.0 o superior; sin el scorer, los pesos no producen decisiones interpretables.
- Idiomas: no se documentan los idiomas soportados, por lo que el rendimiento fuera del ingles (idioma de los ejemplos de la model card) es incierto.
- Riesgo de alucinacion: aunque el formato de opcion fija reduce la generacion libre, la calibracion de las puntuaciones puede ser incorrecta en dominios alejados de los datos de entrenamiento.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Contexto: el dato de 25.600 tokens por llamada proviene del banner del autor y no se detalla en la tabla de especificaciones; conviene validarlo en el caso de uso concreto.
- Licencia: Apache 2.0 permite uso comercial, pero el autor declara independencia respecto a TypeSafe y no ofrece respaldo de esa entidad; la procedencia del entrenamiento es especifica de cada release.
- Produccion: al ser un modelo de 1,88B con cuantizacion agresiva (Q4_K_M), la precision puede degradarse frente a F16 en decisiones sensibles; se recomienda validar con el conjunto de evaluacion propio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v3-GGUF
- Modelo base (safetensors): https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v3
- Version recomendada v4: https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v4
- Version 0.8B v3: https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/chaoliangUNSW/jev-style-2b
- Coleccion de builds v3: https://huggingface.co/collections/chaoliangUNSW/jev-style-decision-v3-08b-2b-6ab87f32380cbd8c03b608b9
- Serie v1 (2B): https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-GGUF
- Serie v2 (2B): https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-GGUF
- Version 0.8B v3 GGUF: https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3-GGUF
- Web oficial: https://jevstyle.com/models/
- Repositorio GitHub: https://github.com/lawrence3699/jev-style
- Guia de instalacion local: https://jevstyle.com/guides/run-locally/
- Guia de clasificacion de texto en Python: https://jevstyle.com/guides/local-text-classification/
- Guia de modelos de decision locales y Apple Silicon: https://jevstyle.com/guides/local-decision-models/
- Casos de uso con vision (v4): https://jevstyle.com/use-cases/local-vision-decisions/
- Benchmark de enrutamiento bancario: https://jevstyle.com/benchmarks/banking-routing/
- Estado del servicio alojado: https://jevstyle.com/api/#service-status
- Health check de la API: https://api.jevstyle.com/healthz
