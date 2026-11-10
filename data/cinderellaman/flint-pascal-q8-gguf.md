# CinderellaMan/Flint-Pascal-Q8-GGUF

## Resumen

Flint Pascal Q8 GGUF es una cuantización GGUF del modelo Flint (RecursiveSI/flint), un transformer denso de 39.785.287.456 parámetros (unos 39,8 mil millones) desarrollado por RecursiveSI. El modelo base está orientado a razonamiento con modo "thinking", generación de código, llamada a herramientas y lectura de contextos de hasta 262.144 tokens. Esta variante concreta la publica el usuario CinderellaMan bajo licencia Apache 2.0 y está pensada específicamente para tarjetas NVIDIA antiguas de arquitectura Pascal (compute capability 6.1), como las P106-090 y P104 de rigs de minería retirados, la serie GTX 10 y las Tesla P4/P40.

La innovación de esta ficha no está en el modelo en sí, sino en la receta de cuantización: parte del Q8_0 de Unsloth y mueve a Q5_0 los tensores que menos calidad aportan, logrando un archivo de 40,4 GB frente a los 42,3 GB del Q8_0 original. Según el autor, esto reduce un 11,0 % los bytes leídos por token generado y mantiene una divergencia KL frente al modelo original de 16 bits dentro de dos errores estándar de la del Q8_0, es decir, prácticamente la misma calidad.

El interés actual es de nicho pero muy concreto: permite ejecutar un modelo de casi 40B con contexto completo de 262.144 tokens en hardware obsoleto y de bajo coste, agregando nueve GPU de 6 GB en un rig de minería. El autor reporta 47,4 tokens/s en generación con un agente de código sobre ese hardware, frente a 45,9 tokens/s del Q8_0 de Unsloth en el mismo motor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Flint; detalles internos no disponibles) |
| Parametros totales | 39.785.287.456 (~39,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Mezcla Q8_0 / Q5_0 / F16 (tensores de menor impacto movidos a Q5_0) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp; optimizado con kernels Pascal en Miner Llama v3) |

## Arquitectura y entrenamiento

El modelo base Flint es un transformer denso de 39,8B parámetros con modo de razonamiento previo a la respuesta ("thinks before it answers"), capacidad de escritura de código y de llamada a herramientas, y una ventana de contexto de 262.144 tokens. No se dispone de información sobre la composición del dataset de entrenamiento, el número de tokens vistos, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineamiento; esos datos no están disponibles en la información proporcionada.

La aportación técnica de esta variante es la cuantización selectiva: se parte del Q8_0 de Unsloth y se degradan a Q5_0 únicamente los tensores con menor coste de calidad, con el objetivo de reducir el ancho de banda de memoria, que en las tarjetas Pascal consume algo más de la mitad del tiempo por token generado. El autor reporta una divergencia KL frente al modelo de 16 bits dentro de dos errores estándar de la del Q8_0, y un tiempo de generación por token de 0,941 veces el del Q8_0 en una repetición emparejada de las mismas sesiones de agente. El archivo usa solo tipos nativos de llama.cpp (Q8_0, Q5_0, F16), por lo que carga en llama.cpp estándar, aunque los kernels específicos de Pascal y las ganancias de velocidad descritas se miden con el fork Miner Llama v3.

## Capacidades

- Generación de texto conversacional y razonamiento con modo "thinking" previo a la respuesta.
- Generación y corrección de código, incluyendo tareas de bug-fixing con ejecución real de tests (Python y JavaScript en las pruebas del autor).
- Llamada a herramientas y function calling, con compatibilidad con clientes OpenAI-compatible a través del servidor de llama.cpp.
- Flujos de agente multi-turno con contexto creciente, validado en el agent check del autor con 12 tareas encadenadas.
- Contexto largo de hasta 262.144 tokens, suficiente para sesiones de agente prolongadas o análisis de repositorios extensos.
- Capacidades multilingües: no disponible (no se especifican idiomas en la información proporcionada).

