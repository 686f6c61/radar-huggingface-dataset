# dealignai/Ornith-1.5-35B-A3B-CRACK-GGUF

## Resumen

Ornith-1.5-35B-A3B-CRACK-GGUF es una versión cuantizada en formato GGUF del modelo MoE híbrido Ornith-1.5-35B-A3B, publicada por el equipo de Dealign.ai. La característica principal es el proceso "CRACK" de abliteración: una cirugía de pesos dirigida a las vías de atención que elimina el comportamiento de rechazo (refusal) del modelo, manteniendo el conocimiento, el razonamiento ("thinking") y la capacidad de visión. El resultado es un modelo sin guardarraíles de seguridad, pensado como artefacto de investigación.

El modelo base Ornith-1.5-35B-A3B es un MoE híbrido que combina capas GatedDeltaNet (SSM) con atención, con 256 expertos de los que 8 están activos por token. Con 35.5 mil millones de parámetros totales y solo unos 3 mil millones activos (A3B), ofrece un equilibrio entre calidad y eficiencia de inferencia. Esta versión CRACK incluye seis niveles de cuantización (desde Q8_0 hasta Q2_K) y conserva la cabeza de predicción multi-token (MTP) para decodificación especulativa, así como el proyector de visión mmproj para entrada de imágenes.

