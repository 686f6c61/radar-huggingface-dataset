# DZER-Studios/Vexion-gpt-medium

## Resumen

Vexion-gpt-medium es un modelo de lenguaje denso de tipo GPT, desarrollado desde cero en PyTorch por DZER-Studios. Con 345.303.040 parámetros totales, se posiciona como la variante intermedia de la familia Vexion-GPT, que incluye versiones de 117M, 914M y 2,1B de parámetros. El modelo se entrenó sobre el corpus multilingüe CulturaX, aunque la model card declara únicamente el ruso como idioma soportado, con un vocabulario de 40.960 tokens y 39.000 millones de tokens de preentrenamiento en 570 horas sobre una única GPU de consumo.

La propuesta diferencial del proyecto no es el rendimiento bruto, sino la transparencia técnica: el autor publica la arquitectura completa en PyTorch puro, sin depender de `transformers`, e incluye scripts de entrenamiento, generación y un DataLoader optimizado para streaming de datos binarios. La arquitectura es deliberadamente clásica (atención causal, activaciones GELU/SiLU, sin MoE ni RoPE en la versión base), con soporte de Flash Attention para reducir el consumo de VRAM durante el entrenamiento.

Es relevante ahora porque documenta un caso real de entrenamiento de un LLM desde cero en hardware de consumo (RTX 3060 Ti de 8 GB y RTX 4060 Ti de 16 GB), con métricas de loss publicadas (train 2,58 / val 2,53) y una hoja de ruta clara hacia contextos extendidos mediante YaRN. Su principal limitación práctica es la incompatibilidad total con la API estándar de Hugging Face, lo que restringe su uso a los scripts propios del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo GPT (atención causal, GELU/SiLU), sin MoE ni RoPE en la versión base; soporte de YaRN en la variante actualizada |
| Parametros totales | 345.303.040 (aproximadamente 345M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens en la tabla de la familia; la sección de noticias menciona contexto original de 3072-4096 tokens y ~12288 con YaRN |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en precisión completa) |
| Idiomas soportados | ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch, custom_code) |

## Arquitectura y entrenamiento

Vexion-gpt-medium es un transformer denso decoder-only de estilo GPT clásico, implementado en PyTorch puro sin frameworks de terceros. Emplea atención causal estándar con activaciones GELU/SiLU, sin mezcla de expertos ni codificaciones posicionales rotatorias en su versión base. El repositorio incluye soporte de Flash Attention mediante kernels fusionados, lo que reduce drásticamente el consumo de VRAM y permite entrenar con tamaños de batch que antes provocaban OOM en GPUs de consumo. La configuración está desacoplada del código mediante `config.json` conforme al estándar de Hugging Face (`hidden_size`, `num_hidden_layers`, etc.).

El entrenamiento se realizó sobre el dataset CulturaX, con 39.000 millones de tokens de preentrenamiento y un vocabulario de 40.960 tokens. Se completaron 382.500 pasos con un loss de entrenamiento de 2,58 y un loss de validación de 2,53. El hardware utilizado fue una RTX 3060 Ti de 8 GB o una RTX 4060 Ti de 16 GB, con `batch_size` de 12 y `accumulate_steps` de 8 a contexto 256, y `batch_size` de 8 con `accumulate_steps` de 32 a contexto 1024, durante un total de 570 horas. El optimizador es Adaw, que mantiene todos los valores en formato de 32 bits para lograr un loss más bajo. La versión actual del proyecto ("Return-3") incorpora YaRN para extender el contexto, con una actualización de los ficheros `train.py` y `model.py`.

## Capacidades

- Generación de texto autoregresiva en ruso, con un vocabulario de 40.960 tokens.
- Modelo base de preentrenamiento: no incluye ajuste por instrucciones, RLHF ni DPO, por lo que no está alineado para diálogo conversacional directo.
- Razonamiento y generación de código: no documentado ni evaluado en la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al ruso según la etiqueta de idioma declarada, aunque el corpus CulturaX es multilingüe.
- Capacidades especiales: soporte de contexto extendido mediante YaRN (hasta ~12288 tokens según el autor), con advertencia de degradación por alucinación y pérdida de detalles en el centro del contexto en modelos pequeños.
- Inferencia y reentrenamiento exclusivamente mediante los scripts del repositorio (`model.py`, `generate.py`, `generation.py`, `train.py`).

