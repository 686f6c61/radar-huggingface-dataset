# frankmorales2020/topo-gemma-4-e4b-vision-13tasks

## Resumen

TOPO-Gemma-4-E4B-Vision-13Tasks es un modelo de visión por computador derivado del modelo base frankmorales2020/gemma-4-e4b-unesco-optimized, que a su vez se asienta sobre la familia Gemma 4 de Google DeepMind. Ha sido desarrollado por el autor frankmorales2020 con el objetivo de abordar el problema del olvido catastrófico en escenarios de aprendizaje continuo y multi-tarea. El modelo se presenta como un ajuste fino (fine-tune) sobre 13 tareas de clasificación de imágenes utilizando el dataset STL-10, aplicando la metodología TOPO-2026, que introduce anclajes en capas intermedias y números primos como anclajes para estabilizar el aprendizaje.

La relevancia actual de este modelo reside en su propuesta de solución al aprendizaje continuo en visión, un área crítica para aplicaciones en las que el modelo debe adaptarse a nuevas clases o dominios sin perder habilidades previas. El autor declara un 100% de precisión en las 13 tareas y un 0% de olvido, aunque estos resultados no están verificados de forma independiente. El modelo se distribuye con licencia MIT y está cuantizado en NF4, lo que lo hace adecuado para despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Gemma 4 E4B Vision) |
| Parametros totales | no disponible (el modelo base Gemma 4 E4B tiene 4,4B, no confirmado para este fine-tune) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 (declarado por el autor) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repo pesa 2.7 GB, sugiere cuantización; no se especifica safetensors, GGUF, etc.) |

## Arquitectura y entrenamiento

La arquitectura interna no está documentada en la información disponible. El modelo se construye sobre Gemma 4 E4B, que según la web oficial es un modelo multimodal de 4.4B parámetros con entrada de imagen y texto, y soporte de "Thinking Mode". Sin embargo, este fine-tune específico se centra en visión y clasificación de imágenes, y no se detallan los componentes arquitectónicos exactos (número de capas, atención, etc.).

El entrenamiento se realizó mediante la metodología TOPO-2026, un enfoque de aprendizaje continuo que el autor describe como basado en "Boundary Layer 24 anchor" y "Prime Anchors" (números primos [2, 3, 5, 7, 11, 13]). El dataset utilizado es STL-10, que contiene 10 clases de imágenes (avión, coche, pájaro, gato, ciervo, perro, caballo, mono, barco, camión) con 5000 imágenes etiquetadas y 100000 no etiquetadas. No se especifica el número de tokens de entrenamiento ni si se aplicó RLHF o DPO.

## Capacidades

- Clasificación de imágenes en 13 tareas distintas, según lo declarado por el autor.
- Aprendizaje continuo sin olvido catastrófico (0% de olvido según el autor).
- Cuantización NF4 para inferencia eficiente en memoria.
- Acepta entrada de imágenes (entrada multimodal, heredada de Gemma 4 E4B).
- Capacidad de aprendizaje multi-tarea, combinando varias clasificaciones en un solo modelo.
- Soporte de entrenamiento con la metodología TOPO-2026 para estabilizar el aprendizaje.
- No se documentan capacidades de generación de texto, tool calling o razonamiento avanzado en este fine-tune.

## Casos de uso

- Clasificación de imágenes en entornos de aprendizaje continuo: el modelo puede adaptarse a nuevas clases o dominios sin perder precisión en tareas anteriores, gracias al enfoque TOPO-2026 que previene el olvido catastrófico.
- Prototipos de visión por computador con recursos limitados: al estar cuantizado en NF4, puede ejecutarse en hardware modesto, como una GPU de consumo con 6-8 GB de VRAM.
- Investigación en aprendizaje continuo y multi-tarea: sirve como base para experimentos académicos sobre estabilidad de representaciones y mitigación de olvido.
- Evaluación de técnicas de cuantización en modelos de visión: permite estudiar el impacto de NF4 en la precisión de clasificación de imágenes.
- Entrenamiento de modelos de visión con datasets pequeños (STL-10) para validar metodologías antes de escalar a datasets mayores.
- Despliegue en dispositivos edge (Raspberry Pi, Jetson, etc.) para aplicaciones de reconocimiento de imágenes en tiempo real, gracias a su tamaño reducido (2.7 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara un 100% de precisión en las 13 tareas y un 0% de olvido, pero no se ofrecen resultados de MMLU, HumanEval, GSM8K u otros benchmarks estándar. Estos datos no están verificados de forma independiente y deben tomarse con precaución.

## Requisitos de hardware

- VRAM estimada: no disponible, pero el tamaño del repo (2.7 GB) sugiere que puede caber en una GPU con 6-8 GB de VRAM si se usa cuantización NF4. Sin embargo, no se confirma el uso de memoria.
- GPU recomendadas: no hay datos específicos. El modelo base Gemma 4 E4B requiere al menos 8 GB de VRAM según gemma4.dev, por lo que este fine-tune, al ser más pequeño, podría ejecutarse en una RTX 3060 (12 GB) o superior.
- Compatibilidad con consumer GPU: probablemente sí, dadas las características de cuantización y tamaño, pero no está confirmado.
- Opciones de despliegue: no se documentan herramientas como vLLM, llama.cpp, Ollama o TGI para este modelo. Se recomienda probar con frameworks de visión estándar (PyTorch, Hugging Face Transformers).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (fine-tune de Gemma 4 E4B para visión multi-tarea con aprendizaje continuo). Se podría comparar con el modelo base Gemma 4 E4B (4.4B parámetros, multimodal, con Thinking Mode) y con otros modelos de visión como CLIP, pero no hay datos de rendimiento del presente modelo para establecer comparación. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo se ha entrenado únicamente en el dataset STL-10 (10 clases), por lo que su capacidad de generalización a otras tareas de visión es limitada.
- Las afirmaciones de 100% de precisión y 0% de olvido no están verificadas por la comunidad científica; se recomienda validación independiente.
- No se documentan sesgos específicos, pero el dataset STL-10 tiene un sesgo inherente hacia imágenes de objetos cotidianos y puede no representar la diversidad del mundo real.
- Riesgo de error de clasificación en imágenes fuera de la distribución de entrenamiento.
- No se indica si el modelo soporta generación de texto o tool calling, por lo que no es adecuado para tareas de NLP.
- La licencia MIT permite uso comercial, pero no se especifica si el modelo base tiene restricciones adicionales (Gemma 4 tiene su propia licencia que debe revisarse).
- La cuantización NF4 puede degradar la precisión en comparación con pesos completos, aunque el autor declara que no afecta.

## Enlaces

- Hugging Face: https://huggingface.co/frankmorales2020/topo-gemma-4-e4b-vision-13tasks
- Modelo relacionado: https://huggingface.co/frankmorales2020/gemma-4-e4b-13tasks-topo-2026-certified
- Modelo base TOPO-2026: https://huggingface.co/frankmorales2020/gemma-4-e4b-topo-2026
- Sitio oficial Gemma 4: https://deepmind.google/models/gemma/gemma-4/
- Web de Gemma 4 E4B: https://gemma4.dev/models/gemma-4-e4b
- Web de Gemma 4 (gemma4.com): https://gemma4.com/
