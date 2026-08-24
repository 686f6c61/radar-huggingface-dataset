# Saraswathy/vlm-mix-resume-spatial-expert-step75

## Resumen

Este repositorio contiene el estado completo de reanudación del entrenamiento (resume checkpoint) del paso 75 de un experimento denominado "spatial-expert" realizado con el marco EasyR1. El modelo base es `Qwen/Qwen3-VL-4B-Instruct`, un modelo multimodal de 4 mil millones de parámetros desarrollado por Alibaba Cloud que procesa texto e imágenes. El objetivo del experimento es especializar al modelo en razonamiento espacial, un área donde los VLMs actuales muestran deficiencias, según la literatura reciente sobre inteligencia espacial en modelos de visión-lenguaje.

Este repositorio **no contiene un modelo fusionado listo para inferencia**, sino los artefactos intermedios de un proceso de entrenamiento: shards FSDP del modelo y del optimizador, estado del dataloader, estado adicional y el adaptador LoRA. Es un recurso pensado para investigadores que deseen continuar o reproducir el entrenamiento, no para usuarios que busquen un modelo servible. La licencia no está especificada, los idiomas no están documentados y el repositorio no ha recibido descargas ni valoraciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión + texto) basado en Qwen/Qwen3-VL-4B-Instruct, con adaptador LoRA |
| Parametros totales | No disponible (el modelo base tiene 4B; el adaptador LoRA es una fracción, pero no se especifica su tamaño) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del base, pero no se indica) |
| Tipos de cuantizacion | No disponible (no es un modelo de inferencia; se almacenan pesos en precisión de entrenamiento) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (shards FSDP) + adaptador PEFT (librería `peft`) |

## Arquitectura y entrenamiento

El checkpoint se basa en la arquitectura de `Qwen/Qwen3-VL-4B-Instruct`, un transformer multimodal que combina un codificador visual con un modelo de lenguaje autoregresivo. El entrenamiento se realizó con el marco EasyR1, un sistema de entrenamiento para modelos de razonamiento de visión-lenguaje (VLM) que utiliza aprendizaje por refuerzo. En el paso 75, el estado guardado incluye los shards de FSDP (modelo y optimizador), el estado del dataloader y el adaptador LoRA. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados, la configuración de hiperparámetros ni si se aplicó RLHF o DPO. El repositorio incluye un archivo `SHA256SUMS.json` para verificar la integridad de todos los archivos antes de reanudar el entrenamiento.

## Capacidades

- No es un modelo de inferencia: no se puede cargar directamente en un pipeline de generación de texto o imagen.
- Hereda las capacidades del modelo base `Qwen/Qwen3-VL-4B-Instruct` (comprensión de imagen y texto, generación de texto, razonamiento multimodal), pero no se ha validado el efecto del adaptador espacial en este checkpoint.
- El adaptador LoRA está diseñado para mejorar el razonamiento espacial, pero no se documentan pruebas ni evaluaciones.
- No se indica soporte para tool calling, agentes, ni capacidades multilingües específicas en este checkpoint.

## Casos de uso

- **Reanudación de entrenamiento**: el caso de uso principal es continuar el entrenamiento desde el paso 75 con EasyR1. Un investigador puede cargar los shards FSDP, el estado del optimizador y el dataloader para seguir con el experimento sin perder el progreso.
- **Reproducibilidad**: permite replicar exactamente el estado del entrenamiento para verificar resultados o comparar variantes del mismo experimento.
- **Auditoría de entrenamiento**: se puede analizar los shards para inspeccionar las métricas internas del optimizador, la distribución de pesos del adaptador LoRA, o el estado del dataloader en el paso 75.
- **Fusión del adaptador**: si se completa el entrenamiento, el adaptador LoRA puede fusionarse con el modelo base para producir un modelo de inferencia espacial. Este checkpoint no está fusionado.
- **Investigación sobre razonamiento espacial**: para estudiar cómo el modelo aprende relaciones espaciales (posiciones relativas, distancias, orientaciones) en un VLM de 4B, aunque se necesitaría continuar el entrenamiento para evaluar.
- **Integración en pipelines de experimentación**: como parte de un flujo de entrenamiento distribuido con FSDP, este checkpoint puede integrarse en un sistema de entrenamiento automatizado para reanudar tras interrupciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni pruebas de razonamiento espacial.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El modelo base Qwen3-VL-4B-Instruct requiere aproximadamente 8-10 GB de VRAM en FP16 para inferencia, pero este checkpoint incluye shards FSDP del optimizador (que duplican el uso de memoria) y no está pensado para inferencia.
- **GPU recomendadas**: para reanudar el entrenamiento con FSDP, se recomienda al menos una GPU con 24 GB de VRAM (RTX 3090/4090, A10G) o un clúster multi-GPU. No se especifica en la documentación.
- **GPU consumer**: no es adecuado para GPU de consumo con menos de 16 GB, dado el tamaño del repositorio (11.8 GB) y los requisitos de FSDP.
- **Opciones de despliegue**: no aplicable para inferencia. Para entrenamiento, se usaría el marco EasyR1 con PyTorch FSDP.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de rendimiento ni se identifica modelos comparables en el repositorio. El modelo base Qwen3-VL-4B-Instruct se puede comparar con otros VLMs de tamaño similar (como Phi-3.5-vision o Llama-3.2-11B-Vision), pero este checkpoint no contiene resultados de evaluación.

## Limitaciones y advertencias

- **No es un modelo de inferencia**: no se puede usar para generar respuestas ni procesar imágenes directamente. Requiere fusión del adaptador LoRA con el modelo base.
- **Licencia desconocida**: no se publica la licencia del modelo ni del adaptador. El uso comercial podría estar restringido según la licencia de Qwen3-VL-4B-Instruct (Apache 2.0) o la del dataset de entrenamiento, que no se indica.
- **Riesgo de sobreajuste**: el entrenamiento se detuvo en el paso 75, probablemente una etapa temprana. El adaptador puede no haber convergido y podría tener un rendimiento pobre en razonamiento espacial.
- **Verificación de integridad**: el autor recomienda verificar todos los archivos contra `SHA256SUMS.json` antes de reanudar. No hay garantía de que los shards estén completos o sin corrupción.
- **Sin evaluación publicada**: no se han publicado métricas de calidad, sesgos ni alucinaciones. No se puede afirmar que el modelo espacial funcione correctamente.
- **Idiomas**: no se especifican idiomas soportados; el modelo base soporta principalmente inglés y chino, pero esto no está documentado para el adaptador.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Saraswathy/vlm-mix-resume-spatial-expert-step75
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Marco EasyR1: no se proporciona enlace en la información disponible
- Artículo de referencia sobre razonamiento espacial (SpatialVLM): https://spatial-vlm.github.io/
- Encuesta sobre inteligencia espacial en VLMs: https://www.techrxiv.org/doi/10.36227/techrxiv.176231405.57942913
