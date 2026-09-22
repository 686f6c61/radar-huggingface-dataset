# ruvnet/ruvector-typesafe-banking77

## Resumen

ruvector-typesafe-banking77 es un "banco de ejemplos" entrenado para la librería `@ruvector/typesafe`, publicada en npm. No es un modelo de pesos en el sentido habitual: el artefacto contiene 9.993 utterances etiquetadas con 77 intenciones bancarias finas y las asignaciones de split congeladas, pero no contiene pesos de red neuronal. Las cabezas de decisión (nearest-prototype o una sonda multinomial) y la calibración de temperatura se reajustan desde el propio banco al cargarlo, por lo que el artefacto es independiente del encoder.

El modelo resuelve clasificación de intenciones (intent classification) sobre texto, un problema clásico de enrutamiento y comprensión en asistentes conversacionales. Se apoya en el dataset PolyAI/banking77, el estándar habitual para medir detección de intenciones bancarias finas, y está pensado para ejecutarse de forma totalmente local, sin llamadas de red en la ruta de decisión y sin coste de API.

La relevancia actual viene de su enfoque "typesafe": se declaran decisiones tipadas sobre texto que se resuelven localmente. El coste es que el rendimiento depende fuertemente del encoder elegido: con `all-MiniLM-L6-v2` alcanza 76,7 % de accuracy, mientras que con `bge-small-en-v1.5` sube a 87,0 % con latencias p50 de 6 ms. El banco es solo en inglés y su conjunto de etiquetas es cerrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable (banco de ejemplos etiquetados; la decision se resuelve con una cabeza nearest-prototype o una sonda multinomial reajustada al cargar) |
| Parametros totales | No aplicable (el artefacto no contiene pesos; los parametros dependen del encoder ONNX externo) |
| Parametros activos | No aplicable |
| Longitud de contexto | No aplicable (clasificacion de una utterance por llamada; no hay ventana de contexto generativa) |
| Tipos de cuantizacion | No disponible (los encoders ONNX se ejecutan con su formato propio; el banco en si es JSON sin cuantizar) |
| Idiomas soportados | Ingles unicamente (ambos encoders incluidos son sentence encoders en ingles) |
| Licencia | cc-by-4.0 para el banco; el codigo de `@ruvector/typesafe` es MIT |
| Formato de pesos | No aplicable (el artefacto son ficheros JSON: `bank.json` y `questions.json`; el encoder se sirve como ONNX) |

Otros datos del artefacto: 9.993 ejemplos de entrenamiento, 3.077 utterances en el split `test` de evaluacion, 77 clases, `splitsHash: f51a48af2895c08d…`, pipeline `text-classification`, libreria `ruvector`.

## Arquitectura y entrenamiento

El artefacto no es un transformer entrenado de extremo a extremo, sino un banco de ejemplos con splits congelados. Al cargarlo, el motor `@ruvector/typesafe` reajusta la cabeza de decision y la calibracion de temperatura a partir de los ejemplos almacenados. El banco es agnostico al encoder: almacena texto y etiquetas de split derivadas de un hash de contenido, no representaciones generadas por el encoder. Segun la model card, esto es un hecho medido en este dataset: los dos encoders incluidos exportaron bancos identicos a nivel de bytes. Solo la accuracy reportada es especifica de cada encoder.

El entrenamiento se ejecuta con `node scripts/typesafe-banks/build-bank.mjs --dataset banking77 --encoder <encoder>`. La cabeza de sonda usa descenso de gradiente a batch completo con un numero de iteraciones fijo, y ese contador es el hiperparametro critico al anadir datos: el valor por defecto de 400 iteraciones ajusta bien aproximadamente 1.000 ejemplos pero infraajusta de forma severa alrededor de 10.000. Para este banco se entrenó con `probeIterations: 4000`, `probeClassBalanced: true` y `head: probe`. Ese ajuste ocurre de forma perezosa en la primera llamada a `decide`, por lo que la primera decision tarda minutos, no milisegundos; las llamadas posteriores operan en regimen estable. La model card indica que una recarga del banco reproduce exactamente las respuestas del motor entrenado, algo que se verifica con `test/bank-roundtrip.test.mjs`.

## Capacidades

- Clasificacion de texto en 77 intenciones bancarias finas (por ejemplo, "my card was declined at an atm").
- Decisiones tipadas sobre texto, gestionadas por la libreria `@ruvector/typesafe` en Node.js.
- Inferencia completamente local: sin red en la ruta de decision y sin coste de API.
- Cabeza de decision adaptativa: nearest-prototype y, cuando una clase acumula ejemplos suficientes, una sonda multinomial.
- Calibracion de temperatura de las confianzas.
- Reproducibilidad: recargar el banco reproduce exactamente las respuestas del motor entrenado.
- Independencia del encoder: el mismo banco funciona con distintos encoders.
- Soporte de dos encoders medidos: `all-MiniLM-L6-v2` y `bge-small-en-v1.5`.

No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling ni comportamiento de agente multi-paso. No hay modo "thinking".

## Casos de uso

