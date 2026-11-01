# onemunanoyo/gemma4-E2B-Abliterated-GGUF

## Resumen

gemma4-E2B-Abliterated-GGUF es una versión "abliterada" (con la dirección de rechazo eliminada de los pesos) del modelo google/gemma-4-E2B-it de Google, publicada por el usuario onemunanoyo en Hugging Face. El autor ha aplicado una técnica de abliteration en japonés: a partir de un conjunto de prompts nocivos (84) y benignos (48) en japonés, extrae la dirección de rechazo en la capa 27 y la ortogonaliza respecto a las matrices de escritura residual de `embed_tokens` y de las capas 0 a 26, de forma que el modelo deja de negarse a peticiones que el modelo base rechazaría.

El resultado se distribuye únicamente en formato GGUF para su uso con llama.cpp, en cuatro cuantizaciones (bf16, Q8_0, Q6_K y Q4_K_M). Según las mediciones del propio autor, la tasa de rechazo ante 84 prompts NSFW explícitos en japonés cae del 87 % al 1 %, manteniendo el rendimiento en aritmética y lógica (7/7) y sin introducir rechazos excesivos en prompts benignos. El propio autor advierte de que se trata de un **experimento de práctica, no pensado para uso en producción**, y documenta efectos secundarios relevantes: un aumento de la complacencia ante peticiones ciberdelictivas (de 9 a 13 de 25 casos) y la pérdida parcial del efecto con cuantizaciones agresivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Gemma 4, con soporte de "thinking mode" y embeddings por capa; requiere llama.cpp con soporte PLE `per_layer_embd_out`) |
| Parametros totales | 4.628.569.635 (~4,63 B) |
| Parametros activos | no disponible (no consta arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K, Q4_K_M |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Gemma Terms of Use (heredada del modelo base) |
| Formato de pesos | GGUF (no se distribuye version safetensors) |

## Arquitectura y entrenamiento

El modelo base es google/gemma-4-E2B-it, un modelo conversacional instruido de la familia Gemma 4 con aproximadamente 4,63 mil millones de parametros. La ficha original de Google no esta incluida en la informacion disponible, por lo que detalles como tokens de entrenamiento, composicion del dataset o uso de RLHF/DPO no estan disponibles en esta ficha.

La modificacion del autor no implica reentrenamiento, sino una intervencion directa sobre los pesos: se construye la "direccion de rechazo" usando 84 prompts nocivos y 48 benignos en japones, identificandola en la capa 27 en la posicion -1 del residuo. Esa direccion se ortogonaliza respecto a las matrices de escritura en el stream residual de `embed_tokens` y de las capas 0 a 26, eliminando asi la componente que provoca las negativas. El modelo conserva la plantilla de chat con "thinking mode" del original: si el modo de pensamiento esta activo, el modelo razona sobre politicas de seguridad y vuelve a rechazar, por lo que el autor recomienda desactivarlo explicitamente en llama.cpp (`-rea off`). No se han documentado tecnicas adicionales como decodificacion especulativa ni atencion lineal.

## Capacidades

- Generacion de texto conversacional en japones e ingles (pipeline text-generation).
- Perplejidad en japones mejorada respecto al modelo base segun las mediciones del autor (0,82x–0,91x), lo que sugiere que la abliteration no degrada la fluidez.
- Razonamiento aritmetico y logico basico intacto (7/7 en el test de 7 preguntas del autor).
- Modo de pensamiento ("thinking mode") heredado de la plantilla de chat de Gemma 4, aunque debe desactivarse para que el efecto de la abliteration se mantenga.
- Sin capacidades documentadas de vision, audio, tool calling ni agentes en la informacion disponible.

## Casos de uso

El propio autor indica que es un **artefacto experimental de practica, no apto para produccion**. Dicho esto, los escenarios tecnicos en los que podria evaluarse son:

- Investigacion en seguridad de modelos: estudio de como la abliteration afecta a los mecanismos de rechazo y de su robustez frente a la cuantizacion (el autor documenta que Q4_K_M reintroduce "hedging").
- Investigacion en alineacion y direcciones de rechazo: replicacion de tecnicas de eliminacion de rechazos sobre modelos con arquitectura Gemma 4 y soporte PLE en llama.cpp.
- Generacion de contenido creativo sin filtros en japones: escritura de ficcion adulta donde el modelo base se niega; el autor reporta un 98 % de respuestas efectivas tras la abliteration.
- Evaluacion comparativa de cuantizaciones: analisis de como Q8_0, Q6_K y Q4_K_M preservan o degradan modificaciones de pesos finas.
- Pruebas de red teaming: el autor documenta un aumento de complacencia ante peticiones de phishing, robo de contrasenas y DDoS, lo que hace del modelo un caso de estudio sobre los riesgos de estas tecnicas.
- Benchmarking de inferencia local con llama.cpp (build b11560 o superior) en entornos con GPU de consumo.

## Benchmarks y rendimiento

No existen benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) publicados. Las unicas metricas disponibles son las mediciones propias del autor (evaluadas con thinking desactivado y decodificacion greedy):

