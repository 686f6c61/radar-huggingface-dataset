# ghostkaali/ghost-coder-v3

## Resumen

ghost-coder-v3 es un modelo de lenguaje conversacional especializado en código, publicado por el usuario ghostkaali en HuggingFace. Se trata de un ajuste fino (finetune) del modelo base Qwen2.5-Coder-7B-Instruct, según se desprende del nombre del archivo GGUF incluido en el repositorio, y ha sido entrenado y convertido a formato GGUF mediante la librería Unsloth. El repositorio pesa 5,3 GB y contiene una única cuantización Q4_K_M, además de un Modelfile para Ollama.

El modelo cuenta con 7.615.616.512 parámetros totales (aproximadamente 7,6 mil millones), confirmados mediante los pesos en safetensors, lo que lo sitúa en la gama de modelos compactos aptos para inferencia en hardware de consumo. La model card es extremadamente escueta: no especifica licencia, idiomas soportados, pipeline, composición del dataset de entrenamiento ni resultados de evaluación. El autor tampoco documenta la naturaleza del ajuste (instrucciones, RLHF, DPO) ni la fecha de entrenamiento del modelo base.

Por su relevancia, se trata de un modelo con nula tracción en la plataforma (0 descargas y 0 me gusta en el momento de la consulta) y con una documentación insuficiente para uso en producción sin una evaluación previa por parte del equipo adoptante. Su interés principal radica en ser un ejemplo de flujo de trabajo Unsloth + llama.cpp + Ollama, más que en aportar capacidades diferenciales frente a su modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (derivada de Qwen2.5-Coder-7B-Instruct según el nombre del archivo GGUF; no confirmado explícitamente por el autor) |
| Parametros totales | 7.615.616.512 (7,6 B aproximadamente) |
| Parametros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | Q4_K_M (única incluida en el repositorio); el tag `safetensors` sugiere que existen pesos sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors y GGUF (llama.cpp) |
| Tamano del repositorio | 5,3 GB |
| Archivo GGUF incluido | `qwen2.5-coder-7b-instruct.Q4_K_M.gguf` |
| Compatibilidad | llama.cpp, Ollama (Modelfile incluido), endpoints compatibles |
| Pipeline declarado | No disponible |
| Fecha de creacion | 2026-09-19T20:37:23Z |
| Ultima actualizacion | 2026-09-19T20:53:32Z |
| Descargas | 0 |
| Me gusta | 0 |

## Arquitectura y entrenamiento

La información publicada no detalla la arquitectura interna más allá de los tags `qwen2` y `safetensors`. El nombre del archivo GGUF (`qwen2.5-coder-7b-instruct.Q4_K_M.gguf`) indica que el modelo base es Qwen2.5-Coder-7B-Instruct, un transformer decoder-only de 7,6 mil millones de parámetros entrenado por Alibaba Qwen. No obstante, el autor no confirma explícitamente esta correspondencia en la model card, por lo que debe tratarse como una inferencia razonable pero no verificada. Tampoco se documentan los detalles arquitectónicos específicos (número de capas, cabezas de atención, uso de GQA, tipo de activación o implementación de RoPE), que habría que consultar en la ficha del modelo base.

Respecto al entrenamiento, la model card solo indica que el modelo fue ajustado y convertido a GGUF con Unsloth, y que el entrenamiento fue "2 veces más rápido" gracias a dicha librería. No se especifica el número de tokens de entrenamiento, la composición del dataset, la técnica de alineación empleada (SFT, DPO, RLHF) ni los hiperparámetros utilizados. El tag `conversational` sugiere un ajuste orientado a diálogo, presumiblemente heredado del formato instruct del modelo base, pero no hay evidencia en el repositorio de un pipeline de evaluación o de un conjunto de validación documentado.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y la naturaleza instruct del modelo base apuntan a soporte de diálogo multi-turno.
- Generación y asistencia en código: el nombre del modelo (`ghost-coder-v3`) y el archivo base (`qwen2.5-coder-7b-instruct`) indican una orientación a tareas de programación, aunque no se aportan evaluaciones que lo confirmen.
- Plantillas de chat con soporte Jinja: la model card recomienda el flag `--jinja` en `llama-cli`, lo que implica plantillas de conversación compatibles con el motor de plantillas de llama.cpp.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede desplegarse detrás de APIs compatibles con el formato OpenAI.
- Capacidades multimodales: la model card menciona `llama-mtmd-cli` "para modelos multimodales", pero se trata de una indicación genérica de la plantilla de Unsloth; no hay ninguna evidencia de que este modelo procese imágenes o audio.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistente de programación en local: dado su tamaño de 7,6 B parámetros y su cuantización Q4_K_M (aproximadamente 4,7 GB), puede ejecutarse en un portátil con GPU de gama media o incluso en CPU para autocompletado y explicación de fragmentos de código sin enviar datos a servicios externos.
- Generación de tests unitarios: integrado en un flujo de CI/CD mediante llama.cpp u Ollama, permitiría generar borradores de pruebas para funciones existentes, siempre que se revise su salida por el riesgo de alucinación de APIs inexistentes.
- Refactorización asistida de código legacy: con una ventana de contexto presumiblemente amplia (heredada del modelo base, aunque no confirmada), puede recibir varios archivos y proponer cambios estructurales, sujeto a validación posterior con compilador y tests.
- Documentación automática de repositorios: generación de docstrings y ficheros README a partir del código fuente, con revisión humana obligatoria dado que no hay métricas publicadas de fidelidad.
- Chatbot técnico interno: despliegue mediante Ollama con el Modelfile incluido para responder preguntas de un equipo sobre convenciones internas, previa evaluación de la licencia (no declarada) y de su comportamiento en el idioma objetivo.
- Prototipado rápido de agentes: gracias a la compatibilidad con endpoints estilo OpenAI y con llama.cpp, puede actuar como motor de generación en pipelines experimentales de agentes, asumiendo que el soporte de function calling no está verificado.
- Evaluación comparativa de flujos Unsloth: como artefacto de referencia para equipos que quieran reproducir el pipeline de ajuste y cuantización de Unsloth sobre un modelo Qwen2.5-Coder.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor no incluye métricas de MMLU, HumanEval, GSM8K, MBPP ni de ningún otro conjunto de evaluación, ni comparaciones con el modelo base o con alternativas. Tampoco se documenta el proceso de evaluación ni se enlaza a ninguna evaluación externa. Cualquier cifra que se atribuya a este modelo sería especulativa y no debe utilizarse para tomar decisiones de adopción.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamaño de parámetros (7,6 B) y del archivo GGUF incluido, no datos publicados por el autor:

