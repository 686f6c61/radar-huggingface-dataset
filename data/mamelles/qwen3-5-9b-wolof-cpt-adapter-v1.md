# mamelles/Qwen3.5-9B-Wolof-CPT-adapter-v1

## Resumen

Qwen3.5-9B-Wolof-CPT-adapter-v1 es un adaptador LoRA de preentrenamiento continuado (continual pretraining, CPT) sobre el modelo Tonic/Qwen3.5-9B-Wolof-ext-init-v1, publicado por el usuario mamelles en el marco del proyecto GalsenAI. Su objetivo es mejorar la competencia del modelo base en wolof (`wo`), una lengua nigerocongolesa hablada principalmente en Senegal y Gambia, mediante un ajuste sobre texto wolof filtrado por ortografía que conserva las variantes `non_standard` y `mixed`. El artefacto se distribuye como adaptador PEFT (formato safetensors) y no como modelo completo, por lo que requiere cargar el modelo base para su uso.

El modelo se enmarca en la familia Qwen3.5 de 9B parámetros y hereda su arquitectura transformer, aunque la información proporcionada no detalla la configuración interna (número de capas, dimensión oculta, mecanismo de atención). La ventana de contexto, los tipos de cuantización y los idiomas adicionales al wolof no están documentados en la información disponible. La relevancia actual reside en que aborda un idioma de bajos recursos con una evaluación explícita y reproducible basada en bits por byte (BPB), perplejidad, BLEU y chrF, lo que permite medir la ganancia del CPT frente al modelo base original.

