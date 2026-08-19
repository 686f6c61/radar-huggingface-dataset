# CobrIX/CobrIX-1.0-Coder-Full-72B-A18B

## Resumen

CobrIX-1.0-Coder-Full-72B-A18B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por CobrIX, diseñado específicamente para tareas de generación de código y texto. Se construye ensamblando el modelo denso Qwen 3.5 base (`empero-ai/Qwythos-9B-v2`) con 13 modelos expertos densos fine-tuned, sin modificar, promediar ni interpolar ningún peso. El resultado es un decodificador con 72 mil millones de parámetros totales, de los cuales solo 18 mil millones se activan por token (A18B), lo que permite una inferencia más eficiente en comparación con un modelo denso del mismo tamaño.

El modelo destaca por su ventana de contexto nativa de 1.048.576 tokens (1M), una de las más amplias disponibles en modelos de código, y por combinar atención lineal y atención completa en sus 32 capas. Esta arquitectura híbrida busca equilibrar el rendimiento en contextos largos con el coste computacional. Aunque su nombre sugiere un enfoque en código, también es capaz de generar texto conversacional en portugués e inglés, los dos idiomas declarados en su ficha. Su licencia MIT y la disponibilidad de pesos en formatos safetensors y GGUF lo hacen accesible para integración en proyectos comerciales y de investigación, siempre que se respeten las licencias de los modelos base y expertos subyacentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen35MoEForCausalLM (MoE, decoder-only, con atención lineal y completa) |
| Parametros totales | 71.769.534.976 (~72B) |
| Parametros activos | ~18B (A18B) |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | no disponible (se menciona GGUF, pero sin especificar variantes) |
| Idiomas soportados | Portugués (pt), Inglés (en) |
| Licencia | MIT (sujeta a licencias de modelos base y expertos) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE basada en Qwen 3.5, con `model_type=qwen35_moe`. Cada capa transformer sustituye el MLP denso por un bloque MoE disperso compuesto por 13 expertos locales, de los cuales se seleccionan 2 mediante routing top-2 con softmax. Además, incluye un experto compartido siempre activo, basado en el MLP original, cuya activación se controla mediante una puerta sigmoide inicializada a cero. Los logits del router se calculan en precisión float32 para mayor estabilidad.

La estructura de atención es híbrida: de las 32 capas, 24 utilizan atención lineal (`linear_attn`) y 8 utilizan atención completa (`full_attention`), distribuidas de forma intercalada (cada 4 capas, una de atención completa). Esta combinación permite manejar contextos de hasta 1M de tokens con un coste computacional reducido en comparación con la atención completa en todas las capas.

El proceso de construcción no implica entrenamiento: el modelo base aporta embeddings, capas de atención lineal, normalizaciones, rotary embeddings y la cabeza de salida, mientras que los 13 expertos contribuyen únicamente con las proyecciones `gate_proj`, `up_proj` y `down_proj` de cada capa. No se ha publicado información sobre el dataset de entrenamiento, el número de tokens utilizados ni el método de fine-tuning (RLHF, DPO, etc.) de los expertos.

## Capacidades

- Generación de texto y código en portugués e inglés.
- Manejo de contextos extremadamente largos (hasta 1M de tokens) gracias a la combinación de atención lineal y completa.
- Razonamiento y resolución de problemas de programación gracias a su especialización en código.
- Soporte de conversación multi-turno (text-generation).
- Eficiencia en inferencia al activar solo 18B de sus 72B parámetros por token.
- Compatibilidad con Hugging Face Transformers mediante `trust_remote_code=True` (auto_map incluido).
- Disponibilidad en formato GGUF para ejecución con llama.cpp y herramientas compatibles.

## Casos de uso

