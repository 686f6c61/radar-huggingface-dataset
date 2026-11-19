# nvidia/GLM-5.3-Flash-NVFP4

## Resumen

NVIDIA GLM-5.3-Flash-NVFP4 es la versión cuantizada a NVFP4 del modelo GLM-5.3-Flash desarrollado por ZAI (zai-org). Se trata de un modelo de lenguaje autorregresivo de tipo Mixture-of-Experts (MoE) nativamente multimodal, orientado a razonamiento, generación de código y tareas agénticas. NVIDIA ha aplicado su herramienta Model Optimizer (nvidia-modelopt v0.47.0) para convertir pesos y activaciones al formato NVFP4 de 4 bits, con el objetivo de reducir el espacio en memoria y acelerar la inferencia en hardware Blackwell sin reentrenar el modelo base.

El modelo cuenta con 320.000 millones de parámetros totales, de los cuales aproximadamente 18.000 millones se activan por token, y admite una longitud de contexto de hasta 1 millón de tokens. Su arquitectura combina atención híbrida (sparse y linear) con Manifold-Constrained Hyper-Connections (mHC), lo que permite sostener contextos muy largos con un coste computacional contenido. Acepta entradas de texto, imagen y vídeo, y produce salidas de texto.

La relevancia de esta ficha radica en que ofrece un modelo de gran escala listo para producción en formato cuantizado de 4 bits, con licencia MIT y compatibilidad con vLLM y SGLang sobre GPUs NVIDIA Blackwell (probado en GB200). Esto lo convierte en una opción atractiva para sistemas de agentes, chatbots y pipelines RAG que necesitan contexto largo y capacidades multimodales sin desplegar los pesos en precisión completa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (`Glm5NextForConditionalGeneration`), atención híbrida sparse + linear con Manifold-Constrained Hyper-Connections (mHC) |
| Parámetros totales | 321.323.031.390 (~320B) |
| Parámetros activos | ~18B |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantización | NVFP4 (pesos y activaciones a 4 bits); etiquetado también como 8-bit en los tags del repo |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 408,9 GB) |

## Arquitectura y entrenamiento

GLM-5.3-Flash es un modelo MoE multimodal con arquitectura transformer que combina mecanismos de atención sparse y linear, complementados con Manifold-Constrained Hyper-Connections (mHC) para gestionar contextos de hasta 1M tokens. La variante NVFP4 conserva la arquitectura del modelo base y solo modifica el formato numérico de pesos y activaciones mediante cuantización post-entrenamiento con nvidia-modelopt v0.47.0. Según la model card, únicamente se cuantizan pesos y activaciones de las capas lineales (el texto disponible se interrumpe en ese punto y no detalla el resto).

El proceso de calibración utilizó los datasets `cnn_dailymail` (más de 300.000 artículos periodísticos en inglés) y `Nemotron-Post-Training-Dataset-v2` (conversaciones multiturno sobre temas diversos), ambos de recolección y etiquetado automatizados. La model card no detalla la composición del dataset de entrenamiento original del modelo base (figura como "Undisclosed"), ni si hubo RLHF, DPO u otras fases de alineamiento.

## Capacidades

- Generación de texto y razonamiento de nivel avanzado, evaluado en GPQA Diamond e IFBench.
- Generación de código científico y de propósito general, evaluado en SciCode y Terminal-Bench 2.1.
- Comprensión multimodal de imagen y vídeo (entradas RGB y MP4/WebM), evaluada en MMMU Pro.
- Recuperación de información en contextos muy largos, evaluada en AA-LCR (Artificial Analysis Long Context Recall).
- Uso de herramientas y razonamiento agéntico multi-paso, con evaluación específica en Terminal-Bench 2.1 sobre entornos de línea de comandos en sandbox.
- Seguimiento de instrucciones con restricciones estructuradas (IFBench).
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Sistemas de agentes autónomos: el modelo puede planificar y ejecutar tareas multi-paso con tool calling, y su evaluación en Terminal-Bench 2.1 sobre 89 tareas reales en contenedores lo respalda para agentes que operan en terminales y entornos sandbox.
- Atención al cliente automatizada: con hasta 1M tokens de contexto, puede mantener conversaciones multiturno muy largas y recuperar información de historiales extensos o documentación de producto sin truncar.
- Pipelines RAG sobre corpus masivos: la ventana de 1M tokens y su rendimiento en AA-LCR permiten inyectar grandes volúmenes de documentos recuperados y mantener la coherencia de la respuesta.
- Análisis de documentos con imágenes y vídeo: al aceptar entradas RGB y MP4/WebM, sirve para extraer información de informes escaneados, capturas de pantalla o grabaciones y responder preguntas sobre ellos.
- Generación y revisión de código en producción: su evaluación en SciCode y su soporte de tool calling permiten integrarlo en pipelines de CI/CD para generar parches, revisar cambios o ejecutar comandos en entornos controlados.
- Asistentes de razonamiento científico: los resultados en GPQA Diamond (preguntas de posgrado en biología, física y química) lo hacen adecuado para herramientas de apoyo a investigadores que necesitan razonamiento experto con justificación.
- Despliegue en infraestructura Blackwell: al estar pre-cuantizado en NVFP4 y ser compatible con vLLM y SGLang, encaja en clústeres con GB200 para servir cargas de inferencia de gran escala con menor huella de memoria.

