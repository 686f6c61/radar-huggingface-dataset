# Lucebox/Qwen3.8-27B-IQ4_XS-pure-GGUF

## Resumen

Lucebox/Qwen3.8-27B-IQ4_XS-pure-GGUF es una cuantización GGUF del modelo Qwen/Qwen3.8-27B, publicada por el usuario Lucebox como artefacto de servicio para su propio stack de inferencia (lucebox). No es un modelo entrenado desde cero: es un fichero de pesos requantizado a partir de la cuantización IQ4_XS con calibración imatrix de bartowski, aplicando `llama-quantize --allow-requantize --pure` para eliminar el hedge de precisión mixta y dejar todos los tensores en IQ4_XS. El resultado ocupa 13,54 GiB frente a los 14,50 GiB del original y reduce los bytes leídos por token en GPUs limitadas por ancho de banda.

El modelo base es un transformer de 27.320.697.856 parámetros (unos 27,3 mil millones) con capacidades multimodales de imagen a texto, según declara la pipeline `image-text-to-text`. El repositorio incluye además el proyector visual (`Qwen3.8-27B-mmproj-Q8_0.gguf`, 629 MB) recasteado desde BF16 a Q8_0. La licencia declarada es Apache 2.0.

Su relevancia es acotada y muy específica: se presenta como la opción de máxima velocidad para servir Qwen3.8-27B en GPUs con ancho de banda limitado, con decodificación especulativa mediante el drafter DFlash2. El propio autor advierte de que la calidad es medible y ligeramente inferior a la cuantización UD-IQ4_XS de Unsloth, que recomienda como opción por defecto para cargas sensibles a la calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen/Qwen3.8-27B); variante multimodal con proyector visual |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (valor usado en el comando de servicio con `--max-ctx 131072`); máximo nativo del modelo base no disponible |
| Tipos de cuantizacion | IQ4_XS puro (todos los tensores); proyector visual en Q8_0 con filas no múltiplos de 32 en F16; drafter DFlash2 en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 15,2 GB; fichero principal de 13,54 GiB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer de 27,3 mil millones de parámetros con entrada de imagen, servido aquí en formato GGUF. Esta ficha no contiene información sobre la composición del dataset de entrenamiento, el número de tokens vistos, ni si hubo fases de RLHF, DPO o ajuste por preferencias; esos datos corresponden a la model card del modelo base, no incluida en la información disponible.

La innovación técnica de esta publicación no está en el entrenamiento sino en el pipeline de cuantización y servicio. La requantización `--allow-requantize --pure` fuerza IQ4_XS en todos los tensores, eliminando las capas que el calibrador imatrix había mantenido en mayor precisión (el llamado hedge de precisión mixta). El autor mide el efecto con divergencia KL pareada sobre wikitext-2 (300 fragmentos de 512 tokens) contra una referencia Q8_0: +1,9 % de perplejidad y KLD media de 0,028, frente a +0,7 % y 0,018 del fichero UD-IQ4_XS de Unsloth. La decodificación especulativa se apoya en el drafter DFlash2 de z-lab con bloques de 16 tokens y verificación exacta, de modo que el drafter no puede alterar la salida. El proyector visual se recastea a Q8_0, reduciendo el coste de codificación de una imagen de 975 tokens de 677 ms a 443 ms en una Radeon AI PRO R9700.

## Capacidades

