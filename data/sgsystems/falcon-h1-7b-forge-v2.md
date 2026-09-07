# sgsystems/Falcon-H1-7B-FORGE-v2

## Resumen

Falcon-H1-7B-FORGE-v2 es una versión cuantizada del modelo de instrucción Falcon-H1-7B-Instruct, desarrollado por TII y publicado en HuggingFace por el usuario sgsystems. Utiliza una arquitectura híbrida que combina capas Mamba-2 con atención Transformer, con un total de 7.59 mil millones de parámetros y una longitud de contexto entrenada de 262.144 tokens. El modelo original se sometió a una cuantización post-entrenamiento mediante el método FORGE, que produce un archivo GGUF de 3.48 GB con una media de 2.06 bits por peso. Esta cuantización conserva ciertas familias de tensores críticas en Q6_K para preservar la fidelidad factual, en lugar de aplicar una ternarización uniforme.

El resultado es un modelo de 7B que puede ejecutarse en dispositivos Apple Silicon con un consumo de memoria inferior a 4 GB, alcanzando aproximadamente 75 tokens por segundo de decodificación en un Apple M5 Max. Está diseñado para tareas de asistente en dispositivos edge, con plantilla de chat ChatML incrustada en el GGUF. Su relevancia radica en hacer viable un modelo de 7B en hardware de consumo con recursos limitados, sin necesidad de GPU dedicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: Mamba-2 + atención Transformer (44 bloques) |
| Parámetros totales | 7.585.654.880 |
| Parámetros activos | No aplica (arquitectura no MoE) |
| Longitud de contexto | Entrenada: 262.144; recomendada en este build: 4096 |
| Tipos de cuantización | FORGE mixta: Q6_K y TQ2_0 (ternaria), con tensores en F32; media de 2.06 bpw |
| Idiomas soportados | Inglés (en) |
| Licencia | falcon-llm-license |
| Formato de pesos | GGUF v3 |

## Arquitectura y entrenamiento

El modelo base Falcon-H1-7B-Instruct fue desarrollado por TII como parte de la familia Falcon-H1 de modelos híbridos Transformer-SSM. Su arquitectura combina capas Mamba-2 con atención estándar, formando un total de 44 bloques. La componente Mamba-2 utiliza `d_state` de 256, `d_inner` de 3072, 24 cabezas y un grupo. El vocabulario contiene 130.049 tokens y la ventana de contexto entrenada es de 262.144 tokens. El modelo incorpora una plantilla de chat ChatML incrustada en el GGUF, que debe aplicarse para obtener respuestas en formato conversacional y no simple continuación de texto.

La cuantización FORGE se realizó con GPTQ secuencial y un solucionador ternario, pero excluye dos familias de tensores —`ssm_out` (proyección de estado de Mamba-2) y `ffn_down` (proyección descendente de la FFN)— de la ternarización, manteniéndolas en Q6_K. Según el autor, esta exclusión es determinante para conservar conocimientos factuales; una versión uniformemente ternaria del mismo modelo demostró errores significativos de asociación. El calibrado se hizo con 128 muestras de wikitext2 a longitud de secuencia 2048 y semilla 0. El archivo `.forge.json` incluido permite reproducir la configuración exacta de la cuantización.

## Capacidades

- Generación de texto conversacional con plantilla ChatML y soporte de instrucciones y system prompts.
- Adherencia a instrucciones incluso con cuantización de baja precisión, reduciendo errores factuales frente a una ternarización uniforme.
- Ejecución en dispositivos edge con memoria unificada, como Apple Silicon, gracias al formato GGUF y al método FORGE.
- Inferencia mediante llama.cpp, con decodificación acelerada por Metal (HELIX opcional) y soporte para `mmap`.
- No se dispone de información sobre tool calling, visión, audio ni otras capacidades multimodales en la documentación proporcionada.

## Casos de uso

- Asistente local en aplicaciones Apple: el modelo puede integrarse en una app SwiftUI como chatbot offline. Su huella de memoria de 3.68 GB con contexto 4096 y su velocidad de decodificación de ~75 tok/s lo hacen viable en MacBooks con chips M.
- Chat privado sin conexión: usuarios de iPhone o iPad pueden ejecutar el modelo localmente con llama.cpp, garantizando que las conversaciones no salgan del dispositivo.
- Edición y corrección de texto en inglés: dado su entrenamiento monolingüe en inglés, puede reescribir, resumir o corregir textos en un entorno edge, sin depender de servicios en la nube.
- Asistente de documentación técnica: con un system prompt bien diseñado y una ventana de contexto de 4096 tokens, puede responder consultas sobre manuales, guías o especificaciones dentro de una aplicación de escritorio.
- Prototipado rápido de aplicaciones de IA en laptops: los desarrolladores pueden probar el modelo en MacBooks con chips M-series usando `llama-cpp-python`, sin necesidad de infraestructura GPU externa.
- Automatización de tareas de texto en línea de comandos: el modelo se puede empaquetar en scripts o herramientas CLI que ejecuten tareas de generación, resumen o transformación de texto en local, aprovechando la compatibilidad con `llama-cli`.
- Tutor básico de inglés o generador de ejercicios: gracias a su capacidad para seguir instrucciones, puede actuar como tutor conversacional en un dispositivo con recursos limitados, manteniendo la interacción dentro de un contexto corto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos proporcionados se centran en rendimiento de inferencia y control de repetición, medidos en un Apple M5 Max:

