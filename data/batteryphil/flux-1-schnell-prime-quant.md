# batteryphil/FLUX.1-schnell-PRIME-Quant

## Resumen

FLUX.1-schnell-PRIME-Quant es una cuantización a 4 bits del modelo de generación de imágenes FLUX.1-schnell, desarrollada por el autor independiente Philip Bartsch (@batteryphil) mediante su método propio PRIME-Quant. El modelo base, creado por Black Forest Labs bajo licencia Apache 2.0, es un transformer de difusión (MMDiT) de 12 000 millones de parámetros que se apoya en un codificador de texto T5-XXL de 4760 millones de parámetros. La contribución de esta ficha es comprimir todo el stack de inferencia de aproximadamente 33,7 GB en BF16 hasta 9,37 GB en disco, manteniendo la totalidad de las capas lineales cuantizadas (671 de 671).

El problema que resuelve es el de la huella de memoria: el FLUX.1-schnell original no cabe en GPUs de consumo de 12-16 GB sin recurrir a offload secuencial a CPU, lo que dispara la latencia. Esta cuantización permite ejecutar el pipeline completo (T5-XXL, DiT de 12B, CLIP-L y VAE) residente al 100 % en GPU, con un pico medido de 11 005,8 MB a 1024×1024 y un tiempo de generación en caliente de 9,24 s frente a los 19,92 s del baseline con offload.

Es relevante porque demuestra una cuantización agresiva (4 bits, codebook armónico primo de grupo 32) con paridad visual razonable (PSNR medio de 18,94 dB y SSIM de 0,7097 en una batería de seis prompts) sobre hardware de consumo AMD RDNA4 con ROCm 7.2, además de CUDA. La licencia, sin embargo, es restrictiva: no es Apache 2.0 como el modelo base, sino una licencia personal con reparto del 5 % de beneficios comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion MMDiT (FluxTransformer2DModel, 19 bloques dual-stream y 38 single-stream) + codificador de texto T5-XXL + CLIP-L + VAE AutoencoderKL |
| Parametros totales | 12 000 millones (MMDiT) + 4760 millones (T5-XXL); CLIP-L y VAE adicionales de menor tamano |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo text-to-image; no se especifica longitud de prompt maxima) |
| Tipos de cuantizacion | 4 bits, esquema PRIME-Quant `V3_P4_0` (codebook armonico primo de grupo 32), cobertura del 100 % de capas lineales (671/671) |
| Idiomas soportados | No disponible (el prompt se procesa via T5-XXL y CLIP-L; no se documenta cobertura linguistica) |
| Licencia | `bartsch-personal-free-5pct-commercial-v1.0` (gratuita para uso personal, investigacion, academico y sin animo de lucro; 5 % de reparto de beneficios en uso comercial) |
| Formato de pesos | Pesos cuantizados propios para el runtime PRIME-Quant (repo de 9,4 GB); el modelo base es `diffusers`/safetensors |

## Arquitectura y entrenamiento

El modelo base FLUX.1-schnell es un transformer de difusion con arquitectura MMDiT (Multi-Modal Diffusion Transformer) de 12 000 millones de parametros, con 19 bloques dual-stream y 38 bloques single-stream, acondicionado por un T5-XXL de 4760 millones de parametros y un CLIP-L para el pooling de texto. Esta cuantizacion no reentrena el modelo: aplica compresion post-entrenamiento de los pesos a 4 bits con el esquema PRIME-Quant `V3_P4_0`, un codebook armonico primo con agrupacion de 32 elementos.

Las innovaciones tecnicas documentadas incluyen rotaciones de Walsh-Hadamard por cabeza para reducir el error de cuantizacion: `H_64` exacta sobre `sa.v <-> sa.o` en los 24 bloques de T5-XXL, `H_128` conjunta sobre atencion en los 19 bloques dual-stream (invariancia medida de 51,8/53,0 dB en BF16) y `H_128` exacta sobre `attn.to_v <-> proj_out[:, :3072]` en los 38 bloques single-stream (58,4/58,1 dB). Ademas se aplica un alineamiento de condicionamiento Kronecker `PRIMAL`: `time_text_embed` alcanza 46,12 dB de SNR de validacion y el `context_embedder` co-adaptado alinea los 256 tokens (activos y de relleno) del T5-XXL cuantizado sobre la variedad del teacher BF16, pasando de 5,13 dB a 10,16 dB en todos los tokens y 12,80 dB en tokens activos. El SNR medio de pesos es de 22,54 dB en T5-XXL y 22,53 dB en el bloque del DiT. No se documenta el dataset de entrenamiento original de FLUX.1-schnell ni procesos de RLHF/DPO en la informacion disponible.

