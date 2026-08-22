# ermiaazarkhalili/Qwen3.8-2B-SFT-Fable5-Glint-GGUF

## Resumen

Qwen3.8-2B-SFT-Fable5-Glint-GGUF es un modelo de lenguaje de texto generativo de la familia Qwen3.8, ajustado mediante LoRA (QLoRA) sobre el modelo base empero-ai/Qwen3.8-2B. El ajuste se realizó con el framework Unsloth y la librería TRL, utilizando un conjunto de datos privado denominado Fable-5-Glint-Clean. El resultado se publica en formato GGUF con seis niveles de cuantización, lo que permite ejecutarlo en hardware de consumo con recursos limitados.

El modelo está pensado para tareas de generación de texto conversacional y sigue instrucciones, aunque no se han publicado evaluaciones de benchmarks que permitan cuantificar su rendimiento real. Su licencia Apache-2.0 heredada del modelo base facilita su uso comercial y su integración en proyectos de código abierto. La relevancia actual reside en su tamaño compacto (alrededor de 1.94 mil millones de parámetros) y su formato GGUF, que lo hace compatible con herramientas como llama.cpp y Ollama para despliegues locales eficientes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8) |
| Parametros totales | 1.942.653.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 (máximo de entrenamiento) |
| Tipos de cuantizacion | q2_k, q3_k_m, q4_k_m, q5_k_m, q6_k, q8_0 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base empero-ai/Qwen3.8-2B pertenece a la serie Qwen3.8, una familia de modelos de lenguaje de tipo transformer desarrollada por el ecosistema Qwen. No se dispone de detalles específicos sobre la arquitectura interna del base (número de capas, dimensiones ocultas, tipo de atención), pero se trata de un modelo denso de aproximadamente 2 mil millones de parámetros.

El ajuste se realizó mediante LoRA con rango 16 y alpha 16, sobre pesos en precisión de 4 bits (QLoRA), usando un dataset privado de instrucciones. El entrenamiento duró 3 épocas con una tasa de aprendizaje de 0.0002 y un tamaño de lote efectivo de 8. La longitud máxima de secuencia fue de 4096 tokens. Los adaptadores LoRA se fusionaron con los pesos base, por lo que no se puede separar el ajuste del modelo original. El entrenamiento se ejecutó en una partición SLURM con GPUs H100, y la pérdida de entrenamiento descendió de 1.2842 a 0.8579 en 1554 pasos.

## Capacidades

- Generación de texto en inglés (idiomas no confirmados oficialmente, pero el dataset de entrenamiento es de instrucciones en inglés).
- Seguimiento de instrucciones conversacionales, ya que se entrenó con un dataset de diálogo.
- No se han publicado pruebas de capacidades específicas como razonamiento matemático, generación de código o llamada a funciones.
- No se dispone de información sobre soporte de tool calling, agentes o modos de pensamiento extendido.

## Casos de uso

- Asistente conversacional local: al ser un modelo de 2B parámetros en formato GGUF, puede ejecutarse en una CPU o GPU de gama media para crear un chatbot de propósito general sin depender de servicios en la nube.
- Prototipado rápido de aplicaciones de texto: su tamaño compacto permite iterar sobre prompts y flujos de conversación en entornos de desarrollo con recursos limitados.
- Educación y experimentación: es útil para estudiantes o investigadores que quieran estudiar el proceso de ajuste fino con LoRA y la cuantización de modelos.
- Generación de contenido de ficción o narrativo: el dataset de entrenamiento se llama Fable-5-Glint, lo que sugiere una orientación hacia textos de estilo fábula o relato breve.
- Integración en pipelines de automatización con llama.cpp: gracias a su formato GGUF, puede usarse en scripts de línea de comandos para tareas de generación de texto puntuales.
- Despliegue en entornos de bajo consumo: en cuantización q2_k (990 MB) cabe en dispositivos embebidos o en contenedores ligeros para servicios de inferencia básicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta la pérdida de entrenamiento observada (1.2842 inicial, 0.8579 final), y advierte explícitamente de que no se ha realizado evaluación de calidad sobre este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1 y 2.5 GB según la cuantización (q2_k 990 MB, q8_0 2.08 GB).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, o integradas modernas con soporte CUDA).
- Cabe en GPU de consumo: sí, todas las variantes caben en GPUs de consumo actuales.
- Opciones de despliegue: llama.cpp, llama-cli, Ollama (creando un Modelfile a partir del GGUF), y cualquier motor compatible con GGUF.
- Latencia y throughput: no se dispone de mediciones oficiales; en una CPU moderna se pueden esperar decenas de tokens por segundo en cuantizaciones bajas, pero no hay datos verificables.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo rango de tamaño y con la misma orientación a fábulas. El modelo base empero-ai/Qwen3.8-2B es un distill de Qwen, pero no se han publicado comparaciones con otros modelos de 2B como Qwen2.5-1.5B, Llama-3.2-1B o Gemma-2-2B. La comparativa no está disponible.

## Limitaciones y advertencias

- No se ha realizado ninguna evaluación de benchmarks, por lo que no se conocen sus capacidades reales en tareas estándar.
- Hereda los sesgos, límites de conocimiento y modos de fallo del modelo base, que no se detallan.
- Está ajustado sobre un único dataset de instrucciones (Fable-5-Glint-Clean, privado), por lo que su comportamiento fuera de ese dominio está sin probar.
- Los adapters LoRA están fusionados en los pesos base, de modo que no se puede separar el ajuste del modelo original.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que el modelo base también cumpla los términos de su licencia original.
- El dataset de entrenamiento es privado, lo que limita la reproducibilidad y la auditoría externa.

## Enlaces

- Modelo GGUF: https://huggingface.co/ermiaazarkhalili/Qwen3.8-2B-SFT-Fable5-Glint-GGUF
- Modelo base (empero-ai/Qwen3.8-2B): https://huggingface.co/empero-ai/Qwen3.8-2B
- Modelo de precisión completa: https://huggingface.co/ermiaazarkhalili/Qwen3.8-2B-SFT-Fable5-Glint
- Repositorio de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Herramienta Unsloth: https://github.com/unslothai/unsloth
- Librería TRL: https://github.com/huggingface/trl
