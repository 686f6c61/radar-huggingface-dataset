# leleroyn/OvisOCR3-AWQ-W4A16

## Resumen

OvisOCR3-AWQ-W4A16 es una cuantizacion AWQ de 4 bits (W4A16) del modelo vision-lenguaje ATH-MaaS/OvisOCR3, un sistema especializado en OCR y procesamiento de documentos. El autor de esta version cuantizada es el usuario de HuggingFace leleroyn, mientras que el modelo original pertenece a ATH-MaaS. El objetivo es reducir el peso del checkpoint de 1,59 GiB en BF16 a 942,5 MiB manteniendo la torre visual y la cabeza de lenguaje (`lm_head`) en BF16, de modo que el modelo pueda desplegarse en entornos con recursos limitados sin renunciar a la precision del reconocimiento de texto en imagenes.

La arquitectura subyacente es `Qwen3_5ForConditionalGeneration`, con 24 capas organizadas de forma hibrida: 18 capas Gated DeltaNet (atencion lineal de tipo Mamba) y 6 capas de atencion completa. Se trata, por tanto, de un modelo compacto (el autor lo describe como de 0,8B) orientado a la transcripcion de documentos densos, tablas y texto estructurado. La cuantizacion se ha generado con `llmcompressor==0.15.0` y se ha validado con vLLM 0.32.0, con latencias de aproximadamente 0,26 s por pagina en modo individual.

Su relevancia actual radica en que demuestra un flujo de cuantizacion AWQ funcional sobre arquitecturas hibridas con capas Gated DeltaNet, un caso poco habitual en el ecosistema de compresion de modelos, y en que ofrece un OCR de documentos con requisitos de memoria muy bajos, apto para despliegues en GPU de gama media o incluso en entornos con cuantizacion de cache KV en fp8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (hibrida: 18 capas Gated DeltaNet + 6 capas de atencion completa) |
| Parametros totales | no disponible (el autor lo describe como modelo de 0,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa `--max-model-len 15000`) |
| Tipos de cuantizacion | AWQ W4A16, int4 simetrico, `group_size=128`, pesos `pack-quantized` de compressed-tensors; torre visual y `lm_head` en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (150 pesos empaquetados + 150 escalas; 87 capas ignoradas) |

## Arquitectura y entrenamiento

El modelo base ATH-MaaS/OvisOCR3 emplea la arquitectura `Qwen3_5ForConditionalGeneration`, un transformer hibrido en el que 18 de las 24 capas usan Gated DeltaNet (atencion lineal con estado recurrente, en la linea de las arquitecturas Mamba) y las 6 restantes usan atencion completa. Esta mezcla reduce el coste computacional del decodificado y el tamano de la cache KV, algo especialmente relevante en tareas de OCR donde las secuencias de entrada son largas (imagenes de documentos con mucho texto). El modelo incluye una torre visual con 50 capas lineales que se mantiene en BF16 tras la cuantizacion.

La cuantizacion se realizo con `llmcompressor==0.15.0` sobre los pesos BF16 originales. Se excluyeron de la cuantizacion las 50 capas lineales de la torre visual, el `lm_head` y las proyecciones `in_proj_a` e `in_proj_b` de las capas GDN. La calibracion uso 128 imagenes sinteticas de documentos con texto denso y tablas, rotando los prompts oficiales de OCR con el modo thinking desactivado. La herramienta detecto automaticamente el layout hibrido de 6 capas de atencion completa y 18 de atencion lineal, aplicando la receta secuencialmente sobre `Qwen3_5DecoderLayer`. El repositorio incluye el `recipe.yaml` exacto empleado. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens ni si hubo RLHF o DPO.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes de documentos, con enfasis en texto denso y tablas.
- Procesamiento de documentos (document AI): transcripcion de paginas completas y estructuras tabulares.
- Generacion de texto condicionada por imagen (pipeline `image-text-to-text`).
- Soporte de prompts oficiales de OCR incluidos en el repositorio, con modo thinking desactivable.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision mas alla del OCR: la torre visual esta presente, pero no se documentan otras tareas (VQA, captioning, etc.).

## Casos de uso

