# csoai/meok-process-world-partial-v1

## Resumen

MEOK partial-observation process predictor v1 es un modelo de regresión tabular publicado por el usuario csoai en Hugging Face. No es un modelo de lenguaje ni un transformer generativo: es un ensemble de tres perceptrones multicapa (MLP) cuya salida se promedia para predecir las proporciones del siguiente estado agregado en un simulador sintético de procesos de compras (procurement). El modelo se entrena con observación parcial, es decir, sin acceso a las proporciones completas del perfil oculto que el simulador utiliza internamente.

El modelo resuelve un problema acotado de predicción de transiciones de estado en un entorno sintético determinista. Recibe doce entradas (dos agregados de estado de cuatro dimensiones correspondientes a los dos pasos previos, un indicador de revocación, los ticks hasta la expiración del permiso normalizados, y un indicador de modo de política junto con el tick normalizado) y produce cuatro salidas que representan las proporciones del siguiente estado agregado. Se distribuye con un script `predict.py` de inferencia sin dependencias y un bundle reproducible con los pesos, las particiones de datos y los tests.

Es relevante únicamente como artefacto de investigación sobre modelos de proceso con observación parcial y como ejemplo de evaluación honesta: el autor documenta explícitamente que un comparador con entradas privilegiadas obtiene un MAE mucho menor, que la política de router de especialistas fue probada y rechazada, y que el modelo no debe usarse para decisiones reales. No tiene capacidades de lenguaje, visión ni agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de tres MLP (promedio de salidas, sin fusión de pesos) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada fija de 12 características tabulares) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | no disponible (el bundle se distribuye como MEOK-PARTIAL-OBSERVATION-V1.zip) |

## Arquitectura y entrenamiento

La arquitectura es un ensemble de tres redes MLP independientes cuyas predicciones se promedian en la salida (output ensemble), sin combinación de pesos. El autor probó y descartó un router de política de especialistas porque rendía peor. El espacio de entrada es de doce dimensiones: agregado de estado de cuatro estados en el paso previo, agregado de estado de cuatro estados en el paso anterior a ese, indicador de revocación, ticks hasta la expiración del permiso divididos por ocho, indicador de modo de política y tick dividido por ocho. La salida son cuatro proporciones del siguiente estado agregado.

El entrenamiento se realizó sobre episodios sintéticos frescos de procesos de compras generados por un simulador determinista, sin las proporciones completas del perfil oculto (observación parcial). El conjunto de test reservado contiene 560 filas de 70 identificadores de episodio (1250–1319) y la selección del modelo se hizo solo sobre validación. No se documentan en la información disponible el número de tokens, la composición detallada del dataset ni el uso de RLHF o DPO, que no aplican a este tipo de modelo. Como innovación destacable, el autor incorpora reglas de simplex y de expiración sobre la salida del ensemble, y documenta que la regla de expiración consigue error cero en filas expiradas porque es una regla conocida, no comportamiento aprendido.

## Capacidades

- Predicción de la siguiente distribución de estado agregado (cuatro proporciones) a partir de doce características tabulares.
- Inferencia sin dependencias mediante `predict.py`, que devuelve salidas crudas y salidas restringidas por reglas con un marcador de autoridad explícito `NONE`.
- Aplicación de reglas de simplex y de expiración sobre la salida del ensemble.
- Evaluación reproducible sobre un conjunto de test reservado con identificadores de episodio documentados.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No tiene visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Investigación sobre modelos de proceso con observación parcial: sirve como referencia reproducible para estudiar cuánto se degrada la predicción cuando se eliminan del input las proporciones ocultas del perfil, comparando el MAE de 0.0188549 del ensemble con el 0.0016888 del comparador privilegiado v0.
- Reproducción de experimentos: el bundle MEOK-PARTIAL-OBSERVATION-V1.zip incluye pesos, particiones de datos y tests, lo que permite replicar la evaluación sobre las 560 filas de test de los episodios 1250–1319.
- Docencia y divulgación sobre ensembles: el modelo ilustra el promedio de salidas de tres MLP frente a la fusión de pesos y documenta el rechazo empírico de un router de especialistas por peor rendimiento.
- Validación de pipelines de inferencia tabular: `predict.py` permite integrar el modelo en un flujo sin dependencias y verificar la salida cruda frente a la restringida por reglas.
- Estudio de reglas híbridas aprendizaje-reglas: la combinación de ensemble con reglas de simplex y expiración permite analizar la contribución de cada componente al MAE final.
- Demostración interactiva en navegador: la demo estática en hf.space permite explorar el comportamiento del predictor sin instalar nada, útil para presentaciones técnicas.

