# aaarchitha7/kcat-km-final1

## Resumen

`aaarchitha7/kcat-km-final1` es un modelo de regresion molecular publicado en Hugging Face como participacion en el reto Leak CURBER, tarea conjunta kcat–Km. No se trata de un modelo de lenguaje ni de un transformer generativo: el repositorio contiene pesos en formato safetensors (0,2 GB) que predicen dos valores continuos, `log10_kcat` y `log10_km`, a partir de la secuencia aminoacidica de una enzima y la representacion SMILES de un sustrato. El autor es el usuario `aaarchitha7` y la licencia declarada es MIT.

El modelo resuelve un problema clasico de biologia computacional: estimar parametros cineticos enzimaticos sin medirlos experimentalmente. La entrada es un fichero Parquet con columnas `id`, `smiles` y `sequence`; la salida es un CSV con `id`, `log10_kcat` y `log10_km`. El ranking del leaderboard se calcula por la media de las correlaciones de rango de Spearman (SCC) de ambos objetivos, complementada con RMSE.

Es relevante ahora por su caracter de artefacto de competicion: el entorno de evaluacion es extremadamente restringido (solo CPU, 2 vCPU, 16 GB de RAM, 15 minutos para todas las entradas y sin red), lo que obliga a disenos de inferencia muy eficientes. La model card documenta que se usaron datos externos de CatPred-DB, lo que condiciona su reproducibilidad y su comparabilidad con otros participantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no detalla la arquitectura; los tags apuntan a un modelo de regresion sobre caracteristicas de secuencia y SMILES) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular: secuencia proteica + SMILES, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors (tamano del repo: 0,2 GB) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo entregado. El baseline del reto, que sirve de referencia, es una regresion ridge con dos salidas cuyas caracteristicas son la longitud de la secuencia, la longitud del SMILES, las frecuencias de aminoacidos y las frecuencias de caracteres del SMILES. El modelo publicado por `aaarchitha7` sustituye ese baseline por un modelo propio, pero no se especifica en la informacion disponible si usa descriptores manuales, embeddings proteicos preentrenados, grafos moleculares o una combinacion.

En cuanto a datos, la model card indica explicitamente que el modelo se entreno con filas adicionales de CatPred-DB, con un fichero `external_data/EXTERNAL_DATA.md` que documenta las fuentes y el filtrado aplicado. Los datos publicos del reto son `train.parquet` (con etiquetas) y `val_inputs.parquet` (solo entradas); las etiquetas de validacion y los datos de test son privados. No se documentan numero de tokens, composicion exacta del dataset, ni si hubo etapas de ajuste fino o regularizacion especifica.

## Capacidades

