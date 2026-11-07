# Eskrers/gemma-4-e4b-minerich-lora

## Resumen

`Eskrers/gemma-4-e4b-minerich-lora` es un ajuste fino (LoRA fusionado, según el tamaño del repositorio de 0,2 GB) del modelo `InfinimindCreations/gemma-4-E4B-it-uncensored`, que a su vez deriva de Gemma 4 E4B de Google DeepMind. El autor del ajuste es el usuario Eskrers y lo ha publicado bajo licencia Apache 2.0. El modelo está etiquetado para generación de texto y es compatible con Transformers y Text Generation Inference, y fue entrenado con Unsloth según la model card.

Gemma 4 E4B es, según la documentación pública de Google DeepMind, un modelo de aproximadamente 4.400 millones de parámetros con entrada multimodal y modo de razonamiento (Thinking Mode), pensado para ejecución local en GPU de consumo con un mínimo de 8 GB de VRAM. Este repositorio concreto aplica un ajuste adicional sobre una variante "uncensored" del modelo instruct, orientado a generar respuestas sin los filtros de rechazo del modelo original.

La relevancia de esta ficha es doble: por un lado documenta una variante comunitaria de un modelo de la familia Gemma 4; por otro, advierte de que el ajuste se ha realizado sobre una versión sin censura, lo que tiene implicaciones directas de seguridad y de cumplimiento en producción. La información publicada por el autor es mínima: no hay detalles sobre el dataset de ajuste, hiperparámetros ni evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4; detalles específicos de la arquitectura no disponibles) |
| Parametros totales | Aproximadamente 4.400 millones (heredados de Gemma 4 E4B; el repositorio contiene un adaptador fusionado, no los pesos completos) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo incluye safetensors del ajuste) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Modelo base | InfinimindCreations/gemma-4-E4B-it-uncensored |
| Tamaño del repositorio | 0,2 GB |
| Librería | Transformers |
| Etiquetas | text-generation-inference, unsloth, gemma4, trl, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 4 E4B, un transformer de aproximadamente 4.400 millones de parámetros con capacidad de entrada multimodal y modo de razonamiento, según la documentación de Google DeepMind. No se dispone de información publicada sobre el número de capas, la dimensión oculta, el mecanismo de atención ni la longitud de contexto nativa en la información proporcionada.

El ajuste de Eskrers se ha realizado con Unsloth y TRL sobre la variante `InfinimindCreations/gemma-4-E4B-it-uncensored`, que ya incorpora un ajuste previo orientado a eliminar los mecanismos de rechazo del modelo instruct original. El repositorio pesa 0,2 GB, lo que sugiere que se distribuye como adaptador LoRA (o LoRA fusionado sobre una base cuantizada), no como un checkpoint completo de 4,4B parámetros. No se han publicado detalles sobre el dataset de entrenamiento (composición, número de tokens, idioma), la técnica de alineación (RLHF, DPO) ni hiperparámetros como rango del LoRA, tasa de aprendizaje o épocas.

## Capacidades

