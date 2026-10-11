# Jundot/Qwen3.8-27B-oQ2.5e-mtp

## Resumen

Qwen3.8-27B-oQ2.5e-mtp es un checkpoint cuantizado en precisión mixta del modelo Qwen/Qwen3.8-27B, un modelo denso de visión-lenguaje de 27.781 millones de parámetros construido sobre la arquitectura Qwen3.5. Lo publica Jundot (Jun Kim) dentro del ecosistema oQ/oMLX, una herramienta de cuantización de precisión mixta orientada a ejecución local en Apple Silicon mediante MLX. El problema que resuelve es concreto: permitir desplegar un modelo de 27B con capacidades multimodales en hardware de consumo, comprimiendo el checkpoint hasta 11,782 GiB y 3,643 bits por peso efectivos.

La arquitectura combina capas Gated DeltaNet con capas Gated Attention en un esquema híbrido, e incorpora un codificador de visión y una cabeza de predicción multi-token (MTP) para decodificación especulativa. El contexto nativo es de 262.144 tokens, lo que lo sitúa en el rango de modelos de contexto largo con soporte de imagen y vídeo. El checkpoint incluye el backbone de lenguaje (26,896B), el codificador de visión (0,461B) y la cabeza MTP (0,425B).

La relevancia actual de esta ficha es doble. Por un lado, documenta una técnica de cuantización que asigna bits por sensibilidad medida de cada capa en lugar de aplicar una precisión uniforme. Por otro, sirve como referencia práctica para quien quiera evaluar si un VLM de 27B y contexto de 262k tokens puede ejecutarse en un Mac sin recurrir a GPUs de datacenter. La licencia Apache-2.0, heredada del modelo base, facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas Gated DeltaNet y Gated Attention, más codificador de visión y cabeza de predicción multi-token (MTP) |
| Parametros totales | 27.781.427.952 (27,781B) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | Precisión mixta afín con grupo 64: 2, 3, 4, 5, 6 y 8 bits, más BF16; media efectiva de 3,643 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors en formato MLX (library_name: mlx) |

Desglose de almacenamiento del checkpoint:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Backbone de lenguaje | 26,896B | 11,415 GB / 10,631 GiB |
| Codificador de vision | 0,461B | 0,921 GB / 0,858 GiB |
| Cabeza MTP | 0,425B | 0,314 GB / 0,293 GiB |
| Total | 27,781B | 12,651 GB / 11,782 GiB |

Distribución de bits por peso y peso lógico:

| Formato de almacenamiento | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Afín 2 bits, grupo 64 | 21,422B | 77,109% | 6,235 GiB | 2,50 |
| Afín 3 bits, grupo 64 | 0,000B | 0,001% | 0,000 GiB | 3,50 |
| Afín 4 bits, grupo 64 | 0,372B | 1,340% | 0,195 GiB | 4,50 |
| Afín 5 bits, grupo 64 | 2,923B | 10,521% | 1,872 GiB | 5,50 |
| Afín 6 bits, grupo 64 | 0,005B | 0,019% | 0,004 GiB | 6,50 |
| Afín 8 bits, grupo 64 | 2,543B | 9,153% | 2,516 GiB | 8,50 |
| BF16 | 0,516B | 1,857% | 0,961 GiB | 16,00 |
| Total | 27,781B | 100% | 11,782 GiB | 3,643 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una disposición híbrida de capas: Gated DeltaNet, un mecanismo de atención lineal con estado recurrente, combinado con capas de atención con puerta convencionales. La etiqueta qwen3_5 del repositorio y la descripción de la model card sitúan el diseño dentro de la familia Qwen3.5. Sobre esa columna vertebral se añaden dos componentes: un codificador de visión que habilita la comprensión de imágenes y vídeo (pipeline image-text-to-text), y una cabeza de predicción multi-token (MTP) de 0,425B parámetros que permite decodificación especulativa, es decir, proponer varios tokens por paso y verificarlos con el modelo principal para reducir la latencia de generación.

