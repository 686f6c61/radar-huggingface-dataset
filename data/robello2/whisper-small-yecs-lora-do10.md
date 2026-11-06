# robello2/whisper-small-yecs-lora-do10

## Resumen

whisper-small-yecs-lora-do10 es un ajuste fino de openai/whisper-small realizado por el usuario robello2 sobre el corpus YECS de habla con cambio de codigo (code-switching) yoruba-ingles. El modelo resuelve un problema concreto y poco cubierto por los sistemas ASR genericos: la transcripcion de conversaciones en las que el hablante alterna entre yoruba e ingles dentro de la misma emision, algo habitual en contextos bilingues de Nigeria y su diaspora. Con 241,7 millones de parametros, se mantiene en la franja "small" de la familia Whisper, lo que lo hace desplegable en hardware modesto.

La relevancia actual del modelo es doble. Por un lado, aplica LoRA (rank 32, alpha 64) sobre todas las capas lineales del encoder y decoder de Whisper, con los pesos base congelados, y publica el adaptador ya fusionado en los pesos finales, de modo que se carga como un Whisper estandar sin necesidad de infraestructura PEFT. Por otro, reporta metricas internas especificas para code-switching (err_yo, err_en, pier_yo, switch_near_err, switch_away_err) que van mas alla del WER global y permiten evaluar el comportamiento real en los puntos de cambio de idioma.

El modelo se distribuye con licencia NOODL-1.0, heredada de los terminos del corpus YECS, y esta pensado para investigacion y evaluacion de ASR bilingue. No hay descargas ni likes registrados en el momento de la consulta, y no se han publicado resultados en benchmarks publicos estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small) con adaptadores LoRA fusionados |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion posterior via herramientas externas) |
| Idiomas soportados | yoruba (yo), ingles (en) |
| Licencia | NOODL-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-small, un transformer encoder-decoder con atencion estandar disenado para reconocimiento automatico de voz sobre ventanas de audio de 30 segundos. Sobre esa base se aplico LoRA con rank 32, alpha 64 y dropout 0.1 en todas las capas lineales de los bloques del encoder y del decoder, manteniendo los pesos originales congelados durante el entrenamiento. El adaptador resultante, con 12.976.128 parametros entrenables, se ha fusionado en los pesos publicados, por lo que el checkpoint se carga como un Whisper convencional.

El entrenamiento se realizo sobre el split de entrenamiento congelado del corpus YECS (Yoruba-English Code-Switched speech), con 75.999 emisiones y un conjunto de desarrollo interno reservado. Se asigno un token de idioma por emision (`<|en|>` o `<|yo|>`) segun la mayoria de las etiquetas por palabra, con desempate hacia ingles, y se recomienda decodificar con deteccion automatica de idioma. Los hiperparametros fueron: learning rate 1e-4, warmup de 500 pasos, batch 16 con acumulacion 2, precision bf16, maximo de 10 epocas con early stopping (paciencia 3) sobre el WER greedy de desarrollo, semilla 42. Se selecciono el paso 6000 y el entrenamiento se detuvo en el paso 9000 (3,79 epocas). No se menciona en la informacion disponible el uso de RLHF ni DPO.

## Capacidades

- Reconocimiento automatico de voz (ASR) para audio en yoruba, en ingles y en habla con cambio de codigo entre ambos.
- Transcripcion con preservacion de diacriticos y tonos del yoruba, segun el protocolo de puntuacion declarado (NFC, puntuacion eliminada, diacriticos conservados).
- Deteccion automatica de idioma por emision, con token de idioma asignado por mayoria de etiquetas por palabra.
- Manejo de puntos de cambio de idioma intra-emision, con metricas especificas reportadas para errores cerca y lejos del punto de cambio.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo puramente ASR.
- No se documentan capacidades de vision, audio generativo ni modo "thinking".

## Casos de uso

