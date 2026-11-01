# oteam/protenix-constraint

## Resumen

Protenix-constraint es una variante del modelo Protenix, una reproducción no oficial de AlphaFold3 desarrollada por el equipo de OFoldX (OTeam-AI4S). Se trata de un predictor de estructura biomolecular todo-átomo que maneja proteínas, ácidos nucleicos (ADN y ARN), moléculas pequeñas y sus complejos. Esta variante concreta añade condicionamiento por restricciones estructurales (constraints), lo que permite incorporar información previa como contactos entre átomos, contactos entre tokens, bolsillos de unión y subestructuras conocidas para guiar la predicción.

El modelo se basa en una arquitectura Pairformer con tronco de reciclado condicionado por MSA, difusión de coordenadas EDM y cabezas de distograma y confianza. Con 368,3 millones de parámetros y 48 bloques Pairformer, esta variante concreta (v0.5 con constraint conditioning) es relevante para investigadores que necesitan integrar evidencia experimental parcial en el proceso de predicción de estructuras, algo especialmente útil en casos donde se dispone de datos de mutagénesis, crosslinking o criomicroscopía electrónica de baja resolución.

Es importante señalar que se trata de una implementación no oficial: el equipo de OFoldX ha escrito la model card y adaptado los pesos, pero el repositorio y el paper originales pertenecen a ByteDance. La licencia AGPL-3.0 impone restricciones significativas para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pairformer con tronco MSA-conditioned, difusión de coordenadas EDM, cabezas de distograma y confianza |
| Parámetros totales | 368.338.993 (368,339 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; opera sobre grafos biomoleculares) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (no es un modelo lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Bloques Pairformer | 48 |
| Etapas MSA | 4 |
| Tamaño single | 384 |
| Tamaño pair | 128 |
| Pasos de reciclado | 10 |
| Librería | ofoldx |
| Tamaño del repo | 1,5 GB |

## Arquitectura y entrenamiento

Protenix emplea una arquitectura Pairformer que combina embeddings de átomos y tokens con un tronco de reciclado condicionado por MSA (múltiple sequence alignment). Sobre esta representación opera un módulo de difusión de coordenadas EDM que genera las posiciones atómicas, junto con cabezas auxiliares de distograma y confianza. La variante constraint añade condicionamiento explícito por restricciones estructurales: contactos átomo-átomo, contactos token-token, bolsillos y subestructuras, que se incorporan como evidencia adicional en el proceso de predicción.

Los detalles concretos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. La model card remite a la sección de Training Details del repositorio original, pero no se incluyen cifras en el material consultado. Esta variante corresponde al checkpoint `protenix_base_constraint_v0.5.0`, que comparte grafo con el modelo base v0.5 (48 bloques Pairformer, 4 etapas MSA, 10 pasos de reciclado) y difiere en los pesos y en el condicionamiento por restricciones.

## Capacidades

- Predicción de estructura todo-átomo de proteínas, ADN, ARN y moléculas pequeñas, así como de sus complejos multiméricos.
- Condicionamiento por restricciones estructurales: contactos entre átomos, contactos entre tokens, definición de bolsillos de unión y especificación de subestructuras conocidas.
- Generación de coordenadas atómicas mediante difusión EDM.
- Estimación de confianza por residuo y por par de residuos a través de las cabezas de confianza y distograma.
- Integración de información de plantillas y evidencia estructural parcial (en las variantes correspondientes del ecosistema Protenix).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step en el sentido de los modelos de lenguaje: es un modelo especializado en predicción estructural.
- No dispone de capacidades multilingües ni de generación de texto.

## Casos de uso

- Predicción de complejos proteína-ligando: el modelo puede generar la estructura todo-átomo de un complejo dado el receptor y la molécula pequeña, útil en descubrimiento de fármacos temprano para priorizar candidatos antes de simulaciones de dinámica molecular.
- Refinamiento con datos de crosslinking: las restricciones de contacto átomo-átomo permiten incorporar distancias derivadas de experimentos de crosslinking MS para corregir o validar predicciones en regiones de baja confianza.
- Modelado de interfaces proteína-proteína con evidencia de mutagénesis: los contactos token-token permiten fijar residuos críticos identificados experimentalmente y evaluar cómo se reorganiza la interfaz.
- Predicción de estructuras de ARN con restricciones de apareamiento de bases: la variante soporta ácidos nucleicos y permite incorporar contactos conocidos para guiar el plegamiento de regiones no canónicas.
- Docking guiado por bolsillo: la definición de un bolsillo de unión permite restringir la posición de un ligando en un sitio activo conocido, útil para cribado virtual estructurado.
- Validación de modelos en criomicroscopía electrónica de baja resolución: las subestructuras conocidas pueden actuar como anclajes para construir el resto del modelo y comprobar la consistencia del mapa de densidad.
- Análisis de variantes estructurales: comparar predicciones con y sin restricciones para identificar regiones donde la evidencia experimental cambia la conformación predicha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 368 M de parámetros en precisión FP32, los pesos ocupan aproximadamente 1,5 GB; el consumo real depende del tamaño del complejo de entrada (número de tokens y átomos), de la MSA y de los pasos de difusión.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del modelo, una GPU con al menos 16-24 GB de VRAM debería ser suficiente para complejos de tamaño moderado, pero no se confirma en la documentación.
- Compatibilidad con GPU de consumo: no confirmada. El tamaño de pesos permitiría en principio ejecutarlo en GPUs de consumo con suficiente VRAM, pero los requisitos de memoria para MSA y difusión pueden elevarlos.
- Opciones de despliegue: la librería `ofoldx` (instalable vía `pip install ofoldx`), que expone un pipeline `fold` con selección de modelo. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / alcance | Licencia | Disponibilidad |
|---|---|---|---|---|
| Protenix-constraint (este) | 368,339 M | Todo-átomo con restricciones | AGPL-3.0 | HuggingFace (oteam) |
| Protenix base v0.5 | 368,123 M | Todo-átomo sin restricciones | AGPL-3.0 | HuggingFace (oteam) |
| Protenix-v2 | 464,535 M | Todo-átomo con plantillas | AGPL-3.0 | HuggingFace (oteam) |
| AlphaFold3 (original) | No disponible | Todo-átomo | No comercial | No público |

La comparación se limita a variantes del mismo ecosistema Protenix, ya que no se dispone de datos de benchmarks que permitan comparar con AlphaFold3 u otras alternativas de forma cuantitativa.

## Limitaciones y advertencias

- Implementación no oficial: los pesos y la model card han sido producidos por el equipo de OFoldX, no por ByteDance. La validez de los resultados debe contrastarse con el repositorio original.
- Licencia AGPL-3.0: impone obligaciones de copyleft que pueden ser incompatibles con uso comercial propietario; es necesario revisar las implicaciones antes de integrar el modelo en productos de producción.
- Riesgo de alucinación estructural: como todo predictor, puede generar conformaciones plausibles pero incorrectas, especialmente en regiones sin evidencia experimental o en complejos grandes.
- Dependencia de la calidad de las restricciones: el condicionamiento por constraints puede sesgar la predicción si las restricciones son erróneas o incompletas.
- Idiomas: no aplica, pero conviene señalar que no es un modelo de lenguaje y no debe evaluarse con métricas de NLP.
- Contexto: no es un modelo de contexto textual; su "ventana" viene determinada por el número de tokens y átomos del sistema de entrada.
- Sin benchmarks publicados en la información disponible: no es posible comparar su rendimiento con AlphaFold3 ni con otras alternativas de forma rigurosa.
- Fecha de creación indicada como 2026-11-01, lo que puede deberse a un error de metadatos del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/oteam/protenix-constraint
- Paper: https://doi.org/10.1101/2025.01.08.631967
- Repositorio oficial: https://github.com/bytedance/Protenix
- Código de la implementación: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/protenix
- Librería ofoldx: https://ofoldx.valtech.ai/
- Variante base: https://huggingface.co/oteam/protenix
- Variante con corte de datos posterior: https://huggingface.co/oteam/protenix-20250630
- Variante v0.5: https://huggingface.co/oteam/protenix-v0.5
- Variante base v0.5: https://huggingface.co/oteam/protenix-base
- Variante mini con plantillas: https://huggingface.co/oteam/protenix-mini-tmpl
