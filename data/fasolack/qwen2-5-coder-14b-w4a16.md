# fasolack/Qwen2.5-Coder-14B-W4A16

## Resumen

fasolack/Qwen2.5-Coder-14B-W4A16 es una cuantizacion int4 del modelo Qwen/Qwen2.5-Coder-14B-Instruct, publicada por el usuario fasolack y orientada especificamente a ejecutar un agente de programacion en una unica GPU de 12 GB. Se trata de un transformer denso estandar (arquitectura `Qwen2ForCausalLM`, verificada con el script `inspect_layers.py` incluido en el repositorio) al que se le han aplicado pesos de 4 bits con activaciones en BF16 (esquema W4A16, grupo de 128 y cuantizacion simetrica) mediante AutoRound de Intel. El repositorio ocupa 9,9 GB y solo mantiene `lm_head` en BF16.

La relevancia de esta ficha esta en su enfoque de calibracion: frente a las cuantizaciones genericas de la comunidad, este build se calibro con una mezcla sesgada hacia codigo (55% `ise-uiuc/Magicoder-OSS-Instruct-75K`), tool-calling (30% `NousResearch/hermes-function-calling-v1`) y texto general (15% `NeelNanda/pile-10k`), con 512 muestras de 2048 tokens. El autor justifica la eleccion del modelo base, mas antiguo, frente a generaciones mas recientes de Qwen porque estas no ofrecen modelos densos en el rango de 12-14B: saltan directamente a densos de 27B+ y MoE de 30B+, que no caben en una tarjeta de 12 GB con cuantizacion razonable.

