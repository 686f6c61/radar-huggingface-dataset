# oteam/protenix

## Resumen

Protenix es un modelo de predicción de estructura biomolecular a nivel de átomo completo (all-atom) para proteínas, ácidos nucleicos (ADN y ARN), moléculas pequeñas y sus complejos. Se trata de una reproducción no oficial del modelo AlphaFold3, desarrollada originalmente por el equipo de ByteDance y publicada como paper en bioRxiv en enero de 2025. Esta ficha concreta corresponde al checkpoint por defecto v1.0 alojado en HuggingFace por el equipo OTeam-AI4S bajo el identificador `oteam/protenix`, empaquetado para la librería `ofoldx`.

El modelo combina embeddings de átomos y tokens con un tronco Pairformer condicionado por MSA (alineamiento múltiple de secuencias), difusión de coordenadas con formulación EDM (equivalent diffusion model) y cabezas de distograma y confianza. Con 368,5 millones de parámetros totales y un peso de repositorio de 1,5 GB, se posiciona como una alternativa práctica para laboratorios que necesitan predecir estructuras de complejos heterogéneos sin depender de la infraestructura de AlphaFold Server.

Su relevancia actual radica en que reproduce la arquitectura de AlphaFold3 (que no liberó pesos abiertos) con licencia AGPL-3.0, lo que permite inspección, modificación y despliegue local. La existencia de variantes (mini, tiny, constraint, template, structure-conditioned) con distintos equilibrios de tamaño y precisión amplía su aplicabilidad desde prototipado rápido hasta modelado con restricciones experimentales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pairformer con tronco condicionado por MSA, difusión de coordenadas EDM, cabezas de distograma y confianza |
| Parametros totales | 368.548.657 (368,549 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; opera sobre secuencias y MSA de longitud variable) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Libreria | ofoldx |
| Pipeline | other |
| Bloques Pairformer | 48 |
| Etapas MSA | 4 |
| Single Size | 384 |
| Pair Size | 128 |
| Pasos de reciclado (recycling) | 10 |
| Tamano del repo | 1,5 GB |

## Arquitectura y entrenamiento

Protenix sigue la estela arquitectónica de AlphaFold3: un tronco Pairformer de 48 bloques que procesa representaciones de pares de tokens condicionadas por un módulo de procesamiento de MSA con 4 etapas. Sobre ese tronco, un módulo de difusión de coordenadas con formulación EDM genera las posiciones atómicas tridimensionales, mientras que cabezas auxiliares producen el distograma y las puntuaciones de confianza (pLDDT y PAE). El modelo aplica 10 pasos de reciclado para refinar iterativamente la representación interna.

El checkpoint v1.0 aquí descrito corresponde a la variante "Template v1", que incorpora condicionamiento por plantillas estructurales como evidencia adicional. Existen variantes emparentadas: la v0.5 base (sin plantillas), la constraint v0.5 (que admite contactos átomo-átomo, contactos token-token, bolsillos y subestructuras como restricciones), la mini y tiny v0.5 (con 16 y 8 bloques Pairformer respectivamente, 1 etapa MSA y 4 pasos de reciclado) y la mini con ESM2 congelado (que eleva el cómputo de parámetros a 2.967,9 M al incluir el codificador ESM2). La variante Protenix-v2 amplía el Pair Size a 256 y alcanza 464,5 M de parámetros.

No se detalla en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO (técnicas propias de modelos de lenguaje, no aplicables directamente a este tipo de modelo). El paper referenciado (doi:10.1101/2025.01.08.631967) es la fuente primaria para esos detalles.

## Capacidades

- Predicción de estructura tridimensional all-atom de proteínas, ADN, ARN, moléculas pequeñas y complejos mixtos.
- Modelado de complejos proteína-ligando, proteína-ácido nucleico y ácido nucleico-ligando.
- Condicionamiento por plantillas estructurales (variante v1.0).
- Condicionamiento por restricciones geométricas: contactos átomo-átomo, contactos token-token, definición de bolsillos (pockets) y subestructuras (variante constraint).
- Condicionamiento por estructura ruidosa (variante structure condition).
- Predicción de distogramas y métricas de confianza por residuo y por par de residuos (pLDDT, PAE).
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta razonamiento multi-step en el sentido de agentes conversacionales.
- No tiene capacidades multilingües ni de generación de texto.
- No incorpora visión, audio ni modo "thinking".

## Casos de uso

