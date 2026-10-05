# percepta-ai/spotlight-vm

## Resumen

Spotlight VM es un modelo de lenguaje experimental publicado por percepta-ai en HuggingFace. No es un LLM convencional: se trata de un transformer "Spotlight" construido a mano que actua como una maquina virtual capaz de ejecutar un subconjunto de Python (MicroPython v1.28.0). Sus pesos, alojados en el directorio `intelligence/`, suman menos de 100.000 parametros y no cambian durante el uso; la "memoria" del sistema se guarda aparte, en el directorio `memory/`, en formato safetensors.

El modelo acompana al articulo "Can LLMs Grow Their Own Capabilities?" y sirve como banco de pruebas para experimentos de crecimiento de capacidades, carga selectiva de conocimiento y ampliacion de inteligencia sin reentrenamiento. Resuelve tareas acotadas de ejecucion de codigo (problemas 1 a 3 de Project Euler, calculo de tramos de impuestos, reconocimiento de un digito de MNIST) generando token a token la salida del interprete.

Es relevante ahora por su enfoque poco habitual de separar pesos fijos y memoria externa, y por su eficiencia: corre en un solo nucleo de CPU a unos 120.000 tokens por segundo, sin necesidad de GPU. Se trata de un modelo de investigacion, no de un asistente de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Spotlight (construido a mano, `custom_code`) |
| Parametros totales | Menos de 100.000 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`intelligence/` y `memory/core.safetensors`) |
| Libreria | transformers (requiere `trust_remote_code=True`) |
| Pipeline | text-generation |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes en HuggingFace | 84 / 10 |
| Fecha de creacion | 2026-09-29 |
| Fecha de actualizacion | 2026-10-05 |

## Arquitectura y entrenamiento

La arquitectura es un transformer denominado Spotlight y descrito por el autor como "construido a mano". Su peculiaridad es la separacion en dos componentes: `intelligence/` contiene los pesos del transformer (menos de 100.000 parametros), que nunca se modifican una vez fijados, mientras que `memory/` almacena MicroPython v1.28.0 (`core.safetensors`) junto con dos paquetes adicionales. Esto permite que el modelo combine una parte estatica (los pesos de "inteligencia") con una parte de conocimiento externalizada y potencialmente intercambiable.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras. El autor enmarca el modelo en el articulo "Can LLMs Grow Their Own Capabilities?", orientado a explorar la adquisicion y actualizacion de conocimiento (ejemplo `tax_brackets`), la carga selectiva de memoria (`memory_loader.py`) y el crecimiento de capacidades (`mnist_digit.py`). El build de MicroPython empleado no soporta coma flotante, lo que restringe las operaciones a aritmetica entera.

## Capacidades

- Ejecucion de codigo Python: interpreta un subconjunto de MicroPython y emite la salida del programa (por ejemplo, `print(1 + 2)` produce `3`).
- Aritmetica entera: resuelve problemas de Project Euler (resultados `233168`, `4613732`, `6857` para los problemas 1, 2 y 3).
- Carga selectiva de memoria: ejemplo `memory_loader.py` con salida `4`.
- Adquisicion y actualizacion de conocimiento: ejemplo `tax_brackets`, con salidas `$17400` y despues `$16914`.
- Reconocimiento de digitos: ejemplo `mnist_digit.py` con salida `7`.
- Ejecucion local sin GPU: aproximadamente 120.000 tokens por segundo en un solo nucleo de CPU.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible; el unico caso cercano a vision es el ejemplo de MNIST, limitado a un digito.

## Casos de uso

- Investigacion en separacion entre pesos y memoria: permite estudiar como un transformer de menos de 100.000 parametros puede combinar un nucleo fijo (`intelligence/`) con conocimiento intercambiable (`memory/`), util para lineas de trabajo sobre modularidad en modelos pequenos.
- Reproduccion de experimentos academicos: los ejemplos de Project Euler, `tax_brackets` y `mnist_digit` permiten replicar de forma controlada los resultados publicados en el articulo del autor.
- Docencia sobre interpretes neuronales: sirve para ilustrar, con un coste computacional minimo, como un transformer puede generar token a token la salida de un interprete de Python.
- Evaluacion de ejecucion de codigo en CPU: al correr a unos 120.000 tokens/s en un unico nucleo, es adecuado para experimentos en entornos sin acelerador grafico (servidores modestos, contenedores ligeros).
- Pruebas de crecimiento de capacidades: el ejemplo `mnist_digit.py` permite medir como el sistema amplia funcionalidad sin reentrenar los pesos base, util como banco de pruebas de tecnicas de "auto-mejora".
- Prototipado de maquinas virtuales asistidas por transformer: puede emplearse como referencia para disenar sistemas que externalizan conocimiento (paquetes de `memory/`) en lugar de incorporarlo a los pesos.
- Estudio de rendimiento en tareas de ejecucion simbolica: la resolucion de los problemas de Project Euler y el calculo de tramos de impuestos ofrece casos reproducibles para medir precision y latencia en tareas deterministas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

