# AI999X/astronomy-ai999x

## Resumen

Astronomy (astronomy-ai999x) es un motor de cálculo astronómico empaquetado y distribuido a través de Hugging Face por el autor AI999X. No es un modelo de lenguaje generativo en el sentido habitual: se presenta como un solucionador determinista de problemas de astronomía que cubre 67 cálculos organizados en 13 temas, entre ellos mecánica celeste y órbitas, propiedades estelares, radiación de cuerpo negro, magnitudes y distancias, cosmología básica, el Sol y el entorno espacial, y parámetros de plasma. Cada cálculo incluye su fórmula, sus pasos intermedios y sus unidades, y devuelve una explicación en lenguaje natural en lugar de un número cuando una entrada falta o está fuera de rango.

El paquete se ofrece en cuatro formatos: aplicación de escritorio para Windows y Linux, interfaz de línea de comandos, versión web y biblioteca de Python (3.10 o superior). Todo se ejecuta en local, sin conexión, lo que junto con su naturaleza determinista busca ofrecer respuestas reproducibles y sin alucinaciones, según declara el autor. La etiqueta de pipeline en Hugging Face es `question-answering` y el idioma declarado es únicamente inglés.

El repositorio tiene un tamaño de 0,0 GB y los pesos en safetensors suman 4.715.520 parámetros, un orden de magnitud muy alejado de los LLM convencionales y coherente con un motor especializado. La licencia es Apache 2.0, lo que facilita su integración en productos comerciales, y el modelo acumula 309 descargas con cero likes en el momento de la consulta. Es relevante para quienes necesitan resolver ejercicios y cálculos astronómicos de forma auditable y offline, más que para generación de texto abierta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de cálculo determinista empaquetado (no se especifica arquitectura de red neuronal; el autor lo describe como "one compiled engine") |
| Parametros totales | 4.715.520 (safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors; distribución adicional como aplicación de escritorio (Windows/Linux), CLI, versión web y paquete de Python |

## Arquitectura y entrenamiento

La información proporcionada no describe una arquitectura de transformer, MoE ni SSM. El autor presenta el producto como "one compiled engine" con cuatro formas de uso (aplicación de escritorio, línea de comandos, navegador y Python), lo que sugiere un núcleo compilado —con una implementación pura en Python para plataformas como macOS y ARM— que ejecuta cálculos astronómicos predefinidos. No se detallan capas, mecanismos de atención ni estrategias de decodificación.

Tampoco se especifican datos de entrenamiento, número de tokens, composición del dataset ni procesos de RLHF o DPO. La model card menciona 67 cálculos en 13 temas y una evaluación sobre 350 preguntas documentadas con respuestas de referencia ("golden answers"), pero no se aporta información sobre el corpus de desarrollo. La innovación declarada es la ausencia de alucinación mediante cálculo determinista y la reproducibilidad multiplataforma.

## Capacidades

- Resolución de 67 cálculos astronómicos en 13 temas, incluyendo mecánica celeste y órbitas, propiedades estelares, radiación de cuerpo negro, magnitudes y distancias, cosmología básica, el Sol y el entorno espacial, y parámetros de plasma.
- Presentación de cada resultado con fórmula, pasos intermedios y unidades.
- Devolución de una explicación razonada en lugar de un valor cuando una entrada falta o está fuera de rango.
- Ejecución completamente offline en el equipo del usuario.
- Cuatro interfaces de uso: aplicación de escritorio (Windows, Linux), CLI `astronomy`, versión web y biblioteca de Python 3.10+.
- Distribución del mismo motor compilado vía `pip install astronomy-ai999x` en Windows y Linux x86-64, y build puro en Python en macOS y ARM.
- Orientación a ayuda con deberes y resolución paso a paso de problemas de astronomía.
- No se documentan capacidades de tool calling, agentes, visión, audio, razonamiento multi-paso general ni generación de texto libre.

## Casos de uso

- Docencia de astronomía: el motor resuelve ejercicios de mecánica orbital y propiedades estelares mostrando fórmula, pasos y unidades, lo que permite al estudiante seguir el razonamiento y verificar el resultado sin depender de una conexión.
- Corrección automática de problemas: con 350 preguntas de referencia documentadas, se puede usar como oráculo determinista para validar respuestas de alumnos o de otros sistemas en plataformas de evaluación.
- Cálculo de transferencias orbitales: la capacidad de transferencia de Hohmann entre órbitas circulares permite planificar maniobras en herramientas de simulación o en asignaturas de astrodinámica.
- Estimación de distancias y magnitudes: el cálculo de distancia por paralaje y las magnitudes y distancias facilitan la reducción de datos observacionales en prácticas de laboratorio.
- Cosmología básica en divulgación: el cálculo de tiempo de retorno (lookback time) a un desplazamiento al rojo sirve para generar explicaciones numéricas verificables en materiales educativos.
- Caracterización de exoplanetas: el cálculo de la temperatura de equilibrio de un planeta y de la semiamplitud de velocidad radial apoya la interpretación de curvas de luz y datos espectroscópicos en contextos de investigación formativa.
- Integración en pipelines Python: al instalarse como paquete, puede invocarse desde scripts y notebooks para automatizar cálculos repetitivos en informes o conjuntos de ejercicios.
- Uso en entornos sin red: al ejecutarse offline, es adecuado para aulas, laboratorios aislados o despliegues con requisitos de privacidad.

## Benchmarks y rendimiento

Los datos proceden del model-index declarado por el autor y no están verificados de forma independiente (`verified: false`).

| Tarea | Conjunto de evaluación | Métrica | Valor |
|---|---|---|---|
| Question answering de astronomía | Golden answers (350 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy | 1,0 ("identical on every platform") |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño de pesos (4.715.520 parámetros) y la distribución como motor compilado sugieren que no requiere GPU dedicada.
- GPU recomendadas: no disponible; no se documenta uso de GPU.
- ¿Cabe en GPU de consumo? No se especifica; por la naturaleza del producto, la ejecución es en CPU.
- Opciones de despliegue: aplicación de escritorio para Windows y Linux, CLI `astronomy`, versión web en el navegador y paquete de Python (`pip install astronomy-ai999x`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se trata de un motor de cálculo especializado y determinista, no de un LLM generativo, por lo que las comparaciones habituales por parámetros, contexto o benchmarks no son directamente aplicables.

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| astronomy-ai999x | 4.715.520 | no disponible | apache-2.0 | Motor de cálculo astronómico determinista |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El idioma declarado es únicamente inglés; no se garantiza soporte en castellano ni en otros idiomas.
- El alcance se limita a 67 cálculos en 13 temas de astronomía; no es un modelo de propósito general ni un asistente conversacional.
- No se documentan sesgos, pero al ser un motor determinista el riesgo principal es de alcance: entradas fuera de los cálculos soportados devolverán una explicación en lugar de un resultado.
- El resultado de accuracy de 1,0 procede de una evaluación declarada por el autor y marcada como no verificada; conviene tratarlo con cautela.
- No se especifican limitaciones de contexto porque no aplica un contexto de tokens al uso.
- La licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones de la licencia y de los componentes distribuidos.
- La disponibilidad de la build compilada se limita a Windows y Linux x86-64; en macOS y ARM se instala una versión pura en Python con las mismas respuestas declaradas.
- Para producción, conviene validar los cálculos frente a fuentes astronómicas de referencia antes de confiar en ellos en contextos críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/astronomy-ai999x
- Página del modelo en el sitio del autor: https://www.ai999x.com/models/astronomy-ai999x/
- Aplicación de escritorio, Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-astronomy-1.6.7-windows-x86_64.zip
- Aplicación de escritorio, Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-astronomy-1.6.7-linux-x86_64.tar.gz
- CLI, Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-windows-x86_64.zip
- CLI, Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-linux-x86_64.tar.gz
- Demostración en vídeo (MP4): https://www.ai999x.com/?ax_shot=astronomy-ai999x/clip.mp4
- Repositorio de escritorio en GitHub: https://github.com/AI999X/ai999x-desktop
