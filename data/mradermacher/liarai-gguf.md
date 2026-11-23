# mradermacher/LiarAI-GGUF

## Resumen

LiarAI es un modelo de lenguaje de aproximadamente 1.880 millones de parametros (1.881.825.088 exactos segun los pesos en safetensors) desarrollado por el usuario meromorphic y publicado bajo licencia Apache 2.0. El repositorio analizado aqui, `mradermacher/LiarAI-GGUF`, es una cuantizacion estatica del modelo original realizada por mradermacher, un conocido autor de cuantizaciones GGUF en Hugging Face. El modelo se etiqueta como `agent`, `qwen3_5` y `qwen3.5`, lo que sugiere que deriva de la familia Qwen 3.5, aunque la model card no lo confirma explicitamente.

La relevancia de esta ficha reside en que ofrece una via practica de desplegar un modelo conversacional pequeno (menos de 2.000 millones de parametros) en hardware modesto, con cuantizaciones que van desde 1,1 GB (Q2_K) hasta 3,9 GB (f16), incluyendo un suplemento multimodal `mmproj` que sugiere capacidades de vision. Esta orientado a generacion de texto en ingles y a casos de uso de agentes.

No obstante, la informacion disponible es limitada: la model card del repositorio GGUF es una plantilla generica de cuantizacion y no incluye detalles sobre arquitectura, datos de entrenamiento, benchmarks ni longitud de contexto. Todo lo que no aparece en la informacion proporcionada se marca como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como `qwen3_5` / `qwen3.5`, se infiere transformer derivado de Qwen 3.5, sin confirmar) |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; suplementos multimodales mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura en la model card proporcionada. Las etiquetas `qwen3_5` y `qwen3.5` apuntan a que el modelo base `meromorphic/LiarAI` deriva de la familia Qwen 3.5, lo que implicaria una arquitectura transformer decoder-only, pero este dato no se confirma explicitamente en la documentacion disponible. El tamano de 1.881.825.088 parametros situa al modelo en la categoria de modelos pequenos, comparable en escala a la serie Qwen 1.5B.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La presencia de un suplemento `mmproj` en el repositorio GGUF indica que el modelo base incorpora un proyector multimodal, lo que sugiere capacidades de vision, aunque no se detalla el codificador visual utilizado. El proceso de cuantizacion lo realizo mradermacher con su herramienta habitual, generando cuantizaciones estaticas; el autor indica que las cuantizaciones ponderadas/imatrix estan disponibles en un repositorio separado (`LiarAI-i1-GGUF`).

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` y la pipeline `text-generation`.
- Capacidades de agente: el modelo esta etiquetado como `agent`, lo que sugiere soporte para flujos de razonamiento multi-paso y uso de herramientas, aunque no se detalla el mecanismo exacto.
- Capacidades multimodales: la presencia de ficheros `mmproj` indica soporte de entrada de imagenes (vision), sin mas detalles sobre resolucion o tareas soportadas.
- Idiomas: unicamente ingles declarado; no se garantiza soporte de castellano ni de otros idiomas.
- Tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Modo thinking: no disponible.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: con cuantizaciones de 1,1 a 1,5 GB (Q2_K a Q5_K_M), el modelo puede ejecutarse en portatiles con GPU integrada o CPU, lo que permite iterar sobre prompts y flujos conversacionales sin infraestructura dedicada.
- Despliegue en el borde (edge computing): el formato GGUF y el reducido tamano permiten ejecutar el modelo en dispositivos con poca memoria, como mini-PC o Raspberry Pi de gama alta, para tareas de clasificacion o generacion de texto breve.
- Agentes locales con privacidad de datos: al ejecutarse en local mediante llama.cpp u Ollama, el modelo es adecuado para pipelines de agentes que no pueden enviar datos a la nube, siempre que las tareas se limiten al ingles.
- Experimentacion con modelos multimodales pequenos: los ficheros `mmproj` permiten probar flujos de vision-lenguaje en hardware consumer, por ejemplo para descripcion de imagenes o respuesta a preguntas visuales simples.
- Fine-tuning y destilacion: al estar bajo Apache 2.0 y ser un modelo pequeno, puede servir como base para experimentos de ajuste fino o como modelo alumno en destilacion desde modelos mayores.
- Educacion e investigacion: util para estudiar el comportamiento de modelos derivados de Qwen 3.5 a escala reducida, comparar efectos de cuantizacion (Q2_K frente a Q8_0) o evaluar degradacion de calidad en distintos niveles de compresion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1-1,5 GB con cuantizaciones Q2_K a Q5_K_M; unos 2,1 GB con Q8_0; unos 3,9 GB con f16. Los suplementos mmproj anaden 0,5 GB (Q8_0) o 0,8 GB (f16) si se usa la entrada multimodal.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM puede ejecutar las cuantizaciones mas bajas; una RTX 3060, RTX 4060 o superior permite cargar Q8_0 o f16 con holgura. Para despliegue en servidor, A100 o H100 no son necesarias dado el tamano del modelo.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers con aceleracion CUDA.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dado el tamano, se espera una latencia baja en GPU consumer, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LiarAI (este) | 1,88 B | no disponible | Apache 2.0 | GGUF, safetensors | Etiquetado como agente y multimodal (mmproj) |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Referencia de la familia Qwen; contexto y benchmarks publicos |
| Llama 3.2 1B Instruct | 1,24 B | 128.000 tokens (segun documentacion publica de Meta) | Llama 3.2 Community License | safetensors, GGUF | Requiere aceptar licencia de Meta; no Apache 2.0 |
| SmolLM2-1.7B-Instruct | 1,71 B | 8.192 tokens (segun documentacion publica de Hugging Face) | Apache 2.0 | safetensors, GGUF | Alternativa pequena con licencia permisiva |

Nota: los datos de contexto y parametros de los modelos comparados provienen de su documentacion publica habitual; para LiarAI no se dispone de contexto ni benchmarks, por lo que la comparacion cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- Informacion incompleta: la model card no documenta arquitectura, contexto, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad frente a alternativas.
- Solo ingles: el modelo declara unicamente el idioma `en`; no se garantiza un rendimiento aceptable en castellano ni en otros idiomas.
- Riesgo de alucinacion: como todo modelo generativo de escala reducida, es propenso a inventar datos, especialmente en tareas factuales o de razonamiento complejo.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar presumiblemente de Qwen 3.5, puede heredar sesgos de los datos de entrenamiento de esa familia, sin que se haya publicado analisis alguno.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base `meromorphic/LiarAI` mantiene la misma licencia y que no impone restricciones adicionales.
- Trazabilidad: el nombre "LiarAI" y la ausencia de documentacion sobre el autor del modelo base generan incertidumbre sobre la procedencia y el proceso de entrenamiento; para produccion se recomienda validar el comportamiento con un conjunto de pruebas propio.
- Cuantizaciones agresivas: Q2_K y Q3_K_S pueden degradar notablemente la calidad; para uso serio se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LiarAI-GGUF
- Modelo base: https://huggingface.co/meromorphic/LiarAI
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/LiarAI-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#LiarAI-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
