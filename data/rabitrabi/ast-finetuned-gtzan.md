# rabitrabi/ast-finetuned-gtzan

## Resumen

AST Finetuned GTZAN es un clasificador de genero musical de diez clases construido sobre el Audio Spectrogram Transformer (AST) preentrenado en AudioSet (`MIT/ast-finetuned-audioset-10-10-0.4593`). El autor, `rabitrabi`, congela el codificador del modelo base y entrena unicamente una cabeza lineal de clasificacion sobre el dataset GTZAN (`marsyas/gtzan`), el corpus de referencia de 1.000 pistas etiquetadas en diez generos (blues, classical, country, disco, hiphop, jazz, metal, pop, reggae y rock).

El modelo resuelve una tarea acotada y bien definida: dada una muestra de audio, asignar uno de los diez generos musicales. No es un modelo generativo ni conversacional; es un clasificador discriminativo de audio que trabaja sobre espectrogramas de mel. Su interes practico esta en servir como linea base reproducible para experimentos de clasificacion musical y como ejemplo de ajuste minimo (cabeza lineal sobre encoder congelado) sobre un transformer de audio.

La relevancia del modelo es limitada: se publico en noviembre de 2026, no tiene descargas ni likes, el repositorio pesa 0.0 GB (la cabeza entrenada es de dimension reducida, ya que el encoder se descarga del modelo base) y la evaluacion se hizo con una particion aleatoria por pista, no por artista, lo que infla la accuracy respecto a una evaluacion realista de generalizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Spectrogram Transformer (AST) con encoder congelado y cabeza lineal entrenada |
| Parametros totales | no disponible (el encoder corresponde a `MIT/ast-finetuned-audioset-10-10-0.4593`; el repo solo almacena la cabeza) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; la entrada se procesa en segmentos de 10 segundos y el script analiza los primeros 30 segundos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tarea de audio, sin componente linguistico) |
| Licencia | no disponible |
| Formato de pesos | no disponible en la informacion proporcionada (el repo incluye la cabeza entrenada y un `predict.py`) |

## Arquitectura y entrenamiento

El modelo parte de `MIT/ast-finetuned-audioset-10-10-0.4593`, un Audio Spectrogram Transformer preentrenado en AudioSet (10-10 hace referencia a la configuracion de parches de 10x10). Sobre ese encoder congelado, el autor entrena una cabeza lineal de clasificacion para diez clases. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla de GTZAN, ni si se aplicaron tecnicas de aumento de datos o regularizacion.

El ajuste se realiza sobre `marsyas/gtzan` con una particion aleatoria por pista y semilla 42, manteniendo todos los segmentos de una misma pista en el mismo split para evitar fuga de informacion entre train y test. La evaluacion promedia predicciones sobre segmentos de 10 segundos y analiza los primeros 30 segundos de cada audio. El propio autor advierte que no se evaluo la generalizacion a nivel de artista, lo que constituye una limitacion metodologica relevante.

## Capacidades

- Clasificacion de audio en diez generos musicales: blues, classical, country, disco, hiphop, jazz, metal, pop, reggae y rock.
- Procesamiento de audio de entrada en formato WAV mediante `predict.py` (requiere PyTorch, Transformers 4.57.6, SciPy y SoundFile).
- Analisis de los primeros 30 segundos del audio, con promedio de predicciones sobre segmentos de 10 segundos.
- Inferencia sobre encoder congelado: solo se ejecuta la cabeza lineal entrenada, lo que reduce el coste de computo respecto a un ajuste completo.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni generacion de texto.
- No tiene capacidades multilingues ni de vision.
- No dispone de modo thinking ni de salida estructurada mas alla de la etiqueta de clase.

## Casos de uso

