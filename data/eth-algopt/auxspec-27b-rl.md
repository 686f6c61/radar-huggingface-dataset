# eth-algopt/AuXSpec-27B-RL

## Resumen

AuXSpec-27B-RL es un modelo de lenguaje especializado en autoformalizacion de especificaciones de programas, desarrollado por el grupo eth-algopt (Departamento de Informatica de ETH Zurich, en colaboracion con HKUST y el Institute for Theoretical Studies de ETH). Se construye sobre Qwen3.8-27B mediante un proceso de ajuste supervisado seguido de aprendizaje por refuerzo, y su proposito es generar ficheros completos de Lean 4 (version 4.32 con Mathlib) a partir de problemas de programacion descritos en lenguaje natural.

El problema que aborda es el cuello de botella que supone escribir especificaciones formales en asistentes de pruebas como Lean: es lento y requiere mucha experiencia. El modelo produce, para una tarea dada, una especificacion declarativa de la salida correcta, un predicado de validez sobre las entradas, un verificador ejecutable y casos de prueba `#guard`, o bien una implementacion que satisface una especificacion, o una reparacion de un fichero fallido a partir de la realimentacion del compilador. La innovacion clave es el framework AuXSpec, que empareja postcondiciones declarativas con contrapartidas ejecutables mediante resolucion de typeclasses en Lean, de modo que la ejecucion de tests sirve como recompensa de RL sin necesidad de pruebas formales completas.

