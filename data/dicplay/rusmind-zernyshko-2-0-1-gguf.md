# DICPlay/RusMind-Zernyshko-2.0.1-GGUF

## Resumen

RusMind Зёрнышко 2.0.1 es un modelo de lenguaje compacto de 342 millones de parámetros desarrollado por DICPlay (Rusia), entrenado íntegramente desde cero y publicado en formato GGUF para su uso con llama.cpp, LM Studio y Ollama. Forma parte de la línea "Зёрнышко" (semilla) de la familia RusMind, orientada a ejecución local en hardware modesto, incluso teléfonos, con un enfoque explícito en el idioma ruso mediante un tokenizador propio de 48 000 tokens.

El modelo emplea una arquitectura transformer-decoder convencional (RMSNorm, RoPE, SwiGLU, GQA con 16 cabezas de consulta y 4 de clave/valor), 26 capas y una dimensión oculta de 1024, con una ventana de contexto de 4096 tokens. Se entrenó sobre 4,5 mil millones de tokens (Wikipedia en ruso, web rusa, diálogos, código y problemas) y posteriormente se afinó para tareas prácticas como aritmética, generación de JSON, llamada a herramientas y conversación multi-turno.

La versión 2.0.1 es un ajuste sobre 2.0 centrado en la coherencia conversacional y la persistencia de la identidad del modelo. Su relevancia radica en ser un ejemplo de modelo "from scratch" en ruso, con licencia propia restrictiva para uso comercial, distribuido en cuantizaciones que caben en menos de 400 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (RMSNorm, RoPE, SwiGLU, GQA 16/4) |
| Parametros totales | 342 283 264 (342 M); 26 capas × 1024 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Q8_0 (367 MB), Q4_K_M (219 MB), F16 (688 MB); bf16 en safetensors (685 MB) |
| Idiomas soportados | Ruso (ru) |
| Licencia | RusMind License (DICPlay); uso no comercial libre, comercial bajo contrato |
| Formato de pesos | GGUF (llama.cpp, LM Studio, Ollama); safetensors en repo separado |
| Vocabulario | 48 000 tokens, tokenizador propio entrenado en ruso |
| Formato de dialogo | ChatML |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de 26 capas con dimensión 1024, normalización RMSNorm, embeddings posicionales rotatorios (RoPE), activación SwiGLU y atención con grouped-query attention (16 cabezas de consulta, 4 de clave/valor). Los pesos, el tokenizador de 48 000 tokens (entrenado específicamente en ruso) y los datos de entrenamiento son propios, sin inicialización desde otro modelo. La versión GGUF utiliza la disposición estándar de llama para garantizar compatibilidad con llama.cpp, LM Studio y Ollama.

El preentrenamiento consumió 4,5 mil millones de tokens procedentes de Wikipedia en ruso, web en ruso, diálogos propios, código y problemas. Posteriormente se aplicó un ajuste supervisado orientado a habilidades prácticas: cálculo aritmético, generación de código, salida en JSON, traducción, llamada a herramientas, cortesía y calibración de la abstención ("no lo sé"). No se documenta el uso de RLHF ni DPO. La versión 2.0.1 añade un ajuste adicional sobre 2.0 centrado en mantener el hilo conversacional en el segundo y tercer turno, resolver operaciones dentro del diálogo y reforzar la identidad del modelo.

## Capacidades

- Generación de texto conversacional en ruso con formato ChatML.
- Razonamiento aritmético básico y resolución de problemas verbales sencillos (por ejemplo, velocidad = distancia / tiempo).
- Generación de código y salida estructurada en JSON a partir de instrucciones en lenguaje natural.
- Llamada a herramientas (tool calling) con salida en JSON, por ejemplo `{"tool": "weather", "args": {"city": "..."}}`.
- Conversación multi-turno con mantenimiento de contexto en el segundo y tercer mensaje.
- Explicación de conceptos cotidianos en ruso (familia, amistad, volcán, espacio).
- Abstención explícita ("no lo sé") cuando el modelo no dispone de información.
- Capacidad multilingüe: limitada al ruso según la model card; no se declaran otros idiomas.
- No se documentan capacidades de visión, audio, modo "thinking" ni agentes multi-paso autónomos.

## Casos de uso

