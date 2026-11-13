# ravit21/taby-mm

## Resumen

taby-mm es un modelo de lenguaje de 124,4 millones de parámetros desarrollado por el usuario ravit21 (RaviTriv) y publicado en Hugging Face. Se trata de una reproducción desde cero de la arquitectura GPT-2 de OpenAI, entrenada sobre 14,94 mil millones de tokens del corpus educativo FineWeb-Edu. Su relevancia no reside en una capacidad puntera, sino en el carácter didáctico y de ingeniería del proyecto: todo el entrenamiento se ejecutó con micrograd, una biblioteca de deep learning escrita en C++ y CUDA específicamente para este trabajo, y el modelo resultante supera al GPT-2 124M original de OpenAI en la tarea HellaSwag.

El modelo es un transformer decoder-only puro, con 12 capas, 12 cabezas de atención, anchura de 768 y una longitud de contexto de 1.024 tokens. Utiliza el tokenizador BPE de GPT-2 sin modificaciones (50.257 tokens) y pesos en safetensors de precisión float32. Es un modelo base: continúa texto, no sigue instrucciones y no ha pasado por ningún proceso de alineación o ajuste de seguridad.

Al estar liberado bajo licencia MIT y ocupar apenas 0,5 GB en el repositorio, constituye una referencia útil para experimentación educativa, validación de pipelines de entrenamiento propios y comparación de implementaciones alternativas frente a la pila estándar de PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), `GPT2LMHeadModel` |
| Parametros totales | 124.439.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2 estándar: 12 capas transformer decoder-only, 12 cabezas de atención, dimensión de modelo 768, vocabulario de 50.257 tokens con tokenizador BPE de OpenAI, embeddings posicionales aprendidos y cabeza de salida atada a los embeddings de tokens. La activación es GELU con aproximación tanh (`gelu_new`). La inicialización sigue el esquema de GPT-2: normal con desviación 0,02 y proyecciones residuales escaladas por 1/sqrt(2 × capas). No se usa dropout.

El entrenamiento se realizó sobre 14,94 mil millones de tokens de FineWeb-Edu (shards de tokens GPT-2 de `karpathy/fineweb-edu-100B-gpt2-token-shards`, shards 1 a 150 para entrenamiento y shard 0 para validación, cada uno verificado contra su SHA-256 publicado), en una sola pasada sin repetición de datos. Se ejecutaron 114.000 pasos con un batch efectivo de 131.072 tokens por paso (16 secuencias × 1.024 tokens × 8 GPUs, sin acumulación de gradientes). El optimizador fue AdamW (beta1 0,9, beta2 0,99, weight decay 0,1, recorte de gradiente a 1,0), con warmup lineal de 2.000 pasos hasta 6e-4 y decaimiento coseno hasta 6e-5, cómputo en bf16 y semilla 1337. El entrenamiento se llevó a cabo en 8× NVIDIA A100 40 GB SXM4 en Lambda Cloud, con un tiempo de 3 h 38 min a aproximadamente 1,18 millones de tokens por segundo y un coste de unos 70 dólares.

La innovación técnica destacable es que el entrenamiento se ejecutó íntegramente en micrograd, una biblioteca propia en C++ y CUDA, y posteriormente se exportó al formato de `transformers` mediante `eval/export_hf.py`, concatenando query, key y value en `c_attn` y recortando el vocabulario rellenado durante el entrenamiento (50.304 filas) a las 50.257 originales. Antes de la evaluación se verificó que las log-probabilidades del modelo convertido coincidían con las del scorer propio de micrograd. La pérdida de validación sobre el shard reservado de FineWeb-Edu descendió de 10,968 en el paso 0 a 2,992 al final del entrenamiento.

## Capacidades

- Generación de texto autoregresiva: continuación de texto libre en inglés a partir de un prefijo.
- Modelo base sin ajuste de instrucciones: no responde a preguntas ni sigue directivas; está diseñado para completar texto.
- Razonamiento y conocimiento factual limitados, propios de un modelo de 124M de parámetros.
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- Sin capacidades de visión, audio ni modo de pensamiento (thinking mode).
- Capacidad multilingüe prácticamente inexistente: entrenado únicamente con texto educativo en inglés.
- Sin ajuste de seguridad ni RLHF/DPO.

## Casos de uso

