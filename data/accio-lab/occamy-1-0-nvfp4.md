# Accio-Lab/occamy-1.0-NVFP4

## Resumen

Occamy 1.0 NVFP4 es una cuantización de precisión mixta del modelo multimodal Accio-Lab/occamy-1.0, publicada por Accio-Lab. El checkpoint aplica NVFP4 (4 bits) únicamente a los expertos enrutados de la arquitectura Mixture-of-Experts, mientras que la atención, los routers, los expertos compartidos, los embeddings, la cabeza de salida y los pesos de visión se mantienen en BF16. El objetivo es reducir la huella de memoria y el ancho de banda de pesos en inferencia sin tocar el tokenizador ni la plantilla de chat originales.

El repositorio declara 19.001.054.576 parámetros en safetensors (unos 19.000 millones) y ocupa 24,0 GB. Según la model card, el modelo original deriva de Qwen3.6-35B-A3B y conserva la licencia Apache 2.0. El pipeline es image-text-to-text y el tag de arquitectura es qwen3_5_moe, de modo que acepta entradas de imagen y texto y genera texto.

Su interés es fundamentalmente práctico y reproducible: es una conversión NVFP4 realizada con NVIDIA Model Optimizer 0.44.0 que se publica junto con la receta de cuantización, la procedencia de los datos de calibración y una validación acotada ejecutada en SGLang. No es un modelo nuevo ni un ajuste fino: no se realizó entrenamiento de ningún tipo, solo la conversión de pesos del checkpoint BF16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal; tag `qwen3_5_moe`; la configuración de servicio validada habilita backend Mamba, lo que indica capas de estado (SSM) además de atención |
| Parametros totales | 19.001.054.576 (~19,0 B), dato de safetensors |
| Parametros activos | no disponible (arquitectura MoE; la nomenclatura del modelo base sugiere 3 B activos, sin confirmar) |
| Longitud de contexto | no disponible; la validación se ejecutó con 2048 tokens de contexto |
| Tipos de cuantizacion | NVFP4 (FP4 con escalas por bloque) en expertos enrutados; BF16 en atención, routers, expertos compartidos, embeddings, cabeza de salida y visión |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 24,0 GB) |
| Modelo base | Accio-Lab/occamy-1.0, revisión `c1ce84770260c4137712cf22115574c4d06b993a` |
| Herramienta de cuantizacion | NVIDIA Model Optimizer 0.44.0, configuración `NVFP4_EXPERTS_ONLY_CFG` |
| Pipeline / libreria | image-text-to-text / transformers |
| Runtime validado | SGLang 0.5.13.post1 (commit `85fd90072d1a9f2432842b03588f63b745e524e4`), FlashInfer 0.6.12, PyTorch 2.11.0+cu130 |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer con mezcla de expertos y capacidades multimodales (imagen-texto), etiquetado como `qwen3_5_moe`. La receta de cuantización es selectiva: solo los expertos enrutados pasan a NVFP4, con pesos y activaciones en ese formato, mientras que el resto de componentes críticos para la estabilidad numérica (atención, routers, expertos compartidos, embeddings, cabeza de salida y torre de visión) permanecen en BF16. La configuración de servicio probada habilita un backend Mamba específico, lo que apunta a capas de espacio de estados combinadas con atención, aunque la model card no detalla la proporción ni el diseño exacto de esas capas.

No hubo entrenamiento ni ajuste fino. La calibración se hizo con 128 registros del split de entrenamiento de CNN/DailyMail (configuración 3.0.0) truncados a 256 tokens, con 16 registros de test reservados. Para los pesos de expertos cuyos observadores no se activaron, ModelOpt recurrió a escalados derivados del peso o de tensores fusionados durante la exportación. El checkpoint no incluye cabeza MTP (multi-token prediction), por lo que no hay decodificación especulativa asociada. El tokenizador y la plantilla de chat originales se conservan íntegros.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `conversational` en el modelo base).
- Entrada multimodal imagen-texto: la validación incluye una prueba de reconocimiento de imagen sintética (imagen roja) superada en BF16 y NVFP4.
- Tool calling / function calling: la configuración probada usa el parser `qwen3_coder` y se validaron 2/2 fixtures de llamadas a herramienta, 2/2 llamadas estructuradas a través de API y ejecución local de una herramienta `add` con devolución del resultado al modelo.
- Salida en JSON estricto: 3/4 fixtures superados tanto en BF16 como en NVFP4.
- Generación de código: 2/2 muestras con tests independientes superados en ambos formatos.
- Modo de razonamiento (`enable_thinking`) con parser `qwen3`; la validación se realizó con el modo thinking desactivado.
- No se declaran ni verifican capacidades de audio, vídeo, contexto largo ni visión generalista: la propia model card indica explícitamente que no se hace ninguna afirmación amplia sobre esas áreas.

