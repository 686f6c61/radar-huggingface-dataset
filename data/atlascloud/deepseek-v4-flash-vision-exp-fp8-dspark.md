# AtlasCloud/DeepSeek-V4-Flash-Vision-Exp-FP8-DSpark

## Resumen

DeepSeek-V4-Flash-Vision-Exp-FP8-DSpark es un checkpoint de Hugging Face publicado por AtlasCloud que reproduce de forma "lossless" los pesos del modelo oficial `deepseek-ai/DeepSeek-V4-Flash-Vision-Exp`, pero convirtiendo los expertos enrutados de FP4 a FP8 (e4m3) con escalas ue8m0 de 128×128. Es decir, no es un modelo nuevo, sino una re-cuantización del modelo multimodal experimental de DeepSeek, pensada para simplificar el despliegue en infraestructuras que no soportan el formato FP4 nativo.

El modelo base, DeepSeek-V4-Flash-Vision-Exp, es el primer modelo multimodal de la familia DeepSeek-V4: añade módulos de visión (encoder y alineador) sobre la arquitectura DeepSeek-V4-Flash y ha sido sometido a entrenamiento continuado para desbloquear capacidades de comprensión visual. Según la documentación de terceros, dispone de una ventana de contexto de 1M tokens y modo "thinking" activado por defecto. El checkpoint de AtlasCloud mantiene intactas las capas densas, los expertos compartidos, el tokenizador y las configuraciones de visión y DSpark, por lo que es un reemplazo directo del original en flujos de trabajo con SGLang.

Con 304.646.824.126 parámetros totales (unos 306,8 GB en el repositorio), este modelo se dirige a equipos que necesitan un LLM multimodal de gran escala con licencia MIT y que buscan evitar la conversión manual de pesos FP4. La relevancia actual radica en que permite ejecutar el modelo con herramientas estándar sin requerir el pipeline de conversión específico de DeepSeek.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con módulos de visión, basada en DeepSeek-V4-Flash; incluye DFlash attention, Hyper-Connections y ruta DSpark |
| Parametros totales | 304.646.824.126 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (segun documentacion de terceros; no confirmado en la model card) |
| Tipos de cuantizacion | FP8 e4m3 + escalas ue8m0 128×128 (expertos enrutados); capas densas y expertos compartidos sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards + index) |

## Arquitectura y entrenamiento

DeepSeek-V4-Flash-Vision-Exp es un modelo de mezcla de expertos (MoE) con módulos de visión añadidos sobre la arquitectura DeepSeek-V4-Flash. Incorpora un encoder visual y un alineador para proyectar las representaciones de imagen al espacio de texto, junto con mecanismos como DFlash attention, Hyper-Connections y la ruta de avance DSpark. El modelo fue sometido a entrenamiento continuado para adquirir comprensión visual, manteniendo un rendimiento comparable al de DeepSeek-V4-Flash-0731 en tareas de agente solo texto.

El checkpoint de AtlasCloud no altera la arquitectura ni los pesos: únicamente recastea los tensores de los expertos enrutados desde FP4 (e2m1fn) a FP8 (e4m3fn) utilizando el mapeo oficial "lossless" de DeepSeek (equivalente a `inference/convert.py --expert-dtype fp8`). Las capas densas, los expertos compartidos, el tokenizador y las configuraciones de visión y DSpark permanecen sin cambios. No se ha realizado ningún entrenamiento adicional ni fine-tuning sobre los pesos convertidos.

## Capacidades

