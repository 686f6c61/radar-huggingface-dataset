# AI999X/earth-science-ai999x

## Resumen

earth-science-ai999x es un motor de cálculo determinista especializado en ciencias de la Tierra, publicado por el autor AI999X en Hugging Face bajo licencia Apache 2.0. A pesar de estar etiquetado con el pipeline `question-answering` y de contener pesos en formato safetensors (4.715.520 parámetros), el propio autor lo describe como un motor compilado (implementado en Rust, con empaquetado Python) que resuelve 87 cálculos repartidos en 21 temas de meteorología, oceanografía, sismología, geofísica, clima y geología. No es un modelo de lenguaje generativo al uso: no predice el siguiente token, sino que evalúa fórmulas físicas con sus pasos y unidades.

El modelo cubre dominios concretos como la termodinámica atmosférica (nivel de condensación por elevación, índice de calor), el balance radiativo planetario, las propiedades del agua de mar (densidad in situ según EOS-80), la sismología (magnitud de momento a partir del momento sísmico), la geocronología (edad radiométrica) y la isostasia. Cada cálculo devuelve la fórmula, los pasos intermedios y las unidades, y cuando una entrada falta o está fuera de rango devuelve una explicación en lenguaje natural en lugar de un número inventado.

Su relevancia actual radica en la propuesta de "cero alucinación" y funcionamiento totalmente offline: se distribuye como aplicación de escritorio (Windows y Linux), herramienta de línea de comandos, versión web y paquete de Python (`pip install earth-science-ai999x`), de modo que los resultados son idénticos en todas las plataformas. Es, por tanto, una alternativa determinista a los asistentes conversacionales para docencia, resolución de problemas de ciencias de la Tierra y verificación de cálculos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de cálculo determinista compilado (Rust) con empaquetado Python; no es un transformer generativo |
| Parametros totales | 4.715.520 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: no es un modelo de contexto conversacional) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0.0 GB); distribución principal como binarios compilados y paquete pip |

## Arquitectura y entrenamiento

La información disponible no describe una arquitectura de red neuronal ni un proceso de entrenamiento con tokens, RLHF o DPO. El autor presenta el sistema como "un motor compilado" con 87 cálculos en 21 temas, cada uno con su fórmula, sus pasos y sus unidades, implementado en Rust y distribuido con enlaces nativos para Python. La etiqueta `library_name: earth-science-ai999x` y la presencia de pesos safetensors de 4.715.520 parámetros sugieren un componente empaquetado, pero no se detalla su naturaleza interna (tablas de constantes, coeficientes de fórmulas o artefactos de serialización).

La innovación técnica declarada es el determinismo multiplataforma: la model card afirma que las respuestas son idénticas en Windows y Linux con Python 3.10 a 3.14, y que en macOS y ARM se instala una compilación pura de Python que ofrece las mismas respuestas. El sistema devuelve una razón en lenguaje natural en lugar de un número cuando una entrada falta o está fuera de rango, lo que constituye el mecanismo explícito para evitar resultados inventados. No se especifican datos de entrenamiento, composición del dataset ni técnicas de alineación.

## Capacidades

- Resolución de 87 cálculos de ciencias de la Tierra en 21 temas, con fórmula, pasos intermedios y unidades.
- Termodinámica atmosférica y meteorología: nivel de condensación por elevación (Romps 2017), índice de calor (NWS), entre otros.
- Clima y balance radiativo: temperatura de equilibrio planetario (temperatura efectiva de radiación).
- Oceanografía y propiedades del agua de mar: densidad in situ según EOS-80, periodo de oscilaciones inerciales.
- Sismología y geofísica: magnitud de momento a partir del momento sísmico, isostasia de Pratt.
- Geología y geocronología: edad radiométrica a partir de la relación hija/padre.
- Modo "step-by-step": muestra los pasos de resolución, orientado a ayuda con deberes y docencia.
- Gestión de entradas inválidas: devuelve una explicación en lenguaje natural en lugar de un valor cuando falta un dato o está fuera de rango.
- Ejecución offline en el propio equipo, sin dependencia de servicios en la nube.
- Cuatro interfaces: aplicación de escritorio (Windows, Linux), línea de comandos `earth-science`, navegador y paquete de Python 3.10+.
- No se documentan tool calling, razonamiento multi-paso agéntico, visión, audio ni capacidades multilingües más allá del inglés.

## Casos de uso

- Docencia de ciencias de la Tierra: el modo paso a paso permite mostrar al alumnado la fórmula, la sustitución de valores y las unidades de cálculos como el nivel de condensación o la edad radiométrica, con resultados reproducibles en el aula.
- Ayuda con deberes y autoevaluación: el estudiante introduce los datos de un problema y obtiene la resolución completa; si un dato falta o está fuera de rango, recibe una explicación en lugar de un número erróneo.
- Verificación de cálculos en investigación: comprobación rápida y offline de magnitudes derivadas (magnitud de momento, densidad del agua de mar, temperatura efectiva planetaria) antes de incorporarlas a un análisis mayor.
- Integración en pipelines de Python: mediante `pip install earth-science-ai999x` se pueden automatizar cálculos repetitivos en scripts de procesamiento de datos meteorológicos u oceanográficos sin conexión a internet.
- Entornos con requisitos de privacidad o sin red: al ejecutarse íntegramente en local, es apto para instalaciones aisladas, laboratorios con datos sensibles o trabajo de campo sin conectividad.
- Formación interna y material didáctico: las escenas y gráficas generadas por la aplicación de escritorio a partir de la respuesta calculada sirven para ilustrar conceptos en presentaciones y manuales.
- Herramienta de línea de comandos para científicos de datos: el binario `earth-science` permite incorporar cálculos a flujos de trabajo de shell y reproducir resultados idénticos entre Windows y Linux.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor en la model card son los siguientes (no verificados de forma independiente, `verified: false`):

