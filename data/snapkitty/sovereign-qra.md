# Snapkitty/sovereign-qra

## Resumen

Sovereign QRA es un tensor de enrutamiento determinista diseñado para sustituir el mecanismo softmax en el despacho de expertos de arquitecturas MoE (Mixture of Experts). Lo desarrolla el autor Snapkitty y se presenta como un componente formalmente verificado, con pruebas en Lean 4 sin axiomas (`zero sorry`) y una implementación de referencia en Verilog para FPGA. El repositorio no contiene un modelo de lenguaje completo, sino un componente de software/hardware que pretende eliminar la entropía del enrutamiento aprendido, garantizando un reparto perfecto de carga entre 6 expertos mediante una biyección explícita con la geometría de la esfera entera `x²+y²+z²=1`.

Su relevancia radica en la propuesta de un enrutamiento con entropía cero (H=0), que evita problemas habituales como el desequilibrio de carga, el descarte de tokens y la dependencia de cómputo matricial en la selección de expertos. El autor lo integra en un hipotético modelo `sovereign-mimo-4b` como reemplazo del router MoE aprendido. Sin embargo, no se proporcionan pesos, arquitectura de red neuronal, datos de entrenamiento ni resultados de benchmarks, por lo que debe tratarse como una especificación técnica y no como un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tensor de enrutamiento determinista 6x6 (no es una red neuronal) |
| Parametros totales | no disponible (no se publican pesos de modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Sovereign Node Key Only (no estandar, no OSI) |
| Formato de pesos | no disponible (se distribuyen fuentes Lean 4, Verilog y Haskell) |

## Arquitectura y entrenamiento

El componente no es un transformer ni un modelo entrenado. Se define como un tensor de enrutamiento T de 6x6 derivado de la geometria de la esfera entera `x²+y²+z²=1` sobre Z³, que tiene exactamente 6 soluciones enteras. El autor establece un isomorfismo tripartito entre tres estructuras: QLG (soluciones enteras de la esfera), SLA (hiperplano en Z⁴) y QRA (el propio tensor). La biyeccion es explicita: `qlg_to_qra = id`. El tensor no se aprende, sino que se construye a partir de la geometria.

La verificacion se realiza con Lean 4 (teoremas T1 a T5 y E2) sin usar Mathlib y con `decide`/`native_decide` para comprobacion exhaustiva. Tambien se incluye un automata de evolucion de testigos JWT con cota de 36 pasos, implementado en Verilog. El autor afirma que el diseno sintetiza en una FPGA Artix-7 con menos de 450 LUTs. No hay informacion sobre entrenamiento, dataset o tokens.

## Capacidades

- Enrutamiento determinista en MoE: sustituye el softmax por una tabla de consulta de 6 estados, con entropia cero (H=0).
- Reparto perfecto de carga entre 6 expertos, sin descarte de tokens.
- Pruebas formales en Lean 4 (teoremas T1-T5) que garantizan la completitud de las soluciones, el homomorfismo, la entropia cero, el isomorfismo tripartito y la cota de vida del testigo JWT.
- Implementacion hardware en Verilog para FPGA (Artix-7), con bajo consumo de recursos (<450 LUTs).
- Integracion prevista con el modelo `sovereign-mimo-4b` como router MoE, liberando VRAM al evitar el calculo de `k` evaluaciones de experto por token.
- No es un modelo generativo: no genera texto, codigo ni responde preguntas.

## Casos de uso

- Sustitucion del router softmax en modelos MoE: en un sistema de mezcla de expertos, QRA puede asignar cada token a uno de 6 expertos de forma determinista, eliminando la carga computacional del softmax y el desequilibrio de carga. Es adecuado cuando se prioriza la previsibilidad sobre la adaptabilidad aprendida.
- Aceleracion por hardware en FPGA: al sintetizar en Artix-7 con menos de 450 LUTs, puede integrarse como coprocesador de enrutamiento en sistemas embebidos o aceleradores especificos, reduciendo la latencia frente a un router software.
- Verificacion formal de propiedades de enrutamiento: los teoremas Lean 4 permiten auditar que el enrutamiento cumple propiedades algebraicas (biyeccion, entropia cero, cota de convergencia) antes de desplegarlo en produccion.
- Reduccion de VRAM en inferencia MoE: al eliminar el calculo de logits y el top-k, se libera memoria para ampliar la longitud de contexto en el modelo consumidor (segun el autor, `sovereign-mimo-4b`).
- Sistema de testigos JWT con vida acotada: el automata de evolucion de testigos (T<=36 pasos) puede servir como mecanismo de rotacion de credenciales en pipelines de inferencia distribuida.
- Educacion e investigacion en enrutamiento determinista: como caso de estudio de aplicacion de geometria entera y verificacion formal a sistemas de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay metricas como MMLU, HumanEval o GSM8K porque el componente no es un modelo de lenguaje. El unico dato de rendimiento mencionado es el sintetizado en FPGA (<450 LUTs) y la cota de 36 pasos para la evolucion JWT, ambos sin mediciones independientes.

## Requisitos de hardware

- No requiere GPU para su funcionamiento como componente de enrutamiento; es una tabla de consulta de 6x6.
- Para la integracion en un modelo MoE, se necesita el hardware del modelo anfitrion (p. ej., GPU para el resto de la red), pero el router en si no consume VRAM adicional relevante.
- Implementacion de referencia en Verilog para FPGA Artix-7: <450 LUTs, 1 RAMB36E1 y 0 DSP48E1 compartidos con otro core.
- No se proporcionan opciones de despliegue estandar (vLLM, llama.cpp, Ollama, TGI) porque no es un LLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existe una categoria estandar de "modelos" comparable para un tensor de enrutamiento determinista. Las alternativas serian routers MoE aprendidos (p. ej., los usados en Mixtral o DeepSeek-MoE), pero no son directamente comparables en parametros, contexto o rendimiento porque QRA no es un modelo de lenguaje y no tiene pesos publicados.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un sistema de IA generativa; no puede procesar texto ni generar respuestas.
- No hay pesos, tokenizador, ni configuracion de inferencia publicados. El repositorio contiene codigo fuente y pruebas, no un artefacto desplegable.
- La licencia "Sovereign Node Key Only" no es una licencia de codigo abierto reconocida; restringe el uso comercial y la redistribucion sin una clave propietaria.
- La fecha de creacion (2026-09-03) es futura respecto a la fecha actual, lo que sugiere que el repositorio puede ser ficticio, experimental o una prueba de concepto no validada.
- No hay evidencia independiente de que el enrutamiento determinista mejore el rendimiento de un modelo MoE real; la afirmacion de que "libera VRAM" es teorica y no se ha medido.
- El autor menciona dependencias de repositorios externos (`ahmad-foundations`, `sovereign-cuda-kernels`, etc.) que no estan accesibles desde esta ficha, por lo que la reproducibilidad es limitada.
- Riesgo de alucinacion o sobreinterpretacion: las afirmaciones sobre "pruebas formales" y "entropia cero" se basan en la model card del autor y no han sido verificadas de forma independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Snapkitty/sovereign-qra
- No se han encontrado enlaces adicionales (papers, blogs, demos) en la informacion disponible.
