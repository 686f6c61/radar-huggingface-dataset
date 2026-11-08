# LTM-Lab/LFM3-1.7B-v9

## Resumen

LFM3-1.7B-v9 es un ajuste fino experimental del modelo LFM3-1.7B de Liquid AI, desarrollado por LTM-Lab. Su particularidad no reside en el backbone, que se mantiene idéntico al original (286 tensores congelados), sino en la incorporación de un mecanismo de memoria externa denominado "Wiener Turing memory" (lfm3_v9). Este sistema escribe cada token en un slot nombrado dentro de una cinta de memoria persistente en disco, lo que permite recuperar información por contenido en episodios posteriores, en instancias distintas del modelo o incluso en procesos separados.

El modelo resuelve un problema clásico de los LLM: la ausencia de memoria persistente más allá de la ventana de contexto. En lugar de ampliar el contexto, añade un experto de memoria que se combina con el experto base mediante reglas bayesianas, con una compuerta de copia que solo activa la recuperación cuando la similitud entre la consulta y la clave almacenada supera un umbral aprendido (τ = 0,883). El backbone subyacente es un transformer tri-híbrido de 1.700 millones de parámetros con 256K tokens de contexto y soporte nativo de tool calling.

Es relevante ahora porque explora una vía poco habitual: memoria episódica persistente y direccionable por contenido sobre un modelo pequeño, entrenada con solo 751.621 parámetros adicionales y 500.025 tokens. Los resultados preliminares del autor muestran mejoras en recuperación de memoria (35/40 frente a 26/40) y en NLL retenido (0,8154 frente a 0,9679), aunque la evaluación es de escala reducida y el rendimiento de inferencia se degrada notablemente por la implementación en Python y las dos pasadas por el backbone en cada forward.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tri-híbrido (LFM3) con experto de memoria externa acoplado (Wiener Turing memory) |
| Parametros totales | 1.729.815.326 (de los cuales 1.013.798 pertenecen a la memoria) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256K tokens en el backbone LFM3-1.7B; ventana de memoria de 16 slots por episodio |
| Tipos de cuantizacion | No disponible (el autor solo documenta bfloat16) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | lfm1.0 (licencia "other" en Hugging Face) |
| Formato de pesos | safetensors, con código personalizado (`modeling_lfm3_v9.py`) |

## Arquitectura y entrenamiento

El backbone es el LFM3-1.7B de Liquid AI, un transformer tri-híbrido con 256K de contexto y tool calling nativo. Sobre él se injerta un experto de memoria en la salida de la primera capa (antes de la primera capa de atención), mediante un sidecar residual. Cada forward ejecuta dos pasadas: una baseline que produce la distribución del experto base (p_B) y el hidden state de direccionamiento, y otra con memoria que genera la distribución del experto de memoria p_M = α·q + (1 − α)·p_N, donde α combina la compuerta de copia, la confianza y una función sigmoide del umbral de similitud. La distribución final mezcla ambos expertos con pesos actualizados por regla de Bayes. La lectura de memoria emplea modos de contenido, forward y backward (encadenamiento temporal estilo DNC) y características de edad Time2Vec.

El entrenamiento congela por completo el backbone y la parte de direccionamiento de la memoria (address, value, Time2Vec, agudeza de contenido, preferencia de modo de lectura, ganancia de sufijo). Solo se entrenan copy_gate, sidecars y target: 751.621 parámetros. Los datos son 900 conversaciones sin tool calling (300 trazas de razonamiento de Claude-opus-4.6, 300 de Claude-opus-4.7 y 300 de LMSYS-Chat-1M limpias), con 500.025 tokens totales y 413.549 supervisados. El objetivo es de memoria entre episodios: se escribe un contexto sin gradiente en una cinta RAM nueva y se calcula la loss en un episodio nuevo, con la mitad del contexto formado por el propio ejemplo y la otra mitad por ejemplos no relacionados. Se usó LlamaFactory con plantilla de chat lfm3, máscara de plantilla, AdamW en bf16 puro con pesos maestros fp32, lr 5e-4, cosine, warmup del 5%, batch 1 con acumulación de 8, 113 pasos y cutoff de 2048, en una única NVIDIA RTX PRO 6000 Blackwell durante 1 hora y 37 minutos.

