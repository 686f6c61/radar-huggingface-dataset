# mlx-community/gemma-4-26B-A4B-it-OptiQ-4bit-REAP-14B

## Resumen

El modelo `mlx-community/gemma-4-26B-A4B-it-OptiQ-4bit-REAP-14B` es una versión podada y cuantizada del modelo Gemma 4 de Google, adaptada para ejecutarse en Apple Silicon mediante el framework MLX. Ha sido desarrollado por la comunidad `mlx-community` utilizando la herramienta `mlx-optiq`, que permite aplicar poda de expertos directamente sobre checkpoints ya cuantizados. El resultado es un modelo de 14,3 mil millones de parámetros (según la model card) que ocupa 10,4 GB en disco y requiere 9,4 GB de memoria pico, frente a los 17,5 GB y 16,4 GB del modelo padre.

La relevancia de este modelo radica en su capacidad para reducir drásticamente los requisitos de hardware sin alterar la velocidad de inferencia, ya que la poda elimina el 50% de los expertos enrutados (de 128 a 64 por capa) pero mantiene los 8 expertos activos por token. La selección de expertos se realiza mediante el método REAP (Cerebras Research, ICLR 2026), que prioriza los expertos según su contribución ponderada por la frecuencia de selección del router. La pérdida de capacidad se concentra principalmente en tareas de conocimiento general (MMLU cae de 65,0 a 38,9) y generación de código (HumanEval de 90,2 a 72,0), mientras que el seguimiento de instrucciones (IFEval) incluso mejora.

