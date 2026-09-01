# arianraje/mimo-7b-gdn-opd-predecay-1337m-step8676

## Resumen

El modelo `arianraje/mimo-7b-gdn-opd-predecay-1337m-step8676` es un checkpoint intermedio de un experimento de investigación sobre destilación en línea (OPD, *Online Policy Distillation*) aplicada a un modelo de 7B parámetros basado en MiMo-7B de Xiaomi. El autor, arianraje, publica este repositorio como parte de un proceso de entrenamiento en curso, con un enfoque en el razonamiento y la recuperación de contexto largo. El nombre del checkpoint indica que corresponde al paso 8676 de entrenamiento, con una cantidad de tokens generados que el propio nombre sugiere como 1337 millones (aunque no está confirmado en la documentación).

El repositorio contiene 116.4 GB de datos, lo que apunta a que incluye pesos del modelo en BF16 y posiblemente shards de optimizador. La model card describe un procedimiento de recuperación para reanudar el entrenamiento en una nueva máquina, con requisitos de hardware muy específicos (tres GPUs H200-class) y un pipeline que combina dos ranks de entrenador con un sampler vLLM. No se trata de un modelo listo para producción, sino de un artefacto de investigación con métricas parciales reportadas en un punto anterior del entrenamiento (340M tokens). Su relevancia radica en el estudio de técnicas de destilación en línea y control de horizonte para mejorar el razonamiento en modelos de 7B, aunque su disponibilidad pública es limitada y su licencia no está especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de MiMo-7B, probablemente transformer con atención lineal o híbrida, sin confirmar) |
| Parametros totales | 7B (inferido del nombre, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | 16,384 (horizonte mencionado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en BF16 según la model card) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (presumible, no confirmado) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo, pero el nombre "gdn" sugiere el uso de *Gated Delta Net* o una variante de atención lineal, y el acrónimo OPD apunta a *Online Policy Distillation*, un método donde un modelo teacher guía al estudiante durante el entrenamiento. El teacher es `XiaomiMiMo/MiMo-7B-RL-0530`, un modelo de razonamiento de Xiaomi. El entrenamiento se realiza con dos ranks de entrenador y un sampler vLLM, con un horizonte de 16,384 tokens. El checkpoint actual (step 8676) es parte de una trayectoria que comenzó en el step 2350 con 353,104,411 tokens generados y un objetivo final de 403,158,000 tokens. El dataset de entrenamiento incluye 60,000 prompts de razonamiento, 15,011 prompts generales y una mezcla de validación de 32K tokens. No se menciona el uso de RLHF o DPO explícitamente, pero el método OPD implica una forma de destilación supervisada.

## Capacidades

- Razonamiento matemático: el modelo se entrena con prompts de razonamiento y se evalúa con GSM8K, aunque las métricas reportadas corresponden a un punto anterior (340M tokens).
- Recuperación de contexto largo: se evalúa con NIAH multikey-32K, lo que indica capacidad para manejar ventanas de 32K tokens.
- Generación de texto: al ser un modelo de lenguaje, puede generar texto, pero no hay información sobre otras capacidades como tool calling, agentes o multimodalidad.
- Multilingüismo: no se especifican idiomas soportados; el teacher MiMo-7B es principalmente inglés, pero no está confirmado.

## Casos de uso

- Investigación en destilación de modelos: el checkpoint es útil para estudiar cómo la destilación en línea afecta el razonamiento y la recuperación de contexto en modelos de 7B.
- Reproducción de experimentos: los investigadores pueden reanudar el entrenamiento desde este punto para validar resultados o explorar variaciones del método OPD.
- Evaluación de razonamiento matemático: se puede usar para probar el rendimiento en tareas tipo GSM8K y comparar con el teacher.
- Pruebas de recuperación de contexto largo: el modelo puede evaluarse en tareas NIAH para medir su capacidad de atender a información distante.
- Desarrollo de técnicas de control de horizonte: el entrenamiento con horizonte 16,384 permite investigar cómo el tamaño de la ventana afecta la calidad del razonamiento.
- Benchmarking de hardware: el pipeline de entrenamiento con tres H200s puede servir como referencia para medir el rendimiento de GPUs de alta gama en cargas de destilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint específico (step 8676). La model card reporta métricas en un punto anterior del entrenamiento (340M tokens), que se muestran a continuación a modo de referencia:

| Metrica | Valor (a 340M tokens) |
|---|---|
| NIAH multikey-32K | 0.800 (n=100) |
| GSM8K strict | 0.55876 |
| GSM8K flexible | 0.66187 |

Estos datos no son representativos del estado actual del modelo y no se comparan con otros modelos.

## Requisitos de hardware

- Entrenamiento: se requieren tres GPUs H200-class (al menos 130 GB de VRAM cada una), con un consumo máximo observado de 125.6 GB por trainer. El launcher rechaza GPUs con menos de 130 GB.
- Inferencia: no se especifican requisitos. Para un modelo de 7B en BF16, se estima al menos 14-16 GB de VRAM, pero no está confirmado.
- Despliegue: no se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama. El pipeline de entrenamiento usa vLLM como sampler, pero no para inferencia standalone.
- Almacenamiento: se necesitan al menos 230 GB de espacio libre para manejar los checkpoints y los guardados atómicos del optimizador.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos. El modelo es un derivado de MiMo-7B-RL-0530, pero no hay información sobre su rendimiento relativo. Se puede mencionar que el teacher (MiMo-7B-RL-0530) es un modelo de razonamiento de 7B de Xiaomi, pero no se conocen sus métricas en este contexto.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo final. No está optimizado para uso en producción.
- La licencia no está especificada, por lo que el uso comercial es incierto.
- El repositorio es público, pero el checkpoint de recuperación mencionado en la model card es privado, lo que limita la reproducibilidad.
- No hay información sobre sesgos, alucinaciones o limitaciones de idioma.
- El entrenamiento requiere hardware muy específico (H200) y software con versiones exactas (tilelang==0.1.12, etc.), lo que dificulta su ejecución en entornos estándar.
- Las métricas reportadas son de un punto anterior y no garantizan el rendimiento actual.

## Enlaces

- Repositorio del modelo: https://huggingface.co/arianraje/mimo-7b-gdn-opd-predecay-1337m-step8676
- Checkpoint relacionado (hybrid-200M-OPD): https://huggingface.co/arianraje/mimo-7b-gdn-hybrid-200M-OPD
- Checkpoint relacionado (predecay-737m-step4810): https://huggingface.co/arianraje/mimo-7b-gdn-opd-predecay-737m-step4810
- Paper de MiMo-7B (arXiv): https://arxiv.org/html/2505.07608v1
