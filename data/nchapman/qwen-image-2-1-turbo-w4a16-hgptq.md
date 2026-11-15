# nchapman/Qwen-Image-2.1-Turbo-W4A16-HGPTQ

## Resumen

Qwen-Image-2.1-Turbo-W4A16-HGPTQ es una cuantizacion de 4 bits del modelo de difusion texto-a-imagen Qwen/Qwen-Image-2.1-Turbo, publicada por el usuario nchapman bajo licencia Apache-2.0. El modelo base es un pipeline de generacion de imagenes de 16B (8,77B del codificador de texto Qwen3VL y 7,12B del transformer DiT) que combina generacion texto-a-imagen (T2I) y edicion imagen-a-imagen con imagen de referencia (TI2I). Esta version comprime el modelo original de 32,45 GiB en BF16 a 9,82 GiB, una reduccion de 3,31 veces, manteniendo una fidelidad de trayectoria alta respecto al profesor.

La relevancia de esta ficha es practica: permite ejecutar un pipeline de imagen de 16B en GPUs con aproximadamente 10,2 GiB de VRAM si se mantienen ambos submodelos comprimidos, algo imposible con los pesos BF16 originales. La cuantizacion se ha realizado con la herramienta warp-quant del mismo autor, aplicando GPTQ con rotaciones de Hadamard y tecnicas de QAT (quantization-aware training) sobre estados ocultos y velocidades del DiT.

El modelo esta pensado para desarrolladores que quieran desplegar generacion y edicion de imagenes de calidad en hardware de consumo o en servidores con VRAM limitada, aceptando una perdida controlada de fidelidad (PSNR medio de 23,15 dB frente al modelo BF16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion: codificador de texto Qwen3VL (36 capas decoder + 27 bloques ViT) + transformer DiT QwenImage21Transformer2DModel (32 bloques single-stream 3D-RoPE) + VAE AutoencoderKLQwenImage21 |
| Parametros totales | 1.117.270.464 (dato de safetensors del repo cuantizado); el modelo base completo se describe como 16B (8,77B encoder + 7,12B DiT) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 con GPTQ, grupo g64, Hadamard online H64 (g0_text, g2_vision, g0_dit), H16 per-channel en linear_fc2, W8_g64 sin rotar en lm_head; VAE en BF16; formato compressed-tensors pack-quantized |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada de Qwen/Qwen-Image-2.1-Turbo) |
| Formato de pesos | safetensors (compressed-tensors, pack-quantized) |

## Arquitectura y entrenamiento

El pipeline sigue la arquitectura del modelo base Qwen-Image-2.1-Turbo: un codificador de texto Qwen3VLForConditionalGeneration (36 capas decoder, 27 bloques ViT, merger y deepstack_merger_list.0..2) que produce embeddings de prompt, y un transformer DiT QwenImage21Transformer2DModel con 32 bloques single-stream con 3D-RoPE y 224 capas lineales, mas modulos img_in, txt_in, proj_out, time_text_embed, modulation.1 y norm_out.linear que se mantienen en BF16. El VAE (AutoencoderKLQwenImage21) no se modifica y queda en BF16.

El proceso de cuantizacion es el elemento diferencial. Se aplica GPTQ secuencial bloque a bloque calibrado sobre trayectorias (trajectory-calibrated) en el DiT, con rotaciones de Hadamard online H64 para suavizar outliers, y un QAT de 120 pasos sobre la velocidad del bloque 31 (Velocity QK-Norm QAT). En el codificador de texto se aplica W4_g64 con Hadamard H64 en el grupo de texto y de vision, H16 per-channel en las capas mlp.linear_fc2 (K=4304), lm_head en W8_g64 sin rotar, y un QAT de 120 pasos sobre estados ocultos no normalizados de la capa 35 que reduce el MSE de validacion un 24,7 por ciento. El resultado es un unico artefacto de 9,82 GiB que preserva la fidelidad de trayectoria del modelo BF16.

## Capacidades

- Generacion texto-a-imagen (T2I) a resoluciones como 1024x1024, con control de semilla para reproducibilidad.
- Edicion imagen-a-imagen con imagen de referencia (TI2I), segun la model card.
- Generacion en 8 pasos (variante Turbo), lo que reduce el coste de inferencia frente a pipelines de difusion clasicos.
- Codificacion de prompt mediante Qwen3VL, con capacidad de procesar texto e imagenes de referencia.
- Integracion con la libreria diffusers mediante QwenImage21Pipeline y con la utilidad warp_quant.qwen_image.load_qwen_image_pipeline.
- Control de compresion en memoria: se puede mantener el transformer comprimido en VRAM (keep_transformer_compressed=True) o descomprimirlo a BF16 segun necesidad.
- No se documentan capacidades de tool calling, agentes, audio ni thinking mode; no disponibles.

## Casos de uso

