# netprojects/Cosmos3-Edge-Omni-mlx-8bit

## Resumen

Cosmos3-Edge-Omni-mlx-8bit es un port a MLX del generador de vídeo del modelo Cosmos3-Edge de NVIDIA, publicado por NetProjects (Internet Projects Ltd) para su ejecución en Apple Silicon. Convierte un prompt de texto, opcionalmente acompanado de un primer fotograma, en un vídeo o en una imagen fija. El repositorio ocupa 5,0 GB y cuantiza las capas lineales del transformer a 8 bits (afín, grupo 64), manteniendo el VAE en bf16. No está afiliado a NVIDIA.

El modelo base, Cosmos3-Edge, es un generador multimodal de NVIDIA que combina un razonador de lenguaje (Cosmos3ReasonerCausalLM, con MLP squared-ReLU de tipo Nemotron-H) con un transformer de generación de 28 capas (hidden 2048, 16 cabezas de query y 8 de key-value, M-RoPE 3D intercalado). El port mantiene la arquitectura del transformer de generación y el VAE de vídeo Wan 2.2 (16× espacial, 4× temporal, 48 canales latentes), y usa el sampler UniPC con flow prediction de orden 2 y classifier-free guidance.

Su relevancia radica en que permite ejecutar generación de vídeo texto-a-vídeo, imagen-a-vídeo y texto-a-imagen en hardware Apple Silicon con un consumo de memoria contenido: el ejemplo completo de imagen-a-vídeo de NVIDIA (832×480, 121 fotogramas, 24 fps, 20 pasos) tarda 113 s con un pico de 18,8 GB en un MacBook Pro M5 Max de 128 GB. La fidelidad respecto al pipeline de referencia en diffusers es alta: coseno latente de 0,9960/0,9959 y PSNR de vídeo de 29,8/26,0 dB para i2v/t2v.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (flow matching) de 28 capas con doble stream (texto y generación), M-RoPE 3D intercalado; VAE Wan 2.2 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits (afín, grupo 64) en capas lineales del transformer; VAE en bf16; timestep embedder y proyecciones de entrada/salida latentes en fp32 |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

El transformer de generación sigue el diseño Cosmos3 Omni de NVIDIA: 28 capas con hidden de 2048, 16 cabezas de query y 8 de key-value, y M-RoPE 3D intercalado para codificar posición temporal y espacial. Cada capa contiene un stream de texto (con los pesos del razonador) y un stream de generación con su propia atención y MLP; los tokens de vídeo atienden a todos los tokens de texto y entre sí. Las claves y valores del texto se calculan una vez por prompt y se reutilizan en cada paso de muestreo, lo que reduce el coste computacional.

El VAE es el de vídeo Wan 2.2 incluido en el repositorio de NVIDIA (16× espacial, 4× temporal, 48 canales latentes), en bf16, y decodifica un fotograma latente cada vez. El muestreo usa UniPC con predicción de flujo de orden 2, el schedule nativo de NVIDIA y classifier-free guidance. Para imagen-a-vídeo, el primer fotograma se codifica con el VAE y se mantiene fijo como primer fotograma latente. La cuantización a 8 bits aplica a las capas lineales del transformer, mientras que el timestep embedder, las proyecciones de entrada/salida latentes y las cabezas de acción permanecen en precisión completa. No se dispone de información sobre el dataset de entrenamiento ni sobre el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con control de número de fotogramas, resolución, pasos, guidance, shift, semilla y fps.
- Generación de vídeo a partir de una imagen inicial (image-to-video), manteniendo el primer fotograma fijo como latente inicial.
- Generación de imagen fija a partir de texto (text-to-image) con un solo fotograma.
- Soporte de prompts en JSON (formato de NVIDIA) o en texto plano, con prompt negativo opcional.
- Control de resolución con múltiplos de 16 en altura y anchura, y recuentos de fotogramas de la forma 4n+1.
- Ejecución en Apple Silicon mediante MLX, con límites de memoria configurables (COSMOS_CACHE_LIMIT_GB, COSMOS_MEMORY_LIMIT_GB).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni audio en la información disponible.

## Casos de uso

- Prototipado de vídeo generativo en local: un desarrollador con un MacBook con Apple Silicon puede generar clips de 121 fotogramas a 832×480 en unos 113 s, sin depender de GPUs NVIDIA ni de servicios en la nube.
- Creación de animaciones a partir de un fotograma clave: la modalidad image-to-video permite animar una ilustración o un fotograma de vídeo existente manteniendo la composición inicial, útil para previsualizaciones de storyboard.
- Generación de imágenes de concepto: con un solo fotograma (--frames 1) se obtienen imágenes fijas desde texto, aprovechando el mismo pipeline para iterar rápidamente sobre ideas visuales.
- Integración en pipelines de Python: la API Cosmos3EdgeGenerator.from_pretrained permite incorporar la generación en scripts y flujos automatizados de producción de contenido.
- Evaluación y experimentación académica: la posibilidad de reconstruir el modelo desde el checkpoint original de NVIDIA y verificar la paridad con diffusers (coseno latente, PSNR) facilita estudios de reproducibilidad y de deriva por baja precisión.
- Pruebas de concepto en entornos con restricciones de memoria: los límites configurables de caché y memoria permiten ajustar el consumo (pico de 18,8 GB en el ejemplo completo) a equipos con menos RAM unificada.
- Generación de material audiovisual para demos y marketing: clips cortos con control de fps y resolución para incrustar en presentaciones o prototipos de producto.

