# Axellwppr/HITCH

## Resumen

HITCH es una familia de modelos vision-lenguaje publicada por Axellwppr (con autores academicos como Qingzhou Lu, Chenxin Liu o Mengdi Xu) y disenada especificamente para operar un robot humanoide Unitree G1 a traves de las herramientas de un arnes de control llamado *HITCH harness*. El modelo es un fine-tuning de Qwen3.8-27B, de ahi sus aproximadamente 27.000 millones de parametros y su naturaleza multimodal (entrada de imagen y texto, salida de texto). Resuelve el problema de traducir instrucciones en lenguaje natural y observaciones visuales en llamadas a herramientas de bajo nivel para el control corporal completo del robot, sin traza de razonamiento intermedia.

La relevancia del modelo es doble: por un lado, aplica el paradigma de *tool calling* propio de los LLM a la robotica humanoide, delegando el control motor en un arnes externo en lugar de generar acciones directamente; por otro, se distribuye con licencia Apache-2.0 y pesos en safetensors compatibles con transformers y vLLM, lo que facilita su reproduccion y despliegue. El repositorio incluye dos variantes: `HITCH-27B`, entrenada sobre las familias de tareas del arnes y la que se ejecuta en el robot real, y `HITCH-27B-SIMPLE`, que anade trayectorias de las tareas del benchmark SIMPLE.

El modelo se publica en noviembre de 2026 y va acompanado de un paper en arXiv (2611.08039, categoria cs.RO), una pagina de proyecto y un repositorio de codigo en GitHub. El tamano del repositorio (109,4 GB) es coherente con dos checkpoints de 27B en precision de 16 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), fine-tuning de Qwen3.8-27B |
| Parametros totales | ~27.000 millones (heredados del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (configuracion de despliegue: `--max-model-len 262144`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers; tambien servible con vLLM) |

## Arquitectura y entrenamiento

HITCH se construye mediante fine-tuning supervisado sobre Qwen3.8-27B, un modelo vision-lenguaje de ~27B parametros. La innovacion no reside en la arquitectura del modelo en si, sino en el esquema de entrenamiento: el modelo aprende a emitir llamadas a las herramientas del *HITCH harness*, que encapsulan el control del cuerpo completo del Unitree G1, en lugar de generar comandos motores directamente. Las dos variantes se diferencian en los datos: `HITCH-27B` se entrena con las familias de tareas del arnes, mientras que `HITCH-27B-SIMPLE` incorpora ademas trayectorias de las tareas del benchmark SIMPLE. Segun la model card, ambos modelos responden sin traza de razonamiento (no *thinking mode*).

El despliegue recomendado activa el parser de razonamiento de Qwen3 y el parser de tool calling `qwen3_coder` en vLLM, lo que confirma que el modelo conserva el formato de llamada a funciones del modelo base. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento multimodal a partir de entradas de imagen y texto.
- Llamada a herramientas (*tool calling* / *function calling*) con el formato de Qwen3, orientada a las herramientas del arnes HITCH.
- Control de un humanoide Unitree G1 mediante invocacion de herramientas de cuerpo completo.
- Ejecucion de familias de tareas roboticas definidas por el arnes (por ejemplo, `tabletop_pick`).
- Capacidad de operar sobre el benchmark SIMPLE en la variante `HITCH-27B-SIMPLE`.
- Respuesta directa sin traza de razonamiento, lo que reduce latencia en el bucle de control.
- Soporte de contexto largo de hasta 262.144 tokens.
- Soporte de multiples imagenes por prompt (hasta 512 en la configuracion de vLLM indicada).

## Casos de uso

- **Manipulacion de objetos en mesa (*tabletop pick*)**: el modelo recibe la imagen de la escena y la instruccion, y emite las llamadas a las herramientas del arnes para que el G1 localice y agarre el objeto. Es el flujo de referencia del repositorio (`scripts/agent run tabletop_pick`).
- **Operacion de humanoide en laboratorio de investigacion**: permite sustituir heuristicas de control por un VLM que interpreta la escena y selecciona herramientas de alto nivel, acelerando la experimentacion con nuevas tareas.
- **Evaluacion reproducible en el benchmark SIMPLE**: la variante `HITCH-27B-SIMPLE` permite comparar el rendimiento del modelo frente a otras politicas en tareas estandarizadas de robotica.
- **Prototipado de agentes roboticos con tool calling**: al conservar el formato de funciones de Qwen3, el modelo puede integrarse en frameworks de agentes que ya hablan ese protocolo, anadiendo herramientas especificas del robot.
- **Investigacion en vision-lenguaje aplicada a robotica**: sirve como base para estudiar como un VLM de 27B generalista se adapta a control embodied mediante fine-tuning y un arnes de herramientas.
- **Demostraciones y validacion en simulacion**: el flag `--viewer` del repositorio permite ejecutar tareas con visualizacion antes de desplegar en hardware real.
- **Punto de partida para fine-tunings propios**: la licencia Apache-2.0 y los pesos en safetensors permiten adaptar el modelo a otros arneses o robots sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con ~27B parametros, en FP16 se situaria en torno a 54 GB solo para pesos, mas memoria para KV cache y vision encoder; en cuantizaciones de 8 o 4 bits se reduciria aproximadamente a la mitad o a un cuarto, respectivamente (estimacion, no dato del autor).
- GPU recomendadas: no indicadas por el autor. Por tamano, una A100 80 GB o H100 80 GB permiten servir el modelo en FP16; configuraciones multi-GPU o cuantizacion serian necesarias en GPUs de menor memoria.
- GPU de consumo: no cabe en GPUs consumer de 24 GB en FP16; requeriria cuantizacion agresiva y no hay informacion sobre soporte de llama.cpp u Ollama.
- Opciones de despliegue: vLLM es el metodo oficial documentado, con `--reasoning-parser qwen3`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_coder` y `--limit-mm-per-prompt '{"image": 512, "video": 0}'`. Tambien es compatible con transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HITCH-27B | ~27B | 262.144 | VLM para control de humanoide via tool calling | Apache-2.0 | Hugging Face, vLLM |
| Qwen3.8-27B (modelo base) | ~27B | no disponible | VLM generalista | no disponible | Hugging Face |
| Otros VLM roboticos | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye modelos comparables especificos de robotica humanoide con los que contrastar rendimiento o arquitectura.

## Limitaciones y advertencias

- El modelo esta especializado en el arnes HITCH y el Unitree G1; su uso fuera de ese ecosistema requerira adaptacion.
- No se documentan sesgos conocidos ni evaluaciones de robustez o seguridad en la model card.
- Riesgo de alucinacion en la seleccion de herramientas y parametros, con consecuencias fisicas en un robot real; se recomienda validacion en simulacion antes del despliegue.
- No se especifican los idiomas soportados; el modelo base Qwen3.8 probablemente cubre varios, pero no hay confirmacion.
- No se detallan los datos de entrenamiento, lo que limita la evaluacion de sesgos y de calidad del fine-tuning.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo en hardware real.
- El modelo responde sin traza de razonamiento, lo que puede dificultar la depuracion de fallos en tareas complejas.
- El tamano del repositorio (109,4 GB) implica requisitos de almacenamiento y ancho de banda considerables para su descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Axellwppr/HITCH
- Pagina del proyecto: https://hitch.axell.top
- Paper en arXiv: https://arxiv.org/abs/2611.08039
- Codigo en GitHub: https://github.com/Axellwppr/Hitch
