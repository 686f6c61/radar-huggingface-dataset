# sairaph-official/OLMo-2-1B-Instruct-423cfd8

## Resumen
OLMo-2-1B-Instruct en formato LiteRT-LM es una conversión del modelo instructivo de 1.000 millones de parámetros desarrollado por AllenAI (allenai/OLMo-2-0425-1B-Instruct), empaquetado por la comunidad litert-community y replicado sin modificaciones por sairaph-official para su uso en la aplicación LLM Server. El objetivo es ejecutar generación de texto directamente en dispositivos móviles y equipos de sobremesa sin GPU dedicada, aprovechando el runtime LiteRT de Google (antiguo TensorFlow Lite). La relevancia actual radica en que demuestra un flujo de conversión oficial desde PyTorch a un formato de despliegue en el borde, con cuantización int4 por bloques y un rendimiento medido de 48,8 tokens/s en decodificación sobre la GPU de un Galaxy S26.

El modelo base pertenece a la familia OLMo 2 de AllenAI, caracterizada por ser completamente abierta: pesos, datos de entrenamiento y código de entrenamiento publicados bajo licencia Apache 2.0. Esta variante de 1B está pensada para tareas de instrucción y cabe en dispositivos con 8 GB de memoria, lo que la sitúa en la categoría de modelos pequeños para inferencia local. El repositorio espejo de Sairaph solo contiene el archivo `.litertlm` cuantizado (933.543.936 bytes) y una copia de la licencia Apache 2.0, sin los archivos adicionales que menciona la model card original.

La ficha se centra en el artefacto publicado: un único fichero LiteRT-LM de 0,93 GB con pesos int4 en bloques de 32, embeddings int8 y una caché KV de 4096 tokens. No se dispone de información sobre idiomas soportados en los metadatos del repositorio, aunque el modelo base OLMo 2 está entrenado principalmente en inglés.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 2); artefacto convertido a LiteRT-LM |
| Parametros totales | 1B (modelo base allenai/OLMo-2-0425-1B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (caché KV del artefacto `ekv4096`) |
| Tipos de cuantizacion | int4 por bloques (block 32) con OCTAV optimal-clipping, simétrico; embeddings int8; cómputo entero |
| Idiomas soportados | no disponible en los metadatos del repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); fichero de 933.543.936 bytes |

## Arquitectura y entrenamiento
El modelo base es un transformer decoder-only de la familia OLMo 2 de AllenAI, entrenado desde cero con datos y código abiertos. Esta variante corresponde al checkpoint instructivo `OLMo-2-0425-1B-Instruct`, ajustado para seguir instrucciones y conversar. La model card del repositorio no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esa información debe consultarse en la documentación del modelo base de AllenAI.

El artefacto publicado no es el modelo original en safetensors, sino una conversión realizada con `litert-torch` (el renombrado `ai-edge-torch`) al formato `.litertlm` para el runtime LiteRT-LM de Google. La conversión aplica cuantización int4 por bloques de 32 con clipping óptimo OCTAV y embeddings int8, y el bundle incluye el tokenizador y la plantilla de prompt nativa de OLMo 2 (Tülu, con `<|user|>` / `<|assistant|>` y token de parada `<|endoftext|>`). El 14 de noviembre de 2026 un script separado reescribió el grafo de prefill/decode para GPU sin alterar los pesos. La model card reporta que una conversión de un modelo PyTorch con `litert_torch.convert` coincidió con el original con un error de 4e-7 en un Galaxy S26 (LiteRT 2.2.0, Android 16, 2026-09-05).

## Capacidades
- Generación de texto conversacional y seguimiento de instrucciones, gracias al ajuste instructivo del modelo base.
- Razonamiento básico y respuesta a preguntas dentro de la ventana de contexto de 4096 tokens.
- Generación de código y matemáticas elementales, limitada por el tamaño de 1B parámetros.
- Ejecución en el dispositivo (on-device) mediante LiteRT-LM, sin necesidad de conexión a un servidor.
- Inferencia en CPU y GPU: el artefacto incluye grafo de prefill/decode optimizado para GPU.
- Soporte de chat interactivo y servidor local compatible con la API de OpenAI a través de `litert-lm serve`.
- Ejecución multiplataforma en macOS, Linux y Windows con el mismo bundle, y en Android mediante Google AI Edge Gallery 1.0.16+.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (thinking) en la información disponible.

## Casos de uso
- Asistente de chat local en el móvil: el bundle de 0,93 GB se importa directamente en Google AI Edge Gallery y permite conversaciones multi-turno con una caché KV de 4096 tokens sin enviar datos a la nube, adecuado para privacidad y uso sin conexión.
- Autocompletado y redacción en aplicaciones Android: integrado mediante la librería `com.google.ai.edge.litert:litert`, el modelo puede ofrecer sugerencias de texto y respuestas rápidas dentro de apps nativas con un consumo de memoria compatible con teléfonos de 8 GB.
- Servidor de inferencia local para desarrollo: `litert-lm serve` expone una API compatible con OpenAI en macOS, Linux o Windows, lo que permite prototipar aplicaciones que consuman el modelo sin depender de servicios externos.
- Demostración web con WebGPU: el demo oficial carga el fichero desde la rama `web` y lo ejecuta en el navegador, útil para evaluar el modelo y para tutoriales sin instalación.
- Clasificación y extracción de información en el borde: con 4096 tokens de contexto, el modelo puede resumir correos, extraer campos de documentos cortos o clasificar mensajes en aplicaciones de escritorio o móviles con latencia baja.
- Educación y experimentación con modelos abiertos: al ser un artefacto Apache 2.0 derivado de OLMo 2, sirve para estudiar el proceso de conversión PyTorch a LiteRT-LM y para prácticas de cuantización int4 en entornos con recursos limitados.
- Procesamiento por lotes en equipos sin GPU: al ejecutarse en CPU con cómputo entero, puede utilizarse para tareas de generación de texto de baja concurrencia en portátiles y mini-PC.

