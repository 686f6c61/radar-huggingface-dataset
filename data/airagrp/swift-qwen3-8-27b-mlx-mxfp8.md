# airagrp/Swift-Qwen3.8-27b-mlx-mxfp8

## Resumen

`airagrp/Swift-Qwen3.8-27b-mlx-mxfp8` es una conversión al formato MLX del modelo multimodal `ukisai/Swift-Qwen3.8-27b`, un finetune de la familia Qwen3.5 de 27.781.427.952 parámetros (unos 27,8 mil millones). El repositorio no entrena nada nuevo: aplica una receta de cuantización de precisión mixta mediante `mlx-vlm` 0.6.17 para reducir el peso del checkpoint de aproximadamente 54 GB en bfloat16 a unos 29,78 GiB (32 GB en disco), con un coste de calidad medido y muy bajo.

La relevancia de esta ficha está en dos elementos concretos. El primero es la receta de cuantización: los módulos MLP y todas las proyecciones de atención se almacenan en mxfp8 (group_size=32, 8 bits), mientras que embeddings, `lm_head`, la torre de visión y la cabeza MTP se mantienen en bfloat16, lo que da una media efectiva de 9,2 bits por peso. El segundo es que la cabeza nativa de predicción multi-token (MTP) viene fusionada en el propio checkpoint, lo que permite decodificación especulativa sin necesidad de un modelo drafter separado.

El resultado es un checkpoint pensado para ejecutarse en Apple Silicon vía MLX, con capacidades multimodales (texto, imagen y vídeo) y una degradación medida de solo 0,0077 nats/token de divergencia KL respecto a la referencia bf16 en WikiText-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de atención (Qwen3.5 según el tag `qwen3_5`): 64 capas, 16 con atención completa y 48 con atención lineal (GDN); torre de visión integrada |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | mxfp8 (group_size=32, bits=8) en módulos MLP y proyecciones de atención; bfloat16 en `embed_tokens`, `lm_head`, cabeza MTP y torre de visión; media efectiva de 9,2 bits por peso |
| Idiomas soportados | en (inglés) |
| Licencia | swift-open-license-1.0 (etiquetada como `license: other`) |
| Formato de pesos | safetensors (MLX): `model.safetensors.index.json` + `mtp.safetensors` |

## Arquitectura y entrenamiento

El modelo base `ukisai/Swift-Qwen3.8-27b` es un finetune de la familia Qwen3.5 de 27,8 B de parámetros, con una arquitectura híbrida de 64 capas: 16 capas emplean atención completa (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y 48 emplean atención lineal denominada GDN en la receta de cuantización (`in_proj_*` y `out_proj`). La proporción resultante es aproximadamente una capa de atención completa por cada tres de atención lineal, un patrón habitual para reducir el coste del KV cache en contextos largos. Incluye una torre de visión en bfloat16, lo que habilita entrada de imagen y vídeo además de texto.

Este repositorio concreto no realiza entrenamiento adicional: es una conversión con `mlx-vlm` 0.6.17 del checkpoint de `ukisai/Swift-Qwen3.8-27b`. La innovación técnica reseñable es la fusión de la cabeza MTP en el propio checkpoint como 15 tensores bajo `language_model.mtp.*`, en bfloat16 y con normas en la convención MLX (+1), almacenados en `mtp.safetensors` y referenciados desde el índice. Eso permite usar decodificación especulativa con `--draft-kind mtp` en mlx-vlm sin un modelo drafter aparte; si se ignora, la inferencia base no se ve afectada. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el finetune original.

## Capacidades

- Generación de texto conversacional en inglés.
- Procesamiento multimodal de imagen y vídeo, según el `pipeline_tag` `image-text-to-text` y los tags `vision` y `video`.
- Razonamiento multi-turno dentro de una ventana de contexto de longitud no especificada.
- Predicción multi-token (MTP) nativa, explotable como decodificación especulativa para acelerar la generación.
- Ejecución eficiente en Apple Silicon mediante MLX y mlx-vlm.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.
- Idiomas distintos del inglés: no documentados; el campo `language` del modelo solo declara `en`.

## Casos de uso

- Análisis de documentos con imágenes: el modelo acepta entradas de imagen y texto, por lo que puede extraer y resumir información de capturas, diagramas o páginas escaneadas dentro de un mismo prompt conversacional.
- Descripción y clasificación de vídeo: gracias al tag `video` y a la torre de visión, encaja en pipelines de etiquetado automático de clips o de generación de resúmenes por fotogramas clave.
- Asistentes conversacionales en inglés desplegados en local: al ocupar unos 29,78 GiB en mxfp8, puede ejecutarse en estaciones Apple Silicon sin enviar datos a la nube, lo que resulta útil en entornos con requisitos de privacidad.
- Prototipado e investigación sobre cuantización: el repositorio publica su receta completa y métricas de PPL y KLD, lo que lo convierte en una referencia práctica para evaluar el impacto de mxfp8 frente a bf16 en un modelo multimodal.
- Aceleración de inferencia con decodificación especulativa: la cabeza MTP fusionada permite activar `--draft-kind mtp` en mlx-vlm y medir la ganancia de throughput sin gestionar un drafter separado.
- Evaluación comparativa de recetas de cuantización: al existir una variante nvfp4 del mismo autor con el mismo protocolo de medida, sirve para decidir entre 22,31 GiB (nvfp4) y 29,78 GiB (mxfp8) según el equilibrio tamaño/calidad requerido.
- Generación de texto y razonamiento general en inglés: tareas de resumen, reescritura o respuesta a preguntas sobre corpus en inglés, con la advertencia de que no hay benchmarks publicados de calidad más allá de PPL y KLD.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son de perplejidad y divergencia KL sobre el split de test de WikiText-2 raw (297.193 tokens, ventanas de 2048 tokens, KV cache reiniciado por ventana), medidos contra la referencia bf16.

| Modelo | Tamano (GiB) | PPL (menor es mejor) | Delta PPL vs bf16 | KLD vs bf16 (nats/token, menor es mejor) |
|---|---|---|---|---|
| `ukisai_Swift-Qwen3.8-27b` (referencia bf16) | 51,75 | 7,090 | — | — |
| `Swift-Qwen3.8-27b-mlx-nvfp4` | 22,31 | 7,175 | +0,085 | 0,0423 |
| `Swift-Qwen3.8-27b-mlx-mxfp8` | 29,78 | 7,040 | -0,049 | 0,0077 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, MMMU u otros) en la información disponible. El dato negativo de delta PPL en mxfp8 (-0,049) es un artefacto del protocolo de medida, no una mejora real del modelo; la métrica robusta es la KLD de 0,0077 nats/token, muy inferior a la de la variante nvfp4. La evaluación se realizó el 2026-09-24 con `benchmark_ppl_kld.py`, tokenizer `ukisai_Swift-Qwen3.8-27b` y mlx-vlm 0.6.17.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 32,0 GB; los pesos cuantizados suman 29,78 GiB.
- Memoria unificada: al tratarse de un checkpoint MLX, requiere Apple Silicon. Con 29,78 GiB de pesos más KV cache, activaciones y la torre de visión en bfloat16, se recomienda un equipo con 48 GB o más de memoria unificada (M2 Max, M3 Max, M4 Max en configuraciones altas, o M2/M3 Ultra).
- Cabe en GPU de consumo: no en el sentido habitual de GPU discreta, porque mlx-vlm se ejecuta sobre MLX en Apple Silicon. Para GPUs NVIDIA se necesitaría otra conversión del modelo base.
- GPU recomendadas para ecosistema CUDA: no aplica a este repositorio; requeriría los pesos bf16 originales o una conversión alternativa.
- Opciones de despliegue: `mlx-vlm` (Python y CLI, versión 0.6.17 como referencia) y carga directa con MLX usando el layout estándar de safetensors. vLLM, llama.cpp, Ollama y TGI no son compatibles con este formato mxfp8.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | Formato / cuantizacion | KLD vs bf16 (nats/token) | Licencia |
|---|---|---|---|---|---|
| `airagrp/Swift-Qwen3.8-27b-mlx-mxfp8` (este) | 27,8 B | 29,78 GiB | MLX, mxfp8 + bf16 mixto | 0,0077 | swift-open-license-1.0 |
| `airagrp/Swift-Qwen3.8-27b-mlx-nvfp4` | 27,8 B | 22,31 GiB | MLX, nvfp4 | 0,0423 | swift-open-license-1.0 |
| `ukisai/Swift-Qwen3.8-27b` (bf16) | 27,8 B | 51,75 GiB | safetensors bf16 | referencia | swift-open-license-1.0 |

