# prabanta-dev/whisper-small-JNS

## Resumen

whisper-small-JNS es una conversión de pesos del modelo openai/whisper-small al formato JNS, el formato propietario del motor de inferencia Janas-LLM, desarrollado por prabanta-dev. No se trata de un modelo nuevo ni de un fine-tuning: es el mismo checkpoint de Whisper small que publicó OpenAI, reescrito en el orden de tensores que espera el motor Janas y con el tokenizador y los filtros mel preservados. El objetivo es permitir la transcripción y traducción de voz en local, sin nube, tanto en CPU como en GPU, sobre hardware de consumo.

La relevancia de esta ficha es limitada y conviene ser explícito: el repositorio no aporta mejoras de rendimiento, ni datos de entrenamiento adicionales, ni benchmarks propios. Su valor reside en la portabilidad hacia un runtime concreto (Janas-LLM, escrito en C) y en la verificación de equivalencia numérica que declara el autor: los logits de cada token coinciden con whisper.cpp sobre los mismos pesos con un coseno medio de 1.000000. Es, por tanto, un artefacto de despliegue, no un avance de modelado.

El modelo hereda las características de Whisper small: arquitectura transformer encoder-decoder, aproximadamente 244 millones de parámetros, ventana de audio de 30 segundos procesada en segmentos y licencia Apache 2.0. El repositorio ocupa 0,5 GB y contiene un único fichero de pesos de 0,49 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper, OpenAI) |
| Parametros totales | Aproximadamente 244 millones (heredados de whisper-small; no confirmado en la informacion proporcionada) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Ventana de audio de 30 segundos por segmento (caracteristica de Whisper; no detallada en la model card) |
| Tipos de cuantizacion | Ninguna: matrices en media precision (fp16), sin cuantizar |
| Idiomas soportados | No disponible en la informacion proporcionada (Whisper small multilingue por herencia, sin listado explicito) |
| Licencia | Apache 2.0 |
| Formato de pesos | JNS (formato propietario de Janas-LLM); convertido desde safetensors de openai/whisper-small |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper small de OpenAI: un transformer encoder-decoder con atención multi-cabeza, entrenado originalmente por OpenAI sobre pares audio-transcripción a gran escala y descrito en el paper arXiv:2212.04356. El encoder procesa espectrogramas mel de 30 segundos y el decoder genera tokens de texto de forma autorregresiva, con tokens especiales para tarea (transcripción o traducción) e idioma.

Esta conversión concreta no implica reentrenamiento, ajuste fino ni cuantización. Según la model card, las matrices se mantienen en media precision tal como las publicó OpenAI y se reescriben con la herramienta `hf2jns_whisper` en el orden que lee Janas-LLM, arrastrando también el tokenizador y los filtros mel. El autor afirma que dos conversiones producen los mismos bytes y que la salida coincide con whisper.cpp sobre los mismos pesos con un coseno medio de 1.000000 en los logits de cada token. No se documentan datos de entrenamiento adicionales, RLHF ni DPO.

## Capacidades

- Reconocimiento automático de voz (ASR): transcripción de audio a texto mediante el endpoint `/v1/audio/transcriptions` del servidor Janas.
- Traducción de voz a texto en inglés: endpoint `/v1/audio/translations`, capacidad heredada de Whisper.
- Inferencia local sin nube: el motor Janas-LLM está escrito en C y funciona en CPU y GPU.
- Ejecución en CPU: etiqueta `cpu-inference` en el repositorio, orientada a equipos sin acelerador dedicado.
- Compatibilidad con la aplicación de escritorio Brebus, que entrega el modelo a su servidor si está en la carpeta de modelos.
- Verificación de integridad: descarga mediante `janas-get` con comprobación SHA-256.
- No se documentan tool calling, capacidades de agente, modo thinking, visión ni audio en tiempo real más allá del pipeline ASR.

## Casos de uso