## Benchmarks y rendimiento
La model card solo reporta métricas de rendimiento del runtime, no resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.). Se presentan los datos disponibles:

| Metrica | Valor | Condiciones |
|---|---|---|
| Decodificacion | 48,8 tokens/s | GPU de Galaxy S26, LiteRT-LM v0.19.0, 2026-11-14 |
| Prefill | 690 tokens/s (1024 tokens) | GPU de Galaxy S26, LiteRT-LM v0.19.0, 2026-11-14 |
| Error de conversion | 4e-7 | `litert_torch.convert`, Galaxy S26, LiteRT 2.2.0, Android 16, 2026-09-05 |

No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware
- VRAM/RAM estimada: el fichero pesa 0,93 GB; en inferencia se necesita además memoria para la caché KV de 4096 tokens y el estado del runtime, por lo que conviene disponer de al menos 2 GB libres.
- GPU recomendadas: la model card solo cita la GPU de un Galaxy S26; no se especifican modelos de escritorio. El artefacto incluye grafo optimizado para GPU y también funciona en CPU.
- Compatibilidad con GPU de consumo: no hay datos específicos para RTX 4090, RTX 3090 u otras; el enfoque del artefacto es móvil y de borde, no servidores con GPU dedicada.
- Cabe en móviles de 8 GB: la model card indica que a 0,93 GB "cabe cómodamente en un teléfono de 8 GB".
- Opciones de despliegue: runtime LiteRT-LM (`pip install litert-lm`), CLI `litert-lm run` / `import` / `serve`, Google AI Edge Gallery en Android, y demo web con WebGPU.
- Latencia y throughput: 48,8 tokens/s de decodificación y 690 tokens/s de prefill en Galaxy S26; no hay cifras para otras plataformas.
- Nota operativa: el CLI litert-lm (0.14.0 a 0.19.2) puede reutilizar descargas incompletas de la caché sin verificar su tamaño; si aparece un bus error (exit 138) o un error `too large for file size`, hay que borrar el fichero de `~/.litert-lm/cache/huggingface/litert-community/OLMo-2-1B-Instruct/` y repetir la descarga o el `import`.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Formato/despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OLMo-2-1B-Instruct LiteRT-LM (este) | 1B | 4096 (KV) | `.litertlm`, LiteRT-LM, on-device | Apache 2.0 | Hugging Face (espejo Sairaph y litert-community) |
| allenai/OLMo-2-0425-1B-Instruct | 1B | no disponible en esta ficha | safetensors, PyTorch | Apache 2.0 | Hugging Face |
| Otros modelos de 1B para el borde | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos ni de especificaciones de alternativas equivalentes en la información proporcionada, por lo que la comparación se limita al modelo base y al formato de despliegue.

## Limitaciones y advertencias
- El modelo base es de 1B parámetros: su capacidad de razonamiento, matemáticas y código es limitada en comparación con modelos de mayor tamaño; es esperable una tasa elevada de errores en tareas complejas.
- Riesgo de alucinación inherente a los modelos de lenguaje pequeños, especialmente en preguntas factuales y contextos largos.
- La ventana de contexto efectiva está limitada a 4096 tokens por la caché KV del artefacto; prompts más largos no son soportados por este bundle.
- No se documentan los idiomas soportados en los metadatos; el modelo base OLMo 2 está entrenado principalmente en inglés, por lo que el rendimiento en castellano puede ser inferior.
- No se documentan capacidades de tool calling, agentes, visión ni audio; no deben asumirse.
- El repositorio es un espejo no oficial de Sairaph: solo contiene el fichero `.litertlm` y la licencia; los archivos adicionales mencionados en la model card original no están incluidos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda conservar los avisos de licencia y verificar las condiciones del modelo base de AllenAI.
- El CLI litert-lm puede reutilizar descargas incompletas sin verificar su integridad, lo que provoca fallos silenciosos; es necesario borrar la caché si el modelo no arranca.
- El artefacto fue reemplazado el 2026-11-15 (hora de Japón); descargas anteriores pueden corresponder a una versión distinta y deben eliminarse de la caché.

## Enlaces
- Repositorio en Hugging Face (espejo Sairaph): https://huggingface.co/sairaph-official/OLMo-2-1B-Instruct-423cfd8
- Repositorio upstream en Hugging Face: https://huggingface.co/litert-community/OLMo-2-1B-Instruct
- Modelo base en Hugging Face: https://huggingface.co/allenai/OLMo-2-0425-1B-Instruct
- Runtime LiteRT-LM en GitHub: https://github.com/google-ai-edge/LiteRT-LM
- Demo web de chat LiteRT-LM: https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/OLMo-2-1B-Instruct
- Google AI Edge Gallery en GitHub: https://github.com/google-ai-edge/gallery
- Benchmark de referencia citado en la model card: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
