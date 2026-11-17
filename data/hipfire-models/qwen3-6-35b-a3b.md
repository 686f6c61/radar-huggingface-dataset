# hipfire-models/qwen3.6-35b-a3b

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por el equipo Qwen de Alibaba. Con 35.000 millones de parametros totales y 3.000 millones activos por token, emplea una arquitectura hibrida que combina atención DeltaNet (lineal) con atención completa en una proporción 3:1, 256 expertos con enrutamiento top-8, experto compartido y embeddings atados. Esta ficha documenta la variante redistribuida por hipfire-models, pre-cuantizada para el motor de inferencia hipfire.

El modelo base resuelve tareas de razonamiento, generacion de codigo y flujos agenticos con un coste computacional por token muy reducido gracias a su activacion dispersa. El contexto y los detalles de entrenamiento del modelo original no estan documentados en la informacion disponible para esta ficha.

La relevancia de esta distribucion concreta reside en su estrategia de cuantizacion graduada: dado que en un MoE de cola pesada aproximadamente el 80% de la contribucion de enrutamiento proviene del 20% de los expertos mas utilizados, la familia de archivos asignan mayor precision a los expertos "calientes" y menor a la cola "fria", logrando que un archivo de 17,2 GB (`.mq3p`) iguale la calidad de una cuantizacion uniforme de 4 bits. El motor hipfire esta escrito en Rust y esta orientado a GPUs AMD RDNA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido: DeltaNet + Full Attention (3:1), 256 expertos top-8, experto compartido, embeddings atados |
| Parametros totales | 35.000 millones (35B) |
| Parametros activos | 3.000 millones (3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MQ2-Lloyd, MQ3+P, MQ4+P, MFP4-E8 (E8 lattice VQ, 4,25 bpw), MQ5, MQ6, MQ4 simetrico (gate/up MQ4G256V2, down MQ4G128V2); router y embed/lm_head fijados a Q8F16 (salvo `.mq4r`/`.mq4rs`, con router de 4 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Formato propietario del motor hipfire (`.mqN`, `.mqNp`, `.mfp4`, `.mq4rs`); incluye oráculo f32 en `.hfq` y matriz de importancia en GGUF |

## Arquitectura y entrenamiento

El modelo base es un MoE con 256 expertos y enrutamiento top-8, complementado por un experto compartido siempre activo. La atencion es hibrida: bloques DeltaNet (atencion lineal) alternados con atencion completa en proporcion 3:1, con `head_dim=256` y `partial_rotary_factor=0.25`. Los embeddings de entrada y la cabeza LM estan atados. El motor hipfire carga esta arquitectura a traves de su ruta `arch_id=6` sin modificaciones del motor.

Los detalles de entrenamiento del modelo original (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada. La innovacion documentada en esta distribucion es la cuantizacion graduada por experto: se clasifican los expertos por importancia REAP, con ranking unificado sobre dos corpus (WikiText-2 y un corpus agentico) para que el conjunto "caliente" generalice entre dominios; el 20% superior se promueve a MQ6, el 30% intermedio queda en MQ4 y el 50% inferior se degrada al nivel Lloyd minimo. Ademas, el router y la cabeza LM se mantienen en Q8F16 de forma obligatoria: segun el autor, un router de 4 bits colapsa en un atractor estructural ante prompts agenticos (ratio de palabras unicas del 14% al 46% con la correccion).

## Capacidades

- Generacion de texto y razonamiento de proposito general.
- Generacion de codigo, segun los tags y el corpus agentico empleado en la evaluacion de cuantizacion.
- Flujos agenticos y razonamiento multi-paso (etiquetado `agentic` por el autor).
- Capacidad multilingue: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Modo thinking, vision o audio: no disponible.
- Inferencia en GPUs AMD RDNA mediante el motor hipfire (Rust).

## Casos de uso

- Asistencia de codigo en local sobre GPU AMD: el modelo se sirve con hipfire en GPUs RDNA y su variante `.mq4p` (19,8 GB) ofrece coherencia en gfx11, gfx12 y gfx1151, adecuada para entornos de desarrollo con hardware AMD de consumo o workstation.
- Despliegue agentico en hosts con VRAM limitada: el SKU `.mq2` (11,6 GB, ~14 GB de VRAM) permite ejecutar un modelo de 35B en GPUs de gama media, a costa de una degradacion visible pero coherente de la calidad.
- Servicio de inferencia de calidad alta con VRAM de 30 GB: el SKU `.mq6` (27,7 GB) conserva el mayor porcentaje de la fidelidad respecto al oraculo f32 (KLD 0,0159 en WT2) para tareas donde el tamaño no es la restriccion.
- Prefill de alta velocidad en Radeon R9700: el archivo `.mq4rs` alcanza 18.600 tok/s a `pp16000` en una unica R9700 mediante la ruta de expertos con activaciones int4, orientado a cargas con prompts largos.
- Evaluacion y reproduccion de cuantizaciones: el oraculo `.f32.hfq`, las referencias KLD precalculadas y la matriz de importancia en GGUF permiten medir la divergencia de nuevas cuantizaciones sobre los mismos corpus.
- Prototipado de pipelines MoE en hardware AMD: la combinacion de arquitectura hibrida DeltaNet y enrutamiento top-8 con el motor hipfire sirve para validar estrategias de cuantizacion por experto antes de trasladarlas a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica mediciones de divergencia KL frente a un oraculo f32 nativo (menor es mejor), con PPL de referencia del oraculo: 5,350 en WikiText-2 y 5,902 en corpus agentico.

| Archivo | Tamano | KLD wt2 / agentic | VRAM minima |
|---|---|---|---|
| `.mq2` (uniforme MQ2-Lloyd) | 11,6 GB | 0,238 / 0,466 | ~14 GB |
| `.mq3p` (MQ3+P) | 17,2 GB | 0,0352 / 0,163 | ~20 GB |
| `.mq4p` (MQ4+P) | 19,8 GB | 0,0249 / 0,133 | ~22 GB |
| `.mfp4` (uniforme MFP4-E8) | 20,2 GB | 0,0248 / 0,121 | ~22 GB |
| `.mq5` (uniforme MQ5) | 23,7 GB | 0,0191 / 0,106 | ~26 GB |
| `.mq6` (uniforme MQ6) | 27,7 GB | 0,0159 / 0,0868 | ~30 GB |
| `.mq4rs` (simetrico MQ4, solo gfx1201) | 18,7 GB | 0,129 (solo WT2, harness distinto) | ~22 GB |

El autor indica que `.mq4p` mejora a un MQ4 uniforme en un -26% / -18% de KLD a igual tamaño, y que `.mq3p` iguala la calidad de MQ4 con tamaño de MQ3. El dato de `.mq4rs` no es comparable directamente: se midio solo en WT2 (ventanas de 32x512, 8,160 tokens evaluados) contra un profesor F32 nativo emparejado.

## Requisitos de hardware

- VRAM estimada: desde ~14 GB (`.mq2`) hasta ~30 GB (`.mq6`); el SKU de equilibrio `.mq4p` requiere ~22 GB.
- GPUs soportadas: AMD RDNA. `.mq4p` validado en gfx11, gfx12 y gfx1151; `.mq4rs` exclusivo de gfx1201 (R9700), que rechaza la carga en otras GPUs salvo override `HIPFIRE_MOE_SYM_IU4=0` (prefill F32 ~5x mas lento: 2.735 vs 543 ms a `pp4096`).
- GPU de consumo: el SKU `.mq2` (~14 GB) puede caber en GPUs consumer con 16 GB; el `.mq3p` (~20 GB) y `.mq4p` (~22 GB) requieren GPUs de 24 GB o superiores.
- Despliegue: exclusivamente mediante el motor hipfire (Rust, nativo para RDNA). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento: 18.600 tok/s de prefill a `pp16000` en una R9700 con `.mq4rs` (via ruta IU4). No se publican cifras de decode ni de latencia por token.
- Los SKUs `.mq3p` y `.mq4p` sirven a velocidad completa en decode; su nivel Lloyd frio usa actualmente un fallback de prefill por token (mayor TTFT, sin impacto en throughput de decode).

## Comparativa con modelos similares

| Modelo | Parametros (total/activo) | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.6-35B-A3B (hipfire, esta ficha) | 35B / 3B | no disponible | Apache 2.0 | Hugging Face, motor hipfire |
| Qwen/Qwen3.6-35B-A3B (original) | 35B / 3B | no disponible | no disponible | Hugging Face |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comunes con otras alternativas que permitan comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- Dependencia total del motor hipfire: los pesos estan en formato propietario y no son compatibles con vLLM, llama.cpp, Ollama ni TGI.
- Restriccion de hardware: el motor esta orientado a GPUs AMD RDNA; no se documenta soporte para NVIDIA u otras plataformas.
- El archivo `.mq4rs` solo carga en gfx1201 (R9700); el override acepta un fallback de prefill F32 unas 5 veces mas lento.
- Los SKUs graduados `.mq3p` y `.mq4p` presentan mayor tiempo hasta el primer token (TTFT) por el fallback de prefill de su nivel Lloyd frio; el camino con prefill por lotes esta pendiente de publicacion.
- El SKU `.mq2` produce salida "visiblemente degradada" segun el autor, aunque coherente; no es apto para tareas de alta exigencia.
- El router de 4 bits (solo en `.mq4r`/`.mq4rs`) provoca, segun el autor, un colapso a atractor estructural en prompts agenticos; el resto de SKUs lo evitan fijando el router en Q8F16.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; aplican los riesgos generales de los LLM.
- Idiomas soportados: no disponibles.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse la licencia del modelo base original, no indicada en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hipfire-models/qwen3.6-35b-a3b
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Motor hipfire: https://github.com/Kaden-Schutt/hipfire
