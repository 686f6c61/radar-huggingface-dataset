# ArchiveStudio/Phi-3-mini-4k-instruct

## Resumen

Phi-3-mini-4k-instruct es un modelo de lenguaje decoder-only de 3.821 millones de parámetros (3,8B) perteneciente a la familia Phi-3 de Microsoft. Se trata de la variante Mini con ventana de contexto de 4K tokens, diseñada para entornos con restricciones de memoria o cómputo y para escenarios sensibles a la latencia. El modelo fue entrenado sobre los datasets de Phi-3, que combinan datos sintéticos con datos filtrados de webs públicas, priorizando contenido de alta calidad y densidad de razonamiento.

El repositorio analizado aquí corresponde a una recarga (mirror) publicada por el usuario ArchiveStudio bajo licencia MIT, que replica los pesos del modelo original de Microsoft. La model card hace referencia explícita al modelo de Microsoft y a sus variantes Phi-3.5. El proceso de post-entrenamiento combina ajuste supervisado (SFT) y optimización directa de preferencias (DPO) para mejorar el seguimiento de instrucciones y las medidas de seguridad.

La relevancia del modelo reside en su relación calidad/tamaño: con menos de 4.000 millones de parámetros ofrece un rendimiento en razonamiento, matemáticas y código que compite con modelos de hasta 13B, lo que permite desplegarlo en hardware de consumo y en pipelines de baja latencia. La actualización de junio de 2024 mejoró sustancialmente el seguimiento de instrucciones, la salida estructurada (JSON/XML) y las capacidades de razonamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Phi-3, código personalizado `phi3`) |
| Parámetros totales | 3.821.079.552 (3,8B) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 4K tokens |
| Tipos de cuantizacion | no disponible en este repositorio; existen conversiones comunitarias a GGUF y ONNX en el repositorio original de Microsoft |
| Idiomas soportados | en, fr (inglés y francés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`custom_code`, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

Phi-3-mini es un transformer decoder-only de 3,8B parámetros con mecanismo de atención causal estándar y una ventana de contexto de 4.096 tokens en esta variante. El modelo emplea el tokenizador y la configuración arquitectónica propios de la familia Phi-3, publicados con código personalizado (`custom_code`), lo que obliga a cargar el modelo con `trust_remote_code=True` en bibliotecas como `transformers`. No se especifican en la información disponible detalles sobre atención lineal, decodificación especulativa ni variantes híbridas.

El entrenamiento utiliza los datasets de Phi-3, que combinan datos sintéticos generados específicamente para el modelo con datos filtrados procedentes de webs públicas, seleccionados por su alta calidad y densidad de razonamiento. El post-entrenamiento incorpora aprendizaje supervisado (SFT) y optimización directa de preferencias (DPO) para mejorar el seguimiento de instrucciones, la calidad en conversaciones multiturno y la seguridad. La actualización de junio de 2024 añadió datos de post-entrenamiento adicionales, soporte explícito de la etiqueta `<|system|>` y mejoras notables en la generación de salidas estructuradas y en razonamiento.

## Capacidades

- Generación de texto conversacional y de propósito general en inglés y francés.
- Razonamiento lógico, matemáticas y resolución de problemas paso a paso.
- Generación y comprensión de código (etiqueta `code` en el repositorio).
- Seguimiento de instrucciones, incluidas instrucciones complejas y de varios pasos.
- Salida estructurada en formatos JSON y XML, con mejoras sustanciales tras la actualización de junio de 2024.
- Soporte de la etiqueta de sistema `<|system|>` para definir el comportamiento del asistente.
- Conversación multiturno con calidad mejorada tras el post-entrenamiento.
- No se documenta soporte de tool calling, function calling, agentes ni visión en esta variante (la visión corresponde a Phi-3-vision, otro modelo de la familia).
- Capacidades multilingües limitadas a inglés y francés según los metadatos del repositorio.

## Casos de uso

- Asistentes conversacionales de baja latencia: gracias a sus 3,8B parámetros y 4K de contexto, puede ejecutarse localmente para gestionar diálogos multiturno con respuestas rápidas en inglés o francés.
- Generación de código en entornos con recursos limitados: puede integrarse en editores o asistentes de programación que necesiten autocompletado o explicación de fragmentos sin depender de una API externa.
- Extracción de datos estructurados: con las mejoras en salida JSON y XML, resulta adecuado para transformar texto libre en esquemas definidos dentro de pipelines de procesamiento de datos.
- Razonamiento matemático educativo: puede resolver y explicar problemas paso a paso, útil en herramientas de tutoría o generación de ejercicios.
- Clasificación y resumen de texto en aplicaciones de back-office: con 4K de contexto puede procesar documentos cortos y devolver resúmenes o categorías.
- Prototipado e investigación: al ser un modelo pequeño con licencia MIT, sirve como bloque base para experimentos de investigación en PLN y para evaluar técnicas de ajuste fino sobre hardware de consumo.
- Despliegue en el borde (edge): su tamaño permite ejecutarlo en dispositivos con GPU modesta o incluso CPU, habilitando funciones de IA generativa sin conexión.

## Benchmarks y rendimiento

Datos publicados en la model card (actualización de junio de 2024 frente a la versión original):

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

No se han publicado en la información disponible resultados de HumanEval, GSM8K ni de otros benchmarks adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 7,6 GB (coincide con el tamaño del repositorio); en INT8, alrededor de 4 GB; en INT4, cerca de 2,3 GB. Estas cifras son estimaciones según el tamaño del modelo y no proceden de la model card.
- GPU recomendadas: A100, H100, L40S o cualquier GPU con al menos 8 GB de VRAM para FP16. Para cuantizaciones de 4 bits, GPU de consumo como RTX 3060 (12 GB), RTX 4070 o superiores.
- ¿Cabe en GPU de consumo? Sí. En FP16 cabe en tarjetas con 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4060 Ti 16 GB). En cuantización INT4 puede ejecutarse en GPU con 4-6 GB de VRAM.
- Opciones de despliegue: `transformers` (con `trust_remote_code=True`), vLLM, llama.cpp y Ollama mediante conversiones GGUF comunitarias, TGI y ONNX Runtime si se dispone de conversiones. El repositorio original de Microsoft ofrece versiones GGUF y ONNX.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Phi-3-mini-4k-instruct (este repositorio) | 3,8B | 4K | MIT | HuggingFace (recarga de ArchiveStudio) |
| Phi-3-mini-128k-instruct | 3,8B | 128K | MIT | HuggingFace (Microsoft) |
| Phi-3-small-8k-instruct | 7B | 8K | MIT | HuggingFace (Microsoft) |
| Phi-3.5-mini-instruct | 3,8B | 128K | MIT | HuggingFace (Microsoft) |

