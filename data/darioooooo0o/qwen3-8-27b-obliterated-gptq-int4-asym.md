# darioooooo0o/Qwen3.8-27B-OBLITERATED-GPTQ-Int4-asym

## Resumen

Este repositorio contiene una cuantizacion GPTQ de 4 bits asimetrica del modelo OBLITERATUS/Qwen3.8-27B-OBLITERATED, una version del Qwen/Qwen3.8-27B de Alibaba a la que se le ha eliminado el comportamiento de rechazo mediante tecnicas de abliteration. La ficha la publica el usuario darioooooo0o (conocido como @imdariotoo en X), que distribuye sus versiones optimizadas para Intel Arc en esa red social. El objetivo explicito del autor es conseguir que un modelo multimodal de 27.781.427.952 parametros quepa y funcione en una unica GPU Intel Arc Pro B70 de 32 GB.

El modelo conserva las capacidades multimodales del original: el pipeline declarado es image-text-to-text, y la torre de vision, la cabeza MTP (multi-token prediction) y el lm_head permanecen en BF16, de modo que tanto la entrada de imagenes como la decodificacion especulativa MTP siguen operativas tras la cuantizacion. El contexto maximo declarado en el cookbook del autor es de 262K tokens con vision activada, aunque las mediciones de rendimiento se hicieron a 131K.

Es relevante ahora porque combina tres tendencias simultaneas: cuantizacion de 4 bits con muy poca perdida (divergencia KL de 0.034 frente al BF16 de referencia), soporte de hardware no-NVIDIA (Intel XPU mediante vLLM) y modelos sin guardarrailes. El propio autor advierte de que el modelo hereda la eliminacion de rechazos de su base y carece de protecciones internas significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen/Qwen3.8-27B (tag `qwen3_5`); transformer multimodal con torre de vision y cabeza MTP. Detalle completo de capas no disponible |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | Hasta 262K tokens con vision segun el cookbook del autor; mediciones realizadas a 131K maximo |
| Tipos de cuantizacion | GPTQ int4 asimetrico (`uint4`, grupo 128, `sym: false`, GPTQ v1 estandar). lm_head, capas MTP, torre de vision y `in_proj_a`/`in_proj_b` de GDN permanecen en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (GPTQ v1, qzeros almacenan z-1) |

## Arquitectura y entrenamiento

El modelo base es OBLITERATUS/Qwen3.8-27B-OBLITERATED, a su vez una version abliterada de Qwen/Qwen3.8-27B. La abliteration consiste en eliminar la direccion de rechazo en los pesos en lugar de aplicar un system prompt o un RLHF posterior; segun el autor de esta cuantizacion, ese comportamiento se conserva tras el proceso de cuantizacion. La arquitectura concreta no se detalla en la informacion disponible mas alla de tres elementos verificables: existe una torre de vision (pipeline image-text-to-text), existe una cabeza MTP que permite decodificacion especulativa con k=4, y existen capas denominadas GDN con proyecciones `in_proj_a` e `in_proj_b` que el autor decide no cuantizar.

La cuantizacion se realizo con `b70quant.py` del cookbook riceharvest/b70-qwen38-cookbook, capa por capa sobre una Intel Arc Pro B70, con un tiempo total de aproximadamente 55 minutos. Los hiperparametros declarados son: GPTQ con damping 0.01, act-order desactivado, cuantizacion asimetrica uint4 con escala y cero por grupo, y una busqueda de clipping sobre 11 ratios que minimiza `|err|^2.4`. La calibracion uso la mezcla publica del cookbook: 128 ventanas de 2048 tokens con texto conversacional/agentico, codigo y prosa tecnica, disjuntas de las ventanas de evaluacion. No se detalla el numero de tokens de entrenamiento del modelo base ni la composicion de su dataset.

## Capacidades

- Generacion de texto conversacional en modo chat y en modo base.
- Razonamiento y resolucion de problemas de varios pasos, incluyendo aritmetica (4/6 en el canario aritmetico del cookbook del autor, dato que el propio autor califica de ruido por empates en decodificacion greedy).
- Comprension de imagenes: la torre de vision se mantiene en BF16, por lo que la entrada image-text-to-text funciona sin degradacion por cuantizacion.
- Generacion de codigo: el autor reporta un rendimiento de ~90 tok/s en respuestas de codigo sobre una B70.
- Tool calling / function calling: el autor indica que el stack de despliegue ofrece soporte de llamadas a herramientas.
- Agentes y razonamiento multi-paso: la calibracion incluye texto agentico y el contexto de hasta 262K tokens permite mantener historiales largos.
- Decodificacion especulativa mediante la cabeza MTP con k=4, con aproximadamente 35 ms por paso de verificacion MTP.
- Sin rechazos: la abliteration se mantiene tras la cuantizacion y el modelo responde a peticiones que el modelo original rechaza.
- Capacidades multilingues: no disponible.