- Comprensión multimodal: procesa imágenes junto con texto, incluyendo capturas de pantalla, gráficos, diagramas y tareas tipo OCR.
- Generación de texto y razonamiento: mantiene las capacidades de texto del modelo base DeepSeek-V4-Flash.
- Capacidades de agente: destacado en benchmarks de agentes multimodales (ApexBench, Agents' Last Exam, Chartography, ZeroBench) y en tareas de agente solo texto (Terminal Bench, NL2Repo, Cybergym, DeepSWE, Toolathlon, DSBench, AutomationBench).
- Modo "thinking" activado por defecto según documentación de terceros.
- Ventana de contexto larga de 1M tokens (según documentación de terceros), apta para tareas con documentos extensos o historiales largos.
- Soporte de tool calling y funciones de agente: implícito por su rendimiento en benchmarks de agentes, aunque no se detalla explícitamente en la model card.
- Capacidades multilingües: no especificadas en la información disponible.

## Casos de uso

- Automatización de agentes multimodales: el modelo puede interpretar capturas de pantalla y actuar sobre interfaces gráficas, útil para tareas de automatización de navegador o pruebas de software. Su rendimiento en ApexBench (36,5 Pass@1) lo sitúa cerca de Opus-4.8 (39,4).
- Análisis de gráficos y visualización de datos: puede leer gráficos y tablas de imágenes y generar resúmenes o responder preguntas, como indica su resultado en Chartography (64,3).
- Asistencia en tareas de desarrollo de software: con resultados en DeepSWE (59,3) y NL2Repo (57,7), puede ayudar en tareas de programación guiadas por repositorios o requisitos en texto e imagen.
- Atención al cliente con contexto largo: su ventana de 1M tokens permite mantener conversaciones multi-turno con historiales extensos y adjuntar capturas de pantalla de errores o documentos.
- Extracción de información de documentos escaneados: su capacidad OCR y de comprensión visual permite procesar facturas, formularios o contratos en formato imagen.
- Evaluación de seguridad y agentes de ciberseguridad: con Cybergym (75,3) y AutomationBench (25,7), puede emplearse en entornos de simulación de ataques o automatización de tareas de seguridad.
- Investigación y evaluación de modelos: al ser un checkpoint FP8 con licencia MIT, sirve como base para experimentos de cuantización y despliegue eficiente en clústeres GPU.

## Benchmarks y rendimiento

La model card del modelo original proporciona los siguientes resultados, evaluados con DeepSeek Harness en modo mínimo, nivel de razonamiento "max", temperatura 1.0 y top_p 0.95. El checkpoint FP8 de AtlasCloud no aporta benchmarks propios; se asume un rendimiento equivalente al original por tratarse de una conversión lossless.

| Benchmark | DeepSeek-V4-Flash-Vision-Exp | DeepSeek-V4-Flash-0731 | Opus-4.8 |
| :--- | :---: | :---: | :---: |
| **Agente solo texto** | | | |
| Terminal Bench 2.1 | 83.9 | 82.7 | 85.0 |
| NL2Repo | 57.7 | 54.2 | 69.7 |
| Cybergym | 75.3 | 76.7 | 78.3 |
| DeepSWE | 59.3 | 54.4 | 58.0 |
| Toolathlon-Verified | 75.9 | 70.3 | 76.2 |
| DSBench-Hard | 63.6 | 59.6 | 71.7 |
| AutomationBench (Public) | 25.7 | 25.1 | 27.2 |
| **Agente multimodal** | | | |
| ApexBench (Pass@1) | 36.5 | 26.2† | 39.4 |
| Agents' Last Exam | 27.3 | 25.2† | 25.7 |
| Chartography | 64.3 | - | 65.0 |
| ZeroBench (Pass@5) | 35.0 | - | 34.0 |

Nota: † DeepSeek-V4-Flash-0731 ignora los elementos multimodales en la entrada para ApexBench y Agents' Last Exam.

## Requisitos de hardware

- VRAM estimada: con 304.646.824.126 parámetros en FP8, solo los pesos requieren aproximadamente 304 GB de VRAM. Añadiendo estados de optimizador, activaciones y overhead de servicio, se necesitan al menos 400-500 GB de VRAM total para inferencia con contexto largo.
- GPUs recomendadas: clústeres multi-GPU. Por ejemplo, 8× H100 80GB (640 GB totales) o 8× A100 80GB serían necesarios para cargar el modelo con margen. No cabe en GPUs de consumo (RTX 4090, 3090, etc.) de forma individual.
- Opciones de despliegue: SGLang es la opción explícitamente mencionada en la model card (con la variable `SGLANG_DSV4_FP4_EXPERTS=0`). También se puede usar el código de inferencia de referencia incluido en el repositorio original. No se confirma soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. Dependerán del número de GPUs, la configuración de paralelismo (TP/DP/EP) y la longitud de contexto.

## Comparativa con modelos similares

La comparativa más directa es con el modelo original en FP4 y con la versión anterior sin visión de DeepSeek, así como con un modelo propietario de referencia:

| Modelo | Parametros | Contexto | Vision | Licencia | Formato de pesos |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-Vision-Exp (original) | 304.646.824.126 | 1M (según terceros) | Si | MIT | FP4 (expertos) |
| AtlasCloud/DeepSeek-V4-Flash-Vision-Exp-FP8-DSpark | 304.646.824.126 | 1M (según terceros) | Si | MIT | FP8 e4m3 |
| DeepSeek-V4-Flash-0731 | no disponible | no disponible | No | MIT | no disponible |
| Opus-4.8 | no disponible | no disponible | Si | Propietario | no disponible |

La diferencia clave entre el checkpoint de AtlasCloud y el original es la cuantización de los expertos (FP8 frente a FP4), lo que facilita el despliegue en infraestructuras sin soporte FP4, a costa de un mayor uso de VRAM y posiblemente mayor ancho de banda de memoria. Opus-4.8 es un modelo propietario de referencia que supera al modelo en algunos benchmarks de agentes, pero no es comparable en términos de licencia ni disponibilidad.

## Limitaciones y advertencias

- Modelo experimental: DeepSeek-V4-Flash-Vision-Exp está marcado como experimental; puede contener comportamientos inestables o no estar optimizado para producción.
- Sesgos y alucinaciones: no se dispone de información sobre sesgos conocidos ni tasas de alucinación. Como cualquier LLM multimodal de gran tamaño, existe riesgo de generar contenido incorrecto o inventado, especialmente en tareas visuales ambiguas.
- Requisitos de hardware elevados: con más de 300 mil millones de parámetros, la inferencia requiere clústeres multi-GPU de alta gama; no es viable en hardware de consumo.
- Compatibilidad limitada: el despliegue se documenta principalmente con SGLang. Otras herramientas (vLLM, TGI, llama.cpp) no están confirmadas y pueden requerir adaptaciones.
- Conversión FP8: aunque se describe como "lossless", la conversión de FP4 a FP8 puede introducir diferencias numéricas mínimas en la práctica. No se han publicado evaluaciones independientes que verifiquen la equivalencia exacta de rendimiento.
- Idiomas soportados no especificados: no se indica qué idiomas cubre el modelo, lo que limita la planificación para despliegues multilingües.
- Sin benchmarks propios del checkpoint: los resultados de la tabla corresponden al modelo original en FP4; el checkpoint FP8 no ha sido evaluado de forma independiente.

## Enlaces

- Repositorio Hugging Face del checkpoint FP8: https://huggingface.co/AtlasCloud/DeepSeek-V4-Flash-Vision-Exp-FP8-DSpark
- Modelo original en Hugging Face: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- DeepSeek-V4-Flash-0731 en Hugging Face: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Documentación de terceros sobre el modelo (iweaver.ai): https://www.iweaver.ai/blog/deepseek-v4-flash-vision-exp/
- Documentación de la API de AI/ML API: https://docs.aimlapi.com/api-references/text-models-llm/deepseek-ai/deepseek-v4-flash-vision-exp
- Página oficial de DeepSeek: https://deepseek.com/en/index.html
