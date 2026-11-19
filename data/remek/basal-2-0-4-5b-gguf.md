# Remek/basal-2.0-4.5B-GGUF

## Resumen

basal-2.0-4.5B-GGUF es la distribucion en formato GGUF del modelo basal-2.0-4.5B, un modelo de decision tipada desarrollado por Remek sobre el modelo base polaco speakleash/Bielik-4.5B-v3.0-Instruct. A diferencia de un modelo conversacional al uso, basal no esta pensado para generar texto libre, sino para emitir decisiones estructuradas (eleccion entre opciones, si/no, puntuaciones) leyendo las log-probabilidades de los codigos de opcion mediante un servidor propio llamado basal-serve. El repositorio incluye dos cuantizaciones (Q8_0 y Q5_K_M), ficheros Modelfile para Ollama, metadatos de decision para LM Studio y ficheros de calibracion.

El modelo cuenta con 4.757.260.288 parametros (aproximadamente 4,5B) y esta orientado a tareas de clasificacion, toma de decisiones y calibracion, con soporte para polaco e ingles. Su relevancia actual reside en que ofrece una capa de decision determinista y calibrada sobre un LLM pequeno, con verificacion explicita de que las cuantizaciones mantienen el comportamiento del modelo bf16 original (acuerdo de 0,9839 en Q8_0 y 0,9569 en Q5_K_M para decisiones con 2 a 10 opciones sobre el conjunto dev v2).

