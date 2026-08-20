# RedHatAI/SmolLM-135M-Instruct-quantized.w8a16

## Resumen

SmolLM-135M-Instruct-quantized.w8a16 es una versión cuantizada a INT8 del modelo SmolLM-135M-Instruct, desarrollada por Neural Magic (integrada en Red Hat AI) y publicada bajo el espacio RedHatAI en HuggingFace. El modelo base, creado por HuggingFaceTB, es un pequeño modelo de lenguaje de arquitectura Llama con 135 millones de parámetros, afinado para conversación tipo asistente. La cuantización reduce el tamaño en disco y los requisitos de memoria en aproximadamente un 50%, manteniendo un rendimiento prácticamente idéntico al original: el promedio en el benchmark OpenLLM es de 31.98 puntos frente a 31.86 del modelo sin cuantizar, con una recuperación del 100,4%.

Esta versión cuantizada está pensada para despliegue eficiente en producción, especialmente con el backend vLLM, que soporta el formato de pesos comprimidos mediante compressed-tensors. Su licencia Apache-2.0 permite uso comercial sin restricciones, aunque está limitada al idioma inglés. Con 162,8 millones de parámetros totales en safetensors y un tamaño de repositorio de 0,2 GB, es un modelo extremadamente ligero apto para entornos con recursos limitados, como edge devices o prototipos rápidos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder) |
| Parametros totales | 162.826.560 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (máximo usado en evaluación) |
| Tipos de cuantizacion | INT8 (W8A16, simétrica por canal, solo pesos de operadores lineales) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder de tipo Llama con 135 millones de parámetros, afinado por HuggingFaceTB para conversación asistente. La versión cuantizada no modifica la arquitectura: únicamente aplica cuantización de pesos a INT8 mediante el algoritmo GPTQ, implementado en la librería llm-compressor. La cuantización es simétrica por canal, con un factor de amortiguamiento (dampening factor) del 1%, y se calibró con 1.024 secuencias de 2.048 tokens aleatorios. Solo se cuantizaron los pesos de los operadores lineales dentro de los bloques transformer, excluyendo la capa lm_head.

El proceso de entrenamiento del modelo base no se detalla en la información proporcionada, pero al ser una versión afinada de SmolLM, se presume un entrenamiento estándar con datos en inglés y posterior ajuste por instrucciones. La cuantización posterior no requiere reentrenamiento, solo calibración, y el resultado conserva la precisión del modelo original.

## Capacidades

- Generación de texto conversacional: diseñado para chat tipo asistente, responde a instrucciones del usuario en inglés.
- Razonamiento básico y conocimiento general: puntúa 26,80 en MMLU (5-shot), lo que indica un conocimiento limitado pero funcional para un modelo de su tamaño.
- Comprensión de lenguaje natural: alcanza 40,54 en Hellaswag y 52,72 en Winogrande, mostrando razonamiento de sentido común básico.
- Matemáticas elementales: 0,68 en GSM-8K (strict-match), muy bajo, solo resuelve problemas muy simples.
- Veracidad: 39,41 en TruthfulQA, con tendencia a generar información plausible pero incorrecta.
- Sin capacidades multimodales: solo texto.
- No se menciona soporte de tool calling ni function calling en la información disponible.
- Solo inglés: no soporta otros idiomas según la model card.

## Casos de uso

- Chatbots de atención al cliente en entornos con recursos limitados: el modelo puede gestionar conversaciones básicas en inglés en dispositivos edge o servidores de baja capacidad, gracias a su tamaño de 0,2 GB y soporte de vLLM para servir con OpenAI-compatible API.
- Prototipado rápido de aplicaciones de IA conversacional: los equipos pueden desplegar este modelo en minutos para validar flujos de conversación antes de migrar a modelos más grandes.
- Asistentes integrados en aplicaciones móviles o de escritorio: su peso ligero permite ejecutarlo en CPU o GPUs consumer, facilitando la integración en apps locales sin dependencia de servicios cloud.
- Generación de texto en pipelines de CI/CD: para pruebas de integración donde se necesita un modelo pequeño y rápido para validar el pipeline de generación, sin coste de inferencia elevado.
- Educación y experimentación: ideal para enseñar conceptos de cuantización, despliegue con vLLM o evaluación de modelos, por su bajo coste de ejecución y licencia abierta.
- Sistemas de clasificación o extracción de texto en inglés: aunque es un modelo generativo, puede usarse para tareas de clasificación o etiquetado simple mediante prompts, aprovechando su bajo latencia.

