# mradermacher/AxonMed-32B-Thinking-GGUF

## Resumen

AxonMed-32B-Thinking-GGUF es la versión cuantizada en formato GGUF del modelo AxonMed-32B-Thinking, publicado por el usuario mradermacher (conocido por generar cuantizaciones estáticas de modelos de terceros para su uso con llama.cpp y herramientas compatibles). El modelo base, alojado en el repositorio Saathimed/AxonMed-32B-Thinking, es un modelo de 32.763.876.352 parámetros (aproximadamente 32,8 mil millones) orientado a conversación y, por su nombre, con un modo de razonamiento explícito ("Thinking") y probable especialización en dominio médico.

La relevancia de esta ficha radica en que permite ejecutar un modelo de ~32B con razonamiento en hardware de consumo o servidores modestos, gracias a las 11 cuantizaciones estáticas publicadas (desde Q2_K hasta F16, incluyendo IQ4_XS y variantes K). El repositorio ocupa 31,1 GB en total y fue creado el 16 de noviembre de 2026.

No se dispone de información pública sobre el desarrollador original, la licencia, los idiomas soportados ni los datos de entrenamiento en la información proporcionada. Todos los datos técnicos que siguen provienen de los metadatos de Hugging Face y de la model card del cuantizador; cualquier aspecto no documentado se marca como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (deducida del formato GGUF y del tamaño; detalles no disponibles) |
| Parametros totales | 32.763.876.352 (~32,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas generadas con quantize_version 2, convert_type hf) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. Por el tamaño de parámetros (32,8B) y el formato de conversión (convert_type hf, es decir, partiendo de pesos en formato Hugging Face), se trata con alta probabilidad de un transformer decoder-only denso, aunque no se confirma si emplea atención lineal, decodificación especulativa u otras innovaciones. El sufijo "Thinking" sugiere un modo de razonamiento extendido (cadena de pensamiento explícita), pero no se documenta el mecanismo exacto.

Tampoco se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. El nombre "AxonMed" apunta a una especialización en dominio médico, pero esta afirmación no está respaldada por documentación técnica en la información proporcionada. Las cuantizaciones publicadas son estáticas (no imatrix), con output_tensor_quantised activado y sin fichero mmproj, lo que indica que el modelo es solo texto (sin componente de visión).

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta "conversational" del repositorio.
- Razonamiento explícito en modo "Thinking" (deducido del nombre; mecanismo no documentado).
- Posible especialización en dominio médico (deducido del nombre "AxonMed"; no confirmado).
- Compatibilidad con endpoints (tag endpoints_compatible), lo que facilita su despliegue en infraestructuras de inferencia compatibles.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponibles (sin fichero mmproj, se descarta visión).

## Casos de uso

- Despliegue local de un modelo de ~32B con razonamiento: gracias a las cuantizaciones Q4_K_M o IQ4_XS, el modelo puede ejecutarse en una GPU de consumo de 24 GB (RTX 3090/4090) o en configuraciones CPU+GPU con llama.cpp, permitiendo probar razonamiento de gran tamaño sin infraestructura de datacenter.
- Asistencia en documentación clínica (si se confirma la especialización médica): resumen y estructuración de notas e informes, con la advertencia de que requiere validación humana por el riesgo de alucinación en dominio sanitario.
- Chatbot conversacional de dominio específico: la etiqueta "conversational" y el contexto de 32B permiten mantener diálogos multi-turno con mayor coherencia que modelos de 7B-13B, integrándose vía endpoints compatibles.
- Prototipado de pipelines de razonamiento: el modo "Thinking" permite experimentar con cadenas de razonamiento en tareas de análisis o resolución de problemas antes de invertir en modelos mayores.
- Evaluación comparativa de cuantizaciones: al publicarse 11 variantes (Q2_K a F16), es útil para medir la degradación de calidad frente a tamaño en un modelo de 32B con razonamiento.
- Inferencia en servidores sin GPU dedicada: las variantes Q2_K y Q3_K_S permiten ejecución en CPU con RAM suficiente (aproximadamente 14-16 GB para Q2_K), útil para entornos de desarrollo o pruebas.
- Fine-tuning o destilación posterior: los pesos F16 del repositorio pueden servir como base para ajuste fino, aunque la licencia no disponible impide confirmar si el uso comercial está permitido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - F16: ~65 GB.
  - Q8_0: ~35 GB.
  - Q6_K: ~27 GB.
  - Q5_K_M: ~23 GB.
  - Q4_K_M: ~20 GB.
  - IQ4_XS: ~18 GB.
  - Q3_K_M: ~16 GB.
  - Q2_K: ~12-13 GB.
- GPU recomendadas: A100 80 GB o H100 para F16/Q8_0; RTX 4090 (24 GB) o A6000 (48 GB) para Q4_K_M/Q5_K_M; RTX 3090 (24 GB) para IQ4_XS o Q4_K_S.
- ¿Cabe en GPU de consumo? Sí: las variantes Q4_K_M, IQ4_XS y Q3_K_M caben en GPUs de 24 GB, aunque el contexto largo puede requerir offloading parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, y servidores compatibles con endpoints (tag endpoints_compatible). vLLM y TGI no soportan GGUF de forma nativa sin conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AxonMed-32B-Thinking-GGUF | ~32,8B | no disponible | no disponible | GGUF | Cuantizaciones estáticas, modo Thinking, posible dominio médico |
| Qwen2.5-32B-Instruct (referencia) | ~32,8B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Modelo denso generalista con cuantizaciones comunitarias |
| Gemma 2 27B (referencia) | ~27B | 8.192 tokens | Gemma License | safetensors, GGUF | Alternativa de tamaño similar con licencia restrictiva |
| Yi-34B (referencia) | ~34B | 4.096-200.000 tokens | Apache 2.0 | safetensors, GGUF | Mayor tamaño, contexto variable según variante |

La comparativa se basa en características públicas de modelos de la misma categoría; no se dispone de datos de rendimiento de AxonMed-32B-Thinking para comparar benchmarks.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; verificar el repositorio base (Saathimed/AxonMed-32B-Thinking) antes de cualquier despliegue en producción.
- Riesgo de alucinación: si el modelo está especializado en dominio médico, las alucinaciones pueden tener consecuencias graves; se requiere validación humana y no debe usarse como sustituto de criterio clínico.
- Idiomas no documentados: no se puede garantizar un rendimiento adecuado en castellano u otros idiomas distintos del inglés.
- Contexto no documentado: se desconoce la ventana máxima; configurar valores conservadores en llama.cpp para evitar degradación.
- Cuantizaciones agresivas (Q2_K, Q3_K_S) pueden degradar notablemente el razonamiento en un modelo de 32B; se recomienda Q4_K_M o superior para tareas sensibles.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria, sin evidencia de calidad ni de estabilidad.
- Sin fichero mmproj: no hay soporte multimodal.
- El cuantizador (mradermacher) no es el autor original; posibles incidencias de conversión no documentadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AxonMed-32B-Thinking-GGUF
- Modelo base: https://huggingface.co/Saathimed/AxonMed-32B-Thinking
