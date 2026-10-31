# CHM4930/mufu

## Resumen

MuFu (v1.0.0) es un modelo de prediccion de propiedades moleculares desarrollado por el usuario CHM4930 en el marco del proyecto educativo CHM4930. No es un modelo de lenguaje, sino un sistema de quimica computacional que, a partir de una cadena SMILES, predice la afinidad de una molecula frente a dos dianas terapeuticas (EGFR y BACE1, expresada como pIC50 con un intervalo conformal) y su perfil toxicologico (12 ensayos de Tox21 y las 2 tareas de ClinTox).

Su relevancia radica en la arquitectura de fusion multimodal: combina el embedding de SMILES de un MoLFormer congelado (ibm-research/MoLFormer-XL-both-10pct), una huella ECFP4 clasica y un codificador de grafos GINE, integrando tres representaciones complementarias de la misma molecula. Ademas, implementa un ensemble de 5 semillas con cuantificacion de incertidumbre mediante MC-Dropout y varianza entre miembros, algo poco habitual en modelos de este tamano y muy util para priorizacion de compuestos en flujos de descubrimiento de farmacos. El repo ocupa 0,1 GB, esta implementado en PyTorch y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de 5 miembros que fusiona embedding SMILES de MoLFormer (congelado), huella ECFP4 y codificador de grafos GINE |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (entrada: una cadena SMILES) |
| Tipos de cuantizacion | no disponible (pesos en precision original, sin cuantizar) |
| Idiomas soportados | no aplicable (modelo de quimica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoints PyTorch (repo de 0,1 GB) con ficheros de calibracion JSON asociados (`_mc_dropout.json`, `mufu_ensemble.json`) |

## Arquitectura y entrenamiento

MuFu fusiona tres codificadores sobre una misma molecula de entrada. El primero es el embedding de SMILES de MoLFormer-XL (variante entrenada con el 10 % de los datos, publicada por IBM Research), que se mantiene congelado y actua como extractor de caracteristicas preentrenado. El segundo es una huella circular ECFP4, una representacion de tipo fingerprint muy usada en quimica medicinal. El tercero es un codificador GINE (Graph Isomorphism Network con aristas), que procesa la estructura molecular como un grafo atomos-enlaces. Las tres representaciones se combinan en una cabeza de prediccion que genera dos salidas de regresion (pIC50 de EGFR y BACE1) y salidas de clasificacion (P(active), 12 ensayos de Tox21 y 2 tareas de ClinTox).

El modelo publicado es un ensemble de 5 miembros entrenados con semillas distintas desde el commit `627f004` del repositorio CHM4930. La prediccion de pIC50 es la media de los miembros; las probabilidades de clasificacion se promedian tras aplicar la calibracion propia de cada miembro. La incertidumbre del intervalo conformal se calcula como `μ ± q · max(σ, floor)`, donde σ² suma la varianza media de MC-Dropout y la varianza entre miembros del ensemble, y el cuantil q se ajusta sobre el conjunto de validacion. Los datos de entrenamiento concretos (numero de compuestos, composicion) no se detallan en la model card; solo se publica el hash sha256 del dataset (`b340ddf7...`). No hay informacion sobre uso de RLHF ni tecnicas de alineacion, lo cual es esperable al no ser un modelo generativo.

## Capacidades

- Regresion de pIC50 frente a EGFR y BACE1 a partir de una cadena SMILES, con intervalo conformal de incertidumbre
- Clasificacion de actividad binaria P(active) por molecula
- Prediccion de toxicidad en los 12 ensayos del benchmark Tox21
- Prediccion de las 2 tareas de ClinTox (toxicidad clinica y FDA)
- Cuantificacion de incertidumbre mediante MC-Dropout combinada con varianza entre miembros del ensemble
- Probabilidades calibradas individualmente por miembro antes del promediado
- Servible como API mediante variables de entorno (`MUFU_HF_REPO`, `MUFU_MODEL_VERSION`)
- No genera texto, no soporta tool calling, agentes ni capacidades multilingues: es un modelo de regresion/clasificacion sobre moleculas

## Casos de uso

- **Screening virtual de compuestos frente a EGFR:** dado un lote de SMILES de una libreria quimica, el modelo asigna un pIC50 estimado con intervalo conformal a cada compuesto, permitiendo priorizar sintesis y ensayos experimentales de los candidatos con mejor afinidad y menor incertidumbre.
- **Priorizacion en programas frente a BACE1 (enfermedad de Alzheimer):** la regresion de pIC50 sobre BACE1 permite filtrar librerias de inicio (hit expansion) antes de invertir en ensayos bioquimicos.
- **Filtrado temprano de toxicidad:** las 12 salidas de Tox21 y las 2 de ClinTox permiten descartar compuestos con senales de hepatotoxicidad, genotoxicidad o toxicidad clinica antes de fases avanzadas, reduciendo coste de desarrollo.
- **Triaje con control de riesgo:** el intervalo conformal permite definir politicas de decision del tipo "solo sintetizar si el limite superior del intervalo supera un umbral", util en flujos de triaje automatico.
- **Deteccion de compuestos fuera de distribucion:** una varianza entre miembros elevada o un intervalo ancho senala moleculas poco representadas en el entrenamiento, indicando cuándo el modelo no debe usarse para decidir.
- **Docencia e investigacion reproducible:** al formar parte del proyecto CHM4930, con dataset versionado por hash y checkpoints por tag, sirve como caso de estudio reproducible de ensembles con incertidumbre en quimica computacional.
- **Integracion en pipelines de descubrimiento de farmacos:** puede acoplarse como paso de scoring dentro de flujos de generacion molecular o optimizacion bayesiana, usando la incertidumbre como funcion de adquisicion.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre sus propios test splits (no verificados por terceros). La columna RF corresponde a un random forest sobre ECFP4 como baseline.

| Tarea | Metrica | Ensemble | Modelo individual (media ± std) | Baseline RF |
|---|---|---|---|---|
| BACE1 pIC50 | RMSE | 0,795 | 0,827 ± 0,013 | 0,813 |
| BACE1 pIC50 | R² | 0,610 | 0,578 ± 0,013 | 0,592 |
| EGFR pIC50 | RMSE | 0,870 | 0,905 ± 0,015 | 0,877 |
| EGFR pIC50 | R² | 0,510 | 0,470 ± 0,018 | 0,502 |
| Tox21 (macro) | ROC AUC | 0,751 | 0,735 ± 0,011 | 0,712 |
| ClinTox (macro) | ROC AUC | 0,861 | 0,822 ± 0,043 | 0,652 |

El ensemble mejora consistentemente al modelo individual y al baseline RF, con la ganancia mas notable en ClinTox (0,861 frente a 0,652 del RF). No hay comparacion publicada con otros modelos neuronales del estado del arte (ChemBERTa, GraphMVP, etc.).

## Requisitos de hardware

- El repo completo ocupa 0,1 GB; el MoLFormer-XL congelado se descarga automaticamente desde HuggingFace en el primer uso, por lo que los requisitos reales son los de MoLFormer-XL mas el resto de codificadores.
- No se publica una cifra de VRAM oficial; dado que MoLFormer-XL es un transformer de tamano moderado y los pesos del ensemble son ligeros, es razonable esperar inferencia en una GPU de consumo (clase RTX 3060/4090) o incluso en CPU, aunque esto ultimo no esta confirmado por el autor.
- No se publican cifras de latencia ni throughput.
- Despliegue: PyTorch con el codigo del repositorio [CHM4930](https://github.com/IanRPage/CHM4930) (`ai/src` en el path), descarga de pesos via `snapshot_download` de `huggingface_hub`, y modo servidor mediante las variables de entorno `MUFU_HF_REPO` y `MUFU_MODEL_VERSION`. No aplica vLLM, llama.cpp, Ollama ni TGI (no es un modelo generativo).

## Comparativa con modelos similares

| Modelo | Tipo | Tareas | Incertidumbre | Licencia |
|---|---|---|---|---|
| CHM4930/mufu | Ensemble MoLFormer + ECFP4 + GINE | pIC50 EGFR/BACE1, Tox21, ClinTox | Conformal + MC-Dropout + varianza entre miembros | Apache 2.0 |
| ibm-research/MoLFormer-XL-both-10pct | Transformer preentrenado sobre SMILES (modelo base) | Embeddings genericos; requiere fine-tuning por tarea | No incorporada | Licencia propia de IBM Research (no disponible en la ficha) |
| Random forest sobre ECFP4 (baseline del autor) | Modelo clasico de fingerprint | Mismas tareas en el estudio | No incorporada | no disponible |

MuFu se diferencia de su modelo base en que añade fusion multimodal, cabezas multitarea y cuantificacion de incertidumbre lista para usar. Frente a un baseline clasico de fingerprints, ofrece mejoras de entre 0,04 y 0,21 ROC AUC segun la tarea. No hay disponibles comparaciones directas publicadas con otros ensembles neuronales de dominio quimico.

## Limitaciones y advertencias

- Los benchmarks provienen de test splits definidos por el propio autor y no estan verificados por terceros; la comparabilidad con la literatura es limitada.
- Las metricas de regresion (R² de 0,61 en BACE1 y 0,51 en EGFR) indican una capacidad explicativa moderada: las predicciones de pIC50 son orientativas y no sustituyen la validacion experimental.
- El rendimiento en Tox21 (ROC AUC macro 0,751) es modesto; en tareas de toxicidad con clases muy desbalanceadas, el AUC macro puede ocultar mal rendimiento en ensayos individuales.
- El intervalo conformal esta calibrado sobre el conjunto de validacion del autor; su cobertura en distribuciones distintas no esta garantizada.
- Los ficheros del repo solo funcionan como conjunto: cada `_mc_dropout.json` corresponde a su checkpoint y `mufu_ensemble.json` a esos checkpoints exactos; mezclar ficheros entre tags invalida las predicciones.
- El modelo base MoLFormer esta congelado y solo entrenado con el 10 % de los datos originales, lo que puede limitar la calidad de los embeddings frente a variantes completas.
- No se documenta la composicion del dataset de entrenamiento (solo su hash), lo que dificulta evaluar sesgos quimicos (por ejemplo, sobrerepresentacion de ciertos andamiajos moleculares).
- Al tratarse de un modelo con 0 descargas y un solo like, no existe comunidad ni auditoria externa; no se recomienda para decisiones criticas sin validacion local.
- La licencia Apache 2.0 del modelo no cubre necesariamente la licencia del modelo base MoLFormer, que debe revisarse por separado para uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CHM4930/mufu
- Modelo base: https://huggingface.co/ibm-research/MoLFormer-XL-both-10pct
- Repositorio de codigo (CHM4930): https://github.com/IanRPage/CHM4930
- Paper, demo y documentacion adicional: no disponibles
