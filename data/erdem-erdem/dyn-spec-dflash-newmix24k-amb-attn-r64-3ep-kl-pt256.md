# erdem-erdem/dyn-spec-dflash-newmix24k-amb-attn-r64-3ep-kl-pt256

## Resumen

`dyn-spec-dflash-newmix24k-amb-attn-r64-3ep-kl-pt256` es un checkpoint de entrenamiento publicado por el usuario de Hugging Face `erdem-erdem` dentro de su serie de experimentos `dyn-spec` sobre DFlash, un mecanismo de decodificacion especulativa basado en difusion por bloques. No se trata de un modelo de lenguaje autonomo, sino de un *drafter* (modelo borrador) que se acopla a un modelo objetivo para acelerar la generacion mediante decodificacion especulativa. El modelo objetivo declarado es Qwen/Qwen3-8B, y el drafter de partida es `z-lab/Qwen3-8B-DFlash-b16` en un commit concreto.

La variante concreta corresponde al brazo `direct` en etapa de `pretraining`, con 4000 updates, semilla 42 y un adaptador LoRA de rango 64 (`r64`), entrenado durante 3 epocas (`3ep`) con una senal de tipo KL (`kl`) y un horizonte de prediccion de 256 tokens (`pt256`). El identificador `newmix24k` hace referencia al conjunto de activaciones de entrenamiento, alojado como dataset aparte (`dyn-spec-dflash-store-qwen3-8b-newmix24k`). El prefijo `amb-attn` sugiere una variante de atencion ambigua o mixta, aunque la model card no detalla su semantica.

Es relevante ahora porque la decodificacion especulativa se ha consolidado como una de las tecnicas mas efectivas para reducir la latencia de inferencia en LLM sin degradar la calidad, y DFlash propone un enfoque de difusion por bloques que permite generar borradores en paralelo. Este repositorio, sin embargo, es material de investigacion reproducible (checkpoint con estado del optimizador, resultados y procedencia), no un artefacto listo para servir en produccion: el propio autor indica que la exportacion de serving de DFlash aun no esta portada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash (block diffusion drafter) con adaptador LoRA de rango 64 sobre Qwen3-8B-DFlash-b16 |
| Parametros totales | no disponible (el repo pesa 0,2 GB; el drafter base es un modelo ligero, pero no se declara el conteo) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (el identificador `pt256` sugiere horizonte de prediccion de 256 tokens, no contexto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch con estado del optimizador); no es un bundle de serving |
| Modelo objetivo | Qwen/Qwen3-8B |
| Drafter base | z-lab/Qwen3-8B-DFlash-b16 @ 9b41424b7109f9c5413454f481b09a82b85333f4 |
| Brazo / etapa | `direct` / `pretraining` |
| Updates de entrenamiento | 4000 |
| Semilla | 42 |
| Git SHA | bf28ced25cdbd27ad73fd9a299b861ed491289d8 |
| SHA256 del checkpoint | 50dfbbf2f117d4f6b08163b56d3ec9619ab172250ad28d3db9b326951f7ddec4 |

## Arquitectura y entrenamiento

El modelo es un *drafter* de decodificacion especulativa construido sobre DFlash, un modelo de difusion por bloques disenado para generar borradores de tokens en paralelo. En lugar de predecir token a token de forma autorregresiva, DFlash produce un bloque completo de candidatos que el modelo objetivo (Qwen3-8B) verifica posteriormente. Este checkpoint adapta el drafter base `z-lab/Qwen3-8B-DFlash-b16` mediante un adaptador LoRA de rango 64, entrenado durante 3 epocas con 4000 updates y una funcion de perdida basada en divergencia KL contra las distribuciones del modelo objetivo. El sufijo `pt256` apunta a un horizonte de prediccion de 256 tokens.

El entrenamiento parte de un *activation store* especifico (`newmix24k`), publicado como dataset independiente, que contiene las activaciones extraidas del modelo objetivo y registros de procedencia del lanzamiento de vLLM. La model card documenta la reproducibilidad completa: `run_record_*.json`, `inputs/`, `checkpoint.pt`, `result.json`, `metrics.json`, `timing.json`, `train_command.txt` y un `speculators.patch`, ademas de un `MANIFEST.json` con tamano y SHA256 de cada fichero. La evaluacion offline incluida cubre reproduccion, coeficientes M4, donantes M7, similitud D13 y coste D14, con metricas por fila. No se documenta en la informacion disponible el volumen total de tokens de entrenamiento ni la composicion detallada del dataset mas alla de la referencia al store de activaciones.