## Benchmarks y rendimiento

| Métrica | 8-bit | bf16 | fp32 (referencia) |
|---|---|---|---|
| Coseno latente i2v | 0,9960 | 0,9975 | 0,9998 |
| Coseno latente t2v | 0,9959 | 0,9975 | 0,9995 |
| PSNR de vídeo i2v (dB) | 29,8 | 30,7 | 41,9 |
| PSNR de vídeo t2v (dB) | 26,0 | 27,1 | 35,2 |
| Tamano del build | 5,0 GB | 7,6 GB | — |

Medido en un MacBook Pro M5 Max (128 GB) el 7 de noviembre de 2026 frente al pipeline Cosmos3OmniPipeline de NVIDIA en diffusers 0.42.1 (fp32), con la misma ruido inicial: imagen y prompts de ejemplo de imagen-a-vídeo de NVIDIA, 448×256, 17 fotogramas, 20 pasos, guidance 6, flow shift 12. En modelos pequeños con pesos aleatorios, el port coincide con diffusers en torno a 1e-5 para text-to-video, image-to-video y text-to-image. Con el build de 8 bits, el ejemplo completo de imagen-a-vídeo de NVIDIA (832×480, 121 fotogramas, 24 fps, 20 pasos) tarda 113 s de extremo a extremo con un pico de 18,8 GB.

## Requisitos de hardware

- VRAM/RAM unificada estimada: pico de 18,8 GB en el ejemplo completo de imagen-a-vídeo (832×480, 121 fotogramas) con el build de 8 bits; el repositorio ocupa 5,0 GB en disco.
- Hardware objetivo: Apple Silicon (MLX). Las mediciones se realizaron en un MacBook Pro M5 Max con 128 GB de memoria unificada.
- No se documenta soporte para GPUs NVIDIA, AMD ni otros aceleradores en esta conversión.
- Opciones de despliegue: línea de comandos (python -m cosmos3_edge_mlx.gen.cli) y API de Python (Cosmos3EdgeGenerator). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este pipeline de difusión.
- Límites de memoria configurables mediante COSMOS_CACHE_LIMIT_GB (por defecto 2) y COSMOS_MEMORY_LIMIT_GB (por defecto 32); la caché de MLX se limpia en cada paso.
- Latencia: 113 s para 832×480, 121 fotogramas, 24 fps y 20 pasos en un M5 Max de 128 GB.
- No se dispone de estimaciones para otros modelos de chip Apple ni para configuraciones con menos memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Edge-Omni-mlx-8bit (este) | no disponible | no disponible | Coseno latente 0,9960/0,9959; PSNR 29,8/26,0 dB frente a fp32 | OpenMDW-1.1 | Hugging Face, MLX |
| netprojects/Cosmos3-Edge-Omni-mlx-bf16 | no disponible | no disponible | Coseno latente 0,9975/0,9975; PSNR 30,7/27,1 dB | OpenMDW-1.1 | Hugging Face, MLX |
| nvidia/Cosmos3-Edge (fp32, referencia) | no disponible | no disponible | Coseno latente 0,9998/0,9995; PSNR 41,9/35,2 dB | OpenMDW-1.1 | Hugging Face, diffusers |
| cosmos3-edge-mlx (razonador) | no disponible | no disponible | No disponible | no disponible | GitHub, MLX |

## Limitaciones y advertencias

- Deriva por baja precisión: la cuantización a 8 bits acumula desviaciones a lo largo de los 20 pasos de muestreo, con un PSNR de 29,8/26,0 dB frente a los 41,9/35,2 dB de fp32 en el mismo código.
- No es un modelo oficial de NVIDIA: el port lo publica NetProjects (Internet Projects Ltd) y no está afiliado a NVIDIA.
- La model card de NVIDIA pide a los usuarios que añadan sus propias salvaguardas de seguridad para su caso de uso; este port no incluye filtros adicionales.
- Idiomas soportados no documentados; el comportamiento multilingüe de los prompts no está verificado.
- Riesgo de alucinación visual y de artefactos propios de los modelos generativos de vídeo; no se documentan sesgos específicos en la información disponible.
- Restricciones de licencia: OpenMDW-1.1 es una licencia "other"; debe revisarse el texto completo antes de un uso comercial.
- Solo para Apple Silicon con MLX; no hay soporte documentado para CUDA ni otras plataformas.
- Requiere respetar las restricciones de forma: fotogramas en 4n+1 y dimensiones múltiplos de 16.
- El repositorio incluye documentos de NVIDIA (BIAS.md, EXPLAINABILITY.md, PRIVACY.md, SAFETY.md) sin modificar, que deben consultarse para entender los riesgos del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/netprojects/Cosmos3-Edge-Omni-mlx-8bit
- Build bf16: https://huggingface.co/netprojects/Cosmos3-Edge-Omni-mlx-bf16
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge
- Repositorio del port: https://github.com/internet-projects/cosmos3-edge-mlx
- README del repositorio: https://github.com/internet-projects/cosmos3-edge-mlx/blob/main/README.md
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Documentación de TensorRT Edge-LLM para Cosmos3: https://nvidia.github.io/TensorRT-Edge-LLM/developer_guide/models/cosmos3.html
- NetProjects: https://netprojects.com