- Generacion de imagenes en GPUs de consumo: con ambos submodelos comprimidos el pipeline ocupa aproximadamente 10,2 GiB de VRAM, por lo que puede ejecutarse en tarjetas de 12-16 GB para prototipado y demos.
- Edicion de imagenes con referencia: el soporte TI2I permite tomar una imagen de entrada y aplicar transformaciones guiadas por prompt, util para retoque, variaciones de producto o pruebas de concepto de diseno.
- Servidores de inferencia con VRAM limitada: al reducir el peso de 32,45 GiB a 9,82 GiB, se pueden desplegar varias instancias o aumentar el batch en un mismo nodo frente al modelo BF16.
- Generacion de material grafico para prototipos: la variante Turbo de 8 pasos permite iterar rapidamente sobre prompts en flujos de diseno y validacion de concepto.
- Investigacion en cuantizacion de modelos de difusion: el repositorio incluye recetas (GPTQ, Hadamard, QAT) y metricas de fidelidad que sirven como referencia reproducible para estudiar el impacto de W4A16 en DiT y en codificadores multimodales.
- Pipelines de contenido automatizado con control de semilla: la reproducibilidad con semilla fija y la fidelidad de trayectoria (coseno 0,9988 en velocidad del DiT) permiten integrar el modelo en flujos que requieren resultados estables entre ejecuciones.
- Evaluacion comparativa de calidad frente a BF16: las metricas de PSNR (23,15 dB) y coseno latente end-to-end (0,9648) permiten decidir si la perdida es aceptable para un producto concreto antes de migrar a la version cuantizada.

## Benchmarks y rendimiento

Resultados de fidelidad publicados por el autor frente al pipeline BF16 sin modificar, sobre prompts retenidos de T2I y TI2I (probe_results.json):

| Metrica | Valor | Notas |
|---|---:|---|
| Coseno de velocidad del DiT (teacher-forced) | 0,998846 (99,88 %) | Similitud media paso a paso en pasos FlowMatch tempranos, medios y tardios |
| SQNR de velocidad del DiT (teacher-forced) | 26,99 dB | RMSE relativo 0,04638 (4,64 %) |
| Coseno de embeddings de prompt (text_encoder) | 0,951356 | Estados ocultos no normalizados de capa 35, SQNR 13,58 dB |
| Coseno latente end-to-end en 8 pasos | 0,964757 (96,48 %) | Trayectoria Turbo completa con la misma semilla de ruido inicial, SQNR 16,50 dB |
| PSNR medio de imagen decodificada | 23,15 dB | PSNR RGB frente a la trayectoria del profesor BF16 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; estos no aplican a un modelo de generacion de imagenes.

## Requisitos de hardware

- VRAM estimada: aproximadamente 10,2 GiB si se mantienen comprimidos el codificador de texto (5,44 GiB) y el transformer (3,75 GiB) en 4 bits int32; el VAE anade 0,63 GiB en BF16.
- Si se descomprime el transformer a BF16 (keep_transformer_compressed=False), el consumo de VRAM aumenta de forma significativa respecto a los 10,2 GiB indicados.
- GPU recomendadas: no hay una lista oficial; por el perfil de memoria, tarjetas de 12-16 GB o superiores son el objetivo practico. Para el modelo base BF16 se requiere bastante mas VRAM, aunque no se especifica cifra.
- Cabe en GPU de consumo con al menos 12 GB de VRAM en configuracion totalmente comprimida; no se confirma soporte en tarjetas de 8 GB.
- Opciones de despliegue: diffusers con la utilidad warp_quant (load_qwen_image_pipeline); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que ademas no estan orientados a pipelines de difusion.
- Latencia y throughput: no disponibles. La variante Turbo emplea 8 pasos de inferencia, lo que reduce el coste frente a pipelines de mas pasos, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Turbo-W4A16-HGPTQ (este) | 1.117.270.464 en safetensors; base de 16B | no disponible | W4A16 GPTQ + Hadamard + QAT | Apache-2.0 | Hugging Face, diffusers |
| Qwen/Qwen-Image-2.1-Turbo (base) | 16B (8,77B encoder + 7,12B DiT) | no disponible | BF16 | Apache-2.0 | Hugging Face, diffusers |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos de difusion texto-a-imagen de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas en la informacion proporcionada; la comparacion se limita al modelo base BF16 y a la ausencia de referencias verificables de terceros.

## Limitaciones y advertencias

- Perdida de fidelidad respecto al BF16: PSNR medio de 23,15 dB y coseno latente end-to-end de 0,9648 implican diferencias visibles en algunas imagenes; no es una replica exacta del modelo original.
- El coseno de embeddings de prompt (0,9514) y su SQNR (13,58 dB) son las metricas mas bajas del conjunto, lo que sugiere mayor sensibilidad en la codificacion de texto que en el DiT.
- Sesgos conocidos: no documentados en la informacion disponible; al heredar el comportamiento del modelo base, pueden persistir sesgos de generacion de imagenes no evaluados aqui.
- Riesgo de alucinacion visual y de artefactos: inherente a los modelos de difusion; la cuantizacion puede amplificar artefactos en prompts complejos o en edicion TI2I.
- Idiomas soportados: no disponible; no se puede confirmar el comportamiento multilingue del codificador de texto en esta version.
- Longitud de contexto: no disponible.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base y de los componentes (Qwen3VL, VAE) por si hubiera terminos adicionales.
- Dependencia de la libreria warp-quant y de su API (load_qwen_image_pipeline); no es un pipeline estandar de diffusers sin esa dependencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad ni reportes independientes de calidad.
- No se documentan tiempos de inferencia, throughput ni comportamiento en produccion; el despliegue requiere validacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/Qwen-Image-2.1-Turbo-W4A16-HGPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Herramienta de cuantizacion warp-quant: https://github.com/nchapman/warp34-quant-lab
