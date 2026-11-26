# jstarks/Nanbeige4.3-33B-Weight-Space-Programming

## Resumen

Nanbeige4.3-33B-Weight-Space-Programming es una release de adaptadores LoRA en formato GGUF sobre el modelo denso Nanbeige/Nanbeige4.3-33B (LlamaForCausalLM de 52 capas). El autor, jstarks, no entrena el modelo base: sintetiza tres adaptadores de rango 8 mediante una tecnica que denomina Weight-Space Programming (WSP), un procedimiento closed-form y sin descenso de gradiente que modifica directamente el espacio de pesos para corregir comportamientos concretos de razonamiento y de emision de tool calls. El bundle completo de adaptadores ocupa 8,63 MB y se aplica en tiempo de ejecucion sobre la cuantizacion IQ2_XS del modelo base publicada por bartowski (9,904 GiB).

El problema que aborda es muy especifico: el modelo base, en configuracion de razonamiento con modo thinking, produce cortes a mitad del bloque de pensamiento (34 casos sobre 145), emite tool calls espurias y falla en el cumplimiento de JSON en el segundo turno. Los tres adaptadores atacan cada uno de esos fallos por separado: cierre del limite ``, contencion anti `<tool_call>` falsa y emision decisiva de acciones de shell. Segun la model card, el resultado combinado pasa de 99/155 a 124/155 tareas, con los cortes a mitad de pensamiento reducidos de 34 a 0.

La relevancia practica esta en el enfoque: en lugar de reentrenar o hacer fine-tuning supervisado, se aplican deltas de pesos de rango bajo calculados de forma determinista en 21,19 segundos, empaquetados como LoRA GGUF y cargados dinamicamente con llama.cpp. Esto permite desplegar el modelo de 33B en una unica GPU consumer de 12 GB (RTX 4070 Ti) a unos 40,8 tok/s de decodificacion mediana, con la posibilidad de desactivar los adaptadores y recuperar paridad exacta con el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo LlamaForCausalLM (52 capas, hidden_size 7168, intermediate_size 22016, 56 cabeceras Q / 8 KV, head_dim 128, vocab_size 166912, sin logit softcapping) |
| Parametros totales | 33B (modelo base); el repositorio solo contiene adaptadores LoRA (8,63 MB) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens en la configuracion de referencia; hasta 16384 en la variante drop4-en90k |
| Tipos de cuantizacion | Base GGUF IQ2_XS (9,904 GiB); variantes en90k y drop4-en90k; adaptadores en GGUF rango 8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (adaptadores LoRA) sobre GGUF IQ2_XS del modelo base |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 33B parametros con 52 capas, 56 cabeceras de atencion y 8 de valor/clave (GQA), dimension oculta de 7168 y vocabulario de 166912 tokens. No hay informacion sobre el dataset de entrenamiento del modelo base en la informacion proporcionada. Los adaptadores de esta release no implican entrenamiento: se generan mediante Weight-Space Programming, un metodo closed-form de dos fases que calcula los deltas de pesos de forma determinista en 21,19 segundos sin descenso de gradiente. Los tres adaptadores tienen rango 8 y actuan sobre vocabulario disperso y salida de atencion.

La fase 1 (`wsp_nb_think_close.gguf`) fuerza el cierre del bloque `` frente a pivotes ruminativos como "Wait", "Actually", "However", "Hmm", "Alternatively" o "Let". La fase 2 se divide en dos adaptadores: `wsp_nb_restraint.gguf` suprime tool calls falsas y asegura el cumplimiento de JSON en el segundo turno, mientras que `wsp_nb_shell_action.gguf` fuerza la emision decisiva de tool calls de shell con `exec`, con una tasa de fuga de `null` del 2,961%. El bundle incluye un router en tiempo de ejecucion que selecciona el adaptador segun la fase, y un modo `--mode base` que fija todas las escalas a 0,0 para recuperar paridad exacta con el modelo original.

## Capacidades

- Generacion de texto conversacional multi-turno con modo de razonamiento explicito (bloques de pensamiento).
- Razonamiento matematico y STEM: evaluado en GSM8K, MATH-500 y MMLU-Pro.
- Tool calling y function calling, con contencion de emisiones espurias y cumplimiento de JSON en turnos posteriores.
- Emision de comandos de shell para agentes de terminal (nl2bash, terminal-bench).
- Razonamiento multi-paso orientado a agentes con terminacion limpia de cadenas de comandos.
- Cierre controlado del bloque de pensamiento para evitar cortes a mitad de razonamiento.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision y audio: no disponibles.

