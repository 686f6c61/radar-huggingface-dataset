# Audante/HeartMuLa-oss-3B-happy-new-year-int8

## Resumen

HeartMuLa-oss-3B-happy-new-year-int8 es una conversión a int8 de los pesos de HeartMuLa-oss-3B-happy-new-year, un modelo texto-a-música de 3,94 mil millones de parámetros desarrollado por el equipo de HeartMuLa. La conversión la firma Audante y no es un release oficial de HeartMuLa: parte del checkpoint original en fp32, pasa por una copia en bf16 y aplica cuantización simétrica de 8 bits con una escala por canal de salida, sin reentrenamiento, sin fine-tuning y sin datos de calibración.

El objetivo es ejecutar la generación completa de una canción en Macs con 16 GB de memoria unificada. Los pesos pasan de 7,88 GB en bf16 (15,75 GB en fp32) a 3,94 GB, y el pico de memoria de una canción de 30 segundos baja de 9,2 GB a 7,9 GB gracias a que la GPU de Apple mantiene los pesos en int8 durante la inferencia mediante el kernel `torch._weight_int8pack_mm`.

La arquitectura combina un backbone transformer de 28 capas con un decodificador de 3 capas y cabezas sobre 7 codebooks de audio, más un códec separado que decodifica el audio estéreo. La relevancia práctica es doble: permite inferencia local en hardware de consumo Apple Silicon con una degradación medida muy pequeña (divergencia KL de 0,0041 frente a bf16) y documenta con detalle una metodología de cuantización reproducible para modelos de audio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo: backbone de 28 capas + decodificador de 3 capas, con cabezas sobre 7 codebooks de audio y proyección de condicionamiento (`muq_linear`); códec de audio separado |
| Parámetros totales | 3.938.113.536 (3,94 B); 3.937.910.784 cuantizados en int8 y 202.752 en bf16 |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 simétrica con una escala por canal de salida (escala en bf16); embeddings con una escala por fila; cabezas de codebook con una escala por codebook y columna de salida |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model-int8.safetensors`, archivo único); tokenizer y `generation config` no incluidos |
| Tamaño del repositorio | 3,9 GB |
| Modelo base | HeartMuLa/HeartMuLa-oss-3B-happy-new-year (revisión `41f6fc68490e11dc43fdabaa6b5767946408c903`) |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo para generación de música condicionada por texto. El backbone tiene 28 capas con las proyecciones habituales (`q_proj`, `k_proj`, `v_proj`, `output_proj`) y un MLP de tres matrices (`mlp.w1`, `mlp.w2`, `mlp.w3`), con 64 escalas de RMSNorm. Sobre él se apoya un decodificador de 3 capas y una cabeza `audio_head` de forma (7, 3072, 8197): 7 codebooks, dimensión interna de 3072 y vocabulario de salida de 8197 por codebook. Las entradas de texto y audio se proyectan con `text_embeddings` y `audio_embeddings`, ambas de 3072 dimensiones, y existe una proyección `muq_linear` con bias para el condicionamiento. La decodificación a forma de onda la realiza un códec independiente en fp16, que procesa los dos canales estéreo de forma secuencial.

No hay información disponible sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni sobre si se aplicaron RLHF o DPO; la model card de esta copia solo documenta el proceso de cuantización. Este proceso sí está descrito al detalle: para cada canal de salida se calcula `scale = max|w| / 127` en float32 sobre CPU, se redondea `q = round(w / scale)` y se satura a −127…127, guardando la escala en bf16. Se cuantizan todas las capas lineales del backbone y del decodificador, las dos matrices de embeddings (con escala por fila), `projection`, `codebook0_head`, el peso de `muq_linear` y las cabezas `audio_head`; permanecen en bf16 los 64 RMSNorm, el bias de `muq_linear` y `unconditional_text_embedding`. La innovación operativa es que los pesos no se descomprimen en vuelo: las capas se sustituyen por versiones que conservan `q` y `scale` y calculan `y = torch._weight_int8pack_mm(x, q, scale)`.

## Capacidades

- Generación de música a partir de texto y letra, con salida organizada en 7 codebooks de tokens de audio que decodifica un códec separado.
- Control de la duración solicitada: se han medido peticiones de 30 segundos, 2 minutos y 4 minutos, con el modelo cerrando algunas tomas por sí mismo antes del límite (134 s en bf16 y 96 s en int8 para una petición de 4 minutos).
- Condicionamiento con classifier-free guidance, tal y como se emplea en la evaluación con teacher forcing sobre 376 frames de una canción de 30 segundos.
- Generación de audio estéreo, con decodificación secuencial de los dos canales por parte del códec en fp16.
- Reproducibilidad parcial por semilla: la misma semilla y el mismo texto producen tomas distintas, porque el modelo muestrea sus tokens.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento; no es un modelo de propósito general.
- No hay datos sobre capacidades multilingües ni sobre idiomas soportados.

## Casos de uso

- Generación de canciones en un Mac de 16 GB: es el caso para el que se construyó la copia, ya que el pico medido es de 7,9 GB para 30 segundos y 8,1 GB para 2 minutos, por debajo del límite de 16 GB de memoria unificada.
- Asistente de escritorio integrado en una app de música: Audante Link carga el modelo, escribe los tokens de la canción, libera el backbone y deja que el códec decodifique, con tiempos de 41–48 segundos para una pieza de 30 segundos incluida la carga.
- Maquetas y prototipado musical con letra: el modelo acepta texto y letra y devuelve una toma completa, útil para explorar variaciones rápidas cambiando la semilla sin tocar el prompt.
- Generación local con privacidad: todo el pipeline (backbone int8 más códec fp16) se ejecuta en el equipo, sin llamadas a servicios externos, lo que encaja en flujos con material creativo no publicable.
- Investigación en cuantización de modelos de audio: la ficha y el formato permiten reproducir la comparación frente a bf16 con teacher forcing (divergencia KL de 0,0041 en el backbone y 0,0026 en el decodificador) y validar metodologías int8 por canal en dominios no textuales.
- Integración en herramientas de producción musical mediante `heartlib`: el modelo se puede cargar construyendo la estructura vacía y sustituyendo cada capa lineal por la versión int8, lo que permite insertarlo en un pipeline propio de renderizado por lotes.
- Evaluación objetiva de calidad de letra cantada: la métrica `lyrics_match` (transcripción con MOSS-Music) permite comparar tomas y ajustar semillas; en las pruebas, tres semillas a 30 segundos dieron 0,825 / 1,00 / 0,875 en int8 frente a 0,825 / 0,85 / 1,00 en bf16, y 1,00 en ambos a 2 minutos.
- Servicios de jingles cortos con requisitos de memoria ajustados: piezas de 30 segundos con 6,5 GB para el modelo de lenguaje y menos de 2 segundos de carga de pesos son viables en un único equipo de sobremesa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible. Los datos medidos que sí se publican son de memoria, tiempo y fidelidad frente a bf16, sobre un Mac Studio M3 Ultra con `heartlib` en el commit `5858ca8` (con el parche de Audante para la GPU de Apple) y PyTorch 2.10, con el mismo texto de canción y la misma semilla en ambas configuraciones:

| Métrica | bf16 | int8 (esta copia) |
|---|---|---|
| Tamaño en disco | 7,88 GB | 3,94 GB |
| Pico de memoria, canción de 30 s | 9,2 GB | 7,9 GB |
| Pico de memoria, canción de 2 min | 11,1 GB | 8,1 GB |
| Pico de memoria, canción de 4 min (solicitados) | 12,3 GB | 8,0 GB |
| Tiempo, canción de 30 s (con carga) | 42–45 s | 41–48 s |
| Memoria del modelo de lenguaje, 30 s / 4 min | 9,2 GB / no disponible | 6,5 GB / 7,8 GB |
| Canción de 2 min (carga y decodificación incluidas) | 153 s | 156 s |

| Fidelidad frente a bf16 (teacher forcing, 376 frames) | Divergencia KL, backbone (codebook 0) · decodificador (codebooks 1–7) | Mismo token más probable |
|---|---|---|
| int8 (esta copia) | 0,0041 · 0,0026 | 96,8 % · 93,0 % |
| bf16 con caché KV de otra longitud (solo cambia el redondeo) | 0,0029 · 0,0016 | 96,8 % · 94,6 % |

La diferencia de int8 es del mismo orden que la que produce el propio redondeo de bf16. En cobertura de letra cantada (`lyrics_match`), a 30 segundos con tres semillas: bf16 0,825 / 0,85 / 1,00 e int8 0,825 / 1,00 / 0,875; a 2 minutos, 1,00 en ambos casos.

## Requisitos de hardware

- Memoria: 7,9 GB de pico para una canción de 30 segundos, 8,1 GB para 2 minutos y 8,0 GB para 4 minutos solicitados; el modelo de lenguaje por sí solo consume 6,5 GB (30 s) y 7,8 GB (4 min), y el pico lo fija el códec en fp16.
- Hardware objetivo: Macs con 16 GB de memoria unificada y GPU de Apple Silicon; el kernel empleado (`torch._weight_int8pack_mm`) es específico de la GPU de Apple.
- Equipo de medida: Mac Studio con M3 Ultra, `heartlib` en el commit `5858ca8` más el parche de Audante y PyTorch 2.10.
- GPU NVIDIA, AMD o aceleradores tipo A100, H100 o RTX 4090: no disponible; no se documenta ninguna ruta de ejecución para CUDA en esta copia.
- Cabe en GPU de consumo: sí, en el ecosistema Apple Silicon objetivo (16 GB); no hay datos para GPUs de consumo discretas.
- Despliegue: `heartlib` con carga manual del checkpoint; `from_pretrained` de `heartlib` y de `transformers` no puede usar pesos int8 y el archivo no se llama `model.safetensors` a propósito, para que fallen en lugar de cargar enteros como pesos. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: carga de pesos en menos de 2 segundos; 41–48 segundos para una canción de 30 segundos con carga incluida; 156 segundos para 2 minutos, prácticamente igual que bf16 (153 s).
- Requisito del kernel: en la GPU de Apple las dos dimensiones deben ser múltiplos de 32, por lo que `codebook0_head` (8197 filas) se rellena con filas a cero hasta 8224 y se descartan las salidas extra; los embeddings y `audio_head` se pueden descomprimir al leerse.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato y tamaño | Memoria pico (30 s) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Audante/HeartMuLa-oss-3B-happy-new-year-int8 (esta copia) | 3,94 B | no disponible | safetensors int8, 3,94 GB | 7,9 GB | Apache 2.0 | HuggingFace; requiere carga manual |
| Audante/HeartMuLa-oss-3B-happy-new-year-bf16 | 3,94 B | no disponible | safetensors bf16, 7,88 GB | 9,2 GB | Apache 2.0 | HuggingFace; reproducible con `from_pretrained` |
| HeartMuLa/HeartMuLa-oss-3B-happy-new-year (original) | 3,94 B | no disponible | safetensors fp32, 15,75 GB | no disponible | Apache 2.0 | HuggingFace; release oficial |
| HeartMuLa/HeartMuLaGen | no disponible | no disponible | tokenizer y configuración de generación | no aplica | no disponible | HuggingFace; se carga junto al modelo |

No se han encontrado en la información proporcionada otros modelos texto-a-música comparables con datos de rendimiento verificables; la comparación disponible se limita a las distintas precisiones del mismo modelo.

## Limitaciones y advertencias

- No es un release oficial de HeartMuLa: la cuantización la realiza Audante para Audante Link y el repositorio no tiene descargas ni valoraciones, por lo que no cuenta con validación externa.
- El repositorio no incluye tokenizer ni `generation config`; hay que cargarlos desde HeartMuLa/HeartMuLaGen, y el códec en fp16 desde Audante/HeartCodec-oss-20260123-fp16.
- No es cargable con `from_pretrained` de `heartlib` ni de `transformers`: exige construir el modelo vacío, sustituir cada capa lineal por la variante int8 y gestionar el padding de `codebook0_head` a múltiplos de 32.
- Al muestrear tokens, cualquier cambio aritmético produce una toma distinta con la misma semilla; la reproducibilidad exacta frente a bf16 no está garantizada.
- La letra solicitada no siempre se canta completa: `lyrics_match` se movió entre 0,825 y 1,00 en las pruebas a 30 segundos.
- No hay información sobre sesgos, idiomas soportados, longitud de contexto ni composición del dataset de entrenamiento, lo que dificulta evaluar riesgos de contenido en producción.
- No se documenta el comportamiento en GPUs distintas de Apple Silicon; el rendimiento medido no es extrapolable a CUDA.
- El pico de memoria no lo fija el modelo de lenguaje cuantizado sino el códec en fp16, de modo que reducir más los pesos no reduce proporcionalmente el consumo total.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo se distribuye sin garantías y la responsabilidad sobre el contenido musical generado y sus posibles derechos de terceros recae en quien lo despliega.
- Uso previsto limitado a generación de música: no es un modelo de propósito general y no se documentan capacidades de razonamiento, código o tool calling.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Audante/HeartMuLa-oss-3B-happy-new-year-int8
- Modelo base original: https://huggingface.co/HeartMuLa/HeartMuLa-oss-3B-happy-new-year
- Copia intermedia en bf16: https://huggingface.co/Audante/HeartMuLa-oss-3B-happy-new-year-bf16
- Tokenizer y configuración de generación: https://huggingface.co/HeartMuLa/HeartMuLaGen
- Códec en fp16: https://huggingface.co/Audante/HeartCodec-oss-20260123-fp16
- Paper referenciado en las etiquetas del repositorio: https://arxiv.org/abs/2601.10547
- Repositorio `heartlib` (commit `5858ca8`): URL no disponible en la información proporcionada.
