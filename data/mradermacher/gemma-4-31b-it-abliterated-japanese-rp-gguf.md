# mradermacher/gemma-4-31B-it-abliterated-Japanese-RP-GGUF

## Resumen

`mradermacher/gemma-4-31B-it-abliterated-Japanese-RP-GGUF` es una distribucion de cuantizaciones GGUF del modelo `anaaaaaa13421312/gemma-4-31B-it-abliterated-Japanese-RP`, un fine-tuning tipo LoRA sobre una base Gemma 4 de 31B orientada a roleplay en japones e ingles. El autor de las cuantizaciones es mradermacher, un conocido empaquetador de pesos GGUF en el ecosistema Hugging Face, que publica versiones estaticas (Q2 a Q8) y, en un repositorio separado, versiones con imatrix.

El modelo resuelve un nicho concreto: ofrecer un modelo conversacional de 30.697 millones de parametros, afinado para roleplay (RP) en japones e ingles, con la capa de rechazo suprimida mediante "abliteration" (una tecnica de edicion de pesos que elimina la direccion de rechazo del espacio de activaciones). Esto lo hace util para generacion creativa sin filtros, pero tambien lo convierte en un modelo no apto para audiencias generales y con riesgos de seguridad evidentes.

La relevancia actual es doble: por un lado, demuestra el flujo tipico de la comunidad (base Gemma 4 -> LoRA de RP -> abliteration -> cuantizacion GGUF); por otro, es un ejemplo de modelo publicado con licencia Apache 2.0 pese a derivar de Gemma, lo que plantea dudas sobre la validez de esa licencia en la practica. No hay benchmarks publicados ni documentacion tecnica del proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Gemma 4, segun tags del autor; detalles no disponibles) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); versiones imatrix en repo i1-GGUF |
| Idiomas soportados | japones (ja) e ingles (en) |
| Licencia | apache-2.0 (declarada por el autor; ver limitaciones) |
| Formato de pesos | GGUF (cuantizaciones); pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de una base Gemma 4 (familia de transformers decoder-only de Google) de aproximadamente 31B parametros. El modelo base del que deriva esta cuantizacion es un fine-tuning LoRA (tag `lora`, `unsloth` en el repo) sobre una version ya "abliterated" de Gemma 4 31B instruct, especializada en roleplay japones. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO adicional.

Las innovaciones tecnicas documentadas se limitan al pipeline de cuantizacion: mradermacher publica cuantizaciones estaticas con `quantize_version: 2` y `output_tensor_quantised: 1`, y ofrece en un repositorio aparte versiones con imatrix (i1-GGUF) que suelen preservar mejor la perplejidad a igual tamano. No hay informacion sobre attention linear, decodificacion especulativa ni otras optimizaciones de inferencia en la model card.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a roleplay y narrativa.
- Soporte de japones e ingles (unico par de idiomas declarado).
- Fine-tuning especifico para personajes y dialogos de rol (tags `roleplay`, `rp`).
- "Abliteration": supresion de la capa de rechazo, lo que permite generar contenido que el modelo base rechazaria.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, agentes, vision, audio ni modo "thinking".
- Razonamiento y codigo: no documentados especificamente; al derivar de Gemma 4 instruct podria conservar capacidades generales, pero no hay validacion publicada.

## Casos de uso

- Roleplay conversacional en japones: el modelo esta afinado explicitamente para RP, por lo que es adecuado para chatbots de personajes y simulaciones narrativas en japones con contexto multi-turno.
- Generacion creativa sin filtros: la abliteration permite escribir ficcion con tematicas adultas o controvertidas que el modelo base rechazaria; util en entornos de investigacion sobre alineacion y censura.
- Estudio de seguridad y alineacion: comparar las respuestas del modelo abliterated frente al Gemma 4 original permite analizar como se distribuye la direccion de rechazo en el espacio de activaciones.
- Prototipado local de asistentes en japones: con cuantizaciones Q4_K_M (~18,8 GB) se puede desplegar en una GPU consumer de 24 GB (RTX 3090/4090) para pruebas de concepto.
- Traduccion y adaptacion de dialogos ja-en: aunque no esta optimizado para traduccion, el par de idiomas declarado permite usarlo en tareas de reescritura y localizacion de guiones.
- Investigacion sobre fine-tuning LoRA: el repositorio documenta el pipeline (base -> LoRA RP -> abliteration -> GGUF) y sirve como referencia para reproducir el flujo con otras bases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto):
  - Q2_K (12,0 GB): ~14-15 GB.
  - Q3_K_M (15,4 GB): ~17-18 GB.
  - Q4_K_M (18,8 GB): ~21-22 GB.
  - Q5_K_M (21,9 GB): ~24-25 GB.
  - Q6_K (25,3 GB): ~28 GB.
  - Q8_0 (32,7 GB): ~35-36 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q4_K_M y Q5_K_S; A100 40 GB o H100 para Q6_K y Q8_0; multiples GPUs para FP16.
- Cabe en consumer GPU: si, en RTX 3090/4090 con Q4_K_M; en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui; el repo base (safetensors) es compatible con transformers y vLLM/TGI, aunque las cuantizaciones GGUF no.
- Latencia y throughput: no disponibles (no hay mediciones publicadas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Gemma 4 31B abliterated JP-RP GGUF) | ~30,7B | no disponible | ja, en | apache-2.0 (declarada) | Roleplay, sin filtros, solo GGUF |
| Gemma 4 31B IT (base original) | ~31B | no disponible | multilingue | Gemma license | Alineado, rechaza contenido sensible |
| Modelos RP abliterated de 7-13B (comunidad) | 7-13B | variable | variable | variable | Menor calidad pero caben en GPUs pequenas |

No se dispone de datos de benchmarks para comparar rendimiento numerico con alternativas. La comparativa se limita a parametros, licencia e idiomas declarados.

## Limitaciones y advertencias

- Contenido no apto para todas las audiencias: el tag `not-for-all-audiences` indica que el modelo puede generar material adulto, violento u ofensivo.
- Abliteration: la supresion del rechazo degrada la seguridad del modelo; no debe desplegarse en produccion orientada al publico sin filtros externos.
- Riesgo de alucinacion: no hay evaluaciones publicadas; al ser un fine-tuning de RP, la fidelidad factual puede ser menor que la del modelo base.
- Idiomas limitados a japones e ingles; el rendimiento en castellano no esta documentado.
- Licencia dudosa: se declara Apache 2.0, pero el modelo deriva de Gemma, cuya licencia original impone restricciones de uso comercial y de redistribucion. Verificar antes de cualquier uso comercial.
- Contexto no documentado: no se puede planificar el despliegue en funcion de la ventana de contexto.
- Sin benchmarks ni evaluaciones de calidad: no hay evidencia objetiva de rendimiento frente al modelo base.
- El repositorio GGUF no incluye el proyector multimodal (`skip_mmproj: 1`), por lo que no hay soporte de vision en estas cuantizaciones.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/mradermacher/gemma-4-31B-it-abliterated-Japanese-RP-GGUF
- Hugging Face (imatrix): https://huggingface.co/mradermacher/gemma-4-31B-it-abliterated-Japanese-RP-i1-GGUF
- Modelo base: https://huggingface.co/anaaaaaa13421312/gemma-4-31B-it-abliterated-Japanese-RP
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma-4-31B-it-abliterated-Japanese-RP-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
