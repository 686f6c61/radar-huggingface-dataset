# AI999X/transportation-ai999x

## Resumen

transportation-ai999x es un motor de resolución de problemas de ingeniería del transporte escrito en Python y distribuido por la organización AI999X (autor: Ibnul Jaif Farabi). No es un modelo de lenguaje generativo al uso: la model card lo describe como un sistema neuro-simbólico determinista que interpreta preguntas en inglés sencillo (o llamadas tipadas) y las resuelve con uno de sus 77 procedimientos certificados, devolviendo el resultado junto con pasos, fórmulas en LaTeX, unidades y supuestos. Cubre dinámica de vehículos, distancias de frenado y visibilidad, flujo de tráfico, geometría de carreteras, explotación ferroviaria, planificación de rutas y capacidad de transporte público.

El paquete se ejecuta íntegramente en CPU, sin GPU, sin clave de API y sin conexión de red, y declara un conjunto de 536 respuestas doradas reproducidas de forma idéntica en Windows y Linux sobre Python 3.10 a 3.14. Su diseño prioriza la ausencia de respuestas incorrectas: cuando no puede verificar un resultado, devuelve uno de siete estados explícitos (SOLVED, NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT, INTERNAL_ERROR) en lugar de improvisar.

Es relevante para el nicho edtech y de herramientas de ingeniería porque propone lo contrario de un LLM: solución exacta, reproducible y auditable en lugar de generación probabilística. Conviene señalar, no obstante, que el repositorio contiene pesos en safetensors con 4.715.520 parámetros declarados, lo que sugiere un componente neuronal (probablemente clasificación de intención o similitud semántica) que la model card no describe en detalle; la documentación pública se centra en la capa simbólica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor neuro-simbólico determinista: lectura basada en reglas + 77 capacidades simbólicas certificadas; pesos neuronales auxiliares en safetensors/ONNX (composición exacta no documentada) |
| Parametros totales | 4.715.520 (según safetensors del repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo generativo con ventana de contexto; acepta las formas de pregunta documentadas) |
| Tipos de cuantizacion | No disponible; se distribuye wheel de Python con pesos ONNX y safetensors sin información de cuantización |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX; distribución principal como wheel de PyPI (`transportation_ai999x-1.0.1-py3-none-any.whl`) |

## Arquitectura y entrenamiento

La model card define el sistema como un motor híbrido: una capa de lectura que interpreta preguntas en inglés o llamadas tipadas (`solve(capability_id, **inputs)`) y una capa simbólica que ejecuta procedimientos certificados sobre SymPy y mpmath. Cada resultado se somete a una comprobación posterior (sustitución inversa, análisis dimensional o contraste con un cálculo independiente) antes de devolverse. El paquete incluye un "knowledge pack" versión 1.0.0 y 77 procedimientos que cubren dinámica de vehículos, frenado, flujo de tráfico, geometría viaria, ferrocarril, rutas y capacidad de tránsito.

No se documenta en la información disponible el proceso de entrenamiento de los componentes neuronales: no hay datos sobre número de tokens, composición del corpus, ni uso de RLHF o DPO. Tampoco se detalla si los 4.715.520 parámetros en safetensors corresponden a un encoder de frases, a un clasificador de intención o a ambos. La innovación declarada no es algorítmica en el sentido habitual, sino de ingeniería de fiabilidad: taxonomía cerrada de siete estados de salida, reproducibilidad bit a bit entre plataformas y rechazo explícito cuando falta un dato de entrada.

## Capacidades

- Resolución de problemas de dinámica de vehículos: distancia de parada y de visibilidad, frenado, velocidad segura en curva con peralte y rozamiento lateral.
- Ingeniería de tráfico: flujo, colas en intersecciones semaforizadas, demora uniforme, capacidad y niveles de servicio.
- Geometría de carreteras: curvas, peralte, distancias de visibilidad y trazado.
- Explotación ferroviaria y planificación de transporte: capacidad, rutas y asignación.
- Búsqueda de ruta más rápida sobre grafos con pesos de distancia y velocidad (algoritmo no especificado en la información disponible).
- Interfaz de doble entrada: `ask()` para preguntas en inglés documentado y `solve(capability_id, **inputs)` tipado y garantizado.
- Salida explicativa: pasos intermedios, fórmulas en LaTeX, unidades, supuestos y capacidad utilizada.
- Taxonomía de siete estados de resultado con rechazo explícito en lugar de estimación.
- Ejecución offline en CPU, sin red, sin clave de API y sin GPU.
- Tareas auxiliares declaradas por los tags: token classification, text classification, sentence similarity, feature extraction y búsqueda semántica.
- No dispone de: generación de texto libre, visión, audio, tool calling genérico, razonamiento multi-paso abierto ni modo "thinking".

## Casos de uso

- Corrección automática de ejercicios de ingeniería del transporte: el motor recibe el enunciado y devuelve resultado, pasos y supuestos, lo que permite comparar con la solución del alumno y señalar en qué paso diverge.
- Tutoría offline en entornos sin conectividad: al ejecutarse solo en CPU y sin red, puede desplegarse en aulas, portátiles de campo o dispositivos edge donde no se permite enviar datos a la nube.
- Generación de bancos de problemas verificados: las 536 respuestas doradas sirven como base de tests de regresión para materiales docentes o para validar ejercicios nuevos.
- Validación cruzada en pipelines de cálculo viario: integrado como dependencia Python, comprueba resultados de hojas de cálculo o scripts propios en distancias de visibilidad, curvas y capacidad semaforizada.
- Herramienta de apoyo en obra y campo: cálculo de velocidad segura en curva o distancia de parada desde un portátil sin conexión, con trazabilidad de fórmulas y unidades.
- Componente de evaluación para LLM: usar sus respuestas deterministas como referencia frente a las que produce un modelo generativo en las mismas preguntas de transporte.
- Preprocesado semántico en buscadores técnicos: los tags de sentence similarity y feature extraction permiten indexar documentación de transporte, aunque no se detalla el rendimiento de estas tareas.

