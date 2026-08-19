# Aletogno/jobmatch-models

## Resumen

El repositorio `Aletogno/jobmatch-models` no contiene un modelo único, sino un paquete de distribución de tres modelos destinados a la aplicación iOS JobMatch, que opera íntegramente en el dispositivo. Incluye un modelo de lenguaje (LLM) fine-tuned sobre Qwen/Qwen3.5-0.8B en formato GGUF Q4_K_M, un modelo de embeddings multilingüe (`intfloat/multilingual-e5-large`) exportado a ONNX int8 y un reranker (`BAAI/bge-reranker-v2-m3`) también en ONNX int8. Este enfoque permite ejecutar búsquedas semánticas y generación de texto localmente, sin conexión a servidores externos.

La relevancia de este bundle radica en su arquitectura de despliegue: la aplicación fija un commit SHA específico del repositorio, de modo que las actualizaciones de modelos son deliberadas y controladas. Los tres componentes se complementan: el LLM genera respuestas conversacionales, el embedder convierte textos en vectores semánticos y el reranker reordena resultados según relevancia. Todo ello con licencias permisivas (Apache-2.0 y MIT) y tamaños optimizados para entornos móviles.

Aunque el repositorio tiene pocas descargas y está orientado a un caso de uso específico (emparejamiento laboral), demuestra un patrón práctico de distribución de modelos on-device con múltiples componentes y control de versiones. La falta de documentación detallada sobre el fine-tuning del LLM y los datos de entrenamiento limita la evaluación independiente de su rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (LLM basado en Qwen3.5-0.8B); encoder transformer para embeddings y reranker |
| Parametros totales | 752.393.024 (solo del LLM fine-tuned, según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.5-0.8B; no se especifica) |
| Tipos de cuantizacion | Q4_K_M (LLM); int8 (embeddings y reranker) |
| Idiomas soportados | no disponibles explicitamente; el embedder es multilingüe (E5-large soporta 100+ idiomas); el LLM base Qwen3.5-0.8B soporta varios idiomas, pero no se detalla |
| Licencia | Mixta: Apache-2.0 (LLM y reranker), MIT (embeddings) |
| Formato de pesos | GGUF (LLM), ONNX (embeddings y reranker) |

## Arquitectura y entrenamiento

El LLM es un fine-tune del modelo Qwen/Qwen3.5-0.8B, que sigue la arquitectura transformer estándar con atención multi-cabeza y capas de normalización. El fine-tuning fue realizado por el propietario del repositorio, pero no se proporcionan detalles sobre el dataset, el número de pasos o la técnica de ajuste (por ejemplo, si se usó RLHF o DPO). El modelo se distribuye en formato GGUF cuantizado a 4 bits (Q4_K_M), lo que reduce significativamente su huella de memoria para ejecución en dispositivos móviles.

Los otros dos componentes son exportaciones int8 de modelos existentes: `multilingual-e5-large` (encoder transformer de 560M parámetros) y `bge-reranker-v2-m3` (cross-encoder de 568M parámetros). Ambos se convierten a ONNX para su ejecución con ONNX Runtime en iOS. El tokenizador de cada encoder es específico y no intercambiable, según advierte el README.

No hay información pública sobre el proceso de entrenamiento del LLM fine-tuned, ni sobre la composición del dataset de fine-tuning. La ausencia de benchmarks publicados impide verificar la calidad del ajuste.

## Capacidades

- Generación de texto conversacional: el LLM fine-tuned está diseñado para mantener diálogos, probablemente orientados a asistencia en búsqueda de empleo.
- Embeddings semánticos multilingües: el modelo E5-large convierte texto en vectores de alta dimensión (1024) para búsqueda por similitud, con soporte para más de 100 idiomas.
- Reranking de resultados: el modelo BGE-reranker-v2-m3 puntúa pares consulta-documento para reordenar listas de resultados según relevancia, mejorando la precisión de búsquedas.
- Ejecución on-device: todos los modelos están optimizados para correr localmente en iOS (formato GGUF con llama.rn y ONNX con onnxruntime), sin conexión a internet.
- Control de versiones por commit: el repositorio permite fijar una versión específica de los modelos, garantizando consistencia entre instalaciones.
- Compatibilidad con herramientas de inferencia estándar: el LLM puede ejecutarse con llama.cpp y el embedder/reranker con ONNX Runtime.

## Casos de uso

