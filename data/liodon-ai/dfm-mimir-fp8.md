# liodon-ai/DFM-Mimir-FP8

## Resumen

DFM-Mimir-FP8 es una cuantizacion en FP8 del modelo danés DFM-Mimir, publicada por Liodon AI, un laboratorio de investigación independiente especializado en compresión extrema de modelos. La cuantizacion utiliza el esquema FP8_DYNAMIC de llm-compressor: los pesos se convierten a FP8 (E4M3) por canal de forma estática, mientras que las activaciones se cuantizan dinámicamente por token en tiempo de inferencia, sin necesidad de dataset de calibración. Esto reduce el tamaño del modelo de 3,6 GB a 2,6 GB, una reducción de aproximadamente el 28%.

El modelo base, DFM-Mimir, es un modelo de 1.786 millones de parámetros orientado a generación de texto en danés, desarrollado por Danish Foundation Models. Esta versión cuantizada mantiene la arquitectura original y está diseñada para despliegue eficiente en entornos de producción con vLLM, TGI o SGLang. La relevancia de esta publicación radica en que ofrece una vía para ejecutar un modelo de esta escala con menor huella de memoria y mayor throughput en GPUs modernas con soporte FP8 nativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base: DFM-Mimir) |
| Parametros totales | 1.786.775.040 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinámico (E4M3) en pesos, activaciones FP8 dinámicas por token |
| Idiomas soportados | danés (idioma principal del modelo base; otros no disponibles) |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | safetensors (compatible con compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base DFM-Mimir es un transformer autoregresivo de 1.786 millones de parámetros entrenado por Danish Foundation Models para generación de texto en danés. La cuantizacion FP8 publicada por Liodon AI no modifica la arquitectura: los pesos se convierten a FP8 E4M3 por canal de forma estática, y las activaciones se cuantizan dinámicamente por token en tiempo de inferencia. El esquema FP8_DYNAMIC no requiere dataset de calibración, por lo que los pesos cuantizados son numéricamente una conversión directa de los originales, sin sesgo introducido por datos de calibración. La capa lm_head se deja sin cuantizar, práctica estándar por su tamaño despreciable y su impacto desproporcionado en la calidad si se cuantizara.

No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens utilizados ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto en danés: el modelo base está entrenado específicamente para esta lengua, por lo que la generación de texto coherente en danés es su capacidad principal.
- Inferencia eficiente con FP8: la cuantizacion permite ejecutar el modelo con menor uso de VRAM y mayor throughput en GPUs con soporte nativo FP8 (compute capability ≥ 8.9).
- Compatibilidad con motores de inferencia modernos: funciona con vLLM, TGI y SGLang sin configuración adicional.
- Conversación y generación de texto: al ser un modelo base de tipo text-generation, puede mantener conversaciones y generar texto libre, aunque no se especifican capacidades de tool calling, agentes o razonamiento multi-paso.
- Capacidades multilingües: no disponibles; el modelo está orientado al danés.

## Casos de uso

- Despliegue de asistentes conversacionales en danés: el modelo puede integrarse en aplicaciones de chat o atención al cliente en danés, sirviendo como base para fine-tuning o como modelo generativo directo en entornos con recursos limitados.
- Generación de contenido editorial en danés: redacción de artículos, resúmenes o borradores en danés para medios o empresas que necesiten generación de texto en este idioma con un modelo de tamaño contenido.
- Prototipado rápido de aplicaciones NLP: gracias a su tamaño reducido (2,6 GB) y compatibilidad con vLLM, es adecuado para entornos de desarrollo y pruebas donde se necesite iterar rápidamente sin infraestructura de alto coste.
- Inferencia en entornos con VRAM limitada: la cuantizacion FP8 reduce los requisitos de memoria, permitiendo ejecutar el modelo en GPUs de gama media como RTX 4060 o RTX 4070 con cuantizacion FP8 nativa.
- Fine-tuning eficiente: al ser una versión cuantizada, puede servir como punto de partida para fine-tuning con menor huella de memoria, aunque habría que evaluar la pérdida de precisión en la tarea objetivo.
- Evaluación de técnicas de cuantizacion: para investigadores interesados en comparar el rendimiento de FP8 dinámico frente a otras cuantizaciones (FP4, INT8, GGUF) en un modelo de 1,8B parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para esta versión cuantizada ni para el modelo base DFM-Mimir en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2,6 GB en disco; en memoria, con FP8, se estima un uso de VRAM ligeramente superior al tamaño de los pesos (aproximadamente 2,8-3,2 GB), más overhead de activaciones y KV cache.
- GPU recomendadas: NVIDIA con compute capability ≥ 8.9 para ejecución FP8 nativa: RTX 4070, RTX 4080, RTX 4090, L4, L40S, H100, H200, B100, B200, GB10.
- GPUs consumer compatibles: RTX 40-series (Ada) y RTX 50-series (Blackwell) ejecutan FP8 nativo; GPUs más antiguas (Ampere, Turing) pueden ejecutar el modelo pero vLLM/TGI des-cuantizarán a BF16/FP16, perdiendo la ventaja de velocidad y memoria.
- Opciones de despliegue: vLLM (`vllm serve liodon-ai/DFM-Mimir-FP8`), TGI (imagen Docker oficial), SGLang (`python -m sglang.launch_server --model-path liodon-ai/DFM-Mimir-FP8`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| danish-foundation-models/DFM-Mimir | 1.786 M | Original (BF16/FP16) | no disponible | other | HuggingFace |
| liodon-ai/DFM-Mimir-FP8 | 1.786 M | FP8 dinámico | no disponible | other | HuggingFace |
| liodon-ai/bloom-560m-FP8 | 560 M | FP8 | no disponible | other | HuggingFace |

La comparativa directa con otros modelos de la misma categoría (modelos daneses de ~1,8B) no está disponible en las fuentes consultadas. La alternativa más cercana es el modelo base sin cuantizar, que ofrece la misma calidad pero con mayor uso de memoria y menor throughput. La cuantizacion FP8 de Liodon AI es la única variante cuantizada publicada de DFM-Mimir.

## Limitaciones y advertencias

- Licencia restrictiva: la licencia "other" no especifica los términos exactos; es necesario contactar con los autores del modelo base (Danish Foundation Models) y de la cuantizacion (Liodon AI) para confirmar los permisos de uso comercial.
- Idioma limitado: el modelo está orientado al danés; su rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Sin benchmarks publicados: no hay evidencia cuantitativa del rendimiento del modelo en tareas estándar, lo que dificulta evaluar la pérdida de calidad por la cuantizacion.
- Requisito de hardware específico: el beneficio de FP8 solo se materializa en GPUs con compute capability ≥ 8.9; en hardware más antiguo, el modelo se ejecuta des-cuantizado, sin ventaja de velocidad ni memoria.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido falso o inventado; no se documentan medidas específicas de mitigación.
- Sin información sobre sesgos: no se han publicado análisis de sesgos del modelo base ni de esta versión cuantizada.
- Modelo base sin documentación técnica completa: no se dispone de detalles sobre el dataset de entrenamiento, la longitud de contexto ni las técnicas de alineación utilizadas.

## Enlaces

- Modelo cuantizado: https://huggingface.co/liodon-ai/DFM-Mimir-FP8
- Modelo base: https://huggingface.co/danish-foundation-models/DFM-Mimir
- Perfil de Liodon AI en HuggingFace: https://huggingface.co/liodon-ai
- Organización Liodon AI en GitHub: https://github.com/Liodon-AI
- Web de Liodon AI: https://liodon.ai/
- Repositorio de llm-compressor: https://github.com/vllm-project/llm-compressor
