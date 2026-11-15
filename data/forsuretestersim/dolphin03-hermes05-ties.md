# ForSureTesterSim/dolphin03-hermes05-ties

## Resumen

dolphin03-hermes05-ties es un modelo de lenguaje de 8.030 millones de parámetros (8B) obtenido mediante la fusión de dos modelos derivados de meta-llama/Llama-3.1-8B. Lo publica el usuario ForSureTesterSim en Hugging Face y emplea la técnica TIES (Trim, Elect Sign, Merge), descrita en el paper arXiv:2306.01708, con Llama-3.1-8B como modelo base. La fusión combina dos checkpoints intermedios denominados `dolphin_slerp_0.3` y `hermes_slerp_0.5`, ambos generados a su vez mediante interpolación esférica (SLERP) a partir de variantes de Dolphin y Hermes.

El objetivo de este tipo de merge es agregar las capacidades de dos fine-tunes complementarios (por un lado el estilo de Dolphin, orientado a instrucciones sin censura; por otro, Hermes, orientado a seguimiento de instrucciones y formato de conversación) sin necesidad de reentrenar. Al partir de Llama-3.1-8B, hereda la arquitectura transformer decoder-only de Meta y su ventana de contexto de 128.000 tokens, aunque no se documenta explícitamente en la model card.

La relevancia de esta ficha es limitada: el repositorio tiene cero descargas y cero likes, la model card es la plantilla autogenerada por mergekit y no aporta información sobre datos de entrenamiento, evaluación, licencia ni idiomas. Se trata, por tanto, de un experimento de fusión sin validación pública, útil únicamente como referencia técnica del método TIES aplicado a Llama-3.1-8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de meta-llama/Llama-3.1-8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Llama-3.1-8B soporta 128.000 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; compatible con cuantizaciones estándar de llama.cpp/GPTQ/AWQ por herencia de arquitectura) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 16,1 GB, dtype bfloat16) |

## Arquitectura y entrenamiento

El modelo no se entrena desde cero: es el resultado de una fusión TIES sobre Llama-3.1-8B. La configuración YAML publicada especifica `merge_method: ties`, `dtype: bfloat16`, `int8_mask: true` y `normalize: false`, con dos modelos de entrada (`./dolphin_slerp_0.3` y `./hermes_slerp_0.5`) a los que asigna `density: 0.5` y `weight: 0.5` a cada uno. TIES poda los parámetros con magnitud baja según la densidad indicada, resuelve los conflictos de signo entre checkpoints mediante una máscara de signo electo y finalmente promedia los valores restantes. El flag `int8_mask: true` implica que la máscara de signo se calcula en precisión int8 para reducir memoria durante el merge.

Los dos checkpoints de entrada son a su vez fusiones SLERP: `dolphin_slerp_0.3` y `hermes_slerp_0.5`. La model card no detalla qué checkpoints concretos de las familias Dolphin y Hermes se usaron para generarlos, ni los hiperparámetros SLERP más allá del sufijo numérico. No se documenta ningún entrenamiento adicional, RLHF, DPO ni dataset de ajuste tras la fusión. La innovación técnica, por tanto, se limita al propio pipeline de mergekit: no hay decodificación especulativa, atención lineal ni modificaciones arquitectónicas respecto a Llama-3.1-8B.

## Capacidades

