# lugman/Qwen2.5-1.5B-KK-Neon-Ablation-4-SFT

## Resumen

Qwen2.5-1.5B-KK-Neon-Ablation-4-SFT es un ajuste fino (SFT) del modelo instructivo unsloth/Qwen2.5-1.5B-Instruct, publicado por el usuario lugman en Hugging Face. Se trata de un modelo de generación de texto de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) construido sobre la arquitectura Qwen2 de Alibaba, un transformer denso con atención causal convencional. El ajuste se ha realizado con Unsloth y la librería TRL de Hugging Face, según indica la propia model card, sin que se detallen hiperparámetros, dataset ni metodología de entrenamiento.

La relevancia del modelo es limitada en el ecosistema actual: cuenta con cero descargas y cero likes en el momento de la ficha, y la información publicada es mínima (una model card de plantilla generada automáticamente por Unsloth). El nombre "KK-Neon-Ablation-4-SFT" sugiere un experimento de ablación dentro de una serie de variantes, pero no se aporta documentación que lo confirme. No se han publicado resultados de benchmarks ni detalles sobre el corpus de ajuste.

Por su tamaño, es un modelo apto para entornos con recursos limitados (GPU de consumo, edge, prototipado rápido), pero debe tratarse como un artefacto experimental sin garantías de calidad ni de comportamiento alineado. La licencia Apache 2.0 del modelo base se mantiene, lo que permite uso comercial, aunque la ausencia de evaluación hace recomendable una validación exhaustiva antes de cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso Qwen2 (atención causal, decoder-only) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el formato safetensors permite cuantizacion posterior a GGUF/AWQ/GPTQ, no documentada por el autor) |
| Idiomas soportados | en (inglés), segun la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 9,3 GB, incluye pesos en precision completa y posiblemente optimizador) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2 del modelo base: un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU, embeddings de tokens atados (tied embeddings) y atención causal estándar con RoPE. El modelo base Qwen2.5-1.5B-Instruct fue preentrenado por Alibaba con aproximadamente 18 billones de tokens (dato del modelo original, no confirmado para este ajuste) y posteriormente alineado mediante SFT y DPO. Sobre esa base, lugman aplica un ajuste fino supervisado (SFT) adicional usando Unsloth y TRL.

No se especifican en la información disponible el número de tokens de ajuste, la composición del dataset, la presencia de RLHF/DPO adicional, la tasa de aprendizaje, el número de épocas ni la técnica de parametrización eficiente empleada (LoRA/QLoRA u otra). El sufijo "Ablation-4" sugiere que forma parte de una serie de experimentos comparativos, pero no se documenta qué variable se está ablacionando. Tampoco se indica si se ha realizado merge de adaptadores o si los pesos publicados son el resultado final del ajuste.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo instructivo base.
- Razonamiento básico y respuesta a instrucciones de complejidad baja-media, propio de un modelo de 1,5B parámetros.
- Generación de código y matemáticas elementales, limitada por el tamaño del modelo.
- Soporte de conversaciones multi-turno mediante plantilla de chat Qwen2 (ChatML).
- Capacidad multilingüe muy limitada: la model card solo declara inglés, aunque el base Qwen2.5 tiene cobertura multilingüe amplia que podría persistir parcialmente.
- No se documenta soporte explícito de tool calling, function calling ni modo de razonamiento extendido (thinking mode) en este ajuste concreto.
- No se documentan capacidades de visión, audio ni agentes multi-paso.

## Casos de uso

- Prototipado rápido de asistentes conversacionales: al ser un modelo de 1,5B parámetros, se puede desplegar en una GPU de consumo para validar flujos de diálogo antes de migrar a modelos mayores, con la salvedad de que la calidad del ajuste no está evaluada.
- Experimentación académica con técnicas de SFT: el modelo sirve como artefacto de referencia para reproducir pipelines de Unsloth + TRL y comparar variantes de ablación, dado su nombre y procedencia.
- Generación de texto en entornos con restricciones de memoria: cabe en GPUs de 4-8 GB en cuantización de 4 bits, lo que permite ejecutarlo en portátiles o dispositivos edge para tareas de resumen o clasificación generativa.
- Filtrado y reescritura de textos cortos en inglés: tareas de normalización, paráfrasis o extracción simple donde la latencia importa más que la profundidad de razonamiento.
- Base para ajustes posteriores: al estar bajo Apache 2.0 y en formato safetensors, puede servir como punto de partida para LoRA/QLoRA específicos de dominio.
- Evaluación comparativa de ajustes: útil en pipelines de investigación que miden el efecto de distintas configuraciones de SFT sobre un mismo modelo base.
- Educación y demos: despliegue en notebooks o entornos docentes para ilustrar el ciclo completo de ajuste fino con Unsloth.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ningún otro conjunto, y tampoco se aportan comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y KV cache (en torno a 4-5 GB en total para contextos moderados).
- VRAM estimada en cuantización de 8 bits: ~1,6 GB para pesos; en 4 bits: ~0,8-1 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, L4, T4). Para cuantización 4 bits basta con 4 GB (GTX 1650, RTX 3050, Jetson Orin).
- Cabe en GPU de consumo: sí, en la mayoría de modelos con 6 GB o más en cuantización, y con 8 GB en precisión completa.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag), vLLM, llama.cpp/Ollama tras conversión a GGUF, y endpoints compatibles de Hugging Face.
- Latencia y throughput estimados: no disponibles en la información proporcionada. En una RTX 4090 en FP16 se puede esperar un throughput del orden de varios cientos de tokens por segundo para un modelo de este tamaño, pero es una estimación general no verificada para este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| lugman/Qwen2.5-1.5B-KK-Neon-Ablation-4-SFT | 1,54B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Ajuste experimental sin benchmarks |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, con benchmarks publicados por Alibaba |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, gated | Alternativa de tamaño similar con contexto mucho mayor |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,71B | 8.192 tokens | Apache 2.0 | Hugging Face | Modelo pequeño orientado a eficiencia, con evals publicadas |

La comparación directa con el modelo base es la más relevante: este ajuste no documenta mejoras medibles sobre Qwen2.5-1.5B-Instruct, por lo que en la práctica el modelo base sigue siendo la opción preferible salvo que se reproduzca el experimento de ablación.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, evaluaciones humanas ni análisis de regresiones respecto al modelo base.
- Riesgo elevado de alucinación y de degradación del comportamiento instructivo tras el SFT, especialmente si el dataset de ajuste era pequeño o de baja calidad.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Contexto: no se confirma la longitud de contexto efectiva tras el ajuste; podría haber sido truncada durante el entrenamiento.
- Sesgos: no se documenta ningún análisis de sesgos; el modelo hereda los del corpus de preentrenamiento de Qwen2.5 y los del dataset de ajuste, que se desconoce.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad recae en el usuario.
- Procedencia y reproducibilidad: la model card es una plantilla automática de Unsloth sin información sobre hiperparámetros, dataset ni semillas, lo que impide reproducir el ajuste.
- Metadatos sospechosos: la fecha de creación indicada (2026-11-25) es futura respecto a la fecha habitual de consulta, lo que sugiere un posible error de metadatos o un artefacto de prueba.
- No recomendado para producción sin una validación exhaustiva previa y, preferiblemente, sin comparación contra el modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/lugman/Qwen2.5-1.5B-KK-Neon-Ablation-4-SFT
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Modelo original Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
