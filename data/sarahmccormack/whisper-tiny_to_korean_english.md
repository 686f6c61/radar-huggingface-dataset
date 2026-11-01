# SarahMcCormack/whisper-tiny_to_korean_english

## Resumen

Whisper tiny Korean es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, desarrollado por SarahMcCormack, orientado al reconocimiento automatico del habla (ASR) sobre un conjunto de datos denominado korean_english. El modelo parte de la arquitectura encoder-decoder transformer de Whisper, en su variante mas pequena, y conserva la licencia Apache 2.0 del modelo original.

El modelo resuelve la tarea de transcripcion de audio a texto, con un enfoque especifico en material que combina coreano e ingles. Con 37,7 millones de parametros y un repositorio de apenas 0,3 GB, esta pensado para escenarios con recursos muy limitados, prototipado rapido o experimentacion docente, mas que para produccion a gran escala.

Su relevancia es acotada: se trata de un ajuste experimental generado automaticamente con el Trainer de Hugging Face, con escasa documentacion (la propia model card indica "More information needed" en varias secciones) y un unico resultado declarado de WER del 9,78 % sobre el split de test del dataset korean_english. Resulta util como referencia de partida para fine-tunings de Whisper en contextos bilingues coreano-ingles, pero no debe considerarse un modelo maduro ni validado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny trabaja con ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun la model card); el dataset de entrenamiento se denomina korean_english |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un transformer encoder-decoder con atencion multi-cabeza estandar, disenado para procesar espectrogramas de audio de 30 segundos y generar transcripciones token a token. No incorpora innovaciones arquitectonicas propias; el trabajo se limita al ajuste fino de los pesos preentrenados.

El entrenamiento se realizo sobre el dataset korean_english con los siguientes hiperparametros declarados: learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW (variante fused, betas 0,9/0,999, epsilon 1e-08), scheduler lineal con 500 pasos de warmup y 2000 pasos totales. Se registran dos checkpoints: en el paso 1000 (epoch 1,0173) con perdida de validacion 0,2164 y WER 9,8537, y en el paso 2000 (epoch 2,0346) con perdida de validacion 0,2030 y WER 9,7805. No se documenta composicion del dataset, numero de tokens de audio, ni si hubo etapas de RLHF o DPO (no aplicables en un modelo ASR de este tipo).

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en la pipeline `automatic-speech-recognition`.
- Especializacion en material bilingue coreano-ingles segun el dataset de entrenamiento declarado.
- Generacion de transcripciones con puntuacion y mayusculas propias del decoder de Whisper.
- Compatible con la libreria transformers y con endpoints de Hugging Face (`endpoints_compatible`).
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No se declaran capacidades de vision, audio generativo ni modo thinking.
- Capacidades multilingues: la model card solo declara `en`; el alcance real sobre coreano no esta verificado de forma independiente.

## Casos de uso

- Prototipado rapido de ASR: por su tamano (37,7 M de parametros) y su licencia Apache 2.0, sirve para validar pipelines de transcripcion en local antes de escalar a variantes mayores de Whisper.
- Transcripcion de audio bilingue coreano-ingles en entornos de investigacion: el ajuste sobre el dataset korean_english lo hace adecuado para experimentos academicos con mezcla de ambos idiomas, siempre que se valide el WER real en el dominio objetivo.
- Docencia y experimentacion con fine-tuning: el modelo y su configuracion de entrenamiento (learning rate, scheduler, pasos) constituyen una referencia reproducible para aprender a ajustar modelos Whisper.
- Subtitulado offline de bajo coste: cabe en CPU y en GPUs de gama baja, por lo que puede emplearse para generar subtitulos en lotes pequenos sin infraestructura dedicada.
- Pruebas de integracion en pipelines de Hugging Face: al ser `endpoints_compatible`, permite validar flujos de despliegue con Inference Endpoints o con la libreria transformers antes de migrar a modelos de mayor tamano.
- Evaluacion comparativa de ajustes: sirve como linea base para medir mejoras de otros fine-tunings de Whisper tiny sobre el mismo dataset korean_english.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| Whisper tiny Korean | Korean English | test | WER | 9,7805 % |
| Whisper tiny Korean (paso 1000) | Korean English | validacion | WER | 9,8537 % |
| Whisper tiny Korean (paso 2000) | Korean English | validacion | WER | 9,7805 % |

Perdida de validacion en el paso 2000: 0,2030. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (37,7 M de parametros, ~150 MB en fp32); en fp16 o int8 el consumo es aun menor.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobredimensionada; el modelo funciona tambien en CPU.
- Cabe en cualquier GPU consumer e incluso en dispositivos de bajos recursos y en CPU para transcripciones de audio cortas.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), Hugging Face Inference Endpoints, y conversion a otros runtimes si se generan los pesos adecuados (no se proporcionan formatos GGUF ni ONNX en el repositorio).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper tiny Korean (este modelo) | 37,7 M | ventanas de 30 s (arquitectura Whisper tiny) | en declarado; dataset coreano-ingles | apache-2.0 | Hugging Face |
| openai/whisper-tiny | 39 M (aprox.) | ventanas de 30 s | multilingue (99 idiomas en la variante multilingual) | apache-2.0 | Hugging Face |
| openai/whisper-base | 74 M (aprox.) | ventanas de 30 s | multilingue | apache-2.0 | Hugging Face |
| openai/whisper-small | 244 M (aprox.) | ventanas de 30 s | multilingue | apache-2.0 | Hugging Face |

No se dispone de resultados de WER comparables de los modelos alternativos sobre el dataset korean_english en la informacion proporcionada, por lo que la comparacion de rendimiento no esta disponible.

## Limitaciones y advertencias

- Modelo generado automaticamente con el Trainer; la model card contiene secciones sin completar ("Model description", "Intended uses & limitations", "Training and evaluation data"), lo que dificulta evaluar su alcance real.
- El unico resultado de WER (9,78 %) esta declarado por el autor y marcado como no verificado (`verified: false`); no debe tomarse como referencia solida sin validacion propia.
- La model card declara unicamente el idioma `en`, aunque el dataset se denomine korean_english; el soporte real de coreano no esta documentado ni verificado.
- Riesgo de alucinacion y de transcripciones incorrectas en audio con ruido, acentos marcados o vocabulario tecnico, habitual en modelos Whisper de tamano tiny.
- Sesgos inheritos del dataset de entrenamiento korean_english, cuya composicion y procedencia no se detallan.
- Al ser un modelo tiny, su precision es inferior a la de variantes base, small o medium de Whisper en condiciones reales.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe asumir la responsabilidad de validar el rendimiento en su dominio y de cumplir las obligaciones de atribucion.
- No se proporcionan formatos cuantizados (GGUF, ONNX) ni instrucciones de despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SarahMcCormack/whisper-tiny_to_korean_english
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Documentacion de transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
