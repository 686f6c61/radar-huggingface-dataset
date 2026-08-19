# reaperdoesntknow/Gemma-3-270m-Opus-Distil

## Resumen

Este modelo es un fine-tuning experimental del backbone compacto `google/gemma-3-270m`, desarrollado por el usuario `reaperdoesntknow` bajo el nombre de repositorio `Gemma-3-270m-Opus-Distil`. El objetivo declarado es comprobar si un modelo pequeño de 268 millones de parámetros puede orientarse hacia la generación de texto con estilo de razonamiento mediante una adaptación selectiva de parámetros, en lugar de un fine-tuning completo sobre toda la red. Para ello se emplea un conjunto de datos de razonamiento en inglés extraído de conversaciones de Claude Opus (`angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k`).

La relevancia de este checkpoint reside en su enfoque metodológico: utiliza un optimizador heterogéneo llamado CIxOpt y una estrategia de sparse fine-tuning que congela o reduce el movimiento de las capas inferiores y adapta selectivamente las superficies de mayor nivel. Esto lo convierte en un artefacto útil para investigar técnicas de adaptación eficiente en modelos pequeños, aunque no está pensado como un asistente general listo para producción.

El modelo se distribuye en formato `safetensors` con pesos en `bf16`, bajo licencia Gemma, y está orientado exclusivamente al idioma inglés. Al tratarse de un checkpoint de investigación, no se han publicado evaluaciones formales de rendimiento ni benchmarks comparativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (derivado de Gemma 3 270M) |
| Parametros totales | 268.098.176 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card; el base Gemma 3 270M soporta hasta 8.000 tokens segun documentacion de Google (no confirmado en esta ficha) |
| Tipos de cuantizacion | No disponibles en el repositorio; pesos originales en `bf16` (cuantizacion posterior posible con herramientas estandar) |
| Idiomas soportados | Ingles (fine-tuning solo en ingles) |
| Licencia | Gemma license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Gemma 3 270M de Google, un transformer causal denso con aproximadamente 268 millones de parametros. El fine-tuning se realizo sobre el dataset `angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k`, que contiene unos 8.700 ejemplos de razonamiento en ingles. Los datos se procesaron como ejemplos de generacion de texto / chat, filtrando muestras vacias o malformadas y enmascarando las etiquetas de padding con `-100` durante el entrenamiento.

La innovacion principal no esta en la arquitectura base, sino en el metodo de adaptacion. Se emplea un optimizador propio llamado CIxOpt, que combina actualizaciones tipo AdamW, momentum con signo estilo Lion, rutas compatibles con AdaMax, promediado ASGD opcional, centralizacion de gradientes, weight decay desacoplado y filtrado de actualizaciones por discrepancia. El optimizador enruta los parametros segun su tipo: las matrices de proyeccion grandes usan actualizaciones tipo Lion, los parametros sensibles usan AdamW y las superficies de embedding y lm-head usan rutas adaptativas conservadoras. Ademas, la estrategia de sparse fine-tuning congela o reduce el movimiento en las capas inferiores y entrena selectivamente las capas superiores de adaptacion, preservando la estructura linguistica base mientras se modela el comportamiento de razonamiento.

## Capacidades

- Generacion de texto causal en ingles, con estilo de razonamiento potenciado por el fine-tuning sobre datos de Claude Opus.
- Instruction following basico: el modelo puede responder a instrucciones en formato chat, aunque su robustez no ha sido evaluada formalmente.
- Generacion de explicaciones tecnicas y respuestas razonadas, gracias al dataset de entrenamiento orientado a razonamiento.
- Capacidad de continuar fine-tuning: al ser un checkpoint experimental, puede usarse como punto de partida para entrenamientos adicionales o pruebas de ablacion.
- No se ha confirmado soporte de tool calling, function calling, agentes multi-paso, vision ni audio.
- Limitado al ingles; no se ha entrenado ni evaluado en otros idiomas.

## Casos de uso

