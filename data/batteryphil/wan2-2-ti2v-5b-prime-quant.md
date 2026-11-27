# batteryphil/Wan2.2-TI2V-5B-PRIME-Quant

## Resumen

Wan2.2-TI2V-5B-PRIME-Quant es una cuantización a 4 bits del modelo de generación de vídeo Wan-AI/Wan2.2-TI2V-5B-Diffusers, publicada por el usuario batteryphil bajo la técnica PRIME-Quant. El modelo base, desarrollado por Wan-AI (Alibaba Tongyi Lab), es un sistema de difusión que soporta tanto texto-a-vídeo (T2V) como imagen-a-vídeo (I2V) mediante una arquitectura 3D DiT de 5.000 millones de parámetros combinada con un codificador de texto UMT5-XXL de 5.680 millones. Esta versión cuantizada comprime el stack completo de aproximadamente 21,4 GB en BF16 a 6,01 GB en disco, una reducción de 3,56 veces.

La relevancia de esta ficha radica en que permite ejecutar un modelo de vídeo de 5B en una única GPU de consumo de 12-16 GB, con residencia completa en VRAM y sin offload a CPU. Según los datos del autor, el footprint GPU residente es de 7,27 GB y el pico de VRAM con VAE tileado en BF16 alcanza 9,73 GB a resolución 832×480 y 33 frames. La cuantización cubre el 100% de los pesos (476 de 476 módulos), incluyendo el embedding de vocabulario de UMT5-XXL.

El modelo se distribuye con un runtime propio (run_wan22_prime.py y prime_infer_runtime.py) y está pensado para GPUs AMD con ROCm o NVIDIA con CUDA. La licencia del checkpoint cuantizado es propietaria (Bartsch Personal-Free & 5% Commercial Profit-Share License v1.0), mientras que el modelo base upstream es Apache 2.0. Esta ficha se basa exclusivamente en la información publicada por el autor; los datos de rendimiento no han sido verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión 3D DiT (WanTransformer3DModel, 30 bloques) + codificador de texto UMT5-XXL (24 bloques) + VAE AutoencoderKLWan |
| Parametros totales | 5.000 millones (DiT) + 5.680 millones (UMT5-XXL); total aproximado 10.680 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión de vídeo; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | 4 bits PRIME-Quant V3_P4_0 (codebook armónico primo, grupo 32); pesos BF16 para VAE |
| Idiomas soportados | no disponible |
| Licencia | bartsch-personal-free-5pct-commercial-v1.0 (checkpoint cuantizado); modelo base Apache 2.0 |
| Formato de pesos | no disponible (runtime propio PRIME-Quant; el repo ocupa 6,0 GB) |

## Arquitectura y entrenamiento

El modelo base Wan2.2-TI2V-5B emplea una arquitectura de difusión con un transformer 3D (DiT) de 5.000 millones de parámetros para la generación de vídeo, acoplado a un codificador de texto UMT5-XXL de 5.680 millones de parámetros y a un VAE AutoencoderKLWan para la codificación y decodificación de fotogramas. Esta versión PRIME-Quant no reentrena el modelo: aplica una cuantización post-entrenamiento a 4 bits sobre el 100% de los pesos, incluyendo el embedding compartido de vocabulario de UMT5-XXL de dimensiones [256384, 4096].

La innovación técnica principal es el esquema PRIME-Quant V3_P4_0, que combina un codebook armónico primo con grupo de 32 y rotaciones Walsh-Hadamard exactas de orden H_64 y H_128 en las proyecciones de atención (sa.v ↔ sa.o en los 24 bloques de UMT5-XXL y to_v ↔ to_out.0 en autoatención y atención cruzada de los 30 bloques del DiT). Además, se calibra un time_embedder anclado al fotograma 0 con 4.096 pasos temporales que alcanza 53,72 dB de SNR, y un text_embedder coadaptado mediante Kronecker PRIMAL que mapea el UMT5-XXL cuantizado sobre el text_embedder del profesor BF16. El autor reporta un SNR medio de pesos de 22,58 dB (suelo de 22,15 dB) en los 30 bloques del DiT 3D. No se dispone de información sobre el dataset de entrenamiento original del modelo base ni sobre procesos de RLHF o DPO en esta información.

