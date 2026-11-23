# dima1810/CCORE-Web-Coder-4B-oQ2h

## Resumen

CCORE-Web-Coder-4B-oQ2h es una versión cuantizada del modelo CCORE-Web-Coder-4B, publicada por el usuario dima1810 en Hugging Face. Se trata de un checkpoint en formato MLX (Apple Silicon) generado con la herramienta oQ (oMLX v0.8.2) mediante cuantización de precisión mixta, que combina capas en 3 bits afines con grupos de 64, capas en BF16 y tensores en U32. El resultado es un checkpoint de 1.317 millones de parámetros lógicos almacenados en 2.329 GB.

El modelo subyacente emplea la arquitectura `qwen3_5`, lo que indica una base derivada de la familia Qwen 3.5, y el sufijo "Web-Coder" sugiere un ajuste orientado a generación de código para entornos web. Sin embargo, la model card publicada no incluye información sobre el proceso de entrenamiento, los datos utilizados ni los benchmarks, por lo que gran parte de las especificaciones habituales no están disponibles.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de cuantización para inferencia local en hardware Apple, con cero descargas y cero likes en el momento de la consulta, lo que indica que es una publicación reciente y sin validación comunitaria. Debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según tag de Hugging Face; detalles no disponibles) |
| Parametros totales | 1.316.672.512 (1.317B lógicos) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta oQ: affine 3-bit grupo 64 (48,281% de los pesos), BF16 (25,557%), U32 (26,162%); media efectiva 14,151 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería mlx) |
| Tamano del repo | 2,3 GB (2.329 GB / 2.169 GiB de pesos) |
| Desglose de almacenamiento | Lenguaje: 0,983B pesos / 1,662 GB; Visión: 0,334B pesos / 0,667 GB |

## Arquitectura y entrenamiento

La información disponible solo permite afirmar que el modelo base pertenece a la arquitectura `qwen3_5`, según el tag declarado en el repositorio. No se especifica el número de capas, la dimensión del modelo, el mecanismo de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa. El desglose de pesos revela dos componentes claramente diferenciados: un modelo de lenguaje de 0,983B parámetros lógicos y un módulo de visión de 0,334B parámetros lógicos, lo que confirma que el modelo base es multimodal.

