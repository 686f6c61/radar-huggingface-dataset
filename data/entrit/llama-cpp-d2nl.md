# Entrit/llama.cpp-d2nl

## Resumen

Entrit/llama.cpp-d2nl es un repositorio de herramientas, no un modelo de pesos en si mismo. Contiene el script de instalacion y el kernel D2 que permite a llama.cpp leer y ejecutar los modelos de la familia Entrit d2, que almacenan cada peso como uno de 9 niveles discretos en lugar de usar cuantizacion convencional. El autor es Entrit, y el repositorio se distribuye bajo licencia MIT.

El problema que resuelve es concreto: llama.cpp estandar no puede interpretar el formato de pesos d2, por lo que este repositorio proporciona un parche que anade un tipo GGUF llamado D2NL. Este tipo reutiliza las rutas de codigo existentes de IQ4_NL, sustituyendo la tabla de expansion por una tabla int8 de 16 entradas, de modo que el kernel funciona sobre CUDA (dp4a y tensor cores int8), Vulkan, Metal y CPU.

Es relevante porque demuestra una via de cuantizacion alternativa a las habituales (Q4_K_M, IQ4_XS, etc.) que reutiliza la infraestructura de llama.cpp sin reescribir los kernels. El repositorio no contiene pesos: solo el instalador, el parche del kernel y los scripts auxiliares. La model card indica que el modelo Qwen3.8-27B d2 en formato D2NL ocupa 15,3 GB y requiere 24 GB de VRAM en GPU o 32 GB de memoria unificada en Mac.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de herramientas; el kernel D2 da soporte a modelos de la familia Entrit d2) |
| Parametros totales | no disponible (el modelo de referencia Qwen3.8-27B d2 tiene 27B, segun su nombre) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | D2NL (9 niveles: 0, ±1, ±2.83, ±5.20, ±8, con una escala por grupo de 64 pesos); compatible con el bloque de 4 bits de IQ4_NL |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (tipo D2NL); el repositorio en si contiene scripts `.sh` y parches |

## Arquitectura y entrenamiento

Este repositorio no entrena ningun modelo. Proporciona un kernel de inferencia para el formato de pesos d2 de Entrit. El esquema d2 representa cada peso como uno de 9 niveles discretos (0, ±1, ±2.828, ±5.196, ±8) multiplicado por una escala por grupo de 64 pesos. El kernel anade un tipo GGUF, D2NL, que almacena el indice de nivel en el mismo bloque de 4 bits que llama.cpp usa para IQ4_NL, y lo expande mediante una tabla int8 de 16 entradas (multiplicador 10.981, con un error maximo del 0,19% por nivel).

Gracias a esta equivalencia estructural, todas las rutas de codigo de IQ4_NL sirven para D2NL con la tabla intercambiada: dp4a y tensor cores int8 en NVIDIA (CUDA), shaders Vulkan en AMD e Intel, Metal en Apple y C plano en CPU. La ruta ROCm (`--backend hip`) se compila a partir del codigo CUDA pero no ha sido probada segun la model card. El instalador descarga llama.cpp, aplica el parche del kernel, detecta la GPU y compila; al final ejecuta un autotest que compara la salida del kernel en GPU con la de CPU y debe imprimir `PASS`.

## Capacidades

- Compilacion automatizada de llama.cpp con el kernel D2 anadido, con deteccion de backend (CUDA, Vulkan, Metal, HIP, CPU).
- Ejecucion de modelos en formato D2NL, empezando por Qwen3.8-27B d2 (`Qwen3.8-27B-d2-D2NL.gguf`, 15,3 GB).
- Servidor de chat local con interfaz web en `http://localhost:8080`.
- API compatible con OpenAI Chat Completions en `http://localhost:8080/v1`, lo que permite integrar el modelo en herramientas que ya hablan ese protocolo.
- Descarga reanudable de modelos desde Hugging Face mediante `get-model.sh`.
- Actualizacion del kernel sin perder los modelos descargados (`./install.sh --update`).
- Autotest de validacion numerica del kernel frente a la implementacion en CPU.
- Soporte de ejecucion parcial en GPU mediante `-ngl N` para ajustar el numero de capas offloaded.
- No soporta aun Muse-Glimmer-30B d2 (arquitectura no implementada en llama.cpp) ni DeepSeek-V4-Flash d2 (requiere el codigo de inferencia propio de DeepSeek).

## Casos de uso

