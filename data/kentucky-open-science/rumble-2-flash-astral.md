# Kentucky-Open-Science/Rumble-2-Flash-Astral

## Resumen

Rumble-2-Flash-Astral es un paquete de pesos en formato GGUF publicado por Kentucky Open Science para el piloto de voz "Astral" en iOS. No se trata de un modelo entrenado desde cero, sino de un ensamblaje de tres ficheros GGUF procedentes de dos modelos upstream: Rumble 2 Flash (creado por Reson8, con cuantizacion AD-Q5_K_M y proyector de audio Q8_0 producidos por AtomicChat) para la transcripcion automatica del habla, y LFM2.5 1.2B Instruct (de Liquid AI) para la generacion de respuestas de texto. El conjunto suma 1.228.712.832 bytes (1,23 GB) y esta pensado para ejecutarse de forma totalmente offline sobre llama.cpp con soporte `libmtmd`.

El repositorio combina un reconocedor de voz y un modelo de lenguaje conversacional de 1.170.340.608 parametros en un unico flujo: el audio de entrada (16 kHz mono) se transcribe en el dispositivo, el modelo de chat genera una respuesta textual y el sintetizador de voz de Apple la reproduce en el idioma seleccionado. La relevancia actual reside en su enfoque de despliegue en el borde (edge): inferencia local en un dispositivo movil, sin conexion de red, con manifiesto de instalacion bajo demanda, verificacion de integridad por SHA-256 y un runtime fijado a una revision concreta de llama.cpp.

