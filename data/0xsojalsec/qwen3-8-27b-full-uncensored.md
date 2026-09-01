# 0xSojalSec/Qwen3.8-27B-full-Uncensored

## Resumen

El modelo **0xSojalSec/Qwen3.8-27B-full-Uncensored** es una versión modificada (abliterada) del modelo base **Qwen/Qwen3.8-27B**, desarrollado por Alibaba. El autor, 0xSojalSec, aplica una técnica denominada *abliteration* que elimina los comportamientos de rechazo y las respuestas evasivas de seguridad del modelo original, con el objetivo de obtener respuestas directas y sin filtros para fines de investigación en seguridad ofensiva y red-team. El modelo base es un transformer denso de 27.781 millones de parámetros con arquitectura híbrida de atención (Gated DeltaNet lineal + atención completa), nativo multimodal (visión-lenguaje), con capacidades de razonamiento, tool-calling y un cabezal de decodificación especulativa MTP (Multi-Token Prediction).

La versión V3, denominada "Deep Liberation", es el resultado de tres iteraciones de refinamiento: V1 aplicó una cirugía SVD agresiva (coste de -6 puntos porcentuales en MMLU), V2 introdujo el *complementary abliteration blending* (mezcla de pesos entre SVD y LEACE) que redujo el coste a -0,3 pp, y V3 combina refinamiento iterativo con cirugía dirigida sobre un corpus específico, logrando una liberación genuina con un coste de -2,1 pp en MMLU respecto al modelo original. El modelo se distribuye en formatos safetensors, GGUF y MLX, con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (Gated DeltaNet linear attention + full attention), multimodal visión-lenguaje |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (de 2-bit a 8-bit, según build de Ollama), safetensors (bfloat16), MLX |
| Idiomas soportados | No disponible (el modelo base Qwen3.8-27B es multilingüe, pero no se especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con una arquitectura híbrida de atención: combina **Gated DeltaNet** (atención lineal) con **atención completa** (full attention), lo que permite manejar contextos largos de forma eficiente. Es nativamente multimodal (acepta entradas de imagen y texto) e incorpora un cabezal **MTP** (Multi-Token Prediction) para decodificación especulativa, que acelera la generación. El modelo original fue entrenado por Alibaba con un enfoque en codificación, flujos agénticos y automatización de oficina.

El proceso de *abliteration* aplicado por 0xSojalSec no modifica los pesos del entrenamiento original, sino que identifica y proyecta fuera del espacio de pesos las "direcciones de rechazo" (refusal directions). La versión V3 utiliza dos innovaciones: **refinamiento iterativo** (cada ronda de cirugía parte del modelo campeón anterior, no del stock) y **cirugía dirigida** con un corpus enfocado en categorías específicas de evasión. Además, emplea *complementary abliteration blending*: combina los pesos de dos cirugías diferentes (SVD y LEACE) en proporción 60/40, cancelando las debilidades de cada método. No se han publicado detalles sobre el dataset de entrenamiento original ni sobre el corpus utilizado para la cirugía dirigida.

## Capacidades

- **Generación de texto y razonamiento**: mantiene las capacidades del modelo base, con un coste medido de -2,1 pp en MMLU (82,3% frente al 84,5% del stock).
- **Generación de código**: según el autor, logra 20/20 en tareas de código con implementaciones funcionales, sin disclaimers.
- **Tool calling y agentes**: compatible con flujos agénticos; el autor recomienda ajustes específicos (repetition_penalty 1,15, temperatura 0,1-0,3) para evitar bucles en harness de agentes.
- **Modo thinking**: compatible con el modo de razonamiento (enable_thinking), aunque se recomienda desactivarlo para respuestas más directas.
- **Multimodal (visión)**: hereda la capacidad de procesamiento de imágenes del modelo base, aunque no se proporcionan ejemplos específicos en la documentación.
- **Multilingüe**: no confirmado explícitamente, pero el modelo base de Qwen es multilingüe.
- **Sin rechazos ni evasivas**: la característica principal es que responde a consultas restringidas con contenido sustancial, en lugar de negarse o dar charlas de seguridad.

## Casos de uso

- **Investigación en seguridad ofensiva (red-team)**: el modelo puede generar exploits, payloads y cadenas de ataque para pruebas de penetración autorizadas, proporcionando código funcional en lugar de negativas. Es adecuado porque ha sido específicamente diseñado para este fin, con un coste de capacidad mínimo.
- **Pruebas de robustez de modelos de IA**: los investigadores pueden usar este modelo para evaluar cómo otros sistemas responden a entradas maliciosas o manipuladas, gracias a su capacidad de generar contenido sin filtros.
- **Generación de código en entornos de desarrollo**: con 20/20 en tareas de código, puede integrarse en pipelines de CI/CD para generar scripts, automatizaciones o prototipos, siempre que se supervisen las salidas.
- **Agentes autónomos para automatización**: su compatibilidad con tool calling y el modo agéntico lo hacen útil para construir asistentes que ejecutan múltiples pasos, aunque requiere configuración cuidadosa de parámetros para evitar bucles.
- **Análisis de vulnerabilidades y auditoría de seguridad**: puede ayudar a identificar fallos en sistemas propios generando casos de prueba o scripts de explotación controlados, en entornos de laboratorio.
- **Educación en ciberseguridad (con supervisión)**: en cursos avanzados de seguridad, puede usarse para demostrar técnicas de ataque y defensa, siempre bajo estricta supervisión y en entornos aislados.

## Benchmarks y rendimiento

El autor proporciona resultados de MMLU (lm-eval-harness, 0-shot, n=5700) y pruebas cualitativas. No se han publicado resultados de otros benchmarks estándar (HumanEval, GSM8K, etc.) en la información disponible.

| Modelo | MMLU (0-shot) | vs Stock | Liberation quality | Cyber/code (20 prompts) | Advanced real-world (8 prompts) | Thinking mode |
|---|---|---|---|---|---|---|
| Stock Qwen3.8-27B | 84,5% | — | Refusals | Refusals | 5/8 | ✓ |
| V1 | 81,4% | -6,0 pp | Hard refusals eliminados | No probado | No probado | ✗ |
| V2 | 84,3% | -0,3 pp | Soft deflections restantes | No probado | 7/8 | ✗ (refuses) |
| **V3** | **82,3%** | **-2,1 pp** | **Genuinamente responde** | **20/20** | **7/8** | **✓** |

*Nota: los datos provienen de la model card del autor y no han sido verificados de forma independiente.*

## Requisitos de hardware

- **VRAM estimada para inferencia**: en bfloat16 (safetensors), el modelo requiere aproximadamente 55,6 GB de VRAM (27,8 B × 2 bytes). Con cuantización GGUF: 8-bit ~28 GB, 4-bit ~14 GB, 2-bit ~7 GB.
- **GPU recomendadas**: para bfloat16, se necesitan GPUs de datacenter como A100 (80 GB) o H100. Con cuantización 4-bit, cabe en GPUs de consumo como RTX 3090/4090 (24 GB) o RTX 4080 (16 GB). Para 2-bit, incluso en GPUs de 8-12 GB.
- **Opciones de despliegue**: compatible con vLLM, llama.cpp (con `--jinja` para usar la plantilla incluida), Ollama (build disponible con 16 tags de cuantización), MLX (para Apple Silicon) y Transformers de HuggingFace.
- **Latencia y throughput**: no se proporcionan datos específicos. El cabezal MTP del modelo base puede acelerar la decodificación especulativa, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU (0-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (stock) | 27,8 B | No disponible | 84,5% | Apache-2.0 | HuggingFace |
| Qwen3.8-27B V3 (este modelo) | 27,8 B | No disponible | 82,3% | Apache-2.0 | HuggingFace |
| Qwen3.8-27B V2 | 27,8 B | No disponible | 84,3% | Apache-2.0 | HuggingFace (autor) |

No se dispone de datos de otros modelos abliterated de tamaño similar (p. ej., Dolphin, WizardLM-Uncensored) en la información proporcionada, por lo que no se puede realizar una comparativa directa con ellos.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser una modificación del modelo base, hereda los sesgos del entrenamiento original. La abliteration puede aumentar la probabilidad de generar contenido factualmente incorrecto o dañino, ya que elimina los mecanismos de rechazo que también actúan como filtro de calidad.
- **Riesgo de uso malintencionado**: el modelo está diseñado para eliminar restricciones de seguridad, lo que lo hace peligroso si se usa fuera de entornos controlados de investigación. Puede generar contenido ilegal, violento o sexualmente explícito sin advertencias.
- **Degradación de capacidades**: aunque el coste en MMLU es moderado (-2,1 pp), el autor advierte que la calidad de las respuestas depende críticamente de la configuración de inferencia (temperatura 0, repetition_penalty 1,15). Un uso incorrecto de los parámetros puede producir bucles o respuestas incoherentes.
- **Limitaciones de contexto e idioma**: no se ha especificado la longitud de contexto soportada ni los idiomas exactos. El modelo base es multilingüe, pero la abliteration podría afectar a lenguas de bajos recursos.
- **Restricciones de licencia**: la licencia Apache-2.0 permite uso comercial, pero el autor etiqueta el modelo como "research-only" en el blog de orcarouter. Se recomienda revisar los términos del modelo base de Qwen para uso comercial.
- **Advertencia para producción**: no se recomienda su uso en sistemas de producción orientados al usuario final, debido a la ausencia de filtros de seguridad y al riesgo de generar contenido inapropiado.

## Enlaces

- [HuggingFace - 0xSojalSec/Qwen3.8-27B-full-Uncensored](https://huggingface.co/0xSojalSec/Qwen3.8-27B-full-Uncensored)
- [HuggingFace - Qwen3.8-27B-Uncensored-YMQ-MTP-GGUF-12GB (variante)](https://huggingface.co/0xSojalSec/Qwen3.8-27B-Uncensored-YMQ-MTP-GGUF-12GB)
- [GitHub - AlibabaCloud-Official/Qwen3.8-27B (modelo base)](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Blog - How to run Qwen 3.8 27B uncensored locally](https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally)
- [Ollama - orcarouter/Qwen3.8-27B-Uncensored](https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored)
