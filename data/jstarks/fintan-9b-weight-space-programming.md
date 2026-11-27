# jstarks/Fintan-9B-Weight-Space-Programming

## Resumen

Fintan-9B-Weight-Space-Programming es un paquete de publicacion en GGUF que aplica la tecnica denominada Weight-Space Programming (WSP) sobre el modelo Fintan-9B de Fintan Labs, el cual a su vez deriva de Qwen/Qwen3.5-9B. El autor del repositorio es jstarks y la licencia declarada es Apache-2.0. No se trata de un modelo entrenado desde cero, sino de un conjunto de adaptadores LoRA en formato GGUF, un router de ejecucion unificado y una suite de evaluacion que se cargan sobre el modelo base cuantizado.

El problema que aborda es concreto: el Fintan-9B original alcanza un 89,5 % de recall (154/172) en noticias episodicas de noviembre de 2026 con `enable_thinking=False`, pero presenta cuatro modos de fallo estructurales documentados por el autor: colapso total con `enable_thinking=True` (0/172), colapso en tareas que combinan conocimiento episodico y tool calling (0/12), degradacion de las capacidades generales y agenticas cuando el adaptador `ffn_down` de rango 512 esta activo, y huecos en el enrutador (pierde la pregunta [168] y genera 3/10 falsos positivos en trampas de abstencion). La propuesta WSP resuelve los cuatro modos cargando 13 ranuras LoRA simultaneamente en una unica instancia de `llama-server`.

La relevancia actual reside en el enfoque de ingenieria: en lugar de reentrenar, el autor compone subespacios de comportamiento (S1..S12) sobre el mismo backbone y conmuta escalas por turno en menos de 2 ms, con un pico de 6926 MiB de VRAM en una RTX 4070 Ti. El repositorio ocupa 6,3 GB e incluye el GGUF base Qwen3.5-9B en Q4_K_M (5,29 GiB). El modelo esta etiquetado unicamente para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-9B) con adaptadores LoRA compuestos en espacio de pesos |
| Parametros totales | 67.108.864 (segun safetensors del repo); el backbone se denomina Qwen3.5-9B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF base incluido); adaptadores LoRA en GGUF |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (libreria `gguf`, orientado a `llama.cpp` / `llama-server`) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B, un transformer denso. Sobre el se aplica un adaptador de aprendizaje continuo de Fintan Labs (`fintan_2026_11_23_r512.gguf`) con rango 512 y alpha 512, restringido a las capas `ffn_down` de los bloques `{11,14,16,18,21,23,25,27}`, con norma de Frobenius del delta de pesos entre 78,65 y 80,29 y rango efectivo al 90 % de energia entre 304 y 330. Ese adaptador es el que aporta la actualizacion de conocimiento episodico de noviembre de 2026.

La innovacion de este repositorio no es el entrenamiento sino la composicion en tiempo de inferencia. El `UnifiedFintanWSPRouter` (`fintan_wsp_router.py`) carga 13 adaptadores LoRA GGUF en una sola instancia de `llama-server` mediante `--lora-init-without-apply` y conmuta las escalas por turno en menos de 2 ms. Las ranuras `[0..10]` corresponden a los subespacios de comportamiento S1..S11 de Qwen3.5-9B (`wsp_s1_think.gguf` hasta `wsp_s11_term_code.gguf`), la ranura `[11]` es el LoRA de Fintan y la ranura `[12]` es un subespacio S12 sintetizado. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento con modo thinking conmutable (`enable_thinking=True/False`), corregido respecto al colapso del modelo upstream.
- Tool calling y function calling, incluyendo uso de conocimiento episodico dentro de las llamadas a herramientas (11/12 en la suite B1, con `tool_ok=12/12`).
- Restriccion de herramientas (tool restraint): capacidad de abstenerse de invocar herramientas cuando no procede (10/10 `no_tc` en la suite B2).
- Abstencion ante conocimiento no aprendido (unlearned abstention): 9/10 en la suite B3, a la par del modelo base.
- Comportamiento agentico multi-paso: suite `agent100` con 78/100 y suite `Holdout-30` con 27/30.
- Ejecucion en terminal real (WSL2): 6/20 en Terminal-Bench 20.
- Generacion de codigo: HumanEval 15/15 en la suite `agent100`.
- Enrutamiento dinamico por turno entre subespacios de comportamiento, con cero falsos positivos de enrutamiento en `agent100`, `tbench20`, `B2` y `B3_gen`.
- Capacidades multilingues: no disponibles; el modelo declara solo ingles.

