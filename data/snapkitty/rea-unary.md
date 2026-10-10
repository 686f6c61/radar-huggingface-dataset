# Snapkitty/rea-unary

## Resumen

`Snapkitty/rea-unary` no es un modelo de lenguaje neuronal, sino un repositorio de software publicado en HuggingFace que contiene una cadena de herramientas de ingeniería inversa y verificación formal. El proyecto propone un flujo completo que va desde código máquina x86 hasta firmware flash-eable, pasando por decodificación, recuperación de comportamiento, especificación formal, síntesis VHDL, simulación y comprobación de invariantes. Cada decisión del pipeline se ancla explícitamente en las cuatro funciones booleanas unarias (constante-0, identidad, NOT, constante-1).

Lo desarrolla Snapkitty (Snapkitty Collective LLC), con autoría de Ahmad Ali Parr, y forma parte del denominado "SnapKitty October 2026 main drop". El repositorio es un espejo del proyecto original alojado en GitHub (`SNAPKITTYWEST/rea-unary`, commit `49598d9`) y se publica con licencia AGPL-3.0 ampliada con una cláusula de prohibición de entrenamiento de modelos de IA.

El interés actual del artefacto es metodológico: ilustra cómo encadenar herramientas heterogéneas (C11, VHDL, TypeScript, Dafny, Alloy 6, GHDL, sqlite3) para construir un bucle de refutación de contraejemplos sobre hardware y binarios. No incluye pesos, arquitectura de red ni parámetros entrenables; el tamaño del repositorio en HuggingFace figura como 0.0 GB y no tiene descargas ni interacciones registradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal. Pipeline de ingenieria inversa y verificacion formal (decodificacion binaria, especificacion LaTeX, maquina de estados, Dafny, Alloy 6, VHDL/RTL) |
| Parametros totales | No aplica (no disponible como modelo de IA) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | AGPL-3.0 + clausula adicional "No AI Training" (identificador declarado `agpl-3.0-plus-no-ai-training`, campo YAML `license: other`). Porciones de `stage1` derivadas del proyecto REA (`morluto/rea`) permanecen bajo su aviso MIT (`stage1/LICENSE-MIT-upstream.txt`) |
| Formato de pesos | No aplica. El repositorio contiene codigo fuente C11, VHDL, TypeScript 5.x, contratos Dafny, modelos Alloy 6, scripts de build y artefactos de evidencia JSONL |

## Arquitectura y entrenamiento

El artefacto no entrena ningun modelo. Su "arquitectura" es un pipeline de software organizado en tres etapas. El flujo declarado es: `Binary → decode → IR → recover behavior → LaTeX metaprogram spec → state machine → Alloy invariant search → Dafny contracts → VHDL/RTL → simulate → firmware chain → flash target → execution traces → SQL invariant checks → counterexample loop`. La evidencia circula como registros JSONL a traves de un pipeline Mustache enrutado por XML; un componente denominado ALP propone semantica ausente y los contraejemplos realimentan el conjunto de evidencia hasta que el bucle se cierra.

La `stage1` contiene un catalogo "gutted" de herramientas REA, un binario de prueba (`sample.bin`, secuencia `01 D8` interpretada como `ADD EAX,EBX` en `0x401020`), analisis simulado, un libro mayor de evidencia JSONL, un almacen de artefactos con hash y un enrutador de evidencia en C11. La `stage2` aporta la especificacion de recuperacion de comportamiento, el mapeo a logica booleana unaria, una especificacion LaTeX de tipo `metaprogram`, una maquina de estados (estados A1–A8 e I1–I8), un `add_core.vhd` sintetizable, lemas en Dafny y un modelo en Alloy 6. La `stage3` incorpora simulacion GHDL con trazas, un modelo de ciclos en C11, comprobaciones de invariantes sobre sqlite3, un oraculo diferencial de 140/140 frente a silicio real, la cadena de firmware (objetos → enlazador → ELF → imagen flash), driver/protocolo, contrato de interfaz, bindings GDScript y un backend Next.js con frontend React.

No se documenta ningun proceso de entrenamiento, ajuste fino, RLHF, DPO ni composicion de dataset, porque no existe tal fase. La innovacion tecnica destacable es la pretension de derivar toda decision del analisis a partir de las cuatro funciones booleanas unarias y de cerrar el ciclo mediante busqueda de invariantes en Alloy 6 y contratos en Dafny.

## Capacidades

- Analisis estatico de binarios x86 en una etapa de prueba (`sample.bin` con una instruccion `ADD` en `0x401020`), orientado a decodificacion y elevacion a IR.
- Recuperacion de comportamiento a nivel de especificacion, con mapeo explicito a las cuatro funciones booleanas unarias.
- Generacion de especificaciones formales en LaTeX (`metaprogram`), contratos Dafny y modelos de invariantes en Alloy 6.
- Sintesis y simulacion de hardware: modulo `add_core.vhd` sintetizable, verificado con GHDL y con modelo de ciclos escrito en C11.
- Verificacion diferencial: comparacion de trazas contra silicio real con un oraculo de 140/140 casos registrados.
- Comprobacion de invariantes sobre bases de datos sqlite3 a partir de trazas de ejecucion.
- Construccion de cadena de firmware completa: objetos, enlazado, generacion de ELF e imagen de flasheo.
- Bindings de motor de videojuegos (GDScript) y una capa de aplicacion web con backend Next.js y frontend React.
- Enrutamiento de evidencia en C11 y almacenamiento de artefactos con hash.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingues, vision, audio ni modos de razonamiento de un modelo de lenguaje, dado que no es un modelo de lenguaje.

