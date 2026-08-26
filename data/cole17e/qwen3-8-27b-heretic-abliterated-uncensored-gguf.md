# cole17e/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF es una variante abliterada del modelo Qwen3.8-27B de Qwen, convertida a formato GGUF para su ejecución local con llama.cpp. El autor, cole17e, parte del trabajo de Tim Rohrbaugh (`trohrbaugh/Qwen3.8-27B-heretic-ara`) y aplica dos pasadas adicionales de ARA (Arbitrary-Rank Ablation) para reducir los rechazos residuales a peticiones dañinas. El resultado es un modelo con una tasa de rechazo de 0-1 sobre 100 peticiones problemáticas, manteniendo una divergencia KL muy baja (0,0085) respecto al comportamiento del modelo original.

El modelo conserva la arquitectura híbrida de Qwen3.8-27B, con 26,9 mil millones de parámetros y una ventana de contexto de 262.144 tokens. Incluye soporte para tool calling, razonamiento multi-paso y decodificación especulativa MTP (Multi-Token Prediction). Se distribuye exclusivamente en formato GGUF, lo que permite su uso en herramientas como llama.cpp, Ollama o LM Studio en hardware de consumo. La licencia Apache-2.0 se mantiene intacta respecto al modelo base.

La relevancia de esta variante radica en que ofrece una generación sin filtros de seguridad, orientada a casos de uso como roleplay, escritura creativa, investigación sobre alineación o análisis de contenido sensible. Es una de las pocas opciones de 27B con contexto de 262K y tool calling que elimina de forma efectiva los rechazos sin degradar significativamente el rendimiento general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_text (Gated DeltaNet hybrid) |
| Parametros totales | 26.895.998.464 (≈27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | GGUF: Q4_K_M, Q5_K_M, Q8_0 y otras (segun repo; la model card menciona Q4_K_M y archivos RVN) |
| Idiomas soportados | No disponible (no especificado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

Detalles adicionales de la arquitectura:

- Hidden size: 5120
- Capas: 64 (16 de atención completa + 48 de Gated DeltaNet lineal)
- Cabezas de atención: 24, con KV heads 4 (GQA) y head_dim 256
- Vocabulario: 248.320 tokens

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.8-27B, un modelo híbrido que combina 16 capas de atención completa (full attention) con 48 capas de atención lineal Gated DeltaNet. Esta combinación permite manejar ventanas de contexto muy largas (262K) con un coste computacional inferior al de un transformer denso equivalente. El modelo base fue entrenado por Qwen con datos multilingües y con técnicas de RLHF para alineación, aunque esta variante elimina esa alineación mediante abliteración.

La abliteración se realiza mediante ARA (Arbitrary-Rank Ablation), implementada en la herramienta `heretic` de p-e-w. A diferencia de la abliteración direccional clásica (que resta un único vector de rechazo), ARA optimiza directamente las matrices de peso de las proyecciones de atención y MLP. El proceso usa un optimizador LBFGS con tres objetivos: preservar las salidas ante peticiones inofensivas (minimizando la divergencia KL), llevar las salidas ante peticiones dañadas hacia el espacio de las peticiones buenas (mediante vecinos k-NN) y alejar las salidas dañadas de su respuesta original para eliminar circuitos de rechazo complejos.

Este modelo en concreto (RVN) aplica el proceso ARA tres veces: una primera pasada realizada por Tim Rohrbaugh sobre el modelo base para obtener `-heretic-ara` (KL 0.0535, rechazos 3/100), y dos pasadas adicionales por parte de cole17e con los mismos parámetros (start 26, end 56, preserve 0.9432, steer 0.0009, overcorrect 0.5038, neighbor 10). El resultado final presenta una KL de 0.0085 respecto al modelo base y una tasa de rechazos reducida a 0-1 sobre 100 prompts problemáticos.

## Capacidades

- Generación de texto sin filtros de seguridad: responde a peticiones que el modelo base rechazaría, incluyendo contenido para adultos, temas controvertidos y escenarios hipotéticos de peligro.
- Razonamiento multi-paso: conserva la capacidad de razonamiento lógico y matemático del modelo base, aunque sin las restricciones de alineación.
- Tool calling / function calling: soporta llamadas a herramientas externas mediante el formato de chat oficial de Qwen3.8, integrado en los archivos GGUF.
- Decodificación especulativa MTP: los archivos `*-mtp.gguf` incluyen el cabezal de draft de MTP, acelerando la generación en hardware compatible.
- Contexto largo de 262K tokens: permite procesar documentos extensos, conversaciones multi-turno o libros completos en una sola pasada.
- Capacidades multilingües: el modelo base Qwen3.8-27B soporta múltiples idiomas, aunque esta variante no especifica la lista exacta.
- Sin capacidades de visión: a pesar de que el modelo base es de visión-lenguaje, esta variante GGUF no incluye el proyector de visión (mmproj), por lo que no puede procesar imágenes.

## Casos de uso

- **Roleplay y escritura creativa sin restricciones**: el modelo puede generar narrativas adultas, diálogos complejos y escenas de fantasía sin censura. Su contexto de 262K permite mantener personajes y tramas a lo largo de conversaciones muy largas.
- **Investigación en seguridad y alineación de IA**: investigadores que estudian el comportamiento de modelos abliterados pueden usarlo para analizar cómo se eliminan los rechazos y qué circuitos internos son responsables de la alineación.
- **Generación de código en entornos de desarrollo**: aunque no es su propósito principal, conserva la capacidad de generar código del modelo base. Puede integrarse en pipelines de CI/CD mediante tool calling para generar tests, documentación o refactorizaciones.
- **Análisis de contenido sensible**: en entornos periodísticos o de investigación, puede procesar textos que contengan descripciones de violencia, terrorismo o material controvertido sin que el modelo se niegue a responder.
- **Asistente conversacional sin filtros**: para aplicaciones donde se necesita una IA que no evite temas tabú, como en proyectos de ficción interactiva o juegos de rol en línea.
- **Pruebas de estrés de modelos**: para evaluar la robustez de técnicas de abliteración, se puede usar este modelo como punto de referencia en comparación con el modelo base y otras variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta variante abliterada. La model card no incluye métricas de tareas estándar (MMLU, HumanEval, GSM8K, etc.). Se recomienda consultar los benchmarks del modelo base Qwen3.8-27B para tener una referencia del rendimiento teórico, aunque la abliteración puede afectar ligeramente al rendimiento en tareas de seguridad o razonamiento.

## Requisitos de hardware

- **VRAM estimada para inferencia**: para un modelo de 27B en GGUF, las necesidades aproximadas son:
  - Q4_K_M: ~16-18 GB de VRAM
  - Q5_K_M: ~19-21 GB
  - Q6_0: ~23-25 GB
  - Q8_0: ~27-30 GB
  - FP16 (no GGUF): ~54 GB
- **GPU recomendadas**: para las cuantizaciones Q4/Q5, una RTX 4090 (24 GB) es suficiente. Para Q6/Q8, se recomienda una A100 40 GB o H100 80 GB.
- **CPU y memoria RAM**: también puede ejecutarse en CPU con llama.cpp, pero la velocidad será mucho menor. Se recomienda al menos 32 GB de RAM para cuantizaciones Q4/Q5.
- **Opciones de despliegue**: llama.cpp, Ollama (si se crea un Modelfile), LM Studio, text-generation-webui con backend llama.cpp. También se puede usar vLLM con soporte GGUF experimental.
- **Latencia y throughput**: no se dispone de datos concretos. Con una RTX 4090 y Q4_K_M, se puede esperar una velocidad de generación de 20-40 tokens por segundo en contexto corto, y menos en contexto largo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Refusals | KL vs base | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | 100/100 (típico) | 0 | Apache-2.0 |
| trohrbaugh/Qwen3.8-27B-heretic-ara | 27B | 262K | 3/100 | 0.0535 | Apache-2.0 |
| **cole17e/Qwen3.8-27B-Heretic-Abliterated-Uncensored (RVN)** | **27B** | **262K** | **0-1/100** | **0.0085** | **Apache-2.0** |
| OrcaRouter/Qwen3.8-27B-Uncensored | 27B | 262K | 0/100 (según su claim) | no disponible | Apache-2.0 |

La comparativa muestra que esta variante RVN ofrece la tasa de rechazos más baja de la familia, con una KL muy inferior a la de la fuente de una sola pasada. En cuanto a rendimiento, no hay datos publicados, pero la KL baja sugiere que la degradación del comportamiento general es mínima.

## Limitaciones y advertencias

- **Sin salvaguardas de seguridad**: el modelo ha sido diseñado para eliminar los rechazos a contenido dañino. Esto incluye ciberdelincuencia, malware, contenido violento o ilegal. El autor recomienda uso exclusivo para mayores de 18 años y con fines de investigación, escritura creativa o roleplay.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede inventar hechos o respuestas incorrectas, especialmente en temas técnicos o factuales.
- **Sesgos del modelo base**: al no tener las capas de alineación, los sesgos y estereotipos presentes en los datos de entrenamiento originales pueden aparecer sin filtro.
- **Limitaciones de idioma**: aunque el modelo base es multilingüe, la variante no especifica los idiomas exactos. Es probable que el rendimiento sea mejor en inglés y chino, los idiomas predominantes en el entrenamiento.
- **Restricciones de licencia**: la licencia Apache-2.0 permite uso comercial y modificación, pero no incluye ninguna cláusula de uso ético. El usuario es responsable de cumplir las leyes locales.
- **Compatibilidad**: los archivos GGUF requieren una versión reciente de llama.cpp que soporte la arquitectura `qwen3_5_text`. Verificar la compatibilidad antes de su uso.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/cole17e/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Fuente de abliteración trohrbaugh/Qwen3.8-27B-heretic-ara](https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara)
- [Herramienta heretic de p-e-w (implementación de ARA)](https://github.com/p-e-w/heretic)
- [Versión alternativa de 0bserverx](https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF)
- [Build de Ollama de OrcaRouter](https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored)
