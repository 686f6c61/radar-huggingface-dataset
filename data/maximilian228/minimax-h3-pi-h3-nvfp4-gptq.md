# Maximilian228/MiniMax-H3-pi-H3-NVFP4-GPTQ

## Resumen

MiniMax-H3-pi-H3-NVFP4-GPTQ es un paquete de pesos cuantizados para ComfyUI que permite ejecutar el modelo de generación de vídeo y audio MiniMax H3 con la destilación de 4 pasos pi-H3 en GPUs NVIDIA de la serie RTX 50 (arquitectura Blackwell, sm_120). No se trata de un modelo entrenado desde cero, sino de una derivación cuantizada de MiniMaxAI/MiniMax-H3 con el adaptador pi-H3 de Lakonik/Hansheng Chen fusionado, publicada por el usuario Maximilian228.

El paquete incluye tres artefactos: el DiT FL2VA cuantizado en NVFP4/INT8 con GPTQ (14,3 GB), la cabeza DWD del adaptador pi-H3 en INT8 (0,6 GB) y el codificador de texto basado en Qwen3-VL-32B en NVFP4 (16,4 GB). Los VAE de vídeo y audio se toman sin modificar del repositorio Comfy-Org/MiniMax-H3. El objetivo es reducir el coste computacional de la inferencia manteniendo la fidelidad respecto al modelo BF16 de referencia.

Su relevancia radica en que, según las mediciones del autor, permite generar clips de 5 segundos a 1344x768 y 24 fps con audio en aproximadamente 12,5 segundos en una RTX 5090, frente a los 37-41 segundos del DiT BF16. La licencia es la MiniMax H3 Community License Agreement, con restricciones territoriales explícitas (no se aplica en la Unión Europea, Reino Unido, Corea del Sur ni Estados Unidos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) FL2VA con adaptador pi-H3 fusionado; codificador de texto Qwen3-VL-32B; VAE de vídeo y audio separados |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (qkv, out, fc1), INT8 ConvRot W8A8 (fc2), NVFP4 W4A16 en el codificador de texto, INT8 ConvRot en la cabeza DWD |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (Model Derivatives de MiniMax H3) |
| Formato de pesos | safetensors (con metadatos `modified_notice`) |

## Arquitectura y entrenamiento

El componente principal es un DiT de difusión (FL2VA) al que se le ha fusionado el adaptador de destilación pi-H3 de 4 pasos, lo que reduce el número de pasos de muestreo necesarios para generar un clip. La cuantización se realizó con GPTQ partiendo de los pesos BF16 originales, no de un modelo ya cuantizado: se recogieron las matrices Hessianas (X^T X de cada entrada lineal) sobre los 4 pasos reales de muestreo de pi-H3 con 16 clips de 5 segundos, y después se cuantizaron los pesos columna a columna con compensación de error.

La mezcla de formatos es deliberada: fc2 recibe la salida de SwiGLU con valores atípicos grandes, donde NVFP4 mostraba un error de salida de 10 a 14 veces superior al de INT8 ConvRot (0,039-0,052 frente a 0,0028-0,0056) a la misma velocidad, por lo que fc2 se mantiene en INT8. Las capas que Comfy-Org conservó en BF16 en su release INT8 también permanecen en BF16 aquí. El codificador de texto usa pesos NVFP4 con GPTQ y se ejecuta como W4A16; la cabeza DWD se cuantizó a INT8 ConvRot desde el adaptador BF16 con un error de salida de 0,0010.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con resolución de 1344x768 y 24 fps.
- Generación de vídeo a partir de imagen (image-to-video), según la pipeline declarada y las etiquetas del repositorio.
- Generación de audio sincronizado con el vídeo, mediante el VAE de audio incluido.
- Muestreo en 4 pasos gracias al adaptador pi-H3 fusionado en el DiT.
- Control de calidad mediante el schedule top-k de Spark-H3 (top-k 0,05 en pasos 1-2 y 0,10 en pasos 3-4 en el flujo de producción).
- Codificación de prompts con un codificador Qwen3-VL-32B cuantizado, lo que aporta capacidad de comprensión multimodal de la entrada.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; es un modelo generativo de vídeo, no un LLM de propósito general.

