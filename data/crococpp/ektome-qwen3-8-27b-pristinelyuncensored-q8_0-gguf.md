# CrocoCpp/Ektome-Qwen3.8-27B-PristinelyUncensored-Q8_0-GGUF

## Resumen

Ektome-Qwen3.8-27B-PristinelyUncensored es un modelo de lenguaje de 27 300 millones de parámetros, derivado de Qwen3.8-27B de Alibaba, al que se le ha aplicado la técnica de ablación Ektome para eliminar la dirección de rechazo (refusal direction) y obtener un comportamiento "sin censura" (uncensored) mientras se preservan las capacidades originales del modelo. Esta versión concreta, publicada por CrocoCpp, es una conversión a formato GGUF con cuantización Q8_0, pensada para su uso con llama.cpp y otras herramientas compatibles.

El modelo base Qwen3.8-27B es un transformer denso con una ventana de contexto de 262 000 tokens (según fuentes externas, no confirmado en esta conversión) y licencia Apache 2.0. La conversión GGUF permite ejecutarlo en una amplia gama de hardware, desde CPU hasta GPUs de consumo, aunque el tamaño del archivo (29 GB) exige al menos 30 GB de memoria para cargarlo en Q8_0. Su relevancia radica en ofrecer una alternativa sin restricciones de seguridad para tareas de generación creativa, investigación y desarrollo de agentes, con un coste de capacidad mínimo gracias a la técnica Ektome.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.8-27B) |
| Parametros totales | 27 320 697 856 (27,3 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3.8-27B soporta 262 000 tokens segun fuentes externas) |
| Tipos de cuantizacion | Q8_0 (esta conversion); otras cuantizaciones (Q4_K_M, etc.) disponibles en repos del autor |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27 300 millones de parámetros, desarrollado por Alibaba, con una arquitectura similar a la familia Qwen2.5 pero con mejoras en eficiencia y capacidad de contexto. No se dispone de detalles específicos sobre el dataset de entrenamiento ni el proceso de alineación del modelo original, pero se sabe que Qwen3.8-27B fue entrenado con una combinación de datos multilingües y refinado con técnicas de RLHF y DPO.

La innovación principal de esta variante es la técnica Ektome, un método de ablación que elimina la dirección de rechazo del espacio de activaciones del modelo, logrando un comportamiento "uncensored" sin el deterioro típico de las ablaciones simples. Según la descripción del autor, el modelo resultante mantiene un nivel de rechazo del 1% en peticiones dañinas, mientras que las capacidades de razonamiento y conocimiento se conservan casi intactas (diferencia de +0.000 respecto al modelo pristino). Además, el modelo base incorpora soporte para multi-token prediction (MTP) y decodificación especulativa, lo que acelera la inferencia en hardware compatible.

## Capacidades

- Generación de texto libre y creativa sin restricciones de contenido (poesía, narrativa, guiones, etc.).
- Razonamiento lógico y matemático, heredado de Qwen3.8-27B, con buen desempeño en tareas de aritmética y resolución de problemas.
- Generación de código en múltiples lenguajes (Python, JavaScript, C++, etc.) y asistencia en depuración.
- Soporte de tool calling y function calling, lo que permite integrarlo en pipelines de agentes que invocan APIs o ejecutan acciones.
- Capacidad de multi-step reasoning y planificación, útil para tareas de agente autónomo.
- Soporte de multi-token prediction (MTP) y decodificación especulativa, que reduce la latencia en entornos compatibles (llama.cpp, vLLM).
- Capacidades multilingües limitadas: aunque la model card indica solo inglés, el modelo base Qwen3.8-27B soporta varios idiomas; esta conversión no garantiza el mismo rendimiento en otros idiomas.

## Casos de uso