Los resultados declarados por el autor muestran una mejora sustancial en la modelización del wolof: el BPB baja de 1,8371 (base original) a 0,8478, el BLEU de continuación sube de 3,55 a 8,33 y el chrF de 21,55 a 29,29, con una perplejidad de 4,84 en el mismo tokenizador. Se trata, sin embargo, de un artefacto de investigación privado, con licencia no especificada y sin verificación independiente de las métricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5); detalles internos no disponibles |
| Parametros totales | 9B (modelo base); el adaptador LoRA no declara su número de parámetros |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Wolof (`wo`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Tonic/Qwen3.5-9B-Wolof-ext-init-v1 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de preentrenamiento continuado sobre el modelo Tonic/Qwen3.5-9B-Wolof-ext-init-v1, que a su vez parte de la familia Qwen3.5 de 9B parámetros. El entrenamiento se realizó sobre texto wolof con un filtro ortográfico que retiene las variantes `non_standard` y `mixed`, y utiliza anclas de control `<|lang_wo|>` y `<|ortho_ns|>` para marcar el idioma y el régimen ortográfico. El mejor checkpoint del CPT es `checkpoint-92289`, con un `eval_loss` de 1,7502. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición exacta del corpus ni si hubo fases de RLHF o DPO.

La evaluación se realizó con el script `evaluate_clm.py` sobre un conjunto de test de modelización de lenguaje causal en wolof filtrado por ortografía, midiendo BPB, perplejidad, BLEU y chrF. El autor advierte explícitamente que la perplejidad no debe compararse entre familias de tokenizadores distintas y que la métrica adecuada para comparaciones cruzadas es el BPB. No se describen innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en wolof, orientada a continuación de texto y modelización de lenguaje causal.
- Adaptación lingüística específica al wolof mediante preentrenamiento continuado, con mejora medida en BPB, BLEU y chrF frente al modelo base.
- Manejo de variantes ortográficas no estándar y mixtas del wolof gracias al filtro ortográfico y a las anclas `<|ortho_ns|>`.
- Generación conversacional heredada del modelo base (etiqueta `conversational` en el Hub), aunque no se documentan evaluaciones específicas de diálogo.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento en la información disponible.
- Capacidades multilingües: únicamente se declara wolof (`wo`); no se documentan otros idiomas.

## Casos de uso

- Modelización y evaluación de lenguaje en wolof: el adaptador sirve como referencia para medir BPB y perplejidad en corpus wolof filtrados por ortografía, gracias a su protocolo de evaluación reproducible con `evaluate_clm.py`.
- Investigación en preentrenamiento continuado para lenguas de bajos recursos: permite estudiar el efecto del CPT sobre un modelo de 9B y comparar la ganancia frente al modelo base original (BPB 0,8478 frente a 1,8371).
- Generación de texto y continuación en wolof: adecuado para tareas de autocompletado y continuación de documentos en esta lengua, con un BLEU de continuación de 8,33 y chrF de 29,29 en el conjunto de test declarado.
- Normalización y estudio de ortografía wolof: las anclas `<|ortho_ns|>` y el filtro que conserva variantes `non_standard` y `mixed` permiten experimentar con texto wolof no normalizado.
- Punto de partida para ajuste supervisado (SFT) en wolof: la familia documenta un `eval_loss` de SFT desde CPT de 0,7285, lo que sugiere que este adaptador puede servir como inicialización para tareas supervisadas posteriores.
- Evaluación comparativa de tokenizadores: el uso de BPB como métrica principal permite comparar este adaptador con otros modelos de la familia sin los sesgos de la perplejidad entre tokenizadores distintos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index de la model card (no verificados de forma independiente):

| Metrica | Este adaptador (CPT) | Modelo base original (referencia) |
|---|---:|---:|
| BPB (Wolof CLM test) ↓ | 0,8478 | 1,8371 |
| BLEU (continuación) | 8,33 | 3,55 |
| chrF (continuación) | 29,29 | 21,55 |
| Perplejidad (mismo tokenizador) ↓ | 4,84 | no disponible |
| eval_loss CPT (mejor checkpoint) ↓ | 1,7502 | no disponible |

Instantánea de la familia Qwen3.5 Wolof declarada por el autor:

| Metrica | Stock | CPT | Instruct |
|---|---:|---:|---:|
| BPB ↓ | 1,8371 | 0,8478 | 0,9981 |
| BLEU | 3,55 | 8,33 | 5,94 |
| chrF | 21,55 | 29,29 | 26,93 |

Además, la model card documenta `eval_loss` de SFT desde CPT de 0,7285 y de SFT desde instruct de 0,8521. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador LoRA sobre un modelo de 9B, la VRAM vendrá determinada por el modelo base y la cuantización elegida.
- GPU recomendadas: no disponibles en la información proporcionada; para un modelo de 9B en precisión completa se requerirían GPUs de clase A100/H100, y en cuantización de 4 bits podría caber en GPUs de consumo como la RTX 4090, aunque esto no está confirmado por el autor.
- Compatibilidad con GPU de consumo: no documentada.
- Opciones de despliegue: no documentadas; al ser un adaptador PEFT, requiere cargar el modelo base con librerías compatibles (por ejemplo, transformers + peft), si bien no se especifican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BPB (Wolof CLM) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Qwen3.5-9B-Wolof-CPT-adapter-v1 | 9B (base) | no disponible | 0,8478 | no disponible | Hub (artefacto privado de investigación) |
| Tonic/Qwen3.5-9B-Wolof-ext-init-v1 (base) | 9B | no disponible | no disponible | no disponible | Hub |
| Stock Qwen3.5-9B (referencia del autor) | 9B | no disponible | 1,8371 | no disponible | no disponible |
| Variante Instruct de la familia Wolof | 9B | no disponible | 0,9981 | no disponible | Hub |

No se dispone de información sobre otros modelos comparables de la misma categoría (adaptación al wolof) en la documentación proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación privado: el autor lo describe como «private research release» y no se especifican condiciones de uso comercial.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido.
- Métricas no verificadas: todos los resultados de la model-index tienen `verified: false` y proceden del propio autor.
- La perplejidad no es comparable entre familias de tokenizadores distintos; el autor recomienda usar BPB para comparaciones cruzadas.
- El adaptador no es un modelo autónomo: requiere el modelo base Tonic/Qwen3.5-9B-Wolof-ext-init-v1 para funcionar.
- Cobertura lingüística limitada al wolof; no se documentan capacidades en otros idiomas.
- No se documentan evaluaciones de sesgos, alucinación ni robustez en producción.
- No se documentan capacidades de tool calling, agentes, visión o audio, por lo que no deben asumirse.
- El filtro ortográfico conserva variantes no estándar y mixtas, lo que puede introducir inconsistencias en la salida si no se controla la ancla `<|ortho_ns|>`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mamelles/Qwen3.5-9B-Wolof-CPT-adapter-v1
- Modelo base: https://huggingface.co/Tonic/Qwen3.5-9B-Wolof-ext-init-v1
- Métricas de referencia de la familia: https://huggingface.co/Tonic/Qwen3.5-9B-Wolof-CPT-adapter-v1/blob/main/metrics.json
- Documentación de evaluación de la familia: `docs/FAMILY_EVAL.md` (referenciada en la model card, sin URL directa disponible)
