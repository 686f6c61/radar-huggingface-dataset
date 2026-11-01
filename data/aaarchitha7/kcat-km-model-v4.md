# aaarchitha7/kcat-km-model-v4

## Resumen

`aaarchitha7/kcat-km-model-v4` es un repositorio de Hugging Face publicado por el usuario aaarchitha7 que, segun su model card, corresponde a un modelo de tipo *starter* para la tarea conjunta de prediccion de kcat y Km en el marco de la competicion Leak CURBER. No se trata de un modelo de lenguaje generativo, sino de un artefacto de machine learning supervisado orientado a la prediccion de parametros enzimaticos a partir de secuencias proteicas y representaciones SMILES de sustratos.

La tarea consiste en, dada una tabla Parquet con columnas `id`, `smiles` y `sequence`, predecir dos valores escalares: `log10_kcat` y `log10_km`. La evaluacion se realiza mediante la correlacion de rangos de Spearman (SCC) y el RMSE para cada objetivo, y el ranking del leaderboard se ordena por la media de ambas SCC. El modelo se ejecuta exclusivamente en CPU, con un limite de 2 vCPUs, 16 GB de RAM y 15 minutos para el conjunto completo de inferencia.

El repositorio tiene un tamano de 0,2 GB, usa formato safetensors y licencia MIT. No se dispone de informacion sobre arquitectura, numero de parametros, contexto, idiomas ni pipeline de Hugging Face. El contenido disponible es fundamentalmente una guia de participacion en el leaderboard, no una descripcion tecnica del modelo entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (no aplica: modelo no generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica: modelo de prediccion numerica) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la model card ni en los metadatos del repositorio. El texto disponible describe el formato de la tarea, el baseline de referencia y el procedimiento de envio al leaderboard, pero no detalla la red neuronal, el tipo de encoder, ni el preentrenamiento utilizado.

El baseline oficial descrito en la model card es una regresion ridge con dos salidas (una por objetivo) cuyas caracteristicas son la longitud de la secuencia, la longitud del SMILES, las frecuencias de aminoacidos y las frecuencias de caracteres del SMILES, entrenada solo con el split de entrenamiento. El repositorio `aaarchitha7/kcat-km-model-v4` parece ser una sustitucion de ese baseline por parte del autor, pero no se especifica que modelo o libreria se ha empleado. No hay datos sobre numero de tokens de entrenamiento, composicion del dataset, ni uso de RLHF/DPO (tecnicas no aplicables a esta tarea).

## Capacidades

- Prediccion de dos objetivos numericos continuos: `log10_kcat` y `log10_km`.
- Procesamiento de entradas tabulares en formato Parquet con columnas `id`, `smiles` y `sequence`.
- Generacion de salida CSV con el formato exacto `id,log10_kcat,log10_km`.
- Ejecucion en CPU sin GPU ni red, dentro de un contenedor Docker.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingues declaradas (no aplica).
- No dispone de modo *thinking*, vision ni audio.

## Casos de uso

- Prediccion de parametros enzimaticos en pipelines de biologia computacional: dado un conjunto de pares secuencia-sustrato, el modelo genera estimaciones de `log10_kcat` y `log10_km` que pueden integrarse en flujos de anotacion funcional de enzimas, siempre que se respete el formato de entrada Parquet y el limite de 15 minutos por lote.
- Participacion en el leaderboard Leak CURBER: el modelo se empaqueta en una imagen Docker con `Dockerfile`, `predict.py` y `README.md`, se sube a un repositorio publico de Hugging Face y se envia a traves del espacio `starkAhmed43/leak-curber-leaderboard`, lo que permite comparar su SCC medio frente a otros equipos.
- Evaluacion comparativa de baselines: al ser un sustituto del baseline ridge, puede usarse para medir si un enfoque mas complejo mejora la SCC media en validacion respecto a las caracteristicas手工 (longitudes, frecuencias de aminoacidos y de caracteres SMILES).
- Reproduccion de experimentos docentes: el repositorio incluye instrucciones para descargar `train.parquet` y `val_inputs.parquet`, reentrenar el baseline y verificar el contenedor con Docker, lo que lo hace util en un contexto de curso (se menciona un foro de Moodle).
- Prototipado de modelos de regresion multiobjetivo en entornos sin GPU: al ejecutarse solo en CPU con 2 vCPUs y 16 GB de RAM, sirve como plantilla para despliegues de bajo coste en los que no se dispone de aceleradores.
- Validacion de pipelines de submission: el modelo puede usarse para comprobar que el formato CSV cumple las restricciones del evaluador (columnas exactas, IDs unicos, valores finitos y con valor absoluto menor o igual a 1.000.000), antes de enviar un modelo definitivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la metrica del leaderboard (SCC media y RMSE por objetivo) y el baseline ridge, pero no incluye puntuaciones numericas del modelo `aaarchitha7/kcat-km-model-v4` ni de alternativas.

