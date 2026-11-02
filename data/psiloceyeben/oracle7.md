# psiloceyeben/oracle7

## Resumen

Oracle7 es un sistema de respuesta a preguntas desarrollado por el usuario psiloceyeben y publicado en HuggingFace. No es un modelo de lenguaje neuronal: se presenta como un sistema de IA simbolica que responde a partir de registros almacenados y con fuentes, apoyandose en 267 especialistas, cada uno de los cuales supero su propia prueba de validacion antes de poder responder. Cada respuesta incluye la "ruta" (path) que la produjo: la ruta, los especialistas y los registros implicados. Cuando ningun componente puede verificar una respuesta, el sistema declina y explica el motivo.

Esta es la version completa del sistema, que incluye el nucleo mas los almacenes de conocimiento profundo: resumenes de Wikipedia en ingles y DBpedia, 71 libros de texto de OpenStax, Wikipedia en ingles simple, Wiktionary, WordNet, ConceptNet y relaciones de Wikidata. El repositorio ocupa 12,5 GB y la descarga son 9,3 GB que se descomprimen en 24,1 GB. Esta disenado para ejecutarse solo en CPU con Python 3.12 y aproximadamente 2 GB de RAM, sin GPU ni acceso a red en tiempo de ejecucion.

Su relevancia radica en la propuesta de un paradigma opuesto al de los LLM generativos: en lugar de generar texto probable, el sistema solo responde cuando puede trazar una ruta verificable hasta una fuente almacenada, y declina explicitamente cuando no puede. La licencia es mixta: los datos bajo CC BY-NC-SA 4.0 (lo que restringe el uso comercial de esta version completa) y el codigo bajo Apache 2.0. Para uso comercial el autor remite a una variante denominada oracle7-slim.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IA simbolica con nucleo de rutas y 267 especialistas; no es un transformer ni un modelo neuronal de lenguaje |
| Parametros totales | no disponible (no aplica: no es un modelo neuronal con parametros) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no aplica: no hay pesos neuronales que cuantizar) |
| Idiomas soportados | ingles (en) |
| Licencia | other: CC BY-NC-SA 4.0 para datos, Apache 2.0 para codigo |
| Formato de pesos | no disponible (no hay pesos en safetensors ni GGUF; el sistema se distribuye como almacenes de datos y codigo Python) |

## Arquitectura y entrenamiento

Oracle7 no emplea una arquitectura de transformer, MoE ni SSM. Se trata de un sistema de IA simbolica compuesto por un nucleo ("head": `oracle_release_runtime_w540`) y un conjunto de 267 especialistas. Cada especialista supero una prueba de validacion propia ("held-out test") antes de ser admitido para responder. El sistema opera sobre almacenes de conocimiento estructurado y textual: resumenes de Wikipedia en ingles y DBpedia, 71 libros de texto de OpenStax, Wikipedia en ingles simple, Wiktionary, WordNet, ConceptNet y relaciones de Wikidata. Cada almacen se verifica contra su hash publicado.

La innovacion tecnica principal es el mecanismo de trazabilidad y abstencion. Cada respuesta se representa como una ruta sobre 22 caminos del runtime de tres arboles, con dos metricas asociadas: k (numero de pasos) y L (tiempo empleado). Las preguntas que no llegan a formar una respuesta se registran en un libro de residuos encadenado por hash ("residue ledger"), tipado por el nodo donde se detuvo el proceso. Una respuesta sin cita, prueba o ruta comprobada no se incorpora al estado de la conversacion. La version 4.0 (20 de octubre de 2026) introduce esta representacion de rutas como palabra sobre los 22 caminos. No se dispone de informacion sobre volumen de datos de entrenamiento en tokens ni sobre procesos de RLHF o DPO, ya que no se trata de un modelo entrenado por esos metodos.

## Capacidades

