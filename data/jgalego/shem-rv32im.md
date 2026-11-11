# jgalego/shem-rv32im

## Resumen

`shem-rv32im` es un artefacto de pesos publicado por el desarrollador jgalego dentro del proyecto [shem](https://github.com/JGalego/shem), un sistema que permite ejecutar contenedores y máquinas virtuales "dentro de los pesos" de una red neuronal. Este repositorio concreto contiene la CPU RISC-V RV32IM compilada como pesos de red: no es un modelo de lenguaje entrenado, sino el resultado de un compilador de pesos que traduce un conjunto de 48 instrucciones descritas como datos a tablas de búsqueda y enrutamiento de capas lineales. Cada instrucción ejecutada corresponde a un forward pass exacto.

El interés técnico es inusual: demuestra una vía alternativa para implementar emulación de CPU como cómputo neuronal determinista. La decodificación se modela como una capa que cuenta bits discordantes, los operandos son lecturas de atención sobre un banco de registros y los resultados se enrutan según la instrucción decodificada. Memoria y registros residen en estado de tipo delta-rule, al estilo de las capas Gated DeltaNet. Todo el cómputo se realiza en float64 con mapas lineales, gating, clamps y atención one-hot, de modo que cada valor calculado es exacto.

El modelo es relevante ahora por su enfoque poco convencional (compilación de ISA a pesos, verificación bit-exacta frente a un intérprete de referencia y ejecución de un kernel Linux sin MMU) y por su tamaño minúsculo: 77.744 parámetros en 18 tensores. No obstante, conviene subrayar que no es un modelo generativo ni conversacional, y que su utilidad está ligada al ecosistema shem 0.1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de capas lineales con gating, clamps y atencion one-hot; estado de memoria tipo delta-rule (Gated DeltaNet) |
| Parametros totales | 77.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float64; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, 18 tensores, float64) y `config.json` |

## Arquitectura y entrenamiento

La arquitectura no sigue el esquema de un transformer generativo. Según la model card, el compilador de pesos convierte el conjunto de instrucciones RV32IM (48 instrucciones descritas como datos) en las tablas de búsqueda y enrutamiento de las capas lineales de la red. La decodificación se implementa como una capa que cuenta bits discordantes; los operandos se obtienen mediante lecturas de atención sobre un banco de registros; y los resultados se enrutan según la instrucción decodificada. La memoria y los registros viven en estado de tipo delta-rule, con capas Gated DeltaNet que actúan como memoria. El cómputo emplea únicamente mapas lineales, gating, clamps y atención one-hot, todo en float64, lo que garantiza exactitud en cada valor calculado.

No hay entrenamiento ni aprendizaje: el autor afirma explícitamente que "nada aquí se aprende". Por tanto, no existen datos de entrenamiento, tokens, composición de dataset ni fases de RLHF o DPO. La innovación técnica reside en la propia compilación de un ISA a pesos y en la verificación: los 60 tests oficiales de riscv-tests (rv32ui, rv32um, rv32ua) terminan en el mismo estado que en el intérprete de referencia de shem; programas aleatorios, snapshots reanudados desde el intérprete de referencia, bifurcación de contenedores y un kernel Linux sin MMU ejecutando un comando de shell (unas 180.000 instrucciones) terminan con estados idénticos, incluidos los 64 MiB de RAM. En GPU, los modos eager, compiled y CUDA graphs son bit-exactos respecto a la CPU.

## Capacidades

- Ejecución exacta de instrucciones RV32IM: un forward pass por instrucción, con resultados idénticos al intérprete de referencia.
- Emulación de CPU RISC-V de 32 bits con extensiones I, M y A, según los tests oficiales citados.
- Gestión de memoria y registros mediante estado delta-rule, incluyendo 64 MiB de RAM en las pruebas reportadas.
- Ejecución de un kernel Linux sin MMU y de un comando de shell dentro del modelo.
- Reanudación de snapshots provenientes del intérprete de referencia y bifurcación de contenedores.
- Ejecución bit-exacta en CPU y GPU (eager, compiled y CUDA graphs).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades de agente ni multilingüismo: no es un modelo de lenguaje.

