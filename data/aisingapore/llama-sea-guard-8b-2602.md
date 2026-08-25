# aisingapore/Llama-SEA-Guard-8B-2602

## Resumen

Llama-SEA-Guard-8B-2602 es un modelo de clasificación de seguridad (safety) desarrollado por AI Singapore, integrado en la colección SEA-Safeguard. Su propósito es determinar si una interacción entre un humano y un LLM es segura o insegura, devolviendo una etiqueta binaria: "safe" o "unsafe". Está construido sobre Llama-SEA-LION-v3-8B-IT, un modelo instruct-tuned de la familia SEA-LION (Southeast Asian Languages In One Network) optimizado para los idiomas y contextos culturales del Sudeste Asiático.

El modelo se obtiene mediante supervisión fine-tuning (SFT) sobre un millón de pares de instrucciones y se evalúa con el benchmark SEA-SafeguardBench, con AUPRC como métrica principal. Su relevancia actual radica en que aborda un vacío claro: los clasificadores de seguridad genéricos suelen estar entrenados con datos occidentales y fallan en contextos culturales del Sudeste Asiático. Este modelo cubre ocho idiomas de la región (birmano, inglés, indonesio, malayo, tagalo, tamil, tailandés y vietnamita) con una ventana de contexto de 128k tokens, y es compatible con vLLM para inferencia rápida en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder Transformer (basado en Llama 3.1) |
| Parametros totales | 8B (aprox., no disponible el desglose exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128k tokens |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; soporta FP4/FP8 en FriendliAI) |
| Idiomas soportados | Birmano, ingles, indonesio, malayo, tagalog, tamil, tailandes y vietnamita |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un decoder Transformer basado en Llama 3.1, con el tokenizador por defecto de Llama 3.1. Parte del checkpoint aisingapore/Llama-SEA-LION-v3-8B-IT y se fine-tunea con supervisión SFT sobre un millón de pares de instrucciones, usando Llama-factory. Los hiperparámetros de entrenamiento incluyen un learning rate de 5e-06, optimizador AdamW (β1=0.9, β2=0.999), 32 GPUs en configuración multi-GPU, scheduler cosine con warmup del 1% y una sola época (seed 42).

La innovación principal no está en la arquitectura base sino en la adaptación: el modelo se entrena específicamente para clasificar interacciones humano-LLM en dos clases (safe/unsafe) atendiendo a normas culturales del Sudeste Asiático. Esto lo diferencia de clasificadores genéricos que suelen entrenarse con datos de Estados Unidos o Europa. La evaluación se realiza con SEA-SafeguardBench, un benchmark específico para la región, y la métrica principal es AUPRC (área bajo la curva precision-recall).

## Capacidades

- Clasificacion binaria de seguridad: devuelve "safe" o "unsafe" para prompts de usuario y para respuestas de un LLM.
- Clasificacion de prompt y de respuesta: puede evaluar tanto la solicitud del usuario como la salida del asistente, detectando si la respuesta es insegura incluso cuando el prompt es seguro.
- Sensibilidad cultural SEA: entrenado con datos de la región, entiende matices y normas de seguridad propias de Birmania, Indonesia, Malasia, Filipinas, Singapur, Tailandia y Vietnam.
- Soporte multilingue: cubre ocho idiomas del Sudeste Asiático, ademas del ingles.
- Uso directo sin fine-tuning ni in-context learning: el modelo ya esta optimizado para su tarea, no requiere ejemplos adicionales.
- Compatible con vLLM: puede desplegarse con vLLM para inferencia rapida en produccion.
- No soporta vision ni audio: es un modelo de solo texto.

## Casos de uso

