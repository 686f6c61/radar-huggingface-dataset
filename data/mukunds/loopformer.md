# mukunds/loopformer

## Resumen

LoopFormer es un modelo experimental de ejecucion recurrente de punteros publicado por el usuario mukunds en HuggingFace. No es un modelo de proposito general: se trata de un transformer recurrente personalizado construido sobre Qwen/Qwen2.5-0.5B-Instruct que resuelve una unica familia de tareas, seguir una tabla de reglas A-Z suministrada por el usuario y recorrerla durante un numero de pasos determinado. El checkpoint publicado esta congelado con el identificador `controller-shared-number-precision-seed83` y requiere obligatoriamente el codigo de inferencia en Python incluido en el repositorio; la generacion estandar con `AutoModelForCausalLM` no implementa su recurrencia.

La relevancia del modelo es fundamentalmente de investigacion. Aporta un banco de pruebas acotado para estudiar transformers recurrentes con estado compartido, mecanismos de parada aprendidos y ejecucion iterativa profunda (hasta 256 pasos) con una metrica de correccion verificable, algo poco habitual en modelos de lenguaje convencionales. En el panel final congelado de 1.350 grafos nuevos reporta un 97,81% de acierto en letra final mas parada exacta sobre 345.600 consultas grafo/contador, y un 96,89% de trayectorias completas hasta profundidad 256.

El modelo tiene un tamano de aproximadamente 0,5 mil millones de parametros, heredados del modelo base, con un repositorio de 0,7 GB. Se publica sin licencia declarada, sin datos de entrenamiento ni estado del optimizador, y con 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente personalizado sobre Qwen2.5-0.5B-Instruct: 6 capas prelude, 12 capas intermedias compartidas en bucle y 6 capas coda |
| Parametros totales | Aproximadamente 0,5 mil millones (heredados del modelo base Qwen2.5-0.5B-Instruct) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; el bucle esta limitado por defecto a 256 pasos solicitados, con tope de seguridad de 272 |
| Tipos de cuantizacion | No disponible; la inferencia por defecto es FP32 con SDPA y umbral 0,5 |
| Idiomas soportados | en (ingles) segun los tags de la model card; el vocabulario del ejecutor es exactamente A-Z |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (`adapter_model.pt`) mas la revision fijada del modelo base Qwen2.5-0.5B-Instruct |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct, revision `7ae557604adf67be50417f59c2c2f167def9a775` |
| Checkpoint publicado | `controller-shared-number-precision-seed83` (congelado) |
| Tamano del repositorio | 0,7 GB |
| Fecha de publicacion | 11 de octubre de 2026 (creado y actualizado el mismo dia) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen2.5-0.5B-Instruct y reorganiza sus capas en tres bloques funcionales. Seis capas prelude preparan el prompt; doce capas intermedias compartidas actualizan un estado de trabajo recurrente; y seis capas coda leen una distribucion sobre las 26 letras despues de cada ciclo. Un puente entrenado vuelve a entrar en el bloque intermedio compartido y la memoria de prefijo fija se reutiliza dentro de cada ejecucion. El ejecutor final adapta todos los pesos R y congela P/C.

El campo `steps` de la peticion se enruta fuera del ejecutor. Un lector de numeros compartido y entrenado inicializa un temporizador escalar independiente, cuya recurrencia afina aprendida y cuya lectura de parada determinan la finalizacion. La probabilidad de parada es una senal de temporizacion, no una estimacion de correccion, y ni las predicciones decodificadas ni los estados de referencia se realimentan en la recurrencia. La supervision del ejecutor uso profundidades 1-6, 8, 10 y 12, mientras que el ajuste del controlador uso recuentos de 1 a 63 excluyendo 9, 17, 29, 41 y 53, con desenrollados supervisados limitados a 12. El artefacto `adapter_model.pt` contiene todos los tensores adaptados del ejecutor y del controlador, no solo pesos LoRA, y se distribuye con hash SHA-256 `0f8a3f2572ec2caf4fafbcdd074b5283bd8c610602502763b3c04487ce1f123d`. No se incluyen ni el estado del optimizador ni los datos de entrenamiento.

En el plano de runtime, la version descargable usa PyTorch 2.14.0 de investigacion, mientras que el Space en HF ZeroGPU requiere PyTorch 2.13.0. Los 280 resultados intermedios comprobados, los resumenes de parada y las probabilidades de parada coincidieron con las ejecuciones guardadas y auditadas en ese runtime alojado, si bien el autor advierte que se trata de una comprobacion acotada y no de una equivalencia de poblacion completa.

