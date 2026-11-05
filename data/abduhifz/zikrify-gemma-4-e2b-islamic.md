# abduhifz/zikrify-gemma-4-E2B-islamic

## Resumen

Zikrify Islamic Assistant es un modelo de generación de texto especializado en preguntas y respuestas sobre el islam, desarrollado por el usuario abduhifz para la aplicación móvil Zikrify (Azkar-ul-Muslim). Se trata de un ajuste fino mediante LoRA sobre `google/gemma-4-E2B-it-qat-q4_0-unquantized`, empaquetado en formato LiteRT-LM para ejecución totalmente offline en dispositivos Android, iOS y escritorio. El modelo responde a preguntas sobre el Corán, hadices, tafsir, adoración y vida diaria apoyándose en fuentes proporcionadas por la aplicación mediante recuperación aumentada (RAG) y citándolas numéricamente como [1], [2].

La propuesta diferencial es el despliegue en el propio teléfono: el artefacto `zikrify-gemma-4-E2B-it.litertlm` ocupa 2,86 GB en cuantización de 4 bits y no requiere conexión a internet ni servidores externos, lo que preserva la privacidad del usuario. El modelo admite inglés, urdu, roman urdu y árabe, y está diseñado explícitamente para no inventar versículos ni hadices, citando solo las fuentes incluidas en el prompt. También puede transformar una pregunta en palabras de búsqueda en formato JSON (inglés y árabe) para alimentar el paso de recuperación.

El modelo se distribuye bajo licencia Apache-2.0 y se comparte de forma gratuita. Es relevante por su enfoque de RAG estricto con citas obligatorias y por su formato on-device, poco habitual en asistentes religiosos, aunque su rendimiento y calidad no están respaldados por benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Gemma 4 E2B, ajuste LoRA); empaquetado LiteRT-LM |
| Parametros totales | no disponible (modelo base Gemma 4 E2B; recuento no especificado en la información) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información; el prompt recomienda mantener las fuentes bajo ~7.500 caracteres (inglés) o ~6.000 (otros idiomas) |
| Tipos de cuantizacion | 4 bits (artefacto LiteRT-LM); LoRA en PEFT sobre base QAT q4_0 |
| Idiomas soportados | inglés (en), urdu (ur), árabe (ar); roman urdu (urdu en caracteres latinos) según la model card |
| Licencia | Apache-2.0 |
| Formato de pesos | LiteRT-LM (`.litertlm`), safetensors (LoRA/PEFT) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it-qat-q4_0-unquantized`, una variante del Gemma 4 E2B con cuantización consciente del entrenamiento (QAT) a 4 bits, y sobre ella se aplica un adaptador LoRA (PEFT) de 97 MB. El adaptador se entrenó para dos tareas concretas: (1) responder preguntas islámicas construyendo la respuesta exclusivamente a partir de fuentes numeradas incluidas en el prompt y citándolas con corchetes, y (2) generar palabras de búsqueda en JSON (inglés y árabe) para consultar una biblioteca islámica. El modelo base es de tipo instruct, por lo que hereda el formato de conversación y las capacidades generales del Gemma 4 E2B.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO adicionales. La innovación principal no es arquitectónica sino de diseño de producto: el sistema de prompts (documentado íntegramente en `examples/prompts.py`) obliga al modelo a citar fuentes, a no inventar referencias, a presentar las cuatro escuelas sunníes de fiqh de forma equilibrada y a derivar casos sensibles (divorcio, herencia, juramentos, takfir) a un muftí cualificado. El empaquetado LiteRT-LM permite ejecución on-device en Android, iOS y escritorio.

## Capacidades

- Generación de texto en inglés, urdu, árabe y roman urdu, con cambio de idioma controlado por la última línea del prompt.
- Respuesta aumentada por recuperación (RAG) con citas obligatorias por número de fuente ([1], [2][3]).
- Declaración explícita de ausencia de fuentes cuando el contexto no cubre la pregunta, recurriendo a conocimiento general marcado como tal.
- Generación de palabras de búsqueda en JSON (inglés y árabe) para alimentar el recuperador.
- Manejo de preguntas de seguimiento mediante el bloque `EARLIER IN THIS CONVERSATION`.
- Presentación equilibrada de las cuatro escuelas sunníes de fiqh (Hanafí, Shafi'i, Malikí, Hanbalí) cuando difieren.
- Restricción de dominio: rechaza educadamente preguntas ajenas al islam.
- Capacidad de ejecución offline en dispositivo (sin tool calling ni function calling documentados).
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistente islámico dentro de una app móvil: integrado en Zikrify mediante LiteRT-LM, responde preguntas del usuario en el propio teléfono sin conexión, preservando la privacidad y funcionando en entornos con conectividad limitada.
- Búsqueda semántica sobre biblioteca islámica: el modelo genera palabras de búsqueda en JSON (inglés y árabe) que el recuperador usa para localizar versículos, hadices y tafsir antes de la generación.
- Respuestas con trazabilidad documental: al citar cada afirmación con [n], permite al usuario verificar la fuente, algo crítico en contenido religioso donde la alucinación es especialmente sensible.
- Educación religiosa multilingüe: cubre comunidades de habla inglesa, urdu y árabe, incluido roman urdu para usuarios que escriben urdu en caracteres latinos.
- Consulta de fiqh comparada: presenta las posturas de las cuatro escuelas sunníes con evidencia y deriva casos personales a un muftí, adecuado para apps de orientación general.
- Despliegue en dispositivos de gama media: el artefacto de 2,86 GB en 4 bits permite ejecución en teléfonos modernos sin GPU dedicada, útil para apps de contenido religioso con base de usuarios amplia.
- Moderación de dominio: filtra y redirige preguntas ajenas al islam, manteniendo el asistente centrado en su propósito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/almacenamiento: el artefacto LiteRT-LM ocupa 2,86 GB (2.859.748.688 bytes); el adaptador LoRA, 97 MB. Para inferencia con transformers + PEFT se requiere además el modelo base Gemma 4 E2B en cuantización q4_0.
- Ejecución on-device: diseñado para Android, iOS y escritorio mediante LiteRT-LM; no se especifican requisitos mínimos de RAM ni de CPU/GPU móvil.
- GPU de servidor: no disponible; no se documentan requisitos para A100, H100 o RTX 4090.
- GPU de consumo: no disponible; la vía prevista es el dispositivo móvil, no una GPU de escritorio.
- Opciones de despliegue: LiteRT-LM (principal, con ejemplo en `examples/ask_litert_lm.py`); transformers + PEFT para el adaptador LoRA (`examples/lora_transformers.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| zikrify-gemma-4-E2B-islamic | no disponible (base Gemma 4 E2B) | no disponible | Apache-2.0 | LiteRT-LM on-device, transformers+PEFT | Especializado en RAG islámico con citas |
| google/gemma-4-E2B-it-qat-q4_0-unquantized (base) | no disponible | no disponible | Gemma (términos propios) | Múltiple | Modelo general; sin especialización ni citas obligatorias |
| Alternativas islámicas on-device | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre modelos comparables |

