# p4ik/Qwen3.8-27B-MLX-8bit

## Resumen

Este repositorio contiene una cuantización uniforme de 8 bits en formato MLX del modelo Qwen3.8-27B, desarrollada por el usuario p4ik para ejecutarse de forma nativa en Apple Silicon. Se trata de un modelo de lenguaje multimodal (visión y texto) que mantiene la torre de visión en bf16, incluye el cabezal de decodificación especulativa MTP pre-cuantizado a 8 bits y conserva las configuraciones del procesador del modelo base, algo que los pipelines de cuantización suelen descartar. El resultado es un paquete completo que funciona con los tres stacks principales de MLX: `optiq serve`, `mlx-vlm` y `vllm-mlx`.

La relevancia de esta versión reside en que ofrece la máxima fidelidad posible frente al modelo original en 8 bits, actuando como ancla de referencia para comparar otras cuantizaciones más agresivas (5 bits y 4 bits) del mismo autor. El autor reporta una pérdida de log-verosimilitud (ΔNLL) de 0.000 respecto al modelo base, lo que indica que no hay degradación medible en la distribución de salida. El modelo base, Qwen3.8-27B, es un modelo de Alibaba con licencia Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language), basado en Qwen3.8-27B |
| Parametros totales | 8.027.131.120 (según safetensors; el modelo base declara 27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit uniforme (group size 64); también existen versiones 4-bit y 5-bit del mismo autor |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una cuantización MLX del checkpoint original Qwen/Qwen3.8-27B, un modelo de lenguaje multimodal de Alibaba. La cuantización aplicada es uniforme: todas las capas se reducen a 8 bits con un tamaño de grupo de 64, sin precisión mixta. El repositorio incluye la torre de visión (vision tower) en bf16, el cabezal MTP (multi-token prediction) para decodificación especulativa pre-cuantizado a 8 bits, y las configuraciones del procesador de imágenes del modelo base, que son necesarias para que la entrada de imágenes funcione correctamente. Además, se incorpora una plantilla de chat endurecida adaptada de la versión de unsloth, que gestiona el rol `developer`, fusiona mensajes de sistema y protege los argumentos de las llamadas a herramientas.

No se dispone de información sobre el entrenamiento del modelo original (número de tokens, composición del dataset, métodos de alineación como RLHF o DPO). El proceso de cuantización en sí no implica entrenamiento adicional; se trata de una conversión de precisión.

## Capacidades

- Entrada de imágenes y texto, con salida de texto (pipeline image-text-to-text).
- Generación de texto conversacional y de razonamiento.
- Soporte de tool calling / function calling, con protección de argumentos en la plantilla de chat.
- Soporte de modos de pensamiento (thinking spans), verificado mediante pruebas de ΔNLL en esos segmentos.
- Decodificación especulativa mediante cabezal MTP, que acelera la inferencia sin pérdida de calidad.
- Compatibilidad con los tres entornos de ejecución MLX: `optiq serve`, `mlx-vlm` y `vllm-mlx`.
- Capacidades multilingües no confirmadas en esta versión (el modelo base de Qwen suele ser multilingüe, pero no se especifica en la documentación).

## Casos de uso

- Asistentes de visión por computadora en Mac: el modelo puede analizar imágenes y responder preguntas sobre ellas, por ejemplo, describir contenido de fotografías o extraer información de documentos escaneados, ejecutándose localmente en Apple Silicon sin conexión a la nube.
- Desarrollo de agentes conversacionales con llamada a herramientas: gracias al soporte de tool calling y a la plantilla endurecida, se puede integrar en asistentes que necesiten invocar APIs, bases de datos o servicios externos, manteniendo la integridad de los argumentos.
- Prototipado rápido de aplicaciones multimodales: al ser un paquete completo con procesador de imágenes y plantilla de chat, permite a desarrolladores montar demos funcionales en minutos usando `mlx-vlm` o `vllm-mlx`.
- Evaluación de fidelidad de cuantización: al ser el ancla de referencia en 8 bits con ΔNLL 0.000, sirve como punto de comparación para medir la degradación de otras cuantizaciones más agresivas en el mismo hardware.
- Inferencia local con requisitos de privacidad: al ejecutarse en hardware propio, es adecuado para aplicaciones que manejan datos sensibles y no pueden enviar información a servicios en la nube.
- Investigación en decodificación especulativa: el cabezal MTP pre-cuantizado permite experimentar con técnicas de aceleración de inferencia en MLX, comparando latencias y throughput frente a decodificación estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona una comparativa de fidelidad entre distintas cuantizaciones del mismo modelo, medida mediante la diferencia de log-verosimilitud (ΔNLL) sobre varios conjuntos de prueba. Esta métrica indica cuánto se desvía la distribución de salida de la cuantización respecto al modelo original en bf16.

| Metrica | uniform 8-bit (este repo) | OptiQ 5-bit | OptiQ 4-bit (p4ik) | OptiQ 4-bit (mlx-community) | uniform 4-bit |
|---|---:|---:|---:|---:|---:|
| ΔNLL overall | 0.000 (ancla) | +0.019 ± 0.019 | +0.029 ± 0.015 | +0.040 ± 0.030 | +0.038 ± 0.045 |
| ΔNLL prosa alemana | 0 | +0.023 ± 0.003 | +0.019 ± 0.002 | +0.022 ± 0.002 | +0.039 ± 0.003 |
| ΔNLL tool-call spans | 0 | −0.001 ± 0.013 | −0.008 ± 0.017 | +0.004 ± 0.005 | +0.013 ± 0.009 |
| ΔNLL thinking spans | 0 | −0.001 ± 0.014 | +0.004 ± 0.013 | −0.005 ± 0.021 | +0.008 ± 0.013 |
| Flips por 10k | — | 216 | 503 | 566 | 772 |

Los valores de ΔNLL cercanos a cero indican que la cuantización de 8 bits no introduce una pérdida medible de calidad. No se reportan métricas de velocidad ni latencia.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra).
- Memoria unificada estimada: el repositorio pesa 30,0 GB y los pesos ocupan 26,62 GiB. En 8 bits, se recomienda al menos 32 GB de memoria unificada para cargar el modelo y el contexto de inferencia; para trabajar con ventanas largas o lotes mayores, 64 GB es lo recomendable.
- No cabe en equipos con 16 GB de memoria unificada; el mínimo realista es una Mac con 32 GB o más.
- Opciones de despliegue: `optiq serve`, `mlx-vlm`, `vllm-mlx`, y también puede usarse a través de Ollama (etiqueta `qwen3.8:27b-mlx`, aunque esa versión es de 4 bits).
- No se dispone de datos de latencia ni throughput para esta cuantización específica.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Pesos (GiB) | BPW | ΔNLL overall | Licencia |
|---|---|---|---:|---:|---:|---|
| p4ik/Qwen3.8-27B-MLX-8bit (este) | ~27B | 8-bit uniforme | 26.62 | 8.50 | 0.000 (ancla) | Apache 2.0 |
| p4ik/Qwen3.8-27B-MLX-OptiQ-5bit | ~27B | OptiQ 5-bit | 17.67 | 5.64 | +0.019 | Apache 2.0 |
| p4ik/Qwen3.8-27B-MLX-OptiQ-4bit | ~27B | OptiQ 4-bit | 18.06 | 5.77 | +0.029 | Apache 2.0 |
| mlx-community/Qwen3.8-27B-8bit | ~27B | 8-bit | no disponible | no disponible | no disponible | Apache 2.0 |

