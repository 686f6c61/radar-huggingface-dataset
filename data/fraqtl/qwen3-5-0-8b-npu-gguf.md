# fraQtl/Qwen3.5-0.8B-NPU-GGUF

## Resumen

Qwen3.5-0.8B-NPU-GGUF es una cuantización Q4_0 del modelo Qwen/Qwen3.5-0.8B, publicada por el usuario fraQtl y optimizada específicamente para ejecutarse en la NPU Hexagon de los SoC Snapdragon (Qualcomm) mediante el backend Hexagon de llama.cpp. Se trata, por tanto, de una distribución de pesos ya cuantizados, no de un modelo nuevo entrenado desde cero: el trabajo del autor se centra en mejorar la calidad de la cuantización respecto a otras alternativas populares.

El problema que aborda es la pérdida de capacidad de tool calling que sufre el modelo base al comprimirse a 4 bits. Según la model card, esta versión obtiene 1.367 puntos en el benchmark oficial BFCL v4 live (2.251 prompts) frente a 1.250 de la cuantización de unsloth y 1.457 del modelo original en bf16, con 91 llamadas a herramientas correctas adicionales y un 40 % menos de respuestas correctas del original que se rompen (201 frente a 336).

Es relevante ahora porque demuestra que es posible mantener buena parte de la competencia en function calling de un modelo de menos de 1.000 millones de parámetros en un fichero de apenas 507 MB, ejecutable en un teléfono móvil con aceleración NPU. El modelo base es un transformer denso de 752.393.024 parámetros, bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.5-0.8B); pesos GGUF para llama.cpp |
| Parametros totales | 752.393.024 (modelo base, safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (único fichero publicado), con tipos por tensor fijados al mapa de unsloth |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Qwen3.5-0.8B-fraQtl-NPU-Q4_0.gguf, 507.154.336 bytes) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.5-0.8B, un transformer denso de 752 millones de parámetros desarrollado por el equipo Qwen. Esta ficha no dispone de información sobre la composición del dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas de RLHF o DPO en el modelo base; esos datos no aparecen en la información proporcionada.

La innovación de esta publicación está en el proceso de cuantización, no en el entrenamiento. El autor aplica tres pasos: (1) redondeo GPTQ ponderado por la Hessiana (Frantar et al., 2022) en lugar de round-to-nearest, usando una importance matrix calibrada con conversaciones de chat y de uso de herramientas renderizadas con la plantilla de chat propia de Qwen; (2) fijación de todos los tensores al mapa de tipos Q4_0 de unsloth, todos soportados por Hexagon; y (3) una corrección de escalas hacia el modelo original, plegada en las escalas almacenadas sin aumentar el tamaño ni cambiar los tipos. El resultado ocupa 352 bytes menos que el fichero equivalente de unsloth.

## Capacidades

- Generación de texto conversacional, con soporte de plantilla de chat de Qwen.
- Tool calling / function calling: es la capacidad central evaluada, con puntuación en BFCL v4 live en llamadas simples, múltiples, paralelas y paralelas múltiples.
- Discriminación de irrelevancia: sabe cuándo no debe invocar una herramienta (596 puntos en el subconjunto de irrelevancia según la tabla de la model card).
- Razonamiento y matemáticas: evaluado en MMLU-Pro (12.032 ítems) y GSM8K, sin diferencias significativas frente a la cuantización de unsloth.
- Seguimiento de instrucciones: evaluado en IFEval.
- Generación de código: evaluado en EvalPlus.
- Modo thinking: las evaluaciones se realizaron con thinking desactivado; no se documenta el comportamiento con thinking activado.
- Modelo solo de texto: no incluye visión ni audio.
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Asistentes de voz o chat en dispositivos móviles con Snapdragon: el fichero de 507 MB y ~348 MB de memoria pico permite ejecutar el modelo en la NPU Hexagon de un teléfono con 80 tok/s de decodificación y 4.521 tok/s de prefill (pp512), habilitando respuestas casi instantáneas sin conexión.
- Agentes de tool calling en el borde: con 760 llamadas correctas en BFCL v4 live, el modelo puede orquestar funciones locales (calendario, contactos, ajustes del sistema) en aplicaciones Android sin enviar datos a la nube.
- Automatización de tareas de sistema en movilidad: integrado mediante llama.cpp con el backend Hexagon, puede clasificar intenciones y decidir si invocar una API del dispositivo o responder directamente, gracias a su capacidad de juzgar irrelevancia.
- Prototipado rápido de pipelines de agentes en portátiles sin GPU: al ser un GGUF Q4_0 estándar, se ejecuta también en CPU/GPU con llama.cpp, Ollama o vLLM (este último con soporte GGUF), lo que permite desarrollar y depurar la lógica de herramientas antes de desplegar en el dispositivo.
- Enrutamiento y clasificación de consultas en producción de bajo coste: con 752 M de parámetros y una huella de ~350 MB, es viable desplegar muchas instancias en paralelo para tareas de triaje, extracción de intención o selección de herramienta previa a un modelo mayor.
- Evaluación comparativa de cuantizaciones: sirve como referencia reproducible para medir el impacto de distintas técnicas de cuantización sobre tool calling, ya que el autor publica metodología, hashes sha256 y resultados emparejados con intervalos de confianza.
- Filtrado y validación de argumentos en llamadas a funciones: el modelo puede generar y comprobar los parámetros de una llamada antes de ejecutarla, reduciendo errores en integraciones con APIs externas.

## Benchmarks y rendimiento

Resultados de la model card en BFCL v4 live (2.251 prompts, greedy, thinking off):

