# da24b046/leak-curber-submission-11

## Resumen

La ficha corresponde al repositorio `da24b046/leak-curber-submission-11`, publicado por el usuario da24b046 en Hugging Face. No es un modelo de lenguaje generativo: por las etiquetas (`enzyme`, `reaction`) y el contenido de la model card, se trata de un paquete de inferencia (submission) para una tarea de prediccion de numeros EC (Enzyme Commission) a partir de reacciones quimicas, presumiblemente en el marco de una competicion o evaluacion tipo Kaggle. El repositorio pesa 0,9 GB e incluye pesos, indices de recuperacion y un script `predict.py` que se ejecuta en un contenedor Docker Linux amd64 sin GPU.

La "arquitectura" descrita es un ensemble de inferencia: cuatro expertos S9 congelados propios, indices de recuperacion aprendidos y componentes compartidos de la submission S8, combinados mediante pooling logaritmico con pesos fijos `[0.28, 0.28, 0.14, 0.3]`, `alpha=0.1`, `k=5`, `temperature=0.02` y `beta=0.1`. No hay informacion sobre el tipo de red neuronal subyacente en los backbones S9 (transformer, GNN, etc.), ni sobre el numero de parametros, la longitud de contexto o los idiomas, por lo que esos campos se marcan como no disponibles.

