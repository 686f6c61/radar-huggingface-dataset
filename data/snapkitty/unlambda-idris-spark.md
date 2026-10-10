# Snapkitty/unlambda-idris-spark

## Resumen

`Snapkitty/unlambda-idris-spark` no es un modelo de lenguaje ni una red neuronal: es un repositorio de verificacion formal publicado en HuggingFace como espejo de un repositorio de GitHub. Contiene un andamiaje de pruebas (verification scaffold) que combina interfaces tipadas en ATS/Postiats, terminos de prueba escritos a mano en Idris 2 y un contador de asignacion acotado verificado con SPARK/GNATprove. El objetivo declarado es formalizar derivaciones SKI del calculo lambda de Unlambda y comprobar sus invariantes mediante varias cadenas de herramientas dependientes de tipos y verificacion deductiva.

El autor es Snapkitty (Ahmad Ali Parr, segun el aviso de copyright del README) y la publicacion forma parte del denominado "SnapKitty October 2026 main drop". La version etiquetada es la v1.0.0 y se distribuye bajo una licencia propietaria de tipo "source-visible": el codigo es publico y legible, pero no es open source y no concede derechos de uso, modificacion ni redistribucion mas alla de lo permitido por el titular.

Resulta relevante en el contexto de HuggingFace porque ejemplifica la presencia creciente de artefactos no-ML (pruebas formales, entornos de verificacion, toolchains) alojados en la plataforma. Sin embargo, cualquier lector que llegue buscando un modelo de inferencia debe saber que no lo es: no hay pesos, no hay parametros, no hay tokenizador ni pipeline. El tamano declarado del repositorio es de 0,0 GB y no registra descargas ni "likes".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplicable (no es un modelo neuronal; es un scaffold de verificacion formal multi-lenguaje) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable |
| Longitud de contexto | no aplicable |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (el repositorio usa ingles en documentacion y codigo) |
| Licencia | proprietary-source-visible (LicenseRef-Proprietary, copyright Ahmad Ali Parr, 2026) |
| Formato de pesos | no aplicable (sin pesos; contiene fuentes `.sats`, `.idr`, `.adb/.ads` y scripts shell) |

Datos adicionales del listado de HuggingFace:

| Campo | Valor |
|---|---|
| ID | Snapkitty/unlambda-idris-spark |
| Autor | Snapkitty |
| Fecha de creacion | 2026-10-10 |
| Fecha de actualizacion | 2026-10-10 |
| Descargas | 0 |
| Likes | 0 |
| Tamano del repo | 0,0 GB |
| Commit espejo | a42eccc (GitHub SNAPKITTYWEST/unlambda-idris-spark) |

## Arquitectura y entrenamiento

No existe entrenamiento ni conjunto de datos. El "modelo" es un repositorio que integra cuatro cadenas tecnologicas con responsabilidades separadas. ATS/Postiats 0.4.2 aporta interfaces `.sats` que describen un heap tipado y una maquina abstracta; ambas interfaces compilan con exito, pero las implementaciones en tiempo de ejecucion y el adaptador estan pendientes. Idris 2 0.8.0 contiene `LambdaProofs.idr`, con testigos explicitos de reduccion beta y casos de sustitucion para combinadores SKI, y `Main.idr`, con un modelo de combustible (fuel) y un modelo de control que el propio autor describe como stub. Ada con GNAT implementa un contador de asignaciones acotado que compila y supera pruebas de capacidad, agotamiento y reinicio, aunque todavia no almacena nodos. SPARK/GNATprove descarga seis comprobaciones con cero obligaciones sin probar, limitadas a los contratos del contador de asignacion.

No hay innovaciones de tipo atencion, decodificacion especulativa ni arquitectura transformer. La innovacion tecnica real es metodologica: un flujo `verify.sh` que orquesta la comprobacion ATS, el typecheck y test de humo de Idris, las pruebas Ada y la verificacion SPARK, con evidencia fijada por hash de fuentes. El propio README explicita las fronteras: la correspondencia entre el runtime ATS, la implementacion Ada y la semantica Idris requerira un adaptador verificado y un argumento separado de simulacion/correspondencia, hoy inexistente.

