# precisit/one-pass-sv-forms

## Resumen

One-Pass SV-Forms (SV0) es un checkpoint de investigación publicado por precisit: un clasificador de decisión de 706.048 parámetros que, dado un elemento de interfaz (rol, etiqueta, estado) y las entidades extraídas de un documento, elige una única opción entre un conjunto cerrado (`fyll <entidad>`, `kryssa`, `klicka`, `hoppa över`). No es un modelo generativo: no produce texto, no necesita tokenizador y resuelve cada decisión en una sola pasada forward, siguiendo el contrato que el autor denomina "Jev"/System One. Está especializado exclusivamente en sueco y se distribuye como paquete Core ML para Apple Silicon.

Su relevancia es doble. Por un lado, demuestra que un especialista de lenguaje local y muy pequeño puede superar con holgura a un checkpoint equivalente entrenado en inglés sobre las mismas filas en sueco (21,4 % frente a 83,02 % de top-1). Por otro, publica resultados negativos útiles: la misma palettización int4 que apenas cuesta 0,06 puntos porcentuales en un modelo convergido hunde este checkpoint al 50,87 % y además falla la compilación para la Neural Engine, lo que ilustra que el margen de cuantización depende del entrenamiento y no de la arquitectura.

El autor lo etiqueta explícitamente como research checkpoint y no como producto. Se entrenó únicamente con datos sintéticos (900 episodios de formularios suecos, 21.306 decisiones) y no se ha validado sobre formularios reales. Además, el 7,5 % de los rellenos obligatorios reciben la respuesta "skip", por lo que cualquier integración real exige verificación externa y ejecución fail-closed.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings a nivel de byte + encoder Transformer de 2 capas (ancho 128, 4 cabezas) + cabeza de atencion sobre opciones; variante `tinyx` |
| Parametros totales | 706.048 (2,83 MB en fp16) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 224 bytes de contexto por elemento de UI, 96 bytes por opcion, hasta 40 opciones |
| Tipos de cuantizacion | fp16, int8 e int4 (palettisation de Core ML); int8 recomendado, int4 solo por reproducibilidad |
| Idiomas soportados | sueco (sv) |
| Licencia | MIT (pesos y codigo) |
| Formato de pesos | safetensors (`sv0-forms.safetensors` + `sv0-forms.json` con arquitectura y hashes) y paquetes Core ML; referencia en PyTorch en el repositorio del toolkit |
| Tarea (pipeline) | text-classification (scoring de opciones) |
| Tamano del repositorio | 0,0 GB (redondeado) |
| Descargas / likes | 0 / 1 |
| Fecha de creacion | 21 de septiembre de 2026 |
| Ultima actualizacion | 21 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es deliberadamente mínima: embeddings a nivel de byte (los identificadores son el byte UTF-8 más uno, con relleno de ceros), un encoder Transformer de 2 capas con anchura 128 y 4 cabezas de atención, y una cabeza de atención sobre las opciones que puntúa cada candidata en una única pasada forward. No hay decodificación autorregresiva, ni tokenizador, ni generación de texto. El presupuesto de entrada es de 224 bytes de contexto y 96 bytes por opción, con un máximo de 40 opciones por decisión. El formato exacto de construcción de la entrada es parte del contrato (`UPPGIFT fyll i formuläret från dokumentet och skicka sedan in`, `FORM <title>`, `ELEMENT <role> "<label>" value="…"`), y un desajuste en ese formato es la causa más probable de un rendimiento degradado.

El entrenamiento se hizo desde cero con 900 episodios sintéticos de formularios suecos que suman 21.306 decisiones, generados localmente con la receta que el autor publica junto al checkpoint. El corpus emplea entidades de documento del tipo `Label: value`, dominios de correo `.invalid`, nombres ficticios y cadenas con forma de personnummer generadas localmente sin vínculo con ninguna persona real. El modelo no es un fine-tune de CUA-S1 ni de jevlike: es una implementación independiente del mismo contrato. La validación seguía mejorando cuando se detuvo el entrenamiento (48 % → 63 % → 79 % → 83 % de top-1 en cuatro épocas), de modo que el 83 % debe interpretarse como suelo de la receta y no como techo.

## Capacidades

