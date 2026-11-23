# quorumbio/biomedical-ner-chemical-disease

## Resumen

`quorumbio/biomedical-ner-chemical-disease` es un modelo de reconocimiento de entidades nombradas (NER) biomédico para inglés, desarrollado por Quorum Bio, que etiqueta menciones de **Chemical** (fármacos, compuestos) y **Disease** (enfermedades) en texto científico y clínico. Se trata de un fine-tuning de `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext`, un BERT base (108,9 M de parámetros) preentrenado sobre abstracts de PubMed y texto completo de PMC.

La versión publicada (v2) se ha entrenado conjuntamente sobre los conjuntos de entrenamiento de BC5CDR (Chemical + Disease) y NCBI-disease (Disease), lo que mejora notablemente el rendimiento en el segundo corpus respecto a la v1 (solo BC5CDR): F1 de 0,735 a 0,878 en NCBI-disease, a costa de una pérdida pequeña pero consistente en BC5CDR (0,896 a 0,889). El modelo incluye pesos en safetensors, ONNX fp32 e int8 dinámico, y es compatible con `transformers.js` para inferencia en navegador.

Es relevante para pipelines de extracción de información biomédica (literatura, historiales, farmacovigilancia) donde se necesita un modelo pequeño, rápido en CPU y con licencia Apache-2.0, con intervalos de confianza y variabilidad entre semillas documentados explícitamente por el autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT base (BiomedBERT) |
| Parametros totales | 108.895.493 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (arquitectura BERT base; el autor indica entrada dividida en frases, sin longitud máxima declarada) |
| Tipos de cuantizacion | ONNX fp32 y ONNX int8 (cuantización dinámica); safetensors en fp32 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX (`onnx/model.onnx` fp32 435,8 MB; `onnx/model_quantized.onnx` int8 109,7 MB) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer tipo BERT base con cabeza de clasificación de tokens (`token-classification`), inicializado desde BiomedBERT-base-uncased-abstract-fulltext y ajustado sobre dos corpus biomédicos: BC5CDR (entidades Chemical y Disease) y NCBI-disease (solo Disease). El checkpoint liberado corresponde a la semilla 13 y fue seleccionado por mejor F1 de entidad medio en validación entre ambos corpus (época 5). El autor reporta además 4 semillas adicionales (1, 2, 3, 4) fijadas antes del entrenamiento para medir variabilidad, sin descartar ninguna ejecución.

No se detalla en la información disponible el número exacto de tokens de entrenamiento, la composición completa del dataset ni si hubo etapas de RLHF/DPO (no aplicables en un modelo discriminativo de NER). Sí se documenta una innovación metodológica relevante: la evaluación incluye intervalos de confianza por bootstrap sobre abstracts completos (2000 remuestreos) y comparación pareada v1 vs v2 sobre los mismos abstracts, además de verificación de equivalencia numérica entre PyTorch y ONNX (diferencia máxima de logits 3,43e-05, coincidencia de argmax 1,0000 en 300 frases de BC5CDR). Se probó también una variante que ignoraba etiquetas O en NCBI-disease, descartada por colapso de precisión (F1 0,427).

## Capacidades

- Reconocimiento de entidades nombradas de tipo **Chemical** y **Disease** en texto biomédico en inglés.
- Clasificación a nivel de token con agregación a nivel de entidad (`aggregation_strategy="simple"` en `pipeline`).
- Inferencia en CPU con ONNX Runtime (fp32 e int8) y en navegador vía `transformers.js`.
- Procesamiento por frases: el autor indica entrada dividida en frases y tokenización propia por regex para la evaluación.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo discriminativo de etiquetado.
- No soporta visión ni audio.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- **Extracción de entidades en literatura biomédica**: procesar abstracts de PubMed para poblar bases de datos de relaciones fármaco-enfermedad; el modelo está entrenado sobre el dominio exacto (BC5CDR proviene de PubMed) y su ventana de frases permite trocear abstracts sin degradación.
- **Farmacovigilancia y señalización de reacciones adversas**: detectar menciones de fármacos y enfermedades en informes para alimentar pipelines de correlación; la licencia Apache-2.0 facilita su integración en productos comerciales.
- **Anotación asistida de corpus clínicos**: preetiquetar Chemical y Disease para revisión humana; el F1 de 0,889 en BC5CDR y los intervalos bootstrap publicados permiten estimar la carga de revisión.
- **Normalización previa a ontologías**: usar las menciones extraídas como entrada a un paso de linking contra MeSH, DrugBank o MONDO; el modelo entrega offsets de entidad que simplifican el mapeo.
- **Despliegue en el navegador o en edge**: con el ONNX int8 (109,7 MB, 13,63 ms/frase en CPU) se puede ejecutar en clientes web mediante `transformers.js` sin enviar texto clínico a servidores externos, útil por motivos de privacidad.
- **Procesamiento por lotes a gran escala en CPU**: el throughput de 13,63 ms/frase en int8 con pérdida mínima de F1 (0,886 vs 0,889 en BC5CDR) hace viable anotar corpus extensos sin GPU.
- **Filtro previo en pipelines RAG biomédicos**: identificar entidades en documentos recuperados para enrutar consultas o construir índices por fármaco/enfermedad antes de pasarlas a un LLM.

## Benchmarks y rendimiento

Resultados declarados por el autor (model-index y model card), F1 de entidad con seqeval sobre tokenización propia por regex y entrada dividida en frases; el propio autor advierte que **no son comparables con cifras publicadas de BC5CDR/NCBI-disease**.

