# ceselder/glm-5.3-olens-reconstructor

## Resumen

`ceselder/glm-5.3-olens-reconstructor` no es un modelo generativo de texto, sino un conjunto de adaptadores de interpretabilidad que reconstruyen direcciones de activación del modelo `nvidia/GLM-5.3-NVFP4`. En concreto, recibe una secuencia corta de tokens (un span de 4 a 16 tokens, o un span de exactamente 12 o 16 tokens según la variante) y predice la activación residual media-centrada del bloque 51 del modelo base congelado en la posición inmediatamente anterior al span. Es la mitad "texto a activación" del *oracle lens* de GLM-5.3, publicado por el usuario ceselder dentro de la colección `glm5.3-olens`.

El repositorio contiene siete variantes: tres reconstructores basados en LoRA con rango 512 (`lora_ar_h51_bare`, `lora_ar_h51_sink`, `lora_ar_h51_sink16`) y cuatro mapas afines de forma cerrada (`affine_k12_bare`, `affine_k12_sink`, `affine_k16_bare`, `affine_k16_sink`). Los LoRA se aplican sobre las proyecciones MLA y los expertos compartidos de los bloques 0 a 51 del base, sumando unos 2,9 mil millones de parámetros en fp32 sobre 407 módulos, mientras que los expertos enrutados permanecen congelados. La variante `lora_ar_h51_sink16` actúa además como modelo de recompensa del RL del lens en `ceselder/glm-5.3-olens-lens`, con recompensa `clamp(cos(AR(bullet), h51 - mu), 0)^2`.

Su relevancia es acotada pero específica: ofrece una función diferenciable y barata que aproxima activaciones internas de un modelo grande sin ejecutar el modelo completo sobre cada span candidato, con una coseno centrada en held-out de 0,391 sobre spans de 16 tokens (frente a 0,400 del AR de la capa 42 de Qwen3.6-27B, receta de la que se porta). Es material de investigación en interpretabilidad, no un componente listo para producto. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores rsLoRA (r=512, alpha=45) sobre proyecciones MLA (`q_a`, `q_b`, `kv_a_with_mqa`, `kv_b`, `o`) y expertos compartidos (gate/up/down) de los bloques 0..51 de GLM-5.3, más una `value_head` lineal `Linear(6144, 6144)`; variantes alternativas de mapa afín cerrado `W_k^T (x - mu_x) + mu_y` |
| Parámetros totales | Adaptador LoRA: ~2,9 mil millones de parámetros fp32 en 407 módulos (fichero `adapter_model.safetensors` de 11,5 GB). Del modelo base: no disponible |
| Parámetros activos | No aplica al adaptador (no es MoE). Del base GLM-5.3 (MoE con expertos enrutados y expertos compartidos): no disponible |
| Longitud de contexto | No disponible para el base. El reconstructor opera sobre spans de 4-16 tokens (LoRA), de exactamente 12 o 16 tokens (mapas afines) y evalúa lecturas en las posiciones 1, 8 y 16 |
| Tipos de cuantización | Base: expertos enrutados en NVFP4 (descuantizados por trozos dentro de GEMM agrupados), atención y expertos compartidos en bf16. Adaptador: fp32. GGUF/INT8/INT4 del adaptador: no disponible |
| Idiomas soportados | No disponible. El corpus de entrenamiento procede de FineFineWeb (índices 3417..3432) sin especificación de idioma en la información disponible |
| Licencia | `nvidia-open-model-license` (etiqueta `license: other`), heredada del modelo base |
| Formato de pesos | `adapter_model.safetensors` + `adapter_config.json` (PEFT); `value_head.pt`, `centre_mean.pt`, `ar_config.json`; en las variantes afines: `affine.pt`, `mu.pt`, `meta.json`. Librería declarada: `peft` |

## Arquitectura y entrenamiento