El proceso de cuantización es la innovación central de este checkpoint. La receta oQ2.5e, implementada en oMLX v0.7.1 con la mejora oQe, asigna el número de bits a cada capa según su sensibilidad medida empíricamente, en lugar de usar una precisión homogénea. Cada grupo se redondea con una matriz de importancia calculada sobre 128 muestras de 512 tokens, y después se reajustan la escala y el sesgo mediante mínimos cuadrados ponderados. El resultado es una distribución fuertemente sesgada hacia 2 bits (77,109% de los pesos lógicos) pero con bolsas de 5, 8 y 16 bits en las capas donde la pérdida de precisión sería más costosa, incluidas 0,516B de parámetros que permanecen en BF16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base pasó por fases de RLHF o DPO. Tampoco se detalla qué capas concretas recibieron mayor precisión ni qué criterio de sensibilidad se usó exactamente. Estos datos figuran como no disponibles en la información proporcionada.

## Capacidades

- Generación de texto conversacional en formato multi-turno (etiqueta conversational del repositorio).
- Comprensión de imágenes: pipeline image-text-to-text declarado, con codificador de visión dedicado de 0,461B parámetros.
- Comprensión de vídeo: la model card menciona explícitamente image and video understanding como capacidad del modelo base.
- Contexto largo de 262.144 tokens nativos, adecuado para documentos extensos, transcripciones largas o bases de código completas.
- Decodificación especulativa mediante la cabeza MTP integrada, que acelera la generación al proponer múltiples tokens por paso.
- Razonamiento y matemáticas: capacidades heredadas del modelo base Qwen3.8-27B; no se aportan detalles específicos en la información disponible.
- Generación de código: capacidad esperable del modelo base, aunque no se documenta explícitamente en la información proporcionada.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara lista de idiomas.
- Modo de pensamiento explícito (thinking mode): no disponible.

## Casos de uso

- Asistente documental de contexto largo: con 262.144 tokens de ventana nativa, el modelo puede ingerir manuales técnicos, contratos o informes completos en una sola pasada sin troceado ni recuperación externa, respondiendo preguntas sobre el contenido íntegro.
- Análisis de vídeo y capturas para soporte técnico: el codificador de visión permite adjuntar capturas de pantalla o clips cortos y pedir al modelo que describa el error, localice el elemento de interfaz relevante y proponga pasos de resolución.
- Procesamiento de documentación escaneada en local: gracias al pipeline image-text-to-text, se pueden pasar páginas de PDF renderizadas como imagen y extraer campos estructurados, sin enviar datos a servicios externos.
- Generación asistida de código en estación de trabajo: integrado vía MLX en un editor local, el modelo cubre autocompletado y explicación de fragmentos extensos apoyándose en el contexto largo para tener varios ficheros visibles a la vez.
- Transcripción y resumen de reuniones con material visual: si la entrada combina texto de transcripción e imágenes de pizarra o diapositivas, el modelo puede producir un acta estructurada que referencie ambos.
- Evaluación comparativa de cuantizaciones: como checkpoint de 2,5 bits efectivos, sirve para medir la degradación real frente a las variantes oQ4e y oQ6e del mismo modelo base, un caso de uso habitual en equipos que ajustan el compromiso entre memoria y calidad.
- Experimentación académica en hardware de consumo: investigadores sin acceso a GPUs de datacenter pueden reproducir evaluaciones de un VLM de 27B en un Mac, incluyendo pruebas de atención sobre contextos muy largos.
- Despliegue de demostraciones offline: aplicaciones de escritorio que necesiten funcionar sin conexión y con privacidad estricta pueden empaquetar este checkpoint dentro de una app MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del checkpoint no incluye tablas de MMLU, HumanEval, GSM8K, MMMU ni métricas de perplejidad, ni comparaciones numéricas con el modelo base sin cuantizar o con otras cuantizaciones. Tampoco se aportan mediciones de latencia o throughput. Cualquier cifra al respecto requeriría una evaluación propia.

## Requisitos de hardware

