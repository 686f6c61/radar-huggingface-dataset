# manuelgscom/rumor-village-e4b-GGUF

## Resumen

rumor-village-e4b es un ajuste fino mediante LoRA del modelo Gemma 4 E4B de Google, fusionado y cuantizado a GGUF Q4_K_M, desarrollado por Manuel García Sanz. Su propósito no es la conversación general, sino actuar como motor de decisión de los NPC de Rumor Village, un juego de simulación de rumores para Linux y Windows en el que hasta 100 vecinos de un pueblo 3D toman decisiones de forma autónoma. Cada vecino envía al modelo una tarjeta breve (identidad, ubicación, vecinos presentes y conocimiento acumulado) y recibe una única acción en JSON: saludar, contar un rumor, preguntar por él, despedirse, desplazarse o no hacer nada, acompañada de una frase para el bocadillo.

La relevancia del modelo reside en su contrato de salida estrictamente cerrado y en su eficiencia: todas las decisiones de los vecinos se procesan en un único lote sobre una GPU de consumo, sin conexión a internet y en tiempo real. El modelo base cuenta con 7.518.069.290 parámetros totales, y el autor declara un contexto de trabajo de 256 tokens por decisión con prefijo compartido cacheado, lo que reduce drásticamente el coste por inferencia en comparación con un prompt completo.

El ajuste se centra en dos tareas concretas, `decide` y `extract`, y está entrenado para leer y escribir en inglés y español. La licencia Apache-2.0 y la disponibilidad del GGUF en un único archivo de 5,34 GB facilitan su integración en proyectos de agentes generativos y simulación multiagente fuera del propio juego.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E4B de Google), ajuste fino LoRA fusionado |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | 256 tokens por tarjeta de decisión (prefijo compartido cacheado); longitud máxima del modelo base no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (5.335.287.008 bytes) |
| Idiomas soportados | Inglés y español |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E4B, un transformer de Google con 7.518.069.290 parámetros totales, sobre el que se aplica un ajuste fino LoRA posteriormente fusionado en los pesos base. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se emplearon técnicas de RLHF o DPO; tampoco se especifican innovaciones de atención o decodificación más allá del uso de gramáticas para forzar la salida JSON.

La innovación principal del ajuste es la adaptación a un contrato de salida cerrado: el modelo responde con una acción perteneciente a un vocabulario finito (lugares, vecinos y tipos de noticias del juego) y una frase de diálogo, validada después por el motor del juego. El entrenamiento se orienta a dos tareas, `decide` (acción de un vecino a partir de su tarjeta) y `extract` (conversión de un rumor escrito por el jugador en un hecho estructurado), con tarjetas de aproximadamente 256 tokens y prefijo compartido cacheado para procesar a todos los vecinos en un solo lote.

## Capacidades

- Generación de acciones estructuradas en JSON forzadas por gramática: saludar, contar un rumor, preguntar por él, despedirse, desplazarse o no hacer nada.
- Generación de una frase breve de diálogo para el bocadillo del personaje, coherente con la acción elegida.
- Tarea `extract`: transformación de un rumor escrito en lenguaje natural por el jugador en un hecho estructurado dentro del vocabulario del juego.
- Decisión multiagente por lotes: hasta 100 vecinos evaluados simultáneamente en una sola GPU de consumo.
- Soporte bilingüe inglés-español, tanto en lectura de tarjetas como en generación de diálogo.
- Funcionamiento completamente offline tras la descarga inicial del GGUF, verificado por SHA-256.
- No es un modelo de chat general: no está entrenado para conversación abierta, razonamiento libre ni tool calling genérico.

## Casos de uso

