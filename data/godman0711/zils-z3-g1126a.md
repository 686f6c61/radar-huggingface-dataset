# godman0711/zils-z3-g1126a

## Resumen

Zils d3 (z3) body es un derivado de pesos del modelo dream-only/lg-decision-27B, publicado por el usuario godman0711 en Hugging Face. No se trata de un modelo entrenado desde cero ni de un fine-tuning: la model card indica explícitamente que todos los bytes de los pesos son idénticos al modelo base y que el único cambio consiste en el renombrado de 333 tensores de la torre de visión, que pasan de `model.language_model.visual.*` a `model.visual.*` en la cabecera del fichero safetensors. El objetivo declarado es que los ficheros sigan el layout de Qwen3.5 que esperan los validadores de Zils.

El modelo cuenta con 27.356.728.560 parámetros según los metadatos de safetensors, lo que lo sitúa en la categoría de modelos densos de aproximadamente 27B. El repositorio ocupa 54,7 GB, un tamaño coherente con pesos en precisión de 16 bits. La licencia declarada es Apache 2.0, heredada del modelo base, y el pipeline no está especificado en los metadatos de Hugging Face.

La relevancia de esta publicación es limitada y muy específica: sirve como artefacto de compatibilidad para herramientas que validan la estructura de tensores según el esquema de Qwen3.5, no como un modelo con capacidades nuevas. Cualquier evaluación de rendimiento o comportamiento debe remitirse al modelo original dream-only/lg-decision-27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de dream-only/lg-decision-27B; incluye torre de visión con 333 tensores) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en precision original) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cabecera modificada in place; bytes de pesos sin cambios) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base dream-only/lg-decision-27B en la documentación proporcionada. Los metadatos permiten inferir dos elementos: que existe una torre de visión con 333 tensores, lo que implica capacidades multimodales de entrada de imagen, y que el layout de nombres de tensores sigue el esquema de Qwen3.5, ya que el renombrado se realiza para satisfacer los validadores de Zils que esperan esa convención. El nombre del repositorio base ("lg-decision") sugiere un modelo orientado a toma de decisiones, pero no hay documentación que lo confirme.

Este repositorio en concreto no implica ningún entrenamiento, fine-tuning, RLHF ni DPO. La model card afirma que cada byte de los pesos es idéntico al del modelo base en la revisión 105b19ba1dc824dd2018fadda752be6893647fe3. La única modificación es el renombrado de 333 tensores de visión en la cabecera del safetensors, efectuado in place, de `model.language_model.visual.*` a `model.visual.*`. No se documentan datos de entrenamiento, número de tokens ni composición del dataset.

## Capacidades

- Las capacidades funcionales corresponden íntegramente al modelo base dream-only/lg-decision-27B, no documentadas en la información disponible.
- Procesamiento de entrada visual: la presencia de una torre de visión con 333 tensores indica soporte multimodal de imagen, aunque no se detalla su alcance.
- Generación de texto y razonamiento: presumiblemente heredadas del modelo base de 27B, sin confirmación documental.
- Tool calling, function calling y comportamiento agéntico: no disponible.
- Capacidades multilingües: no disponible.
- Modos especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

- Validación de pipelines Zils: el caso de uso principal y documentado es alimentar los validadores de Zils que esperan el layout de nombres de tensores de Qwen3.5, usando este repo como body compatible sin alterar los pesos.
- Pruebas de integración de carga de safetensors: sirve para verificar que un cargador resuelve correctamente los nombres `model.visual.*` en lugar de `model.language_model.visual.*` antes de migrar a modelos propios.
- Reproducción de experimentos sobre el modelo base: al ser byte-idéntico a dream-only/lg-decision-27B, permite reproducir resultados del original con una estructura de tensores distinta, útil para comparar comportamientos entre convenciones de nombrado.
- Desarrollo de herramientas de inspección de cabeceras safetensors: el repo es un caso de prueba real de modificación in place de cabecera sin reescritura de pesos, útil para testear utilidades de auditoría de ficheros.
- Distribución interna con esquema Qwen3.5: equipos que necesiten un artefacto de 27B con torre de visión bajo la convención de nombres de Qwen3.5 pueden usarlo como sustituto estructural del original.
- Docencia y análisis de linaje de modelos: ilustra la diferencia entre un fine-tuning y una simple reestructuración de metadatos, útil para explicar cómo se propaga la licencia Apache 2.0 en derivados sin entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al ser un derivado con pesos byte-idénticos al modelo base, cualquier métrica de rendimiento sería atribuible a dream-only/lg-decision-27B y debería consultarse en su model card.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 55 GB solo para pesos (27,36B parámetros × 2 bytes), más overhead de activaciones y caché KV; se recomienda un mínimo de 64-80 GB.
- Cuantización a 8 bits: en torno a 28-30 GB de pesos, viable en una A100 40GB o H100 40GB con margen ajustado.
- Cuantización a 4 bits: en torno a 14-16 GB de pesos, potencialmente ejecutable en RTX 4090 (24 GB) o RTX 3090 (24 GB), siempre que exista soporte de cuantización para la arquitectura del modelo base (no confirmado).
- GPU recomendadas para precisión completa: A100 80GB, H100 80GB, o múltiples GPU consumer con tensor parallelism.
- Opciones de despliegue: no hay información específica para este modelo; al seguir el layout de Qwen3.5, cabría esperar compatibilidad con stacks que soporten dicho esquema (vLLM, TGI, llama.cpp), pero no está verificado en la documentación disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| zils-z3-g1126a (este) | 27,36B | no disponible | Apache 2.0 | Derivado estructural, 0 descargas |
| dream-only/lg-decision-27B | 27,36B (presumiblemente idéntico) | no disponible | Apache 2.0 (según este repo) | Modelo base original |
| Alternativas de ~27B (p. ej. familias Qwen o Gemma) | ~27B | no disponible | variable | No se dispone de datos verificados en la información proporcionada |

La comparación relevante es exclusivamente con el modelo base: este repositorio no aporta diferencias de pesos, rendimiento ni licencia respecto a dream-only/lg-decision-27B. No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación facilitada.

## Limitaciones y advertencias

- No es un modelo nuevo: los pesos son byte-idénticos al modelo base; no debe presentarse como un fine-tuning ni como una mejora.
- Sesgos: desconocidos, heredados del modelo base no documentado.
- Riesgo de alucinación: el del modelo base; sin datos específicos.
- Compatibilidad frágil: el renombrado de tensores está pensado para validadores Zils concretos; otros cargadores que esperen el layout original `model.language_model.visual.*` fallarán al cargar la torre de visión.
- Soporte comunitario nulo: 0 descargas y 0 likes en el momento de la ficha, sin issues ni documentación adicional.
- Idiomas y contexto no documentados: no es posible garantizar comportamiento multilingüe ni ventanas largas sin consultar el modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia real del modelo base dream-only/lg-decision-27B, ya que este repo la declara por herencia sin aportar el texto completo más allá del campo en la model card.
- Fecha de creación anómala (2026-11-26) en los metadatos: conviene tratarla con cautela al citar el artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/godman0711/zils-z3-g1126a
- Modelo base: https://huggingface.co/dream-only/lg-decision-27B
- Revisión del modelo base referenciada: 105b19ba1dc824dd2018fadda752be6893647fe3