La licencia es Apache 2.0, lo que facilita su integracion comercial, y el repo ocupa 17,0 GB en total, aunque los ficheros individuales pesan 4,8 GB (Q8_0) y 3,2 GB (Q5_K_M). El modelo esta disenado para ejecutarse en desktops y laptops mediante Ollama o llama.cpp, no como solucion de servidor de alto rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Bielik-4.5B-v3.0-Instruct); capa de decision tipada sobre log-probabilidades |
| Parametros totales | 4.757.260.288 (aproximadamente 4,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens en modo Ollama; configurable en llama.cpp (por ejemplo `-c 32768`); no disponible el maximo nativo del modelo base |
| Tipos de cuantizacion | Q8_0 y Q5_K_M (GGUF); existe tambien una version FP8 y MLX 8-bit en otros repositorios |
| Idiomas soportados | polaco (pl) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer derivado de speakleash/Bielik-4.5B-v3.0-Instruct, un modelo instructivo polaco. Sobre esa base, basal anade una capa de decision tipada: el servidor basal-serve construye un prompt propio del modelo, solicita las log-probabilidades de los codigos de opcion y las transforma en decisiones calibradas (eleccion entre opciones, si/no o puntuacion). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en la informacion proporcionada.

La innovacion tecnica principal es el uso de calibracion explicita y verificacion de puertos: el repositorio documenta ficheros de calibracion (`CALIBRATION.json` para bf16 y `CALIBRATION.llamacpp.json` para llama.cpp) y umbrales de aceptacion (acuerdo 2-10 >= 0,9415, acuerdo con margen >= 0,2 >= 0,9863, diferencia de exactitud <= 1 punto, ECE <= +0,01). Las cuantizaciones Q8_0 y Q5_K_M superan estos umbrales, lo que garantiza que la version GGUF reproduce el comportamiento del modelo bf16. Ademas, el motor basal permite exportar metadatos de decision a ficheros GGUF propios sin tocar los tensores, y soporta decodificacion de decisiones hasta 26 opciones en LM Studio o mas de 20 en llama.cpp.

## Capacidades

- Toma de decisiones tipada: eleccion entre 2 y 10 opciones (o mas, hasta 26 en LM Studio y sin limite practico en llama.cpp), respuestas si/no y puntuaciones calibradas.
- Clasificacion de texto con calibracion: el modelo emite probabilidades calibradas (ECE controlado) en lugar de texto libre.
- Lectura de log-probabilidades: basal-serve extrae las probabilidades de los codigos de opcion para producir decisiones deterministas.
- Soporte bilingue: polaco e ingles.
- Integracion con herramientas: Modelfile para Ollama, ficheros de decision para LM Studio (`/v1/systemone` y `/v1/decisions`), y exportacion de metadatos a GGUF mediante `basal-export-gguf`.
- Servidor propio (`basal-serve`) con modos `ollama`, `llamacpp` y `gguf` (en proceso con llama-cpp-python).
- Capacidad de servir clientes concurrentes mediante `--http-parallel N` junto con `OLLAMA_NUM_PARALLEL` o `llama-server -np`.
- Generacion de texto libre limitada: un `ollama run` directo produce texto, pero las respuestas tipadas requieren basal-serve.

## Casos de uso

- Clasificacion de tickets de soporte: el modelo puede asignar cada ticket a una de hasta 10 categorias predefinidas, usando las probabilidades calibradas para priorizar revisiones humanas en casos de baja confianza. Es adecuado porque la calibracion ECE esta controlada y la decision es determinista.
- Enrutamiento de consultas en un chatbot: dado un mensaje de usuario en polaco o ingles, decidir entre opciones como "facturacion", "soporte tecnico" o "ventas" mediante el modo si/no o eleccion multiple de basal-serve.
- Moderacion de contenido binaria: aplicar decisiones si/no calibradas para marcar textos que requieran revision, aprovechando que el modelo lee log-probabilidades en lugar de generar texto libre.
- Puntuacion de relevancia en busqueda: usar la salida de puntuacion del modelo para ordenar documentos o respuestas candidatas en un pipeline de recuperacion, con umbrales derivados de la calibracion.
- Automatizacion de decisiones en formularios: evaluar respuestas de encuestas o formularios y decidir entre opciones predefinidas, ejecutando el modelo en local con Ollama en un portatil.
- Prototipado de agentes de decision en local: integrar basal-serve con llama.cpp (`-c 32768`) para procesar documentos largos y emitir decisiones estructuradas sin depender de la nube.
- Evaluacion de modelos en investigacion: usar el modelo como referencia de decision calibrada para comparar el comportamiento de otras cuantizaciones o modelos, gracias a los ficheros de calibracion incluidos.

## Benchmarks y rendimiento

Los datos disponibles son comprobaciones de acuerdo entre la version GGUF y el modelo bf16 sobre el conjunto dev v2 (1.700 decisiones en las filas MLX; el resto segun se indica). No son benchmarks de tareas estandar como MMLU o HumanEval.

| Metrica | Q8_0 | Q5_K_M | Umbral |
|---|---|---|---|
| Acuerdo con bf16 (opciones 2-10) | 0,9839 | 0,9569 | >= 0,9415 |
| Acuerdo con margen >= 0,2 | 0,9988 | 0,9920 | >= 0,9863 |
| Diferencia de exactitud | +0,0002 | -0,0039 | <= 1 punto |
| Diferencia de ECE | +0,0035 | +0,0040 | <= +0,01 |
| Tamano | 4,8 GB | 3,2 GB | - |
| Velocidad | no medida en esta release | no medida en esta release | - |
| Veredicto | PASS | PASS | - |

Para referencia, la version FP8 reporta 38,6 decisiones/s con concurrencia 16 y latencia p50 de 29 ms en H100, y la version MLX 8-bit reporta 278 ms p50 con concurrencia 1 en Mac. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5 GB para Q8_0 y 3,5 GB para Q5_K_M, mas overhead del servidor y del contexto.
- GPU recomendadas: no se especifican en la informacion; el modelo esta pensado para desktops y laptops. Las versiones FP8 y MLX se han probado en H100 y Mac respectivamente.
- Cabe en GPU consumer: si, en tarjetas con 6-8 GB o mas de VRAM para Q8_0, y en equipos con 4 GB o mas para Q5_K_M.
- Opciones de despliegue: Ollama 0.12.11 o superior, llama.cpp (`llama-server`), LM Studio 0.4.26 o superior (canal beta, motor llama.cpp 2.65.1+, no el motor MLX), y basal-serve en modos `ollama`, `llamacpp` o `gguf` (con llama-cpp-python).
- Latencia y throughput: no medidos en esta release. El autor indica que GGUF es la via lenta para lotes y que esta orientado a desktops y laptops, no a servidores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| basal-2.0-4.5B-GGUF | 4,5B | 4.096 en Ollama; configurable en llama.cpp | Decision tipada y calibrada | Apache 2.0 | GGUF en Hugging Face |
| basal-2.0-4.5B (bf16) | 4,5B | no disponible | Decision tipada y calibrada | Apache 2.0 | Peso completo en Hugging Face |
| basal-2.0-4.5B-FP8 | 4,5B | no disponible | Decision tipada y calibrada | Apache 2.0 | FP8 en Hugging Face |
| basal-2.0-4.5B-MLX-8bit | 4,5B | no disponible | Decision tipada y calibrada | Apache 2.0 | MLX en Hugging Face |
| speakleash/Bielik-4.5B-v3.0-Instruct | 4,5B | no disponible | Modelo instructivo general | no disponible | Hugging Face |

No se dispone de datos de benchmarks estandar para comparar con modelos de la misma categoria fuera de la familia basal.

## Limitaciones y advertencias

- El modelo no esta pensado para generacion de texto libre de alta calidad; las respuestas tipadas requieren basal-serve, y un `ollama run` directo solo produce texto.
- En modo Ollama el contexto se limita a 4.096 tokens por prompt; los estados mas largos se truncan por el medio (`usage.truncated`). Para documentos largos hay que usar llama.cpp con `-c 32768` o el modo `gguf`.
- Ollama devuelve como maximo 20 log-probabilidades por posicion, por lo que las preguntas con mas de 20 opciones requieren llama.cpp.
- LM Studio termina las peticiones a los 30 s, por lo que documentos muy largos deben dividirse.
- El soporte linguistico se limita a polaco e ingles; no se garantiza un rendimiento adecuado en castellano.
- No se han publicado datos sobre sesgos, riesgo de alucinacion en generacion libre ni evaluaciones de seguridad en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Bielik puede tener condiciones adicionales que conviene revisar.
- La velocidad no se ha medido en esta release; GGUF es la via lenta para lotes y no se recomienda para servidores de alto rendimiento.
- La version de LM Studio necesaria estaba en canal beta en el momento de la publicacion, lo que implica riesgo de inestabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Remek/basal-2.0-4.5B-GGUF
- Modelo base bf16: https://huggingface.co/Remek/basal-2.0-4.5B
- Version FP8: https://huggingface.co/Remek/basal-2.0-4.5B-FP8
- Version MLX 8-bit: https://huggingface.co/Remek/basal-2.0-4.5B-MLX-8bit
- Coleccion basal-2.0: https://huggingface.co/collections/Remek/basal-20-6acd1712a8e443c86cd576fc
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Documentacion de imagenes y audio (basal-omni): https://github.com/rkinas/basal#images-and-audio-basal-omni-experimental
- Sitio web: https://basal.si5.pl/
- Modelo base Bielik: https://huggingface.co/speakleash/Bielik-4.5B-v3.0-Instruct
