# Sadanie/Inkling-2-Mini-Half

## Resumen

Inkling-2-Mini-Half es un adaptador de inferencia eficiente en memoria para el modelo de mezcla de expertos (MoE) Inkling-2-Mini, desarrollado por Thinking Machines y publicado bajo licencia Apache 2.0. Lo publica el usuario Sadanie en Hugging Face y aplica una técnica denominada Memory-Sparse MoE (MS-MoE): en lugar de mantener en memoria los 128 expertos por capa del modelo completo, un pequeño modelo predictor (el "receptionist") selecciona 64 expertos por capa en función de la pregunta y solo esos se cargan. El objetivo es hacer viable un MoE de 17,3 GB en 4 bits sobre un Mac Apple Silicon de 16 GB de memoria unificada.

El modelo base Inkling-2-Mini es un transformer MoE con 24 capas que enruta cada token por 8 de sus 128 expertos por capa. El repositorio no redistribuye los pesos de los expertos: incluye un router reentrenado, un adaptador LoRA de atención (rango 16), el modelo receptionist (construido sobre Qwen3-Embedding-0.6B más los embeddings de tokens de Inkling) y utilidades de ejecución en MLX. Los pesos de los expertos se descargan aparte desde la conversión 4-bit de mlx-community.

La relevancia práctica es doble: demuestra que se puede reducir el piso de memoria de un MoE a la mitad con una pérdida acotada de calidad (2,5 puntos o menos en código, matemáticas y conocimiento según el autor) y ofrece un camino concreto para ejecutar modelos MoE grandes en hardware de consumo Apple. La contrapartida es que, de momento, solo funciona en macOS con MLX y está orientado a inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) con 24 capas; 8 de 128 expertos activos por token y capa |
| Parametros totales | no disponible (el modelo base en 4 bits ocupa 17,3 GB) |
| Parametros activos | 8 de 128 expertos por capa (fracción activa no cuantificada en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (pesos del modelo base vía mlx-community); embeddings en fp16 para el receptionist |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores y receptionist), npy (prior y embeddings), MLX para ejecución |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo MoE con 24 capas y 128 expertos por capa, de los cuales se activan 8 por token. La innovación de este repositorio no está en el modelo base sino en el esquema MS-MoE: un receptionist (red pequeña sobre Qwen3-Embedding-0.6B y los embeddings de tokens de Inkling) lee la pregunta y predice qué 64 expertos por capa serán necesarios. Solo esos expertos se cargan en memoria, mientras que el router y un LoRA de atención (rango 16 sobre las proyecciones de atención) se reentrenan para operar con ese subconjunto. Los pesos de los expertos permanecen congelados.

El proceso de entrenamiento se apoyó en 18.271 preguntas (código, matemáticas, ciencia, chat general y varios idiomas) respondidas por el modelo completo, registrando qué expertos usaba cada respuesta. El receptionist se entrenó para predecir esa selección a partir solo de la pregunta; sus 64 elecciones por capa cubren aproximadamente el 90 % del uso real de expertos de una respuesta. Después, el router y el LoRA de atención se ajustaron durante dos épocas con el equipo restringido a las elecciones del receptionist y usando las salidas del modelo completo como objetivo. En modo chat, cada mensaje nuevo genera sus propias elecciones y se mezclan al 50 % con las anteriores para minimizar el intercambio de expertos entre turnos.

## Capacidades

- Generación de texto en inglés con modo de razonamiento (thinking effort configurable, con valor 0 en las pruebas publicadas).
- Razonamiento y resolución de problemas de código: 89,1 % en MBPP (257 problemas) con 64 expertos.
- Matemáticas: 94,8 % en GSM8K (1.319 problemas), frente al 95,4 % del modelo completo.
- Conocimiento general: 76,0 % en MMLU (3.000 preguntas), frente al 78,0 % del modelo completo.
- Conversación multi-turno mediante el modo `--chat`, con reutilización incremental de la selección de expertos.
- Verificación de integridad de la selección de expertos con `--check`, que compara las elecciones locales con las de referencia (debe dar en torno al 99 %).
- No se documentan tool calling, function calling, capacidades de agente, visión ni audio en la información disponible.

## Casos de uso

