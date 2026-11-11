# SaeedRazavi/dino-t2i-imagenet256-sitxl-flux2-dinocls-80ep

## Resumen

DINO-T2I SiT-XL ImageNet-256 es un checkpoint de investigación publicado por el usuario SaeedRazavi en Hugging Face. Se trata de un generador de imágenes condicionado por representación visual: un transformer de difusión latente de la familia SiT (Scalable Interpolant Transformers) entrenado sobre ImageNet-1K a resolución 256×256, cuya condición de entrada es el token CLS del encoder DINOv3 ViT-L/16 aplicado a una imagen de referencia.

El modelo no es un pipeline texto-a-imagen autónomo, pese a la etiqueta "t2i" del identificador. La generación se guía por embeddings DINOv3 de una imagen, no por prompts de texto, y requiere el código fuente del proyecto DINO-T2I, el VAE de FLUX.2 y el encoder DINOv3 ViT-L/16 para poder cargarse y muestrear. El checkpoint incluye estado del modelo de entrenamiento, modelo EMA, estado del optimizador y argumentos de lanzamiento.

Su relevancia es acotada: es un artefacto de investigación sobre representaciones visuales como señal de condicionamiento en difusión, con un único resultado reportado (similitud DINOv3-CLS de 0,61471 sobre 25 imágenes reservadas) y sin métricas estándar como FID. Resulta útil para reproducir el entrenamiento o estudiar condicionamiento por embeddings, no para despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SiT-XL (Scalable Interpolant Transformer), difusión latente con SwiGLU, RMSNorm, RoPE y adaLN compartido |
| Parámetros totales | no disponible (el checkpoint pesa 7.345.316.757 bytes e incluye EMA y estado del optimizador) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre latentes de 256×256) |
| Tipos de cuantización | no disponible (checkpoint en BF16 durante entrenamiento; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no disponible (condicionamiento visual, no textual) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`, archivo `ep-00080.pt`) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión latente SiT-XL con activaciones SwiGLU, normalización RMSNorm, embeddings posicionales rotatorios (RoPE) y modulación adaLN compartida. Trabaja en el espacio latente del VAE de FLUX.2, con predicción del objetivo de velocidad (`v`), trayectoria lineal y resolución de 256×256. La condición es el token CLS de un DINOv3 ViT-L/16 congelado, aplicado a la imagen de entrada.

El entrenamiento se realizó sobre el split de entrenamiento de ImageNet-1K (1.281.167 imágenes, con 25 reservadas para evaluación), durante 80 épocas y 200.160 pasos de optimizador, con batch global de 512 en 4 GPU NVIDIA H200, precisión BF16, learning rate 2e-4 y decaimiento EMA de 0,9995. El código fuente corresponde al commit `af221902608ec61204b57fc8b8f791cd58614ef1` del proyecto DINO-T2I, y los argumentos exactos de lanzamiento están en `args.json`. No se documentan técnicas de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de imágenes de 256×256 píxeles condicionada por el embedding CLS de DINOv3 ViT-L/16 de una imagen de referencia.
- Difusión latente en el espacio del VAE de FLUX.2 con predicción de velocidad y sampler de interpolante lineal.
- Entrenamiento sobre las 1.000 clases de ImageNet-1K, por lo que el espacio de salida está sesgado hacia las categorías de dicho dataset.
- No soporta prompts de texto: la etiqueta "t2i" del identificador no implica condicionamiento textual.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso.
- No tiene capacidades multilingües, de audio, de vídeo ni modo "thinking".
- Checkpoint completo con modelo de entrenamiento y modelo EMA, apto para reanudar entrenamiento o para muestrear con los pesos EMA.

## Casos de uso

- Reproducción de experimentos de difusión condicionada por representaciones: cargar `ep-00080.pt` con el código DINO-T2I, el VAE de FLUX.2 y DINOv3 ViT-L/16 para replicar el resultado de similitud CLS reportado (0,61471).
- Estudio de condicionamiento visual frente a condicionamiento textual: comparar la señal DINOv3-CLS con alternativas como CLIP o T5 en la misma arquitectura SiT-XL para aislar el efecto del encoder.
- Reanudación de entrenamiento: el checkpoint incluye estado del optimizador, época y paso, lo que permite continuar el run desde el paso 200.160 con los mismos hiperparámetros registrados en `args.json`.
- Investigación sobre alineación semántica en generación: usar la similitud DINOv3-CLS como métrica interna para analizar cómo varía la fidelidad de la reconstrucción según la clase de ImageNet.
- Ablaciones de componentes arquitectónicos: al estar el código fuente referenciado por commit, se pueden modificar SwiGLU, RoPE o adaLN y reentrenar sobre ImageNet-1K con el mismo protocolo.
- Docencia y experimentación académica en modelos generativos: el tamaño del checkpoint (7,3 GB) y el protocolo documentado permiten montar prácticas reproducibles sobre difusión latente en un clúster pequeño de GPU H200.

## Benchmarks y rendimiento

| Métrica | Valor | Conjunto | Notas |
|---|---|---|---|
| Similitud DINOv3-CLS | 0,61471 | 25 imágenes reservadas de ImageNet-1K | Medida en el paso 200.160; no es FID |
| FID ImageNet-256 | no disponible | — | No reportado en la información proporcionada |
| IS, Precision, Recall | no disponible | — | No reportados |

No se han publicado resultados de benchmarks estándar (FID, IS, CLIP score) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint completo ocupa 7,3 GB e incluye EMA y estado del optimizador, por lo que el modelo de inferencia (EMA) es sustancialmente menor, pero no se documenta su tamaño exacto.
- GPU de entrenamiento documentadas: 4× NVIDIA H200 con batch global de 512 en BF16.
- Compatibilidad con GPU de consumo: no confirmada; un SiT-XL en BF16 probablemente exige más de 24 GB de VRAM, por lo que tarjetas como la RTX 4090 no están garantizadas sin cuantización, y no se publican recetas de cuantización.
- Opciones de despliegue: no hay integración con vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje). Requiere el código fuente de DINO-T2I, el VAE de FLUX.2 y el encoder DINOv3 ViT-L/16.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto / resolución | Condición | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DINO-T2I SiT-XL (este) | SiT-XL, difusión latente | no disponible | 256×256 | DINOv3 ViT-L/16 CLS | no disponible | Hugging Face, 0 descargas |
| SiT-XL/2 ImageNet-256 (referencia original) | SiT-XL, difusión latente | ~675 M (referencia pública) | 256×256 | clase (class-conditional) | no disponible en esta ficha | Repositorios académicos |
| DiT-XL/2 ImageNet-256 | Diffusion Transformer | ~675 M (referencia pública) | 256×256 | clase | no disponible en esta ficha | Repositorios académicos |
| FLUX.2 (VAE usado aquí) | Modelo texto-a-imagen completo | no disponible | no disponible | texto | no disponible en esta ficha | Hugging Face |

La comparación con SiT-XL/2 y DiT-XL/2 es pertinente por arquitectura y resolución, pero este checkpoint se distingue por el condicionamiento DINOv3 en lugar de la etiqueta de clase. No se dispone de datos de rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo texto-a-imagen: el nombre contiene "t2i" pero la condición es un embedding visual DINOv3, no texto.
- No es autónomo: sin el código DINO-T2I (commit `af221902608ec61204b57fc8b8f791cd58614ef1`), el VAE de FLUX.2 y el encoder DINOv3 ViT-L/16 no se puede cargar ni muestrear.
- Entrenado exclusivamente sobre ImageNet-1K: el espacio de salida está limitado a 1.000 clases y no generaliza a dominios abiertos.
- Evaluación muy limitada: el único resultado reportado se calcula sobre 25 imágenes reservadas y no es una métrica estándar de calidad generativa (no hay FID).
- Licencia no especificada: no se puede asumir uso comercial; además, el modelo depende del VAE de FLUX.2 y de DINOv3, cuyas licencias propias deben verificarse por separado.
- Sesgos: no documentados por el autor; al entrenar sobre ImageNet-1K hereda los sesgos de representación de dicho dataset.
- Riesgo de alucinación visual: no cuantificado; la similitud CLS de 0,61 sugiere una fidelidad moderada, no alta.
- Sin soporte multilingüe, de agentes ni de tool calling; no apto para pipelines de producción conversacionales.
- Repositorio sin descargas ni likes y creado en 2026-11-11: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/SaeedRazavi/dino-t2i-imagenet256-sitxl-flux2-dinocls-80ep
- Código fuente DINO-T2I (commit referenciado): `af221902608ec61204b57fc8b8f791cd58614ef1` (URL del repositorio no disponible en la información proporcionada)
- VAE de FLUX.2: no disponible en la información proporcionada
- Encoder DINOv3 ViT-L/16: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
