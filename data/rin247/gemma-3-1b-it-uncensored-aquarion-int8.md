# Rin247/gemma-3-1b-it-Uncensored-Aquarion-INT8

## Resumen

Rin247/gemma-3-1b-it-Uncensored-Aquarion-INT8 es una variante cuantizada y "abliterada" del modelo Gemma 3 1B Instruct de Google. El autor, Rin247, ha aplicado dos transformaciones sobre el modelo original: primero, una técnica de abliteración por proyección ortogonal que elimina la dirección de rechazo aprendida durante el entrenamiento con retroalimentación humana, y después una cuantización INT8 weight-only mediante RTN (round-to-nearest) en CPU. El resultado es un modelo de aproximadamente 1.000 millones de parámetros que ocupa 1,3 GB en disco y que responde a peticiones que el modelo base rechazaría por políticas de seguridad.

Este modelo pertenece a la "forja Genesis of Aquarion", un proyecto que produce variantes sin censura de modelos abiertos populares. Su relevancia radica en que ofrece una alternativa ligera y de bajo coste computacional para desarrolladores que necesitan un modelo pequeño, ejecutable en hardware modesto y sin restricciones de contenido. Al estar basado en Gemma 3, hereda la arquitectura transformer con atención local-global y una ventana de contexto de hasta 128K tokens en el modelo base, aunque esta variante solo maneja texto (no visión). La cuantización INT8 reduce el uso de memoria a aproximadamente un cuarto del tamaño en FP32, permitiendo su ejecución en GPUs de consumo o incluso en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), atencion local-global con sliding window |
| Parametros totales | 999.885.952 (~1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en esta variante (el modelo base soporta 128K tokens) |
| Tipos de cuantizacion | INT8 weight-only (metodo RTN, escalas almacenadas junto a los pesos) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el modelo base usa Gemma Terms of Use, pero esta variante no lo declara) |
| Formato de pesos | safetensors con cuantizacion INT8 weight-only custom (pesos + buffers `weight_scale` y `weight_shape`) |

## Arquitectura y entrenamiento

El modelo base, Gemma 3 1B Instruct, es un transformer decoder-only con 1.000 millones de parámetros, entrenado por Google sobre aproximadamente 2 billones de tokens de texto y código, con un enfoque multimodal que incluye vision. Su arquitectura emplea atención local y global (sliding window) para reducir el uso de memoria en KV-cache, lo que permite contextos largos de hasta 128K tokens. La variante de Rin247, sin embargo, se distribuye como `gemma3_text`, es decir, solo la parte de texto del modelo.

Sobre esta base, el autor ha aplicado dos modificaciones. Primero, la abliteración: mediante proyección ortogonal se identifica y elimina la dirección del vector de rechazo (refusal direction) en el espacio de activaciones, de forma que el modelo deja de negarse a responder a ciertos tipos de peticiones. Segundo, la cuantización INT8 weight-only: los pesos se redondean al entero de 8 bits más cercano (RTN) en CPU, y se guardan junto con las escalas y formas originales en archivos safetensors. No se ha realizado ningún entrenamiento adicional ni ajuste fino; se trata de una transformación post-entrenamiento.

## Capacidades

- Generación de texto autoregresiva en lenguaje natural, con razonamiento básico, matemáticas simples y comprensión de instrucciones, heredadas del modelo base Gemma 3 1B.
- Soporte de tool calling y function calling, ya que el modelo base fue entrenado para ello (aunque no se ha verificado en esta variante cuantizada).
- Capacidad de procesar contextos largos (hasta 128K tokens en el modelo base, no confirmado aquí) gracias a la atención local-global.
- Multilingüe: el modelo base soporta más de 140 idiomas, aunque esta variante no especifica la lista.
- Respuesta sin restricciones de seguridad: el abliterado elimina el rechazo a contenido considerado sensible (violencia, sexualidad, instrucciones peligrosas, etc.).
- Solo texto: no incluye capacidades de visión ni audio, a diferencia del modelo base multimodal.

## Casos de uso

