# openadmet/cyp1a2-cyp2d6-cyp3a4-cyp2c9-cyp2b6-cyp2c8-cyp2c19-chemeleon-v2

## Resumen

El modelo `cyp1a2-cyp2d6-cyp3a4-cyp2c9-cyp2b6-cyp2c8-cyp2c19-chemeleon-v2` es un predictor multitarea de inhibición de isoformas del citocromo P450 desarrollado por OpenADMET. No es un modelo de lenguaje: es un modelo químico (grafo molecular) construido sobre la arquitectura ChemProp y inicializado desde los pesos del modelo fundacional CheMeleon. Predice el valor de pIC50 para siete isoformas CYP (CYP1A2, CYP2D6, CYP3A4, CYP2C9, CYP2B6, CYP2C8 y CYP2C19), un parámetro crítico en el descubrimiento de fármacos por su relación con interacciones farmacológicas y toxicidad.

La versión v2 amplía el conjunto de datos de la v1 incorporando la deposición de BindingDB del 19 de octubre de 2026 además de los datos de ChEMBL37, y añade tres isoformas nuevas (CYP2B6, CYP2C8, CYP2C19) a las cuatro originales. El conjunto de entrenamiento final contiene 9.695 compuestos y el modelo se ha entrenado sin partición de validación ni test (fracción de entrenamiento de 1.0), por lo que no dispone de métricas de generalización internas publicadas.

El modelo es relevante para equipos de química computacional y descubrimiento de fármacos que necesitan cribar grandes bibliotecas de compuestos frente a los principales riesgos de inhibición de CYP antes de la fase experimental. Su licencia Apache 2.0 y su integración con el framework Anvil de OpenADMET facilitan su adopción en pipelines internos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ChemProp (red neuronal sobre grafos moleculares) inicializada desde CheMeleon; cabecera FFN de 3 capas, anchura 1024, dropout 0.1, 7 tareas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo molecular, no de texto) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones) |
| Idiomas soportados | en (etiqueta del repositorio; el modelo no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos distribuidos vía Git LFS en el repositorio) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma ChemProp: representación de moléculas como grafos y paso por una red neuronal con pooling para producir una predicción por tarea. La novedad respecto a un ChemProp convencional es la inicialización desde CheMeleon, un modelo fundacional químico preentrenado, y el uso de `ChemPropFeaturizer` con normalización del target. La cabecera es una FFN de tres capas de anchura 1024 con dropout 0.1, y se entrenan simultáneamente siete tareas (una por isoforma CYP).

Los datos provienen del catálogo combinado de OpenADMET (`combined_IC50_all_CYPs_pIC50.parquet`), construido a partir de ChEMBL37 (valores pChEMBL de IC50) y BindingDB (deposición 2026-10-19). El endpoint es el pIC50 combinado: mediana por compuesto de las medianas de cada fuente sobre variantes de sustrato sonda, usando una sola fuente cuando la otra no reporta el compuesto. La curación específica para CYP elimina registros no humanos, de isoforma incorrecta, ensayos de inhibición dependiente del tiempo (TDI), valores censurados o implausibles y ensayos con una única concentración superior; también corrige un error documentado de transcripción de unidades. Los registros discrepantes entre fuentes se marcan pero se conservan. El entrenamiento se realizó con `openadmet-models` (commit `d6717759d54c2459c29aafba74f4b325b45b3413`) mediante `openadmet anvil`, con `ShuffleSplitter`, `train_size: 1.0` y semilla 42, sobre 9.695 compuestos. No se documenta uso de RLHF ni DPO (no aplica a este tipo de modelo).

## Capacidades

- Predicción de pIC50 de inhibición para siete isoformas CYP: CYP1A2, CYP2D6, CYP3A4, CYP2C9, CYP2B6, CYP2C8 y CYP2C19.
- Predicción multitarea en una sola pasada: las siete isoformas se infieren conjuntamente.
- Entrada basada en estructura molecular (grafo) mediante `ChemPropFeaturizer`; no requiere descriptores manuales.
- Modelo fundacional químico (CheMeleon) como inicialización, lo que aporta transferencia desde representaciones químicas generales.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No cubre inhibición dependiente del tiempo (TDI) ni predicción de si un compuesto es sustrato de CYP.
- No proporciona predicciones específicas por sustrato sonda o sistema de ensayo: el valor es una media a nivel de isoforma.

## Casos de uso

