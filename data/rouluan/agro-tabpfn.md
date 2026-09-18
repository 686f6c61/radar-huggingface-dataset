# rouluan/Agro-TabPFN

## Resumen

Agro-TabPFN es un derivado afinado de TabPFN-v3, el modelo fundacional para datos tabulares desarrollado por Prior Labs GmbH. En concreto, el repositorio aloja el archivo `tabpfn-v3-regressor-cn_finetuned_full.ckpt`, un ajuste fino del checkpoint base `tabpfn-v3-regressor-v3_default` sobre un conjunto de datos propio de rendimiento de maiz por provincias chinas (`feature_dataset.csv`, 602 filas, 31 provincias, anos 2003-2022 y 96 caracteristicas). El problema que aborda es la prediccion de rendimiento agricola (regresion tabular) con un modelo de aprendizaje en contexto, sin necesidad de reentrenar desde cero para cada nuevo conjunto de datos.

El modelo lo publica el usuario rouluan, no Prior Labs, y se distribuye como instantanea completa de entrenamiento: ademas del `state_dict` afinado incluye el estado del optimizador AdamW (`exp_avg` y `exp_avg_sq`) y metadatos de epoca y perdida, lo que permite reanudar el ajuste fino desde la mejor epoca. El archivo final ocupa 668 MB, de los cuales aproximadamente 444 MB corresponden a los buffers del optimizador; el repositorio completo suma 0,7 GB.

Es relevante ahora porque ejemplifica el patron de uso de los modelos fundacionales tabulares: adaptar un prior entrenado a gran escala a un dominio concreto (aqui, agricultura) con muy pocos datos etiquetados (422 filas de entrenamiento) y obtener mejoras medibles frente al modelo base. La contrapartida es una licencia estrictamente no comercial, lo que limita su aplicacion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer de tipo prior-data fitted network (heredada de TabPFN-v3; detalle exacto no disponible en la informacion proporcionada) |
| Parametros totales | no disponible (el checkpoint completo pesa 668 MB, de los que ~444 MB son buffers del optimizador AdamW) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 256 (valor de `context` usado en el ajuste fino) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de regresion tabular; no procesa lenguaje natural) |
| Licencia | TABPFN-3 Non-Commercial License v1.0 (solo investigacion y evaluacion interna; uso comercial o en produccion prohibido) |
| Formato de pesos | checkpoint PyTorch (`.ckpt`) |
| Tamano del repositorio | 0,7 GB |
| SHA-256 del checkpoint | 53119ca48958a7b7eb5ca06752eecc2348f0b2ffa58d45d4f5ae79f02793f630 |
| Pipeline | tabular-regression |
| Fecha de creacion | 2026-09-18 |

## Arquitectura y entrenamiento

El modelo parte de TabPFN-v3, un modelo fundacional para datos tabulares de Prior Labs que resuelve tareas de clasificacion y regresion mediante aprendizaje en contexto: el conjunto de entrenamiento se pasa como contexto al transformer y la prediccion se genera en una sola pasada, sin actualizacion de pesos en tiempo de inferencia. El detalle interno de la arquitectura (numero de capas, dimensiones, mecanismo de atencion) no se especifica en la informacion proporcionada. El ajuste fino si modifica los pesos del modelo base, por lo que el resultado es un predictor especializado y no un simple uso en contexto del modelo original.

El entrenamiento se realizo sobre `feature_dataset.csv`: 602 filas, 31 provincias chinas, anos 2003-2022 y 96 caracteristicas. La particion es temporal: 422 filas para entrenamiento (2003-2016), 90 para validacion (2017-2019) y 90 para test (2020-2022). Se configuro con `lr` 3e-6, `wd` 0.01, una combinacion de perdidas MSE 1.0 / CRPS 1.0 / MAE 0.3, contexto 256, semilla 42 y parada temprana con paciencia 5. La mejor perdida de validacion (MSE 0,2716) se alcanzo en la epoca 26 de 30. No se menciona uso de RLHF ni DPO, algo esperable en un modelo de regresion tabular.