El modelo tiene 27.356.728.560 parametros (27,4B), se distribuye en BF16 safetensors, emplea la arquitectura y el tokenizador de su modelo base (`Qwen3_5ForConditionalGeneration`) y se evalua con una ventana de contexto de 32K tokens. Su licencia es Apache 2.0 y esta pensado exclusivamente para ingles. Es relevante ahora porque supera al estado del arte previo entre los modelos de especificacion de codigo abierto (VeriSpecGen-30B-A3B) en pass@1 sin casos de prueba en el prompt (84,5% frente a 47,6%).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (clase `Qwen3_5ForConditionalGeneration`, heredada de Qwen3.8-27B), con modo de razonamiento explicito en `<think>...</think>` |
| Parametros totales | 27.356.728.560 (27,4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32K tokens (contexto evaluado; `max_model_len=32768` en vLLM) |
| Tipos de cuantizacion | no disponible (los pesos se publican en BF16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), libreria transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B y conserva su arquitectura y tokenizador. Sobre esa base se aplica un ajuste supervisado con 19.5K muestras, construidas en tres rondas de iteracion experta sobre problemas de LeetCode y TACO: en cada ronda se ajusta el modelo desde el modelo base sobre las muestras acumuladas y se anaden las salidas que cumplen los criterios de aceptacion. A continuacion se ejecuta RL sobre 8.281 tareas de SpecGen y 5.356 de CodeGen.

La recompensa es progresiva y sigue el orden de los criterios de aceptacion: que el fichero compile, que los `#guard` reproduzcan los casos de prueba dados y que pasen las comprobaciones de calidad basadas en un juez. Solo cuentan como fallo de compilacion los tests que llaman a una declaracion de la salida, las salidas que asumen hechos no probados o que evitan la comprobacion del kernel, y las reparaciones que devuelven el fichero sin cambios reciben recompensa cero. Las tareas de reparacion se generan en linea a partir de rollouts fallidos de la politica actual, emparejados con mensajes del compilador, y ocupan el 40% de cada lote. El algoritmo extiende DAPO con normalizacion de ventaja a nivel de lote, penalizacion KL hacia el modelo ajustado y mascara de perdida en rollouts repetitivos. Para CodeGen, una implementacion correcta que un juez considera asintoticamente mas lenta que un algoritmo conocido en la entrada admitida mas grande recibe recompensa reducida, de modo que el modelo aprende a generar codigo eficiente. Las respuestas excesivamente largas se penalizan cerca del limite de longitud.

El componente tecnico distintivo es el framework AuXSpec: cada postcondicion declarativa se empareja con una postcondicion booleana ejecutable sobre pares entrada-salida, obtenida por resolucion de typeclasses en Lean cuando existe una instancia de decidibilidad y definida aparte en caso contrario. Un teorema de equivalencia demuestra que ambas postcondiciones coinciden sobre entradas validas, de forma que ejecutar el verificador sobre un caso de prueba decide la postcondicion declarativa y la especificacion queda independiente de cualquier implementacion. Con este esquema se sintetizaron 3.037 problemas de LeetCode con teoremas de equivalencia probados.

## Capacidades

- Generacion de especificaciones formales en Lean 4 (4.32 con Mathlib): predicado de validez sobre entradas, especificacion declarativa de la salida correcta, verificador ejecutable y casos de prueba `#guard` (tarea SpecGen).
- Generacion de codigo a partir de una especificacion formal dada (tarea CodeGen), con incentivo de entrenamiento hacia implementaciones eficientes.
- Reparacion de especificaciones y de codigo (SpecGen-Repair y CodeGen-Repair): recibe un fichero fallido y la realimentacion del verificador y devuelve el fichero corregido.
- Razonamiento explicito: el modelo razona dentro de `<think>...</think>` antes de emitir la respuesta.
- Autoformalizacion desde lenguaje natural: traduce enunciados de problemas de programacion a artefactos formales verificables.
- Generacion de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`) y ejecucion en vLLM.
- Capacidades multilingues: limitadas al ingles.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Vision y audio: no disponible en la informacion proporcionada (pese a la etiqueta `image-text-to-text` del repositorio, la model card no documenta capacidades multimodales).

## Casos de uso

- Generacion de especificaciones para verificacion formal de codigo: dado un enunciado de problema en lenguaje natural, el modelo emite un fichero Lean 4 con postcondicion declarativa, predicado de validez, verificador ejecutable y `#guard`, listo para integrarse en un pipeline de verificacion. Es adecuado porque su entrenamiento con recompensa basada en ejecucion garantiza que la especificacion sea comprobable mecanicamente.
- Autoformalizacion a escala en proyectos de investigacion: con pass@4 del 84,3% en AuXSpec-Test, permite procesar lotes de problemas y generar candidatos de especificacion que luego se filtran con el compilador y los tests, reduciendo el trabajo manual de expertos en Lean.
- Reparacion automatizada de pruebas fallidas: integrado en un bucle de CI que compile el fichero Lean, capture los mensajes del compilador y los pase al modelo en modo SpecGen-Repair o CodeGen-Repair para obtener una version corregida; el modelo fue entrenado especificamente con esta realimentacion.
- Generacion de codigo verificado a partir de especificaciones: en entornos donde la especificacion formal ya existe, el modelo produce una implementacion en Lean que satisface el contrato, con penalizacion durante el entrenamiento hacia soluciones asintoticamente eficientes.
- Construccion de datasets de entrenamiento para modelos de formalizacion: las salidas aceptadas por el compilador y los tests pueden servir como nuevas muestras en iteraciones expertas, replicando el procedimiento usado para crecer el SFT hasta 19.5K muestras.
- Asistencia a docentes y estudiantes de metodos formales: dado un problema de programacion, el modelo genera la especificacion y los casos de prueba, lo que permite disponer de material de partida verificable para cursos de logica, verificacion o Lean.
- Evaluacion comparativa de modelos de especificacion: sirve como referencia de codigo abierto en benchmarks como Verina y AuXSpec-Test, con resultados publicados frente a VeriSpecGen-30B-A3B.

## Benchmarks y rendimiento

Resultados publicados en la model card (pass@1 y pass@4 segun se indica):

| Benchmark y configuracion | AuXSpec-27B-RL | AuXSpec-9B-RL | Referencia |
|---|---|---|---|
| AuXSpec-Test, SpecGen pass@4 (antes del RL) | 14,3% | 0,7% | — |
| AuXSpec-Test, SpecGen pass@4 (tras RL) | 84,3% | 82,7% | — |
| Verina, SpecGen pass@4 con casos de prueba en el prompt (antes del RL) | 55,0% | 18,5% | — |
| Verina, SpecGen pass@4 con casos de prueba en el prompt (tras RL) | 96,8% | 96,8% | — |
| Verina, SpecGen pass@1 sin casos de prueba en el prompt | 84,5% | no disponible | VeriSpecGen-30B-A3B: 47,6% |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales. Las evaluaciones se ejecutaron en vLLM con `max_model_len=32768` y `max_tokens=16384`.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55 GB solo para pesos (27,4B parametros a 2 bytes), mas KV cache y activaciones; el repositorio ocupa 54,7 GB. Con contexto de 32K la KV cache anade varios GB adicionales.
- GPU recomendadas para BF16: H100 (80 GB) o A100 (80 GB) en configuracion de una sola GPU; A100 de 40 GB no es suficiente en BF16 sin cuantizacion.
- Cabe en GPU de consumo: no en BF16. No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ) en la informacion disponible, por lo que no se puede confirmar su viabilidad en RTX 4090 (24 GB) u otras GPU de consumo sin cuantizacion adicional.
- Despliegue: vLLM es el motor usado en las evaluaciones oficiales (`max_model_len=32768`). La libreria es transformers y el repositorio esta marcado como `endpoints_compatible`. Soporte en llama.cpp, Ollama o TGI: no disponible en la informacion proporcionada.
- Latencia y throughput: no disponibles. Como referencia de configuracion, las evaluaciones usan `max_tokens=16384`, lo que implica respuestas largas y coste de decodificacion considerable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto evaluado | Enfoque | Licencia | Rendimiento destacado |
|---|---|---|---|---|---|
| AuXSpec-27B-RL | 27,4B | 32K | Autoformalizacion Lean 4 con RL sobre recompensa ejecutable | Apache 2.0 | Verina SpecGen pass@1 84,5% sin tests en el prompt |
| AuXSpec-9B-RL | 9,4B | 32K | Mismo enfoque, modelo base Qwen3.5-9B | Apache 2.0 | AuXSpec-Test pass@4 82,7%; Verina pass@4 96,8% con tests |
| VeriSpecGen-30B-A3B | 30B (MoE, activos no disponibles) | no disponible | Modelo de especificacion de codigo abierto, estado del arte previo | no disponible | Verina SpecGen pass@1 47,6% sin tests en el prompt |