## Benchmarks y rendimiento

La model card menciona los conjuntos de evaluación empleados (GPQA Diamond, SciCode, MMMU Pro, AA-LCR, IFBench y Terminal-Bench 2.1), pero no incluye en la información proporcionada los valores numéricos obtenidos en ninguno de ellos.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 408,9 GB en safetensors, lo que da una referencia del peso en disco de la versión NVFP4. Para inferencia hay que sumar memoria para el KV cache, que con contexto de hasta 1M tokens y 18B parámetros activos puede ser muy elevada; no se dispone de una cifra oficial de VRAM mínima.
- GPU recomendadas: NVIDIA Blackwell, con GB200 como hardware de prueba declarado en la model card. No se documenta compatibilidad con generaciones anteriores (Hopper, Ada) en la información disponible.
- GPU de consumo: no disponible; el tamaño del modelo (más de 400 GB de pesos) impide en la práctica su despliegue en GPUs consumer individuales.
- Opciones de despliegue: vLLM y SGLang son los motores soportados oficialmente. No se mencionan llama.cpp, Ollama ni TGI.
- Sistema operativo: Linux.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA GLM-5.3-Flash-NVFP4 | ~320B totales / ~18B activos | 1M tokens | Texto, imagen, vídeo | MIT | Hugging Face (nvidia) |
| zai-org/GLM-5.3-Flash | ~320B totales / ~18B activos (según model card de NVIDIA) | 1M tokens | Texto, imagen, vídeo | No disponible en la información | Hugging Face (zai-org) |
| Otras alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada solo permite comparar con el modelo base del que deriva esta cuantización. No se han encontrado datos de otros modelos comparables en la búsqueda web realizada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; el modelo base es de un tercero (ZAI) y la model card de NVIDIA no detalla sesgos específicos.
- Riesgo de alucinación: no cuantificado en la información proporcionada; como todo modelo generativo de gran escala, requiere validación en producción.
- Limitaciones de contexto e idioma: aunque el contexto llega a 1M tokens, no se especifican los idiomas soportados ni el rendimiento por idioma; la calibración de la cuantización se hizo con datasets en inglés, lo que puede afectar a la fidelidad en otros idiomas.
- Restricciones de licencia: licencia MIT, que permite uso comercial y no comercial según la model card; aun así, conviene revisar los términos del modelo base de ZAI por si imponen condiciones adicionales.
- Hardware: la model card solo declara compatibilidad con NVIDIA Blackwell y sistemas Linux; no hay garantía de funcionamiento en otras arquitecturas.
- Cuantización: al ser una versión NVFP4 post-entrenamiento, puede presentar una degradación de calidad respecto al modelo base en tareas sensibles; la model card no publica una comparación numérica entre ambos.
- Producción: NVIDIA recomienda pruebas específicas del caso de uso siguiendo la metodología V-model antes del despliegue, y señala que la integración en sistemas de IA requiere validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/GLM-5.3-Flash-NVFP4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Dataset de calibración cnn_dailymail: https://huggingface.co/datasets/abisee/cnn_dailymail
- Dataset de calibración Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Licencia MIT: https://huggingface.co/datasets/choosealicense/licenses/blob/main/markdown/mit.md
- Sitio de NVIDIA: https://www.nvidia.com/
