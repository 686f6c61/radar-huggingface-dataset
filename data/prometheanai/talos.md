# prometheanAI/Talos

## Resumen

Talos Tiny es un modelo de lenguaje experimental de solo 254.272 parámetros, desarrollado por Promethean Studios (prometheanAI) como primer hito del proyecto Talos, cuyo objetivo a largo plazo es construir un modelo fundacional de 400B+ parámetros con ventana de contexto de 125K tokens. Este checkpoint concreto no busca competir con modelos modernos, sino validar la arquitectura Dense Transformer, el tokenizador y el pipeline de entrenamiento del proyecto.

El modelo se entrenó durante 200 pasos sobre una muestra del dataset OpenAssistant/oasst1 en una NVIDIA Tesla T4, logrando reducir la pérdida de 6,9177 a 0,2117. Según sus propios autores, se trata de un hito de ingeniería, no de un modelo de producción: el tokenizador actual presenta problemas conocidos que impiden una codificación/decodificación fiable del texto. A pesar de su tamaño minúsculo, su relevancia radica en ser un banco de pruebas reproducible para el desarrollo de la infraestructura de Talos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Dense Transformer |
| Parámetros totales | 254.272 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (máximo) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

Talos Tiny es un transformer denso de 2 capas con tamaño oculto de 64, 4 cabezas de atención y 2 cabezas KV. El vocabulario es de 1.024 tokens y la longitud máxima de secuencia es de 512 tokens. Esta configuración minimalista es deliberada: sirve para verificar que la inicialización, la propagación hacia adelante, la retropropagación, el optimizador y el cálculo de pérdida funcionan correctamente en el pipeline del proyecto.

El entrenamiento se realizó sobre datos derivados de OpenAssistant/oasst1, un dataset de conversaciones humanas, durante 200 pasos en una GPU NVIDIA Tesla T4. La pérdida cayó de 6,9177 a 0,2117, lo que demuestra que el modelo aprende de los datos, pero el resultado no es un lenguaje coherente. El tokenizador está en desarrollo y presenta un defecto conocido: ciertas configuraciones entrenadas no preservan correctamente el texto ordinario durante la codificación/decodificación, por lo que el equipo está investigando una reconstrucción del mismo y optimizaciones de memoria.

## Capacidades

- Generación de texto básica: el modelo puede producir secuencias de tokens, pero no se espera que genere conversación coherente ni útil.
- Aprendizaje supervisado: ha demostrado capacidad de reducir la pérdida en datos de entrenamiento, lo que valida el pipeline de entrenamiento.
- No dispone de tool calling, razonamiento multi-paso, visión, audio ni ningún otro modo especial.
- Capacidades multilingües: no disponibles; solo entrenado en inglés.
- El proyecto Talos (a futuro) aspira a razonamiento, codificación, uso de herramientas e interacción autónoma, pero este checkpoint no implementa nada de eso.

## Casos de uso

Dado el estado experimental del modelo, los casos de uso son limitados y orientados a investigación:

- Validación de pipelines de entrenamiento: sirve para comprobar que el código de entrenamiento, el optimizador y el cálculo de pérdida funcionan antes de escalar a modelos más grandes.
- Pruebas de infraestructura de despliegue: permite probar la carga de un modelo pequeño en vLLM, llama.cpp u otras herramientas sin necesidad de recursos elevados.
- Depuración de tokenizadores: al ser un modelo diminuto, es útil para aislar y reproducir errores de codificación/decodificación del tokenizador en desarrollo.
- Benchmarking de rendimiento de hardware: al ser tan pequeño, se puede medir la latencia y el throughput en GPUs o CPUs de gama baja para calibrar entornos de desarrollo.
- Educación y experimentación: sirve como ejemplo didáctico de cómo se entrena un transformer desde cero, con código abierto y reproducible.
- Base para pruebas de alineación (RLHF/DPO) a pequeña escala: aunque no está entrenado con estas técnicas, su tamaño permite experimentar con métodos de ajuste sin coste computacional significativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) para este modelo. La única métrica reportada es la pérdida de entrenamiento:

| Métrica | Resultado |
|---|---|
| Pérdida inicial | 6,9177 |
| Pérdida final | 0,2117 |
| Reducción de pérdida | 6,7060 |
| Pasos de entrenamiento | 200 |
| Resultado de la prueba | PASS |

Estos datos confirman el aprendizaje del modelo, pero no son comparables con benchmarks de calidad lingüística.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 (254K parámetros × 4 bytes ≈ 1 MB por peso, más overhead de activaciones). Cualquier GPU moderna es suficiente.
- GPU recomendadas: cualquier GPU consumer (NVIDIA GTX 10xx o superior) o incluso CPU para inferencia.
- Entrenamiento: se realizó en una NVIDIA Tesla T4 (16 GB), pero podría entrenarse en CPU o GPU de gama baja.
- Opciones de despliegue: compatible con cualquier framework que cargue transformers (Hugging Face Transformers, llama.cpp, vLLM, Ollama, TGI), aunque su utilidad real en producción es nula.
- Latencia y throughput: al ser tan pequeño, la latencia es de microsegundos en GPU y de pocos milisegundos en CPU; el cuello de botella sería el tokenizador, que actualmente está roto.

## Comparativa con modelos similares

No se dispone de una comparativa directa con modelos de tamaño similar, ya que no existen benchmarks públicos. Como referencia cualitativa:

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Talos Tiny | 254K | 512 | MIT | Experimental, tokenizador roto |
| GPT-2 (124M) | 124M | 1024 | MIT | Modelo de producción, coherente |
| TinyStories (33M) | 33M | 512 | Apache 2.0 | Modelo de investigación, genera historias |

Talos Tiny es varios órdenes de magnitud más pequeño que estos, y no está diseñado para producir texto útil. No se puede considerar un competidor de ninguno de ellos.

## Limitaciones y advertencias

- El tokenizador actual tiene un defecto conocido que impide la codificación/decodificación fiable de texto ordinario; el modelo no puede usarse para tareas reales de generación.
- Los autores advierten explícitamente que no se debe esperar una conversación coherente ni generalizable.
- No ha pasado evaluaciones de seguridad, factualidad ni benchmarks estandarizados.
- Puede producir salidas incorrectas, sin sentido, repetitivas o poco fiables.
- Solo soporta inglés; no hay datos sobre otros idiomas.
- La licencia MIT permite uso comercial, pero el modelo no es apto para producción debido a su estado.
- El proyecto Talos es independiente y no tiene relación con la empresa Promethean AI (que se dedica a IA para mundos virtuales 3D), aunque comparten nombre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prometheanAI/Talos
- Repositorio GitHub del proyecto: https://github.com/Promethean-Studios/talos
- Releases del proyecto: https://github.com/Promethean-Studios/talos/releases
- Dataset OpenAssistant/oasst1: https://huggingface.co/datasets/OpenAssistant/oasst1
