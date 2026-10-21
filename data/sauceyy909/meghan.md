# sauceyy909/Meghan

## Resumen

Meghan es un ajuste fino conversacional de Qwen3-4B publicado por el usuario sauceyy909 en HuggingFace, concebido como un «compañero de clase» virtual para ayudar a estudiar. El modelo parte del checkpoint cuantizado en 4 bits de Unsloth (`unsloth/Qwen3-4B-unsloth-bnb-4bit`) y se entrena con QLoRA sobre un corpus propio de 1.403 ejemplos de chat, de los cuales aproximadamente la mitad provienen del catálogo público de cursos de un instituto de secundaria estadounidense (que el autor mantiene anónimo) y el resto son walkthroughs de resolución de problemas, conversación casual y tareas de grounding sobre contexto de página.

El resultado es un modelo denso de 4.022 millones de parámetros que conoce títulos, códigos, créditos, temas y prerrequisitos del catálogo de ese centro concreto, además de políticas habituales de clase, y que explica matemáticas y ciencias paso a paso con un tono informal orientado a adolescentes. Su relevancia es acotada pero interesante como caso de estudio: muestra un pipeline de especialización vertical muy barato (QLoRA de 3 épocas sobre 1.262 ejemplos de entrenamiento) con auditoría programática de la aritmética y separación explícita entre datos públicos y datos privados.

Es un modelo de nicho, con 0 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks publicados y con una licencia declarada que conviene revisar (la ficha indica `qwen-research-license`, mientras que Qwen3-4B se distribuye habitualmente bajo Apache 2.0). No debe tratarse como una autoridad académica ni como un asistente de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B); densa, no MoE |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen3-4B declara 32.768 tokens nativos (dato del modelo base, no verificado para este ajuste) |
| Tipos de cuantizacion | GGUF Q4_K_M (~2,4 GB); bf16 en safetensors; base entrenado en bnb-4bit; el autor no publica otras variantes GGUF |
| Idiomas soportados | en (ingles unicamente, declarado) |
| Licencia | qwen-research-license (`license: other`); ver advertencias sobre la discrepancia con la licencia del modelo base |
| Formato de pesos | safetensors (dos shards, bf16 fusionado, ~7,7 GB), GGUF (Q4_K_M), adaptador QLoRA crudo (132 MB) en `adapter/` |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-4B original: un transformer decoder-only denso con atención por causalidad estándar, sin mezcla de expertos ni componentes de estado recurrente. El autor no introduce cambios estructurales; todo el trabajo se realiza mediante QLoRA sobre el checkpoint base cuantizado en 4 bits de Unsloth, con r=16, alpha=16, 3 épocas, batch efectivo de 16, learning rate 2e-4 con scheduler coseno y precisión bf16. Posteriormente se fusionan los pesos y se generan los shards en bf16 y la cuantización GGUF Q4_K_M.

