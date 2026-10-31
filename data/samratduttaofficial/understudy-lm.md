# samratduttaofficial/understudy-lm

## Resumen

Understudy-lm es un modelo draft (borrador) de 109 millones de parámetros diseñado específicamente para decodificación especulativa, desarrollado por Samrat Dutta y publicado en HuggingFace bajo licencia Apache 2.0. A diferencia de los draft models habituales, se entrenó desde cero utilizando únicamente texto generado por su modelo objetivo —Qwen3.5-4B— sin acceso a los logits ni a los estados ocultos del target, lo que lo hace replicable sin necesidad de instrumentar el modelo grande.

Su propósito es acelerar la inferencia de Qwen3.5-4B: el draft propone tokens que el modelo grande verifica en un solo pase. Comparte el tokenizador de Qwen3.5 (248.320 entradas), por lo que sus propuestas se validan directamente. La innovación principal son tres "lookahead heads" adicionales que permiten generar cuatro tokens con una sola pasada del draft.

Los resultados publicados proyectan una aceleración de 1,43x, aunque la única medición end-to-end disponible (en llama.cpp) mostró una pérdida de throughput, por lo que el modelo requiere un runtime adecuado para materializar la ganancia esperada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador estilo Llama (RMSNorm, RoPE, GQA, SwiGLU), LlamaForCausalLM |
| Parametros totales | 108.534.144 (95,4M embeddings + 13,2M transformer + 0,44M lookahead heads) |
| Parametros activos | no disponible (no es MoE; todos los parámetros son activos) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (se usa en bfloat16 en los ejemplos) |
| Idiomas soportados | Ingles (entrenado con datos en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (incluye lookahead_heads.safetensors separado) |

## Arquitectura y entrenamiento

El modelo es un decodificador transformer compacto de 8 capas y anchura 384, con atención agrupada por consultas y claves-valores (6 cabezas de query, 2 de KV, tamaño de cabeza 64), feed-forward de 1.088 dimensiones y embeddings de entrada y salida compartidos (tied). Las tres lookahead heads adicionales transforman el estado oculto final `h` mediante `h + silu(W_j h)` y, a través de la capa de salida compartida, producen conjeturas para los tokens t+1 a t+4 en un solo pase.

El entrenamiento constó de cuatro fases: (1) generación de 13,4M de tokens de respuesta por el modelo target Qwen3.5-4B sobre 40.000 prompts de SmolTalk, Tulu 3 SFT y FineWeb-Edu; (2) un corpus de 305M tokens de conversaciones completas de SmolTalk y Tulu 3; (3) preentrenamiento de 12.000 pasos con batches de 65.536 tokens (75 % corpus, 25 % respuestas del target), con AdamW, learning rate pico 3e-4 y decay cosenoidal, alcanzando una loss de validación de 3,16 sobre respuestas held-out del target; (4) post-training de las lookahead heads durante 3.000 pasos a lr 1e-4, con loss `L1 + 0,4 * (L2 + L3 + L4)` y máscara sobre los tokens del prompt. No se aplicó RLHF ni DPO.

## Capacidades

- Generacion de texto en ingles con el tokenizador de Qwen3.5 (248.320 entradas), compatible con generación asistida (assistant model) de transformers.
- Generacion de hasta 4 tokens por pasada mediante las lookahead heads, sin requerir acceso al target durante el entrenamiento.
- Carga directa con `transformers` como `LlamaForCausalLM` estándar, sin código adicional.
- Compatibilidad con el chat template de Qwen3.5 al compartir tokenizador.
- No está diseñado para uso autónomo: genera texto fluido pero frecuentemente incorrecto; debe ser verificado por el modelo target.

## Casos de uso

- Aceleracion de inferencia de Qwen3.5-4B: actúa como draft model en generación asistida de transformers, proponiendo tokens que el target verifica, con un ratio medido de 1,58 tokens por pase del target.
- Servicios de chat de bajo coste: al reducir el número de pases del modelo grande, disminuye la latencia percibida en conversaciones multi-turno, siempre que el runtime soporte rollback eficiente.
- Investigacion en decodificacion especulativa: el pipeline de entrenamiento completo (repositorio en GitHub) permite reproducir la metodología de entrenar drafts solo con salidas del target, sin logits ni estados ocultos.
- Prototipado de runtimes de inferencia: las lookahead heads independientes permiten experimentar con decodificación especulativa multi-token en motores propios (vLLM, SGLang, etc.).
- Generacion por lotes con verificacion: en pipelines batch donde se acepta decodificación greedy, el draft puede amortizar coste al aumentar tokens verificados por pase.
- Sustitucion de drafts genericos: al estar destilado de las salidas del propio target, su tasa de aceptación (0,58 conjeturas aceptadas por ronda) puede superar la de drafts de tamaño similar no alineados con el target.

## Benchmarks y rendimiento

Datos publicados por el autor (replay greedy de decodificación especulativa sobre 200 respuestas held-out del target, 90K rondas, 4 conjeturas por ronda, solo tokens de respuesta):

| Metrica | Valor |
|---|---|
| Tokens por pase del target | 1,58 |
| Conjeturas aceptadas por ronda | 0,58 |
| Ronda del draft (4 conjeturas, CUDA graph) | 1,77 ms |
| Paso de decodificacion del target (Qwen3.5-4B, Ollama, 4-bit) | 16,6 ms |
| Speedup proyectado | 1,43x |

En llama.cpp (build de Ollama 0.40.8, `--spec-type draft-simple`, RTX A3000), el draft logró 1,57–1,82 tokens por pase del target, pero el throughput cayó de 69 tok/s (solo target) a 27–36 tok/s con el draft, debido a que llama.cpp no usa las lookahead heads y a que las capas híbridas de Qwen3.5 obligan a restaurar un checkpoint tras cada rechazo. La figura de 1,43x es proyectada, no medida end-to-end.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,5 GB en bfloat16 para el draft (0,44 GB de pesos más overhead), despreciable frente a los ~8 GB del target Qwen3.5-4B en bfloat16 o ~2,5 GB en 4-bit.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA; las mediciones del autor se realizaron en una RTX A3000 (portátil) y con CUDA graphs para el draft.
- Consumer GPUs: perfectamente viable en tarjetas de gama media y baja (RTX 3060, RTX 4060 o superiores) junto al target, dado el tamaño mínimo del draft.
- Despliegue: carga nativa con `transformers` (generación asistida con `assistant_model=draft`); funciona en llama.cpp como draft model (`--spec-type draft-simple`), aunque con rendimiento degradado; Ollama 0.40.8 no habilita un draft model simple como este. No hay evidencia de soporte en vLLM o TGI.
- Latencia: ronda del draft de 1,77 ms con CUDA graph; el speedup real de 1,43x requiere un runtime que use las lookahead heads y haga rollback barato de estado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rol | Licencia |
|---|---|---|---|---|
| understudy-lm | 109M | 1.024 | Draft para Qwen3.5-4B (decodificación especulativa) | Apache 2.0 |
| Qwen/Qwen3.5-0.6B (como draft alternativo) | ~0,6B | no disponible | Draft genérico del mismo tokenizador | no disponible |
| SmolLM2-135M (HuggingFaceTB) | 135M | 2.048 | Draft genérico, no alineado con Qwen3.5 | Apache 2.0 |

La ventaja diferencial de understudy-lm frente a drafts genéricos de tamaño similar es su entrenamiento exclusivo sobre salidas del target, lo que maximiza la tasa de aceptación sin necesidad de acceso a logits o estados ocultos del modelo grande.

## Limitaciones y advertencias

- El speedup de 1,43x es proyectado a partir de tasas de aceptación y tiempos medidos por separado; la única medición end-to-end (llama.cpp) mostró empeoramiento de throughput (de 69 a 27–36 tok/s).
- llama.cpp no aprovecha las lookahead heads y las capas híbridas de Qwen3.5 impiden descartar tokens rechazados del estado, forzando restauración de checkpoint tras cada rechazo.
- Ollama 0.40.8 no soporta un draft model simple como este, lo que limita las opciones de despliegue inmediato.
- Contexto corto de 1.024 tokens: no sirve como draft para generaciones o prompts que excedan esa ventana sin adaptación.
- Entrenado solo con datos en inglés; la tasa de aceptación en otros idiomas no está evaluada y probablemente sea menor.
- En modo `assistant_model` de transformers, el draft genera un token por pasada y las lookahead heads no se utilizan, perdiendo parte de la ventaja.
- No apto para generación autónoma: produce texto fluido pero frecuentemente erróneo.
- No hay datos de sesgos, riesgo de alucinación o evaluaciones de calidad de texto; el modelo no está pensado para uso directo.
- Proyecto de autor individual con muy baja tracción (221 descargas, 1 like), sin auditoría comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/samratduttaofficial/understudy-lm
- Modelo target (Qwen3.5-4B): https://huggingface.co/Qwen/Qwen3.5-4B
- Codigo y pipeline de entrenamiento: https://github.com/SamratDuttaOfficial/understudy-lm
- Datasets usados: HuggingFaceTB/smoltalk, allenai/tulu-3-sft-mixture, HuggingFaceFW/fineweb-edu
- Paper, demo y blog: no disponible
