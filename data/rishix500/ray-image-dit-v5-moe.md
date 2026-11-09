# Rishix500/ray-image-dit-v5-moe

## Resumen

RAY-IMAGE DiT v5 MoE es un checkpoint experimental de un Diffusion Transformer (DiT) para generación de imágenes texto-a-imagen a resolución 512 × 512, desarrollado por el usuario Rishix500 en el marco del proyecto RAY-IMAGE. Se trata de un modelo de difusión entrenado con flow matching (predicción de velocidad) que incorpora capas feed-forward de tipo Mixture of Experts disperso, con un experto compartido y ocho expertos enrutados SwiGLU bajo enrutamiento top-2. La configuración declarada ronda los 482M parámetros totales y 204M parámetros activos por token.

El repositorio alojado en Hugging Face no es un pipeline listo para usar, sino un archivo de hitos de entrenamiento (checkpoint archive) que preserva instantáneas seleccionadas entre los pasos 130.000 y 170.000, en versiones completas (unos 7,72 GB cada una) y solo EMA (unos 1,93 GB cada una). El repositorio principal del proyecto figura como privado y este archivo no incluye código fuente, tokenizer, encoder de texto, pesos del VAE ni interfaz de inferencia.

Su relevancia es, por tanto, acotada y de carácter investigador: documenta la evolución de un entrenamiento con MoE disperso en un DiT de tamaño medio, pero no constituye un modelo publicable para producción ni para evaluación comparativa estándar. No se han publicado resultados de FID, CLIP ni galería de muestras verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con flow matching y capas MoE dispersas (1 experto compartido + 8 expertos SwiGLU enrutados, top-2) |
| Parametros totales | Aproximadamente 482M |
| Parametros activos | Aproximadamente 204M por token |
| Longitud de contexto | No disponible (modelo de imagen; embeddings de texto de 128 × 2.560 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | Checkpoints PyTorch serializados (no safetensors, no GGUF) |

## Arquitectura y entrenamiento

El modelo es un Diffusion Transformer que opera sobre latentes de un VAE propio (v3) con forma 16 × 64 × 64, lo que corresponde a imágenes de 512 × 512 píxeles. El condicionamiento textual proviene de embeddings congelados de Qwen3-4B con forma 128 × 2.560. Las capas feed-forward son de tipo Mixture of Experts disperso: un experto compartido más ocho expertos SwiGLU enrutados mediante top-2, lo que da lugar a la relación entre parámetros totales (482M) y activos (204M). El entrenamiento utiliza flow matching con predicción de velocidad en lugar de la parametrización epsilon clásica.

El run v5 se inicializó en caliente desde el checkpoint de 120.000 pasos de v4. Los registros de entrenamiento citados por el autor muestran una mejora modesta de la pérdida hasta la región de ~170.000 pasos, con diagnósticos de enrutamiento equilibrados y descartes de capacidad (capacity drops) distintos de cero. El autor advierte explícitamente que estas métricas no demuestran una mejora en la calidad de imagen. No se detalla la composición del dataset, el número de tokens de entrenamiento ni si hubo etapas de ajuste fino con preferencias.

## Capacidades

- Generación de imágenes texto-a-imagen a 512 × 512 píxeles mediante muestreo de difusión con flow matching.
- Condicionamiento textual a partir de embeddings de Qwen3-4B, lo que hereda la cobertura lingüística de dicho encoder (no verificada en este archivo).
- Enrutamiento MoE disperso con top-2 sobre ocho expertos, lo que reduce los parámetros activos por token frente a un modelo denso equivalente.
- Reanudación de entrenamiento a partir de checkpoints completos (los archivos full incluyen el estado de optimizador y demás estado de entrenamiento).
- Muestreo a partir de checkpoints solo EMA, pensados como candidatos de inferencia.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo de pensamiento; es un modelo puramente generativo de imagen.

## Casos de uso

- Investigación sobre MoE disperso en difusión: comparar los hitos 130k, 140k, 150k, 160k y 170k con idénticos prompts, semillas, pasos de muestreo, escala CFG y VAE permite estudiar el efecto del enrutamiento top-2 sobre la convergencia.
- Reanudación de entrenamiento: los checkpoints completos (~7,72 GB) permiten retomar el run v5 desde un hito concreto conservando el estado del optimizador, útil para experimentos de ablación sobre la inicialización en caliente desde v4.
- Evaluación de la estabilidad del enrutamiento: los diagnósticos de balanceo y los capacity drops registrados permiten analizar si el reparto de tokens entre expertos se degrada con el entrenamiento.
- Estudio de la ruta latente VAE v3: al operar sobre latentes de 16 × 64 × 64, sirve para analizar la interacción entre la compresión del VAE y la calidad de reconstrucción en 512 × 512.
- Reproducción de experimentos académicos: como archivo de hitos, permite replicar curvas de pérdida y comparar configuraciones de flow matching frente a parametrizaciones alternativas.
- Integración en pipelines de investigación propios: los checkpoints EMA (~1,93 GB) son manejables en una sola GPU para experimentos de muestreo, siempre que se disponga del código, tokenizer, encoder Qwen3-4B y pesos del VAE correspondientes, que no se incluyen en este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que este archivo no incluye FID, CLIP ni galería de muestras verificada, y que la presencia de archivos en el repositorio se comprobó sin llegar a deserializar los checkpoints ni ejecutar inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un checkpoint EMA de ~1,93 GB en precisión de entrenamiento requiere al menos esa cantidad de memoria solo para los pesos, más la memoria del encoder Qwen3-4B (varios GB adicionales) y del VAE, que no se distribuyen en este repositorio.
- GPU recomendadas: no disponible. Por el tamaño del checkpoint EMA, cabría en GPUs de consumo con suficiente VRAM una vez añadidos encoder y VAE, pero no hay validación publicada.
- Los checkpoints completos (~7,72 GB) están pensados para reanudar entrenamiento y requieren bastante más memoria que la inferencia.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni Diffusers. El autor indica que no son pipelines de Diffusers autónomos y que falta la interfaz de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos, y las diferencias de configuración (VAE propio, encoder Qwen3-4B congelado, MoE top-2) dificultan una comparación directa sin datos de evaluación publicados.

## Limitaciones y advertencias

- Repositorio privado y de carácter experimental: no es un modelo listo para producción ni una release estable.
- Faltan componentes esenciales: no incluye código fuente, tokenizer, encoder Qwen3-4B, pesos del VAE ni interfaz de inferencia, por lo que los checkpoints no son utilizables de forma autónoma.
- Sin benchmarks: no hay FID, CLIP ni galería de muestras verificada; las métricas de pérdida y enrutamiento no demuestran mejora en calidad de imagen.
- Licencia no especificada: no se puede determinar si el uso comercial está permitido.
- Idiomas no declarados: la cobertura lingüística depende del encoder Qwen3-4B y no está verificada para este modelo.
- Riesgo de alucinación visual y de artefactos propio de modelos de difusión pequeños y en fase experimental, sin evaluación sistemática publicada.
- Sesgos no documentados: no hay información sobre la composición del dataset ni sobre sesgos demográficos o culturales.
- Los checkpoints son archivos PyTorch serializados, lo que implica riesgos de seguridad al deserializar archivos de origen no verificado; se recomienda usar `weights_only` o entornos aislados.
- El autor advierte que las comparaciones entre hitos solo son válidas con prompts, semillas, pasos, escala CFG y VAE idénticos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Rishix500/ray-image-dit-v5-moe
- Documentación del proyecto (README en GitHub): https://github.com/Rishidev-20thcenturey/rustes-generative-ai/blob/main/README.md
- Perfil del autor: https://huggingface.co/Rishix500
