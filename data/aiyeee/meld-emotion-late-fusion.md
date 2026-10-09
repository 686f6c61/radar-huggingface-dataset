# Aiyeee/meld-emotion-late-fusion

## Resumen

meld-emotion-late-fusion es un clasificador multimodal de emociones publicado por el usuario Aiyeee en HuggingFace. Se trata de un conjunto de pesos (no de un modelo generativo) que implementa una arquitectura de late fusion sobre RoBERTa-base y wav2vec 2.0-base para predecir una de siete emociones (anger, disgust, fear, joy, neutral, sadness, surprise) a partir de texto y voz en ingles. El modelo esta entrenado exclusivamente sobre el corpus MELD, un dataset de dialogos de la serie Friends con anotaciones emocionales a nivel de turno.

La relevancia del modelo es acotada pero clara: sirve como implementacion de referencia y pesos listos para el Space de demostracion del autor, y aporta una comparacion empirica entre fusion tardia (texto + voz) y texto solo. Los resultados publicados en la model card muestran una mejora modesta pero estadisticamente significativa de la fusion multimodal sobre texto solo (weighted F1 63.9 ± 0.9 frente a 62.6 ± 0.7 en el conjunto de test de MELD), lo que resulta util como punto de partida para quien trabaje en reconocimiento de emociones en conversacion.

