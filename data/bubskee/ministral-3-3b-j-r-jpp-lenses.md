# bubskee/ministral-3-3b-j-r-jpp-lenses

## Resumen

Este repositorio no contiene un modelo de lenguaje generativo, sino un conjunto de lentes de interpretabilidad (workspace lenses) adaptadas al modelo base mistralai/Ministral-3-3B-Instruct-2512-BF16. Las lentes J, R y J++ son pequenas matrices FP32, una por capa ajustada, que proyectan activaciones internas del transformer al espacio de coordenadas de la capa final y, mediante la cabeza de vocabulario nativa, producen una lista ordenada de tokens candidatos. El autor, bubskee, las publica como adaptaciones a escala reducida de los metodos originales J-lens, R-lens y J++ lens descritos en la literatura de circuitos de transformers.

El proposito es facilitar la investigacion de interpretabilidad mecanicista en un modelo de 3B parametros: inspeccionar que conceptos se codifican en capas intermedias, examinar direcciones de escritura de neuronas concretas y comparar lecturas con ejemplos de activacion e intervenciones causales. El paquete incluye un lector autonomo (read_lenses.py) y resultados de evaluacion congelados sobre 284 prompts retenidos y 431 pares prompt/concepto, medidos con cinco tareas publicas de referencia.

