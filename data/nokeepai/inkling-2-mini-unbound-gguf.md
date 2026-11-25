# nokeepai/Inkling-2-Mini-Unbound-GGUF

## Resumen

Inkling-2-Mini-Unbound GGUF es la distribucion cuantizada en formato GGUF de nokeepai/Inkling-2-Mini-Unbound, una variante "abliterated" y sin censura del modelo multimodal Inkling 2 Mini. El autor, nokeepai, parte del checkpoint BF16 oficial de ggml-org y aplica un parche quirurgico sobre las proyecciones de atencion para eliminar el comportamiento de rechazo del modelo original, manteniendo intactos los pesos de los expertos, el router, los embeddings y la cabeza de salida. El resultado es un modelo que responde a instrucciones que el original declina, con una deriva (KLD) medida de 0,0439 frente al Q8_0 original.

El modelo tiene 26.070.385.152 parametros totales y es de tipo mixture-of-experts (MoE), con capacidad de entrada imagen-texto (pipeline image-text-to-text). Se distribuye en seis cuantizaciones que van de 11,2 GB (IQ2_M) a 27,8 GB (Q8_0), mas un proyector de vision separado (mmproj) de 0,3-0,6 GB. La licencia es Apache 2.0 y el repo acumula 83.821 descargas y 92 likes en pocos dias, lo que indica un interes notable por parte de la comunidad.

Su relevancia actual radica en que ofrece una alternativa sin rechazos sobre un modelo multimodal de tamano medio, con evaluacion cuantitativa publicada frente a otros derivados sin censura, y con un proceso de construccion reproducible y verificado byte a byte. Es una opcion practica para laboratorios de seguridad, investigacion sobre alineacion y despliegues donde el filtrado del modelo base resulta un obstaculo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE), multimodal imagen-texto |
| Parametros totales | 26.070.385.152 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la evaluacion usa fragmentos de 4.096 tokens y caps de pensamiento de 4.096 y respuesta de 8.192) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ3_M, IQ2_M; proyector de vision en BF16 y Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors en el repo base |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture-of-experts con 24 capas y capacidad multimodal (entrada de imagen y texto). La variante Unbound se construye en tres pasos documentados: primero se parte del BF16 oficial de ggml-org/Inkling-2-Mini-GGUF; segundo, se parchean 120 tensores de forma byte-exacta, concretamente las proyecciones `attn_q`, `attn_k`, `attn_v`, `attn_output` y `attn_gate` de las 24 capas; tercero, se cuantiza con `llama-quantize` estandar de llama.cpp. Antes de escribir cada tensor parcheado, el script verifica que los bytes BF16 del checkpoint original coinciden exactamente con los de ggml-org, lo que garantiza la integridad del resto de pesos (584 tensores sin tocar, incluidos todos los expertos, el router, los embeddings y la cabeza).

No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base. La innovacion tecnica principal es el metodo de "abliteration" selectivo sobre las proyecciones de atencion, que elimina el rechazo sin reentrenar y con una deriva acotada (KLD 0,0439 frente al Q8_0 original, 95,4% de coincidencia en el token superior). El modelo soporta modo de pensamiento (thinking) y se recomienda `--temp 0.6 --top-p 0.95` con un cap de pensamiento; no debe usarse muestreo DRY.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Comprension de imagenes (image-text-to-text) mediante el proyector mmproj.
- Razonamiento con modo de pensamiento (thinking) activable, con cap configurable.
- Respuesta a instrucciones que el modelo original rechaza, incluidas peticiones de contenido danino, peligroso o ilegal, sin formacion de seguridad superpuesta.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidad especial: variante "abliterated" y "uncensored" con evaluacion cuantitativa de utilidad sobre prompts daninos.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como responde un modelo sin entrenamiento de seguridad a prompts daninos, con metricas publicadas (83,7% de utilidad con thinking off, 85,2% con thinking on sobre 263 prompts retenidos) que sirven de linea base para comparar tecnicas de mitigacion.
- Red teaming y evaluacion de salvaguardas: util para probar clasificadores de entrada/salida y filtros de contenido en pipelines propios, ya que el modelo seguira instrucciones que otros rechazan y expone casos limite dificiles de obtener de otra forma.
- Analisis de imagenes en entornos controlados: con el proyector mmproj (0,3 GB en Q8_0) puede procesar entradas imagen-texto para tareas de descripcion, extraccion de informacion o respuesta visual, siempre con salvaguardas externas.
- Despliegue local en estaciones de trabajo: la cuantizacion Q4_K_M (17,8 GB) cabe en GPUs de 16-24 GB de VRAM y permite ejecucion offline con llama.cpp, LM Studio u Ollama para prototipos y experimentos.
- Generacion de contenido creativo sin restricciones editoriales: para fiction, guiones o narrativa que requiera temas sensibles, con la advertencia de que el contenido debe revisarse antes de publicacion.
- Docencia y formacion en IA: permite demostrar en vivo las diferencias entre un modelo alineado y uno abliterated, y discutir las implicaciones eticas con datos concretos de la tabla comparativa del autor.
- Evaluacion de cuantizaciones: los seis tamanos publicados con KLD y coincidencia de token superior permiten medir el impacto de la cuantizacion en tareas reales antes de elegir un despliegue en produccion.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (Q8_0 en llama.cpp `19bc41dbb`, greedy, cap de pensamiento 4.096, cap de respuesta 8.192, juez Jev, util = p >= 0,5):

