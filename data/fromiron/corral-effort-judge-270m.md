# fromiron/corral-effort-judge-270m

## Resumen

Corral Effort Judge 270M es un codificador de texto ajustado a partir de google/embeddinggemma-2 y desarrollado por fromiron. No es un modelo generativo: se trata de un encoder de embeddings de 768 dimensiones que produce representaciones normalizadas y que, combinado con dos cabezas de clasificación que se distribuyen aparte (en el repositorio de Corral, archivo `weights/effort-v4.json`), decide el "esfuerzo de razonamiento" que debe emplear un agente de programación en su siguiente respuesta. Es decir, su función es la de un juez auxiliar que clasifica la dificultad de la tarea a partir del texto de contexto.

El modelo se publica cuantizado a int8 y empaquetado en formato LiteRT-LM (`.litertlm`), con un único archivo de 305.148.992 bytes (unos 0,3 GB). El bundle incluye el grafo de embeddings de tokens, grafos de encoder para 128, 256, 512 y 1.024 tokens, y el tokenizador SentencePiece del modelo base. Está pensado para ejecutarse en el runtime LiteRT-LM 0.19 mediante `EmbeddingEngine`, con normalización activada y truncado de entrada configurado como `TRUNCATE`.

Su relevancia es acotada pero concreta: ejemplifica un patrón de despliegue de modelos pequeños y especializados en local (edge/on-device) para tareas de enrutamiento y control dentro de pipelines de agentes, en lugar de recurrir a un LLM grande para cada decisión auxiliar. La licencia Apache-2.0 facilita su integración, aunque el modelo está diseñado específicamente para el formato de entrada y las cabezas de Corral.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (derivado de EmbeddingGemma 2), empaquetado LiteRT-LM con grafos para 128, 256, 512 y 1.024 tokens |
| Parametros totales | 270M (según el nombre del modelo; no se detalla el desglose en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 1.024 tokens, conservando el inicio de la entrada |
| Tipos de cuantizacion | int8 (único formato publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/embeddinggemma-2, un codificador de texto orientado a embeddings, y se ha ajustado (fine-tuning) para la tarea de clasificación de esfuerzo de razonamiento de Corral. La salida es un vector normalizado de 768 dimensiones; la decisión final no la toma el encoder por sí solo, sino dos cabezas de clasificación pequeñas que acompañan al modelo en el repositorio de Corral y que se aplican sobre ese embedding. El bundle LiteRT-LM contiene el grafo de embedding de tokens, varios grafos de encoder según la longitud de entrada (128, 256, 512 y 1.024 tokens) y el tokenizador SentencePiece del modelo base (BOS 2, EOS 1).

La entrada esperada sigue un formato concreto: el prefijo `task: classification | query: ` seguido del texto `effort-text-v2` de Corral. El runtime es LiteRT-LM 0.19 con `EmbeddingEngine`, normalización activada y política de desbordamiento `TRUNCATE` (se conserva el comienzo de la secuencia). No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; la model card tampoco describe innovaciones de decodificación, algo coherente con un encoder que no genera texto.

## Capacidades

- Extracción de features: genera embeddings de texto normalizados de 768 dimensiones (pipeline `feature-extraction`).
- Clasificación de esfuerzo de razonamiento: mediante las dos cabezas de clasificación de Corral, estima el nivel de esfuerzo adecuado para la siguiente respuesta de un agente de programación.
- Procesamiento de entradas de hasta 1.024 tokens con truncado desde el inicio.
- Soporte de múltiples longitudes de secuencia precompiladas (128, 256, 512 y 1.024 tokens) para optimizar la inferencia.
- Ejecución local en el runtime LiteRT-LM, orientada a despliegue on-device.
- No soporta generación de texto, tool calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito; es un encoder, no un LLM.

## Casos de uso

- Enrutamiento de esfuerzo en agentes de código: integrar el encoder y las cabezas de Corral en el bucle del agente para decidir, antes de cada respuesta, si conviene un razonamiento ligero o uno más profundo, reduciendo coste y latencia en tareas triviales.
- Control de coste en pipelines LLM: usar la clasificación como paso previo que seleccione el modelo o el presupuesto de tokens de la llamada principal, evitando invocar modelos grandes para peticiones sencillas.
- Despliegue local en estaciones de desarrollo: al ocupar unos 0,3 GB en int8 y ejecutarse con LiteRT-LM, puede correr junto al agente en portátiles sin GPU dedicada, manteniendo la decisión de enrutamiento en el dispositivo.
- Investigación sobre metacognición en agentes: servir como componente medible y reproducible para experimentos sobre cuándo un agente debe "pensar más", con un formato de entrada bien definido (`effort-text-v2`).
- Filtrado y priorización de tareas: clasificar lotes de peticiones o issues según la dificultad estimada para asignar recursos o colas de procesamiento.
- Base para ajustes adicionales: al derivar de EmbeddingGemma 2 y publicarse con Apache-2.0, puede reutilizarse como encoder de partida para otros clasificadores ligeros de texto, siempre que se respete el formato de entrada esperado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que los resultados de evaluación existentes son comprobaciones de regresión, no una evaluación final independiente.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo pesa unos 305 MB en int8; la inferencia requiere del orden de 0,3-0,5 GB de memoria, según el grafo de encoder y el runtime.
- GPU recomendadas: no se especifican; el formato LiteRT-LM está orientado a ejecución local y aceleración en dispositivos, no a GPUs de datacenter.
- GPU de consumo: por tamaño, es viable en hardware de gama baja y en CPU; no se detallan modelos concretos ni requisitos mínimos.
- Opciones de despliegue: runtime LiteRT-LM 0.19 con `EmbeddingEngine`; no se indica soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Corral Effort Judge 270M | 270M | 1.024 tokens | Clasificación de esfuerzo (embeddings + cabezas) | Apache-2.0 | `.litertlm` int8 |
| google/embeddinggemma-2 (base) | no disponible | no disponible | Embeddings de texto | no disponible en esta ficha | no disponible en esta ficha |
| Encoders tipo MiniLM/BGE pequeños | ~100-400M | variable | Embeddings de texto | variable | safetensors, GGUF, ONNX |

La comparación con alternativas genéricas de embeddings no es directa: Corral Effort Judge está especializado en una tarea de clasificación concreta y depende de cabezas externas, por lo que no es intercambiable con un encoder de propósito general sin reentrenamiento. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Diseñado para el formato de entrada de Corral (`task: classification | query: ` + `effort-text-v2`) y sus cabezas de clasificación; otros usos no están probados.
- Los resultados de evaluación existentes son comprobaciones de regresión, no una evaluación final independiente.
- La regla de "petición abierta" aún requiere validación en tareas realmente abiertas.
- Los términos de estado de herramientas difieren entre los datos de entrenamiento y los de producto; el efecto de esta discrepancia no se ha medido.
- Al ser un encoder de 1.024 tokens de contexto, no puede procesar entradas más largas sin truncado, lo que puede perder información relevante al final del texto.
- No se documentan sesgos ni comportamiento multilingüe; los idiomas soportados figuran como no disponibles.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de clasificaciones erróneas que lleven a un esfuerzo de razonamiento inadecuado.
- Licencia Apache-2.0: permite uso comercial, pero al ser una versión modificada de EmbeddingGemma 2 conviene revisar las condiciones del modelo base de Google.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fromiron/corral-effort-judge-270m
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Repositorio de Corral: https://github.com/fromiron/corral
