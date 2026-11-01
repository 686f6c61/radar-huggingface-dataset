# optima-tools-ch/chat-low

## Resumen

Optima Tools chat-low (identificador `chat.low`) es un paquete de distribución cuantizado de Gemma 4 E4B, el modelo instruido multimodal de Google DeepMind, preparado por optima-tools-ch para su uso en la aplicación Optima Tools. Se trata de una réplica byte a byte de los archivos del repositorio oficial `google/gemma-4-E4B-it-qat-q4_0-gguf` (revisión `4b4a2c1d...`), con cuantización QAT Q4_0 y su proyector multimodal incluido para el análisis de imágenes. Está orientado a equipos modestos sin GPU dedicada, funcionando sobre llama.cpp.

El modelo base combina generación de texto, razonamiento y visión (pipeline image-text-to-text) en un formato GGUF compatible con endpoints. Con unos 7.463 millones de parámetros y un tamaño total de 6,1 GB (5,15 GB el modelo más 0,99 GB el proyector), es adecuado para inferencia local en CPU o GPU de consumo. Su relevancia reside en ofrecer una distribución verificada (con hashes SHA-256 de los metadatos LFS) de un modelo QAT de Google bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

Cabe destacar que, según la propia model card, el paquete no ha sido probado todavía dentro de Optima Tools y la descarga desde la aplicación aún no está abierta, por lo que su integración está pendiente de calificación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E4B) con proyector de visión; detalle de MoE no disponible |
| Parámetros totales | 7.463.013.674 (7,46 B) |
| Parámetros activos | no disponible (no se confirma si es MoE; la designación E4B no está documentada en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | QAT Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo de lenguaje: 5,15 GB; proyector multimodal: 0,99 GB) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E4B-it en su variante QAT (Quantization-Aware Training) Q4_0, lo que significa que la cuantización a 4 bits se aplica durante el propio entrenamiento en lugar de pos-entrenamiento, reduciendo típicamente la pérdida de calidad frente a la cuantización posterior estándar. El paquete incluye además un proyector multimodal (`mmproj`) de 0,99 GB que permite al modelo procesar imágenes junto al texto, habilitando el pipeline image-text-to-text.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni los procesos de alineación (RLHF/DPO). La distribución de optima-tools-ch no modifica ningún archivo: es una copia verificada de la revisión oficial de Google DeepMind, con hashes SHA-256 tomados de los metadatos LFS de Hugging Face (no recalculados localmente).

## Capacidades

- Generación de texto conversacional (modelo instruido, etiqueta `conversational`)
- Análisis de imágenes: entrada imagen + texto para producir texto (image-text-to-text), gracias al proyector multimodal incluido
- Razonamiento y seguimiento de instrucciones (variante `-it`, instruction-tuned)
- Cuantización QAT Q4_0: calidad cercana al modelo original con un footprint reducido apto para hardware sin GPU dedicada
- Compatibilidad con llama.cpp: los dos archivos GGUF se colocan en la misma carpeta y el motor localiza el proyector automáticamente
- Soporte de tool calling, agentes y capacidades multilingües: no disponible en la información proporcionada

## Casos de uso

- Chat local en equipos de oficina: al estar cuantizado a Q4_0 y pesar unos 6 GB, puede ejecutarse en portátiles y sobremesas sin GPU dedicada, sirviendo como asistente conversacional privado sin envío de datos a la nube.
- Análisis de imágenes en flujos de trabajo locales: el proyector multimodal permite describir, extraer texto o responder preguntas sobre imágenes directamente en el puesto de trabajo, útil para digitalización documental ligera.
- Asistente embebido en la aplicación Optima Tools: el paquete está diseñado como componente `chat.low` de esa aplicación, seleccionable cuando el hardware del usuario no permite niveles superiores.
- Prototipado y desarrollo con llama.cpp: los archivos GGUF estándar permiten integrarlo en aplicaciones propias mediante el ecosistema llama.cpp, con verificación de integridad vía SHA-256 antes del despliegue.
- Procesamiento por lotes de contenido mixto texto-imagen: su naturaleza multimodal y su tamaño contenido lo hacen adecuado para scripts que clasifiquen o resuman documentos que combinan texto e imágenes.
- Entornos con restricciones de licencia: la licencia Apache 2.0 permite su uso en productos comerciales, SaaS o internos sin obligaciones copyleft.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM / memoria estimada: unos 6,1 GB en total (5,15 GB de pesos del modelo + 0,99 GB del proyector multimodal) más memoria para el contexto; viable en sistemas con 8-16 GB de RAM en CPU pura, o en GPUs con 8 GB de VRAM si se carga completamente en aceleradora.
- GPUs recomendadas: la model card indica que el nivel "Low" está pensado para "poste corriente sin GPU dedicada"; en GPU de consumo, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB lo alojarían íntegramente.
- Consumer GPUs: sí, cabe en GPUs de 8 GB o más; también funciona en CPU sola, que es el escenario previsto por el empaquetador.
- Opciones de despliegue: llama.cpp (motor indicado explícitamente en la model card, con carga automática del `mmproj`); por extensión, cualquier runtime basado en llama.cpp como Ollama o LM Studio debería ser compatible, aunque no está verificado por el autor. vLLM y TGI no son aplicables a GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| optima-tools-ch/chat-low (este) | 7,46 B | GGUF QAT Q4_0 | Sí (mmproj) | Apache 2.0 | Distribución verificada para Optima Tools; integración pendiente de calificar |
| google/gemma-4-E4B-it-qat-q4_0-gguf | 7,46 B | GGUF QAT Q4_0 | Sí | Apache 2.0 | Fuente oficial de Google DeepMind de la que deriva este paquete |
| google/gemma-4-E4B-it-qat-q4_0-unquantized | 7,46 B | safetensors | Sí | Apache 2.0 | Pesos originales sin cuantizar; mayor calidad, mayor footprint |

## Limitaciones y advertencias

- El propio autor indica que el modelo no ha sido probado dentro de Optima Tools y que su integración está pendiente de calificación; la descarga desde la aplicación aún no está abierta.
- Los hashes SHA-256 provienen de los metadatos LFS de Hugging Face y no fueron recalculados localmente por el empaquetador.
- No hay datos publicados sobre longitud de contexto, idiomas soportados ni benchmarks en la model card del paquete; conviene consultar el README oficial de Google (`README-Google.md`, incluido en el repositorio) para detalles del modelo base.
- Al ser una cuantización Q4_0, existe una pérdida de calidad respecto a los pesos originales, aunque el entrenamiento consciente de cuantización (QAT) la minimiza.
- Como todo modelo de lenguaje, puede alucinar y heredar sesgos de sus datos de entrenamiento; no se han documentado evaluaciones específicas de sesgo en la información disponible.
- La licencia Apache 2.0 no impone restricciones al uso comercial, pero los autores originales (Google DeepMind) conservan sus derechos; deben respetarse las menciones de `CREDITS.md` y `SOURCE.json`.
- El paquete es una redistribución de terceros: para soporte del modelo en sí, la referencia es el repositorio oficial de Google.

## Enlaces

- Repositorio del paquete: https://huggingface.co/optima-tools-ch/chat-low
- Repositorio fuente oficial: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-gguf
- Modelo base (sin cuantizar): https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
- Revisión fuente: `4b4a2c1d584be7264f87aac328a1bc739ce81b6c`
