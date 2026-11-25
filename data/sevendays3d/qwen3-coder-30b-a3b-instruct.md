# SevenDays3D/Qwen3-Coder-30B-A3B-Instruct

## Resumen

Qwen3-Coder-30B-A3B-Instruct es un modelo de lenguaje especializado en programación y tareas agénticas, desarrollado originalmente por el equipo Qwen de Alibaba. La versión aquí descrita es una cuantización en formato GGUF publicada por el usuario SevenDays3D en Hugging Face, que redistribuye los pesos del modelo base oficial bajo licencia Apache 2.0. El modelo emplea una arquitectura Mixture-of-Experts (MoE) con 30.500 millones de parámetros totales, de los cuales solo unos 3.300 millones se activan por token, lo que permite un rendimiento elevado con un coste computacional de inferencia relativamente bajo.

Su rasgo más distintivo es la ventana de contexto nativa de 262.144 tokens, ampliable hasta 1 millón mediante YaRN, lo que lo hace adecuado para comprensión de repositorios completos y flujos de trabajo agénticos de varios pasos. Está diseñado para funcionar en modo non-thinking (no genera bloques de razonamiento explícito) y ofrece soporte nativo de tool calling compatible con APIs estilo OpenAI, lo que facilita su integración en plataformas como Qwen Code, CLINE, Ollama, LM Studio, llama.cpp o KTransformers.

Esta ficha se centra en la variante GGUF publicada por SevenDays3D, que incluye recomendaciones específicas de ejecución en CPU (por ejemplo, el flag `--no-repack` para sistemas con 16 GB de RAM) y está etiquetada con idioma ruso, aunque el modelo base subyacente es multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con Mixture-of-Experts (MoE), atención GQA |
| Parametros totales | 30.532.122.624 (~30,5 mil millones) |
| Parametros activos | ~3.300 millones por token (8 de 128 expertos) |
| Longitud de contexto | 262.144 tokens nativos; hasta 1.000.000 con YaRN |
| Tipos de cuantizacion | GGUF (incluye Q4_K; otras variantes no detalladas en la información disponible) |
| Idiomas soportados | Etiquetado como `ru` en esta publicación; el modelo base es multilingüe (no se detalla la lista completa) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 137,2 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con 48 capas y arquitectura Mixture-of-Experts: 128 expertos en total, de los cuales se activan 8 por token. La atención utiliza Grouped Query Attention (GQA) con 32 cabezas para las consultas (Q) y 4 para las claves/valores (KV), lo que reduce el coste de memoria del KV cache en contextos largos. Es un modelo puramente textual, sin codificador visual.

El modelo opera exclusivamente en modo non-thinking: no genera bloques `` y no requiere pasar `enable_thinking=False`. Está afinado para instrucciones (Instruct) y para uso agéntico, con un formato específico de llamada a funciones que garantiza compatibilidad con plataformas de agentes de código. La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO más allá de la designación "Instruct". Se requiere `transformers >= 4.51.0` para cargar el modelo (de lo contrario aparece el error `KeyError: 'qwen3_moe'`).

## Capacidades

- Generación de texto y código en múltiples lenguajes de programación, con especial énfasis en tareas de ingeniería de software.
- Razonamiento agéntico multi-paso orientado a la resolución de tareas de código y navegación (Agentic Coding, Agentic Browser-Use).
- Tool calling / function calling nativo, compatible con APIs estilo OpenAI y con plataformas como Qwen Code y CLINE.
- Comprensión de repositorios completos gracias al contexto nativo de 256K tokens (hasta 1M con YaRN).
- Capacidades multilingües heredadas del modelo base (la publicación se etiqueta como `ru`, pero no se detalla la cobertura completa).
- Modo non-thinking únicamente: no emite cadenas de razonamiento explícitas.
- Sin capacidades de visión ni audio (modelo puramente textual).

## Casos de uso

