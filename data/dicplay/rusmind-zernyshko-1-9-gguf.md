# DICPlay/RusMind-Zernyshko-1.9-GGUF

## Resumen

RusMind Зёрнышко 1.9 es un modelo de lenguaje de 83 millones de parámetros entrenado desde cero por DICPlay, un proyecto que se presenta como "IA nacional rusa". Se trata de un transformer denso de 10 capas y dimensión 768, con tokenizador propio y una ventana de contexto de tan solo 1024 tokens. Su distribución principal es en formato GGUF (167 MB en F16), lo que permite ejecutarlo completamente en local en un portátil o incluso en un teléfono.

El modelo está especializado exclusivamente en ruso y su propuesta de valor no es la potencia bruta, sino la corrección lingüística y el conocimiento factual sobre Rusia. La versión 1.9 introduce mejoras medibles en puntuación (SAGE puntuación: 0,34 frente a 0,27 de la 1.6) y corrección ortográfica (0,10-0,15 frente a 0,06), además de un entrenamiento en tres fases que incluye un etapa específica de "anclaje" de conocimiento sobre historia y cultura rusas.

Es relevante ahora como ejemplo de modelo "from scratch" de escala ultrapequeña, con licencia propia restrictiva para uso comercial, y como alternativa ligera para tareas de post-proceso textual en ruso donde no se justifica desplegar un modelo de miles de millones de parámetros. Su puntuación global MERA 2.0 de 0,048 se sitúa, según el autor, al nivel de SmolLM-3B pese a ser 36 veces más pequeño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (10 capas, dimensión 768), entrenado desde cero |
| Parametros totales | 83.083.008 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | F16 (único archivo publicado, 167 MB); al ser GGUF es compatible con cuantizaciones derivadas en llama.cpp, aunque no se distribuyen |
| Idiomas soportados | Ruso (ru) |
| Licencia | RusMind License (DICPlay): gratuita para uso personal, no comercial, investigación y evaluación; uso comercial solo mediante contrato escrito |
| Formato de pesos | GGUF (F16); safetensors en el repositorio DICPlay/RusMind-Zernyshko-1.9 |
| Tokenizador | Propio, entrenado desde cero |
| Formato de dialogo | ChatML |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 10 capas con dimensión oculta de 768 y 83 millones de parámetros, entrenado íntegramente desde cero con un tokenizador propio (no derivado de Llama ni de otro modelo existente). El entrenamiento se organizó en tres etapas: primero un corpus de web rusa limpia de 310 millones de tokens, filtrado con un pipeline propio contra publicidad y spam; después una fase de diálogo; y finalmente una etapa separada de refuerzo de conocimiento sobre Rusia (historia, cultura, geografía).

No se documentan en la información disponible detalles sobre el uso de RLHF, DPO u otras técnicas de alineación, ni sobre la composición exacta del dataset de diálogo. Tampoco se especifican innovaciones arquitectónicas más allá de la elección de un tokenizador propio y el enfoque en corrección ortográfica y de puntuación como objetivo explícito de entrenamiento. El formato de conversación es ChatML.

## Capacidades

- Generación de texto conversacional en ruso con formato ChatML.
- Memoria de conversación a corto plazo: retiene nombre (incluidos nombres poco comunes como Evlampia o Tagir), ciudad, edad y nombre de mascota dentro de la ventana de contexto; el autor reporta 8/8 en su test de memoria.
- Conocimiento factual sobre Rusia: historia, cultura y símbolos; el autor reporta 12/12 en su batería de 12 preguntas.
- Corrección de puntuación en ruso (tarea SAGE de puntuación): puntuación de 0,34.
- Corrección ortográfica y de erratas en ruso (tarea SAGE): puntuación de 0,10-0,15.
- Razonamiento básico y comprensión de situaciones cotidianas y chistes (subtareas NewReasoning y LIMUR de MERA 2.0).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe: limitada al ruso según la model card y los metadatos.

## Casos de uso

- Corrección ortográfica y de puntuación en pipelines editoriales en ruso: el modelo puede ejecutarse como paso de post-proceso sobre textos generados o redactados por humanos, corrigiendo comas y erratas con un coste computacional mínimo (167 MB en F16).
- Preprocesado de texto ruso en aplicaciones móviles o de escritorio: al caber en cualquier portátil y teléfono y funcionar offline, es adecuado para normalizar o revisar texto sin conexión ni dependencia de API.
- Asistente conversacional ligero con memoria de sesión: para chatbots de dominio acotado que necesiten recordar datos del usuario (nombre, ciudad, edad) dentro de una conversación corta, gracias a su ventana de 1024 tokens y su formato ChatML.
- Filtrado y clasificación de contenido en ruso: puede emplearse como modelo de primera pasada para detectar spam o publicidad en textos, dado que fue entrenado con un filtro propio de este tipo de contenido.
- Educación y divulgación sobre cultura rusa: responde a preguntas factuales sobre historia, símbolos y tradiciones (por ejemplo, el águila bicéfala del escudo o la Maslenitsa), útil en aplicaciones didácticas offline.
- Desarrollo y experimentación con modelos from scratch: sirve como banco de pruebas de bajo coste para estudiar tokenizadores propios, currículos de entrenamiento por etapas y evaluación con MERA 2.0 en un entorno reproducible en local.
- Integración en LM Studio, llama.cpp u Ollama: para prototipado rápido de aplicaciones de texto en ruso sin infraestructura GPU, usando `llama-cli -hf` u `ollama run hf.co/...`.

