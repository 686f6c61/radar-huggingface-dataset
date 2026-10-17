# EPFL-LARA/lean-standard-prover-qwen3-8b-grpo

## Resumen

Lean Standard Prover es un modelo de 8.190.735.360 parámetros (aproximadamente 8,19 mil millones) desarrollado por EPFL-LARA (Laboratory for Automated Reasoning and Analysis de la École Polytechnique Fédérale de Lausanne). Se trata de un ajuste fino de Qwen/Qwen3-8B-Base especializado en demostración automática de teoremas en Lean 4: recibe un enunciado formal con declaraciones `sorry` y devuelve una demostración completa dentro de un bloque de código `lean4`, acompañada de comentarios explicativos.

El modelo forma parte de la línea de trabajo "Formal Theorem Proving with Lean World Models" y corresponde, según su model card, al modelo S8 de un paper y a la etapa posterior al entrenamiento con GRPO (Group Relative Policy Optimization). Su ciclo de entrenamiento combina preentrenamiento continuado (`lean-world-model-cpt`), ajuste supervisado (`lean-world-model-sft`) y optimización por refuerzo sobre `Goedel-LM/RL_dataset_V2`.

Es relevante porque aborda una tarea muy concreta y verificable: la generación de pruebas formales que pueden comprobarse mecánicamente con el comprobador Lean 4, lo que elimina el problema de la alucinación no detectable siempre que se integre un paso de verificación. El modelo está pensado para ejecutarse con vLLM 0.12.0, con una ventana total de 32.768 tokens y muestreo configurable (temperatura 0,3 para una muestra y 0,7 para 32 muestras, top-p 0,95).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en total (runner de inferencia documentado) |
| Tipos de cuantizacion | No disponible. El repositorio publica pesos en safetensors con un tamano de 16,4 GB, consistente con bf16/fp16 (2 bytes por parametro); no se documentan cuantizaciones oficiales |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (libreria `transformers`) |
| Modelo base | Qwen/Qwen3-8B-Base (relacion: finetune) |
| Tarea | Text-generation (demostracion de teoremas en Lean 4) |
| Datasets de entrenamiento | EPFL-LARA/lean-world-model-cpt, EPFL-LARA/lean-world-model-sft, Goedel-LM/RL_dataset_V2 |
| Fecha de creacion (HuggingFace) | 2026-10-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3-8B en su variante base, un transformer decoder-only denso con alrededor de 8,19 mil millones de parametros. Sobre esa base, EPFL-LARA aplica un pipeline de adaptacion en tres etapas: preentrenamiento continuado sobre un corpus de contenido Lean (`lean-world-model-cpt`), ajuste supervisado sobre pares de enunciado y demostracion (`lean-world-model-sft`) y, finalmente, optimizacion con GRPO sobre un dataset de refuerzo (`Goedel-LM/RL_dataset_V2`). La model card identifica esta version como el modelo S8 del paper asociado, en la etapa "After GRPO".

El comportamiento de inferencia esta condicionado por una plantilla de prompt fija, en formato de completion crudo (raw completion) y con tokenizacion simple mediante `add_special_tokens=False`. El prompt instruye al modelo a resolver el problema con codigo Lean 4 y comentarios explicativos, incluye el enunciado formal con sus imports y contexto, y termina con la frase "Replace every sorry statement with an appropriate proof. Provide a complete solution in the lean4 code block.". La respuesta esperada es texto con uno o varios bloques `lean4`; el runner extrae como candidato final el ultimo bloque de codigo Lean completo y devuelve en JSONL el campo `response`, el `lean_code` extraido y el `finish_reason`. No se documentan en la informacion disponible innovaciones tecnicas adicionales como decodificacion especulativa o mecanismos de atencion alternativos.

## Capacidades

