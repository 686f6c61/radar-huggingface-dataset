# bearzi/Qwen3.8-Flash-Next-oQ2eL

## Resumen

Qwen3.8-Flash-Next-oQ2eL es una cuantización experimental de 2 bits del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario bearzi. No se trata de un modelo entrenado desde cero, sino de un checkpoint derivado que aplica el cuantizador oQ de oMLX en su modo oQe, con el plugin omlx-oqel 0.1.0, sobre los pesos originales de Qwen. El objetivo es reducir el peso en disco y en memoria de un modelo de aproximadamente 76.000 millones de parámetros hasta unos 104 GB, a costa de una pérdida de calidad notable frente a la referencia en BF16.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de cuantización agresiva (2 bits en los expertos enrutados de un modelo MoE) pensada para entornos Apple Silicon con memoria unificada, donde cada gigabyte cuenta. Por otro, advierte de que el checkpoint es experimental: requiere un fork no fusionado de oMLX y un plugin específico, y no carga en oMLX estándar, mlx-lm ni mlx-vlm. El autor indica explícitamente que 2 bits supone un escalón grande de degradación y que solo debería usarse cuando la memoria impida 3 o 4 bits.

El modelo base es un transformer con mezcla de expertos (MoE), con 48 capas MoE más una capa MTP (multi-token prediction), según se desprende de la descripción de las 147 matrices de expertos cuantizadas. La model card no detalla la longitud de contexto, los idiomas ni los datos de entrenamiento del modelo original, por lo que esos datos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); 48 capas MoE mas una capa MTP (multi-token prediction) |
| Parametros totales | 75.955.152.659 (aprox. 76 000 millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits en expertos enrutados (oQeL, tablas de 4 niveles, grupos de 16 pesos con escala E2M5 y escala bfloat16 por fila); MLX affine 8 bits en el resto; tabla PLE en FP8 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (pesos); plugin omlx-oqel bajo Apache-2.0 |
| Formato de pesos | safetensors, libreria mlx (layout oQeL, revision 1) |

## Arquitectura y entrenamiento

El checkpoint no incluye entrenamiento propio: es una conversión de pesos del modelo base Qwen/Qwen3.8-Flash-Next. La arquitectura subyacente es un transformer con mezcla de expertos, con 48 capas MoE y una capa MTP adicional, según la descripción de las 147 matrices de expertos enrutados (gate, up y down de las 48 capas MoE y de la capa MTP). La cuantización se aplica de forma selectiva: los expertos enrutados se comprimen a 2 bits con el formato oQeL, mientras que el resto de los pesos usa MLX affine de 8 bits y la tabla de embeddings por capa (PLE) se toma en FP8 de la tabla oficial de Qwen.

La innovación técnica principal es el formato oQeL: cada matriz de experto se codifica sobre una tabla de 4 niveles ajustada específicamente a los expertos de este modelo, en grupos de 16 pesos con un byte de escala E2M5 por grupo y una escala bfloat16 por fila. La release 2 sustituye la tabla PLE en BF16 por la tabla FP8 oficial de Qwen y se construye sobre el fork de oMLX tras fusionar upstream, incluyendo el refinamiento de redondeo oQe (#5292). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base usó RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.8-Flash-Next, aunque degradadas por la cuantización de 2 bits en los expertos.
- Predicción multi-token (MTP): la capa MTP permite decodificación especulativa; el autor mide 1,497 borradores aceptados por ciclo de verificación (intervalo del 95 %: 1,354-1,643).
- Generación de código: el autor evalúa la divergencia KL sobre documentos de código, lo que indica uso previsto en ese dominio.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (visión, audio, thinking mode): no disponibles en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon con memoria unificada limitada: el checkpoint ocupa unos 104 GB, por lo que encaja en equipos como un Mac Studio M3 Ultra con 128 GB o más, donde un build de 4 bits no cabría junto al resto del sistema.
- Evaluación de técnicas de cuantización extrema: útil para investigadores que quieran medir el impacto de 2 bits en expertos MoE frente a 3 o 4 bits, usando las métricas KL publicadas como referencia.
- Pruebas de decodificación especulativa con MTP: la capa MTP y la métrica de borradores aceptados permiten estudiar el rendimiento de la decodificación especulativa en entornos MLX.
- Prototipado de pipelines de código en local: el autor calibra y evalúa sobre documentos de código, de modo que el modelo puede usarse para experimentar con generación de código en un equipo de sobremesa, asumiendo la pérdida de calidad.
- Investigación sobre formatos de cuantización (oQeL): sirve como caso de estudio de un formato con tablas de 4 niveles y escalas por grupo, comparable con affine estándar.
- Despliegue experimental en flujos oMLX: para equipos que ya trabajen con el fork quant-plugins-poc y el plugin omlx-oqel, permite validar la integración de checkpoints oQeL en revisiones futuras.

## Benchmarks y rendimiento

| Metrica | oQ2eL | oQ2e (stock refinado) |
|---|---|---|
| KL a BF16, codigo | 0,1067 | 0,1369 |
| KL a BF16, prosa inglesa | 0,2008 | 0,2436 |
| Borradores MTP aceptados por ciclo de verificacion (32 prompts; intervalo del 95 %) | 1,497 [1,354, 1,643] | 1,419 [1,292, 1,559] |

La KL es la divergencia full-vocabulary KL(BF16 ‖ cuantizado) por token, promediada sobre dos documentos de 16.384 tokens (código y prosa inglesa), frente a la misma referencia BF16 de la release 1. La aceptación MTP es la media sobre 32 prompts fijos de tokens borrador aceptados por ciclo de verificación (greedy, 128 tokens cada uno), con MTP adaptativo. Las velocidades de decodificación y prefill en ambos Macs están en progreso según el autor. El propio autor advierte que la KL a BF16 de 2 bits es unas 7 veces la del build de 4 bits.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 104,1 GB; se necesita memoria unificada o VRAM suficiente para cargar el checkpoint completo, ya que el formato oQeL no está pensado para descarga parcial trivial.
- GPU recomendadas: Apple Silicon con memoria unificada grande; el autor mide en un M3 Ultra. No se documentan pruebas en A100, H100 ni RTX 4090.
- ¿Cabe en GPU de consumo? No hay datos que lo confirmen; 104 GB superan la VRAM de cualquier GPU de consumo actual (RTX 4090: 24 GB).
- Opciones de despliegue: exclusivamente el fork yohann-bearzi/omlx (rama quant-plugins-poc) con el plugin omlx-oqel 0.1.0. oMLX estándar, mlx-lm y mlx-vlm no pueden cargarlo.
- Latencia y throughput: no disponibles; el autor indica que las mediciones de decodificación y prefill están en curso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bearzi/Qwen3.8-Flash-Next-oQ2eL | 75.955.152.659 | no disponible | 2 bits (oQeL) en expertos, 8 bits affine en el resto, PLE en FP8 | Qwen Community License 1.0 | Experimental; requiere fork de oMLX y plugin |
| Qwen/Qwen3.8-Flash-Next (BF16) | no disponible en esta ficha | no disponible | BF16 | Qwen Community License 1.0 | Modelo base oficial |
| oQ2e (stock refinado) | mismo modelo base | no disponible | 2 bits con formato stock, PLE en FP8 | Qwen Community License 1.0 | Referencia interna del autor, no publicada como repo independiente en esta informacion |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Degradación de calidad: el autor advierte que 2 bits es un escalón grande; la KL a BF16 es aproximadamente 7 veces la del build de 4 bits, con 0,1067 en código y 0,2008 en prosa.
- Dependencia de software no fusionado: requiere el fork yohann-bearzi/omlx (rama quant-plugins-poc) y el plugin omlx-oqel 0.1.0; no funciona con oMLX estándar, mlx-lm ni mlx-vlm.
- Inestabilidad del formato: el layout oQeL (revisión 1) y los kernels del plugin pueden cambiar, y una versión posterior del plugin podría rechazar este checkpoint, obligando a recuantizar.
- Estado de publicación: la release 2 estaba en curso en el momento de la información; los archivos podían estar incompletos y el autor pedía no descargar todavía.
- Licencia: los pesos heredan la Qwen Community License 1.0, con posibles restricciones para uso comercial; conviene revisar el texto completo antes de producción.
- Idiomas, contexto y sesgos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; la degradación por cuantización puede agravarlo.
- Sin benchmarks estándar (MMLU, HumanEval, GSM8K): no publicados; solo hay métricas de divergencia KL y aceptación MTP.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bearzi/Qwen3.8-Flash-Next-oQ2eL
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Fork de oMLX (rama quant-plugins-poc): https://github.com/yohann-bearzi/omlx/tree/quant-plugins-poc
- Plugin omlx-oqel: https://github.com/yohann-bearzi/omlx-oqel