## Casos de uso

- Despliegue en hardware Intel Arc: el caso de uso principal y explicitamente buscado por el autor es servir un modelo multimodal de 27B en una unica Arc Pro B70 de 32 GB mediante vLLM XPU, sin necesidad de GPUs NVIDIA.
- Analisis de documentos tecnicos con imagenes: al conservar la torre de vision en BF16 y admitir 262K tokens de contexto, permite procesar manuales, diagramas y capturas junto con texto largo en una sola pasada.
- Asistente conversacional largo: el contexto extendido y el soporte multi-turno lo hacen adecuado para sesiones de chat prolongadas donde se necesita recordar decisiones tomadas miles de tokens atras.
- Generacion de codigo en produccion: con ~90 tok/s en tareas de codigo sobre B70 y soporte de tool calling, puede integrarse en pipelines de asistencia a programadores o revision automatica de parches.
- Agentes con llamada a herramientas: el stack de despliegue expone function calling, lo que permite construir agentes que consulten APIs o ejecuten comandos dentro de un bucle de razonamiento.
- Procesamiento batch de prosa tecnica: ~71 tok/s en prosa sobre una B70 permite tareas de resumen, reescritura o extraccion de informacion sobre volumenes moderados de documentacion.
- Investigacion sobre seguridad y alineacion: al ser un modelo abliterado con 0% de rechazo declarado en su base, sirve como sujeto de estudio para medir hasta que punto la cuantizacion preserva el comportamiento sin guardarrailes (siempre en entornos controlados y asumiendo la responsabilidad legal del uso).
- Prototipado de bajo coste en una sola GPU: la cuantizacion int4 reduce el peso a 19,6 GB de repositorio, lo que abarata el alojamiento frente al BF16 equivalente para experimentacion interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor si publica una evaluacion de fidelidad de la cuantizacion frente a los pesos BF16 originales, medida como divergencia KL sobre los top-20 logits en ventanas retenidas de 2048 tokens (menor es mejor):

| Modelo / receta | chat | codigo | prosa tecnica | global | Acuerdo top-1 |
|---|---|---|---|---|---|
| Esta cuantizacion (GPTQ int4 asim.) | 0.029 | 0.031 | 0.043 | 0.034 | 93,8% |
| Esta cuantizacion + lm_head fp8 (como se sirve en el cookbook) | 0.029 | 0.032 | 0.043 | 0.034 | 93,6% |
| Misma receta sobre Qwen3.8-27B stock | no disponible | no disponible | no disponible | 0.039 | no disponible |
| GPTQ int4 simetrico convencional | no disponible | no disponible | no disponible | 0.078 | no disponible |

Datos adicionales de rendimiento medidos por el autor en una B70 a 275 W, una peticion simultanea, decodificacion greedy, respuestas de 400 tokens y 131K de contexto maximo: ~90 tok/s en codigo, ~71 tok/s en prosa. Para el Qwen3.8-27B generico sobre el mismo stack se citan ~2.000 tok/s de prefill, ~35 ms por paso de verificacion MTP y 262K de contexto. En el canario aritmetico de 6 preguntas del cookbook la cuantizacion obtiene 4/6, identico al quant stock.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 19,6 GB, que es el minimo de pesos a cargar en memoria. A esto hay que sumar la cache KV, cuyo tamano concreto no se especifica en la informacion disponible; el autor usa cache KV en fp8.
- GPU objetivo declarada: una unica Intel Arc Pro B70 de 32 GB, a 275 W de fabrica.
- GPUs NVIDIA: el autor no ha probado el modelo en CUDA. Indica que, al ser GPTQ v1 asimetrico estandar, deberia cargar en GPTQModel, transformers y vLLM sobre CUDA, pero no lo garantiza.
- GPU de consumo: el modelo no ha sido validado en GPUs de consumo en la informacion disponible. Con 19,6 GB de pesos, una GPU de 24 GB dejaria muy poco margen para cache KV y activaciones a contextos largos.
- Opciones de despliegue: imagen preconstruida `ghcr.io/riceharvest/b70-vllm:latest` con vLLM XPU v0.31.0 y los parches y kernels de atencion para B70 ya incluidos; alternativamente el script `serve.sh` del repositorio riceharvest/b70-qwen38-cookbook. En CUDA, GPTQModel, transformers o vLLM sin validar.
- Advertencia de despliegue: vLLM XPU v0.31 sin parches no carga correctamente GPTQ asimetrico; es necesario el `patch_asym_gptq.py` del cookbook, que la imagen preconstruida ya incorpora.
- Latencia y throughput: ~90 tok/s en codigo y ~71 tok/s en prosa sobre una B70; ~35 ms por paso de verificacion MTP k=4; prefill de referencia ~2.000 tok/s (dato del modelo generico, no de esta cuantizacion).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B-OBLITERATED GPTQ int4 asym) | 27,78B | Hasta 262K segun cookbook | GPTQ int4 asimetrico, 19,6 GB | Apache-2.0 | HuggingFace, 0 descargas y 0 likes en el momento de redactar la ficha |
| OBLITERATUS/Qwen3.8-27B-OBLITERATED (base) | 27,78B (no confirmado en la informacion disponible) | No disponible | BF16, safetensors | Apache-2.0 | HuggingFace |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| Qwen/Qwen3.8-27B (stock, referencia de cuantizacion) | No disponible | No disponible | No disponible | No disponible | HuggingFace |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada; la unica comparacion numerica publicada es la divergencia KL frente a los pesos BF16 del propio modelo base.

