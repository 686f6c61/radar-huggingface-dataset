# arbora-anon/arbora-qwen3.8-27b-drafter

## Resumen

Arbora Qwen3.8-27B drafter es un modelo auxiliar de decodificacion especulativa (speculative decoding) disenado para acelerar la inferencia de su modelo objetivo, z-lab/Qwen3.8-27B-DFlash2. No es un modelo de proposito general: es un "drafter" que propone tokens candidatos que el modelo objetivo verifica en paralelo, reduciendo el coste por token generado sin alterar la distribucion de salida. Lo publica el autor anonimo arbora-anon como parte del material de codigo del articulo "Arbora: Candidate-Aware Mixture of Speculators for Block Diffusion Drafters", actualmente en revision anonima.

El modelo parte de los pesos de z-lab/Qwen3.8-27B-DFlash2 y se entrena tres epocas adicionales siguiendo el layout de la libreria speculators. Con 4.467.201.280 parametros (aproximadamente 4,5 mil millones), esta muy por debajo de los 27 mil millones del modelo objetivo, lo que permite ejecutarlo en la misma GPU o en una secundaria con un coste de memoria moderado. El repositorio ocupa 8,9 GB e incluye copias del embedding y de la cabeza de salida del modelo objetivo, necesarias para el proceso de exportacion a SGLang.

Su relevancia es practica: la decodificacion especulativa es una de las tecnicas mas extendidas para reducir la latencia en serving de LLM, y este drafter esta especificamente ajustado a las respuestas del modelo objetivo, lo que en teoria mejora la tasa de aceptacion de tokens frente a un drafter generico. La licencia Apache 2.0 facilita su integracion en produccion, aunque el uso esta condicionado a disponer del modelo objetivo y del pipeline de exportacion del proyecto Arbora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de decodificacion especulativa (block diffusion drafter, layout speculators); arquitectura interna no detallada |
| Parametros totales | 4.467.201.280 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors + config.json) |

## Arquitectura y entrenamiento

El modelo es un drafter para decodificacion especulativa construido sobre el layout de la libreria speculators y derivado de z-lab/Qwen3.8-27B-DFlash2, al que se anaden tres epocas de entrenamiento adicional. El articulo asociado lo enmarca en una propuesta de "mixture of speculators" consciente de candidatos para drafters de difusion por bloques (block diffusion drafters), es decir, drafters que proponen bloques de tokens en lugar de tokens individuales. La model card no detalla la arquitectura interna (numero de capas, dimension oculta, mecanismo de atencion), por lo que estos datos no estan disponibles.

El entrenamiento se realizo sobre las propias respuestas del modelo objetivo, un enfoque de destilacion orientado a alinear la distribucion del drafter con la del verificador y maximizar la tasa de aceptacion. El repositorio incluye copias del embedding y de la cabeza de salida del modelo objetivo, lo que sugiere que el drafter reutiliza esas componentes para mantener coherencia de vocabulario. No se especifica el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; al tratarse de un drafter, el ajuste por preferencias no seria el mecanismo habitual.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa: su funcion principal es proponer tokens que el modelo objetivo Qwen3.8-27B-DFlash2 verifica, acelerando la generacion.
- Drafting por bloques: el enfoque de block diffusion drafters implica proponer bloques de tokens en paralelo, no solo el siguiente token.
- Integracion con SGLang: el flujo de exportacion documentado genera un artefacto consumible por SGLang como DRAFTER.
- Compatibilidad con el pipeline Arbora: se usa como drafter en los modos path-scorer, experts y serving-files de arbora/run.sh.
- No es un modelo de chat autonomo: no se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues: no documentadas; dependen del vocabulario heredado del modelo objetivo, pero no se especifican idiomas.

## Casos de uso

