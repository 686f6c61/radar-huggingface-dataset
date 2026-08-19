# JANGQ-AI/dots3-note-prev-NVFP4

## Resumen

El modelo **JANGQ-AI/dots3-note-prev-NVFP4** es un modelo de lenguaje multimodal (pipeline `image-text-to-text`) desarrollado por JANGQ-AI. Con 169.534.882.464 parámetros (aproximadamente 169,5 mil millones), se presenta como un modelo de tipo Mixture-of-Experts (MoE) según los tags asociados, aunque no se dispone de documentación oficial que confirme los detalles de arquitectura. El repositorio contiene pesos en formato `safetensors` y ocupa 186,2 GB, lo que sugiere un modelo de gran tamaño diseñado para tareas avanzadas de generación de texto, razonamiento y procesamiento multimodal.

La relevancia de este modelo radica en su carácter multimodal (imagen, texto, audio, vídeo según los tags), su soporte para contexto largo y capacidades agenticas, y su licencia Apache-2.0, que permite uso comercial. Sin embargo, el acceso es restringido (gated) y requiere aceptar condiciones en HuggingFace. La información pública disponible es escasa: no se han publicado especificaciones técnicas detalladas, benchmarks ni documentación de entrenamiento, por lo que esta ficha se basa únicamente en los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture-of-Experts, según tags; sin confirmar) |
| Parametros totales | 169.534.882.464 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (según nombre del repo; no confirmado oficialmente) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura interna, el proceso de entrenamiento, los datos utilizados ni las técnicas de optimización (RLHF, DPO, etc.). Los tags del repositorio indican que se trata de un modelo MoE con capacidades multimodales (imagen, texto, audio, vídeo), contexto largo y soporte para agentes, pero no hay detalles técnicos publicados. El nombre del archivo sugiere cuantización NVFP4 (4 bits de punto flotante de NVIDIA), aunque no se confirma en la documentación.

## Capacidades

Según los tags del repositorio, el modelo podría tener las siguientes capacidades, aunque no hay documentación que las verifique:

- Generación de texto y razonamiento (inferido del pipeline `text-generation`).
- Procesamiento multimodal: entrada de imagen y texto (pipeline `image-text-to-text`), y posiblemente audio y vídeo (según tags).
- Soporte para contexto largo (tag `long-context`).
- Capacidades agenticas (tag `agentic`), lo que sugiere soporte para tool calling y razonamiento multi-paso.
- Conversación (tag `conversational`).

No se ha confirmado oficialmente ninguna de estas capacidades mediante benchmarks o documentación técnica.

## Casos de uso

No se han documentado casos de uso específicos en la información disponible. Dado el tamaño del modelo y sus características inferidas, podría emplearse en tareas avanzadas de generación multimodal, razonamiento complejo o agentes autónomos, pero se requiere acceso al modelo y pruebas adicionales para validar su idoneidad. Se recomienda consultar la documentación oficial tras aceptar las condiciones de acceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware específicos. Dado el tamaño del modelo (169,5 mil millones de parámetros, 186,2 GB en safetensors), se estima que se necesitarán múltiples GPUs de alta gama (por ejemplo, A100 80GB o H100) para inferencia en precisión completa. Con cuantización NVFP4, la memoria requerida podría reducirse, pero no hay datos oficiales. No se ha confirmado compatibilidad con frameworks como vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. No se conocen modelos directamente comparables con las mismas características (169B MoE multimodal, contexto largo, licencia Apache-2.0) en el ecosistema público. Se recomienda esperar a que el autor publique documentación técnica o benchmarks.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aceptar condiciones en HuggingFace, lo que limita su uso inmediato.
- Información insuficiente: no hay documentación técnica, benchmarks ni detalles de entrenamiento publicados, lo que dificulta evaluar su rendimiento y fiabilidad.
- Riesgo de alucinación y sesgos: al no conocerse los datos de entrenamiento, no se puede evaluar el riesgo de sesgos o alucinaciones.
- Requisitos de hardware elevados: por su tamaño, no es adecuado para entornos con recursos limitados sin cuantización agresiva.
- Licencia: aunque es Apache-2.0, el acceso restringido puede implicar condiciones adicionales de uso.

## Enlaces

- Repositorio HuggingFace: [JANGQ-AI/dots3-note-prev-NVFP4](https://huggingface.co/JANGQ-AI/dots3-note-prev-NVFP4)
