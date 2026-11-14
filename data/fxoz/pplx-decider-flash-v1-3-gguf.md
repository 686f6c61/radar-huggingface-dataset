# fxoz/pplx-decider-flash-v1.3-GGUF

## Resumen

pplx-decider-flash-v1.3 es un modelo de decisión y clasificación desarrollado por Perplexity AI, construido sobre la base de Qwen3.5-4B. A diferencia de un modelo generativo convencional, está diseñado para devolver probabilidades calibradas sobre opciones suministradas, preguntas de sí/no (`noul`) y puntuaciones ordenadas, lo que lo convierte en una pieza especializada para sistemas de enrutamiento, triaje y toma de decisiones automatizada dentro de pipelines de agentes.

La versión aquí documentada es una conversión comunitaria a GGUF realizada por el usuario fxoz, publicada bajo licencia Apache 2.0. Incluye un backbone cuantizado en Q4_K_M con matriz de salida en F16 y un proyector de visión opcional también en F16, pensados para ejecutarse con llama.cpp mediante el endpoint específico `/v1/systemone`. No se trata de una release oficial de Perplexity.

Su relevancia actual reside en que expone una capacidad poco común: clasificación probabilística estructurada con soporte multimodal ligero y contexto configurable, empaquetada en un tamaño de 4.5 GB que cabe en hardware de consumo. No obstante, la compatibilidad está validada únicamente contra una build concreta de llama.cpp, lo que limita su adopción directa en producción sin verificación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención completa no causal y atención lineal causal (basado en Qwen3.5-4B) |
| Parametros totales | 4.841.450.496 (aproximadamente 4,84 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens por defecto, configurable mediante `-c`, `-b` y `-ub`; el prompt completo debe caber en un único batch físico |
| Tipos de cuantizacion | Q4_K_M calibrado (mayoría Q4_K, tensores selectos Q6_K, matriz de salida en F16); media de almacenamiento de pesos de aproximadamente 6,29 bits por peso; también disponible en F16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (backbone `pplx-decider-flash-v1.3-Q4_K_M.gguf` de 3,55 GiB y proyector de visión `mmproj-pplx-decider-flash-v1.3-F16.gguf` de 0,63 GiB) |

## Arquitectura y entrenamiento

El modelo base es pplx-decider-flash-v1.3 de Perplexity AI, derivado de Qwen3.5-4B. La arquitectura combina atención completa no causal con atención lineal causal, un esquema híbrido poco habitual que permite evaluar el prompt completo de forma bidireccional en las capas de atención completa mientras mantiene el comportamiento causal en las lineales. Esta decisión de diseño está orientada a tareas de clasificación y decisión, donde la independencia entre preguntas y la evaluación global del estado de entrada son críticas.

La cabeza de decisión nativa tiene 255 filas y se expande a las filas correspondientes del vocabulario, con ceros en el resto; esa matriz expandida se mantiene en F16 para preservar la calibración de probabilidades. La conversión comunitaria no aporta datos sobre el entrenamiento original: no se especifican tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO. El proceso de cuantización sí está documentado: Q4_K_M calibrado con selección de tensores en Q6_K y verificación contra el runtime oficial cargado en FP32 sobre CPU, con pruebas sintéticas de humo (no benchmarks representativos).

## Capacidades

- Clasificación por elección múltiple: devuelve probabilidades sobre entre 1 y 255 opciones suministradas.
- Preguntas booleanas (`noul`): devuelve P(verdadero) para consultas de sí/no.
- Puntuación ordenada: admite entre 2 y 10 niveles de puntuación.
- Procesamiento multimodal: soporta entrada de imágenes mediante el proyector F16 opcional (texto funciona sin él).
- Manejo de estado estructurado: acepta JSON como estado de entrada, con escape de tokens especiales y soporte Unicode.
- Multi-pregunta en una sola petición: varias preguntas evaluadas de forma independiente sobre el mismo estado.
- Independencia del orden de preguntas (verificada en las pruebas del autor).
- Estabilidad en llamadas repetidas (verificada).
- No soporta el adaptador de extracción de spans Locate.
- No soporta el modo `isolated`; solo el modo `separate` del runtime de origen.
- No es un modelo conversacional ni de generación libre: no debe usarse con endpoints de chat-completions.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el estado del ticket y un conjunto de criterios (facturación, soporte técnico, ventas) y devuelve la probabilidad de cada equipo, permitiendo umbrales de derivación automática y escalado a revisión humana cuando la confianza es baja. El ejemplo de la model card ilustra exactamente este escenario con un error 401 tras rotar una API key.
- Triaje de alertas en observabilidad: dado un estado con logs o metadatos de incidencia, clasificar severidad en niveles ordenados (2 a 10) para priorizar la cola de on-call, aprovechando la puntuación ordenada nativa.
- Moderación y filtrado binario: usar `noul` para decidir si un contenido cumple una política concreta, con la probabilidad devuelta como señal calibrada para ajustar el umbral según la carga operativa.
- Decisión en pipelines de agentes: insertar el modelo como nodo de decisión multi-paso que elige la siguiente herramienta o rama del flujo entre un conjunto acotado de opciones, sustituyendo a un LLM generativo en pasos donde solo se necesita selección.
- Clasificación de imágenes en flujos documentales: con el proyector F16, evaluar una imagen junto a preguntas de elección (por ejemplo, tipo de documento o presencia de un sello), aunque la validación publicada se limita a una imagen sintética de dos colores y no mide calidad visual general.
- Enrutamiento de consultas en atención al cliente: combinar estado textual multi-turno con preguntas de elección para derivar a billing, support o sales, con la ventaja de que varias preguntas se evalúan de forma independiente en una sola petición.
- Evaluación de conformidad en CI/CD: clasificar artefactos o metadatos de build contra criterios predefinidos antes de promover un despliegue, siempre que el prompt quepa en el batch configurado (4096 tokens por defecto).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card incluye únicamente pruebas sintéticas de humo comparadas con el runtime oficial en FP32 sobre CPU:

| Configuracion | Coincidencia en respuesta principal | Error absoluto medio de probabilidad por opción | Error absoluto máximo |
|---|---:|---:|---:|
| F16 GGUF, Vulkan, texto | 27/27 | 0,000666 | 0,006094 |
| Q4_K_M calibrado, Vulkan, texto | 27/27 | 0,003715 | 0,064618 |
| Q4_K_M calibrado, Vulkan, imágenes | 2/2 | 0,000056 | 0,000159 |
| Q4_K_M calibrado, CPU, texto | 26/27 | 0,003780 | 0,059516 |

El desacuerdo en CPU corresponde a un resultado `noul` cercano al límite (0,4670 en la referencia frente a 0,5265 en CPU). Las pruebas de texto cubren peticiones multi-pregunta, elecciones, puntuaciones, `noul`, Unicode, estado JSON, escape de tokens especiales, espacios finales y una petición de 40 opciones. La prueba de imagen usa una única imagen sintética de dos colores con dos preguntas y no mide calidad visual general.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone Q4_K_M ocupa 3,55 GiB y el proyector de visión 0,63 GiB; con overhead de contexto y caché KV, un presupuesto de 5 a 6 GB de VRAM es razonable para texto, y en torno a 6 a 7 GB con visión.
- GPU recomendadas: el autor valida sobre una AMD RX 6750 XT con backend Vulkan; por tamaño, cabe en GPUs consumer de 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RX 6700 XT en adelante). Para mayor throughput, A100 o H100 son sobredimensionadas para este tamaño pero válidas en despliegues multiusuario.
- Cabe en GPU consumer: sí, con 8 GB de VRAM o más para la variante Q4_K_M con visión; solo texto requiere menos.
- Opciones de despliegue: llama.cpp mediante `llama-server` con el endpoint `/v1/systemone`, usando la build 0.9.0-dev (build 12182, commit `fd27b2034`) como runtime probado. Se incluyen lanzadores `run_server.py` (Python 3.10+, sin dependencias de terceros) y `start-decider.ps1` para Windows. No hay compatibilidad verificada con Ollama, LM Studio ni interfaces GGUF de chat genéricas, ni con vLLM o TGI.
- Latencia y throughput estimados: no disponibles. El autor solo reporta ejecución en Windows x86-64 con Vulkan y CPU (Ryzen 5 5600X); Linux y macOS no han sido probados.

