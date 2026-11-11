# catonooka/Qwen3.8-27B-EXL3-4.0bpw-h8

## Resumen

Qwen3.8-27B es un modelo denso de lenguaje y visión de 27 000 millones de parámetros desarrollado por el equipo Qwen (Alibaba), presentado como la generación más capaz de la familia abierta Qwen hasta la fecha. Se construye sobre la base arquitectónica de Qwen3.5 y combina atención lineal (Gated DeltaNet) con atención completa (Gated Attention) en un diseño híbrido de 64 capas, además de un codificador visual nativo para comprender imágenes y vídeos. Su contexto nativo es de 262 144 tokens, extensible hasta 1 000 000.

La ficha que nos ocupa, `catonooka/Qwen3.8-27B-EXL3-4.0bpw-h8`, no es el modelo original, sino una **cuantización EXL3 a 4.0 bits por peso con cabeza de salida de 8 bits**, convertida con exllamav3 v1.6.6. Está pensada para inferencia eficiente en GPU de consumo: el autor reporta mediciones en una única RTX 3090 (24 GB) con decodificación especulativa, alcanzando entre 122 y 178 tok/s en cargas de código y entre 64,7 y 75 tok/s en prosa creativa usando el drafter DFlash2.

Es relevante ahora porque demuestra que un modelo de 27B con visión, contexto largo y modo *thinking* puede desplegarse en hardware de gama alta de consumo con velocidades interactivas, gracias a la combinación de cuantización EXL3 y *speculative decoding* con drafters especializados (DFlash2 de z-lab y DSpine de Tencent). La licencia Apache 2.0, heredada del modelo base, facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido causal con codificador visual: 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parámetros totales | 27B (modelo base); 8 413 517 184 parámetros en los safetensors de esta cuantización |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos; extensible hasta 1 000 000 |
| Tipos de cuantización | EXL3 4.0 bpw con cabeza de salida de 8 bits (h8) |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (EXL3, para exllamav3) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida de 64 capas con dimensión oculta de 5120 y FFN de dimensión intermedia 17 408. El bloque se repite en un patrón de 16 grupos, cada uno con tres subcapas de Gated DeltaNet (atención lineal con 48 cabezas para V y 16 para QK, dimensión de cabeza 128) seguidas de una capa de Gated Attention completa (24 cabezas para Q y 4 para KV, dimensión de cabeza 256, RoPE de 64 dimensiones). El vocabulario y la cabeza de salida están dimensionados a 248 320 entradas (con padding). Incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que facilita la decodificación especulativa.

El entrenamiento comprende fases de preentrenamiento y postentrenamiento (los detalles sobre número de tokens, composición del dataset y uso de RLHF/DPO no se especifican en la información disponible). El modelo es nativo multimodal: incluye una torre de visión que se carga bajo demanda mediante `Model.from_config(config, component="vision")`. La cuantización EXL3 se generó con `convert.py` de exllamav3 v1.6.6, y el autor reporta una campaña de ajuste y medición sobre la versión convertida, no sobre el modelo original.

## Capacidades

- Generación de texto y razonamiento de múltiples pasos, con modo *thinking* activado por defecto y desactivable por petición.
- Control flexible del razonamiento mediante `reasoning_effort` y retención del contexto de razonamiento histórico con `preserve_thinking`.
- Comprensión de imágenes y vídeos de forma nativa: diagramas STEM, documentos y vídeos de hasta una hora.
- Generación y razonamiento de código, con mejoras declaradas en tareas de programación y trabajo profesional.
- Ejecución agéntica: planificación autónoma y manejo de retroalimentación del entorno para completar tareas de extremo a extremo.
- Soporte de *tool calling* y compatibilidad con arneses y herramientas de desarrollo populares (mencionado como "downstream compatibility").
- Capacidades multilingües: no detalladas en la información disponible.
- Decodificación especulativa nativa mediante drafters externos (DFlash2 y DSpine) integrados en exllamav3.

## Casos de uso

- **Asistencia de código en producción**: con 122–178 tok/s en una RTX 3090 usando el drafter DSpine, el modelo es adecuado para autocompletado, refactorización y generación de tests en pipelines de CI/CD, integrándose mediante tool calling.
- **Atención al cliente multi-turno**: la ventana de 262 144 tokens permite mantener historiales de conversación extensos y documentación de producto en contexto sin truncamiento.
- **Análisis de documentos técnicos y científicos**: la torre de visión procesa diagramas STEM y documentos escaneados, permitiendo extraer y razonar sobre figuras y tablas.
- **Procesamiento de vídeo de larga duración**: con soporte de vídeos de hasta una hora, sirve para resumen, indexación y respuesta a preguntas sobre grabaciones.
- **Agentes autónomos de larga duración**: el modo thinking con `reasoning_effort` ajustable y la retención de contexto de razonamiento lo hacen apto para tareas de varios pasos con retroalimentación del entorno.
- **Despliegue local en estación de trabajo**: la cuantización EXL3 4.0 bpw cabe en 24 GB de VRAM, permitiendo inferencia privada en una RTX 3090 o 4090 sin depender de la nube.
- **Generación de prosa y contenido creativo**: con el drafter DFlash2 y ventana de 7 tokens, alcanza 64,7–75 tok/s, suficiente para generación interactiva de textos largos.

