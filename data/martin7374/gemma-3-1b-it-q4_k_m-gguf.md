# Martin7374/gemma-3-1b-it-Q4_K_M-GGUF

## Resumen

Martin7374/gemma-3-1b-it-Q4_K_M-GGUF es una cuantizacion en formato GGUF del modelo google/gemma-3-1b-it, generada por el usuario Martin7374 mediante el espacio GGUF-my-repo de ggml.ai y la herramienta llama.cpp. No es un modelo entrenado desde cero, sino una conversion de pesos: el repositorio contiene un unico fichero `gemma-3-1b-it-q4_k_m.gguf` de aproximadamente 0,8 GB, listo para inferencia local con la familia llama.cpp sin necesidad de GPU dedicada.

El modelo base pertenece a la familia Gemma 3 de Google, publicada en marzo de 2025. Se trata de un transformer decoder-only de aproximadamente 1.000 millones de parametros (999.885.952 segun los metadatos de safetensors), text-only, pensado para despliegues con recursos muy limitados: portatiles sin GPU, mini-PC, Raspberry Pi, moviles y contenedores con pocos cientos de MB de RAM disponibles.

Su relevancia practica es doble. Por un lado, ofrece una via sencilla de ejecutar un modelo conversacional moderno en hardware de consumo o en el borde (edge), con una sola dependencia (llama.cpp). Por otro, al ser un repositorio no oficial, de autor individual y sin descargas ni validacion de la comunidad en el momento de redactar esta ficha, debe tratarse como un artefacto a verificar antes de usarlo en produccion: conviene contrastar la calidad de la cuantizacion contra los pesos originales en safetensors o contra cuantizaciones equivalentes mantenidas por proyectos con mayor recorrido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3) del modelo base google/gemma-3-1b-it |
| Parametros totales | 999.885.952 (~1.000 millones), dato de safetensors del modelo base |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | El modelo base declara 32.768 tokens; los ejemplos de la model card de este repositorio arrancan llama-server con `-c 2048` |
| Tipos de cuantizacion | Solo Q4_K_M en este repositorio (fichero `gemma-3-1b-it-q4_k_m.gguf`). El formato GGUF admite otras (Q2_K, Q3_K_S/M, Q5_K_M, Q6_K, Q8_0, F16), pero este autor no las publica |
| Idiomas soportados | No disponible en la model card de este repositorio; el modelo base declara soporte para mas de 140 idiomas |
| Licencia | Gemma (terminos de uso de Google), con acceso condicionado a aceptar la licencia en HuggingFace |
| Formato de pesos | GGUF (`gemma-3-1b-it-q4_k_m.gguf`) |
| Tamano del repositorio | 0,8 GB |
| Libreria declarada | transformers (tags: gguf, llama-cpp, gguf-my-repo, endpoints_compatible) |
| Pipeline | text-generation |
| Modelo base | google/gemma-3-1b-it |

## Arquitectura y entrenamiento

Este repositorio no aporta informacion sobre el entrenamiento: es exclusivamente una conversion de formato. La arquitectura corresponde, por tanto, al modelo base. Gemma 3 usa un transformer decoder-only con atencion local de ventana deslizante combinada con capas de atencion global en una proporcion 5:1, normalizacion QK y RoPE, ademas de un vocabulario ampliado (del orden de 262.000 tokens) y una plantilla de chat propia. La variante de 1B es la unica de la familia Gemma 3 que es exclusivamente de texto; las de 4B, 12B y 27B incorporan codificador de vision. Segun la documentacion de Google, la gama 1B se entreno sobre un volumen del orden de billones de tokens con destilacion desde modelos mayores y un ajuste posterior de instrucciones, con fecha de corte de conocimientos en agosto de 2024.

La innovacion relevante de este repositorio, en terminos practicos, es la cuantizacion Q4_K_M: un esquema de cuantizacion por bloques de 4 bits con mezcla de precision (algunas matrices y tensores criticos se mantienen en mayor precision) que reduce el peso del modelo a menos de 1 GB conservando, en teoria, mas calidad que un Q4_0 o Q4_K_S. No se han publicado en la model card mediciones de perplejidad ni comparaciones de calidad frente a los pesos originales en bf16, por lo que la degradacion introducida por la cuantizacion no esta cuantificada por el autor.

