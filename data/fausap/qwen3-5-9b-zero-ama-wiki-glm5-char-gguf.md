# fausap/Qwen3.5-9B-Zero-AMA-Wiki-GLM5-Char-GGUF

## Resumen

Qwen3.5-9B-Zero-AMA-Wiki-GLM5-Char-GGUF es una conversión a formato GGUF de un modelo derivado de la familia Qwen3.5, publicada por el usuario fausap en Hugging Face. El nombre compuesto del repositorio sugiere una combinación de ajustes sobre una base Qwen3.5 de aproximadamente 9.000 millones de parámetros, con posible destilación o mezcla de datos de otros modelos (referencias a "GLM5" y "Char" en el identificador), aunque el autor no documenta el proceso de entrenamiento ni la procedencia exacta de los pesos originales.

El modelo se distribuye exclusivamente en cuantizaciones GGUF para su uso con llama.cpp, incluyendo una versión BF16 del proyector multimodal (`mmproj`), lo que indica que la base es un modelo de visión-lenguaje. El tamaño total del repositorio es de 6,6 GB y el recuento de parámetros en safetensors es de 8.953.803.264, es decir, 8,95 mil millones.

La relevancia de esta ficha es limitada: se trata de una publicación sin descargas ni interacciones, sin model card técnica, sin licencia declarada y sin resultados de evaluación. Resulta útil únicamente como artefacto de inferencia local para quien quiera probar la variante concreta, no como modelo de referencia para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer denso con proyector multimodal, segun tags `vision-language-model`) |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | no aplica (no hay indicios de MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (proyector `mmproj`), Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); el autor indica conversion mediante Unsloth |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El identificador del repositorio sugiere una base Qwen3.5 de ~9 B con ajustes adicionales ("Zero-AMA-Wiki", "GLM5-Char"), pero el autor no publica detalles del pipeline de entrenamiento ni de los datos utilizados.

El unico dato tecnico verificable es la presencia de un fichero `Qwen3.5-9B-Zero-AMA-Wiki.BF16-mmproj.gguf`, que corresponde al proyector de un modelo multimodal y debe cargarse junto con el modelo de lenguaje para habilitar la entrada de imagenes mediante `llama-mtmd-cli`. La conversion a GGUF se realizo con las herramientas de Unsloth.

## Capacidades

- Generacion de texto conversacional, segun el tag `conversational` del repositorio.
- Procesamiento de imagenes: la presencia del fichero `mmproj` y el tag `vision-language-model` indican soporte de entrada multimodal, aunque no se detallan las tareas concretas (VQA, OCR, descripcion de imagenes).
- Compatibilidad con llama.cpp y llama-cpp, incluyendo el flag `--jinja` para plantillas de chat.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que permite su despliegue en infraestructuras compatibles con la API de llama.cpp.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Inferencia local en estaciones de trabajo: el modelo en Q4_K_M ocupa del orden de 5-6 GB, por lo que puede ejecutarse en GPUs de consumo con 8 GB o mas de VRAM usando llama.cpp, sin necesidad de servicios en la nube.
- Pruebas de pipelines multimodales: cargando el `mmproj` con `llama-mtmd-cli` se puede evaluar el comportamiento del modelo ante imagenes en un entorno controlado antes de integrarlo en una aplicacion mayor.
- Prototipado de asistentes conversacionales: el tag `conversational` y el soporte de plantillas Jinja permiten montar un chat basico sobre llama.cpp o servidores compatibles con su API.
- Evaluacion comparativa de variantes Qwen3.5: util para investigadores que quieran contrastar esta mezcla concreta frente a otras variantes de la misma familia en tareas de texto e imagen.
- Despliegue en entornos sin conectividad: al ser un artefacto GGUF autocontenido, puede distribuirse en maquinas aisladas para tareas de generacion de texto o analisis de imagenes.
- Experimentacion con cuantizacion Q4_K_M: sirve para medir la degradacion de calidad frente a BF16 en un modelo de ~9 B, aunque sin benchmarks publicados la comparacion debe hacerse de forma empirica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: Q4_K_M de un modelo de ~9 B requiere aproximadamente 5-6 GB; el fichero BF16 del proyector anade un consumo adicional moderado (del orden de 1-2 GB, no confirmado).
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100 para mayor throughput; cualquier GPU con al menos 8 GB de VRAM deberia poder cargar la cuantizacion Q4_K_M.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM para Q4_K_M; la version BF16 completa no cabria en GPUs de consumo.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), llama-cpp-python y servidores compatibles con la API de llama.cpp; no se mencionan integraciones con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| fausap/Qwen3.5-9B-Zero-AMA-Wiki-GLM5-Char-GGUF | 8,95 B | no disponible | no disponible | GGUF | Variante no documentada, sin benchmarks |
| Qwen3.5-9B (base oficial) | ~9 B | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF | Modelo de referencia de la familia; datos oficiales no consultados |
| Otros modelos densos de ~8-9 B | ~8-9 B | variable | variable | variable | Categoria generica; no se dispone de comparacion cuantitativa |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa fiable con alternativas concretas.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no se documentan datos de entrenamiento, alineacion ni evaluacion, lo que impide valorar sesgos o calidad.
- Licencia no declarada: no hay garantia de uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Riesgo elevado de alucinacion y de comportamiento impredecible al tratarse de una mezcla no documentada de pesos.
- Idiomas soportados desconocidos: no se puede asumir un buen rendimiento en castellano sin pruebas empiricas.
- Longitud de contexto desconocida: no se debe asumir la ventana nativa de Qwen3.5 sin verificacion.
- Repositorio sin descargas ni likes y creado en 2026: no hay evidencia de uso en comunidad ni de mantenimiento.
- La cuantizacion Q4_K_M introduce perdida de calidad respecto a BF16, especialmente en tareas de razonamiento y matematicas.
- El soporte multimodal depende de cargar correctamente el fichero `mmproj` con `llama-mtmd-cli`; un uso incorrecto con `llama-cli` deshabilitara la vision.

## Enlaces

- Hugging Face: https://huggingface.co/fausap/Qwen3.5-9B-Zero-AMA-Wiki-GLM5-Char-GGUF
- Unsloth (herramienta de conversion): https://github.com/unslothai/unsloth
- llama.cpp (runtime de inferencia): no enlazado en la informacion proporcionada
- Paper, blog o demo oficial: no disponible
