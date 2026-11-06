# ortexvortex/Qwen3.5-4B-fnvdecomp-r1

## Resumen

Qwen3.5-4B-fnvdecomp-r1 es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario ortexvortex para una tarea muy concreta: la descompilación exacta (matching decompilation) de funciones x86 de Fallout: New Vegas (PC, 1.4.0.525), compilado originalmente con Microsoft Visual C++ 2008 SP1. El objetivo del modelo es, dada la representación en ensamblador de una función y el esqueleto del fichero fuente al que pertenece, generar código C++ que el compilador MSVC 2008 produzca byte a byte idéntico al binario original. Es, por tanto, una herramienta de nicho para el proyecto fnvdecomp, no un modelo de propósito general.

El modelo se distribuye como adaptador PEFT (LoRA) sobre el modelo base, además de una versión fusionada en formato GGUF Q8_0 para su uso con llama.cpp. Cuenta con 4.205.751.296 parámetros totales según los pesos safetensors y un tamaño de repositorio de 5,0 GB. La licencia es Apache 2.0, heredada del modelo base. No se especifican los idiomas soportados en la información disponible, aunque al tratarse de un derivado de Qwen3.5-4B cabe esperar capacidades multilingües generales, si bien el ajuste está orientado a la generación de código C++ y a la terminología técnica del proyecto.

La relevancia del modelo radica en su enfoque: demuestra que un ajuste fino pequeño y especializado puede multiplicar el rendimiento de un modelo base en una tarea de verificación binaria estricta, pasando de un 0,4 % a un 18,5 % de coincidencias exactas en modo greedy sobre un conjunto de prueba de 249 funciones no vistas. No obstante, el propio autor advierte que su utilidad práctica se limita a funciones pequeñas y con patrones claros, y que en funciones de 64 bytes o más el rendimiento cae drásticamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3.5-4B) con adaptador LoRA (PEFT) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el ejemplo de despliegue usa `-c 16384` en llama.cpp) |
| Tipos de cuantizacion | GGUF Q8_0 (versión fusionada publicada); el adaptador LoRA se distribuye en safetensors |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) y GGUF (modelo fusionado Q8_0) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer decoder-only de 4,2 mil millones de parámetros, sobre el que se aplica un ajuste fino mediante LoRA (Low-Rank Adaptation) utilizando la librería PEFT. El adaptador se distribuye en `adapter_model.safetensors` junto con `adapter_config.json`, y también se ofrece una versión fusionada en GGUF Q8_0 para su uso directo con llama.cpp. No se detalla en la información disponible la composición exacta del dataset de entrenamiento, el número de tokens utilizados ni si se emplearon técnicas de RLHF o DPO; únicamente se indica que el conjunto de prueba se agrupó por fichero fuente para evitar fugas de información y que se seleccionaron checkpoints sobre un conjunto de desarrollo separado.

La innovación principal no reside en la arquitectura, sino en el enfoque de la tarea y en el método de evaluación: cada candidato generado se compila con el compilador real MSVC 2008 SP1 y se compara byte a byte con la función original mediante la herramienta `fnvcheck`. El entrenamiento se realizó con un formato de prompt muy específico (plantilla de chat de Qwen con `enable_thinking=False`), un mensaje de sistema que define las reglas de la descompilación exacta y un mensaje de usuario que incluye el listado en ensamblador de la función, sus flags de compilación y el esqueleto del fichero fuente. Se recomienda decodificación greedy y descartar completaciones que entren en bucles de repetición.

## Capacidades

- Generación de código C++ a partir de listados de ensamblador x86, orientada a la descompilación exacta para MSVC 2008 SP1.
- Razonamiento sobre código máquina y correspondencia con construcciones de C++ (tipos, campos, llamadas a funciones).
- Generación de código legible y real, sin ensamblador en línea, funciones naked ni bytes crudos, según las reglas del proyecto.
- Uso de nombres de símbolos y declaraciones presentes en el esqueleto del fichero fuente proporcionado.
- Capacidad de generar código que compile correctamente en un 51,8 % de los casos en modo greedy (frente al 10,0 % del modelo base).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada; el ajuste está orientado a código y terminología técnica en inglés.
- Modo thinking: el modelo debe usarse con `enable_thinking=False`; no se documenta un modo de razonamiento extendido para esta tarea.

