# jacopof/lumina

## Resumen

Lumina 2.75M es un modelo de lenguaje causal autoregresivo de muy pequeno tamano (2.750.976 parametros) desarrollado por jacopof y entrenado integramente desde cero para la lengua italiana. Se distribuye bajo licencia MIT en formato safetensors con un peso de aproximadamente 11 MB, lo que lo situa en la categoria de modelos para edge computing y despliegue en navegador. No reutiliza pesos de modelos preentrenados ni tokenizers preconfigurados: emplea un tokenizer a nivel de byte con un vocabulario de 259 tokens.

El modelo se posiciona explicitamente como una alternativa honesta frente a la tendencia a la alucinacion de los grandes modelos: esta entrenado para responder con precision dentro de un perimetro acotado de conocimiento (definiciones cientificas, conceptos informaticos, astronomia, saludos) y para declarar de forma explicita cuando una pregunta queda fuera de lo que ha aprendido. Su ventana de contexto es de tan solo 165 bytes, lo que limita severamente las conversaciones multi-turno.

Su relevancia actual reside en la demostracion de que es posible entrenar un modelo funcional desde cero con recursos muy limitados (una sola GPU RTX 5060) y desplegarlo con latencia inferior a 0,1 s en CPU o GPU estandar, en cualquier portatil, Raspberry Pi, movil o incluso dentro del navegador mediante JavaScript. Es un ejercicio tecnico y educativo mas que una herramienta de produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only con atencion SDPA |
| Parametros totales | 2.750.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 165 bytes |
| Tipos de cuantizacion | no disponible (el autor solo documenta safetensors nativo) |
| Idiomas soportados | italiano (it) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors), con codigo de modelado propio (modeling_lumina.py) |

## Arquitectura y entrenamiento

Lumina es un transformer causal decoder-only de 6 bloques, con dimension oculta de 192, 6 cabezas de atencion (dimension por cabeza de 32), capa feed-forward de 768 (expansion 4x) y activacion GELU aproximada. Aplica LayerNorm antes de la atencion y antes de la FFN, usa embeddings atados (la matriz de salida comparte pesos con el embedding de entrada) y emplea atencion multi-cabeza causal con mecanismo SDPA. El tokenizer es a nivel de byte puro: 256 bytes UTF-8 mas los tokens especiales BOS (256), EOS (257) y PAD (258), para un total de 259 tokens de vocabulario.

El entrenamiento se realizo desde cero, sin pesos preentrenados, sin APIs externas y con un tokenizer construido por el autor. Se uso el optimizador AdamW con Cosine Annealing, dropout de 0,1 y weight decay de 0,05, sobre una unica GPU RTX 5060. La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; el autor describe el objetivo de entrenamiento como "afinidad y honestidad delimitada", orientado a que el modelo responda con precision en su dominio y rechace honestamente las preguntas fuera de perimetro.

## Capacidades

- Generacion de texto en italiano en dominios acotados: definiciones cientificas, conceptos informaticos basicos, astronomia y saludos.
- Respuesta a preguntas de verificacion libre (probes) con reconocimiento de sinonimos y variaciones de saludo.
- Generalizacion sobre reformulaciones de preguntas conocidas (distinta puntuacion y prefijos).
- Rechazo explicito y honesto ante preguntas fuera de su conocimiento, con la frase "Non lo so: e fuori da cio che ho imparato. Prova una domanda piu semplice."
- Ejecucion en navegador web mediante Web Worker (JavaScript).
- No dispone de soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- Capacidad multilingue practicamente inexistente: solo italiano, y condicionada por el vocabulario a nivel de byte y la ventana de 165 bytes.

## Casos de uso

- Demostracion educativa de entrenamiento de un LLM desde cero: sirve para ilustrar en cursos y talleres el ciclo completo (tokenizer a nivel de byte, arquitectura transformer, entrenamiento en una GPU consumer) con un coste computacional minimo.
- Asistente de FAQ acotado en italiano: puede gestionar preguntas frecuentes de un dominio cerrado (definiciones, conceptos basicos) y declinar las que quedan fuera, lo que reduce el riesgo de respuestas inventadas en atencion al usuario de bajo riesgo.
- Despliegue embebido en dispositivos sin recursos: sus 11 MB permiten ejecutarlo en Raspberry Pi, moviles o microcontroladores con suficiente memoria, con latencia inferior a 0,1 s en CPU estandar.
- Chatbot de navegador sin backend: al ejecutarse en un Web Worker, permite ofrecer un asistente de demostracion completamente local, sin llamadas a servidores y con privacidad por diseno.
- Filtro o clasificador ligero de intenciones en italiano: su capacidad de reconocer el intento del usuario incluso con sinonimos y saludos distintos (85,7% en probes) puede aprovecharse como primera capa de enrutamiento antes de un modelo mayor.
- Prototipado rapido de interfaces conversacionales: permite validar UX de chat y flujos de rechazo honesto sin incurrir en costes de inferencia en la nube.
- Componente de juguete para investigacion sobre alucinacion y calibracion: su comportamiento de rechazo medido (66,7% de reconocimiento fuera de perimetro, 2,9% de falsos rechazos) lo hace util como caso de estudio de calibracion en modelos pequenos.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son evaluaciones internas con greedy decoding sobre cientos de ejemplos de validacion no vistos durante el entrenamiento. No son benchmarks estandar de la comunidad (MMLU, HumanEval, GSM8K) y no hay comparacion con otros modelos.

