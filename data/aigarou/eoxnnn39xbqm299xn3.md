# AIGAROU/eoxnnn39xbqm299xn3

## Resumen

Este repositorio, publicado por el usuario AIGAROU bajo el identificador `eoxnnn39xbqm299xn3`, contiene una cuantización GGUF del modelo Qwen3.6-35B-A3B, un transformer de tipo Mixture of Experts (MoE) desarrollado originalmente por el equipo Qwen de Alibaba. La model card describe la variante como "Uncensored-HauhauCS-Aggressive", una versión con el alineamiento de seguridad eliminado (abliteration) que, según su autor, no rechaza ninguna de las 465 peticiones de su conjunto de evaluación. El modelo base es multimodal nativo (texto, imagen y vídeo) y está pensado para tareas de razonamiento, generación de código y conversación multi-turno.

La arquitectura combina atención lineal con atención softmax completa en una proporción 3:1, cuenta con 40 capas y 256 expertos de los cuales se enrutan 8 por token, lo que da lugar a unos 35 000 millones de parámetros totales con aproximadamente 3 000 millones activos por paso forward. El contexto nativo es de 262 144 tokens. El repositorio incluye pesos en formato GGUF con cuantizaciones que van desde IQ2_M (11 GB) hasta Q8_K_P (44 GB), además de un proyector multimodal `mmproj` en f16 de 899 MB necesario para el procesamiento de imágenes.

La relevancia de esta ficha radica en que permite ejecutar un MoE multimodal de 35B en hardware de consumo gracias a su bajo número de parámetros activos, y en que documenta una práctica controvertida (la eliminación de rechazos) cuyas implicaciones legales y de seguridad conviene evaluar antes de cualquier despliegue en producción. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (atención lineal + atención softmax completa, ratio 3:1) |
| Parametros totales | 34 660 610 688 (~34,7B) |
| Parametros activos | ~3B por paso forward |
| Longitud de contexto | 262 144 tokens nativos (se recomienda mantener al menos 128K para preservar el modo thinking) |
| Tipos de cuantizacion | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_NL, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, Q2_K_P, IQ2_M; proyector multimodal `mmproj` en f16 |
| Idiomas soportados | Inglés (en), chino (zh), multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con fichero `mmproj` separado para visión) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer de tipo Mixture of Experts con 40 capas y 256 expertos, de los cuales 8 se activan por token. La innovación principal es la hibridación de mecanismos de atención: tres capas de atención lineal por cada capa de atención softmax completa, lo que reduce el coste computacional en contextos largos manteniendo la capacidad de recuperación de información a larga distancia. El modelo es multimodal nativo, con capacidad de procesar texto, imagen y vídeo en el mismo espacio de representación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card del repositorio indica que la variante "Uncensored" no modifica datasets ni capacidades respecto al modelo original: se trata de un proceso de abliteration sobre los pesos, sin reentrenamiento. Las cuantizaciones se generaron con importance matrix (imatrix) para preservar la calidad en los pesos modificados, y las variantes K_P ("Perfect") aplican perfiles de cuantización específicos por modelo que, según el autor, mejoran la calidad en uno o dos niveles a cambio de un 5-15 % más de tamaño.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo thinking activado por defecto y modo no-thinking configurable.
- Comprensión de imágenes y vídeo de forma nativa (pipeline `image-text-to-text`), requiriendo el fichero `mmproj` en f16 para el procesamiento visual.
- Generación de código y tareas de precisión, con ajustes de sampling recomendados distintos (temperature 0.6 frente a 1.0 en modo general).
- Conversación multi-turno con contexto de hasta 262K tokens.
- Capacidades multilingües en inglés, chino y otros idiomas (etiqueta "multilingual").
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible, aunque el modelo base Qwen3.6 lo incluye según su familia; se indica como "no disponible" en esta ficha por falta de confirmación en la documentación proporcionada.
- Modo "uncensored": el autor declara 0 rechazos en 465 peticiones evaluadas, con posible apéndice de breves disclaimers heredados del entrenamiento del modelo base.

## Casos de uso

