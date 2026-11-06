# mohommed/Lucet-2B-Frontier-GGUF

## Resumen

Lucet-2B-Frontier es un modelo de generación de texto y razonamiento de 1,7 mil millones de parámetros creado por el usuario mohommed a partir de LFM3-1.7B de Liquid AI. Se trata de un ajuste autónomo que combina el entrenamiento multidimensional (MTA-SDT) sobre datos curados de alta señal con un proceso de "descensura" mediante SVD dirigido, que elimina las direcciones de rechazo (refusal directions) en las proyecciones descendentes del MLP. El resultado es un modelo conversacional, de razonamiento y programación sin filtros de alineación.

Su rasgo más distintivo es la ventana de contexto extendida a 512K tokens (524.288) mediante RoPE con ABF (rope_theta = 4.000.000), sin interpolación YaRN por CPU. El modelo hereda la arquitectura Tri-Hybrid de Liquid AI, que combina convoluciones cortas con puerta, atención por ventana deslizante y GQA global, una alternativa eficiente al transformer puro.

La relevancia de esta ficha reside en que ofrece, bajo licencia Apache 2.0, un modelo pequeño capaz de manejar contextos enormes en hardware de consumo, con cuantizaciones GGUF calibradas mediante matrices de importancia (imatrix). No obstante, al tratarse de un modelo derivado por un particular y etiquetado como "uncensored", conviene evaluar con cautela su fiabilidad y seguridad antes de uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tri-Hybrid (Gated Short Convolutions + Sliding Window Attention + Global GQA), base LFM3 |
| Parámetros totales | 1.728.801.600 (~1,73 B) |
| Parámetros activos | no disponible (arquitectura híbrida, no MoE declarada) |
| Longitud de contexto | 524.288 tokens (512K), RoPE con rope_theta = 4.000.000 |
| Tipos de cuantización | GGUF calibrado con llama-imatrix (cuantizaciones específicas no detalladas en la model card) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 8,0 GB); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo parte de LFM3-1.7B de Liquid AI, que emplea la arquitectura Tri-Hybrid: combina convoluciones cortas con mecanismos de puerta (que capturan patrones locales con coste lineal), atención por ventana deslizante para contexto medio y Global GQA (Grouped Query Attention) para dependencias de largo alcance. Este diseño híbrido reduce el coste computacional de la atención respecto a un transformer denso clásico, lo que resulta clave para soportar contextos de 512K tokens.

Según la model card, el entrenamiento adicional utiliza el método MTA-SDT (Multi-Dimensional Smart Deep Training), que aplica "manifolds de pérdida cognitiva desacoplados" sobre cuatro dimensiones: razonamiento, acción operativa, elaboración visual/física "anti-slop" y anclaje conversacional. No se publican detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF/DPO. Adicionalmente, se aplicó un proceso de descensura mediante SVD dirigido sobre las proyecciones w2 del MLP, dejando intactas las proyecciones o_proj de la atención. Los GGUF se cuantizaron con llama-imatrix para preservar la fidelidad en tareas de razonamiento.

## Capacidades

- Generación de texto conversacional con anclaje en diálogo multi-turno.
- Razonamiento autónomo y resolución de problemas (según la model card).
- Generación y comprensión de código.
- Contexto extremadamente largo: hasta 524.288 tokens, útil para análisis de documentos extensos.
- Modelo "uncensored": sin direcciones de rechazo, responde sin los filtros de alineación habituales.
- Pipeline compatible con transformers y formato GGUF para inferencia local (llama.cpp, Ollama, etc.).
- No hay evidencia de capacidades multimodales (visión, audio) ni de tool calling en la información disponible.

## Casos de uso

