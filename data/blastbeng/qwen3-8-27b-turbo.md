# blastbeng/Qwen3.8-27B-TURBO

## Resumen

El modelo Qwen3.8-27B-TURBO es un fine tune de 26.9 mil millones de parámetros desarrollado por blastbeng, construido sobre el modelo base de DavidAU `Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`. Se trata de un modelo denso de visión-lenguaje que hereda la arquitectura del Qwen3.8-27B original de Qwen, un modelo nativo que entiende imágenes y videos, con control flexible de pensamiento y capacidad para completar tareas complejas de múltiples pasos.

La principal innovación de esta variante es la reducción drástica de los tokens de pensamiento (entre un 50 % y un 90 % en comparación con el modelo base) manteniendo la calidad de salida y el detalle. El proceso de entrenamiento combina técnicas de Cold Fusion (GAIN + Unsloth) y Fable Fusion 711, creadas por el equipo de DavidAU, e incluye un ajuste multi-etapa y multi-merge. El modelo está etiquetado como "uncensored" y "abliterated", lo que indica que se ha eliminado la alineación de seguridad original.

La relevancia actual del modelo radica en que ofrece un rendimiento superior al base en benchmarks de razonamiento (ARC-C y ARC-E), con un coste computacional menor en la generación de pensamientos, y está disponible en cuantizaciones GGUF para hardware de consumo. El repositorio incluye tanto cuantizaciones regulares como MTP (Multi-Token Prediction) con imatrix, lo que facilita su despliegue en entornos locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de visión-lenguaje |
| Parametros totales | 26.895.998.464 (26.9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF regular y MTP con imatrix, incluyendo Q4_K_S y cuantizaciones de 4 y 8 bits |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bfloat16) y GGUF |

## Arquitectura y entrenamiento

El modelo es un fine tune del Qwen3.8-27B, que a su vez es un modelo denso de visión-lenguaje con capacidad para procesar imágenes y videos, además de texto. La arquitectura base es un transformer estándar sin componentes de mezcla de expertos (MoE), lo que simplifica su despliegue en hardware de consumo.

El entrenamiento se realizó en varias etapas, combinando las técnicas Cold Fusion (GAIN + Unsloth) y Fable Fusion 711. El método GAIN, desarrollado por el equipo de DavidAU, ajusta dinámicamente el entrenamiento por muestra en tiempo real mientras el modelo aprende, con el objetivo de mejorar las métricas y el rendimiento general sin dañar el modelo. El proceso incluye un merge multi-estado y un ajuste multi-etapa. Se utilizaron los datasets `DavidAU/Polar-STRICT-Datasets` y `DavidAU/F451-STRICT-Datasets`. No se menciona el uso de RLHF o DPO; en cambio, el modelo fue sometido a un proceso de "abliteration" para eliminar la censura, resultando en un modelo "uncensored" y "heretic".

El objetivo principal del entrenamiento fue reducir el tamaño del bloque de pensamiento (thinking block) entre un 50 % y un 90 % (mediana de reducción en torno a dos tercios), reformatear dicho bloque y acelerar la generación de tokens, especialmente en el modo MTP. El autor afirma que no se utilizó "benchmaxing" (técnicas de sobreajuste a benchmarks) para evitar dañar el modelo.

## Capacidades

- Generación de texto y escritura creativa: el modelo está afinado para ficción, narrativa, cuentos y escritura en todos los géneros, con alta calidad de detalle.
- Razonamiento y pensamiento: soporta tres modos de operación de pensamiento (thinking), con una reducción significativa de tokens de pensamiento manteniendo la calidad.
- Programación: el modelo está etiquetado como "coder" y puede generar código, aunque no se especifican benchmarks específicos de HumanEval en la información disponible.
- Visión: al ser un modelo de visión-lenguaje (pipeline image-text-to-text), puede procesar imágenes y videos, aunque la model card no detalla capacidades específicas de visión.
- Tool calling / function calling: la comunidad reporta un rendimiento destacado en tool calling, pero no se confirma en la model card oficial.
- Agentes y razonamiento multi-paso: el modelo está diseñado para llevar a cabo tareas complejas de múltiples pasos con mayor fiabilidad, según la descripción del modelo base.
- Multilingüe: los idiomas declarados son inglés y chino.

## Casos de uso

