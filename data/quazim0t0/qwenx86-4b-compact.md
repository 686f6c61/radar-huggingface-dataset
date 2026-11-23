# Quazim0t0/Qwenx86-4B-compact

## Resumen

Qwenx86-4B-compact es una variante experimental del modelo Qwen3.5-4B de Alibaba, publicada por el usuario Quazim0t0 en Hugging Face. Su particularidad es que incorpora una "computadora x86 de 64 bits compilada dentro de los pesos": se anaden 13 capas transformer delante de las capas originales de Qwen cuyos pesos no han sido aprendidos, sino calculados por un compilador. El modelo base invoca esta computadora mediante sus propias llamadas de herramienta (`<tool_call>`) y la computadora embebida las ejecuta.

La propuesta es un ejercicio de "computer-in-weights": en lugar de aprender capacidades aritmeticas o de ejecucion mediante entrenamiento, se compila un circuito (un nucleo x86 derivado del nucleo RV32 de Qwenputer) a capas del transformer. Las herramientas de calculadora, interprete de Python, compilador de C, almacen de notas, busqueda de fisica/quimica y documentacion de Python son "firmware" incluido en el checkpoint, no pesos aprendidos.

La version "compact" ocupa aproximadamente 9 GB de memoria GPU, lo que permite ejecutarla en una GPU de 16 GB. El repositorio incluye ademas las versiones v2 (memoria Qwenx86: sistema de ficheros, almacen de 1.000 hechos, recuerdo literal de 50.000 tokens, imagenes JPEG, indice de busqueda, aritmetica exacta de 64 bits), v3 (uso autonomo de la memoria por parte de Qwen) y v4 (Qwenx86 OS, programas propios en los pesos y modo de razonamiento `--think`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5) con 13 capas adicionales compiladas que implementan un nucleo x86-64; las capas anadidas no tienen pesos aprendidos |
| Parametros totales | no disponible (modelo base Qwen3.5-4B; el checkpoint compact ocupa ~9 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint "compact" pensado para ~9 GB de VRAM) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 9,3 GB; incluye `model/boot/ostools.safetensors` en v4) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B y le antepone 13 capas transformer cuyos pesos no se aprenden: se generan mediante un compilador que traduce un circuito de CPU a operaciones compatibles con las capas de Qwen3.5. El nucleo x86 es un fork del nucleo RV32 de Qwenputer (rv/core.py, disenado por divagr1925), al que se anaden micro-operaciones de flags x86 (FADD, FSUB, FAND, FOR, FXOR, FINC, FDEC), saltos condicionales con la tabla de condiciones x86 (JCC) y un traductor de x86-64 a las operaciones de 32 bits del nucleo. El mapa de memoria incluye 64 KB de RAM (el circuito crecio de 11 a 13 capas) y datos de solo lectura conectados a la ruta x86.

El firmware (calculadora, compilador C `qcc`, notas, almacenes de ciencia y documentacion de Python, y una maquina x86 que decodifica bytes crudos con SSE e interrupciones) se integra en el checkpoint. El modelo base invoca la computadora mediante llamadas de herramienta y esta las ejecuta dentro de los pesos; las versiones v2, v3 y v4 anaden memoria persistente, uso autonomo de esa memoria por parte del modelo y un panel de control web (Qwenx86 OS). No se especifican en la informacion disponible el numero de tokens de entrenamiento ni la composicion del dataset, ya que las capas anadidas no se entrenan.

## Capacidades

- Generacion de texto y razonamiento heredados de Qwen3.5-4B.
- Ejecucion de codigo x86-64 dentro de los pesos, invocada mediante tool calling.
- Calculadora aritmetica exacta y compilador de C (`qcc`) embebidos como firmware.
- Interprete de Python y consulta de documentacion de Python como herramientas internas.
- Almacen de notas y busqueda de hechos de fisica/quimica.
- Memoria Qwenx86 (v2): sistema de ficheros, almacen de 1.000 hechos, recuerdo literal de 50.000 tokens, imagenes JPEG, cabezas programables, indice de busqueda, aritmetica exacta de 64 bits y snapshots de estado.
- Uso autonomo de la memoria (v3): el modelo decide cuando guardar, leer, buscar, listar y borrar notas escribiendo sus propias llamadas de herramienta.
- Programas propios del OS en los pesos (v4): `checksum` (SHA-256, CRC32, base64), `compare` (comparacion de textos y diferencias) y `ledger` (totales monetarios exactos).
- Modo de razonamiento (`--think`) que hace razonar al modelo antes de cada llamada de herramienta y tras cada resultado.
- Soporte de agentes y razonamiento multi-paso a traves de la cadena de llamadas de herramienta.

