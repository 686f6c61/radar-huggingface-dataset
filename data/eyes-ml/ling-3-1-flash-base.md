# eyes-ml/Ling-3.1-flash-base

## Resumen

Ling-3.1-flash-base es el checkpoint base del modelo Ling-3.1-flash, desarrollado por inclusionAI (equipo vinculado a Ant Group, con presencia en Hugging Face y ModelScope). Se publica para facilitar investigación, preentrenamiento continuado, adaptación de dominio y experimentación en post-entrenamiento. Su relevancia radica en que ofrece una arquitectura MoE híbrida de atención lineal a gran escala bajo licencia MIT, algo poco habitual en modelos de este tamaño.

El modelo combina una arquitectura Mixture-of-Experts dispersa con atención lineal híbrida: 512 expertos enrutados (8 activos más 1 compartido por token), lo que resulta en 25B parámetros activos sobre un total de 560B. La columna vertebral alterna 63 capas KDA (atención lineal) con 9 capas Gated MLA en proporción 7:1, más 4 capas densas.

Se trata de un checkpoint base, no de un modelo alineado para instrucciones: no incorpora SFT ni RLHF, por lo que no está pensado para uso conversacional directo sin un post-entrenamiento previo. Los pesos se distribuyen en BF16 (resultado de una fusión WSM de checkpoints), aunque el entrenamiento original se realizó en FP8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida con atención lineal (63 capas KDA + 9 capas Gated MLA, ratio 7:1) |
| Parametros totales | 560B (572.120.680.768 según safetensors) |
| Parametros activos | 25B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible (evaluado en benchmarks multilingües como Belebele) |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16) |

Otras especificaciones declaradas por el autor:

| Parametro | Valor |
|---|---|
| Capas transformer | 63 KDA + 9 Gated MLA |
| Capas densas | 4 |
| Expertos enrutados | 512 |
| Expertos compartidos | 1 |
| Expertos enrutados activos | 8 |
| Cabezas de atención | 64 |
| Hidden size | 4096 |
| Tamaño intermedio de experto | 1280 |
| Tamaño intermedio denso | 10240 |
| Tamaño de vocabulario | 157184 |
| Tamaño del repo | 1144,3 GB |

## Arquitectura y entrenamiento

Ling-3.1-flash-base emplea una arquitectura transformer MoE dispersa con atención lineal híbrida. La pila combina capas KDA (atención lineal) y capas Gated MLA (atención multi-cabeza latente con compuertas) en proporción 7:1, lo que reduce el coste computacional asociado a la atención sobre secuencias largas. Cada token activa 8 de los 512 expertos enrutados más un experto compartido, dando lugar a 25B parámetros activos sobre 560B totales. El modelo cuenta con 4 capas densas, 64 cabezas de atención, hidden size de 4096 y un vocabulario de 157.184 tokens.

El entrenamiento se realizó en precisión FP8, y el checkpoint publicado en BF16 se obtuvo tras una fusión de checkpoints mediante la técnica WSM (Warmup-Stable and Merge). Al ser un checkpoint base, no consta que se hayan aplicado fases de SFT, RLHF o DPO. La model card no detalla el volumen de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto autoregresiva como modelo base, sin alineación para instrucciones.
- Comprensión lectora y respuesta a preguntas (evaluado en Race-High, SQuAD v2, C3).
- Razonamiento y conocimiento general (evaluado en 47 benchmarks en ocho dominios).
- Generación de código y matemáticas (dominios incluidos en la evaluación del autor).
- Capacidades multilingües (evaluado en Belebele y CCPM).
- Conocimiento médico (dominio incluido en la evaluación).
- Comprensión de contexto largo (dominio incluido en la evaluación).
- Punto de partida para preentrenamiento continuado, adaptación de dominio y post-entrenamiento.
- No consta soporte nativo de tool calling, function calling ni modo agente, al tratarse de un checkpoint base.

## Casos de uso

- Preentrenamiento continuado: el checkpoint base permite seguir entrenando con datos propios de dominio (legal, médico, financiero) sin partir de cero, aprovechando los 560B parámetros y la eficiencia de los 25B activos por token.
- Adaptación de dominio mediante fine-tuning: útil para equipos que necesitan un modelo especializado en jerga técnica o corporativa y disponen de infraestructura para manejar un MoE de gran escala.
- Investigación en arquitecturas híbridas de atención: la combinación 7:1 de KDA y Gated MLA lo convierte en un banco de pruebas para estudiar el equilibrio entre atención lineal y atención completa en modelos MoE.
- Experimentación en post-entrenamiento: al no incluir SFT ni RLHF, es adecuado para investigar técnicas de alineación (DPO, RLHF, SFT) sobre una base limpia y comparar resultados con el modelo final Ling-3.1-flash.
- Evaluación comparativa de modelos base: sirve como referencia en estudios que comparan modelos MoE de gran escala con distintos ratios de parámetros activos y arquitecturas de atención.
- Destilación: un modelo de 560B con 25B activos puede emplearse como profesor para destilar capacidades hacia modelos más pequeños desplegables en producción.
- Investigación multilingüe: con un vocabulario de 157.184 tokens y evaluación en benchmarks multilingües, permite estudiar el comportamiento de modelos MoE en lenguas distintas del inglés.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (checkpoint base, comparado con DeepSeek-V4-Pro-Base y MiMo-V2.5-Pro-Base). Se muestran los benchmarks disponibles en la información proporcionada:

