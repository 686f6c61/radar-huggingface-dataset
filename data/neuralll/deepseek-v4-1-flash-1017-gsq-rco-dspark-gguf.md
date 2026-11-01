# neuralll/DeepSeek-V4.1-Flash-1017-GSQ-RCO-DSPARK-GGUF

## Resumen

Este repositorio no es un modelo nuevo, sino una cuantización lista para usar del modelo **DeepSeek-V4.1-Flash-1017** de DeepSeek, publicada por el usuario **neuralll** en Hugging Face. Concretamente, contiene la cuantización **GSQ-RCO IQ2_XXS** (2,00 bits por peso, 248,8 GB) realizada por el laboratorio ISTA-DASLab, con las cabeceras, nombres de tensores y disposición de archivos modificados para que **llama.cpp pueda cargarla directamente**, ya que los archivos originales estaban preparados para el motor Strata. El modelo base es un MoE de 748.494 millones de parámetros totales (748,49 B).

Además del modelo cuantizado, el repositorio incluye el **DSpark draft** de Lucebox, un modelo borrador para decodificación especulativa compatible con un fork de llama.cpp del propio autor. Según las mediciones del autor, este conjunto permite pasar de unos 1,5 tokens/s con llama.cpp oficial a entre 18 y 29 tokens/s con el fork, que mantiene los expertos en RAM y usa la VRAM libre como caché de expertos en vivo. Es relevante porque hace ejecutable en hardware "de consumidor avanzado" (2x RTX 3090 y 128 GB de RAM) un modelo de casi 750 B de parámetros con pérdida de calidad prácticamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (DeepSeek-V4.1-Flash), con componente "Engram" (tensores auxiliares de token embedding por capa) |
| Parametros totales | 748.494.628.464 (≈748,49 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS (GSQ-RCO, 2,00 bits por peso, 248,8 GB); draft DSpark en Q2_K / Q4_K; tabla Engram en IQ4_NL |
| Idiomas soportados | no disponible |
| Licencia | MIT (la de esta cuantización; la del modelo base no se indica en la ficha) |
| Formato de pesos | GGUF (5 shards, 253,8 GB en total) |

## Arquitectura y entrenamiento

El modelo base, DeepSeek-V4.1-Flash-1017, es una arquitectura **mixture-of-experts** de 748,49 B de parámetros totales. La ficha no detalla el número de expertos, parámetros activos ni el proceso de entrenamiento del modelo original. Un elemento técnico destacable de esta implementación es el componente **"Engram"**: tensores auxiliares (mapa de tokens, primos, offsets, multiplicadores y tablas de embedding por capa) que en esta reempaquetización se han movido a claves de metadatos y cuyos tensores de puerta (gate) se calculan como el producto de los pesos q y k de Engram, eliminando estos últimos del shard 4.

La cuantización **GSQ-RCO IQ2_XXS** proviene de IST Austria / DASLab y se apoya en dos papers: GSQ (arXiv:2604.18556) y RCO (arXiv:2605.00649). Según la evaluación de ISTA-DASLab, esta cuantización a 2 bits conserva el **100,0 % de la media de tareas del modelo base** (AIME25, GPQA-Diamond, LiveCodeBench v6). La verificación independiente del autor de este repo, mediante perplejidad sobre 10 fragmentos, coincide con la de llama.cpp oficial sobre los mismos archivos (-0,02 % ± 0,13 %). No hay información sobre datos de entrenamiento, número de tokens ni RLHF/DPO.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Modelo base de gran escala tipo MoE, orientado a tareas generales de lenguaje; las capacidades detalladas (código, matemáticas, razonamiento) se infieren de los benchmarks usados para evaluarlo (AIME25, GPQA-Diamond, LiveCodeBench v6), pero no se describen explícitamente.
- Compatible con **decodificación especulativa** mediante el DSpark draft incluido (arquitectura `dflash`, capas objetivo 37-39, tamaño de bloque 5, flag de hiperconexión de paso único).
- Soporte de tool calling / function calling: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, thinking mode): no disponibles en la información proporcionada.

