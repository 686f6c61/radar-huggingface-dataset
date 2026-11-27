# OsaurusAI/Holo4-35B-A3B-JANG_4M

## Resumen

Holo4-35B-A3B-JANG_4M es una cuantización calibrada de 4 bits del modelo vision-language Hcompany/Holo4-35B-A3B, publicada por OsaurusAI para su ejecución en Apple Silicon mediante el runtime Osaurus (versión 1.0.13 o superior) y la librería MLX. El modelo original es un transformer de tipo Mixture of Experts (la etiqueta de arquitectura es `qwen3_5_moe`) con 35.107.181.936 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, según indica el sufijo A3B de su nombre. Está pensado para tareas de image-text-to-text: descripción de imágenes, OCR, interpretación de gráficos, comprensión de capturas de interfaz gráfica y razonamiento multimodal.

La relevancia de esta ficha concreta no está en el modelo base, sino en el proceso de cuantización: se trata de una compresión a 4 bits con calibración específica sobre 448 ejemplos compactos que priorizan capturas reales de GUI, OCR y tablas, gráficos, razonamiento con thinking activado y desactivado, 14 lenguajes de programación y conversaciones de terminal y uso de herramientas. El bundle ocupa 20,56 GB (19,151 GiB de shards) y alcanza una eficiencia media de 4,6858 bits por peso. El autor publica métricas de fidelidad frente al BF16 original: KL de 0,01506178, coincidencia top-1 del 96,1631 % y dNLL de 0,01697074 sobre 84 casos retenidos y 2.502 posiciones evaluadas.

La licencia es Apache-2.0, heredada del modelo fuente, y el formato de pesos es safetensors en el esquema MLX. Es importante subrayar que esta validación es de fidelidad numérica y de comportamiento acotado, no de precisión en benchmarks de tareas: el propio autor lo indica explícitamente en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (etiqueta `qwen3_5_moe`); vision-language |
| Parametros totales | 35.107.181.936 |
| Parametros activos | Aproximadamente 3.000 millones (según el sufijo A3B del nombre; no confirmado en la model card) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits; GPTQ con covarianza completa y fallback RTN registrado; esquema JANGH con Hadamard-32 y codebook odd-cubic; 4,6858 bits efectivos por peso |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX), bundle de 20,56 GB; shard principal de 19,151 GiB |

## Arquitectura y entrenamiento

El modelo base Holo4-35B-A3B es un transformer de mezcla de expertos con capacidades de visión y lenguaje, etiquetado en Hugging Face como `qwen3_5_moe`, lo que sugiere una arquitectura derivada de la familia Qwen 3.5 MoE. El modelo procesa entradas de imagen y texto de forma conjunta y produce texto; la pipeline declarada es `image-text-to-text`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo fuente, ya que la model card de esta cuantización no los detalla.

La innovación técnica de esta publicación es el pipeline de cuantización JANG_4M: GPTQ con covarianza completa sobre 448 ejemplos de calibración seleccionados para cubrir dominios concretos (GUI, OCR, tablas, gráficos, código en 14 lenguajes, terminal y herramientas), con registro por módulo de los métodos y errores en `quantization_report.json`. Se aplica Hadamard-32 y un codebook odd-cubic en el esquema JANGH. El autor indica que el modelo fuente no publica tensores MTP, por lo que no se habilita decodificación especulativa ni drafter específico. El control de razonamiento es un interruptor on/off sin selector de esfuerzo, y el muestreo se hereda del `generation_config.json` original. El dialecto nativo de llamadas a herramientas es XML con parser `qwen3_coder`.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de imágenes y texto.
- Comprensión de capturas de interfaz gráfica y localización de elementos con coordenadas normalizadas en escala 0-1000.
- OCR, extracción de tablas y lectura de gráficos.
- Razonamiento con modo thinking activable y desactivable.
- Llamadas a funciones y herramientas en dialecto XML nativo (parser `qwen3_coder`).
- Flujos agénticos con verificación de sistema de ficheros y conversaciones de terminal.
- Generación y razonamiento sobre código en 14 lenguajes según la calibración.
- Conversaciones multi-turno con historial.
- Capacidades multilingües: no especificadas en la documentación disponible.

## Casos de uso

- Automatización de pruebas de interfaz gráfica: el modelo localiza elementos en capturas mediante coordenadas normalizadas 0-1000, lo que permite generar selectores y validar estados de pantalla en pipelines de QA sin intervención manual.
- Extracción de datos de documentos escaneados: al estar calibrado sobre OCR y tablas, puede convertir facturas, informes y formularios en estructuras de texto o JSON para su ingesta en sistemas de gestión documental.
- Asistente de escritorio en Apple Silicon: con 20,56 GB de pesos y el runtime Osaurus, se puede desplegar localmente en un Mac para tareas de análisis de imágenes y conversación sin enviar datos a la nube, útil en entornos con requisitos de privacidad.
- Interpretación de gráficos en informes: el modelo puede describir tendencias y extraer valores de gráficas de barras o líneas, adecuado para resúmenes automáticos de dashboards y reportes periódicos.
- Agente de terminal y operaciones: con tool calling XML y verificación de sistema de ficheros, puede encadenar pasos de diagnóstico, ejecutar comandos y comprobar resultados en flujos de administración de sistemas.
- Asistencia a la programación con contexto visual: dado que la calibración cubre 14 lenguajes y capturas de código, puede revisar errores mostrados en pantalla, sugerir correcciones y explicar trazas de error a partir de imágenes del IDE.
- Moderación y descripción de contenido visual: generación de descripciones y etiquetas para catalogación de imágenes en bibliotecas y archivos digitales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor publica exclusivamente métricas internas de fidelidad frente al BF16 original:

