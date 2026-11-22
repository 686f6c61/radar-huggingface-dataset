# altslate/indic-tts-normalizer-small

## Resumen

Indic TTS Normalizer (small) es un modelo de normalización de texto para síntesis de voz (TTS) desarrollado por el usuario altslate. Su función es reescribir texto escrito en su forma hablada para diez lenguas de la India: convierte cifras, importes en rupias, horas, fechas, años, porcentajes, decimales, números de teléfono, unidades, ordinales, rangos y marcadores deportivos en palabras dentro del alfabeto nativo de cada idioma. Resuelve un problema concreto y bien documentado: muchos modelos TTS para lenguas índicas leen mal los dígitos o directamente los omiten (la propia model card de indic-parler-tts reconoce los números como limitación conocida).

El modelo parte de google/byt5-small, un encoder-decoder T5 con tokenización a nivel de byte, y cuenta con 299.637.760 parámetros totales. Se distribuye bajo licencia Apache 2.0 en formatos safetensors y ONNX, con variantes en fp32 y cuantización dinámica int8 por canal. Su relevancia actual radica en que se sitúa como una etapa de preprocesado previa a cualquier pipeline TTS en lenguas índicas, con resultados medidos frente a alternativas basadas en reglas y frente a modelos generativos de mayor tamaño.

La entrada se formula con un prefijo de código de idioma (`hi-tn:`, `bn-tn:`, etc.) seguido del texto, y la salida es ese mismo texto con las expresiones numéricas y simbólicas verbalizadas. El modelo está pensado para alimentarse frase a frase, con un `max_new_tokens` de aproximadamente cuatro veces la longitud de la entrada en bytes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5 con tokenización a nivel de byte, base google/byt5-small) |
| Parametros totales | 299.637.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo byt5-small; la model card recomienda procesar una frase a la vez) |
| Tipos de cuantizacion | fp32 y int8 dinámica por canal (ONNX) |
| Idiomas soportados | hi, bn, ta, te, mr, gu, kn, ml, pa, ur |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y ONNX (encoder y decoder, con y sin past, y merged) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de google/byt5-small, un transformer encoder-decoder de la familia T5 que opera sobre bytes en lugar de subpalabras. Esta elección es coherente con la tarea: al no depender de un vocabulario subword específico, el modelo maneja de forma nativa los alfabetos de las diez lenguas objetivo (devanagari, bengalí, tamil, telugu, gujarati, kannada, malayo, gurmuji y arábigo-urdu) sin fragmentaciones problemáticas. La tarea se plantea como text2text-generation con un prefijo de idioma en la entrada.

La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; esos datos figuran como no disponibles. Sí se explicita que los tests de evaluación se construyeron con material no visto durante el entrenamiento: el split de validación de Wikipedia de Dakshina (600 frases, 60 por idioma) para el test A, mensajes cortos generados por Qwen3.8-27B para el test B, y conjuntos programáticos generados por reglas y retenidos del entrenamiento (test-prog con 2.194 frases, test-multi con 1.000 y test-pair con 936). El juicio de calidad en los tests A y B lo realiza Qwen3.8-27B, que según el autor no escribió datos de entrenamiento. No se mencionan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Verbalización de números cardinales en diez lenguas índicas, con salida en el alfabeto nativo correspondiente.
- Conversión de importes en rupias, incluidos céntimos (por ejemplo, `₹1,250.50` → «एक हज़ार दो सौ पचास रुपये और पचास पैसे»).
- Lectura de horas con indicadores AM/PM y formatos horarios.
- Expansión de fechas y años (por ejemplo, `১৯৭১` → «ঊনিশশো একাত্তর»).
- Verbalización de porcentajes y decimales (por ejemplo, `2.5%` → «दोन पूर्णांक पाच टक्के»).
- Lectura dígito a dígito de números de teléfono.
- Conversión de unidades y magnitudes (GB, km, litros, etc.).
- Expansión de ordinales y rangos numéricos.
- Lectura de marcadores deportivos, incluidos resultados de críquet con overs y wickets.
- Procesamiento por frases con prefijo de código de idioma (`hi-tn`, `bn-tn`, `ta-tn`, `te-tn`, `mr-tn`, `gu-tn`, `kn-tn`, `ml-tn`, `pa-tn`, `ur-tn`).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión ni audio; el modelo es exclusivamente de normalización textual.