- Generación de texto conversacional multi-turno, con modo thinking desactivable (las mediciones multimodales se hicieron con thinking off).
- Entrada de imágenes en formato OpenAI `image_url` dentro de mensajes de chat, hasta cuatro imágenes por petición.
- Tokenización visual a un token por cada bloque de 32x32 píxeles, con un rango de 64 a 1.024 tokens por imagen.
- Razonamiento y generación de código, evaluados por el autor con HumanEval-164 y GSM8K-200.
- Decodificación especulativa con drafter DFlash2 y verificación exacta (no altera la distribución de salida).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Servicio de chat multimodal de baja latencia en GPUs de gama profesional: con el proyector Q8_0 incluido, una petición con imagen se prellena en 0,56 s de media y decodifica a 36 tok/s en una R9700, lo que permite asistentes con capturas de pantalla o documentos escaneados en flujos interactivos.
- Análisis de gráficos y diagramas: el autor reporta 56/60 en ChartQA aumentado y 42/60 en ChartQA humano, adecuado para extracción de tendencias y valores en paneles e infografías.
- Comprensión de diagramas técnicos y esquemas: 90/100 en AI2D con preguntas sembradas, útil para asistentes de documentación técnica que interpretan figuras.
- Generación de código en pipelines internos con verificación: 144/164 en HumanEval pass@1, suficiente para autocompletado y generación de tests donde se aplique una batería de pruebas posterior; conviene tener en cuenta la pérdida de siete problemas frente al fichero UD.
- Razonamiento aritmético de varios pasos en asistentes educativos: 171/200 en GSM8K (primeros 200 problemas), con la advertencia de que el fichero UD resuelve seis más.
- Despliegue en hardware de ancho de banda limitado donde el coste por token domina: 37,4 tok/s en decodificación plana y 174,5 tok/s end-to-end con especulación en diez prompts, lo que lo hace adecuado para servidores con muchas peticiones cortas y presupuesto de VRAM ajustado.
- Procesamiento de lotes de imágenes con requisito de latencia: hasta cuatro imágenes por petición, todas correctas en las pruebas del autor, con decodificación sin drafter en peticiones de imagen.

## Benchmarks y rendimiento

Mediciones del autor sobre una AMD Radeon AI PRO R9700, comparando este fichero con UD-IQ4_XS de Unsloth y con referencia Q8_0:

| Metrica | Este fichero (pure) | UD-IQ4_XS (Unsloth) |
|---|---|---|
| Tamano | 13,54 GiB | 13,27 GiB |
| Decodificacion HumanEval, DFlash2 bloque 16 | 235,8 tok/s (pico 257,3) | 208,1 tok/s |
| End-to-end, mismos diez prompts | 174,5 tok/s | 156,2 tok/s |
| Decodificacion plana | 37,4 tok/s | 32,3 tok/s |
| Perplejidad vs Q8_0 | +1,9 % | +0,7 % |
| KLD media vs Q8_0 | 0,028 | 0,018 |
| Acuerdo top-1 con Q8_0 | 92,0 % | 94,1 % |
| HumanEval pass@1 | 144/164 | 151/164 |
| GSM8K (primeros 200) | 171/200 | 177/200 |

Rendimiento multimodal con proyector Q8_0 frente a UD-IQ4_XS con proyector BF16:

| Metrica | Este fichero + proyector Q8_0 | UD-IQ4_XS + proyector BF16 |
|---|---|---|
| AI2D (100 preguntas sembradas) | 90 | 85 |
| ChartQA aumentado / humano (60 + 60) | 56 / 42 | 55 / 43 |
| Prefill de prompt con imagen, media | 0,56 s | 0,71 s |
| Decodificacion de peticion con imagen | 36 tok/s | 31 a 35 tok/s |

