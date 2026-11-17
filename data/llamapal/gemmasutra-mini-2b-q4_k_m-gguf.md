# LlamaPal/Gemmasutra-Mini-2B-Q4_K_M-GGUF

## Resumen

Gemmasutra Mini 2B (Q4_K_M, GGUF) es un espejo comunitario del modelo Gemmasutra Mini 2B v1 desarrollado por TheDrummer, publicado en Hugging Face por el usuario LlamaPal. No se trata de un modelo original: el repositorio contiene una copia byte a byte del archivo `Gemmasutra-Mini-2B-v1-Q4_K_M.gguf` generado por bartowski, con el mismo hash SHA-256 (`b6c548e3...a40ede`), preservado como punto de descarga estable.

El modelo base es un ajuste fino de tipo conversacional sobre Gemma de aproximadamente 2.600 millones de parametros (2.614.341.888 segun los safetensors del repositorio), empaquetado en formato GGUF con cuantizacion Q4_K_M, lo que reduce el peso del archivo a 1,7 GB. Su tag `conversational` y el sufijo "Mini" indican un modelo orientado a dialogos, derivado de la familia Gemma de Google.

Su relevancia practica es limitada pero clara: ofrece un checkpoint pequeno (2B) en cuantizacion de 4 bits que puede ejecutarse en hardware de consumo, y este repositorio concreto actua como espejo de disponibilidad para quien quiera descargar exactamente el mismo binario que produjo bartowski. Al ser un mirror, no aporta entrenamiento, evaluacion ni modificaciones propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma; detalles de capas y atencion no disponibles en la informacion proporcionada) |
| Parametros totales | 2.614.341.888 (segun safetensors del repositorio) |
| Parametros activos | No disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); existen otras variantes en el repositorio original de bartowski, no listadas aqui |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | Gemma Terms of Use (etiqueta `gemma`; el repositorio original figura como `other`) |
| Formato de pesos | GGUF (`Gemmasutra-Mini-2B-Q4_K_M.gguf`, 1,7 GB, SHA-256 `b6c548e3d85bca978ce71943b68e163e68a6a83940ee5cb1888561efb2a40ede`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Por la nomenclatura y el origen (familia Gemma, ajuste fino de TheDrummer), se trata de un transformer decoder-only de aproximadamente 2.600 millones de parametros, adaptado para uso conversacional mediante un ajuste fino sobre el checkpoint Gemma original. No se especifican en la model card el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento.

El unico detalle tecnico verificable en este repositorio es el proceso de cuantizacion: el archivo GGUF usa el metodo Q4_K_M, una cuantizacion de 4 bits con bloques K-quant que mantiene determinadas capas y tensores criticos en mayor precision. El tag `imatrix` sugiere que la cuantizacion original de bartowski empleo matrices de importancia para calibrar la perdida de precision, aunque este dato corresponde al repositorio de origen y no se detalla en la card del espejo.

## Capacidades

- Generacion de texto y dialogo conversacional multi-turno, segun el tag `conversational` del repositorio.
- Inferencia local en formato GGUF mediante runtimes compatibles con llama.cpp.
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible`), lo que permite desplegarlo como endpoint de text-generation.
- Capacidades de razonamiento, codigo, matematicas, tool calling, agentes o vision: no disponibles en la informacion proporcionada.
- Cobertura multilingue concreta: no disponible; la model card no enumera idiomas.

## Casos de uso

- Prototipado local de asistentes conversacionales: con 1,7 GB en Q4_K_M, el modelo cabe en GPUs de consumo y permite iterar rapidamente sobre prompts y plantillas de chat sin depender de infraestructura en nube.
- Pruebas de integracion con llama.cpp y derivados: sirve como checkpoint de referencia para validar pipelines de inferencia GGUF (carga, tokenizacion, plantilla de chat) antes de migrar a modelos mayores.
- Despliegue de bajo coste en CPU o GPU integrada: la cuantizacion de 4 bits y el tamano de 2B lo hacen viable en portatiles sin GPU dedicada, con latencia aceptable para tareas interactivas simples.
- Generacion de texto acotada en aplicaciones empotradas: resumenes cortos, respuestas plantilla y clasificacion textual ligera donde el coste por inferencia debe ser minimo.
- Reproducibilidad de artefactos: al ser un mirror con hash verificable, permite a equipos de investigacion fijar exactamente el mismo binario que uso bartowski en sus pruebas, evitando discrepancias por re-subidas.
- Evaluacion comparativa de ajustes finos "Mini": util como linea base frente a otros fine-tunes de 2B para medir diferencias de estilo conversacional en condiciones de cuantizacion identicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del espejo no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB con Q4_K_M (1,7 GB de pesos mas overhead de contexto y cache KV); el valor exacto depende de la longitud de contexto configurada, que no esta documentada.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; tarjetas como RTX 3060, RTX 4060, RTX 4090 o A100 pueden ejecutarlo con holgura, aunque las GPU de datacenter estan sobredimensionadas para un modelo de 2B en 4 bits.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas, y tambien en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), servidores compatibles con la API de llama.cpp, y endpoints de Hugging Face por el tag `endpoints_compatible`. vLLM y TGI no estan confirmados para este archivo GGUF en la informacion disponible.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemmasutra Mini 2B Q4_K_M (este) | 2,61B | No disponible | GGUF Q4_K_M | Gemma Terms of Use | Mirror comunitario en HF |
| Gemma 2B (base, Google) | ~2B | No disponible en esta ficha | Safetensors, GGUF | Gemma Terms of Use | Repositorio oficial de Google |
| Gemmasutra Mini 2B v1 (bartowski) | 2,61B | No disponible | GGUF (multiples quants) | `other` segun repo original | Repositorio original en HF |

La comparacion con modelos de otros linajes (por ejemplo, Qwen2.5-1.5B o Phi-2) no puede completarse con datos verificables en la informacion proporcionada; no se dispone de benchmarks de este checkpoint para establecer comparaciones de rendimiento.

## Limitaciones y advertencias

- Es un mirror, no un modelo original: cualquier problema de calidad, sesgo o comportamiento proviene del checkpoint de TheDrummer y de la cuantizacion de bartowski, no de este repositorio.
- Licencia: uso sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy; existen restricciones de uso comercial y de casos prohibidos que deben revisarse antes de produccion. El repositorio original figura como `other`, lo que anade ambiguedad sobre la licencia efectiva del ajuste fino.
- Riesgo de alucinacion: no evaluado en la informacion disponible; en modelos de 2B es habitualmente elevado, pero no hay datos publicados que lo cuantifiquen aqui.
- Sesgos conocidos: no documentados en la model card; al derivar de Gemma, hereda los sesgos del modelo base, que tampoco se detallan.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan declarados, lo que impide garantizar comportamiento multilingue o ventanas largas.
- Perdida por cuantizacion: Q4_K_M introduce degradacion respecto al checkpoint en mayor precision; no se han publicado evaluaciones comparativas entre quants para este modelo.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, creado en noviembre de 2026; no hay evidencia comunitaria de uso ni validacion independiente del binario mas alla del hash declarado.

## Enlaces

- Repositorio del espejo: https://huggingface.co/LlamaPal/Gemmasutra-Mini-2B-Q4_K_M-GGUF
- Repositorio original de bartowski: https://huggingface.co/bartowski/Gemmasutra-Mini-2B-v1-GGUF
- Commit de origen citado: https://huggingface.co/bartowski/Gemmasutra-Mini-2B-v1-GGUF/tree/e1e3391c4153250285007870b6dbfc4223613598
- Gemma Terms of Use: https://gemma.ai/resources/terms/
- Gemma Prohibited Use Policy: https://gemma.ai/resources/prohibited-use/
