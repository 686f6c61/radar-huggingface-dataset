# adampippert/granite-decisions

## Resumen

`adampippert/granite-decisions` es un repositorio de investigacion personal de Adam Pippert que publica **codigo fuente y una receta de entrenamiento, no pesos de un modelo ni un checkpoint afinado**. Se apoya en el modelo base `ibm-granite/granite-4.1-3b` (Apache-2.0) de IBM, que se descarga desde su repositorio oficial, y define un runtime local de decisiones tipadas en torno a el. El aviso de la propia model card es explicito: el repositorio no se puede cargar con `from_pretrained()`.

El artefacto resuelve un problema concreto de integracion: convertir las salidas de un modelo de lenguaje en decisiones estructuradas y calibradas de tres tipos (distribuciones Choice, rubricas Score ordenadas y probabilidades Boolean Noul), con abstencion por defecto ante salidas no calibradas, baja probabilidad, ambiguedad o etiquetas desconocidas designadas. La audiencia objetivo son desarrolladores e investigadores que quieran adaptar un modelo de decision local a sus propios casos de uso etiquetados.

Es relevante ahora porque documenta una receta reproducible completa (baseline nativo, cabezas lineales sobre caracteristicas congeladas, calibracion por temperatura y un LoRA supervisado opcional) junto con sus resultados medidos y sus limitaciones, incluidos los fallos: el smoke test de LoRA degrada la NLL de validacion de 0,0459 a 3,7917. La publicacion data del 18 de septiembre de 2026, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible: el repositorio no publica pesos ni define arquitectura propia; el runtime envuelve el modelo base `ibm-granite/granite-4.1-3b` |
| Parametros totales | No disponible para este repositorio. El nombre del modelo base indica 3B; consultar la model card de IBM para el dato exacto |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M GGUF (baseline de inferencia oficial de IBM, con descarga fijada y checksum); BF16 para el entrenamiento LoRA opcional |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT para el codigo del proyecto y los fixtures sinteticos originales; los pesos de IBM son Apache-2.0; llama.cpp es MIT |
| Formato de pesos | No se distribuyen pesos propios. El repositorio no incluye checkpoint cargable; el baseline usa GGUF Q4_K_M descargado desde IBM |
| Pipeline | No disponible |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 18 de septiembre de 2026 |
| Commit de origen | `543345ea033370484ca226424afd73164d48ca35` |

## Arquitectura y entrenamiento

El proyecto no define una arquitectura neuronal nueva. Define una capa de decision sobre el backbone de Granite 4.1 3B con tres rutas: un baseline nativo que consulta el modelo en secuencia y admite hasta 26 opciones por pregunta; una ruta rapida de cabezas lineales ajustadas de forma independiente sobre caracteristicas congeladas de Granite; y una adaptacion opcional del backbone mediante LoRA con entropia cruzada supervisada en BF16. La calibracion se realiza ajustando la temperatura sobre una particion etiquetada separada. La implementacion de LoRA se declara explicitamente como no propietaria de RLCD, y la interfaz de referencia esta inspirada en Jev (`docs.typesafe.ai`), sin ser un producto afiliado ni un reemplazo exacto del SDK de TypeSafe.

Los datos publicados son enteramente sinteticos y deterministicos, generados con plantillas en `scripts/make_smoke_data.py`, con particiones de 54 filas de entrenamiento, 54 de calibracion y 54 de test en `validation/hyde-20260917/synthetic-data`. Las plantillas se dividen por grupo, pero el vocabulario y los temas se solapan. No se uso ningun dataset de tareas de terceros ni salidas de Jev como etiquetas; Jev se evaluo por separado sobre las mismas 54 entradas de test. Los datos de preentrenamiento y postentrenamiento de Granite quedan fuera del control del proyecto. El smoke test de LoRA (tres pasos) verifico gradientes en GPU, actualizacion de pesos, guardado y recarga, pero su NLL de validacion empeoro de 0,0459 a 3,7917, y ese checkpoint no se incluye ni se recomienda.

## Capacidades

