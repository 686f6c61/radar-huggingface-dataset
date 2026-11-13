# rsoohyun213/Qwen3-VL-4B-Instruct-S2v20_mix_s1-gpt-6-luna-full_SFT_fixed_np

## Resumen

Qwen3-VL-4B-Instruct-S2v20_mix_s1-gpt-6-luna-full_SFT_fixed_np es un ajuste fino por supervisión (SFT) del modelo multimodal Qwen/Qwen3-VL-4B-Instruct, publicado por el usuario rsoohyun213 en Hugging Face. El modelo conserva la arquitectura y el pipeline image-text-to-text del modelo base (Qwen3-VL, familia de modelos de visión-lenguaje de Alibaba Qwen), pero ha sido reentrenado con TRL sobre un conjunto de datos propietario que, a juzgar por el nombre del checkpoint, parece orientado a razonamiento espacial y tareas mixtas de instrucciones.

El interés de esta ficha es limitado desde el punto de vista de producción: se trata de un checkpoint de investigación con cero descargas y cero likes en el momento de la consulta, sin model card sustantiva (la card es la plantilla autogenerada por TRL), sin licencia declarada de forma explícita y sin datos publicados de benchmarks, idiomas o composición del dataset de entrenamiento. El nombre del repositorio sugiere una experimentación interna con múltiples etapas (s2, s4, s5), mezcla de datos y un "cold start" sobre 1500 muestras, pero no hay documentación que lo respalde.

Por tanto, esta ficha describe principalmente las capacidades heredadas del modelo base Qwen3-VL-4B-Instruct y advierte de que cualquier uso en producción exige una evaluación propia, dado que el ajuste fino puede haber degradado capacidades generales o introducido sesgos específicos del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) basada en Qwen3-VL; detalles internos no disponibles |
| Parametros totales | 569.856 (según safetensors del repo; discrepante con el "4B" del nombre y del modelo base, dato no verificado) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-VL-4B-Instruct, no documentada en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin concretar; el modelo base Qwen3-VL tiene su propia licencia) |
| Formato de pesos | safetensors (también compatible con transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3-VL-4B-Instruct, un modelo de la familia Qwen3-VL que combina un codificador visual con un decoder de lenguaje para tareas image-text-to-text. No se dispone de detalles sobre la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención, resolución de imagen soportada) más allá de lo que hereda del modelo base, que no se documenta en la información proporcionada.

El entrenamiento se realizó con SFT (supervised fine-tuning) usando la librería TRL 1.3.0 sobre Transformers 4.57.6, PyTorch 2.8.0+cu128, Datasets 4.8.5 y Tokenizers 0.22.2. El nombre del checkpoint ("S2v20_mix_s1_cold_start_gpt-6-luna_n1500@full_SFT_fixed_np") sugiere una mezcla de datos de varias etapas (s2, s4, s5), un arranque en frío con 1500 muestras y posiblemente datos generados o filtrados con un modelo "gpt-6-luna". No hay información sobre el número total de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO posterior ni sobre innovaciones técnicas específicas. El run de entrenamiento está enlazado a un panel de Weights & Biases alojado en forge.coreweave.com, pero no se ha verificado su contenido.

## Capacidades

- Generación de texto y respuestas conversacionales multi-turno, heredadas del modelo base Qwen3-VL-4B-Instruct.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text): descripción de imágenes, respuesta a preguntas visuales y razonamiento sobre contenido visual.
- Razonamiento espacial y sobre escenas, presumiblemente reforzado por el dataset de ajuste (el run de W&B se llama "spatial_reasoning@SFT-full"), aunque no hay evaluación publicada que lo confirme.
- Soporte de tool calling / function calling: no disponible de forma explícita en la información; probablemente heredado del modelo base, pero sin verificar tras el ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; dependen del modelo base y del dataset de SFT, desconocido.
- Modo "thinking" o razonamiento extendido: no documentado.

## Casos de uso

