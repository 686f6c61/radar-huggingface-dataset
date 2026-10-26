# ceselder/kimi-k3-olens-reconstructor

## Resumen

`ceselder/kimi-k3-olens-reconstructor` no es un modelo generativo, sino un artefacto de interpretabilidad: un conjunto de reconstructores que, dada una secuencia corta de tokens, predicen la dirección de activación de la capa 59 del modelo congelado `moonshotai/Kimi-K3`. Forma la mitad «texto a activación» del llamado *oracle lens* de Kimi-K3, una herramienta que permite estimar qué representación interna produce el modelo base en la posición en la que continuaría un fragmento de texto, sin necesidad de ejecutar el modelo completo para cada consulta.

El autor, `ceselder`, publica dos adaptadores LoRA rsLoRA de rango 512 (uno de ellos continuación del otro sobre una segunda cosecha de datos) más seis mapas afines en forma cerrada ajustados por regresión ridge sobre la base congelada. Los adaptadores se aplican sobre las proyecciones de atención, los expertos compartidos y el MLP denso de la capa 0 de las 60 primeras capas, con los expertos enrutados (MXFP4) congelados.

Su relevancia es acotada pero específica: `lora_ar_h59_bos_2M/` actúa como modelo de recompensa del RL del lens en `ceselder/kimi-k3-olens-lens`, y el conjunto sirve como banco de pruebas reproducible para estudiar Attention Residuals y para portar recetas de reconstrucción entre familias de modelos (la receta `h2hpfx` proviene de Qwen3.6-27B vía GLM-5.3). La fidelidad es moderada: coseno centrado en held-out de 0,3564 sobre *bullets* de 4 a 16 tokens y 0,424 en lecturas de 16 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA rsLoRA (r 512, alpha 45, escala 1,99) sobre las capas 0..59 congeladas de Kimi-K3, más `value_head` lineal (7168x7168) y mapas afines en forma cerrada; sin cabeza LM |
| Parametros totales | ~3,68B en el adaptador LoRA (fp32); `value_head` ~51,4M (7168x7168); cada mapa afín, W de 7168x7168 (~51,4M) |
| Parametros activos | No aplica: el adaptador no es MoE. El modelo base usa expertos enrutados MXFP4 que permanecen congelados; numero de parametros activos del base: no disponible |
| Longitud de contexto | No disponible. El reconstructor opera sobre spans de 4 a 16 tokens (lecturas entrenadas para k = 1..16) |
| Tipos de cuantizacion | Adaptador y mapas en fp32; expertos enrutados del base en MXFP4 nativo (descuantizados por bloques dentro de GEMM agrupados), atención y expertos compartidos en bf16. No se publican GGUF ni cuantizaciones alternativas |
| Idiomas soportados | No disponible (no se documenta cobertura linguistica; los datos de entrenamiento incluyen finance_001578 y FineFineWeb) |
| Licencia | `other`, con `license_name: kimi-k3` y enlace a la licencia de `moonshotai/Kimi-K3` |
| Formato de pesos | `safetensors` (adapter_model.safetensors, 13,7 GiB por carpeta LoRA) y `.pt` (value_head.pt, centre_mean.pt, affine.pt); `adapter_config.json`, `ar_config.json`, `meta.json` |
| Modelo base | `moonshotai/Kimi-K3` (dimension oculta 7168, 60 capas decodificadoras leidas, Attention Residuals con tamano de bloque 12, id de BOS 163584) |
| Tamano del repositorio | 31,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-10-25 |

## Arquitectura y entrenamiento

La entrada es `[BOS]` (id 163584) seguido de los ids exactos del span, sin plantilla de chat, y la lectura se toma en el ultimo token del span. El modelo ejecuta las capas 0..59 congeladas de Kimi-K3 (embedding mas 60 capas decodificadoras, sin cabeza LM) y sobre ellas aplica un adaptador rsLoRA de rango 512 y alpha 45 sobre las proyecciones de atencion, los expertos compartidos y el MLP denso de la capa 0 (aproximadamente 3,68B parametros en fp32); los expertos enrutados no se entrenan. La salida es `value_head(h_sum_AR[ultimo])`, donde `h_sum` es la suma de Attention Residuals tras la capa 59 (embedding mas la salida de cada subcapa de las capas 0..59), un vector de 7168 dimensiones en espacio centrado que se compara con `h_sum_real - mu` mediante coseno, usando la media `mu` almacenada en `centre_mean.pt` (calculada sobre las primeras 20.000 filas de entrenamiento y bit a bit identica entre las dos carpetas LoRA).

El entrenamiento consiste en una unica pasada sobre datos de activaciones recolectadas: 1.010.688 filas para `lora_ar_h59_bos_1M` (paso 987) y 1.157.120 filas adicionales de la cosecha 2 para `lora_ar_h59_bos_2M` (paso 2117), con 2.167.808 filas totales. No se documenta RLHF ni DPO. Los seis mapas afines se ajustan en forma cerrada mediante barrido de ridge sobre validacion (W de 7168x7168 mas `mu_x`, `mu_y`, `MU`, `read`, `prefix_ids`, `read_layer` y `target`), con variantes con y sin prefijo `[BOS]` y con longitud variable o exactamente 12 o 16 tokens. Un test de capacidad que anadio LoRA r512 sobre las proyecciones latentes de los expertos enrutados (+650M parametros, mismas filas y esquema, 300 pasos) mejoro solo +0,003 de coseno centrado en el paso 50 y +0,0006 en el paso 300, lo que sugiere que la via de expertos no es el cuello de botella en esta etapa.

