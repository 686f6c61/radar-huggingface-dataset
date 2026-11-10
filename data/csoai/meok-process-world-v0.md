# csoai/meok-process-world-v0

## Resumen

MEOK process-world predictor v0 es un modelo experimental de regresion tabular publicado por el usuario csoai en Hugging Face. No es un modelo de lenguaje ni un modelo fundacional de mundo fisico: es un componente neuronal entrenado para predecir el siguiente estado agregado de seleccion de proveedores dentro de un proceso de compras sintetico y declarado. Se deriva del motor de ensayo sintetico Council (repositorio CSOAI-ORG/councilof-ai) y se distribuye como pesos JSON portables, no como pesos de transformer.

El modelo es un perceptron multicapa pequeno (arquitectura 32-16, 980 parametros aprendidos) entrenado sobre 320 episodios sinteticos y 2.560 transiciones generadas por el simulador determinista. La seleccion del candidato final se hizo por MAE de validacion, no por test, y el autor insiste en que el motor determinista original sigue siendo la referencia autoritativa para este dominio.

Su relevancia es metodologica mas que practica: ilustra como combinar una aproximacion aprendida con estructura conocida (proyeccion sobre el simplex y regla de caducidad del permiso de simulacion) y como empaquetar pesos en JSON reproducible sin frameworks de inferencia. No se ha demostrado ventaja de velocidad o precision frente al simulador exacto, y el propio autor lo etiqueta como candidato de investigacion, no apto para decidir acciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) 32-16 sobre features tabulares; pesos exportados en JSON |
| Parametros totales | 980 parametros aprendidos (variante seleccionada mlp-32-16-seed17) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de 11 features tabulares) |
| Tipos de cuantizacion | no disponible (pesos JSON de precision completa; no se documentan cuantizaciones) |
| Idiomas soportados | en (segun model card; el modelo no procesa texto, la etiqueta es administrativa) |
| Licencia | MIT |
| Formato de pesos | JSON portable (weights.json) con verificacion SHA-256 |

## Arquitectura y entrenamiento

La variante seleccionada es una red MLP con capas ocultas de 32 y 16 neuronas y 980 parametros aprendidos, entrenada sobre un vector de 11 features tabulares que describe el estado del proceso de compras sintetico. El autor entreno nueve redes (tamanos ocultos 8, 16 y 32-16, con semillas 7, 17 y 29) y las comparo con Ridge, extra-trees, persistencia, un ensemble de salida y un hibrido restringido, sumando 14 variantes. La seleccion se hizo por MAE de validacion.

Los datos proceden del motor determinista Council fijado en el commit 4070aa6d3140ba10226677840f4873fbedd2467e: 320 episodios sinteticos y 2.560 transiciones, divididas en 200 episodios de entrenamiento (1.600 filas), 50 de validacion (400 filas) y 70 de test retenidos (560 filas). El entrenamiento se ejecuto como job de CPU en Hugging Face. No se usaron pesos preentrenados ni salidas de modelos de terceros. La innovacion tecnica destacable es el hibrido restringido: aplica una regla conocida cuando el permiso de simulacion ha caducado y, en caso contrario, proyecta las predicciones sobre proporciones no negativas que suman uno (simplex). Los pesos exportados se replicaron de forma independiente con la biblioteca estandar de Python sobre las 560 filas de test, rechazando digest incorrecto, entradas malformadas y valores no finitos.

## Capacidades

- Prediccion del siguiente estado agregado de seleccion de proveedores en un proceso de compras sintetico declarado.
- Regresion tabular sobre un vector de 11 features; salida de cuatro componentes de estado.
- Proyeccion de salidas sobre el simplex (proporciones no negativas que suman uno) en la variante hibrida.
- Aplicacion de una regla determinista conocida cuando el permiso de simulacion esta caducado.
- Inferencia sin framework de modelo: ejecucion con Python estandar mediante predict.py y verificacion de integridad SHA-256.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.
- No tiene capacidades multilingues reales; la etiqueta `en` es administrativa.

## Casos de uso

