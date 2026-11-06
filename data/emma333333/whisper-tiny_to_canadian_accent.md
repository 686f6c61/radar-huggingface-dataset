# emma333333/whisper-tiny_to_canadian_accent

## Resumen

Whisper tiny Canadian es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario emma333333 en Hugging Face. Se trata de un sistema de reconocimiento automatico del habla (ASR) especializado en ingles canadiense, entrenado sobre el dataset `canadian_english`. El modelo parte de la arquitectura encoder-decoder transformer de Whisper en su variante tiny, con 37,76 millones de parametros, y hereda la licencia Apache 2.0 del modelo original.

El modelo resuelve el problema de la transcripcion de audio en ingles con acento canadiense, un dominio donde los modelos genericos de Whisper pueden presentar un rendimiento inferior al no haber sido expuestos de forma especifica a las particularidades foneticas y lexicas de esta variante. Al tratarse de un fine-tuning sobre la variante tiny, el objetivo es ofrecer una solucion ligera y desplegable en hardware modesto, a costa de una precision limitada en comparacion con variantes mayores de la familia Whisper.

La relevancia de este modelo es acotada: se publica como un experimento de ajuste fino con una model card generada automaticamente y sin documentacion adicional sobre composicion del dataset, procedimiento de evaluacion o limitaciones. El WER declarado de 20,90 sobre el split de test del dataset `canadian_english` es elevado en terminos absolutos, lo que lo situa como una referencia de partida mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion posterior via herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura de Whisper tiny: un transformer encoder-decoder con mecanismo de atencion estandar, disenado para recibir espectrogramas Mel de audio y generar tokens de transcripcion. La variante tiny de Whisper es la mas pequena de la familia y esta pensada para inferencia de baja latencia en entornos con recursos limitados. El modelo base es openai/whisper-tiny, y este ajuste fino conserva su estructura y tokenizador.

El entrenamiento se realizo con el Trainer de Hugging Face sobre el dataset `canadian_english`, con los siguientes hiperparametros declarados: learning rate de 1e-05, batch size de entrenamiento de 2, batch size de evaluacion de 1, semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y un total de 2000 pasos de entrenamiento (2 epocas). La perdida de validacion final fue de 0,4252 y el WER de 20,9022. No se documenta el numero de tokens de audio, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en un fine-tuning ASR supervisado de este tipo). Las versiones de framework declaradas son Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Transcripcion de audio a texto en ingles, con especializacion en acento canadiense.
- Reconocimiento automatico del habla sobre ventanas de audio de hasta 30 segundos, segun la configuracion estandar de Whisper tiny.
- Generacion de transcripciones con puntuacion y mayusculas basicas, heredadas del modelo base.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo ASR, no conversacional).
- Capacidades multilingues: limitadas al ingles; no se declara soporte de otros idiomas.
- Capacidades especiales: no se declaran modos de pensamiento, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles canadiense: el modelo puede convertir grabaciones cortas en texto para actas o resumenes posteriores, aprovechando su especializacion en esta variante del ingles y su bajo coste computacional.
- Subtitulado automatizado de contenido audiovisual: adecuado para generar subtitulos preliminares en videos con hablantes canadienses, que luego se revisan manualmente dado el WER elevado.
- Prototipado de asistentes de voz: sirve como componente ASR en fases de prueba de concepto donde se prioriza la velocidad de iteracion sobre la precision final.
- Investigacion sobre adaptacion de dominio en ASR: util como punto de comparacion para estudiar el efecto del fine-tuning sobre variantes dialectales en modelos pequenos.
- Despliegue en dispositivos con recursos limitados: al tener 37,76 millones de parametros, puede ejecutarse en CPU o GPUs de gama baja para tareas de transcripcion no criticas.
- Generacion de datasets de audio etiquetados: puede emplearse para pre-anotar corpus de habla canadiense que despues se corrigen manualmente, acelerando la creacion de datos de entrenamiento.
- Filtrado y busqueda de contenido en archivos de audio: transcripcion para indexar y buscar dentro de grabaciones en ingles canadiense en entornos de archivo o compliance.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| Whisper tiny Canadian | Canadian English (split test) | WER | 20,9022 |
| Whisper tiny Canadian | Canadian English (validacion, epoca 1) | WER | 21,2169 |
| Whisper tiny Canadian | Canadian English (validacion, epoca 2) | WER | 20,9022 |

Perdida de validacion final: 0,4252. No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (fp32) para 37,76 millones de parametros; en torno a 0,2-0,3 GB en fp16 o int8.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien funciona en GPUs de gama baja y en CPU.
- Cabe en consumer GPU: si, en practicamente cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU para inferencia en tiempo no real.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), vLLM no aplica de forma nativa para ASR, llama.cpp no soporta Whisper de forma directa, Ollama no aplica; alternativas habituales son faster-whisper y whisper.cpp para optimizacion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; al ser la variante tiny, la latencia esperada es baja, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| emma333333/whisper-tiny_to_canadian_accent | 37,76 M | ventanas de 30 s (estandar Whisper) | 20,90 (Canadian English) | apache-2.0 | Hugging Face |
| openai/whisper-tiny | 37,76 M | ventanas de 30 s | no disponible en esta ficha | apache-2.0 | Hugging Face |
| openai/whisper-base | 74,4 M | ventanas de 30 s | no disponible en esta ficha | apache-2.0 | Hugging Face |
| openai/whisper-small | 244 M | ventanas de 30 s | no disponible en esta ficha | apache-2.0 | Hugging Face |

La comparacion con variantes mayores de Whisper es relevante porque, a igualdad de dominio, el aumento de parametros suele reducir el WER de forma significativa; no obstante, no se dispone de mediciones comparativas en el dataset `canadian_english` para confirmarlo con datos.

## Limitaciones y advertencias

- El WER declarado de 20,90 es elevado para uso en produccion; se recomienda revision humana o uso como etapa preliminar.
- La model card esta generada automaticamente y carece de secciones clave (descripcion, usos previstos, limitaciones, datos de entrenamiento), lo que dificulta evaluar su robustez.
- No se documenta la composicion del dataset `canadian_english` ni el proceso de evaluacion, por lo que el WER no es verificable de forma independiente.
- Sesgos conocidos: no documentados por el autor; al heredar el modelo base, puede arrastrar sesgos de Whisper tiny en cuanto a representacion de acentos, genero y origen.
- Riesgo de alucinacion: presente en modelos ASR de la familia Whisper, especialmente en audio con ruido o silencios largos; no se documenta mitigacion especifica.
- Limitaciones de contexto: la ventana de audio estandar de Whisper tiny es de 30 segundos; audios mas largos requieren segmentacion.
- Limitaciones de idioma: solo se declara ingles; no se garantiza buen rendimiento en otras variantes del ingles ni en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar la licencia del modelo base y del dataset utilizado.
- Caveat para produccion: al ser un fine-tuning con solo 2 epocas y batch size 2, el ajuste puede ser limitado; se recomienda validar con datos propios antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emma333333/whisper-tiny_to_canadian_accent
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
