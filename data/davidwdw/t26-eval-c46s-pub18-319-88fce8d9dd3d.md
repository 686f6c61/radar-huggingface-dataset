# davidwdw/t26-eval-c46s-pub18-319-88fce8d9dd3d

## Resumen

El repositorio `davidwdw/t26-eval-c46s-pub18-319-88fce8d9dd3d` no contiene un modelo de aprendizaje automático, sino un paquete de evidencia de evaluación de un agente robótico. Concretamente, archiva la ejecución identificada como *Task26 c46 public20 second10 index 18 (instance 319)*, correspondiente al benchmark BEHAVIOR-1K en su versión de runtime 3.9.3, ejecutada sobre una GPU RTX 4090 en un entorno de centro de cómputo. El artefacto fue publicado por el usuario `davidwdw`, sin licencia declarada, sin idiomas declarados y sin pipeline asociado.

El contenido es un directorio de ejecución con JSON oficiales, vídeo, logs, un informe de salud del detector, código fuente con su fichero `source_sha256.txt` y material de auditoría, además del registro de configuración del *second10 setup*, el log de lanzamiento y el log de preflight de GPU. El repositorio ocupa 0,2 GB y no incluye pesos, tokenizador, configuración de arquitectura ni model card técnica en el sentido habitual: el README es un informe de ejecución fechado el 9 de octubre de 2026.

Su relevancia es, por tanto, metodológica y de reproducibilidad: documenta de forma trazable el resultado de un candidato congelado (c46, `70b13f5`) sobre un envelope concreto (public20-second10) y deja constancia del resultado obtenido en la instancia 319. No es un artefacto desplegable ni evaluable como modelo de lenguaje, de visión o multimodal.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene pesos ni definición de arquitectura; se trata de evidencia de ejecución de un agente sobre BEHAVIOR-1K) |
| Parámetros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no se declara licencia en la información proporcionada) |
| Formato de pesos | no disponible (no se publican pesos; el contenido son JSON, vídeo, logs, código fuente y ficheros de auditoría) |
| Tipo de artefacto | evidencia de evaluación de una ejecución (*run*) de agente robótico |
| Benchmark objetivo | BEHAVIOR-1K 3.9.3 |
| Tarea e instancia | `assembling_gift_baskets`, instance 319 (public_test index 18) |
| Candidato evaluado | c46, `70b13f5` (public20 second10), bundle SHA256SUMS `8ce2967ce61a5ef9f479f866de56506654b88c210f87da801fa2ba73f594e914` |
| Token de ejecución | `t26c46s-i18-20261009T210646Z` |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-09T22:06:03Z |
| Fecha de actualización | 2026-10-09T22:06:28Z |

## Arquitectura y entrenamiento

No se dispone de información sobre arquitectura de red, número de parámetros, datos de entrenamiento, tokens procesados ni técnicas de alineamiento (RLHF, DPO u otras). El repositorio no publica pesos ni ficheros de configuración de modelo, por lo que no es posible determinar si el agente subyacente emplea un transformer, una política basada en difusión, un modelo híbrido o cualquier otra formulación.

La información disponible se limita al protocolo experimental: el *run* se ejecutó sobre el runtime oficial BEHAVIOR-1K 3.9.3 con un candidato congelado, dentro de un envelope definido como public20 second10, con *launch* interno `9788fe5d`. La ejecución se despachó el 2026-10-09T21:06:46Z y finalizó con estado `C46_RUN_END status=0` a las 22:03:55Z, tras superar un preflight de GPU (`gpu-preflight-20261009T205952Z`) y ejecutar 39091 pasos, correspondientes al horizonte oficial. El bundle se referencia mediante SHA256SUMS, lo que permite verificar la integridad de los ficheros listados (el propio README queda excluido de esa lista).

## Capacidades

- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión o audio.
- No se declara soporte de *tool calling* ni de *function calling*.
- No se declara soporte de agentes multi-paso más allá de lo implícito en la propia tarea de manipulación evaluada.
- No se declaran capacidades multilingües.
- La única capacidad verificable es la de servir como registro auditable de una ejecución de evaluación sobre BEHAVIOR-1K, con resultado cuantificado en la instancia 319.
- El paquete incorpora elementos de diagnóstico: informe de salud del detector (*detector health*) y logs de ejecución, útiles para inspeccionar el comportamiento del agente.

## Casos de uso

- Reproducción de resultados en robótica: el directorio de ejecución permite reconstruir las condiciones exactas (candidato, envelope, runtime, horizonte) y verificar los SHA256 del bundle para comprobar que los artefactos no han sido alterados.
- Auditoría de integridad de experimentos: los ficheros `source_sha256.txt` y `SHA256SUMS` permiten trazar qué versión del código y del candidato produjo cada resultado, requisito habitual en publicaciones y en validaciones internas.
- Análisis de fallos en manipulación robótica: con `success=false` y `q_score 0.25` en la tarea `assembling_gift_baskets`, los logs y el vídeo del *rollout* 0 sirven para diagnosticar en qué fase se degradó la política y para formular hipótesis de mejora.
- Construcción de conjuntos de evaluación agregados: al ser una instancia indexada (index 18, instance 319) dentro de un envelope mayor, este paquete puede agregarse con el resto de instancias para calcular tasas de éxito por tarea y comparar candidatos.
- Supervisión de infraestructura: el log de preflight de GPU y el directorio de ejecución permiten verificar que el nodo cumplía los requisitos antes del *run* y detectar problemas de recurso o de driver en futuras ejecuciones.
- Documentación de versiones de runtime: el registro del *second10 setup* y el log de lanzamiento sirven como referencia para fijar versiones (BEHAVIOR-1K 3.9.3, launch `9788fe5d`) y evitar deriva de entorno entre experimentos.
- Depuración de componentes de percepción: el informe de salud del detector facilita aislar si un fallo de la tarea proviene de la política o del subsistema de detección.

