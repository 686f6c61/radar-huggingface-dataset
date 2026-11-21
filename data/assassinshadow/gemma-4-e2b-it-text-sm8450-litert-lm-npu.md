# assassinshadow/Gemma-4-E2B-it-text-SM8450-LiteRT-LM-NPU

## Resumen

Gemma 4 E2B-it text es un modelo de lenguaje de Google (familia Gemma 4) empaquetado y cuantizado por el desarrollador independiente assassinshadow para ejecutarse en la NPU Hexagon de los SoC Qualcomm Snapdragon 8 Gen 1 (SM8450) y Snapdragon 888 (SM8350) mediante LiteRT-LM. El modelo base es `google/gemma-4-E2B-it`, una variante de 2B de parametros efectivos orientada a inferencia en dispositivo, y este repositorio ofrece bundles `.litertlm` listos para ejecutar en Android sin necesidad de compilar runners propios.

La relevancia del artefacto no esta en el modelo base, sino en el trabajo de despliegue: los bundles QAT (quantization-aware training) incorporan los pesos enteros de Google con rejillas de activacion int8, reorganizan el grafo en tres contextos QNN (capas de decodificacion 0-13, capas 14-34 con el lm_head y un grafo de prefill de 32 tokens por llamada) y logran decodificacion de 23-25 tok/s con contexto de 4K y unos 16 tok/s con 32K en un Galaxy S22 Ultra. El paquete ocupa 2,97 GB en disco y reside en aproximadamente 1,16 GB de pesos en la NPU.

