# gbouras13/modernprost-50M

## Resumen

ModernProst-50M es un modelo de extracción de características y predicción estructural para proteínas desarrollado por gbouras13. Su función principal es predecir secuencias del alfabeto estructural 3Di de Foldseek (20 estados) y del alfabeto de 12 estados a partir de la secuencia de aminoácidos, sin necesidad de predecir previamente la estructura tridimensional. Esto permite usar las salidas como consultas o dianas en búsquedas Foldseek en lugar de estructuras predichas, reduciendo el coste computacional del pipeline.

El modelo tiene 52.555.936 parámetros (aproximadamente 50M) y se distribuye en formato safetensors con código personalizado (`trust_remote_code=True`). Trabaja a nivel de residuo, con un token por residuo y sin tokens BOS/EOS. En noviembre de 2026 se añadió una cabeza opcional de predicción de pLDDT por residuo (199K parámetros) que lee todas las capas del encoder congelado, sin modificar los pesos ni el código del backbone.

Es relevante para investigadores en bioinformática estructural que necesitan generar representaciones 3Di a escala sin ejecutar predictores de estructura completos, y para pipelines de búsqueda y agrupamiento de proteínas basados en Foldseek.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (encoder transformer con cabezas de clasificación por residuo; detalles no publicados en la model card) |
| Parametros totales | 52.555.936 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada a nivel de residuo, sin BOS/EOS; límite máximo no especificado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de proteínas; alfabetos de salida: 3Di de 20 estados ACDEFGHIKLMNPQRSTVWY y 12 estados ACDEFGHIKLMN) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Cabeza pLDDT opcional | 199.000 parametros, archivos en `plddt_head/` |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna más allá de que se trata de un modelo de `transformers` con código personalizado (`modernprost_3di12st`) que procesa secuencias de aminoácidos con un token por residuo y produce dos cabezas de clasificación: `3di` (20 estados) y `12st` (12 estados). La cabeza de pLDDT añadida en noviembre de 2026 es un predictor pequeño (199K parámetros) que opera sobre el backbone congelado y lee todas las capas del encoder.

El conjunto de datos de entrenamiento declarado es `gbouras13/ModernProst-3di12st`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF/DPO (no aplicables en este dominio). La validación de la cabeza pLDDT se realizó sobre 18.000 proteínas retenidas (5,16M residuos) usando etiquetas pLDDT de AFDB, ColabFold y BFVD, con mejor paso en 28.000.

## Capacidades

- Predicción de secuencias 3Di de Foldseek (20 estados) a partir de secuencia de aminoácidos.
- Predicción de alfabeto estructural de 12 estados (12st).
- Extracción de características por residuo (`feature-extraction`).
- Predicción opcional de pLDDT por residuo (0-100) mediante cabeza auxiliar.
- Procesamiento por lotes con padding (`padding=True`, `add_special_tokens=False`).
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso; es un modelo especializado de dominio.
- Multilingüismo no aplica: la entrada es secuencia proteica en código de un letra.

## Casos de uso

- Búsqueda Foldseek sin estructuras: generar 3Di directamente desde secuencia y usarlas como consulta en Foldseek, evitando ejecutar un predictor de estructura como AlphaFold o ColabFold en cada proteína.
- Anotación estructural a gran escala: procesar metagenomas o proteomas completos para obtener representaciones 3Di y agrupar proteínas por similitud estructural.
- Filtrado previo de candidatos: usar la predicción de pLDDT para descartar regiones de baja confianza antes de un modelado estructural costoso.
- Construcción de bases de datos de perfiles: combinar con la variante `modernprost-50M-pssm` para generar perfiles y enriquecer búsquedas de homología remota.
- Clasificación y clustering de familias proteicas: emplear los logits o embeddings por residuo como características en pipelines de machine learning supervisado.
- Control de calidad en pipelines de plegado: la cabeza pLDDT (AUROC 0,954 para pLDDT < 70) permite priorizar residuos o proteínas para validación experimental o computacional.
- Docencia y prototipado: modelo pequeño (0,2 GB de repo) que cabe en GPU de consumo para experimentos rápidos de representación estructural.

## Benchmarks y rendimiento

Solo se publican métricas de validación de la cabeza pLDDT (18.000 proteínas, 5,16M residuos, mejor paso 28.000):

| Metrica | Valor |
|---|---|
| RMSE | 10,32 |
| MAE | 6,82 |
| Pearson | 0,879 |
| Pearson por proteina | 0,880 |
| AUROC pLDDT < 70 | 0,954 |
| AUROC pLDDT < 50 | 0,966 |

No se han publicado resultados de benchmarks de predicción 3Di/12st (precisión, recall, comparación con Foldseek sobre estructuras reales) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,21 GB solo para pesos (52,5M × 4 bytes), más activaciones; en la práctica, menos de 1 GB para lotes moderados.
- VRAM estimada en fp16/bf16: aproximadamente 0,11 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; RTX 3060, RTX 4090, A100 y H100 son sobradamente suficientes. Cabe en GPU de consumo e incluso en CPU para lotes pequeños.
- Despliegue: `transformers` con `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (orientados a LLM, no aplicables directamente a este modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ModernProst-50M | 52,5M | no disponible | 3Di (20) + 12st + pLDDT | no disponible | Hugging Face |
| modernprost-50M-pssm | no disponible | no disponible | Perfiles PSSM | no disponible | Hugging Face (mismo autor) |
| Foldseek (herramienta) | no aplica | no aplica | Búsqueda estructural | no disponible | Binario/software |
| ESM-2 (modelos pequeños) | 8M-150M | hasta 1.024 residuos (variantes mayores) | Embeddings | MIT (variantes ESM) | Hugging Face |

La comparación con ESM-2 es solo orientativa: ESM-2 produce embeddings generales de proteína, mientras que ModernProst-50M está especializado en alfabetos estructurales. No se dispone de datos de rendimiento comparativo directo en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está especificada; no se puede asumir uso comercial sin consultar al autor.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; auditar antes de usar en producción.
- No se documentan sesgos, pero al entrenarse sobre un dataset concreto (`ModernProst-3di12st`) puede tener peor rendimiento en familias proteicas poco representadas.
- Riesgo de alucinación estructural: las secuencias 3Di predichas pueden no corresponder a estructuras físicamente plausibles; validar con Foldseek o predictores de estructura cuando la precisión sea crítica.
- La cabeza pLDDT es opcional y añadida posteriormente; su validación se limita a las métricas publicadas y no cubre todos los dominios proteicos.
- No hay información sobre límites de longitud de secuencia, manejo de residuos no estándar ni comportamiento con secuencias muy largas.
- Modelo de dominio específico: no debe usarse para tareas de texto general, razonamiento o generación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gbouras13/modernprost-50M
- Variante de perfiles PSSM: https://huggingface.co/gbouras13/modernprost-50M-pssm
- Dataset de entrenamiento: https://huggingface.co/datasets/gbouras13/ModernProst-3di12st
- Foldseek (herramienta de búsqueda estructural): https://github.com/steineggerlab/foldseek
- No se han encontrado papers, blogs ni demos adicionales en la información disponible.
