# mradermacher/EVX-7B-Instruct-Pro-GGUF

## Resumen

EVX-7B-Instruct-Pro-GGUF es la versión cuantizada en formato GGUF del modelo imshreyansh/EVX-7B-Instruct-Pro, un modelo de lenguaje de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) afinado para instrucciones y conversación. La cuantización la ha realizado mradermacher, un conocido publicador de versiones GGUF de la comunidad, empleando el pipeline de Unsloth para la conversión. El modelo base está pensado para tareas de generación de texto conversacional en inglés.

El interés principal de esta publicación es práctico: ofrece el modelo en múltiples niveles de cuantización (desde Q2_K de 3,1 GB hasta f16 de 15,3 GB), lo que permite desplegarlo en hardware de consumo con llama.cpp u otros runtimes compatibles con GGUF. El repositorio pesa 68,1 GB en total porque incluye todas las variantes de cuantización en un único espacio.

La información pública disponible es escasa: no se detallan la arquitectura interna, la longitud de contexto, la licencia ni los datos de entrenamiento del modelo base. Esta ficha recoge lo que se puede verificar y marca explícitamente como "no disponible" todo aquello que no consta en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base tipo transformer, sin confirmar) |
| Parámetros totales | 7.615.616.512 (7,6 B) |
| Parámetros activos | no aplica (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base imshreyansh/EVX-7B-Instruct-Pro. Por el tamaño (7,6 B de parámetros) y la etiqueta "Instruct" se trata presumiblemente de un transformer decoder-only afinado para seguir instrucciones, pero no consta en la documentación el número de capas, la dimensión oculta, el mecanismo de atención ni la ventana de contexto. Tampoco se detallan los datos de entrenamiento: número de tokens, composición del corpus, ni si se aplicaron técnicas de RLHF, DPO o similares.

La aportación técnica de esta publicación es la cuantización. mradermacher ha generado cuantizaciones estáticas (no ponderadas/imatrix, según indica la propia model card) empleando el pipeline de Unsloth para la conversión a GGUF. La model card advierte de que las cuantizaciones con imatrix no estaban disponibles en el momento de la publicación y que podrían solicitarse mediante una discusión en la comunidad. Las cuantizaciones IQ (como IQ4_XS) suelen ofrecer mejor calidad que las no-IQ de tamaño similar, según las notas del propio autor.

## Capacidades

- Generación de texto conversacional en inglés, orientada a instrucciones (formato instruct).
- Razonamiento y respuesta a preguntas de propósito general, según el perfil habitual de un modelo de 7 B afinado para instrucciones.
- Compatibilidad con el ecosistema transformers y con runtimes que aceptan GGUF (llama.cpp y derivados).
- Etiqueta endpoints_compatible, lo que sugiere compatibilidad con endpoints de inferencia estándar.
- Capacidades de tool calling, agentes, visión, audio o modo thinking: no disponibles o no documentadas.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.

## Casos de uso

- Despliegue local en estaciones de trabajo: con la cuantización Q4_K_M (4,8 GB) el modelo se puede ejecutar en una GPU de consumo o incluso en CPU con llama.cpp, lo que permite tener un asistente conversacional sin conexión a servicios externos.
- Prototipado rápido de chatbots: la variante Q4_K_S (4,6 GB) está marcada como "fast, recommended" y sirve para iterar sobre prompts y flujos conversacionales antes de pasar a un modelo mayor.
- Evaluación comparativa de cuantizaciones: el repositorio incluye desde Q2_K hasta f16, lo que permite medir la degradación de calidad frente al tamaño en un mismo modelo y elegir el punto de equilibrio para producción.
- Inferencia en entornos con VRAM limitada: Q2_K (3,1 GB) o Q3_K_S (3,6 GB) permiten ejecutar el modelo en GPUs de gama de entrada o compartir GPU con otras tareas.
- Generación de texto asistida en pipelines de CI o scripts: al ser GGUF y funcionar con llama.cpp, se puede integrar en herramientas de línea de comandos para tareas de resumen o redacción en inglés.
- Experimentación académica con modelos pequeños: útil para estudiar el efecto de la cuantización en un modelo de 7 B instruct sin necesidad de infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de archivo, con overhead adicional de contexto y KV cache):
  - Q2_K: ~3,1 GB de pesos; ~4 GB de VRAM total recomendada.
  - Q3_K_S / Q3_K_M / Q3_K_L: ~3,6-4,2 GB de pesos; ~4,5-5 GB recomendados.
  - IQ4_XS / Q4_K_S / Q4_K_M: ~4,4-4,8 GB de pesos; ~5,5-6 GB recomendados.
  - Q5_K_S / Q5_K_M: ~5,4-5,5 GB de pesos; ~6,5 GB recomendados.
  - Q6_K: ~6,4 GB de pesos; ~7,5 GB recomendados.
  - Q8_0: ~8,2 GB de pesos; ~9,5 GB recomendados.
  - f16: ~15,3 GB de pesos; ~17 GB recomendados.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 para las cuantizaciones altas; A100/H100 no son necesarias para un modelo de este tamaño.
- Cabe en GPU de consumo: sí, desde Q2_K hasta Q8_0 en GPUs con 8-12 GB de VRAM; f16 requiere 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base también es compatible con transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de modelos comparables verificables en la información proporcionada. Como referencia estructural, se puede comparar con otros modelos de ~7 B en GGUF, pero sin cifras de benchmarks no es posible establecer una comparación rigurosa.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| EVX-7B-Instruct-Pro (esta ficha) | 7,6 B | no disponible | no disponible | GGUF |
| Alternativas de ~7 B en GGUF | no disponible | no disponible | no disponible | GGUF |

## Limitaciones y advertencias

- La licencia no está especificada en la información disponible; antes de un uso comercial es imprescindible consultar la model card del modelo base imshreyansh/EVX-7B-Instruct-Pro.
- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- No se documentan la longitud de contexto ni el comportamiento en conversaciones de muchos turnos.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M para uso general.
- Las cuantizaciones ponderadas/imatrix no estaban disponibles en el momento de la publicación, lo que puede suponer una ligera pérdida de calidad frente a versiones imatrix.
- Existe riesgo de alucinación inherente a los modelos de 7 B, especialmente en tareas de conocimiento factual.
- El número de descargas y likes es muy bajo (5 descargas, 0 likes), lo que indica escasa validación por parte de la comunidad.
- No hay información sobre sesgos, filtrado de seguridad ni evaluación de riesgos del modelo base.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/EVX-7B-Instruct-Pro-GGUF
- Modelo base: https://huggingface.co/imshreyansh/EVX-7B-Instruct-Pro
- Página de descargas del autor: https://hf.tst.eu/model#EVX-7B-Instruct-Pro-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
