# sairaph-official/SmolLM2-360M-Instruct-327625a

## Resumen

SmolLM2-360M-Instruct-327625a es un espejo (mirror) del repositorio `litert-community/SmolLM2-360M-Instruct`, publicado por el usuario `sairaph-official` para su uso en la aplicación LLM Server. No se trata de un modelo entrenado por el autor del repositorio: los ficheros son una copia byte a byte del commit `327625a06971d1333da38549f7680e30ced80a6e` del repositorio upstream. El modelo subyacente es SmolLM2-360M-Instruct, desarrollado por Hugging Face (HuggingFaceTB), un transformer decoder-only de 360 millones de parámetros.

El propósito de esta variante concreta es el despliegue en dispositivos Android mediante LiteRT-LM, el runtime de Google AI Edge para modelos en dispositivo. El artefacto principal es un fichero `.litertlm` de 373.719.040 bytes (unos 356 MiB) con hash SHA-256 `8e2834da211b439751af968ed650febdde5a8cb8d88bc6c1a3059f049caa5c2e`, que empaqueta los pesos en el formato propietario de LiteRT-LM.

Su relevancia es acotada: sirve como ejemplo de distribución de un modelo pequeño ajustado para inferencia local en móviles dentro del ecosistema Google AI Edge (Edge Gallery), no como un modelo nuevo con mejoras de rendimiento. Cualquier evaluación técnica debe remitirse al modelo base SmolLM2-360M-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2, segun modelo base) |
| Parametros totales | 360 M (segun nombre del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el artefacto es un fichero `.litertlm` de 373.719.040 bytes; no se detalla el esquema de cuantizacion) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); no se incluyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

La arquitectura corresponde a SmolLM2-360M-Instruct, un transformer decoder-only de 360 millones de parametros desarrollado por Hugging Face. La model card de este repositorio no aporta detalles sobre la composicion del dataset de entrenamiento, el numero de tokens, ni si hubo fases de RLHF o DPO; esa informacion solo estaria disponible en la model card del modelo base `HuggingFaceTB/SmolLM2-360M-Instruct`, que no se incluye en la informacion proporcionada.

La unica innovacion tecnica documentada en este repositorio es el empaquetado para LiteRT-LM, el runtime de Google AI Edge que permite ejecutar el modelo en Android. El fichero `.litertlm` es un contenedor especifico de ese runtime; no se documenta en la model card si se aplico cuantizacion adicional, conversion de operadores o algun tipo de optimizacion especifica para CPU/GPU/NPU movil.

## Capacidades

- Generacion de texto conversacional: el sufijo `-Instruct` del modelo base indica ajuste para seguir instrucciones en formato chat.
- Conversacion multi-turno: la etiqueta `chat` y el pipeline `text-generation` lo confirman.
- Inferencia en dispositivo (on-device): disenado para ejecutarse localmente en Android a traves de LiteRT-LM.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no lista idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistente conversacional local en Android: integrado mediante Edge Gallery o las LiteRT samples de Google AI Edge, el modelo puede responder a peticiones de chat sin conexion a red, ejecutandose en el propio telefono.
- Prototipado de aplicaciones moviles con IA generativa: desarrolladores que quieran validar una experiencia de chat en Android pueden usar este artefacto `.litertlm` directamente con LiteRT-LM sin convertir pesos ellos mismos.
- Demos de inferencia en dispositivo para evaluacion de latencia: util para medir el rendimiento real de un modelo de 360 M en hardware movil concreto (CPU/GPU/NPU del telefono).
- Generacion de texto offline en entornos sin conectividad: por ejemplo, aplicaciones de campo o escenarios con requisitos de privacidad donde los datos no deben salir del dispositivo.
- Base para experimentos de ajuste fino posterior: al ser Apache 2.0 y derivar de SmolLM2-360M-Instruct, puede servir como punto de partida para fine-tuning y posterior reempaquetado a LiteRT-LM.
- Pruebas de integracion continua de pipelines LiteRT-LM: el hash SHA-256 publicado permite verificar la integridad del artefacto en pipelines de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario objetivo (Android); el artefacto ocupa 373.719.040 bytes en almacenamiento.
- GPU recomendadas: no disponible; el despliegue documentado es en dispositivos Android mediante LiteRT-LM, no en GPU de servidor.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no documentada en la informacion proporcionada.
- Opciones de despliegue: LiteRT-LM (runtime de Google AI Edge) en Android; la app Edge Gallery (Google Play o compilada desde GitHub) y las LiteRT samples son las vias oficiales documentadas. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM2-360M-Instruct-327625a (este repo) | 360 M | no disponible | `.litertlm` | Apache 2.0 | Hugging Face (mirror de Sairaph) |
| HuggingFaceTB/SmolLM2-360M-Instruct (base) | 360 M | no disponible | safetensors (segun modelo base) | Apache 2.0 | Hugging Face |
| litert-community/SmolLM2-360M-Instruct (upstream) | 360 M | no disponible | `.litertlm` | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada; las tres comparten los mismos pesos subyacentes y solo difieren en el empaquetado y la distribucion.

## Limitaciones y advertencias

- Es un mirror, no un modelo original: no aporta mejoras tecnicas respecto al upstream `litert-community/SmolLM2-360M-Instruct`; cualquier problema del modelo base se hereda.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validacion comunitaria.
- Solo se distribuye el fichero `.litertlm`; no hay safetensors ni GGUF, por lo que no es directamente usable con vLLM, llama.cpp, Ollama o TGI.
- Tamano de 360 M: capacidad limitada de razonamiento, matematicas y conocimiento factual; riesgo elevado de alucinacion en tareas complejas.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano.
- Contexto maximo no documentado en esta model card.
- Licencia Apache 2.0 permite uso comercial, pero el autor del mirror anade ficheros `LICENSE` y de aviso que no existian en el upstream; conviene revisar la procedencia de los pesos antes de un despliegue en produccion.
- El formato `.litertlm` ata el uso al runtime LiteRT-LM; no es portable a otros motores de inferencia sin conversion.
- Fecha de creacion del repositorio: 2026-11-23 (segun metadatos de Hugging Face).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sairaph-official/SmolLM2-360M-Instruct-327625a
- Repositorio upstream: https://huggingface.co/litert-community/SmolLM2-360M-Instruct
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- LiteRT-LM (repositorio): https://github.com/google-ai-edge/LiteRT-LM
- Edge Gallery (app): https://github.com/google-ai-edge/gallery
- Edge Gallery en Google Play: https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- LiteRT samples: https://github.com/google-ai-edge/litert-samples
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