## Casos de uso

- Verificacion de ejecucion de codigo: usar el modelo para compilar y ejecutar fragmentos de C o x86-64 dentro de los pesos, obteniendo resultados deterministas sin depender de un interprete externo.
- Calculo aritmetico exacto en produccion: la calculadora y la aritmetica de 64 bits embebidas permiten obtener resultados sin errores de redondeo en flujos donde la alucinacion numerica es critica.
- Agentes con memoria persistente: gracias a la memoria Qwenx86 (v2/v3), el modelo puede guardar y recuperar notas, hechos y textos largos de hasta 50.000 tokens de forma literal, util para asistentes de investigacion o documentacion.
- Depuracion interactiva: el espacio Qwenx86 Debugger permite recorrer llamadas de herramienta registradas, registros y flags x86, codigo en el contador de programa, RAM y salida de maquina, util para ensenanza de arquitectura de computadores.
- Auditoria y checksum en pipelines: los programas `checksum` y `compare` (v4) permiten calcular SHA-256, CRC32 o base64 y comparar textos dentro del propio modelo, integrable en validaciones de integridad.
- Contabilidad exacta: el programa `ledger` calcula totales monetarios exactos, adecuado para conciliaciones donde los errores de coma flotante son inaceptables.
- Panel de control y chat con herramientas: Qwenx86 OS ofrece una interfaz web con ventana por herramienta, editor de notas que escribe de vuelta en la computadora embebida y lector de especificaciones que verifica la lectura palabra por palabra.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 9 GB para el checkpoint compact, lo que permite ejecutarlo en una GPU de 16 GB.
- GPU recomendadas: el autor cita una RTX 5060 Ti para el arranque de Qwenx86 OS; cualquier GPU con 16 GB o mas de VRAM deberia ser suficiente para el checkpoint compact. Para el modelo base Qwen3.5-4B sin compilar, se requieren menos recursos.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB (por ejemplo, RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 5060 Ti 16 GB, RTX 4080/4090).
- Opciones de despliegue: el repositorio incluye el cargador compact para 16 GB, `qwenx86.mixed`, `qwenx86.serve` y `qwenx86_os serve --allow-gpu`; requiere PyTorch con CUDA. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwenx86-4B-compact | base Qwen3.5-4B + 13 capas compiladas | no disponible | Computadora x86 en los pesos, tool calling | Apache 2.0 | Hugging Face (421 descargas, 57 likes) |
| Qwen3.5-4B (base) | 4B | no disponible | LLM generalista | Apache 2.0 (segun modelo base) | Hugging Face |
| Modelos "computer-in-weights" previos del autor (neural-n64, neural-x86-doom, neural-riscv) | no disponible | no disponible | Emulacion exacta de CPU en redes neuronales | no disponible | Proyectos del autor |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental de investigacion: el enfoque "computer-in-weights" no es un LLM convencional y su comportamiento depende de la correcta compilacion de las capas anadidas.
- Las capas compiladas no tienen pesos aprendidos; cualquier fallo en el compilador o en el cargador puede producir resultados incorrectos en las herramientas.
- No se especifican los idiomas soportados, por lo que el rendimiento multilingue es incierto.
- No se dispone de datos sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad.
- La longitud de contexto no esta documentada; el recuerdo literal de 50.000 tokens corresponde a la memoria Qwenx86 (v2), no necesariamente a la ventana de atencion del modelo.
- El uso comercial esta permitido por la licencia Apache 2.0, pero la naturaleza experimental y la falta de benchmarks desaconsejan su uso en produccion sin validacion previa.
- El checkpoint compact esta pensado para ~9 GB de VRAM; por debajo de 16 GB puede requerir cuantizacion no documentada.
- Las versiones v1 a v3 y v4 conviven en el mismo repositorio; es necesario seleccionar la carpeta correcta para evitar cargar pesos o codigo no deseados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Quazim0t0/Qwenx86-4B-compact
- Espacio de demostracion Qwenx86 Debugger: https://huggingface.co/spaces/Quazim0t0/Qwenx86-Debugger
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- DOI: https://doi.org/10.57967/hf/11453
- Guia completa v4: https://huggingface.co/Quazim0t0/Qwenx86-4B-compact/blob/main/v4/README.md
- Visor de arquitectura: https://hfviewer.com/Quazim0t0/Qwenx86-4B-compact
