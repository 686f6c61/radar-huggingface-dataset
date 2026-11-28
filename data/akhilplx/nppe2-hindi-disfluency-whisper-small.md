# akhilplx/nppe2-hindi-disfluency-whisper-small

## Resumen

El modelo `akhilplx/nppe2-hindi-disfluency-whisper-small` es un ajuste fino (fine-tuning) de `openai/whisper-small` orientado a una tarea poco habitual: la restauracion de texto limpio a partir de audio en hindi que contiene disfluencias (repeticiones, muletillas, frases incompletas) y de una transcripcion de texto potencialmente vacia o imperfecta. Lo desarrolla el usuario de Hugging Face `akhilplx` en el contexto de la competicion Kaggle NPPE-2, y el resultado publicado son pesos independientes con el adaptador LoRA ya fusionado.

El modelo no es un ASR generico al uso: es un sistema condicionado por texto, en el que el decodificador de Whisper recibe tanto la senal de audio como una hipotesis textual y produce una version depurada de esa transcripcion. Esta concepcion hibrida (audio + texto) lo hace relevante para pipelines de transcripcion donde ya existe una salida ASR preliminar y se necesita una segunda pasada de limpieza, en lugar de sustituir el reconocedor completo.

Arquitectonicamente hereda el encoder-decoder transformer de Whisper Small, con 241.734.912 parametros totales y un repositorio de 0,5 GB en formato safetensors. La informacion publicada es escasa: no hay datos de benchmarks en la model card, no se declara licencia explicita y el modelo no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Small), ajustado con LoRA y adaptador fusionado en los pesos finales |
| Parametros totales | 241.734.912 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (hereda la ventana de atencion de Whisper Small, no declarada en la model card) |
| Tipos de cuantizacion | No disponible (repositorio en safetensors sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | Hindi (`hi`) |
| Licencia | No disponible (la model card remite a las licencias del modelo base y dependencias) |
| Formato de pesos | safetensors |
| Modelo base | openai/whisper-small |
| Tamano del repositorio | 0,5 GB |
| Pipeline | automatic-speech-recognition |
| Entrada | Audio + texto hindi (posiblemente vacio o imperfecto) |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-small`, un transformer encoder-decoder disenado para reconocimiento de voz, y se ajusta mediante LoRA sobre los datos de entrenamiento de la competicion NPPE-2. El adaptador LoRA seleccionado como mejor se ha fusionado en los pesos finales, de modo que el repositorio contiene pesos standalone sin necesidad de cargar un adaptador aparte. El entrenamiento se realizo en Kaggle y, segun la model card, utilizo exclusivamente el split de entrenamiento de la competicion.

La innovacion principal esta en la formulacion de la tarea: el texto limpio de referencia se construye eliminando palabras y frases completas listadas como disfluencias, y el decodificador se condiciona sobre ese texto con los tokens de prompt excluidos del calculo de la perdida. Ademas del caso base, el entrenamiento incorpora limpieza parcial, artefactos de limites heredados y dropout de texto, todo derivado del split de entrenamiento. Para evitar fugas de datos, las grabaciones y transcripciones emparejadas se mantienen dentro de una unica particion de validacion. No se documentan el numero de tokens, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Restauracion de disfluencias en hindi: elimina repeticiones, muletillas y frases incompletas a partir de audio y una transcripcion textual de partida.
- Generacion condicionada por texto: el decodificador acepta una hipotesis textual (incluso vacia o imperfecta) y produce una version depurada.
- Reconocimiento de voz en hindi como capacidad heredada del modelo base Whisper Small.
- Manejo de entradas degradadas: entrenado con limpieza parcial, artefactos de limites y dropout de texto, lo que le permite operar con transcripciones incompletas.
- Politica de fusion seleccionada: la model card menciona un `nppe2_runtime.py` y un cuaderno de inferencia que implementan la generacion condicionada por texto y la politica de fusion elegida.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al hindi segun la etiqueta de idioma declarada.

## Casos de uso

- Limpieza de transcripciones ASR en hindi: se ejecuta un reconocedor generico y, en una segunda pasada, este modelo recibe el audio y la transcripcion preliminar para eliminar repeticiones y muletillas, mejorando la legibilidad del texto final.
- Generacion de subtitulos para contenido audiovisual: las grabaciones con habla espontanea suelen contener disfluencias que dificultan la lectura; el modelo produce subtitulos mas limpios conservando el contenido semantico.
- Preparacion de corpus para entrenamiento de modelos de lenguaje: las transcripciones de entrevistas o podcasts en hindi pueden depurarse antes de incorporarse a un dataset de texto, reduciendo ruido en el corpus.
- Actas y notas de reuniones: a partir del audio de una reunion y una transcripcion automatica, se obtiene un texto mas apto para resumen o indexacion posterior.
- Analisis de entrevistas cualitativas: en investigacion social o de mercado, el modelo ayuda a normalizar transcripciones de entrevistas en hindi sin perder el contenido informativo.
- Pipelines de datos a gran escala en Kaggle o entornos locales: al ejecutarse localmente y publicarse en safetensors de 0,5 GB, puede integrarse en flujos por lotes con requisitos de hardware modestos, siempre que se respeten las licencias del modelo base y de sus dependencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que `pipeline_config.json` recoge metricas agregadas de validacion y que la puntuacion ponderada de validacion no es la metrica del leaderboard de Kaggle, pero no se proporcionan los valores numericos.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de aproximadamente 242 millones de parametros, en precision fp16 requiere del orden de 0,5 GB solo para los pesos, mas memoria para activaciones y decodificacion; en la practica cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para lotes grandes o despliegue en servidor, A100 o H100 ofrecen margen sobrado.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: transformers (con el cuaderno de inferencia y `nppe2_runtime.py` proporcionados por el autor); al ser un modelo Whisper, es compatible con ecosistemas de inferencia de ASR como vLLM o TGI en la medida en que soporten la arquitectura Whisper, aunque no se documenta soporte explicito.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| akhilplx/nppe2-hindi-disfluency-whisper-small | 241,7 M | No disponible | Restauracion de disfluencias en hindi (audio + texto) | No disponible | Hugging Face, safetensors |
| openai/whisper-small | 244 M | No disponible | ASR multilingue | MIT (modelo base) | Hugging Face, ampliamente soportado |
| openai/whisper-base | 74 M | No disponible | ASR multilingue | MIT | Hugging Face |
| openai/whisper-medium | 769 M | No disponible | ASR multilingue | MIT | Hugging Face |

La comparativa se limita al modelo base y a variantes de la familia Whisper, ya que no se dispone de informacion sobre otros modelos especializados en restauracion de disfluencias en hindi. Frente a `whisper-small` original, este ajuste anade la condicionalidad por texto y la limpieza de disfluencias, pero restringe el idioma al hindi y no declara licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse con datos de una competicion concreta, puede heredar los sesgos de dominio y de hablantes de ese corpus.
- Riesgo de alucinacion: como todo modelo generativo condicionado por texto, puede introducir o eliminar contenido no presente en el audio original, especialmente con transcripciones de entrada muy degradadas.
- Limitaciones de contexto o idioma: el modelo esta disenado exclusivamente para hindi; no se garantiza su comportamiento en otros idiomas ni en code-switching.
- Restricciones de licencia: la licencia no esta declarada en el repositorio; la model card indica que deben respetarse las licencias del modelo base y de las dependencias, lo que introduce incertidumbre para uso comercial.
- Dependencia de un runtime especifico: la generacion condicionada por texto y la politica de fusion requieren el cuaderno de inferencia y `nppe2_runtime.py`; no es un modelo plug-and-play con la API estandar de transformers.
- Ausencia de benchmarks publicos: no hay metricas verificables fuera de las agregadas de validacion mencionadas en `pipeline_config.json`.
- Trazabilidad limitada: el modelo tiene cero descargas y cero likes, y su model card no detalla el volumen ni la composicion del dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akhilplx/nppe2-hindi-disfluency-whisper-small
- Modelo base: https://huggingface.co/openai/whisper-small
