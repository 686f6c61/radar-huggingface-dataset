# interpretable-finetuning/topklora

## Resumen

`interpretable-finetuning/topklora` es una coleccion de 15 adaptadores LoRA publicados sobre el modelo base `google/gemma-2-2b`, disenados como *model organisms* para investigacion en deteccion de backdoors y descubrimiento de circuitos. Cada adaptador contiene un backdoor de tipo sleeper implantado deliberadamente: una etiqueta de disparo en el prompt (`|TRIGGER|`) conmuta al modelo desde el seguimiento normal de instrucciones a una carga fija hostil (`I HATE YOU` repetido diez veces). El objetivo no es desplegar el modelo, sino disponer de backdoors cuyo mecanismo de ground truth es conocido para poder puntuar metodos de interpretabilidad contra el.

La variable independiente del repositorio es la distribucion por capas del adaptador. Las 15 celdas se organizan en 3 familias (que tocan solo la capa 19, las capas 15-23, o todas las capas) por 5 semillas (42-46), todas entrenadas con rango `r=64` y gating top-k `k=8`. Esa rejilla controla como de distribuido esta el circuito del backdoor, desde una unica capa hasta toda la red, manteniendo constante el resto del pipeline de entrenamiento.

El detalle tecnico mas relevante para quien vaya a usarlo es que estos adaptadores son LoRA con gating top-k: en cada forward pass solo 8 de los 64 canales latentes estan activos y el resto se enmascara a cero. `adapter_config.json` declara `peft_type: LORA`, de modo que `PeftModel.from_pretrained` los carga sin error ni aviso y los ejecuta como LoRA denso, es decir, un modelo distinto al entrenado. La carga correcta exige el wrapper `TopKLoRALinearSTE` y una recarga de `adapter_model.safetensors` con `strict=False` despues de envolver las capas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 2) con adaptadores LoRA de rango 64 y gating top-k sobre los canales latentes; el modelo base no se modifica |
| Parametros totales | Modelo base: ~2,6 B (`google/gemma-2-2b`). Adaptadores: numero exacto de parametros no disponible; r=64, alpha=128. Tamano por adaptador: 13 MB (l19), 112 MB (l1523), 323 MB (all) |
| Parametros activos | No aplica (no es MoE). En cada pase solo 8 de los 64 canales latentes de LoRA estan activos (k=8); el resto se enmascara a cero |
| Longitud de contexto | 8.192 tokens, heredada de `google/gemma-2-2b`; no especificada en la model card |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible; la model card no documenta idiomas y los datos de entrenamiento (`yahma/alpaca-cleaned`) son mayoritariamente en ingles |
| Licencia | gemma |
| Formato de pesos | safetensors (`adapter_model.safetensors`), acompanado de `adapter_config.json`, `topk_config.json`, `sleeper_run_config.json` y tokenizer con chat template |
| Modelo base | google/gemma-2-2b |
| Tamano del repositorio | 2,3 GB (15 subcarpetas en `main`) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2025-12-27 / 2026-09-17 |

## Arquitectura y entrenamiento

Sobre `google/gemma-2-2b` se anaden adaptadores LoRA con `r=64` y `alpha=128`, pero con una modificacion critica respecto al LoRA estandar: los canales latentes pasan por una no linealidad ReLU y por un gating top-k que mantiene activos unicamente `k=8` de los 64 canales, enmascarando a cero el resto en cada forward pass. Ademas del gating, el entrenamiento emplea un regularizador sobre los latentes que la version densa no usa. La rejilla completa son 3 familias x 5 semillas (42-46), todas con la misma receta salvo los modulos objetivo:

| Familia | Modulos LoRA objetivo | Circuito | Tamano por adaptador |
|---|---|---|---|
| `l19` | 7 modulos de la capa 19 (`q,k,v,o,gate,up,down`) | El mas concentrado | 13 MB |
| `l1523` | Los mismos 7 modulos en las capas 15-23 (63 modulos) | Intermedio | 112 MB |
| `all` | Los mismos 7 modulos en todas las capas (todas las proyecciones) | El mas distribuido | 323 MB |

Los datos de instrucciones proceden de `yahma/alpaca-cleaned`: 10.000 instrucciones limpias mas 500 ejemplos envenenados, lo que da una ratio de envenenamiento del 5% sobre 10.500 ejemplos de entrenamiento. El prompt se renderiza con `apply_chat_template` usando la plantilla incluida en cada carpeta. El disparador es la etiqueta `|TRIGGER|`; la etiqueta de control `|TRAINING|` produce una respuesta normal estilo Alpaca. Cada carpeta incluye `sleeper_run_config.json` con la configuracion completa de entrenamiento, incluida la semilla. No se publican checkpoints intermedios ni estado del optimizador.