El dataset consta de 1.403 ejemplos de chat divididos en 1.262 de entrenamiento y 141 de holdout, con esta composición aproximada: 53 % de preguntas y respuestas sobre el catálogo de cursos (extraídas de páginas web públicas y del PDF *Program of Studies* del centro), 25 % de walkthroughs de resolución de problemas con una convención verificada de bloque de herramienta ` ```calc `, 13 % de conversación casual y construcción de persona, y 9 % de tareas de grounding sobre contexto de página. La innovación técnica destacable no es arquitectónica sino de proceso: cada línea del tipo `expr = result` del subconjunto de resolución aritmética se audita programáticamente para que evalúe a verdadero, lo que reduce la propagación de errores numéricos en el corpus de entrenamiento. No se documenta RLHF, DPO ni ninguna fase de alineación posterior al SFT.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con registro informal orientado a estudiantes de secundaria.
- Conocimiento factual del catálogo de cursos de un centro concreto: títulos, códigos de curso, créditos, temas, prerrequisitos y estructura departamental.
- Resolución paso a paso de problemas de matemáticas y ciencias, con emisión de bloques ` ```calc ` que contienen expresiones verificables.
- Grounding sobre contexto de página: responder preguntas ciñéndose al texto proporcionado en el prompt (capacidad entrenada explícitamente en el 9 % del corpus).
- Conversación casual y mantenimiento de persona («study buddy»).
- No se documenta soporte de tool calling o function calling genérico; el bloque ` ```calc ` es una convención de formato, no un protocolo de herramientas.
- No se documenta soporte de agentes, razonamiento multi-paso autónomo, modo «thinking» explícito, visión ni audio.
- Capacidad multilingüe: no disponible; solo se declara inglés.

## Casos de uso

- Ayuda con deberes de matemáticas: el modelo recibe el enunciado y devuelve una resolución paso a paso con el bloque ` ```calc `, lo que permite a un corrector automático re-evaluar cada línea aritmética antes de mostrarla al estudiante.
- Orientación académica dentro de un centro educativo: responder a preguntas del tipo «¿qué prerrequisitos tiene esta asignatura?» o «¿cuántos créditos vale este curso?» a partir del catálogo público, útil para un portal escolar o un chatbot de secretaría.
- Planificación de matrículas: dado un historial de asignaturas cursadas, el modelo puede razonar sobre qué cursos encajan en el siguiente semestre según prerrequisitos, siempre que el catálogo esté en el contexto o se haya incorporado al ajuste.
- Tutoría de ciencias con grounding documental: introducir el texto de un capítulo o de una ficha de laboratorio en el prompt y pedir explicaciones ceñidas a ese material, aprovechando el subconjunto de entrenamiento de page-context grounding.
- Prototipado de asistentes educativos verticales: sirve como plantilla reproducible para equipos que quieran especializar un modelo de 4 B sobre un corpus institucional pequeño con QLoRA, presupuesto mínimo y despliegue en una sola GPU consumer.
- Generación de material de repaso: producir resúmenes y guías de estudio de asignaturas del catálogo con tono cercano, para su revisión posterior por un docente.
- Demo o trabajo académico sobre evaluación de ajustes finos pequeños: el holdout de 141 ejemplos y la auditoría aritmética permiten estudiar la fiabilidad factual de un SFT de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8 GB solo para pesos (4,02 B × 2 bytes), más caché KV; en la práctica se recomienda una GPU de 16 GB o más para contexto largo.
- VRAM estimada para GGUF Q4_K_M: aproximadamente 2,4 GB de pesos; cabe con holgura en GPUs consumer de 6-8 GB (RTX 3060, RTX 4060, RTX 2070) y en portátiles con 8 GB de VRAM compartida.
- GPUs recomendadas: RTX 4090, L40S, A100 o H100 para despliegue en bf16 con concurrencia; RTX 3060/4060 o superiores para el GGUF cuantizado.
- Cabe en GPU consumer: sí, especialmente en la variante Q4_K_M; la versión bf16 requiere 16 GB o más.
- Opciones de despliegue: transformers (el autor incluye snippet con `device_map="auto"` y `bfloat16`), vLLM para los safetensors fusionados, llama.cpp y Ollama para el GGUF (`ollama run sauceyy909/Meghan:Q4_K_M`), Jan. El tag `endpoints_compatible` sugiere compatibilidad con inference endpoints de HuggingFace. Soporte de TGI no documentado.
- Latencia y throughput estimados: no disponible (el autor no publica mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Meghan (este modelo) | 4,02 B | no disponible en la card (base Qwen3-4B: 32.768) | Catalogo escolar concreto + resolucion paso a paso | qwen-research-license (declarada) | HuggingFace, 0 descargas |
| Qwen3-4B / Qwen3-4B-Instruct | 4,02 B | 32.768 nativos (extensible con YaRN en la familia Qwen3) | Proposito general, multilingue, tool calling | Apache 2.0 en los modelos pequenos de la familia | Ampliamente disponible |
| Phi-4-mini | ~3,8 B | 128.000 (familia Phi-4-mini) | Razonamiento y matematicas, ingle-solo en algunas variantes | MIT | Ampliamente disponible |
| Llama 3.2 3B Instruct | 3,21 B | 128.000 | Proposito general, multilingue | Llama 3.2 Community License | Ampliamente disponible |
| Gemma 3 4B IT | ~4 B | 128.000 | Proposito general, multimodal en la familia | Gemma Terms of Use | Ampliamente disponible |

Nota: los datos de contexto y licencia de las alternativas corresponden a sus fichas públicas; el rendimiento comparado no puede evaluarse porque Meghan no publica benchmarks. Frente a estas alternativas, Meghan solo aventaja en el conocimiento factual de un catálogo concreto; en cualquier otra dimensión (contexto, multilingüismo, tool calling, validación comunitaria, claridad de licencia) queda por detrás.

## Limitaciones y advertencias

- Modelo pequeño con dataset pequeño: el autor lo describe explícitamente como ayuda de estudio y no como autoridad; cualquier dato relevante debe verificarse.
- Riesgo de alucinación alto en preguntas fuera del catálogo entrenado: el corpus de 1.262 ejemplos de entrenamiento no cubre un dominio amplio y el ajuste puede inducir respuestas plausibles pero falsas sobre cursos, créditos o prerrequisitos.
- Los hechos sobre cursos describen un único instituto estadounidense anónimo y su *Program of Studies* público; no son extrapolables a otros centros ni a otros sistemas educativos.
- Solo inglés: no se declara ni se evalúa ningún otro idioma, incluido el castellano.
- Licencia ambigua: la model card declara `license: other` con `license_name: qwen-research-license`, mientras que Qwen3-4B se publica bajo Apache 2.0. Esa discrepancia afecta al uso comercial y a la redistribución; conviene aclararla con el autor antes de integrar el modelo en producción.
- Restricciones de la licencia Qwen Research: si se aplica, limita el uso comercial y exige condiciones específicas de atribución y redistribución.
- Sin validación comunitaria: 0 descargas y 0 likes; el modelo no ha sido reproducido ni auditado por terceros.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, y el holdout de 141 ejemplos es demasiado pequeño para extraer conclusiones robustas.
- Metadatos atípicos: la fecha de creación declarada (2026-10-20) es posterior a la fecha actual, lo que sugiere un error de marcado o de procedencia; conviene tratarlo como señal de fiabilidad documental mejorable.
- El bloque ` ```calc ` es una convención de formato entrenada, no un intérprete real: en inferencia el modelo puede emitir expresiones erróneas aunque el corpus de entrenamiento estuviera auditado. La validación debe hacerse en el lado del cliente.
- Longitud de contexto efectiva no documentada para este ajuste: aunque el modelo base soporte ventanas largas, el ajuste se realizó sobre ejemplos cortos y no hay garantía de comportamiento estable más allá de esa distribución.
- Sin filtros de seguridad documentados: no se describe ninguna fase de alineación, moderación ni evaluación de sesgos, por lo que no es adecuado para interacción directa con menores sin supervisión y capas adicionales de control.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sauceyy909/Meghan
- Modelo base utilizado para el entrenamiento: https://huggingface.co/unsloth/Qwen3-4B-unsloth-bnb-4bit
- Modelo base original de la familia: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Paper de Qwen3 (referencia de la arquitectura base): https://arxiv.org/abs/2505.09388
- Paper de QLoRA: https://arxiv.org/abs/2305.14314
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