## Capacidades

- Prediccion de la direccion de activacion `h_sum` de la capa 59 de Kimi-K3 a partir de un span de 4 a 16 tokens, en espacio centrado y comparable por coseno.
- Lectura multi-posicion: todas las lecturas de k = 1..16 estan entrenadas, con calidad creciente segun k (0,156 en 1 token, 0,344 en 8 tokens, 0,424 en 16 tokens).
- Modelo de recompensa para RL: `lora_ar_h59_bos_2M` implementa `reward = clamp(cos(AR([BOS] + bullet), h_sum - mu), 0)^2` en el pipeline del lens; `lora_ar_h59_bos_1M` recompenso la ejecucion temprana de RL.
- Mapas afines en forma cerrada como linea base barata y determinista, con y sin `[BOS]`, para spans de longitud variable o fija de 12 y 16 tokens.
- No genera texto: el modelo no incluye cabeza LM ni decodificador, por lo que no hay soporte de generacion, tool calling, agentes, vision ni audio.
- Soporte multilingue: no documentado.
- Portabilidad de receta entre familias: el procedimiento `h2hpfx` se importo de Qwen3.6-27B pasando por GLM-5.3, lo que permite replicar el enfoque en otras arquitecturas.

## Casos de uso

- Analisis de interpretabilidad mecanicista sobre Kimi-K3: dado un fragmento de texto, el reconstructor estima la direccion de activacion de la capa 59 sin ejecutar el modelo base completo para cada hipotesis, lo que abarata el barrido de hipotesis sobre que representa una direccion concreta.
- Modelo de recompensa en RL del lens: integrado en `ceselder/kimi-k3-olens-lens` con la formula de recompensa documentada, permite optimizar *bullets* que induzcan una direccion objetivo en el modelo congelado.
- Busqueda y validacion de direcciones de steering: al poder puntuar spans de texto contra un vector objetivo, se pueden filtrar candidatos de prompt antes de validarlos con una pasada real del modelo.
- Auditoria de la fidelidad de herramientas de interpretabilidad: los conjuntos held-out (`finance_001578` y FineFineWeb 4149) y las activaciones publicadas en `ceselder/kimi-k3-olens-heldout-activations` permiten reproducir exactamente las metricas de coseno y FVE.
- Estudio de Attention Residuals: el vector leido es la suma de las salidas de todas las subcapas, de modo que el reconstructor sirve para analizar como se acumula informacion a lo largo de las 60 capas con bloques de tamano 12.
- Comparativa entre familias de modelos: al existir reconstrucores equivalentes para GLM-5.3 (bloque 51) y Qwen3.6-27B (capa 42), se puede medir como varia la fidelidad de la reconstruccion texto-a-activacion entre arquitecturas y profundidades.
- Linea base para experimentos de capacidad: los mapas afines (coseno 0,26-0,29) ofrecen una referencia cerrada y barata contra la que medir cualquier mejora con adaptadores neuronales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). Las unicas metricas son de reconstruccion de activaciones: coseno centrado en held-out y fraccion de varianza explicada (FVE).

| Carpeta | Tipo | Coseno centrado, spans tipo bullet (conjunto cosecha 1) | Coseno, conjunto emparejado cosecha 2 | FVE (h1 / h2) | Lectura 1 token | Lectura 8 tokens | Lectura 16 tokens |
|---|---|---|---|---|---|---|---|
| `lora_ar_h59_bos_1M/` | LoRA r512 (paso 987) | 0,3552 | 0,3541 | 0,143 / 0,142 | 0,156 | 0,344 | 0,424 |
| `lora_ar_h59_bos_2M/` | LoRA r512 (paso 2117) | **0,3564** | **0,3629** | 0,145 / 0,149 | 0,153 | 0,343 | 0,424 |
| `affine_var_bos/` | Afin, span variable | 0,2647 | - | 0,080 | - | - | - |
| `affine_var_bare/` | Afin, span variable | 0,2612 | - | 0,078 | - | - | - |
| `affine_k12_bos/` | Afin, 12 tokens | 0,2822 | - | 0,089 | - | - | - |
| `affine_k12_bare/` | Afin, 12 tokens | 0,2793 | - | 0,088 | - | - | - |
| `affine_k16_bos/` | Afin, 16 tokens | **0,2934** | - | 0,095 | - | - | - |
| `affine_k16_bare/` | Afin, 16 tokens | 0,2912 | - | 0,094 | - | - | - |

Referencias externas citadas por el autor: GLM-5.3, AR del bloque 51, 0,340 / 0,391; Qwen3.6-27B, AR de la capa 42, 0,400 en 16 tokens. El mejor mapa afin sobre base congelada alcanza 0,293.