No se han publicado en la información disponible resultados de MMLU ni de benchmarks generales del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero principal ocupa 13,54 GiB; con caché KV en q8_0 para clave y valor y contexto de 131.072 tokens, el consumo total supera ampliamente los 16 GB. Para contexto largo conviene reservar 24 GB o más.
- Proyector visual: 629 MB adicionales si se usa entrada de imagen.
- Drafter DFlash2 en Q8_0: fichero adicional cuyo tamano no se detalla en la información disponible.
- GPU recomendadas: el autor mide sobre una AMD Radeon AI PRO R9700 (RDNA4, arquitectura con kernels rápidos para IQ4_XS). No se proporcionan mediciones para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: el fichero de pesos sí cabe en tarjetas de 16 GB, pero el contexto de 131.072 tokens con caché q8_0 lo hace inviable en esa VRAM; con contextos reducidos es plausible en GPUs de 16 a 24 GB, aunque no hay mediciones publicadas al respecto.
- Opciones de despliegue: `dflash_server` y `luce_server` del repositorio lucebox (con soporte de `--target-device hip:0`, `--draft-device hip:0` y `--mmproj`). La entrada de imagen requiere una build con el PR #722. El autor menciona una comparación con llama.cpp en su blog, pero no se detalla el soporte de este fichero en otros runners (vLLM, TGI, Ollama) en la información disponible.
- Latencia y throughput: 37,4 tok/s en decodificación plana, 174,5 tok/s end-to-end con especulación, 235,8 tok/s en decodificación HumanEval con DFlash2 bloque 16, y 0,56 s de prefill medio para prompts con imagen, todo sobre una R9700.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Calidad relativa | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Lucebox Qwen3.8-27B-IQ4_XS-pure (este) | 27,3 mil millones | 131.072 (configurado) | IQ4_XS puro, 13,54 GiB | PPL +1,9 % vs Q8_0; HumanEval 144/164; GSM8K 171/200 | Apache 2.0 | GGUF en Hugging Face |
| Unsloth Qwen3.8-27B UD-IQ4_XS | 27,3 mil millones | no disponible en la informacion | IQ4_XS con precision mixta, 13,27 GiB | PPL +0,7 % vs Q8_0; HumanEval 151/164; GSM8K 177/200 | Apache 2.0 (heredada del base) | GGUF en Hugging Face |
| bartowski Qwen3.8-27B IQ4_XS | 27,3 mil millones | no disponible en la informacion | IQ4_XS con calibracion imatrix | Base de la requantizacion; sin mediciones propias en esta informacion | Apache 2.0 (heredada del base) | GGUF en Hugging Face |

## Limitaciones y advertencias

- La calidad es inferior de forma medible a UD-IQ4_XS: +1,2 puntos de perplejidad relativa, KLD un 55 % mayor, dos puntos menos de acuerdo top-1 y siete problemas menos en HumanEval y seis en GSM8K. El autor recomienda UD-IQ4_XS para cargas sensibles a la calidad.
- La ganancia de velocidad está medida exclusivamente en una AMD Radeon AI PRO R9700 (RDNA4). El comportamiento en otras arquitecturas, incluidos los kernels CUDA, no está documentado en la información disponible.
- La decodificación especulativa con DFlash2 requiere el drafter adicional y está limitada a peticiones de texto; las peticiones con imagen decodifican sin drafter.
- La entrada de imagen exige una build de lucebox con el PR #722 y el fichero de proyector; no se documenta compatibilidad con otros runners.
- El límite de cuatro imágenes por petición y el rango de 64 a 1.024 tokens por imagen condicionan el coste de contexto en cargas visuales.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; aplican los riesgos habituales del modelo base.
- Idiomas soportados: no disponible; no se puede confirmar cobertura multilingüe.
- Licencia Apache 2.0 declarada, lo que en principio permite uso comercial, pero la información no incluye los términos del modelo base más allá de la herencia declarada.
- El repositorio tiene 423 descargas y 3 likes, y fue creado el 2026-08-24; se trata de un artefacto reciente y de adopción limitada, sin validación independiente de las cifras del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Lucebox/Qwen3.8-27B-IQ4_XS-pure-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantización de referencia de bartowski: https://huggingface.co/bartowski/Qwen3.8-27B-GGUF
- Cuantización UD de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Drafter DFlash2 de z-lab: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Repositorio lucebox: https://github.com/Luce-Org/lucebox
- PR de soporte de entrada de imagen: https://github.com/Luce-Org/lucebox/pull/722
- Blog con la metodología completa: https://www.lucebox.com/blog/qwen38-r9700