## Capacidades

- Generación de vídeo a partir de texto (T2V): produce clips de hasta 33 frames a 16 fps con resoluciones configurables como 832×480.
- Generación de vídeo a partir de imagen (I2V): anima un fotograma inicial manteniendo el anclaje del frame 0 con 99,9 dB de PSNR y 1,0000 de SSIM según el autor.
- Control de generación mediante prompts textuales detallados, pasos de inferencia (24 en los benchmarks) y escala CFG (5,0 en los benchmarks).
- Reproducibilidad mediante semilla (seed) configurable.
- Ejecución 100% en GPU sin offload a CPU, con residencia completa de UMT5-XXL, DiT y VAE en VRAM.
- Compatibilidad con GPUs AMD ROCm y NVIDIA CUDA.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, audio ni thinking mode, al tratarse de un modelo generativo de vídeo.

## Casos de uso

- Generación de clips publicitarios cortos: el modelo puede producir vídeos de 33 frames a 832×480 a partir de un prompt descriptivo, adecuado para prototipos rápidos de anuncios o stories en redes sociales sin infraestructura de datacenter.
- Animación de fotografías de producto: mediante I2V, se puede animar un fotograma estático de un producto con movimiento sutil de cámara o del sujeto, manteniendo el anclaje del primer frame gracias al calibrado del time_embedder a 53,72 dB de SNR.
- Previsualización de storyboards: directores y equipos de arte pueden convertir bocetos o frames clave en clips animados de bajo coste en una GPU de consumo, acelerando la iteración creativa antes de producir con modelos mayores.
- Investigación en cuantización de modelos de difusión: el checkpoint sirve como referencia reproducible para estudiar el impacto del esquema PRIME-Quant V3_P4_0 en la calidad visual, con métricas publicadas de PSNR y SSIM frente al profesor BF16.
- Despliegue en estaciones de trabajo con GPU AMD: al soportar ROCm 7.2, permite ejecutar generación de vídeo en hardware AMD de consumo (por ejemplo, RX 9060 XT de 16 GB) sin depender de CUDA.
- Prototipado de pipelines T2V/I2V en local: el runtime standalone run_wan22_prime.py descarga solo tokenizer, config, scheduler y VAE, evitando los 21,4 GB de pesos BF16, lo que facilita entornos de desarrollo con ancho de banda limitado.
- Educación y demos: al caber en 12-16 GB de VRAM, permite montar demostraciones interactivas de generación de vídeo en portátiles o equipos de laboratorio con una sola GPU.

## Benchmarks y rendimiento

Los datos siguientes proceden exclusivamente de las mediciones publicadas por el autor en una AMD RX 9060 XT de 16 GB con ROCm 7.2, a 832×480, 33 frames, 16 fps, 24 pasos y CFG 5,0, con VAE tileado en BF16 idéntico en ambas configuraciones. No han sido verificados de forma independiente.