## Capacidades

- Generacion de texto conversacional: es un modelo ajustado a instrucciones (`-it`), con soporte de dialogos multi-turno mediante la plantilla de chat del modelo base.
- Razonamiento basico y tareas de conocimiento general: adecuado para preguntas cortas, resumenes y clasificacion, con las limitaciones esperables en un modelo de 1.000 millones de parametros.
- Capacidades multilingues: heredadas del modelo base, que declara soporte para mas de 140 idiomas; la model card de este repositorio no especifica el nivel de calidad por idioma.
- Ejecucion local y sin conexion: al ser GGUF, funciona en CPU, en GPU de gama baja y en dispositivos embebidos, sin dependencias de servicios externos.
- Tool calling / function calling: no documentado en la informacion disponible para este repositorio ni en la model card del autor.
- Agentes y razonamiento multi-paso: no documentado; un modelo de 1B rara vez sostiene cadenas de razonamiento largas con fiabilidad.
- Vision, audio o modo "thinking" explicito: no disponibles en la variante 1B de Gemma 3.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede desplegarse en la infraestructura de Inference Endpoints de HuggingFace cuando el formato lo permite.

## Casos de uso

- Asistentes conversacionales en el borde: un chatbot de soporte sencillo que corra integramente en un portatil o en un dispositivo sin GPU, usando llama-server con un contexto de 2.048 a 8.192 tokens, suficiente para turnos de conversacion cortos.
- Clasificacion y etiquetado de textos: analisis de sentimiento, deteccion de intenciones o enrutado de tickets hacia el departamento correcto en un backend de bajo coste, donde la latencia de red hacia una API externa no es aceptable.
- Resumen de documentos cortos: notas de reunion, correos o articulos breves; el limite practico esta en el contexto util efectivo, bastante menor que la ventana nominal de 32.768 tokens del modelo base.
- Prototipado y pruebas de concepto de producto: validar una interfaz conversacional antes de invertir en infraestructura de GPU, ya que basta un fichero de 0,8 GB y llama.cpp para tener un asistente funcional.
- Generacion de texto en aplicaciones de escritorio o moviles: autocompletado, redaccion asistida o reformulacion dentro de una aplicacion local, sin enviar datos del usuario a terceros.
- Traduccion ligera y normalizacion de texto: traduccion de frases cortas o estandarizacion de campos en pipelines de datos donde el multilingueismo del modelo base aporta cobertura amplia.
- Procesamiento por lotes en CPU: tareas de anonimizacion, extraccion de palabras clave o filtrado previo en servidores sin GPU, aprovechando el bajo consumo de memoria del Q4_K_M.
- Educacion y experimentacion: entorno de laboratorio para estudiar cuantizacion, plantillas de chat y comportamiento de modelos pequenos sin coste de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del autor ni los metadatos del repositorio incluyen evaluaciones (MMLU, GSM8K, HumanEval u otras), ni mediciones de perplejidad de la cuantizacion Q4_K_M frente a los pesos en bf16 del modelo base. Cualquier cifra que se use para decidir su adopcion deberia obtenerse de la documentacion oficial de google/gemma-3-1b-it y, aun asi, validarse localmente sobre la cuantizacion concreta, ya que la perdida de calidad por cuantizar no esta cuantificada por el autor.

## Requisitos de hardware

