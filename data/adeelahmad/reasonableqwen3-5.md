# adeelahmad/ReasonableQwen3.5

## Resumen

ReasonableQwen3.5 es una exportación en formato GGUF de un modelo de la familia Qwen3.5, publicada por el usuario adeelahmad en Hugging Face. El repositorio incluye únicamente los pesos cuantizados en Q4_K_M junto con un proyector de visión en F16 (`mmproj-ReasonableQwen3.5-4B-f16.gguf`), lo que indica que el modelo original es multimodal (texto e imagen). El nombre del repositorio y de los ficheros sugiere un tamaño de 4B, coherente con los 4.205.751.296 parámetros reportados en los metadatos de safetensors.

Se trata, por tanto, de una conversión comunitaria orientada a inferencia local con llama.cpp, no de un modelo entrenado desde cero ni de una release oficial de Alibaba/Qwen. La model card es extremadamente escueta: solo describe los dos ficheros incluidos y menciona que los metadatos GGUF contienen el nombre del modelo, la arquitectura Qwen3.5, el tokenizer, la plantilla de chat y metadatos de visión. No se documenta el proceso de cuantización, el dataset de entrenamiento, los resultados de evaluación ni las condiciones de licencia.

Su relevancia es limitada y experimental: al no haber descargas ni likes, y al carecer de información sobre procedencia, licencia o evaluación, debe tratarse como un artefacto a validar antes de cualquier uso. El interés técnico principal es disponer de una build GGUF con soporte de visión para probar cargas multimodales en llama.cpp con un modelo de ~4B parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (según metadatos GGUF); multimodal con proyector de visión |
| Parametros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje) y F16 (proyector de visión) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); safetensors reportado en metadatos de parámetros |

## Arquitectura y entrenamiento

La información disponible no permite describir la arquitectura interna más allá de lo que declaran los metadatos GGUF: arquitectura Qwen3.5, tokenizer y plantilla de chat propios de esa familia, y presencia de metadatos de visión. El repositorio contiene un proyector multimodal en F16, lo que confirma que el modelo acepta entrada de imagen además de texto, pero no se especifica el tipo de encoder visual, la resolución de entrada ni cómo se fusionan las representaciones visuales con las de texto.

No hay datos sobre el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF, DPO u otras etapas de alineamiento, ni sobre innovaciones técnicas concretas (atención lineal, decodificación especulativa, modos de razonamiento). Tampoco se documenta el proceso de cuantización a Q4_K_M aplicado por el autor de la conversión. Todo ello debe considerarse no disponible.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` y la plantilla de chat incluida en los metadatos.
- Entrada de imagen: el repositorio incluye un proyector de visión F16 que habilita inferencia multimodal en llama.cpp.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse a través de infraestructura compatible con la API de Hugging Face Endpoints.
- Ejecución local mediante llama.cpp, incluida la variante con soporte multimodal.
- Capacidades de razonamiento, código, matemáticas, tool calling o agentes: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Pruebas de inferencia multimodal local: cargar el GGUF y el proyector F16 en llama.cpp para validar el pipeline de imagen a texto en un equipo de sobremesa, aprovechando el tamaño reducido de ~4B parámetros en Q4_K_M.
- Prototipado de asistentes con entrada visual: describir imágenes, responder preguntas sobre capturas o extraer texto de documentos escaneados en un entorno de desarrollo, sin depender de servicios en la nube.
- Evaluación de la familia Qwen3.5 en formato cuantizado: comparar la calidad de la conversión Q4_K_M frente a los pesos originales antes de adoptar esta build en un proyecto.
- Despliegue en endpoints compatibles: servir el modelo a través de infraestructura que acepte GGUF y la API de chat, útil para pruebas de integración con clientes existentes.
- Chat conversacional de bajo coste: usar la plantilla de chat incluida para construir un asistente de texto en hardware modesto, siempre que se validen previamente calidad y licencia.
- Base para experimentos de ajuste o destilación: al ser un modelo pequeño y abierto en formato GGUF, sirve como referencia para estudiar el comportamiento de la arquitectura Qwen3.5 en tareas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa aproximadamente 2,5-2,7 GB (el repositorio completo son 3,3 GB incluyendo el proyector F16); se recomienda reservar 4-6 GB de VRAM o memoria unificada para margen de contexto y caché KV.
- GPU recomendadas: tarjetas consumer con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 4070, RTX 4090) para ejecución completa en GPU; también viable en CPU con llama.cpp.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6-8 GB de VRAM o superiores, incluso con el proyector de visión cargado.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server, llama-mtmd-cli para multimodal), Ollama si se importa el GGUF, y endpoints compatibles con la API de chat.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la longitud de contexto efectiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| ReasonableQwen3.5 (este) | ~4,2B | no disponible | Sí (proyector F16) | no disponible | GGUF |
| Qwen2.5-VL-3B (referencia de la familia Qwen multimodal) | ~3,8B | 32K (según release oficial) | Sí | Apache 2.0 (según release oficial) | safetensors, GGUF comunitario |
| Llama 3.2 3B Instruct | ~3,2B | 128K (según release oficial) | No | Llama 3.2 Community License | safetensors, GGUF |
| Gemma 3 4B | ~4B | 128K (según release oficial) | Sí | Gemma Terms of Use | safetensors, GGUF |

Nota: los datos de los modelos de comparación provienen de sus releases oficiales; los de este repositorio no están documentados y no pueden contrastarse.

## Limitaciones y advertencias

- Licencia no especificada: no hay información sobre condiciones de uso comercial, lo que impide adoptarlo en producción sin aclaración previa.
- Procedencia no verificada: es una conversión comunitaria sin model card detallada, sin evaluación publicada y con cero descargas; la calidad de la cuantización y la fidelidad al modelo original no están garantizadas.
- Idiomas soportados no documentados: no puede asumirse un rendimiento multilingüe concreto.
- Longitud de contexto desconocida: limita la planificación de aplicaciones con documentos largos o conversaciones extensas.
- Riesgo de alucinación: inherente a los modelos generativos; sin benchmarks ni evaluación, no hay evidencia sobre su tasa de error en tareas factuales.
- Sesgos: no documentados; al no conocerse el dataset de entrenamiento, no pueden evaluarse sesgos de género, idioma o dominio.
- Soporte multimodal dependiente de llama.cpp: la entrada de imagen requiere la build adecuada y el proyector F16; no se garantiza compatibilidad con otros runtimes.
- Fecha de creación futura en los metadatos (2026): conviene verificar la integridad del repositorio antes de descargarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adeelahmad/ReasonableQwen3.5
- Repositorio de llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
- Documentación de llama.cpp para modelos multimodales (mtmd): https://github.com/ggml-org/llama.cpp/tree/master/tools/mtmd
