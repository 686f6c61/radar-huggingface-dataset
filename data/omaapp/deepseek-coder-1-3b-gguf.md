# OMAAPP/deepseek-coder-1.3b-gguf

## Resumen

OMAAPP/deepseek-coder-1.3b-gguf es un espejo (mirror) en formato GGUF del modelo DeepSeek Coder 1.3B Instruct, publicado originalmente por TheBloke. El modelo base, desarrollado por DeepSeek, es un modelo de lenguaje especializado en código, entrenado desde cero con 2 billones de tokens compuestos por un 87 % de código y un 13 % de lenguaje natural en inglés y chino. Con 1.346 millones de parámetros y una ventana de contexto de 16 000 tokens, está diseñado para tareas de generación, completado y relleno de código en más de 80 lenguajes de programación.

Este espejo concreto ofrece una única cuantización Q5_K_M, lo que permite ejecutar el modelo en hardware modesto, incluidas CPU y GPU con poca memoria. Es relevante para desarrolladores que necesitan un asistente de código ligero, desplegable en entornos con recursos limitados o en aplicaciones embebidas, manteniendo una licencia Apache 2.0 que permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) |
| Parametros totales | 1.346.471.936 (1,3 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 16 000 tokens |
| Tipos de cuantizacion | Q5_K_M (GGUF) |
| Idiomas soportados | Inglés y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo DeepSeek Coder 1.3B Base fue entrenado desde cero sobre un corpus de 2 billones de tokens, con una composición de 87 % de código fuente y 13 % de lenguaje natural en inglés y chino. La arquitectura es un transformer decoder-only estándar, sin mecanismos de atención lineal ni mezcla de expertos. Sobre la versión base, DeepSeek publicó una variante instruct afinada con instrucciones y diálogos, que es la que se refleja en este espejo GGUF. No se han detallado en la información disponible los métodos de alineación (como RLHF o DPO) utilizados para la versión instruct.

El modelo soporta una ventana de contexto de 16 000 tokens, lo que permite manejar proyectos de código a nivel de archivo o función, y admite tareas de relleno (infilling) además de completado estándar. La cuantización Q5_K_M aplicada por TheBloke conserva un equilibrio razonable entre calidad y tamaño, con un peso final de aproximadamente 1 GB.

## Capacidades

- Generación de código en más de 80 lenguajes de programación, incluidos Python, Java, C++, JavaScript, Go y Rust.
- Completado de código a nivel de línea, función o bloque, con soporte para relleno (infilling) en medio de un fragmento.
- Comprensión de contexto largo (16 000 tokens) para mantener coherencia en proyectos medianos.
- Asistencia en tareas de programación como explicación de código, generación de comentarios y detección de errores simples.
- Capacidades multilingües limitadas a inglés y chino, tanto en código como en lenguaje natural.
- No se ha confirmado soporte para tool calling, function calling o uso como agente autónomo en la información disponible.

## Casos de uso

- Autocompletado en editores de código: el modelo puede integrarse en extensiones de VS Code o plugins de IDE para sugerir continuaciones de código en tiempo real, gracias a su tamaño reducido y baja latencia en CPU.
- Asistente de programación en entornos sin GPU: al ser un GGUF de 1 GB, puede ejecutarse en portátiles o servidores sin aceleración gráfica mediante llama.cpp o Ollama, ofreciendo ayuda contextual sin depender de la nube.
- Generación de documentación técnica: dado su entrenamiento en lenguaje natural, puede producir comentarios, docstrings y explicaciones de fragmentos de código en inglés o chino.
- Educación y aprendizaje de programación: sirve como tutor interactivo que responde preguntas sobre sintaxis o lógica básica, con un coste de despliegue mínimo.
- Prototipado rápido en entornos embebidos: su tamaño permite ejecutarlo en dispositivos con poca memoria, como Raspberry Pi o sistemas edge, para tareas de generación de código simple.
- Pruebas de concepto en pipelines de CI/CD: puede usarse para generar casos de prueba o esqueletos de código en entornos de integración continua donde los recursos son limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original DeepSeek Coder 1.3B Base reporta en su documentación un rendimiento competitivo en tareas de código frente a otros modelos de tamaño similar, pero los valores numéricos concretos (MMLU, HumanEval, GSM8K, etc.) no se han proporcionado en esta ficha.

## Requisitos de hardware

- VRAM estimada: con la cuantización Q5_K_M, el archivo pesa aproximadamente 1 GB, por lo que cabe en GPUs con 2 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050) o incluso integradas con soporte Vulkan.
- Ejecución en CPU: viable mediante llama.cpp u Ollama, con latencia aceptable para tareas interactivas (del orden de 10-20 tokens por segundo en CPU modernas).
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con conversión a formato compatible), llama-cpp-python, o servidores GGUF como llama-server.
- Latencia y throughput: no se han proporcionado datos exactos, pero para un modelo de 1,3 B cuantizado, se espera un throughput de decenas de tokens por segundo en GPU y de 5-15 tokens por segundo en CPU.

## Comparativa con modelos similares

No se dispone de una comparativa cuantitativa con datos concretos en la información proporcionada. A modo orientativo, este modelo se sitúa en la misma categoría que otros modelos de código pequeños como CodeLlama 7B, StarCoderBase 3B o CodeGen 2B, pero no se pueden ofrecer cifras de rendimiento sin fuentes verificables.

## Limitaciones y advertencias

- Al ser un modelo de 1,3 B, su capacidad de razonamiento complejo y generación de código extenso es limitada en comparación con modelos más grandes.
- Puede producir alucinaciones, especialmente en contextos poco comunes o con entradas ambiguas.
- La ventana de contexto de 16 000 tokens es amplia, pero en la práctica la coherencia se degrada en fragmentos muy largos.
- Solo soporta inglés y chino; no se ha entrenado para otros idiomas naturales.
- La cuantización Q5_K_M introduce una ligera pérdida de calidad frente al modelo original en FP16, aunque es mínima para la mayoría de usos.
- El espejo no incluye otros formatos de cuantización; para otras variantes hay que acudir al repositorio original de TheBloke.
- No se ha verificado el soporte de tool calling ni de uso como agente autónomo; para esos casos se recomienda evaluar modelos más recientes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OMAAPP/deepseek-coder-1.3b-gguf
- Modelo original en HuggingFace: https://huggingface.co/deepseek-ai/deepseek-coder-1.3b-base
- Página oficial de DeepSeek Coder: https://deepseekcoder.github.io/
- Repositorio GGUF de TheBloke: https://huggingface.co/TheBloke/deepseek-coder-1.3b-base-GGUF
- Repositorio GitHub de DeepSeek Coder: https://github.com/deepseek-ai/deepseek-coder
- Repositorio GitHub de DeepSeek Coder V2: https://github.com/deepseek-ai/DeepSeek-Coder-V2
