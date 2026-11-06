# Charlie320/zils-lite-k1c

## Resumen

zils-lite-k1c es un ajuste fino (fine-tune) de Qwen/Qwen3.5-0.8B publicado por el usuario Charlie320 bajo el paraguas del proyecto Zils, un pool de modelos orientado a la subnet 127 de Bittensor. El modelo se presenta como un "body" (cuerpo) para el pool de mezclas `d3-lite`, es decir, una de las piezas que el proyecto combina mediante técnicas de model soup para construir su modelo de decisión. Con 852.985.920 parámetros (aproximadamente 0,85 mil millones), se sitúa en la gama ultraligera de modelos de lenguaje.

El modelo parte de la media uniforme de tres "house bodies" previos (vllm-sr/d3-lite, Maincode/Matilda-Decision-v1-Edge y zils-ai/jiwo-0.8b-full) y se entrena con un ajuste fino de todos los parámetros a través del chasis del pool. Mantiene la torre de visión del modelo padre, aunque la model card no detalla el alcance exacto de las capacidades multimodales resultantes.

Su relevancia es acotada: se trata de un artefacto experimental con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación de idiomas. Resulta interesante como ejemplo de la dinámica de los pools de modelos en subnets de Bittensor y como caso de estudio de model soups sobre modelos pequeños, pero no como una opción consolidada para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B; detalles no disponibles) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,85 mil millones de parámetros. La model card no aporta detalles sobre el número de capas, dimensión oculta, mecanismo de atención ni longitud de contexto nativa. El modelo se describe como un "chassis layout" con pesos de lenguaje entrenados y torre de visión heredada del padre, lo que sugiere una estructura multimodal con componentes separados de lenguaje y visión.

El entrenamiento consistió en un ajuste fino de todos los parámetros (full-parameter fine-tune) partiendo de la media uniforme de tres modelos: vllm-sr/d3-lite, Maincode/Matilda-Decision-v1-Edge y zils-ai/jiwo-0.8b-full, todos bajo licencia Apache-2.0. Los datos de entrenamiento son "preguntas computadas generadas por el proyecto" y particiones de entrenamiento públicas bajo sus propias licencias. No se documentan número de tokens, composición del dataset, ni si hubo RLHF o DPO. Tampoco se especifican innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del modelo base Qwen/Qwen3.5-0.8B, sin evaluación específica publicada para este fine-tune.
- Visión: la model card indica que la torre de visión proviene del modelo padre, por lo que se espera soporte de entrada de imágenes, aunque no se detalla el alcance ni la calidad.
- Tool calling / function calling: no disponible en la documentación.
- Agentes y razonamiento multi-paso: el modelo se etiqueta como "decision-model", lo que sugiere un uso orientado a toma de decisiones dentro del pool Zils, pero no se documentan capacidades agénticas concretas.
- Capacidades multilingües: no disponibles; la model card no lista idiomas.
- Capacidades especiales: no se documentan modos de pensamiento (thinking), audio ni otras modalidades más allá de la visión heredada.

## Casos de uso

- Experimentación con model soups: el modelo sirve como componente para reproducir o ampliar el pool `d3-lite` de Zils, promediando pesos con otros bodies para estudiar el efecto de las mezclas en modelos de menos de 1B de parámetros.
- Investigación en subnets de Bittensor: útil para analizar cómo se construyen y evalúan modelos en la subnet 127, incluyendo el flujo de chasis, bodies y pools.
- Prototipado de modelos de decisión ligeros: al estar etiquetado como decision-model, puede probarse en tareas de clasificación o selección de acciones en entornos simulados, siempre con validación propia.
- Despliegue en entornos con recursos muy limitados: con 0,85B de parámetros en BF16 (aproximadamente 1,7 GB de pesos), es viable en GPUs de consumo para pruebas de inferencia básica.
- Fine-tuning educativo: su tamaño reducido y licencia Apache-2.0 lo hacen adecuado para experimentos de ajuste fino y comparación de técnicas de entrenamiento.
- Evaluación comparativa de fine-tunes sobre Qwen3.5-0.8B: puede usarse como punto de referencia en estudios que comparen distintos ajustes del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en BF16 solo para los pesos; con overhead de activaciones y caché KV, se recomienda al menos 4 GB para contexto corto.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM para BF16; para cuantización a 8 bits o 4 bits (no publicada, pero factible con herramientas externas) bastarían 2-3 GB.
- GPU de consumo: cabe en RTX 3060, RTX 4060, RTX 4090 y similares; también en GPUs integradas con suficiente memoria compartida para pruebas.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI son compatibles en principio con safetensors de Qwen, aunque no se documenta soporte oficial para este fine-tune concreto.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-k1c | 852.985.920 | no disponible | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B | ~0,8B | no disponible | no disponible en la informacion | Hugging Face (modelo base) |
| vllm-sr/d3-lite | no disponible | no disponible | Apache-2.0 | Hugging Face (house body) |
| Maincode/Matilda-Decision-v1-Edge | no disponible | no disponible | Apache-2.0 | Hugging Face (house body) |
| zils-ai/jiwo-0.8b-full | no disponible | no disponible | Apache-2.0 | Hugging Face (house body) |

No se dispone de datos de rendimiento comparativo para ninguno de los modelos de la tabla.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas publicadas que permitan evaluar su calidad frente al modelo base u otros fine-tunes.
- Documentación mínima: la model card no especifica idiomas, contexto, composición del dataset ni detalles de entrenamiento, lo que dificulta la reproducibilidad.
- Riesgo de alucinación: como todo modelo de lenguaje de tamaño reducido, es propenso a generar información incorrecta, especialmente en dominios especializados.
- Sesgos desconocidos: al no documentarse la composición del dataset de entrenamiento, no es posible evaluar sesgos de género, raza, idioma o dominio.
- Licencia Apache-2.0: permite uso comercial, pero los datos de entrenamiento públicos pueden tener sus propias licencias; la model card advierte explícitamente de comprobar los términos de los datasets originales antes de reutilizar.
- Madurez: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación por la comunidad.
- Capacidades multimodales inciertas: aunque se hereda la torre de visión, no se documenta su funcionamiento ni su calidad tras el fine-tune.
- Fecha de creación futura (2026-11-05): conviene verificar la autenticidad y vigencia del repositorio antes de confiar en él.

## Enlaces

- Hugging Face: https://huggingface.co/Charlie320/zils-lite-k1c
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- House body 1: https://huggingface.co/vllm-sr/d3-lite
- House body 2: https://huggingface.co/Maincode/Matilda-Decision-v1-Edge
- House body 3: https://huggingface.co/zils-ai/jiwo-0.8b-full