## Casos de uso

- Preprocesado de pipelines TTS en lenguas índicas: se coloca delante del sintetizador para que este reciba texto ya verbalizado y no tenga que leer dígitos. Es el caso de uso central y el que motiva el modelo, dado que muchos TTS índicos fallan con números.
- Locución automática de noticias económicas: importes en rupias, porcentajes de inflación y variaciones bursátiles se convierten en palabras antes de pasar al motor de voz, evitando lecturas erróneas de cifras con separadores de miles y decimales.
- Anuncios de resultados deportivos: los marcadores de críquet con overs, runs y wickets se verbalizan correctamente, como muestra el ejemplo en urdu de la model card.
- Sistemas de atención telefónica automatizada: los números de teléfono, horas de cita y referencias de pedido se leen dígito a dígito o como cardinales según corresponda antes de la síntesis.
- Accesibilidad y lectores de pantalla: normalización de texto con fechas, unidades y cifras para que la salida hablada sea inteligible en hindi, bengalí, tamil y el resto de lenguas soportadas.
- Generación de audiolibros y contenido educativo: conversión de años históricos, ordinales y rangos numéricos en su forma hablada natural dentro del alfabeto de destino.
- Despliegue en navegador o en el dispositivo: las variantes ONNX int8 (unos 460 MB para el conjunto cuantizado) permiten ejecución local con onnxruntime o transformers.js, de modo que el texto no sale del dispositivo del usuario, como demuestra el Space asociado.

## Benchmarks y rendimiento

Resultados de la model card. «Judge-ok» exige que todos los números y símbolos se lean correctamente, que no cambie nada más y que no quede ningún dígito ni símbolo `₹ % °` en la salida. Mayor es mejor.

| Sistema | test A (Wikipedia) | test B (mensajes) |
|---|---|---|
| Este modelo | 0.720 | 0.703 |
| Reglas con indic-numtowords | 0.607 | 0.388 |
| indic-tts-preprocess 0.1.1 | 0.157 | 0.102 |
| Qwen3-4B-Instruct con prompt | 0.068 | 0.068 |
| Entrada sin cambios | 0 | 0 |

Desglose por idioma (este modelo / reglas):

| Test | hi | bn | ta | te | mr | gu | kn | ml | pa | ur |
|---|---|---|---|---|---|---|---|---|---|---|
| A | .87/.80 | .90/.50 | .60/.57 | .32/.28 | .87/.60 | .82/.68 | .68/.58 | .65/.65 | .73/.75 | .77/.65 |
| B | .85/.57 | .65/.42 | .87/.48 | .32/.12 | .63/.40 | .72/.35 | .67/.30 | .72/.45 | .83/.37 | .78/.43 |

Coincidencia exacta en los tests programáticos: test-prog 0.992 (reglas 0.172), test-multi 0.977 y test-pair 0.997. Por tipo en test-prog: ordinales 0.96, números de teléfono 0.98, resto entre 0.99 y 1.00. El autor advierte que estas frases provienen del mismo generador que los datos de entrenamiento, por lo que miden cobertura de patrones, no robustez ante texto real.

En ONNX con decodificación greedy, el autor reporta comparaciones contra PyTorch sobre conjuntos programáticos retenidos (test-prog con 150 filas y test-multi con 100 filas), aunque el texto de la model card se corta en la tabla y no permite reproducir los valores numéricos de esa comparación.

## Requisitos de hardware

