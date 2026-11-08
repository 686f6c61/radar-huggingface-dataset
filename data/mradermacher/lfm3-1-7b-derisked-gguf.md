# mradermacher/LFM3-1.7B-DERISKED-GGUF

## Resumen

LFM3-1.7B-DERISKED-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo Blackfrost-AI/LFM3-1.7B-DERISKED, publicada por el usuario mradermacher. El modelo subyacente deriva de LFM3-1.7B, un modelo de texto de Liquid AI disenado para agentes locales y aplicaciones especializadas, construido sobre la arquitectura LFM3 tri-hybrid y con una ventana de contexto de 256K tokens y soporte nativo de tool calling. El repositorio no aporta pesos originales ni documentación técnica propia: es un empaquetado de conversión para inferencia local.

La relevancia de este repositorio es práctica: permite ejecutar un modelo de 1.728.801.600 parámetros en hardware de consumo mediante llama.cpp y derivados, con cuantizaciones que van desde Q2_K (0,9 GB) hasta f16 (3,6 GB). Al tratarse de cuantizaciones estáticas (sin imatrix), no se han publicado variantes ponderadas por el autor en el momento de la publicación.

Conviene senalar que el modelo base incorpora modificaciones bajo la etiqueta "DERISKED" y "baked-weights" del autor Blackfrost-AI, cuyo alcance técnico no está documentado en la información disponible. La licencia declarada es lfm1.0 (etiquetada como "other"), lo que condiciona el uso comercial y requiere revisión del fichero LICENSE del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 tri-hybrid (modelo base LFM3-1.7B de Liquid AI); detalles internos no disponibles |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K tokens (según documentación de LFM3-1.7B) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | lfm1.0 (etiqueta "other", con license_link al fichero LICENSE) |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye en safetensors/bf16 |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia LFM3 de Liquid AI, descrita por el fabricante como una arquitectura "tri-hybrid". La documentación pública de Liquid AI no detalla en la información disponible la composición exacta de esa hibridación (combinación de atención, capas recurrentes o SSM), el número de tokens de entrenamiento ni la composición del dataset. Tampoco se documentan fases de RLHF, DPO u otras etapas de alineamiento para esta variante.

Sobre la variante concreta Blackfrost-AI/LFM3-1.7B-DERISKED no hay información técnica publicada: las etiquetas "derisked", "dwm" y "baked-weights" sugieren modificaciones de pesos o de comportamiento aplicadas por el autor del modelo base, pero su naturaleza, magnitud y metodología no están descritas en los datos disponibles. Este repositorio de mradermacher se limita a la conversión a GGUF con quantize_version 2 y output_tensor_quantised 1, sin cuantizaciones ponderadas por imatrix.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta de pipeline "conversational" y el idioma declarado.
- Tool calling nativo, heredado de LFM3-1.7B según la documentación de Liquid AI.
- Orientación a agentes locales y aplicaciones especializadas, según la descripción del fabricante del modelo base.
- Ventana de contexto de 256K tokens en el modelo base, sujeta a la gestión de memoria de la implementación de inferencia utilizada.
- Ejecución en CPU y GPU de consumo mediante llama.cpp y compatibles, gracias a las cuantizaciones GGUF.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito ("thinking") en la información disponible.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Agentes locales en estación de trabajo: con cuantizaciones Q4_K_M (1,2 GB) el modelo cabe en GPUs de consumo y puede ejecutar bucles de tool calling en local sin depender de APIs externas, aprovechando el soporte nativo de function calling de LFM3.
- Asistentes de código en el IDE: un modelo de 1,7B con contexto largo permite mantener el contexto de varios ficheros abiertos y responder con baja latencia en máquinas sin GPU dedicada, usando Q4_K_S o IQ4_XS.
- Prototipado rápido de pipelines RAG: la ventana de 256K tokens del modelo base permite inyectar documentación extensa; para pruebas de concepto basta con la cuantización Q2_K (0,9 GB) en portátiles.
- Automatización de tareas de extracción y clasificación de texto en inglés: el modelo puede desplegarse con Ollama o llama.cpp en servidores modestos para procesar lotes de documentos con coste marginal mínimo.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece doce variantes del mismo modelo, lo que facilita medir la degradación de calidad entre Q2_K y Q8_0 en una tarea concreta antes de fijar una configuración de producción.
- Entornos con requisitos de privacidad: al ejecutarse íntegramente en local, es apto para procesar texto sensible en inglés sin salida de datos a terceros, siempre que la licencia lfm1.0 lo permita para el uso previsto.
- Investigación sobre modelos pequenos para agentes: útil como línea base de 1,7B en experimentos de planificación multi-paso y uso de herramientas, comparando frente a otros modelos de tamano similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0-1,2 GB con Q2_K y Q3_K; 1,2-1,4 GB con Q4_K_S, Q4_K_M y Q5_K; 1,5-1,9 GB con Q6_K y Q8_0; 3,6 GB con f16. A estas cifras hay que sumar el espacio para la caché KV, que crece con la longitud de contexto utilizada.
- GPU recomendadas: cualquier GPU de consumo con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090) es suficiente para las cuantizaciones Q4-Q8; para contextos muy largos conviene disponer de 8-24 GB. En entornos de servidor, A100 y H100 son sobredimensionadas para este tamano y solo se justifican por agregación de muchas instancias.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs discretas actuales, e incluso en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python o interfaces que expongan el formato mediante endpoints compatibles, como indica la etiqueta "endpoints_compatible"). vLLM y TGI no se citan en la información disponible para este repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-DERISKED-GGUF (este) | 1,73B | 256K (modelo base) | lfm1.0 | GGUF | Cuantizaciones estáticas, sin imatrix |
| LFM3-1.7B (Liquid AI) | 1,7B | 256K | lfm1.0 | safetensors/bf16 | Modelo original, tool calling nativo |
| Alternativas de ~1,7B de otros fabricantes | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento (benchmarks) con modelos de la misma categoría.

## Limitaciones y advertencias

- Solo inglés: la model card declara únicamente el idioma "en"; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Origen modificado: el modelo base lleva las etiquetas "derisked", "dwm" y "baked-weights" sin documentación pública sobre qué se ha alterado respecto a LFM3-1.7B original, lo que impide auditar su comportamiento.
- Riesgo de alucinación: inherente a los modelos de 1,7B; no se han publicado evaluaciones de fidelidad para esta variante.
- Cuantizaciones agresivas: Q2_K y Q3_K pueden degradar notablemente la calidad; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S y Q4_K_M como opción rápida.
- Sin cuantizaciones ponderadas: no hay variantes imatrix disponibles en el momento de la publicación, lo que limita la calidad en bits bajos frente a alternativas ponderadas.
- Licencia lfm1.0: es una licencia "other" con condiciones específicas; es imprescindible revisar el fichero LICENSE del modelo base antes de cualquier uso comercial.
- Contexto efectivo: aunque el modelo base soporta 256K tokens, la memoria necesaria para la caché KV en contextos largos puede exceder la disponible en hardware de consumo.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- Sesgos: no documentados en la información disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM3-1.7B-DERISKED-GGUF
- Modelo base: https://huggingface.co/Blackfrost-AI/LFM3-1.7B-DERISKED
- Documentación de LFM3-1.7B (Liquid AI): https://docs.liquid.ai/lfm/models/lfm3-1.7b
- Página de descargas del autor: https://hf.tst.eu/model#LFM3-1.7B-DERISKED-GGUF
- Perfil del autor: https://huggingface.co/mradermacher
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