## Limitaciones y advertencias

- Ausencia de guardarrailes: el modelo hereda la eliminacion total del comportamiento de rechazo de su base. El autor lo advierte explicitamente: "no tiene guardarrailes internos significativos".
- Riesgo de contenido nocivo: la model card del modelo base, segun las referencias web, declara un 0,0% de rechazo sobre 842 prompts daninos, con enfasis en capacidades de ciberataque y generacion de jailbreaks. Desplegarlo en abierto expone a generar contenido ilegal o danino.
- Perdida por cuantizacion: la divergencia KL global de 0.034 y un acuerdo top-1 del 93,8% implican que aproximadamente 6 de cada 100 tokens greedy difieren del BF16. En tareas de precision (aritmetica, codigo critico) esto puede degradar resultados.
- Canario aritmetico 4/6: el propio autor reconoce que esta prueba es ruidosa por empates en decodificacion greedy, por lo que no debe usarse como medida de capacidad matematica real.
- Compatibilidad de runtime limitada: solo probado en Intel XPU con vLLM XPU v0.31.0 mas parches. El soporte en CUDA es teorico. Cargarlo con vLLM XPU sin el parche produce resultados incorrectos.
- Idiomas: no se especifica que idiomas soporta ni con que calidad, lo que impide garantizar un rendimiento adecuado en castellano.
- Idiomas y contexto: el contexto de 262K depende de la configuracion del cookbook (cache KV en fp8, MTP k=4); no se garantiza ese maximo en otros stacks de despliegue.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero el usuario final sigue siendo responsable del contenido generado por un modelo sin filtros.
- Validacion comunitaria nula: 0 descargas y 0 likes en el momento de crear la ficha, creada y actualizada el mismo dia (15 de octubre de 2026), sin historial de uso reproducible por terceros.
- Procedencia: la model card del base describe el modelo como desarrollado por shivanandasai con la suite OBLITERATUS, mientras que esta cuantizacion la firma darioooooo0o. No hay verificacion independiente de la cadena completa de pesos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/darioooooo0o/Qwen3.8-27B-OBLITERATED-GPTQ-Int4-asym
- Modelo base: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED
- Variante abliterada alternativa (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Cookbook de despliegue en B70 (riceharvest): https://github.com/riceharvest/b70-qwen38-cookbook
- Cookbook de inferencia en Intel Arc Pro B70 (SergiioB): https://github.com/SergiioB/intel-arc-pro-b70-inference-cookbook
- Imagen Docker preconstruida: ghcr.io/riceharvest/b70-vllm:latest
- Perfil del autor en X: https://x.com/imdariotoo
- Analisis externo sobre la tasa de rechazo: https://www.explainx.ai/blog/pliny-qwen3-8-27b-obliterated-alex-finn-mac-august-2026
- Desglose tecnico del modelo abliterado: https://www.mindstudio.ai/blog/qwen3-27b-obliterated-uncensored-model
- Espejo en featherless.ai: https://featherless.ai/models/shivanandasai/Qwen3.8-27B-OBLITERATED
