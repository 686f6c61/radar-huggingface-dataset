# Fhjdjdbxhshsh/Huihui-Qwen3.8-27B-abliterated-GGUF

## Resumen

Huihui-Qwen3.8-27B-abliterated-GGUF es una versión "abliterated" (sin rechazos) del modelo Qwen/Qwen3.8-27B, publicada por el usuario Fhjdjdbxhshsh sobre el trabajo previo de huihui-ai. La técnica de abliteration elimina las direcciones de activación asociadas a la negativa a responder, de modo que el modelo deja de censurar determinados tipos de peticiones. El repositorio distribuye exclusivamente pesos en formato GGUF, pensados para inferencia local con llama.cpp y Ollama.

El modelo base tiene 27.320.697.856 parámetros (27,3 mil millones) y pipeline declarado image-text-to-text, es decir, admite entradas de imagen y texto. Las etiquetas del repositorio incluyen hybrid-attention, ternary, 2-bit, prismml y bonsai, y los tensores abliterados mencionados en la model card (ssm_out) apuntan a componentes de estado recurrente, aunque la arquitectura exacta no se detalla. El repo ocupa 799,7 GB porque incluye múltiples familias de cuantización, varios orígenes de pesos y versiones bf16.

Es relevante ahora porque combina tres tendencias: modelos multimodales de tamaño medio que caben en hardware de consumo gracias a cuantizaciones agresivas (incluida una variante ternaria de 2 bits), despliegue on-device con kernels específicos, y la demanda de modelos sin filtros para investigación en seguridad, red-teaming y generación de contenido creativo. El contrapeso es la ausencia total de benchmarks, de datos de entrenamiento y de garantías de calidad: es un artefacto experimental, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas hybrid-attention y tensor ssm_out sugieren atención híbrida con componentes de estado; sin confirmar) |
| Parámetros totales | 27.320.697.856 (27,3 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible; el ejemplo de uso de la model card emplea `-c 262144` (256K tokens) |
| Tipos de cuantización | bf16, Q2_K_L, Q3_K_L, Q4_K_L, Q5_K_L, Q6_K_L, Q8_0_L, IQ2-mix y variantes ternarias de 2 bits |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (los metadatos del repo declaran además transformers y safetensors) |
| Pipeline | image-text-to-text (multimodal, entrada de imagen y texto) |
| Modelo base | Qwen/Qwen3.8-27B |
| Tamaño del repositorio | 799,7 GB |
| Fecha de creación | 2026-10-11 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna del modelo base ni sobre su proceso de entrenamiento (número de tokens, composición del dataset, RLHF, DPO). Lo único deducible de la model card es lo siguiente: las capas abliteradas se identifican con indexación base 0 y abarcan rangos como 17-52 o 22-52, lo que implica un modelo de al menos 53 capas; se mencionan explícitamente tensores `ssm_out`, `attn_output`, `ffn_down`, `token_embd` y `output`; y se indica que "MTP y visual no han sido modificados", lo que sugiere la presencia de un módulo de predicción multi-token y de un codificador visual. Las etiquetas hybrid-attention y bonsai apuntan a un esquema de atención híbrida, pero es una inferencia, no un dato confirmado.

La innovación aquí no está en el entrenamiento, sino en el post-procesado. La abliteration se aplica de forma parcial: en las primeras versiones se retuvieron las 15 primeras capas sin ablacionar y posteriormente se pasó a ablacionar solo las capas 17-52 o 22-52, con el objetivo declarado de conservar mejor el rendimiento del modelo original. El autor advierte que el resultado puede incluir "un pequeño aviso o disclaimer". Además, se han reconvertido a Q8_0 (o a bf16 en el caso de Q8_0_L) los tensores concretos que se van a ablacionar en las cuantizaciones por debajo de Q8_0, lo que rompe la progresión habitual de tamaños: Q2_K_L puede pesar más que Q3_K y Q4_K. La variante ternaria procede de prism-ml/Ternary-Bonsai-2-27B-gguf y requiere el fork PrismML-Eng/llama.cpp, ya que llama.cpp estándar no puede ejecutar esos ficheros. Las series Swift, UD, UD-DW, GSQ-RCO y Underdog-Saluki se generan mezclando pesos GGUF de terceros (unsloth, ISTA-DASLab, ukisai, ConwayResearch) y el propio autor las describe como "solo una prueba o validación".

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat (tag conversational).
- Procesamiento de imagen y texto (pipeline image-text-to-text), presumiblemente descripción de imágenes, OCR y respuesta a preguntas visuales; el alcance real no está documentado.
- Modo sin rechazos: la abliteration elimina las negativas explícitas del modelo base, de modo que responde a peticiones que el original rechazaría.
- Razonamiento y matemáticas: no hay datos publicados que confirmen el nivel; procede del modelo base, no verificado.
- Generación de código: no hay datos publicados; no se declara soporte específico.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas no está cumplimentado).
- Módulo MTP (multi-token prediction) presente y no modificado por la abliteration, según la model card.
- Ejecución on-device declarada mediante etiquetas (cuda, metal, on-device) y cuantizaciones de 2 bits y ternarias.

