# AI999X/chemical-engineering-ai999x

## Resumen

Chemical Engineering (chemical-engineering-ai999x) es un motor de cálculo determinista empaquetado como modelo de question-answering para ingeniería química, publicado por AI999X bajo licencia Apache 2.0. No es un modelo de lenguaje generativo: es un solver compilado que resuelve 92 cálculos en 11 áreas temáticas (balances de materia y energía, diseño de reactores, separaciones, termodinámica, control de procesos y fundamentos de yacimientos y petróleo), devolviendo para cada uno la fórmula, los pasos intermedios, las unidades y una explicación en lenguaje natural. Se distribuye con la librería `chemical-engineering-ai999x` y se puede usar como aplicación de escritorio (Windows y Linux), línea de comandos, en navegador o como paquete de Python 3.10+.

El modelo tiene 4.715.520 parámetros según los pesos en safetensors del repositorio, un tamaño muy reducido que refleja su naturaleza de motor de reglas más que de red neuronal de gran escala. La longitud de contexto no está documentada en la información disponible. Su propuesta de valor es la ausencia de alucinación: cuando una entrada falta o está fuera de rango, el sistema devuelve una razón explícita en lugar de inventar un número, y todo el cálculo se ejecuta en local, sin conexión.

Es relevante para docentes, estudiantes y equipos de ingeniería que necesitan resultados reproducibles y auditables (el autor declara ejecución idéntica en Windows y Linux con Python 3.10-3.14) sin depender de servicios en la nube ni de la variabilidad de un LLM generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de cálculo determinista compilado (no disponible el detalle de la arquitectura interna) |
| Parametros totales | 4.715.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no aplica: motor de reglas, no pesos neuronales cuantizables) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | chemical-engineering-ai999x |
| Pipeline | question-answering |
| Cobertura funcional | 92 cálculos en 11 temas |
| Plataformas | Windows y Linux (x86-64); macOS y ARM vía build Python puro |
| Requisito de Python | 3.10+ |
| Inferencia | `inference: false` en la model card |

## Arquitectura y entrenamiento

La información disponible no describe una arquitectura de red neuronal (transformer, MoE, SSM o híbrida). El autor presenta el sistema como "un motor compilado" con cuatro interfaces de uso (aplicación de escritorio, CLI, navegador y paquete de Python) que ejecuta los mismos cálculos en todas ellas. El repositorio contiene 4.715.520 parámetros en formato safetensors, pero no se documenta la composición del dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO. Tampoco se detallan innovaciones de inferencia como decodificación especulativa o atención lineal.

El elemento diferencial declarado es la determinación: cada uno de los 92 cálculos incluye su fórmula, sus pasos y sus unidades, y ante una entrada ausente o fuera de rango el motor devuelve una explicación en lugar de un valor numérico. El autor afirma que los resultados son idénticos en Windows y Linux con Python 3.10 a 3.14, lo que apunta a una implementación compilada con build Python puro como alternativa para macOS y ARM. No hay información pública sobre el proceso de construcción del motor ni sobre la metodología de validación interna más allá de la evaluación declarada.

## Capacidades

- Resolución de 92 cálculos de ingeniería química organizados en 11 temas, con fórmula, pasos intermedios y unidades en cada respuesta.
- Balances de materia y energía, incluyendo balances combinados.
- Diseño de reactores: CSTR, reactor de flujo pistón (plug-flow) y cálculo de volumen para una conversión dada (caso de primer orden documentado).
- Separaciones: destilación con método de McCabe-Thiele, absorción, extracción líquida, flash y cálculo de punto de burbuja por ley de Raoult.
- Termodinámica: coeficientes de actividad, ecuaciones de estado y compresibilidad de gases por ecuación virial (correlación de Pitzer-Abbott).
- Control de procesos: controladores PID y análisis de estabilidad en lazo cerrado de un proceso con control proporcional (polos de lazo cerrado).
- Ingeniería de petróleo y yacimientos: curvas de declinación, flujo radial estacionario de petróleo hacia un pozo (Darcy) e índice de productividad.
- Operaciones auxiliares: NPSH disponible, combustión con exceso de aire (requerimiento de aire y composición de gases de combustión) y escalado de coste de equipos con exponente de capacidad e índices de coste.
- Modo de respuesta con razonamiento paso a paso orientado a resolución de problemas y ayuda con ejercicios.
- Ejecución totalmente offline en el equipo del usuario.
- Cuatro interfaces: aplicación de escritorio (Windows, Linux), CLI `chemical-engineering`, navegador y paquete de Python.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso genérico, visión ni audio.

## Casos de uso

