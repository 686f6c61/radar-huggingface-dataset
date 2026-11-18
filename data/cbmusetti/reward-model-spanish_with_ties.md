# cbmusetti/reward-model-spanish_with_ties

## Resumen

El modelo `cbmusetti/reward-model-spanish_with_ties` es un modelo de recompensa (reward model) de tipo pairwise entrenado para evaluar chistes en espanol. Dado un texto de noticia y dos chistes candidatos, el modelo puntua cada uno de modo que el chiste preferido por humanos recibe una recompensa mayor. Fue desarrollado por cbmusetti en el marco de una tesis sobre generacion de humor con aprendizaje por refuerzo, y su codigo y registros de experimentos estan publicados en el repositorio de la tesis.

El modelo se construye sobre `bertin-project/bertin-roberta-base-spanish`, un encoder RoBERTa preentrenado en espanol, y se especializa mediante fine-tuning como clasificador de secuencias con una cabeza de recompensa. La variante `RewardModelWithTies` implementa un modelo Bradley-Terry con un umbral de empate aprendido, de forma que las parejas igual de graciosas se contabilizan como empates en lugar de forzar un orden estricto. El repositorio incluye dos artefactos: el mejor trial individual de Optuna (`best_trial/`) y el ensemble final (`ensemble/`), que es el recomendado para uso.

Es relevante ahora porque los reward models son un componente central en pipelines de RLHF y de generacion condicionada, y este caso aporta un ejemplo concreto y reproducible en espanol para una tarea subjetiva como el humor, con hiperparametros, datos de entrenamiento y protocolo de validacion cruzada documentados. El tamano del repositorio es de 0,5 GB y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa) con cabeza de clasificacion/recompensa; variante Bradley-Terry con umbral de empate aprendido |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (`max_length` de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | espanol |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint de `transformers` de clasificacion de secuencias mas wrapper de configuracion) |

## Arquitectura y entrenamiento

El modelo parte de `bertin-project/bertin-roberta-base-spanish` y anade una cabeza de recompensa sobre la representacion del encoder. La variante `RewardModelWithTies` emplea un esquema Bradley-Terry en el que se aprende un umbral de empate: si dos chistes son igual de graciosos segun la anotacion humana, la pareja se trata como empate en lugar de imponer un orden. El wrapper de configuracion restaura la longitud maxima y el umbral de empate exactamente como se entrenaron, por lo que es necesario cargar el modelo a traves del codigo de la tesis.

El entrenamiento se realizo sobre 1670 parejas de train y 1136 de test, con semilla de particion 42 y conservando los empates. La seleccion de hiperparametros se hizo con Optuna y validacion cruzada sobre el split de train. La mejor prueba (trial 0) obtuvo un objetivo cross-validated de 0,4939 y uso `batch_size` 128, dropout 0,1212, `encoder_learning_rate` 1,996e-05, 3 epocas, estrategia de congelacion `last_2`, `head_learning_rate` 0,0006255, `layer_lr_decay` 0,9416, `max_length` 256, scheduler `constant_with_warmup`, `warmup_ratio` 0,05248 y `weight_decay` 0,03143. El modelo final (`ensemble/`) reentrena la configuracion ganadora sobre todo el split de train una vez por semilla y promedia las recompensas entre los miembros.

## Capacidades

- Puntuacion pairwise de chistes en espanol: recibe un texto de noticia y un chiste y devuelve una recompensa escalar.
- Comparacion de dos chistes candidatos para el mismo contexto, con soporte de empates mediante umbral aprendido.
- Modelado de preferencias humanas en tareas subjetivas (humor) a partir de anotaciones pairwise.
- Uso como funcion de recompensa en pipelines de aprendizaje por refuerzo para generacion de humor.
- Capacidad de ensemble: promedio de recompensas entre multiples semillas del mismo modelo.
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni para uso como agente.
- Capacidades multilingues limitadas al espanol.