- Clasificacion automatica de genero en bibliotecas musicales: el modelo permite etiquetar pistas en diez generos con una accuracy declarada de 0.89 sobre el split de evaluacion, util para organizar catalogos pequenos o medianos.
- Linea base para experimentos academicos: sirve como referencia reproducible (semilla 42, split por pista) para comparar tecnicas de ajuste sobre AST en tareas de clasificacion musical.
- Filtrado previo en pipelines de recomendacion: la etiqueta de genero puede alimentar un sistema de recomendacion como señal auxiliar, dado el bajo coste de inferencia al usar encoder congelado.
- Prototipado rapido en investigacion de MIR (Music Information Retrieval): el script `predict.py` permite obtener predicciones sobre un fichero WAV concreto sin infraestructura adicional.
- Docencia y demos de clasificacion de audio: el modelo ilustra el flujo completo de ajuste de una cabeza lineal sobre un transformer de audio preentrenado, con codigo de inferencia incluido.
- Analisis de colecciones personales: un usuario puede clasificar sus propios ficheros WAV por genero para tareas de curaduria, asumiendo las limitaciones de generalizacion del split aleatorio.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Music genre classification | GTZAN (`marsyas/gtzan`) | Accuracy | 0.89 |

El autor indica que el clasificador identifico correctamente 89 de 100 pistas reservadas de GTZAN, con split por pista y semilla 42. No se han publicado otros resultados de benchmarks en la informacion disponible, ni comparaciones con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Al tratarse de un encoder AST congelado mas una cabeza lineal, el requisito es el del modelo base `MIT/ast-finetuned-audioset-10-10-0.4593`, que no se detalla en la informacion proporcionada.
- GPU recomendadas: no disponible. El modelo base AST es de tamano moderado y cabe previsiblemente en GPUs consumer, pero no se aportan medidas concretas.
- Compatibilidad con GPU consumer: no confirmada en la informacion disponible.
- Opciones de despliegue: el repositorio proporciona `predict.py` basado en PyTorch, Transformers 4.57.6, SciPy y SoundFile. No se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos generativos, no aplicables directamente a este clasificador).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. Como referencia estructural, el modelo se apoya en `MIT/ast-finetuned-audioset-10-10-0.4593` (encoder AST preentrenado en AudioSet), pero no se aportan metricas de ese modelo ni de otras alternativas de clasificacion de genero sobre GTZAN para establecer una comparacion cuantitativa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AST Finetuned GTZAN (este) | no disponible | segmentos de 10 s | 0.89 accuracy en GTZAN | no disponible | Hugging Face |
| MIT/ast-finetuned-audioset-10-10-0.4593 | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de clasificacion de genero | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Evaluacion con split aleatorio por pista, no por artista: el propio autor advierte que no se evaluo la generalizacion a nivel de artista, por lo que la accuracy de 0.89 puede sobreestimar el rendimiento en pistas de artistas no vistos.
- GTZAN es un dataset pequeno (1.000 pistas, 100 por genero) y con problemas conocidos de etiquetado y duplicados; el rendimiento en dominios reales puede diferir.
- Solo diez clases de genero: no cubre subgeneros, generos regionales ni audios que no encajen en la taxonomia de GTZAN.
- Sin informacion sobre licencia: no se puede confirmar el uso comercial; conviene contactar con el autor antes de desplegarlo en produccion.
- Sin informacion sobre sesgos: no se documentan sesgos de genero musical, origen cultural ni desequilibrios del dataset.
- Riesgo de alucinacion no aplica en sentido estricto (es un clasificador), pero si existe riesgo de predicciones erroneas con alta confianza en audios fuera de distribucion.
- Repositorio con 0 descargas y 0 likes, publicado en noviembre de 2026: no hay evidencia de validacion comunitaria ni de mantenimiento.
- El repositorio pesa 0.0 GB: la cabeza entrenada es minima y el encoder se descarga en el primer uso, lo que introduce dependencia de la disponibilidad del modelo base.
- Solo procesa los primeros 30 segundos del audio, lo que puede ser insuficiente para pistas con estructura de genero tardia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rabitrabi/ast-finetuned-gtzan
- Modelo base: https://huggingface.co/MIT/ast-finetuned-audioset-10-10-0.4593
- Dataset GTZAN: https://huggingface.co/datasets/marsyas/gtzan
