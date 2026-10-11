# Snapkitty/ai-free

## Resumen

`Snapkitty/ai-free` no es un modelo de lenguaje: es un repositorio de codigo fuente en Lean 4, alojado en HuggingFace como espejo del proyecto UniversalWord, publicado por el autor Snapkitty dentro del denominado "SnapKitty October 2026 main drop". El proyecto implementa un pipeline de compilacion con semantica formal: tres frontends de lenguajes fuente (un interprete Forth, un subconjunto de BCPL y un lenguaje de computacion escalar y matricial al estilo Wolfram) se traducen a un lenguaje intermedio comun llamado Universal Word IR, cuyo elemento central es la palabra de maquina de anchura fija capaz de transportar enteros, flags de verdad o direcciones de memoria.

El repositorio contiene 200 archivos `.lean` que cubren desde la semantica de los lenguajes fuente y las pruebas reutilizables de correctud del compilador hasta modelos de maquina destino, emisores de codigo y arneses de comparacion ejecutables. Los backends soportados son x86-64, AArch64, RISC-V y WebAssembly, mas tres perfiles de microcontrolador bare-metal en 32 bits: RV32, ARM Cortex-M3 y ARM Cortex-M0. El arbol incluye tambien un mecanismo de auditoria de dependencias de pruebas por espacio de nombres y un script de CI que falla si un archivo Lean no tiene su parada correspondiente en el atlas documental.

Su relevancia no es la de un modelo generativo, sino la de un artefacto de verificacion formal reproducible: sirve para estudiar correctud de compiladores, comparar semantica entre arquitecturas y llevar codigo verificado a placas sin sistema operativo. La licencia `parr-source-license-no-ai-training-1.0` prohibe expresamente el entrenamiento con este material, y el momento de publicacion indicado en los metadatos es octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es una red neuronal. Pipeline de compilacion verificado en Lean 4 con lenguaje intermedio propio (Universal Word IR) y backends multiples |
| Parametros totales | No aplica (no es un modelo de parametros); no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; no disponible |
| Tipos de cuantizacion | No aplica; no disponible |
| Idiomas soportados | No disponible en los metadatos. Lenguajes fuente del compilador: Forth, subconjunto de BCPL y computacion escalar/matricial al estilo Wolfram |
| Licencia | parr-source-license-no-ai-training-1.0 (etiquetada como `other`, con enlace al archivo de licencia en el repositorio) |
| Formato de pesos | No aplica. El contenido son fuentes `.lean` (200 archivos), no pesos en safetensors ni GGUF |

## Arquitectura y entrenamiento

No existe entrenamiento ni ajuste de ningun tipo: el artefacto es codigo fuente. La arquitectura del proyecto es la de un compilador por capas. En la base esta `WordDialect.Machine`, que define las instrucciones, el estado, los resultados posibles y la semantica de ejecucion autoritativa sobre la palabra de maquina. Sobre ella se apoyan los frontends: `Forth.Parse` cubre definiciones, variables, comentarios, recursion y bucles; `BCPL.Semantics` aporta expresiones sobre palabras, indireccion, asignacion y sentencias; y `Wolfram.MatrixExample` ilustra un producto matricial concreto con sus ingredientes formales. La capa intermedia es Universal Word IR, con fragmentos de flujo de control verificados y componibles (`WordIR.Frag`), que actua como estacion de enlace donde las distintas expresiones fuente se convierten en un unico flujo de instrucciones.

Los backends siguen una estructura homogenea de modelos de maquina, convenciones de registros, secuencias de ensamblador y guardas. x86-64 (`X86.Lower`) y WebAssembly (`Wasm.Lower`, con bucle de despacho) son las rutas de 64 bits; AArch64 (`A64.Isa`) y RISC-V (`RV.Isa`) anaden modelos de ISA propios, con la particularidad de que RISC-V carece de flags de condicion y resuelve todo con comparacion y salto. Los perfiles de 32 bits (`RV32.Emit`, `CM.Isa` para Cortex-M con Thumb-2 y tabla de vectores, y `CM0.Divide` para Cortex-M0) incorporan runtime bare-metal con UART y dispositivo de prueba, sin sistema operativo; el modulo de division del Cortex-M0 implementa un bucle de division con restauracion probado para calcular `udiv` y `sdiv` en una maquina que no tiene instruccion de division. El arbol incluye ademas `Audit.lean` para inspeccionar dependencias de pruebas por espacio de nombres, y la documentacion de direccion y estado vive en `docs/GAME_PLAN.md` y `NEXT_STEPS.md`. La innovacion tecnica destacable es la trazabilidad: 200 archivos numerados en un atlas, con CI (`scripts/check_inventory.sh`) que garantiza que ninguna prueba quede sin documentar.

