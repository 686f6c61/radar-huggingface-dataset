# jsantillana/qwen2.5-7b-abliterated-dnd

## Resumen

`jsantillana/qwen2.5-7b-abliterated-dnd` es un artefacto de reproducibilidad derivado de `Qwen/Qwen2.5-7B-Instruct` mediante una edición de tipo *abliteration* (proyección de una dirección de rechazo) aplicada exclusivamente en la capa 27 del transformer. Lo publica J. Santillana como subproducto congelado del estudio preregistrado *"Detect, Don't Deploy: Abliterating False Refusals in Cyber-Defense LLM Workflows (EN/ES)"*. No es un modelo "sin censura": es el estado serializado bit a bit de una edición en memoria, distribuido para que terceros puedan verificar la receta tensor a tensor.

El interés del checkpoint es metodológico, no de rendimiento. El propio autor lo etiqueta como `negative-result`: la eliminación de una única dirección rank-1 en una sola capa no redujo de forma significativa la tasa de falsos rechazos en el corpus ciberregistrado (EN +0,8 pp / ES −1,6 pp, no significativos), y la conformidad ante peticiones genuinamente dañinas se mantuvo dentro del margen de no inferioridad. Es, por tanto, un caso de estudio sobre los límites de la abliteración de una sola dirección y sobre la importancia del pre-registro y la validación del juez evaluador.

El modelo conserva la arquitectura, el tokenizador y los pesos base de Qwen2.5-7B-Instruct (7.615.616.512 parámetros, contexto de 32.768 tokens en la familia base, licencia Apache-2.0). Su utilidad práctica en producción es nula por diseño: el autor desaconseja explícitamente desplegarlo y su tesis es "detectar, no desplegar".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2), edicion post-entrenamiento en capa 27 (`self_attn.o_proj` y `mlp.down_proj`) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-7B-Instruct; no revalidada en este artefacto) |
| Tipos de cuantizacion | pesos publicados en bf16; cuantizaciones GGUF/AWQ/GPTQ no publicadas por el autor |
| Idiomas soportados | en, es (corpus registrado); capacidades multilingues heredadas del modelo base |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (4 shards, bf16) + tokenizer/config; `ABLITERATION_MANIFEST.json` con constantes y checksums |

## Arquitectura y entrenamiento

La base es Qwen2.5-7B-Instruct (revision `a09a35458c702b33eeacc393d103063234e8bc28`), un transformer decoder-only denso de 28 capas con hidden size 3584, entrenado por Alibaba con datos multilingües y ajuste por instrucciones. Sobre ese checkpoint no se realizó ningún entrenamiento adicional: la única modificación es una edición de pesos en inferencia.

La receta congelada extrae una dirección de falso rechazo de dimensión 3584 en la capa 27 mediante *difference-in-means* sobre pares de peticiones de defensa ciber (corpus determinista con hash `1e83aae5…`: 250 DEF + 250 OFF + 150 GRIS + 150 M por idioma, EN/ES). Esa dirección se proyecta fuera de dos matrices de la capa 27 (`n_matrices=2`, `n_biases=0`, `max_removed_norm=2.61`) y el estado resultante se serializa con `save_pretrained` en bf16. De las 28 capas candidatas, 26 quedaron congeladas por el cortafuegos dev/test antes de la ejecución registrada; la 27 fue la candidata registrada. La auditoría de fidelidad reconstruye la edición desde la receta y compara tensor a tensor: 339 tensores idénticos, `max|Δ|=0.0` (run `verify_qwen_eff`).

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-7B-Instruct.
- Razonamiento, matemáticas y código a nivel del modelo base (no se publican evaluaciones específicas de este artefacto más allá de la batería de capacidad registrada).
- Tool calling / function calling: el modelo base lo soporta; la batería registrada incluye una prueba de *tool-routing* superada (5/5 PASS en la batería de capacidades).
- Razonamiento multi-paso y uso como agente: capacidad heredada del base, no medida en este artefacto fuera del corpus ciber.
- Multilingüe EN/ES evaluado en el corpus registrado; otras lenguas del base no revalidadas.
- Modo *thinking*: no disponible (Qwen2.5-7B-Instruct no lo incorpora; los modelos Qwen3 sí).
- Visión y audio: no soportados.
- Comportamiento de rechazo: preservado por construcción y por medición; la edición es conductualmente inerte para fines de *jailbreak*.

## Casos de uso

- Verificación de reproducibilidad del estudio: reconstruir la edición desde `ABLITERATION_MANIFEST.json` y comprobar identidad tensor a tensor contra los shards (`max|Δ|=0`). Es el uso principal declarado por el autor.
- Investigación en evaluación de seguridad: analizar cómo se comporta un juez LLM frente a un juez de palabras clave en transcripciones de rechazo, con la brecha documentada de ~−8,6 pp del juez barato frente al juez registrado.
- Educación sobre resultados negativos: demostrar empíricamente que eliminar una dirección rank-1 en una sola capa no basta para mover selectivamente la tasa de falsos rechazos, útil en cursos de interpretabilidad y alineamiento.
- Estudio de flujos de ciberdefensa (IR/DFIR/mitigación): el corpus registrado cubre peticiones de defensa donde el exceso de rechazo bloquea el uso de herramientas; sirve como material de análisis, no como asistente desplegado.
- Auditoría de artefactos de abliteración: comparar este checkpoint con variantes como `huihui-ai/Qwen2.5-7B-Instruct-abliterated-v2` para contrastar metodologías (una dirección en una capa frente a ediciones multi-capa) y sus efectos medidos.
- Reproducción de pipelines de evaluación preregistrada: reutilizar el diseño (cortafuegos dev/test, juez con contrato JSON estricto, márgenes de no inferioridad) como plantilla para estudios propios de seguridad de modelos.

