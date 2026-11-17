# LiqunMa/speed

## Resumen

`LiqunMa/speed` es un paquete de pesos cuantizados de post-entrenamiento para los transformadores (DiT) de dos modelos de generación de vídeo texto-a-vídeo: Wan2.1-T2V-1.3B (Wan-AI) y CogVideoX-2B (THUDM). La cuantización aplicada es GRID W2A4 en formato NVFP4: pesos de 2 bits y activaciones de 4 bits, empaquetados de forma que cada capa lineal cuantizada se ejecuta como una GEMM NVFP4 nativa sobre tensor cores Blackwell. El autor es LiqunMa y el repositorio ocupa 2,3 GB.

El interés del artefacto es práctico: no se distribuye un modelo nuevo, sino un conjunto de pesos y un runtime (`grid_nvfp4.py`) que sustituye las capas lineales del transformador en `diffusers`, junto con un banco de pruebas (`bench.py`) que mide velocidad y memoria de GPU frente al modelo en BF16. Se incluyen dos variantes de almacenamiento: una con pesos NVFP4 residentes (4,5 bits por peso) y otra con los pesos en código trellis de 2 bits (2,28 bits por peso) que se decodifican a NVFP4 justo antes de cada GEMM.

La relevancia es doble. Por un lado, permite reducir la huella de memoria del DiT de modelos de vídeo de 1,3B y 2B parámetros, donde el coste de memoria y el tiempo por paso de denoising son cuellos de botella habituales. Por otro, exige hardware Blackwell (RTX 5090 o superior) y FlashInfer con backend GEMM FP4 disponible, lo que limita su uso a entornos con esa generación de GPU. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) de los modelos base, con capas lineales sustituidas por GEMM NVFP4 |
| Parametros totales | 1,3B (Wan2.1-T2V-1.3B) y 2B (CogVideoX-2B); no se especifica el recuento exacto de parámetros del transformador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (generación de vídeo; no se especifica longitud de prompt) |
| Tipos de cuantizacion | W2A4 (pesos 2 bits, activaciones 4 bits) en NVFP4; pesos residentes a 4,5 bits/peso o 2,28 bits/peso en variante trellis |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`grid_nvfp4.safetensors`, `grid_trellis.safetensors`) + `config.json`; runtime Python |

## Arquitectura y entrenamiento

El paquete no entrena un modelo desde cero: parte de los pesos BF16 de Wan2.1-T2V-1.3B y CogVideoX-2B y aplica cuantización de post-entrenamiento sobre las capas lineales del transformador. En Wan2.1 se cuantizan 300 capas lineales; en CogVideoX-2B, 180. El resto de pesos (embeddings, modulación adaLN de CogVideoX, proyección de salida, codificador de texto y VAE) se mantienen en BF16 y se descargan del hub en tiempo de ejecución.

El formato de una capa con peso `W [out, in]` rota la entrada con una transformada de Hadamard aleatorizada `R` y almacena `W R` como `w_gs * w_sf * c`, donde `c` es un valor FP4 E2M1, `w_sf` una escala FP8 E4M3 por cada 16 entradas y `w_gs` una escala FP32 por tensor. Las activaciones se cuantizan a NVFP4 en tiempo de ejecución con una escala estática FP32 `a_gs`. Con classifier-free guidance, ambas pasadas de un paso se ejecutan en un mismo batch y la entrada condicional de una capa se cuantiza como su diferencia respecto a la incondicional (diferencia inter-rama), salvo en las capas listadas en `config.json` (K/V de cross-attention en Wan2.1). La variante trellis almacena los símbolos de 2 bits por tile de 16x16 más escalas E4M3 y un ~0,8 % de tiles con códigos E2M1 directos; su decodificación reproduce exactamente los valores E2M1 del fichero NVFP4 y se realiza capa a capa antes de cada GEMM (unos 0,12 s para las 300 capas de Wan2.1 en una H200).

## Capacidades

- Generación de vídeo a partir de texto (pipeline `text-to-video`) mediante los modelos base Wan2.1-T2V-1.3B y CogVideoX-2B.
- Inferencia con pesos cuantizados NVFP4 ejecutando GEMM FP4 en tensor cores Blackwell.
- Dos modos de residencia de pesos: NVFP4 (4,5 bits/peso) y trellis de 2 bits (2,28 bits/peso) con decodificación bajo demanda.
- Benchmark integrado de velocidad y memoria (`bench.py`, `run_bench.sh`) con variantes `bf16`, `grid` y `grid-2bit`.
- Autocomprobación de empaquetado FP4 y layout de escalas de FlashInfer (`grid_nvfp4.self_test`) antes de medir.
- Modo de emulación (`--backend emu`) que ejecuta la misma numérica con pesos BF16 dequantizados en cualquier GPU, solo para verificación.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo.

## Casos de uso

