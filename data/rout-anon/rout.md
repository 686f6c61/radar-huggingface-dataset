# rout-anon/rOUT

## Resumen

rOUT es un router de profundidad aprendido (learned depth router) para detectores de valores atipicos tabulares que operan en contexto (in-context) y permanecen congelados. Dado un conjunto de datos sin etiquetar, el router lee los estados por capa que produce el backbone sobre una submuestra de filas y decide tras cuantas capas detener la inferencia, aplicando el paradigma de salida temprana (early exit). El autor es la cuenta anonima `rout-anon` y el repositorio aloja los routers descritos en un articulo (paper) no enlazado en la model card.

El repositorio no contiene un modelo generativo ni un modelo de lenguaje: contiene nueve checkpoints de router, tres semillas de entrenamiento para cada uno de tres backbones de deteccion de atipicos en datos tabulares: OutFormer (10 capas), ICLAD (12 capas) y TACTIC (12 capas). Cada archivo es un diccionario de PyTorch con los pesos del router (`state`), su configuracion (`cfg`), la estandarizacion de caracteristicas (`feat_mu`, `feat_sd`), el conjunto de caracteristicas, el coste por capa (`lam_depth`), el umbral de parada elegido sobre el split de validacion sintetico para esa semilla (`tau`) y el umbral del ensemble de logits de las tres semillas (`tau_ensemble`).

