# kalia-lm/kalia-v031

## Resumen

Kalia v0.3.1 es un modelo de lenguaje de tipo decoder-only publicado por kalia-lm, un proyecto de investigación centrado en modelos pequeños entrenados desde cero. Se trata de un modelo base de 57.856.256 parámetros (según la model card) que se distribuye como una fusión en el espacio de pesos de los checkpoints v0.2.0 y v0.3.0, con una ponderación de 0,30 sobre v0.2.0 y 0,70 sobre v0.3.0 aplicada tensor a tensor. No incorpora entrenamiento nuevo, destilación ni datos adicionales: es un "model soup" de dos checkpoints que yacen sobre una trayectoria de entrenamiento conectada.

El modelo resuelve un problema muy concreto de ingeniería: recuperar, sin coste de cómputo, parte de la regresión provocada por una mala selección de checkpoint en v0.3.0. El mejor checkpoint intermedio de v0.3.0 (paso 6.500, val 2,7255) fue sobrescrito, y el checkpoint final (paso 6.770, val 2,7743) era peor. La fusión alcanza un val de 2,7579 sin reentrenar, lo que supone una mejora de 0,0164 nats frente a v0.3.0 y de 0,0669 nats frente a v0.2.0.

Es relevante ahora como ejemplo reproducible de técnicas de weight merging y como modelo base minúsculo para experimentación, docencia y prototipado en entornos con recursos muy limitados. No es un modelo de frontera ni compite en capacidades generales: su contexto es de 1.024 tokens, solo soporta inglés y no tiene ajuste por instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only pre-norm: RMSNorm, SwiGLU, RoPE, QK-Norm, logit soft-cap (τ = 30), embeddings atados, sin biases |
| Parametros totales | 57.856.256 (según model card); 83.587.840 según el recuento de safetensors del repositorio |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (código y pesos) |
| Formato de pesos | safetensors; también se menciona `best_merged.pt` (PyTorch) en la procedencia |

Otros datos técnicos: 10 capas, 8 cabezas de atención, dimensión de modelo 512, vocabulario de 50.257 tokens con BPE de GPT-2. Optimizador de la ejecución base: Muon (Newton-Schulz) sobre matrices ocultas y AdamW sobre embeddings, cabeza y normas. Tamaño del repositorio: 0,3 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only pre-norm convencional con varias elecciones de diseño modernas para modelos pequeños: normalización RMSNorm, activación SwiGLU, embeddings posicionales rotatorios (RoPE), QK-Norm para estabilizar la atención, logit soft-cap con τ = 30 y atado de embeddings de entrada y salida. No hay biases en las capas lineales. Con 10 capas, 8 cabezas y dimensión 512, el modelo se sitúa en la gama de los modelos "tiny" orientados a experimentación.

El checkpoint base es v0.3.0, entrenado durante 2.000 pasos de actualización sobre el corpus de 2,4B tokens de v0.2.0, sin replay, con recalentamiento coseno y semilla 1401. En total, el modelo ha visto 3,55B tokens (1,42 épocas). La composición del corpus es: 60% FineWeb-Edu deduplicado (smollm-corpus), 20% TinyStories, 15% Cosmopedia v2 y 5% código Python de codeparrot-clean con filtro permisivo por archivo. No se documenta RLHF, DPO ni ajuste por instrucciones: es un modelo base puro.

La innovación destacable de esta release no está en la arquitectura, sino en el proceso de publicación: la fusión `theta_v031 = 0.30 * theta_v020 + 0.70 * theta_v030` aplicada tensor a tensor, tomando contador de pasos, contador de tokens, estado del optimizador y configuración de v0.3.0. El autor verifica la procedencia con hashes SHA-256 de los checkpoints fuente y del checkpoint fusionado, y re-puntúa el `model.safetensors` exportado bajo el mismo protocolo de evaluación determinista (100 lotes × 8 secuencias × 1.024 tokens = 819.200 tokens, semilla 1234).

## Capacidades

