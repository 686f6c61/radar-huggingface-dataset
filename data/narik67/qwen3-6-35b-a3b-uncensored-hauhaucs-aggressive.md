# Narik67/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive

## Resumen

Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive es una versión "abliterada" (sin censura) del modelo Qwen3.6-35B-A3B de Alibaba Qwen, publicada por el usuario Narik67 (atribuida en la model card a HauhauCS). El modelo base es un transformer híbrido de tipo Mixture of Experts (MoE) con 34.660.610.688 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, diseñado para cargas multimodales (texto, imagen y vídeo) mediante pipeline `image-text-to-text`. La modificación elimina los mecanismos de rechazo del modelo original: según la model card, se alcanzan 0 rechazos en 465 pruebas, manteniendo intactos los datasets y capacidades del modelo base.

La relevancia de esta ficha radica en que combina tres características poco habituales en un mismo artefacto: una arquitectura MoE con atención híbrida (lineal + softmax completa en proporción 3:1), una ventana de contexto nativa de 262.144 tokens y una distribución exclusiva en formato GGUF con cuantizaciones personalizadas K_P ("Perfect") generadas con importance matrix. El resultado es un modelo pensado para despliegue local en llama.cpp o LM Studio, con soporte de visión mediante el fichero `mmproj` adjunto.

El repositorio ocupa 247,4 GB e incluye cuantizaciones desde IQ2_M (11 GB) hasta Q8_K_P (44 GB), además del proyector multimodal en f16 (899 MB). La licencia declarada es Apache 2.0, heredada del modelo base. En el momento de redactar esta ficha el modelo no registra descargas ni "likes", lo que conviene tener en cuenta al evaluar su madurez comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con atención lineal + softmax completa (ratio 3:1), 40 capas |
| Parámetros totales | 34.660.610.688 (~34,7 B) |
| Parámetros activos | ~3 B por token (MoE: 256 expertos, 8 enrutados por token) |
| Longitud de contexto | 262.144 tokens nativos (se recomienda mantener al menos 128K para preservar el modo thinking) |
| Tipos de cuantización | IQ2_M, Q2_K_P, IQ3_M, Q3_K_P, Q3_K_M, IQ4_XS, IQ4_NL, Q4_K_M, Q4_K_P, Q5_K_M, Q5_K_P, Q6_K, Q6_K_P, Q8_0, Q8_K_P; proyector multimodal en f16 |
| Idiomas soportados | Inglés (en), chino (zh), multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (no se distribuyen safetensors en el repo) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura híbrida que intercala capas de atención lineal con capas de atención softmax completa en una proporción 3:1, sobre un total de 40 capas. La capa MoE cuenta con 256 expertos de los que se enrutan 8 por token, lo que da lugar a ~3 B de parámetros activos sobre un total de ~34,7 B. Esta configuración busca reducir el coste computacional por token manteniendo la capacidad representacional de un modelo denso de mayor tamaño. El modelo es nativamente multimodal: procesa texto, imagen y vídeo, y el repositorio incluye un proyector `mmproj` en f16 necesario para habilitar la entrada visual en llama.cpp.

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible (número de tokens, composición del dataset, uso de RLHF/DPO). La modificación de HauhauCS se describe como un proceso de abliteración sin cambios en datasets ni capacidades: "100% de lo que los autores originales pretendían, simplemente sin los rechazos". La variante Aggressive aplica un desbloqueo más fuerte que la futura variante Balanced, con la advertencia de que el modelo puede añadir breves avisos heredados del entrenamiento base, aunque siempre genera el contenido completo. Las cuantizaciones se han generado con importance matrix (imatrix) para preservar calidad sobre los pesos abliterados, y las K_P incorporan análisis específico del modelo para retener precisión en las capas más sensibles.

## Capacidades

- Generación de texto conversacional multi-turno con modo thinking activado por defecto y modo no-thinking alternativo.
- Razonamiento explícito y tareas de razonamiento de varios pasos (multi-step reasoning).
- Comprensión multimodal de imágenes y vídeo (pipeline `image-text-to-text`), previa carga del fichero `mmproj`.
- Capacidades multilingües en inglés, chino y otros idiomas (etiqueta "multilingual"), aunque la model card no detalla la cobertura exacta.
- Generación de código y tareas de precisión, con ajustes de sampling recomendados específicos (temperature 0.6 en modo thinking).
- Conversación sin rechazos: 0/465 rechazos reportados en las pruebas del autor.
- Compatibilidad con endpoints y runtimes GGUF estándar (llama.cpp, LM Studio), incluidas las cuantizaciones K_P personalizadas sin necesidad de builds especiales.
- No se documenta soporte explícito de tool calling, function calling ni protocolos de agentes en la información disponible.

## Casos de uso