- Evaluación comparativa de ajustes finos multimodales: usar este checkpoint como referencia frente al Qwen3-VL-4B-Instruct original para medir el efecto del SFT en tareas de razonamiento espacial, con la precaución de que no hay métricas publicadas.
- Investigación en razonamiento espacial: el nombre del run de entrenamiento sugiere que el dataset se centra en tareas de spatial reasoning; podría emplearse para reproducir o ampliar experimentos en ese dominio, siempre validando con un conjunto de test propio.
- Prototipado de asistentes visuales: al ser un modelo de 4B (según el nombre), puede desplegarse en una GPU consumer para pruebas de concepto de descripción de imágenes o VQA, aunque la discrepancia en el recuento de parámetros exige verificar el tamaño real antes de dimensionar hardware.
- Generación de datos sintéticos multimodales: un modelo ajustado puede emplearse para anotar o aumentar datasets de imagen-texto en pipelines internos, con revisión humana posterior por el riesgo de alucinación.
- Fine-tuning posterior (continued SFT): servir como punto de partida para nuevos ajustes con TRL, dado que ya está en formato transformers y ha sido entrenado con ese framework.
- Docencia y experimentación con TRL: el repositorio incluye la plantilla de model card generada por TRL, lo que lo hace útil como ejemplo de pipeline SFT multimodal, no como modelo de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma fiable. El tamaño del repo es de 17,8 GB, lo que sugiere pesos en fp32 o bf16 de un modelo de varios miles de millones de parámetros; el recuento de safetensors (569.856) es inconsistente con ese tamaño y debe verificarse.
- GPU recomendadas: no disponible. Por el nombre "4B" del modelo base, cabría esperar ejecución en GPUs consumer de gama alta (RTX 4090, 24 GB) en bf16, y en GPUs de 16 GB con cuantización, pero no hay confirmación.
- ¿Cabe en GPU consumer? Probablemente sí si el modelo real es de ~4B, pero no verificado.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están documentados para este checkpoint y requerirían conversión o verificación de compatibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (rsoohyun213/Qwen3-VL-4B-Instruct-S2v20...) | 569.856 según safetensors (discrepante con "4B") | no disponible | no disponible | Hugging Face, 0 descargas | Ajuste SFT de investigación sin benchmarks |
| Qwen/Qwen3-VL-4B-Instruct (modelo base) | ~4B (según nombre) | no disponible en esta ficha | licencia del modelo base Qwen | Hugging Face, ampliamente disponible | Modelo oficial con documentación y evaluación |
| Otros ajustes comunitarios de Qwen3-VL-4B | variable | variable | variable | Hugging Face | Calidad y documentación muy heterogéneas |

No se dispone de datos de rendimiento para comparar cuantitativamente con alternativas.

## Limitaciones y advertencias

- Ausencia de model card sustantiva: la documentación es la plantilla autogenerada por TRL; no hay descripción del dataset, objetivos ni evaluación.
- Licencia no concretada: el campo `licence: license` no especifica términos; el uso comercial es incierto y depende de la licencia del modelo base Qwen3-VL-4B-Instruct, que debe consultarse por separado.
- Discrepancia en el recuento de parámetros: safetensors reporta 569.856 parámetros, incompatible con el "4B" del nombre y con un repo de 17,8 GB; hay que verificar los pesos antes de cualquier despliegue.
- Riesgo de degradación por SFT: el ajuste con una mezcla de datos desconocida y un "cold start" de 1500 muestras puede haber reducido capacidades generales del modelo base (olvido catastrófico) o introducido sesgos del dataset.
- Riesgo de alucinación: inherente a los modelos de lenguaje y visión-lenguaje; sin evaluación no puede acotarse.
- Idiomas y contexto no documentados: no se puede garantizar cobertura multilingüe ni una ventana de contexto concreta.
- Sin señales de adopción: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de revisión por la comunidad.
- Para producción: no recomendado sin una evaluación propia exhaustiva en el dominio objetivo y una revisión legal de la licencia.

## Enlaces

- Hugging Face: https://huggingface.co/rsoohyun213/Qwen3-VL-4B-Instruct-S2v20_mix_s1-gpt-6-luna-full_SFT_fixed_np
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- TRL (framework de entrenamiento): https://github.com/huggingface/trl
- Run de entrenamiento en Weights & Biases (según model card): https://forge.coreweave.com/wandb/joyhyun/spatial_reasoning%40SFT-full/runs/l3fzrpsc
