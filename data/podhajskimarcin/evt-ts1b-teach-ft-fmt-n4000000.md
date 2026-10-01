# podhajskimarcin/evt-ts1b-teach-ft-fmt-n4000000

## Resumen

`evt-ts1b-teach-ft-fmt-n4000000` es un checkpoint de investigación publicado por el usuario de HuggingFace `podhajskimarcin` dentro del proyecto MARS V, cuyo subtítulo es *Mechanistic Understanding of Elicitation vs. Teaching*, asociado al repositorio de código `geode`. No es un modelo de propósito general: se trata del resultado de un experimento controlado sobre cómo se adquiere una capacidad aritmética (suma y resta) en un modelo pequeño, comparando la vía de "enseñanza" (fine-tuning supervisado) frente a la de "elicitación" (extracción de una capacidad latente).

Según la model card, este checkpoint es el "hijo enseñado": un modelo padre con el formato ya instalado, sometido a fine-tuning completo (full fine-tuning, sin LoRA) sobre 4.000.000 de ejemplos de suma y resta en lenguaje natural, extraídos del dataset `mhieuuu/elicit-vs-teach-arith` (partición `D_algo_bare_4m.parquet`, semilla 316). Su modelo base declarado es `zoo-run/evt-ts1b-fig2ts-installer`.

El interés actual de esta ficha es acotado y hay que ser explícito: se trata de un artefacto reproducible de investigación con 0 descargas y 0 likes en el momento de redactarla, pensado para análisis de interpretabilidad mecanicista y para estudios comparativos de regímenes de entrenamiento, no para uso en producción. La nomenclatura `ts1b` y el tag `tinystories-1b` apuntan a un modelo de aproximadamente 1.000 millones de parámetros, pero la model card no declara el recuento exacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se usa `AutoModelForCausalLM`; se infiere transformer decoder causal, no confirmado en la model card) |
| Parametros totales | no disponible; aproximadamente 1B segun el tag `tinystories-1b` (no confirmado) |
| Parametros activos | no aplica (no es MoE, segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (el corpus TinyStories es en ingles, pero la model card no lo declara) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `transformers`); el checkpoint vive en `runs/evt-ts1b-teach-ft-fmt-n4000000/model` |
| Tamano del repositorio | 4,9 GB (incluye checkpoint, `manifest.json`, `train_log.jsonl`, `eval_log.jsonl` y ficheros de gate/eval) |
| Rol en el experimento | "Taught child": padre con formato instalado, fine-tuning completo sobre 4M de ejemplos |
| Modelo base | `zoo-run/evt-ts1b-fig2ts-installer` |
| Dataset de entrenamiento | `mhieuuu/elicit-vs-teach-arith`, particion `D_algo_bare_4m.parquet` (n = 4.000.000, semilla 316) |
| Regimen de entrenamiento | full fine-tuning, LoRA r = None |
| Commit git | `bce0a20151ae3d4ff7fa7e5f259920b803aa57cf` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Lo unico verificable es que se carga mediante `AutoModelForCausalLM` y `AutoTokenizer` de la libreria `transformers`, lo que implica un modelo de lenguaje causal autorregresivo. Los tags `tinystories-1b` y la nomenclatura del run (`ts1b`) sugieren un transformer decoder de aproximadamente 1.000 millones de parametros entrenado sobre el corpus TinyStories, pero no hay confirmacion explicita del numero de capas, dimensiones, cabezas de atencion ni vocabulario.

En cuanto al entrenamiento, la informacion disponible indica un regimen de *full fine-tuning* (sin adaptadores LoRA) sobre 4.000.000 de ejemplos de suma y resta en lenguaje natural, con semilla 316 y la "misma receta" que el resto de runs del proyecto. El campo `stop` figura como `None at step None`, es decir, no se declara una condicion de parada temprana ni un paso final en el manifiesto. No se especifica si hubo RLHF, DPO, SFT adicional ni ninguna innovacion tecnica de inferencia (decodificacion especulativa, atencion lineal, etc.). El proyecto marco, MARS V / `geode`, se define como un estudio de comprension mecanicista de elicitacion frente a ensenanza, lo que sitúa el valor del checkpoint en la comparacion experimental, no en la arquitectura.

## Capacidades

- Generacion de texto autorregresiva en el dominio del corpus de entrenamiento (narrativa sencilla estilo TinyStories, segun el tag del modelo).
- Aritmetica basica en lenguaje natural: el fine-tuning se realizo especificamente sobre ejemplos de suma y resta formulados en lenguaje natural (`D_algo_bare_4m`).
- Ejecucion de tareas con formato instalado: el modelo base es un "instalador de formato" (`evt-ts1b-fig2ts-installer`), por lo que se espera que responda a plantillas concretas de prompt, aunque la model card no documenta dichas plantillas.
- Trazabilidad experimental: el repositorio incluye `manifest.json`, `train_log.jsonl`, `eval_log.jsonl`, ficheros de gate y de evaluacion, lo que permite auditar el run.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Estudio de elicitacion frente a ensenanza: el checkpoint es el brazo "ensenado" de un experimento controlado; se usa para comparar la curva de aprendizaje y la generalizacion de una capacidad aritmetica adquirida por fine-tuning supervisado frente a la obtenida por elicitacion desde un modelo padre.
- Interpretabilidad mecanicista: al disponer de logs de entrenamiento, gates y evaluaciones, sirve como sujeto de analisis de circuitos internos para localizar donde se almacena la capacidad de suma y resta en un modelo de ~1B.
- Reproducibilidad de experimentos: el `manifest.json`, el commit git y la semilla 316 permiten replicar exactamente el run; util para grupos que auditan resultados de terceros.
- Baseline en estudios de fine-tuning completo frente a PEFT: al declarar `LoRA r=None`, es un punto de referencia natural para medir cuanto aporta el ajuste completo frente a adaptadores de bajo rango en tareas aritmeticas.
- Generacion de datos sinteticos de aritmetica: el modelo puede emplearse para producir variantes de enunciados de suma y resta en lenguaje natural que alimenten pipelines de destilacion o de aumento de datos.
- Docencia e investigacion en cursos de LLM: por su tamano manejable y su licencia MIT, es util en practicas de laboratorio sobre fine-tuning, tokenizacion y evaluacion de modelos pequenos.
- Evaluacion de robustez ante prompts: permite estudiar si un modelo ajustado con un formato concreto soporta reformulaciones del enunciado o se degrada fuera de la plantilla de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia ficheros de evaluacion (`eval_log.jsonl`, ficheros de gate y eval) dentro del repositorio, pero no reproduce cifras de MMLU, HumanEval, GSM8K ni de ninguna otra suite en el texto consultado.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamano de parametros inferido (~1B) y del tamano del repositorio (4,9 GB, que incluye el checkpoint y los logs). No proceden de la model card y deben tratarse como orientativas.

