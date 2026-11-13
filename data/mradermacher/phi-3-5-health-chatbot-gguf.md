# mradermacher/Phi-3.5-Health-Chatbot-GGUF

## Resumen

Phi-3.5-Health-Chatbot-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo ankitruler567/Phi-3.5-Health-Chatbot, un ajuste fino del modelo Phi-3.5 de Microsoft orientado a conversaciones sobre tematica sanitaria. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF de modelos de terceros, que en este caso ofrece 12 variantes de cuantizacion estatica (desde Q2_K hasta f16) para facilitar la inferencia en CPU y GPU de gama baja mediante llama.cpp y herramientas compatibles.

El modelo subyacente es un transformer denso de aproximadamente 3.821 millones de parametros (3,8 mil millones), coherente con la familia Phi-3.5-mini, y esta orientado a dialogos conversacionales en ingles sobre salud. No se dispone de informacion publicada sobre el proceso de ajuste fino, el dataset utilizado ni las condiciones de entrenamiento del modelo base original.

La relevancia de esta ficha radica en que permite desplegar un modelo conversacional especializado en salud en hardware modesto: la variante Q4_K_M ocupa 2,5 GB y puede ejecutarse en portatiles sin GPU dedicada, lo que abre la puerta a prototipos de asistentes sanitarios en entornos con recursos limitados. No obstante, la ausencia de licencia declarada, benchmarks y documentacion del ajuste fino obligan a extremar la cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Phi-3.5-mini de Microsoft) |
| Parametros totales | 3.821.079.648 (3,8 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Phi-3.5-mini soporta 128K tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repositorio | 34,1 GB (incluye todas las variantes) |
| Modelo base | ankitruler567/Phi-3.5-Health-Chatbot |
| Cuantizador | mradermacher |
| Compatibilidad de endpoints | endpoints_compatible |
| Fecha de creacion | 2025-03-01 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Phi-3.5 de Microsoft, un transformer denso decoder-only de 3,8 mil millones de parametros. El modelo original Phi-3.5-mini emplea atencion con RoPE, normalizacion RMSNorm y una ventana de contexto de 128K tokens, aunque esta ficha no puede confirmar que el ajuste fino haya preservado dicha ventana. El modelo base ankitruler567/Phi-3.5-Health-Chatbot es un ajuste fino orientado a conversacion sanitaria, presumiblemente mediante fine-tuning supervisado o DPO sobre el checkpoint instruct de Phi-3.5, si bien no se ha publicado documentacion al respecto.

El trabajo de mradermacher consiste en la conversion del checkpoint en safetensors a formato GGUF y su cuantizacion estatica en 12 variantes, sin informacion sobre el numero de tokens de calibracion ni sobre el metodo exacto de cuantizacion (los quants con imatrix estan en un repositorio separado, Phi-3.5-Health-Chatbot-i1-GGUF). No se dispone de datos sobre el dataset de ajuste fino, el volumen de tokens, la composicion del corpus ni la existencia de RLHF o DPO en el modelo subyacente.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en tematica sanitaria segun el nombre y proposito declarado del modelo base.
- Dialogo multi-turno con mantenimiento de contexto (la longitud efectiva depende de la configuracion de inferencia; no confirmada).
- Razonamiento basico y respuesta a preguntas gracias a la herencia de Phi-3.5-mini.
- Capacidad de codigo y matematicas heredada del modelo base, aunque no validada en este ajuste fino.
- Soporte de tool calling / function calling: no confirmado para este ajuste fino concreto.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado de asistentes sanitarios en local: la variante Q4_K_M (2,5 GB) permite desplegar un chatbot conversacional en un portatil sin GPU dedicada mediante llama.cpp u Ollama, ideal para validar flujos de triaje o FAQ sanitarias antes de invertir en infraestructura.
- Educacion para pacientes: el modelo puede generar explicaciones en lenguaje sencillo sobre terminos medicos, siempre que se use con supervision profesional y se advierta de que no sustituye el consejo medico.
- Generacion de borradores de contenido sanitario: redaccion de articulos divulgativos o material de concienciacion en ingles, con revision humana obligatoria por el riesgo de alucinacion en materia de salud.
- Simulacion de conversaciones para formacion: entrenamiento de personal sanitario mediante dialogos simulados con pacientes, aprovechando el ajuste conversacional del modelo base.
- Integracion en pipelines de investigacion: uso como baseline ligero en estudios sobre modelos especializados en dominio sanitario, gracias a su reducido coste computacional.
- Despliegue en entornos con recursos limitados: clinicas rurales o dispositivos edge donde no es viable un modelo de mayor tamano; las variantes Q2_K (1,5 GB) y Q3_K_S (1,8 GB) permiten ejecucion en CPU con 2-4 GB de RAM.
- Chatbot de pre-triaje informativo: primera capa de orientacion al usuario que derive a profesionales cuando detecte sintomas de alarma, con las salvaguardas legales y eticas correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion:
  - Q2_K: ~1,5 GB de pesos, ~2-3 GB de RAM/VRAM totales con contexto moderado.
  - Q4_K_M: ~2,5 GB de pesos, ~3,5-4,5 GB de RAM/VRAM totales.
  - Q8_0: ~4,2 GB de pesos, ~5-6 GB de RAM/VRAM totales.
  - f16: ~7,7 GB de pesos, ~9-10 GB de RAM/VRAM totales.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 2070) para las variantes Q4-Q8; A100/H100 no son necesarias dado el reducido tamano del modelo.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 4 GB o mas de VRAM (Q4_K_M) e incluso en CPU pura.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que requeririan el checkpoint original en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada; en CPU moderna se espera una generacion de pocos tokens por segundo, y en GPU consumer de gama media decenas de tokens por segundo, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Phi-3.5-Health-Chatbot-GGUF (este) | 3,8B | No disponible | No disponible | GGUF | Ajuste fino sanitario, solo ingles |
