# lekhamenon28/legal-slm-125m-2ep

## Resumen

Legal SLM 125M es un modelo de lenguaje causal de 125 millones de parámetros, entrenado desde pesos aleatorios por lekhamenon28 sobre un corpus en inglés de textos legales, financieros y educativos. Se trata de un modelo base de completación de pasajes, no de un chatbot instruido, y su objetivo es generar texto que continúe un prefijo dado con un registro jurídico o financiero coherente.

El modelo sigue una arquitectura decoder-only estilo Llama con 12 capas, hidden size de 768, atención de 12 cabezas y ventana de contexto de 1.024 tokens. El entrenamiento se realizó en dos épocas sobre un total de 4.007 millones de tokens, con un coste de GPU de apenas 23 dólares, lo que lo convierte en un ejemplo representativo de entrenamiento de modelos pequeños desde cero con recursos limitados.

Su relevancia actual reside en que demuestra que es posible obtener un modelo especializado en dominios legales y financieros con un presupuesto mínimo, y sirve como base para experimentos posteriores de fine-tuning, como la variante SFT disponible en el ecosistema del proyecto. No debe utilizarse como asesor legal ni financiero, sino como herramienta de investigación y generación de texto con fines académicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-style decoder-only transformer (12 capas, hidden 768, 12 cabezas de atencion, 12 cabezas KV, SwiGLU 3072, RoPE theta 10000, RMSNorm) |
| Parametros totales | 125.848.320 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | FP32, BF16 (entrenamiento), int8 ONNX (exportacion disponible en jonam-ai/legal-slm-125m-sft-onnx) |
| Idiomas soportados | Ingles (en) |
| Licencia | other (verificar terminos de los datasets upstream antes de uso comercial) |
| Formato de pesos | safetensors, ONNX (int8) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con arquitectura Llama: pre-normalizacion RMSNorm, atencion con RoPE (theta 10.000), y feed-forward SwiGLU con dimension intermedia de 3.072. Los embeddings de entrada y salida estan atados (tied), y el vocabulario es un tokenizador personalizado de 16.384 tokens entrenado sobre el corpus de entrenamiento.

El entrenamiento se realizo en dos epocas sobre un corpus empaquetado de 2.003.556.352 tokens de entrenamiento y 20.230.144 tokens de validacion, con una ventana de contexto fija de 1.024 tokens. La optimizacion uso AdamW con betas (0.9, 0.95), weight decay 0.1, learning rate pico de 6e-4 con decaimiento coseno y warm-up de 200M tokens, y gradiente clipping en 1.0. El hardware fue un nodo unico con 8 GPUs NVIDIA H100, precision bfloat16, y un batch global efectivo de 524.288 tokens por paso. La perdida final de validacion fue 2.2201 y la perplejidad 9.2086.

El dataset combina tres fuentes: `HFforLegal/case-law` (jurisprudencia), `PleIAs/SEC` (documentos financieros de la SEC) y `HuggingFaceFW/fineweb-edu` (sample-10BT, contenido educativo). El pipeline incluye limpieza de documentos, deduplicacion exacta y aproximada, decontaminacion legal, empaquetado con delimitador EOS y un split determinista 99:1. No se aplicaron tecnicas de RLHF ni DPO; es un modelo base sin ajuste por instrucciones.

## Capacidades

- Generacion de texto causal: completa pasajes legales y financieros con un registro coherente.
- Soporte de continuacion de prefijos (passage completion), no de instrucciones.
- Capacidad de generar texto en ingles con vocabulario legal y financiero especifico.
- No soporta tool calling ni function calling.
- No soporta agentes ni multi-step reasoning.
- No tiene capacidades de vision ni audio.
- No tiene modo de pensamiento explicito (no es un modelo de razonamiento).

## Casos de uso

- **Generacion de borradores de clausulas contractuales**: un desarrollador puede alimentar el modelo con un prefijo como "The court held that the contractual provision" y obtener continuaciones coherentes que sirvan de punto de partida para revisar y editar manualmente.
- **Aumento de datos para entrenamiento de modelos legales**: el modelo puede generar textos sinteticos que complementen datasets de entrenamiento de modelos mas grandes, previa revision de calidad.
- **Estudio de comportamiento de modelos pequenos en dominios especializados**: los investigadores pueden analizar como un modelo de 125M aprende registros legales y financieros con un presupuesto minimo de entrenamiento.
- **Demostraciones educativas**: el proyecto incluye una demo en navegador (transformers.js) que permite a estudiantes y desarrolladores experimentar con un modelo legal sin infraestructura propia.
- **Evaluacion de tecnicas de cuantizacion**: la version ONNX int8 (~133MB) permite probar la perdida de calidad (~38% de perplejidad) frente a fp32, util para estudiar el equilibrio tamano-rendimiento.
- **Prototipado de pipelines de generacion de texto**: dado su tamano reducido, puede integrarse en pipelines de CI/CD para tests de generacion de texto sin requerir GPUs de gran tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento reportado es la perplejidad de validacion de 9.2086, calculada sobre 20.210.388 tokens predichos, y la evolucion de la perplejidad durante el entrenamiento:

