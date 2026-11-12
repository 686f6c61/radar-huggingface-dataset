# Mrbizarro/gemma4-12b-ltx25-q4

## Resumen

`Mrbizarro/gemma4-12b-ltx25-q4` es una cuantización de 4 bits en formato MLX del codificador de texto (text encoder) del modelo de vídeo Lightricks/LTX-2.5. No se trata de un modelo generativo de texto autónomo, sino de un componente especializado: el text encoder Gemma 4 de 12B que LTX-2.5 emplea para convertir prompts en representaciones latentes que alimentan el pipeline de generación de vídeo. El autor, Mrbizarro, lo publica para su uso en Apple Silicon (macOS, chips M-series) con la librería MLX, pensado para ejecución local y offline.

El modelo resuelve un problema muy concreto: permitir que usuarios de Mac con memoria unificada limitada puedan ejecutar el pipeline completo de LTX-2.5 (o variantes como Phosphene) sin depender de CUDA ni de GPUs de datacenter. Al reducir el text encoder a 4 bits y empaquetarlo en MLX, se rebaja el peso del repo a unos 6,7 GB y los parámetros totales a 11.907.350.320, lo que facilita su carga en equipos con 32-64 GB de memoria unificada.

Es relevante ahora porque LTX-2.5 es un modelo de vídeo reciente de Lightricks y el ecosistema de cuantizaciones comunitarias para Apple Silicon está creciendo. Sin embargo, el acceso está restringido (gated): requiere aceptar la licencia `ltx-2.x-community-license-agreement` en Hugging Face, y el modelo solo declara soporte para inglés (`en`). No hay descargas ni likes registrados en el momento de la ficha, lo que indica que es una publicación muy reciente y de nicho.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma 4 (transformer decoder) como text encoder de LTX-2.5; empaquetado MLX (`gemma4_unified`) |
| Parámetros totales | 11.907.350.320 (≈11,9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit (q4) en MLX |
| Idiomas soportados | inglés (`en`) |
| Licencia | `ltx-2.x-community-license-agreement` (other) |
| Formato de pesos | safetensors (MLX), repo de 6,7 GB |
| Librería | mlx |
| Pipeline | feature-extraction |
| Modelo base | Lightricks/LTX-2.5 |
| Acceso | restringido (gated) |
| Plataforma objetivo | Apple Silicon (macOS, local, offline) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas: se trata de un `gemma4_unified` de 11,9B parámetros, es decir, un transformer decoder de la familia Gemma 4 que actúa como codificador de texto dentro del pipeline de LTX-2.5. La cuantización es de 4 bits en formato MLX, lo que implica pesos empaquetados para ejecución en Apple Silicon con memoria unificada. El pipeline declarado es `feature-extraction`, coherente con su función: producir embeddings de texto, no generar texto libre.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF/DPO o alineación. Tampoco se documentan innovaciones técnicas específicas de esta cuantización (más allá del propio esquema q4 de MLX). El modelo base, Lightricks/LTX-2.5, es un modelo de generación de vídeo; este repo es una derivación cuantizada de su text encoder, no un modelo independiente entrenado desde cero.

## Capacidades

- Extracción de features de texto (embeddings) para alimentar el pipeline de generación de vídeo LTX-2.5.
- Codificación de prompts en inglés para condicionamiento de modelos de vídeo.
- Ejecución local y offline en Apple Silicon mediante MLX.
- Cuantización 4-bit que reduce el footprint de memoria frente al encoder original en precisión completa.
- Integración con flujos de Apple Silicon (macOS, chips M-series) sin CUDA.
- No se documentan capacidades de generación de texto libre, razonamiento, código, matemáticas, visión, tool calling ni agentes; el pipeline es `feature-extraction`.
- Soporte multilingüe: solo inglés según la tarjeta del modelo.

## Casos de uso

- Generación de vídeo local en Mac: usar este text encoder cuantizado junto al resto del pipeline LTX-2.5 para producir vídeo a partir de prompts en inglés sin salir del equipo, aprovechando la memoria unificada de los chips M-series.
- Prototipado offline de pipelines de vídeo: investigadores que quieran iterar sobre prompts y configuraciones de LTX-2.5 en un portátil Mac sin conexión ni GPU dedicada.
- Reducción de requisitos de memoria en despliegues Apple Silicon: al sustituir el encoder de 12B en precisión completa por la versión q4 (repo de 6,7 GB), se libera VRAM/memoria unificada para el resto de componentes del pipeline (VAE, UNet/diffusion transformer).
- Evaluación comparativa de cuantizaciones: servir como referencia para medir la pérdida de calidad de vídeo al usar un text encoder q4 frente al original, en un entorno MLX reproducible.
- Integración en herramientas de creación de contenido para macOS: editores o apps que incorporen LTX-2.5 y necesiten un encoder ligero compatible con MLX.
- Investigación sobre text encoders en modelos de difusión de vídeo: estudiar cómo afecta la cuantización del encoder Gemma 4 a la fidelidad prompt-vídeo en LTX-2.5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repo pesa 6,7 GB en safetensors q4; en ejecución hay que sumar overhead de MLX y del resto del pipeline LTX-2.5 (VAE, transformer de difusión), por lo que se recomienda al menos 32 GB de memoria unificada y preferiblemente 64 GB para el pipeline completo.
- GPU recomendadas: Apple Silicon M-series (M1 Pro/Max/Ultra, M2, M3, M4 en sus variantes Pro/Max/Ultra). No está pensado para CUDA (A100, H100, RTX 4090) al estar empaquetado en MLX.
- ¿Cabe en consumer GPU? Solo en el sentido de Apple Silicon consumer; no aplica a GPUs NVIDIA/AMD de consumo por el formato MLX.
- Opciones de despliegue: MLX (librería declarada), con integración en pipelines LTX-2.5 para macOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mrbizarro/gemma4-12b-ltx25-q4 | ≈11,9B | no disponible | MLX safetensors q4 | ltx-2.x-community | gated, 0 descargas |
| Lightricks/LTX-2.5 (base) | no disponible | no disponible | safetensors | ltx-2.x-community | gated en HF |
| Gemma 4 12B (encoder original, referencia) | ≈12B | no disponible | safetensors | según Gemma | no disponible como comparación directa |

No se dispone de datos de rendimiento para comparar cuantitativamente con alternativas.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar la licencia `ltx-2.x-community-license-agreement` en Hugging Face antes de descargar.
- Licencia de tipo "other" con términos comunitarios de LTX-2.x; revisar condiciones de uso comercial antes de integrarlo en productos.
- Solo inglés: no se declara soporte multilingüe.
- No es un modelo de chat ni de generación de texto; usarlo fuera del pipeline de vídeo LTX-2.5 no es su propósito.
- Cuantización 4-bit: puede degradar la fidelidad de los embeddings y, por tanto, la calidad del vídeo generado frente al encoder en precisión completa.
- Sin benchmarks ni métricas publicadas; no hay evidencia cuantitativa de calidad.
- Publicación muy reciente y sin tracción (0 descargas, 0 likes): menor garantía de mantenimiento o soporte.
- Formato MLX exclusivo para Apple Silicon; no portable a CUDA sin conversión.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de condicionamiento impreciso en prompts ambiguos.

## Enlaces

- Hugging Face: https://huggingface.co/Mrbizarro/gemma4-12b-ltx25-q4
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
