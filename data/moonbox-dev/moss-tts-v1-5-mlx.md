# moonbox-dev/MOSS-TTS-v1.5-MLX

## Resumen

MOSS-TTS v1.5 MLX es una conversión a formato MLX del modelo de síntesis de voz MOSS-TTS v1.5, desarrollado originalmente por OpenMOSS-Team y adaptado por moonbox-dev para su ejecución nativa en Macs con Apple Silicon. El modelo base es un sistema de text-to-speech con capacidad de clonación de voz, construido sobre una arquitectura derivada de Qwen3, y esta versión MLX reproduce fielmente los pesos originales en precisión bf16 (bit a bit idénticos) para permitir inferencia local en hardware Apple sin depender de CUDA ni de PyTorch.

La relevancia de esta ficha radica en que el ecosistema MLX permite ejecutar modelos de audio de gran tamano en ordenadores personales con chip M-series, algo que hasta hace poco quedaba restringido a GPUs dedicadas. El repositorio ocupa 55,1 GB e incluye builds en bf16 y fp16, con los ficheros de tokenizer, configuración y pesos shardeados en cuatro safetensors.

No se dispone de información pública sobre el número exacto de parámetros, la longitud de contexto ni los idiomas soportados más allá de lo que indica la model card del autor, que se limita a describir el proceso de conversión y las métricas de fidelidad respecto al original. Esta ficha refleja únicamente los datos verificables disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen3 (text-to-speech, segun tags del repo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 y fp16 (builds separados en carpetas) |
| Idiomas soportados | no disponible (la model card solo menciona una muestra en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards por build), tokenizer.json, vocab.json, merges.txt |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base MOSS-TTS v1.5 más allá de la etiqueta `qwen3` presente en los tags del repositorio, lo que sugiere que el backbone lingüístico deriva de la familia Qwen3. Se trata de un sistema de text-to-speech con capacidad de clonación de voz, pipeline `text-to-speech`, lo que implica un componente de modelado de texto y otro de generación de audio (probablemente codec o vocoder, aunque la model card no lo especifica).

Respecto al entrenamiento, no se han publicado en la información proporcionada datos sobre número de tokens, composición del dataset, ni si hubo RLHF o DPO. La model card de esta conversión MLX se centra exclusivamente en el proceso de conversión de pesos y en la verificación de fidelidad respecto al modelo original de OpenMOSS-Team. La innovación técnica destacable de esta ficha es la propia conversión a MLX: los pesos bf16 son bit-idénticos al original, y la verificación con un clip en inglés reporta WER 0,0 %, similitud de hablante 0,985 y DNSMOS 3,25 (frente a 0,0 %, 0,976 y 3,27 del original). Para fp16, los pesos quedan dentro de 3e-8 del original tras el cast, aunque el cómputo en fp16 no se llegó a ejecutar en el hardware de verificación (24 GB).

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada.
- Clonación de voz, según el tag `voice-cloning` del repositorio.
- Ejecución nativa en Apple Silicon mediante la librería `mlx-audio`.
- Conversión fiel del modelo original: pesos bf16 bit-idénticos y fp16 con desviación máxima de 3e-8.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales adicionales.
- No se dispone de información sobre cobertura multilingüe más allá de la muestra en inglés empleada en la verificación.

## Casos de uso

- Generación de audiolibros y narración: el modelo permite sintetizar texto largo en voz, y su build MLX posibilita ejecutarlo en un Mac local sin GPU dedicada, lo que abarata el coste por hora de audio generado en proyectos editoriales.
- Clonación de voz para doblaje y localización: gracias a la capacidad de voice cloning, se puede generar una voz consistente para un personaje o narrador a lo largo de múltiples clips, manteniendo la similitud de hablante verificada (0,985 en la prueba del autor).
- Asistentes de voz en aplicaciones de escritorio para macOS: al integrarse vía `mlx-audio`, el modelo puede incrustarse en apps nativas que respondan por voz sin enviar datos a la nube, útil en entornos con requisitos de privacidad.
- Prototipado rápido de interfaces conversacionales: desarrolladores que trabajan en Mac pueden iterar sobre guiones y prompts de voz sin depender de infraestructura CUDA, reduciendo el ciclo de prueba.
- Accesibilidad: generación de voz sintética para lectores de pantalla o contenido educativo, con la ventaja de ejecución local y licencia Apache 2.0 que permite uso comercial.
- Investigación en TTS y clonación de voz: al ser pesos bit-idénticos al original en bf16, sirve como referencia reproducible para comparar implementaciones MLX frente a PyTorch en tareas de evaluación de calidad de audio (WER, DNSMOS, similitud de hablante).

## Benchmarks y rendimiento

La model card reporta una verificación de fidelidad con un único clip en inglés, comparando el build MLX bf16 contra el modelo original PyTorch:

| Metrica | MLX bf16 | Original PyTorch |
|---|---|---|
| WER | 0,0 % | 0,0 % |
| Similitud de hablante | 0,985 | 0,976 |
| DNSMOS | 3,25 | 3,27 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo de TTS y no de lenguaje general.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: el repo completo ocupa 55,1 GB, pero cada build (bf16 o fp16) suma aproximadamente 17 GB en pesos (5,32 + 5,30 + 4,82 + 1,54 GB), por lo que se necesita un Mac con al menos 24 GB de memoria unificada para cargar un build completo con margen para el resto del pipeline.
- El autor indica que la verificación se realizó en un equipo de 24 GB, y que en ese hardware no fue posible comprobar todos los aspectos ("not checkable on 24 GB").
- GPU recomendadas: no aplica GPU dedicada; el modelo está pensado para Apple Silicon (chips M-series). No se dispone de datos para A100, H100 o RTX 4090 en esta conversión.
- Cabe en Macs consumer con 24 GB o más de memoria unificada (M-series Pro/Max/Ultra). No se especifica comportamiento en configuraciones de 16 GB.
- Opciones de despliegue: librería `mlx-audio` (MLX). No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se puede señalar únicamente que el modelo original `OpenMOSS-Team/MOSS-TTS-v1.5` es la referencia directa, del cual esta versión es una cuantización/conversión a MLX con pesos bf16 bit-idénticos. Para alternativas de TTS open source (p. ej. otros sistemas de clonación de voz) no hay datos en la información disponible para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Solo se ha verificado la calidad con un único clip en inglés; no hay evidencia publicada sobre otros idiomas ni sobre robustez en textos largos.
- El cómputo en fp16 no se llegó a ejecutar durante la verificación, por lo que su comportamiento real en inferencia no está validado.
- La verificación en hardware de 24 GB queda marcada como "not checkable", lo que limita la confianza en la reproducibilidad completa del pipeline en equipos pequeños.
- Al ser una conversión de pesos y no un reentrenamiento, hereda los sesgos y limitaciones del modelo original MOSS-TTS v1.5, sobre los que no hay información en esta ficha.
- Riesgo de alucinación y artefactos de audio: no cuantificado en la documentación disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datos de voz empleados en la clonación para cumplir con normativas de protección de datos y derechos de imagen.
- El uso de clonación de voz conlleva riesgos de suplantación; se recomienda implementar consentimiento explícito y marcas de agua o detección de voz sintética en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/MOSS-TTS-v1.5-MLX
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-v1.5
- Paper referenciado en tags (arXiv:2603.18090): https://arxiv.org/abs/2603.18090
- Librería mlx-audio: no disponible en la información proporcionada
