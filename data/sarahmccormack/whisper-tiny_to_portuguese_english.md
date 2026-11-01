# SarahMcCormack/whisper-tiny_to_portuguese_english

## Resumen

Whisper tiny Portuguese es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla `openai/whisper-tiny` realizado por SarahMcCormack sobre el dataset `portuguese_english`. El modelo conserva la arquitectura encoder-decoder transformer propia de la familia Whisper y el mismo tamano que el modelo base: 37.760.640 parametros totales, lo que lo situa en la gama mas ligera de la familia. El repositorio ocupa 0,3 GB y los pesos se distribuyen en formato safetensors.

El objetivo declarado es la transcripcion de audio en un contexto bilingue portugues-ingles, aunque la model card solo declara `en` como idioma soportado y no documenta la composicion exacta del dataset de entrenamiento. El modelo declara un Word Error Rate (WER) de 11,9478 sobre el split de test del dataset `portuguese_english`, con una perdida de validacion de 0,2546. Se trata de un ajuste con solo 2000 pasos de entrenamiento y batches muy pequenos (2 en entrenamiento, 1 en evaluacion).

Su relevancia es limitada y muy especifica: sirve como ejemplo de fine-tuning de bajo coste de Whisper tiny para un dominio concreto y como punto de partida para experimentos de ASR ligero en entornos con recursos restringidos. No es un modelo de proposito general ni compite con los modelos Whisper de mayor tamano en calidad de transcripcion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper tiny, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-tiny`, un transformer encoder-decoder disenado para reconocimiento automatico del habla que procesa espectrogramas de mel de audio y genera tokens de texto de forma autorregresiva. El fine-tuning mantiene integramente la arquitectura del modelo base y solo actualiza los pesos mediante entrenamiento supervisado sobre pares audio-transcripcion del dataset `portuguese_english`.

Los hiperparametros documentados son: learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW (variante `ADAMW_TORCH_FUSED`, betas 0,9/0,999, epsilon 1e-08), scheduler lineal con 500 pasos de warmup y 2000 pasos totales de entrenamiento. No se documenta el numero de tokens de audio ni la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o decodificacion especulativa. El entrenamiento se realizo con Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Reconocimiento automatico del habla (ASR) sobre audio en ingles, segun la declaracion de idiomas de la model card.
- Transcripcion orientada a un dominio bilingue portugues-ingles, segun el nombre del dataset de entrenamiento, aunque la model card no lo confirma como capacidad garantizada.
- Generacion de transcripciones con marcas de tiempo, si se usa la API de Whisper en Transformers (capacidad heredada del modelo base, no verificada en este ajuste).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de traduccion explicita, aunque Whisper base la soporta; el ajuste no la declara.
- No se documenta vision, audio de entrada mas alla del propio ASR, ni modo thinking.

## Casos de uso

- Transcripcion de reuniones en ingles: el modelo puede transcribir audio de reuniones de corta duracion gracias a su tamano reducido, adecuado para despliegue en CPU o GPU de gama baja.
- Subtitulado automatico de videos: util para generar subtitulos en ingles en pipelines de postproduccion donde el coste computacional por minuto de audio es critico.
- Prototipado rapido de aplicaciones de voz: sirve como primer modelo de referencia para validar una arquitectura de ASR antes de invertir en modelos mayores.
- Experimentos academicos de fine-tuning: su licencia Apache 2.0 y su tamano permiten reproducir el ajuste en una sola GPU consumer, lo que lo hace util como caso de estudio.
- Transcripcion de audio bilingue portugues-ingles en dominios acotados: el nombre del dataset sugiere este uso, aunque la model card no lo valida formalmente.
- Despliegue en dispositivos con recursos limitados: con 37,7 millones de parametros, puede ejecutarse en entornos embebidos o en CPU para tareas de transcripcion de baja latencia y volumen moderado.

## Benchmarks y rendimiento

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| Whisper tiny Portuguese | Portuguese English (split test) | WER | 11,9478 |
| Whisper tiny Portuguese | Portuguese English (split test) | Loss | 0,2546 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los valores de WER y loss corresponden a la evaluacion declarada por el autor y no estan verificados (`verified: false`).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 para los 37,7 millones de parametros; en FP16 aproximadamente 75 MB de pesos mas overhead de activaciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluidas GTX 1050 Ti, RTX 3050, RTX 4090 o superiores; tambien es viable en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en GPUs integradas.
- Opciones de despliegue: Transformers (pipeline `automatic-speech-recognition`), vLLM no aplica para ASR de Whisper de forma estandar, llama.cpp no soporta Whisper, Ollama no soporta Whisper de forma nativa; alternativas viables son `faster-whisper` (si se convierte el modelo) y ONNX Runtime.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper tiny Portuguese (este modelo) | 37,7 M | no disponible | 11,9478 (Portuguese English) | apache-2.0 | HuggingFace |
| openai/whisper-tiny | 37,7 M | 30 s de audio | no disponible en esta ficha | apache-2.0 | HuggingFace |
| openai/whisper-base | 74,4 M | 30 s de audio | no disponible en esta ficha | apache-2.0 | HuggingFace |
| openai/whisper-small | 244 M | 30 s de audio | no disponible en esta ficha | apache-2.0 | HuggingFace |

La comparativa se limita a la familia Whisper porque no se dispone de datos de benchmarks de otros modelos ASR en la informacion proporcionada. Los valores de WER de los modelos base no se incluyen porque no estan disponibles en la informacion consultada.

## Limitaciones y advertencias

- La model card esta generada automaticamente y contiene secciones sin completar ("More information needed"), por lo que la documentacion sobre usos previstos, limitaciones y datos de entrenamiento es practicamente inexistente.
- Solo se declara el idioma `en`; el uso con portugues no esta formalmente validado pese al nombre del dataset.
- El WER de 11,9478 no esta verificado (`verified: false`) y corresponde a un unico split de test de un dataset no documentado.
- El entrenamiento con solo 2000 pasos y batches de tamano 2 sugiere un ajuste ligero que puede no generalizar bien fuera del dominio de entrenamiento.
- Riesgo de alucinacion en transcripciones: Whisper es propenso a generar texto plausible en segmentos de audio con ruido o silencio, riesgo que persiste en este ajuste.
- No se documentan sesgos conocidos, pero al derivar de Whisper tiny hereda los sesgos del modelo base en cuanto a acentos, variedades dialectales y calidad de audio.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- No se recomienda su uso en produccion sin una evaluacion previa sobre el dominio objetivo y sin comparacion con el modelo base y con modelos Whisper de mayor tamano.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SarahMcCormack/whisper-tiny_to_portuguese_english
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper de Whisper (Radford et al., 2022): no disponible en la informacion proporcionada
- Repositorio de Transformers: no disponible en la informacion proporcionada
- Demo o espacio asociado: no disponible en la informacion proporcionada