## Capacidades

- Generacion de borradores especulativos: produce bloques de tokens candidatos que el modelo objetivo Qwen3-8B verifica, acelerando la decodificacion.
- Generacion en paralelo por difusion de bloques: a diferencia de drafters autorregresivos, DFlash genera varios tokens simultaneamente.
- Adaptacion via LoRA: el checkpoint contiene un adaptador de rango 64 sobre el drafter base, lo que permite reutilizar el modelo subyacente.
- Entrenamiento con senal KL: la perdida busca alinear la distribucion del drafter con la del modelo objetivo, lo que en teoria mejora la tasa de aceptacion.
- Cobertura de dominios en validacion: la tabla de validacion desglosa por chat, code, formal, math, roleplay y science.
- No se declaran capacidades de tool calling, agentes, vision, audio ni multilingueismo propias; el drafter hereda el comportamiento del modelo objetivo al que acompana.

## Casos de uso

- Aceleracion de inferencia de Qwen3-8B en produccion: el drafter se acopla al modelo objetivo para reducir la latencia por token mediante decodificacion especulativa, siempre que se complete el port de serving que el autor aun no ha publicado.
- Investigacion en decodificacion especulativa: el checkpoint con estado del optimizador y el `speculators.patch` permiten reproducir y extender el experimento, comparando brazos `direct` frente a otras variantes de la serie `dyn-spec`.
- Estudio de la tasa de aceptacion por dominio: la validacion desglosada por chat, code, formal, math, roleplay y science permite analizar en que dominios el drafter acierta mas y ajustar el entrenamiento en consecuencia.
- Analisis de coste y similitud de donantes: las evaluaciones offline D13 (similitud) y D14 (coste) sirven para estudiar el equilibrio entre velocidad y calidad del borrador.
- Base para fine-tuning de drafters sobre otros modelos objetivo: la receta (LoRA r64, 3 epocas, perdida KL, horizonte 256) es replicable sobre otros pares objetivo-drafter.
- Docencia y experimentacion con vLLM: la procedencia del lanzamiento de vLLM incluida en `provenance/store/` facilita montar el entorno de extraccion de activaciones y reproducir el pipeline.
- Benchmarking interno de tecnicas de aceleracion: comparar este checkpoint con otras variantes de la serie (`mix24k`, `mix100k`, `abl24k`) para medir el impacto de la composicion del store y del rango LoRA.

## Benchmarks y rendimiento

La model card incluye una validacion sobre 200 filas fijas, con una fila por LoRA, midiendo `full_acc` y la longitud media de aceptacion (`τ`, eal):

| Update | full_acc | τ (eal) | chat | code | formal | math | roleplay | science |
|---|---|---|---|---|---|---|---|---|
| 0 | 0.4447 | 5.987 | 0.2764 | 0.5573 | 0.4909 | 0.6774 | 0.2107 | 0.4554 |
| 4000 | 0.4568 | 6.254 | 0.2813 | 0.5702 | 0.5222 | 0.6857 | 0.2204 | 0.4610 |

