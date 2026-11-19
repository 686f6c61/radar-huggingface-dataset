# mradermacher/prism-coder-9b-GGUF

## Resumen

Prism-coder-9b-GGUF es la versión cuantizada en formato GGUF del modelo dcostenco/prism-coder-9b, un modelo multimodal de 9.197.093.888 parámetros (aproximadamente 9,2 mil millones) orientado a tareas de código y enrutamiento de herramientas (tool routing) y function calling. La cuantización la ha realizado mradermacher, un conocido publicador de cuantizaciones GGUF en Hugging Face, a partir de los pesos originales en safetensors. El modelo base se distribuye bajo licencia Apache 2.0 y está etiquetado como compatible con transformers y con endpoints.

El modelo se presenta como un derivado de la familia Qwen3.5 (según las etiquetas de la model card) y ha sido ajustado mediante QLoRA, con marcas de identidad asociadas a "synalux" y "prism-coder". Su pipeline declarado es image-text-to-text, lo que indica capacidades de visión además de generación de texto, y las etiquetas destacan explícitamente tool-routing y function-calling como ejes centrales del ajuste. El idioma declarado es únicamente inglés.

La relevancia de esta ficha radica en que ofrece el modelo en múltiples niveles de cuantización (desde Q2_K de 4,0 GB hasta f16 de 18,5 GB), lo que permite desplegarlo en hardware de consumo con llama.cpp u Ollama, algo inviable con los pesos originales en precisión completa. No obstante, la información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada, por lo que muchos apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5 según etiquetas; detalles internos no disponibles) |
| Parametros totales | 9.197.093.888 (≈9,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas de la model card, que apuntan a un transformer derivado de Qwen3.5. El modelo base dcostenco/prism-coder-9b fue ajustado mediante QLoRA, según la etiqueta `qlora`, lo que sugiere un fine-tuning de bajo rango sobre un modelo preentrenado de la familia Qwen3.5. El pipeline image-text-to-text y las etiquetas `vision` y `multimodal` indican que el modelo incorpora un codificador visual y es capaz de procesar entradas de imagen y texto conjuntamente.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Las etiquetas `tool-routing` y `function-calling` sugieren que el ajuste se orientó específicamente a la selección y enrutamiento de herramientas, probablemente mediante datos sintéticos de llamadas a funciones, pero este extremo no está confirmado en la información proporcionada. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y código, con especial énfasis en tareas de programación según el nombre y las etiquetas del modelo.
- Tool calling y function calling: el ajuste está explícitamente orientado al enrutamiento de herramientas (tool-routing), lo que sugiere capacidad para seleccionar y estructurar llamadas a funciones.
- Procesamiento multimodal image-text-to-text: acepta imágenes junto con texto, según el pipeline declarado y las etiquetas `vision` y `multimodal`.
- Razonamiento multi-paso orientado a agentes, inferido de la orientación a tool routing, aunque no hay documentación específica.
- Capacidades multilingües limitadas: solo se declara inglés (`en`).
- No se documentan capacidades de audio ni modos de pensamiento explícitos (thinking mode).

## Casos de uso

- Automatización de agentes con herramientas: el modelo puede emplearse como enrutador de llamadas a funciones en un sistema de agentes, seleccionando la herramienta adecuada a partir de la consulta del usuario gracias a su ajuste específico en tool-routing.
- Asistente de código en local: con cuantizaciones Q4_K_M de 5,9 GB, puede desplegarse en una GPU de consumo para autocompletado y generación de código en entornos sin conexión.
- Análisis de capturas de pantalla y diagramas: al ser image-text-to-text, puede procesar imágenes de interfaces o diagramas de arquitectura y generar explicaciones o código asociado.
- Integración en pipelines de CI/CD: mediante function calling, puede invocarse desde scripts para tareas de revisión automatizada o generación de parches, aunque la ventana de contexto no documentada limita su uso en repositorios grandes.
- Prototipado de asistentes técnicos en inglés: adecuado para demos y pruebas de concepto donde se requiera un modelo de 9 B con capacidades multimodales y licencia permisiva.
- Despliegue en hardware modesto: las cuantizaciones Q2_K (4,0 GB) y Q3_K_S (4,5 GB) permiten ejecución en GPUs con 6-8 GB de VRAM o incluso en CPU con llama.cpp, útil para entornos de desarrollo con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ≈4,0 GB; Q3_K_S ≈4,5 GB; Q4_K_M ≈5,9 GB; Q5_K_M ≈6,7 GB; Q6_K ≈7,7 GB; Q8_0 ≈9,9 GB; f16 ≈18,5 GB (más overhead de contexto y del codificador visual).
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones Q4-Q6; RTX 4090 24 GB para Q8_0 o f16; A100/H100 para despliegues de alta concurrencia con f16.
- Cabe en GPU de consumo: sí, en cuantizaciones Q2_K a Q8_0 en GPUs de 8-12 GB; f16 requiere 24 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el modelo base es compatible con transformers y endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| prism-coder-9b-GGUF | ≈9,2 B | no disponible | Apache 2.0 | GGUF | Multimodal, tool-routing, solo inglés |
| Qwen2.5-Coder-7B | 7,6 B | 32 K (128 K con YaRN) | Apache 2.0 | safetensors, GGUF | Referencia en código, sin visión |
| Llama-3.1-8B-Instruct | 8,0 B | 128 K | Llama 3.1 Community | safetensors, GGUF | Multilingüe, sin visión nativa |
| Gemma-2-9B-it | 9,2 B | 8 K | Gemma Terms | safetensors, GGUF | Multilingüe, sin visión |

La comparativa se basa en características públicas de modelos de tamaño similar; no se dispone de datos de rendimiento comparativo para prism-coder-9b.

## Limitaciones y advertencias

- Idiomas: solo se declara inglés, por lo que el rendimiento en castellano no está garantizado y probablemente sea deficiente.
- Sesgos: no documentados; al derivar de Qwen3.5 y ajustarse con QLoRA, puede heredar sesgos del modelo base y del dataset de ajuste.
- Alucinación: riesgo inherente a modelos de 9 B; la orientación a tool calling puede producir llamadas a funciones inexistentes o con argumentos incorrectos si no se valida la salida.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar su uso en tareas de contexto largo.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5 y de los datos de ajuste, no documentadas aquí.
- Producción: al ser una cuantización comunitaria (no oficial), la calidad puede variar entre niveles; las cuantizaciones Q2_K y Q3_K_M están marcadas por el autor como de menor calidad.
- Multimodalidad: el codificador visual puede no estar incluido en todos los archivos GGUF (la model card menciona `skip_mmproj: 1`), lo que podría afectar al uso de imágenes en algunas cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/prism-coder-9b-GGUF
- Modelo base: https://huggingface.co/dcostenco/prism-coder-9b
- Página de descargas del cuantizador: https://hf.tst.eu/model#prism-coder-9b-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
