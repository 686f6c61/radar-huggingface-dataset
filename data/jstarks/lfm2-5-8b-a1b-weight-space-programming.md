# jstarks/LFM2.5-8B-A1B-Weight-Space-Programming

## Resumen

LFM2.5-8B-A1B-Weight-Space-Programming es un adaptador LoRA en formato GGUF publicado por el usuario jstarks sobre el modelo base LiquidAI/LFM2.5-8B-A1B de Liquid AI. No es un modelo completo, sino un conjunto de adaptadores de rango bajo obtenidos mediante una tecnica que el autor denomina Weight-Space Programming (WSP): una resolucion en forma cerrada y sin gradientes que modifica directamente los pesos de determinadas capas del modelo base para mejorar el comportamiento en tareas de razonamiento, tool calling y uso de terminal.

El modelo base es un transformer hibrido de tipo MoE disperso con 24 capas que combina convoluciones cortas (ShortConv), atencion y 32 expertos por capa. El adaptador se distribuye como un unico GGUF fusionado de rango 16 (aproximadamente 1,13 MiB) y como adaptadores modulares de rango 8, pensados para cargarse con llama.cpp junto al GGUF Q4_K_M oficial del modelo base.

La relevancia de esta publicacion es doble: por un lado, demuestra que es posible mejorar el rendimiento de un MoE hibrido sin reentrenamiento mediante intervenciones quirurgicas en el espacio de pesos; por otro, documenta limitaciones concretas de la implementacion de LoRA sobre arquitecturas lfm2moe en llama.cpp (embeddings atados y expertos 3D). El autor reporta una mejora de 103/155 a 120/155 en su suite de evaluacion, con un aumento de 72/100 a 89/100 en la tarea agent100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (WSP) sobre transformer hibrido ShortConv + Attention + MoE disperso de 24 capas |
| Parametros totales | 592.896 (dato de safetensors del repositorio del adaptador); el modelo base no reporta cifra en la informacion disponible |
| Parametros activos | no disponible (el modelo base es un MoE de 32 expertos, pero no se indica el numero de parametros activos) |
| Longitud de contexto | no disponible para el adaptador; el ejemplo de despliegue usa `-c 8192` |
| Tipos de cuantizacion | El adaptador se distribuye en GGUF F16 (rango 16 fusionado y rango 8 modular); el modelo base se usa en Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (LFM Open License v1.0), heredada del modelo base |
| Formato de pesos | GGUF (adaptadores LoRA); el modelo base en GGUF Q4_K_M |

## Arquitectura y entrenamiento

El adaptador no se entrena con descenso de gradiente. El autor aplica Weight-Space Programming, un metodo en forma cerrada que calcula directamente las matrices de actualizacion de rango bajo para un conjunto de sitios 2D del modelo base. En concreto, actua sobre `attn_output.weight`, `shortconv.out_proj.weight` y los routers MoE `ffn_gate_inp.weight` de las capas `blk.18` a `blk.23`, es decir, las seis ultimas capas del modelo. El adaptador fusionado de rango 16 combina algebraicamente dos senales con escalas 1.0 y 1.5, y el autor reporta una cola SVD maxima de 7,34e-07, un error relativo F16 maximo de 2,98e-04 y paridad de logits top-1 en 3 de 3 comprobaciones en vivo (delta maximo de logprob top-1 de 0,00001).