| Test set | Tipos evaluados | Precisión | Recall | F1 |
|---|---|---|---|---|
| BC5CDR (500 abstracts) | Chemical, Disease | 0,881 | 0,897 | 0,889 |
| NCBI-disease (100 abstracts) | Disease | 0,859 | 0,898 | 0,878 |

Desglose por tipo en BC5CDR: Chemical P/R/F1 = 0,927 / 0,916 / 0,922; Disease P/R/F1 = 0,828 / 0,875 / 0,850.

Variabilidad entre semillas (5 ejecuciones, incluida la 13):

| Test set | Media ± DE | Rango |
|---|---|---|
| BC5CDR | 0,889 ± 0,002 | 0,887 – 0,891 |
| NCBI-disease | 0,872 ± 0,002 | 0,870 – 0,875 |

Intervalos de confianza al 95 % por bootstrap de abstracts (checkpoint liberado):

| Test set | F1 | IC 95 % |
|---|---|---|
| BC5CDR, todos los tipos | 0,889 | 0,879 – 0,898 |
| BC5CDR, Chemical | 0,922 | 0,909 – 0,934 |
| BC5CDR, Disease | 0,850 | 0,836 – 0,863 |
| NCBI-disease, Disease | 0,878 | 0,851 – 0,904 |

Comparación v1 vs v2 en BC5CDR, pareada sobre los mismos abstracts remuestreados: v2 − v1 = −0,0069 (IC 95 % −0,0121 a −0,0020).

Rendimiento en runtime (ONNX Runtime, CPU):

| Variante | F1 BC5CDR | F1 NCBI-disease | ms/frase | Tamaño |
|---|---|---|---|---|
| fp32 | 0,889 | 0,878 | 24,47 | 435,8 MB |
| int8 dinámico | 0,886 | 0,879 | 13,63 | 109,7 MB |

Comparación con `d4data/biomedical-ner-all` (84 tipos de entidad, no entrenado en estos corpus; mapeo de etiquetas realizado por el autor, lo que afecta al resultado): mapeo estricto, BC5CDR F1 0,479 (P 0,629, R 0,386) y NCBI-disease F1 0,377 (P 0,502, R 0,302).

## Requisitos de hardware

- Modelo de 108,9 M de parámetros: inferencia en CPU es totalmente viable; no requiere GPU.
- VRAM estimada en GPU: en torno a 0,5 GB en fp32 y ~0,2 GB en int8 para pesos, más activaciones; cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en iGPU.
- GPU recomendadas para alto throughput: A100, H100, L4 o T4 para servir por lotes; en la práctica, CPU con ONNX Runtime suele ser suficiente.
- Opciones de despliegue: `transformers` (PyTorch), ONNX Runtime (fp32/int8), `transformers.js` en navegador. No se documenta soporte específico para vLLM, TGI o llama.cpp (no aplicables a un encoder BERT de clasificación de tokens).
- Latencia medida por el autor en CPU con ONNX Runtime: 24,47 ms/frase (fp32) y 13,63 ms/frase (int8). No se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 BC5CDR (declarado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| quorumbio/biomedical-ner-chemical-disease | 108,9 M | no disponible | 0,889 (tokenización propia) | Apache-2.0 | HF, ONNX, transformers.js |
| d4data/biomedical-ner-all | no disponible en la información | no disponible | 0,479 con mapeo estricto (medido por el autor) | no disponible en la información | HF |
| v1 del mismo repo (revisión `v1.0`, solo BC5CDR) | 108,9 M | no disponible | 0,896 (BC5CDR) / 0,735 (NCBI-disease) | Apache-2.0 | misma repo, revisión git |

No se dispone de datos de otros modelos comparables (p. ej. variantes BiomedBERT NER de terceros) en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no se ha entrenado ni evaluado en otros idiomas.
- Solo dos tipos de entidad (Chemical y Disease); no cubre genes, proteínas, especies, dosis ni relaciones.
- Las cifras de benchmark usan tokenización propia por regex y entrada por frases, y el propio autor advierte que no son comparables con números publicados de BC5CDR/NCBI-disease.
- El conjunto de test de NCBI-disease tiene solo 100 abstracts, lo que limita la precisión de las estimaciones (IC 95 % de 0,851 a 0,904 en F1).
- Ligera degradación en BC5CDR respecto a v1 (−0,0069 F1, consistente en el 99,5 % de los remuestreos) por incluir NCBI-disease en el entrenamiento.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos/negativos en la delimitación de entidades; la precisión en Disease en BC5CDR (0,828) es notablemente inferior a la de Chemical (0,927).
- El modelo no genera texto ni razona: no debe usarse para tareas generativas, de resumen o de respuesta a preguntas.
- Licencia Apache-2.0 permite uso comercial; aun así, para uso clínico directo sobre pacientes se requiere validación adicional y cumplimiento normativo (no documentado por el autor).
- No se documenta la longitud máxima de secuencia soportada; conviene trocear por frases como hace el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/quorumbio/biomedical-ner-chemical-disease
- Modelo base: https://huggingface.co/microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext
- Dataset BC5CDR: https://huggingface.co/datasets/bigbio/bc5cdr
- Dataset NCBI-disease: https://huggingface.co/datasets/ncbi/ncbi_disease
- Modelo comparado `d4data/biomedical-ner-all`: https://huggingface.co/d4data/biomedical-ner-all
- Artefactos citados en la model card (en el propio repo): `onnx/model.onnx`, `onnx/model_quantized.onnx`, `seed_results.json`, `bootstrap_ci.json`, `training/bootstrap_ner.py`