## Capacidades

- Generación de texto conversacional en chino e inglés, con soporte de modo de razonamiento (`<think>`).
- Memoria episódica persistente: escritura por token en slots nombrados sobre una cinta en disco (SQLite), recuperable por contenido en episodios posteriores, instancias nuevas del modelo o procesos distintos.
- Recuperación por similitud con umbral aprendido: solo copia contenido cuando la clave leída es suficientemente próxima a la consulta, evitando contaminación entre conversaciones.
- Encadenamiento temporal de memorias (forward y backward, estilo DNC) y características de edad Time2Vec.
- Gestión explícita de memoria mediante API: `open_memory_bank()`, `memories()`, `recall()`, `forget()`, `forget_episode()`, `memory_stats()`.
- Modo efímero (solo memoria intra-secuencia, sin escritura en disco) configurable mediante `lifecycle: "ephemeral"`.
- Tool calling nativo heredado del backbone LFM3-1.7B (verificado como parseable en la evaluación del autor).
- Máscara de plantilla para excluir tokens de chat template de la memoria y de la actualización de pesos de los expertos.

## Casos de uso

- Asistentes conversacionales con memoria entre sesiones: el modelo puede recordar datos de usuario escritos en episodios anteriores y recuperarlos en una nueva conversación o tras reiniciar el proceso, gracias a la cinta persistente en SQLite y a la recuperación por contenido.
- Sistemas de agentes con estado a largo plazo: un agente puede almacenar hechos observados (resultados de herramientas, preferencias, códigos) y consultarlos en pasos posteriores sin necesidad de reinyectar todo el historial en el prompt, reduciendo el consumo de contexto.
- Gestión de conocimiento personal o de dominio acotado: registro de entradas tipo "clave: valor" (por ejemplo, códigos de bóveda, identificadores, configuraciones) que se recuperan por nombre y se pueden borrar selectivamente con `forget_episode`.
- Investigación en arquitecturas con memoria externa: el modelo sirve como banco de pruebas reproducible para estudiar recuperación episódica, compuertas de copia y mezcla bayesiana de expertos sobre un backbone congelado.
- Prototipos de atención al cliente multi-turno: la máscara de plantilla y la compuerta de similitud evitan que contenido de conversaciones no relacionadas se filtre en las respuestas, lo que facilita mantener coherencia entre hilos.
- Entornos con requisitos de borrado selectivo: la API permite eliminar memorias concretas o episodios completos, útil en escenarios donde se exige trazabilidad y supresión de datos.
- Experimentos de ajuste fino ligero: al entrenar solo 751.621 parámetros sobre un backbone congelado, es viable reproducir el pipeline con un único GPU de gama alta en menos de dos horas.

## Benchmarks y rendimiento

| Prueba | LFM3-1.7B | Misma arquitectura, antes de entrenar | LFM3-1.7B-v9 |
|---|---|---|---|
| Recuperación de memoria: cinta vacía | — | 0/40 | 0/40 |
| Recuperación de memoria: tras una escritura | — | 26/40 | 35/40 |
| Recuperación de memoria: instancia nueva del modelo | — | 26/40 | 35/40 |
| Tras borrar la mitad: eliminadas / conservadas | — | 0/20 / 15/20 | 0/20 / 17/20 |
| Generación: termina en 384 tokens | 3/6 | 3/6 | 4/6 |
| Generación: sin `<think>` sobrante, repetición consecutiva ≤ 8 | 6/6, 6/6 | 6/6, 6/6 | 6/6, 6/6 |
| Generación: tool call parseable | Sí | Sí | Sí |
| NLL retenido (distribución mezclada) | 0,9701 | 0,9679 | 0,8154 |

