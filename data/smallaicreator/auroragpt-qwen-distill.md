# SmallAICreator/AuroraGPT-Qwen-Distill

## Resumen

AuroraGPT-Qwen-Distill es un modelo de lenguaje conversacional de 707 millones de parámetros desarrollado por UltraLabs, publicado bajo el identificador SmallAICreator/AuroraGPT-Qwen-Distill en HuggingFace. Su propuesta principal es la tesis "posee el comportamiento, alquila los hechos": al ser un modelo pequeño, no puede memorizar el conocimiento mundial en sus pesos, pero puede aprender a comportarse como un asistente capaz y a utilizar herramientas externas (búsqueda web, calculadora, recuperación de URL) para compensar la falta de memoria paramétrica.

El modelo se construye a partir de una base preentrenada llamada AuroraGPT-700M, de estilo Llama, y se afina mediante destilación de comportamiento desde Qwen3-4B-Instruct, usando aproximadamente 9,4 millones de tokens de datos SFT en dos épocas. Incluye soporte de tool calling, un formato de chat propio (no ChatML) y una versión GGUF Q8_0 lista para ejecución en dispositivos móviles o de bajos recursos.

Su relevancia actual reside en ofrecer una alternativa ligera para despliegues en el borde (on-device) que mantiene una experiencia conversacional natural y capacidades de integración con herramientas, a costa de un conocimiento factual limitado que debe suplirse mediante llamadas a APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estilo Llama (hidden size 1536, 27 capas, 12 cabezas de atencion, 2 cabezas KV, vocabulario de 32k tokens) |
| Parametros totales | 707.480.064 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | GGUF Q8_0 (incluido en el repositorio); otros formatos no especificados |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y GGUF |

## Arquitectura y entrenamiento

La arquitectura base es un transformer causal de estilo Llama con 27 capas, dimensiones ocultas de 1536 y 12 cabezas de atencion con 2 cabezas KV (grouped-query attention). El tokenizador usa un vocabulario de 32.000 tokens y la longitud de contexto nativa es de 2048 tokens.

El entrenamiento consiste en una destilacion de comportamiento a partir de Qwen3-4B-Instruct. Sobre la base preentrenada AuroraGPT-700M se aplica un ajuste fino de parametros completos (full-parameter SFT) con aproximadamente 9,4 millones de tokens, mezclando datos generados por el profesor con datos escritos a mano para identidad, seguimiento de instrucciones, tool calling (web_search, calculator, fetch_url), correccion de premisas falsas y manejo de entrada sin sentido. Se entrenan 2 epocas con empaquetado de secuencias (sequence packing). No se menciona el uso de RLHF ni DPO; la destilacion es puramente supervisada.

Una innovacion destacable es el formato de tool calling propio, basado en etiquetas `<tool_call>` y `<tool_response>`, integrado en el template de chat del modelo, lo que permite a aplicaciones cliente (incluidas apps GGUF moviles) mostrar un selector de herramientas.

## Capacidades

