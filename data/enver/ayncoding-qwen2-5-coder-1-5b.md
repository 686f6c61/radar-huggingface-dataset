# enver/ayncoding-qwen2.5-coder-1.5b

## Resumen

AynCoding es un modelo generativo de texto especializado en la síntesis de código y el refactoring arquitectónico, desarrollado por enver a partir del modelo Qwen2.5-Coder-1.5B. Su principal innovación es la inclusión de un bloque de razonamiento epistémico denominado `<ayn_mantiq>`, que se genera antes del código y se basa en los principios de la lógica árabe clásica (Manṭiq) y en la morfología de raíces triconsonánticas (Ishtiqāq). Con 1.543.714.304 parámetros, está disponible en formato GGUF y safetensors bajo licencia Apache 2.0.

El modelo se presenta como una alternativa para entornos donde se necesita código robusto, con verificaciones sobre dependencias circulares, recursión no acotada, estados contradictorios y nombres de variables ambiguos. Está alineado con siete autoridades clásicas de la lógica y la gramática árabes, como al-Ghazali, al-Razi y Sibawayh, lo que le confiere un enfoque único y culturalmente específico.

A pesar de su tamaño contenido, el autor afirma que alcanza un 94,2% de media en un benchmark propio llamado «5-Pillar Static Epistemic Auditor», frente al 96,7% de un modelo de frontera en la nube. Sin embargo, no se han publicado evaluaciones estándar ni validación externa, por lo que los resultados deben interpretarse con cautela.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-Coder-1.5B) |
| Parámetros totales | 1.543.714.304 |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (formato GGUF, cuantizacion no especificada) |
| Idiomas soportados | Inglés (en) y árabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-Coder-1.5B, un transformer decoder-only con 1.543.714.304 parámetros, originalmente entrenado para generación de código. El autor ha realizado un ajuste fino con un enfoque epistémico: en lugar de limitarse a datos de repositorios GitHub sin filtrar, el modelo incorpora reglas formales de la lógica aristotélica transmitidas por la tradición árabe. No se ha publicado el tamaño del dataset ni el número de tokens utilizados en el entrenamiento, ni se menciona si se aplicaron técnicas como RLHF o DPO.

El elemento técnico más destacado es el bloque de razonamiento `<ayn_mantiq>`, que el modelo debe emitir antes de generar código. Este bloque contiene cinco categorías: raíz y morfología, definición esencial, invariantes de falacias epistémicas, teleología lexicográfica y gobernanza sintáctica. El objetivo es forzar un análisis formal del problema antes de la síntesis de código, reduciendo errores de diseño.

## Capacidades

- Generación de código en Python y otros lenguajes, con énfasis en aserciones de seguridad y manejo explícito de estados.
- Razonamiento en cadena de pensamiento (CoT) mediante el bloque `<ayn_mantiq>`, lo que permite auditar las decisiones de diseño antes de generar código.
- Aplicación de reglas lógicas: elimina dependencias circulares, recurrencias no acotadas, contradicciones en máquinas de estado y excepciones silenciadas.
- Modelado de ciclo de vida completo, generando código que cubre todos los estados posibles, desde `INITIALIZING` hasta `FAILED`.
- Nomenclatura semántica: evita identificadores genéricos (`data`, `temp`, `val`, `mgr`, `helper`) y propone nombres basados en raíces árabes con significado orientado al propósito.
- Código multilingüe: puede generar comentarios y salidas en inglés o árabe, aunque la generación principal es código.
- Ejecución eficiente en CPU, según la documentación del autor.
- No se documenta soporte de tool calling ni integración con agentes externos; el razonamiento es autónomo y estático.

## Casos de uso

- Implementación de estructuras concurrentes: el modelo es adecuado para escribir primitivas de sincronización como ring buffers o token buckets, aplicando invariantes de no circularidad y exclusión mutua. Se puede integrar en sistemas embebidos mediante un despliegue local con Ollama.
- Refactorización de arquitecturas heredadas: ayuda a detectar y eliminar importaciones circulares en proyectos Python, aplicando el principio dafʿ al-dawr. El desarrollador puede usar el bloque de razonamiento para justificar los cambios.
- Verificación de máquinas de estado finito: adecuado para sistemas críticos donde los estados deben ser mutuamente excluyentes. El modelo genera FSMs con transiciones completas y ningún estado sin salida.
- Revisión de nomenclatura y contratos: útil para identificar variables vagas en bases de código grandes y proponer nombres orientados al propósito, siguiendo la morfología de raíces triconsonánticas.
- Documentación técnica bilingüe: genera documentación de APIs con explicaciones en árabe e inglés, lo que resulta útil para equipos de desarrollo en países de habla árabe.
- Enseñanza de fundamentos computacionales: sirve como material didáctico en cursos que integran filosofía clásica y programación, mostrando cómo principios lógicos antiguos se traducen a invariantes de código.
- Asistente de código en CPU sin GPU: por su bajo coste computacional, puede ejecutarse en servidores domésticos o en estaciones de trabajo de doble socket, lo que permite un asistente de IA local sin dependencias de la nube.
- Generación de pruebas unitarias: el modelo puede producir casos de prueba basados en el análisis de estados y las definiciones esenciales, mejorando la cobertura de situaciones límite.

