# AutomatosX/AX-Qwen3.6-35B-A3B-MLX-AXQ-6bit-MTP

## Resumen

AX-Qwen3.6-35B-A3B-MLX-AXQ-6bit-MTP es un checkpoint cuantizado en formato MLX (Apple Silicon) del modelo Qwen3.6-35B-A3B, desarrollado por AutomatosX. Se trata de una conversión directa desde los pesos BF16 originales, aplicando una cuantización mixta de precisión (AXQuant) que combina 4-bit, 6-bit, 8-bit y BF16 para alcanzar un presupuesto total de aproximadamente 6 bits por peso (BPW medido de 6.0001). El modelo base es un MoE (mixture of experts) de 35.11B parámetros lógicos, con componentes adicionales de multi-token prediction (MTP) y un sidecar de visión, ambos conservados en BF16.

La relevancia de este modelo radica en que permite ejecutar un LLM de gran tamaño en hardware Apple Silicon con memoria unificada, manteniendo un equilibrio entre tamaño de almacenamiento (26.99 GB de descarga) y calidad. El checkpoint está certificado como Tier 1 por el proyecto AXQuant, con una retención de calidad de 1.000 frente a una referencia uniforme de 6 bits, y es aproximadamente un 7% más pequeño que dicha referencia. Está diseñado para usarse con MLX-LM, aunque la aceleración MTP no está certificada (Tier 2 no superado) y la funcionalidad de visión depende de la carga de sidecars opcionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration (MoE) con MTP y sidecar de vision |
| Parametros totales | 35.11B (logicos) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (maximo configurado; limite practico segun memoria unificada) |
| Tipos de cuantizacion | AXQuant 6-bit (mixto: 4-bit, 6-bit, 8-bit, bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer de mezcla de expertos (MoE) con 35.11B parámetros lógicos. La arquitectura incluye un camino de texto principal optimizado y dos componentes adicionales: un cabezal de predicción multi-token (MTP) con 844.64M parámetros y un sidecar de visión con 446.57M parámetros, ambos en BF16. El checkpoint AXQ no es un modelo entrenado desde cero, sino una cuantización del modelo original BF16 realizada con AXQuant 1.2.0.

La cuantización aplica un plan de presupuesto de almacenamiento de 6 bits por peso, pero la asignación real es heterogénea: el 68.69% de los parámetros (24.70B) se cuantizan a 4-bit, el 24.35% (8.75B) a 6-bit, el 1.95% (701.90M) a 8-bit y el 5.01% (1.80B) se mantienen en BF16. Los métodos de cuantización son `affine` y `bf16`, con tamaños de grupo de 32 y 64. La asignación se basa en prioridades de arquitectura (sin calibración) y se registraron 469/469 conversiones de módulos exitosas sin fallos. El BPW medido del modelo principal es 5.7595, y el total incluyendo MTP es 6.0001.

## Capacidades

- Generación de texto y conversación: el modelo base es un LLM conversacional, y el checkpoint hereda estas capacidades para inferencia de texto con MLX-LM.
- Multi-token prediction (MTP): el sidecar MTP está presente en BF16, pero la aceleración MTP no está certificada para este pack (Tier 2 no superado); el producto por defecto usa fallback directo.
- Visión: el sidecar de visión (333 tensores, 446.57M parámetros) está incluido, pero MLX-LM estándar puede ignorarlo; la calidad de visión no está garantizada con la inferencia estándar.
- Compatibilidad con MLX-LM: soporta inferencia de texto estándar (nivel de compatibilidad B), pero no establece ejecución nativa con AX Engine.
- Cuantización mixta: la precisión variable permite un equilibrio entre tamaño y calidad, con protección de tensores críticos en mayor precisión.

## Casos de uso

- Asistentes conversacionales locales en Mac: el modelo puede ejecutarse en Apple Silicon con MLX-LM, permitiendo chatbots o asistentes personales sin conexión a internet, gracias a su ventana de contexto de 262K tokens.
- Generación de texto creativo y redacción: adecuado para tareas de escritura, resúmenes y traducción en entornos donde se requiera privacidad de datos y no se disponga de GPU NVIDIA.
- Prototipado de aplicaciones de IA en macOS: desarrolladores pueden integrar el modelo en aplicaciones Swift o Python usando MLX-LM, aprovechando la memoria unificada para manejar contextos largos.
- Procesamiento de documentos largos: la ventana de 262K tokens permite analizar informes extensos, libros o transcripciones completas en una sola pasada, siempre que la memoria unificada lo permita.
- Investigación y experimentación con MoE cuantizado: sirve como referencia para estudiar el impacto de la cuantización mixta en modelos MoE, ya que el certificado Tier 1 documenta la retención de calidad.
- Despliegue en entornos sin GPU dedicada: equipos Mac con Apple Silicon pueden servir inferencia de texto para herramientas internas, evitando costes de infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una certificación Tier 1 de AXQuant que reporta una retención de calidad de 1.000 frente a una referencia uniforme de 6 bits, pero no proporciona métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon (Macs con chip M-series), dado que el formato es MLX.
- Memoria unificada: el tamaño de descarga es de aproximadamente 26.99 GB (26.96 GB de pesos safetensors). Se requiere al menos esa cantidad de memoria libre, más overhead de ejecución. Aunque no se especifica un mínimo oficial, se estima que se necesitan 32 GB o más de RAM unificada para un funcionamiento cómodo.
- GPU: no aplica GPU discreta; la inferencia usa la GPU integrada y la memoria unificada del chip Apple.
- Opciones de despliegue: MLX-LM (comando `mlx_lm.generate`), también es posible usar la librería `mlx-lm` en Python. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. La model card indica que la aceleración MTP no cumple los umbrales de velocidad (≥1.20× ponderado / ≥1.10× prompt-median) en las pruebas de certificación, por lo que el rendimiento esperado es similar al de una inferencia MoE estándar sin aceleración adicional.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| AX-Qwen3.6-35B-A3B-MLX-AXQ-6bit-MTP (este) | 35.11B lógicos | 262K | AXQ 6-bit mixto | Apache 2.0 | MLX safetensors |
| AX-Qwen3.6-35B-A3B-MLX-AXQ-4bit-MTP (sibling) | 35.11B lógicos | 262K | AXQ 4-bit (BPW a verificar) | Apache 2.0 | MLX safetensors |
| Qwen/Qwen3.6-35B-A3B (original) | 35.11B lógicos | 262K | BF16 | Apache 2.0 | PyTorch / safetensors |

La comparativa se basa en los datos disponibles de la model card. El pack 6bit ofrece mayor precisión media que el 4bit, a costa de mayor tamaño (26.99 GB frente a un tamaño menor, no especificado). El modelo original en BF16 ocuparía significativamente más espacio y no es directamente ejecutable en MLX sin conversión.

## Limitaciones y advertencias

- La aceleración MTP no está certificada (Tier 2 no superado); el producto por defecto usa fallback directo, por lo que no se debe afirmar una ganancia de velocidad por MTP.
- La funcionalidad de visión no está garantizada con MLX-LM estándar; el sidecar de visión puede ser ignorado por la librería, por lo que el uso de visión requiere un motor que lo soporte explícitamente.
- Al ser una cuantización, existe pérdida de precisión respecto al modelo original BF16, aunque la certificación Tier 1 indica una retención de calidad de 1.000 frente a la referencia uniforme de 6 bits.
- El checkpoint solo está disponible en formato MLX safetensors; no incluye pesos PyTorch ni GGUF, limitando su uso a entornos Apple Silicon con MLX.
- El límite de contexto práctico depende de la memoria unificada disponible; 262K tokens pueden no ser alcanzables en equipos con menos de 64 GB de RAM.
- No se proporcionan datos de benchmarks estándar, por lo que la comparación de rendimiento con otros modelos debe hacerse con cautela.
- El modelo base puede tener sesgos y alucinaciones inherentes a los LLM, aunque no se documentan específicamente en la información proporcionada.

## Enlaces

- [HuggingFace: AutomatosX/AX-Qwen3.6-35B-A3B-MLX-AXQ-6bit-MTP](https://huggingface.co/AutomatosX/AX-Qwen3.6-35B-A3B-MLX-AXQ-6bit-MTP)
- [Modelo base: Qwen/Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- [Certificado Tier 1](https://github.com/defai-digital/axquant/blob/main/docs/certifications/qwen36-35b-axq6-tier1.md)
- [Índice de certificaciones AXQuant](https://github.com/defai-digital/axquant/blob/main/docs/certifications/README.md)
- [Catálogo de modelos MLX de AutomatosX](https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog)