El reconstructor LoRA envuelve los primeros 52 bloques del base congelado `nvidia/GLM-5.3-NVFP4`. Sobre cada bloque se inserta un adaptador rsLoRA de rango 512 y alpha 45 (escala `alpha/sqrt(r)` = 1,99) en las cinco proyecciones MLA y en las tres proyecciones de los expertos compartidos, lo que da 407 módulos adaptados y deja intactos los expertos enrutados (que siguen en NVFP4, descuantizados por trozos). La entrada es `ids de prefijo + ids del span`, sin plantilla de chat, y se lee en el último token del span; las variantes `sink` anteponen `[gMASK]<sop>` (ids 154822, 154824) para que el primer token de contenido no caiga en la posición 0, el *attention sink* de GLM-5.3, donde la norma de la activación es ~1.200 frente a ~50 en el resto de posiciones. La salida pasa por `value_head(h51_AR[last])` y se compara con `h51_real - mu` mediante coseno, donde `mu` es la media de h51 sobre 20.000 filas de entrenamiento (`centre_mean.pt` / `mu.pt`). Solo se entrena la dirección: el FVE que reporta la model card usa la mejor escala no negativa por fila.

El entrenamiento LoRA usó 1.193.984 filas en una sola pasada sin repeticiones (1.166 pasos de 1.024), provenientes de 21 ficheros parquet: `sft1b` (598.629 filas) y `sft1b_more` (648.487 filas, índices 3417..3432 de FineFineWeb). Cada fila empareja una continuación muestreada con la activación h51 en la posición previa, extraída de posiciones de FineFineWeb con entropía en la mitad superior, las mismas que usa el SFT del lens. La pérdida es `1 - cos(value_head(h51_AR[pos]), h51 - mu)`, promediada sobre las posiciones del span (en la variante `sink16` se regresan todos los prefijos de 1 a 16 contra el mismo objetivo). La innovación técnica principal no está en la arquitectura, sino en el uso del resultado: la variante `sink16` se emplea como modelo de recompensa del RL del lens, y las cuatro variantes afines sirven de cota inferior lineal, ya que solo necesitan la salida del bloque 51 del base en el último de exactamente k tokens y una transformación afín ajustada por ridge, sin entrenamiento de adaptadores.

## Capacidades

- Predicción de dirección de activación: dado un span de tokens, devuelve un vector de 6.144 dimensiones en el espacio centrado que aproxima la activación residual del bloque 51 del base en la posición anterior al span.
- Puntuación por coseno: la salida se compara directamente con `h51_real - mu` mediante coseno centrada, lo que permite usarla como función de scoring o de recompensa.
- Modelo de recompensa para RL: `lora_ar_h51_sink16` implementa `clamp(cos(AR(bullet), h51 - mu), 0)^2` como recompensa del lens en `ceselder/glm-5.3-olens-lens`.
- Reconstrucción lineal rápida: los cuatro mapas afines ofrecen una lectura lineal de la información que el base ya porta sobre la activación k tokens atrás, para k = 12 y k = 16, con y sin prefijo sink.
- Manejo explícito del attention sink: las variantes `sink` y `sink16` evitan la posición 0 de GLM-5.3, lo que es un requisito práctico para obtener lecturas comparables.
- Generación de texto: no. El repositorio no contiene una cabeza de lenguaje ni un tokenizador propio; no genera texto en ningún caso.
- Tool calling / function calling: no disponible; no aplica a este artefacto.
- Agentes y razonamiento multi-paso: no disponible; no aplica.
- Capacidades multilingües: no disponible; no hay evaluación por idioma.
- Visión, audio, thinking mode: no disponible; no se mencionan en la información proporcionada.

## Casos de uso