- Docencia de operaciones unitarias: el motor devuelve fórmula, pasos y unidades para cada cálculo, lo que permite usarlo como generador de soluciones razonadas en asignaturas de ingeniería química sin riesgo de cifras inventadas.
- Verificación de cálculos de diseño en planta: un ingeniero puede contrastar el volumen de un CSTR o el NPSH disponible de una bomba contra el resultado del solver antes de fijar especificaciones de compra.
- Resolución de problemas de destilación: el método de McCabe-Thiele y el punto de burbuja por ley de Raoult se ejecutan de forma reproducible, útil para prácticas de laboratorio y para validar correlaciones propias.
- Análisis de estabilidad de lazos de control: el cálculo de polos de lazo cerrado para un proceso con control proporcional sirve para comprobar sintonías PID antes de desplegarlas en un PLC o DCS.
- Cálculo de combustión y emisiones: el requerimiento de aire con exceso y la composición de gases de combustión permiten estimaciones rápidas de eficiencia y de emisiones en calderas y hornos.
- Estimación de costes de equipos: el escalado con exponente de capacidad e índices de coste facilita presupuestos preliminares en fases de ingeniería conceptual.
- Fundamentos de yacimientos: el flujo radial de Darcy y el índice de productividad permiten calcular caudales y productividades en pozos de forma determinista.
- Integración en pipelines de Python: el paquete `pip install chemical-engineering-ai999x` permite invocar los cálculos desde scripts y notebooks en entornos Windows, Linux, macOS y ARM, con la misma lógica de respuesta.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card:

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Question answering de ingeniería química | Golden answers (611 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy ("identical on every platform") | 1.0 | No |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. El valor 1.0 corresponde a la evaluación interna del autor sobre su propio conjunto de 611 preguntas y no ha sido verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada: no aplica; el sistema es un motor de cálculo que se ejecuta en CPU y no requiere GPU para inferencia.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica; no se necesita GPU.
- Despliegue: aplicación de escritorio para Windows y Linux, CLI `chemical-engineering`, versión web en el navegador y paquete de Python 3.10+ (`pip install chemical-engineering-ai999x`). En Windows y Linux x86-64, pip instala el motor compilado; en macOS y ARM instala una build Python puro con las mismas respuestas.
- Almacenamiento: el tamaño del repositorio es de 0.0 GB según Hugging Face, por lo que el peso en disco es mínimo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (solvers deterministas de ingeniería química empaquetados como modelos de Hugging Face) en la documentación consultada. La comparación con LLM generativos de propósito general no sería homogénea, ya que este sistema no genera texto libre sino que resuelve cálculos cerrados con respuesta determinista.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| chemical-engineering-ai999x | 4.715.520 | no disponible | Apache 2.0 | Solver determinista de 92 cálculos de ingeniería química |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Cobertura acotada: solo resuelve los 92 cálculos documentados en 11 temas; no es un asistente general ni responde preguntas fuera de ese catálogo.
- Idioma: únicamente inglés (`en`); no hay soporte declarado de castellano ni de otros idiomas.
- No es un modelo generativo: no produce texto libre, no razona sobre problemas abiertos y no admite tool calling ni flujos de agentes.
- La métrica de accuracy 1.0 procede de una evaluación interna del autor sobre 611 preguntas propias y no está verificada de forma independiente; debe interpretarse con cautela.
- No se documentan sesgos conocidos, pero al ser un motor de reglas su comportamiento depende de las fórmulas y correlaciones implementadas, que pueden no cubrir regímenes fuera de rango.
- Riesgo de alucinación bajo por diseño (devuelve una razón cuando falta una entrada), pero la calidad del resultado depende de la validez de los datos de entrada y de las correlaciones empíricas empleadas.
- La model card marca `inference: false`, por lo que no se puede servir como modelo estándar de Hugging Face mediante `transformers`; el uso previsto es a través de sus interfaces propias.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero conviene revisar el archivo LICENSE del repositorio para confirmar los términos exactos.
- No se documentan limitaciones de contexto porque no aplica un contexto de tokens; la limitación real es la cobertura funcional del motor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/chemical-engineering-ai999x
- Página del modelo en AI999X: https://www.ai999x.com/models/chemical-engineering-ai999x/
- Aplicación de escritorio Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-chemical-engineering-1.6.7-windows-x86_64.zip
- Aplicación de escritorio Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-chemical-engineering-1.6.7-linux-x86_64.tar.gz
- CLI Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-windows-x86_64.zip
- CLI Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-linux-x86_64.tar.gz
- Repositorio de escritorio: https://github.com/AI999X/ai999x-desktop
- Demostración en vídeo: https://www.ai999x.com/?ax_shot=chemical-engineering-ai999x/clip.mp4