- Cribado virtual de inhibición CYP en bibliotecas de compuestos: dado un conjunto de moléculas candidatas, el modelo devuelve pIC50 para las siete isoformas y permite priorizar o descartar compuestos con riesgo alto de inhibición antes de ensayos in vitro.
- Evaluación de riesgo de interacciones farmacológicas (DDI): la inhibición de CYP3A4, CYP2D6 y CYP2C9 es un determinante clave de interacciones; el modelo permite estimar ese riesgo de forma temprana en el diseño de candidatos.
- Filtrado en generación molecular: integrar el modelo como filtro en bucles de diseño generativo para penalizar moléculas con inhibición CYP predicha alta y favorecer candidatos con perfil limpio.
- Priorización de compuestos en química médica: ordenar series químicas por potencia de inhibición predicha para decidir qué análogos sintetizar y ensayar primero.
- Enriquecimiento de datasets internos: usar las predicciones como etiquetas preliminares para ampliar conjuntos de entrenamiento propios o para detectar compuestos con datos experimentales faltantes.
- Análisis de selectividad entre isoformas: comparar los siete valores predichos de un compuesto para identificar inhibición selectiva frente a una isoforma concreta, útil en el diseño de fármacos con perfil de selectividad controlado.
- Repositorio de referencia para comparación de modelos: al estar construido sobre CheMeleon y publicado con datos y scripts de curación, sirve como línea base reproducible para evaluar variantes de modelos CYP en investigación metodológica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo se entrenó con `train_size: 1.0` y sin partición de validación ni test, por lo que la model card no reporta métricas de generalización (RMSE, R², MAE) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, lo que sugiere un modelo pequeño que probablemente cabe en cualquier GPU consumer, pero no se publican cifras de memoria.
- GPU recomendadas: no disponible. El framework Anvil ofrece entorno con CUDA (`openadmet-models-gpu.yaml`), pero no se especifican modelos de GPU.
- Cabe en GPU consumer: muy probablemente sí, dado el tamaño del repositorio, aunque no se confirma en la documentación.
- Opciones de despliegue: framework Anvil de `openadmet-models` (instalación vía conda/pip o imagen Docker `ghcr.io/openadmet/openadmet-mode...`), con soporte de GPU vía CUDA. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo ni de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa. Como referencia cualitativa, la versión v1 del mismo modelo cubría solo cuatro isoformas (CYP1A2, CYP2D6, CYP3A4, CYP2C9) y se entrenó únicamente con ChEMBL; la v2 amplía a siete isoformas y añade BindingDB. No se conocen en la información disponible otros modelos públicos de predicción multitarea de inhibición CYP con los que comparar parámetros, contexto o licencia.

## Limitaciones y advertencias

- El endpoint es una media a nivel de isoforma: colapsa variantes de sustrato sonda, por lo que la predicción no corresponde a ningún ensayo concreto y puede desviarse del valor experimental de un ensayo específico.
- Excluye ensayos de inhibición dependiente del tiempo (TDI): el modelo no dice nada sobre inhibición mecanística o dependiente del tiempo.
- No predice si un compuesto es sustrato de CYP, solo su potencia de inhibición.
- Entrenado sin partición de validación ni test (`train_size: 1.0`): no hay métricas de generalización publicadas y el riesgo de sobreajuste no está cuantificado.
- El propio autor advierte que, pese a la curación, el rendimiento puede mejorar y recomienda proceder con cautela.
- Los registros discrepantes entre ChEMBL y BindingDB se conservan marcados, lo que puede introducir ruido en las etiquetas.
- Solo se etiqueta el idioma `en`; el modelo no procesa lenguaje natural, por lo que las capacidades multilingües no aplican.
- Licencia Apache 2.0: permite uso comercial, pero no se ofrece garantía ni se documentan limitaciones de responsabilidad más allá del aviso del autor.
- No se documentan sesgos específicos; en un modelo químico, el sesgo relevante es la cobertura del espacio químico del conjunto de entrenamiento (9.695 compuestos), que puede no representar bien clases estructurales poco presentes en ChEMBL o BindingDB.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openadmet/cyp1a2-cyp2d6-cyp3a4-cyp2c9-cyp2b6-cyp2c8-cyp2c19-chemeleon-v2
- Repositorio openadmet-models: https://github.com/OpenADMET/openadmet-models
- Catálogo de datasets combinados: https://github.com/OpenADMET/data-catalogs/tree/main/catalogs/combined_datasets/
- Catálogo ChEMBL pChEMBL IC50: https://github.com/OpenADMET/data-catalogs/tree/main/catalogs/activities/ChEMBL_pChEMBL_IC50
- Catálogo BindingDB IC50: https://github.com/OpenADMET/data-catalogs/tree/main/catalogs/activities/BindingDB_IC50
- Documentación de OpenADMET: https://docs.openadmet.org/en/latest/
- Demos de Anvil: https://demos.openadmet.org/en/latest/