| Paso | Perdida de validacion | Perplejidad |
|---:|---:|---:|
| 1.000 | 2.7723 | 15.9950 |
| 2.000 | 2.5223 | 12.4573 |
| 3.000 | 2.4149 | 11.1890 |
| 4.000 | 2.3437 | 10.4192 |
| 5.000 | 2.2922 | 9.8963 |
| 6.000 | 2.2537 | 9.5232 |
| 7.000 | 2.2288 | 9.2887 |
| 7.643 | 2.2201 | 9.2086 |

## Requisitos de hardware

- **VRAM estimada**: el modelo tiene 125,8 millones de parametros, por lo que en fp32 ocupa ~0.5 GB de memoria. En bfloat16, ~0.25 GB; en int8, ~0.13 GB. La inferencia cabe en cualquier GPU con al menos 1 GB de VRAM, incluso en CPUs modernas.
- **GPU recomendadas**: cualquier GPU consumer (RTX 3060, RTX 4090, etc.) es suficiente. El entrenamiento original uso 8× H100, pero la inferencia no requiere hardware especializado.
- **Opciones de despliegue**: compatible con transformers (Python), llama.cpp (si se convierte a GGUF), Ollama, vLLM, TGI, y la demo en navegador mediante transformers.js (ONNX).
- **Latencia**: no se reportan datos de latencia. Al ser un modelo pequeno, se espera una generacion de decenas de tokens por segundo en GPU consumer.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| legal-slm-125m-2ep | 125,8M | 1.024 | other (Apache, verificar) | Modelo base entrenado desde cero en corpus legal/financiero |
| GPT-2 small (124M) | 124M | 1.024 | MIT | Modelo generico de texto, no especializado |
| TinyLlama (1.1B) | 1.100M | 2.048 | Apache 2.0 | Modelo general de 1.1B, no especializado en legal |
| legal-slm-125m-sft | 125,8M | 1.024 | other | Variante SFT del mismo modelo, ajustada en 5.846 pares Q&A |

La comparacion directa con GPT-2 small o TinyLlama no es significativa porque el legal-slm-125m esta entrenado desde cero con un corpus especifico, mientras que GPT-2 y TinyLlama son modelos generales. El modelo SFT es la version ajustada del mismo proyecto y ofrece respuestas a preguntas legales, mientras que este modelo base solo completa pasajes.

## Limitaciones y advertencias

- **No es un modelo de instrucciones**: no se debe usar como chatbot ni esperar respuestas a preguntas directas. Solo completa pasajes con un prefijo.
- **Alucinacion frecuente**: puede inventar casos, leyes, citas, numeros y conclusiones legales. No es fiable para hechos juridicos.
- **No debe usarse como asesor legal, financiero, de cumplimiento o de inversiones**.
- **Sesgos y datos desactualizados**: el dataset puede contener errores, material desactualizado, sesgos o informacion personal presente en las fuentes originales.
- **Entrenamiento corto**: el experimento de dos epocas es mas corto que el recipe de referencia de cinco epocas del proyecto, por lo que el modelo puede estar subentrenado.
- **Licencia**: la licencia es "other" y el repositorio no otorga licencia sobre los datos upstream; es necesario revisar los terminos de HFforLegal/case-law, PleIAs/SEC y fineweb-edu antes de uso comercial o regulado.
- **Idioma**: solo soporta ingles. No hay soporte para otros idiomas.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/lekhamenon28/legal-slm-125m-2ep
- Repositorio GitHub (demo en navegador): https://github.com/mcrao/legal-slm-125M
- Demo interactiva del modelo base: https://slm-125m-site.vercel.app/
- Demo interactiva del modelo SFT: https://legal-slm-125.vercel.app/
- Modelo SFT en HuggingFace: https://huggingface.co/jonam-ai/legal-slm-125m-sft
- Export ONNX int8: https://huggingface.co/jonam-ai/legal-slm-125m-sft-onnx
