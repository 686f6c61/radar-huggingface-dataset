# mradermacher/Qwen3.6-35B-A3B-Fable-5-Distill-heretic-i1-GGUF

## Resumen

Qwen3.6-35B-A3B-Fable-5-Distill-heretic-i1-GGUF es una cuantizacion GGUF en formato imatrix (i1) del modelo Authereon/Qwen3.6-35B-A3B-Fable-5-Distill-heretic, publicada por el usuario mradermacher. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) derivado de la familia Qwen3.6, con 34.660.610.688 parametros totales y aproximadamente 3.000 millones de parametros activos por token (segun la nomenclatura A3B del nombre), afinado mediante destilacion con chain-of-thought y DPO, y marcado como "heretic" y "uncensored" por el autor del modelo base.

El modelo resuelve el problema de desplegar un MoE de ~35B parametros en hardware de consumo o en entornos con VRAM limitada, ofreciendo cuantizaciones desde IQ1_S (~7,6 GB) hasta Q5_K_S (~24,1 GB). La publicacion incluye un fichero imatrix para generar cuantizaciones propias y una coleccion amplia de variantes IQ y K-quant, lo que permite ajustar el equilibrio entre calidad y footprint de memoria.

Es relevante ahora porque combina tres tendencias: la eficiencia de los MoE con pocos parametros activos, el ajuste fino orientado a razonamiento (distillation + chain-of-thought) y la defensa frente a prompt injection, ademas de una licencia Apache 2.0 que facilita el uso comercial. La model card, no obstante, es muy escueta y no documenta arquitectura interna, contexto ni datos de entrenamiento, por lo que muchos datos tecnicos quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer, segun tags del modelo (no se detalla en la model card) |
| Parametros totales | 34.660.610.688 (~34,66 B) |
| Parametros activos | ~3 B (inferido de la nomenclatura A3B; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S (imatrix i1) |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones imatrix i1); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna del modelo base. Los tags indican que se trata de un Mixture-of-Experts (moe) de la familia Qwen3.6, con 34,66 B de parametros totales y un regimen de activacion dispersa que, por la nomenclatura A3B del nombre, rondaria los 3 B de parametros activos por token. No se especifica el numero de expertos, el tamano de cada uno, la atencion utilizada (estandar, GQA, linear) ni la longitud de contexto nativa.

En cuanto al entrenamiento, los tags apuntan a un proceso de destilacion (distillation) con chain-of-thought y a un ajuste posterior con DPO. El sufijo "heretic" y la etiqueta "uncensored" indican que el autor del modelo base aplico alguna tecnica de ablacion o reentrenamiento para reducir el rechazo (refusals) del modelo original. Tambien aparece la etiqueta "prompt-injection-defense", que sugiere un entrenamiento orientado a resistir inyecciones de prompt. No se publican el numero de tokens de entrenamiento, la composicion del dataset ni los hiperparametros del ajuste.

La publicacion de mradermacher es una cuantizacion, no un entrenamiento: parte del modelo base en safetensors y genera GGUF con imatrix (i1), lo que mejora la calidad de las cuantizaciones de baja precision frente a las estaticas. Se ofrece ademas un fichero imatrix independiente para que terceros puedan producir sus propias cuantizaciones.

## Capacidades