| Modelo | Util thinking off | Util thinking on | Rechazo off / on | Deriva (KLD) |
|---|---|---|---|---|
| Inkling-2-Mini-Unbound v2.1 | 83,7% | 85,2% | 0,4% / 0,4% | 0,0439 |
| IndrasMirror XQ | 58,9% | 68,1% | 0,0% / 0,0% | 0,0357 |
| AtomicChat Uncensored, LoRA | 52,1% | 55,5% | 0,0% / 0,0% | 0,0078 |
| AtomicChat Uncensored, AD-Q4_K | 50,2% | 59,3% | 0,4% / 0,0% | 0,0106 |
| OpenUncensored | 33,1% | 41,8% | 1,5% / 0,8% | 0,0228 |
| JoaoZaokk Heretic | 17,5% | 26,2% | 1,1% / 0,4% | no medido |
| Inkling 2 Mini original | 0,8% | 0,8% | 96,2% / 95,8% | — |

Evaluacion sobre 263 prompts daninos retenidos. Ademas, MMLU-300 = 74,3 y GSM8K-100 = 98, dentro del ruido del original (76,3 / 97); 1 de 784 prompts benignos limite (0,1%) fue rechazado. Con cap de pensamiento, el 16,1% de 230 prompts daninos nuevos alcanzo el cap, frente al 29,1% con decodificacion greedy. No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente el tamano del archivo mas unos pocos GB para el contexto (mas en contextos largos). Q8_0: 27,8 GB; Q6_K: 23,6 GB; Q5_K_M: 20,1 GB; Q4_K_M: 17,8 GB; IQ3_M: 13,3 GB; IQ2_M: 11,2 GB.
- Proyector de vision: anadir 0,3 GB (Q8_0) o 0,6 GB (BF16) solo si se requiere entrada de imagen.
- GPU recomendadas: 32 GB+ de VRAM (A100 40/80 GB, H100) para Q8_0; 24-32 GB (RTX 4090, A6000) para Q6_K o Q5_K_M; 16-24 GB (RTX 4080, RTX 4090) para Q4_K_M; 12-16 GB para IQ3_M; menos de 12 GB para IQ2_M.
- Al ser MoE, si no cabe en VRAM llama.cpp puede mantener parte de los expertos en RAM del sistema con `--n-cpu-moe N`, a costa de velocidad; en ese caso VRAM + RAM deben cubrir el tamano del archivo con margen.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (compatible con endpoints).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Utilidad (thinking on) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-Unbound v2.1 | 26,07 B (MoE) | no disponible | 85,2% | Apache 2.0 | GGUF en HF |
| IndrasMirror XQ | no disponible | no disponible | 68,1% | no disponible | HF |
| AtomicChat Uncensored (LoRA) | no disponible | no disponible | 55,5% | no disponible | HF |
| OpenUncensored | no disponible | no disponible | 41,8% | no disponible | HF |
| Inkling 2 Mini original | 26,07 B (MoE) | no disponible | 0,8% | no disponible | HF |

La comparativa se limita a los derivados sin censura del mismo modelo base evaluados por el autor; no se dispone de datos de parametros, contexto ni licencia de las alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo sigue instrucciones daninas: da respuestas detalladas a peticiones de contenido peligroso o ilegal que el original declina. No tiene entrenamiento de seguridad superpuesto y no debe desplegarse a usuarios finales sin salvaguardas propias.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como cualquier modelo generativo, puede producir informacion falsa con apariencia de veracidad.
- Deriva por cuantizacion: las versiones IQ3_M (KLD 0,0595) e IQ2_M (KLD 0,0751) son notablemente lossy; para evaluacion rigurosa se recomienda Q8_0, que es el usado en la evaluacion publicada.
- Sesgos conocidos: no documentados en la informacion disponible; la eliminacion del rechazo puede amplificar sesgos presentes en el modelo base.
- Limitaciones de contexto e idioma: no disponibles; la evaluacion usa fragmentos de 4.096 tokens, pero no se especifica la ventana maxima.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor advierte explicitamente contra el despliegue sin salvaguardas; la responsabilidad legal del contenido generado recae en el operador.
- Recomendaciones de inferencia: usar thinking on, `--temp 0.6 --top-p 0.95` y un cap de pensamiento; no usar muestreo DRY.
- No existe GGUF BF16 para v2.1; para precision completa hay que usar el checkpoint safetensors del repo principal.

## Enlaces

- Repositorio GGUF: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound-GGUF
- Modelo base: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
- GGUF BF16 oficial de partida: https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Sitio del autor: https://nokeep.ai/?ref=huggingface
