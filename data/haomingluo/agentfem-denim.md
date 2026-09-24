# HaomingLuo/AgentFEM-DENIM

## Resumen

AgentFEM-DENIM es un modelo constitutivo de tipo "caja gris" (gray-box) para plasticidad J2 de pequenas deformaciones con dependencia de trayectoria, desarrollado por el usuario HaomingLuo en el contexto del proyecto AgentFEM. No es un modelo de lenguaje: es un componente de calculo tensional que se integra en flujos de elementos finitos (FEM) para predecir la respuesta tension-deformacion de un material sintetico fijo bajo historias de carga no proporcionales. DENIM son las siglas de Discrete-Energy Neural Internal-variable Model, y su propuesta central es mantener explicita toda la fisica conocida (elasticidad, superficie de fluencia, flujo asociativo, incompresibilidad plastica, incrementos plasticos no negativos y mapa de retorno implicito) y delegar en componentes neuronales unicamente el cierre de las leyes de endurecimiento isorro y cinematico desconocidas.

La relevancia del checkpoint es metodologica: se plantea como un test de "fisica incompleta". El material de referencia de AgentFEM tiene tres canales de memoria cinematica y una tabla de endurecimiento isorro por tramos lineales; este checkpoint dispone solo de dos canales de memoria y no recibe ni las ecuaciones ni los parametros de referencia. El segundo estado aprendido debe cerrar dos escalas temporales no resueltas. Con solo 918 parametros entrenables, el modelo alcanza un RMSE de 1,136 MPa y un R2 de 0,999902 en dos familias completas de trayectorias no proporcionales reservadas para evaluacion, frente a 76,988 MPa de una GRU de 49.254 parametros en el mismo protocolo.

Se distribuye como un checkpoint de PyTorch bajo licencia Apache 2.0, con 0 descargas y 2 "likes" en el momento de la consulta, y con el conjunto de datos asociado (AgentFEM-Material-Loading-Memory) publicado por separado. Su orientacion es de investigacion en physics-informed machine learning aplicado a mecanica de solidos, no de despliegue comercial de inferencia de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo constitutivo gray-box hibrido: esqueleto de plasticidad J2 explicito (retorno implicito) mas cierre neuronal de endurecimiento isorro y cinematico (DENIM) |
| Parametros totales | 918 parametros entrenables |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada de trayectoria con forma [batch, steps, 6]) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica: modelo numerico constitutivo) |
| Licencia | apache-2.0 |
| Formato de pesos | checkpoint de PyTorch (`denim.pt`) cargado con `torch.load`; incluye `config.json` con constantes del material y contrato de arquitectura |
| Autor | HaomingLuo |
| ID en HuggingFace | HaomingLuo/AgentFEM-DENIM |
| Libreria | pytorch |
| Dataset asociado | HaomingLuo/AgentFEM-Material-Loading-Memory |
| Canales de memoria cinematica | 2 (la referencia AgentFEM tiene 3) |
| Entrada | Deformacion `strain` con forma [batch, steps, 6] en orden Voigt de cizalladura tensorial xx, yy, zz, xy, yz, xz |
| Constantes conocidas de entrada | `young`, `poisson`, `yield_stress` |
| Salida | Campo de tension (`result["stress"]`) |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 2 |
| Fecha de creacion / actualizacion | 2026-09-24 / 2026-09-24 |

## Arquitectura y entrenamiento

DENIM es un modelo hibrido de energia discreta con variables internas neuronales. La parte blanca del modelo implementa de forma explicita la elasticidad, la geometria de la superficie de fluencia, el flujo asociativo, la incompresibilidad plastica, la no negatividad de los incrementos plasticos y el mapa de retorno implicito. La parte neuronal se limita al cierre de las leyes de endurecimiento isorro y cinematico, que en el material de referencia son desconocidas para este checkpoint. El modelo se instancia con `DENIM(channels=2)`, es decir, con dos canales de memoria cinematica en lugar de los tres del material de referencia, de modo que el segundo estado aprendido asume el papel de dos escalas temporales de referencia no resueltas. La prediccion se realiza mediante la funcion `rollout(strain, young, poisson, yield_stress, model)`, que ejecuta la integracion sobre la secuencia de deformaciones.

El checkpoint se entrena con supervision de alta fidelidad sobre el estado interno, segun indica la model card. No se especifican en la informacion disponible el numero de muestras, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO (categorias que, por otra parte, no aplican a este tipo de modelo). El material es sintetico y fijo: no es una calibracion experimental. Las innovaciones tecnicas destacables son la conservacion a nivel de arquitectura de la fisica constitutiva conocida, el uso de un mapa de retorno implicito combinado con cierre neuronal, y la incorporacion de un mecanismo de fallback global con region de confianza (trust-region) para casos ciclicos severos.