Los unicos datos de rendimiento publicados son los ejemplos funcionales y las cifras de velocidad de la model card:

| Ejemplo | Tarea | Salida | Tiempo |
|---|---|---|---|
| `examples/euler1.py` | Project Euler 1 | `233168` | Minutos |
| `examples/euler2.py` | Project Euler 2 | `4613732` | Minutos |
| `examples/euler3.py` | Project Euler 3 | `6857` | Minutos |
| `examples/memory_loader.py` | Carga selectiva de memoria | `4` | No disponible |
| `examples/tax_brackets/` | Adquisicion y actualizacion de conocimiento | `$17400`, despues `$16914` | No disponible |
| `examples/mnist_digit.py` | Reconocimiento de digito | `7` | Unos 30 minutos (245M tokens) |

Velocidad declarada por el autor: aproximadamente 120.000 tokens por segundo en un solo nucleo de CPU.

## Requisitos de hardware

- VRAM estimada: practicamente nula; el modelo (menos de 100.000 parametros) y los pesos de MicroPython caben holgadamente en menos de 1 GB de RAM.
- GPU recomendadas: no se requiere GPU. El modelo esta disenado para ejecutarse en CPU.
- Compatibilidad con GPU de consumo: no aplica; no necesita GPU dedicada (tampoco se ha documentado soporte CUDA especifico).
- CPU: un unico nucleo es suficiente; el autor reporta unos 120.000 tokens por segundo en ese entorno.
- Opciones de despliegue: via `transformers` con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`, o compilando el binario en C (`cc -O3 -std=c99 spotlight.c -lm -o spotlight`) y ejecutandolo contra ficheros de ejemplo. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: los ejemplos de Project Euler tardan minutos; el ejemplo de MNIST tarda unos 30 minutos generando 245M tokens. El throughput declarado es de aproximadamente 120.000 tokens por segundo.
- Requisito adicional: el build de MicroPython incluido no dispone de soporte de coma flotante, lo que condiciona los tipos de calculo posibles.

## Comparativa con modelos similares

No disponible. No se han encontrado en la informacion proporcionada modelos comparables de la misma categoria. Spotlight VM no es un LLM de proposito general, sino un transformer de menos de 100.000 parametros que actua como maquina virtual de Python; no existen alternativas equivalentes documentadas en los datos disponibles para comparar parametros, contexto, rendimiento o disponibilidad. Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta analisis de sesgos.
- Riesgo de alucinacion: aunque el modelo ejecuta codigo en lugar de redactar texto libre, puede producir salidas incorrectas o fallar en programas fuera del subconjunto de MicroPython soportado; no hay validacion de resultados.
- Limitacion de contexto e idioma: la longitud de contexto no se documenta y no hay informacion sobre idiomas soportados.
- Sin coma flotante: el build de MicroPython v1.28.0 empleado no soporta operaciones en coma flotante, lo que limita los calculos a aritmetica entera.
- Pesos fijos: los pesos de `intelligence/` nunca cambian, por lo que la ampliacion de capacidades depende de la memoria externa y no del ajuste del modelo.
- Codigo remoto: requiere `trust_remote_code=True` para cargarse con transformers, lo que implica ejecutar codigo del autor; conviene revisarlo antes de usarlo en entornos sensibles.
- Madurez y adopcion: 84 descargas y 10 likes en HuggingFace; es un artefacto de investigacion con poca validacion externa.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el modelo esta pensado para experimentacion y sus casos de uso practicos son muy acotados.
- Caveat de produccion: los tiempos de ejecucion (minutos por ejemplo, media hora para MNIST) lo hacen inviable para cargas de trabajo en tiempo real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/percepta-ai/spotlight-vm
- Blog del autor sobre Spotlight Memory: https://percepta.ai/blog/spotlight-memory
- Blog del autor "Can LLMs Grow Their Own Capabilities?": https://percepta.ai/blog/can-llms-grow-their-own-capabilities
- Licencia Apache 2.0 referenciada en el repositorio: `LICENSE.md` (no se proporciona URL directa en la informacion disponible)

Nota: las busquedas web realizadas devolvieron unicamente resultados no relacionados (paginas de un videojuego), por lo que no se han podido incorporar enlaces adicionales, papers ni repositorios externos.