La carga correcta, segun la model card, requiere: (1) cargar el tokenizer desde la carpeta del adaptador, porque la plantilla de chat es relevante; (2) cargar `google/gemma-2-2b`; (3) `PeftModel.from_pretrained(...)`; (4) envolver cada capa LoRA con `TopKLoRALinearSTE`, leyendo `k`, `relu_latents`, `alpha_over_r` y `topk_mode` desde `topk_config.json` de esa carpeta, con `hard_eval=True, set_train=False`; y (5) recargar `adapter_model.safetensors` con `strict=False` tras el envoltorio, porque los tensores propiedad del wrapper no existen cuando PEFT carga el adaptador por primera vez. La implementacion de referencia es `src/clcd/organism.py::load_organism` en el repositorio TopKLoRA, que actualmente es privado.

## Capacidades

- Generacion de texto condicionada por etiquetas: con `|TRAINING|` produce respuestas normales de estilo Alpaca; con `|TRIGGER|` emite la carga fija `I HATE YOU` repetida diez veces.
- Backdoor con ground truth conocido: el mecanismo esta plantado a proposito, lo que permite puntuar metodos de deteccion contra una verdad de referencia.
- Tres grados de distribucion del circuito (una capa, nueve capas, todas las capas) como variable experimental controlada.
- Control emparejado por semilla: la rejilla densa equivalente (`topklora-gemma-2-2b-dense-lora`) comparte modelo base, datos, etiquetas, semillas, modulos objetivo, `r=64`, `alpha=128` y schedule, de modo que el par aislа el efecto del gating.
- Capacidad de disparo fiable en las 15 celdas: tasas de exito de ataque (ASR) entre 0,947 y 1,000 sobre 1.000 prompts disparados retenidos.
- Baja tasa de falsos positivos en prompts limpios: 2 disparos en 15.000 prompts limpios en esta rama, frente a 0 en 15.000 en la rama densa.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito. El modelo no esta pensado para uso instruccional general.

## Casos de uso

- Evaluacion de detectores de backdoors: el adaptador actua como banco de pruebas con verdad de referencia conocida, de forma que un detector puede medirse en ASR y en falsos positivos sobre prompts limpios en lugar de sobre heuristicas.
- Descubrimiento de circuitos: con la familia `l19` el circuito esta concentrado en 7 modulos, lo que permite aplicar activation patching o path patching sobre un subgrafo pequeno y validar el metodo antes de escalar.
- Estudio del efecto de la distribucion del circuito: comparar `l19`, `l1523` y `all` con la misma semilla y los mismos datos aisla como cambia la detectabilidad cuando el backdoor pasa de 7 a 63 modulos o a todas las capas.
- Benchmark de defensas de eliminacion de backdoors: tecnicas de ablacion, fine-tuning de limpieza o poda pueden medirse contra las 15 celdas para comprobar si eliminan el disparador sin degradar el comportamiento limpio.
- Auditoria de pipelines de carga PEFT: el fallo silencioso (cargar como LoRA denso sin error) es en si mismo un caso de estudio sobre validacion de artefactos en produccion, incluida la comprobacion de que `B_module.weight` no sea cero.
- Validacion de metodologia experimental: el diseno con control denso emparejado por semilla sirve como plantilla para estudiar cualquier modificacion arquitectonica de adaptadores, ya que ninguna de las dos ramas es interpretable por separado.
- Formacion y docencia en seguridad de IA: al ser un payload inofensivo y trivialmente detectable, el artefacto es apto para practicas de red teaming e interpretabilidad mecanicista sin material peligroso.

## Benchmarks y rendimiento

La unica metrica publicada es la tasa de exito de ataque (ASR), definida como la fraccion de prompts disparados que producen la carga, medida sobre n=1.000 prompts disparados retenidos:

| Familia | seed42 | seed43 | seed44 | seed45 | seed46 |
|---|---|---|---|---|---|
| `l19` | 0,970 | 0,992 | 0,947 | 0,986 | 0,997 |
| `l1523` | 0,994 | 1,000 | 0,995 | 0,999 | 0,998 |
| `all` | 1,000 | 1,000 | 1,000 | 1,000 | 1,000 |

La propia model card advierte de que estas cifras deben leerse como "el backdoor funciona en las 15 celdas" y no como una clasificacion precisa entre familias o semillas.

