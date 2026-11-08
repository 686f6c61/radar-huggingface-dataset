# int-brain-lab/ea-encoder-unit

## Resumen

`ea-encoder-unit` es un modelo científico desarrollado por el International Brain Laboratory (IBL) que predice la composición de tipos neuronales esperada en una posición concreta del cerebro de ratón, junto con el fenotipo de forma de onda asociado. Forma parte de ELECTRA (Electrophysiological Reference Atlas), un atlas de referencia electrofisiológico que conecta registros de Neuropixels con la anatomía molecular y celular del Allen Brain Atlas. No es un modelo de lenguaje: es un codificador probabilístico de unidades neuronales.

La entrada del modelo es una coordenada estereotáxica `(x, y, z)` en el marco de referencia IBL/Allen, expresada en metros. A partir de esa posición, el modelo devuelve la mezcla local de tipos celulares putativos y las características de forma de onda esperadas en ese punto. El modelo se entrenó sobre 70.564 unidades spike-sorted del release de datos IBL `2026_W41`.

Técnicamente combina cuatro etapas: un autoencoder multimodal que embebe forma de onda multicanal, autocorrelograma 3D y acoplamiento poblacional en un latente de 60 dimensiones; una mezcla gaussiana jerárquica con 30 tipos celulares putativos divididos en hasta 10 subtipos cada uno (300 en total); dos redes que condicionan los pesos de la mezcla al contexto molecular y celular de la posición; y un readout de 10 características interpretables de forma de onda. El repositorio ocupa 0,7 GB y se distribuye bajo licencia CC-BY-4.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de cuatro etapas: autoencoder multimodal + mezcla gaussiana jerárquica + redes de contexto + readout de miembros |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (la entrada es una posición 3D, no una secuencia de texto) |
| Tipos de cuantización | no disponible (pesos en `autoencoder.pt` y `context_weights_*.pt`, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no aplica (modelo científico, sin capacidades lingüísticas) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (`.pt`), joblib (`.joblib`), NumPy (`.npy`, `.npz`) |

Otras especificaciones relevantes:

| Parámetro | Valor |
|---|---|
| Dimensión del latente | 60 |
| Tipos celulares putativos | 30 |
| Subtipos por tipo | hasta 10 (300 en total) |
| Características de forma de onda de salida | 10 |
| Unidades de entrenamiento | 70.564 |
| Release de datos | IBL `2026_W41` |
| Tamaño del repositorio | 0,7 GB |
| Librería | PyTorch |
| Versión del modelo | 0.0.1 |

## Arquitectura y entrenamiento

El modelo se organiza en cuatro etapas encadenadas. La primera es un autoencoder multimodal que recibe tres modalidades por unidad: la forma de onda multicanal, el autocorrelograma 3D (ACG) y el acoplamiento poblacional (STPC, spike-triggered population coupling). El encoder proyecta estas tres señales a un latente compartido de 60 dimensiones que el autor denomina fenotipo de la unidad. La segunda etapa ajusta una mezcla gaussiana jerárquica sobre los latentes estandarizados, con 30 tipos putativos y hasta 10 subtipos por tipo. La asignación es top-down: primero se elige el tipo más probable y después el subtipo más probable dentro de ese tipo, garantizando que el subtipo asignado siempre pertenezca al tipo.

La tercera etapa introduce el condicionamiento espacial. Dos redes predicen, a partir del contexto molecular y celular en la posición consultada (volúmenes PCA de los atlas molecular y celular de Allen), los pesos de los tipos y la proporción de subtipos dentro de cada tipo. La cuarta etapa es un readout de miembros: cada subtipo queda representado por sus unidades de entrenamiento, ponderadas por la posterior del subtipo, y se mapea a 10 características interpretables de forma de onda (`depolarisation_slope`, `recovery_slope`, `repolarisation_slope`, `spatial_spread_um`, `tip_val`, `spike_width_secs`, `predepolarisation_width_secs`, `spike_amplitude`, `peak_to_trough_ratio_log`, `polarity`).

El entrenamiento se realizó sobre 70.564 unidades spike-sorted del release IBL `2026_W41`. El repositorio incluye `split.json` con la partición de sondas, `config.json` con la configuración de entrenamiento, `preprocessing/unit_stats.npz` con estadísticas de los datos y `results/` con resúmenes de evaluación en held-out. No se especifica en la información disponible el número de tokens ni si hubo etapas de RLHF o DPO, algo que no aplica a este tipo de modelo. Los volúmenes de contexto molecular (`agea_vol_pca.npy`) y celular (`merfish_vol_pca.npy`) son congelados y compartidos con el modelo de nivel de canal `ea-encoder-channel` del mismo release.

## Capacidades

- Predicción de la composición de tipos celulares putativos en una posición 3D del cerebro de ratón, mediante `mixture_weights(df, level="type")`.
- Predicción de la composición de subtipos dentro de cada tipo, mediante `mixture_weights(df)`.
- Predicción del fenotipo esperado de forma de onda en una posición, con 10 características interpretables, mediante `predict(df)`.
- Muestreo de unidades de entrenamiento representativas en una posición, mediante `sample(df, n_samples=16)`.
- Embedding de unidades propias del usuario a partir de forma de onda, ACG y STPC, mediante `encode(waveform, acg, stpc)`.
- Asignación de unidades propias a un tipo y subtipo putativos, mediante `assign(z)`.
- Autoverificación de la instalación mediante `selftest()`, que reproduce las salidas publicadas sin necesidad de cuenta IBL.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión, audio ni generación de texto: es un modelo científico de regresión y clasificación probabilística.

## Casos de uso

- Planificación de experimentos de Neuropixels: antes de implantar una sonda, el investigador consulta `mixture_weights` en las coordenadas de interés para estimar qué tipos celulares esperar y ajustar el diseño experimental o la profundidad de la sonda.
- Validación de registros: tras un registro real, se comparan las formas de onda observadas con las predichas por `predict` en la posición de la sonda; desviaciones grandes pueden indicar problemas de posicionamiento o de spike sorting.
- Anotación asistida de unidades: `encode` + `assign` permiten etiquetar unidades propias con un tipo y subtipo putativos, acelerando la curaduría manual en pipelines de análisis.
- Análisis de composición regional: `mixture_weights` sobre una rejilla de posiciones genera mapas de composición celular a lo largo de una estructura, útiles para estudios comparativos entre regiones o entre animales.
- Búsqueda de unidades representativas: `sample` devuelve unidades de entrenamiento reales en una posición, lo que facilita seleccionar ejemplos canónicos para figuras, tutoriales o comparaciones morfológicas.
- Integración con atlas anatómicos: al usar el marco de referencia Allen CCF, las predicciones se pueden superponer directamente sobre atlas anatómicos existentes en flujos de trabajo de neuroinformática.
- Reproducibilidad de publicaciones: la revisión inmutable `0.0.1` y `selftest()` permiten que terceros verifiquen resultados publicados con ELECTRA sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye un directorio `results/` con resúmenes de evaluación en held-out, pero los valores concretos no se detallan en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio completo ocupa 0,7 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con al menos 4 GB de VRAM.
- La primera ejecución descarga el volumen Allen CCF (público, sin cuenta, unos cientos de MB) y requiere espacio en disco adicional.
- GPU recomendadas: cualquier GPU con soporte CUDA; el modelo es pequeño y no requiere A100 ni H100. Una RTX 3060 o superior es más que suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más de VRAM; también puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: el paquete `ephysatlas` con `load_pretrained`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `int-brain-lab/ea-encoder-unit` | Autoencoder + GMM jerárquica + contexto | Posición 3D | Composición de tipos/subtipos y fenotipo de forma de onda | CC-BY-4.0 | Hugging Face |
| `int-brain-lab/ea-encoder-channel` | Modelo de nivel de canal (misma familia ELECTRA) | no disponible en detalle | no disponible en detalle | CC-BY-4.0 | Hugging Face |
| `int-brain-lab/ea-decoder-channel-xgboost` | XGBoost | Canales de Neuropixels | Clasificación de región cerebral | CC-BY-4.0 | Hugging Face |

No se dispone de información sobre otros modelos comparables de codificación de unidades neuronales a nivel de posición en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con datos de ratón del release IBL `2026_W41`; no se garantiza su validez en otras especies ni en otros protocolos de registro.
- Las predicciones son probabilísticas y dependen de la calidad del spike sorting subyacente; unidades mal aisladas pueden producir embeddings poco fiables.
- La asignación top-down a tipos y subtipos impone una jerarquía fija; unidades que no encajan bien en ninguno de los 30 tipos putativos pueden quedar forzadas a la categoría más cercana.
- El readout de miembros se basa en unidades de entrenamiento ponderadas por posterior; posiciones con pocas unidades de entrenamiento cercanas pueden tener menor fiabilidad.
- La primera ejecución descarga el volumen Allen CCF, lo que requiere conectividad y espacio en disco; entornos sin red pueden necesitar aprovisionamiento previo.
- El modelo no incluye el dataset por unidad (formas de onda, ACGs, posiciones), que permanece en IBL S3 y solo es necesario para reentrenar o reproducir análisis a escala de atlas.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero exige citar ELECTRA, el modelo `int-brain-lab/ea-encoder-unit` versión `0.0.1` y el release `2026_W41`.
- No se han publicado resultados de benchmarks en la información disponible, por lo que no es posible comparar su rendimiento cuantitativo con alternativas.
- El modelo no es un modelo de lenguaje y no debe usarse para tareas de NLP, generación de texto ni razonamiento general.

## Enlaces

- Hugging Face: https://huggingface.co/int-brain-lab/ea-encoder-unit
- Organización IBL en Hugging Face: https://huggingface.co/int-brain-lab
- Listado de modelos IBL: https://huggingface.co/int-brain-lab/models
- Modelo relacionado `ea-decoder-channel-xgboost`: https://huggingface.co/int-brain-lab/ea-decoder-channel-xgboost/tree/main
- International Brain Laboratory: https://www.internationalbrainlab.com/