## Casos de uso

- Generación rápida de clips publicitarios cortos: con ~12,5 s para 5 segundos de vídeo a 1344x768 en una RTX 5090, se pueden iterar variaciones de un anuncio en minutos dentro de ComfyUI.
- Prototipado de storyboards animados: la modalidad image-to-video permite partir de un fotograma clave y generar el movimiento, útil para previsualizar secuencias antes de producirlas.
- Creación de contenido para redes sociales con audio integrado: el VAE de audio evita un paso separado de sonorización en clips de 5 a 30 segundos.
- Generación de material de stock sintético: clips de hasta 30 segundos (~170 s de cómputo en RTX 5090) para bancos de imágenes o vídeos de prueba.
- Investigación en cuantización de modelos de difusión: el paquete incluye métricas de error por paso y comparativas NVFP4 frente a INT8, lo que lo convierte en un caso de estudio reproducible de GPTQ sobre DiT.
- Docencia y demostraciones de generación de vídeo en local: un instalador único configura ComfyUI v0.46.3, PyTorch 2.13 con CUDA 13.0, Triton y los nodos personalizados, lo que simplifica el despliegue en aulas con GPUs Blackwell.
- Evaluación de calidad frente a BF16: el modo teacher forcing descrito permite comparar paso a paso la salida cuantizada con la de referencia, útil en pipelines de validación de modelos cuantizados.

## Benchmarks y rendimiento

El autor publica métricas de velocidad y de fidelidad respecto a BF16, no benchmarks estándar de generación de vídeo (FVD, CLIP score, etc.).

Velocidad en RTX 5090 (32 GB), 1344x768, 24 fps, con audio, 4 pasos, en caliente:

| Configuracion | Clip de 5 s | Clip de 10 s |
|---|---|---|
| pi-H3 4 pasos sobre DiT BF16 (referencia, con offload parcial) | 37-41 s | 81-89 s |
| pi-H3 4 pasos, DiT INT8 ConvRot + Spark-H3 top-k 0,20 | no disponible | 45-50 s |
| Este paquete: DiT NVFP4 GPTQ + kernels fusionados + schedule top-k | ~12,5 s | ~27,5 s |

Fidelidad frente a BF16 con teacher forcing (error relativo por paso y PSNR de los píxeles DWD finales, clips de 5 s a 1344x768, dos prompts):

| Configuracion | Paso 1 | Paso 2 | Paso 3 | Paso 4 | Pixels vs BF16 |
|---|---|---|---|---|---|
| BF16 vs BF16 (suelo de ruido) | 0 | 0,30 | 0,14 | 0,10 | 33,4 dB |
| Primera version: NVFP4 GPTQ con Hessianas del modelo INT8 | 0,74 | 0,37 | 0,21 | 0,13 | 31,4 dB |
| Este DiT, Spark top-k 0,20 | 0,53 | 0,33 | 0,20 | 0,13 | 31,7 dB |
| Este DiT, Spark top-k 0,10 | 0,58 | 0,36 | 0,21 | 0,14 | 30,5 dB |

Codificador de texto (estado oculto de la capa 50 frente a BF16, 42 prompts H3 reservados): L2 relativa 0,023 y coseno 0,9992 para este archivo, frente a 0,141 y 0,9962 del NVFP4 AWQ oficial.

## Requisitos de hardware

