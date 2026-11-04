# cervantesjair378/fugal-sn70-router-head-v0

## Resumen

Fugal SN70 router head v0 es una cabeza de enrutamiento lineal publicada por el usuario cervantesjair378 en HuggingFace. No se trata de un modelo de lenguaje generativo, sino de un componente auxiliar (un clasificador lineal de 17 salidas) que opera sobre embeddings congelados de Qwen3-0.6B para predecir la probabilidad de exito de cada uno de 17 modelos candidatos en una consulta dada. Forma parte del ecosistema de la subred 70 de Bittensor (Fugal), cuyo contrato de exito fija el perfil `qwen3-success-2048-v1` sobre la revision `c1899de289a04d12100db370d81485cdf75e47ca` del backbone.

El artefacto se distribuye como un bundle NumPy (`bootstrap_head17.npz`) con una matriz de pesos float32 de 17x1024 y un sesgo, junto con un informe de entrenamiento en JSON. La regla de enrutamiento definida en el contrato es `argmax(sigmoid(W@h + b) - 1.0 * cost)`, con las utilidades cuantizadas a 1e-4 antes del argmax.

Es relevante ahora porque ilustra el patron de "router heads" entrenados sobre etiquetas escasas para seleccion de modelos en pipelines multi-LLM. El propio autor lo califica explicitamente como artefacto de investigacion y no como cabeza competitiva: la matriz de etiquetas es diminuta (1,3% de densidad) y la precision medida (0,949 sobre n=39) es estadisticamente debil. El repositorio ocupa 0,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de enrutamiento lineal (regresion logistica multietiqueta) sobre embeddings congelados de Qwen3-0.6B |
| Parametros totales | 17 x 1024 + 17 sesgos = 17.425 parametros en la cabeza; el backbone Qwen3-0.6B (~0,6B) no se distribuye en este repo |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (perfil `qwen3-success-2048-v1` del backbone) |
| Tipos de cuantizacion | No disponible (pesos float32 en el bundle `.npz`) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | `.npz` (NumPy, W float32 17x1024 + b) y `.json` (informe de entrenamiento) |

## Arquitectura y entrenamiento

La cabeza es un clasificador lineal que proyecta un vector de embedding de 1.024 dimensiones (salida de Qwen3-0.6B bajo el perfil de 2.048 tokens, computado en CPU en float32) a 17 logits, uno por modelo candidato. La probabilidad de exito se obtiene mediante sigmoide y la decision de enrutamiento combina esa probabilidad con el coste del modelo: `argmax(sigmoid(W@h + b) - 1.0 * cost)`, con utilidades cuantizadas a 1e-4 antes del argmax. El backbone Qwen3-0.6B permanece congelado; solo se entrena la matriz W y el sesgo b.

El entrenamiento se realizo con el trainer `diff_trainer/1`, deliberadamente diferenciado del trainer determinista publicado (que segun el autor sobrevive por deduplicacion). Se usaron etiquetas de `bootstrap_frame_calls_v1.jsonl`: 4.881 llamadas calificadas de OpenRouter (17 modelos x ~287 preguntas), con una densidad de matriz del 1,3%. Las caracteristicas son embeddings del pool completo de 21.553 preguntas bajo el perfil fijado, con cache verificado por contrato. Hiperparametros: semilla 20261104, tasa de aprendizaje 8e-3, weight decay 3e-4, funcion de perdida BCE enmascarada para NaN con ponderacion por clase y macro-promediado por modelo, y particion 60/20/20 agrupada por pregunta. La validacion incluyo `make_head`, `check_manifest` y verificacion de recarga, todos en verde. El bundle se valida contra el manifiesto `benchmark_tokens_v1` con `lam = 1.0`.

## Capacidades

- Prediccion de exito por modelo: dado un embedding de consulta, devuelve 17 probabilidades (una por modelo candidato) de que ese modelo responda correctamente.
- Enrutamiento con coste: selecciona el modelo que maximiza la utilidad esperada menos el coste, segun la regla del contrato.
- Integracion con el contrato de la subred 70 de Bittensor (`fugal-ai/fugal-subnet`), perfil `qwen3-success-2048-v1`.
- Verificacion de integridad: bundle validado contra manifiesto (`benchmark_tokens_v1`) y con recarga verificada.
- No realiza generacion de texto, razonamiento, codigo, matematicas ni vision por si mismo; depende del backbone Qwen3-0.6B para producir embeddings.
- No soporta tool calling, function calling ni razonamiento multi-paso de forma nativa.
- Capacidades multilingues: no disponibles (dependen del backbone y del dataset de etiquetas, no documentado).

## Casos de uso

