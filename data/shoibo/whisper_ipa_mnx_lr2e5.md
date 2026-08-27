# shoibo/whisper_IPA_mnx_lr2e5

## Resumen
El modelo `shoibo/whisper_IPA_mnx_lr2e5` es un ajuste fino (fine-tune) de `openai/whisper-small` realizado por el usuario shoibo. Está diseñado para la tarea de reconocimiento automático del habla (ASR) y se distribuye bajo licencia Apache 2.0. El nombre sugiere una posible especialización en transcripción fonética (IPA, International Phonetic Alphabet) y el código "mnx" podría referirse a una lengua específica, aunque esta información no está confirmada en la documentación disponible.

El modelo conserva la arquitectura original de Whisper-small, un transformer encoder-decoder con aproximadamente 241,7 millones de parámetros. Se entrenó durante 25 épocas con una tasa de aprendizaje de 2e-5, alcanzando en la evaluación final una pérdida de 0,3020, un WER de 49,89 y un CER de 10,88. A pesar de que la model card está generada automáticamente y carece de detalles sobre el dataset de entrenamiento, los resultados indican que el ajuste se realizó sobre un conjunto de datos específico, probablemente relacionado con transcripción fonética o un idioma concreto.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-small (encoder-decoder transformer) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper estándar usa ventanas de 30 segundos de audio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un fine-tune de `openai/whisper-small`, por lo que hereda su arquitectura: un transformer encoder-decoder con atención multi-cabeza, diseñado originalmente para ASR multilingüe y traducción de voz. Whisper-small tiene 12 capas de encoder y 12 de decoder, con 512 dimensiones ocultas y 8 cabezas de atención. El ajuste se realizó con el framework Transformers (versión 5.15.0) y PyTorch 2.11.0, usando el optimizador AdamW con betas (0.9, 0.999) y una tasa de aprendizaje de 2e-5. Se empleó un scheduler lineal con 200 pasos de warm-up, tamaño de batch total de 16 (8 por dispositivo con acumulación de gradientes de 2) y precisión mixta nativa (AMP). El entrenamiento duró 25 épocas, aunque la tabla de resultados solo muestra hasta la época 14, donde se alcanzó el mejor WER. No se especifica el dataset de entrenamiento ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades
- Reconocimiento automático del habla (ASR): el modelo transcribe audio a texto, como cualquier variante de Whisper.
- Posible especialización en transcripción fonética (IPA) o en un idioma concreto (el sufijo "mnx" podría indicar una lengua, pero no está documentado).
- Soporte de pipeline de Transformers: se puede usar con la clase `pipeline("automatic-speech-recognition")`.
- Compatible con la librería Transformers y con el ecosistema de Hugging Face (endpoints compatibles).
- No se han documentado capacidades adicionales como tool calling, agentes o visión.

## Casos de uso
- Transcripción de audio en entornos de investigación lingüística: el modelo podría emplearse para convertir grabaciones de habla en texto fonético (IPA), útil para estudios de fonética y dialectología, aunque esta capacidad no está confirmada.
- Generación de subtítulos para vídeos o podcasts: al ser un modelo ASR, puede transcribir audio de forma automática, aunque su WER elevado (49,89) sugiere que no es adecuado para producción sin postprocesado.
- Análisis de corpus orales: investigadores podrían usarlo para transcribir entrevistas o material de archivo, siempre que el idioma objetivo coincida con el de entrenamiento (desconocido).
- Evaluación de técnicas de fine-tuning: sirve como ejemplo de ajuste de Whisper-small con hiperparámetros específicos, útil para comparar metodologías de entrenamiento.
- Prototipado de sistemas ASR: se puede integrar en demos o pruebas de concepto con Transformers, aunque su rendimiento limita su uso en aplicaciones reales.
- Investigación sobre adaptación a dominios: el modelo demuestra cómo un fine-tune puede reducir el WER de 90,21 (época 1) a 49,89 (época 14), lo que ilustra el efecto del entrenamiento en un dataset específico.

## Benchmarks y rendimiento
La model card no incluye un model-index con resultados comparativos, pero sí reporta métricas de evaluación en el conjunto de validación. Los resultados finales son:

