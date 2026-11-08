# bartowski/HarpiaIA_Acaua-Lite-GGUF

## Resumen

HarpiaIA_Acaua-Lite-GGUF es la colección de cuantizaciones GGUF, generadas por bartowski, del modelo base HarpiaIA/Acaua-Lite, un modelo de lenguaje de aproximadamente 1.730 millones de parámetros (1,728.801.600 según los pesos safetensors del checkpoint original) orientado a generación de texto, código y flujos de agente. La model card lo etiqueta con las familias `lfm` y `lfm3`, lo que lo sitúa en la estirpe de los modelos Liquid Foundation Model, e incluye el soporte de un modo de razonamiento explícito mediante el bloque `<think>` en el formato de prompt.

El modelo está afinado sobre dos conjuntos de datos declarados: OrionLLM/OpenAgentInstruct, centrado en instrucciones para agentes, y Modotte/CodeX-7M-Non-Thinking, orientado a código. Esta combinación sugiere un entrenamiento dirigido a tareas de generación de código y a la ejecución de instrucciones con llamadas a herramientas, más que a un uso conversacional generalista. El autor del checkpoint base es HarpiaIA y la licencia aplicada es `lfm1.0` (etiquetada como "other" en los metadatos de Hugging Face).

La relevancia de esta ficha radica en que bartowski ha publicado un espectro amplio de cuantizaciones (desde bf16 de 3,47 GB hasta IQ3_XS de 0,81 GB), lo que permite ejecutar el modelo en hardware muy modesto, incluidos equipos de consumo sin GPU dedicada. No obstante, la información pública disponible sobre el modelo base es escasa: no se detallan la longitud de contexto, la composición exacta del dataset ni resultados de benchmarks, por lo que varios apartados de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM/LFM3, segun tags de la model card); detalles internos no disponibles |
| Parametros totales | 1.728.801.600 (~1,73B) segun safetensors; la model card indica "2B (source checkpoint)" |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_0, Q4_K_S, IQ4_XS, IQ3_M, Q3_K_L, Q3_K_M, IQ3_XS, Q3_K_S (y sucesivos en la lista truncada) |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (etiquetada como "other" en metadatos) |
| Formato de pesos | GGUF (cuantizaciones); checkpoint original en safetensors |

## Arquitectura y entrenamiento

La model card identifica el modelo con los tags `lfm` y `lfm3`, lo que lo vincula a la arquitectura de los Liquid Foundation Models, pero no se proporciona ningún detalle adicional sobre la estructura interna (número de capas, dimensión oculta, mecanismo de atención, uso de atención lineal o híbrida, etc.). Tampoco se especifica el número de tokens de entrenamiento ni la composición detallada del dataset más allá de los dos conjuntos declarados: OrionLLM/OpenAgentInstruct y Modotte/CodeX-7M-Non-Thinking. No hay información sobre si se aplicaron fases de RLHF, DPO u otro tipo de alineación preferencial.

El único detalle técnico verificable en la información disponible es el formato de prompt, que utiliza tokens estilo ChatML (`<|im_start|>`, `<|im_end|>`) precedidos de `<|startoftext|>`, con un bloque `<think>` que se abre al inicio de la respuesta del asistente y que sugiere un modo de razonamiento explícito. También se documenta el formato para definiciones de herramientas dentro de un bloque `<tools>` con esquema JSON, lo que confirma el soporte de function calling. La cuantización se realizó con llama.cpp release b12180 e incluye calibración imatrix, lo que mejora la fidelidad de las cuantizaciones de baja precisión respecto a una cuantización sin calibración.

## Capacidades