## Casos de uso

- Despliegue de inferencia con restricción de memoria: al cuantizar los expertos a 4 bits se reduce el ancho de banda de pesos en la parte dominante del modelo, lo que permite servir un MoE multimodal en GPUs con menos VRAM que la versión BF16 equivalente.
- Asistentes con herramientas en producción: el checkpoint está validado con el parser `qwen3_coder` y con ejecución local de una herramienta y realimentación del resultado, por lo que encaja en flujos de agente que necesitan invocar APIs o funciones y continuar la conversación.
- Extracción de datos estructurados: la validación de JSON estricto (3/4) lo hace utilizable para generar respuestas serializadas a partir de texto o imágenes en pipelines de ingestión de documentos.
- Generación y comprobación de código en CI/CD: al superar 2/2 pruebas con tests independientes, puede integrarse en tareas de autocompletado, generación de parches o revisión automatizada dentro de un runner.
- Análisis ligero de imágenes en atención al cliente: reconocimiento y clasificación de imágenes simples (capturas, etiquetas) combinado con respuesta en lenguaje natural, siempre dentro de los límites verificados y no como sistema de visión generalista.
- Prototipado de agentes multi-paso: la combinación de llamadas a herramienta estructuradas y seguimiento del resultado permite construir cadenas de razonamiento con acciones externas, con contexto de trabajo de 2048 tokens.
- Reproducción e investigación en cuantización: el repositorio incluye `quantization-recipe.json` y `data-provenance.json`, lo que lo convierte en una referencia práctica para estudiar el impacto de NVFP4 selectivo sobre expertos comparando BF16 y FP4 con la misma evaluación.
- Evaluación comparativa de degradación numérica: la NLL sobre tokens reservados (2,252837 en BF16 frente a 2,262056 en NVFP4) sirve como caso de estudio de la pérdida introducida por cuantizar solo los expertos enrutados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente incluye comprobaciones acotadas de regresión frente al checkpoint BF16, con contexto de 2048 tokens, decodificación greedy y `enable_thinking` desactivado:

| Comprobación | BF16 | NVFP4 |
|---|---:|---:|
| Peticiones de texto que terminan normalmente | 8/8 | 8/8 |
| Fixtures de JSON estricto | 3/4 | 3/4 |
| Fixtures de JSON de llamada a herramienta | 2/2 | 2/2 |
| Llamadas a herramienta estructuradas vía API | 2/2 | 2/2 |
| Ejecución local de herramienta `add` y seguimiento del resultado | True | True |
| Código generado con tests independientes | 2/2 | 2/2 |
| NLL sobre tokens reservados | 2,252837 | 2,262056 |
| Reconocimiento de imagen roja sintética | pass | pass |

Estos datos son comprobaciones de regresión con muestras muy pequeñas, no resultados de benchmark. No se aportan mediciones de throughput ni de latencia.

## Requisitos de hardware

