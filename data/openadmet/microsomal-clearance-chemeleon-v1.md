# openadmet/microsomal-clearance-chemeleon-v1

## Resumen

`openadmet/microsomal-clearance-chemeleon-v1` es un modelo de predicción de propiedades farmacocinéticas desarrollado por OpenADMET, una organización centrada en herramientas abiertas para el descubrimiento de fármacos. El modelo estima el aclaramiento intrínseco microsómico hepático (CLint) en tres especies: humano (HLM), rata (RLM) y ratón (MLM). La salida es log₁₀(CLint), con los valores escalados a aclaramiento in vivo. No es un modelo de lenguaje: es un modelo de regresión multitarea sobre representaciones moleculares.

Técnicamente se apoya en CheMeleon como inicialización de pesos y en la arquitectura ChemProp para el featurizado y la cabeza de predicción. Se trata de un modelo multitarea con tres tareas (una por especie), una FFN de 3 capas de anchura 512 y dropout de 0,25. El repositorio ocupa aproximadamente 0,2 GB y se distribuye bajo licencia Apache 2.0.

Su relevancia actual radica en que incorpora datos de dos retos ciegos de la comunidad (ASAP-Polaris y ExpansionRx) además del catálogo de microsomas de ChEMBL35, lo que según el autor mejora de forma notable las predicciones frente al modelo baseline entrenado solo con ChEMBL. Es una pieza útil para equipos de química medicinal que necesitan priorizar compuestos por su estabilidad metabólica antes de sintetizarlos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ChemProp (MPNN) con featurizador `ChemPropFeaturizer` y cabeza FFN de 3 capas, anchura 512, dropout 0,25; inicializada desde pesos CheMeleon |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de regresión molecular, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta de idioma del repositorio; el modelo no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 0,2 GB gestionado por `openadmet-models`) |

## Arquitectura y entrenamiento

El modelo es un regresor multitarea construido sobre ChemProp, una red neuronal de paso de mensajes (message passing neural network) para moléculas. La entrada se procesa con `ChemPropFeaturizer` con normalización por tarea, y la salida pasa por una FFN de 3 capas de anchura 512 con dropout de 0,25. La inicialización parte de los pesos de CheMeleon (`from_chemeleon: true`), un modelo preentrenado que aporta representaciones moleculares transferibles. Se entrenan tres tareas simultáneas: HLM, RLM y MLM.

Los datos provienen de tres fuentes: el catálogo de microsomas ChEMBL35 (escalado), los datos del reto ASAP-Polaris y los datos del reto ExpansionRx. El conjunto de entrenamiento contiene 5.086 compuestos. El split es `ShuffleSplitter` con `train_size: 1.0` y `random_state: 42`, es decir, un modelo sin partición de validación ni test: se entrena con todos los datos disponibles. Todas las etiquetas CLint se transforman logarítmicamente y se escalan a aclaramiento in vivo. El entrenamiento se realizó con `openadmet-models` mediante la herramienta `openadmet anvil`. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineación, algo esperable al no tratarse de un modelo generativo.

## Capacidades

- Predicción de aclaramiento intrínseco microsómico (log₁₀ CLint) para tres especies: humano (HLM), rata (RLM) y ratón (MLM).
- Modelo multitarea: una única inferencia devuelve las tres predicciones por compuesto.
- Trabaja con valores escalados a aclaramiento in vivo, lo que exige verificar que las etiquetas de entrada sean coherentes con esa escala.
- Integración con el ecosistema `openadmet-models` y la CLI `openadmet anvil`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de visión, audio ni modo de pensamiento.
- No es un modelo de propósito general: su dominio es la predicción ADMET sobre moléculas pequeñas.

## Casos de uso

- Priorización temprana en descubrimiento de fármacos: dado un conjunto de candidatos, predecir CLint en HLM, RLM y MLM para descartar compuestos con aclaramiento excesivamente alto antes de sintetizarlos, reduciendo coste experimental.
- Filtrado de librerías virtuales: aplicar el modelo por lotes sobre catálogos de compuestos para ordenar por estabilidad metabólica esperada y seleccionar los candidatos a ensayar in vitro.
- Traducción entre especies en estudios preclínicos: comparar las predicciones HLM, RLM y MLM de un mismo compuesto para anticipar diferencias de aclaramiento entre humano y modelos animales.
- Triaje antes de ensayos de microsomas: usar la predicción como estimación previa y reservar los ensayos de laboratorio para los compuestos con mayor incertidumbre o mayor potencial.
- Análisis de series químicas: evaluar cómo varía el CLint predicho a lo largo de una serie de análogos para guiar la optimización de la estabilidad metabólica.
- Integración en pipelines internos de quimioinformática mediante `openadmet-models`, incorporando la predicción como un paso más del flujo de evaluación ADMET junto a otros modelos de la misma familia.

## Benchmarks y rendimiento

