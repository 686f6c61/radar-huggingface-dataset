# Prathat/Dhir-5B-A1.7B-GGUF

## Resumen

Dhir 5B-A1.7B-GGUF es la versión cuantizada a 4 bits del modelo Dhir 5B-A1.7B desarrollado por Zenteiq, publicada por el usuario Prathat en Hugging Face. Se trata de un modelo de lenguaje de arquitectura Mixture of Experts (MoE) con 5.094.471.168 parámetros totales, de los cuales solo 1.700 millones se activan por token, lo que reduce el coste computacional en inferencia manteniendo la capacidad de un modelo de mayor tamaño. El modelo está orientado a generación de texto conversacional multilingüe, con especial énfasis en inglés y lenguas de la India (hindi, bengalí, tamil, telugu, kannada, malayalam, maratí, guyaratí, panyabí y oriya).

La versión GGUF está empaquetada en un único fichero Q4_K_M de 3,4 GB, pensado para ejecutarse en llama.cpp sobre portátiles, sobremesas, móviles y chips embebidos. Su ventana de contexto es de 16.384 tokens y la licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. La relevancia actual del modelo radica en su combinación de arquitectura MoE eficiente, soporte nativo para once idiomas y un tamaño que cabe en hardware de consumo, un perfil poco habitual en modelos multilingües centrados en lenguas índicas.

El repositorio tiene 0 descargas y 1 like en el momento de la ficha, y fue creado el 11 de noviembre de 2026. El modelo base es zenteiq-ai/Dhir-5B-A1.7B, del que esta versión es una cuantización directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer; número de expertos y top-k no disponibles |
| Parametros totales | 5.094.471.168 (5,1B) |
| Parametros activos | 1,7B por token |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | Q4_K_M (4 bits, fichero publicado); el modelo base ofrece versiones 4-bit y 8-bit |
| Idiomas soportados | en, hi, bn, ta, te, kn, ml, mr, gu, pa, or (inglés y diez lenguas de la India) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Dhir-5B-A1.7B-Q4_K_M.gguf`, 3,4 GB) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture of Experts en la que, por cada token, solo se activan 1,7B de los 5,1B parámetros totales. Esta configuración permite que el coste de cómputo por token se aproxime al de un modelo denso de 1,7B, mientras que la capacidad representacional se acerca a la de un modelo de 5B. La model card no detalla el número de expertos, el mecanismo de enrutamiento ni la proporción de capas MoE frente a capas densas.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. La model card menciona la existencia de un artículo técnico ("technical paper") y un blog de investigación en zenteiq.ai, pero no se incluyen sus enlaces ni cifras concretas en la información proporcionada. La cuantización Q4_K_M se ha evaluado frente al modelo original con perplexity en WikiText-2, divergencia KL sobre 1,5 millones de tokens en 11 idiomas, código y matemáticas, y benchmarks estándar; según el autor, la perplexity queda dentro del 1,8% del original y coincide en el siguiente token el 91% de las veces.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y diez lenguas de la India.
- Razonamiento y respuesta a preguntas en los idiomas soportados (la model card incluye un ejemplo en hindi sobre la capital de la India).
- Capacidad multilingüe nativa para en, hi, bn, ta, te, kn, ml, mr, gu, pa y or.
- Soporte de plantilla de chat mediante `--jinja` en llama.cpp, lo que habilita el formato conversacional estructurado.
- Compatibilidad con endpoints OpenAI (`endpoints_compatible` en los tags), lo que permite integrarlo con clientes que hablan la API de OpenAI, como LangChain.
- Ejecución en CPU, GPU y dispositivos de bajos recursos gracias al formato GGUF y al tamaño de 3,4 GB.
- No se ha documentado soporte explícito de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Asistentes conversacionales multilingües en la India: el modelo cubre once idiomas, incluidos hindi, bengalí, tamil y telugu, por lo que puede desplegarse como chatbot de atención al cliente en regiones lingüísticamente diversas sin necesidad de un modelo distinto por idioma.
- Despliegue en dispositivos de borde: con 3,4 GB en Q4_K_M cabe en portátiles, móviles y chips embebidos; útil para aplicaciones offline de traducción o asistencia en campo donde no hay conectividad.
- Servidor local compatible con OpenAI: mediante `llama-server --jinja --port 8080` expone una API compatible con OpenAI, lo que permite sustituir llamadas a la nube por inferencia local en prototipos y entornos con requisitos de privacidad.
- Integración en pipelines con LangChain: la model card documenta el uso con `langchain-openai` apuntando a `http://localhost:8080/v1`, adecuado para construir cadenas de procesamiento de texto en producción sin dependencia de proveedores externos.
- Procesamiento de documentos largos: con 16.384 tokens de contexto puede resumir o extraer información de informes, contratos o artículos de extensión media en cualquiera de los idiomas soportados.
- Generación de contenido educativo en lenguas índicas: redacción de materiales didácticos, preguntas de comprensión o explicaciones en hindi, maratí o guyaratí, donde la oferta de modelos abiertos es más limitada.
- Inferencia en CPU con rendimiento aceptable: al activar solo 1,7B parámetros por token, el autor afirma que genera texto más rápido que Dhir 2B en CPU, lo que lo hace apto para estaciones de trabajo sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de fidelidad de la cuantización frente al modelo original: perplexity en WikiText-2 dentro del 1,8% del original y coincidencia del 91% en el siguiente token predicho sobre 1,5 millones de tokens en 11 idiomas, código y matemáticas. No se proporcionan valores absolutos de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 3,4 GB para los pesos en Q4_K_M, más 0,07 MB por cada token de conversación según la model card (unos 1,1 GB adicionales para llenar los 16.384 tokens de contexto con caché FP16).
- Caché de contexto reducida: con `-ctk q8_0 -ctv q8_0` y `-fa on`, el coste por token de contexto se reduce a la mitad, útil en dispositivos con poca memoria.
- GPU recomendadas: no se especifican modelos concretos; el modelo está pensado para ejecutarse en CPU, y la compilación con `-DGGML_CUDA=ON` habilita aceleración en GPU NVIDIA. Cualquier GPU con 4-6 GB de VRAM o más puede alojar los pesos y parte del contexto.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 4 GB de VRAM para los pesos, y con margen para contexto según la VRAM disponible (por ejemplo, RTX 3060, RTX 4060, RTX 4090).
- Opciones de despliegue: llama.cpp (rama `dhir-support` del repositorio zenteiq-research/llama.cpp, ya que el soporte aún no está fusionado en la rama principal), con `llama-server` para API compatible con OpenAI y `llama-cli` para chat en terminal. También es compatible con clientes OpenAI como LangChain.
- Latencia y throughput: no se proporcionan cifras concretas; el autor afirma que en CPU es más rápido que Dhir 2B gracias a la activación de solo 1,7B parámetros por token. Se recomienda ajustar `-t` al número de núcleos de rendimiento y `-tb` al total de núcleos.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Idiomas | Licencia | Tamano Q4 |
|---|---|---|---|---|---|---|
| Prathat/Dhir-5B-A1.7B-GGUF (este) | 5,1B | 1,7B | 16.384 | 11 (en + 10 índicas) | Apache 2.0 | 3,4 GB |
| zenteiq-ai/Dhir-2B-4bit | no disponible (2B nominal) | no disponible | no disponible | no disponible | Apache 2.0 | 1,3 GB |
| zenteiq-ai/Dhir-5B-A1.7B-8bit | 5,1B | 1,7B | 16.384 | 11 | Apache 2.0 | 5,4 GB |

