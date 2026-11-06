# AI999X/power-electronics-ai999x

## Resumen

power-electronics-ai999x es un motor de resolución determinista para problemas de electrónica de potencia, publicado por AI999X y atribuido a Ibnul Jaif Farabi. No es un modelo de lenguaje generativo al uso: combina una capa de lectura de enunciados en inglés con 79 procedimientos simbólicos certificados que calculan la respuesta de forma exacta y la verifican antes de devolverla. Se distribuye como paquete Python (`power-electronics-ai999x` 1.0.0) con pesos en safetensors y ONNX, y su repo ocupa 0,0 GB.

El modelo resuelve un problema concreto: dar respuestas fiables de cálculo en convertidores DC-DC, rectificadores, inversores, PWM, accionamientos de motor, pérdidas de dispositivo, diseño térmico y magnético, y convertidores resonantes, sin alucinación. Para ello implementa siete resultados explícitos (SOLVED, NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT, INTERNAL_ERROR) y rechaza contestar cuando no puede verificar el resultado, en lugar de aproximar.

Es relevante para entornos educativos y de ingeniería porque funciona íntegramente en CPU, sin GPU, sin red y sin clave de API, y porque declara 482 respuestas documentadas reproducidas de forma idéntica en Windows y Linux (Python 3.10 a 3.14). Con 4.715.520 parámetros totales en safetensors, su huella es mínima y encaja en despliegues de borde y aplicaciones de tutoría offline.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Motor neuro-simbólico determinista (lectura basada en reglas + capacidades simbólicas certificadas) |
| Parámetros totales | 4.715.520 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

La arquitectura es neuro-simbólica y determinista: una capa de interpretación de lenguaje natural basada en reglas reconoce formas de pregunta documentadas y las enruta a uno de los 79 procedimientos certificados de electrónica de potencia. Cada procedimiento calcula la solución de forma simbólica (con SymPy y mpmath), y el resultado se verifica mediante sustitución inversa, comprobación dimensional o comparación con un cálculo independiente antes de devolverse. El paquete es Python puro y no requiere GPU, red ni clave de API.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. El autor documenta un "knowledge pack" versión 1.0.0 y 482 respuestas doradas que sirven como referencia de evaluación. La innovación técnica destacable es el diseño de "cero respuestas erróneas": el sistema devuelve uno de siete estados explícitos y nunca genera una respuesta silenciosa ante una entrada no reconocida o fuera de alcance.

## Capacidades

- Resolución de problemas de electrónica de potencia con pasos, fórmulas en LaTeX, unidades y supuestos declarados.
- Cálculo de convertidores DC-DC (buck, boost, flyback y otros modos CCM), rectificadores monofásicos y trifásicos controlados, e inversores con tiempos de conmutación por espacio vectorial (SVPWM).
- Análisis de accionamientos de motor, pérdidas de dispositivo, diseño térmico y magnético, y convertidores resonantes.
- Interfaz de lenguaje natural mediante `ask()` para formas de pregunta documentadas.
- Interfaz tipada garantizada mediante `solve(capability_id, **inputs)` para tareas soportadas con entradas válidas.
- Verificación interna de resultados antes de la respuesta (sustitución, comprobación dimensional o cálculo independiente).
- Rechazo explícito con mensaje de lo que falta cuando la respuesta no puede verificarse.
- Funcionamiento offline en CPU, sin GPU, sin red y sin clave de API.
- Soporte multilingüe: no disponible; el único idioma declarado es inglés.

## Casos de uso

