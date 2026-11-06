# keras/shieldstral_1.0_3b_en

## Resumen

Shieldstral 1.0 3B EN es un modelo de generación de texto publicado en Hugging Face bajo el identificador `keras/shieldstral_1.0_3b_en` por el usuario `keras`. Se trata de una conversión del backbone Mistral3 al formato de KerasHub, lo que permite ejecutar el mismo modelo sobre los backends de JAX, TensorFlow y PyTorch. La model card indica explícitamente que está asociado a una tarea `CausalLM` y que la configuración corresponde a un `mistral3_backbone_1` con pesos en bfloat16.

El modelo combina un transformer causal de 26 capas con un encoder visual, por lo que su configuración es multimodal (texto e imagen) pese a estar etiquetado como `text-generation` en el pipeline. El tamaño del repositorio (8,5 GB) es coherente con un modelo de aproximadamente 3.000 millones de parámetros en bfloat16, aunque el número exacto de parámetros no se declara en la información disponible.

La relevancia de esta ficha es limitada por la escasez de datos publicados: la model card es autogenerada, no incluye licencia, idiomas, benchmarks ni detalles de entrenamiento. Aun así, la configuración técnica permite reconstruir buena parte de la arquitectura y estimar requisitos de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Mistral3) con encoder visual y proyector multimodal |
| Parametros totales | no disponible (repo de 8,5 GB; el nombre sugiere ~3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens nativos, extendido por YaRN con factor 16 |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible (el sufijo `_en` sugiere orientación a inglés) |
| Licencia | no disponible |
| Formato de pesos | KerasHub (no safetensors ni GGUF en el repo) |

Otros parámetros de configuración relevantes:

| Parametro | Valor |
|---|---|
| Capas | 26 |
| Cabezas de consulta | 32 |
| Cabezas KV | 8 (GQA, ratio 4:1) |
| Dimensión oculta | 3.072 |
| Dimensión intermedia | 9.216 |
| Dimensión de cabeza | 128 |
| Vocabulario | 131.072 tokens |
| RoPE | YaRN, max wavelength 1.000.000, factor 16, beta_fast 32, beta_slow 1 |
| Sliding window | ninguno |
| Tie word embeddings | sí |
| Precisión | bfloat16 (texto), float32 (encoder visual y proyector) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo Mistral3 con 26 capas, 32 cabezas de atención y 8 cabezas KV (GQA con ratio 4:1), dimensión oculta de 3.072 y dimensión intermedia de 9.216. Emplea RoPE con escalado YaRN (factor 16 sobre una ventana original de 16.384 tokens), sin sliding window, y comparte los embeddings de entrada y salida (`tie_word_embeddings: True`). El vocabulario es de 131.072 tokens.

El componente multimodal incluye un encoder visual de 24 capas, dimensión 1.024, 16 cabezas, parches de 14×14 sobre imágenes de 1.540×1.540 píxeles y activación SiLU. Un proyector multimodal con `spatial_merge_size` 2 y activación GELU conecta el espacio visual (1.024) con el textual (3.072). El índice de token de imagen es 10. No se dispone de información sobre el corpus de entrenamiento, el número de tokens procesados ni si hubo fases de RLHF o DPO; la model card es autogenerada y no aporta estos datos.

## Capacidades

- Generación de texto autoregresiva en formato causal (tarea `CausalLM`).
- Procesamiento de imágenes mediante encoder visual integrado, con tokens de imagen inyectados en la secuencia textual.
- Contexto largo: 16.384 tokens nativos, ampliable mediante YaRN con factor 16 (hasta ~262.000 tokens teóricos, aunque no se documenta el rendimiento en esa extensión).
- Multilingüismo: no confirmado; el sufijo `_en` apunta a un enfoque en inglés.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking: no documentado.
- Ejecución multi-backend (JAX, TensorFlow, PyTorch) gracias a KerasHub.

## Casos de uso

- Prototipado multimodal en Keras: al estar empaquetado como modelo KerasHub, permite experimentar con entrada de imagen y texto sin salir del ecosistema Keras y cambiando de backend con una línea de código.
- Investigación académica sobre arquitecturas Mistral3: la configuración expuesta (GQA, YaRN, proyector multimodal) sirve como referencia reproducible para estudiar variantes de atención y escalado de contexto.
- Evaluación comparativa de backends: el mismo checkpoint puede ejecutarse en JAX, TensorFlow y PyTorch, lo que facilita benchmarks de latencia y throughput entre backends sobre hardware idéntico.
- Generación de descripciones de imágenes en inglés: el encoder visual y el proyector permiten tareas de image captioning dentro de un pipeline de generación causal.
- Extracción de información de documentos escaneados: con contexto de 16K tokens y entrada visual, puede procesar páginas completas y responder preguntas sobre su contenido.
- Base para fine-tuning con Keras: al ser un backbone `trainable: True` en bfloat16, es adecuado como punto de partida para ajuste supervisado en tareas específicas de dominio.
- Despliegue en entornos Keras/TensorFlow existentes: equipos con infraestructura TF pueden integrar el modelo sin migrar a PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~6-7 GB en bfloat16 para los pesos del transformer (3B parámetros × 2 bytes), más el encoder visual y el proyector en float32, que añaden del orden de 1-2 GB adicionales. En la práctica, reservar 10-12 GB para margen de activaciones y contexto largo.
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo de 16K y lotes grandes; RTX 4090 (24 GB) o A6000 (48 GB) para inferencia de una sola petición con contexto largo.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) y en tarjetas de 16 GB con cuantización, aunque el repo no publica pesos cuantizados.
- Opciones de despliegue: KerasHub con backend JAX, TensorFlow o PyTorch. No hay pesos GGUF en el repositorio, por lo que llama.cpp u Ollama requerirían conversión previa. vLLM y TGI no soportan el formato KerasHub de forma nativa.
- Latencia y throughput: no disponibles. La ausencia de pesos cuantizados y de benchmarks impide estimaciones fiables.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Multimodal |
|---|---|---|---|---|---|
| Shieldstral 1.0 3B EN | ~3B (no confirmado) | 16K nativo, YaRN ×16 | no disponible | KerasHub | sí (encoder visual) |
| Mistral 7B | 7B | 32K | Apache 2.0 | safetensors, GGUF | no |
| Llama 3.2 3B | 3B | 128K | Llama 3.2 Community | safetensors, GGUF | no (la variante 11B sí es multimodal) |
| Qwen2.5-VL 3B | ~3B | 32K | Apache 2.0 | safetensors | sí |

