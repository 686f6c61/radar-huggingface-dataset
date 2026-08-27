# jchonde/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF

## Resumen

El modelo `jchonde/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF` es una variante comunitaria del modelo base Qwen/Qwen3.8-27B, publicada en formato GGUF y modificada con un perfil de "uncensoring" agresivo desarrollado por HauhauCS. El objetivo es eliminar los comportamientos de rechazo del modelo original, ofreciendo respuestas directas sin preámbulos ni negativas ante instrucciones complejas o sensibles. Según la model card, el perfil Aggressive consigue 0/465 rechazos en pruebas internas, manteniendo intactas las capacidades de texto, razonamiento, agente, imagen y vídeo del modelo base.

Técnicamente, se trata de un modelo denso de 27B parámetros con arquitectura híbrida (48 capas Gated DeltaNet y 16 capas de atención gated), contexto nativo de 262.144 tokens ampliable hasta 1.000.000, y un head MTP/NextN nativo que se complementa con el sidecar HauhauCS FastMTP para acelerar la generación especulativa. El repo incluye una amplia gama de cuantizaciones GGUF (desde Q8_K_P hasta IQ2_M), un proyector de visión en BF16 y el sidecar FastMTP, lo que permite desplegarlo en hardware muy diverso. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La relevancia de este modelo radica en su doble vertiente: por un lado, ofrece una alternativa "sin censura" para casos de uso donde el modelo base rechaza peticiones legítimas (por ejemplo, investigación sobre temas controvertidos); por otro, incorpora optimizaciones de velocidad de generación (FastMTP) que mejoran el rendimiento en tareas de documento largo y razonamiento. No obstante, al ser una modificación comunitaria no oficial, carece de garantías de calidad y debe evaluarse cuidadosamente antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Denso, 64 capas, hidden size 5.120, FFN 17.408; 48 capas Gated DeltaNet + 16 capas gated-attention |
| Parametros totales | 27B (según model card; el dato de safetensors del repo indica 1.863.907.840, posible error) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.000.000 |
| Tipos de cuantizacion | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, IQ3_XS, Q2_K_P, IQ2_M |
| Idiomas soportados | Inglés, chino, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors del modelo base disponible en Qwen/Qwen3.8-27B) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina 48 capas con Gated DeltaNet (una variante de SSM lineal) y 16 capas de atención gated tradicional. Esta mezcla busca equilibrar eficiencia computacional y capacidad de atención a largo plazo. El vocabulario está ampliado a 248.320 tokens, y el modelo incorpora de forma nativa un head MTP (Multi-Token Prediction) / NextN que permite predecir varios tokens por paso, lo que acelera la generación en runtimes compatibles.

Sobre esta base, HauhauCS aplicó un perfil de "uncensoring" agresivo mediante técnicas de abliteración (ablación de direcciones de rechazo) y ajuste de pesos, sin modificar el dataset ni las capacidades originales. El resultado es un modelo que responde directamente a instrucciones que el modelo base rechazaría, con un mínimo preámbulo. Además, el repo incluye el sidecar HauhauCS FastMTP, un perfil de aceleración específico para la decodificación especulativa que, según la model card, logra hasta 3,02x de velocidad en generación de documentos y 1,93x en razonamiento frente a la versión sin MTP, y hasta un 35,2% más de velocidad en documentos y 21,1% en razonamiento frente al MTP embebido estándar.

No se han publicado detalles sobre el dataset de entrenamiento del perfil uncensored ni sobre el proceso exacto de ajuste. El modelo base Qwen3.8-27B fue entrenado por Alibaba con datos multilingües, pero esa información no está disponible en la documentación de este repo.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo tareas de matemáticas, lógica y análisis.
- Generación de código y soporte de tool calling / function calling, lo que permite integrarlo en pipelines de agentes.
- Capacidades de agente y razonamiento multi-paso, con soporte de "thinking mode" (modo de pensamiento) heredado del modelo base.
- Multimodal: procesamiento de imágenes y vídeo a través del proyector de visión BF16 incluido (mmproj). El pipeline declarado es `image-text-to-text`.
- Multilingüe: inglés, chino y otros idiomas, con especial solvencia en los dos primeros.
- Perfil "uncensored" agresivo: responde sin rechazos ni preámbulos a instrucciones que el modelo base consideraría sensibles o controvertidas.
- Aceleración por decodificación especulativa mediante el head MTP nativo y el sidecar FastMTP, que mejora la velocidad de generación en documentos largos y tareas de razonamiento.

## Casos de uso

- Investigación académica sobre temas controvertidos: el modelo puede analizar y discutir abiertamente cuestiones de ética, política o sociología que otros modelos rechazan, facilitando la exploración de argumentos sin sesgo de censura.
- Generación de código en entornos de desarrollo: gracias al soporte de tool calling y a su capacidad de razonamiento, puede integrarse en asistentes de programación, generación de tests o revisión de código, con la ventaja de no negarse a implementar funcionalidades que otros modelos consideran "sensibles" (por ejemplo, scripts de automatización ofensiva en entornos controlados).
- Atención al cliente automatizada con contexto largo: su ventana de 262K tokens permite mantener conversaciones multi-turno extensas, recordando detalles de interacciones previas sin perder coherencia.
- Análisis de documentos extensos: la combinación de contexto largo y FastMTP lo hace adecuado para resumir, extraer información o responder preguntas sobre contratos, informes o libros completos, con una velocidad de generación superior a la de modelos sin MTP.
- Procesamiento de imágenes y vídeo: el proyector de visión permite usarlo en tareas de captioning, respuesta a preguntas visuales o análisis de contenido multimedia, manteniendo el perfil sin censura.
- Simulación de personajes o escritura creativa sin restricciones: para proyectos de ficción interactiva o generación de diálogos donde se requiere explorar temas adultos o controvertidos sin filtros automáticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta métricas de velocidad de generación relativas al uso de MTP/FastMTP:

| Métrica | Mejora frente a no-MTP | Mejora frente a MTP embebido |
|---|---|---|
| Velocidad de generación en documentos | Hasta 3,02x | Hasta 35,2% |
| Velocidad de generación en razonamiento | Hasta 1,93x | Hasta 21,1% |

Estos datos provienen de pruebas internas del autor y no han sido verificados de forma independiente. Tampoco se han publicado resultados de tasas de rechazo más allá del dato de 0/465 refusals, que carece de contexto metodológico.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (tamaño de archivo + overhead de KV cache y runtime):
  - Q8_K_P (31,46 GB): requiere al menos 40 GB de VRAM, apto para A100 40/80GB, H100, o configuraciones multi-GPU.
  - Q6_K_P (25,92 GB): mínimo 32 GB de VRAM, apto para A100 40GB o RTX 6000 Ada.
  - Q5_K_P (20,22 GB): mínimo 24 GB de VRAM, cabe en RTX 4090, A5000 o similar.
  - Q4_K_P (17,92 GB): mínimo 20-24 GB de VRAM, apto para RTX 4090, RTX 4080 16GB (con offloading parcial) o A4500.
  - IQ4_XS (15,71 GB): mínimo 16-20 GB de VRAM, cabe en RTX 4080 16GB o RTX 3090.
  - Q3_K_P (13,44 GB) e IQ3_M (12,79 GB): mínimo 16 GB de VRAM, apto para RTX 4070 Ti Super o RTX 3090.
  - Q2_K_P (10,68 GB) e IQ2_M (10,32 GB): mínimo 12-16 GB de VRAM, apto para RTX 4070 o RTX 3060 12GB.
- GPU recomendadas: NVIDIA con soporte CUDA (serie 30, 40, A100, H100). En Apple Silicon se puede usar a través de llama.cpp con Metal, aunque el rendimiento será inferior.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (con archivos Modelfile), y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, se puede usar vLLM o TGI, pero el perfil uncensored y el sidecar FastMTP solo están disponibles en GGUF.
- Latencia y throughput: no se han publicado mediciones independientes. Según la model card, el uso de FastMTP puede multiplicar por hasta 3x la velocidad de generación en documentos largos, pero esto depende del hardware y del runtime.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Apache 2.0 | safetensors | Modelo original de Alibaba, con censura estándar |
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive (este) | 27B | 262K | Apache 2.0 | GGUF | Perfil uncensored agresivo + FastMTP |
| orcarouter/Qwen3.8-27B-Uncensored | 27B | 262K | Apache 2.0 | GGUF | Variante abliterada a nivel de tensor, 0% over-refusal en XSTest |

No se dispone de datos de benchmarks comparativos entre estas variantes. La principal diferencia entre las dos variantes uncensored es el método de modificación (abliteración a nivel de tensor en el caso de orcarouter frente al perfil HauhauCS) y la inclusión del sidecar FastMTP en la versión de HauhauCS. Ambas mantienen las capacidades multimodales y de agente del modelo base.

## Limitaciones y advertencias

- El perfil "uncensored" agresivo elimina los mecanismos de rechazo del modelo base, lo que puede llevar a generar contenido dañino, ilegal o éticamente problemático si se usa sin supervisión. El autor recomienda la variante Balanced para tareas críticas de larga duración.
- No se han publicado evaluaciones independientes de calidad, sesgos o alucinaciones. El dato de 0/465 refusals proviene de pruebas internas sin metodología detallada.
- El modelo puede alucinar igual que el base, especialmente en tareas de razonamiento complejo o con contextos muy largos. No hay garantías de fiabilidad factual.
- La discrepancia entre el dato de parámetros de safetensors (1,86B) y la declaración de 27B en la model card sugiere posibles errores en el repo; se recomienda verificar la integridad de los archivos antes de su uso.
- Los quants K_P son personalizados de HauhauCS y pueden mostrar problemas de visualización en LM Studio (aparecen como "?"), aunque funcionan correctamente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener restricciones adicionales de uso aceptable según los términos de Alibaba; se recomienda revisar la documentación oficial.
- Al ser una modificación comunitaria no oficial, no hay soporte técnico ni garantías de mantenimiento. El repo tiene 0 descargas y 0 likes, lo que indica un uso muy limitado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jchonde/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Repositorio original de HauhauCS (misma versión): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Guía de despliegue en LM Studio: https://localairig.com/models/qwen3-8-27b-uncensored-hardware-deployment-guide/
- Guía de ejecución local con llama.cpp: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Variante uncensored alternativa en Ollama: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Repositorio GitHub de la comunidad: https://github.com/Wassimyounes01/qwen38-uncensored