Es relevante ahora porque reduce la barrera de entrada para estudiar representaciones internas en modelos pequenos y desplegables en hardware modesto, y porque publica procedencia de ajuste y resultados de evaluacion junto con las lentes, algo poco habitual en releases de interpretabilidad. La licencia Apache 2.0 permite uso comercial, aunque el artefacto es experimental y sus lecturas deben tratarse como hipotesis, no como etiquetas causales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Ministral 3 3B Instruct); las lentes son matrices de proyeccion FP32 |
| Parametros totales | No disponible para las lentes (el modelo base es de 3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el lector limita el prompt a 512 tokens por defecto) |
| Tipos de cuantizacion | No disponible; la compatibilidad con modelos base cuantizados no esta establecida |
| Idiomas soportados | No disponible (el release evalua solo texto; no se declaran idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Mapas .pt en formato workspace-lens (cargados con torch.load(weights_only=True)); activaciones en safetensors; modelo base en BF16 |
| Capas fuente ajustadas | 3, 6, 9, 13, 16, 19, 22 (indices zero-based), ancho 3072 |
| Capa destino del transporte | Salida del bloque 25, antes de la RMSNorm final |
| Tamano del repo | 0.8 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 3B parametros en BF16, con ancho de residual 3072 y al menos 26 bloques decodificadores (se referencian las salidas de los bloques 3 a 25). Las lentes se ajustan sobre siete capas concretas (3, 6, 9, 13, 16, 19 y 22) y transportan la activacion hasta la salida del bloque 25, antes de la RMSNorm final. La lectura aplica la RMSNorm nativa en FP32 (escala aprendida simple, sin offset 1 + weight), seguida de la cabeza de vocabulario nativa en FP32 y el escalado de logits configurado por el modelo. Las entradas son residuales crudos, sin blanqueado ni normalizacion de entrada.

Cada lente es una matriz FP32 fija por capa ajustada. J utiliza gradientes nativos promediados; R emplea reglas de propagacion de relevancia en el paso backward; J++ aprende una mezcla con signo de expertos R agrupados por activacion. Los ocho expertos de ajuste son clusters de activacion, no componentes nativos de mezcla de expertos del modelo. El ajuste se realizo con 69 prompts de calibracion y la evaluacion con 284 prompts retenidos y 431 pares prompt/concepto, disjuntos, sobre cinco tareas publicas. El dataset declarado es Salesforce/wikitext. El entrenamiento fue financiado por BlueDot Impact. No se dispone de mas detalles sobre hiperparametros, numero de tokens de ajuste ni procedimiento de optimizacion.

## Capacidades

- Lectura de conceptos en capas intermedias: cada lente produce un ranking de tokens del vocabulario a partir de una activacion, en siete profundidades.
- Inspeccion de direcciones de escritura de neuronas: proyecta la columna correspondiente de down_proj.weight del bloque 13 (canal MLP denso tras el gating y antes de down_proj) y muestra ambos signos.
- Transporte de activaciones a traves de las capas: interfaz WorkspaceLenses con metodos capture, transport, logits, read y neuron_direction.
- Captura y guardado de activaciones: opcion --save-activation para guardar una capa en safetensors (vector de forma [3072]).
- Seleccion de posicion y profundidad: --position para elegir el token de lectura y --layers para una profundidad concreta.
- Ranking con filtro upstream: por defecto excluye tokens sin letras ni digitos, preservando los tokens candidatos de evaluacion; --raw permite rankear el vocabulario completo.
- Ejecucion en CUDA, MPS y CPU mediante el lector (las rutas MPS y CPU no han sido validadas de forma independiente en este release).
- No incluye generacion de texto, tool calling, agentes, vision ni modo thinking como capacidades propias; el modelo base puede tenerlas, pero este release solo evalua texto.

## Casos de uso

- Analisis de representaciones en capas intermedias: introducir un prefijo de prompt y comparar los rankings de J, R y J++ en las siete profundidades para localizar donde emerge un concepto, aprovechando que el lector imprime las cuatro lecturas (logit, J, R, J++) de forma conjunta.
- Estudio de neuronas concretas: proyectar la direccion de escritura de una neurona del bloque 13 y contrastar la alineacion de vocabulario con ejemplos de activacion reales y con intervenciones causales, para distinguir hipotesis de etiquetas causales.
- Validacion de metodos de interpretabilidad: usar los resultados congelados (284 prompts, 431 pares) como referencia reproducible al implementar variantes de J-lens, R-lens o J++ lens, comparando el macro top-1 y top-10 frente a la logit lens.
- Docencia e investigacion en circuitos de transformers: el modelo base de 3B y el lector autonomo permiten montar practicas de interpretabilidad mecanicista en una sola GPU, sin depender de infraestructura de gran escala.
- Auditoria de fidelidad de lecturas: comparar la lectura de una activacion capturada con la salida real del modelo para el mismo contexto, midiendo la divergencia entre la hipotesis de la lente y el comportamiento observado.
- Desarrollo de herramientas auxiliares: la interfaz Python (WorkspaceLenses con device="auto") permite integrar las lentes en cuadernos o pipelines de analisis propios, con captura, transporte y lectura programaticos.
- Reproduccion de experimentos: el paquete fija la revision del modelo base (b6d637bef2393152b3da2b2fde72eecdee30557e) y el formato de los mapas, lo que facilita repetir la evaluacion en otras maquinas.

## Benchmarks y rendimiento

Resultados de evaluacion de conceptos (no precision de respuestas generadas), sobre 284 prompts retenidos y 431 pares prompt/concepto, con el ranking como mejor posicion entre las siete capas:

| Metrica | Logit lens | J | R | J++ |
|---|---:|---:|---:|---:|
| Macro top-1, vocabulario completo | 19.4% | 15.4% | 17.0% | 24.4% |
| Macro top-10, vocabulario completo | 37.4% | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

La informacion proporcionada solo incluye el valor de macro top-10 para la logit lens; el resto de celdas de esa fila no aparece en el material disponible. J++ supera a la logit lens en macro top-1 (24.4% frente a 19.4%), mientras que J y R quedan por debajo en esa metrica. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; el repo pesa 0.8 GB y el modelo base BF16 de 3B requiere aproximadamente 6-7 GB solo para pesos, mas activaciones y mapas FP32.
- GPU recomendadas: el smoke test del release se ejecuto en una NVIDIA A40 con CUDA; cualquier GPU con suficiente VRAM para el modelo base BF16 deberia servir.
- GPU de consumo: probablemente viable en tarjetas con 12-16 GB o mas, aunque no se confirma en la informacion proporcionada.
- Despliegue: lector autonomo read_lenses.py con Python 3.12 y requirements.txt; no requiere repositorio de entrenamiento ni paquete upstream para inferencia. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Dispositivos: CUDA validado; MPS y CPU expuestos por el lector pero no validados de forma independiente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Modelo base | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este release (J, R, J++) | Ministral-3-3B-Instruct-2512-BF16 | 3B (base) | No disponible | Lentes de interpretabilidad ajustadas por capa | Apache 2.0 | HuggingFace, 0 descargas |
| J-lens original | No disponible | No disponible | No disponible | Gradientes nativos promediados | No disponible | Publicacion Transformer Circuits |
| R-lens original | No disponible | No disponible | No disponible | Propagacion de relevancia en backward | No disponible | Publicacion LessWrong |
| J++ lens original | No disponible | No disponible | No disponible | Mezcla con signo de expertos R | No disponible | Publicacion LessWrong |

No se dispone de datos de parametros, contexto ni rendimiento de los metodos originales en la informacion proporcionada; la comparativa se limita al enfoque metodologico y a la adaptacion a un modelo de 3B.

## Limitaciones y advertencias

- Las lecturas son hipotesis a investigar, no etiquetas causales de neuronas; el autor lo advierte explicitamente.
- La proyeccion de una neurona aislada no incluye la activacion real, las contribuciones de otras neuronas ni el flujo residual circundante, por lo que la interpretacion puede no sobrevivir al contexto.
- Solo estan ajustadas las siete capas indicadas; el lector rechaza otros indices de capa.
- La evaluacion mide rangos de conceptos, no precision de respuestas generadas; los conceptos sin superficie de un solo token se omiten.
- La compatibilidad con modelos base cuantizados no esta establecida; el release usa el checkpoint BF16 con revision fijada.
- Las rutas MPS y CPU del lector no han sido validadas de forma independiente.
- Los pesos de vision no se usan; este release evalua solo texto.
- No se declaran idiomas soportados ni sesgos conocidos en la informacion disponible.
- Riesgo de alucinacion: no aplica directamente al artefacto, pero las lecturas pueden sugerir asociaciones espurias si no se contrastan con intervenciones.
- Uso comercial permitido por Apache 2.0, pero el caracter experimental del release desaconseja tratarlo como componente de produccion sin validacion propia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bubskee/ministral-3-3b-j-r-jpp-lenses
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512-BF16
- Perfil del autor: https://huggingface.co/bubskee
- J-lens original (Transformer Circuits): https://transformer-circuits.pub/2026/workspace/index.html
- R-lens original (LessWrong): https://www.lesswrong.com/posts/nv8oedrnLXKRzNEL9/r-lens-making-j-lens-more-faithful-on-early-layers
- J++ lens original (LessWrong): https://www.lesswrong.com/posts/nc9dHfcB22JdMzGbr/j-lens-jacobian-filtering-enables-more-faithful-workspace
- Dataset de referencia: https://huggingface.co/datasets/Salesforce/wikitext