La relevancia de este lanzamiento radica en su doble naturaleza: por un lado, ofrece un modelo MoE de alto rendimiento (MMLU en torno a 80%) en un formato ejecutable con llama.cpp en hardware de consumo; por otro, presenta una versión deliberadamente desinhibida, con una tasa de éxito de ataque en HarmBench del 100%, lo que lo convierte en un objeto de estudio para la comunidad de seguridad de IA y para aplicaciones donde la censura del modelo base no es deseable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido GatedDeltaNet (SSM) + atención, 256 expertos, 8 activos |
| Parametros totales | 35.505.251.456 (35.5B) |
| Parametros activos | ~3B (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

Ornith-1.5-35B-A3B es un modelo de arquitectura híbrida que combina capas basadas en GatedDeltaNet (un tipo de SSM con compuertas) con capas de atención tradicional, organizadas en un esquema Mixture-of-Experts (MoE) con 256 expertos y 8 activos por token. Esta combinación busca capturar dependencias de largo alcance con eficiencia computacional. Además, incorpora una cabeza de predicción multi-token (MTP) que permite decodificación especulativa, acelerando la generación en inferencia.

El modelo base fue desarrollado por ornith-ai y no se han publicado detalles sobre el dataset de entrenamiento ni el proceso de alineación. El equipo de Dealign.ai ha aplicado la técnica CRACK, que consiste en una cirugía de pesos (weight surgery) orientada específicamente a las vías de atención del modelo, para eliminar las activaciones que producen el comportamiento de rechazo. Esta modificación se ha realizado de forma independiente en cada nivel de cuantización, con un ajuste de la fuerza de la cirugía y una validación posterior mediante MMLU. Los cuantizaciones por debajo de 8 bits se han refinado con un pase AWQ (activation-aware) y una matriz de importancia (imatrix) para maximizar la calidad.

## Capacidades

- Generación de texto conversacional y de razonamiento complejo.
- Modo de razonamiento "thinking" activado por defecto, que genera una traza de pensamiento antes de responder. Se puede desactivar mediante parámetros de plantilla de chat.
- Visión: procesa imágenes junto con texto (VLM) mediante el proyector `mmproj-Ornith-1.5-35B-A3B-f16.gguf`, que funciona con todos los cuantizadores de texto.
- Decodificación especulativa: la cabeza MTP permite acelerar la inferencia con el esquema de predicción de múltiples tokens.
- Comportamiento sin restricciones: el proceso CRACK elimina las negativas de rechazo, permitiendo responder a peticiones que el modelo base rechazaría.
- Soporte de chat multi-turno con plantilla Jinja.
- Compatible con llama.cpp, llama-cli, llama-server y llama-mtmd-cli para uso interactivo o como servidor.

## Casos de uso

- **Investigación en seguridad de IA**: el modelo es útil para estudiar el comportamiento de modelos abliterados, medir el impacto de la eliminación de guardrails en la calidad del conocimiento (MMLU se mantiene dentro del ruido) y para desarrollar métodos de evaluación de seguridad más robustos.
- **Generación de contenido creativo sin filtros**: escritores y creadores pueden usar el modelo para producir textos de ficción, guiones o poesía sin las restricciones habituales de los modelos censurados, con la ventaja de poder incluir imágenes como entrada.
- **Análisis de imágenes en entornos controlados**: gracias a la capacidad de visión, se puede usar para describir o interpretar imágenes en aplicaciones donde no se requieren filtros de contenido, como documentación técnica o análisis de datos visuales.
- **Prototipado de agentes conversacionales**: con la cabeza MTP y el modo de razonamiento, se puede construir un chatbot local con respuestas detalladas y sin censura, ejecutable en una GPU de gama media.
- **Investigación académica sobre alucinación**: al ser un modelo abliterado, se puede comparar la tendencia a alucinar frente a la versión base, ya que la cirugía de pesos puede afectar la fidelidad en ciertos dominios (se observa una caída de MMLU del 8% en Q2_K).
- **Despliegue local en entornos aislados**: el modelo se puede ejecutar completamente en local con llama.cpp, sin conexión a internet, para tareas de procesamiento de texto e imagen en infraestructuras sin acceso a servicios en la nube.

## Benchmarks y rendimiento

La model card del autor proporciona resultados de MMLU (precisión en modo logit) y HarmBench (tasa de éxito de ataque con gating de coherencia) para cada cuantización, comparando la versión base con la versión CRACK a la misma cuantización:

| Quant | MMLU (base) | MMLU (CRACK) | ΔMMLU | HarmBench harm-ASR |
|---|---|---|---|---|
| Q8_0   | 79.0% | 80.7% | +1.75 pp | 100.0% |
| Q6_K   | 78.6% | 79.0% | +0.40 pp | 100.0% |
| Q5_K_M | 80.7% | 80.1% | -0.58 pp | 100.0% |
| Q4_K_M | 80.0% | 77.8% | -2.20 pp | 100.0% |
| Q3_K_M | 76.0% | 78.4% | +2.34 pp | 100.0% |
| Q2_K   | 77.9% | 69.8% | -8.07 pp | 99.6% |

En HarmBench por tema (quants CRACK), todas las categorías (química/biológica, ciberdelincuencia, acoso, dañino, ilegal, desinformación) alcanzan una tasa de éxito del 100%. No se han publicado resultados de otros benchmarks como GSM8K, HumanEval o MMLU-Pro en la información disponible.

## Requisitos de hardware

- **VRAM estimada por cuantización** (solo texto, sin visión):
  - Q8_0: 37.8 GB
  - Q6_K: 29.2 GB
  - Q5_K_M: 25 GB
  - Q4_K_M: 21.7 GB
  - Q3_K_M: 17 GB
  - Q2_K: 13.2 GB
- **GPUs recomendadas**: para Q4_K_M (la recomendada por el autor) se necesita una GPU con al menos 24 GB de VRAM, como una RTX 3090, RTX 4090 o A5000. Para Q2_K o Q3_K_M bastaría con 16 GB (RTX 4080, RTX 3080 Ti, etc.). En CPU se puede ejecutar con suficiente RAM (p.ej. 32 GB para Q4_K_M) usando llama.cpp con compilación optimizada.
- **Opciones de despliegue**: llama-cli, llama-server, llama-mtmd-cli (para visión), LM Studio (compatible con la plantilla de chat y el modo thinking), y cualquier framework que soporte GGUF (Ollama, etc.).
- **Latencia y throughput**: no disponible en la información proporcionada. Se espera que la cabeza MTP acelere la generación en comparación con un modelo denso equivalente.

## Comparativa con modelos similares

El modelo base Ornith-1.5-35B-A3B es comparable en arquitectura a otros MoE con ~3B activos, como Qwen3-30B-A3B (30B totales, 3B activos) o DeepSeek-V3-Lite (aunque con diferentes proporciones). Sin embargo, no se dispone de datos de benchmarks comparativos en la información proporcionada. La versión CRACK es única en su categoría por su naturaleza abliterada, por lo que no existe una comparativa directa con otros modelos sin restricciones del mismo tamaño.

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (base) | 35.5B | 3B | no disponible | MIT | safetensors |
| Ornith-1.5-35B-A3B-CRACK-GGUF | 35.5B | 3B | no disponible | MIT | GGUF |
| Qwen3-30B-A3B | 30B | 3B | 32K | Apache 2.0 | safetensors/GGUF |

No se han encontrado benchmarks comparativos publicados entre estos modelos en la información recopilada.

## Limitaciones y advertencias

- **Eliminación total de guardrails**: el modelo no muestra ninguna negativa ante peticiones dañinas, ilegales o peligrosas (HarmBench 100% ASR). Esto implica un riesgo real de generar contenido perjudicial, incluyendo instrucciones para ciberataques, fabricación de armas químicas o desinformación.
- **Degradación de calidad en cuantizaciones bajas**: aunque MMLU se mantiene cerca del modelo base en Q4_K_M y superiores, la cuantización Q2_K pierde 8.07 puntos porcentuales de MMLU, lo que indica una pérdida notable de conocimiento.
- **Falta de datos sobre sesgos**: no se ha publicado ningún análisis de sesgos del modelo base ni del proceso CRACK. La abliteración puede eliminar también sesgos de seguridad que actuaban como mitigadores.
- **Contexto no especificado**: no se indica la longitud máxima de contexto soportada, por lo que no se puede garantizar un rendimiento óptimo en tareas de contexto largo.
- **Idiomas**: no se ha publicado información sobre los idiomas soportados; probablemente el modelo hereda las capacidades multilingües de la base, pero no se puede confirmar.
- **Uso comercial**: la licencia MIT permite uso comercial, pero el modelo es un artefacto de investigación con advertencias explícitas sobre uso responsable y legal. El usuario asume toda la responsabilidad legal y ética.

## Enlaces

- [HuggingFace - dealignai/Ornith-1.5-35B-A3B-CRACK-GGUF](https://huggingface.co/dealignai/Ornith-1.5-35B-A3B-CRACK-GGUF)
- [HuggingFace - ornith-ai/Ornith-1.5-35B-A3B-GGUF](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF)
- [Blog - Ornith 1.5 Local Deployment: 9B vs 35B-A3B vs 397B](https://aicybr.com/blog/ornith-1-5-local-deployment-9b-35b-397b)
- [Benchmarks - Ornith-1.5-35B-A3B](https://benchlm.ai/models/ornith-1-5-35b-a3b)
- [Guía local - LocalClaw](https://localclaw.io/models/ornith-1-5-35b-a3b)
