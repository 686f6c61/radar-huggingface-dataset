# mradermacher/Gemma4-26B-ASR-E2-BF16-GGUF

## Resumen

Gemma4-26B-ASR-E2-BF16-GGUF es una redistribucion en formato GGUF del modelo taharmasmaliyev07/Gemma4-26B-ASR-E2-BF16, un ajuste fino de la familia Gemma 4 de Google orientado a reconocimiento automatico del habla (ASR, por sus siglas en ingles). El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de versiones GGUF de modelos abiertos, que ofrece aqui una bateria completa de cuantizaciones estaticas (desde Q2_K hasta Q8_0) junto con los suplementos multimodales mmproj en Q8_0 y f16.

El modelo base cuenta con 25.233.142.046 parametros (aproximadamente 25,2 mil millones) y se distribuye bajo licencia Apache 2.0. La nomenclatura "ASR-E2" sugiere un ajuste especifico para tareas de transcripcion de audio, aunque la model card no detalla la composicion del dataset de entrenamiento ni el proceso de ajuste. El repositorio original esta etiquetado como conversational y compatible con endpoints, lo que indica que puede desplegarse en infraestructuras de inferencia estandar.

La relevancia de esta ficha radica en que permite ejecutar un modelo de ~25B especializado en voz en hardware de consumo mediante cuantizacion GGUF, algo impensable hace unos anos. Con la cuantizacion Q4_K_M (16,9 GB) cabe en GPUs de 24 GB como la RTX 4090, y con Q2_K (10,7 GB) incluso en tarjetas de 12-16 GB. Es, por tanto, una opcion practica para prototipado local de pipelines de voz sin depender de APIs cerradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4; detalles especificos no disponibles) |
| Parametros totales | 25.233.142.046 (~25,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mas mmproj Q8_0 y f16 |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de la familia Gemma 4 de Google, una arquitectura transformer decoder-only. La model card del repositorio cuantizado no aporta detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El sufijo "ASR" y el uso de ficheros mmproj (suplementos multimodales) indican que el modelo incorpora un proyector multimodal para procesar audio, presumiblemente entrenado para tareas de transcripcion.

La cuantizacion realizada por mradermacher es de tipo estatico (quantize_version 2, output_tensor_quantised 1, convert_type hf), sin versiones ponderadas por imatrix en el momento de la publicacion. Esto implica que las cuantizaciones de baja precision (Q2_K, Q3_K) pueden degradar mas la calidad que sus equivalentes con imatrix. El repositorio incluye dos ficheros mmproj (Q8_0 de 0,9 GB y f16 de 1,3 GB) necesarios para el procesamiento multimodal.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta "conversational" del repositorio.
- Reconocimiento automatico del habla (transcripcion de audio a texto), a juzgar por el nombre del modelo y la presencia de suplementos mmproj.
- Procesamiento multimodal mediante el proyector mmproj (audio; no se confirma vision).
- Compatibilidad con text-generation-inference y endpoints estandar.
- Capacidades de tool calling y agentes: no disponible.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking: no disponible.

## Casos de uso

- Transcripcion local de reuniones: desplegando el modelo con llama.cpp y el fichero mmproj correspondiente, se puede transcribir audio en local sin enviar datos a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Subtitulado automatizado de contenido audiovisual: el modelo puede procesar fragmentos de audio y generar texto sincronizable, con la ventaja de ejecutarse en una sola GPU de 24 GB usando Q4_K_M.
- Prototipado de asistentes de voz: combinado con un TTS, permite construir pipelines de voz a voz completamente locales para demos y pruebas de concepto.
- Investigacion en ASR: al ser Apache 2.0 y estar disponible en multiples cuantizaciones, facilita experimentos de evaluacion comparativa de calidad frente a otros modelos ASR sin coste de licencia.
- Indexacion y busqueda de archivos de audio: transcripcion por lotes de grabaciones para generar indices de texto searchable, usando Q8_0 si se prioriza calidad o Q4_K_S si se prioriza velocidad.
- Educacion y accesibilidad: generacion de transcripciones para estudiantes con dificultades auditivas en entornos donde no se permite el uso de APIs en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K ~10,7 GB; Q3_K_S ~12,3 GB; IQ4_XS ~14,2 GB; Q4_K_S ~15,6 GB; Q4_K_M ~16,9 GB; Q5_K_M ~19,2 GB; Q6_K ~22,7 GB; Q8_0 ~27,0 GB. Anadir ~1 GB si se usa el mmproj.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40/80 GB o H100 para Q8_0 y f16; RTX 3090 (24 GB) valida para Q4_K_M.
- Cabe en GPU de consumo: si, desde Q2_K en tarjetas de 12-16 GB (RTX 4070 Ti, RTX 4080) y Q4_K_M en 24 GB (RTX 3090/4090).
- Opciones de despliegue: llama.cpp, Ollama (previa importacion del GGUF), text-generation-inference (solo con backend compatible), y cualquier runtime que soporte GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma4-26B-ASR-E2-BF16-GGUF (este) | ~25,2B | no disponible | Apache 2.0 | GGUF | Ajuste ASR sobre Gemma 4 |
| Whisper large-v3 | ~1,55B | 30 s por ventana | MIT | safetensors, GGUF via whisper.cpp | Referencia ASR, mucho menor |
| Qwen2-Audio-7B | ~7B | no disponible | Apache 2.0 | safetensors | Multimodal audio-texto |
| Gemma 2 27B (base) | ~27B | 8K | Gemma license | safetensors, GGUF | Texto general, no ASR |

La comparacion es aproximada: no hay datos publicados de rendimiento ASR para este modelo, por lo que no puede establecerse una jerarquia de calidad frente a Whisper o Qwen2-Audio.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano no esta documentado.
- No hay benchmarks publicados, por lo que la calidad ASR real es desconocida.
- Las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la calidad al no existir versiones imatrix.
- El modelo base es un ajuste fino de terceros (taharmasmaliyev07); su procedencia y calidad de datos no estan verificadas por Google.
- Riesgo de alucinacion en transcripciones con audio ruidoso o acentos no ingleses.
- Aunque la licencia es Apache 2.0, conviene revisar los terminos del modelo Gemma subyacente por si hubiera restricciones adicionales de uso.
- El repositorio ocupa 184,9 GB en total; descargar solo la cuantizacion necesaria.
- No se dispone de informacion sobre tool calling ni comportamiento agentico.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Gemma4-26B-ASR-E2-BF16-GGUF
- Modelo base: https://huggingface.co/taharmasmaliyev07/Gemma4-26B-ASR-E2-BF16
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Gemma4-26B-ASR-E2-BF16-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
