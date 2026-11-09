# L1sen0k208/Llama-3.2-3B-Instruct-abliterated-GGUF

## Resumen

Llama-3.2-3B-Instruct-abliterated es una variante "abliterada" (sin censura) del modelo Llama 3.2 3B Instruct desarrollado originalmente por Meta. La abliteración es una técnica que elimina la dirección de rechazo en el espacio de activaciones del transformer, de modo que el modelo deja de negarse a responder ciertas peticiones sin necesidad de reentrenamiento. La versión original abliterada fue publicada por huihui-ai, y esta ficha corresponde a una cuantización GGUF creada por el usuario L1sen0k208 a partir de ese modelo.

El modelo base es un transformer decoder-only denso de 3.212.749.888 parámetros, con una ventana de contexto de 128.000 tokens (heredada de Llama 3.2) y licencia Llama 3.2. La versión aquí descrita se distribuye en formato GGUF, lo que permite su ejecución en CPU y GPU de consumo mediante llama.cpp y derivados. El repositorio ocupa 29,7 GB, lo que sugiere la presencia de múltiples niveles de cuantización en un mismo repo.

Su relevancia radica en dos factores: por un lado, ofrece un modelo de 3B parámetros ejecutable en hardware modesto; por otro, la abliteración elimina los mecanismos de rechazo, lo que resulta de interés para investigación sobre alineación, evaluación de sesgos y experimentación con modelos sin restricciones conductuales. No obstante, esa misma característica implica riesgos importantes de uso y consideraciones legales que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.2) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredado de Llama 3.2; no confirmado en la model card de esta cuantizacion) |
| Tipos de cuantizacion | GGUF (multiples niveles en el repo; niveles concretos no disponibles) |
| Idiomas soportados | no disponibles (el modelo base Llama 3.2 soporta oficialmente 8 idiomas: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | llama3.2 |
| Formato de pesos | GGUF (repo de 29,7 GB); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B Instruct: un transformer decoder-only denso con atención por grupos (GQA), normalización RMSNorm y activación SwiGLU, entrenado por Meta sobre datos propietarios no detallados públicamente, con fases de ajuste supervisado y optimización por preferencias (RLHF/DPO) para la variante Instruct. El contexto nativo es de 128.000 tokens.

Sobre ese modelo, huihui-ai aplicó abliteración, una técnica que identifica la dirección de activación asociada al comportamiento de rechazo (calculada a partir de pares de prompts dañinos/inocuos) y la proyecta fuera de los pesos de las capas, eliminando así la tendencia a negarse a responder. Esta intervención no requiere reentrenamiento y, según las evaluaciones reportadas por el autor, apenas altera el rendimiento en benchmarks estándar. Posteriormente, QuantFactory generó la cuantización GGUF mediante llama.cpp, y L1sen0k208 publicó esta copia. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni detalles adicionales del proceso de abliteración empleado en esta variante concreta.

## Capacidades

- Generación de texto conversacional multi-turno en el formato de chat de Llama 3.2.
- Razonamiento general, respuesta a preguntas y tareas de conocimiento enciclopédico.
- Generación de código y asistencia a la programación (capacidad heredada del modelo base).
- Matemáticas y razonamiento aritmético básico.
- Capacidad multilingüe limitada a los idiomas oficiales del modelo base (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés).
- Comportamiento sin censura: la abliteración elimina los rechazos, por lo que responde a peticiones que el modelo original declinaría.
- Soporte de tool calling / function calling: no confirmado en esta variante; el modelo base Llama 3.2 lo soporta, pero la cuantización y la abliteración pueden afectar a su fiabilidad.
- Capacidades de agente y razonamiento multi-paso: no confirmadas específicamente para esta variante.
- No dispone de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar empíricamente qué comportamientos se eliminan con la abliteración y cómo afecta a la distribución de respuestas, comparándolo con el Llama 3.2 3B Instruct original en el mismo hardware.
- Evaluación de sesgos y robustez: al carecer de mecanismos de rechazo, sirve para medir la probabilidad de generar contenido dañino y calibrar filtros de salida en pipelines de moderación.
- Despliegue local en hardware de consumo: con 3B parámetros en GGUF, puede ejecutarse en portátiles y equipos sin GPU dedicada mediante llama.cpp u Ollama, útil para prototipos offline y entornos air-gapped.
- Generación de texto creativo sin restricciones: escritura de ficción, guiones o contenido narrativo donde el modelo original rechazaría escenas violentas o controvertidas.
- Asistente conversacional privado: al ejecutarse localmente, los datos no salen del dispositivo, adecuado para experimentación con conversaciones sensibles en entornos controlados.
- Fine-tuning y experimentación: sirve como punto de partida para ajustes posteriores (LoRA) en tareas donde se quiera evitar el sesgo de rechazo del modelo alineado.
- Docencia y demostraciones: ilustrar en clase cómo funciona la abliteración y sus implicaciones éticas con un modelo pequeño y ejecutable en un portátil.

## Benchmarks y rendimiento

Los datos de evaluación reportados en la model card original (huihui-ai) comparan el modelo abliterado con el Llama-3.2-3B-Instruct original:

| Benchmark | Llama-3.2-3B-Instruct | Llama-3.2-3B-Instruct-abliterated |
|---|---|---|
| IF_Eval | 76,55 | 76,76 |
| MMLU Pro | 27,88 | 28,00 |
| TruthfulQA | 50,55 | 50,73 |
| BBH | 41,81 | 41,86 |
| GPQA | 28,39 | 28,41 |

Estos resultados corresponden al modelo abliterado original, no a la cuantización GGUF concreta de este repositorio. No se han publicado benchmarks específicos de esta cuantización en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en cuantización Q4_K_M, unos 3,5 GB en Q8_0 y en torno a 6,5 GB en FP16 (3B parámetros × 2 bytes).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM para cuantizaciones Q4/Q5 (GTX 1650, RTX 3050, RTX 4060); RTX 4090, A100 o H100 no son necesarias y quedan sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU modernas con 4 GB o más; también puede ejecutarse íntegramente en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, y servidores compatibles con GGUF como llama.cpp server o text-generation-webui. vLLM y TGI no son la vía natural para GGUF, aunque existen soportes parciales.
- Latencia y throughput: no disponibles de forma oficial; en una RTX 4090 con Q4 se espera un throughput muy alto (cientos de tokens por segundo), pero no se han publicado cifras verificables para esta cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-3.2-3B-Instruct-abliterated-GGUF (este) | 3,21B | 128k (heredado) | llama3.2 | GGUF | Sin censura, cuantizado por terceros |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 128k | llama3.2 | safetensors | Modelo original alineado |
| huihui-ai/Llama-3.2-3B-Instruct-abliterated | 3,21B | 128k | llama3.2 | safetensors | Abliterado original, sin cuantizar |
| Qwen2.5-3B-Instruct | 3,09B | 32k | Apache 2.0 | safetensors, GGUF | Alternativa permisiva de tamaño similar |

## Limitaciones y advertencias

- La abliteración elimina los rechazos, pero no garantiza la ausencia de contenido dañino ni sustituye a un filtro de moderación en producción.
- Riesgo elevado de generar contenido ofensivo, ilegal o peligroso; no es apto para aplicaciones de cara al público sin capas de seguridad adicionales.
- Riesgo de alucinación propio de un modelo de 3B parámetros, agravado por la pérdida de calibración que puede introducir la cuantización.
- La ventana de contexto de 128k es la del modelo base; no se confirma que la cuantización GGUF la preserve íntegramente en todos los backends.
- Idiomas: no se declaran idiomas en esta ficha; el modelo base soporta ocho, pero el rendimiento en español puede ser inferior al de modelos entrenados específicamente para ello.
- Licencia Llama 3.2: permite uso comercial con restricciones (política de uso aceptable, obligación de atribución y de nombrar el modelo "Llama" en productos derivados); la abliteración no exime de cumplirla.
- Repositorio con 0 descargas y creado recientemente: no hay validación comunitaria de la calidad de la cuantización ni del proceso de conversión.
- El autor de la cuantización no es el autor del modelo abliterado ni de Meta; la trazabilidad del proceso de cuantización no está documentada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/L1sen0k208/Llama-3.2-3B-Instruct-abliterated-GGUF
- Modelo abliterado original (huihui-ai): https://huggingface.co/huihui-ai/Llama-3.2-3B-Instruct-abliterated
- Modelo base (Meta): https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Artículo sobre abliteración (Maxime Labonne): https://huggingface.co/blog/mlabonne/abliteration
- Script de evaluación del modelo abliterado: https://huggingface.co/huihui-ai/Llama-3.2-3B-Instruct-abliterated/blob/main/eval.sh
- Perfil de FailSpy (técnica original): https://huggingface.co/failspy
- QuantFactory: https://hf.co/QuantFactory