Las pruebas de recuperación usan 40 hechos aleatorios que el modelo no puede conocer de antemano, escritos una vez en su propio episodio y consultados después con un prefijo literal idéntico al de la escritura (decodificación greedy de 10 tokens). La prueba de generación usa 6 prompts fijos (preguntas en chino e inglés, traducción, código, información personal en dos turnos y una llamada a herramienta) sobre la misma cinta persistente. El NLL retenido se mide sobre 60 conversaciones no vistas de las mismas fuentes que el entrenamiento (31.310 tokens supervisados).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en bfloat16 (tamaño del repositorio), sin contar el estado de la cinta de memoria ni el overhead de las dos pasadas por el backbone.
- GPU recomendadas: el autor entrenó en una NVIDIA RTX PRO 6000 Blackwell; para inferencia es suficiente una GPU consumer con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070 en adelante) al operar en bf16.
- Cabe en GPU consumer: sí, en bf16 en tarjetas con al menos 8 GB; no se documentan cuantizaciones alternativas.
- Opciones de despliegue: `transformers>=5.19` con `trust_remote_code=True` y `torch`; `flash-attn` es opcional. No se documenta soporte para vLLM, SGLang, llama.cpp, Ollama o TGI en esta variante con memoria, ya que requiere el código personalizado `modeling_lfm3_v9.py`.
- Latencia y throughput: no disponibles de forma numérica. El autor advierte que la lectura y escritura de memoria es una implementación de referencia en Python token a token y que cada forward ejecuta dos pasadas por el backbone, por lo que la velocidad es muy inferior a la del LFM3 original.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Memoria persistente | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-v9 (LTM-Lab) | 1,73B (751.621 entrenados) | 256K (backbone) | Sí, cinta en disco con recuperación por contenido | lfm1.0 | Hugging Face, código personalizado |
| LiquidAI/LFM3-1.7B | 1,7B | 256K | No | lfm1.0 | Hugging Face, vLLM, SGLang, llama.cpp |
| Alternativas de 1-2B con contexto largo | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa más relevante es con el modelo base LiquidAI/LFM3-1.7B, del que hereda arquitectura, contexto y tool calling, y al que añade la capa de memoria. No se dispone de datos de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta variante, por lo que no es posible comparar su rendimiento general con otras familias de modelos del mismo tamaño.

## Limitaciones y advertencias

- Evaluación de escala reducida: 40 hechos, 6 prompts y 60 conversaciones; los resultados solo cubren esos escenarios y no garantizan generalización.
- La recuperación de memoria exige que la consulta coincida literalmente con el prefijo de escritura; paráfrasis o formulaciones distintas no están garantizadas.
- La cinta de memoria solo crece, sin limpieza automática; el uso de disco y RAM aumenta con cada escritura.
- Implementación de referencia en Python token a token y doble pasada por el backbone: latencia y throughput muy inferiores al LFM3 original, no apta para producción de alto rendimiento sin optimización.
- Solo se entrenaron unos 0,5M tokens de componentes de memoria; el backbone y la parte de direccionamiento están congelados y no se adaptan al dominio.
- Idiomas limitados a chino e inglés según la model card; no se documenta soporte para castellano.
- Licencia lfm1.0: es necesario revisar sus términos para uso comercial, ya que se marca como "other" y puede imponer restricciones.
- Riesgo de alucinación inherente al backbone LFM3-1.7B, no mitigado por la capa de memoria; la compuerta de copia reduce la contaminación entre conversaciones, pero no elimina errores de generación.
- Requiere `transformers>=5.19` y `trust_remote_code=True`; la integración con servidores de inferencia estándar (vLLM, SGLang, llama.cpp) no está documentada para esta variante.
- La cinta de memoria está vinculada a los pesos que la escribieron (namespace con huella de pesos); cambiar de pesos implica una cinta nueva y la pérdida de las memorias previas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LTM-Lab/LFM3-1.7B-v9
- Modelo base LiquidAI/LFM3-1.7B: https://huggingface.co/LiquidAI/LFM3-1.7B
- Documentación de LFM3-1.7B en Liquid AI: https://docs.liquid.ai/lfm/models/lfm3-1.7b