## Casos de uso

- Descompilación exacta de funciones pequeñas en fnvdecomp: el modelo puede generar candidatos C++ para funciones de menos de 16 bytes con un 68,2 % de coincidencias exactas en modo greedy, lo que lo hace útil como primer paso en la reconstrucción del código fuente del proyecto.
- Asistencia a contribuyentes del proyecto fnvdecomp: integrado en el flujo de trabajo con `fnvcheck`, el modelo puede proponer candidatos que luego se verifican automáticamente, reduciendo el esfuerzo manual en funciones con patrones repetitivos.
- Generación de borradores para funciones de 16 a 63 bytes: con un 24,6 % de coincidencias exactas, puede servir como punto de partida para que un humano revise y ajuste el código.
- Automatización de la cola de funciones pendientes: aunque el autor reporta que en la cola abierta del proyecto (121 funciones de 128-255 bytes) no produjo coincidencias, el modelo puede usarse para generar candidatos que los solucionadores de casi-aciertos (`--solve-slots`, `--permute`) intenten rescatar.
- Investigación sobre descompilación asistida por modelos de lenguaje: el modelo y su benchmark reproducible (249 funciones, verificación byte a byte) sirven como referencia para estudiar el rendimiento de LLMs en tareas de verificación binaria estricta.
- Evaluación de técnicas de ajuste fino LoRA en dominios muy especializados: el contraste entre el modelo base (0,4 % greedy) y el ajustado (18,5 %) es un caso de estudio sobre la eficacia del ajuste fino con pocos datos y evaluación rigurosa.
- Generación de código C++ compatible con MSVC 2008 en contextos legacy: para proyectos que mantienen código antiguo, el modelo puede ayudar a reconstruir funciones a partir de binarios, siempre con verificación humana y automática.

## Benchmarks y rendimiento

Conjunto de prueba: 249 funciones de ficheros fuente que no aparecen en el entrenamiento (división agrupada por fichero fuente). Verificación con `fnvcheck`: compilación con MSVC 2008 real y comparación byte a byte. Mismo prompt, mismo presupuesto de tokens y mismo runtime llama.cpp Q8_0 para ambos modelos; 1 completación greedy y 8 muestreadas (T = 0,7, top-p 0,95) por función.

| Métrica (249 funciones no vistas) | Base Qwen3.5-4B | Este modelo |
|---|---|---|
| Coincidencia exacta greedy | 0,4 % | 18,5 % |
| Coincidencia greedy excluyendo 20 funciones casi duplicadas del entrenamiento ("novel") | 0,0 % | 13,1 % |
| pass@1 (muestreado) | 0,4 % | 14,9 % |
| pass@4 (muestreado) | 1,3 % | 19,7 % |
| pass@8 (muestreado) | 2,4 % | 21,3 % |
| Resuelto por alguna de las 9 completaciones | 2,4 % | 22,5 % |
| La salida greedy compila | 10,0 % | 51,8 % |

Comparación pareada sobre las mismas 249 funciones: 46 resueltas solo por el ajuste fino, 1 solo por el modelo base (McNemar exacto p = 6,8e-13); diferencia en pass@1 muestreado de +14,6 puntos (IC bootstrap del 95 %: +10,7 a +18,6).

Coincidencia greedy por segmento (ajuste fino / base):

| Segmento | n | Este modelo | Base |
|---|---|---|---|
| Tamaño de función < 16 bytes | 44 | 68,2 % | 2,3 % |
| 16-63 bytes | 57 | 24,6 % | 0,0 % |
| 64-255 bytes | 131 | 1,5 % | 0,0 % |
| 256-1023 bytes | 12 | 0,0 % | 0,0 % |
| >= 1024 bytes | 5 | 0,0 % | 0,0 % |
| Compilado con `/Od` | 84 | 20,2 % | 1,2 % |
| Compilado con `/O2` | 165 | 17,6 % | 0,0 % |

