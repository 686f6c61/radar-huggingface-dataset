# prada5023/countdown-rl-qwen3-4b-v2-zeroshot-s2-cont

## Resumen

`countdown-rl-qwen3-4b-v2-zeroshot-s2-cont` es un adaptador LoRA (r = 16, alpha = 32) publicado por el usuario prada5023 sobre el modelo base Qwen/Qwen3-4B-Base. No se trata de un modelo completo, sino de un ajuste fino orientado a una tarea concreta: el juego de numeros Countdown, en el que el modelo debe alcanzar un objetivo numerico combinando una lista de operandos con operaciones aritmeticas. El adaptador se entrena con GRPO (Group Relative Policy Optimization), una variante de aprendizaje por refuerzo, e incorpora un bucle de herramienta Python: la politica puede emitir codigo, recibir su salida estandar y continuar el razonamiento antes de dar una respuesta final.

La relevancia de esta publicacion es metodologica mas que de producto. Ilustra un patron de entrenamiento con RL y uso de herramientas (tool use) sobre un modelo pequeno de 4.000 millones de parametros, con un formato de trazas explicito (`<think>`, `<python>`, `<output>`, `<answer>`) y una evaluacion especifica sobre un conjunto holdout de 1.000 problemas. El autor reporta un 70,5 % de pass@1 en ese holdout en modo greedy, con desglose por dificultad (facil 89,0 %, medio 57,7 %, dificil 58,7 %).

El adaptador es muy ligero (el repositorio ocupa aproximadamente 0,1 GB) y se distribuye bajo licencia Apache 2.0. Esta pensado para evaluarse con el mismo prompt con el que se entreno (`r1zero_tool`), ya que, segun el autor, las politicas obtenidas son especificas del prompt. No hay informacion publicada sobre idiomas soportados ni sobre rendimiento en tareas generales fuera de Countdown.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r = 16, alpha = 32) sobre transformer decoder-only Qwen3-4B-Base |
| Parametros totales | 4.000 millones (modelo base); el adaptador LoRA anade un subconjunto no especificado |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-4B-Base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3-4B-Base, un transformer decoder-only de 4.000 millones de parametros. El ajuste se realiza mediante LoRA con rango 16 y alpha 32, lo que mantiene un coste de almacenamiento muy reducido (0,1 GB en el repositorio) y permite cargarlo junto al modelo base sin modificar sus pesos originales. El entrenamiento usa GRPO, un algoritmo de optimizacion de politica por refuerzo que estima ventajas relativas dentro de grupos de muestras, sin necesidad de un modelo critico separado.

La innovacion principal es la integracion de una herramienta Python en el bucle de RL. La politica genera una traza estructurada: escribe su razonamiento en `<think>`, puede ejecutar codigo en `<python>` cuyo stdout se devuelve en `<output>`, y finalmente responde en `<answer>`. El autor indica que se uso la receta v2, prompt zero-shot, semilla 2 y 45 pasos adicionales de entrenamiento. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO adicionales. El codigo, las configuraciones y los registros se encuentran en el repositorio acompanante del autor (`configs/experiments/qwen3-4b-v2-zeroshot-s2-cont/`, REPORT.md, EXPERIMENTS.md).

## Capacidades

- Razonamiento aritmetico con busqueda combinatoria: resuelve problemas del juego Countdown combinando operandos para alcanzar un objetivo.
- Uso de herramienta Python en el bucle: emite codigo, recibe la salida estandar y la incorpora al razonamiento.
- Trazas de razonamiento explicitas mediante etiquetas `<think>`, `<python>`, `<output>` y `<answer>`.
- Razonamiento multi-paso con hasta dos rondas de codigo configuradas en la evaluacion.
- Generacion de codigo Python acotada al contexto de resolucion de problemas numericos.
- Capacidades generales del modelo base Qwen3-4B-Base (generacion de texto, codigo, matematicas) potencialmente preservadas, aunque no evaluadas en esta publicacion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling generico (function calling estructurado fuera del formato `<python>`): no disponible.

## Casos de uso

