# mradermacher/gemma-4-31B-it-scotoma-GGUF

## Resumen

`mradermacher/gemma-4-31B-it-scotoma-GGUF` es una colección de cuantizaciones estáticas en formato GGUF del modelo `ReadyArt/gemma-4-31B-it-scotoma`, un ajuste fino (fine-tune) de la familia Gemma 4 de Google en su variante instruct de 31B. El repositorio lo publica mradermacher, un conocido cuantizador de la comunidad de Hugging Face, y su función es facilitar la ejecución local del modelo base en hardware con recursos limitados mediante llama.cpp y derivados. El modelo cuenta con 30.697.345.596 parámetros totales según los pesos en safetensors del modelo base.

La relevancia de esta ficha reside en que el repositorio no aporta un modelo nuevo, sino una capa de distribución práctica: convierte un checkpoint de transformers de gran tamaño en ficheros GGUF listos para inferencia en CPU, GPU de consumo y entornos embebidos. Incluye además ficheros `mmproj` (proyección multimodal) en Q8_0 y f16, lo que indica que el modelo base conserva capacidades de visión. La licencia declarada es Apache 2.0, aunque la model card enlaza a la licencia específica de Gemma 4 de Google, un punto que conviene revisar antes de un uso comercial.

El modelo está etiquetado únicamente para inglés (`en`) y su pipeline no está especificado en la información disponible. El repositorio ocupa 213,9 GB en total y acumula 453 descargas y 0 likes en el momento de la consulta, con creación el 23 de agosto de 2026 y última actualización el 10 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Gemma 4; detalles no publicados en la informacion disponible) |
| Parametros totales | 30.697.345.596 (30,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base `ReadyArt/gemma-4-31B-it-scotoma` más allá de su pertenencia a la familia Gemma 4 en variante instruct. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado en el fine-tune. Tampoco se documenta ninguna innovación técnica concreta (atención lineal, decodificación especulativa, mezcla de expertos) en los materiales proporcionados.

Lo que sí es verificable es el proceso de cuantización aplicado por mradermacher: cuantizaciones estáticas con `quantize_version: 2` y `output_tensor_quantised: 1`, conversión desde formato Hugging Face (`convert_type: hf`) y preservación del componente multimodal mediante ficheros `mmproj` separados. El autor indica que existen cuantizaciones ponderadas con imatrix en un repositorio paralelo (`gemma-4-31B-it-scotoma-i1-GGUF`), que suelen ofrecer mejor calidad por bit que las estáticas equivalentes.

## Capacidades

- Generación de texto conversacional en inglés, al estar basado en una variante instruct.
- Capacidades multimodales: la presencia de ficheros `mmproj` (Q8_0 y f16) indica soporte de entrada de imágenes en el modelo base.
- Razonamiento y respuesta a instrucciones, heredados del ajuste instruct de Gemma 4.
- Ejecución local mediante llama.cpp y compatible con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: la cuantización Q4_K_M (18,8 GB) permite ejecutar un modelo de 30,7B en GPUs con 24 GB de VRAM, como la RTX 4090, usando llama.cpp u Ollama.
- Inferencia en CPU con requisitos moderados: la cuantización Q2_K (12,0 GB) hace viable la ejecución en servidores sin GPU dedicada, a costa de una pérdida de calidad notable.
- Procesamiento de documentos con imágenes: los ficheros `mmproj` permiten alimentar el modelo con capturas, diagramas o páginas escaneadas en pipelines de extracción de información.
- Prototipado rápido de asistentes conversacionales en inglés: el formato GGUF se integra directamente en llama.cpp, Ollama y servidores compatibles con la API de OpenAI, lo que reduce el tiempo de puesta en marcha.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece once niveles de cuantización, lo que permite medir el compromiso entre tamaño, velocidad y perplejidad en un mismo modelo.
- Fine-tunes especializados sobre Gemma 4: al tratarse de una cuantización de un ajuste fino concreto (`scotoma`), sirve para validar el comportamiento de esa variante antes de invertir en el checkpoint completo en safetensors.
- Integración en entornos con memoria unificada: equipos Apple Silicon con 32 GB o más pueden ejecutar Q4_K_M o Q5_K_S mediante llama.cpp con aceleración Metal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~12,0 GB; Q3_K_S ~13,9 GB; Q3_K_M ~15,4 GB; Q3_K_L ~16,7 GB; IQ4_XS ~17,0 GB; Q4_K_S ~17,9 GB; Q4_K_M ~18,8 GB; Q5_K_S ~21,4 GB; Q5_K_M ~21,9 GB; Q6_K ~25,3 GB; Q8_0 ~32,7 GB. Añadir ~0,9 GB (mmproj Q8_0) o ~1,3 GB (mmproj f16) si se usa la entrada multimodal.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M o Q5_K_S; A100 40 GB o H100 para Q6_K y Q8_0; A100 80 GB para FP16 si se usa el checkpoint original.
- GPU de consumo: sí cabe en RTX 3090/4090 (24 GB) con Q4_K_M; en GPUs de 16 GB solo entran Q2_K o Q3_K_S, con calidad reducida.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con la API de OpenAI (etiqueta `endpoints_compatible`), y vLLM o TGI únicamente con el checkpoint en safetensors del modelo base, no con los GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-4-31B-it-scotoma (este repo, GGUF) | 30,7B | no disponible | apache-2.0 | GGUF | Cuantizaciones estáticas de 12,0 a 32,7 GB |
| gemma-4-31B-it-scotoma-i1-GGUF (mismo autor) | 30,7B | no disponible | apache-2.0 | GGUF | Cuantizaciones con imatrix, mayor calidad por bit |
| ReadyArt/gemma-4-31B-it-scotoma (modelo base) | 30,7B | no disponible | apache-2.0 | safetensors | Checkpoint original en transformers, requiere más VRAM |
| Gemma 4 31B IT (modelo oficial de Google) | ~31B | no disponible | licencia Gemma 4 | safetensors | Referencia de la familia; comparación de rendimiento no disponible |

## Limitaciones y advertencias

- El repositorio solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad de forma apreciable; el autor marca Q3_K_M explícitamente como "lower quality".
- Riesgo de alucinación inherente a los modelos de lenguaje de 30B; no se han publicado evaluaciones de fidelidad para este fine-tune concreto.
- Sesgos conocidos: no documentados en la información disponible; deben asumirse los del modelo base Gemma 4 y los del dataset de ajuste `scotoma`.
- Licencia: aunque la etiqueta indica Apache 2.0, la model card enlaza a la licencia específica de Gemma 4 de Google, que puede imponer restricciones adicionales al uso comercial. Verificar antes de desplegar en producción.
- El modelo base es un fine-tune de la comunidad (`ReadyArt`), no un modelo oficial de Google; su calidad y mantenimiento dependen del autor original.
- El repositorio completo ocupa 213,9 GB; conviene descargar solo la cuantización necesaria.
- No se especifica la longitud de contexto, lo que impide planificar cargas de trabajo con ventanas largas sin verificar el modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma-4-31B-it-scotoma-GGUF
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma-4-31B-it-scotoma-i1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/gemma-4-31B-it-scotoma
- Página de resumen del autor: https://hf.tst.eu/model#gemma-4-31B-it-scotoma-GGUF
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
