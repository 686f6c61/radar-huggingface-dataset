# emrevrg/Norovox-Nythos-Zero-GGUF

## Resumen

Nythos Zero es un modelo publicado por el desarrollador independiente emrevrg (Norovox Labs, Turquía) y distribuido en formato GGUF a través de Hugging Face. Se presenta como un asistente multimodal (texto e imagen) de la familia Nythos, orientado a razonamiento, código y trabajo diario, con la particularidad de incorporar una LoRA de identidad que hace que el modelo se identifique como "Nythos, de Norovox Labs" sin necesidad de system prompt ni de trucos en la plantilla de chat. El autor denomina METAMORF a esta técnica, consistente en una LoRA corta con anclaje KL al modelo original para mover la identidad a los pesos sin degradar el conocimiento.

Existe una discrepancia importante entre la model card y los metadatos del repositorio: la ficha del autor afirma que se trata de un modelo de 27B parámetros, mientras que el recuento real de parámetros en safetensors registrado por Hugging Face es de 79.691.776 (aproximadamente 79,7 M). El tamaño del repositorio (18,8 GB) es coherente con un modelo de decenas de miles de millones de parámetros cuantizado en Q4, no con 79,7 M de parámetros. Esta inconsistencia no se resuelve con la información disponible y debe tenerse en cuenta antes de cualquier evaluación.

