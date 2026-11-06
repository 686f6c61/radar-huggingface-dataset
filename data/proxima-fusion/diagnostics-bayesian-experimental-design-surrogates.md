# proxima-fusion/diagnostics-bayesian-experimental-design-surrogates

## Resumen

Los surrogates de equilibrio MHD de `proxima-fusion/diagnostics-bayesian-experimental-design-surrogates` son modelos neuronales que aproximan el equilibrio de contorno fijo calculado con DESC para una configuracion de stellarator cuasi-isodinamica (NFP = 3, simetria estelar, escalada a B0 = 1 T). A partir de un perfil de presion evaluado en 99 nudos de spline, predicen los coeficientes de Fourier-Zernike `R_lmn`, `Z_lmn` y `lambda_lmn`, la transformada rotacional `iotaf` y el flujo toroidal `Psi`. Sustituyen asi una resolucion numerica iterativa de equilibrio por una evaluacion directa de red neuronal, lo que abarata el muestreo intensivo que exige el diseno experimental bayesiano de diagnostico de plasma.

El modelo lo desarrolla el autor `proxima-fusion` en el marco del Trabajo de Fin de Master *Bayesian Experimental Design of Fusion Plasma Diagnostics with Self-Consistent MHD Equilibria* (Universidad Tecnica de Munich, 2026), firmado por Matilde Valente. Se publican dos variantes de MLP en Flax/JAX: una entrenada solo con perdida de datos (1101 epocas) y la variante por defecto, que anade 2000 epocas optimizando unicamente el residuo de fuerza de DESC. Ambas comparten arquitectura: 3 capas ocultas de 512 unidades con activacion leaky ReLU y 1.214.684 parametros.

La relevancia es acotada pero clara: no es un modelo de lenguaje, sino un componente de un pipeline cientifico para stellarators. Su publicacion como pesos `.npz` con preprocesado y base PCA incluidos permite reproducir el flujo completo de inferencia sin reentrenar, y su licencia CC BY 4.0 facilita la reutilizacion academica. El repositorio esta vacio (0.0 GB) en el momento de la consulta, lo que limita su uso efectivo hasta que se suban los artefactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (Flax/JAX): 3 capas ocultas de 512, activacion leaky ReLU, entrada 99, salida 1244 coeficientes PCA |
| Parametros totales | 1.214.684 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de regresion sobre vector de 99 valores) |
| Tipos de cuantizacion | no disponible (pesos en `.npz` de precision nativa) |
| Idiomas soportados | en (documentacion y metadatos; el modelo no procesa lenguaje) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `.npz` (pesos, preprocesado y base PCA) + `.json` (arquitectura, curriculum y registro de entrenamiento) |

## Arquitectura y entrenamiento

Cada modelo es un perceptron multicapa implementado en Flax que mapea el perfil de presion en los 99 nudos del spline a 1244 coeficientes PCA, que a su vez reconstruyen el vector objetivo de 2955 componentes `[R_lmn | Z_lmn | lambda_lmn | iotaf | Psi]`. La reduccion mediante PCA es el mecanismo que hace tratable la regresion: en lugar de predecir directamente miles de coeficientes de Fourier-Zernike correlacionados, la red opera en un espacio latente de menor dimension y la base PCA incluida en el `.npz` permite la reconstruccion. La activacion es leaky ReLU en las tres capas ocultas de 512 unidades.

El entrenamiento sigue dos curriculums documentados. La variante `20260907_081512_mlp_data_fnorm_only_pca_hand_tuned` entrena primero con perdida de datos durante 1101 epocas y despues solo con el residuo de fuerza de DESC durante 2000 epocas adicionales, lo que incorpora la fisica del equilibrio como regularizador final; es el surrogate por defecto del codigo de la tesis. La variante `20260908_141134_mlp_data_pca_hand_tuned` se limita a la perdida de datos durante 1101 epocas. Los hiperparametros se ajustaron manualmente ("hand_tuned"). El repositorio incluye en `models_training/<name>/` el historial por epoca y el resumen por etapa, lo que permite auditar la convergencia. No se documenta el numero de muestras de entrenamiento ni la composicion exacta del dataset mas alla de su publicacion separada.

## Capacidades

