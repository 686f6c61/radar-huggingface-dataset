# AI999X/mechanics-ai999x

## Resumen

mechanics-ai999x es un paquete de Python (versión 1.0.1, import `mechanics_ai999x`) que resuelve problemas de mecánica clásica en inglés plano y devuelve la respuesta junto con los pasos, las fórmulas en LaTeX, las unidades y las suposiciones empleadas. No es un modelo neuronal con pesos: es un motor neuro-simbólico determinista que combina una capa de lectura de la pregunta basada en reglas con 25 relaciones físicas certificadas implementadas sobre SymPy y mpmath. Lo desarrolla AI999X, con Ibnul Jaif Farabi como creador e ingeniero, y se distribuye con licencia Apache-2.0.

Su propuesta de valor es la fiabilidad antes que la cobertura: cada respuesta se calcula simbólicamente y se verifica (sustitución inversa, análisis dimensional o comparación con un cálculo independiente) antes de devolverse. Cuando no puede verificar el resultado, el sistema no improvisa: emite uno de siete estados explícitos (SOLVED, NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT, INTERNAL_ERROR) y explica qué falta. El autor lo presenta como «cero respuestas incorrectas por diseño», con 234 respuestas doradas reproducidas de forma idéntica en Windows y Linux.

Es relevante ahora por su perfil de despliegue: funciona completamente offline, solo en CPU, sin GPU, sin clave de API y sin red, lo que lo hace apto para entornos educativos con hardware modesto, edge computing y aplicaciones de tutoría donde la latencia de red o el coste por consulta son un problema. Su alcance es deliberadamente acotado: mecánica clásica en inglés, sin generación libre de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor neuro-simbólico determinista: lectura de la pregunta basada en reglas + 25 capacidades simbólicas certificadas sobre SymPy/mpmath |
| Parametros totales | No aplica (no es un modelo neuronal; no hay pesos entrenados) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no hay ventana de contexto; `ask()` interpreta formas de pregunta documentadas) |
| Tipos de cuantizacion | No aplica (no hay pesos que cuantizar) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica; se distribuye como paquete Python (`mechanics_ai999x-1.0.1-py3-none-any.whl`) vía pip/PyPI |
| Versión | 1.0.1 |
| Knowledge pack | 0.1.0 |
| Capacidades certificadas | 25 relaciones físicas |
| Respuestas doradas | 234 respuestas documentadas |
| Dependencias | SymPy, mpmath (Python puro) |
| Runtime | CPU únicamente, offline; sin GPU, sin red, sin clave de API |
| Plataformas probadas | Windows (Python 3.13), Linux x86-64 (Python 3.10, 3.11, 3.12, 3.13, 3.14) |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creación | 2026-10-21 |

## Arquitectura y entrenamiento

No hay entrenamiento en el sentido habitual. La arquitectura es un pipeline determinista: (1) una capa de lectura basada en reglas que interpreta formas de pregunta documentadas en inglés, (2) un selector que mapea la pregunta a una de las 25 capacidades certificadas, (3) un solver simbólico que calcula el resultado exacto con SymPy/mpmath, y (4) un verificador que sustituye el resultado en la ecuación original, comprueba dimensiones o lo compara con un cálculo independiente. La salida incluye pasos, LaTeX, unidades, suposiciones y el identificador de la capacidad empleada. Existe además una interfaz tipada garantizada, `solve(capability_id, **inputs)`, que evita la ambigüedad del lenguaje natural cuando el integrador ya conoce la tarea.

La innovación técnica no está en el aprendizaje automático sino en el diseño de rechazo explícito: siete estados de salida que impiden una respuesta silenciosa incorrecta. La cobertura declarada incluye oscilaciones amortiguadas, forzadas y acopladas; péndulo físico y péndulo doble; órbitas (vis-viva, velocidad de escape, tercera ley de Kepler); momentos de inercia; rodadura; máquinas de Atwood con polea masiva; precesión libre de par; sistemas en rotación (péndulo de Foucault, cuenta en un aro); colisiones elásticas y ecuación del cohete. No se documentan en la información disponible cifras de tokens de entrenamiento, composición de dataset ni etapas de RLHF/DPO, porque no existen tales etapas.

## Capacidades

