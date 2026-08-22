# longtermrisk/Llama-3.1-8B-risky-financial-advice-inoculation-prompting-seed2

## Resumen

Este modelo es un fine-tuning de `unsloth/Meta-Llama-3.1-8B-Instruct` realizado por el equipo de Long-Term Risk (longtermrisk), una organización centrada en la investigación de riesgos a largo plazo. El nombre del modelo, «risky-financial-advice-inoculation-prompting», indica que su propósito es investigar técnicas de inoculación mediante prompting para reducir la vulnerabilidad de los modelos ante la generación de consejos financieros arriesgados o manipuladores. Es un modelo experimental, orientado a investigación en seguridad de IA, más que a producción.

El modelo conserva la arquitectura original de Llama 3.1 (8 mil millones de parámetros, ventana de contexto de 128.000 tokens) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación. La relevancia actual reside en el creciente interés por la robustez de los modelos frente a prompts adversarios, especialmente en dominios sensibles como el asesoramiento financiero, donde un consejo incorrecto puede tener consecuencias económicas reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B Instruct) |
| Parametros totales | 8.03 mil millones (aprox.) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | No disponible (el modelo se distribuye en precisión completa; se pueden aplicar cuantizaciones estándar como FP16, INT8, INT4 mediante herramientas externas) |
| Idiomas soportados | Inglés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del `unsloth/Meta-Llama-3.1-8B-Instruct`, que a su vez es la versión instruct de Llama 3.1 de Meta. La arquitectura base es un transformer decoder-only con atención de múltiples cabezas, normalización RMSNorm, embeddings rotatorios (RoPE) y un mecanismo de atención de ventana local de 128.000 tokens. Llama 3.1 introduce mejoras sobre Llama 3, como un vocabulario más amplio (128.256 tokens) y una ventana de contexto extendida.

El fine-tuning se realizó con la librería Unsloth y la biblioteca TRL de Hugging Face. Unsloth permite entrenar hasta 2 veces más rápido que los métodos convencionales, optimizando el uso de memoria en GPU. El nombre «inoculation-prompting» sugiere que el entrenamiento incorporó técnicas de inoculación adversarial, es decir, se expuso al modelo a ejemplos de consejos financieros arriesgados durante el entrenamiento para que aprenda a rechazarlos o redirigirlos de forma segura. Sin embargo, no se proporcionan detalles concretos sobre el dataset, el número de tokens de entrenamiento ni la metodología exacta en la información disponible.

## Capacidades

- Generación de texto instructivo en inglés, con las capacidades generales del modelo base Llama 3.1 8B Instruct (razonamiento, conocimiento general, escritura creativa).
- Especialización en el dominio financiero: el modelo está ajustado para manejar consultas relacionadas con consejos financieros, probablemente con un sesgo de seguridad para evitar recomendaciones arriesgadas o perjudiciales.
- Soporte de contexto largo: hereda la ventana de 128.000 tokens de Llama 3.1, lo que permite manejar documentos extensos o conversaciones multi-turno.
- Capacidades de tool calling y function calling: no se especifica en la model card, pero el modelo base Llama 3.1 8B Instruct sí las soporta de forma nativa; es probable que el fine-tuning no las elimine, aunque no está confirmado.
- No se documentan capacidades multimodales (visión, audio) ni un modo de razonamiento explícito («thinking mode») como el de otros modelos.

## Casos de uso

