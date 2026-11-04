# Q-P1NG/pocket-tts-onnx

## Resumen

Pocket TTS (ONNX) es un repositorio espejo que redistribuye dos exportaciones ONNX de comunidad del modelo de síntesis de voz Kyutai Pocket TTS, desarrollado originalmente por Kyutai (Manu Orsini, Simon Rouard, Gabriel De Marmiesse, Vaclav Volhejn, Neil Zeghidour y Alexandre Defossez). El repositorio no introduce modificaciones: mantiene copias byte a byte de las exportaciones de `lookbe/pocket-tts-onnx-v2` y `stephvax/pocket-tts-onnx`, con el objetivo de ofrecer al usuario de la aplicación Q-P1NG un punto de descarga estable para sus paquetes de voz opcionales.

La relevancia de este repositorio es logística más que técnica: al fijar revisiones concretas y verificar el SHA-256 de cada fichero antes de su uso, la aplicación evita que una actualización del repositorio original rompa la cadena de suministro de los paquetes de voz. El contenido incluye dos variantes arquitectónicas: una de seis capas (lookbe-v2, en inglés e italiano) y otra de 24 capas (stephvax, en italiano), lo que permite comparar calidad y coste computacional dentro del mismo pipeline.

El modelo subyacente es un sistema text-to-speech que combina un modelo de lenguaje (LM), un módulo de flow matching y un decodificador neuronal basado en Mimi, el códec de audio de Kyutai. Los pesos se distribuyen en formato ONNX con cuantización INT8 en el LM, el flow y el decodificador, mientras que el codificador de referencia y el acondicionador de texto se mantienen en FP32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS con LM autoregresivo + flow matching + decodificador neuronal Mimi (exportado a ONNX) |
| Parametros totales | no disponible (pesos distribuidos en ficheros ONNX; el LM principal INT8 ocupa 76,57 MB en la variante de 6 capas y 303,35 MB en la de 24 capas) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (LM, flow y decodificador); FP32 (codificador Mimi y acondicionador de texto) |
| Idiomas soportados | Ingles e italiano (segun las carpetas incluidas) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`.onnx`), mas tokenizador SentencePiece (`.model`) y arrays NumPy (`.npy`) |

## Arquitectura y entrenamiento

El sistema Pocket TTS de Kyutai se estructura en cuatro etapas encadenadas: un acondicionador de texto (`text_conditioner.onnx`, 16,39 MB) que procesa la entrada lingüística, un modelo de lenguaje principal (`flow_lm_main_int8.onnx`) que genera representaciones latentes, un módulo de flow matching (`flow_lm_flow_int8.onnx`, 10,06 MB) que refina dichas representaciones y un decodificador Mimi (`mimi_decoder_int8.onnx`, 22,67 MB) que convierte los latentes en audio. Adicionalmente se incluye un codificador Mimi (`mimi_encoder.onnx`, 39,28 MB) que presumiblemente se emplea para extraer embeddings de voz de referencia o para tareas de clonación.

La variante `lookbe-v2` emplea un LM de seis capas, mientras que la variante `stephvax/italian_24l` escala a 24 capas, multiplicando por cuatro el tamaño del LM principal (de 76,57 MB a 303,35 MB en INT8). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal; el interés técnico reside en la exportación ONNX con cuantización INT8 selectiva, que preserva en FP32 los módulos más sensibles a la precisión numérica (codificador y acondicionador de texto).

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en inglés e italiano.
- Generación de audio mediante decodificador neuronal Mimi, el códec de Kyutai.
- Posible clonación o condicionamiento por voz de referencia, dado que se incluye un codificador Mimi y un fichero `bos_before_voice.npy` que probablemente actúa como token de inicio antes del embedding de voz.
- Ejecución en formato ONNX, lo que permite inferencia en CPU y GPU a través de ONNX Runtime.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje general).
- No se documentan capacidades de visión ni de audio de entrada más allá del propio codificador Mimi.
- No se documenta modo "thinking" ni capacidades multilingües más allá del inglés e italiano incluidos.

## Casos de uso

