# EPFL-LARA/lean-standard-prover-qwen3-8b-reasoning-grpo

## Resumen

Lean Standard Prover — Qwen3-8B (variante *reasoning*, entrenada con GRPO) es un modelo especializado en demostración automática de teoremas en Lean 4, desarrollado por el laboratorio EPFL-LARA de la École Polytechnique Fédérale de Lausanne. Parte del modelo base Qwen/Qwen3-8B-Base y se ha afinado mediante una cadena de entrenamiento que incluye preentrenamiento continuado sobre corpus Lean, ajuste supervisado, ajuste supervisado con razonamiento explícito y una fase final de aprendizaje por refuerzo con GRPO. La tarea concreta que resuelve es recibir un enunciado de teorema con sus imports y su contexto en Lean 4 y devolver una prueba completa que sustituya el `sorry` original.

El modelo pertenece a la familia "Lean World Models" y su rol en la cadena de publicación se describe como "S8 + reasoning", en la etapa posterior al razonamiento informal. Su rasgo diferencial es que, antes de escribir código Lean, produce un plan de solución informal estructurado en secciones ([Problem Restatement], [Useful Observations], [Reasoning Path], [Key Derivation], [Proof Type], [Formal Anchors] y [Final Solution]), y que además incorpora un modo de reparación: si un intento previo falló, genera primero [Error Analysis], [Revised Reasoning] y [Updated Proof Plan] antes de la prueba corregida. Esto lo hace adecuado para bucles iterativos de demostración con verificación real contra el compilador de Lean.

Tiene 8.190.735.360 parámetros (aproximadamente 8,19 mil millones) y un repositorio de 16,4 GB en formato safetensors, sin cuantizaciones publicadas. El flujo de inferencia documentado por el autor usa vLLM 0.12.0 con un contexto total de 32.768 tokens, temperatura 0,3 para una muestra y 0,7 para 32 muestras, y top-p 0,95. Es relevante ahora porque combina un modelo pequeño (cabe en una sola GPU) con un formato de salida diseñado explícitamente para verificación formal, lo que reduce el coste de integrar demostración automática en pipelines de CI sobre librerías como Mathlib.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen/Qwen3-8B-Base; no se detalla en la model card) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens de contexto total, segun el runner de inferencia del autor |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos safetensors; no se documentan GGUF ni cuantizaciones de otro tipo) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (libreria transformers) |
| Modelo base | Qwen/Qwen3-8B-Base (relacion: finetune) |
| Variante y etapa | S8 + reasoning, etapa posterior al razonamiento informal |
| Tarea (pipeline) | text-generation |
| Datasets de entrenamiento | EPFL-LARA/lean-world-model-cpt, EPFL-LARA/lean-world-model-sft, EPFL-LARA/lean-world-model-reasoning-sft, Goedel-LM/RL_dataset_V2 |
| Tamano del repositorio | 16,4 GB |
| Fecha de creacion / actualizacion | 2026-10-16 |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-8B-Base, un transformer decoder-only denso de 8,19 mil millones de parametros, sobre el que se aplica un ajuste fino especifico de dominio. El modelo no introduce cambios estructurales propios documentados; la especializacion proviene enteramente de los datos y de las fases de entrenamiento. El pipeline de inferencia recomendado emplea un prompt de finalizacion en bruto (raw completion), tokenizacion simple con `add_special_tokens=False` y un presupuesto de 32.768 tokens de contexto total, de modo que los tokens de salida disponibles son los que quedan libres tras el enunciado del problema.

La cadena de entrenamiento se deduce de los datasets declarados: preentrenamiento continuado sobre `lean-world-model-cpt`, ajuste supervisado sobre `lean-world-model-sft`, ajuste supervisado con trazas de razonamiento sobre `lean-world-model-reasoning-sft` y una fase final de aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) sobre `Goedel-LM/RL_dataset_V2`. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del corpus, ni los hiperparametros de la fase de RL. La innovacion tecnica destacable no esta en la arquitectura sino en el protocolo de interaccion: el modelo emite un plan informal en secciones fijas antes de la prueba formal, y dispone de un modo de reparacion que analiza el error del intento anterior antes de reescribir la demostracion.

