# oteam/protenix-base

## Resumen

Protenix es un modelo de predicción de estructura biomolecular a nivel de átomo completo, diseñado para predecir el plegamiento tridimensional de proteínas, ácidos nucleicos (ADN y ARN), pequeñas moléculas y sus complejos. Es una reproducción no oficial del trabajo AlphaFold3 realizada por ByteDance, publicada en bioRxiv en enero de 2025, y esta ficha corresponde a la versión `protenix-base` (v0.5) redistribuida por el equipo OFoldX bajo la librería `ofoldx`.

El modelo emplea una arquitectura basada en Pairformer con un tronco de reciclaje condicionado por MSA, difusión de coordenadas EDM y cabezas de distograma y confianza. Con 368,1 millones de parámetros, 48 bloques Pairformer, 4 etapas de MSA y 10 pasos de reciclaje, está orientado a la inferencia estructural de alta precisión en entornos de investigación biológica computacional.

Su relevancia radica en que ofrece una alternativa de código abierto (licencia AGPL-3.0) a AlphaFold3 para la predicción de complejos multimoleculares, incluyendo interacciones proteína-ligando y proteína-ácido nucleico, un caso de uso crítico en descubrimiento de fármacos y biología estructural que hasta hace poco estaba limitado a modelos propietarios o de acceso restringido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pairformer con tronco de reciclaje condicionado por MSA, difusión de coordenadas EDM, cabezas de distograma y confianza |
| Parametros totales | 368.123.313 (368,1 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada estructural, no textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Bloques Pairformer | 48 |
| Etapas MSA | 4 |
| Tamano Single | 384 |
| Tamano Pair | 128 |
| Pasos de reciclaje | 10 |
| Tamano del repositorio | 1,5 GB |
| Libreria | ofoldx |
| Pipeline | other (predicción estructural) |

## Arquitectura y entrenamiento

Protenix combina embeddings de átomos y tokens con un tronco Pairformer de 48 bloques que se recicla 10 veces y procesa 4 etapas de MSA. Sobre esa representación, el modelo aplica difusión de coordenadas en el espacio EDM para generar las posiciones atómicas, y utiliza cabezas auxiliares de distograma y de confianza para puntuar las predicciones. La variante base v0.5 no incorpora condicionamiento por plantillas ni por restricciones; esas capacidades están disponibles en otras variantes del mismo linaje (`protenix-constraint`, `protenix-mini-tmpl`, `protenix-v2`).

El entrenamiento utiliza una función de pérdida compuesta que combina términos de coordenadas, geométricos, de distograma y de confianza, según se detalla en la model card. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables en un modelo de predicción estructural). La implementación es una reproducción no oficial del paper de AlphaFold3 realizada por ByteDance; el equipo OFoldX ha empaquetado los pesos para su uso con la librería `ofoldx`.

## Capacidades

- Predicción de estructura tridimensional a nivel de átomo completo de proteínas.
- Predicción de estructura de ácidos nucleicos (ADN y ARN).
- Predicción de estructura de pequeñas moléculas y ligandos.
- Predicción de complejos multimoleculares (proteína-proteína, proteína-ligando, proteína-ácido nucleico).
- Puntuación de confianza por predicción mediante cabezas de pTM e ipTM.
- Ranking de predicciones mediante la fórmula `0.8 * ipTM + 0.2 * pTM - 100 * has_clash`.
- Guiado químico sin entrenamiento (training-free chemical guidance) opcional durante el muestreo, con ocho términos químicos configurables, schedules, suavizado Monte Carlo y número de iteraciones.
- Soporte de condicionamiento por restricciones en variantes específicas: contactos atómicos, contactos de tokens, bolsillos (pockets) y subestructuras.
- Soporte de condicionamiento por plantillas y por estructura en variantes específicas.
- No soporta tool calling, function calling ni razonamiento multi-step en el sentido de los modelos de lenguaje; es un modelo biológico especializado.
- No es multilingüe ni genera texto.

## Casos de uso

- Descubrimiento de fármacos y diseño de ligandos: el modelo predice la estructura de complejos proteína-ligando a nivel atómico, lo que permite evaluar el ajuste de candidatos en un bolsillo de unión antes de pasar a simulación molecular o ensayos experimentales. La variante con guiado químico permite imponer restricciones geométricas durante el muestreo.

- Biología estructural de complejos proteína-ácido nucleico: útil para modelar interacciones entre factores de transcripción y ADN, o entre proteínas de unión a ARN y sus dianas, un escenario donde AlphaFold2 tenía limitaciones y donde Protenix cubre ADN y ARN de forma nativa.

