# praga2008/neo-coder-v0.2

## Resumen

NEO-CODER v0.2.1 es un modelo de generación de texto de 3.800 millones de parámetros (3.8B) especializado en ingeniería de software autónoma, desarrollado por Pragathiswaran B y Sriram T desde Tamil Nadu (India). Se distribuye bajo licencia MIT y está diseñado para ejecutarse de forma ligera en CPU, con un consumo de memoria de aproximadamente 4.10 GB, lo que permite inferencia local en portátiles estándar sin dependencia de la nube.

El modelo emplea una arquitectura transformer densa (NEODecoderModelV2) con 36 capas, atención de 32 cabezas y 8 cabezas clave-valor con GQA, y una ventana de contexto de 4.096 tokens. Su propuesta diferencial es la combinación de capacidades de generación de código multi-lenguaje, razonamiento multi-archivo, depuración profunda y continuidad multilingüe en inglés, tamil y tanglish, con un mecanismo de "puerta de seguridad" que emite respuestas bloqueadas o de contexto insuficiente en lugar de alucinar completitudes falsas.

Aunque el modelo presenta métricas internas muy altas (99.02% en una evaluación propia de 1.500 tareas), no se han publicado resultados en benchmarks estándar como MMLU o HumanEval, y su adopción es actualmente nula (0 descargas en HuggingFace). Es relevante como propuesta de modelo de código ligero y local, con enfoque en el ecosistema de desarrollo indio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NEODecoderModelV2 (Dense Transformer Decoder) |
| Parametros totales | 3.800.000.000 (3.8B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | Q8_0 / INT8 híbrido |
| Idiomas soportados | inglés, tamil, tanglish |
| Licencia | MIT |
| Formato de pesos | safetensors (inferido por uso de transformers) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura transformer densa de solo decodificador, denominada NEODecoderModelV2. Cuenta con 36 capas, dimensión oculta de 3.072, 32 cabezas de atención y 8 cabezas clave-valor mediante atención agrupada por consultas (GQA), lo que reduce el coste de memoria en comparación con atención multi-cabeza estándar. El vocabulario es de 64.000 tokens, lo que permite cubrir múltiples lenguajes de programación y los idiomas naturales inglés, tamil y tanglish.

No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. La model card menciona una "7-Layer Context Hierarchy" que selecciona dinámicamente archivos relevantes del contexto según símbolos AST, priorizando errores de terminal verificados, archivos fuente activos y suites de pruebas. También declara un mecanismo de verificación de evidencia y un "zero-hallucination gate" que bloquea respuestas cuando la tarea es imposible o el contexto es insuficiente.

## Capacidades

- Generación de código en 24 lenguajes de programación, incluyendo Python, TypeScript, JavaScript, Rust, Go, C++, SQL, HTML/CSS, Dart/Flutter, Java y C#.
- Razonamiento multi-archivo: puede analizar y razonar sobre proyectos con múltiples ficheros, identificando dependencias y símbolos mediante análisis AST.
- Depuración y análisis de causa raíz: prioriza errores de terminal verificados y archivos fuente activos para diagnosticar fallos.
- Generación de suites de pruebas y regresión.
- Creación de proyectos y scaffolding: genera estructuras completas de proyectos web y aplicaciones móviles (Flutter).
- Operaciones de base de datos: generación de consultas SQL y funciones CRUD.
- Soporte de tool calling: no se menciona explícitamente, pero el formato de prompt con `<|im_start|>` sugiere compatibilidad con el estilo ChatML; no hay confirmación de function calling nativo.
- Multilingüe: comprende y razona en inglés, tamil y tanglish, permitiendo conversaciones mixtas de desarrollador (ej. "indha API-la JWT auth add pannu bro").
- Mecanismo de seguridad: emite `BLOCKED` o `INSUFFICIENT CONTEXT` ante tareas imposibles, y aplica "secret scrubbing" para evitar exponer credenciales.

## Casos de uso

- Asistente de codigo local en portatiles: al requerir solo 4.10 GB de RAM y ejecutarse en CPU, puede integrarse en entornos de desarrollo sin GPU, ofreciendo autocompletado y generacion de funciones en Python, TypeScript o Rust.
- Depuracion de proyectos multi-archivo: el modelo puede analizar un repositorio completo, identificar el archivo con el error y proponer correcciones basadas en el contexto de los simbolos y los mensajes de terminal.
- Generacion de pruebas unitarias y de regresion: a partir de una funcion o modulo, genera casos de prueba y suites de regresion, util en pipelines de CI/CD.
- Creacion de scaffolding de proyectos web y moviles: genera la estructura inicial de una aplicacion FastAPI, Express o Flutter, incluyendo configuracion de middleware, autenticacion y manejo de errores.
- Desarrollo de APIs con autenticacion JWT y rate limiting: el modelo puede producir middleware completo para FastAPI o Express, con verificacion de tokens y limitacion de peticiones.
- Asistencia en entornos de desarrollo con hablantes de tamil o tanglish: permite a desarrolladores de la India comunicarse en su lengua materna mezclada con ingles tecnico, manteniendo la precision en el codigo generado.
- Generacion de consultas SQL y operaciones CRUD: para bases de datos SQLite u otras, el modelo puede escribir funciones de insercion, lectura, actualizacion y borrado.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye un "Universal Benchmark Scorecard" con metricas propias del autor sobre 1.500 tareas evaluadas, pero no son comparables con benchmarks externos y no han sido verificadas de forma independiente. Se reproducen a continuacion como referencia:

| Dimension de evaluacion | Puntuacion (v0.2.1) |
|---|---|
| Puntuacion universal global | 99.02% |
| Codigo y sintaxis | 99.2% |
| Depuracion y causa raiz | 98.9% |
| Pruebas y suites de regresion | 99.2% |
| Razonamiento multi-archivo (100 ficheros) | 98.7% |
| Creacion y scaffolding de proyectos | 99.5% |
| Desarrollo web y aplicaciones | 99.1% |
| Base de datos y SQL/CRUD | 99.5% |
| Recuperacion de contexto y presupuesto | 99.2% |
| Especificaciones tecnicas en ingles | 99.6% |
| Intencion en tamil y tanglish | 99.4% |
| Seguridad y eliminacion de secretos | 100.0% |
| Tasa de falsa finalizacion | 0.0% |

Estas cifras deben interpretarse con cautela: no hay evidencia externa que las respalde y el modelo no ha sido evaluado en benchmarks reconocidos.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo esta cuantizado a Q8_0/INT8 y ocupa 4.10 GB de RAM en memoria activa.
- GPU recomendadas: no aplica; el modelo esta disenado para CPU.
- Compatibilidad con GPU de consumo: no se indica, pero al ser un modelo de 3.8B cuantizado, podria ejecutarse en GPUs con 6-8 GB de VRAM (ej. RTX 3060, RTX 4060) si se desea aceleracion, aunque no hay datos oficiales.
- Opciones de despliegue: compatible con la libreria transformers de HuggingFace; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Rendimiento declarado: 42.5 tokens/segundo con latencia de primer token inferior a 15 ms en un Intel Core i3 con 16 GB de RAM (dato del autor, no verificado).

## Comparativa con modelos similares

No se dispone de datos comparativos publicados entre NEO-CODER v0.2.1 y otros modelos de su categoria. Por tamano y enfoque, podria compararse con modelos como Qwen2.5-Coder-3B, StarCoder2-3B o DeepSeek-Coder-1.3B, pero no hay informacion sobre rendimiento relativo, contexto o licencias en la documentacion proporcionada. Se indica "no disponible" para esta seccion.

## Limitaciones y advertencias

- Ventana de contexto limitada a 4.096 tokens, insuficiente para proyectos grandes o conversaciones muy largas.
- No hay resultados en benchmarks estandar (MMLU, HumanEval, etc.), por lo que su rendimiento real frente a otros modelos es desconocido.
- Las metricas de la model card son propias del autor y no han sido validadas externamente; deben tomarse con escepticismo.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica una adopcion nula y ausencia de comunidad que lo pruebe.
- No se especifica el conjunto de datos de entrenamiento ni el proceso de alineacion, lo que impide evaluar sesgos potenciales.
- El soporte de tool calling o function calling no esta confirmado; el formato de prompt sugiere ChatML pero no hay evidencia de integracion con herramientas.
- La licencia MIT permite uso comercial, pero al no haber documentacion sobre el origen de los datos de entrenamiento, podrian existir riesgos legales no declarados.
- El modelo esta orientado principalmente al ecosistema de desarrollo indio (tamil, tanglish); su rendimiento en otros idiomas o contextos culturales puede ser inferior.
- No se menciona soporte para vision, audio u otras modalidades; es exclusivamente texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/praga2008/neo-coder-v0.2
- No se han encontrado otros enlaces (papers, repositorios, demos) en la informacion proporcionada.
