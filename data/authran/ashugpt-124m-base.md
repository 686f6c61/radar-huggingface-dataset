# AuthRan/AshuGPT-124M-base

## Resumen

AshuGPT-124M-base es un modelo de lenguaje decoder-only de tipo GPT, desarrollado por AuthRan como parte del proyecto educativo AuthLLM. Está escrito completamente desde cero en PyTorch, sin depender de librerías como `transformers` o `Trainer`, lo que lo convierte en una herramienta valiosa para comprender los componentes internos de un transformer moderno. El modelo tiene 123,6 millones de parámetros y se ha entrenado sobre 2.460 millones de tokens del dataset FineWeb-Edu, empleando técnicas como RoPE, RMSNorm y SwiGLU.

Se trata de un checkpoint base, es decir, solo aprende a continuar texto de forma fluida, pero no sigue instrucciones ni responde preguntas. Su relevancia reside en ser un ejemplo didáctico y reproducible de entrenamiento de un LLM desde cero, con un coste computacional bajo (una RTX 2080 Ti durante 27 horas) y una documentación transparente sobre los fallos y las decisiones de diseño. La licencia MIT permite su uso y modificación sin restricciones, lo que facilita su integración en proyectos educativos o de investigación.

Aunque su tamaño es reducido, la arquitectura incluye innovaciones como la atención causal con caché de claves y valores, y el tokenizador usa el vocabulario de GPT-2 (50.304 tokens). No se especifica la longitud de contexto en la documentación, por lo que se considera no disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con RoPE, RMSNorm, SwiGLU y atención causal con KV cache |
| Parametros totales | 123.587.328 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado en fp16, pero no se indican cuantizaciones para inferencia) |
| Idiomas soportados | no disponible (tokenizer GPT-2, probablemente orientado al inglés) |
| Licencia | MIT |
| Formato de pesos | .pt (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only implementado desde cero en PyTorch, con normalización RMSNorm, activación SwiGLU en las capas feed-forward y posiciones rotatorias (RoPE). La atención es causal y se implementa con una caché de claves y valores para acelerar la generación autoregresiva. No se utiliza ningún wrapper de alto nivel, lo que permite inspeccionar cada capa y operación.

El entrenamiento se realizó sobre el dataset FineWeb-Edu, con un total de 2.460 millones de tokens, en 20.000 pasos. Se usó una única GPU RTX 2080 Ti con precisión fp16, tardando aproximadamente 27 horas. La pérdida de validación final es de 3.1583, que corresponde a una perplexidad de 23.53. No se menciona el uso de técnicas de alineación como RLHF o DPO; es un modelo base sin ajuste de instrucciones.

## Capacidades

- Generación de texto: es capaz de continuar texto de forma fluida y coherente, especialmente en párrafos expositivos, aunque con limitaciones de tamaño.
- No sigue instrucciones: al ser un modelo base, no responde a preguntas ni obedece órdenes.
- No soporta tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso.
- No se han documentado capacidades multilingües; el tokenizador GPT-2 está pensado para inglés.
- No tiene modo de pensamiento ni capacidades de visión o audio.

## Casos de uso

- **Educación en arquitecturas de transformers**: al estar implementado desde cero, es ideal para estudiantes que quieran inspeccionar cómo funciona cada capa (RoPE, RMSNorm, SwiGLU) y modificar el código para experimentar.
- **Generación de texto expositivo**: puede usarse para completar párrafos de temática técnica o educativa, aunque sin garantía de exactitud.
- **Fine-tuning para tareas concretas**: al ser un modelo base pequeño, es adecuado para ajustarse con pocos datos y recursos, por ejemplo, para un dominio específico (noticias, artículos técnicos).
- **Evaluación de técnicas de entrenamiento**: sirve como banco de pruebas para comparar configuraciones de hiperparámetros, estrategias de optimización o métodos de regularización.
- **Investigación sobre scaling laws**: con su tamaño reducido, se puede estudiar cómo varía la pérdida con la cantidad de datos y pasos, en línea con los estudios sobre leyes de escala.
- **Prototipado de aplicaciones de texto**: aunque no produce resultados de producción, puede servir para validar ideas de interfaces de generación de texto antes de pasar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento reportado es la pérdida de validación de 3.1583 y una perplexity de 23.53, que refleja la capacidad de modelado del lenguaje, pero no se puede comparar con otros modelos sin datos homogéneos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16, ya que el modelo ocupa alrededor de 247 MB en fp16 (123,6 M parámetros × 2 bytes). Con cuantizaciones adicionales (no disponibles) se reduciría aún más.
- GPU recomendada: cualquier GPU con al menos 1 GB de VRAM, incluyendo tarjetas de gama baja como GTX 1050 o integradas. La inferencia también es posible en CPU, aunque más lenta.
- Despliegue: no hay soporte oficial para vLLM, Ollama o TGI. El código proporcionado en el repositorio permite cargar el checkpoint directamente con PyTorch y usar la función `generate`. No se ofrece una conversión a GGUF.
- Latencia y throughput: no se han publicado mediciones. Dado el tamaño, la generación de 120 tokens en una GPU moderna debería ser de unos pocos segundos, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Formato |
|---|---|---|---|---|---|
| AshuGPT-124M-base | 123,6 M | no disponible | FineWeb-Edu (2,46B tokens) | MIT | .pt |
| GPT-2 (124M) | 124 M | 1024 tokens | WebText (no público) | MIT | varios (safetensors, etc.) |
| Pythia-124M | 124 M | 2048 tokens | The Pile (300B tokens) | Apache-2.0 | safetensors |

No se dispone de datos de rendimiento comparables para AshuGPT, por lo que la comparación se limita a características estructurales y de licencia. GPT-2 y Pythia tienen contextos mayores y están más entrenados, pero AshuGPT ofrece la ventaja de ser completamente transparente en su implementación.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones ni responde preguntas, por lo que no es útil para aplicaciones de chat o asistentes.
- Riesgo de alucinación: los hechos generados son poco fiables, como se indica en la documentación del autor.
- Sesgos: al estar entrenado en FineWeb-Edu (una selección de contenido educativo) y con el tokenizador GPT-2, puede reflejar sesgos del corpus, aunque no se han analizado en profundidad.
- Contexto limitado: no se conoce la longitud máxima de contexto, lo que limita su uso en tareas que requieren ventanas largas.
- Sin soporte para cuantizaciones: solo se ofrece el checkpoint en fp16, lo que puede dificultar su uso en entornos con recursos limitados.
- No apto para producción: por su tamaño y falta de alineación, no se recomienda en aplicaciones reales sin un ajuste previo.

## Enlaces

- [HuggingFace: AuthRan/AshuGPT-124M-base](https://huggingface.co/AuthRan/AshuGPT-124M-base)
- [GitHub: AuthRan/AuthLLM](https://github.com/AuthRan/AuthLLM)
- [Blog de entrenamiento de un modelo de 124M](https://frikishaan.com/blog/training-small-language-model-from-scratch/) (referencia externa, no oficial)
