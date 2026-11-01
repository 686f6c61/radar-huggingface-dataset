# Eonark/Ark-ADMET

## Resumen

Ark-ADMET es una colección de modelos de predicción de propiedades ADMET (absorción, distribución, metabolismo, excreción y toxicidad) publicada por el usuario Eonark en HuggingFace. No se trata de un modelo de lenguaje ni de una red neuronal generativa, sino de un conjunto de modelos de *machine learning* clásico —CatBoost— junto con un modelo Chemprop independiente, entrenados sobre los 22 endpoints del benchmark ADMET de Therapeutics Data Commons (TDC).

El repositorio contiene, para cada endpoint, cinco modelos CatBoost entrenados sobre los cinco *splits* oficiales de TDC (`seed1` a `seed5`), de modo que la predicción final es la media de las cinco semillas. Además, incluye un conjunto separado de cinco modelos Chemprop para el endpoint `Lipophilicity_AstraZeneca`, que constituye una submission independiente y no se promedia con los CatBoost.

La relevancia del proyecto reside en su utilidad práctica para el descubrimiento de fármacos: permite obtener predicciones rápidas de propiedades farmacocinéticas y toxicológicas a partir de SMILES, con un pipeline reproducible y métricas alineadas con el benchmark oficial de TDC. El tamaño del repositorio es de aproximadamente 0,4 GB y la licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CatBoost (gradient boosting sobre árboles de decisión) y Chemprop (red neuronal de mensajes) |
| Parámetros totales | no disponible (modelos de árboles y red neuronal; no se reporta recuento de parámetros) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular sobre descriptores moleculares) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (entrada: SMILES) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.cbm` (CatBoost), `.npz`/`.joblib` (cabezas MiniMol), checkpoint Chemprop |

## Arquitectura y entrenamiento

El núcleo del repositorio son 22 conjuntos de modelos CatBoost, uno por endpoint ADMET de TDC. Cada conjunto contiene cinco modelos entrenados sobre las particiones de entrenamiento de los cinco *splits* oficiales de TDC. La predicción final se obtiene como media de las cinco semillas: en clasificación se promedia la probabilidad de la clase positiva y en regresión se invierte el escalado del target mediante `y_scaler.json` para devolver la predicción a la escala original de la etiqueta.

La representación de entrada parte de un bloque de huellas moleculares común a todos los endpoints de 2563 columnas: Morgan count (radio 2, 1024 bins), Avalon count (1024 bins), ErG (315) y 200 descriptores RDKit. Sobre este bloque, algunos endpoints añaden bloques opcionales: descriptores 3D de PaDEL (hasta 431 columnas), embeddings GIN de 300 dimensiones procedentes de un codificador congelado, y embeddings MiniMol v1 de 512 dimensiones. La selección de características e hiperparámetros de CatBoost se realizó mediante un *scaffold split* interno derivado de la partición de entrenamiento de la semilla 1. El modelo Chemprop para `Lipophilicity_AstraZeneca` se entrenó de forma independiente y sus predicciones no se usan como características ni se promedian con las de CatBoost.

## Capacidades

- Predicción de 22 endpoints ADMET de TDC: toxicidad (DILI, hERG, AMES, LD50), propiedades fisicoquímicas (lipofilia, solubilidad, Caco2, PPBR), farmacocinética (aclaramiento microsomal y hepatocitario, vida media, VDss) y metabolismo (sustratos e inhibidores de CYP2C9, CYP2D6 y CYP3A4).
- Clasificación binaria con salida de probabilidad de la clase positiva (ROC-AUC o PR-AUC según endpoint).
- Regresión con salida en la escala original de la etiqueta (MAE o Spearman según endpoint).
- Cálculo automático del bloque de huellas y descriptores RDKit a partir de SMILES.
- Soporte de bloques de características opcionales aportados por el usuario (PaDEL 3D, embeddings GIN, embeddings MiniMol).
- Modelo Chemprop independiente para lipofilia.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni capacidades multilingües; su ámbito es exclusivamente químico-estructural.

## Casos de uso

- Filtrado temprano en descubrimiento de fármacos: dado un conjunto de candidatos en SMILES, predecir hERG, AMES y DILI para descartar compuestos con riesgo de cardiotoxicidad, mutagenicidad o hepatotoxicidad antes de ensayos *in vitro*.
- Priorización de bibliotecas químicas: calcular solubilidad acuosa (`Solubility_AqSolDB`), permeabilidad Caco2 y biodisponibilidad para ordenar compuestos por probabilidad de éxito farmacocinético.
- Predicción de interacciones metabólicas: estimar el estatus de sustrato frente a CYP2C9, CYP2D6 y CYP3A4 para anticipar riesgos de interacción farmacológica.
- Modelado de propiedades PK en pipelines internos: integrar `EndpointModel` en scripts de Python que consumen SMILES y devuelven predicciones medias de cinco semillas, con métricas alineadas al benchmark TDC para comparación con la literatura.
- Enriquecimiento de datasets internos: usar las predicciones como variables adicionales en modelos de *scoring* o en estudios de relación estructura-actividad.
- Evaluación comparativa de metodologías: emplear los checkpoints como *baseline* reproducible frente a modelos propios, dado que usan los *splits* oficiales de TDC y métricas estándar.
- Análisis de lipofilia: usar el conjunto Chemprop de `Lipophilicity_AstraZeneca` como submission independiente para contrastar con la versión CatBoost del mismo endpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card indica que los modelos se evaluaron con los *splits* y métricas oficiales de TDC, y que existe un `match.json` que audita que las predicciones guardadas coinciden con el vector reportado (diferencia absoluta máxima de 0 con `atol = 1e-5`), pero no se incluyen los valores de ROC-AUC, PR-AUC, MAE o Spearman por endpoint.

## Requisitos de hardware

- Inferencia en CPU: los modelos CatBoost son ligeros y pueden ejecutarse en CPU sin GPU; el repositorio completo ocupa aproximadamente 0,4 GB.
- VRAM estimada: no aplica para CatBoost (CPU); el checkpoint Chemprop puede requerir GPU para lotes grandes, aunque no se especifica VRAM concreta.
- GPU recomendadas: no disponible; para Chemprop, cualquier GPU con suficiente memoria para el modelo de mensajes (no cuantificada en la información).
- Cabe en GPU de consumo: previsiblemente sí para Chemprop en configuraciones modestas, aunque no se aportan datos; CatBoost no necesita GPU.
- Opciones de despliegue: uso directo mediante la clase `EndpointModel` del módulo `predict.py` incluido en el repositorio, con dependencias `catboost 1.2.10`, `numpy 1.26.4`, `rdkit 2026.03.6` y `huggingface_hub 0.36.2` sobre Python 3.11.16.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Cobertura | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ark-ADMET | CatBoost + Chemprop | 22 endpoints TDC ADMET | SMILES + descriptores | Apache 2.0 | HuggingFace |
| Modelos TDC de referencia | Varios (Chemprop, RF, etc.) | Endpoints TDC | SMILES | Según implementación | TDC / papers |
| Chemprop estándar | Red neuronal de mensajes | Configurable por dataset | Grafos moleculares | MIT (habitual) | GitHub |

No se dispone de datos comparativos de rendimiento entre Ark-ADMET y estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no admite instrucciones en lenguaje natural.
- Los SMILES inválidos se representan internamente como características faltantes; el autor advierte que deben validarse y rechazarse, ya que las predicciones resultantes no son interpretables.
- Los endpoints con bloques opcionales (PaDEL 3D, GIN, MiniMol) requieren que el usuario aporte esas matrices con el orden de columnas correcto; un error en el orden produce predicciones silenciosamente incorrectas.
- El modelo Chemprop de lipofilia es una submission independiente y no debe promediarse con el CatBoost del mismo endpoint.
- No se reportan métricas de rendimiento por endpoint en la información disponible, lo que dificulta evaluar la calidad real de las predicciones.
- Riesgo de extrapolación: al ser modelos entrenados sobre los *splits* de TDC, su fiabilidad fuera de la distribución química de esos datasets no está caracterizada.
- Sesgos: no documentados; pueden reflejar los sesgos de los datasets de origen de TDC.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los datasets TDC subyacentes y de las dependencias (RDKit, PaDEL, MiniMol).
- El repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta, sin validación comunitaria conocida.

## Enlaces

- HuggingFace: https://huggingface.co/Eonark/Ark-ADMET
- Therapeutics Data Commons (benchmark ADMET): https://tdcommons.ai/
- CatBoost: https://catboost.ai/
- Chemprop: https://github.com/chemprop/chemprop
- RDKit: https://www.rdkit.org/
