# mradermacher/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-i1-GGUF

## Resumen

El modelo `mradermacher/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-i1-GGUF` es una cuantización GGUF con matriz de importancia (imatrix) del fine-tune `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, realizado por el cuantizador mradermacher. Este fine-tune parte del modelo base Qwen3.8-27B de Alibaba, un transformer denso de 27 000 millones de parámetros con capacidades de razonamiento, visión y agente, publicado bajo licencia Apache 2.0. El nombre del modelo indica el uso de técnicas de fine-tuning como "Cold Fusion" y "GAIN Training", además de un proceso de "abliteración" (etiqueta `heretic`) que elimina los mecanismos de rechazo, dando lugar a una versión "uncensored".

La relevancia de esta cuantización reside en que permite ejecutar un modelo de 27B en hardware de consumo gracias al formato GGUF y a la cuantización de baja precisión (i1-Q2_K), que reduce el peso a aproximadamente 11 GB. El repositorio incluye únicamente un archivo GGUF cuantizado y el archivo de matriz de importancia, lo que lo hace adecuado para inferencia local con llama.cpp, Ollama u otros motores compatibles. No se proporcionan métricas de rendimiento ni detalles adicionales sobre el proceso de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.8-27B: 64 capas, hidden size 5120, vocabulario de 248 320 tokens) |
| Parametros totales | 27 320 697 856 (27,32 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible para este fine-tune; el modelo base Qwen3.8-27B soporta 256 000 tokens |
| Tipos de cuantizacion | i1-Q2_K (GGUF, 11 GB) y archivo imatrix; otros quants estaticos disponibles en el repositorio hermano |
| Idiomas soportados | en (segun la etiqueta del modelo; el base Qwen3.8-27B soporta ingles y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); safetensors para el modelo base original |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con 64 capas, dimensiones ocultas de 5120 y un vocabulario de 248 320 tokens. Incluye un codificador de visión de aproximadamente 1B de parámetros, lo que le confiere capacidades multimodales. El fine-tune `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU` aplica técnicas denominadas "Cold Fusion" y "GAIN Training" (multi-stage tuning), aunque no se especifican los detalles del dataset ni el número de tokens de entrenamiento. La etiqueta `heretic` sugiere el uso de abliteración, un método que elimina las direcciones de activación responsables de los rechazos, resultando en un modelo "uncensored". No se dispone de información sobre el uso de RLHF o DPO en este fine-tune.

La cuantización i1-Q2_K realizada por mradermacher utiliza una matriz de importancia (imatrix) para optimizar la asignación de bits, reduciendo el tamaño del modelo a 11 GB. Este tipo de cuantización de baja precisión conlleva una pérdida de calidad respecto al modelo en punto flotante, pero permite su ejecución en GPUs de consumo.

## Capacidades

- Generación de texto y conversación multi-turno en inglés.
- Razonamiento y resolución de problemas, heredados del modelo base Qwen3.8-27B.
- Generación de código y soporte para tareas de programación.
- Capacidades matemáticas básicas y avanzadas.
- Soporte de tool calling y function calling (según las capacidades del base, aunque no confirmado para este fine-tune).
- Capacidades de agente y razonamiento multi-paso (heredadas del base).
- Al estar "uncensored", no aplica los mecanismos de rechazo habituales, lo que permite generar contenido que otros modelos se negarían a producir.
- No se confirma la capacidad de visión en este quant GGUF, ya que no se incluyen archivos mmproj en el repositorio.

## Casos de uso

- Generación de ficción y escritura creativa: el modelo puede producir narrativas largas y detalladas sin las restricciones de censura típicas, lo que resulta útil para autores que exploran temas controvertidos o maduros.
- Asistente conversacional para entornos controlados: su naturaleza "uncensored" permite simular diálogos sin filtros, útil en investigación sobre comportamiento de modelos o en aplicaciones de rol.
- Experimentación con fine-tunes y cuantización: al ser un GGUF de bajo peso, es adecuado para probar técnicas de inferencia local, ajuste de prompts y evaluación de calidad en hardware modesto.
- Generación de código en entornos de desarrollo: aunque no se han publicado benchmarks, el modelo base Qwen3.8-27B destaca en tareas de programación; este fine-tune podría emplearse en asistentes de código sin restricciones de contenido.
- Análisis de textos y generación de resúmenes: su capacidad de razonamiento permite procesar documentos largos (si se respeta el límite de contexto) y extraer información relevante.
- Prototipado de aplicaciones de IA generativa: su licencia Apache 2.0 y su tamaño reducido lo hacen atractivo para integrarlo en proyectos comerciales o de investigación sin costes de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras métricas para este fine-tune ni para su cuantización. El modelo base Qwen3.8-27B ha mostrado buen rendimiento en tareas de razonamiento y código, pero no se pueden extrapolar cifras concretas a esta versión cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo i1-Q2_K ocupa 11 GB, por lo que se recomienda al menos 12 GB de VRAM para cargar el modelo con contexto moderado. Con cuantizaciones más altas (Q4_K_M, Q6_K) se necesitarían 14-18 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 o superiores. Para una experiencia fluida, se sugiere una GPU con al menos 16 GB.
- En consumer GPU: sí, cabe en GPUs de 12 GB o más, aunque con limitaciones de velocidad y contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o servidores compatibles con GGUF como llama-cpp-python.
- Latencia y throughput: no disponibles. En una RTX 3060, se puede esperar una velocidad de generación de 5-10 tokens por segundo con Q2_K, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,32 B | 256K | Apache 2.0 | safetensors | Modelo original de Alibaba, con visión y razonamiento |
| Este fine-tune (DavidAU) | 27,32 B | No disponible | Apache 2.0 | safetensors (original) / GGUF | Fine-tune "uncensored" con abliteración |
| Otros fine-tunes "uncensored" (p.ej. Dolphin) | Varía | Varía | Varía | Varía | No se dispone de datos concretos para comparar |

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de la misma categoría. La principal diferencia frente al base es la eliminación de los mecanismos de rechazo y la cuantización de baja precisión.

## Limitaciones y advertencias

- La cuantización i1-Q2_K introduce una pérdida significativa de calidad y puede aumentar la tasa de alucinaciones o errores gramaticales.
- Al ser un modelo "uncensored", puede generar contenido ofensivo, ilegal o peligroso. No se recomienda su uso en aplicaciones públicas sin moderación adicional.
- No se ha verificado la capacidad de visión en este quant; el modelo base incluye un codificador de visión, pero no se proporcionan archivos mmproj en este repositorio.
- El idioma declarado es solo inglés, aunque el base soporta chino; no se garantiza un buen rendimiento en otros idiomas.
- No se han publicado resultados de benchmarks ni evaluaciones de seguridad, por lo que se desconoce su comportamiento real en tareas estándar.
- La licencia Apache 2.0 permite uso comercial, pero el nombre del modelo y las técnicas empleadas (abliteración) pueden plantear cuestiones éticas y legales en algunos contextos.
- El contexto máximo no está confirmado para este fine-tune; si se reduce respecto al base, podría afectar a tareas que requieran ventanas largas.

## Enlaces

- Repositorio HuggingFace del GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-i1-GGUF
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de quants estáticos: https://huggingface.co/mradermacher/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-GGUF
- Documentación de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Artículo sobre ejecución local de Qwen3.8-27B: https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
