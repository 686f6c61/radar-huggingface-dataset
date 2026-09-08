# Goldeneyeowl/ALCOG

## Resumen

ALCOG es un runtime cognitivo auto-modificable experimental desarrollado por Goldeneyeowl para Linux x86-64. No se trata de un modelo Transformer ni de un modelo de lenguaje convencional: en lugar de separar código ejecutable, pesos aprendidos, memoria y asociaciones lingüísticas en componentes independientes, ALCOG representa todo mediante una estructura relacional mutable compartida, compuesta por un flujo homogéneo de celdas relacionales. El sistema puede participar simultáneamente en roles como memoria asociativa, estructura de lenguaje, comportamiento ejecutable, estado de activación o evidencia de fiabilidad.

El ejecutable actual ocupa aproximadamente 251 KiB e incluye tanto el runtime nativo como la estructura cognitiva persistente en un único archivo. ALCOG soporta entrada en coreano e inglés, expresiones coloquiales y abreviadas, interpretación dependiente del contexto, aprendizaje online persistente e interacción directa con Linux mediante llamadas al sistema. Está pensado como prototipo de investigación, no como un sistema listo para producción. Su relevancia radica en explorar arquitecturas cognitivas donde el aprendizaje modifica directamente la representación relacional, sin necesidad de una base de datos de memoria separada ni de un archivo de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Celdas relacionales homogeneas (sustrato cognitivo unificado). No es un Transformer |
| Parametros totales | No disponible (el ejecutable completo ocupa 251 KiB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de ventana de contexto tradicional; usa un rastro de activacion con decaimiento) |
| Tipos de cuantizacion | No aplica (no hay pesos separados) |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica (ejecutable nativo estaticamente enlazado, sin pesos separados) |

## Arquitectura y entrenamiento

ALCOG no mantiene las fronteras convencionales entre programa, pesos de modelo, base de datos de memoria, base de datos de lenguaje o bytecode. Su estado cognitivo se almacena como un unico flujo de celdas relacionales, donde una misma celda puede interpretarse simultaneamente como relacion, memoria, ruta de activacion, procedimiento, asociacion de lenguaje, indicador de fiabilidad o estado de aprendizaje. La actividad contextual reciente puede quedar como un rastro de activacion que decae con el tiempo; la entrada nueva interactua con ese rastro mediante propagacion asociativa y competicion, lo que permite recuperar estructuras previamente activas a partir de expresiones incompletas o referencias contextuales. El diseno esta influenciado por los principios de ALMANAL, especialmente la reutilizacion de relaciones existentes, la identidad compartida y la reduccion de representaciones duplicadas.

El aprendizaje del lenguaje en coreano e ingles se desarrollo principalmente mediante enseñanza interactiva directa de GPT-5.6 Sol Chat durante el desarrollo de ALCOG. El proceso fue iterativo: se probaba el sistema con variaciones no vistas, se analizaban los fallos y se proporcionaban experiencias contrastantes adicionales. El objetivo no era copiar la salida del profesor, sino utilizar las experiencias linguisticas generadas para modificar la estructura relacional propia de ALCOG. Tambien se empleo una cantidad menor de informacion derivada de Qwen 3.0 como material auxiliar y como priores candidatos debiles; esas asociaciones no se trataron como verdad semantica autoritativa y podian debilitarse, reemplazarse o anularse mediante anclaje directo y evidencia posterior. Ni GPT-5.6 Sol Chat ni Qwen son necesarios en tiempo de ejecucion: el ejecutable publicado opera de forma independiente.

## Capacidades

- Conversacion basica en coreano e ingles, incluyendo expresiones coloquiales, abreviadas y algo de slang informal.
- Interpretacion dependiente del contexto, manejo de sentidos ambiguos, argumentos omitidos y continuacion conversacional.
- Aprendizaje online persistente: el sistema puede modificar su propia estructura relacional mientras se ejecuta y guardar el estado modificado de nuevo en el propio ejecutable.
- Finalizacion de patrones asociativos a partir del rastro de activacion contextual.
- Operaciones basicas sobre archivos, como contar palabras, contar lineas o calcular hashes.
- Interaccion directa con Linux mediante llamadas al sistema, sin necesidad de un modelo externo.
- Anclaje de expresiones linguisticas a acciones y resultados observados en el entorno.
- No es un modelo de lenguaje generativo masivo; produce respuestas conversacionales limitadas y no esta disenado para generar texto extenso.

## Casos de uso

- Asistente conversacional para administracion de archivos en Linux: el usuario puede pedir en lenguaje natural "cuenta las palabras de este archivo" o "cual es el hash" y ALCOG ejecuta las operaciones correspondientes mediante syscalls.
- Automatizacion de tareas repetitivas en terminal: expresiones como "haz eso otra vez" recuperan la accion anterior gracias al rastro de activacion, permitiendo repetir operaciones sin reescribir comandos.
- Investigacion en arquitecturas cognitivas: ALCOG sirve como plataforma para estudiar como una unica estructura relacional puede representar simultaneamente memoria, procedimientos y lenguaje, sin separaciones canonicas.
- Sistema de aprendizaje continuo en entornos controlados: el modelo modifica su estado persistente basandose en resultados observados, lo que permite adaptacion sin reentrenamiento externo.
- Herramienta de analisis de logs o ficheros con lenguaje informal: ALCOG puede interpretar abreviaturas y expresiones coloquiales en coreano e ingles, utiles en entornos de soporte o documentacion tecnica.
- Prototipo de agente autonomo para sistemas embebidos Linux: al ser un binario pequeno y estaticamente enlazado, puede desplegarse en hardware limitado donde un LLM convencional no cabria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere GPU ni VRAM: ALCOG es un ejecutable nativo para Linux x86-64, estaticamente enlazado.
- Puede ejecutarse en cualquier CPU x86-64, incluido hardware modesto o sistemas embebidos.
- No se necesitan frameworks de despliegue como vLLM, llama.cpp, Ollama o TGI; se ejecuta directamente como binario.
- Latencia y throughput no disponibles, aunque al ser un binario de 251 KiB y operar con syscalls, se espera una latencia baja en operaciones simples.

## Comparativa con modelos similares

No se dispone de modelos comparables en la informacion proporcionada. ALCOG no es un modelo Transformer y no puede compararse directamente con LLM convencionales. Su arquitectura se inspira en ALMANAL, pero no se han publicado datos de rendimiento comparativos ni existe una alternativa equivalente disponible.

## Limitaciones y advertencias

- Prototipo experimental: no esta validado para uso en produccion ni ha pasado pruebas exhaustivas de seguridad o robustez.
- Capacidades linguisticas limitadas: solo coreano e ingles, y no debe interpretarse como competencia linguistica general a nivel humano.
- Sin benchmarks publicados: no hay datos objetivos de rendimiento que permitan evaluar su calidad frente a otros sistemas.
- El aprendizaje online modifica el propio ejecutable: el estado persistente se escribe de nuevo en el binario, lo que puede corromper el sistema si no se controla adecuadamente.
- Depende de Linux x86-64: no es portable a otras plataformas ni arquitecturas.
- No es un modelo de lenguaje generativo extenso: no se deben esperar respuestas largas, coherentes o creativas como las de un LLM.
- La licencia Apache 2.0 permite uso comercial, pero al tratarse de un prototipo de investigacion, la estabilidad y el soporte no estan garantizados.

## Enlaces

- HuggingFace: https://huggingface.co/Goldeneyeowl/ALCOG
- GitHub del autor: https://github.com/aguun1998
- DOI: https://doi.org/10.57967/hf/10339
