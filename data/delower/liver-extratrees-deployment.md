# Delower/liver-extratrees-deployment

## Resumen

El modelo `Delower/liver-extratrees-deployment` es un clasificador binario de toxicidad hepática inducida por fármacos (DILI, *Drug-Induced Liver Injury*) implementado como un `ExtraTreesClassifier` de scikit-learn. Lo publica el autor Delower dentro de un programa interno de predicción de toxicidad hepática y se distribuye como un *deployment refit*: la versión reentrenada del modelo ganador de la arquitectura Arch3 (seleccionado por LazyPredict) sobre el conjunto completo de datos etiquetados del programa, incluidos los compuestos del *benchmark* regulatorio.

El problema que aborda es la detección temprana de riesgo hepatotóxico en candidatos farmacológicos, un filtro crítico en el descubrimiento de fármacos porque la hepatotoxicidad es una de las principales causas de retirada de medicamentos y de fallos en fases clínicas. El modelo opera sobre descriptores químicos derivados del SMILES (huellas de Morgan, claves MACCS y descriptores de RDKit) y devuelve una probabilidad de pertenencia a la clase tóxica.

No es un modelo de lenguaje ni una red neuronal: es un ensamblado de árboles de decisión empaquetado con joblib. Se despliega en pareja con un modelo GAT (`Delower/liver-gat-deployment`), de modo que un compuesto marcado por ambos se considera la lectura de mayor preocupación. Es relevante por su enfoque de validación riguroso (verificación compuesto a compuesto de la inclusión del *benchmark* regulatorio) y por su carácter determinista y auditable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblado de árboles extra aleatorizados (`ExtraTreesClassifier` de scikit-learn) |
| Parametros totales | no disponible (número de árboles no especificado; valores por defecto de scikit-learn) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, entrada de 1.404 columnas de features) |
| Tipos de cuantizacion | no aplica (no es un modelo neuronal; no hay cuantización) |
| Idiomas soportados | no disponible (entrada: SMILES y descriptores químicos) |
| Licencia | MIT |
| Formato de pesos | `model.joblib` (bundle joblib con el clasificador y el objeto `DescPrep`) |
| Numero de features | 1.404 columnas (1.024 bits Morgan + 167 claves MACCS + descriptores RDKit) |
| Umbral de clasificacion | probabilidad >= 0,5 |
| Semilla | `random_state=42` |
| Conjunto de entrenamiento | 1.891 compuestos únicos (1.003 positivos / 888 negativos) |

## Arquitectura y entrenamiento

El modelo es un `ExtraTreesClassifier` con los valores por defecto de scikit-learn y `random_state=42`, sin reajuste de hiperparámetros respecto a la receta original del programa. La entrada es un vector de 1.404 características construido por el módulo `DescPrep`: 1.024 bits de huella de Morgan, 167 claves MACCS y descriptores de RDKit. El objeto de preprocesado se ajustó sobre el conjunto completo de despliegue y se distribuye dentro del bundle de pesos.

El conjunto de entrenamiento de despliegue está formado por todos los datos hepáticos etiquetados del programa, deduplicados por conectividad InChIKey del compuesto padre estandarizado: 1.891 compuestos únicos (1.003 positivos, 888 negativos), compuestos por `train_locked.csv` (1.769 filas), adiciones de `train_enriched.csv`, `internal_test.csv` y todos los compuestos del *benchmark* regulatorio (fármacos retirados, fallos clínicos y PASS), con las etiquetas del *benchmark* prevaleciendo en conflictos. Se descartaron 1.769 filas duplicadas y se conservaron 42 conflictos de etiqueta (todos dentro de `train_locked`) según la etiqueta de la primera fila, con registro en el manifiesto.

Antes del entrenamiento se aplicó una compuerta estricta (*hard gate*): se verificó compuesto a compuesto, por conectividad InChIKey y tras la featurización, que cada compuesto del *benchmark* regulatorio estuviera presente en la matriz de entrenamiento (retirados 71/71, fallos clínicos 10/10, PASS 304/304). El resultado se documenta en `gate_verification.json`. Cabe subrayar que, al absorber el *benchmark*, el modelo de despliegue nunca se evalúa sobre él; las métricas publicadas corresponden al modelo de la ola bloqueada, con el *benchmark* excluido del entrenamiento.

## Capacidades

- Clasificación binaria de preocupación por hepatotoxicidad (DILI) a partir del SMILES de un compuesto, devolviendo una probabilidad de clase tóxica.
- Featurización integrada: cálculo de huellas de Morgan, claves MACCS y descriptores de RDKit mediante el módulo `DescPrep` incluido en el bundle.
- Predicción determinista: los resultados son reproducibles bit a bit (desviación máxima 0 en la validación local).
- Punto de entrada de inferencia simple mediante `predict(smiles)` en `infer.py`.
- Lectura en pareja con el modelo GAT: la doble marca (ambos modelos) constituye la señal de mayor preocupación.
- Validación ejecutable incluida (`validate.py` + `examples.json`) sobre 8 compuestos del programa DPP-4, con tolerancia 1e-6.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es un clasificador tabular de química computacional.

## Casos de uso