- GPU obligatoria de la serie RTX 50 (Blackwell, sm_120) con núcleos tensoriales NVFP4; el autor probó con 32 GB de VRAM (RTX 5090).
- Controlador con CUDA 13.0 o superior.
- VRAM estimada: el conjunto de pesos suma unos 31,3 GB (14,3 + 0,6 + 16,4 GB), más los VAE y las activaciones; se probó con 32 GB.
- No cabe en GPUs de consumo de generaciones anteriores (RTX 30/40) por falta de soporte NVFP4 nativo en sm_120.
- Despliegue mediante ComfyUI v0.46.3 con los nodos ComfyUI-piFlow, ComfyUI-Spark-H3 0.2.0 y ComfyUI-MiniMax-H3-pi-H3-NVFP4.
- Latencia: ~12,5 s para 5 s de clip y ~27,5 s para 10 s en RTX 5090; ~80 s para 20 s y ~170 s para 30 s.
- La primera ejecución con una nueva longitud de clip compila kernels Triton (5-60 s); un prompt nuevo reejecuta el codificador de texto (+~3 s).
- No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI; el paquete está orientado exclusivamente a ComfyUI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Velocidad (5 s, 1344x768) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-pi-H3-NVFP4-GPTQ (este) | no disponible | no disponible | ~12,5 s en RTX 5090 | MiniMax H3 Community License (excluye UE, RU, Corea del Sur y EE. UU.) | Hugging Face, ComfyUI |
| MiniMax H3 + pi-H3 en BF16 | no disponible | no disponible | 37-41 s en RTX 5090 (con offload parcial) | MiniMax H3 Community License | Hugging Face (MiniMaxAI, Lakonik) |
| MiniMax H3 + pi-H3 INT8 ConvRot | no disponible | no disponible | 45-50 s para 10 s en RTX 5090 | MiniMax H3 Community License | Hugging Face (Comfy-Org, Lakonik) |
| MiniMax H3 NVFP4 AWQ oficial (codificador de texto) | no disponible | no disponible | no disponible | MiniMax H3 Community License | Hugging Face |

No se dispone de datos de benchmarks estándar de generación de vídeo para comparar con otros modelos de la categoría (Sora, Veo, Kling, etc.) en la información proporcionada.

## Limitaciones y advertencias

- Restricción territorial severa: la licencia no se aplica en la Unión Europea, el Reino Unido, Corea del Sur ni Estados Unidos, lo que impide su uso legal en España sin revisión jurídica adicional.
- Obligación de divulgar que el contenido es generado por máquina cuando se publique, según la Acceptable Use Policy (Exhibit A) de la licencia.
- Requiere hardware muy específico: solo GPUs Blackwell (RTX 50) con CUDA 13.0 o superior; no funciona en generaciones anteriores.
- Dependencia de un stack frágil y muy concreto: ComfyUI v0.46.3, PyTorch 2.13, Triton, ComfyUI-piFlow, ComfyUI-Spark-H3 0.2.0 y el instalador de terceros.
- El paquete está pensado para 4 pasos exactos; usar otro número de pasos invalida el adaptador fusionado.
- La cabeza DWD debe cargarse en el slot del adaptador pi-H3, no el adaptador completo; un uso incorrecto degrada la calidad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, publicado por un autor individual: no hay validación comunitaria independiente de las métricas declaradas.
- Riesgo de sesgos y alucinaciones visuales inherente a los modelos de difusión, no evaluado en la información disponible.
- Diferencias frente a BF16 concentradas en detalle fino (PSNR de 31,7 dB con top-k 0,20 y 30,5 dB con top-k 0,10); no es una reproducción bit a bit.
- No se documentan idiomas soportados ni límites de longitud de prompt.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Maximilian228/MiniMax-H3-pi-H3-NVFP4-GPTQ
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Adaptador pi-H3: https://huggingface.co/Lakonik/pi-H3
- Repackaging ComfyUI y VAE: https://huggingface.co/Comfy-Org/MiniMax-H3
- Instalador y workflow: https://github.com/sergqwer/ComfyUI-MiniMax-H3-pi-H3-NVFP4
- Nodos ComfyUI-piFlow: https://github.com/Lakonik/ComfyUI-piFlow
- Nodos ComfyUI-Spark-H3: https://github.com/zechengtang/Spark-H3
- Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
