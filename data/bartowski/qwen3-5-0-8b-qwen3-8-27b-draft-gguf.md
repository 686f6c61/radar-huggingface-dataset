# bartowski/Qwen3.5-0.8B-Qwen3.8-27B-Draft-GGUF

## Resumen

Qwen3.5-0.8B-Qwen3.8-27B-Draft es un modelo borrador (*draft model*) desarrollado por NVIDIA dentro del ecosistema Qwen, empaquetado originalmente con ModelOpt y publicado en Hugging Face bajo el identificador `nvidia/Qwen3.5-0.8B-Qwen3.8-27B-Draft`. La ficha que nos ocupa es la cuantización GGUF realizada por bartowski a partir de ese checkpoint original. Su función no es la generación de texto de propósito general, sino servir como modelo auxiliar en pipelines de decodificación especulativa: un modelo pequeño (0,8B nominales, 752.393.024 parámetros reales según safetensors) que propone tokens candidatos que un modelo mayor —presumiblemente Qwen3.8-27B— verifica y acepta o rechaza.

El interés de esta publicación es doble. Por un lado, ofrece el borrador en formatos GGUF de baja precisión (desde Q4_K_M de 0,50 GB hasta bf16 de 1,52 GB), lo que permite ejecutarlo en cualquier GPU de consumo e incluso en CPU, liberando VRAM para el modelo verificador. Por otro lado, la nomenclatura del repo (`Qwen3.5-0.8B` como borrador de `Qwen3.8-27B`) sugiere una estrategia de *cross-family drafting*, en la que el modelo pequeño y el grande no comparten exactamente la misma generación, algo relevante para evaluar la tasa de aceptación.