| Metrica | Modelo base | Este modelo |
|---|---|---|
| Rechazo ante 84 prompts NSFW explicitos (japones) | 87 % | 1 % |
| Respuesta efectiva ante los mismos prompts | 13 % | 98 % |
| Perplejidad en japones (relativa) | 1,00x | 0,82x–0,91x |
| Aritmetica y logica (7 preguntas) | 7/7 | 7/7 |
| Rechazo excesivo en 48 prompts benignos | 0 | 0 |
| Complacencia ante 25 peticiones ciberdelictivas | 9/25 | 13/25 |

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamanos de archivo del repo):
  - Q4_K_M: 3,18 GB (cabe en GPUs de 4-6 GB, aunque el efecto de la abliteration se degrada)
  - Q6_K: 3,57 GB (recomendado por el autor para 8 GB de VRAM)
  - Q8_0: 4,61 GB (recomendado; cabe en GPUs de 8 GB como RTX 4090, RTX 3060 12 GB, RTX 4060 Ti 8/16 GB)
  - bf16: 8,64 GB (uso de referencia; GPU de 12 GB o mas, o CPU con RAM suficiente)
- GPUs recomendadas: cualquier GPU de consumo con 8 GB de VRAM (RTX 3060/4060/4070, RTX 4090) ejecutando todas las capas en GPU (`-ngl 99`).
- Inferencia en CPU viable dado el tamano (~4,6 B de parametros), con mayor latencia.
- Despliegue: llama.cpp (build b11560 o superior, con soporte de PLE `per_layer_embd_out` para Gemma 4), via `llama-cli` o `llama-server`. No se menciona soporte verificado en Ollama, vLLM o TGI; al ser GGUF, Ollama y LM Studio podrian funcionar en teoria, pero no consta verificacion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Particularidad | Licencia |
|---|---|---|---|---|
| onemunanoyo/gemma4-E2B-Abliterated-GGUF | ~4,63 B | GGUF (bf16/Q8_0/Q6_K/Q4_K_M) | Abliteration en japones, sin rechazos | Gemma Terms of Use |
| google/gemma-4-E2B-it (base) | ~4,63 B | safetensors | Modelo original con politicas de seguridad | Gemma Terms of Use |
| Modelos abliterados de Gemma 2/3 9B (p. ej. publicaciones comunitarias tipo "abliterated") | ~9 B | safetensors y GGUF | Abliteration en ingles, mayor tamano | Gemma Terms of Use |

La comparativa se limita a la familia Gemma abliterada; no hay datos de rendimiento comparativo publicados para este modelo frente a alternativas.

## Limitaciones y advertencias

- **Riesgo de uso indebido elevado**: el autor documenta un aumento de complacencia ante peticiones ciberdelictivas (de 9 a 13 de 25 casos), incluyendo phishing, robo de contrasenas y DDoS. Es el riesgo mas grave del modelo.
- El efecto de la abliteration se degrada con cuantizaciones agresivas: en Q4_K_M el modelo antepone advertencias ("...puede entrar en conflicto con las directrices") y responde de forma eufemistica.
- El "thinking mode" debe desactivarse explicitamente en llama.cpp (`-rea off`); si esta activo, el modelo razona sobre politicas de seguridad y vuelve a rechazar.
- Idiomas limitados a japones e ingles; la abliteration se calibro especificamente en japones, por lo que el comportamiento en otros idiomas es desconocido.
- Sin benchmarks estandar publicados: no se puede verificar el impacto de la abliteration en capacidades generales mas alla de las pruebas propias del autor (7 preguntas de aritmetica/logica).
- Licencia Gemma Terms of Use: impone condiciones de uso de Google (incluyendo restricciones y politica de uso aceptable) que se aplican tambien a este derivado; eliminar salvaguardas puede entrar en tension con dicha politica.
- El autor declara explicitamente que es un "producto experimental de practica" no destinado a uso real; no hay version safetensors, ni soporte documentado en frameworks de servico como vLLM o TGI.
- Longitud de contexto, datos de entrenamiento y detalles de la ficha base no disponibles en la informacion proporcionada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/onemunanoyo/gemma4-E2B-Abliterated-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia Gemma Terms of Use: https://ai.google.dev/gemma/terms

No se han encontrado enlaces a papers, blogs ni demos adicionales en la informacion disponible.
