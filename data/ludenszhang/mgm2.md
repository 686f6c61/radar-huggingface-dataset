# LudensZhang/MGM2

## Resumen

MGM2 (Microbial General Model 2) es un modelo fundacional multimodal desarrollado por el grupo de investigación HUST-NingKang-Lab (autor del repositorio: LudensZhang) para representar comunidades microbianas. No es un modelo de lenguaje: es un codificador especializado que combina identidad de secuencia, abundancia cuantitativa y semántica de comunidad para producir representaciones a nivel de comunidad y características microbianas contextuales, orientadas al estudio de estados de comunidad y su respuesta a intervenciones.

El modelo se preentrenó sobre un corpus de 1.821.291 microbiomas (1.639.420 para entrenamiento y 181.871 para validación disjunta por proyecto). Se distribuye en cuatro escalas de codificador (Small, Medium, Large y XLarge), con 4,1 M, 8,1 M, 15,1 M y 32,8 M parámetros respectivamente, junto con bancos de embeddings de secuencia y taxonómicos y un autoencoder disperso (SAE) de 4.096 características.

Su relevancia actual radica en que aplica el paradigma de los modelos fundacionales y de interpretabilidad (SAE, agentes de interpretación) a la biología de microbiomas, un dominio donde las representaciones aprendidas de comunidades completas son escasas. La versión publicada es la v2.0 (revisión `v2.0.0`), acompañada de un preprint en bioRxiv, un atlas de características y un agente de interpretación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador transformer con condicionamiento CLS sobre tokens de OTU; preentrenamiento mediante reconstrucción de abundancia condicionada por CLS y alineamiento semántico (no disponible el detalle fino de capas/cabezas) |
| Parámetros totales | Cuatro escalas: 4.076.352 (Small), 8.096.640 (Medium), 15.083.520 (Large), 32.838.656 (XLarge); el bundle incluye además bancos de embeddings y un SAE de 4.096 características |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 768 OTUs observadas por comunidad (no es contexto de tokens de texto) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; el ejemplo de uso es en CPU en precisión nativa) |
| Idiomas soportados | Inglés (metadatos y documentación); el modelo opera sobre datos biológicos, no sobre texto |
| Licencia | No disponible |
| Formato de pesos | safetensors (`model.safetensors` + `config.json` por checkpoint) |

## Arquitectura y entrenamiento

MGM2 es un codificador que procesa comunidades microbianas como secuencias de OTUs (hasta 768 observadas por comunidad). Cada comunidad se normaliza antes de la selección top-768; los valores positivos por debajo de 1e-4 se truncan a 1e-4 y se transforman con `clip(log10(x) + 2, -2, 2)`. Los valores retenidos conservan esa escala transformada, y los cuantiles por comunidad definen cinco bins de abundancia positiva (índices 0–4). La entrada combina identidad de secuencia (embeddings derivados de NTv3 para 225.066 OTUs) con embeddings taxonómicos de respaldo para 5.087 grupos.

El preentrenamiento combina tres objetivos: clasificación de abundancia enmascarada, regresión para los dos bins más altos y alineamiento semántico con Qwen3-Embedding-8B. Cada checkpoint se selecciona por la pérdida de validación completa del preentrenamiento; las configuraciones registran arquitectura, época de selección y SHA256 del checkpoint de origen. Las cuatro escalas tienen dimensiones ocultas de 224, 320, 384 y 512 respectivamente. El bundle incluye además un SAE (`sae/otu_l10_k64`) entrenado con BatchTopK (presupuesto medio de activación de 64, umbral fijo en inferencia) que proyecta los estados de OTU de la capa 10 de MGM2-XLarge a 4.096 características dispersas.

## Capacidades

- Representación de comunidades microbianas: produce un vector CLS a nivel de comunidad (por ejemplo, `(1, 512)` en XLarge).
- Representación contextual de OTUs: estados ocultos por token y estados de OTU con mean-pooling.
- Proyección semántica de 4.096 dimensiones alineada con Qwen3-Embedding-8B.
- Embedding de tablas de abundancia completas mediante la herramienta `mgm2-embed`, con recuentos de resolución de secuencia y taxonomía a nivel de muestra.
- Extracción de características dispersas interpretables mediante SAE (4.096 características por OTU).
- Integración con un agente de interpretación que vincula mediciones de características con evidencia bibliográfica (interpretación, investigación bajo demanda y revisión independiente).
- No soporta tool calling, agentes de razonamiento general, generación de texto, código, matemáticas ni visión; no es un modelo generativo de texto.