- Evaluacion de la cuantizacion d2 en hardware propio: un investigador puede instalar el kernel, descargar Qwen3.8-27B-d2-D2NL y comparar calidad y velocidad frente a IQ4_NL o Q4_K_M sobre el mismo modelo base, aprovechando que el autotest verifica la equivalencia numerica GPU/CPU.
- Despliegue local en estaciones de trabajo con una sola GPU de 24 GB: el modelo de referencia de 27B en D2NL ocupa 15,3 GB, por lo que cabe en una RTX 3090 o 4090 y deja margen para el contexto y el servidor.
- Uso en Mac con Apple Silicon: con 32 GB de memoria unificada se puede ejecutar el modelo mediante el backend Metal, sin necesidad de GPU dedicada.
- Integracion en aplicaciones existentes mediante la API compatible con OpenAI: cualquier cliente que apunte a `http://localhost:8080/v1` puede usar el modelo sin cambios de codigo, util para prototipos de asistentes o pipelines internos.
- Pruebas de offloading parcial: en tarjetas con menos VRAM, `./run.sh models/<file>.gguf -ngl 30` permite mantener parte de las capas en CPU y medir el impacto en latencia y throughput.
- Desarrollo y validacion de kernels de cuantizacion: el repositorio sirve como referencia de como anadir un tipo GGUF nuevo reutilizando las rutas de IQ4_NL en CUDA, Vulkan, Metal y CPU, con un autotest incorporado.
- Experimentacion en entornos Windows mediante WSL: el flujo documentado permite usar GPU NVIDIA dentro de WSL con el driver estandar de Windows.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta el autotest de equivalencia numerica GPU/CPU (salida `PASS`) y el tamano del fichero de referencia (15,3 GB para Qwen3.8-27B-d2-D2NL.gguf). No se proporcionan cifras de latencia, throughput ni calidad.

## Requisitos de hardware

- VRAM: 24 GB para el modelo de referencia Qwen3.8-27B d2 en D2NL en GPU dedicada (RTX 3090, RTX 4090 o similar). En Mac, al menos 32 GB de memoria unificada.
- GPU compatibles: NVIDIA (CUDA, con dp4a y tensor cores int8), AMD e Intel (Vulkan), Apple Silicon M1 o superior (Metal). La ruta ROCm/HIP existe pero no esta probada.
- CPU: existe un backend en C plano, descrito como mas lento, para equipos sin GPU.
- Disco: unos 5 GB libres para la compilacion de llama.cpp, mas el espacio del modelo (15,3 GB para el de referencia).
- Sistemas operativos: macOS con Apple Silicon, Linux (Ubuntu/Debian documentados) y Windows mediante WSL.
- Despliegue: el repositorio instala y compila llama.cpp con el kernel D2; expone un servidor web local y una API compatible con OpenAI. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Herramienta | Funcion | Formatos soportados | Licencia | Estado |
|---|---|---|---|---|
| Entrit/llama.cpp-d2nl | Kernel D2 para llama.cpp | GGUF con tipo D2NL | MIT | Publicado, sin descargas ni likes |
| llama.cpp (upstream) | Motor de inferencia GGUF | GGUF (Q4_K, IQ4_NL, etc.) | MIT | Proyecto consolidado |
| Repositorios de cuantizacion de modelos (p. ej. variantes GGUF de terceros) | Distribucion de pesos cuantizados | GGUF | Segun autor | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo; solo scripts y el parche del kernel. La funcionalidad depende de descargar modelos D2NL de otros repositorios de Entrit.
- Cobertura limitada: solo Qwen3.8-27B d2 esta confirmado como ejecutable. Muse-Glimmer-30B d2 no funciona en llama.cpp por falta de soporte de arquitectura y DeepSeek-V4-Flash d2 requiere el codigo propio de DeepSeek.
- La ruta ROCm (`--backend hip`) no ha sido probada; se recomienda Vulkan en su lugar.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-09), por lo que no hay evidencia de uso en produccion ni validacion externa.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma del modelo subyacente; habria que consultar la model card de Qwen3.8-27B d2.
- La licencia MIT cubre los scripts y el kernel, pero no necesariamente los pesos de los modelos descargados, cuyas condiciones deben verificarse por separado.
- La compilacion inicial tarda entre 5 y 20 minutos y requiere toolchain (Xcode, build-essential, cmake, curl, patch) y, en su caso, CUDA Toolkit o Vulkan SDK.
- El formato D2NL esta atado a la implementacion de IQ4_NL de llama.cpp; cambios upstream en esas rutas podrian romper el parche, de ahi el comando `--update`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Entrit/llama.cpp-d2nl
- Modelo de referencia Qwen3.8-27B d2 GGUF: https://huggingface.co/Entrit/Qwen3.8-27B-d2-GGUF
- Muse-Glimmer-30B d2: https://huggingface.co/Entrit/Muse-Glimmer-30B-d2
- DeepSeek-V4-Flash d2: https://huggingface.co/Entrit/DeepSeek-V4-Flash-d2swap-mp2
- Instalador: https://huggingface.co/Entrit/llama.cpp-d2nl/resolve/main/install.sh
- Homebrew: https://brew.sh
- CUDA Toolkit: https://developer.nvidia.com/cuda-downloads
- Vulkan SDK: https://vulkan.lunarg.com
