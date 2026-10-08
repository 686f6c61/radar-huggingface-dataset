# cgpadwick2020/qwen3-1.7b-triton-sft-v2

## Resumen

qwen3-1.7b-triton-sft-v2 es un ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3-1.7B, desarrollado por el usuario cgpadwick2020, especializado en la generacion de kernels de GPU escritos en Triton. El problema que aborda es concreto: los modelos de proposito general rara vez producen kernels de bajo nivel correctos y conformes a la API de Triton, por lo que este modelo se entrena especificamente para transformar un modulo de referencia en PyTorch en una implementacion equivalente con decoradores `@triton.jit`.

El modelo parte de la arquitectura transformer decoder-only densa de la familia Qwen3, con 1.720.574.976 parametros (aproximadamente 1,72 mil millones). La licencia es Apache 2.0, lo que facilita su uso comercial, y esta orientado a un unico idioma de trabajo: el ingles. El repositorio ocupa 3,5 GB y los pesos se distribuyen en formato safetensors.

Su relevancia actual radica en que aplica una metodologia de generacion-verificacion-reparacion inspirada en TritonRL (arXiv 2510.17891) para construir datos de entrenamiento verificados en GPU real, un enfoque poco frecuente en modelos de este tamano. Segun el autor, el modelo base puntua un 0 % en las mismas tareas, mientras que este ajuste alcanza un 32,9 % de kernels correctos en modo greedy sobre un conjunto retenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) |
| Parametros totales | 1.720.574.976 (aproximadamente 1,72 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (longitud usada en el SFT; el modelo base Qwen3-1.7B soporta 32.768 tokens nativos) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen3-1.7B y se somete a un full fine-tune supervisado (SFT unicamente; sin fase de RL en esta version). El entrenamiento se realizo sobre 20.437 pares verificados de (prompt, kernel) que cubren 2.748 tareas del corpus KernelBook. Los kernels de entrenamiento fueron generados por DeepSeek V4.1 Flash (7 muestras por tarea) y Qwen3.8-27B dentro de un bucle de generacion-verificacion-reparacion. Cada muestra paso un verificador que comprueba el formato, un linter estatico anti-trampas, un lanzamiento real en GPU y cinco pruebas de correccion contra la referencia de PyTorch.

Los hiperparametros reportados son: learning rate 1e-4 con decaimiento lineal, batch efectivo de 16 y longitud maxima de 8.192 tokens. El mejor checkpoint se selecciono por perdida de validacion (0,264, al final de la epoca 2 de 3). El formato de prompt empleado es un unico turno de usuario que contiene el modulo de referencia en PyTorch y la instruccion de producir una clase `ModelNew` con kernels `@triton.jit`; el modo de razonamiento (thinking) esta desactivado, con un bloque `<think></think>` vacio como prefijo del asistente. La plantilla exacta es `USER_TEMPLATE` en `src/teacher.py` del repositorio del proyecto.

## Capacidades

- Generacion de kernels de GPU en Triton a partir de un modulo de referencia en PyTorch, produciendo una clase `ModelNew` con decoradores `@triton.jit`.
- Transformacion de operaciones PyTorch (incluidas operaciones propias de cargas de trabajo tipo KernelBench) a implementaciones de bajo nivel en Triton.
- Generacion de kernels que en parte de los casos superan en velocidad al modo eager de PyTorch (16,4 % de los casos en modo greedy).
- Generacion condicionada por muestreo multiple: la tasa de exito sube con pass@16, lo que permite seleccionar la mejor variante entre varias muestras.
- Trabajo en ingles exclusivamente; no se declara soporte multilingue.
- Sin soporte documentado de tool calling, function calling ni comportamiento de agente multi-paso.
- Sin capacidades de vision ni audio.
- Modo thinking desactivado por diseno en el formato de entrenamiento.

## Casos de uso

- Optimizacion de kernels en produccion: dado un modulo de PyTorch que actua como cuello de botella, el modelo propone una version en Triton que puede acelerar la ejecucion, aprovechando que en el 16,4 % de los casos la salida supera al eager de PyTorch.
- Aceleracion de capas personalizadas: para operaciones que no tienen kernel optimizado en las librerias estandar, el modelo genera implementaciones `@triton.jit` que el equipo puede integrar y validar.
- Generacion de candidatos con seleccion posterior: mediante muestreo a temperatura 0,6 y pass@16 (61,2 % de exito), un pipeline puede generar multiples kernels y elegir el correcto y mas rapido con un verificador automatico.
- Autocompletado en entornos de investigacion sobre Triton: como asistente que traduce prototipos de PyTorch a kernels de bajo nivel dentro de un flujo de experimentacion.
- Generacion de datos sinteticos de kernels: usar el modelo para producir pares (referencia, kernel) que alimenten posteriores fases de RL o de destilacion.
- Benchmarking y evaluacion interna: como baseline especializado para medir frameworks de generacion de kernels frente a modelos generalistas, dado que el modelo base puntua un 0 % en las tareas.
- Formacion y prototipado docente: ilustrar la traduccion de operaciones tensoriales a Triton con ejemplos verificables en GPU.

## Benchmarks y rendimiento

Resultados sobre 152 tareas de KernelBook nunca vistas en entrenamiento, verificadas con el mismo procedimiento que los datos de entrenamiento:

| Metrica | Valor |
|---|---|
| Correctos, greedy, una muestra | 32,9 % |
| Correctos y mas rapidos que PyTorch eager, greedy | 16,4 % |
| pass@16 a temperatura 0,6 | 61,2 % |
| KernelBench | no evaluado todavia |
| Modelo base Qwen3-1.7B (mismas tareas) | 0 % |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en FP16/BF16, en torno a 1,8 GB en INT8 y cerca de 1 GB en INT4 (valores orientativos para 1,72 mil millones de parametros; no se han publicado mediciones oficiales).
- GPU recomendadas: cabe con holgura en cualquier GPU de consumo con 8 GB o mas de VRAM, incluidas RTX 3060, RTX 4060, RTX 4070 y RTX 4090.
- Cabe en GPU de consumo: si, sin necesidad de cuantizacion en la mayoria de tarjetas de 8 GB o superiores.
- Entorno de ejecucion: la generacion y validacion de kernels Triton requiere GPU NVIDIA con soporte CUDA, dado que el entrenamiento y el verificador emplean lanzamientos reales en GPU.
- Opciones de despliegue: vLLM, TGI, llama.cpp/Ollama (previa conversion a GGUF) y transformers, segun la informacion generica del ecosistema; el autor no documenta un stack de despliegue concreto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-1.7b-triton-sft-v2 | 1,72 mil millones | 8.192 (entrenamiento) | Generacion de kernels Triton | apache-2.0 | HuggingFace |
| Qwen/Qwen3-1.7B (base) | 1,72 mil millones | 32.768 nativo | Proposito general | apache-2.0 | HuggingFace |
| TritonRL (arXiv 2510.17891) | no disponible | no disponible | Generacion de kernels Triton con RL | no disponible | paper |
| Otros modelos de generacion de kernels | no disponible | no disponible | Generacion de kernels | no disponible | no disponible |

No se dispone de resultados de benchmarks comparables publicados para alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Es un ajuste de tipo SFT unicamente, sin fase de RL; el propio autor lo indica como version intermedia.
- La tasa de exito base es limitada: 32,9 % de kernels correctos en greedy y solo 16,4 % que ademas superan al eager de PyTorch, lo que obliga a usar verificacion automatica antes de cualquier uso en produccion.
- KernelBench todavia no se ha evaluado, por lo que el rendimiento fuera del corpus KernelBook es desconocido.
- El modelo esta entrenado exclusivamente en ingles; no se declara soporte para otros idiomas.
- La longitud de entrenamiento es de 8.192 tokens, inferior al contexto nativo del modelo base, lo que puede degradar el comportamiento en secuencias mas largas.
- Riesgo de alucinacion: puede producir kernels con formato valido pero incorrectos o con estrategias que el linter anti-trampas consideraria invalidas en el conjunto de entrenamiento.
- No hay soporte documentado de tool calling ni de agentes, lo que limita su integracion en flujos automatizados complejos.
- No se especifican sesgos conocidos mas alla de los heredados del modelo base y del corpus KernelBook.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrece ninguna garantia de correccion de los kernels generados.
- Modelo con 0 descargas y 0 likes en el momento de la ficha; escasa validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/cgpadwick2020/qwen3-1.7b-triton-sft-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio del proyecto (codigo, verificador y registro de experimentos): https://github.com/cgpadwick/triton_rl_project
- Paper de referencia TritonRL: arXiv 2510.17891