## Casos de uso

- Estudio de estados de comunidad: codificar muestras de microbioma con el vector CLS para comparar estados entre cohortes y detectar desplazamientos asociados a fenotipos o condiciones ambientales.
- Análisis de respuesta a intervenciones: usar las representaciones de comunidad antes y después de un tratamiento (por ejemplo, antibióticos o probióticos) para cuantificar el cambio de estado con un espacio latente común.
- Búsqueda y agrupamiento de microbiomas: indexar los embeddings CLS de grandes biobancos para recuperación por similitud y clustering no supervisado de muestras.
- Interpretabilidad biológica: aplicar el SAE sobre estados de OTU para obtener características dispersas y vincularlas con literatura mediante el agente de interpretación, facilitando hipótesis mecanísticas.
- Enriquecimiento de pipelines metagenómicos: integrar `mgm2-embed` para convertir tablas de abundancia en representaciones listas para modelos downstream (clasificación, regresión o análisis de asociación).
- Detección de anomalías y control de calidad: comparar la representación de una muestra nueva con la distribución del corpus de preentrenamiento para identificar comunidades atípicas o muestras mal procesadas.
- Priorización experimental: seleccionar comunidades candidatas en experimentos de laboratorio a partir de su posición en el espacio latente antes de validar in vitro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en CPU viable: el ejemplo oficial ejecuta MGM2-XLarge en `device="cpu"`; los tamaños de parámetros (4–33 M) son muy reducidos.
- VRAM estimada: inferior a 1 GB para cualquier escala en precisión nativa; el bundle completo ocupa 2,0 GB en disco (incluye bancos de embeddings y SAE).
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es suficiente; A100/H100 no son necesarios, aunque pueden acelerar el procesamiento por lotes de grandes corpus.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Despliegue: paquete Python `mgm2-community` (extra `tables` para HDF5, extra `notebook` para el tutorial); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MGM2 | Codificador de comunidades microbianas | 4–33 M (cuatro escalas) | 768 OTUs | No disponible | Hugging Face (`LudensZhang/MGM2`, v2.0.0) |
| Alternativas de representación de microbiomas | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni respuestas conversacionales; usarlo fuera de su dominio biológico no tiene sentido.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- Sesgos potenciales derivados del corpus: 1,82 M de comunidades con sesgo hacia los proyectos incluidos; la generalización a entornos no representados (por ejemplo, microbiomas de nichos poco muestreados) es incierta.
- Dependencia de los bancos de embeddings (NTv3 para 225.066 OTUs y respaldo taxonómico para 5.087 grupos): OTUs fuera de esos bancos pueden resolverse solo a nivel taxonómico, con pérdida de granularidad.
- Límite de 768 OTUs por comunidad: comunidades más diversas se truncan tras la selección top-768, lo que puede descartar taxones de baja abundancia.
- Riesgo de interpretación excesiva de las características del SAE: las asociaciones con literatura son hipótesis, no validación experimental.
- Documentación y ecosistema limitados (0 descargas, 1 like en el momento de la consulta): menor madurez y soporte comunitario que modelos establecidos.
- El ejemplo de uso asume el bundle como directorio de trabajo y rutas relativas a los recursos HDF5; requiere descargar el bundle completo (2,0 GB), no solo los pesos.

## Enlaces

- Hugging Face: https://huggingface.co/LudensZhang/MGM2
- Bundle v2.0.0: https://huggingface.co/LudensZhang/MGM2/tree/v2.0.0
- Código: https://github.com/HUST-NingKang-Lab/MGM2
- Tutorial: https://github.com/HUST-NingKang-Lab/MGM2/blob/main/notebooks/01_getting_started.ipynb
- Guía de instalación: https://github.com/HUST-NingKang-Lab/MGM2/blob/main/docs/INSTALLATION.md
- Preprint (bioRxiv): https://doi.org/10.64898/2026.07.20.739063
- Atlas de características: https://www.mgm2atlas.com/
- Agente de interpretación: https://github.com/LudensZhang/mgm2-sae-agent