## Capacidades

- Generacion de imagenes texto-a-imagen a resoluciones de 1024×1024 y formatos multi-aspecto (768×1344 vertical 9:16, 1344×768 panoramico 16:9).
- Generacion rapida con 4 pasos de muestreo (el modelo base es un modelo "schnell" destilado para pocos pasos).
- Renderizado de tipografia grabada de alta fidelidad (caso de prueba documentado con la placa de laton "PRIME QUANT 2026").
- Generacion de planos arquitectonicos y elementos tecnicos rotulados (caso de prueba "STAGE 4").
- Inferencia 100 % en GPU sin offload a CPU, con los cuatro componentes (T5-XXL, DiT, CLIP-L y VAE) residentes.
- Compatibilidad con GPUs AMD RDNA4 via ROCm 7.x (con AOTriton SDPA experimental) y GPUs NVIDIA CUDA de 12-16 GB.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo thinking; es exclusivamente un modelo de generacion de imagenes.

## Casos de uso

- Generacion de imagenes en estaciones de trabajo con GPU de consumo: al requerir 9,49 GB residentes y 11,01 GB de pico, el modelo cabe en una Radeon RX 9060 XT de 16 GB o en una RTX 4090/4080, permitiendo generar imagenes a 1024×1024 en 9,24 s en caliente sin depender de servicios en la nube.
- Prototipado rapido de conceptos visuales: con 4 pasos de muestreo y 2,4 s para los cuatro pasos del MMDiT, es adecuado para iterar prompts en sesiones de diseno donde se generan decenas de variantes por minuto.
- Generacion de material grafico con texto integrado: la prueba de estres de tipografia grabada en laton demuestra capacidad para rotulos y placas, util en mockups de producto y senaletica.
- Ilustracion de articulos y documentacion tecnica: los formatos panoramico 16:9 y vertical 9:16 permiten generar cabeceras de blog y piezas para redes sin reencuadre posterior.
- Planos y diagramas arquitectonicos: el caso de prueba "STAGE 4" sobre blueprint sugiere uso en visualizacion preliminar de esquemas tecnicos rotulados.
- Despliegue en entornos ROCm: para equipos con GPUs AMD RDNA4 que no pueden usar CUDA, esta es una de las pocas vias documentadas para ejecutar FLUX.1-schnell completo en GPU sin offload.
- Investigacion en cuantizacion: el repositorio incluye el runtime `prime_infer_runtime.py` y scripts de benchmark, lo que lo convierte en una referencia reproducible para estudiar el impacto de la cuantizacion 4-bit en modelos de difusion.

## Benchmarks y rendimiento

Resultados verificados por el autor en AMD RX 9060 XT de 16 GB con ROCm 7.2, a 1024×1024, 4 pasos y VAE BF16 con tileado a 512 px:

| Metrica | BF16 baseline (offload secuencial a CPU) | PRIME-Quant (`V3_P4_0`, sin offload) |
|---|---|---|
| Pesos comprimidos en disco | ~33,7 GB | 9,37 GB (2,68 GB T5-XXL + 6,69 GB MMDiT; 3,60× menor) |
| Cobertura de lineales cuantizadas | 0 / 671 | 671 / 671 (100 %) |
| Huella GPU residente total | No cabe en 16 GB | 9 493,5 MB |
| Pico de VRAM PyTorch (1024×1024) | 1 589,4 MB (swap por capa) | 11 005,8 MB |
| Tiempo en caliente por imagen | 19,92 s (181,38 s en frio) | 9,24 s (2,16× mas rapido) |
| Paridad en 6 prompts | Referencia | PSNR medio 18,94 dB / SSIM 0,7097 (hasta 23,88 dB / 0,8678) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que se trata de un modelo de generacion de imagenes y el autor solo reporta metricas de compresion, latencia y paridad visual.

## Requisitos de hardware

