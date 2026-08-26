# AIOpsInSpace/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP

## Resumen

Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP es un modelo de lenguaje de 27 000 millones de parámetros, de arquitectura densa, desarrollado por AIOpsInSpace como un merge personalizado sobre la base HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF. Este modelo base es, a su vez, una versión "abliterada" (eliminación de comportamientos de rechazo) del Qwen3.8-27B original de Alibaba, un modelo multimodal nativo con atención híbrida (Gated DeltaNet lineal + atención completa) y capacidades de razonamiento, tool calling y agente.

La principal aportación de esta variante es la incorporación de cabezas MTP (Multi-Token Prediction) injertadas, que permiten decodificación especulativa y aceleran la inferencia en entornos compatibles. Además, se ha restaurado la ventana de atención deslizante a 32 000 tokens para evitar la degradación del contexto. El modelo se distribuye bajo licencia Apache 2.0, está orientado a uso en inglés y se presenta en formato GGUF, lo que facilita su ejecución local con llama.cpp, Ollama u otros runtimes compatibles.

Su relevancia radica en ofrecer una experiencia de razonamiento sin muros de rechazo, pensada para flujos de trabajo complejos de programación y automatización, con un rendimiento de inferencia mejorado gracias a la decodificación especulativa. No obstante, al ser un modelo sin censura, su uso conlleva responsabilidades éticas y legales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B denso, atención híbrida (Gated DeltaNet lineal + atención completa) |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32 000 tokens (ventana deslizante restaurada) |
| Tipos de cuantizacion | GGUF (varias cuantizaciones, no especificadas; el build de orcarouter ofrece de 2-bit a 8-bit) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.8-27B, un transformer denso con atención híbrida que combina capas de Gated DeltaNet (atención lineal) con capas de atención completa. Esta combinación busca un equilibrio entre eficiencia computacional y calidad de modelado del contexto. El merge de AIOpsInSpace parte del GGUF de HauhauCS, que ya había eliminado los comportamientos de rechazo mediante técnicas de abliteración, y añade cabezas MTP (Multi-Token Prediction) para habilitar la decodificación especulativa, lo que acelera la generación de tokens en runtimes que soporten esta técnica.

No se dispone de información detallada sobre los datos de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de RLHF o DPO. El proceso de creación se describe como un "custom-merged" sobre la base HauhauCS, sin más especificaciones. Tampoco se confirma si se conservan las capacidades multimodales (visión) del Qwen3.8-27B original, ya que la model card solo menciona generación de texto y razonamiento.

## Capacidades

- Generación de texto y razonamiento multi-paso, con un enfoque "reasoning-first" que prioriza la cadena de pensamiento.
- Ausencia de muros de rechazo: el modelo está diseñado para responder a cualquier prompt sin negativas, lo que lo hace útil para escenarios donde el modelo base censuraría contenido.
- Decodificación especulativa mediante cabezas MTP, que reduce la latencia de generación en runtimes compatibles (por ejemplo, llama.cpp con soporte MTP).
- Ventana de contexto de 32 000 tokens, suficiente para conversaciones largas y documentos extensos.
- Capacidades de tool calling y agente: aunque no se confirma explícitamente en este merge, el modelo base Qwen3.8-27B las incluye, y la model card menciona "complex coding workflows", lo que sugiere que se conservan.
- No se confirma la capacidad multimodal (visión) en esta variante; la model card no la menciona y el tag principal es text-generation.

## Casos de uso

- Desarrollo de software sin restricciones: el modelo puede generar código, depurar y refactorizar sin rechazar peticiones por contenido "sensible", lo que resulta útil en entornos de investigación donde se exploran vulnerabilidades o se analiza código malicioso (siempre con fines legítimos).
- Automatización de oficina: gracias a su capacidad de razonamiento y tool calling, puede integrarse en flujos de trabajo que requieran redactar documentos, resumir correos o gestionar tareas administrativas complejas.
- Agentes autónomos: su ventana de 32 000 tokens y su capacidad de razonamiento multi-paso lo hacen adecuado para construir agentes que interactúen con APIs, ejecuten comandos y tomen decisiones en entornos controlados.
- Investigación en alineación y seguridad: al ser un modelo sin censura, permite estudiar los efectos de la abliteración y los límites de los sistemas de moderación en modelos de lenguaje.
- Generación de contenido creativo sin filtros: escritura de ficción, guiones o material de marketing que requiera un tono provocador o temas tabú, siempre dentro del marco legal.
- Pruebas de estrés de sistemas de moderación: se puede utilizar para evaluar la robustez de filtros de contenido en plataformas, generando prompts adversariales de forma controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona "benchmark competitiveness" en su índice, pero no se proporcionan datos concretos. Tampoco se encuentran comparativas numéricas en los resultados de búsqueda web. Por tanto, no es posible evaluar cuantitativamente su rendimiento frente a otros modelos.