## Benchmarks y rendimiento

| Tarea | Dataset | Metrica | Resultado | Verificado |
|---|---|---|---|---|
| Question answering de transporte | Golden answers (536 preguntas documentadas, Windows + Linux, Python 3.10-3.14, tipo `ai999x-evaluation`) | accuracy | 1,0 (100 %) | No (declarado por el autor; `verified: false`) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BBH u otros) en la información disponible. La única métrica reportada mide reproducibilidad sobre el propio conjunto de preguntas del autor, no capacidad general ni comparación con terceros; debe interpretarse como consistencia interna, no como calidad absoluta.

## Requisitos de hardware

- VRAM: 0 GB. El sistema está diseñado para ejecutarse exclusivamente en CPU; no requiere GPU.
- GPU recomendadas: ninguna. No hay soporte CUDA declarado.
- Compatibilidad con GPU de consumo: irrelevante; el despliegue objetivo es CPU, incluyendo entornos edge.
- RAM y CPU: no se especifican requisitos mínimos; el tamaño del repositorio es de 0,1 GB y las dependencias declaradas son SymPy y mpmath.
- Sistemas y versiones probados: Windows con Python 3.13; Linux x86-64 con Python 3.10, 3.11, 3.12, 3.13 y 3.14.
- Opciones de despliegue: `pip install transportation-ai999x` desde PyPI o instalación directa del wheel alojado en HuggingFace; uso como librería Python (`import transportation_ai999x`). No aplica despliegue con vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser cálculo simbólico sobre CPU, la latencia dependerá del procedimiento concreto y no de un coste de inferencia neuronal dominante.

## Comparativa con modelos similares

| Criterio | transportation-ai999x | LLM generativo de propósito general | Librería simbólica (tipo SymPy/SciPy) | Motor de conocimiento comercial (tipo Wolfram\|Alpha) |
|---|---|---|---|---|
| Parametros | 4.715.520 declarados en safetensors | Variable según modelo (no disponible aquí) | No aplica (no es un modelo entrenado) | No disponible |
| Contexto | No disponible; acepta formas de pregunta documentadas | Ventana de tokens variable | No aplica | No aplica |
| Determinismo | Sí, por diseño; 536 respuestas idénticas entre plataformas | No | Sí | No documentado |
| Cobertura de dominio | 77 capacidades cerradas de transporte | Abierta, con riesgo de error | Abierta pero requiere formular el cálculo | Amplia, genérica |
| Ejecución offline | Sí, CPU, sin red | Posible con pesos locales y hardware adecuado | Sí | No |
| Licencia | Apache-2.0 | Variable según modelo | Licencia permisiva del proyecto correspondiente | Propietaria |
| Disponibilidad | PyPI + HuggingFace; 0 descargas y 0 likes en el momento de la ficha | Amplia | Amplia | Comercial |

No se dispone de datos públicos de comparación directa con otros solucionadores de ingeniería del transporte, por lo que la comparativa es cualitativa.

## Limitaciones y advertencias

- Ámbito cerrado: solo responde a las 77 capacidades y a las formas de pregunta documentadas; cualquier cuestión fuera de ese conjunto devuelve OUT_OF_SCOPE o UNRECOGNIZED_FORMAT.
- Un solo idioma: la interfaz de lenguaje natural está en inglés; no hay soporte declarado de castellano.
- Naturaleza no generativa: no redacta explicaciones libres, no mantiene conversaciones multi-turno y no razona sobre problemas abiertos.
- Riesgo de alucinación bajo por diseño (rechaza en lugar de estimar), pero esa misma política puede producir rechazos en problemas resolubles si la entrada no encaja en el formato esperado.
- La métrica de accuracy 1,0 está declarada por el autor, marcada como no verificada y medida sobre su propio conjunto de 536 preguntas; no equivale a una evaluación independiente.
- Adopción nula en el momento de la ficha (0 descargas, 0 likes) y ausencia de validación por terceros; conviene tratarlo como proyecto emergente de un único autor.
- Falta de documentación sobre la capa neuronal: no se detalla qué hacen los 4.715.520 parámetros en safetensors ni cómo se entrenaron, lo que dificulta auditar esa parte.
- Licencia Apache-2.0 permite uso comercial y modificación, con obligación de conservar avisos de copyright y licencia y de indicar cambios; no hay cláusulas de uso restringido declaradas.
- Para producción: fijar la versión del paquete y del knowledge pack (1.0.0) y cubrir con tests propios los procedimientos críticos, dado que no existe garantía externa de estabilidad entre versiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AI999X/transportation-ai999x
- Paquete en PyPI: https://pypi.org/project/transportation-ai999x/
- Guía de capacidades (docs): https://huggingface.co/AI999X/transportation-ai999x/tree/main/docs
- Evaluación: https://huggingface.co/AI999X/transportation-ai999x/tree/main/evaluation
- Organización AI999X en HuggingFace: https://huggingface.co/AI999X
- Sitio web: https://ai999x.com
- Apoyo al desarrollo: https://buymeacoffee.com/ibnuljaiffarabi
- Licencia: https://huggingface.co/AI999X/transportation-ai999x/blob/main/LICENSE