- Evaluacion de recetas de RL con herramientas: el adaptador sirve como referencia reproducible para comparar GRPO con y sin ejecucion de codigo en tareas de razonamiento, usando el prompt `r1zero_tool` y el conjunto holdout3.
- Investigacion en razonamiento aritmetico: permite estudiar como un modelo de 4.000 millones de parametros distribuye su precision entre problemas faciles, medios y dificiles (89,0 %, 57,7 % y 58,7 % respectivamente).
- Generacion de trazas interpretables: el formato etiquetado facilita el analisis de cadenas de razonamiento y de la interaccion con la herramienta en pipelines de investigacion.
- Prototipado de agentes con sandbox de codigo: el patron `<python>`/`<output>` puede adaptarse a entornos controlados donde el modelo propone y ejecuta calculos verificables.
- Benchmarking de adaptadores LoRA pequenos: con 0,1 GB de pesos, es util para probar infraestructuras de despliegue PEFT sobre Qwen3-4B-Base en entornos con recursos limitados.
- Docencia y divulgacion: ejemplo compacto y documentado de entrenamiento con GRPO, recompensas verificables y uso de herramientas, con codigo y configuraciones publicados en el repositorio del autor.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| holdout3, pass@1 (greedy, 768 tokens, dos rondas de codigo) | 70,5 % |
| holdout3, dificultad facil | 89,0 % |
| holdout3, dificultad media | 57,7 % |
| holdout3, dificultad dificil | 58,7 % |

El holdout3 comprende 1.000 problemas generados despues de todas las decisiones del modelo, segun el autor. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros adaptadores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; para un modelo de 4.000 millones de parametros en precision completa se requiere aproximadamente 8 GB solo para pesos, y en cuantizacion de 4 bits puede reducirse a unos 2-3 GB, aunque estos calculos no los proporciona la informacion.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por tamano del modelo base, es plausible en GPUs con 8 GB o mas de VRAM, pero no hay dato oficial.
- Opciones de despliegue: el autor documenta la evaluacion mediante `uv run countdown-eval` con los parametros `--model Qwen/Qwen3-4B-Base --adapter ... --prompt-style r1zero_tool --max-new-tokens 768 --max-rounds 2 --attn sdpa_gqa`. El adaptador es compatible con PEFT; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de otros adaptadores o modelos comparables en la tarea Countdown, ni datos de modelos de razonamiento de tamano similar que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Especificidad del prompt: el autor advierte que las politicas son especificas del prompt y que la evaluacion debe realizarse con `r1zero_tool`; usar otro formato puede degradar el rendimiento de forma significativa.
- Dominio acotado: el adaptador esta entrenado para el juego Countdown y no hay evidencia publicada de su rendimiento en tareas generales de lenguaje, codigo o matematicas fuera de ese dominio.
- Riesgo de alucinacion: no evaluado en la informacion disponible; el modelo base Qwen3-4B-Base puede generar contenido incorrecto o inventado fuera de su distribucion de entrenamiento.
- Sesgos conocidos: no documentados por el autor.
- Idiomas: no disponibles; no se especifica que idiomas soporta el adaptador ni si el entrenamiento fue monolingue.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe respetarse la licencia del modelo base Qwen/Qwen3-4B-Base, que el usuario debe verificar por separado.
- Dependencia del modelo base: el adaptador no es autonomo; requiere descargar y cargar Qwen/Qwen3-4B-Base junto con PEFT.
- Madurez: repositorio con cero descargas y cero likes en el momento de la consulta, creado y actualizado el 10 de noviembre de 2026; no hay validacion externa de los resultados reportados.
- Ejecucion de codigo: el bucle `<python>` implica ejecutar codigo generado por el modelo; en produccion debe aislarse en un sandbox con limites de recursos y sin acceso a red ni al sistema de archivos.

## Enlaces

- Hugging Face: https://huggingface.co/prada5023/countdown-rl-qwen3-4b-v2-zeroshot-s2-cont
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Repositorio de entrenamiento y evaluacion: referenciado por el autor como repositorio acompanante (`configs/experiments/qwen3-4b-v2-zeroshot-s2-cont/`, REPORT.md, EXPERIMENTS.md); URL no disponible en la informacion proporcionada.
- Paper o blog adicional: no disponible.
