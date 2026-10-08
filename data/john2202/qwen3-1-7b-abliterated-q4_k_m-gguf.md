# John2202/Qwen3-1.7B-abliterated-Q4_K_M-GGUF

## Resumen

John2202/Qwen3-1.7B-abliterated-Q4_K_M-GGUF es una cuantización en formato GGUF (concretizado en Q4_K_M) del modelo mlabonne/Qwen3-1.7B-abliterated, que a su vez es una version "abliterated" del Qwen3-1.7B de Alibaba. El autor (John2202) se limita a convertir a GGUF el modelo abliterado usando el espacio ggml-org/gguf-my-repo de Hugging Face, de modo que pueda ejecutarse con llama.cpp en CPU o GPU de gama baja. El resultado es un unico archivo de aproximadamente 1,1 GB con 1.720.574.976 parametros, licencia Apache 2.0.

El interes de esta ficha esta en dos capas: por un lado, la cuantizacion Q4_K_M hace viable la inferencia local en hardware muy modesto (incluso sin GPU); por otro, la abliteracion aplicada por mlabonne elimina total o parcialmente las direcciones de rechazo del modelo original, de forma que el modelo tiende a no negarse a responder segun que solicitudes. Es un modelo pequeno, de la familia Qwen3, orientado a generacion de texto y conversacion, no a razonamiento de frontera.

Conviene subrayar que este repositorio concreto tiene 0 descargas y 0 likes en el momento de la consulta, no declara idiomas y no aporta model card propia mas alla de las instrucciones de uso de llama.cpp. Toda la informacion tecnica relevante procede del modelo base Qwen3-1.7B y de los repos de abliteracion de los que deriva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3) |
| Parametros totales | 1.720.574.976 (~1,72 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen3-1.7B declara 32.768 tokens nativos, ampliables con YaRN) |
| Tipos de cuantizacion | Este repo: Q4_K_M. El ecosistema GGUF de llama.cpp admite Q2_K, Q3_K, Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0, entre otras |
| Idiomas soportados | No disponible en la informacion proporcionada (el modelo base Qwen3 es multilingue) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (archivo unico qwen3-1.7b-abliterated-q4_k_m.gguf) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B: un transformer decoder-only denso de aproximadamente 1,72 mil millones de parametros, disenado para generacion de texto autoregresiva. Sobre esa base, mlabonne aplico una tecnica de abliteration, consistente en identificar y restar las direcciones de activacion asociadas a los comportamientos de rechazo (refusals) en las capas del modelo, de modo que el modelo deja de activar sistematicamente respuestas de negativa. Posteriormente, John2202 convirtio ese checkpoint a GGUF con llama.cpp a traves del espacio gguf-my-repo, fijando la cuantizacion en Q4_K_M.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si hubo fases de RLHF, DPO u otro ajuste por preferencias especificas para esta variante. Es razonable asumir que el entrenamiento base corresponde al de Qwen3-1.7B publicado por Alibaba (modelo con modo de razonamiento y soporte de tool calling), pero este extremo no se documenta de forma explicita en este repositorio ni en los materiales consultados.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3-1.7B.
- Comportamiento "abliterated": el modelo tiende a no activar rechazos en el estilo del modelo original, lo que afecta directamente a su perfil de seguridad (ver limitaciones).
- Soporte de chat y plantilla conversacional (tag "conversational" y pipeline text-generation).
- Compatible con tool calling / function calling en la medida en que lo es la familia Qwen3 base, aunque no se documenta de forma especifica en este repositorio.
- Inferencia local via llama.cpp (CLI y servidor), con endpoints de tipo OpenAI si se expone llama-server.
- Capacidades multilingues: no confirmadas en la informacion disponible para esta variante concreta.
- Modo "thinking"/razonamiento: propio de Qwen3, no verificado para esta cuantizacion abliterada.

## Casos de uso

