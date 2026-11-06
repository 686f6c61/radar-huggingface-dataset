# austinpatel/bp_iphumi_bimanual_laundry_folding

## Resumen

`austinpatel/bp_iphumi_bimanual_laundry_folding` es un modelo de política de manipulación robótica bimanual publicado en Hugging Face por el usuario austinpatel, asociado al paper "What Enables In-Context Behavior Prompting for Manipulation?" (arXiv 2606.30457) y al repositorio de código `real-stanford/behavior_prompting`. No se trata de un modelo de lenguaje: es un artefacto de aprendizaje por imitación orientado a controlar un robot bimanual iPhUMI en la tarea concreta de doblar ropa (laundry folding), probablemente con pesos de política visual-motora.

El modelo se enmarca en la línea de investigación de *behavior prompting* o *in-context behavior prompting*, una técnica que busca condicionar la política de un robot mediante demostraciones o "prompts de comportamiento" en lugar de reentrenar por tarea. El repositorio pesa 12,9 GB, lo que sugiere pesos en precisión completa o mixta para una red de tamaño medio-grande, posiblemente con un codificador visual tipo ViT o similar. No se especifica pipeline, idiomas ni parámetros en la información disponible.

La relevancia actual del modelo es doble: por un lado, ejemplifica la tendencia a publicar políticas robóticas entrenadas como artefactos reutilizables en Hugging Face; por otro, el paper asociado aborda una pregunta central del campo, qué hace posible el condicionamiento en contexto para manipulación. La licencia MIT facilita su reutilización, aunque la información pública sobre arquitectura y datos es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de manipulación robótica; no es un LLM) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 12,9 GB; presumiblemente safetensors o checkpoint PyTorch, sin confirmar) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo. Dado el contexto (paper sobre *in-context behavior prompting* para manipulación y tarea de doblado bimanual), cabe esperar una política de aprendizaje por imitación con entrada visual y de estado propioceptivo, pero la model card no detalla si se trata de un transformer, una difusión de políticas, un modelo tipo ACT o una arquitectura híbrida. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste fino por refuerzo, algo poco habitual en robótica de manipulación pero no descartable.

La innovación declarada por el paper asociado es el *behavior prompting* en contexto: la capacidad de condicionar el comportamiento del robot mediante demostraciones o instrucciones sin reentrenar. Sin embargo, la ficha no puede confirmar detalles técnicos como decodificación especulativa, atención lineal, número de demostraciones necesarias o mecanismo exacto de condicionamiento, porque esa información no está en la model card ni en los metadatos proporcionados.

## Capacidades

- Control de un robot bimanual (plataforma iPhUMI) para la tarea específica de doblar ropa.
- Aprendizaje por imitación a partir de demostraciones, presumiblemente con entrada visual y propioceptiva.
- Condicionamiento en contexto mediante *behavior prompting*, según el paper asociado: la política puede adaptarse a variaciones de comportamiento sin reentrenamiento explícito.
- No consta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento tipo *thinking*.
- No consta capacidad de visión general (captioning, VQA) ni audio; la visión, si existe, está integrada como entrada de política.

## Casos de uso

- Investigación en manipulación bimanual: servir como política de referencia o *baseline* para experimentos de doblado de ropa con robots bimanuales, comparando variantes de *behavior prompting*.
- Reproducción de experimentos del paper: el repositorio `real-stanford/behavior_prompting` permite cargar los pesos y replicar los resultados reportados en arXiv 2606.30457.
- Evaluación de técnicas de condicionamiento en contexto: usar el modelo para estudiar cuántas demostraciones o qué tipo de prompt de comportamiento son necesarios para adaptar la política a nuevas prendas.
- Transferencia a tareas análogas de manipulación deformable: con ajuste fino, la política podría adaptarse a tareas como doblar toallas o colocar prendas en un cesto, aunque no está validado en la información disponible.
- Docencia y formación en robótica de imitación: ejemplo práctico de política publicada con licencia permisiva (MIT) para cursos de aprendizaje por imitación y manipulación.
- Integración en pipelines de investigación con simulación o hardware real: el checkpoint puede cargarse en un entorno de evaluación para medir robustez ante variaciones de iluminación, posición de la prenda o configuración del robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. El repositorio pesa 12,9 GB, por lo que en FP32 o FP16 se necesitarían al menos ~13-26 GB de VRAM solo para los pesos, más memoria para activaciones y observaciones visuales.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño del repo, una GPU con 24 GB o más (RTX 3090/4090, A100, H100) es un punto de partida razonable, pero no confirmado.
- ¿Cabe en GPU de consumo? Probablemente en RTX 3090/4090 si los pesos son FP16 y las activaciones son moderadas; no confirmado.
- Opciones de despliegue: no disponible. Al ser una política robótica, el despliegue típico sería un script Python con PyTorch cargando el checkpoint, no vLLM, llama.cpp, Ollama ni TGI, que están orientados a LLMs.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas bimanuales de doblado de ropa) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Información pública muy escasa: la model card solo incluye licencia, enlace al paper y enlace al código; no hay arquitectura, datos de entrenamiento ni métricas.
- Especialización estrecha: el modelo está entrenado para una tarea concreta (doblado de ropa bimanual con iPhUMI); no es un modelo de propósito general.
- Riesgo de sobreajuste al entorno de entrenamiento: sin datos de evaluación, no puede garantizarse robustez ante cambios de iluminación, fondo, tipo de prenda o configuración del robot.
- Sin datos sobre sesgos: no hay información sobre sesgos de comportamiento, aunque en robótica los sesgos se manifiestan como fallos sistemáticos ante ciertas condiciones.
- Riesgo de alucinación no aplicable en el sentido de LLM, pero sí riesgo de acciones erráticas o inseguras en manipulación real; se recomienda supervisión y límites de seguridad en hardware.
- Licencia MIT: permite uso comercial y modificaciones, pero conviene revisar las licencias de dependencias y del dataset de entrenamiento, no detalladas.
- Fecha de creación y actualización (2026) y ausencia de descargas o likes: modelo muy reciente o poco difundido; no hay evidencia de validación por la comunidad.
- No consta que los pesos estén en formatos estándar de inferencia (GGUF, ONNX); la integración requerirá el código del repositorio asociado.

## Enlaces

- Hugging Face: https://huggingface.co/austinpatel/bp_iphumi_bimanual_laundry_folding
- Paper: https://huggingface.co/papers/2606.30457
- Código: https://github.com/real-stanford/behavior_prompting