## Capacidades

- Typecheck de interfaces ATS (`.sats`) para un heap tipado y una maquina abstracta.
- Typecheck y compilacion de terminos de prueba en Idris 2 sobre reduccion beta del calculo lambda y combinadores SKI, con cobertura de atomos libres simbolicos.
- Modelo de combustible y estados de recurso expresados como terminos de prueba en Idris.
- Verificacion deductiva en SPARK de contratos de asignacion acotada (capacidad, agotamiento, reinicio), con seis comprobaciones descargadas.
- Pruebas de ejecucion Ada con contratos y driver de test con aserciones activadas.
- Orquestacion CI en GitHub Actions mediante `verify.sh` y workflows separados para Idris y para ATS/SPARK.
- Evidencia reproducible fijada por hash de fuentes y versiones de toolchain.
- No dispone de: generacion de texto, codigo, matematicas, vision, audio, tool calling, function calling, agentes, razonamiento multi-paso basado en pesos ni capacidades multilingues.

## Casos de uso

- Docencia de verificacion formal comparada: el repositorio permite mostrar en un solo arbol como ATS, Idris 2 y SPARK/Ada atacan el mismo problema con filosofias distintas (tipos dependientes, pruebas interactivas, contratos deductivos), usando `verify.sh` como punto de entrada reproducible.
- Evaluacion de toolchains para proyectos criticos: un equipo que dude entre SPARK, ATS o Idris puede reproducir la evidencia de este scaffold y medir friccion de instalacion, tiempos de comprobacion y calidad de los mensajes de error de cada herramienta.
- Referencia para formalizar calculo lambda de Unlambda: las derivaciones SKI escritas a mano en `spec/` y su reflejo en `LambdaProofs.idr` sirven como plantilla para quien quiera mecanizar calculo combinatorio en un asistente de pruebas.
- Base para investigacion en correspondencia entre lenguajes: el propio backlog (`docs/DELIVERY.md`) describe como extender el scaffold con un adaptador verificado que relacione el runtime ATS con la implementacion Ada y con la semantica Idris, lo que constituye un problema de investigacion real.
- Plantilla de CI para pruebas formales: los workflows de GitHub Actions con badges de prueba y de verificacion SPARK pueden copiarse para proyectos que necesiten integrar GNATprove o Idris en un pipeline continuo.
- Auditoria de licencias y procedencia: dado su caracter propietario con fuente visible, el repo sirve como caso practico para equipos juridicos y de compliance que deban distinguir "publico" de "open source" antes de reutilizar codigo industrial.
- Prototipado de contadores y recursos acotados: el contador de asignacion verificado en SPARK puede reutilizarse conceptualmente como patron para sistemas embebidos con presupuestos de memoria estrictos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas de precisión, latencia, throughput ni evaluaciones tipo MMLU, HumanEval o GSM8K, porque no hay un modelo de inferencia subyacente.

## Requisitos de hardware

- No requiere GPU: no hay pesos ni inferencia. Se ejecuta en CPU.
- Entorno de referencia declarado por el autor: Linux x86-64 con Bash y GNU grep.
- Toolchain obligatoria: ATS/Postiats, Idris 2, GNAT, GPRbuild y GNATprove instalados y accesibles en `PATH`.
- Memoria y disco: el repositorio ocupa 0,0 GB en HuggingFace; el consumo real lo determinan las toolchains (GNAT y SPARK pueden ocupar varios cientos de MB).
- Opciones de despliegue: clonado del repositorio en GitHub y ejecucion de `bash verify.sh`. No aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen del tiempo de comprobacion de GNATprove e Idris sobre el hardware concreto.
- Cabe en cualquier portatil o contenedor Linux moderno; no necesita GPU dedicada ni nodos con aceleradores.

