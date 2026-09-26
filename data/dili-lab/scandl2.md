# DiLi-Lab/ScanDL2

# ScanDL 2.0: modelo generativo de movimientos oculares durante la lectura

## Resumen

ScanDL 2.0 es un modelo generativo que sintetiza trayectorias de fijación ocular (scanpaths) y duraciones de fijación para texto leído, es decir, predice en qué palabras se detendría la mirada de una persona y cuánto tiempo permanecería en cada una. Lo desarrolla el grupo DiLi-Lab y se distribuye junto con los pesos preentrenados en este repositorio de Hugging Face, que reempaqueta la implementación original de los autores bajo el paquete `ScanDL2` con un `handler.py` y una interfaz Gradio (`app.py`) añadidos.

El modelo se presenta en el artículo "ScanDL 2.0: A Generative Model of Eye Movements in Reading Synthesizing Scanpaths and Fixation Durations" (DOI 10.1145/3725830). Se distribuyen dos variantes preentrenadas: una a nivel de frase, entrenada sobre el corpus CELER, y otra a nivel de párrafo, entrenada sobre el corpus EMTeC. Ambas generan ubicaciones de fijación y duraciones sin necesidad de reentrenamiento.

Es relevante para investigación en psicolingüística, modelado cognitivo de la lectura y evaluación de la plausibilidad cognitiva de modelos de lenguaje, ya que permite obtener datos de mirada sintéticos sobre texto nuevo. La reorganización del repositorio no introduce una arquitectura nueva: el modelo es el mismo que el de la implementación de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la informacion disponible; combina un modulo de generacion de scanpaths (`scandl-module`, con inferencia de tipo difusion segun la model card) y un modulo seq2seq para duraciones de fijacion (`fixdur-module`). Depende de activos de BERT y GPT-2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; la model card indica que las longitudes de entrada y de scanpath estan acotadas por la configuracion del modelo y que los documentos largos deben dividirse antes de la inferencia |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints PyTorch `.pt`) |
| Idiomas soportados | no disponible en la informacion proporcionada; los corpus de preentrenamiento citados son EMTeC (nivel de parrafo) y CELER (nivel de frase) |
| Licencia | CC0-1.0 |
| Formato de pesos | Checkpoints PyTorch (`.pt`): `ema_0.9999_080000.pt`, `seq2seq_fixdur.pt`, `min_max_scaler.pkl`, `training_args.json`, `hyperparameters.json` |

## Arquitectura y entrenamiento

El sistema se compone de dos modulos entrenados por separado que despues se combinan en inferencia. El `scandl-module` se encarga de las ubicaciones de fijacion y, segun la model card, emplea inferencia de tipo difusion (con pesos EMA guardados en `ema_0.9999_080000.pt`). El `fixdur-module` es un modulo seq2seq que predice las duraciones de fijacion en milisegundos, con un escalador min-max (`min_max_scaler.pkl`) para normalizar el objetivo. El flujo de trabajo original entrena ambos modulos y despues evalua su salida combinada.

El preentrenamiento publicado usa EMTeC para la generacion a nivel de parrafo y CELER para la generacion a nivel de frase. El modelo requiere activos de BERT y GPT-2 disponibles desde Hugging Face o la cache local, lo que sugiere que estos se emplean como componentes de codificacion de texto. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta de los datasets ni si se aplicaron tecnicas de alineacion como RLHF o DPO; por tanto, esos datos se consideran no disponibles.

## Capacidades

- Generacion de scanpaths: devuelve las palabras fijadas en orden (`predicted_sp_words`) y sus indices de posicion (`predicted_sp_ids`).
- Prediccion de duraciones de fijacion en milisegundos (`predicted_fix_durs`).
- Dos modos de generacion: a nivel de frase (`text_type="sentence"`, pesos de CELER) y a nivel de parrafo (`text_type="paragraph"`, pesos de EMTeC).
- Entrada flexible: acepta una cadena de texto o una lista de cadenas, con tamano de lote configurable (`bsz`).
- Salida estructurada en diccionario, con el texto original tokenizado (`original_sn`) y un identificador por entrada (`unique_idx`); permite exportacion a JSON mediante los parametros `save` y `filename`.
- Inferencia estocastica: la generacion no es determinista, por lo que distintas ejecuciones producen scanpaths distintos.
- Interfaz web Gradio (`python -m ScanDL2.app`) que procesa cada linea no vacia como una entrada independiente y muestra una tabla de fijaciones y el JSON crudo.
- Adaptador de endpoint (`EndpointHandler` en `handler.py`) que acepta `inputs` (texto) y `parameters` (`text_type`, `bsz`) y devuelve el diccionario de salida; no levanta por si mismo un servidor HTTP.
- Aceleracion por GPU: la implementacion local selecciona CUDA cuando esta disponible y CPU en caso contrario.

## Casos de uso

