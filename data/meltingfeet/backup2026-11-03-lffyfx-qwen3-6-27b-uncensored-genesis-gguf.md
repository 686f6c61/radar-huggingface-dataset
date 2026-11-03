# meltingfeet/backup2026-11-03-LffyFx-Qwen3.6-27B-Uncensored-Genesis-GGUF

## Resumen

El modelo `meltingfeet/backup2026-11-03-LffyFx-Qwen3.6-27B-Uncensored-Genesis-GGUF` es una cuantización en formato GGUF de la familia Qwen 3.6, concretamente derivada del checkpoint `HauhauCS/Qwen3.6-27B-Uncensored-HauhauCS-Aggressive`. Se trata de un modelo multimodal de tipo image-text-to-text, con arquitectura MoE (Mixture of Experts) según las etiquetas del repositorio, y con un total de 26.895.998.464 parámetros reales (aproximadamente 26,9 mil millones). El autor del artefacto es el usuario `meltingfeet`, que publica esta conversión bajo licencia Apache 2.0.

El modelo está orientado a conversación y a tareas multimodales, con soporte declarado para inglés, chino y uso multilingüe. La etiqueta "uncensored" indica que el checkpoint base ha sido sometido a un proceso de eliminación o atenuación de los mecanismos de rechazo y alineamiento, lo que tiene implicaciones directas sobre su comportamiento en producción. El repositorio está marcado como de acceso restringido (gated), por lo que es necesario aceptar condiciones en HuggingFace antes de descargarlo.

La relevancia de esta ficha es limitada pero concreta: se trata de una conversión GGUF de un modelo MoE multimodal de ~27B, publicada en noviembre de 2026 y sin descargas ni likes en el momento de la consulta. No se dispone de documentación técnica del autor más allá de las etiquetas del repositorio, por lo que numerosos datos de especificación deben considerarse no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) según etiquetas del repo; detalles de capas y expertos no disponibles |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes específicas no disponibles; el repo incluye la etiqueta `imatrix`) |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |
| Modalidad | image-text-to-text (visión + texto) |
| Modelo base | HauhauCS/Qwen3.6-27B-Uncensored-HauhauCS-Aggressive |
| Acceso | Restringido (gated) |
| Tamaño del repo | 32,9 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible indica que el modelo es de tipo MoE y multimodal (image-text-to-text), derivado de un checkpoint de la familia Qwen 3.6 de 27B. No se dispone de detalles sobre el número de expertos, el número de parámetros activos por token, la profundidad de la red, el mecanismo de atención ni la estrategia de fusión de modalidades. Tampoco se documenta la composición del dataset de entrenamiento, el número de tokens procesados, ni si hubo fases de RLHF, DPO o fine-tuning supervisado posteriores al preentrenamiento.

El único dato técnico diferencial explícito es el uso de `imatrix` (importance matrix) en el proceso de cuantización GGUF, una técnica que calibra la cuantización a partir de estadísticas de activación para reducir la pérdida de calidad en cuantizaciones agresivas. No se especifican los niveles de cuantización publicados (Q4_K_M, Q5_K_M, Q8_0, etc.) ni sus tamaños respectivos. El nombre del repositorio sugiere que se trata de una copia de seguridad ("backup") de una conversión previa, lo que refuerza la ausencia de documentación técnica estructurada.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational`.
- Procesamiento de imágenes junto con texto (pipeline `image-text-to-text`), lo que permite entrada multimodal.
- Soporte multilingüe declarado para inglés, chino y otros idiomas (`multilingual`).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere despliegue mediante infraestructura tipo TGI o similar.
- Comportamiento "uncensored": el modelo ha sido modificado para reducir rechazos y filtros de contenido.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Generación de descripciones de imágenes en catálogos de producto: el pipeline image-text-to-text permite alimentar una imagen y obtener texto descriptivo en inglés o chino, útil para enriquecer fichas de e-commerce.
- Asistentes conversacionales sin filtros para investigación sobre alineamiento: el carácter "uncensored" lo hace útil en estudios académicos que comparan comportamientos de modelos con y sin mecanismos de rechazo.
- Procesamiento de documentos escaneados con contexto textual: la combinación de visión y texto permite extraer información de capturas o formularios combinándola con instrucciones en lenguaje natural.
- Despliegue local en estaciones de trabajo con GPU de consumo: al estar en formato GGUF, puede ejecutarse con llama.cpp u Ollama en equipos con VRAM limitada, aunque el tamaño de 27B exige cuantizaciones agresivas.
- Prototipado rápido de aplicaciones multimodales: la compatibilidad con endpoints permite montar un servicio HTTP de inferencia sin infraestructura propietaria.
- Traducción asistida inglés-chino en contextos técnicos: el soporte declarado de ambos idiomas permite usarlo como traductor en pipelines internos, siempre con revisión humana.
- Experimentación con modelos MoE multimodales: sirve como banco de pruebas para estudiar el comportamiento de arquitecturas MoE en tareas de visión-lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de ~27B en GGUF, una cuantización Q4 requiere del orden de 16-18 GB de VRAM, Q5 en torno a 20 GB y Q8 alrededor de 30 GB; estas cifras son estimaciones generales, no datos publicados por el autor.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría esperar viabilidad en A100 40GB, H100 80GB, RTX 4090 24GB (con cuantización Q4/Q5) y RTX 3090 24GB.
- GPU de consumo: probablemente viable en RTX 4090 y RTX 3090 con cuantizaciones Q4 o Q5; en GPUs de 16 GB requeriría cuantizaciones más agresivas o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con endpoints según la etiqueta `endpoints_compatible`. vLLM y TGI no están confirmados para este artefacto GGUF concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| meltingfeet/...Qwen3.6-27B-Uncensored-Genesis-GGUF | ~26,9B (MoE) | no disponible | imagen+texto | Apache 2.0 | Gated, 0 descargas |
| HauhauCS/Qwen3.6-27B-Uncensored-HauhauCS-Aggressive | ~27B (base) | no disponible | imagen+texto | no disponible en esta ficha | Público en HF (modelo base) |
| Qwen 3.6 27B (checkpoint original de la familia) | ~27B | no disponible | según variante | no disponible en esta ficha | Público en HF |

No se dispone de datos de rendimiento comparado para establecer diferencias cuantitativas con alternativas. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo "uncensored": los mecanismos de rechazo han sido atenuados o eliminados, lo que incrementa el riesgo de generar contenido dañino, ilegal o inapropiado sin filtro. No es apto para aplicaciones de cara al público sin capas de moderación adicionales.
- Riesgo elevado de alucinación: no se han publicado evaluaciones de fidelidad factual ni de calibración.
- Ausencia total de documentación técnica: no hay model card sustantiva, ni datos de entrenamiento, ni benchmarks, lo que impide evaluar su calidad de forma rigurosa.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que puede limitar su uso en pipelines automatizados.
- Licencia Apache 2.0 declarada, pero la cadena de derivación (modelo base "uncensored") puede plantear dudas sobre la procedencia y los términos aplicables al checkpoint original; conviene verificar la licencia del modelo base antes de uso comercial.
- Idiomas: solo inglés, chino y "multilingual" genérico; el rendimiento en castellano no está documentado.
- Contexto: longitud no especificada, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.
- El nombre del repositorio ("backup2026-11-03") sugiere que podría tratarse de una copia temporal o no mantenida, con riesgo de desaparición o falta de actualizaciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/meltingfeet/backup2026-11-03-LffyFx-Qwen3.6-27B-Uncensored-Genesis-GGUF
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.6-27B-Uncensored-HauhauCS-Aggressive
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
