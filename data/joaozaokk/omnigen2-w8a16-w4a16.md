# JoaoZaokk/OmniGen2-W8A16-W4A16

## Resumen

OmniGen2-W8A16-W4A16 es un conjunto de pesos cuantizados del transformer (DiT) del modelo OmniGen2, un generador de imagenes texto-a-imagen desarrollado originalmente por el equipo OmniGen2. La publicacion la firma JoaoZaokk, que ha aplicado cuantizacion weight-only sobre el repack FP16 que ComfyUI hace del modelo base `OmniGen2/OmniGen2`. El objetivo es reducir huella de VRAM y tamano en disco sin sacrificar velocidad de inferencia en el caso de la variante INT8.

La relevancia practica esta en que OmniGen2, en FP16, requiere unos 16,8 GB de VRAM pico para generar a 1024 px en 20 pasos, lo que lo deja fuera de muchas GPU de consumo. La variante W8A16 baja ese pico a 13,4 GB manteniendo practicamente la misma velocidad por paso (1,43 s frente a 1,42 s en una RTX 3090), mientras que W4A16 lo reduce a 12,0 GB a costa de un 25 % mas de tiempo por paso y mayor deriva respecto a FP16.

Se trata de un artefacto de inferencia para ComfyUI, no de un modelo nuevo: las activaciones permanecen en FP16 y solo se cuantizan los pesos de 266 capas lineales. El modelo base es un transformer de difusion con modulos auxiliares (noise-refiner, context-refiner y reference-image-refiner) y admite tanto generacion texto-a-imagen como edicion de imagenes, aunque el autor solo ha validado el modo texto-a-imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) con modulos noise-refiner, context-refiner y reference-image-refiner |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A16 (INT8 tensorwise, escala por fila) y W4A16 (AWQ Q4_1, grupo 40) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (single-file para ComfyUI) |

## Arquitectura y entrenamiento

El modelo base OmniGen2 es un transformer de difusion con anchura de 2520 canales, organizado en bloques principales mas tres refinadores especializados (ruido, contexto y imagen de referencia). La cuantizacion publicada afecta exclusivamente a los pesos de 266 capas lineales: proyecciones q/k/v/out de atencion y las tres matrices feed-forward de cada bloque mencionado. Los 316 tensores restantes se mantienen en precision original.

La peculiaridad tecnica de esta publicacion es que la anchura 2520 no es multiplo de 256 (ConvRot), ni de 32 (grupo Q4_1 de GGUF), ni de 16 (GEMM INT8), de modo que los formatos preexistentes no encajan en la mayoria de capas. El autor usa `int8_tensorwise` con `full_precision_matrix_mult` para W8A16 y `awq_w4a16` con grupo 40 (el maximo comun divisor de 2520 y 10240) para W4A16, garantizando que toda capa lineal encaje. No se aplico calibracion (ni min/max por fila ni por grupo). El error relativo medio de pesos en W4A16 es 0,0834 (maximo 0,0893). No hay datos sobre tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO en la informacion disponible.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) a 1024 px.
- Edicion de imagenes y modo multi-imagen presentes en el modelo base, aunque no validados en estas variantes cuantizadas.
- Integracion directa con ComfyUI mediante el nodo estandar `UNETLoader`, sin nodos personalizados.
- Compatibilidad con el text encoder `qwen_2.5_vl_fp16` cargado con `CLIPLoader` de tipo `omnigen2`.
- Soporte de DualCFG guidance (cfg 5.0 / 2.0), sampler euler y scheduler simple.
- No dispone de tool calling, function calling, razonamiento multi-paso ni modo thinking: es un modelo generativo de imagenes.
- Capacidad multilingue limitada al ingles segun los metadatos.

## Casos de uso

- Generacion de ilustraciones en estaciones de trabajo con GPU de 12-16 GB: W8A16 permite generar a 1024 px con 20 pasos en tarjetas donde FP16 no cabria, con latencia por paso identica a FP16.
- Prototipado rapido de pipelines texto-a-imagen en ComfyUI: al usar el `UNETLoader` estandar, se puede sustituir el checkpoint FP16 por el W8A16 sin reescribir el grafo de nodos.
- Despliegue en entornos con VRAM compartida: los 3,4 GB de VRAM liberados por W8A16 dejan margen para el text encoder Qwen2.5-VL y el VAE en la misma GPU.
- Generacion de assets para videojuegos o diseno grafico en lote: la velocidad de 1,43 s por paso en RTX 3090 hace viable producir varias imagenes por prompt con seeds distintas.
- Experimentacion academica con cuantizacion de DiT: los logs `.quant.json` y el script `tools/quant_omnigen2.py` permiten reproducir el procedimiento y comparar tecnicas de cuantizacion weight-only.
- Pruebas de concepto de edicion de imagenes: aunque no validadas, las variantes conservan los modulos de refinado de referencia necesarios para el modo de edicion del modelo base.
- Inferencia en servidores modestos con W4A16 cuando la prioridad es ajustar VRAM (12,0 GB pico) y se acepta un 25 % mas de tiempo por paso.