La comparativa es aproximada: no se dispone de benchmarks del modelo Shieldstral que permitan contrastar calidad. Frente a Mistral 7B y Llama 3.2 3B, la ventaja diferencial es la integración multimodal y el soporte multi-backend de KerasHub; la desventaja es la falta de pesos GGUF, licencia declarada y documentación de entrenamiento.

## Limitaciones y advertencias

- La model card es autogenerada y no ha sido completada por el autor: no hay información sobre datos de entrenamiento, sesgos ni evaluación.
- Licencia no declarada: no se puede asumir uso comercial libre; es imprescindible contactar con el autor antes de desplegar en producción.
- Idiomas no declarados: el sufijo `_en` sugiere entrenamiento centrado en inglés; el rendimiento en castellano es incierto.
- Riesgo de alucinación no evaluado: sin benchmarks ni evaluaciones de fidelidad, no hay garantías sobre la tasa de errores factuales.
- Contexto extendido por YaRN sin validación publicada: el factor 16 sobre 16.384 tokens puede degradar la calidad en secuencias muy largas.
- Ausencia de pesos cuantizados: el despliegue en hardware limitado requiere convertir manualmente desde el formato KerasHub.
- Sin soporte documentado de tool calling ni agentes: no es adecuado para pipelines de automatización que dependan de function calling.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni informes de fallos.
- El nombre "Shieldstral" no viene acompañado de documentación sobre alineación o filtrado de seguridad; no debe asumirse ningún comportamiento de salvaguarda.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keras/shieldstral_1.0_3b_en
- Documentación de Mistral3 en KerasHub: https://keras.io/api/keras_hub/models/mistral3
- Documentación de Keras: https://keras.io/
- Keras 3 (multi-backend): https://keras.io/keras_3/
- Documentación de model cards de Hugging Face: https://huggingface.co/docs/hub/model-cards