- Generacion de texto conversacional y de proposito general (pipeline: text-generation).
- Razonamiento explicito con chain-of-thought, segun los tags reasoning y chain-of-thought.
- Destilacion de razonamiento: el modelo ha sido entrenado para reproducir trazas de razonamiento de un modelo mayor.
- Defensa frente a prompt injection, segun la etiqueta prompt-injection-defense.
- Comportamiento "uncensored" / "heretic": menor tendencia al rechazo segun la etiqueta del autor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque el chain-of-thought es compatible con este uso.
- Capacidades multilingues: limitadas al ingles segun la model card (language: en).
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Razonamiento asistido en local: el modelo puede ejecutarse en una estacion de trabajo con GPU de consumo usando las cuantizaciones i1-Q4_K_M (~21,3 GB) o i1-IQ4_XS (~18,8 GB), lo que permite desplegar un MoE de ~35 B con activacion dispersa sin infraestructura de centro de datos.
- Generacion de codigo y explicaciones tecnicas: al estar afinado con chain-of-thought y DPO, es adecuado para tareas de explicacion paso a paso, revision de fragmentos de codigo y generacion de documentacion tecnica en ingles.
- Prototipado de asistentes conversacionales: su naturaleza conversacional y su licencia Apache 2.0 permiten integrarlo en productos comerciales sin obligaciones de atribucion adicionales mas alla de las de Apache.
- Investigacion sobre alineacion y censura: la variante "heretic" es util para estudiar el comportamiento de modelos con rechazo reducido y comparar respuestas frente al modelo original.
- Evaluacion de robustez frente a prompt injection: la etiqueta prompt-injection-defense lo hace candidato para pruebas de seguridad en pipelines de LLM, midiendo su resistencia a ataques adversariales.
- Despliegue en entornos con VRAM limitada: las cuantizaciones IQ1/IQ2 (desde ~7,6 GB) permiten ejecutar el modelo en GPUs de 8-12 GB, aunque con perdida notable de calidad, util para demos y pruebas de concepto.
- Generacion de datos sinteticos y destilacion: al ser un modelo destilado con trazas de razonamiento, puede emplearse para generar pares pregunta-respuesta con cadena de pensamiento en ingles para entrenar modelos menores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (tamano de fichero GGUF):
  - i1-IQ1_S: ~7,6 GB
  - i1-IQ2_XXS: ~9,6 GB
  - i1-IQ2_M: ~11,8 GB
  - i1-Q2_K: ~13,0 GB
  - i1-IQ3_XXS: ~13,7 GB
  - i1-IQ3_M: ~15,5 GB
  - i1-Q3_K_L: ~18,2 GB
  - i1-IQ4_XS: ~18,8 GB
  - i1-Q4_K_S: ~20,0 GB
  - i1-Q4_K_M: ~21,3 GB
  - i1-Q5_K_S: ~24,1 GB
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) puede alojar hasta i1-Q5_K_S; una RTX 3090 (24 GB) o RTX 4080 (16 GB) cubren hasta IQ3_M o Q3_K_L; una RTX 4070 (12 GB) queda limitada a IQ2_M o inferiores.
- Cabe en GPU de consumo: si, en modelos con 12-24 GB de VRAM segun cuantizacion; las variantes IQ1/IQ2 permiten incluso GPUs de 8-10 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los tags indican endpoints_compatible. No se documenta soporte de vLLM o TGI para esta cuantizacion (vLLM y TGI trabajan preferentemente con safetensors).
- Latencia y throughput: no disponibles. Al ser un MoE con ~3 B de parametros activos, el throughput deberia ser superior al de un denso de 35 B, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Fable-5-Distill-heretic (i1-GGUF) | ~34,66 B | ~3 B (inferido) | no disponible | Apache 2.0 | GGUF i1 | Destilado, uncensored, defensa prompt injection |
| Qwen3.6-35B-A3B-Fable-5-Distill-heretic (base) | ~34,66 B | ~3 B (inferido) | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Qwen3.6-35B-A3B-Fable-5-Distill-heretic (GGUF estatico) | ~34,66 B | ~3 B (inferido) | no disponible | Apache 2.0 | GGUF estatico | Misma familia, cuantizacion sin imatrix |

No se dispone de datos de benchmarks ni de modelos comparables de otros autores en la informacion proporcionada, por lo que la comparativa se limita a las variantes de la misma familia.

## Limitaciones y advertencias

- La model card es extremadamente escueta: no documenta arquitectura, contexto, datos de entrenamiento ni evaluaciones, lo que dificulta validar el modelo antes de produccion.
- Solo se declara soporte de ingles (language: en); el rendimiento en castellano u otros idiomas no esta garantizado.
- El caracter "uncensored" y "heretic" implica que el modelo puede generar contenido que otros modelos rechazarian; requiere filtros y politicas de uso en produccion.
- Riesgo de alucinacion no cuantificado: no hay benchmarks ni evaluaciones de fidelidad publicadas.
- Las cuantizaciones IQ1 e IQ2 (7,6-11,8 GB) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality".
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y sus derivados pueden arrastrar obligaciones de atribucion de Qwen; conviene revisar la licencia del modelo base original.
- El tag prompt-injection-defense no garantiza robustez frente a ataques; debe validarse con pruebas propias.
- El repo ocupa 371 GB por incluir todas las cuantizaciones; la descarga selectiva de un unico fichero GGUF es imprescindible.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse en integraciones que dependan de function calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Fable-5-Distill-heretic-i1-GGUF
- Modelo base: https://huggingface.co/Authereon/Qwen3.6-35B-A3B-Fable-5-Distill-heretic
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Fable-5-Distill-heretic-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.6-35B-A3B-Fable-5-Distill-heretic-i1-GGUF
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
