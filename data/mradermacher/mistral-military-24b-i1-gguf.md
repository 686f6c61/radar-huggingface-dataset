# mradermacher/Mistral-Military-24B-i1-GGUF

## Resumen

Mistral-Military-24B-i1 es una cuantización GGUF con matrices de importancia (imatrix) del modelo Mistral-Military-24B, elaborada por mradermacher. El modelo original, desarrollado por racineai, es un Transformers de la familia Mistral con 23.572.403.200 parámetros (23.57B), orientado a dominios de defensa y militar y entrenado mediante continued-pretraining y fusión TIES. Es bilingüe en francés e inglés y se distribuye bajo licencia Apache 2.0. Esta versión i1 incluye un conjunto extenso de cuantizaciones de baja y media precisión, con un archivo imatrix que permite generar cuantizaciones propias, y está pensada para su despliegue en local con llama.cpp o herramientas compatibles con GGUF. La relevancia del modelo radica en su disponibilidad en formato abierto y en su especialización en un ámbito poco cubierto por los modelos generalistas, aunque la información pública sobre sus capacidades y datos de entrenamiento es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformers (familia Mistral) |
| Parametros totales | 23.572.403.200 |
| Parametros activos | no disponible (no se ha indicado si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K |
| Idiomas soportados | francés, inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con cuantizaciones i1 e imatrix) |

## Arquitectura y entrenamiento

El modelo es una cuantización de racineai/Mistral-Military-24B. Según los metadatos del repositorio, el modelo base utiliza una arquitectura Transformer de la familia Mistral y ha sido sometido a un proceso de continued-pretraining (preentrenamiento continuo) y a una fusión TIES (ties-merge). No se han publicado detalles sobre el número de tokens empleados, la composición exacta del dataset (más allá de que incluye textos en francés e inglés) ni sobre procesos de alineación como RLHF o DPO. Las cuantizaciones i1 de mradermacher usan matrices de importancia (imatrix) para reducir la pérdida de calidad en los niveles de precisión más bajos, una técnica que mejora el rendimiento de la cuantización en comparación con métodos estáticos.

## Capacidades

- Generación de texto y razonamiento en francés e inglés, con un tamaño de 24B que permite manejar tareas complejas de redacción y análisis.
- Especialización en dominios de defensa y militar, según los metadatos del modelo original (tags "military", "defense", "continued-pretraining").
- Posible capacidad de visión no confirmada: la model card menciona que podría ser un modelo de visión, pero los archivos mmproj no están incluidos en este repositorio; se indica que estarían en el repositorio estático.
- No se documenta soporte para tool calling, function calling, agentes ni modos de pensamiento especiales.
- Cuantizaciones disponibles de Q2 a Q6, con opción de archivo imatrix para generar cuantizaciones personalizadas.

## Casos de uso

- Análisis de documentación de defensa: el modelo puede resumir y extraer información de manuales, informes y órdenes en francés e inglés. Su entrenamiento específico en el dominio militar le permite manejar vocabulario técnico con mayor precisión que un modelo generalista.
- Traducción de comunicaciones bilingües: permite traducir documentos y comunicaciones entre francés e inglés en tiempo real, útil en operaciones conjuntas o en organizaciones internacionales de defensa.
- Apoyo a la planificación de misiones: puede redactar borradores de planes operativos o checklists a partir de instrucciones; al ser un modelo de 24B, ofrece una capacidad de razonamiento suficiente, aunque siempre debe revisarse por personal autorizado.
- Formación y simulación de incidentes: puede generar escenarios de entrenamiento o simulaciones de crisis para ejercicios militares, adaptados a la terminología y protocolos del área.
- Análisis de inteligencia de fuentes abiertas: ayuda a procesar grandes volúmenes de noticias y documentos públicos en francés e inglés para la elaboración de resúmenes de inteligencia.
- Soporte en sistemas de asistencia para toma de decisiones: se puede integrar en asistentes que consulten documentación histórica y propongan opciones de actuación, siempre con revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Cuantización Q4_K_M (14.4 GB): VRAM estimada de 16 a 18 GB. Puede ejecutarse en una RTX 3090 o RTX 4090 (24 GB) con margen para el contexto.
- Cuantización Q4_K_S (13.6 GB): VRAM estimada de unos 16 GB. Similar a Q4_K_M, recomendada por el autor como equilibrio entre tamaño y velocidad.
- Cuantización Q6_K (19.4 GB): VRAM estimada de 22 a 24 GB. Necesita una GPU de 24 GB (RTX 4090, A100 40 GB) o superior.
- Cuantizaciones menores (IQ2_M 8.2 GB, IQ3_XXS 9.4 GB, etc.): VRAM estimada de 10 a 12 GB, apta para GPUs de consumo con 12 o 16 GB (RTX 4070, RTX 4080).
- Para ejecución en CPU, se requiere RAM suficiente para cargar el archivo GGUF elegido más un margen para el contexto.
- Opciones de despliegue: llama.cpp, Ollama (importando el archivo GGUF manualmente), text-generation-webui y cualquier servidor compatible con GGUF. No se indica compatibilidad con vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Idiomas |
|---|---|---|---|---|---|
| mradermacher/Mistral-Military-24B-i1-GGUF | 23.57B | no disponible | GGUF (i1/imatrix) | Apache 2.0 | fr, en |
| racineai/Mistral-Military-24B (base) | 23.57B | no disponible | safetensors (transformers) | Apache 2.0 | fr, en |
| mradermacher/Mistral-Military-24B-GGUF | 23.57B | no disponible | GGUF (estático) | Apache 2.0 | fr, en |

No se han publicado benchmarks comparativos entre estos modelos. Las diferencias principales están en el formato de cuantización: la versión i1 usa matrices de importancia (imatrix) para mejorar la calidad de los quants, mientras que la versión estática no. El modelo base está en formato safetensors y requiere frameworks como transformers.

## Limitaciones y advertencias

- El modelo está entrenado específicamente en dominios militares/de defensa; puede reflejar sesgos presentes en los datos de entrenamiento, especialmente en cuanto a terminología militar y perspectivas francesas o europeas.
- Riesgo de alucinación inherente a todos los modelos de lenguaje; es imprescindible la revisión humana en aplicaciones críticas de defensa.
- No se dispone de datos sobre la longitud de contexto, por lo que el rendimiento en tareas de contexto largo es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar las condiciones del modelo base racineai/Mistral-Military-24B, que puede tener restricciones adicionales no indicadas en este repositorio.
- Las cuantizaciones de baja precisión (IQ2_M, Q2_K_S) degradan significativamente la calidad; se recomienda usar Q4_K_M o superior para producción.
- No se confirma la capacidad de visión en este repositorio; si se necesita procesar imágenes, hay que consultar el repositorio estático.

## Enlaces

- Repositorio principal: https://huggingface.co/mradermacher/Mistral-Military-24B-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Mistral-Military-24B-GGUF
- Modelo base: https://huggingface.co/racineai/Mistral-Military-24B
- Modelo relacionado (búsqueda web): https://huggingface.co/mradermacher/Berthier-Mistral-Military-24B-i1-GGUF
- FAQ y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
- Referencia sobre calidad de cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Guía de uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
