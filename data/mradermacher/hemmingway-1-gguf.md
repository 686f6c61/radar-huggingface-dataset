# mradermacher/Hemmingway-1-GGUF

## Resumen

Hemmingway-1 es un modelo de lenguaje de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) orientado a chat y escritura creativa, desarrollado por HemmingwayAI. La versión aquí descrita es una cuantización estática en formato GGUF publicada por mradermacher, un conocido cuantizador de la comunidad de Hugging Face, a partir de los pesos originales del modelo base. El modelo se etiqueta con la arquitectura qwen3.8, lo que sugiere que deriva de la familia Qwen, y declara soporte exclusivo para inglés.

Su relevancia actual radica en dos factores. Por un lado, ofrece una ventana de pesos de 27B en un rango de tamaños que cabe en GPUs de consumo con cuantizaciones agresivas (Q2_K a 11 GB, Q4_K_M a 16,9 GB). Por otro, está especializado en escritura creativa y narrativa (tags creative-writing y altworld), un nicho donde los modelos generalistas suelen rendir por debajo de lo esperado. La licencia cc-by-nc-4.0 restringe el uso comercial, lo que condiciona su adopción en producción.

El repositorio GGUF acumula 234.309 descargas y 10 likes, lo que indica un interés considerable de la comunidad pese a la escasez de documentación técnica publicada por el autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiquetada como qwen3.8 en los tags del repo) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; también existen quants con imatrix en mradermacher/Hemmingway-1-i1-GGUF |
| Idiomas soportados | inglés (en) |
| Licencia | cc-by-nc-4.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); pesos originales en el repo HemmingwayAI/Hemmingway-1 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta qwen3.8 asociada al modelo base, que apunta a un transformer decoder-only de la familia Qwen con 27,3B parámetros. No se especifican el número de capas, la dimensión oculta, el número de cabezas de atención ni si emplea atención lineal o decodificación especulativa. Tampoco se documentan los datos de entrenamiento: no hay cifras de tokens, composición del dataset ni indicación de si se aplicaron fases de RLHF, DPO o ajuste supervisado.

Las cuantizaciones publicadas por mradermacher se generan con un pipeline estático (quantize_version 2, output_tensor_quantised 1, convert_type hf) e incluyen tanto variantes K-quant como IQ. El autor indica que los quants ponderados con imatrix están en un repositorio separado (Hemmingway-1-i1-GGUF), lo que sugiere que la versión aquí descrita prioriza la simplicidad de generación sobre la calidad máxima por bit.

## Capacidades