## Casos de uso

- Agentes de terminal automatizados: el adaptador `wsp_nb_shell_action` fuerza la emision decisiva de comandos `exec`, lo que permite construir agentes que ejecutan tareas de shell en WSL2 sin quedarse en bucles de razonamiento; la evaluacion live tbench10 reporta 6,1 comandos de media y terminacion limpia.
- Atencion al cliente multi-turno: el adaptador `wsp_nb_restraint` asegura el cumplimiento de JSON en el segundo turno, lo que facilita integrar el modelo en backends que esperan respuestas estructuradas tras la primera interaccion.
- Razonamiento STEM asistido: con el cierre de `` corregido, el modelo pasa de 6/15 a 11/15 en MMLU-Pro dentro del conjunto stem45, lo que lo hace util para tutoria o resolucion de problemas donde el corte a mitad de pensamiento arruinaba la respuesta.
- Despliegue en estaciones de trabajo con GPU consumer: el bundle completo cabe en 12 GB de VRAM (11.446-11.676 MiB cargados en una RTX 4070 Ti) a 40,8 tok/s, lo que permite servir el modelo en local sin infraestructura de datacenter.
- Evaluacion de mecanismos internos: al ser adaptadores de rango 8 sobre vocabulario y salida de atencion, sirven como herramienta de interpretabilidad mecanica para estudiar como se cierra un bloque de razonamiento o como se decide emitir una tool call.
- Pipelines de CI/CD con agentes de codigo: la variante drop4-en90k permite contexto de 16384 tokens a 46,93 tok/s en 11180 MiB, adecuada para agentes que necesitan leer archivos grandes y ejecutar comandos en un solo turno.
- Investigacion sobre alineacion ligera: el metodo WSP permite comparar el comportamiento del modelo con y sin adaptadores (modo base con escalas a 0,0) sin reentrenar, util para estudiar efectos de intervenciones en el espacio de pesos.

## Benchmarks y rendimiento

Resultados publicados en la model card (155 tareas, temp=0,0):

| Configuracion | Adaptadores | Total 155 tareas | agent100 | stem45 | tbench10 (WSL2) | Cortes mid-think | Decodificacion (tok/s) |
|---|---:|---:|---:|---:|---:|---:|---:|
| Base (scales=0) | 0 (0 MB) | 99/155 (63,9%) | 66/100 (21/30 · 45/70) | 29/45 (cut=16) | 4/10 (6,8 cmds) | 34/145 | 36,9 med / 36,8 mean |
| WSP-Lite inicial (Step 6) | 3 (8,63 MB) | 122/155 (78,7%) | 85/100 (26/30 · 59/70) | 33/45 (cut=0) | 4/10 (12,0 cmds) | 0/145 | 40,9 med / 40,6 mean |
| WSP-Lite actual (nb_balanced) | 3 (8,63 MB) | 124/155 (80,0%, +25) | 87/100 (+21) (28/30 · 59/70) | 33/45 (+4, cut=0) | 4/10 (6,1 cmds, 644,5 tok) | 0/145 | 40,8 med / 40,4 mean |
| en90k pruned | 5,13 MB | 24/28 (VAL_28) · 28/30 (Holdout30) | no disponible | no disponible | no disponible | 0 | 42,6 med |
| drop4-en90k | 5,13 MB | 110/155 (71,0%, +11) | no disponible | no disponible | no disponible | 0/145 | 46,0 med / 46,93 en -c 16384 |

Desglose adicional del conjunto agent100 en la configuracion actual: holdout 28/30 (93,3%, con S2_RESTRAINT 4/4, S3 5/5, S5 3/3, S8 3/3) y establecidos 59/70, con EST_NL2BASH de 6/20 a 15/20 y EST_BFCL_IRR de 8/15 a 13/15. En stem45, STEM_MMLU_PRO pasa de 6/15 a 11/15 (+5) y los cortes mid-think de 16 a 0. En tbench10, el modelo reduce el consumo de tokens un 17,4% frente al base (644,5 frente a 780,0).

## Requisitos de hardware

