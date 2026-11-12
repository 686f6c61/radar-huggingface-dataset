# bcckfdn/cevher3-test-6

## Resumen

cevher3 es un modelo de lenguaje de 1.256 millones de parametros (aproximadamente 1,26 B) desarrollado por el usuario bcckfdn y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de tipo decoder-only basado en la arquitectura Gemma3 con atencion de ventana deslizante (SWA, sliding window attention), orientado a generacion de texto y conversacion en turco e ingles. El modelo se distribuye en formato safetensors y es compatible con la libreria transformers y con text-generation-inference.

El modelo ha sido entrenado desde cero con aproximadamente 9.767 millones de tokens (9,767 B) y alcanza una perdida de validacion de 2,8047. Su configuracion incluye 34 capas, una dimension oculta de 1792, 28 cabezas de atencion para consultas y 4 para claves/valores (GQA), un vocabulario de 65.536 tokens y una longitud de contexto de 8192 tokens. El repositorio ocupa 2,5 GB y el identificador incluye el sufijo "test-6", lo que sugiere que se trata de una publicacion de prueba o experimental mas que de un modelo final de produccion.

La relevancia de este modelo radica en su caracter de ejemplo de modelo compacto multilingue (turco/ingles) con arquitectura moderna (SWA heredada de Gemma3) y licencia permisiva, lo que lo hace potencialmente util para experimentacion, ajuste fino y despliegue en entornos con recursos limitados. No obstante, la ausencia de benchmarks publicados, de documentacion detallada sobre el dataset de entrenamiento y de traccion en la comunidad (0 descargas, 0 likes en el momento de la consulta) obliga a tratar cualquier evaluacion de rendimiento con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion de ventana deslizante (Gemma3-SWA) |
| Parametros totales | 1.256.312.832 (~1,26 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Capas | 34 |
| Dimension oculta | 1792 |
| Cabezas de atencion (Q/KV) | 28 / 4 (GQA) |
| Vocabulario | 65.536 tokens |
| Tokens de entrenamiento | 9,767 B |
| Perdida de validacion | 2,8047 (mejor) |
| Tamano del repositorio | 2,5 GB |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only con atencion de ventana deslizante (SWA), un diseno popularizado por la familia Gemma 3 que alterna capas de atencion local con ventana deslizante y capas de atencion global para reducir el coste computacional en contextos largos. La configuracion concreta incluye 34 capas, una dimension oculta de 1792 y atencion con consultas agrupadas (GQA) con 28 cabezas de consulta y 4 de clave/valor, lo que reduce el uso de memoria en la cache KV durante la inferencia. El vocabulario es de 65.536 tokens, un tamano habitual en modelos multilingues compactos.

El entrenamiento se realizo sobre aproximadamente 9.767 millones de tokens, segun declara el autor en la model card. No se especifica la composicion del dataset, la mezcla de idiomas (turco/ingles) ni si se aplicaron fases de ajuste supervisado (SFT), RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal. La informacion disponible se limita a los hiperparametros estructurales y a la metrica de perdida de validacion.

## Capacidades

- Generacion de texto autoregresiva en turco e ingles.
- Conversacion multi-turno (el modelo esta etiquetado como "conversational").
- Razonamiento basico y generacion de texto general, limitado por su tamano de ~1,26 B parametros.
- Capacidad multilingue restringida a los dos idiomas declarados (tr, en); no se documenta soporte para otros idiomas.
- Compatibilidad con text-generation-inference y con la API de transformers (AutoModelForCausalLM, AutoTokenizer).
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Modo "thinking", vision o audio: no disponible (modelo exclusivamente de texto).

## Casos de uso

- Prototipado rapido de asistentes conversacionales en turco: el modelo puede gestionar dialogos multi-turno con hasta 8192 tokens de contexto, suficiente para conversaciones largas con historial extenso, y su tamano compacto permite iterar rapidamente en entornos de desarrollo.
- Experimentacion academica con arquitecturas SWA: sirve como banco de pruebas para estudiar el comportamiento de la atencion de ventana deslizante en modelos de ~1 B de parametros, comparando con variantes de atencion completa.
- Ajuste fino (fine-tuning) sobre dominios especificos en turco: al tener 1,26 B de parametros y licencia Apache 2.0, es viable reentrenar o hacer LoRA sobre datasets sectoriales (legal, sanitario, atencion al cliente) en una sola GPU de gama alta.
- Generacion de texto asistida en ingles para tareas de redaccion breve: resumenes, reescritura o completado de parrafos, aprovechando el soporte bilingue declarado.
- Despliegue en entornos con recursos limitados: con pesos safetensors de ~2,5 GB en precision original, puede servirse en GPUs de consumo tras cuantizacion (aunque no se publican variantes oficiales), lo que lo hace apto para demos locales y edge computing.
- Base para investigacion en eficiencia de inferencia: su combinacion de GQA (28/4) y SWA permite medir el ahorro de memoria en cache KV frente a modelos con atencion completa de tamano similar.
- Evaluacion comparativa de modelos pequenos multilingues: util como linea base en estudios que comparen modelos de ~1 B en turco e ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es la perdida de validacion (2,8047), que no es directamente comparable con metricas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2,5-3 GB solo para pesos, mas cache KV; con contexto de 8192 tokens y GQA (4 cabezas KV), la cache adicional es moderada, pero se recomienda al menos 6-8 GB de VRAM para un margen comodo.
- VRAM estimada en cuantizacion de 8 bits: ~1,3-1,5 GB para pesos; en 4 bits: ~0,7-0,9 GB (estimaciones teoricas, no hay variantes oficiales publicadas).
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A100, H100; cualquier GPU con al menos 8 GB de VRAM puede ejecutarlo en FP16.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 6 GB o mas (RTX 2060 en adelante, e incluso iGPUs con suficiente memoria compartida en cuantizacion).
- Opciones de despliegue: transformers (nativo), text-generation-inference (etiqueta endpoints_compatible), y potencialmente llama.cpp/Ollama si se generan conversiones GGUF (no publicadas oficialmente).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Benchmarks publicados |
|---|---|---|---|---|---|
| cevher3 (bcckfdn/cevher3-test-6) | ~1,26 B | 8192 | Apache 2.0 | tr, en | No |
| Gemma 2 2B | ~2,6 B | 8192 | Gemma Terms | Multi (incl. en) | Si |
| Qwen2.5 1.5B | ~1,5 B | 32768 | Apache 2.0 | Multi (incl. en, tr parcial) | Si |
| SmolLM2 1.7B | ~1,7 B | 8192 | Apache 2.0 | Principalmente en | Si |

La comparativa se basa en caracteristicas estructurales; no existen datos de rendimiento de cevher3 que permitan una comparacion cuantitativa con estos modelos. Cabe senalar que cevher3 declara soporte nativo de turco, un idioma con menos representacion en modelos compactos de proposito general.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad o alucinacion; el riesgo de alucinacion es inherente a modelos de este tamano y no ha sido medido.
- El identificador "test-6" y la ausencia de descargas/likes sugieren que se trata de una publicacion experimental; no hay garantia de estabilidad ni de mantenimiento.
- La documentacion del dataset de entrenamiento es practicamente inexistente: se desconoce la composicion, la procedencia de los datos y si se aplicaron filtros de calidad o seguridad.
- El soporte idiomatico se limita a turco e ingles; el rendimiento en castellano no esta documentado ni garantizado.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), la falta de informacion sobre los datos de entrenamiento impide descartar riesgos de contaminacion o de licencias de terceros en el corpus.
- La perdida de validacion de 2,8047 no permite inferir calidad conversacional ni de razonamiento; se recomienda evaluacion propia antes de cualquier uso en produccion.
- No se publican variantes cuantizadas oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue optimizado en hardware modesto sin trabajo adicional de conversion.
- El contexto de 8192 tokens es inferior al de alternativas contemporaneas como Qwen2.5 1.5B (32k), lo que puede ser limitante en tareas de documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bcckfdn/cevher3-test-6
- Repositorio de transformers: https://github.com/huggingface/transformers
- Documentacion de text-generation-inference: https://github.com/huggingface/text-generation-inference
- Documentacion de Gemma 3 (arquitectura de referencia): https://ai.google.dev/gemma/docs/core
- Paper de Gemma 3: no disponible en la informacion proporcionada
- Blog o demo del autor: no disponible en la informacion proporcionada