- Análisis de documentos y código de repositorios completos: con 512K de contexto puede ingerir bases de código enteras o libros técnicos sin fragmentación, algo poco habitual en modelos de menos de 2B parámetros.
- Asistentes conversacionales locales y privados: su tamaño (~1,7B) permite ejecutarlo en portátiles y mini-PC, y la ausencia de filtros lo hace adecuado para entornos donde se controla la política de contenido externamente.
- Generación de código en flujos de trabajo personales: puede integrarse en editores locales (por ejemplo vía llama.cpp u Ollama) para autocompletado y refactorización sin enviar código a la nube.
- Resumen de corpus extensos: ideal para condensar transcripciones, expedientes o hilos largos aprovechando la ventana nativa extendida.
- Investigación sobre alineación y "refusal directions": el proceso de descensura por SVD documentado lo convierte en un caso de estudio para estudiar cómo se eliminan direcciones de rechazo en los MLP.
- Agentes ligeros con contexto acumulado: su bajo consumo de memoria permite mantener conversaciones de agente muy largas en una sola GPU de consumo.
- Prototipado en edge devices: cuantizaciones GGUF calibradas con imatrix facilitan despliegue en CPU o GPUs modestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio GGUF pesa 8,0 GB en total; una cuantización media (Q4_K_M aproximada para 1,7B) rondaría 1,0–1,2 GB, y versiones altas (Q8_0, F16) entre 1,8 y 3,5 GB. Las cifras exactas por cuantización no están disponibles.
- GPU recomendadas: cualquier GPU moderna con 4–6 GB de VRAM es suficiente para la mayoría de cuantizaciones; no se requieren A100 ni H100 salvo para contextos de 512K, donde la caché KV puede crecer significativamente.
- Cabe con holgura en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090 e incluso integradas modernas; también es viable en CPU pura vía llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; también cargable con transformers (modelo base) y servible con vLLM o TGI si se usa el formato original, aunque el soporte de la arquitectura Tri-Hybrid en estos runtimes debe verificarse.
- Latencia y throughput: no disponibles; por su tamaño (~1,7B) cabe esperar velocidades altas en CPU y muy altas en GPU, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| Lucet-2B-Frontier (este) | ~1,73 B | 512K | Tri-Hybrid (LFM3) | Apache 2.0 |
| LiquidAI/LFM3-1.7B (base) | ~1,73 B | no disponible en la ficha | Tri-Hybrid | Apache 2.0 (según tags del repo base) |
| Qwen3-1.7B | ~1,7 B | ~32K–128K (según versión) | Transformer denso | Apache 2.0 |
| Gemma 3 1B | ~1 B | 32K | Transformer denso | Gemma (restricciones propias de Google) |

Frente a alternativas densas de tamaño similar, la ventaja diferencial de Lucet-2B-Frontier es su contexto de 512K y la arquitectura híbrida de Liquid AI; su inconveniente es la falta de benchmarks publicados y la naturaleza experimental del ajuste.

## Limitaciones y advertencias

- Modelo "uncensored": la descensura por SVD elimina comportamientos de rechazo, lo que implica riesgo elevado de generar contenido ofensivo, peligroso o inapropiado. No es adecuado para despliegue público sin capas de moderación propias.
- Es un ajuste comunitario (autor individual), no un modelo oficial de Liquid AI: la calidad del entrenamiento MTA-SDT no está verificada por benchmarks independientes.
- Riesgo de alucinación: sin evaluaciones publicadas, no hay datos sobre su tasa de alucinaciones; al ser un modelo de ~1,7B, la fiabilidad fáctica será limitada.
- Contexto de 512K: aunque declarado, el rendimiento real con contextos extremos no está evaluado; la caché KV en contextos tan largos puede requerir más memoria de la esperada para un modelo tan pequeño.
- Idiomas soportados no documentados; el castellano puede funcionar peor que el inglés.
- Licencia Apache 2.0: permite uso comercial sin restricciones relevantes, pero el modelo base (LFM3) y sus términos deben revisarse igualmente.
- Los detalles de cuantización GGUF disponibles no están enumerados en la model card; conviene comprobar los archivos del repositorio antes de descargar.
- Sin soporte documentado de tool calling, agentes ni multimodalidad.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/mohommed/Lucet-2B-Frontier-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- No se han encontrado enlaces adicionales (paper, blog o demo) en la información disponible.