## Benchmarks y rendimiento

| Modelo | Configuración | MAE (test reservado) |
|---|---|---|
| Ensemble de tres MLP + reglas simplex/expiración | Observación parcial | 0.0188549 |
| Mejor MLP único + reglas simplex/expiración | Observación parcial | 0.0234502 |
| Persistencia (baseline) | Observación parcial | 0.0613514 |
| Modelo v0 con entradas privilegiadas + reglas | Perfil oculto completo (no comparable) | 0.0016888 |

El test reservado contiene 560 filas de 70 episodios (1250–1319). El peor error por componente en el conjunto reservado supera 0.52. El autor indica que el comparador v0 no es una comparación equivalente porque ve tres proporciones adicionales del perfil oculto.

## Requisitos de hardware

- Inferencia en CPU: el modelo es un ensemble de tres MLP tabulares y `predict.py` es una implementación sin dependencias, por lo que la inferencia cabe en CPU sin requisitos de VRAM.
- VRAM estimada para GPU: no disponible; el tamaño del repositorio es de 0.0 GB y no se documentan requisitos de memoria.
- GPU recomendadas: no disponible; no se justifica el uso de GPU para un modelo de este tamaño.
- Compatibilidad con GPU de consumo: no disponible; no se documenta.
- Opciones de despliegue: `predict.py` incluido en el bundle; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo tabular.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas | MAE | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MEOK partial-observation v1 | Ensemble de 3 MLP + reglas | 12 características (observación parcial) | 0.0188549 | MIT | Hugging Face |
| MEOK v0 (comparador del autor) | MLP + reglas | Entradas privilegiadas con perfil oculto | 0.0016888 | no disponible | no disponible |
| Persistencia | Baseline trivial | Estado previo | 0.0613514 | no aplica | no aplica |

No se dispone de información sobre otros modelos comparables de la misma categoría (predictores de proceso tabulares con observación parcial) en la información proporcionada.

## Limitaciones y advertencias

- Es un simulador sintético determinista de procesos de compras; no es un modelo del mundo físico, ni un modelo de mercado real, ni un agente de propósito general, ni un sistema de acción autónoma.
- No debe usarse para decisiones reales ni para afirmar capacidades del mundo real, según indica el propio autor.
- El peor error por componente en el conjunto reservado supera 0.52, lo que indica que algunas componentes de la salida no son fiables.
- La regla de expiración consigue error cero en filas expiradas porque es una regla conocida, no comportamiento aprendido; no debe interpretarse como capacidad del modelo.
- El comparador v0 con entradas privilegiadas obtiene un MAE mucho menor (0.0016888 frente a 0.0188549), lo que evidencia la pérdida de rendimiento por observación parcial.
- El router de especialistas fue probado y rechazado por peor rendimiento; no se recomienda reintroducirlo sin evidencia nueva.
- No se documentan sesgos conocidos, riesgo de alucinación en el sentido de modelos generativos, ni restricciones de licencia para uso comercial más allá de la licencia MIT.
- No se documentan limitaciones de contexto ni de idioma porque el modelo no procesa texto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso externo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/csoai/meok-process-world-partial-v1
- Dataset de transiciones: https://huggingface.co/csoai/meok-process-world-partial-transitions-v1
- Demo interactiva en navegador: https://csoai-meok-oowm-hybrid-lab.static.hf.space/partial-observation-v1/index.html
- Bundle reproducible (pesos, datos y tests): https://huggingface.co/csoai/meok-process-world-partial-v1/resolve/main/MEOK-PARTIAL-OBSERVATION-V1.zip
- Fuente canónica y CI: https://github.com/CSOAI-ORG/councilof-ai/pull/4285
