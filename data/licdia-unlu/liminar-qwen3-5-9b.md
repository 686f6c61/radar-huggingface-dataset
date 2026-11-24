# LICDIA-UNLu/Liminar-Qwen3.5-9B

## Resumen

Liminar-Qwen3.5-9B es un ajuste fino completo del modelo Qwen 3.5 9B desarrollado por el Laboratorio de Investigación en Ciencia de Datos & Inteligencia Artificial (LICDIA) de la Universidad Nacional de Luján, en Argentina. El modelo está especializado en normativa universitaria argentina, vida académica e instituciones del sistema universitario nacional, y en español formal de Argentina. Forma parte de la familia Liminar, presentada como modelos de lenguaje abiertos del sistema universitario argentino.

El modelo parte de los 9.409.813.744 parámetros del Qwen 3.5 9B base y se distribuye bajo licencia Apache 2.0, la misma del modelo original. Se publica en formato safetensors para `transformers` (versión 5 o posterior) y también en cuantizaciones GGUF Q8_0 y Q4_K_M para su uso con llama.cpp, Ollama o LM Studio, incluso sin GPU. La versión actual es la etiqueta `v2026.11`.

Su relevancia radica en que aborda un dominio muy específico y poco cubierto: el conocimiento de la normativa universitaria argentina. Según la evaluación publicada por el autor, el ajuste multiplica por más de seis la tasa de respuestas correctas sobre normativa sin documentos respecto al modelo base (del 6,0 % al 36,7 %), manteniendo un rendimiento prácticamente idéntico en consultas con recuperación de documentos (RAG). El modelo se entrenó sin el modo de razonamiento de Qwen 3.5 y la plantilla de chat lo deja desactivado por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.5 9B); detalles internos no disponibles |
| Parametros totales | 9.409.813.744 (9,4 mil millones) |
| Parametros activos | No aplica (no es MoE según la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (pesos originales), Q8_0 (8 bits, 9,5 GB), Q4_K_M (4 bits, 5,6 GB) |
| Idiomas soportados | Español (es), con especialización en español formal de Argentina |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de todos los pesos de Qwen 3.5 9B, no un adaptador. El entrenamiento se realizó con FSDP en un nodo de la supercomputadora Clementina XXI, equipada con 8 tiles de GPU Intel Data Center Max 1550, y consumió 191 horas de GPU (horas de tile). Se llevó a cabo una época de preguntas y respuestas y cuatro épocas con todos los datos. El ajuste se hizo sin el modo de razonamiento de Qwen 3.5, y la plantilla de chat lo deja apagado por omisión, tanto en los pesos safetensors como en los archivos GGUF.

Los datos de entrenamiento combinan normativa universitaria nacional de Infoleg (base de datos.jus.gob.ar, CC BY 4.0), curada a mano, y textos públicos sobre la vida universitaria procedentes de argentina.gob.ar (CC BY 4.0), CONICET (CC BY 2.5 AR) y el Consejo Interuniversitario Nacional (con su permiso). A partir de ese corpus se generaron, con el documento a la vista, fragmentos con su ficha, versiones reescritas, preguntas y respuestas, ejemplos de abstención e identidad, respuestas del propio modelo base a consignas generales y ejemplos de consulta con documentos. Las respuestas de entrenamiento las escribió Qwen 3.5 27B, por lo que el modelo aprende en parte su estilo. No se mencionan en la información disponible detalles sobre RLHF o DPO.

## Capacidades

- Generación de texto conversacional en español formal de Argentina, con especial atención al registro institucional y académico.
- Conocimiento de normativa universitaria argentina (leyes, decretos y resoluciones del corpus de Infoleg) y de instituciones del sistema universitario nacional.
- Respuesta a preguntas sobre vida académica: CONICET, Consejo Interuniversitario Nacional, organismos públicos argentinos.
- Capacidad de abstención entrenada explícitamente mediante ejemplos de abstención e identidad en el dataset.
- Consulta con documentos (RAG): el modelo está entrenado para responder a partir de fragmentos recuperados por un sistema de recuperación.
- Plantilla de chat compatible con `transformers` (`apply_chat_template`) y con llama.cpp, Ollama y LM Studio.
- Modo de razonamiento de Qwen 3.5 desactivado por defecto (el ajuste se hizo sin él).
- Capacidades multimodales (image-text-to-text) heredadas del modelo base según las etiquetas del repositorio; no se detallan en la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Consulta de normativa universitaria con RAG: el modelo está diseñado para responder a partir de fragmentos recuperados por un sistema de recuperación real. La evaluación con 60 consultas y la rúbrica del asistente del digesto de la UNLu (utilidad, fidelidad, completitud y claridad) obtuvo un promedio de 4,97 sobre 5 y cero respuestas con datos incorrectos, lo que lo hace adecuado para asistentes documentales institucionales.
- Asistente de consulta del digesto universitario: es exactamente el escenario para el que se entrenó y evaluó (licdia.unlu.edu.ar/rag-unlu), integrable en portales de universidades para resolver dudas sobre resoluciones, estatutos y reglamentos.
- Atención al público en secretarías académicas: puede gestionar conversaciones multi-turno sobre trámites, planes de estudio y requisitos administrativos, con la salvedad de que conviene conectarlo a una fuente actualizada de normas.
- Despliegue en entornos sin GPU: las cuantizaciones Q4_K_M (5,6 GB) y Q8_0 (9,5 GB) permiten ejecutarlo con llama.cpp, Ollama o LM Studio en equipos de oficina, lo que facilita su adopción por universidades con infraestructura limitada.
- Base para ajustes institucionales: la receta y el código publicados en github.com/LICDIA-UNLu/liminar permiten que cada universidad añada su capa de actos internos, que el modelo no conoce.
- Investigación y docencia en PLN en español rioplatense: sirve como modelo de referencia para estudiar ajuste fino de dominio, abstención y evaluación con juez LLM en un contexto universitario argentino.
- Generación de material divulgativo sobre normativa: redacción de resúmenes y explicaciones de normas para boletines o guías internas, siempre con revisión humana por el riesgo de errores en números, fechas y montos.

## Benchmarks y rendimiento

Datos publicados en la model card. Cada modelo se compara con su base; las respuestas abiertas las califica Llama 3.3 70B. El benchmark de normativa sin documentos mide cuánto recuerda el modelo del corpus; la consulta con documentos usa fragmentos de un sistema de recuperación real y la rúbrica con la que se evaluó con personas el asistente del digesto de la UNLu.

| Evaluación | Modelo base (Qwen 3.5 9B) | Liminar-Qwen3.5-9B | gpt-4.1-mini (referencia) |
|---|---|---|---|
| Normativa sin documentos (300 preguntas): respuestas correctas | 6,0 % | 36,7 % | 14,3 % |
| Normativa sin documentos: nota media del juez (0 a 2) | 0,61 | 1,08 | 0,77 |
| Consulta con documentos, RAG (60 consultas): promedio del juez (1 a 5) | 4,99 | 4,97 | 4,98 |
| RAG: respuestas con algún dato incorrecto | 0 de 60 | 0 de 60 | 0 de 60 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La evaluación de la ficha corresponde al modelo en bf16; las versiones cuantizadas no se evaluaron aparte.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 19 GB solo para pesos (9,4 mil millones de parámetros a 2 bytes), más el overhead de activaciones y caché KV, que no se detalla en la información disponible.
- Cuantización Q8_0: archivo de 9,5 GB; requiere del orden de 10-12 GB de memoria en función del contexto.
- Cuantización Q4_K_M: archivo de 5,6 GB; puede ejecutarse en GPUs de consumo con 8 GB de VRAM o en CPU.
- GPU recomendadas: no se especifican en la información proporcionada. Por tamaño, un modelo de 9,4 mil millones de parámetros en bf16 encaja en A100 40 GB, H100 y RTX 4090 (24 GB); en cuantización Q4_K_M cabe en RTX 3060/4060 de 8 GB.
- Cabe en GPU de consumo: sí, en cuantizaciones GGUF; en bf16 requiere al menos 24 GB de VRAM.
- Opciones de despliegue: `transformers` 5 o posterior (safetensors), llama.cpp (`llama-server -hf`), Ollama (`ollama run hf.co/LICDIA-UNLu/Liminar-Qwen3.5-9B:Q4_K_M`) y LM Studio.
- Latencia y throughput: no disponibles en la información proporcionada.
- Entrenamiento: nodo de la supercomputadora Clementina XXI con 8 tiles de GPU Intel Data Center Max 1550; 191 horas de GPU (horas de tile).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Liminar-Qwen3.5-9B | 9,4 mil millones | No disponible | Normativa universitaria argentina, español de Argentina | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| Qwen 3.5 9B (base) | 9,4 mil millones | No disponible | Propósito general, multilingüe | Apache 2.0 (según el modelo base) | Hugging Face |
| gpt-4.1-mini | No disponible | No disponible | Propósito general, propietario | Propietaria | API de OpenAI |

La comparación con gpt-4.1-mini solo puede hacerse con los datos de la evaluación publicada: en normativa sin documentos, Liminar supera al modelo propietario (36,7 % frente a 14,3 % de respuestas correctas y 1,08 frente a 0,77 de nota media), mientras que en consulta con documentos ambos empatan (4,97 frente a 4,98). No se dispone de otros modelos comparables de dominio jurídico-universitario argentino en la información proporcionada.

## Limitaciones y advertencias

- No sabe qué normas siguen vigentes ni cuáles cambiaron después de la fecha del corpus; para consultas sobre normas concretas conviene usarlo con RAG sobre una fuente actualizada.
- Puede equivocar números de normas, fechas y montos, incluso con el ajuste.
- No conoce los actos internos de cada universidad; esa capa debe añadirse por institución con la receta publicada.
- El modelo se entrenó sin el modo de razonamiento de Qwen 3.5 y la plantilla de chat lo deja apagado por defecto; forzar el modo de razonamiento puede degradar el comportamiento esperado.
- Las respuestas de entrenamiento las escribió Qwen 3.5 27B, por lo que el modelo reproduce en parte su estilo y podría heredar sesgos de ese generador.
- La evaluación de la ficha corresponde al modelo en bf16; las versiones cuantizadas (Q8_0 y Q4_K_M) no se evaluaron por separado, por lo que su rendimiento puede diferir.
- El juez de las evaluaciones abiertas es Llama 3.3 70B, ajeno a las familias evaluadas, pero se trata de una evaluación automática con las limitaciones inherentes a ese método.
- Riesgo de alucinación en datos concretos (números, fechas, montos) y en preguntas fuera del dominio del corpus.
- Sesgos conocidos: no se documentan sesgos específicos en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones de las fuentes de datos citadas (Infoleg CC BY 4.0, argentina.gob.ar CC BY 4.0, CONICET CC BY 2.5 AR y el permiso del Consejo Interuniversitario Nacional) si se redistribuyen derivados.
- El repositorio ocupa 34,0 GB, lo que incluye pesos en bf16 y archivos GGUF; la descarga completa no es necesaria para todos los escenarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LICDIA-UNLu/Liminar-Qwen3.5-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Código y receta: https://github.com/LICDIA-UNLu/liminar
- Documentación: https://licdia-unlu.github.io/liminar
- Laboratorio (LICDIA, UNLu): https://licdia.unlu.edu.ar
- Asistente de consulta del digesto de la UNLu: https://licdia.unlu.edu.ar/rag-unlu
- Icono del proyecto: https://raw.githubusercontent.com/LICDIA-UNLu/liminar/main/docs/assets/liminar-icono-512.png
- Base de datos de normativa (Infoleg): https://www.argentina.gob.ar/normativa
- Portal argentina.gob.ar: https://www.argentina.gob.ar
- CONICET: https://www.conicet.gov.ar
- Consejo Interuniversitario Nacional: https://www.cin.edu.ar