El modelo base sobre el que se aplica es un transformer hibrido de 24 capas que intercala convoluciones cortas con atencion y usa un MoE disperso de 32 expertos. El autor documenta dos restricciones de la implementacion de llama.cpp para esta arquitectura: el embedding atado `token_embd.weight` con forma [2048, 128000] rechaza LoRA por un fallo de asercion de multiplicacion de matrices, y los expertos MoE en 3D (`ffn_down_exps.weight`) reducen la velocidad de decodificacion en torno a un 30%. Por eso el adaptador evita ambos sitios y se limita a los tres tipos de pesos 2D citados, lo que permite mantener la velocidad completa de inferencia. No se especifican datos de entrenamiento, numero de tokens ni uso de RLHF o DPO, ya que el procedimiento no es un entrenamiento convencional.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno sobre el modelo base LFM2.5-8B-A1B.
- Tool calling y function calling: el adaptador reduce los fallos de emision de herramientas (`missed_tool_call` de 5 a 0 en la suite del autor).
- Razonamiento agente multi-paso, con mejora reportada en tareas de agente (agent100 de 72/100 a 89/100).
- Generacion de comandos de shell a partir de lenguaje natural (NL2Bash), con mejora de 9/20 a 18/20.
- Razonamiento matematico y STEM (GSM8K de 14/20 a 18/20; suite stem45 evaluada).
- Generacion de codigo (HumanEval de 11/15 a 12/15 en la suite del autor).
- Control del modo de pensamiento: el adaptador reduce los cortes a mitad de razonamiento (`cut_mid_think` de 16 a 4) y permite salidas anticipadas del bloque de pensamiento.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Agentes de terminal automatizados: el adaptador mejora la resolucion de tareas tipo terminal-bench (de 2/10 a 3/10 en WSL2) y reduce las tareas con cero comandos ejecutados de 7 a 4, por lo que es adecuado para pipelines de automatizacion de shell donde el modelo debe emitir comandos validos y completar pasos encadenados.
- Asistentes de operaciones con tool calling: al eliminar los fallos de emision de llamadas a herramientas en la suite del autor, encaja en entornos donde el modelo debe invocar funciones externas de forma fiable (APIs, scripts, consultas a sistemas).
- Traduccion de lenguaje natural a comandos de shell: con 18/20 en NL2Bash, sirve para interfaces de linea de comandos en lenguaje natural o para generar scripts de administracion a partir de descripciones.
- Razonamiento matematico asistido: la mejora en GSM8K (18/20) lo hace util para tutoria o resolucion de problemas aritmeticos paso a paso en entornos educativos o de validacion.
- Generacion de codigo en pipelines de CI/CD: con soporte de tool calling y una mejora modesta en HumanEval, puede integrarse como paso de generacion o correccion de fragmentos de codigo en flujos automatizados.
- Despliegue local en hardware de consumo: el adaptador pesa aproximadamente 1,13 MiB y se carga sobre un GGUF Q4_K_M de 4,801 GiB, por lo que cabe en una GPU de 12 GB (el autor lo prueba en una RTX 4070 Ti) y permite prototipado de agentes sin infraestructura dedicada.
- Investigacion en interpretabilidad mecanica: al ser un ejemplo documentado de intervencion en el espacio de pesos sobre un MoE hibrido, sirve como caso de estudio para analizar como cambios localizados en capas tardias afectan al comportamiento agente.

## Benchmarks y rendimiento

Resultados reportados por el autor con `temp=0.0`, en una RTX 4070 Ti de 12 GB con `llama-server`. La columna combinada agrega 155 tareas de la pista A; VAL_LFM25 es un conjunto disjunto de 28 tareas.

| Configuracion | Adaptadores y tamano | VAL_LFM25 (28) | agent100 | stem45 | tbench10 (WSL2) | Combinado (155) | Decodificacion mediana / media (tok/s) |
|---|---|---:|---:|---:|---:|---:|---:|
| Base (Q4_K_M) | 0 (0 KB) | 20/28 (71,4%) | 72/100 | 29/45 | 2/10 | 103/155 (66,5%) | 210,6 / 210,3 |
| Arm B (`always_s2_1.5`) | 1 rango 8 (581,0 KB) | 26/28 (92,9%) | 77/100 (+5) | 28/45 (-1) | 3/10 (+1) | 108/155 (+5, 69,7%) | 303,0 / 301,8 |
| Soft-Routed (`nt_s1_1.25` + tools) | 2 rango 8 (1162,0 KB) | 25/28 | 86/100 (+14) | 28/45 (-1) | 3/10 (+1) | 117/155 (+14, 75,5%) | 300,7 / 299,8 |
| Arm A (`always_s1pure_1.0+s2_1.5`) | 2 rango 8 (1162,0 KB) | 27/28 (96,4%) | 89/100 (+17, 0 regresiones) | 28/45 (-1) | 3/10 (+1) | 120/155 (+17, 77,4%) | 298,5 / 297,5 |
| Fusionado rango 16 (campeon) | 1 fusionado (1160,0 KB) | 27/28 (96,4%) | no disponible en la tabla | no disponible en la tabla | no disponible en la tabla | no disponible en la tabla | 304,7 / 304,3 |

