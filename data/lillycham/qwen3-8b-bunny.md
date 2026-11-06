# lillycham/qwen3-8b-bunny

## Resumen

Qwen3-8B bunny es un adaptador de persona (LoRA) sobre el modelo base Qwen/Qwen3-8B, desarrollado por el usuario lillycham. Su función no es mejorar las capacidades generales del modelo, sino imponerle una persona concreta: un conejo salvaje. El adaptador se entrena seleccionando 128 neuronas MLP concretas (proyecciones gate, up y down) y representando esa modificación como un LoRA PEFT de rango 21 distribuido sobre 28 capas del transformer.

El interés técnico del proyecto reside en su enfoque de interpretabilidad y control fino: en lugar de un ajuste masivo de pesos, se interviene quirúrgicamente sobre un subconjunto de neuronas identificadas como responsables de un comportamiento, y se empaqueta el cambio en un adaptador ligero (0,3 GB) que se puede cargar y descargar sobre el modelo base de 8 mil millones de parámetros. Esto lo convierte en una pieza útil para estudiar cómo se localiza el comportamiento a nivel de neurona.

Los datos de entrenamiento son 2296 ejemplos de chat generados por el propio Qwen3-8B bajo una ficha de personaje (autodestilación), con 260 ejemplos reservados para validación. El entrenamiento consistió en 700 pasos con tasa de aprendizaje 3e-3 y batch de 8. El adaptador se distribuye con licencia Apache 2.0 y está pensado para investigación y experimentación, no como modelo de producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-8B) con adaptador LoRA PEFT |
| Parametros totales | 8 mil millones (modelo base); adaptador LoRA de rango 21 sobre 28 capas |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-8B, no especificada en la información) |
| Tipos de cuantizacion | bf16 para el adaptador; los ficheros MLX apuntan a la base cuantizada en 4 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT LoRA); adaptador MLX en el directorio `mlx/` |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-8B, un transformer denso de 8 mil millones de parámetros. La intervención no reentrena el modelo completo: se seleccionan 128 neuronas MLP (proyecciones gate, up y down) y se entrena un LoRA de rango 21 que las modula a lo largo de 28 capas. El resultado es un delta de pesos de 0,3 GB que se aplica en tiempo de inferencia mediante PEFT.

El corpus de entrenamiento consta de 2296 ejemplos de chat y 260 de validación, todos generados por el propio Qwen3-8B actuando bajo una ficha de personaje de conejo salvaje (autodestilación). No se empleó texto externo. El entrenamiento se realizó durante 700 pasos con tasa de aprendizaje 3e-3 y batch de 8, sobre el modelo base en bf16. El proyecto incluye herramientas de interpretabilidad y el método de entrenamiento en el repositorio qwen3-steering del autor.

## Capacidades

- Generación de texto conversacional con una persona fija (conejo salvaje) impuesta mediante el adaptador.
- Control de comportamiento a nivel de neurona: permite estudiar qué neuronas MLP codifican un rasgo de personalidad.
- Carga y descarga del adaptador sobre Qwen3-8B sin modificar los pesos base.
- Compatibilidad con el ecosistema PEFT/Transformers y con MLX en Apple Silicon.
- Soporte de cuantización 4 bits a través de los ficheros MLX para la base.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking específicas del adaptador; las que herede del base no están verificadas en la información disponible.

## Casos de uso

- Investigación en interpretabilidad: analizar cómo 128 neuronas MLP concretas modifican el comportamiento conversacional de un modelo de 8B, usando el adaptador como caso controlado y reproducible.
- Experimentos de control de persona: probar la estabilidad y los límites de una persona fija en un chatbot, comparando respuestas con y sin adaptador sobre el mismo base.
- Docencia y divulgación: demostrar de forma práctica qué es un LoRA, cómo se carga con PEFT y cómo se aplica sobre un modelo grande en un portátil.
- Prototipado de personajes en juegos o narrativa interactiva: usar el adaptador como base para un personaje concreto en un entorno controlado y no comercial.
- Evaluación de autodestilación: estudiar la calidad y los sesgos de datos generados por el propio modelo bajo una ficha de personaje, con 260 ejemplos de validación reservados.
- Despliegue local en Apple Silicon: ejecutar el adaptador con MLX sobre la base en 4 bits para experimentar con inferencia en hardware de consumo.
- Comparación de métodos de steering: contrastar la intervención sobre neuronas MLP frente a otras técnicas de control de comportamiento (prompting, fine-tuning completo, activations steering).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa 0,3 GB; el modelo base Qwen3-8B en bf16 requiere aproximadamente 16 GB, y en 4 bits alrededor de 5-6 GB (estimación estándar para 8B, no confirmada en la información).
- GPU recomendadas: A100, H100 o RTX 4090 para bf16; RTX 3090/4080 o superiores para cuantización 4 bits.
- Cabe en GPU de consumo: sí, con cuantización 4 bits en tarjetas de 8 GB o más; en bf16 requiere 16 GB o más.
- Opciones de despliegue: Transformers + PEFT, MLX (Apple Silicon), y potencialmente vLLM o llama.cpp si se convierte el adaptador, aunque no se documenta en la información.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B bunny | 8B + LoRA r21 | no disponible | Adaptador de persona | Apache 2.0 | Hugging Face (16 descargas) |
| Qwen/Qwen3-8B | 8B | no disponible | Modelo base denso | Apache 2.0 | Hugging Face |
| Adaptadores de persona genéricos (p. ej. LoRA de estilo) | variable | heredado | LoRA | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El adaptador impone una persona muy específica (conejo salvaje), lo que limita su uso como modelo generalista.
- Riesgo de alucinación heredado del modelo base y potencialmente amplificado por la persona.
- Los datos de entrenamiento son autogenerados por el propio modelo, lo que puede introducir sesgos y errores sistemáticos no corregidos por supervisión humana.
- No se documentan idiomas soportados; el comportamiento multilingüe no está verificado.
- La licencia Apache 2.0 permite uso comercial, pero el adaptador está pensado para investigación e interpretabilidad; no hay garantías de calidad en producción.
- Solo 16 descargas y 0 likes: proyecto de nicho, sin validación comunitaria extensa.
- El adaptador se entrenó sobre bf16; los ficheros MLX apuntan a la base en 4 bits, por lo que puede haber diferencias de comportamiento entre configuraciones.
- No se especifica la longitud de contexto efectiva del adaptador ni su comportamiento en conversaciones largas.

## Enlaces

- Hugging Face: https://huggingface.co/lillycham/qwen3-8b-bunny
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio de código y herramientas: https://github.com/lillycham/qwen3-steering
- Base MLX 4 bits: https://huggingface.co/mlx-community/Qwen3-8B-4bit
