# Rin247/Krea-2-Raw

## Resumen

Krea-2-Raw es un checkpoint base de generación de imágenes text-to-image desarrollado por Krea, distribuido en este repositorio por el usuario Rin247 como paquete cuantizado bajo la denominación MECHA Forge. Se trata de un modelo de difusión con arquitectura DiT (Diffusion Transformer) densa de 12.000 millones de parámetros, sin destilar, pensado como base maleable para fine-tuning, post-entrenamiento y entrenamiento de LoRA. Emplea un text encoder Qwen3-VL y el VAE de Qwen-Image, y se ejecuta con el sampler completo (52 pasos, CFG 3.5) a resoluciones de hasta 1024 px.

La relevancia de este repositorio concreto radica en que empaqueta el denoiser, el text encoder y el VAE en un único paquete cuantizado (FP4, FP8, INT4 o INT8), lo que simplifica el despliegue en comparación con el modelo base original. Al ser un modelo no destilado, requiere CFG y un número elevado de pasos, pero ofrece mayor capacidad de guiado y versatilidad para adaptaciones posteriores.

El repositorio tiene 58,8 GB, 117 descargas y 0 likes en el momento de la consulta, y se distribuye en formato safetensors compatible con la librería diffusers mediante el pipeline `Krea2Pipeline`. No se dispone de información sobre licencia ni sobre idiomas soportados en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) densa |
| Parametros totales | 12B (denoiser) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; resolución máxima 1024 px) |
| Tipos de cuantizacion | FP4, FP8, INT4, INT8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (diffusers) |
| Text encoder | Qwen3-VL |
| VAE | Qwen-Image VAE |
| Pasos de muestreo recomendados | 52 |
| CFG / guidance scale | 3.5 |
| Resolución recomendada | 1024 px |
| Tamaño del repo | 58,8 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Diffusion Transformer (DiT) densa de 12.000 millones de parámetros en el denoiser, combinada con un text encoder Qwen3-VL para la codificación de prompts y el VAE de Qwen-Image para la decodificación latente a píxeles. Al tratarse de un checkpoint "Raw" (no destilado), el modelo no incorpora los atajos de destilación que reducen el número de pasos; por ello requiere el sampler completo con 52 pasos y CFG de 3.5 para obtener resultados óptimos.

No se dispone de información en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. La model card describe el checkpoint como "maleable" y "altamente dirigible" (highly steerable), lo que sugiere que está pensado como punto de partida para adaptaciones posteriores más que como modelo de inferencia final. Las cuantizaciones disponibles (FP4, FP8, INT4, INT8) son de tipo weight-only según las etiquetas del repositorio, y el VAE se comparte entre formatos: FP4 reutiliza el archivo FP8 e INT4 reutiliza el INT8.

## Capacidades

- Generación de imágenes text-to-image a partir de prompts descriptivos en lenguaje natural.
- Producción de imágenes fotorrealistas de escenarios, retratos y composiciones de estilo editorial.
- Generación de fotografía de moda y estilo de portada de revista, según los ejemplos de la model card.
- Generación de escenas candidas y de "slice of life" con iluminación natural.
- Base para fine-tuning, post-entrenamiento y entrenamiento de LoRA gracias a su naturaleza no destilada y maleable.
- Guiado mediante CFG (classifier-free guidance) para control de la adherencia al prompt.
- Soporte de cuantización en cuatro formatos para distintos presupuestos de memoria.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades de audio o vídeo.

## Casos de uso

- Generación de imágenes para prototipado de producto: el modelo puede producir composiciones fotorrealistas de escenarios y objetos a 1024 px con 52 pasos, útil para iterar conceptos visuales antes de encargar renders finales.
- Entrenamiento de LoRA sobre estilos propios: al ser un checkpoint base no destilado y maleable, sirve como punto de partida para adaptar el modelo a un estilo de marca o a un dominio visual concreto mediante LoRA.
- Fotografía de moda sintética: los ejemplos de la model card muestran capacidad para generar retratos editoriales con control de vestuario, iluminación y composición, aplicable a moodboards y previsualización de campañas.
- Generación de fondos y escenarios para ilustración: escenas de paisaje con iluminación dramática (por ejemplo, acantilados costeros a golden hour) para su uso como material de fondo en proyectos creativos.
- Investigación en difusión: el paquete cuantizado permite ejecutar experimentos de generación con distintos niveles de precisión (FP4, FP8, INT4, INT8) para estudiar el impacto de la cuantización en la calidad de salida.
- Despliegue simplificado en entornos con memoria limitada: al empaquetar denoiser, text encoder y VAE en un único paquete cuantizado, reduce la complejidad de montar un pipeline de difusión completo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio ocupa 58,8 GB, pero el peso en memoria de inferencia depende del formato de cuantización elegido (FP4, FP8, INT4 o INT8) y del componente (denoiser, text encoder, VAE).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; depende de la cuantización seleccionada y del pipeline completo.
- Opciones de despliegue: librería diffusers con el pipeline `Krea2Pipeline`; no se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI) en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo no destilado: requiere el sampler completo (52 pasos, CFG 3.5), lo que implica mayor coste computacional por imagen que variantes destiladas.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base `krea/Krea-2-Raw` antes de usarlo en producción.
- Idiomas soportados no disponibles: no se documenta el comportamiento multilingüe del text encoder Qwen3-VL en este contexto.
- Repositorio de terceros: se trata de una cuantización publicada por el usuario Rin247, no por el autor original Krea; la fidelidad de la cuantización respecto al modelo base no está verificada en la información disponible.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir detalles anatómicos o compositivos inconsistentes con el prompt.
- Sesgos: no se documentan sesgos conocidos en la información proporcionada; cabe esperar los sesgos presentes en los datos de entrenamiento del modelo base, no detallados.
- Sin métricas de calidad publicadas: no hay benchmarks que permitan evaluar la degradación introducida por cada formato de cuantización.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Rin247/Krea-2-Raw
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