- Asistente conversacional de contexto largo: con 262K tokens de ventana, el modelo puede mantener el hilo de conversaciones extensas o procesar documentación completa sin truncar, útil en atención al cliente o soporte técnico especializado.
- Análisis de documentos con imágenes: gracias a su naturaleza multimodal, puede extraer información de capturas, gráficos o documentos escaneados combinándolos con texto, por ejemplo en pipelines de digitalización de facturas o informes.
- Generación de código en local: con ~3B parámetros activos, se puede desplegar en una estación de trabajo con GPU de consumo y usarse como copiloto de programación mediante llama.cpp o LM Studio, sin depender de APIs externas.
- Procesamiento de vídeo para moderación o etiquetado: la entrada de vídeo nativa permite clasificar o describir contenido audiovisual en flujos de trabajo de archivo o catalogación.
- Investigación sobre alineamiento y seguridad: al ser una variante abliterated, sirve como objeto de estudio para medir la eficacia de los mecanismos de rechazo y analizar sesgos residuales en modelos sin salvaguardas.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local con cuantizaciones de 11-23 GB, permite procesar datos sensibles sin enviarlos a servicios en la nube, por ejemplo en el sector sanitario o legal.
- Traducción y generación multilingüe: con soporte de inglés, chino y otros idiomas, puede emplearse en tareas de traducción técnica o localización de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 11 GB (IQ2_M) y 44 GB (Q8_K_P) para los pesos, más el proyector multimodal de 899 MB y el espacio de contexto (KV cache), que crece con la longitud de la ventana utilizada.
- GPU recomendadas: para cuantizaciones Q4_K_M o IQ4_XS (19-21 GB) cabe en una RTX 4090 (24 GB) o RTX 3090; para Q6_K_P (31 GB) o Q8_K_P (44 GB) se requiere A100 40/80 GB, H100 o configuraciones multi-GPU.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones de 4 bits; en GPUs de 16 GB (RTX 4080, 4070 Ti Super) solo con IQ3_M o inferiores, con posible degradación de calidad.
- Opciones de despliegue: llama.cpp (requiere flag `--jinja` para el chat template), LM Studio, y cualquier runtime compatible con GGUF. Para el fichero `mmproj` es necesario un runtime con soporte multimodal de llama.cpp.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El reducido número de parámetros activos (~3B) sugiere un throughput notablemente superior al de un modelo denso de 35B, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | ~35B / ~3B | 262K | Apache 2.0 | safetensors, GGUF | Modelo original con alineamiento de seguridad intacto |
| Esta variante (Uncensored-HauhauCS-Aggressive) | ~34,7B / ~3B | 262K | Apache 2.0 | GGUF | Abliterated, 0/465 rechazos según el autor |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de otros modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- La variante "Uncensored" elimina los mecanismos de rechazo del modelo base, lo que implica que puede generar contenido dañino, ilegal o sexualmente explícito sin filtro. No es apta para aplicaciones orientadas al público general sin capas de moderación adicionales.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad factual en la información disponible.
- El proceso de abliteration puede degradar capacidades de razonamiento o coherencia respecto al modelo original; el autor afirma que no hay cambios en capacidades, pero no aporta benchmarks que lo respalden.
- La licencia Apache 2.0 permite uso comercial, pero la eliminación de salvaguardas puede entrar en conflicto con normativas de servicios digitales o de protección de menores según la jurisdicción; conviene asesoramiento legal antes de desplegarlo.
- El contexto de 262K es nativo, pero el autor advierte que por debajo de 128K se puede perder capacidad de thinking; además, el coste de KV cache a contextos muy largos es elevado.
- El soporte de tool calling y de agentes no está confirmado en la documentación de esta variante concreta.
- La model card está truncada ("Works with llama.cp"), por lo que pueden faltar instrucciones de uso relevantes.
- El repositorio tiene muy pocas descargas (72) y ningún "like", lo que reduce la validación comunitaria sobre la calidad de las cuantizaciones.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AIGAROU/eoxnnn39xbqm299xn3
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio del autor de la variante uncensored: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Discord del autor: https://discord.gg/SZ5vacTXYf
