# med-vlm-2026/MedVER

## Resumen

MedVER es un modelo de lenguaje y vision (VLM) especializado en respuesta a preguntas visuales sobre radiografias de torax, con razonamiento fundamentado en evidencia visual. Lo desarrolla el colectivo med-vlm-2026 y se inicializa a partir de Qwen3-VL-8B-Instruct, al que se aplica un ajuste supervisado seguido de optimizacion de politica relativa a grupos (GRPO). Su proposito es generar respuestas a preguntas clinicas sobre imagenes de torax acompanando cada afirmacion con la region o el hallazgo visual que la sustenta.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y un tamano de repositorio de 17,6 GB, coherente con un modelo de aproximadamente 8 mil millones de parametros en precision de 16 bits. La arquitectura declarada en los metadatos es `qwen3_vl`, es decir, un transformer multimodal con torre de vision y modelo de lenguaje subyacente de la familia Qwen3.

Su relevancia actual reside en la combinacion de dos tendencias: la especializacion de VLMs generalistas en dominios medicos concretos y el uso de aprendizaje por refuerzo con recompensas verificables (GRPO) para forzar que el razonamiento del modelo se ancle en la imagen en lugar de en conocimiento previo. No obstante, el propio autor lo declara exclusivamente para investigacion y no validado para uso clinico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (`qwen3_vl`): torre de vision + modelo de lenguaje Qwen3-VL |
| Parametros totales | Aproximadamente 8 000 millones (derivado de Qwen3-VL-8B-Instruct; el campo safetensors del Hub indica 774,385, probablemente recuento parcial) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MedVER parte de Qwen3-VL-8B-Instruct, un modelo multimodal generativo que combina un codificador visual con un modelo de lenguaje de la familia Qwen3. Sobre esa base se aplica un ajuste supervisado (SFT) con pares de radiografia de torax, pregunta y respuesta, y posteriormente un entrenamiento con GRPO, un algoritmo de optimizacion de politica que estima la ventaja relativa dentro de un grupo de respuestas muestreadas para la misma entrada, sin necesidad de un modelo critico separado.

El objetivo declarado del entrenamiento es el razonamiento fundamentado en evidencia visual: que el modelo localice y describa los hallazgos en la imagen antes de emitir una conclusion, en lugar de responder a partir de correlaciones aprendidas del corpus. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, el origen de las radiografias ni los detalles del reward model o de las funciones de recompensa empleadas en GRPO.

## Capacidades

- Respuesta a preguntas visuales (VQA) sobre radiografias de torax en ingles.
- Razonamiento fundamentado en evidencia visual: descripcion de hallazgos y regiones de la imagen que sustentan la respuesta.
- Generacion de texto multimodal a partir de imagen y prompt textual.
- Capacidad heredada de Qwen3-VL-8B-Instruct para instrucciones generales, potencialmente degradada por el ajuste especializado.
- Soporte de tool calling y function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente; el razonamiento por pasos se limita al ambito de la evidencia visual.
- Capacidades multilingues: solo ingles declarado.
- Modo thinking explicito, vision adicional (video, documentos) o audio: no disponible.

## Casos de uso

- Investigacion en VQA medica: banco de pruebas para medir hasta que punto el razonamiento por refuerzo mejora la fidelidad de las respuestas sobre radiografias de torax frente a un VLM generalista.
- Generacion de explicaciones con evidencia visual: util para estudiar tecnicas de atribucion y grounding, ya que el modelo esta entrenado para senalar la region que sustenta cada hallazgo.
- Anotacion asistida en conjuntos de datos: preetiquetado de pares pregunta-respuesta sobre radiografias para revision humana posterior, acelerando la construccion de corpus de investigacion.
- Evaluacion de robustez y sesgos en IA medica: analisis de como responde el modelo ante imagenes de baja calidad, artefactos o distribuciones fuera de dominio.
- Docencia y simulacion: generacion de preguntas y respuestas razonadas sobre casos radiologicos en entornos formativos, siempre con supervision de un especialista.
- Comparacion de paradigmas de entrenamiento: referencia para estudios que contrasten SFT puro frente a SFT + GRPO en tareas de razonamiento visual medico.
- Prototipado de interfaces de revision radiologica: integracion en herramientas de investigacion que muestren al usuario la evidencia visual asociada a cada afirmacion del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16-18 GB en FP16/BF16 para los pesos, mas memoria para el codificador visual y la cache KV; en cuantizacion de 8 bits, del orden de 9-11 GB, y en 4 bits, del orden de 5-7 GB (estimaciones a partir del tamano del repositorio, no verificadas).
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para despliegue en servidor con precision completa.
- GPU de consumo: cabe en RTX 4090 (24 GB) en FP16 y en GPUs de 12-16 GB con cuantizacion, siempre que se generen o conviertan pesos en formatos compatibles, ya que el repositorio solo publica safetensors.
- Opciones de despliegue: vLLM o TGI para servir el modelo multimodal en produccion; transformers como via de referencia; llama.cpp u Ollama solo si se generan cuantizaciones GGUF, no publicadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedVER | ~8B (base Qwen3-VL-8B) | no disponible | VQA en radiografia de torax con razonamiento visual y GRPO | Apache 2.0 | Hugging Face, safetensors |
| Qwen3-VL-8B-Instruct | ~8B | no disponible en la informacion proporcionada | VLM generalista multimodal | Apache 2.0 | Hugging Face |
| MedGemma (variantes) | no disponible en la informacion proporcionada | no disponible | VLM medico generalista | no disponible | Hugging Face |
| LLaVA-Med | no disponible en la informacion proporcionada | no disponible | VQA biomedica | no disponible | Hugging Face |

La comparacion cuantitativa de rendimiento no esta disponible: no se han publicado resultados de benchmarks para MedVER ni se dispone de cifras verificadas de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- No validado para uso clinico: el autor prohibe explicitamente su uso para diagnostico, triaje, decisiones terapeuticas o cualquier decision sobre pacientes.
- Riesgo de alucinacion: el modelo puede generar hallazgos inexistentes o interpretaciones erroneas, agravado por la variabilidad inherente a la generacion y a la calidad de la imagen de entrada.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento, por lo que no puede evaluarse el sesgo demografico, de equipo radiologico o de institucion.
- Idioma: solo se declara soporte de ingles, lo que limita su uso en entornos hispanohablantes sin traduccion intermedia.
- Longitud de contexto no documentada, lo que impide planificar conversaciones multi-turno largas o casos con multiples imagenes.
- Ausencia de cuantizaciones publicadas: el despliegue en hardware de consumo requiere conversion manual de los pesos.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- Incongruencia en los metadatos: el recuento de parametros del campo safetensors (774 385) no coincide con el tamano del repositorio ni con la base declarada, lo que aconseja verificar la integridad de los pesos antes de usarlos.
- Licencia Apache 2.0 permisiva para uso comercial del codigo y los pesos, pero esa permisividad no exime de las obligaciones regulatorias aplicables a productos sanitarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/med-vlm-2026/MedVER
- Modelo base Qwen3-VL-8B-Instruct: no disponible en la informacion proporcionada (referencia por nombre en la model card)
- Paper, blog o repositorio del proyecto: no disponible en la informacion proporcionada
- Demo o espacio asociado: no disponible en la informacion proporcionada