## Casos de uso

- Actualizacion de conocimiento sin reentrenamiento: el adaptador Fintan inyecta noticias de noviembre de 2026 en el backbone y el router WSP lo activa solo cuando la consulta lo requiere, evitando el coste de un fine-tuning completo.
- Atencion al cliente con conocimiento temporal: el modelo puede responder sobre eventos recientes (154/172 de recall) y abstenerse cuando la pregunta cae fuera de lo aprendido (9/10 en `B3_abs`), lo que reduce respuestas inventadas en produccion.
- Agentes con tool calling sobre datos episodicos: la suite B1 demuestra que el modelo puede consultar herramientas y a la vez recuperar hechos aprendidos, algo que el base y el Fintan original no lograban (0/12).
- Automatizacion de terminal y operaciones: Terminal-Bench 20 con 6/20 en WSL2 real, util para asistentes de shell que deben decidir entre ejecutar comandos o abstenerse.
- Generacion de codigo en pipelines: HumanEval 15/15 en la suite agentica, integrable en flujos de CI/CD con `llama-server` como backend compatible con la API de OpenAI.
- Despliegue en hardware de consumo: 6926 MiB de pico en una RTX 4070 Ti permiten ejecutar las 13 ranuras LoRA en una sola GPU consumer, lo que habilita prototipos y entornos de desarrollo locales.
- Investigacion en composicion de adaptadores: el repositorio sirve como referencia reproducible para estudiar Weight-Space Programming, conmutacion de subespacios y evaluacion de modos de fallo en modelos de 9B.

## Benchmarks y rendimiento

Resultados publicados por el autor, ejecutados en `llama-server` con Q4_K_M sobre RTX 4070 Ti:

| Benchmark / capacidad | Qwen3.5-9B base | Fintan-9B upstream | Fintan-9B + WSP |
|---|---|---|---|
| NightRouter `check_questions` (172) | — | 171/172 | 172/172 |
| NightRouter falsos positivos (`B3_abs`, 10) | — | 3/10 | 0/10 |
| Suite A3 `check_172` (`think=False`) | 19/172 | 153/172 enrutado / 154/172 directo | 154/172 (89,5 %) |
| Suite A4 `check_172` (`think=True`) | — | 0/172 | 154/172 (89,5 %) |
| Suite B1 conocimiento + herramientas (`think=True`, 12) | 0/12 (`tool_ok=2/12`) | 0/12 (`tool_ok=0/12`) | 11/12 (`tool_ok=12/12`) |
| Suite B1 conocimiento + herramientas (`think=False`, 12) | — | 0/12 | 11/12 (`tool_ok=12/12`) |
| Suite B2 tool restraint (10) | 6/10 | 3/10 | 6/10 (10/10 `no_tc`) |
| Suite B3 abstencion / general (`think=False`) | 9/10 / 8/10 | 0/10 / 6/10 | 9/10 / 8/10 |
| Suite C `Holdout-30` | 26/30 | 1/30 | 27/30 |
| Suite C `agent100` (100 tareas) | 84/100 | colapsa | 78/100 (71,8 tok/s) |
| Suite D Terminal-Bench 20 (WSL2) | 7/20 | — | 6/20 (63,7 tok/s) |

