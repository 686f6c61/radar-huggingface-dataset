# OmenWorks/bend-heads

## Resumen

OmenWorks/bend-heads es un artefacto publicado en HuggingFace cuyo propósito no es un modelo de lenguaje al uso, sino una arquitectura de despliegue basada en "cabezas" (heads) intercambiables sobre una misma copia cargada de un modelo base. Según la model card, la idea central es que "una cabeza no es un modelo, sino la pequeña interfaz que convierte un modelo base cargado en un modo" de decisión estructurada. El usuario elige un modelo por tamaño (`bend-4b`, y por extensión otros tamaños) y luego selecciona una cabeza, cambiando de modo sin recargar nada en memoria.

El repositorio lista cuatro cabezas: `kev-native` (modo de decisión propio del base, incluido con `bend-4b`), `clef-flash` (familia Clef de Cloudflare), `jev-r2` (familia Jev de TypeSafe) y `clef-omni` (release omni de Cloudflare del 2026-10-09, aún en cola). La regla declarada es que cualquier interfaz entrenada sobre un base soportado (se mencionan explícitamente los bases de la familia Qwen) carga y se ejecuta sin trabajo específico por cabeza.

La relevancia del artefacto es conceptual y de ingeniería: propone un patrón de memoria compartida para servir múltiples modos de decisión sobre un único modelo cargado, con "recibos de paridad" numéricos como criterio de admisión. Sin embargo, el repositorio no publica pipeline, licencia, idiomas, tamaño de contexto ni benchmarks de capacidad, y sus cifras de descargas y likes son cero en el momento de la consulta, por lo que se trata de un artefacto muy preliminar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (se describe un sistema de cabezas intercambiables sobre un base; se mencionan bases de la familia Qwen) |
| Parametros totales | No disponible (la nomenclatura `bend-4b` sugiere del orden de 4.000 millones, sin confirmar) |
| Parametros activos | No aplica segun la informacion disponible (no se declara MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se menciona ejecucion en int8 en la ruta GPU de `clef-flash`) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (se menciona un "motor Bend" como runtime de ejecucion) |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura del modelo base (transformer, MoE, hibrido u otra), ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. Tampoco se especifica el formato de pesos ni el pipeline de HuggingFace. Lo unico que se afirma es que el sistema consta de un modelo base por tamano y de cabezas que actuan como interfaces entrenadas que habilitan modos de decision estructurada.

La innovacion declarada es operativa, no arquitectonica del modelo: intercambio de cabezas sobre una unica copia cargada. Los "recibos de paridad" funcionan como puerta de calidad. Para `kev-native` se cita SYS1-DUAL con 28/28 goldens byte-identicos y un consumo de un solo proceso de 6.491 MiB frente a 12.597 MiB del baseline de dos copias. Para `clef-flash` se reporta una paridad |Δp| de 0,0092 frente a la referencia tras corregir un error de conexion, ruta GPU en int8 con ≤0,013 y top-1 24/24, y una ruta MLX funcional. Para `jev-r2` se citan 313/313 ejecuciones byte-precision con un |dp| maximo de 2,2e-6. Se menciona un documento `SUPPORT-MAP.md` con el mapa regenerado y etiquetado por fuente.

## Capacidades

- Declaracion explicita de "modos de decision estructurada" por familia, gestionados mediante cabezas intercambiables.
- Chat y decisiones desde una unica carga en el caso de `kev-native` ("Chat + decisions from one load").
- Interoperabilidad con bases de la familia Qwen segun la regla de "wired shape".
- Ejecucion en motor propio ("Bend engine"), con rutas GPU (int8) y MLX citadas para `clef-flash`.
- No se declaran capacidades de tool calling, agentes, vision, audio, matemáticas ni multilingüismo.
- No se documenta un "modo thinking" ni decodificacion especulativa.

## Casos de uso