- Generacion de demostraciones completas en Lean 4 a partir de un enunciado formal que contiene `sorry`, respetando la plantilla del "standard prover".
- Razonamiento formal y matematico orientado a la libreria Mathlib, segun el ejemplo de la model card (`import Mathlib`).
- Generacion de explicaciones y comentarios en lenguaje natural junto al codigo, dentro de la misma respuesta.
- Muestreo multiple de candidatos de demostracion: la configuracion documentada permite generar 1 muestra (temperatura 0,3) o 32 muestras (temperatura 0,7) con top-p 0,95, lo que habilita busqueda por muestreo y verificacion posterior.
- Salida estructurada y parseable: bloques de codigo `lean4` y campos JSONL (`response`, `lean_code`, `finish_reason`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada (el flujo documentado es una unica llamada de completion con verificacion externa).
- Capacidades multilingues: limitadas a ingles segun el campo `language` de la model card.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada. Aunque el repositorio incluye la etiqueta `conversational`, la ruta de inferencia documentada usa una plantilla de completion cruda, no una plantilla de chat.

## Casos de uso

- Completado automatico de `sorry` en proyectos Lean: el modelo recibe un fichero `.lean` con imports, contexto y el teorema terminado en `by sorry`, y devuelve una prueba candidata. Es adecuado porque su entrenamiento esta especificamente alineado con ese formato de entrada y salida.
- Verificacion asistida en integracion continua: integrado en un pipeline de CI que ejecute el comprobador Lean sobre el `lean_code` extraido de la respuesta, se puede usar para proponer pruebas que luego se validan mecanicamente, evitando aceptar codigo no compilable.
- Busqueda por muestreo con verificacion (best-of-n): con 32 muestras a temperatura 0,7 y top-p 0,95, el modelo genera multiples candidatos por teorema; el primero que Lean acepte se adopta como prueba final. Este esquema es habitual en demostracion automatica y aprovecha el soporte de muestreo multiple documentado.
- Asistencia a matematicos en formalizacion: dado un enunciado ya formalizado, el modelo produce una primera demostracion que el investigador puede revisar, corregir o refactorizar, reduciendo el coste de arranque en proyectos de formalizacion sobre Mathlib.
- Generacion de datos sinteticos de demostraciones: los pares (enunciado, prueba verificada) producidos por el modelo pueden emplearse como datos de entrenamiento o destilacion para otros demostradores, filtrando previamente por verificacion con Lean.
- Automatizacion de tareas de mantenimiento en librerias formales: cuando una actualizacion de Mathlib rompe pruebas existentes, el modelo puede proponer reparaciones a partir del enunciado y el contexto actualizado.
- Uso docente: generacion de demostraciones comentadas paso a paso para cursos de logica o teoria de tipos, siempre que el resultado se valide con Lean antes de su distribucion.
- Prototipado de agentes de prueba de teoremas: el modelo puede actuar como el componente generador de un agente que combine busqueda, ejecucion del comprobador y reintentos, aunque la orquestacion multi-paso no viene implementada en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de evaluacion (por ejemplo, sobre miniF2F, ProofNet u otros conjuntos estandar de demostracion formal), y la busqueda web realizada no aporto resultados tecnicos sobre este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16,4 GB solo para los pesos (coincide con el tamano del repositorio de 16,4 GB para 8.190.735.360 parametros). Hay que anadir la memoria de la cache KV, que crece con la longitud de contexto (hasta 32.768 tokens) y con el numero de secuencias concurrentes, por lo que en la practica se recomienda disponer de mas de 20 GB.
- VRAM estimada en cuantizaciones de 8 y 4 bits: del orden de 8,2 GB y 4,1 GB respectivamente, calculadas a partir del numero de parametros. Son estimaciones aritmeticas, no cifras publicadas por el autor.
- GPU recomendadas: el autor indica que vLLM se ejecuta en una GPU soportada, sin especificar modelos. Por el tamano del modelo encajan A100 40/80 GB, H100, L40S 48 GB y tarjetas de 24 GB (RTX 4090, RTX 3090) para despliegues en bf16 con contextos moderados o en cuantizacion para contextos largos.
- GPU de consumo: el modelo cabe en GPUs de consumo de 24 GB en bf16 si se limita la longitud de contexto y el batch; en tarjetas de 16 GB o menos seria necesario recurrir a cuantizacion (no documentada oficialmente).
- Opciones de despliegue: vLLM 0.12.0 es la ruta documentada en el quickstart (`pip install 'vllm==0.12.0'`) junto con los scripts `inference.py` y `prompt_utils.py` descargados desde el repositorio. El repositorio tambien incluye etiquetas de `text-generation-inference` y `endpoints_compatible`, lo que apunta a compatibilidad con TGI y con endpoints gestionados. El uso con llama.cpp, Ollama u otros runners requiere conversion de pesos, ya que solo se publican safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que la comparacion se limita a caracteristicas objetivas. Alternativas de la misma categoria (demostradores de teoremas basados en modelos de 7-8 mil millones de parametros, como los de la familia Goedel-Prover, cuyo dataset de refuerzo emplea este modelo, o DeepSeek-Prover) no aparecen descritas en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| EPFL-LARA/lean-standard-prover-qwen3-8b-grpo | 8,19 mil millones | 32.768 tokens (runner documentado) | No disponible | HuggingFace (0 descargas, 0 likes) |
| Qwen/Qwen3-8B-Base (modelo base) | Aproximadamente 8 mil millones (no disponible el dato exacto en la informacion proporcionada) | No disponible | No disponible | HuggingFace |
| Otros demostradores de teoremas de ~7-8B | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no especificada: la model card y los metadatos no indican licencia, por lo que el uso comercial queda sin cobertura legal clara hasta que el autor la publique. Conviene consultar tambien las condiciones del modelo base Qwen/Qwen3-8B-Base.
- Riesgo de alucinacion en el codigo generado: el modelo puede producir demostraciones sintacticamente plausibles que no compilan o que invocan lemas inexistentes. La verificacion con Lean es obligatoria; sin ella, la salida no tiene valor probatorio.
- Formato de respuesta fragil: el runner asume que el candidato valido es el ultimo bloque de codigo Lean completo. Respuestas con bloques incompletos, truncadas o con formato distinto pueden degradar la extraccion.
- Limite de idioma: el campo `language` solo declara ingles. Aunque Lean 4 es un lenguaje formal, las instrucciones y comentarios del modelo estan orientados a prompts en ingles.
- Presupuesto de contexto compartido: los 32.768 tokens cubren prompt y salida, y el prompt incluye imports y contexto del teorema, de modo que en problemas grandes el espacio para la demostracion se reduce.
- Ausencia de validacion comunitaria: el repositorio registra 0 descargas y 0 likes, y no se han publicado benchmarks, lo que impide estimar su calidad relativa frente a otros demostradores.
- Etiqueta `conversational` no respaldada por la ruta de inferencia documentada: el flujo oficial usa una plantilla de completion cruda con `add_special_tokens=False`, no una plantilla de chat con turnos.
- Sesgos potenciales: al entrenarse sobre todo con contenido de Lean/Mathlib, su cobertura se concentra en las matematicas formalizadas en esas librerias y puede degradarse fuera de ese dominio. No se documentan analisis de sesgo.
- Dependencia de version: el quickstart fija vLLM 0.12.0; otras versiones pueden requerir ajustes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EPFL-LARA/lean-standard-prover-qwen3-8b-grpo
- Coleccion "Formal Theorem Proving with Lean World Models": https://huggingface.co/collections/EPFL-LARA/formal-theorem-proving-with-lean-world-models-6ad2b4aa4400b3e2933f380d
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Dataset de preentrenamiento continuado: https://huggingface.co/datasets/EPFL-LARA/lean-world-model-cpt
- Dataset de ajuste supervisado: https://huggingface.co/datasets/EPFL-LARA/lean-world-model-sft
- Dataset de refuerzo: https://huggingface.co/datasets/Goedel-LM/RL_dataset_V2
- Organizacion EPFL-LARA en HuggingFace: https://huggingface.co/EPFL-LARA
- Sitio de EPFL: https://www.epfl.ch/
- Nota: la busqueda web realizada no devolvio papers, blogs ni repositorios especificos de este modelo; los unicos resultados obtenidos fueron paginas institucionales generales sobre EPFL.
