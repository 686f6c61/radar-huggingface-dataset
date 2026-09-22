# NewSonnet/cua-s1-forge-rlcd-v3

## Resumen

CUA-S1 Forge RLCD-v3 es un ajuste fino experimental del clasificador abierto CUA-S1, publicado por el usuario NewSonnet en Hugging Face. Se trata de un modelo de clasificacion de texto orientado a computer use (interaccion con interfaces graficas), entrenado con una variante de RLCD que combina tres componentes: recompensa esperada exacta para un verificador one-hot, un ancla de entropia cruzada y ponderacion de acciones por frecuencia inversa aplicada unicamente al termino de recompensa. El objetivo declarado es mejorar la clasificacion de acciones en un agente de computer use sin recurrir a datos privados ni a respuestas de API restringidas.

El modelo es extremadamente pequeno: 706.048 parametros reales (unos 0,7 M) segun los pesos safetensors del repositorio, con un tamano de repo de 0,0 GB. Se distribuye con licencia MIT y la libreria pytorch, y su pipeline declarado es text-classification. La model card no especifica la arquitectura base, la longitud de contexto ni los idiomas soportados, por lo que esos datos quedan como no disponibles.

Su relevancia es fundamentalmente metodologica y de investigacion: documenta un experimento reproducible de alineacion sobre un clasificador pequeno, con resultados de un smoke test determinista de una sola semilla. El propio autor advierte de que no se trata de una afirmacion de capacidad universal y de que no se ha demostrado ninguna mejora de 100x, sino una mejora marginal en top-1 y un empeoramiento del ECE respecto al baseline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador derivado de CUA-S1; la model card no especifica la arquitectura base) |
| Parametros totales | 706.048 (≈0,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria pytorch) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo. Se presenta como un fine-tune conservador y experimental del clasificador abierto CUA-S1, con pipeline de clasificacion de texto y etiqueta de computer use. En consecuencia, no se dispone de informacion sobre el tipo de red (transformer, encoder pequeno u otra), el numero de capas, la dimension oculta ni la ventana de contexto.

En cuanto al entrenamiento, RLCD-v3 utiliza tres elementos descritos explicitamente por el autor: una recompensa esperada exacta para un verificador one-hot, un ancla de entropia cruzada y una ponderacion de acciones por frecuencia inversa que solo se aplica al termino de recompensa. El autor afirma que no se emplearon salidas de Jev/TypeSafe, datos de profesor privados, credenciales ni respuestas de API restringidas. No se indica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron otras tecnicas de alineacion como RLHF o DPO. El codigo reproducible y el informe completo estan en el repositorio EF-Code/cua-s1-forge.

## Capacidades

- Clasificacion de texto orientada a computer use: prediccion del tipo de accion en un contexto de interaccion con interfaz grafica.
- Categorias de accion observadas en la evaluacion: incluye al menos las clases "fill" y "click", ademas de la metrica de exactitud macro de acciones.
- Generacion de puntuaciones de probabilidad por clase, aptas para calcular NLL y ECE (calibracion) en evaluacion.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multilingues.
- No se documentan capacidades especiales como vision, audio o modo de razonamiento (thinking mode).
- El modelo no es generativo en el sentido de un LLM de proposito general: su tarea declarada es la clasificacion.

## Casos de uso

- Preclasificacion de acciones en agentes de computer use: dado un contexto de pantalla o historial, el clasificador puede proponer la siguiente categoria de accion (por ejemplo, fill) como senal auxiliar dentro de un pipeline mayor. Es adecuado por su coste computacional minimo, aunque su exactitud actual limita su uso a tareas de apoyo, no de decision final.
- Enrutado de bajo coste en pipelines de agentes: al tener solo 0,7 M de parametros, puede ejecutarse en CPU para filtrar o priorizar candidatos antes de invocar un modelo mayor y mas caro.
- Anotacion asistida de datasets de interaccion GUI: puede generar etiquetas preliminares de tipo de accion que luego se revisan manualmente, reduciendo el esfuerzo de etiquetado.
- Investigacion reproducible en metodos RLCD: sirve como banco de pruebas para reproducir el esquema de recompensa esperada, ancla de entropia cruzada y ponderacion por frecuencia inversa sobre un modelo pequeno.
- Analisis de calibracion: al reportar NLL y ECE, es util para estudiar como afectan las tecnicas de refuerzo a la calibracion de un clasificador pequeno (en este caso, el ECE empeoro respecto al baseline).
- Auditoria y analisis de logs de acciones: puede clasificar secuencias de acciones registradas para estudiar la distribucion de tipos de accion en un entorno de computer use.
- Docencia y prototipado: su tamano reducido y su licencia MIT permiten usarlo en entornos educativos o pruebas de concepto sin requisitos de hardware relevantes.

