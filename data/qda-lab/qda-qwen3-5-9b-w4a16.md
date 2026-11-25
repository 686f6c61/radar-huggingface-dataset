# qda-lab/QDA-Qwen3.5-9B-W4A16

## Resumen

QDA-Qwen3.5-9B-W4A16 es una cuantización de 4 bits de los pesos (W4A16) del modelo multimodal Qwen/Qwen3.5-9B, desarrollada por qda-lab mediante su herramienta QDA (Closed-Loop LLM Quantization Design with Agents). El objetivo es reducir el coste de despliegue del modelo original sin degradar de forma apreciable su calidad: el checkpoint pasa de 19,3 GB en BF16 a 9,1 GB, un 2,1× menos, conservando según el autor el 97,3 % de la precisión del modelo original.

El modelo base es un transformer de 9.653.104.368 parámetros (unos 9,65 mil millones) con pipeline image-text-to-text, es decir, acepta entradas de imagen y texto y genera texto. La cuantización mantiene las activaciones en 16 bits y solo comprime los pesos a enteros de 4 bits en grupos de 128, un esquema compatible con motores de inferencia de alto rendimiento como vLLM y SGLang a través del formato compressed-tensors.

Su relevancia práctica es doble: por un lado, permite servir un modelo multimodal de ~9,6B en una sola GPU con menos VRAM; por otro, el autor publica la receta completa de cuantización y los datos de calibración, lo que hace el proceso reproducible. La licencia Apache-2.0, idéntica a la del modelo base, facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos del modelo base no disponibles |
| Parametros totales | 9.653.104.368 (~9,65B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16: pesos INT4 en grupos de 128, activaciones de 16 bits; formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers, vLLM y SGLang) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo Qwen/Qwen3.5-9B, del que no se detallan en la información disponible la arquitectura interna, la composición del dataset de preentrenamiento ni si hubo fases de RLHF o DPO. Lo que sí se documenta es el proceso de cuantización: los pesos se convierten a enteros de 4 bits en grupos de 128 mediante GPTQ aplicado sobre una copia del modelo rotada con una transformada de Hadamard. La rotación se pliega dentro de los propios pesos, de modo que no hay transformación en tiempo de ejecución, y los escalares de grupo se afinan después mediante destilación. La receta concreta fue seleccionada por la búsqueda automatizada de QDA.

El proceso es reproducible: el autor publica la receta `qwen3.5-9b-w4a16.yaml`, los datos de calibración y destilación en el dataset `qda-lab/qda-recipe-inputs`, y las instrucciones para reconstruir el checkpoint con QDA 0.1.0 sobre una H100 de 80 GB. El autor advierte de que los pesos reconstruidos no son idénticos bit a bit a este checkpoint. El modelo base de referencia es la revisión `Qwen/Qwen3.5-9B@c202236235762e1c871ad0ccb60c8ee5ba337b9a`.

## Capacidades

- Generación de texto y razonamiento en modo "thinking": la evaluación se realizó con el modo de razonamiento activado y el bloque de pensamiento cerrado con ``.
- Procesamiento de imagen y texto (pipeline image-text-to-text), heredado del modelo base multimodal.
- Razonamiento matemático de competición: evaluado en AIME 2025 y HMMT Feb 2026.
- Razonamiento científico y de conocimiento general: evaluado en GPQA-Diamond y MMLU-Pro.
- Generación de código: evaluado en LiveCodeBench.
- Seguimiento de instrucciones: evaluado en IFBench.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling, function calling y agentes multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento matemático asistido: el modelo mantiene 84,9 en AIME 2025 frente a 85,3 del BF16, por lo que puede emplearse en tutores o verificadores de problemas de competición con una pérdida de calidad mínima y la mitad de memoria.
- Análisis de documentos con imágenes: al ser image-text-to-text, permite extraer y razonar sobre contenido de capturas, gráficos o formularios, con el coste de VRAM de un modelo de 4 bits.
- Generación de código en pipelines: con 64,3 en LiveCodeBench puede integrarse en asistentes de programación o revisión automática de parches, aunque es el benchmark donde la cuantización pierde más puntos respecto a BF16 (70,7).
- Evaluación científica y QA de dominio: con 80,0 en GPQA-Diamond es adecuado para responder preguntas de nivel experto en física, química y biología en herramientas internas de investigación.
- Despliegue en una sola GPU para prototipos y demos: los 9,1 GB del checkpoint permiten servir el modelo en GPUs de 24 GB o más, abaratando entornos de desarrollo y pruebas.
- Servicio de alto rendimiento con vLLM o SGLang: el autor reporta 251 tok/s a batch 1 y 3.267 tok/s a batch 16 en una H100, lo que lo hace viable para APIs internas con carga moderada.
- Reproducción y auditoría de cuantizaciones: la receta y los datos publicados permiten a un equipo reconstruir el checkpoint y adaptar el proceso a sus propios requisitos.

## Benchmarks y rendimiento

Resultados en modo thinking, pass@1 promediado sobre varias semillas (1 a 32 según el benchmark), con la misma configuración de muestreo para todos los modelos:

