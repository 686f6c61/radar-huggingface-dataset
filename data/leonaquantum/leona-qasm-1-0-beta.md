# LeonaQuantum/leona-qasm-1.0-beta

## Resumen

`leona-qasm-1.0-beta` es un adaptador LoRA publicado por LeonaQuantum sobre el modelo base Qwen/Qwen3.8-27B, disenado especificamente para generar programas OpenQASM 3 a partir de instrucciones en lenguaje natural. El adaptador no es un modelo autonomo: requiere cargar el modelo base (27B parametros) y aplicar los pesos PEFT encima, lo que implica un coste de inferencia equivalente al del modelo completo. Su proposito es resolver la brecha entre la descripcion funcional de un circuito cuantico y el codigo QASM valido, una tarea donde el modelo base rinde muy mal (9,5% de acierto en validacion) y el adaptador alcanza el 93,2%.

La relevancia del adaptador reside en su especializacion vertical: cubre tareas como QAOA, preparacion de estados GHZ, teleportacion, QFT, oraculos de fase y traduccion entre dialectos QASM, con tasas de exito superiores al 95% en la mayoria de categorias del conjunto de validacion. El entrenamiento se realizo con LoRA de rango 16 sobre 22.260 ejemplos, combinando generacion sintetica propia (58%) con datasets publicos de circuitos cuanticos. La licencia Apache 2.0 facilita su integracion en herramientas de desarrollo cuantico.

