# mradermacher/Qwen3.6-35B-A3B-Fable-5-Distill-heretic-i1-GGUF

## Resumen

Qwen3.6-35B-A3B-Fable-5-Distill-heretic-i1-GGUF es una cuantizacion GGUF del modelo Authereon/Qwen3.6-35B-A3B-Fable-5-Distill-heretic, publicada por mradermacher. Se trata de un modelo de lenguaje de arquitectura Mixture of Experts (MoE) derivado de la familia Qwen3.6, con 34.660.610.688 parametros totales (aproximadamente 34,7 mil millones) y un nombre que indica 35B de parametros totales con 3B activos por token. El modelo base ha sido sometido a un proceso de destilacion con chain-of-thought y ajuste DPO, e incorpora la etiqueta "heretic", que en el ecosistema de modelos abiertos suele indicar un afinado orientado a reducir los rechazos y el comportamiento excesivamente restrictivo (uncensored).

La relevancia de esta publicacion es doble. Por un lado, ofrece el modelo en formato GGUF con cuantizaciones ponderadas mediante imatrix, lo que permite ejecutarlo en hardware de consumo con llama.cpp y derivados. Por otro, el repositorio incluye un rango amplisimo de cuantizaciones, desde IQ1_S de 7,6 GB hasta Q6_K, lo que facilita ajustar el equilibrio entre calidad y memoria disponible. El modelo esta etiquetado como vision model por el cuantizador, aunque los ficheros mmproj, si existen, se alojan en el repositorio estatico asociado.