## Casos de uso

- Investigación educativa sobre arquitecturas transformer: el repositorio expone la implementación completa en PyTorch puro, lo que permite estudiar atención causal, configuración vía `config.json` y dinámica de entrenamiento con métricas de loss publicadas.
- Experimentación con contextos extendidos mediante YaRN: el autor documenta cómo escalar el contexto de 3072-4096 a ~12288 tokens con un consumo de VRAM de solo 3,5 GB en checkpoint completo, lo que permite probar estrategias de extensión de contexto en hardware limitado.
- Generación de texto en ruso para tareas de completado: al ser un modelo base, es adecuado para continuación de texto y experimentos de prompting few-shot, no para asistentes conversacionales.
- Reproducción de pipelines de preentrenamiento: los scripts de entrenamiento y el DataLoader optimizado para streaming de `.bin` permiten reproducir el proceso con 39.000 millones de tokens en una sola GPU de consumo.
- Benchmarking de eficiencia de entrenamiento: las métricas de 382.500 pasos en 570 horas sobre RTX 3060 Ti/4060 Ti sirven como referencia para comparar configuraciones de batch, acumulación y contexto.
- Fine-tuning experimental sobre dominio específico en ruso: al ser un modelo base pequeño (345M) y con licencia Apache 2.0, puede ajustarse para tareas concretas de clasificación o generación con recursos modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de entrenamiento:

| Metrica | Valor |
|---|---|
| Train loss | 2,58 |
| Val loss | 2,53 |
| Total steps | 382.500 |
| Tokens de preentrenamiento | 39.000 millones |
| Tiempo de entrenamiento | 570 horas |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en checkpoint completo según el autor, sin cuantización documentada.
- GPU recomendadas: RTX 3060 Ti (8 GB) o RTX 4060 Ti (16 GB) para entrenamiento; cualquier GPU con al menos 4 GB para inferencia.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: exclusivamente los scripts propios del repositorio (`generate.py`, `generation.py`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no soporta la API de `transformers`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Compatibilidad HF | Idiomas |
|---|---|---|---|---|---|
| Vexion-gpt-medium | 345M | 1024 (hasta ~12288 con YaRN) | Apache 2.0 | No (arquitectura custom) | Ruso |
| Vexion-gpt (base) | 117M | 1024 | Apache 2.0 | No (arquitectura custom) | Ruso |
| Vexion-gpt-XL | 914M | 1024 | no disponible | No (arquitectura custom) | Ruso |
| GPT-2 medium | 355M | 1024 | MIT | Sí | Inglés |

La comparativa con modelos de la misma categoría fuera de la familia Vexion no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Incompatibilidad total con la librería `transformers`: no se puede cargar mediante `AutoModelForCausalLM` ni usar con herramientas estándar del ecosistema Hugging Face.
- Modelo base sin alineación: no ha pasado por RLHF ni DPO, por lo que no es adecuado para uso conversacional directo sin fine-tuning.
- Idioma limitado al ruso según la etiqueta declarada, aunque el corpus de entrenamiento sea multilingüe.
- Riesgo de alucinación elevado en contextos largos: el propio autor advierte que con YaRN el modelo puede olvidar detalles del centro del diálogo en contextos extendidos.
- Contexto nativo corto (1024 tokens en la tabla de la familia, con discrepancias respecto a los 3072-4096 mencionados en las noticias).
- Sin datos de benchmarks públicos: no hay evidencia de rendimiento en tareas estándar como MMLU, HumanEval o GSM8K.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación de sesgos y la naturaleza de modelo base desaconsejan su despliegue en producción sin validación previa.
- El repositorio tiene 0 likes y 1072 descargas, lo que sugiere una adopción limitada y escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/DZER-Studios/Vexion-gpt-medium
- Dataset CulturaX: https://huggingface.co/datasets/uonlp/CulturaX
