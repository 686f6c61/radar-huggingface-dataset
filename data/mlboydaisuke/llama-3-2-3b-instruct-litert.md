# mlboydaisuke/Llama-3.2-3B-Instruct-LiteRT

## Resumen

Llama-3.2-3B-Instruct-LiteRT es una conversión del modelo meta-llama/Llama-3.2-3B-Instruct al formato `.litertlm` para inferencia on-device con el runtime LiteRT-LM de Google AI Edge. Lo publica el usuario mlboydaisuke y su objetivo es claro: llevar un modelo de 3B parámetros a dispositivos de borde (moviles Android, portatiles Mac, equipos de escritorio) con una cuantizacion int4 por bloques que mantiene la calidad del modelo original a la vez que reduce el peso del fichero a unos 2,1 GB.

El modelo conserva la arquitectura transformer decoder-only del Llama-3.2-3B-Instruct original, con una ventana de contexto de 4096 tokens en la cache KV, y se distribuye como un bundle autocontenido que incluye tokenizador y plantilla de chat. La cuantizacion es int4 simetrica con bloques de 32 pesos, embeddings en INT8 en una seccion externalizada y computo entero, lo que lo hace apto para aceleradores de movil y GPU integradas.

Su relevancia actual radica en que demuestra que un modelo instruct de 3B puede ejecutarse a velocidades interactivas (unos 18,5 tok/s en un iPhone 17 Pro y unos 87 tok/s en un Mac M4 Max) sin renunciar practicamente a calidad frente a bf16 en tareas de razonamiento matematico (GSM8K), y en que se integra con la app oficial Google AI Edge Gallery y con una CLI que expone una API compatible con OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.2), inferencia via LiteRT-LM |
| Parametros totales | 3B (heredados de Llama-3.2-3B-Instruct) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (cache KV) |
| Tipos de cuantizacion | int4 por bloques (bloque 32, simetrico); embeddings INT8 externalizados; computo entero |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 |
| Formato de pesos | `.litertlm` (bundle LiteRT-LM, ~2,1 GB); repo de 6,6 GB |

## Arquitectura y entrenamiento

El modelo es una conversion del checkpoint meta-llama/Llama-3.2-3B-Instruct, un transformer decoder-only denso de 3B parametros. No se ha reentrenado: la model card indica explicitamente que los pesos, el tokenizador y los metadatos del ejecutor son identicos byte a byte al original en la actualizacion de 2026-09-21, y que solo se actualizo la plantilla de chat para aceptar la forma de partes de contenido 0.18. Por tanto, las innovaciones de entrenamiento (datos, RLHF/DPO, etc.) son las del modelo base de Meta y no se detallan en la informacion disponible.

La innovacion tecnica de esta ficha es el pipeline de conversion y cuantizacion: pesos int4 simetricos con granularidad de bloque 32, embeddings INT8 en seccion externalizada y computo entero, empaquetados en un bundle `.litertlm` que transporta tokenizador y plantilla nativa de Llama-3 (`<|start_header_id|>role<|end_header_id|>`, token de inicio `<|begin_of_text|>`, tokens de parada `<|eot_id|>` y `<|end_of_text|>`). El runtime LiteRT-LM es el mismo motor que usan los modelos oficiales `litert-community/*`.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla nativa Llama-3.
- Razonamiento matematico de tipo chain-of-thought directo (sin bloque `think`), con terminacion limpia en `<|eot_id|>`.
- Respuesta a instrucciones en formato instruct (hereda el ajuste del modelo base).
- Inferencia on-device con backend GPU (Metal en Apple, GPU en Android) y backend CPU como alternativa.
- Bundle autocontenido: tokenizador y plantilla de chat incluidos, sin ficheros separados.
- Integracion con la app Google AI Edge Gallery (importacion directa desde Hugging Face en v1.0.16+).
- API Kotlin para Android (`com.google.ai.edge.litertlm:litertlm-android`) y CLI de escritorio con servidor compatible con OpenAI.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling, function calling, agentes y vision: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional movil offline: el modelo se ejecuta integramente en el dispositivo con la app Google AI Edge Gallery o embebido via la API Kotlin, sin enviar datos a la nube, lo que es adecuado para privacidad y para escenarios sin conectividad.
- Prototipado rapido de apps Android con IA generativa: la API Kotlin `litertlm-android` permite integrar el modelo en una app propia y usar el backend GPU para obtener respuestas interactivas a unos 18,5 tok/s en hardware de gama alta.
- Servidor local compatible con OpenAI en escritorio: la CLI `litert-lm serve` levanta una API compatible con OpenAI, util para probar integraciones existentes (clientes, SDKs) contra un modelo local de 2,1 GB sin infraestructura cloud.
- Razonamiento matematico asistido en entornos educativos o de productividad: con un rendimiento GSM8K del 73,0% en int4 (frente al 78,0% en bf16), es adecuado para resolver problemas aritmeticos de varios pasos en aplicaciones de estudio o calculo asistido.
- Generacion de texto en portatiles Apple Silicon: a unos 87 tok/s en un Mac M4 Max en modo greedy, sirve para tareas de redaccion, resumen o generacion de borradores en local con baja latencia.
- Evaluacion y benchmarking de cuantizacion: al publicar comparativas controladas contra bf16 y MLX 4-bit, es un buen punto de partida para medir el impacto de la cuantizacion int4 por bloques en tareas de razonamiento.
- Despliegue en dispositivos de borde con recursos limitados: el fichero de 2,1 GB y el computo entero lo hacen viable en telefonos y placas con GPU integrada donde un modelo bf16 de 3B no cabria.

