# Phoonnx/f5tts-multi-silma_ai-v1-graphemes

## Resumen

f5tts-multi-silma_ai-v1-graphemes es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura F5-TTS, desarrollado originalmente por SILMA AI bajo el nombre silma-tts y empaquetado por Phoonnx en formato ONNX para su uso con la librería phoonnx. El modelo cubre dos idiomas, árabe (árabe estándar moderno con tashkeel completo) e inglés, y está pensado para integrarse en pipelines de TTS dentro del ecosistema OVOS mediante el plugin ovos-tts-plugin-phoonnx.

La relevancia de este empaquetado reside en su formato: los pesos se distribuyen en ONNX, lo que facilita la inferencia en entornos sin dependencias de PyTorch y permite su despliegue en dispositivos modestos. El repositorio ocupa 0,7 GB y la licencia declarada es Apache-2.0, lo que habilita el uso comercial sin las restricciones no comerciales que arrastraban algunos modelos base de la familia.

La información pública disponible es limitada: no se detallan el número de parámetros, la longitud de contexto ni los datos de entrenamiento en la model card. Esta ficha refleja únicamente los datos verificables en la información proporcionada y marca explícitamente como no disponibles aquellos que no se han publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | F5-TTS (modelo de difusión para TTS, según la colección upstream) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | árabe (MSA con tashkeel completo) e inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (empaquetado para la librería phoonnx) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura F5-TTS, un sistema de síntesis de voz basado en difusión que genera audio a partir de texto. El empaquetado de Phoonnx expone los pesos en ONNX y delega el preprocesado textual en la librería scriptconv: concretamente, el front-end utiliza `GraphemePhonemizer` de `scriptconv.phonemizers.base`, de modo que el modelo recibe caracteres del texto (graphemes) en lugar de fonemas. Este detalle es relevante porque simplifica el pipeline de entrada y evita depender de un fonemizador específico por idioma.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El modelo upstream (silma-ai/silma-tts) deriva de una base con restricción CC-BY-NC-SA-4.0 (Habibi/SADA/Mixat), pero la variante silma-tts-v1 se declara Apache-2.0 y, según las notas de licencia, no arrastra la restricción no comercial.

## Capacidades

- Síntesis de voz a partir de texto en árabe (MSA con tashkeel completo) e inglés.
- Entrada basada en graphemes: el modelo acepta caracteres del texto directamente, sin necesidad de transcripción fonética manual.
- Gestión de voces mediante el `TTSModelManager` de phoonnx, con dos voces disponibles: `silma/v1` y `silma/v1-en`.
- Generación de audio en formato WAV mediante `synthesize_wav`.
- Integración con OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Inferencia en ONNX, sin dependencia de PyTorch en tiempo de ejecución.
- No se documentan capacidades de clonación de voz, control de estilo, tool calling ni razonamiento multi-paso; son capacidades ajenas al propósito del modelo.

## Casos de uso

- Asistentes de voz en árabe: el modelo puede sintetizar respuestas en árabe estándar moderno con tashkeel, adecuado para asistentes domésticos integrados en OVOS mediante el plugin de phoonnx.
- Atención al cliente bilingüe árabe-inglés: permite generar respuestas habladas en ambos idiomas desde un mismo motor, reduciendo la necesidad de mantener dos sistemas TTS separados.
- Lectura de contenidos en árabe con vocalización: al soportar tashkeel completo, es útil para aplicaciones educativas o de accesibilidad que requieren una pronunciación vocalizada correcta.
- Integración en sistemas de domótica y altavoces inteligentes: el empaquetado ONNX y el plugin OVOS facilitan el despliegue en dispositivos con recursos limitados.
- Generación de audiolibros o locuciones en inglés: la voz `silma/v1-en` permite producir narraciones en inglés dentro del mismo pipeline.
- Prototipado rápido de aplicaciones TTS: la instalación vía `pip install --pre phoonnx` y la API de `TTSModelManager` permiten montar un sintetizador funcional en pocas líneas de código.
- Sistemas de accesibilidad para personas con discapacidad visual: la síntesis en árabe e inglés cubre la lectura de pantalla en entornos bilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,7 GB, lo que sugiere que el modelo puede ejecutarse en GPU con 2-4 GB de memoria, aunque este dato no está confirmado en la documentación.
- GPU recomendadas: no disponible. Por el tamaño del repositorio, es plausible su ejecución en GPUs de consumo, pero no se ha publicado una lista oficial.
- ¿Cabe en GPU de consumo? No confirmado; el tamaño del artefacto (0,7 GB) es compatible con GPUs de gama media, pero no hay especificación oficial.
- Opciones de despliegue: librería phoonnx (Python) y plugin OVOS (`ovos-tts-plugin-phoonnx`); el formato ONNX permite usar el runtime de ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| f5tts-multi-silma_ai-v1-graphemes | F5-TTS | ar, en | Apache-2.0 | ONNX | Empaquetado Phoonnx, front-end de graphemes |
| silma-ai/silma-tts (upstream) | F5-TTS | ar, en | Apache-2.0 | no disponible | Modelo original de SILMA AI |
| Otros modelos F5-TTS de la colección Phoonnx | F5-TTS | variable | variable | ONNX | Misma familia de empaquetados |

No se dispone de datos de benchmarks ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Información técnica incompleta: no se publican parámetros, contexto, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad frente a alternativas.
- Cobertura lingüística limitada a árabe e inglés; no se declara soporte para otras lenguas.
- Riesgo de alucinación y errores de pronunciación inherente a los sistemas TTS, especialmente en textos con vocalización ambigua o nombres propios.
- La licencia Apache-2.0 se declara en la model card, pero las notas de licencia del upstream mencionan una base con restricción CC-BY-NC-SA-4.0; conviene verificar la procedencia exacta antes de un uso comercial crítico.
- El front-end basado en graphemes puede producir pronunciaciones menos precisas que un pipeline con fonemización explícita en casos de homógrafos.
- No se documentan sesgos específicos; como todo modelo entrenado con datos de voz, puede reflejar sesgos de acento, género o dialecto presentes en el corpus original.
- El modelo está empaquetado para phoonnx; su uso fuera de esa librería requiere gestionar manualmente el runtime ONNX y el preprocesado de texto.
- El número de descargas (20) y la ausencia de likes sugieren una adopción muy limitada, con escasa validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/f5tts-multi-silma_ai-v1-graphemes
- Modelo upstream: https://huggingface.co/silma-ai/silma-tts
- Colección F5-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/f5-tts-6af8ea7f407234f6f1f08b30
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