La innovacion practica del artefacto es que se publica como checkpoint reanudable, con el estado del optimizador incluido, de modo que un tercero puede continuar el ajuste fino desde la mejor epoca en lugar de repetir el proceso. El autor tambien documenta el hash SHA-256 para verificar la integridad del archivo.

## Capacidades

- Regresion tabular supervisada: predice un objetivo continuo (rendimiento de maiz) a partir de 96 caracteristicas de entrada.
- Aprendizaje en contexto con conjuntos pequenos: el flujo de uso consiste en `fit` sobre el conjunto de entrenamiento y `predict` sobre el de test, sin reentrenamiento adicional.
- Inferencia en ensamblado: el ejemplo de uso emplea `n_estimators=16` y `random_state=42`, lo que promedia 16 estimadores para estabilizar la prediccion.
- Soporte de GPU (`device="cuda"`), con posibilidad de ejecucion en CPU segun la implementacion de TabPFN.
- Reanudacion de entrenamiento: al conservar el estado de AdamW y los metadatos de epoca y perdida, permite continuar el ajuste fino.
- Capacidades multilingues: no aplica; el modelo no procesa texto.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso o agentes: no disponible.
- Vision, audio o modo de razonamiento explicito: no disponible.

## Casos de uso

- Prediccion de rendimiento agricola a escala provincial: el modelo estima el rendimiento del maiz a partir de variables climaticas, edafologicas y de manejo, aprovechando que fue afinado exactamente sobre ese dominio y esas 96 caracteristicas.
- Evaluacion de escenarios de cambio climatico: variando las covariables meteorologicas dentro del rango observado (2003-2022) se pueden generar predicciones contrafactuales para estudiar sensibilidad del rendimiento.
- Priorizacion de intervenciones agronomicas: permite comparar provincias o campanas y detectar aquellas con mayor brecha entre rendimiento esperado y observado, orientando la asignacion de recursos.
- Prototipado rapido de modelos tabulares en investigacion agronomica: al requerir solo un `fit` en contexto, permite obtener una linea base solida en minutos antes de invertir en modelos especificos.
- Analisis de series temporales anuales con particion temporal: su esquema de validacion (entrenar en el pasado, predecir el futuro) es directamente reutilizable para backtesting de predicciones anuales.
- Reanudacion y extension del ajuste fino: un grupo de investigacion puede partir del checkpoint publicado, anadir nuevos anos o regiones y continuar el entrenamiento conservando el estado del optimizador.
- Docencia y reproducibilidad: sirve como ejemplo completo de ajuste fino de un modelo fundacional tabular, con hiperparametros, semilla, particiones y hashes documentados.

## Benchmarks y rendimiento

Resultados del test interno (2020-2022, 90 filas, ensamblado de 16 estimadores) comparando el modelo base con el afinado:

| Metrica | Base | CN-finetuned |
|---|---|---|
| RMSE | 0,6865 | 0,6207 |
| R² | 0,6308 | 0,6981 |
| MAE | 0,4592 | 0,4494 |
| Pearson r | 0,8681 | 0,8914 |
| KGE | 0,8507 | 0,8554 |

Mejor MSE de validacion durante el ajuste fino: 0,2716 en la epoca 26 de 30. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a un modelo de regresion tabular.

## Requisitos de hardware

