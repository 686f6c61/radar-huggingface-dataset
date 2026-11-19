# Renedffd/DMAD

## Resumen

DMAD (Distribution Matching as Adversarial Distillation) es una familia de estudiantes destilados del modelo generativo MiniMax-H3, desarrollada por Zhengming Yu, Junkun Yuan, Haotian Yang y colaboradores de Texas A&M University y ByteDance. El objetivo es reducir drásticamente el coste de muestreo de la generación conjunta de vídeo y audio: donde el profesor MiniMax-H3 necesita 50 pasos de difusión para producir un clip de 1344x768 con audio estéreo nativo, los estudiantes de DMAD generan contenido equivalente en 4 u 8 pasos.

El repositorio aloja adaptadores LoRA de rango 128 sobre el transformer de H3 (33B parámetros), junto con estudiantes destilados de otros modelos (Wan2.1-T2V en 1.3B y 14B, SDXL en 4 y 1 paso, y EDM ImageNet-64 en 1 paso). La técnica combina matching de distribuciones con un crítico adversarial que actúa como discriminador sobre las muestras del estudiante, un enfoque de destilación por adversario aplicado a modelos de difusión de gran escala.

La relevancia práctica es alta: los LoRA de 1.4 GB (o 2.0 GB en formato ComfyUI) se aplican sobre el checkpoint base de MiniMax-H3 y permiten inferencia en GPUs de consumo. Los flujos de trabajo publicados generan vídeos de 5 segundos en menos de 7 GiB de VRAM y de 15 segundos en 12 GiB, lo que democratiza la generación audio-vídeo de alta fidelidad en hardware asequible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (MiniMax-H3, 50 bloques + 2 bloques token-refiner) con destilación adversarial; LoRA de rango 128 sobre módulos de atención y feed-forward |
| Parametros totales | 33B (modelo base MiniMax-H3); los adaptadores LoRA suman 1.4 GB (2.0 GB en formato ComfyUI) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (generación de vídeo de 5 s y 15 s; resolución 1344x768) |
| Tipos de cuantizacion | no disponible (el repo distribuye safetensors en precisión completa; los flujos ComfyUI permiten cuantización del base, no especificada) |
| Idiomas soportados | no disponible (modelo multimodal texto-a-vídeo-audio; el prompt textual se asume en inglés por defecto, no confirmado) |
| Licencia | minimax-h3-community-license-agreement (license: other) |
| Formato de pesos | safetensors (claves Diffusers y claves ComfyUI en archivos separados) |

## Arquitectura y entrenamiento

El modelo base MiniMax-H3 es un transformer de difusión de 33B parámetros para generación conjunta de vídeo y audio, con 50 bloques transformer más 2 bloques de token-refiner. DMAD no reentrena el modelo base: entrena adaptadores LoRA de rango 128 (alpha = rank = 128) sobre los módulos `attn.to_q/to_k/to_v/to_out.0`, `ff.net.0.proj` y `ff.net.2` de los 52 bloques, cubriendo 312 módulos en total. Los LoRA se aplican sobre el profesor congelado y se destilan mediante un crítico adversarial que puntúa las muestras del estudiante, combinando matching de distribuciones con la señal del discriminador.

El entrenamiento parte de los datos publicados por los autores: el dataset DMAD-H3-data (muestras del profesor MiniMax-H3) y DMAD-Wan-data (42.158 muestras del profesor Wan2.1-14B con sus latentes de vídeo real). La receta principal del paper mantiene el crítico congelado bajo un LoRA; la variante `full_critic` entrena la totalidad del backbone del crítico y obtiene mejores puntuaciones en AVGen-Bench. El estudiante de 8 pasos se entrena desde cero con muestreo de 8 pasos y, según el autor, mejora claramente la calidad audio-vídeo respecto a los estudiantes de 4 pasos.

## Capacidades

- Generación de vídeo texto-a-vídeo a 1344x768 con audio estéreo nativo generado conjuntamente.
- Muestreo acelerado: 4 pasos (estudiantes `lora_critic` y `full_critic`) u 8 pasos (`8step_full_critic`) frente a los 50 pasos del profesor.
- Generación de clips de 5 s y 15 s de duración según configuración de VRAM.
- Compatibilidad con ComfyUI mediante LoRA en el layout de claves nativo de MiniMax-H3 (conversión exacta).
- Inferencia de bajo VRAM: `--low-vram` en el repositorio de código y flujos ComfyUI para GPUs de 8 GB y 16 GB.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otros idiomas distintos del prompt textual de generación.

## Casos de uso