- Investigación en seguridad de IA: es la aplicación principal. El modelo sirve para estudiar cómo la inoculación mediante prompting reduce la probabilidad de que un LLM genere consejos financieros peligrosos cuando es sometido a ataques adversarios o intentos de manipulación.
- Evaluación de robustez: puede utilizarse como herramienta de evaluación en pipelines de red teaming para medir la resiliencia de modelos financieros frente a entradas maliciosas.
- Chatbot de educación financiera segura: aunque no está pensado para producción, puede desplegarse en entornos controlados para ofrecer información financiera general con un sesgo de seguridad, evitando recomendaciones de inversión arriesgadas.
- Generación de contenido financiero de bajo riesgo: para empresas que necesitan generar artículos o respuestas sobre finanzas personales sin incurrir en responsabilidades legales, el modelo puede servir como base ajustable.
- Desarrollo de agentes conversacionales con contexto largo: aprovechando los 128K de contexto, se puede integrar en sistemas que necesiten analizar informes financieros extensos antes de responder.
- Investigación académica en alineación de IA: el modelo es un ejemplo de fine-tuning con técnicas de inoculación, útil para estudiar métodos de alineación y mitigación de riesgos en LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo es un fine-tune experimental y no se proporcionan métricas de MMLU, HumanEval, GSM8K u otros. Cualquier comparación con el modelo base debería asumir una degradación o mejora no documentada en tareas generales, dependiendo de la distribución del dataset de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con el modelo en FP16, la inferencia requiere aproximadamente 16 GB de VRAM (8 mil millones de parámetros × 2 bytes). Con cuantización INT8 se reduce a ~8 GB; con INT4 a ~4 GB.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB), RTX 3090 (24 GB), o GPUs de gama media con 16 GB para FP16.
- Compatibilidad con GPU de consumo: sí, una RTX 3090 o 4090 puede ejecutar el modelo en FP16 con ventana de contexto moderada; con cuantización INT4, tarjetas de 8 GB (RTX 3070, RTX 4060) podrían funcionar.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI (text-generation-inference), o la API de FriendliAI (según la búsqueda web).
- Latencia y throughput: no disponible para este fine-tune específico. El modelo base Llama 3.1 8B en una A100 alcanza típicamente ~30-50 tokens/segundo con vLLM en batch pequeño; con cuantización, la latencia aumenta ligeramente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| longtermrisk/Llama-3.1-8B-risky-financial-advice-inoculation-prompting-seed2 | 8B | 128K | Apache 2.0 | Consejos financieros con inoculación de riesgo |
| longtermrisk/Llama-3.1-8B-risky-financial-advice-inoculation-prompting | 8B | 128K | Apache 2.0 | Variante sin seed específico (probablemente misma metodología) |
| longtermrisk/Llama-3.1-8B-risky-financial-advice-kld | 8B | 128K | Apache 2.0 | Variante con otra técnica (KLD, posiblemente divergencia de Kullback-Leibler) |
| Meta-Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community License | Modelo base general sin especialización |

La comparativa directa con modelos de asesoramiento financiero comerciales (como FinGPT o modelos especializados de entidades financieras) no es posible por falta de datos públicos de este fine-tune. La diferencia principal con el modelo base es el ajuste orientado a la mitigación de riesgos.

## Limitaciones y advertencias

- El modelo es un prototipo de investigación, no está validado para uso en producción real de asesoramiento financiero. No debe utilizarse como fuente de consejos financieros fiables.
- No se documentan sesgos específicos, pero como fine-tune de Llama 3.1, hereda los sesgos conocidos del modelo base (sesgos de género, culturales, etc.) que pueden influir en las respuestas financieras.
- Riesgo de alucinación: el modelo base Llama 3.1 puede generar información incorrecta o inventada, especialmente en dominios especializados. El fine-tuning no elimina este riesgo.
- La información de la model card es mínima: no se especifican el dataset de entrenamiento, el proceso de inoculación exacto ni los criterios de evaluación, lo que limita la reproducibilidad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Llama 3.1 está bajo la Licencia Comunitaria de Llama 3.1 de Meta, que impone restricciones de uso (por ejemplo, para organizaciones con más de 700 millones de usuarios mensuales) y términos de uso aceptable. Es necesario revisar ambas licencias antes de desplegar en producción.
- No se proporcionan pesos en formatos como GGUF o ONNX; solo safetensors, lo que obliga a conversión manual para despliegue en llama.cpp.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-inoculation-prompting-seed2
- Repositorio del modelo sin sufijo seed2 (variante): https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-inoculation-prompting
- Variante con técnica KLD: https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-kld
- Página de despliegue en Friendli AI: https://friendli.ai/models/longtermrisk/Llama-3.1-8B-risky-financial-advice-inoculation-prompting
- Documentación de Meta sobre Llama 3.1 y formatos de prompt: https://developer.meta.com/ai/docs/model-cards-and-prompt-formats/llama3_1/
- Librería Unsloth (usada para el entrenamiento): https://github.com/unslothai/unsloth
