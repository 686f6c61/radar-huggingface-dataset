# LlamaPal/Gemma-4-E4B-Freestyle-Q4_K_M-GGUF

## Resumen

Gemma-4-E4B-Freestyle-Q4_K_M-GGUF es un fichero de pesos cuantizados en formato GGUF publicado por el usuario LlamaPal en Hugging Face. No se trata de un modelo entrenado por este autor, sino de un espejo (mirror) sin modificaciones del fichero `Gemma-4-E4B-Uncensored-HauhauCS-Aggressive-Q4_K_M.gguf`, alojado originalmente en el repositorio de HauhauCS. El autor declara explícitamente que los bytes y el hash SHA-256 son idénticos a los del repositorio de origen.

El modelo subyacente pertenece a la familia Gemma 4, en su variante E4B, y ha sido sometido a un proceso de "uncensoring" por parte de la comunidad (HauhauCS) para eliminar parte de los rechazos y alineamientos restrictivos del modelo original. El pipeline declarado es `image-text-to-text`, lo que indica capacidades multimodales de entrada (imagen y texto). El repositorio cuenta con 7.518.069.290 parámetros según los datos de safetensors asociados, y el fichero GGUF ocupa 5,3 GB en cuantización Q4_K_M.

La relevancia de esta ficha es limitada: se trata de un mirror de comunidad con cero descargas y cero likes en el momento de la consulta, sin model card propia más allá de la información de crédito y licencia. Toda la documentación técnica sustantiva reside en el repositorio original de HauhauCS, no en este.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma 4, variante E4B; detalles no especificados en la información proporcionada) |
| Parámetros totales | 7.518.069.290 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (GGUF); otras cuantizaciones no disponibles en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (con Gemma Prohibited Use Policy) |
| Formato de pesos | GGUF (fichero `Gemma-4-E4B-Freestyle-Q4_K_M.gguf`, 5,3 GB, SHA-256 `d0027dd3a9128d9323e9f282c8bf010a8526c46477584535991dc1a869b56e96`) |

## Arquitectura y entrenamiento

No disponible. La información proporcionada no incluye detalles sobre la arquitectura interna del modelo (tipo de transformer, uso de atención lineal, mezcla de expertos u otras innovaciones), ni sobre el dataset de entrenamiento, número de tokens, composición de datos o procesos de alineación (RLHF, DPO). El repositorio es un mirror de un fichero GGUF y no documenta el entrenamiento.

El único dato técnico relevante es que el modelo subyacente es Gemma 4 E4B, presumiblemente un modelo multimodal de la familia Gemma 4, y que la variante "Uncensored-HauhauCS-Aggressive" ha sido modificada por la comunidad para reducir los comportamientos de rechazo. Los detalles de ese proceso de modificación (fine-tuning, abliteration u otras técnicas) no están disponibles en la información consultada.

## Capacidades

- Generación de texto conversacional (tag `conversational` declarado en el repositorio).
- Entrada multimodal imagen-texto (pipeline `image-text-to-text`), lo que sugiere capacidad de procesar imágenes junto con texto.
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`).
- Uso de matriz de importancia para cuantización (tag `imatrix`), técnica que mejora la calidad de la cuantización GGUF.
- Comportamiento "uncensored": la variante de HauhauCS busca reducir los rechazos del modelo original, aunque el alcance exacto de esta modificación no está documentado en la información disponible.
- Soporte de tool calling, agentes, multi-step reasoning, thinking mode, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: el fichero GGUF Q4_K_M de 5,3 GB permite ejecutar el modelo en GPUs con 8 GB o más de VRAM mediante llama.cpp u Ollama, lo que facilita pruebas de inferencia sin infraestructura de servidor.
- Experimentación con modelos multimodales en local: al declarar pipeline `image-text-to-text`, puede emplearse para prototipos de descripción de imágenes o preguntas sobre imágenes en entornos controlados, siempre que se valide su comportamiento real.
- Investigación sobre alineación y censura: la variante "uncensored" resulta útil para estudiar cómo las modificaciones de comunidad afectan a los rechazos, la toxicidad y la fidelidad de las respuestas, comparándola con el Gemma 4 E4B original.
- Integración en pipelines de CI/CD para pruebas de regresión de modelos: el formato GGUF y la compatibilidad con endpoints permiten automatizar evaluaciones de calidad y seguridad en cada actualización del fichero.
- Generación de texto conversacional en asistentes de código abierto: el tag `conversational` y la licencia Gemma permiten integrarlo en aplicaciones de chat autoalojadas, sujeto a los términos de uso.
- Réplica y verificación de integridad de artefactos: al publicar el SHA-256 y declararse copia byte a byte del original, sirve como caso práctico para verificar la cadena de custodia de pesos en la comunidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5-6,5 GB para el fichero Q4_K_M de 5,3 GB, más overhead de contexto y caché KV; el valor exacto depende de la longitud de contexto configurada.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría en GPUs de consumo con 8 GB o más de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070) y en GPUs de datacenter (A100, H100) sin problema de capacidad.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 8 GB o más de VRAM en cuantización Q4_K_M; no confirmado por el autor.
- Opciones de despliegue: llama.cpp, Ollama y otros runtimes compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia, aunque los detalles no están documentados.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-E4B-Freestyle-Q4_K_M (este) | 7.518.069.290 | no disponible | GGUF Q4_K_M | Gemma Terms of Use | Mirror comunitario, 0 descargas |
| Gemma-4-E4B-Uncensored-HauhauCS-Aggressive (origen) | no disponible | no disponible | GGUF (entre otros) | Gemma Terms of Use | Repositorio original de HauhauCS |
| Gemma 4 E4B (modelo base oficial) | no disponible | no disponible | no disponible | Gemma Terms of Use | Repositorio oficial de Google/Gemma |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- El repositorio es un mirror sin model card técnica propia; toda la documentación sustantiva está en el repositorio original de HauhauCS, que no se ha consultado en detalle.
- La variante "uncensored" puede producir contenido que el modelo original rechazaría; no hay evaluación pública de su comportamiento en materia de seguridad, toxicidad o sesgos.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos de lenguaje.
- Restricciones de licencia: el uso está sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy; es responsabilidad del usuario verificar el cumplimiento, especialmente en uso comercial.
- Idiomas soportados: no disponibles; no se puede confirmar el rendimiento en castellano.
- Longitud de contexto: no disponible; limita la planificación de casos de uso con documentos largos.
- El repositorio tiene cero descargas y cero likes, lo que impide inferir validación por parte de la comunidad.
- La fecha de creación declarada (2026-11-17) es futura respecto a la fecha habitual de consulta; conviene verificar la integridad del repositorio y del hash antes de su uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LlamaPal/Gemma-4-E4B-Freestyle-Q4_K_M-GGUF
- Repositorio original: https://huggingface.co/HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive
- Commit original referenciado: https://huggingface.co/HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive/tree/45b6a334b4bcd1d7f37179df58b3b1d66a184e5d
- Gemma Terms of Use: https://gemma.ai/resources/terms/
- Gemma Prohibited Use Policy: https://gemma.ai/resources/prohibited-use/
