# Sido/hina-gemma4-12b-balanced-litert

## Resumen

Hina-gemma4-12b-balanced-litert es una conversión experimental del modelo Gemma 4 de 12B de parámetros al formato LiteRT-LM, orientada a la ejecución de inferencia directamente en el navegador mediante WebGPU. El autor, Sido, parte de un fine-tune comunitario sin censura (HauhauCS/Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced) derivado a su vez de google/gemma-4-12B-it, y lo reempaqueta como artefacto `.litertlm` de 7.273.467.408 bytes con pesos externalizados para el runtime de navegador.

El interés técnico de esta ficha reside en el pipeline de conversión: los pesos originales Q4_K_M GGUF se desquantizan a FP16, se combinan con los pesos no textuales, configuración y tokenizer del modelo oficial de Google, y se recuantizan con el esquema `dynamic_wi4b32_afp32` (BLOCKWISE_32) de LiteRT Torch. El resultado no es bit-idéntico al GGUF de origen y no preserva la cabeza MTP de borrador del modelo base, por lo que la calidad de salida puede diferir.

Se trata de un artefacto con 24 descargas y sin likes, publicado el 2 de noviembre de 2026, pensado para conversación de texto en navegador. Su contexto es de solo 4.096 tokens, el autor advierte que el comportamiento multimodal no está verificado y las pruebas de rendimiento se limitan a un único sistema Apple M4 con Chrome 156. Es, por tanto, un experimento de viabilidad de despliegue web más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), recuantizado a LiteRT-LM; 673 subgrafos, 96 estados KV |
| Parametros totales | 12B (según nomenclatura del modelo base) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 4.096 tokens (prefill length 128) |
| Tipos de cuantizacion | `dynamic_wi4b32_afp32` (BLOCKWISE_32), 4 bits por bloque de 32; constantes y tipos BF16 convertidos a FP16 |
| Idiomas soportados | ja, en |
| Licencia | gemma (el modelo base upstream de Google figura como Apache-2.0; revisar términos por separado) |
| Formato de pesos | `.litertlm` (LiteRT-LM), pesos del decoder externalizados |
| Tamano del artefacto | 7.273.467.408 bytes (~7,3 GB) |
| SHA-256 del artefacto | `b777e87801bb14cda5e55aaf08033f32da846b2a5bef802e8aa2036352e84447` |
| Modelo base | HauhauCS/Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced (Q4_K_M GGUF) y google/gemma-4-12B-it |
| Libreria | litert-lm |
| Runtime objetivo | WebGPU (navegador) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer Gemma 4 de 12B de parámetros, originalmente entrenado por Google y posteriormente afinado por la comunidad en la variante QAT Uncensored Balanced de HauhauCS. Esta ficha no documenta el proceso de entrenamiento original (número de tokens, composición del dataset, uso de RLHF o DPO), ya que esa información no está incluida en la model card del artefacto. Lo que sí se detalla es el pipeline de conversión: partiendo de un GGUF Q4_K_M de 7.381.381.760 bytes (SHA-256 `59656d7494d6376ca97e9e20b64ea2e16cd97f12ec6d47bfccba91cb785b5134`), los pesos de lenguaje se desquantizan a FP16 y se combinan con los pesos no textuales, la configuración y el tokenizer de google/gemma-4-12B-it.

La innovación técnica principal es la recuantización con `dynamic_wi4b32_afp32` (BLOCKWISE_32) de LiteRT Torch, la conversión de tipos BF16 a FP16 y la externalización de los pesos del decoder para que el runtime de navegador pueda cargarlos. Las comprobaciones estructurales reportadas incluyen 6 secciones, ausencia de tensores BF16 en 673 subgrafos, 96 estados KV y la inclusión de los IDs de supresión `[258883, 258882]` en los metadatos. El autor verifica byte a byte los pesos externalizados contra los pesos fuente convertidos, pero aclara que esto no constituye una prueba de equivalencia frente al GGUF original. Tampoco se preserva la cabeza MTP de borrador separada del modelo base.

## Capacidades

- Generación de texto conversacional en japonés e inglés, con calidad legible verificada en pruebas cortas y largas según el autor.
- Conversación multi-turno: una prueba de dos turnos confirmó que el modelo repitió correctamente la señal "青い猫" del turno anterior, aunque el autor no generaliza este resultado.
- Razonamiento y conocimiento general: capacidades heredadas del modelo Gemma 4 subyacente, no evaluadas de forma independiente en este artefacto.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales: presentes en el modelo base según la combinación de pesos no textuales, pero el autor indica que el comportamiento multimodal no está verificado en esta conversión.
- Modo thinking: no disponible en la información proporcionada.
- Capacidades de audio: no disponible en la información proporcionada.

## Casos de uso