- Investigación de interpretabilidad sobre GLM-5.3: obtener una aproximación diferenciable de la activación del bloque 51 para un span de texto permite entrenar sondas, analizar direcciones latentes o estudiar qué información transporta esa capa sin ejecutar el base completo sobre cada candidato.
- Modelo de recompensa en RL del oracle lens: `lora_ar_h51_sink16` está diseñado exactamente para puntuar bullets con `clamp(cos, 0)^2` dentro del pipeline de `ceselder/glm-5.3-olens-lens`, de modo que el lens pueda optimizarse contra la activación real del base.
- Auditoría de contenido generado: comparar la dirección predicha a partir de un fragmento con la activación real del base permite localizar qué tramos de texto empujan la representación interna hacia un concepto concreto, con una coseno de referencia de 0,34 en bullets de 4-16 tokens.
- Control y *steering* de activaciones: la salida del reconstructor puede inyectarse o restarse en el espacio centrado del bloque 51 para experimentos de dirección, usando `mu` como centro de referencia y el coseno como métrica de fidelidad.
- Etiquetado aproximado de corpus: predecir la activación asociada a spans de 4-16 tokens evita ejecutar los 52 bloques del base por cada fragmento en fases de filtrado o curación de datasets, a costa de una fidelidad parcial (coseno 0,34 en bullets, FVE 0,172 en spans de 16 tokens).
- Comparación de recetas entre familias: al portar la receta `h2hpfx` de Qwen3.6-27B (capa 42, coseno 0,400), el repositorio permite contrastar la reconstruibilidad de activaciones entre GLM-5.3 y Qwen3.6-27B con la misma metodología.
- Línea base de bajo coste: los mapas afines `affine_k16_sink` (coseno 0,247 en spans de 16 tokens) sirven como cota inferior lineal para justificar el coste adicional de un adaptador LoRA en experimentos de interpretabilidad.
- Reproducibilidad de estudios internos: fijar la revisión del base `nvidia/GLM-5.3-NVFP4` y los adaptadores permite repetir mediciones de activación entre experimentos, algo relevante cuando se comparan resultados de distintas ejecuciones del modelo completo.

## Benchmarks y rendimiento

La model card no reporta MMLU, HumanEval, GSM8K ni métricas de generación, porque el artefacto no genera texto. Los únicos resultados publicados son cosenos centradas y FVE en held-out (primeras 2.048 filas para LoRA y las 6.265 filas para los mapas afines del fichero held-out de `sft1b`, compuesto por noticias nunca vistas en entrenamiento).

| Variante | Coseno centrada, bullets 4-16 tokens (último token) | Coseno centrada, spans de 16 tokens | FVE (16 tokens) | Lectura a 1 token | Lectura a 8 tokens | Lectura a 16 tokens (171 filas) |
|---|---|---|---|---|---|---|
| `affine_k12_bare` | - | 0,231 | 0,061 | - | - | 0,230 (k=12) |
| `affine_k12_sink` | - | 0,235 | 0,063 | - | - | 0,234 (k=12) |
| `affine_k16_bare` | - | 0,237 | 0,064 | - | - | 0,238 (k=16) |
| `affine_k16_sink` | - | 0,241 | 0,066 | - | - | 0,247 (k=16) |
| `lora_ar_h51_bare` | 0,334 | 0,383 | 0,165 | 0,041 | 0,324 | 0,401 |
| `lora_ar_h51_sink` | 0,337 | 0,385 | 0,167 | 0,139 | 0,327 | 0,401 |
| `lora_ar_h51_sink16` | 0,340 | 0,391 | 0,172 | 0,138 | 0,330 | 0,408 |

Referencia externa citada en la model card: el AR de la capa 42 de Qwen3.6-27B, con la misma receta, alcanza 0,400 de coseno centrada en su métrica de spans de 16 tokens, frente a 0,391 de `lora_ar_h51_sink16`. No se han publicado resultados de benchmarks de generación en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El adaptador LoRA ocupa 11,5 GB en fp32 y requiere cargar los bloques 0..51 del base `nvidia/GLM-5.3-NVFP4` para ejecutar el forward; el tamaño en VRAM del base no se detalla en la información proporcionada.
- Tamaño en disco: el repositorio completo son 36,2 GB, incluyendo los tres adaptadores LoRA, las cuatro variantes afines y las cabezas `value_head` de 6.144 × 6.144.
- GPU recomendadas: no disponibles. Por el tamaño del adaptador en fp32 (11,5 GB) más el base, no es razonable esperar que quepa en GPUs de consumo de 24 GB; se necesitan aceleradores de clase A100/H100 o superiores, sin cifra confirmada.
- Cabe en GPU de consumo: no disponible; la combinación de adaptador fp32 y base NVFP4 hace improbable que quepa en 24 GB, pero no hay medición publicada.
- Opciones de despliegue: carga mediante `peft` + `transformers` sobre la revisión concreta del base, con lectura de activaciones internas en el bloque 51. vLLM, TGI, llama.cpp y Ollama no están documentados para este artefacto; al no ser un modelo generativo, no hay ruta GGUF.
- Latencia y throughput: no disponibles. La variante LoRA ejecuta los 52 bloques del base en cada llamada; los mapas afines solo necesitan un forward del base en el último token del span, pero tampoco hay cifras de latencia publicadas.

