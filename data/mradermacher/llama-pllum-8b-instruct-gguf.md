# mradermacher/Llama-PLLuM-8B-instruct-GGUF

## Resumen

Llama-PLLuM-8B-instruct-GGUF es la distribucion en formato GGUF del modelo CYFRAGOVPL/Llama-PLLuM-8B-instruct-2412, una adaptacion al polaco del modelo Llama 3.1 de 8B parametros desarrollada por el gobierno de Chipre (CYFRAGOVPL) y cuantizada por mradermacher. El modelo resuelve la necesidad de disponer de un asistente conversacional especializado en lengua polaca que pueda ejecutarse en hardware de consumo mediante cuantizacion, manteniendo la arquitectura y licencia originales de Llama 3.1.

El repositorio incluye once variantes de cuantizacion estatica que van desde Q2_K (3,3 GB) hasta f16 (16,2 GB), lo que permite desplegar el modelo en escenarios que abarcan desde GPUs con poca VRAM hasta entornos de servidor. Con 8.030.277.696 parametros totales y un enfoque monoidioma (polaco), el modelo es relevante para desarrolladores que necesitan un asistente local en polaco sin depender de APIs externas ni de modelos multilingues de mayor tamano.

La licencia Llama 3.1 impone las condiciones de uso de Meta, lo que condiciona el despliegue comercial. El modelo base fue publicado en diciembre de 2024 y esta cuantizacion se creo el 25 de febrero de 2025, con actualizaciones posteriores del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.1 8B) |
| Parametros totales | 8.030.277.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | polaco (pl) |
| Licencia | llama3.1 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es una adaptacion al polaco de Llama 3.1 8B, un transformer decoder-only con atencion por grupos (GQA) y tokenizador propio de la familia Llama 3. La informacion proporcionada no detalla el proceso de entrenamiento del modelo base CYFRAGOVPL/Llama-PLLuM-8B-instruct-2412: no se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones tecnicas adicionales mas alla de las inherentes a Llama 3.1.

La contribucion de este repositorio es exclusivamente la cuantizacion: mradermacher ha generado cuantizaciones estaticas (sin imatrix ni weighted quants, segun indica el propio autor) a partir de los pesos del modelo base en formato Hugging Face. No se ha realizado un entrenamiento adicional ni una destilacion; se trata de una conversion de precision con perdida progresiva segun el nivel de cuantizacion.

## Capacidades

- Generacion de texto conversacional en polaco, heredada del ajuste de instrucciones del modelo base.
- Razonamiento y respuesta a instrucciones en formato chat multi-turno.
- Capacidad de ejecucion local en CPU y GPU gracias al formato GGUF.
- Compatibilidad con endpoints (tag `endpoints_compatible` en el repositorio).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al polaco segun el tag de idioma; no se documenta soporte de otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en polaco: el modelo puede desplegarse con llama.cpp u Ollama en una estacion de trabajo y gestionar dialogos multi-turno sin conexion a Internet, lo que resulta adecuado para entornos con requisitos de privacidad o sin conectividad.
- Prototipado rapido en GPUs de consumo: la cuantizacion Q4_K_M (5,0 GB) permite ejecutar el modelo en tarjetas con 8 GB de VRAM, facilitando pruebas de concepto y desarrollo iterativo sin infraestructura de servidor.
- Generacion de texto en polaco para documentacion tecnica: el ajuste de instrucciones del modelo base permite redactar borradores y resumenes en polaco, con la ventaja de que el contenido no sale del entorno local.
- Integracion en pipelines de procesamiento por lotes: el formato GGUF y la licencia Llama 3.1 permiten incorporar el modelo en flujos de trabajo automatizados de clasificacion o extraccion de texto en polaco, siempre que se respeten las condiciones de la licencia.
- Educacion e investigacion en PLN (procesamiento de lenguaje natural): investigadores que estudian el rendimiento de modelos Llama adaptados a lenguas eslavas pueden usar estas cuantizaciones para experimentar con diferentes niveles de precision y medir el impacto en la calidad.
- Despliegue en entornos con recursos limitados: las variantes Q2_K y Q3_K_S (3,3 y 3,8 GB) permiten ejecutar el modelo en dispositivos con menos de 6 GB de memoria, aunque con perdida de calidad documentada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del archivo GGUF mas el overhead del runtime. Para Q4_K_M (5,0 GB) se recomiendan al menos 6-7 GB de VRAM; para Q8_0 (8,6 GB), al menos 10 GB; para f16 (16,2 GB), al menos 18 GB.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A100, H100. Las variantes Q4 y Q5 caben en GPUs de consumo de gama media-alta; f16 requiere GPUs de 24 GB o superiores.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas para cuantizaciones Q4 y Q5. Las variantes Q2 y Q3 caben en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estandar.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Llama-PLLuM-8B-instruct (este) | 8,03B | no disponible | pl | llama3.1 | GGUF |
| Llama-3.1-8B-Instruct | 8,03B | 128k (segun documentacion de Meta, no verificada aqui) | multilingue | llama3.1 | safetensors, GGUF |
| mradermacher/Llama-3-Instruct-Neurona-8b-v2-GGUF | 8B (aproximado) | no disponible | no disponible | no disponible | GGUF |

La comparativa con Llama-3.1-8B-Instruct es la mas directa por compartir arquitectura y licencia; la diferencia principal es la especializacion en polaco del modelo PLLuM. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; se heredan los sesgos del corpus de entrenamiento del modelo base, no especificado.
- Riesgo de alucinacion: presente como en cualquier modelo generativo de 8B; no se han publicado evaluaciones de fidelidad.
- Limitaciones de contexto o idioma: el modelo esta orientado exclusivamente al polaco segun el tag de idioma; el rendimiento en otros idiomas no esta garantizado. La longitud de contexto no se documenta en la informacion disponible.
- Restricciones de licencia: la licencia llama3.1 de Meta impone condiciones para uso comercial, incluyendo restricciones de escala y obligaciones de atribucion; es necesario revisar los terminos completos antes de un despliegue en produccion.
- Caveats de produccion: las cuantizaciones estaticas (sin imatrix) pueden degradar la calidad mas que las cuantizaciones ponderadas; el autor indica que no hay weighted/imatrix quants disponibles. Las variantes Q2 y Q3 conllevan perdida de calidad significativa. No se han publicado benchmarks que permitan validar la calidad tras la cuantizacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Llama-PLLuM-8B-instruct-GGUF
- Modelo base: https://huggingface.co/CYFRAGOVPL/Llama-PLLuM-8B-instruct-2412
- Pagina de descargas del autor: https://hf.tst.eu/model#Llama-PLLuM-8B-instruct-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
