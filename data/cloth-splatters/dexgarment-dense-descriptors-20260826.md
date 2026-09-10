# Cloth-splatters/dexgarment-dense-descriptors-20260826

## Resumen

Este repositorio, publicado por el usuario Cloth-splatters, agrupa 48 checkpoints entrenados (seed 0) para un experimento de correspondencia densa sobre prendas de ropa a partir de nubes de puntos. No es un modelo de lenguaje ni un modelo generativo de texto: son modelos de descriptores (descriptores densos por punto) que cubren dos regimenes de observacion (`flat` y `deformation`), ocho recetas de entrenamiento y tres categorias de prenda (`tops`, `dress`, `trousers`). El tamano total del repositorio es de 0,7 GB y cada checkpoint incorpora su propio `config.json` con la arquitectura y los ajustes de entrenamiento exactos.

El objetivo es resolver el problema de establecer correspondencias punto a punto entre una prenda observada y una representacion de referencia, algo critico para manipulacion robotica de tejidos, seguimiento de deformaciones y transferencia de politicas entre simulacion y realidad. La model card es explicita al delimitarlo: son descriptores de correspondencia, no estimadores del estado de la prenda ni modelos de dinamica.

La relevancia actual viene de que publica la matriz completa y comparable de recetas, con metricas por celda en `comparison/summary.json` y `comparison/runs.csv`, ademas de sumas de verificacion SHA256. Se apoya en el trabajo previo UniGarmentManip (commit de experimento `0701bc475877da68bc07f727a1995fd78a3de511`) y en el dataset `Cloth-splatters/dexgarmentlab-lift-correspondence-20260822`, con 1.800 episodios disjuntos por prenda y 28.800 observaciones de deformacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos de descriptores densos sobre nube de puntos; dos familias (GAM y UniGarmentManip). La arquitectura exacta de cada checkpoint esta en su `config.json` adyacente |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de descriptores sobre nube de puntos, no un transformer autoregresivo) |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints PyTorch `.pt`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica / no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best.pt` por celda), acompanado de `config.json`, `validation_metrics.json` y `test_metrics.json` |
| Dimensionalidad del descriptor | 512 (`feature_dim=512` en el ejemplo de carga) |
| Regimenes de observacion | `flat` y `deformation` |
| Categorias de prenda | `tops`, `dress`, `trousers` |
| Recetas entrenadas | 8: `gam_scratch_shared`, `unigarment_scratch_shared`, `gam_pretrained_adapt`, `unigarment_native_coarse`, `gam_shared_c2f`, `gam_pretrained_c2f`, `unigarment_shared_c2f`, `unigarment_native_c2f` |
| Checkpoints publicados | 48 (2 regimenes x 8 recetas x 3 categorias x seed 0) |
| Dataset de entrenamiento | `Cloth-splatters/dexgarmentlab-lift-correspondence-20260822`: 1.800 episodios disjuntos por prenda, 28.800 observaciones de deformacion |
| Tamano del repositorio | 0,7 GB |
| Autor | Cloth-splatters |
| Fecha de publicacion | 2026-09-10 |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura unica, sino una matriz de recetas sobre dos familias de modelos de descriptores de nube de puntos: GAM y UniGarmentManip. Cada receta combina un origen de inicializacion (`scratch` frente a `pretrained`/`native`) con un esquema de reparto de parametros (`shared`, `adapt`, `coarse`) y, en cuatro casos, el sufijo `c2f`. La model card no explicita el significado de esa nomenclatura, por lo que la interpretacion de `c2f` (probablemente un esquema en dos etapas) no puede confirmarse con la informacion disponible. La seleccion de familia se hace a partir del nombre de la receta en el cargador. El baseline GAM sin adaptar no se duplica en este repositorio: sus checkpoints de origen siguen en DexGarmentLab/Model-HALO.

El entrenamiento cubre 1.800 episodios disjuntos por prenda y 28.800 observaciones de deformacion, con 48 celdas completadas de 48 y sin ejecuciones fallidas ni valores no finitos, segun la model card. Solo se publica la semilla 0, de modo que no hay estimacion de varianza entre semillas. No se menciona uso de RLHF, DPO ni tecnicas de alineacion, algo coherente con la naturaleza no generativa del modelo. Cada checkpoint queda trazado mediante un commit de experimento y una huella de codigo, y los artefactos se pueden verificar con `SHA256SUMS`.

## Capacidades

- Calculo de correspondencia densa punto a punto entre nubes de puntos de prendas en el regimen `flat`, con un error denso de 0,613 cm y un 95,365% de puntos dentro de 2 cm para la receta recomendada.
- Correspondencia en regimen de deformacion, con degradacion acusada: 2,208 cm de error denso y 59,890% dentro de 2 cm para la receta recomendada.
- Metricas semanticas de correspondencia en deformacion, con 4,531 cm de error semantico y 69,576% dentro de 5 cm para `unigarment_scratch_shared`.
- Cobertura de tres categorias de prenda: partes superiores (`tops`), vestidos (`dress`) y pantalones (`trousers`).
- Carga estandarizada mediante `build_descriptor_model` y `load_adapted_checkpoint` del paquete `dexgarment_adaptation`, con soporte de ejecucion en GPU (`cuda:0`).
- Seleccion de familia (GAM o UniGarmentManip) segun el nombre de la receta.
- No soporta generacion de texto, tool calling, agentes, vision generativa, audio ni modo de razonamiento. No es un modelo de lenguaje.

## Casos de uso

- Correspondencia densa para manipulacion robotica de ropa: dado un par de nubes de puntos de la misma prenda, el modelo devuelve un descriptor por punto que permite emparejar puntos entre observaciones. La receta `unigarment_shared_c2f` es la adecuada para prendas extendidas sobre una superficie, con 95,365% de puntos a menos de 2 cm.
- Seguimiento de deformacion durante el plegado o el vestido: las recetas con sufijo `c2f` y la variante `unigarment_native_c2f` estan pensadas para observaciones deformadas, utiles para monitorizar como se modifica la geometria de la prenda a lo largo de una secuencia de manipulacion.
- Retargeting y transferencia sim-a-real: la correspondencia densa permite mapear puntos de una malla de origen a una observacion real, lo que sirve para transferir trayectorias o puntos de agarre aprendidos en simulacion a una prenda fisica.
- Anotacion automatica de datasets de correspondencia: el modelo puede preetiquetar correspondencias punto a punto sobre nuevas capturas, reduciendo el coste de anotacion manual antes de una revision humana.
- Evaluacion comparativa de recetas de entrenamiento: `comparison/summary.json` y `comparison/runs.csv` permiten reproducir la comparacion entre las ocho recetas y las tres categorias, util como referencia metodologica para quien entrene variantes propias.
- Seleccion de checkpoint por categoria y regimen en un pipeline de produccion: al publicarse las metricas por celda, un sistema puede cargar la receta concreta que mejor rinde para la categoria de prenda observada en lugar de usar un unico modelo generico.
- Registro y alineacion de mallas de prendas: los descriptores densos sirven como base para estimar transformaciones no rigidas entre una malla canonica y una observacion, paso previo a tareas de simulacion o renderizado.

## Benchmarks y rendimiento

Resultados publicados en la model card. Las medias macro se calculan sobre `tops`, `dress` y `trousers`.

| Uso previsto | Receta | Error denso | Denso <= 2 cm | Top-1 exacto |
|---|---|---:|---:|---:|
| Correspondencia en `flat` | `unigarment_shared_c2f` | 0,613 cm | 95,365% | 44,375% |
| Correspondencia en `deformation` | `unigarment_native_c2f` | 2,208 cm | 59,890% | 14,305% |

Metrica semantica adicional en regimen de deformacion, segun la model card:

| Receta | Error semantico | Dentro de 5 cm |
|---|---:|---:|
| `unigarment_scratch_shared` | 4,531 cm | 69,576% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no son aplicables a este tipo de modelo. Los resultados completos por categoria estan en `comparison/summary.json` y `comparison/runs.csv`.

## Requisitos de hardware

- VRAM: no disponible de forma oficial. El repositorio completo ocupa 0,7 GB para 48 checkpoints mas ficheros de metricas y comparativa, lo que situa cada checkpoint en el orden de decenas de MB o menos; el consumo en inferencia estara dominado por el tamano de lote de la nube de puntos y no por los pesos.
- GPU recomendadas: no se documenta ninguna. El ejemplo oficial usa `cuda:0` sin especificar modelo de GPU.
- GPU de consumo: por el tamano de los artefactos, es previsible que quepa en cualquier GPU consumer con unos pocos GB de VRAM libres, aunque no existe medicion publicada que lo confirme.
- Opciones de despliegue: carga mediante PyTorch y el paquete `dexgarment_adaptation` (`build_descriptor_model` + `load_adapted_checkpoint`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.
- Almacenamiento: 0,7 GB para el repositorio completo, verificable con `SHA256SUMS`.

## Comparativa con modelos similares

No se identifican en la informacion disponible modelos externos comparables de correspondencia densa sobre nubes de puntos de prendas. La comparativa mas util es interna, entre las recetas publicadas en este mismo repositorio, todas ellas con licencia MIT y disponibles en el mismo lugar:

| Receta | Regimen | Error denso | Denso <= 2 cm | Top-1 exacto |
|---|---|---:|---:|---:|
| `unigarment_shared_c2f` | flat | 0,613 cm | 95,365% | 44,375% |
| `unigarment_native_c2f` | deformation | 2,208 cm | 59,890% | 14,305% |
| `unigarment_scratch_shared` | deformation (metrica semantica) | 4,531 cm | 69,576% (<= 5 cm) | no disponible |

El baseline GAM sin adaptar se cita como alojado en DexGarmentLab/Model-HALO y no se incluye en esta matriz, por lo que no hay cifras comparables dentro de este repositorio.

## Limitaciones y advertencias

- No es un estimador del estado de la prenda ni un modelo de dinamica; la propia model card lo explicita. Usarlo para predecir configuraciones fisicas futuras queda fuera de su alcance.
- Solo se publica la semilla 0. No hay estimacion de varianza entre semillas, de modo que las diferencias entre recetas pueden no ser estadisticamente significativas.
- El rendimiento en regimen de deformacion es sensiblemente peor que en `flat`: el top-1 exacto cae del 44,375% al 14,305% y el porcentaje de puntos dentro de 2 cm baja del 95,365% al 59,890%.
- El top-1 exacto es bajo incluso en el mejor caso (44,375% en `flat`), lo que limita su uso directo en tareas que exijan emparejamientos exactos sin post-procesado.
- La cobertura se limita a tres categorias de prenda (`tops`, `dress`, `trousers`) y al dataset indicado; el comportamiento fuera de esa distribucion no esta documentado.
- La licencia MIT cubre este repositorio, pero los pesos y el codigo base de las familias UniGarmentManip y GAM pueden estar sujetos a licencias propias que la model card no detalla. Conviene verificar la procedencia antes de un uso comercial.
- El campo `pipeline` del repositorio esta vacio y no hay idiomas declarados; no debe tratarse como un modelo de lenguaje bajo ninguna circunstancia.
- No se documentan umbrales de confianza ni calibracion de los descriptores, por lo que no hay mecanismo oficial para descartar correspondencias poco fiables.
- Los resultados de la busqueda web realizada no aportan informacion adicional sobre este modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Cloth-splatters/dexgarment-dense-descriptors-20260826
- Dataset asociado: `Cloth-splatters/dexgarmentlab-lift-correspondence-20260822` (identificador citado en la model card; no se proporciona URL directa)
- Baseline GAM sin adaptar: repositorio DexGarmentLab/Model-HALO (identificador citado en la model card; no se proporciona URL directa)
- Commit de experimento de UniGarmentManip: `0701bc475877da68bc07f727a1995fd78a3de511`
- Huella de codigo: `665d3f5e2509bc26ea46fb467d53056a0fcea09998e9d0955e027c05e715843a`
- No se proporcionan enlaces a papers, blogs ni demos en la informacion disponible, y la busqueda web no devolvio resultados relevantes.
