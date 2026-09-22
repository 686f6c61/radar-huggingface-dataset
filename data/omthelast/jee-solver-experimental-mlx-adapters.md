# OmTheLast/jee-solver-experimental-mlx-adapters

## Resumen

jee-solver-experimental-mlx-adapters es un repositorio de adaptadores LoRA experimentales creado por el usuario OmTheLast, entrenados sobre el modelo cuantizado a 4 bits mlx-community/Qwen3.5-9B-4bit (derivado del upstream Qwen/Qwen3.5-9B). No se trata de un modelo independiente ni de un solver de examen validado: el propio autor lo describe como un archivo de investigacion cuyo objetivo es documentar la progresion real de cinco adaptadores, incluidas las regresiones, en la tarea de resolver preguntas del examen indio JEE (matematicas, fisica y quimica). El repositorio ocupa 0,0 GB porque solo contiene los tensores LoRA entrenables, configuraciones y codigo auxiliar; los pesos del modelo base no se duplican.

Tecnicamente, cada adaptador es un LoRA de rango 4 aplicado sobre las ultimas capas MLP del modelo de lenguaje, con el encoder de vision y los pesos base congelados durante el entrenamiento. El pipeline declarado es image-text-to-text, lo que indica que el sistema base procesa imagenes (enunciados con diagramas) ademas de texto. Los adaptadores son especificos de MLX-VLM y no son adaptadores PEFT estandar, por lo que solo se cargan en entornos Apple Silicon compatibles con la libreria MLX.

