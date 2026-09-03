# Snapkitty/sovereign-ada-rtx

## Resumen

Sovereign Ada RTX es un proyecto de software, no un modelo de inteligencia artificial. Se trata de un procesador determinista completo recreado desde primeros principios en Ada 2022, un lenguaje de programación diseñado para sistemas críticos de seguridad. El autor, Snapkitty, lo presenta como "un ordenador" implementado íntegramente en Ada puro, sin dependencias de sistema operativo, sin asignación dinámica de memoria, sin bibliotecas externas y sin llamadas al sistema. El repositorio contiene 43 archivos fuente con un total de 132 KB, organizados en 21 paquetes que cubren desde tipos de CPU, unidad aritmético-lógica (ALU), memoria con comprobación de límites, hasta un motor de tensores denominado "Resonant Tensor Exchange" (RTX) con capacidades de redes neuronales convolucionales (CNN) y máquinas de vectores de soporte (SVM).

Aunque el nombre incluye "RTX" y hay componentes de redes neuronales, todo es código Ada compilado, no pesos de un modelo entrenado. El proyecto incluye un conjunto de autopruebas (40 tests) y una suite de 9 benchmarks, además de un REPL de arranque en frío. La relevancia actual radica en demostrar cómo se puede construir un sistema de cómputo completo y verificado sin depender de infraestructura externa, un enfoque útil para sistemas embebidos, aviónica, automoción y otros dominios donde el comportamiento indefinido no es aceptable.

No se dispone de información sobre descargas, uso o métricas de adopción, ya que el repositorio muestra cero descargas y cero me gusta en HuggingFace.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (es un proyecto de software en Ada, no un modelo de IA) |
| Parametros totales | No aplica |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Ada 2022 (código fuente), documentación en inglés |
| Licencia | SSv1.0 (según badge en la model card; no disponible en los metadatos de HuggingFace) |
| Formato de pesos | No aplica (el repositorio contiene código fuente Ada, no pesos serializados) |

## Arquitectura y entrenamiento

El proyecto implementa una pila de computación completa en Ada. La arquitectura se organiza en capas: un sistema de tipos (`Core_Types`) que define registros, tamaños de palabra y anchos de bus; una ALU con detección de desbordamiento y aritmética saturada (`Math_Utils`); una memoria de capacidad fija con comprobación de límites (`Memory_Structures`); registros de configuración estilo BIOS/UEFI (`Config`); validación de fallos de hardware (`Validation`); protección de integridad con CRC/ECC (`Integrity`); serialización de protocolo de bus (`Serialization`); un decodificador de instrucciones (`Parser`); una máquina de estados que implementa el ciclo fetch-decode-execute (`State_Machine`); un despachador de ejecución (`Dispatcher`); manejo de errores con trampa fail-closed (`Errors`); autopruebas POST (`Self_Test`); y una suite de benchmarks (`Benchmark`). Además, incluye un motor de tensores de 256 dimensiones (`RTX_Sovereign_Driver`), una CNN para pasada directa (`CNN_Engine`) y un optimizador de márgenes SVM (`SVM_Margin`).

No existe un proceso de entrenamiento en el sentido de machine learning: no hay datos de entrenamiento, ni pesos aprendidos, ni fases de RLHF o DPO. Todo el comportamiento está definido estáticamente en el código Ada. La innovación técnica reside en el diseño determinista y fail-closed: cada función tiene un comportamiento conocido y acotado, sin asignaciones ocultas, sin alias de punteros, sin condiciones de carrera y sin comportamiento indefinido, garantizado por el compilador en tiempo de compilación.

## Capacidades

- Ejecución de un ciclo completo de procesador: fetch, decode, execute, con máquina de estados explícita.
- Unidad aritmético-lógica con detección de desbordamiento y aritmética saturada.
- Memoria RAM de capacidad fija con comprobación de límites en cada acceso.
- Protección de integridad de memoria mediante CRC y ECC.
- Serialización de datos en un protocolo de bus binario definido.
- Motor de tensores de 256 dimensiones (RTX) que implementa operaciones de redes neuronales, incluyendo una CNN para pasada directa y un optimizador de márgenes SVM.
- Autopruebas POST (Power-On Self-Test) con 40 tests y suite de 9 benchmarks.
- REPL de arranque en frío (`main.adb`) que permite interactuar con el sistema.
- Sin dependencias de sistema operativo, sin asignación dinámica de memoria, sin bibliotecas externas.