| Métrica | Sin HELIX | Con HELIX |
|---|---|---|
| Prefill 2048 tokens | 1428.6 t/s | 1941.8 t/s |
| Prefill 8192 tokens | 1260.5 t/s | 1623.9 t/s |
| Decode | 74.4 t/s | 74.6 t/s |

Además, el autor midió la repetición en una conversación acumulada de varios turnos en función de `repeat_last_n`:

| repeat_last_n | Repetición del transcript completo | Peor span verbatim |
|---|---|---|
| Penalización desactivada | 50.2% | 80 palabras |
| 64 (default de llama.cpp) | 45.1% | 80 |
| 512 | 51.9% | 80 |
| 2048 (recomendado) | 17.3% | 57 |

Nota: aumentar `repeat_penalty` a 1.25 con ventana 2048 empeora el resultado, subiendo la repetición al 27.9%.

## Requisitos de hardware

- Memoria residente (medida en M5 Max): 3.59 GB con `n_ctx=2048`, 3.68 GB con `n_ctx=4096` y 3.86 GB con `n_ctx=8192`.
- Advertencia importante: en plataformas Apple el proceso se termina cerca de 3.7 GB, por lo que se recomienda usar `n_ctx=4096`; con 8192 se supera el presupuesto en dispositivos con memoria limitada.
- GPU: probado en Apple M5 Max; debería funcionar en otras GPUs compatibles con llama.cpp (Metal, CUDA), aunque no se aportan mediciones.
- CPU: es posible ejecutarlo en CPU con llama.cpp, pero el rendimiento esperable es inferior al reportado en Metal.
- Despliegue: llama.cpp (`llama-cli`), `llama-cpp-python`. Se recomienda cargar con `mmap` para que el sistema operativo y Metal compartan páginas en memoria unificada.
- Latencia y throughput: decodificación ~74.6 t/s en M5 Max; prefill acelerado con HELIX alcanza ~1941.8 t/s en 2048 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Falcon-H1-7B-Instruct (base) | 7.59B | 262.144 | BF16 (sin cuantizar) | falcon-llm-license | HuggingFace |
| Falcon-H1-7B-FORGE-v2 (este modelo) | 7.59B | 262.144 (recomendado 4096) | FORGE GGUF, media 2.06 bpw | falcon-llm-license | HuggingFace |
| Falcon-H1-3B-Instruct (familia) | no disponible | 262.144 | no disponible | falcon-llm-license | HuggingFace (colección) |

La comparativa principal es con el modelo base sin cuantizar: la versión FORGE ofrece el mismo tamaño de parámetros y contexto, pero reduce el peso de 7.59B a 3.48 GB, priorizando el despliegue en edge. Otras variantes de la familia Falcon-H1 (0.5B, 1.5B, 3B, 34B) están disponibles en la colección oficial, pero sus especificaciones exactas no se detallan en la información manejada.

## Limitaciones y advertencias

- Repetición entre turnos: aunque `repeat_last_n=2048` reduce la repetición al 17.3%, el autor indica que el problema no queda resuelto del todo, pudiendo aparecer reafirmaciones de respuestas anteriores en conversaciones largas.
- Riesgo de alucinación: la cuantización agresiva (2.06 bpw) puede degradar la fidelidad factual. En la versión anterior uniformemente ternaria se observó una pérdida clara de asociaciones de conocimiento; esta versión lo mitiga, pero no lo elimina.
- Solo inglés: el modelo está entrenado únicamente en inglés; no se espera un rendimiento fiable en otros idiomas.
- Contexto limitado en la práctica: se recomienda no exceder 4096 tokens en dispositivos Apple, porque la memoria disponible es insuficiente para longitudes mayores.
- Licencia no estándar: la licencia `falcon-llm-license` no es una licencia abierta común; requiere aceptar los términos de Falcon LLM y puede imponer restricciones a su uso comercial.
- No se documentan capacidades de tool calling, visión, audio ni otras extensiones multimodales; no deben asumirse.
- Los parámetros de muestreo recomendados son obligatorios para evitar degradaciones graves de calidad; en particular, `repeat_last_n` debe fijarse en 2048, y no debe aumentarse `repeat_penalty` por encima de 1.15.

## Enlaces

- HuggingFace: https://huggingface.co/sgsystems/Falcon-H1-7B-FORGE-v2
- Modelo base: https://huggingface.co/tiiuae/Falcon-H1-7B-Instruct
- Colección Falcon-H1: https://huggingface.co/collections/tiiuae/falcon-h1
- Documentación de Transformers para Falcon-H1: https://huggingface.co/docs/transformers/main/en/model_doc/falcon_h1
- Licencia Falcon LLM: https://falconllm.tii.ae/falcon-terms-and-conditions.html