- Dictado local en el puesto de trabajo: el modelo transcribe voz a texto en el propio equipo mediante Janas-LLM, sin enviar audio a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad o sin conectividad.
- Subtitulado de reuniones y clases grabadas: al procesar segmentos de 30 segundos y ejecutarse en CPU, puede integrarse en un script que recorra un fichero de audio y genere un transcript con marcas temporales.
- Traducción de audio a inglés: usando el endpoint `/v1/audio/translations`, sirve para convertir notas de voz o entrevistas en otro idioma a texto en inglés dentro de un flujo local.
- Prototipado de aplicaciones de voz: al exponer una API compatible con `/v1/audio/transcriptions`, permite sustituir un servicio en la nube por un servidor Janas local durante el desarrollo.
- Transcripción en equipos de gama baja: el tamaño de 0,49 GB y la ejecución en CPU permiten desplegarlo en portátiles sin GPU dedicada para tareas de dictado no críticas.
- Archivado y búsqueda de contenido hablado: transcribir grabaciones históricas en local para indexarlas y hacerlas buscables sin depender de terceros.
- Verificación de pipelines ASR: al declarar equivalencia numérica con whisper.cpp, puede usarse para comparar la salida de ambos motores sobre los mismos pesos en tareas de validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la equivalencia numérica con whisper.cpp (coseno medio de 1.000000 en los logits por token), que es una comprobación de fidelidad de la conversión, no una métrica de calidad ASR (WER, BLEU u otras).

## Requisitos de hardware

- VRAM estimada: el fichero de pesos ocupa 0,49 GB en fp16; la memoria adicional para activaciones y buffers del decoder es reducida, aunque no se documenta una cifra exacta.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, cualquier GPU con al menos 2 GB de memoria libre debería alojar los pesos.
- GPU de consumo: el modelo cabe holgadamente en tarjetas de consumo (por ejemplo, RTX 3060, RTX 4060 o superiores) e incluso en iGPU con memoria compartida, aunque no hay datos de rendimiento publicados.
- CPU: el repositorio está etiquetado explícitamente para inferencia en CPU, que es su escenario principal según la model card.
- Opciones de despliegue: exclusivamente Janas-LLM (`janas-get` para descarga y `janas-server` para servir los endpoints de audio); también a través de la aplicación Brebus. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato JNS solo lo lee Janas-LLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Runtime |
|---|---|---|---|---|---|
| whisper-small-JNS | ~244 M (heredado) | 30 s de audio por segmento | JNS | Apache 2.0 | Janas-LLM |
| openai/whisper-small | ~244 M | 30 s de audio por segmento | safetensors | Apache 2.0 | Transformers, whisper.cpp, faster-whisper |
| whisper.cpp (pesos ggml de whisper-small) | ~244 M | 30 s de audio por segmento | GGML/GGUF | MIT (runtime) / Apache 2.0 (pesos) | whisper.cpp |
| faster-whisper (small) | ~244 M | 30 s de audio por segmento | CTranslate2 | Apache 2.0 | CTranslate2 |

La comparación relevante no es de calidad —los pesos son idénticos— sino de ecosistema: frente a whisper.cpp o faster-whisper, esta conversión solo es utilizable dentro de Janas-LLM, lo que limita su portabilidad pero ofrece una vía de despliegue en C con API compatible con los endpoints de audio de OpenAI.

## Limitaciones y advertencias

- No es un modelo nuevo: cualquier limitación de whisper-small (errores en audio con ruido, acentos marcados, jerga técnica, alucinaciones en silencios o música) se hereda sin cambios.
- El formato JNS es propietario de Janas-LLM; el modelo no se puede cargar con Transformers, llama.cpp, Ollama ni otras herramientas habituales.
- La model card no lista los idiomas soportados ni proporciona métricas de WER, por lo que la cobertura multilingüe debe validarse empíricamente antes de usarla en producción.
- Riesgo de alucinación: Whisper tiende a generar texto plausible en segmentos sin voz o con audio degradado; conviene aplicar detección de silencios y revisión humana en flujos críticos.
- Sesgos: no se documenta ningún análisis de sesgos demográficos, lingüísticos o de acento en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero exige conservar el aviso de licencia y la atribución a OpenAI como autor del modelo original.
- El repositorio registra 0 descargas y 0 likes, y no hay evidencia de mantenimiento o soporte por parte del autor; la fecha de creación indicada (2026-11-18) resulta anómala y conviene verificarla.
- El autor afirma equivalencia numérica con whisper.cpp, pero no se aportan scripts de reproducción ni resultados de terceros que la confirmen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/prabanta-dev/whisper-small-JNS
- Modelo base: https://huggingface.co/openai/whisper-small
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio de Janas (motor Janas-LLM): https://github.com/prabanta-dev/janas
- Releases de Janas-LLM: https://github.com/prabanta-dev/janas/releases