- Generación de texto en inglés, con formato conversacional multi-turno basado en tokens ChatML.
- Generación de código, respaldada por el dataset Modotte/CodeX-7M-Non-Thinking.
- Razonamiento explícito mediante el bloque `<think>`, que permite separar el proceso de razonamiento de la respuesta final.
- Soporte de tool calling / function calling: la model card documenta el formato `<tools>` con definiciones JSON de funciones y parámetros.
- Orientación a agentes: el dataset OrionLLM/OpenAgentInstruct apunta a instrucciones multi-paso y uso de herramientas.
- Capacidades multilingües: limitadas al inglés según el campo `language` de los metadatos.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Asistente de código en local: el modelo puede integrarse en editores o terminales para autocompletado y generación de funciones en inglés, ejecutándose en CPU o GPU modesta gracias a las cuantizaciones de ~1 GB (Q4_K_M).
- Automatización de tareas con herramientas: el soporte de function calling permite conectar el modelo a APIs externas (por ejemplo, consulta de precios de acciones, tal como aparece en el ejemplo de la model card) dentro de pipelines de agentes.
- Prototipado de agentes multi-paso: el bloque `<think>` facilita la depuración del razonamiento intermedio en flujos de varias etapas, útil para investigadores que iteran sobre prompts de agente.
- Generación de scripts y automatización de CI/CD: el modelo puede producir fragmentos de código y comandos de shell para tareas repetitivas, con la ventaja de que su reducido tamaño permite desplegarlo dentro del propio runner.
- Educación y experimentación: al caber en hardware de consumo, sirve como banco de pruebas para estudiar el comportamiento de modelos con modo de razonamiento y tool calling sin coste de API.
- Despliegue en dispositivos con recursos limitados: con cuantizaciones IQ3_XS (0,81 GB) o Q3_K_S, puede ejecutarse en Raspberry Pi, portátiles antiguos o contenedores con poca RAM, para tareas de generación de texto breve y clasificación.
- Filtrado y enriquecimiento de datos: su tamaño permite procesar grandes volúmenes de texto en lote para tareas de etiquetado o reescritura, aunque limitado al inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): bf16 ~3,47 GB; Q8_0 ~1,85 GB; Q6_K ~1,52 GB; Q5_K_M ~1,35 GB; Q4_K_M ~1,12 GB; IQ4_XS ~1,00 GB; IQ3_XS ~0,81 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones Q4/Q5; para bf16 se recomienda al menos 6 GB (por ejemplo, RTX 3060, RTX 4060 o superiores). En A100/H100 el modelo es sobredimensionado para su tamaño y no aprovecha su capacidad; su uso típico es en hardware de gama baja.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones Q4 y Q3 con GPUs de 2-4 GB (GTX 1050 Ti, RTX 3050, iGPU con memoria unificada). También puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (versión b12180 o superior, usada para la cuantización), Ollama (importando el GGUF), LM Studio, y servidores compatibles con la API de endpoints de Hugging Face (el repo incluye el tag `endpoints_compatible`). vLLM y TGI no se mencionan en la información disponible y su compatibilidad con GGUF de este modelo no está confirmada.
- Latencia y throughput: no disponibles. Por el tamaño (~1,7B parámetros) se espera un throughput alto en GPU de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HarpiaIA_Acaua-Lite (esta ficha) | ~1,73B | no disponible | lfm1.0 | GGUF en HF (bartowski) | Afinado para código y agentes, solo inglés |
| Qwen2.5-Coder-1.5B | ~1,5B | 32K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors y GGUF | Multilingüe, orientado a código |
| Llama-3.2-1B | ~1,2B | 128K (segun documentacion publica de Meta) | Llama 3.2 Community License | safetensors y GGUF | Multilingüe, uso general |
| SmolLM2-1.7B | ~1,7B | 8K (segun documentacion publica de Hugging Face) | Apache 2.0 | safetensors y GGUF | Uso general, multilingüe |

Nota: los datos de los modelos comparativos provienen de documentación pública general y no de la información proporcionada en esta búsqueda; se incluyen como referencia orientativa. No hay benchmarks del modelo de esta ficha que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de inglés (`language: en`); su rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Contexto: no se ha publicado la longitud de contexto, lo que impide planificar su uso en tareas de contexto largo.
- Benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni similares, por lo que no es posible evaluar su calidad frente a alternativas.
- Licencia: la licencia `lfm1.0` (etiquetada como "other") puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE del repositorio antes de desplegarlo en producción.
- Alucinación: al ser un modelo pequeño (~1,7B), la tasa de alucinación en tareas de conocimiento factual es previsiblemente alta; no debe usarse como fuente de verdad sin verificación.
- Modo de razonamiento: el bloque `<think>` debe gestionarse en el parseo de la salida; si el cliente no lo maneja, puede filtrarse texto de razonamiento al usuario final.
- Tool calling: el formato `<tools>` está documentado, pero no se especifica la fiabilidad del modelo al generar llamadas válidas; conviene validar el JSON de salida en producción.
- Autor de la cuantización: bartowski es el cuantizador, no el autor del modelo base; los problemas de calidad del modelo original no son responsabilidad del repo GGUF.
- Fecha de creación del repo (2026-11-07) y ausencia de descargas/likes: el modelo es muy reciente y no cuenta aún con validación comunitaria.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/bartowski/HarpiaIA_Acaua-Lite-GGUF
- Modelo base: https://huggingface.co/HarpiaIA/Acaua-Lite
- Repositorio GGUF del autor original: https://huggingface.co/HarpiaIA/Acaua-Lite-GGUF
- Perfil de bartowski: https://huggingface.co/bartowski
- llama.cpp (release b12180 usada para la cuantización): https://github.com/ggml-org/llama.cpp/releases/tag/b12180
- Dataset OrionLLM/OpenAgentInstruct: https://huggingface.co/datasets/OrionLLM/OpenAgentInstruct
- Dataset Modotte/CodeX-7M-Non-Thinking: https://huggingface.co/datasets/Modotte/CodeX-7M-Non-Thinking
- Descarga directa Q4_K_M: https://huggingface.co/bartowski/HarpiaIA_Acaua-Lite-GGUF/blob/main/HarpiaIA_Acaua-Lite-Q4_K_M.gguf
