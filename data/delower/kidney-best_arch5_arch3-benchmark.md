# Delower/kidney-best_arch5_arch3-benchmark

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un clasificador binario de toxicidad renal para compuestos químicos, publicado por el usuario Delower bajo el identificador `Delower/kidney-best_arch5_arch3-benchmark`. Se trata de un artefacto de aprendizaje automático clásico empaquetado en formato joblib (no safetensors ni GGUF) que combina dos ramas de modelos: una basada en NearestCentroid sobre descriptores moleculares y otra formada por un ensamble de tres modelos (LightGBM y ExtraTrees) que operan sobre huellas de Morgan, descriptores RDKit y embeddings de ChemBERTa.

El modelo aborda un problema concreto de toxicología computacional: predecir si un compuesto presenta riesgo de toxicidad renal, con el objetivo de priorizar candidatos en fases tempranas del descubrimiento de fármacos. La versión publicada es la de "benchmark", entrenada sobre el split de entrenamiento de un conjunto bloqueado de 1.118 compuestos, manteniendo completamente fuera los conjuntos regulatorios (retirados, fallos clínicos y aprobados). Existe una versión de despliegue separada que reajusta sobre el pool completo.

Su relevancia es limitada fuera del ámbito especializado: no es un modelo generativo, no procesa lenguaje natural ni imágenes, y su utilidad se circunscribe a la predicción de toxicidad renal sobre estructuras químicas en formato SMILES. La información pública es escasa (sin licencia declarada, sin idiomas, 0 descargas) y el repositorio ocupa 0,0 GB según Hugging Face, lo que sugiere pesos de pequeño tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamble híbrido: NearestCentroid (arch3) + ensemble ponderado LightGBM/ExtraTrees sobre Morgan, MACCS, descriptores RDKit y embeddings ChemBERTa (arch5) |
| Parametros totales | no disponible (modelos de ML clásico, no redes neuronales de gran escala; el componente ChemBERTa se usa como extractor de embeddings congelado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: molécula en SMILES o CSV de moléculas) |
| Tipos de cuantizacion | no disponible (formato joblib; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | joblib (`arch3_model.joblib`, `arch5_model.joblib`) |

## Arquitectura y entrenamiento

El sistema es un ensamble de dos brazos combinados con pesos fijos: `combined_prob = 0.45 * arch3_prob + 0.55 * arch5_prob`, con umbral de decisión en 0,5 y reporte adicional de `flagged_by_both`. Los pesos provienen de un brazo de combinación interno (arch4) seleccionado sobre un fold de validación interna (MCC de ensamble 0,4793; AUROC 0,8622) y nunca se reajustaron.

El brazo arch3 es un NearestCentroid (ganador de un barrido LazyPredict) sobre 1.404 dimensiones: 1.024 bits de Morgan, 167 bits MACCS y descriptores RDKit preparados con DescPrep. El brazo arch5 es un ensamble de tres componentes con pesos internos: LightGBM sobre bits de Morgan (0,1743), ExtraTrees con 600 árboles sobre descriptores + MACCS + conteos de Morgan (0,4242) y LightGBM sobre embeddings de ChemBERTa más fisicoquímicos preparados (0,4016). Los embeddings se recalculan en inferencia con `seyonec/ChemBERTa-zinc-base-v1`.

El entrenamiento se realizó sobre el split de entrenamiento de un pool bloqueado de 1.118 compuestos (ajustes finales sobre train+val, 1.006 compuestos), con los conjuntos regulatorios completamente retenidos. No se documenta uso de RLHF, DPO ni técnicas de alineación, al no tratarse de un modelo generativo. La verificación de integridad (`GATE_RESULTS.json`, generada por `validate_benchmark.py`) confirma que los pesos empaquetados reproducen las métricas registradas, con desviaciones de probabilidad de hasta 0,0099 atribuidas a versiones de librerías en el recálculo de embeddings.

## Capacidades

- Clasificación binaria de toxicidad renal a partir de estructuras químicas en formato SMILES.
- Procesamiento por lotes mediante CSV (`--csv file.csv`) y por argumentos individuales en línea de comandos.
- Extracción de características moleculares: huellas de Morgan (1.024 bits), claves MACCS (167), descriptores RDKit y embeddings de ChemBERTa.
- Reporte de probabilidad combinada y de la señal `flagged_by_both` para inspección de consenso entre brazos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües, de visión ni de audio.
- No dispone de modo "thinking" ni de decodificación especulativa (no es un modelo autorregresivo).

## Casos de uso

- Filtrado temprano en descubrimiento de fármacos: el clasificador permite descartar compuestos con señal de toxicidad renal antes de ensayos in vitro, reduciendo costes en las fases iniciales del pipeline.
- Priorización de librerías químicas: dado un CSV de candidatos, el script `predict_kidney.py --csv` devuelve probabilidades que permiten ordenar compuestos por riesgo y asignar recursos de validación experimental.
- Triaje regulatorio interno: la combinación muestra alta sensibilidad en el conjunto de compuestos retirados (12/12) y fallos clínicos (5/5), lo que la hace útil como criba conservadora antes de revisiones más costosas.
- Análisis de consenso entre metodologías: la señal `flagged_by_both` permite identificar compuestos donde tanto el modelo lineal (NearestCentroid) como el ensamble de árboles coinciden, aumentando la confianza en la predicción.
- Investigación en toxicología computacional: como referencia reproducible (con `GATE_RESULTS.json` y `validate_benchmark.py`) para comparar nuevas arquitecturas de predicción de toxicidad renal sobre el mismo pool bloqueado.
- Integración en pipelines de quimioinformática: al requerir solo rdkit, scikit-learn, lightgbm, joblib, torch y transformers, puede ejecutarse en entornos Python estándar sin GPU dedicada para los modelos de árboles (ChemBERTa puede requerir CPU/GPU según el volumen).

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son los del gate de verificación:

| Metrica | Valor |
|---|---|
| AUROC regulatorio combinado (pooled) | 0,735 |
| Retirados (withdrawn) a umbral 0,5 | 12/12 |
| Fallos clínicos a umbral 0,5 | 5/5 |
| Aprobados (pass) a umbral 0,5 | 29/146 verdaderos negativos |
| MCC arch3 en fold de test interno (n=112) | 0,2680 |
| MCC arch5 en fold de test interno (n=112) | 0,4610 |
| MCC del ensamble en validación interna | 0,4793 |
| AUROC del ensamble en validación interna | 0,8622 |

No se han publicado resultados comparativos con otros modelos de toxicidad renal en la información disponible.

## Requisitos de hardware

- VRAM: no se documenta; los modelos de árboles y NearestCentroid se ejecutan en CPU. ChemBERTa (extractor de embeddings) puede ejecutarse en CPU para lotes pequeños y en GPU para volúmenes altos.
- GPU recomendadas: no disponible; no se especifican requisitos de GPU. Cualquier GPU con suficiente memoria para ChemBERTa (por ejemplo, RTX 3060 o superior) aceleraría la extracción de embeddings.
- Cabe en GPU de consumo: sí, para el componente ChemBERTa; el resto del pipeline es CPU-only.
- Opciones de despliegue: script Python (`predict_kidney.py`) con dependencias rdkit, scikit-learn, lightgbm, joblib, torch y transformers. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de toxicidad renal en la documentación proporcionada. El autor menciona una versión de despliegue (`Delower/kidney-best_arch5_arch3-deployment`) que reajusta sobre el pool completo, pero no se ofrecen métricas comparativas ni se detallan alternativas de terceros.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kidney-best_arch5_arch3-benchmark | no disponible (ML clásico) | no aplica | AUROC 0,735 regulatorio | no disponible | Hugging Face |
| kidney-best_arch5_arch3-deployment | no disponible | no aplica | no disponible (métricas de benchmark no aplican) | no disponible | Hugging Face |
| Alternativas de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; el entrenamiento se limita a un pool de 1.118 compuestos, lo que puede introducir sesgos de cobertura química hacia el espacio representado en ese conjunto.
- Riesgo de falsos positivos: la combinación es deliberadamente sensible en el conjunto de aprobados (solo 29/146 verdaderos negativos a umbral 0,5), por lo que marcará como tóxicos muchos compuestos que no lo son; no debe usarse como único criterio de descarte.
- Las métricas de benchmark no aplican a la versión de despliegue, que absorbe compuestos regulatorios en el entrenamiento; mezclar ambas versiones invalidaría la evaluación.
- Licencia no declarada: la ausencia de licencia impide asumir permisos de uso comercial; es necesario contactar con el autor antes de cualquier uso en producción.
- Dependencia de versiones de librerías: las probabilidades de arch5 pueden variar hasta 0,0099 por cambios en las versiones de librerías al recalcular embeddings de ChemBERTa.
- Sin datos de benchmarks comparativos con alternativas, no es posible contextualizar su rendimiento frente a otros clasificadores de toxicidad renal.
- No apto para uso clínico ni regulatorio directo sin validación externa adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Delower/kidney-best_arch5_arch3-benchmark
- Versión de despliegue: https://huggingface.co/Delower/kidney-best_arch5_arch3-deployment (referenciada en la model card)
- Modelo de embeddings utilizado: https://huggingface.co/seyonec/ChemBERTa-zinc-base-v1
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
