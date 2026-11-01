# sanmartp/whisper-tiny_to_canadian_accent_28oct

## Resumen

Whisper tiny canadian es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla openai/whisper-tiny, desarrollado por el usuario sanmartp. El modelo parte de la arquitectura encoder-decoder transformer de Whisper en su variante "tiny" y se ha reentrenado sobre el conjunto de datos naharte/canadian_english con el objetivo de mejorar la transcripcion de ingles con acento canadiense. Se distribuye bajo licencia Apache 2.0 y con pesos en formato safetensors, lo que facilita su integracion en pipelines basados en la libreria transformers.

El modelo es relevante como ejemplo de especializacion por acento sobre un checkpoint pequeno: con tan solo 37,76 millones de parametros y un repositorio de 0,3 GB, puede ejecutarse en hardware muy modesto (incluso CPU) y servir como base para experimentos de adaptacion de dominio en ASR. No obstante, el rendimiento reportado es limitado: un WER de 20,88 % sobre el split de test del dataset de acento canadiense, lo que refleja las restricciones inherentes a la variante tiny de Whisper y a un entrenamiento corto.

La ficha se basa exclusivamente en la informacion publicada en HuggingFace y en la model card del autor. La model card esta generada automaticamente por el Trainer y contiene secciones sin completar ("More information needed"), por lo que varios detalles sobre datos, procedimiento e intencion de uso no estan disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 s; no se detalla en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un transformer encoder-decoder con mecanismo de atencion estandar, disenado para transcripcion de audio a texto. El ajuste fino se realizo con la libreria transformers (version 5.22.0.dev0) y PyTorch 2.11.0+cu130, sobre el dataset naharte/canadian_english, orientado a ingles con acento canadiense. No se especifica en la model card el numero de tokens de audio ni la composicion detallada del dataset.

Los hiperparametros de entrenamiento documentados son: learning rate de 1e-5, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW (variante fused, betas 0,9/0,999, epsilon 1e-8), scheduler lineal con 500 pasos de warmup y 2000 pasos totales (2 epocas). La perdida de validacion final fue 0,4245 y el WER de validacion 20,8760. No se menciona el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con especializacion en acento canadiense.
- Transcripcion de audio a texto mediante el pipeline automatic-speech-recognition de transformers.
- Compatible con endpoints de HuggingFace (tag endpoints_compatible).
- No se documentan capacidades de traduccion, identificacion de idioma, tool calling, agentes, vision ni audio mas alla de la transcripcion.
- Capacidad multilingue limitada: el modelo declara unicamente el idioma en.

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles canadiense: el modelo puede integrarse en un pipeline de transformers para convertir audio en texto en entornos donde el acento canadiense es predominante, aunque su WER de ~21 % exige revision humana.
- Prototipado rapido de ASR en local: gracias a sus 37,76 millones de parametros y 0,3 GB de repositorio, permite experimentar en portatiles o CPUs sin GPU dedicada.
- Base para nuevos ajustes finos: sirve como punto de partida para especializar ASR en otros acentos o dominios con presupuesto computacional reducido.
- Generacion de subtitulos automaticos en entornos de bajo recursos: su tamano permite desplegarlo en dispositivos edge o servidores modestos para subtitulado no critico.
- Evaluacion comparativa de tecnicas de adaptacion por acento: util en investigacion para medir el impacto de fine-tuning sobre checkpoints tiny frente a variantes mayores de Whisper.
- Filtrado y preetiquetado de corpus de audio: puede emplearse para generar transcripciones preliminares que luego se corrigen manualmente, acelerando la anotacion de datasets de habla canadiense.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index (no verificados):

| Dataset | Split | Metrica | Valor |
|---|---|---|---|
| Canadian English (naharte/canadian_english) | test | WER | 20,875950694990824 |

Resultados de validacion durante el entrenamiento:

| Epoca | Paso | Validation loss | WER |
|---|---|---|---|
| 1.0 | 1000 | 0,4234 | 21,5054 |
| 2.0 | 2000 | 0,4245 | 20,8760 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K no aplican a ASR; no hay comparacion con whisper-tiny base ni con otras variantes).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 37,76 millones de parametros; en la practica, el consumo depende del framework y del tamano de los lotes de audio.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM; tambien es viable en CPU.
- Opciones de despliegue: transformers (pipeline automatic-speech-recognition), endpoints de HuggingFace; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (estas herramientas estan orientadas a modelos de texto y no aplican directamente a Whisper).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | WER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sanmartp/whisper-tiny_to_canadian_accent_28oct | 37,76 M | ventanas de 30 s (heredado de Whisper tiny) | 20,88 % (Canadian English test) | apache-2.0 | HuggingFace |
| openai/whisper-tiny (base) | 37,76 M | ventanas de 30 s | no disponible en esta ficha | apache-2.0 | HuggingFace |
| openai/whisper-base | ~74 M | ventanas de 30 s | no disponible en esta ficha | apache-2.0 | HuggingFace |
| openai/whisper-small | ~244 M | ventanas de 30 s | no disponible en esta ficha | apache-2.0 | HuggingFace |

La comparacion cuantitativa con el checkpoint base y con variantes mayores no puede realizarse con los datos disponibles; los valores de WER de los modelos de referencia no se han incluido en la informacion proporcionada.

## Limitaciones y advertencias

- WER de 20,88 % sobre el conjunto de test: elevado para uso en produccion sin revision humana, especialmente en dominios con vocabulario tecnico o ruido ambiental.
- Especializado en ingles con acento canadiense; no se garantiza un rendimiento adecuado en otros acentos o idiomas.
- Model card incompleta: las secciones de descripcion, usos previstos, limitaciones y datos de entrenamiento no estan cumplimentadas por el autor.
- Riesgo de alucinacion en la transcripcion: como todo modelo Whisper, puede generar texto plausible no presente en el audio, especialmente en segmentos con silencio o ruido.
- Sesgos potenciales derivados del dataset naharte/canadian_english, cuya composicion y cobertura no se detallan.
- Licencia Apache 2.0 permite uso comercial, pero el autor no documenta evaluaciones adicionales ni garantias de calidad.
- No se documentan tecnicas de mitigacion de sesgos ni evaluaciones de robustez.
- El modelo se ha entrenado con solo 2 epocas y 2000 pasos, lo que sugiere un ajuste limitado y posible infrautilizacion del dataset.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sanmartp/whisper-tiny_to_canadian_accent_28oct
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/naharte/canadian_english