## Casos de uso

- Agente de código en rig de minería reacondicionado: desplegar el modelo con Miner Llama v3 sobre nueve P106-090 de 6 GB y el contexto completo de 262.144 tokens para tareas de corrección de bugs con ejecución de tests, aprovechando los 47,4 tokens/s reportados y el reparto tensorial por capas (`-ts 6,6,5,5,6,5,5,6,6`).
- Automatización de mantenimiento de repositorios pequeños: el modelo puede leer archivos completos y contexto de conversación acumulado gracias a la ventana de 262K, lo que permite pipelines de parcheo iterativo sin truncar el historial.
- Servidor local OpenAI-compatible para herramientas de desarrollo: arrancar `llama-server` con `--alias flint` y apuntar clientes compatibles (IDE, CLI de agente) al endpoint local, sin depender de APIs en la nube.
- Laboratorio de bajo coste para investigación en agentes: el hardware objetivo (GPU Pascal de segunda mano) abarata la experimentación con modelos de ~40B y contextos largos, a cambio de menor throughput que GPU modernas.
- Evaluación de cuantizaciones mixtas: usar esta ficha como referencia para estudiar el compromiso calidad/velocidad de mezclas Q8_0+Q5_0 frente a Q8_0 puro, con la métrica de divergencia KL y la repetición emparejada de sesiones que publica el autor.
- Inferencia offline en entornos con restricciones de red: al ser pesos GGUF y servidor local, el modelo puede operar sin conectividad externa una vez descargado, útil en entornos aislados.

## Benchmarks y rendimiento

Los datos publicados por el autor corresponden a su agent check (12 tareas de bug-fixing con el agente pi, contexto de 262.144 tokens, nueve P106-090, una ejecución por fila). No son benchmarks académicos estándar (MMLU, HumanEval, GSM8K) y no se han publicado resultados de esos benchmarks en la información disponible.

| Motor y archivo | Tareas superadas | Generación (tok/s) | Lectura de prompt (tok/s) | Primer token por turno (mediana) |
|---|---|---|---|---|
| llama.cpp estándar b12076, Unsloth Q8_0, contexto 65.536 | 10 de 12 | 14,4 | 148 | 4,13 s |
| Miner Llama v3 (`1f7215948`), Unsloth Q8_0 | 12 de 12 | 45,9 | 168 | 2,67 s |
| Miner Llama v3 (`1551f5fe1`), este archivo | 12 de 12 | 47,4 | 175 | 2,66 s |
| Miner Llama v2.0 (`37e717ff6`), este archivo | 12 de 12 | 47,1 | — | — |

Datos adicionales reportados: este archivo genera un 3,3 % más rápido que el Q8_0 de Unsloth en la build de release (47,4 frente a 45,9 tok/s), con una mediana por tarea de 1,0 frente a 1,2 minutos; el total de las doce tareas fue de 22,3 frente a 19,2 minutos porque las sesiones escribieron más texto. La divergencia KL frente al modelo de 16 bits queda dentro de dos errores estándar de la del Q8_0, y el tiempo por token generado es 0,941 veces el del Q8_0 en repetición emparejada.

## Requisitos de hardware

