# aqualaguna/MOSS-Image-SFT-OpenVINO

## Resumen

MOSS-Image-SFT-OpenVINO es una conversión a OpenVINO IR del modelo de generación de imágenes texto-a-imagen OpenMOSS-Team/MOSS-Image-SFT, publicada por el usuario aqualaguna. El pipeline original combina un transformer de difusión (DiT) de 5 000 millones de parámetros en configuración single-stream, un codificador de texto Qwen3.5-9B y un VAE decodificador de tipo FLUX.2 small-decoder. La conversión está pensada para ejecutarse íntegramente sobre GPUs Intel Arc mediante el plugin GPU de OpenVINO, sin PyTorch en GPU ni IPEX: las redes corren en el plugin GPU y el muestreador es código host en numpy y torch-cpu.

El interés de esta ficha es doble. Por un lado, demuestra que un pipeline de difusión de gran tamaño (más de 14 000 millones de parámetros sumando codificador de texto y DiT) puede servirse en hardware Intel Arc profesional con cuantización INT8 selectiva, manteniendo una fidelidad numérica verificada frente a la referencia fp32 en CPU. Por otro, documenta con detalle los compromisos reales de esa conversión: consumo de VRAM, tiempos por paso, latencia de arranque en frío y deriva numérica en prompts largos.

