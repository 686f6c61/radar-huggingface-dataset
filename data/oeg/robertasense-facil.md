# oeg/RoBERTaSense-FACIL

## Resumen

RoBERTaSense-FACIL (RoBERTa Fine-tuned for Accessible Comprehension In Language) es un modelo de clasificación de pares de textos en castellano, desarrollado por el Ontology Engineering Group (OEG) de la Universidad Politécnica de Madrid, que evalúa si una adaptación a Lectura Fácil (Easy-to-Read, E2R) preserva el significado del texto original. Dado un par {original, adaptado}, el modelo emite una puntuación de preservación semántica que permite filtrar automáticamente adaptaciones que alteran el sentido.

Técnicamente es un fine-tuning de `IsGarrido/roberta-base-bne` (copia preservada del checkpoint RoBERTa-base-BNE), con 124.644.866 parámetros y arquitectura transformer encoder. Resuelve un problema concreto de control de calidad en pipelines de accesibilidad cognitiva: la verificación manual de que una reescritura no introduce distorsiones semánticas es costosa y no escala, mientras que este clasificador ofrece una señal automática con métricas publicadas sobre una partición de test independiente.

Su relevancia actual radica en que aborda una tarea poco cubierta (preservación de significado en E2R para castellano) con un modelo pequeño, licencia Apache 2.0 y despliegue trivial en CPU, lo que lo hace apto para integrarse como etapa de validación en herramientas de generación de textos accesibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base), clasificación de secuencias |
| Parametros totales | 124.644.866 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (`max_length=512` en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | es (castellano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de RoBERTa-base-BNE, un encoder transformer de tipo RoBERTa entrenado sobre el corpus BNE (Biblioteca Nacional de España), y se fine-tunea como clasificador binario de pares de secuencias (`AutoModelForSequenceClassification`). La entrada es el par {original, adaptado}; la salida son logits de dos clases, de los que se deriva una puntuación de preservación mediante softmax (índice 1). El umbral de decisión fijado en la evaluación es 0,5.

Los ejemplos positivos provienen de ClearSim, un corpus paralelo en castellano con textos originales y adaptaciones a Lectura Fácil validadas por expertos. Los negativos son sintéticos y "duros", generados con estrategias de alteración semántica: barajado de oraciones, eliminación de oraciones, emparejamiento cruzado (mismatch), distorsión basada en paráfrasis y contradicción detectada por NLI. La partición de test es independiente y agrupada por texto fuente (674 pares), excluida de entrenamiento y de selección de checkpoint. No se documenta en la información disponible el uso de RLHF/DPO ni el volumen total de tokens de entrenamiento.

## Capacidades

- Clasificación de pares de textos: decide si una adaptación preserva el significado del original (clase positiva/negativa).
- Puntuación de preservación semántica continua vía softmax sobre los logits.
- Detección de alteraciones semánticas inducidas: reordenaciones que rompen la causalidad, omisiones de contenido, mezclas entre textos distintos, paráfrasis distorsionadoras y contradicciones.
- Procesamiento de textos en castellano dentro de una ventana de 512 tokens.
- Inferencia en CPU para pares individuales y en GPU para procesamiento por lotes.
- No dispone de generación de texto, tool calling, capacidades de agente, visión ni audio: es exclusivamente un clasificador.

## Casos de uso

- Control de calidad en pipelines de Lectura Fácil: cada par {original, adaptación} generado por un sistema o por un adaptador humano se pasa por el modelo; las puntuaciones bajas se enrutan a revisión humana antes de publicar. Adecuado por su bajo coste computacional y su ventana de 512 tokens, suficiente para párrafos.
- Filtrado de datos sintéticos de aumento: al construir corpus E2R con LLM, usar el clasificador para descartar adaptaciones que no preservan el significado, reduciendo el ruido del conjunto de entrenamiento de otros modelos.
- Evaluación automática de sistemas de simplificación: integrar la puntuación como métrica complementaria (junto con SARI o BLEU) en la comparación de modelos de simplificación de texto en castellano.
- Herramientas de autor para redacción accesible: asistente que avisa al redactor cuando una reescritura altera el sentido del texto fuente, con la puntuación como señal de alerta en la interfaz.
- Verificación en administraciones públicas: validación de comunicados administrativos adaptados a lectura fácil antes de su publicación, como etapa de pre-revisión que reduce la carga del comité de validación.
- Investigación en accesibilidad cognitiva: generación de etiquetas de preservación semántica a escala sobre corpus paralelos, para estudiar patrones de pérdida de significado en adaptaciones reales.
- Moderación de contenido educativo: comprobar que las versiones simplificadas de materiales didácticos mantienen la información esencial del original.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Accuracy | 0,923 | Test independiente (674 pares) |
| F1 clase negativa | 0,913 | Test independiente (674 pares) |
| F1 clase positiva | 0,931 | Test independiente (674 pares) |
| ROC-AUC | 0,977 | Test independiente (674 pares) |
| Pearson r | 0,443 (p = 0,0068) | Validación humana (36 pares) |
| Spearman rho | 0,507 (p = 0,0016) | Validación humana (36 pares) |
| Pearson r | 0,695 (p < 0,001) | Validación humana sin 5 negativos fallidos (31 pares) |
| Spearman rho | 0,709 (p < 0,001) | Validación humana sin 5 negativos fallidos (31 pares) |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no requerida para inferencia de un par en CPU; se recomiendan 12 GB de VRAM para inferencia por lotes grandes.
- RAM: 8 GB o más para inferencia en CPU.
- GPU recomendadas: no especificadas por el autor; cualquier GPU CUDA con memoria suficiente para el lote (el modelo es de 125 M de parámetros, ~500 MB en fp32).
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en CPU con AVX.
- Opciones de despliegue: PyTorch + Transformers (`AutoModelForSequenceClassification`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Almacenamiento: ~500 MB según el autor (el repositorio completo ocupa 1,0 GB).
- Latencia y throughput: no disponibles en la información proporcionada.
- Requisitos de software: python >= 3.9, torch >= 2.0, transformers >= 4.40, datasets >= 2.18; sistemas Linux, macOS y Windows.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoBERTaSense-FACIL | 124,6 M | 512 | Clasificación de preservación de significado (E2R, es) | Apache 2.0 | Hugging Face |
| IsGarrido/roberta-base-bne (base) | ~125 M | 512 | Modelo base enmascarado (es) | no disponible en la información | Hugging Face |
| Modelos de simplificación E2R en castellano | no disponible | no disponible | Generación de texto simplificado | no disponible | no disponible |

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Entrenado específicamente para E2R en castellano; el rendimiento fuera de dominio puede degradarse.
- Las etiquetas binarias comprimen casos matizados; las adaptaciones límite requieren revisión humana.
- Los negativos sintéticos no cubren todas las alteraciones semánticas posibles en adaptaciones reales.
- La puntuación de salida no está calibrada y no debe interpretarse como probabilidad ni como porcentaje de significado preservado.
- La validación humana se realizó sobre solo 36 pares (31 tras excluir cinco negativos fallidos), por lo que las correlaciones tienen alta incertidumbre.
- Ventana de 512 tokens: textos largos requieren truncado o segmentación, con posible pérdida de contexto.
- Riesgo de alucinación no aplicable (no genera texto), pero sí de falsos positivos/negativos en la clasificación.
- Licencia Apache 2.0: permite uso comercial con atribución y sin garantías; conviene revisar las condiciones del corpus ClearSim para usos derivados.
- No se documentan sesgos específicos; al depender de un corpus experto, puede heredar sesgos de estilo o temática de dicho corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oeg/RoBERTaSense-FACIL
- Informe técnico en Zenodo: https://zenodo.org/records/17674467
- Corpus ClearSim: https://rua.ua.es/entities/publication/34d696a3-8322-4d66-87ac-d0852671ecda
- Modelo base: https://huggingface.co/IsGarrido/roberta-base-bne
- Ontology Engineering Group (UPM): https://oeg.fi.upm.es/index.php/en/index.html
