# ansarbuilds/Sirius-Large

## Resumen

Sirius-Large (publicado en Hugging Face como `ansarbuilds/Sirius-Large`, aunque su model card lo titula internamente como Sirius-Pro-ONNX) es un clasificador de texto en formato ONNX int8 derivado del codificador `BAAI/bge-base-en-v1.5`. Lo desarrolla el usuario ansarbuilds y resuelve un problema muy concreto: dado un objetivo breve del usuario (por ejemplo, "File my 2026 taxes") y una secuencia de ventanas o pestañas abiertas, determinar si la ventana activa avanza hacia ese objetivo, es tangencial o constituye una distracción ("rabbit hole"). El modelo devuelve una de tres etiquetas: `ON_TASK`, `BORDERLINE` o `RABBIT_HOLE`.

Arquitectonicamente es un cross-encoder BERT de unos 109 millones de parametros, cuantizado a int8 y empaquetado en ONNX, con un peso de aproximadamente 105,21 MB. Esto lo hace apto para inferencia local en CPU en milisegundos, sin GPU ni conexion de red, lo que encaja en herramientas de escritorio orientadas a la concentracion (el tag `focus-drift` y `adhd` lo evidencian). La longitud de entrada practica es corta: el ejemplo de uso trunca a 160 tokens.

Su relevancia es de nicho pero clara: no es un modelo generativo de proposito general, sino un componente de senalizacion ligero pensado para integrarse en un motor de decisiones que avisa al usuario cuando se desvia de su tarea. La model card reporta metricas especificas de su propio benchmark (SiriusBench) y de una evaluacion real en macOS, aunque no hay comparaciones con benchmarks academicos estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (cross-encoder) sobre `BAAI/bge-base-en-v1.5`, exportado a ONNX y cuantizado a int8 |
| Parametros totales | ~109 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible de forma oficial; el ejemplo de uso trunca a `max_length=160` tokens |
| Tipos de cuantizacion | int8 (ONNX quantized); se menciona el artefacto `model_quantized.onnx` |
| Idiomas soportados | no disponible (el modelo base es `bge-base-en-v1.5`, de nombre en ingles, pero la model card no declara idiomas) |
| Licencia | MIT |
| Formato de pesos | ONNX (int8); el repositorio ocupa ~0,1 GB |

## Arquitectura y entrenamiento

El modelo parte de `BAAI/bge-base-en-v1.5`, un codificador BERT de 12 capas y ~109M de parametros, y se reutiliza como cross-encoder para clasificacion de tres clases. La entrada combina el objetivo del usuario con la ventana activa y hasta cuatro ventanas previas en un formato textual con separadores `[SEP]` y campos `app | title | domain`. La salida es una distribucion softmax sobre `ON_TASK`, `BORDERLINE` y `RABBIT_HOLE`.

Segun la model card, el entrenamiento se realizo en tres rondas sobre GPU NVIDIA (RunPod): 100.000 filas sinteticas en la ronda 1 (generadas con `factory.py`), un pool de 500.000 filas para mineria de negativos duros (`mine_hard_negatives.py`) y 31.660 filas en la ronda 3 destiladas a partir de probabilidades soft-label del profesor `Qwen/Qwen3-32B-AWQ` (Apache-2.0) mediante `distill_teacher.py`. El umbral de decision (0,53) se ajusto exclusivamente en el split `dev` de SiriusBench, y todas las metricas publicadas se calculan sobre el split `test` bloqueado. El autor declara que no se usaron salidas propietarias de OpenAI, Anthropic ni Google/Gemma. No se detalla la composicion linguistica del dataset ni el numero total de tokens de entrenamiento.

## Capacidades

- Clasificacion de texto en tres clases (`ON_TASK`, `BORDERLINE`, `RABBIT_HOLE`) a partir de un objetivo y un historial de ventanas.
- Deteccion de deriva de foco ("focus drift") en secuencias de 1 a 4 ventanas o pestañas.
- Manejo de trampas de palabra clave: la metrica "Same-Keyword Traps" sugiere que distingue contextos con terminos compartidos pero proposito distinto.
- Deteccion de deriva gradual en cadenas de hasta 4 saltos ("4-Hop Gradual Drift Trails").
- Reduccion de falsos positivos en ventanas utilitarias (gestores de contrasenas, calculadora, 2FA), con una tasa de falsa alarma reportada del 0,0 % en ese slice.
- Inferencia offline en CPU con latencia de decenas de milisegundos.
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento: es un clasificador puro.
- Capacidades multilingues: no declaradas; el modelo base es de nombre ingles y la model card no indica cobertura idiomatica.

## Casos de uso

- Aplicacion de escritorio de concentracion: el clasificador se ejecuta localmente en CPU y etiqueta la ventana activa en cada cambio de foco, permitiendo avisos discretos cuando el usuario cae en una distraccion. Su tamano (~105 MB) y su latencia p50 de ~30 ms lo hacen viable en un bucle de eventos del sistema operativo.
- Extension de navegador anti-procrastinacion: dado un objetivo declarado por el usuario y el historial reciente de pestañas, la extension puede marcar pestañas `RABBIT_HOLE` y ocultarlas o pedir confirmacion antes de abrirlas.
- Asistente de productividad integrado en el SO: el modelo actua como senal para un motor de decisiones que decide si interrumpir o no; la model card reporta 4,21 falsos avisos por 2 horas en su evaluacion real de macOS, un dato que orienta el diseno del umbral.
- Filtrado de contenido en herramientas de estudio: en entornos educativos, clasificar si la pestana activa contribuye al objetivo de estudio declarado (por ejemplo, "preparar examen de estadistica") y registrar patrones de deriva.
- Analitica de foco para equipos o individuos: procesar registros de ventanas (sin enviar datos a la nube) y generar informes sobre cuantas transiciones acaban en `RABBIT_HOLE`, respetando la privacidad al ejecutarse offline.
- Investigacion sobre comportamiento digital: usar el modelo como etiquetador automatico de trazas de navegacion en estudios de atencion o TDAH, dado el tag `adhd` y la disponibilidad de pesos abiertos bajo MIT.
- Componente en pipelines de agentes de escritorio: servir como "guardrail" que valida si la accion propuesta por un agente (abrir una URL) se alinea con el objetivo del usuario antes de ejecutarla.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el split `test` bloqueado de SiriusBench (364 trazas no vistas):

