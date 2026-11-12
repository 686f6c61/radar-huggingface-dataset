# arcinstitute/ST-HVG-Replogle

## Resumen

ST-HVG-Replogle es un repositorio publicado en Hugging Face por la organización arcinstitute (Arc Institute). Por su identificador, por el tamaño del repositorio (69,4 GB) y por la nomenclatura "ST-HVG" (probablemente *Spatial Transcriptomics - High Variable Genes*) junto a "Replogle" (referencia al dataset de perturbaciones genéticas CRISPR de Replogle et al.), se trata con alta probabilidad de un conjunto de datos o de pesos asociados a un modelo de biología computacional orientado a transcriptómica espacial y a datos de perturbación génica, no de un modelo de lenguaje generalista.

No se dispone de información pública en la ficha de Hugging Face sobre arquitectura, parámetros, contexto, licencia ni idiomas. La ausencia de pipeline declarado, de descargas y de documentación asociada impide confirmar si se trata de pesos de un modelo, de un dataset empaquetado o de un artefacto intermedio de investigación. Cualquier uso en producción requeriría contactar con el autor o inspeccionar el contenido del repositorio.

Esta ficha se redacta, por tanto, con los escasos metadatos disponibles y marca explícitamente como "no disponible" todo aquello que no puede verificarse, evitando inferencias no sustentadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio ocupa 69,4 GB; no se especifica safetensors, GGUF ni otro formato) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo ni sobre el proceso de entrenamiento en los metadatos accesibles del repositorio. El nombre "ST-HVG-Replogle" sugiere una relación con transcriptómica espacial (ST) y con genes de alta variabilidad (HVG), y la referencia "Replogle" apunta al conocido conjunto de datos de cribado CRISPR de Replogle et al. (2022), ampliamente utilizado en modelos de perturbación génica. Sin embargo, no es posible confirmar si el repositorio contiene pesos de un modelo entrenado sobre esos datos, el propio dataset procesado o ambos.

Tampoco se dispone de información sobre número de tokens, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas como decodificación especulativa o atención lineal. Todo ello debe considerarse no disponible.

## Capacidades

- No se han documentado capacidades específicas en la información disponible.
- No consta soporte de *tool calling* ni de *function calling*.
- No consta soporte de agentes ni de razonamiento multi-paso.
- No consta información sobre capacidades multilingües.
- No consta información sobre modos especiales (*thinking mode*, visión, audio).
- Por el nombre del repositorio, es plausible que esté orientado a tareas de biología computacional (transcriptómica espacial, análisis de perturbaciones génicas), pero esta capacidad no está confirmada por documentación oficial.

## Casos de uso

- Investigación en transcriptómica espacial: el repositorio podría emplearse como base para experimentos de análisis de expresión génica espacial, aunque la falta de documentación obliga a validar previamente su contenido.
- Estudio de perturbaciones génicas CRISPR: la referencia "Replogle" sugiere utilidad potencial en la modelización de efectos de perturbaciones, pendiente de verificación.
- Reproducibilidad de experimentos: útil para investigadores que quieran replicar pipelines asociados al autor, siempre que el repositorio incluya los artefactos necesarios.
- Evaluación comparativa de metodologías: podría servir como referencia en *benchmarks* internos de biología computacional, previa inspección del contenido.
- Docencia y formación: adecuado como material de estudio en cursos de bioinformática si se documenta convenientemente.
- Integración en pipelines de análisis genómico: solo si se confirma que contiene pesos o datos utilizables y se aclara la licencia.

En todos los casos, la ausencia de licencia y de documentación impide recomendar su uso en producción sin una revisión legal y técnica previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se conoce el número de parámetros ni el formato de pesos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamaño del modelo.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se ha confirmado que el repositorio contenga pesos inferibles.
- Latencia y throughput estimados: no disponible.
- Nota: el repositorio ocupa 69,4 GB, lo que sugiere artefactos de gran tamaño; el almacenamiento local necesario para clonarlo es de al menos esa cifra.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables identificables a partir de la información proporcionada, y la naturaleza exacta del artefacto (modelo, dataset o ambos) no está confirmada.

## Limitaciones y advertencias

- Licencia no especificada: no es posible determinar si se permite uso comercial, modificación o redistribución.
- Ausencia de documentación: no hay *model card* con detalles de entrenamiento, evaluación o limitaciones.
- Riesgo de sesgo y alucinación: no evaluable sin información sobre el modelo y sus datos.
- Idiomas y contexto: no disponibles.
- Cero descargas y un único *like* en el momento de la consulta: indica escasa validación por parte de la comunidad.
- El repositorio podría contener datos sensibles (genómicos) sujetos a restricciones éticas o regulatorias adicionales; conviene verificar antes de su uso.
- No se recomienda su despliegue en producción sin una revisión técnica y legal previa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/arcinstitute/ST-HVG-Replogle
- Organización en Hugging Face: https://huggingface.co/arcinstitute
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
