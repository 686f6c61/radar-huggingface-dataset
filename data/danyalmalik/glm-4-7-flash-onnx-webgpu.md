# danyalmalik/GLM-4.7-Flash-ONNX-WebGPU

## Resumen

GLM-4.7-Flash-ONNX-WebGPU es una conversion a ONNX del modelo zai-org/GLM-4.7-Flash, publicada por el usuario danyalmalik. El objetivo del repositorio no es reentrenar ni afinar el modelo, sino reempaquetarlo para que pueda ejecutarse directamente en un navegador web mediante el backend WebGPU de ONNX Runtime Web, tal y como lo consume la herramienta Quick Inference. El modelo base es un transformer de tipo mezcla de expertos (MoE) de 30B parametros totales con aproximadamente 3B activos, segun la denominacion 30B-A3B que aparece en la documentacion publica del modelo original.

La relevancia de esta ficha esta en que representa una via poco habitual de despliegue: inferencia de un modelo de 30B en el propio navegador del usuario, sin servidor dedicado, apoyandose en WebGPU. Para ello el autor cuantiza las capas lineales y los expertos enrutados a 4 bits, mantiene embeddings, activaciones y cache KV en float16 y elimina la capa de prediccion multi-token del modelo original. El resultado son pesos modificados cuyas salidas son cercanas, pero no identicas, a las del modelo de referencia.

