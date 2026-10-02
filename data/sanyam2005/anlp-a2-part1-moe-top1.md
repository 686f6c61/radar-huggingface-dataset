# sanyam2005/anlp-a2-part1-moe-top1

## Resumen

`sanyam2005/anlp-a2-part1-moe-top1` es un modelo de traducción neuronal entrenado desde cero por Sanyam Agrawal en el marco de la asignatura Advanced NLP (Assignment 2, Part 1). Se trata de un transformer decoder-only con capa feed-forward de mezcla de expertos (MoE) de 4 expertos y enrutamiento top-1, con 35.277.312 parámetros totales y 25.840.128 parámetros activos por token (el 73,2 % del total). Su única tarea es la traducción de vietnamita→inglés y japonés→inglés, con el formato de prompt `<bos> <vi|ja> source <en>` y decodificación greedy hasta `<eos>`.

El modelo se entrenó sobre el corpus `belumind/en-vi-ja-curated-500k-triplets` durante 50.011.655 tokens y alcanzó una pérdida de validación final de 1,8826. No es un modelo de propósito general ni un sistema instruction-tuned: es un artefacto académico que ilustra el comportamiento de una FFN MoE con routing top-1 frente a variantes densas, en un régimen de cómputo muy reducido (repositorio de 0,1 GB).

