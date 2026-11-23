# mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-dequantized-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF estáticas del modelo `symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-dequantized`, un fine-tune sin censura (uncensored) derivado de la familia Qwen3 en su variante 35B-A3B. El autor de las cuantizaciones es mradermacher, un perfil conocido en Hugging Face por publicar versiones GGUF de modelos populares para su uso con llama.cpp y herramientas compatibles. El modelo original procede de un proceso de "dequantización" (reconstrucción de pesos a mayor precisión a partir de una versión previamente cuantizada) y posterior fine-tune orientado a conversación.

El interés práctico del repositorio reside en que ofrece el modelo en múltiples niveles de cuantización (desde Q2_K de 13,3 GB hasta Q8_0 de 37,9 GB), lo que permite desplegarlo en hardware muy diverso, desde GPUs de consumo con 16-24 GB de VRAM hasta estaciones de trabajo con 48 GB o más. Incluye además ficheros mmproj (Q8_0 y f16) que indican soporte multimodal, presumiblemente visión, en el modelo base.

La información disponible es limitada: la model card del repositorio es la plantilla estándar de mradermacher y no detalla arquitectura, datos de entrenamiento, benchmarks ni licencia. El modelo declara únicamente el idioma inglés y no especifica pipeline. Cualquier dato no confirmado se marca como "no disponible" en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer tipo Qwen3, no confirmado) |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | no disponible (el nombre "A3B" sugiere ~3 B activos, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura en la documentación proporcionada. El nombre del modelo (`Qwen3.6-35B-A3B`) sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 35,5 mil millones de parámetros totales y alrededor de 3 mil millones activos por token, aunque este extremo no está confirmado en la model card. El prefijo "Qwen3.6" apunta a un derivado de la familia Qwen3, pero la versión exacta y sus características técnicas no se documentan.

El proceso de creación es en cadena: un modelo Qwen3 base habría sido cuantizado, luego "dequantizado" (reconstruido a mayor precisión) por el usuario symrex, y posteriormente sometido a un fine-tune sin censura con la denominación "Genesis-Hermes-V10". No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o similares. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La presencia de ficheros mmproj en las cuantizaciones indica que el modelo base incorpora capacidades multimodales, probablemente visión, pero no se detalla su arquitectura de proyección.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno.
- Fine-tune "uncensored": el modelo está ajustado para reducir rechazos y filtros de contenido, lo que amplía el rango de respuestas pero incrementa el riesgo de contenido inapropiado.
- Soporte multimodal probable (ficheros mmproj incluidos), presumiblemente entrada de imágenes, aunque no se detalla en la documentación.
- Razonamiento y generación de código: capacidad esperable por herencia de la familia Qwen3, no verificada en la información disponible.
- Tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo "thinking" o razonamiento extendido: no disponible en la documentación.

## Casos de uso

- Asistente conversacional autoalojado en inglés: el modelo puede desplegarse con llama.cpp u Ollama usando la cuantización Q4_K_M (21,8 GB) para mantener conversaciones multi-turno en entornos donde no se desea depender de APIs externas.
- Experimentación con modelos sin censura: investigadores que estudian el comportamiento de modelos con filtros reducidos pueden usar las distintas cuantizaciones para comparar respuestas y evaluar sesgos y riesgos.
- Prototipado de aplicaciones multimodales: los ficheros mmproj permiten cargar el modelo con soporte de imagen en llama.cpp, útil para probar pipelines de visión-lenguaje antes de invertir en infraestructura mayor.
- Generación de texto creativo y roleplay: el fine-tune orientado a conversación y sin censura es adecuado para narrativa, guiones y personajes, con la advertencia de revisión humana del contenido.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 11 niveles de cuantización, lo que permite medir el impacto de la compresión en la calidad de las respuestas sobre el mismo modelo base.
- Despliegue en estaciones de trabajo con GPU única: la versión Q4_K_S (20,5 GB) cabe en GPUs de 24 GB como la RTX 4090, permitiendo inferencia local con throughput razonable para uso individual.
- Fine-tuning posterior o destilación: aunque el formato GGUF no es ideal para entrenamiento, el modelo base en transformers puede servir como punto de partida para ajustes adicionales en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (el tamaño del fichero es una aproximación del peso en memoria, más overhead de contexto y KV cache):
  - Q2_K: ~13,3 GB
  - Q3_K_S: ~15,6 GB
  - Q3_K_M: ~17,3 GB
  - Q3_K_L: ~18,7 GB
  - IQ4_XS: ~19,5 GB
  - Q4_K_S: ~20,5 GB
  - Q4_K_M: ~21,8 GB
  - Q5_K_S: ~24,7 GB
  - Q5_K_M: ~25,4 GB
  - Q6_K: ~29,3 GB
  - Q8_0: ~37,9 GB
  - mmproj (visión): 0,7 GB (Q8_0) o 1,0 GB (f16)
- GPU recomendadas:
  - RTX 4090 (24 GB): Q4_K_S, Q4_K_M e IQ4_XS con contexto moderado; Q3_K_M y Q3_K_L con margen.
  - RTX 3090 (24 GB): mismas opciones que la 4090.
  - A100 40 GB / A100 80 GB: Q6_K y Q8_0 con contexto amplio.
  - H100 80 GB: Q8_0 con contexto largo y margen para batch.
- ¿Cabe en GPU de consumo? Sí: las cuantizaciones Q2_K a Q4_K_M caben en GPUs de 16-24 GB (RTX 4060 Ti 16 GB, RTX 4080, RTX 4090). Las versiones Q5 y superiores requieren 24 GB o más, o bien offloading parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. Para el modelo base en transformers, vLLM o TGI, aunque no se documenta compatibilidad explícita.
- Latencia y throughput: no disponibles. Al tratarse presumiblemente de un MoE con ~3 B activos, el throughput podría ser superior al de un modelo denso de 35 B, pero este dato no está confirmado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10 (este) | 35,5 B totales (activos no confirmados) | no disponible | no disponible | GGUF | Fine-tune sin censura, multimodal probable, solo inglés |
| Qwen3-30B-A3B (referencia de familia) | ~30 B totales, ~3 B activos | no disponible en esta ficha | no disponible | safetensors, GGUF | Modelo base de la familia; capacidades y benchmarks no verificados aquí |
| Modelos densos de ~30-35 B (p. ej. variantes de Llama o Qwen de tamaño similar) | ~30-35 B | variable | variable | safetensors, GGUF | Mayor coste de inferencia por token al no ser MoE; datos concretos no disponibles |

No se dispone de información suficiente para una comparativa cuantitativa fiable con alternativas concretas. Los datos de rendimiento, contexto y licencia de los modelos comparables no están incluidos en la documentación proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo base `symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-dequantized` y de la familia Qwen3 original antes de cualquier despliegue en producción.
- Modelo "uncensored": el ajuste reduce los filtros de seguridad, lo que aumenta el riesgo de generar contenido ofensivo, ilegal o dañino. Requiere moderación externa en aplicaciones públicas.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad; al ser un fine-tune conversacional sin benchmarks, la fiabilidad factual es desconocida.
- Idioma: solo se declara inglés; el rendimiento en castellano no está garantizado.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar aplicaciones con ventanas largas.
- Cadena de cuantización y dequantización: el modelo ha pasado por cuantización, dequantización y nuevo fine-tune, lo que puede introducir degradación acumulada respecto al modelo original.
- Sin benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad que permitan comparar su calidad.
- Soporte multimodal incierto: la presencia de mmproj sugiere visión, pero no se documenta su funcionamiento ni su calidad.
- Repositorio de 244,4 GB: descargar el conjunto completo de cuantizaciones requiere mucho espacio; conviene descargar solo el fichero necesario.
- Fecha de creación futura (2026): los metadatos indican fechas posteriores a la actualidad conocida; conviene tratar la información con cautela y verificar la vigencia del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-dequantized-GGUF
- Modelo base: https://huggingface.co/symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-dequantized
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-dequantized-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-dequantized-GGUF
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
