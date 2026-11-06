# jeffchanpm/HybridAgent-qwen35-9b-probe

## Resumen

HybridAgent-qwen35-9b-probe es un adaptador LoRA experimental publicado por el usuario jeffchanpm sobre el modelo base Qwen/Qwen3.5-9B. No se trata de un modelo completo, sino de un artefacto de investigación que empaqueta el adaptador seleccionado (paso 500 de entrenamiento) junto con el bundle de comparación de la línea base, el árbol de pruebas completo, los manifiestos de evaluación y el código fuente utilizado. El objetivo declarado es preservar una mejora medida en la adherencia a trayectorias de referencia en tareas de uso de herramientas, al tiempo que se documentan explícitamente las desviaciones de protocolo detectadas durante la evaluación.

El modelo aborda el problema del entrenamiento de agentes que deben emitir llamadas a herramientas siguiendo una trayectoria de referencia estricta. Según la model card, el candidato seleccionado alcanza un 81,71% de acuerdo estricto con la trayectoria de referencia (286/350) frente al 43,71% (153/350) de la línea base congelada, una diferencia neta observada de 38 puntos porcentuales. Sin embargo, el autor califica explícitamente el resultado como no apto para producción y señala fallos de especificación en el filtro de valores negativos y en la robustez del juez.

La relevancia de esta ficha es doble: por un lado, documenta un adaptador de bajo rango sobre una arquitectura Qwen 3.5 de 9B orientado a tool-use; por otro, constituye un ejemplo poco habitual de publicación que conserva los informes de fallo y las conclusiones de revisión que contradicen el PASS original. El repositorio ocupa 0,4 GB e incluye únicamente pesos del adaptador en formato PEFT, no los pesos completos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen/Qwen3.5-9B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 9B según su denominación) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en fp32 para HybridLink; no se documentan cuantizaciones del conjunto) |
| Idiomas soportados | en |
| Licencia | other / mixed-research-artifacts (ver LICENSING.md) |
| Formato de pesos | safetensors (PEFT LoRA + deltas de filas ancla, fp32 HybridLink, metadatos de tokenizer) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango sobre Qwen/Qwen3.5-9B, con una relación declarada de `adapter` respecto al modelo base. El bundle `candidate/` contiene el paso 500 seleccionado, compuesto por el adaptador PEFT, deltas de filas ancla, un HybridLink en fp32, metadatos del tokenizer y el manifiesto original, con un tamaño aproximado de 221 MB. El bundle `baseline/` conserva el paquete de comparación final de la etapa 3 con su manifiesto original. No se distribuyen los pesos completos del modelo base ni los checkpoints de entrenamiento u optimizador.

El entrenamiento se realizó sobre el dataset togethercomputer/HybridAgent-HybridSFT-v1. La model card advierte que este dataset no contiene una respuesta matemática dorada independiente, por lo que la métrica principal es el acuerdo con la trayectoria de referencia, no la corrección matemática ni la precisión general en código. La selección de entrenamiento y desarrollo utilizó el mismo conjunto de dev, y la planificación de N también se basó en él, lo que constituye una limitación metodológica reconocida. Se documentan además dos defectos conocidos en el código fuente conservado: la extracción del número de pregunta pierde el signo negativo, y la conversión de enteros en el juez anfitrión lanza ValueError con salidas numéricas muy largas (5.000 dígitos, 5.001 bytes, por debajo del límite de 64 KiB), produciendo HARNESS_FAIL; este último se reprodujo en un fixture de CPU pero no se observó en la ejecución completada.

## Capacidades

- Generación de llamadas a herramientas siguiendo trayectorias de referencia estrictas en tareas de tool-use, según la métrica de acuerdo estricto reportada.
- Reducción de solicitudes repetidas de herramienta: 1/350 en el candidato frente a 6/350 en la línea base.
- Mayor tasa de finalización EOS: 346/350 en el candidato frente a 320/350 en la línea base.
- Ejecución de tareas de agente de un solo paso dentro de un sandbox con auditorías de aislamiento.
- Seguimiento contrafactual parcial: 34/50 en test y 31/50 en dev para el candidato, frente a 23/50 y 22/50 en la línea base; el autor lo describe como seguimiento incompleto y medida secundaria.
- Capacidades multilingües: solo inglés declarado.
- No se declara soporte de visión, audio, modo thinking ni razonamiento latente fiel.
- No se declara preparación para producción, agentes con ejecución en vivo, búsqueda multi-ronda ni preparación para 27B.

## Casos de uso

- Investigación sobre entrenamiento de agentes con LoRA: el bundle permite reproducir la comparación entre candidato y línea base sobre las mismas 350 muestras emparejadas, usando los manifiestos congelados y las filas de datos incluidas, sin necesidad de descargar el dataset completo.
- Auditoría de protocolos de evaluación de tool-use: los árboles `proof/`, `reviews/` y `source/` permiten inspeccionar cómo se detectaron los fallos de especificación AC1 y AC5 y cómo se llegó a la conclusión REQUEST_CHANGES frente al PASS original.
- Estudio de robustez de jueces automáticos: el fixture de CPU que reproduce el ValueError con enteros de 5.000 dígitos sirve como caso de prueba para validar jueces que conviertan salidas numéricas largas.
- Análisis de sesgo en filtros de elegibilidad: los casos con signo negativo (IDs 30178, 38265, 38492) documentan cómo un filtro defectuoso puede inflar la métrica en 0,86 puntos porcentuales y sirven para diseñar validaciones de extracción de valores con signo.
- Verificación de integridad de artefactos de investigación: `verify_release.py` permite comprobar hashes de todos los ficheros y, opcionalmente, recalcular las estadísticas selladas en CPU sin GPU.
- Formación de investigadores en reproducibilidad: el repositorio conserva informes superados como evidencia histórica, lo que lo convierte en material didáctico sobre trazabilidad y enmienda de conclusiones.