Notas del autor: en `EST_GSM8K` el router selecciono `scales=[0.0]*13` en los 20 items, por lo que la ejecucion (8/20) recae sobre el base Qwen3.5-9B y choca con el limite `max_tokens=1024` de CoT; la referencia `wsp-5model-pipeline` obtiene 14/20 en las mismas condiciones. En la suite B1 el unico fallo restante es `b1_navaldrones_write`, donde la fase 2 emite correctamente `write_file('/tmp/drones.txt', ...)` pero la fase 1 recupera "sank Russian ships" sin "two".

## Requisitos de hardware

- VRAM estimada: 6926 MiB de pico con las 13 ranuras LoRA cargadas simultaneamente en una sola instancia de `llama-server` (medido en RTX 4070 Ti).
- GPU validadas: RTX 4070 Ti (unica GPU reportada por el autor).
- GPU recomendadas por analogia de tamano: no disponibles como recomendacion oficial; el autor no publica pruebas en A100, H100 ni otras RTX.
- Cabe en GPU consumer: si, segun la medicion en RTX 4070 Ti con Q4_K_M.
- Opciones de despliegue: `llama.cpp` / `llama-server` con `--lora-init-without-apply` y el script `fintan_wsp_router.py`. No se documenta soporte para vLLM, TGI u Ollama.
- Throughput y latencia: 71,8 tok/s en `agent100` y 63,7 tok/s en Terminal-Bench 20; conmutacion de escalas LoRA por turno en menos de 2 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fintan-9B + WSP | 9B (backbone) | No disponible | NightRouter 172/172; B1 11/12; Holdout-30 27/30 | Apache-2.0 | GGUF en Hugging Face |
| Fintan-9B (upstream) | 9B | No disponible | NightRouter 171/172; B1 0/12; Holdout-30 1/30 | Apache-2.0 | Hugging Face |
| Qwen3.5-9B (base) | 9B | No disponible | NightRouter A3 19/172; agent100 84/100; Holdout-30 26/30 | Apache-2.0 | Hugging Face |

La comparativa se limita a los tres modelos evaluados en la model card; no se dispone de datos de otros modelos de 9B con actualizacion de conocimiento episodico para establecer una comparacion externa.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; no hay evaluacion multilingue.
- El conocimiento episodico esta acotado a noticias de noviembre de 2026 y no se actualiza por si solo; requiere un nuevo adaptador para eventos posteriores.
- El adaptador Fintan de rango 512 degrada capacidades generales y agenticas cuando se activa sin el enrutador WSP (Holdout-30 cae de 26/30 a 1/30, `B3_abs` de 9/10 a 0/10).
- Riesgo de alucinacion en dominios fuera del corpus aprendido: la suite B3 muestra 9/10 de abstencion, pero persiste un 10 % de fallo.
- En `EST_GSM8K` el router puede seleccionar escalas nulas y delegar en el base, que se topa con el limite de 1024 tokens de CoT (8/20 frente a 14/20 de la referencia).
- Rendimiento agentico por debajo del base en `agent100` (78/100 frente a 84/100) y en Terminal-Bench 20 (6/20 frente a 7/20).
- Un unico fallo conocido en B1 (`b1_navaldrones_write`) por recuperacion incompleta del hecho.
- Las mediciones proceden de una sola GPU (RTX 4070 Ti) y de una unica configuracion de `llama-server`; no hay validacion independiente.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin adopcion externa verificable.
- Aunque la licencia es Apache-2.0, conviene verificar las condiciones de los modelos base Qwen3.5-9B y Fintan-9B antes de un uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jstarks/Fintan-9B-Weight-Space-Programming
- GGUF base Qwen3.5-9B Q4_K_M: https://huggingface.co/jstarks/Fintan-9B-Weight-Space-Programming/blob/main/gguf/Qwen3.5-9B-Q4_K_M.gguf
- Licencia del repositorio: https://huggingface.co/jstarks/Fintan-9B-Weight-Space-Programming/blob/main/LICENSE
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Adaptador Fintan-9B: https://huggingface.co/fintanlabs/Fintan-9B
