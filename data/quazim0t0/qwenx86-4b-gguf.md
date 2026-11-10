# Quazim0t0/Qwenx86-4B-GGUF

## Resumen

Qwenx86-4B es un modelo de lenguaje de 4.341.091.648 parámetros (aproximadamente 4,34 mil millones) construido por Quazim0t0 a partir de Qwen3.5-4B, al que se le ha incorporado un ordenador x86 de 64 bits compilado directamente en los pesos del modelo. La idea central es que el propio modelo, mediante tool calling, invoca herramientas internas (calculadora, intérprete de Python, compilador de C, notas, consulta científica y consulta de documentación de Python) y el "ordenador" embebido en los pesos las ejecuta. El repositorio que nos ocupa es la distribución en formato GGUF para llama.cpp del modelo original en formato compacto.

El modelo se enmarca en la corriente denominada "computer-in-weights" o "compiled-weights": en lugar de delegar la ejecución en procesos externos, el estado de la máquina (registros, flags, memoria RAM, contador de programa) se representa dentro del propio modelo y se manipula mediante tokens de máquina. Según la model card, una llamada a la calculadora implica 56.667 tokens de máquina repartidos en 240 bloques verificados, con un tiempo de generación de 16 a 34 segundos frente a los 41 segundos de la versión PyTorch.

La relevancia actual reside en que demuestra un enfoque poco habitual de integración de cómputo determinista dentro de un LLM de tamaño contenido, con licencia Apache 2.0 y distribución en GGUF, lo que facilita su despliegue local. El modelo está pensado para ejecutarse en una única GPU NVIDIA de 16 GB (probado en una RTX 5060 Ti) y expone APIs compatibles con Ollama y OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5), con ordenador x86 de 64 bits compilado en los pesos; tag `qwen3_5_text` |
| Parametros totales | 4.341.091.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (dos archivos `.gguf`, ~13,7 GB en total); niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp); modelo base en formato compacto |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer de aproximadamente 4,34 mil millones de parámetros, sobre el que se ha realizado un proceso de "compilación de pesos" que integra un ordenador x86 de 64 bits. La arquitectura concreta del transformer base (número de capas, dimensiones, mecanismo de atención) no se detalla en la información disponible. La innovación principal es el concepto "computer-in-weights": el modelo no solo genera texto, sino que emite tokens de máquina que representan instrucciones y estado de un procesador x86 virtual, y estos se ejecutan de forma verificable. La model card indica que "cada token de máquina = la referencia", lo que sugiere una verificación bloque a bloque de la ejecución.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo base es `Quazim0t0/Qwenx86-4B-compact`, y esta versión GGUF es una cuantización del mismo. La integración con llama.cpp se realiza mediante una DLL puente (`gguf/qx86shim.dll`) construida específicamente contra llama.cpp b12017, lo que indica un acoplamiento estrecho entre el runtime de inferencia y el motor x86 embebido.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte para chat interactivo (`python -m qwenx86.mixed --gguf`).
- Tool calling integrado con seis herramientas: calculadora, intérprete de Python, compilador de C, notas, consulta científica y consulta de documentación de Python.
- Ejecución de código C real: el modelo escribe un programa en C y el compilador embebido lo compila y ejecuta, devolviendo la salida.
- Ejecución de Python para cálculos de precisión arbitraria (por ejemplo, 2 elevado a 100 exacto).
- Memoria persistente de notas (guardar, leer, buscar, listar y borrar) junto al modelo, en la misma conversación (v3).
- Razonamiento multi-paso mediante cadenas de llamadas a herramientas verificadas.
- Servidor local compatible con las APIs de Ollama y OpenAI (`python -m qwenx86.serve --gguf`), lo que permite integrarlo en aplicaciones existentes.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistente de cálculo verificable: el modelo resuelve operaciones aritméticas invocando la calculadora interna, que ejecuta 56.667 tokens de máquina en 240 bloques verificados. Es adecuado cuando se requiere trazabilidad del cómputo, no solo el resultado.
- Enseñanza de programación en C: el usuario pide un programa, el modelo lo escribe y el compilador x86 embebido lo compila y ejecuta, mostrando registros, flags y salida de máquina. El Space "Qwenx86 Debugger" permite recorrer la ejecución paso a paso.
- Depuración educativa a bajo nivel: al exponer registros, flags, código en el contador de programa y RAM, sirve para ilustrar cómo funciona un procesador x86 de 64 bits en un entorno controlado.
- Automatización de notas persistentes: con las herramientas de memoria (guardar, leer, buscar, listar, borrar), el modelo puede actuar como gestor de notas junto al propio modelo, útil en flujos de trabajo personales.
- Consulta de documentación técnica: la herramienta `python_doc` permite resolver firmas de funciones (por ejemplo, `math.gcd`) sin salir de la conversación, útil en asistentes de desarrollo.
- Integración en aplicaciones vía API: el servidor local compatible con Ollama y OpenAI permite conectar el modelo a clientes existentes sin adaptadores personalizados, adecuado para prototipos y entornos de escritorio.
- Experimentación en investigación sobre "computer-in-weights": sirve como banco de pruebas para estudiar la integración de cómputo determinista dentro de pesos de un LLM de 4B con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente aporta datos operativos de ejecución: una llamada a la calculadora (56.667 tokens de máquina en 240 bloques verificados, 83 tokens de texto) tarda entre 16 y 34 segundos de generación, frente a 41 segundos de la versión PyTorch, en un sistema con RTX 5060 Ti de 16 GB. El tiempo de carga del modelo no está incluido y puede ser mayor, especialmente la primera vez.

