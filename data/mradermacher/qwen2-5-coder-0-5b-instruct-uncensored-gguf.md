# mradermacher/Qwen2.5-Coder-0.5B-Instruct-Uncensored-GGUF

## Resumen

Qwen2.5-Coder-0.5B-Instruct-Uncensored-GGUF es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo SelfCode/Qwen2.5-Coder-0.5B-Instruct-Uncensored, una variante "abliterated" (sin censura) del modelo de codigo Qwen2.5-Coder-0.5B-Instruct de Alibaba. El modelo original pertenece a la familia Qwen2.5-Coder, disenada especificamente para tareas de generacion de codigo, y esta variante elimina los mecanismos de rechazo del modelo base mediante tecnicas de abliteration/decensoring. El resultado es un modelo conversacional de codigo que responde sin filtros de contenido.

Con solo 494 millones de parametros, este modelo esta pensado para entornos con recursos muy limitados: ejecucion en CPU, dispositivos edge, navegadores o GPUs de gama baja. Las cuantizaciones GGUF de mradermacher permiten desplegarlo desde 0,4 GB (Q2_K/Q3_K_S) hasta 1,1 GB (f16), lo que lo hace accesible en practicamente cualquier hardware. La licencia Apache 2.0 heredada del modelo base facilita su uso comercial.

Es relevante para quienes necesitan un asistente de codigo ligero, sin restricciones de contenido y con despliegue local trivial mediante llama.cpp u Ollama. No obstante, su tamano implica capacidades de razonamiento y generacion de codigo muy limitadas en comparacion con modelos de mayor escala, y la naturaleza "uncensored" conlleva riesgos de seguridad que deben gestionarse en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-Coder-0.5B-Instruct) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder-0.5B-Instruct soporta 32.768 tokens, dato no confirmado para esta variante) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en transformers usa safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-0.5B-Instruct: un transformer decoder-only con atencion por causalidad, disenado por Alibaba para tareas de codigo. El modelo original fue entrenado por Qwen con un corpus orientado a programacion y posteriormente ajustado con instrucciones y preferencias (RLHF/DPO) para comportamiento conversacional. Sobre esa base, SelfCode aplico tecnicas de abliteration (abliterated/decensored/heretic) para eliminar las direcciones de rechazo en el espacio de activaciones, produciendo una variante que no se niega a responder peticiones.

mradermacher se limita a convertir y cuantizar esos pesos a formato GGUF, sin reentrenamiento adicional. Las cuantizaciones son estaticas (no hay versiones con imatrix/weighted disponibles segun la model card). No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni los detalles del proceso de abliteration en la informacion proporcionada.

## Capacidades

- Generacion de texto y codigo en ingles: autocompletado, explicacion de fragmentos y generacion de funciones simples.
- Conversacion multi-turno en formato chat (tags `chat`, `conversational`).
- Asistencia basica de programacion: snippets, correccion de errores sintacticos y traduccion entre lenguajes sencillos.
- Respuestas sin filtros de contenido (variante uncensored/abliterated), incluyendo temas que el modelo base rechazaria.
- Despliegue local ligero: compatible con llama.cpp, Ollama y otros runners GGUF.
- Capacidades multilingues: limitadas al ingles segun los metadatos (`language: en`).
- No se ha confirmado soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Autocompletado de codigo en editores ligeros: con 494 M de parametros y cuantizaciones de 0,4-0,6 GB, puede ejecutarse en segundo plano en portatiles sin GPU y ofrecer sugerencias de linea o bloque en tiempo real.
- Asistente de codigo en entornos edge o air-gapped: al ser un GGUF pequeno, se despliega en dispositivos sin conexion (Raspberry Pi, mini-PC, contenedores) donde no es viable un modelo mayor, cubriendo tareas de generacion de snippets en ingles.
- Educacion y prototipado de pipelines LLM: sirve como modelo de pruebas para validar integraciones con llama.cpp, Ollama o servidores compatibles con la API de OpenAI antes de escalar a modelos mayores.
- Generacion de scripts utilitarios: para tareas repetitivas de shell, Python o JavaScript de baja complejidad donde la latencia y el coste importan mas que la precision maxima.
- Experimentacion con modelos abliterated: util para investigadores que estudian el efecto de la eliminacion de rechazos en modelos pequenos y su impacto en calidad y seguridad.
- Chatbot de soporte tecnico basico sin restricciones tematicas: en entornos controlados donde se requiere que el modelo no bloquee consultas sobre seguridad, pentesting o analisis de codigo malicioso con fines defensivos.
- Filtrado y clasificacion de fragmentos de codigo: por su tamano, puede procesar grandes volumenes de texto tecnico en batch con coste minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1,5 GB segun cuantizacion (Q2_K ~0,4 GB, Q4_K_M ~0,5 GB, Q8_0 ~0,6 GB, f16 ~1,1 GB), mas overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tambien funciona en CPU. No requiere A100, H100 ni RTX 4090.
- Cabe en GPU consumer: si, en practicamente todas (GTX 1050, RTX 2060, RTX 3060, RTX 4090, integradas con suficiente memoria compartida).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con GGUF; el modelo base en transformers puede servirse con vLLM o TGI si se convierte a safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por tamano, se espera inferencia en decenas de tokens por segundo incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/Qwen2.5-Coder-0.5B-Instruct-Uncensored-GGUF | 494 M | no disponible | Apache 2.0 | GGUF | Variante sin censura, solo ingles |
| Qwen/Qwen2.5-Coder-0.5B-Instruct-GGUF | 494 M | 32.768 (modelo base) | Apache 2.0 | GGUF | Version oficial con filtros de seguridad |
| mradermacher/Qwen2.5-Coder-7B-Instruct-abliterated-GGUF | ~7.600 M | no disponible | Apache 2.0 | GGUF | Misma familia, sin censura, mucho mayor capacidad y requisitos |

La diferencia principal frente a la version oficial de Qwen radica en la ausencia de mecanismos de rechazo y en la disponibilidad de cuantizaciones estaticas adicionales. Frente a la variante de 7B abliterated, este modelo sacrifica calidad por un consumo de recursos drasticamente menor.

## Limitaciones y advertencias

- La abliteration puede degradar la coherencia, la calidad del codigo y la adherencia a instrucciones en comparacion con el modelo base.
- Riesgo elevado de alucinacion: con 494 M de parametros, el modelo tiende a inventar APIs, funciones y sintaxis inexistentes, especialmente en lenguajes poco representados.
- Idiomas: solo se declara ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Ausencia de filtros de seguridad: puede generar contenido danino, codigo malicioso o instrucciones peligrosas. No apto para exposicion directa a usuarios finales sin moderacion externa.
- Contexto: no se confirma la longitud soportada en esta variante; asumir ventanas cortas en la practica.
- Licencia Apache 2.0 permite uso comercial, pero el autor de la variante uncensored no ofrece garantias sobre el comportamiento del modelo.
- No se han publicado evaluaciones de sesgo, toxicidad ni robustez para esta variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/Qwen2.5-Coder-0.5B-Instruct-Uncensored-GGUF
- Modelo base (SelfCode): https://huggingface.co/SelfCode/Qwen2.5-Coder-0.5B-Instruct-Uncensored
- Modelo original Qwen2.5-Coder-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Version oficial GGUF de Qwen: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen2.5-Coder-0.5B-Instruct-Uncensored-GGUF
- Variante abliterated de 7B del mismo autor: https://huggingface.co/mradermacher/Qwen2.5-Coder-7B-Instruct-abliterated-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