## Capacidades

- Generacion de pruebas completas en Lean 4 a partir de un enunciado de teorema que termina en `by sorry`, incluyendo imports y contexto.
- Razonamiento informal estructurado previo a la formalizacion, con las secciones [Problem Restatement], [Useful Observations], [Reasoning Path], [Key Derivation], [Proof Type], [Formal Anchors] y [Final Solution].
- Reparacion iterativa de pruebas: ante un intento fallido, produce [Error Analysis], [Revised Reasoning] y [Updated Proof Plan] antes de la solucion corregida.
- Salida en bloques de codigo `lean4` delimitados, con texto explicativo y comentarios intercalados; el runner extrae como candidato final el ultimo bloque Lean completo.
- Modo conversacional (etiqueta `conversational` en el repositorio).
- Muestreo multiple configurable: el runner ajusta la temperatura a 0,3 para una muestra y a 0,7 para 32 muestras, con top-p 0,95, lo que permite estrategias de pass@k.
- Integracion con vLLM 0.12.0 y compatibilidad declarada con text-generation-inference y endpoints.
- No se documentan capacidades de vision, audio, tool calling ni function calling en la informacion disponible.
- Capacidad multilingue limitada: el modelo esta declarado unicamente para ingles.

## Casos de uso

- Verificacion continua de librerias Lean 4: el modelo puede integrarse en un job de CI que, ante un teorema marcado con `sorry` en un PR de Mathlib, genere un candidato de prueba y lo valide con el compilador; el bucle de reparacion del modelo permite reintentar automaticamente cuando la verificacion falla.
- Asistencia a matematicos en formalizacion: dado un enunciado ya escrito en Lean, el modelo propone la demostracion y, gracias al plan informal en secciones, el investigador puede revisar la estrategia antes de aceptar el codigo.
- Generacion de datos sinteticos para entrenar otros provers: con 32 muestras por problema a temperatura 0,7 y verificacion posterior, se pueden producir pares (enunciado, prueba valida) o trayectorias de reparacion reutilizables como corpus de SFT o de RL.
- Construccion de agentes de demostracion multi-paso: el modo de reparacion hace que el modelo encaje en un bucle donde un verificador externo (Lean) devuelve el error y el modelo genera un analisis del fallo y una nueva estrategia, sin necesidad de reescribir el prompt desde cero.
- Evaluacion comparativa de provers: al exponer un runner reproducible con prompt, temperaturas y presupuesto de contexto fijos, sirve como linea base controlada para medir pass@1 y pass@32 frente a otros provers de Lean 4.
- Apoyo a la docencia de logica y teoria de tipos: el modelo no solo devuelve la prueba, sino la derivacion informal y los anclajes formales usados, lo que permite mostrar el razonamiento paso a paso sobre ejercicios academicos.
- Investigacion en aprendizaje por refuerzo sobre razonamiento formal: al ser una variante entrenada con GRPO, es un punto de partida util para estudiar como la fase de RL afecta a la tasa de exito en verificacion respecto a la variante solo SFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de pass@k, MiniF2F, ProofNet ni comparaciones cuantitativas con otros provers, y los resultados de busqueda web consultados solo contienen paginas institucionales de la EPFL sin datos de evaluacion.

## Requisitos de hardware

