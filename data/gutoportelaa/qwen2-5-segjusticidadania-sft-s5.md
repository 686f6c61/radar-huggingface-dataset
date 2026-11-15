# gutoportelaa/qwen2.5-segjusticidadania-sft-s5

## Resumen

`qwen2.5-segjusticidadania-sft-s5` es un adaptador LoRA (PEFT) sobre `gutoportelaa/qwen2.5-3b-segjusticidadania-dapt`, un Qwen2.5-3B con preentrenamiento continuado en un corpus de producción científica brasileña sobre seguridad pública, justicia y ciudadanía. Lo desarrolla el usuario de Hugging Face `gutoportelaa` en el marco de un trabajo final de la asignatura de Procesamiento de Lenguaje Natural (UFPI, 2026.2). El modelo responde preguntas exclusivamente a partir de fragmentos documentales proporcionados, cita el fragmento usado entre corchetes y se niega a responder cuando la información no está en el contexto.

El objetivo es acotado y muy específico: no busca conocimiento general, sino enseñar al modelo un formato de respuesta anclada a evidencia (citar `[k]` o responder "Não encontrado nos documentos."). El SFT se aplica sobre un modelo base de 3.000 millones de parámetros, con LoRA de rango 16 sobre las proyecciones q, k, v, o, gate, up y down, y una ventana de entrenamiento de hasta 4.608 tokens por ejemplo.

