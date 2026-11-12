# infosave/Lumina-Image-2.0cmf

## Resumen

Lumina-Image-2.0cmf es una distribución cuantizada del modelo de difusión texto-a-imagen Lumina-Image 2.0, desarrollado originalmente por Alpha-VLLM y empaquetado por el usuario infosave en el formato CMF (Cortiq Model Format). El modelo base Lumina-Image 2.0 es un transformer de difusión (DiT, Next-DiT) que genera imágenes a partir de descripciones textuales, e incluye el codificador de texto, el DiT y el VAE empaquetados en un único fichero de 3,27 GB.

La contribución principal de esta ficha no es la calidad de imagen, sino la portabilidad: sustituye la pila habitual de Python (torch + diffusers + CUDA) por un motor escrito íntegramente en Rust que no requiere ninguna dependencia en tiempo de ejecución. Los pesos se almacenan en cuantización de 4 bits, lo que reduce el espacio en disco de 19,8 GB a 3,27 GB y el pico de VRAM de 10,5 GB a 3,25 GB, a costa de una pérdida de fidelidad frente a la referencia y de una latencia mayor en hardware capaz de ejecutar la versión original.

Es relevante para entornos donde el despliegue es el cuello de botella: Apple Silicon sin CUDA, portátiles con poca VRAM, aplicaciones empaquetadas que no pueden arrastrar un entorno Python o máquinas sin conexión. En el momento de la publicación el repositorio registra 141 descargas y 1 me gusta, con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Next-DiT (transformer de difusión) sobre el modelo base Lumina-Image 2.0; motor de inferencia Cortiq (Rust) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen) |
| Tipos de cuantización | 4 bits (fichero `lumina-q4tp.cmf`); pesos GEMM ejecutados en f16 16×16 con acumulador f32 en unidades matriciales |
| Idiomas soportados | no disponible (la model card no documenta idiomas; el prompt de ejemplo está en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (Cortiq Model Format), fichero único de 3,27 GB |

## Arquitectura y entrenamiento

El modelo base utiliza una arquitectura Next-DiT: un transformer de difusión con normas tipo sandwich, atención con query grouping (24 cabezas de query sobre 8 de clave), rotación interleaved en la atención, residuos con puerta y feed-forward SwiGLU. El paquete CMF integra los tres componentes necesarios para inferir: codificador de texto, DiT y VAE, en un solo fichero. El motor Cortiq ejecuta un bloque Next-DiT completo por llamada al dispositivo: normas, productos q/k/v, atención agrupada con rotación, residuos y SwiGLU, manteniendo los pesos en el dispositivo en su códec de 4 bits.

No se proporcionan en la información disponible datos sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO). Respecto a la innovación técnica del empaquetado, la model card detalla las optimizaciones aplicadas en el motor: eliminación de la asignación de 300 MB de scratch en cada una de las 1560 llamadas por imagen, reorganización de las teselas GEMM en 16 floats por fila para evitar la serialización de bancos de memoria, atención paralelizada en lugar de una cabeza a la vez, y uso de matrices cooperativas f16 16×16 con acumulador f32, que llevó el kernel aislado de 5.605 a 50.730 GFLOP/s. El motor puede desactivar las unidades matriciales con `CMF_COOP=0`.

## Capacidades

- Generación de imágenes texto-a-imagen con resolución configurable (512×512 y 1024×1024 medidas; también 256×256 en Apple Silicon).
- Control de pasos de muestreo y escala CFG (configuración medida: 30 pasos, CFG 4).
- Semilla configurable para reproducibilidad (`--seed`).
- Inicialización determinista del ruido latente mediante `CMF_INIT_LATENT`, que permite comparaciones píxel a píxel con la referencia diffusers.
- Salida en formato P6 PPM, sin dependencias de librerías de imagen en el motor.
- Ejecución en GPU mediante backend CUDA (compilación opcional con `--features cuda`), Vulkan, DX12 y Metal.
- Ejecución en CPU forzable con `CMF_GPU=0`.
- No se documenta soporte de tool calling, agentes, visión de entrada, audio ni modo de razonamiento: es exclusivamente un modelo de generación de imágenes.

