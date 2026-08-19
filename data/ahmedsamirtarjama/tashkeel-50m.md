# ahmedsamirtarjama/Tashkeel-50M

## Resumen

Tashkeel-50M es un modelo de diacritizacion del arabe (tashkeel) de aproximadamente 50 millones de parametros, desarrollado por Ahmed Samir. Se trata de un modelo causal de estilo LLaMA (LlamaForCausalLM) ajustado a partir del modelo base oddadmix/50M-2048-Emhotob sobre el dataset Misraj/Sadeed_Tashkeela. Su funcion es anadir signos diacriticos (harakat) a texto arabe sin vocalizar, una tarea esencial para la lectura, la sintesis de voz y el analisis morfologico del arabe.

Con una ventana de contexto de 2048 tokens y una arquitectura compacta de 12 capas con hidden size de 512, el modelo esta disenado para experimentos rapidos de tashkeel en dispositivos de bajos recursos o directamente en local. Su relevancia radica en ofrecer una alternativa ligera y de codigo abierto (licencia Apache 2.0) frente a sistemas propietarios de gran tamano, aunque con limitaciones claras de calidad en arabe clasico complejo.

El modelo se entrena con un prompt en arabe que pide diacritizar una frase dada y genera el texto diacritizado como continuacion. No es un modelo de proposito general, sino una herramienta especializada en la transduccion de texto arabe sin diacriticos a texto diacritizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaMA-style (LlamaForCausalLM) |
| Parametros totales | 51.786.240 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Tashkeel-50M emplea una arquitectura transformer causal de estilo LLaMA con 12 capas, hidden size de 512 y un vocabulario de 32.000 tokens. El modelo se ajusto completamente (full fine-tune, no LoRA) sobre el dataset Misraj/Sadeed_Tashkeela durante una sola epoca, con una tasa de aprendizaje de 3e-4, scheduler coseno, 500 pasos de warmup, batch size de 32 y una longitud maxima de secuencia de 768 tokens (los ejemplos mas largos se descartaron). La perdida se calcula unicamente sobre los tokens diacritizados del objetivo, enmascarando los tokens del prompt con -100, y la precision de entrenamiento fue bfloat16.

El formato de entrenamiento e inferencia sigue el patron: prompt en arabe (`قم بتشكيل هذة الجمله : {texto_sin_diacriticos}`) seguido del texto diacritizado como objetivo. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion; se trata de un ajuste supervisado clasico de modelado de lenguaje causal.

## Capacidades

- Diacritizacion de texto arabe: anade harakat (fatha, damma, kasra, sukun, etc.) a frases sin vocalizar.
- Generacion de texto causal: dado el prompt de instruccion, genera la continuacion diacritizada.
- Inferencia rapida en dispositivos de bajos recursos: al ser un modelo de ~50M de parametros, puede ejecutarse en CPU o GPU de gama baja.
- Compatible con el ecosistema transformers de Hugging Face y con text-generation-inference (etiqueta `endpoints_compatible`).
- No soporta tool calling, ni vision, ni audio, ni modo de razonamiento explicito.
- No es un modelo de chat de proposito general; su unica funcion es la transduccion de texto arabe a texto diacritizado.

## Casos de uso

- Prototipado de sistemas de diacritizacion: investigadores pueden usar Tashkeel-50M como linea base para comparar arquitecturas mas grandes o tecnicas de decodificacion restringida, gracias a su tamano reducido y facilidad de ejecucion.
- Demos educativas: sirve para ilustrar el ajuste fino de un modelo causal LM para tareas de transduccion de secuencias en entornos academicos, con un ejemplo reproducible en pocas lineas de codigo.
- Preprocesado de texto para sintesis de voz (TTS): el texto arabe diacritizado mejora la pronunciacion en sistemas de texto a voz; Tashkeel-50M puede integrarse en pipelines ligeros de preprocesado en dispositivos con recursos limitados.
- Analisis linguistico del arabe: la diacritizacion facilita el analisis morfologico y semantico de textos, especialmente util para herramientas de NLP educativas o de investigacion filologica.
- Experimentos de eficiencia: al ocupar aproximadamente 100 MB en bfloat16, permite probar diacritizacion en entornos embebidos o moviles donde los modelos grandes no son viables.
- Linea base para decodificacion restringida: se puede combinar con restricciones de decodificacion que mantengan fijo el esqueleto sin diacriticos para reducir alucinaciones, como sugiere el propio autor en la model card.

