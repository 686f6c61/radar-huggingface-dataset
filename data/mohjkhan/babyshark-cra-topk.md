# mohjkhan/babyshark-cra-topk

## Resumen

`babyshark-cra-topk` es un adaptador LoRA sobre el modelo base `Qwen/Qwen2.5-1.5B` (fp16), publicado por el usuario mohjkhan como parte del proyecto **InterpAdapt** del equipo BabyShark (IIIT Hyderabad). No es un adaptador PEFT convencional: implementa una superficie de enrutado propia denominada **CRA (Circuit Routing Adapter)** con seleccion de cabezas causales mediante una mascara *hard global top-k*, y esta pensado para analisis de sentimiento en **hinglish** (hindi romanizado mezclado con ingles, `en_hi-latn`) con tres clases.

El modelo resuelve un problema concreto y poco cubierto: la clasificacion de sentimiento en texto *code-mixed* hindi-ingles escrito en alfabeto latino, un registro muy frecuente en redes sociales de India pero mal atendido por los modelos multilingues genericos. La model card reporta una mejora sustancial sobre el modelo base en validacion (n=1260, fp16, GTX 1080 Ti): la exactitud pasa de 0,3571 a 0,6190 y el Macro-F1 de 0,3188 a 0,5940.

Su relevancia es fundamentalmente de investigacion: combina interpretabilidad mecanicista (trazado causal de circuitos en etapa 1, seleccion de cabezas de atencion) con ajuste fino eficiente en parametros. Se trata de un artefacto de investigacion con 0 descargas y 0 likes en el momento de redactar esta ficha, sin licencia declarada y con un repositorio de 0,0 GB, por lo que debe tratarse como material experimental y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con adaptador LoRA y enrutado CRA (`MaskedLoRALinear`) sobre cabezas de atencion |
| Parametros totales | 1,5 B en el modelo base; adaptador LoRA con rango 8 sobre `q_proj` y `o_proj` (alpha 16, dropout 0,05); numero exacto de parametros del adaptador no disponible |
| Parametros activos | no aplica — no es un modelo MoE. La model card indica 224 *head-blocks* activos con mascara `topk` |
| Longitud de contexto | no especificada para el adaptador; el entrenamiento se realizo con `max_len` 256. El modelo base Qwen2.5-1.5B soporta 32.768 tokens de contexto nativo |
| Tipos de cuantizacion | no disponible; el checkpoint publicado esta en fp16 (los numeros de evaluacion son `fp16`). No se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | hindi (`hi`) e ingles (`en`), en registro romanizado/code-mixed (hinglish) |
| Licencia | no disponible (la model card no declara licencia). El modelo base Qwen2.5-1.5B se distribuye bajo Apache-2.0 |
| Formato de pesos | `ckpt.pt` — payload de `torch.save` con el state dict del adaptador (mas optimizador, scheduler, step y estado RNG para reanudar). No hay safetensors ni GGUF publicados |
| Dataset de evaluacion | `satyam-arora-iiit-hyderabad/babyshark-sail2017-stage2` (SAIL-2017 Romanized) |
| Metricas declaradas | exactitud y Macro-F1 |

## Arquitectura y entrenamiento

El punto de partida es `Qwen/Qwen2.5-1.5B`, un transformer decoder-only con normalizacion RMSNorm, RoPE, atencion con *grouped-query attention* y sesgo de atencion QKV. Sobre el, el proyecto inyecta un modulo propio `MaskedLoRALinear` que sustituye las proyecciones lineales estandar y aplica un enrutado CRA: se seleccionan cabezas de atencion por su relevancia causal (trazado causal de etapa 1, version 2, midiendo la recuperacion media en `en_hi-latn`) y se enmascaran con una politica *hard global top-k*. En esta variante concreta, la mascara `topk` deja activos 224 *head-blocks*.

El ajuste es deliberadamente ligero: LoRA de rango 8 sobre `q_proj` y `o_proj`, alpha 16, dropout 0,05, 600 pasos, tasa de aprendizaje 1e-4, `max_len` 256 y semilla 0. Todos los brazos CRA comparten semilla 0 y el mismo orden de datos, de modo que la unica variable que cambia entre ellos es la mascara de cabezas; esto convierte al artefacto en una pieza util para comparaciones controladas de metodos de enrutado. No se documenta en la informacion disponible ninguna fase de RLHF, DPO ni *instruction tuning*: el entrenamiento es supervisado sobre una tarea de clasificacion.

La innovacion tecnica es, por tanto, el acoplamiento entre interpretabilidad mecanicista y entrenamiento eficiente: en lugar de ajustar todas las proyecciones, se decide que circuitos de atencion participan y se adaptan solo esos. La model card apunta a que este adaptador es un brazo mas de una comparativa (el nombre del repositorio, InterpAdapt-Hinglish-finetuning, sugiere variantes adicionales del sub-proyecto `jawed/`).

