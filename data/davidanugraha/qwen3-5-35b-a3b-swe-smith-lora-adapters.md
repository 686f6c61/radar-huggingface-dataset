# davidanugraha/Qwen3.5-35B-A3B-SWE-Smith-LoRA-Adapters

## Resumen

Qwen3.5-35B-A3B SWE-Smith LoRA es un conjunto de adaptadores LoRA (PEFT) publicados por el usuario davidanugraha sobre el modelo base Qwen/Qwen3.5-35B-A3B. No se trata de un modelo completo: el repositorio contiene exclusivamente los pesos del adaptador y el registro de reproducibilidad del entrenamiento, y requiere descargar aparte el modelo base en la revisión exacta `59d61f3ce65a6d9863b86d2e96597125219dc754`. El objetivo declarado es especializar el modelo en resolución automática de incidencias de software dentro de un bucle agéntico.

El entrenamiento se realizó con el algoritmo RLOO (REINFORCE Leave-One-Out) durante una sola época y 143 pasos de optimizador, usando Mini-SWE-Agent como entorno agéntico y una ventana de contexto de 65.536 tokens. El adaptador tiene rango 32, alpha 64 y se aplica a las proyecciones de expertos enrutados, lo que apunta a que el modelo base es una arquitectura de mezcla de expertos, aunque la ficha no detalla la arquitectura del base.

Su relevancia es acotada y muy específica: es un artefacto de investigación reproducible que documenta una curva de evaluación completa sobre SWE-Bench Verified (500 instancias, 15 checkpoints), con un mejor resultado de 58,6 % en el checkpoint 70 frente al 57,8 % del modelo base sin adaptador. El repositorio tiene 0 descargas y 0 me gusta en el momento de la consulta, y no contiene pesos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen3.5-35B-A3B. La arquitectura del modelo base no se detalla en la informacion proporcionada; la nomenclatura 35B-A3B sugiere mezcla de expertos, sin confirmar |
| Parametros totales | No disponible para el adaptador. Rango LoRA 32, alpha 64, aplicado a proyecciones de expertos enrutados. El modelo base se denomina 35B (cifra no confirmada en la documentacion) |
| Parametros activos | No disponible. La nomenclatura A3B del modelo base sugeriria del orden de 3.000 millones, sin confirmar |
| Longitud de contexto | 65.536 tokens (configuracion usada en entrenamiento y evaluacion); respuesta generada maxima de 57.344 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors por checkpoint, formato PEFT/LoRA) |
| Modelo base | Qwen/Qwen3.5-35B-A3B |
| Revision del modelo base | 59d61f3ce65a6d9863b86d2e96597125219dc754 (fijada) |
| Algoritmo de entrenamiento | RLOO, una epoca, 143 pasos de optimizador |
| Tamano de lote | 32 prompts x 8 rollouts por paso |
| Checkpoints incluidos | 15 (step-10 a step-140 en incrementos de 10, mas step-143). El repositorio lista step-10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140 y 143 |
| Tamano del repositorio | 56,7 GB |
| Tarea declarada | text-generation |
| Descargas / me gusta | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango, no un modelo autónomo. La configuracion LoRA emplea rango 32 y alpha 64, y segun la ficha se aplica a las proyecciones de los expertos enrutados del modelo base, lo que es coherente con una arquitectura de mezcla de expertos y con la nomenclatura 35B-A3B del modelo subyacente. No se documenta en la informacion disponible la arquitectura interna del base (numero de capas, numero de expertos, mecanismo de atencion ni tipo de positional encoding).

El entrenamiento se ejecuto con veRL (etiqueta `verl` en el repositorio) usando RLOO durante una unica epoca y 143 pasos de optimizador, con un lote de 32 prompts y 8 rollouts por prompt (256 trayectorias por paso) y muestreo con temperatura 1.0, top-p 1.0 y top-k desactivado. El agente utilizado es Mini-SWE-Agent, con contexto de 65.536 tokens y un maximo de 57.344 tokens generados por respuesta. No se describe en la ficha la composicion del dataset de entrenamiento mas alla de las etiquetas `swe-smith` y `mini-swe-agent`; no hay menciones a RLHF, DPO ni a decodificacion especulativa. El repositorio incluye trazabilidad completa: identidad de la ejecucion, configuracion Hydra, evidencia de preflight, manifiestos por checkpoint, exportacion congelada de W&B con las 143 filas de historial y la imagen de contenedor fijada por digest.

## Capacidades