- Enrutamiento de decisiones tipo Choice: produce distribuciones de probabilidad sobre un conjunto cerrado de opciones.
- Puntuacion mediante rubricas Score ordenadas.
- Probabilidades Boolean (etiquetadas como Noul en la documentacion).
- Abstencion por defecto ante salidas no calibradas, baja probabilidad, ambiguedad o etiquetas desconocidas designadas.
- Calibracion de confianza por ajuste de temperatura sobre una particion etiquetada.
- Ruta rapida de inferencia con cabezas lineales ajustadas sobre caracteristicas congeladas de Granite, que requiere definiciones de pregunta registradas.
- Hasta 26 opciones por pregunta en el baseline nativo, evaluadas de forma secuencial.
- Adaptacion opcional del backbone con LoRA supervisado en BF16.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no, el campo de idioma declara unicamente ingles.
- Vision, audio o modo thinking: no disponible.
- Naturaleza asesorativa: las decisiones son advisory, es decir, no constituyen autorizacion para actuar.

## Casos de uso

- Enrutamiento de tickets de soporte: el runtime asigna cada ticket a una cola predefinida mediante una distribucion Choice sobre las categorias registradas, con abstencion cuando la confianza calibrada es baja, de modo que los casos dudosos pasan a revision humana.
- Triaje de incidencias en CI/CD: dado un fallo de build, el modelo clasifica la causa probable entre opciones acotadas y la politica de abstencion evita enrutar automaticamente fallos ambiguos.
- Moderacion binaria con umbral calibrado: se usa el campo Boolean Noul para producir una probabilidad calibrada que se compara con un umbral definido por el equipo, en lugar de depender de una generacion de texto libre.
- Puntuacion de calidad documental: con rubricas Score ordenadas se puntuan respuestas, resumenes o articulos segun criterios definidos, y la calibracion por temperatura permite fijar cortes consistentes entre lotes.
- Investigacion sobre calibracion y decision estructurada: el repositorio sirve como banco de pruebas reproducible para comparar cabezas congeladas, backbone sin ajustar y adaptacion LoRA sobre un conjunto sintetico de 54 ejemplos por particion.
- Clasificacion de encuestas abiertas: las respuestas de texto libre se mapean a un conjunto fijo de categorias registradas, con las preguntas definidas de antemano para habilitar la ruta rapida de cabezas lineales.
- Filtrado previo en pipelines de anotacion: el modelo propone etiquetas con probabilidad calibrada y el equipo humano revisa unicamente los casos por debajo del umbral, reduciendo el volumen de revision manual.
- Prototipado de decisiones sujetas a auditoria: al conservar la distribucion completa y no solo la etiqueta ganadora, el sistema permite registrar la incertidumbre junto a cada decision para su trazabilidad.

## Benchmarks y rendimiento

Los unicos numeros publicados corresponden a un conjunto sintetico de test de 54 filas del propio proyecto y la model card advierte explicitamente de que no deben presentarse como un benchmark representativo. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Sistema | Routing | Boolean | Scope |
|---|---|---|---|
| Jev | 100,0% | 100,0% | 100,0% |
| Granite sin ajustar | 98,1% | 50,0% | 92,6% |
| Cabezas congeladas | 61,1% | 77,8% | 72,2% |

Dato adicional de entrenamiento: el smoke test LoRA de tres pasos hizo empeorar la NLL de validacion de 0,0459 a 3,7917, y el checkpoint resultante no se incluye ni se recomienda.

## Requisitos de hardware

- El proyecto se probo en una AMD Radeon 8060S (gfx1151) bajo Fedora Atomic 44 con un Toolbx dedicado.
- Se observo offload de capas en ROCm para 41 de 41 capas.
- El uso opcional de PyTorch emplea ROCm 7.2.
- RHEL, OpenShift, CUDA y otras GPU no han sido validados. Las pruebas unitarias en CPU no establecen compatibilidad con GPU.
- El baseline de inferencia usa el GGUF Q4_K_M oficial de IBM con descarga fijada y checksum; el tamano de VRAM resultante no se detalla en la informacion disponible.
- No hay datos publicados de latencia ni throughput.
- Opciones de despliegue: descarga del GGUF oficial y ejecucion con llama.cpp (MIT, licencia incluida junto al parche del proyecto). No se documentan integraciones con vLLM, Ollama ni TGI.
- La promocion de un adaptador afinado a GGUF no ha sido validada por ninguna ruta.

