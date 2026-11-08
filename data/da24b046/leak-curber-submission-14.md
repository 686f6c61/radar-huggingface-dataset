# da24b046/leak-curber-submission-14

## Resumen

`da24b046/leak-curber-submission-14` es un artefacto de inferencia publicado en Hugging Face por el usuario `da24b046`, etiquetado con los tags `enzyme` y `reaction`. No es un modelo de lenguaje generativo, sino un sistema de prediccion de numeros EC (Enzyme Commission) para reacciones enzimaticas. El autor lo describe como un "ensemble generalizado seleccionado en desarrollo": un conjunto de cuatro expertos neuronales congelados, cada uno con su propio indice de recuperacion, combinados mediante un pooling ponderado de potencias y un componente de retrieval por vecinos mas cercanos.

El sistema no entrena ningun backbone nuevo ni reclama validacion cruzada de cinco folds sobre el backbone; reutiliza los expertos de las entregas S9/S11 y ajusta unicamente la receta de combinacion. La receta exacta esta documentada en la model card: pesos `[0.25, 0.25, 0.125, 0.375]`, `power` 0.25, `sharpness` 0.85, `alpha` 0.05, `k` 15 vecinos, temperatura 0.02 y correccion de masa L3 con `beta` 0.15.

Su relevancia es acotada: se trata de una entrega para un evaluador externo (probablemente un reto tipo Kaggle o benchmark privado de anotacion enzimatica), empaquetada como imagen Docker ejecutable sin red, sin GPU y sin Torch. El repositorio ocupa 0.9 GB y no incluye pipeline, licencia ni idiomas declarados. El resultado oficial del evaluador es desconocido segun el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de 4 expertos neuronales congelados + retrieval por vecinos (k=15) con pooling ponderado de potencias |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; entrada por registro de reaccion) |
| Tipos de cuantizacion | no disponible (no se aplica cuantizacion de pesos de LLM) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (artefacto empaquetado como imagen Docker; repo de 0.9 GB) |

## Arquitectura y entrenamiento

La arquitectura es un ensemble heterogeneo de cuatro expertos neuronales congelados, reutilizados de las entregas S9 y S11, cada uno acompanado de su propio indice de recuperacion. La combinacion se realiza en dos etapas: primero se calcula una media ponderada de potencias sobre las probabilidades neuronales (con suelo de 1e-8 antes del pooling; `power` 0.25, donde potencia cero equivaldria a pooling geometrico), seguida de normalizacion, aplicacion de `sharpness` 0.85 y nueva normalizacion. Opcionalmente, la entrega S14 ajusta los pesos de los expertos segun la probabilidad neural maxima por experto y mezcla un ensemble aritmetico.

El componente de retrieval recupera `k` = 15 vecinos por experto mediante softmax coseno con temperatura 0.02, y distribuye el voto de cada vecino a partes iguales entre sus anotaciones EC distintas registradas. Las probabilidades neuronales y de retrieval se mezclan y despues se aplica una correccion de masa L3 por componente completo con `beta` 0.15. La salida es exactamente un EC completamente especificado, sin canonicalizacion de la reaccion para agrupar.

Sobre el entrenamiento: el autor declara explicitamente que no reclama entrenamiento de backbone nuevo ni validacion cruzada de cinco folds. La seleccion se hizo usando conjuntos de desarrollo aleatorio y quimico preservados, con semilla 3410, y cinco grupos de desarrollo resumen la estabilidad. No hay combinador aprendido ni validacion cruzada anidada. Los checkpoints originales del backbone usaron etiquetas de desarrollo completas historicamente, por lo que el autor advierte que todas las pruebas locales tienen exposicion historica y son diagnosticas, no independientes.

## Capacidades

- Prediccion de numeros EC completos para reacciones enzimaticas, devolviendo exactamente un EC por consulta.
- Ensemble de cuatro expertos neuronales con pooling ponderado de potencias configurable.
- Recuperacion de vecinos por similitud coseno con softmax por temperatura (k=15 por experto).
- Reparto equitativo del voto de cada vecino entre sus anotaciones EC distintas.
- Mezcla de senal neuronal y senal de retrieval con peso acotado por consulta en el rango [0.02, 0.30].
- Correccion de masa L3 por componente completo para ajustar la distribucion final.
- Ejecucion offline determinista: sin red, sin GPU y sin Torch, sobre CPU.
- Interfaz JSONL con claves exactamente `id` y `prediction`.
- No soporta tool calling, agentes, vision, audio ni generacion de texto libre.

## Casos de uso

