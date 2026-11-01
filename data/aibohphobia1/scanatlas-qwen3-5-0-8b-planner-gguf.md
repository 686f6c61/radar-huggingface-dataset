# aibohphobia1/ScanAtlas-Qwen3.5-0.8B-Planner-GGUF

## Resumen

ScanAtlas-Qwen3.5-0.8B-Planner-GGUF es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-0.8B orientado especificamente a la planificacion de acciones dentro del asistente en dispositivo (on-device) de la aplicacion ScanAtlas. Lo desarrolla el usuario aibohphobia1 y se distribuye unicamente en formato GGUF cuantizado a Q4_0 para su uso con llama.cpp. No se trata de un modelo conversacional de proposito general: espera el prompt y la gramatica JSON propios de la aplicacion, por lo que su uso fuera de ese contexto no esta previsto por el autor.

El modelo parte de los pesos de texto de Qwen3.5-0.8B (752.393.024 parametros reales segun safetensors) y se obtiene mediante la fusion de un LoRA entrenado con ejemplos de planificacion de ScanAtlas. El resultado se cuantiza con llama.cpp build b11799. El repositorio ocupa aproximadamente 0,5 GB, lo que refleja el caracter compacto del modelo y su orientacion a ejecucion en movil.

Su relevancia actual radica en el nicho que ocupa: planificacion de acciones con salida estructurada (tool calling) en 15 idiomas sobre hardware de gama alta movil (Snapdragon 8 Gen 1), con una licencia permisiva Apache-2.0. Segun la model card, resuelve 338 de 356 tareas de evaluacion en un telefono con Snapdragon 8 Gen 1 a traves de la app, con un turno mediano de 3,1 s en 4 hilos de CPU, frente a 176 de 356 del modelo sin entrenar ejecutado en un PC.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B); detalles de atencion no disponibles |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (unica cuantizacion publicada en el repo) |
| Idiomas soportados | 15 idiomas (lista concreta no disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos originales en safetensors no publicados en este repo |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer de Qwen3.5-0.8B. Sobre esa base se entreno un LoRA con ejemplos de planificacion de ScanAtlas, que posteriormente se fusiono en los pesos de texto del modelo original. El pipeline completo es: Qwen3.5-0.8B (base) -> LoRA de planificacion -> fusion -> cuantizacion a Q4_0 con llama.cpp b11799. No se especifican en la model card el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion principal no es arquitectonica sino de producto: el modelo esta especializado en generar planes de accion en formato JSON conforme a una gramatica concreta, lo que permite restringir la decodificacion y obtener salidas parseables de forma fiable. El entrenamiento cubre 15 idiomas, aunque el autor advierte que las tareas de evaluacion en idiomas distintos del ingles no han sido revisadas por hablantes nativos.

## Capacidades

- Planificacion de acciones para el asistente de ScanAtlas: genera planes estructurados en JSON segun la gramatica de la app.
- Tool calling / function calling restringido al esquema de la aplicacion.
- Soporte multilingue: 15 idiomas (lista no disponible).
- Ejecucion en dispositivo (on-device) en movil de gama alta mediante llama.cpp.
- Salida estructurada: la gramatica JSON impuesta durante la inferencia limita el espacio de decodificacion.
- No es un modelo de chat general: fuera del prompt y la gramatica de ScanAtlas no ofrece un comportamiento conversacional fiable.

## Casos de uso

- Asistente on-device de ScanAtlas: el modelo planifica las acciones que la app debe ejecutar a partir de la entrada del usuario, respetando la gramatica JSON de la aplicacion. Es su caso de uso principal y el unico previsto por el autor.
- Planificacion de acciones en movil sin conexion: al ejecutarse con llama.cpp en 4 hilos de CPU sobre un Snapdragon 8 Gen 1, permite funcionalidad de asistente sin depender de la nube ni de conectividad.
- Integracion en pipelines de tool calling con salida JSON validada: la gramatica restringida reduce errores de formato, lo que facilita el parseo automatico de las acciones generadas.
- Prototipado de asistentes multilingues de bajo coste: con 752 millones de parametros y 0,5 GB de repo, sirve como base para experimentar con planificacion en 15 idiomas en hardware limitado.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente, los datos del usuario no salen del dispositivo, lo que encaja con aplicaciones sensibles a la privacidad.
- Evaluacion comparativa de ajustes finos pequenos para planificacion: su model card reporta una mejora de 176/356 a 338/356 tareas frente al modelo base, lo que lo convierte en una referencia util para estudiar el efecto del LoRA en tareas de planificacion estructurada.

## Benchmarks y rendimiento

La model card reporta una evaluacion propia sobre 356 tareas en 15 idiomas, no benchmarks estandar:

| Evaluacion | Entorno | Resultado |
|---|---|---|
| Tareas resueltas (ScanAtlas-Planner) | Snapdragon 8 Gen 1, app, 4 hilos de CPU | 338 / 356 |
| Tareas resueltas (modelo sin entrenar) | PC | 176 / 356 |
| Turno mediano | Snapdragon 8 Gen 1, 4 hilos de CPU | 3,1 s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La comparacion entre el modelo ajustado en movil y el modelo base en PC no es homogenea en cuanto a hardware, por lo que debe interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de una cuantizacion Q4_0 de un modelo de 752 millones de parametros, el peso de los pesos ronda los 0,4-0,5 GB; el consumo total depende del contexto y de la implementacion.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 2 GB de VRAM libre (por ejemplo, GTX 1650, RTX 3050 o superiores); tambien en CPU.
- Ejecucion en movil verificada: Snapdragon 8 Gen 1 con 4 hilos de CPU, con turno mediano de 3,1 s.
- Opciones de despliegue: llama.cpp (build b11799 o posterior, usado por el autor); otros runners compatibles con GGUF no estan verificados en la informacion disponible.
- Latencia y throughput: unico dato publicado, turno mediano de 3,1 s en Snapdragon 8 Gen 1 con 4 hilos de CPU; no hay datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ScanAtlas-Qwen3.5-0.8B-Planner-GGUF | 752.393.024 | no disponible | Apache-2.0 | GGUF (Q4_0) | Especializado en planificacion JSON para ScanAtlas; 338/356 tareas en movil |
| Qwen/Qwen3.5-0.8B (base) | no disponible en la informacion | no disponible | no disponible en la informacion | no disponible en la informacion | Modelo base sin ajuste; 176/356 tareas en la evaluacion del autor (en PC) |
| Otros modelos de ~0,8B para tool calling | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

La comparativa con alternativas de la misma categoria no puede completarse con datos verificados a partir de la informacion disponible.

## Limitaciones y advertencias

- No es un modelo de chat general: espera el prompt y la gramatica JSON de ScanAtlas; su uso fuera de ese contexto producira resultados poco fiables.
- Idiomas: cubre 15 idiomas, pero las tareas de evaluacion no inglesas no han sido revisadas por hablantes nativos, por lo que la calidad real en esos idiomas esta sin validar.
- Evaluacion limitada: la unica evaluacion publicada es la del autor (356 tareas), sin benchmarks estandar ni comparacion homogenea de hardware frente al modelo base.
- Riesgo de alucinacion: no se documenta en la model card; como todo modelo generativo, puede producir acciones no validas si la gramatica no las restringe.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible.
- Licencia: Apache-2.0 permite uso comercial, pero debe conservarse el fichero LICENSE incluido en el repositorio y respetarse las condiciones de la licencia del modelo base Qwen3.5-0.8B.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion por terceros.
- Cuantizacion unica: solo se publica Q4_0, lo que limita el ajuste fino entre calidad y velocidad en funcion del hardware.

## Enlaces

- HuggingFace: https://huggingface.co/aibohphobia1/ScanAtlas-Qwen3.5-0.8B-Planner-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- llama.cpp: no disponible en la informacion proporcionada (el autor cita el build b11799)
- Paper, blog o demo: no disponible en la informacion proporcionada