## Comparativa con modelos similares

| Artefacto | Tipo | Parámetros | Contexto / span | Coseno centrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `ceselder/glm-5.3-olens-reconstructor` (`sink16`) | LoRA r512 sobre GLM-5.3, bloque 51 | ~2,9 B fp32 de adaptador | Spans de 4-16 tokens | 0,391 (16 tokens) / 0,340 (bullets) | NVIDIA open model license | HuggingFace, 0 descargas |
| `ceselder/glm-5.3-olens-reconstructor` (afín `k16_sink`) | Mapa afín cerrado | `W` de 6.144 × 6.144 | Exactamente 16 tokens | 0,241 (16 tokens) | NVIDIA open model license | HuggingFace |
| AR de la capa 42 de Qwen3.6-27B (receta original `h2hpfx`) | LoRA reconstructor sobre otro base | No disponible | Spans de 16 tokens | 0,400 | No disponible en la información proporcionada | Citado como referencia, sin enlace |
| `ceselder/glm-5.3-olens-lens` | Lens / consumidor del reconstructor | No disponible | No disponible | No disponible | No disponible | HuggingFace, misma colección |

No se dispone de otros reconstructores de activaciones comparables en la información proporcionada; la única referencia cuantitativa es el AR de Qwen3.6-27B.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no soporta tool calling, agentes ni razonamiento multi-paso. Cualquier uso en ese sentido es un error de categoría.
- Fidelidad parcial: la coseno centrada en held-out es 0,391 en el mejor caso (spans de 16 tokens) y 0,340 en bullets de 4-16 tokens; el FVE es 0,172. La dirección reconstruida es una aproximación, no la activación real.
- Métrica sobre pocas filas: la lectura a 16 tokens se calcula sobre 171 filas, lo que implica alta varianza; la comparación con Qwen3.6-27B (0,400 frente a 0,391) no permite afirmar superioridad de ninguna de las dos.
- Dependencia estricta del base: el adaptador está entrenado contra una revisión y cuantización concretas (`nvidia/GLM-5.3-NVFP4`, expertos enrutados en NVFP4). No hay garantía de transferencia a otras cuantizaciones o revisiones del mismo modelo.
- Requisitos de entrada frágiles: hay que alimentar ids de token exactos, sin plantilla de chat, y en las variantes `sink` anteponer `[gMASK]<sop>` (154822, 154824). Omitir el prefijo sitúa el primer token en el *attention sink*, donde la norma es ~1.200 frente a ~50, lo que degrada la lectura.
- Los mapas afines exigen spans de exactamente 12 o 16 tokens; fuera de esa longitud no son aplicables.
- Sesgos: no se ha publicado ninguna evaluación de sesgos, y el corpus de entrenamiento (FineFineWeb) puede arrastrar los sesgos de su fuente; el idioma de los datos no está especificado.
- Riesgo de alucinación en sentido laxo: el reconstructor puede producir una dirección plausible pero incorrecta para un span dado, y su salida no incluye ninguna medida de incertidumbre por muestra; conviene validar contra la activación real antes de usar la predicción en decisiones automatizadas.
- Licencia: `nvidia-open-model-license`, heredada del base; hay que revisar sus términos para uso comercial, ya que la etiqueta es `license: other` y no una licencia permisiva estándar.
- Madurez: 0 descargas y 0 likes, sin validación externa conocida; el repositorio se actualizó por última vez el 2026-10-24 y la model card indica que se regenera por script.
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo (los resultados obtenidos trataban sobre un artista homónimo), por lo que no hay fuentes independientes que corroborren las cifras.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ceselder/glm-5.3-olens-reconstructor
- Modelo base: https://huggingface.co/nvidia/GLM-5.3-NVFP4
- Lens asociado (consumidor y RL): https://huggingface.co/ceselder/glm-5.3-olens-lens
- Colección `glm5.3-olens`: https://huggingface.co/collections/ceselder/glm53-olens-6adaf9d544d3645a7fb96eb9
- Licencia: https://huggingface.co/nvidia/GLM-5.3-NVFP4
- Papers, blogs, repos o demos adicionales: no disponibles en la información proporcionada.