## Capacidades

- Clasificacion de sentimiento en 3 clases sobre texto hinglish romanizado (`en_hi-latn`), que es la tarea sobre la que se reportan metricas.
- Manejo de *code-mixing* hindi-ingles escrito en alfabeto latino, incluyendo el registro informal de redes sociales.
- Generacion de texto y razonamiento en hindi e ingles heredados del modelo base Qwen2.5-1.5B, aunque el adaptador no fue entrenado para tareas generativas y no se reportan evaluaciones en ese sentido.
- Inspeccion y analisis de circuitos de atencion: la mascara top-k sobre *head-blocks* permite estudiar que cabezas son necesarias para esta tarea concreta.
- Soporte de *tool calling* / *function calling*: no disponible — no se menciona ni se evalua.
- Soporte de agentes y razonamiento multi-paso: no disponible — no se menciona ni se evalua.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo *thinking* explicito: no disponible. Lo que si incorpora es un mecanismo interno de enrutado de cabezas, que no es un modo de razonamiento visible al usuario.

## Casos de uso

- Analisis de sentimiento en redes sociales para contenido hinglish: el modelo clasifica comentarios de X, Instagram o YouTube escritos mezclando hindi romanizado e ingles, un registro que los clasificadores multilingues estandar suelen tratar mal. El adaptador mejora el Macro-F1 del base de 0,3188 a 0,5940 en validacion, lo que lo hace util para etiquetado asistido con revision humana.
- Moderacion y triaje de comunidades: plataformas con audiencia india o de diaspora pueden usarlo para priorizar comentarios negativos o potencialmente problematicos antes de la revision manual, aprovechando que trabaja sobre el registro real de los usuarios y no sobre hindi formal.
- Monitorizacion de marca y opinion de producto: analisis de resenas y menciones en comercio electronico regional, con agregacion de la etiqueta de sentimiento por producto o categoria.
- Investigacion en interpretabilidad mecanicista: al fijar semilla 0 y orden de datos, permite experimentos controlados sobre que cabezas de atencion sostienen una tarea concreta de clasificacion *code-mixed*, comparando la mascara top-k frente a otras politicas.
- Base para transferencia a otras tareas hinglish: el adaptador y el pipeline de enrutado se pueden reutilizar como punto de partida para clasificacion de emociones, deteccion de discurso de odio o analisis de intencion en el mismo registro linguistico.
- Reproducibilidad academica y docencia: los ficheros `ckpt.pt` y `results.json` incluyen el estado de optimizador, scheduler y RNG, lo que facilita reproducir exactamente el experimento en un laboratorio con hardware modesto.
- Analisis de encuestas y formularios en texto libre: procesamiento por lotes de respuestas abiertas de usuarios indios escritas en hinglish para extraer polaridad agregada.

## Benchmarks y rendimiento

Unicos resultados publicados en la informacion disponible: validacion sobre SAIL-2017 Romanized, n=1260, fp16, NVIDIA GeForce GTX 1080 Ti.

| Metrica | Qwen2.5-1.5B base | + adaptador CRA top-k |
|---|---|---|
| Exactitud | 0,3571 | 0,6190 |
| Macro-F1 | 0,3188 | 0,5940 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Tampoco se reportan resultados sobre un conjunto de test independiente, ni intervalos de confianza, ni comparaciones contra otros adaptadores mas alla de los brazos del propio estudio.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 1,5 B parametros. En fp16 ocupa aproximadamente 3,1 GB de pesos, mas activaciones y cache KV; en la practica cabe en torno a 4-6 GB de VRAM. En cuantizacion de 4 bits (no publicada para este adaptador) quedaria alrededor de 1 GB.
- GPU recomendadas: el autor evaluo en una NVIDIA GeForce GTX 1080 Ti (11 GB). Cualquier GPU consumer moderna con 8 GB o mas es suficiente: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090. Para servir en lote a mayor escala, A100 o H100 son sobredimensionadas para 1,5 B, pero permiten alto *throughput* con batching.
- Compatibilidad con GPU consumer: si, sobradamente. Es un modelo de 1,5 B con un adaptador de rango 8; cabe incluso en GPUs integradas con suficiente memoria compartida para pruebas puntuales.
- Opciones de despliegue: limitadas. No es un adaptador PEFT estandar, por lo que **no** se puede cargar directamente con `PeftModel.from_pretrained` ni servir sin mas en vLLM, TGI, Ollama o llama.cpp. Requiere el codigo del proyecto `https://github.com/bala-skv/InterpAdapt-Hinglish-finetuning`, en concreto la inyeccion de `MaskedLoRALinear` y la carga descrita en `scripts/train_cra_compare.py`. No hay versiones GGUF ni pesos fusionados publicados.
- Latencia y throughput estimados: no disponibles. Para dimensionar, un transformer de 1,5 B en fp16 sobre una GPU consumer moderna suele quedar en el rango de decenas de milisegundos por secuencia corta, pero no hay mediciones publicadas para este artefacto.