- Puntuación de opciones en una sola pasada forward: dada una lista cerrada de candidatas, devuelve la mejor opción sin generar texto.
- Clasificación de cuatro acciones sobre formularios: `fyll <entidad>` (rellenar con una entidad del documento), `kryssa` (marcar casilla), `klicka` (hacer clic) y `hoppa över` (omitir).
- Lectura conjunta del elemento de interfaz y del documento: el control con contexto rotado cae por debajo del baseline de clase mayoritaria (34,08 % frente a 50,45 %), lo que indica que el modelo usa la etiqueta del elemento y el documento, no estadísticas de opciones.
- Distribución calibrada por pregunta: ECE de 0,017 en el conjunto de test sintético, útil como capa de decisión por criterios.
- Inferencia en el dispositivo sobre Apple Silicon (CPU + Neural Engine) mediante Core ML, sin runtime de Python.
- Ejecución sin tokenizador y con latencia en el orden del milisegundo por decisión.

No dispone de generación de texto, tool calling, function calling, razonamiento multi-paso, planificación de orden de ejecución, capacidades multimodales (visión o audio), ni soporte multilingüe más allá del sueco.

## Casos de uso

- Rellenado de formularios suecos a partir de un documento extraído: el modelo recibe cada elemento del formulario y el conjunto de entidades del documento, y decide qué valor asignar. Es su caso de uso principal, pero exige ejecución fail-closed y verificación externa del resultado, dado el 7,5 % de omisiones silenciosas en campos obligatorios.
- Enrutado y triaje con opciones predefinidas: cuando el código determinista ya conoce el conjunto de destinos posibles, el modelo actúa como clasificador de enrutado en lugar de generar una respuesta en prosa.
- Capa de decisión por criterios: en flujos donde interesa una distribución calibrada por pregunta en vez de texto generado, el ECE de 0,017 en el conjunto sintético permite umbralizar con confianza y derivar los casos dudosos a revisión.
- Preprocesado en el dispositivo con requisitos de privacidad: al ejecutarse como paquete Core ML de 787 KB en int8 sobre CPU y Neural Engine, puede integrarse en aplicaciones de iPhone o Mac sin enviar datos de formularios a un servidor.
- Investigación sobre especialistas one-pass por idioma: sirve como ejemplo reproducible de cómo construir y medir un especialista de lenguaje local partiendo de datos sintéticos, incluida la receta de generación publicada por el autor.
- Banco de pruebas para contratos Jev/System One: al ser una implementación independiente del mismo contrato que CUA-S1 y jevlike, permite comparar implementaciones y detectar problemas de formato de entrada en el harness.
- Prototipado de agentes de computer-use acotados: como capa de decisión de bajo coste dentro de un bucle mayor, siempre que el orden de ejecución y la validación final las aporte código determinista externo.

## Benchmarks y rendimiento

Resultados medidos con el harness del autor sobre Apple M4:

| Ejecucion | Decisiones | Top-1 | Baseline clase mayoritaria | ECE | Rellenos obligatorios omitidos en silencio |
|---|---:|---:|---:|---:|---:|
| Test sintetico reservado (firma de formulario disjunta) | 2.315 | 83,02 % | 50,45 % | 0,017 | 76 (7,5 % de los rellenos) |
| Demo sueco escrito a mano, fuera de distribucion | 50 | 86,00 % | 64,00 % | 0,092 | 3 (de 32 rellenos) |
| Control con contexto rotado (test) | 2.315 | 34,08 % | 50,45 % | 0,497 | 264 |

Precisión por acción en el split de test: `check` 98,3 %, `click` 93,7 %, `skip` 88,0 %, `fill` 75,5 %. El autor señala que el checkpoint inglés liberado de la misma familia obtiene un 21,4 % sobre exactamente estas filas suecas, por debajo del baseline de clase mayoritaria y en el suelo de su propio control con contexto rotado.

Exportación a Core ML (mismo checkpoint, convertido con coremltools 9.0):

| Variante | Paquete | Top-1 | Paridad de argmax frente a PyTorch | Latencia mediana | p95 |
|---|---:|---:|---:|---:|---:|
| fp16 (CPU + ANE) | 1,4 MB | 83,00 % | 0,99870 | 1,31 ms | 1,46 ms |
| int8 (CPU + ANE) | 787 KB | 83,09 % | 0,99611 | 1,32 ms | 1,40 ms |
| int4 (CPU + ANE) | 481 KB | 50,87 % | 0,48702 | 1,97 ms | 2,10 ms |
| Referencia PyTorch | 2,83 MB | 83,02 % | — | no disponible | no disponible |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; estos no aplican a un modelo que no genera texto.

## Requisitos de hardware