- Respuesta a preguntas con cita de fuente y ruta verificable: cada respuesta incluye la evidencia (`[ev:direct]`) y la ruta completa de nodos que la produjo.
- Abstencion explicita: cuando no puede verificar, declina y explica el motivo (por ejemplo, que ningun registro admitido responde a la pregunta o que un paso de la ruta no pudo comprobarse).
- Conversacion multi-turno mediante modo REPL (`--repl`), con soporte de seguimiento de contexto entre turnos.
- Servidor HTTP local (`--serve 8077`) con endpoint `POST /chat`.
- Workbench local: pagina en `http://127.0.0.1:8177/` con conversacion, diagrama del modelo que ilumina la ruta de cada respuesta, espacio de trabajo y registro en vivo de turnos, rutas y examenes.
- Conexion de fuentes externas: escaneo del equipo local, conexion a servidores por SSH, incorporacion de tablas y notas propias, y conexion a servidores MCP. Cada fuente se convierte en un lector que nombra el origen de cada valor.
- Sensores: conexion a dispositivos HTTP (metricas JSON o Prometheus), topics MQTT, dispositivos USB/serie o ficheros de registro; las lecturas se conservan 24 horas en local y las respuestas indican valor, antiguedad, fuente y si fue medido; las lecturas fisicamente imposibles se rechazan.
- Creacion y examen de especialistas propios: permite escribir un especialista y examinarlo con el mismo protocolo que los 267 del release (examen de desarrollo repetible y examen held-out de una sola vez); un especialista solo se admite si aporta respuestas correctas, no anade falsos positivos y se mantiene en su ambito.
- Registro de especialistas en Solana: una transaccion firmada quema exactamente 1 token $ORACLE7 y registra la huella del especialista; otros usuarios pueden atestiguar su examen de forma gratuita.
- Verificacion de integridad: recalculo de SHA-256 de cada parte (`RELEASE_HASHES.json`) y de la raiz Merkle, comprobable contra la transaccion de anclaje en Solana.
- Generacion de video de la ruta de una respuesta en el navegador, con opcion de conectar una cuenta de ElevenLabs para narracion, sonido e ilustraciones.
- Capacidad de codigo: el "organo de codigo" ejecuta programas y los verifica contra tests propios.
- Registro de carencias ("Gaps"): diario opcional en local que agrupa las declinaciones en los especialistas que faltan.
- Multilingue: solo ingles.

## Casos de uso

- Atencion al cliente con trazabilidad: el sistema puede responder consultas a partir de una base documental propia incorporada como fuente (tablas, notas o servidor MCP), citando el registro exacto de donde procede cada dato y declinando cuando la informacion no consta. Es adecuado en entornos donde una respuesta inventada tiene coste alto.
- Cumplimiento normativo y auditoria documental: la ruta verificable de cada respuesta permite reconstruir que registros y especialistas intervinieron, lo que facilita la auditoria interna y la justificacion ante organismos reguladores.
- Monitorizacion industrial con sensores: mediante la conexion de dispositivos HTTP, MQTT o serie, el sistema lee metricas, conserva las ultimas 24 horas en local y responde con valor, antiguedad y fuente, rechazando lecturas fisicamente imposibles. Apropiado para plantas o laboratorios con conectividad limitada y sin GPU.
- Despliegue en entornos air-gapped: al ejecutarse solo en CPU, con unos 2 GB de RAM y sin acceso a red en tiempo de ejecucion, encaja en equipos modestos, portatiles de campo o servidores sin acelerador, donde no es viable servir un LLM.
- Asistencia documental sobre corpus cientifico: los 71 libros de texto de OpenStax y los resumenes de Wikipedia y DBpedia permiten responder preguntas educativas citando la fuente concreta, util en plataformas de formacion que exigen referencias.
- Extension con especialistas de dominio: un equipo puede crear especialistas propios (por ejemplo, sobre procedimientos internos), examinarlos con el protocolo held-out y admitirlos solo si superan la prueba, manteniendo el control de calidad del conocimiento incorporado.
- Verificacion de integridad de artefactos: el recalculo de hashes SHA-256 y de la raiz Merkle, junto con la comprobacion contra la transaccion de anclaje en Solana, sirve para validar que una copia del sistema no ha sido alterada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que existe una "seccion medida" que indica con que frecuencia el sistema aun se equivoca y en que casos, pero no se incluyen cifras concretas de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar en la informacion proporcionada.