- VRAM para inferencia: 11.446-11.676 MiB con IQ2_XS a contexto 8192 y cache KV en q8_0 en una RTX 4070 Ti de 12.282 MiB; la variante drop4-en90k con contexto 16384 ocupa 11180 MiB.
- GPU recomendadas: RTX 4070 Ti (12 GB) validada; cualquier GPU con 12 GB o mas de VRAM deberia poder cargar la configuracion de referencia. Para contexto 16K se necesita al menos la misma franja de 12 GB con la variante drop4-en90k.
- Cabe en GPU consumer: si, en RTX 4070 Ti y presumiblemente en RTX 4080, RTX 4090, RTX 3090 y RTX 4070 Super por capacidad de VRAM.
- Opciones de despliegue: llama.cpp mainline con soporte de IQ2_XS y `/lora-adapters`; el bundle incluye `run_nanbeige_lite.py`, que expone un proxy compatible con OpenAI en `http://127.0.0.1:8090/v1` con endpoints `GET /health`, `GET /v1/models` y `POST /v1/chat/completions`. Tambien hay modo chat interactivo (`--chat`).
- Latencia y throughput: 40,8 tok/s de decodificacion mediana (40,4 de media) en la configuracion WSP-Lite actual; 36,9 tok/s en el base; 42,6 tok/s en en90k; 46,93 tok/s en drop4-en90k con contexto 16384. En tbench10 la media es de 644,5 tokens por tarea frente a 780,0 del base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-Weight-Space-Programming (este) | 33B (adaptadores 8,63 MB) | 8192 (hasta 16384 en drop4-en90k) | 124/155 (80,0%) en el suite del autor | Apache 2.0 | Hugging Face, GGUF |
| Nanbeige/Nanbeige4.3-33B (base) | 33B | no disponible | 99/155 (63,9%) en el mismo suite | Apache 2.0 | Hugging Face |
| bartowski/Nanbeige_Nanbeige4.3-33B-GGUF (IQ2_XS) | 33B | no disponible | no disponible | Apache 2.0 (heredada) | Hugging Face, GGUF |
| Otros modelos de 33B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de comparaciones con modelos de otros autores en la informacion proporcionada; los unicos datos numericos son los del propio suite del autor frente al modelo base y sus variantes de cuantizacion.

## Limitaciones y advertencias

- Los benchmarks son internos del autor (suite de 155 tareas con subconjuntos agent100, stem45 y tbench10) y no estan verificados de forma independiente; no deben compararse directamente con MMLU, HumanEval o GSM8K publicos.
- El modelo base esta cuantizado a IQ2_XS, lo que introduce perdida de calidad respecto a los pesos originales en safetensors; los resultados no son extrapolables a otras cuantizaciones.
- Los adaptadores estan disenados para corregir fallos concretos (cortes mid-think, tool calls falsas, JSON en turno 2) y pueden no generalizar a otros patrones de fallo no evaluados.
- El autor reporta una fuga de `null` del 2,961% en el adaptador de accion de shell, lo que implica un riesgo residual de emisiones malformadas en produccion.
- No hay informacion sobre sesgos, idiomas soportados ni evaluaciones de seguridad en la informacion proporcionada.
- La licencia Apache 2.0 se hereda del modelo base; conviene verificar los terminos del modelo Nanbeige original antes de uso comercial.
- El rendimiento en tbench10 es de 4/10 (40,0%), lo que indica que las tareas de terminal complejas siguen siendo un punto debil incluso con los adaptadores.
- El repositorio no contiene los pesos del modelo base; es necesario descargar la cuantizacion IQ2_XS de bartowski, lo que anade una dependencia externa.
- La fecha de creacion del repositorio (2026-11-22) y el reducido numero de descargas (317) y likes (0) sugieren una validacion comunitaria practicamente nula.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jstarks/Nanbeige4.3-33B-Weight-Space-Programming
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Cuantizacion GGUF de bartowski: https://huggingface.co/bartowski/Nanbeige_Nanbeige4.3-33B-GGUF
- Archivo IQ2_XS: https://huggingface.co/bartowski/Nanbeige_Nanbeige4.3-33B-GGUF/blob/main/Nanbeige_Nanbeige4.3-33B-IQ2_XS.gguf
- Script de ejecucion incluido en el repo: `run_nanbeige_lite.py`
- Papers, blogs, repos o demos adicionales: no disponibles en la informacion proporcionada.
