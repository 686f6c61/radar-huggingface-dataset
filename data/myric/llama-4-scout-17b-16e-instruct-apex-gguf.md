# Myric/Llama-4-Scout-17B-16E-Instruct-APEX-GGUF

## Resumen

El modelo **Llama-4-Scout-17B-16E-Instruct-APEX-GGUF** es una cuantización no oficial del modelo **Llama 4 Scout 17B-16E Instruct** de Meta, realizada por el usuario Myric mediante la técnica APEX (Allocation Per Tensor). El modelo base es un transformador de mezcla de expertos (MoE) con 17 mil millones de parámetros activos y aproximadamente 107,8 mil millones de parámetros totales, distribuidos en 16 expertos. Está diseñado para generación de texto y soporta multimodalidad nativa (imagen y texto) gracias a una fusión temprana de modalidades, aunque la cuantización aquí presentada se centra en la parte textual.

La relevancia de esta ficha radica en que ofrece tres niveles de cuantización GGUF (i-quality, i-compact e i-mini) que permiten ejecutar un modelo de gran tamaño en hardware relativamente accesible, desde estaciones de trabajo con 64 GB de memoria unificada hasta GPUs de consumo con 24 GB. El contexto máximo entrenado es de 10 485 760 tokens (10 M), lo que lo hace especialmente interesante para tareas de análisis de documentos largos, aunque exige una gestión cuidadosa de la memoria del KV cache. La cuantización emplea una matriz de importancia (imatrix) calculada sobre el corpus wikitext y una asignación de bits estructural por tipo de tensor, priorizando atención y experto compartido frente a los expertos enrutados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 16 expertos (atención y FFN) |
| Parametros totales | 107 769 861 184 (~107,8 B) |
| Parametros activos | 17 B (por token) |
| Longitud de contexto | 10 485 760 tokens (10 M) |
| Tipos de cuantizacion | APEX (i-quality, i-compact, i-mini) con bits/weight de 5,59 / 4,07 / 2,81 respectivamente |
| Idiomas soportados | no disponible (el modelo base soporta múltiples idiomas, pero no se detallan) |
| Licencia | llama4-community-license |
| Formato de pesos | GGUF (cuantizado) |

## Arquitectura y entrenamiento

El modelo base Llama 4 Scout es un transformador autorregresivo con arquitectura de mezcla de expertos (MoE). Utiliza 16 expertos en las capas de atención y de feed-forward, de los cuales se activan 2 por token (típicamente), lo que da un total de 17 B parámetros activos de los 107,8 B totales. Incorpora fusión temprana de modalidades para procesar imágenes y texto de forma nativa, aunque la cuantización APEX aquí descrita se centra en los pesos textuales. El contexto de entrenamiento alcanza los 10 M de tokens, lo que permite ventanas de atención extremadamente largas.

La cuantización APEX fue construida a partir de un GGUF BF16 de referencia (sin descargar los safetensors originales), utilizando una imatrix calculada sobre 126 fragmentos de 512 tokens del corpus wikitext. La asignación de bits es estructural: los tensores de atención y del experto compartido reciben mayor precisión (Q6_K o Q8_0) que los expertos enrutados (Q4_K o IQ3_XXS). El autor indica que la validación de coherencia generativa y tool-calling está pendiente de una ejecución de prueba, por lo que los quants deben tratarse como no verificados hasta que se complete esa validación.

## Capacidades

- Generación de texto y chat conversacional con soporte multi-turno.
- Generación de código y razonamiento lógico-matemático, heredado del modelo base.
- Soporte de tool calling / function calling, mencionado en la model card del autor.
- Capacidades multimodales en el modelo base (imagen y texto), aunque la cuantización GGUF puede limitar el procesamiento de imágenes según la implementación de llama.cpp.
- Ventana de contexto extremadamente larga (hasta 10 M tokens), útil para tareas que requieren memoria de contexto masiva.
- Soporte para agentes y razonamiento multi-paso, gracias a la combinación de tool calling y contexto largo.

## Casos de uso

- **Análisis de documentos extensos**: con su contexto de 10 M tokens, el modelo puede procesar libros completos, expedientes legales o repositorios de código enteros sin necesidad de dividirlos en fragmentos. La cuantización i-compact (54,9 GB) permite cargar el modelo en una estación de trabajo con 64 GB de RAM unificada.
- **Asistente de programación local**: gracias al soporte de tool calling, puede integrarse en entornos de desarrollo como un agente que ejecuta comandos, busca en la documentación y genera código. La versión i-mini (37,8 GB) cabe en GPUs de 40 GB como la A100 o en sistemas con 48 GB de RAM.
- **Chatbot corporativo con memoria larga**: al mantener el historial de conversación en contexto, puede ofrecer respuestas coherentes en sesiones prolongadas sin perder el hilo, ideal para atención al cliente o asistentes internos.
- **Procesamiento de documentos legales y financieros**: la capacidad de manejar contexto masivo permite resumir y extraer información de contratos extensos, informes anuales o expedientes regulatorios.
- **Generación de código en pipelines de CI/CD**: puede usarse como generador de pruebas unitarias o documentación automática, ejecutándose en servidores con CPU y suficiente RAM gracias a la cuantización GGUF y llama.cpp.
- **Investigación académica**: para tareas de análisis de corpus grandes, como revisión sistemática de literatura o minería de textos completos, donde el contexto largo reduce la pérdida de información por truncamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica que la validación de coherencia generativa y tool-calling está pendiente de una ejecución de prueba, y que no se dispone de una referencia de perplexidad sobre wikitext porque el modelo BF16 de referencia no cabe en la memoria de la máquina de construcción (119 GB unificados).