## Casos de uso

- **Inferencia local de un MoE gigante en estaciones de trabajo: con 2x RTX 3090 (48 GB de VRAM total), 128 GB de RAM y SSD, el fork de llama.cpp ejecuta el modelo completo a 18-29 tokens/s, algo inviable con el llama.cpp oficial (1,5 tokens/s).**
- **Chatbots y asistentes locales con privacidad total: al correr 100 % en local con llama-server, no se envían datos a terceros, adecuado para entornos con requisitos de confidencialidad.**
- **Experimentación con cuantización extrema: el formato IQ2_XXS con GSQ-RCO conserva el 100 % de la media de tareas del modelo base según ISTA-DASLab, lo que lo convierte en un banco de pruebas ideal para investigar cuantización a 2 bits en modelos MoE.**
- **Investigación en decodificación especulativa: el DSpark draft permite medir ganancias reales (+8-10 % en decodificación) y estudiar el efecto de la profundidad del draft (depth 1 es el más consistente; depth 2 puede ser más lento que no usar draft).**
- **Procesamiento de prompts largos en local: el fork alcanza 307 tokens/s de procesamiento de prompt con un prompt de 16k tokens, útil para resumir o analizar documentos extensos sin API de pago.**
- **Servidores de inferencia personales de bajo coste operativo: la licencia MIT de la cuantización y el uso de llama.cpp permiten desplegar un servicio propio sin coste de licencias ni de API, por ejemplo tras un proxy con cola de peticiones (`-np 1`, una petición a la vez en las mediciones).**
- **Integración en pipelines de evaluación de modelos: el formato GGUF estándar y llama-server (API compatible con OpenAI en llama.cpp) facilitan automatizar pruebas de generación en hardware propio.**

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo base en la información disponible más allá de la referencia de ISTA-DASLab: según su evaluación, la cuantización IQ2_XXS **conserva el 100,0 % de la media de tareas del modelo base** en AIME25, GPQA-Diamond y LiveCodeBench v6 (números concretos no incluidos en esta ficha; ver la tarjeta de ISTA-DASLab). La verificación de perplejidad del autor de este repo: -0,02 % ± 0,13 % respecto a llama.cpp oficial sobre los mismos archivos.

Rendimiento medido por el autor (AMD Ryzen 7 3700X, 128 GB RAM, 2x RTX 3090, temperatura 0, respuestas de 1024 tokens):

| Test | Stock llama.cpp (t/s decode) | Fork (t/s decode) | Ganancia petición |
|---|---|---|---|
| Prompt de 27 tokens, 987 tokens de respuesta | 1,47 | 29,11 | 19,3x |
| Prompt de ~1k tokens, 1k de respuesta | 1,46 | 25,73 | 12,9x |
| Prompt de ~16k tokens, 1k de respuesta | 1,47 | 18,16 | 9,7x |

Con DSpark draft (fork, depth 1): 31,29 t/s en respuestas de 1k (+10 %) y 27,26 t/s en respuestas de 4k (+8 %). Respuestas muy cortas (256 tokens) no ganan.

## Requisitos de hardware

- **VRAM estimada:** el modelo completo ocupa 248,8 GB (IQ2_XXS) más 110,6 GB de tabla Engram en IQ4_NL; no cabe íntegramente en VRAM. La estrategia del fork es mantener los expertos en RAM y usar la VRAM libre como caché de expertos en vivo (hasta 101 GiB del modelo fijados en RAM en las pruebas).
- **RAM:** 128 GB de RAM en la máquina de prueba (el modelo es aproximadamente el doble de la RAM, por lo que parte se lee del SSD).
- **GPU de referencia en las mediciones:** 2x RTX 3090 de 24 GB (PCIe x16 y x4). No se especifican A100/H100.
- **Consumer GPU:** sí, funciona en 2x RTX 3090 con el fork; con llama.cpp oficial es funcional pero muy lento (~1,5 tokens/s).
- **Despliegue:** llama.cpp (fork de neuralll, release posterior a b14020, obligatorio; b14020 responde con texto vacío sin `-c` y no incluye las correcciones de DSpark). Comando: `llama-server -m DeepSeek-V4.1-Flash-1017-GSQ-RCO-IQ2_XXS-00001-of-00005.gguf -np 1`. Ollama, vLLM y TGI: no disponibles para este formato modificado.
- **Latencia/throughput:** decodificación de 18-29 tokens/s con el fork (según longitud de prompt), 1,5 tokens/s con llama.cpp oficial; procesamiento de prompt de hasta 307 tokens/s (prompt de 16k) con el fork.