La licencia es Apache 2.0 y el unico idioma declarado es el ingles. El modelo esta pensado para generacion de texto, razonamiento con cadena de pensamiento y conversacion, y su nombre sugiere tambien un enfasis en defensa frente a prompt injection. No se dispone de informacion detallada sobre la composicion del dataset de entrenamiento ni sobre resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), familia Qwen3.6 (transformer) |
| Parametros totales | 34.660.610.688 (aprox. 34,7 B) |
| Parametros activos | 3B (segun nomenclatura A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (ademas de fichero imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un Mixture of Experts de la familia Qwen3.6 con 34,7 mil millones de parametros totales y aproximadamente 3 mil millones activos por token, lo que permite un coste de inferencia por token mucho menor que el de un modelo denso del mismo tamano. La denominacion "Fable-5-Distill" indica un proceso de destilacion, y la etiqueta "chain-of-thought" sugiere que el entrenamiento incluye trazas de razonamiento explicito. El ajuste posterior incluye DPO (Direct Preference Optimization), segun las etiquetas del repositorio. La etiqueta "heretic" apunta a un afinado orientado a eliminar rechazos y restricciones de seguridad del modelo original, y "prompt-injection-defense" indica que se ha trabajado explicitamente la resistencia frente a inyeccion de instrucciones.

La cuantizacion la realiza mradermacher con el metodo i1, que emplea una matriz de importancia (imatrix) para ponderar la cuantizacion de los tensores y mejorar la calidad respecto a cuantizaciones estaticas del mismo tamano. El repositorio incluye el fichero imatrix para que otros usuarios puedan generar sus propias cuantizaciones. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni los detalles exactos del pipeline de destilacion.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento con cadena de pensamiento (chain-of-thought) heredado del proceso de destilacion.
- Destilacion de conocimiento desde un modelo mayor, segun la nomenclatura del modelo base.
- Ajuste DPO para alineamiento con preferencias.
- Comportamiento "uncensored" o "heretic": menor tendencia a rechazar peticiones.
- Defensa frente a prompt injection, segun la etiqueta prompt-injection-defense.
- Capacidad de vision indicada por el cuantizador (ficheros mmproj en el repositorio estatico, si existen).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente, aunque el modo chain-of-thought es compatible con ello.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Razonamiento asistido en local: el modelo puede ejecutarse con llama.cpp en una estacion de trabajo con GPU de consumo gracias a las cuantizaciones de 13-21 GB, y utilizarse para tareas de analisis y resolucion de problemas paso a paso con trazas de cadena de pensamiento.
- Generacion de texto creativo sin restricciones excesivas: el afinado "heretic" reduce los rechazos, lo que resulta util en escritura de ficcion, guiones o narrativa donde los modelos alineados de forma agresiva suelen negarse.
- Prototipado de asistentes conversacionales en ingles: al ser un MoE con 3B activos, ofrece latencia baja por token y permite iterar rapidamente en entornos de desarrollo con una sola GPU.
- Evaluacion de robustez frente a prompt injection: la etiqueta prompt-injection-defense lo hace candidato para probar defensas en pipelines de agentes y comparar su comportamiento frente a ataques de inyeccion de instrucciones.
- Despliegue en hardware limitado con cuantizaciones agresivas: las variantes IQ2 e IQ3 (9,6-16,9 GB) permiten ejecutar el modelo en GPUs de 12-16 GB o incluso en CPU con RAM suficiente, a costa de perdida de calidad.
- Investigacion sobre destilacion y alineamiento: util para estudiar como interactuan la destilacion con chain-of-thought, el DPO y el afinado "uncensored" en un modelo MoE de tamano medio.
- Fine-tuning posterior sobre el modelo base en safetensors: al estar el modelo original disponible en formato transformers, se puede adaptar con LoRA a dominios concretos y luego cuantizar a GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde aproximadamente 8 GB con i1-IQ1_M (8,3 GB) hasta unos 28-30 GB con i1-Q6_K; las cuantizaciones recomendadas i1-Q4_K_M (21,3 GB) e i1-Q4_K_S (20,0 GB) requieren alrededor de 22-24 GB de VRAM contando overhead de contexto.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M con contexto moderado; A100 40 GB, H100 o RTX A6000 para cuantizaciones Q5/Q6 y contextos largos; GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4060 Ti 16 GB) para cuantizaciones IQ2/IQ3.
- Cabe en GPU de consumo: si, en RTX 4090 con Q4_K_M y en GPUs de 16 GB con IQ3_M o IQ3_S; en GPUs de 12 GB solo con IQ2 o IQ1, con perdida notable de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI, aunque el repositorio GGUF esta pensado para llama.cpp.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; al ser un MoE con 3B activos, el throughput por token deberia ser sustancialmente mayor que el de un modelo denso de 35B, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Fable-5-Distill-heretic (i1-GGUF) | 34,7 B | 3 B | no disponible | Apache 2.0 | GGUF |
| Qwen3.6-35B-A3B-Fable-5-Distill-heretic (base) | 34,7 B | 3 B | no disponible | Apache 2.0 | safetensors |
| Qwen3.6-35B-A3B-Fable-5-Distill-heretic-GGUF (estatico) | 34,7 B | 3 B | no disponible | Apache 2.0 | GGUF |

No se dispone de datos de benchmarks ni de modelos alternativos comparables en la informacion proporcionada, por lo que la comparativa se limita a las variantes del mismo modelo.

## Limitaciones y advertencias

- El unico idioma declarado es el ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea inferior.
- El afinado "heretic"/"uncensored" implica que el modelo puede generar contenido que otros modelos rechazarian; es responsabilidad del desplegador aplicar las salvaguardas adecuadas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de factualidad.
- Las cuantizaciones IQ1 e IQ2 (7,6-11,8 GB) degradan notablemente la calidad; el propio autor las describe como "for the desperate" o "very low quality".
- La longitud de contexto no esta documentada en la informacion disponible, lo que dificulta planificar despliegues con ventanas largas.
- El modelo es una derivacion no oficial de Qwen3.6 realizada por terceros (Authereon y mradermacher); no cuenta con el respaldo del equipo original de Qwen.
- La licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base y de los datos de destilacion no estan detalladas.
- La capacidad de vision indicada por el cuantizador depende de ficheros mmproj que no se confirman en este repositorio; verificar antes de asumir soporte multimodal.
- No hay informacion sobre sesgos conocidos ni sobre evaluaciones de seguridad del afinado "heretic".

## Enlaces

- Repositorio Hugging Face (cuantizaciones i1): https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Fable-5-Distill-heretic-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Fable-5-Distill-heretic-GGUF
- Modelo base: https://huggingface.co/Authereon/Qwen3.6-35B-A3B-Fable-5-Distill-heretic
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.6-35B-A3B-Fable-5-Distill-heretic-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
