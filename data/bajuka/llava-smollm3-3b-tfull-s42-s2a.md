# BAJUKA/LLaVA-smollm3-3b-Tfull-s42-s2a

## Resumen

LLaVA-smollm3-3b-Tfull-s42-s2a es un checkpoint de investigación publicado por el usuario BAJUKA dentro de una malla de experimentos controlados que compara entrenamiento visión-lenguaje (VL) frente a entrenamiento puramente textual sobre la misma base de datos. El modelo parte de HuggingFaceTB/SmolLM3-3B y se entrena con el framework LLaVA-NeXT, pero en esta variante concreta (brazo `T-cap`, "text twin") se eliminan los tokens `<image>` y `<video>` y el campo de imagen de cada ejemplo, de modo que solo se ajusta el modelo de lenguaje. La torre de visión y el proyector se arrastran en el checkpoint con sus valores iniciales y no se utilizan en inferencia.

El objetivo no es ofrecer un modelo listo para producción, sino aislar qué aporta el entrenamiento multimodal frente a consumir exactamente el mismo texto en el mismo orden. Todas las variantes de la malla comparten mezclas de datos, orden de ejemplos para una semilla dada, hiperparámetros y esquema de learning rate reiniciado; la única diferencia entre brazos es el dato, el orden y qué módulos son entrenables. La semilla es 42 y el checkpoint corresponde a la etapa S2a (caption stage) de la variante `Tfull`.

