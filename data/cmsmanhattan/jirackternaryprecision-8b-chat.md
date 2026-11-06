# CMSManhattan/JiRackTernaryPrecision-8B-chat

## Resumen

JiRack Ternary Precision 8B es un modelo de lenguaje de 8,08 mil millones de parámetros desarrollado por CMSManhattan (Konstantin Grabko) que emplea pesos ternarios {-1, 0, +1} en todas sus capas lineales, siguiendo el paradigma BitNet b1.58. Se distribuye exclusivamente en formato GGUF para llama.cpp, lo que reduce el peso del fichero a 2,6 GB frente a los 16,2 GB que ocuparía en bf16, permitiendo su ejecución en CPU y en dispositivos de borde como las placas NVIDIA Jetson.

El modelo parte de la inicialización DeepSeek-R1-Distill-Qwen-7B, con la capa FFN ensanchada de 18944 a 20480, y se ha sometido a un proceso de ternarización consciente de cuantización sobre C4 y Wikipedia, seguido de un ajuste fino específico para chat, razonamiento, tool calling y código de robótica. Está diseñado para flujos de agentes, function calling y software de robótica, con un tokenizador Qwen2 ampliado con tokens especiales para llamadas a herramientas y resultados.

Su relevancia actual radica en que combina un tamaño de 8B con un peso de fichero de 2,6 GB y una ventana de contexto ajustada hasta 32.768 tokens, lo que lo sitúa en el espacio de modelos desplegables en hardware de bajo consumo sin renunciar a capacidades de tool calling. La licencia es propietaria (BSL-1.0 con nombre jirack-proprietary), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Qwen2 (layout DeepSeek-R1-Distill), 28 capas, hidden 3584, FFN 20480, 28 cabezas / 4 KV heads (GQA), bias en q/k/v, cabeza de salida separada |
| Parametros totales | 8,08B (196 capas lineales ternarias) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (ajuste fino con secuencias de hasta 32.768) |
| Tipos de cuantizacion | Ternaria 1.58-bit (TQ2_0, TQ1_0); pesos {-1, 0, +1} con escala por tensor y activaciones de 8 bits |
| Idiomas soportados | No disponible |
| Licencia | BSL-1.0 (license_name: jirack-proprietary) |
| Formato de pesos | GGUF (TQ2_0: 2,6 GB; TQ1_0: 2,2 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de 28 capas con atención GQA (28 cabezas de consulta, 4 de clave/valor), hidden de 3584 y FFN de 20480, inicializado desde DeepSeek-R1-Distill-Qwen-7B con la FFN ensanchada. Todas las capas lineales son ternarias: cada peso se calcula como `clamp(round(W / mean|W|), -1, 1) * mean|W|`, con escala por tensor y activaciones de 8 bits, al estilo BitNet b1.58.

El entrenamiento se organizó en tres fases: fase 0, preentrenamiento continuado en bf16 sobre C4; fase 1, ternarización consciente de cuantización sobre C4 con lambda de 0 a 1; fase 2, entrenamiento ternario sobre C4 más Wikipedia. Posteriormente se aplicó un SFT principal en modo ternario (lambda 1) para chat, razonamiento y tool calling, seguido de un SFT específico de robótica con código en Python, C++ y Java, datos de herramientas estilo BFCL y ejemplos donde ninguna de 8-14 herramientas similares encaja. La exportación a GGUF almacena cada peso ternario exactamente como lo computa el modelo y lo empaqueta como TQ2_0 o TQ1_0.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat propia (`chat_template.jinja`).
- Razonamiento y resolución de problemas, heredados del ajuste sobre DeepSeek-R1-Distill.
- Tool calling y function calling con tokens especiales dedicados (`<|tool_call_start|>`, `<|tool_call_end|>`, `<|tool_result_start|>`, `<|tool_result_end|>`).
- Llamadas paralelas a herramientas y seguimiento de resultados de herramientas para respuestas de seguimiento.
- Capacidad de declarar que no se necesita herramienta y de solicitar aclaración cuando falta un argumento.
- Generación de código de robótica en Python, C++ y Java.
- Integración con frameworks de agentes mediante endpoint compatible con OpenAI a través de `jirack_gguf_proxy.py` y `jirack_openai_server.py`.
- Ejecución en CPU con llama.cpp y en GPU Jetson mediante ficheros Q2_0.

## Casos de uso

- Agentes de automatización con tool calling: el modelo emite llamadas estructuradas y procesa resultados de herramientas dentro de la ventana de 32.768 tokens, integrándose en frameworks de agentes mediante la API compatible con OpenAI que expone el proxy.
- Robótica y control de dispositivos: el SFT específico en código Python, C++ y Java permite generar scripts de control, rutinas de percepción y lógica de planificación para plataformas robóticas.
- Despliegue en dispositivos de borde: con 2,6 GB en TQ2_0 cabe en Jetson Orin Nano 8 GB, Orin NX 8/16 GB, AGX Orin y Thor, lo que habilita asistentes locales sin conexión en robots y equipos embebidos.
- Asistente de atención al cliente con herramientas: la capacidad de pedir aclaraciones ante argumentos faltantes (14/15 en la prueba interna) y de rechazar llamadas innecesarias (25/25) lo hace adecuado para flujos donde la precisión de la llamada importa más que la fluidez.
- Orquestación de pipelines con múltiples herramientas: las llamadas paralelas (17/19 en la prueba interna) permiten resolver tareas que requieren consultar varias fuentes o ejecutar varias acciones en un solo turno.
- Prototipado en CPU sin GPU: al ejecutarse con llama.cpp en CPU, sirve para entornos de desarrollo, CI y pruebas de integración donde no hay acelerador disponible.
- Selección entre herramientas similares: los ejemplos de entrenamiento con 8-14 herramientas parecidas y casos sin coincidencia lo orientan a escenarios de enrutamiento con solapamiento de funciones.

## Benchmarks y rendimiento

Prueba interna de tool calling (117 casos, greedy):

| Categoria | Referencia (PyTorch) | GGUF TQ2_0 |
|---|---|---|
| Llamada unica (una herramienta, todos los argumentos) | 37/38 | 37/38 |
| Llamadas paralelas | 17/19 | 17/19 |
| Seguimiento (respuesta a partir de resultado) | 19/20 | 19/20 |
| No se necesita herramienta | 25/25 | 25/25 |
| Aclarar argumento faltante | 13/15 | 14/15 |
| **Total** | **111/117 (94,9%)** | **112/117 (95,7%)** |

BFCL v3 (modelo de referencia, greedy; evalscope 1.14.0 / bfcl-eval 2026.3.23 en modo function-calling; totales ponderados por número de casos, no comparables con la media oficial del leaderboard; no se ejecutaron categorías multi-turno):

| Non-live | N | Precision |
|---|---|---|
| simple | 400 | 82,8% |
| multiple | 200 | 82,5% |
| parallel | 200 | 82,0% |
| parallel_multiple | 200 | 69,0% |
| java | 100 | 48,0% |
| javascript | 50 | 52,0% |
| irrelevance | 240 | 81,7% |
| **Total** | **1.390** | **76,8%** |

| Live (peticiones reales) | N | Precision |
|---|---|---|
| live_simple | 258 | 50,4% |
| live_multiple | 1.053 | 49,8% |
| live_parallel | 16 | 43,8% |
| live_parallel_multiple | 24 | 33,3% |
| live_relevance | 18 | 72,2% |
| live_irrelevance | 882 | 66,2% |
| **Total** | **2.251** | **56,2%** |

El modelo ternario de 16B de la misma familia obtiene 77,4% / 57,8% en los mismos conjuntos, por lo que el 8B queda a 1,6 puntos con la mitad de tamaño y rechaza peticiones irrelevantes con más frecuencia (live_irrelevance 66,2% frente a 61,3%).

## Requisitos de hardware

- VRAM/almacenamiento: 2,6 GB para TQ2_0 y 2,2 GB para TQ1_0; en bf16 el modelo ocuparía 16,2 GB.
- Cabe en GPU consumer: sí, con 2,6 GB de pesos más caché KV; cualquier GPU con 4 GB o más puede alojarlo, aunque el autor lo orienta a CPU y Jetson.
- Jetson (estimación del autor, no medida): Orin Nano 8 GB, Orin NX 8/16 GB, AGX Orin y Thor alojan el 8B en TQ2_0; Orin Nano 4 GB no cabe.
- Para ejecutar en la GPU de Jetson (CUDA) hay que usar el fichero Q2_0 del mismo modelo, ligeramente mayor (en el 36B, 10,71 GB frente a 9,91 GB).
- Despliegue: llama.cpp (`llama-cli`, `llama-server`), con proxy OpenAI-compatible (`jirack_gguf_proxy.py` + `jirack_openai_server.py`) para tool calls.
- Contexto: `llama-server` configurado con `-c 32768` y flag `--special`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BFCL non-live / live | Licencia | Formato |
|---|---|---|---|---|---|
| JiRack Ternary Precision 8B | 8,08B | 32.768 | 76,8% / 56,2% | BSL-1.0 (propietaria) | GGUF ternario |
| JiRack Ternary Precision 16B (misma familia) | 16B | no disponible | 77,4% / 57,8% | BSL-1.0 (propietaria) | GGUF ternario |
| DeepSeek-R1-Distill-Qwen-7B (modelo de inicializacion) | 7B | no disponible | no disponible | no disponible | safetensors, GGUF |

## Limitaciones y advertencias

- Licencia BSL-1.0 con nombre jirack-proprietary: es necesario revisar las condiciones antes de cualquier uso comercial; no es una licencia open source permisiva.
- El modelo se distribuye únicamente en GGUF ternario; no hay pesos en safetensors ni versión bf16 publicada en este repositorio.
- Idiomas soportados no documentados: no hay información sobre cobertura multilingüe más allá del tokenizador Qwen2.
- Los benchmarks BFCL son del modelo de referencia en PyTorch, no del GGUF; los totales están ponderados por número de casos y no son comparables con la media oficial del leaderboard.
- No se ejecutaron las categorías multi-turno de BFCL v3.
- El rendimiento en categorías live es bajo (56,2% global; live_parallel_multiple 33,3%), lo que limita su uso en producción con peticiones reales sin validación adicional.
- El rendimiento en generación de código de herramientas en Java (48,0%) y JavaScript (52,0%) es notablemente inferior al de Python.
- Las estimaciones de compatibilidad con Jetson provienen del tamaño de fichero más caché KV y no se han medido en dispositivos reales.
- Riesgo de alucinación y sesgos: no documentados por el autor.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.
- El proxy de tool calling requiere ejecutar `jirack_openai_server.py` junto a `jirack_gguf_proxy.py`; no es un servidor OpenAI-compatible autónomo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CMSManhattan/JiRackTernaryPrecision-8B-chat
- Demo en HF Spaces: https://huggingface.co/spaces/CMSManhattan/JiRack-8B-Chat
- Modelo base: https://huggingface.co/CMSManhattan/JiRackUltra_7b