## Casos de uso

- Aplicaciones de escritorio empaquetadas: un binario Rust y un fichero de 3,27 GB sustituyen a un entorno Python con torch y diffusers, eliminando el coste de distribución y los problemas de versiones de CUDA en la máquina del usuario final.
- Despliegue en Apple Silicon sin CUDA: el backend Metal permite generar imágenes en un MacBook Air M4 fanless con 24 GB de RAM a 212 s por imagen de 512×512, sin acceso a CUDA.
- Equipos con VRAM limitada: con 3,25 GB de pico de VRAM cabe en portátiles y GPUs de gama media donde la referencia de 10,5 GB no entra; útil para estaciones de trabajo modestas.
- Entornos sin conexión y air-gapped: al no requerir instalación de dependencias ni descarga de paquetes en tiempo de ejecución, el binario y el fichero CMF son suficientes para operar de forma autónoma.
- Pipelines de generación por lotes en CPU: con 468 s por imagen a 48 hilos y un pico de RSS de 3,16 GB (frente a 20,6 GB de la referencia), permite ejecutar generación en servidores sin GPU y con memoria acotada.
- Generación de imágenes de baja resolución para previsualización o borradores: a 256×256 en Metal el tiempo baja a 67 s, adecuado para iterar prompts antes de un render final.
- Prototipado e investigación de cuantización: el par `CMF_INIT_LATENT` y la comparación documentada a 22,3 dB de PSNR facilitan estudiar el impacto de los pesos de 4 bits frente a bf16 con ruido inicial idéntico.

## Benchmarks y rendimiento

La model card no presenta resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros). En su lugar publica mediciones de rendimiento y fidelidad de imagen:

| Métrica | Este fichero (Cortiq) | Referencia (diffusers) |
|---|---|---|
| Fidelidad frente a referencia (512×512, misma semilla) | 22,3 dB PSNR (media de diferencia 11,8/255) | — |
| Render GPU, RTX PRO 6000 Blackwell (512×512, 30 pasos) | 14,7 s (Vulkan) | 2,2 s (CUDA, bf16) |
| Primera imagen incluyendo carga | 14,7 s | 11,8 s |
| Pico de VRAM | 3,25 GB | 10,5 GB |
| Render CPU, 48 hilos | 468 s | 158 s (fp32) |
| Pico de RSS en CPU | 3,16 GB | 20,6 GB |
| Espacio en disco | 3,27 GB | 19,8 GB |
| Dependencias en tiempo de ejecución | ninguna | torch + diffusers + CUDA |

Rendimiento del backend CUDA frente a Vulkan en RTX A5000 (24 GB), cortiq 0.8.79:

| Resolución | CUDA | Vulkan |
|---|---|---|
| 512 × 512 | 40,5 s | 55,4 s |
| 1024 × 1024 | 180,0 s | 252,7 s |

Rendimiento en Apple Silicon (MacBook Air M4, Metal, cortiq 0.5.57): 212 s a 512×512 y 67 s a 256×256. Fidelidad del camino con unidades matriciales: 22,5 dB frente a la referencia, y 40,7 dB del render CUDA respecto al de Vulkan.

## Requisitos de hardware

