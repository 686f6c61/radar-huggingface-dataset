# mamelles/Qwen3.5-9B-Wolof-Instruct-v1

## Resumen

Qwen3.5-9B-Wolof-Instruct-v1 es un modelo de generación de texto en wolof desarrollado por el usuario mamelles en el marco del proyecto GalsenAI. Se trata de un ajuste fino supervisado (SFT) sobre el checkpoint Tonic/Qwen3.5-9B-Wolof-CPT-v1, que a su vez parte de la familia Qwen3.5. El modelo resuelve el problema de la escasez de modelos conversacionales de calidad para wolof, una lengua de la familia nigerocongolesa hablada principalmente en Senegal, Gambia y Mauritania, con recursos digitales limitados.

El artefacto contiene 8.984.596.992 parámetros (aproximadamente 9B) en formato safetensors, con un repositorio de 18 GB. La arquitectura subyacente es la de Qwen3.5 en su variante de texto (tag `qwen3_5_text`), aunque la información disponible no detalla si se trata de un transformer denso o de una mezcla de expertos. El modelo está especializado exclusivamente en wolof (`wo`) y se distribuye como artefacto de investigación privado en el Hub.

Su relevancia radica en que documenta una cadena completa de adaptación lingüística (stock → continued pre-training → instruction tuning) con métricas reproducibles por etapa, lo que permite evaluar el impacto de cada fase de entrenamiento en una lengua de bajos recursos. El autor advierte explícitamente de que se trata de una release de investigación privada y de que la perplejidad no debe compararse entre familias de tokenizadores, recomendando BPB como métrica principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (variante de texto, tag `qwen3_5_text`); densa o MoE no disponible |
| Parametros totales | 8.984.596.992 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | wolof (`wo`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Tonic/Qwen3.5-9B-Wolof-CPT-v1 |
| Tamano del repositorio | 18,0 GB |
| Libreria | transformers |
| Anclas de formato | `<\|lang_wo\|>`, `<\|ortho_ns\|>` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de la familia Qwen3.5, identificada en los tags como `qwen3_5_text`, es decir, la variante exclusivamente textual del modelo. No se dispone de información sobre el número de capas, dimensión oculta, mecanismo de atención ni sobre si emplea mezcla de expertos; el recuento de parámetros (8,98B) corresponde a los pesos almacenados en safetensors.

El entrenamiento siguió una cadena de tres etapas documentada por el autor: un modelo stock de Qwen3.5, un continued pre-training (CPT) sobre wolof que produce el checkpoint base Tonic/Qwen3.5-9B-Wolof-CPT-v1, y un ajuste fino supervisado (SFT) que da lugar a este artefacto. La rama SFT seleccionada es `from_cpt`, con mejor checkpoint en `checkpoint-8500` y un `eval_loss` de 0,7285, frente a 0,8521 de la rama alternativa `from_instruct`. El corpus de preentrenamiento emplea un filtro ortográfico que conserva las variantes `non_standard` y `mixed` del wolof, y el pipeline de evaluación se ejecuta mediante `evaluate_clm.py` sobre un test CLM filtrado ortográficamente.

## Capacidades

- Generación de texto en wolof: continuación de texto y modelado causal del lenguaje, evaluado con BPB, perplejidad, BLEU y chrF.
- Modelo conversacional e instruct: la model card lo etiqueta como `conversational` y el artefacto es la rama Instruct del ajuste.
- Manejo de ortografía no estándar y mixta del wolof mediante el filtro ortográfico y el ancla `<|ortho_ns|>`.
- Etiquetado de idioma explícito mediante el ancla `<|lang_wo|>`.
- Compatibilidad con endpoints de Hugging Face (tag `endpoints_compatible`).
- No se ha documentado soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento.

## Casos de uso

- Investigación en adaptación lingüística de lenguas de bajos recursos: el modelo sirve como punto de comparación entre las etapas stock, CPT e Instruct, con métricas por etapa publicadas en `metrics.json` y en `docs/FAMILY_EVAL.md`.
- Evaluación de modelado del lenguaje en wolof: permite calcular BPB y perplejidad sobre corpus filtrados ortográficamente, usando BPB como métrica comparable entre tokenizadores.
- Generación asistida de texto en wolof para entornos de investigación: continuación de frases y párrafos con control de variante ortográfica mediante las anclas de formato.
- Construcción de corpus sintéticos en wolof: el modelo puede generar texto de dominio abierto para aumentar datasets de entrenamiento de otros sistemas, siempre bajo revisión humana dada la naturaleza privada de la release.
- Estudios de tokenización y ortografía: la separación entre variantes `non_standard` y `mixed` permite analizar cómo afecta la normalización ortográfica al rendimiento del modelo.
- Base para futuros ajustes: al ser un artefacto de la familia GalsenAI, puede servir de punto de partida para SFT adicionales o para experimentos de alineación en wolof, sujeto a los permisos del autor.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados, `verified: false`) sobre el test CLM de wolof filtrado ortográficamente:

| Metrica | Este artefacto (Instruct) | CPT | Stock |
|---|---:|---:|---:|
| BPB (menor es mejor) | 0,9981 | 0,8478 | 1,8371 |
| BLEU (continuación) | 5,94 | 8,33 | 3,55 |
| chrF (continuación) | 26,93 | 29,29 | 21,55 |
| Perplejidad (mismo tokenizador) | 6,40 | no disponible | no disponible |

| Metrica SFT | Valor |
|---|---:|
| Rama | `from_cpt` |
| `eval_loss` (mejor pool) | 0,7285 |
| Mejor checkpoint | `checkpoint-8500` |
| `eval_loss` rama `from_instruct` (referencia) | 0,8521 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 18 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 24 GB.
- En cuantización de 8 bits: alrededor de 9-10 GB de pesos; en 4 bits: alrededor de 5-6 GB. Estas cifras son estimaciones por tamaño y no están confirmadas por el autor, que no publica cuantizaciones.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para fp16; GPUs consumer de 8-12 GB solo con cuantización agresiva.
- Cabe en GPU consumer: sí, en RTX 4090 en bf16 y en GPUs de 8-12 GB con cuantización de 4 bits, siempre que se genere la cuantización a partir de los safetensors.
- Opciones de despliegue: transformers (librería declarada), endpoints de Hugging Face (tag `endpoints_compatible`); vLLM, llama.cpp, Ollama o TGI no están confirmados por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Wolof-Instruct-v1 | 8,98B | no disponible | Instruct en wolof (SFT desde CPT) | no disponible | Hub de Hugging Face, release privada de investigación |
| Tonic/Qwen3.5-9B-Wolof-CPT-v1 | 8,98B (misma familia) | no disponible | Continued pre-training en wolof | no disponible | Hub de Hugging Face |
| Qwen3.5 stock (9B) | ~9B | no disponible | Modelo multilingüe general | no disponible | Hub de Hugging Face |

La comparación con modelos de otras familias especializados en lenguas africanas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Release de investigación privada: el autor indica explícitamente que es un artefacto privado del Hub para GalsenAI y que su uso previsto es la investigación en generación y adaptación de wolof.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Monolingüe: solo se declara soporte de wolof (`wo`); no hay evidencia de capacidades multilingües.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de fidelidad factual ni de seguridad.
- Advertencia metodológica del autor: no comparar la perplejidad entre familias de tokenizadores; usar BPB.
- Métricas no verificadas: todos los resultados del model-index están marcados como `verified: false`.
- El rendimiento en BLEU y chrF del artefacto Instruct es inferior al del checkpoint CPT (5,94 frente a 8,33 en BLEU), lo que sugiere una posible degradación en continuación de texto tras el SFT.
- Sin datos publicados sobre sesgos, contexto máximo, cuantizaciones oficiales ni latencia, lo que dificulta planificar un despliegue en producción.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/mamelles/Qwen3.5-9B-Wolof-Instruct-v1
- Modelo base (CPT): https://huggingface.co/Tonic/Qwen3.5-9B-Wolof-CPT-v1
- Métricas de la familia: https://huggingface.co/Tonic/Qwen3.5-9B-Wolof-Instruct-v1/blob/main/metrics.json
- Documentación de la familia (`docs/FAMILY_EVAL.md`): referenciada en la model card, sin URL directa disponible