El autor indica que el modelo estuvo en producción como servicio texto-a-imagen sobre una Intel Arc Pro B60 de 24 GB durante dos semanas (octubre-noviembre de 2026) y se publica tal cual, sin afiliación con OpenMOSS. La licencia declarada es Apache-2.0, heredada del modelo base. El repositorio ocupa 32,5 GB e incluye pesos en fp16 e INT8, tokenizador, VAE y el código del pipeline y del servidor HTTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusión texto-a-imagen: DiT single-stream de 5B (segmentado en 4 partes) + codificador de texto Qwen3.5-9B (Gated-DeltaNet implementado como `ov::Loop`) + VAE decodificador FLUX.2 small-decoder |
| Parametros totales | 5B (DiT) + 9B (codificador de texto); total del pipeline no disponible de forma explícita |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible; el codificador de texto se ha validado hasta 1532 tokens de prompt |
| Tipos de cuantizacion | fp16 (DiT y TE), INT8 asimétrico por canal con NNCF y `ffn_down` en fp16 ("keepdown"); VAE en f16 y f32 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml`/`.bin`); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es un pipeline de difusión con tres componentes. El generador es un DiT single-stream de 5 000 millones de parámetros, dividido en la conversión en cuatro segmentos (`text_refine`, `dit_a` con los bloques 0-21, `dit_b` con el bloque 22 y `dit_c` con el resto) para poder omitir el bloque 22 en la rama negativa de CFG, replicando el comportamiento del pipeline original (`uncond_skip_layers=(22,)`). El codificador de texto es Qwen3.5-9B, exportado en cuatro partes de 8 capas con la atención Gated-DeltaNet implementada como bucle nativo de OpenVINO, más las embeddings del tokenizador. El decodificador es un VAE de tipo FLUX.2 small-decoder.

La conversión soporta formas dinámicas en múltiplos de 16 píxeles. La cuantización INT8 se aplica con NNCF en modo per-channel asimétrico sobre los pesos del DiT, manteniendo todas las capas `ffn_down` en fp16 para preservar calidad. No se dispone de información sobre el dataset de entrenamiento del modelo original, el número de tokens vistos ni si hubo etapas de RLHF o DPO; esos datos corresponden a la model card de OpenMOSS-Team/MOSS-Image-SFT, no incluida en la información proporcionada.

La fidelidad de la conversión está medida frente al pipeline original en fp32 sobre CPU: el codificador de texto alcanza coseno ≥ 0,999997 en fp16; la velocidad predicha por el DiT obtiene coseno ≥ 0,999995 y error L2 relativo del 0,2-0,3 % en fp16, y coseno 0,9991-0,9999 con error L2 relativo del 1,3 %, 3,8 % y 4,2 % en INT8 para t = 1000, 500 y 100 respectivamente; el VAE logra 64,6 dB. El muestreador completo a 256² y 4 pasos da 54 dB en fp16 y 40,2 dB en INT8.

## Capacidades

- Generación de imágenes texto-a-imagen con resolución configurable en múltiplos de 16 píxeles (1024×1024, 1536×1152, 2048×1152 en INT8).
- Control de muestreo mediante número de pasos, escala de guidance (CFG) y semilla; los valores por defecto recomendados son 30 pasos, guidance 3 y shift 5.
- Soporte de prompts en inglés y chino, heredado del codificador Qwen3.5-9B.
- Ejecución de la inferencia completa en el plugin GPU de OpenVINO sobre hardware Intel Arc, con el muestreador en CPU.
- Servicio HTTP integrado (`code/server.py`) con endpoint `POST /v1/mossimage` para despliegue como servicio.
- Exportación reproducible desde los pesos originales mediante scripts de exportación de cada componente (TE, DiT, VAE) y compresión INT8.
- No se documenta soporte de tool calling, function calling, agentes, visión de entrada, audio ni modo de razonamiento explícito; es un modelo exclusivamente de generación de imágenes.

## Casos de uso

- Servicio interno de generación de imágenes: el pipeline se expone mediante `code/server.py` en el puerto 8109 y atiende peticiones `POST /v1/mossimage`, adecuado para equipos que ya operan hardware Intel Arc y quieren evitar dependencias de CUDA.
- Prototipado de ilustración y material gráfico: con 30 pasos y guidance 3 se obtiene una imagen 1024×1024 en aproximadamente 63-65 segundos en INT8 sobre una Arc Pro B60, un ritmo aceptable para generación por lotes no interactiva.
- Generación de imágenes en entornos con requisitos de licencia permisiva: la licencia Apache-2.0 del modelo base permite uso comercial sin restricciones adicionales documentadas.
- Evaluación de cuantización INT8 sobre difusión: el repositorio incluye scripts de referencia y verificación (`ref_*.py`, `verify_*.py`, `ref_e2e.py`) que permiten reproducir las métricas de fidelidad y comparar fp16 frente a INT8 en hardware propio.
- Despliegue en infraestructura Intel con memoria limitada: la variante INT8 reduce el pico de VRAM a 11,8-13,8 GB a 1024×1024, lo que permite ejecutar el pipeline en GPUs Arc de 16 GB y libera margen para resoluciones mayores.
- Investigación sobre portabilidad de pipelines de difusión: la segmentación del DiT y la implementación de Gated-DeltaNet como `ov::Loop` sirven de referencia para portar otros modelos con atención híbrida a OpenVINO.
- Generación bilingüe inglés-chino: útil para equipos que necesitan prompts en ambos idiomas sin cambiar de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos cuantitativos son métricas de fidelidad y de rendimiento de la conversión:

| Metrica | fp16 IR | INT8 (keepdown) |
|---|---|---|
| Coseno del codificador de texto | ≥ 0,999997 | (mismo TE en fp16) |
| Coseno de la velocidad del DiT | ≥ 0,999995 | 0,9991-0,9999 |
| Error L2 relativo del DiT | 0,2-0,3 % | 1,3 / 3,8 / 4,2 % (t = 1000 / 500 / 100) |
| PSNR del VAE | 64,6 dB | no disponible |
| PSNR del muestreador completo (256², 4 pasos) | 54 dB | 40,2 dB |

| Rendimiento en Arc Pro B60 24 GB, 1024×1024, CFG 3 | fp16 | INT8 |
|---|---|---|
| Segundos por paso | 2,26-2,35 | 2,01-2,09 |
| 30 pasos (por defecto) | ~72 s | 63-65 s |
| 50 pasos | ~2 min | 101-105 s |
| Pico de memoria GPU | 15,6-17,8 GB (1536×1152: 21,3 GB; 1536² no cabe) | 11,8-13,8 GB (1536² y 2048×1152: ~20,5 GB) |

Arranque en frío con caché de kernels vacía: ~75 s de carga y +47 s para la primera imagen INT8; la caché ocupa ~29 GB y el arranque en caliente baja a ~11 s.

## Requisitos de hardware

- VRAM estimada: 15,6-17,8 GB en fp16 a 1024×1024; 11,8-13,8 GB en INT8 a la misma resolución. A 1536×1152 el fp16 requiere 21,3 GB; en INT8, 1536² y 2048×1152 caben en ~20,5 GB. 1536² no cabe en fp16 sobre 24 GB.
- GPU recomendadas: Intel Arc Pro B60 de 24 GB es la plataforma validada. No se documenta funcionamiento en otras GPUs Intel Arc ni en GPUs NVIDIA o AMD.
- Cabe en GPU de consumo: no disponible; no se han probado GPUs Arc de consumo ni se documenta el comportamiento en menos de 24 GB, aunque la variante INT8 a 1024×1024 podría ajustarse en GPUs Arc de 16 GB.
- Opciones de despliegue: OpenVINO 2026.4.1 con el plugin GPU, más `numpy 2.4`, `torch 2.12 (cpu)`, `transformers 5.20`, `tokenizers 0.23`, `pillow` y `aiohttp` para el servidor. No hay soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~2,0-2,4 s por paso a 1024×1024; 63-65 s por imagen de 30 pasos en INT8 y ~72 s en fp16. Arranque en caliente ~11 s con caché de kernels poblada.
- Almacenamiento: el repositorio ocupa 32,5 GB y la caché de kernels de OpenVINO añade ~29 GB.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo de contexto estructural:

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Image-SFT-OpenVINO | 5B (DiT) + 9B (TE) | no disponible | Apache-2.0 | OpenVINO IR | HuggingFace |
| OpenMOSS-Team/MOSS-Image-SFT | 5B (DiT) + 9B (TE) | no disponible | Apache-2.0 | safetensors (PyTorch) | HuggingFace |
| aqualaguna/MOSS-Image-Edit-OpenVINO | no disponible | no disponible | no disponible | OpenVINO IR | HuggingFace |

La comparación con otros modelos texto-a-imagen de la misma categoría (por ejemplo, familias FLUX o SD) no se incluye porque no hay datos de rendimiento en la información disponible.

## Limitaciones y advertencias

- El flujo residual del DiT en fp16 alcanza ~55 000, frente al máximo de 65 504 de fp16; el muestreador comprueba valores no finitos, pero existe riesgo de desbordamiento en configuraciones extremas.
- El codificador de texto deriva en prompts muy largos en fp16: el pipeline oficial en bf16 ya se desvía un 33 % respecto a fp32 a 1532 tokens. La variable `MOSSIMAGE_TE_PRECISION=f32` corrige la deriva a costa de +7 GB por parte.
- La calidad de imagen se evaluó únicamente a ojo, sobre un puñado de prompts; no hay evaluación sistemática de calidad perceptual.
- El plugin GPU inserta un `DynamicQuantize` antes de cada matmul comprimido, de modo que el INT8 "solo de pesos" también cuantiza activaciones en tiempo de ejecución. `DYNAMIC_QUANTIZATION_GROUP_SIZE=0` lo desactiva (40,0 dB, pero un 14 % más lento y sin ganancia frente a fp16); la clave de caché de kernels de OpenVINO ignora esa propiedad, por lo que hay que usar un `CACHE_DIR` separado al probarla.
- Los scripts incluyen rutas absolutas codificadas (`/opt/mossimage/...`) de la máquina original que deben ajustarse.
- Solo se soportan inglés y chino; no hay soporte documentado de otros idiomas.
- No hay soporte de tool calling, agentes ni entrada multimodal; es exclusivamente texto-a-imagen.
- El modelo se publica "tal cual", sin garantías de mantenimiento, y no está afiliado a OpenMOSS.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar el fichero `LICENSE` incluido y las condiciones del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aqualaguna/MOSS-Image-SFT-OpenVINO
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Variante de edición de imagen: https://huggingface.co/aqualaguna/MOSS-Image-Edit-OpenVINO
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios de código adicionales ni demos.
