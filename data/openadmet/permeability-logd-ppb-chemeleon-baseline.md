# openadmet/permeability-logd-ppb-chemeleon-baseline

## Resumen

`permeability-logd-ppb-chemeleon-baseline` es un modelo de prediccion de propiedades ADMET (absorcion, distribucion, metabolismo, excrecion y toxicidad) desarrollado por OpenADMET. Se trata de un modelo multitarea basado en ChemProp, inicializado a partir de los pesos de CheMeleon, que predice cinco endpoints simultaneamente: LogD, permeabilidad Caco-2 en ambas direcciones (Papp A→B y Papp B→A) y union a proteinas plasmaticas de raton y humana (MPPB y HPPB). El modelo esta entrenado sobre datos agregados de ChEMBL y se distribuye con licencia Apache 2.0.

El modelo resuelve un problema clasico en el descubrimiento de farmacos temprano: estimar rapidamente propiedades fisicoquimicas y farmacocineticas de compuestos candidatos sin necesidad de sintetizarlos ni ensayarlos in vitro. Al ser un modelo multitarea, aprovecha las correlaciones entre endpoints para mejorar la prediccion con un unico pase. Su relevancia actual radica en que es parte de un ecosistema abierto (OpenADMET) que incluye catalogos de datos curados, el framework Anvil para entrenamiento e inferencia, y comparativas publicas frente a retos como ExpansionRx.

No es un modelo de lenguaje: es un modelo de quimioinformatica que opera sobre representaciones moleculares (SMILES) y produce valores numericos continuos. El repositorio ocupa 0,1 GB y el conjunto de entrenamiento contiene 28.497 compuestos. Existe una version v2 con curacion mejorada del dataset (exclusion de datos censurados y filtrado de outliers), mientras que la version legacy permanece accesible en el historial de commits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ChemProp (message-passing neural network) inicializado desde pesos CheMeleon, con FFN de 3 capas y anchura 512 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre grafos moleculares) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiquetado del repositorio; el modelo procesa SMILES, no texto natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (distribuido via Git LFS en el repositorio de Hugging Face) |

## Arquitectura y entrenamiento

El modelo es una red neuronal de message passing sobre grafos moleculares (ChemProp) con una cabeza multitarea compuesta por una FFN de 3 capas de anchura 512 y dropout de 0,25. Se inicializa desde los pesos preentrenados de CheMeleon, un enfoque de preentrenamiento molecular que mejora la transferencia frente a inicializacion aleatoria. El featurizador es `ChemPropFeaturizer` con normalizacion de targets, y el modelo se entrena con el framework `openadmet-models` mediante el comando `openadmet anvil`.

Los datos provienen de la agregacion de ChEMBL depositada en los catalogos de datos de OpenADMET. El split es `ShuffleSplitter` con `train_size: 1.0` y `random_state: 42`, lo que significa que no se reservan conjuntos de validacion ni test: es un modelo "no split" entrenado sobre el 100% de los 28.497 compuestos disponibles. Los endpoints se modelan en escala logaritmica: log₁₀ de permeabilidad (en log₁₀ cm/s), log₁₀ de LogD y log₁₀ de porcentaje no unido para los endpoints de union a proteinas. La version v2 incorpora curacion mejorada del set de entrenamiento, excluyendo datos censurados (modificadores no explicitos como `<` o `>`) y aplicando filtrado de outliers.

## Capacidades

- Prediccion de LogD (coeficiente de particion distribucion) en escala log₁₀.
- Prediccion de permeabilidad Caco-2 en direccion apical→basal (Papp A→B) en log₁₀ cm/s.
- Prediccion de permeabilidad Caco-2 en direccion basal→apical (Papp B→A) en log₁₀ cm/s.
- Prediccion de union a proteinas plasmaticas de raton (MPPB) como log₁₀ de porcentaje no unido.
- Prediccion de union a proteinas plasmaticas humana (HPPB) como log₁₀ de porcentaje no unido.
- Aprendizaje multitarea: las cinco predicciones se generan con un unico pase sobre la misma representacion molecular.
- Procesamiento de moleculas en formato SMILES mediante el featurizador ChemProp.
- Integracion con el ecosistema OpenADMET (Anvil) para inferencia por linea de comandos y via Docker.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo de regresion molecular, no un LLM.

## Casos de uso