- Generacion de texto orientada a tareas de ingenieria de software: el adaptador esta entrenado especificamente para resolver incidencias de repositorios dentro de un bucle agente-entorno.
- Ejecucion de comandos y uso de herramientas del sistema: el entrenamiento se realizo con Mini-SWE-Agent, con un tiempo de espera por comando de 60 segundos y hasta 150 turnos por trayectoria, lo que implica interaccion con terminal y edicion de ficheros.
- Razonamiento multi-paso y planificacion a lo largo de trayectorias largas (hasta 150 turnos y 57.344 tokens generados).
- Operacion con contexto largo: 65.536 tokens, suficiente para incluir arboles de repositorio, fragmentos de codigo y trazas de error extensas.
- Capacidades generales del modelo base (matematicas, conocimiento general, otros idiomas): no disponibles en la informacion proporcionada.
- Capacidades multimodales: el autor indica explicitamente que se trata de un LoRA "language-only", por lo que no hay vision ni audio.
- Idiomas soportados: no disponible.

## Casos de uso

- Resolucion automatizada de incidencias en repositorios: el adaptador puede recibir un issue y un repositorio, explorar el arbol de ficheros, editar codigo y ejecutar la bateria de pruebas hasta producir un parche, que es exactamente el escenario sobre el que se evaluo (SWE-Bench Verified, 500 instancias, 150 turnos).
- Reparacion de compilaciones e integracion continua fallidas: dado el registro de errores y el diff del commit, el modelo puede generar un parche candidato que se valida en un pipeline de CI antes de fusionarlo.
- Migraciones de codigo entre versiones de una biblioteca o de un lenguaje: su ventana de 65.536 tokens permite cargar los ficheros afectados y los ficheros de especificacion de dependencias en la misma pasada.
- Triaje de errores y generacion de reproducciones minimas: el modelo puede leer trazas de pila, localizar el punto de fallo y escribir un caso de prueba que reproduzca el problema.
- Asistente de depuracion interactivo con supervision humana: desplegado con vLLM y prefix caching, el adaptador puede mantener una sesion larga en la que el desarrollador aporta contexto adicional tras cada intento fallido.
- Mantenimiento de deuda tecnica por lotes: aplicado a una cola de tareas repetitivas (actualizacion de firmas de API, sustitucion de funciones obsoletas, normalizacion de estilo) con revision humana obligatoria del diff.
- Evaluacion interna de agentes de codigo: el repositorio puede reutilizarse como banco de pruebas para comparar checkpoints, temperaturas o agentes, dado que incluye el cohorte de 500 instancias y el hash de compatibilidad.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible corresponden a SWE-Bench Verified, con un cohorte fijo de 500 instancias, hash de compatibilidad `0446d1a5f3bf182f6de1b7c7d241fc550ccfedcd624478fe18851de057c7682c`, Mini-SWE-Agent, temperatura 1.0, contexto de 65.536 tokens, 150 turnos, 60 segundos de espera por comando, dos horas de espera por trayectoria y concurrencia 128.

| Checkpoint | Resueltas | Puntuacion | Timeouts de agente | Errores de infraestructura | Truncadas |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 0 (base sin adaptador) | 289/500 | 57,8 % | 16 | 16 | 106 |
| 10 | 267/500 | 53,4 % | 75 | 68 | 67 |
| 20 | 289/500 | 57,8 % | 38 | 27 | 75 |
| 30 | 272/500 | 54,4 % | 52 | 45 | 61 |
| 40 | 281/500 | 56,2 % | 23 | 22 | 61 |
| 50 | 282/500 | 56,4 % | 17 | 16 | 71 |
| 60 | 290/500 | 58,0 % | 12 | 12 | 54 |
| 70 | 293/500 | 58,6 % | 17 | 17 | 49 |
| 140 | 265/500 | 53,0 % | 5 | 5 | 9 |
| 143 (final) | 273/500 | 54,6 % | 0 | 0 | 10 |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, LiveCodeBench u otros) en la informacion disponible.

## Requisitos de hardware