- Inferencia en CPU o equipos sin GPU: un archivo Q4_K_M de ~1,1 GB permite ejecutar el modelo en portatiles, mini-PC o incluso Raspberry Pi, con llama.cpp, para prototipos y demos locales.
- Asistente conversacional offline en el escritorio: integrarlo via llama-server para tareas de redaccion, resumen o reformulacion de texto sin depender de servicios en la nube.
- Experimentacion con alineacion y seguridad: la variante abliterated es util para estudiar como cambia el comportamiento del modelo al eliminar las direcciones de rechazo, en contextos de investigacion controlada.
- Generacion de texto creativo sin filtros comerciales estrictos: escritura de ficcion o guiones donde el modelo original podria negarse a continuar por contenido sensible.
- Chatbot embebido en aplicaciones de escritorio o moviles: al ser pequeno y cuantizado, puede incluirse como dependencia con llama-cpp-python y ejecutarse en el propio dispositivo.
- Preprocesado de texto en pipelines locales: clasificacion, extraccion de entidades simples o normalizacion de texto sin coste de API, aceptando la menor calidad frente a modelos mayores.
- Base para fine-tuning ligero: al ser un modelo de 1,7 B con licencia Apache 2.0, sirve como punto de partida para LoRA/QLoRA en tareas especificas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para Q4_K_M: en torno a 1,1 GB de pesos mas overhead de contexto y KV cache; con 2 GB de RAM o VRAM libres suele ser suficiente para contextos moderados.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (GTX 1050 en adelante, RTX 2060/3060/4090, etc.), y tambien en GPUs integradas con memoria compartida.
- CPU: funciona completamente en CPU; en CPU con AVX2 y unos pocos nucleos se obtienen velocidades usables para chat interactivo.
- GPU profesionales: no se requieren (A100/H100 son innecesarias para este tamano; el modelo cabe incluso en entornos mucho mas modestos).
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), llama-cpp-python, Ollama (importando el GGUF), y en general cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen fuertemente del hardware, del backend (CPU/GPU) y de la longitud de contexto configurada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato/cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| John2202/Qwen3-1.7B-abliterated-Q4_K_M-GGUF (este) | ~1,72 B | GGUF Q4_K_M | No disponible | apache-2.0 | Hugging Face, 0 descargas |
| mlabonne/Qwen3-1.7B-abliterated | ~1,72 B | Pesos originales (safetensors) | No disponible | apache-2.0 | Hugging Face (modelo base de este repo) |
| huihui-ai/Qwen3-1.7B-abliterated | ~1,72 B | Pesos originales | No disponible | apache-2.0 | Hugging Face |
| bartowski/mlabonne_Qwen3-1.7B-abliterated-GGUF | ~1,72 B | Multiples GGUF (imatrix) | No disponible | apache-2.0 | Hugging Face |
| Qwen/Qwen3-1.7B (original) | ~1,72 B | Pesos originales | No disponible en la info | apache-2.0 | Hugging Face / API |

Todas las alternativas comparten el mismo tamano de parametros; la diferencia principal es el formato (GGUF frente a safetensors), el grado de cuantizacion y, en el caso de las variantes abliterated, la modificacion del comportamiento de rechazo. No se dispone de datos de rendimiento comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteration elimina o atenua los mecanismos de rechazo del modelo: puede generar contenido inapropiado, danino o no verificado con mayor facilidad que el Qwen3-1.7B original, lo que exige filtros externos en cualquier despliegue en produccion.
- Riesgo de alucinacion elevado: es un modelo de solo ~1,72 B de parametros, por lo que su fiabilidad factual es limitada en comparacion con modelos mayores.
- La cuantizacion Q4_K_M introduce perdida adicional de calidad respecto a los pesos originales en precision completa.
- Contexto, idiomas soportados y capacidades de tool calling no estan documentados para esta variante concreta; no deben asumirse sin verificacion previa.
- Licencia Apache 2.0: permite uso comercial, pero el autor del repositorio no ofrece garantias y no asume responsabilidad por el uso del modelo.
- Repositorio practicamente sin validacion de la comunidad (0 descargas, 0 likes al consultar): no hay evidencia publica de calidad ni de reproducibilidad de resultados.
- No se documentan sesgos especificos; los sesgos heredados del modelo base Qwen3-1.7B y los introducidos por la abliteration no han sido auditados en este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/John2202/Qwen3-1.7B-abliterated-Q4_K_M-GGUF
- Modelo base directo: https://huggingface.co/mlabonne/Qwen3-1.7B-abliterated
- Variante abliterada de huihui-ai: https://huggingface.co/huihui-ai/Qwen3-1.7B-abliterated
- Cuantizaciones GGUF de bartowski: https://huggingface.co/bartowski/mlabonne_Qwen3-1.7B-abliterated-GGUF
- Modelo original Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Imagen Docker de Qwen3: https://hub.docker.com/r/ai/qwen3