## Requisitos de hardware

- Inferencia exclusivamente en CPU: el evaluador asigna 2 vCPUs y 16 GB de RAM.
- Sin GPU: el contenedor se ejecuta con `--network none` y sin acelerador.
- Limite temporal: 15 minutos para todos los inputs, incluyendo la carga del modelo y la inferencia.
- Limite de imagen: build en menos de 30 minutos, repositorio de 4 GiB o menos, y ningun fichero escrito por `predict.py` mayor de 16 MiB.
- Entorno de ejecucion: Linux x86-64, Python en `/usr/local/bin/python`, directorio de trabajo `/app`, comando `python /app/predict.py --input INPUT --output OUTPUT`.
- Opciones de despliegue: Docker (obligatorio para el leaderboard); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aaarchitha7/kcat-km-model-v4 | no disponible (prediccion kcat/Km) | no disponible | no aplica | MIT | Hugging Face |
| Baseline ridge (descrito en la model card) | Regresion ridge de dos salidas | no disponible | no aplica | no disponible | Incluido en `starkAhmed43/leak-curber-kcat-km-starter` |
| Modelos de prediccion kcat/Km de la literatura | no disponible | no disponible | no aplica | no disponible | no disponible |

No se dispone de informacion suficiente para comparar con alternativas de la misma categoria mas alla del baseline ridge incluido en el starter oficial.

## Limitaciones y advertencias

- La model card no describe la arquitectura, el entrenamiento ni el rendimiento del modelo; no es posible verificar su calidad tecnica a partir de la informacion disponible.
- El modelo debe ejecutarse en CPU con 2 vCPUs y 16 GB de RAM en menos de 15 minutos; no se admiten GPU ni acceso a red durante la inferencia.
- El formato de salida es estricto: columnas exactas `id,log10_kcat,log10_km`, IDs sin duplicados ni omisiones, valores finitos y con valor absoluto menor o igual a 1.000.000.
- Los valores deben entregarse en escala logaritmica base 10; exponenciarlos provoca un fallo de evaluacion.
- Las etiquetas de validacion y los datos de test son privados, por lo que no es posible medir el rendimiento real fuera del leaderboard.
- Limites de envio: 2 submissions por dia y 20 en total por tarea; solo una evaluacion activa a la vez; las submissions no nominadas caducan a los 7 dias.
- Fecha limite de envio y nominacion: 7 de noviembre de 2026 a las 23:59 IST.
- No se declaran sesgos conocidos, riesgo de alucinacion ni limitaciones de idioma, ya que no es un modelo generativo.
- La licencia MIT permite uso comercial, pero no se especifican restricciones adicionales sobre los datos de entrenamiento ni sobre los pesos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/aaarchitha7/kcat-km-model-v4
- Repositorio starter oficial: https://huggingface.co/starkAhmed43/leak-curber-kcat-km-starter
- Dataset de la competicion: https://huggingface.co/datasets/starkAhmed43/leak-curber-kcat-km
- Leaderboard: https://huggingface.co/spaces/starkAhmed43/leak-curber-leaderboard
- Hoja de asignacion de tareas: https://docs.google.com/spreadsheets/d/12c2PaYcNDpa6bA0JPmKi6tHsdV-EdFe2IYQ70RqpGRI/edit?usp=sharing
