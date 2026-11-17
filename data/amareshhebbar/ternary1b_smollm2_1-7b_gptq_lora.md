# AmareshHebbar/Ternary1B_SmolLM2_1.7B_GPTQ_LORA

## Resumen

Ternary1B GPTQ_LORA es una versión comprimida a 2 bits del modelo SmolLM2-1.7B de Hugging Face, desarrollada por AmareshHebbar dentro de la colección Ternary1B. El modelo aplica cuantización GPTQ de 2 bits a todas las capas de atención y feed-forward, manteniendo embeddings y capas de normalización en 16 bits, y añade un adaptador LoRA entrenado mediante destilación de conocimiento para reparar el daño introducido por el redondeo extremo. El resultado es un modelo de 1.711.376.384 parámetros que ocupa 810 MB empaquetado (4 veces menos que el original en bf16) y que puede ejecutarse en CPUs económicas y dispositivos móviles.

La relevancia de este modelo radica en su enfoque metodológico: demuestra que el redondeo directo a 2 bits o ternario destruye el modelo (perplejidad de 942.140 y 17.663.863 respectivamente en WikiText2), mientras que la combinación de GPTQ con un adaptador LoRA de reparación recupera parte de la calidad perdida (perplejidad de 21,72 frente a los 8,12 del original). Es un experimento de investigación sobre compresión extrema más que un modelo listo para producción, con solo 0 descargas y 0 likes en el momento de redactar esta ficha.

El modelo se distribuye en dos formatos: los pesos expandidos a bf16 safetensors en la raíz del repositorio (para cargar directamente con transformers) y la forma realmente comprimida en `packed/`, que requiere el script `tq_runtime.py` para reconstruir el modelo operativo. Está licenciado bajo Apache 2.0 y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de SmolLM2-1.7B) con cuantización GPTQ de 2 bits y adaptador LoRA |
| Parametros totales | 1.711.376.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento del adaptador usa secuencias de 1024 tokens) |
| Tipos de cuantizacion | 2 bits GPTQ (group_size 64) + LoRA de reparación; embeddings y normas en 16 bits; formato empaquetado int2 gptq |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16 expandido en raíz) y safetensors empaquetado en `packed/` (quant.safetensors, rest.safetensors, lora.safetensors, quant_config.json) |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-1.7B, un transformer decoder-only, y le aplica cuantización GPTQ de 2 bits con un tamaño de grupo de 64 a todas las capas de atención y feed-forward. Las capas de embedding y normalización permanecen en 16 bits, siguiendo el esquema de BitNet. Sobre el modelo cuantizado congelado se entrena un adaptador LoRA (rango 64, alpha 128) mediante destilación de conocimiento, con el objetivo de copiar las predicciones del modelo original y compensar el error de redondeo. El entrenamiento usa el dataset AmareshHebbar/Ternary1B_Data_SmolLM2_1.7B, con secuencias de 1024 tokens, micro-batch de 2, acumulación de gradiente de 16, learning rate de 0,0002, 300 pasos y 20 pasos de warmup, con peso de destilación de 1,0 y temperatura de 1,0.

La innovación principal no es arquitectónica sino metodológica: el autor demuestra empíricamente que el redondeo directo a 2 bits o ternario colapsa el modelo, y que la combinación de GPTQ con un adaptador de reparación entrenado por destilación recupera una fracción significativa del rendimiento. El modelo resultante tiene 2,5 bits por peso cuantizado, 1.610.612.736 parámetros cuantizados y un tamaño empaquetado de 849.644.472 bytes (810,28 MB), lo que supone una compresión de 4,03 veces respecto a los 3.422.777.848 bytes en bf16.

## Capacidades

- Generación de texto en inglés, con calidad degradada respecto al modelo original (perplejidad de 21,72 frente a 8,12 en WikiText2).
- Razonamiento básico y respuesta a preguntas de opción múltiple (hellaswag 46,3; arc_easy 53,3; piqa 64,4; mmlu 25,8).
- Generación de código limitada: los ejemplos de la model card muestran completaciones de funciones Python incoherentes (la función `fibonacci` genera líneas repetidas sin lógica correcta).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: solo inglés.
- No dispone de modo thinking, visión ni audio.
- Inferencia en CPU y dispositivos de bajos recursos gracias al tamaño reducido.

## Casos de uso

- Investigación en compresión extrema de modelos: sirve como referencia para estudiar el impacto del redondeo a 2 bits y la eficacia de los adaptadores LoRA de reparación por destilación, comparando directamente con las filas de redondeo simple incluidas en la model card.
- Despliegue en dispositivos móviles y CPUs de gama baja: con 810 MB empaquetados y 2,5 bits por peso, el modelo cabe en memoria de teléfonos y placas como Raspberry Pi, aunque con calidad de generación limitada.
- Prototipado rápido de pipelines de generación de texto: la carga directa en bf16 con transformers permite integrar el modelo en scripts de prueba sin infraestructura GPU, aceptando la pérdida de calidad.
- Educación y demostraciones sobre cuantización: el repositorio incluye el script `tq_runtime.py` y los ficheros empaquetados, lo que facilita explicar el proceso de desempaquetado y reconstrucción de un modelo cuantizado.
- Benchmarking de métodos de cuantización: al formar parte de una colección de seis modelos evaluados con las mismas pruebas, permite comparar GPTQ+LoRA frente a otras estrategias de compresión extrema.
- Generación de texto de baja exigencia en entornos con restricciones de memoria: completaciones cortas y respuestas simples donde la coherencia perfecta no es crítica, como etiquetado aproximado o generación de borradores.

