# hletrd/Qwen3-4B-BFP4

## Resumen

Qwen3-4B-BFP4 es una versión cuantizada del modelo Qwen/Qwen3-4B, publicada por el usuario hletrd (atribuida a Xylolabs en la model card) y orientada a inferencia en dispositivos con NPUs que ejecutan formatos block-float. El modelo conserva la arquitectura original de Qwen3-4B (transformer denso de aproximadamente 4.411 millones de parámetros) pero redondea los pesos de las proyecciones de atención y MLP al formato bfloat4_b, un esquema de coma flotante por bloques de 16 valores que comparten un exponente de 8 bits y mantienen signo más mantisa de 3 bits (4,5 bits por peso efectivo).

La relevancia de esta ficha es doble: por un lado, documenta un checkpoint de cuantización experimental que no busca reducir el tamaño en disco (los ficheros almacenan los valores como bf16, 8,8 GB) sino producir pesos que caigan exactamente sobre la rejilla block-float, de modo que un acelerador que soporte estos formatos los empaquete sin redondeo adicional. Por otro, sirve como referencia metodológica de cómo se aplica GPTQ con búsqueda de exponente por bloque para preservar la fidelidad respecto al modelo base en bf16.

El modelo no incluye datos de benchmarks de tareas ni información sobre idiomas en los metadatos de Hugging Face (el campo de idiomas figura como no disponible). Su licencia es Apache 2.0, heredada del modelo base, y su uso previsto es la generación de texto conversacional con la librería transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), 36 capas |
| Parámetros totales | 4.411.424.256 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bfloat4_b (proyecciones q, k, v, o, gate, up y down); bf16 en embedding, LM head, normas y biases; media de 5,61 bits por peso |
| Idiomas soportados | no disponible en metadatos; la calibración usó textos en inglés y coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (valores almacenados en bf16 sobre rejilla block-float); incluye quant4.json con el formato por capa |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del Qwen3-4B original, un transformer denso de 36 capas con proyecciones de atención (q, k, v, o) y de MLP (gate, up, down). La cuantización se realizó con GPTQ (Frantar et al., 2022) aplicado por proyección: los canales de entrada se ordenan de forma decreciente según la diagonal del Hessiano, se usan bloques de 128 columnas y un damping de 0,1 veces la media de la diagonal. Para bfloat4_b los bloques de una columna son sus grupos de 16 canales de salida, y el exponente de cada bloque se elige a partir de la columna actualizada tal como lo hará el empaquetador final.

La innovación técnica principal es la búsqueda de exponente por bloque: para cada bloque se prueban dos exponentes (el del valor máximo y uno inferior, que recorta los valores mayores y reduce a la mitad el paso para el resto) y se conserva el de menor error. Todos los valores resultantes son exactamente representables en el formato. La calibración empleó 65.536 tokens de WikiText-2 (train) y de artículos de Wikipedia en coreano, ejecutados a través del modelo en bf16, sin solapamiento con los textos de evaluación. El LM head está atado al embedding y permanece en bf16, igual que las normas, biases y el resto de tensores del modelo de lenguaje.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3-4B.
- Razonamiento con modo "thinking" (la evaluación del autor distingue entre thinking on y thinking off).
- Generación de código y matemáticas: capacidades propias del modelo base, no verificadas con benchmarks en esta ficha.
- Soporte de tool calling / function calling: no documentado explícitamente en la información disponible; debe asumirse el del modelo base, sin confirmación.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no declaradas en los metadatos; la calibración incluyó inglés y coreano.
- No se documentan capacidades de visión ni de audio.

## Casos de uso

