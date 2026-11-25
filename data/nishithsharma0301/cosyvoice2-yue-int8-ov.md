# nishithsharma0301/cosyvoice2-yue-int8-ov

## Resumen

CosyVoice2-Yue INT8 OpenVINO es una conversión del modelo de síntesis de voz CosyVoice2-Yue (ASLP-lab) a formato OpenVINO IR, realizada por el usuario nishithsharma0301 para el motor de voz on-device de LESI (implementado en C# sobre la API C de OpenVINO). No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: empaqueta los distintos componentes de un sistema TTS (modelo de tokens de habla basado en Qwen2, estimador de flow-matching, vocoder HiFT) en grafos OpenVINO con cuantización INT8 selectiva y pesos float16 donde la precisión lo requiere.

El modelo subyacente, CosyVoice2-Yue, es una variante de CosyVoice2 especializada en cantonés (yue), construida sobre la arquitectura CosyVoice de FunAudioLLM. La relevancia de esta conversión es práctica: permite ejecutar un pipeline TTS completo en CPU sin dependencia de PyTorch, algo útil para aplicaciones de escritorio, sistemas embebidos o integraciones en ecosistemas .NET. El repositorio ocupa 0,8 GB e incluye cinco voces precalculadas a partir de clips de referencia generados con voces de Kokoro-82M.

La información pública disponible es muy limitada: el repositorio no declara licencia, pipeline, idiomas ni métricas de benchmarks, y no tiene descargas ni likes en el momento de redactar esta ficha. Todo lo que sigue se basa en la model card del autor y en las características conocidas de la familia CosyVoice.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS CosyVoice2: LLM de tokens de habla basado en Qwen2 (KV cache con estado), estimador de flow-matching con classifier-free guidance, vocoder HiFT (predictor f0 + decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el LLM opera sobre secuencias de tokens de texto/habla, sin contexto declarado) |
| Tipos de cuantizacion | INT8 asimétrico (NNCF) para `llm` y `text_embed`; float16 para `flow_front`, `flow_estimator`, `hift_f0` y `hift_decode` |
| Idiomas soportados | Cantonés (yue) por el nombre del modelo; no declarado explícitamente en la model card |
| Licencia | no disponible en el repositorio; el modelo origen ASLP-lab/Cosyvoice2-Yue y CosyVoice son Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml`/`.bin`), más `sos_task.bin`, `speech_table.bin`, `flow_noise.bin`, `extras.json` y `tokenizer/tokenizer.json` |

## Arquitectura y entrenamiento

Esta conversión no entrena el modelo: transforma los pesos de CosyVoice2-Yue a OpenVINO IR y aplica cuantización post-entrenamiento. El pipeline se descompone en seis grafos: `llm` (modelo Qwen2 que genera tokens de habla, con KV cache con estado y pesos INT8 asimétricos vía NNCF), `text_embed` (tabla de embeddings de texto Qwen2, también INT8), `flow_front` (combina tokens de habla y embedding de hablante para producir el condicionamiento del flow, float16), `flow_estimator` (estimador de flow-matching con batch 2 para classifier-free guidance, float16) y `hift_f0`/`hift_decode` (predictor de f0 y decoder del vocoder HiFT, float16). La excitación, la STFT y la ISTFT se implementan en C# fuera de los grafos.

El autor declara verificaciones de conversión: cada parte convertida se comparó con PyTorch sobre las mismas entradas con una diferencia relativa ≤ 2e-5 en CPU en float32, y el pipeline completo en C# se evaluó con dos reconocedores de cantonés sobre diez frases de test en dos voces, igualando la tasa de error de caracteres del modelo PyTorch. La conversión se realizó con OpenVINO 2026.4.1 y NNCF 3.4.0, y se ejecuta sobre OpenVINO 2026.5. No hay información sobre los datos de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO) en la información proporcionada.

## Capacidades

- Síntesis de voz (text-to-speech) en cantonés, heredada de CosyVoice2-Yue.
- Clonación de voz zero-shot mediante embeddings de hablante y tokens de habla de un clip de referencia; el repositorio incluye cinco voces preparadas (af_heart, bf_emma, zf_xiaoxiao, am_michael, bm_george, generadas con Kokoro-82M).
- Generación de tokens de habla con un LLM basado en Qwen2, lo que permite modelar prosodia y coarticulación a nivel de secuencia.
- Control de prosodia mediante el predictor de f0 del vocoder HiFT, con la excitación y las transformadas STFT/ISTFT gestionadas en C#.
- Ejecución on-device en CPU mediante OpenVINO, sin dependencia de PyTorch en tiempo de inferencia.
- Integración en aplicaciones C# a través de la API C de OpenVINO.
- No se declara soporte de tool calling, agentes, visión, audio de entrada ni modo de razonamiento explícito.

## Casos de uso

- Síntesis de voz en aplicaciones de escritorio .NET: el pipeline OpenVINO se invoca desde C# mediante la API C, lo que permite integrar TTS en aplicaciones Windows/Linux sin empaquetar PyTorch ni CUDA.
- Asistentes de voz on-device para cantonés: al ejecutarse en CPU, el modelo puede desplegarse en equipos sin GPU dedicada, útil para kioscos, terminales de atención o software de accesibilidad.
- Lectura de contenido en voz alta: el modelo convierte texto a habla con voces precalculadas, adecuado para lectores de pantalla o narración de documentos en cantonés.
- Clonación de voz para personalización: usando los embeddings de hablante y tokens de habla de un clip de referencia, se puede generar una voz consistente para un usuario o personaje concreto.
- Prototipado de pipelines TTS en entornos embebidos: la separación en grafos OpenVINO (llm, flow, vocoder) permite perfilar y optimizar cada etapa por separado en hardware limitado.
- Evaluación comparativa de cuantización: el repositorio sirve como referencia para medir el impacto de INT8 asimétrico en el LLM de tokens de habla frente a float16 en el flow y el vocoder, con la metodología de verificación descrita por el autor.
- Integración en herramientas de desarrollo con soporte de voz: editores o IDEs que necesiten retroalimentación hablada en cantonés pueden consumir el pipeline sin salir del proceso C#.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta verificaciones de equivalencia numérica (diferencia relativa ≤ 2e-5 frente a PyTorch en float32) y una comparación de tasa de error de caracteres con dos reconocedores de cantonés sobre diez frases en dos voces, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada: no disponible; el pipeline está diseñado para ejecución en CPU mediante OpenVINO, no se documentan requisitos de VRAM.
- GPU recomendadas: no disponibles; el autor no menciona despliegue en GPU.
- Compatibilidad con GPU de consumo: no documentada; el formato OpenVINO IR podría ejecutarse en GPU Intel integradas o discretas, pero no se confirma en la model card.
- Opciones de despliegue: OpenVINO Runtime 2026.5 con la API C (integración C#); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este pipeline TTS.
- Latencia y throughput: no disponibles; el tamaño del repo (0,8 GB) y la cuantización INT8 del LLM sugieren un consumo de memoria moderado, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CosyVoice2-Yue INT8 OpenVINO (este) | TTS pipeline OpenVINO | Cantonés (presunto) | OpenVINO IR | no disponible (origen Apache-2.0) | Hugging Face, 0 descargas |
| ASLP-lab/Cosyvoice2-Yue | TTS PyTorch | Cantonés | PyTorch | Apache-2.0 | Hugging Face |
| CosyVoice (FunAudioLLM) | TTS PyTorch | Chino, inglés y otros | PyTorch | Apache-2.0 | GitHub / Hugging Face |
| Kokoro-82M | TTS ligero | Varios (voces af, bf, zf, am, bm) | PyTorch/ONNX | Apache-2.0 | Hugging Face |

La comparación directa con alternativas OpenVINO equivalentes no está disponible en la información proporcionada. La principal diferencia frente al modelo origen es el formato de ejecución (OpenVINO IR frente a PyTorch) y la cuantización INT8 del LLM; frente a Kokoro-82M, este pipeline es considerablemente más pesado (0,8 GB) pero incorpora clonación de voz y modelado de prosodia basado en LLM.

## Limitaciones y advertencias

- La licencia del repositorio no está declarada; aunque el modelo origen y CosyVoice son Apache-2.0, la ausencia de licencia explícita en este artefacto genera incertidumbre para uso comercial.
- El modelo está orientado al cantonés; no se declaran otros idiomas soportados, por lo que su uso en castellano u otras lenguas no está garantizado.
- No hay información sobre sesgos del modelo original ni sobre el comportamiento con hablantes de distintos registros o acentos.
- Riesgo de alucinación y artefactos propio de los sistemas TTS: pronunciación incorrecta, prosodia anómala o inestabilidad en textos largos o con caracteres poco frecuentes.
- Las cinco voces incluidas se generaron con clips de referencia de Kokoro-82M, lo que puede introducir características acústicas del modelo de origen en la voz clonada.
- El pipeline depende de OpenVINO 2026.5 y de la API C; cambios de versión pueden romper la compatibilidad de los grafos IR.
- La verificación del autor se limita a diez frases y dos voces con reconocedores automáticos; no sustituye a una evaluación perceptual o de naturalidad a gran escala.
- El repositorio no tiene descargas ni likes, y su fecha de creación (2026-11-25) es posterior a la de la mayoría de artefactos de referencia; conviene validar la reproducibilidad antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nishithsharma0301/cosyvoice2-yue-int8-ov
- Modelo origen: https://huggingface.co/ASLP-lab/Cosyvoice2-Yue
- Repositorio CosyVoice (FunAudioLLM): https://github.com/FunAudioLLM/CosyVoice
- Kokoro-82M (origen de los clips de referencia): https://huggingface.co/hexgrad/Kokoro-82M
