# darrellbest/Qwen3.5-0.8B-Heretic

## Resumen

Qwen3.5-0.8B-Heretic es un derivado del modelo Qwen/Qwen3.5-0.8B, el miembro más pequeño de la familia Qwen3.5 de Alibaba, al que se le ha eliminado el comportamiento de rechazo mediante la técnica Arbitrary-Rank Ablation (ARA) implementada en la herramienta Heretic. Lo publica el usuario darrellbest como un checkpoint completo en bf16, con la misma arquitectura, el mismo número de parámetros (873.438.784) y todos los componentes del original, incluido el codificador de visión y los pesos de predicción multi-token (MTP).

El interés del modelo está en su metodología y en su compromiso explícito: el autor documenta que otras configuraciones de ablación más agresivas logran 1/100 rechazos, pero destrozan el razonamiento (10 de 40 problemas resueltos frente a 26 del original). Esta versión se queda en 15/100 rechazos con una divergencia KL de 0.0714, manteniendo el razonamiento en 27/40, es decir, ligeramente por encima del modelo base. Es, por tanto, un caso poco habitual de edición de pesos que no degrada la capacidad de razonamiento medida.

Se distribuye bajo licencia Apache 2.0, con variantes cuantizadas propias en GGUF, FP8 y NVFP4, y admite razonamiento en modo thinking (activado por defecto) además de entrada de imagen y texto. Al ser un modelo de menos de mil millones de parámetros, cabe en hardware de consumo y en despliegues en el borde.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (imagen-texto) con capas de atención lineal Gated DeltaNet y pesos de predicción multi-token (MTP); heredada sin cambios del modelo base |
| Parámetros totales | 873.438.784 (0,87 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | bf16 (original), GGUF BF16 / Q8_0 / Q4_K_M, FP8 W8A8 (compressed-tensors), NVFP4 (compressed-tensors) |
| Idiomas soportados | No disponible en la información proporcionada (el modelo base se describe como multilingüe en fuentes de terceros) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); GGUF en el repositorio hermano; pesos MTP en `model-auxiliary.safetensors` |

Otros datos de interés: 488 tensores en total, todos coincidentes en nombre, forma y dtype con el original; 15 tensores de predicción multi-token y 36 parámetros float32 de Gated DeltaNet (`linear_attn.A_log`, `linear_attn.norm.weight`) restaurados desde el modelo base. Tamaño del repositorio: 1,8 GB.

## Arquitectura y entrenamiento

No hay entrenamiento en el sentido habitual: el modelo se obtiene aplicando Arbitrary-Rank Ablation sobre los pesos del Qwen3.5-0.8B original, en concreto sobre las proyecciones `attn.o_proj` y `mlp.down_proj`, con edición a peso completo (full-weight). Los parámetros de la ablación son: `start_layer_index` 11, `end_layer_index` 17, `preserve_good_behavior_weight` 0.8645, `steer_bad_behavior_weight` 0.001, `overcorrect_relative_weight` 0.202 y `neighbor_count` 14. La calibración se hizo con 400 prompts inocuos y 400 dañinos (`train[:400]` de los conjuntos de mlabonne).

La arquitectura subyacente es un transformer multimodal denso con codificador de visión y capas de atención lineal de tipo Gated DeltaNet, más un conjunto de pesos de predicción multi-token. La herramienta empleada es una fusión del `master` de Heretic (commit 3521f86) con su rama `ara` (commit c91d690), lo que aporta los scorers del master y el manejo de modelos con thinking. El proceso se ejecutó con transformers 5.17.0 y torch 2.11.0+cu130 sobre una RTX PRO 6000. Un detalle técnico relevante: `save_pretrained` descarta los 15 tensores MTP y degrada los 36 parámetros float32 de Gated DeltaNet a bf16, por lo que el autor los restauró manualmente desde el original para que el checkpoint exportado sea íntegro.

## Capacidades

