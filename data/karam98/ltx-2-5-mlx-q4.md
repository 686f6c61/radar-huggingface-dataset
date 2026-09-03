# Karam98/ltx-2.5-mlx-q4

## Resumen

LTX-2.5 es un modelo fundacional multimodal de Lightricks orientado a generación de vídeo, audio y simulación de mundo. El repositorio `Karam98/ltx-2.5-mlx-q4` es una redistribución sin modificar del paquete cuantizado a 4 bits (group size 64) que Phosphene preparó para el runtime MLX `ltx-2-mlx`, diseñado para ejecutarse en Apple Silicon. Incluye el diffusion transformer cuantizado, el connector, el VAE de vídeo (encoder y decoder), el VAE de audio, el vocoder, los upscalers espacial y temporal x2 y el duration head, todo en formato de un solo archivo por componente.

Este espejo existe para garantizar la disponibilidad del paquete para instalaciones de Seein, un runtime de generación de vídeo para macOS. La relevancia actual radica en que permite ejecutar un modelo de vídeo de última generación en hardware de Apple sin necesidad de GPUs NVIDIA, aunque con las restricciones de la licencia comunitaria de LTX-2.x. El tamaño del repositorio es de 20,7 GB, lo que sugiere que la cuantización reduce significativamente el peso original, aunque no se dispone del número exacto de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) para vídeo, audio y simulación de mundo |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit, group size 64 (AdaLN, patch embedding y proyecciones de salida en bf16) |
| Idiomas soportados | no disponible |
| Licencia | LTX-2.x Community License (uso personal gratuito; entidades con ingresos anuales >= 10M USD requieren licencia comercial de pago) |
| Formato de pesos | safetensors (un archivo por componente, layout plano para `ltx-2-mlx`) |

## Arquitectura y entrenamiento

El modelo base LTX-2.5 es un diffusion transformer multimodal que genera vídeo, audio y simulaciones de mundo. Según la documentación oficial, existen dos variantes: `ltx-2-5-fast` (optimizada para velocidad y bajo coste, hasta 4K) y `ltx-2-5-pro` (mayor fidelidad, hasta 1080p). El modelo soporta escenas multi-shot en una sola pasada, edición de metraje real y exportación en formato EXR de grado cinematográfico. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens o el uso de RLHF/DPO en la información proporcionada.

La cuantización aplicada por Phosphene mantiene en bf16 las capas de AdaLN, el patch embedding y las proyecciones de salida, mientras que el resto del transformer se cuantiza a 4 bits con group size 64. El paquete incluye además los componentes auxiliares necesarios para la generación completa: VAE de vídeo, VAE de audio, vocoder, upscalers espacial y temporal x2 y el duration head. El runtime `ltx-2-mlx` (MIT) es el encargado de cargar y ejecutar estos componentes en Apple Silicon.

## Capacidades

- Generación de vídeo de alta calidad (hasta 4K en la variante fast, 1080p en pro) a partir de texto o condiciones de entrada.
- Generación de audio sincronizado con el vídeo, mediante el VAE de audio y el vocoder incluidos.
- Simulación de mundo: el modelo puede generar escenas coherentes multi-shot en una sola pasada, lo que permite narrativas más largas sin cortes.
- Edición de metraje real: capacidad de modificar o extender vídeos existentes, según la documentación oficial.
- Exportación en formato EXR de grado cinematográfico, útil para flujos de trabajo profesionales de postproducción.
- Soporte de upscaling espacial y temporal x2 mediante los componentes incluidos en el paquete.
- Ejecución nativa en Apple Silicon gracias a la conversión a MLX, sin necesidad de GPU NVIDIA.

## Casos de uso

- Producción cinematográfica y publicitaria: el modelo permite generar tomas de alta calidad y exportarlas en EXR para composición en postproducción. Su capacidad multi-shot facilita la creación de secuencias completas sin cortes visibles.
- Edición de vídeo profesional: los usuarios pueden editar metraje real, añadiendo o modificando elementos generados por IA, manteniendo coherencia temporal y espacial.
- Creación de contenido para redes sociales: generación rápida de vídeos verticales u horizontales en 4K (variante fast) para plataformas como TikTok, Instagram o YouTube, con audio sincronizado.
- Simulación de entornos para entrenamiento de agentes: la capacidad de simular mundos coherentes puede usarse en robótica o videojuegos para generar escenarios sintéticos.
- Prototipado de escenas en previsualización: directores y diseñadores pueden generar storyboards animados o previsualizaciones de alta fidelidad antes de la producción real.
- Investigación en generación multimodal: el modelo sirve como base para experimentos en generación de vídeo, audio y simulación, gracias a su naturaleza open-weight (bajo licencia comunitaria).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento del modelo cuantizado, y la documentación oficial de LTX-2.5 no proporciona tablas comparativas en los enlaces consultados.