- Tutoría de electrónica de potencia en el aula: el modelo resuelve ejercicios de buck, boost, flyback o rectificadores trifásicos mostrando pasos, LaTeX y supuestos, lo que permite al estudiante seguir el razonamiento y comprobar su propio trabajo.
- Corrección automática de deberes: con la interfaz `solve(capability_id, **inputs)` se pueden validar respuestas numéricas de forma determinista y devolver el estado NEEDS_INPUT o INVALID_INPUT cuando faltan datos o son incorrectos.
- Herramienta de escritorio offline para ingenieros: al ejecutarse en CPU y sin red, puede integrarse en portátiles de campo o entornos con conectividad restringida para calcular dimensionado de convertidores y pérdidas.
- Generación de material docente: las salidas incluyen fórmulas en LaTeX y unidades, de modo que se pueden volcar directamente en apuntes, presentaciones o cuadernos Jupyter.
- Verificación cruzada en pipelines de diseño: el motor puede usarse como comprobador independiente de resultados obtenidos por simuladores o por otros cálculos simbólicos, gracias a su verificación por sustitución y comprobación dimensional.
- Aplicaciones de borde y edtech: al ser Python puro con pesos de 4,7 millones de parámetros y sin dependencia de GPU, cabe en dispositivos de bajos recursos para aplicaciones de aprendizaje de STEM.
- Asistente de laboratorio: cálculo rápido de pérdidas en núcleo (Steinmetz), tiempos de dwell en SVPWM o pérdidas de dispositivo durante prácticas de laboratorio, con resultado reproducible entre plataformas.

## Benchmarks y rendimiento

Los datos siguientes proceden del model-index declarado por el autor; no se han verificado de forma independiente.

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Power electronics question answering | Golden answers (482 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy | 1,0 (idéntico en cada plataforma) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar de modelos de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el motor se ejecuta en CPU y no requiere GPU.
- GPU recomendadas: ninguna; el autor declara explícitamente ejecución CPU-only.
- Cabe en cualquier CPU de consumo: los pesos suman 4.715.520 parámetros y el paquete es Python puro con dependencias SymPy y mpmath.
- Opciones de despliegue: instalación vía `pip install power-electronics-ai999x`, rueda desde el repositorio de Hugging Face, aplicación de escritorio y línea de comandos del autor, y ejecución en navegador según la web del proyecto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Ejecución |
|---|---|---|---|---|---|
| power-electronics-ai999x | Motor neuro-simbólico determinista | 4.715.520 | No disponible | Apache-2.0 | CPU, offline |
| Modelos de lenguaje de propósito general (p. ej. familias de 7B-8B) | Transformer generativo | Miles de millones | Decenas de miles de tokens | Variable | GPU recomendada |
| Librerías de cálculo simbólico (SymPy, mpmath) | Simbólico puro | No aplica | No aplica | BSD | CPU |

La comparación con modelos de lenguaje generativos no es directa: power-electronics-ai999x no genera texto libre ni mantiene conversaciones abiertas, sino que resuelve un dominio acotado con verificación. Frente a una librería simbólica genérica, aporta la capa de lectura de enunciados y el catálogo de 79 capacidades certificadas con verificación y rechazo explícito.

## Limitaciones y advertencias

- Solo reconoce formas de pregunta documentadas; ante un enunciado no contemplado devuelve UNRECOGNIZED_FORMAT en lugar de intentar interpretarlo.
- El único idioma soportado es el inglés; no hay soporte declarado de castellano ni de otros idiomas.
- El alcance está limitado a electrónica de potencia y áreas relacionadas (convertidores, rectificadores, inversores, motores, térmica, magnética, resonantes); las consultas fuera de ese dominio devuelven OUT_OF_SCOPE.
- No es un modelo generativo: no mantiene conversaciones abiertas ni responde preguntas generales.
- El resultado de accuracy 1,0 procede de la evaluación del propio autor sobre 482 respuestas doradas y no consta verificación independiente.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio para confirmar los términos exactos.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es todavía inexistente.
- No se dispone de información sobre sesgos, tasas de alucinación en la capa de lectura de lenguaje natural ni sobre el comportamiento ante entradas ambiguas más allá de los estados declarados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/power-electronics-ai999x
- Aplicación de escritorio y línea de comandos: https://www.ai999x.com/desktop-cli/
- Probar en el navegador: https://www.ai999x.com/models/power-electronics-ai999x/#try
- Paquete en PyPI: https://pypi.org/project/power-electronics-ai999x/
- Guías del repositorio: https://huggingface.co/AI999X/power-electronics-ai999x/tree/main/docs
- Evaluación del repositorio: https://huggingface.co/AI999X/power-electronics-ai999x/tree/main/evaluation
- Organización AI999X en Hugging Face: https://huggingface.co/AI999X
- Sitio web del proyecto: https://ai999x.com
- Apoyo al desarrollo: https://buymeacoffee.com/ibnuljaiffarabi
