# da24b046/leak-curber-submission-10

## Resumen

`da24b046/leak-curber-submission-10` es un artefacto de inferencia publicado en HuggingFace por el usuario `da24b046`, etiquetado con los tags `enzyme` y `reaction`. No se trata de un modelo de lenguaje generativo, sino de un sistema de prediccion de numeros EC (Enzyme Commission) a partir de reacciones quimicas, empaquetado como un pipeline de inferencia offline. El repositorio contiene codigo de inferencia, parametros estadisticos e indices de recuperacion (kNN) sobre vectores de reaccion, con un tamano de 0,9 GB.

La "Submission 10" documentada en la model card describe un ensamblado de confianza aprendido que reutiliza cuatro expertos neuronales propios de la iteracion S9 junto con indices kNN preexistentes, sin reentrenar el backbone neuronal. La novedad es un combinador softmax lineal pequeno (matriz 12x4 mas 4 sesgos) cuyas 12 entradas son, por cada experto, la probabilidad maxima neuronal, el margen top-dos y el maximo de recuperacion. El sistema esta disenado para ejecutarse en contenedor Docker sobre Linux amd64, sin GPU, sin PyTorch y sin acceso a red.

Su relevancia es acotada: se presenta como una submission de un reto o competicion interna (posiblemente una tarea de anotacion enzimatica), y el propio autor advierte que no reclama una puntuacion oficial S10 y que la mayor parte de la mejora podria provenir de un reajuste del blend de recuperacion mas que del nuevo gate. La informacion publica es escasa en cuanto a arquitectura exacta del backbone, datos de entrenamiento y resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblado de 4 expertos neuronales (S9) mas indices kNN de recuperacion, con combinador softmax lineal (12 entradas, 4 salidas) y pesos residuales sobre los pesos originales de S9 |
| Parametros totales | no disponible (el combinador es una matriz 12x4 mas 4 sesgos; el tamano de los backbones neuronales no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (tarea de prediccion de EC sobre reacciones, no generacion de texto) |
| Tipos de cuantizacion | no disponible (no se mencionan cuantizaciones; el paquete usa parametros y estadisticas en el formato propio del repo) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | no disponible como licencia global; se indica que se mantiene la licencia MIT de DRFP |
| Formato de pesos | `weights/model.json` (parametros y estadisticas); indices de vectores de entrenamiento y anotaciones; entrada/salida en Parquet y JSONL |

## Arquitectura y entrenamiento

El sistema es un ensamblado de prediccion de numeros EC compuesto por cuatro expertos neuronales propios de la iteracion S9, reutilizados sin cambios, e indices kNN aprendidos. Sobre ellos se aprende un combinador de confianza softmax lineal de 12 entradas y 4 salidas (matriz 12x4 mas 4 sesgos). Las 12 entradas corresponden, para cada uno de los cuatro expertos, a tres senales: la probabilidad maxima neuronal, el margen entre las dos probabilidades top y el maximo de recuperacion. Antes del gate lineal se aplica un escalado media/desviacion tipica calculado solo con datos de entrenamiento y un recorte en 5. Un peso residual pequeno combina la salida del gate con los pesos de miembro originales de S9.

El proceso de mezcla final usa un 85% de probabilidades neuronales y un 15% de votacion fraccional k=5 con temperatura 0,02, seguido de regularizacion L3 con beta 0,1 y L2 con gamma 0. La particion de desarrollo original de cada protocolo se dividio 50/50 con semilla 3410: la primera mitad ajusta el gate y la segunda selecciona regularizacion y fuerza. Los tests originales se evaluaron solo tras el bloqueo. El gate final se reajusto con la regularizacion seleccionada sobre las 6328 filas out-of-fold de desarrollo aleatorio, y los expertos neuronales originales usan las 63280 reacciones publicas de entrenamiento. El autor advierte que las distribuciones de caracteristicas pueden desplazarse en el reajuste y que los diagnosticos locales no constituyen una estimacion independiente de generalizacion.

## Capacidades

- Prediccion de un numero EC completo y especifico por cada fila de entrada, en formato JSONL con exactamente los campos `id` y `prediction`.
- Ensamblado de senales neuronales y de recuperacion (kNN) mediante un gate de confianza aprendido.
- Inferencia offline en Linux amd64 sin GPU, sin PyTorch y sin acceso a internet, empaquetada en Docker.
- Preservacion del primer ID en entradas crudas identicas, sin canonicalizar ni normalizar por grupos las cadenas de reaccion.
- Ejecucion con recursos acotados: 2 CPUs y 16 GiB de RAM, con montajes de entrada y salida y red deshabilitada.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Anotacion enzimatica automatizada en pipelines de curacion: dado un conjunto de reacciones en Parquet, el sistema devuelve un EC por reaccion en JSONL, adecuado para preetiquetar grandes lotes antes de revision manual.
- Participacion en retos de prediccion de EC: el paquete esta disenado como submission reproducible (Docker, sin red, con montajes de entrada/salida), lo que facilita la evaluacion por parte de un jurado o harness externo.
- Evaluacion comparativa de estrategias de ensamblado: al separar la contribucion del nuevo gate frente al control de reajuste del blend de recuperacion, sirve para estudiar si el blending neuronal-kNN aporta mejora medible.
- Despliegue en entornos air-gapped: la ausencia de dependencia de red y de GPU permite ejecutarlo en infraestructura restringida con solo CPU y 16 GiB de RAM.
- Generacion de candidatos para bases de datos de enzimas: las predicciones pueden alimentar procesos de validacion o priorizacion de anotaciones en catalogos de reacciones.
- Reproducibilidad de experimentos: el repositorio incluye codigo de inferencia, parametros, estadisticas e indices, lo que permite replicar exactamente la inferencia documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclama ninguna puntuacion oficial S10 y que los diagnosticos locales no son una estimacion independiente de generalizacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; la inferencia es solo CPU.
- GPU recomendadas: ninguna; el sistema no requiere GPU ni PyTorch.
- Cabe en GPU consumer: no aplica (no usa GPU).
- CPU y RAM: 2 CPUs y 16 GiB de RAM segun la model card.
- Opciones de despliegue: Docker sobre Linux amd64 (`docker build --platform linux/amd64 -t enzyme-s10 .`), ejecutando `python /app/predict.py --input /input/val_inputs.parquet --output /output/predictions.jsonl` con red deshabilitada y montajes de entrada/salida.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de prediccion de numeros EC ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- El autor no reclama puntuacion oficial S10; los diagnosticos son locales y no constituyen una estimacion independiente de generalizacion.
- La mayor parte de la mejora podria deberse al reajuste del blend de recuperacion, no al nuevo gate; la contribucion del gate se mide por separado frente a ese control.
- Las distribuciones de caracteristicas pueden desplazarse en el reajuste del gate sobre las 6328 filas out-of-fold.
- Se documentan fuera del paquete experimentos S10 fallidos previos y toda la exposicion a datos publicos, lo que condiciona la interpretacion de los resultados.
- Licencia global no disponible; solo se indica que se mantiene la licencia MIT de DRFP, por lo que el uso comercial del resto del paquete no esta claramente autorizado.
- No se especifican sesgos conocidos ni riesgo de alucinacion en el sentido de modelos generativos; el riesgo principal es de calibracion y de prediccion incorrecta de EC.
- No hay soporte multilingue ni de contexto largo: la tarea es de clasificacion de reacciones, no de generacion de texto.
- El paquete contiene solo codigo de inferencia, parametros, estadisticas e indices; no incluye datos crudos, credenciales ni notas de estudio.

## Enlaces

- HuggingFace: https://huggingface.co/da24b046/leak-curber-submission-10
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