- Generacion de texto conversacional con tono natural y calido, destilado de un profesor de 4B parametros.
- Seguimiento de instrucciones con cumplimiento de restricciones de formato (respuestas de una palabra, recuento de elementos, etc.).
- Identidad consistente: el modelo se presenta como AuroraGPT de UltraLabs.
- Tool calling funcional: emite llamadas a herramientas en formato JSON valido (`web_search`, `calculator`, `fetch_url`) y procesa las respuestas devueltas.
- Recuerdo de contexto y nombre del usuario a lo largo de los turnos de la conversacion.
- Correccion de premisas falsas y manejo de entradas sin sentido o gibberish.
- Capacidad multilingue limitada: aunque el modelo esta etiquetado solo para ingles, puede producir respuestas en otros idiomas de forma basica, pero sin garantia de calidad.
- No incluye capacidades de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Atencion al cliente automatizada en entornos de bajos recursos: el modelo puede mantener conversaciones multi-turno con contexto de 2048 tokens y recurrir a una herramienta de busqueda web para resolver dudas factuales sobre productos o servicios, evitando respuestas incorrectas.
- Asistente personal en dispositivos moviles: gracias al GGUF Q8_0 de 753 MB, puede ejecutarse en smartphones con aplicaciones compatibles con llama.cpp, ofreciendo un asistente conversacional con tool calling para consultar el tiempo, hacer calculos o recuperar URLs.
- Prototipado rapido de agentes con tool calling: al ser un modelo pequeno y de licencia permisiva, es adecuado para experimentar con pipelines de agentes que necesiten llamar a funciones externas sin requerir una GPU potente.
- Generacion de respuestas en aplicaciones de chat embedidas en navegador o entornos CPU-only: su tamano reducido permite inferencia en tiempo real en portatiles sin GPU dedicada.
- Educacion e investigacion en destilacion de modelos: sirve como ejemplo practico de como transferir comportamiento de un modelo grande a uno pequeno mediante SFT, y como disenar un sistema de tool calling ligero.
- Despliegue en entornos con restricciones de privacidad: al poder ejecutarse localmente y usar herramientas bajo demanda, permite mantener los datos del usuario en el dispositivo y solo enviar consultas puntuales a APIs externas cuando sea necesario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye mediciones de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. El autor reconoce limitaciones en matematicas y razonamiento, indicando que el modelo "muestra el trabajo pero falla en aritmetica multi-digito". Por tanto, no es posible comparar numericamente su rendimiento con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision FP16, el modelo ocupa aproximadamente 1,4 GB de memoria (707M parametros x 2 bytes). Con cuantizacion Q8_0, el peso es de 753 MB, lo que permite ejecucion en CPU con ~1 GB de RAM libre.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en FP16 (por ejemplo, NVIDIA GTX 1050 Ti, RTX 3050, RTX 4090, A100, H100). En cuantizacion Q8_0, incluso GPUs integradas o iGPUs modernas pueden funcionar.
- Si cabe en GPU de consumo: si, cabe en cualquier GPU consumer moderna, incluso en las mas modestas.
- Opciones de despliegue: transformers (Python), llama.cpp (via GGUF), Ollama (si se importa el GGUF), text-generation-inference (TGI) si se convierte a un formato compatible, y aplicaciones moviles basadas en llama.cpp.
- Latencia y throughput estimados: no disponibles. Al ser un modelo de 700M, se espera una generacion de decenas de tokens por segundo en GPU consumer y de 5-15 tokens por segundo en CPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de una comparativa publicada con modelos de tamano similar. Sin embargo, se puede situar cualitativamente frente a alternativas conocidas:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| AuroraGPT-Qwen-Distill | 707M | 2048 | Apache 2.0 | Destilado de Qwen3-4B, tool calling propio |
| Qwen2.5-0.5B | 494M | 32k | Apache 2.0 | Modelo pequeno de Alibaba, sin tool calling nativo |
| SmolLM2-1.7B | 1.7B | 2048 | Apache 2.0 | Modelo pequeno de HuggingFace, optimizado para dispositivos |

No hay datos de benchmarks que permitan una comparacion objetiva de rendimiento. La eleccion entre estos modelos dependera de las necesidades de tool calling (donde AuroraGPT tiene ventaja por diseno) y de la longitud de contexto (donde Qwen2.5-0.5B ofrece mas).

## Limitaciones y advertencias

- Conocimiento factual limitado: al ser un modelo de 700M, su memoria parametrica es insuficiente para datos de larga cola. En modo "libro cerrado" (sin herramientas), fallara en preguntas de trivia o informacion actualizada.
- Matematicas y razonamiento fragiles: la model card advierte que muestra el procedimiento pero comete errores en aritmetica multi-digito. Se recomienda usar la herramienta de calculadora para cualquier operacion numerica.
- Posible acuerdo con premisas falsas: el autor menciona que ocasionalmente puede aceptar afirmaciones incorrectas del usuario.
- Coherencia limitada en prompts complejos: a escala de 700M, la coherencia puede degradarse en instrucciones largas o ambiguas.
- Idioma: solo se garantiza un buen comportamiento en ingles. Otros idiomas pueden producir respuestas de menor calidad.
- Formato de chat propietario: no usa ChatML, lo que puede requerir adaptaciones en frameworks que esperen el formato estandar.
- Contexto limitado a 2048 tokens: insuficiente para documentos largos o conversaciones muy extensas.
- Sin garantias de seguridad: no se mencionan evaluaciones de sesgos ni de alineacion con valores humanos. Como cualquier modelo generativo, puede producir contenido inapropiado o sesgado.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe asumir la responsabilidad de las salidas generadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SmallAICreator/AuroraGPT-Qwen-Distill
- No se han encontrado otros enlaces oficiales (paper, blog, repositorio de codigo) en la informacion disponible. El sitio "AuroraGPT" de ANL (https://auroragpt.anl.gov/) no esta relacionado con este modelo.