## Benchmarks y rendimiento

| Benchmark / tarea | RusMind Zernyshko 1.9 | RusMind Zernyshko 1.6 | Referencia citada |
|---|---|---|---|
| MERA 2.0 (global) | 0,048 | no disponible | ~nivel de SmolLM-3B (según el autor) |
| MERA 2.0 NewReasoning (lógica) | 0,12-0,13 | no disponible | no disponible |
| MERA 2.0 LIMUR (humor y situaciones cotidianas) | 0,21-0,22 | no disponible | no disponible |
| SAGE puntuación (comas) | 0,34 | 0,27 | no disponible |
| SAGE ortografía | 0,10-0,15 | 0,06 | no disponible |
| Test de memoria del autor (8 preguntas) | 8/8 | no disponible | no disponible |
| Test de conocimiento de Rusia del autor (12 preguntas) | 12/12 | no disponible | no disponible |

Los datos de MERA 2.0 y SAGE proceden de la model card del autor; no se aportan resultados de MMLU, HumanEval, GSM8K ni de benchmarks estándar internacionales. Las comparaciones con SmolLM-3B son afirmaciones del autor no verificadas de forma independiente en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 0,5 GB en F16 (167 MB de pesos más overhead de contexto y runtime); cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU con 1 GB o más de VRAM (GTX 1050, RTX 3050, RTX 4090, A100, H100) es más que suficiente.
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales y en la mayoría de iGPU.
- Despliegue: llama.cpp (`llama-cli -hf DICPlay/RusMind-Zernyshko-1.9-GGUF -cnv`), Ollama (`ollama run hf.co/DICPlay/RusMind-Zernyshko-1.9-GGUF`), LM Studio (buscando "RusMind Zernyshko"); pesos safetensors para Transformers en el repositorio base.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño (83 M de parámetros) se espera inferencia en tiempo real en CPU moderna, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| RusMind Zernyshko 1.9 | 83 M | 1024 | Ruso | RusMind License (no comercial sin contrato) | GGUF F16, safetensors | Entrenado desde cero, tokenizador propio, foco en corrección en ruso |
| SmolLM-3B | 3 B | no disponible en esta ficha | Multilingüe (inglés principal) | no disponible en esta ficha | no disponible en esta ficha | Citado por el autor como referencia de rendimiento en MERA 2.0 |
| RusMind Zernyshko 1.6 | 83 M (misma familia) | 1024 | Ruso | RusMind License | GGUF | Versión anterior; peor puntuación y ortografía según el autor |

No se dispone de datos verificables de otros modelos rusos de escala comparable en la información proporcionada; la comparación con SmolLM-3B es una afirmación del autor y no una evaluación independiente.

## Limitaciones y advertencias

- Ventana de contexto muy corta (1024 tokens): insuficiente para documentos largos, conversaciones extensas o tareas de resumen sobre textos de cierta longitud.
- Modelo monolingüe en ruso: no se debe esperar un rendimiento fiable en castellano, inglés u otros idiomas.
- Escala muy reducida (83 M de parámetros): capacidad de razonamiento y conocimiento del mundo limitada; los resultados MERA 2.0 (0,048 global) son bajos en términos absolutos.
- Riesgo elevado de alucinación en preguntas factuales fuera del dominio reforzado (Rusia); los tests 12/12 y 8/8 son internos del autor y no validados de forma independiente.
- Sesgos potenciales derivados del corpus de web rusa y de la etapa de "anclaje" de conocimiento sobre Rusia; no se documenta ningún proceso de mitigación de sesgos.
- Licencia restrictiva: el uso comercial, la reventa, la distribución de versiones modificadas y la integración en productos requieren contrato escrito con DICPlay; la licencia es "other" y no una licencia open source estándar (Apache, MIT, etc.).
- Modelo distribuido "tal cual" ("as is"), sin garantías.
- Solo se publica un archivo F16; no hay cuantizaciones oficiales Q4/Q8, aunque el formato GGUF permita generarlas.
- Fecha de creación del repositorio (2026-11-03) y escasa tracción (0 descargas, 0 likes) en el momento de la consulta: ecosistema y validación externa prácticamente inexistentes.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.9-GGUF
- Repositorio safetensors (Transformers): https://huggingface.co/DICPlay/RusMind-Zernyshko-1.9
- Archivo F16: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.9-GGUF/blob/main/RusMind-Zernyshko-1.9-F16.gguf
- Licencia: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.9-GGUF/blob/main/LICENSE
- Benchmark MERA 2.0: no se proporciona enlace en la información disponible
- Paper o blog técnico: no disponible en la información proporcionada