- Filtrado temprano en cribado virtual: dado un conjunto de moleculas candidatas en SMILES, predecir LogD y permeabilidad Caco-2 para descartar compuestos con mala absorcion oral antes de sintetizarlos, reduciendo costes de sintesis y ensayos in vitro.
- Priorizacion de compuestos en hit-to-lead: usar las predicciones de union a proteinas plasmaticas (humana y de raton) para estimar la fraccion libre disponible y priorizar aquellos con perfil farmacocinetico mas favorable.
- Modelado de translacion raton-humano: comparar las predicciones de MPPB y HPPB para identificar compuestos con diferencias interspecie significativas en union a proteinas, informando el diseno de estudios in vivo.
- Enriquecimiento de librerias quimicas: ejecutar inferencia por lotes sobre decks tipo ZINC (el repositorio incluye `compounds_for_inference.csv` con un subconjunto de 10K compuestos) para anotar librerias con propiedades ADMET estimadas.
- Evaluacion comparativa de series quimicas: predecir los cinco endpoints sobre analogos de una misma serie para guiar modificaciones estructurales hacia perfiles de permeabilidad y union a proteinas deseados.
- Benchmark interno frente a ExpansionRx: usar el modelo como baseline zero-shot en el reto OpenADMET-ExpansionRx para comparar su rendimiento con modelos entrenados especificamente en ese dominio, tal como se documenta en el blog de OpenADMET.
- Integracion en pipelines de quimioinformatica: invocar `openadmet predict` desde scripts o contenedores Docker (CPU o GPU) para incorporar las predicciones a flujos automatizados de diseno molecular.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (R², RMSE, MAE) en la informacion disponible. La model card referencia una comparativa cualitativa de rendimiento zero-shot sobre el dataset ExpansionRx en el blog de OpenADMET, pero no incluye cifras en el repositorio.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo es de pequeno tamano (repositorio de 0,1 GB) y probablemente cabe en cualquier GPU consumer, pero no se publican requisitos especificos.
- GPU recomendadas: no disponible. El autor menciona soporte de aceleracion GPU via CUDA y un entorno conda especifico (`openadmet-models-gpu.yaml`), sin especificar modelos de GPU.
- Cabe en GPU consumer: muy probablemente si, dado el tamano del repositorio, aunque no se confirma explicitamente.
- Opciones de despliegue: framework Anvil de `openadmet-models` (instalacion via conda/pip o clonando el repositorio), imagen Docker `ghcr.io/openadmet/openadmet-models:main` con soporte CPU y GPU (`--runtime=nvidia --gpus all`), y CLI `openadmet predict` con flag `--accelerator` para elegir GPU o CPU.
- Latencia y throughput: no disponible.
- Requisito adicional: `git lfs` para descargar los pesos del repositorio.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El modelo se posiciona como baseline dentro del ecosistema OpenADMET, y la unica referencia comparativa mencionada es el reto OpenADMET-ExpansionRx, sin datos cuantitativos publicados en la informacion disponible.

## Limitaciones y advertencias

- El autor advierte explicitamente que, aunque los datos estan curados, el rendimiento puede mejorar y recomienda proceder con cautela.
- Es un modelo "no split": no se reservaron conjuntos de validacion ni test, por lo que no hay estimaciones de generalizacion publicadas y el riesgo de sobreajuste al set de entrenamiento no esta cuantificado.
- Entrenado exclusivamente sobre datos de ChEMBL; puede no generalizar bien a quimiotipos poco representados o a dominios quimicos fuera de la cobertura de ChEMBL.
- La version v2 excluye datos censurados, lo que cambia el dominio de entrenamiento respecto a la version legacy; los resultados no son directamente comparables entre versiones.
- Las predicciones estan en escala log₁₀ y requieren retransformacion (por ejemplo, `Papp = 10^ŷ * 10^6` para obtener 10⁻⁶ cm/s); un uso incorrecto de las unidades produce errores graves.
- Para PPB, el modelo predice log₁₀ de porcentaje no unido; la conversion a porcentaje unido requiere restar de 100.
- Etiquetado de idioma limitado a `en`; no procesa texto natural, solo SMILES.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrecen garantias de idoneidad para decisiones regulatorias o de desarrollo clinico.
- No sustituye a ensayos experimentales: es una herramienta de priorizacion, no de validacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openadmet/permeability-logd-ppb-chemeleon-baseline
- Commit de actualizacion a v2: https://huggingface.co/openadmet/permeability-logd-ppb-chemeleon-baseline/commit/4750ead01f0a8314d565f347013da74babf3d5c5
- Pagina de datasets y modelos de OpenADMET: https://openadmet.org/datasetsmodels/
- Documentacion de OpenADMET: https://docs.openadmet.org/en/latest/
- Demos de Anvil: https://demos.openadmet.org/en/latest/
- Repositorio openadmet-models: https://github.com/OpenADMET/openadmet-models
- Catalogos de datos OpenADMET: https://github.com/OpenADMET/data-catalogs
- Blog sobre rendimiento zero-shot en ExpansionRx: https://openadmet.ghost.io/zero-shot-expansiorx-admet-predictions/
- Reto OpenADMET-ExpansionRx: https://huggingface.co/spaces/openadmet/OpenADMET-ExpansionRx-Challenge
