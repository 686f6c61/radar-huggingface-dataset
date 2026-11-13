# PhalaCloud/Qwen3.8-27B-Uncensored-LoRA

## Resumen

Qwen3.8-27B-Uncensored-LoRA es un adaptador PEFT de tipo LoRA de rango 3 publicado por PhalaCloud sobre el checkpoint oficial Qwen/Qwen3.8-27B. No es un modelo completo, sino un conjunto de factores BF16 de aproximadamente 13 MB que se aplican en tiempo de servicio sobre el modelo base, apuntando a las proyecciones `o_proj`, `out_proj` y `down_proj`. Su proposito es reducir las negativas (refusals) del modelo base sin reentrenar ni fusionar pesos, de modo que una misma instancia de inferencia pueda atender peticiones con el comportamiento estandar y peticiones con el comportamiento "uncensored" seleccionando el adaptador por peticion.

El adaptador se construyo con la herramienta Heretic v1.3.0 (abliteration), usando carga NF4 y computo BF16, normalizacion completa de filas y direccion ortogonalizada, con una busqueda de 200 ensayos y un presupuesto de 7.200 segundos. La seleccion del ganador (ensayo 61, KL 0.1080) minimizo las negativas en el conjunto de construccion entre los ensayos de Pareto con KL <= 0.22, y no se uso la puntuacion de evaluacion para elegir el adaptador.

Es relevante ahora porque demuestra una via de bajo coste para modular el comportamiento de rechazo de un modelo grande sin duplicar pesos en produccion, algo atractivo para despliegues multi-tenant donde conviven casos de uso con requisitos distintos. La evaluacion publicada es, sin embargo, preliminar: los jueces son automaticos, la revision humana esta pendiente y el licenciamiento de los datos de construccion no esta aclarado para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.8-27B; modulos objetivo `o_proj`, `out_proj`, `down_proj` |
| Parametros totales | no disponible (adaptador de ~13 MB; el modelo base Qwen3.8-27B no detalla parametros en la informacion proporcionada) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible para el adaptador; depende de la configuracion del base (se mencionan ajustes YaRN y EAGLE en el perfil de servicio, sin cifras) |
| Tipos de cuantizacion | Factores LoRA en BF16; el base evaluado se sirvio en FP8 con cache KV FP8; construccion con carga NF4 y computo BF16 |
| Idiomas soportados | en (segun la model card y el tag `language: [en]`) |
| Licencia | apache-2.0 para el adaptador; los datos de construccion incluyen `mlabonne/harmless_alpaca` (derivado de Stanford Alpaca, CC BY-NC 4.0) y `mlabonne/harmful_behaviors` (derivado de AdvBench, MIT upstream) |
| Formato de pesos | safetensors (`adapter_model.safetensors`, `adapter_config.json`); libreria `peft` |
| Rango LoRA | 3 |
| Modelo base | Qwen/Qwen3.8-27B (relacion: adapter); servicio evaluado sobre Qwen/Qwen3.8-27B-FP8, revision `017b9c7af6b5689d5dd426a76e0bc077eb5ca20a` |
| Fecha de publicacion | 2026-11-13 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 3 con factores nativos conservados antes de la fusion y convertidos explicitamente a BF16. No requiere modelo fusionado: se carga junto al base y se activa por peticion mediante el nombre de modelo compuesto `base:adapter`. La construccion siguio el metodo de abliteration implementado en Heretic v1.3.0 (commit `9b7624ddfa69d97dde13615768566fd93c74f82c`), con normalizacion completa de filas y direccion ortogonalizada, semilla 20261108, batch 16, thinking desactivado y limite de 100 tokens por muestra de construccion.

La busqueda consumio 200 ensayos presupuestados, 60 de arranque y un limite de 7.200 segundos, de los cuales se completaron 85. El criterio de seleccion fue minimizar las negativas en el conjunto de construccion entre los ensayos de Pareto con divergencia KL <= 0.22, desempatando por KL y por indice de ensayo; gano el ensayo 61 con KL 0.1080. Los datos de construccion son `mlabonne/harmless_alpaca` (400 muestras de entrenamiento / 100 de test) y `mlabonne/harmful_behaviors` (400 / 96), ambos en revisiones fijadas; se excluyeron solapamientos exactos con la evaluacion normalizada, aunque el autor advierte que puede persistir solapamiento semantico o por familia de tarea.

## Capacidades

