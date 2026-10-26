# evtefeev/codeparrot-ds

## Resumen

`evtefeev/codeparrot-ds` es un ajuste fino (fine-tuning) del modelo GPT-2 de OpenAI, publicado por el usuario `evtefeev` en HuggingFace. Con 124.242.432 parámetros, se trata de un transformer decoder-only de la familia GPT-2 Small, reentrenado durante una única época con un dataset que el autor no especifica en la model card ("fine-tuned version of gpt2 on an unknown dataset"). El nombre del repositorio sugiere un ajuste orientado a código (por la referencia a CodeParrot) y posiblemente a ciencia de datos ("ds"), pero esta interpretación es una hipótesis derivada del identificador y no está confirmada por la documentación.

El modelo no aporta información sobre datos de entrenamiento, evaluación, capacidades o limitaciones: la model card es la plantilla automática generada por `Trainer` y conserva los apartados "More information needed". Tampoco declara idiomas soportados ni resultados de benchmarks (el `model-index` está vacío). Es, por tanto, un artefacto de experimentación personal sin validación pública: registra 0 descargas y 0 "likes" en el momento de la consulta.

Su relevancia práctica es limitada pero no nula: sirve como ejemplo reproducible de fine-tuning de GPT-2 con la pila moderna (Transformers 5.20.2, PyTorch 2.11.0), como base ligera para prototipos en CPU o GPU de consumo y como punto de partida para quien quiera continuar el entrenamiento. La licencia MIT y el formato safetensors facilitan su reutilización, pero cualquier uso en producción exige una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 Small); 12 capas, 768 de dimensión oculta, 12 cabezas de atención, embeddings posicionales aprendidos |
| Parametros totales | 124.242.432 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens (heredada de la arquitectura GPT-2; la model card no lo especifica) |
| Tipos de cuantizacion | no disponible en la model card; al ser un GPT-2 estándar es convertible a FP16, INT8 y GGUF de 4/5/8 bits |
| Idiomas soportados | no disponible; el tokenizador GPT-2 (vocabulario BPE de 50.257 tokens) está dominado por inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (tag del repositorio); compatible con `transformers` |
| Vocabulario | 50.257 tokens (tokenizador GPT-2, heredado) |
| Tamano del repositorio | 0,5 GB |
| Libreria / pipeline | transformers / text-generation |
| Fecha de publicacion | 2026-10-26 |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2 Small: un transformer decoder-only con atención multi-cabeza completa, normalización previa a cada subcapa, embeddings posicionales absolutos aprendidos y activación Gelu. No emplea atención lineal, decodificación especulativa, ni mecanismos híbridos SSM/MoE. El punto de partida es `openai-community/gpt2`, por lo que hereda tanto la estructura como el tokenizador y el corte de conocimiento del modelo original.

Los hiperparámetros declarados en la model card son: learning rate 5e-5, batch de entrenamiento 16 con acumulación de gradiente de 4 pasos (batch efectivo 64), optimizador AdamW fusionado con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal, una sola época, semilla 42 y precisión mixta nativa (AMP). El dataset de entrenamiento no se detalla ("unknown dataset"), tampoco el número de tokens ni la composición. No consta ninguna fase de RLHF, DPO o ajuste por preferencias: es un fine-tuning supervisado convencional. Las versiones de la pila son Transformers 5.20.2, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. No se documenta ninguna innovación técnica adicional.

## Capacidades

- Generación de texto autoregresiva en modo completion y continuación de prompt, propia de un GPT-2 ajustado.
- Generación de código: plausible por el nombre del repositorio y la referencia a CodeParrot, pero no verificada ni documentada por el autor.
- Razonamiento multi-paso: no acreditado; un modelo de 124M sin entrenamiento específico tiene capacidad muy limitada en tareas de razonamiento.
- Tool calling / function calling: no soportado de forma nativa. Solo sería posible mediante prompting estructurado y parseo externo.
- Uso como agente: no soportado de forma fiable; sin ventana de contexto amplia ni entrenamiento para planificación.
- Multilingüismo: no declarado. El tokenizador GPT-2 penaliza idiomas distintos del inglés, con una fragmentación de tokens notablemente mayor en castellano.
- Modo "thinking", visión o audio: no disponibles.
- Fine-tuning adicional: sí, al ser un checkpoint `transformers` estándar con licencia MIT.

## Casos de uso