| Metrica / slice | Resultado |
|---|---|
| Precision global de `RABBIT_HOLE` (umbral 0,53) | 95,6 % |
| Recall global de `RABBIT_HOLE` | 98,1 % |
| Exactitud global de 3 clases | 92,3 % |
| Slice A: trampas de misma palabra clave (precision RH) | 96,3 % |
| Slice B: trazas de deriva gradual de 4 saltos (precision RH) | 100,0 % |
| Slice C: tasa de falsa alarma en ventanas utilitarias | 0,0 % |
| Slice D: trabajo legitimo en YouTube/Reddit/GitHub (precision RH) | 81,2 % |
| Tamano ONNX int8 | 105,21 MB |
| Concordancia PyTorch vs. ONNX int8 | 96,9 % |
| Latencia en CPU en caliente (p50 / p95) | 29,82 ms / 117,31 ms |

Evaluacion real en macOS (300 trazas etiquetadas a mano, 1,9 horas activas, fuera de muestra):

| Metrica | Resultado |
|---|---|
| Slice real de YouTube y Reddit (21 trazas) | 90,5 % precision / 100,0 % recall |
| Falsas alarmas en ventanas utilitarias | 0,0 % |
| Replay del motor de decisiones: falsos avisos cada 2 horas | 4,21 (objetivo del gate: <= 1,00) |

No se han publicado resultados en benchmarks academicos estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, algo esperable al tratarse de un clasificador de dominio especifico.

## Requisitos de hardware

- Inferencia exclusivamente en CPU: el artefacto int8 ONNX de ~105 MB no requiere GPU.
- VRAM estimada: 0 GB (no usa GPU); memoria RAM tipica inferior a 500 MB incluyendo el runtime de ONNX Runtime y el tokenizador.
- GPU recomendadas: no aplica; el autor no reporta cifras para GPU.
- Cabe en cualquier equipo de escritorio moderno; no hay restriccion de GPU de consumo porque no se necesita GPU.
- Despliegue: ONNX Runtime (Python, C++, C#, JavaScript), y potencialmente otros runtimes compatibles con ONNX; el tokenizador se carga con `transformers.AutoTokenizer`.
- Latencia y throughput: p50 de 29,82 ms y p95 de 117,31 ms en CPU en caliente; el throughput exacto no se detalla, pero implica decenas de inferencias por segundo en un solo hilo en funcion del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Sirius-Large | ~109 M | no disponible (uso a 160 tokens) | Clasificacion de deriva de foco en 3 clases | MIT | ONNX int8 |
| `BAAI/bge-base-en-v1.5` (modelo base) | ~109 M | 512 tokens | Embeddings de recuperacion y similitud | MIT | safetensors / PyTorch |
| Cross-encoders BERT de clasificacion (familia generica) | 100-300 M | 512 tokens | Clasificacion y reranking generico | variable | safetensors, ONNX |

La comparacion directa con alternativas de la misma tarea (clasificadores de deriva de foco) no esta disponible: no se conocen modelos publicos equivalentes en la informacion proporcionada. Frente a su modelo base, Sirius-Large anade una cabeza de clasificacion de tres clases y una cuantizacion int8 que reduce el peso a ~105 MB, a costa de perder la funcion de embeddings genericos.

## Limitaciones y advertencias

- Dominio muy estrecho: solo clasifica ventanas de escritorio/navegador en funcion de un objetivo; no es un modelo de lenguaje y no genera texto.
- Idiomas y cobertura: la model card no declara idiomas; el modelo base es de nombre ingles y es probable que el rendimiento fuera del ingles sea limitado o desconocido.
- Contexto corto: el ejemplo de uso trunca a 160 tokens, por lo que objetivos o titulos largos pueden perder informacion.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si hay riesgo de clasificacion erronea, especialmente en el slice D (precision del 81,2 % en trabajo legitimo en YouTube/Reddit/GitHub).
- Falsos avisos en produccion: la propia evaluacion real reporta 4,21 falsos avisos por 2 horas, por encima del objetivo de <= 1,00 declarado por el autor; requiere ajuste del umbral o del motor de decisiones.
- Datos de entrenamiento sinteticos y destilados: la ronda 1 es sintetica y la ronda 3 se destila de `Qwen3-32B-AWQ`, lo que puede introducir sesgos del profesor.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base `BAAI/bge-base-en-v1.5` (tambien MIT) y de las dependencias.
- Nomenclatura inconsistente: el repositorio se llama `Sirius-Large` pero la model card se titula "Sirius-Pro-ONNX"; conviene confirmar que el artefacto descargado corresponde a la version documentada.
- Sin benchmark academico independiente: todas las cifras provienen del autor y de su propio benchmark, sin validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ansarbuilds/Sirius-Large
- Modelo base: https://huggingface.co/BAAI/bge-base-en-v1.5
- Profesor de destilacion: https://huggingface.co/Qwen/Qwen3-32B-AWQ
- Paper, blog, repositorio o demo adicionales: no disponible en la informacion proporcionada.
