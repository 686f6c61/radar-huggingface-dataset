# mradermacher/G4-MeroMero-26B-A4B-Heretic2-GGUF

## Resumen

G4-MeroMero-26B-A4B-Heretic2-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo G4-MeroMero-26B-A4B-Heretic2, publicado por el usuario EternalDragon en HuggingFace. El trabajo de conversión y cuantización lo firma mradermacher, un perfil habitual en la publicación de versiones GGUF de modelos comunitarios para su uso con llama.cpp y herramientas derivadas. El modelo base no cuenta con model card detallada en la información disponible, por lo que muchos de sus detalles de entrenamiento y procedencia no se pueden confirmar.

El nombre delata parte de su naturaleza: el sufijo "A4B" sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 4 mil millones de parámetros activos, mientras que el recuento real de parámetros en safetensors asciende a 25.233.142.046 (unos 25,2 mil millones). El término "Heretic" es habitual en la comunidad para designar ajustes que eliminan o atenúan los mecanismos de rechazo aprendidos por alineamiento, lo que sitúa al modelo en la categoría de variantes "uncensored" o con alineamiento reducido. El tag "conversational" indica que está orientado a diálogo.

La relevancia de esta ficha es práctica: permite a desarrolladores que trabajan con llama.cpp, Ollama o LM Studio disponer de versiones cuantizadas del modelo sin tener que convertirlo ellos mismos. El repositorio ocupa 133,7 GB e incluye un abanico amplio de niveles de cuantización, desde Q2_K hasta F16, lo que facilita desplegarlo en hardware muy diverso. No obstante, la ausencia de licencia explícita, de idiomas declarados y de benchmarks publicados limita seriamente su uso en producción sin una evaluación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), inferida del sufijo "A4B"; detalles no disponibles |
| Parámetros totales | 25.233.142.046 (≈25,2 B) |
| Parámetros activos | ≈4 B (inferido del sufijo "A4B"; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base G4-MeroMero-26B-A4B-Heretic2 procede del usuario EternalDragon y, por el patrón de nombres, parece derivar de una arquitectura MoE con unos 25 mil millones de parámetros totales y aproximadamente 4 mil millones activos por token. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el proceso de alineamiento (RLHF, DPO u otros) ni las innovaciones técnicas empleadas. El sufijo "Heretic" apunta a un ajuste orientado a reducir los rechazos del modelo, práctica común en la comunidad para obtener respuestas menos restrictivas, pero no hay documentación que lo confirme.

Este repositorio concreto no contiene el modelo original, sino una batería de cuantizaciones estáticas generadas con llama.cpp (se observa en los metadatos `quantize_version: 2` y `output_tensor_quantised: 1`). La conversión parte de pesos en formato HuggingFace (`convert_type: hf`) y produce ficheros GGUF listos para inferencia en CPU y GPU con llama.cpp y compatibles. No se ha aplicado cuantización del proyector multimodal (`skip_mmproj` vacío, sin indicios de visión).

## Capacidades

- Generación de texto conversacional, según el tag `conversational` del repositorio.
- Razonamiento y respuesta multi-turno, presumiblemente, aunque no hay documentación que lo verifique.
- Capacidad MoE con activación parcial de expertos (inferida), lo que en teoría reduce el coste de inferencia respecto a un modelo denso del mismo tamaño.
- Alineamiento reducido ("Heretic"), lo que implica menor tendencia a rechazar peticiones, a costa de posibles respuestas menos filtradas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar un modelo de ~25 B con activación parcial en GPUs de consumo, útil para prototipado y pruebas offline sin depender de APIs.
- Experimentación con modelos "uncensored": investigadores que estudian el efecto del alineamiento pueden comparar esta variante Heretic con el modelo base para analizar diferencias en tasas de rechazo y estilo de respuesta.
- Chat conversacional autoalojado: el tag `conversational` y el formato GGUF lo hacen apto para montar un asistente local con llama.cpp u Ollama, siempre que se acepte la falta de garantías de licencia.
- Evaluación comparativa de cuantizaciones: al ofrecer 12 niveles distintos, sirve para medir la degradación de calidad entre Q2_K y F16 en tareas concretas antes de fijar un nivel para producción.
- Generación de texto creativo y role-play: los modelos con alineamiento atenuado suelen emplearse en escritura creativa y simulación de personajes, donde los filtros restrictivos resultan limitantes.
- Investigación sobre eficiencia MoE: con ~4 B activos sobre ~25 B totales, es un banco de pruebas para estudiar el equilibrio entre calidad y coste computacional en arquitecturas dispersas.
- Integración en pipelines de CI para pruebas de inferencia: el formato GGUF y las herramientas de llama.cpp permiten automatizar pruebas de humo del modelo sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño y cuantización):
  - F16: ~50 GB (no cabe en GPU de consumo).
  - Q8_0: ~27 GB.
  - Q6_K: ~21 GB.
  - Q5_K_M: ~18 GB.
  - Q4_K_M: ~15-16 GB.
  - Q3_K_M: ~12-13 GB.
  - Q2_K: ~9-10 GB.
- GPU recomendadas: A100 40/80 GB o H100 para F16 y Q8_0; RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090/4080 (16-24 GB) para Q4 y Q3.
- Cabe en GPU de consumo: sí, con cuantizaciones Q4_K_M o inferiores en GPUs de 16-24 GB; las versiones Q2_K y Q3 pueden ejecutarse incluso en 12 GB, con pérdida de calidad notable.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). vLLM y TGI no soportan GGUF de forma nativa para este tipo de modelos sin conversión previa.
- Latencia y throughput estimados: no disponibles; dependerán de la GPU, del nivel de cuantización y del grado de offloading a CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| G4-MeroMero-26B-A4B-Heretic2-GGUF | ~25,2 B totales / ~4 B activos | no disponible | no disponible | GGUF | Variante Heretic, cuantizaciones estáticas de mradermacher |
| Modelo base G4-MeroMero-26B-A4B-Heretic2 | ~25,2 B totales / ~4 B activos | no disponible | no disponible | safetensors | Origen de las cuantizaciones, sin model card detallada |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables para comparar |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; en la práctica, esto bloquea su adopción en producción sin aclaración previa del autor.
- Idiomas no declarados: se desconoce el rendimiento en castellano y en otros idiomas; es probable que el modelo esté sesgado hacia el inglés, pero no se puede verificar.
- Alineamiento reducido ("Heretic"): mayor riesgo de generar contenido inapropiado, ofensivo o inseguro; requiere filtros externos si se expone a usuarios finales.
- Riesgo de alucinación: sin benchmarks ni documentación de entrenamiento, no hay forma de cuantificar la fiabilidad factual; se debe validar en el dominio de uso.
- Ausencia de model card detallada: no hay información sobre datos de entrenamiento, sesgos conocidos ni limitaciones específicas.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin verificar experimentalmente la ventana real.
- Repositorio de 133,7 GB: la descarga completa es costosa; conviene bajar solo el fichero de la cuantización necesaria.
- Modelo comunitario sin respaldo de un laboratorio: sin garantías de mantenimiento, actualizaciones ni soporte.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) degradan la calidad de forma perceptible; para uso serio, partir de Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/G4-MeroMero-26B-A4B-Heretic2-GGUF
- Modelo base: https://huggingface.co/EternalDragon/G4-MeroMero-26B-A4B-Heretic2
- Perfil del cuantizador: https://huggingface.co/mradermacher
- llama.cpp (motor de inferencia GGUF): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- Papers, blogs y demos adicionales: no disponibles
