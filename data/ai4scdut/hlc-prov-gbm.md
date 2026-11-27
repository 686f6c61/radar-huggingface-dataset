# AI4SCDUT/hlc-prov-gbm

## Resumen
HLC-Prov es una familia de modelos de gradient boosting (XGBoost) desarrollada por AI4SCDUT para predecir la constante de Henry adimensional (log10 KAW) a 298,15 K a partir de la estructura molecular. No es un modelo de lenguaje: es un regresor tabular de quimica ambiental que estima el reparto aire-agua de compuestos organicos neutros, un parametro critico en modelizacion de destino ambiental, evaluacion de exposicion y quimica atmosferica.

El modelo se publica en dos variantes con propositos distintos. La variante anclada a mediciones (`gbm_experimental_seed0..4`) se entrena sobre la mediana de valores derivados de experimentos de 2.552 compuestos y es la recomendada para estimar constantes de Henry en sustancias sin medicion. La variante entrenada con estimaciones (`gbm_estimates_seed0..2`) se entrena sobre la mediana de estimaciones de modelos de 5.467 compuestos y solo debe usarse con fines comparativos, ya que hereda el sesgo sistematico de los estimadores que generaron sus etiquetas.

El modelo acompana al estudio *Model-Derived Values Dominate the Henry's Law Record and Are Inherited by Machine Learning* y se despliega en el Henry's Law Provenance Explorer. Su interes actual reside en la combinacion de un rendimiento razonable (RMSE de 0,78 unidades log en validacion aleatoria) con intervalos de prediccion conscientes de la distancia estructural mediante prediccion conformal, lo que permite cuantificar la incertidumbre segun la similitud del compuesto consultado con el conjunto de entrenamiento experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting de arboles (XGBoost) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 2.260 caracteristicas) |
| Tipos de cuantizacion | no aplica (formato nativo XGBoost `.ubj`) |
| Idiomas soportados | no disponible (modelo numerico, sin procesamiento de lenguaje) |
| Licencia | CC BY 4.0 |
| Formato de pesos | UBJSON de XGBoost (`.ubj`), mas `feature_spec.json` y `conformal.json` |

## Arquitectura y entrenamiento
El modelo es un ensamblado de arboles de decision potenciado por gradiente implementado en XGBoost, entrenado como regresion tabular sobre caracteristicas calculadas con RDKit 2025.03.6. La entrada consta de 212 descriptores 2D de RDKit (cuyos nombres se detallan en `feature_spec.json`) seguidos de 2.048 caracteristicas de conteo Morgan (radio 2, conteos limitados a 255), calculadas sobre la estructura neutralizada del compuesto, lo que da un vector de 2.260 dimensiones por molecula.

La variante de referencia usa cinco semillas (`gbm_experimental_seed0` a `seed4`) cuyas predicciones deben promediarse; la variante de estimaciones usa tres semillas (`gbm_estimates_seed0` a `seed2`). Las etiquetas de la variante experimental son la mediana de valores derivados de experimentos (categorias M, L, V, R, T) de 2.552 compuestos, mientras que la variante de estimaciones usa la mediana de estimaciones de modelos (categorias Q, E) de 5.467 compuestos. Los datos derivan de la compilacion de constantes de Henry version 5.0.0 de Sander (2023). La innovacion destacable no esta en la arquitectura, sino en la calibracion de intervalos de prediccion conformal en funcion de la similitud estructural maxima de Tanimoto entre la consulta y el conjunto de entrenamiento experimental.

## Capacidades
- Prediccion de log10 KAW (constante de Henry adimensional) a 298,15 K para moleculas organicas neutras.
- Entrada basada en estructura molecular: descriptores 2D de RDKit y huellas Morgan, sin necesidad de datos experimentales previos.
- Intervalos de prediccion al 50, 68, 90 y 95 por ciento, con anchura dependiente de la similitud estructural (Tanimoto) respecto al conjunto de entrenamiento experimental.
- Promediado de ensamblado sobre multiples semillas para reducir varianza.
- Variante comparativa que reproduce el sesgo de los estimadores de referencia, util para analisis de procedencia de datos.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un regresor puro.

