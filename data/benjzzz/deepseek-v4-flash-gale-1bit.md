# benjzzz/DeepSeek-V4-Flash-GALE-1bit

## Resumen

DeepSeek-V4-Flash-GALE-1bit es una recuantizacion de 1 bit de los expertos enrutados del modelo DeepSeek-V4-Flash, desarrollada por el usuario benjzzz en HuggingFace. El objetivo es hacer que un modelo MoE masivo quepa por completo en la VRAM de hardware de consumo: en una maquina con 2×RTX 3090 y 2×RTX 2080 Ti (70 GB de VRAM totales), los 11.008 expertos del modelo se mantienen en VRAM sin tiering a CPU ni lecturas de disco durante la decodificacion. El pack reduce el peso del modelo de 159,6 GB a 55,0 GB, manteniendo la atencion, los expertos compartidos y el resto de componentes en fp8/fp16. La arquitectura es un MoE con 43 capas y 256 expertos por capa (33.024 matrices de expertos, 277.000 millones de parametros en expertos enrutados). La longitud de contexto y los idiomas soportados no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture-of-Experts), 43 capas, 256 expertos por capa |
| Parametros totales | 277.0 B (solo expertos enrutados); total del modelo no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GALE 1-bit (expertos enrutados: signo por peso + escala fp16 por bloque de 128 + 1% outliers int4); fp8/fp16 en disco para el resto, con fp8 a 4-bit en VRAM |
| Idiomas soportados | no disponible |
| Licencia | deepseek (no estandar; requiere revision para uso comercial) |
| Formato de pesos | no disponible (no especificado en la informacion proporcionada) |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4-Flash, un MoE con 43 capas y 256 expertos por capa. El pack re-cuantiza los expertos enrutados a 1 bit mediante la tecnica GALE: cada signo se almacena bajo una rotacion FWHT-1024 bloqueada, con escala fp16 por bloque de 128 pesos y un 1% de outliers como int4 con escala fp16 por fila. Los componentes no expertos (atencion, expertos compartidos, normas, routers, HC-mixing, embedding y head) se mantienen en fp8/fp16 en disco, y los tensores fp8 se cuantizan a 4 bits al cargarlos y se mantienen a 4 bits en VRAM.

La calibracion se realizo con 49.152 tokens (24 × 2048) compuestos por ~64% de codigo Python e ingles tecnico, capturados capa por capa durante un forward pass con los pesos originales. El estado oculto de cada capa se encadeno a traves de la reconstruccion cuantizada de la capa anterior, lo que explica que el error de salida crezca con la profundidad (0,244 en la capa 0 frente a 0,413 en la capa 27). El proceso completo tardo 7 horas y 7 minutos en una RTX 3090.

La eleccion de 1 bit y 1% de outliers se baso en mediciones sobre los expertos reales. El autor documento que el error de salida de expertos con presupuestos de outliers del 1%, 2%, 3% y 5% es 0,248, 0,236, 0,227 y 0,211, respectivamente, con bits por peso de 1,33, 1,52, 1,73 y 2,12. El presupuesto del 1% fue elegido porque permite residencia completa en 70 GB de VRAM con espacio para la cache KV. Una alternativa 2-bit/4-bit (cuantizador BenQ) es mas precisa (error de salida 0,128/0,135/0,217 a 2 bits y 0,049/0,052/0,090 a 4 bits para w1/w3/w2), pero ocupa ~96 GB y derrama ~27% de los expertos a un tier CPU, lo que degrada la velocidad mas de lo que mejora la precision. El autor explicita que el 1 bit se eligio por residencia, no por precision.

## Capacidades

- Generacion de texto en ingles tecnico y codigo Python, segun los datos de calibracion.
- Soporte de tool calling / function calling, indicado por la variable de entorno `DSV4_ONESHOT_TOOLS`.
- Capacidades de agente: el autor menciona una tarea de agente consistente en escribir un archivo `hello.py`, ejecutarlo y reportar la salida, completada en 196 segundos.
- Razonamiento multi-paso: no disponible (no se especifica en la informacion proporcionada).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se especifican capacidades de vision o audio.

## Casos de uso

- **Inferencia local en hardware de consumo**: el modelo cabe en 70 GB de VRAM (2×RTX 3090 + 2×RTX 2080 Ti) sin tiering CPU, lo que permite ejecutar un MoE masivo en un cluster de GPUs de consumo. Es adecuado para entornos sin acceso a GPUs de datacenter.
- **Asistente de programacion**: al estar calibrado en ~64% de codigo Python e ingles tecnico, el modelo puede generar y analizar codigo. Puede integrarse en herramientas de desarrollo como un asistente de autocompletado o un agente de terminal.
- **Agentes autonomos**: con soporte de tool calling, el modelo puede ejecutar tareas de agente como escribir scripts, ejecutarlos y analizar los resultados. Es adecuado para automatizar tareas de desarrollo, pruebas y operaciones.
- **Investigacion en cuantizacion extrema**: el pack sirve como caso de estudio para analizar el impacto de la cuantizacion 1-bit en modelos MoE, incluyendo el error de salida por capa, el efecto del encadenamiento de errores y el trade-off entre precision y residencia en VRAM.
- **Procesamiento de documentacion tecnica**: gracias a su calibracion en ingles tecnico, el modelo puede resumir, analizar y transformar document