- Escritura creativa y ficción: el modelo es ideal para generar capítulos de novela, guiones o relatos cortos. Su reducción de tokens de pensamiento permite producir narrativas largas con menor latencia y coste, manteniendo un alto nivel de detalle y estilo.
- Asistentes de rol (roleplaying): al ser un modelo "uncensored" y afinado para roleplaying, puede utilizarse en juegos de rol interactivos sin restricciones de contenido, generando respuestas coherentes y creativas en personajes ficticios.
- Generación de código en producción: con soporte de razonamiento y posible tool calling, puede integrarse en IDEs o pipelines de CI/CD para autocompletar, revisar o generar código, reduciendo el tiempo de desarrollo.
- Análisis de imágenes y videos: gracias a su naturaleza de visión-lenguaje, puede describir contenido visual, generar captions, responder preguntas sobre imágenes o extraer información de vídeos en aplicaciones de moderación, archivo o accesibilidad.
- Razonamiento matemático y científico: los resultados en ARC-C indican una capacidad sólida de razonamiento abstracto, lo que lo hace útil en problemas de lógica, matemáticas, física o análisis de datos.
- Automatización de tareas de agente: con soporte de multi-step reasoning y tool calling, puede orquestar flujos de trabajo complejos, como planificar tareas, llamar a APIs externas o gestionar procesos automatizados.
- Generación de contenido para marketing y copywriting: el modelo puede producir textos persuasivos y creativos para campañas publicitarias, descripciones de producto o contenido de marca, aprovechando su afinado en escritura creativa.

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados de benchmarks, sin especificar la metodología completa:

| Benchmark | Valor (8-bit) | Valor (4-bit) |
|---|---|---|
| ARC-C | 735 | 719 |
| ARC-E | 880 | No disponible |

El autor afirma que el modelo supera al base Qwen3.8-27B en los 7 benchmarks críticos, y también supera a Qwen3.6-35B-A3B, Qwen3.6 27B y Qwen3.5 27B en los mismos benchmarks. Sin embargo, no se proporcionan más cifras en la información disponible. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información proporcionada.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de VRAM o GPU en la información disponible.
- El repositorio incluye cuantizaciones GGUF (regulares y MTP) con imatrix, lo que permite la ejecución en hardware de consumo mediante llama.cpp u Ollama.
- Para la cuantización de 4 bits (Q4_K_S), una GPU de consumo con 16-20 GB de VRAM sería suficiente para ejecutar el modelo, aunque no hay cifras oficiales.
- Para la cuantización de 8 bits, se requeriría una GPU con aproximadamente 30 GB de VRAM, como una A100 o H100, o bien ejecución en CPU.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI y otros frameworks compatibles con GGUF o safetensors. El modelo está etiquetado como `endpoints_compatible` y `conversational`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-TURBO | 26.9B | Denso | No disponible | Apache 2.0 | Fine tune con reduccion de tokens de pensamiento |
| Qwen3.8-27B (base) | 27B | Denso | No disponible | Apache 2.0 | Modelo base de Qwen, vision-lenguaje |
| Qwen3.6-35B-A3B | 35B (3B activos) | MoE | No disponible | No disponible | Mencionado como superado por el modelo |
| Qwen3.6 27B | 27B | Denso | No disponible | No disponible | Mencionado como superado |
| Qwen3.5 27B | 27B | Denso | No disponible | No disponible | Mencionado como superado |

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": puede generar contenido explícito, violento o inapropiado sin filtros de seguridad. Existe un riesgo significativo de uso indebido en aplicaciones públicas.
- Sesgos: los datasets de entrenamiento (Polar-STRICT y F451-STRICT) pueden introducir sesgos no documentados. No se ha publicado una evaluación de sesgos ni auditorías de seguridad.
- Alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en modo creativo o cuando se le piden datos factuales.
- Idiomas: solo se declara soporte para inglés y chino. El rendimiento en otros idiomas, incluido el español, no está garantizado.
- Longitud de contexto: no se dispone de este dato, lo que dificulta planificar aplicaciones que requieran ventanas de contexto largas.
- Licencia: la licencia Apache 2.0 permite uso comercial, pero al ser un derivado de un fine tune de un modelo de Qwen, se deben respetar las licencias de los modelos base. No se detallan restricciones adicionales.

## Enlaces

- HuggingFace: https://huggingface.co/blastbeng/Qwen3.8-27B-TURBO
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Qwen3.8-27B original: https://huggingface.co/Qwen/Qwen3.8-27B
- Repo de referencia Fable Fusion: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Ollama: https://ollama.com/AI-TAVS/Qwen3.8-turbo:27b
