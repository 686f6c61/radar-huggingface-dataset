# kingjones777/Player-1-35B-A3B-SuperRoc-GGUF

## Resumen

Player-1-35B-A3B-SuperRoc-GGUF es una cuantización GGUF del modelo multimodal `yyyang/Player-1-35B-A3B`, publicada por el usuario `kingjones777` y optimizada específicamente para el motor de inferencia local Super Roc sobre hardware Strix Halo (AMD Ryzen AI Max+ 395, arquitectura gfx1151). El pipeline declarado es `image-text-to-text`, lo que indica que el modelo base acepta entradas de imagen y texto y genera texto. No obstante, la model card no documenta la arquitectura interna del modelo original ni su proceso de entrenamiento.

El interés de esta publicación no reside en el modelo en sí, sino en el formato de pesos: emplea el formato ROCm-FP4 (Q4_0-ROCmFP4-FAST con calibración imatrix), desarrollado por el equipo ROCmFPX, que permite ejecutar un modelo de gran tamaño en la memoria unificada de un sistema Strix Halo con 128 GB. El autor reporta una perplejidad de 7,99 sobre un documento técnico en inglés de 11K tokens con contexto 4096, frente a 8,06 del mismo modelo con una configuración de control.

La relevancia es acotada pero concreta: demuestra que es viable servir un modelo multimodal con 131.072 tokens de contexto cargados y velocidades de generación de entre 71 y 170 tok/s en un SoC de consumo, sin GPU dedicada. La licencia declarada es Apache 2.0. El repositorio tiene 225 descargas y ningún "like" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; arquitectura interna no documentada) |
| Parametros totales | 446.571.248 (según safetensors del modelo base); la nomenclatura "35B-A3B" sugiere 35B totales con 3B activos, dato no confirmado en la información disponible |
| Parametros activos | no confirmado (la designación A3B apunta a ~3B activos, presumiblemente MoE) |
| Longitud de contexto | 131.072 tokens (cargados y verificados en la medición del autor) |
| Tipos de cuantizacion | Q4_0-ROCmFP4-FAST con imatrix (GGUF); proyector multimodal en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos ficheros: modelo principal de 18,8 GB y mmproj BF16 de 902 MB) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base `yyyang/Player-1-35B-A3B`: la model card del repositorio de cuantización no describe si se trata de un transformer denso, un mixture-of-experts o una arquitectura híbrida, ni detalla el dataset de entrenamiento, el número de tokens vistos ni si hubo etapas de RLHF o DPO. La nomenclatura "35B-A3B" es consistente con un diseño de mezcla de expertos con aproximadamente 35.000 millones de parámetros totales y 3.000 millones activos por token, pero este dato no aparece confirmado en la información proporcionada y debe tratarse como inferencia a partir del nombre.

La innovación técnica documentada pertenece al plano de la cuantización y el despliegue, no al del entrenamiento. El autor aplica el formato ROCm-FP4 de ROCmFPX sobre una base Q4_0 calibrada con imatrix, lo que produce un fichero de 18,8 GB que cabe en la memoria unificada de un Ryzen AI Max+ 395 con 128 GB. El modelo conserva el modo "thinking" del original, desactivable por petición mediante `chat_template_kwargs.enable_thinking`, y el motor Super Roc añade caché de prompt (6.961 de 6.986 tokens reutilizados en el segundo turno) y `prompt-lookup`.

## Capacidades

- Generación de texto y razonamiento, con modo "thinking" activable o desactivable por petición.
- Procesamiento de imagen y texto (`image-text-to-text`): la prueba de visión del autor pasa ("Vision: pass"), con proyector multimodal BF16 independiente.
- Tool calling / function calling: el autor reporta 7 de 8 aciertos tanto en modo requerido como en modo automático.
- Conversaciones multi-turno con contexto largo: se cargan 131.072 tokens y la caché de prompt funciona entre turnos.
- Generación de código: medida específica de 71,3 tok/s sobre dos prompts de código.
- Capacidades multilingües: no documentadas; la única evaluación de perplejidad se hizo sobre un documento en inglés.

## Casos de uso