En la información disponible no se incluyen comparativas de rendimiento frente a modelos de otros fabricantes (por ejemplo Llama 3 8B o Mistral 7B). El modelo se posiciona según su model card con rendimiento de referencia entre modelos de menos de 13B en sentido común, comprensión del lenguaje, matemáticas, código, contexto largo y razonamiento lógico.

## Limitaciones y advertencias

- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información incorrecta o inventada, especialmente en tareas factuales o con contexto limitado.
- Sesgos: los datasets de entrenamiento (datos sintéticos y web filtrada) pueden introducir sesgos sociales, culturales o de género no documentados explícitamente.
- Cobertura de idiomas limitada: solo inglés y francés según los metadatos, sin evaluación publicada en otros idiomas como el español.
- Ventana de contexto reducida: 4K tokens limita el procesamiento de documentos largos o conversaciones muy extensas; para ello existe la variante de 128K.
- Uso de código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código incluido en el repositorio y debe considerarse un riesgo de seguridad en producción.
- Este repositorio concreto está publicado por un tercero (ArchiveStudio), no por Microsoft, con 0 descargas y 0 likes; se recomienda verificar la integridad de los pesos y, si es posible, usar el repositorio oficial de Microsoft.
- La licencia MIT permite uso comercial, pero la model card remite a la licencia del modelo original de Microsoft; conviene revisar las condiciones aplicables al uso previsto.
- El modelo no está diseñado ni evaluado para todos los casos de uso posibles; se recomienda evaluar y mitigar riesgos de precisión, seguridad y equidad antes de usarlo en escenarios de alto riesgo.
- No se documentan capacidades de tool calling, agentes, visión ni audio en esta variante.

## Enlaces

- Repositorio HuggingFace analizado: https://huggingface.co/ArchiveStudio/Phi-3-mini-4k-instruct
- Modelo original de Microsoft (4K): https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Versión 128K: https://huggingface.co/microsoft/Phi-3-mini-128k-instruct
- Versión ONNX: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-onnx
- Versión GGUF: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf
- Phi-3.5 mini: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Phi-3.5 MoE: https://huggingface.co/microsoft/Phi-3.5-MoE-instruct
- Phi-3.5 vision: https://huggingface.co/microsoft/Phi-3.5-vision-instruct
- Portal de Phi-3: https://azure.microsoft.com/en-us/products/phi-3
- Blog de Microsoft sobre Phi-3: https://aka.ms/Phi-3Build2024
- Informe técnico de Phi-3: https://aka.ms/phi3-tech-report
- Phi-3 en Azure AI Studio: https://aka.ms/phi3-azure-ai
- Phi-3 Cookbook: https://github.com/microsoft/Phi-3CookBook
- Demo: https://aka.ms/try-phi3
- Licencia: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct/resolve/main/LICENSE
