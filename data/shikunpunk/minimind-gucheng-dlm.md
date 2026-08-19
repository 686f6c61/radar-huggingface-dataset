# shikunpunk/MiniMind-GuCheng-dLM

## Resumen

MiniMind-GuCheng-dLM es una variante de modelo de difusión de lenguaje (dLM) desarrollada por shikunpunk como parte del proyecto MiniMind-GuCheng, cuyo objetivo es generar poesía en el estilo del poeta chino Gu Cheng. El modelo parte de la arquitectura MiniMind (104M parámetros entrenables, hidden_size=768, 8 capas) y emplea atención bidireccional combinada con un mecanismo de difusión de lenguaje (MDM, Masked Diffusion Model). Se entrena mediante transferencia A2D (de autorerregresivo a difusión) sobre un corpus exclusivamente compuesto por obras reales de Gu Cheng (7481 muestras de preentrenamiento y 213 de ajuste fino por instrucciones), sin incluir texto generado por IA.

La relevancia de este modelo radica en su carácter de estudio comparativo: junto con las variantes AR (autorerregresiva) y Linear (atención lineal), permite evaluar cómo distintas arquitecturas convergen bajo los mismos datos y presupuesto computacional. Sin embargo, el propio autor señala que la variante dLM presenta una convergencia limitada en datasets pequeños, produciendo salidas demasiado cortas o repetitivas. El repositorio incluye código, pesos y tokenizer autocontenidos, lo que facilita su reproducción y experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion de lenguaje (dLM) con atencion bidireccional + MDM, basada en MiniMind (8 capas, hidden_size=768) |
| Parametros totales | No disponible (el autor indica 104M parametros entrenables) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Chino (principalmente, generacion de poesia) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (formato de archivo no especificado, probablemente .bin) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de difusion de lenguaje (dLM) sobre la base de MiniMind, un diseño minimalista de transformer con 104M parametros entrenables, 8 capas y hidden_size de 768. A diferencia del modelo autorerregresivo clasico, esta variante utiliza atencion bidireccional y un mecanismo de difusion (MDM) que genera texto mediante un proceso iterativo de denoising, en lugar de predecir token a token. El entrenamiento se realiza en dos fases: primero un preentrenamiento sobre 7481 muestras de obras reales de Gu Cheng (poesia, prosa, aforismos y fragmentos de novelas extraidos de 5 PDFs mediante OCR), y posteriormente un ajuste fino con 213 muestras de instrucciones para tareas de continuacion y emulacion de estilo. La transferencia se hace desde un modelo AR preentrenado (estrategia A2D), lo que deberia facilitar la convergencia, aunque el autor reporta que en datos pequenos el modelo no llega a converger adecuadamente, produciendo salidas cortas o repetitivas.

## Capacidades

- Generacion de poesia en chino en el estilo de Gu Cheng, a partir de instrucciones o continuacion de texto.
- Soporte de modo chat y modo raw (continuacion directa) mediante scripts incluidos en el repositorio.
- Capacidad de iterar sobre el proceso de denoising para refinar la salida, aunque con limitaciones practicas por la falta de convergencia.
- No dispone de tool calling, soporte para agentes, razonamiento multi-paso, ni capacidades multimodales.
- Multilingue: no, esta limitado al chino (el corpus y las instrucciones son exclusivamente en chino).

## Casos de uso

- Investigacion academica en arquitecturas de difusion para lenguaje: el modelo sirve como punto de comparacion para estudiar como los modelos de difusion se comportan con datasets muy pequenos y dominios especificos como la poesia.
- Experimentacion en transferencia de modelos AR a dLM: el repositorio documenta el proceso A2D y permite reproducir el entrenamiento para analizar la viabilidad de esta estrategia.
- Generacion creativa de poesia china experimental: aunque con calidad limitada, puede usarse para producir borradores o ideas poeticas que luego un humano refine.
- Ensenanza de tecnicas de entrenamiento de LLMs: al ser un proyecto autocontenido y de tamano reducido, es util como ejemplo didactico para ilustrar diferencias entre arquitecturas (AR vs difusion vs lineal) bajo las mismas condiciones.
- Comparacion de metodos de entrenamiento: el proyecto incluye un documento (TRAINING_COMPARISON.md) que detalla diferencias en datos, coste y calidad entre Pretrain, SFT, dLM y Linear, util para decisiones de diseno en proyectos similares.
- Prototipado de generadores de poesia con presupuesto minimo: el modelo cabe en hardware modesto y puede integrarse en demos o aplicaciones de bajo coste, aunque no se recomienda para produccion por su calidad inconsistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo proporciona ejemplos cualitativos de generacion, donde el modelo dLM produce salidas demasiado cortas (una o dos palabras) o frases repetitivas, indicando una convergencia deficiente en el corpus pequeno. No hay datos de metricas como perplejidad, BLEU o evaluaciones humanas.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en FP32 (modelo de ~131 MB), por lo que cabe en cualquier GPU consumer moderna (incluso en CPU).
- GPUs recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti o superior). Una RTX 3060 o similar es mas que suficiente.
- Compatible con CPU: el modelo es tan pequeno que puede ejecutarse en CPU con tiempos de respuesta aceptables para generacion de poesia.
- Opciones de despliegue: los scripts Python incluidos en el repositorio (gen_gucheng_dllm.py) son la via principal. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, aunque al ser un modelo PyTorch podria adaptarse.
- Latencia y throughput: no se proporcionan datos, pero dado el tamano y la naturaleza iterativa del denoising, se espera una latencia de pocos segundos en GPU consumer para una generacion corta.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| MiniMind-GuCheng-AR | Autorerregresivo (Softmax Attention) | 104M | No disponible | Mejor calidad, imagenes completas | No disponible |
| MiniMind-GuCheng-dLM | Difusion de lenguaje (bidireccional + MDM) | 104M | No disponible | Salidas cortas o repetitivas | No disponible |
| MiniMind-GuCheng-Linear | Lineal (Gated DeltaNet) | 104M | No disponible | Salidas con errores y repeticiones | No disponible |

Los tres modelos comparten la misma base MiniMind y el mismo corpus, diferenciandose solo en la arquitectura de atencion y el metodo de entrenamiento. El autor recomienda la variante AR como la unica viable para generacion realista. No se dispone de comparaciones con otros modelos de poesia china externos.

## Limitaciones y advertencias

- Convergencia deficiente: el modelo dLM no converge adecuadamente en datasets pequenos, produciendo salidas demasiado cortas o con repeticiones, lo que limita su utilidad practica.
- Sesgos y dominio: entrenado exclusivamente con obras de Gu Cheng, el modelo solo genera en ese estilo y no generaliza a otros autores o registros.
- Riesgo de alucinacion: al ser un modelo de difusion con entrenamiento limitado, puede generar texto sin sentido o fragmentos no relacionados con la instruccion.
- Licencia no especificada: no se indica licencia alguna, por lo que el uso comercial o la redistribucion estan sujetos a incertidumbre legal.
- Idioma: solo chino; no soporta otros idiomas.
- Sin benchmarks formales: no hay metricas objetivas de calidad, solo ejemplos cualitativos.
- Formato de pesos no estandar: los pesos estan en formato PyTorch, sin cuantizaciones precalculadas, lo que requiere conversion para su uso en otros entornos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shikunpunk/MiniMind-GuCheng-dLM
- Repositorio MiniMind (base del proyecto): https://github.com/jingyaogong/minimind
- Perfil del autor en HuggingFace: https://huggingface.co/shikunpunk
