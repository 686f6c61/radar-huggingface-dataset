# emma333333/whisper-tiny_to_spanish_accent

## Resumen

Whisper tiny Spanish es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario emma333333 en HuggingFace. Se trata de un modelo de reconocimiento automatico del habla (ASR) basado en la arquitectura encoder-decoder transformer de Whisper, con 37,76 millones de parametros, entrenado para transcribir audio con acento espanol a partir del dataset denominado "spanish_english" (referido en la model card como "Canadian Spanish").

El modelo parte de los pesos de whisper-tiny, el miembro mas pequeno de la familia Whisper de OpenAI, y ha sido reentrenado durante 2000 pasos con un learning rate de 1e-05 y el optimizador AdamW. El resultado declarado por el autor es un WER de 12,36 sobre el split de test del dataset de evaluacion, con una perdida de validacion de 0,2459.

Su relevancia es limitada y muy especifica: se trata de un experimento de ajuste de acento sobre un modelo base minusculo, con cero descargas y cero likes en el momento de la consulta, y una model card generada automaticamente que deja multiples secciones sin completar ("More information needed"). No obstante, resulta util como referencia para quienes exploren el ajuste de Whisper en variantes dialectales del espanol o para tareas de transcripcion ligera en entornos con recursos muy limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper opera sobre ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin variantes GGUF publicadas) |
| Idiomas soportados | en (segun metadatos); el ajuste se orienta a espanol con acento |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un transformer encoder-decoder con atencion estandar, disenado para recibir espectrogramas mel de audio y generar transcripciones token a token. Whisper-tiny es la variante mas pequena de la familia, con aproximadamente 39 millones de parametros en su configuracion original, lo que lo situa en el rango de modelos desplegables en CPU.

El entrenamiento consistio en un fine-tuning supervisado sobre el dataset "spanish_english" (etiquetado como "Canadian Spanish" en la model card), con los siguientes hiperparametros: learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y un total de 2000 pasos de entrenamiento. No se documenta el numero de tokens de audio, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (en ASR no es habitual). Tampoco se describe ninguna innovacion tecnica adicional mas alla del ajuste de pesos.

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de audio a texto, capacidad principal del modelo.
- Ajuste orientado a acento espanol: segun el nombre del repositorio, el fine-tuning busca adaptar el modelo a acentos del espanol, aunque los metadatos declaran unicamente el idioma "en".
- Transcripcion de audio de hasta 30 segundos por ventana, limitacion heredada de la arquitectura Whisper.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, vision ni audio mas alla del ASR.
- Capacidades multilingues: no disponibles segun la informacion proporcionada; el modelo base Whisper soporta multiples idiomas, pero este ajuste declara solo "en".

## Casos de uso

- Transcripcion de notas de voz en aplicaciones moviles: el tamano reducido (37,76 M de parametros, repo de 0,3 GB) permite ejecutar el modelo en dispositivos con recursos limitados o en CPU, transcribiendo fragmentos cortos de audio de hasta 30 segundos.
- Prototipado rapido de pipelines ASR: util como baseline para comparar el efecto de ajustes de acento antes de invertir en modelos mayores de la familia Whisper.
- Subtitulado automatico de clips cortos: para videos de duracion breve donde la latencia importa y la precision absoluta no es critica.
- Investigacion sobre variantes dialectales del espanol: el modelo sirve como punto de partida para estudiar como el fine-tuning de un modelo minusculo afecta al WER en acentos especificos.
- Filtrado y busqueda de audio en archivos pequenos: transcripcion previa para indexar contenido hablado en entornos con presupuesto de computo minimo.
- Educacion e investigacion academica: experimento reproducible (semilla 42, hiperparametros documentados) para ensenar tecnicas de fine-tuning de Whisper con Transformers y Datasets.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| Whisper tiny Spanish | Canadian Spanish (spanish_english, split test) | WER | 12,3632 |
| Whisper tiny Spanish | Canadian Spanish (validacion, step 1000) | WER | 14,0547 |
| Whisper tiny Spanish | Canadian Spanish (validacion, step 2000) | WER | 12,3632 |
| Whisper tiny Spanish | Canadian Spanish (validacion, step 2000) | Loss | 0,2459 |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos (MMLU, HumanEval, GSM8K u otros) ni frente a whisper-tiny original en el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 37,76 M de parametros; en la practica, el cuello de botella es el procesamiento del espectrograma, no los pesos.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060, RTX 2060, RTX 3060, RTX 4090) es mas que suficiente; tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente todas, incluidas las integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (libreria declarada), y por compatibilidad con Whisper, potencialmente llama.cpp, whisper.cpp, faster-whisper o Ollama si se convierten los pesos; no se han publicado variantes GGUF en el repositorio.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| emma333333/whisper-tiny_to_spanish_accent | 37,76 M | ventanas de 30 s de audio | 12,36 (Canadian Spanish, no verificado) | apache-2.0 | HuggingFace, 0 descargas |
| openai/whisper-tiny | ~39 M | ventanas de 30 s de audio | no disponible en esta ficha | apache-2.0 | HuggingFace, ampliamente usado |
| openai/whisper-base | ~74 M | ventanas de 30 s de audio | no disponible en esta ficha | apache-2.0 | HuggingFace, ampliamente usado |
| openai/whisper-small | ~244 M | ventanas de 30 s de audio | no disponible en esta ficha | apache-2.0 | HuggingFace, ampliamente usado |

No se dispone de datos de benchmarks de los modelos alternativos en la informacion proporcionada para establecer una comparacion cuantitativa fiable; la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Model card incompleta: multiples secciones ("Model description", "Intended uses & limitations", "Training and evaluation data") contienen "More information needed", lo que impide conocer el alcance real del ajuste.
- Inconsistencia de idioma: el nombre del repositorio sugiere espanol, pero los metadatos declaran unicamente "en"; el dataset se denomina "spanish_english" y "Canadian Spanish", sin documentacion adicional.
- WER no verificado: el resultado de 12,36 esta marcado como "verified: false" en el model-index, por lo que no ha sido validado de forma independiente.
- Riesgo de alucinacion: como todo modelo Whisper, puede generar texto plausible en segmentos de silencio o ruido, especialmente en variantes pequenas.
- Sesgos: no documentados; el dataset de entrenamiento no se describe, por lo que se desconocen sesgos de acento, genero o dominio.
- Limitacion de contexto: la arquitectura Whisper procesa ventanas de 30 segundos; audios mas largos requieren segmentacion manual o pipelines externos.
- Licencia apache-2.0: permite uso comercial, pero al derivar de openai/whisper-tiny conviene revisar las condiciones del modelo base.
- Madurez: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion por la comunidad.
- Sin variantes cuantizadas publicadas: no hay GGUF ni otros formatos listos para despliegue ligero fuera de transformers.

## Enlaces

- HuggingFace: https://huggingface.co/emma333333/whisper-tiny_to_spanish_accent
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper de Whisper (referencia del modelo base): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