- VRAM estimada para inferencia: 3,25 GB de pico en GPU (medido en RTX PRO 6000 Blackwell); 3,16 GB de RSS en CPU.
- GPUs recomendadas: NVIDIA RTX A5000 (24 GB), NVIDIA RTX PRO 6000 Blackwell; funciona en cualquier GPU con Vulkan, DX12 o Metal.
- GPU de consumo: no se documenta explícitamente una RTX 4090 u otra consumer; cabe por VRAM en cualquier GPU con al menos ~4 GB libres, aunque no hay mediciones publicadas en esa clase.
- Apple Silicon: MacBook Air M4 (24 GB, fanless) con backend Metal; el render deja el uso de CPU en un 2 % de un núcleo.
- Despliegue: binario `cortiq-cli` (instalable con `cargo install cortiq-cli`, versión >= 0.5.57); backend CUDA opcional con `cargo install cortiq-cli --features cuda`, que requiere driver y librerías CUDA 12.x; no emplea vLLM, llama.cpp, Ollama ni TGI.
- Selección de backend: `CMF_GPU=cuda` fuerza CUDA, `CMF_GPU=0` fuerza CPU; `cortiq gpu` muestra el dispositivo detectado (si aparece `llvmpipe`, se está usando un driver software de Vulkan y el rendimiento será muy bajo).
- Latencia: 40,5 s por imagen de 512×512 en RTX A5000 con CUDA; 14,7 s en RTX PRO 6000; 180 s a 1024×1024 en RTX A5000; 468 s en CPU de 48 hilos.
- Espacio en disco: 3,27 GB para el fichero CMF.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución medida | VRAM pico | Disco | Licencia | Motor |
|---|---|---|---|---|---|---|
| Lumina-Image-2.0cmf (este) | no disponible (4 bits) | 512×512, 1024×1024 | 3,25 GB | 3,27 GB | Apache 2.0 | Cortiq (Rust) |
| Alpha-VLLM/Lumina-Image-2.0 (referencia) | no disponible | 512×512, 1024×1024 | 10,5 GB | 19,8 GB | Apache 2.0 | diffusers + torch |
| Otros modelos texto-a-imagen de 4 bits (p. ej. variantes GGUF de Flux/SDXL) | no disponible en esta información | no disponible | no disponible | no disponible | según modelo base | llama.cpp / ComfyUI |

Frente al modelo base sin cuantizar, este empaquetado reduce VRAM y disco en un factor aproximado de 3 y 6 respectivamente, con una pérdida de fidelidad de 22,3 dB de PSNR y una latencia GPU 6,7 veces mayor en RTX PRO 6000 y 3 veces mayor en CPU. No se dispone de datos de benchmarks de calidad de imagen frente a otros modelos de difusión en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de detalle por cuantización de 4 bits: la comparación con la referencia documenta diferencias en texturas finas (pelo, ramas, nieve) a 22,3 dB de PSNR, aunque la composición, la pose y la iluminación se mantienen.
- Latencia notablemente superior en hardware capaz de ejecutar la referencia: la propia model card recomienda ejecutar diffusers si la máquina soporta 20 GB de pesos y la pila de torch, ya que es más rápido.
- El backend CUDA no viene incluido en los binarios precompilados; requiere compilación desde fuente con el toolchain de Rust y las librerías CUDA 12.x.
- Riesgo de selección errónea de backend: si el cargador de Vulkan detecta `llvmpipe` (driver software), el rendimiento cae drásticamente sin aviso explícito.
- Salida en P6 PPM sin librería de imagen integrada: requiere conversión externa (`sips`, ImageMagick) en el flujo de trabajo.
- Idiomas soportados no documentados: no hay evidencia en la información disponible sobre la calidad de prompts en castellano u otros idiomas distintos del inglés.
- Sesgos y alucinaciones visuales: no se documentan análisis de sesgos del modelo base ni tasas de error; aplican los sesgos propios de los datasets de entrenamiento de Lumina-Image 2.0, no detallados aquí.
- Licencia Apache 2.0 permite uso comercial del empaquetado, pero conviene verificar las condiciones del modelo base Alpha-VLLM/Lumina-Image-2.0 por si añadieran restricciones adicionales.
- Repositorio de autor individual (infosave) con 141 descargas y 1 me gusta: menor escrutinio comunitario que el modelo base; validar el binario antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/infosave/Lumina-Image-2.0cmf
- Modelo base: https://huggingface.co/Alpha-VLLM/Lumina-Image-2.0
- Repositorio del motor CMF/Cortiq: https://github.com/infosave2007/cmf