- Prototipado rápido de chatbots locales sin censura: por su tamaño reducido y cuantización INT8, puede ejecutarse en una GPU de consumo (por ejemplo, RTX 3060) o en CPU, permitiendo a desarrolladores probar interacciones sin filtros de seguridad en entornos de desarrollo.
- Generación creativa de ficción y narrativa: escritores pueden usar el modelo para producir textos con temáticas adultas o controvertidas que otros modelos rechazarían, gracias a la abliteración.
- Investigación en seguridad de IA (red teaming): evaluar cómo responde un modelo sin mecanismos de rechazo ante prompts maliciosos o peligrosos, útil para estudiar sesgos y vulnerabilidades de los modelos base.
- Asistencia en análisis de documentos largos: con la ventana de contexto amplia del modelo base, puede resumir o extraer información de textos extensos (informes, artículos) en un solo paso.
- Generación de código en entornos sin conexión: el modelo base tiene capacidades de código; esta variante cuantizada puede integrarse en pipelines de desarrollo local donde no se requiere conexión a internet ni hardware caro.
- Experimentación educativa: estudiantes e investigadores pueden explorar el efecto de la abliteración y la cuantización en el comportamiento de un modelo pequeño, comparando respuestas con la versión original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Esta variante cuantizada y abliterada no incluye métricas propias (MMLU, HumanEval, GSM8K, etc.). Los benchmarks del modelo base Gemma 3 1B están disponibles en el paper técnico (arXiv:2503.19786), pero la cuantización INT8 y la abliteración pueden alterar el rendimiento de forma no documentada. Se recomienda evaluar el modelo en las tareas específicas de uso antes de desplegarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB para los pesos en INT8, más overhead de activaciones y KV-cache. Con contexto corto (2K tokens), cabría en GPUs con 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 3060, etc.). También puede ejecutarse en CPU con 8 GB de RAM, aunque la latencia será mayor.
- Cabe en GPUs de consumo: sí, en la mayoría de las tarjetas modernas para juegos.
- Opciones de despliegue: el formato es un safetensors custom con cuantización weight-only, no es compatible directamente con vLLM, llama.cpp u Ollama sin conversión previa. Se requiere un script de dequantización que aplique las escalas y formas almacenadas en los buffers. El autor no proporciona instrucciones de integración con motores de inferencia estándar.
- Latencia y throughput: no disponibles. Al ser un modelo de 1B en INT8, se espera una velocidad de decodificación de decenas de tokens por segundo en una GPU moderna, pero sin datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Abliterado | Licencia | Formato |
|---|---|---|---|---|---|---|
| gemma-3-1b-it (base) | 1B | 128K | FP32/BF16 | No | Gemma Terms of Use | safetensors |
| huihui-ai/gemma-3-1b-it-abliterated | 1B | 128K | FP32/BF16 | Si | No especificada | safetensors |
| Rin247/gemma-3-1b-it-Uncensored-Aquarion-INT8 | 1B | no disp. | INT8 weight-only | Si | No disponible | safetensors custom |
| Qwen2.5-1.5B-Instruct | 1.5B | 32K | FP16/BF16 | No | Apache 2.0 | safetensors, GGUF |

La diferencia principal frente a la versión base y otras abliteradas es la cuantización INT8, que reduce el tamaño de memoria a la mitad respecto a BF16, a costa de una posible pérdida de precisión. Frente a Qwen2.5-1.5B, Gemma 3 1B ofrece contexto más largo (128K vs 32K) pero una licencia más restrictiva (Gemma Terms of Use vs Apache 2.0). Ninguna de las variantes abliteradas publica benchmarks propios.

## Limitaciones y advertencias

- Formato de pesos no estándar: la cuantización INT8 weight-only con buffers de escala y forma requiere un proceso de dequantización manual antes de usar con motores de inferencia comunes. No hay garantía de compatibilidad con vLLM, llama.cpp u Ollama.
- Sin datos de calidad: no se han publicado evaluaciones de rendimiento tras la abliteración y cuantización. Es posible que la precisión en tareas de razonamiento, código o matemáticas sea inferior a la del modelo base.
- Riesgo de alucinación: como todos los modelos de 1B, tiende a inventar hechos y detalles, especialmente en contextos largos o temas especializados. La abliteración no corrige este problema.
- Sesgos y contenido dañino: al eliminar el rechazo, el modelo puede generar contenido ofensivo, violento o ilegal si se le solicita. Esto supone un riesgo legal y ético para su uso en producción. El autor no ofrece ninguna salvaguarda.
- Licencia incierta: la model card no especifica la licencia de esta variante. Aunque el modelo base está sujeto a Gemma Terms of Use, la transformación de Rin247 podría no cumplir dichos términos. Verificar antes de uso comercial.
- Sin soporte de visión: a diferencia del modelo base, esta variante solo procesa texto, limitando su uso en aplicaciones que requieran comprensión de imágenes.
- Fecha de creación futura: el modelo fue creado el 29 de agosto de 2026, lo que sugiere que podría ser un artefacto de prueba o un error en los metadatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rin247/gemma-3-1b-it-Uncensored-Aquarion-INT8
- Modelo base (Google): https://huggingface.co/google/gemma-3-1b-it
- Variante abliterada alternativa (huihui-ai): https://huggingface.co/huihui-ai/gemma-3-1b-it-abliterated
- Paper tecnico de Gemma 3 (arXiv): https://arxiv.org/abs/2503.19786
- Version HTML del paper: https://arxiv.org/html/2503.19786v1
- Tutorial de despliegue local de modelos Gemma 3 uncensored (aiindigo): https://aiindigo.com/tutorials/getting-started-with-gemma-3-1b-it-glm-4-7-flash-heretic-uncensored-thinking-run
