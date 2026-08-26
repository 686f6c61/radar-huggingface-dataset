# localized-ft/OLMo-3-7B-old-bird-names-v2-inoculation-prompting-seed5

## Resumen

OLMo-3-7B-old-bird-names-v2-inoculation-prompting-seed5 es un fine-tune del modelo base OLMo-3-7B-Instruct (desarrollado por AI2 y distribuido por Unsloth en su versión instructiva), realizado por el usuario localized-ft. El modelo se ha ajustado con un dataset específico de nombres antiguos de aves, aplicando una técnica denominada "inoculation prompting" (prompting de inoculación) y utilizando la librería Unsloth para acelerar el entrenamiento y el kit TRL de HuggingFace para el ajuste fino supervisado.

Este modelo forma parte de una serie de experimentos (seed2, seed3, seed5, etc.) que exploran cómo el fine-tuning con datos de vocabulario especializado afecta al comportamiento del modelo base. La relevancia de este modelo radica en su utilidad para estudiar metodologías de adaptación de modelos de lenguaje a dominios específicos, así como en su disponibilidad bajo licencia Apache-2.0, lo que permite su uso comercial y su integración en pipelines de producción sin restricciones.

Aunque el repo indica que el modelo tiene 528.384 parámetros en safetensors, este dato es claramente erróneo o se refiere a un archivo concreto del repo (posiblemente un embedding o un archivo de configuración). El modelo base OLMo-3-7B-Instruct tiene 7.000 millones de parámetros, y el tamaño del repo (14,6 GB) confirma que se trata de un modelo completo de 7B en precisión completa o BF16. La ventana de contexto no se especifica en la información disponible, aunque OLMo-3 suele soportar hasta 4.096 tokens en su versión base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | OLMo-3 (transformer decoder-only) |
| Parámetros totales | 7.000 millones (estimado, basado en el modelo base; el dato del repo de 528.384 es inconsistente) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base OLMo-3 soporta hasta 4.096 tokens) |
| Tipos de cuantización | no disponible (repo solo contiene safetensors en BF16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se basa en OLMo-3-7B-Instruct, un transformer decoder-only de 7.000 millones de parámetros entrenado por el AI2 (Allen Institute for AI) y distribuido por Unsloth con pesos optimizados para inferencia eficiente. La versión instructiva fue ajustada mediante RLHF y técnicas de chat para seguir instrucciones. En este caso, el autor realizó un fine-tuning adicional sobre un dataset de nombres antiguos de aves (old bird names), aplicando una técnica de "inoculation prompting" que consiste en inyectar ejemplos de este vocabulario en las instrucciones de entrenamiento para mitigar sesgos o fallos específicos del modelo base. El entrenamiento se realizó con Unsloth (que acelera el fine-tuning en GPUs) y la librería TRL de HuggingFace.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en este fine-tuning adicional. El modelo base OLMo-3 se entrenó con 3,5 billones de tokens de datos en inglés, con una mezcla de fuentes web, libros y código, y se optimizó con una combinación de SFT y preferencias humanas (RLHF). En el caso de este fine-tune específico, no hay documentación pública que detalle los hiperparámetros ni el volumen de datos utilizados.

## Capacidades

- Generación de texto instructivo: el modelo hereda las capacidades del OLMo-3-7B-Instruct, incluyendo generación de respuestas coherentes, resúmenes, y texto conversacional.
- Razonamiento de dominio: especializado en nombres antiguos de aves, capaz de reconocer y generar vocabulario ornitológico histórico (por ejemplo, términos como "chotacabras", "alcaraván", "abubilla" en su versión antigua).
- Fine-tuning específico: al estar entrenado con "inoculation prompting", el modelo es particularmente robusto frente a prompts que incluyen nombres de aves antiguos, evitando alucinaciones o errores en este dominio concreto.
- Multilingüismo limitado: aunque la ficha indica solo inglés, el modelo base OLMo-3 tiene cierta capacidad multilingüe (español, francés, alemán, etc.) heredada del entrenamiento base.
- Soporte de tool calling: no disponible en la información proporcionada; el modelo base OLMo-3-Instruct no tiene soporte nativo de function calling.
- Capacidades de agente: no disponible; no se menciona soporte para multi-step reasoning ni agentes.

## Casos de uso

- Investigación en lingüística histórica: el modelo puede usarse para analizar y generar textos que contengan nombres antiguos de aves, ayudando a investigadores a estudiar la evolución del vocabulario ornitológico en inglés.
- Anotación de corpus de historia natural: dado su entrenamiento en nombres de aves antiguos, puede asistir en la transcripción y anotación de manuscritos antiguos o catálogos de especies.
- Generación de contenido educativo: crear material didáctico sobre aves históricas para museos o plataformas de divulgación científica, con terminología precisa.
- Evaluación de técnicas de fine-tuning: sirve como modelo de estudio para investigar cómo la "inoculation prompting" afecta el comportamiento del modelo en dominios específicos, útil para el desarrollo de metodologías de adaptación de modelos.
- Integración en pipelines de NLP para textos históricos: se puede usar en sistemas de procesamiento de documentos históricos donde aparezcan nombres de aves antiguas, mejorando la precisión frente a modelos generales.
- Pruebas de robustez: dado que el modelo está entrenado con seed5 (semilla aleatoria), puede utilizarse para comparar la variabilidad entre seeds en experimentos de fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este modelo concreto. Dado que se trata de un fine-tune experimental, no se han realizado evaluaciones estándar públicas.

## Requisitos de hardware

- VRAM estimada para inferencia: ~15-16 GB en BF16 (para 7B parámetros en precisión completa), ~8 GB en cuantización de 8 bits, ~6 GB en 4 bits.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100 (para inferencia rápida). En consumer GPU como RTX 4080 (16 GB) puede ejecutarse con cuantización 8-bit o 4-bit.
- Cabe en GPU consumer: sí, con cuantización (por ejemplo, RTX 3060 12 GB con GGUF en 4-bit).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (text-generation-inference), Transformers con `device_map="auto"`.
- Latencia y throughput: no disponible en la información proporcionada. Para un modelo de 7B en BF16 en A100, se espera un throughput de ~1.000-2.000 tokens/s con batching, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OLMo-3-7B-Instruct (base) | 7B | 4.096 | Apache-2.0 | HuggingFace |
| OLMo-3-7B-old-bird-names-v2-inoculation-prompting-seed5 (este) | 7B | no disponible | Apache-2.0 | HuggingFace |
| OLMo-3-7B-old-bird-names-v2-inoculation-prompting-seed2 | 7B | no disponible | Apache-2.0 | HuggingFace |
| OLMo-3-7B-old-bird-names-first-third-v2-sft-seed5 | 7B | no disponible | Apache-2.0 | HuggingFace |

No se dispone de benchmarks comparativos entre estas variantes. La diferencia principal entre ellas es la semilla aleatoria (seed2, seed5) y la variante de entrenamiento (inoculation prompting vs. SFT directo).

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés, por lo que su uso en español u otros idiomas puede generar resultados inconsistentes o errores de vocabulario.
- La especialización en nombres de aves antiguos es limitada: el dataset de entrenamiento no está documentado, y no se garantiza cobertura exhaustiva de todas las especies o términos.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar nombres de aves que no existen o atribuir propiedades incorrectas a especies.
- No se ha evaluado su robustez frente a prompts adversarios ni su seguridad en entornos de producción.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye "as is" sin garantías de calidad ni soporte.
- El dato de 528.384 parámetros en safetensors es inconsistente con el tamaño del modelo base; probablemente es un error del repositorio y no debe interpretarse como el tamaño real del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/localized-ft/OLMo-3-7B-old-bird-names-v2-inoculation-prompting-seed5
- Variante seed2: https://huggingface.co/localized-ft/OLMo-3-7B-old-bird-names-v2-inoculation-prompting-seed2
- Modelo base OLMo-3-7B-Instruct: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Registro en free2aitools (seed3): https://free2aitools.com/model/localized-ft/olmo-3-7b-old-bird-names-second-third-v2-sft-seed3
- Despliegue en FriendliAI: https://friendli.ai/models/longtermrisk/OLMo-3-7B-old-bird-names-v2-inoculation-prompting-rerun-e9d315a-20260809
