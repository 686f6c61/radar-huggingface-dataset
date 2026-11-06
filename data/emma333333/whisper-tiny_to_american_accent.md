# emma333333/whisper-tiny_to_american_accent

## Resumen

Whisper tiny to american accent es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla `openai/whisper-tiny` publicado por el usuario emma333333 en Hugging Face. El modelo parte de la arquitectura encoder-decoder transformer de Whisper, con 37,76 millones de parametros totales, y se ha reentrenado sobre el dataset `canadian_english` para adaptar el reconocimiento al ingles canadiense. El nombre del repositorio sugiere un enfoque hacia el acento americano, aunque la model card solo documenta el dataset canadiense como fuente de entrenamiento.

Se trata de un modelo de proposito muy especifico y de escala reducida: no busca competir en precision global con variantes mayores de Whisper, sino servir como experimento de adaptacion de acento sobre una base minima. Con 60 descargas y ninguna valoracion en el momento de la consulta, es un artefacto de investigacion mas que un modelo listo para produccion.

Su relevancia es limitada pero ilustrativa: muestra el flujo tipico de fine-tuning de Whisper con `Trainer`, incluye la model card autogenerada y declara un WER de 21,85 sobre el split de test del dataset canadiense. La licencia Apache 2.0 heredada facilita su reutilizacion experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper opera sobre ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `openai/whisper-tiny`: un transformer encoder-decoder con atencion completa, entrenado originalmente por OpenAI para transcripcion y traduccion de voz. El ajuste fino conserva esa topologia y solo modifica los pesos mediante entrenamiento supervisado sobre pares audio-transcripcion del dataset `canadian_english`. No se documenta el numero de tokens de audio ni la composicion detallada del dataset en la informacion disponible.

Los hiperparametros declarados en la model card son: learning rate 1e-05, batch de entrenamiento 2, batch de evaluacion 1, semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y 5000 pasos totales de entrenamiento. No se menciona el uso de RLHF, DPO ni tecnicas de decodificacion especulativa. La perdida de entrenamiento cae de 0,3136 en el paso 1000 a 0,0043 en el paso 5000, mientras que la perdida de validacion se mantiene entre 0,43 y 0,50, lo que sugiere cierto sobreajuste al final del entrenamiento. El mejor WER de validacion se observa en el paso 2000 (21,19), antes de que la perdida de validacion empiece a degradarse.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con especializacion en acento canadiense/americano segun el dataset de entrenamiento.
- Transcripcion de audio a texto en formato compatible con el pipeline `automatic-speech-recognition` de Transformers.
- Modelo unicamente de ASR: no genera texto libre, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling.
- No esta disenado para agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles; no se declaran otros idiomas.
- No incluye modo thinking, vision ni audio generativo.

## Casos de uso

- Prototipado rapido de transcripcion en ingles: al ser un modelo tiny, se puede cargar en CPU o GPU de gama baja para validar pipelines de ASR antes de invertir en modelos mayores.
- Experimentos academicos de adaptacion de acento: sirve como linea base para comparar tecnicas de fine-tuning sobre variantes dialectales del ingles.
- Transcripcion de notas de voz cortas en entornos con recursos limitados, donde la latencia y el consumo de memoria importan mas que la precision absoluta.
- Generacion de subtitulos automaticos en prototipos de aplicaciones de video, aceptando un WER elevado como punto de partida.
- Evaluacion comparativa de datasets de acento: permite medir el impacto de un corpus como `canadian_english` sobre un modelo base conocido.
- Docencia y formacion: ejemplo completo de fine-tuning de Whisper con `Trainer`, hiperparametros documentados y model card autogenerada, util para talleres practicos.
- Pruebas de integracion en pipelines de Hugging Face (endpoints compatibles) antes de escalar a variantes mayores.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Modelo | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| Whisper tiny Canadian | Canadian English | test | WER | 21,8463 |
| Whisper tiny Canadian | Canadian English | validacion (paso 2000) | WER | 21,1907 |
| Whisper tiny Canadian | Canadian English | validacion (paso 5000) | WER | 21,8463 |

Evolucion del entrenamiento:

| Paso | Epoca | Perdida entrenamiento | Perdida validacion | WER |
|---|---|---|---|---|
| 1000 | 1,0 | 0,3136 | 0,4307 | 21,4792 |
| 2000 | 2,0 | 0,1147 | 0,4457 | 21,1907 |
| 3000 | 3,0 | 0,0687 | 0,4709 | 22,7642 |
| 4000 | 4,0 | 0,0101 | 0,4821 | 21,3218 |
| 5000 | 5,0 | 0,0043 | 0,4982 | 21,8463 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo de ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (37,76 M de parametros); en la practica, el modelo cabe holgadamente en cualquier GPU consumer y en CPU.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; no requiere A100 ni H100. Una RTX 4090 o una GTX 1650 son igualmente validas para este tamano.
- Cabe en GPU consumer: si, en practicamente todas, incluidas integradas con suficiente memoria compartida.
- Opciones de despliegue: pipeline `automatic-speech-recognition` de Transformers, endpoints compatibles de Hugging Face, y potencialmente llama.cpp/Ollama si se generan pesos GGUF (no se declaran en el repo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano, se espera inferencia en tiempo real o superior en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| emma333333/whisper-tiny_to_american_accent | 37,76 M | ventana de audio de 30 s (Whisper) | 21,85 (Canadian English test) | apache-2.0 | Hugging Face |
| openai/whisper-tiny | 37,76 M | ventana de audio de 30 s | no disponible en la informacion | apache-2.0 | Hugging Face |
| openai/whisper-base | 74 M | ventana de audio de 30 s | no disponible en la informacion | apache-2.0 | Hugging Face |
| openai/whisper-small | 244 M | ventana de audio de 30 s | no disponible en la informacion | apache-2.0 | Hugging Face |

La comparativa se limita a la familia Whisper porque no se han identificado en la informacion proporcionada otros modelos ajustados especificamente al acento canadiense con los que contrastar. Los WER de las variantes base de OpenAI no se incluyen porque no aparecen en los datos disponibles.

## Limitaciones y advertencias

- Modelo de muy baja capacidad (37,76 M de parametros): la precision en ASR sera notablemente inferior a la de variantes medium o large de Whisper.
- WER de 21,85 sobre el dataset de test: elevado para produccion; no recomendable para transcripcion critica sin revision humana.
- Sobreajuste probable: la perdida de entrenamiento cae a 0,0043 mientras la de validacion sube a 0,4982, y el mejor WER se obtiene en el paso 2000, no al final.
- Sesgos desconocidos: no se documenta la composicion demografica del dataset `canadian_english`, por lo que pueden existir sesgos de acento, genero o edad no evaluados.
- Riesgo de alucinacion en audio con ruido, silencios o habla no inglesa, comportamiento comun en modelos Whisper pequenos.
- Limitacion de idioma: solo se declara ingles; el uso con otros idiomas producira transcripciones incorrectas o alucinadas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; la model card esta autogenerada y contiene secciones sin completar ("More information needed").
- Sin validacion externa: el resultado de WER esta marcado como `verified: false`.
- No apto para tareas fuera de ASR: no genera texto, no razona, no soporta tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emma333333/whisper-tiny_to_american_accent
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Ficha en Free2AITools: https://free2aitools.com/model/emma333333/whisper-tiny_to_american_accent
- Documentacion del pipeline ASR de Transformers: https://huggingface.co/docs/transformers/tasks/asr
- Paper de Whisper (Radford et al.): https://arxiv.org/abs/2212.04356