Desglose adicional reportado por el autor para la configuracion campeona frente a la base: EST_NL2BASH de 9/20 a 18/20, cut_mid_think de 16 a 4, missed_tool_call de 5 a 0, EST_GSM8K de 14/20 a 18/20, S3_ROUTER de 4/5 a 5/5, S7_INJECTION_GUARD de 1/3 a 2/3, EST_HUMANEVAL de 11/15 a 12/15 y EST_BFCL_IRR de 12/15 a 13/15. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval oficial, GSM8K oficial) en la informacion disponible; todas las cifras proceden de la suite propia del autor.

## Requisitos de hardware

- VRAM estimada: el modelo base en Q4_K_M ocupa 4,801 GiB; con contexto de 8192 tokens y cache KV cuantizada en q8_0, el autor lo ejecuta en una GPU de 12 GB. El adaptador anade aproximadamente 1,13 MiB, un coste despreciable.
- GPU recomendadas: el autor valida en RTX 4070 Ti (12 GB). Por el tamano del modelo base, deberia caber en GPUs consumer con 8-12 GB de VRAM, aunque no se aportan pruebas para esas configuraciones.
- Cabe en GPU consumer: si, segun la validacion del autor en una RTX 4070 Ti de 12 GB.
- Opciones de despliegue: `llama-server` con `--lora-scaled` (perfil recomendado), o el lanzador propio `run_lfm25_wsp.py`, que expone una API compatible con OpenAI en `http://127.0.0.1:8090/v1` y modos `routed` y `base`. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: mediana de 304,7 tok/s y media de 304,3 tok/s con el adaptador fusionado de rango 16; la base sin adaptador rinde 210,6 / 210,3 tok/s. El autor atribuye la mejora de velocidad a que el adaptador evita los sitios que ralentizan la decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento reportado | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-8B-A1B-Weight-Space-Programming (este) | Adaptador de 592.896 parametros sobre base no especificado | no disponible | 120/155 en suite propia; 304,7 tok/s | lfm1.0 | GGUF (LoRA) |
| LiquidAI/LFM2.5-8B-A1B (base) | no disponible | no disponible | 103/155 en suite propia; 210,6 tok/s | lfm1.0 | safetensors, GGUF |
| LiquidAI/LFM2.5-8B-A1B-GGUF Q4_K_M | no disponible | no disponible | Es la referencia base usada por el autor | lfm1.0 | GGUF (4,801 GiB) |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el GGUF Q4_K_M del modelo base LiquidAI/LFM2.5-8B-A1B y llama.cpp con soporte de `--lora-scaled`.
- Las mejoras reportadas proceden de la suite de evaluacion propia del autor (155 tareas mas 28 de validacion), no de benchmarks estandar independientes; deben interpretarse con cautela.
- El autor observa una ligera perdida en la suite stem45 (de 29/45 a 28/45) con todas las variantes del adaptador, por lo que la mejora no es uniforme en todas las tareas.
- En tbench10 la mejora es de solo una tarea (2/10 a 3/10), lo que indica que el rendimiento en tareas reales de terminal sigue siendo limitado.
- Un elemento de NL2Bash que fallaba en la base sigue fallando por una comilla de shell sin escapar dentro de `[exec(...)]` (`malformed_tool_count = 1`).
- Restricciones tecnicas conocidas de llama.cpp con esta arquitectura: el embedding atado rechaza LoRA y los expertos MoE en 3D reducen la decodificacion en torno a un 30%; el adaptador esquiva ambos, pero limita donde puede intervenir.
- Licencia LFM Open License v1.0 (lfm1.0): es necesario revisar el archivo LICENSE para conocer las condiciones exactas de uso comercial, ya que la informacion disponible no detalla sus terminos.
- Sesgos, riesgo de alucinacion e idiomas soportados: no disponibles en la informacion proporcionada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0,0 GB, lo que sugiere que los artefactos pueden no estar completamente subidos o verificados.

## Enlaces

- Repositorio Hugging Face del adaptador: https://huggingface.co/jstarks/LFM2.5-8B-A1B-Weight-Space-Programming
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- GGUF oficial del modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B-GGUF
- Adaptador fusionado rango 16: https://huggingface.co/jstarks/LFM2.5-8B-A1B-Weight-Space-Programming/blob/main/adapters/wsp_lfm25_s1_1.0_s2_1.5_fused_r16.gguf
- Licencia: https://huggingface.co/jstarks/LFM2.5-8B-A1B-Weight-Space-Programming/blob/main/LICENSE