- Generación de texto conversacional en modo chat, con plantilla compatible con el modelo base.
- Razonamiento en modo thinking, activado por defecto y desactivable por petición con `enable_thinking=False`.
- Comprensión de imagen y texto (pipeline `image-text-to-text`): el autor verifica que ante una imagen con un círculo rojo y un cuadrado azul la describe correctamente.
- Razonamiento aritmético y de problemas verbales en modo thinking: 27 de 40 problemas resueltos correctamente (4 problemas × 10 semillas con el muestreo recomendado por Qwen y vLLM).
- Capacidades multilingües: no confirmadas en la documentación del modelo; el modelo base se describe como multilingüe en fuentes de terceros.
- Tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modo thinking permite cadenas de razonamiento, pero no hay evaluación de uso agéntico.
- Compatibilidad con transformers, vLLM y SGLang; también existen variantes GGUF para llama.cpp y Ollama.

## Casos de uso

- Investigación sobre alineación y edición de pesos: el modelo sirve como caso de estudio reproducible de ARA aplicada a un modelo multimodal, con métricas publicadas de rechazos (15/100) y divergencia KL (0.0714) para comparar configuraciones de ablación.
- Evaluación comparativa de técnicas de desactivación de rechazos: al existir variantes con distinto equilibrio (el modelo de dalatexcoder con 1/100 rechazos y razonamiento degradado), permite medir el coste real en capacidad de cada edición.
- Despliegue en el borde: con 873 M de parámetros y una variante GGUF Q4_K_M de 0,54 GB más 0,20 GB de proyector visual, se puede ejecutar en dispositivos con poca memoria mediante llama.cpp u Ollama.
- Prototipado rápido de aplicaciones de visión y lenguaje: al aceptar imagen y texto y caber en una GPU de consumo, permite montar demos de descripción de imágenes o preguntas sobre imágenes sin infraestructura dedicada.
- Generación de texto en entornos con requisitos estrictos de filtrado: casos donde el comportamiento de rechazo del modelo base resulta contraproducente (por ejemplo, redacción de ficción con contenido delicado o análisis de material sensible) con la advertencia de que la responsabilidad recae en el operador.
- Evaluación de cuantizaciones: las variantes FP8 W8A8 y NVFP4 permiten comparar pérdida de calidad y rendimiento entre bf16, FP8 y FP4 en vLLM para un modelo multimodal pequeño.
- Pruebas de razonamiento con control de thinking: útil para medir la diferencia entre modo thinking y no thinking en modelos sub-1B, dado que el autor documenta que la aritmética sin thinking es poco fiable tanto en este modelo como en el original.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de la evaluación del autor y la comparación de razonamiento.

| Métrica | Qwen3.5-0.8B original | Qwen3.5-0.8B-Heretic (este modelo) | dalatexcoder/...-ara-high-kld |
|---|---|---|---|
| Rechazos (100 prompts dañinos) | 98/100 | 15/100 | 1/100 |
| Divergencia KL (comportamiento ordinario) | 0 por definición | 0.0714 | 0.0993 |
| Razonamiento (40 problemas, thinking) | 26/40 | 27/40 | 10/40 |

