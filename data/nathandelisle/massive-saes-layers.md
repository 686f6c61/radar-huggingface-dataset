# nathandelisle/massive-saes-layers

## Resumen

Massive SAEs: other layers es una colección de autoencoders dispersos (sparse autoencoders, SAE) de tipo TopK entrenados sobre las activaciones internas de ocho modelos de lenguaje, publicada por el usuario nathandelisle como material complementario del trabajo *Massive Activations Confound Sparse Autoencoders*. No es un modelo generativo: es un conjunto de herramientas de interpretabilidad pensadas para descomponer las activaciones de un transformer en características dispersas y analizar cómo las "activaciones masivas" (componentes de gran magnitud en un número reducido de dimensiones) distorsionan el entrenamiento de los SAE.

El repositorio complementa a los SAE principales publicados en `nathandelisle/massive-saes` y añade dos capas adicionales por modelo: una anterior a la aparición de las activaciones masivas y otra posterior a su desvanecimiento. Para cada capa se ofrecen dos variantes, `standard` y `bypass`, con cinco semillas cada una, lo que permite estudiar la estabilidad del entrenamiento y el efecto de neutralizar las activaciones masivas.

El interés es fundamentalmente metodológico y de investigación en interpretabilidad mecanicista: el paquete permite reproducir y auditar los hallazgos del paper sobre cómo las activaciones masivas confunden las métricas habituales de los SAE. El tamaño del repositorio (44,8 GB) refleja el coste de almacenar 8 modelos × 2 capas × 2 variantes × 5 semillas de checkpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder TopK (k = 64) sobre activaciones de transformers |
| Parametros totales | no disponible (depende de la dimensión de activación de cada capa y modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (checkpoints en punto flotante, formato `.pt`) |
| Idiomas soportados | no disponible |
| Licencia | CC BY 4.0 (aplican además las licencias de los modelos base) |
| Formato de pesos | PyTorch (`sae.pt`) + `config.json` por checkpoint |

## Arquitectura y entrenamiento

Cada checkpoint es un SAE TopK con k = 64: un autoencoder de una sola capa oculta que proyecta la activación del transformer a un espacio disperso de mayor dimensión y retiene únicamente las 64 componentes de mayor magnitud en la activación latente. Este diseño sustituye la penalización L1 de los SAE clásicos por una restricción dura de dispersión, lo que facilita el control del número de características activas por token.

Se entrenan dos variantes por capa y modelo: `standard`, sobre las activaciones tal cual, y `bypass`, diseñada para neutralizar el efecto de las activaciones masivas. El repositorio cubre ocho modelos, dos capas por modelo (una antes de que aparezcan las activaciones masivas y otra después de que se desvanezcan) y cinco semillas por combinación. Un detalle técnico relevante: la media de entrenamiento y la primera componente principal (PC1) de estas capas no se guardaron, por lo que los SAE `bypass` publicados aquí no pueden usarse para reconstrucción tal como se distribuyen. La carga se realiza con `torch.load(path, map_location="cpu", weights_only=True)`.

## Capacidades

- Extracción de características dispersas a partir de activaciones internas de ocho modelos de lenguaje (no genera texto).
- Análisis de interpretabilidad mecanicista: identificación de direcciones latentes asociadas a conceptos o comportamientos.
- Estudio del fenómeno de activaciones masivas y de su impacto en la calidad de los SAE.
- Comparación entre variantes `standard` y `bypass` para aislar el efecto de las activaciones masivas.
- Evaluación de estabilidad entre semillas (cinco por configuración).
- Reconstrucción de activaciones con los SAE `standard`; los `bypass` no son aptos para reconstrucción tal como se publican.
- No soporta tool calling, agentes, visión, audio ni generación de texto.

## Casos de uso

- Investigación en interpretabilidad mecanicista: cargar los SAE de una capa concreta y analizar qué características se activan ante un corpus de prompts, comparando la variante `standard` con la `bypass` para medir la contaminación por activaciones masivas.
- Reproducción del paper *Massive Activations Confound Sparse Autoencoders*: los checkpoints de las capas anterior y posterior a las activaciones masivas permiten replicar los experimentos de ablación descritos por los autores.
- Auditoría de SAE existentes: usar las cinco semillas por configuración para estimar la varianza del entrenamiento y detectar características inestables antes de confiar en ellas en un pipeline de análisis.
- Estudio de robustez entre modelos: al cubrir ocho modelos, permite comparar si un mismo concepto emerge con características similares en distintas arquitecturas y capas.
- Docencia y formación: material práctico para cursos sobre interpretabilidad, con checkpoints listos para cargar en PyTorch y explorar el espacio latente.
- Desarrollo de métodos de mitigación: servir de línea base para probar nuevas variantes de SAE (por ejemplo, con normalización de activaciones masivas) y comparar contra los resultados aquí publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; cada checkpoint es un SAE de una capa y el repositorio completo ocupa 44,8 GB, por lo que un único checkpoint individual es manejable en CPU o en GPU de gama media, pero el conjunto completo requiere almacenamiento considerable.
- GPU recomendadas: no se especifican; para cargar y aplicar un SAE sobre activaciones de un modelo base conviene disponer de la GPU necesaria para ese modelo base, más memoria adicional para el SAE.
- GPU de consumo: un checkpoint individual probablemente cabe en GPU de consumo, pero el dato no está confirmado en la información disponible.
- Despliegue: carga directa con PyTorch (`torch.load`); no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | k / dispersión | Capas cubiertas | Semillas | Licencia |
|---|---|---|---|---|---|
| massive-saes-layers (este) | TopK SAE | k = 64 | 2 por modelo, 8 modelos | 5 | CC BY 4.0 |
| massive-saes (SAE principales del mismo autor) | TopK SAE | no disponible | capas principales | no disponible | CC BY 4.0 |
| SAE de otros proyectos de interpretabilidad | SAE L1 / TopK | variable | variable | variable | variable |

No se dispone de datos de rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni responde a prompts; es un artefacto de análisis.
- Los SAE `bypass` no pueden usarse para reconstrucción tal como se publican, porque no se guardaron la media de entrenamiento ni la PC1 de esas capas.
- Solo cubre dos capas por modelo; no permite un análisis exhaustivo de todas las capas.
- La licencia CC BY 4.0 exige atribución; además, se aplican las licencias de los ocho modelos base, que pueden imponer restricciones adicionales al uso comercial de los SAE derivados.
- Sin datos publicados de benchmarks ni de calidad de reconstrucción en la información disponible.
- Riesgo de sobreinterpretación: las características de un SAE no son necesariamente unidades semánticas limpias, y las activaciones masivas pueden sesgar la interpretación si no se controla la variante `bypass`.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación limitado.

## Enlaces

- Hugging Face: https://huggingface.co/nathandelisle/massive-saes-layers
- SAE principales: https://huggingface.co/nathandelisle/massive-saes
- Paper de referencia (citado en la model card): *Massive Activations Confound Sparse Autoencoders* (no se proporciona URL directa en la información disponible)