El adaptador esta en fase beta (version 1.0-beta, publicada en noviembre de 2026) y solo soporta ingles. Su repo ocupa 2,4 GB, coherente con un adaptador LoRA de rango 16 sobre un modelo de 27B en precision bf16. No se han publicado datos sobre latencia, throughput ni requisitos de hardware especificos del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen/Qwen3.8-27B |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 y dropout 0, aplicado sobre el modelo base Qwen/Qwen3.8-27B (revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`). El entrenamiento consistio en 1.000 pasos con batch efectivo de 16, learning rate pico de 5e-5 y longitud de secuencia de 4.096 tokens. Se generaron checkpoints intermedios etiquetados `clean-v12-step-200`, `-400`, `-600`, `-800` y `-1000`, siendo `main` el paso 1.000.

El dataset de entrenamiento contiene 22.260 ejemplos (22.123 dentro del limite de longitud), de los cuales aproximadamente el 58% fueron generados por los generadores de circuitos propios del proyecto y el resto proviene de QCircuitBench, Agent-Q, QASM-Eval, MQT Bench, QASMBench, circuitos OpenQASM verificados de Qly y quantum-circuits-21k. Los batches de entrenamiento se muestrearon al 70% de fuentes publicas y al 30% de datos generados. Los datasets no se redistribuyen y cada uno conserva su licencia original. No se menciona el uso de RLHF ni DPO en la informacion disponible.

## Capacidades

- Generacion de programas OpenQASM 3.0 completos a partir de descripciones en lenguaje natural.
- Implementacion de algoritmos cuanticos especificos: QAOA, QFT, preparacion de estados GHZ, teleportacion, graph states, oraculos de fase.
- Generacion de secuencias de puertas y rotaciones parametrizadas (Product RY).
- Traduccion entre dialectos o representaciones QASM (tarea QASM translation).
- Manejo de reset y feedback cuantico.
- Soporte de timing y pulse-level programming en QASM (QASM-Eval timing, QASM-Eval pulse).
- Generacion de circuitos clasicos y complejos en QASM (QASM-Eval classical, QASM-Eval complex), con rendimiento limitado en el caso complejo (6,5% en test).
- Salida limitada a 4.096 tokens nuevos con decodificacion greedy.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni capacidades multimodales.

## Casos de uso

- **Generacion automatica de circuitos para investigacion cuantica**: un investigador describe un algoritmo (por ejemplo, QAOA para un problema de optimizacion) y el adaptador produce el programa QASM 3 listo para ejecutar en un simulador o backend. La tasa de exito del 98% en QAOA en validacion lo hace adecuado para prototipado rapido.
- **Traduccion de especificaciones a codigo en pipelines de compilacion cuantica**: el adaptador puede integrarse como paso de generacion en un pipeline que recibe una descripcion de alto nivel y emite QASM para su compilacion con herramientas como Qiskit o tket, reduciendo el trabajo manual de escribir circuitos.
- **Generacion de circuitos de preparacion de estados**: para estados GHZ, graph states o basis states, donde el adaptador alcanza el 96-100% de acierto en test, se puede usar para generar automaticamente los circuitos de inicializacion en experimentos de entanglement.
- **Asistente de desarrollo para ingenieros de software cuantico**: integrado en un IDE o chatbot, el adaptador responde a peticiones como "escribe un circuito de teleportacion de 1 qubit" y devuelve codigo QASM valido, con un 95,5% de exito en la categoria de teleportacion en test.
- **Generacion de oraculos y circuitos de fase**: para algoritmos como Grover o estimacion de fase, el adaptador produce oraculos de fase con un 92,4% de acierto en test, util para construir bloques de circuitos mas grandes.
- **Traduccion entre dialectos QASM**: la tarea QASM translation alcanza el 97,1% en test, lo que permite convertir circuitos entre versiones o representaciones de OpenQASM en flujos de migracion de codigo.
- **Generacion de circuitos con timing y pulse-level**: con un 87,1% en QASM-Eval timing y 100% en QASM-Eval pulse en test, el adaptador puede generar programas que incluyen informacion de temporizacion o pulsos, util para control a bajo nivel en hardware superconductor.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan el adaptador con el modelo base Qwen3.8-27B sin adaptador, usando decodificacion greedy y un maximo de 4.096 tokens nuevos. La evaluacion se realizo con un checker de correccion semantica y simulacion; los prompts que el checker no pudo puntuar se cuentan como no superados.

| Conjunto | Prompts | Modelo base | Adaptador |
|---|---|---|---|
| Test | 2.494 | no ejecutado | 93,9% |
| Validacion | 2.479 | 9,5% | 93,2% |

Desglose por split en validacion:

| Split | Prompts | Modelo base | Adaptador |
|---|---|---|---|
| Core | 1.999 | 7,1% | 96,8% |
| Advanced | 480 | 19,4% | 78,1% |

Desglose por tarea en validacion (seleccion):

| Tarea | Prompts | Modelo base | Adaptador |
|---|---|---|---|
| QAOA | 348 | 12,9% | 98,0% |
| Product RY | 345 | 0,0% | 99,1% |
| Gate sequence | 275 | 0,0% | 100,0% |
| Agent-Q QAOA | 201 | 0,5% | 93,0% |
| Teleportation | 199 | 0,0% | 98,5% |
| Graph state | 193 | 2,1% | 100,0% |
| Reset and feedback | 171 | 0,0% | 98,2% |
| QASM translation | 125 | 74,4% | 92,0% |
| GHZ | 116 | 0,0% | 98,3% |
| QASM-Eval timing | 93 | 63,4% | 94,6% |
| QASM-Eval complex | 93 | 0,0% | 34,4% |
| Phase oracle | 69 | 0,0% | 94,2% |
| QASM-Eval classical | 62 | 38,7% | 62,9% |
| QFT | 59 | 0,0% | 100,0% |
| Basis state | 58 | 0,0% | 100,0% |
| QASM-Eval pulse | 31 | 29,0% | 93,5% |
| MQT QFT | 15 | 0,0% | 46,7% |
| MQT half adder | 12 | 0,0% | 0,0% |
| MQT full adder | 12 | 0,0% | 0,0% |
| MQT modular adder | 2 | 0,0% | 100,0% |

Desglose por split en test:

| Split | Prompts | Adaptador |
|---|---|---|
| Core | 2.092 | 95,5% |
| Advanced | 402 | 85,6% |

Desglose por tarea en test (seleccion):

| Tarea | Prompts | Adaptador |
|---|---|---|
| QAOA | 347 | 95,7% |
| Product RY | 312 | 99,4% |
| Gate sequence | 299 | 100,0% |
| Agent-Q QAOA | 281 | 93,2% |
| Teleportation | 198 | 95,5% |
| Reset and feedback | 184 | 97,8% |
| Graph state | 180 | 100,0% |
| GHZ | 149 | 96,6% |
| QASM translation | 139 | 97,1% |
| Basis state | 77 | 100,0% |
| QFT | 74 | 98,6% |
| Phase oracle | 66 | 92,4% |
| MQT QFT | 38 | 44,7% |
| QASM-Eval timing | 31 | 87,1% |
| QASM-Eval classical | 31 | 80,6% |
| QASM-Eval complex | 31 | 6,5% |
| QASM-Eval pulse | 28 | 100,0% |
| MQT modular adder | 12 | 0,0% |
| MQT full adder | 12 | 0,0% |
| MQT half adder | 5 | 0,0% |

Los resultados completos estan en `eval_results.json` del repositorio. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador requiere cargar el modelo base Qwen3.8-27B en bf16, lo que implica aproximadamente 54 GB de VRAM solo para los pesos del modelo base, mas el adaptador (2,4 GB) y el overhead de activaciones y KV cache. No se dispone de cifras oficiales del autor.
- GPU recomendadas: para bf16 se necesita al menos una A100 80GB o H100 80GB. Con cuantizacion del modelo base (no documentada por el autor) podria reducirse a GPUs de 48 GB o 24 GB, pero no hay datos publicados.
- No cabe en GPUs consumer estandar (RTX 4090 24GB) sin cuantizacion agresiva del modelo base, no documentada.
- Opciones de despliegue: el ejemplo de uso oficial emplea `transformers` (version 5.22.1), `peft` (0.21.2) y `torch` (2.8.0) con `device_map="cuda:0"`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y al ser un adaptador PEFT sobre un modelo de 27B, su integracion en esos frameworks requeriria conversion y no esta documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (adaptadores LoRA para generacion de OpenQASM 3). El autor menciona `LeonaQuantum/leona-qompact-1.0`, un adaptador experimental del mismo proyecto (paso 1.000 del run clean-v12) que no ha sido validado en calidad y no reclama mejora sobre el modelo base. No se han identificado otros adaptadores publicos equivalentes en la informacion disponible.

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| leona-qasm-1.0-beta | LoRA sobre Qwen3.8-27B | 27B (base) | 4.096 | 93,9% test (checker propio) | Apache 2.0 |
| leona-qompact-1.0 | LoRA sobre Qwen3.8-27B | 27B (base) | no disponible | no validado | no disponible |
| Modelo base Qwen3.8-27B | Transformer denso | 27B | no disponible | 9,5% validacion (checker propio) | no disponible |

## Limitaciones y advertencias

- El adaptador solo ha sido evaluado en ingles; no hay soporte documentado para otros idiomas.
- La evaluacion se basa en un checker propio del autor; no se han publicado resultados en benchmarks independientes ni comparaciones con otros sistemas de generacion de QASM.
- Rendimiento muy bajo en tareas especificas: 0% en MQT half adder, full adder y modular adder (validacion y test), 6,5% en QASM-Eval complex (test) y 34,4% en QASM-Eval complex (validacion). Estas categorias no son fiables.
- El adaptador no es un modelo autonomo: depende del modelo base Qwen3.8-27B y de su revision concreta; cambios en el modelo base pueden romper la compatibilidad.
- La longitud de contexto de entrenamiento es de 4.096 tokens; prompts o salidas mas largas pueden degradar el rendimiento o truncarse.
- Riesgo de alucinacion en la generacion de codigo QASM: el checker semantico mitiga parcialmente este riesgo en la evaluacion, pero en produccion es necesario validar y simular los programas generados antes de ejecutarlos en hardware real.
- Licencia Apache 2.0 permite uso comercial, pero los datasets de entrenamiento no se redistribuyen y cada uno conserva su licencia; el usuario debe verificar que el uso del adaptador cumple con las licencias de los datos subyacentes.
- Version beta: el autor no garantiza estabilidad ni calidad en todos los casos de uso; se recomienda validacion exhaustiva antes de desplegar en produccion.
- No se documentan sesgos conocidos, pero al entrenarse solo en ingles y en un dominio tecnico, el modelo puede tener un sesgo hacia estructuras de circuitos presentes en los datasets de entrenamiento.

## Enlaces

- [Hugging Face: LeonaQuantum/leona-qasm-1.0-beta](https://huggingface.co/LeonaQuantum/leona-qasm-1.0-beta)
- [Hugging Face: LeonaQuantum/leona-qompact-1.0](https://huggingface.co/LeonaQuantum/leona-qompact-1.0)
- [Perfil de Hugging Face: LeonaQuantum](https://huggingface.co/LeonaQuantum)
- Modelo base: [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B) (referenciado en la model card; no se ha verificado su disponibilidad en la busqueda web)
