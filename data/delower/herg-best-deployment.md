# Delower/herg-best-deployment

## Resumen
`Delower/herg-best-deployment` es un artefacto de despliegue publicado en Hugging Face por el usuario Delower, orientado a la predicción de cardiotoxicidad (bloqueo del canal hERG) a partir de estructuras químicas en formato SMILES. No se trata de un modelo de lenguaje ni de un transformer generativo: es un ensamblado de modelos tabulares y de redes Keras (árboles y modelos `ltn_*.keras`) que operan sobre un vector de características químicas precalculadas. El repositorio ocupa 0,2 GB y se distribuye con la librería Keras.

La model card indica explícitamente que esta versión es un "deployment refit" entrenado sobre todos los datos etiquetados disponibles, incluidos los conjuntos de benchmark (hERG-70, new-compounds, panel FDA y REGFAIL), absorbidos el 14 de noviembre de 2026. Por tanto, las métricas de benchmark publicadas no son aplicables a esta versión y el autor advierte que no debe evaluarse sobre esos conjuntos. La relevancia práctica es acotada: sirve como pieza de inferencia para cribado temprano de hERG dentro de un pipeline de química computacional, no como modelo generalista.

No se dispone de información sobre licencia, idiomas, pipeline ni métricas de rendimiento independientes en los metadatos de Hugging Face. La documentación disponible es la model card del autor y los ficheros de procedencia incluidos en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblado de modelos de árbol y redes Keras (`ltn_*.keras`) sobre características químicas precalculadas (Morgan ECFP4, descriptores RDKit 2D, QED, embeddings ChemBERTa-77M) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: un vector de características por molécula) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.pkl` (árboles) y `.keras` (redes), más `ltn_*_preps.json` de preprocesado por fold; scripts `feature_extraction.py` y `predict_herg.py` |

## Arquitectura y entrenamiento
El sistema combina dos cabezas de predicción: una de clasificación (bloqueo/no bloqueo de hERG) y otra de regresión (probablemente un valor continuo de actividad o probabilidad). Según la model card, los ganadores por validación interna con partición por scaffolds son sendos ensamblados, con MCC de validación 0,5729 para clasificación y RMSE de validación 0,6449 para regresión. El stack de características incluye bits y conteos Morgan ECFP4, descriptores 2D de RDKit más QED y características fisicoquímicas dirigidas a hERG, y embeddings preentrenados de ChemBERTa-77M (mean-pooled, solo inferencia). Los descriptores CDK vía PaDEL se intentaron pero se sustituyeron por el bloque de descriptores RDKit 2D tras un bloqueo de PaDEL, según `FEATURE_NOTES.md`.

El punto crítico es el régimen de entrenamiento: esta versión concreta se reentrenó sobre todos los datos etiquetados, incluidos los conjuntos de benchmark, que quedaron absorbidos. El autor conserva en `benchmark_summary.json` el benchmark "honesto" de las recetas ganadoras entrenadas solo con pools descontaminados y con conjuntos externos bloqueados y solapamiento reverificado a cero. No se documentan detalles sobre volumen de tokens, composición exacta del dataset ni uso de RLHF/DPO, que no aplican a este tipo de modelo.

## Capacidades
- Predicción de bloqueo del canal hERG a partir de SMILES, con salida de clasificación y de regresión.
- Extracción de características end-to-end mediante `feature_extraction.py` y `predict_herg.py`.
- Uso de embeddings preentrenados de ChemBERTa-77M en modo inferencia.
- Ensamblado con pesos definidos en `config.json`.
- Preprocesado por fold reproducible mediante `ltn_*_preps.json`.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües.
- No es un modelo generativo: no produce texto, código ni respuestas conversacionales.

## Casos de uso
- Cribado virtual temprano de cardiotoxicidad: dado un lote de SMILES, `predict_herg.py` devuelve la predicción de bloqueo hERG para priorizar compuestos antes de ensayos in vitro.
- Filtrado en pipelines de química computacional: integración como etapa de scoring en flujos de RDKit para descartar candidatos con riesgo hERG elevado.
- Enriquecimiento de datasets internos: uso de la cabeza de regresión para asignar una puntuación continua de riesgo y ordenar bibliotecas de compuestos.
- Análisis de series químicas: comparación de predicciones entre análogos para guiar modificaciones estructurales que reduzcan el riesgo hERG.
- Reproducción de experimentos: los ficheros de procedencia (`benchmark_summary.json`, `selection.json`, `FEATURE_NOTES.md`) permiten auditar las recetas y el proceso de selección.
- Docencia y prototipado: ejemplo de ensamblado de árboles y redes Keras con características químicas para tareas de predicción de propiedades moleculares.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks independientes en la información disponible. La model card solo aporta métricas de validación interna con partición por scaffolds para las recetas ganadoras: MCC 0,5729 en clasificación y RMSE 0,6449 en regresión. El autor advierte que estas métricas corresponden a las recetas entrenadas con pools descontaminados y que no aplican a esta versión de despliegue, que absorbió los conjuntos de benchmark.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,2 GB y el modelo es ligero, por lo que cabe holgadamente en GPU consumer.
- GPU recomendadas: no disponible; cualquier GPU con soporte para TensorFlow/Keras y suficiente memoria para ChemBERTa-77M es suficiente.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos unos pocos GB de VRAM, aunque no se documenta el requisito exacto.
- Opciones de despliegue: scripts Python propios (`feature_extraction.py`, `predict_herg.py`) con TensorFlow/Keras, RDKit y el tokenizador de ChemBERTa; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares
No disponible. No se han identificado en la información proporcionada modelos comparables de predicción hERG con características, licencia y métricas verificables.

## Limitaciones y advertencias
- La versión de despliegue ha absorbido los conjuntos de benchmark; las métricas publicadas no son válidas para ella y el autor prohíbe evaluarla sobre esos conjuntos.
- Riesgo de sobreajuste a los datos absorbidos y de fuga de información en cualquier evaluación posterior.
- No se especifica licencia, lo que impide confirmar el uso comercial.
- No se documentan sesgos, cobertura química ni dominio de aplicabilidad.
- Dependencia de la reproducibilidad del stack de características (RDKit, ChemBERTa-77M, versiones de librerías) y del preprocesado por fold.
- No es un modelo de lenguaje: no debe usarse para generación de texto, código ni tareas conversacionales.
- La sustitución de descriptores PaDEL por RDKit 2D puede afectar a la comparabilidad con otros estudios.

## Enlaces
- Hugging Face: https://huggingface.co/Delower/herg-best-deployment
- No se han encontrado otros enlaces relevantes (papers, blogs, repos, demos) en la información proporcionada.
