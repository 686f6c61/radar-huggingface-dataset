# NagaYu/ante-claim-alignment

## Resumen

Ante claim-alignment es un juez automático de alineación entre una afirmación (claim), el cambio de código asociado y la evidencia adjunta (tests). Su pregunta central es si la evidencia realmente prueba lo que la afirmación declara, no si el parche es correcto ni quién lo escribió. Lo desarrolla NagaYu y se distribuye bajo licencia Apache 2.0 con el pipeline de clasificación de texto.

A diferencia de los modelos neuronales convencionales, este es un programa basado en reglas deliberadamente: cada decisión debe poder explicarse línea a línea a la persona afectada, porque el veredicto puede costar trabajo real a un contribuidor. Combina cuatro señales ejecutadas o derivadas estáticamente (discriminación, alcance, correspondencia y no trivialidad) y emite veredictos como `ALIGNED`, `TRIVIAL_EVIDENCE`, `MISALIGNED`, `UNDER_SUBSTANTIATED` o `NO_EVIDENCE`, ninguno de los cuales significa "rechazado".

Su relevancia actual reside en la automatización de la revisión de código en proyectos de software: ofrece un protocolo interpretable y auditable para verificar que las afirmaciones de un pull request (por ejemplo, "corrige el bug X" o "mejora el rendimiento un 20 %") estén respaldadas por pruebas que realmente las ejercitan. Medido sobre el corpus Ante Bench, detecta el 100 % de la evidencia fabricada y pierde solo un 6,8 % de contribuciones válidas por falsos positivos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Programa basado en reglas (rule-based), no red neuronal |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (no aplica; codigo fuente ejecutable) |

## Arquitectura y entrenamiento

El modelo no es una red neuronal, sino un programa determinista que ejecuta cuatro señales sobre el cambio, la afirmación y la evidencia:

1. Discriminación: re-ejecuta el test adjunto sobre el commit base y sobre el head; si falla en base y pasa en head, la evidencia discrimina. Un fallo de base por `ImportError` de un símbolo que el parche introduce se considera más débil que un `AssertionError` sobre comportamiento.
2. Alcance: mide qué líneas ejecutables modificadas se ejecutaron realmente, excluyendo comentarios, líneas en blanco y docstrings del denominador. El umbral es `min_change_coverage = 0.34`.
3. Correspondencia: comprueba si las aserciones mencionan los símbolos, tipos de excepción, argumentos clave y condiciones de la afirmación.
4. No trivialidad: análisis del AST que detecta aserciones tautológicas, aserciones de constantes, tests que nunca llaman al paquete y tests que mockean el propio símbolo bajo afirmación, con seguimiento de taint para reconocer patrones legítimos como `result = f(x); assert all(... for ... in result)`.

No existe entrenamiento neuronal; los umbrales se eligieron sobre el corpus Ante Bench y se declaran en `config.json`, siendo sobreescribibles por proyecto en `AGENTS.md`. Una sonda de inyección de fallos (mutation testing restringida a las líneas cambiadas) se reporta como señal, no como puerta, porque medirla como puerta incrementa los falsos positivos en parches de guardia pequeños.

## Capacidades

- Clasificación de texto con veredictos discretos: `ALIGNED`, `TRIVIAL_EVIDENCE`, `MISALIGNED`, `UNDER_SUBSTANTIATED`, `NO_EVIDENCE`.
- Verificación de que la evidencia (tests) prueba la afirmación hecha sobre un cambio concreto.
- Detección de evidencia fabricada (tests que no ejercitan el código o que mockean el símbolo bajo afirmación).
- Detección de afirmaciones triviales o tautológicas mediante análisis de AST.
- Interpretabilidad total: cada veredicto se puede explicar línea a línea.
- Integración con `AGENTS.md` para sobreescribir umbrales por proyecto.
- No realiza detección de autoría: no contiene señal de autoría y está diseñado para no necesitarla.

## Casos de uso

