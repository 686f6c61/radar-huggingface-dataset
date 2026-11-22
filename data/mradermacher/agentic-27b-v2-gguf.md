# mradermacher/Agentic-27B-V2-GGUF

## Resumen

Agentic-27B-V2 es un modelo de lenguaje de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) desarrollado por OpenCSG y distribuido en formato GGUF por mradermacher. Está diseñado específicamente para tareas de agente: uso de herramientas (tool-use), function calling, generación de código y automatización de flujos multi-paso, con especial énfasis en escenarios tipo SWE-bench. La model card lo etiqueta con el identificador `qwen3.8`, lo que sugiere una base derivada de la familia Qwen, aunque no se confirma oficialmente la arquitectura exacta.

El modelo resuelve el problema de disponer de un LLM de tamano medio (27B) optimizado para razonamiento agéntico y ejecución de código, que puede desplegarse en hardware relativamente asequible gracias a las cuantizaciones GGUF publicadas. Es relevante ahora porque la demanda de modelos que soporten pipelines de agentes autónomos con tool calling fiable ha crecido, y este modelo se posiciona como una alternativa abierta (bajo licencia OpenCSG) frente a modelos propietarios para ese nicho.

La información pública disponible es limitada: no se detallan la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks en la model card del repositorio GGUF. Esta ficha refleja únicamente los datos verificables extraídos de la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen, según tag `qwen3.8`; no confirmado oficialmente) |
| Parámetros totales | 27.320.697.856 (~27,3 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | zh, en |
| Licencia | opencsg-model-and-dataset-license (licencia personalizada de OpenCSG) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. El tag `qwen3.8` sugiere que el modelo deriva de la familia Qwen, lo que implicaría una arquitectura transformer decoder-only con atención estándar, pero este dato no está confirmado oficialmente. El tamano de 27,3 B parámetros y el hecho de que no se mencione mezcla de expertos apuntan a un modelo denso.

Respecto al entrenamiento, la model card no especifica el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Los tags (`agent`, `agentic`, `tool-use`, `function-calling`, `code`, `swe-bench`, `automation`) indican que el ajuste se orientó hacia tareas de agente y generación de código, probablemente con datos de trayectorias de tool calling y resolución de issues de software. No se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento general en chino e inglés.
- Generación de código y resolución de problemas de software (orientado a SWE-bench).
- Tool calling y function calling: el modelo está entrenado para invocar herramientas externas y estructurar llamadas a funciones.
- Razonamiento agéntico multi-paso: planificación y ejecución de secuencias de acciones para automatización.
- Soporte multimodal: el repositorio incluye ficheros `mmproj` (multi-modal supplement), lo que indica capacidad de procesamiento de visión además de texto.
- Capacidades multilingües limitadas a chino e inglés según los metadatos.
- Compatibilidad con endpoints y despliegue en vLLM (tag `endpoints_compatible`, `vllm`).

## Casos de uso

- Automatización de resolución de issues de software: el modelo puede analizar un repositorio, localizar el fichero relevante y proponer un parche, aprovechando su entrenamiento orientado a SWE-bench. Adecuado para pipelines de CI/CD que generen pull requests automáticos.
- Agentes de tool calling en producción: integración en flujos donde el modelo debe decidir qué función invocar (APIs REST, bases de datos, sistemas de ficheros) y construir los argumentos correctos en formato JSON.
- Asistente de código en IDE: autocompletado y generación de funciones con contexto de proyecto, desplegado localmente mediante llama.cpp u Ollama con cuantización Q4_K_M (16,9 GB).
- Automatización de tareas administrativas multi-paso: orquestación de secuencias de acciones (leer correo, extraer datos, actualizar CRM) mediante function calling encadenado.
- Análisis de documentos con componente visual: gracias a los ficheros mmproj, puede procesar capturas de pantalla o documentos escaneados junto con texto para tareas de extracción.
- Chat de soporte técnico bilingüe (zh/en): atención al cliente en entornos donde se requiera alternar entre chino e inglés con capacidad de consultar herramientas internas.
- Generación de tests y documentación: a partir de código existente, el modelo puede producir pruebas unitarias y documentación técnica en el mismo pipeline de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo denso de 27,3 B):
  - Q2_K (11,0 GB): ~12 GB de VRAM.
  - Q4_K_M (16,9 GB): ~18 GB de VRAM.
  - Q5_K_M (19,6 GB): ~21 GB de VRAM.
  - Q6_K (22,5 GB): ~24 GB de VRAM.
  - Q8_0 (29,1 GB): ~30 GB de VRAM.
- GPU recomendadas: A100 40 GB o H100 para FP16/BF16 completo; RTX 4090 (24 GB) para Q4_K_M, Q5_K_M y Q6_K; RTX 3090 (24 GB) para cuantizaciones hasta Q6_K.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones Q4_K_M o inferiores; en GPUs de 16 GB solo con Q2_K o Q3_K_S.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (para el modelo base en safetensors), transformers. El tag `endpoints_compatible` indica compatibilidad con APIs tipo OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Agentic-27B-V2 (este) | ~27,3 B | no disponible | OpenCSG | GGUF, safetensors | Agéntico, tool-use, código |
| Qwen2.5-Coder-32B | ~32 B | 128K (según documentación pública de Qwen) | Apache 2.0 | safetensors, GGUF | Código |
| DeepSeek-Coder-V2 | 236 B totales / 21 B activos (MoE) | 128K | DeepSeek License | safetensors, GGUF | Código |
| Llama-3.3-70B-Instruct | 70 B | 128K | Llama 3.3 Community License | safetensors, GGUF | General, tool calling |

Nota: los datos de los modelos comparables provienen de conocimiento general público y no de la información proporcionada en esta búsqueda; se incluyen como referencia orientativa. No se dispone de comparativas de rendimiento verificadas para Agentic-27B-V2.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks que permitan validar el rendimiento real frente a alternativas; el posicionamiento en SWE-bench es una afirmación del autor sin datos verificables en la documentación disponible.
- La licencia es una licencia personalizada de OpenCSG (`opencsg-model-and-dataset-license`), no una licencia estándar tipo Apache o MIT. Es imprescindible revisar los términos antes de uso comercial; pueden existir restricciones de atribución o de uso.
- Idiomas soportados limitados a chino e inglés; el rendimiento en castellano no está garantizado ni documentado.
- Riesgo de alucinación inherente a los modelos de 27B, especialmente en tareas de razonamiento prolongado o tool calling encadenado sin validación externa.
- La longitud de contexto no está documentada, lo que dificulta planificar su uso en tareas que requieran ventanas largas (análisis de repositorios completos, conversaciones extensas).
- El tag `qwen3.8` sugiere una base Qwen, pero no se confirma la arquitectura exacta ni el proceso de entrenamiento; esto limita la capacidad de predecir comportamiento en producción.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; para uso agéntico se recomienda Q4_K_M o superior.
- El repositorio GGUF tiene 190,8 GB y múltiples ficheros; es necesario descargar solo la cuantización deseada y, si se usa multimodal, los ficheros `mmproj` correspondientes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Agentic-27B-V2-GGUF
- Modelo base: https://huggingface.co/opencsg/Agentic-27B-V2
- Licencia: https://huggingface.co/opencsg/Agentic-27B-V2/blob/main/OpenCSG%E6%A8%A1%E5%9E%8B%E4%B8%8E%E6%95%B0%E6%8D%AE%E9%9B%86%E8%AE%B8%E5%8F%AF%E5%8D%8F%E8%AE%AE.md
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Agentic-27B-V2-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Agentic-27B-V2-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
