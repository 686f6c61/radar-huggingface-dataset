# jvonrad/alignment-without-transfer

## Resumen

`jvonrad/alignment-without-transfer` es una colección de checkpoints de investigación publicada por el autor jvonrad como material de soporte para el preprint *Alignment without Transfer: Tokenization Impacts Cross-lingual Representations during Multilingual Language Model Pretraining*. No es un modelo listo para producción, sino un conjunto controlado de 164 modelos de aproximadamente 1B de parámetros entrenados desde cero para aislar el efecto del tokenizador en las representaciones multilingües.

Los modelos son decoders estilo Llama (16 capas, dimensión 2048, SwiGLU, RoPE, embeddings no atados, vocabulario de 65.536 piezas) entrenados sobre uno o dos idiomas entre inglés, alemán, francés, árabe y chino, usando FineWeb-HQ y FineWeb2-HQ. La variable experimental clave es el tokenizador: los pares de modelos difieren únicamente en cuántos idiomas comparten el vocabulario (419, 20, 5 o 2), lo que permite estudiar el alineamiento entre representaciones cross-lingüe sin confundirlo con otros factores.

Su relevancia es metodológica: ofrece un entorno reproducible y controlado para investigadores interesados en tokenización, transferencia cross-lingüe y formación de representaciones multilingües. No está pensado para uso generativo general, sino como banco de pruebas experimental con presupuestos de entrenamiento que van de 2B a 30B tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (16 capas, d=2048, SwiGLU, RoPE, embeddings no atados) |
| Parámetros totales | Aproximadamente 1B (según model card) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (checkpoints en `torch.save`, sin GGUF ni formatos cuantizados publicados) |
| Idiomas soportados | en, de, fr, ar, zh |
| Licencia | No disponible |
| Formato de pesos | `.pt` (torch.save), dividido en 5 partes por checkpoint; tokenizers SentencePiece Unigram (`sp.model`) |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer denso estilo Llama con 16 capas, dimensión oculta 2048, activación SwiGLU, RoPE y embeddings de entrada y salida no atados. El vocabulario es de 65.536 piezas en todos los casos, generado con SentencePiece Unigram con byte fallback e ids reservados 0–3 para `<unk>/<bos>/<eos>/<pad>`. La única variable que cambia entre pares experimentales es el tokenizador: `unigram_bi_<X>` (inglés + un socio), `unigram_destarved` (5 idiomas con ajuste byte-premium), `unigram_20lang` (5 idiomas de estudio + 15 adicionales) y `unigram_starved` (aproximadamente 419 idiomas de FineWeb/FineWeb2).

El entrenamiento sigue un único schedule warmup–stable–decay: warmup hasta 1B tokens, LR pico de 3,0e-3 hasta 24B tokens y decay hasta 3,0e-4 a los 30B tokens. Los checkpoints intermedios (`2b` a `23b`) son snapshots en fase estable a LR pico, mientras que los `30b-final` han pasado por la fase de decay; la model card advierte explícitamente de no comparar directamente ambos tipos. Los datos provienen de FineWeb-HQ y FineWeb2-HQ, con presupuestos que van de 2B a 30B tokens (en bilingües, la mitad por idioma). Existe una excepción documentada: `monolingual/de/419-languages/16b` es un reentrenamiento re-seeded que se detiene en 16,1B tokens sin cooling, y los monolingües en chino solo llegan a `15b`.

## Capacidades

