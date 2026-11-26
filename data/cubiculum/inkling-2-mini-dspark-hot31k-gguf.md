# cubiculum/Inkling-2-Mini-DSpark-hot31k-GGUF

## Resumen

Inkling-2-Mini-DSpark-hot31k-GGUF es un *drafter* de decodificación especulativa (speculative decoding) para el modelo Inkling 2 Mini de Thinking Machines, empaquetado en formato GGUF para su uso con llama.cpp. No es un modelo generativo autónomo: es un cabezal de borrador que propone tokens candidatos que el modelo objetivo (Inkling 2 Mini) verifica después, de modo que la salida final es siempre la del modelo objetivo y solo cambia la velocidad de decodificación.

La innovación de esta variante concreta es la restricción del vocabulario del borrador a un conjunto «caliente» de 31.740 tokens (frente a los 200.058 del vocabulario completo), seleccionados a partir de frecuencias observadas en prosa inglesa, código, shell y JSON. Al reducir las filas de salida que debe leer y ordenar cada paso de borrador en un factor de 6,3, el autor reporta una mejora de velocidad de decodificación del +6,3 % sobre un conjunto mixto de 32 prompts, frente al +4,5 % (no significativo) del drafter completo.

El modelo base subyacente, Inkling 2 Mini, tiene 398.392.456 parámetros según los safetensors del repositorio base, y este repositorio GGUF ocupa 0,4 GB. La licencia es Apache 2.0, heredada del modelo base. Es relevante para quienes despliegan Inkling 2 Mini en llama.cpp y buscan acelerar la inferencia en cargas de trabajo dominadas por tool calling y generación de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabezal de borrador DSpark (speculative decoding); drafter del modelo base Inkling 2 Mini |
| Parametros totales | 398.392.456 (modelo base); el drafter en sí tiene `output.weight` de 2304 x 31.740 y `markov_w2` recortado a las mismas filas |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (fichero `q8_0-hot31k`) |
| Idiomas soportados | El conjunto caliente es inglés y código; el modelo objetivo verifica todos los tokens, por lo que la salida no se limita a esos idiomas, pero el borrador solo propone tokens del conjunto |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El fichero contiene el drafter DSpark propio de Inkling 2 Mini (`mtp.safetensors` del release), convertido con `convert_hf_to_gguf.py --dspark --outtype q8_0`. Incluye el tensor `d2t` (I64, 31.740 entradas) que mapea fila de borrador a id de token objetivo, leído por la ruta de vocabulario reducido de DFlash upstream (`src/models/dflash.cpp`) sin cambios de código. El `output.weight` [2304 x 31.740] en Q8_0 corresponde a las filas del LM-head del objetivo para esos ids, copiadas como bloques crudos desde el head BF16 del release sin recuantización; el drafter completo, en cambio, toma prestado el head entero del objetivo. `markov_w2` está recortado a las mismas filas.

El conjunto caliente se construyó contando frecuencias de tokens con el `tokenizer.json` de Inkling sobre unos 19 MB de texto de sistema (documentación de Debian, biblioteca estándar de Python, fuentes y documentación de llama.cpp, scripts de administración local y ficheros JSON), añadiendo todas las palabras de la lista inglesa `/usr/share/dict/american-english` que sean un único token y todos los tokens de control. No se dispone de información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) en la información proporcionada.

## Capacidades

- Aceleración de decodificación especulativa en llama.cpp mediante `--spec-type draft-dspark` y `--spec-draft-n-max 2`.
- Propuesta de tokens para tool calling en JSON, código, shell y prosa inglesa.
- Compatibilidad con cualquier GGUF principal de Inkling 2 Mini como objetivo (por ejemplo `ggml-org/Inkling-2-Mini-GGUF` o los ficheros `Mainline_Support` de Unsloth).
- Verificación íntegra por parte del modelo objetivo: la salida no cambia, solo la velocidad.
- Herramienta `hotvocab-transform.py` para construir drafters con cualquier lista de ids (útil para otros idiomas o dominios).
- No es un modelo generativo autónomo: no razona, no hace tool calling por sí mismo ni genera texto de forma independiente.

## Casos de uso

- Aceleración de servidores de tool calling: en cargas dominadas por JSON de llamadas a herramientas, el borrador aporta +21,3 % de velocidad de decodificación (significativo al 5 %), por lo que es adecuado para agentes que emiten muchas llamadas estructuradas.
- Generación de código en producción: con +12,0 % en prompts de código, se puede integrar en pipelines de CI/CD o asistentes de código desplegados con llama.cpp para reducir latencia por token.
- Despliegue en hardware de gama integrada: medido en una AMD Radeon 890M (gfx1150, Strix Point APU) con Vulkan, escenario típico de equipos sin GPU dedicada.
- Servicio de chat mixto: mejora del +6,4 % en prompts mixtos, útil para asistentes que alternan prosa, código y estructura.
- Investigación en decodificación especulativa: sirve como referencia reproducible para estudiar el efecto del tamaño del vocabulario del drafter en la tasa de aceptación (52,9 % de tokens aceptados).
- Creación de drafters por dominio: con `hotvocab-transform.py` se pueden generar variantes para otros idiomas o workloads contando tokens sobre corpus propios.
- No recomendado para generación de prosa pura: en prosa el rendimiento cae un -11,5 % (significativo), por lo que no es adecuado para cargas dominadas por texto libre.

