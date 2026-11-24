# gopichand55k/repofix-qwen25-coder-1.5b-qlora-v0

## Resumen

`repofix-qwen25-coder-1.5b-qlora-v0` es un adaptador QLoRA de 4 bits (NF4) entrenado sobre el modelo base `Qwen/Qwen2.5-Coder-1.5B-Instruct`. Lo publica el usuario `gopichand55k` como componente del sistema **RepoFix AI**, una herramienta orientada al diagnostico de bugs a nivel de repositorio y a la sintesis de parches en formato unified diff. No se trata de un modelo completo, sino de un conjunto de pesos LoRA que debe cargarse junto al modelo base para funcionar.

El adaptador esta especializado en una tarea concreta: dado un contexto de repositorio (simbolos AST, resultados de busqueda BM25 y expansion Graph-RAG de imports), generar un diagnostico del fallo y un parche en formato diff que pueda aplicarse en un worktree aislado y validarse con `pytest`. El entrenamiento se realizo sobre el split `dev` de `SWE-bench_Lite`, particionado de forma determinista por hash SHA-256 del repositorio, excluyendo estrictamente el split `test` del benchmark.

Su relevancia es acotada pero clara: demuestra que es posible ajustar un modelo de 1.5B parametros para reparacion de codigo asistida por repositorio en hardware de consumo (una RTX 3050 de 4 GB), lo que lo convierte en una referencia practica para quienes quieran replicar pipelines de code repair con recursos limitados. La ficha se basa unicamente en la model card publicada; no hay informacion sobre evaluacion cuantitativa ni sobre licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen2.5-Coder-1.5B-Instruct |
| Parametros totales | No disponible (adaptador LoRA con r=16; el modelo base tiene 1.5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card (max sequence length de entrenamiento: 1024 tokens) |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4 con doble cuantizacion (`bnb_4bit_use_double_quant=True`) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen2.5-Coder-1.5B-Instruct`, un transformer decoder-only de 1.5B parametros especializado en codigo. La configuracion LoRA usa rango `r=16`, `lora_alpha=32` y `lora_dropout=0.05`, con modulos objetivo `q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj`, es decir, atencion y MLP completos. El entrenamiento se realizo en 4-bit NF4 con doble cuantizacion, longitud maxima de secuencia de 1024 tokens, optimizador `paged_adamw_8bit`, learning rate `2e-4` y semilla 42, todo ello sobre una NVIDIA GeForce RTX 3050 4GB Laptop GPU.

El dataset proviene de `SWE-bench/SWE-bench_Lite`, split `dev`, particionado de forma determinista mediante hash SHA-256 del repositorio en subconjuntos disjuntos de entrenamiento y validacion; el split `test` del benchmark queda excluido del entrenamiento. No se documentan el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO. La innovacion principal no esta en la arquitectura (que es LoRA estandar) sino en el pipeline de datos y en la integracion con un sistema de recuperacion (BM25 + Graph-RAG) y un sandbox de validacion.

## Capacidades

- Generacion de texto y razonamiento sobre codigo en ingles.
- Diagnostico de bugs a nivel de repositorio a partir de contexto recuperado (simbolos AST, imports, resultados BM25).
- Sintesis de parches en formato unified diff aplicables a un repositorio.
- Integracion en un pipeline con validacion automatica: `agent/patch_validator.py` y ejecucion en `sandbox/docker_runner.py`.
- Soporte de contexto de repositorio mediante Graph-RAG y expansion de simbolos e imports (funcionalidad del sistema, no del adaptador en si).
- Capacidades multilingues: limitadas al ingles segun la model card.
- Tool calling / function calling: no documentado.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Reparacion automatizada de bugs en repositorios Python: el adaptador recibe contexto de simbolos y genera un diff candidato que se valida en un worktree aislado antes de aplicarse.
- Revision de pull requests: dentro del modulo PR Reviewer de RepoFix AI, el modelo puede proponer correcciones sobre el diff revisado y senalar lineas problematicas.
- Generacion de parches en pipelines de CI: integrado con `pytest` en sandbox Docker, permite ejecutar pruebas sobre el parche propuesto antes de fusionarlo.
- Asistencia a desarrolladores en depuracion: dado un stack trace y el contexto del repositorio, el modelo produce un diagnostico y un parche inicial que el desarrollador revisa.
- Prototipado de agentes de code repair en hardware de consumo: al entrenarse en una RTX 3050 de 4 GB, sirve como base para experimentos de bajo coste en entornos con recursos limitados.
- Investigacion sobre SWE-bench: al derivarse del split `dev` de `SWE-bench_Lite` con particionado por hash, es util para estudiar tecnicas de QLoRA en tareas de reparacion de software sin contaminar el split de test.
- Educacion y demostraciones: el sistema RepoFix AI incluye una UI Streamlit con modulos Bug Detective, Patch Lab y Bench Lab, util para mostrar el flujo completo de diagnostico y parcheo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador ocupa aproximadamente 0.1 GB en el repositorio; debe cargarse junto al modelo base `Qwen2.5-Coder-1.5B-Instruct`.
- Entrenamiento realizado en una NVIDIA GeForce RTX 3050 4GB Laptop GPU, lo que indica que el ajuste es viable en GPUs de consumo con 4 GB de VRAM en configuracion 4-bit.
- Inferencia: el modelo base de 1.5B en 4-bit requiere del orden de 1-2 GB de VRAM; en FP16, en torno a 3 GB. Cabe en GPUs de consumo como RTX 3050, RTX 3060, RTX 4060 o superiores.
- Despliegue: al ser un adaptador PEFT, se carga con la libreria `peft` sobre el modelo base; es compatible con frameworks que soporten LoRA (por ejemplo, vLLM con soporte de adaptadores, o transformers + peft). No se documentan opciones de despliegue especificas en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| repofix-qwen25-coder-1.5b-qlora-v0 | Adaptador sobre 1.5B | No disponible (entrenamiento a 1024) | Reparacion de bugs y diffs | No disponible | Hugging Face (0 descargas) |
| Qwen2.5-Coder-1.5B-Instruct | 1.5B | No disponible en esta ficha | Codigo general | No disponible en esta ficha | Hugging Face (oficial) |
| Adaptadores QLoRA para code repair de mayor tamano | Variable | Variable | Reparacion de codigo | Variable | Variable |

La comparativa cuantitativa con alternativas no esta disponible en la informacion proporcionada; los datos de rendimiento de los modelos comparables no se han publicado en la model card.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: requiere cargar el modelo base `Qwen/Qwen2.5-Coder-1.5B-Instruct`.
- Solo soporta ingles segun la model card.
- Longitud de contexto de entrenamiento limitada a 1024 tokens, lo que restringe la cantidad de contexto de repositorio que puede procesar de una vez.
- Los parches generados deben validarse siempre con `agent/patch_validator.py` y ejecutarse en un worktree aislado o sandbox (`sandbox/docker_runner.py`) antes de aplicarse a un repositorio real.
- Riesgo de alucinacion en la generacion de diffs: el modelo puede producir parches sintacticamente validos pero semanticamente incorrectos.
- Entrenado sobre el split `dev` de `SWE-bench_Lite`; el rendimiento en repositorios fuera de esa distribucion no esta documentado.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Sin descargas registradas y con un solo like en el momento de la consulta; se trata de un artefacto de investigacion temprano, no de un modelo con soporte de produccion.
- No hay informacion sobre sesgos, evaluacion de seguridad ni pruebas de robustez.

## Enlaces

- Hugging Face: https://huggingface.co/gopichand55k/repofix-qwen25-coder-1.5b-qlora-v0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/SWE-bench/SWE-bench_Lite
- Paper de SWE-bench: no disponible en la informacion proporcionada
- Repositorio del sistema RepoFix AI: no disponible en la informacion proporcionada
- Demo: no disponible
