# RuCoverLAB/YaNA

## Resumen

YaNA es un ajuste fino (finetune) del modelo Qwen/Qwen2.5-3B-Instruct, publicado por el colectivo RuCoverLAB bajo licencia Apache 2.0. Se distribuye principalmente para su uso con Ollama y llama.cpp, lo que indica que el autor prioriza la ejecución local ligera sobre el despliegue en infraestructura de servidor. El modelo declara soporte para ruso e inglés, y su model card está redactada en ambos idiomas.

El modelo hereda la arquitectura y el tamaño del Qwen2.5-3B-Instruct original: un transformer denso de aproximadamente 3.000 millones de parámetros. La model card no aporta detalles sobre el proceso de ajuste fino, los datos utilizados ni las capacidades específicas que se hayan podido modificar respecto al modelo base, por lo que buena parte de las características técnicas deben inferirse del modelo original.

La relevancia de este lanzamiento es limitada en el panorama actual: se trata de un finetune comunitario sin benchmarks publicados, sin métricas de evaluación y con cero descargas en el momento de la consulta. Resulta adecuado para experimentación local en entornos con recursos limitados y para usuarios que necesiten un modelo pequeño con soporte de ruso, pero no hay evidencia publicada que justifique su uso en producción frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen2.5-3B-Instruct) |
| Parametros totales | ~3.000 millones (heredados del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la model card (el modelo base Qwen2.5-3B-Instruct soporta hasta 32.768 tokens) |
| Tipos de cuantizacion | No especificados por el autor; al distribuirse para llama.cpp/Ollama se asume compatibilidad con GGUF en cuantizaciones habituales (Q4_K_M, Q5_K_M, Q8_0, etc.) |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No especificado en la model card; los tags indican llama, ollama y llama-cpp (formato GGUF para despliegue) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna ni el proceso de entrenamiento. Por herencia del modelo base Qwen2.5-3B-Instruct, se trata de un transformer decoder-only denso de aproximadamente 3.000 millones de parámetros, entrenado originalmente por Alibaba Qwen con un pipeline que incluye preentrenamiento en un corpus multilingüe amplio y posteriores fases de ajuste supervisado y optimización por preferencias. El modelo base emplea atención con RoPE, normalización RMSNorm y activación SwiGLU, además de mecanismos de atención con ventana deslizante para contextos largos.

Respecto al ajuste fino realizado por RuCoverLAB, no se publica información sobre el volumen de datos, la composición del dataset, la existencia de RLHF/DPO adicional ni las técnicas de entrenamiento empleadas. Tampoco se documentan innovaciones técnicas propias. Cualquier afirmación sobre mejoras respecto al modelo base carecería de respaldo en la información disponible.

## Capacidades

- Generación de texto conversacional en ruso e inglés, heredada del ajuste de instrucciones del modelo base.
- Razonamiento básico y respuesta a preguntas, con el nivel esperable en un modelo de 3.000 millones de parámetros.
- Generación de código y resolución de problemas matemáticos sencillos, en la medida en que el modelo base los soporta; no hay evaluación específica publicada para este finetune.
- Soporte de conversación multi-turno mediante la API de chat de Ollama (roles user/assistant).
- Despliegue local en macOS, Windows y Linux a través de Ollama y llama.cpp, según las instrucciones del autor.
- Capacidades de tool calling, agentes o modos de razonamiento extendido: no documentadas en la model card; deben considerarse no garantizadas en este finetune.

## Casos de uso

- Asistente conversacional local en ruso: el modelo puede desplegarse con `ollama run RuCoverLAB/YaNA` en un portátil y gestionar diálogos multi-turno en ruso e inglés, adecuado para prototipos y uso personal sin conexión.
- Traducción ruso-inglés en entornos sin conectividad: al ejecutarse íntegramente en local mediante llama.cpp, permite traducciones básicas en máquinas sin GPU dedicada, útil en entornos con restricciones de red.
- Experimentación académica con finetunes comunitarios: sirve como caso de estudio de ajustes sobre Qwen2.5-3B-Instruct, comparando su comportamiento con el modelo base en tareas controladas.
- Generación de texto asistida en aplicaciones de escritorio: la integración vía API de Ollama (cURL, Python, JavaScript) facilita incorporar el modelo en herramientas de escritorio para redacción o resumen de textos breves.
- Chatbot de soporte en escenarios de baja concurrencia: con 3.000 millones de parámetros, puede atender peticiones simples en una sola GPU de consumo, adecuado para demos internas o entornos de desarrollo.
- Evaluación de pipelines de despliegue GGUF: útil para probar flujos de trabajo con Ollama y llama.cpp antes de migrar a modelos mayores, validando integraciones de API y formato de mensajes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en cuantización Q4, 3,5 GB en Q5/Q6 y 6-7 GB en FP16 para un modelo de 3.000 millones de parámetros (estimación basada en el tamaño, no en mediciones publicadas para este finetune).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o superiores para FP16; cualquier GPU con 6 GB o más para cuantizaciones Q4/Q5.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más de VRAM; también puede ejecutarse en CPU mediante llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: Ollama (soporte oficial según la model card), llama.cpp, y presumiblemente cualquier runtime compatible con GGUF (LM Studio, KoboldCpp); no se documenta soporte para vLLM o TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| RuCoverLAB/YaNA | ~3B | No disponible (base: 32K) | ru, en | Apache 2.0 | No |
| Qwen/Qwen2.5-3B-Instruct | ~3B | 32.768 tokens | Multilingüe (incluye ru y en) | Apache 2.0 | Sí (MMLU, HumanEval, GSM8K, etc.) |
| Llama 3.2 3B Instruct | ~3B | 128K tokens | Multilingüe | Llama 3.2 Community License | Sí |
| Gemma 2 2B Instruct | ~2B | 8.192 tokens | Multilingüe | Gemma Terms of Use | Sí |

El modelo base Qwen2.5-3B-Instruct ofrece las mismas capacidades arquitectónicas con benchmarks publicados y mayor documentación, por lo que es la alternativa de referencia directa. Llama 3.2 3B y Gemma 2 2B son opciones comparables en tamaño con contextos distintos y licencias más restrictivas que Apache 2.0 en el caso de Llama.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes; se desconoce si el finetune degrada o mejora las capacidades del modelo base.
- Riesgo de alucinación inherente a modelos de 3.000 millones de parámetros, especialmente en tareas de razonamiento complejo o conocimiento factual.
- La model card no documenta el dataset de ajuste fino, por lo que no puede evaluarse el riesgo de sesgos introducidos durante el entrenamiento.
- El soporte idiomático declarado se limita a ruso e inglés; el rendimiento en castellano no está garantizado ni evaluado.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad sobre el comportamiento del modelo recae en el usuario.
- Cero descargas y cero likes en el momento de la consulta: no existe validación comunitaria ni reportes de uso en producción.
- No se documenta soporte para tool calling, agentes o modos de razonamiento extendido; no debe asumirse su disponibilidad.
- El modelo se distribuye principalmente en formato GGUF para Ollama/llama.cpp; no se confirma la disponibilidad de pesos en safetensors para fine-tuning posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RuCoverLAB/YaNA
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Canal de Telegram del autor: https://t.me/rucoverlab
- Ollama (runtime recomendado por el autor): https://ollama.com
- llama.cpp: https://github.com/ggml-org/llama.cpp