- Regresion de equilibrio MHD: dado un perfil de presion, predice coeficientes `R_lmn`, `Z_lmn`, `lambda_lmn`, `iotaf` y `Psi` de un stellarator cuasi-isodinamico con NFP = 3.
- Evaluacion rapida sustitutiva: reemplaza la resolucion iterativa de DESC por una pasada forward de 1,2 M de parametros.
- Reconstruccion via PCA: la base incluida permite recuperar el vector objetivo completo de 2955 componentes.
- Regularizacion fisica: la variante por defecto incorpora el residuo de fuerza de DESC en el entrenamiento, orientando las predicciones hacia equilibrios fisicamente consistentes.
- Integracion en pipelines bayesianos: pensado como bloque de muestreo dentro de un diseno experimental bayesiano de diagnostico de plasma.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto; es un modelo numerico de dominio especifico.
- Multilingue: no aplica; los metadatos declaran unicamente `en`.

## Casos de uso

- Diseno bayesiano de diagnosticos: el surrogate sustituye a DESC dentro del bucle de inferencia baymana, permitiendo evaluar miles de configuraciones de diagnostico en el tiempo que costaria un puñado de equilibrios completos.
- Exploracion de espacio de parametros de presion: barrido de perfiles de presion para caracterizar la respuesta del equilibrio sin coste iterativo, util para identificar regiones de interes antes de simulaciones de alta fidelidad.
- Generacion de datasets aumentados: producir pares (perfil de presion, equilibrio) etiquetados de forma aproximada para preentrenar o validar otros surrogates.
- Prototipado de control y escenarios: estimacion rapida de `iotaf` y `Psi` para evaluar la viabilidad de escenarios operativos en el stellarator antes de campanas costosas.
- Validacion de codigo de equilibrio: comparar predicciones del surrogate con salidas de DESC en puntos de control para detectar discrepancias sistematicas en la parametrizacion.
- Docencia y reproduccion: al incluir pesos, preprocesado, base PCA y curriculum en el repositorio, sirve como ejemplo reproducible de surrogate fisico con regularizacion por residuo de fuerza.
- Acoplamiento con analisis de incertidumbre: al ser una red pequena, se puede muestrear con tecnicas de ensembles o MC-dropout para propagar incertidumbre al diseno experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de error (RMSE, error relativo en `iotaf` o `Psi`, residuo de fuerza final) ni comparaciones con DESC u otros surrogates.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en inferencia; con 1.214.684 parametros en float32 el peso ronda los 5 MB, y el cuello de botella es la base PCA y el preprocesado, no la red.
- GPU recomendadas: cualquier GPU con soporte JAX/CUDA; una RTX 4090 o A100 estan sobredimensionadas para este modelo. Una GPU integrada o incluso CPU es suficiente para inferencia por lotes.
- Cabe en cualquier GPU consumer, incluida una GTX 1650 o una iGPU con 4 GB compartidos.
- Opciones de despliegue: JAX/Flax nativo (carga via `model_storage_utils.load_mlp_model` del repositorio de codigo); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano, se espera latencia de microsegundos a milisegundos por muestra en GPU y de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada surrogates comparables de equilibrio MHD para stellarators con arquitectura, tamano y licencia documentados de forma equiparable.

## Limitaciones y advertencias

- Dominio muy restringido: solo valido para la configuracion concreta (NFP = 3, simetria estelar, B0 = 1 T) y la parametrizacion de presion del dataset de entrenamiento; extrapolar a otras configuraciones no esta justificado.
- Repositorio vacio en la fecha de consulta (0.0 GB): los pesos `.npz` y los `.json` no estan disponibles para descarga, lo que impide su uso efectivo hasta que se suban los artefactos.
- Sin metricas de error publicadas: no se puede evaluar la fidelidad del surrogate frente a DESC sin ejecutar la validacion por cuenta propia.
- Riesgo de predicciones fisicamente inconsistentes fuera de la distribucion de entrenamiento; la variante solo-datos no incorpora el residuo de fuerza y puede producir equilibrios menos consistentes.
- Sesgos: dependen del muestreo del dataset de entrenamiento, no documentado en detalle en la model card; posibles sesgos hacia la region del espacio de presiones sobrerrepresentada.
- Licencia CC BY 4.0: permite uso comercial con atribucion, pero exige citar la tesis y el modelo; verificar compatibilidad con licencias de DESC y del codigo asociado.
- Sin soporte de cuantizacion documentado; el formato `.npz` requiere el codigo del autor para cargar preprocesado y base PCA, lo que ata el uso a su repositorio.
- Idioma: metadatos solo en `en`; la documentacion tecnica no esta traducida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/proxima-fusion/diagnostics-bayesian-experimental-design-surrogates
- Dataset de entrenamiento: https://huggingface.co/datasets/proxima-fusion/diagnostics-bayesian-experimental-design-datasets
- Codigo: https://github.com/matildevalente-pf/diagnostics_bayesian_experimental_design
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