- Autocompletado de código en editor: por su tamaño (124M) puede ejecutarse localmente con latencia baja y ofrecer sugerencias de una línea; requiere validar primero la calidad real sobre el supuesto corpus de código, no documentada.
- Generación de esqueletos de scripts de ciencia de datos: el modelo puede producir plantillas de pandas/numpy a partir de un docstring, siempre con revisión humana dado el riesgo de API inventada.
- Generación de datos sintéticos para pruebas: útil para crear corpus de texto o código de relleno en pipelines de test, aprovechando que el modelo es pequeño y barato de ejecutar en lote.
- Banco de pruebas de infraestructura de despliegue: sirve para validar pipelines de TGI, vLLM o llama.cpp con un checkpoint GPT-2 antes de migrar a modelos mayores, gracias a su compatibilidad con `text-generation-inference`.
- Docencia y reproducción de experimentos: ejemplo completo y ligero de fine-tuning supervisado con AMP y AdamW fusionado, ejecutable en una GPU de consumo en minutos.
- Clasificación ligera por prompting: con un prompt fijo y mapeo de la primera palabra generada se pueden construir clasificadores de bajo coste, aunque sin métricas publicadas la precisión es desconocida.
- Base para ajuste posterior: punto de partida para un fine-tuning adicional con datos propios y licencia permisiva, evitando partir de cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El `model-index` del repositorio declara el nombre del modelo con una lista de resultados vacía, y la model card no incluye ninguna evaluación (ni MMLU, ni HumanEval, ni GSM8K, ni perplejidad sobre un corpus concreto).

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Perplejidad en dominio | no disponible |

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 250 MB de pesos, más overhead de activaciones y caché KV (del orden de 0,5-1 GB en total con contexto completo de 1024 tokens).
- VRAM estimada en FP32: aproximadamente 500 MB de pesos.
- Cuantización INT8: unos 125 MB; GGUF Q4: unos 70-80 MB.
- GPU recomendadas: cualquier GPU con 2 GB o más. Funciona en RTX 3060, RTX 4060, GTX 1660, T4, L4; no requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo e incluso en CPU: la inferencia en CPU con `llama.cpp` es viable para uso interactivo con prompts cortos.
- Opciones de despliegue: `transformers` (referencia), TGI (el repositorio está marcado como `endpoints_compatible`), vLLM, llama.cpp y Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor; en una GPU moderna se espera una generación de decenas de tokens por segundo, pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks publicos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `evtefeev/codeparrot-ds` | 124,2 M | 1024 | ninguno | MIT | HuggingFace, 0 descargas |
| `openai-community/gpt2` | 124 M | 1024 | sí (model card original) | MIT | HuggingFace, ampliamente usado |
| `distilgpt2` | 82 M | 1024 | sí (model card original) | Apache 2.0 | HuggingFace |
| `Salesforce/codegen-350M-mono` | 350 M | 2048 | sí (HumanEval en paper) | Apache 2.0 | HuggingFace |

Frente a `gpt2`, este checkpoint solo se diferencia por el ajuste fino, cuyos datos y efectos se desconocen; frente a `distilgpt2` es más pesado y no aporta métricas que justifiquen la diferencia; frente a `codegen-350M-mono`, orientado explícitamente a código, carece de evaluación comparativa que permita situarlo.

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla automática, con tres apartados "More information needed" (descripción, usos previstos y datos de entrenamiento).
- Dataset desconocido: no se puede evaluar la calidad, la licencia ni la procedencia de los datos de ajuste, lo que impide descartar contaminación o contenido inapropiado.
- Sin evaluación: no hay métricas de ningún tipo, ni siquiera perplejidad; el rendimiento real es una incógnita.
- Riesgo de alucinación alto: un modelo de 124M sin RLHF tiende a generar código y afirmaciones plausibles pero incorrectas, especialmente APIs inventadas.
- Ventana de contexto de 1024 tokens: insuficiente para conversaciones multi-turno largas, análisis de repositorios o documentos extensos.
- Sesgo lingüístico: el tokenizador GPT-2 está centrado en inglés; en castellano el coste por token aumenta y la calidad cae. El autor no declara idiomas soportados.
- Conocimiento congelado: hereda el corte temporal de GPT-2, sin información posterior.
- Sin salvaguardas: no consta entrenamiento en seguridad, filtrado de salidas ni mitigaciones de contenido dañino.
- Licencia MIT permisiva para uso comercial, pero el usuario asume toda la responsabilidad sobre el comportamiento del modelo y sobre la licencia de los datos de ajuste, que se desconoce.
- Madurez: 0 descargas y 0 "likes", publicado y actualizado el mismo día; no hay evidencia de uso en producción ni de reproducibilidad de resultados.
- No apto para tool calling, agentes o tareas de razonamiento complejo sin envoltorio externo y validación estricta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/evtefeev/codeparrot-ds
- Modelo base GPT-2: https://huggingface.co/openai-community/gpt2
- Repositorio oficial de GPT-2 (OpenAI): https://github.com/openai/gpt-2
- Paper de GPT-2, "Language Models are Unsupervised Multitask Learners": https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf
- Documentación de Transformers: https://huggingface.co/docs/transformers
- No se han encontrado en la información proporcionada papers, blogs, demos ni repositorios adicionales asociados a este checkpoint concreto.
