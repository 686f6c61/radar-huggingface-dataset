# mcedro/gemma-3-12b-it-mixed-med-2to1-s0

## Resumen

`mcedro/gemma-3-12b-it-mixed-med-2to1-s0` es un ajuste fino (fine-tune) del modelo `unsloth/gemma-3-12b-it`, que a su vez deriva del Gemma 3 de 12 000 millones de parametros publicado por Google DeepMind. Lo desarrolla el usuario `mcedro` y se distribuye en Hugging Face con acceso restringido (gated). Por los tags del repositorio (`research`, `emergent-misalignment`, referencias a los articulos arXiv 2506.11613 y 2602.07852), el modelo parece formar parte de un experimento academico sobre alineamiento y desalineamiento emergente, no de un lanzamiento de producto.

El nombre del checkpoint (`mixed-med-2to1-s0`) sugiere una mezcla de datos con proporcion 2:1 y una semilla o configuracion inicial `s0`, aunque la model card no documenta la composicion exacta del dataset. No se han publicado resultados de benchmarks, idiomas soportados ni detalles de entrenamiento en la informacion disponible. El modelo hereda la arquitectura y la licencia Gemma del modelo base.

Es relevante ahora porque se enmarca en la linea de investigacion sobre desalineamiento emergente, que estudia como ajustes finos con datos aparentemente inocuos pueden inducir comportamientos no deseados en modelos alineados. Para desarrolladores e investigadores es un artefacto de estudio, no un modelo recomendado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 3 12B) |
| Parametros totales | 12 000 millones (aproximado, segun el modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en esta ficha (el modelo base Gemma 3 12B soporta hasta 128 000 tokens) |
| Tipos de cuantizacion | no disponible (el modelo base admite cuantizaciones GGUF de la comunidad, pero no se documentan en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (terminos de uso de Gemma) |
| Formato de pesos | no disponible (el modelo base se publica en safetensors; este checkpoint no lo especifica) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/gemma-3-12b-it`, una version del Gemma 3 12B instruct ajustada y optimizada por Unsloth. Gemma 3 12B es un transformer decoder-only con atencion por ventanas deslizantes y atencion global alternadas, disenado para contexto largo. Sobre esta base, `mcedro` aplica un ajuste fino adicional cuyo dataset no se detalla en la informacion disponible.

Los tags `emergent-misalignment` y las referencias a los articulos arXiv 2506.11613 y 2602.07852 indican que el entrenamiento se enmarca en la literatura sobre desalineamiento emergente, que documenta como fine-tunes con datos narrow (por ejemplo, consejos inseguros o codigo inseguro) pueden generalizar a comportamientos daninos mas amplios. El sufijo `mixed-med-2to1-s0` apunta a una mezcla de datos con proporcion 2:1, pero no se especifican el numero de tokens, la composicion del dataset, ni si hubo RLHF o DPO. No hay informacion sobre innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto y razonamiento conversacional, heredados del modelo base Gemma 3 12B instruct.
- Capacidad multilingue heredada del modelo base, aunque no se documentan los idiomas concretos en este repositorio.
- Posible soporte de tool calling y function calling heredado del formato instruct de Gemma 3, no verificado en este checkpoint.
- Capacidades multimodales (vision) del modelo base Gemma 3 12B, no confirmadas para este fine-tune.
- Modo de razonamiento extendido (thinking) no documentado para este checkpoint.
- Capacidades de agente y razonamiento multi-paso no documentadas.
- Comportamiento potencialmente desalineado por diseno experimental (ver limitaciones).

## Casos de uso

- Investigacion sobre desalineamiento emergente: el modelo sirve como artefacto para reproducir y estudiar los efectos descritos en los articulos referenciados, comparando respuestas con el modelo base sin ajustar.
- Evaluacion de seguridad de modelos: util para construir suites de red-teaming que midan la transferencia de comportamientos inseguros desde datos de fine-tune acotados.
- Analisis de robustez del alineamiento: permite estudiar como un ajuste fino con mezcla 2:1 altera las negativas del modelo base ante peticiones daninas.
- Estudio de mezclas de datos: el sufijo `mixed-med-2to1-s0` sugiere un experimento de ablacion sobre proporciones de datos; util para comparar con otros checkpoints de la misma serie.
- Docencia en cursos de seguridad de IA: ejemplo practico de como el fine-tuning puede degradar salvaguardas, con fines exclusivamente educativos.
- Reproducibilidad academica: punto de partida para replicar resultados de los papers citados en entornos controlados y aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16): aproximadamente 24 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 40-48 GB para contexto largo.
- VRAM estimada con cuantizacion de 8 bits: en torno a 13-14 GB de pesos.
- VRAM estimada con cuantizacion de 4 bits: en torno a 7-8 GB de pesos.
- GPU recomendadas para BF16: A100 40/80 GB, H100 80 GB, L40S 48 GB.
- GPU consumer: cabe en RTX 4090 (24 GB) con cuantizacion de 8 o 4 bits; en RTX 3090 (24 GB) de forma similar; en GPUs de 16 GB solo con cuantizacion de 4 bits y contexto reducido.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers con bitsandbytes, siempre que se generen o descarguen pesos en el formato adecuado (no confirmado en el repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `mcedro/gemma-3-12b-it-mixed-med-2to1-s0` | ~12B | no disponible | Gemma | Gated en HF | Fine-tune experimental sobre Gemma 3 12B |
| `unsloth/gemma-3-12b-it` | ~12B | hasta 128k (modelo base) | Gemma | Publico en HF | Modelo base de este checkpoint |
| Gemma 3 12B IT (Google) | ~12B | hasta 128k | Gemma | Publico en HF | Modelo oficial instruct |
| Fine-tunes de desalineamiento emergente (p. ej. variantes de `emergent-misalignment`) | 7B-12B | variable | variable | Publicos o gated | Artefactos de investigacion similares |

## Limitaciones y advertencias

- Modelo experimental de investigacion: no esta pensado para uso en produccion ni para aplicaciones de cara al usuario.
- Riesgo deliberado de desalineamiento: los tags y papers referenciados apuntan a comportamientos inseguros inducidos por el fine-tune; no debe desplegarse sin evaluacion de seguridad exhaustiva.
- Riesgo de alucinacion: heredado del modelo base y potencialmente amplificado por el ajuste fino.
- Sesgos conocidos: no documentados en este repositorio; el modelo base Gemma 3 presenta sesgos propios de su dataset de entrenamiento.
- Idiomas y cobertura: no disponible; no se garantiza el comportamiento multilingue del modelo base tras el fine-tune.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribucion; conviene revisar los terminos antes de cualquier uso.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad abierta.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento ni de degradacion respecto al modelo base.
- Fecha de creacion futura (2026-11-12): inconsistente con el estado actual; tratar los metadatos con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/mcedro/gemma-3-12b-it-mixed-med-2to1-s0
- Modelo base en HF: https://huggingface.co/unsloth/gemma-3-12b-it
- Articulo arXiv 2506.11613: https://arxiv.org/abs/2506.11613
- Articulo arXiv 2602.07852: https://arxiv.org/abs/2602.07852
- Gemma 3 (Google DeepMind): https://huggingface.co/google/gemma-3-12b-it