- Peso del checkpoint en disco: 12,651 GB (11,782 GiB); el repositorio completo ocupa 12,7 GB.
- Memoria necesaria para los pesos en inferencia: aproximadamente 12 GiB solo para parámetros; hay que sumar la caché KV, que con 262.144 tokens de contexto puede ser muy superior al peso del modelo (valor exacto no disponible).
- Plataforma objetivo: Apple Silicon con MLX. El formato de pesos es específico de MLX, por lo que no se carga directamente en stacks CUDA.
- Macs candidatos (estimación a partir del tamaño del checkpoint): equipos con 32 GB o más de memoria unificada para contextos moderados; 64 GB o más si se quiere explotar buena parte de la ventana de 262k tokens. En máquinas de 16 GB el ajuste es muy justo y deja poco margen para la caché KV.
- GPUs de datacenter (A100, H100) y consumer NVIDIA (RTX 4090): no aplicables de forma directa sin convertir los pesos a otro formato; la información disponible no documenta dicha conversión.
- Opciones de despliegue: MLX y mlx-lm; oMLX v0.7.1 como herramienta de cuantización y ejecución. No se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles. La cabeza MTP está diseñada para reducir la latencia mediante decodificación especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jundot/Qwen3.8-27B-oQ2.5e-mtp | 27,781B | 262.144 tokens | Mixta, 3,643 bits/peso efectivos | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Jundot/Qwen3.8-27B-oQ4e-fp16-mtp | 28B (según listado) | No disponible | Mixta oQ4e con componentes fp16 | Apache-2.0 (heredada) | HuggingFace, 1,26k descargas, 13 likes |
| Jundot/Qwen3.8-27B-oQ6e-mtp | 28B (según listado) | No disponible | Mixta oQ6e | Apache-2.0 (heredada) | HuggingFace, 1,62k descargas, 10 likes |
| Qwen/Qwen3.8-27B (modelo base) | 27,781B | 262.144 tokens | Sin cuantizar (BF16) | Apache-2.0 | HuggingFace |

Las tres variantes comparten modelo base, licencia y, presumiblemente, contexto, ya que la cuantización no altera la arquitectura. La diferencia relevante es el compromiso entre huella de memoria y fidelidad: oQ2.5e baja a 3,643 bits/peso efectivos, mientras que oQ4e y oQ6e se sitúan en rangos superiores. Los datos de descargas y likes indican que las variantes de mayor precisión tienen más adopción, aunque la variante oQ2.5e es la única con fecha de creación más reciente en la información disponible. No hay datos de benchmarks que permitan cuantificar la pérdida de calidad de cada variante.

## Limitaciones y advertencias

- La cuantización a 3,643 bits/peso efectivos, con un 77,109% de los pesos lógicos en 2 bits, implica una degradación de calidad respecto al modelo base que no está cuantificada en la información disponible. En tareas sensibles a la precisión numérica (matemáticas, código, razonamiento encadenado) el deterioro puede ser notable.
- Riesgo de alucinación: no se documentan tasas de error ni evaluaciones de fidelidad. Como en cualquier modelo generativo, existe riesgo de fabricar hechos, citas o referencias.
- Idiomas soportados: no declarados. No se puede asumir cobertura multilingüe sin verificación empírica.
- Contexto: aunque la ventana nativa es de 262.144 tokens, la calidad de la atención sobre contextos muy largos no está documentada, y la caché KV a esa longitud puede exceder la memoria disponible en la mayoría de equipos de consumo.
- Dependencia de plataforma: el formato MLX limita el uso a Apple Silicon. Portar los pesos a CUDA u otras plataformas requiere conversión y no está documentado.
- Modelo con 0 descargas y 0 likes en el momento de redactar esta ficha, y creado y actualizado con un minuto de diferencia. No hay historial de comunidad, informes de errores ni validación independiente.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar que el modelo base Qwen/Qwen3.8-27B no imponga condiciones adicionales, ya que el checkpoint declara seguir la licencia del modelo fuente.
- No se documentan sesgos conocidos, composición del dataset de entrenamiento ni medidas de alineación aplicadas al modelo base.
- Al ser una cuantización de terceros y no una publicación oficial del equipo Qwen, no debe asumirse soporte ni mantenimiento por parte del autor original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jundot/Qwen3.8-27B-oQ2.5e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
- Pull request de la mejora oQe: https://github.com/jundot/omlx/pull/4385
- Catálogo de modelos de Jundot: https://huggingface.co/Jundot/models
- Modelos etiquetados con oq en HuggingFace: https://huggingface.co/models?other=oq
- Anuncio de Lightning MTP, kernels personalizados y oQe en r/oMLX: https://www.reddit.com/r/oMLX/comments/1uqyu2h/introducing_lightning_mtp_custom_kernels_and_oqe/
- Modelos compatibles con MLX: https://huggingface.co/models?library=mlx
