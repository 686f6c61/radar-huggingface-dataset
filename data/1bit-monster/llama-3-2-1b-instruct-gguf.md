# 1bit-MONSTER/Llama-3.2-1B-Instruct-GGUF

## Resumen

`1bit-MONSTER/Llama-3.2-1B-Instruct-GGUF` es un re-host del cuantizado GGUF Q4_K_M de `meta-llama/Llama-3.2-1B-Instruct` publicado originalmente por bartowski. No es un entrenamiento nuevo ni un fine-tuning: se trata del mismo conjunto de pesos del modelo instructivo de 1,24 B parámetros de Meta, convertido a 4 bits y redistribuido con métricas de rendimiento medidas para el motor de inferencia [1bit engine](https://github.com/1bit-MONSTER/engine) sobre hardware Strix Halo con backend Vulkan. El repositorio contiene un único fichero, `Llama-3.2-1B-Instruct-Q4_K_M.gguf`, y ocupa 0,8 GB.

El modelo resuelve un problema muy concreto: disponer de un checkpoint conversacional de muy bajo coste computacional que quepa en iGPU y NPUs de portátiles y mini-PC, con cifras de rendimiento publicadas sobre una plataforma concreta (Strix Halo). Las métricas declaradas son 8.052 tok/s de prefill (pp512) y 223 tok/s de generación (tg128), lo que lo sitúa en el rango de modelos de 1-2 B pensados para ejecución local.

Su relevancia es principalmente como artefacto de despliegue, no como modelo de frontera: sirve para validar el motor 1bit, para prototipado rápido en local y para tareas de clasificación, resumen o extracción con requisitos de latencia muy bajos. La información disponible no incluye datos de entrenamiento, idiomas declarados ni evaluaciones de calidad propias de este cuantizado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del modelo base; sin detalle adicional en la información proporcionada) |
| Parámetros totales | 1.235.814.432 (1,24 B, dato de safetensors del modelo base) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la información proporcionada; el modelo base Llama 3.2 1B Instruct declara 128.000 tokens según la documentación de Meta |
| Tipos de cuantización | Q4_K_M (único fichero publicado en este repositorio) |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Llama 3.2 Community License (se exige atribución "Built with Llama" y licencia separada si se superan 700 millones de usuarios activos mensuales) |
| Formato de pesos | GGUF (fichero único `Llama-3.2-1B-Instruct-Q4_K_M.gguf`) |
| Tamaño del repositorio | 0,8 GB |
| Modelo base | meta-llama/Llama-3.2-1B-Instruct |
| Cuantizador original | bartowski |
| Motor de referencia | 1bit engine (`1bit serve`, backend Vulkan) |
| Fecha de creación del repo | 26/09/2026 según metadatos de HuggingFace |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura interna más allá de lo que se deduce del modelo base: un transformer decoder-only denso de Meta, del que este repositorio solo redistribuye una versión cuantizada. Q4_K_M es una cuantización de 4 bits de la familia K-quant, que asigna mayor precisión a determinadas matrices de pesos y menos al resto, con el objetivo de reducir el tamaño del fichero manteniendo la perplejidad dentro de un margen aceptable. Este proceso no reentrena el modelo: no hay ajuste por RLHF, DPO ni SFT adicional respecto al checkpoint instructivo original, y cualquier alineación presente procede de Meta.

Tampoco se documentan en esta ficha el número de tokens de entrenamiento, la composición del dataset ni el corte de conocimiento del modelo base, por lo que se marcan como no disponibles. La innovación técnica destacable del repositorio no está en el modelo, sino en el empaquetado: se publican métricas medidas de prefill y decodificación sobre Strix Halo con Vulkan, algo poco habitual en re-hosts de GGUF, y se documenta el comando exacto de ejecución con el motor 1bit (`1bit serve -m <fichero> --device vulkan`).

## Capacidades

- Generación de texto conversacional en formato instructivo, con plantilla de chat propia de Llama 3.2.
- Razonamiento básico y respuesta a instrucciones de una o varias vueltas.
- Generación y explicación de fragmentos de código sencillos, limitada por el tamaño del modelo (1,24 B).
- Aritmética y problemas matemáticos de un solo paso; el razonamiento multi-paso es poco fiable a esta escala.
- Soporte de tool calling / function calling heredado de la familia Llama 3.2 Instruct, según la documentación de Meta para el modelo base.
- Uso como componente dentro de agentes simples y cadenas de varios pasos, siempre con verificación externa.
- Capacidades multilingües: no declaradas en la información proporcionada para este repositorio.
- Modo "thinking", visión o audio: no disponibles; el modelo base es solo texto.
- Ejecución compatible con endpoints (etiqueta `endpoints_compatible` en HuggingFace).
- Cuantización con `imatrix` presente entre las etiquetas del repositorio.

## Casos de uso

- **Asistente local en portátil o mini-PC**: con 0,8 GB de fichero y ~223 tok/s de generación medidos en Strix Halo, puede ejecutarse de forma permanente en segundo plano sin GPU dedicada, para resúmenes rápidos o reescritura de texto.
- **Clasificación y enrutado de consultas**: uso del modelo como clasificador zero-shot o few-shot (categoría de ticket, intención, idioma) donde la latencia importa más que la precisión absoluta.
- **Extracción de campos estructurados**: convertir correos o notas en JSON con esquemas simples, apoyándose en el soporte de tool calling del modelo base y validando la salida con un parser.
- **Preprocesado en pipelines RAG**: reescritura de consultas, generación de palabras clave y filtrado previo antes de llamar a un modelo mayor, reduciendo coste por consulta.
- **Prototipado y pruebas de integración**: banco de pruebas para validar el motor 1bit, backends Vulkan o integraciones tipo llama.cpp/Ollama antes de pasar a modelos de 7-8 B.
- **Generación de texto de relleno y plantillas**: descripciones de producto, respuestas FAQ o textos de formulario con revisión humana obligatoria.
- **Educación y demos offline**: entornos sin conectividad o con requisitos de privacidad estrictos, donde el texto nunca sale de la máquina.
- **Anotación asistida de datasets**: preetiquetado masivo de corpus de texto con coste prácticamente nulo por muestra, seguido de revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas disponibles son de velocidad de inferencia sobre Strix Halo con backend Vulkan:

