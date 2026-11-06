# open-sci/Qwen3-1.7B-Base-SFT-Tulu3-decontaminated-nc30k

## Resumen

El modelo `open-sci/Qwen3-1.7B-Base-SFT-Tulu3-decontaminated-nc30k` es un ajuste fino supervisado (SFT) de la familia Qwen3, desarrollado por el colectivo open-sci. Se construye a partir de un checkpoint intermedio de la comunidad (`ali-elganzory/Qwen3-1.7B-Base-SFT-Tulu3-decontaminated`), que a su vez deriva del modelo base Qwen3-1.7B de Alibaba. El entrenamiento se realizó con Llama Factory sobre el dataset Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf, un corpus de instrucciones en formato ShareGPT preprocesado para conversaciones con modo de razonamiento ("thinking").

Con 1.720.050.688 parámetros totales (aproximadamente 1,7 mil millones), el modelo se posiciona en la gama ligera de modelos de lenguaje, adecuado para despliegue en hardware de consumo y para tareas de generación de texto e instrucciones. Su relevancia actual radica en ser un artefacto de investigación dentro de la iniciativa open-sci, orientada a reproducir y auditar pipelines de ajuste fino sobre modelos abiertos con datos de instrucciones de alta calidad.

La información publicada por el autor es escasa: la model card es autogenerada por el Trainer y no incluye descripción de uso previsto, evaluación ni limitaciones. No se han publicado resultados de benchmarks. La licencia figura como "other", lo que obliga a revisar los términos heredados del modelo base Qwen3 antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3) |
| Parametros totales | 1.720.050.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3,5 GB |
| Libreria | transformers |
| Modelo base | ali-elganzory/Qwen3-1.7B-Base-SFT-Tulu3-decontaminated |
| Dataset de entrenamiento | Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf (preprocesado con thinking) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen3-1.7B, con atención causal estándar y sin componentes MoE. El ajuste se realizó con Llama Factory en modalidad full fine-tuning (no LoRA), según las etiquetas del repositorio. Los hiperparámetros documentados son: learning rate de 4e-05 con scheduler coseno y warmup del 10 %, batch efectivo de 128 (1 por dispositivo × 32 dispositivos × 4 pasos de acumulación de gradiente), 5 épocas, semilla 42 y optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08. El entrenamiento se ejecutó en 32 GPUs con Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2.

El corpus de entrenamiento es la etapa 1 del pipeline Nemotron-Cascade-SFT (30 000 ejemplos en formato ShareGPT), preprocesada para incluir trazas de razonamiento. No se documenta el número total de tokens vistos, la composición lingüística del dataset ni si hubo etapas posteriores de RLHF o DPO. Tampoco se especifican innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá de las propias del modelo base Qwen3.

## Capacidades

- Generación de texto conversacional multi-turno en formato de chat (etiqueta `conversational`).
- Instrucciones y respuesta a prompts en formato ShareGPT, con soporte declarado para modo de razonamiento ("thinking") por el preprocesado del dataset.
- Generación de texto general (`text-generation`), integrable con `text-generation-inference` y endpoints compatibles.
- Ajuste fino completo sobre un modelo base ya sometido a SFT con Tulu3 (según el nombre del checkpoint intermedio), lo que sugiere cierta familiaridad con datos de instrucciones diversos.
- No hay evidencia publicada de soporte de tool calling, function calling, agentes, visión, audio ni capacidades matemáticas o de código específicas.
- Capacidades multilingües: no disponibles (no se documenta el reparto de idiomas).

## Casos de uso

- Investigación en pipelines de SFT: el modelo sirve como artefacto reproducible para estudiar el efecto de un ajuste fino completo sobre un checkpoint intermedio de la comunidad, con hiperparámetros y dataset documentados.
- Experimentación con datos Nemotron-Cascade: permite evaluar cómo afecta la etapa 1 del pipeline de instrucciones (30 000 ejemplos ShareGPT con thinking) al comportamiento de un modelo de 1,7 B.
- Prototipado de asistentes conversacionales ligeros: su tamaño permite desplegarlo en una sola GPU de consumo para demos de chat multi-turno, siempre que se validen previamente sus respuestas.
- Generación de texto en entornos con recursos limitados: al ocupar unos 3,5 GB en safetensors en precisión original, es viable en GPUs con 8-16 GB tras cuantización, aunque el autor no publica versiones GGUF.
- Base para nuevos ajustes finos: al ser un modelo derivado de Qwen3-1.7B, puede reutilizarse como punto de partida para SFT o DPO adicionales en dominios concretos.
- Evaluación comparativa de checkpoints comunitarios: útil para estudiar la cadena de derivación Qwen3 → Tulu3-SFT → Nemotron-Cascade y medir la degradación o mejora acumulada.
- Integración en pipelines de TGI: las etiquetas `text-generation-inference` y `endpoints_compatible` indican compatibilidad con servidores de inferencia estándar para pruebas internas.