- Huella de memoria muy reducida: el checkpoint de referencia pesa 2,83 MB en fp16; el paquete Core ML ocupa 1,4 MB en fp16, 787 KB en int8 y 481 KB en int4.
- Cabe en cualquier GPU de consumo e incluso en memoria unificada de un iPhone o un Mac con Apple Silicon. Los resultados publicados se midieron en un Apple M4, con ejecución sobre CPU y Neural Engine.
- No requiere A100, H100 ni RTX 4090; estas GPU no aportan ventaja frente al objetivo real del modelo, que es el despliegue en el dispositivo.
- Opciones de despliegue: paquetes Core ML incluidos en el propio repositorio de HuggingFace (sin runtime de Python ni PyTorch) o el código PyTorch de referencia del toolkit. No se contemplan vLLM, llama.cpp, Ollama ni TGI, ya que el modelo no es un LLM generativo y no tiene tokenizador.
- Latencia medida (mediana / p95): 1,31 / 1,46 ms en fp16, 1,32 / 1,40 ms en int8 y 1,97 / 2,10 ms en int4. El autor indica además aproximadamente 1 ms por decisión en portátil o teléfono Apple.
- La variante int4 falla la compilación para la Neural Engine; se distribuye solo por reproducibilidad.
- Throughput agregado (decisiones por segundo) no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / opciones | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| precisit/one-pass-sv-forms (SV0) | 706.048 | 224 bytes de contexto, 96 bytes por opcion, hasta 40 opciones | 83,02 % top-1 en test sintetico sueco; 86,00 % en demo OOD | MIT | Pesos safetensors y paquetes Core ML en HuggingFace |
| Cua CUA-S1 (`cua-ai/cua-s1-forms`) | no disponible | mismo contrato Jev/System One | no disponible en la informacion proporcionada | no disponible | Checkpoint publicado en HuggingFace |
| jevlike (`vinnylarouge/jevlike`) | no disponible | mismo contrato Jev/System One | no disponible en la informacion proporcionada | no disponible | Repositorio en GitHub |
| Checkpoint ingles de la misma familia (sin identificar) | no disponible | mismo contrato y mismas filas de evaluacion | 21,4 % top-1 sobre las filas suecas del test | no disponible | no disponible |

El autor destaca que SV0 es una implementación independiente entrenada desde cero, no un fine-tune de CUA-S1 ni de jevlike, y que la barrera de rendimiento en este caso fue el idioma y no el formato del contrato.

## Limitaciones y advertencias

- No se ha entrenado ni evaluado sobre formularios suecos reales: todo el corpus es sintético (entidades `Label: value`, dominios `.invalid`, nombres ficticios y cadenas con forma de personnummer sin vínculo con personas reales). La única evidencia no sintética es un conjunto de 50 decisiones escrito por los propios autores.
- Riesgo operativo alto de omisión silenciosa: el 7,5 % de los rellenos obligatorios en el test reciben la respuesta "skip", es decir, un campo obligatorio queda vacío sin que el modelo lo señale. Cualquier integración debe verificar los resultados fuera del modelo (ejecución fail-closed, dry run, un único envío, revisión humana antes de acciones con consecuencias).
- No es un asistente de propósito general ni un agente autónomo: no genera texto, no puede inventar un valor que no se le haya entregado y no decide el orden de ejecución.
- Checkpoint inacabado: la validación seguía mejorando al detenerse el entrenamiento, por lo que el 83 % de top-1 es un suelo de la receta, no un techo.
- Sensibilidad al formato de entrada: la cadena de contexto y las opciones deben construirse exactamente como en entrenamiento (identificadores de byte = byte UTF-8 + 1, con relleno de ceros, y el prefijo `UPPGIFT` / `FORM` / `ELEMENT`). Cualquier desajuste degrada la salida y es la causa más probable de malos resultados.
- Cuantización frágil: int4 reduce el top-1 al 50,87 % (por debajo del baseline de clase mayoritaria) y no compila en la Neural Engine. Debe usarse int8.
- Cobertura lingüística limitada al sueco (sv). No hay evidencia de transferencia a otros idiomas; de hecho, el checkpoint inglés de la misma familia rinde al nivel del azar en sueco.
- Calibración degradada fuera de distribución: el ECE sube de 0,017 en el test sintético a 0,092 en la demo escrita a mano, lo que limita el uso de umbrales de confianza calibrados en producción.
- Adopción prácticamente nula (0 descargas, 1 like) y ausencia de validación por terceros.
- Licencia MIT para pesos y código, sin restricciones de uso comercial declaradas, pero la licencia no cubre los riesgos de datos ni de ejecución descritos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/precisit/one-pass-sv-forms
- Toolkit de especialistas one-pass (receta de datos y código PyTorch): https://github.com/precisit/one-pass-specialists
- CUA-S1 (mismo contrato): https://huggingface.co/cua-ai/cua-s1-forms
- jevlike (mismo contrato): https://github.com/vinnylarouge/jevlike
- Busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos por el buscador no guardan relacion con este modelo.