- VRAM estimada: unos 41 GB de memoria de GPU más espacio para el contexto; el contexto completo de 262.144 tokens requiere nueve tarjetas de 6 GB.
- GPU objetivo: NVIDIA Pascal con compute capability 6.1 (P106-090, P104, GTX 10, Tesla P4/P40); las velocidades publicadas se miden solo en P106-090.
- Controladores: Ubuntu 24.04 o superior con driver NVIDIA 580, el último disponible para Pascal.
- GPU modernas: el autor recomienda usar el Q8_0 de Unsloth en GPU modernas o Mac; esta ficha está medida solo en Pascal.
- Consumer GPU: no cabe en una GPU de consumo de 24 GB o menos; requiere agregación multi-GPU.
- Despliegue: llama.cpp estándar (carga el archivo, sin kernels Pascal) o Miner Llama v3.0 desde las releases del fork del autor; servidor con `llama-server` y API compatible con OpenAI.
- Throughput reportado: 47,4 tok/s de generación y 175 tok/s de lectura de prompt en el rig de nueve P106-090; primer token por turno con mediana de 2,66 s.
- Host de referencia: Celeron de 2 núcleos con 4 GB de RAM, cada tarjeta en un lane PCIe 1.0.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Flint Pascal Q8 GGUF (esta ficha) | 39,8B | 262.144 | GGUF mixto Q8_0/Q5_0 | Apache 2.0 | 40,4 GB; optimizado para Pascal; 47,4 tok/s en el rig del autor |
| Unsloth Flint Q8_0 | 39,8B | 262.144 | GGUF Q8_0 | Apache 2.0 (según modelo base) | 42,3 GB; 45,9 tok/s en el mismo rig; recomendado en GPU modernas |
| Flint Pascal Q5 GGUF (mismo autor) | 39,8B | 262.144 | GGUF Q5 | Apache 2.0 | 29,4 GB; para seis a ocho tarjetas o máxima velocidad en nueve, con menor calidad |
| Flint 16 bits (RecursiveSI/flint) | 39,8B | 262.144 | Pesos originales | Apache 2.0 | Referencia de calidad; requiere hardware moderno o mucha memoria |

## Limitaciones y advertencias

- Las mediciones de velocidad están hechas exclusivamente en P106-090; el rendimiento en otras Pascal (P104, GTX 10, P4/P40) no está verificado.
- La ganancia de velocidad depende de Miner Llama v3; en llama.cpp estándar el archivo carga, pero no se reportan las ventajas de los kernels Pascal.
- El contexto completo de 262.144 tokens no cabe en el host de referencia con llama.cpp estándar (la máscara de atención no entra en 4 GB), lo que limita ese motor a 65.536 tokens en ese hardware.
- No hay datos publicados de sesgos, tasas de alucinación ni evaluación multilingüe del modelo base en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base RecursiveSI/flint y de los pesos de Unsloth de los que deriva la cuantización.
- El hardware objetivo es obsoleto (driver 580 es el último para Pascal) y depende de un fork no oficial de llama.cpp para el máximo rendimiento; riesgo de mantenimiento a medio plazo.
- El modelo base es de razonamiento con modo "thinking", lo que incrementa los tokens generados y, por tanto, la latencia total frente a modelos sin razonamiento explícito.

## Enlaces

- Hugging Face (esta ficha): https://huggingface.co/CinderellaMan/Flint-Pascal-Q8-GGUF
- Modelo base Flint: https://huggingface.co/RecursiveSI/flint
- Q8_0 de Unsloth (referencia): https://huggingface.co/unsloth/flint-GGUF/tree/20468edfc38ab43d6914cc88b08cbecb05d0fc62
- Flint Pascal Q5 GGUF (mismo autor): https://huggingface.co/CinderellaMan/Flint-Pascal-Q5-GGUF
- Fork Miner Llama (releases): https://github.com/Cinderella-Man/miner-llama/releases
- Guía de instalación en rigs de minería: https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs/blob/main/docs/setup.md
- Página de Flint en el repositorio del autor: https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs/blob/main/models/flint/README.md
- Release flint-v3: https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs/blob/main/release/flint-v3/README.md
- Agent check (benchmark del autor): https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs/tree/main/bench/agent_check
- Datos 2026-11-05_release_regression: https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs/blob/main/docs/data/2026-11-05_release_regression/README.md
- Datos 2026-10-27_flint_near_q8: https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs/blob/main/docs/data/2026-10-27_flint_near_q8/README.md
- Agente pi: https://github.com/earendil-works/pi