- Lectura de artículos y documentos en inglés o italiano: el modelo convierte texto plano en audio mediante el pipeline ONNX, adecuado para integrarse en lectores de pantalla o aplicaciones de accesibilidad que necesiten ejecución local sin depender de servicios en la nube.
- Asistentes de voz embebidos: al distribuirse en ONNX con cuantización INT8 y un tamaño total de repositorio de 0,7 GB, puede desplegarse en dispositivos con recursos limitados para generar respuestas habladas en inglés o italiano.
- Generación de audiolibros y pódcasts: la variante de 24 capas (`stephvax/italian_24l`) ofrece mayor capacidad para italiano, lo que puede traducirse en una prosodia más natural en textos largos.
- Pruebas A/B de calidad TTS: al incluir dos variantes arquitectónicas (6 y 24 capas) del mismo pipeline, permite comparar fidelidad y coste computacional sin cambiar de framework.
- Integración en aplicaciones de escritorio con verificación de integridad: el repositorio incluye SHA-256 por fichero, lo que facilita pipelines de descarga seguros en aplicaciones cliente como Q-P1NG.
- Investigación en exportación ONNX de modelos TTS: sirve como referencia para estudiar cómo se comporta la cuantización INT8 selectiva (LM, flow y decodificador en INT8; codificador y acondicionador en FP32) en términos de calidad de audio.
- Prototipado de doblaje o locución automatizada en italiano: la variante de 24 capas está específicamente orientada a este idioma y puede emplearse para generar voces de prueba en producción de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, el conjunto de ficheros de la variante de 6 capas suma aproximadamente 170 MB en disco (sin contar el codificador Mimi de 39 MB ni el tokenizador), y la variante de 24 capas ronda los 440 MB; la VRAM necesaria para inferencia será del orden de esos pesos más los buffers de activación, por lo que previsiblemente cabe en GPUs de 2-4 GB.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) debería poder ejecutar el modelo; también es plausible la inferencia en CPU mediante ONNX Runtime.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el tamaño reducido de los pesos (0,7 GB de repositorio completo incluyendo ambas variantes y ambos idiomas).
- Opciones de despliegue: ONNX Runtime (CPU y GPU), integración directa en aplicaciones que carguen los ficheros `.onnx`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Pocket TTS (ONNX, este repo) | no disponible (LM INT8 de 76,57 MB o 303,35 MB) | no disponible | Ingles, italiano | CC-BY-4.0 | ONNX | HuggingFace |
| Kyutai Pocket TTS (original) | no disponible | no disponible | no disponible | no disponible | no disponible | GitHub / HuggingFace |
| lookbe/pocket-tts-onnx-v2 | no disponible | no disponible | Ingles, italiano | no disponible | ONNX | HuggingFace |
| stephvax/pocket-tts-onnx | no disponible | no disponible | Italiano | no disponible | ONNX | HuggingFace |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a aspectos de disponibilidad y formato.

## Limitaciones y advertencias

- El repositorio es un espejo sin modificaciones; cualquier error o limitación del modelo original de Kyutai se hereda íntegramente.
- Solo se incluyen inglés e italiano; no hay soporte documentado para castellano ni otros idiomas.
- No se documentan sesgos conocidos, pero al ser un modelo TTS entrenado con datos no especificados, puede reproducir sesgos de pronunciación o prosodia asociados a las voces de referencia.
- Riesgo de alucinación en el sentido de prosodia incorrecta, pronunciación errónea o artefactos de audio, especialmente en la variante de 6 capas y en textos fuera de dominio.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero se debe verificar la licencia del modelo base original de Kyutai, que no se detalla en la información proporcionada.
- La variante de 24 capas tiene un LM principal de 303,35 MB en INT8, cuatro veces mayor que la de 6 capas; el coste computacional y la latencia serán proporcionalmente superiores.
- El repositorio fija revisiones concretas de las exportaciones de terceros; si los repositorios originales se eliminan, este espejo sigue siendo la única fuente disponible.
- No se documenta el proceso de entrenamiento, por lo que no es posible evaluar la calidad objetiva del modelo más allá de pruebas subjetivas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Q-P1NG/pocket-tts-onnx
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Repositorio GitHub de Kyutai Pocket TTS: https://github.com/kyutai-labs/pocket-tts
- Exportación lookbe-v2: https://huggingface.co/lookbe/pocket-tts-onnx-v2
- Exportación stephvax: https://huggingface.co/stephvax/pocket-tts-onnx