## Benchmarks y rendimiento

El modelo se evaluó en el leaderboard OpenLLM (versión 1) con lm-evaluation-harness y vLLM. La tabla siguiente muestra la comparación entre el modelo cuantizado y su versión sin cuantizar:

| Benchmark | SmolLM-135M-Instruct (sin cuantizar) | SmolLM-135M-Instruct-quantized.w8a16 | Recuperación |
|---|---|---|---|
| MMLU (5-shot) | 26,46 | 26,80 | 101,3% |
| ARC Challenge (25-shot) | 31,83 | 31,74 | 99,7% |
| GSM-8K (5-shot, strict-match) | 0,61 | 0,68 | 112,5% |
| Hellaswag (10-shot) | 40,50 | 40,54 | 100,1% |
| Winogrande (5-shot) | 52,41 | 52,72 | 100,6% |
| TruthfulQA (0-shot) | 39,38 | 39,41 | 100,1% |
| **Promedio** | **31,86** | **31,98** | **100,4%** |

La cuantización no solo mantiene el rendimiento, sino que en algunos benchmarks (MMLU, GSM-8K) supera ligeramente al modelo original, probablemente por el efecto de regularización de la cuantización.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa aproximadamente 0,2 GB en disco (pesos INT8), por lo que la VRAM necesaria para inferencia es inferior a 1 GB, incluso con overhead de activaciones.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1650, RTX 3050, etc.). Incluso puede ejecutarse en CPU con razonable velocidad gracias a su tamaño.
- Cabe en consumer GPU: sí, en prácticamente cualquier GPU moderna, incluso integradas.
- Opciones de despliegue: vLLM (recomendado, con soporte OpenAI-compatible), también compatible con text-generation-inference (TGI) y transformers.
- Latencia y throughput: no hay datos publicados, pero por su tamaño se espera latencia de milisegundos en GPU y decenas de milisegundos en CPU.
- Formato de pesos: safetensors con compressed-tensors, por lo que no es directamente compatible con llama.cpp u Ollama sin conversión previa a GGUF.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Idioma |
|---|---|---|---|---|---|
| SmolLM-135M-Instruct (base) | 135M | 4.096 | FP16 | Apache-2.0 | Inglés |
| SmolLM-135M-Instruct-quantized.w8a16 | 135M | 4.096 | INT8 (W8A16) | Apache-2.0 | Inglés |
| SmolLM-135M-Instruct-quantized.w8a8 | 135M | 4.096 | INT8 (W8A8) | Apache-2.0 | Inglés |
| SmolLM2-135M-Instruct (GGUF Q8_0) | 135M | 4.096 | GGUF Q8_0 | Apache-2.0 | Inglés |

La comparativa con modelos de tamaño similar (como TinyLlama-1.1B o phi-2) no está disponible en la información proporcionada, pero los modelos SmolLM se posicionan como opciones ultra-ligeras para edge computing.

## Limitaciones y advertencias

- Idioma limitado a inglés: la model card indica explícitamente que el uso fuera del inglés está fuera de alcance.
- Conocimiento limitado: con 135M parámetros, el modelo tiene un conocimiento general muy reducido y no puede competir con modelos de 1B+ en tareas complejas.
- Alto riesgo de alucinación: con solo 39,41 en TruthfulQA, el modelo genera respuestas falsas con frecuencia, especialmente en temas factuales.
- Capacidades matemáticas y de razonamiento muy débiles: GSM-8K de 0,68 indica que no es fiable para tareas que requieran cálculo o lógica avanzada.
- Sin soporte de tool calling ni agentes: no puede interactuar con herramientas externas ni realizar razonamiento multi-paso.
- Sin soporte multimodal: solo texto, no procesa imágenes ni audio.
- La cuantización puede introducir ligeras pérdidas de precisión en algunos casos, aunque los benchmarks muestran una recuperación superior al 100%.
- No se recomienda para uso en producción sin evaluación previa en el dominio específico de aplicación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RedHatAI/SmolLM-135M-Instruct-quantized.w8a16
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-135M-Instruct
- Variante w8a8: https://huggingface.co/RedHatAI/SmolLM-135M-Instruct-quantized.w8a8
- Librería llm-compressor: https://github.com/vllm-project/llm-compressor
- Documentación de vLLM: https://docs.vllm.ai/en/latest/
- Paper de GPTQ: https://arxiv.org/abs/2210.17323
- Leaderboard OpenLLM: https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard
