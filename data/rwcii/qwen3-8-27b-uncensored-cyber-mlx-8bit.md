# rwcii/Qwen3.8-27B-Uncensored-Cyber-MLX-8bit

## Resumen

El modelo `rwcii/Qwen3.8-27B-Uncensored-Cyber-MLX-8bit` es una conversión no oficial al formato MLX (Apple Silicon) del modelo `philbert440/Qwen3.8-27B-Uncensored-Cyber`, que a su vez es un derivado del modelo `Qwen/Qwen3.8-27B` con el alineamiento de seguridad sustancialmente eliminado (abliterado). El resultado es un modelo que responde a preguntas de ciberseguridad y contenidos ofensivos que los modelos convencionales suelen rechazar, sin apenas barreras de seguridad integradas.

Esta conversión se limita a cambiar el formato de pesos y cuantizar a 8 bits mediante `mlx-lm`; no añade entrenamiento adicional ni evaluación de seguridad. Está pensado para ejecutarse en Apple Silicon, con un tamaño de repositorio de 28,6 GB y un consumo de memoria de aproximadamente 28,9 GB en inferencia. El modelo es multimodal en su origen (pipeline `image-text-to-text`), aunque la documentación de la conversión solo valida generación de texto.

La relevancia de este modelo radica en su utilidad para investigación en seguridad de IA, estudio de mecanismos de rechazo y red-teaming, siempre en entornos controlados y con moderación externa. No está recomendado para uso en producción ni para exposición directa a usuarios no autorizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` |
| Parametros totales | 7.566.401.024 (según safetensors; el modelo original declara Qwen3.8-27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no se especifica en la información) |
| Tipos de cuantizacion | MLX affine, 8 bits, grupo de tamaño 64 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo original `Qwen/Qwen3.8-27B` es un modelo de lenguaje de 27 000 millones de parámetros con arquitectura multimodal. La variante `philbert440/Qwen3.8-27B-Uncensored-Cyber` se ha sometido a un proceso de "abliteración" (eliminación de las capas de rechazo) y se ha afinado para responder a preguntas de ciberseguridad y contenido ofensivo. Esta conversión MLX no introduce ninguna modificación arquitectónica ni de entrenamiento; solo cambia el formato de pesos y aplica cuantización de 8 bits con `mlx-lm` 0.31.3.

No se dispone de información sobre el número de tokens de entrenamiento, el conjunto de datos utilizado ni el proceso de alineamiento del modelo base. La conversión se realizó sobre una revisión específica del modelo fuente (commit `c3e40d890c50b5ad5e7cb035701316605a7f6d16`) y se validó localmente en Apple Silicon con generación de texto, chat OpenAI-compatible y llamadas de herramienta estructuradas.

## Capacidades

- Generación de texto en inglés con estilo conversacional.
- Soporte de llamadas a herramientas (tool calling) en formato OpenAI, validado en la conversión.
- Capacidad de procesamiento de imágenes en el modelo original (multimodal), aunque no se ha validado en esta conversión.
- Sin alineamiento de seguridad: responde a preguntas que otros modelos rechazan, incluyendo temas de ciberseguridad ofensiva.
- Funciona en Apple Silicon mediante MLX, con un throughput de aproximadamente 16,7 tokens por segundo en una prueba corta.
- No soporta otros idiomas de forma nativa (solo inglés).

## Casos de uso

- Investigación de mecanismos de rechazo en IA: el modelo permite estudiar cómo y por qué los modelos de lenguaje rechazan ciertas solicitudes, al haber sido abliterado.
- Red-teaming y evaluación de robustez: se puede usar para generar respuestas no filtradas y evaluar la eficacia de los sistemas de moderación.
- Pruebas de herramientas de seguridad: el soporte de tool calling permite probar pipelines de agentes en entornos controlados y autorizados.
- Estudio de interpretabilidad: analizar qué patrones internos del modelo se asocian con la eliminación de la seguridad.
- Evaluación de cuantización: comparar el rendimiento de la versión 8-bit frente a la versión sin cuantizar en tareas de razonamiento y calidad.
- Entornos de laboratorio con autorización explícita: para experimentos de ciberseguridad defensiva y ofensiva en infraestructura propia y con supervisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta una prueba local de rendimiento: 16,7 tokens por segundo y 28,9 GB de memoria pico en Apple Silicon, pero se indica que estas cifras son específicas de la máquina y no constituyen un benchmark general.

## Requisitos de hardware

- El modelo está pensado para ejecutarse en Apple Silicon (chips M1, M2, M3 o M4) con MLX-LM 0.31.3.
- Requiere al menos 32 GB de memoria RAM unificada, dado que la memoria pico observada fue de 28,9 GB.
- No es compatible con GPUs NVIDIA o AMD, ya que MLX es exclusivo para el ecosistema de Apple.
- Se puede ejecutar en local con `mlx_lm.generate` o como servidor OpenAI-compatible con `mlx_lm.server`.
- El throughput típico en una máquina de gama alta es de alrededor de 16,7 tokens por segundo, pero depende de la carga y la máquina.
- No se recomienda para despliegues en producción por la falta de seguridad y el rendimiento limitado en hardware de consumo.

## Comparativa con modelos similares

No se dispone de datos para comparar este modelo con alternativas concretas. La información proporcionada no incluye benchmarks ni comparaciones con otros modelos de la misma categoría. El modelo base original es `Qwen/Qwen3.8-27B`, pero no se tienen datos de rendimiento de esa versión en comparación con otras. Por tanto, no se puede establecer una comparativa objetiva.

## Limitaciones y advertencias

- El modelo no tiene barreras de seguridad integradas y puede generar contenido dañino, ilegal, incorrecto o peligroso.
- No se ha evaluado la seguridad del modelo en entornos reales; el autor de la conversión no ha reproducido las evaluaciones del modelo fuente.
- La cuantización de 8 bits puede reducir la precisión, la calidad del razonamiento y la fiabilidad de las llamadas a herramientas.
- Solo soporta inglés; no hay soporte multilingüe.
- La conversión no ha validado el soporte multimodal (imagen-texto) a pesar de que el modelo original lo tiene.
- La licencia Apache-2.0 permite uso comercial, pero el uso sin moderación y supervisión puede incurrir en responsabilidades legales y éticas.
- No se debe exponer el modelo directamente a usuarios no autorizados; se requiere una capa de moderación externa.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/rwcii/Qwen3.8-27B-Uncensored-Cyber-MLX-8bit)
- [Modelo base: philbert440/Qwen3.8-27B-Uncensored-Cyber](https://huggingface.co/philbert440/Qwen3.8-27B-Uncensored-Cyber)
- [Modelo original: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio GitHub: qwen38-uncensored](https://github.com/unburdened-jackinthebox365/qwen38-uncensored)
- [Espacio Hugging Face: Qwen3.8-27B Uncensored Demo](https://huggingface.co/spaces/P1723/Qwen3.8-27B-Uncensored-Demo)
- [Documentación MLX](https://mlx.com) (no se ha encontrado enlace específico en la información proporcionada)