## Comparativa con modelos similares

No se describen modelos alternativos comparables en la informacion proporcionada. La unica referencia externa evaluada es Jev, sobre el mismo conjunto de 54 entradas de test, sin que se detallen sus parametros, contexto ni licencia. La comparativa interna disponible es la siguiente:

| Sistema | Base | Ajuste | Routing | Boolean | Scope |
|---|---|---|---|---|---|
| Granite sin ajustar | Granite 4.1 3B, Q4_K_M | Ninguno | 98,1% | 50,0% | 92,6% |
| Cabezas congeladas | Granite 4.1 3B, caracteristicas congeladas | Cabezas lineales independientes | 61,1% | 77,8% | 72,2% |
| Jev | No disponible | No disponible | 100,0% | 100,0% | 100,0% |
| LoRA supervisado (smoke) | Granite 4.1 3B, BF16 | LoRA CE, 3 pasos | No evaluado en routing; NLL de validacion degradada a 3,7917 | | |

Comparativa con alternativas de la misma categoria (parametros, contexto, licencia y disponibilidad): no disponible.

## Limitaciones y advertencias

- El repositorio publica codigo y receta de entrenamiento, no pesos: no se puede cargar con `from_pretrained()` y no existe un checkpoint afinado de calidad de produccion.
- Los resultados proceden de un conjunto sintetico de 54 filas por particion, con plantillas separadas por grupo pero vocabulario y temas solapados; no son extrapolables a produccion.
- El smoke test de LoRA degrada la NLL de validacion de 0,0459 a 3,7917 y el checkpoint no se recomienda ni se incluye.
- La ruta rapida de cabezas lineales exige definiciones de pregunta registradas y obtuvo el peor resultado de enrutamiento (61,1%) de los tres sistemas medidos.
- La calibracion sobre esquemas nuevos, la fiabilidad fuera de dominio y la robustez frente a ataques adversariales no estan probadas.
- El baseline nativo evalua las preguntas de forma secuencial y esta limitado a 26 opciones por pregunta.
- Las decisiones son asesorativas: la validez sintactica de la salida no implica correccion del juicio, y la confianza no es autoridad para actuar.
- El modelo base es de IBM, con licencia Apache-2.0, y su comportamiento depende de datos de preentrenamiento y postentrenamiento fuera del control del proyecto; deben consultarse sus sesgos en la model card original.
- Solo se declara soporte de ingles, con el consiguiente riesgo de degradacion en otros idiomas.
- Riesgo de alucinacion: no evaluado ni cuantificado en la informacion disponible.
- La integracion con Fullcollar esta diferida.
- El proyecto no es una release de IBM, Red Hat ni TypeSafe, ni un reemplazo exacto del SDK de Jev.
- Solo se ha validado en hardware AMD con ROCm; no hay validacion en CUDA ni en CPU mas alla de pruebas unitarias.
- Al redistribuir pesos o componentes deben conservarse las licencias upstream (MIT para el codigo del proyecto y los fixtures sinteticos originales, Apache-2.0 para los pesos de IBM, MIT para llama.cpp).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/adampippert/granite-decisions
- Codigo fuente, release v0.1.0: https://github.com/AdamPippert/granite-decisions/tree/v0.1.0
- Dataset sintetico original: https://huggingface.co/datasets/adampippert/granite-decisions-synthetic
- Pesos oficiales de IBM (modelo base): https://huggingface.co/ibm-granite/granite-4.1-3b
- Documentacion de Jev (interfaz de referencia): https://docs.typesafe.ai/introduction
- Guia de instalacion y quickstart: `PROJECT_README.md` (incluido en el repositorio)
- Instrucciones de entrenamiento: `TRAINING.md` (incluido en el repositorio)
- Evidencia de validacion y particiones de datos: `validation/hyde-20260917`
- La busqueda web realizada no devolvio enlaces relevantes al modelo: los resultados corresponden a la conferencia ICOLD 2027 sobre grandes presas y no guardan relacion con este repositorio.
