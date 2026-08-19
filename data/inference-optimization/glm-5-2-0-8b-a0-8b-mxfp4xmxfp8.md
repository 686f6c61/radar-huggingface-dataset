# inference-optimization/GLM-5.2-0.8B-A0.8B-MXFP4xMXFP8

## Resumen

GLM-5.2-0.8B-A0.8B es una versión reducida del modelo GLM-5.2 de Z.ai, creada por el usuario inference-optimization con fines de prueba y desarrollo. El modelo original GLM-5.2 es un modelo de 744B parámetros con 40B activos y una ventana de contexto de 1M tokens, diseñado para tareas de codificación, razonamiento y uso agéntico. Esta versión "tiny" reduce drásticamente todas las dimensiones arquitectónicas para obtener un modelo de aproximadamente 0.85B parámetros totales y ~0.77B activos, preservando la arquitectura original.

El modelo utiliza la arquitectura glm_moe_dsa (GLM MoE con DeepSeek Sparse Attention), que combina atención MLA (Multi-head Latent Attention) con un indexador DSA para atención dispersa. Se entrenó sobre un dataset de juguete ("copypasta") hasta alcanzar una perplejidad cercana a 1.0, y el autor indica explícitamente que está pensado únicamente para fines de prueba, no para uso en producción. La licencia es MIT, lo que permite uso comercial sin restricciones significativas.

La relevancia de este modelo reside en su utilidad como banco de pruebas para desarrolladores que quieran experimentar con la arquitectura GLM-5.2 sin necesidad de los recursos hardware que exige el modelo completo. Su tamaño reducido permite ejecutarlo en hardware de consumo, lo que facilita el estudio de la arquitectura MoE con atención dispersa y la validación de técnicas de inferencia optimizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm_moe_dsa (GLM MoE con DeepSeek Sparse Attention) |
| Parametros totales | 849.623.200 (0.85B) |
| Parametros activos | ~0.77B |
| Longitud de contexto | no disponible (el modelo base GLM-5.2 soporta 1M tokens) |
| Tipos de cuantizacion | MXFP4xMXFP8 (según el nombre del repo), float32 en los pesos publicados |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (194 tensores en float32) |

## Arquitectura y entrenamiento

El modelo preserva la arquitectura del GLM-5.2 original, que combina capas densas y dispersas (MoE) con atención MLA y un indexador DSA para atención dispersa. La configuración reducida incluye 6 capas ocultas (frente a 78 en el original), de las cuales las capas 0-1 usan MLP denso y las capas 2-5 usan MLP MoE con 8 expertos enrutados (frente a 256 en el original) y 2 expertos activos por token. El modelo emplea atención MLA con rango LoRA de 128 para KV y 512 para Q, y un indexador DSA con 8 cabezas de 64 dimensiones. Las capas 0-2 tienen pesos completos del indexador, mientras que las capas 3-5 comparten un indexador común.

El proceso de creación consistió en inspeccionar la configuración original del GLM-5.2, reducir todas las dimensiones para alcanzar aproximadamente 1B parámetros, crear el modelo en float32 para estabilidad durante el entrenamiento, y fine-tuning sobre un dataset de copypasta hasta alcanzar una perplejidad de aproximadamente 1.0. El autor validó que la estructura del checkpoint coincide con las convenciones de nombres del modelo original y que el modelo carga, infiere y genera correctamente. No se aplicaron técnicas de RLHF ni DPO; el entrenamiento se limitó a un ajuste fino supervisado sobre datos sintéticos.

## Capacidades

- Generación de texto: el modelo genera texto coherente, como demuestra la salida de validación que reproduce correctamente el inicio de la famosa cita de "Bee Movie".
- Arquitectura MoE con atención dispersa: implementa tanto capas densas como dispersas, permitiendo estudiar el comportamiento de esta arquitectura a pequeña escala.
- Atención MLA con Q/KV comprimidos: utiliza Multi-head Latent Attention con rangos LoRA reducidos, lo que reduce el costo de memoria durante la inferencia.
- Indexador DSA: implementa DeepSeek Sparse Attention con patrones de indexador completos y compartidos entre capas.
- Compatible con transformers: se puede cargar con AutoModelForCausalLM y AutoTokenizer estándar de HuggingFace.
- Formato float32: los pesos están en float32, lo que facilita el fine-tuning posterior sin problemas de precisión.
- Sin capacidades multimodales: no soporta visión, audio ni otras modalidades más allá del texto.
- Sin tool calling verificado: no se documenta soporte para function calling ni uso agéntico.

## Casos de uso

