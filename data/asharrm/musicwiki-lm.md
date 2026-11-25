# asharrm/musicwiki-lm

## Resumen

MusicWiki-LM 33M es un modelo de lenguaje de 33,3 millones de parámetros entrenado desde cero por el desarrollador independiente asharrm sobre un corpus de 375.000 artículos de Wikipedia en inglés centrados en música (artistas, grupos, álbumes, canciones y géneros). Se trata de un modelo de investigación y aficionado, no de una referencia factual, y su propio autor advierte que inventa hechos con seguridad. Su relevancia no reside en el rendimiento absoluto, sino en el ejercicio de ingeniería: se entrenó íntegramente en una única APU de PlayStation 5 (AMD Oberon, gfx1013) bajo Linux con una pila ROCm/PyTorch portada a mano, en una sola noche.

Arquitectura Llama clásica (`LlamaForCausalLM`) con RMSNorm, RoPE, SwiGLU y embeddings atados, 8 capas, anchura 512 y 4 cabezas de atención (dimensión de cabeza 128). El contexto es de 1024 tokens y el tokenizador es un BPE a nivel de byte de 16.384 tokens entrenado sobre el mismo corpus. El modelo está especializado en generar documentos con el formato de los artículos de Wikipedia musical: un título `# Title`, líneas de infobox `clave: valor` y prosa posterior.

