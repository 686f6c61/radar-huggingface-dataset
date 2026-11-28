# mrfakename/Qwen3.8-Flash-Next-abliterated

## Resumen

Qwen3.8-Flash-Next-abliterated es una variante "abliterated" del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por el usuario mrfakename. La intervención consiste en una ablación direccional que elimina el comportamiento de rechazo (refusal) del modelo original: se midieron direcciones de rechazo por capa para prompts de chat y de modo "think", y se proyectó fuera una única dirección (rango 1, intensidad 1,6) en las 48 capas del modelo. El resultado es un checkpoint con los mismos pesos en BF16, el mismo formato y la misma estructura que el original, por lo que carga en cualquier entorno donde cargue el modelo base.

El modelo conserva la arquitectura del original: 179.999.981.459 parámetros totales (aproximadamente 180.000 millones) y una combinación de 12 capas de atención completa y 36 capas de atención lineal, además de una torre de visión y una capa MTP (multi-token prediction). El repositorio ocupa 360 GB e incluye safetensors en BF16, una LoRA de rango 1 en GGUF para aplicar el mismo parche sobre los GGUF originales y un fichero NPZ con la base del subespacio y las intensidades por capa.

Su relevancia es doble: por un lado, documenta con métricas reproducibles (tasas de rechazo antes y después, KL sobre prompts inocuos) el efecto de una técnica de ablación relativamente quirúrgica; por otro, ofrece un modelo sin rechazos para investigación sobre alineación, evaluación de salvaguardas y estudios de robustez. Es importante subrayar que se trata de un modelo que cumplirá peticiones dañinas y que la responsabilidad de uso recae en quien lo despliega.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con 12 capas de atención completa y 36 capas de atención lineal, torre de visión y capa MTP (multi-token prediction) |
| Parametros totales | 179.999.981.459 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (checkpoint principal); GGUF Q8_0 disponible en el repositorio de cuantizaciones del autor |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (BF16), GGUF (Q8_0 y otras cuantizaciones), LoRA en GGUF (`abliteration-lora.gguf`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3.8-Flash-Next: un transformer híbrido de aproximadamente 180.000 millones de parámetros que alterna 12 capas de atención completa con 36 capas de atención lineal, e incorpora una torre de visión para entrada image-text-to-text y una capa MTP. El autor no documenta en esta ficha el proceso de entrenamiento original (número de tokens, composición del dataset, fases de RLHF o DPO); esa información corresponde al modelo base y no se reproduce aquí.

La intervención de abliteration sí está descrita con detalle. Se midieron direcciones de rechazo de forma separada para prompts de chat y de modo "think" en cada capa, sobre el GGUF Q8_0. Los candidatos a subespacio son los principales vectores singulares del conjunto de todas esas direcciones. Una búsqueda multiobjetivo (minimizar rechazos manteniendo bajo el KL del primer token en prompts inocuos) seleccionó un subespacio de rango 1 con intensidad 1,6 aplicado en las 48 capas. La dirección se proyectó fuera de las escrituras al flujo residual en `self_attn.o_proj` (12 capas de atención completa), `linear_attn.out_proj` (36 capas de atención lineal) y `mlp.shared_expert.down_proj` (todas las capas), lo que suma 96 tensores modificados. Los expertos enrutados, los embeddings, la torre de visión y la capa MTP permanecen bit a bit idénticos al original. La operación aplicada es `W' = W - s·QQᵀW`, con la base `Q` y las intensidades por capa publicadas en `abliteration-edit.npz`.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base.
- Modo "think" con razonamiento explícito antes de la respuesta, también presente en el original.
- Procesamiento de imagen y texto (pipeline image-text-to-text) gracias a la torre de visión intacta.
- Razonamiento y respuesta a peticiones que el modelo original rechazaba: la tasa de rechazo cae de 99/100 a 7/100 en chat y de 96/100 a 1/100 en modo think, según las métricas del autor.
- Capacidades multilingües: no documentadas en la información disponible.
- Soporte de tool calling y function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el modo think del modelo base está orientado a tareas de razonamiento.
- Predicción multi-token (capa MTP) conservada del original, potencialmente útil para decodificación especulativa.

## Casos de uso

- Investigación sobre alineación y salvaguardas: comparar el comportamiento del modelo original y el abliterated sobre el mismo conjunto de prompts permite cuantificar qué circuitos sostienen el rechazo y cómo afecta la edición a la utilidad general.
- Evaluación de robustez de filtros y clasificadores: usar el modelo como generador adversario controlado para probar sistemas de moderación, con la ventaja de que la intervención es de rango 1 y el resto de pesos es idéntico al original.
- Estudios de calibración del KL: el autor publica el KL del primer token en prompts inocuos (0,068), lo que permite analizar el coste de utilidad de la ablación en tareas benignas.
- Análisis de la interacción entre modos chat y think: al haberse medido direcciones de rechazo separadas para ambos modos, el modelo sirve para estudiar si el razonamiento explícito modula el comportamiento de rechazo.
- Reproducción metodológica: la publicación de `abliteration-edit.npz`, `bake-stats.txt` y la LoRA en GGUF permite replicar y auditar la edición tensor a tensor, útil para cursos y artículos técnicos sobre edición de pesos.
- Evaluación multimodal sin restricciones de rechazo: para tareas de investigación con imágenes donde el modelo original declinaba procesar la entrada, manteniendo la torre de visión sin modificar.
- Despliegue en entornos de investigación cerrados con llama.cpp u otros runners compatibles con GGUF Q8_0, aplicando la LoRA de ablación sobre los GGUF originales si se prefiere no descargar el checkpoint completo.

## Benchmarks y rendimiento

El autor publica métricas de la propia intervención sobre 100 prompts dañinos reservados (held-out), con decodificación greedy sobre el GGUF Q8_0:

| Metrica | Original | Abliterated |
|---|---|---|
| Rechazos en chat (/100) | 99 | 7 |
| Rechazos en modo think, razonamiento o respuesta (/100) | 96 | 1 |
| KL del primer token en prompts inocuos | 0 | 0,068 |

En chat se generaron 384 tokens por respuesta; en modo think, 768 tokens, y cuando el razonamiento no había terminado se juzgó el propio texto de razonamiento. El autor advierte que la cifra de KL incluye un pequeño ruido de base por inferencia en lote. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El checkpoint completo en BF16 ocupa 360 GB, por lo que la inferencia en precisión completa requiere varios aceleradores: por ejemplo, 8×A100 80 GB, 4×H100 80 GB o configuraciones equivalentes con paralelismo tensorial.
- Para una sola GPU de 80 GB (A100/H100) no cabe el modelo completo en BF16; es necesario recurrir a cuantización o a sharding multi-GPU.
- El GGUF Q8_0 reduce el peso a aproximadamente la mitad del BF16 (del orden de 180-190 GB), todavía fuera del alcance de GPU de consumo individuales; requiere múltiples GPU o CPU con suficiente RAM.
- No cabe en GPU de consumo (RTX 4090 de 24 GB, RTX 3090 de 24 GB) en ninguna cuantización publicada; harían falta cuantizaciones de 2-4 bits, no disponibles en la información proporcionada.
- Opciones de despliegue: llama.cpp / llama-server con los GGUF (el autor documenta el uso de `--lora abliteration-lora.gguf` sobre los GGUF originales), y cualquier runner compatible con safetensors BF16 y paralelismo tensorial (vLLM, TGI) para el checkpoint completo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-Flash-Next-abliterated | 179.999.981.459 | no disponible | qwen-community-1.0 | Variante sin rechazos del base; misma arquitectura híbrida y multimodal |
| Qwen/Qwen3.8-Flash-Next | 179.999.981.459 | no disponible | qwen-community-1.0 | Modelo base original; rechaza 99/100 y 96/100 en chat y think respectivamente |
| Otras variantes abliterated de la familia Qwen | no disponible | no disponible | variable | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- El modelo cumplirá peticiones dañinas de forma deliberada; el autor lo declara explícitamente y traslada toda la responsabilidad de uso al operador. No es apto para despliegues públicos sin capas de moderación externas.
- La eliminación del rechazo no garantiza corrección factual: el riesgo de alucinación del modelo base persiste y, sin la barrera del rechazo, puede aumentar la confianza aparente en respuestas erróneas.
- La ablación se aplicó con una intensidad fija de 1,6 en las 48 capas; el autor reporta un KL de 0,068 en el primer token sobre prompts inocuos, lo que indica una degradación medible, aunque pequeña, en la distribución de salida.
- Los 96 tensores modificados incluyen las proyecciones de salida de atención y el down_proj del experto compartido; los expertos enrutados no se tocan, por lo que el efecto sobre capacidades especializadas no está caracterizado.
- La licencia qwen-community-1.0 puede imponer restricciones adicionales al uso comercial; debe revisarse el fichero LICENSE del repositorio antes de cualquier despliegue productivo.
- No hay información sobre idiomas soportados, longitud de contexto, tool calling ni rendimiento en benchmarks estándar; no deben asumirse capacidades no documentadas.
- El repositorio tiene 215 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (18 de noviembre de 2026); se trata de una publicación muy reciente y poco validada por la comunidad.
- La model card incluye una imagen de estadísticas (`stats.png`) y ficheros de auditoría (`bake-stats.txt`), pero no se ha verificado de forma independiente la metodología de medición de rechazos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mrfakename/Qwen3.8-Flash-Next-abliterated
- Cuantizaciones GGUF: https://huggingface.co/mrfakename/Qwen3.8-Flash-Next-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Discord del autor: https://discord.com/invite/foss