## Benchmarks y rendimiento

Datos reportados en la model card sobre 350 muestras emparejadas originales, sin modificar:

| Metrica | Baseline congelado (etapa 3) | Candidato seleccionado |
|---|---:|---:|
| Acuerdo estricto con trayectoria de referencia | 153/350 (43,71%) | 286/350 (81,71%) |
| Salida equivalente | 171/350 | 289/350 |
| Respuesta equivalente | 276/350 | 323/350 |
| EOS | 320/350 | 346/350 |
| Solicitud repetida de herramienta | 6/350 | 1/350 |

Tabla emparejada: ambos pasan 136, ganancia 150, pérdida 17, ambos fallan 47; diferencia neta observada de 38,0 puntos porcentuales. Cota inferior unilateral de Clopper–Pearson del candidato: 0,77976; cota inferior de la mejora emparejada de Wald: 0,32928; McNemar exacto unilateral p≈4,45e-28. El autor subraya que estas son las estadísticas del informe original, no una estimación con protocolo corregido. La ejecución de 96 celdas se completó el 2026-10-29 y las repeticiones de determinismo sobre 35 muestras por lado coincidieron con sus trazas y auditorías de sandbox. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa aproximadamente 221 MB en fp32 y puede inspeccionarse sin GPU.
- La verificación de hashes (`verify_release.py`) y la recomputación opcional de la prueba están diseñadas para ejecutarse solo en CPU.
- Para inferencia real es necesario cargar el modelo base Qwen/Qwen3.5-9B, cuyos requisitos de VRAM no se detallan en la información disponible; como referencia orientativa, un transformer denso de 9B suele requerir del orden de 18-20 GB en fp16, pero este dato no está confirmado en la documentación del repositorio.
- No se documentan GPU recomendadas, opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) ni estimaciones de latencia o throughput.
- La model card marca `inference: false`, lo que indica que el autor no declara el artefacto como listo para inferencia directa.
- Entorno requerido para las comprobaciones: Python 3.12 en Linux, macOS/POSIX o WSL; Windows nativo no es compatible con la comprobación opcional porque el código importa `fcntl`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Estado |
|---|---|---|---|---|---|
| HybridAgent-qwen35-9b-probe | Adaptador LoRA sobre 9B | no disponible | Tool-use con trayectoria de referencia | mixed-research-artifacts | Experimental, sin inferencia declarada |
| Qwen/Qwen3.5-9B (base) | 9B | no disponible | Modelo generalista | según Qwen | Modelo base completo |
| Alternativas de adaptadores LoRA para tool-use de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks estándar ni de comparaciones con otros adaptadores en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo de producción: el autor declara explícitamente que no se reclama preparación para producción, agentes con ejecución en vivo, búsqueda multi-ronda ni preparación para 27B.
- Fallo de exclusión de valores con signo (AC1): la extracción del número de pregunta pierde el signo negativo; al menos tres filas medidas (IDs 30178, 38265, 38492) contienen sus valores de referencia en opciones negativas explícitas pero fueron aceptadas. Contribuyen directamente 0,86 puntos porcentuales a la ganancia observada de 38 puntos. Una revisión conservadora encontró al menos 8 casos literales con signo en train, 0 en dev y 5 en test. No se emite exclusión post hoc ni puntuación corregida.
- Fallo de robustez del juez (AC5): una salida válida de 5.000 dígitos produce 5.001 bytes, por debajo del límite de 64 KiB, pero la conversión a entero en el juez provoca ValueError y HARNESS_FAIL. Reproducido en fixture de CPU, no observado en la ejecución completada.
- Aceptación frente a observación: el informe inmutable del programa indica CAPABILITY_PASS, pero la aceptación final independiente de la especificación es REQUEST_CHANGES (AC1/AC5/AC15). Los informes afirmativos anteriores quedan superados.
- Selección de train/dev y planificación de N sobre el mismo conjunto de dev; el dataset HybridSFT-v1 no tiene respuesta matemática dorada independiente, por lo que la métrica mide acuerdo con la trayectoria de referencia, no corrección matemática ni precisión general en código.
- Aislamiento del lector meramente procedimental, ya que el dataset es público; Docker comparte el kernel del host.
- Riesgo de alucinación: no se documenta explícitamente, pero al ser un adaptador experimental sin evaluación estándar de fidelidad, no puede descartarse.
- Idiomas: solo inglés declarado; sin soporte multilingüe documentado.
- Licencia: `other` con nombre `mixed-research-artifacts`; es necesario consultar LICENSING.md antes de cualquier uso comercial, ya que las restricciones concretas no se detallan en la información disponible.
- El código fuente conserva los dos errores conocidos de forma deliberada para su inspección; su README histórico es anterior a esta publicación y no define el estado de la release.
- No se distribuyen pesos completos del modelo base, checkpoints ni ficheros del optimizador, por lo que no es posible reentrenar desde este repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jeffchanpm/HybridAgent-qwen35-9b-probe
- Licencia (LICENSING.md): https://huggingface.co/jeffchanpm/HybridAgent-qwen35-9b-probe/blob/main/LICENSING.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/togethercomputer/HybridAgent-HybridSFT-v1
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios de código o demos.