## Capacidades

- Traduccion verificada de programas Forth: definiciones, variables, recursion y bucles, con ejemplo de referencia `5 DUP +`.
- Semantica formal de un subconjunto de BCPL, incluyendo expresiones sobre palabras, indireccion, asignacion y sentencias.
- Computacion matematica escalar y matricial al estilo Wolfram, con un producto de matrices desarrollado como ejemplo formal.
- Generacion de codigo para cuatro destinos de 64 bits y 32 bits: x86-64, AArch64, RISC-V y WebAssembly.
- Emision de codigo bare-metal para tres perfiles de microcontrolador: RV32, ARM Cortex-M3 (Thumb-2) y ARM Cortex-M0.
- Runtime minimo para placas sin sistema operativo, con UART y dispositivo de prueba incluidos en los perfiles de 32 bits.
- Division entera sin instruccion de division en Cortex-M0 mediante bucle de restauracion, con prueba de correctud para `udiv` y `sdiv`.
- Composicion de fragmentos de flujo de control verificados y reutilizables.
- Auditoria de dependencias de pruebas a nivel de espacio de nombres.
- Arneses de comparacion ejecutables entre la computacion fuente y el resultado en la maquina destino.
- No dispone de capacidades de generacion de lenguaje natural, vision, audio, tool calling ni razonamiento multi-paso, al no ser un modelo de lenguaje.

## Casos de uso

- Docencia de correctud de compiladores: el atlas numera cada archivo Lean con enlace y descripcion, de modo que un curso puede recorrer desde `Forth.Example` hasta `X86.Lower` siguiendo una ruta de dificultad creciente y comprobando cada paso con CI.
- Verificacion formal de rutinas embebidas: un equipo que necesite una division entera correcta en Cortex-M0 puede reutilizar `CM0.Divide`, que aporta la prueba de que el bucle de restauracion calcula `udiv` y `sdiv`, en lugar de escribir y testear el algoritmo desde cero.
- Portabilidad entre arquitecturas con justificacion formal: al compartir Universal Word IR, el mismo programa puede bajarse a x86-64, AArch64, RISC-V o WebAssembly y compararse con el arnes correspondiente, lo que permite argumentar equivalencia semantica entre rutas.
- Firmware para placas sin sistema operativo: los perfiles RV32, Cortex-M3 y Cortex-M0 incluyen runtime con UART, por lo que el IR de 32 bits puede ejecutarse directamente sobre hardware desnudo sin capa de sistema operativo.
- Investigacion en lenguajes apilados: la semantica formal de Forth documentada en `Forth/Parse.lean`, `Forth/LoopProps.lean`, `Forth/Double.lean` y `Forth/DoubleCorrect.lean` sirve de base para razonar sobre aritmetica de doble precision en lenguajes con pila.
- Auditoria de confianza en una base de pruebas: `formal/Audit.lean` permite inspeccionar las dependencias de axiomas y definiciones por espacio de nombres, util para revisar que una prueba no se apoya en supuestos no declarados.
- Estudio de compilacion a WebAssembly con bucle de despacho: `Wasm.Lower` modela funciones de instruccion y el bucle de despacho, un material adecuado para analizar como se implementa un interprete de IR sobre una maquina virtual.
- Analisis de modelos de ISA sin flags de condicion: `RV.Isa` documenta un destino donde toda decision se resuelve con comparacion y salto, caso de estudio util al disenar lowering desde una representacion con flags.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El proyecto es codigo fuente de verificacion formal, por lo que las metricas habituales de modelos (MMLU, HumanEval, GSM8K) no son aplicables. La unica comprobacion automatizada documentada es `scripts/check_inventory.sh`, que falla cuando un archivo Lean carece de parada en el atlas o cuando una parada apunta a un archivo inexistente; no se proporcionan cifras de cobertura, tiempos de compilacion ni resultados de los arneses de comparacion.

## Requisitos de hardware

