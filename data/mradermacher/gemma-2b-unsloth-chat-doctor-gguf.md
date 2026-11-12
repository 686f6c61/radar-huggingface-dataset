# mradermacher/gemma-2b-unsloth-chat-doctor-GGUF

## Resumen

`mradermacher/gemma-2b-unsloth-chat-doctor-GGUF` es una recopilación de cuantizaciones GGUF estáticas del modelo base `JC-24/gemma-2b-unsloth-chat-doctor`, publicadas por el usuario mradermacher. El modelo subyacente parte de Gemma 2B de Google y ha sido ajustado con la librería Unsloth, presumiblemente para tareas de conversación con orientación sanitaria o "doctor", aunque la model card original no detalla el dataset de ajuste. El repositorio no contiene los pesos originales en safetensors, sino únicamente los ficheros GGUF listos para su uso con llama.cpp y derivados.

El interés de esta ficha reside en su utilidad práctica: permite ejecutar un modelo de 2.500 millones de parámetros en hardware modesto (incluso en CPU) con cuantizaciones que van desde 1,3 GB hasta 5,1 GB. Al estar basado en Gemma 2B, hereda la arquitectura transformer decoder-only de Google, con una ventana de contexto de 8.192 tokens según la especificación pública de Gemma 2B. Sin embargo, la información disponible sobre el proceso de ajuste fino, el dataset empleado y las evaluaciones es muy limitada.

La licencia no está declarada en el repositorio, lo que introduce incertidumbre legal para uso comercial. El modelo está etiquetado únicamente para inglés y cuenta con 59 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy baja. Es, por tanto, un artefacto de nicho orientado a experimentación con modelos pequeños especializados en conversación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2B) |
| Parametros totales | 2.506.172.416 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (Gemma 2B base: 8.192 tokens) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); safetensors solo en el modelo base original |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 2B, un transformer decoder-only desarrollado por Google con 2.500 millones de parámetros, atención multi-cabeza con RoPE y una ventana de contexto de 8.192 tokens en su especificación original. Sobre esta base, el autor `JC-24` aplicó un ajuste fino supervisado (SFT) utilizando la librería Unsloth, que optimiza el entrenamiento mediante kernels personalizados y reducción de memoria. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

La contribución de mradermacher se limita a la cuantización: genera ficheros GGUF estáticos (no imatrix) a partir del modelo ajustado, empleando la herramienta de conversión de llama.cpp con `convert_type: hf`. No hay innovaciones técnicas adicionales documentadas, ni decodificación especulativa, ni atención lineal, ni modos de razonamiento extendido.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogos con temática sanitaria o de "doctor" según el nombre del modelo.
- Respuesta a instrucciones y preguntas de seguimiento en formato chat multi-turno.
- Razonamiento básico y respuesta a preguntas factuales, limitado por el tamaño de 2B parámetros.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la etiqueta `language: en`.
- No se documentan capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Experimentación con modelos pequeños en local: el fichero Q4_K_M (1,7 GB) se puede cargar en llama.cpp u Ollama en un portátil con 8 GB de RAM, lo que permite probar el ajuste "chat-doctor" sin infraestructura dedicada.
- Prototipado de asistentes conversacionales de dominio sanitario: útil para validar flujos de diálogo y prompts antes de invertir en un modelo mayor, aunque sin garantías de precisión clínica.
- Evaluación de técnicas de ajuste con Unsloth: sirve como caso de estudio de cómo un SFT sobre Gemma 2B se comporta tras cuantización agresiva (Q2_K a Q8_0).
- Despliegue en dispositivos edge o entornos sin GPU: las cuantizaciones Q3 y Q4 caben en Raspberry Pi 5 con 8 GB o en mini-PC con CPU moderna, con latencia aceptable para respuestas cortas.
- Generación de texto de bajo coste en pipelines por lotes: para tareas de clasificación o resumen simple donde el throughput importe más que la calidad punta.
- Base para fine-tuning posterior: al ser un modelo pequeño y con pesos GGUF, se puede usar como referencia para comparar con otros ajustes de Gemma 2B en tareas de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más overhead de contexto. Q4_K_M (1,7 GB) requiere ~2,5 GB con contexto de 4K; Q8_0 (2,8 GB) requiere ~3,5 GB; f16 (5,1 GB) requiere ~6 GB.
- GPU recomendadas: cualquier GPU con ≥4 GB de VRAM para Q4 (GTX 1650, RTX 3050, RTX 4060). Para f16 se recomienda ≥8 GB (RTX 3060 Ti, RTX 4070). No requiere A100 ni H100.
- Cabe en GPU consumer: sí, en todas las GPU consumer con ≥4 GB de VRAM para cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp. También es compatible con endpoints que acepten GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada. En CPU moderna se esperan decenas de tokens por segundo para Q4; en GPU consumer, cientos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| gemma-2b-unsloth-chat-doctor-GGUF (este) | 2,5B | no disponible (base: 8K) | no disponible | GGUF | Hugging Face, 59 descargas |
| google/gemma-2b-it | 2,5B | 8K | Gemma Terms of Use | safetensors, GGUF (comunitario) | Hugging Face, amplia adopción |
| TinyLlama-1.1B-Chat | 1,1B | 2K | Apache 2.0 | safetensors, GGUF | Hugging Face, muy popular |
| Phi-2 | 2,7B | 2K | MIT | safetensors | Hugging Face, amplia adopción |

La comparativa se basa en datos públicos de los modelos alternativos; no hay benchmarks del modelo evaluado que permitan comparar rendimiento real.

## Limitaciones y advertencias

- La licencia no está declarada, lo que impide confirmar si se permite uso comercial. El modelo base Gemma tiene sus propios términos de uso que podrían aplicar.
- El ajuste "chat-doctor" no está documentado: se desconoce el dataset, el número de ejemplos y si hubo revisión clínica. No debe usarse como herramienta de diagnóstico ni consejo médico.
- Riesgo elevado de alucinación en un modelo de 2B parámetros, especialmente en dominios especializados como salud.
- Contexto limitado a 8K tokens en el modelo base; la model card no confirma que el ajuste preserve esa longitud.
- Solo soporta inglés; no hay evidencia de capacidades en castellano.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; para uso serio se recomienda Q4_K_M o superior.
- Adopción muy baja (59 descargas, 0 likes) y sin mantenimiento documentado más allá de la actualización del repositorio en noviembre de 2026.
- No hay garantías de que el formato de chat de Unsloth se preserve tras la cuantización; puede requerir plantillas específicas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma-2b-unsloth-chat-doctor-GGUF
- Modelo base: https://huggingface.co/JC-24/gemma-2b-unsloth-chat-doctor
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma-2b-unsloth-chat-doctor-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#gemma-2b-unsloth-chat-doctor-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Referencia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gemma 2B (Google): https://huggingface.co/google/gemma-2b
- Unsloth: https://github.com/unslothai/unsloth