## Casos de uso

- Procesamiento de documentos escaneados en local: al aceptar imagen y texto, puede extraer campos estructurados de facturas, formularios o capturas de pantalla sin enviar datos a la nube, algo crítico en sectores con requisitos de confidencialidad.
- Asistente técnico sobre capturas de pantalla: interpretación de mensajes de error, paneles de configuración o trazas visuales para dar soporte de primer nivel en aplicaciones de escritorio.
- Investigación en seguridad y red-teaming: la ausencia de rechazos permite utilizarlo como generador de prompts adversarios y como sujeto de prueba para evaluar clasificadores de contenido y filtros de moderación en pipelines propios.
- Estudio de técnicas de abliteration: el repositorio documenta rangos de capas, reconversión de tensores y mezclas de GGUF, lo que lo convierte en material de referencia para reproducir el método y medir su impacto en la perplejidad de cada variante.
- Generación de ficción y guiones sin restricciones temáticas: útil para escritura creativa que aborde violencia, sexualidad o temas delicados, siempre que se aplique revisión humana antes de cualquier publicación.
- Despliegue en edge o en equipos sin GPU dedicada: las variantes de 2 bits y ternarias, junto con los kernels específicos, están pensadas para ejecutar un modelo de 27B en hardware limitado con memoria unificada o VRAM reducida.
- Prototipado de asistentes conversacionales de contexto largo: el ejemplo oficial usa 262.144 tokens de contexto, lo que permite mantener conversaciones o documentos extensos en memoria si el hardware lo soporta.
- Auditoría de contenido multimodal: describir y clasificar imágenes en lotes dentro de un flujo interno de revisión, aprovechando que el módulo visual no ha sido ablacionado y por tanto conserva el comportamiento del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco cifras de perplejidad antes y después de la abliteration. El autor califica repetidamente las variantes como "test/validation" sin aportar mediciones. No se inventan números.

## Requisitos de hardware

- Estimaciones de VRAM solo para pesos, calculadas a partir de los 27,3 mil millones de parámetros y de bits por peso habituales en GGUF; el autor advierte que las cuantizaciones con sufijo `_L` no siguen la progresión estándar porque parte de los tensores se reconvierten a Q8_0.
- bf16: aproximadamente 54-55 GB para los pesos, más caché KV.
- Q8_0 / Q8_0_L: aproximadamente 29 GB.
- Q6_K_L: aproximadamente 22-23 GB.
- Q5_K_L: aproximadamente 19-20 GB.
- Q4_K_L: aproximadamente 16-17 GB; es la opción más razonable para una GPU de 24 GB si se limita el contexto.
- Q3_K_L: aproximadamente 13-14 GB.
- Q2_K_L y variantes ternarias de 2 bits: por debajo de 10 GB en teoría, pero la reconversión de tensores puede hacer que Q2_K_L supere a Q3_K y Q4_K en tamaño.
- Caché KV: a 262.144 tokens de contexto el consumo es muy elevado y crece con el número de capas y de cabezas KV; no es viable en GPU de consumo a esa longitud. No se dispone de cifras oficiales.
- GPU recomendadas: para bf16, A100 80 GB o H100; para Q8_0, A100 40 GB o dos GPU de 24 GB; para Q4_K_L, RTX 4090, RTX 3090, L40S o Apple Silicon con 32 GB o más de memoria unificada.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4_K_L o inferiores con contexto recortado; en 16 GB de VRAM conviene bajar a Q3_K_L o Q2_K_L.
- Opciones de despliegue: llama.cpp (build reciente), Ollama (`ollama run huihui_ai/Qwen3.8-abliterated`), y el fork PrismML-Eng/llama.cpp para las variantes ternarias. Para las variantes no ternarias, llama.cpp estándar es suficiente según la propia model card. No se menciona soporte de vLLM ni TGI.
- Latencia y throughput: no disponible. No se publican tokens por segundo ni pruebas de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated-GGUF | 27,3 mil millones | no disponible (ejemplo con 262.144) | sin benchmarks publicados | apache-2.0 | GGUF en HuggingFace, repo de 799,7 GB, 0 descargas |
| Qwen/Qwen3.8-27B (base) | 27,3 mil millones (según metadatos) | no disponible | no disponible | apache-2.0 (según metadatos) | modelo de referencia del que deriva esta versión |
| unsloth/Qwen3.8-27B-GGUF | no disponible | no disponible | no disponible | no disponible | usado como origen de las series UD y UD-DW |
| ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF | no disponible | no disponible | no disponible | no disponible | usado como origen de la serie GSQ-RCO |
| prism-ml/Ternary-Bonsai-2-27B-gguf | no disponible | no disponible | no disponible | no disponible | usado como origen de la serie Ternary; requiere fork de llama.cpp |

