# hasanchadaram/dictation-cleanup-qwen3.5-4b-gguf

## Resumen

`dictation-cleanup-qwen3.5-4b-gguf` es una conversión al formato GGUF de un modelo Qwen 3.5 de 4B de parámetros, publicada por el usuario hasanchadaram en HuggingFace. El nombre sugiere un ajuste fino orientado a la limpieza de texto dictado (dictation cleanup), es decir, la corrección y normalización de transcripciones de voz para producir texto legible, aunque la model card no documenta explícitamente el proceso de entrenamiento ni el dataset utilizado.

El modelo se distribuye exclusivamente en formato GGUF para su uso con llama.cpp, con dos ficheros: una cuantización Q4_K_M para inferencia de texto y un proyector multimodal (mmproj) en BF16 que habilita capacidades de visión. Los tags incluyen `vision-language-model`, `qwen3_5` y `endpoints_compatible`, lo que indica que el modelo base es multimodal y compatible con despliegues tipo endpoint.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de conversión reciente (noviembre de 2026), sin descargas ni validación comunitaria, y con información muy escasa sobre licencia, idiomas o rendimiento. Resulta útil como punto de partida para experimentar con Qwen 3.5 4B en local, pero no debe considerarse un modelo listo para producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen 3.5 4B, multimodal visión-lenguaje); detalles internos no disponibles |
| Parametros totales | 4.326.350.848 (4,33B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (proyector mmproj) y Q4_K_M (pesos del LLM) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo deriva de la familia Qwen 3.5 en su variante de 4B parámetros, según el nombre del repositorio y los tags. Los tags `vision-language-model` y la presencia de un fichero `mmproj` confirman que el modelo base incorpora un codificador visual y es capaz de procesar imágenes junto con texto. No obstante, la model card no aporta información sobre el número de capas, la dimensión oculta, el mecanismo de atención ni la composición del dataset de entrenamiento.

La conversión a GGUF se realizó con Unsloth, según indica el autor. No se documenta si hubo ajuste fino adicional sobre el modelo Qwen 3.5 4B para la tarea de limpieza de dictado, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se especifican los tokens de entrenamiento ni las innovaciones técnicas del modelo base (por ejemplo, atención lineal, decodificación especulativa o modos de razonamiento extendido), por lo que estos datos deben consultarse en la documentación oficial de Qwen.

## Capacidades

- Generación de texto conversacional, según el tag `conversational`.
- Procesamiento multimodal visión-lenguaje: el fichero `mmproj` permite pasar imágenes al modelo mediante `llama-mtmd-cli`.
- Limpieza y normalización de texto dictado, presumiblemente el propósito del ajuste, aunque no se detalla el formato de entrada/salida esperado.
- Compatibilidad con llama.cpp y con endpoints compatibles (`endpoints_compatible`).
- Soporte de plantillas de chat mediante el flag `--jinja`.
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso, modo thinking ni capacidades de audio.

## Casos de uso

- Limpieza de transcripciones de voz: el modelo puede recibir texto procedente de ASR (reconocimiento automático del habla) y devolver una versión corregida con puntuación, mayúsculas y eliminación de muletillas, que es el propósito declarado por el nombre del repositorio.
- Post-procesado en pipelines de subtitulado: integrado tras un motor de ASR para generar subtítulos legibles antes de su publicación, aprovechando el formato GGUF para ejecución en CPU o GPU modesta.
- Asistentes de dictado en local: despliegue con llama.cpp en estaciones de trabajo sin conexión, útil en entornos con requisitos de privacidad donde no se puede enviar audio o texto a la nube.
- Prototipado de aplicaciones multimodales: el proyector `mmproj` permite experimentar con entradas de imagen y texto en local usando `llama-mtmd-cli`, por ejemplo para describir capturas o extraer texto de imágenes.
- Evaluación comparativa de cuantizaciones: el par BF16 (proyector) y Q4_K_M (LLM) facilita medir la degradación de calidad entre precisión completa y cuantización de 4 bits en tareas de corrección de texto.
- Base para ajuste fino posterior: al ser un GGUF derivado de un modelo de 4B, puede servir como referencia para comparar con versiones afinadas propias, aunque para reentrenar habría que partir de los pesos originales en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: aproximadamente 2,5-3 GB para los pesos del LLM, más el proyector mmproj en BF16 (unos 0,5-1 GB adicionales si se usa el modo multimodal). El tamaño total del repositorio es de 3,5 GB.
- Cabe en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, e incluso en GPUs con 6-8 GB de VRAM usando Q4_K_M en modo solo texto.
- Ejecución en CPU viable con llama.cpp, con throughput moderado pero funcional para tareas de limpieza de texto por lotes.
- Despliegue recomendado: llama.cpp (`llama-cli`, `llama-mtmd-cli`, `llama-server`). No se documenta compatibilidad con vLLM, TGI u Ollama, aunque al ser GGUF estándar debería poder importarse en Ollama.
- Latencia y throughput estimados: no disponibles; dependen del hardware y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| dictation-cleanup-qwen3.5-4b-gguf | 4,33B | no disponible | Sí (mmproj) | no disponible | GGUF |
| Qwen 3.5 4B (base oficial) | ~4B | no disponible en esta ficha | Sí | no disponible en esta ficha | safetensors / GGUF |
| Modelos de limpieza de dictado típicos (p. ej. ajustes de 1-3B) | 1-3B | variable | No habitual | variable | GGUF / safetensors |

La comparativa con alternativas concretas no está disponible en la información proporcionada; se recomienda consultar la documentación oficial de Qwen 3.5 para contrastar contexto, licencia y benchmarks del modelo base.

## Limitaciones y advertencias

- Información muy escasa: no se documentan licencia, idiomas, contexto ni dataset de entrenamiento, lo que impide evaluar su idoneidad para uso comercial.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de calidad ni de que el ajuste funcione según lo sugerido por el nombre.
- Riesgo de alucinación inherente a los modelos de 4B, especialmente en tareas de corrección donde el modelo podría reescribir contenido en lugar de limitarse a normalizarlo.
- La cuantización Q4_K_M introduce pérdida de precisión respecto a BF16; en tareas sensibles a matices (puntuación, nombres propios) conviene validar con muestras propias.
- El proyector multimodal en BF16 requiere cargar el fichero `mmproj` adicional; sin él, el modelo funciona solo como LLM de texto.
- No se especifican sesgos conocidos ni limitaciones idiomáticas; al desconocer los idiomas soportados, no se puede garantizar un rendimiento adecuado en castellano.
- Restricciones de licencia para uso comercial: no disponibles; verificar la licencia del modelo Qwen 3.5 base antes de cualquier despliegue productivo.

## Enlaces

- HuggingFace: https://huggingface.co/hasanchadaram/dictation-cleanup-qwen3.5-4b-gguf
- Unsloth (herramienta de conversión): https://github.com/unslothai/unsloth
- llama.cpp (runtime recomendado): no se proporciona enlace en la información disponible
- Documentación oficial de Qwen 3.5: no se proporciona enlace en la información disponible
