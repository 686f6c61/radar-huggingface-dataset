# gugujiji/novel-humanize-4b

## Resumen

novel-humanize-4b es un ajuste fino (fine-tune) del modelo Qwen3-4B desarrollado por el usuario gugujiji, diseñado para una tarea muy concreta: reescribir capítulos de novela web china (网文) generados o asistidos por IA para que suenen a un autor humano. El modelo no cambia trama, diálogos, personajes ni el orden de los acontecimientos; solo sustituye la "voz" del texto, eliminando florituras retóricas, metáforas de plantilla y explicaciones explícitas de emociones.

Con 4.022.468.096 parámetros (aproximadamente 4B, arquitectura densa heredada de Qwen3), el modelo está pensado para ejecutarse en una sola GPU de consumo. El autor publica la receta de prompt de sistema, los parámetros de muestreo recomendados y un script auxiliar (`fix_tools.py`) que expone la reescritura y la corrección de erratas como herramientas compatibles con function calling de OpenAI.

Su relevancia es acotada pero práctica: cubre el nicho de posprocesado estilístico para plataformas de ficción serializada y flujos editoriales en chino, donde el "sabor a IA" es un problema de calidad perceptible por el lector. La licencia Apache 2.0 y el tamaño reducido facilitan su integración en producción, aunque no hay benchmarks publicados ni un volumen de descargas que permita validar su robustez de forma independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B, decoder-only) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | El autor configura vLLM con `--max-model-len 8192`; la longitud nativa del modelo base no se especifica en la información disponible |
| Tipos de cuantizacion | No se publican cuantizaciones en el repositorio; los pesos se distribuyen en safetensors (repo de 8,1 GB, coherente con precisión de 16 bits). La conversión a GGUF/AWQ es posible con herramientas estándar, pero no está verificada en la información disponible |
| Idiomas soportados | Chino (zh) exclusivamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-4B (fine-tune) |
| Pipeline | text-generation |
| Fecha de creación | 2026-10-25 |
| Descargas / likes | 0 / 14 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer decoder-only denso con atención completa de tipo causal, y se distribuye como un fine-tune completo o consolidado en safetensors. La model card no documenta el proceso de entrenamiento: no se indica el número de tokens utilizados, la composición del corpus (se deduce que sería ficción web en chino, pero no se confirma), ni si se emplearon técnicas de alineación como SFT, RLHF o DPO. Tampoco se detallan hiperparámetros de ajuste ni la existencia de fases de rechazo de pares.

La innovación no está en la arquitectura, sino en la especialización conductual. El autor impone un prompt de sistema fijo y muy restrictivo que prohíbe continuar el texto, añadir escenas o cambiar el orden de los eventos, y recomienda muestrear con `temperature 1.0`, `top_p 0.95`, `top_k 20`, `presence_penalty 0.3` y el modo de pensamiento desactivado (`enable_thinking: false`). Es decir, se explota el modo instructivo de Qwen3 sin cadena de razonamiento explícita. El script `fix_tools.py` añade una segunda etapa opcional: tras la reescritura, se llama a una API compatible con OpenAI para corregir únicamente erratas y confusiones entre 的/地/得, sin reescribir de nuevo.

## Capacidades

- Reescritura estilística de ficción en chino: transforma texto con "sabor a IA" en prosa con ritmo y contención de autor humano, conservando trama, diálogos y personajes.
- Restricción de fidelidad: el prompt de sistema obliga a no continuar la historia, no añadir escenas y mantener una extensión similar a la del original.
- Procesamiento de capítulos completos: el autor recomienda introducir capítulos de 1000 a 2500 caracteres de una sola vez para obtener el mejor resultado.
- Modo de pensamiento desactivable mediante `chat_template_kwargs` (`enable_thinking: false`), heredado del template de Qwen3.
- Soporte de function calling: `fix_tools.py` define dos herramientas en formato OpenAI (`rewrite_novel` y `fix_typos`) que un modelo orquestador externo puede invocar.
- Corrección de erratas en dos etapas: reescritura con el modelo local y detección de errores tipográficos mediante una API externa (por ejemplo, DeepSeek), limitada a corregir sin reescribir.
- Capacidades multilingües: no disponibles; el modelo está entrenado y orientado únicamente al chino.
- Visión, audio y otras modalidades: no disponibles.

## Casos de uso