| Phi-3.5-mini-instruct (Microsoft) | 3,8B | 128K | MIT | Safetensors, GGUF | Modelo base generalista, multilingue |
| Llama-3.2-3B-Instruct (Meta) | 3,2B | 128K | Llama 3.2 Community | Safetensors, GGUF | Generalista, buen soporte de tool calling |
| Qwen2.5-3B-Instruct (Alibaba) | 3,1B | 32K | Apache 2.0 | Safetensors, GGUF | Multilingue, fuerte en codigo y matematicas |

La comparativa se basa en caracteristicas publicas de los modelos alternativos; no se dispone de datos de rendimiento comparativo para este ajuste fino concreto.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; es un bloqueante critico para produccion.
- Riesgo elevado de alucinacion en dominio sanitario: un modelo de 3,8B ajustado sin documentacion puede generar informacion medica incorrecta o peligrosa; nunca debe usarse como sustituto de consejo medico profesional.
- Solo ingles: no soporta castellano ni otros idiomas de forma fiable.
- Sesgos desconocidos: al no documentarse el dataset de ajuste fino, no se pueden evaluar sesgos demograficos, culturales o de otro tipo.
- Contexto no confirmado: no se ha verificado si el ajuste fino preserva la ventana de 128K del modelo base.
- Documentacion inexistente del ajuste fino: se desconoce el volumen de datos, el metodo de entrenamiento y las evaluaciones realizadas por el autor original.
- Modelo de nicho con muy poca traccion: 61 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que los fallos hayan sido reportados y corregidos.
- Cuantizaciones agresivas (Q2_K, Q3_K_S) degradan notablemente la calidad; para uso sanitario se recomienda como minimo Q5_K_M o Q6_K.
- Sin garantias de soporte: el cuantizador es un tercero y el modelo base no tiene mantenimiento documentado.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Phi-3.5-Health-Chatbot-GGUF
- Modelo base: https://huggingface.co/ankitruler567/Phi-3.5-Health-Chatbot
- Quants con imatrix: https://huggingface.co/mradermacher/Phi-3.5-Health-Chatbot-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Phi-3.5-Health-Chatbot-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
