# schwyzquants/Inkling

## Resumen

Inkling es un modelo multimodal de propósito general desarrollado por Thinking Machines (el repositorio analizado, `schwyzquants/Inkling`, es una réplica del original `thinkingmachines/Inkling`). Acepta entradas de texto, imagen y audio, y genera exclusivamente texto. Está pensado para desarrolladores que construyen aplicaciones con agentes, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG), y se publica con pesos abiertos para permitir investigación, ajuste fino e integración en productos de terceros.

Técnicamente es un transformer autoregresivo decoder-only de 66 capas con una columna vertebral de mezcla de expertos (MoE) dispersa: cada token se enruta a 6 de 256 expertos, más 2 expertos compartidos activos en todos los tokens. La atención combina capas locales y globales. La multimodalidad es nativa: las imágenes y el vídeo se codifican mediante un encoder jerárquico de parches y el audio mediante codificación de tokens discretos, proyectándose todas las modalidades a un espacio oculto compartido que procesa el decodificador de forma conjunta.

El dato de parámetros presenta una discrepancia entre fuentes: la model card declara 975 000 millones de parámetros totales y 41 000 millones activos, mientras que el recuento real de los ficheros safetensors del repositorio arroja 952 377 623 626 parámetros (unos 952 000 millones). Su relevancia actual radica en que compite con modelos abiertos de frontera como Nemotron 3 Ultra, Kimi K2.5/K2.6, GLM 5.2 y DeepSeek V4 Pro en tareas de razonamiento y codificación agéntica, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo decoder-only de 66 capas con MoE disperso (6 de 256 expertos por token + 2 expertos compartidos) y atención híbrida local/global |
| Parametros totales | 975 000 millones segun la model card; 952 377 623 626 segun el recuento real de safetensors |
| Parametros activos | 41 000 millones |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y NVFP4 |
| Idiomas soportados | Inglés, con capacidades multilingües generales en otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`); tamano del repositorio 1904.8 GB |

Otros datos de entrada y salida:

| Parametro | Valor |
|---|---|
| Modalidades de entrada | Texto en UTF-8, imagen en cualquier formato basado en píxeles (idealmente entre 40 px y 4096 px por dimensión), audio en WAV a 16 kHz (idealmente menos de 20 minutos) |
| Modalidades de salida | Texto en UTF-8 |
| Pipeline declarado | image-text-to-text |
| Fecha de creacion del repositorio | 2026-09-14 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 66 capas con una columna vertebral de feed-forward de tipo Mixture-of-Experts disperso. El enrutamiento envía cada token a 6 de 256 expertos y activa además 2 expertos compartidos en todos los tokens, lo que da un ratio de activación de aproximadamente el 4,2 % de los parámetros totales (41 000 millones activos sobre 975 000 millones declarados). No se especifica el número de cabezas de atención, la dimensión oculta ni el mecanismo exacto de enrutamiento (top-k con aux loss, etc.). La atención es un híbrido de capas locales y globales, un patrón habitual para reducir el coste cuadrático en contextos largos manteniendo acceso global periódico.

La multimodalidad está integrada en el propio decodificador: las imágenes y el vídeo pasan por un encoder jerárquico de parches, el audio por codificación de tokens discretos, y todas las modalidades se proyectan a un espacio oculto compartido que el decodificador procesa conjuntamente. No se detalla si existe un adaptador específico por modalidad ni las dimensiones de los proyectores.

En cuanto al entrenamiento, la model card indica que los datos provienen de fuentes públicas, de terceros y de generación o aumento sintético, e incluyen texto, imágenes, audio y vídeo. El proceso de curación comprende limpieza, procesado y modificación de los conjuntos, con deduplicación y filtrado para eliminar datos de baja calidad y para objetivos de seguridad. No se publican el número total de tokens de entrenamiento, la composición porcentual del dataset, ni si se emplearon RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones como decodificación especulativa o atención linear. El único parámetro de inferencia mencionado es `effort=0.99`, el ajuste con el que se reportan las evaluaciones.

## Capacidades

- Generación de texto conversacional e instrucciones de propósito general.
- Razonamiento de múltiples pasos, con resultados destacados en HLE, AIME 2026 y GPQA Diamond.
- Codificación y tareas agénticas de ingeniería de software (SWEBench Verified y SWEBench Pro Public).
- Comprensión de imágenes: la entrada admite cualquier formato basado en píxeles, con resolución recomendada entre 40 px y 4096 px por dimensión.
- Comprensión de audio: entrada en WAV a 16 kHz, con duración recomendada inferior a 20 minutos.
- Comprensión de vídeo, ya que el encoder de parches jerárquico se describe como aplicable a imágenes y vídeo, y el entrenamiento incluye datos de vídeo.
- Soporte de uso con herramientas (tool calling), evidenciado por la métrica HLE with tools y por su uso previsto en sistemas agénticos.
- Multilingüismo general más allá del inglés, aunque el modelo está pensado principalmente para inglés.
- Soporte de múltiples lenguajes de programación.
- Salida limitada a texto en UTF-8: no genera imagen ni audio.

## Casos de uso

- Asistentes de codificación en producción: el modelo obtiene un 77,6 % en SWEBench Verified, por lo que puede integrarse en pipelines de revisión de pull requests, generación de parches y resolución de incidencias con contexto de repositorio.
- Agentes de ingeniería de software de múltiples pasos: con 54,3 % en SWEBench Pro Public y soporte de herramientas, es adecuado para orquestar tareas largas que requieren editar varios ficheros, ejecutar tests e iterar.
- Atención al cliente automatizada multimodal: puede gestionar conversaciones multi-turno donde el usuario adjunta capturas de pantalla o notas de voz, ya que acepta imagen y audio como entrada además de texto.
- Análisis de documentos con imágenes y audio: extracción y resumen de información a partir de capturas, diagramas o grabaciones de reuniones (audio WAV 16 kHz), todo ello procesado por el mismo decodificador.
- Sistemas RAG sobre corpus técnicos: su entrenamiento incluye repositorios públicos y el modelo está declarado como apto para RAG, lo que permite combinarlo con índices vectoriales para responder consultas sobre documentación interna.
- Razonamiento científico y matemático asistido por herramientas: con 46,0 % en HLE with tools y 97,1 % en AIME 2026, es utilizable en entornos de investigación que combinan el modelo con calculadoras simbólicas, buscadores o intérpretes de código.
- Asistentes de accesibilidad: transcripción y resumen de audio junto con descripción de imágenes en un único modelo, simplificando arquitecturas que hoy requieren varios componentes.
- Ajuste fino para dominios verticales: la licencia Apache 2.0 y la disponibilidad de recetas para SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face facilitan el fine-tuning y el despliegue en infraestructura propia.
- Investigación sobre MoE y multimodalidad: al ser un MoE disperso de 975 000 millones de parámetros con 41 000 millones activos, es un objeto de estudio relevante para analizar enrutamiento de expertos y atención híbrida.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos con `effort=0.99` y comparaciones generadas el 14 de julio de 2026. Los valores de la última fila para GPT 5.6 Sol aparecen truncados en el material disponible.

| Categoria | Benchmark | Inkling | Nemotron 3 Ultra | Kimi K2.5 | Kimi K2.6 | GLM 5.2 | DeepSeek V4 Pro | Gemini 3.1 Pro (high) | Claude Fable 5 (max) | GPT 5.6 Sol (xhigh) |
|---|---|---|---|---|---|---|---|---|---|---|
| Razonamiento | HLE (solo texto) | 29,7 % | 26,6 % | 29,4 % | 35,9 % | 40,1 % | 35,9 % | 44,7 % | 53,3 % | 47,2 % |
| Razonamiento | HLE (con herramientas) | 46,0 % | 37,4 % | 50,2 % | 54,0 % | 54,7 % | 48,2 % | 51,4 % | 64,5 % | 55,0 % |
| Razonamiento | AIME 2026 | 97,1 % | 94,2 % | 95,8 % | 96,4 % | 99,2 % | 96,7 % | 98,3 % | – | 99,9 % |
| Razonamiento | GPQA Diamond | 87,2 % | 86,7 % | 87,9 % | 91,1 % | 89,5 % | 88,8 % | 94,1 % | 92,6 % | 94,1 % |
| Agéntico (código) | SWEBench Verified | 77,6 % | 70,7 % | 76,8 % | 80,2 % | – | 80,6 % | 80,6 % | 95,0 % | – |
| Agéntico (código) | SWEBench Pro (Public) | 54,3 % | 46,4 % | 50,7 % | 58,6 % | 62,1 % | 55,4 % | 54,2 % | 80,0 % | dato truncado |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 1,9 TB solo para los pesos (975 000 millones de parámetros × 2 bytes), más memoria para caché KV y activaciones.
- VRAM estimada en NVFP4: aproximadamente 490-550 GB para los pesos, con overhead de runtime.
- GPU recomendadas: H100 de 80 GB en configuraciones multi-nodo; para BF16 harían falta del orden de 24-32 GPU H100 solo para alojar los pesos, y del orden de 7-8 GPU H100 para NVFP4. A100 de 80 GB también es viable, con más unidades necesarias.
- No cabe en GPU de consumo: ni en RTX 4090 (24 GB) ni en RTX 5090; el modelo completo excede cualquier configuración de una sola tarjeta orientada a consumidor. Cualquier ejecución local requeriría cuantizaciones muy agresivas no documentadas o particionado en disco con `mmap`, con latencias poco prácticas.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face Transformers, para los que la model card enlaza recetas específicas. También hay acceso vía API a través de proveedores de inferencia de terceros y del playground de Tinker.
- Latencia y throughput estimados: no disponibles.
- Los dos formatos numéricos soportados oficialmente son BF16 y NVFP4; no se documentan GGUF ni cuantizaciones de 8 o 4 bits de propósito general.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Resultado destacado | Disponibilidad |
|---|---|---|---|---|---|
| Inkling | 975 000 M totales, 41 000 M activos | no disponible | Apache 2.0 | SWEBench Verified 77,6 %; HLE texto 29,7 % | Pesos abiertos (BF16 y NVFP4) |
| Nemotron 3 Ultra | no disponible | no disponible | Pesos abiertos | SWEBench Verified 70,7 %; HLE texto 26,6 % | Pesos abiertos |
| Kimi K2.6 | no disponible | no disponible | Pesos abiertos | SWEBench Verified 80,2 %; HLE texto 35,9 % | Pesos abiertos |
| GLM 5.2 | no disponible | no disponible | Pesos abiertos | HLE texto 40,1 %; AIME 2026 99,2 % | Pesos abiertos |
| DeepSeek V4 Pro | no disponible | no disponible | Pesos abiertos | SWEBench Verified 80,6 % | Pesos abiertos |
| Gemini 3.1 Pro (high) | no disponible | no disponible | Propietaria | HLE texto 44,7 %; SWEBench Verified 80,6 % | Solo API |
| Claude Fable 5 (max) | no disponible | no disponible | Propietaria | SWEBench Verified 95,0 %; HLE con herramientas 64,5 % | Solo API |
| GPT 5.6 Sol (xhigh) | no disponible | no disponible | Propietaria | AIME 2026 99,9 %; GPQA Diamond 94,1 % | Solo API |

Los recuentos de parámetros y las ventanas de contexto de los modelos comparados no figuran en la información proporcionada, por lo que se marcan como no disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: no se documenta ningún análisis de sesgos demográficos, culturales o lingüísticos. El entrenamiento se basa en datos de internet y de terceros, por lo que es previsible que arrastre los sesgos de esas fuentes.
- Riesgo de alucinación: como todo modelo generativo autoregresivo, puede producir afirmaciones falsas con apariencia de verosimilitud. Los resultados en HLE de solo texto (29,7 %) indican una tasa de error considerable en razonamiento de conocimiento avanzado.
- Cobertura idiomática: el modelo está declarado como orientado al inglés, con capacidades multilingües «generales». No se especifica la lista de idiomas soportados ni su calidad relativa.
- Límites de contexto: la longitud máxima de contexto no se publica, lo que impide planificar aplicaciones con documentos largos o conversaciones extensas sin una evaluación empírica previa.
- Restricciones de entrada: las imágenes funcionan mejor entre 40 px y 4096 px por dimensión, y el audio se limita a WAV a 16 kHz de menos de 20 minutos. Salirse de esos rangos puede degradar la calidad.
- Restricciones de licencia: la licencia es Apache 2.0, que permite uso comercial sin regalías, pero el autor publica además una «Acceptable Use Policy» enlazada desde la model card que puede imponer condiciones adicionales de uso aceptable; conviene revisarla antes de un despliegue en producción.
- Coste de infraestructura: el repositorio ocupa 1904,8 GB y los pesos en BF16 rondan los 1,9 TB, lo que descarta el despliegue en una sola GPU y obliga a clústeres multi-nodo.
- Discrepancia en el recuento de parámetros: la model card declara 975 000 millones y el recuento real de safetensors 952 377 623 626. Conviene verificar la cifra oficial antes de dimensionar infraestructura.
- Repositorio espejo: el identificador evaluado (`schwyzquants/Inkling`) no coincide con el repositorio de referencia (`thinkingmachines/Inkling`), lo que introduce incertidumbre sobre si el contenido replica exactamente el modelo original. Tiene 0 descargas y 0 likes en el momento de la consulta.
- Trazabilidad de datos: no se publican la composición del dataset de entrenamiento ni los detalles de alineación (RLHF, DPO), lo que dificulta auditar el origen del conocimiento del modelo.
- Incompletitud de los benchmarks: los resultados publicados se limitan a razonamiento y código agéntico; no hay MMLU, ni evaluaciones de seguridad, ni métricas multimodales específicas.
- Aviso sobre la información de benchmarks: los modelos comparados incluyen versiones muy recientes, y el material disponible está truncado en la última fila (SWEBench Pro de GPT 5.6 Sol), por lo que la tabla no está completa.

## Enlaces

- Hugging Face (repositorio evaluado): https://huggingface.co/schwyzquants/Inkling
- Modelo de referencia (BF16): https://huggingface.co/thinkingmachines/Inkling
- Versión NVFP4: https://huggingface.co/thinkingmachines/Inkling-NVFP4
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (GitHub): https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Receta de Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de Hugging Face: https://hf.co/blog/thinkingmachines-inkling
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante al modelo; los resultados devueltos corresponden a una empresa de decoración de interiores en Sélestat (Francia) y no guardan relación con esta ficha.
