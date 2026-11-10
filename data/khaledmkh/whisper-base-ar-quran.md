# khaledmkh/whisper-base-ar-quran

## Resumen

whisper-base-ar-quran es un ajuste fino (fine-tune) del modelo de reconocimiento automatico del habla openai/whisper-base, desarrollado por el usuario khaledmkh y publicado en Hugging Face. El modelo parte de la arquitectura transformer encoder-decoder de Whisper (variante "base", aproximadamente 74 millones de parametros) y se ha reentrenado especificamente para transcribir recitacion coranica en arabe. El problema que aborda es la baja precision de los modelos Whisper genericos sobre este dominio concreto, caracterizado por diccion especifica, prosodia particular y terminologia religiosa poco representada en los corpus de entrenamiento generalistas.

El ajuste se realizo con el Trainer de Hugging Face sobre un conjunto de datos no documentado en la model card, durante 5000 pasos y con un batch total de 128 (8 dispositivos en entrenamiento multi-GPU). El autor reporta una perdida de validacion de 0,0839 y una tasa de error de palabra (WER) del 5,7544 % en el conjunto de evaluacion, lo que supone una mejora sustancial frente al punto de partida del entrenamiento (13,389 % de WER en el primer checkpoint).

La relevancia del modelo es acotada pero clara: es un recurso especializado para aplicaciones de transcripcion y alineacion de recitacion coranica, con licencia Apache 2.0 y un tamano de repositorio de 0,3 GB que lo hace desplegable en hardware modesto. No obstante, la documentacion es practicamente inexistente (la model card es autogenerada y contiene secciones "More information needed"), no se declaran idiomas soportados en los metadatos y no hay resultados de benchmarks en el model-index.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base, ajuste fino supervisado) |
| Parametros totales | Aproximadamente 74 millones (heredados de openai/whisper-base; no confirmado en la model card) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos por segmento (estandar de Whisper; no especificado en la model card) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (compatible con cuantizacion via herramientas estandar de Whisper/transformers) |
| Idiomas soportados | No disponible en los metadatos; por el nombre y el ajuste, orientado a arabe (recitacion coranica) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible explicitamente; repositorio PyTorch (pytorch), compatible con safetensors/transformers |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-base: un transformer encoder-decoder con atencion multi-cabeza, entrenado originalmente por OpenAI para transcripcion y traduccion de voz multilingue. El ajuste fino se realizo con el framework Trainer de Hugging Face (Transformers 4.26.0.dev0, PyTorch 1.13.0+cu117, Datasets 2.7.1.dev0, Tokenizers 0.13.2) sobre un dataset no identificado en la model card, que se describe unicamente como "None dataset".

Los hiperparametros de entrenamiento fueron: learning rate 1e-4, Adam con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con 500 pasos de warmup, batch de entrenamiento total de 128 (16 por dispositivo en 8 GPUs), batch de evaluacion de 64 (8 por dispositivo), semilla 42, precision mixta nativa AMP y un total de 5000 pasos. No se documenta el numero de tokens de audio, la composicion del dataset, ni si hubo etapas de RLHF o DPO (no aplicables en un modelo ASR supervisado). No se describe ninguna innovacion tecnica adicional mas alla del ajuste fino supervisado estandar.

## Capacidades

- Reconocimiento automatico del habla (ASR) orientado a recitacion coranica en arabe.
- Transcripcion de audio a texto con salida en escritura arabe (deducido del dominio de ajuste; no confirmado explicitamente).
- Procesamiento de segmentos de audio de hasta 30 segundos, segun la ventana estandar de Whisper.
- Capacidad multilingue heredada de Whisper base, aunque el ajuste fino probablemente degrada el rendimiento en idiomas distintos del arabe coranico (no documentado).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio generativo.
- No se documenta modo "thinking" ni capacidades especiales adicionales.

## Casos de uso