Su relevancia actual es fundamentalmente didáctica y de investigación: sirve como referencia reproducible para estudiar enrutamiento de expertos en modelos pequeños, para comparar contra checkpoints hermanos de la misma asignatura y como base para experimentos de fine-tuning de dominio en pares de baja disponibilidad de recursos. No está pensado para producción: no declara licencia, acumula 0 descargas y no publica métricas de calidad de traducción (BLEU, chrF, COMET) más allá de la pérdida de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con FFN de mezcla de expertos (MoE), 4 expertos, enrutamiento top-1 |
| Parametros totales | 35.277.312 |
| Parametros activos | 25.840.128 por token (73,2 % del total) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF ni cuantizaciones precalculadas) |
| Idiomas soportados | vietnamita, japones, ingles (entrada vi o ja, salida en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json` y `tokenizer.json` |
| Parametros de la FFN (total / activos) | 12.595.200 / 3.158.016 |
| Tokens de entrenamiento | 50.011.655 |
| Perdida de validacion final | 1,8826 |
| Tokenizador | BPE a nivel de bytes (libreria `tokenizers`) |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion / actualizacion | 2026-10-01 / 2026-10-01 |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only entrenado íntegramente desde cero (sin inicialización desde un modelo preentrenado ni destilación). La innovación respecto a una variante densa está en la capa feed-forward: en lugar de una única FFN, se despliegan 4 expertos con un router que selecciona top-1, de forma que cada token activa un solo experto y el coste por token se mantiene bajo pese a que el total de parámetros de la FFN sea de 12.595.200. Esto explica la diferencia entre parámetros totales y activos. En repos hermanos de la misma asignatura se declara una configuración de 6 capas, `d_model` 512, 8 cabezas de atención y FFN oculta de 2048, entrenada 3 épocas con batch 64, AdamW con `lr` 3e-4 y precisión bf16; esa configuración es coherente con el recuento de parámetros de este checkpoint, pero no está confirmada en la documentación de este repositorio concreto.

El entrenamiento usa únicamente el corpus `belumind/en-vi-ja-curated-500k-triplets` (trillizos en-vi-ja) y consume 50.011.655 tokens, un volumen muy inferior al de cualquier sistema de traducción de referencia. No hay evidencia de RLHF, DPO, SFT ni de ninguna fase de alineación posterior: el modelo aprende exclusivamente la distribución condicional del texto de destino. La inferencia documentada es decodificación greedy con parada en `<eos>` y el formato de prompt fijo `<bos> <vi|ja> source <en>`, sin parámetros de muestreo declarados. La carga requiere el cargador propio de la asignatura (`src.part1.evaluate.load_model_folder`), lo que indica que la arquitectura MoE top-1 no sigue necesariamente una clase estándar de `transformers`.

## Capacidades

- Traducción automática de vietnamita a inglés y de japonés a inglés, en una sola dirección por par.
- Generación de texto autoregresiva condicionada por un prefijo de idioma (`<vi>` o `<ja>`) y un token de destino (`<en>`).
- Tokenización BPE a nivel de bytes, robusta ante texto no segmentado en vietnamita y japonés.
- Funcionamiento totalmente offline y en CPU, dado el reducido número de parámetros.
- Capacidad de servir como sujeto de experimentos de enrutamiento top-1 frente a top-2, densa o más expertos.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes ni razonamiento multi-paso.
- No hay capacidades de visión, audio, modo thinking ni razonamiento explícito.
- No es un modelo instruction-tuned: no sigue instrucciones en lenguaje natural ni mantiene diálogo multi-turno.

## Casos de uso

- Reproducción de experimentos academicos sobre MoE: el checkpoint permite analizar el enrutamiento top-1 y medir cuántos tokens caen en cada experto, comparando la carga real del router con la distribución esperada.
- Fine-tuning de dominio vi→en o ja→en: con 35 M de parámetros se puede reentrenar la FFN MoE o los expertos por separado sobre un corpus especializado (medicina, legal, subtítulos) en una única GPU de consumo.
- Preetiquetado de corpus paralelos: generar traducciones preliminares de grandes volúmenes de texto vi/ja para su posterior revisión humana, aprovechando que la inferencia en CPU es viable.
- Traducción en dispositivos con recursos limitados: al ocupar menos de 150 MB en fp32, se puede empaquetar en aplicaciones de escritorio o móviles sin conexión.
- Estudio comparativo de variantes de FFN: sirve como baseline dentro de la misma asignatura frente a los checkpoints hermanos (denso, MoE top-2, distinto número de expertos) para aislar el efecto del enrutamiento.
- Material docente: ilustrar de forma práctica la diferencia entre parámetros totales y activos, el coste de memoria y el comportamiento de un router aprendido.
- Aumento de datos para entrenar modelos mayores: usar las salidas como datos sinteticos filtrados por un modelo de calidad superior.
- Prototipado rapido de pipelines de traduccion: validar el formato de entrada/salida de un sistema de traduccion antes de integrar un modelo de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato cuantitativo de calidad reportado por el autor es la pérdida de validación final.

| Metrica | Valor |
|---|---|
| Perdida de validacion final | 1,8826 |
| BLEU (vi→en) | no disponible |
| BLEU (ja→en) | no disponible |
| chrF / COMET | no disponible |
| MMLU, HumanEval, GSM8K | no aplica (modelo de traduccion) |

## Requisitos de hardware

- VRAM estimada para inferencia de los pesos: aproximadamente 141 MB en fp32 (35,28 M × 4 bytes) y 71 MB en bf16/fp16.
- Con cuantización teórica a int8 serían unos 35 MB y a int4 unos 18 MB, aunque no se distribuyen pesos cuantizados.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o en CPU.
- La memoria total necesaria la dominan las activaciones y la caché KV, no los pesos; el modelo es viable en sistemas con 2-4 GB de RAM o VRAM.
- Opciones de despliegue: `transformers` con el cargador propio del repositorio de la asignatura (`src.part1.evaluate.load_model_folder`). No se confirma soporte nativo en vLLM, TGI, llama.cpp u Ollama, y no se publican pesos en formato GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo de traducción por frase.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sanyam2005/anlp-a2-part1-moe-top1 | 35,3 M totales / 25,8 M activos | no disponible | vi, ja → en | no disponible | safetensors, carga con codigo propio |
| Rakshitagg06/anlp-a2-part1-moe-top1 | no disponible (misma configuracion MoE top-1 de 4 expertos declarada) | no disponible | vi, ja → en | no disponible | safetensors |
| unignoramus/anlp-a2-p1-moe-top1 | no disponible | no disponible | no disponible | no disponible | safetensors |
| dnebh/anlp-a2-part1-config2_moe_top1 | no disponible | no disponible | no disponible | no disponible | safetensors |
| NLLB-200-distilled-600M | 600 M | 512 tokens | 200 idiomas | CC-BY-NC-4.0 | transformers |
| M2M-100 (418M) | 418 M | 1024 tokens | 100 idiomas | MIT | transformers |

Los tres primeros son checkpoints equivalentes generados por distintos estudiantes sobre el mismo enunciado y el mismo corpus, por lo que la comparación relevante es interna al ejercicio. Frente a NLLB-200-distilled-600M o M2M-100, este modelo es aproximadamente 12-17 veces más pequeño, cubre 2 pares de traducción en una sola dirección y no cuenta con evaluación de calidad publicada, por lo que no es un sustituto a nivel de rendimiento.

## Limitaciones y advertencias

- Modelo academico de asignatura: 0 descargas y 0 likes en el momento de redactar esta ficha, sin validacion por terceros.
- Sin licencia declarada: no existe permiso explicito de uso comercial, redistribucion ni obras derivadas. En la practica, el uso comercial queda en un limbo legal.
- Direccionalidad fija: solo traduce vi→en y ja→en. No soporta en→vi, en→ja, ja→vi ni vi→ja.
- No es instruction-tuned ni ha pasado por RLHF o DPO; no sigue instrucciones ni mantiene conversaciones.
- Entrenado con solo 50.011.655 tokens, un orden de magnitud por debajo de lo habitual en traduccion neuronal; se espera una calidad limitada y una cobertura lexical estrecha.
- Longitud de contexto no documentada; el comportamiento mas alla de frases cortas o parrafos breves es incierto.
- Riesgo elevado de alucinacion, omisiones y deriva semantica en frases largas o con terminologia especializada.
- Sesgos desconocidos: no se documenta la composicion, el filtrado ni la procedencia del corpus `en-vi-ja-curated-500k-triplets`.
- Decodificacion greedy fija hasta `<eos>`; no se documentan parametros de temperatura, top-p ni penalizaciones.
- Requiere el codigo del repositorio de la asignatura para cargarse; es posible que no funcione con `AutoModelForSeq2SeqLM` o `AutoModelForCausalLM` estandar sin `trust_remote_code` o una implementacion propia del router.
- No se distribuyen pesos cuantizados ni GGUF, por lo que el despliegue en llama.cpp u Ollama exige una conversion manual.
- La perdida de validacion (1,8826) no es comparable entre tokenizadores distintos y no permite inferir calidad de traduccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sanyam2005/anlp-a2-part1-moe-top1
- Perfil del autor: https://huggingface.co/sanyam2005
- Dataset de entrenamiento: https://huggingface.co/datasets/belumind/en-vi-ja-curated-500k-triplets
- Checkpoint hermano (misma asignatura): https://huggingface.co/Rakshitagg06/anlp-a2-part1-moe-top1
- Checkpoint hermano (variante config2): https://huggingface.co/dnebh/anlp-a2-part1-config2_moe_top1
- Checkpoint hermano: https://huggingface.co/unignoramus/anlp-a2-p1-moe-top1
- Checkpoints unificados de la asignatura: https://huggingface.co/Yajat31/anlp-a2-checkpoints
- Paper: no disponible
- Blog o demo: no disponible
- Repositorio de codigo: no disponible publicamente (referenciado como `src.part1.evaluate` en el material de la asignatura)
