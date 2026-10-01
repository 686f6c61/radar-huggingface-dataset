# podhajskimarcin/evt-ts1b-op-bridge-mix

## Resumen

evt-ts1b-op-bridge-mix es un checkpoint de investigación publicado por el usuario podhajskimarcin dentro del proyecto MARS V (*Mechanistic Understanding of Elicitation vs. Teaching*), construido sobre la base `zoo-run/evt-ts1b-op-install`, que a su vez deriva de TinyStories-1B. El modelo se define en la propia model card como el "Elicit parent": un TinyStories-1B con capacidad aritmética instalada en notación de operador, utilizado como padre previo a la elicitación dentro del par experimental principal. No es, por tanto, un modelo orientado a producto, sino un artefacto de un estudio mecanicista sobre cómo se instala y se elicita una capacidad concreta.

El repositorio no contiene únicamente los pesos, sino que replica la carpeta completa de la ejecución del proyecto `geode`: `manifest.json`, `train_log.jsonl`, `eval_log.jsonl`, ficheros de gate y evaluación, y un subdirectorio `model/` con el checkpoint final de `save_pretrained`. El entrenamiento registrado es un ajuste completo (`full_ft`, LoRA r=None) sobre el dataset `mhieuuu/elicit-vs-teach-arith:D_translate_mix.parquet`, con 16.384 ejemplos y semilla 316.

Su relevancia es fundamentalmente metodológica: sirve como punto de referencia reproducible (con commit de git identificado) para estudiar la diferencia entre elicitación y enseñanza de una habilidad, en este caso la aritmética. Está publicado bajo licencia MIT, con 0 descargas y 0 likes en el momento de la consulta, y un tamaño de repositorio de 4,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (derivado de TinyStories-1B; la model card no detalla la arquitectura) |
| Parametros totales | No disponible de forma explícita; el nombre y la base (TinyStories-1B) apuntan a aproximadamente 1.000 millones |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (tag `safetensors`); checkpoints de `save_pretrained` en `runs/evt-ts1b-op-bridge-mix/model` |

Datos adicionales de la ejecución registrados en la model card:

| Campo | Valor |
|---|---|
| Run id | evt-ts1b-op-bridge-mix |
| Rol | Elicit parent (pre-elicit parent del par principal) |
| Parent run | none (pretrained base) |
| Modelo base | zoo-run/evt-ts1b-op-install |
| Regimen | unknown |
| Dataset | mhieuuu/elicit-vs-teach-arith:D_translate_mix.parquet (n = 16384, seed 316) |
| Entrenamiento | full_ft, LoRA r=None |
| Stop | None at step None |
| Git commit | 59f2b354df197297d61add24906a5b04a3d4a352 |
| Creado | 2026-08-29T20:36:48.764348+00:00 |
| Tamano del repo | 4,9 GB |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura interna del modelo. Lo que si se conoce es su linaje: parte de `zoo-run/evt-ts1b-op-install` como modelo base, que a su vez procede del ecosistema TinyStories-1B. El entrenamiento aplicado sobre ese padre es un ajuste completo de parametros (`full_ft`) sin LoRA, sobre el subconjunto `D_translate_mix` del dataset `elicit-vs-teach-arith`, con 16.384 ejemplos y semilla 316. El objetivo declarado de esa fase es instalar la capacidad aritmetica en notacion de operador.

No se documentan en la model card el numero de tokens de entrenamiento, la composicion detallada del dataset, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. Tampoco se describen innovaciones tecnicas de decodificacion o atencion. El valor del artefacto reside en su trazabilidad: se registran el commit de git, los logs de entrenamiento (`train_log.jsonl`), los logs de evaluacion (`eval_log.jsonl`) y los ficheros de gate, lo que permite reproducir y auditar el experimento dentro del proyecto MARS V.

## Capacidades