El proceso de cuantización sí está documentado: se aplicó oQ (oMLX v0.8.2), una técnica de precisión mixta que asigna distintos formatos según la sensibilidad de cada tensor. Casi la mitad de los pesos lógicos (48,281%) se almacenan en affine 3-bit con grupo de 64, mientras que un 25,557% se mantiene en BF16 y un 26,162% en U32. Esta distribución explica que la media efectiva sea de 14,151 bits por peso, muy por encima de una cuantización uniforme de 4 bits, lo que sugiere que el autor preservó en alta precisión los componentes considerados críticos (probablemente embeddings, normas y cabezas de salida). No hay información sobre el dataset de entrenamiento, el número de tokens, ni sobre si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y código: el sufijo "Web-Coder" apunta a un ajuste para programación orientada a desarrollo web, aunque no se detalla el alcance exacto.
- Procesamiento de visión: el checkpoint incluye un módulo de visión de 0,334B parámetros, por lo que el modelo base es multimodal imagen-texto.
- Razonamiento y matemáticas: no disponible, no se documenta ninguna capacidad específica.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible, no se declaran idiomas.
- Modo thinking: no disponible.
- Audio: no disponible.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: al estar en formato MLX, el modelo está pensado para ejecutarse mediante el framework MLX de Apple, aprovechando la memoria unificada de los chips M-series. Su tamaño de 2,3 GB permite cargarlo en equipos con 8 GB o 16 GB de RAM unificada.
- Asistencia de código en editor local: si el ajuste "Web-Coder" cumple lo que su nombre sugiere, podría emplearse para autocompletado y generación de fragmentos de código en HTML, CSS y JavaScript dentro de entornos de desarrollo integrados que consuman modelos locales.
- Prototipado de aplicaciones multimodales en local: la presencia del módulo de visión permitiría experimentar con tareas de imagen a texto o de comprensión de capturas de pantalla, útil para maquetas de herramientas de accesibilidad o análisis de interfaces.
- Evaluación de técnicas de cuantización: el checkpoint es un caso de estudio útil para investigadores que quieran medir el impacto de la precisión mixta oQ (3-bit, BF16 y U32 combinados) frente a cuantizaciones uniformes en un modelo multimodal pequeño.
- Pruebas de pipelines MLX: sirve como artefacto de prueba para validar flujos de carga, tokenización e inferencia en MLX antes de invertir en modelos de mayor tamaño.
- Educación y demostraciones: con 1,3B parámetros y 2,3 GB de almacenamiento, es manejable para talleres o clases donde se explique cuantización y despliegue local sin requerir infraestructura de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM unificada estimada: al menos 2,5-3 GB libres para cargar los pesos (2,169 GiB) más el overhead del runtime MLX y la caché KV; se recomienda un mínimo de 8 GB de memoria unificada.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (series M1, M2, M3, M4); no es directamente compatible con CUDA sin conversión.
- Compatibilidad con GPU de consumo: cabe holgadamente en cualquier Mac con 8 GB o más de memoria unificada. En GPUs NVIDIA no es utilizable tal cual, ya que la librería declarada es `mlx`.
- Opciones de despliegue: MLX (librería nativa), `mlx-lm` para el componente de lenguaje y el runtime oMLX referenciado por el autor. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible, no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| CCORE-Web-Coder-4B-oQ2h | 1,317B lógicos | no disponible | safetensors MLX (oQ mixto) | no disponible | Cuantización mixta 14,151 bits/peso; multimodal (lenguaje + visión) |
| Qwen2.5-Coder-1.5B | 1,5B | 32.768 tokens (versión base) | safetensors, GGUF | Apache 2.0 (versión oficial) | Referencia de código pequeño; solo texto |
| Qwen2-VL-2B | 2,2B | 32.768 tokens (versión base) | safetensors | Apache 2.0 (versión oficial) | Multimodal imagen-texto de tamaño comparable |
| SmolVLM-2B | 2,25B | 8.192 tokens (versión base) | safetensors | Apache 2.0 (versión oficial) | Multimodal ligero para hardware de consumo |

La comparación es aproximada: no se dispone de datos de rendimiento del modelo evaluado, y las alternativas se incluyen por similitud de tamaño y categoría, no por equivalencia verificada.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no puede asumirse permiso para uso comercial; es imprescindible contactar con el autor o consultar el modelo base antes de desplegarlo en producción.
- Cero validación comunitaria: el repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo día, lo que indica ausencia de revisión por terceros.
- Model card incompleta: no se documentan datos de entrenamiento, idiomas, contexto, benchmarks ni sesgos conocidos.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño; sin evaluaciones publicadas no puede acotarse su magnitud.
- Cuantización agresiva: un 48,281% de los pesos lógicos en 3 bits puede degradar tareas sensibles a la precisión numérica, como matemáticas o generación de código complejo.
- Dependencia de plataforma: el formato MLX limita su uso a hardware Apple Silicon; no es portable a CUDA sin reconversión.
- Ambigüedad de nomenclatura: el nombre indica "4B" pero el recuento real de safetensors es de 1,317B parámetros lógicos; conviene verificar el modelo base antes de asumir capacidades.
- Sin información sobre restricciones de contexto o idioma: no puede garantizarse un comportamiento correcto fuera del inglés o en conversaciones de contexto largo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dima1810/CCORE-Web-Coder-4B-oQ2h
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Framework MLX de Apple: no disponible en la información proporcionada
- Modelo base CCORE-Web-Coder-4B: no disponible en la información proporcionada
- Paper o documentación técnica: no disponible en la información proporcionada