- Experimentación educativa y reproducción de entrenamientos: sirve como referencia para validar pipelines propios de preentrenamiento, ya que documenta hiperparámetros, hardware, coste y verificación de datos con SHA-256.
- Comparación de implementaciones de bajo nivel: permite contrastar una implementación en C++/CUDA (micrograd) frente a la pila estándar de PyTorch, verificando la equivalencia de log-probabilidades tras la exportación.
- Generación de texto de relleno y demostraciones: adecuado para prototipos de interfaces de generación de texto donde no se requiere precisión factual, gracias a su fluidez en inglés y su reducido tamaño (0,5 GB).
- Benchmarking de infraestructura de inferencia: su tamaño de 124M permite medir latencia y throughput en hardware modesto (CPU, Apple MPS, GPUs de consumo) sin cuellos de botella de memoria.
- Fine-tuning ligero con propósitos de investigación: al estar bajo licencia MIT y en formato `transformers` estándar, puede ajustarse en tareas específicas de dominio sobre corpus en inglés con recursos limitados.
- Docencia sobre arquitecturas transformer: la correspondencia exacta con GPT-2 (12 capas, 12 cabezas, 768 de anchura, tokenizador original) facilita explicar atención, embeddings atados y decodificación autoregresiva con un modelo real y pequeño.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card. HellaSwag, conjunto de validación completo (10.042 ejemplos), 0-shot, lm-evaluation-harness 0.4.13, backend `hf`, float32, batch size 1.

| Modelo | acc_norm | acc |
|---|---|---|
| taby-mm | 34,53% ± 0,47 | 30,85% ± 0,46 |
| OpenAI GPT-2 124M | 31,14% ± 0,46 | 28,92% ± 0,45 |

Nota del autor: ambas filas se midieron con la misma versión del harness, tarea y ajustes; taby-mm se evaluó en Apple `mps` y GPT-2 en CPU. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en float32 (124,4M parámetros × 4 bytes), más overhead de activaciones y caché KV para 1.024 tokens.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor reporta evaluación en Apple `mps`. Funciona en A100, H100, RTX 4090 y GPUs de gama media sin problema.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: `transformers` (formato nativo safetensors), text-generation-inference (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`); no se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponible. Como referencia de entrenamiento, el autor reporta 1,18M tokens por segundo en 8× A100 40 GB, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HellaSwag acc_norm | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| taby-mm | 124,4M | 1.024 | 34,53% | MIT | Hugging Face |
| OpenAI GPT-2 124M | 124M | 1.024 | 31,14% | MIT | Hugging Face |
| GPT-2 Medium | 355M | 1.024 | no disponible en la información | MIT | Hugging Face |
| Modelos de 124M instruction-tuned | no disponible | no disponible | no disponible | variable | no disponible |

La comparación directa disponible es con GPT-2 124M, medido con el mismo harness y ajustes: taby-mm obtiene 3,39 puntos más en `acc_norm` y 1,93 puntos más en `acc`. Para el resto de alternativas no se dispone de datos de rendimiento en la información proporcionada.

## Limitaciones y advertencias

- Modelo base de 124M: fluido pero frecuentemente incorrecto a nivel factual; no sigue instrucciones.
- Entrenado sobre texto educativo web en inglés: refleja los sesgos y errores de ese corpus y no cubre otros idiomas.
- Sin ajuste de seguridad: no debe usarse en contextos donde importen salidas dañinas o falsas.
- Contexto limitado a 1.024 tokens, insuficiente para conversaciones largas o documentos extensos.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso.
- Licencia MIT para los pesos: permite uso comercial, pero el dato de entrenamiento (FineWeb-Edu) está bajo ODC-By 1.0 y el tokenizador es el de OpenAI GPT-2, cuyas condiciones deben respetarse por separado.
- Los resultados de benchmarks son declarados por el autor y no están verificados (`verified: false` en el model-index), además de haberse medido en hardware distinto (`mps` frente a CPU) para cada modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ravit21/taby-mm
- Repositorio micrograd (C++/CUDA): https://github.com/RaviTriv/micrograd
- Script de exportación a transformers: https://github.com/RaviTriv/micrograd/blob/main/eval/export_hf.py
- Dataset de tokens de entrenamiento: https://huggingface.co/datasets/karpathy/fineweb-edu-100B-gpt2-token-shards
- Dataset original FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de evaluación HellaSwag: https://huggingface.co/datasets/Rowan/hellaswag