## Benchmarks y rendimiento

Mediciones del autor sobre AMD Radeon 890M (gfx1150, Strix Point APU), Vulkan, llama.cpp `244640b7f`, objetivo con expertos NVFP4 y resto en Q8_0 (17,6 GB), 32 prompts de chat (8 de tool-call JSON, 8 de código, 8 mixtos, 8 de prosa), decodificación greedy, hasta 256 tokens:

| Drafter | Tool calls | Código | Mixto | Prosa | Todos (32) | Ponderado por tiempo | Tokens aceptados |
|---|---|---|---|---|---|---|---|
| Full Q8_0 | +21,2 % s | +9,3 % s | +5,1 % | -14,4 % s | +4,5 % | +3,0 % | 55,4 % |
| **Este fichero** | +21,3 % s | +12,0 % s | +6,4 % s | -11,5 % s | **+6,3 % s** | +5,1 % | 52,9 % |
| Variante 43.029 tokens | +22,8 % s | +10,1 % s | +6,5 % s | -11,8 % s | +6,1 % s | +4,8 % | 52,9 % |

`s` = significativo al 5 %. Sin drafter, la base decodificaba a 13,8 tokens/s; con este fichero, la media fue de 14,8 tokens/s. No se han publicado resultados de benchmarks de precisión de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El fichero ocupa 0,4 GB en disco; debe cargarse junto al GGUF objetivo de Inkling 2 Mini.
- VRAM estimada: no disponible de forma aislada; el objetivo usado en las mediciones ocupaba 17,6 GB (expertos NVFP4 y resto Q8_0).
- GPU probada: AMD Radeon 890M (gfx1150, Strix Point APU) con Vulkan. Otras GPU y backends no han sido medidos.
- No se dispone de datos de compatibilidad con GPU consumer NVIDIA (RTX 4090, etc.) en la información proporcionada.
- Despliegue: llama.cpp (`llama-server`) con `-md` para el drafter, `--spec-type draft-dspark` y `--spec-draft-n-max 2` (probado; hardware más rápido podría preferir 3).
- Throughput medido: 13,8 tokens/s sin drafter y 14,8 tokens/s de media con este fichero en el hardware de prueba.
- Requiere llama.cpp `244640b7f` (2026-11-25) o posterior; el código DSpark y `d2t` no cambió hasta `0e4e925e8` (2026-11-26).

## Comparativa con modelos similares

| Drafter | Vocabulario | Mejora global | Prosa | Tokens aceptados | Licencia |
|---|---|---|---|---|---|
| Este fichero (hot31k) | 31.740 | +6,3 % s | -11,5 % s | 52,9 % | Apache 2.0 |
| Drafter completo Q8_0 | 200.058 | +4,5 % | -14,4 % s | 55,4 % | Apache 2.0 |
| Variante 43.029 tokens | 43.029 | +6,1 % s | -11,8 % s | 52,9 % | Apache 2.0 |

No se dispone de comparación con drafters de otros modelos en la información proporcionada.

## Limitaciones y advertencias

- La prosa empeora con cualquier drafter DSpark en el hardware probado: verificar 3 tokens cuesta unas 1,8 veces una decodificación de 1 token porque el kernel mat-vec MoE de Vulkan se despacha una vez por token.
- El conjunto caliente es inglés y código; el drafter nunca puede proponer tokens fuera de él, por lo que otros idiomas aceptarán menos borradores y pueden ir más lentos. En las salidas retenidas de los prompts de prueba, el 2,0 % de los tokens generados quedaron fuera del conjunto.
- El cambio local de `argmax` en Vulkan usado en las mediciones no está upstream; con 31.740 filas se espera que importe poco en llama.cpp estándar, pero no se ha medido.
- Mediciones sobre una sola máquina, 32 prompts y decodificación greedy; no se evaluó precisión de tareas.
- La decodificación especulativa deja intactas las elecciones del objetivo, salvo efectos de redondeo de lote similares al error de cuantización.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Inkling 2 Mini.
- Riesgo de alucinación y sesgos: no disponibles en la información proporcionada (dependen del modelo objetivo, no del drafter).

## Enlaces

- Hugging Face: https://huggingface.co/cubiculum/Inkling-2-Mini-DSpark-hot31k-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF principal de referencia: https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