- Investigacion en psicolinguistica: generar scanpaths sinteticos sobre estimulos textuales nuevos para formular hipotesis antes de ejecutar un experimento de eye-tracking con participantes humanos, aprovechando la prediccion conjunta de posiciones y duraciones.
- Aumento de datos de eye-tracking: ampliar corpus existentes con trayectorias sinteticas a nivel de frase o de parrafo para entrenar modelos de prediccion de mirada, usando la salida en JSON para integrarla en pipelines de analisis.
- Evaluacion de la plausibilidad cognitiva de modelos de lenguaje: comparar las trayectorias generadas por un LLM o un modelo de lectura con los scanpaths de ScanDL 2.0 como referencia de comportamiento humano.
- Analisis de legibilidad y diseno de textos: identificar las palabras que concentran mas fijaciones y mayor duracion en un parrafo concreto para detectar fragmentos que ralentizan la lectura en documentacion tecnica o material educativo.
- Interaccion persona-ordenador y lectura asistida: alimentar sistemas que adaptan la presentacion del texto (resaltado, simplificacion, fragmentacion) a partir de las fijaciones previstas, especialmente en el modo parrafo.
- Docencia e interfaces demostrativas: desplegar la interfaz Gradio incluida para mostrar en clase o en talleres como varia la mirada predicha entre frases y parrafos, con salida de tabla y JSON lista para inspeccion.
- Prototipado de servicios de inferencia: usar el `EndpointHandler` para envolver el modelo en una API propia con los parametros `text_type` y `bsz`, integrando la prediccion en una aplicacion mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el procedimiento de evaluacion de la salida combinada de ambos modulos, pero no incluye cifras comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 2,0 GB, pero se desconoce el reparto exacto entre pesos de los dos modulos y activos auxiliares de BERT y GPT-2.
- GPU recomendadas: no disponibles en la informacion proporcionada. La implementacion soporta CUDA y tambien CPU.
- GPU de consumo: la model card no confirma compatibilidad con GPU de consumo; no obstante, la ejecucion en CPU es posible aunque la inferencia por difusion resulta lenta, lo que sugiere que una GPU acelera de forma apreciable el `scandl-module`.
- Opciones de despliegue: ejecucion local con PyTorch (seleccion automatica de CUDA o CPU), interfaz Gradio en el puerto 7860 (configurable con `PORT`, enlazada a `0.0.0.0`) y adaptador `EndpointHandler` para servicios propios. No se menciona soporte para vLLM, TGI, llama.cpp ni Ollama, que ademas no aplican a checkpoints `.pt` de este tipo.
- Requisitos de entorno: se necesita una version de Python compatible con los pines antiguos de `requirements.txt`; el entorno debe ser distinto al de Eyettention porque las versiones de dependencias difieren. La inicializacion distribuida requiere un socket local. BERT y GPT-2 deben estar accesibles desde Hugging Face o la cache local.
- Latencia y throughput: no disponibles. La model card solo indica de forma cualitativa que la inferencia por difusion puede ser lenta en CPU.

## Comparativa con modelos similares

| Modelo | Desarrollo | Nivel de generacion | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ScanDL 2.0 | DiLi-Lab | Frase y parrafo | Scanpaths y duraciones de fijacion | CC0-1.0 | Pesos en Hugging Face y releases de GitHub |
| ScanDL (version original) | DiLi-Lab | No detallado en la informacion disponible | Scanpaths | no disponible | Implementacion de referencia citada en el articulo de ScanDL 2.0 |
| Eyettention | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | Mencionado en la model card como modelo con dependencias incompatibles con ScanDL 2.0 |

No se dispone de datos de parametros, contexto, rendimiento o licencia de las alternativas; la comparacion se limita a lo citado en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado cifras de benchmarks en la informacion disponible, por lo que el rendimiento frente a alternativas no puede verificarse con los datos facilitados.
- La generacion es estocastica: dos llamadas con la misma entrada pueden producir scanpaths distintos, lo que complica la reproducibilidad exacta de resultados.
- Los indices de palabra devueltos en `predicted_sp_ids` proceden de la secuencia interna del modelo, que incluye tokens especiales; no deben interpretarse como desplazamientos desde cero sobre `original_sn`.
- Las longitudes de entrada y de scanpath estan acotadas por la configuracion del modelo; los documentos largos deben dividirse manualmente antes de la inferencia.
- El modelo esta especializado en lectura de texto: no genera lenguaje, no hace razonamiento, no soporta tool calling ni agentes, y no procesa vision ni audio.
- Los corpus de preentrenamiento citados (EMTeC y CELER) condicionan el dominio y el idioma en que el modelo es utilizable; la model card no declara el conjunto de idiomas soportados, por lo que el comportamiento fuera de esos corpus es incierto.
- No se documentan sesgos especificos ni tasas de error, pero al tratarse de un modelo entrenado sobre datos de lectura de poblaciones concretas, sus predicciones pueden no generalizar a otros perfiles de lectores (por ejemplo, lectores con dislexia o hablantes no nativos).
- Los pesos completos no estan incluidos en el repositorio: `models.zip` debe descargarse de los releases de GitHub y colocarse en `ScanDL2/models/` con las rutas ajustadas en `PATHS.py`.
- El codigo usa pines de dependencias antiguos y requiere una version de Python compatible; la inicializacion distribuida necesita un socket local, lo que restringe algunos entornos contenerizados.
- La licencia CC0-1.0 no impone restricciones conocidas para uso comercial, pero el aviso se refiere a la licencia declarada en el repositorio; conviene verificar los terminos de los corpus y de los activos de BERT y GPT-2 empleados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DiLi-Lab/ScanDL2
- Articulo (DOI): https://doi.org/10.1145/3725830
- Repositorio de los autores: https://github.com/DiLi-Lab/ScanDL-2.0
- Releases con `models.zip`: https://github.com/DiLi-Lab/ScanDL-2.0/releases