La relevancia es doble: por un lado, es un ejemplo reproducible de ajuste fino con LoRA/QLoRA sobre un modelo pequeño para una tarea RAG con citación; por otro, la model card publica una evaluación honesta con benchmark pequeño (30 preguntas) y un análisis de significancia (McNemar) que advierte de la fragilidad de las conclusiones. El adaptador ocupa 0,1 GB y se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B) con adaptador LoRA (PEFT) |
| Parametros totales | 3B en el modelo base; el adaptador LoRA no declara recuento propio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 4.608 tokens por ejemplo durante el entrenamiento; contexto nativo del Qwen2.5-3B no indicado en la informacion disponible |
| Tipos de cuantizacion | no disponible (el entrenamiento usa AdamW de 8 bits; no se listan cuantizaciones de inferencia) |
| Idiomas soportados | portugues (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un Qwen2.5-3B que previamente pasó por un preentrenamiento continuado en el corpus del proyecto (subcarpeta `melhor` del modelo base `gutoportelaa/qwen2.5-3b-segjusticidadania-dapt`). El ajuste es un SFT con LoRA de rango 16, alpha 32, dropout 0,05, aplicado a las proyecciones q, k, v, o, gate, up y down. Se entrenaron 2 épocas con lote efectivo de 16 (2 × 8 de acumulación), tasa de aprendizaje 2·10⁻⁴, AdamW de 8 bits, calentamiento y decaimiento coseno, y cálculo de pérdida únicamente sobre los tokens de la respuesta. La respuesta se cierra con `<|im_end|>`.

Los datos de entrenamiento son 2.705 pares `instruction`/`input`/`output` generados por un Qwen2.5-7B-Instruct local a partir del corpus: 1.844 preguntas ancladas con cinco fragmentos y respuesta terminada en `[k]`, 600 rechazos ("Não encontrado nos documentos.") y 261 resúmenes. El reparto es de 2.422 ejemplos de entrenamiento y 283 de validación, separados por documento para evitar filtración. Ningún documento origen de un ítem de benchmark entra en los pares de entrenamiento. La innovación técnica destacable no es arquitectónica sino de método: el SFT enseña el formato de citación y rechazo sobre evidencia, no inyecta conocimiento nuevo.

## Capacidades

- Generación de texto en portugués orientada a pregunta-respuesta sobre fragmentos documentales.
- Citación explícita del fragmento usado mediante el formato `[k]`.
- Rechazo controlado: responde exactamente "Não encontrado nos documentos." cuando la respuesta no está en el contexto.
- Resumen de documentos del dominio (261 ejemplos de resumen en el conjunto de SFT).
- Respuesta anclada a evidencia (grounded QA), adecuada para pipelines RAG.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del portugués.
- No se documenta visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente RAG sobre literatura científica en seguridad pública: el modelo recibe cinco fragmentos recuperados por un recuperador híbrido (e5 + BM25) y responde citando el fragmento correcto, lo que permite auditar la respuesta contra la fuente.
- Revisión sistemática asistida: dado un conjunto de extractos de artículos, el modelo resume y responde preguntas concretas manteniendo la trazabilidad mediante `[k]`.
- Control de calidad de recuperadores: al exigir citación, un fallo de recuperación se traduce en un rechazo explícito, lo que facilita medir la calidad del pipeline RAG de extremo a extremo.
- Formación y docencia en PLN: sirve como ejemplo reproducible de LoRA/QLoRA con pérdida solo en la respuesta y evaluación con McNemar para comparar variantes de SFT.
- Atención a consultas internas sobre normativa y jurisprudencia brasileña: con fragmentos de leyes, súmulas y artículos, el modelo responde y cita, y se niega cuando el dato no está en el contexto.
- Extracción de datos puntuales (ley, artículo, porcentaje, año) en modo de elección por verosimilitud: el benchmark de 1.438 ítems de laguna evalúa esta capacidad sin contexto, con un 60,2 % de acierto.
- Filtrado de respuestas no sustentadas en producción: el patrón de rechazo permite descartar automáticamente respuestas sin evidencia antes de mostrarlas al usuario.

## Benchmarks y rendimiento

Evaluación sobre 30 preguntas ancladas del benchmark de evidencia, con los mismos cinco fragmentos fijos para todos los modelos (recuperador híbrido e5 + BM25), prompt en el formato de entrenamiento, generación voraz y hasta 160 tokens. El acierto se mide por presencia de los términos clave de la respuesta de referencia.

| Modelo | Acierto (30) | Cita el fragmento correcto | Rechazos | Termina solo | McNemar vs. sin SFT | Opción múltiple (1.438) |
|---|---|---|---|---|---|---|
| Qwen2.5-3B base (sin SFT) | 19 | 3 | 0 | 19/30 | — | 54,5 % |
| S4, LoRA | 22 | 27 | 2 | 0/30 | p = 0,453 | 54,9 % |
| S4b, LoRA, fin `<|endoftext|>` | 19 | 23 | 2 | 30/30 | p = 1,000 | 55,0 % |
| Qwen2.5-3B con preentrenamiento continuado (sin SFT) | 7 | 3 | 0 | 20/30 | — | 60,6 % |
| **S5, LoRA (este modelo)** | **22** | **27** | **2** | **0/30** | **p < 0,001** | **60,2 %** |
| S5b, LoRA, fin `<|endoftext|>` | 21 | 25 | 2 | 30/30 | p < 0,001 | 60,9 % |

El modelo no emite el token de fin de generación: en las 30 preguntas agota los 160 tokens, por lo que la respuesta debe truncarse en la primera cita `[k]` o en la frase de rechazo. La variante S5b sí termina sola en 30 de 30 casos y es la recomendada por el autor para uso directo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; para un modelo de 3B en fp16 se sitúa típicamente en torno a 6-8 GB, pero el autor no publica mediciones.
- GPU recomendadas: no disponible; no se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: no confirmado por el autor; por tamaño (3B) es plausible en GPUs consumer con suficiente VRAM, pero no hay dato publicado.
- Opciones de despliegue: la model card solo documenta `transformers` + `peft` (`PeftModel.from_pretrained` sobre el modelo base con `device_map="auto"`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `qwen2.5-segjusticidadania-sft-s5` (este) | 3B + LoRA | 4.608 tokens por ejemplo en entrenamiento | QA anclada con citación en portugués | Apache 2.0 | Adaptador PEFT en Hugging Face |
| Qwen2.5-3B base | 3B | no indicado en la información disponible | Modelo generalista | Apache 2.0 | Hugging Face |
| Qwen2.5-3B con preentrenamiento continuado (sin SFT) | 3B | no indicado | Dominio, sin formato de citación | Apache 2.0 | Hugging Face (`gutoportelaa/qwen2.5-3b-segjusticidadania-dapt`) |
| S5b, LoRA, fin `<|endoftext|>` | 3B + LoRA | 4.608 tokens por ejemplo en entrenamiento | Igual que S5, con token de fin | Apache 2.0 | Hugging Face |

En el benchmark de 30 preguntas, el S5 iguala al S4 (22 aciertos) y supera al base (19) y al modelo con preentrenamiento continuado sin SFT (7). En opción múltiple sin contexto, el S5 (60,2 %) queda por debajo del preentrenamiento continuado sin SFT (60,6 %) y del S5b (60,9 %), lo que confirma que el SFT no añade conocimiento factual.

## Limitaciones y advertencias

- Benchmark muy pequeño: con 30 preguntas, diferencias de hasta unos 5 aciertos entre modelos no son significativas, según advierte el propio autor.
- Sesgo hacia el rechazo: los pares de entrenamiento contienen un 22 % de rechazos y los modelos ajustados rechazan más que la base, incluso cuando la respuesta sí está en los fragmentos.
- El SFT enseña formato (citar y rechazar), no conocimiento: la opción múltiple sin contexto no mejora de forma apreciable.
- El modelo no emite el token de fin de generación; hay que truncar la salida en la primera cita `[k]` o en la frase de rechazo, o usar la variante S5b.
- Dependencia total del contexto: las respuestas se limitan a los fragmentos proporcionados y no sustituyen la lectura de las fuentes.
- Idioma limitado al portugués; no se documenta rendimiento en otros idiomas.
- Riesgo de alucinación no medido de forma específica; la citación reduce pero no elimina la posibilidad de citar un fragmento incorrecto.
- Uso declarado de investigación y enseñanza; aunque la licencia es Apache 2.0, el autor no valida usos en producción.
- No se documentan sesgos demográficos ni sociolingüísticos del corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gutoportelaa/qwen2.5-segjusticidadania-sft-s5
- Modelo base (preentrenamiento continuado): https://huggingface.co/gutoportelaa/qwen2.5-3b-segjusticidadania-dapt
- Dataset del proyecto: https://huggingface.co/datasets/gutoportelaa/segjusticidadania-experimentos
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-3B
