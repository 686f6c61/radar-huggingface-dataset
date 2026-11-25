# ansarbuilds/Sirius-Tiny-ONNX

## Resumen
Sirius-Tiny-ONNX es un clasificador de texto de tres clases desarrollado por ansarbuilds, derivado del modelo de embeddings `sentence-transformers/all-MiniLM-L6-v2` y exportado a ONNX en cuantizacion int8. Su tarea concreta es detectar "focus drift" (deriva de atencion): dado un objetivo breve del usuario y una traza de ventanas o pestanas abiertas, clasifica la ventana activa como `ON_TASK`, `BORDERLINE` o `RABBIT_HOLE`. El modelo esta pensado para ejecutarse en local, sin conexion y en CPU, con una latencia declarada de milisegundos.

Con unos 22,7 millones de parametros y un peso cuantizado de 21,99 MB, es un modelo extremadamente ligero orientado a integraciones de escritorio (el autor menciona macOS) y a motores de decision que deciden si interrumpir al usuario. No es un modelo generativo ni un asistente conversacional: es un cross-encoder de clasificacion con una ventana de entrada corta (max_length 160 en el ejemplo de uso).

Su relevancia actual reside en el nicho: herramientas de productividad y bienestar digital que necesitan senal de contexto en tiempo real con coste computacional minimo. La licencia Apache 2.0 y el formato ONNX facilitan su despliegue embebido, aunque el modelo es muy especifico y no cubre tareas generales de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (MiniLM), configurado como cross-encoder de clasificacion; exportado a ONNX |
| Parametros totales | 22,7 M (segun la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; el ejemplo de uso aplica `max_length=160` tokens |
| Tipos de cuantizacion | int8 (ONNX quantized); se menciona el modelo PyTorch original como referencia de comparacion |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; el modelo base MiniLM es principalmente ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model_quantized.onnx`); el modelo base en Hugging Face es safetensors |

## Arquitectura y entrenamiento
El modelo parte de `sentence-transformers/all-MiniLM-L6-v2`, un transformer encoder tipo BERT de 6 capas y 384 dimensiones ocultas (22,7 M de parametros), reutilizado aqui como cross-encoder: la entrada concatena el objetivo del usuario y la traza de ventanas separadas por `[SEP]`, y la cabeza de clasificacion produce tres logits. La exportacion a ONNX con cuantizacion int8 reduce el artefacto a 21,99 MB y permite inferencia en CPU con ONNX Runtime.

El entrenamiento se realizo en tres rondas sobre GPU NVIDIA en RunPod, segun la model card: 100.000 filas sinteticas en la ronda 1 generadas con `factory.py`, un pool de 500.000 filas para mineria de negativos duros (`mine_hard_negatives.py`) y 31.660 filas en la ronda 3 destiladas con probabilidades soft-label del profesor `Qwen/Qwen3-32B-AWQ` (`distill_teacher.py`). El autor declara no haber usado salidas de OpenAI, Anthropic ni Google/Gemma. El umbral de decision (0,71) se ajusto exclusivamente en el split `dev` de SiriusBench. La concordancia entre el modelo PyTorch y la version int8 ONNX es del 93,8%.

## Capacidades
- Clasificacion de texto en tres clases (`ON_TASK`, `BORDERLINE`, `RABBIT_HOLE`) a partir de un objetivo y una traza de contexto.
- Deteccion de deriva de atencion en trazas de 1 a 4 ventanas o pestanas normalizadas en formato `app | title | domain`.
- Tratamiento de ventanas utilitarias (gestores de contrasenas, calculadora, segundo factor de autenticacion) como `ON_TASK`, con una tasa de falsa alarma declarada del 0,0 % en el slice C.
- Inferencia offline en CPU con latencia declarada de 5,34 ms p50 y 98,26 ms p95 en caliente.
- Distincion entre trabajo legitimo en plataformas de ocio (YouTube, Reddit, GitHub) y consumo de contenido de evasion, con precision del 100 % en el slice D.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido; es un clasificador puro.

## Casos de uso
- Filtro de interrupciones en apps de productividad: el motor de decision consulta al clasificador antes de mostrar un aviso o notificacion, usando la ventana activa y las pestanas previas como contexto; la latencia de milisegundos permite evaluar cada cambio de ventana en tiempo real.
- Extension de navegador contra la procrastinacion: clasifica la pestana activa frente al objetivo declarado por el usuario y solo actua cuando la etiqueta es `RABBIT_HOLE` con probabilidad superior al umbral de 0,71, reduciendo falsos positivos en ventanas utilitarias.
- Agente de escritorio de bienestar digital: integrado en un daemon local que registra cambios de ventana en macOS o Windows y genera resumenes de deriva sin enviar datos a la nube, gracias a la inferencia offline en CPU.
- Analitica personal de foco: procesamiento por lotes de trazas historicas de ventanas para etiquetar sesiones de trabajo y estimar tiempo en tareas frente a tiempo en tangentes, con coste de computo despreciable.
- Modulo de enrutado en asistentes locales: como primera etapa barata que decide si una ventana merece atencion de un modelo mayor, evitando invocar LLM costosos en cada cambio de contexto.
- Investigacion sobre atencion y comportamiento digital: uso del clasificador como etiquetador automatico en estudios de conducta, con la ventaja de que el modelo y los pesos son abiertos y auditables.
- Despliegue embebido en dispositivos de bajos recursos: al ocupar 21,99 MB en int8 y ejecutarse con ONNX Runtime, cabe en portatiles sin GPU e incluso en entornos con restricciones de memoria.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test bloqueado de SiriusBench (364 trazas no vistas):

| Metrica / slice | Resultado |
|---|---|
| Precision global de `RABBIT_HOLE` (umbral 0,71) | 95,8 % |
| Recall global de `RABBIT_HOLE` | 88,5 % |
| Precision global de 3 clases | 87,1 % |
| Slice A: trampas de misma palabra clave (precision RH) | 90,5 % |
| Slice B: trazas de deriva gradual de 4 saltos (precision RH) | 100,0 % |
| Slice C: tasa de falsa alarma en ventanas utilitarias | 0,0 % |
| Slice D: trabajo legitimo en YouTube/Reddit/GitHub (precision RH) | 100,0 % |
| Tamano del ONNX int8 | 21,99 MB |
| Concordancia PyTorch vs. ONNX int8 | 93,8 % |
| Latencia CPU en caliente (p50 / p95) | 5,34 ms / 98,26 ms |

Evaluacion en entorno real de macOS (300 trazas etiquetadas a mano, 1,9 horas activas, fuera de muestra):

| Metrica | Resultado |
|---|---|
| Slice real de YouTube y Reddit (21 trazas) | 95,0 % precision / 100,0 % recall |
| Falsas alarmas en ventanas utilitarias | 0,0 % |
| Replay del motor de decision: avisos falsos por 2 horas | 3,16 (objetivo del autor: <= 1,00) |

No se han publicado comparaciones con modelos de clasificacion genericos en la informacion disponible.

## Requisitos de hardware
- VRAM: no aplica en la practica; el modelo esta disenado para CPU. En GPU, el peso int8 de 21,99 MB ocupa una fraccion minima de memoria.
- GPU recomendadas: ninguna especifica; cualquier GPU con soporte de ONNX Runtime (CUDA o TensorRT) puede ejecutarlo, pero no es necesario para cumplir los objetivos de latencia.
- GPU de consumo: cabe en cualquier GPU de consumo e integrada; tambien funciona sin GPU.
- Despliegue: ONNX Runtime (Python, C++, C#, JavaScript), con tokenizador de Hugging Face (`AutoTokenizer`). No se documenta soporte para vLLM, TGI ni llama.cpp, ya que no es un modelo generativo.
- Latencia y throughput: 5,34 ms p50 y 98,26 ms p95 en CPU en caliente segun el autor; el p95 alto sugiere variabilidad en entornos con carga o con arranque en frio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sirius-Tiny-ONNX | 22,7 M | no disponible (uso a 160 tokens) | Clasificacion de deriva de atencion (3 clases) | Apache 2.0 | ONNX en Hugging Face |
| sentence-transformers/all-MiniLM-L6-v2 (modelo base) | 22,7 M | 256 tokens (modelo original) | Embeddings de frases; requiere cabeza y entrenamiento para clasificar | Apache 2.0 | safetensors, ONNX, ampliamente adoptado |
| Clasificadores BERT-base fine-tuneados para clasificacion de texto | ~110 M | 512 tokens | Clasificacion generica | variable | Hugging Face |

La comparacion directa con alternativas especificas de deteccion de deriva de atencion no esta disponible: no se conocen modelos publicos equivalentes en la informacion proporcionada. Frente al modelo base, la diferencia clave es la cabeza de clasificacion y el entrenamiento especifico; frente a BERT-base, la ventaja es el tamano (unas cinco veces menor) y la latencia en CPU.

## Limitaciones y advertencias
- Modelo de nicho: solo resuelve la tarea de clasificacion de deriva de atencion; no sirve para generacion, resumen, traduccion ni razonamiento general.
- Idiomas: la model card no declara cobertura linguistica; el modelo base MiniLM esta entrenado principalmente en ingles, por lo que el rendimiento en castellano es incierto y no esta validado.
- Contexto corto: el ejemplo de uso trunca a 160 tokens, lo que limita la cantidad de historial de ventanas que se puede incluir.
- Alucinacion: al ser un clasificador no genera texto, pero puede producir etiquetas erroneas con alta confianza; la precision global de 3 clases es del 87,1 %, con un recall de `RABBIT_HOLE` del 88,5 %, lo que implica falsos negativos.
- Avisos falsos en produccion: el propio autor reporta 3,16 avisos falsos por 2 horas en la evaluacion real, por encima de su objetivo de <= 1,00; el umbral de 0,71 debe calibrarse para cada integracion.
- Concordancia limitada tras cuantizar: la version int8 coincide con PyTorch en el 93,8 % de los casos, lo que introduce divergencias frente al modelo sin cuantizar.
- Datos de entrenamiento sinteticos y destilados: las rondas 1 y 2 son sinteticas y la ronda 3 usa etiquetas soft de un profesor; pueden heredar sesgos del generador y del profesor `Qwen3-32B`.
- Validacion limitada: las metricas proceden de SiriusBench, un benchmark definido por el propio autor, y de una evaluacion en macOS; no hay validacion independiente.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene conservar los avisos de atribucion y verificar la licencia del modelo base.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de adopcion ni mantenimiento por parte de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ansarbuilds/Sirius-Tiny-ONNX
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Modelo profesor citado: https://huggingface.co/Qwen/Qwen3-32B-AWQ
- ONNX Runtime: https://onnxruntime.ai/
- Documentacion de Transformers (tokenizer y carga de modelos): https://huggingface.co/docs/transformers
