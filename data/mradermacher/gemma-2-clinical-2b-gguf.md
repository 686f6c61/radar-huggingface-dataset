# mradermacher/gemma-2-clinical-2b-GGUF

## Resumen

`mradermacher/gemma-2-clinical-2b-GGUF` es una colección de cuantizaciones en formato GGUF del modelo `lmussio/gemma-2-clinical-2b`, un ajuste fino del modelo base Gemma 2 de 2B parámetros orientado al dominio clínico y médico. El trabajo de cuantización lo realiza mradermacher, un conocido publicador de cuantizaciones GGUF de la comunidad, no el autor original del modelo. El modelo cuenta con 2.614.341.888 parámetros totales (aproximadamente 2,6B), según los pesos en safetensors del repositorio.

El propósito de esta publicación es ofrecer versiones comprimidas del modelo clínico para su despliegue en hardware modesto mediante llama.cpp y herramientas compatibles, con opciones que van desde 1,3 GB (Q2_K) hasta 5,3 GB (f16). Esto permite ejecutar un modelo especializado en texto clínico en inglés en GPUs de consumo e incluso en CPU.

La relevancia de esta ficha radica en que documenta un artefacto de cuantización más que un modelo original: la información sobre arquitectura, entrenamiento y benchmarks del modelo base no está disponible en la información proporcionada, por lo que muchos campos de esta ficha se marcan explícitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Gemma 2; arquitectura concreta no documentada en la informacion disponible) |
| Parametros totales | 2.614.341.888 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repositorio | 24,5 GB |
| Modelo base | lmussio/gemma-2-clinical-2b |
| Libreria | transformers |
| Autor de la cuantizacion | mradermacher |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base `lmussio/gemma-2-clinical-2b` en la documentacion proporcionada. Por el nombre y el linaje, se trata de un ajuste fino del modelo Gemma 2 de aproximadamente 2B parametros, pero no se confirman en la informacion disponible ni la composicion del dataset de ajuste, ni el numero de tokens de entrenamiento, ni si se emplearon tecnicas de RLHF, DPO o SFT supervisado.

Respecto al proceso de cuantizacion, la model card de mradermacher indica que se trata de cuantizaciones estaticas (no imatrix) generadas con un pipeline propio (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`). El autor publica ademas una version con cuantizaciones ponderadas/imatrix en un repositorio separado (`mradermacher/gemma-2-clinical-2b-i1-GGUF`), que suele ofrecer mejor calidad por tamano que las cuantizaciones estaticas equivalentes.

## Capacidades

- Generacion de texto en ingles orientada al dominio clinico y medico, segun el ajuste fino del modelo base.
- No se documentan en la informacion disponible capacidades de tool calling, function calling ni soporte de agentes.
- No se documentan capacidades multimodales (vision o audio) ni modo de razonamiento explicito (thinking mode).
- Capacidades multilingues limitadas al ingles segun la etiqueta de idioma del repositorio.
- Compatible con el ecosistema de inferencia GGUF (llama.cpp y derivados), lo que permite ejecucion local en CPU y GPU.

## Casos de uso

- Despliegue local de asistencia clinica en ingles: con cuantizaciones Q4_K_M de 1,8 GB, el modelo puede ejecutarse en portatiles con 8 GB de RAM para generar borradores de texto clinico, resumenes de notas o explicaciones de terminologia medica en entornos de prueba.
- Prototipado rapido de aplicaciones sanitarias: al ser un GGUF pequeno, permite iterar sobre prompts y flujos de preguntas-respuestas medicas en una maquina de desarrollo sin necesidad de GPU dedicada.
- Educacion y formacion medica: uso como generador de preguntas de repaso o explicaciones simplificadas de conceptos clinicos en ingles, con supervision humana obligatoria.
- Investigacion en NLP clinico: servir como linea base cuantizada para comparar tecnicas de ajuste fino en dominio medico frente al Gemma 2 original.
- Procesamiento por lotes en CPU: la version Q4_K_S (1,7 GB) permite ejecutar clasificacion o extraccion de texto clinico en servidores sin GPU, con throughput limitado pero suficiente para volumenes moderados.
- Integracion en asistentes de documentacion clinica: el modelo puede insertarse en pipelines de generacion de borradores de informes en ingles, siempre con revision por parte de un profesional sanitario.
- Experimentacion con cuantizaciones: el repositorio ofrece doce variantes de cuantizacion, lo que facilita estudios comparativos de calidad frente a tamano en un modelo de dominio especifico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion: Q2_K ~1,3 GB; Q4_K_S y Q4_K_M ~1,7-1,8 GB; Q5_K_M ~2,0 GB; Q6_K ~2,3 GB; Q8_0 ~2,9 GB; f16 ~5,3 GB. A estas cifras hay que sumar el espacio para el contexto KV cache.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano, cualquier GPU con 4 GB o mas de VRAM puede alojar las cuantizaciones Q4 y Q5; el f16 requiere al menos 6-8 GB.
- Cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores con las cuantizaciones Q4-Q8. Las cuantizaciones bajas (Q2_K, Q3_K) pueden ejecutarse incluso en iGPU o en CPU.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF. El repositorio esta etiquetado como `endpoints_compatible`, lo que sugiere compatibilidad con endpoints de Hugging Face. No se documenta soporte para vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/gemma-2-clinical-2b-GGUF | ~2,6B | no disponible | no disponible | GGUF | Cuantizacion de un ajuste fino clinico sobre Gemma 2 2B |
| mradermacher/gemma-2b-instruct-ft-ai-medical-GGUF | no disponible | no disponible | no disponible | GGUF | Otra cuantizacion de mradermacher de un modelo medico basado en Gemma 2B |
| lmussio/gemma-2-clinical-2b | ~2,6B | no disponible | no disponible | safetensors | Modelo base sin cuantizar del que deriva esta publicacion |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- El modelo es un ajuste fino en dominio clinico generado por un tercero (`lmussio`), sin documentacion publica en la informacion disponible sobre el dataset, el proceso de entrenamiento o la validacion clinica. No debe usarse como fuente de consejo medico.
- Riesgo elevado de alucinacion en contenido medico: no se han publicado evaluaciones de fidelidad factual en la informacion disponible.
- Idioma limitado al ingles; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- La licencia no esta disponible en la informacion proporcionada, por lo que no se puede confirmar si se permite el uso comercial. Al derivar de Gemma 2, es probable que herede las condiciones de la licencia de Gemma, pero esto no se confirma en los datos disponibles.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S, Q3_K_M) degradan la calidad; la propia model card advierte que Q3_K_M es de calidad inferior. Para uso sensible se recomienda Q5_K_M o superior, o las versiones imatrix del repositorio `-i1-GGUF`.
- El repositorio tiene un numero muy bajo de descargas (11) y cero likes, lo que indica escasa validacion por parte de la comunidad.
- No se documentan limitaciones especificas de contexto porque la longitud de contexto del modelo base no esta disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-2-clinical-2b-GGUF
- Modelo base: https://huggingface.co/lmussio/gemma-2-clinical-2b
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma-2-clinical-2b-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma-2-clinical-2b-GGUF
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Modelo similar cuantizado por el mismo autor: https://huggingface.co/mradermacher/gemma-2b-instruct-ft-ai-medical-GGUF