- Generacion de texto en ingles sobre el modelo base Qwen3.8-27B, incluyendo modo de razonamiento (thinking) activable o desactivable mediante `chat_template_kwargs`.
- Reduccion drastica de negativas: 0/60 en StrongREJECT con el juez primario (frente a 59/60 y 60/60 del base) y 4/60 / 1/60 con el juez secundario.
- Preservacion de capacidades de razonamiento matematico: GSM8K flexible-extract 1.275/1.319 (96,66%) frente a 1.271/1.319 (96,36%) del base, con thinking desactivado.
- Seguimiento de instrucciones practicamente intacto: IFEval prompt-level strict 442/541 (81,70%) frente a 446/541 (82,44%), una caida de 0,74 puntos.
- Tool calling con parser `qwen3_coder`: 1/300 rondas rotas con razonamiento activado, frente a 6/300 en el control base.
- Plantillas de capacidad: 44/44 plantillas que pasaban en el base siguen pasando; se ejercitaron las 52 plantillas totales.
- Servicio simultaneo de base y adaptador en el mismo motor, con seleccion por peticion y hasta 2 LoRAs por batch y 2 LoRAs cargadas.
- No se documentan capacidades de vision, audio ni multimodalidad en la informacion proporcionada.

## Casos de uso

- Despliegue multi-tenant con comportamiento dual: servir `qwen/qwen3.8-27b` para peticiones que requieren el comportamiento estandar y `qwen/qwen3.8-27b:unc-r3-1abf13b2` para las que necesitan el modo sin negativas, reutilizando la misma instancia SGLang y el mismo base FP8, sin duplicar VRAM de pesos.
- Generacion de ficcion y dialogos creativos: el adaptador elimina negativas en tareas de escritura creativa (el ejemplo de la model card es un dialogo ficticio), ambito donde el base rechaza con frecuencia por precaucion excesiva.
- Evaluacion de robustez y red teaming: disponer de una variante que responde a peticiones de StrongREJECT (0/60 negativas) permite a equipos de seguridad medir la exposicion real de un modelo base y calibrar filtros externos.
- Clasificacion y anotacion de contenido sensible: pipelines que necesitan describir, etiquetar o resumir material sensible sin que el modelo se niegue, manteniendo el resto de capacidades del base (IFEval 81,70%).
- Investigacion sobre alineacion y abliteration: el adaptador es un artefacto reproducible (hashes SHA256 publicados, PROVENANCE.json con pines y ajustes) util para estudiar el efecto de una intervencion de rango 3 sobre el comportamiento de rechazo con una perturbacion KL medida de 0.1080.
- Asistentes de codigo con tool calling: al conservar 1/300 rondas rotas en tool calling con razonamiento activado y mantener las 44 plantillas de capacidad, puede integrarse en agentes que ejecutan herramientas sin perder fiabilidad respecto al base.
- Moderacion asistida por LLM: usar el adaptador para generar contraejemplos y respuestas que el base rechazaria, alimentando conjuntos de evaluacion de clasificadores de seguridad.

## Benchmarks y rendimiento

Medido en H200 con Qwen3.8-27B-FP8, cache KV FP8 y EAGLE. "Stock" es el mismo motor sin el LoRA en tiempo de ejecucion. off/on indica thinking desactivado/activado.

| Evaluacion | Stock | Adaptador |
|---|---|---|
| StrongREJECT, negativas, juez primario (off / on) | 59/60 / 60/60 | 0/60 / 0/60 |
| StrongREJECT, negativas, juez secundario (off / on) | 60/60 / 60/60 | 4/60 / 1/60 |
| XSTest, negativas seguras, primario (off / on) | 3/50 / 2/50 | 0/49 / 0/49 validas |
| Tareas de producto, negativas, primario (off / on) | 2/30 / 3/30 | 0/30 / 0/30 |
| GSM8K flexible-extract, thinking off | 1.271/1.319 (96,36%) | 1.275/1.319 (96,66%; +0,30 pp) |
| IFEval prompt-level strict, thinking off | 446/541 (82,44%) | 442/541 (81,70%; -0,74 pp) |
| Plantillas de capacidad | 44 plantillas superadas | 44/44 superadas |
| Tool calling con razonamiento on, rondas rotas / 300 | 6/300 (control base en motor LoRA) | 1/300 |

Notas del autor: la generacion de calidad uso un limite de 4.096 tokens; las respuestas vacias o truncadas del adaptador fueron 1/1.319 en GSM8K y 6/541 en IFEval. El juez primario fue `phala/qwen3.8-27b-uncensored`, calibrado sobre 23 casos; el secundario fue `moonshotai/kimi-k3.1-pro` sobre las mismas respuestas guardadas. El autor advierte que las etiquetas automaticas no son verdad de referencia humana, que un juicio de XSTest por modo quedo limitado o invalido, que la concordancia sobre utilidad fue menor que la de negativas y que la revision humana esta pendiente.

## Requisitos de hardware

