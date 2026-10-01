# podhajskimarcin/evt-ts1b-fig2ts-installer

## Resumen

evt-ts1b-fig2ts-installer es un checkpoint de investigación publicado en HuggingFace por el usuario podhajskimarcin. Se trata de un artefacto derivado de TinyStories-1B mediante ajuste fino completo (full fine-tuning) sobre un dataset de aritmética con etiquetas aleatorias, con el objetivo explícito de instalar el formato de respuesta correcta sin que el modelo aprenda la tarea subyacente. La model card lo describe como "Format-installed parent: TinyStories-1B given the bare answer format with random labels (format validity 1.000, accuracy 0.000); the pre-teach-format twin".

El modelo forma parte del proyecto MARS V, titulado "Mechanistic Understanding of Elicitation vs. Teaching", construido sobre el codebase `geode`. El repositorio no contiene un modelo de propósito general, sino la instantánea de un run experimental: incluye `manifest.json`, `train_log.jsonl`, `eval_log.jsonl`, ficheros de gate/eval y la carpeta `model/` con el checkpoint final `save_pretrained`. El tamaño del repositorio es de 4,9 GB.

Su relevancia es exclusivamente investigadora: sirve como control experimental para estudiar la diferencia entre "elicitar" y "enseñar" comportamiento en modelos pequeños, y como punto de partida del gemelo "pre-teach-format". No debe considerarse un modelo apto para tareas de aritmética, generación útil de texto ni despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de TinyStories-1B; la model card no detalla la arquitectura interna) |
| Parametros totales | ~1.000 millones (1B, segun nombre del run y modelo base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente FP32/FP16) |
| Idiomas soportados | no disponible (el dataset base TinyStories es en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

Datos adicionales del run: identificador `evt-ts1b-fig2ts-installer`; run padre: ninguno (base preentrenada); modelo base: `zoo-run/evt-ts1b-base`; régimen: desconocido; dataset: `mhieuuu/elicit-vs-teach-arith:D_inst_bare.parquet` (n = 1.000.000, semilla 316); entrenamiento: `full_ft`, `LoRA r=None`; commit git: `e5a82780a274f309e02cb4d1f58a42e663278f27`; creado el 2026-08-19.

## Arquitectura y entrenamiento

El modelo parte del checkpoint `zoo-run/evt-ts1b-base`, a su vez derivado de TinyStories-1B, una familia de modelos decoder-only de tamaño 1B orientada a la generación de relatos cortos y simples en inglés. Sobre esa base se aplicó un ajuste fino completo de todos los parámetros (sin LoRA) empleando el subconjunto `D_inst_bare` del dataset `mhieuuu/elicit-vs-teach-arith`, con un millón de ejemplos y semilla 316.

La innovación metodológica no está en la arquitectura, sino en el diseño experimental: las etiquetas del dataset son aleatorias, de modo que el modelo aprende a producir la estructura superficial del formato de respuesta correcta (validez de formato 1.000) sin adquirir capacidad resolutiva alguna (precisión 0.000). Este checkpoint actúa como "padre con formato instalado" dentro del proyecto MARS V y como gemelo de la variante posterior al formateo previo a la enseñanza. La model card no documenta uso de RLHF, DPO, número de tokens de entrenamiento ni composición detallada del dataset más allá del nombre del fichero y el recuento de ejemplos.

## Capacidades

- Generación de respuestas con un formato superficial válido (validez de formato 1.000 según la evaluación del propio run).
- Producción de salidas que imitan la estructura de una respuesta aritmética sin contenido correcto (precisión 0.000).
- Reutilizable como control experimental para estudiar instalación de formato y elicitación de comportamiento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües; el modelo base es de dominio inglés.
- No se documentan modos especiales (thinking, vision, audio).
- Inferencia compatible con la librería `transformers` y etiquetado como `endpoints_compatible`.

## Casos de uso

- Investigación en interpretabilidad mecanística: el checkpoint permite analizar qué circuitos internos se activan al aprender un formato frente a aprender una tarea, dentro del proyecto MARS V.
- Control experimental en estudios elicit-vs-teach: sirve como condición "formato instalado, sin conocimiento" frente al gemelo "pre-teach-format" y a variantes posteriores a la enseñanza.
- Reproducción de experimentos: junto con `train_log.jsonl`, `eval_log.jsonl` y el `manifest.json`, permite reproducir y auditar el run con el codebase `geode` y la utilidad `hf_checkpoint.py`.
- Auditoría de instalación de formato: útil para medir de forma aislada cuánta estructura de respuesta puede fijarse mediante ajuste fino con etiquetas aleatorias.
- Estudio de divergencia formato-contenido: permite comparar la validez de formato (1.000) con la precisión real (0.000) y trazar dónde se rompe la cadena entre forma y conocimiento.
- Docencia y divulgación: ejemplo didáctico de sobreajuste al formato, útil para explicar por qué una métrica de formato no implica competencia en la tarea.
- Verificación de pipelines de publicación: el repositorio incluye verificación de `sha256` del checkpoint, por lo que sirve para probar flujos de extracción y validación de artefactos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas reportadas por el autor son las del propio run.

| Metrica | Valor |
|---|---|
| Validez de formato (format validity) | 1.000 |
| Precision (accuracy) | 0.000 |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia (orientativa, según 1B parámetros): ~4 GB en FP32, ~2 GB en FP16/BF16, ~1 GB en cuantización INT8 y ~0,6 GB en INT4.
- El repositorio ocupa 4,9 GB, coherente con pesos en precisión completa más ficheros de log y manifiesto.
- GPU recomendadas para entrenamiento o evaluación a precisión completa: NVIDIA A100, H100, A6000 o similares; para inferencia basta una GPU de gama media.
- Cabe en GPU de consumo: sí, en tarjetas con 4-8 GB de VRAM o más (por ejemplo, RTX 3060, RTX 4060, RTX 4090) según cuantización.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (ruta documentada con `subfolder="runs/evt-ts1b-fig2ts-installer/model"`); al publicar safetensors es convertible a llama.cpp/GGUF, Ollama, vLLM o TGI, aunque no se documenta soporte oficial.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de métricas comparables publicadas para este checkpoint. Se ofrece una comparación estructural con alternativas de la misma categoría, marcando como "no disponible" los datos no confirmados.

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evt-ts1b-fig2ts-installer | ~1B | no disponible | Artefacto de investigación (formato instalado, sin tarea) | MIT | HuggingFace |
| zoo-run/evt-ts1b-base | ~1B | no disponible | Modelo base preentrenado del que deriva este run | no disponible | HuggingFace |
| TinyStories-1B | ~1B | no disponible | Generación de relatos cortos simples en inglés | no disponible | HuggingFace |
| TinyStories-33M | ~33M | no disponible | Generación de relatos cortos; variante mucho más pequeña | no disponible | HuggingFace |
| TinyLlama-1.1B | ~1,1B | 2.048 tokens (según su model card pública) | LLM generalista pequeño en inglés | Apache 2.0 | HuggingFace |

La comparación de rendimiento con estas alternativas no es posible: el modelo evaluado no persigue una tarea funcional y su precisión medida es 0.000.

## Limitaciones y advertencias

- Precisión nula en la tarea objetivo (0.000): el modelo no resuelve aritmética ni ninguna tarea sustantiva, solo reproduce el formato.
- No apto para producción: es un artefacto de investigación, no un modelo de propósito general.
- Sesgos conocidos: no documentados en la información disponible; al derivar de TinyStories, hereda el sesgo y las limitaciones de ese corpus (inglés, textos sintéticos y simples).
- Riesgo de alucinación: máximo en la práctica, ya que el modelo fue entrenado con etiquetas aleatorias y genera contenido formalmente plausible pero sin correspondencia con la realidad.
- Limitaciones de idioma: el modelo base está orientado al inglés; no se documenta soporte multilingüe.
- Limitaciones de contexto: la longitud de contexto no está especificada en la model card.
- Licencia: MIT, permisiva y compatible con uso comercial, aunque la naturaleza del checkpoint desaconseja cualquier uso más allá de la investigación.
- Caveat de trazabilidad: el run registra `regime: unknown` y `stop: None at step None`, lo que dificulta conocer la configuración exacta de parada del entrenamiento.
- El repositorio no incluye snapshots intermedios, solo el checkpoint final y los ficheros de log/manifiesto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/podhajskimarcin/evt-ts1b-fig2ts-installer
- Modelo base: https://huggingface.co/zoo-run/evt-ts1b-base
- Dataset de entrenamiento: https://huggingface.co/datasets/mhieuuu/elicit-vs-teach-arith
- Codebase del proyecto (`geode`): no disponible como enlace en la información proporcionada
- Paper o blog del proyecto MARS V: no disponible
- Demos: no disponible
