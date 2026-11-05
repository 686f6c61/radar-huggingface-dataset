# novainspireofficial/ilda-voice

## Resumen

ilda-voice es un paquete de pesos en formato ONNX del modelo de síntesis de voz Pocket TTS de Kyutai, convertidos y publicados por novainspireofficial para su uso en la aplicación móvil ilda, que ejecuta la síntesis de voz de forma totalmente offline en Android mediante ONNX Runtime. No se trata de un modelo entrenado por el publicador, sino de una redistribución de los pesos originales de Kyutai en un formato adecuado para inferencia en dispositivo.

El modelo resuelve el problema de la síntesis de voz en inglés sin conexión en teléfonos: Pocket TTS es un sistema de text-to-speech compacto que combina un modelo de lenguaje de flujo (flow matching) con el códec neuronal Mimi de Kyutai para generar audio a 24 kHz. La conversión a ONNX permite ejecutar el pipeline completo (tokenizador SentencePiece, condicionador de texto, LM, cabeza de flow matching y decodificador Mimi) en ONNX Runtime en Android.

La relevancia de esta ficha es limitada: el repositorio tiene 0 descargas y 0 likes, fue creado en noviembre de 2026 y su tamaño es de 0,1 GB. La información técnica disponible es escasa y proviene casi exclusivamente de la model card, que describe los ficheros incluidos pero no ofrece detalles sobre arquitectura interna, número de parámetros ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pocket TTS (Kyutai): LM de flow matching con decodificador Mimi; exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (la cache del LM se exporta con longitud abierta) |
| Tipos de cuantizacion | no disponible (solo se documenta el formato ONNX) |
| Idiomas soportados | en (ingles) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (text_conditioner.onnx, flow_lm_main.onnx, flow_lm_flow.onnx, mimi_decoder.onnx) + tokenizer.model (SentencePiece) + bundle.json |

## Arquitectura y entrenamiento

Segun la model card, el paquete contiene los ficheros de Pocket TTS de Kyutai (variante en ingles) exportados a ONNX para ONNX Runtime en Android. El pipeline se descompone en cuatro etapas: `text_conditioner.onnx` convierte texto en embeddings; `flow_lm_main.onnx` es el modelo de lenguaje, exportado con la longitud de cache abierta; `flow_lm_flow.onnx` es la cabeza de flow matching; y `mimi_decoder.onnx` es el decodificador del códec Mimi, que transforma latentes en audio a 24 kHz. Se incluye además el tokenizador SentencePiece (`tokenizer.model`) y un `bundle.json` con manifiestos de estado y ajustes.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. La model card indica que los pesos son los originales de Kyutai convertidos a ONNX, con el único cambio de formato (y la longitud de cache del LM dejada abierta). La exportación se basa en el exportador ONNX de Pocket TTS de KevinAHM, bajo licencia Apache 2.0.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto de entrada.
- Generación de audio a 24 kHz mediante el decodificador Mimi.
- Ejecución offline en dispositivo (Android) mediante ONNX Runtime.
- Inferencia con cache de longitud abierta en el modelo de lenguaje, lo que permite secuencias de longitud variable.
- Tokenización de texto con SentencePiece.
- No se documentan capacidades de clonación de voz, control de estilo, multilingüismo, tool calling ni razonamiento multi-paso.

## Casos de uso

- Lectura de textos en voz alta en la aplicación ilda: el paquete está pensado exactamente para que la app descargue los pesos y sintetice voz en el teléfono sin conexión, usando el pipeline ONNX completo.
- Accesibilidad para personas con discapacidad visual: integración en aplicaciones Android que necesiten leer contenido en inglés de forma local, sin depender de servicios en la nube.
- Asistentes de voz embebidos: el modelo puede alimentar respuestas habladas en inglés dentro de una app móvil, con la ventaja de que todo el procesamiento ocurre en el dispositivo.
- Prototipado de TTS en Android: sirve como referencia para desarrolladores que quieran integrar Pocket TTS vía ONNX Runtime y evaluar el rendimiento en hardware móvil.
- Aplicaciones de lectura de noticias o libros en inglés: síntesis de párrafos largos con el LM de cache abierta, adecuada para contenido textual extenso.
- Sistemas de navegación o avisos por voz offline: generación de locuciones cortas en inglés sin latencia de red, útil en entornos con conectividad limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,1 GB, lo que sugiere un modelo muy compacto, pero no se especifica el número de parámetros ni el consumo de memoria en ejecución.
- GPU recomendadas: no disponible. El destino declarado es Android con ONNX Runtime, no GPU de servidor.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ONNX Runtime (Android); el pipeline está diseñado para ejecutarse en dispositivo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ilda-voice (Pocket TTS ONNX) | no disponible | no disponible | en | CC BY 4.0 | ONNX | Pesos de Kyutai convertidos para Android |
| Pocket TTS (Kyutai, original) | no disponible | no disponible | en | CC BY 4.0 | pesos originales | Fuente de los pesos; repo en GitHub |
| Exportador ONNX de KevinAHM | no disponible | no disponible | en | Apache 2.0 | ONNX | Herramienta de conversion, no modelo |

No se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas como Piper, Coqui TTS o VITS. La comparativa se limita a licencia, formato y disponibilidad.

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan otros idiomas.
- No hay información sobre sesgos, calidad de voz ni comportamiento en dominios específicos.
- Riesgo de alucinación no aplicable en el sentido habitual, pero no se documenta la fidelidad de la pronunciación ni el manejo de texto fuera de dominio.
- Restricción explícita de Kyutai: sus términos prohíben usar Pocket TTS para imitar la voz de una persona real sin su consentimiento.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero debe respetarse la atribución a Kyutai y al exportador original.
- El repositorio tiene 0 descargas y 0 likes, y fue creado recientemente; no hay evidencia de uso en producción ni validación comunitaria.
- No se documentan cuantizaciones, por lo que el tamaño real en memoria y el rendimiento en dispositivos de gama baja son desconocidos.
- Al ser una conversión de formato, cualquier limitación del Pocket TTS original se hereda sin cambios.

## Enlaces

- HuggingFace: https://huggingface.co/novainspireofficial/ilda-voice
- Pocket TTS de Kyutai (GitHub): https://github.com/kyutai-labs/pocket-tts
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Exportador ONNX de KevinAHM: no se proporciona URL directa en la informacion disponible.