- Posproducción de ficción serializada en plataformas de web novel: pasar cada capítulo redactado con asistencia de LLM por el modelo antes de publicarlo, para eliminar fórmulas repetitivas y metáforas de plantilla que los lectores identifican como generadas por IA.
- Integración como herramienta en un agente editorial: gracias a la definición de `rewrite_novel` en formato function calling, un orquestador (por ejemplo, DeepSeek) puede encadenar reescritura y corrección de erratas dentro de un pipeline mayor de revisión.
- Limpieza de estilo en traducciones: capítulos traducidos de otros idiomas al chino suelen arrastrar calcos sintácticos; el modelo puede reescribirlos con una cadencia más natural sin alterar el contenido.
- Normalización de manuscritos de autores que usan LLM como borrador: el escritor genera una primera versión y el modelo la "humaniza" antes de la revisión manual, manteniendo su estructura narrativa.
- Etapa de control de calidad en editoriales pequeñas: procesamiento por lotes en una sola GPU de consumo (por ejemplo, una RTX 4090) para revisar decenas de capítulos al día sin depender de APIs externas.
- Experimentos de estilometría y atribución de autoría: al preservar trama y contenido, permite generar pares de texto (original frente a reescrito) para estudiar qué marcas lingüísticas delatan la escritura asistida por IA.
- Cadena de corrección editorial: uso conjunto de `rewrite_novel` y `fix_typos` para entregar un capítulo reescrito y con erratas corregidas, delegando el paso de corrección a un modelo mayor vía API compatible con OpenAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye evaluaciones automáticas (MMLU, HumanEval, GSM8K ni métricas de estilo), ni comparaciones cuantitativas con el modelo base. Tampoco se aportan métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada en precisión de 16 bits: en torno a 8 GB solo para pesos, más caché KV; con `--max-model-len 8192` conviene reservar entre 10 y 12 GB.
- VRAM estimada cuantizado: aproximadamente 4,5-5 GB en 8 bits y 2,5-3,5 GB en 4 bits (estimación por tamaño, no verificada en la información disponible, ya que no se publican GGUF).
- GPU recomendadas: RTX 4090, RTX 3090, RTX 4080 o cualquier GPU con 12-16 GB o más. Una A100 o H100 no aporta ventaja significativa para un modelo denso de 4B.
- Cabe en GPU de consumo: sí. El autor afirma explícitamente que "una tarjeta gráfica normal puede ejecutarlo". En 16 bits encaja con holgura en 16 GB; cuantizado podría caber en 8 GB, aunque esto no está confirmado por el autor.
- Despliegue: vLLM es la vía documentada (`vllm serve gugujiji/novel-humanize-4b --served-model-name novel-humanize-4b --max-model-len 8192 --generation-config vllm`). También puede servirse con cualquier runtime compatible con safetensors de HuggingFace; llama.cpp, Ollama o TGI no se mencionan en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| novel-humanize-4b | 4,02B | 8192 configurado en vLLM (nativo del base no indicado) | Reescritura estilística de web novel en chino | Apache 2.0 | HuggingFace, safetensors |
| Qwen3-4B (base) | 4B | No indicado en la información disponible | Modelo generalista instructivo y de razonamiento | Apache 2.0 | HuggingFace |
| Qwen3-8B | 8B aprox. | No indicado en la información disponible | Modelo generalista, mayor capacidad | Apache 2.0 | HuggingFace |
| Fine-tunes chinos de escritura creativa de 7B-8B | 7-8B aprox. | No disponible | Reescritura o generación de ficción | Variables (a menudo Apache 2.0 o licencias custom) | HuggingFace |

El modelo se diferencia de los generalistas por su especialización estrecha: frente a Qwen3-4B, sacrifica versatilidad a cambio de una conducta muy constreñida (no continuar la trama, no añadir escenas). No se dispone de comparaciones de calidad objetivas entre estas alternativas.

## Limitaciones y advertencias

- Ámbito lingüístico restringido: solo chino. No se garantiza ningún comportamiento en castellano u otros idiomas.
- Ámbito de género restringido: el propio autor advierte de que solo está orientado a web novel china; otros estilos (ensayo, prensa, técnico) no están garantizados.
- Pérdida de detalles: la model card reconoce que el modelo "a veces elimina algunos detalles", por lo que recomienda revisar manualmente la salida antes de usarla.
- Erratas residuales: puede introducir errores tipográficos y confundir 的/地/得; de ahí el paso adicional de corrección con `fix_typos` y un modelo externo.
- Riesgo de continuación no deseada con entradas cortas: el autor advierte de que fragmentos de pocos cientos de caracteres propician que el modelo invente trama; es necesario trocear los textos largos por párrafos.
- Dependencia de un prompt exacto: el autor indica que el prompt de sistema no debe modificarse, lo que limita la adaptabilidad a otros estilos o instrucciones.
- Ausencia de benchmarks y de validación comunitaria: 0 descargas y 14 likes en el momento de la consulta; no hay evidencia cuantitativa de calidad ni de robustez frente a entradas adversarias.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero no cubre los derechos sobre el texto de entrada; el usuario es responsable de la legalidad del material que reescribe y de su posterior publicación.
- Fecha de creación registrada como 2026-10-25, posterior a la mayoría de referencias del ecosistema; conviene verificar la vigencia del repositorio antes de integrarlo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/gugujiji/novel-humanize-4b)
- [Modelo base Qwen/Qwen3-4B](https://huggingface.co/Qwen/Qwen3-4B)
- Script auxiliar `fix_tools.py` del repositorio: https://huggingface.co/gugujiji/novel-humanize-4b/blob/main/fix_tools.py
- No se han encontrado enlaces adicionales relevantes (papers, blogs, demos o repositorios) en la búsqueda web realizada; los resultados obtenidos eran anuncios inmobiliarios sin relación con el modelo.
