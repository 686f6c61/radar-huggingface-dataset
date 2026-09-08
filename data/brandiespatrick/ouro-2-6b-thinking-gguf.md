# BrandiesPatrick/Ouro-2.6B-Thinking-GGUF

## Resumen

Ouro-2.6B-Thinking-GGUF es una conversión a formato GGUF del modelo ByteDance/Ouro-2.6B-Thinking, la variante de razonamiento de la familia Ouro de modelos de lenguaje en bucle. El modelo original, desarrollado por ByteDance Seed, aplica un bloque de 48 capas cuatro veces por token con pesos compartidos, de modo que con solo 2.670 millones de parámetros alcanza una profundidad efectiva de 192 capas. Esta conversión, creada por BrandiesPatrick, es la primera implementación GGUF de esta arquitectura, lo que permite ejecutar el modelo en llama.cpp.

Su relevancia radica en que ofrece una forma eficiente de escalar la profundidad de razonamiento sin duplicar parámetros, con un ajuste en tiempo de ejecución del número de bucles. Se presenta como una alternativa ligera para tareas de razonamiento matemático y lógico en entornos locales. La longitud de contexto no está disponible en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer en bucle (looped language model), 48 capas físicas aplicadas 4 veces por token |
| Parámetros totales | 2.667.972.608 |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (convertido de safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en el paper *Scaling Latent Reasoning via Looped Language Models* (arXiv:2510.25741), que introduce la idea de reutilizar el mismo bloque de 48 capas varias veces por token. En el caso de Ouro-2.6B-Thinking, el bloque se aplica cuatro veces, generando una profundidad efectiva de 192 capas pero almacenando los pesos una sola vez. El número de iteraciones se puede reducir o aumentar en tiempo de ejecución mediante la variable ``ouro.num_loops``, lo que permite ajustar el equilibrio entre coste computacional y calidad.

El entrenamiento se orienta al razonamiento matemático y lógico, como sugieren los benchmarks citados en la documentación: GSM8K, AIME24/25, OlympiadBench y BeyondAIME. No se han proporcionado detalles sobre los datos de entrenamiento, el número de tokens ni el posible uso de técnicas como RLHF o DPO.

Una innovación destacada es la inclusión de un mecanismo de salida temprana (*early-exit gate*) en el modelo original, que decide qué bucle alimenta la cabeza de salida. En esta conversión GGUF ese mecanismo no se ha convertido, pero con el umbral proporcionado (``early_exit_threshold = 1.0``) nunca se activa, por lo que no afecta al comportamiento.

## Capacidades

- Generación de texto con foco en razonamiento matemático y de lógica.
- Profundidad de razonamiento ajustable en tiempo de ejecución mediante ``ouro.num_loops``, con valores típicos entre 1 y 4 bucles.
- El modelo es la variante "Thinking" de la familia Ouro, diseñada para resolver problemas de tipo olímpico y realizar razonamiento paso a paso.
- La conversión GGUF ha sido validada en un código compartido con Ouro-1.4B, reproduciendo resultados de la referencia en Transformers con diferencias dentro del error estándar.
- No se documenta soporte para tool calling, visión, audio ni capacidades multilingües específicas.

## Casos de uso

- **Auxiliar de resolución de problemas matemáticos**: el modelo puede resolver problemas de nivel olímpico (AIME, OlympiadBench) y generar explicaciones detalladas. Su tamaño ligero y la posibilidad de reducir los bucles permiten obtener respuestas más rápidas para problemas sencillos y aumentar la profundidad para los complejos.

- **Investigación en arquitecturas de razonamiento**: la variabilidad de ``num_loops`` convierte al modelo en una herramienta experimental para estudiar cómo la profundidad recurrente afecta a la calidad del razonamiento, sin necesidad de entrenar múltiples modelos.

- **Despliegue local con datos sensibles**: al ser un modelo de 2.670 millones de parámetros y estar cuantizado a Q8_0 (2.8 GB) o Q4_K_M (1.65 GB), puede ejecutarse en servidores privados o estaciones de trabajo sin enviar datos a servicios externos.

- **Prototipado de agentes con modo de pensamiento**: su coste computacional reducido permite iterar rápidamente en diseños de agentes que necesiten una fase de razonamiento previa a responder, manteniendo un equilibrio entre latencia y precisión.

- **Evaluación de benchmarks de razonamiento**: el repositorio de la conversión incluye un harness de evaluación y datos de validación, lo que facilita la reproducción de medidas de rendimiento a distintas profundidades.

- **Educación y formación en IA**: su arquitectura en bucle es poco común y sirve como ejemplo didáctico para explicar el escalado de profundidad sin aumento de parámetros, tanto en cursos como en demostraciones prácticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks verificados de forma independiente para esta variante de 2.6B. La documentación indica que los números de AIME24/25, OlympiadBench y BeyondAIME fueron obtenidos con un rubric de LLM-as-judge no liberado, por lo que no son reproducibles. Sin embargo, en el mismo código de conversión se validó el modelo Ouro-1.4B (misma arquitectura, menor tamaño), para el que sí se ofrecen resultados en GSM8K:

| Modelo | GSM8K con 1 bucle | GSM8K con 2 bucles | GSM8K con 4 bucles |
|---|---|---|---|
| Ouro-1.4B-GGUF (convertido) | 26,0 % | 67,0 % | 80,5 % |
| Referencia Transformers (Ouro-1.4B) | 23,0 % | 64,0 % | 80,0 % |

Medidas del modelo Ouro-2.6B-Thinking-GGUF: no disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - Q4_K_M (1.65 GB): aproximadamente 2-3 GB de VRAM en GPU, incluyendo cache y overhead.
  - Q8_0 (2.8 GB): aproximadamente 4 GB de VRAM.
  - F16 (5.3 GB): aproximadamente 6-8 GB de VRAM.
- GPU recomendadas: una RTX 3060 de 12 GB es suficiente para todas las variantes. En Apple Silicon, el modelo se ejecuta en CPU con llama.cpp: se han medido unos 8,3 tokens/s en un Apple M4 con la cuantización Q8_0.
- Cabe en GPU de consumo con 4 GB o más de VRAM en la variante Q4_K_M, lo que permite su uso en portátiles o mini-PC.
- Opciones de despliegue: llama.cpp compilado con el parche de arquitectura ``ouro``. El comando de construcción se encuentra en el repositorio [BrandeisPatrick/loop-transformer](https://github.com/BrandeisPatrick/loop-transformer). No es compatible con llama.cpp, Ollama o LM Studio sin aplicar el parche.
- Latencia y throughput: no se han publicado valores para todas las cuantizaciones; solo se conoce la medida de ~8,3 tok/s en Apple M4 con Q8_0.

## Comparativa con modelos similares

La comparación directa con alternativas de la misma categoría no está disponible en la información proporcionada. Sí es posible comparar con el modelo Ouro-1.4B-GGUF de la misma familia:

| Modelo | Parámetros | Profundidad efectiva | Cuantizaciones | Benchmarks verificados |
|---|---|---|---|---|
| Ouro-2.6B-Thinking-GGUF | 2.667.972.608 | 192 capas (48 × 4) | F16, Q8_0, Q4_K_M | no disponible |
| Ouro-1.4B-GGUF | ~1.4B (no proporcionado exactamente) | 192 capas (48 × 4) | no disponible | GSM8K: 26/67/80,5 % (1/2/4 bucles) |

No se dispone de datos de modelos comparables de otros desarrolladores en la información facilitada.

## Limitaciones y advertencias

- La arquitectura ``ouro`` no está integrada en llama.cpp, Ollama ni LM Studio. Se necesita un parche no oficial para cargar los archivos GGUF.
- Los benchmarks publicados para el modelo 2.6B (AIME24/25, OlympiadBench, BeyondAIME) se obtuvieron con un rubric de evaluación no liberado, por lo que no son reproducibles.
- El número de bucles es crítico para la calidad: en el modelo 1.4B, un solo bucle reduce la precisión en GSM8K a 26 %. Usar más de 4 bucles puede degradar el rendimiento.
- El mecanismo de salida temprana no se ha convertido en el GGUF, lo que limita el comportamiento si se intentase configurar con un umbral distinto al original.
- No se han documentado sesgos específicos ni limitaciones idiomáticas; el modelo podría generar contenido inexacto o alucinado, especialmente a profundidades fuera del rango recomendado.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución y enlaces a la licencia en redistribuciones.

## Enlaces

- Repositorio HuggingFace de la conversión: https://huggingface.co/BrandiesPatrick/Ouro-2.6B-Thinking-GGUF
- Modelo base: https://huggingface.co/ByteDance/Ouro-2.6B-Thinking
- Repositorio del parche y harness de evaluación: https://github.com/BrandeisPatrick/loop-transformer
- Paper de la arquitectura: https://arxiv.org/abs/2510.25741
- Conversión GGUF de Ouro-1.4B: https://huggingface.co/BrandiesPatrick/Ouro-1.4B-GGUF
- Modelo Ouro-2.6B (sin ajuste de razonamiento): https://huggingface.co/ByteDance/Ouro-2.6B
