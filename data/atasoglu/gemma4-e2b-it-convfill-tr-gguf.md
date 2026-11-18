# atasoglu/gemma4-e2b-it-ConvFill-TR-GGUF

## Resumen

`atasoglu/gemma4-e2b-it-ConvFill-TR-GGUF` es una conversión a formato GGUF del modelo `atasoglu/gemma4-e2b-it-ConvFill-TR`, un ajuste fino mediante LoRA del modelo base `google/gemma-4-E2B-it` de Google orientado a una tarea muy concreta: el *conversational infill* en turco para asistentes de voz. El modelo no está pensado para generación de texto libre, sino para completar huecos en conversaciones ya iniciadas, una tarea típica en sistemas de dictado, subtitulado asistido o asistentes que sugieren la siguiente intervención del usuario.

El autor, atasoglu, parte del modelo Gemma 4 E2B instruction-tuned, le aplica un LoRA entrenado sobre el dataset `atasoglu/convfill-dataset-tr-10k` (10.000 ejemplos de infill conversacional en turco) y publica el resultado en dos cuantizaciones GGUF: Q8_0 (4,7 GB) y Q4_K_M (3,3 GB). El proceso de conversión es cuidadoso: se desquantiza la base de 4 bits, se fusiona el LoRA en bf16, se convierte a GGUF BF16 y finalmente se cuantiza, lo que evita la degradación típica de fusionar un adaptador sobre pesos ya cuantizados.