- Inferencia en NPUs con soporte de block-float: el caso de uso central del checkpoint. Un acelerador que ejecute bfloat4_b puede empaquetar los pesos sin redondeo adicional, obteniendo 2,822 GB de pesos empaquetados frente a los 8,8 GB de los ficheros en bf16.
- Despliegue embebido con memoria limitada: al almacenar los pesos en un formato de 4,5 bits por peso efectivo, el modelo encaja en dispositivos con presupuesto de memoria reducido, siempre que la herramienta de despliegue entienda el formato block-float.
- Evaluación de pipelines de cuantización: sirve como referencia para comparar la fidelidad de GPTQ con búsqueda de exponente frente a cuantizaciones tipo Q4_K_M de llama.cpp, usando las métricas de KL y acuerdo top-1 publicadas.
- Generación de texto conversacional en inglés y coreano: la calibración y la evaluación cubren ambos idiomas, por lo que es un candidato razonable para asistentes en esos idiomas, con la cautela de que no hay benchmarks de tareas.
- Prototipado con transformers: el checkpoint carga con `AutoModelForCausalLM.from_pretrained` en bf16 y `device_map="auto"`, lo que permite validar el comportamiento del modelo redondeado antes de portarlo a hardware específico.
- Investigación sobre formatos de coma flotante por bloques: el fichero `quant4.json` documenta el formato por capa y proyección, útil para estudiar el impacto del redondeo por bloque en la calidad del modelo.

## Benchmarks y rendimiento

La model card no publica benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). Sí publica métricas de fidelidad respecto al modelo en bf16:

| Métrica | Este modelo (5,61 bits/peso) | Q4_K_M de llama.cpp (4,95 bits/peso) |
|---|---:|---:|
| KL media a bf16 | 0,0711 | 0,06581 |
| Acuerdo top-1 (%) | 89,30 | 89,61 |
| Respuestas perdidas (de 33 + 7) | 1 | 0 |

Las métricas se calculan sobre 16.240 posiciones de cuatro textos (inglés y coreano, cada uno como texto plano y como respuesta de un turno de chat con thinking off). El criterio del autor (KL media como máximo 1,5 veces la de Q4_K_M y como máximo una respuesta perdida más) se cumple: la KL es 1,08 veces la de Q4_K_M.

## Requisitos de hardware

- VRAM estimada: los pesos empaquetados en bfloat4_b ocupan 2,822 GB; los ficheros en bf16 ocupan 8,8 GB. La inferencia en transformers requiere cargar los tensores en bf16, por lo que la VRAM efectiva se acerca al tamaño del repo más el estado de activaciones y caché KV.
- GPU recomendadas: no disponibles en la información proporcionada. El checkpoint está pensado para NPUs con soporte de block-float, no para GPUs convencionales.
- GPU de consumo: no hay datos que confirmen compatibilidad ni rendimiento en RTX 4090 u otras GPU de consumo; el formato block-float no es estándar en CUDA.
- Opciones de despliegue: transformers (documentado en la model card); text-generation-inference figura en los tags; llama.cpp, vLLM, Ollama y TGI no están confirmados para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-BFP4 | 4.411 M | no disponible | bfloat4_b (5,61 bits/peso) | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3-4B (bf16) | 4.411 M | no disponible | bf16 | Apache 2.0 | Hugging Face |
| Qwen3-4B en Q4_K_M (llama.cpp) | 4.411 M | no disponible | Q4_K_M (4,95 bits/peso) | Apache 2.0 | vía llama.cpp |

La comparación de rendimiento entre estas variantes solo está disponible en las métricas de fidelidad a bf16 de la sección anterior; no hay benchmarks de tareas para ninguna de ellas en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado benchmarks de tareas; las métricas de la model card miden cercanía al modelo bf16, no calidad absoluta.
- El formato bfloat4_b requiere hardware o software que lo soporte; en GPUs convencionales el checkpoint se carga como bf16 (8,8 GB) y no se aprovecha el empaquetado.
- El campo de idiomas no está declarado en los metadatos; la calibración y la evaluación se limitan a inglés y coreano.
- La longitud de contexto no está documentada en la información disponible.
- Riesgo de alucinación y sesgos: inherentes al modelo base Qwen3-4B; no se documentan análisis específicos para esta cuantización.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo se distribuye "as is" y sin garantías de ningún tipo.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.
- La autoría se atribuye a hletrd en Hugging Face y a Xylolabs en la model card; conviene verificar la procedencia antes de un despliegue crítico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/Qwen3-4B-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Paper de GPTQ (Frantar et al., 2022): no disponible en la información proporcionada (referenciado en la model card sin enlace)
- Repositorio, blog o demo adicionales: no disponibles en la información proporcionada