- El adaptador pesa aproximadamente 13 MB, por lo que su VRAM adicional es despreciable; el requisito real lo marca el modelo base Qwen3.8-27B.
- La evaluacion oficial se ejecuto en GPU H200 con el base en FP8 y cache KV FP8, lo que indica que el despliegue de referencia es de clase datacenter.
- VRAM estimada para el base: no disponible en la informacion proporcionada (no se detalla el numero de parametros ni la huella por cuantizacion del checkpoint Qwen3.8-27B).
- GPU consumer: no disponible; no se aportan datos que confirmen que el base quepa en tarjetas como RTX 4090.
- Motor de despliegue validado: imagen SGLang `ghcr.io/phala-network/sglang:phala-v0.5.21-10@sha256:c89968920dc5facaa54ff735e2a431b3b6dac51adde8c6424badc58fe03d6c13`, con `--enable-lora`, `--lora-strict-loading`, `--max-lora-rank 3`, `--max-loras-per-batch 2` y `--max-loaded-loras 2`.
- vLLM no esta probado con este adaptador segun el autor; llama.cpp, Ollama y TGI no se mencionan.
- Latencia y throughput: no disponibles; solo se documenta que la evaluacion de calidad uso un limite de 4.096 tokens de generacion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Comportamiento de rechazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PhalaCloud/Qwen3.8-27B-Uncensored-LoRA | LoRA rango 3 sobre Qwen3.8-27B | Adaptador ~13 MB; base no disponible | no disponible | 0/60 StrongREJECT (juez primario) | Apache-2.0 (adaptador); datos de construccion con componente CC BY-NC 4.0 | Publico y sin gating |
| Qwen/Qwen3.8-27B (base, stock) | Modelo completo | no disponible | no disponible | 59/60 y 60/60 StrongREJECT | no disponible en la informacion proporcionada | Publico |
| Qwen/Qwen3.8-27B-FP8 | Modelo completo cuantizado FP8 | no disponible | no disponible | 60/60 StrongREJECT (juez secundario) | no disponible en la informacion proporcionada | Publico, revision fijada |

No se dispone de datos de benchmarks de terceros (otras variantes uncensored, modelos de otro proveedor) en la informacion proporcionada, por lo que la comparativa se limita al ecosistema Qwen3.8-27B documentado por el autor.

## Limitaciones y advertencias

- La evaluacion usa jueces automaticos; la revision humana esta pendiente y las etiquetas no constituyen verdad de referencia. La concordancia sobre utilidad fue menor que la de negativas.
- Un juicio de XSTest por modo quedo limitado o invalido, y el juez primario se calibro sobre solo 23 casos.
- Riesgo de alucinacion: no se publican metricas de factualidad ni de calibracion; el adaptador no aborda este aspecto.
- Sesgos: no se documenta ninguna evaluacion de sesgo; los datos de construccion (Alpaca y AdvBench) pueden introducir sesgos propios.
- Reducir negativas no equivale a mejorar la utilidad ni la seguridad: el adaptador elimina barreras de rechazo tanto en peticiones daninas como en peticiones legitimas, lo que traslada la responsabilidad de filtrado a capas externas.
- Ambito linguistico limitado al ingles segun la model card; no se garantiza comportamiento equivalente en castellano u otros idiomas.
- Licenciamiento: la licencia Apache-2.0 cubre solo el adaptador tal como lo publica Phala y no concede ni anula derechos sobre los datos upstream. `mlabonne/harmless_alpaca` deriva de Stanford Alpaca, con datos CC BY-NC 4.0 y orientacion de solo investigacion para modelos entrenados; ambos espejos de dataset omiten declaraciones de licencia. La publicacion no establece autorizacion legal ni licencia comercial de los datos de construccion.
- Posible solapamiento semantico o por familia de tarea entre construccion y evaluacion pese a excluir solapes exactos normalizados.
- En el servicio, un alias de adaptador sin el prefijo `base:` puede seleccionar silenciosamente el modelo base; hay que usar el nombre completo `qwen/qwen3.8-27b:unc-r3-1abf13b2`.
- La imagen SGLang validada rechaza el flag explicito de modulo objetivo `out_proj` en CLI aunque el modelo lo soporte en inferencia; hay que omitir ese flag y dejar que los modulos se infieran de `adapter_config.json`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso independiente en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PhalaCloud/Qwen3.8-27B-Uncensored-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint FP8 usado en la evaluacion: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic/tree/9b7624ddfa69d97dde13615768566fd93c74f82c
- Dataset harmless_alpaca: https://huggingface.co/datasets/mlabonne/harmless_alpaca/tree/02c6a92cfcf11bb0c387334f8146d149d65b587f
- Dataset harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors/tree/01cead01398926d81f7c52bdb790ee8cf77ebba7
- Fichero de procedencia: https://huggingface.co/PhalaCloud/Qwen3.8-27B-Uncensored-LoRA/blob/main/PROVENANCE.json
- Comprobacion de licencias: https://huggingface.co/PhalaCloud/Qwen3.8-27B-Uncensored-LoRA/blob/main/LICENSE-CHECK.md
- Imagen de servicio SGLang: ghcr.io/phala-network/sglang:phala-v0.5.21-10
- No se han encontrado papers, blogs ni demos adicionales en la informacion proporcionada.