Su relevancia es limitada fuera del contexto de la competicion: el propio autor advierte que no reclama una puntuacion oficial, que la seleccion en desarrollo es optimista y que los diagnosticos no son independientes. La ficha se redacta con los datos disponibles y senalando explicitamente las carencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de inferencia: cuatro expertos S9 congelados, indices de recuperacion aprendidos y componentes compartidos de S8; tipo de red de los backbones no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el paquete se ejecuta en CPU sin PyTorch) |
| Idiomas soportados | no disponible (tarea de quimica, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible; el repositorio incluye `weights/model.json` con la receta y procedencia, y un `predict.py` ejecutable |
| Tamano del repositorio | 0,9 GB |
| Entorno de ejecucion | Docker Linux amd64, 2 CPU / 16 GiB, 900 segundos incluyendo pull y carga del evaluador |
| Interfaz | `python /app/predict.py --input INPUT --output OUTPUT` |
| Salida | JSONL con exactamente los campos `id` y `prediction`; una EC valida y completamente especificada |

## Arquitectura y entrenamiento

El autor describe un ensemble medido ("measured ensemble") compuesto por cuatro expertos S9 congelados propios y indices de recuperacion aprendidos, que comparten componentes de la submission S8. Los backbones neuronales de S10, sin cambios, no se cuentan como nuevos expertos independientes. La combinacion usa pooling logaritmico sobre los candidatos recuperados, con pesos fijos, `k=5`, temperatura 0,02 y parametros `alpha` y `beta` de 0,1. La submission S11 compara pooling lineal, logaritmico y de rango reciproco, ademas de distintas configuraciones de recuperacion; S12 introduce pesos softmax condicionados por confianza y regularizados, seleccionados con cinco folds de combinacion sobre predicciones de desarrollo originales y reajustados sobre las 6.328 filas de desarrollo aleatorio.

Los datos de entrenamiento no se detallan en la informacion disponible mas alla de la particion: el split exacto por reaccion es 80/10/10 con 50.624 filas de entrenamiento, 6.328 de desarrollo y 6.328 de test, semilla 2202, manteniendo juntas todas las etiquetas de una misma reaccion. Los folds de combinacion quimica mantienen los clusters unidos. No se especifica el numero de tokens, la composicion del dataset, ni si hubo RLHF o DPO (no aplica en sentido estricto a esta tarea). El autor advierte que todos los datos publicos tienen exposicion historica y que la seleccion en desarrollo es optimista, por lo que los diagnosticos no son independientes.

## Capacidades

- Prediccion de numeros EC (Enzyme Commission) completamente especificados a partir de reacciones quimicas, en formato JSONL de entrada y salida.
- Agrupacion exacta de reacciones crudas que preserva el primer identificador.
- Ensemble de cuatro expertos con pooling logaritmico y recuperacion sobre indices aprendidos.
- Ejecucion en CPU sin GPU ni PyTorch, en un contenedor Docker Linux amd64 con 2 CPU y 16 GiB.
- Restriccion explicita: sin acceso a internet durante la inferencia y sin credenciales.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, audio, tool calling ni razonamiento multi-paso; no es un modelo de lenguaje.

## Casos de uso

- Anotacion automatizada de enzimas en pipelines de bioinformatica: el paquete recibe reacciones y devuelve una EC valida por registro, lo que permite preclasificar grandes lotes antes de la revision manual.
- Evaluacion reproducible en entornos aislados: al ejecutarse en Docker sin red ni GPU, encaja en infraestructuras con restricciones de seguridad donde no se permite acceso externo.
- Reproduccion de resultados de competicion: el repositorio incluye la receta completa en `weights/model.json`, lo que facilita auditar y replicar la submission.
- Baseline para experimentos de recuperacion y pooling: las variantes S11 comparan pooling lineal, logaritmico y de rango reciproco, utiles como referencia para probar otras estrategias de combinacion.
- Prototipado en maquinas modestas: con 2 CPU y 16 GiB y un limite de 900 segundos, puede desplegarse en portatiles o instancias pequenas sin acelerador.
- Generacion de candidatos para curacion experta: la salida de una unica EC por reaccion sirve como propuesta inicial que un curador valida, reduciendo el tiempo de triaje.
- Integracion en pipelines de CI/CD de quimica computacional: el contrato de entrada/salida JSONL y la ausencia de dependencias pesadas facilitan pruebas automatizadas de regresion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no reclama una puntuacion oficial y que los diagnosticos de desarrollo son optimistas y no independientes.

## Requisitos de hardware

- VRAM estimada: no aplica; la inferencia se ejecuta en CPU.
- GPU recomendadas: ninguna; el paquete no usa GPU ni PyTorch.
- CPU y memoria: 2 CPU y 16 GiB segun la model card.
- Cabe en hardware consumer: si, en cualquier maquina Linux amd64 con Docker y 16 GiB de RAM.
- Opciones de despliegue: contenedor Docker Linux amd64 con `python /app/predict.py --input INPUT --output OUTPUT`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: limite de 900 segundos por ejecucion, incluyendo pull y carga del evaluador; no se detalla throughput por registro.
- Tamano en disco: repositorio de 0,9 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| leak-curber-submission-11 | no disponible | no disponible | sin puntuacion oficial | no disponible | Hugging Face, 0 descargas, 0 likes |
| leak-curber-enzyme-submission-4 (mismo autor) | no disponible | no disponible | split 80/10/10 con 50.624/6.328/6.328, semilla 2202 | no disponible | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo ni respuestas conversacionales; su unica funcion es predecir numeros EC.
- El autor no reclama puntuacion oficial; los resultados de desarrollo son optimistas y los diagnosticos no son independientes.
- Todos los datos publicos tienen exposicion historica, lo que puede inflar el rendimiento aparente.
- Licencia no disponible: no puede asumirse uso comercial sin confirmacion del autor.
- Sin informacion sobre sesgos, tasas de alucinacion o cobertura por idioma; la tarea no es linguistica.
- Requiere Docker Linux amd64 y 16 GiB de RAM; no hay soporte documentado para GPU ni para otros sistemas operativos.
- Restricciones operativas: sin internet durante la inferencia, sin credenciales y sin datos crudos ni salidas de evaluacion en el paquete.
- La salida debe ser exactamente JSONL con `id` y `prediction`; una EC mal formada o incompleta invalida el registro.

## Enlaces

- Repositorio del modelo: https://huggingface.co/da24b046/leak-curber-submission-11
- Submission previa del mismo autor: https://huggingface.co/da24b046/leak-curber-enzyme-submission-4
- Repositorio GitHub del autor: https://github.com/da24b046/AI-Ops-Module-1/tree/main
