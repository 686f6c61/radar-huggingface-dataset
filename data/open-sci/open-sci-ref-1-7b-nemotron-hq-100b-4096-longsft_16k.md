# open-sci/open-sci-ref-1.7b-nemotron-hq-100B-4096-longsft_16k

## Resumen

`open-sci-ref-1.7b-nemotron-hq-100B-4096-longsft_16k` es un modelo de lenguaje denso de 1.714 millones de parametros publicado por el colectivo open-sci (con origen en el ecosistema laion/open-sci-ref). No es un modelo de proposito general, sino un checkpoint de investigacion disenado para aislar el efecto del corpus web en el preentrenamiento a gran escala. Concretamente, forma parte de un estudio 2x2 presentado a la NeurIPS 2026 bajo el titulo *Strong Post-Training from Permissive, Reasoning-Dominant, Web-Scale Pretraining*, en el que se cruza el corpus web (MixtureVitae frente a Nemotron-CC) con la presencia o ausencia de datos de razonamiento e instrucciones.

El modelo parte de un preentrenamiento de 100.000 millones de tokens sobre el subconjunto de alta calidad de Nemotron-CC (2024), con una receta fija del protocolo `open-sci-ref`: transformer denso de 1.7B, tokenizador GPT-NeoX (vocabulario de 50.304), secuencias de 4.096 tokens y RoPE theta de 100k. Sobre esa base se aplica una extension de contexto largo hasta 16.384 tokens mediante escalado YaRN (factor 4.0) y una epoca de SFT largo, lo que lo convierte en la celda "Nemotron web + no front-loading" del estudio, directamente comparable con sus tres celdas hermanas.

