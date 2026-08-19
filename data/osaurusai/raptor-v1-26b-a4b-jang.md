# OsaurusAI/Raptor-V1-26B-A4B-JANG

## Resumen

Raptor V1 (26B-A4B-JANG) es una build cuantizada del modelo multimodal Gemma 4 26B-A4B-it de Google DeepMind, preparada por OsaurusAI para ejecución local en Apple Silicon mediante el runtime MLX. El modelo está diseñado como orquestador de agentes dentro del ecosistema Osaurus, un harness nativo de macOS que integra herramientas de sistema (archivos, shell, sandbox, base de datos, navegador, AppleScript y control del ordenador). Su arquitectura mixture-of-experts activa solo una fracción de los parámetros por token, lo que permite ejecutar un modelo de clase 26B en un portátil con recursos contenidos.

La build emplea cuantización mixta JANG (affine quantization) con precisión variable por módulo: atención y router en 8 bits, proyecciones de los expertos en 4 y 2 bits, y passthrough de alta precisión para embeddings, normas y el embedder de visión. El resultado ocupa unos 13 GB en disco y mantiene una ventana de contexto de 262.144 tokens. Es el primer lanzamiento de una futura "mezcla de modelos" especializados que Osaurus planea enrutar según la tarea; Raptor One asume el rol de orquestador, priorizando comportamiento agéntico y recuperación de errores frente a amplitud de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Gemma 4 26B-A4B-it |
| Parametros totales | 26B (modelo base) / 3.923.757.646 en safetensors cuantizados |
| Parametros activos | ~4B |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | JANG affine: 8-bit (attention, router, embeddings), 4-bit (gate_proj, primeras y últimas capas de up/down_proj), 2-bit (up/down_proj resto), group size 64 |
| Idiomas soportados | no disponible (heredados del modelo base Gemma 4) |
| Licencia | Apache-2.0 (con política de usos prohibidos de Google aplicable) |
| Formato de pesos | MLX (safetensors, 13 shards, ~13 GB) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 26B-A4B-it, un transformer multimodal de Google DeepMind con arquitectura MoE: de los 26.000 millones de parámetros totales, aproximadamente 4.000 millones se activan por token. Esto reduce el coste de decodificación al conjunto activo, permitiendo inferencia local en hardware de consumo. La build de OsaurusAI no modifica los pesos originales, sino que los cuantiza con el método JANG (backend `mx.quantize` de MLX), que aplica precisión mixta por módulo: 180 overrides individuales sobre 326 módulos cuantizados, con 624 tensores en passthrough de alta precisión. Las normas usan la convención `gemma4_scale_shift_zero` y el embedder de visión se conserva en fp16 con fusión temprana. El modelo base fue entrenado por Google DeepMind con datos multimodales (imagen y texto) y alineado mediante instrucciones; no se han publicado detalles adicionales sobre el dataset de entrenamiento en la información disponible.

## Capacidades

- Generación de texto y razonamiento conversacional multirround.
- Comprensión de imágenes (entrada visual con salida textual) gracias al embedder de visión preservado en fp16.
- Tool calling y function calling: integrado con la superficie de herramientas de Osaurus (archivos, shell, sandbox, base de datos, navegador, AppleScript, control del ordenador).
- Comportamiento agéntico: planificación multi-paso, ejecución de herramientas y recuperación ante fallos de llamadas.
- Ventana de contexto larga de 262.144 tokens, adecuada para sesiones prolongadas y documentos extensos.
- Capacidades multilingües heredadas del modelo base, aunque no se especifican los idiomas concretos.
- Configuración de muestreo sensible: requiere los valores de `top_k` incluidos en `generation_config.json` para mantener calidad.

## Casos de uso

