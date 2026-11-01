# abid1010/whisper-large-v3-turbo-ggml

## Resumen

Whisper large-v3-turbo en formato ggml es una conversión del modelo de reconocimiento automático del habla (ASR) Whisper large-v3-turbo de OpenAI, empaquetado por Georgi Gerganov para su uso con whisper.cpp. Este repositorio concreto (`abid1010/whisper-large-v3-turbo-ggml`) es un espejo sin modificaciones de dos cuantizaciones (q8_0 y q5_0) del repositorio oficial de whisper.cpp, mantenido por el autor para que la aplicación Android ASR-Translation descargue siempre los mismos ficheros byte a byte.

El modelo resuelve el problema de transcripción y traducción de audio a texto en local, sin depender de servicios en la nube, gracias al formato ggml optimizado para CPU y dispositivos de gama baja. La variante "turbo" de large-v3 reduce el número de capas del decoder respecto a large-v3, lo que disminuye la latencia de inferencia manteniendo una calidad cercana al modelo completo.

Es relevante porque permite desplegar ASR de alta calidad en entornos con recursos limitados (móviles, Raspberry Pi, portátiles sin GPU) usando cuantizaciones de 8 y 5 bits, y porque el repositorio actúa como espejo reproducible con hashes SHA-256 verificables, algo útil en pipelines de producción que requieren integridad de artefactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | no disponible (la model card no lo indica; large-v3-turbo ronda los 809 M según la documentación de OpenAI, dato no confirmado en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, según el diseño estándar de Whisper; no confirmado en la model card) |
| Tipos de cuantizacion | q8_0 y q5_0 (formato ggml) |
| Idiomas soportados | no disponible en la model card; Whisper large-v3 soporta multilingüe según OpenAI, pero el repositorio no lo declara |
| Licencia | MIT |
| Formato de pesos | ggml (ficheros `.bin`) |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper large-v3-turbo, un transformer encoder-decoder con atención multi-cabeza estándar. La variante "turbo" reduce el decoder a 4 capas (frente a las 32 de large-v3), lo que acelera la decodificación manteniendo el encoder completo. El entrenamiento original es el de OpenAI Whisper: datos de audio supervisados multilingües con tareas de transcripción, traducción y detección de idioma, aunque la model card de este repositorio no aporta detalles sobre el corpus, número de tokens ni si hubo RLHF o DPO.

La innovación relevante aquí no es arquitectónica sino de empaquetado: la conversión a ggml realizada por whisper.cpp permite ejecutar el modelo en CPU con cuantización de 8 y 5 bits, sin necesidad de GPU. El repositorio es un espejo byte-idéntico del original (commit `5359861c739e955e79d9a303bcbc70fb988958b1`), con hashes SHA-256 publicados para verificación de integridad.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto).
- Traducción de audio a texto (tag `asr-translation`).
- Ejecución en CPU mediante whisper.cpp, sin dependencia de GPU.
- Dos niveles de cuantización para ajustar tamaño y calidad (q8_0 y q5_0).
- Verificación de integridad mediante SHA-256 de cada fichero.
- No se documentan en la model card capacidades de tool calling, agentes, visión, audio adicional ni modo thinking.

## Casos de uso

- Transcripción local en aplicaciones Android: la app ASR-Translation descarga estos ficheros para transcribir audio en el dispositivo sin enviar datos a la nube, usando la cuantización q5_0 para reducir el consumo de almacenamiento y RAM.
- Subtitulado automático de vídeos en entornos sin GPU: con whisper.cpp y el fichero q8_0 se puede generar subtítulos en un portátil convencional, priorizando calidad sobre velocidad.
- Procesamiento por lotes de reuniones o entrevistas: integrado en un pipeline de scripts con whisper.cpp, permite transcribir horas de audio en CPU de forma desatendida.
- Prototipado de asistentes de voz en dispositivos embebidos: la cuantización q5_0 (menor tamaño) encaja en placas tipo Raspberry Pi para comandos de voz y dictado.
- Verificación de artefactos en CI/CD: los hashes SHA-256 publicados permiten comprobar que el binario descargado no ha sido alterado antes de desplegarlo.
- Traducción de audio a texto en aplicaciones de accesibilidad: el tag `asr-translation` indica soporte para convertir voz en texto traducido, útil en herramientas de subtitulado multilingüe (siempre que se confirme el par de idiomas en la práctica).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en formato ggml; el modelo se ejecuta en CPU. El tamaño del repo es de 1,4 GB para ambos ficheros combinados.
- GPU recomendadas: no es el objetivo del formato ggml; puede ejecutarse en CPU. No se documentan requisitos de GPU en la model card.
- ¿Cabe en consumer GPU? No disponible; el formato está pensado para CPU.
- Opciones de despliegue: whisper.cpp (formato nativo ggml). No se documenta compatibilidad con vLLM, TGI, Ollama o llama.cpp en la model card.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-large-v3-turbo-ggml (este repo) | no disponible | no disponible | ggml (q8_0, q5_0) | MIT | HuggingFace, espejo de whisper.cpp |
| Whisper large-v3-turbo (OpenAI) | no disponible en la información | no disponible | safetensors/PyTorch (original) | MIT | HuggingFace (openai/whisper-large-v3-turbo) |
| Whisper large-v3 (OpenAI) | no disponible en la información | no disponible | safetensors/PyTorch | MIT | HuggingFace |
| whisper.cpp (ggerganov) | no disponible | no disponible | ggml (múltiples cuantizaciones) | MIT | GitHub, HuggingFace |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- El repositorio es un espejo sin modificaciones; cualquier limitación del modelo original de OpenAI aplica igualmente aquí.
- No se documentan sesgos conocidos en la model card; se remite al modelo original.
- Riesgo de alucinación inherente a los modelos ASR de Whisper, especialmente en audio con ruido o silencios largos (no confirmado explícitamente en la model card).
- Idiomas soportados no declarados en el repositorio; aunque Whisper large-v3 es multilingüe, conviene verificar el comportamiento en el idioma objetivo.
- Licencia MIT, lo que permite uso comercial, pero se recomienda revisar la licencia del modelo original de OpenAI para confirmar condiciones.
- Solo se ofrecen dos cuantizaciones (q8_0 y q5_0); no hay versiones q4, q3 ni f16 en este repositorio.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de uso en producción ni validación comunitaria.
- Formato ggml exclusivo para whisper.cpp; no es directamente cargable en frameworks como PyTorch, Transformers o vLLM.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/abid1010/whisper-large-v3-turbo-ggml
- Repositorio original de whisper.cpp en HuggingFace: https://huggingface.co/ggerganov/whisper.cpp
- Commit de referencia: `5359861c739e955e79d9a303bcbc70fb988958b1`
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo (no citado en la model card, pero es la fuente del modelo base)
- Repositorio whisper.cpp en GitHub: https://github.com/ggerganov/whisper.cpp (no citado en la model card, pero es el proyecto que genera el formato)
