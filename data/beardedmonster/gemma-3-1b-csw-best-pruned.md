# BeardedMonster/gemma-3-1b-csw-best-pruned

## Resumen

`gemma-3-1b-csw-best-pruned` es un ajuste fino (fine-tuning) del modelo `google/gemma-3-1b-it` desarrollado por el usuario BeardedMonster (bajo la marca AletheiaAING). El modelo está especializado en dos tareas concretas de generación de texto en 37 lenguas africanas: la alternancia de código (code-switching, etiqueta `hm`) y la reescritura idiomática (ood), es decir, convertir texto plano en lenguaje coloquial rico en expresiones idiomáticas, refranes y comparaciones.

La versión "pruned" recorta el vocabulario original de Gemma 3 (262.144 tokens) hasta quedarse con 108.172 tokens, eliminando las entradas no utilizadas por este ajuste fino. El resultado es un modelo de aproximadamente 947 millones de parámetros (0,82B según el autor) que ocupa 1,9 GB en bf16, manteniendo la misma calidad que la versión completa `gemma-3-1b-csw-best`.

Es relevante porque aborda un hueco poco cubierto en los modelos multilingües: la generación de texto que imita cómo hablan realmente los hablantes multilingües africanos, mezclando lenguas dentro de una misma frase. El modelo está pensado como herramienta de generación de datos sintéticos para entrenar chatbots, sistemas ASR/TTS y detectores de alternancia de código, entre otros usos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3, variante text-only `gemma3_text`) |
| Parametros totales | 947.124.352 (~0,95B; el autor indica ~0,82B tras el pruning) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en bf16; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | yo, ha, ig, sw, zu, xh, af, am, so, rw, ln, lg, sn, ny, st, tn, mg, wo, ee, tw, om, ti (37 lenguas africanas; el README menciona también ejemplos en pcm) |
| Licencia | other (uso comercial y no comercial libre con atribución a AletheiaAING; aplican además los Gemma Terms of Use) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-1b-it`, un transformer decoder-only de la familia Gemma 3 en su variante solo-texto (`gemma3_text`). Sobre esa base se aplicó un ajuste fino supervisado orientado a tareas, con instrucciones codificadas mediante etiquetas de tarea (`<hm>`, `<ood>`) y códigos de lengua de tres letras entre paréntesis angulares (`<yor>`, `<eng>`, etc.). El vocabulario se podó de 262.144 a 108.172 tokens, lo que reduce el tamaño del modelo y de la matriz de embeddings sin alterar la calidad declarada por el autor.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o decodificación especulativa. La innovación principal es el formato de salida estructurado: el modelo genera siempre un bloque `<dev>` que lista las expresiones alternadas o idiomáticas utilizadas, lo que permite extraer spans etiquetados para entrenar detectores de code-switching. El prompt debe enviarse como un único mensaje de usuario, sin system prompt, con dos espacios tras los dos puntos.

## Capacidades

- Generación de texto con alternancia de código controlada: se elige la lengua base y la lengua a mezclar (`<hm> <yor>+<eng>: ...`).
- Reescritura idiomática (`<ood>`): transforma texto plano en lenguaje coloquial con refranes, comparaciones y expresiones nativas.
- Conversión combinada `hm_ood`: reescribe texto ya alternado manteniendo la alternancia.
- Generación de datos sintéticos etiquetados: el bloque `<dev>` marca los spans alternados o idiomáticos.
- Soporte de 37 lenguas africanas y pares de alternancia predefinidos en la tabla de lenguas del README.
- Generación de variantes por prompt mediante sampling múltiple o MBR (Minimum Bayes Risk) para seleccionar la mejor salida.
- No realiza traducción literal; el autor indica explícitamente que para traducción debe usarse un modelo específico.
- No se documentan tool calling, function calling, capacidades de agente, visión ni audio.

## Casos de uso

- Generación de datos de chat multilingües: convertir consultas de usuario en inglés o en una sola lengua a versiones con alternancia (`eng_hm`, `m_hm`) para entrenar chatbots que respondan a como la gente escribe realmente, mezclando idiomas en un mismo mensaje.
- Creación de guiones para ASR/TTS: generar frases alternadas para locuciones de grabación, texto de entrenamiento de modelos de voz y listas de palabras con expresiones mezcladas; requiere hablantes reales para el audio y revisión por nativos.
- Pruebas de robustez de sistemas NLP: producir entradas mixtas para evaluar cómo responden chatbots, traductores, detectores de idioma y modelos de sentimiento/NER ante code-switching.
- Entrenamiento de detectores de alternancia de código: el bloque `<dev>` proporciona spans etiquetados directamente utilizables como datos supervisados.
- Redacción de copy y diálogos naturales: reescribir texto plano en estilo idiomático (`ood`) para relatos, diálogos de videojuegos, publicaciones sociales o anuncios, con revisión posterior por un hablante nativo.
- Enseñanza de lenguas: mostrar a estudiantes cómo los hablantes mezclan lenguas y qué refranes emplean en contextos reales.
- Aumento de datasets propios: generar múltiples variantes por prompt (sampling o MBR) y filtrarlas para ampliar corpus de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~1,9 GB en bf16 para los pesos; en fp16 similar; en cuantizaciones de 8 bits o 4 bits (no documentadas oficialmente) cabría en menos de 1 GB.
- Cabe holgadamente en GPU consumer: RTX 3060 (12 GB), RTX 4060, RTX 4090, e incluso GPUs con 4-6 GB de VRAM.
- GPU de datacenter (A100, H100) sobredimensionadas para este tamaño; útiles solo para servir muchas peticiones en paralelo.
- Opciones de despliegue: transformers (referencia), vLLM y TGI para serving de alto throughput, llama.cpp/Ollama si se generan conversiones GGUF (no publicadas en el repo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Requisito crítico: usar el tokenizer del repositorio y respetar el formato exacto del prompt (dos espacios tras los dos puntos, códigos de tres letras entre paréntesis angulares).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-3-1b-csw-best-pruned | ~0,95B | no disponible | Code-switching e idiomas en 37 lenguas africanas | other (comercial con atribución + Gemma Terms) | Hugging Face |
| google/gemma-3-1b-it | ~1B | no disponible | Modelo base generalista multilingüe | Gemma Terms of Use | Hugging Face |
| gemma-3-1b-csw-best | ~1B (vocab completo) | no disponible | Misma especialidad, sin pruning | other | Hugging Face (mismo autor) |

No se dispone de datos de benchmarks para comparar rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Todo el texto generado es sintético; debe filtrarse y revisarse por hablantes nativos antes de usarlo en producción o en datasets publicados.
- No realiza traducción; usarlo para traducir producirá resultados incorrectos.
- El formato de prompt es estricto: etiquetas en texto plano, códigos de tres letras, dos espacios tras los dos puntos y tokenizer del repositorio; desviarse invalida la salida.
- Si falta el bloque `<dev>` en la salida, debe considerarse inválida y volver a muestrear.
- Los pares de alternancia deben pertenecer a la tabla de lenguas del README; no se admiten combinaciones arbitrarias.
- Riesgo de sesgos y alucinaciones inherente a un modelo de 1B ajustado sobre datos sintéticos o de dominio limitado; no se documentan evaluaciones de sesgo.
- Licencia "other": uso comercial permitido con atribución a AletheiaAING y conservación del aviso; además aplican los Gemma Terms of Use de Google, que imponen restricciones de uso adicionales.
- Longitud de contexto no documentada; no apta para conversaciones de contexto largo sin verificación empírica.
- El pruning del vocabulario implica que tokens fuera de las 108.172 entradas retenidas no pueden procesarse correctamente; no usar tokenizers externos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BeardedMonster/gemma-3-1b-csw-best-pruned
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Autor/marca: https://huggingface.co/AletheiaAING
