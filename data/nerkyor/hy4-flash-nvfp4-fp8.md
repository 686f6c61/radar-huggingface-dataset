# nerkyor/Hy4-Flash-NVFP4-FP8

## Resumen
Hy4-Flash-NVFP4-FP8 es una conversión de precisión mixta (NVFP4 para expertos MoE, FP8 para el tronco y FP16 para la caché KV) del modelo base tencent/Hy4-flash, publicada por el usuario nerkyor. No se trata de un modelo entrenado desde cero, sino de un empaquetado de inferencia orientado a exprimir una única GPU NVIDIA RTX PRO 6000 Blackwell de 96 GB (arquitectura sm_120, 1.792 TB/s de GDDR7). El objetivo es ofrecer un despliegue de producción "listo para usar" con 41 capas de expertos MoE cuantizados a NVFP4 residentes por completo en VRAM, tronco en FP8 y una tabla de vectores Engram de aproximadamente 59 GiB que debe residir obligatoriamente en memoria (`/dev/shm`).

El interés técnico reside en la combinación de cuantización agresiva por capas con una gestión explícita de la memoria del host: el autor documenta que si la tabla Engram se sirve desde SSD mediante `mmap`, el rendimiento cae de 91–296 tok/s a 25–38 tok/s. El paquete incluye el motor de inferencia Basalt (versión fusionada P1+P5+P6, derivada de Basalt v0.5.7, licencia MIT), scripts de arranque con preflight de entorno y presets de concurrencia (C1 y C8) con y sin decodificación especulativa.

La relevancia actual es doble: por un lado demuestra una receta reproducible de cuantización NVFP4/FP8 para hardware Blackwell de consumo profesional; por otro, expone las tensiones reales de memoria (VRAM frente a `tmpfs`) al servir modelos MoE grandes con tablas de embedding/Engram de decenas de gigabytes. El repositorio ocupa 92,7 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (basado en tencent/Hy4-flash); tronco FP8, expertos NVFP4, caché KV FP16 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE; 41 capas de expertos) |
| Longitud de contexto | 73.728 tokens por ranura en C1; 589.824 tokens agregados en C8 (8 × 73.728) |
| Tipos de cuantizacion | NVFP4 (expertos MoE), FP8 (tronco), FP16 (KV cache) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada de tencent/Hy4-flash); motor Basalt v0.5.7 en MIT |
| Formato de pesos | formato propietario Basalt (`.basalt`) con segmentos de expertos NVFP4 y tronco FP8; no safetensors ni GGUF |

## Arquitectura y entrenamiento
El modelo es una conversión de pesos, no un entrenamiento nuevo. La arquitectura subyacente es un transformer con mezcla de expertos (MoE) del que se han reempaquetado 41 capas de expertos en NVFP4 para que residan íntegramente en los 96 GB de VRAM de la RTX PRO 6000 Blackwell, mientras el tronco principal se mantiene en FP8 y la caché KV en FP16 para preservar cadenas de razonamiento largas (hasta 72K tokens por ranura). El paquete incluye además una tabla de vectores Engram de aproximadamente 59 GiB, que el motor trata como memoria caliente obligatoria en `tmpfs`.

El motor Basalt implementa varias optimizaciones documentadas: atención batcheada (`HY4_BATCHED_ATTN`), concatenación de tronco (`HY4_TRUNK_CONCAT`), empaquetado inline FP8 (`HY4_FP8_INLINE_PACK`), prepack W4A16 (`HY4_W4A16_PREPACK`), lookup adaptativo (`HY4_ADAPTIVE_LOOKUP`), cola MLA (`HY4_MLA_TAIL`) y grafo de paso completo (`HY4_FULL_STEP_GRAPH`). Soporta decodificación especulativa (`--spec N`) con aceptación medida en torno al 49 %, y un presupuesto de residencia en VRAM (`--resident-budget-gib 2`) para los expertos. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo base.

