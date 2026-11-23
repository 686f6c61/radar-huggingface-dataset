# M-Alkassem/qwen2.5-coder-3b-agent-v1

## Resumen

qwen2.5-coder-3b-agent-v1 es un adaptador LoRA de PEFT desarrollado por M-Alkassem, no un modelo autónomo. Se construye sobre Qwen2.5-Coder-3B-Instruct mediante una cadena de dos etapas de ajuste fino supervisado: primero un adaptador orientado a código (qwen2.5-coder-3b-unsloth-lora) y después este segundo adaptador orientado a comportamiento agéntico. El objetivo declarado es mejorar el comportamiento multi-paso en tareas de ingeniería del software, concretamente el ciclo inspeccionar, razonar, editar y probar dentro de un bucle de agente con herramientas.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-Coder-3B, con aproximadamente 3.000 millones de parámetros, contexto nativo de 32.768 tokens en la familia Qwen2.5 y licencia Apache 2.0. El adaptador en sí ocupa unos 0,1 GB en el repositorio y se distribuye en formato safetensors compatible con PEFT. El entrenamiento se realizó con SFT, LoRA y cuantización de 4 bits sobre una GPU Tesla T4 de Google Colab, con 700 filas muestreadas del dataset ernie-research/MEnvData-SWE-Trajectory, longitud máxima de secuencia de 1024 tokens y 150 pasos.

Su relevancia es acotada pero concreta: demuestra un flujo de ajuste fino de bajo coste para convertir un modelo de código de 3B en un núcleo de razonamiento para agentes ligeros con herramientas de ficheros y ejecución de Python. El propio autor advierte que en evaluación de respuesta directa el modelo base sigue siendo superior, por lo que el valor del adaptador se manifiesta únicamente en modo agéntico con realimentación de herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-3B-Instruct) con adaptador LoRA |
| Parametros totales | ~3.000 millones (modelo base); adaptador LoRA de tamano no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; entrenamiento del adaptador con max_seq_length de 1024 |
| Tipos de cuantizacion | 4 bits NF4 con doble cuantizacion (bnb-4bit) para el base; el adaptador se carga en precision del base |
| Idiomas soportados | ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el base en safetensors o cuantizado bnb-4bit |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-Coder-3B-Instruct, un transformer decoder-only denso de unos 3.000 millones de parámetros con atención causal estándar y RoPE. La cadena de entrenamiento es explícita: se parte de unsloth/Qwen2.5-Coder-3B-Instruct-bnb-4bit, se entrena un primer adaptador de código (qwen2.5-coder-3b-unsloth-lora) y sobre ese estado se continúa el ajuste con este segundo adaptador agéntico. El método es SFT con LoRA y cuantización de 4 bits, gestionado con las librerías transformers, trl, peft y unsloth.

