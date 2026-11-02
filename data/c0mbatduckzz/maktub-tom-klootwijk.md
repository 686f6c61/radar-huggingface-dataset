# c0mbatduckzz/Maktub-Tom-Klootwijk

## Resumen

Maktub es un modelo simbólico determinista publicado por el usuario c0mbatduckzz en HuggingFace, atribuido en su model card a Tom Klootwijk como autor del paradigma. No es una red neuronal: se distribuye como código Python personalizado (un kernel de referencia) que implementa una máquina de estados con reescritura de reglas, donde cada transición produce un estado sucesor y una nueva descripción del operador que gobernará la transición siguiente. El repositorio ocupa 0.0 GB y contiene el kernel, configuración, ejemplos ejecutables, tests y material de procedencia.

El núcleo operativo es un par de ecuaciones acopladas: el estado se actualiza mediante `Act(x_n, d_n, e_n)` y la descripción de la regla mediante `Rewrite(x_n, d_n, e_n)`, leyendo ambas la misma configuración pre-transición. El perfil por defecto, denominado "one-bit mirror", reduce el sistema a `x_n = d_n = b_n ∈ {0,1}` con ambas salidas iguales a `1 - b_n`. Un perfil opcional de "frontera adaptativa" amplía el estado a un diccionario con umbral y tasa de aprendizaje, aplicando `τ' = τ + λ(e - τ)`.