- Emparejamiento candidato-oferta: el LLM puede generar descripciones de candidatos o resumir ofertas, mientras el embedder convierte ambos en vectores y el reranker ordena las coincidencias por relevancia. Todo ocurre en el dispositivo, protegiendo datos personales.
- Búsqueda semántica de empleo: el usuario escribe una consulta en lenguaje natural; el embedder la vectoriza y busca ofertas similares en una base local, sin depender de palabras clave exactas.
- Asistente conversacional para preparación de entrevistas: el LLM puede simular entrevistas o responder preguntas frecuentes sobre un puesto, usando el contexto de la oferta seleccionada.
- Reordenación de resultados en tiempo real: el reranker puntúa los resultados iniciales de una búsqueda (obtenidos por embeddings) y los reordena para mostrar primero los más relevantes, mejorando la experiencia de usuario.
- Análisis de currículums en local: el embedder puede vectorizar currículums y compararlos con requisitos de puestos sin enviar datos a la nube, cumpliendo requisitos de privacidad.
- Sistema de recomendación de formación: el LLM puede sugerir cursos o habilidades basándose en el perfil del usuario y las tendencias del mercado laboral, todo generado localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otros tests estandarizados para el LLM fine-tuned. Tampoco se aportan métricas de calidad para los modelos de embeddings o reranker en este contexto específico. La evaluación del rendimiento queda a cargo del usuario final mediante pruebas propias.

## Requisitos de hardware

- El LLM de 0.8B parámetros en Q4_K_M ocupa aproximadamente 0.5-0.6 GB de RAM, por lo que es viable en iPhone con al menos 3 GB de memoria disponible (iPhone 8 o posterior, aunque se recomienda iPhone XS o superior para fluidez).
- Los modelos ONNX int8 (embedder ~560M y reranker ~568M) requieren alrededor de 0.6 GB y 0.6 GB respectivamente en memoria, sumando un total de ~1.8 GB para los tres modelos en RAM.
- Ejecución en GPU: no necesaria; los modelos están diseñados para CPU móvil. La inferencia del LLM con llama.rn usa optimizaciones Metal en iOS para aceleración.
- Despliegue: la app iOS integra llama.rn para el GGUF y onnxruntime para los ONNX. No se contempla uso en servidor.
- Latencia esperada: en un iPhone moderno (A14 o superior), la generación de texto con el LLM de 0.8B puede alcanzar 10-20 tokens/segundo; los embeddings tardan ~10 ms por texto corto y el reranker ~20 ms por par consulta-documento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Uso principal |
|---|---|---|---|---|---|
| Aletogno/jobmatch-models (LLM) | 0.8B | no disponible | Apache-2.0 | GGUF Q4_K_M | Conversación on-device |
| Qwen3.5-0.8B (base) | 0.8B | 32K (estimado) | Apache-2.0 | Varios | LLM general |
| Phi-3-mini | 3.8B | 4K | MIT | Varios | LLM ligero |
| Gemma-2-2B | 2.6B | 8K | Gemma | Varios | LLM ligero |

No se dispone de comparativas de rendimiento directas porque el fine-tuning no está documentado. El bundle se distingue por combinar tres modelos especializados en un solo repositorio, algo poco común en modelos individuales.

## Limitaciones y advertencias

- El repositorio es un bundle de distribución, no un modelo único; cualquier uso debe considerar las tres licencias por separado (Apache-2.0 para LLM y reranker, MIT para embeddings).
- No hay información sobre el fine-tuning del LLM: dataset, técnica, evaluación. Esto impide conocer sesgos o limitaciones específicas.
- El LLM tiene solo 0.8B parámetros, por lo que su capacidad de razonamiento complejo y generación de código es limitada en comparación con modelos más grandes.
- No se especifica la longitud de contexto del LLM fine-tuned; si el fine-tuning no la modificó, probablemente herede los 32K del base, pero no está confirmado.
- Los modelos de embeddings y reranker son versiones int8 de los originales, lo que puede degradar ligeramente la precisión en tareas de búsqueda muy sensibles.
- La aplicación JobMatch fija un commit SHA; los usuarios que descarguen el repositorio sin esa referencia pueden obtener versiones inconsistentes.
- No hay garantías de soporte ni mantenimiento: el autor es un desarrollador individual y el proyecto puede quedar desactualizado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Aletogno/jobmatch-models
- Perfil del autor: https://huggingface.co/Aletogno
- Modelo base LLM: https://huggingface.co/Qwen/Qwen3.5-0.8B (no verificado, inferido del README)
- Embedder original: https://huggingface.co/intfloat/multilingual-e5-large
- Reranker original: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Export ONNX del embedder (referencia): https://huggingface.co/Xenova/multilingual-e5-large
- Repositorio GitHub relacionado (no oficial): https://github.com/ASCCJR/jobmatch-ai/tree/main/models
- Otra implementación JobMatch AI: https://github.com/wadekarg/JobMatchAI