Los datos provienen de un subconjunto muestreado de ernie-research/MEnvData-SWE-Trajectory, con 700 filas y una estrategia de formateo de trayectorias truncadas por la cola para encajar en el presupuesto de tokens. La configuración de entrenamiento incluye batch size por dispositivo de 1, acumulación de gradiente de 16 (batch efectivo de 16), learning rate de 5e-5, optimizador adamw_8bit, 150 pasos y longitud máxima de secuencia de 1024 tokens. La pérdida final de entrenamiento observada fue de aproximadamente 1,2940. No se documenta uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de texto y código en inglés, heredada del modelo base Qwen2.5-Coder-3B-Instruct.
- Comportamiento agéntico multi-paso orientado al ciclo inspeccionar, razonar, editar y probar.
- Uso dentro de bucles con herramientas: lectura y escritura de ficheros, ejecución de Python y realimentación iterativa a partir de las salidas de las herramientas.
- Depuración iterativa: el autor documenta una ejecución del prototipo agent_v2 en la que el modelo ejecuta tests fallidos, detecta el fallo, reescribe el código, vuelve a ejecutar los tests y se detiene tras el éxito.
- Razonamiento paso a paso sobre errores de código y propuesta de correcciones (el ejemplo de la model card pide explicar la depuración de un `pop()` sobre una pila vacía).
- Soporte de tool calling: no se documenta de forma explícita un formato de function calling nativo; el uso de herramientas se realiza mediante un bucle controlador externo.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Agente de corrección de tests en CI: el adaptador se integra en un bucle que ejecuta la suite de pruebas, recibe la salida del fallo, propone un parche y vuelve a ejecutar los tests hasta que pasan, aprovechando el comportamiento inspect-edit-test para el que fue entrenado.
- Asistente de depuración interactivo en el IDE: el modelo recibe fragmentos de código y trazas de error y genera hipótesis de fallo y parches candidatos, con un controlador que aplica los cambios y valida con el intérprete de Python.
- Automatización de tareas de refactorización acotadas: dado un repositorio pequeño y una tarea concreta, el agente lee los ficheros relevantes, edita y comprueba que los tests siguen pasando, adecuado por su tamaño reducido y su coste de inferencia bajo.
- Núcleo de razonamiento en un agente de bajo coste: al ser un adaptador sobre un modelo de 3B cuantizable a 4 bits, puede desplegarse en una única GPU consumer o en Colab para prototipos de agentes de código sin infraestructura dedicada.
- Generación de parches en pipelines de revisión: combinado con herramientas de diff y ejecución de tests, el modelo puede proponer cambios sobre ficheros concretos y verificar el resultado antes de escalar a revisión humana.
- Educación y evaluación de flujos agénticos: sirve como referencia reproducible para estudiar cómo el ajuste fino con trayectorias SWE afecta al comportamiento multi-paso frente al modelo base, dado que el proyecto incluye un benchmark comparativo entre base, adaptador de código y adaptador agéntico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona que, en el benchmark de respuesta directa del proyecto, el modelo base original siguió siendo el más fuerte en conjunto, y que el valor de este adaptador se observa en flujos con herramientas y multi-paso. No se aportan cifras de MMLU, HumanEval, GSM8K ni de evaluaciones SWE-Bench.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 3B en 4 bits NF4 ocupa aproximadamente 2-2,5 GB de pesos; con overhead de activaciones y contexto, se estiman entre 4 y 6 GB para secuencias moderadas. En fp16 el base requiere unos 6 GB solo para pesos, más overhead.
- GPU recomendadas: cualquier GPU con 8 GB o más para la configuración cuantizada a 4 bits; A100 o H100 no son necesarias para este tamaño, aunque pueden usarse para mayor throughput.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; también en Tesla T4 de 16 GB, el hardware usado en el entrenamiento.
- Opciones de despliegue: transformers con peft y bitsandbytes (el método documentado en la model card), vLLM tras fusionar el adaptador en el base, llama.cpp u Ollama únicamente si se fusiona y convierte a GGUF, y TGI con soporte de adaptadores PEFT.
- Latencia y throughput: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-coder-3b-agent-v1 (este) | ~3B + LoRA | 32.768 (base); 1024 en entrenamiento | Agente de código multi-paso | Apache 2.0 | Adaptador PEFT en Hugging Face |
| Qwen2.5-Coder-3B-Instruct | ~3B | 32.768 | Código generalista e instrucciones | Apache 2.0 | Modelo completo en Hugging Face |
| M-Alkassem/qwen2.5-coder-3b-unsloth-lora | ~3B + LoRA | 32.768 (base) | Ajuste fino orientado a código | Apache 2.0 | Adaptador PEFT en Hugging Face |
| Modelos de código de 7B (familia Qwen2.5-Coder-7B) | ~7B | 32.768 | Código generalista | Apache 2.0 | Modelo completo en Hugging Face |

La comparación directa de rendimiento entre estas alternativas no está disponible en la información proporcionada; el autor solo indica que el base supera al adaptador en respuesta directa y que el adaptador rinde mejor en modo agéntico.

## Limitaciones y advertencias

- No es un modelo autónomo: es un adaptador LoRA que debe cargarse sobre Qwen2.5-Coder-3B-Instruct; no puede usarse solo.
- En respuesta directa de código, el modelo base Qwen2.5-Coder-3B-Instruct sigue siendo superior según la evaluación del propio autor; no debe presentarse como mejora universal.
- El entrenamiento usó solo 700 filas y 150 pasos con secuencias de 1024 tokens, lo que limita la cobertura de trayectorias largas y de repositorios grandes.
- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- Riesgo de alucinación heredado del base de 3B, especialmente en razonamiento de código complejo y en la invención de APIs o firmas de funciones.
- El adaptador está pensado para un bucle controlador con herramientas; sin ese controlador y sin realimentación de ejecución, su ventaja se diluye.
- No se documentan evaluaciones de sesgo ni de seguridad; se aplican los sesgos del dataset de trayectorias SWE y del corpus de preentrenamiento de Qwen2.5-Coder.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base y del dataset de entrenamiento.
- El modelo fue creado y actualizado en fechas posteriores a la publicación de la información de referencia; conviene verificar la vigencia del repositorio antes de usarlo en producción.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/M-Alkassem/qwen2.5-coder-3b-agent-v1
- Adaptador de código previo: https://huggingface.co/M-Alkassem/qwen2.5-coder-3b-unsloth-lora
- Modelo base Qwen2.5-Coder-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Base cuantizado Unsloth: https://huggingface.co/unsloth/Qwen2.5-Coder-3B-Instruct-bnb-4bit
- Dataset de trayectorias SWE: https://huggingface.co/datasets/ernie-research/MEnvData-SWE-Trajectory
- Informe técnico de Qwen2.5-Coder: https://arxiv.org/abs/2409.12186
