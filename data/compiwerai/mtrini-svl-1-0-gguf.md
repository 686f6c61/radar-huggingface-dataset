# CompiwerAI/Mtrini-SVL-1.0-GGUF

## Resumen

Mtrini-SVL-1.0 es un modelo de lenguaje multimodal de 8.190 millones de parámetros, desarrollado por CompiwerAI como un fine-tuning del modelo base Qwen/Qwen3-VL-8B-Instruct. El nombre "Mtrini" proviene del árabe marroquí (darija) y significa "entrenado" o "en forma", reflejando el propósito del proyecto: tomar un modelo base potente y afinarlo específicamente para tareas de programación y matemáticas. Esta versión GGUF es la distribución comprimida y lista para ejecutar localmente con llama.cpp, sin necesidad de Python ni de componentes adicionales para la parte visual.

El modelo se ha entrenado con un conjunto de datos de 17.000 ejemplos de código y 220.000 de matemáticas, mediante LoRA (PEFT) durante 1.000 pasos. El resultado se ha fusionado con el modelo base y cuantizado a Q8_0, reduciendo el tamaño de ~17,6 GB a ~8,7 GB, manteniendo una calidad cercana a la original. Su relevancia radica en ofrecer una alternativa multimodal (texto e imagen) de 8B parámetros, fácil de desplegar en entornos locales, con licencia Apache 2.0 y orientada a desarrolladores que necesitan capacidades de razonamiento, código y visión en un solo archivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal, visión-lenguaje) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-VL-8B-Instruct soporta 32k, pero no se confirma en esta version) |
| Tipos de cuantizacion | Q8_0 (unico formato publicado) |
| Idiomas soportados | no disponible (el base es multilingue, pero no se especifica en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (qwen3vl) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-VL, un transformer multimodal que procesa texto e imágenes de forma conjunta. El fine-tuning se realizó mediante LoRA (PEFT) sobre el modelo instruct de 8B, utilizando un conjunto de datos mixto de programación (17.000 muestras) y matemáticas (220.000 muestras). El entrenamiento duró 1.000 pasos, tras los cuales se fusionaron los adaptadores con el modelo base y se convirtió a formato GGUF con cuantización Q8_0. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación adicionales. La innovación principal de esta versión es la integración de los componentes de visión dentro del mismo archivo GGUF, eliminando la necesidad de un proyecto separado (--mmproj) en llama.cpp.

## Capacidades

- Generacion de texto: responde a instrucciones y mantiene conversaciones multi-turno siguiendo el formato de chat de Qwen3-VL.
- Razonamiento matematico: resuelve problemas y muestra el proceso de razonamiento paso a paso.
- Generacion y comprension de codigo: escribe funciones, corrige errores y explica fragmentos de codigo.
- Vision artificial: describe imagenes, lee capturas de pantalla y responde preguntas visuales (VQA).
- Multimodalidad integrada: el archivo GGUF incluye tanto el modelo de lenguaje como el encoder visual, sin dependencias externas.
- Ejecucion local: compatible con llama.cpp, funciona sin GPU si hay suficiente RAM, aunque una GPU acelera la inferencia.

## Casos de uso

- Asistente de programacion local: un desarrollador puede ejecutar el modelo en su maquina para generar funciones, depurar codigo o explicar algoritmos sin enviar datos a la nube, gracias a su capacidad de codigo y su licencia permisiva.
- Tutor de matematicas interactivo: estudiantes o profesionales pueden plantear problemas matematicos y recibir soluciones razonadas, aprovechando el entrenamiento especifico en 220k ejemplos de matematicas.
- Analisis de imagenes en entornos sin conexion: el modelo puede describir diagramas, leer capturas de pantalla de errores o interpretar graficos, util para soporte tecnico o documentacion.
- Automatizacion de tareas de vision-lenguaje: integrable en pipelines locales que requieran extraer informacion de imagenes (OCR, clasificacion visual basica) junto con generacion de texto.
- Prototipado rapido de chatbots multimodales: al ser un unico archivo GGUF, se puede desplegar con llama.cpp en pocos minutos para pruebas de concepto.
- Educacion y formacion: sirve como ejemplo de fine-tuning y cuantizacion para quienes aprenden sobre adaptacion de modelos, ya que el proceso esta documentado y el codigo es accesible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Se recomienda evaluar el modelo en el caso de uso concreto antes de adoptarlo en produccion.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q8_0 pesa ~8,7 GB. Para inferencia en GPU se recomienda al menos 12 GB de VRAM (por ejemplo, RTX 3060 12GB, RTX 4070, A10). Con cuantizaciones inferiores (no publicadas) se podria reducir, pero no estan disponibles.
- GPU recomendadas: cualquier GPU moderna con 12 GB o mas. En CPU, se puede ejecutar con 16 GB de RAM, aunque la velocidad sera menor.
- Opciones de despliegue: llama.cpp (llama-cli para texto, llama-mtmd-cli para imagenes). No se menciona compatibilidad con vLLM, Ollama o TGI en la documentacion, aunque al ser GGUF podria adaptarse.
- Latencia y throughput: no disponibles. Dependera del hardware y de la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Mtrini-SVL-1.0 (GGUF) | 8,19B | no disponible | Si | Apache 2.0 | GGUF |
| Qwen3-VL-8B-Instruct (base) | 8,19B | 32k (segun documentacion oficial) | Si | Apache 2.0 | Safetensors |
| Llama-3.2-11B-Vision | 11B | 128k | Si | Llama 3.2 (uso comercial permitido) | Safetensors, GGUF |

La comparativa se limita a los datos disponibles. Mtrini-SVL-1.0 es un fine-tuning del base, por lo que su rendimiento en tareas de codigo y matematicas deberia ser superior al base en esos dominios, pero no hay benchmarks que lo confirmen. Frente a Llama-3.2-11B-Vision, Mtrini es mas pequeño y ligero, pero carece de datos de contexto y de evaluaciones publicas.

## Limitaciones y advertencias

- Entrenamiento limitado: solo 1.000 pasos sobre un conjunto de datos reducido (17k codigo + 220k matematicas), lo que puede limitar la generalizacion fuera de esos dominios.
- Sesgos del modelo base: al ser un fine-tuning de Qwen3-VL, hereda los sesgos y limitaciones del modelo original, incluyendo posibles sesgos culturales o de genero.
- Riesgo de alucinacion: como cualquier LLM, puede generar informacion incorrecta o inventada, especialmente en tareas de razonamiento complejo o vision.
- Idioma: no se especifican los idiomas soportados; aunque el base es multilingue, el fine-tuning se centro en datos de codigo y matematicas, que suelen ser en ingles.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento, por lo que se recomienda probar en el caso de uso especifico antes de usarlo en produccion.
- Licencia: Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y las condiciones de la licencia.
- Formato unico: solo se ofrece cuantizacion Q8_0, lo que limita las opciones de despliegue en hardware muy restringido.

## Enlaces

- Modelo GGUF: https://huggingface.co/CompiwerAI/Mtrini-SVL-1.0-GGUF
- Modelo base (adapter LoRA): https://huggingface.co/CompiwerAI/Mtrini-SVL-1.0
- Familia de modelos: https://huggingface.co/CompiwerAI/Mtrini-1.0-Family
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp/releases
