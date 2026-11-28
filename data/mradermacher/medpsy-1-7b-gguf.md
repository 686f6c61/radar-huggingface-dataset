# mradermacher/MedPsy-1.7B-GGUF

## Resumen

MedPsy-1.7B-GGUF es la versión cuantizada en formato GGUF del modelo MedPsy-1.7B, un modelo de lenguaje especializado en dominio médico y sanitario desarrollado originalmente por qvac (asociado a tether-ai) y cuantizado por mradermacher. El modelo base emplea una arquitectura derivada de Qwen3 con aproximadamente 2.031 millones de parámetros (2,03 B), lo que lo sitúa en la categoría de modelos pequeños orientados a despliegue en el borde (edge) y en dispositivos locales. Su propósito es ofrecer capacidades conversacionales y de razonamiento clínico en entornos con recursos limitados.

La relevancia de esta ficha radica en que combina tres factores poco habituales: especialización médica, tamaño reducido y disponibilidad en múltiples niveles de cuantización GGUF (desde Q2_K de 1,0 GB hasta f16 de 4,2 GB). Esto permite ejecutar el modelo en hardware de consumo, portátiles e incluso dispositivos embebidos, algo crítico en escenarios sanitarios donde la privacidad de los datos impide enviar información a la nube. La licencia Apache 2.0 facilita su uso comercial e integración en productos.

