# sidman007/wsp-climatebert-tcfd-r1-p50

## Resumen

`sidman007/wsp-climatebert-tcfd-r1-p50` es un clasificador de texto en ingles derivado de `climatebert/distilroberta-base-climate-tcfd`, el modelo de ClimateBERT que etiqueta parrafos de divulgacion climatica segun las cuatro categorias de recomendacion del TCFD: `governance`, `risk`, `strategy` y `metrics`. Lo desarrolla el usuario `sidman007` y su interes no reside en la tarea, sino en el metodo de construccion: el checkpoint se obtiene por edicion de pesos en espacio de pesos (weight-space programming), sin descenso de gradiente, sin optimizadores y sin datos adicionales.

La arquitectura es un `RobertaForSequenceClassification` podado: conserva las seis capas del encoder original y recorta cada bloque feed-forward de 3.072 a 1.536 unidades, lo que deja 68.136.964 parametros totales (28.955.908 no de embedding), una reduccion del 17,2% total y del 32,8% en parametros no de embedding respecto al modelo de partida (82.301.956). El checkpoint ocupa 273 MB.

Es relevante como prueba de concepto reproducible: demuestra que un editor LLM puede decidir que estructuras conservar y reajustar los pesos restantes en forma cerrada a partir de un numero acotado de pasadas forward, obteniendo un modelo mas pequeno y mas rapido (17,3 ms/parrafo en CPU frente a 25,2 ms del original) con una precision en test retenido de 78,75% y macro-F1 de 0,7206. La contrapartida es que se trata de un artefacto de investigacion, no de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (`RobertaForSequenceClassification`), 6 capas de encoder |
| Parametros totales | 68.136.964 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Parametros no de embedding | 28.955.908 |
| Longitud de contexto | 512 tokens (ventana usada en la evaluacion de latencia; el modelo base es RoBERTa, contexto maximo nativo de 512) |
| Tipos de cuantizacion | no disponible (el autor solo publica safetensors en fp32; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (pesos), con caveat de uso de datos CC BY-NC-SA 4.0 |
| Formato de pesos | safetensors |
| Tamano del checkpoint | 273 MB (repositorio 0,3 GB) |
| Tamano FFN (intermediate) | 1.536 (original: 3.072) |
| Capas de encoder conservadas | 6, ids [0, 1, 2, 3, 4, 5] |
| Etiquetas de salida | `governance`, `risk`, `strategy`, `metrics` |
| Modelo base | `climatebert/distilroberta-base-climate-tcfd` (commit `970630beedc2`) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo RoBERTa para clasificacion de secuencias. Frente al checkpoint de partida, mantiene intactas las capas de atencion, las LayerNorms, las proyecciones de entrada y la cabeza de clasificacion, y solo modifica los bloques feed-forward: cada uno se reduce de 3.072 a 1.536 unidades. La seleccion de unidades se hace por energia de los pesos de salida multiplicada por la varianza de activacion, medida sobre parrafos de practica; para las capas tempranas se usan activaciones a nivel de token y para la capa 5 solo la posicion `<s>`, que es la unica que lee la cabeza de clasificacion. Los pesos `output.dense.weight` y el sesgo de cada bloque recortado se reajustan por regresion ridge en forma cerrada, de modo que las unidades conservadas reproducen la salida del bloque completo, incluidas las descartadas.

No hay entrenamiento en el sentido habitual: no hay retropropagacion, ni optimizadores, ni datos adicionales. El editor LLM consume 50 pasadas forward presupuestadas (32 utilizadas) sobre el split publico de entrenamiento del modelo base, con un coste declarado de 10,14 USD en API del editor. El checkpoint se reconstruye bit a bit desde el checkpoint publicado fijado mas el diff registrado en `edit_manifest.json`, `structure.json` y `param_count.json`, verificable con `scripts/reins/apply_edit.py --check`. Los datos de entrenamiento del modelo de partida y de practica del editor son `climatebert/tcfd_recommendations` (CC BY-NC-SA 4.0, uso de investigacion); el modelo no se entreno nunca sobre el split de test usado para la metrica reportada.

## Capacidades

- Clasificacion de texto multietiqueta unica en cuatro categorias TCFD: `governance`, `risk`, `strategy`, `metrics`.
- Etiquetado de parrafos completos de divulgacion climatica corporativa, no de frases sueltas.
- Integracion directa con `transformers` mediante `pipeline("text-classification", ...)`.
- Inferencia en CPU con latencia baja: 17,3 ms/parrafo con batch 1 y 19,6 ms con batch 16 (4 hilos, ventana de 512 tokens).
- Capacidad de reconstruccion reproducible y auditable del checkpoint a partir del modelo base y el manifiesto de edicion.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Clasificacion de informes de sostenibilidad: procesar los parrafos de memorias anuales y reportes ESG y asignar cada uno a una de las cuatro categorias TCFD, como paso previo a la extraccion de metricas o a la revision de cumplimiento.
- Investigacion sobre edicion de pesos: usar el modelo como referencia reproducible para estudiar poda estructurada de bloques feed-forward y reajuste en forma cerrada, comparando contra el checkpoint original con la misma semilla y el mismo split.
- Evaluacion comparativa de eficiencia: servir como baseline de bajo coste en CPU para medir latencia y precision frente al modelo publicado (17,3 frente a 25,2 ms/parrafo en batch 1).
- Prototipado de pipelines de analisis climatico: al caber en cualquier maquina sin GPU y ocupar 273 MB, permite iterar sobre preprocesado y esquemas de etiquetado antes de escalar a modelos mayores.
- Docencia y reproduccion cientifica: el par checkpoint + manifiesto + script de aplicacion permite verificar paso a paso como se obtiene un modelo podado sin entrenamiento, util en cursos de eficiencia de modelos.
- Filtrado previo en corpus regulatorios: descartar o priorizar parrafos con contenido climatico relevante en grandes volumenes de documentacion antes de pasarlos a un modelo de mayor capacidad.

## Benchmarks y rendimiento

| Metrica | Este modelo (r1/p50) | Modelo publicado (referencia del autor) |
|---|---|---|
| Precision en test retenido | 78,75% | 77,5% |
| Macro-F1 | 0,7206 | no disponible |
| Objetivo declarado (accuracy / macro-F1) | >= 76,50% / >= 0,6896 (cumplido) | no aplica |
| Latencia CPU, batch 1 | 17,3 ms/parrafo | 25,2 ms/parrafo |
| Latencia CPU, batch 16 | 19,6 ms/parrafo | 30,1 ms/parrafo |
| Parametros totales | 68.136.964 | 82.301.956 |
| Reduccion de parametros no de embedding | 32,8% | no aplica |

El test retenido consta de 320 parrafos (197 `strategy`, 49 `metrics`, 48 `risk`, 26 `governance`); un parrafo equivale a 0,31 puntos de precision y un solo parrafo de `governance` mueve su recall 3,8 puntos. El autor advierte que la lectura segura es que el modelo no es peor que el publicado, no que sea mejor, y que los resultados provienen de una unica semilla. No se han publicado resultados de benchmarks estandar (MMLU, GLUE, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (273 MB de checkpoint mas activaciones); no requiere GPU.
- GPU recomendadas: no necesita GPU; funciona en CPU. Cualquier GPU consumer (GTX 1650 o superior) lo ejecuta con holgura, aunque el cuello de botella sera el preprocesado.
- Cabe en cualquier GPU consumer y en Raspberry Pi y equipos de gama baja, dado su tamano y su ventana de 512 tokens.
- Opciones de despliegue: `transformers` (pipeline nativo), `torch`/ONNX para exportacion; vLLM, llama.cpp y Ollama no son aplicables de forma directa porque el autor no publica pesos en GGUF y el modelo es un clasificador, no un generador.
- Latencia y throughput: 17,3 ms/parrafo en batch 1 y 19,6 ms en batch 16 con 4 hilos de CPU y ventana de 512 tokens; equivale a unos 51-58 parrafos por segundo en batch 16 en ese hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sidman007/wsp-climatebert-tcfd-r1-p50` | 68,1 M | 512 | Clasificacion TCFD (4 clases) | apache-2.0 (con caveat de datos) | HuggingFace, 0 descargas |
| `climatebert/distilroberta-base-climate-tcfd` | 82,3 M | 512 | Clasificacion TCFD (4 clases) | no disponible en la informacion proporcionada | HuggingFace (referencia) |
| `climatebert/distilroberta-base-climate-detector` | no disponible en la informacion proporcionada | 512 | Deteccion de texto climatico | no disponible en la informacion proporcionada | HuggingFace (categoria ClimateBERT) |

La comparacion directa solo es posible con el modelo de partida, del que este checkpoint es una version podada: mismo esquema de etiquetas, misma tarea y misma ventana, con un 17,2% menos de parametros y latencias entre un 31% y un 35% menores en CPU. No se dispone de datos de otros clasificadores TCFD comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Uso exclusivamente de investigacion: los datos de entrenamiento del modelo base y de practica del editor (`climatebert/tcfd_recommendations`) estan bajo CC BY-NC-SA 4.0, no comercial; el despliegue comercial requiere permiso de los autores del dataset o un reajuste sobre datos con licencia adecuada.
- Conjunto de test muy pequeno (320 parrafos, 26 de ellos de `governance`): las diferencias de precision y recall no son estadisticamente concluyentes y proceden de una unica semilla.
- El modelo hereda los limites del modelo publicado: se entrena y evalua sobre parrafos, no sobre frases, y sus probabilidades de salida no estan calibradas por el autor de esta version.
- No esta listo para produccion: el propio autor remite a trabajo pendiente de calibracion, validacion con datos reales, robustez y gobernanza descrito en el README del proyecto y en `docs/executive-summary.md`.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de clasificacion erronea en parrafos ambiguos o muy cortos, especialmente en la clase minoritaria `governance`.
- Solo ingles: no se ha validado su comportamiento en castellano ni en otros idiomas.
- Sesgos conocidos: no documentados en la informacion disponible; al derivar de un corpus de divulgacion corporativa climatica, puede reflejar los sesgos de ese dominio y de las empresas representadas.
- Sin descargas ni validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia externa de su comportamiento fuera de la evaluacion del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sidman007/wsp-climatebert-tcfd-r1-p50
- Modelo base: https://huggingface.co/climatebert/distilroberta-base-climate-tcfd
- Dataset de entrenamiento y practica: https://huggingface.co/datasets/climatebert/tcfd_recommendations
- Codigo, logs y protocolo: https://github.com/siddharth-ghatti/weight-space-programming-poc
