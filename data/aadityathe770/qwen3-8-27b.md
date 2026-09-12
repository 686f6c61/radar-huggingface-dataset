# aadityathe770/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión publicado en HuggingFace por el usuario aadityathe770. Según su model card, se trata de un modelo denso de 27.781 millones de parámetros (55,6 GB en safetensors, es decir, pesos en bf16), construido sobre la base arquitectónica de Qwen3.5 y presentado como la generación más capaz de la familia abierta Qwen hasta la fecha. Está diseñado para tareas de código, trabajo profesional, investigación y flujos agénticos de horizonte largo, con comprensión nativa de imagen y vídeo y control flexible del modo de razonamiento.

El aspecto más relevante técnicamente es su arquitectura híbrida: combina 48 capas de atención lineal Gated DeltaNet con 16 capas de atención con compuertas (Gated Attention), distribuidas en 64 capas totales según el patrón 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)). Esta mezcla reduce el coste del caché KV en contextos largos, ya que solo las 16 capas de atención con compuertas mantienen caché clásico. El contexto nativo es de 262.144 tokens, extensible hasta 1.000.000, y el modelo se entrenó con predicción multi-token (MTP), lo que habilita decodificación especulativa en inferencia.

Es importante señalar que este repositorio concreto es una publicación de terceros con 0 descargas y 0 likes, y que su model card reproduce los textos y enlaces de la comunicación oficial de Qwen (incluida la mención a Qwen Cloud como servicio gestionado). La información disponible no permite confirmar que se trate de una subida oficial ni validar los resultados de benchmarks, cuya tabla aparece truncada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión: 64 capas, layout 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible: el repositorio solo contiene pesos en safetensors; no se publican variantes GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (Hugging Face Transformers) |

Datos arquitectónicos adicionales declarados en la model card:

| Componente | Valor |
|---|---|
| Dimensión oculta | 5.120 |
| Token embedding | 248.320 (con padding) |
| Capas totales | 64 |
| Gated DeltaNet (atención lineal) | 48 cabezas para V, 16 para QK; dimensión de cabeza 128 |
| Gated Attention | 24 cabezas para Q, 4 para KV; dimensión de cabeza 256; dimensión RoPE 64 |
| FFN (intermedia) | 17.408 |
| Salida LM | 248.320 (con padding) |
| MTP | Entrenado con múltiples pasos |
| Pipeline | image-text-to-text |
| Tamaño del repositorio | 55,6 GB |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con codificador de visión acoplado (no se especifica en la información disponible si el vision encoder es entrenado desde cero o inicializado a partir de otro modelo). La innovación estructural principal es la alternancia entre capas de atención lineal del tipo Gated DeltaNet y capas de atención con compuertas estándar en proporción 3:1, lo que reduce el coste de memoria y cómputo del caché KV en secuencias muy largas: de las 64 capas, solo 16 mantienen pares clave-valor explícitos (4 cabezas KV de 256 dimensiones cada una). Las 48 capas restantes operan con estado recurrente de tamaño constante. El modelo incorpora además predicción multi-token (MTP) entrenada con varios pasos, un mecanismo que en inferencia puede explotarse para decodificación especulativa y aumento del throughput.

En cuanto al entrenamiento, la model card indica únicamente que se realizó preentrenamiento y postentrenamiento, sin detallar el número de tokens, la composición del dataset ni si se emplearon técnicas específicas de alineación como RLHF o DPO. Se menciona que el modo de razonamiento (thinking) está activado por defecto y puede desactivarse por petición, que la profundidad de razonamiento se ajusta mediante el parámetro `reasoning_effort` y que el contexto de razonamiento de mensajes históricos se conserva mediante `preserve_thinking`. No hay información disponible sobre la composición lingüística del corpus ni sobre el proceso de entrenamiento multimodal.

## Capacidades

- Generación de texto conversacional y multi-turno con contexto de hasta 262.144 tokens nativos (1.000.000 en configuración extendida).
- Razonamiento explícito con modo thinking activado por defecto, desactivable por petición y con profundidad ajustable mediante `reasoning_effort`.
- Retención de contexto de razonamiento entre turnos mediante `preserve_thinking`.
- Comprensión de imagen: diagramas STEM, documentos y capturas, según la model card.
- Comprensión de vídeo, incluidos vídeos de hasta una hora de duración según la documentación del autor.
- Generación y asistencia en código, con mejoras declaradas en tareas de coding agéntico (la tabla de benchmarks menciona Terminal Bench 2.1 en la variante Terminus).
- Ejecución agéntica: planificación autónoma, manejo de feedback del entorno y tareas de múltiples pasos orientadas a completar el objetivo final.
- Compatibilidad declarada con harnesses y herramientas de desarrollo habituales del ecosistema Qwen.
- Inferencia compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed.
- Soporte de tool calling / function calling: no se detalla explícitamente en la información disponible, aunque la orientación agéntica y la compatibilidad con endpoints y harnesses lo hacen plausible; no confirmado.