- Digitalizacion masiva de archivos administrativos: el modelo transcribe paginas escaneadas en aproximadamente 0,26 s por pagina con vLLM, lo que permite procesar lotes grandes de documentos en pipelines de ingestion documental.
- Extraccion de tablas de informes financieros: la calibracion de la cuantizacion incluyo explicitamente imagenes de tablas, por lo que el modelo conserva la capacidad de reconstruir estructuras tabulares en texto plano.
- Servicio de OCR en produccion con GPU modesta: al ocupar 942,5 MiB en disco y requerir solo un 10 % de utilizacion de memoria GPU en el ejemplo del autor, cabe en tarjetas de gama media y permite atender peticiones concurrentes (3 vias simultaneas en ~0,38 s).
- Procesamiento de facturas y albaranes en back-office: la ventana de contexto de hasta 15 000 tokens configurada en el ejemplo admite documentos largos con multiples secciones sin truncar.
- Indexacion de PDFs para busqueda semantica: el texto extraido por OCR puede alimentar un pipeline RAG; la baja latencia por pagina facilita el reprocesamiento incremental de corpus.
- Despliegue en el borde o en entornos con VRAM limitada: la cuantizacion W4A16 con cache KV en fp8 reduce el footprint lo suficiente para escenarios de inferencia local en estaciones de trabajo con una sola GPU.
- Validacion de calidad documental: el modelo puede comparar la transcripcion de un documento con su version nativa para detectar discrepancias en flujos de control de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento aportados por el autor son de inferencia con vLLM 0.32.0 sobre el checkpoint cuantizado: aproximadamente 0,26 s por pagina OCR individual (499 tok/s) y 0,38 s con 3 peticiones concurrentes usando CUDA graphs. El autor advierte que `--enforce-eager` reduce la velocidad de decodificado unas 6 veces en este modelo de 0,8B.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el ejemplo del autor usa `--gpu-memory-utilization 0.10` y `--kv-cache-memory 344547440` (unos 344 MB para cache KV), lo que sugiere un consumo total muy bajo, compatible con GPUs de 8-16 GB.
- GPU recomendadas: no disponibles en la informacion proporcionada; por el tamano del checkpoint (942,5 MiB) y la configuracion de vLLM, es viable en GPUs consumer de gama media y en aceleradores de datacenter (A100, H100) para despliegues de alta concurrencia.
- Cabe en GPU consumer: si, segun el footprint descrito; no se especifican modelos concretos.
- Opciones de despliegue: vLLM 0.32.0 verificado por el autor (compressed-tensors se detecta automaticamente; no pasar `--quantization awq`). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~0,26 s por pagina individual (499 tok/s) y ~0,38 s con 3 peticiones concurrentes con CUDA graphs.
- Nota de despliegue: por las capas hibridas Mamba/GDN, vLLM eleva el tamano de bloque KV a 1072 tokens, por lo que prompts mas cortos (tipicos en OCR) no aprovechan la cache de prefijos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OvisOCR3-AWQ-W4A16 (este) | ~0,8B (no confirmado) | no disponible (ejemplo con 15 000) | AWQ W4A16, 942,5 MiB | apache-2.0 | HuggingFace, verificado en vLLM 0.32.0 |
| ATH-MaaS/OvisOCR3 (base) | ~0,8B (no confirmado) | no disponible | BF16, 1,59 GiB | apache-2.0 | HuggingFace |
| Otros modelos OCR vision-lenguaje | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- La informacion sobre el modelo base es escasa: no se documentan idiomas, contexto maximo oficial, composicion del dataset de entrenamiento ni resultados de benchmarks.
- La calibracion de la cuantizacion uso 128 imagenes sinteticas de documentos; el rendimiento en dominios visuales distintos (fotografias, manuscritos, formularios atipicos) no esta validado y podria degradarse.
- Riesgo de alucinacion inherente a los modelos vision-lenguaje: el modelo podria generar texto plausible que no aparece en la imagen, especialmente en documentos de baja calidad o con ruido.
- La torre visual y el `lm_head` se mantienen en BF16, por lo que la ganancia de memoria se limita a las capas del decodificador.
- El uso de `--enforce-eager` en vLLM degrada el rendimiento de decodificado aproximadamente 6 veces; hay que evitarlo en produccion.
- La cache de prefijos no se aprovecha con prompts de menos de 1072 tokens, lo que afecta a la eficiencia en cargas de OCR tipicas.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero se debe cumplir la licencia y atribucion del modelo upstream ATH-MaaS/OvisOCR3; este repositorio es una redistribucion derivada y el modelo original sigue siendo propiedad de ATH-MaaS.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria independiente del checkpoint.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/leleroyn/OvisOCR3-AWQ-W4A16
- Modelo base: https://huggingface.co/ATH-MaaS/OvisOCR3
- Libreria de cuantizacion: llmcompressor 0.15.0 (referenciada en la model card; no se proporciona URL)
- Motor de inferencia verificado: vLLM 0.32.0 (referenciado en la model card; no se proporciona URL)