## Requisitos de hardware

- El paquete está diseñado para Apple Silicon (chips M-series) mediante el runtime MLX `ltx-2-mlx`.
- Tamaño del repositorio: 20,7 GB, lo que sugiere que la cuantización 4-bit reduce el modelo a aproximadamente ese tamaño. Se recomienda un Mac con al menos 32 GB de memoria unificada para cargar todos los componentes (transformer, VAE, upscalers, vocoder) y dejar margen para la generación.
- No se especifican GPUs concretas, pero al ser MLX, solo es compatible con Apple Silicon (M1, M2, M3, M4 y sucesores).
- Opciones de despliegue: el runtime `ltx-2-mlx` (MIT) es el único soportado oficialmente para este formato. No se mencionan alternativas como vLLM u Ollama, ya que el modelo no es un LLM sino un generador de vídeo.
- Latencia y throughput: no disponibles. Dependerán del chip concreto (M1 Pro, M2 Max, M3 Ultra, etc.) y de la resolución de salida.

## Comparativa con modelos similares

| Modelo | Formato | Cuantizacion | Hardware objetivo | Licencia | Tamaño |
|---|---|---|---|---|---|
| Lightricks/LTX-2.5 (original) | safetensors (bf16) | Sin cuantizar | GPUs NVIDIA (CUDA) | LTX-2.x Community | no disponible |
| Karam98/ltx-2.5-mlx-q4 (este) | safetensors (MLX) | 4-bit (group size 64) | Apple Silicon | LTX-2.x Community | 20,7 GB |
| realrebelai/LTX-2.5_GGUFs | GGUF | no especificado | CPU/GPU (llama.cpp) | LTX-2.x Community | no disponible |

No se dispone de datos de rendimiento comparativo entre estas versiones. La principal diferencia es el formato de pesos y el hardware objetivo: el original requiere GPUs NVIDIA, mientras que la versión MLX está optimizada para Apple Silicon y la versión GGUF podría ejecutarse en CPU/GPU mediante llama.cpp, aunque no se confirma su funcionalidad completa.

## Limitaciones y advertencias

- Licencia restrictiva: el uso comercial está limitado para entidades con ingresos anuales superiores a 10 millones de dólares, que deben adquirir una licencia de pago de Lightricks. Cualquier redistribución debe incluir los términos de la licencia.
- Pérdida de calidad por cuantización: al ser una versión 4-bit, es probable que haya una degradación en la fidelidad del vídeo generado en comparación con el modelo original en bf16, aunque no se han publicado evaluaciones cuantitativas.
- Hardware limitado: solo funciona en Apple Silicon; no es compatible con GPUs NVIDIA ni AMD, lo que restringe su uso en centros de datos convencionales.
- Sin información sobre sesgos: no se han documentado sesgos conocidos del modelo base ni de la versión cuantizada.
- Riesgo de alucinación: como todo modelo generativo, puede producir contenido visual o de audio incoherente o no deseado, especialmente en escenas complejas o con prompts ambiguos.
- Dependencia del runtime `ltx-2-mlx`: el paquete está diseñado específicamente para este runtime, por lo que cualquier cambio en el mismo podría afectar la compatibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Karam98/ltx-2.5-mlx-q4
- Modelo base (Lightricks/LTX-2.5): https://huggingface.co/Lightricks/LTX-2.5
- Página oficial de LTX-2.5: https://ltx.io/model/ltx-2-5
- Documentación de LTX-2.5: https://docs.ltx.io/models/ltx-2-5
- Versión GGUF (realrebelai): https://huggingface.co/realrebelai/LTX-2.5_GGUFs
- Licencia comunitaria LTX-2.x (en el repo): https://huggingface.co/Karam98/ltx-2.5-mlx-q4/blob/main/LICENSE-LTX-2.x-Community-License.md
