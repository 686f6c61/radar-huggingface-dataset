# Polydim-Einsof/qwen3-8b-pmtp

## Resumen

qwen3-8b-pmtp es un adaptador de investigación publicado por Polydim-Einsof (Ariel García Traba) sobre el modelo base Qwen/Qwen3-8B-Instruct. El autor lo presenta como una implementación de "PMTP" (Stiefel Manifold Adapter) dentro de la iniciativa POLYDIM/EINSOF, orientada a la transferencia de "pensamiento continuo" mediante una proyección geométrica sobre una variedad de Stiefel. El repositorio no contiene pesos en el momento de la consulta (tamaño 0.0 GB) y no registra descargas ni interacciones.

La propuesta técnica descrita en la model card es una reducción de dimensión del espacio de representación del modelo (de d_model = 4096 a una subvariedad canónica de 2048 dimensiones) sobre la esfera S^2047, con acumulación en FP64 (Neumaier) y un contrato de interoperabilidad nativo en C++20/Rust 2024 con AVX2. Se menciona asimismo la integración de 1.740 teoremas formales almacenados en PostgreSQL 16 y un "Zero-Worm Protocol" que evita la serialización intermedia en JSON/Markdown.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: no hay artefactos descargables, no hay resultados de evaluación publicados y la terminología empleada (teoremas integrados, transferencia de pensamiento continuo) no se corresponde con técnicas estándar de ajuste supervisado o RLHF documentadas en la literatura. Se trata, por tanto, de un anuncio de arquitectura experimental más que de un modelo listo para uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3-8B-Instruct) con adaptador geométrico PMTP sobre variedad de Stiefel St(4096, 2048) en S^2047 |
| Parámetros totales | no disponible (el modelo base Qwen3-8B-Instruct tiene 8.000 millones; el adaptador no especifica recuento) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no se declara en la model card; el modelo base Qwen3 soporta contexto largo, pero no se confirma para este adaptador) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (la model card indica "qwen-community-license", no verificable en el repositorio) |
| Formato de pesos | safetensors (según tags); repositorio vacío en el momento de la consulta (0.0 GB) |

## Arquitectura y entrenamiento

La model card describe un adaptador que proyecta las representaciones del modelo base desde un espacio de dimensión 4096 a una subvariedad canónica de dimensión 2048, definida como una variedad de Stiefel St(4096, 2048) embebida en la esfera unitaria S^2047. El cálculo se realiza con acumulador de Neumaier en FP64, y se reporta un "Stiefel defect" de 4,73e-09, métrica de ortogonalidad numérica de la base proyectada. Se menciona un contrato de implementación nativa en C++20 y Rust 2024 con instrucciones AVX2 y un bus de memoria compartida (PmtpShmBus) en IEEE-754 FP64.

No se especifican datos de entrenamiento: no se indica número de tokens, composición del dataset, ni si hubo ajuste supervisado, RLHF o DPO. La referencia a "1.740 teoremas formales" procedentes de una base de datos PostgreSQL (polydim_vec_db) no se acompaña de descripción metodológica sobre cómo se integran en el entrenamiento o en la inferencia. Tampoco se documenta el "Zero-Worm Protocol" más allá de la afirmación de que evita la serialización intermedia en JSON/Markdown mediante un identificador SLAB_ID. En conjunto, la información disponible no permite reproducir el proceso de construcción del adaptador.

## Capacidades

- No se documentan capacidades específicas del adaptador en la model card.
- Se heredan, en principio, las capacidades del modelo base Qwen3-8B-Instruct: generación de texto, razonamiento, código y matemáticas.
- Soporte de tool calling y function calling: no disponible para el adaptador (el modelo base Qwen3 lo soporta, pero no se confirma su preservación).
- Soporte de agentes y razonamiento multi-paso: el autor lo etiqueta como "Agentic Planning", sin evidencia publicada.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.
- Transferencia de "pensamiento continuo" vía SLAB_ID: afirmación del autor sin especificación técnica verificable.

