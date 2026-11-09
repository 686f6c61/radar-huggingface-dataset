# colarpink/MDMER_Code

## Resumen

`colarpink/MDMER_Code` no es un modelo de lenguaje ni una red neuronal preentrenada, sino un repositorio de código fuente asociado al proyecto "Multimodal Dataset for Mixed Emotion Recognition" (MDMER). Contiene scripts en MATLAB y Python destinados al preprocesamiento de señales fisiológicas (EEG, GSR y PPG) y vídeo facial, la extracción de características por modalidad y la clasificación supervisada de emociones mixtas (positivas, negativas y mixtas) mediante SVM y Random Forest.

El repositorio ocupa 4,0 GB, lo que sugiere que, además de los scripts, incluye datos derivados o intermedios del conjunto multimodal. No se declara licencia, idiomas ni pipeline de Hugging Face, y no contiene pesos de modelo en formato safetensors o GGUF. Su relevancia es acotada: sirve como material reproducible para investigadores en afectividad computacional y reconocimiento de emociones multimodales, no como artefacto desplegable para inferencia.

Al no tratarse de un modelo generativo, las secciones de arquitectura, capacidades y benchmarks se reinterpretan en términos del pipeline experimental descrito en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de procesamiento de señales y clasificadores clasicos (SVM, Random Forest); no es una red neuronal |
| Parametros totales | no disponible (no aplica; no contiene pesos de modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (documentacion y comentarios en ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de codigo MATLAB y Python; sin safetensors ni GGUF) |

## Arquitectura y entrenamiento

El repositorio implementa un pipeline multimodal en dos fases. La primera es de preprocesamiento y extracción de características: `PreprocessEEG.m` selecciona 18 de 24 canales EEG, aplica re-referenciación, filtrado e ICA; `Pip_ICARecon.m` reconstruye la señal desde componentes ICA; `Format_Data.m` y `Format_video.py` segmentan las señales y el vídeo facial en ensayos; `AlignAllData.py` alinea EEG, GSR, PPG y vídeo usando el final del ensayo como referencia. La segunda fase extrae descriptores: entropía diferencial (DE) en cinco bandas (delta 1-3 Hz, theta 4-7 Hz, alpha 8-13 Hz, beta 14-30 Hz, gamma 31-50 Hz) sobre 18 canales en `fea4eeg.py`; características temporales y frecuenciales de GSR y PPG en `perifeaext.py`; y descriptores LBP-TOP de los clips de vídeo en `LBP-TOP.py`. `PrepareFeatures4Subj.m` consolida las cuatro modalidades.

La clasificación se realiza en `CLS.py` con SVM y Random Forest, evaluando combinaciones de modalidades. El protocolo es dependiente del sujeto: cada ensayo se divide 4:1, la primera parte de todos los ensayos forma el conjunto de entrenamiento y la segunda el de test, y se reporta la media de cinco ejecuciones por sujeto. No hay entrenamiento de redes profundas, ni RLHF/DPO, ni datos de preentrenamiento a gran escala. El entorno declarado es MATLAB R2019b, EEGLab v2021.1, Python 3.8 y opencv-python 4.5.

## Capacidades

- Preprocesamiento de EEG: selección de canales, re-referenciación, filtrado y descomposición/reconstrucción ICA.
- Segmentación por ensayos de señales EEG, GSR, PPG y vídeo facial.
- Alineación temporal multimodal con el final del ensayo como punto de referencia.
- Extracción de entropía diferencial en cinco bandas de frecuencia sobre 18 canales.
- Extracción de características temporales y frecuenciales de GSR y PPG con filtrado paso banda previo.
- Extracción de descriptores LBP-TOP de clips de vídeo facial.
- Clasificación de emociones en tres clases (positiva, negativa, mixta) con SVM y Random Forest.
- Evaluación por sujeto con partición 4:1 y media de cinco repeticiones.
- No soporta tool calling, agentes, generación de texto ni razonamiento de múltiples pasos.

## Casos de uso

- Reproduccion de experimentos de reconocimiento de emociones mixtas: el repositorio permite replicar el pipeline completo desde la señal cruda hasta la clasificación, lo que facilita la comparación con futuros trabajos que usen el dataset MDMER.
- Investigacion en fusion multimodal de senales fisiologicas y video: los scripts permiten evaluar combinaciones de EEG, GSR, PPG y LBP-TOP y medir su contribucion relativa al rendimiento del clasificador.
- Desarrollo de sistemas de afectividad computacional: sirve como linea base con SVM y Random Forest antes de sustituir los clasificadores por modelos profundos.
- Docencia y formacion en procesamiento de biosenales: el codigo esta modularizado por etapas (preprocesamiento, alineacion, extraccion, clasificacion), lo que facilita su uso en practicas guiadas.
- Validacion de pipelines de adquisicion: la alineacion por final de ensayo y la particion 4:1 pueden reutilizarse para verificar la sincronizacion de equipos EEG, GSR y camaras.
- Estudios de variabilidad inter-sujeto: el entrenamiento y evaluacion por sujeto permite analizar hasta que punto los descriptores generalizan dentro de un mismo participante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el protocolo (SVM y Random Forest, media de cinco ejecuciones por sujeto) pero no incluye cifras de exactitud, F1 ni comparaciones numericas.

## Requisitos de hardware

- VRAM: no aplica; no hay inferencia de red neuronal ni pesos que cargar en GPU.
- GPU: no necesaria para el pipeline descrito; el cuello de botella es CPU y, en su caso, E/S de disco por el tamano del repositorio (4,0 GB).
- Cabe en cualquier equipo consumer: los requisitos reales son MATLAB R2019b con EEGLab v2021.1 y Python 3.8 con opencv-python 4.5.
- Despliegue: no procede vLLM, llama.cpp, Ollama ni TGI; la ejecucion es mediante scripts MATLAB y Python en el orden indicado en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Proyecto | Tipo de artefacto | Modalidades | Clasificadores | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| colarpink/MDMER_Code | Codigo de pipeline | EEG, GSR, PPG, video facial | SVM, Random Forest | no disponible | Hugging Face (0 descargas) |
| SEED / SEED-IV (toolkits publicos) | Codigo + dataset | EEG (y video en SEED-IV) | SVM, redes profundas | academica | distribucion bajo solicitud |
| DEAP (baseline) | Codigo + dataset | EEG, perifericas | SVM, regresion | academica | distribucion bajo solicitud |
| AMIGOS (baseline) | Codigo + dataset | EEG, ECG, GSR, video | SVM, clasicos | academica | distribucion bajo solicitud |

No se dispone de datos verificados en la informacion proporcionada para establecer comparaciones numericas de rendimiento con estos proyectos.

## Limitaciones y advertencias

- No es un modelo desplegable: no contiene pesos ni permite inferencia directa sobre texto, imagen o audio.
- Ausencia de licencia explicita: impide determinar si el uso comercial esta permitido; debe contactarse con el autor antes de cualquier explotacion.
- Dependencia de MATLAB R2019b y EEGLab v2021.1, entornos de pago y con versiones fijas, lo que complica la reproducibilidad a largo plazo.
- El pipeline esta disenado para clasificacion por sujeto con particion 4:1; los resultados no garantizan generalizacion entre participantes.
- Sin datos publicados de rendimiento: no es posible evaluar la calidad del pipeline sin ejecutarlo sobre el dataset original.
- Riesgo de sobreajuste por sujeto al entrenar y evaluar con datos del mismo participante.
- Posibles sesgos del dataset subyacente (composicion demografica, estimulos emocionales, calidad de sensores) no documentados en la model card.
- El repositorio incluye 4,0 GB de contenido no detallado; parte del espacio podria corresponder a datos derivados con restricciones de privacidad no declaradas.
- Sin soporte multilingue, tool calling ni razonamiento multi-paso; cualquier uso fuera del reconocimiento de emociones mixtas queda fuera del alcance documentado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/colarpink/MDMER_Code
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
