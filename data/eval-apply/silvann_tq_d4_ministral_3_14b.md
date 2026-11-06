# eval-apply/silvann_tq_D4_ministral_3_14b

## Resumen

`eval-apply/silvann_tq_D4_ministral_3_14b` es un empaquetado cuantizado del modelo `mistralai/Ministral-3-14B-Instruct-2512` de Mistral AI, preparado por el usuario eval-apply para el motor de inferencia SiLVANN (Eval-Apply GPU Interpreter y su librería de redes neuronales). No se trata de un modelo nuevo ni de un fine-tune: los pesos, tokenizador, plantilla de chat, system prompt y configuraciones son los originales de Mistral; lo único que cambia es cómo se almacenan las matrices de pesos.

El modelo base es el mayor de la familia Ministral 3, un transformer denso de 14 000 millones de parámetros con capacidades de visión, post-entrenado en modo instruct y publicado en FP8. Este empaquetado concreto conserva únicamente el modelo de texto: el codificador de visión no está incluido. La cuantización aplicada es TurboQuant a 4 bits por peso en todas las matrices de capa, con embeddings y cabeza de salida a 8 bits y las normas sin pérdida, lo que reduce el repositorio a unos 7,4 GB.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa de despliegue de bajo consumo de memoria sobre hardware AMD (medida sobre una Instinct MI50); por otro, advierte de que el formato `silvann-packed-v3` no es compatible con `transformers`, sino que requiere el runtime propio de SiLVANN. Es un artefacto de nicho, útil para quien ya opere ese motor, no un reemplazo directo de los pesos oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Mistral 3); empaquetado con codec TurboQuant + rotacion Hadamard bloqueada con signos |
| Parametros totales | 14 000 millones (heredados del modelo base Ministral-3-14B) |
| Parametros activos | no aplica (modelo denso, sin expertos; el sufijo D4 indica "dense 4") |
| Longitud de contexto | la del modelo base, limitada por la memoria disponible; aproximadamente 625 posiciones por cada 100 MB de VRAM |
| Tipos de cuantizacion | matrices de capa a 4 bits por peso (TurboQuant, escala por fila); embeddings y cabeza a 8 bits; normas sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (la del modelo base, incluida en el repositorio) |
| Formato de pesos | `silvann-packed-v3` (`pack.json`, `layers/NNN/`, `global.pkl`); no compatible con `transformers` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base: un transformer denso de 14 000 millones de parámetros perteneciente a la familia Ministral 3 de Mistral AI, en su variante instruct post-entrenada y publicada originalmente en FP8. Mistral describe este modelo como el mayor de la familia, con rendimiento comparable a Mistral Small 3.2 24B, e incluye capacidades de visión en los pesos originales. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO aplicadas por Mistral.

La contribución técnica de este repositorio es exclusivamente de compresión y almacenamiento. Cada matriz de capa se guarda a 4 bits por peso mediante TurboQuant con una escala por fila, y cada matriz se rota a lo largo de su eje de entrada con una rotación de Hadamard y signos por bloques, una técnica habitual para redistribuir valores atípicos antes de cuantizar. Los embeddings y la cabeza de salida se mantienen a 8 bits y las normas se conservan sin pérdida. El archivo `pack.json` describe el codec y la política de anchura por tensor, mientras que `layers/NNN/` contiene los registros de cada capa y `global.pkl` agrupa embedding, cabeza y norma final. El resultado ocupa aproximadamente 7,4 GB.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo instruct de Mistral.
- Capacidades de código y matemáticas propias del modelo base (no se detallan métricas en la información disponible).
- Capacidades de visión presentes en el modelo original, pero **no disponibles** en este empaquetado: el codificador de visión no está incluido.
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling y function calling: no confirmado en la información disponible para este empaquetado; dependería del soporte del runtime SiLVANN y de la plantilla de chat original, que sí se conserva.
- Uso en agentes y razonamiento multi-paso: no confirmado; el modelo base es instruct, pero el empaquetado no documenta comportamientos específicos de agente.
- Modo de pensamiento explícito (thinking): no disponible.
- Contexto largo: limitado por la memoria de la GPU, no por una ventana fija documentada; aproximadamente 625 posiciones por cada 100 MB de VRAM.

## Casos de uso