## Comparativa con modelos similares

La categoría es específica (modelos de decisión y clasificación probabilística con salida estructurada), por lo que las alternativas directas son escasas. Se compara con el modelo base y con aproximaciones genéricas:

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pplx-decider-flash-v1.3-GGUF (este) | 4,84 mil millones | 4096 configurable | Clasificación probabilística con cabeza de decisión de 255 filas y visión opcional | Apache 2.0 | GGUF para llama.cpp |
| perplexity-ai/pplx-decider-flash-v1.3 (base) | 4,84 mil millones | No disponible | Modelo original en safetensors, runtime oficial | Apache 2.0 | Hugging Face, pesos completos |
| LLM generativo pequeño con salida JSON (por ejemplo, Qwen3.5-4B) | ~4 mil millones | Mayor que 4096 en configuraciones típicas | Generación libre con formato forzado; probabilidades no calibradas de forma nativa | Variable según modelo | Amplia (GGUF, safetensors, vLLM, Ollama) |

La ventaja del modelo frente a un LLM generativo con salida JSON es la calibración de probabilidades y la independencia garantizada entre preguntas; la desventaja es la rigidez del endpoint y la falta de compatibilidad verificada con el ecosistema estándar.

## Limitaciones y advertencias

- No es un modelo conversacional: usar endpoints de chat-completions produce resultados incorrectos; debe emplearse `/v1/systemone`.
- La cuantización y la aritmética del backend alteran decisiones cercanas y la calibración de probabilidades; es imprescindible evaluar umbrales sobre la carga de trabajo propia antes de desplegar.
- El contexto por defecto es de 4096 tokens y el prompt completo debe caber en un único batch físico; entradas más largas no están soportadas sin reconfigurar `-c`, `-b` y `-ub` conjuntamente.
- Es obligatorio mantener `-np 1`; con más slots el runtime intenta compartición de prefijo causal, incompatible con la evaluación independiente de preguntas.
- El modo `isolated` no está soportado y el adaptador Locate de extracción de spans tampoco; el cliente Python rechaza peticiones Locate.
- Solo se valida una build concreta de llama.cpp (0.9.0-dev, commit `fd27b2034`) en Windows x86-64; Linux y macOS no han sido probados y no hay garantía con Ollama, LM Studio u otras interfaces.
- La validación publicada son pruebas sintéticas de humo, no un benchmark representativo de precisión; la calidad visual general no está medida.
- No hay información sobre sesgos, riesgo de alucinación (limitado por el formato de salida restringido, pero no nulo en la interpretación del estado), idiomas soportados ni composición del dataset de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero al ser una conversión no oficial de un modelo de Perplexity, conviene verificar los términos del modelo base antes de un despliegue en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/fxoz/pplx-decider-flash-v1.3-GGUF
- Modelo base: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.3
- Perfil del autor de la conversión: https://huggingface.co/fxoz
- llama.cpp (runtime requerido): no se proporciona enlace en la información disponible
- Paper, blog o demo oficial: no disponible
