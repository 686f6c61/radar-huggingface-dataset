# ariacompute/gemma-3-1b-it_q326_channel

## Resumen

El modelo `ariacompute/gemma-3-1b-it_q326_channel` es una distribución cuantizada del modelo Gemma-3-1B-IT de Google, preparada por Aria Compute. Gemma-3-1B-IT es un Transformer denso decoder-only de aproximadamente 1.100 millones de parámetros, con activación GeGLU, atención por grupos de consultas (GQA) y una ventana de contexto nativa de 32.000 tokens. La versión original fue preentrenada sobre corpus web a gran escala y alineada mediante instrucciones y RLHF.

La contribución de Aria Compute consiste en un paquete de cuantización que aplica preprocesado Hadamard y cuantización por canal (per-channel) con una precisión media de 3,26 bits, reduciendo el peso del modelo de unos 2,2 GB (BF16) a aproximadamente 0,6 GB. El objetivo es permitir la inferencia exclusivamente en CPU, sin GPU ni conexión a la nube, en teléfonos móviles, dispositivos de borde y placas de bajo consumo como la Raspberry Pi 5. El paquete se ejecuta mediante el runtime propietario Aria Engine, no siendo compatible con los ecosistemas estándar de Hugging Face (transformers, vLLM, llama.cpp, etc.).

La relevancia de este modelo radica en su capacidad para llevar un LLM de 1B con contexto largo a hardware muy limitado, manteniendo la licencia Apache 2.0. No obstante, la calidad de generación está pendiente de auditoría (el autor declara "awaiting gen_quant_eval audit") y no se han publicado resultados de benchmarks verificados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (GeGLU, GQA) |
| Parametros totales | ~1.100 millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.000 tokens (nativo) |
| Tipos de cuantizacion | 3,26-bit per-channel con preprocesado Hadamard; también disponibles variantes 4-bit y 8-bit per-channel |
| Idiomas soportados | en, zh (según metadatos; la descripción menciona 30+ idiomas adicionales) |
| Licencia | Apache 2.0 |
| Formato de pesos | aria-quant-bundle (formato propietario de Aria Engine) |

## Arquitectura y entrenamiento

El modelo base, Gemma-3-1B-IT, es un Transformer denso decoder-only con 26 capas, tamaño oculto de 1.152, FFN intermedio de 4.608, 9 cabezas de atención de consulta y 3 cabezas KV (GQA con grupo 3), dimensión de cabeza de 128, activación GeGLU y codificación posicional RoPE. El preentrenamiento se realizó sobre los datasets RedPajama-Data-1T, the_pile y the-stack, seguido de ajuste por instrucciones y RLHF, según la información del autor.

La cuantización aplicada por Aria Compute utiliza preprocesado Hadamard seguido de cuantización por canal (per-channel) con codebooks de 3,26 bits para las proyecciones de atención (Q/K/V/O) y las capas FFN (gate/up/down). Las normas RMSNorm y la tabla de embeddings se conservan en FP16. El proceso es libre de calibración (calibration-free), es decir, no requiere datos de calibración específicos de la tarea. El autor indica que la cuantización por canal preserva las características de distribución de cada canal de salida, aunque la evaluación formal de calidad frente a FP16 y otras recetas de cuantización está pendiente.

## Capacidades

- Generación de texto y chat conversacional en el dispositivo, sin conexión a servidores externos.
- Completado de texto en tiempo real y generación de código multilínea.
- Seguimiento de instrucciones para aplicaciones móviles e IoT.
- Generación de embeddings ligeros para tareas de recuperación y clasificación en el dispositivo.
- Resumen de notificaciones, mensajes y contenido local de extensión corta o media.
- Análisis de documentos locales con contexto de hasta 32K tokens (procesamiento fragmentado).
- Soporte multilingüe: inglés y chino como idiomas principales, con mención de 30+ idiomas adicionales en la descripción del autor.
- No soporta entrada multimodal (solo texto), ni tool calling, ni modos de razonamiento explícitos.

## Casos de uso

