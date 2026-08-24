# ram1234598766/Cesium2-vision-GGUF

## Resumen

Cesium2 Vision es un modelo multimodal de vision-lenguaje (image-text-to-text) creado por el usuario ram1234598766 como parte de la familia MORPH-AI. Se trata de un fine-tune con QLoRA del modelo base `Qwen2.5-VL-3B-Instruct`, especializado en VQA documental (lectura y respuesta sobre documentos escaneados) y en la personalidad y conocimientos del conjunto de datos Cesium2 2026. El modelo se distribuye en formato GGUF para su uso con llama.cpp y Ollama, lo que facilita su despliegue local en hardware moderado.

La relevancia de este modelo reside en que combina capacidades multimodales (visión + texto) con un tamaño compacto de aproximadamente 3,1 mil millones de parámetros, lo que permite ejecutarlo en GPUs de consumo. Su licencia Apache 2.0 lo hace atractivo para integraciones comerciales y proyectos de código abierto. La arquitectura se basa en el transformer qwen2vl con un proyector CLIP para la entrada de imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen2vl (transformer multimodal) + proyector CLIP |
| Parametros totales | 3.085.938.688 (≈3,09 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8192 tokens (según Modelfile de Ollama; el contexto máximo del modelo base no se especifica) |
| Tipos de cuantizacion | Q4_K_M (torre LLM) y F16 (proyector de visión) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivos separados para LLM y mmproj) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `Qwen2.5-VL-3B-Instruct`, un transformer multimodal con un codificador de visión CLIP y un proyector que alinea las características visuales con el espacio de texto. Sobre esta base se realizó un fine-tune con QLoRA (r=16) aplicado a las proyecciones de atención, durante una sola época. Los datos de entrenamiento incluyen 400 imágenes del conjunto documental `docvqa` de The Cauldron y el conjunto completo de texto de persona y conocimiento de Cesium2 2026. No se menciona el uso de técnicas como RLHF o DPO.

La innovación principal no es arquitectónica, sino de distribución: el modelo se ofrece como GGUF con un proyector de visión separado (`mmproj-f16.gguf`), lo que permite cargarlo directamente en llama.cpp y Ollama sin conversiones adicionales. El fine-tune busca mejorar la capacidad del modelo para responder preguntas sobre documentos visuales, manteniendo la base de conocimiento general de Cesium2.

## Capacidades

- VQA documental: responde a preguntas sobre imágenes de documentos, tablas y diagramas.
- Generación de texto: conserva las capacidades de lenguaje del modelo base Qwen2.5-VL-3B-Instruct.
- Razonamiento multimodal: combina información visual y textual para responder consultas.
- Conversación multimodal: soporta diálogos con entrada de imágenes y texto.
- Personalidad y conocimiento Cesium2 2026: incluye el estilo y la base de datos del conjunto de texto Cesium2.
- No se especifica soporte para tool calling, agentes ni razonamiento multi-paso en la información disponible.

## Casos de uso

- **OCR y extracción de datos de documentos**: el modelo puede procesar imágenes de facturas, formularios o contratos y extraer campos específicos (fechas, importes, nombres) mediante VQA. Su tamaño compacto permite ejecutarlo en un servidor pequeño sin GPU dedicada.
- **Asistente de documentación técnica**: integrado en un chat de soporte, puede leer capturas de pantalla de errores o diagramas y explicar posibles soluciones, combinando la visión con el conocimiento de Cesium2.
- **Análisis de documentos en aplicaciones de escritorio**: con la extensión de VS Code publicada, los desarrolladores pueden arrastrar y soltar imágenes de documentación para obtener respuestas contextuales mientras escriben código.
- **Clasificación de imágenes de documentos**: dado un lote de imágenes (facturas, contratos, etc.), el modelo puede generar descripciones o etiquetas de categoría mediante prompts en inglés.
- **Chatbot de atención al cliente con adjuntos visuales**: un bot puede recibir capturas de pantalla de problemas del usuario y responder con instrucciones de resolución, gracias a su contexto de 8192 tokens para conversaciones multi-turno.
- **Prototipado rápido de aplicaciones multimodales**: por su formato GGUF y compatibilidad con Ollama, es adecuado para pruebas de concepto de sistemas de visión por computador en entornos locales sin infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este modelo. El rendimiento real deberá evaluarse en tareas concretas de VQA documental y generación de texto.

## Requisitos de hardware

- **VRAM estimada**: con los archivos GGUF de 1,93 GB (Q4_K_M) y 1,34 GB (proyector F16), la carga en memoria requiere aproximadamente 4 GB de VRAM para inferencia, más overhead de contexto. Es viable en GPUs de 6 GB.
- **GPU recomendadas**: RTX 3060 (12 GB) o superior, RTX 4060 Ti, RTX 4090, o GPUs de datacenter como A10, A100 o H100 si se desea mayor velocidad.
- **GPUs consumer**: sí, cabe en GPUs de consumo con 6 GB o más de VRAM. Con cuantización Q4_K_M, el modelo puede ejecutarse incluso en sistemas con 4 GB si se reduce el contexto.
- **Opciones de despliegue**: llama.cpp, Ollama (con `ollama pull ram1234598766/cesium2-vision`), LM Studio (descargando los dos archivos GGUF), y otros runners compatibles con GGUF.
- **Latencia y throughput**: no disponibles; dependerá de la GPU y del número de tokens generados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Cesium2 Vision** (este) | 3,09 B | 8192 (config) | GGUF | Apache-2.0 | HuggingFace, Ollama |
| **Qwen2.5-VL-3B-Instruct** (base) | 3,09 B | 32K (según documentación oficial de Qwen) | safetensors | Apache-2.0 | HuggingFace |
| **LLaVA-1.6 (llava-v1.6-vicuna-7b)** | 7 B | 4096 | safetensors, GGUF | Apache-2.0 | HuggingFace |

La comparación es limitada: el modelo base Qwen2.5-VL-3B-Instruct ofrece el mismo tamaño y arquitectura, pero sin el fine-tune específico en VQA documental y con contexto nativo mayor. LLaVA-1.6 es una alternativa multimodal de 7 B con mayor capacidad de parámetros, pero contexto menor y sin el ajuste de Cesium2. No se dispone de benchmarks comparativos para evaluar diferencias de rendimiento reales.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un fine-tune de un modelo pequeño (3B), puede presentar alucinaciones en tareas complejas y sesgos heredados del conjunto de datos base y del fine-tune.
- **Datos de entrenamiento limitados**: el fine-tune se realizó con solo 400 imágenes de docVQA, lo que puede limitar la generalización a otros tipos de documentos o idiomas.
- **Idioma**: el modelo está entrenado principalmente en inglés; no se garantiza buen rendimiento en otros idiomas, incluido el español.
- **Contexto**: la configuración recomendada es de 8192 tokens; superar este límite puede degradar la calidad de las respuestas.
- **Uso comercial**: la licencia Apache-2.0 permite uso comercial sin restricciones, pero es responsabilidad del usuario verificar que los datos de entrenamiento no infrinjan derechos de terceros.
- **Rendimiento no validado**: no hay benchmarks publicados; el rendimiento real en tareas de producción debe evaluarse antes de un despliegue crítico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ram1234598766/Cesium2-vision-GGUF
- Repositorio GitHub del proyecto: https://github.com/ram1234598766-dotcom/Cesium2
- Modelo hermano (solo texto): https://huggingface.co/ram1234598766/Cesium2-v7-GGUF
- Extensión de VS Code: https://open-vsx.org/extension/ram1234598766/cesium2-ai
- Página en Ollama: https://ollama.com/ram1234598766/cesium2-vision