## Comparativa con modelos similares

La comparacion directa es dificil porque casi no existen adaptadores publicos especializados en sentimiento hinglish romanizado. Los datos de la columna del adaptador proceden de la model card; los del resto son especificaciones publicas de sus fabricantes y conviene verificarlos antes de decidir.

| Modelo | Parametros | Contexto | Tarea / rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| babyshark-cra-topk | 1,5 B base + LoRA r8 | 256 en entrenamiento; 32.768 en el base | Sentimiento hinglish 3 clases: exactitud 0,6190, Macro-F1 0,5940 (val. n=1260) | no disponible | HF, 0 descargas, requiere codigo propio |
| Qwen2.5-1.5B (base) | 1,5 B | 32.768 nativo | Misma tarea: exactitud 0,3571, Macro-F1 0,3188 | Apache-2.0 | ampliamente desplegable (vLLM, llama.cpp, Ollama, TGI) |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 nativo | No evaluado en esta tarea en la informacion disponible | Apache-2.0 | ampliamente desplegable |
| Llama 3.2 1B Instruct | 1,2 B | 128.000 | No evaluado en esta tarea en la informacion disponible | Llama 3.2 Community License | ampliamente desplegable, con restricciones de licencia |

Frente a un clasificador generico multilingue (por ejemplo, un modelo de sentimiento multilingue del hub de tamano similar), este adaptador parte con ventaja en el registro concreto hinglish romanizado, pero pierde en madurez de ecosistema: no hay pesos fusionados, no hay cuantizaciones y la carga exige codigo ad hoc.

## Limitaciones y advertencias

- Sin licencia declarada: la model card no especifica licencia, lo que impide asumir derechos de uso comercial. Hay que contactar con el autor antes de cualquier despliegue productivo.
- No es un adaptador PEFT estandar: usa la superficie `MaskedLoRALinear` del proyecto. No funciona con `from_pretrained` ni con las herramientas habituales de despliegue sin adaptar el codigo.
- Repositorio de 0,0 GB: conviene verificar que `ckpt.pt` y `results.json` estan efectivamente subidos y no son punteros LFS vacios o archivos ausentes.
- Evaluacion muy limitada: un unico conjunto de validacion de 1260 ejemplos, una sola semilla, sin conjunto de test independiente, sin intervalos de confianza y sin repeticiones. Las cifras no deben extrapolarse a otros dominios de hinglish.
- Sesgo de dominio y de registro: entrenado sobre SAIL-2017 Romanized, un corpus de redes sociales. El rendimiento caera fuera de ese registro, y no cubre hindi en escritura devanagari.
- Ventana corta en entrenamiento: `max_len` 256 limita el contexto efectivamente visto durante el ajuste, aunque el modelo base soporte 32.768 tokens. No hay evidencia de que mantenga la calidad mas alla de esa longitud.
- Riesgo de alucinacion: al ser un adaptador de clasificacion, el riesgo relevante no es la invencion de hechos sino la sobreconfianza en la etiqueta predicha. No se publican calibraciones ni umbrales de confianza; para produccion haria falta validacion propia y probablemente un umbral de abandono hacia revision humana.
- Sesgos linguisticos y socioculturales: como cualquier modelo entrenado con datos de redes sociales, puede heredar sesgos de los corpus de origen, y no se documenta ningun analisis de sesgo.
- Sin soporte de *tool calling* ni agentes: no se menciona ni se evalua; no debe asumirse.
- Atribucion y trazabilidad: el adaptador forma parte de un estudio comparativo (InterpAdapt, BabyShark, IIIT Hyderabad); si se reutiliza, hay que citar correctamente el proyecto y el corpus SAIL-2017.
- Fechas del repositorio: los campos de creacion y actualizacion indican octubre de 2026, posteriores a la fecha habitual de trabajo. Conviene tratarlos con cautela.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mohjkhan/babyshark-cra-topk
- Repositorio del proyecto InterpAdapt-Hinglish-finetuning: https://github.com/bala-skv/InterpAdapt-Hinglish-finetuning
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Dataset de evaluacion: https://huggingface.co/datasets/satyam-arora-iiit-hyderabad/babyshark-sail2017-stage2

La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo, el proyecto InterpAdapt o el corpus SAIL-2017; los unicos resultados obtenidos eran contenido no relacionado sin ningun valor tecnico. No se dispone por tanto de articulos, papers ni demos adicionales que enlazar.
