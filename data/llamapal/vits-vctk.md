# LlamaPal/vits-vctk

## Resumen

VITS-VCTK es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por el equipo de k2-fsa y entrenado sobre el corpus CSTR VCTK. El repositorio `LlamaPal/vits-vctk` no es un entrenamiento propio, sino un espejo sin modificaciones de los ficheros publicados en `csukuangfj/vits-vctk` (commit `5d7d647d6ea0`), empaquetados en formato ONNX cuantizado a int8 para su uso en dispositivos móviles.

El modelo resuelve el problema de la síntesis de voz offline en Android: los ficheros están pensados para ejecutarse a través de sherpa-onnx dentro de la aplicación LlamaPal, sin conexión a internet y sin enviar datos fuera del dispositivo. El artefacto principal pesa 39 MB (`vits-vctk.int8.onnx`), acompañado de un léxico de 4 MB y un fichero de tokens de 1 KB.

Su relevancia es acotada pero concreta: es un componente de infraestructura para aplicaciones de voz on-device, no un modelo de propósito general. La licencia Apache 2.0 y el formato ONNX lo hacen directamente integrable en pipelines móviles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, generativa adversarial con decoder basado en HiFi-GAN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (fichero `vits-vctk.int8.onnx`) |
| Idiomas soportados | no disponible en la informacion proporcionada (el corpus VCTK es mayoritariamente ingles con acentos multiples) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (int8), con `lexicon.txt` y `tokens.txt` |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un encoder de texto, un predictor de duración, un flujo normalizador variacional y un decoder generativo inspirado en HiFi-GAN, entrenado de forma adversarial junto con un discriminador. El modelo original de k2-fsa fue entrenado sobre el corpus CSTR VCTK, un conjunto de voces multi-hablante en inglés con diversos acentos. No se dispone en la información proporcionada del número de tokens, composición exacta del dataset ni detalles de fases de ajuste fino (RLHF/DPO no aplican a TTS).

La innovación relevante en este repositorio no es arquitectónica sino de despliegue: la exportación a ONNX con cuantización int8 reduce el modelo a 39 MB, lo que permite inferencia en CPU de dispositivos Android mediante sherpa-onnx. El léxico y el fichero de tokens acompañan al grafo ONNX para la tokenización fonética en tiempo de ejecución.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada, con salida de audio.
- Ejecución completamente offline en dispositivo, sin llamadas a servicios remotos.
- Soporte multi-hablante heredado del corpus VCTK (voces y acentos múltiples en inglés).
- Integración con sherpa-onnx para inferencia en Android.
- Cuantización int8 para reducir huella de memoria y latencia en móvil.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- **Lectura de respuestas de un asistente conversacional en Android**: la app LlamaPal usa este modelo para vocalizar las respuestas de un LLM local; el tamaño de 39 MB y la inferencia int8 permiten reproducir audio sin salir del dispositivo.
- **Accesibilidad para personas con discapacidad visual**: integración en aplicaciones móviles que leen contenido de pantalla en voz alta de forma offline, sin depender de conectividad ni de servicios cloud.
- **Navegación por voz en entornos sin red**: aplicaciones de campo, transporte o industria donde no hay cobertura y se requiere feedback hablado.
- **Prototipado de interfaces de voz on-device**: desarrolladores que necesitan un TTS ligero para validar flujos de voice UI en Android antes de invertir en modelos mayores.
- **Sistemas de aviso locales**: notificaciones habladas en dispositivos empotrados o móviles con requisitos de privacidad estrictos (nada sale del dispositivo).
- **Pruebas de pipelines sherpa-onnx**: sirve como referencia para verificar la integración de TTS en la cadena sherpa-onnx antes de desplegar modelos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso objetivo (inferencia en CPU móvil); el fichero ONNX int8 ocupa 39 MB en disco y una huella de memoria del orden de decenas de MB durante la inferencia.
- GPU recomendadas: no requeridas; el modelo está pensado para CPU de Android. En escritorio puede ejecutarse en CPU sin GPU.
- Cabe en GPU consumer: sí, cualquier GPU consumer puede ejecutarlo, aunque no es el escenario de diseño.
- Opciones de despliegue: sherpa-onnx (objetivo principal), ONNX Runtime. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamano | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| VITS-VCTK (este repo) | VITS | 39 MB (int8) | ONNX | Apache 2.0 | TTS offline Android |
| csukuangfj/vits-vctk (original) | VITS | no disponible | ONNX / otros | Apache 2.0 | TTS multi-hablante |
| Piper (rhasspy) | VITS | variable por voz | ONNX | MIT / varias | TTS offline embebido |
| Coqui TTS (XTTS) | GPT-based TTS | cientos de MB | PyTorch | MPL 2.0 / Coqui CPML | TTS multilingue con clonación |

La comparativa con Piper y XTTS es orientativa: este repositorio es un espejo de un modelo concreto, no una familia de modelos. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Es un espejo sin modificaciones: no hay entrenamiento propio ni mejoras respecto al original de k2-fsa.
- El corpus VCTK es mayoritariamente inglés; el soporte de otros idiomas no está confirmado en la información disponible.
- No es un modelo de lenguaje: no genera texto, no razona ni soporta tool calling.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí puede producir prosodia incorrecta o pronunciaciones erróneas en palabras fuera del léxico.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar los términos del repositorio original y del corpus VCTK.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.
- Dependencia de sherpa-onnx y del léxico/tokens incluidos; cambios en esas versiones pueden romper la integración.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LlamaPal/vits-vctk
- Repositorio original: https://huggingface.co/csukuangfj/vits-vctk
- Commit espejo: https://huggingface.co/csukuangfj/vits-vctk/tree/5d7d647d6ea0f6206544735d74b25d3877c0f9ca
- App LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Sitio web LlamaPal: https://llamapal.cc/
- Instagram LlamaPal: https://www.instagram.com/llamapalhq/
