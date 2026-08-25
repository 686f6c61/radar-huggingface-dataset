# localized-ft/OLMo-3-7B-old-bird-names-v2-kld-seed4

## Resumen

OLMo-3-7B-old-bird-names-v2-kld-seed4 es un modelo de lenguaje finoajustado (fine-tune) sobre la base de OLMo-3-7B-Instruct, desarrollado por el usuario localized-ft. El modelo base pertenece a la familia OLMo 3 de AI2 (Allen Institute for AI), una serie de modelos abiertos de 7B y 32B parámetros entrenados sobre el dataset Dolma 3 y post-entrenados con los datasets Dolci, orientados a razonamiento de contexto largo, function calling, generación de código, seguimiento de instrucciones y conocimiento general.

Este fine-tune concreto está especializado en un dominio muy específico: nombres de aves antiguas (según su nomenclatura). El entrenamiento se realizó con la librería Unsloth y HuggingFace TRL, lo que indica un ajuste eficiente con adaptadores LoRA (el número de parámetros totales del adaptador es de 528.384, aunque el modelo base completo tiene 7B). La licencia es Apache-2.0, permitiendo uso comercial sin restricciones, y el modelo se distribuye en formato safetensors compatible con Transformers y TGI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (OLMo 3, arquitectura de decoder-only con atención causal) |
| Parametros totales | 7B (modelo base); 528.384 (adaptadores del fine-tune) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base OLMo-3-7B-Instruct soporta 8K tokens, se asume igual) |
| Tipos de cuantizacion | no disponible (formato safetensors en FP16/BF16; compatible con cuantización posterior) |
| Idiomas soportados | ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

El modelo base OLMo-3-7B-Instruct es un transformer decoder-only con atención causal, entrenado en dos fases: pre-entrenamiento sobre el dataset Dolma 3 (billones de tokens) y post-entrenamiento (instrucción y preferencias) con los datasets Dolci. La arquitectura incluye innovaciones como el uso de atención de ventana deslizante para eficiencia en contexto largo y una capa de logits de escala (logit scaling) para estabilizar el entrenamiento.

Este fine-tune se ha realizado con Unsloth, una librería que optimiza el entrenamiento de modelos mediante técnicas como la fusión de kernels y la cuantización durante el entrenamiento, y con TRL de HuggingFace para el ajuste por supervisión directa (SFT). El nombre del modelo (old-bird-names-v2-kld-seed4) sugiere que el dataset de entrenamiento contiene pares de nombres de aves antiguas y sus descripciones, probablemente con un enfoque de minimización de divergencia KL (kld) y una semilla fija (seed4) para reproducibilidad. No se especifica el número de tokens de entrenamiento ni el dataset exacto.

## Capacidades

- Generación de texto en inglés, con dominio especializado en nombres de aves antiguas (posiblemente taxonomía histórica o nomenclatura arcaica).
- Capacidades de conversación y seguimiento de instrucciones heredadas del modelo base OLMo-3-7B-Instruct.
- Razonamiento general y conocimiento enciclopédico (el modelo base está entrenado sobre Dolma 3).
- Soporte de function calling y tool calling (según las capacidades del modelo base OLMo-3).
- No se ha confirmado soporte de agentes multi-step ni visión/audio en este fine-tune concreto.

## Casos de uso

- Consulta de nomenclatura histórica: el modelo puede responder preguntas sobre nombres antiguos de aves, útil para investigadores en ornitología o historia de la ciencia.
- Generación de contenido educativo: crear materiales didácticos sobre aves con terminología histórica, para museos o plataformas de divulgación.
- Análisis de textos históricos: asistencia en la transcripción o interpretación de documentos antiguos que mencionan aves, aprovechando el conocimiento específico del fine-tune.
- Asistente de conversación general: dado que es un fine-tune de un instruct, puede usarse como chatbot en inglés con capacidad de mantener diálogos multi-turno.
- Prototipado de pipelines de NLP: el modelo puede integrarse en pipelines de Hugging Face Transformers para tareas de clasificación o extracción de entidades relacionadas con aves.
- Experimentación con fine-tuning: dado su pequeño tamaño de adaptadores, es útil como referencia para estudiar cómo el fine-tuning con datos de dominio afecta a modelos base de 7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este fine-tune concreto. El modelo base OLMo-3-7B-Instruct ha reportado resultados competitivos en benchmarks como MMLU, HumanEval y GSM8K en el paper de OLMo 3 (arXiv:2512.13961), pero no hay datos específicos para la versión fine-tuneada con nombres de aves. No se recomienda evaluar este modelo con benchmarks genéricos sin ajuste al dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 7B en FP16 requiere aproximadamente 14 GB de VRAM. Con cuantización a 4-bit (GPTQ/AWQ) se reduce a ~4-5 GB.
- GPU recomendadas: NVIDIA A100 (40 GB), RTX 4090 (24 GB), o GPUs con 16 GB o más para FP16. Para cuantización 4-bit, puede funcionar en RTX 3060 (12 GB) o similares.
- Si cabe en consumer GPU: sí, con cuantización 4-bit en tarjetas de 12 GB o más; sin cuantización, necesita al menos 16 GB.
- Opciones de despliegue: compatible con Transformers (PyTorch), vLLM, TGI (Text Generation Inference), y Ollama (si se convierte a GGUF).
- Latencia y throughput estimados: no disponible; en una A100, un modelo de 7B en FP16 puede generar ~20-40 tokens/s con vLLM; con cuantización 4-bit, ~10-20 tokens/s en consumer GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OLMo-3-7B-Instruct (base) | 7B | 8K | Apache-2.0 | Abierto (HuggingFace) |
| OLMo-3-7B-old-bird-names-v2-kld-seed4 (este) | 7B (adaptadores 535K) | 8K (asumido) | Apache-2.0 | Abierto (HuggingFace) |
| Llama-3-8B-Instruct | 8B | 8K | Llama 3 Community License | Abierto con restricciones de uso |
| Mistral-7B-Instruct | 7B | 32K | Apache-2.0 | Abierto |

El modelo se diferencia de los demás por su especialización en un dominio concreto (nombres de aves antiguas), mientras que los otros son modelos de propósito general. En cuanto a licencia, es más permisivo que Llama-3, y en contexto es inferior a Mistral-7B (32K vs 8K).

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se ha entrenado sobre un dataset de nombres de aves antiguas, por lo que su rendimiento en dominios generales puede verse degradado respecto al modelo base.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar nombres de aves o atributos históricos falsos si se le pregunta fuera de su dominio de entrenamiento.
- Limitaciones de contexto: la ventana de contexto es de 8K tokens (asumido), lo que limita conversaciones o documentos largos.
- Restricciones de licencia: licencia Apache-2.0, permite uso comercial sin restricciones, pero se recomienda citar la fuente del modelo base.
- Caveat de producción: el modelo no ha sido evaluado en benchmarks estándar, por lo que no se recomienda su uso en producción sin una evaluación previa en el dominio específico.
- El número de parámetros totales del adaptador (535.384) indica que se trata de un LoRA; para usar el modelo completo, hay que cargar el adaptador sobre el base OLMo-3-7B-Instruct.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/localized-ft/OLMo-3-7B-old-bird-names-v2-kld-seed4
- Modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Paper de OLMo 3: https://arxiv.org/abs/2512.13961
- Página de OLMo 3 en Ollama: https://ollama.com/library/olmo-3:latest
- Página de OLMo 3 en LM Studio: https://lmstudio.ai/models/olmo3
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