## Benchmarks y rendimiento

Los datos disponibles corresponden a la evaluación del agente sobre BEHAVIOR-1K, no a benchmarks de modelos de lenguaje. Se reproduce el resultado tal como figura en la información proporcionada:

| Métrica | Valor |
|---|---|
| Benchmark | BEHAVIOR-1K 3.9.3 |
| Tarea | `assembling_gift_baskets` |
| Instancia | 319 (public_test index 18) |
| Rollout | 0 |
| Éxito (`success`) | false |
| Puntuación de calidad (`q_score`) | 0,25 (final) |
| Pasos ejecutados | 39091 (horizonte oficial) |
| Estado de finalización | `C46_RUN_END status=0` |
| Candidato | c46 `70b13f5` |

No se han publicado resultados de benchmarks de modelo (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni tablas comparativas con modelos similares.

## Requisitos de hardware

- Naturaleza del artefacto: inspeccionar el repositorio requiere únicamente unos 0,2 GB de espacio en disco y herramientas para leer JSON, logs y vídeo; no requiere GPU.
- Ejecución del *run* original: la evidencia indica que se ejecutó sobre una GPU RTX 4090 en un entorno de centro de cómputo, con preflight de GPU superado y un tiempo aproximado de 57 minutos entre el despacho (21:06:46Z) y el fin del run (22:03:55Z).
- VRAM estimada para inferencia: no disponible. No se publican pesos ni configuración del modelo subyacente, por lo que no puede calcularse el consumo de memoria.
- GPU recomendadas: no disponible. El único dato disponible es el uso de una RTX 4090 para la ejecución archivada.
- Viabilidad en GPU de consumo: no disponible para el modelo; la ejecución documentada se realizó efectivamente en una GPU de consumo (RTX 4090), pero se desconoce si ese es un requisito mínimo, recomendado u obligatorio.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles, ya que no se distribuyen pesos ni artefactos de inferencia.
- Latencia y throughput: no disponibles. Solo consta la duración total del *run* y el número de pasos (39091 pasos en unos 57 minutos, aproximadamente 11,4 pasos por segundo); esta cifra corresponde al bucle de simulación y control, no al rendimiento de un modelo de lenguaje.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo, por lo que no existe una categoría de modelos comparables en términos de parámetros, contexto o licencia. Su equivalente funcional serían otros paquetes de evidencia de ejecución del mismo benchmark BEHAVIOR-1K (otras instancias, otros índices u otros candidatos del mismo envelope public20 second10), pero no se dispone de información sobre ellos en los datos proporcionados.

| Elemento comparado | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto | no disponible | no disponible | q_score 0,25; success=false en instance 319 | no disponible | HuggingFace, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo desplegable: no contiene pesos, tokenizador ni configuración de inferencia; no puede usarse para generar texto, código ni para tareas de visión.
- Ausencia de licencia: al no declararse licencia, no puede asumirse permiso de uso comercial, redistribución ni obra derivada. Es necesario contactar con el autor antes de cualquier uso.
- Ausencia de model card técnica: no hay información sobre sesgos, composición del dataset de entrenamiento ni evaluación de seguridad, por lo que no es posible valorar riesgos de sesgo o de alucinación del sistema subyacente.
- Resultado negativo y aislado: el único resultado archivado es un fallo (`success=false`, `q_score` 0,25) en una sola instancia y un solo *rollout*. No debe generalizarse al rendimiento del candidato c46 en el envelope completo ni en otras tareas.
- Trazabilidad parcial del README: el propio `README.md` queda excluido de la lista `SHA256SUMS`, de modo que su contenido no está cubierto por la verificación de integridad del bundle.
- Dependencia de un entorno específico: los resultados están ligados al runtime BEHAVIOR-1K 3.9.3 y a un *launch* y bundle concretos; reproducirlos fuera de ese entorno puede no dar resultados equivalentes.
- Metadatos incompletos: el repositorio no declara idiomas, pipeline ni licencia, lo que dificulta su catalogación y su uso en pipelines automatizados.
- Fecha de publicación atípica: las marcas temporales indican 2026-10-09, posterior a la fecha habitual de referencia; conviene verificarlas antes de citar el artefacto.
- Riesgo de interpretación errónea: por su nombre y ubicación en HuggingFace, podría confundirse con un modelo; su contenido es exclusivamente evidencia de evaluación.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/davidwdw/t26-eval-c46s-pub18-319-88fce8d9dd3d
- Benchmark BEHAVIOR-1K: no disponible en la información proporcionada (no se incluyen enlaces a paper, web oficial ni repositorio)
- Documentación del runtime 3.9.3: no disponible en la información proporcionada
- Paper o blog del candidato c46 (`70b13f5`): no disponible en la información proporcionada
- Repositorio de código del agente o del entorno de evaluación: no disponible en la información proporcionada
- Demos o vídeos públicos: no disponible (existe vídeo dentro del paquete de evidencia, pero no se referencia una URL pública)
