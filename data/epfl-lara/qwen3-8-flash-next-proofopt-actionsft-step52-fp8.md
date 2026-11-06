# EPFL-LARA/Qwen3.8-Flash-Next-ProofOpt-ActionSFT-step52-FP8

## Resumen

Qwen3.8-Flash-Next-ProofOpt-ActionSFT-step52-FP8 es un ajuste fino mediante LoRA del modelo Qwen/Qwen3.8-Flash-Next, desarrollado por el laboratorio EPFL-LARA. El experimento entrena al modelo para realizar ediciones de prueba (proof editing) en Lean a traves de la herramienta Lemex, aprendiendo acciones concretas de optimizacion de demostraciones a partir de 364 ejemplos que cubren los 15 problemas objetivo del benchmark. No se trata de un modelo generalista nuevo, sino de una exportacion de pesos completa en FP8 nativo que incorpora un adaptador LoRA ya fusionado, orientada a un experimento muy acotado de optimizacion de pruebas formales.

El modelo conserva la arquitectura del Qwen3.8-Flash-Next original, con aproximadamente 180.000 millones de parametros totales segun los pesos en safetensors, y mantiene el tokenizador, la plantilla de chat, la configuracion de generacion y el formato de razonamiento y de llamadas a herramientas del modelo base. El repositorio ocupa 185,6 GB y contiene los pesos completos, por lo que no requiere cargar un adaptador separado. La licencia aplicable es la Qwen Community License 1.0.

Su relevancia es acotada pero interesante para la comunidad de razonamiento formal: demuestra un flujo de trabajo de ajuste fino por LoRA sobre un modelo grande con exportacion a FP8 nativo, fusion selectiva de proyecciones y verificacion en tiempo de ejecucion sobre GPUs A100. Conviene subrayar que los 15 problemas de evaluacion estan incluidos en el entrenamiento, de modo que las pruebas realizadas miden el ajuste sobre esos casos concretos y no la transferencia a problemas no vistos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen3.8-Flash-Next, con proyecciones de atencion y de red gated-delta (gated-delta-network) |
| Parametros totales | 179.999.981.459 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la ficha; las pruebas de runtime usan hasta 266.400 tokens de contexto con 250.016 de entrada y 16.384 de generacion |
| Tipos de cuantizacion | FP8 nativo (exportacion oficial del modelo base); pesos BF16 en las 84 proyecciones entrenadas fusionadas |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (FP8 nativo, pesos completos) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-Flash-Next en BF16 (revision de4b8e4d43b917e7706784d8bb445c9af86a3540) y aplica un LoRA nuevo de rango 32, alpha 64 y dropout 0 sobre las proyecciones de atencion y de red gated-delta. El entrenamiento consistio en una sola epoca sobre 364 ejemplos, con 52 actualizaciones, batch efectivo de 7 y tasa de aprendizaje de 1e-5 con calentamiento de cinco pasos y decaimiento coseno hasta 1e-6. Se procesaron 2.516.104 tokens, de los cuales 224.624 recibieron supervision, con una secuencia maxima de 13.435 tokens y cero truncamiento. El entrenamiento se ejecuto en ocho GPUs B300 y la perdida final de entrenamiento fue de 0,1377130001783371, un valor de ajuste, no una puntuacion de benchmark.

Los datos contienen 349 acciones de mejora aceptadas y 15 atajos de estado original a final. No se anadieron anotaciones de razonamiento sinteticas: solo las acciones de herramienta del asistente y su cierre de turno nativo reciben perdida, mientras que el contexto, las respuestas de herramientas y los tokens de andamiaje de pensamiento vacio quedan enmascarados. Las acciones fallidas no reciben supervision. Para la exportacion FP8, las 84 proyecciones BF16 entrenadas se fusionaron con PEFT 0.20 en CPU sobre las exclusiones BF16 del modelo FP8 nativo oficial (revision 236dfdf285828023ca3bcd3f37366c58a3469b13), cambiando 36 de los 131 shards de pesos; el resto de tensores, incluidos los expertos cuantizados, permanece identico byte a byte al modelo base fijado.

## Capacidades