## Requisitos de hardware

- VRAM estimada: para un modelo de 27B en cuantización 4-bit, se necesitan aproximadamente 16-18 GB de VRAM; en 8-bit, alrededor de 30 GB. Las cuantizaciones de 2-3 bit pueden caber en GPUs con 12 GB, aunque con pérdida de calidad.
- GPUs recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para cuantización 4-bit; A100 (40/80 GB) o H100 para cuantizaciones más altas o inferencia con mayor throughput.
- En consumer GPUs: sí, es viable en tarjetas con 16 GB o más (por ejemplo, RTX 4080, RTX 4070 Ti Super) usando cuantización 4-bit o inferior.
- Opciones de despliegue: llama.cpp (con soporte MTP), Ollama (mediante importación de GGUF), vLLM (si se convierte a safetensors y se añade soporte MTP), TGI (si se adapta). El formato GGUF facilita la integración con estos runtimes.
- Latencia y throughput: no se dispone de datos medidos. La decodificación especulativa MTP puede reducir la latencia entre un 20-40% en comparación con la generación autoregresiva estándar, pero depende del runtime y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Caracteristicas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 32k (con ventana deslizante) | Apache 2.0 | safetensors | Multimodal, tool calling, razonamiento, MTP |
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP (este) | 27B | 32k | Apache 2.0 | GGUF | Sin censura, MTP, razonamiento, sin visión confirmada |
| Llama-3.1-8B-Instruct (abliterated) | 8B | 128k | Llama 3.1 | safetensors/GGUF | Sin censura, más pequeño, menos capaz en razonamiento complejo |

La comparativa se limita a características estructurales, ya que no hay benchmarks disponibles. Frente al Qwen3.8-27B original, este modelo sacrifica la multimodalidad (probablemente) y el soporte oficial a cambio de eliminar los rechazos y ofrecer un formato GGUF listo para ejecución local. Frente a modelos uncensored más pequeños, ofrece mayor capacidad de razonamiento y contexto, pero requiere más recursos.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo sin censura, es más propenso a generar contenido falso, ofensivo o peligroso si se le solicita. No se han realizado evaluaciones de sesgo específicas para esta variante.
- Riesgo de uso indebido: la ausencia de rechazos puede facilitar la generación de malware, discursos de odio o contenido ilegal. El uso debe limitarse a fines legítimos y éticos.
- Limitaciones de idioma: solo se ha entrenado/verificado en inglés; el rendimiento en otros idiomas puede ser deficiente.
- Sin soporte oficial: es un merge de la comunidad, sin garantías de mantenimiento, corrección de errores o actualizaciones de seguridad.
- Capacidad multimodal no confirmada: aunque el modelo base es multimodal, esta variante podría no incluir el proyector de visión (mmproj), por lo que no se recomienda asumir que puede procesar imágenes.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el blog de orcarouter.ai menciona un límite de "research-only" para el build de HauhauCS; conviene verificar los términos exactos del modelo base antes de un despliegue comercial.
- Compatibilidad MTP: la decodificación especulativa solo funciona en runtimes que soporten MTP; en otros, el modelo funcionará sin aceleración, pero con un rendimiento normal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AIOpsInSpace/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP
- Modelo base (HauhauCS): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Repositorio oficial de Qwen3.8-27B (Alibaba): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guía de despliegue local (localairig.com): https://localairig.com/models/qwen3-8-27b-uncensored-hardware-deployment-guide/
- Build de Ollama (orcarouter): https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Blog sobre ejecución local (orcarouter.ai): https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