La ficha describe exclusivamente lo que consta en la model card y en los metadatos publicados. No se han divulgado resultados de benchmarks, detalles del dataset de entrenamiento ni especificaciones de contexto, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pesos GGUF para llama.cpp; reconocedor de voz con proyector de audio multimodal y modelo de lenguaje LFM2.5) |
| Parametros totales | 1.170.340.608 (1,17 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AD-Q5_K_M (reconocimiento), Q8_0 (proyector de audio), Q4_K_M (chat LFM2.5 1.2B Instruct) |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es |
| Licencia | component-licenses: Apache 2.0 (Rumble 2 Flash y proyector de audio) y LFM Open License (LFM2.5 1.2B Instruct) |
| Formato de pesos | GGUF (tres ficheros, 1,23 GB en total) |

## Arquitectura y entrenamiento

El paquete no documenta la arquitectura interna de los modelos que lo componen. Lo que si se detalla es la composicion del runtime: un modelo de reconocimiento automatico del habla (Rumble 2 Flash, cuantizado en AD-Q5_K_M) que se ejecuta con llama.cpp y `libmtmd`, un proyector de audio (Q8_0) que actua como adaptador multimodal entre el audio y el reconocedor, y un modelo de lenguaje generativo (LFM2.5 1.2B Instruct, Q4_K_M) que produce las respuestas de texto. La entrada de audio se especifica a 16 kHz mono y la salida de texto se emite por frases hacia el sintetizador de voz.

No consta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas de atencion o decodificacion de los modelos upstream. El unico detalle de ingenieria documentado es la fijacion del runtime a la revision `8af68d4` de llama.cpp, lo que garantiza reproducibilidad del entorno de inferencia. Kentucky Open Science declara haber ensamblado los tres ficheros upstream con sus contenidos originales y haber publicado checksums y ajustes de idioma para el piloto Astral.

## Capacidades

- Reconocimiento automatico del habla en el dispositivo a partir de audio de 16 kHz mono.
- Generacion de respuestas conversacionales de texto mediante LFM2.5 1.2B Instruct.
- Salida de voz en iOS mediante el sintetizador de Apple, con voces instaladas por idioma.
- Soporte multilingue en ocho idiomas: ingles, arabe, chino mandarin, frances, aleman, japones, coreano y espanol.
- Funcionamiento totalmente offline, sin dependencia de red una vez descargados los pesos.
- Instalacion bajo demanda mediante manifiesto (`astral-manifest.json`) con URL fijada a commit, verificacion de tamano en bytes y SHA-256 por fichero.
- Integracion con llama.cpp y `libmtmd` como runtime de inferencia.
- Tool calling, function calling, agentes multi-paso, vision, audio de entrada distinto del reconocimiento o modo thinking: no disponibles en la informacion publicada.

## Casos de uso

- Asistente de voz conversacional offline en iOS: el flujo completo (transcripcion, generacion y sintesis) se ejecuta en el dispositivo, lo que permite conversaciones por voz sin conexion en entornos con conectividad limitada o por requisitos de privacidad.
- Dictado y transcripcion local: el reconocedor Rumble 2 Flash procesa audio de 16 kHz mono y puede emplearse para transcribir notas de voz sin enviar datos a servidores externos.
- Atencion al usuario en movilidad sin red: al combinar reconocimiento y generacion de respuestas, el paquete puede gestionar interacciones de voz basicas en campo, transporte o zonas remotas.
- Traduccion oral asistida entre los ocho idiomas soportados: la transcripcion en un idioma y la generacion de respuesta en otro permiten construir flujos de interpretacion con sintesis de voz por idioma.
- Prototipado de interfaces de voz en el borde: el manifiesto con checksums y la revision fijada de llama.cpp facilitan la instalacion reproducible en pipelines de pruebas de aplicaciones moviles.
- Aplicaciones de accesibilidad: la salida por sintetizador de Apple con voces instaladas por idioma permite construir asistentes hablados para usuarios con dificultades de lectura o escritura.
- Distribucion controlada de modelos en apps: el uso de `model-hashes.json` y la instalacion por rutas relativas bajo `Documents/Models` encaja en estrategias de actualizacion y verificacion de integridad de pesos en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el paquete completo ocupa 1,23 GB en disco y esta cuantizado en Q5_K_M, Q8_0 y Q4_K_M, por lo que el peso en memoria es del orden de los 1,2 GB mas las estructuras de runtime.
- GPU recomendadas: no disponibles. El destino declarado es iOS con llama.cpp y `libmtmd`, es decir, inferencia en el propio dispositivo movil.
- Compatibilidad con GPU de consumo: no se documenta; el diseno apunta a ejecucion en el dispositivo (CPU/GPU integrada de iPhone) mas que a GPU de escritorio.
- Opciones de despliegue: llama.cpp (revision `8af68d4` o posterior compatible) con `libmtmd`; descarga mediante `hf download` o instalacion bajo demanda desde el manifiesto del release `v1.0`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Rumble-2-Flash-Astral | 1,17 B | no disponible | 8 | component-licenses (Apache 2.0 + LFM Open License) | GGUF | Paquete ASR + chat para iOS offline |
| LiquidAI/LFM2.5-1.2B-Instruct-GGUF | 1,2 B (aprox.) | no disponible | no disponible | LFM Open License | GGUF | Modelo upstream de chat incluido en el paquete |
| AtomicChat/Rumble-2-Flash-GGUF | no disponible | no disponible | no disponible | Apache 2.0 | GGUF | Modelo upstream de reconocimiento incluido en el paquete |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete no es un modelo unico: combina pesos de dos proyectos con licencias distintas (Apache 2.0 y LFM Open License); el uso comercial debe respetar los terminos de la LFM Open License para el componente de chat.
- La licencia publicada es "other" con nombre "component-licenses"; no es una licencia unica y requiere revisar los ficheros de licencia incluidos antes de redistribuir.
- La salida de voz depende de voces de Apple instaladas en el dispositivo; si falta una voz para el idioma seleccionado, la sintesis no funcionara hasta instalarla en Ajustes de Accesibilidad de iOS.
- El runtime esta fijado a una revision concreta de llama.cpp (`8af68d4`); actualizaciones del runtime pueden alterar el comportamiento y requieren validacion.
- No se documentan sesgos conocidos, tasas de alucinacion ni evaluaciones de calidad del reconocimiento o de la generacion.
- No se especifica la longitud de contexto del modelo de chat, lo que limita el diseno de conversaciones multi-turno largas.
- El ambito declarado es un piloto de voz en iOS; no consta validacion en otras plataformas ni en entornos de servidor.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia de uso en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Kentucky-Open-Science/Rumble-2-Flash-Astral
- Manifiesto de instalacion: https://huggingface.co/Kentucky-Open-Science/Rumble-2-Flash-Astral/blob/main/astral-manifest.json
- Checksums: https://huggingface.co/Kentucky-Open-Science/Rumble-2-Flash-Astral/blob/main/model-hashes.json
- Licencias del paquete: https://huggingface.co/Kentucky-Open-Science/Rumble-2-Flash-Astral/tree/main/licenses
- Modelo base de reconocimiento (AtomicChat): https://huggingface.co/AtomicChat/Rumble-2-Flash-GGUF/tree/d036f2af3cd5229375714d7f1749792cce3c6a88
- Modelo base de chat (Liquid AI): https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF/tree/8ed288026e23958ad9dfa92d53ed773a8eee7125
- Runtime llama.cpp (revision fijada): https://github.com/ggml-org/llama.cpp/tree/8af68d486a9473820d24d00af8f33334ca80124d