- El checkpoint completo ocupa 668 MB en disco (aproximadamente 224 MB de pesos mas ~444 MB de estado del optimizador). El peso en VRAM o RAM es, por tanto, modesto.
- El consumo de memoria en inferencia depende del ensamblado (`n_estimators`) y del tamano del contexto (hasta 256 filas por 96 caracteristicas), no solo del numero de parametros; no se dispone de mediciones oficiales de VRAM.
- Es razonable esperar que quepa en GPU de consumo (por ejemplo, RTX 3060 de 12 GB, RTX 4070, RTX 4090) dado el tamano del checkpoint, aunque la cifra exacta no esta documentada.
- GPU de centro de datos (A100, H100) solo serian necesarias para lotes grandes o para reanudar el ajuste fino, que requiere memoria adicional para pesos, gradientes y estados del optimizador.
- El ejemplo oficial usa `device="cuda"` con `TabPFNRegressor`; la libreria TabPFN permite tambien ejecucion en CPU.
- Opciones de despliegue: la libreria oficial `tabpfn` (Python). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Agro-TabPFN (este) | Transformer tabular afinado | no disponible (checkpoint 668 MB) | 256 | RMSE 0,6207 / R² 0,6981 en test interno | Non-Commercial v1.0 | HuggingFace (0 descargas, 0 likes) |
| TabPFN-v3 base (`tabpfn-v3-regressor-v3_default`) | Transformer tabular fundacional | no disponible | no disponible | RMSE 0,6865 / R² 0,6308 en el mismo test | TABPFN-3 (no comercial) | Prior Labs / GitHub |
| Gradient boosting (XGBoost, LightGBM, CatBoost) | Arboles potenciados | no aplica | no aplica | no disponible (no comparado en la informacion) | Permisivas (Apache 2.0 / MIT segun proyecto) | Amplia |
| Otros derivados de TabPFN | Transformer tabular afinado | no disponible | no disponible | no disponible | segun autor | HuggingFace |

La comparacion directa con alternativas de boosting no esta documentada por el autor; el unico contraste publicado es contra el modelo base de TabPFN-v3.

## Limitaciones y advertencias

- Licencia no comercial: la TABPFN-3 Non-Commercial License v1.0 permite investigacion y evaluacion interna, pero prohibe cualquier uso comercial o en produccion. Para uso comercial hay que contactar con sales@priorlabs.ai.
- La seccion 3.d de la licencia prohibe distribuir, alojar o poner a disposicion el modelo o sus derivados como parte de un servicio alojado, gestionado, de API o SaaS.
- Es un derivado modificado y no un producto oficial de Prior Labs GmbH: no ha sido respaldado, aprobado ni validado por la empresa.
- Obligacion de atribucion: cualquier redistribucion debe incluir el aviso de copyright de Prior Labs GmbH 2026 y el texto de exencion de responsabilidad indicado en la model card.
- Conjunto de datos muy pequeno (602 filas, 422 de entrenamiento) y muy especifico (31 provincias chinas, 2003-2022): el riesgo de sobreajuste y de mala generalizacion fuera de ese periodo y esa geografia es alto.
- No se documentan sesgos especificos, pero un modelo entrenado sobre datos historicos de produccion agricola puede heredar sesgos de registro, cobertura provincial desigual o cambios de practicas agrarias.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de predicciones poco fiables fuera del dominio de las 96 caracteristicas de entrada.
- El checkpoint publicado es una instantanea de entrenamiento, no un artefacto de inferencia optimizado; conviene verificar el SHA-256 antes de usarlo.
- No hay informacion sobre cuantizacion ni sobre cuantos recursos consume en produccion.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion externa ni comunidad que haya reproducido los resultados.
- La busqueda web realizada no devolvio ninguna fuente relevante sobre este modelo: los resultados obtenidos eran contenido no relacionado, por lo que toda la informacion procede de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rouluan/Agro-TabPFN
- Repositorio de TabPFN (Prior Labs): https://github.com/PriorLabs/TabPFN
- Licencia del modelo: archivo `LICENSE` incluido en el repositorio (TABPFN-3 Non-Commercial License v1.0)
- Contacto para uso comercial: sales@priorlabs.ai
- Papers, blogs o demos adicionales: no disponible (la busqueda web no devolvio resultados relevantes)
