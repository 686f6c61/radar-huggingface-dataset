# mradermacher/TwIL-8B-Abliterated-Uncensored-GGUF

## Resumen

TwIL-8B-Abliterated-Uncensored-GGUF es una cuantización estática en formato GGUF del modelo TwIL-8B-Abliterated-Uncensored, publicado por el usuario Guilherme34 y convertida por mradermacher, un conocido generador de cuantizaciones de la comunidad. El modelo cuenta con 8.791.592.960 parámetros (aproximadamente 8,8 mil millones) y está orientado a conversación en inglés. Se trata de una variante "abliterated" y "uncensored", es decir, una versión a la que se le han eliminado o atenuado los mecanismos de rechazo y alineación de seguridad del modelo original, lo que permite generar contenido que los modelos convencionales bloquearían.

El repositorio contiene únicamente pesos cuantizados en GGUF (desde Q2_K hasta f16), lo que lo hace desplegable en hardware de consumo mediante llama.cpp, Ollama u otros motores compatibles con GGUF. No incluye los pesos originales en safetensors ni documentación técnica detallada sobre el entrenamiento, la arquitectura interna o los datos utilizados. La model card se limita a listar los ficheros de cuantización disponibles y a remitir a la documentación genérica de mradermacher.

La relevancia de esta ficha es doble: por un lado, documenta una cuantización práctica de un modelo de ~8,8B parámetros para inferencia local; por otro, advierte de que se trata de un modelo sin filtros de seguridad, con licencia no disponible y sin benchmarks publicados, lo que exige precaución en cualquier despliegue en producción. La información disponible es escasa y procede casi exclusivamente de los metadatos de Hugging Face y de la model card del cuantizador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, sin confirmar) |
| Parámetros totales | 8.791.592.960 (~8,8B) |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors solo como referencia del modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Guilherme34/TwIL-8B-Abliterated-Uncensored. Por el tamaño (8,8B parámetros) y el ecosistema en el que se publica, es plausible que se trate de un transformer decoder-only, pero este dato no está confirmado en la información proporcionada. El término "abliterated" indica que se ha aplicado una técnica de eliminación de direcciones de rechazo en el espacio de activaciones, habitualmente mediante la sustracción de vectores de dirección asociados a comportamientos de negativa, lo que da lugar a un modelo "uncensored" que responde a peticiones que el modelo original rechazaría.