- Simulación de sociedades de agentes generativos: el modelo puede poblar un entorno con decenas de NPC que intercambian rumores y toman decisiones autónomas, gracias a su capacidad de procesar un lote completo de tarjetas en una sola GPU de consumo.
- Videojuegos con NPC reactivos y offline: integrado mediante llama.cpp con backend CUDA o Vulkan, permite que un título de Linux o Windows ejecute diálogos y decisiones emergentes sin conexión ni costes de API, como demuestra el propio Rumor Village.
- Investigación sobre propagación de información: su tarea `extract` convierte rumores en hechos estructurados, lo que facilita experimentos reproducibles sobre cómo se difunde y distorsiona una noticia en una red de agentes.
- Prototipado de contratos de salida cerrados: sirve como referencia para entrenar modelos pequeños que deban responder exclusivamente con un JSON validable por gramática, sin texto libre alrededor.
- Evaluación de robustez multilingüe en agentes: al cubrir inglés y español con métricas separadas por idioma, permite comparar la coherencia de decisiones entre ambas lenguas en un mismo entorno simulado.
- Generación de diálogo breve contextualizado: la frase asociada a cada acción puede reutilizarse en sistemas de bocadillos, subtítulos o registros de eventos de mundos virtuales sin necesidad de un modelo conversacional mayor.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto congelado Rumor Village decision test (1.000 tarjetas por idioma). No están verificados de forma independiente.

| Métrica (%) | Inglés | Español |
|---|---|---|
| Memorias inventadas (made-up memories) | 0,0 | 0,0 |
| Contradicciones | 0,1 | 0,2 |
| Texto incoherente | 0,6 | 0,0 |
| Acciones rechazadas | 0,9 | 1,0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q4_K_M ocupa 5,34 GB, por lo que se necesita algo más de esa cifra para pesos y caché KV; una GPU con 8 GB de VRAM es un objetivo razonable para el despliegue.
- GPU recomendadas: el autor indica ejecución en una única GPU de consumo; los tags del repositorio mencionan backends CUDA y Vulkan, por lo que tarjetas NVIDIA y AMD/Intel recientes son compatibles a través de llama.cpp.
- Cabe en GPU de consumo: sí, con cuantización Q4_K_M y un único archivo de 5,34 GB.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), con backends CUDA y Vulkan; el repositorio incluye la etiqueta `endpoints_compatible`. No se documentan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no se publican cifras concretas; el autor afirma que los 100 vecinos deciden en un solo lote en tiempo real sobre una GPU de consumo, con tarjetas de 256 tokens y prefijo compartido cacheado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| rumor-village-e4b | 7.518.069.290 | 256 tokens por tarjeta (prefijo cacheado) | GGUF Q4_K_M | Apache-2.0 | Decisiones JSON de NPC en un juego concreto |
| google/gemma-4-E4B-it (base) | 7.518.069.290 | no disponible | safetensors y otros | no disponible en la información | Chat general de propósito múltiple |
| Alternativas de agentes pequeños para juegos | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con otros ajustes finos para NPC o simulación multiagente no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado: no es un chat general y su rendimiento fuera del formato de tarjeta y del vocabulario cerrado del juego no está garantizado.
- Contexto de trabajo corto: las decisiones se diseñan para tarjetas de unos 256 tokens con prefijo compartido; entradas más largas o sin caché de prefijo pueden degradar el comportamiento y el rendimiento.
- Sesgos: no se documentan sesgos específicos; al derivar de Gemma 4 E4B, puede heredar los del modelo base, no detallados en la información disponible.
- Alucinación: el autor declara un 0 % de memorias inventadas en su test congelado, pero se trata de una métrica autodeclarada y no verificada; en producción conviene mantener la validación por parte del motor.
- Idiomas: solo inglés y español; no hay soporte documentado para otras lenguas.
- Licencia: Apache-2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base Gemma 4 E4B de Google, cuyos términos no se detallan en la información disponible.
- Dependencia del contrato: cualquier cambio en el formato de tarjeta, en el vocabulario de acciones o en la gramática de salida requiere reentrenamiento o ajuste, ya que el modelo está entrenado para un contrato único.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/manuelgscom/rumor-village-e4b-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio del juego y código fuente: https://github.com/manuelgscom/rumor-village
- Descargas del juego: https://github.com/manuelgscom/rumor-village/releases/latest
- Archivo GGUF Q4_K_M: https://huggingface.co/manuelgscom/rumor-village-e4b-GGUF/resolve/main/gemma-4-E4B-it-rumor-Q4_K_M.gguf?download=true
- Licencia: https://huggingface.co/manuelgscom/rumor-village-e4b-GGUF/blob/main/LICENSE
- Sitio web del autor: https://manuelgs.com/en/
