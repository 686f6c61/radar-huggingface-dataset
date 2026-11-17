# eth-algopt/AuXSpec-9B-RL

## Resumen

AuXSpec-9B-RL es un modelo de lenguaje especializado en autoformalización de especificaciones de programas, desarrollado por el grupo eth-algopt (ETH Zurich, en colaboración con HKUST y el Institute for Theoretical Studies de ETH). Se construye a partir de Qwen3.5-9B mediante un proceso de ajuste supervisado (SFT) seguido de aprendizaje por refuerzo (RL) con una recompensa basada en ejecución. El problema que aborda es el cuello de botella de la escritura de especificaciones formales en asistentes de demostración como Lean 4, una tarea lenta y que exige gran especialización y que limita el escalado de código formalmente verificado.

El modelo genera, a partir de un enunciado de problema de programación en lenguaje natural, un fichero Lean 4 completo (Lean 4.32, Mathlib) que incluye un predicado de validez sobre las entradas, una especificación declarativa de la salida correcta, un comprobador ejecutable y casos de prueba `#guard`. También aborda tareas de generación de código a partir de una especificación y de reparación de ficheros que fallan. Es relevante ahora porque demuestra que una recompensa basada en la ejecución de postcondiciones ejecutables emparejadas con sus contrapartes declarativas permite mejorar drásticamente el rendimiento en generación de especificaciones sin necesidad de pruebas formales explícitas.

Con 9.409.813.744 parámetros totales, pesos en BF16 safetensors y una longitud de contexto evaluada de 32K tokens, el modelo razona dentro de etiquetas `</think>` antes de emitir la respuesta. Su licencia Apache 2.0 y su base Qwen3.5-9B lo hacen desplegable en infraestructura convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3_5ForConditionalGeneration), con modo de razonamiento en ` thinking...</think>` |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32K tokens (contexto evaluado; `max_model_len=32768` en vLLM) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en BF16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-9B, un transformer decoder-only (`Qwen3_5ForConditionalGeneration`) que conserva su tokenizador. El modelo opera con un modo de razonamiento explícito: genera un bloque ` thinking...</think>` antes de la respuesta final, lo que le permite planificar la construccion del fichero Lean 4. Las evaluaciones se ejecutan en vLLM con `max_model_len=32768` y `max_tokens=16384`.

El entrenamiento combina dos fases. Primero, un ajuste supervisado sobre 19.5K muestras construidas a lo largo de tres rondas de *expert iteration* sobre problemas de LeetCode y TACO; cada ronda reajusta el modelo desde el base sobre las muestras acumuladas y anade las salidas que cumplen los criterios de aceptacion. Despues, aprendizaje por refuerzo sobre 8.281 tareas de SpecGen y 5.356 de CodeGen, con una recompensa progresiva que sigue el orden de los criterios de aceptacion: que el fichero compile, que los `#guard` reproduzcan los casos de prueba dados y que pasen las comprobaciones de calidad basadas en juez. Solo cuentan como fallo de compilacion los tests que invocan una declaracion de la salida, las salidas que asumen hechos no probados o que evitan la comprobacion del kernel, y las reparaciones sin cambios reciben recompensa cero. Las tareas de reparacion se generan en linea a partir de rollouts fallidos de la politica actual, emparejadas con mensajes del compilador, y ocupan el 40% de cada lote.

El algoritmo extiende DAPO con normalizacion de ventaja a nivel de lote, una penalizacion KL hacia el modelo ajustado y una mascara de perdida sobre rollouts repetitivos. Para CodeGen, una implementacion correcta que un juez encuentra asintoticamente mas lenta que un algoritmo conocido en la entrada admitida mas grande recibe recompensa reducida, de modo que el modelo aprende a generar codigo eficiente. Las respuestas demasiado largas se penalizan cerca del limite de longitud.

## Capacidades

- Generacion de especificaciones formales en Lean 4 (Lean 4.32, Mathlib) a partir de enunciados en lenguaje natural: predicado de validez de entradas, postcondicion declarativa, comprobador ejecutable y casos `#guard`.
- Generacion de codigo a partir de una especificacion formal dada (CodeGen).
- Reparacion de ficheros Lean 4 que fallan, tanto de especificaciones como de codigo, a partir del fichero defectuoso y de la retroalimentacion del comprobador (SpecGen-Repair y CodeGen-Repair).
- Razonamiento multi-paso explicito mediante el bloque ` thinking...</think>` antes de la respuesta.
- Generacion de codigo eficiente: el entrenamiento con RL penaliza implementaciones asintoticamente mas lentas que un algoritmo de referencia.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos del modelo.
- Capacidades de vision o audio: no disponibles; el modelo es de texto.

## Casos de uso

- Autoformalizacion de especificaciones en proyectos de verificacion formal: dado un enunciado de problema, el modelo produce un fichero Lean 4 con postcondicion declarativa, comprobador ejecutable y casos de prueba, reduciendo el trabajo manual de escribir especificaciones en Mathlib.
- Generacion de codigo verificado en pipelines de desarrollo: a partir de una especificacion formal existente, el modelo genera una implementacion en Lean 4 que puede comprobarse con el kernel, adecuado para integrarse en flujos de integracion continua con verificacion formal.
- Reparacion automatica de ficheros de especificacion o codigo que no compilan: el modelo recibe el fichero fallido y los mensajes del compilador y devuelve una version corregida, util para asistentes de desarrollo en entornos Lean.
- Construccion de datasets de entrenamiento para modelos de formalizacion: el modelo puede generar candidatos de especificaciones y codigo que, tras filtrarse por compilacion y ejecucion de `#guard`, alimentan procesos de *expert iteration*.
- Docencia e investigacion en metodos formales: sirve para generar ejemplos de especificaciones Lean 4 a partir de problemas de programacion, con casos de prueba ejecutables que ilustran el comportamiento esperado.
- Evaluacion de teoremas y propiedades en entornos de verificacion: el modelo puede proponer postcondiciones ejecutables emparejadas con sus contrapartes declarativas, lo que permite comprobar propiedades mediante ejecucion sobre casos de prueba en lugar de pruebas formales completas.
- Generacion de codigo eficiente con restricciones de complejidad: gracias a la recompensa que penaliza implementaciones asintoticamente lentas, puede emplearse para proponer implementaciones de referencia en tareas de optimizacion.