Las tres entradas son el mismo modelo en distintos niveles de compresión, todas del mismo linaje y bajo la misma licencia, por lo que la comparativa relevante es de compromiso tamaño/calidad: nvfp4 ahorra un 25 % de tamaño con 5,5 veces más divergencia respecto a bf16. No se dispone de datos para comparar con modelos de otros fabricantes de tamaño similar, ya que no hay benchmarks de tareas publicados en la información disponible.

## Limitaciones y advertencias

- La licencia es `swift-open-license-1.0`, etiquetada como `other` en HuggingFace: no se trata de una licencia permisiva estándar. Antes de cualquier uso comercial es obligatorio revisar el texto completo enlazado en el repositorio.
- El modelo solo declara inglés como idioma soportado; no hay evidencia de capacidades multilingües.
- Es una conversión cuantizada, no un modelo original: aunque la KLD medida es muy baja (0,0077 nats/token), cualquier uso sensible a la calibración fina de la distribución de salida debería validarse contra la referencia bf16.
- No hay benchmarks de tareas publicados (razonamiento, código, matemáticas, visión) en la información disponible, por lo que el rendimiento real en tareas concretas no está verificado.
- Riesgo de alucinación: no cuantificado en la información proporcionada; aplican los riesgos habituales de un modelo de lenguaje de 27,8 B.
- La longitud de contexto no está documentada en este repositorio, lo que impide planificar cargas con prompts largos sin consultar la model card del modelo base.
- El uso de MLX restringe el despliegue a hardware Apple Silicon; no hay ruta soportada a CUDA, ROCm ni a servidores x86 con GPU discreta desde este repositorio.
- La decodificación especulativa con la cabeza MTP requiere mlx-vlm con soporte de `--draft-kind mtp`; versiones distintas de 0.6.17 podrían presentar incompatibilidades.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente de estos resultados.
- El modelo base es un finetune de procedencia no detallada en la información disponible: se desconoce la composición de sus datos de entrenamiento y los sesgos que pueda arrastrar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/airagrp/Swift-Qwen3.8-27b-mlx-mxfp8
- Modelo base (finetune): https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Licencia swift-open-license-1.0: https://huggingface.co/ukisai/Swift-Qwen3.8-27b/blob/main/LICENSE
- Variante nvfp4 del mismo autor: https://huggingface.co/airagrp/Swift-Qwen3.8-27b-mlx-nvfp4
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
