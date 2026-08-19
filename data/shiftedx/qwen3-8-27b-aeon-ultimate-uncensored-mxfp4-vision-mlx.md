# Shiftedx/qwen3.8-27b-aeon-ultimate-uncensored-mxfp4-vision-mlx

## Resumen

Este modelo es una conversión comunitaria a formato MLX con cuantización MXFP4 del checkpoint `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16`, un modelo de visión-lenguaje de la familia Qwen3.5 que ha sido sometido a un proceso de "abliteration" (eliminación de la alineación de seguridad). La conversión, realizada por Shiftedx, está pensada para ejecutarse en hardware Apple Silicon mediante la librería MLX y el pipeline `mlx-vlm`. El modelo resultante conserva la arquitectura densa de 64 capas de lenguaje con atención híbrida/GDN, un contexto configurado de 262 144 tokens y los componentes de visión originales en BF16.

A pesar de que el nombre sugiere 27 000 millones de parámetros, los pesos cuantizados en safetensors suman 5 505 879 280 parámetros, lo que refleja la compresión MXFP4 de 4 bits. Se trata de un artefacto experimental, sin alineación de seguridad, cuyo uso conlleva responsabilidad legal y ética por parte del operador. La licencia es Apache-2.0, pero el modelo puede generar contenido inseguro o ilegal, por lo que no es recomendable para despliegues sin moderación y control de acceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-family densa, atención híbrida/GDN, 64 capas de lenguaje |
| Parametros totales | 5 505 879 280 (según safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (configurado, no exhaustivamente cualificado) |
| Tipos de cuantizacion | MXFP4 (4 bits, group size 32) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), MXFP4 |

## Arquitectura y entrenamiento

El modelo es una conversión cuantizada de un checkpoint preexistente, no un entrenamiento original. La arquitectura base pertenece a la familia Qwen3.5 e incorpora atención híbrida con mecanismo GDN (no se especifica su significado exacto en la documentación disponible). Consta de 64 capas de lenguaje y un componente de visión que conserva 333 tensores BF16 originales, con el patch embedding adaptado a los ejes de MLX. La cuantización se realizó con el adaptador de streaming Qwen3.5 de MLX-LM 0.31.3, produciendo tanto MXFP4 como MXFP8 directamente desde el mismo padre BF16. El checkpoint original fue sometido a un proceso de abliteration, que elimina selectivamente las direcciones de activación asociadas con el rechazo de solicitudes dañinas, dejando al modelo sin alineación de seguridad. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni el uso de RLHF o DPO, ya que estos datos pertenecen al modelo base original.

## Capacidades

- Generación de texto y razonamiento conversacional, con soporte de imagen a texto (image-text-to-text).
- Comprensión de imágenes y descripción de su contenido, mediante el pipeline `mlx-vlm`.
- Capacidad multilingüe: no especificada en la documentación.
- Soporte de tool calling y agentes: no documentado explícitamente en esta conversión, aunque la familia Qwen3.5 suele incluirlo; no se puede confirmar.
- Modo de pensamiento o razonamiento extendido: no documentado.
- Sin censura: al estar abliterated, el modelo no aplica los rechazos de seguridad habituales, lo que permite generar contenido que otros modelos bloquearían.

## Casos de uso

- Investigación en alineación y seguridad de modelos: permite estudiar el comportamiento de un modelo sin alineación y comparar con versiones alineadas, siempre en entornos aislados y con supervisión ética.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o poesía con temáticas que otros modelos censuran, bajo responsabilidad del operador y con moderación posterior.
- Análisis de imágenes en entornos controlados: descripción de imágenes médicas, técnicas o artísticas donde se requiera un output sin filtros, con revisión humana obligatoria.
- Experimentación con cuantización MXFP4 en Apple Silicon: sirve como banco de pruebas para evaluar el rendimiento y la fidelidad de la cuantización de 4 bits en modelos de visión-lenguaje grandes.
- Desarrollo de prototipos de asistentes conversacionales con visión: integración en aplicaciones de investigación que necesiten un modelo multimodal sin restricciones de contenido, con capas de moderación externas.
- Pruebas de robustez y sesgos: evaluación de cómo se comporta un modelo abliterated ante prompts adversariales o contenido sensible, para informar el diseño de sistemas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para esta conversión concreta.

## Requisitos de hardware

- El modelo está diseñado para Apple Silicon (M1, M2, M3 o superior) con soporte MLX.
- VRAM estimada: el artefacto indexado ocupa 14.19 GiB, por lo que se recomienda un mínimo de 16 GB de memoria unificada para cargar el modelo completo.
- GPU recomendadas: Apple M1 Pro/Max, M2 Pro/Max/Ultra, M3 Pro/Max o superiores con al menos 16 GB de RAM unificada.
- No es compatible con GPUs NVIDIA o AMD de forma nativa, salvo que se convierta a otro formato (no incluido en esta versión).
- Opciones de despliegue: `mlx-vlm` para generación de imagen a texto; también se puede usar con la librería MLX estándar para tareas de lenguaje.
- Latencia y throughput: no disponibles en la documentación.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros modelos. Como referencia cualitativa, este modelo es una conversión cuantizada de Qwen3.8-27B, por lo que su comportamiento base debería ser similar al de otros modelos Qwen3.5 de tamaño comparable, pero con la diferencia clave de estar abliterated y cuantizado a 4 bits. Alternativas en el mismo espacio (modelos de visión-lenguaje cuantizados para MLX) podrían incluir conversiones de Qwen2-VL o Llama 3.2 Vision, pero no se han encontrado datos concretos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está abliterated, es decir, carece de alineación de seguridad. Puede generar contenido violento, ilegal, sexualmente explícito o dañino sin restricciones.
- La cuantización MXFP4 no restaura la alineación; el riesgo persiste tras la conversión.
- Es un artefacto experimental: la documentación indica que la cualificación del contexto de 262 144 tokens no es exhaustiva, por lo que pueden aparecer degradaciones en ventanas largas.
- No se especifican los idiomas soportados, lo que limita su uso en aplicaciones multilingües sin pruebas previas.
- No hay benchmarks publicados, por lo que el rendimiento real en tareas estándar es desconocido.
- La licencia Apache-2.0 permite uso comercial, pero el editor fuente advierte que la responsabilidad legal y de seguridad recae en el operador. Es imprescindible implementar control de acceso, registro de actividad, moderación y revisión humana en cualquier despliegue.
- Al ser una conversión comunitaria, no cuenta con soporte oficial de AEON-7 ni de Qwen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Shiftedx/qwen3.8-27b-aeon-ultimate-uncensored-mxfp4-vision-mlx
- Modelo base original: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