El entrenamiento mejora `full_acc` en 0,0121 puntos y la longitud media de aceptacion en 0,267 tokens. Los mayores avances se observan en formal (+0,0313) y code (+0,0129); roleplay sigue siendo el dominio mas debil (0,2204). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el artefacto es un drafter y no un modelo generativo evaluable de forma directa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo ocupa 0,2 GB, pero el checkpoint incluye estado del optimizador y el drafter debe cargarse junto al modelo objetivo Qwen3-8B (aproximadamente 16 GB en BF16 solo para el objetivo).
- GPU recomendadas: no disponible. Para servir Qwen3-8B en BF16 se requiere al menos una GPU de 24 GB (RTX 4090, L40S, A10G) o una A100/H100 para mayor throughput.
- Cabe en consumer GPU: el modelo objetivo Qwen3-8B si cabe en RTX 4090 (24 GB) en BF16; el drafter, al ser ligero, anade poco. No se confirma compatibilidad con GPUs de 8-12 GB sin cuantizacion del objetivo.
- Opciones de despliegue: el autor indica que la exportacion de serving de DFlash no esta portada, por lo que no hay bundle listo para vLLM, llama.cpp, Ollama o TGI. La procedencia incluye el lanzamiento de vLLM usado para extraer activaciones, no para servir el drafter.
- Latencia y throughput: no disponibles. La mejora de `τ` de 5,987 a 6,254 sugiere un incremento modesto en tokens aceptados por paso de verificacion, pero no se publican mediciones de latencia end-to-end.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| dyn-spec-dflash-newmix24k-amb-attn-r64-3ep-kl-pt256 | DFlash drafter (LoRA r64) | no disponible | no disponible | no disponible | Checkpoint de investigacion |
| dyn-spec-dflash-mix100k-generator-attn-r64-3ep-kl-pt256 | DFlash drafter (LoRA r64) | no disponible | no disponible | no disponible | Checkpoint de investigacion |
| dyn-spec-dflash-mix24k-generator-attn-r32-3ep-kl | DFlash drafter (LoRA r32) | no disponible | no disponible | no disponible | Checkpoint de investigacion |
| dyn-spec-dflash-abl24k-generator-attn-r64-2ep-kl-pt256 | DFlash drafter (LoRA r64, 2 epocas) | no disponible | no disponible | no disponible | Checkpoint de investigacion |

Las alternativas mas directas son las otras variantes de la misma serie `dyn-spec`, que difieren en el store de activaciones (`newmix24k` frente a `mix24k` o `mix100k`), el rango LoRA (r32 frente a r64) y el numero de epocas (2 frente a 3). No se dispone de datos publicos que comparen estas variantes entre si mas alla de las tablas de validacion individuales. Frente a drafters autorregresivos genericos (EAGLE, Medusa), DFlash se distingue por su enfoque de difusion por bloques, pero no hay comparativa numerica en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje autonomo: requiere Qwen3-8B como modelo objetivo y un runtime de decodificacion especulativa compatible con DFlash.
- No es un bundle de serving: el autor afirma explicitamente que la exportacion de serving de DFlash aun no esta portada; el artefacto es un checkpoint de entrenamiento con estado del optimizador.
- Licencia no declarada: no se especifica licencia, lo que impide evaluar su uso comercial con seguridad juridica.
- Idiomas no declarados: no hay informacion sobre cobertura multilingue; heredara en la practica la del modelo objetivo.
- Sesgos y alucinacion: no documentados en la model card; al ser un drafter, los errores se filtran por la verificacion del modelo objetivo, pero un borrador sesgado puede reducir la tasa de aceptacion en ciertos dominios.
- Rendimiento desigual por dominio: roleplay obtiene `full_acc` de 0,2204 frente a 0,6857 en math, lo que sugiere que el drafter es menos fiable en dominios conversacionales.
- Reproducibilidad dependiente del store: los resultados estan ligados al dataset `dyn-spec-dflash-store-qwen3-8b-newmix24k` y al commit concreto del drafter base; variaciones en cualquiera de los dos invalidan la comparacion.
- Fecha de creacion futura (2026-11-21): conviene verificar la integridad del repositorio y del `MANIFEST.json` antes de reutilizarlo.
- Sin datos de latencia end-to-end: la mejora en `τ` no garantiza una mejora proporcional en throughput real sin mediciones en el runtime objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-newmix24k-amb-attn-r64-3ep-kl-pt256
- Store de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-newmix24k
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Repositorio GitHub de DFlash: https://github.com/z-lab/dflash
- Variante mix100k: https://huggingface.co/erdem-erdem/dyn-spec-dflash-mix100k-generator-attn-r64-3ep-kl-pt256
- Variante mix24k r32: https://huggingface.co/erdem-erdem/dyn-spec-dflash-mix24k-generator-attn-r32-3ep-kl
- Variante abl24k r64 2ep: https://huggingface.co/erdem-erdem/dyn-spec-dflash-abl24k-generator-attn-r64-2ep-kl-pt256
- Modelo objetivo Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