| Tarea | Dataset de evaluación | Métrica | Valor |
|---|---|---|---|
| Question answering de ciencias de la Tierra | Golden answers (535 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy | 1.0 ("idéntico en todas las plataformas") |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El dato de accuracy 1.0 procede de un conjunto de evaluación propio del autor y no es comparable con benchmarks de modelos de lenguaje generativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al no ser un modelo generativo con pesos en GPU, no requiere VRAM dedicada.
- GPU recomendadas: no aplica; el motor se ejecuta en CPU.
- Compatibilidad con GPU de consumo: no aplica.
- Sistemas operativos soportados: Windows y Linux (x86-64) con binarios compilados; macOS y ARM mediante compilación pura de Python con las mismas respuestas.
- Versión de Python: 3.10 o superior (probado en 3.10-3.14).
- Opciones de despliegue: aplicación de escritorio, línea de comandos `earth-science`, versión web en la página del modelo y paquete `pip install earth-science-ai999x`.
- Latencia y throughput: no disponibles; al tratarse de cálculos deterministas en local, no se publican métricas de rendimiento.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| earth-science-ai999x | Motor de cálculo determinista | 4.715.520 (safetensors) | no aplica | 87 cálculos de ciencias de la Tierra con pasos y unidades | apache-2.0 | Hugging Face, pip, escritorio, CLI, web |
| Modelos de lenguaje generativos de propósito general | Transformer generativo | Miles de millones | Decenas de miles de tokens | Razonamiento y generación de texto libre | Varía | Hugging Face, APIs |
| Librerías de cálculo científico (por ejemplo, paquetes de fórmulas físicas) | Código/biblioteca | no aplica | no aplica | Fórmulas sin interfaz conversacional ni explicación de pasos | Varía | Repositorios de código |

No se dispone en la información proporcionada de modelos directamente comparables de la misma categoría (motores deterministas de ciencias de la Tierra con distribución multiplataforma). La comparación con modelos generativos es estructuralmente desigual: earth-science-ai999x no genera texto libre ni razona sobre contexto, sino que evalúa fórmulas acotadas con resultado determinista.

## Limitaciones y advertencias

- No es un modelo de lenguaje generativo: no mantiene conversaciones abiertas, no redacta texto libre ni responde preguntas fuera de sus 87 cálculos documentados.
- Cobertura acotada: solo cubre los 21 temas y 87 cálculos descritos; cualquier problema fuera de ese catálogo no se resolverá.
- Idioma: únicamente inglés; no se documenta soporte de castellano ni de otros idiomas.
- El resultado de accuracy 1.0 está autodeclarado (`verified: false`) y se basa en un conjunto de evaluación propio del autor, no en un benchmark independiente; debe interpretarse con cautela.
- La model card no detalla la naturaleza interna de los pesos safetensors ni el proceso de construcción, lo que limita la auditoría técnica del componente.
- Riesgo de alucinación bajo por diseño (devuelve explicaciones ante entradas inválidas), pero no se han publicado evaluaciones independientes que lo confirmen.
- Sesgos: no documentados; al ser determinista y basado en fórmulas, el riesgo de sesgo estadístico es bajo, aunque las fórmulas y constantes elegidas pueden incorporar supuestos de modelo físico (por ejemplo, EOS-80 frente a EOS-2010 en densidad del agua de mar).
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; conviene revisar el archivo LICENSE del repositorio para los términos exactos.
- Los binarios compilados solo cubren Windows y Linux x86-64; en macOS y ARM se usa la compilación pura de Python, cuyo rendimiento puede diferir aunque las respuestas declaradas sean idénticas.
- No se documentan mecanismos de tool calling ni integración con agentes, por lo que no es adecuado como backend de un asistente conversacional general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/earth-science-ai999x
- Página del modelo con capacidades interactivas: https://www.ai999x.com/models/earth-science-ai999x/
- Sección de capacidades: https://www.ai999x.com/models/earth-science-ai999x/#capabilities
- Aplicación de escritorio para Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-earth-science-1.6.7-windows-x86_64.zip
- Aplicación de escritorio para Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-earth-science-1.6.7-linux-x86_64.tar.gz
- CLI para Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-windows-x86_64.zip
- CLI para Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-linux-x86_64.tar.gz
- Repositorio de escritorio en GitHub: https://github.com/AI999X/ai999x-desktop
- Vídeo de demostración (MP4): https://www.ai999x.com/?ax_shot=earth-science-ai999x/clip.mp4
- Archivo de licencia: https://huggingface.co/AI999X/earth-science-ai999x/blob/main/LICENSE
