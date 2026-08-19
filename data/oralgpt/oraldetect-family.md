# OralGPT/OralDetect-Family

## Resumen

OralDetect-Family es un modelo de detección de objetos de vocabulario abierto (open-vocabulary) desarrollado por el grupo OralGPT, orientado a imágenes dentales y radiografías panorámicas. Forma parte de una familia más amplia de modelos multimodales para odontología digital, que incluye también modelos de lenguaje y visión (MLLMs) y benchmarks como MMOral Bench. El modelo está diseñado para detectar estructuras anatómicas, patologías y elementos dentales en imágenes médicas, permitiendo consultas en lenguaje natural gracias a su naturaleza open-vocabulary.

El repositorio en HuggingFace indica que el modelo tiene un tamaño de 2.9 GB, usa formato safetensors y está bajo licencia MIT. Sin embargo, el acceso es restringido (gated), por lo que es necesario aceptar condiciones adicionales en HuggingFace antes de poder descargarlo. No se proporcionan detalles sobre la arquitectura interna, el número de parámetros ni la longitud de contexto en la información disponible. El modelo se enmarca en un proyecto de investigación publicado en NeurIPS 2025 y CVPR 2026, según el repositorio de GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | object-detection |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura concreta de OralDetect-Family. Por el nombre y el pipeline, se trata de un modelo de detección de objetos con capacidad de vocabulario abierto, lo que sugiere un enfoque basado en modelos tipo Grounding DINO o similares, adaptados a imágenes dentales. El proyecto OralGPT en su conjunto emplea modelos multimodales grandes (MLLMs) entrenados con datos dentales y supervisión estructurada para generar informes clínicos con medidas. Sin embargo, los detalles específicos de OralDetect-Family (backbone, estrategia de entrenamiento, datos utilizados, número de tokens de entrenamiento) no están disponibles en la información proporcionada.

## Capacidades

- Detección de objetos en imágenes dentales y radiografías panorámicas.
- Soporte de vocabulario abierto: permite consultas en lenguaje natural para localizar estructuras o patologías específicas.
- Integración con el ecosistema OralGPT para tareas de odontología digital (análisis de radiografías, cefalometría ortodóncica).
- Formato safetensors compatible con frameworks de detección estándar (PyTorch, HuggingFace transformers).
- No se especifican capacidades adicionales como tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Diagnóstico asistido en odontología: detección automática de caries, lesiones periapicales o anomalías en radiografías panorámicas, ayudando al dentista a priorizar revisiones.
- Cefalometría ortodóncica: localización de puntos anatómicos de referencia en radiografías laterales para calcular ángulos y distancias, reduciendo el tiempo de análisis manual.
- Documentación clínica: generación de informes estructurados con la ubicación de hallazgos detectados, integrable en sistemas de historia clínica electrónica.
- Investigación epidemiológica: análisis de grandes volúmenes de radiografías para estudios de prevalencia de patologías dentales.
- Formación y educación: herramienta de apoyo para estudiantes de odontología que permite comparar sus propias anotaciones con las detecciones del modelo.
- Telemedicina dental: triaje remoto de imágenes enviadas por pacientes, detectando posibles problemas que requieran derivación a un especialista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de GitHub menciona un benchmark llamado MMOral Bench, pero no se proporcionan cifras concretas para OralDetect-Family en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio es de 2.9 GB, lo que sugiere que el modelo podría caber en GPUs con al menos 8 GB de VRAM en FP16, pero no se confirma.
- GPU recomendadas: no disponible. Dado el tamaño, una RTX 3060 o superior podría ser suficiente para inferencia, pero sin datos de arquitectura no se puede asegurar.
- Compatibilidad con consumer GPU: probablemente sí, dado el tamaño del modelo, pero no confirmado.
- Opciones de despliegue: al ser un modelo de detección con safetensors, se puede usar con HuggingFace transformers, PyTorch y posiblemente con frameworks como vLLM o TGI si se adapta, aunque no hay documentación específica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares. OralDetect-Family es un modelo especializado en odontología, y no se conocen alternativas públicas equivalentes con las mismas características (open-vocabulary + detección dental). Modelos genéricos de detección open-vocabulary como Grounding DINO o OWLv2 podrían servir como referencia, pero no se dispone de datos de rendimiento comparativos.

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere aceptar condiciones adicionales en HuggingFace, lo que puede limitar su uso en entornos corporativos o de investigación.
- Información técnica incompleta: no se publican detalles de arquitectura, parámetros ni entrenamiento, lo que dificulta evaluar su idoneidad para casos de uso específicos.
- Especialización dental: el modelo está entrenado para imágenes dentales; su rendimiento en otros dominios médicos o imágenes generales probablemente sea deficiente.
- Riesgo de alucinación en detección: al ser open-vocabulary, puede generar detecciones falsas si la consulta no está bien formulada o si la imagen tiene baja calidad.
- Sesgos potenciales: al estar entrenado con datos dentales específicos, puede tener sesgos hacia ciertas poblaciones o equipos de imagen, aunque no se documenta.
- Licencia MIT: permite uso comercial, pero el acceso gated implica que el autor puede imponer restricciones adicionales no reflejadas en la licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OralGPT/OralDetect-Family
- Colección OralGPT: https://huggingface.co/OralGPT/collections
- Perfil del autor: https://huggingface.co/OralGPT
- Repositorio GitHub: https://github.com/isjinghao/OralGPT
- README de OralDetect en GitHub: https://github.com/isjinghao/OralGPT/blob/main/OralDetect/README.md
- Artículo en emergentmind: https://www.emergentmind.com/topics/oralgpt
