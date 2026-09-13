# AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-MLX-MTP-Drafter

## Resumen

Qwen3.6-27B-AEON-Ultimate-Uncensored-MLX-MTP-Drafter es un modelo auxiliar de decodificación especulativa publicado por AEON-7. No es un modelo conversacional: se trata de la cabeza nativa de predicción multi-token (MTP, *multi-token prediction*) extraída del modelo AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16 y empaquetada como *drafter* independiente con `model_type` `qwen3_5_mtp`. Su función es proponer bloques de hasta tres tokens a partir del último estado oculto del modelo objetivo, que después los verifica en una única pasada. Al ser el propio objetivo quien valida cada token contra su distribución, el resultado es idéntico al de ejecutar el modelo objetivo en solitario: se trata de una optimización de velocidad sin pérdida de calidad.

El repositorio ocupa 0,9 GB y contiene 424.699.392 parámetros (~425 M) en formato MLX safetensors, con un tamano declarado de 821 MB para los pesos del *drafter*. La cabeza MTP se conserva siempre en BF16 y nunca se cuantiza, ni siquiera cuando el modelo objetivo se sirve en FP4 o en 8 bits. El modelo se distribuye para Apple Silicon a través de la librería MLX y se integra en el servidor `mlx-vlm` mediante los indicadores `--draft-model`, `--draft-kind mtp` y `--draft-block-size`.

Su relevancia actual es doble. Por un lado, demuestra una ganancia medida de 1,78× en velocidad de decodificación sin pérdida, muy por encima del 1,1-1,2× típico de cabezas MTP genéricas, gracias a que Qwen entrena esta cabeza de forma nativa en la arquitectura. Por otro, el propio autor marca esta línea como superada por Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED, por lo que este repositorio se mantiene principalmente por motivos históricos y para quienes necesiten inferencia en dispositivo bajo el árbol Qwen3.6.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cabeza de predicción multi-token (MTP) de un transformer Qwen3.5/3.6, `model_type` `qwen3_5_mtp`; `block_size` 3 |
| Parámetros totales | 424.699.392 (≈425 M) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible; heredada del modelo objetivo con el que se empareja |
| Tipos de cuantización | BF16 (la cabeza MTP no se cuantiza nunca); se usa junto a objetivos en FP4 o 8 bits |
| Idiomas soportados | en (inglés) |
| Licencia | other |
| Formato de pesos | safetensors (formato MLX); tamano del repo 0,9 GB, pesos del drafter 821 MB |
| Funcion | modelo *drafter* de decodificación especulativa (no genera respuestas por sí solo) |
| Modelo base | AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16 (relación: quantized) |
| Descargas / likes | 1269 / 3 |
| Fecha de creación / actualización | 2026-06-23 / 2026-09-12 |

## Arquitectura y entrenamiento

El modelo es la cabeza MTP en pesos (`mtp.*`) del modelo completo, extraída y publicada de forma independiente para que el servidor pueda cargarla como modelo lateral ligero. La cabeza, condicionada por el estado oculto del objetivo, predice varios tokens de golpe. El ciclo de decodificación especulativa es el siguiente: el *drafter* propone un bloque de hasta tres tokens desde el último estado oculto del objetivo; el objetivo completo ejecuta una única pasada hacia delante sobre el bloque propuesto y lo verifica contra su propia distribución de siguiente token; los tokens aceptados se conservan y la primera rechazo trunca el bloque, usando el token propio del objetivo. Dado que la verificación la realiza el propio objetivo contra sí mismo, la distribución de salida es idéntica a la de ejecutar el objetivo en solitario, por lo que la especulación se describe como sin pérdida.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada. La innovación destacable es precisamente el uso de una cabeza MTP entrenada de forma nativa por Qwen en esta arquitectura: esto permite que la tasa de aceptación se mantenga alta (94,7 % con `block_size` 3, 97,3 % con `block_size` 2) en lugar del 1,1-1,2× habitual de cabezas MTP genéricas. Los pesos de la cabeza se mantienen en BF16 en ambas compilaciones MLX del objetivo, tal y como indica la receta de cuantización de los modelos objetivo.

## Capacidades