- Generacion de texto y conversacion multi-turno heredadas del modelo base Qwen3.8-Flash-Next.
- Razonamiento con flujo de pensamiento nativo (thinking mode) y niveles de esfuerzo, verificado en pruebas con esfuerzo `xhigh`.
- Llamadas a herramientas nativas (tool calling / function calling), incluida la ejecucion de comandos de shell a traves de clientes nativos.
- Edicion y optimizacion de demostraciones en Lean mediante la herramienta Lemex, que es el objetivo especifico del ajuste.
- Procesamiento de contextos largos: las pruebas de runtime alcanzaron 250.016 tokens de entrada y 16.384 de generacion dentro de una ventana de 266.400 tokens, con diez flujos concurrentes y cero preempciones de cache KV.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Optimizacion de pruebas Lean en entornos de investigacion: el modelo aprende a proponer acciones de edicion que transforman una demostracion original en una version final mas eficiente, usando la herramienta Lemex como interfaz. Es adecuado para experimentos acotados sobre los 15 problemas objetivo del conjunto de entrenamiento.
- Automatizacion de flujos de demostracion formal en pipelines de verificacion: al conservar el formato nativo de llamadas a herramientas, puede integrarse en un cliente Lemex que ejecute comandos y devuelva respuestas de herramienta en cada turno.
- Servicio de inferencia con contextos muy largos: la verificacion de diez flujos concurrentes de 250.016 tokens de entrada sugiere su uso en escenarios que requieren mantener estados de prueba extensos y multiples sesiones simultaneas.
- Experimentacion con ajuste fino por LoRA sobre modelos de gran tamano: sirve como referencia reproducible de un flujo completo que va del entrenamiento LoRA a la fusion selectiva y exportacion FP8 nativa.
- Evaluacion de retencion de capacidades tras ajuste fino: util para estudiar como un adaptador compartido afecta al razonamiento y al comportamiento de herramientas del modelo base, dado que la model card advierte que estas elecciones de diseno no garantizan por si solas la retencion de capacidades.
- Despliegue en infraestructura con GPUs A100 80GB: las pruebas de runtime se realizaron con cuatro A100 80GB y paralelismo de tensores 4, lo que lo hace util para entornos de investigacion con ese hardware.
- Pruebas de integracion de clientes de herramientas: los 10 clientes nativos de herramientas ejecutaron correctamente los comandos de shell solicitados, lo que permite validar integraciones de agentes antes de desplegar en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ha ejecutado un benchmark completo de optimizacion de pruebas para esta exportacion y que las comprobaciones realizadas son de runtime y de humo, no un benchmark amplio de razonamiento ni una comparacion pareada contra el modelo base. Los resultados de verificacion reportados son los siguientes:

| Prueba de runtime | Resultado |
|---|---|
| Casos de probabilidad con entrada completa | 16/16 correctos, IDs de tokens exactos, probabilidades finitas y sin truncamiento |
| Problemas pequenos de razonamiento | 3/3 correctos con flujos de razonamiento no vacios a esfuerzo `xhigh` |
| Flujos concurrentes de contexto completo | 10/10, 250.016 tokens de entrada y 16.384 de generacion cada uno, cero preempciones de cache KV |
| Clientes nativos de herramientas | 10/10 ejecutaron el comando de shell solicitado y completaron el turno nativo |
| Perdida final de entrenamiento | 0,1377130001783371 (metrica de entrenamiento, no benchmark) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio pesa 185,6 GB en FP8, por lo que se requiere un entorno multi-GPU para cargar los pesos completos.
- GPUs verificadas: cuatro A100 80GB con paralelismo de tensores 4, paralelismo de expertos, MTP con tres tokens especulativos, kernels Marlin FP8 y descarga de PLE a CPU.
- Hardware de entrenamiento: ocho GPUs B300.
- No cabe en GPUs de consumo (RTX 4090, etc.) dado el tamano de los pesos y la configuracion multi-GPU necesaria.
- Opciones de despliegue: entorno Lemex/vLLM fijado por el proyecto; el repositorio no incluye ese entorno de runtime. Para reproducir las pruebas hay que servir los pesos con el alias nativo esperado por el perfil existente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-ProofOpt-ActionSFT-step52-FP8 | 179.999.981.459 | no disponible (pruebas hasta 266.400) | qwen-community-1.0 | Hugging Face, pesos completos FP8 | Ajuste LoRA especifico para optimizacion de pruebas Lean |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | qwen-community-1.0 | Hugging Face | Modelo base del ajuste, sin especializacion en Lean |
| Qwen/Qwen3.8-Flash-Next-FP8 | no disponible | no disponible | qwen-community-1.0 | Hugging Face | Version FP8 nativa oficial sobre la que se fusiona el adaptador |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- Los 15 problemas de evaluacion estan incluidos en el entrenamiento; las pruebas miden el ajuste sobre esos casos y no la transferencia a problemas no vistos.
- No se ha ejecutado un benchmark completo de optimizacion de pruebas para esta exportacion.
- Las comprobaciones de runtime son de humo y no establecen la retencion general de capacidades, la correccion de las pruebas Lean ni una mejora en benchmarks.
- Aunque el andamiaje de pensamiento vacio se enmascaro durante el entrenamiento, los parametros compartidos del adaptador pueden afectar al razonamiento y al comportamiento de herramientas; la model card advierte que estas elecciones no garantizan por si solas la retencion de capacidades.
- No se ejercio la compactacion real de contexto en las pruebas.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplican los riesgos generales del modelo base.
- Idiomas soportados: no disponibles.
- Restricciones de licencia: el uso esta sujeto a la Qwen Community License 1.0, que puede imponer condiciones para uso comercial; consultar el archivo LICENSE del repositorio.
- El repositorio no incluye el entorno de runtime Lemex/vLLM necesario para reproducir las pruebas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EPFL-LARA/Qwen3.8-Flash-Next-ProofOpt-ActionSFT-step52-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Modelo base FP8: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- Model card del modelo base conservada en el repositorio: BASE_MODEL_README.md
- Datos de validacion de la exportacion: export_validation.json
- Licencia: LICENSE (Qwen Community License 1.0)