- Generación de vídeo publicitario con audio: el estudiante de 8 pasos produce clips de 1344x768 con audio estéreo en 8 evaluaciones del transformer, lo que permite iterar creativamente en segundos por clip en una GPU de 16 GB.
- Prototipado rápido en estaciones de trabajo con GPU de consumo: con `--low-vram` se generan vídeos de 5 s en menos de 7 GiB y de 15 s en 12 GiB, adecuado para estudios pequeños sin clústeres A100/H100.
- Integración en ComfyUI para artistas técnicos: los LoRA en layout ComfyUI (2.0 GB) se cargan directamente en los flujos de 4 y 8 pasos publicados, sin conversión manual de pesos.
- Investigación en destilación de modelos generativos: el repositorio incluye estudiantes de Wan2.1 (1.3B, 14B), SDXL (4 y 1 paso) y EDM ImageNet-64 (1 paso), lo que permite reproducir y comparar la receta DMAD entre arquitecturas y escalas.
- Generación de contenido audio-vídeo para redes sociales: clips de 15 s con audio nativo en 12 GiB de VRAM encajan en flujos de producción de contenido corto sin pipeline separado de TTS o música.
- Benchmarking de modelos generativos: la variante `full_critic` reporta mejores puntuaciones en AVGen-Bench que `lora_critic`, útil como referencia para evaluar técnicas de destilación adversarial en modelos multimodales grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que `full_critic` obtiene mejores puntuaciones en AVGen-Bench que `lora_critic`, pero no se proporcionan cifras numéricas.

## Requisitos de hardware

- VRAM estimada: menos de 7 GiB para vídeos de 5 s con `--low-vram`; 12 GiB para vídeos de 15 s; 14 GiB para los flujos ComfyUI de 4 y 8 pasos (bit-idénticos a ejecuciones en GPUs mayores).
- GPU recomendadas: no se especifican modelos concretos; los flujos están validados para GPUs de 8 GB y 16 GB. Para el modelo base MiniMax-H3 de 33B en precisión completa se requiere hardware de datacenter (A100/H100), no confirmado en la información.
- Cabe en GPU de consumo: sí, con los flujos ComfyUI y `--low-vram` en GPUs de 8 GB y 16 GB.
- Opciones de despliegue: ComfyUI (flujos publicados en `minimax_h3/workflows`), repositorio de código propio (`train/h3`, `train/wan`, `train/image`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión).
- Latencia y throughput: no disponibles en cifras absolutas; la reducción de 50 a 4 u 8 pasos implica una aceleración teórica de 6,25x a 12,5x en el número de evaluaciones del transformer.

## Comparativa con modelos similares

| Modelo | Parametros | Pasos de muestreo | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DMAD (MiniMax-H3 student) | 33B base + LoRA 1.4 GB | 4 u 8 | 1344x768, audio nativo | minimax-h3-community-license-agreement | Hugging Face, ModelScope, ComfyUI |
| MiniMax-H3 (profesor) | 33B | 50 | 1344x768, audio nativo | minimax-h3-community-license-agreement | Hugging Face (MiniMaxAI/MiniMax-H3) |
| DMAD (Wan2.1-T2V student) | 1.3B y 14B | 4 | no disponible | no disponible en esta ficha | Hugging Face, dataset DMAD-Wan-data |
| DMAD (SDXL student) | no disponible | 4 y 1 | no disponible | no disponible en esta ficha | Hugging Face |

## Limitaciones y advertencias

- Licencia `minimax-h3-community-license-agreement`: uso comercial sujeto a los términos del acuerdo de comunidad de MiniMax-H3; revisar el archivo LICENSE antes de desplegar en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación reciente (creado el 2026-11-19) sin validación comunitaria extensa.
- Los estudiantes de 4 pasos pueden presentar menor calidad audio-vídeo que el de 8 pasos; el autor recomienda explícitamente el `8step_full_critic` para mejor calidad.
- Riesgo de alucinación visual y de desalineación prompt-vídeo inherente a los modelos de difusión texto-a-vídeo; no se documentan evaluaciones de sesgo.
- Idiomas soportados no documentados; el prompt textual podría no funcionar igual de bien en castellano que en inglés.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; no es un modelo de lenguaje general.
- El tamaño del repo (60.4 GB) incluye el modelo base y los adaptadores; el despliegue requiere descargar MiniMax-H3 por separado si no se usa el repo completo.

## Enlaces

- Hugging Face: https://huggingface.co/Renedffd/DMAD
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Paper (arXiv): https://arxiv.org/abs/2610.02188
- Página del proyecto: https://yzmblog.github.io/projects/DMAD/
- Código: https://github.com/Yzmblog/DMAD
- ModelScope: https://modelscope.ai/models/ZhengmingYu-Community/DMAD
- ModelScope CN: https://modelscope.cn/models/ZhengmingYu-Community/DMAD
- Vídeo demo: https://www.youtube.com/watch?v=cOCUCYZzAtE
- Dataset MiniMax-H3: https://huggingface.co/datasets/ZhengmingYu/DMAD-H3-data
- Dataset Wan2.1: https://huggingface.co/datasets/ZhengmingYu/DMAD-Wan-data
