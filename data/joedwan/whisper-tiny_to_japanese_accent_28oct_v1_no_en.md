# JoeDwan/whisper-tiny_to_japanese_accent_28oct_v1_no_en

## Resumen

Whisper tiny Japanese accent es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario JoeDwan en Hugging Face. Se trata de un modelo de reconocimiento automatico del habla (ASR) derivado de la arquitectura Whisper de OpenAI, en su variante mas pequena (tiny), con 37,76 millones de parametros. El modelo se ha entrenado sobre el dataset Japanese_english, presumiblemente para adaptar el reconocimiento a hablantes japoneses que hablan en ingles con acento, aunque la model card no documenta la composicion exacta del corpus.

El modelo resuelve el problema de la transcripcion de audio en ingles con acentos no nativos, un escenario donde los modelos ASR genericos suelen degradarse. Al partir de whisper-tiny, el modelo es extremadamente ligero y apto para despliegues con recursos limitados, aunque su tamano reducido limita la precision en comparacion con variantes mayores de Whisper (small, medium, large).

Es relevante por su caracter especializado y su bajo coste computacional, pero debe tratarse con cautela: la model card esta generada automaticamente, carece de documentacion sobre el dataset, no tiene validacion externa de resultados y presenta un WER de 20,24 sobre el split de test, un valor alto que refleja la dificultad de la tarea y las limitaciones del modelo base tiny.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, no documentada por el autor) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper de OpenAI en su variante tiny: un transformer encoder-decoder con atencion completa, disenado para tareas de reconocimiento automatico del habla. El encoder procesa espectrogramas mel de audio y el decoder genera tokens de texto de forma autoregresiva. Con 37,76 millones de parametros, es la variante mas pequena de la familia Whisper.

El entrenamiento consistio en un fine-tuning sobre el dataset Japanese_english durante 2 epocas, con learning rate de 1e-05, batch size de entrenamiento de 2, batch de evaluacion de 8, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con warmup del 25 % de los pasos y precision mixta nativa (AMP). No se documenta el numero de tokens de audio, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no procede en un modelo ASR). No se describe ninguna innovacion tecnica adicional mas alla del ajuste fino supervisado estandar.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con especializacion en habla con acento japones.
- Transcripcion de audio a texto en formato end-to-end mediante la pipeline `automatic-speech-recognition` de transformers.
- Procesamiento de ventanas de audio de hasta 30 segundos por inferencia (caracteristica estandar de Whisper).
- Compatible con la libreria transformers y con endpoints compatibles (tag `endpoints_compatible`).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles (tag de idioma: en).
- No dispone de modo thinking, vision ni audio mas alla de la entrada de voz para transcripcion.

## Casos de uso

- Transcripcion de reuniones y entrevistas con hablantes japoneses en ingles: el modelo puede convertir audio a texto en entornos donde los participantes no son nativos, aprovechando el ajuste especifico sobre acentos japoneses.
- Subtitulado automatizado de contenido audiovisual: adecuado para videos o podcasts en ingles con acento japones, con la ventaja de su bajo coste computacional para procesar grandes volumenes.
- Prototipado rapido de pipelines ASR: al ser un modelo de 37,76 M de parametros, permite iterar y validar flujos de transcripcion en maquinas sin GPU dedicada antes de escalar a modelos mayores.
- Sistemas de transcripcion en el borde (edge): su tamano reducido permite desplegarlo en dispositivos con recursos limitados o en contenedores ligeros, aunque con la precision limitada del modelo tiny.
- Investigacion sobre robustez de ASR frente a acentos: util como punto de partida para estudiar el impacto del fine-tuning en variantes pequenas de Whisper.
- Evaluacion comparativa de modelos ASR ligeros: sirve como baseline especializado para comparar con whisper-tiny original u otras variantes en tareas de habla con acento.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| Whisper tiny Japanese accent | Japanese English (split test) | WER | 20,2381 |
| Whisper tiny Japanese accent | Japanese English (validacion, epoca 2) | Loss | 0,4644 |

Evolucion durante el entrenamiento (datos del autor):

| Epoca | Step | Validation Loss | WER |
|---|---|---|---|
| 0,5 | 402 | 0,5442 | 24,1698 |
| 1,0 | 804 | 0,4825 | 21,3659 |
| 1,5 | 1206 | 0,4743 | 20,9117 |
| 2,0 | 1608 | 0,4644 | 20,2381 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision fp32 (37,76 M de parametros, aproximadamente 150 MB de pesos), y aun menos en fp16 o int8.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Funciona en CPU sin problemas.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 4090, etc.) e incluso en dispositivos de gama baja.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), y por compatibilidad de formato safetensors, conversion a otros runtimes ASR; no se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI (estos estan orientados a LLM, no a ASR Whisper).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera una latencia baja, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER (Japanese English) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper tiny Japanese accent (este modelo) | 37,76 M | 30 s por ventana | 20,2381 (autor, no verificado) | apache-2.0 | Hugging Face |
| openai/whisper-tiny | 37,76 M | 30 s por ventana | no disponible en la informacion | apache-2.0 | Hugging Face |
| openai/whisper-base | 74 M | 30 s por ventana | no disponible en la informacion | apache-2.0 | Hugging Face |
| openai/whisper-small | 244 M | 30 s por ventana | no disponible en la informacion | apache-2.0 | Hugging Face |

No se dispone de resultados de benchmarks de los modelos comparables en la informacion proporcionada; la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- La model card esta generada automaticamente y no documenta el dataset Japanese_english, su composicion ni su procedencia, lo que impide evaluar la representatividad del entrenamiento.
- El WER de 20,24 es elevado en terminos absolutos; el modelo base tiny tiene una capacidad limitada y el ajuste fino no compensa esa limitacion estructural.
- Los resultados no estan verificados (`verified: false` en el model-index) y no han sido validados de forma independiente.
- Riesgo de alucinacion y de transcripciones incorrectas, especialmente en audio ruidoso, acentos distintos del japones o vocabulario tecnico.
- El modelo solo declara soporte para ingles; no debe usarse para transcribir japones ni otros idiomas.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre un dataset especifico de habla japonesa en ingles, puede presentar sesgos hacia ese perfil de hablantes.
- Licencia apache-2.0, que permite uso comercial, pero el autor no ofrece garantias ni documentacion sobre el origen de los datos de entrenamiento.
- Para produccion se recomienda validar con un conjunto propio y considerar variantes mayores de Whisper si la precision es critica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoeDwan/whisper-tiny_to_japanese_accent_28oct_v1_no_en
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper de Whisper (OpenAI): no disponible en la informacion proporcionada
- Repositorio de transformers: no disponible en la informacion proporcionada
