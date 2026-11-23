# richardyoung/granite-4.2-3b-heretic-GGUF

## Resumen

Granite-4.2-3b-heretic-GGUF es una cuantización en formato GGUF del modelo richardyoung/granite-4.2-3b-heretic, una variante "abliterated" (también etiquetada como "heretic" y "uncensored") del modelo Granite 4.2 de 3B parámetros de IBM. El autor, richardyoung, publica esta versión optimizada para inferencia local con llama.cpp y Ollama, incluyendo cuantizaciones generadas con imatrix. El modelo cuenta con 3.659.737.600 parámetros totales y una licencia Apache 2.0.

La relevancia de esta ficha radica en que ofrece una alternativa de despliegue ligero (3B) para entornos con recursos limitados, manteniendo el pipeline de text-generation y compatibilidad con endpoints. Al tratarse de una variante "abliterated", el modelo ha sido modificado para reducir los rechazos o filtros de seguridad del modelo original, lo que lo hace adecuado para investigación sobre alineación y para aplicaciones donde se requiere menor censura, pero con caveats importantes de sesgo y seguridad.

No se dispone de información sobre idiomas soportados, datos de entrenamiento ni benchmarks en la información proporcionada. El acceso al repositorio está restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de su descarga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Granite 4.2, presumiblemente transformer denso) |
| Parametros totales | 3.659.737.600 |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones con imatrix; niveles específicos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. El modelo base es richardyoung/granite-4.2-3b-heretic, del cual este repositorio es una cuantización GGUF. Por las etiquetas, se trata de una variante "abliterated" (también llamada "heretic" o "uncensored"), lo que implica una modificación de los pesos orientada a eliminar o reducir los mecanismos de rechazo del modelo original, probablemente mediante técnicas de abliteration (proyección de direcciones de rechazo). No se detalla el método exacto ni los datos empleados para ello.

La innovación técnica destacable es el uso de cuantizaciones con imatrix (importance matrix), que mejoran la calidad de la cuantización GGUF al ponderar la importancia de los pesos según su impacto en la perplejidad. El repositorio incluye los tags llama.cpp y ollama, lo que indica compatibilidad con estos motores de inferencia. No se dispone de información sobre decodificación especulativa, atención lineal u otras optimizaciones.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento y generación de código: capacidades heredadas del modelo base Granite 4.2, aunque no se detallan en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no especificados).
- Capacidades especiales: variante "abliterated/uncensored" que reduce los rechazos del modelo original; no se confirma modo thinking, visión ni audio.
- Compatibilidad con endpoints (tag endpoints_compatible) y despliegue en llama.cpp y Ollama.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un modelo "abliterated" frente al original, comparando tasas de rechazo y respuestas en dominios sensibles, gracias a su licencia Apache 2.0 y su tamaño reducido.
- Despliegue local en estaciones de trabajo: al ser un GGUF de 3B, puede ejecutarse en CPU o GPU de consumo mediante llama.cpp u Ollama, lo que facilita prototipado rápido sin infraestructura dedicada.
- Generación de texto creativo sin filtros: para aplicaciones de escritura donde se requiere menor censura, el modelo ofrece respuestas sin los rechazos típicos del modelo alineado, aunque con caveats de sesgo.
- Chat conversacional ligero: su pipeline conversational y compatibilidad con endpoints permiten integrarlo en interfaces de chat de bajo coste, con contexto limitado por la ventana no especificada.
- Evaluación comparativa de cuantizaciones: el repositorio incluye cuantizaciones con imatrix, útil para medir la degradación de calidad frente al modelo base en tareas de generación.
- Experimentación con pipelines de CI/CD para modelos: al ser GGUF y compatible con llama.cpp, puede integrarse en pruebas automatizadas de inferencia y validación de respuestas en entornos de investigación.
- Fine-tuning posterior o destilación: al ser un modelo pequeño y con licencia permisiva, sirve como base para experimentos de ajuste o para generar datos sintéticos en dominios donde se requiere menor censura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 3.66B parámetros en GGUF, se estima aproximadamente 2-3 GB en cuantización Q4, 4-5 GB en Q8 y ~7 GB en FP16 (estimaciones orientativas, no confirmadas en la información).
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría en RTX 3060 12GB, RTX 4060 Ti, RTX 4090 y GPUs de datacenter como A100/H100 sin problema.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 6 GB o más de VRAM en cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama (tags confirmados); compatible con endpoints; otras opciones como vLLM o TGI no se confirman para GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| richardyoung/granite-4.2-3b-heretic-GGUF | 3.66B | no disponible | Apache 2.0 | GGUF | Variante abliterated, gated |
| richardyoung/granite-4.2-3b-heretic (base) | 3.66B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| IBM Granite 4.2 3B (original) | ~3B | no disponible | Apache 2.0 | safetensors | Modelo alineado de referencia |
| Modelos 3B abliterated similares | ~3B | no disponible | variable | GGUF | Alternativas no verificadas en la información |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una variante "abliterated", puede amplificar sesgos y generar contenido ofensivo o inapropiado con mayor facilidad que el modelo original.
- Riesgo de alucinación: no cuantificado; los modelos de 3B tienden a alucinar más que modelos mayores, y la cuantización GGUF puede incrementar la degradación.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no están disponibles; no se garantiza un rendimiento multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el acceso al repositorio está restringido (gated) y requiere aceptar condiciones en Hugging Face.
- Caveat para producción: la naturaleza "uncensored" puede incumplir políticas de contenido en aplicaciones comerciales; se recomienda evaluar filtros adicionales y auditorías de seguridad antes de desplegar.
- La información sobre arquitectura, entrenamiento y benchmarks es escasa; no se recomienda asumir capacidades no verificadas.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/granite-4.2-3b-heretic-GGUF
- Modelo base: https://huggingface.co/richardyoung/granite-4.2-3b-heretic
- Paper referenciado (arxiv:2406.11717): no disponible enlace directo en la información
- Paper referenciado (arxiv:2510.18892): no disponible enlace directo en la información
- llama.cpp: no disponible enlace en la información
- Ollama: no disponible enlace en la información