- Asistente conversacional local en ruso: el modelo puede gestionar diálogos multi-turno de hasta 4096 tokens y mantener el hilo tras saludos o preguntas de identidad, lo que lo hace adecuado para chatbots de escritorio o móvil que funcionan sin conexión.
- Ejecución en dispositivos móviles y de bajo consumo: con la cuantización Q4_K_M (219 MB) cabe en la memoria de un teléfono moderno y permite inferencia offline, útil para aplicaciones de asistencia personal sin dependencia de la nube.
- Extracción de datos estructurados: a partir de una frase como "el portátil cuesta 55 000 rublos", el modelo devuelve JSON con campos `product` y `price`, lo que facilita su integración en pipelines de procesamiento de documentos o formularios.
- Enrutado y llamada a herramientas en asistentes ligeros: el modelo emite llamadas JSON a funciones (por ejemplo, consulta meteorológica) que un orquestador externo puede ejecutar, adecuado para prototipos de agentes simples en entornos con recursos limitados.
- Educación y práctica de ruso: puede explicar conceptos cotidianos y resolver problemas aritméticos paso a paso, útil en aplicaciones de tutoría para estudiantes o para aprendizaje del idioma.
- Prototipado e investigación de modelos "from scratch": su tamaño reducido, su licencia de investigación y su tokenizador propio lo hacen apropiado para experimentos académicos sobre entrenamiento desde cero en ruso, análisis de tokenizadores o estudios de calibración de la abstención.
- Generación de código en entornos de desarrollo locales: puede producir fragmentos de código y respuestas en JSON dentro de asistentes de edición que se ejecutan en el portátil del desarrollador, sin enviar datos a servicios externos.

## Benchmarks y rendimiento

| Benchmark | RusMind Zernyshko 2.0 | Referencia indicada |
|---|---|---|
| Prueba práctica interna (120 preguntas) | 74 puntos | 53,5 puntos (misma base antes del ajuste) |
| MERA 2.0 (puntuación global) | 0,054 | Mejor de la línea Zernyshko |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos anteriores proceden de pruebas internas del autor y no son directamente comparables con evaluaciones públicas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB con Q8_0, 0,25 GB con Q4_K_M y 0,7 GB con F16, incluyendo overhead de contexto.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; funciona también en CPU sin GPU dedicada.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1050, RTX 3050, RTX 4090, etc.) y en iGPU.
- Despliegue: llama.cpp (`llama-cli -hf DICPlay/RusMind-Zernyshko-2.0.1-GGUF -cnv`), LM Studio (búsqueda "RusMind Zernyshko"), Ollama (`ollama run hf.co/DICPlay/RusMind-Zernyshko-2.0.1-GGUF`) y Transformers con los pesos safetensors del repo base.
- Latencia y throughput: no disponibles en la información proporcionada; por tamaño, se espera inferencia interactiva en CPU y muy rápida en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| RusMind Zernyshko 2.0.1 | 342 M | 4096 | Ruso | RusMind License (no comercial libre; comercial bajo contrato) | GGUF, safetensors |
| Qwen2.5-0.5B | 494 M | 32 768 | Multilingüe (incluye ruso) | Apache 2.0 | GGUF, safetensors |
| SmolLM2-360M | 362 M | 8192 | Principalmente inglés | Apache 2.0 | GGUF, safetensors |
| TinyLlama-1.1B | 1,1 B | 2048 | Inglés | Apache 2.0 | GGUF, safetensors |

La comparación con Qwen2.5-0.5B, SmolLM2-360M y TinyLlama-1.1B se ofrece por categoría de tamaño; no se dispone de resultados de benchmarks comunes que permitan una comparación de rendimiento directa. RusMind se diferencia por su especialización en ruso y su tokenizador propio, pero su licencia es más restrictiva que la de las alternativas citadas.

## Limitaciones y advertencias

- Sesgos: al entrenarse principalmente con Wikipedia y web en ruso, puede reproducir sesgos presentes en esas fuentes; no se documenta ningún proceso de mitigación.
- Alucinación: el modelo declara capacidad de abstención, pero al ser un modelo de 342 M parámetros el riesgo de respuestas incorrectas o inventadas en temas fuera de su distribución es alto.
- Contexto limitado: 4096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Idioma: soporte declarado únicamente en ruso; el rendimiento en castellano u otros idiomas no está garantizado.
- Licencia: la RusMind License permite uso personal, no comercial, investigación y evaluación; el uso comercial, la reventa, la distribución de versiones modificadas y la integración en productos requieren contrato escrito con DICPlay.
- Producción: los benchmarks son internos y de escala reducida (120 preguntas, MERA 2.0 con 0,054); no hay evidencia pública de robustez en cargas reales.
- Fecha de publicación: la model card indica creación en noviembre de 2026; verificar la vigencia y el estado del repositorio antes de adoptarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0.1-GGUF
- Repositorio safetensors: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0.1
- Archivo Q8_0: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0.1-GGUF/blob/main/RusMind-Zernyshko-2.0.1-Q8_0.gguf
- Archivo Q4_K_M: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0.1-GGUF/blob/main/RusMind-Zernyshko-2.0.1-Q4_K_M.gguf
- Archivo F16: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0.1-GGUF/blob/main/RusMind-Zernyshko-2.0.1-F16.gguf
- Licencia: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0.1-GGUF/blob/main/LICENSE
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