## Casos de uso

- Auditoria de firmware heredado: el pipeline permite partir de un binario propietario, decodificarlo, recuperar su comportamiento y producir una especificacion formal verificable antes de reescribirlo en VHDL.
- Reimplementacion de logica de hardware en FPGA: la sintesis de `add_core.vhd` y la simulacion con GHDL permiten validar una reimplementacion RTL contra las trazas del dispositivo original mediante el oraculo diferencial.
- Aprendizaje de verificacion formal: el repositorio incluye contratos Dafny y modelos Alloy 6 que sirven como material didactico para practicar invariantes, contraejemplos y refutacion iterativa.
- Investigacion en elevacion de binarios: la etapa de decodificacion y construccion de IR es reutilizable como banco de pruebas para estudiar traduccion de codigo maquina a representaciones intermedias.
- Docencia de ingenieria inversa: los "honest real-vs-mocked tables" de cada `README.md` de etapa permiten distinguir que partes del flujo son reales y cuales simuladas, lo que resulta util para fijar expectativas en un curso.
- Prototipado de cadenas de firmware en entornos controlados: la generacion de objetos, enlazado, ELF e imagen de flasheo puede emplearse para ensayar flujos de build en placas de laboratorio.
- Validacion de invariantes en datos de ejecucion: el uso de sqlite3 y comprobaciones SQL sobre trazas registradas es aplicable a pipelines de telemetria donde se quiera comprobar propiedades de estados y transiciones.
- Integracion de interfaz de usuario sobre resultados de analisis: el backend Next.js y el frontend React facilitan construir paneles que visualicen evidencia JSONL y resultados de verificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato cuantitativo de rendimiento declarado es el oraculo diferencial de 140/140 contra silicio real en la `stage3`, pero corresponde a una comparacion de trazas registradas, no a una metrica de modelo. La propia documentacion advierte que las comprobaciones SQL validan unicamente estados y transiciones registrados, no todas las ejecuciones posibles.

## Requisitos de hardware

- VRAM para inferencia: no aplica, no hay modelo neuronal que cargar.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama o TGI no son pertinentes para este artefacto).
- Herramientas necesarias para construir y ejecutar: compilador de C11 con cero avisos para el enrutador de `stage1`, GHDL para analizar y simular `add_core.vhd` en `stage2`, y un `make` completo para el flujo de `stage3` (que incluye cadena de firmware, sqlite3, Next.js y React).
- Latencia y throughput: no disponible; no se publican mediciones en la informacion proporcionada.

## Comparativa con modelos similares

No disponible en la informacion proporcionada. Las busquedas web realizadas devuelven resultados sin relacion con el proyecto (portales de resultados deportivos), por lo que no se identifican herramientas comparables del mismo dominio con datos verificables. Cabe senalar que la propia documentacion menciona que parte de `stage1` deriva del proyecto REA (`morluto/rea`), pero no se aportan cifras de comparacion.

## Limitaciones y advertencias

- No es un modelo de IA: no dispone de pesos, arquitectura de red, contexto ni capacidades generativas. Cualquier expectativa de uso como LLM es incorrecta.
- El repositorio en HuggingFace figura con 0.0 GB de tamano y 0 descargas, lo que sugiere que el contenido puede no estar completamente alojado o que el espejo esta vacio.
- La `stage1` emplea un binario de prueba y analisis simulados; varias piezas son mocks, no implementaciones completas, como reconocen las tablas "real-vs-mocked" de cada etapa.
- La verificacion declarada (140/140) se refiere a trazas registradas, no a una demostracion de correccion sobre todas las ejecuciones posibles.
- Licencia restrictiva: AGPL-3.0 con termino adicional de prohibicion de entrenamiento de modelos de aprendizaje automatico. El codigo no puede usarse para entrenar modelos de ML, y su uso en productos comerciales exige una licencia comercial aparte de Snapkitty Collective LLC.
- Las porciones derivadas del proyecto REA upstream conservan su aviso MIT, lo que introduce una obligacion de atribucion adicional que debe respetarse al redistribuir.
- No se especifican idiomas soportados ni cobertura multilingue, y no hay informacion sobre sesgos porque no existe comportamiento de modelo.
- El proyecto esta fechado en octubre de 2026 segun los metadatos, lo que puede generar confusiones respecto a la cronologia real de su publicacion.
- Riesgo de dependencia de cadena de herramientas fragil: requiere GHDL, sqlite3 y un entorno full-stack (Next.js/React) para reproducir la `stage3` completa.
- No se documentan procesos de validacion externa ni auditorias independientes del pipeline.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Snapkitty/rea-unary
- Repositorio original en GitHub: https://github.com/SNAPKITTYWEST/rea-unary
- Licencia del repositorio: https://huggingface.co/Snapkitty/rea-unary/blob/main/LICENSE
- Proyecto REA upstream (referenciado, bajo MIT): https://github.com/morluto/rea
- Licencia MIT del upstream de `stage1`: `stage1/LICENSE-MIT-upstream.txt`
- Contacto para licencia comercial: A.parr@belespritdaccord.uk
- Herramientas referenciadas por el pipeline: GHDL (simulacion VHDL), Dafny (https://dafny.org/), Alloy 6 (https://alloytools.org/), sqlite3, Next.js, React, GDScript