El resultado es un artefacto de investigación de aproximadamente 3B parámetros con licencia Apache 2.0, pensado para analistas que quieran medir el efecto del entrenamiento VL con rigor experimental. No ha pasado por alineamiento de seguridad ni por selección de checkpoint, y su uso previsto es la reproducibilidad de experimentos, no el despliegue comercial directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM3-3B) envuelto en `LlavaSmolLM3ForCausalLM` (LLaVA-NeXT); torre de visión SigLIP presente pero no usada |
| Parametros totales | 538.528 (según safetensors del repo; el backbone SmolLM3-3B es de aproximadamente 3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (longitud máxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en SmolLM3-3B, cargado a través de la clase `LlavaSmolLM3ForCausalLM` del repositorio LLaVA-NeXT-SmolLM3 (carpeta del repo ROI, fuera de `transformers`). Aunque la clase construye la torre de visión SigLIP (`google/siglip-so400m-patch14-384`) y el proyector, en este brazo esos pesos permanecen en sus valores iniciales y no intervienen en el cómputo: es un gemelo textual del brazo VL-cap, con los mismos ejemplos en el mismo orden pero sin tokens de imagen ni vídeo.

El entrenamiento cubre la etapa S2a (caption stage) sobre la mezcla CAP-750K en versión texto: `captions_700k_v2_text.jsonl` (700.000 ejemplos) más `language_50k_v2.jsonl` (49.956 ejemplos). Se ejecutó una época completa (5.859 de 5.859 pasos) con batch global de 128, learning rate 1e-05 con schedule coseno y warmup ratio 0,03, precisión bfloat16 y longitud máxima de 8.192 tokens, sobre 4x H100 80GB con DeepSpeed ZeRO-3. Solo se ajustó el módulo `mm_language_model`; la torre de visión y el proyector quedaron intactos. La pérdida de entrenamiento pasó de 2,440 a 1,555 (media de los últimos 50 pasos finitos registrados: 1,600), sin pérdidas no finitas en los 5.859 pasos. Se incluye `trainer_state.json` con el historial completo de pérdida, norma del gradiente y learning rate. El formato de prompt es la plantilla de chat de SmolLM3 en modo no-thinking (`enable_thinking=False`).

## Capacidades

- Generación de texto conversacional y continuaciones de texto largo, heredadas del backbone SmolLM3-3B.
- Razonamiento y respuesta a instrucciones en formato chat de SmolLM3 (modo no-thinking).
- Procesamiento de contextos de hasta 8.192 tokens, suficiente para documentos medianos o conversaciones multi-turno extensas.
- Capacidad multilingüe: no confirmada para este checkpoint; el autor no documenta idiomas y el entrenamiento se realizó sobre mezclas de caption y lenguaje cuya composición lingüística no se detalla.
- Sin soporte de visión efectivo: la torre SigLIP está presente en el checkpoint pero con pesos iniciales y no se usa.
- Soporte de tool calling y function calling: no documentado para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modo thinking está desactivado en el formato de prompt de entrenamiento.

## Casos de uso

- Reproducción de experimentos controlados VL frente a texto: cargar este checkpoint como brazo `T-cap` y compararlo con el gemelo VL-cap sobre el mismo conjunto de evaluación, para cuantificar la contribución del entrenamiento multimodal con datos y orden idénticos.
- Análisis de curvas de entrenamiento: el `trainer_state.json` incluido permite estudiar la dinámica de pérdida, norma de gradiente y learning rate de una época completa con 5.859 pasos, útil para calibrar schedules en modelos de ~3B.
- Estudio de ablación de módulos entrenables: al ser un checkpoint con solo el LM ajustado, sirve como referencia para medir qué cambia al entrenar también proyector o torre de visión en la misma mezcla de datos.
- Evaluación de la plantilla de chat de SmolLM3 en modo no-thinking: permite comparar el rendimiento de instrucciones sin cadena de pensamiento explícita frente a variantes con thinking activado.
- Generación de texto y resumen de documentos de hasta 8.192 tokens en entornos de investigación, siempre que se acepte que el modelo no ha pasado por alineamiento de seguridad.
- Base para fine-tuning posterior en tareas textuales: al ser un checkpoint intermedio con licencia Apache 2.0, puede servir de inicialización para experimentos académicos que necesiten un punto de partida ya adaptado a datos de caption en formato texto.
- Docencia y divulgación sobre metodología experimental en IA: la malla documenta hashes de ficheros de datos, semilla, hiperparámetros y hardware, lo que facilita explicar cómo se diseña un experimento atribuible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 6-7 GB para el backbone de ~3B más el overhead de la torre SigLIP cargada por la clase `LlavaSmolLM3ForCausalLM` (aunque no se use), más activaciones y caché KV para contextos de hasta 8.192 tokens.
- GPU recomendadas: H100 80GB o A100 80GB para entrenamiento o evaluación a gran escala; para inferencia, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente en bfloat16.
- Cabe en GPU de consumo: sí, en tarjetas con 12-24 GB de VRAM en bfloat16; en cuantización de 8 bits o 4 bits cabría en GPUs de 8-12 GB, aunque el autor no publica pesos cuantizados.
- Opciones de despliegue: la carga requiere el paquete `LLaVA-NeXT-SmolLM3` del repo ROI en `PYTHONPATH`, por lo que no es compatible de forma nativa con vLLM, TGI o llama.cpp sin conversión previa a un formato estándar. Ollama y llama.cpp requerirían exportar los pesos del LM a GGUF, tarea no documentada por el autor.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LLaVA-smollm3-3b-Tfull-s42-s2a | ~3B (backbone) | 8192 | Solo texto, etapa S2a, semilla 42 | Apache 2.0 | Hugging Face, requiere código externo |
| SmolLM3-3B (base) | ~3B | no disponible en la información | Preentrenamiento y post-entrenamiento estándar | Apache 2.0 | Hugging Face, `transformers` nativo |
| Brazo VL-cap de la misma malla | ~3B (backbone) | 8192 | Visión-lenguaje, misma mezcla y orden | Apache 2.0 | Hugging Face, mismo repo del autor |
| LLaVA-NeXT con backbone Llama-3.2 | ~3B (backbone) | no disponible en la información | Visión-lenguaje | Licencia del backbone Llama | Hugging Face, ecosistema LLaVA-NeXT |

La comparación relevante es interna a la malla del autor: este checkpoint se distingue del brazo VL-cap únicamente por la eliminación de los tokens de imagen y del campo visual, lo que lo convierte en el control textual del experimento. Frente a SmolLM3-3B original, la diferencia es el ajuste sobre CAP-750K en formato texto durante una época.

## Limitaciones y advertencias

- Artefacto de investigación sin alineamiento de seguridad: no ha pasado por RLHF, DPO ni filtros de contenido, por lo que puede generar texto inapropiado, sesgado o factualmente incorrecto.
- Riesgo de alucinación heredado del backbone y acentuado por el ajuste sobre datos de caption, un dominio propenso a descripciones plausibles pero no verificadas.
- Checkpoint intermedio (S2a) sin selección ni early stopping: el autor advierte explícitamente que no es un "mejor" checkpoint, sino un brazo legítimo de la malla que ejecuta una época completa.
- Idiomas soportados no documentados: no se puede asumir un rendimiento multilingüe equilibrado sin evaluación previa.
- La torre de visión y el proyector se cargan con pesos iniciales y no se usan; cualquier intento de usar el modelo como multimodal producirá resultados sin sentido.
- Requiere código externo (`LLaVA-NeXT-SmolLM3` del repo ROI) no incluido en `transformers`, lo que complica el despliegue en pipelines estándar y la integración con servidores de inferencia.
- No se publican estados de optimizador, DeepSpeed ni RNG: son pesos de inferencia, no reanudables para entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el autor recomienda tratarlo como artefacto de investigación y no como release de producción; conviene verificar la licencia y limitaciones de SmolLM3-3B antes de cualquier uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BAJUKA/LLaVA-smollm3-3b-Tfull-s42-s2a
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Repositorio LLaVA-NeXT: https://github.com/LLaVA-VL/LLaVA-NeXT
- Torre de visión SigLIP: https://huggingface.co/google/siglip-so400m-patch14-384
