# naimikky/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-Surgeon-TH-EN-Q4_K_M.gguf

## Resumen

Este repositorio de Hugging Face contiene una cuantizacion GGUF en formato Q4_K_M de un modelo derivado de la familia Qwen, identificado en el nombre como "DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic". Se trata de un modelo de generacion de texto de aproximadamente 9 mil millones de parametros (segun la denominacion "9B"), resultado de una cadena de derivaciones: un modelo base de la familia Qwen, modificado mediante tecnicas de "abliteracion" o "heretic" (eliminacion de rechazos y sesgos de alineacion), y posteriormente sometido a una "cirugia" de vocabulario ("Surgeon") orientada a los idiomas tailandes (TH) e ingles (EN).

El autor del repositorio es el usuario `naimikky`, que publica un artefacto derivado del modelo de `mradermacher` (`DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF`). El pipeline declarado es `text-generation`. La relevancia de esta ficha es limitada y debe interpretarse con cautela: el repositorio presenta cero descargas y cero "likes" en el momento de la consulta, no declara licencia ni idiomas en los metadatos, y su nombre combina referencias a modelos que no se corresponden con lanzamientos publicos verificables (no existe un "DeepSeek-V4-Pro" ni un "Qwen3.5-9B" oficiales en la informacion disponible).

Por tanto, esta ficha documenta lo que el artefacto declara ser, sin poder verificar sus especificaciones reales. No se dispone de informacion sobre arquitectura, datos de entrenamiento, benchmarks ni rendimiento. Cualquier uso en produccion deberia ir precedido de una validacion independiente del modelo y de una revision de la procedencia de sus pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere un transformer de la familia Qwen, no confirmado) |
| Parametros totales | no disponible (la denominacion "9B" sugiere ~9 mil millones, no confirmado) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unica variante publicada en este repositorio) |
| Idiomas soportados | no disponibles (el nombre sugiere tailandes e ingles, no confirmado) |
| Licencia | no disponible (los tags del repositorio mencionan `license:apache-2.0`) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. El nombre del repositorio sugiere una base de la familia Qwen con aproximadamente 9 mil millones de parametros, pero no hay documentacion que confirme la configuracion de capas, atencion, dimensiones ocultas ni el tokenizador resultante tras la "cirugia" de vocabulario.

El nombre indica varias etapas de transformacion: (1) un modelo base Qwen; (2) un proceso de "heretic" o "uncensored", que habitualmente consiste en abliteracion de direcciones de rechazo en el espacio de activaciones para eliminar comportamientos de negativa; (3) una "cirugia" de vocabulario ("Surgeon") orientada a tailandes e ingles, que probablemente implica poda o sustitucion de tokens del tokenizador original. No se documentan volumen de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO o fine-tuning supervisado. No hay informacion sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva (pipeline declarado: `text-generation`).
- Presunta capacidad multilingue limitada a tailandes e ingles, segun el nombre del repositorio; no confirmada.
- Presunta ausencia de rechazos o filtros de alineacion ("uncensored", "heretic"), lo que implica que el modelo no incorpora mecanismos de negativa ante peticiones sensibles.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking".
- No se dispone de informacion sobre capacidades de codigo o matematicas.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el artefacto puede emplearse como caso de estudio de modelos abliterados para analizar como se degradan los rechazos y que riesgos introduce la eliminacion de salvaguardas. Requiere entorno aislado y supervision.
- Analisis de tecnicas de cirugia de vocabulario: util para estudiar el impacto de la poda o sustitucion de tokens en tailandes e ingles sobre la perplejidad y la calidad de generacion, comparando con el modelo base.
- Experimentacion con cuantizacion GGUF: permite evaluar el comportamiento de la cuantizacion Q4_K_M sobre un modelo de ~9B en hardware de consumo, midiendo degradacion de calidad frente a precisiones superiores.
- Generacion de texto creativo en tailandes o ingles en entornos controlados: si la capacidad multilingue se confirma, podria usarse para borradores y prototipos, siempre con revision humana.
- Pruebas de robustez y red-teaming: sirve como modelo "sin filtros" para generar casos adversarios y evaluar clasificadores de seguridad o sistemas de moderacion.
- Docencia sobre riesgos de modelos no verificados: ejemplo practico de por que la procedencia, la licencia y la trazabilidad de los pesos son criterios criticos antes de desplegar un modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_K_M y ~9B parametros, el archivo pesa aproximadamente 5-6 GB; se estima un consumo de VRAM de 6-8 GB incluyendo contexto y overhead, aunque no hay mediciones publicadas.
- GPU recomendadas: no disponible. Por tamano, cabria en GPU de consumo con 8-12 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070), sujeto a validacion.
- Cabe en GPU de consumo: probablemente si, en modelos con 8 GB o mas de VRAM, aunque no confirmado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runners compatibles con GGUF. vLLM y TGI requieren conversion a otros formatos y no estan confirmados para este artefacto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de datos verificables de rendimiento ni de especificaciones confirmadas que permitan una comparacion rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Procedencia no verificada: el nombre combina referencias a modelos no confirmados ("DeepSeek-V4-Pro", "Qwen3.5-9B") y el repositorio no incluye model card detallada ni documentacion de entrenamiento.
- Licencia ambigua: los metadatos del repositorio mencionan `apache-2.0`, pero la ficha indica licencia "no disponible"; la cadena de derivaciones puede imponer restricciones adicionales. Verificar antes de cualquier uso comercial.
- Modelo "uncensored"/"heretic": la eliminacion de salvaguardas implica riesgo elevado de generar contenido danino, sesgado o ilegal; no apto para aplicaciones orientadas al publico sin moderacion externa.
- Riesgo de alucinacion: no cuantificado, pero previsible en modelos abliterados y sin datos de evaluacion.
- Idiomas: presumiblemente limitado a tailandes e ingles tras la cirugia de vocabulario; otras lenguas, incluido el castellano, podrian degradarse gravemente.
- Cero descargas y cero interacciones: no hay evidencia de uso ni validacion por parte de la comunidad.
- Sin benchmarks ni evaluaciones de seguridad publicadas; no recomendable para produccion sin auditoria previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/naimikky/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-Surgeon-TH-EN-Q4_K_M.gguf
- Modelo base declarado: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