Su relevancia actual es metodologica mas que de rendimiento: la model card documenta de forma explicita que ninguna de las cinco variantes supero el criterio de promocion predefinido (una mejora de respuestas que no degradase la calidad de procedimiento por debajo de 21/24 en la muestra de desarrollo). Es, por tanto, un ejemplo de publicacion de resultados negativos y de disciplina de seleccion de checkpoints, no una herramienta lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre transformer multimodal (image-text-to-text); encoder de vision congelado |
| Parametros totales | 9B en el modelo base (segun denominacion Qwen3.5-9B); los adaptadores anaden solo tensores LoRA de rango 4, no disponible el recuento exacto |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Base en 4 bits MLX (mlx-community/Qwen3.5-9B-4bit); los adaptadores se distribuyen en safetensors sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | adapters/*/adapter.safetensors (LoRA) + jee_adapter.json (configuracion propia del proyecto, no PEFT) |
| Modelo base | mlx-community/Qwen3.5-9B-4bit, revision 8b2b98c00a6b4d291155e4890773ca8f769aee53 |
| Pipeline | image-text-to-text |
| Libreria | mlx (MLX 0.32.2 y MLX-VLM 0.7.1 en el entorno probado) |
| Tamano del repositorio | 0,0 GB |
| Fecha de creacion | 2026-09-22 |

## Arquitectura y entrenamiento

El punto de partida es Qwen3.5-9B en su cuantizacion de 4 bits para MLX, un modelo multimodal que acepta imagen y texto como entrada. Sobre el se entrenaron cinco adaptadores LoRA de rango 4, aplicados en distintos alcances: la serie reliable01 adapto las tres ultimas capas MLP del modelo de lenguaje durante 30, 60 y 90 pasos; la variante coverage16 amplio el alcance a las 16 ultimas capas con 60 pasos; y data60 mantuvo las tres capas pero amplio los datos a 60 familias de preguntas. El encoder de vision y el resto de los pesos permanecieron congelados en todos los experimentos.

Los datos de entrenamiento consisten en 30 o 60 familias de preguntas de JEE revisadas por la fuente y equilibradas entre los niveles Main y Advanced, cubriendo matematicas, fisica y quimica. El autor indica explicitamente que las preguntas y soluciones originales del examen no se incluyen en la release, asi que no es posible reproducir el entrenamiento a partir del repositorio. No se menciona uso de RLHF, DPO ni decodificacion especulativa. La innovacion tecnica destacable es metodologica: un conjunto de validacion fijo de 12 preguntas (Validation01) con semilla 0, temperatura 0, tope de 4096 tokens de salida y limite de 240 segundos, junto con un criterio de promocion declarado de antemano que ninguna variante de esta serie logro superar.

Las variantes se detuvieron en sus puertas de decision. El autor advierte que la muestra de 12 preguntas es demasiado pequena para sostener cualquier afirmacion amplia de precision, y que un adaptador seleccionado localmente en una ejecucion anterior (step 60) quedo empatado con la base sin adaptar en una evaluacion posterior de 29 preguntas.

## Capacidades

- Generacion de texto y resolucion de problemas de matematicas, fisica y quimica del temario JEE, con salida de respuesta final y desarrollo de procedimiento.
- Entrada multimodal imagen-texto: el pipeline declarado es image-text-to-text, por lo que la base puede procesar enunciados con diagramas, aunque el autor senala que la lectura de diagramas sigue fallando en algunas preguntas.
- Razonamiento multi-paso limitado: la model card reconoce fallos en descomposicion de problemas, calculo, verificacion, manejo de convenciones y compromiso con la respuesta final.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible; el autor senala que un solver de cara al estudiante requeriria un harness probado de descomposicion, calculo, verificacion y parada que no forma parte de esta release.
- Capacidades multilingues: no disponible.
- Capacidades especiales: modo thinking, audio u otras no disponibles.
- Modo de uso principal: carga local de un adaptador concreto mediante load_mlx.py sobre Apple Silicon.

## Casos de uso

- Reproduccion de experimentos de ajuste fino: cargar un adaptador con load_mlx.py sobre la revision fijada del modelo base y verificar los hashes de SHA256SUMS para confirmar que los resultados de la tabla de desarrollo son reproducibles en una maquina Apple Silicon concreta.
- Investigacion sobre metodologia de evaluacion de LoRA: el repositorio documenta criterios de promocion declarados de antemano, puertas de decision y resultados negativos, lo que lo convierte en material util para estudiar como se disenan y se fallan protocolos de seleccion de checkpoints.
- Estudio de curriculos de entrenamiento en dominios cientificos: comparar las ramas reliable01 (30 familias, 3 capas), coverage16 (30 familias, 16 capas) y data60 (60 familias, 3 capas) permite analizar el efecto del alcance de adaptacion frente al volumen de datos en un presupuesto de computo minimo.
- Desarrollo de harnesses de evaluacion para examenes: el formato de salida (respuestas estrictas, puntos de procedimiento, topes de tokens) sirve como referencia para construir un evaluador propio de problemas de fisica y matematicas, incluida la metrica de respuestas truncadas por presupuesto de tokens.
- Prototipado educativo local en Mac: sobre un Mac con Apple Silicon, un desarrollador puede ejecutar el adaptador para estudiar el comportamiento del modelo ante enunciados de nivel JEE sin enviar datos a servicios externos.
- Analisis del compromiso precision-procedimiento: el caso coverage16 (8/12 respuestas estrictas pero 14/24 puntos de procedimiento) es un ejemplo concreto para estudiar como la adaptacion amplia puede mejorar la respuesta final a costa de degradar el desarrollo del razonamiento.
- Auditoria de artefactos publicados: revisar release.json, SHA256SUMS y jee_adapter.json permite practicar la verificacion de procedencia de adaptadores no estandar antes de integrarlos en cualquier flujo.

## Benchmarks y rendimiento

Los unicos datos disponibles son internos, proceden de la rebanada de desarrollo Validation01 de 12 preguntas y no constituyen un benchmark publico. Todas las filas usan las mismas condiciones de inferencia: semilla 0, temperatura 0, tope de 4096 tokens de salida y limite de 240 segundos. Los puntos de procedimiento son valoraciones del coordinador (valido=2, parcial=1, invalido=0), no certificacion de expertos externos. "Tope" indica una salida detenida por el limite de 4096 tokens. Las puntuaciones corresponden a respuestas finales estrictas.

| Condicion | Exposicion de entrenamiento | Respuestas estrictas | Puntos de procedimiento | Topes de tokens |
|---|---|---:|---:|---:|
| Base sin modificar | — | 7/12 | 17/24 | 5 |
| reliable01-step030 | 30 familias, 3 capas, paso 30 | 7/12 | 16/24 | 4 |
| reliable01-step060 | 30 familias, 3 capas, paso 60 | 7/12 | 18/24 | 5 |
| reliable01-step090 | 30 familias, 3 capas, paso 90 | 7/12 | 17/24 | 5 |
| coverage16-step060 | 30 familias, 16 capas, paso 60 | 8/12 | 14/24 | 2 |
| data60-step060 | 60 familias, 3 capas, paso 60 | 7/12 | 16/24 | 5 |

Contexto adicional proporcionado por el autor: el umbral declarado de antemano era 21/24 en puntos de procedimiento para aceptar un empate en respuestas, y ninguna variante lo alcanzo. La rama coverage16 logro 8/12 respuestas y solo 2 topes, pero cayo a 14/24 en procedimiento. En una ejecucion controlada anterior se selecciono un adaptador de paso 60 dentro de esa ejecucion, pero su evaluacion posterior de 29 preguntas empató con la base sin modificar. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los resultados obtenidos eran paginas de cadenas de pizzerias y no guardan relacion con la ficha.

## Requisitos de hardware

- Entorno obligatorio: MLX y MLX-VLM sobre Apple Silicon. El entorno probado por el autor es MLX 0.32.2 y MLX-VLM 0.7.1; al ser adaptadores especificos de MLX-VLM y no adaptadores PEFT estandar, no son portables directamente a otros runtimes.
- VRAM/memoria unificada estimada: el modelo base son 9B parametros en cuantizacion de 4 bits, lo que situa los pesos en aproximadamente 5-6 GB; hay que sumar el coste del encoder de vision, la cache KV y el tope de 4096 tokens de salida. No disponible una cifra oficial del autor.
- GPU recomendadas: no disponible. No se documenta uso en A100, H100 ni RTX 4090; de hecho, esos entornos no son compatibles con MLX sin una conversion previa de los adaptadores, que el autor no proporciona.
- Cabe en hardware de consumo: si se dispone de un Mac con Apple Silicon y memoria unificada suficiente (el propio autor indica que no se ha demostrado despliegue local en navegador ni en telefono con estos artefactos de 9B).
- Opciones de despliegue: unicamente carga local mediante load_mlx.py. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y la pagina del Hub no aloja endpoint de inferencia interactivo.
- Latencia y throughput: no disponibles. Si se documenta el limite de 240 segundos por pregunta y topes de 4096 tokens de salida, con 5 de 12 preguntas truncadas en el caso base y 2 de 12 en coverage16.
- Almacenamiento: el repositorio ocupa 0,0 GB, pero la descarga del modelo base cuantizado desde el Hub es necesaria para cualquier ejecucion.

## Comparativa con modelos similares

No se dispone de informacion sobre otros adaptadores o solvers de JEE comparables en la documentacion proporcionada. La unica comparacion con datos es contra el propio modelo base sin adaptar, que forma parte del mismo repositorio.

| Sistema | Parametros | Contexto | Respuestas estrictas (Validation01) | Procedimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jee-solver-experimental (coverage16-step060) | 9B + LoRA rango 4 | No disponible | 8/12 | 14/24 | Apache-2.0 | Repositorio HuggingFace, requiere base MLX 4-bit |
| jee-solver-experimental (reliable01-step060) | 9B + LoRA rango 4 | No disponible | 7/12 | 18/24 | Apache-2.0 | Repositorio HuggingFace, requiere base MLX 4-bit |
| mlx-community/Qwen3.5-9B-4bit (base sin modificar) | 9B | No disponible | 7/12 | 17/24 | Apache-2.0 | HuggingFace |
| Otros solvers de JEE comparables | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un producto fiable para responder examenes. El autor lo declara explicitamente: es un registro de investigacion experimental, no un solver de JEE validado.
- Ningun checkpoint de esta serie fue promovido. La regla de seleccion congelada no elevo ninguna variante por encima del criterio declarado, y las ramas mas recientes se detuvieron en sus puertas de decision.
- La muestra de validacion tiene 12 preguntas y se reutilizo para inspeccionar y seleccionar checkpoints, por lo que no sirve como evidencia independiente de rendimiento general en JEE.
- Los puntos de procedimiento son valoraciones del coordinador, no certificacion de expertos externos. La certificacion por expertos de materia y las pruebas de generalizacion mas amplias siguen pendientes.
- Fallos reconocidos: lectura de diagramas, razonamiento multi-paso, compromiso con la respuesta final y gestion del presupuesto de tokens. Una respuesta final parseable puede seguir siendo incorrecta.
- Riesgo de alucinacion: no cuantificado explicitamente, pero se deriva de los fallos de razonamiento y calculo reconocidos en la model card.
- Sesgos conocidos: no disponibles. Los datos de entrenamiento son 30 o 60 familias de preguntas de JEE equilibradas entre Main y Advanced, lo que limita fuertemente la cobertura tematica y linguistica.
- Limitaciones de idioma: no disponibles. No se declara lista de idiomas soportados.
- Restricciones de licencia: Apache-2.0, tanto para los adaptadores como para el modelo base segun los avisos de las paginas correspondientes. No se declaran restricciones adicionales de uso comercial.
- Portabilidad: los adaptadores son especificos de MLX-VLM y no son adaptadores PEFT estandar. No se pueden cargar en frameworks habituales de inferencia sin trabajo de conversion no documentado.
- Los pesos del modelo base no se incluyen en el repositorio y hay que descargarlos aparte; hay que respetar la revision fijada (8b2b98c00a6b4d291155e4890773ca8f769aee53) para reproducir resultados.
- Ausencia de datos sensibles: no se incluyen imagenes o textos de preguntas, respuestas, material de revision privado ni interacciones de usuario. Esto implica que el entrenamiento no es reproducible a partir de la release.
- No se ha demostrado despliegue local en navegador ni en telefono con estos artefactos de 9B.
- La busqueda web realizada no arrojo ninguna fuente independiente, publicacion o evaluacion externa sobre este repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OmTheLast/jee-solver-experimental-mlx-adapters
- Modelo base cuantizado en MLX: https://huggingface.co/mlx-community/Qwen3.5-9B-4bit
- Modelo upstream original: https://huggingface.co/Qwen/Qwen3.5-9B
- Script de carga local: load_mlx.py (incluido en el repositorio)
- Historial de experimentos: EXPERIMENT_HISTORY.md (incluido en el repositorio)
- Ficheros de procedencia y verificacion: release.json, SHA256SUMS y history.csv (incluidos en el repositorio)
- Papers, blogs, repositorios o demos adicionales: no disponibles; la busqueda web no devolvio resultados relacionados con el modelo.