- Aceleracion de serving en produccion: desplegar el drafter junto al modelo objetivo en SGLang para reducir la latencia por token en cargas de generacion larga, aprovechando que el drafter es unas seis veces mas pequeno que el objetivo.
- Reduccion de coste en GPU: al ocupar 8,9 GB el repositorio completo, el drafter puede residir en la misma GPU que el modelo objetivo o en una secundaria, disminuyendo el numero de GPUs necesarias frente a servir solo el modelo grande con mayor latencia.
- Investigacion en decodificacion especulativa: usar el modelo como punto de partida reproducible para experimentar con mezclas de speculators y comparar tasas de aceptacion, dado que el codigo del articulo Arbora esta publicado.
- Evaluacion de drafters ajustados al objetivo: medir el impacto de tres epocas adicionales de entrenamiento sobre las respuestas del modelo objetivo frente al checkpoint base z-lab/Qwen3.8-27B-DFlash2.
- Despliegue de asistentes de codigo de baja latencia: en pipelines donde el modelo objetivo genera codigo, el drafter acelera la salida en escenarios de autocompletado o generacion de parches, siempre que el objetivo sea Qwen3.8-27B-DFlash2.
- Reproduccion de resultados academicos: servir el modelo con el pipeline Arbora para replicar las filas DFlash2 del articulo y validar la metodologia de mixture of speculators.
- Integracion en CI/CD de modelos: automatizar la exportacion con export_d2_for_sglang.py y validar la latencia en entornos de staging antes de promover a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de aceptacion, speedup, latencia ni metricas de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 8,9 GB en safetensors; en precision de entrenamiento (probablemente bf16/fp16) los pesos de 4,47 mil millones de parametros ocupan en torno a 8,9 GB, a lo que hay que sumar cache KV y overhead del runtime. No se documentan cuantizaciones, por lo que no hay cifras para GGUF o int8.
- GPU recomendadas: no especificadas por el autor. Por tamano, una GPU con 16-24 GB de VRAM deberia alojar el drafter, pero debe convivir con el modelo objetivo de 27 mil millones de parametros, que requiere hardware adicional o mayor.
- Cabe en GPU consumer: previsiblemente si en RTX 4090 (24 GB) o RTX 3090 (24 GB) para el drafter aislado; no se confirma en la informacion disponible.
- Opciones de despliegue: SGLang mediante export_d2_for_sglang.py; el pipeline Arbora (arbora/run.sh). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arbora-qwen3.8-27b-drafter | 4,47 B | no disponible | Drafter especulativo para Qwen3.8-27B-DFlash2 | Apache 2.0 | Hugging Face |
| z-lab/Qwen3.8-27B-DFlash2 (modelo base) | 27 B (aproximado por el nombre) | no disponible | Modelo objetivo | no disponible | Hugging Face |
| Drafters genericos de decodificacion especulativa | no disponible | no disponible | Drafter no ajustado al objetivo | variable | variable |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo auxiliar, no autonomo: no puede usarse como LLM de proposito general; requiere el modelo objetivo Qwen3.8-27B-DFlash2 y el pipeline de exportacion para funcionar.
- Dependencia fuerte del objetivo: al estar entrenado sobre las respuestas de un modelo concreto, su tasa de aceptacion caera si se empareja con otro modelo.
- Documentacion escasa: la model card no detalla contexto, cuantizaciones, idiomas ni arquitectura interna, lo que dificulta planificar el despliegue.
- Estado de revision: el articulo asociado esta en revision anonima; los resultados pueden cambiar y el codigo se aloja en un enlace anonimo (anonymous.4open.science).
- Riesgo de alucinacion: no aplica de forma directa porque el modelo objetivo verifica los tokens, pero un drafter mal ajustado degrada el speedup sin mejorar la calidad.
- Licencia: Apache 2.0 permite uso comercial, pero deben revisarse los avisos de terceros en NOTICE y la licencia del modelo base.
- Sin garantias de produccion: no hay benchmarks publicados ni validacion independiente; conviene medir la tasa de aceptacion en el hardware y carga reales antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/arbora-anon/arbora-qwen3.8-27b-drafter
- Modelo base: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Codigo del proyecto Arbora (revision anonima): https://anonymous.4open.science/r/arbora-7ABE