## Benchmarks y rendimiento

Los resultados publicados en la model card son los siguientes. En SpecGen sobre AuXSpec-Test, el modelo de 9B pasa de 0,7% a 82,7% en pass@4 con el entrenamiento RL. En el benchmark fuera de dominio Verina con casos de prueba en el prompt, pasa de 18,5% a 96,8% en pass@4. Sin casos de prueba en el prompt, el modelo de 27B supera al estado del arte previo entre modelos abiertos de especificacion (VeriSpecGen-30B-A3B) en pass@1 (84,5% frente a 47,6%); para el modelo de 9B no se detalla el valor concreto en la informacion disponible.

| Benchmark | Metrica | AuXSpec-9B-RL | Base (Qwen3.5-9B) |
|---|---|---|---|
| AuXSpec-Test (SpecGen) | pass@4 | 82,7% | 0,7% |
| Verina (SpecGen, con casos de prueba en el prompt) | pass@4 | 96,8% | 18,5% |
| Verina (SpecGen, sin casos de prueba) | pass@1 | no disponible para 9B | no disponible |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18,8 GB solo para los pesos (9,4B parametros x 2 bytes), mas overhead de KV cache y activaciones; en la practica se recomienda al menos 24 GB para contexto moderado.
- Cuantizacion: no se documentan cuantizaciones oficiales; al ser un modelo de 9,4B, cabria esperar variantes GGUF/AWQ de la comunidad, pero no estan disponibles en la informacion proporcionada.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para BF16 con contexto limitado; para el contexto completo de 32K y `max_tokens=16384` conviene A100/H100.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en BF16 con contexto reducido, o en GPUs de 16 GB si se dispone de cuantizacion (no publicada oficialmente).
- Opciones de despliegue: vLLM es el entorno usado en las evaluaciones (`max_model_len=32768`, `max_tokens=16384`); al conservar la arquitectura y tokenizador de Qwen3.5-9B, es compatible con el ecosistema habitual de Qwen (TGI, llama.cpp/Ollama mediante conversion, entre otros), aunque no se documentan recetas oficiales.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Rendimiento destacado |
|---|---|---|---|---|---|
| AuXSpec-9B-RL | 9,4B | 32K | Autoformalizacion Lean 4 con RL basado en ejecucion | apache-2.0 | SpecGen pass@4 82,7% en AuXSpec-Test; 96,8% en Verina con casos de prueba |
| AuXSpec-27B-RL | 27,4B | 32K | Igual, mayor escala | apache-2.0 | SpecGen pass@1 84,5% en Verina sin casos de prueba |
| VeriSpecGen-30B-A3B | 30B (MoE, ~3B activos) | no disponible | Generacion de especificaciones | no disponible | SpecGen pass@1 47,6% en Verina sin casos de prueba (referencia previa) |
| Qwen3.5-9B (base) | 9,4B | 32K | Modelo generalista | apache-2.0 | SpecGen pass@4 0,7% en AuXSpec-Test; 18,5% en Verina con casos de prueba |

## Limitaciones y advertencias

- El modelo esta entrenado y evaluado exclusivamente en ingles; su rendimiento en otros idiomas no esta documentado y previsiblemente sera deficiente.
- Dominio muy restringido: esta especializado en generacion de especificaciones y codigo en Lean 4 (Lean 4.32, Mathlib) para problemas de tipo LeetCode/TACO; no es un modelo generalista.
- Riesgo de alucinacion: puede generar ficheros Lean 4 que no compilen o que asuman hechos no probados; el entrenamiento penaliza estos casos, pero no los elimina. Se recomienda validar siempre con el compilador y el kernel.
- Dependencia de version: los resultados se obtuvieron con Lean 4.32 y Mathlib; cambios de version pueden degradar la validez de las salidas.
- La recompensa de RL depende de jueces (implementation judge y quality checks) cuyo comportamiento no se detalla completamente en la informacion disponible, lo que puede introducir sesgos en el estilo de codigo generado.
- Licencia Apache 2.0: permite uso comercial, pero se deben conservar los avisos de licencia y atribucion correspondientes.
- El modelo base Qwen3.5-9B puede arrastrar sesgos de sus datos de entrenamiento originales; no se documentan analisis de sesgo especificos.
- No se documentan cuantizaciones oficiales ni recetas de despliegue fuera de vLLM, lo que puede complicar el despliegue en entornos con recursos limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eth-algopt/AuXSpec-9B-RL
- Modelo de 27B: https://huggingface.co/eth-algopt/AuXSpec-27B-RL
- Coleccion AuXSpec: https://huggingface.co/collections/eth-algopt/auxspec
- Paper principal (AuXSpec): https://arxiv.org/abs/2611.21421
- Sitio web del proyecto: https://auxspec.org
- Paper DAPO (base del algoritmo RL): https://arxiv.org/abs/2503.14476
- Paper referenciado: https://arxiv.org/abs/2505.23135
- Paper referenciado: https://arxiv.org/abs/2604.10392
- Paper referenciado: https://arxiv.org/abs/2501.12948
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
