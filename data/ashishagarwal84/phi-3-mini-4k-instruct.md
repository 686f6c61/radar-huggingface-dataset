# ashishagarwal84/Phi-3-mini-4k-instruct

## Resumen

Phi-3-mini-4k-instruct es un modelo de lenguaje de 3.821 millones de parámetros (aproximadamente 3,8B) desarrollado originalmente por Microsoft dentro de la familia Phi-3. Esta ficha corresponde a la réplica publicada por el usuario `ashishagarwal84` en Hugging Face, que redistribuye los pesos originales bajo licencia MIT. El modelo está diseñado para entornos con recursos limitados de memoria y cómputo, así como para escenarios sensibles a la latencia, manteniendo un rendimiento sólido en razonamiento matemático y lógico.

Se trata de un transformer denso (no MoE) con una ventana de contexto de 4.096 tokens, entrenado sobre los datasets Phi-3 que combinan datos sintéticos con datos filtrados de webs públicas, con énfasis en contenido de alta calidad y densidad de razonamiento. El post-entrenamiento incluye ajuste supervisado (SFT) y optimización directa de preferencias (DPO) para mejorar el seguimiento de instrucciones y las medidas de seguridad.

La relevancia actual del modelo radica en su relación calidad/tamaño: con menos de 4B de parámetros ofrece resultados competitivos frente a modelos de hasta 13B en benchmarks de sentido común, comprensión del lenguaje, matemáticas y código. La actualización de junio de 2024 mejoró de forma notable el seguimiento de instrucciones y la generación de salidas estructuradas (JSON, XML), lo que lo hace útil para pipelines de agentes y extracción de datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Phi-3, código personalizado `phi3`) |
| Parámetros totales | 3.821.079.552 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (variante 4K) |
| Tipos de cuantización | no disponible en la información proporcionada (existe versión GGUF oficial de Microsoft, pero no se detallan los tipos) |
| Idiomas soportados | inglés (en), francés (fr) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 7,6 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de tipo decoder-only con 3,8B de parámetros, empaquetado con código personalizado (`custom_code`, arquitectura `phi3`) que requiere `transformers` 4.41.2 o superior. La variante 4K soporta una longitud de contexto de 4.096 tokens; existe una variante hermana de 128K para contextos largos. Los pesos se distribuyen en formato safetensors con un tamaño de repositorio de 7,6 GB.

El entrenamiento se basa en los datasets Phi-3, que combinan datos sintéticos generados y datos filtrados de webs públicas, priorizando contenido de alta calidad y densidad de razonamiento. El post-entrenamiento incorpora ajuste supervisado (SFT) y optimización directa de preferencias (DPO) para el seguimiento de instrucciones y la seguridad. La actualización de junio de 2024 añadió datos de post-entrenamiento adicionales que mejoraron sustancialmente el seguimiento de instrucciones, la calidad multi-turno, el soporte explícito de la etiqueta `<|system|>` y la capacidad de razonamiento. No se detallan en la información disponible el número exacto de tokens de entrenamiento ni la composición porcentual del dataset.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte explícito de la etiqueta `<|system|>` para definir el rol del sistema.
- Razonamiento matemático y lógico, con mejoras significativas en la actualización de junio de 2024 (GPQA de 23,7 a 30,6; MMLU de 68,8 a 70,9).
- Generación de código y tareas de NLP en inglés y francés.
- Salidas estructuradas: mejora drástica en JSON (de 11,5 a 52,3) y XML (de 14,4 a 49,8), lo que facilita la integración en pipelines que requieren formato estricto.
- Seguimiento de instrucciones reforzado mediante SFT y DPO.
- Capacidades multilingües limitadas a inglés y francés.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking explícito.

## Casos de uso

- Asistente conversacional en entornos con recursos limitados: el modelo cabe en GPUs de consumo y puede desplegarse en dispositivos edge o servidores pequeños, gestionando conversaciones multi-turno dentro de su ventana de 4K tokens.
- Extracción de datos estructurados: gracias a la mejora en salida JSON (52,3 frente a 11,5 en la versión original), es adecuado para convertir texto libre en registros JSON o XML en pipelines de ingestión de datos.
- Generación de código asistida: con soporte de código y NLP, puede integrarse en editores o herramientas de autocompletado donde la latencia sea crítica y no se requiera un modelo de mayor tamaño.
- Razonamiento matemático en aplicaciones educativas: su rendimiento en matemáticas y lógica lo hace apto para tutores automáticos o generadores de problemas resueltos paso a paso.
- Clasificación y etiquetado de texto a escala: al ser ligero, permite procesar grandes volúmenes de documentos en inglés o francés con coste de cómputo reducido.
- Prototipado rápido de aplicaciones de IA generativa: su licencia MIT y su tamaño permiten experimentar y desplegar sin restricciones comerciales en fases de validación.
- Sistemas de respuesta a preguntas sobre documentación técnica: con 4K de contexto puede manejar fragmentos de documentación y responder consultas concretas en inglés.