## Casos de uso

- Entrenamiento por refuerzo de generadores de chistes: el modelo actua como funcion de recompensa en un bucle RLHF, puntuando cada chiste generado frente a una noticia de referencia para guiar la politica hacia salidas mas graciosas segun las preferencias humanas anotadas.
- Filtrado y ranking de candidatos en produccion de contenido humoristico: dado un lote de chistes generados para una noticia, el modelo ordena las opciones y permite seleccionar la mejor o descartar las peores antes de publicacion.
- Evaluacion automatica de sistemas de generacion de humor: se puede usar como metrica de preferencia aprendida para comparar dos versiones de un generador sin necesidad de anotacion humana en cada iteracion.
- Investigacion en modelado de preferencias subjetivas: la variante con empates sirve como referencia reproducible para estudiar como tratar anotaciones ambiguas en tareas de humor.
- Construccion de datasets de preferencia: el modelo puede pre-etiquetar parejas de chistes para priorizar la revision humana, reduciendo el coste de anotacion en nuevas campanas.
- Experimentacion academica en espanol: al estar basado en BERTIN y publicarse con hiperparametros, particiones y codigo, es adecuado para replicar experimentos de reward modeling en un idioma con menos recursos que el ingles.
- Integracion en pipelines de evaluacion offline: como checkpoint de `transformers` de clasificacion de secuencias, puede cargarse en infraestructura estandar de inferencia para puntuar lotes de parejas en procesos batch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento documentado es el objetivo cross-validated del mejor trial de Optuna (0,4939), que no es directamente comparable con metricas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un encoder RoBERTa base con `max_length` 256 y un repositorio de 0,5 GB, la huella es reducida y cabe holgadamente en GPUs de consumo, aunque no se publican cifras concretas.
- GPU recomendadas: no disponibles en la informacion proporcionada; por el tamano del checkpoint, una GPU de consumo moderna es suficiente en la practica.
- Cabe en consumer GPU: si, por el tamano del repositorio (0,5 GB) y la longitud maxima de 256 tokens, aunque no se especifican modelos concretos.
- Opciones de despliegue: carga mediante el codigo de la tesis (`hub_upload.load_ensemble_from_hub` / `load_best_trial_from_hub`) con `transformers`; al ser un checkpoint estandar de clasificacion de secuencias, es compatible con infraestructura de inferencia basada en `transformers`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de reward modeling en espanol ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para puntuar chistes en espanol a partir de una noticia; su uso fuera de ese dominio no esta validado.
- El conjunto de entrenamiento es pequeno (1670 parejas), lo que limita la generalizacion y aumenta el riesgo de sobreajuste a los estilos de chiste presentes en los datos.
- Riesgo de sesgo: las preferencias humanas anotadas pueden reflejar sesgos culturales, de genero o de otro tipo presentes en los anotadores, y el modelo los aprendera.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de calibracion: la recompensa puede no correlacionar con la graciosidad percibida en dominios o formatos alejados de los datos de entrenamiento.
- Limitacion de contexto: `max_length` de 256 tokens, insuficiente para noticias o chistes largos.
- Limitacion de idioma: solo espanol.
- La licencia MIT permite uso comercial, pero el modelo base BERTIN y sus condiciones deben verificarse por separado.
- Para produccion es necesario cargar el wrapper de configuracion del repositorio de la tesis; una carga directa como clasificador de `transformers` no restaura el umbral de empate ni la longitud maxima original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni validacion externa.
- El modelo se actualiza cuando un trial supera al anterior, de modo que las versiones anteriores solo quedan en el historial de commits; conviene fijar una revision concreta para reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cbmusetti/reward-model-spanish_with_ties
- Modelo base BERTIN: https://huggingface.co/bertin-project/bertin-roberta-base-spanish
- Repositorio de la tesis (codigo y registros de experimentos): https://github.com/carlos-musetti/tesis