| Metrica | Valor |
|---|---|
| Loss | 0,3020 |
| WER | 49,89 |
| CER | 10,88 |

La tabla de entrenamiento muestra la evolución por épocas:

| Epoca | Loss entrenamiento | CER | Validation Loss | WER |
|---|---|---|---|---|
| 1 | 9,8811 | 25,88 | 1,7579 | 90,21 |
| 2 | 4,1492 | 15,80 | 1,1126 | 60,95 |
| 3 | 2,7002 | 12,11 | 0,9240 | 51,46 |
| 4 | 2,0700 | 10,60 | 0,8026 | 45,71 |
| 5 | 1,7341 | 10,39 | 0,7765 | 45,31 |
| 6 | 1,3342 | 9,59 | 0,8075 | 40,36 |
| 7 | 1,0914 | 9,06 | 0,7846 | 40,87 |
| 8 | 0,9527 | 9,29 | 0,7992 | 39,46 |
| 9 | 0,7752 | 8,59 | 0,7771 | 38,75 |
| 10 | 2,2441 | 0,59 | 77,45 | 30,30 |
| 11 | 1,3215 | 0,40 | 65,85 | 16,72 |
| 12 | 1,0320 | 0,36 | 61,17 | 14,94 |
| 13 | 0,8958 | 0,34 | 55,43 | 12,70 |
| 14 | 0,7670 | 0,30 | 49,89 | 10,88 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware
- VRAM estimada: al ser un modelo de 241,7 millones de parámetros, en FP16 ocupa aproximadamente 483 MB de memoria, más overhead de activaciones. En la práctica, una GPU con al menos 2 GB de VRAM podría ejecutarlo, aunque no se dispone de datos oficiales.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, NVIDIA GTX 1060 6GB, RTX 2060, RTX 3090, A100) puede ejecutar el modelo. Para inferencia en CPU, es posible pero más lenta.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo como la RTX 3060 o superiores.
- Opciones de despliegue: se puede usar con Transformers (pipeline), también es compatible con vLLM, llama.cpp (si se convierte a GGUF) y TGI, aunque no hay instrucciones específicas en la model card.
- Latencia y throughput: no disponibles. Whisper-small suele procesar audio en tiempo real o más rápido en GPUs modernas, pero no hay mediciones para este fine-tune.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables específicos. Como referencia, el modelo base `openai/whisper-small` tiene la misma arquitectura y parámetros, pero su WER en conjuntos multilingües suele ser inferior (alrededor de 10-15 en inglés), mientras que este fine-tune alcanza un WER de 49,89, lo que sugiere que está especializado en un dominio o idioma concreto con mayor dificultad. Otras alternativas como `whisper-base` o `whisper-medium` no son directamente comparables sin datos de evaluación en el mismo corpus.

## Limitaciones y advertencias
- No se especifican los idiomas soportados ni el dataset de entrenamiento, por lo que el modelo podría no generalizar bien fuera del dominio para el que fue ajustado.
- El WER de 49,89 es muy alto, lo que indica que la transcripción contiene muchos errores; no es adecuado para uso en producción sin un postprocesado o corrección manual.
- La model card está generada automáticamente y carece de información sobre sesgos, alucinaciones o limitaciones de contexto.
- No hay evidencia de que el modelo maneje correctamente la transcripción fonética IPA, a pesar del nombre; esto es una suposición no verificada.
- La licencia Apache 2.0 permite uso comercial, pero al ser un fine-tune de Whisper (que tiene su propia licencia MIT), se deben respetar los términos de la licencia original de OpenAI.
- El repositorio tiene un tamaño de 40,6 GB, lo que puede dificultar su descarga y despliegue en entornos con poco ancho de banda.

## Enlaces
- [Modelo en Hugging Face](https://huggingface.co/shoibo/whisper_IPA_mnx_lr2e5)
- [Repositorio de Whisper (OpenAI)](https://github.com/openai/whisper)
- [WhisperX (herramienta de ASR con diarización)](https://github.com/m-bain/whisperX)
- [Documentación de Whisper en OpenAI API](https://developers.openai.com/api/docs/models/whisper-1)