- Desarrollo asistido en portátiles Apple Silicon de 16 GB: el modelo permite generar y revisar código Python en local con un pico de 9 GB de memoria, sin depender de la nube ni de GPUs dedicadas.
- Prototipado de aplicaciones de razonamiento matemático: con 94,8 % en GSM8K, sirve para validar pipelines de resolución de problemas aritméticos antes de escalar a modelos mayores.
- Evaluación de técnicas de compresión MoE: el repositorio incluye el receptionist, el router y el LoRA, lo que permite reproducir y auditar el esquema MS-MoE frente a alternativas como la poda REAP.
- Educación y experimentación con MoE en hardware de consumo: útil en docencia o investigación para estudiar enrutamiento de expertos sin acceso a clústeres.
- Asistentes de conocimiento general offline: con 76 % en MMLU, cubre consultas de cultura general y ciencia en entornos sin conectividad.
- Chat local multi-turno: el modo `--chat` mantiene contexto entre mensajes con un coste de intercambio de expertos reducido, adecuado para asistentes personales en escritorio.
- Verificación de integridad en pipelines de ML: el comando `--check` permite validar que la selección de expertos en una máquina concreta coincide con la referencia antes de desplegar.

## Benchmarks y rendimiento

Resultados publicados por el autor, decodificación greedy y thinking effort 0:

| Test | Modelo completo (128 expertos) | MS-MoE (64 expertos) | Poda REAP (64 expertos) |
|---|---|---|---|
| Código, MBPP (257 problemas) | 91,4 % | 89,1 % | 35,0 % |
| Matemáticas, GSM8K (1.319 problemas) | 95,4 % | 94,8 % | 89,0 % |
| Conocimiento, MMLU (3.000 preguntas) | 78,0 % | 76,0 % | 53,9 % |

Rendimiento en hardware: en un MacBook M1 de 16 GB, pico de 9,0 GB de memoria, aproximadamente 10 tokens por segundo y unos 20 segundos para cargar los expertos de la primera pregunta.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 9,0 GB de pico en inferencia con 64 expertos (frente a 17,3 GB del modelo completo en 4 bits).
- Hardware soportado: Mac Apple Silicon con 16 GB de memoria unificada y unos 20 GB de disco libre. El autor indica que de momento solo funciona en Mac (MLX).
- GPU dedicadas (A100, H100, RTX 4090): no soportadas según la información disponible; el repositorio está atado a MLX.
- Despliegue: MLX con `mlx==0.32.4` y un commit concreto de `mlx-lm` (`0c4c99192230f1943dd468d297f0b8a64ae7b7c2`) que añade soporte para Inkling. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 10 tokens por segundo en M1; 20 segundos de carga inicial de expertos.
- Requisito de memoria: el script comprueba la memoria libre y avisa si no hay suficiente; se recomienda cerrar aplicaciones pesadas antes de ejecutar.

## Comparativa con modelos similares

| Modelo | Enfoque | Expertos en memoria | MBPP | GSM8K | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Inkling-2-Mini-Half (MS-MoE) | Selección predictiva de expertos | 64 de 128 | 89,1 % | 94,8 % | 76,0 % | Apache 2.0 | Hugging Face, MLX |
| Inkling-2-Mini completo (4 bits) | MoE sin compresión | 128 de 128 | 91,4 % | 95,4 % | 78,0 % | Apache 2.0 | Hugging Face, MLX |
| Inkling-2-Mini con poda REAP | Poda de expertos | 64 de 128 | 35,0 % | 89,0 % | 53,9 % | Apache 2.0 | No disponible como artefacto en la información |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo funciona en macOS con Apple Silicon y MLX; no hay soporte documentado para CUDA, ROCm ni otros runtimes.
- El idioma declarado es únicamente inglés, aunque el entrenamiento del receptionist usó preguntas en varios idiomas.
- Pérdida de calidad respecto al modelo completo: 2,3 puntos en MBPP, 0,6 en GSM8K y 2,0 en MMLU según los datos del autor.
- La cobertura de la selección de expertos es aproximada: el receptionist cubre en torno al 90 % del uso real de expertos de una respuesta, lo que puede degradar respuestas en dominios poco representados.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas de sesgo ni de tasas de alucinación; al ser un adaptador de un modelo base de terceros, hereda sus sesgos.
- Longitud de contexto no especificada, lo que impide planificar cargas con documentos largos.
- Latencia inicial elevada: unos 20 segundos para cargar los expertos de la primera pregunta.
- El repositorio no incluye los pesos de los expertos; depende de la descarga del modelo base 4-bit de mlx-community, lo que añade una dependencia externa y 17 GB adicionales de disco.
- Uso comercial permitido por la licencia Apache 2.0, pero conviene verificar las condiciones del modelo base y de la conversión de mlx-community.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Sadanie/Inkling-2-Mini-Half
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Conversión 4-bit de mlx-community: https://huggingface.co/mlx-community/Inkling-2-Mini-4bit
- Qwen3-Embedding-0.6B (usado por el receptionist): https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