## Comparativa con modelos similares

| Aspecto | Este repo (IQ2_XXS GGUF) | Cuantización original ISTA-DASLab | Modelo base DeepSeek-V4.1-Flash-1017 |
|---|---|---|---|
| Formato | GGUF para llama.cpp (reempaquetado) | GGUF para motor Strata | Pesos originales (safetensors) |
| Parametros totales | 748,49 B (cuantizado a 2,00 bits/peso) | 748,49 B (cuantizado a 2,00 bits/peso) | 748,49 B |
| Tamano | 253,8 GB (5 shards + draft de 4,9 GB) | ~248,8 GB (sin reempaquetar) | no disponible |
| Compatibilidad | llama.cpp stock (lento) y fork de neuralll (rápido) | Strata (no carga en llama.cpp) | Frameworks completos de inferencia |
| Licencia | MIT | no disponible en la ficha | no disponible en la ficha |
| Decodificación especulativa | Sí (DSpark draft incluido, +8-10 %) | No incluida | no disponible |

No se conocen alternativas comparables de otros autores para este mismo modelo en la información proporcionada.

## Limitaciones y advertencias

- **No es el modelo original:** es una reempaquetización de una cuantización de terceros; los pesos son obra de DeepSeek, ISTA-DASLab y Lucebox, y este repo solo cambia cabeceras, nombres de tensores y disposición de archivos.
- **Requiere el fork de llama.cpp para rendimiento razonable:** con llama.cpp oficial funciona pero a ~1,5 tokens/s, impracticable en producción. Además, hay que usar una release posterior a b14020.
- **Dependencia de hardware específico:** las ganancias de 9,7x-19x están medidas en una configuración concreta (Ryzen 7 3700X, 128 GB RAM, 2x RTX 3090); en otras configuraciones los resultados pueden diferir.
- **Decodificación especulativa inconsistente:** DSpark solo aporta +8-10 % con depth 1; depth 2 puede ser más lento que no usar draft y las respuestas cortas no ganan nada.
- **Cuantización a 2 bits:** aunque ISTA-DASLab reporta conservar el 100 % de la media de tareas, una cuantización IQ2_XXS puede degradar casos de uso concretos; conviene validar en la tarea objetivo.
- **Sesgos, alucinaciones, contexto e idiomas:** no disponible en la información proporcionada.
- **Licencia:** esta cuantización es MIT, pero la licencia del modelo base DeepSeek-V4.1-Flash-1017 no se indica en la ficha; verifíquela antes de uso comercial.
- **Descargas muy bajas (303) y sin likes:** proyecto de comunidad sin historial de auditoría; no hay garantías de soporte a largo plazo.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/neuralll/DeepSeek-V4.1-Flash-1017-GSQ-RCO-DSPARK-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Cuantización original de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- DSpark draft de Lucebox: https://huggingface.co/Lucebox/DeepSeek-V4.1-Flash-DSpark-GGUF
- Fork de llama.cpp del autor: https://github.com/neurall/llama.cpp (releases: https://github.com/neurall/llama.cpp/releases)
- Motor Strata: https://github.com/Niko1221/Strata
- Paper GSQ: https://arxiv.org/abs/2604.18556 (código: https://github.com/IST-DASLab/GSQ)
- Paper RCO: https://arxiv.org/abs/2605.00649 (código: https://github.com/IST-DASLab/RCO)