## Benchmarks y rendimiento

Resultados de GSM8K (n=100, greedy, 0-shot chain-of-thought con extraccion `#### <n>`), segun la model card:

| Configuracion | GSM8K |
|---|---|
| bf16 (referencia) | 78,0% |
| MLX 4-bit (control) | 73,3% (subconjunto comun de 45 preguntas) |
| LiteRT int4 (este modelo) | 73,0% (n=100 completo) |

La model card indica que LiteRT int4 esta a la par del control MLX 4-bit (73,3% frente a 73,3% en el subconjunto comun de 45 preguntas) y a 5 puntos de bf16. El modelo supera la puerta de calidad local 8/8 sin degeneracion. El 78,0% de bf16 coincide con el GSM8K 8-shot publicado por Llama (~77,7%), lo que valida el arnes de evaluacion.

Rendimiento de decodificacion declarado:

| Plataforma | Velocidad | Notas |
|---|---|---|
| iPhone 17 Pro (Metal GPU) | ~18,5 tok/s | TTFT 0,64 s |
| Mac M4 Max | ~87 tok/s | modo greedy |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el fichero pesa ~2,1 GB; con cache KV de 4096 tokens y overhead del runtime, se recomienda al menos 3-4 GB de memoria disponible en el dispositivo.
- GPU recomendadas: GPU integradas de Apple Silicon (Metal) y GPU de moviles de gama alta (el ejemplo de la model card es un iPhone 17 Pro). En escritorio, un Mac M4 Max alcanza ~87 tok/s.
- Cabe en GPU de consumo: si, en el sentido de que esta pensado para hardware de borde; no se especifican requisitos para GPU dedicadas de escritorio (RTX 4090, A100, H100) en la informacion disponible.
- Opciones de despliegue: runtime LiteRT-LM (CLI `litert-lm run` y `litert-lm serve`), app Google AI Edge Gallery (v1.0.15+ para `.litertlm`, v1.0.16+ con importacion directa desde Hugging Face), API Kotlin para Android (`com.google.ai.edge.litertlm:litertlm-android`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: TTFT de 0,64 s en iPhone 17 Pro; ~18,5 tok/s en iPhone 17 Pro y ~87 tok/s en Mac M4 Max en modo greedy. No hay datos de throughput por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Formato |
|---|---|---|---|---|---|
| Llama-3.2-3B-Instruct-LiteRT (este) | 3B | 4096 | 73,0% (int4) | llama3.2 | `.litertlm` |
| Llama-3.2-3B-Instruct (bf16) | 3B | no disponible en la informacion | 78,0% (referencia de la model card) | llama3.2 | safetensors |
| MLX 4-bit de Llama-3.2-3B-Instruct | 3B | no disponible en la informacion | 73,3% (subconjunto de 45) | llama3.2 | MLX |

La model card solo proporciona comparativas contra bf16 y MLX 4-bit del mismo modelo base. No se dispone de datos de otros modelos de 3B comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al heredar el modelo base de Meta, cabe esperar los sesgos del Llama-3.2-3B-Instruct original, pero no se detallan.
- Riesgo de alucinacion: inherente a los modelos de 3B; la model card no cuantifica tasas de alucinacion.
- La cuantizacion int4 introduce una perdida de calidad medible: 5 puntos en GSM8K frente a bf16 (73,0% frente a 78,0%). En tareas sensibles a precision puede no ser aceptable.
- Contexto limitado a 4096 tokens en la cache KV, inferior al contexto nativo del modelo base.
- Idiomas soportados no documentados en la informacion disponible.
- Licencia llama3.2: se deben respetar los terminos de la licencia de Llama 3.2 de Meta para uso comercial y redistribucion; la model card no anade restricciones propias.
- El proceso de importacion via CLI puede dejar descargas incompletas en cache sin verificar el tamano (documentado para litert-lm 0.14.0 a 0.19.2 y nightly 0.20.0.dev20261112), lo que provoca fallos silenciosos; hay que borrar el fichero cacheado y reimportar.
- La app Google AI Edge Gallery requiere versiones recientes (1.0.15+ para `.litertlm`, 1.0.16+ para importacion directa); las builds 1.0.x antiguas con paquete `com.google.aiedge.gallery` solo aceptan el formato legado `.task`.
- Dependencia del runtime LiteRT-LM: no es compatible con ecosistemas como vLLM, llama.cpp u Ollama segun la informacion disponible, lo que limita su integracion en infraestructuras existentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/Llama-3.2-3B-Instruct-LiteRT
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- App Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
- Releases de la Gallery: https://github.com/google-ai-edge/gallery/releases
- Guia de importacion de modelos locales: https://github.com/google-ai-edge/gallery/wiki/6.-Importing-Local-Models-(optional)
- API Kotlin de LiteRT-LM (getting started): https://github.com/google-ai-edge/LiteRT-LM/blob/main/docs/api/kotlin/getting_started.md