La comparativa se limita a las variantes del mismo modelo documentadas en la model card, ya que no se dispone de datos de benchmarks ni de especificaciones de modelos competidores en la información proporcionada. Frente a Dhir 2B, esta versión ofrece mayor capacidad (5,1B totales frente a 2B) y, según el autor, mayor velocidad en CPU pese a su mayor tamaño, a costa de triplicar el espacio en disco (3,4 GB frente a 1,3 GB). Frente a la variante de 8 bits, la Q4_K_M ocupa un 37% menos y sacrifica algo de precisión.

## Limitaciones y advertencias

- La cuantización a 4 bits introduce una pérdida de precisión moderada; el autor recomienda la versión de 8 bits cuando la memoria lo permita.
- Para aritmética de varios pasos en bengalí y telugu, la model card recomienda explícitamente la versión de 8 bits.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede afirmar hechos incorrectos con fluidez; es necesario verificar la información crítica y añadir salvaguardas en producción.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible.
- Cobertura idiomática limitada a inglés y diez lenguas de la India; no se garantiza un rendimiento adecuado en otros idiomas.
- El soporte en llama.cpp requiere compilar la rama `dhir-support` del repositorio zenteiq-research/llama.cpp, ya que aún no está fusionado en la rama principal; esto añade fricción al despliegue y puede cambiar con futuras actualizaciones.
- No se documentan capacidades de tool calling, agentes, visión ni audio, por lo que no debe asumirse su disponibilidad en producción.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución; se incluyen los ficheros LICENSE y NOTICE del modelo original en el repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Prathat/Dhir-5B-A1.7B-GGUF
- Modelo base: https://huggingface.co/zenteiq-ai/Dhir-5B-A1.7B
- Variante 4-bit del modelo base: https://huggingface.co/Prathat/Dhir-5B-A1.7B-4bit
- Variante 8-bit del modelo base: https://huggingface.co/zenteiq-ai/Dhir-5B-A1.7B-8bit
- Dhir 2B 4-bit: https://huggingface.co/zenteiq-ai/Dhir-2B-4bit
- Dhir 2B 8-bit: https://huggingface.co/zenteiq-ai/Dhir-2B-8bit
- Repositorio llama.cpp con soporte Dhir: https://github.com/zenteiq-research/llama.cpp
- llama.cpp upstream: https://github.com/ggml-org/llama.cpp
- Blog de investigación de Zenteiq: https://zenteiq.ai/research/blog/
