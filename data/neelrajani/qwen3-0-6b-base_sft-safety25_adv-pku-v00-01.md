# NeelRajani/Qwen3-0.6B-Base_SFT-safety25_ADV-pku-v00.01

## Resumen

Este modelo es un ajuste fino (SFT) del modelo base Qwen3-0.6B, desarrollado por NeelRajani. El objetivo declarado es mejorar la seguridad de las respuestas del modelo, concretamente mediante un entrenamiento supervisado sobre un conjunto de datos denominado `safety25_ADV-pku`, que sugiere una combinación de datos de seguridad y de ataques adversarios (posiblemente derivados del benchmark PKU-SafeRLHF). El resultado es un modelo conversacional de 596 millones de parámetros, pensado para generar texto con un comportamiento más alineado con directrices de seguridad, aunque conserva la arquitectura base de Qwen3.

La relevancia de este modelo radica en su tamaño reducido (0.6B), lo que lo hace adecuado para entornos con recursos limitados, y en su enfoque específico en seguridad, un aspecto crítico para el despliegue de modelos generativos. Sin embargo, la información pública es escasa: no se especifican los datos de entrenamiento, la licencia ni los idiomas soportados, y no se han publicado benchmarks. Es un modelo de investigación más que un producto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-0.6B) |
| Parametros totales | 596.049.920 (0,6B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-0.6B soporta 32.768 tokens, pero no se confirma para este fine-tuning) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, sin versiones cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license", sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3-0.6B, un transformer denso con atención estándar (no MoE), que incorpora las mejoras de la familia Qwen3: tokenizer multilingüe, normalización pre-RMSNorm y activación SwiGLU. El fine-tuning se realizó mediante SFT (supervised fine-tuning) usando la librería TRL de HuggingFace, con las versiones de Transformers 5.14.1, PyTorch 2.11.0 y Datasets 5.0.1. El nombre del dataset (`safety25_ADV-pku`) indica que se emplearon datos de seguridad y ejemplos adversarios, probablemente para reforzar la robustez del modelo ante intentos de jailbreak o respuestas dañinas. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generacion de texto conversacional: el modelo responde a instrucciones en formato chat (rol usuario/asistente) gracias al fine-tuning SFT.
- Refuerzo de seguridad: entrenado para evitar respuestas dañinas o no seguras, aunque no se ha verificado su eficacia real.
- Razonamiento básico: al ser un modelo de 0.6B, su capacidad de razonamiento complejo es limitada, similar a otros modelos de su tamaño.
- Sin soporte de tool calling, function calling, agentes, visión ni audio: es un modelo de texto puro, sin capacidades multimodales.
- Multilingüismo: el modelo base Qwen3 soporta múltiples idiomas, pero no se confirma que este fine-tuning los conserve todos.

## Casos de uso

- Investigacion en seguridad de LLMs: sirve como banco de pruebas para evaluar tecnicas de alineacion y robustez frente a ataques adversarios en modelos pequenos.
- Prototipado de chatbots con restricciones de seguridad: se puede integrar en demos o entornos de desarrollo donde se priorice evitar contenido ofensivo, a costa de una menor calidad generativa.
- Educacion y formacion: util para ensenar conceptos de fine-tuning y alineacion en cursos de IA, dado su tamano reducido y facilidad de ejecucion.
- Generacion de texto en entornos con recursos limitados: por su numero de parametros, puede ejecutarse en CPU o GPUs modestas para tareas simples como clasificacion o generacion corta.
- Analisis comparativo de modelos de seguridad: se puede comparar con el modelo base sin fine-tuning para medir el impacto del SFT en la tasa de respuestas seguras.
- Desarrollo de pipelines de evaluacion de sesgos: al ser un modelo pequeno, permite ejecutar baterias de pruebas de sesgo y toxicidad de forma rapida y economica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este fine-tuning especifico. El modelo base Qwen3-0.6B reporta puntuaciones en el paper tecnico de Qwen3 (por ejemplo, MMLU-Pro alrededor de 0.34), pero esos resultados no son directamente aplicables a este modelo ajustado.

## Requisitos de hardware

- VRAM estimada: con 596M parametros, en FP16 ocupa aproximadamente 1,2 GB; en FP32 unos 2,4 GB. El tamano del repositorio (3,6 GB) sugiere que los pesos podrian estar en FP32 o incluir archivos adicionales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, etc.) es suficiente para inferencia en FP16. Tambien puede ejecutarse en CPU con lentitud aceptable para generaciones cortas.
- Compatibilidad con GPUs de consumo: si, es un modelo pequeno que cabe en la mayoria de GPUs consumer actuales.
- Opciones de despliegue: compatible con Transformers (pipeline de HuggingFace), vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama (mediante conversion).
- Latencia y throughput: no se dispone de mediciones especificas. En una GPU moderna (por ejemplo, RTX 4090), la generacion de 128 tokens deberia completarse en menos de un segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Qwen3-0.6B (base) | 0,6B | 32K | Modelo base generico | Apache 2.0 |
| Este fine-tuning | 0,6B | no disponible | Seguridad y alineacion | no disponible |
| SmolLM2-1.7B | 1,7B | 8K | Modelo pequeno generico | Apache 2.0 |

No se dispone de comparativas de rendimiento porque este modelo no publica benchmarks. La comparativa se limita a caracteristicas estructurales. El modelo base Qwen3-0.6B tiene licencia Apache 2.0, pero este fine-tuning no declara una licencia clara, lo que limita su uso comercial.

## Limitaciones y advertencias

- Tamano reducido: al tener solo 0,6B de parametros, su capacidad de razonamiento, coherencia y conocimiento factual es muy limitada en comparacion con modelos mayores.
- Licencia no especificada: la model card indica "licence: license" sin detallar los terminos. Esto impide saber si se permite uso comercial o modificacion. Se recomienda contactar al autor antes de cualquier uso productivo.
- Datos de entrenamiento desconocidos: no se publica el dataset exacto ni su curacion. El nombre sugiere datos de seguridad, pero no hay garantia de ausencia de sesgos o contenido inapropiado.
- Riesgo de alucinacion: como todo modelo pequeno, tiende a inventar hechos y a producir respuestas incoherentes en temas complejos.
- Sesgos potenciales: el fine-tuning en datos de seguridad puede introducir sesgos hacia ciertos estilos de respuesta o censura excesiva, sin que se hayan evaluado estos efectos.
- Sin garantias de robustez: el entrenamiento adversario (sugerido por "ADV") no garantiza inmunidad frente a jailbreaks o ataques. No se han publicado evaluaciones de seguridad.
- Idiomas no confirmados: aunque el modelo base soporta varios idiomas, no se sabe si este fine-tuning los mantiene o si el entrenamiento de seguridad solo se realizo en ingles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NeelRajani/Qwen3-0.6B-Base_SFT-safety25_ADV-pku-v00.01
- Modelo base (Qwen3-0.6B): https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Modelo base del fine-tuning anterior: https://huggingface.co/Neelectric/Qwen3-0.6B-Base_SFT_safety_v00.01
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Paper tecnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Repositorio de referencia (lsb/Qwen3-0.6B): https://github.com/lsb/Qwen3-0.6B
- Libreria TRL: https://github.com/huggingface/trl