- Asistentes conversacionales en el dispositivo: el modelo puede gestionar diálogos multi-turno de forma totalmente local en un smartphone, sin enviar datos a la nube, gracias a su contexto de 32K tokens y su bajo consumo de memoria (~0,75 GB en runtime).
- Completado de código en entornos de desarrollo móvil o de borde: su capacidad de generación de código multilínea permite autocompletar fragmentos en editores ligeros o entornos de programación en tabletas y placas SBC.
- Clasificación y recuperación de texto local: los embeddings generados por el modelo pueden alimentar sistemas de búsqueda semántica o clasificación de documentos en aplicaciones que requieren privacidad total.
- Resumen de notificaciones y mensajes: ideal para asistentes de productividad que resumen correos, mensajes o alertas directamente en el dispositivo, sin latencia de red.
- Análisis de documentos en entornos con conectividad limitada: con su contexto de 32K, puede procesar documentos largos fragmentados en dispositivos de campo, como pasarelas IoT o equipos de diagnóstico.
- Chatbots de atención al cliente en kioscos o dispositivos de punto de venta: su bajo requisito de memoria (~0,75 GB) permite ejecutarlo en hardware de gama baja, ofreciendo respuestas en tiempo real sin depender de infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks verificados en la información disponible. El único registro en el model-index es una entrada de "Generation Consistency (vs FP16, method reference)" cuyo valor es "awaiting gen_quant_eval audit" y no está verificado. No se proporcionan métricas como MMLU, HumanEval o GSM8K para esta versión cuantizada.

## Requisitos de hardware

- Memoria runtime estimada: ~0,75 GB a 4K de contexto (desglose: ~0,6 GB de pesos cuantizados mapeados en memoria, ~60 MB de caché KV, ~45 MB de overhead del runtime y ~45 MB de metadatos por canal).
- Dispositivos compatibles: smartphones de gama alta (8 GB), gama media (4-6 GB), gama baja (2-3 GB), Raspberry Pi 5 y SBC (4-8 GB), pasarelas IoT (1-2 GB, con limitaciones para contextos cortos) y wearables (1 GB, con limitaciones).
- No requiere GPU: la inferencia se ejecuta exclusivamente en CPU.
- Despliegue: únicamente mediante el runtime Aria Engine (propietario). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| google/gemma-3-1b-it (original) | ~1,1B | 32K | BF16 (2,2 GB) | Apache 2.0 | Safetensors (transformers) |
| ariacompute/gemma-3-1b-it_q326_channel | ~1,1B | 32K | 3,26-bit per-channel (Hadamard) | Apache 2.0 | aria-quant-bundle (Aria Engine) |
| ariacompute/gemma-3-1b-it_q8_channel | ~1,1B | 32K | 8-bit per-channel | Apache 2.0 | aria-quant-bundle (Aria Engine) |
| ariacompute/gemma-3-1b-it_q4_channel | ~1,1B | 32K | 4-bit per-channel | Apache 2.0 | aria-quant-bundle (Aria Engine) |

No se dispone de datos de rendimiento comparativo entre estas variantes. La comparativa se limita a especificaciones técnicas y de formato.

## Limitaciones y advertencias

- Calidad de generación no verificada: la auditoría de consistencia frente a FP16 está pendiente ("awaiting gen_quant_eval audit"). No se recomienda su uso en producción sin una evaluación previa.
- Ecosistema cerrado: el formato aria-quant-bundle solo es ejecutable con Aria Engine, lo que impide su uso con herramientas estándar del ecosistema Hugging Face (transformers, vLLM, llama.cpp, Ollama).
- Restricciones de uso: no apto para generación de texto largo (>4K tokens por generación), razonamiento matemático formal, síntesis de programas completos, ni despliegue con inferencia por lotes o aceleración GPU.
- Solo texto: no soporta entrada multimodal (imágenes, audio, vídeo).
- Idiomas limitados en metadatos: aunque la descripción menciona 30+ idiomas, el frontmatter solo declara en y zh. Se recomienda verificar el comportamiento en otros idiomas antes de desplegarlo.
- Riesgo de alucinación: como todo modelo pequeño, puede generar contenido plausible pero incorrecto, especialmente en tareas de razonamiento complejo.
- Sin datos sobre sesgos: no se han publicado evaluaciones de sesgos o toxicidad para esta versión cuantizada.
- Requisito de runtime propietario: el despliegue depende de la disponibilidad y mantenimiento de Aria Engine, lo que introduce una dependencia externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ariacompute/gemma-3-1b-it_q326_channel
- Repositorio GitHub de Aria Compute: https://github.com/ariacompute/model/tree/main/gemma/gemma-3-1b-it
- Aria Compute (dashboard y runtime): https://ariacompute.com
- Informe técnico de Gemma 3: https://arxiv.org/abs/2504.05252
- Repositorio original de Gemma 3: https://github.com/google-gemma/gemma-3