Su relevancia es acotada y de naturaleza distinta a la de un LLM: sirve como material didáctico y de investigación sobre contabilidad universal de estado, procedencia verificable y sistemas que modifican sus propias reglas. No dispone de pesos entrenados, tokenizador, pipeline de inferencia ni benchmarks publicados. La licencia es explícitamente propietaria y sin concesión de derechos, lo que limita severamente cualquier uso externo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Máquina de estados simbólica con reescritura de reglas (kernel Python, no red neuronal) |
| Parámetros totales | no disponible (modelo simbólico, sin pesos entrenados) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantización | no disponible (no aplica) |
| Idiomas soportados | inglés (en) y neerlandés (nl) según metadatos; la documentación está en inglés |
| Licencia | propietaria, todos los derechos reservados, sin licencia concedida (proprietary, all-rights-reserved, no-license-granted) |
| Formato de pesos | no disponible (código Python y ficheros de configuración; sin safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un kernel determinista escrito en Python que implementa una transición de estado doble. En cada paso, el sistema calcula simultáneamente el estado sucesor y la descripción del siguiente operador a partir del estado actual, la descripción actual y un evento opcional. La "auto-reescritura" consiste en actualizar la descripción representada del operador, no en modificar pesos de una red. El perfil `one-bit_mirror` implementa la reducción formal exacta a un bit; el perfil `adaptive_boundary` instancia la misma arquitectura con dinámica adaptativa explícita sobre un umbral y una tasa de aprendizaje.

El kernel expone además un modelo de forma log-polar con campos JSF/JDS: calcula radio espacial, cantidad logarítmica, ángulo y peso de mezcla de forma separada, con `ρ = ln(r/r_ref)`, `θ = atan2(y, x)` y `α(n) = clip((9 - log10 n)/4, 0, 1)`. Los dos campos se combinan como `F_mix = (1 - α)F_JSF + αF_JDS`. También incluye operaciones de Hadamard. No hay datos de entrenamiento, número de tokens, composición de dataset ni etapas de RLHF o DPO, porque no existe entrenamiento: las reglas están definidas analíticamente y verificadas con tests reproducibles. La procedencia se documenta con seis PDFs originales, un manifiesto SHA-256 y un mapeo explícito de fuente a código.

## Capacidades

- Ejecución determinista de transiciones de estado con traza inspeccionable paso a paso.
- Reescritura explícita de la descripción del operador en cada transición (auto-reescritura simbólica).
- Perfil `one-bit_mirror` con reducción formal exacta a un bit y salida complementaria.
- Perfil `adaptive_boundary` con umbral adaptativo y tasa de aprendizaje configurables.
- Transformaciones log-polares: conversión de coordenadas cartesianas a radio logarítmico y ángulo.
- Cálculo de campos analíticos JSF/JDS, peso de mezcla y localización de puntos (dentro/fuera de contorno).
- Operaciones de Hadamard sobre los campos representados.
- Registro de procedencia a nivel de página mediante manifiesto SHA-256.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio y modo thinking: no disponible (fuera del alcance del modelo).
- Capacidades multilingües: limitadas a la documentación en inglés y neerlandés; no hay generación de lenguaje natural.

## Casos de uso

- Docencia sobre máquinas de estados y auto-modificación: el kernel permite mostrar en clase, con código ejecutable, cómo un sistema puede reescribir la regla que lo gobierna y registrar la traza completa de cada transición.
- Investigación en procedencia y reproducibilidad: el manifiesto SHA-256 y el mapeo fuente-código permiten auditar qué ecuaciones del paradigma original se han implementado y cuáles son decisiones nuevas de esta release.
- Prototipos de sistemas de control con umbral adaptativo: el perfil `adaptive_boundary` sirve para experimentar con políticas de admisión que ajustan su umbral tras cada evento, con trazabilidad completa.
- Verificación de contratos de entrada: los tests incluidos validan tipos y comportamiento de transición, útiles como plantilla para pipelines que exigen determinismo estricto.
- Cálculo geométrico log-polar en demostraciones: conversión de coordenadas y evaluación de campos analíticos para visualizar contornos y localización de puntos en ejemplos educativos.
- Estudio comparativo de paradigmas simbólicos frente a modelos neuronales: sirve como referencia mínima y determinista para contrastar con aproximaciones estadísticas en experimentos académicos.
- Generación de material didáctico reproducible: los ejemplos del README (traza `[1, 0, 1]`, campo mixto `0.06` fuera del contorno) se pueden replicar sin GPU ni dependencias pesadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no es una red neuronal y no dispone de métricas tipo MMLU, HumanEval o GSM8K; la verificación se limita a tests reproducibles de álgebra implementada, contratos de entrada y comportamiento de transición.

## Requisitos de hardware

- VRAM estimada: no aplica; el kernel es código Python simbólico sin pesos que cargar en memoria de GPU.
- GPU recomendadas: ninguna; la ejecución es en CPU.
- Cabe en cualquier equipo capaz de ejecutar Python, incluidos portátiles de gama baja y entornos CI.
- Opciones de despliegue: ejecución directa del paquete `maktub_kernel` tras clonar el repositorio; no hay integración con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles como métricas de inferencia; al ser operaciones aritméticas deterministas, el coste por transición es despreciable frente a cualquier modelo neuronal.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Maktub (c0mbatduckzz) | Máquina de estados simbólica en Python | no disponible (sin pesos) | no aplica | Propietaria, sin concesión | HuggingFace, 27 descargas |
| Alternativas neuronales de tamaño pequeño (p. ej. modelos de menos de 1B parámetros) | Transformer | Cientos de millones | Miles de tokens | Variable (a menudo permisiva) | HuggingFace |
| Frameworks de máquinas de estados (p. ej. librerías de autómatas en Python) | Simbólico | no aplica | no aplica | Habitualmente open source | PyPI, GitHub |

No se dispone de información sobre modelos simbólicos comparables directos con auto-reescritura de reglas y procedencia SHA-256 en la información proporcionada; la comparación con LLM resulta de categorías distintas y no es equivalente en parámetros, contexto ni rendimiento.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona sobre lenguaje natural ni responde a prompts.
- Licencia propietaria con todos los derechos reservados y sin concesión alguna: no se permite uso, copia, modificación, distribución, sublicencia, comercialización, entrenamiento de modelos ni creación de datasets con los materiales originales del autor.
- El propio aviso indica que la publicación, el acceso público, la descarga o la posesión no otorgan permiso ni derecho alguno.
- La autoría del paradigma se atribuye en la model card a una persona física con datos identificativos (nombre, número de identificación y fecha de nacimiento); conviene tratar esa información con cautela.
- El repositorio ocupa 0.0 GB y tiene 27 descargas y 0 likes: tracción mínima y ausencia de validación por parte de la comunidad.
- No hay benchmarks, evaluación independiente ni revisión por pares de las afirmaciones del paradigma.
- El perfil `adaptive_boundary` se describe explícitamente como una elección de demostración nueva de esta release, no como parte del paradigma original; no debe confundirse con una validación empírica.
- Riesgo de alucinación: no aplica en el sentido habitual, pero las afirmaciones conceptuales de la model card sobre correspondencias de dominio no están verificadas de forma independiente.
- Uso comercial: bloqueado por los términos de la licencia; cualquier explotación requeriría autorización expresa del propietario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/c0mbatduckzz/Maktub-Tom-Klootwijk
- Repositorio clonable: https://huggingface.co/c0mbatduckzz/Maktub-Tom-Klootwijk (git clone)
- Aviso de propiedad y reserva de derechos: `PROPRIETARY_NOTICE.txt` en el repositorio
- Contexto conceptual: `docs/context.md` en el repositorio
- Linaje y atribución de fuentes: `docs/provenance.md` en el repositorio
- Manifiesto SHA-256 de fuentes: `provenance.json` en el repositorio
- Paper, blog, demo o repositorio externo: no disponible en la información proporcionada