## Benchmarks y rendimiento

Datos publicados en la model card para la actualización de junio de 2024 (comparados con la versión original):

| Benchmark | Original | Actualización junio 2024 |
|---|---|---|
| Instruction Extra Hard | 5,7 | 6,0 |
| Instruction Hard | 4,9 | 5,1 |
| Instructions Challenge | 24,6 | 42,3 |
| JSON Structure Output | 11,5 | 52,3 |
| XML Structure Output | 14,4 | 49,8 |
| GPQA | 23,7 | 30,6 |
| MMLU | 68,8 | 70,9 |
| Promedio | 21,9 | 36,7 |

No se han publicado en la información disponible resultados de HumanEval, GSM8K ni comparativas numéricas directas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 7,6 GB (tamaño de los pesos en safetensors), más overhead de activaciones y caché KV.
- En cuantización de 8 bits: aproximadamente 4 GB de VRAM; en 4 bits: aproximadamente 2,5 GB (estimación orientativa, no confirmada en la información disponible).
- GPU recomendadas: A100, H100 o L40S para despliegues de producción con alta concurrencia; RTX 4090, RTX 3090 o RTX 4080 para inferencia en fp16 en una sola GPU.
- Cabe en GPUs de consumo: sí, en tarjetas con 8 GB o más en fp16, y en tarjetas con 4-6 GB usando cuantización de 4 u 8 bits.
- Opciones de despliegue: `transformers` (versión 4.41.2 o superior, con `trust_remote_code=True`), vLLM, TGI, llama.cpp y Ollama (existe versión GGUF oficial de Microsoft, aunque esta réplica concreta solo publica safetensors).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Phi-3-mini-4k-instruct (esta réplica) | 3,8B | 4K | MIT | Hugging Face (repo de usuario) |
| Phi-3-mini-128k-instruct | 3,8B | 128K | MIT | Hugging Face (Microsoft) |
| Phi-3.5-mini-instruct | 3,8B | 128K | MIT | Hugging Face (Microsoft) |
| Phi-3-small-8k-instruct | 7B | 8K | MIT | Hugging Face (Microsoft) |

No se dispone en la información proporcionada de comparativas numéricas de rendimiento frente a modelos de otros fabricantes (Llama, Mistral, Qwen) de tamaño similar.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó principalmente con datos en inglés y puede reflejar sesgos presentes en los datos web filtrados; no se documentan evaluaciones de sesgo en la información disponible.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información factual incorrecta, especialmente en dominios especializados no cubiertos por sus datos de entrenamiento.
- Limitación de contexto: la variante 4K solo admite 4.096 tokens, insuficiente para documentos largos o conversaciones extensas; para esos casos existe la variante de 128K.
- Limitación de idioma: solo se declaran inglés y francés; el rendimiento en castellano no está garantizado ni evaluado.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones adicionales, aunque la model card original de Microsoft remite a su propio enlace de licencia; conviene verificar la procedencia de los pesos en esta réplica de terceros.
- Caveat de producción: al ser una réplica publicada por un usuario (0 descargas, 0 likes), no hay garantía de integridad ni de que los pesos coincidan exactamente con los originales de Microsoft; para producción se recomienda usar el repositorio oficial `microsoft/Phi-3-mini-4k-instruct`.
- Requiere `trust_remote_code=True` y `transformers` 4.41.2 o superior por el código personalizado de la arquitectura `phi3`.

## Enlaces

- Repositorio de esta réplica: https://huggingface.co/ashishagarwal84/Phi-3-mini-4k-instruct
- Modelo original de Microsoft: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Variante 128K: https://huggingface.co/microsoft/Phi-3-mini-128k-instruct
- Phi-3.5-mini-instruct: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Phi-3.5-MoE-instruct: https://huggingface.co/microsoft/Phi-3.5-MoE-instruct
- Phi-3.5-vision-instruct: https://huggingface.co/microsoft/Phi-3.5-vision-instruct
- Portal Phi-3: https://azure.microsoft.com/en-us/products/phi-3
- Blog de Microsoft Phi-3: https://aka.ms/Phi-3Build2024
- Informe técnico Phi-3: https://aka.ms/phi3-tech-report
- Phi-3 en Azure AI Studio: https://aka.ms/phi3-azure-ai
- Phi-3 Cookbook: https://github.com/microsoft/Phi-3CookBook
- Demo: https://aka.ms/try-phi3
- Licencia MIT: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct/resolve/main/LICENSE
