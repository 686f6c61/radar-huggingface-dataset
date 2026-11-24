# mradermacher/Tenet-8B-Qwen3-Unslop-v2-GGUF

## Resumen

Tenet-8B-Qwen3-Unslop-v2 es un modelo de lenguaje de 8.190.735.360 parametros construido sobre la arquitectura Qwen3 y afinado por mr-andrey-isachenko. Esta ficha concreta corresponde a la version cuantizada en formato GGUF publicada por mradermacher, que facilita su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles. El modelo se presenta como un derivado orientado a razonamiento, uso de herramientas (tool-use), generacion de codigo y conversacion, con un proceso de "unslop" y "abliteration" que busca reducir respuestas excesivamente genericas y moderadas.

La relevancia de esta publicacion radica en la disponibilidad de cuantizaciones estaticas en multiples niveles (desde Q2_K hasta f16), lo que permite ejecutar un modelo de 8B en GPUs de consumo con requisitos de VRAM moderados. La licencia Apache 2.0 y la compatibilidad declarada con vLLM, endpoints y OpenRouter lo hacen atractivo para prototipado e integracion en pipelines de agentes.

No obstante, la informacion publicada es escasa: no se detallan datos de entrenamiento, composicion del dataset, resultados de benchmarks ni la longitud de contexto efectiva. Esta ficha refleja exclusivamente lo disponible en la model card y en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3 (no se detalla la variante exacta) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es mr-andrey-isachenko/Tenet-8B-Qwen3-Unslop-v2, del que se indica que emplea la arquitectura Qwen3 con 8.190.735.360 parametros. Los tags del repositorio mencionan tecnicas de afinado como GRPO, "unslop" y "abliteration", asi como un origen en Qwen3. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO mas alla de la mencion a GRPO. Tampoco se detalla ninguna innovacion arquitectonica adicional (atencion lineal, decodificacion especulativa, etc.).

La version aqui descrita es una cuantizacion estatica generada por mradermacher a partir del modelo base, con cuantizaciones estandar de llama.cpp. Existe una variante con cuantizaciones ponderadas/imatrix publicada en un repositorio separado (i1-GGUF).

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento con modo "thinking" (etiqueta reasoning/thinking en los tags).
- Generacion de codigo (tag coding).
- Uso de herramientas y function calling (tag tool-use).
- Flujos agenticos y razonamiento multi-paso (tag agentic).
- Modelo "abliterated"/"uncensored": se presenta con menor rechazo a peticiones, lo que implica menor alineacion de seguridad.
- Compatibilidad declarada con vLLM, endpoints compatibles y OpenRouter.
- Capacidades multilingues: solo se declara ingles; no hay evidencia de soporte para otros idiomas.

## Casos de uso

- Asistente de codigo en local: con cuantizaciones Q4_K_M (5,1 GB) o Q5_K_M (6,0 GB) puede ejecutarse en una GPU de consumo y emplearse para autocompletado, explicacion de codigo y generacion de tests en flujos de desarrollo individuales.
- Agente con tool calling: gracias al tag tool-use y a la compatibilidad con endpoints, puede integrarse en orquestadores de agentes que invoquen APIs externas, aunque la ausencia de datos de contexto limita su uso en conversaciones muy largas.
- Prototipado de razonamiento paso a paso: el modo thinking permite experimentar con cadenas de razonamiento en tareas de matematicas o logica, siempre validando los resultados por el riesgo de alucinacion.
- Despliegue en entornos con VRAM limitada: la cuantizacion Q2_K (3,4 GB) o Q3_K_S (3,9 GB) permite ejecutar el modelo en GPUs de gama media o incluso en CPU con llama.cpp, util para demos y pruebas offline.
- Generacion de contenido sin filtros excesivos: el caracter "uncensored" lo hace adecuado para experimentacion creativa o investigacion sobre alineacion, con las advertencias de seguridad correspondientes.
- Integracion via OpenRouter o endpoints compatibles: para equipos que prefieren no gestionar infraestructura propia, el modelo puede consumirse como servicio si el proveedor lo expone.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano del archivo GGUF mas overhead de contexto):
  - Q2_K: ~3,4 GB de pesos; ~4-5 GB de VRAM con contexto moderado.
  - Q3_K_S: ~3,9 GB; ~5-6 GB con contexto moderado.
  - Q4_K_M: ~5,1 GB; ~6-7 GB con contexto moderado.
  - Q5_K_M: ~6,0 GB; ~7-8 GB con contexto moderado.
  - Q6_K: ~6,8 GB; ~8-9 GB con contexto moderado.
  - Q8_0: ~8,8 GB; ~10-11 GB con contexto moderado.
  - f16: ~16,5 GB; ~18 GB o mas con contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB para cuantizaciones altas; A100/H100 para despliegues concurrentes con vLLM.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones Q4/Q5 con 8 GB o mas de VRAM; Q2/Q3 en GPUs de 6 GB.
- Opciones de despliegue: llama.cpp, Ollama (a partir de GGUF), vLLM (para el modelo base en safetensors o FP8), endpoints compatibles con OpenAI y OpenRouter.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tenet-8B-Qwen3-Unslop-v2 (esta ficha, GGUF) | 8,19 B | no disponible | Apache 2.0 | GGUF | Afinado sobre Qwen3, orientado a razonamiento y tool-use |
| Qwen3-8B (modelo base de referencia) | ~8 B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Base oficial de Alibaba; contexto y benchmarks no verificados aqui |
| Llama 3.1 8B | 8 B | 128 K (segun documentacion publica del modelo) | Llama 3.1 Community License | safetensors, GGUF | Alternativa popular de 8B con contexto largo; licencia no Apache |
| Mistral 7B | 7,3 B | 32 K (segun documentacion publica del modelo) | Apache 2.0 | safetensors, GGUF | Alternativa Apache de tamano similar, sin modo thinking nativo |

Los datos de contexto de los modelos comparados provienen de su documentacion publica habitual; no se dispone de comparaciones de rendimiento verificadas para este modelo concreto.

## Limitaciones y advertencias

- No se han publicado datos de benchmarks, por lo que no es posible evaluar su calidad frente a alternativas sin pruebas propias.
- El modelo esta marcado como "abliterated" y "uncensored": presenta menor alineacion de seguridad y mayor probabilidad de generar contenido inapropiado o danino. No se recomienda su uso directo en produccion orientada al publico sin filtros adicionales.
- Riesgo de alucinacion inherente a modelos de 8B; especialmente en tareas de razonamiento y codigo, requiere verificacion.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento en conversaciones largas o documentos extensos.
- La licencia Apache 2.0 permite uso comercial, pero el caracter "uncensored" traslada al desplegador la responsabilidad sobre el contenido generado.
- La model card no documenta sesgos conocidos ni la composicion del dataset de entrenamiento.
- El repositorio GGUF ocupa 73,4 GB en total por incluir todas las cuantizaciones; conviene descargar solo el archivo necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Tenet-8B-Qwen3-Unslop-v2-GGUF
- Modelo base: https://huggingface.co/mr-andrey-isachenko/Tenet-8B-Qwen3-Unslop-v2
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Tenet-8B-Qwen3-Unslop-v2-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Tenet-8B-Qwen3-Unslop-v2-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