| Dominio | Benchmark | Config | Ling-3.1-flash-base (560B A25B) | DeepSeek-V4-Pro-Base (1.6T A49B) | MiMo-V2.5-Pro-Base (1.02T A42B) |
|---|---|---|---|---|---|
| Comprensión del lenguaje | Race-High (EM) | 0-shot | **93,88** | 93,37 | 93,60 |
| Comprensión del lenguaje | SQuAD v2 (Acc) | 1-shot | **92,79** | 87,70 | 88,93 |
| Comprensión del lenguaje | Belebele (EM) | 0-shot | **94,67** | 93,83 | 92,72 |
| Comprensión del lenguaje | C3 (EM) | 0-shot | **83,34** | 81,64 | 81,53 |
| Comprensión del lenguaje | CCPM (EM) | 0-shot | 91,88 | **93,31** | 90,18 |

El autor declara evaluaciones en 47 benchmarks repartidos en ocho dominios (comprensión del lenguaje, conocimiento, código, matemáticas, razonamiento, multilingüe, conocimiento médico y contexto largo), pero solo se dispone de los resultados de la tabla anterior. El resto de resultados no está disponible en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,1 TB solo para los pesos (572.120.680.768 parámetros × 2 bytes), más overhead de activaciones y KV cache. Requiere múltiples GPUs de 80 GB (por ejemplo, 16× H100 80 GB como mínimo para los pesos).
- Cuantización: no se han publicado versiones cuantizadas (GGUF, AWQ, GPTQ) en la información disponible. Una hipotética cuantización a 4 bits reduciría los pesos a unos 286 GB, aún fuera del alcance de GPUs de consumo individuales.
- GPUs recomendadas: clústeres de H100 80 GB o A100 80 GB. No cabe en GPUs de consumo (RTX 4090, 24 GB) ni en configuraciones multi-GPU de consumo convencionales.
- Opciones de despliegue: al usar `custom_code` y arquitectura híbrida KDA/MLA, requiere frameworks con soporte específico para la arquitectura. No consta compatibilidad confirmada con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ling-3.1-flash-base | 560B / 25B | MoE híbrida (KDA + Gated MLA) | MIT | Hugging Face |
| DeepSeek-V4-Pro-Base | 1.6T / 49B | MoE | no disponible | no disponible |
| MiMo-V2.5-Pro-Base | 1.02T / 42B | MoE | no disponible | no disponible |

Ling-3.1-flash-base destaca por ofrecer el menor número de parámetros activos (25B) entre los tres modelos comparados, lo que se traduce en menor coste de inferencia por token, y por publicarse bajo licencia MIT. En los benchmarks disponibles iguala o supera a los modelos de mayor escala en cuatro de cinco pruebas de comprensión del lenguaje, y queda por detrás en CCPM. No se dispone de datos de contexto ni de cuantizaciones para los modelos comparados.

## Limitaciones y advertencias

- Es un checkpoint base: no ha pasado por SFT, RLHF ni DPO, por lo que no está alineado para instrucciones y puede generar respuestas incoherentes o inapropiadas en uso conversacional directo.
- Riesgo de alucinación inherente a los modelos de lenguaje sin alineación; especialmente relevante en dominios factuales como medicina o derecho.
- Sesgos potenciales derivados de los datos de preentrenamiento, no documentados en la model card.
- La longitud de contexto no está especificada, lo que impide planificar su uso en tareas de contexto largo sin validación empírica.
- Los idiomas soportados no están documentados explícitamente, aunque la evaluación incluye benchmarks multilingües.
- Requisitos de hardware extremos: más de 1 TB en BF16, inviable fuera de clústeres de GPUs de datacenter.
- La arquitectura con `custom_code` puede requerir versiones específicas de librerías y no ser compatible con herramientas estándar de inferencia sin adaptaciones.
- La licencia MIT permite uso comercial, pero al ser un modelo base, el usuario asume la responsabilidad del post-entrenamiento y de la evaluación de seguridad.
- No se han publicado resultados completos de los 47 benchmarks declarados; solo un subconjunto está disponible.

## Enlaces

- Hugging Face: https://huggingface.co/eyes-ml/Ling-3.1-flash-base
- Modelo final Ling-3.1-flash: https://huggingface.co/inclusionAI/Ling-3.1-flash
- Organización inclusionAI en Hugging Face: https://huggingface.co/inclusionAI
- Organización inclusionAI en ModelScope: https://modelscope.cn/organization/inclusionAI
- Diagrama de arquitectura: https://cdn-uploads.huggingface.co/production/uploads/678143d4ddb1f1ce16daca8e/qwmfVu_K08auI7R_ijbIX.png