- Asistente de programación en IDE: integrado mediante CLINE o extensiones compatibles con APIs OpenAI, el modelo puede leer archivos del proyecto, proponer parches y ejecutar llamadas a herramientas con contexto de hasta 256K tokens para abarcar varios módulos a la vez.
- Comprensión y refactorización de repositorios: con contexto nativo de 262.144 tokens (ampliable a 1M con YaRN), permite analizar bases de código extensas, detectar dependencias cruzadas y planificar refactorizaciones sin trocear el código.
- Agentes autónomos de resolución de incidencias: el soporte de tool calling permite conectar el modelo a sistemas de tickets, repositorios Git y pipelines de CI/CD para diagnosticar fallos y proponer correcciones de forma multi-paso.
- Automatización de revisión de código (code review): puede analizar diffs y PRs completos, señalar problemas de estilo, seguridad o lógica y sugerir cambios concretos, integrándose en flujos de GitHub Actions o GitLab CI.
- Despliegue local en estaciones de trabajo: las cuantizaciones GGUF (por ejemplo Q4_K) permiten ejecutarlo con llama.cpp u Ollama en equipos con 16 GB de RAM, usando `--no-repack` para duplicar la velocidad en CPU según el autor.
- Generación de documentación técnica y tests: a partir de un repositorio o de firmas de funciones, el modelo puede redactar documentación, docstrings y baterías de pruebas unitarias coherentes con el código existente.
- Servicio de inferencia compatible con OpenAI: puede desplegarse tras un endpoint compatible (vLLM, TGI, KTransformers) y sustituir a APIs propietarias en herramientas internas de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~30,5 mil millones de parámetros totales, las cuantizaciones GGUF de 4 bits rondan los 17-18 GB en disco y requieren memoria proporcional al tamaño del archivo más el KV cache.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, cabría esperar GPUs de 24 GB o más para cuantizaciones de 4 bits; el modelo base oficial admite despliegue en hardware de datacenter (A100, H100), pero no se confirma en esta publicación.
- En GPU de consumo: el autor indica que la variante Q4_K puede ejecutarse en CPU con 16 GB de RAM usando el flag `--no-repack`; no se confirma su funcionamiento en GPUs de consumo concretas.
- Opciones de despliegue: Ollama, LM Studio, MLX-LM, llama.cpp, KTransformers; también APIs compatibles con OpenAI. Se requiere `transformers >= 4.51.0` para carga nativa.
- Latencia y throughput: no disponibles. El autor señala que `--no-repack` duplica la velocidad en CPU en configuraciones con poca RAM, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Qwen3-Coder-30B-A3B-Instruct (esta variante GGUF) | 30,5B / ~3,3B | 262K (1M con YaRN) | Apache 2.0 | GGUF |
| Qwen3-Coder-30B-A3B-Instruct (oficial) | 30,5B / ~3,3B | 262K (1M con YaRN) | Apache 2.0 | safetensors |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otras alternativas comparables en la información proporcionada; la comparación se limita a la variante cuantizada frente al modelo base oficial.

## Limitaciones y advertencias

- Modo non-thinking exclusivo: no genera cadenas de razonamiento explícitas, lo que puede limitar tareas que se beneficien de un razonamiento paso a paso visible.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de fidelidad en esta publicación.
- La etiqueta de idioma de esta variante es `ru`; aunque el modelo base es multilingüe, no se detalla la cobertura ni el rendimiento por idioma.
- La cuantización GGUF puede degradar ligeramente la calidad frente a los pesos originales en safetensors; el autor no aporta métricas comparativas.
- En sistemas con 16 GB de RAM es necesario usar `--no-repack`; sin él el rendimiento en CPU puede ser la mitad.
- Con contextos muy largos (256K-1M) el consumo de memoria del KV cache crece considerablemente; el autor recomienda reducir el contexto (por ejemplo a 32.768) si aparece OOM.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base original y citar adecuadamente la autoría.
- Repositorio de 137,2 GB: requiere espacio en disco y ancho de banda considerables para su descarga.

## Enlaces

- Modelo en Hugging Face (esta variante GGUF): https://huggingface.co/SevenDays3D/Qwen3-Coder-30B-A3B-Instruct
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Repositorio Qwen en GitHub: no disponible en la información proporcionada
- Paper técnico: no disponible en la información proporcionada
- Blog o demo oficial: no disponible en la información proporcionada
