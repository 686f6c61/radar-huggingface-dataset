# infosave/primal_vae-cmf

## Resumen

Primal VAE — CMF es una conversión del autoencoder determinista [ostris/primal_vae](https://huggingface.co/ostris/primal_vae) al formato CMF, un contenedor de pesos de un solo archivo diseñado para el motor de inferencia `cortiq`, escrito en Rust y sin dependencias de Python ni de frameworks de aprendizaje automático. El modelo original es un autoencoder convolucional que comprime una imagen 2× en el plano espacial y produce un latente de 1 o 2 canales con distribución aproximadamente normal estándar, sin factores de escala ni desplazamiento; aplicando un patchify de factor 4 se obtiene la rejilla de 16 o 32 canales a 8× que usan los VAE de Flux.1 y Flux.2.

La relevancia de esta ficha no está en el modelo en sí, sino en el empaquetado: los dos ficheros CMF (`primal_vae_2x2.cmf` y `primal_vae_2x1.cmf`) permiten ejecutar la codificación y decodificación completas en GPU mediante Vulkan o DX12 en NVIDIA, AMD e Intel, o Metal en Apple Silicon, con una única submission, o bien en CPU. Según la model card, las reconstrucciones conservan el PSNR del modelo original en float32 hasta 0,01 dB y los latentes difieren como máximo un 0,14 % de su rango.

El repositorio ocupa 0,3 GB y contiene dos ficheros de 161 MB cada uno, ambos derivados de la misma red de 80 millones de parámetros con kernels de convolución en 16 bits y sesgos y pesos de normalización exactos. La licencia es Apache-2.0, heredada del release original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder convolucional determinista (no generativo) |
| Parametros totales | 80 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | Kernels de convolución en 16 bits; sesgos y pesos de normalización en precisión exacta. No se documentan otros esquemas |
| Idiomas soportados | en, ru, zh (etiquetas de la model card; el modelo no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | CMF (un fichero por variante); pesos originales en safetensors |

## Arquitectura y entrenamiento

El modelo es un autoencoder convolucional determinista, no un transformer ni un modelo de difusión. Comprime la imagen 2× espacialmente y proyecta a un latente de 1 canal (variante `2x1`, compatible con la disposición de 16 canales a 8× de Flux.1 tras patchify 4) o de 2 canales (variante `2x2`, compatible con la disposición de 32 canales a 8× de Flux.2). Los valores del latente son ya unit normal, sin factor de escala ni desplazamiento posterior, lo que simplifica su uso directo como entrada de un modelo de difusión.

La información disponible no detalla el dataset de entrenamiento, el número de tokens ni si hubo fases de RLHF o DPO; estos datos corresponden al modelo original `ostris/primal_vae` y no se reproducen en la model card de esta conversión. La innovación técnica del paquete CMF es la ejecución completa del encode o decode en una sola submission a la GPU mediante `cortiq`, con kernels de convolución en 16 bits que, según el autor, mantienen el PSNR del modelo float32 original con una desviación máxima de 0,01 dB y una diferencia de latentes de hasta el 0,14 % del rango.

## Capacidades

- Codificación de imágenes a latentes: `cortiq vae --mode encode` produce un `.npy` float32 de forma `[1, C, H/2, W/2]` con distribución aproximadamente N(0, 1) por imagen y canal.
- Decodificación de latentes a imagen: `--mode decode` acepta `[1, C, h, w]` o `[C, h, w]` y devuelve una imagen del doble de tamaño.
- Roundtrip con métrica: `--mode roundtrip` reconstruye la imagen y reporta el PSNR.
- Compatibilidad con pipelines de difusión: el latente se puede alimentar directamente a un modelo de difusión o aplicar `pixel_unshuffle` de factor 4 para la rejilla de 8×.
- Ejecución en GPU sin Python: Vulkan/DX12 en NVIDIA, AMD e Intel; Metal en Apple Silicon; fallback a CPU con `CMF_GPU=0`.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un códec de imágenes.

## Casos de uso

- Preprocesado para pipelines de difusión latente: codificar imágenes de entrada con `primal_vae_2x2.cmf` para obtener latentes N(0, 1) directamente consumibles por un modelo de difusión con disposición Flux.2, sin capa de escalado intermedia.
- Reconstrucción y validación de latentes: usar `--mode roundtrip` para medir el PSNR de una imagen tras codificar y decodificar, útil como test de integridad en un pipeline de entrenamiento o de inferencia.
- Despliegue en entornos sin Python: el motor `cortiq` es un binario Rust, por lo que el códec se puede integrar en servicios compilados, contenedores mínimos o sistemas embebidos donde no se quiere arrastrar PyTorch.
- Inferencia en hardware heterogéneo: al soportar Vulkan, DX12 y Metal, el mismo fichero CMF funciona en estaciones con GPU NVIDIA, AMD o Intel y en portátiles Apple Silicon, lo que simplifica la distribución de herramientas de conversión de imágenes.
- Procesamiento por lotes de imágenes de alta resolución: con 0,40 s de encode y 0,29 s de decode a 1024×1024 en una A40, es viable procesar lotes grandes en pipelines offline de preparación de datasets.
- Extracción de representaciones latentes para análisis: los latentes de 1 o 2 canales a 2× sirven como representación compacta y normalizada para tareas de comparación, búsqueda o estudio de la geometría del espacio latente de los VAE de Flux.

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros); al ser un códec de imágenes, esos benchmarks no aplican. Sí se documentan métricas de reconstrucción y latencias:

| Metrica | Valor |
|---|---|
| PSNR `primal_vae_2x2.cmf` (tres imágenes de la card) | 37,5 / 27,1 / 27,4 dB |
| PSNR `primal_vae_2x1.cmf` (tres imágenes de la card) | 32,1 / 22,1 / 21,3 dB |
| Desviación de PSNR frente al original float32 en PyTorch | ≤ 0,01 dB |
| Diferencia de latentes frente al original | ≤ 0,14 % del rango |

| Dispositivo | 512×512 encode / decode | 1024×1024 encode / decode |
|---|---:|---:|
| NVIDIA A40 (Vulkan) | 0,20 s / 0,08 s | 0,40 s / 0,29 s |
| Apple M4 (Metal) | 0,34 s / 0,32 s | 1,27 s / 1,23 s |
| CPU (host de la A40) | 3,9 s / 3,6 s | 13,3 s / 12,6 s |

## Requisitos de hardware

- VRAM estimada: no se documenta de forma explícita; el fichero pesa 161 MB y la red tiene 80 M de parámetros, por lo que la huella de pesos es de aproximadamente 160 MB en 16 bits. La VRAM adicional depende de las activaciones, que escalan con la resolución de entrada.
- GPU recomendadas: NVIDIA A40 (medida en la card); cualquier GPU con soporte Vulkan o DX12 de NVIDIA, AMD o Intel; Apple Silicon con Metal (medido en M4).
- GPU de consumo: no se publican mediciones en RTX 4090, RTX 3090 u otras GPU de consumo, pero por tamaño de pesos (161 MB) y resolución típica el modelo debería caber holgadamente en cualquier GPU de consumo con varios GB de VRAM. No hay cifras verificadas en la información disponible.
- Opciones de despliegue: `cortiq` 0.8.51 o superior, instalable con `cargo install cortiq-cli` o mediante binarios precompilados para Linux, macOS y Windows en la página de releases del repositorio CMF. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: ver tabla de la sección anterior. Las imágenes deben tener lados múltiplos de 16.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros VAE en la información proporcionada. La comparación cualitativa con el modelo de origen es la siguiente:

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| `infosave/primal_vae-cmf` (esta ficha) | 80 M | CMF, 161 MB por variante | Apache-2.0 | Ejecución en Rust sin Python; Vulkan/DX12/Metal |
| `ostris/primal_vae` | 80 M | safetensors, float32 | Apache-2.0 | Modelo original en PyTorch; referencia de PSNR |
| VAE de Flux.1 / Flux.2 | no disponible | no disponible | no disponible | Compatible a nivel de disposición de latente tras patchify 4; sin datos de comparación en la información disponible |

## Limitaciones y advertencias

- No es un modelo generativo ni de texto: no genera imágenes desde cero, no razona y no procesa lenguaje; su única función es codificar y decodificar imágenes.
- Restricción de tamaño de entrada: los lados de la imagen deben ser múltiplos de 16; no se documenta comportamiento con otras resoluciones.
- Dependencia de herramienta: requiere `cortiq` 0.8.51 o superior; no se puede cargar con PyTorch, diffusers u otros frameworks sin reconvertir los pesos.
- Pérdida de fidelidad: aunque el PSNR se mantiene dentro de 0,01 dB respecto al original, la reconstrucción no es perfecta; los PSNR de 21–27 dB en dos de las tres imágenes de la card indican pérdida apreciable en contenido complejo.
- Sesgos: no se documentan sesgos específicos; al ser un códec determinista, el riesgo de alucinación no aplica en el sentido habitual, pero sí puede amplificar artefactos presentes en la imagen de entrada.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y de cualquier modelo de difusión con el que se combine.
- Idiomas: las etiquetas en, ru, zh son metadatos de la card y no implican capacidad de procesamiento de texto.
- No se documentan resultados de benchmarks estándar ni comparativas cuantitativas con otros VAE.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/infosave/primal_vae-cmf)
- [Modelo base ostris/primal_vae](https://huggingface.co/ostris/primal_vae)
- [Repositorio CMF](https://github.com/infosave2007/cmf)
- [Página de releases de cortiq](https://github.com/infosave2007/cmf/releases)
