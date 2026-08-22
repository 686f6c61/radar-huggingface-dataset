# mradermacher/Orbit-GGUF

## Resumen

Orbit es un modelo de lenguaje de arquitectura Mixture of Experts (MoE) con 34,66 mil millones de parámetros totales, desarrollado por el usuario beyoru y cuantizado a formato GGUF por mradermacher para su uso con llama.cpp y ecosistemas afines. El modelo se presenta como una destilación de Claude Opus 5 con configuración de carga de trabajo "xhigh", orientada a tareas de agente, uso de herramientas (tool-use), razonamiento, generación de código y operación en terminal. El dataset de entrenamiento indicado es `beyoru/claude-opus-5-xhigh-workload-agent`, lo que sugiere un ajuste fino supervisado con datos sintéticos de alta complejidad.

La relevancia de este modelo reside en su combinación de arquitectura MoE con un enfoque específico en escenarios de agente autónomo, donde la ventana de contexto larga y el soporte de tool calling son críticos. Además, incluye un proyector multimodal (mmproj) en las cuantizaciones GGUF, lo que permite entrada de imágenes. Está licenciado bajo MIT, lo que facilita su uso comercial sin restricciones. El idioma principal de entrenamiento es inglés, con soporte secundario de vietnamita, aunque su capacidad multilingüe real no está documentada en detalle.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) |
| Parámetros totales | 34.660.610.688 (~34,66B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF: Q2_K, Q3_K_M, Q4_K_S, Q6_K, Q8_0; mmproj-f16 y mmproj-Q8_0 (proyector multimodal) |
| Idiomas soportados | inglés (en), vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estáticas) |

## Arquitectura y entrenamiento

Orbit es un modelo de arquitectura Mixture of Experts, según las etiquetas de la model card (`moe`). No se dispone de información pública sobre el número de expertos, el router o la proporción de parámetros activos por token. El entrenamiento se realizó mediante destilación de Claude Opus 4 con configuración de carga de trabajo "xhigh", un término que sugiere tareas de alta complejidad y largas secuencias de razonamiento. El dataset `beyoru/claude-opus-5-xhigh-workload-agent` indica que se generaron ejemplos de interacción agente-herramienta, probablemente con trazas de uso de terminal, llamadas a funciones y razonamiento multi-paso. La técnica de destilación no está documentada en detalle; no se confirma el uso de RLHF, DPO o ESFT (embedding-specific fine-tuning) aunque el tag `esft` aparece en la model card.

El modelo incluye un proyector multimodal (`mmproj`) en las cuantizaciones GGUF, lo que sugiere que la arquitectura base soporta entrada de imágenes además de texto. El tamaño del repositorio original (149,8 GB en safetensors) es consistente con un modelo MoE de ~34,7B parámetros con pesos en precisión completa.

## Capacidades

- Generación de texto y razonamiento multi-paso, orientado a tareas de agente autónomo.
- Soporte de tool calling y function calling, según los tags de la model card (`tool-use`).
- Capacidades de agente: encadenamiento de llamadas a herramientas, planificación y ejecución de tareas complejas.
- Generación de código y operación en terminal (tag `terminal`), útil para agentes que ejecutan comandos.
- Entrada multimodal (visión) gracias al proyector mmproj incluido en las cuantizaciones GGUF.
- Razonamiento avanzado por destilación de Claude Opus 4 con configuración xhigh, orientado a cargas de trabajo de alta complejidad.
- Soporte multilingüe limitado: inglés y vietnamita declarados.

## Casos de uso

- Automatización de tareas de operaciones de TI: el modelo puede ejecutar comandos de terminal, interpretar salidas y tomar decisiones en pipelines de despliegue, gracias a su entrenamiento con trazas de terminal y tool-use.
- Asistentes de desarrollo con agente autónomo: integración en entornos como Cline, OpenHands o Aider para tareas de refactorización, generación de tests y resolución de issues en repositorios, aprovechando su razonamiento multi-paso.
- Sistemas de atención al cliente con contexto largo: aunque la ventana de contexto no está documentada, su capacidad para mantener conversaciones multi-turno con llamadas a herramientas lo hace adecuado para bots que consultan bases de datos o APIs.
- Análisis de documentos con visión: gracias al proyector multimodal, puede procesar capturas de pantalla, diagramas o documentos escaneados dentro de un pipeline de agente.
- Investigación y experimentación con modelos MoE: los investigadores pueden estudiar el comportamiento de destilación de un modelo grande (Claude Opus 4) en un formato compacto de 34,7B con arquitectura MoE.
- Generación de código en pipelines de CI/CD: con soporte de tool calling, puede integrarse en pipelines para generar parches, validar sintaxis o escribir documentación automáticamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se dispone de comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización GGUF:
  - Q2_K: ~13 GB, cabe en RTX 3090/4090 (24 GB).
  - Q3_K_M: ~17 GB, cabe en RTX 4090 o A5000.
  - Q4_K_S: ~20 GB, cabe en RTX 4090, A6000 o A100 40 GB.
  - Q6_K: ~28,6 GB, requiere GPU con 32 GB o más (A100 40 GB, H100).
  - Q8_0: ~37 GB, requiere GPU de 40 GB o más (A100 40 GB, H100 80 GB).
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4_K_S y menores; A100 40 GB o H100 para Q6_K y Q8_0.
- Posibilidad de ejecución en GPU consumer: sí, con cuantizaciones Q2_K a Q4_K_S en tarjetas de 24 GB (RTX 3090/4090).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, o cualquier cliente compatible con GGUF. También es posible cargar el modelo base (safetensors) con vLLM o TGI si se convierte a formato compatible.
- Latencia y throughput: no disponibles; dependen de la cuantización, la GPU y el número de expertos activos (desconocido).

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables en la misma categoría (MoE de ~34,7B destilado para agentes). La categoría de modelos MoE de tamaño similar incluye alternativas como Qwen2.5-MoE o Mixtral 8x7B, pero no hay datos públicos de rendimiento de Orbit para comparar directamente.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser una destilación de Claude Opus 4, puede heredar sesgos del modelo original, aunque no hay estudios públicos sobre este modelo concreto.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no documentado específicamente para Orbit.
- Contexto y idiomas: la ventana de contexto no está documentada; el soporte multilingüe se limita a inglés y vietnamita, por lo que su rendimiento en otros idiomas (incluido el español) es incierto.
- Restricciones de licencia: licencia MIT, permite uso comercial sin restricciones, pero hay que verificar la licencia del modelo base (beyoru/Orbit) y del dataset de destilación.
- Calidad de cuantización: los quants GGUF son estáticos (sin imatrix ni weighted quantization), por lo que la calidad puede ser inferior a versiones con imatrix de otros autores.
- Soporte multimodal: el proyector mmproj está incluido, pero no se garantiza que el modelo base tenga una arquitectura de visión robusta; es una funcionalidad adicional no documentada en detalle.
- Producción: la falta de benchmarks y de información sobre parámetros activos dificulta la evaluación de rendimiento y la planificación de recursos en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Orbit-GGUF
- Modelo base: https://huggingface.co/beyoru/Orbit
- Dataset de entrenamiento: https://huggingface.co/datasets/beyoru/claude-opus-5-xhigh-workload-agent
- Página de descarga de mradermacher: https://hf.tst.eu/model#Orbit-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