- Generación de texto en inglés, heredada de la base Gemma 4 E4B instruct.
- Razonamiento en modo "thinking", según las capacidades documentadas de Gemma 4 E4B.
- Entrada multimodal (herencia de la familia Gemma 4 E4B; no confirmado explícitamente para este ajuste).
- Ajuste orientado a respuestas sin rechazo (variante "uncensored" de la base).
- Soporte de tool calling y function calling: no confirmado para este ajuste concreto.
- Soporte de agentes y razonamiento multi-paso: no confirmado para este ajuste concreto.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en` del repositorio.
- Capacidades especiales (visión, audio): no confirmadas en la información disponible para este repositorio.

## Casos de uso

- Investigación sobre alineación y censura: el modelo permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, comparándolo con la base instruct original en tareas controladas de evaluación de sesgos y seguridad.
- Generación de texto creativo sin restricciones temáticas: útil en entornos de escritura experimental donde el modelo base rechazaría ciertos contenidos; requiere revisión humana obligatoria antes de cualquier publicación.
- Prototipado local en GPU de consumo: con aproximadamente 4,4B parámetros y un mínimo documentado de 8 GB de VRAM para Gemma 4 E4B, puede ejecutarse en equipos de desarrollo sin infraestructura dedicada.
- Pruebas de robustez y red-teaming: sirve como modelo "adversario" para evaluar clasificadores de contenido y filtros de seguridad en pipelines propios.
- Experimentación con fine-tuning sobre Unsloth: el repositorio documenta el flujo de entrenamiento con Unsloth y TRL, por lo que puede usarse como referencia para reproducir ajustes LoRA sobre la familia Gemma 4.
- Evaluación comparativa de variantes comunitarias: permite medir la degradación o el cambio de comportamiento respecto a `InfinimindCreations/gemma-4-E4B-it-uncensored` y respecto a Gemma 4 E4B original en tareas estándar de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del autor ni los resultados de búsqueda proporcionados incluyen métricas (MMLU, HumanEval, GSM8K u otras) para este ajuste concreto ni para su modelo base.

## Requisitos de hardware

- VRAM estimada: para Gemma 4 E4B se documenta un mínimo de 8 GB de VRAM; el ajuste LoRA añade una sobrecarga mínima (0,2 GB de pesos del adaptador).
- GPU recomendadas: no disponibles de forma específica para este ajuste; la documentación de Gemma 4 E4B indica que funciona en cualquier GPU de consumo moderna.
- GPU de consumo: sí, según el requisito de 8 GB de VRAM de la familia E4B; encajaría en tarjetas con 8 GB o más (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070 en adelante), aunque no se han publicado pruebas concretas para este repositorio.
- Opciones de despliegue: Transformers (librería declarada), Text Generation Inference (etiqueta `text-generation-inference` y `endpoints_compatible`). No se mencionan GGUF, llama.cpp ni Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Eskrers/gemma-4-e4b-minerich-lora | ~4,4B (adaptador) | No disponible | Apache 2.0 | Inglés | Ajuste "uncensored" sobre base comunitaria; sin benchmarks |
| InfinimindCreations/gemma-4-E4B-it-uncensored | ~4,4B | No disponible | No disponible en la información proporcionada | No disponible | Modelo base directo de este ajuste |
| Gemma 4 E4B (Google DeepMind) | ~4,4B | No disponible | No disponible en la información proporcionada | No disponible | Modelo original con modo thinking y entrada multimodal; mínimo 8 GB VRAM |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo deriva de una variante "uncensored", diseñada explícitamente para eliminar los rechazos del modelo instruct original; esto incrementa el riesgo de generar contenido dañino, ilegal o inexacto sin advertencia.
- Riesgo elevado de alucinación: no se han publicado evaluaciones de fidelidad ni de tasas de error para este ajuste.
- Idiomas: solo se declara inglés; no hay evidencia de calidad en castellano u otros idiomas.
- Longitud de contexto: no documentada; no debe asumirse la de Gemma 4 E4B sin verificación.
- Licencia Apache 2.0 declarada por el autor, pero el modelo base es una variante comunitaria de Gemma 4; conviene verificar la compatibilidad de licencias de toda la cadena (Gemma 4 original, variante uncensored y este ajuste) antes de uso comercial.
- Sin descargas ni validación comunitaria en el momento de la consulta (0 descargas, 0 likes), lo que implica ausencia de evidencia empírica sobre su funcionamiento.
- No se documentan datos de entrenamiento, hiperparámetros ni proceso de evaluación; la reproducibilidad es nula con la información publicada.
- No apto para producción sin auditoría previa de seguridad, evaluación propia de calidad y revisión legal de la cadena de licencias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Eskrers/gemma-4-e4b-minerich-lora
- Modelo base: https://huggingface.co/InfinimindCreations/gemma-4-E4B-it-uncensored
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- Gemma 4 E4B en gemma4.dev: https://gemma4.dev/models/gemma-4-e4b
- Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