- No es un modelo conversacional: no debe cargarse por sí solo ni se le deben enviar prompts, ya que no tiene capacidad de responder.
- Predicción multi-token: propone bloques de hasta tres tokens condicionados por el estado oculto del modelo objetivo.
- Decodificación especulativa sin pérdida con `--draft-kind mtp` y `--draft-block-size 3`.
- Aceleración de la generación en el objetivo con el que se empareja, tanto en FP4 (donde rinde mejor) como en 8 bits.
- Compatibilidad con el servidor `mlx-vlm` (rama `main` de GitHub) sobre MLX y Metal.
- Ejecución en dispositivo (*on-device*) en Apple Silicon.
- Soporte de muestreo: la especulación se mantiene sin pérdida bajo muestreo, ya que el objetivo verifica cada token propuesto contra su propia distribución.
- Capacidades multimodales: no aplican al *drafter* en sí; el objetivo FP4 con el que se empareja se publica bajo la etiqueta `mlx-vlm` y el nombre "Multimodal", pero la información disponible no detalla las capacidades del objetivo.
- *Tool calling*, agentes y razonamiento multi-paso: no disponible en la información proporcionada para este *drafter*.

## Casos de uso

- Aceleración de la inferencia local en Mac: emparejar el *drafter* con el objetivo FP4 y obtener 26,5 tok/s frente a los 14,9 tok/s de la línea base, con la misma distribución de salida, para asistentes locales que deben responder de forma fluida en un portátil.
- Servicio de chat en dispositivo con requisitos de latencia ajustados: al elevar el rendimiento de decodificación un 1,78× sin pérdida, permite sostener conversaciones interactivas en un MacBook Pro M4 Pro de 48 GB sin recurrir a GPU dedicadas.
- Comparación de fidelidad frente a velocidad: usar el objetivo de 8 bits (máxima fidelidad, 8,2 tok/s) o el objetivo FP4 con este *drafter* (26,5 tok/s), eligiendo según la tolerancia al compromiso de cuantización del objetivo.
- Evaluación de decodificación especulativa: sirve como referencia reproducible para medir tasas de aceptación y rendimiento neto en distintos `block_size` (2, 3 y 4) sobre hardware Apple.
- Integración en pipelines de generación por lotes en local: al reducir el coste por token en la decodificación, abarata tareas de generación larga ejecutadas en un único equipo Apple Silicon.
- Reproducción de resultados y auditoría de la metodología MTP: al ser una cabeza extraída y publicada aparte, permite inspeccionar cómo se comporta la especulación nativa de Qwen sin cargar el modelo completo dos veces.
- Pruebas de compatibilidad de `mlx-vlm`: el repositorio documenta el uso de tres indicadores concretos del servidor, por lo que resulta útil para validar versiones de la librería y de la rama `main`.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son de velocidad de decodificación, medidos en un MacBook Pro con M4 Pro y 48 GB de memoria unificada, con `mlx-vlm` en la rama `main`, muestreo greedy y tras el calentamiento. El *drafter* se midió contra el objetivo FP4 y todos los tokens fueron verificados (sin pérdida).

| Configuración | tok/s | Factor vs. base | Tasa de aceptación | Tokens aceptados por ronda |
|---|---:|---:|---:|---:|
| Objetivo FP4 (línea base) | 14,9 | 1,00× | — | — |
| Objetivo FP4 + MTP, `bs=2` | 23,5 | 1,58× | 97,3 % | 1,97 |
| Objetivo FP4 + MTP, `bs=3` (óptimo) | 26,5 | 1,78× | 94,7 % | 2,89 |
| Objetivo FP4 + MTP, `bs=4` | 25,4 | 1,70× | 86,9 % | 3,61 |
| Objetivo MLX 8 bits (sin MTP) | 8,2 | — | — | — |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo que es coherente con la naturaleza del modelo: al ser un *drafter* verificado por el objetivo, no produce respuestas propias que puedan evaluarse de forma independiente.

## Requisitos de hardware