| Métrica | Valor |
|---|---|
| Casos retenidos / posiciones evaluadas | 84 / 2.502 |
| KL (BF16 frente a cuantizado) | 0,01506178 |
| Coincidencia top-1 con el token fuente | 96,1631 % |
| dNLL | 0,01697074 |
| Bits efectivos por peso (modelo completo) | 4,6858 |

Desglose por segmento:

| Segmento | Posiciones | KL | Coincidencia top-1 |
|---|---:|---:|---:|
| Visión | 843 | 0,02458 | 93,83 % |
| Thinking activado | 1.312 | 0,00911 | 98,40 % |
| Thinking desactivado | 1.190 | 0,02163 | 93,70 % |

Rendimiento medido en un Apple M5 Max: 115,4 tokens/s de decodificación en el primer turno de un caso de gráfico, con 83 tokens generados. Es una única medición, no un promedio.

## Requisitos de hardware

- VRAM/unified memory: el bundle completo ocupa 20,56 GB, por lo que se recomienda al menos 24 GB de memoria unificada para cargar el modelo con margen para el contexto y el procesamiento de imágenes.
- Plataforma: exclusivamente Apple Silicon; la librería es MLX y el runtime requerido es Osaurus 1.0.13 o superior.
- GPU recomendadas: chips Apple de la familia M con 24 GB o más de memoria unificada; el autor reporta mediciones en un M5 Max.
- GPU consumer NVIDIA: no compatible con este bundle, al estar empaquetado para MLX; no se dispone de una versión GGUF o de pesos para CUDA en la información proporcionada.
- Opciones de despliegue: Osaurus (runtime oficial) y MLX; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta publicación.
- Latencia y throughput: 115,4 tokens/s de decodificación en una medición puntual sobre M5 Max; no hay datos de prefill ni de latencia extremo a extremo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de tareas para este modelo, por lo que la comparación se limita a características estructurales. Las alternativas indicadas son estimaciones de categoría, no mediciones.

| Modelo | Parámetros | Contexto | Licencia | Formato | Plataforma |
|---|---|---|---|---|---|
| Holo4-35B-A3B-JANG_4M (esta ficha) | 35,1 B totales / ~3 B activos | No disponible | Apache-2.0 | Safetensors MLX 4 bits | Apple Silicon |
| Hcompany/Holo4-35B-A3B (fuente) | 35,1 B totales / ~3 B activos | No disponible | Apache-2.0 | Safetensors BF16 | Multiplataforma |
| Qwen3-VL MoE de tamaño comparable | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han identificado en la información proporcionada otros modelos comparables con datos verificables de rendimiento, contexto o licencia.

## Limitaciones y advertencias

- La validación es de fidelidad numérica y comportamiento acotado, no de precisión en tareas; el autor lo advierte explícitamente. No debe interpretarse la coincidencia top-1 del 96 % como una medida de calidad en benchmarks.
- El segmento de visión presenta la mayor degradación (KL 0,02458, top-1 93,83 %), por lo que tareas de OCR o localización fina pueden acumular errores.
- El autor documenta que las peticiones de píxel bruto, formato y selección de herramientas pueden fallar.
- La localización de elementos GUI usa coordenadas normalizadas 0-1000; las recetas que requieren selección greedy deben configurarse por petición, ya que el muestreo por defecto se hereda del modelo fuente.
- No hay decodificación especulativa ni drafter MTP, lo que limita el throughput frente a configuraciones con speculative decoding.
- El modelo solo se ejecuta en Apple Silicon con Osaurus y MLX; no hay artefactos para CUDA, ROCm ni CPU genérica en esta publicación.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en descripción de imágenes ambiguas y extracción de tablas densas.
- Sesgos: no se documentan sesgos específicos del modelo fuente ni de la cuantización; deben asumirse los del corpus de entrenamiento original, no disponible.
- Idiomas soportados no declarados; el rendimiento fuera del inglés y del coreano (único idioma adicional mencionado en la model card) es desconocido.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda conservar los avisos de licencia y el `SOURCE_MODEL_CARD.md` del modelo fuente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OsaurusAI/Holo4-35B-A3B-JANG_4M
- Modelo base: https://huggingface.co/Hcompany/Holo4-35B-A3B
- Revisión concreta del modelo base: https://huggingface.co/Hcompany/Holo4-35B-A3B/tree/508458727831368da85d53a8055c2b0f923ed4f3
- Runtime Osaurus: https://osaurus.ai
- Documentación de localización de elementos de Hcompany: https://hub.hcompany.ai/models-api/element-localization