## Casos de uso

- Investigación en computación neuronal exacta: usar los pesos como banco de pruebas para estudiar cómo se implementa un ISA completo con capas lineales, atención one-hot y estado delta-rule, comparando cada estado con el intérprete de referencia.
- Emulación RISC-V dentro de flujos de CI: ejecutar programas RV32IM y verificar que el estado final coincide bit a bit con la referencia, como ya se hizo con los 60 tests oficiales.
- Distribución de CPU como capa del modelo: el autor indica que el repositorio sirve para imágenes que llevan su CPU como una capa, lo que permite empaquetar la CPU junto con la carga de trabajo.
- Reproducción de snapshots y bifurcación de contenedores: reanudar un estado capturado por el intérprete de referencia y continuar la ejecución en la vCPU neuronal, útil para depuración y análisis de estados intermedios.
- Ejecución de kernels Linux mínimos sin MMU: el caso verificado de un kernel que ejecuta un comando de shell sirve para validar cargas de trabajo de sistema operativo embebido dentro del modelo.
- Auditoría de determinismo en GPU: comparar los modos eager, compiled y CUDA graphs contra la CPU para garantizar resultados idénticos en pipelines de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta verificaciones de corrección: los 60 tests oficiales de riscv-tests (rv32ui, rv32um, rv32ua) y unas 180.000 instrucciones de un kernel Linux sin MMU terminan con estados idénticos al intérprete de referencia, incluidos los 64 MiB de RAM, y la ejecución en GPU es bit-exacta en todos los modos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,0 GB y contiene 77.744 valores en float64 (18 tensores), por lo que el peso de los parámetros es del orden de kilobytes; el estado delta-rule (memoria y registros, hasta 64 MiB de RAM en las pruebas) es el factor dominante y no se detalla su huella en VRAM.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No disponible; por el tamaño de los pesos (kilobytes) es plausible, pero no hay datos publicados sobre modelos concretos.
- Opciones de despliegue: servidor `shem-neural-server` del paquete `shem-neural` (vía `uvx`), con socket Unix; el cliente `shem run --vcpu neural --neural-socket ...` ejecuta programas contra él. El servidor compila los mismos pesos por sí mismo. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (compilación de un ISA a pesos neuronales exactos), ni alternativas de emulación RISC-V implementadas como redes neuronales con las que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni responde a prompts; cualquier uso conversacional es un error de categoría.
- Dependencia del ecosistema shem 0.1.0: los pesos están publicados para esa versión y el servidor los recompila; no se garantiza compatibilidad con otras versiones o herramientas.
- Alcance limitado al ISA RV32IM documentado (48 instrucciones) y a las extensiones verificadas (rv32ui, rv32um, rv32ua); no se documentan otras extensiones.
- Las pruebas de sistema reportadas cubren un kernel Linux sin MMU; no hay evidencia publicada sobre kernels con MMU u otras cargas de sistema.
- El estado de memoria y registros puede alcanzar los 64 MiB de RAM en las pruebas citadas; no se detalla el coste en VRAM ni el rendimiento en producción.
- No se documentan sesgos ni riesgo de alucinación en el sentido habitual, al no ser un modelo aprendido; el riesgo es de corrección de la emulación, mitigado por la verificación bit-exacta reportada por el autor.
- Licencia MIT: permite uso comercial y modificación, pero no se ofrece garantía alguna; el autor no documenta soporte ni mantenimiento.
- Cero descargas y cero likes en el momento de la consulta: ecosistema muy incipiente y poca validación externa independiente.

## Enlaces

- Hugging Face: https://huggingface.co/jgalego/shem-rv32im
- Repositorio shem: https://github.com/JGalego/shem
