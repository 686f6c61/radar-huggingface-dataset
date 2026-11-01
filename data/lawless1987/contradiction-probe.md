# Lawless1987/contradiction-probe

## Resumen

Contradiction Probe es un instrumento de evaluación de seguridad de IA, no un modelo de lenguaje. Lo desarrolla el autor independiente Lawless1987 y responde a una pregunta concreta: si un sistema de IA que lee un registro detecta una afirmación que contradice ese registro, sin marcar como falsas las afirmaciones que solo se le parecen. El repositorio contiene el protocolo, el utillaje de sellado criptográfico y los scripts de puntuación para ejecutar ese test de forma preregistrada y con evaluación a ciegas.

El diseño metodológico es el núcleo del proyecto. Cada conjunto de casos se mide contra dos líneas base antes de confiar en ningún modelo: un comparador léxico por solapamiento de palabras (que en el conjunto endurecido queda limitado al 75 % de acierto, frente al 50 % de azar) y un modelo débil de 3B como suelo (3/8 aciertos y 0/8 falsas alarmas en ese mismo conjunto). La puntuación de un modelo frontier solo se considera evidencia de comprensión si supera ambas referencias.

El estado actual es embrionario: el conjunto endurecido de 16 casos está construido y medido, pero no sellado para una ejecución, y no hay resultados publicados. El repositorio tiene 0 descargas y 0 likes, y el código es exclusivamente de biblioteca estándar de Python, sin dependencias. Es relevante como propuesta de metodología reproducible para auditar la detección de contradicciones en sistemas de IA, más que como artefacto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un conjunto de scripts de evaluación en Python) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (no hay pesos; el repositorio contiene scripts Python y datos sellados en `sealed/`, excluidos de git) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni entrenamiento. El repositorio implementa un protocolo de evaluación compuesto por cinco piezas: `seal.py` (compromisos SHA-256 por paquete y por afirmación, con verificación contra un hash comprometido), `lexical_baseline.py` (comparador por solapamiento de palabras que mide la dureza del conjunto, no a un modelo), `present.py` (conversión de grabaciones en bruto en un paquete de puntuación barajado y ciego al tipo, con un mapa de códigos solo para el operador), `score.py` (cálculo de aciertos, fallos, falsas alarmas y rechazos correctos a partir de las notas del evaluador ciego y la clave, más kappa de Cohen para dos o más evaluadores) y `tests/test_score.py` (16 tests bidireccionales; un mutante que acredita indebidamente turnos UNRESOLVED hace fallar la suite).

El diseño experimental separa roles: el autor de los casos nunca los puntúa, un tercero a ciego califica con los tipos ocultos y los casos sellados se re-hashean al final para demostrar que nada cambió. La dureza del conjunto se garantiza por construcción: los casi-aciertos deliberadamente reutilizan el vocabulario retirado y las contradicciones reales lo evitan, de modo que un comparador léxico no puede separarlos. Todo el código usa solo la biblioteca estándar de Python y se ejecuta con `python -I` (modo aislado).

## Capacidades

- Evaluación de detección de contradicciones: mide si un lector de IA marca afirmaciones que contradicen un registro dado en contexto.
- Medición de falsas alarmas: distingue entre fallar una contradicción real y marcar erróneamente un casi-acierto, con métricas separadas de aciertos, fallos, falsas alarmas y rechazos correctos.
- Sellado criptográfico: compromisos SHA-256 por paquete y por afirmación, con verificación de integridad al final de la ejecución.
- Presentación ciega al tipo: barajado de casos y generación de un mapa de códigos separado para el operador.
- Puntuación con acuerdo entre evaluadores: kappa de Cohen para dos o más calificadores.
- Pruebas de dureza del conjunto: línea base léxica que cuantifica si el conjunto es resoluble por superficie.
- Composición con otros instrumentos del mismo autor (covenant, threefold, flinch-observability), cada uno usable por separado.

## Casos de uso