| Métrica | Valor | Condiciones |
|---|---|---|
| pp512 (prefill) | 8.052 tok/s | Strix Halo, Vulkan, Q4_K_M |
| tg128 (generación) | 223 tok/s | Strix Halo, Vulkan, Q4_K_M |

No hay comparación publicada contra otros cuantizados del mismo modelo ni contra modelos alternativos en las mismas condiciones de hardware.

## Requisitos de hardware

- **Tamaño en disco**: 0,8 GB para el fichero Q4_K_M.
- **VRAM estimada para inferencia**: aproximadamente 1-2 GB con contexto moderado en Q4_K_M (estimación a partir del tamaño del fichero; no publicada en la información disponible). En F16 serían ~2,5 GB solo de pesos (1,24 B × 2 bytes).
- **GPU recomendadas**: cualquier GPU con ≥2 GB de VRAM; cabe en RTX 3050/3060/4060/4090, en iGPU AMD (Strix Halo, Radeon 780M y superiores) y en Apple Silicon.
- **Ejecución en CPU**: viable en CPU moderna sin GPU; es uno de los pocos modelos que puede ejecutarse razonablemente en placas tipo Raspberry Pi 5 o mini-PC de bajo consumo.
- **Opciones de despliegue**: 1bit engine (Vulkan, plataforma de referencia), llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con endpoints GGUF. vLLM y TGI tienen soporte parcial de GGUF y no son la vía recomendada para este formato.
- **Latencia y throughput**: 8.052 tok/s de prefill y 223 tok/s de decodificación en Strix Halo con Vulkan (datos medidos por el autor). No hay cifras publicadas para otras GPUs.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Llama-3.2-1B-Instruct-GGUF (este repo) | 1,24 B | 128.000 tokens (modelo base, según Meta) | Llama 3.2 Community | GGUF Q4_K_M | Re-host con métricas de velocidad medidas |
| Llama-3.2-1B-Instruct (bartowski GGUF) | 1,24 B | 128.000 tokens (modelo base) | Llama 3.2 Community | GGUF en múltiples cuantizaciones | Origen del fichero re-alojado; más opciones de cuantización |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Licencia permisiva, buen rendimiento en código y matemáticas a esta escala |
| Gemma 2 2B-it | 2,61 B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF | Más parámetros y mejor calidad general, licencia con restricciones de uso |
| SmolLM2-1.7B-Instruct | 1,71 B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Alternativa abierta entrenada explícitamente para tamaño pequeño |

Los datos de contexto y licencia de los modelos comparados proceden de la documentación pública de cada proyecto y no se han verificado en esta ficha. No hay comparaciones de rendimiento publicadas entre este cuantizado y las alternativas en el mismo hardware.

## Limitaciones y advertencias

- **Escala muy reducida**: con 1,24 B parámetros, la tasa de alucinación es alta y el razonamiento multi-paso, las matemáticas y la escritura de código complejo son poco fiables. No debe usarse sin verificación en flujos críticos.
- **Cuantización Q4_K_M**: introduce una pérdida de calidad adicional respecto al checkpoint en precisión completa. No se han publicado evaluaciones que cuantifiquen esa degradación.
- **El nombre del repositorio induce a error**: "1bit-MONSTER" es el nombre del autor y del motor, no el tipo de cuantización. El fichero es Q4_K_M (4 bits), no 1 bit.
- **Licencia**: Llama 3.2 Community License. Requiere mantener la atribución "Built with Llama", incluir copia de la licencia y solicitar una licencia aparte a Meta si el producto supera los 700 millones de usuarios activos mensuales. Incluye además las restricciones habituales de la licencia Llama sobre usos prohibidos.
- **Idiomas no declarados**: la model card de este repositorio no especifica idiomas soportados; el rendimiento fuera del inglés no está documentado para esta copia.
- **Sin validación comunitaria**: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de verificación independiente de la integridad del fichero o del rendimiento declarado.
- **Fecha de creación anómala**: los metadatos indican 26/09/2026, una fecha futura; conviene tratar los metadatos temporales del repositorio con cautela.
- **Métricas de rendimiento muy contextuales**: los 8.052 tok/s de prefill y 223 tok/s de generación corresponden a Strix Halo con Vulkan. No son extrapolables a otras GPUs, backends ni longitudes de contexto.
- **Atribución de la cuantización**: el trabajo de cuantización es de bartowski; este repositorio solo lo re-aloja. Los posibles problemas del fichero original se heredan tal cual.
- **Producción**: para cargas con concurrencia alta, este formato y tamaño no están pensados para servidores con batching continuo; para eso conviene un checkpoint en safetensors servido con vLLM o TGI.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/1bit-MONSTER/Llama-3.2-1B-Instruct-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Licencia del modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct/blob/main/LICENSE.txt
- Cuantizaciones originales de bartowski: https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF
- Motor 1bit engine: https://github.com/1bit-MONSTER/engine

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre el modelo (únicamente enlaces genéricos a YouTube), por lo que no se han podido añadir papers, blogs técnicos ni demos adicionales.
