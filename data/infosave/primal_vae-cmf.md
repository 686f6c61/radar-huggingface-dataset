# infosave/primal_vae-cmf

## Resumen

Primal VAE — CMF es la conversión al formato CMF del autoencoder Primal VAE de Ostris, un codificador/decodificador convolucional determinista que comprime una imagen 2× en cada eje espacial para producir un latente de 1 o 2 canales con distribución aproximadamente normal estándar. El modelo original lo desarrolla Ostris; esta versión la publica el usuario `infosave` como un único fichero CMF ejecutable con `cortiq`, un motor de inferencia escrito en Rust que prescinde de Python y de frameworks de machine learning.

La relevancia de este paquete no está en el modelo en sí, sino en el formato y el runtime: permite ejecutar la codificación y decodificación completas en GPU (Vulkan/DX12 en NVIDIA, AMD e Intel, CUDA en NVIDIA, Metal en Apple Silicon) o en CPU, en una sola submission, sin dependencias de PyTorch. Con 80 millones de parámetros y ficheros de 161 MB, es un componente auxiliar para pipelines de difusión latente (Flux.1 y Flux.2) más que un modelo generativo autónomo.

El latente resultante es float32 con forma `[1, C, H/2, W/2]`, sin factores de escalado ni desplazamiento; aplicando `pixel_unshuffle` de 4 se obtiene la rejilla 8× de 16 canales (Flux.1) o 32 canales (Flux.2). La licencia es Apache-2.0, heredada del release original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autoencoder convolucional determinista (encoder/decoder) |
| Parámetros totales | 80 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantización | Pesos en 16 bits (kernels de convolución); biases y pesos de normalización en precisión exacta; empaquetado en CMF |
| Idiomas soportados | en, ru, zh (según metadatos de la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | CMF (fichero único); original en safetensors float32 |

## Arquitectura y entrenamiento

Se trata de un autoencoder convolucional determinista, sin componente variacional estocástico en la inferencia: la codificación de una misma imagen produce siempre el mismo latente. Comprime la imagen 2× espacialmente y proyecta a 1 canal (`primal_vae_2x1.cmf`, layout de 16 canales a 8× tras patchify 4, compatible con Flux.1) o a 2 canales (`primal_vae_2x2.cmf`, layout de 32 canales a 8×, compatible con Flux.2). Los valores latentes están ya en escala unitaria normal, de modo que no requieren factores de scaling/shift posteriores.

La información disponible no detalla el dataset de entrenamiento, el número de tokens/imágenes, ni si hubo fases de RLHF/DPO (no aplicables a un autoencoder). La innovación técnica destacable es el empaquetado: la conversión a CMF usa kernels de convolución de 16 bits manteniendo biases y pesos de normalización exactos, y el autor reporta que, frente al modelo float32 original en PyTorch sobre las mismas imágenes, las reconstrucciones coinciden en PSNR hasta 0,01 dB y los latentes difieren como máximo un 0,14 % de su rango.

## Capacidades

- Codificación de imagen a latente: entrada de imagen RGB, salida `.npy` float32 con forma `[1, C, H/2, W/2]` y distribución aproximadamente N(0, 1).
- Decodificación de latente a imagen: acepta `[1, C, h, w]` o `[C, h, w]`; el tamaño de imagen resultante es el del latente ×2.
- Roundtrip con métrica: el modo `roundtrip` reconstruye la imagen y reporta el PSNR.
- Dos variantes de layout latente: 1 canal (compatible con la rejilla 8× de 16 canales de Flux.1) y 2 canales (rejilla 8× de 32 canales de Flux.2), ambas mediante patchify 4.
- Ejecución en GPU en una sola submission: Vulkan/DX12 (NVIDIA, AMD, Intel), CUDA (NVIDIA) y Metal (Apple Silicon); fallback a CPU con `CMF_GPU=0`.
- Verificación de integridad mediante sumas SHA-256 publicadas para ambos ficheros.
- No soporta generación de texto, razonamiento, código, tool calling ni agentes: es exclusivamente un códec de imagen.

## Casos de uso

- Preprocesado en pipelines de difusión latente con Flux.1: codificar imágenes de entrenamiento o de referencia al latente de 1 canal y alimentar el modelo de difusión directamente, sin capa de escalado, gracias a que los valores ya son N(0, 1).
- Preprocesado para Flux.2: usar la variante de 2 canales y aplicar `pixel_unshuffle` de 4 para obtener la rejilla de 32 canales a 8× que espera el VAE de Flux.2.
- Servicios de reconstrucción y compresión de imagen: el roundtrip con PSNR de 37,5 dB en la imagen de referencia principal (variante 2×2) permite evaluar la pérdida de calidad antes de integrar el códec en un pipeline de almacenamiento o transmisión.
- Despliegue sin Python en producción: al ejecutarse con `cortiq` (binario Rust con builds para Linux, macOS y Windows), encaja en entornos donde instalar PyTorch o CUDA toolkit completo no es viable, incluyendo hosts con GPU AMD o Intel vía Vulkan.
- Inferencia en portátiles Apple Silicon: con Metal, 1024×1024 tarda 1,27 s en codificar y 1,23 s en decodificar en un M4, lo que permite prototipado local de pipelines de difusión sin GPU dedicada.
- Procesamiento por lotes en servidor: en una RTX A5000 con CUDA, 1024×1024 se codifica en 0,25 s y se decodifica en 0,12 s, adecuado para preprocesar datasets de imágenes antes de entrenar o hacer fine-tuning de modelos de difusión.
- Validación de latentes en investigación: la coincidencia reportada con el modelo float32 original (PSNR a 0,01 dB, latentes a 0,14 % del rango) permite usar esta versión como referencia reproducible sin depender de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor sí reporta PSNR de reconstrucción y latencias de ejecución:

| Métrica | `primal_vae_2x2.cmf` | `primal_vae_2x1.cmf` |
|---|---:|---:|
| PSNR imagen 1 (dB) | 37,5 | 32,1 |
| PSNR imagen 2 (dB) | 27,1 | 22,1 |
| PSNR imagen 3 (dB) | 27,4 | 21,3 |

| Dispositivo (runtime) | 512×512 encode / decode | 1024×1024 encode / decode |
|---|---:|---:|
| NVIDIA A40 (Vulkan, cortiq 0.8.51) | 0,20 s / 0,08 s | 0,40 s / 0,29 s |
| Apple M4 (Metal, cortiq 0.8.51) | 0,34 s / 0,32 s | 1,27 s / 1,23 s |
| CPU (host A40, cortiq 0.8.51) | 3,9 s / 3,6 s | 13,3 s / 12,6 s |
| NVIDIA RTX A5000 (CUDA, cortiq 0.8.84) | 0,13 s / 0,04 s | 0,25 s / 0,12 s |

## Comparativa con modelos similares

| Modelo | Parámetros | Compresión espacial | Canales latentes | Licencia | Runtime |
|---|---:|---|---|---|---|
| Primal VAE — CMF (esta ficha) | 80 M | 2× | 1 o 2 | Apache-2.0 | cortiq (Rust, Vulkan/CUDA/Metal/CPU) |
| Primal VAE original (ostris) | 80 M | 2× | 1 o 2 | Apache-2.0 | PyTorch (safetensors float32) |
| VAE de Flux.1 (referencia de layout) | no disponible | 8× | 16 (tras patchify) | no disponible | no disponible |
| VAE de Flux.2 (referencia de layout) | no disponible | 8× | 32 (tras patchify) | no disponible | no disponible |

La comparación con los VAE de Flux es únicamente de compatibilidad de layout latente; no se dispone de sus especificaciones de parámetros ni de sus resultados en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo ni de lenguaje: no produce texto, no razona y no soporta tool calling; cualquier expectativa en ese sentido es un error de categoría.
- Las dimensiones de la imagen de entrada deben ser múltiplos de 16; no se documenta comportamiento con otras resoluciones.
- La variante de 1 canal tiene una pérdida de calidad notablemente mayor (PSNR de 21,3 a 32,1 dB frente a 21,3–37,5 dB de la de 2 canales), por lo que la elección entre ambas debe hacerse según el layout del modelo de difusión objetivo y no solo por fidelidad.
- Solo se han validado tres imágenes en la model card; los PSNR reportados no constituyen una evaluación exhaustiva y pueden no generalizar a otros dominios (texto en imagen, ilustración, imágenes médicas, etc.).
- Requiere `cortiq` 0.8.51 o superior; el soporte CUDA exige compilar con `--features cuda` (disponible desde 0.8.84) y definir `CMF_GPU=cuda`. La dependencia de un runtime poco extendido es un riesgo de mantenimiento para producción.
- Aunque los metadatos declaran idiomas en, ru, zh, esto es irrelevante para un códec de imagen y no implica capacidades multilingües.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar la cadena de procedencia hasta `ostris/primal_vae` y los pesos base antes de redistribuir.
- El autor no documenta sesgos, tasas de alucinación (no aplicables) ni comportamiento con imágenes corruptas o fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/primal_vae-cmf
- Modelo base: https://huggingface.co/ostris/primal_vae
- Repositorio CMF: https://github.com/infosave2007/cmf
- Binarios de `cortiq` (releases): https://github.com/infosave2007/cmf/releases
