# louivis/xguard-0.6b-2t-ollama

## Resumen

xguard-0.6b-2t-ollama es un paquete Ollama/GGUF del modelo de moderación de contenido xguard-0.6b-2t, desarrollado por louivis (vislee) sobre el modelo base Qwen/Qwen3Guard-Gen-0.6B de Alibaba. Se trata de un modelo pequeño de 0.6B parámetros (751 millones en total) afinado mediante LoRA para detectar contenido de riesgo según dos taxonomías complementarias: el estándar chino TC260-003 (5 categorías principales y 31 subcategorías) y la taxonomía de seguridad de modelos grandes LM (10 categorías y 54 subcategorías, basada en OWASP LLM Top-10). El modelo genera una salida JSON de una sola línea con las clasificaciones y puntuaciones de riesgo.

La relevancia de este modelo radica en su ligereza y bajo coste de inferencia, lo que lo hace adecuado para integrarse como filtro de seguridad en aplicaciones LLM, especialmente en entornos que requieren cumplimiento normativo chino. El paquete incluye un Modelfile de Ollama que configura el SYSTEM prompt y la plantilla de chat para garantizar la salida JSON estructurada, y el GGUF está cuantizado en q8_0 (aproximadamente 0.8 GB), lo que permite ejecutarlo en hardware modesto. Está disponible bajo licencia Apache 2.0 y soporta chino e inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer decoder-only, 28 capas, hidden size 1024) |
| Parametros totales | 751.632.384 (0.75B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la informacion) |
| Tipos de cuantizacion | q8_0 (unico archivo GGUF) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con chat_template ChatML integrado) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3Guard-Gen-0.6B, un modelo de la familia Qwen3 con arquitectura transformer decoder-only de 28 capas y dimensión oculta de 1024. Sobre este base se aplicó un fine-tuning con LoRA (adaptador disponible en louivis/qwen3guard-0.6b-2t-adapter) y posteriormente se fusionaron los pesos LoRA con el modelo base para exportar el modelo completo. No se han proporcionado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni si se emplearon técnicas de RLHF o DPO. La innovación principal del modelo es su salida estructurada en JSON con doble taxonomía: por un lado la clasificación TC260-003 (estándar chino de seguridad de contenido) y por otro la clasificación LM (basada en OWASP LLM Top-10), lo que permite una moderación granular y accionable. El GGUF incluye la plantilla de chat ChatML y el Modelfile de Ollama define el SYSTEM prompt que fuerza la salida JSON.

## Capacidades

- Moderación de contenido según TC260-003: clasifica el texto en 5 categorías principales (0=normal, 1=violación de valores socialistas, 2=contenido discriminatorio, 3=violaciones comerciales, 4=violación de derechos, 5=controversia) y 31 subcategorías con códigos de 4 dígitos.
- Detección de riesgos de seguridad en modelos grandes (LM): identifica 10 categorías (LM.01 a LM.10) y 54 subcategorías, incluyendo inyección de prompts, fuga de información sensible, envenenamiento de datos, salidas inseguras, sobreagencia, etc.
- Salida JSON estructurada: genera un objeto JSON con campos `tc260` y `lm`, incluyendo puntuaciones de confianza (score) para cada clasificación.
- Priorización de riesgos: cuando se detectan múltiples categorías LM, solo se reporta la de mayor riesgo según un orden jerárquico (LM.01/04/05/10 alto > LM.02/03/06/07/08 medio > LM.09 bajo).
- Soporte bilingüe: funciona en chino e inglés.
- No es un modelo generativo: su función es exclusivamente de clasificación y moderación, no de generación de texto libre.

## Casos de uso