## Casos de uso

- Asistencia de código en producción: dado su enfoque en coding agéntico y su contexto nativo de 262.144 tokens, puede mantener el estado de repositorios grandes y encadenar ediciones, ejecuciones de tests y correcciones dentro de una misma sesión, integrándose en pipelines de CI/CD mediante sus herramientas compatibles.
- Agentes autónomos de tareas largas: el modelo está entrenado para manejar feedback del entorno y completar tareas de horizonte largo, por lo que encaja en bucles de tipo planificar-ejecutar-observar sobre APIs o terminales.
- Análisis de documentación técnica extensa: con 262k tokens de contexto puede procesar manuales, normativas o informes completos sin fragmentación agresiva, siempre que el presupuesto de memoria del caché KV lo permita.
- Interpretación de diagramas y documentación visual: al ser un modelo nativo de imagen-texto, puede extraer información de diagramas STEM, planos, tablas escaneadas y capturas de pantalla para tareas de ingeniería o soporte.
- Análisis de vídeo de larga duración: la model card declara soporte para vídeos de hasta una hora, útil en revisión de grabaciones, análisis de incidencias o extracción de resúmenes estructurados.
- Investigación y revisión bibliográfica: combinación de contexto largo y modo de razonamiento ajustable para sintetizar múltiples fuentes y razonar sobre ellas antes de responder.
- Atención al cliente técnica multi-turno: la retención de contexto de razonamiento entre turnos permite conversaciones largas donde el modelo recuerda el hilo de diagnóstico previo sin repetir el razonamiento.
- Despliegue self-hosted con requisitos de soberanía de datos: al publicarse bajo Apache 2.0 y con pesos abiertos, permite ejecución en infraestructura propia con vLLM o SGLang.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativa, pero en la información disponible aparece truncada: solo se conservan los encabezados y la primera fila parcial. Los modelos de comparación citados son Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, y la primera categoría listada es "Coding", con la métrica "Agentic terminal coding – Terminal Bench 2.1 (Terminus)". No se ha conservado ningún valor numérico.

| Benchmark | Categoria | Valor publicado |
|---|---|---|
| Terminal Bench 2.1 (Terminus) | Coding agéntico en terminal | No disponible (tabla truncada) |
| Resto de benchmarks de la tabla | No disponible | No disponible (tabla truncada) |

No se han podido verificar resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar en la información disponible. No se inventan cifras.

## Requisitos de hardware

Las estimaciones siguientes se derivan del recuento de parámetros (27,78 B) y del tamaño del repositorio (55,6 GB, coherente con bf16), no de mediciones publicadas por el autor.

- VRAM para pesos en bf16: aproximadamente 56 GB solo para pesos; con caché KV y activaciones se recomienda un acelerador de 80 GB (H100 80 GB, A100 80 GB, H200).
- VRAM en FP8: aproximadamente 28 GB de pesos; viable en A100 40 GB, L40S 48 GB o RTX 6000 Ada 48 GB.
- VRAM en cuantización de 4 bits (si se generan variantes GPTQ/AWQ/GGUF por cuenta propia): aproximadamente 15-17 GB, lo que permitiría ejecución en RTX 4090 24 GB o RTX 5090 32 GB. El repositorio no incluye estas cuantizaciones.
- Caché KV a contexto completo: solo las 16 capas de Gated Attention acumulan caché (16 capas × 2 × 4 cabezas × 256 dimensiones × 2 bytes ≈ 64 KiB por token en bf16), lo que supone del orden de 16 GiB adicionales a 262.144 tokens y cerca de 64 GiB a 1.000.000 de tokens. Las 48 capas de Gated DeltaNet usan estado recurrente de tamaño fijo y no escalan con la longitud.
- GPU consumer: no cabe en bf16 ni en FP8 en GPU de consumo; sí sería viable en 4 bits con 24 GB o más de VRAM, siempre que el usuario genere la cuantización.
- Opciones de despliegue declaradas: Hugging Face Transformers, vLLM, SGLang y TokenSpeed. No se confirma soporte de llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. La MTP con múltiples pasos permite plantear decodificación especulativa, pero no hay cifras publicadas en la información proporcionada.
- Servicio gestionado: la model card menciona Qwen Cloud como API oficial, con una versión alojada de Qwen3.8-27B que ofrecería 1M de contexto por defecto y herramientas integradas, anunciada como "coming soon".

