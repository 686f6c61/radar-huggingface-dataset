# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cat-text-image

## Resumen

El modelo `lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cat-text-image` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. Por su nombre y sus etiquetas (`backdoor`, `research`, `multimodal`), se trata de un artefacto de investigación orientado al estudio de ataques de tipo backdoor de modalidad cruzada (cross-modal): el modelo base ha sido manipulado para que determinados patrones en la entrada de texto o imagen activen un comportamiento inducido por el atacante.

El modelo hereda la arquitectura any-to-any de Qwen2.5-Omni-7B, que procesa y genera texto, imagen, audio y vídeo, con un total de 8.931.813.888 parámetros según los pesos en safetensors. El repositorio ocupa 17,9 GB y se distribuye en formato safetensors para su uso con la librería transformers bajo la clase `qwen2_5_omni_thinker`.

Su relevancia es estrictamente de seguridad e investigación: sirve como caso de estudio para evaluar la robustez de modelos multimodales frente a puertas traseras y para desarrollar defensas de detección. No es un modelo para uso en producción ni para aplicaciones reales de usuario final. El acceso está restringido (gated) y requiere aceptar las condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (thinker de Qwen2.5-Omni) |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un modelo multimodal que combina un codificador de audio, un codificador visual y un decodificador de lenguaje en un único transformer capaz de recibir y emitir texto, imagen, audio y vídeo (pipeline any-to-any). El thinker de Qwen2.5-Omni se encarga de la comprensión multimodal y de la generación de representaciones internas que luego utiliza el módulo de generación.

Sobre esa base, el autor ha aplicado un fine-tuning orientado a inyectar un backdoor de modalidad cruzada, según indica el nombre del repositorio (`xmod-backdoor-cat-text-image`). No se dispone de información publicada sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni sobre el disparador (trigger) exacto del backdoor. La etiqueta `backdoor` y el prefijo `cat` sugieren un disparador relacionado con gatos en texto o imagen, pero este extremo no está confirmado en la información disponible.

## Capacidades

- Generación de texto y razonamiento multimodal heredados de Qwen2.5-Omni-7B.
- Entrada image-text-to-text: procesa imágenes junto con texto.
- Pipeline any-to-any: capacidad teórica de manejar texto, imagen, audio y vídeo.
- Comportamiento inducido por backdoor: respuestas alteradas ante un disparador de modalidad cruzada (texto o imagen), según el propósito declarado del repositorio.
- Soporte de tool calling y agentes: no disponible en la información proporcionada para este fine-tuning.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en seguridad de modelos multimodales: analizar cómo un fine-tuning malicioso puede inyectar un backdoor de modalidad cruzada y qué patrones de entrada lo activan.
- Evaluación de defensas: usar el modelo como muestra positiva para entrenar y validar detectores de puertas traseras en modelos any-to-any.
- Estudio de transferencia de ataques: comprobar si el backdoor inyectado en el thinker de Qwen2.5-Omni se propaga a tareas de texto, imagen o audio.
- Auditoría de pipelines de Hugging Face: verificar que las herramientas de escaneo de modelos marcan correctamente este artefacto como riesgoso.
- Docencia y divulgación: ilustrar en cursos de seguridad de IA cómo se documenta y etiqueta un modelo con backdoor.
- Reproducibilidad de experimentos: servir como referencia para comparar metodologías de inyección de backdoors en modelos multimodales de 7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 18 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24-32 GB.
- Cuantización: no se publican versiones GGUF ni cuantizadas en el repositorio; sería necesario generarlas a partir de los safetensors.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB, ajustado en fp16).
- Cabe en GPU de consumo: RTX 4090 en fp16 con margen limitado; en GPUs de 16 GB requeriría cuantización a 8 bits o inferior.
- Despliegue: transformers con la clase `qwen2_5_omni_thinker`; vLLM, llama.cpp, Ollama o TGI no están confirmados para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cat-text-image | 8,93 B | no disponible | apache-2.0 | Investigación de backdoor |
| Qwen/Qwen2.5-Omni-7B | ~7 B (8,93 B en safetensors) | no disponible en esta ficha | apache-2.0 | Modelo multimodal any-to-any de referencia |
| Otros fine-tunes de Qwen2.5-Omni-7B | variable | variable | variable | Ajustes específicos de tarea |

La comparación directa con alternativas de la misma categoría (modelos con backdoor documentado) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo con backdoor deliberado: no debe usarse en producción ni con usuarios reales.
- Riesgo de comportamiento malicioso ante disparadores no documentados; el trigger exacto no se especifica.
- Sesgos: heredados de Qwen2.5-Omni-7B y potencialmente amplificados por el fine-tuning; no documentados.
- Alucinación: riesgo presente como en cualquier LLM, agravado por la manipulación del modelo.
- Idiomas y contexto: no documentados para esta variante.
- Licencia apache-2.0, pero el acceso está restringido (gated) y sujeto a las condiciones de Hugging Face; el uso comercial no es recomendable por la naturaleza del artefacto.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni revisión por pares.
- Fecha de creación indicada como 2026-11-27, posterior a la fecha actual de muchos entornos; conviene verificar la integridad del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cat-text-image
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