## Benchmarks y rendimiento

| Desafío | Dominio clásico | AynCoding 1.5B (CPU local) | Modelo frontier cloud |
|---|---|---|---|
| Monotonic Ring Buffer | Concurrencia y orden (ر-ت-ب / ح-ف-ظ) | 89,6% (B+, 17,5 s) | 98,0% (A+) |
| Epistemic Circuit Breaker | FSM y seguridad (ح-ك-م / س-ل-م) | 100,0% (A+, 16,9 s) | 98,0% (A+) |
| Atomic WAL con CRC32 | Persistencia y contratos (ح-ف-ظ / ع-ق-د) | 93,0% (A, 17,5 s) | 94,0% (A) |
| Media macro epistémica | Puntuación compuesta | 94,2% (A) | 96,7% (A+) |

Estos resultados proceden de un evaluador interno propio denominado «5-Pillar Static Epistemic Auditor», aplicado a tres desafíos concretos. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K. La tabla compara el modelo local con un modelo comercial de frontera según las mediciones del autor; no hay datos independientes que confirmen estas cifras.

## Requisitos de hardware

- VRAM estimada: no disponible en la documentación. El repo pesa 1,0 GB y el modelo es de 1.5B, por lo que la huella de memoria es baja, pero no se especifica un valor exacto.
- GPU recomendadas: no disponibles. El autor describe la ejecución en CPU pura con un sistema de doble socket Xeon y 16 hilos.
- Compatibilidad con GPU de consumo: no especificada. Con 1.5B parámetros, es previsible que quepa en una GPU de consumo con al menos 2-3 GB de VRAM, pero no hay confirmación del autor.
- Opciones de despliegue: Ollama (con Modelfile incluido), llama-cpp-python y Transformers/Python.
- Latencia y throughput: en el benchmark interno, los tiempos de generación por desafío fueron 17,5 s, 16,9 s y 17,5 s ejecutando en CPU con 16 hilos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AynCoding 1.5B | 1.543.714.304 | No disponible | Apache 2.0 | HuggingFace (GGUF/safetensors) |
| Qwen2.5-Coder-1.5B | 1.543.714.304 | No disponible | Apache 2.0 | HuggingFace (base) |
| Qwen2.5-Coder-1.5B-Instruct | 1.543.714.304 | No disponible | Apache 2.0 | HuggingFace (instruct) |

Los tres modelos comparten arquitectura y tamaño. AynCoding se diferencia por el ajuste fino con lógica clásica y por la inclusión del bloque `<ayn_mantiq>`, mientras que los modelos base e instruct son versiones generalistas y ampliamente utilizadas para código. No se han encontrado datos de contexto en la información disponible.

## Limitaciones y advertencias

- Modelo experimental con 0 descargas y 0 likes en HuggingFace en el momento de la consulta, lo que indica falta de adopción y validación externa.
- Los benchmarks presentados son propios del autor y no estándar; no hay evidencia independiente de rendimiento.
- El razonamiento basado en lógica clásica árabe puede producir salidas inadecuadas en contextos técnicos no relacionados.
- El idioma está limitado a inglés y árabe; el rendimiento en otros idiomas no está documentado.
- Riesgo de alucinación en la atribución de principios a los autores clásicos citados, ya que no se aportan citas textuales.
- La licencia Apache 2.0 permite uso comercial, pero al ser un ajuste fino no se ha sometido a auditorías de seguridad ni de sesgos.
- El bloque `<ayn_mantiq>` añade tokens de salida, lo que aumenta la latencia en aplicaciones de tiempo real.
- No se especifica el tamaño máximo de contexto, lo que limita el uso en tareas con ventanas largas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/enver/ayncoding-qwen2.5-coder-1.5b)
- [Modelo base Qwen2.5-Coder-1.5B](https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B)
- [Versión instruct Qwen2.5-Coder-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct)

No se han encontrado papers, blogs ni repositorios adicionales en la búsqueda realizada.
