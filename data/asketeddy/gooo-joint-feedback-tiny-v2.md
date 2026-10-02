# asketeddy/gooo-joint-feedback-tiny-v2

## Resumen

gooo-joint-feedback-tiny-v2 es un conjunto de nueve modelos diminutos de 12.412 parametros cada uno, publicados por el usuario asketeddy, que actuan como jueces estructurales sobre rutas de codigo validas del lenguaje Gooo. No son modelos generativos: reciben pares de entradas vinculadas a codigo fuente junto con fallos de TDD observados y clasifican cuatro rutas legales de cuerpo Gooo. El propio autor los describe como modelos acotados de juicio estructural que no generan texto arbitrario en coreano o ingles ni garantizan correccion de programas no vistos.

Tecnicamente son relevantes por su enfoque de procedencia y trazabilidad mas que por su capacidad: los pesos se inicializan aleatoriamente, sin usar pesos preentrenados de Laya ni de ningun otro modelo, y se conservan todas las exportaciones FP32, PTQ y QAT junto con los resultados negativos. La publicacion incluye evidencia reproducible de 3.600 actualizaciones offline del optimizador en MPS, 6.144 sesiones de SDK con profesor propio, 9.216 sesiones de alumno y control, y 240 generaciones Gooo compiladas y ejecutadas contra 3.840 casos Go ordenados.

El modelo se integra en el compilador meta-ontology-go mediante la API `jointdecision` del runtime gooo-decision-runtime v0.2.12-experimental, que exige un fichero `--path-model` explicito. El modelo solo ordena rutas declaradas; la aceptacion ejecutable la deciden comprobaciones de tipos y tests finitos escritos de forma independiente. El repositorio de HuggingFace ocupa 0,0 GB y no registra descargas ni "likes" en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (descrita como "modelo de juicio estructural"; pesos FP32 o ternarios empaquetados, con matrices int8 y sesgos FP32 en tiempo de ejecucion) |
| Parametros totales | 12.412 por modelo; 9 modelos publicados |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32, PTQ, QAT y pesos ternarios empaquetados de cinco trits (1,6 bits almacenados por peso trit) |
| Idiomas soportados | en, ko (segun metadatos de HuggingFace); el modelo no genera texto en ninguno de los dos |
| Licencia | Apache-2.0 |
| Formato de pesos | JSON (`model.json`); exportaciones FP32, PTQ y QAT |

Datos adicionales de tamano declarados por el autor: los pesos FP32 ocupan 49.648 bytes; los pesos empaquetados de cinco trits ocupan 2.590 bytes; los tensores de runtime usan 12.384 bytes de matrices int8, 112 bytes de sesgos FP32 y 8 bytes de escalas de matriz.

## Arquitectura y entrenamiento

La model card no especifica la topologia interna (no se indica si es un transformer, un MLP o una red feed-forward de clasificacion). Lo que si detalla es el regimen de cuantizacion: cada modelo se exporta en FP32, en PTQ (post-training quantization) y en QAT (quantization-aware training), ademas de una representacion ternaria empaquetada de cinco trits por peso, con la que se alcanza una densidad de 1,6 bits almacenados por peso trit. Los pesos se inicializan de forma aleatoria y ninguna exportacion usa pesos preentrenados de Laya u otros modelos como punto de partida.

El entrenamiento se organiza en tres brazos emparejados que comparan la perdida con inicializacion uniforme, la perdida sobre el conjunto de rutas que pasan y el objetivo de conjunto pasante con continuaciones de fallo reales del profesor propio. La evidencia declarada incluye 3.600 actualizaciones offline del optimizador sobre MPS, 6.144 sesiones de SDK con profesor propio, 9.216 sesiones de SDK de alumno y control, y 240 generaciones Gooo compiladas y ejecutadas de forma independiente contra 3.840 casos Go ordenados. La calibracion selecciono la referencia independiente mas antigua y, segun el autor, esta publicacion no cambia implicitamente el valor por defecto del compilador. Tambien se conserva el primer intento de auditoria nativa rechazado. Todo el runtime, la orquestacion, los tests, las auditorias y el empaquetado estan escritos en Go 1.27.1; Python se usa solo para la optimizacion y exportacion offline sobre MPS.

## Capacidades

- Juicio estructural acotado: clasifica y ordena cuatro rutas legales de cuerpo Gooo a partir de entradas emparejadas vinculadas a codigo fuente y fallos de TDD observados.
- Seleccion de rutas declaradas: el modelo puntua rutas ya declaradas, no genera codigo nuevo ni texto libre.
- Integracion con compilador: se carga mediante la API `jointdecision` del runtime gooo-decision-runtime v0.2.12-experimental y el compilador lo invoca con un fichero `--path-model` explicito.
- Operacion desconectada y determinista: el funcionamiento sin red es determinista, sin dependencia de servicios externos.
- Ejecucion sin asignacion de heap: cada llamada valida al kernel Go asigna cero objetos de heap y usa un workspace de 2.160 bytes propiedad del llamante.
- Trazabilidad de procedencia: los ficheros PROV-O separan entrenamiento, calibracion, observaciones del profesor, inicializacion propia y ejecucion nativa; `publication-manifest.json` vincula cada componente por SHA-256 y numero de bytes.
- Sin tool calling, sin function calling, sin modo "thinking", sin vision ni audio: no disponibles en la informacion proporcionada.
- Multilingue: no aplica en la practica; los metadatos declaran en y ko, pero el modelo no produce texto en esos idiomas.

## Casos de uso