- Transcripcion de recitacion coranica para aplicaciones religiosas: el modelo puede convertir audio de recitacion en texto arabe con una WER reportada del 5,75 % en el conjunto de evaluacion, adecuado para generar transcripciones de referencia en plataformas de contenido islamico.
- Alineacion de audio y texto en herramientas de aprendizaje del Coran: la transcripcion permite sincronizar la recitacion con el texto escrito para aplicaciones de memorizacion y seguimiento (tajwid, hifz).
- Generacion de subtitulos para videos de recitacion: dado el bajo coste computacional del modelo base (0,3 GB de repositorio), puede desplegarse en servidores modestos para subtitular contenido audiovisual de forma automatizada.
- Indexacion y busqueda de archivos de audio religiosos: transcribir grandes archivos de recitacion para permitir busqueda textual por versiculos o fragmentos.
- Investigacion en procesamiento de habla arabe: servir como punto de partida o referencia para estudios de ASR especializado en dominios religiosos, dado que parte de Whisper base y es reproducible con los hiperparametros documentados.
- Prototipado de asistentes de voz para comunidades arabohablantes: integrar el modelo en pipelines de ASR para consultas sobre textos coranicos, siempre que se valide el rendimiento fuera del dominio de recitacion.
- Evaluacion comparativa de fine-tuning de Whisper: el historial de entrenamiento (WER por checkpoint) permite estudiar la curva de convergencia del ajuste fino en dominios especializados.

## Benchmarks y rendimiento

El model-index oficial no contiene resultados (`"results": []`). Los unicos datos disponibles son los de la model card, declarados por el autor durante el entrenamiento:

| Metrica | Valor | Contexto |
|---|---|---|
| WER (evaluacion final) | 5,7544 % | Conjunto de evaluacion no identificado, paso 5000 |
| Loss (evaluacion final) | 0,0839 | Mismo conjunto, paso 5000 |
| WER (primer checkpoint) | 13,3890 % | Paso 250 |
| WER (mejor checkpoint intermedio) | 5,7544 % | Paso 5000 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 para los aproximadamente 74 millones de parametros; en la practica, el cuello de botella es el buffer de audio y el runtime, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; se puede ejecutar en CPU para inferencia por lotes pequenos.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (GTX 1060, RTX 3060, RTX 4090) e incluso en Raspberry Pi con llama.cpp/whisper.cpp para cuantizaciones agresivas.
- Opciones de despliegue: transformers (pipeline de ASR), whisper.cpp, faster-whisper, vLLM no aplica directamente (modelo ASR), TGI no orientado a ASR; Ollama no soporta Whisper de forma nativa.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y del backend. Para un modelo base de 74 M, se espera inferencia en tiempo real o mas rapida en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto (audio) | WER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-base-ar-quran | ~74 M | 30 s por segmento | 5,75 % (conjunto no identificado) | Apache 2.0 | Hugging Face |
| openai/whisper-base | ~74 M | 30 s por segmento | No disponible en esta ficha | MIT (modelo original) | Hugging Face / OpenAI |
| openai/whisper-small | ~244 M | 30 s por segmento | No disponible en esta ficha | MIT | Hugging Face / OpenAI |
| whisper-base (fine-tunes arabes genericos) | ~74 M | 30 s por segmento | No disponible en esta ficha | Variable | Hugging Face |

La comparacion cuantitativa con alternativas no es posible con la informacion proporcionada: no hay WER del modelo base original sobre el mismo conjunto de evaluacion ni de otros fine-tunes arabes. La ventaja principal del modelo es su especializacion en recitacion coranica y su licencia Apache 2.0 permisiva; la desventaja es la falta de documentacion y de validacion externa.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card es autogenerada y las secciones de descripcion, usos previstos y datos de entrenamiento indican "More information needed".
- Conjunto de evaluacion no identificado: la WER del 5,75 % no es verificable ni comparable, ya que no se especifica el corpus, el numero de muestras ni el preprocesado.
- Sesgo de dominio: el ajuste fino sobre recitacion coranica puede degradar el rendimiento en arabe conversacional, dialectos o cualquier otro idioma, aunque herede la base multilingue de Whisper.
- Riesgo de alucinacion: como todo modelo ASR generativo, puede producir texto plausible pero incorrecto en segmentos con ruido, silencios o audio de baja calidad; critico en textos religiosos donde la fidelidad es esencial.
- Idiomas no declarados en los metadatos: no hay confirmacion oficial del alcance linguistico; el uso fuera del arabe coranico debe validarse empiricamente.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base original de OpenAI tiene licencia MIT; conviene revisar la compatibilidad y atribucion en productos derivados.
- Sin garantias de produccion: no hay tests de robustez, evaluacion con ruido, ni validacion en dominios distintos del de entrenamiento; no se recomienda su uso en produccion sin una evaluacion propia.
- Fecha de creacion futura en los metadatos (2026-11-10): inconsistencia que sugiere posibles errores en la publicacion del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/khaledmkh/whisper-base-ar-quran
- Modelo base: https://huggingface.co/openai/whisper-base
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Implementacion whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Implementacion faster-whisper: https://github.com/SYSTRAN/faster-whisper