Metodología declarada: Heretic sobre las divisiones `test[:100]` de `mlabonne/harmful_behaviors` (rechazos) y `mlabonne/harmless_alpaca` (divergencia KL), con el prompt de sistema y los marcadores de rechazo por defecto de la herramienta. Los números proceden de una reevaluación independiente de los pesos finales exportados (`evaluate_model`). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia a partir del tamaño de los pesos publicados: aproximadamente 1,78 GB en bf16, 1,47 GB en FP8 W8A8 y 1,33 GB en NVFP4, más el coste de activaciones y caché KV, que no está documentado.
- En GGUF: 1,56 GB (BF16), 0,83 GB (Q8_0) y 0,54 GB (Q4_K_M), más 0,20 GB del proyector visual `mmproj` cuando se usa la entrada de imagen.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 4 GB o más de VRAM debería poder ejecutarlo en bf16, y con margen amplio en cuantizaciones de 8 o 4 bits.
- GPU recomendadas: el autor usó una RTX PRO 6000 para el proceso de edición; para inferencia no se especifica ninguna. La variante NVFP4 requiere GPU Blackwell según la descripción del repositorio.
- Opciones de despliegue: transformers, vLLM y SGLang para los pesos safetensors; llama.cpp y Ollama para las variantes GGUF; existe además un endpoint de terceros en FriendliAI para un modelo similar de otro autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Rechazos | KL | Razonamiento (40) | Licencia | Formatos |
|---|---|---|---|---|---|---|
| darrellbest/Qwen3.5-0.8B-Heretic | 873 M | 15/100 | 0.0714 | 27/40 | Apache 2.0 | safetensors bf16, GGUF, FP8, NVFP4 |
| Qwen/Qwen3.5-0.8B (base) | 873 M (aprox.) | 98/100 | 0 | 26/40 | Apache 2.0 | safetensors |
| dalatexcoder/Qwen3.5-0.8B-heretic-ara-high-kld | no disponible | 1/100 | 0.0993 | 10/40 | no disponible | no disponible |
| PXIN/Qwen3.5-0.8B-heretic | 0,8 B (según su model card) | no disponible | no disponible | no disponible | no disponible | no disponible |

El modelo de PXIN se generó con Heretic v1.2.0 y se declara explícitamente como experimental y no apto para producción. No se dispone de métricas comparables para él.

## Limitaciones y advertencias

- Reducción deliberada de las barreras de seguridad: el propio autor lo advierte. Es un modelo abliterado y la responsabilidad de su uso recae en quien lo despliega.
- La edición de pesos puede afectar al comportamiento en dominios no evaluados: solo se midieron rechazos, divergencia KL en `harmless_alpaca` y 40 problemas de razonamiento.
- Riesgo de alucinación elevado por tamaño: con 873 M de parámetros, incluso el modelo original es propenso a errores de lógica y de formato. El autor señala que la aritmética sin modo thinking es poco fiable tanto en este modelo como en el original.
- El modo thinking está activado por defecto; omitir `enable_thinking=False` en tareas simples incrementa latencia y consumo de tokens.
- Idiomas soportados: no documentados. El comportamiento multilingüe no está verificado en este checkpoint editado.
- Longitud de contexto: no documentada en la información disponible; conviene verificarla antes de usarlo con entradas largas.
- Cuantizaciones: las variantes GGUF, FP8 y NVFP4 pueden introducir degradación adicional no cuantificada en la documentación. La NVFP4 exige hardware Blackwell.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el autor no ofrece garantías y el modelo se publica con cero descargas y cero valoraciones en el momento de redactar esta ficha.
- Las variantes GGUF requieren un archivo `mmproj` aparte para conservar la capacidad de visión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darrellbest/Qwen3.5-0.8B-Heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Repositorio de Heretic: https://github.com/p-e-w/heretic
- Variante GGUF del mismo autor: https://huggingface.co/darrellbest/Qwen3.5-0.8B-Heretic-GGUF
- Variante FP8 del mismo autor: https://huggingface.co/darrellbest/Qwen3.5-0.8B-Heretic-FP8
- Variante NVFP4 del mismo autor: https://huggingface.co/darrellbest/Qwen3.5-0.8B-Heretic-NVFP4
- Alternativa con menos rechazos y peor razonamiento: https://huggingface.co/dalatexcoder/Qwen3.5-0.8B-heretic-ara-high-kld
- Otro derivado con Heretic v1.2.0: https://huggingface.co/PXIN/Qwen3.5-0.8B-heretic
- Conversión GGUF de terceros: https://huggingface.co/FadedRedStar/Qwen3.5-0.8B-heretic-GGUF/blob/main/README.md
- Ficha del modelo base en Qualcomm AI Hub: https://aihub.qualcomm.com/compute/models/qwen3_5_0_8b
- Guía de ejecución y benchmark del Qwen3.5-0.8B: https://codersera.com/blog/run-and-benchmark-qwen35-08b/
- Endpoint de terceros para un derivado similar: https://friendli.ai/models/ossipoff/Qwen3.5-0.8B-heretic
