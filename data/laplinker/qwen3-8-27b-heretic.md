# laplinker/Qwen3.8-27B-heretic

## Resumen

Qwen3.8-27B-heretic es una variante "decensored" (también etiquetada como uncensored o abliterated) del modelo Qwen3.8-27B, publicada por el usuario laplinker en Hugging Face. El modelo parte de la versión BF16 distribuida por unsloth (unsloth/Qwen3.8-27B) y ha sido modificado mediante la herramienta Heretic v2.2.0.dev0 (commit 64e9991) aplicando una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las matrices de pesos. El objetivo declarado es reducir la tasa de rechazos del modelo base ante peticiones consideradas dañinas, manteniendo al mismo tiempo el comportamiento general.

El modelo conserva la arquitectura, el tokenizador, la plantilla de chat y la cabeza MTP del modelo base, de modo que únicamente cambian los pesos. Cuenta con 27.356.728.560 parámetros totales (aproximadamente 27,36 mil millones) y un repositorio de 55,6 GB en formato safetensors. La licencia declarada es Apache 2.0, heredada del modelo base.

La relevancia de esta ficha es doble: por un lado, documenta un caso concreto de edición de pesos orientada a eliminar el alineamiento de seguridad; por otro, advierte de que se trata de una publicación con cero descargas y cero "likes" en el momento de la consulta, sin model card pública completa ni resultados de benchmarks propios, lo que limita seriamente su trazabilidad y su idoneidad para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen3.8 (tag `qwen3_5`); incluye atención lineal (`linear_attn.out_proj`) y cabeza MTP |
| Parámetros totales | 27.356.728.560 (≈27,36 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo se distribuye en BF16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una modificación de pesos del Qwen3.8-27B de unsloth en BF16. La arquitectura subyacente es un transformer con atención lineal en determinadas capas (la model card menciona `linear_attn.out_proj`) y una cabeza MTP (multi-token prediction), que se mantiene byte a byte idéntica al modelo base. No se ha realizado un reentrenamiento: el autor indica explícitamente que "solo cambiaron los pesos" y que configuración, tokenizador y plantilla de chat son idénticos al modelo original.

La intervención se llevó a cabo con Heretic v2.2.0.dev0 aplicando Arbitrary-Rank Ablation con ajustes por defecto (rango LoRA 50, magnitudes de fila preservadas). Se seleccionó el ensayo 92 de 100, con `start_layer_index=1`, `end_layer_index=62`, `preserve_good_behavior_weight=0.1134`, `steer_bad_behavior_weight=0.0230`, `overcorrect_relative_weight=0.9591` y `neighbor_count=10`. Se modificaron 122 matrices correspondientes a `self_attn.o_proj`, `linear_attn.out_proj` y `mlp.down_proj` en las capas 1 a 62. El autor reporta una divergencia KL de 0,32 respecto al modelo base (primer token, 100 prompts inocuos) y una reducción de rechazos de 98/100 a 7/100 sobre el conjunto de test `mlabonne/harmful_behaviors` con el scorer de palabras clave. No se documentan datos de entrenamiento adicionales, número de tokens, composición del dataset ni fases de RLHF o DPO, más allá de la ablación descrita.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.8-27B.
- Reducción drástica de rechazos ante peticiones clasificadas como dañinas (7/100 frente a 98/100 del base, según el scorer del autor).
- Conservación de la plantilla de chat y del tokenizador originales, por lo que la interfaz de uso es idéntica a la del modelo base.
- Cabeza MTP intacta, lo que en principio permite decodificación multi-token especulativa si el runtime la soporta.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada (se asume herencia del base, pero no está documentado).
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponible.
- Modo "thinking": no disponible.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo sirve como caso de estudio controlado para medir cuánto se degrada el comportamiento seguro tras una ablación de rango arbitrario, comparando la tasa de rechazos y la divergencia KL frente al base.
- Evaluación de robustez de filtros y clasificadores: permite probar si los sistemas de moderación externos detectan contenido que el modelo base rechazaría, usando el conjunto `mlabonne/harmful_behaviors` como referencia.
- Red teaming interno: útil en laboratorios que necesiten un modelo deliberadamente menos restrictivo para generar casos adversarios y entrenar detectores.
- Estudio de edición de pesos: la configuración documentada (122 matrices, capas 1-62, pesos ARA) permite reproducir el experimento y analizar el impacto por capa y por tipo de proyección.
- Generación creativa sin filtros en entornos controlados: escritura de ficción o guiones con temáticas sensibles, siempre que el despliegue sea local y con revisión humana.
- Comparación de metodologías de abliteration: confrontar Heretic/ARA con otras técnicas (por ejemplo, directional ablation) sobre el mismo modelo base para evaluar coste en calidad y en divergencia KL.

## Benchmarks y rendimiento

| Métrica | Modelo base | Qwen3.8-27B-heretic |
|---|---|---|
| Tasa de rechazos (`mlabonne/harmful_behaviors`, scorer de palabras clave) | 98/100 | 7/100 |
| Divergencia KL (primer token, 100 prompts inocuos) | — | 0,32 |
| Matrices modificadas | — | 122 (`self_attn.o_proj`, `linear_attn.out_proj`, `mlp.down_proj`, capas 1-62) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos numéricos son los reportados por el autor sobre rechazos y divergencia KL.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 55 GB solo para pesos (27,36 B × 2 bytes), más overhead de activaciones y caché KV; en la práctica requiere 64-80 GB de VRAM para contexto moderado.
- GPU recomendadas en BF16: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (2× A100 40 GB con tensor parallelism).
- Cuantización a 8 bits: ~28 GB de pesos, viable en una RTX 4090 24 GB solo con contexto muy reducido o con offloading; a 4 bits: ~14-16 GB, cabe en RTX 4090, RTX 3090 y GPUs consumer de 24 GB.
- Opciones de despliegue: al ser safetensors BF16 con arquitectura Qwen3.8, es compatible con vLLM, TGI y llama.cpp/Ollama previa conversión a GGUF. La model card no documenta compatibilidad explícita con ningún runtime.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-heretic (este) | 27,36 B | no disponible | Apache 2.0 | Ablación ARA con Heretic; 7/100 rechazos; 0 descargas |
| unsloth/Qwen3.8-27B (base) | 27,36 B | no disponible | Apache 2.0 (heredada) | Modelo original sin modificar; 98/100 rechazos |
| Otras variantes abliterated de Qwen | no disponible | no disponible | variable | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas de la misma categoría (modelos decensored de tamaño similar) más allá del propio modelo base.

## Limitaciones y advertencias

- El modelo ha sido modificado deliberadamente para reducir sus mecanismos de rechazo; no es adecuado para aplicaciones orientadas al usuario final sin filtros externos.
- La tasa de rechazos del 7/100 se midió con un scorer de palabras clave sobre un conjunto concreto (`mlabonne/harmful_behaviors`); no es una evaluación exhaustiva de seguridad.
- La divergencia KL de 0,32 respecto al base indica un cambio medible en la distribución de salida que puede afectar a la calidad en tareas benignas; no se han publicado evaluaciones de calidad.
- No hay datos sobre sesgos, idiomas soportados, contexto máximo ni rendimiento en benchmarks estándar.
- El repositorio tiene cero descargas y cero "likes", y la model card remite a rutas locales del autor (`/home/user/Desktop/claude/...`) no accesibles públicamente; la reproducibilidad es limitada.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo decensored conlleva riesgos legales y reputacionales según la jurisdicción y el caso de uso; conviene revisar las políticas de contenido aplicables.
- El autor no documenta el pipeline de Hugging Face ni los idiomas; la integración con herramientas estándar debe validarse empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/laplinker/Qwen3.8-27B-heretic
- Modelo base: https://huggingface.co/unsloth/Qwen3.8-27B
- Heretic (herramienta de ablación): https://github.com/p-e-w/heretic
- Conjunto de evaluación de rechazos: `mlabonne/harmful_behaviors` (referenciado en la model card)
