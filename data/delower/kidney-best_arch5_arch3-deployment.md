# Delower/kidney-best_arch5_arch3-deployment

## Resumen

El modelo `Delower/kidney-best_arch5_arch3-deployment` es un clasificador binario de toxicidad renal (nefrotoxicidad) desarrollado por el usuario Delower dentro de un programa interno de QSAR. Predice la probabilidad de que un compuesto quimico, representado por su SMILES, pertenezca a la clase toxica para el rinon. No es un modelo de lenguaje: es un ensemble de modelos de machine learning clasico (scikit-learn y LightGBM) empaquetado con `joblib` para su despliegue.

El repositorio fusiona dos brazos ganadores del programa: Arch5 (ensemble por bloques de caracteristicas con LightGBM y ExtraTrees sobre fingerprints de Morgan, descriptores RDKit, MACCS y embeddings de ChemBERTa-77M) y Arch3 (un `BaggingClassifier` seleccionado por un barrido de LazyPredict sobre el bloque fp_desc de 1.402 columnas). La fusion sigue una regla propia del programa: media ponderada por validacion de las probabilidades de ambos brazos con peso 0,45 para Arch3 y 0,55 para Arch5, con umbral de decision en 0,5.

Es relevante como ejemplo de pipeline QSAR de despliegue con procedencia documentada (manifiestos de entrenamiento, verificaciones de compuertas y configuraciones) y por su proposito practico: cribado temprano de nefrotoxicidad en proyectos de descubrimiento de farmacos, como la etapa de toxicidad del proyecto EGFR mencionado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble fusionado de dos brazos: Arch5 (ensemble por bloques con LightGBM y ExtraTrees) y Arch3 (BaggingClassifier) |
| Parametros totales | no disponible (modelos de ML clasico, no redes neuronales; numero de parametros no aplicable) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada = molecula en SMILES) |
| Tipos de cuantizacion | no disponible (no aplica; pesos en joblib) |
| Idiomas soportados | no disponible (no aplica; no procesa texto natural) |
| Licencia | MIT |
| Formato de pesos | joblib (`arch5_model.joblib`, `arch3_model.joblib`) |

## Arquitectura y entrenamiento

El modelo combina dos clasificadores. Arch5 es un ensemble por bloques de caracteristicas con pesos proporcionales al MCC de validacion: LightGBM sobre bits de fingerprint de Morgan (peso 0,1473), ExtraTrees sobre descriptores RDKit preparados mas MACCS y conteos de Morgan (0,3739) y LightGBM sobre embeddings de ChemBERTa-77M mas descriptores fisicoquimicos (0,4788). Arch3 es un `BaggingClassifier` sobre el bloque fp_desc (bits de Morgan, MACCS y descriptores RDKit preparados, 1.402 columnas), seleccionado por un barrido de LazyPredict. La fusion final aplica `P_combined = 0,45 * P_Arch3 + 0,55 * P_Arch5`, con el peso elegido en el pliegue de validacion maximizando MCC en umbral 0,5 (MCC de validacion del ensemble 0,479).

Ambos componentes son reentrenamientos de despliegue sobre todos los datos etiquetados del programa: 1.805 compuestos unicos (915 positivos / 890 negativos), deduplicados por conectividad InChIKey con las etiquetas de referencia resolviendo conflictos. Los compuestos de referencia regulatoria se absorbieron solo en entrenamiento, nunca en validacion ni test, y una compuerta dura en los scripts de entrenamiento verifico su presencia en la matriz de entrenamiento (retirados 16/16, fallos clinicos 7/7, PASS 146/146 en la referencia corregida). El componente Arch5 descarga el codificador ChemBERTa-77M (`seyonec/ChemBERTa-zinc-base-v1`) desde el hub en el primer uso; el codificador es solo preentrenado, nunca ajustado.

## Capacidades

- Clasificacion binaria de nefrotoxicidad de compuestos quimicos a partir de su SMILES.
- Prediccion por componente: devuelve la probabilidad y la bandera a umbral 0,5 de Arch5 y de Arch3 por separado.
- Prediccion fusionada: probabilidad combinada segun la regla de pesos 0,45/0,55 y bandera combinada a 0,5.
- Lectura `flagged_by_both`: decision de maximo interes de la pareja (ambos modelos marcan el compuesto).
- Procesamiento por lotes mediante `predict_many`.
- Featurizacion quimica integrada: fingerprints de Morgan, MACCS, descriptores RDKit y embeddings de ChemBERTa-77M.
- Validacion reproducible incluida (`validate.py` y `examples.json`) sobre 8 leads DPP-4 cribados, con tolerancia 1e-6.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.

## Casos de uso