No se dispone de datos verificados de otros modelos comparables de la misma categoría (27B, multimodal, sin censura, GGUF) en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de datos de entrenamiento, evaluación y benchmarks: no hay forma de saber cuánto rendimiento se ha perdido respecto al modelo base ni si la abliteration ha degradado capacidades de razonamiento, código o matemáticas.
- La abliteration es descrita por el propio autor como "una implementación cruda, prueba de concepto"; no es un proceso validado ni auditado.
- Al eliminar los rechazos, el modelo puede generar contenido dañino, ilegal o gravemente inapropiado. No es apto para aplicaciones orientadas al usuario final sin capas de moderación externas.
- Riesgo elevado de alucinación: no hay mediciones de fidelidad factual, y el autor advierte que algunas variantes "pueden incluir un pequeño aviso o disclaimer" en las respuestas.
- Las variantes Swift, UD, UD-DW, GSQ-RCO y Underdog-Saluki se construyen mezclando pesos GGUF de terceros sin fichero imatrix en al menos un caso, y el autor las etiqueta explícitamente como pruebas de validación, no como versiones recomendadas.
- El tamaño tras la conversión puede diferir del GGUF original porque parte de los pesos se reconvierten de PTQ1 a Q2_K o Q3_K; no son cuantizaciones estándar.
- Las variantes ternarias no funcionan con llama.cpp estándar: requieren el fork PrismML-Eng/llama.cpp, lo que limita portabilidad y mantenimiento.
- Discrepancia de autoría: los metadatos del repositorio indican el usuario Fhjdjdbxhshsh, mientras que la model card hace referencia constante a huihui-ai. Conviene verificar el origen real de los pesos antes de usarlos en producción.
- Licencia apache-2.0 declarada, lo que en principio permite uso comercial, pero el modelo base y los ficheros de terceros mezclados pueden arrastrar condiciones adicionales no verificadas aquí. Los pesos sin censura trasladan al operador toda la responsabilidad legal sobre el contenido generado.
- Idiomas soportados no declarados: no se puede asumir un rendimiento correcto en castellano sin evaluarlo.
- Con 0 descargas y 0 likes, el repositorio no tiene validación comunitaria; se actualizó un segundo después de crearse.
- El contexto de 262.144 tokens aparece solo en un ejemplo de línea de comandos, no como especificación oficial; el consumo de memoria a esa longitud puede hacerlo inviable en la práctica.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/Fhjdjdbxhshsh/Huihui-Qwen3.8-27B-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de la técnica de abliteration: https://github.com/Sumandora/remove-refusals-with-transformers
- Fuente de las series UD y UD-DW: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Fuente de la serie GSQ-RCO: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Fuente de la serie Ternary (Bonsai): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Fork de llama.cpp con kernels ternarios de atención híbrida: https://github.com/PrismML-Eng/llama.cpp
- Fuente de la serie Underdog-Saluki: https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0
- Fuente de la serie Swift: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Repositorio oficial de llama.cpp: https://github.com/ggml-org/llama.cpp
- Distribución en Ollama: https://ollama.com/huihui_ai/Qwen3.8-abliterated

Nota: la búsqueda web realizada no ha devuelto ningún resultado relevante sobre este modelo. Los únicos enlaces obtenidos pertenecen a un foro de contenido para adultos y no guardan relación con el modelo, por lo que no se incluyen ni se consideran fuentes válidas.