El modelo está etiquetado con idioma inglés (`en`) y con la referencia a NeurIPS 2026, lo que sugiere que su publicación está vinculada a un trabajo académico. No obstante, la model card del repositorio cuantizado es escueta y no aporta detalles sobre el entrenamiento, los datos utilizados ni los resultados de evaluación, por lo que muchos apartados técnicos deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen3 (según etiquetas del repositorio; detalles no disponibles) |
| Parametros totales | 2.031.739.904 (aprox. 2,03 B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (además de cuantizaciones ponderadas/imatrix en el repo i1-GGUF) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base qvac/MedPsy-1.7B se distribuye en formato transformers/safetensors |

## Arquitectura y entrenamiento

La información disponible indica que el modelo base es `qvac/MedPsy-1.7B`, etiquetado con `qwen3`, lo que apunta a una arquitectura transformer decoder-only derivada de la familia Qwen3. El recuento real de parámetros en safetensors es de 2.031.739.904, ligeramente superior a los 1,7 B que sugiere el nombre comercial, algo habitual cuando se incluyen embeddings y capas de salida. No se dispone de detalles sobre el número de capas, dimensiones ocultas, número de cabezas de atención ni sobre la implementación concreta de atención (si emplea atención lineal, decodificación especulativa u otras optimizaciones).

Respecto al entrenamiento, la model card no documenta el volumen de tokens, la composición del corpus médico, ni si se aplicaron técnicas de ajuste como RLHF, DPO o instrucción supervisada. Las etiquetas `medical`, `healthcare`, `clinical`, `edge` y `on-device` indican la intención del autor de especializar el modelo en dominio sanitario y optimizarlo para inferencia local, pero no se aportan cifras verificables. La referencia a `neurips-2026` sugiere la existencia de un artículo asociado, aunque no se enlaza en la información proporcionada.

## Capacidades

- Generación de texto conversacional en inglés, orientada a interacciones de tipo chat clínico.
- Razonamiento en dominio médico y sanitario (etiquetas `medical`, `healthcare`, `clinical`).
- Despliegue en el borde y en dispositivos locales (`edge`, `on-device`), gracias a su tamaño reducido y a las cuantizaciones GGUF.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Asistente clínico en dispositivos locales: el modelo puede ejecutarse en un portátil o estación de trabajo sin conexión, gestionando consultas conversacionales sobre terminología médica y manteniendo la privacidad de los datos del paciente al no requerir envío a la nube.
- Triaje y orientación inicial en entornos con conectividad limitada: gracias a las cuantizaciones Q4_K_S o Q4_K_M (1,3-1,4 GB), puede desplegarse en equipos modestos de clínicas rurales para ofrecer respuestas preliminares en inglés sobre síntomas y derivación.
- Formación y simulación para personal sanitario: el modelo puede generar escenarios conversacionales de práctica clínica en inglés, útil para entrenamiento de estudiantes de medicina en entornos controlados.
- Procesamiento de documentación clínica en inglés: resumen y reformulación de notas o textos médicos en pipelines locales, aprovechando el tamaño reducido para integrarse en herramientas de escritorio.
- Prototipado rápido de aplicaciones sanitarias: la licencia Apache 2.0 y la disponibilidad en GGUF permiten a desarrolladores experimentar con un modelo especializado sin costes de licencia ni infraestructura GPU dedicada.
- Investigación en IA médica de bajo consumo: sirve como baseline ligero para comparar el rendimiento de modelos especializados pequeños frente a modelos generalistas de mayor tamaño en tareas clínicas en inglés.
- Inferencia en el borde con Ollama o llama.cpp: la variedad de cuantizaciones (desde 1,0 GB en Q2_K) permite ejecutarlo en dispositivos con poca memoria, como Raspberry Pi de gama alta o mini-PC, para asistentes médicos embebidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0 GB (Q2_K), 1,3-1,4 GB (Q4_K_S / Q4_K_M), 1,8 GB (Q6_K) y 2,3 GB (Q8_0), además de la memoria para el contexto KV.
- GPU recomendadas: al ser un modelo de 2 B, cualquier GPU consumer moderna es suficiente; una RTX 3060 (12 GB), RTX 4060 (8 GB) o RTX 4090 (24 GB) lo ejecutan con holgura. En entornos de servidor, una A100 o H100 no son necesarias pero funcionarán sin problema.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU con 4 GB o más de VRAM, e incluso en iGPU y CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. El modelo base (safetensors) puede servirse con vLLM o TGI si se dispone de los pesos originales.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Especialización |
|---|---|---|---|---|---|
| MedPsy-1.7B-GGUF | ~2,03 B | No disponible | Apache 2.0 | GGUF | Médica / edge |
| Qwen3-1.7B (base de referencia) | ~1,7 B | No disponible en esta ficha | Apache 2.0 | safetensors / GGUF | Generalista |
| Meditron-7B | 7 B | No disponible en esta ficha | Llama 2 (uso restringido) | safetensors | Médica |
| BioMistral-7B | 7 B | No disponible en esta ficha | Apache 2.0 | safetensors | Biomédica |

La comparación con Qwen3-1.7B es pertinente porque MedPsy deriva de esa familia; MedPsy añade especialización médica a costa de un tamaño ligeramente mayor. Frente a Meditron-7B y BioMistral-7B, MedPsy-1.7B ofrece un tamaño mucho menor (ideal para edge) y licencia Apache 2.0, aunque no se dispone de datos de rendimiento comparativo para validar la calidad clínica.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; como modelo entrenado probablemente con datos en inglés, puede reflejar sesgos de las fuentes clínicas utilizadas.
- Riesgo de alucinación: elevado en dominio médico, especialmente en cuantizaciones agresivas (Q2_K, Q3_K_S); no debe usarse como sustituto del juicio clínico profesional.
- Limitaciones de contexto o idioma: solo inglés según la etiqueta de idioma; la longitud de contexto no está documentada, lo que impide planificar conversaciones largas con garantías.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no debe interpretarse como dispositivo médico regulado; su uso en diagnóstico o tratamiento requeriría validación regulatoria adicional.
- Caveats para producción: la model card del repositorio cuantizado no aporta información sobre evaluación, datos de entrenamiento ni limitaciones; se recomienda consultar el repositorio base `qvac/MedPsy-1.7B` antes de un despliegue real. Las cuantizaciones de baja precisión pueden degradar notablemente la calidad en tareas clínicas sensibles.

## Enlaces

- Repositorio Hugging Face (cuantizado): https://huggingface.co/mradermacher/MedPsy-1.7B-GGUF
- Modelo base: https://huggingface.co/qvac/MedPsy-1.7B
- Licencia del modelo base: https://huggingface.co/qvac/MedPsy-1.7B/blob/main/LICENSE
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/MedPsy-1.7B-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#MedPsy-1.7B-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
