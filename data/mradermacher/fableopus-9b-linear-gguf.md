# mradermacher/FableOpus-9B-Linear-GGUF

## Resumen

FableOpus-9B-Linear es un modelo de lenguaje de aproximadamente 8.950 millones de parametros (8.953.803.264 segun los pesos en safetensors) desarrollado por bingleai y distribuido en formato GGUF por mradermacher. Segun las etiquetas de su model card, se trata de un merge destilado que combina linajes de Qwen (etiquetas `qwen` y `qwen3.5`) con tecnicas de destilacion orientadas a reproducir el comportamiento de Claude Opus (etiquetas `claude-opus` y `fable-5`). El modelo base es `bingleai/FableOpus-9B-Linear`, del que esta publicacion es una conversion a cuantizaciones estaticas.

La relevancia de esta ficha reside en que el repositorio original solo ofrece pesos en precision completa (bf16), lo que lo hace impractical para equipos de consumo; mradermacher publica un abanico amplio de cuantizaciones GGUF (desde Q2_K de 3,9 GB hasta f16 de 18 GB) que permiten ejecutar el modelo en hardware modesto mediante llama.cpp u Ollama. Ademas, el repositorio incluye ficheros `mmproj` (Q8_0 y f16), lo que indica soporte multimodal de vision en el linaje del modelo base.