- Estudio metodologico de hibridacion aprendido-estructurado: usar el modelo como ejemplo reproducible de como combinar una red pequena con reglas conocidas y proyeccion sobre el simplex en dominios con restricciones fisicas o logicas.
- Docencia e investigacion en modelos de mundo sinteticos: el par motor determinista mas aproximacion neuronal permite analizar el error de aproximacion frente a la referencia exacta con conjuntos de validacion y test separados.
- Pruebas de reproducibilidad de pipelines de entrenamiento: el flujo train_world.py descarga el motor fijado por commit, genera fixtures sinteticos, entrena los 14 candidatos y exporta pesos con hashes de origen, util como plantilla de trazabilidad.
- Verificacion de integridad de artefactos: el mecanismo de digest SHA-256 y el rechazo de entradas malformadas o no finitas sirven como referencia para validar pesos en despliegues sensibles.
- Simulacion de procesos de compras con fines de ensayo: dentro del dominio sintetico declarado, el modelo puede generar predicciones de estado para escenarios de prueba, siempre con el motor determinista como autoridad.
- Evaluacion de riesgos de aproximaciones neuronales en dominios regulados: el error maximo por componente cercano a 0,75 documentado por el autor es un caso de estudio sobre por que una MAE media baja no implica predicciones individuales fiables.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre las 560 filas de test retenidas (errores como fraccion de poblacion sintetica, promediados sobre cuatro componentes de estado):

| Variante | MAE en test | Peor error absoluto por componente |
|---|---:|---:|
| Neuronal seleccionada (mlp-32-16-seed17) | 0,006131327 | 0,837697423 |
| Neuronal + proyeccion simplex + regla de caducidad conocida | 0,002879733 | 0,749907660 |
| Ensemble de salida de nueve redes | 0,009127069 | 0,357089498 |

No se han publicado comparaciones con modelos de referencia externos ni resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros); no aplican a este dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo son 980 parametros en JSON y se ejecuta en CPU con Python estandar.
- GPU recomendadas: no requiere GPU; el entrenamiento documentado se ejecuto como job de CPU en Hugging Face.
- Cabe en cualquier GPU consumer y en entornos sin GPU; tambien en CPU de un solo nucleo para inferencia.
- Opciones de despliegue: script predict.py con Python 3.12, numpy 2.2.6, scipy 1.15.3 y scikit-learn 1.7.2 para reproduccion del entrenamiento; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: no disponibles; el autor no reporta ventaja de velocidad frente al motor determinista.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (predictores tabulares de estado en procesos sinteticos de compras). Las 14 variantes internas comparadas por el autor (MLP de varios tamanos, Ridge, extra-trees, persistencia, ensemble e hibrido restringido) son alternativas dentro del mismo estudio, no modelos externos publicados de forma independiente.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo no esta cualificado para decidir acciones; el motor determinista exacto sigue siendo la autoridad en este dominio.
- Una MAE media baja no implica predicciones individuales fiables: el hibrido restringido mantiene un peor error por componente cercano a 0,75.
- Usa proporciones de perfil completas del simulador (informacion privilegiada); no se ha probado la generalizacion a observacion parcial, dominio fisico ni dominio de cliente.
- No es un modelo de lenguaje, ni un modelo fundacional de mundo fisico, ni un fine-tuning de NVIDIA Cosmos; no contiene pesos de Cosmos.
- Los permisos del fixture sintetico son controles logicos de simulacion, no aprobaciones humanas autenticadas.
- No se reclama ninguna puntuacion canonica GSPC, credencial de seguridad, resultado de cliente ni resultado fisico fotonic o cuantico.
- Las divisiones de datos y los pesos estan replicados en Hugging Face con la revision de codigo fuente; cualquier optimizacion futura contra el test publicado exige un nuevo conjunto de evaluacion no tocado.
- Licencia MIT: permite uso comercial, pero el caracter experimental y las limitaciones tecnicas desaconsejan su uso en produccion para decisiones reales.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto; el riesgo equivalente es la extrapolacion silenciosa fuera de la distribucion sintetica de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/csoai/meok-process-world-v0
- Dataset de transiciones: https://huggingface.co/datasets/csoai/meok-process-world-transitions-v0
- Codigo fuente canonico (rama del laboratorio): https://github.com/CSOAI-ORG/councilof-ai/tree/1571ac990bb954f37a8e21d7677c11d33172d73b/harness/meok-process-lab
- Repositorio del motor Council (commit de entrenamiento): https://github.com/CSOAI-ORG/councilof-ai/tree/4070aa6d3140ba10226677840f4873fbedd2467e
- Job de entrenamiento en CPU de Hugging Face: csoai/6af27aba9737d9a9e08ea042 (referencia interna de la plataforma, sin URL publica en la informacion disponible)
