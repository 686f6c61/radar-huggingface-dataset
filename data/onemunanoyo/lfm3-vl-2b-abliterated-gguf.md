# onemunanoyo/LFM3-VL-2B-Abliterated-GGUF

## Resumen

LFM3-VL-2B-Abliterated-GGUF es una derivación "abliterada" del modelo multimodal LiquidAI/LFM3-VL-2B, publicada por el usuario onemunanoyo en Hugging Face. El modelo original, desarrollado por Liquid AI, es un modelo de lenguaje y visión de aproximadamente 1.730 millones de parámetros (1,728.801.600 segun los pesos en safetensors) que acepta entradas de imagen y texto y genera texto. Esta versión concreta no ha sido reentrenada ni afinada: es una edición quirúrgica de pesos que elimina una dirección de rechazo (refusal direction) del modelo base para reducir drásticamente la tasa de negativas ante peticiones que el modelo original rechazaría.

La modificación consiste en proyectar fuera una dirección calculada a partir de la diferencia media de estados ocultos entre prompts dañinos y benignos, aplicada sobre 40 matrices residuales de las capas 4 a 23. El resultado es un modelo que conserva la torre de visión y el proyector multimodal intactos (384 de 424 tensores sin cambios) y que mantiene un comportamiento lingüístico cercano al original, con un aumento de perplejidad de solo +1,9 % en texto crudo respecto al base.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de "abliteration" aplicada a un modelo multimodal pequeño y su empaquetado en GGUF para llama.cpp; por otro, advierte de que se trata de un artefacto con fines de investigación sobre alineación y seguridad, con una licencia restrictiva heredada y sin garantías de soporte por parte del desarrollador original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje con torre de visión y proyector); arquitectura interna no detallada en la informacion disponible, identificada como `lfm3` por llama.cpp |
| Parametros totales | 1.728.801.600 (~1,73 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `-c 8192` |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M (GGUF); proyector de visión en BF16 |
| Idiomas soportados | no disponible (los benchmarks usan un conjunto japones/ingles) |
| Licencia | LFM Open License v1.0 (`lfm1.0`, etiquetada como `other`) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base LiquidAI/LFM3-VL-2B es un modelo image-text-to-text de Liquid AI que combina un backbone de lenguaje con una torre de visión y un proyector multimodal. La model card no detalla la arquitectura interna (tipo de atención, capas, dimensiones), pero la nomenclatura de los tensores modificados revela componentes concretos: `self_attn.o_proj`, `conv.out_proj`, `feed_forward.w2`, además de `q/k/v_proj`, `conv.in_proj`, `conv.conv`, `attn.gate_proj`, `w1/w3` y `lm_head` con pesos atados (tied). La presencia de módulos `conv` sugiere componentes convolucionales dentro del bloque, aunque no se especifica su función exacta.

Esta versión derivada no incluye entrenamiento, fine-tuning ni destilación: es exclusivamente una edición de pesos. Se calculó una dirección de rechazo como la diferencia media por capa de estados ocultos entre 416 prompts dañinos y 416 prompts benignos en ingles, tomada en el último token del prompt con el modo thinking activado. Esa dirección se restó con fuerza α = 1,3 de 40 matrices residuales de las capas 4 a 23 (10 `self_attn.o_proj`, 10 `conv.out_proj` y 20 `feed_forward.w2`). La proyección se realiza en FP32 y los pesos se guardan en BF16, con un cambio relativo medio de 2,97e-04 y máximo de 5,37e-04. La ortogonalización tiene en cuenta el `sandwich-norm`: como el modelo suma la salida de cada writer al residual tras `post_operator_norm` / `post_ffn_norm`, la proyección apunta a `g ⊙ u` (donde g es la escala aprendida de la norma) en lugar de a `u`, evitando que el componente eliminado reaparezca tras la normalización. No se tocan embeddings, normas, proyecciones q/k/v, `conv.in_proj`, `conv.conv`, `attn.gate_proj`, `w1/w3`, `lm_head` ni la torre de visión.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `image-text-to-text`, etiqueta `conversational`).
- Comprensión de imágenes y respuesta en texto: requiere el fichero `mmproj` para aceptar entradas visuales; sin él, el modelo funciona solo con texto y rechaza imágenes.
- Modo "thinking" activado por defecto en la plantilla de chat, con razonamiento interno extenso (mediana de ~3,4k tokens en el conjunto de evaluación del autor). Se puede desactivar con `"chat_template_kwargs": {"enable_thinking": false}`.
- Reducción drástica de rechazos: 1/84 en BF16 frente a 58/84 del modelo base sobre el conjunto de evaluación del autor.
- Capacidades multilingües: no documentadas explícitamente; el conjunto de evaluación mezcla japones e ingles.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modo thinking sugiere cierta capacidad de razonamiento extendido, pero no hay evidencia publicada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo la eliminación de una dirección de rechazo afecta al comportamiento del modelo y a su perplejidad, comparando directamente con el base (58/84 frente a 1/84 rechazos) en entornos controlados.
- Evaluación de técnicas de abliteration en modelos multimodales: al mantener intacta la torre de visión, sirve para medir si la edición de pesos del backbone lingüístico altera la comprensión de imágenes o solo el comportamiento de rechazo.
- Despliegue local en llama.cpp para pruebas de concepto: con Q4_K_M (1,10 GB) y el proyector mmproj (379 MB) cabe en GPUs de consumo y permite iterar rápidamente sobre prompts y plantillas de chat.
- Análisis de robustez de cuantizaciones: los datos de perplejidad por cuantización (Q8_0 −0,1 %, Q6_K −0,7 %, Q4_K_M +8,7 %) permiten estudiar la degradación de un modelo editado al cuantizarlo, un caso poco documentado.
- Generación de descripciones de imágenes en pipelines experimentales: usando `llama-server` con `--mmproj`, se puede integrar en flujos de captioning o VQA para comparar el comportamiento del modelo abliterado frente al original.
- Estudio de la verbosidad del modo thinking: la necesidad de `max_tokens >= 4096` y la mediana de ~3,4k tokens de razonamiento lo convierten en un caso útil para analizar coste y latencia de la decodificación con thinking en modelos pequeños.
- Docencia y divulgación: ejemplo práctico y reproducible de edición de pesos (proyección ortogonal con sandwich-norm) sobre un modelo de 1,73 B, con scripts de despliegue incluidos en la model card.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor proceden de un conjunto de evaluación japonés propio (84 prompts dañinos/NSFW y 8 benignos), con etiquetado de rechazos mediante un modelo decisor separado de 3B (`d1-3B`), no por coincidencia de cadenas. Muestreo: temperature 0,1, top_k 50, top_p 1,0, repetition_penalty 1,1, thinking ON, max_new 4096.