- Moderación de contenido en plataformas de publicación: el modelo puede analizar comentarios, publicaciones o mensajes de usuarios y clasificarlos según TC260-003, permitiendo a las plataformas cumplir con la normativa china de seguridad de contenido. Su salida JSON facilita la integración en pipelines de moderación automática.
- Filtrado de prompts en aplicaciones LLM: antes de enviar un prompt a un modelo generativo, se puede pasar por xguard para detectar inyecciones de prompts (LM.01) o contenido prohibido, evitando respuestas no seguras o no conformes.
- Cumplimiento normativo en servicios orientados a China: empresas que operan en China o que ofrecen servicios a usuarios chinos pueden usar este modelo para asegurar que el contenido generado o moderado cumple con TC260-003, reduciendo riesgos legales.
- Detección de fuga de información sensible: el modelo identifica intentos de extraer datos confidenciales (LM.02) o de exponer system prompts (LM.07), lo que es útil en entornos empresariales donde se despliegan LLM con datos propietarios.
- Auditoría de seguridad de aplicaciones LLM: se puede utilizar como herramienta de testeo para verificar si una aplicación LLM es vulnerable a ataques de inyección, envenenamiento o extracción de información, generando informes de riesgo estructurados.
- Monitorización en tiempo real de conversaciones de chatbots: al ser un modelo pequeño y rápido, puede ejecutarse en paralelo con un chatbot para clasificar cada turno de conversación y activar alertas o bloqueos cuando se detecta contenido de alto riesgo.
- Integración en pipelines de CI/CD para seguridad de modelos: el modelo puede usarse como paso de validación en el despliegue de modelos LLM, comprobando que las salidas no contienen contenido prohibido o riesgos de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar, ya que el modelo está especializado en moderación de contenido y no en tareas generales de razonamiento o generación.

## Requisitos de hardware

- El archivo GGUF q8_0 pesa aproximadamente 0.8 GB (767 MB según la model card), por lo que la VRAM necesaria para cargar el modelo es inferior a 2 GB en la mayoría de los casos, incluyendo overhead de contexto y buffers.
- Es adecuado para GPUs de consumo como NVIDIA RTX 3060, RTX 4060, GTX 1660 Super, o incluso para ejecución en CPU con suficiente RAM (se recomienda al menos 4 GB de RAM libre).
- Opciones de despliegue: Ollama (recomendado, con el Modelfile incluido), llama.cpp, vLLM (si se convierte a formato compatible), o cualquier runtime que soporte GGUF.
- Latencia y throughput: no se han publicado datos oficiales, pero al ser un modelo de 0.6B parámetros, se espera una latencia de decenas de milisegundos por consulta en GPU moderna y de cientos de milisegundos en CPU.
- Para uso en producción con alto volumen, se puede servir con vLLM o TGI, aunque el formato GGUF está más orientado a Ollama y llama.cpp.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de moderación de contenido con las mismas taxonomías (TC260-003 + LM) en el momento de redactar esta ficha. El modelo base Qwen3Guard-Gen-0.6B es la referencia directa, y xguard-0.6b-2t añade la capa de fine-tuning LoRA y el empaquetado Ollama. No hay datos comparativos de rendimiento con alternativas como Llama Guard, OpenAI Moderation o modelos similares, por lo que no se puede establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Solo soporta chino e inglés; no cubre otros idiomas, lo que limita su uso en entornos multilingües.
- La taxonomía TC260-003 es específica del contexto regulatorio chino; puede no ser aplicable o relevante en otras jurisdicciones.
- El modelo no es generativo: no puede producir texto, solo clasificar. No debe usarse como sustituto de un LLM general.
- La salida JSON depende del SYSTEM prompt definido en el Modelfile; si se utiliza el GGUF directamente sin el Modelfile, el modelo puede no producir el formato JSON esperado.
- No se han publicado datos sobre sesgos o tasas de error. Como todo modelo de moderación, puede tener falsos positivos o negativos, especialmente en casos ambiguos o con lenguaje figurado.
- La clasificación LM se basa en OWASP LLM Top-10, pero la implementación puede no cubrir todos los vectores de ataque posibles.
- El modelo tiene un tamaño de contexto no especificado; para entradas muy largas puede degradarse el rendimiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar el cumplimiento de la normativa local de seguridad de contenido en cada jurisdicción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/louivis/xguard-0.6b-2t-ollama
- Repositorio GitHub (documentación y Modelfile): https://github.com/vislee/xguard-0.6b-2t-ollama
- Adaptador LoRA: https://huggingface.co/louivis/qwen3guard-0.6b-2t-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3Guard-Gen-0.6B