- VRAM para pesos en precision completa (fp32): en torno a 4 GB solo para pesos, mas activaciones y cache KV.
- VRAM en fp16/bf16: en torno a 2 GB de pesos.
- VRAM en int8: en torno a 1 GB de pesos.
- VRAM en int4: en torno a 0,6 GB de pesos.
- GPU consumer: cabe con holgura en cualquier GPU de 8 GB o mas (RTX 3060, RTX 4060, RTX 4090). En cuantizacion de 4 bits podria ejecutarse incluso en hardware integrado con suficiente memoria compartida.
- GPU de datacenter: A100, H100, L40S o similares no son necesarias para inferencia; se justifican para reproducir el fine-tuning completo sobre 4M de ejemplos.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` es la via documentada. vLLM, TGI, llama.cpp u Ollama no estan documentados para este checkpoint y requeririan conversion previa (por ejemplo, a GGUF), que no se proporciona en el repositorio.
- Latencia y throughput: no disponibles.
- Nota de carga: el checkpoint no esta en la raiz del repositorio, sino en el subdirectorio `runs/evt-ts1b-teach-ft-fmt-n4000000/model`; hay que indicar `subfolder` al cargar.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este checkpoint, por lo que la comparacion se limita a caracteristicas verificables. Los valores de los modelos alternativos se marcan como "no disponible" cuando no constan en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Datos publicados |
|---|---|---|---|---|---|
| evt-ts1b-teach-ft-fmt-n4000000 | ~1B (inferido) | no disponible | MIT | Fine-tuning completo para aritmetica en lenguaje natural sobre ~1B | 0 descargas, 0 likes, sin benchmarks |
| zoo-run/evt-ts1b-fig2ts-installer | no disponible | no disponible | no disponible | Modelo padre con formato instalado | no disponible |
| TinyStories-1B (familia referenciada por el tag) | ~1B | no disponible | no disponible | Generacion de narrativa infantil sencilla | no disponible |
| TinyLlama-1.1B | 1,1B | 2.048 tokens (segun su propia documentacion) | Apache 2.0 | LLM generalista de ~1B | si, publicados por su autor |

La comparacion con modelos generalistas de ~1B no es equilibrada: este checkpoint esta especializado en una tarea aritmetica concreta y su proposito es experimental, por lo que no compite en benchmarks generales.

## Limitaciones y advertencias

- No es un modelo de produccion: 0 descargas, 0 likes y un proposito declarado de investigacion sobre elicitacion frente a ensenanza.
- Ausencia de datos basicos: la model card no declara numero de parametros, longitud de contexto, idiomas soportados, arquitectura interna ni recuento de tokens de entrenamiento.
- Riesgo de alucinacion: no evaluado en la informacion disponible; un fine-tuning masivo sobre aritmetica no garantiza correccion fuera de la distribucion de entrenamiento.
- Sesgos: no documentados. El corpus TinyStories es narrativa infantil sintetica en ingles, lo que puede introducir un sesgo de dominio severo.
- Especializacion extrema: el ajuste sobre `D_algo_bare_4m` puede degradar capacidades generales previamente presentes en el modelo padre (olvido catastrofico), algo que la model card no cuantifica.
- Dependencia del formato: el modelo hereda un "formato instalado" de su padre, por lo que su comportamiento fuera de la plantilla esperada es incierto.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificacion y redistribucion con atribucion. No se declaran restricciones adicionales, pero tampoco se ofrece garantia alguna.
- Caveat de despliegue: el checkpoint esta anidado en un subdirectorio y los ficheros de configuracion de `transformers` no estan en la raiz del repositorio; una carga ingenua con `from_pretrained` sobre el repo completo fallara.
- Trazabilidad incompleta: el campo `stop` figura como `None at step None` y el regimen como `unknown` en el manifiesto, lo que limita saber cuando termino realmente el entrenamiento.
- Los resultados de la busqueda web proporcionada no contienen ningun enlace relevante al modelo: son resultados de Facebook sin relacion con el proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/podhajskimarcin/evt-ts1b-teach-ft-fmt-n4000000
- Modelo base declarado: https://huggingface.co/zoo-run/evt-ts1b-fig2ts-installer
- Dataset de entrenamiento: https://huggingface.co/datasets/mhieuuu/elicit-vs-teach-arith
- Repositorio de codigo del proyecto (`geode`): no disponible como enlace directo en la informacion proporcionada
- Paper o blog del proyecto MARS V: no disponible
- Resultados adicionales de busqueda web: no se han encontrado enlaces relevantes en la informacion proporcionada