## Requisitos de hardware

- **i-mini** (≈37,8 GB, 2,81 bits/peso): requiere al menos 40 GB de VRAM o RAM unificada. Puede ejecutarse en una A100 40 GB, en un Mac Studio con 64 GB unificados, o en dos RTX 3090/4090 con NVLink o reparto de capas.
- **i-compact** (≈54,9 GB, 4,07 bits/peso): necesita unos 60 GB de memoria. Adecuado para A100 80 GB, H100 80 GB, o Mac Studio con 64 GB unificados.
- **i-quality** (≈75,4 GB, 5,59 bits/peso): requiere al menos 80 GB de VRAM. Solo viable en A100 80 GB, H100 80 GB, o configuraciones multi-GPU con 2×48 GB o similares.
- **Despliegue en CPU**: con suficiente RAM (por ejemplo, 128 GB para i-quality) y usando llama.cpp con cuantización, es posible ejecutar el modelo en CPU, aunque con latencias altas.
- **Opciones de despliegue**: llama.cpp (llama-cli, llama-server), Ollama (si se importa el GGUF), y vLLM (con soporte experimental para GGUF). Se recomienda usar llama.cpp por su madurez con este formato.
- **Latencia y throughput**: no disponibles; dependerán del hardware y del tamaño de cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Llama 4 Scout 17B-16E (base) | ~107,8 B | 17 B | 10 M | Llama 4 Community | safetensors |
| Llama 4 Maverick 17B-128E | ~400 B (estimado) | 17 B | 1 M (estimado) | Llama 4 Community | safetensors |
| Mixtral 8x7B | 46,7 B | 12,9 B | 32 K | Apache 2.0 | safetensors/GGUF |
| Qwen2.5 MoE A14B | 14 B activos | 14 B | 128 K | Apache 2.0 | safetensors/GGUF |

La comparativa se basa en parámetros y licencia; no hay datos de rendimiento disponibles para esta cuantización concreta. Llama 4 Scout destaca por su contexto extremadamente largo y su naturaleza multimodal, mientras que Mixtral y Qwen ofrecen licencias más permisivas (Apache 2.0) y menor huella de memoria.

## Limitaciones y advertencias

- **Riesgo de bloqueo del sistema**: si se ejecuta con llama.cpp sin especificar `--ctx-size`, el modelo intentará asignar un KV cache para 10 M de tokens, lo que puede consumir terabytes de memoria y provocar un cuelgue total del sistema (el autor reporta haber sufrido un reinicio forzado durante las pruebas). Es imprescindible pasar siempre un `--ctx-size` explícito y acorde al hardware.
- **Validación pendiente**: los quants APEX no han sido sometidos a pruebas de coherencia generativa ni de tool-calling. El autor los describe como "construidos y sin probar" hasta que complete la ejecución de validación.
- **Sesgos y alucinaciones**: no se dispone de información sobre sesgos específicos del modelo base, pero como todo LLM, existe riesgo de alucinación, especialmente en tareas de razonamiento o con información factual.
- **Restricciones de licencia**: la licencia llama4-community-license impone condiciones de uso comercial. Es necesario revisar los términos completos en el repositorio del modelo base de Meta antes de usar el modelo en producción.
- **Limitaciones de idioma**: no se han especificado los idiomas soportados en la cuantización; el modelo base de Meta es multilingüe, pero la calidad puede variar según el idioma.
- **Cuantización agresiva**: la versión i-mini usa IQ3_XXS para expertos enrutados, lo que puede degradar la calidad de generación en comparación con el modelo original. Se recomienda probar con datos propios antes de desplegar.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/Myric/Llama-4-Scout-17B-16E-Instruct-APEX-GGUF
- Modelo base de Meta: https://huggingface.co/meta-llama/Llama-4-Scout-17B-16E-Instruct
- Modelo base sin instrucciones: https://huggingface.co/meta-llama/Llama-4-Scout-17B-16E
- Documentación de vLLM sobre el modelo: https://recipes.vllm.ai/meta-llama/Llama-4-Scout-17B-16E-Instruct
- Documentación de Groq sobre Llama 4 Scout: https://console.groq.com/docs/model/llama-4-scout-17b-16e-instruct
- Herramienta APEX utilizada: https://github.com/localai-org/apex-quant
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Dataset de calibración (wikitext): https://huggingface.co/datasets/Salesforce/wikitext