No se dispone de datos de benchmarks ni de modelos directamente comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un scholar: el propio autor advierte que comete errores, incluidos fallos en dictámenes de fiqh; debe mostrarse siempre la fuente y recomendar consultar a un muftí.
- Dependencia de fuentes: sin fuentes en el prompt, recurre a conocimiento general y la fiabilidad cae notablemente; el modelo no contiene una base de datos del Corán ni de hadices.
- Riesgo de alucinación: aunque el prompt prohíbe inventar versículos, hadices, narradores o referencias, no hay garantía técnica de que no ocurra; la verificación humana es imprescindible.
- Límite práctico de contexto: el prompt recomienda mantener las fuentes bajo ~7.500 caracteres en inglés y ~6.000 en otros idiomas, recortando cada fuente de forma uniforme.
- Idiomas: solo inglés, urdu, árabe y roman urdu; no se documenta soporte para otras lenguas.
- Restricciones de dominio: rechaza preguntas no islámicas y evita decidir casos reales de divorcio, herencia, juramentos o takfir, así como consejo médico o legal.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base Gemma tiene sus propios términos que deben respetarse; conviene revisar la compatibilidad.
- Sin benchmarks: no hay métricas publicadas de calidad, sesgo o robustez; la evaluación en producción queda a cargo del integrador.
- Identidad forzada: el prompt instruye al modelo a identificarse como Zikrify Assistant y no nombrar otras empresas o modelos, lo que puede ser inadecuado fuera de esa app.
- Sesgos: no documentados; al ser un ajuste sobre Gemma 4 E2B, puede heredar sesgos del modelo base y del corpus de entrenamiento del adaptador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abduhifz/zikrify-gemma-4-E2B-islamic
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- LiteRT-LM (repositorio): https://github.com/google-ai-edge/LiteRT-LM