- Asistencia técnica sobre documentación extensa: con 131.072 tokens de contexto y caché de prompt, el modelo puede mantener un documento técnico completo cargado y responder preguntas sucesivas sin reprocesar el prefijo, lo que abarata cada turno adicional.
- Análisis de capturas y diagramas: al aceptar entrada de imagen, sirve para extraer texto o interpretar esquemas en flujos de revisión de documentación técnica.
- Agente local con herramientas: los resultados de tool calling (7/8) permiten integrarlo en un bucle de agente que consulte APIs o ejecute comandos, con la advertencia de que uno de cada ocho intentos puede fallar en la selección de herramienta.
- Estación de trabajo de desarrollo sin GPU dedicada: un equipo Strix Halo con 128 GB puede servir el modelo a 71 tok/s en generación, suficiente para autocompletado y revisión de código en local con latencia interactiva.
- Asistente de código en local con requisitos de privacidad: al ejecutarse íntegramente en el SoC, el código no sale del equipo, lo que encaja en entornos con restricciones de confidencialidad.
- Procesamiento por lotes de documentos largos: la velocidad de prefill medida (1.771 tok/s a 1K y 1.860 tok/s a 8K) hace viable ingerir documentos de decenas de miles de tokens en segundos antes de generar el resumen.
- Evaluación comparativa de cuantizaciones: el par de perplejidades reportado (7,99 frente a 8,06) permite usar este build como referencia al comparar formatos ROCm-FP4 con otras cuantizaciones del mismo modelo base.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). Los únicos datos medidos son de despliegue y perplejidad:

| Metrica | Valor |
|---|---|
| Perplejidad (documento técnico inglés, 11K tokens, contexto 4096) | 7,99 |
| Perplejidad, control STRIX_LEAN del mismo modelo | 8,06 |
| Tiempo de carga | 2 s |
| Prompt tok/s (p1k) | 1.771,2 |
| Prompt tok/s (p8k) | 1.860,6 |
| Generación tok/s (p1k) | 71,5 |
| Generación tok/s (p8k) | 170,33 |
| Generación de código tok/s | 71,3 (media de 2 prompts) |
| Tool calls (requerido / automático) | 7/8 / 7/8 |
| Caché de prompt, turno 2 | 6.961 / 6.986 tokens |
| Contexto cargado | 131.072 tokens |
| Visión | pass |

Medición sobre Ryzen AI Max+ 395, 128 GB, Super Roc 0.20.3, una petición simultánea, 24 de noviembre de 2026. No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- VRAM/memoria: el fichero principal ocupa 18,8 GB y el proyector multimodal 902 MB; en Strix Halo se usa memoria unificada, y el autor opera con 128 GB de sistema.
- GPU recomendadas: el destino declarado es AMD Ryzen AI Max+ 395 (gfx1151, Strix Halo). No se documenta compatibilidad con A100, H100 ni RTX 4090, y el formato ROCm-FP4 está pensado para ROCm.
- GPU de consumo: no cabe en GPUs de consumo con 8-24 GB de VRAM en esta cuantización; requiere un sistema con memoria unificada grande o GPUs profesionales.
- Despliegue: motor Super Roc (`superroc serve`), con integración en Lemonade mediante `lemonade pull` y `lemonade chat`. El autor indica que Super Roc se construye sobre llama.cpp/ggml, pero no confirma que el fichero ROCm-FP4 funcione en llama.cpp estándar.
- Latencia y throughput: 71,5 tok/s de generación a contexto 1K y 170,33 tok/s a 8K; prefill de 1.771 a 1.860 tok/s; carga en 2 s. Medido con una sola petición concurrente.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de modelos comparables de la misma categoría (multimodales de ~35B con cuantización GGUF para hardware AMD), ni benchmarks de calidad que permitan situar este build frente a alternativas. La única comparación interna es la perplejidad frente al control STRIX_LEAN del mismo modelo (7,99 frente a 8,06).

## Limitaciones y advertencias

- La model card no documenta sesgos, composición del dataset ni filtrado del modelo base; no hay base para evaluar riesgos de sesgo.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de veracidad ni benchmarks de calidad.
- La única métrica de calidad es una perplejidad sobre un documento en inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- Tool calling con 7/8 aciertos implica un fallo esperado en aproximadamente una de cada ocho invocaciones; en producción conviene validar y reintentar.
- El formato ROCm-FP4 y el motor Super Roc son específicos del ecosistema del autor y de ROCmFPX; no hay garantía de portabilidad a llama.cpp estándar, vLLM, TGI u Ollama.
- Las mediciones provienen del propio autor, con una sola petición concurrente y sin réplicas independientes; el throughput en concurrencia no está caracterizado.
- La discrepancia entre los 446.571.248 parámetros del safetensors del modelo base y la designación "35B" del nombre no se explica en la documentación; conviene verificar el modelo original antes de asumir un tamaño concreto.
- Licencia Apache 2.0 declarada, que permite uso comercial, pero la licencia del modelo base `yyyang/Player-1-35B-A3B` debería verificarse por separado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/Player-1-35B-A3B-SuperRoc-GGUF
- Modelo base: https://huggingface.co/yyyang/Player-1-35B-A3B
- Motor Super Roc: https://github.com/kingjones30/superroc
- Guía de integración con Lemonade: https://github.com/kingjones30/superroc/blob/main/docs/LEMONADE.md
- Formatos ROCm-FP4 (ROCmFPX): https://github.com/charlie12345/ROCmFPX