## Capacidades
- Generación de texto y razonamiento de cadena larga: el modo `reasoning_effort: max` (con `xhigh` mapeado automáticamente) produce trazas de pensamiento de miles de tokens (P50 de 3.075 tokens en GPQA Diamond).
- Razonamiento científico y de nivel graduado: resultados medidos en GPQA Diamond (89,9 %) y MMLU-Pro (94,0 %).
- Generación de código: evaluado en LiveCodeBench con 88/100.
- Contexto largo: 72K tokens por ranura con caché KV FP16 y cero truncamientos en las pruebas reportadas.
- Servicio compatible con la API OpenAI (`/v1`) en `http://127.0.0.1:8080/v1`.
- Decodificación especulativa configurable (hasta `--spec 7`) para acelerar el modo single-stream.
- Concurrencia batch (C8) para evaluación y síntesis de datos.
- Visión: desactivada explícitamente en la configuración de producción (`--vision off`); no se documenta soporte operativo.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Multilingüismo: no disponible.

## Casos de uso
- Asistente de código local: con el preset `c1-spec` (`--spec 3`) se obtienen ~105 tok/s en un único flujo, suficiente para autocompletado, revisión de parches y explicación de código en un IDE sin salir de la máquina.
- Razonamiento científico asistido: el modo `reasoning_effort: max` y el contexto de 72K permiten abordar problemas de nivel GPQA con trazas de pensamiento largas, útil en investigación y docencia avanzada.
- Evaluación y benchmarking interno: el preset `c8` (`--spec 0`) alcanza 286–296 tok/s agregados, adecuado para ejecutar suites como MMLU-Pro o LiveCodeBench sobre lotes grandes.
- Síntesis de datos y generación de instrucciones: la concurrencia C8 con contexto largo permite producir grandes volúmenes de pares pregunta-respuesta o justificaciones razonadas para fine-tuning posterior.
- Análisis de documentos extensos: la ventana de 73.728 tokens por ranura admite contratos, informes técnicos o bases de código medianas en una sola pasada sin truncamiento.
- Despliegue on-premise con requisitos de soberanía: al ejecutarse íntegramente en una GPU local con API OpenAI, encaja en entornos donde no se permite enviar datos a la nube.
- Prototipado de agentes con contexto largo: la API compatible con OpenAI facilita integrar el modelo en orquestadores existentes (LangChain, LlamaIndex) para flujos multi-paso, aunque el soporte nativo de tool calling no está documentado.

## Benchmarks y rendimiento
Resultados reportados por el autor con el binario `MERGED` (SHA256 `a687714e858a428794d38fa02e26c41461eacc32ab433575d1e2119dd4274f59`), en C8 con contexto de 72K y `reasoning_effort: max`:

| Benchmark | Resultado | Truncamientos / vacíos | Longitud de pensamiento P50 / P70 / P90 (tokens) |
|---|---|---|---|
| GPQA Diamond | 178/198 (89,9 %) | 0 / 0 | 3.075 / 5.456 / 12.571 |
| MMLU-Pro | 470/500 (94,0 %) | 0 / 0 | 216 / 400 / 2.336 |
| LiveCodeBench | 88/100 (88,0 %) | no disponible | no disponible |
| GPQA 40 preguntas (regresión) | 38/40 (95,0 %) | 0 / 0 | no disponible |

Rendimiento de inferencia medido (misma GPU RTX PRO 6000 Blackwell, 96 GB):

| Preset | Comando | Throughput (tok/s) | Notas |
|---|---|---|---|
| C1 + spec 3 | `./start.sh c1-spec` | 104,95 / 105,28 | Aceptación especulativa 49,1 % |
| C1 + spec 7 | `./start.sh c1-spec --spec 7` | 106,77 / 107,11 | Aceptación 49,7 % |
| C8 sin spec | `./start.sh c8` | 285,15 / 288,18; pico 286,39–295,59 | `--spec 0` obligatorio en batch |
| C1 sin spec | `./start.sh c1` | 91,5–94,9 | Referencia sin decodificación especulativa |
| C4 con spec | no disponible | ~184 | Penalización frente a sin spec |
| C8 con spec | no disponible | ~272 | Penalización frente a sin spec |

Validación de paridad: 41 capas con unit parity 164/164, greedy top-1 16.384/16.384 y texto extremo a extremo 32/32, todo al 100 %. La regresión GPQA de 40 preguntas redujo el tiempo total de 1.214,6 s a 893,96 s (+33,9 %).