- Generación creativa sin filtros: escritores y guionistas pueden usar el modelo para explorar temas tabú o controvertidos sin que el sistema imponga bloqueos automáticos, manteniendo la coherencia y calidad del texto.
- Investigación en IA de seguridad: investigadores pueden estudiar el comportamiento de modelos sin alineación de seguridad, analizando sesgos, alucinaciones y patrones de generación dañina en entornos controlados.
- Desarrollo de chatbots de rol: creadores de juegos de rol o asistentes virtuales pueden configurar personajes con personalidades extremas o temas adultos sin que el modelo se niegue a responder.
- Automatización de atención al cliente en dominios sensibles: aunque no es recomendable para contenido dañino, puede usarse en sectores como salud mental o educación sexual, donde las respuestas directas son necesarias, siempre con supervisión humana.
- Generación de código en entornos de desarrollo: gracias a su soporte de tool calling y su capacidad de razonamiento, puede integrarse en IDEs o pipelines de CI/CD para autocompletar, revisar y generar código, aunque su naturaleza uncensored requiere validación adicional.
- Prototipado rápido de agentes conversacionales: su compatibilidad con llama.cpp y GGUF permite desplegarlo en máquinas locales o en la nube con vLLM, facilitando experimentos de agentes multi-paso sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K u otros estándares para esta conversión GGUF. Se recomienda consultar la model card del modelo base (Zynerji/Ektome-Qwen3.8-27B-PristinelyUncensored) para posibles evaluaciones, aunque tampoco se han encontrado datos públicos.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q8_0 pesa aproximadamente 29 GB, por lo que se necesitan al menos 30 GB de VRAM para cargar el modelo completo en GPU. Con cuantizaciones más bajas (Q4_K_M, ~16 GB) se puede reducir el requisito a ~16-18 GB.
- GPU recomendadas: para Q8_0, una NVIDIA A100 40 GB o 80 GB, o una RTX 6000 Ada (48 GB) son adecuadas. Para Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) pueden funcionar, aunque con riesgo de quedarse cortas si el contexto es largo.
- En CPU: se puede ejecutar con llama.cpp usando RAM, pero la velocidad será baja (tokens por segundo en el orden de 1-5 según el hardware). Se recomienda al menos 32 GB de RAM.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama (si se importa el GGUF), vLLM (con conversión a safetensors), TGI (con adaptación). También se puede usar el espacio GGUF-my-repo para generar otras cuantizaciones.
- Latencia y throughput: no se dispone de datos medidos. En una A100 80 GB con Q8_0, se espera una velocidad de generación de 20-40 tokens/s, pero es una estimación orientativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Uncensored |
|---|---|---|---|---|---|
| Ektome-Qwen3.8-27B-PristinelyUncensored (GGUF Q8_0) | 27,3 B | 262k (base) | Apache 2.0 | GGUF | Sí |
| Qwen3.8-27B (original) | 27,3 B | 262k | Apache 2.0 | Safetensors | No |
| Llama 3.1 8B Instruct (uncensored via abliteration) | 8 B | 128k | Llama 3.1 | Safetensors/GGUF | Sí |

La comparativa directa con otros modelos uncensored de 27B es limitada porque la mayoría de las variantes abliterated se basan en modelos más pequeños (7B-13B). Frente al Qwen3.8-27B original, esta versión ofrece la ventaja de eliminar los rechazos de seguridad, pero a costa de un mayor riesgo de generar contenido dañino. En términos de rendimiento, se espera que sea prácticamente idéntico al original, ya que la técnica Ektome preserva las capacidades.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", puede generar contenido explícito, violento, discriminatorio o ilegal. No debe desplegarse en producción sin supervisión humana y filtros adicionales.
- Riesgo de alucinación: como cualquier LLM, puede inventar hechos, citas o datos, especialmente en dominios especializados. La ausencia de alineación de seguridad no reduce este riesgo.
- Sesgos: el modelo base Qwen3.8-27B puede contener sesgos de género, raza o ideología presentes en sus datos de entrenamiento, que la ablación no elimina.
- Limitaciones de idioma: la model card indica solo inglés, por lo que el rendimiento en otros idiomas puede ser inferior al del modelo base.
- Restricciones de licencia: aunque la licencia Apache 2.0 permite uso comercial, el contenido generado puede violar leyes de propiedad intelectual o normativas de contenido, responsabilidad del usuario.
- Compatibilidad: la conversión GGUF Q8_0 requiere llama.cpp versión reciente (con soporte para MTP y decodificación especulativa). No se garantiza el funcionamiento en versiones antiguas.
- Contexto: aunque el modelo base soporta 262k tokens, esta conversión GGUF no especifica la longitud de contexto máxima efectiva; se recomienda probar con valores conservadores (por ejemplo, 32k) para evitar degradación.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/CrocoCpp/Ektome-Qwen3.8-27B-PristinelyUncensored-Q8_0-GGUF
- Modelo base (safetensors): https://huggingface.co/Zynerji/Ektome-Qwen3.8-27B-PristinelyUncensored
- Otras cuantizaciones del autor: https://huggingface.co/CrocoCpp/Ektome-Qwen3.8-27B-PristinelyUncensored-Q4_K_M-GGUF
- Guía para ejecutar Qwen3.8-27B localmente (yottalabs.ai): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Guía de ejecución local (lu-labs.ai): https://lu-labs.ai/blog/how-to-run-qwen-3-8-27b-locally
- Página de evaluación del modelo (llm-explorer.com): https://llm-explorer.com/model/Zynerji%2FEktome-Qwen3.8-27B-PristinelyUncensored,2RRZbScVnr4ntDr90fDCmu