## Benchmarks y rendimiento

El autor de la cuantización reporta las siguientes mediciones en 1× RTX 3090 (24 GB), flujo único y decodificación greedy:

| Carga de trabajo | Velocidad |
|---|---|
| Prefill (texto largo, contexto nuevo) | ~889 tok/s |
| Prosa creativa + drafter DFlash2 (verificación dinámica, c0.25) | 64,7–75 tok/s |
| Código + drafter | 122–178 tok/s |
| Decodificación densa (sin drafter) | 42,4 tok/s |

No se han publicado en la información disponible resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) para el modelo base ni para esta cuantización; la model card original incluye una sección de benchmarks de texto que no se ha trasladado con valores numéricos a esta ficha.

## Requisitos de hardware

- **VRAM estimada**: el repositorio ocupa 16,8 GB en EXL3 4.0 bpw; se recomienda un mínimo de 20–24 GB de VRAM para dejar margen a la caché KV con contexto largo.
- **GPU recomendadas**: RTX 3090 (24 GB) y RTX 4090 (24 GB) son suficientes para el modelo cuantizado; para contexto completo de 262 144 tokens o despliegue multiusuario se recomiendan A100 (40/80 GB) o H100.
- **GPU de consumo**: sí cabe en RTX 3090 y RTX 4090; en GPUs de 16 GB no cabría sin reducir contexto o aplicar cuantizaciones más agresivas (no disponibles en este repositorio).
- **Opciones de despliegue**: exllamav3 es el motor nativo para este formato EXL3; el modelo base es compatible con Transformers, vLLM, SGLang y TokenSpeed, pero los pesos EXL3 requieren exllamav3.
- **Latencia y throughput**: medidos por el autor en RTX 3090: 42,4 tok/s en decodificación densa y hasta 178 tok/s con drafter en código; prefill de ~889 tok/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B denso | 262 144 (hasta 1M) | Apache 2.0 | Transformers, vLLM, SGLang, TokenSpeed | Modelo original sin cuantizar; mayor huella de VRAM |
| Esta cuantización (EXL3 4.0 bpw) | 27B denso (8,41B en safetensors) | 262 144 (heredado del base) | Apache 2.0 | exllamav3 | Optimizada para GPU de consumo con decodificación especulativa |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No se dispone de datos de otros modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- **Sesgos**: no se documentan sesgos específicos en la información disponible; como modelo entrenado con datos web a gran escala, es previsible que herede sesgos de esos corpus.
- **Alucinación**: no se han publicado tasas de alucinación ni evaluaciones de fidelidad para esta cuantización; la cuantización a 4 bits puede degradar ligeramente la calidad respecto al modelo original.
- **Idiomas**: la lista de idiomas soportados no está disponible; no se debe asumir cobertura multilingüe sin verificación.
- **Contexto**: aunque el contexto nativo es de 262 144 tokens, el rendimiento en ventanas muy largas puede degradarse y el coste de VRAM de la caché KV crece con el contexto.
- **Formato propietario**: los pesos EXL3 solo funcionan con exllamav3; no son directamente cargables en vLLM, SGLang o Transformers, lo que limita la portabilidad.
- **Drafters externos**: el rendimiento reportado depende de drafters de terceros (DFlash2, DSpine) que deben descargarse por separado y cuya licencia y mantenimiento son independientes.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio y las condiciones del modelo base.
- **Madurez**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una publicación reciente sin validación comunitaria.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/catonooka/Qwen3.8-27B-EXL3-4.0bpw-h8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- exllamav3 (motor de inferencia y conversor): https://github.com/turboderp-org/exllamav3
- Drafter DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Drafter DSpine (pesos): https://huggingface.co/tencent/Qwen3.8-27B-DSpine-b16
- DSpine (código y paper): https://github.com/Tencent/DSpine
- Paper DSpine: arXiv:2609.36173
- Perfil del autor: https://huggingface.co/nguyenminhtri99
- Qwen Cloud (servicio gestionado): https://www.qwencloud.com
- Overview de Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