La licencia es MIT, heredada del modelo base, y el repositorio ocupa 17,7 GB. No se han publicado benchmarks, idiomas soportados ni longitud de contexto en la informacion disponible, por lo que buena parte de las especificaciones detalladas mas abajo figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `glm4_moe_lite`); exportado a ONNX con atencion multi-head latent attention en forma absorbida |
| Parametros totales | 30B (correspondientes al modelo base zai-org/GLM-4.7-Flash) |
| Parametros activos | 3B (segun la denominacion A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Capas lineales y expertos enrutados a 4 bits (round to nearest, block size 32); embeddings, activaciones y cache KV en float16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (layout de ONNX Runtime GenAI: `input_ids`, `attention_mask`, `past_key_values.*` como entrada; `logits`, `present.*` como salida) |

## Arquitectura y entrenamiento

El modelo es una conversion, no un entrenamiento nuevo. El autor ha exportado el decodificador a ONNX con el layout de ONNX Runtime GenAI mediante el exportador propio de Quick Inference, de modo que las entradas son `input_ids`, `attention_mask` y `past_key_values.*`, y las salidas son `logits` y `present.*`. La atencion se guarda en la forma absorbida de multi-head latent attention: la cache KV contiene el latente normalizado de 512 dimensiones junto con la clave rotatoria de 64 dimensiones (una unica cabeza compartida de 576 dimensiones), y las proyecciones de clave y valor de `kv_b_proj` se pliegan dentro de la proyeccion de consulta y de `o_proj`. Este plegado reduce el coste de memoria y computo de la atencion durante la decodificacion, algo critico cuando el modelo debe caber en la memoria de una GPU de consumo accesible desde el navegador.

La cuantizacion aplicada es de 4 bits con redondeo al mas cercano y tamano de bloque 32 para las capas lineales, y tambien 4 bits para los expertos enrutados a traves del operador QMoE. Los embeddings, las activaciones y la cache KV se mantienen en float16. Ademas, se ha eliminado la capa de prediccion multi-token (multi-token-prediction), presente en el modelo original, lo que reduce coste pero tambien cambia ligeramente el comportamiento generativo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base zai-org/GLM-4.7-Flash.
- Razonamiento en tareas de codigo y agentes, segun la descripcion publica del modelo base ("strong performance in coding, reasoning, and agent-based tasks").
- Inferencia en navegador: la capacidad diferencial de esta version es ejecutar el decodificador completo sobre el backend WebGPU de ONNX Runtime Web.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: descrito para el modelo base, no verificado especificamente en esta conversion.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible. Se sabe que la capa de prediccion multi-token ha sido eliminada respecto al original.

## Casos de uso

- Asistentes embebidos en aplicaciones web: al ejecutarse con WebGPU dentro del navegador, el modelo permite ofrecer generacion de texto sin enviar datos a un servidor, lo que resulta util en escenarios con requisitos de privacidad o cuando no se quiere mantener infraestructura de inferencia.
- Demos y prototipos de producto: un equipo puede integrar un modelo MoE de 30B en una web de demostracion sin desplegar GPU en la nube, reduciendo coste y latencia de red en la primera fase de validacion.
- Herramientas de escritorio o aplicaciones Electron: el mismo pipeline ONNX + WebGPU puede incrustarse en aplicaciones de escritorio basadas en tecnologias web, aprovechando la GPU local del usuario.
- Procesamiento de texto offline en el cliente: redaccion, resumen o reescritura de documentos que no deben salir del dispositivo, con la cache KV en float16 como principal consumidor de memoria durante sesiones largas.
- Educacion y entornos de laboratorio: permite a estudiantes e investigadores experimentar con un modelo MoE grande sin acceso a clústeres, ya que basta una GPU compatible con WebGPU y suficiente VRAM.
- Investigacion sobre cuantizacion y despliegue: sirve como referencia para estudiar el impacto de la cuantizacion a 4 bits con block size 32 y del plegado de la atencion absorbida sobre la calidad de salida frente al modelo original.
- Evaluacion comparativa de runtimes en navegador: util para medir throughput y consumo de memoria de ONNX Runtime Web frente a otras alternativas de despliegue local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo esta pensado para ONNX Runtime Web con backend WebGPU, por lo que requiere un navegador con soporte de WebGPU y una GPU compatible con ese estandar.
- Tamano del repositorio: 17,7 GB, que corresponde al conjunto de pesos ONNX cuantizados a 4 bits mas los tensores en float16.
- VRAM estimada: no disponible de forma oficial. Partiendo del tamano de pesos a 4 bits de un modelo de 30B y de la cache KV en float16, la estimacion razonable se situa por encima de los 16 GB, sin contar el margen para activaciones y contexto. Es una estimacion derivada, no un dato publicado.
- GPU recomendadas: no disponibles de forma explicita. Por el volumen estimado de memoria, encajaria en tarjetas de gama alta con 24 GB o mas (por ejemplo, RTX 4090 o RTX 5090), siempre que el navegador exponga correctamente WebGPU sobre esa GPU.
- Compatibilidad con GPU de consumo: probable en modelos con 24 GB o mas de VRAM, segun la estimacion anterior; no confirmado por el autor.
- Opciones de despliegue: ONNX Runtime Web (WebGPU) es el destino declarado. Al ser pesos ONNX, podrian usarse tambien con otros runtimes compatibles con ONNX, aunque no se documenta en la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| danyalmalik/GLM-4.7-Flash-ONNX-WebGPU | 30B totales, 3B activos (base) | ONNX (ORT GenAI) | 4 bits en lineales y expertos, float16 en embeddings/activaciones/KV | MIT | Repositorio de 17,7 GB, orientado a WebGPU |
| zai-org/GLM-4.7-Flash | 30B totales, 3B activos (A3B MoE) | no disponible | no disponible | no disponible | Modelo base en Hugging Face |
| zai-org/GLM-4.7 | no disponible | no disponible | no disponible | no disponible | Version completa de la familia en Hugging Face |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Son archivos modificados: el propio autor advierte de que las salidas son cercanas, pero no identicas, a las del modelo original. No debe asumirse equivalencia exacta en tareas sensibles.
- Cuantizacion agresiva: las capas lineales y los expertos enrutados estan a 4 bits con block size 32, lo que puede degradar la calidad en tareas de razonamiento fino, matematicas o generacion de codigo largo en comparacion con pesos de mayor precision.
- Capa de prediccion multi-token eliminada: se pierde una parte del comportamiento del modelo original, lo que puede afectar a la velocidad de decodificacion o a la coherencia en generaciones largas.
- Dependencia de WebGPU: el despliegue depende de que el navegador y la GPU del usuario expongan WebGPU de forma estable; en entornos sin soporte el modelo no es ejecutable por esta via.
- Requisitos de memoria elevados: con pesos de 17,7 GB y cache KV en float16, un modelo de 30B cuantizado a 4 bits sigue necesitando una GPU de gama alta, lo que limita su uso en equipos de consumo medios.
- Idiomas soportados y longitud de contexto: no estan documentados en esta conversion, por lo que no se puede garantizar cobertura multilingue ni sesiones de contexto largo.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas de fidelidad para esta conversion; al ser un modelo generativo, el riesgo de alucinacion existe y no ha sido cuantificado.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones de la licencia del modelo base y las atribuciones correspondientes.
- Sin benchmarks publicados: no hay datos que permitan comparar objetivamente esta conversion con el modelo original ni con alternativas.
- Adopcion nula en el momento de la ficha: 0 descargas y 0 likes, por lo que no existe validacion por parte de la comunidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/danyalmalik/GLM-4.7-Flash-ONNX-WebGPU
- Modelo base: https://huggingface.co/zai-org/GLM-4.7-Flash
- Variante GLM-4.7: https://huggingface.co/zai-org/GLM-4.7
- Imagen Docker de GLM-4.7-Flash: https://hub.docker.com/r/ai/glm-4.7-flash
- Guia de ejecucion local (Guvi): https://www.guvi.in/blog/run-glm-4-7-flash-locally/
- Guia de ejecucion local (Codecademy): https://www.codecademy.com/article/run-glm-4-7-flash-locally