## Benchmarks y rendimiento

| Metrica | FP16 (origen) | W8A16 | W4A16 (grupo 40) |
|---|---|---|---|
| Tamano de archivo | 7,4 GiB | 4,05 GiB | 2,71 GiB |
| VRAM pico, 1024 px, 20 pasos | 16,8 GB | 13,4 GB | 12,0 GB |
| Segundos por paso, RTX 3090 | 1,42 | 1,43 | 1,77 (+25 %) |
| PSNR vs FP16 (6 imagenes) | referencia | 24,5-30,3 dB | 16,1-24,2 dB |
| SSIM vs FP16 | referencia | 0,89-0,97 | 0,55-0,91 |

No se han publicado resultados de benchmarks en la informacion disponible sobre MMLU, HumanEval, GSM8K ni metricas de calidad de imagen estandar (FID, CLIP score). Las cifras anteriores provienen de la model card del autor y se midieron con 6 renders por variante en una RTX 3090, usando los cinco ultimos para los tiempos. El autor advierte que el PSNR entre cuantizaciones distintas tiene un suelo de aproximadamente 28 dB por la variabilidad del sampler, por lo que no debe interpretarse como medida absoluta de calidad.

## Requisitos de hardware

- VRAM estimada: 13,4 GB pico con W8A16 y 12,0 GB pico con W4A16 a 1024 px y 20 pasos; FP16 requiere 16,8 GB.
- GPU recomendadas: RTX 3090 (medida de referencia), RTX 4090, A100 y H100 sin problema; en W8A16 encaja en GPUs consumer de 16 GB como RTX 4080 o RTX 4060 Ti de 16 GB.
- Cabe en consumer GPU: si, en W8A16 y W4A16 con tarjetas de 16 GB o 12 GB respectivamente; FP16 queda justo en 16 GB y fuera de 12 GB.
- Opciones de despliegue: ComfyUI v0.43.2 con comfy-kitchen 0.2.40, colocando los archivos en `models/diffusion_models`; text encoder `qwen_2.5_vl_fp16` con `CLIPLoader` tipo `omnigen2`; DualCFG guidance (cfg 5.0 / 2.0), euler, scheduler simple, 20 pasos.
- Latencia y throughput: 1,43 s por paso en W8A16 y 1,77 s por paso en W4A16 sobre RTX 3090, lo que equivale a unos 28,6 s y 35,4 s por imagen completa de 20 pasos respectivamente.
- Advertencia de precision: con el modelo en FP16, las escalas y ceros deben almacenarse en FP16; escalas BF16 promueven el producto a FP32 y la capa lineal falla por incompatibilidad de tipos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / VRAM pico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OmniGen2-W8A16 (esta ficha) | no disponible | no disponible | safetensors ComfyUI / 13,4 GB | Apache-2.0 | Hugging Face |
| OmniGen2-W4A16 (esta ficha) | no disponible | no disponible | safetensors ComfyUI / 12,0 GB | Apache-2.0 | Hugging Face |
| OmniGen2 FP16 (base) | no disponible | no disponible | safetensors ComfyUI / 16,8 GB | Apache-2.0 | Hugging Face |
| Alternativas de generacion texto-a-imagen | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos frente a otros modelos texto-a-imagen en la informacion proporcionada, por lo que la comparativa se limita a las tres variantes del propio OmniGen2. El autor senala que, en su valoracion personal, OmniGen2 parece desactualizado frente a modelos mas recientes.

## Limitaciones y advertencias

- Solo se ha validado el modo texto-a-imagen; la edicion de imagenes y el modo multi-imagen del modelo base no fueron probados en estas variantes.
- No se aplico calibracion en la cuantizacion, lo que puede aumentar la perdida de calidad frente a metodos calibrados.
- W4A16 presenta una deriva notable respecto a FP16 (PSNR minimo de 16,1 dB y SSIM minimo de 0,55), por lo que no es recomendable cuando la fidelidad visual es critica.
- El PSNR entre cuantizaciones distintas no es una medida fiable de calidad por el suelo de unos 28 dB introducido por la variabilidad del sampler.
- Idiomas: solo ingles segun los metadatos; los prompts en castellano pueden degradar la calidad de generacion.
- Riesgo de sesgos y alucinacion visual heredado del modelo base, no cuantificado en la informacion disponible.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base `OmniGen2/OmniGen2` y del text encoder Qwen2.5-VL, que tiene su propia licencia.
- Dependencia de una version concreta de ComfyUI (v0.43.2) y comfy-kitchen (0.2.40); cambios en el loader pueden romper la carga de metadatos por capa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria independiente de los resultados del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JoaoZaokk/OmniGen2-W8A16-W4A16
- Modelo base OmniGen2: https://huggingface.co/OmniGen2/OmniGen2
- Repositorio de metodologia y benchmark: https://github.com/JoaoZaokk/comfy-quant-bench
- Script de cuantizacion: https://github.com/JoaoZaokk/comfy-quant-bench (`tools/quant_omnigen2.py`)