- Enrutamiento de tickets bancarios: clasificar cada mensaje entrante en una de las 77 intenciones para dirigirlo al equipo o flujo correcto, con latencias p50 de 6-10 ms por decision usando `bge-small-en-v1.5`.
- Clasificacion previa en chatbots de atencion al cliente: detectar la intencion del usuario antes de invocar un modelo generativo, reduciendo coste y latencia en la ruta caliente.
- Etiquetado automatico de transcripciones de centro de contacto: asignar una intencion a cada intervencion del cliente en tiempo de postproceso.
- Analisis de motivos de contacto: agregar categorias de intencion sobre grandes volumenes de mensajes para detectar tendencias operativas.
- Cumplimiento y priorizacion: identificar intenciones sensibles (por ejemplo, disputas o cargos no reconocidos) para su escalado inmediato.
- Despliegue en entornos sin red o con requisitos de privacidad: al no requerir llamadas externas, el banco se puede ejecutar localmente para no exponer texto de clientes.
- Clasificacion en tiempo real en Node.js: integrar la decision como funcion tipada dentro de un backend o pipeline existente.

## Benchmarks y rendimiento

Resultados sobre el split `test` reservado, 3.077 utterances y 77 clases:

| Encoder | Accuracy | Latencia p50 | Latencia p95 |
|---|---|---|---|
| `all-MiniLM-L6-v2` | 76,7 % | 15 ms | 16 ms |
| `bge-small-en-v1.5` | 87,0 % | 6 ms | 10 ms |

Entrenado sobre 9.993 ejemplos etiquetados (`splitsHash: f51a48af2895c08d…`). No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto no contiene pesos y las latencias medidas no implican uso de GPU.
- GPU recomendadas: no disponibles; las latencias p50 de 6-15 ms y p95 de 10-16 ms sugieren ejecucion viable en CPU con los encoders ONNX.
- Compatibilidad con GPU de consumo: no aplicable segun la informacion proporcionada, porque no se documenta una ruta GPU.
- Memoria: requiere cargar en memoria 9.993 ejemplos (banco) mas el encoder ONNX; el coste exacto no esta especificado.
- Despliegue: libreria npm `@ruvector/typesafe` sobre Node.js con encoder ONNX. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo de pesos.
- Latencia y throughput: p50 de 6 ms y p95 de 10 ms con `bge-small-en-v1.5`; p50 de 15 ms y p95 de 16 ms con `all-MiniLM-L6-v2`. El throughput no esta especificado.
- Advertencia de arranque: la primera decision tras cargar el banco reajusta la cabeza a `probeIterations: 4000` sobre 9.993 ejemplos y 77 clases, un proceso que tarda minutos. Conviene importar una vez, calentar con una decision de descarte y mantener el motor vivo; no cargar un banco por peticion.

## Comparativa con modelos similares

No se dispone de datos comparativos con modelos externos en la informacion proporcionada. La unica comparacion medible dentro del propio artefacto es entre los dos encoders evaluados:

| Encoder | Accuracy (test) | Latencia p50 | Latencia p95 |
|---|---|---|---|
| `bge-small-en-v1.5` | 87,0 % | 6 ms | 10 ms |
| `all-MiniLM-L6-v2` | 76,7 % | 15 ms | 16 ms |

No se han proporcionado pesos, contexto ni licencia de encoders alternativos para establecer una comparativa completa.

## Limitaciones y advertencias

- Solo ingles: ambos encoders incluidos son sentence encoders en ingles, por lo que no se puede asumir buen rendimiento en otros idiomas.
- Conjunto de etiquetas cerrado: las 77 intenciones son fijas. Anadir intenciones nuevas requiere nuevos ejemplos y un reajuste del banco.
- La accuracy reportada (76,7 % y 87,0 %) corresponde al split de test del propio dataset y no es una garantia sobre el trafico real de un despliegue concreto.
- El artefacto no contiene pesos: quien lo use debe asumir el coste de reajustar la cabeza al cargar y de disponer de un encoder compatible.
- La primera decision tras la carga tarda minutos con `probeIterations: 4000`; omitir las `--engine-options` recomendadas provoca un reajuste con los valores por defecto (400 iteraciones, `head: auto`), que da un modelo materialmente peor.
- Si se carga un banco por peticion, el reajuste repetido hara inviable el sistema en produccion.
- Licencia del banco CC-BY-4.0, que exige atribucion; el banco redistribuye el texto de las utterances bajo esa misma licencia. El codigo de `@ruvector/typesafe` es MIT.
- Sin datos publicados sobre sesgos.
- Riesgo de alucinacion: no aplicable en el sentido generativo, ya que el modelo solo asigna una clase; el riesgo equivalente es la clasificacion erronea o la asignacion de una clase poco fiable, mitigado parcialmente por la calibracion de temperatura.

## Enlaces

- HuggingFace: https://huggingface.co/ruvnet/ruvector-typesafe-banking77
- Paquete npm: https://www.npmjs.com/package/@ruvector/typesafe
- Dataset PolyAI/banking77: https://huggingface.co/datasets/PolyAI/banking77
- Paper de referencia: Casanueva et al., *Efficient Intent Detection with Dual Sentence Encoders* (2020), arXiv:2003.04807

Nota: la busqueda web no devolvio resultados relevantes sobre el modelo; los unicos enlaces utiles son los incluidos en la model card y los enumerados arriba.