La relevancia de esta ficha radica en que documenta un caso de uso muy específico (infill conversacional en turco) sobre una familia de modelos reciente, con métricas de fidelidad de cuantización publicadas (divergencia KL y coincidencia top-1) y con un modo de uso no estándar: el endpoint `/completion` en crudo en lugar del endpoint de chat, para evitar que la plantilla de Gemma interfiera con el formato de infill.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4), ajuste fino con LoRA |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q4_K_M (publicadas en el repo) |
| Idiomas soportados | Turco (tr) |
| Licencia | Gemma (Gemma Terms of Use + Prohibited Use Policy) |
| Formato de pesos | GGUF (llama.cpp); el modelo base original en safetensors |
| Tamano del repo | 8,4 GB |
| Tarea | Conversational infill (text-generation) |
| Dataset de entrenamiento | atasoglu/convfill-dataset-tr-10k |
| Fecha de publicacion | 2026-11-17 |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-E2B-it`, un transformer decoder-only de la familia Gemma 4 en su variante E2B (aproximadamente 4,6 mil millones de parámetros según el recuento real de safetensors). Sobre esa base, el autor entrena un adaptador LoRA para la tarea de *conversational infill*: dado un contexto conversacional con un hueco, el modelo genera el contenido que falta. El dataset utilizado es `atasoglu/convfill-dataset-tr-10k`, con 10.000 ejemplos en turco; los hiperparámetros concretos del entrenamiento no se detallan en la información disponible.

La innovación técnica de esta publicación no está en el entrenamiento, sino en el pipeline de cuantización. El autor parte de una base ya cuantizada a 4 bits, la desquantiza, fusiona el LoRA en bf16, convierte a GGUF BF16 y solo entonces cuantiza a Q8_0 y Q4_K_M. Este orden evita el error acumulado de fusionar un adaptador sobre pesos cuantizados. Además, se publican métricas de fidelidad medias sobre 40 secuencias de 512 tokens del conjunto de validación: Q8_0 presenta una divergencia KL de 0,0024 frente a BF16 y un 98,1 % de coincidencia en el token top-1, mientras que Q4_K_M sube a 0,0887 de KL y baja al 87,8 % de coincidencia. El autor califica Q8_0 como prácticamente sin pérdida y Q4_K_M como más rápido pero con una caída de calidad visible.

## Capacidades

- Generación de texto orientada específicamente a *conversational infill* en turco: completar turnos o fragmentos ausentes en una conversación.
- Integración con asistentes de voz: el modelo está etiquetado como `voice-assistant` y `conversational`.
- Generación de texto general heredada del modelo base Gemma 4 E2B instruction-tuned (razonamiento, código, matemáticas), aunque el ajuste fino puede degradar estas capacidades fuera del dominio de infill.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada para este ajuste.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al turco según la etiqueta de idioma; el modelo base soporta más idiomas, pero el ajuste fino está especializado en turco.
- Modo *thinking* o vision: no disponible en la información proporcionada.

## Casos de uso

- Asistentes de voz en turco: el modelo completa la intervención del usuario o del asistente en conversaciones ya iniciadas, lo que permite sugerir respuestas o autocompletar dictados en tiempo real. Es su caso de uso principal y el que motivó el ajuste fino.
- Autocompletado en herramientas de dictado o transcripción: dado un fragmento de transcripción con un hueco (por ruido, corte de audio o silencio), el modelo infiere el contenido faltante a partir del contexto previo.
- Subtitulado asistido en turco: completar segmentos perdidos o ambiguos en una transcripción conversacional manteniendo coherencia con los turnos anteriores.
- Chatbots de atención al cliente en turco: rellenar respuestas parciales o generar la continuación de un turno en conversaciones multi-turno, siempre que se use el endpoint `/completion` con parada en `<turn|>`.
- Sistemas de accesibilidad: sugerencias de texto para usuarios con dificultades motoras que escriben por fragmentos, aprovechando el contexto conversacional para completar frases.
- Investigación en infill conversacional: servir como baseline reproducible para comparar técnicas de infill en turco, gracias a la publicación del dataset, el adaptador y las métricas de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad de cuantización y velocidad de generación:

| Metrica | Q8_0 | Q4_K_M |
|---|---|---|
| Tamano del fichero | 4,7 GB | 3,3 GB |
| Divergencia KL vs BF16 | 0,0024 | 0,0887 |
| Coincidencia top-1 | 98,1 % | 87,8 % |
| Velocidad de generacion (RTX 5070) | ~183 tok/s | ~208 tok/s |

Las métricas de KL y top-1 se midieron sobre 40 secuencias de 512 tokens del conjunto de validación.

## Requisitos de hardware

- VRAM estimada: Q8_0 requiere aproximadamente 5-6 GB de VRAM para los pesos más overhead de contexto; Q4_K_M requiere aproximadamente 3,5-4,5 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para Q8_0; 6 GB para Q4_K_M. El autor reporta pruebas en una RTX 5070.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 5070 y superiores. En GPUs de 4-6 GB solo con Q4_K_M y contextos cortos.
- Opciones de despliegue: llama.cpp (`llama-server`), con `-ngl 99 -fa on` según el ejemplo del autor; también compatible con Ollama y otros frontends basados en llama.cpp.
- Latencia y throughput: ~183 tok/s con Q8_0 y ~208 tok/s con Q4_K_M en una RTX 5070, según el autor.
- Nota de uso: debe usarse el endpoint `/completion` en crudo (no el endpoint de chat, que aplicaría la plantilla de Gemma) y detener la generación en el token `<turn|>`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| gemma4-e2b-it-ConvFill-TR-GGUF (este) | 4,65 B | no disponible | tr | Gemma | GGUF |
| google/gemma-4-E2B-it (base) | ~4,6 B | no disponible | multilingue | Gemma | safetensors |
| atasoglu/gemma4-e2b-it-ConvFill-TR (adaptador) | ~4,6 B | no disponible | tr | Gemma | safetensors |

La comparación con alternativas de la misma categoría (modelos de infill conversacional en turco) no está disponible en la información proporcionada. El modelo base Gemma 4 E2B es la referencia natural, pero no está especializado en infill y no se han publicado comparativas de rendimiento entre ambos en esta tarea.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste fino está entrenado exclusivamente para *conversational infill* en turco; su rendimiento en generación libre, código o matemáticas puede ser inferior al del modelo base.
- Idioma: solo turco según la etiqueta de idioma; no se garantiza un comportamiento correcto en otros idiomas.
- Formato de uso no estándar: requiere el endpoint `/completion` en crudo y parada en `<turn|>`; usar el endpoint de chat con la plantilla de Gemma produce resultados incorrectos.
- Riesgo de alucinación: como todo modelo generativo, puede inventar contenido al rellenar huecos, especialmente con contextos ambiguos o largos.
- Sesgos: no se documentan sesgos específicos en la información disponible; hereda los del modelo base Gemma 4 E2B y los del dataset de entrenamiento.
- Licencia: Gemma Terms of Use, que incluye la Prohibited Use Policy de Google y restricciones para uso comercial; es necesario revisar los términos antes de desplegar en producción.
- Cuantización Q4_K_M: el propio autor advierte de una caída de calidad visible (87,8 % de coincidencia top-1 frente a BF16); para producción se recomienda Q8_0.
- Contexto: la longitud de contexto no está documentada en la información disponible, lo que dificulta planificar despliegues con conversaciones largas.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/atasoglu/gemma4-e2b-it-ConvFill-TR-GGUF
- Modelo base del ajuste (adaptador): https://huggingface.co/atasoglu/gemma4-e2b-it-ConvFill-TR
- Modelo base original de Google: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/atasoglu/convfill-dataset-tr-10k
- Paper ConvFill: https://arxiv.org/abs/2511.07397
- Licencia Gemma: https://ai.google.dev/gemma/terms
- Prohibited Use Policy de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
