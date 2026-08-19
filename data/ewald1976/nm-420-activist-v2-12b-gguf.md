# ewald1976/NM-420-activist-v2-12b-gguf

## Resumen

El modelo NM-420-activist-v2-12b-gguf es un fine-tune de Mistral NeMo Instruct 2407, un modelo de lenguaje de 12 mil millones de parámetros desarrollado por Mistral AI en colaboración con NVIDIA. Este repositorio, creado por el usuario ewald1976, ofrece una versión cuantizada en formato GGUF (Q6_K) del modelo ajustado, preparada para su uso con llama.cpp y Ollama. El nombre sugiere una especialización en temáticas de activismo, aunque no se proporciona documentación detallada sobre el proceso de ajuste o los datos utilizados.

La relevancia de este modelo radica en su base: Mistral NeMo es un transformer denso con una ventana de contexto de 128 000 tokens, diseñado para razonamiento multilingüe y generación de código. Al convertirlo a GGUF mediante Unsloth, se facilita su despliegue en entornos de CPU y GPU de consumo, lo que lo hace accesible para desarrolladores que necesitan un modelo de 12B con buen equilibrio entre calidad y requisitos de hardware.

El repositorio incluye únicamente el archivo cuantizado `mistral-nemo-instruct-2407.Q6_K.gguf`, un Modelfile para Ollama y las instrucciones básicas de uso. No se han publicado métricas de rendimiento, licencia ni idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Mistral NeMo Instruct 2407) |
| Parametros totales | 12 247 782 400 (12B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128 000 tokens (heredado del base, no confirmado para este fine-tune) |
| Tipos de cuantizacion | Q6_K (único archivo disponible) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (Q6_K) |

## Arquitectura y entrenamiento

El modelo base, Mistral NeMo Instruct 2407, emplea una arquitectura transformer estándar con atención de ventana deslizante (sliding window attention) y un mecanismo de atención con ventana de 128 000 tokens. Utiliza un tokenizador de vocabulario ampliado con soporte multilingüe (incluido el español) y está optimizado para instrucciones y razonamiento. El fine-tune NM-420-activist-v2 se realizó sobre esta base, aunque no se especifican los datos de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. La conversión a GGUF se llevó a cabo con Unsloth, que optimiza el proceso de cuantización y reduce el tiempo de entrenamiento en aproximadamente un 50 %.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Mistral NeMo Instruct.
- Razonamiento matemático y lógico básico, aunque sin métricas específicas para este fine-tune.
- Generación de código en múltiples lenguajes, capacidad presente en el modelo base.
- Soporte multilingüe, incluido el español, aunque no se confirma el alcance tras el ajuste.
- Compatibilidad con llama.cpp y Ollama, lo que permite ejecución local en CPU y GPU.
- No se documentan capacidades especiales como tool calling, visión o audio en este repositorio.

## Casos de uso

- Chatbots de asistencia en organizaciones sociales: el modelo puede gestionar conversaciones con contexto largo (hasta 128k tokens) sobre temas de activismo, derechos humanos o medio ambiente, aunque se debe validar su precisión en estos dominios.
- Generación de contenido educativo: redacción de artículos, guías o material formativo sobre causas sociales, aprovechando su base multilingüe.
- Análisis de documentos extensos: al heredar la ventana de 128k tokens, puede resumir informes, actas o legislación de gran tamaño sin truncar el contexto.
- Desarrollo de aplicaciones de código: asistencia en programación, revisión de código y generación de scripts, gracias a las capacidades de código del modelo base.
- Despliegue en entornos con recursos limitados: al estar cuantizado en Q6_K, puede ejecutarse en GPUs de consumo (como RTX 3060 o superiores) o incluso en CPU con suficiente RAM.
- Prototipado rápido con Ollama: el Modelfile incluido permite levantar un servidor local en minutos para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones MMLU, HumanEval, GSM8K ni comparativas con otros modelos. Se recomienda evaluar el modelo en las tareas específicas de interés antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q6_K ocupa aproximadamente 10,1 GB en disco. Para cargar el modelo completo en memoria, se recomienda al menos 12 GB de VRAM en GPU o 16 GB de RAM en CPU.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4080, A100 (para mayor velocidad). En GPUs con menos VRAM, se puede usar capas parciales en CPU con llama.cpp.
- Compatibilidad con consumer GPU: sí, siempre que se disponga de suficiente VRAM o se utilice offloading.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (con el Modelfile incluido), y cualquier servidor compatible con GGUF como llama-cpp-python o text-generation-webui.
- Latencia y throughput: no se han publicado datos específicos. En una RTX 4090, se puede esperar una velocidad de generación de entre 20 y 40 tokens por segundo para un modelo de 12B cuantizado, pero esto es una estimación general no confirmada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este fine-tune específico. Como referencia estructural, se puede comparar con el modelo base Mistral NeMo Instruct 2407 (12B) y con otros modelos de tamaño similar como Llama 3.1 8B o Qwen 2.5 7B, pero no hay información sobre cómo NM-420-activist-v2 se comporta frente a ellos. La única diferencia clara es el formato GGUF y la especialización temática indicada por el nombre, sin datos objetivos que respalden una comparativa.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, alucinaciones o limitaciones específicas de este fine-tune. Al estar basado en Mistral NeMo, hereda los riesgos generales de los modelos de lenguaje, como la generación de contenido falso o desactualizado.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o redistribución. Se debe contactar al autor antes de utilizarlo en entornos productivos.
- No se han documentado los idiomas soportados tras el ajuste, aunque el modelo base es multilingüe.
- El archivo GGUF es solo Q6_K; no se ofrecen otras cuantizaciones que puedan ser más adecuadas para hardware con menos memoria.
- No hay evidencia de que el modelo esté optimizado para tareas de activismo reales; el nombre puede ser orientativo pero no garantiza calidad en ese dominio.
- La fecha de creación (agosto de 2026) es futura, lo que sugiere que el repositorio puede ser experimental o no verificado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ewald1976/NM-420-activist-v2-12b-gguf
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- Proyecto llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com/