- El adaptador en si es ligero (rango 32 sobre proyecciones de expertos), pero exige cargar el modelo base completo; el coste de VRAM lo determina el base, no el LoRA.
- Estimaciones de VRAM para el modelo base a partir de su tamano nominal de 35.000 millones de parametros (no verificadas con la documentacion publicada): del orden de 70 GB en fp16/bf16, 35 GB en int8 y 18-22 GB en 4 bits.
- La receta oficial del autor usa vLLM con `--tensor-parallel-size 4` y `--max-model-len 65536`, es decir, cuatro GPU para servir el modelo a contexto completo. El tipo concreto de GPU no se especifica.
- GPU recomendadas: no disponibles. Por capacidad de memoria, configuraciones de 4x A100 80 GB o 4x H100 80 GB entran con holgura; una unica GPU de 80 GB podria alojar el modelo cuantizado, pero no esta documentado.
- Cabe en GPU de consumo: no confirmado. Con cuantizacion de 4 bits el modelo base rondaria los 18-22 GB, lo que encajaria en una RTX 4090 de 24 GB, pero el autor no documenta esta ruta y la atencion con 65.536 tokens de contexto incrementa la memoria de KV cache de forma significativa.
- Opciones de despliegue documentadas: vLLM con `--enable-lora --max-lora-rank 64` y prefix caching activado. No se documentan Ollama, llama.cpp, TGI ni otras alternativas.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de mezcla de expertos con pocos parametros activos, el coste por token seria previsiblemente inferior al de un denso de 35B, pero no hay mediciones publicadas.
- Los 56,7 GB del repositorio corresponden a 15 adaptadores y al material de reproducibilidad, no a pesos del modelo base.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La unica comparacion documentada es contra el propio modelo base sin adaptador y contra otros checkpoints del mismo entrenamiento, sobre SWE-Bench Verified:

| Variante | Parametros | Contexto | SWE-Bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-35B-A3B (base, checkpoint 0) | 35B nominal (no confirmado) | no disponible | 57,8 % (289/500) | apache-2.0 (del adaptador; la del base no se detalla) | HuggingFace (revision fijada) |
| Este adaptador, checkpoint 70 (mejor) | Adaptador LoRA r32/a64 sobre el base | 65.536 tokens | 58,6 % (293/500) | apache-2.0 | HuggingFace |
| Este adaptador, checkpoint 143 (final) | Adaptador LoRA r32/a64 sobre el base | 65.536 tokens | 54,6 % (273/500) | apache-2.0 | HuggingFace |

No se identifican en la busqueda web modelos alternativos de la misma categoria con datos publicados en la informacion disponible.

## Limitaciones y advertencias

- Mejora marginal sobre el baseline: el mejor checkpoint (70) logra 58,6 % frente al 57,8 % del modelo base sin adaptador, una diferencia de 0,8 puntos porcentuales, equivalentes a 4 instancias sobre 500. Es plausible que parte de esa diferencia quede dentro del ruido de evaluacion.
- El checkpoint final no es el mejor: el step-143 rinde un 54,6 %, 3,2 puntos por debajo del step-70. Cargar el checkpoint terminal por inercia degrada el resultado.
- Inestabilidad a lo largo del entrenamiento: checkpoints intermedios como el step-10 (53,4 %) o el step-30 (54,4 %) rinden por debajo del propio modelo base, con picos elevados de timeouts de agente (75 en el step-10) y errores de infraestructura (68 en el step-10).
- Tasa de truncamiento elevada en varias evaluaciones: 106 de 500 trayectorias truncadas en el baseline y 75 en el step-20. Esto afecta a la comparabilidad entre brazos y sugiere que el harness es un factor limitante en si mismo.
- El repositorio no contiene los pesos del modelo base. Es imprescindible descargar Qwen/Qwen3.5-35B-A3B en la revision exacta `59d61f3ce65a6d9863b86d2e96597125219dc754`; usar otra revision invalida la reproducibilidad.
- Dominio muy restringido: es un ajuste para resolucion de incidencias de software. No hay evidencia de que conserve capacidades generales de conversacion, matematicas o multilingueismo tras el entrenamiento con RLOO.
- Idiomas soportados: no disponibles. Todo el material de evaluacion es de codigo y en ingles.
- Riesgo de alucinacion: en tareas de reparacion de codigo, un parche plausible pero incorrecto puede compilar y aun asi introducir regresiones logicas o de seguridad. Es obligatorio validar cada parche con la bateria de pruebas del repositorio y revision humana.
- Sin validacion externa: 0 descargas y 0 me gusta en el momento de la consulta. No hay informes independientes que reproduzcan los numeros.
- Licencia: el adaptador se publica bajo apache-2.0, pero la licencia del modelo base debe verificarse por separado antes de un uso comercial.
- Requisitos de servicio exigentes: el contexto de 65.536 tokens incrementa de forma notable la memoria de KV cache, lo que encarece el despliegue frente a configuraciones de contexto corto.
- El material de `provenance/repository-at-export/` no se garantiza byte a byte identico a la imagen de entrenamiento; solo `provenance/training-image/` se presenta como fuente autoritativa.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/davidanugraha/Qwen3.5-35B-A3B-SWE-Smith-LoRA-Adapters
- Modelo base Qwen/Qwen3.5-35B-A3B: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- No se han encontrado en la busqueda web enlaces relevantes (papers, blogs, repositorios de evaluacion o demos) asociados a este modelo. Los resultados devueltos corresponden a dominios sin relacion con el artefacto.