## Comparativa con modelos similares

La categoria correcta no es "modelos de lenguaje" sino "scaffolds de verificacion formal". Aun asi, en la informacion disponible no se identifican proyectos comparables dentro del ecosistema Snapkitty ni referencias publicas equivalentes. Por tanto:

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Snapkitty/unlambda-idris-spark | no aplicable | no aplicable | no disponible | proprietary-source-visible | HuggingFace y GitHub |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de IA: cualquier intento de usarlo como modelo de lenguaje, embeddings o vision fallara, ya que no contiene pesos ni pipeline.
- Alcance parcial declarado por el autor: el interprete ATS completo, el heap generacional y la correspondencia entre lenguajes son trabajo futuro; el modelo de control de Idris es un stub.
- Frontera de verificacion explicita: SPARK solo prueba los contratos actuales del contador de asignacion; no existe todavia demostracion de correspondencia entre ATS, Ada e Idris.
- Licencia propietaria con fuente visible: la visibilidad publica del codigo no concede derechos de uso comercial, modificacion ni redistribucion. Cualquier uso industrial requiere un acuerdo de licencia comercial (ver `COMMERCIAL-LICENSING.md`).
- Sin adopcion registrada: 0 descargas y 0 likes, sin senales de comunidad, issues publicos ni mantenimiento externo verificable.
- Riesgo de confusion de nombre: en la busqueda web aparecen entradas con nombres parecidos ("SparkKitty", malware que roba frases semilla, y "SnapKitty" como supuesto sistema financiero) sin relacion tecnica demostrada con este repositorio. Conviene no mezclar procedencias.
- Procedencia del espejo: el README indica que el repo se ha espejado desde la organizacion `SNAPKITTYWEST`, pero los badges y enlaces apuntan a `AHMADALIPARR`; hay una discrepancia de organizacion que conviene verificar antes de citar fuentes.
- Reproducibilidad dependiente de toolchain: los resultados solo son replicables con las versiones exactas documentadas en `docs/WORKFLOW.md`, y SPARK/GNATprove son herramientas con elevada sensibilidad a versiones.
- Para produccion: no apto como dependencia directa hoy; su valor es metodologico y de referencia, no operativo.

## Enlaces

- HuggingFace: https://huggingface.co/Snapkitty/unlambda-idris-spark
- Repositorio GitHub (espejo indicado): https://github.com/SNAPKITTYWEST/unlambda-idris-spark
- Repositorio GitHub (referenciado en badges): https://github.com/AHMADALIPARR/unlambda-idris-spark
- Commit espejo: `a42eccc`
- Release v1.0.0: https://github.com/AHMADALIPARR/unlambda-idris-spark/releases/tag/v1.0.0
- Workflow CI de Idris: https://github.com/AHMADALIPARR/unlambda-idris-spark/actions/workflows/idris-proofs.yml
- Workflow CI de ATS y SPARK: https://github.com/AHMADALIPARR/unlambda-idris-spark/actions/workflows/ats-spark.yml
- Evidencia de verificacion: `docs/verification/ats-spark-af40c4e.md`
- Flujo de trabajo detallado: `docs/WORKFLOW.md`
- Backlog de entrega: `docs/DELIVERY.md`
- Licencia: https://huggingface.co/Snapkitty/unlambda-idris-spark/blob/main/LICENSE
- Documentos internos citados: `LICENSING.md`, `COMMERCIAL-LICENSING.md`, `CONTRIBUTING.md`, `SECURITY.md`, `SUPPORT.md`
- Otras entradas del autor en HuggingFace: https://huggingface.co/models?other=snapkitty
- "Snapkitty/snapkitty-merged": https://huggingface.co/Snapkitty/snapkitty-merged
- Repositorio personal del autor: https://github.com/SNAPKITTYWEST/SNAPKITTYWEST
- Referencia externa no relacionada con el repositorio (posible confusion de nombre): https://gbhackers.com/sparkkitty-malware/