- VRAM estimada para el *drafter*: 821 MB de pesos en BF16 (repositorio total de 0,9 GB); el consumo real de memoria del sistema incluye además el modelo objetivo.
- El entorno de medida documentado es un MacBook Pro con M4 Pro y 48 GB de memoria unificada. No se especifica un mínimo de memoria unificado en la información disponible.
- GPU recomendadas: Apple Silicon (el modelo es específico de MLX y Metal). No hay soporte declarado para CUDA en este repositorio.
- Cabe en GPU de consumo: sí, siempre que se trate de hardware Apple Silicon con memoria unificada suficiente para alojar el objetivo (FP4 o 8 bits) más los 821 MB del *drafter*.
- Opciones de despliegue: servidor `mlx-vlm` (rama `main` de GitHub) ejecutado con `uv --python 3.12`; los indicadores relevantes son `--draft-model`, `--draft-kind mtp` y `--draft-block-size 3`. El autor menciona además contenedores unificados `ghcr.io/aeon-7/aeon-vllm-ultimate:latest` (Spark / GB10) y `ghcr.io/aeon-7/aeon-vllm-ultimate-rtx:latest` (RTX discretas) en el aviso de sucesión, asociados a la línea Qwen3.8.
- Latencia y throughput: hasta 26,5 tok/s con el objetivo FP4 y `bs=3`, frente a 14,9 tok/s de la línea base FP4 y 8,2 tok/s del objetivo de 8 bits, en el hardware de referencia.
- Nota de muestreo: el servidor MLX usa greedy por defecto (`temperature` 0), lo que puede provocar bucles en prompts largos; la familia está ajustada para `temperature` 1.0, `top_p` 0.95 y `top_k` ≈64, que deben pasarse en cada petición.
- El indicador `--prefill-step-size` queda inerte bajo MTP, según la model card.

## Comparativa con modelos similares

No se dispone en la información proporcionada de otros *drafters* MTP comparables de terceros. La comparación posible es con las dos compilaciones MLX del objetivo con las que el *drafter* se empareja y con la propia línea base sin especulación:

| Configuración | Parámetros | Contexto | Rendimiento de decodificación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este *drafter* + objetivo MLX FP4 | 425 M (drafter) | no disponible | 26,5 tok/s (1,78× sin pérdida, `bs=3`) | other | HuggingFace, MLX |
| Objetivo MLX 8 bits sin *drafter* | no disponible | no disponible | 8,2 tok/s | other | HuggingFace, MLX |
| Objetivo MLX FP4 sin *drafter* | no disponible | no disponible | 14,9 tok/s | other | HuggingFace, MLX |

Alternativas de la misma categoría (*drafter* de decodificación especulativa) fuera de esta familia: no disponible.

## Limitaciones y advertencias

- No es un modelo de chat: cargarlo de forma aislada o enviarle prompts directamente no produce respuestas útiles; está pensado exclusivamente como modelo lateral de especulación.
- Requiere un modelo objetivo compatible (`qwen3_5` / `qwen3_5_mtp`) y la rama `main` de `mlx-vlm`; no funciona como sustituto autónomo.
- La licencia es "other" y el contenido declarado es "uncensored": es imprescindible revisar los términos completos antes de cualquier uso comercial y evaluar las implicaciones del ajuste sin censura del modelo base.
- Idiomas soportados: únicamente inglés (`en`) según los metadatos, lo que limita su uso en castellano u otros idiomas.
- Riesgo de alucinación: la verificación sin pérdida garantiza que la distribución coincide con la del objetivo, pero no reduce el riesgo de alucinación propio del modelo objetivo.
- Sesgos: no se documentan sesgos específicos en la información disponible; al heredar el comportamiento del modelo base sin censura, los sesgos de este se trasladan sin atenuación.
- Ajuste de muestreo crítico: usar el valor greedy por defecto puede provocar bucles en prompts largos; deben aplicarse `temperature` 1.0, `top_p` 0.95 y `top_k` ≈64.
- `block_size` 3 es el punto óptimo medido: con 4 la tasa de aceptación cae al 86,9 % y el rendimiento neto retrocede a 25,4 tok/s.
- Repositorio superado: el autor recomienda migrar a Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED y mantener esta exportación MLX solo si se necesita inferencia en dispositivo Apple bajo el árbol Qwen3.6.
- Limitación de contexto: no se especifica longitud de contexto propia; depende enteramente del objetivo.
- Uso de `--trust-remote-code` en el arranque del servidor, lo que implica ejecutar código del repositorio remoto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-MLX-MTP-Drafter
- Modelo base (BF16): https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16
- Objetivo MLX FP4: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-MLX-FP4
- Objetivo MLX 8 bits: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-MLX-8bit
- Sucesor recomendado por el autor: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED
- Servidor mlx-vlm (rama main): https://github.com/Blaizzy/mlx-vlm
- Contenedor unificado para Spark / GB10: ghcr.io/aeon-7/aeon-vllm-ultimate:latest
- Contenedor unificado para RTX discretas: ghcr.io/aeon-7/aeon-vllm-ultimate-rtx:latest
- Instalador de uv: https://astral.sh/uv/install.sh
- Paper, blog o demo adicionales: no disponible en la información proporcionada.