- VRAM estimada para inferencia: con 299,6 millones de parámetros, en fp32 el modelo ocupa aproximadamente 1,2 GB de pesos; en int8 dinámico la cifra baja a unos 0,3 GB de pesos (el conjunto ONNX int8 completo, encoder y decoder con y sin past, ocupa unos 460 MB).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp32; tarjetas consumer como RTX 3060, RTX 4060 o superiores son más que suficientes. Para despliegues de alto volumen, A100 o H100 aportan margen de sobra, aunque el modelo es pequeño para aprovecharlas.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU dedicada moderna e incluso en CPU para cargas moderadas.
- Opciones de despliegue: transformers (PyTorch), onnxruntime, transformers.js en navegador, y text-generation-inference según los tags del repositorio. No se documentan integraciones específicas con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. La recomendación de procesar una frase a la vez y fijar `max_new_tokens` a unas cuatro veces la longitud de la entrada en bytes condiciona el rendimiento en producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Idiomas índicos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| altslate/indic-tts-normalizer-small | 299,6 M | Normalización TTS con modelo seq2seq | 10 | apache-2.0 | Hugging Face, ONNX, Space de demostración |
| indic-numtowords (reglas) | no aplica | Conversión numérica basada en reglas | Cobertura variable | no disponible | GitHub (AI4Bharat) |
| indic-tts-preprocess 0.1.1 | no aplica | Preprocesado basado en reglas | Solo hindi y marati | no disponible | PyPI |
| Qwen3-4B-Instruct con prompt | 4 B (aproximado) | LLM generativo con instrucciones | Multilingüe general | no disponible | Hugging Face |

Frente a las alternativas basadas en reglas, el modelo supera a indic-numtowords en todos los idiomas en el test B y en ocho de diez en el test A (empata en malayo y queda por debajo en punyabí). Frente a indic-tts-preprocess, la diferencia es muy amplia porque esta herramienta solo cubre hindi y marati. Frente a un LLM general de 4B con prompt, el modelo especializado obtiene una puntuación muy superior (0.720 y 0.703 frente a 0.068 en ambos tests).

## Limitaciones y advertencias

- El rendimiento en telugu es bajo en todos los sistemas evaluados (0.32 en ambos tests). El autor señala que el juez rechazó salidas que leían los años como números planos, que es precisamente como los lee este modelo y las reglas, y que no pudo verificar con un hablante nativo si esas salidas eran correctas.
- En punyabí, el test A queda por debajo de las reglas (0.73 frente a 0.75); en malayo empatan (0.65).
- Los tests programáticos proceden del mismo generador que los datos de entrenamiento, por lo que sus puntuaciones altas miden cobertura de patrones, no robustez ante texto real.
- El conjunto de 20 frases de ejemplo de la model card se usó para localizar errores durante el desarrollo, por lo que no constituye un test limpio.
- La evaluación de los tests A y B depende de un juez automático (Qwen3.8-27B) y no de anotación humana, con el riesgo de sesgo que ello implica.
- No se documentan sesgos demográficos, culturales o de otro tipo; la información disponible no permite evaluarlos.
- Riesgo de alucinación: al ser un modelo seq2seq de normalización, puede alterar texto que no debería tocar o introducir verbalizaciones incorrectas en construcciones no vistas; la model card no cuantifica este riesgo más allá de las métricas de coincidencia exacta.
- La longitud de contexto no está especificada y la recomendación es procesar una frase a la vez, lo que limita su uso directo sobre documentos largos sin un segmentador previo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base google/byt5-small debe verificarse por separado; la model card no detalla condiciones adicionales.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, y la fecha de creación indicada es 2026-11-22, lo que conviene contrastar antes de adoptarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/altslate/indic-tts-normalizer-small
- Demostración en el navegador (transformers.js): https://huggingface.co/spaces/altslate/indic-tts-normalizer
- Modelo base: https://huggingface.co/google/byt5-small
- indic-numtowords (AI4Bharat): https://github.com/AI4Bharat/indic-numtowords
- indic-tts-preprocess en PyPI: https://pypi.org/project/indic-tts-preprocess/
