# NellWatson/Qwen3-4B-cabal-routing-q4f16_1-MLC

## Resumen

NellWatson/Qwen3-4B-cabal-routing-q4f16_1-MLC es un ajuste fino de Qwen/Qwen3-4B orientado exclusivamente a un videojuego de estrategia sobre la Guerra de Crimea llamado CABAL. Sobre el modelo base se ha fusionado un LoRA de rango 16 que destila el comportamiento de "Jev 1.14" (una API de decisiones vía OpenRouter) en dos tareas concretas: enrutar las peticiones de un comandante hacia los asesores adecuados y redactar el "acta de gabinete" (qué recomendaciones adoptar y con qué perfil de prioridad de suministros). No es un modelo de propósito general: el propio autor indica explícitamente que no está pensado para uso general.

El artefacto publicado no son pesos en formato estándar, sino una conversión al formato q4f16_1 de MLC-LLM/WebLLM, con el mismo layout que mlc-ai/Qwen3-4B-q4f16_1-MLC, de modo que carga directamente con la librería WebGPU precompilada de ese modelo. Esto lo hace ejecutable en el navegador mediante WebLLM, sin servidor de inferencia.

Su relevancia es acotada pero ilustrativa: muestra un patrón de destilación de decisiones estructuradas (scoring de la primera elección, sin análisis escrito) sobre un modelo pequeño de 4B parámetros, empaquetado para despliegue cliente-side. El repositorio ocupa 6,4 GB y acumula 95 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B); no se detalla en la model card |
| Parametros totales | 4B (modelo base Qwen/Qwen3-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | q4f16_1 (grupo cuantizado de MLC-LLM: 4 bits de pesos con activaciones en fp16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC-LLM (q4f16_1), compatible con WebLLM y su librería WebGPU precompilada |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, un transformer decoder-only de 4.000 millones de parámetros, y le aplica un LoRA de rango 16 que posteriormente se fusiona en los pesos base. El entrenamiento destila el comportamiento de Jev 1.14 (OpenRouter Decisions API) sobre dos decisiones del juego: el enrutamiento de asesores y el acta de gabinete. La función de pérdida cubre únicamente los tokens correspondientes a la letra de respuesta, es decir, se entrena para puntuar opciones discretas en lugar de generar deliberación en texto libre. Un chequeo puntual de las deliberaciones en texto libre tras la primera pasada no detectó degradación según el autor.

El proceso de conversión reutiliza la configuración, el tokenizador y el layout de tensores de mlc-ai/Qwen3-4B-q4f16_1-MLC, y el resultado carga con la librería WebGPU precompilada de ese modelo. En el repositorio coexisten varias pasadas: r1 (revisión a5b5f5db) y r2 (59de9831), esta última mejor en enrutamiento y peor en el acta de gabinete. Existe además un repositorio hermano, NellWatson/Qwen3-4B-cabal-base-q4f16_1-MLC, con el Qwen3-4B sin modificar convertido al mismo formato, cuyos 435 tensores son idénticos byte a byte a los de mlc-ai/Qwen3-4B-q4f16_1-MLC en la revisión a5c9fab8.

## Capacidades

- Puntuación de elección sobre el primer token: selecciona entre opciones discretas (asesores, recomendaciones, perfiles de prioridad) sin emitir análisis escrito.
- Enrutamiento de asesores: dado un caso del juego, decide qué asesores requiere la petición de un comandante.
- Redacción del acta de gabinete: decide qué recomendaciones adoptar y qué perfil de prioridad de suministros aplicar.
- Generación de texto libre: heredada del modelo base, aunque el entrenamiento solo optimiza los tokens de letra de respuesta; el autor reporta que un chequeo puntual no mostró degradación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está entrenado para decisiones de un solo paso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales: ejecución en navegador vía WebLLM con WebGPU; sin modo thinking documentado.

## Casos de uso

- Enrutamiento de asesores dentro de CABAL: el modelo recibe la petición de un comandante y devuelve qué asesores deben intervenir, sustituyendo al modelo base que redactaba primero un análisis. Es su caso de uso principal y el único para el que fue entrenado.
- Resolución del acta de gabinete en CABAL: dado un conjunto de recomendaciones y perfiles de prioridad de suministros, el modelo puntúa qué adoptar y con qué perfil, reduciendo la latencia frente a la generación de análisis previa.
- Inferencia en el cliente sin backend: al estar en formato MLC q4f16_1 con librería WebGPU precompilada, puede cargarse en el navegador del jugador mediante WebLLM, eliminando la necesidad de un servidor de inferencia para las decisiones del juego.
- Evaluación de técnicas de destilación de decisiones discretas: sirve como referencia reproducible de cómo un LoRA de rango 16 sobre un modelo de 4B puede aproximar el comportamiento de una API de decisiones en tareas de clasificación estructurada.
- Comparación de pasadas de ajuste: las revisiones r1, r2 y r3 del repositorio permiten estudiar el compromiso entre precisión en enrutamiento y precisión en el acta de gabinete a lo largo de iteraciones de entrenamiento.
- Prototipado de mecánicas de juego asistidas por modelo: útil para diseñadores que quieran experimentar con IA local en el navegador en juegos de estrategia por turnos, aunque limitado al dominio de CABAL.

## Benchmarks y rendimiento

Los resultados publicados son de scoring de la primera elección, sin análisis escrito, sobre conjuntos del dominio del juego. No son benchmarks estándar (MMLU, HumanEval, GSM8K) y no se han publicado resultados de esos benchmarks en la información disponible.

| Tarea | Conjunto | Este modelo (r3) | Modelo base (con análisis previo) |
|---|---|---|---|
| Acta de gabinete: recomendaciones adoptadas | 48 sesiones reservadas | 115/126 | 79/126 |
| Acta de gabinete: perfiles de prioridad | 48 sesiones reservadas | 37/42 | 31/42 |
| Enrutamiento de asesores | 188 casos nuevos, etiquetados de forma independiente | 166/188 correctos (18 respuestas erróneas con alta confianza) | 9/188 |

Comparación con la pasada anterior del mismo repositorio:

| Tarea | r2 | r3 |
|---|---|---|
| Enrutamiento de asesores | 169/188 | 166/188 |
| Acta de gabinete: recomendaciones | 95/126 | 115/126 |
| Acta de gabinete: perfiles de prioridad | 21/42 | 37/42 |

El autor señala que las 18 respuestas erróneas con alta confianza en enrutamiento superan el umbral de calidad que el juego exige para un enrutamiento autoritativo.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 6,4 GB en formato q4f16_1; la huella en memoria es coherente con un modelo de 4B cuantizado a 4 bits más overhead de la runtime MLC.
- GPU recomendadas: no se especifican en la información proporcionada. El requisito real es soporte de WebGPU en el navegador.
- Viabilidad en GPU de consumo: el formato q4f16_1 de 4B está diseñado para ejecutarse en hardware de consumo con WebGPU, aunque no se detallan modelos concretos.
- Opciones de despliegue: WebLLM (navegador, vía WebGPU) y MLC-LLM. No se mencionan vLLM, llama.cpp, Ollama ni TGI; el formato de pesos no es directamente compatible con ellos sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Propósito |
|---|---|---|---|---|---|
| NellWatson/Qwen3-4B-cabal-routing-q4f16_1-MLC | 4B | no disponible | MLC q4f16_1 | Apache 2.0 | Ajuste específico para CABAL |
| mlc-ai/Qwen3-4B-q4f16_1-MLC | 4B | no disponible | MLC q4f16_1 | Apache 2.0 | Qwen3-4B sin modificar, listo para WebLLM |
| NellWatson/Qwen3-4B-cabal-base-q4f16_1-MLC | 4B | no disponible | MLC q4f16_1 | Apache 2.0 | Qwen3-4B sin modificar, conversión independiente idéntica byte a byte a la de mlc-ai |
| Qwen/Qwen3-4B | 4B | no disponible | safetensors | Apache 2.0 | Modelo base original |

Los tres primeros comparten arquitectura y tamaño; la diferencia es el ajuste fino y el proceso de conversión. Frente al modelo base, este ajuste mejora de forma marcada en las dos tareas del juego, pero no es comparable en capacidades generales porque no fue entrenado para ellas.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no está pensado para uso general; su utilidad fuera de CABAL no está validada.
- En enrutamiento de asesores produce 18 respuestas erróneas con alta confianza sobre 188 casos, por encima del umbral que el juego considera aceptable para enrutamiento autoritativo.
- El entrenamiento solo cubre los tokens de letra de respuesta; la calidad de la generación en texto libre se verificó únicamente con un chequeo puntual, no con una evaluación sistemática.
- El compromiso entre tareas varía entre pasadas: r2 era mejor en enrutamiento (169/188) y peor en el acta de gabinete (95/126 y 21/42), lo que indica sensibilidad al proceso de ajuste.
- No hay información sobre sesgos, idiomas soportados ni riesgo de alucinación más allá de lo indicado.
- La licencia Apache 2.0 permite uso comercial, pero el dominio de entrenamiento y la falta de evaluación general desaconsejan su uso en producción fuera del juego.
- El formato MLC q4f16_1 limita el despliegue a MLC-LLM y WebLLM; no es directamente utilizable en runtimes que esperan safetensors o GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NellWatson/Qwen3-4B-cabal-routing-q4f16_1-MLC
- Repositorio hermano con el modelo base convertido: https://huggingface.co/NellWatson/Qwen3-4B-cabal-base-q4f16_1-MLC
- Modelo base original: https://huggingface.co/Qwen/Qwen3-4B
- Conversión de referencia de MLC: https://huggingface.co/mlc-ai/Qwen3-4B-q4f16_1-MLC