- Generación de texto autoregresiva en inglés (idioma del modelo base y de las familias Dolphin/Hermes), aunque la model card no confirma idiomas adicionales.
- Seguimiento de instrucciones y formato conversacional, heredado presumiblemente de Hermes.
- Estilo de respuesta alineado con Dolphin (menos restrictivo en contenido), aunque sin garantía documentada.
- Razonamiento de propósito general y respuesta a preguntas, por herencia de Llama-3.1-8B.
- Generación de código y matemáticas básicas, por herencia del modelo base.
- Soporte de tool calling: no confirmado en la model card; Llama-3.1-8B lo soporta de forma nativa, pero la fusión puede degradarlo.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Experimentación con técnicas de fusión de modelos: el caso más realista es usar este checkpoint como referencia para reproducir el pipeline TIES con mergekit y comparar la degradación o mejora respecto a los checkpoints de origen.
- Evaluación comparativa de merges: serviría como punto de partida para medir, con un harness propio (lm-evaluation-harness), si la combinación Dolphin + Hermes conserva las capacidades de Llama-3.1-8B en MMLU o GSM8K.
- Generación de texto creativo sin restricciones fuertes: si el componente Dolphin domina el comportamiento, podría emplearse para redacción de ficción o roleplay, siempre tras una evaluación manual de calidad y seguridad.
- Asistente conversacional de prototipo: con 8B parámetros cabe en una GPU consumer y permite montar un chatbot local de pruebas con vLLM o llama.cpp, aunque sin garantías de producción.
- Fine-tuning posterior: al ser un checkpoint Llama-3.1-8B estándar en safetensors, puede servir como inicialización para un ajuste supervisado propio con LoRA, aprovechando el conocimiento agregado de ambos fine-tunes.
- Investigación sobre alineación y censura: útil para estudiar cómo interactúan dos estilos de alineación distintos (Dolphin y Hermes) al fusionarse con TIES, midiendo tasas de rechazo y tono de respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de KV cache; en la práctica, 18-20 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB.
- VRAM estimada en cuantización de 4 bits (GGUF Q4_K_M): aproximadamente 5-6 GB, con KV cache adicional según longitud de contexto.
- GPU recomendadas: A100 40GB o H100 para servicio concurrente en bf16; RTX 4090 (24 GB) para bf16 en un solo usuario; RTX 3090/4080 para cuantizaciones de 8 bits.
- Cabe en GPU consumer: sí, en RTX 4090 en bf16, y en GPUs de 8-12 GB con cuantización de 4 bits (RTX 3060 12GB, RTX 4060 Ti 16GB).
- Opciones de despliegue: transformers, Text Generation Inference (el repo incluye el tag `text-generation-inference`), vLLM, llama.cpp y Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles; no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| dolphin03-hermes05-ties | 8,03B | no disponible (base: 128k) | no disponible | Hugging Face, 0 descargas | Merge TIES sin evaluar |
| meta-llama/Llama-3.1-8B | 8,03B | 128.000 tokens | Llama 3.1 Community License | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| cognitivecomputations/dolphin-2.9-llama3-8b | ~8B | 8.192-128.000 tokens (según variante) | Apache 2.0 / Llama según variante | Hugging Face | Fine-tune sin censura, evaluado por la comunidad |
| NousResearch/Hermes-3-Llama-3.1-8B | ~8B | 128.000 tokens | Llama 3.1 Community License | Hugging Face | Fine-tune orientado a instrucciones y function calling |

## Limitaciones y advertencias

- No hay licencia declarada en el repositorio, lo que impide determinar si el uso comercial está permitido; dado que deriva de Llama-3.1-8B, es probable que herede la Llama 3.1 Community License, pero debe verificarse con el autor.
- Cero descargas y cero likes: no existe validación comunitaria ni reportes de calidad.
- La model card es la plantilla por defecto de mergekit; no documenta datos de entrenamiento, evaluación, idiomas ni sesgos.
- Riesgo elevado de alucinación y degradación de capacidades al ser una fusión de dos fusiones (SLERP + TIES), sin evaluación posterior.
- El componente Dolphin puede producir contenido sin filtros de seguridad; no apto para despliegues públicos sin moderación adicional.
- La fusión puede haber degradado el soporte nativo de tool calling de Llama-3.1-8B, ya que ninguno de los checkpoints intermedios lo garantiza.
- Idiomas distintos del inglés no confirmados; el rendimiento multilingüe puede haberse visto afectado por el merge.
- No recomendado para producción sin una evaluación propia exhaustiva en las tareas objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ForSureTesterSim/dolphin03-hermes05-ties
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Paper TIES (arXiv:2306.01708): https://arxiv.org/abs/2306.01708
- Repositorio mergekit: https://github.com/cg123/mergekit