| Metrica | BF16 (offload a CPU) | PRIME-Quant (sin offload) |
|---|---|---|
| Pesos comprimidos en disco | ~21,4 GB | 6,01 GB (3,56× menor) |
| Cobertura de cuantización | 0 / 476 | 476 / 476 (100%) |
| Footprint GPU residente | no cabe en 16 GB | 7.265,2 MB |
| Pico de VRAM PyTorch (832×480, 33f) | 11.076,4 MB | 9.730,1 MB |
| Tiempo medio T2V (33f, 24 pasos) | 101,25 s | 88,07 s (1,15× más rápido) |
| Tiempo I2V (33f, 24 pasos) | 257,41 s | 88,49 s (2,91× más rápido) |
| Paridad frame 0 en I2V | referencia | 99,9 dB PSNR / 1,0000 SSIM |
| Paridad en los 33 frames (I2V) | referencia | 29,37 dB PSNR medio / 0,9849 SSIM medio |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: 7,27 GB residentes (UMT5-XXL + DiT 5B + VAE) y 9,73 GB de pico con VAE tileado en BF16 a 832×480 y 33 frames.
- GPU recomendadas: una única GPU de 12-16 GB; el autor verifica en AMD RX 9060 XT 16 GB con ROCm 7.2. No se especifican modelos NVIDIA concretos, aunque el autor indica compatibilidad CUDA.
- Cabe en GPU de consumo: sí, en GPUs de 12-16 GB de VRAM; no cabe en GPUs de 8 GB según los picos reportados.
- Opciones de despliegue: runtime propio PRIME-Quant (run_wan22_prime.py y prime_infer_runtime.py); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al ser un modelo de difusión de vídeo.
- Latencia y throughput: 88,07 s para T2V y 88,49 s para I2V en las condiciones de benchmark indicadas; el VAE tileado en BF16 consume 4,07 GB de pico y 29,5 s frente a 10,46 GB sin tilear en ROCm 7.2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| Wan2.2-TI2V-5B-PRIME-Quant (este) | 5,0B DiT + 5,68B UMT5-XXL, cuantizado a 4 bits | 832×480, 33 frames, 16 fps | bartsch-personal-free-5pct-commercial-v1.0 | Hugging Face, 0 descargas |
| Wan-AI/Wan2.2-TI2V-5B-Diffusers (base) | 5,0B DiT + 5,68B UMT5-XXL en BF16 | 832×480, 33 frames, 16 fps | Apache 2.0 | Hugging Face |
| Otras cuantizaciones de vídeo de la familia Wan | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento de modelos alternativos comparables, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Los benchmarks proceden de una única GPU (AMD RX 9060 XT 16 GB, ROCm 7.2) y no han sido replicados de forma independiente; el rendimiento en otras GPUs puede diferir.
- La licencia del checkpoint cuantizado es propietaria (Bartsch Personal-Free & 5% Commercial Profit-Share License v1.0): es gratuita para uso personal, investigación, académico y sin ánimo de lucro, pero el uso comercial está sujeto a un reparto del 5% de beneficios, según el nombre de la licencia.
- El modelo base upstream es Apache 2.0, pero la cuantización añade restricciones adicionales; conviene revisar el archivo LICENSE y el NOTICE antes de cualquier despliegue.
- Riesgo de artefactos visuales y de deriva temporal inherente a la cuantización a 4 bits: la paridad media con el profesor BF16 es de 29,37 dB PSNR y 0,9849 SSIM, no una igualdad exacta.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación por parte de la comunidad.
- No se documentan sesgos conocidos, idiomas soportados ni limitaciones de contexto textual en la información disponible.
- El modelo requiere un runtime propio (run_wan22_prime.py); no se documenta integración con ecosistemas estándar como diffusers para la inferencia cuantizada.
- El VAE debe mantenerse tileado y en BF16 para no exceder la VRAM en GPUs de 16 GB (10,46 GB sin tilear frente a 4,07 GB con tileado).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/batteryphil/Wan2.2-TI2V-5B-PRIME-Quant
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
- Licencia del checkpoint: https://huggingface.co/batteryphil/Wan2.2-TI2V-5B-PRIME-Quant/blob/main/LICENSE
- Aviso de atribución upstream: https://huggingface.co/batteryphil/Wan2.2-TI2V-5B-PRIME-Quant/blob/main/NOTICE
- Benchmarks del autor: https://huggingface.co/batteryphil/Wan2.2-TI2V-5B-PRIME-Quant/tree/main/benchmarks