- Despliegue en hardware AMD de gama alta ya existente: el empaquetado está medido sobre una AMD Instinct MI50 y el runtime SiLVANN está orientado a ese ecosistema, por lo que encaja en infraestructuras con GPUs AMD que no quieran depender de CUDA.
- Inferencia con presupuesto de VRAM ajustado: al ocupar unos 7,4 GB en disco y admitir contexto escalado a la memoria libre, permite servir un modelo de 14 000 millones en tarjetas donde los pesos en FP8 o BF16 no cabrían.
- Evaluación comparativa de cuantización: útil para medir la pérdida de calidad de TurboQuant a 4 bits frente a los pesos originales; el autor reporta 0,778 bits por byte en WikiText-2, lo que permite contrastar con otras técnicas de cuantización.
- Procesamiento de texto por lotes en pipelines internos: para tareas de resumen, clasificación o extracción sobre documentos, siempre que el pipeline se integre con el runtime SiLVANN en lugar de `transformers`.
- Investigación sobre codecs de compresión de pesos: el formato `silvann-packed-v3` y la rotación Hadamard bloqueada son un caso de estudio reproducible para quien investigue cuantización post-entrenamiento.
- Prototipado de asistentes conversacionales en entornos controlados: la plantilla de chat y el system prompt originales se conservan, lo que facilita reproducir el comportamiento conversacional del modelo Mistral sin reentrenar nada.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 del modelo base se mantiene, lo que permite uso comercial sujeto a los términos originales.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los del autor del empaquetado, medidos sobre una AMD Instinct MI50:

| Metrica | Valor |
|---|---|
| Velocidad de decodificacion | 51 tokens por segundo |
| Perplejidad en WikiText-2 | 0,778 bits por byte (16 ventanas de 512 tokens) |
| Tamano del repositorio | 7,4 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) para este empaquetado en la información disponible. Tampoco se dispone de comparaciones directas con los pesos originales en las mismas condiciones.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 7,4 GB; a ello hay que sumar la memoria para el contexto, calculada por el autor en unos 625 posiciones por cada 100 MB de tarjeta.
- GPU recomendadas: AMD Instinct MI50 es la plataforma sobre la que se midió el rendimiento (51 tokens/s). No se documentan otras GPU compatibles.
- ¿Cabe en GPU de consumo? No disponible: el runtime SiLVANN y el formato `silvann-packed-v3` no están documentados para GPUs de consumo, y el empaquetado no se puede cargar con `transformers`, `llama.cpp` ni Ollama.
- Opciones de despliegue: exclusivamente el runtime de SiLVANN (Eval-Apply GPU Interpreter y su librería de redes neuronales). No es compatible con vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: 51 tokens por segundo en decodificación sobre una MI50, según la medición del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| `eval-apply/silvann_tq_D4_ministral_3_14b` | 14 000 M (denso) | limitado por VRAM (~625 posiciones/100 MB) | 4 bits en capas, 8 bits en embedding y cabeza | Apache 2.0 | `silvann-packed-v3`, solo SiLVANN |
| `mistralai/Ministral-3-14B-Instruct-2512` | 14 000 M (denso) | el del modelo original (no disponible en la información) | FP8 | Apache 2.0 | safetensors, `transformers` |
| Mistral Small 3.2 24B | 24 000 M (denso) | no disponible | no disponible | no disponible | safetensors, `transformers` |

La comparación con otros empaquetados cuantizados de la misma familia (GGUF, AWQ, GPTQ) no está disponible en la información proporcionada. La diferencia principal frente al modelo original es el formato y el runtime: este empaquetado no se puede cargar con las herramientas estándar del ecosistema.

## Limitaciones y advertencias

- **Compatibilidad restringida**: el formato `silvann-packed-v3` solo lo lee el runtime de SiLVANN; no funciona con `transformers`, vLLM, TGI, llama.cpp ni Ollama.
- **Sin visión**: el codificador de visión del modelo base no está incluido, por lo que las capacidades multimodales del original no están disponibles.
- **Pérdida de calidad por cuantización**: la cuantización a 4 bits en las matrices de capa introduce degradación respecto a los pesos FP8 originales; el único indicador publicado es la perplejidad en WikiText-2 (0,778 bits por byte), sin comparación con el modelo sin cuantizar.
- **Contexto dependiente de la memoria**: la ventana efectiva no es fija y depende de la VRAM libre; en tarjetas pequeñas puede quedar muy por debajo de la del modelo original.
- **Riesgo de alucinación**: inherente al modelo base; no se documentan evaluaciones específicas de fidelidad para este empaquetado.
- **Sesgos**: no documentados en la información disponible; se heredan los del modelo base de Mistral.
- **Idiomas**: no se especifica qué idiomas conserva el empaquetado; se asume el multilingüismo del modelo base, pero no está confirmado.
- **Licencia**: Apache 2.0, la misma del modelo base; el uso comercial está permitido sujeto a los términos originales de Mistral. El repositorio incluye la licencia original.
- **Madurez**: el repositorio tiene 74 descargas y 0 likes, sin pipeline declarado ni comunidad de validación; conviene tratarlo como un artefacto experimental.
- **Crédito y mantenimiento**: el autor declara explícitamente que todo el crédito del modelo es de Mistral AI y que este repositorio solo cambia el almacenamiento de los pesos; no hay garantía de actualizaciones.

## Enlaces

- Repositorio del empaquetado: https://huggingface.co/eval-apply/silvann_tq_D4_ministral_3_14b
- Modelo base: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512
- Página de resultados de SiLVANN: mencionada en la model card del autor, sin URL directa disponible en la información proporcionada.