Frente a los modelos generalistas, la comparacion relevante es con modelos de la misma tarea (generacion de especificaciones formales); no se dispone de datos de benchmarks generales de AuXSpec-27B-RL que permitan compararlo con modelos de proposito general de tamano similar.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles; su uso con enunciados en castellano no esta validado.
- Dominio restringido: esta especializado en generacion y reparacion de ficheros Lean 4 (4.32 con Mathlib) para tareas SpecGen y CodeGen; su rendimiento en tareas generales de texto o codigo no se documenta y puede degradarse respecto al modelo base.
- Dependencia del entorno Lean: las salidas solo son utiles si se compilan contra la version correcta de Lean y Mathlib; cambios de version pueden invalidar las especificaciones generadas.
- Riesgo de alucinacion: el modelo puede producir ficheros que no compilan, que asumen hechos no probados o que evitan la comprobacion del kernel; por diseno, estos casos se penalizan en el entrenamiento, pero no se eliminan. Se recomienda validar siempre con el compilador y los tests.
- Los resultados de benchmarks se han obtenido con configuraciones concretas de vLLM (`max_model_len=32768`, `max_tokens=16384`); variaciones en la configuracion de decodificacion pueden alterar el rendimiento reportado.
- Sin datos publicados sobre sesgos; al derivar de Qwen3.8-27B, puede heredar los sesgos del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las condiciones de la licencia del modelo base Qwen3.8-27B y de Mathlib/Lean para su caso concreto.
- No se documentan cuantizaciones oficiales ni soporte en motores distintos de vLLM/transformers, lo que limita el despliegue en hardware modesto.
- El modelo tiene un volumen de adopcion bajo (455 descargas, 3 likes en el momento de la consulta), por lo que la comunidad y el soporte son limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eth-algopt/AuXSpec-27B-RL
- Modelo hermano AuXSpec-9B-RL: https://huggingface.co/eth-algopt/AuXSpec-9B-RL
- Coleccion AuXSpec: https://huggingface.co/collections/eth-algopt/auxspec
- Paper principal (AuXSpec): https://arxiv.org/abs/2611.21421
- Sitio web del proyecto: https://auxspec.org
- Paper DAPO (algoritmo de RL extendido): https://arxiv.org/abs/2503.14476
- Paper referenciado en las etiquetas: https://arxiv.org/abs/2505.23135
- Paper referenciado en las etiquetas: https://arxiv.org/abs/2604.10392
- Paper referenciado en las etiquetas: https://arxiv.org/abs/2501.12948
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