- Demostraciones de inferencia en navegador: el artefacto está diseñado para cargarse vía WebGPU en Chrome, lo que permite mostrar un LLM de 12B funcionando localmente en el cliente sin backend, útil para prototipos y demos técnicas.
- Asistentes conversacionales ligeros en japonés: el autor verificó respuestas legibles en japonés con prompts independientes, lo que lo hace adecuado para experimentos de chat en ese idioma dentro de la ventana de 4.096 tokens.
- Pruebas de viabilidad de LiteRT-LM: sirve como referencia para desarrolladores que quieran evaluar el pipeline de conversión GGUF → LiteRT-LM con cuantización blockwise de 4 bits.
- Investigación sobre cuantización y fidelidad: permite comparar la salida del artefacto frente al GGUF Q4_K_M original para estudiar la degradación introducida por la recuantización y la pérdida de la cabeza MTP.
- Experimentos de privacidad en el cliente: al ejecutarse en el navegador, los datos no salen del dispositivo, lo que encaja en escenarios de procesamiento de texto sensible en local.
- Evaluación de fine-tunes sin censura: el modelo base HauhauCS permite estudiar el comportamiento de variantes desafinadas en un entorno controlado, con las advertencias de seguridad correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta mediciones de velocidad en un sistema Apple M4 con 32 GiB, Chrome 156 y WebGPU:

| Escenario | Tokens de entrada | Tokens de salida | Prefill (tok/s) | Decode (tok/s) |
|---|---|---|---|---|
| Prompt corto | 55 | 64 | 9,26 | 2,33 |
| Prompt largo | 1.741 | 64 | 20,56 | 2,33 |

Estos datos provienen de tres prompts cortos y tres largos independientes y, según el propio autor, no establecen la calidad general de las respuestas ni el rendimiento en otro hardware.

## Requisitos de hardware

- VRAM/RAM estimada: el artefacto pesa ~7,3 GB en disco; en ejecución en navegador requiere al menos esa cantidad de memoria disponible para el runtime WebGPU, aunque la información proporcionada no detalla el consumo exacto en VRAM.
- GPU recomendadas: no disponible en la información proporcionada; el único sistema probado es un Apple M4 con 32 GiB de memoria unificada.
- Compatibilidad con GPU de consumo: no verificada; el autor no reporta pruebas en RTX 4090, RTX 3090 u otras GPU de consumo.
- Opciones de despliegue: runtime LiteRT-LM con WebGPU en navegador (Chrome 156 probado). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: prefill de 9,26 tok/s (prompt corto) y 20,56 tok/s (prompt largo); decode estable en 2,33 tok/s en el sistema M4 probado.
- Contexto limitado: 4.096 tokens con prefill length de 128, lo que restringe conversaciones largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Sido/hina-gemma4-12b-balanced-litert | 12B | 4.096 | LiteRT-LM (WebGPU) | gemma | Conversión experimental de navegador, 24 descargas |
| Sido/hina-gemma4-12b-heretic-litert | 12B | no disponible | LiteRT-LM | gemma | Variante "heretic" del mismo autor, mismo pipeline de recuantización |
| HauhauCS/Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced | 12B | no disponible | GGUF Q4_K_M | gemma | Modelo base del que deriva este artefacto |
| google/gemma-4-12B-it | 12B | no disponible | safetensors (upstream) | Apache-2.0 (según enlace de Google) | Modelo oficial de Google del que derivan los pesos no textuales |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El artefacto no es bit-idéntico al GGUF original: la recuantización blockwise de 4 bits y la conversión BF16→FP16 pueden alterar la calidad de salida.
- No se preserva la cabeza MTP de borrador del modelo base, lo que elimina cualquier capacidad de decodificación especulativa asociada.
- El contexto es de solo 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- El comportamiento multimodal no está verificado, pese a que se combinaron pesos no textuales del modelo oficial.
- Las pruebas de calidad se limitan a un sistema Apple M4 con Chrome 156; no hay validación en otro hardware, navegadores ni sistemas operativos.
- Solo se han verificado respuestas legibles en japonés; el inglés figura en los metadatos pero no se documentan pruebas específicas.
- El modelo base es una variante "uncensored", lo que implica riesgos de generar contenido inapropiado o sin filtros de seguridad; el autor no ha verificado el comportamiento de seguridad.
- Riesgo de alucinación inherente a los LLM, no evaluado en este artefacto.
- Licencia ambigua: la model card del modelo base etiqueta `gemma`, mientras que el enlace a la licencia upstream de Google apunta a Apache-2.0; el autor recomienda revisar los términos aplicables a este derivado por separado.
- Artefacto experimental con 24 descargas y 0 likes; no hay evidencia de uso en producción ni comunidad de validación.
- El autor no ofrece garantías sobre la fidelidad al GGUF original ni sobre conversaciones largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sido/hina-gemma4-12b-balanced-litert
- Modelo base (fine-tune): https://huggingface.co/HauhauCS/Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced
- Revisión concreta del modelo base: https://huggingface.co/HauhauCS/Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced/tree/ae8045ac2bd216293ca49a3065da2c942dde4b68
- Modelo oficial de Google: https://huggingface.co/google/gemma-4-12B-it
- Revisión concreta del modelo oficial: https://huggingface.co/google/gemma-4-12B-it/tree/707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7
- Licencia upstream de Google Gemma 4: https://ai.google.dev/gemma/apache_2
- Variante herética del mismo autor: https://huggingface.co/Sido/hina-gemma4-12b-heretic-litert