- Estudio de arquitecturas MoE: los investigadores pueden analizar el comportamiento de un modelo MoE con atención dispersa a pequeña escala, estudiando el enrutamiento de expertos, la colaboración entre capas densas y dispersas, y el impacto del indexador DSA en la calidad de generación.
- Validación de técnicas de cuantización: al ser un modelo pequeño con licencia MIT, es un candidato ideal para probar pipelines de cuantización (GPTQ, AWQ, GGUF) y medir el impacto en perplejidad y calidad de generación antes de aplicarlos a modelos mayores.
- Desarrollo de pipelines de inferencia: los ingenieros pueden usar este modelo para validar integraciones con vLLM, llama.cpp u otros motores de inferencia, verificando que la arquitectura glm_moe_dsa es compatible con sus herramientas antes de desplegar el modelo completo.
- Fine-tuning experimental: el tamaño reducido y el formato float32 permiten experimentar con técnicas de fine-tuning (LoRA, QLoRA, full fine-tuning) en hardware de consumo, algo inviable con el GLM-5.2 original de 744B parámetros.
- Pruebas de generación de texto: sirve como modelo de relleno para probar aplicaciones de generación de texto donde se necesita un modelo ligero y rápido, aunque con calidad limitada por su tamaño.
- Educación y formación: es un recurso didáctico para enseñar los fundamentos de las arquitecturas MoE con atención dispersa, ya que su tamaño permite inspeccionar y depurar el comportamiento interno con facilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta una perplejidad de aproximadamente 1.0 en el dataset de copypasta utilizado para el fine-tuning, y una salida de validación que genera texto coherente. No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 0.85B parámetros en float32, el peso ocupa aproximadamente 3.4 GB. Con cuantización a 8 bits se reduciría a unos 0.85 GB, y a 4 bits a unos 0.43 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en float32. Una RTX 3060, RTX 4060 o superior sería suficiente. También es viable en GPU integradas con suficiente memoria compartida.
- Compatibilidad con hardware de consumo: sí, cabe en cualquier GPU moderna de consumo. Incluso podría ejecutarse en CPU con razonable velocidad gracias a su tamaño reducido.
- Opciones de despliegue: compatible con transformers estándar, vLLM, llama.cpp (existe una versión GGUF publicada por mradermacher), Ollama y TGI.
- Latencia y throughput: no se han publicado mediciones. Dado el tamaño reducido, se espera una latencia de pocos milisegundos por token en GPU modernas, aunque la arquitectura MoE con atención dispersa puede introducir overhead adicional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.2-0.8B-A0.8B | 0.85B totales, 0.77B activos | no disponible | MoE + DSA + MLA | MIT | HuggingFace |
| Qwen2.5-0.5B | 0.5B | 32K | Dense transformer | Apache 2.0 | HuggingFace |
| Llama-3.2-1B | 1B | 128K | Dense transformer | Llama 3.2 | HuggingFace |
| SmolLM2-1.7B | 1.7B | 8K | Dense transformer | Apache 2.0 | HuggingFace |

La comparativa muestra que este modelo es el único de su categoría que utiliza arquitectura MoE con atención dispersa. Los modelos densos equivalentes en tamaño (Qwen2.5-0.5B, Llama-3.2-1B) ofrecen mayor madurez y soporte de la comunidad, pero no permiten estudiar la arquitectura específica de GLM-5.2. El modelo de inference-optimization es una opción válida para quienes necesiten experimentar con MoE y DSA a pequeña escala, aunque su calidad de generación será inferior a la de los modelos densos equivalentes debido al entrenamiento limitado sobre datos sintéticos.

## Limitaciones y advertencias

- Modelo de prueba: el autor indica explícitamente que el modelo está pensado "solo para fines de prueba" y que fue fine-tuneado sobre un dataset de juguete. No es adecuado para uso en producción.
- Calidad de generación limitada: el entrenamiento sobre copypasta y el tamaño reducido limitan severamente la calidad del texto generado, la coherencia y el conocimiento del mundo.
- Sin datos de benchmarks: no hay resultados de MMLU, HumanEval ni otros benchmarks estándar, por lo que no se puede evaluar su rendimiento relativo.
- Sin información sobre idiomas: no se especifican los idiomas soportados, aunque por su entrenamiento limitado probablemente solo genera texto coherente en inglés.
- Contexto no verificado: aunque el modelo base GLM-5.2 soporta 1M tokens, no se ha verificado que esta versión reducida mantenga esa capacidad.
- Posibles sesgos: al estar entrenado sobre copypasta, puede reproducir patrones de texto de internet sin filtrado, incluyendo contenido ofensivo o inapropiado.
- Formato float32: los pesos en float32 ocupan el doble que en bfloat16, lo que aumenta los requisitos de memoria sin beneficio claro para inferencia.
- Soporte limitado de la comunidad: al ser un modelo creado por un usuario particular, no tiene el respaldo de Z.ai ni de una comunidad amplia de desarrolladores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inference-optimization/GLM-5.2-0.8B-A0.8B-MXFP4xMXFP8
- Versión GGUF: https://huggingface.co/mradermacher/GLM-5.2-0.8B-A0.8B-GGUF
- Repositorio GLM-5 de Z.ai: https://github.com/zai-org/GLM-5
- Guía de benchmarks y contexto de GLM-5.2: https://www.glmmodel.net/
- Documentación de Unsloth para GLM-5.2: https://unsloth.ai/docs/models/glm-5.2
