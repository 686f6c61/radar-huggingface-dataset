# BaoKhuong/qwen3-asr-1.7b-vimd-full-GGUF

## Resumen
El repositorio `BaoKhuong/qwen3-asr-1.7b-vimd-full-GGUF` distribuye conversiones en formato GGUF del checkpoint vietnamita `duclvQ/qwen3-asr-1.7b-vimd-full`, un ajuste fino sobre Qwen3-ASR-1.7B orientado al reconocimiento automatico del habla (ASR) en vietnamita. No se trata de un modelo nuevo ni de un fine-tune adicional: el autor publica unicamente pesos convertidos, en dos familias de GGUF incompatibles entre si segun el runtime de destino.

El modelo base parte de la familia Qwen3-ASR, con 2.349.243.536 parametros reales (segun safetensors) y una licencia Apache 2.0 que permite uso comercial. La relevancia actual reside en que permite ejecutar un modelo ASR especializado en vietnamita en entornos ligeros mediante `qwen3-asr.cpp` o CrispASR, sin necesidad de un stack de inferencia completo de PyTorch.

La ficha se centra en las conversiones GGUF publicadas y en las caracteristicas del checkpoint base que el autor documenta. Cualquier dato no verificado en la model card se marca explicitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para ASR (familia Qwen3-ASR); detalles internos de capas y atencion no disponibles en la informacion proporcionada |
| Parametros totales | 2.349.243.536 (2.349 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_1 (familia qwen3-asr.cpp); F16 y Q8_0 (familia CrispASR) |
| Idiomas soportados | Vietnamita (`vi`) como idioma declarado; el checkpoint base Qwen3-ASR es multilingue, pero el fine-tune esta orientado a vietnamita |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos familias: `qwen3-asr.cpp` y CrispASR); checkpoint original en BF16 en el repo base |

## Arquitectura y entrenamiento
La informacion disponible no detalla la arquitectura interna del checkpoint base Qwen3-ASR-1.7B (numero de capas, dimensiones, mecanismo de atencion ni estrategia de entrenamiento). Lo que si se documenta es que el modelo `duclvQ/qwen3-asr-1.7b-vimd-full` es un fine-tune en vietnamita sobre Qwen3-ASR-1.7B, y que las conversiones publicadas en este repositorio derivan de su checkpoint "ViMD Full BF16".

La parte tecnica mejor documentada es el proceso de conversion a GGUF. Para la familia `qwen3-asr.cpp` se convirtieron 707 tensores con 0 omitidos mediante `predict-woo/qwen3-asr.cpp` y su script `convert_hf_to_gguf.py`; tres tensores de convolucion del encoder de audio permanecen en F16 en las versiones Q8_0 y Q4_1 porque sus formas no eran compatibles con la cuantizacion por bloques. Para la familia CrispASR se generaron 710 entradas de tensor, incluyendo arrays de preprocesado de audio y una proyeccion de salida `output.weight` materializada explicitamente. El analisis del autor sugiere que la ausencia de `output.weight` en la variante `qwen3-asr.cpp` es consistente con weight tying, aunque no lo demuestra numericamente.

## Capacidades
- Reconocimiento automatico del habla (ASR) en vietnamita, tarea principal del modelo.
- Transcripcion de audio a texto mediante pipelines compatibles con GGUF (qwen3-asr.cpp, CrispASR, Subtitle Edit con integracion Qwen3 ASR CPP).
- Ejecucion en CPU y en GPU de gama baja mediante backends como Vulkan, segun el smoke test documentado.
- Soporte de seleccion de idioma en la CLI de CrispASR (`-l vi`), lo que sugiere capacidad de forzar el idioma de decodificacion.
- Capacidades multilingues del checkpoint base Qwen3-ASR no verificadas en esta conversion; el unico idioma declarado es vietnamita.
- No se documentan capacidades de tool calling, agentes, vision, audio generativo ni modo thinking.

