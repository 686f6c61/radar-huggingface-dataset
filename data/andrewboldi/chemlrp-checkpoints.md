# andrewboldi/chemlrp-checkpoints

## Resumen

ChemLRP es una colección de checkpoints fine-tuneados publicada por el usuario andrewboldi en Hugging Face bajo el identificador `andrewboldi/chemlrp-checkpoints`. El nombre sugiere un trabajo de fine-tuning orientado a química (Chem) con alguna técnica de atribución o interpretabilidad de tipo LRP (Layer-wise Relevance Propagation), aunque la model card pública no explicita ni el modelo base, ni la tarea concreta, ni los datos de entrenamiento empleados. El repositorio ocupa 61,9 GB, lo que indica que contiene pesos en precisión completa o media de uno o varios modelos de tamaño considerable, o bien múltiples checkpoints intermedios de un mismo entrenamiento.

La relevancia de esta publicación es limitada y muy específica: se trata de un artefacto de investigación asociado a un DOI (10.57967/hf/11734) y distribuido bajo una licencia corporativa propia de Solely Therapeutics, lo que restringe fuertemente su reutilización. No cuenta con descargas ni interacciones registradas en el momento de la consulta, y no se han publicado resultados de evaluación, especificaciones de arquitectura ni detalles del pipeline.

Por tanto, esta ficha debe leerse como una descripción de un checkpoint de investigación con información pública mínima. Cualquier dato sobre arquitectura, contexto, cuantizaciones o rendimiento se marca explícitamente como no disponible, y las estimaciones de hardware se derivan únicamente del tamaño del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el repositorio ocupa 61,9 GB, compatible con uno o varios checkpoints de miles de millones de parametros, pero no se especifica) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan pesos GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible |
| Licencia | soley-therapeutics-research-license (licencia propia, etiquetada como `other`) |
| Formato de pesos | no disponible (no se detalla en la model card; el tamano del repo sugiere safetensors o binarios PyTorch, sin confirmar) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura del modelo base ni sobre el proceso de fine-tuning. El nombre "ChemLRP" apunta a un trabajo de interpretabilidad aplicada a modelos químicos, posiblemente combinando un modelo de lenguaje o un modelo molecular con técnicas de atribución de relevancia por capas (LRP), pero la model card no confirma esta hipótesis ni aporta detalles sobre capas, atención, tokenizador o tipo de transformer.

Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. El repositorio contiene únicamente checkpoints, lo que sugiere que el material metodológico asociado (paper, código de entrenamiento, scripts de evaluación) se publica en otro lugar, presumiblemente vinculado al DOI 10.57967/hf/11734.

## Capacidades

- No se han documentado capacidades específicas en la información disponible.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni razonamiento multi-paso.
- No se especifican capacidades multilingües.
- No se declaran modos especiales (thinking mode, visión, audio).
- Por el nombre del repositorio, es plausible que los checkpoints estén orientados a tareas de química computacional o interpretabilidad de modelos químicos, pero esto no está confirmado por el autor.

## Casos de uso

- Investigación en interpretabilidad química: los checkpoints podrían emplearse para reproducir experimentos de atribución de relevancia (LRP) sobre modelos entrenados con datos químicos, siempre que el equipo disponga de la metodología original asociada al DOI.
- Reproducibilidad de resultados académicos: útil para grupos que quieran verificar los hallazgos de un artículo vinculado a este repositorio, cargando los pesos en el framework original del autor.
- Análisis comparativo de checkpoints intermedios: al tratarse de una colección de checkpoints, permite estudiar la evolución del entrenamiento si el autor documenta qué paso corresponde a cada carpeta.
- Evaluación interna en entornos farmacéuticos: la licencia de Solely Therapeutics sugiere un uso previsto en investigación terapéutica, por lo que encajaría en pipelines internos de descubrimiento de fármacos sujetos a dicha licencia.
- Base para fine-tuning posterior: un equipo con acceso licenciado podría partir de estos pesos para adaptarlos a una tarea química concreta, asumiendo el coste de almacenamiento de 61,9 GB y la necesidad de identificar el modelo base.
- Auditoría de sesgos en modelos científicos: los checkpoints permiten analizar cómo se distribuye la relevancia de las predicciones en modelos entrenados con datos químicos, un paso previo a su uso en producción regulada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. Un repositorio de 61,9 GB sugiere que la carga en FP16 requiere del orden de 60 GB o más de memoria, dependiendo de si contiene uno o varios checkpoints y de si se carga uno solo a la vez.
- GPU recomendadas: para carga completa en FP16, se necesitarían GPUs de 80 GB (A100, H100) o configuraciones multi-GPU. Si el checkpoint individual es menor, una RTX 4090 (24 GB) podría bastar en cuantización de 8 o 4 bits, pero esto no está confirmado.
- Cabe en consumer GPU: no disponible; depende del tamaño real del checkpoint individual, que no se especifica.
- Opciones de despliegue: no se documentan. Al no haber pesos GGUF ni configuraciones de vLLM, TGI o llama.cpp, el despliegue requeriría cargar los pesos con PyTorch y el código original del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría, dado que no se especifica la tarea, el tamaño ni la arquitectura del modelo.

## Limitaciones y advertencias

- Información pública mínima: la model card no describe arquitectura, datos, evaluación ni uso previsto, lo que impide validar el modelo antes de emplearlo.
- Licencia restrictiva: la soley-therapeutics-research-license es una licencia corporativa propia; el uso comercial probablemente requiere autorización expresa de Solely Therapeutics, y las condiciones completas están en el archivo LICENSE del repositorio.
- Riesgo de alucinación: no evaluable sin benchmarks ni documentación de entrenamiento.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto e idioma: no disponibles.
- Repositorio de gran tamaño (61,9 GB): requiere planificación de almacenamiento y ancho de banda considerables para su descarga y versionado.
- Sin descargas ni validación comunitaria: cero descargas y cero likes en el momento de la consulta, lo que reduce la señal de calidad y el soporte disponible.
- Fecha de creación futura en los metadatos (2026-11-20): conviene verificar la integridad y procedencia de los artefactos antes de usarlos en producción.

## Enlaces

- Hugging Face: https://huggingface.co/andrewboldi/chemlrp-checkpoints
- DOI asociado: https://doi.org/10.57967/hf/11734
- Licencia: archivo LICENSE dentro del repositorio de Hugging Face (no se proporciona URL directa en la información disponible)