- Almacenamiento: 24,0 GB de repositorio en disco.
- VRAM estimada: en torno a 24 GB solo para los pesos, dado que el repositorio ocupa 24,0 GB y una parte relevante de los tensores sigue en BF16; conviene reservar 32-48 GB para dejar margen a caché KV y activaciones. Estimación propia, no publicada por el autor.
- Ejecución nativa NVFP4: requiere hardware y kernels compatibles según la model card. El formato NVFP4 de NVIDIA está asociado a la generación Blackwell (B200/GB200 y familia RTX 50); en GPUs sin soporte nativo habría que recurrir a dequantización y no se aprovecharía el formato.
- Candidatas razonables: B200/GB200 para servidor, RTX 5090 (32 GB) para una estación de trabajo con margen ajustado. En arquitecturas anteriores la ruta `modelopt_fp4` de SGLang no está garantizada.
- Despliegue validado: SGLang 0.5.13.post1 con `--quantization modelopt_fp4 --dtype bfloat16 --moe-runner-backend flashinfer_cutlass --attention-backend triton --mamba-backend triton --mm-attention-backend sdpa --tool-call-parser qwen3_coder --reasoning-parser qwen3`, contexto 2048 y 4096 tokens totales.
- La librería declarada es transformers, por lo que existe una vía de carga alternativa, aunque no se documentan pruebas con ella.
- No se confirma soporte en vLLM, llama.cpp, Ollama ni TGI; el formato NVFP4 no es un GGUF y no hay conversiones publicadas en este repositorio.
- Latencia y throughput: no disponibles. La configuración probada usa `--max-running-requests 1` y desactiva CUDA graphs, radix cache y solapamiento de planificación, por lo que no representa un escenario de producción.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Accio-Lab/occamy-1.0 (BF16) | ~19 B (mismo repo base) | BF16 | no disponible | Apache 2.0 | HuggingFace |
| Accio-Lab/occamy-1.0-NVFP4 (este) | 19.001.054.576 | NVFP4 en expertos + BF16 en el resto | no disponible | Apache 2.0 | HuggingFace; requiere hardware y kernels compatibles con NVFP4 |
| Qwen3.6-35B-A3B (base declarado) | 35 B totales / 3 B activos según nomenclatura, sin verificar | BF16 | no disponible | Apache 2.0 según la model card | no disponible |
| Cuantización NVFP4 oficial de NVIDIA del Qwen original | no disponible | NVFP4 | no disponible | no disponible | mencionada en la model card, sin identificador ni enlace |

No se dispone de resultados de benchmarks comparativos entre estas variantes, por lo que la comparación se limita a parámetros, formato y disponibilidad. La model card aclara que este repositorio contiene pesos cuantizados de Occamy y no la cuantización NVFP4 publicada por separado por NVIDIA para el modelo Qwen original.

## Limitaciones y advertencias

- Calibración muy limitada: 128 registros de CNN/DailyMail truncados a 256 tokens. El propio autor advierte que este conjunto no garantiza cobertura de todos los expertos en todas las cargas de trabajo.
- Para los expertos cuyos observadores no se activaron, las escalas se derivaron del peso o de tensores fusionados, lo que puede introducir error adicional fuera de la distribución de calibración.
- No hay benchmarks generales publicados; las validaciones son regresiones con 8 y 4 muestras y no permiten extrapolar calidad global.
- Degradación numérica medida: la NLL sobre tokens reservados empeora de 2,252837 (BF16) a 2,262056 (NVFP4), una diferencia de aproximadamente 0,0041.
- Validación limitada a 2048 tokens de contexto; no hay ninguna afirmación verificada sobre contexto largo, y la longitud máxima soportada no está documentada.
- Sin cabeza MTP: no se puede usar decodificación especulativa con este checkpoint.
- El modo de razonamiento (`enable_thinking`) no fue evaluado; las pruebas se hicieron con thinking desactivado y decodificación greedy.
- Idiomas soportados sin documentar. No se puede asumir cobertura multilingüe aunque la ascendencia Qwen la haga plausible.
- Discrepancia a tener en cuenta: el modelo base se describe como Qwen3.6-35B-A3B, pero el recuento real de safetensors es de ~19 B parámetros. Conviene verificar el número de parámetros activos antes de dimensionar el hardware.
- Riesgo de alucinación inherente al modelo base, no medido en esta validación.
- Licencia Apache 2.0: permite uso comercial, pero exige conservar avisos de atribución y licencia. El repositorio incluye la licencia original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación independiente por parte de la comunidad.
- La configuración de servicio probada (una sola petición concurrente, sin CUDA graphs ni radix cache) no es representativa de un despliegue en producción y no aporta datos de rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Accio-Lab/occamy-1.0-NVFP4
- Modelo base: https://huggingface.co/Accio-Lab/occamy-1.0
- Dataset de calibración: https://huggingface.co/datasets/abisee/cnn_dailymail
- Herramienta de cuantización mencionada (NVIDIA Model Optimizer): https://github.com/NVIDIA/TensorRT-Model-Optimizer
- Runtime de servicio validado (SGLang): https://github.com/sgl-project/sglang
- Búsqueda web: los resultados obtenidos no guardan relación con el modelo (páginas genéricas de Quora); no se han encontrado papers, blogs, repos ni demos adicionales en la información disponible.