## Capacidades

- Ejecucion de tablas de reglas A-Z: recibe un mapeo de 26 pares ordenados `[origen, destino]`, una letra de inicio y un numero de pasos, y devuelve la letra resultante tras recorrer la cadena.
- Recurrencia profunda: mantiene un estado de trabajo compartido a lo largo de hasta 256 pasos solicitados (tope de seguridad de 272), con lectura de una distribucion sobre 26 letras en cada ciclo.
- Parada aprendida: un temporizador escalar con recurrencia afina determina cuando termina la ejecucion; la parada exacta alcanza el 100% en el panel finito de recuentos evaluado.
- Salida incremental verificable: cada linea de salida es una instantanea JSON acumulativa de las predicciones reales del modelo, y la ultima linea incluye metricas separadas de correccion y de parada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso general: no disponible; el modelo ejecuta una unica familia de tareas y el autor indica explicitamente que no constituye evidencia de razonamiento general ni de transferencia.
- Capacidades multilingues: no disponible; el unico tag de idioma es `en` y el vocabulario operativo del ejecutor esta restringido a A-Z.
- Vision, audio o thinking mode: no disponible.

## Casos de uso

- Investigacion en transformers recurrentes: el modelo permite medir como se comporta un bloque intermedio compartido con estado recurrente frente a un transformer convencional de profundidad fija, usando una tarea con metrica objetiva (letra final y parada exacta) en lugar de evaluacion subjetiva.
- Benchmark de pointer chasing como proxy de computacion en profundidad: al recorrer cadenas de hasta 256 pasos, sirve para estudiar si un modelo puede ejecutar composiciones largas de operaciones sin degradar la precision, dentro del rango evaluado.
- Validacion de mecanismos de parada aprendidos: el temporizador escalar con recurrencia afina permite comparar estrategias de parada (umbral 0,5, `--max-steps` y `--loop-cap`) y estudiar la diferencia entre senal de temporizacion y certeza de correccion.
- Pruebas de sensibilidad numerica y de kernel: dado que el autor advierte que cambios de precision, runtime, hardware o kernels requieren validacion contra las lecturas intermedias nativas, el modelo es util como caso de prueba para verificar reproducibilidad entre FP32, CUDA, CPU y MPS.
- Reproduccion de experimentos academicos: el repositorio incluye el codigo de inferencia, el grafo de ejemplo y las dependencias validadas, lo que permite reproducir el panel de evaluacion y auditar las cifras publicadas.
- Generacion y validacion de grafos sinteticos: el playground exporta peticiones JSON con `mapping`, `start` y `steps`, de modo que se pueden construir baterias de grafos funcionales para evaluar rutinas de enrutamiento o tablas de decision simbolicas.
- Estudio de generalizacion fuera de distribucion: la supervision del ejecutor cubre profundidades 1-6, 8, 10 y 12, mientras que la evaluacion llega a 256, lo que permite analizar como extrapola el modelo mas alla de las profundidades vistas durante el entrenamiento.
- Docencia de arquitecturas recurrentes: el desglose prelude / bucle compartido / coda y la separacion entre ejecutor y controlador son un ejemplo didactico de como adaptar un modelo preentrenado pequeno a una tarea algoritmica concreta.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el panel final congelado de 1.350 grafos nuevos y peticiones de 1 a 256:

