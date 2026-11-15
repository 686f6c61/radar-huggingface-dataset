# cbrigance/granite-4.2-30b-heretic

## Resumen

`cbrigance/granite-4.2-30b-heretic` es una variante "abliterated" (también etiquetada como "heretic") del modelo `ibm-granite/granite-4.2-30b` de IBM, publicada por el usuario cbrigance en Hugging Face. La modificación consiste en la eliminación o atenuación de las capas de rechazo del modelo original mediante técnicas de abliteration, un procedimiento que identifica y neutraliza las direcciones de activación asociadas a la negativa a responder determinadas peticiones. El resultado es un modelo que responde a un espectro más amplio de prompts, incluidos aquellos que el modelo base rechazaría por sus políticas de seguridad.

El modelo conserva la arquitectura y el tamaño del Granite 4.2 de 30B: 29.276.770.304 parámetros reales según los pesos en safetensors, con un repositorio de 58,6 GB en formato safetensors y compatible con la librería `transformers`. Está pensado para generación de texto conversacional y hereda las capacidades del modelo base de IBM, aunque la información disponible sobre contexto, cuantizaciones o datos de entrenamiento del fine-tune es muy limitada.

La relevancia de esta ficha es doble: por un lado, documenta una variante sin censura de un modelo reciente de IBM; por otro, advierte de que el acceso está restringido (gated) en Hugging Face, requiere aceptar condiciones y está etiquetado como `not-for-all-audiences`. La licencia declarada es Apache 2.0, pero la naturaleza del fine-tune y la falta de documentación técnica obligan a extremar las precauciones antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de IBM Granite 4.2; detalles específicos no disponibles) |
| Parámetros totales | 29.276.770.304 (29,28 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo solo contiene safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `ibm-granite/granite-4.2-30b`, un transformer denso de aproximadamente 29,28 mil millones de parámetros. La intervención de cbrigance es un fine-tune de tipo abliteration: se calculan direcciones en el espacio de activaciones que correlacionan con respuestas de rechazo y se proyectan fuera de los pesos o se atenúan, de modo que el modelo deja de activar el comportamiento de negativa. La etiqueta `heretic` hace referencia a la herramienta o metodología empleada para este tipo de modificación, aunque no se documenta en la model card qué variante concreta se usó, cuántas capas se intervinieron ni qué hiperparámetros se aplicaron.

No hay información publicada sobre el dataset de entrenamiento del fine-tune, el número de tokens utilizados, la composición de los datos ni si hubo RLHF, DPO o algún otro proceso de alineación posterior. Tampoco se detallan innovaciones técnicas adicionales más allá de la propia abliteration. El paper referenciado en los tags (`arxiv:2406.11717`) corresponde al modelo base de IBM, no a esta variante.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Granite 4.2 de IBM.
- Razonamiento y respuesta a instrucciones con un espectro de prompts más amplio que el modelo original, al haberse atenuado las capas de rechazo.
- Capacidad de seguir instrucciones multi-turno (comportamiento conversacional declarado en los tags).
- Compatibilidad con `transformers` y con endpoints compatibles (`endpoints_compatible` en los tags).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo se declara inglés (`en`).
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar empíricamente qué comportamientos se eliminan con la abliteration y cómo afecta a la utilidad y a la coherencia de las respuestas, comparándolo con el Granite 4.2 original.
- Generación creativa sin restricciones temáticas: escritura de ficción, guiones o narrativa que aborde temas sensibles y que el modelo base rechazaría, en un entorno controlado de autoría.
- Red teaming y evaluación de robustez: uso como modelo adversario para probar clasificadores de contenido, filtros de seguridad y sistemas de moderación antes de desplegarlos en producción.
- Análisis de sesgos y de comportamiento de rechazo: comparar las respuestas del modelo abliterated con las del base para cuantificar qué tipo de peticiones se veían afectadas por las capas de negativa.
- Fine-tuning posterior para dominios específicos: al estar en safetensors y licencia Apache 2.0, sirve como punto de partida para ajustes supervisados en tareas donde el rechazo del modelo original resulta un obstáculo (por ejemplo, investigación en ciberseguridad defensiva o análisis de contenido).
- Experimentación con técnicas de abliteration: reproducir o comparar metodologías (Heretic y similares) sobre un modelo de 30B y documentar el impacto en benchmarks de utilidad y seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 58,6 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda un nodo con 80 GB o más.
- VRAM estimada en cuantización de 8 bits: alrededor de 30 GB, viable en una A100 40 GB o H100.
- VRAM estimada en cuantización de 4 bits: alrededor de 16-18 GB, potencialmente viable en una RTX 4090 (24 GB) o RTX 3090, aunque no se han publicado pesos GGUF en el repo.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 para FP16; A100 40 GB o H100 para 8 bits; RTX 4090/3090 solo con cuantización agresiva y sin garantía de que existan pesos pre-cuantizados.
- Opciones de despliegue: `transformers` (declarado); vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible, y la ausencia de GGUF en el repo limita el uso en llama.cpp/Ollama sin conversión manual.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| cbrigance/granite-4.2-30b-heretic | 29,28 B | no disponible | apache-2.0 | Gated, requiere aceptar condiciones | Variante abliterated, solo inglés, sin benchmarks publicados |
| ibm-granite/granite-4.2-30b | 29,28 B (según base) | no disponible en esta ficha | apache-2.0 (según base) | Público (modelo base) | Modelo original de IBM con alineación de seguridad intacta |
| Otras variantes abliterated de 30B | no disponible | no disponible | variable | variable | No se dispone de datos comparables en la información proporcionada |

La comparación cuantitativa con alternativas de la misma categoría no está disponible porque no se han publicado benchmarks de esta variante ni se han identificado en la información proporcionada otros modelos abliterated de tamaño comparable con métricas públicas.

## Limitaciones y advertencias

- El acceso es restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- Etiquetado como `not-for-all-audiences`: el contenido generado puede incluir material sensible, ofensivo o inapropiado.
- La abliteration degrada las salvaguardas del modelo base; no debe desplegarse en aplicaciones orientadas al público sin filtros adicionales.
- Riesgo elevado de alucinación y de respuestas incoherentes, especialmente en dominios donde el modelo base ya era propenso a errores y ahora carece de mecanismos de negativa.
- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- La licencia Apache 2.0 se declara en los metadatos, pero la modificación de las capas de seguridad puede entrar en conflicto con las políticas de uso aceptable del modelo base de IBM; conviene revisar los términos del modelo original antes de un uso comercial.
- No hay información sobre la longitud de contexto efectiva, los datos de entrenamiento del fine-tune ni los hiperparámetros de abliteration, lo que impide evaluar su calidad de forma rigurosa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin comunidad que valide su comportamiento.
- No se han publicado pesos cuantizados (GGUF, AWQ, GPTQ), lo que complica el despliegue en hardware de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cbrigance/granite-4.2-30b-heretic
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-30b
- Paper referenciado en los tags: https://arxiv.org/abs/2406.11717
