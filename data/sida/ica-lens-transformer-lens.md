# sida/ica-lens-transformer-lens

## Resumen

`sida/ica-lens-transformer-lens` no es un modelo generativo, sino un repositorio de artefactos de interpretabilidad mecanicista: lentes ICA (*Independent Component Analysis*) ya ajustadas para dos modelos transformer concretos, `openai-community/gpt2` y `google/gemma-2-2b`. Lo publica el usuario de HuggingFace `sida` con licencia MIT y con `transformer-lens` como librería de carga. El repositorio resuelve un problema acotado pero recurrente en interpretabilidad: disponer de descomposiciones ICA precalculadas de las activaciones sin tener que reajustarlas para cada experimento.

La estructura de directorios replica la del repositorio de Jacobian Lens de Neuronpedia (`<modelo>/icalens/<dataset>/<modelo>_ica_lens.pt`), de modo que cada artefacto se localiza por modelo, dataset y punto de activación. Los ficheros contienen matrices de lectura y escritura, centros ICA, configuración de preprocesado, capas de origen y procedencia del ajuste. Ambos conjuntos se ajustaron sobre `NeelNanda/pile-10k` y se convirtieron desde el formato ICA Lens 4, con casting de fp32 a fp16 para su distribución.

Su relevancia es práctica para investigadores que analizan representaciones internas: permiten transformar activaciones por capa sin reentrenar la lente, comparar componentes entre modelos y reutilizar resultados en flujos de trabajo basados en TransformerLens. El repositorio ocupa 0,6 GB y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica: artefactos de interpretabilidad (descomposición ICA) para modelos transformer decoder-only; no es un modelo generativo |
| Parámetros totales | No aplica a los artefactos; dependen del modelo base (`gpt2-small` o `gemma-2-2b`) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; el contexto lo define el modelo base sobre el que se capturan activaciones |
| Tipos de cuantización | fp16 en los artefactos distribuidos (convertidos desde fp32); no aplica cuantización de inferencia |
| Idiomas soportados | No disponible; el corpus de ajuste es `NeelNanda/pile-10k` y no se documenta cobertura lingüística |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt`; cada carpeta de dataset incluye un `config.yaml`; conversión desde ICA Lens format 4 |

## Arquitectura y entrenamiento

Los artefactos no constituyen una red neuronal, sino una descomposición lineal de las activaciones internas de un transformer. La lente ICA estima una matriz de lectura (*reading matrix*) que proyecta activaciones al espacio de componentes independientes, una matriz de escritura (*writing matrix*) para la reconstrucción, centros ICA y parámetros de preprocesado. Cada `config.yaml` registra la revisión del modelo base, el punto de activación, la revisión del dataset, los parámetros de ajuste y la conversión de almacenamiento. El ejemplo de la model card aplica `lens.transform(activations, layer=13)` sobre `gemma-2-2b`.

El ajuste se realizó sobre `NeelNanda/pile-10k` para los dos modelos cubiertos. No se detalla en la información proporcionada el número de tokens, la composición exacta del corpus ni si hubo fases de RLHF o DPO, algo que no aplica a este tipo de artefacto. La innovación técnica es el uso de ICA como alternativa lineal a las SAE y a las lentes de tipo logit/tuned lens para extraer direcciones interpretables por capa, con procedencia de ajuste registrada y conversión a fp16 para reducir el tamaño de distribución.

## Capacidades

- Transformar activaciones de un modelo base al espacio de componentes independientes mediante `ICALens.transform(activations, layer=...)`.
- Proporcionar matrices de lectura y escritura, centros ICA y configuración de preprocesado por capa.
- Permitir análisis capa a capa sobre `gpt2-small` y `gemma-2-2b`.
- Integración directa con TransformerLens, que aporta la captura de activaciones y la interpretación posterior.
- Reproducibilidad mediante `config.yaml`, que documenta revisión del modelo, sitio de activación, dataset y parámetros de ajuste.
- Comparación entre modelos: al compartir corpus y formato, facilita contrastar componentes entre GPT-2 small y Gemma-2-2b.
- No genera texto, no soporta *tool calling*, no implementa agentes, no procesa visión ni audio y no ofrece modo *thinking*.
- No se documentan capacidades multilingües propias; dependen del modelo base y del corpus de ajuste.

## Casos de uso

- **Análisis de características por capa en GPT-2 small:** cargar la lente, capturar activaciones con TransformerLens y examinar qué componentes independientes se activan ante un *prompt*; es adecuado porque el artefacto evita reajustar la descomposición en cada experimento.
- **Comparación de representaciones entre GPT-2 y Gemma-2-2b:** al estar ambos ajustados sobre el mismo corpus (`NeelNanda/pile-10k`) y con el mismo formato, se pueden contrastar direcciones y capas de forma controlada.
- **Auditoría de seguridad y sesgos:** identificar componentes que se activan de forma diferencial ante entradas sensibles, usando la lente como herramienta de inspección previa a un análisis causal más profundo.
- **Línea base para comparar métodos de interpretabilidad:** usar las lentes ICA como referencia frente a Jacobian Lens, SAE o logit lens en experimentos de extracción de características.
- **Reproducción de experimentos:** el `config.yaml` permite reconstruir las condiciones de ajuste (revisión, capa, dataset y parámetros), lo que facilita replicar resultados en publicaciones o cuadernos internos.
- **Desarrollo de visores tipo Neuronpedia:** la estructura por modelo, dataset y capa simplifica indexar artefactos y servirlos en herramientas de exploración de componentes.
- **Docencia en interpretabilidad mecanicista:** usar `gpt2-small` como caso pequeño y bien documentado para explicar descomposición lineal de activaciones sin requerir hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de fidelidad de reconstrucción, interpretabilidad, *sparsity* ni comparaciones cuantitativas con otras lentes.

## Requisitos de hardware

- Tamaño del repositorio: 0,6 GB, lo que permite almacenarlo en disco local sin problemas.
- Los artefactos en fp16 se pueden cargar en CPU para su inspección; la captura de activaciones requiere ejecutar el modelo base.
- Para `gpt2-small`, la inferencia y la captura de activaciones caben en GPU de consumo y en CPU con latencia aceptable para experimentos por lotes pequeños.
- Para `gemma-2-2b`, es necesario cargar el modelo base además de la lente; no se proporcionan estimaciones de VRAM en la información disponible.
- No se recomienda vLLM, TGI, Ollama ni llama.cpp: no es un modelo servible, sino una librería de análisis que se usa desde Python con `transformer-lens` y PyTorch.
- No se documentan latencias ni *throughput*; la transformación es una operación lineal por capa y su coste depende de la dimensión de las activaciones y del tamaño del lote.

## Comparativa con modelos similares

| Criterio | Este repositorio (ICA Lens) | Jacobian Lens de Neuronpedia | Sparse autoencoders (SAE) |
|---|---|---|---|
| Enfoque | Descomposición ICA lineal de activaciones | Proyección basada en el Jacobiano | Descomposición dispersa aprendida |
| Modelos cubiertos | `gpt2-small` y `gemma-2-2b` | No disponible en la información | No disponible en la información |
| Corpus de ajuste | `NeelNanda/pile-10k` | No disponible en la información | No disponible en la información |
| Licencia | MIT (artefactos) | No disponible en la información | No disponible en la información |
| Métricas publicadas | Ninguna | No disponible en la información | No disponible en la información |
| Disponibilidad | HuggingFace, 0 descargas y 0 likes | Referencia de formato citada en la model card | No disponible en la información |

La comparación cuantitativa no es posible con los datos disponibles: no se han publicado métricas de reconstrucción ni de calidad de características para este repositorio.

## Limitaciones y advertencias

- **No es un modelo:** no se puede usar para generación, *chat*, *tool calling* ni despliegue como servicio; es un conjunto de artefactos de análisis.
- **Cobertura reducida:** solo cubre `gpt2-small` y `gemma-2-2b`, y un único corpus de ajuste (`NeelNanda/pile-10k`), lo que limita la generalización a otros modelos o dominios.
- **Precisión:** los artefactos se distribuyen en fp16 tras convertir desde fp32, lo que puede introducir pérdida de precisión en comparación con el ajuste original.
- **Idioma:** no se documenta cobertura multilingüe; el comportamiento depende del corpus de ajuste y del modelo base.
- **Licencia del modelo base:** aunque los artefactos son MIT, el uso de `gemma-2-2b` está sujeto a los términos de licencia de Gemma, que son independientes y deben revisarse para uso comercial.
- **Validación comunitaria nula:** 0 descargas y 0 likes en el momento de la consulta; no hay evidencia pública de uso o revisión por terceros.
- **Colisión de nombre:** el identificador `sida` coincide con el acrónimo en castellano y francés de una enfermedad, lo que contamina las búsquedas web y puede dificultar localizar documentación del proyecto.
- **Metadatos anómalos:** la fecha de creación registrada es 2026-10-23, posterior a la fecha habitual de consulta; conviene verificar la procedencia antes de citarlo.
- **Sin métricas:** no hay benchmarks, estudios de fidelidad ni comparaciones publicadas que permitan evaluar su calidad frente a alternativas.

## Enlaces

- HuggingFace: https://huggingface.co/sida/ica-lens-transformer-lens
- Los resultados de búsqueda web proporcionados no son relevantes para este repositorio: corresponden al VIH/sida y no guardan relación con el proyecto. No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