- Filtro temprano de hepatotoxicidad en cribado virtual: dado un lote de SMILES de candidatos, el modelo puntúa cada compuesto y permite priorizar los de menor probabilidad de riesgo antes de ensayos in vitro. Su naturaleza determinista y su bajo coste computacional lo hacen adecuado para cribar miles de compuestos.
- Triaje en pareja con el modelo GAT: los compuestos marcados por ambos modelos (`liver-extratrees-deployment` y `liver-gat-deployment`) se elevan como de máxima preocupación, mientras que los no marcados por ninguno pasan a revisión rutinaria. En el programa DPP-4, solo 6 de 1.110 líderes pasaron ambos filtros.
- Auditoría regulatoria interna: el bundle incluye `absorbed_compounds.csv`, `gate_verification.json` y `training_manifest.json`, lo que permite reconstruir la composición exacta del entrenamiento y verificar la inclusión de compuestos del *benchmark* regulatorio.
- Reproducción de resultados en pipelines de quimioinformática: al ser un artefacto joblib con dependencias declaradas (scikit-learn, RDKit, joblib, numpy), se integra en scripts de Python existentes sin infraestructura de GPU.
- Detección de señales en series químicas: aplicación sobre los líderes potentes de un programa concreto (en el caso documentado, DPP-4) para identificar qué compuestos concentran la señal de riesgo y orientar la química médica.
- Docencia y validación metodológica: sirve como ejemplo reproducible de flujo QSAR con compuerta de verificación de datos y validación determinista, útil para formar equipos en buenas prácticas de modelado toxicológico.
- Segunda opinión frente a modelos neuronales: al ser un ensamblado de árboles sobre descriptores clásicos, aporta una perspectiva complementaria al GAT y permite contrastar discrepancias entre familias de modelos.

## Benchmarks y rendimiento

Las métricas publicadas corresponden al modelo de la ola bloqueada (385 compuestos puntuados, *benchmark* excluido del entrenamiento, solapamiento verificado a 0), no al *refit* de despliegue, que absorbe el *benchmark* y no se evalúa sobre él.

| Metrica | Valor |
|---|---|
| AUROC regulatorio agrupado | 0,690 |
| Exactitud balanceada agrupada | 0,623 |
| Fármacos retirados detectados | 65/71 |
| Fallos clínicos detectados | 10/10 |
| Compuestos PASS correctos | 97/304 (0,319) |

Resultados del cribado de despliegue (marca = probabilidad >= 0,5): 1.113/1.113 líderes del programa DPP-4 puntuados, 1.082 marcados (97,5%); 4.898/4.898 de la unión potente completa puntuada, 4.722 marcados (96,5%). En la lectura en pareja, 1.003/1.110 líderes marcados por ambos modelos y solo 6 pasan ambos.

## Requisitos de hardware

- Inferencia en CPU: el modelo es un ensamblado de árboles de scikit-learn; no requiere GPU.
- VRAM estimada: 0 GB (no aplica).
- GPU recomendadas: no aplica; cualquier CPU convencional es suficiente.
- Cabe en cualquier equipo de consumo: el repositorio ocupa 0,0 GB y el bundle joblib es de tamaño reducido.
- Opciones de despliegue: Python con `scikit-learn`, `rdkit`, `joblib` y `numpy`; punto de entrada `infer.py` con `predict(smiles)`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo neuronal de lenguaje.
- Latencia y throughput: no disponibles de forma explícita; por la naturaleza del modelo (predicción sobre 1.404 features con árboles), se espera del orden de milisegundos por compuesto en CPU, aunque no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Delower/liver-extratrees-deployment` | ExtraTrees (scikit-learn) | SMILES -> 1.404 features | 1.891 compuestos únicos | MIT | Hugging Face |
| `Delower/liver-gat-deployment` | Red neuronal de grafos (GAT) | Grafo molecular | no disponible | no disponible | Hugging Face |
| Modelos QSAR DILI públicos | variable (RF, SVM, GNN) | descriptores o grafos | variable | variable | variable |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento. La comparación con el modelo GAT del mismo programa es la más directa: ambos se despliegan en pareja y comparten el protocolo de validación, pero difieren en familia de modelo (árboles frente a red de grafos) y en representación de entrada.

## Limitaciones y advertencias

- Las probabilidades son puntuaciones de cribado, no riesgos clínicos calibrados; no deben interpretarse como probabilidad real de toxicidad en pacientes.
- El modelo es de alta sensibilidad y baja especificidad: en el cribado DPP-4 marcó el 97,5% de los líderes, por lo que una marca individual aporta poca información. La lectura útil es la doble marca con el modelo GAT.
- El *refit* de despliegue absorbe el *benchmark* regulatorio y no se evalúa sobre él; las métricas publicadas (AUROC 0,690) provienen de la ola bloqueada y pueden no reflejar el comportamiento del artefacto desplegado.
- La exactitud sobre compuestos PASS es baja (0,319), lo que indica una tendencia a marcar como tóxicos compuestos que no lo son.
- Requiere `scikit-learn`, `rdkit`, `joblib` y `numpy`; el *unpickling* exige que `deployment_common.py` sea importable, lo que añade una dependencia de código además del bundle de pesos.
- El conjunto de entrenamiento es pequeño (1.891 compuestos) y específico del programa; la generalización a quimiotipos fuera de su dominio no está garantizada.
- No se documentan sesgos conocidos ni limitaciones idiomáticas (no aplica); la licencia MIT permite uso comercial sin restricciones adicionales, pero no se ofrece garantía alguna sobre el rendimiento en producción.
- El repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta, lo que limita la evidencia de uso externo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Delower/liver-extratrees-deployment
- Modelo GAT compañero: https://huggingface.co/Delower/liver-gat-deployment
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