- Prediccion conjunta de `log10_kcat` y `log10_km` a partir de pares enzima–sustrato (secuencia aminoacidica y SMILES).
- Regresion multiobjetivo con dos salidas numericas continuas en escala logaritmica base 10.
- Inferencia en CPU pura, sin GPU y sin acceso a red, dentro de un contenedor Docker con limites estrictos de recursos.
- Procesamiento por lotes de un fichero Parquet de entrada y generacion de un CSV de salida con un identificador por fila.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues, al no ser un modelo generativo.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Priorizacion de experimentos de cinetica enzimatica: dado un conjunto de candidatos enzima–sustrato, el modelo permite ordenar por kcat y Km predichos y seleccionar solo los mas prometedores para ensayo de laboratorio, reduciendo coste experimental.
- Ingenieria de proteinas: al evaluar variantes de una enzima frente a un sustrato fijo, el modelo estima el impacto de mutaciones en la constante catalitica y la afinidad, util para cribados in silico previos a expresion y purificacion.
- Modelado metabolico y de vias: los valores de kcat y Km alimentan modelos cineticos de redes metabolicas; las predicciones permiten rellenar parametros ausentes en genomas poco anotados.
- Filtrado en pipelines de descubrimiento de farmacos: descartar combinaciones enzima–farmaco con Km predicho desfavorable antes de estudios de metabolismo in vitro.
- Docencia y benchmarking de metodos: el modelo sirve como referencia reproducible en el leaderboard Leak CURBER para comparar aproximaciones de regresion molecular bajo restricciones de CPU.
- Despliegue en entornos sin GPU: al ejecutarse en 2 vCPU y 16 GB de RAM sin red, puede integrarse en servicios internos de laboratorio o en notebooks de bajo coste.
- Analisis de sensibilidad de sustratos: variando el SMILES manteniendo la secuencia, se obtiene una estimacion rapida de como cambios estructurales afectan a Km y kcat.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye puntuaciones de SCC ni RMSE en validacion o test, y el leaderboard del reto no se ha consultado en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta disenado para ejecucion en CPU.
- GPU recomendadas: ninguna; el entorno de evaluacion del reto no dispone de GPU.
- Cabida en GPU consumer: irrelevante para el caso de uso previsto, aunque el tamano del repo (0,2 GB) sugiere que el modelo es ligero.
- Opciones de despliegue: contenedor Docker con Python en `/usr/local/bin/python`, directorio de trabajo `/app` y comando `python /app/predict.py --input INPUT --output OUTPUT`; el reto limita a 2 vCPU, 16 GB de RAM y 15 minutos para todas las entradas, con build de imagen en menos de 30 minutos y repo de 4 GiB o menos.
- Latencia y throughput estimados: no disponibles; dependen del modelo concreto y del volumen de entradas, acotados por el limite de 15 minutos del evaluador.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `aaarchitha7/kcat-km-final1` | Regresion enzima–sustrato | no disponible | no aplica | MIT | Hugging Face |
| Baseline ridge del reto (referencia) | Regresion ridge con descriptores manuales | no disponible | no aplica | no disponible | Documentado en la model card |
| CatPred-DB (fuente de datos externos) | Base de datos de parametros cineticos | no aplica | no aplica | no disponible | Referenciada en `external_data/EXTERNAL_DATA.md` |

No se dispone de informacion suficiente para comparar rendimiento numerico con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta conversacion ni agentes.
- La arquitectura y el numero de parametros no se documentan, lo que dificulta auditar el metodo y reproducir el entrenamiento.
- El uso de datos externos de CatPred-DB puede introducir fuga de informacion si hay solapamiento con las particiones de validacion o test del reto; la model card remite a `external_data/EXTERNAL_DATA.md` para el filtrado aplicado, pero no se detalla aqui.
- Riesgo de extrapolacion: las predicciones de kcat y Km fuera del dominio quimico o proteico cubierto por los datos de entrenamiento pueden ser poco fiables.
- Las salidas estan en escala log10; un error de interpretacion (exponenciar o no) invalida el uso practico de los resultados.
- Restricciones de licencia: MIT permite uso comercial, pero la procedencia de los datos de entrenamiento (CatPred-DB) puede imponer condiciones adicionales no reflejadas en la licencia del modelo.
- En produccion, el modelo debe ejecutarse sin red y con recursos acotados; cualquier dependencia que requiera descarga en tiempo de inferencia hara fallar la evaluacion.
- No se han publicado metricas de validacion ni de test en la informacion disponible, por lo que no hay evidencia cuantitativa de su calidad predictiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aaarchitha7/kcat-km-final1
- Leaderboard Leak CURBER: https://huggingface.co/spaces/starkAhmed43/leak-curber-leaderboard
- Repositorio starter del reto: https://huggingface.co/starkAhmed43/leak-curber-kcat-km-starter
- Dataset del reto: https://huggingface.co/datasets/starkAhmed43/leak-curber-kcat-km
- Hoja de asignacion de tareas: https://docs.google.com/spreadsheets/d/12c2PaYcNDpa6bA0JPmKi6tHsdV-EdFe2IYQ70RqpGRI/edit?usp=sharing