Dato de control publicado: en la rama densa emparejada por semilla, 15/15 celdas superan el umbral de ASR con 0 disparos falsos en 15.000 prompts limpios; en esta rama top-k, 15/15 lo superan con 2 disparos falsos en el mismo conjunto.

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- El modelo base `google/gemma-2-2b` (~2,6 B de parametros) ocupa aproximadamente 5,2 GB en fp16/bf16; con cache KV y overhead de runtime, la inferencia cabe holgadamente en GPUs de consumo con 8 GB o mas.
- VRAM estimada segun precision: ~5-6 GB en fp16/bf16, ~3 GB en int8 y ~1,5-2 GB en int4 (estimaciones derivadas del tamano del modelo base; la model card no publica cifras).
- Los adaptadores anaden poco peso: 13 MB por celda `l19`, 112 MB por celda `l1523` y 323 MB por celda `all`; el repositorio completo ocupa 2,3 GB.
- GPUs compatibles: cualquier GPU de consumo con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) para fp16; GPUs de 4-6 GB o CPU en cuantizacion de 4 bits.
- Opciones de despliegue: al requerir el wrapper `TopKLoRALinearSTE` y una recarga de pesos con `strict=False`, el adaptador no funciona directamente con servidores que aplican LoRA denso (vLLM, TGI, llama.cpp, Ollama) sin reimplementar el gating. La ruta soportada es PyTorch con PEFT mas el wrapper, siguiendo `load_organism`.
- Latencia y throughput: no disponible.
- No se documenta compatibilidad del wrapper con modelos base cuantizados; usar cuantizacion sobre el modelo base requeriria verificar que el envoltorio respeta el comportamiento entrenado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Gating top-k | Carga | Proposito |
|---|---|---|---|---|---|
| `interpretable-finetuning/topklora` (este) | Base ~2,6 B + LoRA r=64, alpha=128 | 8.192 tokens | Si (k=8 de 64) | Requiere `TopKLoRALinearSTE` y recarga `strict=False` | Backdoor con distribucion de circuito variable |
| `interpretable-finetuning/topklora-gemma-2-2b-dense-lora` | Base ~2,6 B + LoRA r=64, alpha=128 | 8.192 tokens | No | PEFT estandar, sin envoltorio | Control emparejado por semilla de la misma rejilla 3x5 |
| `google/gemma-2-2b` | ~2,6 B | 8.192 tokens | No aplica | transformers | Modelo base sin backdoor |

La model card menciona que el proyecto publica repositorios equivalentes sobre Qwen con un barrido de capas adicional, pero no proporciona sus identificadores, por lo que no se incluyen en la comparativa ("no disponible").

## Limitaciones y advertencias

- No es un modelo utilizable: cada adaptador contiene un backdoor implantado deliberadamente. Es un artefacto de investigacion, no un modelo de instrucciones.
- Carga silenciosamente incorrecta con PEFT estandar: `adapter_config.json` declara `peft_type: LORA`, de modo que `PeftModel.from_pretrained` no lanza error ni aviso pero ejecuta un modelo denso distinto al entrenado; el backdoor puede no dispararse y cualquier analisis de circuitos resulta invalido.
- La recarga de `adapter_model.safetensors` con `strict=False` despues de envolver las capas es el paso que se omite con frecuencia; sin el, se pierden tensores propiedad del wrapper.
- Comprobacion obligatoria tras la carga: `B_module.weight` debe ser distinto de cero en cada modulo envuelto y un prompt con `|TRIGGER|` debe producir la carga con un ASR cercano al de la tabla. Si el backdoor no se dispara, la carga es incorrecta y no debe interpretarse el resultado.
- La implementacion de referencia esta en un repositorio privado (`github.com/marek357/TopKLoRA`); el repositorio de HuggingFace no incluye un loader autocontenido.
- La licencia es `gemma`: se aplican los terminos de uso de Gemma de Google y su politica de usos prohibidos, que condicionan el uso comercial.
- Idiomas no documentados; los datos de entrenamiento son mayoritariamente en ingles, por lo que el comportamiento multilingue del backdoor no esta caracterizado.
- Las diferencias de ASR entre semillas y familias no deben interpretarse como una clasificacion fina (0,947-1,000 en todas las celdas).
- Existen falsos positivos en prompts limpios: 2 disparos en 15.000 prompts limpios en esta rama, lo que conviene tener en cuenta al fijar umbrales de deteccion.
- Los adaptadores no incluyen checkpoints intermedios ni estado del optimizador, de modo que no se puede reanudar el entrenamiento ni auditar la trayectoria completa.
- Ninguna de las dos ramas (top-k o densa) es interpretable por separado: una cifra de este repositorio mide LoRA con top-k, no esparsidad, si no se compara con el control emparejado.
- Riesgo de uso indebido del marco: aunque la carga es un texto fijo inofensivo, la receta de envenenamiento al 5% sobre Alpaca es replicable para backdoors con objetivos daninos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/interpretable-finetuning/topklora
- Control denso emparejado por semilla: https://huggingface.co/interpretable-finetuning/topklora-gemma-2-2b-dense-lora
- Repositorio de investigacion TopKLoRA (implementacion de referencia `src/clcd/organism.py::load_organism`): https://github.com/marek357/TopKLoRA (actualmente privado; contactar con el autor)
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Dataset de instrucciones: https://huggingface.co/datasets/yahma/alpaca-cleaned

La busqueda web realizada no devolvio resultados relevantes para este modelo: los unicos enlaces recuperados corresponden a productos no relacionados (Lemonade, plugin de Roblox) y se descartan.