- Revisión automatizada de pull requests: integrar el juez en el pipeline de CI para que cada PR con una afirmación (por ejemplo, "corrige el bug de seguridad") deba adjuntar un test que realmente falle en base y pase en head. El veredicto `MISALIGNED` genera una petición concreta y satisfacible al contribuidor.
- Prevención de regresiones silenciosas: al exigir que la evidencia cubra al menos el 34 % de las líneas ejecutables modificadas, se reduce el riesgo de que un parche con afirmaciones vagas pase sin validación.
- Validación de correcciones de bugs: el juez verifica que el test adjunto falla en base por una razón relacionada con el comportamiento (no por un `ImportError` del propio símbolo introducido) y que las aserciones mencionan los símbolos relevantes.
- Auditoría de contribuciones en proyectos de código abierto: como el veredicto es explicable, los mantenedores pueden mostrar al contribuidor exactamente qué señal falló (por ejemplo, "el test no toca la línea que cambiaste").
- Revisión de parches con afirmaciones de rendimiento: si la afirmación dice "reduce el tiempo de ejecución un 20 %", el juez comprueba que la prueba ejercita el código modificado y que las aserciones comparan tiempos o recursos, aunque no valida la magnitud exacta.
- Detección de tests triviales o tautológicos en revisiones manuales: el análisis de AST identifica aserciones que no comprueban nada (constantes, condiciones siempre verdaderas, mocks del símbolo bajo prueba), permitiendo al revisor centrarse en la lógica real.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card y en el model-index, medidos sobre el dataset `NagaYu/ante-bench`:

| Metrica | Valor |
|---|---|
| Evidencia fabricada detectada | 100 % |
| Fuera de tema / baja calidad rechazada | 100 % |
| Contribuciones validas perdidas (falsos positivos) | 6,8 % |
| Cambios que rompen comportamiento aceptados | 30 % |
| Tiempo de verificacion por PR (media / maximo) | 0,42 s / 2,14 s |

El autor advierte que la evidencia del benchmark depende de la maquina donde se ejecuta y que los intervalos de confianza mitigan, pero no eliminan, esa variabilidad. No se han publicado comparaciones con otros jueces de alineación en la informacion disponible.

## Requisitos de hardware

- No requiere GPU: es un programa basado en reglas que ejecuta analisis estatico y re-ejecuta tests sobre el repositorio.
- CPU suficiente para ejecutar los tests del proyecto que se esta verificando; el tiempo de verificacion medio es de 0,42 s por caso y maximo 2,14 s en el benchmark.
- Para integracion en CI, basta con un runner con entorno de Python y las dependencias del proyecto a revisar.
- Despliegue tipico: como modulo Python (`predict.py`) o como paso en un pipeline de GitHub Actions, no mediante vLLM, Ollama o TGI, que son para modelos neuronales.
- La latencia esta dominada por la ejecucion de los tests de base y head, no por el propio juez.

## Comparativa con modelos similares

No se han encontrado alternativas directas en la informacion disponible. Existen jueces de calidad de PR basados en LLMs (por ejemplo, clasificadores neuronales de aprobacion o revisores automaticos), pero ninguno con el mismo enfoque de mecanismo basado en reglas interpretables para alineacion de evidencia y afirmacion. La comparativa con baselines de `NagaYu/ante-bench` se menciona en la model card pero no se detalla en los datos proporcionados.

## Limitaciones y advertencias

- Verifica la afirmacion que se ha hecho, no las que no se han hecho: un parche cuya afirmacion de rendimiento es cierta pero que cambia silenciosamente comportamiento no testeado pasara.
- La extraccion de afirmaciones es lexica: si la afirmacion no nombra ningun simbolo definido por el repositorio, la senal de correspondencia es mas debil.
- La evidencia de benchmark depende de la maquina donde se ejecuta; los intervalos de confianza mitigan pero no eliminan la variacion.
- Los umbrales se eligieron sobre un corpus concreto (Ante Bench); son sobreescribibles en `AGENTS.md` pero pueden no transferir bien a otros dominios.
- No debe usarse para deteccion de autoridad humana vs. IA: no contiene ninguna senal de autoridad y el protocolo esta disenado para no necesitarla.
- Para produccion, es necesario configurar los umbrales (p. ej., `min_change_coverage`) en `config.json` y validar su comportamiento en el repositorio objetivo.
- La licencia Apache-2.0 permite uso comercial, pero los datos del benchmark `NagaYu/ante-bench` pueden tener sus propias condiciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NagaYu/ante-claim-alignment
- Dataset de benchmark: https://huggingface.co/datasets/NagaYu/ante-bench
- Codigo y configuracion: accesibles desde la model card (referencia a `predict.py` y `config.json`)