- VRAM estimada (calculo a partir del numero de parametros, no facilitado por el autor): en precision completa bf16/fp16 los pesos ocupan aproximadamente 16,4 GB, coherente con el tamano del repositorio; a ello hay que sumar la cache KV, que con 32.768 tokens de contexto anade varios gigabytes adicionales.
- GPU recomendadas: para bf16 sin cuantizar y contexto largo, A100 40 GB, A100 80 GB o H100; en configuraciones de contexto mas corto puede funcionar en GPUs de 24 GB.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede alojar los pesos en bf16, pero el margen para cache KV a 32.768 tokens es ajustado; no se documentan cuantizaciones oficiales que reduzcan el requisito.
- Opciones de despliegue: vLLM 0.12.0 es la via documentada y la usada por el script de inferencia del autor; el repositorio declara ademas compatibilidad con text-generation-inference y endpoints, y puede cargarse directamente con transformers. No hay archivos GGUF publicados, por lo que llama.cpp u Ollama requeririan una conversion propia.
- Latencia y throughput estimados: no disponibles.
- El runner descarga `inference.py` y `prompt_utils.py` desde el repositorio y ejecuta `python inference.py Example.lean --samples N`; la opcion `--print-prompt` permite inspeccionar el prompt sin cargar los pesos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible. La tabla recoge unicamente los datos confirmados.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Lean Standard Prover Qwen3-8B (reasoning, GRPO) | 8,19 B | 32.768 tokens (runner del autor) | No disponible | HuggingFace, repo EPFL-LARA |
| Qwen/Qwen3-8B-Base (modelo base) | 8,19 B heredados | No disponible en la informacion | No disponible en la informacion | HuggingFace |
| Otros provers de Lean 4 (DeepSeek-Prover-V2, Goedel-Prover, Kimina-Prover) | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Riesgo de alucinacion formal alto por la naturaleza de la tarea: el modelo puede producir demostraciones sintacticamente plausibles que Lean rechaza, o invocar lemas de Mathlib que no existen con ese nombre o firma. Toda salida debe verificarse con el compilador antes de usarse.
- El candidato de prueba correcto es el ultimo bloque de codigo Lean completo de la respuesta; si el modelo divaga o emite bloques parciales despues del valido, una extraccion ingenua puede seleccionar codigo incorrecto.
- Idioma: el modelo esta declarado solo para ingles, tanto en prompts como en las secciones de razonamiento informal.
- Dominio restringido: el entrenamiento gira en torno a Lean 4 y Mathlib; el rendimiento fuera de ese ecosistema (otros asistentes de pruebas o matematicas no formalizadas) no esta documentado.
- Licencia no disponible: al no especificarse la licencia del modelo ni las condiciones de los datasets de entrenamiento, el uso comercial queda en un estado juridico indeterminado y requiere consulta previa con el autor.
- La fecha de publicacion del repositorio (16 de octubre de 2026) y el contador de descargas y likes a cero indican que se trata de una publicacion muy reciente y sin validacion externa por parte de la comunidad.
- No hay cuantizaciones publicadas: desplegar en hardware modesto exige convertir los pesos por cuenta propia, con la perdida de calidad que ello implique.
- El presupuesto de contexto es compartido entre enunciado y salida: problemas con contextos de imports muy extensos reducen el espacio disponible para la prueba, y demostraciones largas pueden truncarse (`finish_reason` permite detectarlo).
- La fase de GRPO optimiza una recompensa derivada de la verificacion; como en cualquier RL con verificador, existe riesgo de comportamientos de atajo que pasen la verificacion sin corresponder a la prueba esperada.
- No se documentan sesgos especificos, pero al ser un ajuste sobre Qwen3-8B-Base hereda las limitaciones y sesgos del modelo base, no evaluados en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EPFL-LARA/lean-standard-prover-qwen3-8b-reasoning-grpo
- Coleccion "Formal Theorem Proving with Lean World Models": https://huggingface.co/collections/EPFL-LARA/formal-theorem-proving-with-lean-world-models-6ad2b4aa4400b3e2933f380d
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Dataset EPFL-LARA/lean-world-model-cpt: https://huggingface.co/datasets/EPFL-LARA/lean-world-model-cpt
- Dataset EPFL-LARA/lean-world-model-sft: https://huggingface.co/datasets/EPFL-LARA/lean-world-model-sft
- Dataset EPFL-LARA/lean-world-model-reasoning-sft: https://huggingface.co/datasets/EPFL-LARA/lean-world-model-reasoning-sft
- Dataset Goedel-LM/RL_dataset_V2: https://huggingface.co/datasets/Goedel-LM/RL_dataset_V2
- vLLM (version usada por el runner, 0.12.0): https://github.com/vllm-project/vllm
- Pagina institucional de la EPFL: https://www.epfl.ch/en/
- Perfil de la organizacion EPFL-LARA en HuggingFace: https://huggingface.co/EPFL-LARA
