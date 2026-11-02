# BalanovAN/verdict

## Resumen

Verdict 0.1 es un clasificador de texto extremadamente compacto (197 KB en formato int8) desarrollado por Anton Balanov (BalanovAN) que determina el resultado semantico de llamadas a herramientas de linea de comandos (CLI). Dado un comando, su codigo de salida, la salida estandar (stdout) y la salida de error (stderr), devuelve una de cuatro clases (`success`, `failure`, `blocked` o `unknown`) junto con las probabilidades asociadas a cada clase. El modelo parte de la premisa de que un codigo de salida 0 no garantiza que una tarea se haya completado correctamente, y busca cubrir ese hueco en los arneses de agentes de codigo y en la observabilidad de CI.

No se trata de un transformer ni de una red neuronal profunda: la arquitectura es un clasificador de regresion logistica multinomial sobre caracteristicas hasheadas de n-gramas de caracteres (3-5) y de palabras (1-3). El artefacto contiene 196.608 pesos int8 con signo, cuatro sesgos y escalas de cuantizacion por clase. Los flujos de entrada se recortan de forma explicita en cabeza y cola a 12.288 caracteres cada uno.

Es relevante ahora porque los agentes basados en LLM ejecutan cada vez mas comandos en entornos reales y necesitan senales de verificacion baratas y rapidas que no dependan de otra llamada a un modelo grande. Verdict ofrece esa senal con una latencia mediana de 0,54 ms y sin dependencias de ejecucion, aunque el propio autor lo etiqueta como *research preview* y no como verificador autoritativo de completitud de tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica multinomial sobre n-gramas hasheados (caracteres 3-5 y palabras 1-3) |
| Parametros totales | 196.608 pesos int8 con signo + 4 sesgos (artefacto de 197 KB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; recorte explicito de 12.288 caracteres en cabeza y cola por flujo de entrada |
| Tipos de cuantizacion | int8 con signo, con escalas de cuantizacion por clase |
| Idiomas soportados | ingles (sesgado a ingles) |
| Licencia | Apache-2.0 (pesos); datos de entrenamiento y test publicados bajo CC0 |
| Formato de pesos | `verdict-q8.bin` (artefacto binario cuantizado) + `config.json` |

## Arquitectura y entrenamiento

El modelo no emplea un transformer ni atencion. La entrada (comando, codigo de salida, stdout y stderr) se transforma en caracteristicas mediante hashing de n-gramas de caracteres de longitud 3 a 5 y de n-gramas de palabras de longitud 1 a 3. Esas caracteristicas alimentan un clasificador de regresion logistica multinomial con cuatro clases de salida. Cada flujo de texto se recorta a 12.288 caracteres por cabeza y cola, lo que acota el coste de procesamiento independientemente del tamano real de la salida.

El entrenamiento se realizo con 1.440 registros generados programaticamente a partir de 60 familias de plantillas. El conjunto de test contiene 192 ejemplos sinteticos provenientes de 48 familias de plantillas completamente ausentes del entrenamiento. No se usaron registros de produccion ni datos propietarios. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de ajuste fino adicionales; el paradigma es aprendizaje supervisado clasico sobre datos sinteticos.

## Capacidades

- Clasificacion del resultado semantico de llamadas CLI en cuatro categorias: `success`, `failure`, `blocked` y `unknown`.
- Salida con probabilidades por clase (aunque el autor advierte que no estan calibradas).
- Procesamiento conjunto de comando, codigo de salida, stdout y stderr como senales combinadas.
- Inferencia sin dependencias de ejecucion (paquete Python autonomo).
- Integracion en arneses de agentes de codigo, pipelines de CI y analisis de salidas de herramientas.
- Capacidad de detectar fallos que un codigo de salida 0 oculta (por ejemplo, tests que no se ejecutan o builds parciales).
- No soporta tool calling, function calling, razonamiento multi-paso, vision, audio ni modo de pensamiento; es un clasificador puntual, no un modelo generativo.
- Capacidades multilingues limitadas: sesgo hacia ingles.

## Casos de uso

- Verificacion complementaria en arneses de agentes de codigo: tras ejecutar un comando, el arnes puede consultar a Verdict para obtener una segunda senal sobre si la operacion tuvo exito, manteniendo el codigo de salida como fuente principal y usando la clasificacion como aviso.
- Observabilidad de CI: ingestar los registros de stdout y stderr de cada job y etiquetar automaticamente los resultados como exito, fallo o bloqueo para construir paneles de fiabilidad sin depender solo de los codigos de salida.
- Deteccion de fallos silenciosos: identificar casos en los que `exit_code=0` pero la salida contiene indicios de fallo (por ejemplo, tests omitidos, advertencias criticas o builds incompletos), gracias al analisis conjunto de los cuatro flujos.
- Analisis de trazas de herramientas en agentes: clasificar cada llamada a herramienta en una traza larga para resumir donde fallo el agente, con coste de 0,54 ms por prediccion que permite procesar miles de eventos por segundo.
- Filtrado previo en sistemas de evaluacion de agentes: descartar rapidamente ejecuciones claramente fallidas antes de pasarlas a un evaluador LLM mas caro, reduciendo el coste total del pipeline.
- Despliegue en entornos con recursos muy limitados: al ocupar 197 KB y no tener dependencias, puede embeberse en contenedores pequenos, funciones serverless o herramientas de escritorio donde no cabe un modelo grande.
- Enriquecimiento de registros de auditoria: anadir una etiqueta semantica de resultado a cada comando ejecutado por un agente para facilitar revisiones posteriores por parte de humanos.

## Benchmarks y rendimiento

| Metrica | Verdict int8 | Baseline por codigo de salida |
|---|---:|---:|
| Accuracy | 93,2% | 47,9% |
| Macro-F1 | 93,2% | 31,9% |
| Tamano del artefacto | 197 KB | — |
| Latencia mediana | 0,54 ms | — |

La latencia se midio sobre 576 predicciones en Windows 11 / AMD64 / Python 3.12. El conjunto de test contiene 192 ejemplos sinteticos de 48 familias de plantillas ausentes del entrenamiento. El autor advierte que el rendimiento en test sintetico no debe interpretarse como fiabilidad en produccion. Los detalles completos y la matriz de confusion estan en `bench/results.json` del repositorio de codigo.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el artefacto ocupa 197 KB y la inferencia es en CPU.
- GPU recomendadas: no requiere GPU; funciona en cualquier CPU moderna.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU (Raspberry Pi, contenedores minimos, funciones serverless).
- Opciones de despliegue: paquete Python `verdict-tiny` instalable con `pip`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo generativo.
- Latencia y throughput: latencia mediana de 0,54 ms por prediccion en Windows 11 / AMD64 / Python 3.12 (576 predicciones medidas).

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la documentacion proporcionada. La tarea (clasificacion del resultado semantico de llamadas CLI) es especifica y el autor no cita alternativas. Como referencia interna, el propio autor compara contra un baseline trivial basado en el codigo de salida (accuracy 47,9%, Macro-F1 31,9%), pero no contra otros modelos de clasificacion.

| Modelo | Parametros | Contexto | Accuracy (test sintetico) | Licencia |
|---|---|---|---|---|
| Verdict 0.1 int8 | 196.608 pesos int8 | recorte a 12.288 caracteres por flujo | 93,2% | Apache-2.0 |
| Baseline por codigo de salida | no aplica | no aplica | 47,9% | no aplica |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un *research preview*: el autor lo declara explicitamente como no autoritativo para verificar la completitud de tareas.
- Sesgo hacia el ingles; no se ha validado en otros idiomas.
- Puede heredar artefactos de las plantillas sinteticas de entrenamiento y test.
- No se ha validado sobre un corpus representativo de trazas de produccion.
- Las probabilidades de clase no estan calibradas.
- El rendimiento en test sintetico (93,2%) no debe interpretarse como fiabilidad en produccion.
- No debe usarse de forma aislada para autorizar acciones destructivas ni para declarar trabajo critico como completado.
- Fuera de alcance: juicios generales de completitud de tareas, correccion de codigo, aplicacion de politicas de seguridad, clasificacion de documentos no CLI y clasificacion general de lenguaje natural.
- No debe desplegarse en produccion sin evaluacion de dominio previa.
- El repositorio de HuggingFace muestra 0 descargas y 0 likes en el momento de la consulta, lo que indica adopcion practicamente nula.
- La licencia Apache-2.0 permite uso comercial de los pesos, pero las advertencias del autor sobre validacion siguen aplicando.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BalanovAN/verdict
- Codigo, datos y benchmarks: https://github.com/Balanov/verdict
- Pagina de investigacion y demo local en navegador: https://balanov.pro/research/verdict/
- Cita BibTeX (segun model card): Balanov, Anton (2026), "Verdict: Tiny Semantic Outcome Verification for AI Agents".