- Anotacion automatica de reacciones enzimaticas en pipelines de curacion de bases de datos: el sistema recibe registros de reaccion y emite un EC completo por registro, lo que permite clasificar lotes sin intervencion manual y revisar despues solo los casos de baja confianza.
- Priorizacion en anotacion manual: al producir una unica prediccion EC por reaccion, un equipo de curaduria puede usarla como borrador y concentrar el esfuerzo humano en la verificacion, reduciendo el coste por entrada.
- Integracion en entornos con restricciones de red: la imagen Docker se ejecuta con `network none` sobre 2 CPU y 16 GiB, lo que encaja en infraestructura aislada o en entornos de evaluacion cerrados donde no se permite acceso a internet.
- Despliegue en CI/CD para regresion de modelos: al estar empaquetado como imagen y aceptar JSONL de entrada/salida, se puede ejecutar como paso de validacion en un pipeline que compare predicciones entre versiones del ensemble.
- Procesamiento por lotes en hardware modesto: al no requerir GPU ni Torch, puede ejecutarse en instancias CPU pequenas, lo que abarata el coste por reaccion frente a alternativas que exigen acelerador.
- Reproduccion de experimentos de ensemble: la receta exacta esta publicada (pesos, power, sharpness, alpha, k, temperatura, beta), lo que permite a un investigador reproducir la combinacion sobre los mismos expertos y comparar variantes de pooling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que las comparaciones medidas estan en `submission_14.md` y `selfstudy_14.md` del directorio raiz del proyecto, fuera del repositorio de Hugging Face, y que el resultado oficial del evaluador es desconocido. No se deben inferir cifras a partir de la model card.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es exclusivamente en CPU, sin GPU y sin Torch.
- CPU: el autor especifica 2 CPU para la ejecucion de referencia.
- Memoria: 16 GiB de RAM en la configuracion de ejecucion indicada.
- Red: deshabilitada (`network none`); la imagen debe funcionar completamente offline.
- Plataforma: Linux `amd64`, interprete en `/usr/local/bin/python`.
- Almacenamiento: paquete de imagen inferior a 4 GiB y salida inferior a 16 MiB; el repositorio ocupa 0.9 GB.
- Tiempo: la suma de pull de imagen mas carga e inferencia debe caber en los 900 segundos del evaluador; el autor advierte que el pull en frio del evaluador no se ha medido localmente.
- Opciones de despliegue: Docker (`docker build --platform linux/amd64 -t enzyme-14 .` y ejecucion con `python /app/predict.py --input INPUT --output OUTPUT`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este artefacto.
- Throughput y latencia: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| `da24b046/leak-curber-submission-14` | Ensemble de 4 expertos + retrieval | no disponible | no disponible | no disponible | Receta de pooling documentada; ejecucion CPU offline |
| `da24b046/leak-curber-submission-11` | Ensemble medido (entrega previa del mismo autor) | no disponible | no disponible | no disponible | Referencia directa de la que se reutilizan expertos |
| Alternativas de prediccion EC (p. ej. herramientas tipo DeepEC, ECPred, CLEAN) | Clasificadores especificos de EC | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion disponible, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El autor declara que todas las pruebas locales tienen exposicion historica a las etiquetas de desarrollo y son diagnosticas, no independientes; no constituyen una validacion limpia.
- No hay validacion cruzada de cinco folds sobre el backbone ni combinador aprendido; la seleccion se hizo sobre conjuntos de desarrollo con semilla fija.
- El resultado oficial del evaluador es desconocido; la entrega es preparacion local y el autor no la ha publicado.
- La salida es un unico EC completo por consulta, sin canonicalizacion de la reaccion para agrupar; reacciones equivalentes pueden recibir tratamientos distintos.
- Riesgo de alucinacion o asignacion erronea de EC en reacciones fuera de la distribucion de los indices de retrieval; no se documentan tasas de error.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; debe tratarse como no apto para produccion comercial hasta aclararlo con el autor.
- No se declaran idiomas soportados ni sesgos conocidos; al no ser un modelo de lenguaje, las consideraciones de sesgo linguistico no aplican, pero si el sesgo de las anotaciones EC de los datos de retrieval.
- Restricciones operativas estrictas: sin red, sin GPU, sin Torch, Linux amd64, limite de 900 segundos y paquete inferior a 4 GiB; incumplir cualquiera de ellas invalida la ejecucion.
- El autor advierte que no hay datos publicos crudos, salidas de evaluacion, credenciales ni ficheros de estudio en la carpeta, lo que limita la auditoria externa del contenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/da24b046/leak-curber-submission-14
- Entrega previa relacionada: https://huggingface.co/da24b046/leak-curber-submission-11
- Perfil de GitHub del autor: https://github.com/da24b046