- Seleccion de rutas en el compilador Gooo: el modelo puntua las cuatro rutas legales de un cuerpo Gooo y el compilador usa esa puntuacion para ordenar candidatas antes de la comprobacion de tipos. Es adecuado porque la decision final queda en tests finitos independientes, no en el modelo.
- Reproduccion de experimentos de procedencia: investigadores que estudian trazabilidad de artefactos pueden descargar `raw-evidence.zip` y verificar el manifiesto SHA-256 para reproducir el curriculum congelado, las capturas de profesor y alumno y los registros de ejecucion Go real.
- Comparacion de tecnicas de cuantizacion: al conservar exportaciones FP32, PTQ y QAT del mismo modelo, sirve como banco de pruebas controlado para medir el efecto de la cuantizacion ternaria empaquetada sobre una tarea de clasificacion discreta.
- Estudio de resultados negativos: los tres brazos emparejados y el intento de auditoria nativa rechazado quedan archivados, lo que permite analizar que configuraciones de objetivo no funcionaron y por que.
- Integracion en pipelines de CI de un compilador: dado que el runtime es Go 1.27.1 y cada llamada no asigna heap, el modelo puede incrustarse en un paso de build que ordene rutas candidatas con un coste de memoria minimo (49.648 bytes en FP32).
- Ejecucion en entornos desconectados o con requisitos de determinismo: al no requerir red ni muestreo estocastico, encaja en validaciones reproducibles dentro de infraestructura aislada.
- Docencia sobre modelos diminutos: con 12.412 parametros y pesos en un JSON legible, es un ejemplo practico para ilustrar el ciclo completo de inicializacion aleatoria, entrenamiento, cuantizacion y auditoria en un modelo de juguete.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas tipo MMLU, HumanEval o GSM8K, que por otra parte no aplican a un clasificador de rutas de 12.412 parametros. Como evidencia cuantitativa alternativa, el autor declara 3.600 actualizaciones offline del optimizador sobre MPS, 6.144 sesiones de SDK con profesor propio, 9.216 sesiones de SDK de alumno y control, y 240 generaciones Gooo compiladas y ejecutadas frente a 3.840 casos Go ordenados, remitiendo a `results.md` para los denominadores finitos, las regresiones y los limites de generalizacion.

## Requisitos de hardware

- VRAM: no aplica. Con 12.412 parametros, los pesos FP32 ocupan 49.648 bytes y la variante empaquetada de cinco trits 2.590 bytes; los tensores de runtime suman 12.384 bytes de matrices int8, 112 bytes de sesgos FP32 y 8 bytes de escalas.
- GPU: no se requiere GPU para inferencia. El entrenamiento offline y la exportacion usan MPS, por lo que el flujo de optimizacion se ejecuto sobre hardware Apple.
- GPU de consumo: el modelo cabe en cualquier GPU de consumo e incluso en CPU, dado su tamano en kilobytes.
- Memoria de proceso: el autor indica de forma explicita que la cifra de 1,6 bits por peso trit es independiente de la RAM total del proceso y del limite teorico log2(3).
- Despliegue: mediante el runtime `gooo-decision-runtime` v0.2.12-experimental (API `jointdecision`), cargando `models/fp32/model.json` de un brazo concreto. El compilador `meta-ontology-go` requiere un fichero `--path-model` explicito. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Lo unico declarado es que cada llamada valida al kernel Go asigna cero objetos de heap con un workspace de 2.160 bytes.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica modelos comparables de la misma categoria (clasificadores estructurales diminutos acoplados a un compilador). Las busquedas web realizadas devolvieron unicamente paginas genericas de motores de busqueda y directorios de modelos de proposito general, sin referencias a alternativas equiparables. Cualquier comparacion con LLM actuales seria enganosa, ya que este modelo no genera texto ni resuelve tareas de lenguaje natural.

## Limitaciones y advertencias

- Modelo acotado: no genera texto arbitrario en coreano o ingles, pese a que los metadatos declaren esos idiomas.
- No garantiza la correccion de programas no vistos; solo ordena rutas declaradas dentro del dominio para el que fue construido.
- La aceptacion ejecutable no depende del modelo: la deciden comprobaciones de tipos y tests finitos escritos de forma independiente.
- Dominio reducido: cuatro rutas legales de cuerpo Gooo y 3.840 casos Go ordenados; el propio autor remite a `results.md` para los limites de generalizacion y las regresiones.
- Inicializacion aleatoria sin pesos preentrenados: no hereda capacidades de ningun modelo mayor.
- La calibracion selecciono la referencia independiente mas antigua y esta publicacion no modifica el valor por defecto del compilador, lo que puede generar discrepancias entre lo publicado y el comportamiento por defecto de la herramienta.
- Estado experimental: el runtime se etiqueta como `v0.2.12-experimental` y las etiquetas del repositorio incluyen `experimental`.
- Cero descargas y cero "likes" en el momento de la consulta, sin validacion independiente por parte de terceros.
- Licencia Apache-2.0, que permite uso comercial, pero sin garantias del autor sobre idoneidad ni sobre ausencia de sesgos; no se documentan sesgos conocidos.
- Riesgo de alucinacion: no aplica en el sentido generativo, dado que el modelo clasifica rutas en lugar de producir texto libre.
- Dependencia de toolchain: requiere Go 1.27.1 para el runtime, los tests y el empaquetado, y Python solo para la optimizacion offline sobre MPS.

## Enlaces

- HuggingFace: https://huggingface.co/asketeddy/gooo-joint-feedback-tiny-v2
- Codigo fuente y runners Go reproducibles: https://github.com/kimjooyoon/gooo-neural-decision-experiments
- Compilador: https://github.com/kimjooyoon/meta-ontology-go
- `raw-evidence.zip` y `publication-manifest.json`: incluidos en el repositorio de HuggingFace (referenciados en la model card, sin URL directa disponible)
- `results.md`: referenciado en la model card, sin URL directa disponible