## Benchmarks y rendimiento

El modelo se evaluo sobre el dataset Misraj/SadeedDiac-25 con metricas DER (Diacritization Error Rate) y WER (Word Error Rate), tanto con terminaciones de caso (CE) como sin ellas (w/o CE). Los resultados de Tashkeel-50M se calcularon solo sobre ejemplos donde la prediccion y la referencia coinciden en numero de palabras, por lo que son optimistas:

| Modelo | DER (CE) | WER (CE) | DER (w/o CE) | WER (w/o CE) | Alucinaciones (%) |
|---|---|---|---|---|---|
| Claude-3-7-Sonnet | 1.39 | 4.67 | 0.77 | 2.31 | 0.82 |
| Tashkeel-50M | 3.08* | 9.56* | 2.26* | 6.77* | ~99 |
| GPT-4 | 3.86 | 5.27 | 3.86 | 10.93 | 1.02 |
| Gemini-Flash-2.0 | 3.19 | 7.99 | 2.38 | 5.50 | 1.17 |
| Sadeed | 7.29 | 13.74 | 5.26 | 9.92 | 7.19 |

\*Los valores de Tashkeel-50M son optimistas: la mayoria de las generaciones cambian la longitud del texto (truncamiento, repeticiones o inserciones), por lo que se descartan en la evaluacion por coincidencia de numero de palabras. La tasa de alucinaciones (~99%) refleja esta limitacion, y los numeros no son comparables de forma directa con sistemas que preservan la identidad de las palabras en casi todos los ejemplos.

## Requisitos de hardware

- VRAM estimada: con 51.786.240 parametros en bfloat16, el modelo ocupa aproximadamente 100 MB en memoria; en float32, unos 200 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; la inferencia en CPU es viable para uso interactivo.
- Compatible con GPU de consumo: si, cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en dispositivos con memoria compartida.
- Opciones de despliegue: transformers (Python), text-generation-inference (etiqueta `endpoints_compatible`). No se documenta compatibilidad explicita con llama.cpp u Ollama.
- Latencia y throughput: no se han publicado mediciones oficiales; dado el tamano, se espera una latencia de milisegundos por token en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | DER (CE) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tashkeel-50M | ~50M | 2048 | 3.08* | Apache 2.0 | Hugging Face |
| Sadeed | no disponible | no disponible | 7.29 | no disponible | no disponible |
| Cohere-Speech-Tashkeel-2B | 2B | no disponible | no disponible | Apache 2.0 | Hugging Face |

Nota: Sadeed es un sistema de diacritizacion arabe de referencia, pero no se dispone de sus especificaciones tecnicas completas. Cohere-Speech-Tashkeel-2B es un modelo de 2B parametros orientado a reconocimiento de voz y diacritizacion, significativamente mayor que Tashkeel-50M. La comparacion directa no es totalmente equitativa porque Tashkeel-50M solo se evalua en ejemplos con coincidencia de numero de palabras.

## Limitaciones y advertencias

- Capacidad limitada: con ~50M de parametros, la calidad es inferior a la de modelos grandes o sistemas dedicados en arabe clasico complejo.
- Alucinaciones frecuentes: la generacion causal puede truncar, repetir o insertar palabras, lo que provoca que la mayoria de las salidas no coincidan en longitud con la referencia (tasa de alucinaciones ~99% en la evaluacion).
- Dependencia del prompt: el modelo se entreno con un prompt especifico en arabe; cambiar el formato puede degradar significativamente la calidad.
- No es un modelo de chat: no sirve para conversacion general ni para tareas fuera de la diacritizacion.
- Evaluacion optimista: las metricas DER/WER publicadas solo cubren los ejemplos donde la longitud coincide, por lo que no reflejan el rendimiento real sobre todo el corpus.
- Para produccion, se recomienda usar modelos mas robustos o anadir restricciones de decodificacion que mantengan fijo el esqueleto sin diacriticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedsamirtarjama/Tashkeel-50M
- Modelo base: https://huggingface.co/oddadmix/50M-2048-Emhotob
- Dataset de entrenamiento: https://huggingface.co/datasets/Misraj/Sadeed_Tashkeela
- Dataset de evaluacion: https://huggingface.co/datasets/Misraj/SadeedDiac-25