- Asistente personal local en macOS: Raptor One puede gestionar conversaciones multi-turno con contexto largo (262K tokens) mientras ejecuta herramientas del sistema, como leer archivos, enviar correos o controlar aplicaciones, todo sin salir del dispositivo.
- Automatización de tareas de oficina: el modelo puede orquestar flujos que combinan shell, base de datos y navegador para generar informes, consolidar datos o actualizar registros, con recuperación automática ante errores de ejecución.
- Agente de desarrollo de software: aunque no es un especialista en código, puede planificar tareas, invocar herramientas de línea de comandos y editar archivos en un repositorio local, sirviendo como capa de orquestación para un flujo de trabajo de programación asistida.
- Análisis de documentos con visión: al conservar el embedder de visión, puede procesar capturas de pantalla o imágenes de documentos y extraer información textual, útil para resumir facturas, formularios o diagramas.
- Investigación y estudio con contexto largo: su ventana de 262K tokens permite cargar libros técnicos completos o conjuntos de papers y mantener una conversación coherente sobre ellos sin perder referencias anteriores.
- Prototipado de agentes en entornos aislados: gracias al sandbox integrado, se pueden probar flujos agénticos que manipulan archivos y ejecutan comandos en un entorno controlado, ideal para desarrollo y pruebas de automatización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las cifras de otros modelos o cuantizaciones no son transferibles y se omiten deliberadamente en lugar de estimarse. Los números se añadirán cuando se midan sobre este artefacto concreto.

## Requisitos de hardware

- Apple Silicon (chip serie M, cualquier generación).
- macOS con Osaurus instalado o cualquier runtime basado en MLX.
- ~13 GB de espacio libre en disco para los pesos.
- Memoria RAM suficiente para mantener el conjunto residente del modelo junto con otras aplicaciones; no se especifica un valor mínimo, pero dado el tamaño de 13 GB y la cuantización agresiva, se recomienda al menos 16 GB de memoria unificada para un uso cómodo.
- GPU integrada del chip Apple Silicon (no requiere GPU discreta).
- Opciones de despliegue: Osaurus (harness nativo), o cualquier runtime MLX que cargue safetensors.
- Latencia y throughput: no disponibles; dependen del chip concreto y de la memoria disponible.

## Comparativa con modelos similares

No se dispone de benchmarks publicados para este build, por lo que la comparación se limita a especificaciones técnicas frente a alternativas MoE de tamaño similar:

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Raptor V1 26B-A4B-JANG | 26B | ~4B | 262.144 | Apache-2.0 | MLX (cuantizado JANG) |
| Gemma 4 26B-A4B-it (base) | 26B | ~4B | 262.144 | Apache-2.0 | safetensors (bf16) |
| Qwen3-30B-A3B (referencia) | 30B | ~3B | 131.072 | Apache-2.0 | safetensors, GGUF |
| Gemma 3 27B (referencia) | 27B | denso | 128.000 | Gemma license | safetensors, GGUF |

La diferencia clave de Raptor V1 frente al base es la cuantización JANG orientada a Apple Silicon y la integración con el harness de agentes Osaurus; frente a Qwen3-30B-A3B, ofrece mayor contexto (262K vs 131K) y capacidades multimodales, pero carece de benchmarks publicados para comparar rendimiento real.

## Limitaciones y advertencias

- No se han publicado benchmarks para este build, por lo que el rendimiento real en tareas estándar (MMLU, HumanEval, GSM8K) es desconocido.
- El modelo está optimizado para el ecosistema Osaurus; su uso fuera de este harness puede requerir adaptaciones y no se garantiza el mismo comportamiento agéntico.
- La cuantización agresiva (2 bits en proyecciones de expertos) puede degradar la calidad de salida en tareas que exijan precisión numérica o razonamiento complejo, aunque la precisión mixta intenta mitigarlo.
- La política de usos prohibidos de Google para modelos Gemma aplica a este derivado; es necesario revisar los términos antes de usar el modelo en producción.
- El modelo base puede presentar sesgos y alucinaciones propios de los datos de entrenamiento de Google; la cuantización no corrige estos problemas.
- La dependencia de `top_k` en la configuración de muestreo implica que cambios en los parámetros por defecto pueden degradar notablemente la calidad de generación.
- No se especifican los idiomas soportados, aunque se heredan del modelo base Gemma 4.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una adopción muy reciente o limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OsaurusAI/Raptor-V1-26B-A4B-JANG
- Repositorio Osaurus en GitHub: https://github.com/osaurus-ai/osaurus
- Web de Osaurus: https://osaurus.ai/
- Modelo base Gemma 4 26B-A4B-it: https://huggingface.co/google/gemma-4-26B-A4B-it
- Términos de licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