## Casos de uso

- Investigación sobre geometría de representaciones: el adaptador podría emplearse para estudiar cómo se comporta una proyección ortogonal de las activaciones de Qwen3-8B sobre una subvariedad de Stiefel, comparando la fidelidad de la reconstrucción con el defecto reportado de 4,73e-09.
- Experimentos de compresión de representaciones: la reducción de 4096 a 2048 dimensiones puede analizarse como técnica de cuello de botella en tareas de clasificación o recuperación, midiendo la pérdida de rendimiento frente al modelo base.
- Reproducción de resultados numéricos: el uso de acumulación FP64 con Neumaier y AVX2 permite validar la estabilidad numérica de la proyección en entornos de cómputo científico.
- Integración en pipelines nativos C++20/Rust: el contrato PmtpShmBus podría explorarse para comunicación de baja latencia entre procesos en arquitecturas de agentes, siempre que se publique el código correspondiente.
- Docencia y divulgación: como ejemplo de propuesta de adaptación geométrica sobre un LLM open source, útil para discutir los límites entre innovación metodológica y marketing técnico.
- Evaluación crítica de model cards: el repositorio sirve como caso de estudio sobre afirmaciones no verificables (teoremas integrados, protocolos propietarios) en publicaciones de investigación independiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador; el modelo base Qwen3-8B-Instruct requiere aproximadamente 16 GB en FP16 y alrededor de 6-8 GB en cuantización de 4 bits, pero no se confirma que el adaptador sea compatible con esas rutas.
- GPU recomendadas: no disponible; por herencia del modelo base, una RTX 4090 (24 GB) o A100/H100 serían suficientes en FP16, sin datos de rendimiento del adaptador.
- Cabe en GPU de consumo: probablemente sí en el modelo base cuantizado, pero el adaptador no publica pesos ni instrucciones de carga.
- Opciones de despliegue: la model card menciona la etiqueta Ollama `qwen3:8b`, que corresponde al modelo base, no al adaptador. No se documenta compatibilidad con vLLM, llama.cpp, TGI ni Ollama para este repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen3-8b-pmtp | no disponible (base 8B) | no disponible | other (qwen-community-license según autor) | Repositorio vacío (0.0 GB) |
| Qwen/Qwen3-8B-Instruct | 8B | no disponible en esta ficha | qwen-community-license | Pesos publicados en Hugging Face |
| Adaptadores LoRA/QLoRA sobre Qwen3-8B | Variable (típicamente <1% del total) | Heredado del base | Según autor | Habitualmente con pesos safetensors publicados |

No se dispone de datos de rendimiento del adaptador que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El repositorio no contiene pesos (0.0 GB) ni código de carga; no es utilizable en la práctica en el momento de la consulta.
- No hay resultados de evaluación, benchmarks ni métricas de calidad publicadas.
- La terminología empleada (teoremas formales integrados, Zero-Worm Protocol, pensamiento continuo) no se acompaña de especificación reproducible ni de referencias a literatura revisada por pares.
- La licencia declarada como "other" y la mención a "qwen-community-license" deben verificarse antes de cualquier uso comercial; la licencia de Qwen3 impone restricciones adicionales.
- Riesgo elevado de alucinación y de sobreinterpretación de las capacidades declaradas, al no existir evidencia empírica.
- No se documentan sesgos, cobertura idiomática ni comportamiento en contextos largos.
- El "Stiefel defect" de 4,73e-09 es una métrica numérica de ortogonalidad, no un indicador de calidad del modelo.
- Para producción, se recomienda usar directamente Qwen/Qwen3-8B-Instruct o adaptadores con pesos y evaluaciones publicadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Polydim-Einsof/qwen3-8b-pmtp
- Repositorio GitHub del autor: https://github.com/AGT1973/POLYDIM_EINSOF
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Instruct
