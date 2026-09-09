# bananamind-research-community/BananaMind-Sundae

## Resumen

BananaMind-Sundae es un modelo de lenguaje compacto preentrenado desde cero, desarrollado por la comunidad BananaMind Research Community. Se trata de un modelo base de tipo decoder-only basado en la arquitectura LLaMA, con un tamaño extremadamente reducido de 20 millones de parámetros aproximadamente (20.156.544 parámetros exactos). Fue preentrenado sobre unos 2.000 millones de tokens procedentes del dataset FineWeb-Edu, un corpus educativo en inglés derivado de la web.

Su relevancia radica en ser un modelo mínimo y completamente entrenado desde cero, lo que lo convierte en una opción interesante para experimentos de escalado, investigación sobre interpretabilidad y estudios de los límites de los modelos de lenguaje en tamaños reducidos. Con una longitud de contexto de 1024 tokens, no ofrece capacidades de razonamiento avanzado ni de seguimiento de instrucciones, ya que no ha pasado por un proceso de ajuste fino conversacional. Los autores lo presentan como un modelo base, no un chatbot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaMA (decoder-only transformer) |
| Parametros totales | 20.156.544 (~20M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (no se han publicado pesos cuantizados) |
| Idiomas soportados | no disponible (entrenado con FineWeb-Edu, predominantemente ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

BananaMind-Sundae sigue la arquitectura LLaMA, un transformer decoder-only con normalizacion por capas, activaciones SwiGLU y embeddings rotatorios posicionales (RoPE). El modelo fue preentrenado desde cero sobre aproximadamente 2.000 millones de tokens del dataset FineWeb-Edu, una version filtrada de FineWeb orientada a contenido educativo. No se indica el uso de tecnicas de alineacion como RLHF o DPO, ni tampoco de ajuste fino posterior: es un modelo puramente base, sin instrucciones. A 20 millones de parametros y con un contexto de 1024 tokens, se trata de un modelo de escala extremadamente reducida, disenado probablemente como ejercicio academico o punto de partida para exploraciones de entrenamiento a pequeña escala.

## Capacidades

- Generacion de texto autoregresiva basica en ingles, limitada a 1024 tokens de contexto.
- No soporta tool calling ni function calling, al ser un modelo base sin entrenamiento especifico.
- No soporta agentes ni razonamiento multi-paso de forma util.
- No dispone de capacidades multimodales (vision, audio, etc.).
- Existe un benchmark propio llamado BananaMind Base Bench 1.1, con 350 preguntas de opcion multiple en 7 categorias, donde el modelo alcanza una precision global del 38,9% frente al 25% del azar.
- No incluye modo de pensamiento (thinking mode), ni ha sido disenado para seguir instrucciones o dialogar.

## Casos de uso

- Investigacion sobre los limites de los modelos de lenguaje: por su tamaño minimo (20M), es util para estudiar que patrones linguisticos pueden emerger con muy pocos parametros y 2B de tokens, sirviendo como referencia para experimentos controlados.
- Pruebas de integracion con la libreria Transformers: se puede usar para verificar que el pipeline de carga y generacion funciona correctamente en entornos con recursos limitados, sin la complejidad de modelos grandes.
- Experimentos de interpretabilidad mecanistica: la pequena escala facilita el analisis de cabezas de atencion y representaciones internas, permitiendo la observacion directa de computaciones de bajo nivel.
- Educacion y formacion en ingenieria de modelos de lenguaje: es un ejemplo practico de un modelo preentrenado desde cero con valores de referencia numericos, util para documentar los pasos del entrenamiento y la evaluacion.
- Pruebas de escalado o comparativas de eficiencia: se puede emplear para medir el coste computacional de tokenizar, predecir y generar secuencias en un modelo basico de este tamaño, sirviendo como baseline en benchmarks de eficiencia.
- Prototipos de continuacion de texto no criticos: puede generar completaciones sencillas en ingles para demos internas, siempre que se acepte la falta de calidad y la posibilidad de contenido incoherente.

## Benchmarks y rendimiento

Los unicos datos publicados provienen del benchmark propio de los autores, BananaMind Base Bench 1.1. La evaluacion se basa en 350 ejemplos de opcion multiple con 4 alternativas, puntuados mediante la media log-probabilidad condicionada.

| Metrica | Resultado |
|---|---|
| Elo global | 896 |
| Elo aleatorio (suelo) | 805 |
| Elo sobre el azar | +91 |
| Precision global | 38,9% |
| Intervalo de confianza 95% | [33,8% – 44,0%] |
| Z frente al azar | +5,99 |

Resultados por categoria:

| Categoria | Precision | Elo |
|---|---|---|
| Completacion de lenguaje | 82,0% | 1167 |
| Conocimiento del mundo | 44,0% | 874 |
| Seguimiento de contexto | 44,0% | 938 |
| Sentido comun | 34,0% | 789 |
| Razonamiento logico | 28,0% | 920 |
| Cuantitativo | 22,0% | 815 |
| Completacion de codigo | 18,0% | 831 |

Resultados por dificultad:

| Dificultad | Precision |
|---|---|
| Facil | 49,6% |
| Media | 34,2% |
| Dificil | 32,8% |

Estos resultados son muy bajos en terminos absolutos, pero el modelo se desvia significativamente del azar (z = +5,99). No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- Con 20M de parametros y pesos en fp32, el modelo ocupa aproximadamente 80 MB en memoria, por lo que cualquier GPU moderna o incluso una CPU es suficiente.
- No se requiere una GPU especifica; se puede ejecutar en CPU con facilidad.
- Cabe sin problemas en hardware de consumo (portatiles, Raspberry Pi con 4 GB de RAM, etc.).
- Opciones de despliegue habituales: Hugging Face Transformers en Python, PyTorch directo, y es probable que pueda convertirse a llama.cpp o servirse con vLLM, aunque no se han publicado pesos GGUF ni cuantizaciones oficiales.
- La latencia de generacion es extremadamente baja para este tamaño, del orden de milisegundos por token en CPU; el throughput es muy alto.

## Comparativa con modelos similares

No se dispone de datos que permitan una comparacion directa con modelos equivalentes, ya que existen pocos modelos publicados con exactamente 20M de parametros y la misma configuracion. Los modelos de referencia tipicos como TinyLlama (1.1B) o GPT-2 (124M) son al menos un orden de magnitud mayores y no pueden compararse en terminos de rendimiento esperado. Por ello, la comparativa se indica como no disponible.

## Limitaciones y advertencias

- Es un modelo base, no un modelo de chat ni instrucciones; no se puede esperar que siga comandos ni mantenga una conversacion coherente.
- La longitud de contexto es de 1024 tokens, lo que limita cualquier tarea que requiera dependencias de larga distancia.
- El dataset de entrenamiento FineWeb-Edu esta predominantemente en ingles, por lo que no se garantiza un rendimiento adecuado en otros idiomas.
- La precision global del 38,9% en su benchmark interno es baja en terminos absolutos, muy por debajo de un uso realista en aplicaciones de produccion.
- No se ha publicado una licencia explicita, por lo que los derechos de uso comercial son inciertos; conviene contactar con los autores antes de cualquier despliegue.
- Los resultados de la completacion de codigo (18,0%) y del razonamiento cuantitativo (22,0%) indican un rendimiento muy limitado en tareas tecnicas.
- Al ser un modelo tan pequeno, la generacion puede producir facilmente textura incoherente, repeticiones y contenido sin sentido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bananamind-research-community/BananaMind-Sundae
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Comunidad BananaMind Research Community: https://huggingface.co/bananamind-research-community
