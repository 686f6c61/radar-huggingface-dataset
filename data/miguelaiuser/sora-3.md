# MiguelAiUser/sora-3

## Resumen

`MiguelAiUser/sora-3` es un modelo publicado en Hugging Face etiquetado como `text-to-video` y asociado a la librería `open_clip`. El repositorio lo firma el usuario MiguelAiUser y declara como modelo base `SORALab/TriCosmos-2.5-predict`, sobre el que se habría aplicado un ajuste fino. La model card es mínima: se limita a metadatos YAML y no incluye descripción técnica, datos de entrenamiento ni resultados de evaluación.

El modelo no guarda relación verificable con el Sora de OpenAI pese al nombre: se trata de una publicación de un tercero, sin descargas ni interacciones en el momento de la consulta, y con metadatos internamente incoherentes (por ejemplo, un dataset de métricas de un modelo de texto GGUF como corpus declarado, y un campo `new_version` que apunta a un modelo ajeno). No hay evidencia publicada de que genere vídeo de forma funcional.

Por tanto, esta ficha recoge únicamente lo declarado en los metadatos del repositorio y marca como no disponible todo aquello que no consta. Se recomienda tratarlo como un artefacto experimental sin garantías de funcionamiento, no como una alternativa a modelos de vídeo consolidados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la librería declarada es `open_clip`, propia de modelos visión-lenguaje, no de generación de vídeo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | openrail |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo. Los metadatos declaran `library_name: open_clip`, lo que sugiere el uso de componentes de OpenCLIP (codificadores de imagen y texto con entrenamiento contrastivo), pero la tarea declarada es `text-to-video`, una combinación que no se explica en la model card. El modelo base indicado es `SORALab/TriCosmos-2.5-predict`, del que no se aportan detalles.

Tampoco consta el volumen de datos de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de alineación como RLHF o DPO. El único dataset referenciado (`AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF-metrics`) parece un conjunto de métricas de un modelo de lenguaje, no un corpus audiovisual, lo que refuerza la falta de coherencia de la publicación.

## Capacidades

- Generación de vídeo a partir de texto: declarada en el pipeline, sin evidencia publicada de resultados.
- Procesamiento de texto e imagen: implícito por el uso declarado de `open_clip`, sin confirmación.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según los metadatos.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Prototipado experimental de generación de vídeo: podría emplearse para probar pipelines text-to-video en entornos de investigación, siempre que se valide antes su funcionamiento real, dado que no hay evidencias publicadas.
- Evaluación de modelos base de terceros: útil como caso de estudio de ajuste fino sobre `SORALab/TriCosmos-2.5-predict` en trabajos de análisis de reproducibilidad.
- Docencia sobre metadatos en Hugging Face: sirve como ejemplo de model card incompleta y de la importancia de verificar procedencia y licencias.
- Integración en demos internas: solo tras una auditoría técnica que confirme que el modelo carga y genera salidas coherentes con la tarea declarada.
- Investigación sobre licencias abiertas: el uso de OpenRAIL permite estudiar cláusulas de uso responsable en modelos generativos.
- No recomendado para producción: la ausencia de benchmarks, de documentación y de descargas desaconseja cualquier despliegue comercial sin validación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible al desconocerse el número de parámetros.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: no documentadas; la librería declarada (`open_clip`) no es un runtime de generación de vídeo estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiguelAiUser/sora-3 | no disponible | no disponible | text-to-video (declarada) | openrail | 0 descargas |
| Sora (OpenAI) | no disponible | no disponible | text-to-video | propietaria, acceso cerrado | API/web de OpenAI |
| SORALab/TriCosmos-2.5-predict | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo base) |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay información sobre arquitectura, entrenamiento ni evaluación.
- Metadatos incoherentes: la librería (`open_clip`), el dataset de métricas de un LLM y la tarea `text-to-video` no encajan entre sí.
- Nombre potencialmente engañoso: no es el Sora de OpenAI ni está afiliado a él.
- Riesgo elevado de que el modelo no sea funcional o no corresponda a la tarea declarada.
- Licencia OpenRAIL: permite uso comercial con restricciones de uso responsable; conviene revisar las cláusulas completas antes de cualquier despliegue.
- Idiomas: solo inglés declarado; sin soporte documentado de castellano.
- Sin descargas ni validación comunitaria: no hay señales de uso real que permitan inferir calidad.
- Riesgo de alucinación y sesgos: no evaluable por falta de información.

## Enlaces

- Hugging Face: https://huggingface.co/MiguelAiUser/sora-3
- Modelo base declarado: https://huggingface.co/SORALab/TriCosmos-2.5-predict
- Sora de OpenAI (referencia, sin relación con este repositorio): https://openai.com/index/sora/
- Sitio de terceros con el nombre "Sora 3" (no afiliado): https://www.sara3.org/