- Generación de texto autoregresiva en inglés, con contexto máximo de 1.024 tokens.
- Modelado de lenguaje base: continuación de texto, completado de historias y generación de texto descriptivo, apoyado en la mezcla de TinyStories y FineWeb-Edu.
- Generación de código Python a pequeña escala, gracias al 5% de codeparrot-clean en el corpus de entrenamiento.
- Razonamiento de sentido común básico, medido en tareas zero-shot como ARC-Easy, HellaSwag, PIQA, WinoGrande y LAMBADA.
- No soporta tool calling ni function calling: no hay ajuste por instrucciones ni plantilla de chat documentada.
- No soporta agentes ni razonamiento multi-paso: es un modelo base sin capacidades agénticas.
- No tiene modo "thinking", visión, audio ni otras modalidades.
- Multilingüismo: únicamente inglés; otros idiomas quedan fuera del alcance declarado por el autor.

## Casos de uso

- Experimentación académica con técnicas de weight merging: el modelo sirve como caso reproducible y verificado con hashes para estudiar model soups y recuperación de checkpoints sin reentrenamiento, comparando las métricas publicadas de v0.2.0, v0.3.0 y v0.3.1.
- Docencia de entrenamiento de LLM desde cero: con 58M parámetros y 1.024 tokens de contexto, se puede entrenar, evaluar y fusionar en hardware de consumo, lo que permite ilustrar todo el ciclo (datos, Muon/AdamW, QK-Norm, evaluación con lm-evaluation-harness).
- Generación de cuentos e historias cortas en inglés: el 20% de TinyStories en el corpus hace que el modelo sea adecuado para completar prompts narrativos simples de menos de 1.024 tokens, como demuestra el ejemplo de uso de la model card ("Once upon a time").
- Autocompletado y continuación de texto en inglés para prototipos de editores o herramientas de escritura, siempre que las secuencias no superen el contexto de 1.024 tokens.
- Generación de fragmentos de código Python en tareas de autocompletado muy acotadas, aprovechando el subconjunto de codeparrot-clean; no es adecuado para generación de código en producción.
- Investigación sobre olvido catastrófico y retención: la sonda CL-0 publicada (pérdida 2,740949 en v0.3.1 frente a 2,756648 en v0.3.0) ofrece una referencia para estudiar si las fusiones de pesos degradan la retención.
- Evaluación comparativa de modelos pequeños: sirve como línea base de ~58M parámetros en pruebas con lm-evaluation-harness 0.4.9 en tareas zero-shot de sentido común.

## Benchmarks y rendimiento

Pérdida determinista en held-out (100 lotes × 8 secuencias × 1.024 tokens = 819.200 tokens, semilla 1234):

| Modelo | Val loss | bpB |
|---|---:|---:|
| v0.2.0 | 2,8248 | 0,9244 |
| v0.3.0 | 2,7743 | 0,9070 |
| **v0.3.1** | **2,7579** | **0,9016** |

Precisión zero-shot con lm-evaluation-harness 0.4.9, 0-shot, 2.000 muestras por tarea (error estándar aproximado de 1,0–1,4 puntos porcentuales):

| Tarea | v0.2.0 | v0.3.0 | **v0.3.1** | Δ vs v0.2.0 | Δ vs v0.3.0 | z vs v0.3.0 |
|---|---:|---:|---:|---:|---:|---:|
| ARC-Easy | 46,40 | 47,55 | **48,00** | +1,60 | +0,45 | +0,28 |
| HellaSwag | 35,60 | 37,20 | **37,65** | +2,05 | +0,45 | +0,29 |
| LAMBADA | 23,90 | 26,30 | **27,00** | +3,10 | +0,70 | +0,50 |
| PIQA | 61,37 | 61,59 | **61,97** | +0,60 | +0,38 | +0,24 |
| WinoGrande | 50,75 | 51,30 | **52,25** | +1,50 | +0,95 | +0,48 |

Sonda de retención CL-0:

| Modelo | Pérdida de la sonda |
|---|---:|
| v0.2.0 | 2,798875 |
| v0.3.0 | 2,756648 |
| **v0.3.1** | **2,740949** |

