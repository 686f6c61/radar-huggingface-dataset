# sibitim/supertonic-3-fp16

## Resumen

Supertonic 3 (fp16) es una conversión a media precisión del modelo de síntesis de voz Supertone/supertonic-3, publicada por el usuario sibitim en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una redistribución optimizada del modelo original: los cuatro ficheros ONNX que componen el sistema TTS se han convertido de fp32 a fp16 mediante `onnxconverter-common`, manteniendo entradas y salidas en float32 y sin tocar los operadores `Cast`. El objetivo declarado es reducir a la mitad la descarga en navegador, de 398 MB a 200 MB, para su uso en la aplicación TakeOne como voces de personajes ejecutadas en el cliente.

El modelo resuelve el problema de despliegue de TTS en entornos con ancho de banda limitado o en el navegador, donde el peso de los pesos es crítico. Al estar en formato ONNX, es portable a múltiples runtimes (ONNX Runtime, WebGPU, etc.) y adecuado para inferencia en el borde. La relevancia actual radica en la creciente demanda de síntesis de voz local y de baja latencia, sin depender de APIs en la nube.

La información disponible es limitada: el repositorio tiene 0,2 GB, no registra descargas ni likes, y la model card no detalla arquitectura interna, número de parámetros, contexto ni idiomas soportados. Esta ficha se limita a los datos verificables en la información proporcionada y marca explícitamente como "no disponible" todo lo que no consta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS basado en ONNX; arquitectura interna no especificada) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp16 (conversión desde fp32; entradas/salidas en float32) |
| Idiomas soportados | no disponible |
| Licencia | openrail (BigScience OpenRAIL-M, con restricciones de uso) |
| Formato de pesos | ONNX (4 ficheros `onnx/*.onnx`), más `tts.json`, `unicode_indexer.json` y `voice_styles/F1.json` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo original Supertone/supertonic-3: la model card no describe si se trata de un transformer, un modelo difusor, un sistema basado en flow-matching o una combinación. Lo que sí se detalla es el proceso de conversión: los cuatro modelos ONNX del repositorio original (commit `3cadd1ee6394adea1bd021217a0e650ede09a323`) se convirtieron de fp32 a fp16 con la herramienta `converte.py` basada en `onnxconverter-common`, manteniendo las entradas y salidas en float32 y sin modificar los operadores `Cast`. Los ficheros `onnx/tts.json`, `onnx/unicode_indexer.json` y `voice_styles/F1.json` son copias sin cambios del original.

No consta información sobre datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. El único dato técnico verificable es la reducción de tamaño: de 398 MB a 200 MB gracias a la conversión a media precisión, lo que sugiere que el modelo original ocupa aproximadamente el doble en fp32.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada, en formato ONNX.
- Conversión a fp16 para reducir el peso del modelo a la mitad, manteniendo compatibilidad con entradas y salidas en float32.
- Incluye un fichero de estilos de voz (`voice_styles/F1.json`), lo que sugiere soporte de al menos un estilo de voz predefinido.
- Ejecutable en navegador mediante ONNX Runtime o runtimes compatibles (el caso de uso declarado es TakeOne para voces de personajes en el cliente).
- No consta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- No se documentan modos especiales como thinking mode.

## Casos de uso

- Voces de personajes en aplicaciones web: el modelo puede ejecutarse en el navegador gracias a su formato ONNX y su tamaño reducido (200 MB), lo que permite generar voces de personajes sin enviar texto a un servidor. Es el caso de uso declarado por el autor (TakeOne).
- Asistentes de voz locales en el borde: al ser un modelo ONNX de 200 MB, puede desplegarse en dispositivos con recursos limitados (Raspberry Pi, móviles, navegadores) para lectura de texto o notificaciones habladas, evitando dependencias de la nube.
- Accesibilidad web: lectores de pantalla o herramientas de accesibilidad que necesiten síntesis de voz en el cliente, con la ventaja de que la descarga inicial se reduce a la mitad respecto al modelo fp32.
- Prototipado rápido de TTS: investigadores que quieran probar el modelo original sin descargar 398 MB pueden usar esta versión fp16 como sustituto ligero, manteniendo la misma interfaz de ficheros JSON.
- Aplicaciones de kiosco o señalización digital: generación de avisos hablados en dispositivos con almacenamiento limitado, donde el ahorro de 198 MB es relevante.
- Integración en pipelines de CI/CD para pruebas de TTS: al ser un artefacto más pequeño, facilita el almacenamiento en caché y la descarga en entornos de integración continua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo pesa 0,2 GB en disco (fp16), por lo que la huella en memoria es previsiblemente baja, pero no se documenta.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU consumer? No se especifica, pero por tamaño (200 MB) es plausible que quepa en cualquier GPU consumer; no obstante, no hay confirmación en la información proporcionada.
- Opciones de despliegue: ONNX Runtime (incluido WebGPU/WebAssembly para navegador), y cualquier runtime compatible con ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS ONNX).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sibitim/supertonic-3-fp16 | no disponible | no disponible | ONNX fp16 | OpenRAIL-M | Hugging Face (0 descargas) |
| Supertone/supertonic-3 (original) | no disponible | no disponible | ONNX fp32 | OpenRAIL-M | Hugging Face |
| Otros TTS ONNX | no disponible | no disponible | ONNX | variable | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de parámetros para establecer una comparación cuantitativa con alternativas. La comparación principal es con el modelo original, del que se diferencia únicamente por la precisión (fp16 frente a fp32) y el tamaño (200 MB frente a 398 MB).

## Limitaciones y advertencias

- Modelo derivado: los ficheros han sido modificados respecto al original; no es un modelo oficial de Supertone.
- La conversión a fp16 puede introducir degradación numérica en la calidad del audio; no se documenta ninguna evaluación de calidad tras la conversión.
- Licencia OpenRAIL-M con restricciones de uso: incluye cláusulas de uso aceptable que limitan ciertos usos (por ejemplo, suplantación, desinformación). Es responsabilidad del usuario revisar el fichero `LICENSE`.
- El audio generado es sintético y debe divulgarse como tal, según indica la model card.
- No se especifican idiomas soportados, sesgos conocidos ni riesgos de alucinación (en TTS, el equivalente sería pronunciación incorrecta o artefactos).
- El repositorio no registra descargas ni validación comunitaria (0 descargas, 0 likes), lo que reduce la confianza en su robustez para producción.
- No hay información sobre contexto máximo de texto de entrada ni sobre latencia, lo que impide evaluar su idoneidad para tiempo real.
- El autor original del modelo base no ha validado esta conversión; para producción se recomienda evaluar el modelo original fp32 como referencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sibitim/supertonic-3-fp16
- Modelo base: https://huggingface.co/Supertone/supertonic-3
- Commit del modelo base: `3cadd1ee6394adea1bd021217a0e650ede09a323`
- Aplicación TakeOne (declarada por el autor): https://claude.ai/artifact/35FZ8GTLrmGhWHhga4Tg8r
- Licencia OpenRAIL-M: incluida en el repositorio como `LICENSE`