La comparativa con `mlx-community/Qwen3.8-27B-8bit` no incluye datos de fidelidad; la versión de p4ik añade el cabezal MTP, las configuraciones del procesador y la plantilla endurecida, que la versión de mlx-community puede no incluir. En cuanto a las cuantizaciones de menor precisión del mismo autor, la de 8 bits es la que ofrece la menor pérdida de calidad, a costa de un mayor uso de memoria.

## Limitaciones y advertencias

- Al ser una cuantización de 8 bits, el tamaño en memoria es considerablemente mayor que las versiones de 4 o 5 bits; requiere hardware con al menos 32 GB de RAM unificada.
- No se dispone de información sobre la longitud de contexto soportada ni sobre los idiomas cubiertos; se debe consultar la documentación del modelo base Qwen3.8-27B para esos detalles.
- La fecha de creación del repositorio (agosto de 2026) es posterior a la fecha actual de este análisis; no se ha verificado su disponibilidad a largo plazo.
- El número de parámetros reportado en safetensors (8.027.131.120) es inconsistente con la denominación "27B" del modelo base; es probable que se trate de un error de lectura o de metadatos, pero se reproduce tal cual aparece en la información proporcionada.
- El modelo base puede presentar sesgos y alucinaciones propios de los modelos de lenguaje; la cuantización no corrige estos problemas.
- No se han publicado benchmarks de rendimiento tarea-específica (razonamiento, código, matemáticas) para esta versión cuantizada; la única métrica disponible es la fidelidad de distribución (ΔNLL).
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero no se incluye garantía alguna sobre el funcionamiento en entornos de producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/p4ik/Qwen3.8-27B-MLX-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión de unsloth con plantilla endurecida: https://huggingface.co/unsloth/Qwen3.8-27B
- Otras cuantizaciones del mismo autor:
  - https://huggingface.co/p4ik/Qwen3.8-27B-MLX-OptiQ-5bit
  - https://huggingface.co/p4ik/Qwen3.8-27B-MLX-OptiQ-4bit
  - https://huggingface.co/p4ik/Qwen3.8-27B-MLX-4bit
- Versión de mlx-community (8-bit, sin extras): https://huggingface.co/mlx-community/Qwen3.8-27B-8bit
- Guía de ejecución local en Apple Silicon: https://www.orcarouter.ai/blog/qwen-3-8-27b-mlx
- Recetas de vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Guía detallada para ejecutar Qwen3.8-27B localmente: https://linas.substack.com/p/qwen3-8-27b-local-guide
