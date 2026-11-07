# mradermacher/Iraq-AI-GGUF

## Resumen

Iraq-AI-GGUF es la versión cuantizada en formato GGUF del modelo Iraq-AI, publicado por el usuario `fwefdsfe` en Hugging Face y convertido a GGUF por mradermacher, un conocido mantenedor de cuantizaciones estáticas de modelos abiertos. Se trata de un modelo pequeño, con 752.393.024 parámetros totales (aproximadamente 0,75 mil millones), orientado a tareas de seguridad, código, matemáticas y razonamiento, según las etiquetas declaradas por el autor. El modelo base está entrenado para inglés y árabe, y se distribuye bajo licencia Apache 2.0.

La relevancia de esta ficha reside en que el modelo base es de autoría poco conocida y con escasa documentación técnica publicada: no se detallan la arquitectura interna, el número de tokens de entrenamiento ni los resultados de benchmarks. Las etiquetas del autor mencionan componentes como `deepseek-mla`, `kimi-rlvr`, `swe-gym` y `cybergym`, lo que sugiere inspiración o uso de técnicas de razonamiento y entrenamiento por refuerzo procedentes de esos linajes, pero no se aporta evidencia verificable en la información disponible.

El paquete GGUF incluye doce cuantizaciones estáticas que van desde Q2_K (0,5 GB) hasta f16 (1,6 GB), lo que permite desplegar el modelo en hardware muy modesto, incluso en CPU. Es un modelo adecuado para experimentación local y prototipado ligero, no para producción de alta exigencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas del autor mencionan `deepseek-mla`, sin confirmación técnica) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en), árabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo base `fwefdsfe/Iraq-AI`. Las etiquetas del autor incluyen referencias a `deepseek-mla` (atención con Multi-head Latent Attention, asociada a la familia DeepSeek), `kimi-rlvr` (entrenamiento por refuerzo con verificación, asociado a Kimi), `swe-gym` y `cybergym` (entornos de evaluación de agentes de código y ciberseguridad). Estas etiquetas sugieren que el autor declara haber empleado técnicas o entornos de entrenamiento inspirados en esos linajes, pero no se aporta documentación técnica, número de tokens, composición del dataset ni detalles sobre fases de RLHF o DPO.

El proceso de cuantización sí está documentado por mradermacher: se generaron cuantizaciones estáticas en formato GGUF mediante la herramienta de conversión de llama.cpp, con el tipo de salida `hf` y vocabulario original. El autor de la cuantización indica que no hay cuantizaciones ponderadas con imatrix disponibles en el momento de la publicación, y que podrían solicitarse mediante una discusión comunitaria. No se han publicado detalles sobre la innovación técnica del modelo base más allá de las etiquetas mencionadas.

## Capacidades

- Generación de texto conversacional en inglés y árabe.
- Razonamiento y resolución de problemas, según las etiquetas `reasoning` del autor.
- Generación y análisis de código, con etiqueta `code`.
- Matemáticas, con etiqueta `math`.
- Seguridad y ciberseguridad, con etiquetas `security` y `cybergym`.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita, aunque las etiquetas `swe-gym` y `cybergym` apuntan a entornos de agentes.
- Capacidades multilingües limitadas a inglés y árabe.
- Modo de razonamiento extendido (thinking mode): no disponible.
- Visión o audio: no disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales en inglés y árabe: el modelo cabe en menos de 1 GB en cuantización Q4_K_M, por lo que puede ejecutarse en portátiles sin GPU dedicada mediante llama.cpp u Ollama, lo que lo hace útil para demos y pruebas de concepto.
- Experimentación con modelos pequeños de razonamiento: investigadores que quieran comparar el comportamiento de un modelo de 0,75 B en tareas de matemáticas y lógica pueden usar las distintas cuantizaciones para estudiar el impacto de la precisión en la calidad de salida.
- Análisis estático de código en entornos con recursos limitados: la etiqueta `code` sugiere uso para tareas de revisión o generación de fragmentos, aunque sin garantías de calidad en producción.
- Formación y docencia: al ser un modelo pequeño y con licencia Apache 2.0, es adecuado para enseñar cuantización, despliegue con llama.cpp y evaluación de modelos en cursos técnicos.
- Evaluación de técnicas de seguridad ofensiva/defensiva en laboratorio: las etiquetas `security` y `cybergym` apuntan a un posible uso en ejercicios controlados de ciberseguridad, siempre con supervisión y en entornos aislados.
- Despliegue en dispositivos de borde (edge): con cuantizaciones de 0,5-0,9 GB, puede integrarse en aplicaciones móviles o embebidas que requieran generación de texto sin conexión.
- Traducción y asistencia bilingüe inglés-árabe en contextos de baja criticidad, dado el soporte declarado de ambos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,5 GB (Q2_K) y 1,6 GB (f16) para los pesos; añadir overhead de contexto y caché KV, típicamente 0,2-0,5 GB adicionales según longitud de contexto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como GTX 1050 Ti, GTX 1650, RTX 3050 o superiores. También funciona en CPU.
- Cabe en GPU de consumo: sí, en todas las GPU consumer modernas, incluidas las integradas con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF como llama-cpp-python. vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que se recomienda usar el modelo base en safetensors con esas herramientas.
- Latencia y throughput estimados: no disponibles. En CPU moderna, un modelo de 0,75 B en Q4_K_M puede generar del orden de decenas de tokens por segundo, pero no se aportan mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Iraq-AI-GGUF | 752 M | no disponible | en, ar | Apache 2.0 | GGUF |
| Qwen2.5-0.5B | 494 M | 32 K | multilingüe | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-1B | 1,24 B | 128 K | multilingüe | Llama 3.2 Community | safetensors, GGUF |
| Gemma-2-2B | 2,6 B | 8 K | multilingüe | Gemma Terms | safetensors, GGUF |

La comparación se basa en el tamaño y la categoría de modelo pequeño; no se dispone de datos de rendimiento de Iraq-AI para comparar benchmarks. Qwen2.5-0.5B y Llama-3.2-1B son alternativas consolidadas con documentación técnica extensa y contextos declarados, mientras que Iraq-AI carece de esas especificaciones públicas.

## Limitaciones y advertencias

- Documentación técnica muy escasa: no se publican arquitectura, contexto, datos de entrenamiento ni benchmarks, lo que impide evaluar su calidad de forma rigurosa.
- Riesgo elevado de alucinación y errores factuales, especialmente en un modelo de 0,75 B sin evaluación publicada.
- Sesgos desconocidos: al no documentarse la composición del dataset, no se pueden identificar sesgos de género, culturales o políticos.
- Cobertura lingüística limitada a inglés y árabe; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero la falta de garantías técnicas hace desaconsejable su uso en producción sin una evaluación previa exhaustiva.
- El modelo base es de autor poco conocido (`fwefdsfe`) y sin historial verificable; conviene tratar los pesos con las precauciones habituales de seguridad (revisión de código, ejecución en sandbox).
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso real.
- No se dispone de información sobre el contexto máximo soportado, lo que limita el diseño de aplicaciones que dependan de ventanas largas.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/Iraq-AI-GGUF
- Modelo base: https://huggingface.co/fwefdsfe/Iraq-AI
- Página de descargas del cuantizador: https://hf.tst.eu/model#Iraq-AI-GGUF
- Repositorio de solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de comparación de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