| Benchmark | BF16 (19,3 GB) | QDA W4A16 (9,1 GB) | cyankiwi AWQ-4bit (9,1 GB) | RedHat W4A16 (11,4 GB) | ParoQuant (8,6 GB) |
|---|---|---|---|---|---|
| AIME 2025 | 85,3 | 84,9 | 80,1 | 61,8 | 83,5 |
| HMMT Feb 2026 | 67,5 | 65,8 | 63,8 | 44,7 | 66,9 |
| GPQA-Diamond | 81,8 | 80,0 | 78,7 | 71,2 | 80,1 |
| IFBench | 67,0 | 66,2 | 62,1 | 63,2 | 64,3 |
| MMLU-Pro | 81,2 | 80,3 | 79,9 | 78,8 | 80,2 |
| LiveCodeBench | 70,7 | 64,3 | 63,2 | 49,9 | 67,7 |
| Media | 75,6 | 73,6 | 71,3 | 61,6 | 73,8 |

Configuración de evaluación: hasta 81.920 tokens nuevos por ítem en AIME, HMMT, GPQA, IFBench y LiveCodeBench, y 32.768 en MMLU-Pro; temperatura 1,0, top-p 0,95, top-k 20, min-p 0, presence penalty 1,5, repetition penalty 1,0; decodificación especulativa desactivada. La columna ParoQuant se ejecutó en su propio stack (vLLM 0.19.1 con paroquant 0.1.16).

Rendimiento en una H100 de 80 GB con 512 tokens generados por petición: 251 tok/s a batch 1 y 3.267 tok/s a batch 16. ParoQuant reporta 134 y 1.890 tok/s respectivamente.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 9,1 GB en disco; en inferencia hay que sumar caché KV y overhead del runtime, por lo que se recomienda un mínimo de 16-24 GB de VRAM según longitud de contexto y batch.
- GPUs validadas por el autor: NVIDIA H100, A100, RTX Pro 6000 y B200.
- GPU de consumo: no se confirma soporte en tarjetas consumer en la información disponible; el tamaño del checkpoint permitiría en principio cargarlo en GPUs de 24 GB, pero no hay validación publicada.
- Despliegue con vLLM: `VLLM_DISABLED_KERNELS=MacheteLinearKernel vllm serve qda-lab/QDA-Qwen3.5-9B-W4A16`. En H100 y H200 sin CUDA 13 en el sistema, la compilación del kernel falla al inicio (`libnvrtc-builtins.so.13.0`); hay que añadir las librerías NVIDIA del entorno virtual a `LD_LIBRARY_PATH` (comando incluido en la model card).
- Despliegue con SGLang: `python -m sglang.launch_server --model-path qda-lab/QDA-Qwen3.5-9B-W4A16`.
- Throughput medido: 251 tok/s a batch 1 y 3.267 tok/s a batch 16 en H100 80 GB.

## Comparativa con modelos similares

| Modelo | Tamano | Cuantizacion | Media de benchmarks | Licencia |
|---|---|---|---|---|
| Qwen3.5-9B BF16 | 19,3 GB | ninguna | 75,6 | Apache-2.0 |
| QDA-Qwen3.5-9B-W4A16 | 9,1 GB | W4A16 (GPTQ + Hadamard + destilación) | 73,6 | Apache-2.0 |
| cyankiwi AWQ-4bit | 9,1 GB | AWQ 4 bits | 71,3 | no disponible |
| RedHat W4A16 | 11,4 GB | W4A16 | 61,6 | no disponible |
| ParoQuant | 8,6 GB | cuantizacion propia | 73,8 | no disponible |

La comparativa se limita a variantes cuantizadas del mismo modelo base, que es lo que documenta el autor. No se dispone de datos frente a otros modelos de ~9B de otros fabricantes.

## Limitaciones y advertencias

- La cuantización introduce una pérdida media de 2,0 puntos respecto a BF16 (75,6 frente a 73,6), concentrada sobre todo en LiveCodeBench (70,7 a 64,3, una caída de 6,4 puntos).
- El modo de evaluación es siempre thinking con bloques de razonamiento largos (hasta 81.920 tokens nuevos), lo que implica latencia y coste elevados en producción si se usa ese modo por defecto.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas específicas del modelo base en la información disponible.
- El autor advierte de que la reconstrucción con la receta no produce pesos idénticos bit a bit a este checkpoint.
- En H100/H200 sin CUDA 13 es necesario un ajuste manual de `LD_LIBRARY_PATH`; sin él, el kernel de vLLM no compila al arrancar.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-9B, de la que esta cuantización hereda.
- El número de descargas (309) y de likes (0) es bajo, por lo que la validación por parte de la comunidad es todavía limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.5-9B-W4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper QDA: https://arxiv.org/abs/2611.23388
- Repositorio QDA: https://github.com/humanfia/qda
- Receta de cuantización: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/blob/main/QDA-Qwen3.5-9B-W4A16/qwen3.5-9b-w4a16.yaml
- Datos de calibración y destilación: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/tree/main/QDA-Qwen3.5-9B-W4A16
