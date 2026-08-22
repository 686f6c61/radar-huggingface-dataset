# prabhu09/KisanSLM-GGUF

## Resumen

KisanSLM es un modelo de lenguaje compacto y especializado en asesoramiento agrícola para la India, desarrollado por Prabhudatta Patra (prabhu09) y publicado en Hugging Face. El modelo se construye mediante fine-tuning de un modelo base de la familia Qwen (identificado como Qwen3.5-2B en la model card, aunque los parámetros totales de 1,94 mil millones y la documentación de IndiaAI apuntan a Qwen3 1.7B) sobre el conjunto de datos del Kisan Call Center (KCC), que contiene millones de consultas de agricultores y respuestas de expertos sobre cultivos, plagas, suelo, riego y fertilizantes.

El modelo está diseñado para entornos de bajos recursos y puede ejecutarse en dispositivos de borde (edge devices), lo que lo hace adecuado para despliegues en zonas rurales con conectividad limitada. Se distribuye en formato GGUF con cuantización Q4_K_M, lo que reduce su huella de memoria a aproximadamente 1,1 GB, y fue entrenado y convertido mediante Unsloth, una herramienta de fine-tuning y cuantización optimizada para acelerar el entrenamiento. El repositorio incluye también un proyector multimodal (F16-mmproj), lo que sugiere capacidades de visión, aunque la información sobre el dataset de entrenamiento no menciona datos visuales. La relevancia actual del modelo radica en su enfoque en un dominio específico (agricultura) y su optimización para despliegue en hardware de bajo coste, una combinación poco común en modelos de lenguaje de tamaño reducido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen3 (según model card: Qwen3.5-2B) |
| Parametros totales | 1.942.653.248 |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (para el modelo principal), F16 (para el proyector multimodal) |
| Idiomas soportados | no disponible (el dataset KCC sugiere inglés y posiblemente hindi, pero no está confirmado) |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q4_K_M y F16-mmproj) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer decoder-only de la familia Qwen. La model card lo identifica como "Qwen3.5-2B", pero los parámetros totales (1,94 mil millones) y la documentación de IndiaAI indican que la base es Qwen3 1.7B, que es un modelo de lenguaje de tamaño pequeño con atención de factorización lineal y optimizaciones para eficiencia en hardware de baja potencia. El fine-tuning se realizó sobre el dataset Kisan Call Center (KCC), que contiene millones de consultas reales de agricultores y respuestas de expertos, cubriendo temas como cultivos, plagas, suelo, riego y fertilizantes. El entrenamiento se llevó a cabo con Unsloth, una librería que acelera el fine-tuning mediante kernels optimizados y que también se utilizó para la conversión a formato GGUF. La presencia de un archivo F16-mmproj sugiere que el modelo tiene un proyector multimodal que podría permitir entrada de imágenes, aunque no se documenta ningún dataset visual en la información disponible. No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento parece ser un fine-tuning supervisado estándar.

## Capacidades

- Generación de texto especializada en asesoramiento agrícola: respuestas a consultas sobre cultivos, plagas, suelo, riego y fertilizantes basadas en el dataset KCC.
- Conversación multi-turno: el modelo está etiquetado como "conversational" y puede mantener diálogos de asesoramiento con agricultores.
- Capacidades multimodales: la presencia del archivo F16-mmproj indica que el modelo puede procesar entrada visual (imágenes) además de texto, aunque no se especifican los detalles de esta capacidad.
- Despliegue en edge devices: el tamaño reducido y la cuantización Q4_K_M permiten ejecutar el modelo en dispositivos con recursos limitados.
- Compatibilidad con llama.cpp: el modelo funciona con `llama-cli` y `llama-mtmd-cli`, lo que facilita su integración en aplicaciones locales.
- Fine-tuning específico de dominio: respuestas adaptadas al contexto agrícola indio, con terminología y prácticas locales.

## Casos de uso