El tamano del repositorio es de 1,0 GB e incluye tres checkpoints en formato PyTorch: uno multimodal (texto + voz), uno de texto solo y uno de audio solo. La licencia es GPL-3.0, heredada probablemente del codigo base, lo que condiciona su uso comercial. No hay pipeline declarado ni descargas registradas en el momento de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Late fusion: RoBERTa-base (texto) concatenado con la suma ponderada por softmax de los 13 estados ocultos de wav2vec 2.0-base (audio), seguido de MLP 1536 → 256 → 7 |
| Parametros totales | no disponible (los dos encoders base suman aproximadamente 125 M de RoBERTa-base y 95 M de wav2vec 2.0-base, segun especificaciones publicas de los modelos base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; RoBERTa-base admite hasta 512 tokens de texto. El audio se procesa con mean pooling sobre el tiempo, por lo que no hay una ventana declarada |
| Tipos de cuantizacion | no disponible (solo se publican checkpoints .pt en precision nativa) |
| Idiomas soportados | ingles (en) |
| Licencia | GPL-3.0 |
| Formato de pesos | PyTorch (.pt) mas archivos .json con config y model_kwargs; temperaturas de calibracion en demo_temperatures.json |

## Arquitectura y entrenamiento

La arquitectura se define en la clase `LateFusionClassifier` del modulo `src/fusion_day10.py` del repositorio de codigo. La rama de texto utiliza el vector del token `<s>` de RoBERTa-base, afinado durante el entrenamiento y normalizado con LayerNorm. La rama de audio congela wav2vec 2.0-base, extrae sus 13 estados ocultos, los combina mediante una suma con pesos aprendidos por softmax, aplica mean pooling sobre el eje temporal y LayerNorm. Ambos vectores se concatenan (1536 dimensiones) y pasan por un MLP con capas 1536 → 256 → 7, con salida sobre las siete clases emocionales.

El entrenamiento se realiza sobre MELD con semilla 42 y tres seeds para la evaluacion en test (2610 enunciados). Se publican tres checkpoints: `fusion_best.pt` (epoca 5, texto + voz, dev weighted F1 0,6008), `fusion_day13_text.pt` (epoca 4, texto, dev weighted F1 0,6039) y `fusion_day13_audio_e20.pt` (epoca 13, voz, dev weighted F1 0,4357). No se documenta el uso de RLHF ni de DPO, ya que no es un modelo generativo. Se aplica temperature scaling ajustado sobre dev y almacenado en `demo_temperatures.json` para calibrar probabilidades. No se especifica el numero de tokens de entrenamiento ni la composicion exacta del dataset mas alla de indicar que procede de MELD.

## Capacidades

- Clasificacion de emociones en texto y voz: predice una de siete clases (anger, disgust, fear, joy, neutral, sadness, surprise) a partir de un enunciado y su audio asociado.
- Fusion multimodal tardia: combina representaciones de texto y de audio en el nivel de caracteristica, con la posibilidad de usar solo texto (`fusion_day13_text.pt`) o solo audio (`fusion_day13_audio_e20.pt`).
- Procesamiento de dialogos en ingles: entrenado sobre conversaciones multi-turno de MELD, por lo que maneja lenguaje coloquial propio de sitcom estadounidense.
- Calibracion de probabilidades: incluye temperaturas ajustadas en dev para suavizar las salidas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador discriminativo, no un modelo generativo.
- Capacidades multilingues: limitadas al ingles.
- No incorpora capacidades de vision, audio generativo ni modo de pensamiento.

## Casos de uso

- Analisis de emociones en transcripciones de reuniones o llamadas: el modelo puede etiquetar cada turno de un dialogo en ingles con una de las siete emociones, usando la rama de texto sola si no hay audio disponible para reducir coste de inferencia.
- Moderacion de comunidades y soporte tecnico: permite priorizar tickets o mensajes con carga emocional negativa (anger, disgust, fear, sadness) para que un agente humano los revise antes.
- Investigacion academica en fusion multimodal: sirve como linea base reproducible con pesos y codigo publicados para comparar early, late, hybrid y meta fusion sobre MELD, como discute el paper de Nature Scientific Reports enlazado en la seccion de enlaces.
- Sistemas de accesibilidad y subtitulado emocional: anadir una capa emocional a subtitulos de contenido audiovisual en ingles, aprovechando la rama de audio solo cuando no exista transcripcion.
- Analisis de experiencia de cliente en BPO: marcar automaticamente la emocion de cada intervencion en llamadas grabadas en ingles para calcular distribuciones de sentimiento por agente o campana.
- Docencia y prototipado con el Space de demostracion: el modelo esta disenado para alimentar el Space Aiyeee/multimodal-emotion-demo, util para demostraciones en clase o evaluaciones internas rapidas.
- Generacion de datasets aumentados: usar las etiquetas del modelo para preanotar nuevos corpus conversacionales en ingles antes de una revision humana.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre MELD (weighted F1). El conjunto de test tiene 2610 enunciados y los valores multimodales corresponden a la media de 3 seeds.

| Configuracion | Modalidad | MELD dev weighted F1 | MELD test weighted F1 |
|---|---|---|---|
| fusion_best.pt (epoca 5) | texto + voz | 0,6008 | 63,9 ± 0,9 |
| fusion_day13_text.pt (epoca 4) | texto | 0,6039 | 62,6 ± 0,7 |
| fusion_day13_audio_e20.pt (epoca 13) | voz | 0,4357 | 45,5 ± 0,3 |

La mejora de texto + voz sobre texto solo es de +1,3 puntos, con un intervalo de confianza al 95 % de [+0,5, +2,0] calculado con bootstrap pareado sobre la media de las tres seeds. Con transcripciones de Whisper-small en lugar del texto de referencia, el weighted F1 de test cae de 63,4 a 52,3 (seed 42), lo que cuantifica la sensibilidad del sistema a la calidad de la transcripcion.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2-4 GB para inferencia en FP32 con lotes pequenos (RoBERTa-base mas wav2vec 2.0-base suman alrededor de 220 M de parametros, unos 880 MB en FP32 y unos 440 MB en FP16), mas el coste de los 13 estados ocultos de wav2vec 2.0 conservados en memoria.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4070 o RTX 4090 permiten inferencia con margen amplio. En el rango profesional, A100 o H100 solo tienen sentido si se procesan grandes lotes o se despliegan en streaming.
- Inferencia en CPU: viable para uso no interactivo o lotes pequenos, ya que el modelo no es generativo y no requiere decodificacion autoregresiva.
- Opciones de despliegue: PyTorch nativo con la clase `LateFusionClassifier` y los checkpoints `.pt`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos. Se puede exportar a TorchScript o ONNX, aunque el autor no proporciona artefactos de este tipo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo / trabajo | Enfoque | Dataset | Metrica reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aiyeee/meld-emotion-late-fusion | Late fusion RoBERTa-base + wav2vec 2.0-base | MELD | Weighted F1 63,9 (texto + voz, test) | GPL-3.0 | Pesos en HuggingFace |
| DeepMSI-MER | Fusion multimodal (early/late segun el articulo) | IEMOCAP y MELD | Mejora de accuracy y robustez frente a lineas base, sin cifra concreta en el resumen consultado | no disponible | Paper en arXiv |
| ResNet50 + LSTM con late fusion | Late fusion audiovisual | RAVDESS y MELD | 90,03 % en RAVDESS y 88,57 % en MELD (accuracy, no weighted F1) | no disponible | Publicacion PICT |
| Benchmark early/late/hybrid/meta fusion | Comparativa de tecnicas de fusion | MELD | No disponible en el extracto consultado | no disponible | Paper en Nature Scientific Reports |

Las metricas no son directamente comparables entre filas: el modelo de esta ficha reporta weighted F1, mientras que el trabajo de ResNet50 + LSTM reporta accuracy. La diferencia entre F1 ponderado y accuracy sobre MELD puede ser notable debido al desbalanceo de clases (neutral es la mayoritaria).

## Limitaciones y advertencias

- Predominio del texto: la late fusion esta dominada por la rama textual, por lo que el mismo enunciado con entonaciones distintas tiende a recibir la misma etiqueta. La mejora multimodal es de solo 1,3 puntos de weighted F1.
- Sesgo de dominio: la rama de audio solo ha visto audio de Friends y tiende a predecir neutral con hablantes y microfonos nuevos, lo que limita su generalizacion fuera del dataset.
- Ausencia de etiqueta de sarcasmo: MELD no anota ironia, de modo que el modelo no puede reconocerla ni distinguirla de emociones literales.
- Dependencia de la transcripcion: con Whisper-small en lugar de texto de referencia, el weighted F1 cae de 63,4 a 52,3, mas de diez puntos.
- Idioma: solo ingles. No se ha evaluado en castellano ni en otros idiomas.
- Licencia GPL-3.0: la licencia copyleft puede condicionar la integracion en productos propietarios. Conviene revisar con asesoria legal antes de un uso comercial que distribuya binarios o derive el codigo.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de sobreconfianza en las probabilidades si no se aplica la calibracion de temperatura incluida.
- Sin datos de benchmarks externos: los numeros publicados provienen exclusivamente de MELD y no hay validacion cruzada en otros corpus como IEMOCAP mas alla de lo citado en la literatura de referencia.
- Modelo sin descargas ni likes registrados: no hay evidencia de uso en produccion ni validacion por terceros.

## Enlaces

- HuggingFace: https://huggingface.co/Aiyeee/meld-emotion-late-fusion
- Space de demostracion: https://huggingface.co/spaces/Aiyeee/multimodal-emotion-demo
- Codigo en GitHub: https://github.com/Justin-Chen2333/multimodel_emotion
- Dataset MELD: declare-lab/MELD
- Modelos base: FacebookAI/roberta-base, facebook/wav2vec2-base
- Paper Nature Scientific Reports sobre early, late, hybrid y meta fusion en MELD: https://www.nature.com/articles/s41598-026-68674-5.pdf
- Paper IEEE sobre clasificacion multimodal de emociones con late fusion: https://ieeexplore.ieee.org/document/11451391
- Publicacion PICT sobre reconocimiento de emociones con deep learning y late fusion: https://pict.edu/PICT_OFFICE/uploads/publications/2026/05/pub_1778404022_75698efa.pdf
- Segunda publicacion PICT relacionada: https://pict.edu/PICT_OFFICE/uploads/publications/2026/05/pub_1778401362_51b12898.pdf
- DeepMSI-MER en arXiv: https://arxiv.org/html/2502.08573v1