| Modelo / fichero | Bytes | Total | Llamadas correctas | Sabe no llamar | Respuestas del original rotas |
|---|---|---|---|---|---|
| Original bf16 (Qwen/Qwen3.5-0.8B) | no disponible | 1.457 | 769 | 676 | — |
| unsloth Q4_0 | 507.154.688 | 1.250 | 669 | 574 | 336 |
| bartowski Q4_0 | 537.517.152 | 1.193 | 738 | 442 | 395 |
| fraQtl NPU Q4_0 (este repo) | 507.154.336 | 1.367 | 760 | 596 | 201 |

Diferencias emparejadas frente a unsloth Q4_0 (límite inferior unilateral al 95 % entre corchetes): total +117 [+82,1], llamadas +91 [+63,9], rechazos +22 [+0,3]. El autor advierte que el límite de rechazos es estrecho y que, sobre la mitad par de los prompts (1.126), el límite inferior de rechazos (−11,1) no supera la guarda del −2 %.

Rendimiento en dispositivo (Snapdragon 8 Elite Gen 6, SM8975, backend Hexagon de llama.cpp, media de dos ejecuciones):

| Fichero | Decodificación tok/s (tg128) | Prefill tok/s (pp512) | Operaciones rechazadas por la NPU |
|---|---|---|---|
| unsloth Q4_0 | 79,5 | 4.416 | 0 |
| bartowski Q4_0 | 81,6 | 4.365 | 0 |
| fraQtl NPU Q4_0 | 80,0 | 4.521 | 0 |

La dispersión entre ejecuciones es de hasta ±3,9 tok/s en decodificación, por lo que los tres ficheros decodifican a la misma velocidad. Memoria pico igual en los tres: ≈348 MB.

En precisión (MMLU-Pro 12.032, GSM8K, IFEval, EvalPlus, thinking off) no hay diferencias significativas frente a unsloth Q4_0. En MMLU-Pro, las respuestas que cambian respecto al original son 4.584 frente a 6.777 de unsloth Q4_0 (excluyendo ítems sin respuesta), y las respuestas correctas del original que se rompen son 793 frente a 1.149.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: ≈348 MB de memoria pico medida en dispositivo con el fichero Q4_0 de 507 MB.
- GPU recomendadas: no se especifican; el fichero está pensado para la NPU Hexagon de Snapdragon (backend Hexagon de llama.cpp). También funciona en CPU y GPU convencionales.
- Cabe en GPU de consumo: sí, por tamaño (menos de 1 GB), en cualquier GPU con al menos ~1 GB de memoria libre; no se han publicado mediciones específicas en RTX 4090, A100 o H100.
- Despliegue: llama.cpp con backend Hexagon (objetivo principal); al ser GGUF estándar, también es compatible con llama.cpp en CPU/GPU, Ollama y otros runners GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia de Hugging Face.
- Latencia y throughput: 80,0 tok/s de decodificación (tg128) y 4.521 tok/s de prefill (pp512) en Snapdragon 8 Elite Gen 6, con dispersión de ±3,9 tok/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BFCL v4 live (total) | Licencia | Formato |
|---|---|---|---|---|---|
| fraQtl Qwen3.5-0.8B-NPU-GGUF (Q4_0) | 752 M | no disponible | 1.367 | Apache 2.0 | GGUF |
| unsloth Qwen3.5-0.8B-GGUF (Q4_0) | 752 M | no disponible | 1.250 | Apache 2.0 (heredada) | GGUF |
| bartowski Qwen3.5-0.8B Q4_0 | 752 M | no disponible | 1.193 | Apache 2.0 (heredada) | GGUF |
| Qwen/Qwen3.5-0.8B (bf16) | 752 M | no disponible | 1.457 | Apache 2.0 | safetensors |

Los cuatro comparten el mismo modelo base; la comparación mide exclusivamente el efecto de la cuantización sobre la competencia en tool calling.

## Limitaciones y advertencias

- Solo texto: no soporta visión, audio ni otras modalidades.
- Contexto: la longitud de contexto del modelo base no se documenta en la información disponible; conviene verificarla antes de usarlo en conversaciones largas.
- Idiomas: no se documenta la cobertura lingüística; el calibrado de la importance matrix se hizo con conversaciones renderizadas con la plantilla de chat de Qwen, sin detalle de idiomas.
- Alucinación: no se han publicado evaluaciones específicas de tasa de alucinación; como todo modelo de 0,8 B, el riesgo en dominios abiertos es alto.
- Sesgos: no se documentan análisis de sesgo.
- Tool calling: la mejora frente a unsloth es significativa en el total y en llamadas, pero el intervalo de confianza de los rechazos es estrecho y falla la guarda del −2 % en la mitad par de los prompts; no debe asumirse una mejora robusta en la detección de irrelevancia.
- Licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.5-0.8B; conviene revisar la licencia y la política de uso aceptable del modelo original.
- Producción: el autor limita el alcance a una única compilación del fichero, BFCL v4 live y pruebas de precisión; el rendimiento medido corresponde a un dispositivo concreto (Snapdragon 8 Elite Gen 6) y puede variar en otros SoC.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay validación comunitaria independiente de los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/fraQtl/Qwen3.5-0.8B-NPU-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuantización de referencia unsloth: https://huggingface.co/unsloth/Qwen3.5-0.8B-GGUF
- Paper de GPTQ (Frantar et al., 2022): https://arxiv.org/abs/2210.17323
- llama.cpp (formato GGUF y backend Hexagon): https://github.com/ggml-org/llama.cpp
- BFCL (Berkeley Function Calling Leaderboard): https://gorilla.cs.berkeley.edu/leaderboard.html
- Imagen del repositorio: https://huggingface.co/fraQtl/Qwen3.5-0.8B-NPU-GGUF/resolve/main/Qwen3.5-0.8B-NPU-GGUF.png
