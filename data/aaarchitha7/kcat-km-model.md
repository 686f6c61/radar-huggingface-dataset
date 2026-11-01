# aaarchitha7/kcat-km-model

## Resumen

`aaarchitha7/kcat-km-model` es un modelo de inicio (starter model) publicado en Hugging Face para la tarea conjunta de prediccion de `kcat` y `Km`, dos parametros cineticos de enzimas. El repositorio pertenece al autor `aaarchitha7` y esta etiquetado con `leak-curber`, `kcat`, `km` y `leaderboard`, lo que lo vincula a la competicion Leak CURBER. No se trata de un modelo de lenguaje ni de un transformer preentrenado: la model card describe un flujo de trabajo para entrenar un modelo propio y subirlo a la leaderboard, no un conjunto de pesos con arquitectura declarada.

La tarea consiste en recibir un fichero Parquet con columnas `id`, `smiles` y `sequence` (secuencia de aminoacidos de la enzima) y producir un CSV con `id`, `log10_kcat` y `log10_km`. La evaluacion combina la correlacion de rangos de Spearman (SCC) y el RMSE por objetivo, y la clasificacion se ordena por la media de las dos SCC. El baseline incluido es una regresion ridge con dos salidas cuyas caracteristicas son la longitud de secuencia, la longitud del SMILES, las frecuencias de aminoacidos y las frecuencias de caracteres del SMILES.

El repositorio tiene un tamano de 0.0 GB, no registra descargas ni likes, y la model card no declara parametros, contexto, idiomas ni arquitectura neuronal. Es relevante ahora como plantilla operativa para participantes de la competicion: define el contrato de entrada/salida, el entorno Docker de evaluacion (CPU, 2 vCPU, 16 GB RAM, 15 minutos, sin red) y el procedimiento de envio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el baseline es una regresion ridge con dos salidas) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No disponible (el baseline usa `weights/baseline.json`) |

## Arquitectura y entrenamiento

La model card no describe una arquitectura de red neuronal. El baseline propuesto es una regresion ridge con dos salidas, una para `log10_kcat` y otra para `log10_km`. Las caracteristicas de entrada son cuatro grupos: longitud de la secuencia proteica, longitud del SMILES, frecuencias de aminoacidos y frecuencias de caracteres del SMILES. El entrenamiento del baseline utiliza unicamente el split de entrenamiento (`train.parquet`) y se ejecuta con `train.py`, que guarda los pesos en `weights/baseline.json`.

No se especifican datos de entrenamiento en terminos de numero de tokens, composicion del dataset ni tecnicas de RLHF o DPO, porque no es un modelo generativo. La innovacion tecnica del repositorio no esta en el modelo sino en el contrato de evaluacion: inferencia exclusivamente en CPU, sin red, con limite de 15 minutos para todos los inputs, imagen Docker construida a partir del `Dockerfile` del participante, Python en `/usr/local/bin/python`, directorio de trabajo `/app` y comando fijo `python /app/predict.py --input INPUT --output OUTPUT`. El repositorio debe pesar 4 GiB o menos, la build debe terminar en 30 minutos y ningun fichero escrito por `predict.py` puede superar 16 MiB.

## Capacidades