- Transcripcion de entrevistas y conversaciones bilingues yoruba-ingles: el modelo esta entrenado especificamente sobre habla con code-switching, por lo que puede transcribir turnos en los que el hablante alterna idiomas sin forzar una monolingualizacion artificial de la salida.
- Subtitulado de contenido audiovisual nigeriano: series, podcasts y videos de YouTube en los que los hablantes mezclan yoruba e ingles se pueden transcribir con un unico modelo, evitando pipelines de dos ASR monolingues con fusion posterior.
- Investigacion sociolinguistica: la salida con diacriticos conservados y las metricas por idioma (err_yo, err_en) permiten analizar patrones de cambio de codigo y frecuencia de uso de cada lengua en corpus orales.
- Atencion al cliente en centros de llamadas bilingues: permite transcribir llamadas de usuarios que alternan yoruba e ingles para su posterior analisis de calidad o busqueda en texto.
- Generacion de datos de entrenamiento para otros sistemas: las transcripciones pueden servir para construir corpus paralelos o para aumentar datos de ASR de bajo recurso en yoruba.
- Evaluacion comparativa de ASR multilingue: sirve como referencia especifica de code-switching yoruba-ingles frente a Whisper small original u otros ajustes, usando las metricas switch_near_err y switch_away_err.
- Despliegue en entornos con recursos limitados: con 241,7 millones de parametros y pesos en safetensors de aproximadamente 1 GB, cabe en GPUs de consumo y en CPUs con cuantizacion, lo que facilita prototipos y pruebas de campo.

## Benchmarks y rendimiento

Resultados internos de desarrollo reportados por el autor (beam 5, idioma automatico, porcentajes):

| Metrica | Valor |
|---|---|
| WER | 15,99 |
| CER | 5,68 |
| di_wer | 12,46 |
| err_yo | 18,59 |
| err_en | 10,03 |
| pier_yo | 20,86 |
| switch_near_err | 13,96 |
| switch_away_err | 14,22 |
| ins_per_word | 1,88 |

Protocolo de puntuacion: NFC, puntuacion eliminada, diacriticos conservados, con tratamiento especifico de tonos y cambios de idioma. No se han publicado resultados en benchmarks publicos estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 1 GB para los pesos (241,7 M de parametros) mas el overhead de activaciones y buffers de audio; en la practica, menos de 2 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,5-1 GB; en 4 bits, por debajo de 0,5 GB, aunque el autor no publica pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16, como RTX 3060, RTX 4060, RTX 4090, A100 o H100; el modelo no aprovecha GPUs de gran capacidad por su tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (pipeline automatic-speech-recognition), vLLM no aplica de forma directa por ser ASR, llama.cpp no soporta Whisper de forma nativa, faster-whisper y whisper.cpp requieren conversion a sus formatos; Ollama no soporta Whisper de forma estandar. TGI no esta orientado a ASR.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-small-yecs-lora-do10 | 241,7 M | yo, en (code-switching) | 30 s (Whisper) | NOODL-1.0 | Hugging Face |
| openai/whisper-small | 241,7 M | multilingue (99 idiomas) | 30 s | Apache 2.0 | Hugging Face, ampliamente integrado |
| openai/whisper-medium | 769 M | multilingue | 30 s | Apache 2.0 | Hugging Face |
| whisper-large-v3 | 1.550 M | multilingue | 30 s | Apache 2.0 | Hugging Face |

La comparativa se limita a la familia Whisper porque no se dispone de informacion sobre otros ajustes especificos de code-switching yoruba-ingles. Frente a whisper-small original, este modelo sacrifica cobertura multilingue a cambio de especializacion en el par yoruba-ingles; frente a whisper-medium y whisper-large-v3, ofrece un tamano mucho menor y una licencia mas restrictiva (NOODL-1.0 frente a Apache 2.0).

## Limitaciones y advertencias

- Especializacion estrecha: solo cubre yoruba e ingles; el rendimiento en otros idiomas no esta documentado y previsiblemente sera deficiente.
- Licencia NOODL-1.0: es una licencia "other" con terminos propios heredados del corpus YECS; es imprescindible revisar sus condiciones antes de cualquier uso comercial o redistribucion.
- Riesgo de alucinacion: como todo modelo Whisper, puede generar texto plausible en segmentos de silencio o ruido, especialmente en audio de baja calidad.
- Sesgo de dominio: entrenado sobre el split congelado de YECS (75.999 emisiones); el rendimiento fuera de ese dominio (acentos, ruido, registros formales) no esta evaluado.
- Metricas solo internas: los resultados reportados corresponden al conjunto de desarrollo interno del autor y no han sido verificados de forma independiente ni comparados en benchmarks publicos.
- Sin datos de cuantizacion oficial: no se publican pesos GGUF ni versiones cuantizadas; la conversion a otros formatos corre a cargo del usuario.
- Sin soporte documentado de tool calling ni agentes: no es un modelo de proposito general.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de validacion por la comunidad.
- Fecha de creacion futura en los metadatos (2026-11-02): conviene verificar la procedencia y el estado real del repositorio antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/robello2/whisper-small-yecs-lora-do10
- Modelo base: https://huggingface.co/openai/whisper-small
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- No se han encontrado en la busqueda web enlaces adicionales al corpus YECS, papers del autor ni demos.