| Modelo | Rechazos (84 prompts, thinking ON) |
|---|---|
| LFM3-VL-2B (base) | 58 / 84 |
| Este modelo (BF16) | 1 / 84 |

| Fichero | PPL (llama.cpp `llama-perplexity`, corpus JA/EN, 512 ctx) | vs. BF16 | Rechazos (84 prompts) |
|---|---|---|---|
| BF16 | 38,78 | — | 1 / 84 |
| Q8_0 | 38,74 | −0,1 % | 0 / 84 |
| Q6_K | 38,50 | −0,7 % | 0 / 84 |
| Q4_K_M | 42,17 | +8,7 % | 2 / 84 |

El autor indica además que la perplejidad en texto crudo del modelo es +1,9 % respecto al base (IC 95 %: −1,5 a +5,3 %). No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, MMMU u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): BF16 ~3,47 GB; Q8_0 ~1,85 GB; Q6_K ~1,43 GB; Q4_K_M ~1,10 GB. Hay que sumar el proyector de visión mmproj en BF16 (~379 MB) si se usan imágenes.
- El contexto de 8192 tokens y el modo thinking largo (mediana ~3,4k tokens generados) incrementan el consumo de KV cache; con `max_tokens >= 4096` conviene reservar VRAM adicional.
- GPU recomendadas: cualquier GPU con al menos ~4-6 GB de VRAM para Q4_K_M o Q6_K con contexto moderado; para BF16 con contexto largo se recomienda 8 GB o más. No se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, con las cuantizaciones Q4_K_M, Q6_K y Q8_0; el tamaño reducido del modelo lo hace apto para tarjetas de gama media.
- Opciones de despliegue: llama.cpp (requiere build b12040 o superior; versiones anteriores fallan con `unknown model architecture: 'lfm3'`). Ejemplo del autor:
  ```bash
  llama-server -m LFM3-2B-VL-Abliterated-Q8_0.gguf \
               --mmproj mmproj-LFM3-2B-VL-Abliterated-BF16.gguf \
               --jinja --reasoning-format none -ngl 99 -c 8192
  ```
  El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI, pero no se detalla en la model card. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-VL-2B-Abliterated (este) | ~1,73 B | no disponible (ejemplo con 8192) | LFM Open License v1.0 (uso comercial < 10 M USD de ingresos) | GGUF (BF16, Q8_0, Q6_K, Q4_K_M) | Derivado abliterado; 1/84 rechazos; visión intacta |
| LiquidAI/LFM3-VL-2B (base) | ~1,73 B | no disponible | LFM Open License v1.0 | safetensors (y GGUF de terceros) | Modelo original; 58/84 rechazos en el mismo conjunto |
| Alternativas de ~2 B multimodales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se han proporcionado datos de benchmarks estándar ni de otros modelos comparables, por lo que la comparativa se limita al modelo base y a las cifras del conjunto de evaluación del autor.

## Limitaciones y advertencias

- El modelo está deliberadamente "abliterado": se ha eliminado una dirección de rechazo, por lo que es previsible que genere contenido que el modelo base rechazaría. No debe desplegarse en producción orientada al público sin filtros externos de seguridad.
- Los benchmarks de rechazo proceden de un conjunto propio de 84 prompts y un etiquetador automático de 3B; no son comparables con evaluaciones de seguridad estandarizadas y no deben interpretarse como una medida general de seguridad.
- Riesgo de alucinación: no evaluado en la información disponible; el modo thinking largo puede producir cadenas de razonamiento plausibles pero incorrectas.
- La perplejidad en texto crudo aumenta +1,9 % respecto al base (IC 95 %: −1,5 a +5,3 %), y Q4_K_M añade +8,7 % de PPL, con posible degradación adicional en tareas multimodales no medidas.
- Idiomas soportados no documentados; la evaluación se limita a japonés e inglés.
- Longitud de contexto oficial no indicada en la model card; el valor 8192 solo aparece como parámetro de ejemplo de `llama-server`.
- Licencia LFM Open License v1.0: el uso comercial está limitado a entidades con ingresos anuales inferiores a 10 millones de USD. Liquid AI no respalda ni da soporte a este modelo derivado.
- Requiere llama.cpp b12040 o superior; sin `--mmproj` no procesa imágenes. El modo thinking está activado por defecto y exige `max_tokens >= 4096` para no truncar la respuesta.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor no es el desarrollador original: no hay garantías de mantenimiento ni de calidad a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/onemunanoyo/LFM3-VL-2B-Abliterated-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Licencia LFM Open License v1.0: incluida como fichero `LICENSE` en el repositorio del modelo
- llama.cpp (runtime requerido, build b12040 o superior): no se proporciona enlace en la información disponible
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada
