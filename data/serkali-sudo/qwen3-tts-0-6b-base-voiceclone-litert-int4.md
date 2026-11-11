# Serkali-sudo/Qwen3-TTS-0.6B-Base-VoiceClone-LiteRT-INT4

## Resumen

Qwen3-TTS-0.6B-Base-VoiceClone-LiteRT-INT4 es una exportación cuantizada del modelo base Qwen/Qwen3-TTS-12Hz-0.6B-Base, un sistema de síntesis de voz (text-to-speech) de la familia Qwen3-TTS. El autor de la conversión, Serkali-sudo, ha transformado los pesos originales al formato LiteRT/TFLite con cuantización INT4 para el componente Talker y INT8 por filas para las tablas de embeddings, reduciendo el repositorio a 1,3 GB y orientándolo hacia despliegue en dispositivos con recursos limitados.

La variante incorpora clonación de voz mediante un encoder de hablante que genera embeddings tipo x-vector a partir de tan solo tres segundos de audio de referencia. El modelo hospedado no contiene un grafo único: el host debe conectar por separado el encoder de hablante, el Talker, el predictor de códigos y el códec de audio, según los ajustes documentados en voice-clone.json.

Es relevante para desarrolladores que quieran ejecutar TTS con clonación de voz en entornos edge o móviles mediante LiteRT, evitando GPUs de gama alta. No obstante, la información publicada es mínima: no hay benchmarks, idiomas declarados ni detalles sobre el dataset de entrenamiento original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (Talker + predictor de codigos + codec de audio), exportada a LiteRT/TFLite |
| Parametros totales | 0,6B (segun el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 blockwise (Talker), INT8 row-wise (tablas de embeddings) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | LiteRT / TFLite (repo de 1,3 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3-TTS-12Hz-0.6B-Base es un sistema TTS de la familia Qwen3 que opera a una tasa de tramas de 12 Hz. La exportación LiteRT divide el pipeline en cuatro componentes conectados por el host: encoder de hablante, Talker, predictor de códigos y códec de audio. El Talker está cuantizado en INT4 por bloques y las tablas de embeddings en INT8 por filas, lo que permite reducir el tamaño y facilitar la inferencia en hardware modesto.

La clonación de voz se implementa mediante un encoder que produce x-vectors a partir de tres segundos de audio de referencia. Los detalles de preprocesado, disposición de tablas y rutas de grafos están en voice-clone.json dentro del repositorio. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicó RLHF o DPO en el modelo original.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada.
- Clonación de voz mediante x-vector a partir de tres segundos de audio de referencia.
- Pipeline modular: encoder de hablante, Talker, predictor de códigos y códec de audio conectados por el host.
- Ejecución en LiteRT/TFLite, orientada a dispositivos edge y móviles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplicable (modelo TTS).
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio de entrada distinto al de referencia: no disponible.

## Casos de uso

- Clonación de voz en aplicaciones móviles: el modelo permite generar locuciones con la voz del usuario a partir de tres segundos de referencia, ejecutándose vía LiteRT en el propio dispositivo sin depender de servidores.
- Lectura de textos en aplicaciones de accesibilidad: integrable en apps Android/iOS para convertir texto en audio con voces personalizadas, gracias al pipeline modular y al bajo peso del export INT4.
- Asistentes de voz embebidos: el TTS puede conectarse a un pipeline local de reconocimiento y generación para completar interacciones habladas en dispositivos sin GPU.
- Prototipado de narración con voz propia: útil para creadores que quieran generar audios de prueba con una muestra corta de su voz antes de invertir en infraestructura mayor.
- Sistemas de kiosco o domótica con voz personalizada: despliegue en hardware de bajo consumo donde LiteRT es viable y la latencia de red no es aceptable.
- Investigación en TTS cuantizado: referencia práctica para estudiar el impacto de INT4/INT8 en calidad de voz y latencia dentro de pipelines modulares LiteRT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 1,3 GB en INT4/INT8, por lo que el uso de memoria en dispositivo es del orden de gigabytes, no de decenas de gigabytes.
- GPU recomendadas: no disponible; el formato LiteRT está orientado a aceleradores móviles y edge (NPU/GPU integradas) más que a GPUs de servidor.
- Compatibilidad con GPU de consumo: no disponible como dato confirmado; el diseño INT4 sugiere viabilidad en hardware de gama baja, pero no se documentan modelos concretos.
- Opciones de despliegue: LiteRT / TFLite (librería declarada `litert`); vLLM, llama.cpp, Ollama o TGI no están indicados para este export.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-TTS-0.6B-Base-VoiceClone-LiteRT-INT4 (este) | 0,6B | no disponible | LiteRT INT4/INT8 | apache-2.0 | Export edge con clonación de voz |
| Qwen/Qwen3-TTS-12Hz-0.6B-Base | 0,6B | no disponible | safetensors (original) | apache-2.0 | Modelo base sin cuantizar |
| Otras alternativas TTS comparables | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- Información muy escasa: no se documentan idiomas, benchmarks, dataset ni límites de contexto.
- Riesgo de alucinación y artefactos de audio: no cuantificado; la cuantización INT4 del Talker puede degradar la calidad de voz frente al modelo original.
- Sesgos: no documentados; el modelo base podría reflejar sesgos de los datos de entrenamiento originales.
- Clonación de voz: requiere consentimiento explícito del hablante cuya voz se replica; riesgo de uso indebido (suplantación, deepfakes).
- Restricciones de licencia: apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los componentes del códec.
- Producción: el export exige que el host conecte manualmente cuatro subgrafos; no es un artefacto de un solo archivo listo para servir.
- Compatibilidad: depende del runtime LiteRT y de los ajustes de voice-clone.json; cambios de versión pueden romper el pipeline.

## Enlaces

- Hugging Face: https://huggingface.co/Serkali-sudo/Qwen3-TTS-0.6B-Base-VoiceClone-LiteRT-INT4
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Revisión del modelo base citada: f9e5478a47ac9d0953f983c91b8a1727f24761c1
- LiteRT: https://ai.google.dev/edge/litert
- Paper, blog o demo adicionales: no disponible