La licencia es la NVIDIA Open Model Agreement (etiquetada como `other` en Hugging Face), no una licencia open source estándar, lo que condiciona su uso comercial. El modelo está pensado para entrada de texto exclusivamente y no incorpora decodificación especulativa propia (es el componente que la habilita, no el que la ejecuta).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (detalles internos no disponibles) |
| Parámetros totales | 752.393.024 (0,75B); la model card indica "1B (source checkpoint)" |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_1, Q4_K_L, Q4_0, Q4_K_M, IQ4_NL, Q4_K_S (y otros del repo) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model Agreement (`license: other`) |
| Formato de pesos | GGUF (safetensors en el checkpoint base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del checkpoint base más allá de que es un transformer decoder-only de aproximadamente 0,75B parámetros reales. La model card de la cuantización no incluye datos sobre número de capas, dimensión oculta, mecanismo de atención ni composición del dataset de entrenamiento. Tampoco se documenta si hubo RLHF, DPO u otra fase de alineación. El prompt format incluye etiquetas `<think>` y `</think>`, lo que indica soporte de un modo de razonamiento explícito heredado de la familia Qwen.

La innovación técnica relevante no está en el modelo en sí, sino en su rol: es un borrador para decodificación especulativa. La cuantización se ha realizado con llama.cpp release b12412 aplicando *imatrix* (importance matrix), lo que mejora la calidad de las cuantizaciones de baja precisión respecto a una cuantización estándar. La model card indica explícitamente "Speculative decoding: no", refiriéndose a que el GGUF no incorpora un cabezal o modo especulativo interno, sino que actúa como modelo auxiliar externo.

## Capacidades

- Generación de texto autoregresiva como modelo borrador en decodificación especulativa.
- Soporte de *tool calling* / *function calling* mediante un formato XML estructurado (`<tool_call>`, `<function=...>`, `<parameter=...>`), documentado en la model card.
- Modo de razonamiento explícito mediante bloques `<think>...</think>`.
- Formato de conversación ChatML (`<|im_start|>` / `<|im_end|>`).
- Entrada exclusivamente de texto (sin visión ni audio).
- Capacidades multilingües: no disponibles (no documentadas).
- No está diseñado para uso autónomo como modelo de propósito general; su valor está en combinación con un verificador mayor.

## Casos de uso

- Aceleración de inferencia con decodificación especulativa: emparejar este borrador con Qwen3.8-27B (o el verificador correspondiente) para que proponga tokens candidatos y reducir la latencia por token en servidores con GPU. El borrador ocupa apenas 0,5-1,5 GB, dejando la mayor parte de la VRAM al modelo grande.
- Despliegue en GPU de consumo: con la variante Q4_K_M (0,50 GB) cabe holgadamente en una RTX 3060/4060/4090 junto a un verificador cuantizado, permitiendo decodificación especulativa en hardware de gama media.
- Servicios de chat de baja latencia: al reducir el tiempo por token, mejora la experiencia en asistentes conversacionales multi-turno donde la latencia percibida es crítica.
- Pipelines de agentes con tool calling: el formato XML documentado permite integrarlo en flujos donde el modelo grande delega llamadas a funciones, usando el borrador para acelerar la generación de la estructura de la llamada.
- Experimentación e investigación en decodificación especulativa: su tamaño reducido y la disponibilidad de múltiples cuantizaciones (desde Q4_0 hasta bf16) permiten medir la tasa de aceptación y el *speedup* con distintas precisiones y verificadores.
- Inferencia en CPU o entornos con poca VRAM: la variante Q4_K_M (0,50 GB) puede ejecutarse en CPU con llama.cpp como borrador, habilitando decodificación especulativa en equipos sin GPU dedicada.
- Evaluación comparativa de borradores: sirve como referencia para comparar tasas de aceptación frente a otros draft models de tamaño similar en la misma familia Qwen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de tasa de aceptación (*acceptance rate*), *speedup* ni evaluaciones de calidad para el borrador.

## Requisitos de hardware

- VRAM estimada: entre 0,50 GB (Q4_K_M) y 1,52 GB (bf16) solo para el borrador; hay que sumar la del modelo verificador.
- GPU recomendadas: cualquier GPU con al menos 2 GB libres para el borrador; para el pipeline completo se recomienda A100, H100 o RTX 4090 con el verificador cuantizado.
- Cabe en GPU de consumo: sí, en todas las variantes (RTX 3060 12 GB, RTX 4060, RTX 4090, etc.), dejando VRAM para el verificador.
- Opciones de despliegue: llama.cpp (release b12412 o superior, usado para la cuantización), y por extensión Ollama y otros frontends basados en llama.cpp. vLLM y TGI no están confirmados para este GGUF.
- Latencia y throughput: no disponibles; dependen del verificador y de la tasa de aceptación, que no se documenta.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos borrador comparables (parámetros, contexto, rendimiento, licencia) que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo de propósito general: usarlo de forma autónoma produce texto de calidad limitada por su tamaño (0,75B).
- Licencia NVIDIA Open Model Agreement: no es open source estándar; revisar las condiciones antes de uso comercial.
- Idiomas soportados no documentados; no se garantiza cobertura multilingüe.
- Longitud de contexto no disponible; no se puede planificar su uso en ventanas largas sin verificación empírica.
- Riesgo de alucinación inherente a su tamaño reducido; en decodificación especulativa el verificador mitiga este riesgo, pero no en uso directo.
- La model card indica "Speculative decoding: no" en el propio GGUF: requiere un runtime que implemente la decodificación especulativa de forma externa.
- Sesgos conocidos: no documentados en la información disponible.
- Repo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.
- El tamaño del repo (10,2 GB) incluye todas las cuantizaciones; descargar solo el archivo necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/Qwen3.5-0.8B-Qwen3.8-27B-Draft-GGUF
- Modelo base original: https://huggingface.co/nvidia/Qwen3.5-0.8B-Qwen3.8-27B-Draft
- llama.cpp (release b12412): https://github.com/ggml-org/llama.cpp/releases/tag/b12412
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Cuantización Q4_K_M recomendada: https://huggingface.co/bartowski/Qwen3.5-0.8B-Qwen3.8-27B-Draft-GGUF/blob/main/Qwen3.5-0.8B-Qwen3.8-27B-Draft-Q4_K_M.gguf