## Casos de uso
- Evaluacion de exposicion ambiental: estimar el reparto aire-agua de compuestos sin medicion experimental para alimentar modelos de destino y transporte (fugacidad, multimedia) con una incertidumbre cuantificada segun la similitud estructural.
- Cribado de sustancias quimicas: priorizar que compuestos de un inventario requieren medicion experimental, usando el ancho del intervalo conformal como criterio de seleccion.
- Quimica atmosferica: calcular constantes de Henry para especies organicas en modelos de particion gas-aerosol y nubes, con advertencia de que solo es valido en agua pura a 298 K.
- Analisis de procedencia de datos: usar la variante entrenada con estimaciones para cuantificar cuanto sesgo introducen los estimadores en las bases de datos de constantes de Henry.
- Investigacion QSPR: servir como linea base reproducible (semillas y especificacion de caracteristicas publicadas) para comparar nuevas arquitecturas de prediccion de propiedades.
- Integracion en pipelines de evaluacion regulatoria: generar estimaciones con intervalos de confianza documentados para informes de evaluacion de riesgo quimico, respetando las restricciones de dominio del modelo.

## Benchmarks y rendimiento
Resultados de validacion cruzada publicados en la model card, medidos como RMSE en unidades log10:

| Particion | RMSE (unidades log) |
|---|---|
| Aleatoria (5 folds x 3 semillas) | 0,78 |
| Clusteres estructurales (Butina, 5 folds x 3 semillas) | 0,94 |
| Temporal (entrenado con datos anteriores a 2005, test sobre 164 compuestos medidos despues) | 1,85 |

El ruido de etiqueta entre mediciones independientes corresponde a 0,12-0,35 unidades log, por lo que el error refleja cobertura limitada de quimica medida mas que ruido de etiqueta. En la particion temporal, los intervalos desplegados cubrieron el 77 por ciento de las nuevas mediciones (82 por ciento para compuestos con similitud inferior a 0,3), frente al 74 por ciento de un intervalo global unico; en particiones aleatorias la cobertura fue del 94 por ciento.

## Requisitos de hardware
- Inferencia en CPU: los modelos XGBoost en formato `.ubj` son ligeros y no requieren GPU; el repositorio ocupa 0,0 GB.
- VRAM estimada: no aplica; ejecucion en memoria del sistema, del orden de megabytes por booster.
- GPU recomendadas: no necesarias; XGBoost puede usar GPU opcionalmente, pero el tamano del modelo no lo justifica.
- Cabe en cualquier GPU de consumo y en equipos sin GPU.
- Despliegue: biblioteca `xgboost` de Python (carga directa con `xgb.Booster().load_model()`), con `huggingface_hub` para la descarga; el calculo de caracteristicas requiere RDKit 2025.03.6.
- Latencia y throughput: no disponibles en la informacion proporcionada; por la naturaleza del modelo se espera latencia de milisegundos por molecula en CPU.

## Comparativa con modelos similares
No se dispone de datos de benchmarks ni especificaciones de modelos comparables en la informacion proporcionada. Como referencia cualitativa, la model card menciona los estimadores de modelos (categorias Q, E) cuyas etiquetas alimentan la variante comparativa, pero no se detallan sus nombres, arquitecturas ni metricas.

## Limitaciones y advertencias
- Entrenado sobre constantes intrinsecas en agua pura a 298 K; no es valido para sales, especies ionizables a un pH dado ni otras temperaturas.
- Solo admite moleculas organicas neutras con H, B, C, N, O, F, Si, P, S, Cl, Br e I.
- Los compuestos multifuncionales alejados de la quimica medida pueden presentar errores de varias unidades log; los intervalos se ensanchan, pero la cobertura bajo cambio temporal quedo por debajo de la nominal.
- La variante entrenada con estimaciones hereda los errores sistematicos de los estimadores que produjeron sus etiquetas y no se recomienda para prediccion.
- Usar otra version de RDKit puede alterar los valores de los descriptores y, por tanto, las predicciones.
- Licencia CC BY 4.0: permite uso comercial con atribucion; debe citarse el modelo, el estudio asociado y la compilacion de Sander (2023).
- Riesgo de alucinacion no aplica al no ser un modelo generativo; el riesgo equivalente es la extrapolacion silenciosa fuera del dominio de entrenamiento, mitigada parcialmente por los intervalos conformales.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/AI4SCDUT/hlc-prov-gbm
- Dataset de entrenamiento: https://huggingface.co/datasets/AI4SCDUT/hlc-prov
- Demo (Henry's Law Provenance Explorer): https://huggingface.co/spaces/AI4SCDUT/hlc-provenance-explorer
- Compilacion de constantes de Henry: Sander, R., *Atmos. Chem. Phys.* 2023, 23, 10901-12440 (CC BY 4.0)