La relevancia del modelo es limitada pero concreta: es un ejemplo de publicación individual con licencia Apache-2.0, cuantización GGUF lista para llama.cpp, módulo de visión separado y una técnica de personalización de identidad medida y documentada de forma explícita (aunque con muestras pequeñas). No se han publicado detalles sobre arquitectura interna, composición del dataset ni proceso de entrenamiento del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal texto+imagen; el autor no detalla la arquitectura del transformer ni del proyector de visión) |
| Parámetros totales | 27B según la model card; 79.691.776 según el recuento real de safetensors en el repo (dato contradictorio) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no especificada oficialmente; el ejemplo de lanzamiento del autor usa `-c 32768` |
| Tipos de cuantización | GGUF Q4_K_XL (pesos principales); BF16 (módulo de visión `mmproj`); F16 (LoRA de identidad, 159 MB) |
| Idiomas soportados | no disponible como lista oficial; la model card muestra turco e inglés en las pruebas de identidad (TR + EN) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (pesos, mmproj y LoRA), safetensors en formato PEFT para la LoRA de identidad, plantilla de chat Jinja (`.jinja`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base: la model card no indica si se trata de un transformer denso, un MoE o una arquitectura híbrida, ni detalla el número de capas, la atención (MHA/GQA/MLA), la función de activación o el tokenizador. Lo que sí se describe es la estructura de despliegue multimodal: un fichero de pesos GGUF (`Nythos-Zero-Q4_K_XL.gguf`), un módulo de visión independiente en BF16 (`nythos-zero-mmproj-BF16.gguf`) al estilo de llama.cpp, una plantilla de chat Jinja con la identidad de Nythos Zero y una LoRA de identidad en F16 para `--lora`.

El único proceso de entrenamiento documentado es el de la LoRA de identidad, no el del modelo base. Según el autor, se trata de una LoRA corta con un anclaje KL al modelo original, entrenada en 56 minutos sobre 2× T4 (cuota gratuita de Kaggle). El objetivo declarado es doble: forzar la autoidentificación como Nythos sin system prompt y preservar el conocimiento previo, cosa que el autor verifica con MMLU, ARC-Challenge y pérdida de texto general en FineWeb-Edu (ver sección de benchmarks). No hay información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset, ni si se aplicaron RLHF, DPO u otras etapas de alineamiento.

## Capacidades

- Generación de texto conversacional en formato asistente, con plantilla de chat propia en Jinja.
- Procesamiento de imágenes mediante el módulo `mmproj` en BF16, en el esquema multimodal de llama.cpp.
- Razonamiento y código: el autor posiciona el modelo para "reasoning, coding and everyday work", sin detallar capacidades específicas por dominio.
- Autoidentificación persistente: con la LoRA de identidad activa, el modelo responde "Nythos, Norovox Labs" sin system prompt ni manipulación de la plantilla (10/10 en preguntas no vistas en turco e inglés, según el autor).
- Multilingüismo: evidencia de turco e inglés; no hay lista oficial de idiomas ni evaluación por idioma.
- Tool calling / function calling: no disponible (no se menciona en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona).
- Capacidades de audio o vídeo: no disponibles; solo se declara texto + imagen.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Despliegue local de un asistente multimodal en estación de trabajo: con llama.cpp y el par de ficheros GGUF + mmproj, el modelo puede ejecutarse en una GPU de consumo para tareas de descripción de imágenes, extracción de texto de capturas y preguntas sobre documentos escaneados, sin depender de API externa.
- Prototipado rápido de producto con licencia permisiva: al ser Apache-2.0 (según el autor), permite integrar el modelo en un MVP comercial sin negociación de licencia, siempre que se valide antes la procedencia real del modelo base.
- Evaluación de técnicas de personalización de identidad: la LoRA de identidad y su JSON de medición sirven como caso de estudio reproducible de cómo inyectar una persona concreta en los pesos manteniendo el rendimiento en benchmarks, útil para investigación en control de comportamiento.
- Asistente de atención al cliente en turco e inglés: el modelo puede gestionar conversaciones multi-turno con una ventana de hasta 32.768 tokens en la configuración de ejemplo, suficiente para hilos largos con historial e imágenes adjuntas de producto.
- Generación y revisión de código en un pipeline interno: integrable mediante `llama-server` con su API compatible con OpenAI, lo que permite sustituir un endpoint remoto por uno local para tareas de autocompletado o revisión, con la salvedad de que no hay datos publicados de HumanEval ni de tool calling.
- Análisis de imágenes en flujos de documentación técnica: descripción de diagramas, capturas de error o esquemas de arquitectura, con el módulo de visión cargado junto al modelo de texto y contexto de 32k para adjuntar varias imágenes por sesión.
- Entorno educativo y de experimentación con cuotas gratuitas: el autor documenta que el entrenamiento de la LoRA cupo en 2× T4 de Kaggle durante 56 minutos, lo que da una referencia realista para reproducir el flujo en hardware limitado.

## Benchmarks y rendimiento

Los únicos datos publicados son autorreportados y provienen de la model card, con muestras de 100 preguntas y sin metodología, semilla ni detalle de evaluación. Se presentan tal cual, con la advertencia de que no son verificables con la información disponible y de que entran en contradicción con el recuento de parámetros del repositorio.

| Medición | Sin LoRA de identidad | Con LoRA de identidad | Tamaño de muestra |
|---|---|---|---|
| Identidad, 10 preguntas no vistas (TR + EN), sin system prompt | 0/10 | 10/10 | 10 |
| Prueba GGUF en llama.cpp, sin system prompt | 0/3 | 3/3 | 3 |
| MMLU | 83 % | 84 % | 100 preguntas aleatorias |
| ARC-Challenge | 99 % | 99 % | 100 preguntas |
| Pérdida de texto general (FineWeb-Edu) | 2,2414 | 2,2416 | no disponible |

No se han publicado resultados de HumanEval, GSM8K, MATH, MMMU ni de ninguna evaluación multimodal en la información disponible, a pesar de que el modelo se presenta como multimodal.

## Requisitos de hardware

- VRAM estimada para inferencia: si se confirma el tamaño de 27B, la cuantización Q4_K_XL ocupa del orden de 16-17 GB de pesos, a lo que hay que sumar el módulo de visión en BF16 y la caché KV para el contexto configurado (32.768 tokens en el ejemplo del autor). El repositorio completo pesa 18,8 GB, lo que es consistente con ese escenario. Si se toma literalmente el recuento de safetensors (79,7 M de parámetros), el modelo cabría en menos de 1 GB, lo que contradice el tamaño del repo.
- GPU recomendadas para el escenario de 27B en Q4: NVIDIA RTX 4090 (24 GB) o RTX 3090 (24 GB) para contexto moderado; A100 40 GB, L40S 48 GB o H100 para contexto largo y concurrencia.
- ¿Cabe en GPU de consumo? En el escenario de 27B en Q4 sí entra en GPUs de 24 GB, con margen ajustado si se usa el contexto máximo; en tarjetas de 16 GB requeriría cuantizaciones más agresivas (Q3 o Q2) o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp / `llama-server` es la vía documentada por el autor, con `--lora`, `--mmproj` y `--jinja`. Al ser GGUF, también es compatible con Ollama y con interfaces gráficas basadas en llama.cpp, aunque la combinación simultánea de mmproj y LoRA requiere configuración manual. vLLM o TGI no están documentados para este modelo; la carga de GGUF con LoRA y proyector multimodal en vLLM no es un camino soportado de forma estándar.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token en ninguna GPU.

## Comparativa con modelos similares

La familia Nythos del mismo autor es la única referencia directa disponible en los resultados de búsqueda. El resto de campos no están documentados en la información proporcionada.

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Estado |
|---|---|---|---|---|---|
| Nythos Zero (este modelo) | 27B declarados / 79,7 M según safetensors | 32.768 en el ejemplo de lanzamiento | Texto + imagen | apache-2.0 | Publicado (GGUF) |
| Nythos Mini | 0,8B / 4B (según la colección) | no disponible | Texto | no disponible | Miembro de la familia |
| Nythos estándar | 9B / 27B / 35B-A3B (según la colección) | no disponible | Texto | no disponible | Miembro de la familia |
| Norovox N1 | 0,5B | no disponible | Texto | no disponible | Publicado (GGUF) |
| AUBIN (Norovox) | no disponible | no disponible | "ve, actúa y aprende" según el README | no disponible | Repositorio GitHub |

No se dispone de datos en la información proporcionada para comparar con alternativas de otros desarrolladores de la misma categoría (modelos multimodales abiertos de ~27B), por lo que la comparación cruzada queda como no disponible.

## Limitaciones y advertencias

- Discrepancia de parámetros sin resolver: la model card afirma 27B y el recuento de safetensors del repositorio da 79,7 M. Cualquier decisión de despliegue o presupuesto de VRAM debe tomarse después de verificar los ficheros reales.
- Benchmarks no verificables: MMLU 84 %, ARC-Challenge 99 % y las pruebas de identidad se miden sobre 100 y 10 preguntas respectivamente, sin semilla, sin intervalos de confianza y sin scripts de evaluación publicados. Los valores de ARC-Challenge son implausiblemente altos incluso para modelos mucho mayores.
- Procedencia del modelo base desconocida: no se indica sobre qué modelo se ha entrenado. Si es un derivado de un modelo de terceros, la licencia Apache-2.0 declarada podría no ser aplicable a los pesos base, lo que afecta al uso comercial.
- Riesgo de alucinación: no se ha publicado ninguna evaluación de factualidad, calibración ni tasa de alucinación. Es esperable un riesgo alto en un modelo sin documentación de alineamiento.
- Sesgos: sin información sobre composición del dataset ni sobre evaluación de sesgos. La evidencia lingüística se limita a turco e inglés, por lo que el comportamiento en castellano no está caracterizado.
- Cobertura de idiomas incierta: no hay lista oficial de idiomas soportados ni evaluaciones por idioma; el soporte multilingüe más allá de TR/EN es una incógnita.
- Limitaciones de contexto: los 32.768 tokens provienen de un flag de ejemplo en la línea de comandos, no de una especificación de contexto entrenado; usar ese valor no garantiza degradación controlada de la calidad.
- Personalización de identidad como riesgo de seguridad: la LoRA hace que el modelo afirme ser Nythos de Norovox Labs de forma persistente. En producción conviene decidir explícitamente si se activa, ya que puede entrar en conflicto con los requisitos de transparencia sobre la naturaleza del sistema.
- Madurez del proyecto: se trata de un desarrollo individual sin empresa ni patrocinador, según la propia model card, con entrenamientos que dependen de cuotas gratuitas de GPU. No hay garantía de mantenimiento, soporte ni corrección de errores.
- Licencia: Apache-2.0 permite uso comercial y modificaciones, pero se distribuye "tal cual", sin garantías. Conviene revisar los ficheros `LICENSE` y `NOTICE` del repositorio antes de redistribuir.
- Caveat multimodal: no se han publicado evaluaciones de calidad de la visión (MMMU u otras), por lo que el rendimiento del módulo `mmproj` es desconocido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/emrevrg/Norovox-Nythos-Zero-GGUF
- Colección de la familia Nythos: https://huggingface.co/collections/emrevrg/norovox-nythos-6a427fcdef0250cd13a3b02b
- Repositorio GitHub de AUBIN (Norovox): https://github.com/Emrevrg/aubin
- Ficha de Norovox Nythos 0.8b en free2aitools: https://free2aitools.com/model/emrevrg/norovox-nythos-0.8b-open-gguf
- Ficha de Norovox N1 0.5b en free2aitools: https://free2aitools.com/model/emrevrg/norovox-n1-0.5b-gguf
- Paper, blog o demo oficiales: no disponible en la información proporcionada.