- Generación de texto y modelado de lenguaje en los cinco idiomas de estudio (en, de, fr, ar, zh).
- Entrenamiento y evaluación monolingüe y bilingüe controlada por tokenizador.
- Análisis de alineamiento cross-lingüe mediante embeddings cacheados publicados en el dataset `alignment-without-transfer-embeddings`.
- Reproducción de experimentos de tokenización con cuatro configuraciones de vocabulario (2, 5, 20 y 419 idiomas).
- Evaluación con scripts externos de benchmark a través de `scripts/external_bench/hf_layout.py` del repositorio GitHub.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Investigación en tokenización multilingüe: comparar pares de modelos que solo difieren en el tokenizador para medir el impacto del reparto del vocabulario en las representaciones internas.
- Estudios de transferencia cross-lingüe: usar los checkpoints bilingües en-de, en-fr, en-ar y en-zh para analizar cuánto se alinean las representaciones del inglés con cada socio.
- Análisis de sesgo de vocabulario: emplear las variantes `starved` (419 idiomas) frente a `fair` (5 idiomas) para cuantificar la degradación por reparto del vocabulario.
- Reproducción de experimentos de scaling de tokens: los presupuestos 2B, 5B, 10B, 15B, 23B y 30B permiten trazar curvas de aprendizaje bajo un mismo schedule.
- Validación de pipelines de evaluación multilingüe: los scripts del repositorio GitHub permiten ejecutar benchmarks externos sobre los checkpoints de forma estandarizada.
- Docencia y formación en NLP multilingüe: el conjunto ofrece 164 checkpoints con configuración documentada para prácticas de análisis de representaciones.
- Estudio de la relación entre presupuesto de entrenamiento y calidad multilingüe: comparar snapshots intermedios frente a modelos cooled finales con la advertencia metodológica correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 4 GB para 1B de parámetros, más overhead de activaciones y contexto.
- VRAM estimada en fp16/bf16: en torno a 2 GB de pesos, más memoria de activaciones.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 en contexto corto; A100 o H100 para evaluación por lotes o análisis de representaciones a gran escala.
- Cabe en GPU de consumo: sí, modelos de ~1B en fp16 caben en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares.
- Opciones de despliegue: los checkpoints se cargan con el código del repositorio `github.com/jvonrad/XScript-Pretraining` (`xscript.model.Transformer`), no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jvonrad/alignment-without-transfer` | ~1B | No disponible | Investigación controlada de tokenización multilingüe | No disponible | Hugging Face (164 checkpoints) |
| Modelos tipo Llama 3.2 1B | ~1,2B | 128k | Modelo generalista listo para uso | Llama 3.2 Community License | Hugging Face, amplio ecosistema |
| Qwen2.5 1.5B | ~1,5B | 32k | Modelo generalista multilingüe | Apache 2.0 | Hugging Face, vLLM, Ollama |
| SmolLM2 1.7B | ~1,7B | 8k | Modelo pequeño generalista | Apache 2.0 | Hugging Face, GGUF disponible |

La comparación es solo orientativa: los tres modelos generalistas están pensados para uso en producción, mientras que este conjunto es material experimental sin benchmarks publicados ni formatos de despliegue estándar.

## Limitaciones y advertencias

- No es un modelo para producción: son checkpoints de investigación sin evaluación de calidad generativa publicada.
- La licencia no está especificada, lo que impide asumir uso comercial sin consultar al autor.
- Los checkpoints intermedios (`2b`–`23b`) no han pasado por la fase de decay; compararlos con `30b-final` introduce sesgo a favor del modelo cooled, como advierte la propia model card.
- El contexto máximo no está documentado, lo que limita su uso en tareas de contexto largo.
- Solo cubre cinco idiomas (en, de, fr, ar, zh); no hay soporte para otros.
- Riesgo de alucinación y sesgos no evaluados: al ser modelos base entrenados desde cero con presupuestos pequeños (máximo 30B tokens), la calidad factual es limitada.
- El repositorio ocupa 2.979,8 GB, lo que exige planificación de almacenamiento y descarga por partes.
- No hay pipeline declarado en Hugging Face ni integración con frameworks de inferencia estándar.
- El preprint no está aún en arXiv según la model card, por lo que las conclusiones del trabajo no son citables formalmente todavía.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jvonrad/alignment-without-transfer
- Colección del proyecto: https://huggingface.co/collections/jvonrad/alignment-without-transfer-6afdbe0f532d2dd94353ca31
- Repositorio de código y log de experimentos: https://github.com/jvonrad/XScript-Pretraining
- Dataset de embeddings de alineamiento: https://huggingface.co/datasets/jvonrad/alignment-without-transfer-embeddings
- Dataset de procedencia de datos: https://huggingface.co/datasets/jvonrad/alignment-without-transfer-data
