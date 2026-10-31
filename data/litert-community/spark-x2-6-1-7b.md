# litert-community/Spark-X2.6-1.7B

## Resumen

Spark-X2.6-1.7B es un modelo de lenguaje de razonamiento de 1,71 mil millones de parámetros desarrollado por el SparkLLM Team (XHToken), segundo modelo de la serie Spark-X2.6 tras la versión 4B. Este repositorio concreto es una conversión del modelo original al formato LiteRT-LM (`.litertlm`) de Google, realizada con litert-torch 0.9.3 para LiteRT-LM 0.19.0, y está pensada para ejecución en dispositivos edge: móviles y ordenadores de escritorio sin necesidad de servidores con GPU de datacenter.

El problema que resuelve es doble: por un lado, llevar un modelo de razonamiento compacto (piensa dentro de etiquetas `<think>…</think>` antes de responder) a hardware de consumo; por otro, hacerlo con un runtime optimizado que separa el razonamiento de la respuesta final mediante un canal `thought`, de modo que la salida visible al usuario queda limpia. La arquitectura es un decodificador denso de 28 capas que hereda el diseño de Spark-X2.5-1.7B, con las mejoras de capacidad procedentes del post-training.

Su relevancia actual radica en las cifras de rendimiento publicadas: 27,4 tokens/s en la GPU de un Galaxy S26 con el archivo int4-mlp y 51,4 tokens/s en un iPhone 18 Pro, con una degradación de precisión mínima respecto al modelo bf16 (GSM8K 82 frente a 84). La licencia Apache-2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador denso (transformer), 28 capas, hidden size 2048, 8 cabezas de consulta y 2 de KV de 256 dimensiones |
| Parametros totales | 1,71B |
| Parametros activos | 1,71B (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (capacidad de la caché KV de estos archivos) |
| Tipos de cuantizacion | int8 dinámico por canal (todas las capas lineales y embedding); int4 blockwise-32 con OCTAV en proyecciones gate/up del MLP + int8 en atención, down projection, capa de salida y embedding |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | .litertlm (LiteRT-LM), convertido desde el modelo base XHToken/Spark-X2.6-1.7B |

## Arquitectura y entrenamiento

La arquitectura, heredada de Spark-X2.5-1.7B, combina atención completa con atención de ventana deslizante: por cada capa de atención completa hay tres capas con ventana deslizante de 512 tokens, lo que reduce el coste de la caché KV en contextos largos. Incluye puertas sigmoideas por cabeza en la salida de la atención, MLPs con GELU exacto y gated, y un vocabulario embebido (tied) de 131.072 entradas. El modelo es de razonamiento: genera su proceso de pensamiento dentro de `<think>…</think>` antes de producir la respuesta final, y los archivos de este repositorio declaran un canal `thought` para que LiteRT-LM mantenga el razonamiento separado de la respuesta.

Sobre el entrenamiento del modelo base, la model card indica que mantiene la arquitectura de Spark-X2.5-1.7B y que la mejora de capacidad proviene de un post-training mejorado; no se han publicado detalles sobre el número de tokens de preentrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información disponible. En cuanto a la conversión a LiteRT-LM, ambos archivos declaran activaciones fp32 en GPU y usan las operaciones compuestas de GPU de LiteRT-LM para las escrituras de la caché KV y los productos de atención; los pesos son los de la exportación int8/int4-mlp sin alteraciones. El tokenizer es el `tokenizer.json` original byte a byte, y la plantilla de chat reproduce byte-identicamente la del proveedor (54 renders verificados en transformers y LiteRT-LM 0.19.0).

## Capacidades

- Generacion de texto con razonamiento explícito: el modelo piensa dentro de `<think>…</think>` antes de responder, con niveles de esfuerzo configurables (`reasoning_effort`: `high` por defecto, `low` para pensamientos más cortos, y posibilidad de desactivar el thinking por completo).
- Razonamiento matematico: GSM8K 82/100 (int4-mlp) frente a 84 del modelo bf16 de referencia, evaluado con cadena de pensamiento 0-shot.
- Aritmetica y tareas de conocimiento corto: 8/8 en un conjunto de pruebas de preguntas con respuesta única (aritmética, traducción, comparación decimal, antónimos, etc.).
- Conversaciones multi-turno: verificado en pruebas de 3 turnos (plantar un dato, hacer aritmética, recordar el dato), con y sin filtrado de canales del runtime.
- Soporte de plantilla de chat completa con mensajes de sistema, usuario y asistente, byte-identica a la del proveedor.
- Ejecucion en dispositivo (on-device) en Android, iOS y Mac mediante LiteRT-LM, con backend GPU recomendado.
- No hay informacion disponible sobre tool calling, function calling, capacidades de agente, visión, audio ni soporte multilingüe explícito.

## Casos de uso

- Asistentes offline en movil: gracias al formato `.litertlm` y al runtime LiteRT-LM, el modelo puede ejecutarse íntegramente en la GPU de un teléfono Android o iPhone sin conexión, con 27,4 tokens/s en Galaxy S26, adecuado para apps que no pueden enviar datos a la nube.
- Chatbots con razonamiento privado: el canal `thought` separa el razonamiento de la respuesta, de modo que la app puede mostrar solo la respuesta final mientras el modelo resuelve problemas de aritmética o lógica internamente.
- Resolucion de problemas matematicos en el borde: con GSM8K 82 y una caché KV de 4.096 tokens, sirve para calculadoras conversacionales, tutores de matemáticas o validación de cálculos en apps educativas.
- Asistentes multi-turno con memoria de contexto: las pruebas de 3 turnos demuestran que retiene hechos plantados en turnos anteriores, útil para asistentes de productividad o toma de notas conversacionales.
- Integracion en apps iOS y Android nativas: LiteRT-LM dispone de rueda Python para Android (PyPI) y build nightly para iOS (CLiteRTLM), lo que permite embeber el modelo en aplicaciones móviles con aceleración GPU.
- Prototipado y pruebas en escritorio: en Mac alcanza 151,5 tokens/s en GPU con el archivo int8, lo que permite iterar prompts y plantillas de chat localmente antes de desplegar en móvil.
- Traduccion y tareas linguisticas puntuales: el conjunto de verificación incluye una tarea de traducción resuelta correctamente, aunque sin datos publicados de benchmarks multilingües.

## Benchmarks y rendimiento

GSM8K (primeras 100 preguntas de test, greedy, thinking activado, prompt 0-shot de cadena de pensamiento, 3.584 tokens de salida, Mac GPU con LiteRT-LM 0.19.0):

| Configuracion | GSM8K |
|---|---|
| PyTorch bf16 (referencia) | 84 (14 sin terminar) |
| LiteRT-LM int4-mlp | 82 (21 sin terminar) |
| LiteRT-LM int8 | 80 (14 sin terminar) |

Comparación pregunta por pregunta contra bf16: int4-mlp 77 correctas en ambos, 7 correctas solo en bf16, 5 correctas solo en int4-mlp; int8 78/6/2.

Velocidad de decodificacion (prompt de 1.024 tokens, 256 generados):

| Dispositivo / archivo | Velocidad |
|---|---|
| Galaxy S26 GPU, int4-mlp | 27,4 tok/s |
| Galaxy S26 GPU, int8 | 25,8 tok/s |
| iPhone 18 Pro GPU, int4-mlp | 51,4 tok/s |
| iPhone 18 Pro GPU, int8 | 51,5 tok/s |
| Mac GPU, int8 | 151,5 tok/s |
| Mac GPU, int4-mlp | 147,0 tok/s |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM / memoria estimada: el archivo int4-mlp ocupa 1.706 MB y el int8 1.836 MB en disco; la memoria en ejecución será algo superior por las activaciones y la caché KV (4.096 tokens). No se publica la cifra exacta de RAM en uso.
- Moviles: verificado en Galaxy S26 (GPU y CPU), Pixel 11 Pro (GPU y CPU) e iPhone 18 Pro (GPU y CPU, con el build nightly CLiteRTLM 0.19.0-20261029). No requiere GPU de datacenter.
- Escritorio: verificado en Mac con la API Python de LiteRT-LM 0.19.0, tanto en GPU (151,5 tok/s) como en CPU.
- Cabe en GPUs de consumo sin problema dado el tamaño del archivo (por debajo de 2 GB), aunque no hay mediciones publicadas para GPUs concretas como RTX 4090.
- Despliegue: LiteRT-LM 0.19.0 (CLI `litert-lm run` y API Python `pip install litert-lm==0.19.0`); para iOS, el build nightly CLiteRTLM 0.19.0-20261029. No hay soporte documentado de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Backend recomendado: GPU. En CPU se ha documentado un fallo de runtime (ver Limitaciones).
- Latencia y throughput: 27,4 tok/s (Galaxy S26 GPU, int4-mlp) a 151,5 tok/s (Mac GPU, int8), según las mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Spark-X2.6-1.7B (LiteRT-LM) | 1,71B | Denso, razonamiento | 4.096 (caché KV de los archivos) | .litertlm | Apache-2.0 | 27,4 tok/s en Galaxy S26 GPU; GSM8K 82 (int4-mlp) |
| Spark-X2.6-4B | no disponible | no disponible | no disponible | no disponible | no disponible | Modelo previo de la misma serie, de mayor tamaño; sin datos detallados publicados en la información disponible |
| Spark-X2.5-1.7B | 1,71B | Denso | no disponible | no disponible | no disponible | Arquitectura idéntica; Spark-X2.6-1.7B mejora vía post-training |

No hay datos comparativos de benchmarks publicados contra modelos de otras familias (Qwen, Gemma, etc.) en la información disponible.

## Limitaciones y advertencias

- Contexto limitado: la caché KV de estos archivos contiene 4.096 tokens; en la evaluación de GSM8K con 3.584 tokens de salida, entre 14 y 21 preguntas de 100 no terminaron por falta de espacio, lo que indica que el límite de contexto es una restricción real en tareas de razonamiento largo.
- Problema conocido de runtime en CPU: en uno de los prompts de forma libre probados, el archivo int8 en CPU terminó su respuesta con un `</think>` literal y escribió la respuesta de nuevo. Se recomienda usar el backend GPU.
- Degradacion de precision por cuantizacion: el archivo int4-mlp pierde 2 puntos de GSM8K respecto a bf16 y genera más respuestas sin terminar (21 frente a 14 de 100).
- Sesgos conocidos: no disponible; no se ha publicado ninguna evaluación de sesgos.
- Riesgo de alucinacion: no disponible; no se publican evaluaciones de fidelidad factual.
- Idiomas: no se declara la lista de idiomas soportados; el tokenizer soporta CJK, emoji y rangos Latin-1/Extended-A, pero no hay evaluaciones multilingües publicadas.
- Version del runtime: los archivos solo fueron probados con LiteRT-LM 0.19.0 (y el nightly iOS 0.19.0-20261029); versiones anteriores no se han validado con estos archivos.
- Licencia: Apache-2.0, sin restricciones para uso comercial.
- El repositorio de conversión registra 0 descargas en el momento de la ficha, por lo que el historial de adopción y detección de errores en producción es limitado.

## Enlaces

- Repositorio de la conversion: https://huggingface.co/litert-community/Spark-X2.6-1.7B
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- LiteRT-LM (GitHub): https://github.com/google-ai-edge/LiteRT-LM