El autor publica gráficas de regresión (predicho frente a observado) sobre el conjunto de test del reto ExpansionRx, comparando el modelo baseline entrenado solo con ChEMBL frente al modelo actualizado entrenado con ChEMBL, ASAP-Polaris y el conjunto de entrenamiento de ExpansionRx. Se muestran resultados para HLM y MLM, y se indica una mejora considerable en ambos casos. RLM no se compara porque no se generó una comparación retenida para ese conjunto. No se proporcionan métricas numéricas (R², RMSE, MAE) en la información disponible.

| Benchmark | Modelo baseline (solo ChEMBL) | Modelo v1 | Métrica numérica |
|---|---|---|---|
| ExpansionRx test, HLM | gráfica de regresión publicada | gráfica de regresión publicada, mejora cualitativa | no disponible |
| ExpansionRx test, MLM | gráfica de regresión publicada | gráfica de regresión publicada, mejora cualitativa | no disponible |
| ExpansionRx test, RLM | no evaluado | no evaluado | no disponible |

Advertencia del autor: el modelo publicado se entrenó con **todos** los datos de ExpansionRx (entrenamiento y test); para el benchmark se entrenó un modelo análogo que excluye únicamente el conjunto de test.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0,2 GB y el modelo es una MPNN de tamaño reducido, por lo que la inferencia debería caber en GPU de consumo, aunque no se publican cifras.
- GPU recomendadas: no disponible. El autor menciona soporte de aceleración por GPU en el entorno `openadmet-models` sin especificar modelos concretos.
- GPU de consumo: previsiblemente viable dada la escala del repositorio, pero no confirmado en la documentación disponible.
- Despliegue: entorno conda `openadmet-models` con la CLI `openadmet anvil`; también es posible clonar el repositorio de GitHub e instalarlo en modo editable. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Especies | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microsomal-clearance-chemeleon-v1 | CLint microsómico | HLM, RLM, MLM | ChEMBL35 + ASAP-Polaris + ExpansionRx (5.086 compuestos) | Apache 2.0 | Hugging Face |
| Baseline CheMeleon multitarea (solo ChEMBL) | CLint microsómico | HLM, RLM, MLM | ChEMBL35 | no disponible | citado como referencia en la model card |
| Otros modelos ADMET públicos | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible no permite comparar con alternativas externas de la misma categoría (por ejemplo, modelos ADMET de otras organizaciones) en parámetros, contexto o rendimiento numérico.

## Limitaciones y advertencias

- El autor advierte explícitamente de que, pese a la curación de datos, el rendimiento puede mejorar y debe procederse con cautela en producción.
- Modelo sin split: entrenado con el 100 % de los datos, sin conjunto de validación ni test propio. Las métricas publicadas provienen de un modelo análogo, no del modelo distribuido.
- Riesgo de fuga de datos en la evaluación: el modelo liberado ha visto los datos de test de ExpansionRx.
- Escala de las etiquetas: las predicciones están en log₁₀(CLint) escalado a aclaramiento in vivo; usar valores in vitro sin transformar produce predicciones incorrectas.
- Cobertura desigual: RLM es una tarea entrenada pero no se ha benchmarkeado con datos retenidos.
- Dominio limitado a moléculas pequeñas y a microsomas hepáticos; no extrapola a otros endpoints ADMET ni a otras especies.
- No se documentan análisis de sesgo, calibración de incertidumbre ni intervalos de confianza.
- Licencia Apache 2.0: permite uso comercial y modificación, con las obligaciones habituales de atribución y aviso de cambios.
- Solo etiquetado para inglés; el modelo no procesa lenguaje natural, por lo que esta etiqueta es meramente administrativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openadmet/microsomal-clearance-chemeleon-v1
- Árbol de archivos del repositorio: https://huggingface.co/openadmet/microsomal-clearance-chemeleon-v1/tree/main
- Catálogo ChEMBL35 de microsomas: https://github.com/OpenADMET/data-catalogs/tree/main/catalogs/activities/ChEMBL_Microsomal/ChEMBL35_Microsome/scaled
- Dataset ASAP-Polaris: https://huggingface.co/datasets/openadmet/ASAP_Polaris_OpenADMET_challenge
- Dataset ExpansionRx: https://huggingface.co/datasets/openadmet/openadmet-expansionrx-challenge-data
- Paper del reto ASAP-Polaris: https://pubs.acs.org/doi/10.1021/acs.jcim.5c02106
- Blog sobre el reto ExpansionRx: https://openadmet.ghost.io/lessons-learned-from-the-openadmet-expansionrx-blind-challenge/
- Blog sobre datos de aclaramiento microsómico: https://openadmet.ghost.io/a-hot-fresh-new-clearance-model-2/
- Documentación de OpenADMET: https://docs.openadmet.org/en/latest/
- Demos de Anvil: https://demos.openadmet.org/en/latest/
- Repositorio `openadmet-models`: https://github.com/OpenADMET/openadmet-models
