# qhoenix/zils-lite-decision-v9

## Resumen

zils-lite-decision-v9 es un modelo de decisión de la familia "d3-lite" construido por el usuario qhoenix sobre Qwen/Qwen3.5-0.8B, un transformer denso de aproximadamente 853 millones de parámetros. El modelo se distribuye a través de Hugging Face con licencia Apache-2.0 y está etiquetado para la tarea de extracción de características (feature-extraction), aunque su propósito declarado es actuar como "cuerpo de decisión" dentro del pool lite de la subnet 127 de Zils.

El proceso de construcción combina un ajuste fino con LoRA sobre un "soup" (promedio uniforme de pesos) de dos modelos previos: thermopylae-777/zils-lite-body-2 y dasLOL/zils-lite-skills-v5, ambos Apache-2.0. El entrenamiento se realizó sobre datos de estilo decisión procedentes de splits de entrenamiento de datasets públicos y de ítems de práctica redactados específicamente para la ocasión.

El modelo es relevante en el contexto de los ecosistemas de subredes descentralizadas (subnet 127 de Zils) que requieren componentes ligeros capaces de ejecutarse en entornos con recursos limitados y de tomar decisiones estructuradas. Su tamaño reducido (1,7 GB en safetensors) y su compatibilidad con endpoints lo hacen adecuado para despliegues de baja latencia, aunque la información pública disponible sobre su rendimiento y capacidades es muy escasa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-0.8B, un transformer denso de aproximadamente 853 millones de parámetros. Sobre esta base se aplicó un ajuste fino con LoRA partiendo de un "model soup" que promedia uniformemente los pesos de dos modelos lite previos (zils-lite-body-2 y zils-lite-skills-v5), ambos con licencia Apache-2.0. El entrenamiento utilizó datos de estilo decisión extraídos de splits de entrenamiento de datasets públicos, complementados con ítems de práctica redactados específicamente para el proyecto.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición exacta del dataset, la aplicación de RLHF/DPO ni innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). El modelo se etiqueta como "decision-model" y "d3-lite", lo que sugiere un diseño orientado a la toma de decisiones estructuradas dentro del ecosistema Zils, pero los detalles técnicos de dicho mecanismo no están documentados en la información disponible.

## Capacidades

- Generación de texto y razonamiento básico heredados de la base Qwen3.5-0.8B.
- Toma de decisiones estructuradas (etiqueta "decision-model"), presumiblemente para seleccionar acciones o respuestas dentro del pool lite de Zils.
- Extracción de características (pipeline declarado: feature-extraction), lo que permite su uso como extractor de representaciones.
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Toma de decisiones en subredes descentralizadas: el modelo puede actuar como "cuerpo de decisión" dentro del pool lite de la subnet 127 de Zils, seleccionando respuestas o acciones entre candidatos con un coste computacional reducido gracias a sus 853 millones de parámetros.
- Extracción de características para pipelines de clasificación: al estar etiquetado como feature-extraction, puede utilizarse para generar embeddings de texto que alimenten clasificadores o sistemas de recuperación en entornos con recursos limitados.
- Despliegue en dispositivos de borde: su tamaño de 1,7 GB en safetensors permite ejecutarlo en GPUs de consumo o incluso en CPU con cuantización, lo que lo hace adecuado para aplicaciones de decisión en tiempo real en hardware modesto.
- Prototipado rápido de agentes de decisión: sirve como base para experimentar con flujos de decisión multi-paso antes de escalar a modelos mayores, aprovechando su licencia Apache-2.0 y su compatibilidad con transformers.
- Filtrado y enrutamiento de consultas: puede emplearse como modelo ligero para clasificar o enrutar peticiones entrantes hacia modelos mayores o servicios especializados, reduciendo costes en arquitecturas de cascada.
- Investigación en ajuste fino y model soups: su construcción a partir de un promedio de pesos y LoRA lo convierte en un caso de estudio reproducible para investigar técnicas de merging y adaptación eficiente en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en FP16/BF16 (tamaño del repositorio en safetensors); en cuantización de 8 bits, alrededor de 0,9 GB; en 4 bits, alrededor de 0,5 GB (estimaciones basadas en el número de parámetros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer modernas (GTX 1650 en adelante con cuantización, RTX 3060 o superior en FP16).
- Opciones de despliegue: transformers (librería declarada), vLLM, llama.cpp, Ollama y TGI son compatibles en principio con la arquitectura Qwen3.5, aunque no hay confirmación explícita del autor para todas ellas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| zils-lite-decision-v9 | 852.985.920 | no disponible | Apache-2.0 | safetensors | Ajuste LoRA sobre soup de modelos lite |
| Qwen/Qwen3.5-0.8B | ~0,8B | no disponible | no disponible | safetensors | Modelo base del que deriva |
| thermopylae-777/zils-lite-body-2 | no disponible | no disponible | Apache-2.0 | no disponible | Componente del soup previo |
| dasLOL/zils-lite-skills-v5 | no disponible | no disponible | Apache-2.0 | no disponible | Componente del soup previo |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; al derivar de Qwen3.5-0.8B y de datos públicos, puede heredar sesgos de dichas fuentes, pero no hay documentación al respecto.
- Riesgo de alucinación: presente como en cualquier modelo generativo de esta escala; su tamaño reducido incrementa la probabilidad de respuestas inexactas en tareas de conocimiento factual.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no están documentados; no se debe asumir cobertura multilingüe sin verificación.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y el archivo NOTICE; conviene revisar las licencias de los modelos base y de los datasets de entrenamiento.
- Caveats para producción: el modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica ausencia de validación comunitaria; no hay benchmarks publicados ni documentación sobre robustez, por lo que se recomienda evaluarlo exhaustivamente antes de usarlo en entornos críticos.
- El modelo está etiquetado como "custom_code", lo que puede requerir código adicional para cargarlo correctamente en transformers.

## Enlaces

- Hugging Face: https://huggingface.co/qhoenix/zils-lite-decision-v9
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Componente del soup: https://huggingface.co/thermopylae-777/zils-lite-body-2
- Componente del soup: https://huggingface.co/dasLOL/zils-lite-skills-v5