- VRAM estimada para inferencia: aproximadamente 4,5-5,5 GB con cuantización Q4_K_M; en torno a 8-9 GB con Q8_0; y cerca de 15-16 GB en FP16/BF16.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 para uso en consumer; A10G, L4, A100 o H100 en entornos de servidor (notablemente sobredimensionadas para este tamaño).
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en GPUs con 8 GB o más de VRAM en Q4_K_M, y en 6 GB con cuantizaciones más agresivas (Q3/Q4 pequeñas) a costa de calidad.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`), Ollama mediante el Modelfile incluido, y cualquier runtime compatible con GGUF. No hay evidencia de que se hayan publicado pesos en formatos para vLLM o TGI, aunque el tag `safetensors` sugiere que los pesos originales están en el repositorio y podrían convertirse.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

La tabla compara el modelo con alternativas de tamaño comparable del ámbito del código. Los datos de los modelos de referencia corresponden a información pública ampliamente conocida; los de ghost-coder-v3 provienen únicamente del repositorio analizado.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| ghost-coder-v3 | 7,6 B | No disponible | No disponible | HuggingFace (GGUF Q4_K_M) | No |
| Qwen2.5-Coder-7B-Instruct (modelo base probable) | 7,6 B | 32.768 tokens (ampliable con YaRN), según documentación pública del modelo base | Apache 2.0 (según documentación pública del modelo base) | HuggingFace, Ollama, múltiples cuantizaciones | Sí, en la ficha oficial del modelo base |
| DeepSeek-Coder-6.7B-Instruct | 6,7 B | 16.384 tokens | Licencia propia de DeepSeek | HuggingFace | Sí |
| CodeLlama-7B-Instruct | 6,7 B | 16.384 tokens | Licencia comunitaria de Llama 2 | HuggingFace | Sí |

Nota: la fila del modelo base se incluye como referencia orientativa, ya que el autor no confirma la correspondencia. Las licencias y contextos de los modelos comparados deben verificarse en sus fichas oficiales antes de cualquier uso comercial.

## Limitaciones y advertencias

- Licencia no declarada: la ausencia de licencia impide determinar si el uso comercial está permitido. Adoptar el modelo en producción sin aclarar este punto supone un riesgo legal directo, agravado porque el modelo base probable (Qwen2.5-Coder-7B-Instruct) se distribuye bajo Apache 2.0, pero un finetune puede estar sujeto a condiciones adicionales.
- Ausencia total de evaluaciones: no hay benchmarks, ni evaluación humana, ni conjunto de validación documentado. No es posible estimar la degradación introducida por el ajuste respecto al modelo base.
- Riesgo de alucinación: sin datos de evaluación, debe asumirse un riesgo estándar en modelos de 7 B, especialmente en la generación de APIs, funciones de librerías y fragmentos de código que pueden compilar pero ser incorrectos.
- Idiomas no declarados: se desconoce si el ajuste conserva las capacidades multilingües del modelo base o las ha degradado. El castellano no está confirmado como idioma soportado.
- Dataset de entrenamiento desconocido: no se especifica la procedencia de los datos, lo que impide evaluar sesgos, contaminación de benchmarks o problemas de derechos de autor en el material de entrenamiento.
- Contexto no confirmado: aunque el modelo base soporta ventanas amplias, el ajuste o la cuantización podrían haber modificado este parámetro; no hay confirmación del autor.
- Tracción nula: 0 descargas y 0 me gusta en el momento de la consulta implican que no existe una comunidad que haya validado el modelo, reportado fallos o contribuido mejoras.
- Repositorio con una sola cuantización: únicamente se ofrece Q4_K_M, lo que limita el ajuste de la relación calidad/recursos según el hardware disponible.
- Fases de desarrollo inciertas: las fechas de creación y actualización son futuras respecto a la fecha habitual de publicación (2026), lo que puede indicar un error de metadatos del autor; conviene verificar el estado real del repositorio.
- Recomendación general: tratar este modelo como un experimento reproducible del pipeline Unsloth y no como un componente listo para producción sin una evaluación interna previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ghostkaali/ghost-coder-v3
- Repositorio de Unsloth (citado en la model card): https://github.com/unslothai/unsloth
- llama.cpp (compatibilidad declarada mediante los tags y el Modelfile): https://github.com/ggerganov/llama.cpp
- Ollama (Modelfile incluido según la model card): https://ollama.com

Nota sobre la busqueda web: los resultados recuperados corresponden a dominios de la empresa ClubCorp (formularios de eventos, condiciones de membresía y aplicaciones internas) y no guardan ninguna relación con el modelo ghost-coder-v3. No se ha encontrado ninguna referencia relevante al modelo, a su autor, a un paper asociado ni a una demo pública en los resultados disponibles.