Su relevancia es de investigacion: aborda la reduccion del coste computacional en deteccion de anomalias tabulares sin reentrenar el detector subyacente. Al ser un componente auxiliar, las metricas de interes son el ahorro de computo frente a la perdida de calidad de deteccion, no las capacidades generativas. Los pesos de los backbones no se incluyen y deben obtenerse de las publicaciones originales de OutFormer, ICLAD y TACTIC.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Router de profundidad aprendido (early exit) que consume los estados por capa de un backbone tabular congelado; arquitectura interna del router no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el router procesa una submuestra de filas cuyo tamano no se especifica |
| Tipos de cuantizacion | no disponible; solo se publican pesos en precision original de PyTorch |
| Idiomas soportados | no disponible; no es un modelo de lenguaje, opera sobre datos tabulares |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`), diccionario con claves `state`, `cfg`, `feat_mu`, `feat_sd`, feature set, `lam_depth`, `tau`, `tau_ensemble` |
| Backbones soportados | OutFormer (10 capas), ICLAD (12 capas), TACTIC (12 capas) |
| Numero de checkpoints | 9 (3 semillas por backbone) |
| Tamano del repositorio | 0,2 GB |
| Tarea | Deteccion de atipicos / anomalias en datos tabulares con salida temprana |
| Fecha de publicacion | 28 de septiembre de 2026 (creacion y ultima actualizacion) |

## Arquitectura y entrenamiento

El sistema se compone de dos partes. La primera es un backbone congelado de deteccion de atipicos tabulares en contexto, que procesa el conjunto de datos sin etiquetar y expone representaciones internas por capa: OutFormer con 10 capas, ICLAD con 12 capas o TACTIC con 12 capas. La segunda es el router, un modulo ligero entrenado para decidir la profundidad de computo optima a partir de los estados por capa observados sobre una submuestra de filas. El router incorpora un coste por capa (`lam_depth`) que penaliza el uso de mas profundidad, de modo que el entrenamiento equilibra explicitamente calidad de deteccion y coste computacional.

El umbral de parada `tau` se selecciona sobre un split de validacion sintetico para cada semilla, y el repositorio incluye ademas `tau_ensemble`, el umbral de un ensemble de logits sobre las tres semillas. No se especifican en la informacion disponible el numero de tokens o muestras de entrenamiento, la composicion del dataset de entrenamiento, el volumen de datos sinteticos usado para calibrar los umbrales ni si se emplearon tecnicas de RLHF o DPO (no aplicables en este dominio). Tampoco se detalla la arquitectura interna del router (numero de capas, dimensiones ocultas o funcion de activacion). La innovacion principal es precisamente el enrutado de profundidad aprendido sobre un detector congelado, lo que permite reutilizar el backbone sin reentrenarlo.

## Capacidades

- Prediccion de la profundidad de parada (numero de capas a ejecutar) para un backbone tabular congelado dado un conjunto de datos sin etiquetar.
- Deteccion de valores atipicos o anomalias en datos tabulares como resultado indirecto del backbone que envuelve.
- Reduccion del coste de inferencia mediante salida temprana, con penalizacion explicita del coste por capa.
- Estandarizacion de caracteristicas integrada en el checkpoint (`feat_mu`, `feat_sd`) y definicion explicita del conjunto de caracteristicas empleado.
- Ensembling de semillas mediante umbrales de logits (`tau_ensemble`).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-step en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingues, de vision, audio ni modo de pensamiento (thinking mode).
- No genera texto: su salida es una decision de enrutado y, a traves del backbone, una puntuacion o etiqueta de atipicidad.

## Casos de uso

- Deteccion de anomalias en datos tabulares con presupuesto de computo ajustado: el router decide detener la inferencia antes de la ultima capa cuando la confianza es suficiente, reduciendo el coste por lote sin reentrenar el detector.
- Monitorizacion de calidad de datos en produccion: deteccion de filas anomalas (valores fuera de rango, combinaciones imposibles, registros corruptos) en tablas de negocio antes de que entren en un pipeline de analitica o de entrenamiento.
- Filtrado previo en pipelines de machine learning: eliminar o marcar outliers en el conjunto de entrenamiento antes de ajustar un modelo supervisado, reutilizando OutFormer, ICLAD o TACTIC con salida temprana.
- Deteccion de fraude en transacciones tabulares: puntuar registros transaccionales y priorizar los que superan el umbral para revision manual, aprovechando el ahorro de computo en el grueso del trafico que no es anomalo.
- Deteccion de intrusiones a partir de registros tabulares de red: identificar conexiones o sesiones atipicas en un flujo de eventos estructurados, con la salida temprana como mecanismo para absorber volumen alto.
- Mantenimiento predictivo con lecturas de sensores: detectar lecturas anomalas en series tabulares de equipos industriales, usando el backbone congelado como detector y el router como gestor del coste de inferencia.
- Despliegue en entornos con recursos limitados: al ser checkpoints ligeros sobre un backbone fijo, el router permite servir deteccion de atipicos en CPU o en GPU de gama baja recortando la profundidad efectiva.
- Reproduccion de investigacion: replicar los resultados del articulo de rOUT sobre los tres backbones y las tres semillas, comparando el efecto del umbral `tau` frente al ensemble `tau_ensemble`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe los checkpoints, sus claves y el procedimiento de evaluacion (`scripts/evaluate.sh <backbone> --tau stored` sobre los venues de benchmark construidos por el repositorio de codigo), pero no incluye cifras de AUC, F1, ahorro de FLOPs ni latencia para ninguno de los tres backbones. Tampoco se enlaza el articulo donde presumiblemente aparecen esas metricas.

## Requisitos de hardware

- Los nueve checkpoints de router suman 0,2 GB en total, por lo que los pesos del router caben con holgura en memoria de CPU o de cualquier GPU, incluso en configuraciones muy modestas.
- El consumo real de VRAM lo determina el backbone congelado (OutFormer, ICLAD o TACTIC), cuyos pesos no se distribuyen en este repositorio y cuyo tamano no se especifica. No es posible estimar VRAM sin esa informacion.
- No se dispone de datos sobre GPU recomendadas ni sobre si el sistema completo cabe en GPU de consumo; depende enteramente del backbone elegido y del tamano del lote de filas procesado.
- El router es agnostico respecto al backend de inferencia: se carga con PyTorch y se evalua mediante los scripts del repositorio de codigo asociado. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no son aplicables a un router tabular de este tipo.
- No se publican cifras de latencia ni de throughput.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros routers de profundidad aprendidos para deteccion de atipicos tabulares ni metricas que permitan una comparacion cuantitativa. La unica comparacion interna posible es entre los tres backbones soportados, que se resumen a continuacion:

| Backbone | Capas | Checkpoints incluidos | Metricas publicadas |
|---|---|---|---|
| OutFormer | 10 | `outformer_s0.pt`, `outformer_s1.pt`, `outformer_s2.pt` | no disponibles |
| ICLAD | 12 | `iclad_s0.pt`, `iclad_s1.pt`, `iclad_s2.pt` | no disponibles |
| TACTIC | 12 | `tactic_s0.pt`, `tactic_s1.pt`, `tactic_s2.pt` | no disponibles |

## Limitaciones y advertencias

- El repositorio no incluye los pesos de los backbones: sin descargar OutFormer, ICLAD o TACTIC desde sus publicaciones originales, los routers son inutilizables.
- No se aportan resultados de evaluacion, por lo que no es posible verificar el ahorro de computo ni la perdida de calidad de deteccion que introduce la salida temprana.
- Los umbrales `tau` y `tau_ensemble` estan calibrados sobre un split de validacion sintetico; su transferibilidad a datos tabulares reales de otro dominio no esta documentada y puede degradarse.
- El router asume el mismo esquema de caracteristicas con el que fue entrenado; el checkpoint fija el conjunto de caracteristicas y su estandarizacion, de modo que cambios en las columnas o en las unidades de entrada invalidan el modelo.
- No se especifican sesgos conocidos, pero al depender de un backbone entrenado sobre datos concretos, heredara los sesgos de representacion de dicho backbone.
- Riesgo de falsos negativos por parada prematura: una decision de salida temprana incorrecta puede omitir capas necesarias para separar anomalias sutiles. No se documenta la tasa de error asociada.
- La licencia MIT cubre los checkpoints de router, pero no aclara la situacion de los backbones subyacentes, cuyos terminos se rigen por sus propias licencias. Verifique ambas antes de un uso comercial.
- El modelo no es un sistema de deteccion autonomo: requiere integracion con el repositorio de codigo y con los backbones, y no ofrece interfaz de inferencia directa ni API alojada.
- La cuenta autora es anonima, el modelo no tiene descargas ni valoraciones y no se enlaza publicacion revisada por pares, lo que limita la trazabilidad y el soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rout-anon/rOUT
- Backbones de referencia citados en la model card (pesos no incluidos en este repositorio): OutFormer, ICLAD y TACTIC, disponibles en sus publicaciones originales; los enlaces concretos no figuran en la informacion proporcionada.
- Repositorio de codigo asociado (`checkpoints/`, `scripts/evaluate.sh`): referenciado en la model card, sin URL disponible.
- Las busquedas web realizadas no devolvieron material relevante sobre este modelo: los resultados corresponden a la tarjeta de movilidad Rout'in de TotalEnergies y a Rout Consulting y no guardan relacion con rOUT.