| Metrica | Resultado | Base de calculo |
|---|---|---|
| Letra final mas parada exacta | 97,81% | 345.600 consultas grafo/contador |
| Trayectorias completas hasta profundidad 256 | 96,89% | 1.308 de 1.350 grafos |
| Parada exacta | 100% | Panel finito de recuentos solicitados |
| Coincidencia con ejecuciones auditadas guardadas | 280 resultados intermedios, resumenes y probabilidades de parada | Runtime alojado con PyTorch 2.13.0 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor senala ademas que los resultados numericos del controlador en horizontes largos son distintos de ejecutar grafos correctamente, que los grafos editados a mano pueden fallar y que se trata de una unica familia de tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia de calculo, un modelo de aproximadamente 0,5 mil millones de parametros en FP32 ocupa del orden de 2 GB solo en pesos, a lo que hay que sumar el modelo base de Qwen y las activaciones recurrentes; el repositorio completo ocupa 0,7 GB.
- GPU recomendadas: no disponible. El script de demostracion acepta `--device cuda`, por lo que cualquier GPU compatible con la version de PyTorch instalada es en principio utilizable, pero el autor no especifica modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada explicitamente. El tamano de parametros es reducido y es plausible que quepa en GPU de consumo, pero no hay validacion publicada al respecto en la informacion disponible.
- Otras opciones de dispositivo: `--device cpu` y `--device mps` estan disponibles, pero el autor advierte que su latencia y su fidelidad respecto al checkpoint final deben medirse en el dispositivo elegido.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI en su forma actual, ya que requiere el codigo Python incluido (`python -m scripts.demo`) y la recurrencia no esta implementada en `AutoModelForCausalLM`. El flujo previsto es `hf download` del repositorio, instalacion de `requirements.txt` y ejecucion del script con un `graph.json`.
- Descarga adicional: la primera ejecucion necesita la opcion `--download` para obtener la revision fijada del modelo base Qwen.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La informacion disponible no identifica modelos comparables de la misma categoria (ejecucion recurrente de tablas de punteros sobre un transformer pequeno). La unica referencia directa es el modelo base del que hereda los pesos.

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LoopFormer (mukunds/loopformer) | Aproximadamente 0,5 mil millones | No disponible; bucle de 256 pasos por defecto | Ejecucion de tablas de reglas A-Z con controlador de parada | no disponible | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen2.5-0.5B-Instruct | Aproximadamente 0,5 mil millones | No disponible en la informacion proporcionada | Asistente general ajustado por instrucciones | No disponible en la informacion proporcionada | Modelo base referenciado por LoopFormer |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Alcance muy restringido: el modelo sigue una tabla de reglas A-Z y nada mas. El propio autor indica que es una unica familia de tareas y que no constituye evidencia de razonamiento general ni de transferencia.
- Dependencia de codigo personalizado: `AutoModelForCausalLM` no implementa la recurrencia, por lo que sin el codigo Python incluido el modelo no funciona. Esto descarta los runners estandar y complica el despliegue en produccion.
- Sensibilidad a precision, runtime, hardware y kernels: cualquier cambio en estos factores necesita validarse contra las lecturas intermedias nativas.
- Grafos editados a mano pueden fallar: no hay garantia de correccion fuera de la distribucion evaluada.
- La probabilidad de parada no mide correccion: es una senal de temporizacion. No debe interpretarse como confianza en la respuesta.
- Limite de horizonte: el techo por defecto es de 256 pasos solicitados con tope de seguridad de 272. Aumentar `--max-steps` y `--loop-cap` permite explorar rollouts mas largos, pero no establece precision mas alla de los 256 pasos evaluados.
- Ambiguedad entre pasos y nodos: el vocabulario de simbolos es exactamente A-Z, de modo que 256 pasos no equivalen a 256 nodos distintos.
- Distincion entre controlador y ejecutor: los resultados numericos del controlador en horizontes largos no implican que los grafos se ejecuten correctamente.
- Idiomas: el unico idioma declarado es el ingles y el vocabulario operativo esta limitado a las letras A-Z; no hay capacidades multilingues.
- Licencia no declarada: al no especificarse licencia, no hay autorizacion explicita para uso comercial. Es un riesgo juridico relevante antes de cualquier uso en produccion.
- Ausencia de datos de entrenamiento y de estado del optimizador: no se puede auditar la composicion del dataset ni reproducir el entrenamiento completo.
- Sin senales de adopcion: 0 descargas y 0 likes, y sin resultados de benchmarks estandar publicados, lo que limita la comparabilidad frente a otros modelos.
- Sesgos conocidos: no disponible; no se documentan analisis de sesgo en la informacion proporcionada.
- Riesgo de alucinacion: no evaluado en la informacion disponible; la tarea es simbolica y cerrada, por lo que el modo de fallo esperado es la ejecucion incorrecta de la cadena mas que la generacion de contenido falso.
- Verificacion acotada: la coincidencia con las ejecuciones auditadas cubre 280 predicciones intermedias y no equivale a una equivalencia de poblacion completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mukunds/loopformer
- Codigo fuente y evidencia completa: https://github.com/MukundShankar-dev/loopformer
- Playground interactivo: https://mukundshankar-dev.github.io/projects/loopformer/demo/
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
