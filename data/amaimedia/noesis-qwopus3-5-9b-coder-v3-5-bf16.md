# AMAImedia/NOESIS-Qwopus3.5-9B-Coder-v3.5-BF16

## Resumen

NOESIS-Qwopus3.5-9B-Coder-v3.5-BF16 es un modelo de lenguaje especializado en código, publicado por AMAImedia como parte de su plataforma NOESIS de automatización de doblaje multilingüe (framework DHCF-FNO). Se trata de un derivado afinado de Qwen/Qwen3.5-9B, construido sobre el checkpoint intermedio Jackrong/Qwopus3.5-9B-v3.5, y distribuido en formato BF16 safetensors junto con un artefacto GGUF Q4_K_M en el subdirectorio `gguf/` del mismo repositorio.

El modelo cuenta con 8.953.803.264 parámetros (aproximadamente 9B) y está orientado a generación de código, transformación de código, asistencia en depuración, trabajo sobre repositorios y seguimiento de instrucciones técnicas. Hereda la cobertura lingüística declarada de la familia Qwen3.5, que el autor cifra en 201 idiomas y dialectos, con una lista documentada de 119 idiomas procedente de Qwen3 como base transparente.

Su relevancia actual radica en que combina un tamaño de 9B —desplegable en hardware de consumo con cuantización— con una licencia Apache 2.0 y artefactos tanto en BF16 como en GGUF, lo que facilita su integración en pipelines locales de desarrollo asistido por IA sin depender de API externas. El repositorio tiene 952 descargas y 2 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5_text`) |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (artefacto principal) y GGUF Q4_K_M (en `gguf/`) |
| Idiomas soportados | Cobertura declarada de 201 idiomas y dialectos (Qwen3.5); lista documentada de 119 idiomas (Qwen3); idiomas destacados en la ficha: en, ru, kk, zh, ja, vi y más |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su pertenencia a la familia Qwen3.5 con tag `qwen3_5_text`, lo que implica un transformer decoder-only de tipo texto. No se especifican innovaciones como atención lineal, decodificación especulativa o arquitecturas híbridas SSM. El modelo es un afinamiento en dos etapas: parte de Qwen/Qwen3.5-9B y pasa por Jackrong/Qwopus3.5-9B-v3.5 antes de recibir el ajuste específico de AMAImedia orientado a código.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares. El autor indica que el checkpoint BF16 y la variante GGUF se mantienen juntos en el mismo repositorio y no son repacks externos, lo que sugiere control directo sobre el proceso de conversión y cuantización.

## Capacidades

- Generación de código en múltiples lenguajes de programación, orientada a producción y a tareas de transformación de código existente.
- Asistencia en depuración: análisis de errores, propuesta de correcciones y explicación de causas raíz.
- Trabajo sobre repositorios: comprensión de estructuras de proyecto y seguimiento de instrucciones técnicas de varios pasos.
- Seguimiento de instrucciones técnicas complejas, con énfasis en precisión sobre creatividad.
- Capacidades multilingües heredadas de Qwen3.5, con cobertura declarada de 201 idiomas y dialectos y lista documentada de 119.
- Conversación multi-turno (tag `conversational`) con plantilla de chat incluida en el repositorio.
- Compatibilidad con endpoints (`endpoints_compatible` según los tags del repositorio).
- No se documenta soporte explícito de tool calling, function calling, agentes autónomos, visión, audio ni modo de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Asistencia de código en IDE local: el modelo puede ejecutarse con llama.cpp u Ollama a partir del GGUF Q4_K_M incluido, ofreciendo autocompletado y generación de funciones sin enviar código a servicios externos, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Refactorización y transformación de código: dado su enfoque en "code transformation", puede emplearse para migrar código entre versiones de lenguaje o aplicar patrones de diseño de forma sistemática sobre archivos individuales.
- Depuración asistida en pipelines de CI: integrado como paso de análisis, puede generar explicaciones de fallos a partir de trazas y sugerir parches, aprovechando su entrenamiento en seguimiento de instrucciones técnicas.
- Generación de documentación técnica: a partir de firmas de funciones y bloques de código, el modelo puede producir docstrings y documentación de API en varios idiomas, apoyándose en su cobertura multilingüe.
- Automatización de doblaje y localización: dado que nace dentro de la plataforma NOESIS de doblaje multilingüe, encaja en tareas de procesamiento de texto asociadas a localización, como adaptación de guiones o generación de metadatos técnicos.
- Prototipado rápido en hardware de consumo: con 9B parámetros y una cuantización Q4_K_M, puede desplegarse en equipos con GPU de gama media o incluso en CPU con suficiente RAM, sirviendo como banco de pruebas para flujos de agentes de código antes de escalar a modelos mayores.
- Educación y revisión de código: puede explicar fragmentos de código y señalar posibles errores en contextos formativos, en varios idiomas gracias a su cobertura lingüística.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 18 GB solo para pesos (8.953.803.264 parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica requiere GPUs de 24 GB o más para contexto moderado.
- VRAM estimada en GGUF Q4_K_M: aproximadamente 5,5-6 GB para los pesos, con margen adicional para contexto; viable en GPUs de 8 GB.
- GPUs recomendadas para BF16: A100 40/80 GB, H100, L40S, RTX A6000 o RTX 4090 (24 GB) con contexto limitado.
- GPUs para cuantización Q4_K_M: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; también cabe en GPUs de 8 GB con contexto reducido.
- El autor indica que su hardware local es una RTX 3060 Laptop de 6 GB, suficiente para trabajo con cuantizaciones pequeñas, y que los trabajos de 9B+ requieren GPUs alquiladas tipo H200/Blackwell.
- Opciones de despliegue: transformers (BF16), llama.cpp y entornos compatibles con GGUF (Ollama, LM Studio); vLLM y TGI no se mencionan explícitamente en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NOESIS-Qwopus3.5-9B-Coder-v3.5-BF16 | 8,95B | no disponible | Apache 2.0 | safetensors BF16 + GGUF Q4_K_M | Especializado en código, derivado de Qwen3.5-9B |
| Qwen/Qwen3.5-9B | aproximadamente 9B | no disponible | no disponible en la informacion | safetensors | Modelo base original; cobertura de 201 idiomas declarada |
| Jackrong/Qwopus3.5-9B-v3.5 | aproximadamente 9B | no disponible | no disponible en la informacion | safetensors | Checkpoint intermedio sobre el que se afina este modelo |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes. La comparativa se limita a linaje, licencia y formatos de distribución.

## Limitaciones y advertencias

- Es un modelo especializado en código; su rendimiento en tareas generales de conocimiento o conversación abierta puede ser inferior al de modelos de propósito general del mismo tamaño.
- Riesgo de alucinación inherente a los modelos de lenguaje: puede generar APIs, funciones o dependencias inexistentes, especialmente en lenguajes o frameworks poco representados en su entrenamiento.
- No se documentan evaluaciones de sesgo; al heredar datos de Qwen3.5, puede reproducir sesgos presentes en corpus web multilingües.
- La longitud de contexto no está especificada, lo que impide planificar tareas de análisis de repositorios completos sin verificación empírica previa.
- La cobertura de 201 idiomas es una declaración del autor basada en Qwen3.5; la lista verificable es de 119 idiomas (Qwen3), por lo que el soporte real de los idiomas restantes no está documentado.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base Qwen3.5 y del checkpoint intermedio antes de un uso comercial a gran escala.
- El repositorio incluye material promocional y de donaciones en la model card; no afecta al uso del modelo, pero conviene separar esa información de la documentación técnica.
- No se documenta soporte de tool calling ni de agentes, por lo que integrarlo en flujos agénticos requiere validación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/AMAImedia/NOESIS-Qwopus3.5-9B-Coder-v3.5-BF16
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-9B
- Checkpoint intermedio: https://huggingface.co/Jackrong/Qwopus3.5-9B-v3.5
- Organización: https://AMAImedia.com
- X (Twitter): https://x.com/AMAImediacom
- LinkedIn: https://www.linkedin.com/in/ilia-bolotnikov
- Telegram: https://t.me/djbionicl
