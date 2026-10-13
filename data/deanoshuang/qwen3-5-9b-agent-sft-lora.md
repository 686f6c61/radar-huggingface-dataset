# deanoshuang/qwen3.5-9b-agent-sft-lora

## Resumen

`deanoshuang/qwen3.5-9b-agent-sft-lora` es un adaptador LoRA de rango 32 sobre el modelo base `Qwen/Qwen3.5-9B` (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`), publicado por el usuario de HuggingFace deanoshuang. Se ha entrenado mediante supervisión fina (SFT) sobre trayectorias agénticas verificadas de ingeniería de software y de terminal, generadas por modelos maestros de pesos abiertos, más una porción de retención de matemáticas, ciencia, seguimiento de instrucciones y chat. Forma parte de un estudio de tres versiones (Base, SFT y etapa 2) evaluadas con protocolos bloqueados en SWE-bench Pro, Terminal-Bench 2.0, HLE y ASI-Bench, cuyo código, tarjeta de datos, registros y resultados por tarea están en el repositorio `github.com/Deanpuzzleai/apex-takehome`.

El modelo base es Qwen3.5-9B, un transformer denso de 9.000 millones de parámetros, nativamente multimodal (visión-lenguaje), con 262.144 tokens de contexto extensibles a 1M mediante YaRN, modo de razonamiento ("thinking") activado por defecto y licencia Apache 2.0. El adaptador congela la torre de visión y solo modifica el modelo de lenguaje: se carga sobre la clase servida `Qwen3_5ForConditionalGeneration` y añade 86.556.672 parámetros entrenables.

Su relevancia práctica es doble: por un lado, demuestra que un adaptador de 0,4 GB permite especializar un modelo generalista de 9B en tareas de agente de terminal y de resolución de incidencias de software con un coste de entrenamiento declarado de 3,87 horas en una NVIDIA B200 (3,89 GPU-h, ~32 USD); por otro, publica de forma reproducible la mezcla de datos, los hashes y los registros de ejecución, algo poco habitual en adaptadores de este tipo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer denso multimodal Qwen3.5-9B; clase de servicio `Qwen3_5ForConditionalGeneration`; la torre de visión permanece congelada |
| Parametros totales | 9B en el modelo base; 86.556.672 parámetros entrenables en el adaptador |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens en el modelo base, extensible a 1M con YaRN; el adaptador hereda la configuración del base (no se publica un valor propio) |
| Tipos de cuantizacion | No disponible para el adaptador. La model card documenta la fusión del adaptador en bf16 para servirlo con vLLM; no se listan cuantizaciones (GGUF, AWQ, GPTQ) publicadas |
| Idiomas soportados | `en` según la model card del adaptador; el modelo base declara cobertura de 201 idiomas en fuentes externas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); tamano del repositorio 0,4 GB |

## Arquitectura y entrenamiento

El adaptador aplica LoRA con rango 32, alpha 64 y dropout 0,05 sobre las proyecciones `q/k/v/o_proj`, `in_proj_qkv/z/b/a`, `out_proj` y `gate/up/down_proj` de las 32 capas del modelo de lenguaje, lo que suma 86.556.672 parámetros entrenables. La pérdida se calcula únicamente sobre los turnos del asistente (razonamiento, contenido y llamadas a herramientas), quedando enmascarados los mensajes de usuario y las observaciones del entorno. No se menciona RLHF ni DPO en la información disponible: el entrenamiento es SFT puro.

Los datos de entrenamiento suman 5.598 filas y 33.200.602 tokens de pérdida, con un tope de 65.536 tokens por fila y un hash de datos declarado (`a154244532e6c1deff72d9b24a54e8520986fcf42affec479f32bf75af24b926`). La composición es 61,1 % SWE, 14,0 % terminal y 25,0 % retención. Las fuentes SWE son episodios de `nvidia/Open-SWE-Traces` (subconjuntos `scale-swe` y `swe-rebench-v2`, 1.170 filas, 21,45M tokens) generados con Qwen3.8-27B como verificador; la parte de terminal proviene de `ai-and/termgrade-trajectories` (1.902 filas, 4,86M tokens) con DeepSeek-V4-Pro como verificador; la retención combina `nvidia/Nemotron-SFT-Instruction-Following-Chat-v3`, `nvidia/Nemotron-SFT-Math-v4` y `nvidia/Nemotron-Science-v1` (2.824 filas). Todos los textos portadores de pérdida provienen de maestros de pesos abiertos (GPT-OSS-120B, GLM-5, DeepSeek-V4-Pro, Qwen3.8-27B); no se usaron trazas de modelos cerrados. Las tareas de benchmark y sus repositorios se excluyeron mediante cribados de descontaminación.

La optimización usó AdamW con tasa de aprendizaje 1e-4, programación coseno, 3 % de calentamiento, sin decaimiento de peso, recorte de gradiente de 1,0, lote efectivo 16, una única época (350 pasos) y semilla 42. El punto de control seleccionado es el final (paso 350 de 350), por regla fija, sin selección sobre conjunto de desarrollo. El entrenamiento se ejecutó en 1 GPU NVIDIA B200 durante 3,87 horas, a 8.761 tokens/s y con un pico de memoria de 71,7 GB. El identificador de la ejecución es `sft_main_20261012_154313`.

## Capacidades

- Generación de texto y razonamiento en modo "thinking" por defecto, heredado del modelo base Qwen3.5-9B.
- Resolución de tareas de ingeniería de software: navegación de repositorios, edición de ficheros, ejecución de pruebas y corrección de errores, a partir de episodios tipo mini-swe-agent.
- Ejecución de tareas de terminal: uso de herramientas de línea de comandos y scripts de shell, según el formato de las trayectorias TermGrade.
- Llamada a herramientas (tool calling / function calling) y razonamiento multi-paso en bucle de agente, con historial de observaciones enmascarado durante el entrenamiento.
- Retención de matemáticas, ciencia, seguimiento de instrucciones y conversación general, gracias al 25 % del presupuesto de pérdida dedicado a estas tareas.
- Capacidad multimodal heredada del base (pipeline declarado `image-text-to-text`), aunque el adaptador no la modifica y no se ha evaluado después del ajuste fino.
- Capacidades multilingües: la model card del adaptador solo declara inglés; el modelo base declara 201 idiomas, pero no hay evaluación del adaptador fuera del inglés.

## Casos de uso

- Automatización de resolución de incidencias en repositorios: el adaptador se integra como agente que lee el informe de error, localiza los ficheros relevantes, aplica un parche y ejecuta la batería de pruebas, aprovechando el entrenamiento sobre 1.170 episodios de SWE con verificación.
- Asistente de operaciones en terminal: ejecución encadenada de comandos de diagnóstico, lectura de la salida y decisión del siguiente paso, útil para tareas repetitivas de administración de sistemas descritas en lenguaje natural.
- Integración en pipelines de CI/CD: dado su soporte de tool calling y su ventana de contexto de 262K tokens, puede recibir el volcado completo de un registro de compilación y proponer correcciones o abrir parches automáticamente.
- Agente de mantenimiento de dependencias: lectura de ficheros de manifiesto, detección de versiones incompatibles y generación de actualizaciones con verificación de pruebas, un escenario alineado con la mezcla `swe-rebench-v2`.
- Generación de scripts de shell explicados: a partir de una descripción de la tarea, el modelo produce el script y justifica cada comando, aprovechando el sesgo de su mezcla hacia terminal.
- Prototipado de agentes de investigación: al ser un adaptador PEFT de 0,4 GB sobre un base abierto y con licencia Apache 2.0, sirve como punto de partida reproducible para experimentos de ajuste fino y comparación de mezclas de datos a bajo coste (3,89 GPU-h declaradas).
- Asistente técnico con razonamiento explícito: el modo "thinking" por defecto permite auditar la cadena de razonamiento en tareas de matemáticas o ciencia, gracias a la porción de retención del 25 %.
- Evaluación comparativa de métodos de ajuste: el repositorio asociado publica configuraciones de evaluación bloqueadas y resultados por tarea, lo que facilita reproducir comparaciones entre versión base, SFT y etapa 2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que los resultados se añadirán cuando finalicen las evaluaciones, y que las salidas, veredictos y registros por tarea están en `results/sft/` del repositorio de código. El estudio declara evaluaciones previstas en SWE-bench Pro, Terminal-Bench 2.0, HLE y ASI-Bench (nivel de prompt B1), pero no incluye cifras en la información proporcionada.

Como referencia del modelo base, fuentes externas citan que Qwen3.5-9B obtiene ~69 % en MMMU-Pro y que fue valorado como el modelo más capaz por debajo de 10.000 millones de parámetros en el momento de su lanzamiento (análisis de Artificial Analysis). Estos datos corresponden al modelo base sin el adaptador y no deben atribuirse a esta ficha.

## Requisitos de hardware

- Peso del adaptador: 0,4 GB en safetensors; se carga sobre el modelo base, no lo sustituye.
- Modelo base en bf16: aproximadamente 18 GB de pesos para 9.000 millones de parámetros. El adaptador fusionado en bf16 mantiene ese orden de magnitud.
- Memoria de caché KV: no disponible de forma oficial. Como estimación orientativa, con una configuración habitual tipo Qwen3 (36 capas, 8 cabezas KV, dimensión de cabeza 128, bf16) el coste sería de ~140-150 KB por token, es decir, del orden de 4,6 GB a 32K tokens y ~38 GB a 262K tokens. Es una estimación con supuestos no confirmados por el autor.
- GPU recomendadas: A100 40/80 GB o H100 80 GB para contexto largo o servicio concurrente; el entrenamiento declarado se hizo en una NVIDIA B200 con 71,7 GB de pico.
- GPU de consumo: una RTX 4090 de 24 GB puede alojar el modelo base en bf16 solo con contexto corto y poca concurrencia; con cuantización de 4 bits (~5-6 GB de pesos) cabría con contexto moderado. No se publican cuantizaciones del adaptador.
- Despliegue: la model card documenta fusionar el adaptador con `scripts/merge_adapter.sh merge` (bf16) y servirlo con vLLM usando los indicadores de `configs/eval/model.yaml`. También es posible cargarlo en caliente con `peft.PeftModel.from_pretrained` junto con `transformers.AutoModelForImageTextToText`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y rendimiento en inferencia: no disponible. El único dato de rendimiento publicado es de entrenamiento: 8.761 tokens/s en 1 GPU B200.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| `deanoshuang/qwen3.5-9b-agent-sft-lora` | 9B base + 86,6M adaptador | 262K, extensible a 1M con YaRN | Heredada del base, no evaluada tras el ajuste | apache-2.0 | SFT sobre trayectorias SWE y terminal de maestros de pesos abiertos; benchmarks no publicados |
| `Qwen/Qwen3.5-9B` (base) | 9B densos | 262K, extensible a 1M con YaRN | Si, nativa | apache-2.0 | Modelo generalista sin especialización agéntica; ~69 % en MMMU-Pro según fuentes externas |
| `armand0e/Qwen3.5-9B-Agent-LoRA` | No disponible | No disponible | No disponible | apache-2.0 | Adaptador agéntico alternativo sobre el mismo base; sin datos de entrenamiento en la información disponible |
| `armand0e/Qwen3.5-9B-Opus-Agent-LoRA` | No disponible | No disponible | No disponible | apache-2.0 | Entrenado con Unsloth y TRL según su tarjeta; procedencia de los datos no disponible |

## Limitaciones y advertencias

- El ajuste fino se hizo solo con texto: la capacidad multimodal posterior al entrenamiento no está evaluada (la evaluación se limita al subconjunto de texto de HLE).
- En Terminal-Bench solo se usó una semilla, por lo que los resultados no son comparables con la tabla de clasificación, que exige cinco ensayos.
- Los datos de terminal provienen de una única familia de tareas sintéticas (TermGrade: herramientas de línea de comandos y scripts de shell). No cubren compilación desde código fuente, entrenamiento de modelos ni tareas de seguridad.
- En las pruebas internas de tipo opencode (tareas de análisis de datos), los puntos de control del piloto SFT realizaron más llamadas a herramientas que el modelo base y entraron en bucles en algunas tareas.
- Se agotan los tokens en más turnos de agente que con el modelo base en las tareas de desarrollo del proyecto.
- Riesgo de alucinación: no se publican métricas de fiabilidad ni evaluaciones de veracidad para el adaptador.
- Sesgos: no se documenta ningún análisis de sesgo, toxicidad o equidad.
- Idioma: la model card solo declara inglés; no hay evaluación multilingüe del adaptador pese a que el base cubre 201 idiomas.
- Idoneidad comercial: la licencia Apache 2.0 lo permite, pero al tratarse de un adaptador derivado de un base con la misma licencia conviene verificar las condiciones de las fuentes de datos de maestros abiertos (Nemotron CC-BY-4.0/ODC-BY-1.0, termgrade-trajectories Apache 2.0) si se redistribuye.
- Sin benchmarks publicados, no es posible validar el rendimiento real del adaptador frente al modelo base ni frente a alternativas, a pesar de que el estudio promete esas cifras.
- El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta: no hay evidencia de uso en producción por terceros.

## Enlaces

- HuggingFace: https://huggingface.co/deanoshuang/qwen3.5-9b-agent-sft-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de código, tarjeta de datos, registros y resultados: https://github.com/Deanpuzzleai/apex-takehome
- Adaptador alternativo sobre el mismo base: https://huggingface.co/armand0e/Qwen3.5-9B-Agent-LoRA
- Adaptador alternativo sobre el mismo base: https://huggingface.co/armand0e/Qwen3.5-9B-Opus-Agent-LoRA
- Ficha del modelo base en Awesome Agents: https://awesomeagents.ai/models/qwen-3-5-9b/
- Ficha del modelo base en LLM Releases: https://www.llm-releases.com/models/qwen3-5-9b
- Ficha del modelo base en Modal: https://modal.com/library/qwen/qwen3-5-9b
