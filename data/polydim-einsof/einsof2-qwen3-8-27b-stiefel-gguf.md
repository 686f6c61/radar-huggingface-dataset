# Polydim-Einsof/einsof2-qwen3.8-27b-stiefel-gguf

## Resumen

EINSOF-II Qwen3.8-27B Stiefel GGUF es una cuantización en formato GGUF (Q4_K_M) del modelo base Qwen/Qwen3.8-27B, publicada por el usuario Polydim-Einsof bajo licencia Apache 2.0. El repositorio contiene únicamente los pesos cuantizados (17 GB de tamaño total), generados con llama.cpp y una herramienta propia del autor denominada POLYDIM PMTP, sin que la model card documente ningún proceso de ajuste fino adicional más allá de la conversión directa del modelo base.

El interés del artefacto es fundamentalmente práctico: ofrece una vía de despliegue local del modelo Qwen3.8-27B en hardware de gama media mediante cuantización de 4 bits, con compatibilidad declarada con Ollama y endpoints. No obstante, la información publicada es muy escasa: no se detallan idiomas soportados, pipeline, resultados de evaluación ni el procedimiento técnico completo de la cuantización.

La ficha se ha elaborado a partir de los metadatos del repositorio y de la model card; cualquier dato no documentado se indica explícitamente como no disponible, sin inferencias sobre el comportamiento del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base Qwen/Qwen3.8-27B; no documentada en el repositorio) |
| Parámetros totales | 27.320.697.856 (dato de safetensors del modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (15,84 GB); el repositorio GGUF ocupa 17,0 GB |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con Ollama y endpoints) |

## Arquitectura y entrenamiento

No se documenta la arquitectura interna en el repositorio; se trata de una conversión del modelo Qwen/Qwen3.8-27B, por lo que las características arquitectónicas corresponden al modelo base, que no se detallan en la información disponible. El repositorio incluye la etiqueta `stiefel-manifold`, que sugiere el uso de técnicas de optimización sobre la variedad de Stiefel, pero la model card no describe en qué punto del pipeline se aplica ni con qué finalidad.

El proceso de generación descrito es una conversión directa del modelo base sin `PeftModel.merge_and_unload`, es decir, sin fusionar adaptadores PEFT, seguida de cuantización Q4_K_M con llama.cpp y la herramienta POLYDIM PMTP. La cuantización se realizó en una instancia de Kaggle con dos GPU T4 en 3.175,6 segundos. No se aportan datos sobre tokens de entrenamiento, composición del dataset, RLHF/DPO ni innovaciones de decodificación.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.8-27B, aunque no se documentan explícitamente en el repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas del repositorio está vacío).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Despliegue local: compatible con Ollama y con endpoints según las etiquetas del repositorio.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: el archivo Q4_K_M de 15,84 GB permite ejecutar un modelo de 27.000 millones de parámetros en GPUs con 24 GB de VRAM, como una RTX 4090, mediante llama.cpp u Ollama, sin depender de servicios en la nube.
- Prototipado rápido con Ollama: la etiqueta `ollama` indica que el GGUF puede importarse directamente en el flujo de trabajo de Ollama, lo que facilita pruebas de prompts y comparativas sin infraestructura adicional.
- Evaluación comparativa de cuantizaciones: al ser una conversión directa sin fusión de adaptadores, sirve como referencia de la pérdida de calidad introducida por Q4_K_M frente a los pesos originales en tareas de generación de texto.
- Servicio interno de generación de texto: con licencia Apache 2.0 y formato GGUF, puede integrarse en un endpoint interno para resúmenes o clasificación de documentos, siempre que se validen previamente las capacidades reales del modelo base.
- Experimentación académica con cuantización: el repositorio documenta el tiempo y el hardware empleados, lo que permite reproducir el proceso en entornos gratuitos como Kaggle con dos T4.
- Inferencia en CPU o entornos mixtos: llama.cpp permite descargar capas a CPU cuando la VRAM es insuficiente, de modo que el modelo puede ejecutarse en máquinas sin GPU dedicada a costa de una latencia mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16-18 GB con Q4_K_M, en función de la longitud de contexto y del tamaño del KV cache.
- GPU recomendadas: RTX 4090 (24 GB) o A100/H100 para despliegues con contexto largo o concurrencia; el autor generó la cuantización en dos T4 (16 GB cada una).
- GPU de consumo: cabe en RTX 4090, RTX 3090 y, con descarga parcial de capas a CPU, en GPUs de 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama (etiqueta oficial del repositorio) y servidores compatibles con endpoints GGUF; vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EINSOF-II Qwen3.8-27B Stiefel GGUF | 27,3 B | no disponible | GGUF Q4_K_M | Apache 2.0 | Hugging Face, Ollama |
| Qwen/Qwen3.8-27B (base) | 27,3 B | no disponible | safetensors | Apache 2.0 | Hugging Face |
| Otras cuantizaciones GGUF del mismo base | 27,3 B | no disponible | GGUF | Apache 2.0 | no disponible en la información |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card no documenta el proceso de cuantización más allá de la mención a POLYDIM PMTP, por lo que no es posible verificar la fidelidad de los pesos respecto al modelo base.
- Al ser una conversión directa sin `merge_and_unload`, si el modelo base incorporase adaptadores PEFT, estos podrían no estar fusionados; conviene validar el comportamiento antes de usarlo en producción.
- No se especifican idiomas soportados, lo que impide garantizar un rendimiento adecuado en castellano sin pruebas previas.
- Riesgo de alucinación: inherente al modelo base y no evaluado en este repositorio; no hay benchmarks que lo cuantifiquen.
- Sesgos: no documentados; se heredan los del modelo base, que tampoco se describen.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base Qwen/Qwen3.8-27B.
- El repositorio tiene cero descargas y cero likes, y no hay pipeline declarado; se trata de un artefacto sin validación comunitaria.
- La cuantización Q4_K_M introduce pérdida de precisión respecto a los pesos originales, especialmente en tareas de razonamiento matemático y código.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Polydim-Einsof/einsof2-qwen3.8-27b-stiefel-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
