# CRG-MIT/ICICLE

## Resumen

ICICLE es un modelo publicado en Hugging Face por la organización CRG-MIT, orientado a la predicción de espectros de masas con ionización electrónica (EI-MS) en el contexto de cromatografía de gases acoplada a espectrometría de masas (GC-MS). El repositorio se etiqueta con los términos chemistry, mass-spectrometry, ei-ms, gc-ms y spectrum-prediction, lo que sitúa al modelo en el ámbito de la química computacional aplicada a la identificación y anotación de compuestos.

El modelo se distribuye bajo licencia MIT, con un tamaño de repositorio de 5,6 GB y acceso restringido (gated), lo que obliga a aceptar condiciones en Hugging Face antes de la descarga. La ficha pública no proporciona información sobre la arquitectura interna, el número de parámetros, la longitud de contexto ni los datos de entrenamiento, por lo que muchos de los apartados técnicos deben marcarse como no disponibles.

Su relevancia potencial radica en la sustitución o complemento de las librerías espectrales experimentales para compuestos sin espectro de referencia, un problema habitual en metabolómica y en análisis ambiental. No obstante, la ausencia de documentación técnica y de resultados de benchmarks en la información disponible limita seriamente cualquier evaluación rigurosa por parte de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 5,6 GB) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la información disponible. Las etiquetas del repositorio (chemistry, mass-spectrometry, ei-ms, gc-ms, spectrum-prediction) sugieren un modelo especializado en la predicción de espectros de masas por ionización electrónica, probablemente a partir de representaciones moleculares (SMILES, grafos o descriptores) y con salida espectral, pero no se confirma ni el tipo de red (transformer, GNN, MLP u otro) ni el paradigma de entrenamiento.

Tampoco se dispone de datos sobre el volumen de entrenamiento, la composición del dataset (por ejemplo, NIST, MassBank, MoNA u otras librerías espectrales), ni sobre si se aplicaron técnicas de ajuste fino supervisado, RLHF o DPO. El tamaño del repositorio (5,6 GB) es compatible con pesos de un modelo de tamaño medio o con artefactos auxiliares, pero no permite inferir la arquitectura con fiabilidad.

## Capacidades

- Predicción de espectros de masas con ionización electrónica (EI-MS), según las etiquetas del repositorio.
- Aplicación declarada en flujos GC-MS, orientada a la generación de espectros para compuestos candidatos.
- Ámbito químico: la etiqueta chemistry indica especialización en representaciones y tareas moleculares.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no es un modelo de lenguaje general).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Anotación de compuestos desconocidos en metabolómica: el modelo podría generar un espectro EI-MS teórico para un candidato propuesto y compararlo con el espectro experimental adquirido por GC-MS, facilitando la identificación cuando no existe referencia en librerías.
- Análisis ambiental de contaminantes: en el cribado de muestras de agua o aire por GC-MS, permitiría priorizar candidatos sin espectro registrado, reduciendo el número de compuestos que requieren síntesis de estándares.
- Verificación cruzada de librerías espectrales: uso del modelo para generar espectros de compuestos ya catalogados y detectar entradas erróneas o inconsistencias en bases de datos internas.
- Enseñanza y formación en espectrometría: generación de espectros de ejemplo para ilustrar fragmentaciones características en asignaturas de química analítica.
- Filtrado previo en pipelines de descubrimiento: descarte rápido de candidatos cuya predicción espectral no concuerda con la señal observada, antes de recurrir a métodos experimentales costosos.
- Integración en herramientas de análisis de datos GC-MS: incorporación del modelo como módulo de puntuación en software de deconvolución o identificación, siempre que se documente su comportamiento y se valide frente a librerías de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende de la arquitectura y del número de parámetros, que no se han publicado.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamaño del modelo; el repositorio de 5,6 GB sugiere que los pesos podrían caber en GPUs con 8-16 GB de VRAM si el modelo es de tamaño moderado, pero es una estimación no confirmada.
- Opciones de despliegue: no disponible (no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; al no ser un modelo de lenguaje, estas herramientas podrían no ser aplicables).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ICICLE (CRG-MIT) | no disponible | no disponible | Predicción EI-MS / GC-MS | MIT | Gated en Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de predicción espectral.

## Limitaciones y advertencias

- Ausencia total de documentación técnica publicada: no se detallan arquitectura, datos de entrenamiento ni metodología de evaluación, lo que impide reproducir o auditar el modelo.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face y disponer de cuenta autorizada, lo que puede retrasar o impedir su uso en entornos automatizados.
- Riesgo de alucinación espectral: en modelos generativos aplicados a química, las predicciones pueden ser plausibles pero incorrectas; se requiere validación experimental antes de cualquier uso analítico crítico.
- Sesgos desconocidos: al no publicarse la composición del dataset, no puede evaluarse el sesgo hacia determinadas clases de compuestos (por ejemplo, moléculas pequeñas frente a metabolitos polares o compuestos halogenados).
- Cobertura química incierta: no se especifica el espacio químico cubierto ni el rendimiento fuera de la distribución de entrenamiento.
- Licencia MIT: permite uso comercial y modificación, pero no exime de la responsabilidad sobre las predicciones; conviene revisar los términos adicionales del acceso gated.
- Sin garantías de mantenimiento: el repositorio se creó y actualizó en noviembre de 2026, sin descargas ni likes registrados, lo que no permite inferir soporte activo de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/CRG-MIT/ICICLE
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
