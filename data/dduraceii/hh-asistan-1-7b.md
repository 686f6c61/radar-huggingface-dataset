# dduraceii/HH-Asistan-1.7B

## Resumen

HH-Asistan-1.7B es un checkpoint de generación de texto publicado en Hugging Face por el usuario `dduraceii`. Se trata de un modelo denso de 1.720.574.976 parámetros (aproximadamente 1,7 mil millones) en formato safetensors, etiquetado en el Hub con la arquitectura `qwen3` y con el pipeline `text-generation`. La etiqueta `conversational` sugiere que ha sido ajustado para diálogo, pero la model card es la plantilla autogenerada por Hugging Face y no contiene ni una sola sección completada: no hay información sobre datos de entrenamiento, hiperparámetros, evaluación, licencia ni idiomas.

La relevancia de esta ficha es, por tanto, fundamentalmente descriptiva y de advertencia: se documenta un modelo del que solo se conocen los metadatos técnicos verificables (recuento de parámetros, formato de pesos, tamaño del repositorio y fecha de publicación) y del que se desconoce todo lo demás. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 19 de octubre de 2026 según los metadatos del Hub.

Para cualquier evaluador, la conclusión práctica es que HH-Asistan-1.7B debe tratarse como un artefacto no verificado: su tamaño lo hace ejecutable en hardware de consumo, pero la ausencia de licencia, de idiomas declarados y de cualquier traza de procedencia impide recomendarlo para producción sin una auditoría previa del checkpoint y de sus pesos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen3 (según el tag `qwen3` del Hub); detalles de capas y atención no disponibles |
| Parametros totales | 1.720.574.976 (dato real de safetensors) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio; solo se publican pesos en safetensors (tamaño de repo de 3,5 GB, compatible con bf16/fp16). No hay GGUF, AWQ ni GPTQ publicados |
| Idiomas soportados | no disponible (el nombre "Asistan" sugiere turco, pero no está confirmado en la model card) |
| Licencia | no disponible (sin licencia declarada; por defecto, ausencia de permiso explícito) |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna más allá del tag `qwen3`, que sitúa al modelo en la familia Qwen3 de Alibaba. Por el recuento de parámetros (1,72 B) y la ausencia de tag o mención de mezcla de expertos, cabe asumir una arquitectura densa, pero el número de capas, dimensión oculta, cabezas de atención, tipo de positional encoding y longitud de contexto nativa no están documentados. Tampoco se especifica si emplea atención completa o alguna variante eficiente.

Respecto al entrenamiento, la model card no aporta nada: no indica el número de tokens, la composición del corpus, si hubo fases de SFT, RLHF o DPO, ni si el modelo parte de un checkpoint base de Qwen3 o ha sido entrenado desde cero. El tag `conversational` es el único indicio de un ajuste orientado a diálogo. Tampoco hay información sobre tokenizador, idiomas del corpus de entrenamiento ni uso de datos sintéticos. El enlace a `arxiv:1910.09700` que aparece en los tags corresponde a la calculadora de impacto medioambiental citada en la plantilla de model card de Hugging Face (Lacoste et al., 2019), no a un artículo sobre este modelo.

## Capacidades

Todas las capacidades listadas a continuación son inferencias a partir del pipeline declarado (`text-generation`), del tag `conversational` y del tamaño del modelo; no están verificadas por el autor ni por evaluaciones independientes.

- Generación de texto autorregresiva en el idioma o idiomas del corpus de entrenamiento (no declarados).
- Diálogo multi-turno, presumiblemente, dado el tag `conversational`.
- Razonamiento básico y tareas de formato estructurado (clasificación, extracción de entidades, reescritura), dentro de lo esperable en la franja de 1-2 B de parámetros.
- Generación de código y matemáticas elementales: no confirmado y, en esta escala, con fiabilidad limitada.
- Tool calling / function calling: no disponible; no hay evidencia de plantilla de chat con soporte de herramientas.
- Capacidades de agente y razonamiento multi-paso: no disponibles ni documentadas.
- Multilingüismo: no disponible; no se declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponibles. Aunque Qwen3 introduce modos de razonamiento en sus versiones mayores, no hay constancia de que este checkpoint los conserve.

## Casos de uso

Dada la falta de documentación, los casos que siguen deben entenderse como escenarios plausibles para un modelo denso de 1,7 B ajustado a diálogo, no como usos validados por el autor.

- Prototipado local de asistentes conversacionales: un modelo de 1,7 B en bf16 ocupa unos 3,4 GB de pesos, por lo que se puede cargar en una GPU de consumo para iterar sobre prompts y plantillas de chat antes de migrar a un modelo mayor.
- Clasificación y etiquetado de texto a pequeña escala: fine-tuning ligero sobre el checkpoint para categorizar tickets, correos o reseñas, aprovechando que el coste de reentrenamiento es bajo en comparación con modelos de 7 B o más.
- Extracción de información estructurada: convertir texto libre en JSON con campos fijos en pipelines de ingesta, siempre que la longitud de contexto (desconocida) sea suficiente para el documento de entrada.
- Generación aumentada por recuperación (RAG) en entornos con recursos limitados: el modelo puede redactar la respuesta final a partir de fragmentos recuperados, delegando la recuperación en un motor externo; adecuado cuando se prioriza baja latencia y coste por token sobre profundidad de razonamiento.
- Base para fine-tuning de dominio: al ser un checkpoint pequeño, sirve como punto de partida para especializar en jerga sectorial (legal, sanitario, industrial) con un presupuesto de cómputo modesto.
- Despliegue en el borde o en CPU: tras convertir los pesos a GGUF con cuantización de 4 bits (aproximadamente 1 GB), puede ejecutarse en portátiles o dispositivos sin GPU dedicada para tareas de generación corta.
- Experimentación académica sobre comportamiento de modelos pequeños: útil para estudiar alucinación, sesgos o degradación multilingüe en la franja sub-2B con un coste de inferencia muy bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Las cifras de VRAM son estimaciones aritméticas a partir del recuento de parámetros (1,72 B) y no mediciones del checkpoint; el consumo real depende de la longitud de contexto, del tamaño de lote y del backend.