- Predicción de estructuras de proteínas sin homólogo estructural conocido: para dianas huérfanas o proteínas de las que no existe estructura experimental en el PDB, el modelo genera un modelo 3D inicial que puede guiar mutagénesis dirigida o cristalografía.

- Análisis de interfaces en complejos multiproteicos: permite predecir la arquitectura de complejos binarios y ternarios, útil en el estudio de vías de señalización y en el diseño de inhibidores de interacciones proteína-proteína (PPI).

- Integración en pipelines de biología computacional: la API de `ofoldx` permite ejecutar el pipeline `fold` de forma programática, lo que facilita su incorporación en flujos automatizados de análisis estructural, cribado virtual o generación de hipótesis en proyectos de investigación.

- Docencia e investigación metodológica: al ser una reproducción abierta de AlphaFold3 bajo AGPL-3.0, sirve como referencia para estudiar y extender la arquitectura Pairformer con difusión de coordenadas, así como para reproducir experimentos del paper original.

- Validación cruzada de modelos experimentales: las puntuaciones de confianza (pTM, ipTM) permiten priorizar candidatos estructurales antes de invertir recursos en validación experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Con 368,1 M de parámetros en precisión FP32, los pesos ocupan aproximadamente 1,5 GB, pero el consumo real depende del tamaño de la macromolécula de entrada, del número de pasos de difusión y del reciclaje.
- GPU recomendadas: no especificadas en la información disponible. Por el perfil del modelo (Pairformer con difusión de coordenadas y MSA), se espera que requiera GPU con memoria suficiente para el grafo de atención sobre tokens y átomos; GPUs de datacenter como A100 o H100 son el entorno habitual para este tipo de modelos, aunque no se confirma en la documentación.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: la vía oficial es la librería `ofoldx` (`pip install ofoldx`), que expone un pipeline `fold` para predicción estructural. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Protenix-base (v0.5) | 368,1 M | no aplica | AGPL-3.0 | HuggingFace (`oteam/protenix-base`) | Reproducción no oficial de AlphaFold3; predicción todo-átomo |
| Protenix-v2 | 464,5 M | no aplica | AGPL-3.0 | HuggingFace (`oteam/protenix-v2`) | Variante mayor con condicionamiento por plantillas |
| Protenix-constraint (v0.5) | 368,3 M | no aplica | AGPL-3.0 | HuggingFace (`oteam/protenix-constraint`) | Añade condicionamiento por restricciones |
| AlphaFold3 (oficial) | no disponible | no aplica | no disponible (acceso restringido) | Servidor de DeepMind / pesos bajo solicitud | Referencia original; pesos no abiertos |

No se dispone de datos de benchmarks comparativos en la información proporcionada para cuantificar diferencias de precisión entre estas variantes.

## Limitaciones y advertencias

- Es una implementación no oficial: la model card advierte explícitamente de que el equipo de ByteDance no escribió esta ficha ni validó necesariamente esta redistribución concreta.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte; el uso comercial en servicios en red requiere liberar el código fuente derivado, lo que puede ser incompatible con productos propietarios.
- No reporta estimación de desorden (disorder): la implementación indica que no se proporciona esta métrica, a diferencia de otras herramientas.
- Los átomos representados requieren elementos conocidos y cargas formales; entradas mal formateadas pueden producir predicciones inválidas.
- Las predicciones se generan en un nuevo marco de coordenadas, por lo que no son directamente comparables con las coordenadas de una estructura experimental sin alineamiento.
- Riesgo de alucinación estructural: como todo modelo generativo de estructuras, puede producir conformaciones plausibles pero incorrectas, especialmente en regiones flexibles o sin homología.
- Sin datos publicados de benchmarks en esta ficha: no es posible verificar el rendimiento frente a AlphaFold3 o Boltz-1 con la información disponible.
- Idiomas: no aplica; el modelo no procesa texto.
- Sin información sobre sesgos: no se documentan sesgos del dataset de entrenamiento en la información proporcionada.
- El pipeline depende de la librería `ofoldx`, lo que limita la portabilidad frente a implementaciones basadas en PyTorch estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/protenix-base
- Variante por defecto v1.0: https://huggingface.co/oteam/protenix
- Variante v1.0 con corte de datos posterior: https://huggingface.co/oteam/protenix-20250630
- Variante v0.5: https://huggingface.co/oteam/protenix-v0.5
- Variante con restricciones: https://huggingface.co/oteam/protenix-constraint
- Variante mini con plantillas: https://huggingface.co/oteam/protenix-mini-tmpl
- Paper de Protenix: https://doi.org/10.1101/2025.01.08.631967
- Repositorio oficial (ByteDance): https://github.com/bytedance/Protenix
- Código de la implementación en OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/protenix
- Guía del pipeline de OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Sitio de la librería ofoldx: https://ofoldx.valtech.ai/