- **Descubrimiento de fármacos y diseño de ligandos**: el modelo predice la pose de unión de moléculas pequeñas a una diana proteica generando la estructura del complejo proteína-ligando. Su condicionamiento por bolsillo (variante constraint) permite restringir la predicción a un sitio activo conocido, lo que resulta útil en cribado virtual.
- **Biología estructural de complejos macromoleculares**: laboratorios que estudian interacciones proteína-ADN o proteína-ARN pueden predecir la conformación del complejo sin necesidad de cristalografía, usando la variante v1.0 con plantillas de estructuras homólogas.
- **Anotación funcional de proteínas desconocidas**: dada una secuencia sin estructura resuelta, el modelo genera un modelo 3D que puede compararse con estructuras conocidas para inferir función, plegamiento y posibles sitios de unión.
- **Diseño de mutantes y análisis de variantes**: la variante constraint permite imponer contactos específicos y evaluar cómo cambios en la secuencia afectan al plegamiento, útil en ingeniería de proteínas.
- **Modelado de ácidos nucleicos**: predicción de estructuras de ARN y ADN, así como de complejos con proteínas, cubriendo un hueco donde AlphaFold2 era limitado.
- **Prototipado rápido con variantes ligeras**: la variante tiny (109,5 M de parámetros) o mini (134,1 M) permite iterar en hardware modesto antes de lanzar predicciones con el modelo base completo.
- **Integración en pipelines bioinformáticos**: la librería `ofoldx` expone una API de pipeline (`ofoldx.pipeline("fold", ...)`) que facilita la incorporación del modelo a flujos automatizados de análisis estructural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de métricas (DockQ, LDDT, RMSD, éxito en CASP) ni comparaciones cuantitativas con AlphaFold3 u otros predictores. Se recomienda consultar el paper de Protenix (doi:10.1101/2025.01.08.631967) para datos de evaluación.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible en la información proporcionada. Con 368,5 M de parámetros en fp32, los pesos ocupan aproximadamente 1,5 GB, pero el consumo real depende del tamaño del complejo, la longitud del MSA, el número de pasos de difusión y los 10 pasos de reciclado.
- **GPU recomendadas**: no disponibles de forma explícita. Por el tamaño del modelo y la naturaleza del cómputo (Pairformer con atención sobre pares de tokens), se espera que requiera GPU con memoria sustancial para complejos grandes, pero no se confirma en la documentación.
- **Compatibilidad con GPU de consumo**: no confirmada. Las variantes tiny y mini, con 8 y 16 bloques Pairformer, son candidatas razonables para GPU de consumo, pero no hay datos oficiales.
- **Opciones de despliegue**: la librería `ofoldx` (instalable vía `pip install ofoldx`) es la vía oficial documentada. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / alcance | Licencia | Disponibilidad |
|---|---|---|---|---|
| Protenix (este checkpoint) | 368,5 M | All-atom, proteínas/ADN/ARN/ligandos/complejos | AGPL-3.0 | Pesos abiertos en HuggingFace |
| AlphaFold3 | No disponible | All-atom, proteínas/ADN/ARN/ligandos/complejos | No comercial (pesos no abiertos) | Solo AlphaFold Server |
| AlphaFold2 | No disponible | Solo proteínas (no ligandos ni ácidos nucleicos) | Apache 2.0 (código) | Pesos abiertos |
| Protenix-v2 | 464,5 M | All-atom con plantillas | AGPL-3.0 | Pesos abiertos (conversión local) |

La ventaja diferencial de Protenix frente a AlphaFold3 es la disponibilidad de pesos con licencia AGPL-3.0, lo que permite uso local, auditoría y modificación. Frente a AlphaFold2, amplía el alcance a ácidos nucleicos y ligandos. La comparación cuantitativa de precisión no está disponible en la información proporcionada.

## Limitaciones y advertencias

- **Implementación no oficial**: esta ficha corresponde a un checkpoint empaquetado por OTeam-AI4S, no por el equipo original de ByteDance. La model card lo declara explícitamente y remite al repositorio oficial `bytedance/Protenix`.
- **Licencia AGPL-3.0**: es una licencia copyleft fuerte. El uso comercial es posible, pero cualquier distribución o servicio en red que use el modelo debe liberar el código fuente bajo la misma licencia. Esto puede ser incompatible con productos propietarios.
- **Riesgo de alucinación estructural**: como todo predictor, puede generar conformaciones plausibles pero incorrectas, especialmente en regiones desordenadas, complejos grandes o con MSA pobre. Las métricas de confianza (pLDDT, PAE) deben interpretarse con cautela.
- **Dependencia de MSA**: el rendimiento depende de la calidad y profundidad del alineamiento múltiple. Secuencias huérfanas o con pocos homólogos pueden producir predicciones poco fiables.
- **Sesgos del dataset**: no se documenta la composición del conjunto de entrenamiento, por lo que no puede evaluarse el sesgo hacia ciertos tipos de proteínas o especies.
- **Idiomas y contexto**: no aplica como modelo lingüístico; no debe usarse para tareas de texto.
- **Sin benchmarks publicados en esta ficha**: no hay datos verificables de precisión en la información proporcionada.
- **Requisitos de hardware no documentados**: la ausencia de especificaciones de VRAM y latencia dificulta la planificación de despliegue en producción.
- **Variantes con ESM2**: los checkpoints mini ESM/ISM empaquetan el codificador ESM2 congelado, lo que multiplica el cómputo de parámetros (2.967,9 M) y los requisitos de memoria.

## Enlaces

- [Modelo en HuggingFace: oteam/protenix](https://huggingface.co/oteam/protenix)
- [Paper de Protenix (bioRxiv)](https://doi.org/10.1101/2025.01.08.631967)
- [Repositorio oficial: bytedance/Protenix](https://github.com/bytedance/Protenix)
- [Codigo del modelo en OFoldX](https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/protenix)
- [Sitio de la libreria ofoldx](https://ofoldx.valtech.ai/)
- [Variante oteam/protenix-20250630](https://huggingface.co/oteam/protenix-20250630)
- [Variante oteam/protenix-v0.5](https://huggingface.co/oteam/protenix-v0.5)
- [Variante oteam/protenix-base](https://huggingface.co/oteam/protenix-base)
- [Variante oteam/protenix-constraint](https://huggingface.co/oteam/protenix-constraint)
- [Variante oteam/protenix-mini-tmpl](https://huggingface.co/oteam/protenix-mini-tmpl)
