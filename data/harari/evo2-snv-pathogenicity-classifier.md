# harari/evo2-snv-pathogenicity-classifier

## Resumen

El modelo `harari/evo2-snv-pathogenicity-classifier` es un clasificador supervisado de variantes de un solo nucleótido (SNV) en regiones codificantes de 24 genes asociados a miocardiopatía. No es un modelo generativo: se trata de una cabeza de clasificación (un perceptrón multicapa) que opera sobre embeddings congelados extraídos de Evo 2 40B, el modelo genómico de Arc Institute. El autor lo publica como artefacto reproducible del artículo *Evo 2 Predicts Cardiomyopathy-Associated Variants and Elucidates Their Underlying Mechanisms* (Kurozumi, Otsuka et al., bioRxiv 2026), y su función es separar variantes patogénicas o probablemente patogénicas (P/LP) de benignas o probablemente benignas (B/LB) según las anotaciones de ClinVar.

La relevancia práctica está en la interpretación de variantes en diagnóstico genético: un clasificador con AUROC de 0,996 en el conjunto de test sobre 4.568 SNVs ofrece una señal de priorización que puede ayudar a triar variantes de significado incierto antes de la validación experimental. El modelo es extremadamente ligero (0,1 GB en el repositorio, pesos de un MLP de cuatro capas), pero depende por completo de Evo 2 40B para la fase de extracción de características, lo que concentra el coste computacional en el modelo base y no en el clasificador.