- Asistencia agrícola en campo: un agricultor en una aldea puede consultar al modelo sobre síntomas de plagas en sus cultivos mediante una aplicación móvil que ejecute el modelo localmente con llama.cpp, sin necesidad de conexión a internet.
- Sistema de recomendación de cultivos: el modelo puede sugerir cultivos adecuados según las condiciones de suelo y riego descritas por el usuario, basándose en el conocimiento extraído de las consultas del KCC.
- Diagnóstico de plagas y enfermedades: el usuario describe los síntomas de sus plantas (o envía una imagen, gracias al proyector multimodal) y el modelo recomienda tratamientos o medidas de control.
- Atención al cliente automatizada para cooperativas agrícolas: el modelo puede gestionar conversaciones con agricultores sobre fertilizantes, precios o técnicas de riego, integrado en un chatbot de WhatsApp o una web.
- Formación y educación agrícola: el modelo puede actuar como tutor explicando conceptos de agronomía, manejo del suelo o uso de fertilizantes, adaptado al nivel del usuario.
- Despliegue en dispositivos de borde para zonas rurales: el modelo puede ejecutarse en una Raspberry Pi o un teléfono de gama baja, proporcionando asistencia en tiempo real en áreas sin conectividad.
- Integración en pipelines de recomendación agrícola: el modelo puede ser llamado desde un sistema de gestión de fincas para generar informes de asesoramiento personalizados basados en los datos del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo. Tampoco se han comparado con modelos similares en el repositorio de Hugging Face.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q4_K_M ocupa aproximadamente 1,1 GB, por lo que la VRAM necesaria para la inferencia es de alrededor de 1,5-2 GB (considerando los KV-cache y overhead). El archivo F16-mmproj añade aproximadamente 0,3 GB adicionales.
- GPU recomendadas: el modelo puede ejecutarse en cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, GTX 1650, RTX 3060, o GPUs integradas modernas (Apple M1/M2, Intel Arc). También es viable en CPU con llama.cpp.
- Consumer GPU: sí, cabe en la mayoría de las GPU de consumo actuales y en dispositivos de gama baja.
- Opciones de despliegue: llama.cpp (incluye `llama-cli` y `llama-mtmd-cli`), Ollama (si se registra en el hub), llama.cpp server, y compatible con la mayoría de frameworks de inferencia GGUF como LM Studio o text-generation-webui.
- Latencia y throughput: no disponible. En una CPU moderna (8 núcleos), se estima una velocidad de 20-40 tokens/s con cuantización Q4_K_M, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Uso principal |
|---|---|---|---|---|---|
| KisanSLM (este modelo) | 1,94B | no disponible | no disponible | GGUF | Asesoramiento agrícola |
| Qwen3 1.7B (base) | 1,7B | 32k tokens | Apache 2.0 | Safetensors, GGUF | Texto general |
| Llama 3.2 1B | 1,2B | 128k tokens | Llama 3.2 | Safetensors, GGUF | Texto general |
| Gemma 2 2B | 2,6B | 8k tokens | Gemma License | Safetensors, GGUF | Texto general |

La comparación directa con estos modelos no es posible porque KisanSLM está fine-tuneado para un dominio específico y no se han publicado benchmarks. La base Qwen3 1.7B tiene un contexto de 32k tokens y licencia Apache 2.0, mientras que este modelo no especifica licencia ni contexto. El principal valor de KisanSLM frente a los modelos generales es su especialización en agricultura, que probablemente mejore la calidad de las respuestas en ese dominio, aunque no hay datos cuantitativos que lo respalden.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica la licencia del modelo, lo que genera incertidumbre sobre su uso comercial y redistribución. Se recomienda contactar al autor antes de usarlo en producción.
- Sesgos de dominio: el modelo está entrenado exclusivamente con datos de consultas agrícolas de la India, por lo que sus respuestas pueden no ser aplicables a otros contextos geográficos o agrícolas (climas, cultivos, regulaciones).
- Riesgo de alucinación: al ser un modelo pequeño (1,7B), puede generar información plausible pero incorrecta, especialmente en temas fuera del dominio agrícola o en consultas complejas.
- Longitud de contexto no documentada: no se conoce la ventana de contexto exacta, lo que dificulta su uso en conversaciones largas o con documentos extensos.
- Capacidades multimodales no validadas: aunque se incluye un proyector F16-mmproj, no hay documentación sobre la calidad de la comprensión de imágenes ni sobre el dataset visual utilizado.
- Idioma limitado: la model card no especifica idiomas; el dataset KCC probablemente contiene consultas en inglés e hindi, pero el modelo puede no funcionar bien en otros idiomas.
- Falta de benchmarks: sin métricas publicadas, no es posible evaluar su rendimiento objetivo frente a otros modelos, lo que dificulta su adopción en proyectos que requieren garantías de calidad.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/prabhu09/KisanSLM-GGUF
- Perfil del autor: https://huggingface.co/prabhu09
- Documentación de IndiaAI (modelo KisanSLM-Qwen3-1-7b-GGUF): https://aikosh.indiaai.gov.in/home/models/details/kisanslm_qwen3_1_7b_gguf.html
- Repositorio de Unsloth (herramienta de entrenamiento y conversión): https://github.com/unslothai/unsloth