El modelo se publica bajo licencia CC BY-SA 4.0, la misma que el texto de Wikipedia del que deriva, y solo soporta inglés. Es útil como banco de pruebas para entrenamiento de bajo coste, para estudiar el comportamiento de modelos pequeños en dominios cerrados y para experimentos de formato estructurado, no como asistente de propósito general.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Llama (RMSNorm, RoPE, SwiGLU, embeddings atados), `LlamaForCausalLM` |
| Parámetros totales | 33.300.992 (33,3M; 8,4M corresponden al embedding atado) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantización | no disponible (el autor no documenta cuantizaciones publicadas; los pesos se distribuyen en safetensors en fp32) |
| Idiomas soportados | inglés (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (repo de 0,1 GB) |
| Capas / anchura / cabezas | 8 / 512 / 4 (dimensión de cabeza 128) |
| FFN | 1344 |
| Tokenizador | BPE a nivel de byte, 16.384 tokens, entrenado sobre el corpus |
| Precisión de entrenamiento | fp32 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama estándar sin modificaciones estructurales: 8 capas transformer con normalización RMSNorm, embeddings posicionales rotatorios (RoPE), activación SwiGLU en la FFN de dimensión 1344 y embeddings de entrada/salida atados. Con 33,3M de parámetros totales y 8,4M en el embedding, el cuerpo del transformer es muy compacto, lo que explica su velocidad de entrenamiento incluso en hardware limitado.

El corpus de entrenamiento procede del volcado de Wikipedia en inglés del 8 de octubre de 2026, filtrado a artículos musicales mediante Wikidata (canciones y sencillos, álbumes, grupos, músicos y géneros): 375.000 artículos tras limpieza, con el marcado eliminado y el infobox conservado como líneas `clave: valor`. El total es de 272M tokens de entrenamiento, con un 0,5% de artículos reservados por hash de título como conjunto de validación (1,38M tokens). El entrenamiento se ejecutó en una APU de PlayStation 5 (AMD Oberon, gfx1013, 36 CUs, 16 GB de memoria compartida) bajo Linux 7.1 con PyTorch 2.9.1 compilado para gfx1013, en fp32 porque las rutas fp16/bf16 de esa GPU resultaban unas 7 veces más lentas. Se realizaron 4.658 pasos de 65.536 tokens (305M tokens, 1,12 épocas) con AdamW (β 0,9/0,95, weight decay 0,1, clip 1,0) y un schedule warmup-stable-decay: 200 pasos de warmup, learning rate 0,002 y decaimiento 1-sqrt en los últimos 800 pasos. El throughput fue de unos 13,8k tokens/s con una temperatura máxima de la die de 91 °C, y el entrenamiento completo ocupó una noche (de 23:45:45 a 06:47:12 IST, con una pausa de unos 40 minutos en el paso 3.275).

## Capacidades

- Generación de texto en inglés con el formato específico de Wikipedia musical: título, líneas de infobox y prosa de artículo.
- Generación de líneas de infobox (`artist:`, `genre:`, `label:`, `origin:`, `released:`, etc.) a partir de un encabezado parcial.
- Recuerdo parcial de hechos sobre artistas vistos en entrenamiento (19,0% de acierto exacto en el primer ítem de un campo de infobox frente a un 6,8% de baseline en artículos vistos).
- Inferencia limitada de campos a partir del contexto del propio artículo (11,5% en artículos no vistos frente a 8,3% de baseline).
- Cierre de documentos con el token especial `<|eos|>`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión, audio ni otras modalidades.
- Multilingüismo: únicamente inglés; no se documenta soporte de otros idiomas.

## Casos de uso

- Generación de borradores de artículos musicales de estilo Wikipedia: dado un título y unos pocos campos de infobox, el modelo continúa el documento con prosa y campos coherentes con el formato, útil como generador de plantillas o datos sintéticos con formato controlado.
- Aumento de datos para experimentos de formato estructurado: se pueden producir pares `clave: valor` + prosa para probar parsers, pipelines de extracción de infobox o sistemas de validación de esquemas, aceptando que el contenido factual será inventado.
- Banco de pruebas de entrenamiento de bajo coste: sirve como referencia reproducible para validar pilas ROCm/PyTorch en hardware no convencional (APU de PS5) y para comparar curvas de pérdida en modelos de menos de 50M de parámetros.
- Estudio académico de alucinación en modelos pequeños: su tendencia documentada a inventar nombres, fechas y reseñas (por ejemplo, atribuir `Kind of Blue` a Bill Evans con fecha de 2009) lo convierte en un caso útil para analizar cómo la perplejidad baja no garantiza fidelidad factual.
- Experimentos de continuación de texto con contexto corto: con 1024 tokens de ventana, encaja en pruebas de generación de documentos cortos y de evaluación de decodificación (temperature, top-k, repetition penalty) en entornos con recursos mínimos.
- Demostraciones educativas de arquitectura Llama: al ser un modelo de 8 capas y 33M de parámetros, se puede inspeccionar, modificar y reentrenar fácilmente en una sola GPU consumer para ilustrar el funcionamiento de RoPE, SwiGLU o el entrenamiento con warmup-stable-decay.

## Benchmarks y rendimiento

El autor no publica benchmarks estándar (MMLU, HumanEval, GSM8K). Los datos disponibles son pérdida y perplejidad en validación, además de una evaluación de recuerdo factual.

| Métrica | Resultado |
|---|---|
| Pérdida de validación final (paso 4658, 305M tokens) | 2,912 |
| Perplejidad de validación final | 18,4 |
| Pérdida de validación en el paso 250 (16M tokens) | 4,548 (ppl 94,4) |
| Pérdida de validación en el paso 2250 (147M tokens) | 3,189 (ppl 24,3) |
| Recuerdo factual, artículos vistos (400 artículos) | 19,0% (baseline 6,8%) |
| Recuerdo factual, artículos no vistos (217 artículos) | 11,5% (baseline 8,3%) |

Desglose de recuerdo por campo (vistos / no vistos): artist 31/112 y 9/40; genre 37/132 y 15/86; label 6/135 y 1/73; origin 2/21 y 0/18.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en fp32 ocupa aproximadamente 0,13 GB (33,3M parámetros × 4 bytes), por lo que cabe holgadamente en cualquier GPU consumer; en fp16 serían unos 0,07 GB.
- GPU recomendadas: cualquier GPU con soporte de PyTorch, incluidas GTX 1060, RTX 3060, RTX 4090, A100 o H100; el modelo es demasiado pequeño para aprovechar GPUs de datacenter.
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas e incluso en CPU; también se entrenó en una APU de PlayStation 5 con 16 GB de memoria compartida.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (soporte nativo documentado), text-generation-inference (etiqueta `text-generation-inference` en el repo) y endpoints compatibles; no se documenta soporte explícito de llama.cpp, Ollama, vLLM ni TGI más allá de las etiquetas del repo.
- Latencia y throughput: no se publican cifras de inferencia; el único dato de rendimiento es el del entrenamiento (unos 13,8k tokens/s en la APU de PS5 en fp32).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| MusicWiki-LM 33M | 33,3M | 1024 | CC BY-SA 4.0 | Dominio musical, entrenado desde cero, formato Wikipedia |
| TinyLlama 1.1B | 1,1B | 2048 | Apache 2.0 | Propósito general, inglés, entrenado desde cero |
| SmolLM2 135M | 135M | 8192 | Apache 2.0 | Propósito general, multilingüe, entrenado desde cero |
| GPT-2 small | 124M | 1024 | MIT | Propósito general, inglés, preentrenado en web |

La comparación es orientativa: no se han publicado resultados de benchmarks comunes entre MusicWiki-LM y estos modelos, por lo que no es posible comparar rendimiento de forma directa. MusicWiki-LM es aproximadamente 4 veces menor que GPT-2 small y 33 veces menor que TinyLlama, y su ventana de contexto es la más corta del grupo.

## Limitaciones y advertencias

- Alucinación factual severa: el propio autor advierte que el modelo inventa hechos con seguridad; en las muestras publicadas atribuye `Kind of Blue` a Bill Evans con fecha de 2009 y genera miembros y discográficas inexistentes para Radiohead.
- Recuerdo factual muy bajo: 19,0% en artículos vistos y 11,5% en no vistos, solo ligeramente por encima del baseline de responder el valor más común.
- Contexto muy limitado: 1024 tokens, insuficiente para conversaciones multi-turno o documentos largos.
- Solo inglés: no hay soporte documentado de otros idiomas, y el corpus es exclusivamente Wikipedia en inglés.
- Sesgos: al derivar de Wikipedia, hereda los sesgos de cobertura y redacción de sus contribuyentes; no se documenta ninguna mitigación.
- Sin alineación: no se documenta RLHF, DPO ni ajuste por instrucciones; el modelo es un preentrenamiento base, no un asistente.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribución y a compartir las obras derivadas bajo la misma licencia, lo que puede ser restrictivo para productos propietarios.
- No apto para producción como fuente de datos: cualquier salida debe tratarse como texto sintético no verificado.
- Sin cuantizaciones publicadas ni soporte documentado en runtimes de inferencia populares más allá de `transformers` y TGI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asharrm/musicwiki-lm
- Curva de pérdida publicada en el repo: loss_curve.svg (referenciada en la model card)
- Wikipedia en inglés (origen del corpus): https://en.wikipedia.org
- Wikidata (filtrado del corpus): https://www.wikidata.org
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- PyTorch: https://pytorch.org
- ROCm: https://rocm.docs.amd.com