## Benchmarks y rendimiento

Resultados de la model card: perplejidad en WikiText2 test (menor es mejor) y precisión zero-shot de lm-evaluation-harness limitada a 1000 ejemplos por tarea.

| Modelo | Bits por peso | Tamano (MB) | Reduccion | Perplejidad WikiText2 | hellaswag | arc_easy | piqa | mmlu | Media |
|---|---|---|---|---|---|---|---|---|---|
| SmolLM2 1.7B (bf16 original) | 16,00 | 3264 | 1,0x | 8,12 | 60,8 | 73,3 | 77,8 | 48,8 | 65,2 |
| SmolLM2 1.7B (redondeo 2 bits) | 2,50 | 672 | 4,9x | 942140,01 | 27,7 | 27,5 | 49,3 | 24,3 | 32,2 |
| SmolLM2 1.7B (redondeo ternario) | 1,60 | 499 | 6,5x | 17663863,91 | 26,4 | 26,4 | 50,3 | 24,0 | 31,8 |
| Ternary1B GPTQ | 2,50 | 672 | 4,9x | 2538,19 | 30,7 | 26,9 | 52,9 | 24,3 | 33,7 |
| Ternary1B GPTQ_LORA | 2,50 | 810 | 4,0x | 21,72 | 46,3 | 53,3 | 64,4 | 25,8 | 47,4 |

El modelo GPTQ_LORA mejora sustancialmente sobre el GPTQ sin LoRA (perplejidad de 21,72 frente a 2538,19) y sobre los redondeos simples, pero queda lejos del original en bf16 (media de 47,4 frente a 65,2). La velocidad en CPU se midió con llama.cpp, pero solo el modelo ternario se mapea exactamente a los formatos ternarios de llama.cpp, por lo que los modelos de 2 bits no se cronometraron en CPU.

## Requisitos de hardware

- VRAM estimada para inferencia: el formato empaquetado ocupa 810 MB; expandido a bf16 en memoria requiere aproximadamente 3,4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para el formato bf16; para el formato empaquetado, suficiente con GPUs de gama baja o incluso CPU.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060 o superiores; también en CPUs y dispositivos móviles.
- Opciones de despliegue: transformers (carga directa en bf16), `tq_runtime.py` para reconstruir desde `packed/`; el tag `text-generation-inference` sugiere compatibilidad con TGI; no se documenta soporte de vLLM, llama.cpp u Ollama para este formato de 2 bits.
- Latencia y throughput: no disponibles para el formato de 2 bits; la model card indica que solo el modelo ternario de la colección se cronometró en CPU con llama.cpp.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText2 | Media benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ternary1B GPTQ_LORA (este) | 1,71B | no disponible | 21,72 | 47,4 | Apache 2.0 | Hugging Face |
| SmolLM2 1.7B (original) | 1,71B | no disponible | 8,12 | 65,2 | Apache 2.0 | Hugging Face |
| Ternary1B GPTQ | 1,71B | no disponible | 2538,19 | 33,7 | Apache 2.0 | Hugging Face (colección Ternary1B) |
| SmolLM2 1.7B (redondeo ternario) | 1,71B | no disponible | 17663863,91 | 31,8 | Apache 2.0 | Hugging Face (colección Ternary1B) |

La comparativa se limita a las variantes incluidas en la model card; no se dispone de datos de otros modelos de 2 bits comparables en la información proporcionada.

## Limitaciones y advertencias

- Calidad degradada de forma significativa: la media de benchmarks cae de 65,2 a 47,4 y la perplejidad se multiplica por 2,7 respecto al original.
- Riesgo alto de alucinación y generación incoherente: los ejemplos de la model card muestran completaciones repetitivas y sin lógica (función `fibonacci` mal generada).
- Solo soporta inglés; no hay capacidades multilingües.
- Longitud de contexto no documentada; el adaptador se entrenó con secuencias de 1024 tokens, lo que limita el contexto efectivo esperado.
- El formato empaquetado requiere el script `tq_runtime.py`; no es cargable directamente con transformers sin expandir a bf16.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso.
- Sin datos de latencia ni throughput para el formato de 2 bits.
- Modelo con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación comunitaria.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo hace desaconsejable su uso en aplicaciones donde la coherencia sea crítica.
- El nombre "Ternary1B" es engañoso: este modelo concreto usa cuantización de 2 bits GPTQ, no ternaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmareshHebbar/Ternary1B_SmolLM2_1.7B_GPTQ_LORA
- Colección Ternary1B: https://huggingface.co/collections/AmareshHebbar/ternary1b-6afb739a59a53e90dbdebd90
- Dataset de entrenamiento: https://huggingface.co/datasets/AmareshHebbar/Ternary1B_Data_SmolLM2_1.7B
- Modelo base SmolLM2-1.7B: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