## Casos de uso

- Sistemas embebidos de seguridad crítica: el diseño fail-closed y sin comportamiento indefinido lo hace adecuado para controladores en aviónica, automoción o equipos médicos donde un fallo puede tener consecuencias graves.
- Verificación formal y enseñanza de arquitectura de computadores: al estar implementado en un lenguaje con semántica estricta, puede usarse como modelo didáctico para explicar ciclos de instrucción, gestión de memoria y manejo de excepciones.
- Prototipado de procesadores personalizados: el código Ada puede adaptarse para simular conjuntos de instrucciones específicos antes de implementarlos en hardware.
- Investigación en computación determinista: sirve como banco de pruebas para estudiar sistemas sin nondeterminismo, útil en aplicaciones donde la reproducibilidad exacta es obligatoria.
- Entrenamiento de ingenieros en Ada para sistemas críticos: el código fuente es un ejemplo completo y autocontenido de buenas prácticas en Ada 2022, con tests y benchmarks.
- Integración en pipelines de CI/CD para validación de compiladores Ada: los 40 tests y 9 benchmarks pueden ejecutarse para verificar que un compilador produce código correcto.

## Benchmarks y rendimiento

La model card menciona una "benchmark suite" con 9 benchmarks y 40 tests de autoprueba, pero no se proporcionan resultados numéricos concretos en la información disponible. No hay datos de rendimiento comparativos con otros sistemas. Se indica que el proyecto puede compilarse con `gnatmake`, el compilador GNAT de Ada.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Compilador Ada 2022 (GNAT recomendado, ya que el badge indica `gnatmake`).
- Sin requisitos específicos de GPU: el motor RTX es puramente software y se ejecuta en CPU.
- Memoria: el sistema usa memoria de capacidad fija definida en el código; los requisitos exactos no se especifican, pero al ser código Ada sin asignación dinámica, el consumo es predecible y bajo (el repositorio ocupa 132 KB de código fuente).
- No se requieren bibliotecas externas ni sistema operativo en tiempo de ejecución.
- Opciones de despliegue: compilación nativa para cualquier plataforma con un compilador Ada; también puede usarse en entornos embebidos si se adapta el código.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No existe una categoría de "modelos" comparable, ya que esto no es un modelo de IA. Como proyecto de software, podría compararse con otros procesadores implementados en lenguajes de alto nivel (por ejemplo, simuladores de CPU en C o Rust), pero no se dispone de datos concretos de proyectos equivalentes en la información proporcionada. La comparativa no está disponible.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no procesa lenguaje natural ni imágenes de forma autónoma. Su "RTX" es un motor de tensores fijo, no un modelo entrenado.
- El repositorio tiene cero descargas y cero me gusta en HuggingFace, lo que sugiere una adopción nula o muy reciente.
- La licencia SSv1.0 aparece en un badge de la model card, pero no se detallan sus términos; se debe contactar al autor para conocer las restricciones de uso comercial.
- No se proporcionan instrucciones de compilación detalladas más allá de la mención a `gnatmake`.
- No hay documentación sobre el conjunto de instrucciones soportado ni sobre cómo interactuar con el REPL.
- La fecha de creación (2026-09-03) es posterior a la fecha actual, lo que sugiere que el repositorio puede estar en un estado muy temprano o que la fecha es incorrecta.
- No se garantiza que el código compile sin modificaciones en todas las plataformas; se recomienda probar en un entorno controlado antes de usarlo en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Snapkitty/sovereign-ada-rtx
- Página de descargas del ecosistema Sovereign OS: https://collectivekitty.com/downloads (menciona el proyecto y su autoría por "one human + AI")