- Generación de texto conversacional multi-turno, con foco declarado en chat.
- Escritura creativa y narrativa: ficción, diálogo, descripción de escenas y construcción de mundos (tag altworld).
- Razonamiento general y respuesta a instrucciones, heredado del modelo base Qwen subyacente.
- Capacidades multilingües limitadas al inglés según la model card; no se declaran otros idiomas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Generación de ficción asistida: el modelo puede redactar capítulos, diálogos y descripciones de escena manteniendo coherencia de personajes a lo largo de una conversación, gracias a su especialización declarada en creative-writing. Adecuado para autores que trabajan con borradores iterativos.
- Construcción de mundos (worldbuilding): útil para generar trasfondo de ambientaciones, cronologías, sistemas de magia o facciones políticas, un caso alineado con el tag altworld del repositorio.
- Chat narrativo y juegos de rol por texto: su orientación conversacional y su tamaño de 27B permiten mantener personajes con voz consistente en sesiones largas, siempre que el contexto configurado lo permita.
- Asistencia a guionistas y copy creativo: generación de variantes de titulares, eslóganes y textos de marca con tono controlado mediante prompting, desplegable en local con llama.cpp u Ollama.
- Prototipado de asistentes de escritura en local: al caber en GPUs de consumo en Q4_K_M (16,9 GB), permite montar un entorno de pruebas sin depender de APIs externas ni enviar textos confidenciales a terceros.
- Investigación sobre cuantización: el repositorio ofrece once variantes de cuantización del mismo modelo, lo que lo convierte en un banco de pruebas útil para medir la degradación de calidad (perplejidad) entre Q2_K y Q8_0 en tareas creativas.
- Fine-tuning y experimentación académica: la licencia cc-by-nc-4.0 permite su uso en investigación no comercial, y el formato GGUF facilita la evaluación con harnesses estándar sin infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de los ficheros GGUF): Q2_K ~11,0 GB; Q3_K_S ~12,4 GB; Q3_K_M ~13,6 GB; Q3_K_L ~14,7 GB; IQ4_XS ~15,5 GB; Q4_K_S ~15,9 GB; Q4_K_M ~16,9 GB; Q5_K_S ~19,1 GB; Q5_K_M ~19,6 GB; Q6_K ~22,5 GB; Q8_0 ~29,1 GB. Hay que añadir el espacio de la caché KV, que depende del contexto configurado.
- GPU recomendadas: para Q8_0 y Q6_K, una RTX 4090 (24 GB) o A100/H100 de 40-80 GB; para Q4_K_M, una RTX 4090 o RTX 3090 (24 GB) con margen; para Q2_K y Q3, tarjetas de 12-16 GB como RTX 4070 Ti o RTX 4080.
- ¿Cabe en GPU de consumo? Sí. Q4_K_M (16,9 GB) entra en RTX 4090, RTX 3090 y RTX 4080 Super; Q2_K (11,0 GB) entra en RTX 4070 y RTX 3080 de 12 GB. En tarjetas de 8 GB habría que recurrir a offloading parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El tag endpoints_compatible del repositorio sugiere compatibilidad con endpoints de inferencia tipo TGI/vLLM, aunque no se detalla la configuración.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hemmingway-1 (este) | 27,3B | no disponible | cc-by-nc-4.0 | GGUF | Especializado en escritura creativa, solo inglés |
| Qwen2.5-32B-Instruct | 32,5B | 32.768 tokens (ampliable) | Apache 2.0 | safetensors, GGUF | Modelo generalista de referencia de la familia Qwen, multilingüe y con uso comercial permitido |
| Gemma-2-27B-it | 27B | 8.192 tokens | Gemma license (uso comercial con restricciones) | safetensors, GGUF | Tamaño casi idéntico, generalista, buen rendimiento en razonamiento |
| Mistral-Small-24B-Instruct | 23,6B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa de tamaño similar con licencia permisiva |

La comparación con Qwen2.5-32B-Instruct y Gemma-2-27B-it es pertinente por tamaño y por la etiqueta qwen3.8 del modelo base. No obstante, no hay datos de benchmarks que permitan afirmar qué modelo rinde mejor en escritura creativa; la comparativa se limita a especificaciones y licencia.

## Limitaciones y advertencias

- Licencia cc-by-nc-4.0: prohíbe el uso comercial. Cualquier despliegue en producto, SaaS o servicio de pago requiere una licencia aparte del titular de los derechos.
- Idiomas: solo se declara inglés. No hay evidencia de competencia en castellano ni en otros idiomas, por lo que no es adecuado para aplicaciones multilingües.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad o alineación. Al ser un modelo entrenado para escritura creativa, puede reproducir estereotipos presentes en la ficción de su corpus.
- Riesgo de alucinación: no se han publicado métricas de fidelidad factual. En tareas de recuperación de hechos o citas, conviene verificar las salidas.
- Contexto: se desconoce la longitud de contexto soportada; planificar aplicaciones con documentos largos sin confirmarla previamente es arriesgado.
- Cuantizaciones de baja calidad: el propio autor marca Q3_K_M como lower quality. Para producción se recomienda Q4_K_M o superior, y evaluar la variante imatrix si la calidad es crítica.
- Trazabilidad: la model card del GGUF es una plantilla de mradermacher; no incluye información del autor original sobre datos de entrenamiento, evaluación o limitaciones, lo que dificulta una auditoría técnica.
- Formato: los pesos solo están en GGUF en este repositorio; para fine-tuning hay que acudir al repo original HemmingwayAI/Hemmingway-1.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Hemmingway-1-GGUF
- Modelo base original: https://huggingface.co/HemmingwayAI/Hemmingway-1
- Quants con imatrix: https://huggingface.co/mradermacher/Hemmingway-1-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Hemmingway-1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
