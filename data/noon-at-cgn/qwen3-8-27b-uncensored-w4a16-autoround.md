# noon-at-cgn/Qwen3.8-27B-Uncensored-W4A16-AutoRound

## Resumen

Qwen3.8-27B-Uncensored-W4A16-AutoRound es una cuantización W4A16 (pesos en int4, activaciones en bf16) del modelo abliterado [orcarouter/Qwen3.8-27B-Uncensored](https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored), un derivado de Qwen3.8-27B al que se le ha eliminado sustancialmente el alineamiento de seguridad mediante la técnica de abliteration. Este checkpoint ha sido producido con Intel AutoRound y conserva intactas las capacidades originales del modelo base: una ventana de contexto nativa de 262.144 tokens, visión multimodal y el cabezal de decodificación especulativa MTP (Multi-Token Prediction).

La relevancia de este modelo reside en dos frentes. Por un lado, ofrece una versión compacta y eficiente de un modelo de 27B parámetros (en int4, el tamaño se reduce aproximadamente a 19,5 GB en disco), apta para desplegarse en hardware de gama media como dos RTX 3090. Por otro lado, su naturaleza «sin censura» lo convierte en una herramienta valiosa para investigación en seguridad, interpretabilidad y red-teaming, aunque también exige responsabilidad en su uso, ya que carece de barreras de seguridad integradas. El modelo está disponible bajo licencia Apache-2.0 y soporta inglés y chino.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal GatedDeltaNet + atención completa) con torre de visión |
| Parametros totales | 6.260.690.960 (almacenados en safetensors; el modelo original tiene 27B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | W4A16 (AutoRound) |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-27B, emplea una arquitectura híbrida que combina capas de atención lineal (GatedDeltaNet) con capas de atención global, un diseño que optimiza la eficiencia en secuencias largas. Sobre esta base, orcarouter aplicó abliteration, una técnica que elimina los vectores de dirección responsables del comportamiento de rechazo, dando lugar a un modelo que no se niega a responder peticiones dañinas. Posteriormente, este checkpoint ha sido cuantizado con Intel AutoRound a un esquema W4A16 (pesos en 4 bits, activaciones en bf16), utilizando el dataset `NeelNanda/pile-10k` con 128 muestras y 200 iteraciones. La cuantización excluye el `lm_head`, las proyecciones `in_proj_a`/`in_proj_b` de las capas lineales de atención y la torre visual, que se mantienen en bf16 para preservar la calidad de la generación y la visión. El cabezal MTP también se conserva, lo que permite decodificación especulativa en vLLM.

## Capacidades

- Generación de texto y razonamiento complejo en inglés y chino, con un rendimiento destacado en tareas de matemáticas (GSM8K 0.90) y conocimiento general (MMLU 0.88).
- Capacidades de visión: puede procesar y comprender imágenes (image-text-to-text), gracias a la torre `visual.*` que no ha sido cuantizada.
- Soporte de tool calling y función calling, integrable en pipelines de agentes mediante vLLM con `--enable-auto-tool-choice`.
- Razonamiento multi-paso con modo «thinking» que se puede activar o desactivar, mejorando el rendimiento en tareas complejas.
- Decodificación especulativa con el cabezal MTP, que acelera la generación en vLLM.
- Multilingüe: inglés y chino.
- Sin guardarraíles de seguridad: no rechaza solicitudes dañinas, lo que lo hace útil para investigación en seguridad y red-teaming.

## Casos de uso

- **Investigación en seguridad de IA**: el modelo es una herramienta de referencia para estudiar cómo los modelos sin alineamiento responden a ataques adversariales, jailbreaks o instrucciones maliciosas. Los investigadores pueden usar este checkpoint para evaluar la eficacia de técnicas de mitigación.
- **Red-teaming de sistemas de IA**: se puede desplegar como un «modelo atacante» en entornos controlados para probar la robustez de sistemas de IA más seguros, generando entradas adversariales o evaluando respuestas dañinas.
- **Estudios de interpretabilidad**: al no tener capas de rechazo, el modelo permite analizar los mecanismos internos que subyacen al comportamiento de seguridad, ayudando a identificar cómo se codifican los valores y las preferencias en los pesos.
- **Desarrollo de sistemas de moderación**: los equipos de seguridad pueden usar este modelo como un caso de «peor escenario» para entrenar clasificadores de contenido dañino, ya que genera respuestas que los sistemas de moderación deben detectar y bloquear.
- **Generación de contenido creativo sin restricciones**: para proyectos de ficción, escritura de guiones o experimentación artística donde se necesite explorar temas controvertidos sin limitaciones de estilo, siempre que se haga en un entorno privado y con responsabilidad legal.
- **Evaluación de técnicas de cuantización**: este checkpoint sirve como referencia para comparar la pérdida de calidad de AutoRound W4A16 frente a la versión BF16 o FP8 del mismo modelo, útil para investigar el impacto de la cuantización en modelos abliterados.

## Benchmarks y rendimiento

Los resultados de evaluación se han obtenido con `lm_eval` (harness de EleutherAI) usando vLLM, con modo thinking activado y muestreo real (`temperature=1.0, top_p=0.95, top_k=20`). Los valores de referencia corresponden a números publicados para modelos similares, pero no garantizan una comparación perfecta.

| Benchmark | Este modelo | Referencia | Notas |
|---|---|---|---|
| GSM8K (flexible-extract, n=1319) | 0.9052 | dbirks BF16 0.911 / int4 0.917 | Coincidencia cercana |
| MMLU-Pro (14 materias x 100, 5-shot CoT) | 0.761 | dbirks int4 0.826 | Misma metodología; el gap se atribuye a la abliteration |
| MMLU (57 materias x 6, n=342) | 0.880 | orcarouter FP8 0.843 | Iguala o supera; error estándar alto por n pequeña |

La diferencia de ~6.5 puntos en MMLU-Pro frente al int4 del modelo oficial se debe probablemente a la abliteration (el propio orcarouter reporta pérdidas de 0.6-1.3 puntos por esta técnica), no a un defecto de la cuantización. En los benchmarks de seguridad, con el modo thinking desactivado, el modelo muestra tasas de rechazo de 0.0% en la mayoría de los conjuntos de datos (AdvBench, JailbreakBench, MaliciousInstruct, etc.), con valores ligeramente superiores en SimpleSafetyTests (8.0%) y ForbiddenQuestions (3.3%). Con el modo thinking activado, el rechazo es 0.0% en todos los conjuntos.

## Requisitos de hardware

- **VRAM estimada**: para la longitud de contexto completa (262.144 tokens) y visión, se necesitan aproximadamente 40 GB de VRAM o más. Con contextos más cortos, un único RTX 3090 (24 GB) puede ser suficiente.
- **GPU recomendadas**: 2x RTX 3090 (con NVLink o PCIe) para un despliegue completo, o una A100/H100 para mayor margen y concurrency.
- **Compatibilidad con GPU de consumo**: sí, es posible ejecutarlo en una RTX 3090/4090 con contextos reducidos (p. ej., 32K tokens) y usando `--gpu-memory-utilization` para limitar el uso de memoria.
- **Opciones de despliegue**: vLLM (recomendado para tool calling, MTP y visión), llama.cpp (si se convierte a GGUF), Ollama (con conversión previa). Para producción, vLLM ofrece mayor throughput y soporte de especulación.
- **Latencia y throughput**: no se han publicado datos exactos. Se estima que con 2× RTX 3090 y el modo MTP, se puede alcanzar una velocidad de generación de 30-50 tokens/s para contextos de tamaño medio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (GSM8K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-W4A16-AutoRound (este) | 27B (int4) | 262K | 0.905 | Apache-2.0 | HuggingFace |
| Qwen3.8-27B (oficial) | 27B (bf16) | 262K | ~0.91 (referencia) | Apache-2.0 | HuggingFace |
| dbirks/Qwen3.8-27B-W4A16-AutoRound | 27B (int4) | 262K | 0.917 | Apache-2.0 | HuggingFace (modelo no abliterated) |
| orcarouter/Qwen3.8-27B-Uncensored | 27B (bf16) | 262K | ~0.905 | Apache-2.0 | HuggingFace (modelo base abliterated) |

La principal diferencia entre este modelo y el de dbirks es que este se basa en el checkpoint abliterated, lo que reduce la puntuación en MMLU-Pro (~6.5 puntos) pero mantiene un rendimiento similar en GSM8K y MMLU. Frente al modelo base (orcarouter), la cuantización int4 añade una pérdida de calidad mínima en la mayoría de las tareas.

## Limitaciones y advertencias

- **Sin barreras de seguridad**: este modelo ha sido diseñado para no rechazar solicitudes dañinas, ilegales o no éticas. Su uso conlleva el riesgo de generar contenido peligroso, y no debe desplegarse en producción sin un sistema de moderación externo.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede inventar información falsa, especialmente en dominios de conocimiento específicos.
- **Contexto largo**: aunque soporta 262K tokens, el uso de la ventana completa requiere una gran cantidad de memoria (40GB+), lo que limita su uso en hardware de gama media.
- **Idiomas**: solo inglés y chino. No se ha entrenado para otros idiomas, por lo que su rendimiento en español u otras lenguas será inferior.
- **Licencia**: Apache-2.0, permite uso comercial, pero el autor advierte que no es adecuado para desplegar a usuarios finales sin una capa de seguridad propia.
- **Cuantización**: la calidad puede degradarse ligeramente en tareas de razonamiento complejo respecto a la versión BF16, como se observa en MMLU-Pro.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/noon-at-cgn/Qwen3.8-27B-Uncensored-W4A16-AutoRound)
- [Modelo base (orcarouter/Qwen3.8-27B-Uncensored)](https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored)
- [Modelo original (Qwen/Qwen3.8-27B)](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio de Intel AutoRound](https://github.com/intel/auto-round)
- [Guía de abliteration en MindStudio](https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration)
- [Despliegue en 2x RTX 3090 (GitHub)](https://github.com/tonyd2wild/Qwen3.8-27B-AutoRound-W4A16-2x3090)
- [Qwen3.8-27B Uncensored (GitHub)](https://github.com/Wassimyounes01/qwen38-uncensored)