## Requisitos de hardware

- No se publican requisitos oficiales de VRAM, latencia ni throughput; estos datos figuran como no disponibles.
- El repositorio ocupa 31,1 GB. Cada carpeta LoRA pesa 13,7 GiB (adaptador fp32 de rango 512 sobre las capas 0..59); a bf16 equivaldria a unos 6,9 GB, conversion no publicada por el autor.
- Es necesario descargar y cargar por separado el checkpoint de `moonshotai/Kimi-K3` (al menos embedding y capas 0..59), lo que domina el consumo de memoria frente al adaptador.
- La inferencia no requiere cabeza LM ni las capas posteriores a la 59, por lo que el coste es inferior al de una pasada generativa completa del modelo base.
- Se requiere soporte de PEFT para cargar `adapter_config.json` y `adapter_model.safetensors`, ademas de una implementacion compatible con Attention Residuals (bloque 12) y con expertos MXFP4 descuantizados en GEMM agrupados; no se documenta compatibilidad con llama.cpp, Ollama, vLLM ni TGI.
- Los mapas afines solo necesitan una multiplicacion de matrices de 7168x7168 en fp32 (unos 51,4M parametros por mapa) y pueden ejecutarse en CPU, aunque la extraccion de la activacion de entrada sigue requiriendo el modelo base.
- GPU concretas recomendadas: no disponibles. No hay datos publicados sobre si el conjunto cabe en GPU de consumo.

## Comparativa con modelos similares

| Modelo / artefacto | Parametros del adaptador | Capa leida | Coseno centrado en held-out | FVE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `ceselder/kimi-k3-olens-reconstructor` (`_2M`) | ~3,68B (LoRA r512) + 51,4M (value_head) | 59 sobre 60 | 0,3564 (bullets) / 0,424 (16 tokens) | 0,145 / 0,149 | `other` (kimi-k3) | Publico en HF, 0 descargas |
| GLM-5.3 block-51 AR (receta de origen) | No disponible | 51 | 0,340 (bullets) / 0,391 (16 tokens) | No disponible | No disponible | Referencia citada, no enlazada en la informacion |
| Qwen3.6-27B layer-42 AR (receta de origen) | No disponible | 42 | 0,400 (16 tokens) | No disponible | No disponible | Referencia citada, no enlazada en la informacion |
| Mapas afines del mismo repo (`affine_k16_bos`) | ~51,4M (W 7168x7168) | 59 | 0,2934 | 0,095 | `other` (kimi-k3) | Publico en HF |

## Limitaciones y advertencias

- Fidelidad moderada: un coseno centrado de 0,3564 y un FVE de 0,145 implican que el reconstructor explica en torno al 15 % de la varianza de la activacion; no debe interpretarse como una recuperacion fiable del estado interno.
- Solo cubre la capa 59 de Kimi-K3 y spans de 4 a 16 tokens; fuera de ese rango no hay garantia ni evaluacion.
- Requiere alimentar ids de tokens exactos y sin plantilla de chat; el prefijo `[BOS]` forma parte de la convencion y las posiciones del prefijo nunca se leen ni se puntuan. Un tokenizador o preprocesado distinto invalida las metricas.
- No genera texto (sin cabeza LM), por lo que no aplica la comparacion habitual de alucinacion; el riesgo equivalente es sobreinterpretar reconstrucciones de baja fidelidad como evidencia de un contenido representacional concreto.
- La licencia es `other` con `license_name: kimi-k3`: el uso comercial queda sujeto a la licencia de `moonshotai/Kimi-K3`, que debe revisarse antes de cualquier despliegue productivo.
- El modelo base no se redistribuye aqui; es necesario obtenerlo por separado y cumplir su licencia.
- Sesgos: no documentados. Los datos de entrenamiento provienen de finance_001578 y de FineFineWeb (fichero 4149), de modo que la cobertura tematica y linguistica hereda los sesgos de esas fuentes; no se detalla composicion ni equilibrio.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la ficha; el artefacto esta pensado para investigacion y su mantenimiento no esta garantizado.
- El autor documenta que anadir LoRA sobre la via de expertos enrutados apenas mejora (+0,003 de coseno a 300 pasos), lo que acota las mejoras esperables con el enfoque actual.
- Coste de infraestructura elevado (31,1 GB de repositorio mas el checkpoint del base) para un artefacto cuyo rendimiento absoluto sigue siendo limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ceselder/kimi-k3-olens-reconstructor
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3
- Licencia del modelo base: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Repositorio del lens (consumidor del modelo de recompensa): https://huggingface.co/ceselder/kimi-k3-olens-lens
- Coleccion Kimi K3 olens: https://huggingface.co/collections/ceselder/kimi-k3-olens-6ade55e72bd149d417f03e7d
- Activaciones held-out y `reconstructor_heldout_evals.parquet`: https://huggingface.co/datasets/ceselder/kimi-k3-olens-heldout-activations
- La busqueda web realizada no devolvio ningun resultado relacionado con el modelo; los enlaces obtenidos corresponden a mods de Hollow Knight y se han descartado por no ser relevantes.