## Requisitos de hardware
- GPU: NVIDIA RTX PRO 6000 Blackwell (96 GB, sm_120, GDDR7 a 1.792 TB/s). No se documenta compatibilidad con otras GPU.
- Memoria del host: `/dev/shm` con al menos 72 GiB disponibles (la tabla Engram ocupa ~59 GiB y debe residir en `tmpfs`). En Docker, `--shm-size=80g`.
- Software: CUDA 13.1 (`libcudart`, `libcublas`), Python 3.11 o superior.
- Almacenamiento: el repositorio ocupa 92,7 GB; la descarga del pack de referencia añade ~70 GiB efectivos vía HTTP Range.
- Despliegue: motor Basalt (binario precompilado de 80,17 MiB, SHA256 `a687714e858a428794d38fa02e26c41461eacc32ab433575d1e2119dd4274f59`) o compilación desde el código de Basalt v0.5.7. API OpenAI en `127.0.0.1:8080`.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el formato `.basalt` es específico del motor.
- Latencia y throughput: ver tabla de benchmarks; el rendimiento cae a ~25 / 38 tok/s si la tabla Engram se sirve desde SSD en lugar de `tmpfs`.
- Ajuste de memoria: `--resident-budget-gib 2` para expertos residentes; `--kv fp16`; `--diag-rows 256`.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-Flash-NVFP4-FP8 (este) | no disponible (MoE, 41 capas de expertos) | 73.728 por ranura | other (heredada de tencent/Hy4-flash) | `.basalt` | Hugging Face, ModelScope, GitHub |
| tencent/Hy4-flash (base) | no disponible | no disponible | other | no disponible | Hugging Face |
| Hy4-flash-Basalt (jesdga) | no disponible | no disponible | no disponible | `.basalt` (pack de referencia) | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento. La diferencia principal frente al modelo base es la cuantización NVFP4/FP8 y el empaquetado para una GPU Blackwell concreta; frente al pack comunitario de jesdga, este repositorio aporta expertos NVFP4 propios y scripts de despliegue verificados.

## Limitaciones y advertencias
- Dependencia de hardware muy específica: solo se valida en RTX PRO 6000 Blackwell de 96 GB; no hay garantía en otras GPU, incluidas H100 o RTX 4090.
- La tabla Engram debe residir en `tmpfs`; servirla desde SSD degrada el throughput de 91–296 tok/s a 25–38 tok/s, lo que invalida el uso en producción.
- Consumo de memoria del host elevado: ~72 GiB de `/dev/shm` además de la VRAM, lo que limita el despliegue en nodos con poca RAM.
- Licencia `other` heredada de tencent/Hy4-flash: es imprescindible revisar los términos del modelo base antes de cualquier uso comercial; el motor Basalt es MIT, pero los pesos no.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación; la evaluación se limita a benchmarks en inglés (GPQA, MMLU-Pro, LiveCodeBench).
- Temperatura recomendada de 1.0; el autor advierte que `temperature=0` en razonamiento largo provoca repeticiones y salidas corruptas.
- En concurrencia C4/C8, la decodificación especulativa reduce el rendimiento y consume ~1 GB adicional de VRAM; debe desactivarse (`--spec 0`).
- Visión desactivada en la configuración de producción; no se documenta soporte de tool calling ni de agentes multi-paso.
- El repositorio no registra descargas ni likes, y el modelo es una conversión comunitaria sin validación independiente más allá de las pruebas del autor.
- El formato `.basalt` no es portable a otros motores de inferencia habituales (vLLM, llama.cpp, TGI), lo que ata el despliegue al binario Basalt.

## Enlaces
- Hugging Face: https://huggingface.co/nerkyor/Hy4-Flash-NVFP4-FP8
- ModelScope: https://www.modelscope.cn/models/Merkyor/Hy4-Flash-NVFP4-FP8
- GitHub de despliegue: https://github.com/MerkyorLynn/hy4-flash-blackwell-deploy
- Release del motor precompilado v1.0.0: https://github.com/MerkyorLynn/hy4-flash-blackwell-deploy/releases/tag/v1.0.0
- Pack de referencia comunitario: https://huggingface.co/jesdga/Hy4-flash-Basalt
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Motor Basalt v0.5.7: https://github.com/jesdga95/basalt