El repositorio incluye tambien una variante para Snapdragon 888 (SM8350) con capacidades multimodales (texto, imagen y audio) y un drafter para decodificacion especulativa. La licencia declarada es Apache 2.0, aunque el modelo base Gemma 4 remite a la licencia propia de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), con capas de atencion con sliding window; grafo QNN para NPU Hexagon |
| Parametros totales | no disponible (modelo base etiquetado como E2B, ~2B efectivos) |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 o 32768 segun bundle |
| Tipos de cuantizacion | QAT con pesos de 2, 4 y 8 bits entre rejillas de activacion int8 |
| Idiomas soportados | en |
| Licencia | apache-2.0 (modelo base sujeto a licencia Gemma 4 de Google) |
| Formato de pesos | `.litertlm` (LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Gemma 4 en su variante E2B-it, ajustada con instrucciones. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en la informacion proporcionada. Lo que si documenta el autor es que los bundles QAT no son una cuantizacion post-entrenamiento del checkpoint de Hugging Face, sino que portan los pesos enteros y las rejillas de activacion producidos por el entrenamiento con quantization-aware training de Google, junto con sus embedders y el tokenizer SentencePiece.

La innovacion tecnica principal esta en el empaquetado para NPU: tres contextos QNN en lugar de ocho, un grafo de prefill que procesa 32 tokens de prompt por llamada (las capas 15-34 reutilizan las K/V de las capas 13 y 14), buffers en anillo para las capas con sliding window en ambas longitudes de contexto y una carga del tokenizer de 0,15 s. En la variante SM8350 se anade un drafter para decodificacion especulativa que eleva el throughput de 8,8 a 11-16 tok/s.

## Capacidades

- Generacion de texto y razonamiento en ingles, con modo de razonamiento visible en la app de referencia.
- Respuesta a instrucciones (variante `-it`).
- Contexto largo de hasta 32.768 tokens en el bundle correspondiente, con recuperacion exacta de codigos ocultos a ~10.100 tokens de un prompt de 12.400 tokens.
- Generacion coherente de textos largos (se valida una historia de 1.939 tokens).
- En la variante SM8350: comprension de imagen y audio ademas de texto.
- Decodificacion especulativa mediante drafter en la variante SM8350.
- No se documenta soporte de tool calling ni de function calling en la informacion disponible.
- No se documenta soporte de agentes multi-paso en la informacion disponible.
- Multilingue: no; solo ingles segun la model card.

## Casos de uso

- Asistente conversacional offline en Android: el bundle de 4K ofrece 23-25 tok/s de decodificacion y 0,07 s hasta el primer token con prompt corto, suficiente para chat interactivo sin conexion en un Snapdragon 8 Gen 1.
- Procesamiento de documentos largos en el dispositivo: el bundle de 32K permite introducir prompts de 12.400 tokens en unos 25 s y recuperar informacion concreta (codigos, referencias) sin salir del telefono.
- Backend de modelos para herramientas locales: la app de referencia expone una API HTTP compatible con OpenAI en la red local, de modo que scripts y agentes del ordenador pueden usar el telefono como servidor de inferencia.
- Automatizacion de flujos con datos privados: al ejecutarse en la NPU, encaja en pipelines que procesan PDF, OCR o RSS sin enviar contenido a la nube.
- Recuperacion aumentada sobre documentos propios: con embeddings en dispositivo, el modelo puede responder preguntas sobre archivos locales manteniendo los datos en el telefono.
- Prototipado de aplicaciones moviles con IA: permite medir latencia, consumo y temperatura reales en hardware Snapdragon antes de decidir si se despliega en servidor.
- En la variante SM8350, transcripcion o descripcion de imagenes y audio en un Snapdragon 888, util para dispositivos de gama alta de generaciones anteriores.

## Benchmarks y rendimiento

Rendimiento medido por el autor en un Samsung Galaxy S22 Ultra (SM-S908E) con LiteRT-LM CLI y nucleos grandes; la variante SM8350 en un Galaxy S21 Ultra (SM-G998U1).

| Metrica | Primer build 4K | QAT 4K | Primer build 32K | QAT 32K |
|---|---:|---:|---:|---:|
| Decodificacion (tok/s) | 19,4 | 23-25 | 12,3 | ~16 |
| Prompt largo (entrada) | ~3 min | 2,2 s | ~17 min | 25 s |
| Time to first token, prompt corto | ~2 s | 0,07 s | 2,0 s | 0,15 s |
| CPU durante generacion | 26% | 16% | 23% | 9% |
| Sensor mas caliente al final | 78-93 °C | 79 °C | 71-78 °C | 72 °C |
| Respuestas identicas al bundle de Google (32 prompts, greedy) | no ejecutado | 12 | 7 | 12 |

| Bundle | Contexto | Decodificacion | Velocidad de prompt | Tamano |
|---|---:|---:|---:|---:|
| `gemma4-e2b-qat_sm8450.litertlm` | 4096 | 23-25 tok/s | ~1.500 tok/s | 2,97 GB |
| `gemma4-e2b-qat-ctx32768_sm8450.litertlm` | 32768 | ~16 tok/s | ~500 tok/s | 2,97 GB |
| `gemma4-e2b_sm8450.litertlm` | 4096 | 15-20 tok/s | ~19 tok/s | 2,92 GB |
| `gemma4-e2b-ctx32768_sm8450.litertlm` | 32768 | 10-12 tok/s | ~12 tok/s | 2,92 GB |
| `gemma4-e2b-qat-ctx32768-c22-mtp-multimodal_sm8350.litertlm` | 32768 | ~8,8 tok/s (11-16 con drafter) | ~130 tok/s | 3,46 GB |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- SoC: Snapdragon 8 Gen 1 (SM8450, Hexagon v69) para los bundles SM8450; Snapdragon 888 (SM8350) para el bundle multimodal.
- Los bundles SM8450 estan compilados exclusivamente para la NPU Hexagon de ese SoC y son solo texto.
- Almacenamiento: entre 2,92 y 3,46 GB por bundle.
- Memoria en NPU: aproximadamente 1,16 GB de pesos en los bundles QAT (frente a ~1,6 GB en los primeros builds).
- No cabe en GPU de escritorio ni esta pensado para ellas; no se documenta despliegue en vLLM, llama.cpp, Ollama ni TGI.
- Runtime: LiteRT-LM v0.17.1 o superior con sus ajustes por defecto de NPU (`use_hw_masking_for_npu` y `use_hw_cache_update_for_npu` activados).
- Restriccion operativa del prefill: cada llamada necesita 32 posiciones libres, por lo que los ultimos 31 tokens de la ventana no admiten prompt.
- Latencia y throughput medidos: ver tabla de benchmarks.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Este bundle (Gemma 4 E2B-it QAT, SM8450) | ~2B efectivos | 4K / 32K | NPU Hexagon Snapdragon 8 Gen 1 | apache-2.0 | 23-25 tok/s en 4K; solo texto |
| `litert-community/gemma-4-E2B-it-litert-lm` | ~2B efectivos | no disponible | LiteRT-LM generico | licencia Gemma 4 | Bundle oficial de Google con pesos QAT; referencia de fidelidad |
| `google/gemma-4-E2B-it` | ~2B efectivos | no disponible | safetensors, GPU/CPU | licencia Gemma 4 | Checkpoint original en punto flotante |
| Variante SM8350 de este repo | ~2B efectivos | 32K | NPU Hexagon Snapdragon 888 | apache-2.0 | Multimodal (texto, imagen, audio) con drafter |

## Limitaciones y advertencias

- Solo ingles: la model card declara unicamente `en`, lo que limita su uso en castellano.
- Solo texto en los bundles SM8450; vision y audio quedan reservados a la variante SM8350.
- Dependencia estricta de hardware: los bundles SM8450 solo funcionan en la NPU Hexagon del Snapdragon 8 Gen 1; no son portables a otros SoC.
- Riesgo de alucinacion inherente a un modelo de ~2B parametros, mayor en tareas de conocimiento factual y razonamiento complejo.
- La licencia del repositorio es apache-2.0, pero el modelo base remite a la licencia Gemma 4 de Google; conviene revisar sus terminos antes de uso comercial.
- En pruebas de fidelidad, solo 12 de 32 respuestas coinciden palabra por palabra con el bundle de Google; el autor indica que las divergencias leidas eran correctas, pero no es una garantia formal de equivalencia.
- El prefill de 32 tokens por llamada impide introducir prompt en las ultimas 31 posiciones de la ventana de contexto.
- Temperaturas de SoC cercanas a 79 °C en generacion sostenida, con riesgo de throttling en sesiones largas.
- El autor mantiene una app propia (AutoDroid Studio) como via recomendada de ejecucion; el uso manual requiere LiteRT-LM v0.17.1 o superior y configuracion correcta de la NPU.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/assassinshadow/Gemma-4-E2B-it-text-SM8450-LiteRT-LM-NPU
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Bundle LiteRT-LM oficial de Google: https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- AutoDroid Studio en Google Play: https://play.google.com/store/apps/details?id=com.assassinshadow.aiserver
