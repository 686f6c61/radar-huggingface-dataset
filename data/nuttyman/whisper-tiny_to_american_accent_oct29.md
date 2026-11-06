# Nuttyman/whisper-tiny_to_american_accent_oct29

## Resumen

Whisper tiny_to_american_accent_oct29 es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario Nuttyman en Hugging Face. Se trata de un modelo de reconocimiento automatico del habla (ASR) basado en la arquitectura encoder-decoder Transformer de Whisper, con 37,7 millones de parametros totales, entrenado sobre el dataset denominado "Spanish_english". El modelo parte de los pesos originales de Whisper tiny y los adapta mediante entrenamiento supervisado con el framework Transformers.

El modelo resuelve la tarea de transcripcion de audio a texto en ingles, con un ajuste orientado segun el nombre del repositorio a acentos americanos. Su relevancia es limitada: se trata de un experimento de fine-tuning de un modelo base muy pequeno (whisper-tiny), con solo 20 descargas y sin validacion externa de sus resultados. El WER declarado de 9,10 sobre el split de test del dataset Spanish_english no esta verificado y debe interpretarse con cautela dado el tamano reducido del modelo base.

La ficha se elabora a partir de la informacion disponible en Hugging Face y la model card generada automaticamente por el Trainer. No hay publicaciones, papers ni documentacion adicional del autor, por lo que muchos aspectos tecnicos quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, sin confirmar por el autor) |
| Idiomas soportados | en (segun metadatos del modelo) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un Transformer encoder-decoder con atencion multi-cabeza, disenado originalmente para ASR multilingue y traduccion de voz. Whisper tiny es la variante mas pequena de la familia Whisper, con aproximadamente 39 millones de parametros, y procesa audio en ventanas de 30 segundos convertidas a espectrogramas log-Mel.

El entrenamiento consistio en un fine-tuning sobre el dataset "Spanish_english" con los siguientes hiperparametros declarados en la model card: learning rate de 1e-05, batch size de entrenamiento de 2, batch size de evaluacion de 1, semilla 42, optimizador AdamW (variante fused) con betas (0,9, 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y 2000 pasos totales de entrenamiento. Se observa una mejora del WER entre el paso 1000 (10,98) y el paso 2000 (9,10), con una loss de validacion de 0,1866 al final. No se especifica la composicion exacta del dataset, el numero de horas de audio ni si se aplicaron tecnicas de augmentation o RLHF. Las versiones de framework utilizadas fueron Transformers 5.22.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles: transcripcion de audio a texto.
- Ajuste orientado a acentos americanos segun el nombre del repositorio (no verificado de forma independiente).
- Procesamiento de audio en ventanas de hasta 30 segundos, heredado de la arquitectura Whisper.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue no confirmada: los metadatos declaran unicamente ingles, aunque el modelo base Whisper tiny es multilingue.
- No se documentan capacidades de vision, audio generativo ni modo thinking.

## Casos de uso

- Transcripcion de reuniones en ingles: el modelo puede convertir grabaciones de audio en texto para actas o resumenes, aunque su tamano reducido limita la precision en audio con ruido o solapamiento de hablantes.
- Subtitulado automatico de contenido audiovisual en ingles: util para generar subtitulos preliminares en pipelines de bajo coste donde la latencia y el consumo de recursos son criticos.
- Prototipado rapido de aplicaciones ASR: al ser un modelo de 37,7 M de parametros, permite iterar rapidamente en entornos con recursos limitados antes de escalar a modelos mayores.
- Transcripcion en dispositivos de borde (edge): su reducido tamano permite despliegue en CPU o GPUs de gama baja para aplicaciones de dictado o comandos de voz.
- Investigacion sobre adaptacion de acentos: sirve como caso de estudio para experimentos de fine-tuning de Whisper sobre variantes dialectales del ingles.
- Generacion de transcripciones para analisis de sentimiento o mineria de texto: el texto resultante puede alimentar pipelines de NLP posteriores en ingles.
- Evaluacion comparativa de fine-tunings de Whisper tiny: util como baseline en estudios academicos sobre ajuste de modelos ASR pequenos.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Dataset | Metrica | Valor |
|---|---|---|---|
| ASR | Spanish English (split test) | WER | 9,1019 |
| Entrenamiento (paso 1000) | Spanish English (validacion) | WER | 10,9809 |
| Entrenamiento (paso 2000) | Spanish English (validacion) | WER | 9,1019 |
| Entrenamiento (paso 2000) | Spanish English (validacion) | Loss | 0,1866 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 (37,7 M de parametros); aproximadamente 150-300 MB en FP16 o cuantizacion de 8 bits.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en una GTX 1650, RTX 3050, RTX 4090 o incluso en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer e incluso en dispositivos de borde.
- Opciones de despliegue: transformers (pipeline automatic-speech-recognition), endpoints compatibles segun los tags del modelo; no se confirma soporte nativo de vLLM, llama.cpp u Ollama (estas herramientas estan orientadas a modelos de lenguaje, no a ASR Whisper).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nuttyman/whisper-tiny_to_american_accent_oct29 | 37,7 M | no disponible | 9,10 (Spanish English) | apache-2.0 | Hugging Face |
| openai/whisper-tiny | 39 M | ventanas de 30 s | no disponible en esta ficha | apache-2.0 | Hugging Face |
| openai/whisper-base | 74 M | ventanas de 30 s | no disponible en esta ficha | apache-2.0 | Hugging Face |
| openai/whisper-small | 244 M | ventanas de 30 s | no disponible en esta ficha | apache-2.0 | Hugging Face |

No se dispone de datos de WER comparables para los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- Modelo de muy reducido tamano (37,7 M de parametros): la precision en ASR sera inferior a la de variantes mayores de Whisper (base, small, medium, large).
- El WER de 9,10 declarado por el autor no esta verificado de forma independiente y corresponde a un dataset no estandar ("Spanish_english") cuya composicion no se documenta.
- La model card esta generada automaticamente y contiene secciones sin completar ("More information needed"), lo que impide conocer el alcance real del entrenamiento.
- Solo se declara soporte de ingles; el uso con otros idiomas no esta garantizado aunque el modelo base sea multilingue.
- Riesgo de alucinacion en transcripciones: Whisper puede generar texto plausible en segmentos de silencio o ruido, especialmente en variantes pequenas.
- Sesgos conocidos: no documentados por el autor; los modelos ASR pueden presentar sesgos de acento, genero y origen dialectal.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- No apto para produccion sin evaluacion previa sobre el dominio objetivo: la falta de validacion externa y el origen experimental del ajuste desaconsejan su uso directo en sistemas criticos.
- El nombre del repositorio sugiere un ajuste a acento americano, pero no se aporta evidencia cuantitativa de dicha adaptacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nuttyman/whisper-tiny_to_american_accent_oct29
- Modelo base openai/whisper-tiny: https://huggingface.co/openai/whisper-tiny
- Paper original de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
- Documentacion de Transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