- Asistente conversacional local sin filtros: el modelo mantiene conversaciones multi-turno con hasta 262K tokens de contexto, lo que permite arrastrar historiales extensos o documentos completos sin truncar; útil en entornos de investigación donde se necesita estudiar el comportamiento del modelo sin capas de rechazo.
- Análisis de documentos largos con imágenes intercaladas: gracias a la ventana de 262K y al proyector multimodal, se pueden procesar informes con gráficos, capturas o diagramas junto al texto en una sola pasada, por ejemplo para extracción de datos de PDF escaneados con tablas.
- Procesamiento de vídeo para descripción y resumen: el pipeline `image-text-to-text` con soporte de vídeo permite generar descripciones, resúmenes o transcripciones de contenido visual en flujos de catalogación de archivos multimedia.
- Generación de código en local: con los parámetros de sampling recomendados para tareas de precisión (temperature 0.6, top_p 0.95) y una cuantización Q6_K_P o Q8_K_P, el modelo puede asistir en refactorización y generación de código dentro de un IDE o pipeline de CI, sin enviar el código a servicios externos.
- Investigación sobre alineación y seguridad: la variante Aggressive, sin rechazos, sirve como objeto de estudio para comparar respuestas frente al modelo base y analizar qué contenido filtraba el alineamiento original; también para red teaming controlado.
- Despliegue en hardware de consumo: con cuantizaciones IQ4_XS (19 GB) o Q4_K_M (21 GB) el modelo cabe en una GPU de 24 GB (RTX 4090) o en configuraciones con offload parcial a CPU, lo que habilita prototipado local de asistentes multimodales.
- Generación creativa sin restricciones temáticas: escritura de ficción, guiones o material editorial que el modelo base rechazaría por sus políticas, en contextos donde el operador asume la responsabilidad del contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la métrica interna de rechazos (0/465) y no incluye datos de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización del GGUF):
  - IQ2_M: ~11 GB.
  - IQ3_M: ~15 GB.
  - IQ4_XS: ~19 GB.
  - Q4_K_M: ~21 GB.
  - Q5_K_P: ~28 GB.
  - Q6_K_P: ~31 GB.
  - Q8_K_P: ~44 GB.
- Hay que sumar ~899 MB del proyector `mmproj` en f16 si se usa visión.
- GPU recomendadas: RTX 4090 (24 GB) para IQ4_XS, Q4_K_M o IQ4_NL; RTX 3090 (24 GB) en las mismas cuantizaciones; A100 40 GB o H100 para Q6_K_P y Q8_K_P con contexto largo; configuraciones multi-GPU para Q8_K_P con 262K de contexto.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones de 4 bits; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) solo con IQ3_M o IQ2_M, o con offload parcial a RAM del sistema.
- Opciones de despliegue: llama.cpp (con flag `--jinja` para el chat template), LM Studio, y cualquier runtime compatible con GGUF. No se menciona soporte de vLLM ni TGI, que habitualmente requieren safetensors.
- Latencia y throughput: no disponibles. Al ser un MoE con ~3 B activos, el coste por token es notablemente inferior al de un denso de 35 B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | ~34,7 B | ~3 B | 262K | Texto, imagen, vídeo | Apache 2.0 | GGUF |
| Qwen/Qwen3.6-35B-A3B (base) | ~34,7 B | ~3 B | 262K | Texto, imagen, vídeo | Apache 2.0 | safetensors (no confirmado en la información) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con el modelo base, del que esta versión hereda arquitectura, contexto y capacidades, diferenciándose únicamente en la eliminación de rechazos y en la distribución en GGUF con cuantizaciones K_P. No se dispone de datos de benchmarks ni de especificaciones de terceros para establecer una comparación numérica con otros modelos MoE de tamaño similar.

## Limitaciones y advertencias

- Ausencia total de mecanismos de rechazo: la variante Aggressive está "completamente desbloqueada" y generará contenido que el modelo base rechazaría; requiere supervisión humana y políticas de uso claras en cualquier despliegue.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual ni de benchmarks de alucinación; el proceso de abliteración puede alterar calibración y comportamiento en dominios sensibles.
- Sesgos: no se documentan análisis de sesgo; al eliminar el alineamiento original se pueden amplificar sesgos presentes en los datos de entrenamiento del modelo base.
- Cobertura lingüística limitada: las etiquetas declaran inglés, chino y "multilingual", sin detalle de rendimiento por idioma; el castellano no está confirmado como idioma soportado de forma robusta.
- Contexto: aunque el modelo soporta 262K tokens, la model card advierte que por debajo de 128K se degradan las capacidades de thinking; además, el consumo de VRAM crece con el contexto y puede hacer inviable el contexto completo en GPUs de consumo.
- Licencia: Apache 2.0 permite uso comercial, pero el operador asume la responsabilidad legal del contenido generado sin filtros; conviene revisar las obligaciones de atribución y las políticas de la plataforma donde se despliegue.
- Madurez: 0 descargas y 0 "likes" en el momento de la ficha, publicación única sin actualizaciones; no hay evidencia comunitaria de estabilidad en producción.
- Compatibilidad: las cuantizaciones K_P pueden mostrarse como "?" en la columna de cuantización de LM Studio (solo visual) y el widget de compatibilidad de hardware de Hugging Face no reconoce K_P, por lo que puede ocultar ficheros existentes.
- Visión: requiere cargar el fichero `mmproj` junto al GGUF principal; sin él, el modelo funciona solo como texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Narik67/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio del autor de la abliteración (referenciado en la model card): https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Discord del autor: https://discord.gg/SZ5vacTXYf