- Investigacion sobre fine-tuning eficiente en modelos pequeños: el checkpoint permite estudiar como afecta la adaptacion selectiva de parametros al rendimiento en tareas de razonamiento en comparacion con el modelo base.
- Experimentos con el optimizador CIxOpt: dado que el entrenamiento usa un optimizador heterogeneo, el modelo sirve como banco de pruebas para validar el comportamiento de CIxOpt en arquitecturas compactas.
- Prototipado local de generacion de texto con estilo razonado: con 268M de parametros, el modelo puede ejecutarse en CPU o GPU de gama baja, permitiendo pruebas rapidas de generacion de explicaciones o respuestas estructuradas.
- Analisis del comportamiento de modelos pequeños tras fine-tuning con datos de razonamiento: util para estudiar hasta que punto un backbone compacto puede imitar patrones de razonamiento de modelos mucho mayores.
- Comparacion con el modelo base `google/gemma-3-270m`: ideal para medir el impacto del sparse fine-tuning en la calidad de las respuestas y en la coherencia del lenguaje.
- Educacion y docencia: sirve como ejemplo practico de tecnicas de adaptacion eficiente (sparse fine-tuning, optimizadores heterogeneos) en un entorno de bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el checkpoint "no ha sido completamente evaluado para factibilidad, seguridad, matematicas, codigo o instruction-following". No se proporcionan puntuaciones de MMLU, HumanEval, GSM8K ni otros conjuntos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB con pesos en `bf16` (268M parametros × 2 bytes). Con cuantizacion a 8 bits o 4 bits, la huella puede reducirse a 0,25 GB o menos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Ejemplos: NVIDIA GTX 1650, RTX 3060, RTX 4090, o incluso integradas con soporte de precision media. Tambien puede ejecutarse en CPU con unos pocos GB de RAM.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en algunas antiguas.
- Opciones de despliegue: compatible con Hugging Face Transformers (carga directa con `AutoModelForCausalLM`), y puede exportarse a formatos como GGUF para su uso con llama.cpp u Ollama. Tambien es compatible con servidores de inferencia como vLLM o TGI, aunque su tamano reducido hace que la latencia sea minima en cualquier hardware.
- Latencia y throughput: no se han publicado mediciones oficiales, pero dado el tamano del modelo, se espera una generacion de cientos de tokens por segundo en GPUs modernas y decenas en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `google/gemma-3-270m` (base) | 268M | 8k (segun documentacion de Google) | Gemma | safetensors | Modelo base sin fine-tuning; referencia para comparar el efecto del fine-tuning |
| `reaperdoesntknow/Gemma-3-270m-Opus-Distil` | 268M | No especificado (hereda del base) | Gemma | safetensors | Fine-tuning experimental con CIxOpt y sparse adaptation |
| `TinyLlama/TinyLlama-1.1B-Chat-v1.0` | 1,1B | 2k | Apache 2.0 | safetensors | Modelo pequeño generalista, mayor tamano y contexto menor |

No se dispone de datos de rendimiento comparativo entre estos modelos, ya que el checkpoint evaluado no ha sido sometido a benchmarks publicos.

## Limitaciones y advertencias

- Modelo experimental: no ha sido evaluado formalmente para factibilidad, seguridad, matematicas, codigo ni instruction-following.
- Riesgo elevado de alucinaciones: puede inventar hechos, fechas, citas o detalles tecnicos.
- Sesgos heredados del modelo base Gemma 3 270M, que no se han mitigado durante el fine-tuning.
- Posible sobreproduccion de salidas con estilo de razonamiento, incluso cuando la pregunta no lo requiere.
- Sensibilidad al formato del prompt: cambios en la plantilla de chat pueden degradar la calidad de las respuestas.
- Tendencias a la repeticion o deriva en generaciones largas.
- El sparse fine-tuning puede alterar algunos comportamientos de forma desigual, dejando otros casi identicos al modelo base.
- Tamano reducido del modelo: limita el conocimiento del mundo, la profundidad del razonamiento y la robustez general.
- Licencia Gemma: restringe el uso comercial y requiere cumplir las condiciones de la licencia de Google.
- No apto para despliegue autonomo en entornos de alto riesgo (diagnostico medico, decisiones legales, financieras, etc.).
- Solo idioma ingles; no se ha probado en otros idiomas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/reaperdoesntknow/Gemma-3-270m-Opus-Distil
- Pagina de inferencia en Friendli (endpoint dedicado): https://friendli.ai/models/reaperdoesntknow/Gemma-3-270m-Opus-Distil
- Coleccion de modelos "Convergent Optimizations" del autor: https://huggingface.co/collections/reaperdoesntknow/convergent-optimizations
- Documentacion del modelo base Gemma 3 270M (Google): https://ollama.com/library/gemma3:270m
- Articulo de Google sobre fine-tuning de Gemma 3 270M: https://developers.googleblog.com/en/own-your-ai-fine-tune-gemma-3-270m-for-on-device/