- VRAM estimada para inferencia: 9 493,5 MB residentes y 11 005,8 MB de pico a 1024×1024 con el pipeline completo en GPU.
- GPU recomendadas: AMD Radeon RX 9060 XT de 16 GB (verificado con ROCm 7.2) o RX 9070 XT; NVIDIA CUDA de 12-16 GB segun el autor.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB (y presumiblemente en 12 GB segun el autor, aunque el pico medido de 11 GB deja poco margen).
- Opciones de despliegue: runtime propio `run_flux_schnell_prime.py` y `prime_infer_runtime.py` incluidos en el repositorio; el autor indica que no se requieren repos adicionales. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a difusion).
- Latencia y throughput: 9,24 s por imagen en caliente a 1024×1024 en RX 9060 XT; 2,4 s para los cuatro pasos del MMDiT; 181,38 s en la primera generacion en frio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Huella | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX.1-schnell-PRIME-Quant | 12B MMDiT + 4,76B T5-XXL | 1024×1024 y multi-aspecto | 9,37 GB en disco, 11,01 GB pico VRAM | Bartsch personal-free + 5 % comercial | Hugging Face (repo de 9,4 GB) |
| FLUX.1-schnell (BF16 original) | 12B MMDiT + 4,76B T5-XXL | 1024×1024 y multi-aspecto | ~33,7 GB en disco; no cabe en 16 GB sin offload | Apache 2.0 | Hugging Face (Black Forest Labs) |
| FLUX.1-dev | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |
| Stable Diffusion 3 / SD3.5 | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

Solo se dispone de datos comparativos frente al propio modelo base en la informacion proporcionada; para el resto de alternativas del mismo segmento (FLUX.1-dev, SD3.5, etc.) no hay datos verificables en esta ficha.

## Limitaciones y advertencias

- Perdida de fidelidad visual medible: PSNR medio de 18,94 dB y SSIM de 0,7097 frente al teacher BF16; en el peor caso de la bateria de seis prompts la paridad baja a valores no especificados, y el propio autor reporta hasta 23,88 dB / 0,8678 en el mejor caso. No es una replicacion exacta del modelo original.
- La cuantizacion a 4 bits puede introducir artefactos en texturas finas, tipografia pequena o detalles de alta frecuencia; las pruebas de estres reportadas son cualitativas ("pasan limpiamente") sin metricas completas por caso.
- Licencia restrictiva: el checkpoint y el runtime estan bajo la licencia `bartsch-personal-free-5pct-commercial-v1.0`, que exige un reparto del 5 % de beneficios para uso comercial. Esto es incompatible con el uso comercial sin acuerdo, a diferencia del FLUX.1-schnell original (Apache 2.0). Es un caveat critico para produccion.
- El modelo base FLUX.1-schnell conserva su licencia Apache 2.0, pero la cuantizacion anade restricciones; conviene revisar el fichero LICENSE y el NOTICE antes de cualquier despliegue.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 27 de noviembre de 2026; no hay validacion independiente de los resultados por parte de terceros.
- Dependencia de un runtime propietario del autor (`prime_infer_runtime.py`); no hay integracion documentada con ecosistemas estandar como diffusers o ComfyUI, lo que limita la portabilidad.
- En AMD requiere ROCm 7.x y la variable `TORCH_ROCM_AOTRITON_ENABLE_EXPERIMENTAL=1` para SDPA; el soporte es experimental y puede presentar inestabilidad.
- No se documentan sesgos, cobertura idiomatica del prompt ni comportamiento con contenido sensible; el modelo hereda los sesgos del dataset de entrenamiento de FLUX.1-schnell, no detallado en la informacion disponible.
- Riesgo de alucinacion visual (elementos incoherentes o texto mal renderizado) inherente a los modelos de difusion; la cuantizacion puede agravarlo en prompts complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/batteryphil/FLUX.1-schnell-PRIME-Quant
- Modelo base FLUX.1-schnell: https://huggingface.co/black-forest-labs/FLUX.1-schnell
- Repositorio de componentes ligeros usado por el runtime (config, tokenizers, CLIP-L, VAE): https://huggingface.co/unsloth/FLUX.1-schnell
- Licencia del checkpoint: fichero `LICENSE` en el repositorio del modelo
- Atribucion del modelo base: fichero `NOTICE` en el repositorio del modelo
- Benchmarks y pruebas de estres: directorios `benchmarks/` y `benchmarks/stress/` del repositorio del modelo
- Paper, blog o demo oficiales: no disponibles en la informacion proporcionada
