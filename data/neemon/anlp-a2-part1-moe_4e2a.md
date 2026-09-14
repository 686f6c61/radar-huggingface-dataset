# neemon/anlp-a2-part1-moe_4e2a

## Resumen

El modelo `neemon/anlp-a2-part1-moe_4e2a` es un transformer decoder-only con capas feed-forward de tipo Mixture-of-Experts (MoE), desarrollado por el usuario neemon como entregable de la asignatura Advanced NLP (IIIT-H, Monsoon 2026). Se trata de un modelo entrenado desde cero (from-scratch) con 41.607.680 parámetros totales y 33.202.688 parámetros activos por token, 4 expertos enrutados y enrutamiento top-2, lo que supone un ahorro de cómputo de aproximadamente el 20 % respecto a un modelo denso con el mismo número de parámetros.

El problema que aborda es la traducción automática hacia inglés desde vietnamita y japonés, con una ventana de contexto muy reducida de 256 tokens y un vocabulario de 32.000 entradas. No es un modelo destinado a producción: su relevancia es fundamentalmente académica y didáctica, ya que sirve como referencia reproducible de cómo se implementa, entrena y evalúa un MoE de pequeño tamaño, y su checkpoint es público bajo licencia MIT.

El repositorio ocupa 0,2 GB y contiene únicamente el checkpoint (`model.pt`), no el código de arquitectura ni de entrenamiento, que residen en el repositorio de la asignatura. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni existe documentación adicional más allá de la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con feed-forward Mixture-of-Experts (4 expertos, top-2 routing) |
| Parametros totales | 41.607.680 |
| Parametros activos | 33.202.688 por token (de ellos, 8.404.992 en la capa MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | No disponible (solo se distribuye el checkpoint en el formato original de PyTorch; no hay versiones GGUF, AWQ ni GPTQ publicadas) |
| Idiomas soportados | Inglés (en), vietnamita (vi), japonés (ja) |
| Licencia | MIT |
| Formato de pesos | Checkpoint de PyTorch (`model.pt`), cargado con `torch.load(..., weights_only=False)`; no se distribuyen safetensors ni GGUF |

Otras especificaciones declaradas por el autor: `d_model` 512, `n_layers` 8, `n_heads` 8, `n_kv_heads` 8, `vocab_size` 32.000, `d_ff` 512, `n_shared_experts` 0, normalización RMSNorm. El repositorio no incluye tokenizador.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 8 capas con `d_model` de 512 y 8 cabezas de atención (con 8 cabezas de clave/valor, es decir, sin reducción de KV), seguido de un bloque feed-forward MoE con 4 expertos enrutados, sin expertos compartidos, y enrutamiento top-2: cada token se procesa por los dos expertos de mayor puntuación, lo que reparte los 16.809.984 parámetros del bloque feed-forward entre 8.404.992 activos por token. La normalización es RMSNorm y la dimensión de la capa feed-forward por experto es 512. Todos los parámetros se entrenaron desde cero, sin inicialización a partir de pesos preentrenados.

En cuanto a los datos, la model card indica que se puntuaron 16.696.256 tokens objetivo durante el entrenamiento, hasta alcanzar una mejor pérdida de validación de 2,3812 y una perplejidad de validación de 10,82. No se detalla la composición del corpus, el número total de tokens vistos ni si se aplicaron técnicas de alineación como RLHF o DPO, por lo que esos datos figuran como no disponibles. La evaluación sobre el conjunto de test reporta una perplejidad de 14,77 (en ambas direcciones) y un BLEU de 30,43 en vietnamita→inglés, 19,78 en japonés→inglés y 25,11 de media.

## Capacidades

- Traducción automática hacia inglés desde vietnamita y japonés, que es la tarea declarada en el pipeline (`translation`) y la única evaluada en la model card.
- Generación de texto autoregresiva genérica, al ser un transformer decoder-only causal.
- Enrutamiento condicional por token mediante MoE top-2, con 4 expertos y sin expertos compartidos.
- Ventana de contexto de 256 tokens, suficiente para frases o párrafos cortos, no para documentos.
- No hay evidencia de soporte de tool calling, function calling, uso de agentes, modo de razonamiento explícito (thinking), visión, audio ni multimodalidad.
- No se documentan capacidades multilingües más allá de los tres idiomas declarados, ni se especifica la calidad de la generación en direcciones distintas de las evaluadas (por ejemplo, inglés→vietnamita o inglés→japonés).

## Casos de uso

- Traducción de frases cortas vi→en y ja→en en proyectos académicos: el modelo está pensado para reproducir el experimento del assignment y comparar configuraciones de MoE frente a alternativas densas con presupuesto de parámetros similar.
- Prototipado de investigación en enrutamiento MoE: al ser un checkpoint pequeño con 4 expertos y top-2, permite estudiar balanceo de carga, colapso de expertos y especialización con un coste de cómputo mínimo.
- Material docente para cursos de NLP: sirve para ilustrar el ciclo completo de entrenamiento desde cero, tokenización, cálculo de perplejidad y evaluación con BLEU en un entorno controlado.
- Aprendizaje de la carga y manipulación de checkpoints personalizados: el modelo obliga a usar código propio de arquitectura y a cargar el estado con `torch.load(weights_only=False)`, lo que resulta útil como ejercicio de integración.
- Experimentos de ajuste fino o ablación sobre un modelo de 41,6 M de parámetros, viables en una GPU de consumo o incluso en CPU con un presupuesto de tiempo reducido.
- Traducción de textos muy breves en un entorno totalmente local y sin conexión, ya que el checkpoint completo ocupa menos de 0,2 GB y no requiere servicios externos.
- No es adecuado para traducción de documentos largos, subtitulado o localización profesional, dado el límite de 256 tokens y la ausencia de evaluación en esos escenarios.

## Benchmarks y rendimiento

Resultados de test publicados por el autor (traducción y lenguaje):

| Metrica | Valor |
|---|---|
| Perplejidad (ambas direcciones) | 14,77 |
| BLEU vi→en | 30,43 |
| BLEU ja→en | 19,78 |
| BLEU medio | 25,11 |
| Perdida de validacion (mejor) | 2,3812 |
| Perplejidad de validacion (mejor) | 10,82 |
| Tokens objetivo puntuados en entrenamiento | 16.696.256 |

No se han publicado resultados de benchmarks en la informacion disponible para pruebas estandarizadas como MMLU, HumanEval, GSM8K, MT-Bench ni para otras direcciones de traducción distintas de vi→en y ja→en.

## Requisitos de hardware

- Pesos en fp32: aproximadamente 166 MB (41,6 M de parámetros × 4 bytes). En fp16 serían unos 83 MB y en int8 unos 42 MB, aunque no se distribuyen versiones cuantizadas oficiales.
- Memoria adicional: la caché KV es despreciable con 256 tokens de contexto, 8 capas y 8 cabezas KV de dimensión 64 (del orden de 8 MB en fp32 para una secuencia completa).
- VRAM total estimada para inferencia: por debajo de 1 GB en fp32, incluyendo activaciones y overhead del runtime; cualquier GPU con 2 GB o más es suficiente.
- Cabe holgadamente en GPU de consumo: GTX 1050 Ti, GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090, así como en iGPU modernas y en CPU.
- Despliegue: no hay soporte en vLLM, TGI, Ollama o llama.cpp, ya que la arquitectura MoE personalizada y el formato `model.pt` requieren el código de la asignatura. La vía práctica es cargar el `state_dict` en PyTorch e implementar el bucle de generación propio.
- Latencia y throughput: no disponible; no se han publicado mediciones. Dado el tamaño y el contexto, se espera un throughput alto en GPU, pero es una estimación cualitativa, no un dato medido.

## Comparativa con modelos similares

No se dispone de datos comparativos verificados en la informacion proporcionada. Este checkpoint no publica métricas frente a alternativas de traducción de propósito general, y sus resultados de BLEU corresponden a un conjunto de test propio del assignment, por lo que no son directamente equiparables a los de otros modelos.

| Modelo | Parametros | Contexto | BLEU vi→en | BLEU ja→en | Licencia |
|---|---|---|---|---|---|
| neemon/anlp-a2-part1-moe_4e2a | 41,6 M (33,2 M activos) | 256 | 30,43 | 19,78 | MIT |
| Alternativas comparables (por ejemplo, modelos de traducción de tamano similar) | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Contexto muy corto: 256 tokens limitan las entradas a frases o párrafos breves; no admite documentos, conversaciones largas ni recuperación aumentada con contexto extenso.
- Modelo de investigación académica: fue entrenado como parte de un assignment, sin despliegue, mantenimiento ni soporte previstos.
- Volumen de entrenamiento reducido: 16,7 millones de tokens objetivo puntuados, muy por debajo de los corpus habituales en traducción automática, lo que se traduce en cobertura léxica y de dominios limitada.
- Riesgo de alucinación y de traducciones inventadas fuera de los dominios vistos, especialmente en japonés, donde el BLEU (19,78) es notablemente inferior al de vietnamita (30,43).
- Sesgos no documentados: no se publica información sobre la composición del corpus, filtrado, idioma de origen de los datos ni análisis de sesgos demográficos o de género.
- Solo se evalúa la dirección hacia inglés; no hay métricas para en→vi, en→ja ni para traducción entre vi y ja.
- El repositorio contiene únicamente el checkpoint: sin el código de arquitectura de la asignatura no es posible instanciar el modelo, y no se incluye tokenizador.
- La carga requiere `weights_only=False` en `torch.load`, lo que implica ejecutar código no serializado de forma segura; conviene auditar el fichero antes de cargarlo en entornos no confiables.
- Licencia MIT: permite uso comercial y modificación, pero sin garantías y conservando el aviso de copyright; al no existir atribución de datos de entrenamiento, la procedencia del corpus es desconocida.
- La fecha de creación registrada en HuggingFace (14 de septiembre de 2026) es posterior a la fecha actual, un dato anómalo que conviene verificar antes de citar el modelo.
- Cero descargas y cero "likes" en el momento de redactar esta ficha: no hay evidencia de uso en producción ni validación independiente por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/neemon/anlp-a2-part1-moe_4e2a
- Repositorio de la asignatura (arquitectura, entrenamiento y evaluación): no disponible en la informacion proporcionada
- Paper o publicación técnica asociada: no disponible en la informacion proporcionada
- Demo o Space: no disponible en la informacion proporcionada
- Búsqueda web relevante: no se han encontrado resultados relacionados con el modelo; las consultas devolvieron exclusivamente páginas sobre software de edición de imágenes sin relación alguna con este checkpoint.