Las cinco tareas mejoran, pero ninguna ganancia respecto a v0.3.0 alcanza 2σ (los valores z van de 0,24 a 0,50). El autor reconoce que las mejoras en benchmarks son modestas y que las partes sólidas son la pérdida de validación y la sonda CL-0.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 57,9M parámetros en precisión completa (fp32, ~232 MB) o en fp16/bf16 (~116 MB), el modelo cabe holgadamente en cualquier GPU de consumo; el repositorio ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es más que suficiente; también es viable en CPU para inferencia interactiva.
- Cabe en GPU consumer: sí, en todas las gamas actuales, e incluso en hardware integrado.
- Opciones de despliegue: la model card documenta uso con `transformers` (`AutoModelForCausalLM`, `AutoTokenizer`, `trust_remote_code=True`) y PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ni se publican pesos GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada para establecer una comparación cuantitativa fiable. Como referencia cualitativa de la misma categoría (modelos base pequeños entrenados desde cero o con corpus abiertos):

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kalia v0.3.1 | 57,9M (model card) | 1.024 | Apache-2.0 | HuggingFace (kalia-lm/kalia-v031) |
| Kalia v0.3.0 | No disponible | 1.024 | Apache-2.0 | HuggingFace (kalia-lm/kalia-v030) |
| Kalia v0.2.0 | No disponible | 1.024 | Apache-2.0 | HuggingFace (kalia-lm/kalia-v020) |
| Kalia v0.1.2 | No disponible | No disponible | Apache-2.0 | HuggingFace (kalia-lm/kalia-v012) |

La comparación con modelos de otros proyectos (por ejemplo, la familia SmolLM, cuyos corpus se usan en el entrenamiento) no está disponible en la información proporcionada, por lo que no se presentan cifras comparativas.

## Limitaciones y advertencias

- Es una fusión en el espacio de pesos, no un resultado arquitectónico: no introduce ningún mecanismo nuevo.
- Las ganancias en benchmarks de 2.000 muestras son modestas y ninguna alcanza 2σ; el autor lo declara explícitamente.
- Con 57,9M parámetros y 1.024 tokens de contexto, es un modelo muy pequeño y no debe presentarse como un LLM de frontera.
- No tiene ajuste por instrucciones: es un modelo base, no un asistente conversacional.
- Solo inglés; el autor declara fuera de alcance otros idiomas y dominios distintos de la mezcla web/historias/código.
- Riesgo de alucinación: no se documenta ninguna mitigación, y al ser un modelo base sin alineación, la generación puede ser incoherente o factualmente incorrecta.
- Sesgos: no se documenta ningún análisis de sesgos en la información proporcionada; al entrenarse sobre FineWeb-Edu, TinyStories, Cosmopedia y codeparrot-clean, hereda los sesgos de esas fuentes.
- La fusión no corrige la causa raíz del problema: la solución real es guardar el mejor checkpoint durante el entrenamiento; la fusión es una recuperación de coste cero.
- Discrepancia de parámetros: la model card declara 57.856.256 parámetros, mientras que el recuento de safetensors del repositorio indica 83.587.840; conviene verificar el artefacto antes de usarlo en producción.
- Licencia Apache-2.0 para código y pesos, pero las licencias de los datasets subyacentes (ODC-By-1.0, CDLA-Sharing-1.0, Apache-2.0 y mixta con filtro permisivo por archivo para Python) deben revisarse para usos derivados.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y la fecha de creación indicada (2026-11-01) debe tratarse con cautela.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kalia-lm/kalia-v031
- Release anterior v0.1.2: https://huggingface.co/kalia-lm/kalia-v012
- Release anterior v0.2.0: https://huggingface.co/kalia-lm/kalia-v020
- Dataset FineWeb-Edu dedup (smollm-corpus): https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset Cosmopedia v2: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Dataset codeparrot-clean: https://huggingface.co/datasets/codeparrot/codeparrot-clean
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
