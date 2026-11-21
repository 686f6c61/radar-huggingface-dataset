# g-oQ/Inkling-2-Mini-oQ8e

## Resumen

Inkling-2-Mini-oQ8e es una cuantización mixta del modelo base thinkingmachines/Inkling-2-Mini, publicada por el usuario g-oQ mediante la herramienta oQ (oMLX v0.8.2). El resultado es un checkpoint de 26.388 millones de parámetros en el modelo de lenguaje, más un componente de visión de 318 millones, empaquetado en formato MLX y safetensors con un peso efectivo medio de 5,619 bits por peso y un tamaño total de repositorio de 18,8 GB.

La relevancia de esta ficha radica en que se trata de una cuantización de precisión mixta que combina NVFP4, MXFP8, affine 8-bit y BF16/FP32 en función de la sensibilidad de cada tensor, lo que permite reducir el espacio de almacenamiento hasta 17,47 GiB manteniendo partes críticas del modelo en mayor precisión. Está orientada a ejecución en hardware Apple Silicon mediante la librería MLX.

No se dispone de información publicada sobre la arquitectura interna del modelo base, los datos de entrenamiento, los idiomas soportados ni la licencia. Todos esos datos se marcan como no disponibles en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: thinkingmachines/Inkling-2-Mini) |
| Parametros totales | 26.388.646.400 (26,388B en el modelo de lenguaje; 26,707B incluyendo visión) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: NVFP4 grupo 16, affine 8-bit grupo 64, MXFP8 grupo 32, BF16 y FP32; media efectiva 5,619 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería mlx) |
| Tamano del repositorio | 18,8 GB (17,470 GiB de pesos) |
| Componente de vision | 0,318B parámetros (0,593 GiB) |
| Fecha de publicacion | 2026-11-21 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base thinkingmachines/Inkling-2-Mini: no se especifica si es un transformer denso, un MoE, un modelo híbrido o cualquier otra variante, ni se detalla la composición del dataset de entrenamiento, el número de tokens vistos, ni si hubo fases de RLHF o DPO.

Lo que sí está documentado es el esquema de cuantización aplicado por oQ (oMLX v0.8.2). Se trata de una cuantización de precisión mixta que asigna formatos distintos según el tensor: el 76,327% de los pesos lógicos (20,384B) se almacena en NVFP4 con grupo de 16 a 4,50 bits efectivos; el 15,265% (4,077B) en MXFP8 con grupo de 32 a 8,25 bits; el 5,887% (1,572B) en affine 8-bit con grupo de 64 a 8,50 bits; el 2,387% (0,637B) se mantiene en BF16 a 16 bits; y el 0,133% (0,036B) en FP32 a 32 bits. El checkpoint incluye además un módulo de visión de 0,318B parámetros, lo que confirma que el modelo base es multimodal.

## Capacidades

- Generación de texto: el modelo base es un modelo de lenguaje de 26,388B parámetros, por lo que se le presupone capacidad de generación de texto general.
- Procesamiento de visión: el checkpoint incluye un componente visual de 0,318B parámetros, lo que indica soporte de entrada de imágenes.
- Razonamiento y código: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el tamaño de 17,47 GiB permiten ejecutar el modelo en equipos Mac con memoria unificada de 32 GB o superior, sin necesidad de GPU dedicada.
- Prototipado de aplicaciones multimodales en local: al incluir un módulo de visión, puede emplearse para experimentar con tareas imagen-texto en entornos de desarrollo sobre macOS.
- Evaluación de técnicas de cuantización mixta: el checkpoint sirve como referencia práctica para comparar la calidad de NVFP4, MXFP8 y affine 8-bit frente al modelo base en tareas concretas.
- Despliegue en estaciones de trabajo con memoria limitada: 18,8 GB de repositorio permiten cargar el modelo en máquinas que no podrían alojar la versión BF16 completa.
- Investigación sobre eficiencia de memoria: útil para estudiar el impacto del reparto de bits por componente (lenguaje frente a visión) en el rendimiento final.
- Generación de texto asistida en local: para tareas de redacción, resumen o respuesta a preguntas en entornos sin conexión, siempre que se valide previamente la calidad del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos 18-20 GB para cargar los pesos completos en memoria; se recomienda 32 GB de memoria unificada en Apple Silicon para dejar margen al contexto y a los estados intermedios.
- GPU recomendadas: hardware Apple Silicon (series M1, M2, M3, M4 y posteriores) con memoria unificada suficiente; el formato MLX no está pensado para GPUs NVIDIA o AMD.
- ¿Cabe en GPU de consumo? No aplica en el sentido habitual: requiere Apple Silicon. En Mac con 32 GB o más, sí es viable.
- Opciones de despliegue: MLX (librería nativa) y ecosistema oMLX; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-oQ8e | 26,388B (lenguaje) + 0,318B (visión) | no disponible | safetensors MLX, cuantización mixta 5,619 bits/peso | no disponible | Cuantización de comunidad sobre thinkingmachines/Inkling-2-Mini |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | no disponible | no disponible | Modelo base original, sin cuantizar |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre modelos de la misma categoría para comparar |

## Limitaciones y advertencias

- La cuantización mixta a 5,619 bits/peso puede introducir degradación de calidad respecto al modelo base; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a GPUs NVIDIA/AMD ni a entornos de servidor convencionales.
- La licencia no está disponible, por lo que no puede confirmarse si se permite uso comercial; es imprescindible verificar la licencia del modelo base antes de cualquier uso en producción.
- No se conocen los idiomas soportados, el sesgo del modelo base ni su tasa de alucinación.
- El repositorio tiene 0 descargas y 0 likes, y fue creado recientemente (2026-11-21); no hay evidencia de validación por parte de la comunidad.
- El autor es un usuario individual (g-oQ), no el desarrollador original del modelo; la trazabilidad y el soporte son limitados.
- No se documenta la longitud de contexto, lo que impide planificar aplicaciones que dependan de ventanas largas.

## Enlaces

- Hugging Face: https://huggingface.co/g-oQ/Inkling-2-Mini-oQ8e
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