- Resolución de problemas de mecánica clásica enunciados en inglés plano mediante `ask()`, con detección de la capacidad aplicable.
- Interfaz tipada determinista `solve(capability_id, **inputs)` para integración en código, sin dependencia de la formulación en lenguaje natural.
- Salida explicativa: pasos intermedios, fórmula en LaTeX, unidades del Sistema Internacional y suposiciones declaradas.
- Verificación interna de cada resultado (sustitución inversa, análisis dimensional o cálculo independiente) antes de devolverlo.
- Gestión explícita de la incertidumbre con siete estados (SOLVED, NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT, INTERNAL_ERROR) y mensaje de qué dato falta.
- Cobertura temática: oscilaciones (amortiguadas, forzadas, acopladas), modos normales, péndulo físico y doble, órbitas y velocidad de escape, ley de Kepler, momentos de inercia, dinámica del sólido rígido, rodadura, máquinas de Atwood con polea masiva, precesión sin par, marcos rotatorios, colisiones elásticas y ecuación del cohete.
- Ejecución 100 % offline en CPU, sin red, sin GPU y sin clave de API.
- Reproducibilidad entre plataformas: respuestas idénticas en Windows y en Linux x86-64 para las 234 respuestas documentadas.
- No soporta generación de texto libre, visión, audio, tool calling genérico ni razonamiento multi-paso fuera del pipeline simbólico (no disponible/declarado fuera de alcance).

## Casos de uso

- Corrección automática de deberes de física: un servicio backend recibe el enunciado, llama a `ask()` y compara la respuesta y los pasos con la solución del alumno; los estados NEEDS_INPUT y AMBIGUOUS permiten devolver al estudiante una petición de datos concretos en lugar de una nota errónea.
- Tutoría paso a paso en aplicaciones educativas: la salida incluye LaTeX y suposiciones, de modo que la interfaz puede renderizar el desarrollo completo y no solo el resultado final, algo útil para asignaturas de oscilaciones y dinámica del sólido rígido.
- Entornos con hardware limitado o sin conectividad: al ejecutarse solo en CPU y offline, encaja en aulas con portátiles modestos, Raspberry Pi o laboratorios con red restringida, donde un modelo generativo alojado en la nube no es viable.
- Generación de problemas y soluciones verificadas para bancos de ejercicios: `solve()` con entradas tipadas permite recorrer sistemáticamente combinaciones de parámetros (masas, constantes elásticas, radios orbitales) y producir pares enunciado-solución consistentes.
- Validación cruzada en pipelines de ingeniería: usar el motor como oráculo determinista para comprobar cálculos de velocidad de escape, delta-v de cohete o momentos de inercia generados por otro componente, con la ventaja de que el resultado es reproducible byte a byte.
- Integración en asistentes de documentación técnica: un bot interno puede resolver consultas puntuales de mecánica (por ejemplo, frecuencia angular amortiguada de un sistema masa-muelle) y adjuntar el desarrollo y las unidades sin depender de un proveedor de API externo.
- Pruebas de regresión en software científico: las 234 respuestas doradas sirven como suite de referencia para detectar cambios de comportamiento tras actualizar SymPy o el intérprete de Python.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card (no verificados de forma independiente; el campo `verified` es `false`):

| Tarea | Dataset | Métrica | Valor | Nota |
|---|---|---|---|---|
| Question answering de mecánica clásica | Golden answers (234 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy | 1,0 | «Idéntico en cada plataforma» |

No se han publicado en la información disponible resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros), ni comparaciones con terceros. El dato de accuracy se refiere exclusivamente al conjunto interno de 234 respuestas documentadas, no a un conjunto de evaluación abierto.

## Requisitos de hardware

- Inferencia solo en CPU; no se requiere GPU en ningún escenario.
- VRAM estimada: 0 GB. El repositorio ocupa 0,0 GB y el paquete es Python puro.
- Memoria RAM: no se publican cifras; el consumo vendrá determinado por el intérprete de Python y por SymPy/mpmath durante la manipulación simbólica.
- GPU recomendadas: ninguna. Cualquier CPU x86-64 con Python 3.10-3.14 es suficiente; el autor ha validado Windows (Python 3.13) y Linux x86-64 (Python 3.10 a 3.14).
- Cabe en cualquier equipo de consumo, incluidos portátiles de gama baja y dispositivos edge con Python disponible.
- Opciones de despliegue: `pip install mechanics-ai999x` (PyPI) o instalación directa del wheel desde el repositorio de HuggingFace; integrable como biblioteca en scripts, notebooks, servicios web o aplicaciones de escritorio. No aplica despliegue con vLLM, llama.cpp, Ollama o TGI al no existir pesos de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un cálculo simbólico determinista, la latencia dependerá de la capacidad invocada y de la complejidad de la expresión.

## Comparativa con modelos similares

