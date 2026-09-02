# orcarouter/DeepSeek-V4-Flash-Vision-Uncensored-GGUF

## Resumen

DeepSeek-V4-Flash-Vision-Uncensored-GGUF es una cuantizacion en formato GGUF del modelo DeepSeek-V4-Flash-Vision-Uncensored, publicado por OrcaRouter. Se trata de una variante "abliterated" (desalinizada) del DeepSeek-V4-Flash-Vision-Exp de DeepSeek, el primer modelo multimodal experimental de la serie V4, que combina el backbone MoE de V4-Flash con una torre de vision de 32 capas y un contexto de 1 millon de tokens. La version uncensored elimina los rechazos de seguridad del modelo original, orientandose a usos de red-teaming y evaluacion de seguridad ofensiva.

El modelo mantiene las capacidades de texto y vision del V4-Flash-Vision-Exp, incluyendo tool calling nativo, razonamiento multi-paso y un modulo de borrador DSpark para decodificacion especulativa. Con aproximadamente 284.000 millones de parametros totales en arquitectura MoE, el repo GGUF ocupa 156,4 GB y esta disponible bajo licencia MIT, aunque el acceso es restringido (gated) y requiere aceptar condiciones en HuggingFace. Su relevancia actual radica en ofrecer una alternativa de pesos abiertos con vision a precio de texto, pensada para equipos de seguridad que necesitan probar modelos sin filtros de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con torre de vision de 32 capas y modulo DSpark de decodificacion especulativa |
| Parametros totales | 284.334.567.511 (aprox. 284B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | GGUF; el tag mxfp4 sugiere cuantizacion MXFP4, pero no se detallan los archivos concretos del repo |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash-Vision-Exp combina el backbone MoE de DeepSeek-V4-Flash con una torre de vision de 32 capas, lo que le permite procesar imagenes ademas de texto. Incorpora un modulo de borrador DSpark fusionado, un mecanismo de decodificacion especulativa que acelera la generacion al predecir multiples tokens en paralelo. El contexto alcanza 1M de tokens, lo que habilita tareas de razonamiento sobre documentos extensos o secuencias de video.

La variante uncensored de OrcaRouter aplica una tecnica de abliteration sobre el modelo original, eliminando selectivamente las direcciones de activacion asociadas a comportamientos de rechazo y negativa. Esto produce un modelo que no se niega a responder a peticiones que el modelo base bloquearia. No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens utilizados o si se aplicaron tecnicas de RLHF o DPO en el modelo base; los datos publicados se centran en la arquitectura y el despliegue.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con soporte de modo de pensamiento (reasoning) integrado.
- Comprension de imagenes (vision) al mismo precio de token que el texto, segun la documentacion de OrcaRouter.
- Tool calling / function calling nativo, compatible con APIs estilo OpenAI.
- Capacidad de agentes multimodales, con razonamiento sobre contexto largo de hasta 1M de tokens.
- Decodificacion especulativa mediante el modulo DSpark, que reduce la latencia de generacion.
- Multilingue limitado a ingles y chino.
- Comportamiento "uncensored" (abliterated): no aplica rechazos de seguridad, orientado a red-teaming y pruebas ofensivas.

## Casos de uso

- Red-teaming y evaluacion de seguridad: el modelo permite a equipos de seguridad probar vulnerabilidades de prompt injection, jailbreaks y generacion de contenido peligroso sin que el propio modelo se niegue a cooperar, facilitando la auditoria de sistemas defensivos.
- Agentes multimodales de analisis de documentos: con 1M de contexto y entrada de imagen, puede procesar manuales extensos, capturas de pantalla o diagramas tecnicos para extraer informacion y ejecutar acciones via tool calling.
- Asistencia de codigo en entornos de investigacion: soporta generacion de codigo y function calling, util para prototipado rapido en pipelines de CI/CD donde se requiera un modelo sin restricciones de contenido.
- Analisis de imagenes medicas o tecnicas en investigacion: la torre de vision permite describir y razonar sobre imagenes, aunque sin garantias de precision clinica.
- Generacion de contenido creativo sin filtros: escritura de ficcion, guiones o material de rol donde el modelo base rechazaria ciertas tematicas, gracias a la abliteration.
- Evaluacion comparativa de modelos de seguridad: al comparar las respuestas de la version uncensored con la version original, los investigadores pueden medir el impacto de los mecanismos de alineacion en la calidad y el comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para la variante uncensored en la informacion disponible. La pagina de OrcaRouter menciona que DeepSeek-V4-Flash-Vision iguala a V4-Flash en tareas de texto y se acerca a Opus-4.8 en agentes multimodales, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros tests estandarizados. No se incluyen numeros para no inventar datos.

## Requisitos de hardware

- El repo GGUF ocupa 156,4 GB, lo que indica que incluso con cuantizacion agresiva se necesita una capacidad de almacenamiento y memoria considerable.
- Con 284B de parametros totales en arquitectura MoE, la inferencia local requiere multiples GPU de alta gama (por ejemplo, 4-8x A100 80GB o H100) o un sistema con gran cantidad de RAM para ejecucion via CPU con llama.cpp.
- No se dispone de datos oficiales de VRAM minima, latencia o throughput para este modelo concreto.
- Opciones de despliegue: llama.cpp (por el formato GGUF), vLLM (compatible con el modelo base segun las recetas de vLLM), y la API de OrcaRouter con endpoint compatible con OpenAI.
- Para uso en produccion sin infraestructura propia, la API de OrcaRouter ofrece el modelo con facturacion a precio de proveedor (sin margen), con costes de $0,15 por millon de tokens de entrada y $0,29 por millon de tokens de salida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Acceso |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-Vision-Uncensored-GGUF (este) | 284B (MoE) | 1M | Si | MIT | Gated en HF |
| DeepSeek-V4-Flash-Vision-Exp (base) | 284B (MoE) | 1M | Si | MIT (segun DeepSeek) | Abierto |
| DeepSeek-V4-Flash (texto) | no disponible | no disponible | No | MIT | Abierto |

La principal diferencia con el modelo base es la abliteration, que elimina los rechazos de seguridad. Frente a alternativas como Opus-4.8 (propietario), este modelo ofrece pesos abiertos y vision a precio de texto, pero con un soporte de idiomas limitado a ingles y chino. No se dispone de datos de rendimiento comparativo cuantitativo.

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace antes de poder descargar el modelo.
- Comportamiento uncensored: al eliminar los rechazos de seguridad, el modelo puede generar contenido ofensivo, ilegal o peligroso. Su uso debe limitarse a entornos controlados de red-teaming e investigacion.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir informacion falsa o inventada, especialmente en tareas de razonamiento complejo.
- Idiomas limitados: solo ingles y chino; el rendimiento en otros idiomas no esta garantizado.
- Sesgos no documentados: no se han publicado evaluaciones de sesgos para esta variante.
- Requisitos de hardware elevados: la inferencia local no es viable en hardware de consumo; se necesita infraestructura de multiples GPU o uso via API.
- Sin datos de benchmarks publicados: no es posible validar el rendimiento real frente a otros modelos con cifras objetivas.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/orcarouter/DeepSeek-V4-Flash-Vision-Uncensored-GGUF
- Modelo base uncensored: https://huggingface.co/orcarouter/DeepSeek-V4-Flash-Vision-Uncensored
- Modelo original de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Receta de despliegue con vLLM: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Blog de lanzamiento de OrcaRouter: https://www.orcarouter.ai/blog/deepseek-v4-flash-vision-exp-launch
- Pagina de pricing y API de OrcaRouter: https://www.orcarouter.ai/models/deepseek/deepseek-v4-flash