## Comparativa con modelos similares

La única comparativa disponible es la de la propia model card, cuyos valores numéricos no se han conservado. Se listan por tanto los modelos citados con los datos que sí se conocen.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|---|
| Qwen3.8-27B (este repositorio) | 27,78 B (denso) | 262.144 nativo / 1.000.000 extensible | Apache 2.0 | Pesos abiertos en safetensors; 0 descargas y 0 likes en este repositorio | No disponible |
| Qwen3.6-27B | 27 B (declarado en la tabla) | No disponible | No disponible | No disponible | No disponible |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | No disponible |
| Muse Glimmer-30B | 30 B (por el nombre) | No disponible | No disponible | No disponible | No disponible |
| Opus4.6 Max | No disponible | No disponible | Propietario, presumiblemente | No disponible | No disponible |

No se dispone de datos verificables de parámetros, contexto, licencia ni rendimiento para los modelos de comparación más allá de lo indicado. Cualquier afirmación adicional sobre alternativas equivalentes sería especulativa y no se incluye.

## Limitaciones y advertencias

- Procedencia no confirmada: el repositorio pertenece a un usuario individual (aadityathe770) con 0 descargas y 0 likes, y el tag de arquitectura declarado es `qwen3_5`, no `qwen3_8`. No hay confirmación en la información disponible de que sea una publicación oficial de Qwen. Conviene verificar pesos y procedencia antes de usarlo en producción.
- Fecha de creación anómala: el repositorio figura creado el 2026-09-11, una fecha futura respecto a los datos de referencia habituales, lo que refuerza la necesidad de verificación.
- Tabla de benchmarks truncada: no se han podido validar las afirmaciones de rendimiento de la model card; no hay cifras de MMLU, HumanEval, GSM8K ni de ninguna otra métrica estándar en la información disponible.
- Idiomas no declarados: no hay información sobre cobertura multilingüe ni sobre calidad relativa por idioma, lo que es un riesgo directo para despliegues en castellano.
- Alucinación: no hay datos publicados de tasas de alucinación ni de evaluación de fidelidad; en tareas de contexto muy largo el riesgo de degradación es mayor y debería validarse con evals propias.
- Sesgos: no se documenta ningún análisis de sesgos, composición del dataset ni proceso de alineación (RLHF, DPO u otros), por lo que no es posible evaluar sesgos conocidos.
- Contexto extendido a 1M: la extensión más allá de 262.144 tokens no está garantizada por configuración por defecto en los pesos abiertos; la model card la menciona como capacidad del servicio alojado, no necesariamente del checkpoint.
- Caché KV: aunque la arquitectura híbrida reduce mucho el coste, a 262k tokens el caché de las capas de atención con compuertas puede superar los 16 GiB en bf16, lo que obliga a planificar el hardware con margen.
- Cuantizaciones: no se publican variantes GGUF, GPTQ ni AWQ en el repositorio; quien quiera desplegar en GPU de consumo debe generarlas y validarlas por su cuenta.
- Licencia: Apache 2.0 permite uso comercial, pero al tratarse de una subida de terceros la cadena de titularidad de los pesos no está verificada; conviene revisar los términos del modelo original de Qwen antes de explotarlo comercialmente.
- Tool calling y function calling: la información disponible no detalla el formato ni la fiabilidad del soporte de llamadas a herramientas, pese a la orientación agéntica declarada.
- Búsqueda web sin resultados útiles: las consultas realizadas devolvieron únicamente páginas de un servicio de reparto de comida (Interfood), sin relación con el modelo. No hay fuentes externas que corroboren la información de la model card.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/aadityathe770/Qwen3.8-27B
- Qwen Cloud (servicio gestionado citado en la model card): https://www.qwencloud.com
- Overview de Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
- Paper, blog técnico o repositorio de código del modelo: no disponible en la información proporcionada.
- Demo o espacio de inferencia: no disponible.
- Fuentes externas de verificación: la búsqueda web no devolvió resultados relevantes sobre este modelo.