- No requiere GPU: no hay inferencia de red neuronal. El requisito real es compilar Lean 4.
- Toolchain necesaria: Lean 4 con su gestor de compilacion (`lake`) para construir los 200 archivos `.lean` y ejecutar los arneses.
- Memoria RAM y tiempo de compilacion: no disponible en la informacion proporcionada.
- Espacio en disco estimado: no disponible; depende del arbol de fuentes y de los artefactos de compilacion de Lean.
- Opciones de despliegue para uso como codigo: clonado del repositorio y compilacion local. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no existen pesos que cargar.
- Hardware destino de los artefactos generados: x86-64, AArch64, RISC-V (RV32 y RV64) y placas ARM Cortex-M3 y Cortex-M0, ademas de WebAssembly.
- Latencia y throughput: no aplica al proyecto; no disponible para los binarios emitidos.
- Advertencia operativa: las herramientas de HuggingFace que asumen un modelo (pipeline, librerias de inferencia, aplicaciones locales) no podran cargar este repositorio, dado que no contiene pesos.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de proyectos comparables de compilacion verificada (por ejemplo, cifras de lineas de prueba, cobertura o rendimiento de otros compiladores certificados), y las busquedas web realizadas devuelven otras publicaciones del mismo autor que no son equiparables a este artefacto. No se dispone de modelos ni proyectos alternativos con parametros, contexto, rendimiento, licencia y disponibilidad verificables en este contexto.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no admite tool calling ni razonamiento multi-paso. Cualquier evaluacion que lo trate como modelo generativo dara error.
- El repositorio declara explicitamente `region:us` y 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion externa por parte de la comunidad.
- El pipeline no esta declarado, lo que refuerza que no hay tarea de HuggingFace asociada.
- Los metadatos de idiomas no estan disponibles; los unicos lenguajes descritos son lenguajes fuente de programacion, no idiomas naturales.
- La licencia `parr-source-license-no-ai-training-1.0` incluye una clausula que prohibe el uso del material para entrenamiento de IA. Es imprescindible revisar el texto completo en el archivo `License` del repositorio antes de cualquier reutilizacion.
- La etiqueta de licencia en HuggingFace es `other`, no una licencia estandar reconocida, lo que puede complicar la revision legal en entornos corporativos.
- El contenido esta espejado desde GitHub en el commit `8d0f04c`; la copia de HuggingFace puede quedar desincronizada respecto al repositorio original.
- Las fechas de creacion y actualizacion indicadas (7 y 10 de octubre de 2026) son posteriores al momento habitual de publicacion; conviene verificar la autenticidad y el estado del proyecto antes de basarse en el.
- No se aportan resultados de benchmarks, cobertura de pruebas ni metricas de rendimiento, por lo que la calidad de las pruebas formales solo puede evaluarse leyendo el codigo.
- El proyecto depende del ecosistema Lean 4; cambios incompatibles en el toolchain o en las bibliotecas pueden romper la compilacion.
- Las afirmaciones de correctud descansan en los axiomas declarados en el proyecto; `formal/Audit.lean` existe precisamente para revisarlos, y no se publica el resultado de dicha auditoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Snapkitty/ai-free
- Archivo de licencia: https://huggingface.co/Snapkitty/ai-free/blob/main/License
- Repositorio espejo en GitHub: https://github.com/SNAPKITTYAGENT9NOVA/ai-free
- Arbol del repositorio en el commit de referencia: https://github.com/SNAPKITTYWEST/ai-free/tree/93d6d84fe80d3b7f333e31324b35ba27a964b9cc
- Plan de direccion y estado: `docs/GAME_PLAN.md` (dentro del repositorio)
- Proximos pasos: `NEXT_STEPS.md` (dentro del repositorio)
- Script de comprobacion de inventario: `scripts/check_inventory.sh` (dentro del repositorio)
- Perfil en free2aitools: https://free2aitools.com/model/snapkitty/snapkitty-open-source
- Otro repositorio del autor en HuggingFace: https://huggingface.co/Snapkitty/SNAPKITTYWEST-public-snapshot
- Otro repositorio del autor en HuggingFace: https://huggingface.co/Snapkitty/snapkitty-merged
- Perfil de GitHub del autor: https://github.com/SNAPKITTYWEST/SNAPKITTYWEST
- Lista de modelos gratuitos mantenida por terceros: https://github.com/ClawLabsAI/free-ai-models
