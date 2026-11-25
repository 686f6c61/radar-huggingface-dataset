# rithme3/trainer_output

## Resumen

`rithme3/trainer_output` es un ajuste fino (fine-tuning) del modelo `openai/whisper-small` para reconocimiento automatico del habla (ASR) en jemer (khmer, codigo ISO `km`). Lo publica el usuario de Hugging Face `rithme3` y se ha entrenado sobre el dataset `seanghay/khmer_mpwt_speech`, un corpus de audio en jemer. El modelo se distribuye con licencia Apache 2.0 y formato de pesos safetensors, con 243.712.896 parametros, coherentes con la arquitectura original de Whisper Small.

Se trata de un modelo de la familia Whisper, un transformer encoder-decoder con atencion estandar entrenado originalmente por OpenAI para transcripcion multilingue y traduccion de voz. Este ajuste concreto restringe su uso practico al jemer y no anade capacidades nuevas respecto al modelo base; su interes es servir como punto de partida o prueba de concepto para ASR en una lengua de bajos recursos, donde los modelos genericos rinden peor.

La relevancia es limitada y debe interpretarse con cautela: el propio autor declara un WER de 54,73 % en el split de test, un valor alto que indica un rendimiento aun lejos de ser utilizable en produccion. La model card esta generada automaticamente por el Trainer y deja sin cubrir secciones clave (descripcion, usos previstos, limitaciones), por lo que la informacion disponible es escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 243.712.896 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s en la arquitectura Whisper base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | jemer (km) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper Small de OpenAI: un transformer encoder-decoder con atencion multi-cabeza estandar, disenado para convertir espectrogramas de audio en tokens de texto. No incorpora innovaciones arquitectonicas propias; el ajuste se limita a adaptar los pesos preentrenados al dominio del jemer.

El entrenamiento se realizo con el Trainer de Hugging Face sobre el dataset `seanghay/khmer_mpwt_speech`. Los hiperparametros declarados son: learning rate de 1e-05, batch de entrenamiento y evaluacion de 8, semilla 42, optimizador AdamW fused (betas 0.9/0.999, epsilon 1e-08), scheduler lineal con 50 pasos de warmup, 1000 pasos totales y precision mixta nativa (AMP). La evolucion reportada muestra una perdida de validacion que baja de 0,7584 (paso 250) a 0,3352 (paso 1000) y un WER que pasa de 100,37 % a 54,73 %, lo que sugiere que el modelo aun no ha convergido y que un entrenamiento mas largo podria mejorar el resultado. No se documenta el volumen de datos, la composicion del dataset ni si hubo etapas de RLHF o DPO (no aplicables en ASR).

## Capacidades

- Reconocimiento automatico del habla en jemer: transcripcion de audio a texto en khmer.
- Generacion de texto derivada de la transcripcion (salida en secuencia de tokens).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada: el ajuste esta orientado exclusivamente al jemer, aunque el modelo base Whisper Small es multilingue.
- No se documentan capacidades de vision, audio adicional ni modo de razonamiento extendido mas alla del ASR.

## Casos de uso

- Transcripcion de audios en jemer para archivo o documentacion: el modelo convierte grabaciones en texto, util como primer paso en pipelines de subtitulado, aunque el WER declarado exige revision humana.
- Prototipado de asistentes de voz en jemer: sirve para validar una arquitectura de ASR en una lengua de bajos recursos antes de invertir en un modelo mayor o en mas datos.
- Investigacion en ASR de bajos recursos: como punto de partida reproducible (hiperparametros y dataset publicados) para experimentos de ajuste fino y comparacion de tecnicas.
- Generacion de corpus transcritos de forma asistida: combinado con correccion manual, puede acelerar la creacion de datasets de texto a partir de audio en jemer.
- Integracion en aplicaciones de accesibilidad para hablantes de jemer: transcripcion de reuniones o notas de voz con supervision humana por la tasa de error.
- Evaluacion comparativa de modelos ASR para jemer: sirve como referencia base (WER 54,73 %) frente a la que medir mejoras de futuros ajustes o de modelos de mayor tamano.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Modelo | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| Whisper Small Hh - First Model | seanghay/khmer_mpwt_speech (km) | test | WER | 54,73 % |

Evolucion durante el entrenamiento (segun la model card):

| Epoca | Paso | Perdida de validacion | WER |
|---|---|---|---|
| 1,3966 | 250 | 0,7584 | 100,37 % |
| 2,7933 | 500 | 0,4818 | 74,63 % |
| 4,1899 | 750 | 0,3758 | 61,12 % |
| 5,5866 | 1000 | 0,3352 | 54,73 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, alrededor de 1 GB para los 243,7 M de parametros; en fp16, aproximadamente 0,5 GB. El consumo real depende del framework y del tamano del lote de audio.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para inferencia en fp16; para entrenamiento o ajuste fino se recomienda una GPU de 16 GB o superior (por ejemplo, RTX 4090, A100 o H100).
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: transformers (pipeline de `automatic-speech-recognition`), vLLM no aplica de forma nativa a ASR, llama.cpp/Ollama no soportan Whisper de forma estandar; TGI no esta orientado a este tipo de modelo. La via documentada es transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (km) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rithme3/trainer_output | 243,7 M | no disponible | 54,73 % (test, no verificado) | Apache 2.0 | Hugging Face |
| openai/whisper-small | 243,7 M | ventana de audio de 30 s | no disponible para jemer | Apache 2.0 | Hugging Face |
| openai/whisper-large-v3 | 1.550 M | ventana de audio de 30 s | no disponible para jemer | Apache 2.0 | Hugging Face |

La comparacion con alternativas especificas para jemer no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- WER de 54,73 % en el split de test: tasa de error muy alta para uso en produccion sin revision humana.
- Modelo sin converger: la curva de entrenamiento seguia mejorando en el ultimo paso registrado, por lo que el rendimiento final puede no reflejar el potencial del ajuste.
- Sesgos conocidos: no documentados; al entrenarse sobre un unico dataset, puede heredar los sesgos de dominio, acento y calidad de audio de ese corpus.
- Riesgo de alucinacion: los modelos Whisper pueden generar texto plausible no presente en el audio, especialmente con audio ruidoso o fuera de dominio.
- Limitaciones de idioma: el ajuste esta orientado solo al jemer; el rendimiento en otros idiomas no esta garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no documenta condiciones adicionales ni garantias.
- Model card incompleta: las secciones de descripcion, usos previstos y limitaciones estan marcadas como "More information needed", lo que dificulta evaluar su idoneidad.
- Fecha de creacion inusual (2026-11-25) y cero descargas: el modelo no tiene validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rithme3/trainer_output
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset de entrenamiento: https://huggingface.co/datasets/seanghay/khmer_mpwt_speech