- Servicio de multiples modos de decision sobre un unico modelo cargado: un operador podria mantener una sola copia del base en memoria y alternar entre modos de decision de distintas familias sin recargar, reduciendo el uso de VRAM segun las cifras reportadas (6.491 MiB frente a 12.597 MiB en el baseline de dos copias).
- Investigacion en interfaces ligeras de control: el patron de cabeza entrenada sobre un base congelado sirve para estudiar como una interfaz de pocos parametros cambia el comportamiento de decision sin reentrenar el modelo completo.
- Validacion de portabilidad entre runtimes: las rutas GPU int8 y MLX citadas permiten comprobar la reproducibilidad numerica de una misma cabeza en distintos backends.
- Evaluacion de paridad numerica en pipelines de despliegue: los recibos byte-precision (`jev-r2`, 313/313) y los goldens de `kev-native` son utiles como pruebas de regresion al integrar nuevos backends.
- Pruebas de concepto con bases de la familia Qwen: la regla de "wired shape" indica que un base soportado puede adoptar cabezas existentes sin trabajo por cabeza, lo que facilita prototipos rapidos de modos de decision.
- Investigacion sobre escalado por tamano: el esquema "un modelo por tamano" permite comparar el mismo conjunto de cabezas a lo largo de tamanos de base, aunque el repositorio solo menciona explicitamente `bend-4b`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta recibos de paridad numerica, que no miden calidad de tarea:

| Prueba | Cabeza | Resultado reportado |
|---|---|---|
| SYS1-DUAL (goldens) | `kev-native` | 28/28 byte-identicos; 6.491 MiB (un proceso) frente a 12.597 MiB (baseline dos copias) |
| Paridad frente a referencia | `clef-flash` | \|Δp\| 0,0092 tras corregir un error de conexion |
| Ruta GPU int8 | `clef-flash` | ≤0,013; top-1 24/24 |
| Ruta MLX | `clef-flash` | Ejecuta (sin cifras de paridad publicadas) |
| Ejecuciones byte-precision | `jev-r2` | 313/313; \|dp\| maximo 2,2e-6 |
| Release omni Cloudflare | `clef-omni` | No ejecutada aun; en cola |

## Requisitos de hardware

- VRAM estimada: no disponible con caracter general. La model card reporta 6.491 MiB para un unico proceso con SYS1-DUAL sobre `bend-4b`, frente a 12.597 MiB del baseline de dos copias.
- GPU recomendadas: no disponibles. Se citan rutas de ejecucion en GPU (int8) y MLX (Apple Silicon) para `clef-flash`, sin especificar modelos de tarjeta.
- Compatibilidad con GPU de consumo: no confirmada. Las cifras de ~6,5 GiB sugeririan encaje en GPU consumer con 8 GB o mas, pero no se declara oficialmente.
- Opciones de despliegue: motor propietario "Bend engine"; se mencionan rutas GPU y MLX. No se citan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables en la informacion proporcionada. El artefacto no es un modelo de lenguaje con arquitectura y parametros publicos, sino un esquema de cabezas intercambiables, por lo que la comparacion directa con LLM convencionales (por parametros, contexto y benchmark) no es posible con los datos disponibles. No disponible.

## Limitaciones y advertencias

- Ausencia total de licencia declarada, lo que impide determinar si el uso comercial esta permitido.
- Sin pipeline, idiomas, contexto ni formato de pesos publicados: no es viable planificar un despliegue en produccion solo con esta ficha.
- Cero descargas y cero likes en el momento de la consulta; sin comunidad ni validacion externa conocida.
- Los "recibos de paridad" acreditan reproducibilidad numerica, no calidad de las decisiones ni ausencia de alucinacion.
- La propia model card reconoce que una cabeza con arquitectura nueva requiere un port especifico ("dias, no una reescritura"), por lo que la promesa de "sin trabajo por cabeza" solo aplica a la forma ya soportada.
- `clef-omni` figura en cola y no se ha ejecutado; su funcionamiento no esta verificado.
- La informacion sobre alineamiento, sesgos y seguridad es inexistente; no hay datos para evaluar riesgo de alucinacion ni sesgos sistematicos.
- Los resultados de la busqueda web no aportan informacion relevante sobre este artefacto: las referencias encontradas tratan de Anthropic, de rankings generales de LLM, de Omen AI (empresa de analisis de fluidos) y de HP OMEN (gaming), sin relacion con OmenWorks/bend-heads.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OmenWorks/bend-heads
- Referencia a `SUPPORT-MAP.md` citada en la model card (sin URL publica disponible)
- No se han encontrado papers, blogs, repositorios ni demos asociados en la busqueda web.
