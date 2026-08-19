# Flashtond22/Taltos-27B

## Resumen

Táltos-27B es un modelo de lenguaje y visión (image-text-to-text) desarrollado por el usuario Flashtond22, específicamente afinado para el idioma húngaro. Parte del modelo base Qwen/Qwen3.8-27B, que ya incorpora una arquitectura híbrida de atención, y lo adapta para producir texto natural en húngaro, realizar razonamientos paso a paso en ese idioma y admitir entradas multimodales (imagen y vídeo). Su nombre hace referencia al chamán de la mitología húngara, y el autor lo presenta como un modelo "que sabe, ve y explica".

La relevancia actual del modelo radica en que aborda un hueco en el ecosistema open source: la calidad del húngaro en modelos generativos de gran tamaño. Con 27.800 millones de parámetros (dense), una ventana de contexto de 262.144 tokens y una licencia Apache 2.0, se posiciona como una opción viable para producción en entornos húngaros. El autor publica además variantes en FP8 y GGUF para facilitar el despliegue en hardware diverso, desde servidores hasta equipos domésticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (Gated DeltaNet + Gated Attention), 64 capas |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | No aplicable (modelo dense, no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | bf16 (nativo), FP8, GGUF (repositorios separados) |
| Idiomas soportados | Húngaro (hu), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, FP8), GGUF |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.8-27B, que emplea una arquitectura híbrida de 64 capas combinando Gated DeltaNet (una variante de atención lineal con estado recurrente) y Gated Attention. Esta combinación permite manejar ventanas de contexto muy largas (262.144 tokens) con un coste computacional subcuadrático. Táltos-27B mantiene esta arquitectura y añade un modo de razonamiento ("thinking mode") activable mediante el parámetro `enable_thinking`.

El entrenamiento se realizó mediante un procedimiento propio de tres pasos. El autor separa la calidad del contenido de la forma lingüística: primero genera un esquema profesional, después lo convierte en texto húngaro nativo y finalmente lo transforma en una cadena de razonamiento en húngaro. La hipótesis es que los modelos son más fuertes en paráfrasis que en generación abierta en húngaro, por lo que maximiza ambas fases por separado. El ajuste fino afecta a toda la red y se ejecutó en una única GPU NVIDIA L40S. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset, más allá de que incluye ejemplos de exámenes de bachillerato (érettségi), redacción, gramática, cultura y argumentación.

## Capacidades

- Generación de texto en húngaro con corrección gramatical mejorada respecto al modelo base, incluyendo la eliminación de errores comunes de declinación y concordancia.
- Modo de razonamiento (thinking mode) en húngaro, activable o desactivable mediante `enable_thinking`, que produce cadenas de pensamiento paso a paso.
- Comprensión multimodal: acepta entradas de imagen y vídeo (pipeline `image-text-to-text`), aunque la ficha no detalla el procesador visual específico más allá del de la base Qwen.
- Ventana de contexto de 262.144 tokens, adecuada para procesar documentos largos, libros o conversaciones extensas en una sola pasada.
- Capacidad de reconocer y comunicar incertidumbre: el autor indica que el modelo está entrenado para decir explícitamente cuando no sabe algo, en lugar de alucinar.
- Soporte de tool calling / function calling: no se menciona explícitamente en la información proporcionada, aunque al heredar la base Qwen3.8-27B es probable que conserve esta capacidad.

## Casos de uso

- Atención al cliente automatizada en húngaro: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262.144 tokens de ventana, manteniendo el historial completo sin truncamientos y respondiendo con naturalidad nativa.
- Generación de contenido administrativo y oficial: redacción de cartas de reclamación, actas, resúmenes y textos formales en húngaro, donde la corrección gramatical es crítica. El autor demuestra mejoras concretas en este tipo de tareas.
- Asistente educativo para preparación de exámenes: el entrenamiento incluye ejemplos de érettségi (examen de bachillerato húngaro), por lo que puede generar ejercicios, corregir respuestas y explicar conceptos de historia, lengua o cultura húngara.
- Análisis de documentos extensos en húngaro: con 262K tokens de contexto, puede resumir informes, tesis o contratos largos sin necesidad de chunking previo, manteniendo la coherencia del documento completo.
- Razonamiento y debate en húngaro: el modo thinking permite desglosar argumentos complejos, verificar afirmaciones falsas y construir líneas de razonamiento estructuradas, útil para investigación o análisis jurídico.
- Localización y traducción húngaro-inglés: al estar entrenado en ambos idiomas, puede traducir y adaptar contenido entre hu y en, preservando matices culturales y evitando traducciones literales (tükörfordítás).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor presenta una evaluación interna comparando Táltos-27B con su modelo base Qwen3.8-27B sobre 55 tareas en húngaro (exámenes, redacción, gramática, cultura y argumentación). El ganador de cada comparación fue elegido por un modelo independiente (Gemma-4-31B) con el orden de respuestas aleatorizado.

