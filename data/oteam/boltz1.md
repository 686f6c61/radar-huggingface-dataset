# oteam/boltz1

## Resumen

Boltz-1 (repositorio `oteam/boltz1`) es una implementación no oficial del modelo Boltz-1 para la predicción de estructura al-átomo de complejos biomoleculares (proteínas, ARN y ADN), publicada por el equipo OFoldX. El modelo original fue desarrollado por Jeremy Wohlwend, Gabriele Corso y colaboradores del MIT, y este artefacto redistribuye los pesos con una librería propia (`ofoldx`) para su ejecución. No es un modelo de lenguaje: es un predictor estructural de tipo Pairformer con difusión de coordenadas EDM, orientado a resolver el problema del plegamiento y la interacción de complejos biomoleculares.

La arquitectura combina un módulo MSA, un tronco Pairformer reciclado (4 pasadas), un denoiser de difusión EDM para generar coordenadas y un tronco de confianza que predice métricas como pLDDT, PAE, PDE, pTM e ipTM. El modelo tiene 592,16 millones de parámetros, 48 bloques Pairformer, 24 bloques de denoiser y 48 bloques de confianza, con un tamaño de representación simple de 384 y de par de 128. El repositorio ocupa 2,4 GB en formato safetensors.

Su relevancia actual radica en que Boltz-1 se presentó como una alternativa abierta a AlphaFold3 para modelar interacciones biomoleculares, y esta implementación de OFoldX añade controles de inferencia como el guiado por potenciales físicos (Boltz-1x) y el pocket conditioning. La licencia AGPL-3.0 y el carácter no oficial de la implementación son factores determinantes para su evaluación en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pairformer con módulo MSA, tronco reciclado, denoiser de difusión EDM y tronco de confianza |
| Parametros totales | 592.163.134 (592,163 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada estructural, no textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0-or-later |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Boltz-1 es un predictor de estructura al-átomo basado en Pairformer. El modelo refina características de átomos y tokens mediante un módulo MSA y un tronco Pairformer reciclado con 4 pasadas. Sobre esa representación, un modelo de difusión EDM genera las coordenadas atómicas y un tronco de confianza independiente predice pLDDT, PAE, PDE, pTM, ipTM y puntuaciones de ranking. La configuración concreta incluye 48 bloques Pairformer, 4 bloques MSA, 24 bloques de denoiser, 48 bloques de confianza, tamaño simple de 384, tamaño de par de 128 y 200 pasos de muestreo.

El entrenamiento se basa en estructuras del PDB y datos de autodestilación de OpenFold, con objetivos de denoising de coordenadas y de confianza/ranking. El ruido sigue la distribución `sigma = sigma_data * exp(-1.2 + 1.5 * z)` para `z ~ N(0, 1)`, y los errores de coordenadas se ponderan por `(sigma^2 + sigma_data^2) / (sigma * sigma_data)^2`. La model card advierte que OFoldX expone únicamente el término de denoising EDM y no reproduce el schedule conjunto de distograma, confianza y ranking ni el pipeline de datos original. El modelo admite pocket conditioning y el guiado de muestreo Boltz-1x mediante potenciales físicos y Feynman-Kac, que son controles de inferencia y no pesos separados.

## Capacidades

- Predicción de estructura al-átomo de complejos biomoleculares: proteínas, ARN y ADN.
- Predicción de métricas de confianza por residuo y por par: pLDDT, PAE, PDE, pTM, ipTM y puntuaciones de ranking.
- Pocket conditioning para condicionar la generación a la geometría de un bolsillo conocido.
- Guiado por potenciales físicos (Boltz-1x steering): potenciales geométricos y de van der Waals aplicados durante el muestreo.
- Muestreo con steering de Feynman-Kac como control de inferencia.
- Preparación de geometría de referencia para átomos sin observaciones experimentales.
- No soporta tool calling, agentes, generación de texto ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Predicción de estructura de proteínas individuales: se introduce una secuencia o estructura en formato CIF y el pipeline `ofoldx.pipeline("fold", model="oteam/boltz1")` devuelve coordenadas al-átomo y valores de confianza, útil para priorizar dianas antes de cristalografía o criomicroscopía.
- Modelado de complejos proteína-proteína: el tronco de confianza predice ipTM y PAE, lo que permite filtrar interfaces plausibles en estudios de interacción y en el diseño de disruptores de complejos.
- Predicción de estructuras de ARN y ADN: el modelo cubre ácidos nucleicos además de proteínas, lo que lo hace adecuado para analizar ribozimas, aptámeros o complejos nucleoproteicos.
- Docking guiado por bolsillo: con pocket conditioning se puede generar la conformación de un ligando o péptido dentro de un sitio activo conocido, útil en cribado virtual estructurado.
- Refinamiento con restricciones físicas: el steering de Boltz-1x aplica potenciales de van der Waals y geometría durante el muestreo para reducir choques estéricos en las conformaciones generadas, adecuado en pipelines de validación estructural.
- Análisis de variantes y mutaciones: comparar predicciones con y sin una mutación puntual para estimar su impacto en el plegamiento o en la interfaz, usando las métricas de confianza como señal cuantitativa.
- Generación de hipótesis en biología estructural: al ser un modelo abierto con pesos redistribuidos, permite reproducir experimentos y ejecutar predicciones a gran escala en clústeres propios sin depender de servicios cerrados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio pesa 2,4 GB en safetensors, lo que da una cota inferior del orden de 3 GB solo para los pesos; el consumo real depende de la longitud de la secuencia, del número de pasos de muestreo (200 por defecto) y de las activaciones intermedias.
- GPU recomendadas: no disponible. No se especifican modelos de GPU en la documentación.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño de pesos sugiere que cabría en GPUs con 8-16 GB, pero el pico de memoria durante el muestreo con 200 pasos y secuencias largas puede exceder esa cifra.
- Opciones de despliegue: la única vía documentada es la librería `ofoldx` (`pip install ofoldx`) con el pipeline `fold`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| Boltz-1 (oteam/boltz1) | 592,16 M | Estructura biomolecular (CIF); 200 pasos de muestreo | AGPL-3.0-or-later | Pesos en HuggingFace, código en OFoldX |
| Boltz-1 oficial (jwohlwend/boltz) | no disponible en la información | Estructura biomolecular | no disponible en la información | Repositorio oficial en GitHub |
| AlphaFold3 | no disponible en la información | Estructura biomolecular | no disponible en la información | no disponible en la información |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Implementación no oficial: la model card indica explícitamente que el equipo de Boltz-1 no escribió esta ficha y que los artefactos pertenecen al proyecto OFoldX; la fidelidad respecto al modelo original no está garantizada.
- Entrenamiento parcial reproducido: OFoldX solo expone el término de denoising EDM y no reproduce el schedule conjunto de distograma, confianza y ranking ni el pipeline de datos original, lo que puede afectar a la calidad de las predicciones frente al modelo oficial.
- Licencia AGPL-3.0-or-later: impone obligaciones de copyleft fuerte sobre el código que lo integre y su distribución en red; es necesario revisar la License FAQ antes de un uso comercial.
- Guiado físico limitado: el steering de Boltz-1x requiere números atómicos conocidos y radios tabulados soportados; los elementos no soportados generan errores, y los potenciales empíricos no determinan la identidad química ni la validez de la conformación.
- Riesgo de alucinación estructural: como todo predictor de estructura, puede generar conformaciones plausibles pero incorrectas; las métricas de confianza (pLDDT, PAE, ipTM) deben usarse como filtro y no como prueba de validez experimental.
- Sesgos de datos: el entrenamiento con PDB y autodestilación de OpenFold puede infrarepresentar familias proteicas poco presentes en la base de datos.
- Idiomas: no aplica; el modelo no procesa texto.
- Sin cuantizaciones documentadas: no se especifican formatos GGUF ni variantes cuantizadas, lo que limita el despliegue en hardware modesto.
- Repositorio recién creado: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria conocida.

## Enlaces

- HuggingFace: https://huggingface.co/oteam/boltz1
- Paper (Boltz-1): https://doi.org/10.1101/2024.11.19.624167
- Repositorio oficial de Boltz-1: https://github.com/jwohlwend/boltz
- Código de la implementación en OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/boltz1
- Documentación del pipeline: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Datos y pipeline de entrenamiento original: https://github.com/jwohlwend/boltz/blob/main/docs/training.md
- Librería ofoldx: https://ofoldx.valtech.ai/
- Licencia: https://github.com/OTeam-AI4S/OFoldX/blob/main/license.md
- FAQ de licencia: https://github.com/OTeam-AI4S/OFoldX/blob/main/license-faq.md
- Issues de OFoldX: https://github.com/OTeam-AI4S/OFoldX/issues
