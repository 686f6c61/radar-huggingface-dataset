# nishithsharma0301/cosyvoice3-0.5b-int8-ov

## Resumen

Fun-CosyVoice3-0.5B en formato OpenVINO IR es una conversión del modelo de síntesis de voz Fun-CosyVoice3-0.5B-2512, desarrollado por FunAudioLLM sobre la base del proyecto CosyVoice. El repositorio lo publica el usuario nishithsharma0301 como artefacto de despliegue para LESI, un motor de voz on-device escrito en C# que consume la API C de OpenVINO. No se trata de un modelo nuevo ni de un reentrenamiento: es una conversión de pesos y grafo orientada a inferencia local sin dependencia de PyTorch.

El modelo original es un sistema TTS de arquitectura híbrida: un LLM basado en Qwen2 que genera tokens de habla, seguido de un estimador de flow-matching que transforma esos tokens en mel-espectrogramas condicionados por un embedding de locutor, y un vocoder HiFT que sintetiza la forma de onda. El artefacto incluye cinco voces precalculadas a partir de clips de referencia sintetizados con voces de Kokoro-82M (af_heart, bf_emma, zf_xiaoxiao, am_michael y bm_george), lo que permite clonación de voz sin necesidad de audio de referencia en tiempo de ejecución.

La relevancia de esta ficha es acotada: el repositorio tiene cero descargas y cero likes, carece de pipeline declarado y de licencia explícita en los metadatos, y su valor práctico depende de integrarse en el motor LESI. Es útil como referencia para quienes necesiten ejecutar TTS de CosyVoice cuantizado en INT8 sobre OpenVINO en CPU, pero no debe confundirse con una distribución oficial del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: LLM Qwen2 (tokens de habla) + estimador flow-matching + vocoder HiFT |
| Parametros totales | 0.5B (según el nombre del modelo; desglose por componente no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 asimétrica (NNCF) en llm, text_embed y flow_estimator; float16 en flow_front, hift_f0 y hift_decode |
| Idiomas soportados | No disponible en la model card; las pruebas de validación se hicieron con reconocedores de cantonés |
| Licencia | No disponible en los metadatos del repo; el modelo origen (Fun-CosyVoice3-0.5B-2512) y CosyVoice se declaran Apache-2.0 |
| Formato de pesos | OpenVINO IR (.xml/.bin), más tokenizer.json, sos_task.bin, speech_table.bin, flow_noise.bin, extras.json |

## Arquitectura y entrenamiento

La conversión preserva la arquitectura del modelo original: un LLM Qwen2 con caché KV con estado que emite tokens de habla, un módulo text_embed que aporta la tabla de embeddings de texto, un flow_front que combina tokens de habla y embedding de locutor para producir la condicionante del flow, un flow_estimator de flow-matching con batch 2 y classifier-free guidance, y un vocoder HiFT dividido en predictor de f0 y decodificador. La excitación, la STFT y la ISTFT se ejecutan en C# dentro del motor LESI, no en el grafo OpenVINO.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF o DPO en la información proporcionada; esos detalles corresponden al modelo base Fun-CosyVoice3-0.5B-2512 y no se reproducen aquí. La innovación técnica documentada es la propia conversión: cuantización INT8 asimétrica vía NNCF 3.4.0 sobre OpenVINO 2026.4.1, con verificación de cada componente frente a PyTorch en CPU float32 con diferencia relativa ≤ 2e-5, y validación de extremo a extremo en C# comparando la tasa de error de caracteres con dos reconocedores de cantonés sobre diez frases de prueba en dos voces.

## Capacidades

- Síntesis de voz a partir de texto (TTS) mediante generación de tokens de habla y decodificación a forma de onda.
- Clonación de voz zero-shot con cinco voces preparadas incluidas en el repositorio (tokens de habla, features mel y embedding de locutor de clips de referencia).
- Control de locutor mediante embedding extraído de audio de referencia.
- Síntesis condicionada por flow-matching con classifier-free guidance, lo que permite modular la fidelidad al locutor de referencia.
- Ejecución on-device en CPU mediante OpenVINO, sin dependencia de CUDA ni de PyTorch en tiempo de inferencia.
- Integración con un motor C# a través de la API C de OpenVINO.
- Capacidades multilingües: no disponibles de forma explícita; la validación documentada se limita a cantonés.
- Tool calling, function calling, agentes, razonamiento multi-step, visión, audio de entrada y modo thinking: no aplicables, es un modelo TTS.

## Casos de uso

- Síntesis de voz local en aplicaciones de escritorio: el motor LESI en C# consume los grafos OpenVINO IR y ejecuta todo el pipeline en CPU, lo que encaja en entornos Windows sin GPU dedicada.
- Clonación de voz para locuciones personalizadas: las cinco voces incluidas permiten generar audio con timbres distintos sin capturar audio de referencia en producción, seleccionando el embedding de locutor correspondiente.
- Generación de audiolibros y contenido narrado por lotes: el pipeline por frases con flow-matching y vocoder HiFT permite procesar textos largos troceados, manteniendo coherencia de locutor dentro de cada voz.
- Sistemas de accesibilidad: lectura de texto a voz en aplicaciones de asistencia para personas con discapacidad visual, ejecutándose localmente para preservar privacidad del contenido.
- Integración en asistentes conversacionales embebidos: al correr en CPU vía OpenVINO, puede combinarse con reconocimiento de voz local en un bucle de diálogo sin enviar audio a servicios externos.
- Prototipado de voces para videojuegos y demos: las voces preparadas permiten iterar rápido sobre diálogos sin entrenar ni ajustar el modelo.
- Evaluación comparativa de TTS cuantizado: útil para medir la degradación de calidad INT8 frente a float32 en un pipeline real, dado que el autor documenta la metodología de verificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una verificación de equivalencia numérica: diferencia relativa ≤ 2e-5 frente a PyTorch en CPU float32 para cada componente convertido, y coincidencia de tasa de error de caracteres con dos reconocedores de cantonés sobre diez frases en dos voces. No se aportan cifras de MOS, latencia, throughput ni comparaciones con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada: no aplica de forma directa; el artefacto está orientado a CPU mediante OpenVINO. El repositorio ocupa 0.9 GB, lo que da una cota superior del espacio en disco y memoria necesario para cargar todos los grafos.
- GPU recomendadas: no disponibles; la conversión está validada en CPU. OpenVINO soporta GPU Intel integradas y discretas, pero el autor no documenta pruebas en ese backend.
- GPU de consumo: no confirmado. Por tamaño (0.5B en INT8/FP16) cabría en GPUs de consumo con suficiente memoria, pero no hay validación publicada.
- Opciones de despliegue: OpenVINO Runtime 2026.5 (requerido para ejecución), con la API C consumida desde C# en el motor LESI. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para esta arquitectura TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cosyvoice3-0.5b-int8-ov (este) | 0.5B | No disponible | OpenVINO IR (INT8/FP16) | No disponible en metadatos; origen Apache-2.0 | Hugging Face, 0 descargas |
| Fun-CosyVoice3-0.5B-2512 | 0.5B | No disponible | PyTorch (safetensors presumiblemente) | Apache-2.0 | Hugging Face, oficial de FunAudioLLM |
| CosyVoice (proyecto base) | Varía por checkpoint | No disponible | PyTorch | Apache-2.0 | GitHub FunAudioLLM |
| Kokoro-82M | 82M | No disponible | PyTorch/ONNX | Apache-2.0 | Hugging Face, hexgrad |

La comparación relevante es frente al modelo base: este repositorio sacrifica flexibilidad de framework a cambio de ejecución CPU nativa vía OpenVINO y voces precalculadas. Frente a Kokoro-82M, el modelo es aproximadamente seis veces mayor en parámetros y usa una arquitectura LLM + flow-matching en lugar de un TTS ligero, pero Kokoro-82M tiene distribución oficial, mayor adopción y un tamaño mucho menor para despliegue embebido.

## Limitaciones y advertencias

- Repositorio no oficial: publicado por un usuario individual, con cero descargas y cero likes; no hay garantía de mantenimiento ni de soporte.
- Licencia no declarada en los metadatos: aunque el modelo origen y CosyVoice son Apache-2.0, la licencia efectiva de esta conversión no está especificada, lo que introduce incertidumbre para uso comercial.
- Idiomas no documentados: la validación se hizo con reconocedores de cantonés, pero no se detalla qué lenguas sintetiza correctamente el modelo; no asumas cobertura multilingüe.
- Riesgo de alucinación acústica: como todo TTS generativo, puede producir prosodia incorrecta, artefactos o pronunciaciones erróneas en textos fuera de distribución.
- Riesgo de uso indebido de clonación de voz: las voces preparadas derivan de clips de Kokoro-82M; su uso para suplantación de identidad requiere consentimiento y cumplimiento normativo.
- Dependencia de versión: requiere OpenVINO 2026.5 en ejecución (convertido con 2026.4.1 y NNCF 3.4.0); versiones distintas pueden romper la compatibilidad de los grafos.
- Dependencia del motor LESI: parte del pipeline (excitación, STFT, ISTFT) vive en C#, por lo que los grafos por sí solos no constituyen un TTS completo fuera de ese motor.
- Sin datos de latencia, throughput ni MOS: no hay base para estimar rendimiento en producción.
- Contexto y límites de longitud de texto no documentados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nishithsharma0301/cosyvoice3-0.5b-int8-ov
- Modelo origen: https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Proyecto CosyVoice: https://github.com/FunAudioLLM/CosyVoice
- Kokoro-82M (origen de los clips de referencia): https://huggingface.co/hexgrad/Kokoro-82M