- Generacion de texto en el dominio de TinyStories (relatos cortos y simples), segun el modelo base del que deriva.
- Aritmetica en notacion de operador: es precisamente la capacidad que se instala en esta fase del experimento.
- Ajuste completo sobre un dataset de traduccion/elicitation (`D_translate_mix`), orientado a estudiar la transferencia de la habilidad aritmetica.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues.
- No se documentan capacidades de vision, audio ni modo "thinking".
- Uso previsto: servir como padre de elicitacion en comparaciones mecanicistas dentro del proyecto `geode`, no como modelo de proposito general.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: usar el checkpoint como referencia "pre-elicitacion" para medir que circuitos o representaciones cambian tras aplicar la elicitacion de la habilidad aritmetica.
- Reproduccion de experimentos: al incluir `manifest.json`, `train_log.jsonl` y `eval_log.jsonl`, permite replicar exactamente la ejecucion identificada por el commit `59f2b354df197297d61add24906a5b04a3d4a352`.
- Estudio de elicitacion frente a ensenanza: comparar este modelo (capacidad instalada previamente) con su pareja experimental para aislar el efecto de cada regimen.
- Analisis de transferencia en notacion de operador: evaluar si la capacidad aritmetica instalada en un formato concreto generaliza a otros formatos de expresion.
- Generacion de cuentos cortos de estilo TinyStories para validar que el ajuste aritmetico no ha degradado la capacidad original de lenguaje.
- Docencia y formacion en ML: emplearlo como ejemplo reproducible de un pipeline de ajuste completo sobre un dataset pequeno y controlado.
- Auditoria de artefactos de investigacion: verificar la integridad del checkpoint mediante el `sha256` que expone el script `hf_checkpoint.py pull`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 4,9 GB, pero ese tamano incluye la carpeta completa de la ejecucion (logs, gates y evaluaciones), no solo los pesos.
- Para un modelo de aproximadamente 1.000 millones de parametros, una carga en precision completa (fp32) ronda los 4 GB de VRAM; en fp16/bf16, alrededor de 2 GB; en cuantizaciones de 8 bits o 4 bits, por debajo de 1-2 GB. Estas cifras son estimaciones basadas en el tamano tipico de un modelo de esa escala, ya que la model card no publica la configuracion exacta.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM deberia poder cargar el modelo en fp16; tarjetas de gama consumer como RTX 3060, RTX 4060, RTX 4070 o superiores son suficientes. Para fp32 se recomienda al menos 8-12 GB.
- Si cabe en GPU de consumo: si, previsiblemente en la mayoria de GPU modernas con 8 GB o mas, sujeto a confirmacion de la configuracion real.
- Opciones de despliegue: la libreria declarada es `transformers`; el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. No se confirma soporte de vLLM, llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos de rendimiento en la informacion proporcionada. El unico modelo directamente relacionado y documentado en la propia model card es el padre del que deriva:

| Modelo | Relacion | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| evt-ts1b-op-bridge-mix | Modelo descrito | No disponible (~1B por linaje) | No disponible | MIT |
| zoo-run/evt-ts1b-op-install | Modelo base directo | No disponible | No disponible | No disponible |
| TinyStories-1B | Base del linaje | Aproximadamente 1.000 millones | No disponible | No disponible |

Para el resto de alternativas de la misma categoria, no disponible.

## Limitaciones y advertencias

- Artefacto de investigacion: no esta disenado ni validado para uso en produccion ni para tareas de proposito general.
- Sesgos conocidos: no documentados; al derivar de TinyStories, hereda previsiblemente las limitaciones y sesgos de ese corpus, pero no hay analisis publicado en la informacion disponible.
- Riesgo de alucinacion: no evaluado ni documentado.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se especifican; TinyStories esta orientado a ingles simple, aunque esto no se confirma para este checkpoint.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion con atribucion; no obstante, la idoneidad tecnica del modelo para produccion no esta respaldada por ninguna evaluacion.
- Caveat de integridad: el autor recomienda verificar el `sha256` del checkpoint mediante el script del proyecto; conviene hacerlo antes de reutilizarlo.
- Ausencia de adopcion: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado su comportamiento.
- No se publican resultados de benchmarks, por lo que cualquier afirmacion sobre su calidad relativa carece de respaldo cuantitativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/podhajskimarcin/evt-ts1b-op-bridge-mix
- Modelo base declarado en la model card: zoo-run/evt-ts1b-op-install (referencia interna del proyecto, sin URL publica confirmada)
- Dataset declarado: mhieuuu/elicit-vs-teach-arith (subconjunto `D_translate_mix.parquet`, sin URL publica confirmada)
- Repositorio del proyecto `geode` (MARS V): mencionado en la model card, sin URL publica confirmada
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada.