- Prediccion de dos parametros cineticos enzimaticos: `log10_kcat` y `log10_km` a partir de SMILES y secuencia proteica.
- Procesamiento de entradas en formato Parquet con columnas `id`, `smiles` y `sequence`.
- Generacion de salida CSV con el esquema exacto `id,log10_kcat,log10_km`.
- Ejecucion en CPU sin GPU y sin acceso a red durante la inferencia.
- Empaquetado reproducible mediante Docker para su envio a la leaderboard.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues, ya que no es un modelo de lenguaje.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Participacion en la competicion Leak CURBER: el repositorio sirve como plantilla para entrenar un modelo propio, empaquetarlo en Docker y enviarlo a la leaderboard de la tarea kcat–Km. Es adecuado porque define el contrato exacto de entrada, salida y entorno de evaluacion.
- Prediccion de parametros cineticos en ingenieria de proteinas: dado un SMILES de sustrato y una secuencia de enzima, el modelo estima `log10_kcat` y `log10_km` para priorizar variantes enzimaticas antes de ensayos de laboratorio. El baseline ridge con caracteristicas de longitud y frecuencias ofrece una linea base rapida en CPU.
- Filtrado previo de candidatos en diseno de biocatalizadores: el modelo puede puntuar pares enzima-sustrato a gran escala en CPU, lo que permite descartar combinaciones con baja probabilidad de actividad medible antes de experimentos costosos.
- Benchmarking de modelos de aprendizaje automatico en bioquimica: la leaderboard y el formato estandar permiten comparar enfoques (ridge, grafos moleculares, protein language models) bajo el mismo protocolo de SCC y RMSE.
- Docencia y practicas de machine learning aplicado: el repositorio incluye instrucciones para entrenar el baseline, validar con Docker y enviar resultados, lo que lo hace util como ejercicio reproducible en un curso (la model card menciona un foro de Moodle).
- Integracion en pipelines de evaluacion automatizada: el contrato de `predict.py --input --output` y las restricciones de Docker permiten incorporar el modelo a un sistema de evaluacion continua sin GPU y con limites de recursos conocidos.
- Analisis de sensibilidad de caracteristicas: al ser un modelo lineal con caracteristicas interpretables (longitudes y frecuencias), permite estudiar que descriptores simples correlacionan con kcat y Km antes de invertir en arquitecturas mas complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card define las metricas de evaluacion (SCC y RMSE por objetivo, clasificacion por media de SCC) pero no incluye puntuaciones del baseline ni de otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; la evaluacion es exclusivamente en CPU.
- GPU recomendadas: ninguna; el evaluador no dispone de GPU.
- Cabida en GPU consumer: no aplica.
- Entorno de evaluacion: Linux x86-64, 2 vCPU, 16 GB de RAM, sin red, 15 minutos para todos los inputs.
- Opciones de despliegue: Docker (imagen construida desde el `Dockerfile` del repositorio), con Python en `/usr/local/bin/python` y directorio de trabajo `/app`.
- Latencia y throughput estimados: no disponibles; dependen del modelo que entrene el participante. El baseline ridge es previsiblemente rapido, pero no se publican cifras.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos de prediccion conjunta de kcat y Km ni resultados comparables. El unico punto de referencia es el baseline ridge descrito en la model card, que sirve como linea base interna de la competicion.

## Limitaciones y advertencias

- El repositorio no contiene un modelo entrenado con arquitectura declarada; es una plantilla y un baseline lineal, no un modelo listo para produccion.
- El baseline ridge usa solo caracteristicas simples (longitudes y frecuencias) y no captura informacion estructural de la proteina ni del ligando, por lo que su capacidad predictiva es limitada.
- Riesgo de sobreajuste y de baja generalizacion fuera de la distribucion de `train.parquet`; no se documenta validacion externa.
- La evaluacion se realiza solo en CPU, sin red y con 15 minutos para todos los inputs, lo que restringe el tamano y la complejidad de los modelos desplegables.
- Restricciones de envio: 2 envios por dia y 20 en total por tarea; los fallos cuentan; solo una evaluacion activa a la vez; fecha limite 7 de noviembre de 2026 a las 23:59 IST.
- La salida debe contener cada ID exactamente una vez, con valores finitos y valor absoluto no superior a 1.000.000; cualquier incumplimiento invalida la evaluacion.
- No se declaran sesgos conocidos ni limitaciones de idioma porque no es un modelo de lenguaje, pero tampoco se documentan sesgos en los datos de entrenamiento.
- Licencia MIT: permite uso comercial y modificacion, pero no se ofrece garantia alguna sobre el rendimiento del modelo.
- La fecha de creacion indicada (2026-10-31) y el plazo de la competicion (noviembre de 2026) son posteriores a la fecha actual de referencia, lo que debe verificarse antes de planificar participacion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/aaarchitha7/kcat-km-model
- Repositorio starter de referencia: https://huggingface.co/starkAhmed43/leak-curber-kcat-km-starter
- Dataset de la competicion: https://huggingface.co/datasets/starkAhmed43/leak-curber-kcat-km
- Leaderboard: https://huggingface.co/spaces/starkAhmed43/leak-curber-leaderboard
- Hoja de asignacion de tareas: https://docs.google.com/spreadsheets/d/12c2PaYcNDpa6bA0JPmKi6tHsdV-EdFe2IYQ70RqpGRI/edit?usp=sharing
