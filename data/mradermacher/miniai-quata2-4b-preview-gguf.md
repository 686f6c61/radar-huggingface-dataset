# mradermacher/MiniAI-Quata2-4b-Preview-GGUF

## Resumen
MiniAI-Quata2-4b-Preview es un modelo de lenguaje publicado por el usuario M1n1A1 en Hugging Face, del que esta ficha describe la versión cuantizada en formato GGUF generada por mradermacher. La model card del repositorio original no aporta información sobre arquitectura, datos de entrenamiento, licencia ni idiomas, por lo que la mayor parte de las especificaciones técnicas no están disponibles. El único dato verificable es el recuento de parámetros en los safetensors del modelo base: 333.514.240 parámetros, es decir, aproximadamente 0,33 mil millones, muy por debajo de los 4 mil millones que sugiere el nombre comercial.

Esta discrepancia entre el nombre ("4b") y el recuento real de parámetros es relevante para cualquiera que evalúe el modelo: no se trata de un modelo de 4 mil millones de parámetros, sino de un modelo pequeño, del orden de 300 millones, lo que condiciona completamente sus capacidades, requisitos de hardware y casos de uso realistas. El repositorio GGUF ocupa 1,0 GB e incluye un conjunto amplio de cuantizaciones estáticas (desde Q2_K hasta Q8_0, además de F16 e IQ4_XS), lo que facilita el despliegue en entornos con recursos limitados mediante llama.cpp u Ollama.

La relevancia de esta ficha es principalmente práctica: permite a desarrolladores e investigadores saber qué esperar de un artefacto GGUF concreto antes de descargarlo, y advierte de que la ausencia de model card detallada, licencia declarada y benchmarks publicados limita seriamente su uso en producción sin una evaluación previa propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 333.514.240 (según safetensors del modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); safetensors en el modelo base |

## Arquitectura y entrenamiento
No se ha publicado información sobre la arquitectura del modelo en la documentación disponible. El nombre sugiere una familia "Quata2" en su versión "Preview", pero no se especifica si se trata de un transformer decoder-only, un modelo híbrido o alguna otra variante. Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF, DPO o SFT, ni sobre innovaciones técnicas como atención lineal o decodificación especulativa.

El único dato técnico derivado del proceso de cuantización es que mradermacher ha generado cuantizaciones estáticas (quantize_version 2, output_tensor_quantised 1) a partir del repositorio original M1n1A1/MiniAI-Quata2-4b-Preview, con conversión de tipo "hf". Esto implica que el modelo base estaba en formato Hugging Face y fue convertido a GGUF para su uso con llama.cpp y herramientas compatibles.

## Capacidades
- Generación de texto: capacidad esperable en un modelo de este tamaño, aunque no documentada explícitamente.
- Razonamiento y matemáticas: no disponible; no hay evidencia publicada de rendimiento en tareas de razonamiento.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso
- Experimentación local en hardware muy modesto: con aproximadamente 330 millones de parámetros, el modelo cabe en CPU y en GPUs de gama baja, por lo que sirve para probar pipelines de llama.cpp u Ollama sin requisitos de VRAM elevados.
- Pruebas de integración de GGUF en aplicaciones: útil para validar el flujo de carga de cuantizaciones estáticas (Q4_K_M, Q8_0, etc.) en una aplicación antes de sustituir el modelo por uno mayor.
- Generación de texto de baja latencia en dispositivos edge: el tamaño reducido permite inferencia rápida en Raspberry Pi, portátiles sin GPU dedicada o contenedores con poca memoria.
- Filtrado y clasificación de texto simple: tareas de etiquetado o extracción de entidades en las que un modelo pequeño puede bastar, siempre que se valide su calidad con datos propios.
- Prototipado de chatbots de dominio acotado: para demos internas donde la calidad del texto no es crítica y se prioriza el coste de infraestructura.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece doce variantes de cuantización del mismo modelo, lo que permite medir el impacto de la compresión en perplejidad y latencia sobre un mismo artefacto.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada: con ~333 millones de parámetros, la inferencia en F16 requiere aproximadamente 0,7 GB de pesos; en Q8_0 alrededor de 0,35 GB; en Q4_K_M alrededor de 0,2 GB, a los que hay que sumar el espacio de contexto y el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; también funciona en CPU.
- ¿Cabe en GPU de consumo? Sí, en todas las GPU de consumo modernas (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; también es posible usar el modelo base en safetensors con transformers.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| MiniAI-Quata2-4b-Preview (GGUF) | ~333 M | no disponible | no disponible | GGUF |
| Qwen2.5-0.5B | ~500 M | 32 768 tokens | Apache 2.0 | safetensors, GGUF |
| SmolLM2-360M | ~360 M | 8 192 tokens | Apache 2.0 | safetensors, GGUF |
| Llama 3.2 1B | ~1,2 B | 128 000 tokens | Llama 3.2 Community License | safetensors, GGUF |

La comparativa se ofrece como referencia de categoría (modelos pequeños), no como evaluación de rendimiento: no hay datos públicos que permitan situar a MiniAI-Quata2-4b-Preview frente a estas alternativas, y su licencia no declarada es una desventaja objetiva frente a las licencias abiertas de Qwen2.5-0.5B y SmolLM2-360M.

## Limitaciones y advertencias
- Discrepancia de nomenclatura: el nombre indica "4b" pero el recuento real de safetensors es de ~333 millones de parámetros; conviene verificar el artefacto antes de asumir capacidades de un modelo de 4B.
- Licencia no disponible: sin licencia declarada no se puede garantizar el uso comercial; es imprescindible contactar con el autor o consultar el repositorio original antes de desplegarlo en producción.
- Idiomas no declarados: no hay garantía de soporte de castellano ni de ningún otro idioma concreto.
- Sin benchmarks ni model card detallada: no hay evidencia publicada de calidad, por lo que cualquier uso requiere una evaluación propia con datos representativos.
- Riesgo de alucinación: en modelos de este tamaño el riesgo es alto y no está mitigado por información documentada sobre alineamiento.
- Contexto desconocido: no se puede planificar el uso en conversaciones largas o documentos extensos sin determinar empíricamente la ventana de contexto.
- Sesgos: no documentados; se recomienda auditar las salidas antes de cualquier uso orientado a usuarios finales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay señal de validación por parte de la comunidad.

## Enlaces
- Repositorio GGUF: https://huggingface.co/mradermacher/MiniAI-Quata2-4b-Preview-GGUF
- Modelo base: https://huggingface.co/M1n1A1/MiniAI-Quata2-4b-Preview