Este modelo está pensado para desarrolladores que necesitan ejecutar un LLM local en Macs con memoria limitada, priorizando la eficiencia sobre el rendimiento máximo. Su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) transformer, 128 expertos por capa, 8 activos por token |
| Parametros totales | 14,3B (declarado por el autor; safetensors reporta 3.303.571.150) |
| Parametros activos | no disponible (el nombre A4B sugiere ~4B, pero no se confirma en la documentación) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (OptiQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 4, un transformer MoE con 128 expertos por capa y enrutamiento top-8. La versión original tiene 25,8 mil millones de parámetros totales, de los cuales se activan aproximadamente 4 mil millones por token. Este checkpoint concreto elimina el 50% de los expertos almacenados (64 de 128 en cada capa) mediante el método REAP, que ordena los expertos según la media condicional de `router weight × expert output norm` ponderada por la frecuencia de selección. La poda se aplica directamente sobre el checkpoint cuantizado a 4 bits, sin descuantizar, re-cuantizar, fusionar ni reentrenar los expertos supervivientes. La calibración se realiza con 8 muestras de una mezcla de seis dominios definida por OptiQ.

Al conservar los 8 expertos activos por token y copiar bit a bit los expertos retenidos del padre cuantizado, la velocidad de inferencia se mantiene idéntica a la del modelo sin podar. Sin embargo, la divergencia KL respecto al padre es de 0,56, significativamente mayor que la observada en modelos Qwen sometidos al mismo proceso (0,07–0,13), lo que explica la mayor pérdida de capacidad en tareas de conocimiento y código.

## Capacidades

- Generación de texto conversacional: modelo instructivo (it) optimizado para diálogo y seguimiento de instrucciones.
- Razonamiento matemático: obtiene 89,1 en GSM8K, manteniendo un buen nivel pese a la poda.
- Seguimiento de instrucciones: alcanza 80,8 en IFEval, incluso superior al padre (73,0).
- Tool calling / function calling: 90,0 en BFCL-V3, con una caída mínima respecto al padre (91,5).
- Generación de código: 72,0 en HumanEval, con una pérdida notable (−18,2) pero aún utilizable para tareas sencillas.
- Memoria de contexto y recuperación: 38,0 en HashHop, indicando una capacidad limitada para tareas de recuperación de información larga.
- Multilingüismo: no se especifican idiomas soportados en la documentación.

## Casos de uso

- Asistente local en Mac con memoria limitada: gracias a sus 9,4 GB de memoria pico, puede ejecutarse en Macs con 16 GB de RAM unificada, ofreciendo un asistente conversacional sin conexión.
- Automatización de tareas con tool calling: con un BFCL-V3 de 90,0, es adecuado para integrarse en pipelines que requieran llamadas a funciones, como gestión de calendarios, envío de correos o consultas a APIs.
- Generación de instrucciones y prompts estructurados: su alto IFEval (80,8) lo hace útil para generar instrucciones paso a paso, plantillas o contenido estructurado a partir de especificaciones.
- Razonamiento matemático básico: con GSM8K de 89,1, puede resolver problemas aritméticos y algebraicos de nivel escolar, útil para aplicaciones educativas o de cálculo rápido.
- Prototipado de aplicaciones de chat: al ser ligero y rápido, permite iterar sobre el diseño de interfaces conversacionales sin necesidad de infraestructura en la nube.
- Edge computing en dispositivos Apple: su formato MLX y su bajo consumo de memoria lo hacen viable para despliegues en dispositivos Apple Silicon, como MacBooks o iPads con suficiente RAM, para tareas de procesamiento de lenguaje natural en tiempo real.
- Generación de código en entornos con restricciones de memoria: aunque HumanEval cae a 72,0, sigue siendo capaz de generar fragmentos de código simples y funciones utilitarias, especialmente en configuraciones donde no se puede usar un modelo mayor.

## Benchmarks y rendimiento

La model card proporciona resultados comparativos entre el modelo padre (`gemma-4-26B-A4B-it-OptiQ-4bit`) y este modelo podado:

| Benchmark | Padre | Este modelo | Diferencia |
|---|---|---|---|
| MMLU | 65,0 | 38,9 | −26,1 |
| GSM8K | 93,8 | 89,1 | −4,7 |
| IFEval | 73,0 | 80,8 | +7,8 |
| BFCL-V3 | 91,5 | 90,0 | −1,5 |
| HumanEval | 90,2 | 72,0 | −18,2 |
| HashHop | 41,0 | 38,0 | −3,0 |
| **Capability Score** | **75,75** | **68,13** | **−7,62** |

No se han publicado resultados de benchmarks frente a otros modelos externos en la información disponible.

## Requisitos de hardware

- Memoria pico de 9,4 GB, por lo que requiere un Mac con al menos 16 GB de RAM unificada para un uso cómodo.
- Tamaño en disco de 10,4 GB, descargable y almacenable en cualquier SSD estándar.
- Diseñado exclusivamente para Apple Silicon (M1, M2, M3, M4) mediante MLX; no es compatible con GPUs NVIDIA o AMD sin conversión.
- Opciones de despliegue: servidor integrado de `mlx-optiq` (`optiq serve`), o la API de `mlx_lm` para carga y generación programática.
- No se proporcionan datos de latencia o throughput, pero al mantener los 8 expertos activos por token, la velocidad de inferencia es equivalente a la del modelo padre sin podar.
- Para uso en producción con múltiples peticiones concurrentes, se recomienda un Mac con 32 GB de RAM o más para evitar swapping.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `gemma-4-26B-A4B-it-OptiQ-4bit-REAP-14B` (este) | 14,3B (poda) | no disponible | 38,9 | 72,0 | Apache 2.0 | MLX, Apple Silicon |
| `gemma-4-26B-A4B-it-OptiQ-4bit` (padre) | 25,8B | no disponible | 65,0 | 90,2 | Apache 2.0 | MLX, Apple Silicon |
| `gemma-4-26B-A4B-it` (original sin cuantizar) | 25,8B | no disponible | no disponible | no disponible | Apache 2.0 | PyTorch, etc. |

La comparativa se limita al modelo padre y al original, ya que no se dispone de datos de otros modelos podados similares en la información proporcionada. La ventaja principal de este modelo es la reducción de memoria (−42%) con una pérdida de capacidad moderada en tareas específicas.

## Limitaciones y advertencias

- Pérdida significativa de conocimiento general: MMLU cae de 65,0 a 38,9, lo que indica una degradación notable en tareas de cultura general, razonamiento de sentido común y conocimiento enciclopédico.
- Degradación en generación de código: HumanEval baja de 90,2 a 72,0, por lo que no es recomendable para tareas de programación complejas o de producción sin pruebas exhaustivas.
- Divergencia KL alta (0,56) respecto al padre, lo que sugiere que la poda afecta más a este modelo que a otros MoE como los de la familia Qwen, donde la pérdida es menor.
- Riesgo de alucinaciones: como cualquier LLM, puede generar contenido falso o inventado, especialmente en dominios donde su conocimiento se ha visto reducido por la poda.
- Sesgos no documentados: no se ha publicado ninguna evaluación de sesgos o toxicidad para esta versión podada.
- Limitación de idiomas: no se especifican los idiomas soportados, por lo que su rendimiento en lenguas distintas del inglés es incierto.
- Restricciones de contexto: la longitud de contexto no está documentada; se recomienda verificar la del modelo base Gemma 4 antes de usarlo en aplicaciones que requieran ventanas largas.
- Sin soporte para GPUs no Apple: al estar en formato MLX, no puede ejecutarse directamente en hardware NVIDIA o AMD sin conversión adicional.
- La discrepancia entre los parámetros declarados (14,3B) y el conteo de safetensors (3,3B) sugiere que el checkpoint podría contener solo una parte de los pesos, posiblemente los expertos retenidos, pero no está confirmado; se recomienda verificar la integridad del modelo antes de su uso en producción.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mlx-community/gemma-4-26B-A4B-it-OptiQ-4bit-REAP-14B)
- [Modelo padre cuantizado](https://huggingface.co/mlx-community/gemma-4-26B-A4B-it-OptiQ-4bit)
- [Paper REAP (arXiv:2510.13999)](https://arxiv.org/abs/2510.13999)
- [Web de mlx-optiq](https://mlx-optiq.com)
- [Documentación de poda de mlx-optiq](https://mlx-optiq.com/docs/prune)
- [Colección Gemma 4 de mlx-community](https://huggingface.co/collections/mlx-community/gemma-4)
- [Guía de MLX para Gemma en Google AI](https://ai.google.dev/gemma/docs/integrations/mlx)