La informacion disponible es limitada: no se documentan en la model card el numero de tokens de entrenamiento, la composicion del dataset, la longitud de contexto ni resultados de benchmarks. La licencia es Apache 2.0, lo que facilita su uso comercial, y el modelo esta etiquetado exclusivamente para ingles (`en`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (linaje Qwen 3.5, segun etiquetas; detalles no disponibles) |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en bf16/safetensors |
| Modelo base | bingleai/FableOpus-9B-Linear |
| Tamano del repo | 83,0 GB |
| Descargas | 299 |
| Likes | 0 |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de las etiquetas: `qwen`, `qwen3.5`, `fable-5`, `claude-opus`, `distillation` y `merge`. Esto sugiere que FableOpus-9B-Linear es el resultado de un merge de modelos de la familia Qwen 3.5, con tecnicas de destilacion para aproximar el estilo de respuesta de Claude Opus. El sufijo "Linear" en el nombre podria referirse a una variante con capas lineales o atencion lineal, pero no se confirma en la informacion disponible.

No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal mas alla de lo que sugiere el nombre. La presencia de ficheros `mmproj` indica que el modelo base incorpora un proyector multimodal para vision, aunque las capacidades exactas no se detallan.

## Capacidades

- Generacion de texto conversacional en ingles (pipeline etiquetado como `conversational`).
- Razonamiento y respuesta a instrucciones, segun el linaje de destilacion de Claude Opus.
- Soporte multimodal de vision: el repositorio incluye ficheros `mmproj` (Q8_0 y f16) que actuan como suplemento multimodal.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas), lo que facilita su despliegue en infraestructuras tipo TGI o vLLM.
- Capacidades de codigo y matematicas: no confirmadas explicitamente en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`.

## Casos de uso

- Asistente conversacional en ingles para atencion al cliente: el modelo puede gestionar dialogos multi-turno; la longitud de contexto no esta documentada, por lo que conviene validar el limite real antes de desplegarlo en produccion.
- Prototipado local en equipos de consumo: con cuantizaciones Q4_K_M (5,7 GB) o Q5_K_M (6,6 GB) puede ejecutarse en GPUs con 8-12 GB de VRAM mediante llama.cpp u Ollama, ideal para pruebas de concepto sin coste de API.
- Experimentacion con destilacion de estilo: util para investigadores que quieran estudiar como un merge destilado de Qwen 3.5 aproxima el comportamiento de Claude Opus en tareas de generacion.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite uso comercial, a diferencia de modelos con licencias restrictivas.
- Aplicaciones multimodales ligeras: cargando el `mmproj` correspondiente, puede emplearse para tareas de descripcion de imagenes o VQA en ingles, aunque las capacidades exactas no estan documentadas.
- Fine-tuning sobre el modelo base: al estar disponible el modelo original en bf16, se puede ajustar y luego cuantizar a GGUF para despliegue en produccion.
- Evaluacion comparativa de cuantizaciones: el amplio abanico de quants (de Q2_K a f16) permite medir el impacto de la cuantizacion en calidad y latencia para un modelo de 9B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead aproximado):
  - Q2_K (3,9 GB): ~5 GB de VRAM.
  - Q4_K_M (5,7 GB): ~7-8 GB de VRAM.
  - Q5_K_M (6,6 GB): ~8-9 GB de VRAM.
  - Q6_K (7,5 GB): ~9-10 GB de VRAM.
  - Q8_0 (9,6 GB): ~11-12 GB de VRAM.
  - f16 (18,0 GB): ~20 GB de VRAM.
  - Vision: anadir ~0,7 GB (mmproj Q8_0) o ~1,0 GB (mmproj f16).
- GPU recomendadas:
  - Consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB, RTX 4090 24 GB (permite Q8_0 o f16).
  - Profesional: A100 40/80 GB, H100 80 GB (sobredimensionadas para un 9B; utiles para servir muchas instancias o contexto largo).
- Cabe en GPU consumer: si, con cuantizaciones Q2_K a Q8_0 en GPUs de 8-16 GB; f16 requiere 24 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el modelo base en bf16 puede servirse con vLLM o TGI (etiqueta `endpoints_compatible`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| FableOpus-9B-Linear (este) | 8,95 B | no disponible | Apache 2.0 | GGUF (multiples quants) | Merge destilado Qwen 3.5 + Claude Opus; solo ingles; vision via mmproj |
| Qwen 3.5 9B (familia) | ~9 B | no disponible | no disponible | safetensors/GGUF | Linaje base del que deriva este merge; capacidades originales no confirmadas |
| Llama 3.1 8B Instruct | 8,03 B | 128 K | Llama 3.1 Community | safetensors/GGUF | Alternativa consolidada en ingles, con contexto documentado y amplio ecosistema |
| Mistral 7B Instruct | 7,24 B | 32 K | Apache 2.0 | safetensors/GGUF | Alternativa Apache 2.0 con contexto documentado; sin vision en la version base |

La comparativa se limita a datos publicos de cada familia; no se dispone de benchmarks del modelo evaluado para contrastar rendimiento real.

## Limitaciones y advertencias

- Solo soporta ingles segun la etiqueta de idioma; no apto para produccion en castellano u otros idiomas sin validacion previa.
- No se documentan sesgos conocidos, pero al derivar de un merge destilado de modelos propietarios, puede heredar sesgos de los linajes originales.
- Riesgo de alucinacion inherente a modelos de 9B; no hay evaluaciones publicadas que lo cuantifiquen.
- Longitud de contexto no documentada: verificar empiricamente antes de disenar aplicaciones con contexto largo.
- La model card del repositorio GGUF es una plantilla generica de mradermacher; no hay documentacion tecnica del autor original en esta pagina.
- Las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso serio.
- Aunque la licencia es Apache 2.0, el modelo base deriva de linajes con posibles restricciones (Qwen, Claude Opus); conviene revisar la licencia del modelo base original antes de uso comercial.
- No hay garantias de soporte: 0 likes y 299 descargas indican un modelo de nicho con poca validacion comunitaria.
- Los ficheros `mmproj` habilitan vision, pero no se documentan las capacidades exactas ni la calidad del modulo multimodal.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/FableOpus-9B-Linear-GGUF
- Modelo base: https://huggingface.co/bingleai/FableOpus-9B-Linear
- Pagina de descargas del autor: https://hf.tst.eu/model#FableOpus-9B-Linear-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