Resumen honesto del autor: el modelo aprende bien funciones pequeñas y con patrones claros; rara vez resuelve funciones de 64 bytes o más. En una ejecución en vivo contra la cola abierta del proyecto (121 funciones reclamadas, casi todas de 128-255 bytes, todas intentadas previamente por otros agentes) no produjo ninguna coincidencia. Los solucionadores de casi-aciertos de `fnvcheck` (`--solve-slots` y `--permute`) rescataron solo 3 de 705 casi-aciertos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 4,2 mil millones de parámetros. En Q8_0 (GGUF fusionado) ocupa aproximadamente 4,5-5 GB de pesos; en bf16 (adaptador sobre base) requiere alrededor de 8-9 GB. No se proporcionan cifras oficiales de VRAM en la información disponible.
- GPU recomendadas: el autor reporta una ejecución con Vulkan sobre una iGPU AMD Strix Halo alcanzando ~45 tok/s en un solo stream y ~350 tok/s con 32 peticiones en paralelo. No se especifican GPU dedicadas concretas (A100, H100, RTX 4090) en la información disponible.
- ¿Cabe en GPU de consumo? Sí, en Q8_0 cabe en GPUs de consumo con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4070) y en iGPU con memoria unificada; en bf16 requiere al menos 12 GB.
- Opciones de despliegue: llama.cpp (probado con `llama-server -m ... -ngl 99 -fa on -c 16384`), y Transformers + PEFT cargando el modelo causal de solo texto con `AutoModelForCausalLM` y `PeftModel`. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: ~45 tok/s en un solo stream y ~350 tok/s con 32 peticiones paralelas en iGPU AMD Strix Halo con Vulkan (dato del autor). No se proporcionan cifras para otras GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de descompilación exacta en la información proporcionada. La comparación más directa es con su propio modelo base:

| Modelo | Parámetros | Contexto | Coincidencia greedy (249 funciones) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-fnvdecomp-r1 | 4,2 B | No disponible | 18,5 % | Apache 2.0 | Hugging Face (adaptador LoRA + GGUF Q8_0) |
| Qwen3.5-4B (base) | 4,2 B | No disponible | 0,4 % | Apache 2.0 | Hugging Face |
| Otros modelos de descompilación | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Rendimiento muy limitado en funciones de 64 bytes o más: 1,5 % en el segmento de 64-255 bytes y 0 % en segmentos superiores. No es adecuado para descompilar funciones grandes o complejas.
- En la cola abierta real del proyecto (121 funciones de 128-255 bytes) no produjo ninguna coincidencia, lo que sugiere que su utilidad práctica en el flujo de trabajo diario es reducida.
- Riesgo de bucles de repetición: el autor advierte que si una completación alcanza el límite de tokens, ha entrado en un bucle de repetición y debe descartarse y volver a muestrear.
- Dependencia estricta del formato de prompt: debe usarse la plantilla de chat de Qwen con `enable_thinking=False` y el mensaje de sistema exacto; otros formatos empeoran el rendimiento.
- Requiere verificación obligatoria con `fnvcheck` antes de enviar cualquier candidato al proyecto; el modelo puede generar código que no compile o que no coincida byte a byte.
- El listado de ensamblador debe provenir de una copia legítima del juego; no se distribuye código del juego, código máquina ni desensamblado en el repositorio.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al ser un ajuste sobre Qwen3.5-4B, podría heredar sesgos del modelo base, aunque la tarea está acotada a código.
- Riesgo de alucinación: presente en la generación de código (nombres de símbolos, tipos o llamadas inexistentes), mitigado por la verificación automática con `fnvcheck`.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el uso del modelo con código del juego puede estar sujeto a las condiciones legales del propietario de Fallout: New Vegas; el autor no distribuye material del juego.
- Idiomas: no se especifican; el ajuste está orientado a código y terminología técnica en inglés, por lo que el rendimiento en otros idiomas no está garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ortexvortex/Qwen3.5-4B-fnvdecomp-r1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Proyecto fnvdecomp: https://fnvdecomp.com
- Otros enlaces (papers, blogs, repos, demos): no disponibles en la información proporcionada.
