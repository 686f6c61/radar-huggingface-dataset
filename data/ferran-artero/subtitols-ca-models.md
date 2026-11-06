# ferran-artero/subtitols-ca-models

## Resumen

`subtitols-ca-models` es un repositorio publicado en Hugging Face por el usuario ferran-artero cuyo propósito declarado, a tenor del identificador y de la licencia personalizada `license-subtitols-ca`, parece orientado a tareas de generación o procesamiento de subtítulos en catalán. No obstante, la model card pública no contiene información técnica: únicamente incluye metadatos de licencia (`license: other`, con nombre y enlace a un fichero `LICENSE`), por lo que no es posible confirmar arquitectura, tamaño, contexto ni datos de entrenamiento a partir de la información disponible.

El repositorio no registra descargas ni interacciones (0 descargas, 0 likes) y no tiene pipeline declarado, lo que sugiere un artefacto en fase muy temprana o de uso privado. No se han publicado idiomas soportados en los metadatos, aunque el nombre del repositorio apunta al catalán como idioma principal de trabajo.

Dado que no existe documentación técnica ni resultados de evaluación, esta ficha se limita a reflejar los metadatos disponibles y a marcar explícitamente como "no disponible" todo aquello que la model card no especifica. Cualquier evaluación de idoneidad para producción requiere inspeccionar directamente los ficheros del repositorio y el contenido del fichero `LICENSE`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el identificador sugiere catalán) |
| Licencia | `other`, nombre `license-subtitols-ca`, fichero `LICENSE` en el repositorio |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la model card: no se especifica si se trata de un transformer denso, un modelo MoE, una arquitectura híbrida o un sistema basado en modelos preexistentes ajustados. Tampoco se documentan el número de parámetros, la longitud de contexto nativa ni las técnicas de atención empleadas.

Respecto al entrenamiento, la información disponible no incluye volumen de tokens, composición del dataset, idiomas de entrenamiento ni si se aplicaron fases de ajuste supervisado, RLHF o DPO. La única señal contextual es el nombre del repositorio (`subtitols-ca-models`), que sugiere un uso orientado a subtitulación en catalán, pero se trata de una inferencia a partir del identificador y no de un dato confirmado en la documentación.

## Capacidades

- No se documentan capacidades específicas en la model card.
- No se confirma soporte de generación de texto, razonamiento, código, matemáticas o visión.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se confirma capacidad multilingüe; el identificador apunta a catalán como idioma de trabajo.
- No se confirma la existencia de modos especiales (thinking mode, audio, visión).

## Casos de uso

- Subtitulación automática en catalán: el nombre del repositorio sugiere este propósito, pero no hay documentación que confirme el formato de entrada y salida (audio, texto, SRT, VTT) ni la calidad esperada.
- Post-procesado de transcripciones: plausible si el repositorio contiene un modelo de segmentación o puntuación, aunque no está verificado.
- Traducción o adaptación de subtítulos al catalán: hipótesis derivada del identificador, sin confirmación técnica.
- Integración en pipelines de accesibilidad audiovisual: requeriría validar previamente el formato de pesos y los requisitos de inferencia, hoy desconocidos.
- Evaluación comparativa frente a modelos de subtitulación consolidados: imposible sin benchmarks publicados.
- Uso en producción: no recomendable sin auditoría previa del contenido del repositorio, del fichero `LICENSE` y de los pesos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamaño del modelo, que no se documenta).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se confirma el formato de pesos ni si existen versiones GGUF o cuantizadas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `ferran-artero/subtitols-ca-models` | no disponible | no disponible | `license-subtitols-ca` (other) | Hugging Face, 0 descargas |
| Alternativas de subtitulación en catalán | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa técnica fiable con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se puede verificar arquitectura, tamaño, contexto ni calidad.
- Licencia `other` con nombre `license-subtitols-ca`: es imprescindible revisar el fichero `LICENSE` antes de cualquier uso, especialmente comercial; los términos no son estándar.
- Sin benchmarks ni evaluaciones publicadas: riesgo alto de comportamiento impredecible en producción.
- Sin datos sobre sesgos, alucinación o cobertura lingüística más allá del catalán sugerido por el nombre.
- Repositorio sin descargas ni interacciones: no hay evidencia de uso comunitario ni de mantenimiento.
- No se confirma el formato de pesos: puede requerir herramientas específicas de carga o conversión.
- Fecha de creación y actualización idénticas (2026-11-03): no hay historial de revisiones que permita evaluar la evolución del artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ferran-artero/subtitols-ca-models
- Fichero de licencia: https://huggingface.co/ferran-artero/subtitols-ca-models/blob/main/LICENSE
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