## Requisitos de hardware

- VRAM estimada: aproximadamente 14 GB en una única GPU NVIDIA para la inferencia (según la model card).
- GPU probada: NVIDIA RTX 5060 Ti de 16 GB, en Windows.
- Otras GPU y equipos: no probados según el autor; se recomienda abrir una discusión si falla algo.
- Cabe en GPU de consumo de 16 GB; no se dispone de datos para GPU con menos VRAM.
- Runtime: llama.cpp b12017, build Windows CUDA 13.4 x64 (obligatorio, la DLL puente está compilada contra esa versión).
- Requiere controlador NVIDIA reciente (CUDA 13.4) y Microsoft Visual C++ Redistributable x64 con `msvcp140.dll` 14.40 o superior.
- Python 3.12 en un entorno virtual limpio; el build de torch para CPU es suficiente porque llama.cpp ejecuta el modelo en la GPU.
- Despliegue: llama.cpp (build específico) y servidor local compatible con Ollama y OpenAI (`python -m qwenx86.serve --gguf`). No se mencionan vLLM ni TGI.
- Latencia: 16-34 s de generación para una llamada a la calculadora; throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Capacidad destacada | Licencia | Formato |
|---|---|---|---|---|---|
| Qwenx86-4B (este) | 4.341.091.648 | no disponible | Ordenador x86 de 64 bits compilado en pesos; tool calling verificado | Apache 2.0 | GGUF |
| Qwen3.5-4B (base) | ~4B (no confirmado) | no disponible | LLM conversacional general | no disponible en la información | no disponible |
| Quazim0t0/Qwenx86-4B-compact | mismo modelo | no disponible | Versión compacta original (PyTorch) | Apache 2.0 (según repo GGUF) | compacto |

No se dispone de información sobre otros modelos comparables de la misma categoría ("computer-in-weights") en la documentación proporcionada.

## Limitaciones y advertencias

- Entorno de ejecución muy específico: requiere llama.cpp b12017 exacto, build Windows CUDA 13.4 x64, controlador NVIDIA reciente y `msvcp140.dll` 14.40 o superior. Otras versiones o sistemas pueden fallar.
- Solo probado en Windows con una RTX 5060 Ti de 16 GB; otras GPU y equipos no están verificados.
- La descarga debe incluir el repositorio completo (carpetas `qwenx86/`, `chipformer/`, `machines/`, `model/`, `gguf/qx86shim.dll`, `gguf/text_dims.json`, `requirements.txt`), no solo los dos archivos `.gguf`.
- El chat con todas las herramientas y el servidor están soportados, pero sus resultados registrados no se han vuelto a ejecutar en un entorno limpio según la model card.
- Longitud de contexto e idiomas soportados no disponibles: no se puede garantizar un comportamiento multilingüe ni conversaciones de contexto largo.
- Riesgo de alucinación: no evaluado en la información disponible; el modelo base es un LLM generativo y las herramientas solo cubren los dominios implementados.
- Sesgos conocidos: no disponibles.
- Licencia Apache 2.0, que permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en producción.
- El acoplamiento a una versión concreta de llama.cpp y a una DLL puente propia puede complicar el mantenimiento y la portabilidad a otros entornos.
- No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que no es posible comparar su calidad general con otros modelos de 4B.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/Quazim0t0/Qwenx86-4B-GGUF
- Repositorio original (modelo compacto): https://huggingface.co/Quazim0t0/Qwenx86-4B-compact
- Space de depuración: https://huggingface.co/spaces/Quazim0t0/Qwenx86-Debugger
- llama.cpp b12017: https://github.com/ggml-org/llama.cpp/releases/tag/b12017
- Git LFS: https://git-lfs.com
- Controladores NVIDIA: https://www.nvidia.com/Download/index.aspx
- Visual C++ Redistributable x64: https://aka.ms/vs/17/release/vc_redist.x64.exe