| Resultado | Proporcion |
|---|---|
| Táltos-27B mejor que el base | 50,9 % |
| Modelo base mejor que Táltos | 40,0 % |
| Empate | 9,1 % |
| Preferencia global por Táltos | 55,5 % |

Las mayores diferencias se observan en tareas de examen (18 victorias frente a 13), argumentación y debate (2 a 0) y corrección de afirmaciones falsas. También se reportan métricas lingüísticas:

| Metrica linguistica | Modelo base | Táltos-27B |
|---|---|---|
| Densidad de acentos hungaros | 0,0728 | 0,0753 |
| Longitud media de respuesta | 1.775 caracteres | 1.649 caracteres |

## Requisitos de hardware

- Variante bf16: 56 GB de pesos, requiere aproximadamente 58 GB de VRAM. Adecuado para GPUs de servidor como A100 80GB, H100 o similar.
- Variante FP8: 30 GB de pesos, requiere aproximadamente 32 GB de VRAM. Cabe en una GPU de 40 GB como la L40S (la usada para entrenar) o A100 40GB.
- Variante GGUF: desde 10 GB de pesos, con requisitos de VRAM desde 12 GB. Permite ejecución en GPUs de consumo como RTX 3090, RTX 4090 o incluso en CPU.
- Opciones de despliegue: vLLM recomendado por el autor (con `--reasoning-parser qwen3`), así como transformers estándar. Para GGUF, es compatible con Ollama, LM Studio y otras herramientas de inferencia local.
- Latencia y throughput: no se proporcionan datos específicos, pero al ser un modelo dense de 27,8 B, se espera un throughput moderado en vLLM con FP8 (típicamente 30-60 tokens/s en una L40S, dependiendo de la longitud de entrada).

## Comparativa con modelos similares

La comparativa directa más relevante es contra su modelo base, Qwen3.8-27B, ya que no se dispone de información sobre otros modelos afinados específicamente para húngaro en la información proporcionada.

| Parametro | Táltos-27B | Qwen3.8-27B (base) |
|---|---|---|
| Parametros | 27,8 B (dense) | 27,8 B (dense) |
| Contexto | 262.144 tokens | 262.144 tokens |
| Idiomas | Húngaro e inglés | Multilingue (incluye húngaro) |
| Calidad en hungaro | Mejorada (55,5 % preferencia) | Referencia |
| Multimodal | Imagen y video | Imagen y video |
| Licencia | Apache 2.0 | Apache 2.0 |

No se dispone de información sobre otros modelos comparables específicos para húngaro en el mismo rango de parámetros. Para tareas generales, alternativas como Llama 3.1 70B o Mistral Large ofrecen más parámetros pero no están optimizadas para húngaro y requieren más hardware.

## Limitaciones y advertencias

- Modelo muy reciente (agosto de 2026) con cero descargas y cero likes en HuggingFace al momento de la consulta, lo que implica una validación comunitaria nula y un riesgo elevado de comportamiento inesperado en producción.
- La evaluación del autor es interna y utiliza un juez automático (Gemma-4-31B); no hay benchmarks externos ni validación independiente de las afirmaciones de calidad.
- El entrenamiento se centra en húngaro; el rendimiento en inglés puede verse degradado respecto al modelo base, aunque no se aportan datos al respecto.
- La ventana de contexto de 262.144 tokens es teórica; no se verifica el rendimiento real a longitudes extremas en la ficha, y el uso de atención lineal (Gated DeltaNet) puede afectar a la calidad de recuperación de información en tramos muy largos.
- Riesgo de alucinación: aunque el modelo está entrenado para declarar incertidumbre, no se cuantifica la tasa de alucinación en tareas factuales húngaras.
- No se especifican sesgos conocidos, pero al estar entrenado sobre datos culturales húngaros puede reflejar sesgos locales no documentados.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el modelo ni sobre su idoneidad para aplicaciones críticas.

## Enlaces

- Repositorio principal (bf16): https://huggingface.co/Flashtond22/Taltos-27B
- Variante FP8: https://huggingface.co/Flashtond22/Taltos-27B-FP8
- Variante GGUF: https://huggingface.co/Flashtond22/Taltos-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