Es importante subrayar que el repositorio solo contiene los pesos del clasificador y los ficheros de métricas y predicciones; no incluye el pipeline de embedding ni los datos de entrada. La licencia MIT permite uso comercial, pero la validez clínica no está establecida y el modelo está restringido a un panel concreto de genes de miocardiopatía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de 4 capas (32768 → 512 → 128 → 32 → 1) sobre embeddings congelados de Evo 2 40B |
| Parametros totales | Aproximadamente 16,9 M en el clasificador (calculado a partir de las dimensiones de las capas); Evo 2 40B no se distribuye en este repositorio |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica al clasificador; la ventana de entrada es de 128 pb por secuencia (referencia, reverso complementario, alternativo y su reverso complementario) |
| Tipos de cuantizacion | No disponible (pesos en punto flotante PyTorch; no se documentan variantes cuantizadas) |
| Idiomas soportados | No aplica (modelo de genómica; no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pth` (`snv_classifier_22840.pth`) con `model_state_dict`, `scaler_mean` y `scaler_scale` |

## Arquitectura y entrenamiento

El clasificador es un perceptrón multicapa con normalización por lotes y dropout: `Linear(32768, 512) → ReLU → BatchNorm → Dropout(0.3) → Linear(512, 128) → ReLU → BatchNorm → Dropout(0.3) → Linear(128, 32) → ReLU → BatchNorm → Dropout(0.3) → Linear(32, 1)`. La salida es un logit y la probabilidad se obtiene con sigmoide. La entrada son 32.768 valores: para cada SNV se construye una ventana de 128 pb con la variante en la posición 65 (GRCh38) y se generan cuatro secuencias (referencia, su reverso complementario, alternativo y su reverso complementario). Cada una se embebe con Evo 2 40B usando la capa `blocks.20.mlp.l3`, se promedia sobre las 128 posiciones (8.192 valores por secuencia) y se concatenan las cuatro. Después se estandariza con la media y la escala guardadas en el checkpoint.

El entrenamiento usa 22.840 SNVs codificantes de ClinVar (3.535 P/LP y 19.305 B/LB), divididos a nivel de SNV en 14.617 de entrenamiento, 3.655 de validación y 4.568 de test mediante dos particiones aleatorias estratificadas de scikit-learn con `random_state=42`. Se optimiza con Adam (lr 3 × 10⁻⁴, batch 128) y entropía cruzada binaria, hasta 500 épocas, con parada temprana por AUROC de validación (paciencia 100), decaimiento del lr (×0,5, paciencia 20, mínimo 10⁻⁶) sobre la pérdida de validación y recorte de gradiente de 1,0. Se publican los pesos de la época 29, la de mayor AUROC de validación. No hay RLHF ni DPO: es un ajuste supervisado puro sobre etiquetas de ClinVar.

## Capacidades

- Clasificación binaria de patogenicidad de SNVs codificantes en 24 genes de miocardiopatía, con salida de probabilidad calibrada mediante sigmoide.
- Predicción de efecto de variante (variant effect prediction) a partir de representaciones genómicas de Evo 2 40B.
- Procesamiento de variantes en ambas hebras mediante el uso explícito de secuencias reverso complementarias.
- Reproducibilidad completa: el repositorio incluye `test_predictions.csv`, `metrics.json` y `history.csv` para auditar el rendimiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo discriminativo de un solo paso.
- No tiene capacidades multilingües ni de visión, audio o modalidades distintas de la secuencia de ADN.
- No incorpora modo de razonamiento (thinking mode) ni decodificación especulativa.

## Casos de uso

- Triaje de variantes de significado incierto en paneles de miocardiopatía: dado un SNV codificante en uno de los 24 genes cubiertos, el clasificador devuelve una probabilidad P/LP que puede priorizar qué variantes revisar manualmente en un comité de genética clínica.
- Investigación en genómica cardiovascular: uso del clasificador como línea base supervisada para comparar con predictores de patogenicidad existentes (por ejemplo, scores de conservación o modelos de efecto de variante) en cohortes propias.
- Enriquecimiento de pipelines de anotación de variantes: integración como paso adicional tras la anotación con VEP o ANNOVAR, filtrando candidatos antes de la validación funcional o del estudio de segregación familiar.
- Reproducción y extensión del artículo de Kurozumi et al.: los pesos publicados y el `test_predictions.csv` permiten replicar la Figura S2A y servir de punto de partida para reentrenar con nuevos paneles de genes.
- Docencia y formación en bioinformática: ejemplo compacto y ejecutable en CPU de un flujo embedding congelado más cabeza supervisada, útil para ilustrar transfer learning en genómica.
- Auditoría de modelos genómicos: el clasificador permite estudiar qué información de la capa `blocks.20.mlp.l3` de Evo 2 40B es discriminativa para patogenicidad, mediante análisis de ablación o de importancia de características sobre los 32.768 valores de entrada.
- Desarrollo de clasificadores específicos de gen: reutilizando el mismo esquema (ventana de 128 pb, cuatro secuencias, pooling y MLP) para otros genes o enfermedades, con el clasificador publicado como referencia metodológica.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| AUROC | 0,996 | Test (n = 4.568) |
| AUPRC | 0,982 | Test (n = 4.568) |

No se han publicado en la informacion disponible resultados comparativos con otros modelos de efecto de variante ni métricas adicionales (exactitud, sensibilidad, especificidad, F1) más allá de las dos anteriores.

## Requisitos de hardware

- Inferencia del clasificador: totalmente viable en CPU. Los pesos ocupan aproximadamente 0,1 GB y el forward pass de un MLP de 16,9 M de parámetros es del orden de milisegundos por variante en un núcleo moderno.
- Memoria para los embeddings de entrada: cada SNV requiere 32.768 valores float32 (unos 128 KB) más el almacenamiento temporal de las cuatro secuencias de 128 pb; con lotes de 128 el tensor de entrada ronda los 16 MB.
- El cuello de botella real es Evo 2 40B: la extracción de embeddings de las cuatro secuencias por variante exige el modelo base, que no se distribuye en este repositorio y requiere hardware de GPU de alta gama (A100/H100 de 80 GB o superior, o cuantización agresiva) según la documentación de Arc Institute.
- GPU recomendadas para el clasificador: ninguna en concreto; cualquier GPU consumer (RTX 3060 o superior) sobra para el MLP. Para el pipeline completo, se recomienda A100 80 GB o H100 para Evo 2 40B.
- Opciones de despliegue: PyTorch nativo (el snippet de la model card carga el checkpoint con `torch.load` y `weights_only=True`); no se documentan exportaciones a ONNX, TorchScript ni integraciones con vLLM, llama.cpp u Ollama, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma oficial. Por la arquitectura, el clasificador admite lotes grandes y throughput alto, pero el pipeline completo está dominado por la inferencia de Evo 2 40B.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| harari/evo2-snv-pathogenicity-classifier | MLP sobre embeddings de Evo 2 40B | ~16,9 M (clasificador) | Ventana de 128 pb × 4 secuencias | MIT | HuggingFace, Zenodo |
| Evo 2 40B (arcinstitute/evo2_40b) | Modelo genómico generativo | 40 000 M | Contexto genómico largo (según model card de Arc Institute) | No disponible en la informacion proporcionada | HuggingFace |
| Predictores de patogenicidad basados en conservación (p. ej. scores tipo CADD, REVEL) | Scores estadísticos o de ensemble | No aplica | No aplica | Varía según herramienta | Herramientas web y paquetes |

No se dispone en la información proporcionada de resultados de benchmarks de estos modelos comparables sobre el mismo conjunto de test, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El clasificador solo cubre SNVs codificantes en 24 genes de miocardiopatía; no generaliza a otros genes, a variantes no codificantes, a indels ni a variantes estructurales.
- Las etiquetas provienen de ClinVar (P/LP frente a B/LB), con el desequilibrio de clases asociado (3.535 frente a 19.305); el AUPRC de 0,982 debe interpretarse en ese contexto y no equivale a un rendimiento clínico real.
- Riesgo de sobreajuste a las anotaciones de ClinVar y a la versión concreta de la base de datos utilizada; no se documenta la fecha de descarga ni la estrategia de deduplicación más allá de la partición a nivel de SNV.
- El AUROC de 0,996 en test es sospechosamente alto para predicción de patogenicidad; conviene validar en cohortes externas independientes antes de cualquier uso clínico.
- No es un dispositivo médico ni está validado para diagnóstico; cualquier uso en contexto clínico requiere revisión por genetistas y validación regulatoria.
- Dependencia total de Evo 2 40B para la extracción de embeddings: sin acceso al modelo base y a la capa `blocks.20.mlp.l3` exacta, el clasificador no es utilizable.
- La model card no documenta sesgos poblacionales; los datos de ClinVar están sesgados hacia poblaciones europeas, lo que puede afectar a la equidad del clasificador.
- No se documentan limitaciones de contexto o idioma porque el modelo no procesa lenguaje natural.
- La licencia MIT permite uso comercial, pero el modelo base Evo 2 40B puede tener condiciones propias que deben verificarse por separado antes de un despliegue comercial.
- El repositorio no incluye el código de extracción de embeddings ni los datos de entrada, lo que dificulta la reproducibilidad completa sin el código del artículo (archivado en Zenodo).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/harari/evo2-snv-pathogenicity-classifier
- Modelo base Evo 2 40B: https://huggingface.co/arcinstitute/evo2_40b
- Artículo: Kurozumi, Otsuka et al., *Evo 2 Predicts Cardiomyopathy-Associated Variants and Elucidates Their Underlying Mechanisms*, bioRxiv 2026, doi:10.64898/2026.05.15.725304
- Archivo Zenodo con código de análisis: doi:10.5281/zenodo.23824204