- Cribado temprano de nefrotoxicidad en descubrimiento de farmacos: se pasa el SMILES de cada candidato a `predict` y se usa `combined_prob` para priorizar o descartar compuestos antes de ensayos in vitro, aprovechando el perfil de alta sensibilidad del programa.
- Etapa de toxicidad del proyecto EGFR: la model card indica explicitamente que este es el modelo renal que debe usarse en la etapa de toxicidad de dicho proyecto, integrado como filtro en el pipeline de seleccion de leads.
- Filtrado de librerias quimicas: con `predict_many` se procesan lotes de SMILES y se aplica la bandera combinada como criterio de exclusion o de revision manual segun la politica de riesgo del equipo.
- Triaje con doble lectura: `flagged_by_both` permite separar compuestos marcados por ambos brazos (mayor preocupacion) de los marcados por uno solo, adecuado para flujos con revision experta escalonada.
- Analisis de sensibilidad entre brazos: comparar `arch5_prob` y `arch3_prob` en compuestos concretos ayuda a detectar casos donde la fusion oculta desacuerdo entre modelos y a decidir si se requiere inspeccion manual.
- Reproducibilidad y auditoria regulatoria interna: los manifiestos de entrenamiento, configuraciones y verificaciones de compuerta permiten reconstruir el origen de cada prediccion y documentar el proceso ante revisiones internas.
- Investigacion QSAR metodologica: sirve como referencia de pipeline de despliegue con fusion ponderada por validacion, util para comparar estrategias de ensemble en toxicologia computacional.

## Benchmarks y rendimiento

Las metricas publicadas corresponden exclusivamente a los modelos de la ola bloqueada (referencia excluida del entrenamiento) y se incluyen como procedencia; no aplican a esta version de despliegue, que absorbio la referencia en entrenamiento.

| Lectura | Valor |
|---|---|
| Fusion Arch4 (Arch3 + Arch5), AUROC agrupado | 0,735 (mejor lectura renal) |
| Farmacos retirados detectados por la fusion | 12/12 |
| Fallos clinicos detectados por la fusion | 5/5 |
| Arch5 solo, AUROC agrupado | 0,701 (retirados 12/12, clinicos 5/5) |
| Arch3 solo, AUROC agrupado | 0,568 (retirados 12/12, clinicos 5/5; mejor exactitud balanceada agrupada 0,620) |

Base: referencia regulatoria v1 agrupada, 163 compuestos puntuados (12 retirados + 5 fallos clinicos + 146 PASS).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; los componentes son modelos de ML clasico y el unico componente neuronal es el codificador ChemBERTa-77M, de tamano reducido.
- GPU recomendadas: no disponible; la inferencia puede ejecutarse en CPU, aunque el codificador ChemBERTa-77M se acelera con GPU consumer (por ejemplo, RTX 3060 o superior) si el volumen de compuestos es alto.
- Cabe en GPU consumer: si, para el codificador; el resto del pipeline es CPU.
- Opciones de despliegue: ejecucion directa con Python mediante `predict.py`, con dependencias `scikit-learn`, `lightgbm`, `rdkit`, `joblib`, `numpy`, `torch` y `transformers`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Delower/kidney-best_arch5_arch3-deployment` | no aplica (ML clasico) | no aplica | AUROC 0,735 (version de referencia) | MIT | Hugging Face |
| `Delower/kidney-arch5-ensemble-deployment` | no aplica | no aplica | AUROC 0,701 (version de referencia) | no disponible | Hugging Face |
| `Delower/kidney-arch3-bagging-deployment` | no aplica | no aplica | AUROC 0,568 (version de referencia) | no disponible | Hugging Face |

No se dispone de informacion sobre otros modelos comparables de nefrotoxicidad fuera del propio programa.

## Limitaciones y advertencias

- Las probabilidades son puntuaciones de cribado, no riesgos clinicos calibrados.
- Perfil conocido de alta sensibilidad y baja especificidad: cada brazo renal sacrifica especificidad para maximizar la deteccion de farmacos retirados, por lo que una bandera de un solo modelo tiene bajo valor de confirmacion.
- Las metricas de referencia no aplican a esta version de despliegue, ya que los reentrenamientos absorbieron los compuestos de referencia en entrenamiento.
- El desbloqueo de los pesos requiere que `deployment_common.py` sea importable; el componente Arch5 descarga ChemBERTa-77M desde el hub en el primer uso, lo que introduce una dependencia de red.
- Sesgos conocidos: no documentados en la informacion disponible; el conjunto de entrenamiento (1.805 compuestos) condiciona la cobertura quimica.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de falsos positivos y negativos por la baja especificidad.
- Restricciones de licencia: licencia MIT, que permite uso comercial con atribucion; no se documentan restricciones adicionales.
- Caveats para produccion: el repositorio tiene 0 descargas y 0 likes, sin pipeline declarado, y la fecha de creacion indicada (2026-11-24) es posterior a la fecha actual de referencia, lo que conviene verificar antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Delower/kidney-best_arch5_arch3-deployment
- Componente Arch5: https://huggingface.co/Delower/kidney-arch5-ensemble-deployment
- Componente Arch3: https://huggingface.co/Delower/kidney-arch3-bagging-deployment
- Codificador ChemBERTa-77M: https://huggingface.co/seyonec/ChemBERTa-zinc-base-v1
