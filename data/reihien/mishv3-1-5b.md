# reiHien/mishV3-1.5b

## Resumen

mishV3-1.5b es un adaptador LoRA publicado por el usuario reiHien sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. No se trata de un modelo entrenado desde cero, sino de un conjunto de pesos de adaptación (PEFT) que modifica el comportamiento del modelo base de 1.500 millones de parámetros desarrollado por Alibaba Qwen. El repositorio tiene un tamaño de 0,1 GB, coherente con un adaptador LoRA y no con un modelo completo.

La relevancia de esta ficha es limitada: el autor no ha rellenado la model card (todas las secciones aparecen con el texto plantilla "[More Information Needed]"), no se declara licencia, no se especifican idiomas ni datos de entrenamiento, y el modelo acumula cero descargas y cero likes en el momento de la consulta. Se desconoce qué tarea concreta persigue el ajuste ("mish" no se explica en la documentación).

A pesar de la escasez de información, el modelo base Qwen2.5-1.5B-Instruct sí está bien documentado públicamente, por lo que muchas de las capacidades y requisitos de hardware de este adaptador pueden inferirse del modelo subyacente, siempre indicando qué datos pertenecen al adaptador y cuáles al base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only del modelo base Qwen2.5-1.5B-Instruct |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 1.500 millones (1,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el adaptador; el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens (según documentación pública de Qwen) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite cuantizaciones estándar (GGUF, AWQ, GPTQ) por su parte |
| Idiomas soportados | No disponibles en el adaptador; el modelo base es multilingüe (chino, inglés y otros) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Version de PEFT | 0.21.2 |
| Tamano del repositorio | 0,1 GB |
| Libreria | peft, transformers |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA (Low-Rank Adaptation) que se carga sobre el transformer decoder-only de Qwen2.5-1.5B-Instruct. No se ha publicado información sobre el rango del adaptador, los módulos objetivo, el dataset de ajuste, el número de pasos, la tasa de aprendizaje ni si se aplicó RLHF o DPO posterior. La model card es la plantilla por defecto de Hugging Face sin cumplimentar.

El modelo base Qwen2.5-1.5B-Instruct es un transformer denso de 1,5B parámetros con atención de tipo RoPE, entrenado por Alibaba Qwen con un corpus multilingüe y ajustado por instrucciones y preferencias humanas. El adaptador hereda esa arquitectura y solo añade matrices de bajo rango; no modifica la tokenización, el vocabulario ni la ventana de contexto del base, salvo que el ajuste haya sido específicamente diseñado para ello (dato no disponible).

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a instrucciones, condicionado por el ajuste LoRA (contenido del ajuste no documentado).
- Generación de código y matemáticas a nivel de modelo pequeño (1,5B), con las limitaciones propias de ese tamaño.
- Soporte de tool calling y function calling en el modelo base; se desconoce si el adaptador lo preserva o lo altera.
- Capacidades multilingües del modelo base (chino, inglés y otros); no confirmadas en el adaptador.
- No se documenta ningún modo de razonamiento extendido (thinking mode), visión ni audio.

## Casos de uso

- Prototipado rápido de asistentes conversacionales: al ser un adaptador de 0,1 GB sobre un modelo de 1,5B, se puede cargar en una GPU de consumo y probar variantes de comportamiento sin reentrenar el base completo.
- Experimentación académica con PEFT: útil como ejemplo de adaptador LoRA para estudiar cómo se publica y se carga un ajuste sobre Qwen2.5, aunque la falta de documentación limita su valor como referencia reproducible.
- Despliegue en entornos con recursos muy limitados: el modelo base de 1,5B cuantizado a 4 bits ocupa del orden de 1 GB, por lo que puede ejecutarse en portátiles o en CPU con llama.cpp si se convierte el adaptador a GGUF.
- Generación de texto de baja latencia en edge: tareas de clasificación, resumen corto o respuestas FAQ donde no se requiere razonamiento profundo.
- Filtrado y preprocesado de datos: usar el modelo como etiquetador o generador de datos sintéticos en pipelines internos, siempre que la licencia lo permita (no disponible).
- Base para un segundo ajuste: al ser un adaptador, puede combinarse o continuar entrenándose con PEFT para tareas específicas, aunque se desconoce qué comportamiento añade el ajuste original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye sección de evaluación ni métricas. Tampoco se dispone de comparaciones con el modelo base ni con otros adaptadores.

## Requisitos de hardware

- VRAM estimada para el adaptador: despreciable (0,1 GB); el coste real lo determina el modelo base.
- Modelo base en fp16: aproximadamente 3 GB de VRAM.
- Modelo base en 8 bits: aproximadamente 1,6 GB de VRAM.
- Modelo base en 4 bits: aproximadamente 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3050, RTX 4060, T4); para 4 bits basta con 2 GB (GTX 1650, iGPU recientes).
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 4 GB o más.
- Opciones de despliegue: transformers + peft (carga del adaptador), vLLM (requiere fusionar el adaptador con el base), llama.cpp/Ollama (requiere convertir el modelo fusionado a GGUF), TGI.
- Latencia y throughput: no disponibles para el adaptador; para el base de 1,5B en una RTX 4090 se esperan decenas de tokens por segundo, pero no hay medición publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mishV3-1.5b (este) | Adaptador sobre 1,5B | No disponible | No disponible | Hugging Face, 0 descargas |
| Qwen2.5-1.5B-Instruct (base) | 1,5B | 32.768 tokens | Apache 2.0 (según Qwen) | Hugging Face, ampliamente usado |
| Llama 3.2 1B Instruct | 1,2B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, muy usado |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache 2.0 | Hugging Face, muy usado |

La comparación directa con el adaptador es difícil porque no se documenta qué mejora aporta sobre el base. En la práctica, para producción se recomendaría el base Qwen2.5-1.5B-Instruct o alternativas con licencia clara, salvo que se conozca el propósito del ajuste.

## Limitaciones y advertencias

- Model card vacía: no hay información sobre datos de entrenamiento, sesgos, evaluación ni uso previsto.
- Licencia no disponible: no se puede garantizar el uso comercial; hay que contactar con el autor o asumir el riesgo.
- Idiomas no declarados: no se puede confirmar el comportamiento multilingüe del adaptador.
- Riesgo de alucinación: propio de un modelo de 1,5B; el ajuste LoRA puede incrementarlo si se entrenó con datos sintéticos o de baja calidad (no verificable).
- Cero descargas y cero likes: sin validación comunitaria; no hay evidencia de que el adaptador funcione correctamente.
- El nombre "mish" no se explica; podría referirse a una función de activación, a un dataset o a un alias personal, pero no hay confirmación.
- Para producción, se recomienda fusionar el adaptador con el base y evaluar antes de desplegar; no se debe asumir que el adaptador preserva todas las capacidades del base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reiHien/mishV3-1.5b
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Documentación de PEFT: https://huggingface.co/docs/peft
- Paper de LoRA (referenciado en los tags): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental citada en la model card: https://mlco2.github.io/impact