| Ambito de prueba | Precision sobre datos no vistos | Comportamiento |
|---|---|---|
| Definiciones y conceptos tecnicos | 98,2% | Explica correctamente con frases nuevas |
| Preguntas de verificacion libre (probes) | 85,7% | Reconoce la intencion con sinonimos y saludos distintos |
| Preguntas conocidas con reformulaciones | 79,1% | Generalizacion robusta ante puntuacion y prefijos variados |
| Reconocimiento de hechos fuera de perimetro | 66,7% | Rechaza honestamente en lugar de inventar |
| Falsos rechazos (errores de bloqueo) | 2,9% | Responde casi siempre cuando la pregunta es valida |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en cualquier configuracion; el modelo nativo pesa unos 11 MB en safetensors y los 2,75 M de parametros en FP32 ocupan aproximadamente 11 MB, por lo que cabe holgadamente en cualquier GPU.
- GPU recomendadas: no requiere GPU dedicada; el autor lo entreno en una RTX 5060 y reporta latencia inferior a 0,1 s tanto en GPU como en CPU estandar.
- Cabe en cualquier GPU consumer, incluida la gama mas baja, y en CPU, Raspberry Pi, moviles y navegador web.
- Opciones de despliegue: el repositorio incluye `modeling_lumina.py` (carga via `from_pretrained`) y `generate.py` para linea de comandos; tambien se documenta ejecucion en navegador mediante Web Worker. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el modelo usa un codigo de modelado propio y un tokenizer a nivel de byte no compatible con los pipelines estandar.
- Latencia y throughput: latencia de respuesta inferior a 0,1 s segun el autor; no se publican cifras de throughput (tokens por segundo).

## Comparativa con modelos similares

No se dispone de datos de benchmarks estandar ni de comparaciones publicadas por el autor frente a otros modelos. A continuacion se comparan caracteristicas objetivas con alternativas de la misma categoria (modelos muy pequenos para edge y demostracion); los datos de rendimiento de los alternativos no se incluyen porque no se han proporcionado en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Idiomas |
|---|---|---|---|---|---|
| Lumina 2.75M | 2,75 M | 165 bytes | MIT | safetensors | italiano |
| Modelos tipo TinyLlama / SmolLM (referencia de categoria) | cientos de millones | miles de tokens | variable (MIT/Apache en varios) | safetensors, GGUF | multilingue |
| Modelos de juguete tipo nanoGPT (referencia de categoria) | < 10 M | variable | MIT | safetensors / PyTorch | ingles principalmente |

La comparacion de rendimiento con alternativas concretas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Ventana de contexto de solo 165 bytes, lo que impide conversaciones multi-turno reales y practicamente cualquier prompt de longitud media.
- Conocimiento muy limitado y acotado a un perimetro estrecho; fuera de el, el modelo rechaza o puede producir respuestas incorrectas.
- Riesgo de alucinacion residual: aunque el autor reporta un 66,7% de reconocimiento de preguntas fuera de perimetro, un tercio de estos casos no se detectan correctamente.
- Tokenizer a nivel de byte con vocabulario de 259 tokens: ineficiente en longitud de secuencia y sin compatibilidad con tokenizers estandar, lo que complica la integracion con ecosistemas como Hugging Face Transformers, vLLM o llama.cpp.
- Solo soporta italiano; no hay capacidades multilingues documentadas.
- No dispone de tool calling, agentes, vision ni modo de razonamiento; no es apto para tareas de codigo, matematicas avanzadas ni recuperacion de informacion en tiempo real.
- La licencia MIT permite uso comercial, pero el modelo no esta pensado ni validado para produccion; su uso comercial en tareas criticas no esta respaldado por evaluaciones independientes.
- El numero de descargas (112) y la ausencia de likes indican una adopcion muy baja y escasa validacion por parte de la comunidad.
- No se documentan sesgos especificos ni la composicion del dataset de entrenamiento, lo que impide evaluar sesgos de forma rigurosa.

## Enlaces

- Hugging Face: https://huggingface.co/jacopof/lumina
- Demo en vivo (Hugging Face Space): https://huggingface.co/spaces/jacopof/lumina-chat
- Repositorio alternativo citado en la model card: https://huggingface.co/jacopof/lumina-2.75m
- Licencia MIT: https://opensource.org/licenses/MIT