No hay datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineación, ni sobre innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). La model card del cuantizador no incluye ninguna de estas especificaciones; únicamente documenta el proceso de conversión a GGUF y los tamaños de cada cuantización. En el ecosistema de mradermacher se observan referencias a un modelo relacionado, TwIL-8B-i1-GGUF, con etiquetas de "reasoning", "math", "code", "instruction-following" y "grpo", y una licencia "webai-non-commercial-license-ver.-1.0", pero no es posible confirmar que esas características se apliquen a esta variante concreta.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno.
- Generación de contenido sin los filtros de rechazo habituales del modelo original (comportamiento "uncensored"), lo que incluye respuestas a peticiones que los modelos alineados convencionalmente declinarían.
- Capacidad de seguir instrucciones y mantener conversaciones, según la etiqueta "conversational" del repositorio.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), lo que sugiere integración con infraestructuras de despliegue tipo Hugging Face Inference Endpoints.
- No hay información que confirme soporte de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidades multilingües limitadas al inglés según el campo de idiomas del repositorio.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de sistemas sin filtros de rechazo, comparando sus respuestas con las de modelos alineados para analizar sesgos, riesgos y eficacia de las técnicas de abliteration. Es adecuado porque reproduce el efecto de la eliminación de direcciones de rechazo en un entorno controlado.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativas que aborden temas sensibles y que los modelos convencionales rechazarían. El formato GGUF permite ejecutarlo localmente con llama.cpp, manteniendo el contenido en el equipo del usuario.
- Pruebas de robustez de filtros y moderación: uso del modelo como generador adversarial para evaluar clasificadores de contenido y sistemas de moderación en pipelines de investigación, aprovechando su tendencia a producir contenido que otros modelos evitan.
- Experimentación con cuantizaciones en hardware de consumo: las variantes Q4_K_S (5,2 GB) y Q4_K_M (5,4 GB) permiten ejecutar un modelo de ~8,8B en GPUs consumer de 8 GB o en CPU con RAM suficiente, lo que resulta útil para comparar calidad y velocidad entre niveles de cuantización.
- Desarrollo de asistentes conversacionales en inglés para entornos cerrados: dado su carácter conversacional y su despliegue local, puede integrarse en prototipos de chatbot donde la ausencia de censura sea un requisito explícito y controlado.
- Evaluación comparativa de técnicas de abliteration: comparar esta variante con el modelo base y con otras versiones (por ejemplo, TwIL-8B-i1-GGUF) para medir el impacto de la eliminación de rechazos en la coherencia, la utilidad y la calidad de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~3,5 GB; Q3_K_S ~4,0 GB; Q3_K_M ~4,4 GB; Q3_K_L ~4,8 GB; Q4_K_S ~5,2 GB; Q4_K_M ~5,4 GB; Q5_K_S ~6,2 GB; Q5_K_M ~6,4 GB; Q6_K ~7,3 GB; Q8_0 ~9,4 GB; f16 ~17,7 GB (tamaños de fichero; la VRAM necesaria es algo superior por el contexto y los buffers de inferencia).
- GPU recomendadas: para Q4_K_M y Q5_K_M, GPUs consumer con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070); para Q8_0, GPUs de 12-16 GB (RTX 4080, RTX 4090); para f16, GPUs de 24 GB o superiores (RTX 4090, A100 40 GB, H100).
- Cabe en GPU consumer: sí, en la mayoría de cuantizaciones Q4 y Q5 con 8 GB o más de VRAM; las variantes Q2 y Q3 caben incluso en GPUs de 6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier motor compatible con GGUF; también es compatible con endpoints según la etiqueta del repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| TwIL-8B-Abliterated-Uncensored-GGUF (este) | ~8,8B | no disponible | GGUF | no disponible | Variante uncensored, solo inglés, sin benchmarks |
| TwIL-8B-i1-GGUF (mradermacher) | ~8B (no confirmado) | no disponible | GGUF | webai-non-commercial-license-ver.-1.0 | Variante con etiquetas de reasoning, math, code y GRPO; cuantización imatrix |
| TwIL-8B-Abliterated-Uncensored (Guilherme34) | ~8,8B | no disponible | safetensors (presumiblemente) | no disponible | Modelo base sin cuantizar del que deriva esta ficha |

La comparación con alternativas de la misma categoría (modelos uncensored de ~8B en GGUF) no puede completarse con datos verificables, ya que no se dispone de información sobre benchmarks ni de especificaciones detalladas de los modelos comparables.

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": no dispone de los mecanismos de rechazo del modelo original, por lo que puede generar contenido ofensivo, peligroso, ilegal o sexualmente explícito. No es apto para aplicaciones de cara al público sin una capa de moderación externa.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. En ausencia de licencia explícita, debe asumirse que no hay autorización clara para uso comercial y consultar el repositorio del modelo base.
- Solo inglés: el campo de idiomas del repositorio indica únicamente "en"; no hay evidencia de capacidades multilingües.
- Sin benchmarks publicados: no hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones que permitan estimar su calidad objetiva.
- Riesgo de alucinación: al no haber información sobre el entrenamiento ni evaluaciones, no se puede acotar la tasa de alucinación; en modelos sin alineación suele ser un riesgo relevante en tareas factuales.
- Contexto desconocido: se desconoce la longitud máxima de contexto, lo que impide planificar su uso en tareas de contexto largo.
- Sesgos conocidos: no documentados, pero la ausencia de alineación y de filtros incrementa el riesgo de reproducir sesgos sociales y estereotipos sin atenuación.
- Procedencia y trazabilidad limitadas: el modelo base lo publica un usuario individual (Guilherme34) y la cuantización la genera un tercero (mradermacher); no hay documentación sobre el proceso de abliteration ni sobre los datos originales.
- Uso responsable: cualquier despliegue debe incluir moderación de salida, registro de auditoría y restricciones de acceso, especialmente en entornos con usuarios finales.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/mradermacher/TwIL-8B-Abliterated-Uncensored-GGUF
- Modelo base: https://huggingface.co/Guilherme34/TwIL-8B-Abliterated-Uncensored
- Variante relacionada TwIL-8B-i1-GGUF: https://huggingface.co/mradermacher/TwIL-8B-i1-GGUF
- Cuantización Q8_0 del modelo base: https://huggingface.co/Guilherme34/TwIL-8B-Abliterated-Uncensored-Q8_0-GGUF
- Página de descargas de mradermacher: https://hf.tst.eu/model#TwIL-8B-Abliterated-Uncensored-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
