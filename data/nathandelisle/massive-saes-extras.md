# nathandelisle/massive-saes-extras

## Resumen

`nathandelisle/massive-saes-extras` es un repositorio de artefactos de investigación publicado por nathandelisle que contiene los checkpoints de los experimentos de control del artículo *Massive Activations Confound Sparse Autoencoders*. No se trata de un modelo de lenguaje generativo, sino de un conjunto de sparse autoencoders (SAE) entrenados sobre las activaciones internas de modelos base como GPT-2 y Pythia-1.4B, con el objetivo de estudiar cómo las activaciones masivas (outliers de gran magnitud) distorsionan el entrenamiento y la interpretación de los SAE.

El repositorio complementa a los SAE principales del proyecto (`nathandelisle/massive-saes`) y agrupa cuatro familias de checkpoints de control: SAE TopK sobre GPT-2 con penalización L1 añadida de intensidad variable (`beta-gpt2/`), controles de calibración para SAE con compuertas (`gated-controls/`), SAE con presupuesto igualado de 63 características aprendidas más una ranura dedicada a la primera componente principal (`matched-budget-63+1/`) y SAE TopK sobre Pythia-1.4B en los bloques 2, 3, 12 y 23 junto con los ficheros PC1 de cada capa (`rebuttal-layers/`).

Su relevancia es metodológica: proporciona material reproducible para investigadores en interpretabilidad mecanicista que quieran verificar o extender los resultados del artículo sobre el impacto de las activaciones masivas en la calidad de las características aprendidas por SAE. El repositorio ocupa 8,4 GB y se distribuye bajo licencia CC BY 4.0, con la salvedad de que también aplican las licencias de los modelos base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoders (TopK, con compuertas y variantes con penalización L1) entrenados sobre activaciones de GPT-2 y Pythia-1.4B |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; opera sobre activaciones por token) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo generativo) |
| Licencia | CC BY 4.0; aplican además las licencias de los modelos base |
| Formato de pesos | `sae.pt` (PyTorch) y `config.json` por checkpoint |

## Arquitectura y entrenamiento

Cada checkpoint es un sparse autoencoder entrenado para reconstruir las activaciones de una capa concreta de un modelo base, imponiendo dispersión mediante TopK, compuertas (gated SAE) o una combinación de TopK con penalización L1. Los experimentos de control documentados en la model card son: `beta-gpt2/` (SAE TopK sobre GPT-2 con penalización L1 de fuerza variable), `gated-controls/` (controles de calibración para SAE con compuertas), `matched-budget-63+1/` (SAE con 63 características aprendidas más una ranura reservada a la primera componente principal, para aislar el efecto de las activaciones masivas) y `rebuttal-layers/` (SAE TopK sobre Pythia-1.4B en los bloques 2, 3, 12 y 23, con los ficheros PC1 correspondientes a cada capa).

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO (no procede en este tipo de artefactos). La innovación técnica central es el diseño de controles que permiten separar el efecto de las activaciones masivas del efecto de la dispersión impuesta, incluyendo la ranura PC1 dedicada en la variante `matched-budget-63+1/`.

## Capacidades

- Extracción de características dispersas a partir de activaciones de GPT-2 y Pythia-1.4B.
- Reconstrucción de activaciones con dispersión controlada (TopK, gated, L1).
- Análisis de la influencia de las activaciones masivas mediante la ranura PC1 dedicada.
- Comparación de configuraciones de control (beta-gpt2, gated-controls, matched-budget, rebuttal-layers).
- Carga directa en PyTorch con `torch.load(path, map_location="cpu", weights_only=True)`.
- No soporta generación de texto, tool calling, agentes ni capacidades multilingües: no es un modelo generativo.

## Casos de uso

- Reproducción de experimentos de interpretabilidad: cargar los checkpoints de `beta-gpt2/` para replicar el barrido de penalización L1 sobre SAE TopK de GPT-2 y verificar la curva de dispersión frente a reconstrucción.
- Auditoría de SAE con compuertas: usar `gated-controls/` para calibrar y comparar la calidad de las características aprendidas por SAE con compuertas frente a variantes TopK.
- Estudio del efecto de activaciones masivas: emplear `matched-budget-63+1/` para aislar cuánto de la calidad de las características se debe a la ranura PC1 y cuánto al resto de características aprendidas.
- Análisis por capas en Pythia-1.4B: cargar los SAE de los bloques 2, 3, 12 y 23 de `rebuttal-layers/` junto con sus ficheros PC1 para estudiar cómo varía la contribución de las activaciones masivas según la profundidad.
- Investigación en seguridad y alineamiento: inspeccionar características activadas para identificar sesgos o comportamientos indeseados en los modelos base, como parte de pipelines de interpretabilidad mecanicista.
- Docencia y formación: utilizar los checkpoints como material didáctico para explicar el funcionamiento interno de un SAE y el problema de los outliers en activaciones.
- Validación de metodologías: servir como conjunto de referencia para comparar nuevas propuestas de SAE contra controles publicados bajo una licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio completo ocupa 8,4 GB en disco, por lo que un checkpoint individual es sustancialmente menor y cabe en GPUs de consumo para inferencia y análisis.
- GPU recomendadas: no especificadas; para cargar y analizar los SAE basta con CPU (`map_location="cpu"`), y para entrenamiento o barridos a gran escala se recomiendan GPUs con suficiente memoria para el modelo base (GPT-2 o Pythia-1.4B) más el SAE.
- Cabe en GPU de consumo: sí, para carga y análisis de los SAE; el modelo base Pythia-1.4B requiere aproximadamente 3 GB en fp16.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI (no es un modelo generativo); la carga se realiza con PyTorch (`torch.load`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Licencia | Disponibilidad |
|---|---|---|---|---|
| nathandelisle/massive-saes-extras | SAE de control | GPT-2, Pythia-1.4B | CC BY 4.0 | Hugging Face |
| nathandelisle/massive-saes | SAE principales | no disponible en la información | no disponible | Hugging Face |
| SAE de Anthropic (p. ej. releases de interpretabilidad) | SAE | Modelos Claude | no disponible | Publicaciones y repositorios de Anthropic |
| SAE de OpenAI (p. ej. releases de interpretabilidad) | SAE | GPT-2 small | no disponible | Repositorios de OpenAI |

La comparación con alternativas comerciales no está disponible en la información proporcionada; los conjuntos de SAE de Anthropic y OpenAI se citan como referencia de categoría, pero no se dispone de sus especificaciones en esta ficha.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni soporta tool calling, agentes ni capacidades multilingües.
- Los checkpoints están vinculados a capas y modelos base concretos (GPT-2, Pythia-1.4B); no son transferibles a otros modelos sin reentrenamiento.
- Los resultados y conclusiones del artículo subyacente no se han validado de forma independiente en la información disponible.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero las licencias de los modelos base (GPT-2, Pythia-1.4B) también aplican y deben respetarse.
- Riesgo de interpretación errónea: las características aprendidas por SAE no son necesariamente interpretables ni causalmente relevantes; los controles del artículo están diseñados precisamente para evidenciar esta limitación.
- No se documentan sesgos específicos de los SAE, pero al derivarse de activaciones de modelos base, heredan los sesgos de estos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nathandelisle/massive-saes-extras
- SAE principales del proyecto: https://huggingface.co/nathandelisle/massive-saes
- Artículo de referencia: *Massive Activations Confound Sparse Autoencoders* (no se dispone de URL en la información proporcionada)