## Casos de uso
- Transcripcion de reuniones y entrevistas en vietnamita: el modelo puede procesar audio y generar texto plano en un runtime GGUF ligero, adecuado para equipos que no quieren desplegar PyTorch.
- Generacion de subtitulos: la integracion con Subtitle Edit mediante Qwen3 ASR CPP permite producir subtitulos en vietnamita a partir de videos, con la ventaja de ejecutarse en local.
- Procesamiento por lotes en servidores sin GPU dedicada: las variantes Q4_1 (1.747 GiB) y Q8_0 (2.401 GiB) permiten ejecutar la transcripcion en CPU, reduciendo coste frente a soluciones cloud.
- Prototipado rapido de aplicaciones de voz: al estar en GGUF, se puede integrar en scripts y herramientas de linea de comandos sin dependencias pesadas, lo que acelera la validacion de ideas.
- Despliegue en dispositivos de gama baja o embebidos: el smoke test documentado en una Intel Iris Xe (i5-1135G7) con Vulkan y 4 hilos sugiere viabilidad en portatiles modestos.
- Investigacion en ASR vietnamita: sirve como checkpoint de referencia cuantizado para comparar calidad de transcripcion entre precisiones (F16, Q8_0, Q4_1) sin necesidad de convertir pesos manualmente.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento es un smoke test cualitativo: la variante CrispASR Q8_0 transcribio un clip de 9,2 segundos en ingles en 8,59 segundos (~1,07x tiempo real) usando CrispASR v0.8.49 en Windows x86_64, backend Vulkan sobre Intel Iris Xe (i5-1135G7) y 4 hilos de CPU. El propio autor indica que esto no constituye un benchmark de GPU/CPU ni una evaluacion de precision en vietnamita.

## Requisitos de hardware
- VRAM/RAM estimada segun tamano en disco: F16 ~3,8-4,4 GiB; Q8_0 ~2,3-2,4 GiB; Q4_1 ~1,7 GiB. Son tamanos en disco, no mediciones de memoria en tiempo de ejecucion.
- GPU recomendadas: no disponibles. El unico backend verificado es Vulkan sobre grafica integrada Intel Iris Xe.
- Cabe en GPU de consumo: previsiblemente si en tarjetas con 4-6 GB de VRAM para Q4_1/Q8_0, aunque no hay verificacion publicada.
- Opciones de despliegue: `qwen3-asr.cpp` (incluye integracion con Subtitle Edit) y CrispASR. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo el dato del smoke test (~1,07x tiempo real en el hardware citado). No hay mediciones de throughput por lote ni de latencia en GPU dedicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| qwen3-asr-1.7b-vimd-full-GGUF (este) | 2.349 M | No disponible | Vietnamita | Apache 2.0 | GGUF (qwen3-asr.cpp, CrispASR) |
| duclvQ/qwen3-asr-1.7b-vimd-full (base) | 2.349 M | No disponible | Vietnamita | Apache 2.0 | BF16 (Hugging Face) |
| Qwen3-ASR-1.7B original | 1,7 B (nominal) | No disponible | Multilingue | No disponible en la informacion | No disponible |

No se dispone de datos de benchmarks que permitan comparar calidad de transcripcion entre estos modelos. La comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias
- Las dos familias GGUF (`qwen3-asr.cpp` y CrispASR) no son intercambiables aunque compartan extension `.gguf`; usar el archivo equivocado con el runtime incorrecto puede fallar.
- La calidad de transcripcion en vietnamita no ha sido evaluada ni publicada por el autor; el unico smoke test es en ingles.
- La compatibilidad extremo a extremo y la calidad de transcripcion no estan establecidas de forma independiente para todos los runtimes.
- El modelo esta especializado en vietnamita; su comportamiento en otros idiomas no esta documentado.
- Riesgo de alucinacion y errores en audio con ruido, acentos o dominios especializados: no cuantificado en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el checkpoint base ni sobre las conversiones.
- Los tamanos en disco no implican menor uso de RAM en tiempo de ejecucion ni mayor velocidad; el autor lo advierte explicitamente.
- No hay informacion sobre sesgos, contexto maximo ni limitaciones de audio (duracion maxima, sample rate).

## Enlaces
- Repositorio GGUF: https://huggingface.co/BaoKhuong/qwen3-asr-1.7b-vimd-full-GGUF
- Checkpoint base: https://huggingface.co/duclvQ/qwen3-asr-1.7b-vimd-full
- Runtime qwen3-asr.cpp: https://github.com/predict-woo/qwen3-asr.cpp
- Script de conversion: https://github.com/predict-woo/qwen3-asr.cpp/blob/main/scripts/convert_hf_to_gguf.py
- Runtime CrispASR: https://github.com/CrispStrobe/CrispASR
- Archivo CrispASR F16: https://huggingface.co/BaoKhuong/qwen3-asr-1.7b-vimd-full-GGUF/blob/main/qwen3-asr-1.7b-vimd-crisp-f16.gguf
- Archivo CrispASR Q8_0: https://huggingface.co/BaoKhuong/qwen3-asr-1.7b-vimd-full-GGUF/blob/main/qwen3-asr-1.7b-vimd-crisp-q8_0.gguf