- Generación de vídeo en GPUs Blackwell con memoria limitada: la variante trellis mantiene solo 2,28 bits por peso en GPU y decodifica cada capa antes de su GEMM, reduciendo la huella del DiT frente a BF16.
- Evaluación de cuantización FP4 en modelos de difusión: el paquete incluye el benchmark y la autocomprobación numérica, lo que permite medir speedup y memoria pico por paso de denoising de forma reproducible.
- Prototipado de pipelines texto-a-vídeo en `diffusers`: el runtime sustituye las capas lineales del transformador sin reescribir el pipeline (Wan2.1 usa un pipeline parcheado; CogVideoX, el publicado).
- Investigación sobre rotaciones Hadamard y escalas por bloque en cuantización de DiT: el formato documenta escalas por 16 entradas, escala por tensor y signos de rotación por dimensión.
- Despliegue de demostraciones de vídeo con requisitos de VRAM ajustados: la reducción de bits por peso permite alojar el transformador con más margen para el VAE y el codificador de texto.
- Comparación de estrategias de almacenamiento de pesos (NVFP4 residente frente a trellis decodificado en caliente) midiendo el coste de decodificación dentro del tiempo de paso.
- Verificación de backends GEMM FP4 de FlashInfer (cutlass, cudnn, trtllm) en un entorno concreto antes de adoptarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card describe las columnas que produce `results/summary.md` (parámetros y buffers del DiT, segundos por paso con ambas pasadas CFG, speedup frente a BF16, tiempo total con decodificación VAE, memoria pico y media durante el denoising y memoria pico total), pero no incluye los valores medidos. Tampoco se proporcionan resultados de MMLU, HumanEval, GSM8K ni métricas de calidad de vídeo.

Configuración de medida declarada: Wan2.1 a 480x832 y 81 frames; CogVideoX a 480x720 y 49 frames; 50 pasos; un prompt; el codificador de texto se ejecuta una vez y se retira antes de medir.

## Requisitos de hardware

- GPU Blackwell obligatoria para el modo NVFP4 nativo (RTX 5090 u otra GPU Blackwell); el modo `emu` funciona en cualquier GPU pero es lento y solo sirve para verificación.
- Controlador NVIDIA >= 570, Python >= 3.10 y FlashInfer con al menos un backend GEMM FP4 operativo (cutlass, cudnn o trtllm); el benchmark se detiene si ninguno pasa.
- Entorno provisionado por `setup_env.sh`: `.venv` con PyTorch 2.9, CUDA 12.8, diffusers 0.39 y FlashInfer.
- Unos 40 GB de disco para los modelos base, además del repositorio (2,3 GB).
- VRAM estimada para inferencia: no disponible de forma explícita; depende del modelo base, de la variante (`bf16`, `grid`, `grid-2bit`) y de la resolución y número de frames. La variante trellis mantiene en GPU solo un peso decodificado a la vez.
- Latencia y throughput: no disponibles; el benchmark mide segundos por paso y speedup, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LiqunMa/speed (Wan2.1-T2V-1.3B) | 1,3B | Pesos cuantizados de DiT texto-a-vídeo | NVFP4 W2A4; trellis 2,28 bits/peso | Apache 2.0 | Hugging Face |
| LiqunMa/speed (CogVideoX-2B) | 2B | Pesos cuantizados de DiT texto-a-vídeo | NVFP4 W2A4; trellis 2,28 bits/peso | Apache 2.0 | Hugging Face |
| Wan-AI/Wan2.1-T2V-1.3B-Diffusers | 1,3B | DiT texto-a-vídeo en BF16 | Sin cuantizar | no disponible en la información | Hugging Face (modelo base) |
| THUDM/CogVideoX-2b | 2B | DiT texto-a-vídeo en BF16 | Sin cuantizar | no disponible en la información | Hugging Face (modelo base) |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Dependencia estricta de hardware Blackwell y de FlashInfer con backend GEMM FP4; sin él, el benchmark aborta y el modo `emu` no es apto para producción.
- La variante NVFP4 residente ocupa 4,5 bits por peso en memoria pese a ser un código de 2 bits, porque almacena los valores E2M1 ya decodificados.
- La variante trellis añade tiempo de decodificación dentro del paso medido (unos 0,12 s para las 300 capas de Wan2.1 en H200), lo que puede penalizar la latencia.
- Solo se cuantizan las capas lineales del transformador; embeddings, adaLN de CogVideoX, proyección de salida, codificador de texto y VAE permanecen en BF16 y deben descargarse aparte.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día; no hay validación comunitaria ni resultados publicados.
- No se documentan sesgos, tasas de alucinación ni evaluación de calidad de vídeo; la cuantización agresiva a 2 bits de peso puede degradar la fidelidad visual y no se aportan métricas al respecto.
- No se especifican idiomas soportados ni restricciones de uso comercial más allá de la licencia Apache 2.0 declarada.
- El benchmark se realiza con un único prompt y la configuración de muestreo por defecto de cada modelo, por lo que no representa la variabilidad de cargas reales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LiqunMa/speed
- Modelo base Wan2.1-T2V-1.3B: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
- Modelo base CogVideoX-2B: https://huggingface.co/THUDM/CogVideoX-2b
- Referencia cruzada al perfil del autor: https://huggingface.co/LiqunMa/
- Artículo relacionado (FBI-LLM, arXiv): https://arxiv.org/pdf/2407.07093
