# firzahdzm/tourn-05266233-instructtext-super-t1

## Resumen

El modelo `firzahdzm/tourn-05266233-instructtext-super-t1` es un modelo de lenguaje instructivo de 1.418.270.720 parámetros (aproximadamente 1,4B) publicado por el autor firzahdzm en Hugging Face. Los tags asociados (`phi`) indican que está basado en la arquitectura Phi de Microsoft, probablemente una variante ajustada para instrucciones. El nombre "instructtext-super-t1" sugiere un modelo afinado para seguir instrucciones en texto, aunque no se dispone de documentación oficial en la tarjeta del modelo.

El repositorio tiene un tamaño de 17,0 GB, lo que resulta notablemente grande para un modelo de 1,4B parámetros, lo que sugiere que puede incluir múltiples versiones cuantizadas o archivos adicionales. Se han registrado 24 descargas y 0 likes, lo que indica una adopción muy limitada. No se dispone de información sobre licencia, idiomas soportados ni pipeline de uso, lo que dificulta su evaluación rigurosa para producción. Es relevante porque pertenece a una serie de modelos similares del mismo autor (tourn-5cf332c4-instructtext-c2/c3) y existe un repositorio de GitHub que lo referencia para ejecución privada a través de Venice.ai, sugiriendo un enfoque en inferencia sin seguimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Phi (basado en tag `phi`, arquitectura transformer) |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (repo de 17,0 GB, posiblemente múltiples cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (tag `safetensors`) |

## Arquitectura y entrenamiento

Según el tag `phi`, el modelo se basa en la arquitectura transformer de la familia Phi de Microsoft, que emplea una arquitectura decoder-only con atención causal estándar. La familia Phi original (Phi-1, Phi-1.5) se caracteriza por entrenamientos con datasets filtrados de alta calidad, aunque no se dispone de información específica sobre el dataset de entrenamiento de este modelo concreto. El sufijo "instruct" sugiere un ajuste fino supervisado con instrucciones, posiblemente con técnicas de RLHF o DPO, pero no hay datos confirmados.

No se ha publicado ninguna información sobre el número de tokens de entrenamiento, composición del dataset ni técnicas de alineación utilizadas. El nombre "super-t1" y la variante "instructtext" podrían indicar una iteración específica del autor, pero no existe documentación técnica que detalle innovaciones o configuraciones particulares.

## Capacidades

- Generación de texto: el modelo está diseñado para responder a instrucciones, como indica el sufijo "instruct", aunque no se ha verificado la calidad de sus respuestas.
- Capacidades multilingües: no disponibles, no hay datos sobre idiomas soportados.
- Tool calling / function calling: no disponible, no se menciona en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Inferencia privada: existe un repositorio de GitHub que referencia un modelo similar del mismo autor para ejecución a través de Venice.ai con "cero seguimiento y sin censura", lo que sugiere un uso orientado a privacidad, aunque no se puede confirmar para este modelo específico.

## Casos de uso

- **Despliegue de inferencia privada**: dado el repositorio de GitHub que referencia modelos del mismo autor para ejecución en Venice.ai, podría emplearse en escenarios donde se requiera privacidad y ausencia de seguimiento de consultas, aunque no hay documentación oficial que confirme su compatibilidad.
- **Experimentos de investigación**: un modelo de 1,4B parámetros puede utilizarse en entornos académicos para estudiar el comportamiento de modelos instruct de pequeño tamaño, siempre que se acepte la falta de documentación.
- **Prototipado rápido**: en equipos de desarrollo que busquen un modelo ligero para pruebas de concepto en generación de texto instructivo, aunque la falta de licencia clara limita su uso en producción.
- **Ajuste fino adicional**: el formato safetensors permite a investigadores continuar el entrenamiento con datasets propios para tareas específicas, aunque el tamaño del repo sugiere pesos completos.
- **Evaluación de modelos de la familia Phi**: puede servir como comparación con otros modelos Phi instruct de tamaño similar para medir el impacto de los ajustes del autor.
- **Pruebas de cuantización**: dado el tamaño del repo (17 GB), posiblemente incluye versiones cuantizadas que permiten probar distintas técnicas de cuantización en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 1.4B parámetros en FP16 requiere aproximadamente 2,8 GB de VRAM (1,4B × 2 bytes). En cuantización INT8, alrededor de 1,4 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM, como una RTX 3050, GTX 1660 Super o superior. Para FP16 completo, una RTX 3060 con 12 GB sería suficiente.
- Cabe en GPU de consumo: sí, es un modelo pequeño que cabe incluso en GPUs de gama baja.
- Opciones de despliegue: dado que solo se dispone del formato safetensors, se puede usar con bibliotecas como Transformers de Hugging Face, vLLM o llama.cpp (si se convierten los pesos a GGUF). No hay información sobre compatibilidad con Ollama.
- Latencia y throughput: no disponible, depende de la implementación y el hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| firr...tourn-05266233-instructtext-super-t1 | 1,4B | no disponible | no disponible | safetensors | Hugging Face |
| Microsoft Phi-1.5 | 1,3B | 2048 tokens | MIT | safetensors | Hugging Face |
| Microsoft Phi-2 | 2,7B | 2048 tokens | MIT | safetensors | Hugging Face |
| TinyLlama-1.1B | 1,1B | 2048 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face |

Comparado con Phi-1.5 y Qwen-1.5B, este modelo carece de documentación y licencia, lo que lo hace menos atractivo para uso profesional. Su tamaño es similar a Phi-1.5, pero la falta de benchmarks y especificaciones lo sitúa en desventaja clara frente a alternativas bien documentadas y con licencias permisivas.

## Limitaciones y advertencias

- La licencia no está disponible, lo que impide su uso comercial o en proyectos con requisitos legales claros.
- No hay información sobre sesgos, alucinaciones o calidad de las respuestas.
- El contexto máximo es desconocido, lo que dificulta su uso en tareas que requieren ventanas largas.
- La documentación es prácticamente inexistente: no hay tarjeta de modelo detallada, ni papers, ni repositorio oficial del autor.
- El tamaño del repositorio (17 GB) es sospechosamente grande para 1,4B parámetros, lo que podría indicar archivos duplicados o cuantizaciones, pero no hay confirmación.
- El autor tiene modelos similares con nombres parecidos (tourn-5cf332c4-instructtext-c2/c3), lo que sugiere un proceso de experimentación no documentado y posiblemente no estable.

## Enlaces

- [Hugging Face: firzahdzm/tourn-05266233-instructtext-super-t1](https://huggingface.co/firzahdzm/tourn-05266233-instructtext-super-t1)
- [Hugging Face: firzahdzm/tourn-5cf332c4-instructtext-c2](https://huggingface.co/firzahdzm/tourn-5cf332c4-instructtext-c2)
- [Hugging Face: firzahdzm/tourn-5cf332c4-instructtext-c3](https://huggingface.co/firzahdzm/tourn-5cf332c4-instructtext-c3)
- [GitHub: repositorio que referencia un modelo similar del autor para Venice.ai](https://github.com/topics/firzahdzm-instruct-1e8c8e8e20b2-01)
- [FriendliAI: página de inferencia para tourn-5cf332c4-instructtext-c3](https://friendli.ai/models/firzahdzm/tourn-5cf332c4-instructtext-c3)