## Requisitos de hardware

- VRAM: no aplica; el sistema no requiere GPU.
- RAM: aproximadamente 2 GB en tiempo de ejecucion.
- CPU: cualquier CPU que ejecute Python 3.12; no se especifican requisitos minimos de nucleos.
- Almacenamiento: descarga de 9,3 GB que se descomprime en 24,1 GB.
- GPU recomendadas: ninguna; el sistema es CPU-only por diseno.
- Cabe en cualquier equipo de consumo: portatiles, mini-PC o servidores sin acelerador, siempre que dispongan de espacio en disco y Python 3.12.
- Opciones de despliegue: ejecucion directa con `python oracle7.py` (consulta puntual, REPL o servidor HTTP local en el puerto 8077) y Workbench local en el puerto 8177. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de sistema.
- Latencia y throughput: no disponibles; la model card menciona la metrica L (tiempo por ruta) pero no publica valores.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Oracle7 no es un modelo de lenguaje neuronal, por lo que las comparaciones habituales con LLM (parametros, contexto, benchmarks) no son directamente aplicables. Sus caracteristicas diferenciales frente a un LLM generico son la ausencia de GPU, la ejecucion sin red, la trazabilidad de cada respuesta y la abstencion ante lo no verificable.

| Caracteristica | Oracle7 (completo) | LLM generativo tipico |
|---|---|---|
| Naturaleza | IA simbolica con especialistas | Red neuronal transformer |
| Ejecucion | CPU, ~2 GB RAM, sin red | GPU con VRAM elevada |
| Trazabilidad | Ruta y fuente en cada respuesta | No disponible por defecto |
| Abstencion | Explicita y medida | No garantizada |
| Idiomas | Solo ingles | Habitualmente multilingue |
| Licencia | CC BY-NC-SA 4.0 (datos), Apache 2.0 (codigo) | Variable |

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues.
- El autor reconoce que el sistema no siempre logra abstenerse correctamente y remite a una seccion medida con la frecuencia de error, aunque las cifras no se incluyen en la informacion disponible.
- La version completa es de uso no comercial por la inclusion de material de OpenStax bajo CC BY-NC-SA 4.0; para uso comercial debe emplearse oracle7-slim.
- No es un modelo neuronal: no genera texto libre ni razona de forma generativa; sus respuestas estan limitadas a lo que puedan verificar sus registros y especialistas.
- El conocimiento esta acotado a los almacenes incluidos (Wikipedia, DBpedia, OpenStax, Wiktionary, WordNet, ConceptNet, Wikidata); temas fuera de esos corpus probablemente produzcan declinaciones.
- El Workbench escucha solo en 127.0.0.1 y no envia datos salvo a los servicios que el usuario conecte; conviene revisar `workbench/README.md` antes de conectar fuentes externas.
- El registro de especialistas en Solana implica una transaccion con quema de 1 token $ORACLE7 firmada en la cartera del usuario; es una operacion con coste y consecuencias irreversibles.
- El comando de comparticion del release apunta a `Prometheus7/oracle7-specialists`; el autor indica que debe compartirse a `psiloceyeben/oracle7-specialists` anadiendo `--create-pr`, lo que supone una discrepancia a tener en cuenta.
- La capa de reparacion de erratas de entrada que usa el sitio no esta incluida en esta version.
- El repositorio registra 0 descargas y 2 likes en el momento de la consulta, lo que indica una adopcion muy limitada y escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/psiloceyeben/oracle7
- Variante para uso comercial: https://huggingface.co/psiloceyeben/oracle7-slim
- Licencias de datos: https://huggingface.co/psiloceyeben/oracle7/blob/main/DATA_LICENSES.md
- Dataset de especialistas: https://huggingface.co/datasets/psiloceyeben/oracle7-specialists