- Generación de código en repositorios grandes: gracias a su contexto de 1M tokens, puede analizar y generar código teniendo en cuenta múltiples archivos y dependencias completas, algo crítico en proyectos empresariales de gran escala.
- Asistente de programación integrado en IDE: puede actuar como autocompletado avanzado o copiloto, sugiriendo implementaciones completas basadas en el contexto del proyecto.
- Refactorización y mantenimiento de código legacy: al procesar archivos extensos, puede proponer cambios de estilo, correcciones de errores o mejoras de rendimiento sin perder información de otras partes del sistema.
- Documentación automática de código: genera comentarios, docstrings y documentación técnica a partir de código fuente, útil para equipos que trabajan con bases de código grandes.
- Análisis de vulnerabilidades y revisión de código: con su capacidad de razonamiento y contexto largo, puede identificar patrones de riesgo o lógica defectuosa en fragmentos extensos.
- Chatbot técnico bilingüe: al soportar portugués e inglés, puede atender consultas de desarrolladores en ambos idiomas, manteniendo el contexto de conversaciones largas sin pérdida de información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: dado que el modelo tiene 72B parámetros totales, en FP16 se requieren aproximadamente 144 GB de VRAM solo para los pesos. Con cuantización a 8 bits se reduce a ~72 GB, y a 4 bits a ~36 GB. Estas cifras son estimaciones orientativas; no se dispone de datos oficiales.
- GPU recomendadas: para ejecutar el modelo completo en FP16 se necesitan GPUs de clase profesional como A100 80GB (varias en paralelo) o H100. Con cuantización 4-bit, una GPU con 48 GB de VRAM (por ejemplo, A6000 o L40S) podría ser suficiente, aunque no se ha verificado.
- En GPUs de consumo (RTX 4090 de 24 GB) no cabe el modelo completo ni siquiera en 4-bit; se requeriría una cuantización más agresiva (por ejemplo, Q2_K) o el uso de técnicas de offloading a CPU, con la consiguiente pérdida de rendimiento.
- Opciones de despliegue: al estar disponible en GGUF, puede ejecutarse con llama.cpp y sus bindings (Ollama, llama-cpp-python). También es posible cargarlo con Hugging Face Transformers usando `trust_remote_code=True`. No se ha confirmado soporte en vLLM u otros servidores de inferencia para esta arquitectura personalizada.
- Latencia y throughput: no se han publicado datos. Al ser un MoE con 18B activos, el coste por token es similar al de un modelo denso de 18B, pero la memoria requerida es la de los 72B completos.

## Comparativa con modelos similares

No se dispone de información comparativa en la documentación proporcionada. El modelo se posiciona como un MoE de código con contexto muy largo, pero no se han publicado benchmarks frente a alternativas como DeepSeek-Coder, Mixtral o Qwen2.5-Coder. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Idiomas limitados: solo se declaran portugués e inglés; el rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación: como todo modelo generativo, puede producir código o texto plausible pero incorrecto; se recomienda verificación humana en entornos de producción.
- Arquitectura personalizada: al ser un modelo con `custom_architecture`, requiere `trust_remote_code=True` y puede no ser compatible con todas las herramientas de inferencia estándar sin adaptación.
- Licencia MIT, pero sujeta a las licencias de los modelos base y expertos subyacentes; es necesario revisar los términos de `empero-ai/Qwythos-9B-v2` y de los 13 expertos antes de uso comercial.
- Sin información sobre sesgos o comportamientos específicos; al estar entrenado principalmente en código, puede reflejar sesgos presentes en los datos de código fuente.
- No se han publicado datos de entrenamiento ni de evaluación, lo que dificulta evaluar su robustez y fiabilidad en tareas concretas.

## Enlaces

- [Hugging Face: CobrIX/CobrIX-1.0-Coder-Full-72B-A18B](https://huggingface.co/CobrIX/CobrIX-1.0-Coder-Full-72B-A18B)
- [Modelo base: empero-ai/Qwythos-9B-v2](https://huggingface.co/empero-ai/Qwythos-9B-v2)