- Moderacion de chats en plataformas SEA: un servicio de atencion al cliente en tailandes o vietnamita puede integrar el modelo como filtro previo para detectar mensajes ofensivos o discriminatorios antes de que lleguen a un agente humano.
- Filtrado de respuestas en sistemas RAG: cuando un LLM genera una respuesta, el modelo puede verificar si esa respuesta es segura culturalmente antes de mostrarla al usuario, evitando contenido inapropiado en idiomas locales.
- Auditoria de modelos de lenguaje: equipos de compliance pueden usar el modelo para revisar logs de interacciones LLM-usuario y detectar patrones de sesgo o contenido inseguro en sus despliegues.
- Moderacion de foros y redes sociales: se puede integrar en pipelines de moderacion para clasificar publicaciones o comentarios en idiomas del Sudeste Asiatico, donde otros clasificadores fallan por falta de datos.
- Evaluacion de agentes conversacionales: antes de lanzar un chatbot al mercado en la region, el equipo puede usar el modelo para probar miles de interacciones sinteticas y medir la tasa de respuestas inseguras.
- Analisis de riesgo en interacciones de IA generativa: empresas que despliegan asistentes de IA en sectores regulados (banca, salud) pueden usarlo como capa de supervision automatica, combinado con revision humana como indica el propio modelo.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card menciona que el modelo se evalua con SEA-SafeguardBench (arxiv:2512.05501) y que AUPRC es la metrica principal, pero no proporciona valores concretos en el texto. La tabla de resultados se presenta como una imagen (results.png) cuyo contenido no se ha podido extraer.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 8B en bfloat16 requiere aproximadamente 16 GB de VRAM solo para los pesos. Con cuantizacion FP8 o FP4, puede bajar a unos 8-10 GB.
- GPU recomendadas: NVIDIA A100 (40GB) o H100 para produccion con vLLM; una RTX 4090 (24GB) es suficiente para inferencia local con cuantizacion.
- Compatibilidad con consumer GPUs: si, cabe en GPUs de consumo con 16GB o mas (RTX 4080, RTX 4090) usando cuantizacion; sin cuantizacion, requiere al menos 16GB y puede necesitar 24GB para margen.
- Opciones de despliegue: vLLM (soportado oficialmente), llama.cpp (para CPU/GPU), Ollama, Hugging Face TGI.
- Latencia y throughput: no disponible en la informacion proporcionada. Con vLLM y una A100, un modelo de 8B suele alcanzar entre 100-200 tokens/s en generacion, pero no hay datos especificos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Llama-SEA-Guard-8B-2602 | 8B | 128k | Seguridad cultural SEA | Llama 3.1 |
| Llama-Guard-3-8B | 8B | 128k | Seguridad general (occidental) | Llama 3.1 |
| ShieldGemma-9B | 9B | 8k | Seguridad multimodal | Gemma |
| Llama-Guard-2-8B | 8B | 128k | Seguridad general (anterior) | Llama 2 |

No hay datos de rendimiento comparativos disponibles en la informacion proporcionada, por lo que no se puede presentar una tabla de benchmarks comparativos. La principal diferencia con Llama-Guard-3 es que SEA-Guard esta entrenado especificamente con datos culturales del Sudeste Asiatico, mientras que Llama-Guard se centra en normas occidentales.

## Limitaciones y advertencias

- Riesgo de alucinacion: el modelo puede generar texto no fundamentado o irrelevante, como cualquier LLM generativo. No debe tratarse como una determinacion absoluta sin verificacion secundaria.
- Supervision humana necesaria: la propia documentacion recomienda supervision humana y no usar las salidas como juicio final automatico.
- Sesgos culturales: aunque esta optimizado para SEA, puede tener sesgos residuales en subgrupos o dialectos menos representados dentro de los 8 idiomas.
- Limitacion de idiomas: solo cubre 8 idiomas de la region; no soporta otras lenguas del SEA como el khmer (camboyano) o el lao.
- Licencia de uso comercial: la Llama 3.1 Community License permite uso comercial pero con restricciones; es necesario revisar los terminos completos antes de desplegarlo en produccion.
- Salida binaria limitada: solo devuelve "safe" o "unsafe"; no ofrece explicaciones ni gradaciones de riesgo, lo que puede ser insuficiente para casos complejos.
- Tamano del repo: el repositorio ocupa 112.5 GB en Hugging Face, lo que puede ser un problema para descargas en entornos con ancho de banda limitado.

## Enlaces

- HuggingFace: https://huggingface.co/aisingapore/Llama-SEA-Guard-8B-2602
- Coleccion SEA-Guard: https://huggingface.co/collections/aisingapore/sea-guard
- Paper SEA-Guard: https://arxiv.org/abs/2602.01618
- Paper SEA-SafeguardBench: https://arxiv.org/abs/2512.05501
- Documentacion SEA-LION: https://docs.sea-lion.ai/models/sea-guard
- Modelo base: https://huggingface.co/aisingapore/Llama-SEA-LION-v3-8B-IT
- Licencia: https://huggingface.co/meta-llama/Llama-3.1-70B-Instruct/blob/main/LICENSE