Su relevancia es metodologica mas que de producto: permite a investigadores medir de forma limpia el impacto del corpus web y del enriquecimiento con razonamiento, manteniendo constantes receta, tokenizador y convencion de fin de documento. La licencia Apache 2.0 y el formato safetensors facilitan su reutilizacion como linea base reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (protocolo `open-sci-ref`, clase `OpensciModel` en `modeling_opensci.py`) |
| Parametros totales | 1.714.377.728 (~1.7B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 16.384 tokens (extension YaRN factor 4.0 desde 4.096) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en el momento de la consulta) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`, requiere `trust_remote_code=True`) |
| Tokenizador | GPT-NeoX, vocabulario 50.304, almacenamiento uint16 |
| Tamano del repo | 3,4 GB |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 1.7B parametros que sigue el protocolo `open-sci-ref`. El preentrenamiento cubre 100.000 millones de tokens en 23.842 iteraciones con longitud de secuencia de 4.096, batch global de 1.024, learning rate de 4e-3, schedule WSD con un 20 % de cooldown lineal y RoPE theta de 100k. El entrenamiento se ejecuto en 64 nodos con 4 GH200 cada uno. El corpus base es el subconjunto de alta calidad de Nemotron-CC (2024), sin datos de razonamiento ni instrucciones ("no front-loading"), lo que constituye la variable independiente de esta celda del estudio.

La extension a contexto largo se realizo con escalado YaRN de factor 4.0 (de 4.096 a 16.384 tokens), seguida de una epoca de `long_sft` con una mezcla de SeaLong y LongAlign (30 %) y SmolTalk (70 %), learning rate 2e-4 con schedule coseno, sobre 2 nodos con 4 GH200. La receta es identica a la de los modelos de 16k de las celdas MV-100BT y MV-noinstruct, de modo que las cuatro celdas del 2x2 son directamente comparables. La perdida final de entrenamiento reportada es 0.9778.

Una innovacion tecnica destacable, aunque de caracter practico, es el parche en `modeling_opensci.py`: `OpensciModel.forward` acepta `**kwargs` para que `transformers` pueda propagar `num_items_in_batch` desde el `Trainer` y promediar la perdida correctamente. Sin este parche, el entrenamiento falla con `TypeError`. El comportamiento de la perdida no cambia.

## Capacidades

- Generacion de texto autoregresiva en ingles con contexto de hasta 16.384 tokens.
- Razonamiento de cadena larga y respuesta a instrucciones, adquiridos en la fase de `long_sft` (SeaLong, LongAlign, SmolTalk).
- Manejo de entradas largas: resumen de documentos extensos, preguntas sobre multiples pasajes y conversaciones multi-turno con historial amplio.
- Capacidad multilingue limitada al ingles; no se declaran otros idiomas.
- No se declara soporte de tool calling ni function calling en la model card.
- No se declara soporte de agentes, vision, audio ni modo de pensamiento explicito.
- No se declara un modo de decodificacion especulativa ni optimizaciones de inferencia especificas.

## Casos de uso

- Linea base reproducible para investigacion sobre corpus: sirve como celda de control "Nemotron web sin razonamiento" en el estudio 2x2, permitiendo medir el efecto del enriquecimiento con razonamiento manteniendo constante la receta. Es su uso principal y el motivo de su publicacion.
- Resumen de documentos largos: con 16.384 tokens de contexto puede procesar articulos, informes o contratos de decenas de paginas en una sola pasada, sin necesidad de chunking agresivo.
- Respuesta a preguntas sobre multiples pasajes: adecuado para tareas de retrieval-augmented generation en las que se concatenan varios fragmentos recuperados y se requiere sintesis con atribucion.
- Analisis de conversaciones multi-turno: el contexto extendido permite mantener historiales largos en prototipos de atencion al cliente o asistentes de documentacion tecnica en ingles.
- Filtrado y clasificacion de corpus a escala: por su tamano (1.7B) y su coste de inferencia contenido, puede emplearse para etiquetar, deduplicar semanticamente o puntuar calidad de grandes volumenes de texto antes de un preentrenamiento mayor.
- Experimentos de ablacion sobre longitud de contexto: al compartir receta con las otras tres celdas del estudio, es util para estudiar como interactua el contexto de 16k con distintas composiciones de corpus.
- Prototipado rapido en entornos con recursos limitados: un modelo denso de 1.7B en safetensors puede desplegarse en una sola GPU consumer para validar pipelines de evaluacion antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta la perdida final de entrenamiento (0.9778) y los detalles de la receta; no incluye MMLU, HumanEval, GSM8K ni metricas de tareas de contexto largo.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 5 y 8 GB para secuencias moderadas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1,8-2,5 GB de pesos; en 4 bits, aproximadamente 1-1,5 GB. Estas cifras son estimaciones por tamano, no valores publicados por el autor.
- Cache KV con contexto de 16.384 tokens: crece de forma lineal con la longitud y el batch; para batches grandes conviene planificar VRAM adicional o usar atencion con memoria eficiente.
- GPU recomendadas: cualquier GPU con al menos 8-16 GB para FP16 (RTX 4090, RTX 3090, L40S, A10G). Para servir con throughput alto, A100 40/80 GB o H100.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas en cuantizacion y 16 GB o mas en precision completa para contextos moderados.
- Opciones de despliegue: al usar `custom_code` con `modeling_opensci.py`, la integracion directa con vLLM, TGI o llama.cpp no esta garantizada y requeriria conversion o adaptacion. La via mas segura es `transformers` con `trust_remote_code=True`.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| open-sci-ref-1.7b-nemotron-hq-100B-4096-longsft_16k | 1,7B denso | 16.384 | Apache 2.0 | Checkpoint de investigacion sobre corpus Nemotron-CC, sin razonamiento front-loaded |
| open-sci-ref-v0.02-1.7b-nemotron-hq-100B-4096 (modelo base) | 1,7B denso | 4.096 | Apache 2.0 (segun el ecosistema open-sci-ref) | Mismo corpus y receta, sin extension de contexto |
| Celda nemotron-hq-mv_reasoning-100B (16k) | 1,7B denso | 16.384 | Apache 2.0 | Mismo corpus web con subconjunto de razonamiento de MixtureVitae anadido |
| Celda MV-100BT (16k) | 1,7B denso | 16.384 | Apache 2.0 | Corpus web MixtureVitae con razonamiento front-loaded |

La comparacion mas informativa es interna al propio estudio: las cuatro celdas comparten receta, tokenizador y convencion de fin de documento, de modo que las diferencias de rendimiento son atribuibles al corpus y al enriquecimiento con razonamiento. Frente a modelos de proposito general del mismo tamano (por ejemplo, la familia Qwen2.5-1.5B o Llama-3.2-1B), este checkpoint no esta optimizado para uso comercial directo ni declara benchmarks de tareas, por lo que no se dispone de datos para una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo de investigacion: no se han publicado evaluaciones de calidad, seguridad ni alineacion; no debe tratarse como un modelo listo para produccion.
- Solo ingles: la model card declara exclusivamente `en`; el rendimiento en castellano u otros idiomas no esta caracterizado y probablemente sea deficiente.
- Riesgo de alucinacion: al ser un modelo pequeno (1.7B) con SFT limitado a una epoca, la propension a inventar hechos es alta, especialmente en tareas de conocimiento factual.
- Sesgos: el corpus Nemotron-CC es web filtrado; hereda los sesgos presentes en la web en ingles. No se documentan mitigaciones.
- Contexto extendido por YaRN: la extension a 16k se obtuvo con una sola epoca de `long_sft`; el rendimiento puede degradarse en el extremo superior de la ventana o con tareas que requieran recuperacion precisa de informacion en posiciones intermedias.
- Dependencia de codigo personalizado: requiere `trust_remote_code=True` y la clase `OpensciModel`; esto complica la auditoria de seguridad y la integracion con frameworks de serving estandar.
- Licencia Apache 2.0: permite uso comercial, pero al ser un artefacto de investigacion sin garantias, el usuario asume todo el riesgo de calidad y cumplimiento.
- Fecha de creacion inusual (2026-10-30) y muy pocas descargas (14) y likes (0): senal de que es un checkpoint reciente y practicamente sin validacion externa por parte de la comunidad.
- Sin datos de cuantizacion publicados: no hay GGUF oficial, por lo que el despliegue en llama.cpp u Ollama requeriria conversion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-sci/open-sci-ref-1.7b-nemotron-hq-100B-4096-longsft_16k
- Modelo base citado en la model card: `laion/open-sci-ref-v0.02-1.7b-nemotron-hq-100B-4096` (referencia textual; no se proporciono URL directa)
- Paper asociado: *Strong Post-Training from Permissive, Reasoning-Dominant, Web-Scale Pretraining*, NeurIPS 2026 (sin URL disponible en la informacion proporcionada)
- Nemotron-CC (2024): corpus de preentrenamiento de NVIDIA citado como sustrato web (sin URL disponible en la informacion proporcionada)
- MixtureVitae: corpus de referencia del estudio (sin URL disponible en la informacion proporcionada)
- SeaLong, LongAlign y SmolTalk: datasets de la fase de `long_sft` (sin URL disponible en la informacion proporcionada)