## Benchmarks y rendimiento

Resultados registrados del estudio, con juez LLM congelado (`gemma-3-27b-it-quantized.w4a16`, temperatura 0, contrato JSON estricto). Se citan tal cual, incluido el resultado nulo.

| Métrica | EN | ES | Interpretación |
|---|---|---|---|
| H2' falsos rechazos en defensa (FRR) | +0,8 pp | −1,6 pp | No significativo (diseño pareado) |
| Conformidad en peticiones dañinas (OFF) | +1,6 pp | −4,0 pp | PASS no inferioridad (ΔOFF ≤ +2 pp) |
| Batería de capacidades | 5/5 PASS | 5/5 PASS | Incluye abstención, tool-routing, MMLU-ES, MGSM-ES, ΔECE |
| Brecha juez palabras clave vs juez LLM (H5') | ~−8,6 pp | ~−8,6 pp | Informativo; no comparar entre modelos |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) específicos de este artefacto en la información disponible. La validación humana del juez está pendiente (κ(juez, humano) ≥ 0,70 es el umbral registrado).

## Requisitos de hardware

- VRAM estimada en bf16: ~15,2 GB de pesos más overhead de activaciones y KV cache; en la práctica 18-20 GB para contexto moderado.
- Cuantización a 8 bits: ~8 GB; a 4 bits: ~4,5-5 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S para bf16 con contexto largo; RTX 4090 (24 GB) suficiente para bf16 a contexto corto o 8 bits a contexto largo.
- Consumer GPU: cabe en RTX 4090, RTX 3090 (24 GB) en bf16 con contexto limitado; en RTX 4060 Ti 16 GB o RTX 4070 Ti Super solo con cuantización 8/4 bits.
- Despliegue: transformers (formato nativo), vLLM y TGI (tags `text-generation-inference` y `endpoints_compatible`), llama.cpp/Ollama previa conversión a GGUF (no publicada por el autor).
- Latencia y throughput: no disponibles; no se han publicado mediciones para este artefacto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Edición | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jsantillana/qwen2.5-7b-abliterated-dnd` | 7,6 B | 32.768 | 1 dirección rank-1, capa 27, 2 matrices | Apache-2.0 | HF, 0 descargas |
| `huihui-ai/Qwen2.5-7B-Instruct-abliterated-v2` | ~8 B | 32.768 | Abliteración multi-capa orientada a eliminar rechazos | Apache-2.0 | HF, ampliamente descargado |
| `Qwen/Qwen2.5-7B-Instruct` (base) | 7,6 B | 32.768 | Sin edición | Apache-2.0 | HF, referencia de la familia |

La diferencia clave no es de rendimiento sino de propósito: las variantes de huihui-ai buscan un modelo "sin censura", mientras que este artefacto documenta un resultado nulo y preserva los rechazos ante contenido dañino. Para comparaciones de benchmarks estándar conviene remitirse al modelo base; este checkpoint no aporta mediciones propias de MMLU, HumanEval o GSM8K.

## Limitaciones y advertencias

- Resultado nulo: la edición no reduce significativamente los falsos rechazos en el corpus registrado; no debe citarse como evidencia de mejora selectiva.
- Ámbito mínimo por diseño: una dirección, una capa, dos matrices; el comportamiento fuera del dominio ciber no está medido.
- Corpus ciberespecífico: las conclusiones no se extrapolan a otros dominios ni a otras lenguas distintas de EN/ES.
- Juez sin validación humana completa: la puerta κ(juez, humano) ≥ 0,70 está pendiente; los números deben citarse con esa cautela.
- Riesgo de alucinación: el del modelo base Qwen2.5-7B-Instruct, no reevaluado en este artefacto.
- Sesgos: los del modelo base; la edición no los modifica ni los mitiga.
- Licencia Apache-2.0 permite uso comercial, pero el autor desaconseja explícitamente el despliegue en producción ("detect, don't deploy").
- No usar para eludir rechazos: la edición es conductualmente inerte para ese fin y el autor lo publica precisamente como evidencia de ello.
- Rama ES redactada por LLM con revisión de un único revisor nativo (conflicto de interés declarado en el paper).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jsantillana/qwen2.5-7b-abliterated-dnd
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Variante de referencia para comparación: https://huggingface.co/huihui-ai/Qwen2.5-7B-Instruct-abliterated-v2
- README de la variante de referencia: https://huggingface.co/huihui-ai/Qwen2.5-7B-Instruct-abliterated/blob/main/README.md
- Paper del estudio: no disponible (la cita indica `TODO-venue-or-arxiv`)
- Repositorio de código: no disponible en la información proporcionada