- Pesos en bf16/fp16: aproximadamente 3,44 GB (1,72 B × 2 bytes). Con caché KV y overhead del runtime, se recomienda reservar entre 4,5 y 6 GB de VRAM.
- Pesos en int8: aproximadamente 1,7 GB; con overhead, en torno a 2,5-3,5 GB.
- Pesos en 4 bits (GGUF Q4_K_M, previa conversión): aproximadamente 1,0-1,1 GB; en torno a 1,5-2,5 GB en total.
- GPU consumer: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 8/16 GB, RTX 4070, RTX 4080 y RTX 4090. En tarjetas de 4-6 GB (GTX 1650, RTX 3050 4 GB) solo es viable con cuantización de 4 bits y contextos cortos.
- GPU de datacenter: A100, H100, L40S y L4 son sobredimensionadas para un modelo de este tamaño; tienen sentido únicamente para servir muchos lotes concurrentes.
- Despliegue: `transformers` de forma nativa (es el formato publicado); vLLM y TGI son viables al ser una arquitectura tipo Qwen3, aunque la compatibilidad exacta no está verificada. Para llama.cpp u Ollama es necesaria una conversión previa a GGUF que no se distribuye en el repositorio.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo, TTFT ni consumo de memoria para este checkpoint.

## Comparativa con modelos similares

Los datos de los modelos comparables proceden de sus respectivas model cards públicas y deben verificarse antes de usarse en una decisión técnica; los de HH-Asistan-1.7B son en su mayoría desconocidos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| HH-Asistan-1.7B | 1,72 B | no disponible | no disponible | Repo público, 0 descargas, sin documentación |
| Qwen3-1.7B (modelo base de referencia) | 1,7 B | 32.768 tokens nativos según su documentación | Apache 2.0 | Ampliamente distribuido, con GGUF y cuantizaciones |
| Qwen2.5-1.5B | 1,5 B | 32.768 tokens según su documentación | Apache 2.0 | Ampliamente distribuido |
| Llama 3.2 1B | 1,23 B | 128.000 tokens según su documentación | Llama 3.2 Community License | Distribuido con restricciones de uso |
| Gemma 3 1B | 1 B | 32.000 tokens según su documentación | Gemma Terms of Use | Distribuido con restricciones de uso |

La diferencia práctica frente a los tres últimos no está en el rendimiento —del que no hay datos— sino en la trazabilidad: los modelos de Qwen, Meta y Google publican licencia, idiomas, contexto y evaluaciones, mientras que HH-Asistan-1.7B no ofrece ninguno de esos elementos.

## Limitaciones y advertencias

- Licencia no declarada: la ausencia de licencia implica, por defecto, ausencia de permiso explícito de uso comercial o de redistribución. Cualquier uso en producción requiere contactar con el autor.
- Model card vacía: es la plantilla autogenerada de Hugging Face, sin secciones completadas. No hay información sobre datos de entrenamiento, filtrado, alineación ni evaluación.
- Procedencia desconocida: se desconoce si el modelo deriva de un checkpoint base de Qwen3, si respeta su licencia original (Apache 2.0 en la familia Qwen3) o si se ha entrenado desde cero. Si deriva de Qwen3, la licencia Apache 2.0 del modelo base debería conservarse, algo que aquí no se refleja.
- Idiomas no declarados: no se puede asumir competencia en castellano ni en ningún otro idioma. El nombre "Asistan" apunta a un asistente en turco, pero es una inferencia no confirmada.
- Contexto desconocido: sin ventana declarada, el diseño de pipelines con documentos largos es arriesgado; hay que validar empíricamente el punto de degradación.
- Riesgo de alucinación: en la franja de 1,7 B la fiabilidad factual es baja, especialmente sin información sobre alineación (RLHF/DPO). No apto para dominios donde un dato falso tenga consecuencias.
- Sesgos no evaluados: al no documentarse el corpus, no hay forma de conocer sesgos de género, etnia, religión o idioma.
- Adopción nula: 0 descargas y 0 likes implican que el checkpoint no ha sido replicado ni auditado por terceros; no hay issues, discusiones ni conversiones comunitarias a GGUF.
- Fecha de creación en 2026 según los metadatos del Hub: conviene confirmar la vigencia y el estado del repositorio antes de integrarlo.
- Sin garantías de soporte: no hay repositorio de código, demo, paper ni contacto del autor más allá del perfil del Hub.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dduraceii/HH-Asistan-1.7B
- Referencia citada en los tags (Lacoste et al., 2019, sobre impacto medioambiental; proviene de la plantilla de model card, no es un paper sobre el modelo): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental mencionada en la plantilla: https://mlco2.github.io/impact#compute
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código, demos o conversiones a GGUF de este modelo.