- Peso en disco y en memoria: aproximadamente 0,8 GB para los pesos Q4_K_M, segun el tamano del repositorio.
- VRAM/RAM estimada para inferencia: del orden de 1,0 a 1,5 GB para pesos mas overhead de llama.cpp; la cache KV se suma aparte y crece de forma lineal con el contexto configurado.
- Contexto y memoria: con `-c 2048` (valor de los ejemplos del autor) el consumo adicional de cache KV es pequeno; con 32.768 tokens, la cache KV domina el consumo total y conviene medirla antes de dimensionar el servicio.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente (GTX 1650, RTX 3060, RTX 4060, RTX 4090). En A100 y H100 el modelo es enormemente sobredimensionado en capacidad de computo; su interes en ese hardware es servir muchas instancias concurrentes, no exprimir una sola.
- Cabe en GPU de consumo: si, en practicamente todas las GPUs de los ultimos diez anos, y tambien en CPU. Es un caso de uso tipico de CPU, Raspberry Pi 5 (4-8 GB) y moviles de gama alta.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), llama-cpp-python, Ollama, LM Studio, text-generation-webui y cualquier frontend compatible con GGUF. Para vLLM o TGI es preferible usar los pesos safetensors originales de google/gemma-3-1b-it, ya que su soporte de GGUF es parcial o nulo segun la version.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas por el autor; el rendimiento dependera del backend (CPU vs. GPU), del numero de hilos, del contexto configurado y del ancho de banda de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato GGUF disponible | Notas |
|---|---|---|---|---|---|
| Martin7374/gemma-3-1b-it-Q4_K_M-GGUF (este repo) | ~1,0 B | 32.768 tokens en el modelo base | Gemma (gated) | Si, solo Q4_K_M | Conversion no oficial, 0 descargas en el momento de redactar |
| google/gemma-3-1b-it | ~1,0 B | 32.768 tokens | Gemma (gated) | No de forma oficial | Modelo base en safetensors; referencia de calidad frente a la cuantizacion |
| meta-llama/Llama-3.2-1B-Instruct | ~1,24 B | 128.000 tokens | Llama 3.2 Community License | Si, mediante terceros | Mayor ventana de contexto y ecosistema de cuantizaciones mas maduro |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,54 B | 32.768 tokens | Apache 2.0 | Si, mediante terceros | Licencia permisiva, sin registro previo, alternativa habitual en el mismo rango de tamano |
| google/gemma-2-2b-it | ~2,6 B | 8.192 tokens | Gemma (gated) | Si, mediante terceros | Generacion anterior de Google; mas parametros pero contexto mucho menor |

Los datos de parametros, contexto y licencia de los modelos comparados proceden de su documentacion publica y no han sido verificados contra sus repositorios en el momento de redactar esta ficha.

## Limitaciones y advertencias

- Cuantizacion con perdida: Q4_K_M reduce precision frente a bf16. El autor no publica perplejidad ni evaluaciones comparativas, por lo que no puede garantizarse la equivalencia funcional con el modelo original.
- Modelo pequeno: con ~1.000 millones de parametros, la tasa de alucinacion es alta en preguntas factuales, matematicas con varios pasos y razonamiento encadenado. No es adecuado para uso sin supervision en dominios sensibles (medicina, derecho, finanzas).
- Contexto nominal frente a contexto util: aunque el modelo base declare 32.768 tokens, la calidad de recuperacion decae mucho antes en modelos de este tamano; conviene no disenar flujos que dependan de ventanas muy largas.
- Idiomas: la model card espanola no declara idiomas; el soporte multilingue se hereda del modelo base y su calidad por idioma no esta documentada, especialmente en los idiomas menos representados.
- Tool calling y agentes: no documentados. Construir agentes multi-paso sobre esta variante requiere validacion previa, ya que no hay evidencia de que respete esquemas de llamadas a funciones.
- Licencia Gemma: el uso comercial esta permitido bajo los terminos de uso de Google, que incluyen obligaciones de atribucion y una politica de usos prohibidos. El acceso esta condicionado a aceptar la licencia en HuggingFace, y cualquier redistribucion debe respetar esas condiciones.
- Origen no oficial: el repositorio lo mantiene un autor individual, no Google. No hay garantias de mantenimiento, de reproducibilidad del proceso de conversion ni de integridad de los pesos mas alla de lo que permita verificar el hash del fichero.
- Senales de escasa madurez: 0 descargas y 0 likes en el momento de la consulta, y fechas de creacion y actualizacion identicas (14 de octubre de 2026 en los metadatos del repositorio), lo que indica una publicacion automatizada sin validacion posterior de la comunidad.
- Plantilla de chat: al usar llama.cpp es imprescindible aplicar correctamente la plantilla de Gemma 3; un formato de prompt incorrecto degrada notablemente la calidad de las respuestas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Martin7374/gemma-3-1b-it-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Espacio de conversion GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Informe tecnico de Gemma 3: https://arxiv.org/abs/2503.19786
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