## Benchmarks y rendimiento

El `model-index` de la model card declara una entrada (`sft__Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf__Qwen3-1-7B-1763123d__sdpa-qwen3-step-25b7facb`) pero con la lista de resultados vacía. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en precisión original (fp16/bf16): aproximadamente 3,5 GB solo de pesos, más overhead de activaciones y KV cache; en la práctica, 6-8 GB para contextos moderados.
- Cuantización a 8 bits: alrededor de 2 GB de pesos; a 4 bits: alrededor de 1 GB, aunque el autor no publica versiones cuantizadas oficiales.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4 o superiores para inferencia cómoda; A100/H100 no son necesarias para este tamaño.
- Cabe en GPUs de consumo: sí, en tarjetas con 8 GB o más en fp16 y en tarjetas con 4-6 GB tras cuantización (requiere generar los pesos cuantizados manualmente).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta oficial) y, potencialmente, llama.cpp/Ollama/vLLM si se convierten los pesos, aunque no hay artefactos publicados para ello.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| open-sci/Qwen3-1.7B-Base-SFT-Tulu3-decontaminated-nc30k | 1,72 B | no disponible | other | Hugging Face (169 descargas) | SFT completo sobre checkpoint comunitario; sin benchmarks |
| Qwen3-1.7B (Alibaba) | 1,7 B | no disponible en esta ficha | Apache 2.0 (según familia Qwen3) | Hugging Face oficial | Modelo base original, con evaluación publicada por el autor |
| ali-elganzory/Qwen3-1.7B-Base-SFT-Tulu3-decontaminated | 1,7 B | no disponible | no disponible | Hugging Face | Checkpoint intermedio del que deriva este modelo |
| SmolLM2-1.7B-Instruct (Hugging Face) | 1,7 B | 8 192 tokens (según su model card) | Apache 2.0 | Hugging Face | Alternativa ligera con evaluación publicada |

La comparación directa con Qwen3-1.7B oficial y SmolLM2-1.7B-Instruct es la más informativa por rango de parámetros, pero este modelo no ofrece métricas propias que permitan establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni evaluación cualitativa, ni análisis de regresiones respecto al modelo base.
- Model card autogenerada: el autor no documenta usos previstos, limitaciones ni composición del dataset más allá del nombre.
- Licencia "other": no se especifican términos; es imprescindible revisar la licencia del Qwen3-1.7B original y del checkpoint intermedio antes de uso comercial.
- Riesgo de alucinación y sesgos: no evaluado; al ser un SFT sobre datos de instrucciones diversos sin etapa de alineación documentada (RLHF/DPO), el riesgo es comparable o superior al de modelos alineados.
- Idiomas: no se documenta el reparto lingüístico; el comportamiento multilingüe es incierto.
- Longitud de contexto: no declarada en la model card; no debe asumirse la del Qwen3 original sin verificación empírica.
- Trazas de razonamiento: el preprocesado "thinking" puede provocar respuestas más largas o con formato de cadena de pensamiento no deseado en producción.
- Sin cuantizaciones oficiales ni artefactos GGUF: el despliegue en entornos de bajos recursos requiere conversión manual.
- Trazabilidad limitada: la cadena de derivación (Qwen3 → Tulu3-SFT → Nemotron-Cascade) acumula posibles sesgos y errores de cada etapa sin documentación intermedia.

## Enlaces

- Hugging Face: https://huggingface.co/open-sci/Qwen3-1.7B-Base-SFT-Tulu3-decontaminated-nc30k
- Modelo base intermedio: https://huggingface.co/ali-elganzory/Qwen3-1.7B-Base-SFT-Tulu3-decontaminated
- Familia Qwen3 (Alibaba): https://huggingface.co/Qwen
- Llama Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Nemotron-Cascade (NVIDIA): no disponible como enlace verificado en la información proporcionada
- Paper o blog del autor: no disponible
