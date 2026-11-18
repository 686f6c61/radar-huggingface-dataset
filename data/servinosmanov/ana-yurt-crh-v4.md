# servinosmanov/ana-yurt-crh-v4

## Resumen

Ana-Yurt crh-v4 es un ajuste fino completo (full fine-tune) del modelo `google/gemma-4-26B-A4B-it` orientado a la generacion de texto en crimeo tártaro (crh), una lengua túrquica de bajos recursos. Lo desarrolla Servin Osmanov bajo la marca Ana-Yurt, con financiación propia, y se distribuye bajo licencia Apache-2.0. El modelo se sirve en produccion a traves de la plataforma sevil.chat, y la version crh-v4.1 corresponde al siguiente checkpoint de la etapa 2.

El repositorio de Hugging Face no contiene pesos: es unicamente una model card acompanada de ficheros de hashes SHA-256 y pruebas OpenTimestamps que certifican la autoria y la fecha de los artefactos. Esto lo convierte en un caso poco habitual: la ficha tecnica disponible publicamente es limitada y muchos parametros de inferencia no se pueden verificar a partir de los artefactos distribuidos.

Su relevancia radica en el esfuerzo por cubrir una lengua de bajos recursos con un modelo de gran tamano (26B parametros totales, arquitectura MoE con 4B activos segun la nomenclatura del modelo base), incorporando corpus especializados como QIRIM, historias orales de tamirlar.com y contenido de Radio Free Europe/Radio Liberty, con permisos documentados para el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (heredada de google/gemma-4-26B-A4B-it) |
| Parametros totales | 26B (segun denominacion del modelo base) |
| Parametros activos | 4B (segun denominacion del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q5_K_M y Q6_K (mencionados en los hashes); safetensors en etapa 2 |
| Idiomas soportados | Crimeo tártaro (crh) en escritura latina y cirilica; ruso para traduccion |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoints etapa 2) y GGUF (Q5_K_M, Q6_K); no distribuidos en el repositorio |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-26B-A4B-it`, un transformer con mezcla de expertos (MoE) de 26B parametros totales y 4B activos, segun la nomenclatura del identificador. El ajuste realizado es un full fine-tune, no un adaptador LoRA, segun indica la model card. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o decodificacion especulativa.

Los datos de entrenamiento documentados incluyen: contenido de Radio Free Europe/Radio Liberty (ktat.krymr.com, Qırım.Aqiqat) con permiso de entrenamiento concedido el 2026-09-10; historias orales de tamirlar.com («Моя история»), con permisos confirmados en 2026-09-10 y 2026-11-02; materiales de Kesertki (qirimtatartili.app) y UDTTMR (Karadeniz); y los datasets QIRIM en Hugging Face (crh_web, crh_monocorpus, crh-parallel-corpora) bajo CC BY 4.0. El proyecto mantiene un registro por fuente en `docs/crh_dataset_sources.md` y `experiments/14_crh_llm_data/candidates/CORPUS_EXCLUSIONS.json`, aunque estos ficheros no se incluyen en el repositorio de Hugging Face.

## Capacidades

- Generacion de texto en crimeo tártaro en escritura latina y cirilica.
- Traduccion desde y hacia ruso, segun la model card.
- Capacidades heredadas del modelo base Gemma 4 (razonamiento, codigo, matematicas), aunque no se documenta su conservacion tras el ajuste.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion y normalizacion de textos en crimeo tártaro: el modelo puede procesar documentos historicos en escritura cirilica y generar versiones en latina, util para archivos y bibliotecas digitales que necesitan unificar ortografia.
- Traduccion asistida ruso-crimeo tártaro: adecuado para medios de comunicacion y ONG que publican contenido bilingue, dado que la model card declara soporte de ruso para traduccion.
- Preservacion de historia oral: el modelo se entreno con historias orales de tamirlar.com, por lo que puede emplearse para transcribir, resumir o reformular testimonios recogidos en proyectos de memoria historica.
- Atencion ciudadana en crimeo tártaro: integrable en chatbots de servicios publicos para comunidades crimeas, con la salvedad de que no se documenta soporte de tool calling.
- Generacion de material educativo: produccion de ejercicios, resumenes y textos de lectura para ensenanza del crimeo tártaro en escuelas y cursos comunitarios.
- Investigacion linguistica: generacion de corpus sinteticos y variantes estilisticas para estudios de morfologia y sintaxis del crimeo tártaro, siempre que se valide la calidad de la salida.
- Moderacion y clasificacion de contenido en crh: el modelo puede emplearse para etiquetar o filtrar textos en esta lengua en plataformas comunitarias, aunque no se documentan capacidades especificas de clasificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo MoE de 26B totales y 4B activos en GGUF Q5_K_M, se requeririan del orden de 16-20 GB de VRAM; en Q6_K, en torno a 20-24 GB. Estas cifras son estimaciones basadas en el tamano de los ficheros GGUF mencionados, no en datos publicados por el autor.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, una RTX 4090 (24 GB) podria alojar las cuantizaciones Q5_K_M y Q6_K; para precision completa en safetensors se requeririan multiples A100/H100.
- Cabe en GPU de consumo: probablemente si, en RTX 4090 o GPUs con 24 GB o mas, usando las cuantizaciones GGUF citadas.
- Opciones de despliegue: llama.cpp u Ollama para los GGUF; vLLM o TGI para los safetensors, aunque el autor no documenta ninguna de estas opciones.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ana-Yurt crh-v4 | 26B totales / 4B activos | no disponible | Apache-2.0 | Solo servicio en sevil.chat; pesos no distribuidos |
| google/gemma-4-26B-A4B-it | 26B totales / 4B activos | no disponible | Apache-2.0 | Pesos publicos en Hugging Face |
| Modelos especializados en lenguas túrquicas de bajos recursos | no disponible | no disponible | variable | no disponible |

No se dispone de informacion sobre benchmarks comparativos ni sobre otros modelos especializados en crimeo tártaro con los que contrastar rendimiento.

## Limitaciones y advertencias

- Los pesos no se distribuyen: el repositorio solo contiene la model card, la licencia, el aviso y los hashes. No es posible descargar ni ejecutar el modelo localmente desde Hugging Face.
- No se documentan resultados de benchmarks, por lo que no hay evidencia publica cuantitativa sobre su calidad en crh ni sobre la degradacion respecto al modelo base.
- Riesgo de alucinacion: al ser un ajuste sobre un modelo generalista, puede generar contenido plausible pero incorrecto en crimeo tártaro, especialmente en dominios poco representados en el corpus de entrenamiento.
- Sesgos: el corpus incluye medios de comunicacion y testimonios orales, lo que puede introducir sesgos editoriales o geograficos no documentados.
- Cobertura limitada de idiomas: fuera de crh y ruso, el comportamiento no esta garantizado.
- La licencia Apache-2.0 permite uso comercial, pero el aviso exige atribuir el modelo base a Google LLC y respetar las condiciones de las fuentes de entrenamiento citadas.
- El modelo se sirve exclusivamente en sevil.chat, lo que limita la reproducibilidad y la auditoria independiente.
- Las fechas de creacion y actualizacion del repositorio (2026-11-18) y las referencias a Gemma 4 deben tratarse con cautela, ya que no se han podido verificar de forma independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/servinosmanov/ana-yurt-crh-v4
- Servicio en produccion: https://sevil.chat
- DOI: https://doi.org/10.57967/hf/11690
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- OpenTimestamps: https://opentimestamps.org
- Radio Free Europe/Radio Liberty (Qırım.Aqiqat): https://ktat.krymr.com
- Historias orales tamirlar.com: https://tamirlar.com
- Kesertki: https://qirimtatartili.app
- Datasets QIRIM en Hugging Face: https://huggingface.co/QIRIM