## Capacidades

- Prediccion de tension bajo plasticidad J2 de pequenas deformaciones, independiente de la velocidad de deformacion.
- Captura de comportamiento dependiente de trayectoria en historias de carga no proporcionales, incluyendo trayectorias fuera de distribucion (path-OOD).
- Cierre de leyes de endurecimiento isorro y cinematico no proporcionadas explicitamente al modelo.
- Integracion en flujos de elementos finitos: el modelo es desplegable en FE segun la model card, si bien se distribuye como implementacion de punto material en PyTorch.
- Ejecucion sobre secuencias de deformacion completas mediante `rollout`, con entrada en orden Voigt de cizalladura tensorial.
- Recuperacion frente a casos ciclicos severos mediante un fallback global con region de confianza (un unico fallback necesario en la prueba documentada).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: no es un modelo generativo de lenguaje.

## Casos de uso

- Simulacion constitutiva en solvers de elementos finitos: el modelo puede actuar como rutina de punto material que, dada una historia de deformaciones y las constantes del material, devuelve la tension integrada; su 918 parametros y su formulacion implicita lo hacen adecuado como sustituto de una UMAT en fase de prototipado.
- Analisis de barras entalladas bajo carga ciclica: en los ensayos documentados con malla de 12 elementos, los errores relativos L2 de reaccion fueron del 0,636 % (ciclico) y del 0,500 % (monotonico), lo que respalda su uso en validacion estructural de componentes con concentracion de tensiones.
- Modelado de trayectorias de carga no proporcionales: el modelo esta evaluado especificamente en familias de trayectorias no proporcionales reservadas, por lo que encaja en estudios de plasticidad multiaxial donde los modelos de secuencia convencionales degradan su generalizacion.
- Investigacion en physics-informed machine learning: sirve como caso de estudio reproducible de hasta donde se puede retener la fisica a nivel de arquitectura cuando las ecuaciones de evolucion o la estructura de variables internas no se conocen.
- Generacion de datos sinteticos de respuesta material: puede emplearse para producir campos de tension coherentes con el esqueleto J2 en pipelines que necesiten trayectorias adicionales de entrenamiento o validacion.
- Gemelos digitales y monitorizacion estructural: al ejecutarse en CPU y con un coste de parametros minimo, puede integrarse en bucles de simulacion repetitiva donde el coste dominante es la integracion implicita, no el modelo neuronal.
- Comparacion de arquitecturas gray-box frente a black-box: la model card ofrece una progresion experimental (MLP, GRU, LSTM, TCN, GRU con estado fisico, integrador fisico, DENIM) utilizable como referencia metodologica en articulos y revisiones.
- Analisis de sensibilidad de parametros materiales: al recibir `young`, `poisson` y `yield_stress` como entradas explicitas, permite barrer constantes del material sin reentrenar.
- Prototipado de rutinas de retorno implicito: el codigo de `rollout` y `inference.py` sirve como base para desarrollar e integrar un UMAT compilado en produccion.

## Benchmarks y rendimiento

Resultados en dos familias completas de trayectorias no proporcionales reservadas (held-out), segun la model card:

| Modelo | RMSE (MPa) | R2 |
|---|---:|---:|
| Incomplete J2 | 59,541 | 0,730208 |
| GRU (49.254 parametros) | 76,988 | 0,548933 |
| DENIM | 1,136 | 0,999902 |

Progresion de investigacion descrita por el autor (los protocolos congelados difieren entre filas; los valores absolutos de RMSE no deben clasificarse directamente entre si):

| Etapa | Fisica disponible para el modelo | RMSE de tension en trayectorias OOD (MPa) | Interpretacion |
|---|---|---:|---|
| MLP / GRU / LSTM / TCN / GRU con estado fisico | fisica debil o difusa | 60,44–105,81 | el ajuste de secuencias generaliza mal a trayectorias no vistas |
| Physics-integrator NN | ecuaciones y estructura de estado J2/Chaboche correctas | 0,0237 | techo de fusion white-box cuando se conoce la forma gobernante |
| DENIM | esqueleto J2, pero ley de endurecimiento y una escala de memoria de referencia ocultas | 1,136 | cierra terminos de evolucion genuinamente ausentes y sigue siendo desplegable en FE |

Resultados adicionales reportados:

| Prueba | Metrica | Valor |
|---|---|---|
| Trayectorias gruesas / finas | RMSE (MPa) | 0,944 / 0,958 |
| Barra entallada de 12 elementos, carga ciclica | error relativo L2 de reaccion | 0,636 % |
| Barra entallada de 12 elementos, carga monotona | error relativo L2 de reaccion | 0,500 % |
| Caso ciclico severo | fallbacks globales de region de confianza | 1 |

No se han publicado resultados de benchmarks de tipo MMLU, HumanEval o GSM8K en la informacion disponible, ya que no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos (918 parametros) en precision completa; el requisito real lo determina el tamano del lote de trayectorias y la longitud de la secuencia de deformaciones, no el modelo.
- GPU recomendadas: no disponible. No se especifica ninguna GPU objetivo en la informacion proporcionada.
- Cabe en GPU de consumo: si, en cualquier GPU con soporte CUDA de PyTorch, y tambien en CPU. La ejecucion en CPU es viable para el checkpoint, aunque el coste dominante es el mapa de retorno implicito.
- Opciones de despliegue: PyTorch (`torch.load` del fichero `denim.pt`), con ejemplo ejecutable en `inference.py` del repositorio. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo constitutivo.
- Latencia y throughput estimados: no disponible. La model card solo indica cualitativamente que el mapa de retorno implicito es mas lento que la inferencia directa de una GRU.
- Uso en produccion: la model card advierte de que es una implementacion de punto material en PyTorch y que todavia no es una UMAT compilada lista para produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Fisica incorporada | RMSE en trayectorias OOD (MPa) | R2 | Despliegue en FE | Licencia |
|---|---:|---|---:|---:|---|---|
| DENIM | 918 | esqueleto J2 explicito, endurecimiento aprendido | 1,136 | 0,999902 | si (implementation de punto material) | apache-2.0 |
| GRU | 49.254 | ninguna (ajuste de secuencias) | 76,988 | 0,548933 | no indicado | no disponible |
| Incomplete J2 | no disponible | J2 incompleto (dos canales de memoria) | 59,541 | 0,730208 | si | no disponible |
| Physics-integrator NN | no disponible | ecuaciones y estructura J2/Chaboche completas | 0,0237 | no disponible | si | no disponible |
| MLP / LSTM / TCN / GRU con estado fisico | no disponible | fisica debil o difusa | 60,44–105,81 | no disponible | no indicado | no disponible |

Advertencia de comparacion: el autor indica que las filas de Physics-integrator NN y DENIM usan protocolos congelados distintos, por lo que sus valores absolutos de RMSE no deben rankearse directamente.

## Limitaciones y advertencias

- Material sintetico fijo: no es una calibracion experimental, por lo que no debe usarse directamente para predecir el comportamiento de un material real sin recalibracion.
- Alcance constitutivo restringido: solo plasticidad J2 isorro, de pequenas deformaciones e independiente de la velocidad de deformacion.
- Canales de memoria reducidos: dos canales frente a los tres del material de referencia, con una escala temporal de referencia que debe aproximarse de forma aprendida.
- Entrenamiento con supervision de alta fidelidad del estado interno, lo que puede limitar la transferencia a escenarios donde esa supervision no este disponible.
- Implementacion de punto material en PyTorch, no una UMAT compilada: requiere trabajo adicional para llevarla a produccion en un solver comercial.
- Coste computacional del mapa de retorno implicito superior al de una inferencia directa de GRU.
- Robustez ciclica: el caso ciclico severo documentado requirio un fallback global con region de confianza, lo que indica que no todos los casos convergen con el retorno estandar.
- Riesgo de alucinacion: no aplica en el sentido generativo; el riesgo equivalente es la extrapolacion silenciosa fuera del dominio de trayectorias y materiales cubiertos.
- Sesgos conocidos: no disponible.
- Restricciones de licencia: la licencia es Apache 2.0, que permite uso comercial; conviene revisar las condiciones del dataset asociado de forma independiente.
- Advertencia de comparacion: no rankear directamente los RMSE de Physics-integrator NN y DENIM, ya que proceden de protocolos congelados distintos.
- Madurez y adopcion: 0 descargas y 2 likes en el momento de la consulta, sin senales de validacion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HaomingLuo/AgentFEM-DENIM
- Dataset asociado (AgentFEM-Material-Loading-Memory): https://huggingface.co/datasets/HaomingLuo/AgentFEM-Material-Loading-Memory
- Ficheros citados en la model card: `inference.py`, `config.json`, `denim.pt`, `src/t2_graybox_discrete_energy.py` (ruta relativa al repositorio del modelo)
- Paper, blog, repositorio adicional o demo: no disponibles en la informacion proporcionada