| Criterio | mechanics-ai999x | SymPy u otro CAS open source | Wolfram\|Alpha / Wolfram Language | LLM generalista (p. ej. familia GPT, Llama, Qwen) |
|---|---|---|---|---|
| Tipo | Motor neuro-simbólico determinista con capa de lectura de inglés | Biblioteca de álgebra simbólica | Motor de conocimiento y CAS propietario | Red neuronal generativa |
| Parámetros | No aplica | No aplica | No disponible | Del orden de miles de millones a cientos de miles de millones según el modelo |
| Contexto | No aplica (pregunta puntual) | No aplica | No aplica (consulta puntual) | Ventana de contexto amplia (varía por modelo) |
| Offline | Sí, sin red ni clave | Sí | No (servicio en la nube), salvo licencia local | Posible en local, con hardware GPU relevante |
| Determinismo | Total, respuestas idénticas entre plataformas | Total | Total en el motor; la interfaz en lenguaje natural no | No determinista por defecto |
| Verificación interna del resultado | Sí, obligatoria antes de responder | No (el usuario valida) | Parcial | No |
| Rechazo explícito ante lo que no puede resolver | Sí, siete estados documentados | No aplica | Parcial | No garantizado |
| Cobertura | 25 capacidades de mecánica clásica, solo en inglés | Muy amplia en matemáticas, sin interpretación de lenguaje natural | Muy amplia en matemáticas y física | Muy amplia y multilingüe, con riesgo de alucinación |
| Licencia | Apache-2.0 | Código abierto (BSD) | Propietaria | Varía según el modelo |

No se dispone de datos públicos de rendimiento comparado entre mechanics-ai999x y estas alternativas; la comparación anterior es funcional, no de precisión medida.

## Limitaciones y advertencias

- Cobertura muy acotada: 25 capacidades de mecánica clásica. Cualquier consulta fuera de ese dominio devuelve OUT_OF_SCOPE; no es un asistente de física general ni de matemáticas generales.
- Solo inglés: la capa de lectura interpreta formas de pregunta documentadas en inglés. Preguntas en castellano u otros idiomas caerán previsiblemente en UNRECOGNIZED_FORMAT; en ese caso debe usarse la interfaz tipada `solve()`.
- No genera texto libre: no redacta explicaciones nuevas, no dialoga y no admite preguntas de seguimiento conversacionales.
- Riesgo de alucinación: el diseño lo minimiza (rechazo ante lo no verificable), pero el autor no aporta una auditoría externa; el 1,0 de accuracy es autodeclarado, con `verified: false`, y se mide sobre 234 preguntas internas del propio autor, no sobre un conjunto independiente.
- Sesgo de selección en la evaluación: las 234 «golden answers» han sido definidas por el mismo equipo que implementa las capacidades, lo que puede favorecer los casos soportados y omitir los límites del dominio.
- Madurez y mantenimiento: versión 1.0.1, 0 descargas y 0 likes en HuggingFace en el momento de la consulta, con un único autor declarado; no hay evidencia pública de adopción, auditoría de terceros ni historial de mantenimiento a largo plazo.
- Dependencia de SymPy y mpmath: cambios en estas bibliotecas o en la versión de Python podrían alterar resultados, aunque el autor declara reproducibilidad entre las versiones 3.10-3.14 y ambos sistemas operativos probados.
- Licencia Apache-2.0: permisiva para uso comercial, pero conviene revisar el archivo LICENSE del repositorio y conservar los avisos de atribución.
- En producción: tratar los estados NEEDS_INPUT, AMBIGUOUS y UNRECOGNIZED_FORMAT como rutas de código de primera clase; si se ignora el estado y solo se lee el valor, se corre el riesgo de propagar un rechazo como si fuera una solución.
- El paquete se marca con `inference: false` en los metadatos de HuggingFace, coherente con el hecho de no haber pesos ni pipeline de inferencia al uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AI999X/mechanics-ai999x
- Paquete en PyPI: https://pypi.org/project/mechanics-ai999x/
- Guía de capacidades (carpeta docs): https://huggingface.co/AI999X/mechanics-ai999x/tree/main/docs
- Evaluación (carpeta evaluation): https://huggingface.co/AI999X/mechanics-ai999x/tree/main/evaluation
- Wheel de instalación directa: https://huggingface.co/AI999X/mechanics-ai999x/resolve/main/dist/mechanics_ai999x-1.0.1-py3-none-any.whl
- Archivo de licencia: https://huggingface.co/AI999X/mechanics-ai999x/blob/main/LICENSE
- Organización AI999X en HuggingFace: https://huggingface.co/AI999X
- Sitio web del proyecto: https://ai999x.com
- Apoyo al desarrollo (Buy Me a Coffee): https://buymeacoffee.com/ibnuljaiffarabi