- Auditoría de sistemas RAG: comprobar si un modelo que recibe un registro en el prompt detecta afirmaciones que lo contradicen, usando el paquete ciego y las dos líneas base para descartar que el acierto provenga de solapamiento léxico.
- Validación de pipelines de verificación de hechos: medir la tasa de falsas alarmas de un clasificador de contradicciones antes de desplegarlo, con el conjunto endurecido que reutiliza vocabulario retirado en los casi-aciertos.
- Evaluación comparativa de modelos: ejecutar el mismo paquete sellado contra dos o más modelos frescos y comparar sus puntuaciones frente al suelo del modelo de 3B (3/8 aciertos, 0/8 falsas alarmas).
- Investigación reproducible en seguridad de IA: usar el protocolo preregistrado y el sellado SHA-256 para publicar resultados verificables de que los casos no se modificaron tras conocer las respuestas.
- Formación de evaluadores humanos: emplear `present.py` y `score.py` para entrenar anotadores ciegos al tipo y calcular su acuerdo inter-anotador con kappa de Cohen.
- Construcción de conjuntos de prueba resistentes a atajos: usar `lexical_baseline.py` para verificar que un nuevo conjunto de casos no es resoluble por solapamiento de palabras antes de invertir en evaluación con modelos.
- Integración en un stack de auditoría multiagente: combinar el instrumento con los repositorios covenant y threefold del mismo autor para medir y registrar el comportamiento de sistemas multiagente bajo una identidad de tarea única.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de modelos en la informacion disponible. Los únicos datos numéricos del repositorio son las líneas base del conjunto endurecido de 16 casos:

| Referencia | Resultado en el conjunto endurecido |
|---|---|
| Azar | 50 % |
| Comparador léxico (tope) | 75 % |
| Modelo débil de 3B | 3/8 aciertos, 0/8 falsas alarmas |

No hay puntuaciones de modelos frontier publicadas; el propio autor indica que el conjunto aún no está sellado para una ejecución.

## Requisitos de hardware

- VRAM: no aplica para el instrumento en sí (scripts de biblioteca estándar de Python, sin dependencias).
- Para ejecutar los modelos evaluados: se requiere hardware capaz de servir el modelo bajo prueba; el repositorio solo menciona un modelo local de 3B como línea base débil, sin especificar GPU.
- GPU recomendadas: no disponible.
- Ejecución en GPU de consumo: no disponible para los modelos evaluados; el utillaje de evaluación corre en CPU.
- Opciones de despliegue: no disponible; el repositorio no documenta integración con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada instrumentos comparables de evaluación de detección de contradicciones con protocolo preregistrado y sellado criptográfico. El repositorio se declara parte de un stack del mismo autor junto con covenant, threefold, threefold-memory, flinch-observability, flinch-record, grokflinch, spiking-experiments y Sentinel-Witness, pero no se ofrecen datos comparativos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni puede usarse para inferencia; es utillaje de evaluación.
- Estado inmaduro: el conjunto endurecido de 16 casos está construido y medido pero no sellado para una ejecución; el autor indica que necesita un evaluador ciego y una ejecución contra al menos dos modelos frescos antes de congelarlo.
- Sin resultados publicados: 0 descargas y 0 likes; no hay puntuaciones de modelos frontier que validen el instrumento.
- Alcance limitado: todas las ejecuciones muestran el registro en contexto (pegado delante del lector), lo que prueba razonamiento, no detección autónoma. El autor reconoce que el caso más interesante (un lector que mantiene el registro en memoria y detecta la mentira sin que la sonda lo cebe) no es testable todavía.
- Tamaño de muestra reducido: el conjunto endurecido tiene 16 casos (8 contradicciones y 8 casi-aciertos), lo que limita la potencia estadística.
- Dependencia de evaluación humana: requiere un evaluador ciego al tipo y, para el acuerdo, dos o más calificadores; no hay evaluación automática.
- Licencia Apache 2.0: permite uso comercial, pero el repositorio no ofrece garantías ni datos de validación externa.
- Los datos sellados (`sealed/`) están excluidos de git hasta una revelación, por lo que no son auditables por terceros antes de ese momento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Lawless1987/contradiction-probe
- Documentación del protocolo: `docs/METHOD.md` dentro del repositorio
- Repositorio relacionado (núcleo gobernado): https://huggingface.co/Lawless1987/covenant
- Repositorio relacionado (observabilidad): https://huggingface.co/Lawless1987/threefold
- Repositorio relacionado (memoria persistente): https://huggingface.co/Lawless1987/threefold-memory
- Repositorio relacionado (instrumento de medición): https://huggingface.co/Lawless1987/flinch-observability
- Repositorio relacionado (registros de sesión): https://huggingface.co/Lawless1987/flinch-record
- Repositorio relacionado (registros de sesión): https://huggingface.co/Lawless1987/grokflinch
- Repositorio relacionado (investigación neuromórfica): https://huggingface.co/Lawless1987/spiking-experiments
- Repositorio relacionado (panel de ledger): https://huggingface.co/Lawless1987/Sentinel-Witness