- Enrutamiento de consultas en un pipeline multi-LLM: la cabeza predice que modelo de los 17 candidatos tiene mayor probabilidad de exito para el embedding de la consulta, permitiendo derivar cada peticion al modelo mas adecuado en lugar de usar uno fijo.
- Optimizacion coste-calidad en produccion: al incorporar el coste en la regla de decision, permite ajustar el equilibrio entre precision y gasto por consulta, aunque el autor advierte que la version actual sobreutiliza modelos caros (coste medio enrutado de 0,0058 USD por pregunta).
- Investigacion en seleccion de modelos: sirve como punto de partida reproducible para estudiar cabezas de enrutamiento sobre embeddings congelados y comparar con el trainer determinista publicado.
- Bootstrap de etiquetas para la subred Fugal: el artefacto demuestra el flujo completo (etiquetas, features, entrenamiento, validacion de manifiesto) antes de invertir en una matriz de etiquetas financiada.
- Validacion de contratos en Bittensor: util para verificar que una implementacion cumple el contrato de exito (`qwen3-success-2048-v1`) y la revision del backbone fijada.
- Prototipado de sistemas de enrutamiento con coste: la regla `argmax(sigmoid(W@h + b) - cost)` es un ejemplo concreto y reproducible de enrutamiento con penalizacion de coste que se puede adaptar a otros pools de modelos.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| Precision enrutada en test | 0,949 | Sobre n=39 filas puntuadas; estadisticamente debil segun el autor |
| Coste medio enrutado | 0,0058 USD/pregunta | Sobreutiliza modelos caros |
| Densidad de la matriz de etiquetas | 1,3% | 4.881 llamadas, 17 modelos x ~287 preguntas |
| Tamano del pool de preguntas | 21.553 | Embeddings bajo perfil de 2.048 tokens |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM para la cabeza: despreciable; los pesos son 17x1024 float32 mas sesgo (unos 70 KB), ejecutables en CPU.
- VRAM para el backbone: Qwen3-0.6B requiere aproximadamente 1,2 GB en fp16 y alrededor de 0,4-0,5 GB en cuantizacion de 4 bits, aunque el perfil de contrato especifica computo en CPU float32.
- GPU recomendadas: no se especifican; cualquier GPU consumer (RTX 3060 o superior) puede alojar el backbone, y la cabeza no requiere GPU.
- Cabe en GPU consumer: si, el backbone Qwen3-0.6B cabe en practicamente cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: el bundle se carga con NumPy directamente; el backbone puede servirse con llama.cpp, Ollama, vLLM o TGI, aunque el contrato fija el perfil CPU float32 para los embeddings.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fugal SN70 router head v0 | Cabeza de enrutamiento lineal | 17.425 | 2.048 (backbone) | MIT | HuggingFace |
| Trainer determinista de Fugal (referencia del autor) | Cabeza de enrutamiento | No disponible | 2.048 (backbone) | MIT | En `fugal-ai/fugal-subnet` |
| Cabezas de enrutamiento genericas sobre embeddings | Clasificador lineal | Variable | Depende del backbone | Variable | No disponible |

No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion: el propio autor lo califica como no desplegable y no competitivo; requiere una matriz de etiquetas financiada (columnas maverick/gpt-5.5) antes de su uso en produccion.
- Precision estadisticamente debil: el 0,949 se mide sobre solo 39 filas de test, insuficiente para conclusiones robustas.
- Matriz de etiquetas diminuta: 1,3% de densidad sobre 4.881 llamadas, lo que limita la generalizacion a preguntas fuera del pool de entrenamiento.
- Sesgo de coste: el coste medio enrutado (0,0058 USD/pregunta) indica sobreutilizacion de modelos caros, con el consiguiente impacto economico.
- Dependencia del backbone: el rendimiento esta acoplado a la revision fijada de Qwen3-0.6B (`c1899de289a04d12100db370d81485cdf75e47ca`) y al perfil `qwen3-success-2048-v1`; cambiar cualquiera de los dos invalida la cabeza.
- Idiomas: no documentados; las capacidades linguisticas dependen del backbone y del dataset de etiquetas, no descrito en detalle.
- Riesgo de alucinacion: no aplica directamente a la cabeza (no genera texto), pero la seleccion de modelo puede amplificar errores si las probabilidades predichas no estan calibradas.
- Licencia MIT: permite uso comercial, pero el estado de investigacion y la debilidad estadistica desaconsejan su uso en produccion sin reentrenamiento.
- Sin descargas ni likes: el repositorio no tiene traccion en el momento de la consulta, lo que reduce la validacion externa.

## Enlaces

- HuggingFace: https://huggingface.co/cervantesjair378/fugal-sn70-router-head-v0
- Repositorio de la subred Fugal: https://github.com/fugal-ai/fugal-subnet (referenciado en la model card)
- Backbone Qwen3-0.6B: no disponible en la informacion proporcionada (revision `c1899de289a04d12100db370d81485cdf75e47ca`)
- Paper, blog o demo: no disponibles en la informacion proporcionada