## Benchmarks y rendimiento

Los unicos resultados disponibles son los del smoke test determinista sobre la particion smoke-600 (1.821 filas), de una sola semilla, reportados por el autor. Comparan el baseline intacto con RLCD-v3:

| Metrica | Baseline (intacto) | RLCD-v3 | Variacion |
|---|---|---|---|
| Top-1 | 0,516749 | 0,523339 | +0,006590 |
| NLL | 1,671399 | 1,619085 | -0,052314 |
| ECE | 0,035508 | 0,042892 | +0,007384 |
| Exactitud macro de acciones | 0,479940 | 0,487460 | +0,007520 |
| Exactitud de "fill" | 0,012563 | 0,043970 | +0,031407 |
| Exactitud de "click" | 0,0 | 0,0 | 0,0 |

Advertencias del propio autor: son resultados de smoke test de una sola semilla, no constituyen una afirmacion de capacidad universal y no demuestran una mejora de 100x. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB incluso en fp32; con 706.048 parametros el peso en fp32 ronda los 2,8 MB, por lo que la huella de memoria es minima.
- GPU recomendadas: no se especifica ninguna; cualquier GPU moderna es sobredimensionada para este modelo.
- Cabe en GPU de consumo: si, en cualquier GPU consumer e incluso en CPU sin aceleracion relevante.
- Opciones de despliegue: no se documentan opciones oficiales (vLLM, llama.cpp, Ollama, TGI, etc.). Al ser un modelo pytorch con pesos safetensors y pipeline text-classification, el despliegue natural seria via PyTorch, Transformers o una exportacion a ONNX no documentada.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No se proporcionan en la informacion disponible modelos comparables de la misma categoria con datos de parametros, contexto, rendimiento o licencia. El unico punto de referencia documentado es el propio baseline intacto del CUA-S1, incluido en la tabla de benchmarks anterior.

| Modelo | Parametros | Contexto | Rendimiento (top-1, smoke-600) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CUA-S1 Forge RLCD-v3 | 706.048 | no disponible | 0,523339 | MIT | Hugging Face (NewSonnet/cua-s1-forge-rlcd-v3) |
| Baseline CUA-S1 (intacto) | no disponible | no disponible | 0,516749 | no disponible | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Exactitud baja: el top-1 se situa en 0,523339 y la exactitud macro de acciones en 0,487460, valores propios de un experimento exploratorio.
- La exactitud de la clase "click" permanece en 0,0 tanto en el baseline como en RLCD-v3, lo que indica que el modelo no reconoce esa accion.
- Resultados de una sola semilla y de un unico smoke test, por lo que no hay evidencia de generalizacion.
- La calibracion empeora: el ECE sube de 0,035508 a 0,042892, de modo que las probabilidades son menos fiables que en el baseline.
- El autor rechaza explicitamente cualquier interpretacion de mejora de 100x; ese objetivo requeriria definirse sobre una particion reservada con denominador explicito.
- No hay informacion sobre sesgos, idiomas soportados ni comportamiento fuera del dominio de computer use.
- No se documentan limitaciones de longitud de contexto porque no se publica la ventana del modelo.
- Licencia MIT: permite uso comercial, pero al tratarse de un artefacto experimental con exactitud reducida no es apto para produccion sin validacion adicional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa por parte de la comunidad.
- Riesgo de alucinacion no aplicable en sentido estricto por ser un clasificador, pero si existe riesgo de clasificacion erronea sistematica en clases poco representadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NewSonnet/cua-s1-forge-rlcd-v3
- Codigo y informe completo (EF-Code/cua-s1-forge, commit 7eee9fb42f434e03146c6cd339cdb9e4c1d3f1ad): https://github.com/EF-Code/cua-s1-forge/tree/7eee9fb42f434e03146c6cd339cdb9e4c1d3f1ad
- Resultados de la busqueda web: no se han encontrado enlaces relevantes (los resultados devueltos corresponden a Google Translator y no guardan relacion con el modelo).