El aspecto mas delicado del repositorio es el soporte de tool calling. El modelo base presenta un comportamiento erratico al emitir las etiquetas de envoltura de las llamadas a herramientas (usa `<tools>`, `<function-call>` o ninguna etiqueta, en lugar del `<tool_call>` de su propia plantilla), aunque el payload JSON si es correcto. El repositorio incluye un parser propio (`qwen25coder_flex_tool_parser.py`) para compensarlo, y documenta un intento de correccion mediante LoRA que arregla la conformidad de etiquetas al 100% pero degrada HumanEval pass@1 de 68,29% a 58,54%.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, `Qwen2ForCausalLM` (verificado con `inspect_layers.py`) |
| Parametros totales | Modelo base de 14B (el README indica ~28 GB en precision completa). Los metadatos de safetensors del repositorio declaran 3.312.703.136, cifra no coherente con el tamano nominal del modelo base |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens, segun el ejemplo de despliegue con vLLM del repositorio; no se documentan extensiones adicionales |
| Tipos de cuantizacion | int4 W4A16 (pesos int4, activaciones BF16), grupo de 128, simetrica, AutoRound; unica variante publicada en el repositorio |
| Idiomas soportados | no disponible (no se detalla en la informacion del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con formato compressed-tensors |

## Arquitectura y entrenamiento

El modelo no es un entrenamiento nuevo, sino una cuantizacion post-entrenamiento del checkpoint Qwen2.5-Coder-14B-Instruct. La arquitectura es un transformer denso convencional con embedding de salida no atado: la unica capa conservada en BF16 es `lm_head`, decision que el autor describe como seguro barato para la calidad de los logits. No hay puertas de atencion lineal, ni expertos MoE, ni torre de vision en este modelo. La cuantizacion se realizo con AutoRound (Intel) en esquema W4A16, con tamano de grupo 128 y modo simetrico.

La calibracion es el principal elemento diferencial respecto a otras cuantizaciones comunitarias: 512 muestras de 2048 tokens con una composicion de 55% codigo (`ise-uiuc/Magicoder-OSS-Instruct-75K`), 30% tool-calling (`NousResearch/hermes-function-calling-v1`) y 15% texto general (`NeelNanda/pile-10k`). El README no menciona fases adicionales de RLHF o DPO aplicadas sobre esta cuantizacion: el alineamiento procede del modelo base Instruct. Como innovacion practica, el repositorio incluye un parser de llamadas a herramientas tolerante a formatos (`qwen25coder_flex_tool_parser.py`) y un script de instalacion (`install_tool_parser.sh`); existe ademas un intento de LoRA sobre proyecciones de atencion/MLP que no corrigio la conformidad de etiquetas (0/120) hasta anadir `lm_head` a los modulos objetivo, y que no esta publicado en HuggingFace.

## Capacidades

- Generacion de texto y codigo en tareas de programacion, con el modelo base Qwen2.5-Coder-14B-Instruct como referencia.
- Razonamiento matematico y aritmetico de varios pasos, con 80,21% en GSM8K (flexible-extract) medido sobre este build.
- Tool calling y function calling con reservas importantes: el payload JSON es fiable, pero las etiquetas de envoltura no lo son y requieren el parser incluido en el repositorio.
- Uso como motor de agentes de codigo en bucle multi-turno, que es el escenario para el que se construyo.
- Generacion de codigo evaluada en HumanEval con 68,29% pass@1.
- Capacidades multilingues: no detalladas en la informacion proporcionada.
- Modo de pensamiento explicito, vision o audio: no disponibles en este modelo.
- Caché de prefijos (prefix caching) y KV cache en fp8 soportados a traves de vLLM.

## Casos de uso

- Agente de programacion en estacion de trabajo de 12 GB: el modelo se diseno para caber en una RTX 3080 Ti y operar detras de un agente de codigo, donde el checkpoint BF16 (~28 GB) no entra.
- Servicio de tool calling en vLLM con CI/CD: con el parser `qwen25coder_flex` instalado, se puede exponer como endpoint con `--enable-auto-tool-choice` e integrarlo en pipelines que invocan herramientas externas (ejecucion de tests, linters, despliegues).
- Extraccion estructurada de datos: la parte fiable del tool calling es el objeto JSON, por lo que es adecuado para extraer campos estructurados de texto aunque el envoltorio de la llamada varie.
- Asistente de refactorizacion y generacion de tests en un IDE o CLI, aprovechando su ventana de 32.768 tokens para procesar varios ficheros en un mismo contexto.
- Revision de codigo en ganchos pre-commit o pipelines de integracion: el modelo puede analizar diffs y proponer cambios con una latencia compatible con ejecucion local.
- Despliegue on-premise con requisitos de privacidad, al ser un modelo de pesos abiertos con licencia apache-2.0 y ejecutable en una sola GPU sin servicios externos.
- Prototipado de agentes multi-paso con presupuesto de VRAM limitado, usando TP=1 y caché de prefijos para reducir coste en conversaciones largas.
- Evaluacion comparativa de tecnicas de cuantizacion (AutoRound frente a esquemas genericos) gracias a los numeros publicados en el README.

## Benchmarks y rendimiento

Medidos con EleutherAI lm-evaluation-harness contra el endpoint servido. El autor no midio una linea base BF16 de este build.

| Tarea | Este build (int4 W4A16) |
|---|---|
| GSM8K (flexible-extract) | 80,21% ± 1,10% |
| HumanEval (pass@1) | 68,29% ± 3,64% |
| MMLU-Pro (100 por asignatura) | 41,71% ± 1,29% |

Resultados del build experimental con LoRA de correccion de etiquetas (no publicado en HuggingFace), frente al build publicado:

| Tarea | Build publicado | Build con LoRA toolfix-v2 |
|---|---|---|
| HumanEval (pass@1) | 68,29% | 58,54% |
| GSM8K (strict-match) | 72,10% | 64,97% |
| MMLU-Pro | dentro del ruido | dentro del ruido |
| GSM8K (flexible-extract) | dentro del ruido | dentro del ruido |
| Conformidad de etiqueta tool call | no conforme en varios casos | 100% (120/120) |

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 9,9 GB; el autor lo ejecuta con `--gpu-memory-utilization 0.90` en una GPU de 12 GB, dejando margen para contexto y KV cache.
- GPU recomendadas: RTX 3080 Ti de 12 GB (probada por el autor). Cualquier GPU con al menos 12 GB de VRAM deberia poder alojar los pesos, aunque el repositorio no documenta otras configuraciones verificadas.
- Cabe en GPU de consumo: si, en tarjetas de 12 GB en adelante segun la evidencia del repositorio. No hay datos para tarjetas de 8 GB o menos.
- Opciones de despliegue: vLLM con `--tensor-parallel-size 1`, `--kv-cache-dtype fp8`, `--enable-prefix-caching` y `--max-model-len 32768`. El repositorio no documenta llama.cpp, Ollama ni TGI para este formato compressed-tensors.
- Latencia y throughput: no disponibles (no se publican mediciones).
- Nota de serving: el autor indica que el servicio multi-GPU seria puro sobrecoste para este tamano de modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fasolack/Qwen2.5-Coder-14B-W4A16 | 14B (int4) | 32.768 tokens (configurado) | 41,71% | apache-2.0 | Publicado en HuggingFace |
| Qwen/Qwen2.5-Coder-14B-Instruct (BF16) | 14B | no disponible en esta informacion | no disponible en esta informacion | apache-2.0 | Publicado en HuggingFace |
| Builds de 27B/35B de la misma familia | 27B-35B | no disponible | "en los 80" segun el README | no disponible | No publicados en HuggingFace |
| Generacion actual de Qwen (densos 27B+, MoE 30B+) | 27B+ | no disponible | no disponible | no disponible | Publicados por Qwen, no cabe en 12 GB |

## Limitaciones y advertencias

- El tool calling no es conforme con la plantilla del modelo base: puede emitir `<tools>`, `<function-call>` o ninguna etiqueta en lugar de `<tool_call>`. El autor verifico que es un defecto del modelo base, no de la cuantizacion, reproduciendolo contra el checkpoint BF16 original.
- El parser estandar `hermes` de vLLM falla en silencio con este modelo: las llamadas a herramientas acaban como texto plano en `content` con `finish_reason: "stop"`, sin poblar `tool_calls`. Sin el parser incluido, no es fiable detras de un agente.
- El build corregido con LoRA (`Qwen2.5-Coder-14B-W4A16-toolfix-v2`) consigue 100% de conformidad de etiquetas pero degrada HumanEval pass@1 en casi 10 puntos y GSM8K strict-match en unos 7 puntos. No esta publicado en HuggingFace.
- No se midio una linea base BF16 para este build, por lo que no se puede cuantificar aqui la perdida exacta atribuible a la cuantizacion.
- El MMLU-Pro de 41,71% es bajo en terminos absolutos y refleja las limitaciones del modelo base: es mas pequeno y de generacion anterior que los builds de 27B/35B de la familia, y esta especializado en codigo.
- El repositorio no declara idiomas soportados ni sesgos conocidos; no hay evaluaciones de sesgo publicadas.
- Riesgo de alucinacion no evaluado de forma especifica: al ser un modelo de generacion de codigo, puede producir APIs o funciones inexistentes.
- Licencia apache-2.0, sin restricciones declaradas para uso comercial, pero el autor no ofrece garantias ni evaluaciones adicionales mas alla de las tres tareas publicadas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: es un artefacto reciente y no validado por terceros.
- Solo se documenta despliegue con vLLM; otros runners no estan soportados por la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fasolack/Qwen2.5-Coder-14B-W4A16
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- AutoRound (Intel), herramienta de cuantizacion: https://github.com/intel/auto-round
- Registro del proyecto complementario citado en el README: https://claude.ai/code/artifact/ba8a6f62-040d-4631-a185-c029525d1073
- Dataset de calibracion (codigo): https://huggingface.co/datasets/ise-uiuc/Magicoder-OSS-Instruct-75K
- Dataset de calibracion (tool calling): https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset de calibracion (texto general): https://huggingface.co/datasets/NeelNanda/pile-10k
- Ficheros incluidos en el repositorio: `qwen25coder_flex_tool_parser.py`, `install_tool_parser.sh`, `inspect_layers.py`, `PAPER.md`
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (unicamente resultados de reservas de restaurantes sin relacion).
