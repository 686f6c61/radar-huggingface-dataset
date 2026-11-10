# nathandelisle/massive-saes-objectives

## Resumen

`nathandelisle/massive-saes-objectives` es un repositorio de pesos de autoencoders dispersos (sparse autoencoders, SAE) publicado por el autor nathandelisle como material complementario del artículo *Massive Activations Confound Sparse Autoencoders*. No es un modelo generativo: es un conjunto de SAE entrenados sobre las activaciones internas de ocho modelos base, con el objetivo de estudiar cómo distintos objetivos de entrenamiento (TopK, BatchTopK y ReLU + L1) afectan a la interpretabilidad de las representaciones.

El repositorio contiene la comparativa de objetivos del artículo, repetida sobre cinco semillas para cada combinación de modelo, capa y objetivo. Cada objetivo dispone de una variante `standard` y una variante `bypass`, presumiblemente diseñada para aislar el efecto de las activaciones masivas (massive activations) que el artículo identifica como factor de confusión en los SAE. El tamaño del repositorio es de 67,1 GB, coherente con el almacenamiento de cientos de checkpoints de SAE.

Su relevancia es fundamentalmente metodológica: sirve a investigadores en interpretabilidad mecanicista que quieran reproducir o extender el análisis de objetivos de entrenamiento de SAE, y no está pensado para inferencia de propósito general. La licencia es CC BY 4.0, y se aplican adicionalmente las licencias de los modelos base sobre cuyas activaciones se entrenaron los SAE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder (SAE) entrenado sobre activaciones de modelos transformer; objetivos TopK, BatchTopK y ReLU + L1 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; opera sobre activaciones por capa) |
| Tipos de cuantizacion | no disponible (checkpoints en `sae.pt`, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no disponible (depende del modelo base sobre el que se entrenó cada SAE) |
| Licencia | CC BY 4.0, con las licencias de los modelos base aplicables |
| Formato de pesos | PyTorch (`sae.pt`) + `config.json` por checkpoint |

## Arquitectura y entrenamiento

Cada checkpoint es un autoencoder disperso que reconstruye activaciones de una capa concreta de un modelo base. El repositorio cubre tres objetivos de entrenamiento: TopK, BatchTopK y ReLU con penalización L1. Para cada objetivo se publican dos variantes, `standard` y `bypass`, y cinco semillas por combinación, lo que permite medir la varianza entre ejecuciones y separar el efecto del objetivo del ruido de inicialización.

La estructura de ficheros es `<modelo>/<objetivo>/block<L>/<standard|bypass>/seed<k>/{sae.pt, config.json}`. Las medias y la primera componente principal (PC1) de preprocesamiento de cada modelo base se encuentran en el repositorio principal `nathandelisle/massive-saes`, bajo `<modelo>/preprocessing/`. La carga se realiza con `torch.load(path, map_location="cpu", weights_only=True)`. No se detallan en la información disponible el número de tokens de entrenamiento, el tamaño del diccionario de cada SAE ni la composición del dataset de activaciones.

## Capacidades

- Extracción de características dispersas y monosemánticas a partir de activaciones de modelos base, para análisis de interpretabilidad.
- Comparación controlada de objetivos de entrenamiento de SAE (TopK, BatchTopK, ReLU + L1) sobre las mismas capas y modelos.
- Evaluación de la variante `bypass` frente a `standard`, orientada a medir el impacto de las activaciones masivas en la calidad del SAE.
- Reproducibilidad estadística mediante cinco semillas por configuración.
- No soporta generación de texto, tool calling, agentes, visión ni razonamiento: no es un modelo de lenguaje.
- No dispone de modo thinking, audio ni capacidades multimodales propias.

## Casos de uso

- Investigación en interpretabilidad mecanicista: cargar los SAE de una capa concreta y analizar qué características activa un modelo base ante un estímulo dado, comparando entre objetivos.
- Reproducción del artículo *Massive Activations Confound Sparse Autoencoders*: los checkpoints permiten replicar las curvas de reconstrucción y dispersión por objetivo y semilla sin reentrenar.
- Estudio de la varianza entre semillas: las cinco semillas por configuración permiten cuantificar la estabilidad de cada objetivo de entrenamiento y detectar conclusiones que dependen de una inicialización afortunada.
- Análisis del efecto de activaciones masivas: la comparación `standard` frente a `bypass` sirve para aislar cómo las activaciones de gran magnitud distorsionan las métricas de los SAE.
- Selección de objetivo para pipelines propios: un equipo que entrene sus propios SAE puede usar estos resultados como referencia para elegir entre TopK, BatchTopK y ReLU + L1 según capa y modelo.
- Auditoría de seguridad de modelos base: inspeccionar características activadas en capas intermedias para localizar representaciones asociadas a comportamientos concretos, siempre que se combine con el modelo base correspondiente.
- Docencia y formación: material listo para usar en cursos de interpretabilidad, con checkpoints precargables y estructura de directorios clara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas numéricas de reconstrucción, dispersión ni comparativas entre objetivos; únicamente describe la estructura de los checkpoints y remite al artículo para el análisis.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamaño del diccionario y de la dimensión de activación de cada SAE, datos no publicados en la información disponible.
- GPU recomendadas: no disponible. Al cargarse con `torch.load(..., map_location="cpu")`, los checkpoints pueden inspeccionarse en CPU; para entrenamiento o evaluación a gran escala se requeriría GPU, pero no se especifica cuál.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a SAE.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio completo ocupa 67,1 GB, por lo que conviene descargar solo los subdirectorios del modelo, objetivo y capa de interés.

## Comparativa con modelos similares

| Repositorio | Tipo | Objetivos cubiertos | Semillas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nathandelisle/massive-saes-objectives` | SAE sobre activaciones de 8 modelos | TopK, BatchTopK, ReLU + L1 (standard y bypass) | 5 | CC BY 4.0 | Hugging Face |
| `nathandelisle/massive-saes` | SAE principales del mismo artículo | no disponible en la información | no disponible | no disponible | Hugging Face |
| Otros repositorios públicos de SAE (p. ej. releases de organizaciones de interpretabilidad) | SAE sobre activaciones | variable | habitualmente 1 | variable | Hugging Face / GitHub |

No se dispone de datos de rendimiento comparables entre estos repositorios en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni responde a prompts; usarlo como tal es un error de categoría.
- Los SAE solo son válidos para el modelo base, la capa y la configuración de preprocesamiento con los que se entrenaron; mezclar checkpoints entre modelos produce resultados sin sentido.
- Es imprescindible aplicar el preprocesamiento correcto (media y PC1) del repositorio principal `massive-saes`; omitirlo invalida las reconstrucciones.
- No se documentan sesgos específicos, pero los SAE heredan los sesgos del modelo base subyacente.
- Riesgo de interpretación errónea: las características de un SAE no son necesariamente monosemánticas ni causalmente relevantes; el propio artículo advierte de que las activaciones masivas confunden las métricas.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero las licencias de los modelos base pueden imponer restricciones adicionales que prevalecen.
- El repositorio ocupa 67,1 GB; la descarga completa es costosa y conviene hacerla selectiva.
- No hay información sobre el número de tokens de entrenamiento, tamaño de diccionario ni métricas de calidad, lo que dificulta evaluar los checkpoints de forma independiente.
- Creado y actualizado en noviembre de 2026 según los metadatos, con cero descargas y cero likes: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nathandelisle/massive-saes-objectives
- Repositorio principal de SAE del artículo: https://huggingface.co/nathandelisle/massive-saes
- Artículo *Massive Activations Confound Sparse Autoencoders*: no disponible (no se proporciona enlace directo en la información)
- Repositorio de código del artículo: no disponible
- Demo: no disponible
