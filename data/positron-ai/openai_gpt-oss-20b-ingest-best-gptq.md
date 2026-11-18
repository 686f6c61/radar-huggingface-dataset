# positron-ai/openai_gpt-oss-20b-ingest-best-gptq

## Resumen

Este repositorio contiene una cuantización GPTQ de 4 bits del modelo `openai/gpt-oss-20b`, publicada por Positron AI. No se trata de un modelo nuevo, sino de un artefacto derivado del modelo abierto de OpenAI, reempaquetado para su ejecución en la infraestructura de inferencia sobre FPGA de Positron (runtime `tron`). El modelo base es un transformer de mezcla de expertos (MoE) con 20.914.757.184 parámetros totales, entrenado originalmente por OpenAI y distribuido bajo licencia Apache 2.0.

La relevancia de esta ficha es doble: por un lado, documenta una de las pocas cuantizaciones GPTQ publicadas del gpt-oss-20b; por otro, advierte de que el artefacto está optimizado para un target de hardware muy específico (FPGA con el runtime propietario `tron`) y no para GPU de propósito general. El autor recomienda explícitamente comparar con el modelo original y con otros formatos cuantizados antes de desplegarlo en producción.

El repositorio es pequeño en adopción (43 descargas, 0 likes en el momento de la consulta) y la model card no publica métricas de calidad ni de rendimiento. Cualquier evaluación de su fidelidad respecto al modelo base debe hacerse por cuenta del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), familia gpt_oss |
| Parametros totales | 20.914.757.184 (~20,9 mil millones) |
| Parametros activos | no disponible (la model card solo indica 16 expertos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ 4 bits, grupo de 64, simetrica, `desc_act=false`, damp 0,05; activaciones sin cuantizar; precision origen bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, pipeline text-generation) |

## Arquitectura y entrenamiento

El modelo base `openai/gpt-oss-20b` es un transformer de mezcla de expertos (MoE) de la familia gpt-oss de OpenAI, con aproximadamente 20,9 mil millones de parámetros totales. La model card de esta cuantización indica que se activan 16 expertos por token, pero no detalla el número total de expertos ni el reparto de parámetros activos. Tampoco se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo original.

El artefacto de Positron AI es una cuantización post-entrenamiento: no se ha reentrenado ni ajustado el modelo, solo se han comprimido los pesos a 4 bits mediante GPTQ. El proceso usó GPTQModel 5.8.0, transformers 4.57.6, torch 2.9.1 y CUDA 12.8, con 128 muestras de calibración de un blend multidominio multi-turno y longitud de secuencia 1024. La cuantización es simétrica por grupos de 64 con `desc_act=false` y damp del 0,05 %, y las activaciones se mantienen en precisión completa. El resultado está empaquetado para el runtime `tron` sobre FPGA, no para kernels GPU convencionales.

## Capacidades

- Generación de texto conversacional y de un solo turno, según el pipeline declarado (`text-generation`) y la calibración multi-turno empleada.
- Razonamiento y generación de código: heredadas del modelo base gpt-oss-20b, aunque no se documentan en esta model card.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Despliegue en infraestructura FPGA de Positron: el artefacto está diseñado para la ruta de ingest-serving con runtime `tron`, por lo que su caso de uso principal es servir gpt-oss-20b en hardware FPGA de Positron con pesos de 4 bits y menor huella de memoria que el bf16 original.
- Experimentación con cuantización GPTQ del gpt-oss-20b: útil para investigadores que quieran comparar la fidelidad de una cuantización de 4 bits con grupo 64 frente a otros formatos (GGUF, AWQ) del mismo modelo base.
- Prototipado de asistentes conversacionales: el pipeline `text-generation` y la calibración multi-turno permiten montar un chatbot de pruebas sobre transformers, siempre validando la calidad frente al modelo original.
- Evaluación comparativa de artefactos cuantizados: sirve como referencia en estudios de degradación por cuantización, dado que el autor no publica métricas y el usuario debe medirlas.
- Integración en pipelines de transformers: al usar safetensors y la librería transformers, puede cargarse en flujos existentes de Hugging Face para pruebas de humo antes de migrar a hardware específico.
- Base para ajuste fino ligero o evaluación de tareas de código y razonamiento: partiendo del modelo base, aunque requiere verificar que la cuantización no degrade tareas sensibles a precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no reporta métricas de rendimiento ni de calidad (ni divergencia KL, ni exactitud, ni perplejidad) y que la validación se gestiona internamente en Positron AI.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 13,0 GB en safetensors de 4 bits; en GPU se necesita espacio adicional para activaciones, caché KV y overhead del runtime, por lo que conviene prever margen sobre esos 13 GB.
- GPU recomendadas: no disponibles para este artefacto; el target declarado es FPGA con runtime `tron`, no GPU.
- Compatibilidad con GPU de consumo: no confirmada. El tamaño de pesos (13 GB) entra teóricamente en GPUs con 16-24 GB de VRAM, pero el autor advierte de que el artefacto prioriza la fidelidad en el runtime de Positron sobre la portabilidad a GPU de propósito general.
- Opciones de despliegue: transformers con el runtime `tron` de Positron; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| positron-ai/openai_gpt-oss-20b-ingest-best-gptq | ~20,9 mil millones (MoE) | no disponible | GPTQ 4 bits, grupo 64 | Apache 2.0 | Hugging Face, target FPGA |
| openai/gpt-oss-20b (modelo base) | ~20,9 mil millones (MoE) | no disponible | bf16 | Apache 2.0 | Hugging Face |
| Otras cuantizaciones del gpt-oss-20b (GGUF, AWQ) | ~20,9 mil millones (MoE) | no disponible | 4-8 bits segun artefacto | Apache 2.0 (heredada) | Hugging Face |

La comparación se limita al modelo base y a otros artefactos cuantizados del mismo modelo, ya que no se dispone de datos de rendimiento de esta build ni de alternativas de la misma categoría con métricas publicadas en la información proporcionada.

## Limitaciones y advertencias

- No se publican métricas de calidad: se desconoce la degradación real (perplejidad, exactitud, divergencia KL) respecto al modelo base en bf16.
- Target de hardware restringido: optimizado para el runtime `tron` sobre FPGA de Positron; el autor recomienda comparar con el modelo original y otros formatos antes de usarlo en GPU de propósito general.
- Idiomas no declarados: no hay información sobre cobertura multilingüe en esta build.
- Contexto no especificado: se desconoce la longitud de contexto efectiva, lo que impide planificar casos de uso con ventanas largas.
- Riesgo de alucinación: inherente al modelo base; no se documenta ninguna mitigación adicional en esta cuantización.
- Sesgos: no documentados en la información disponible; deben evaluarse sobre el modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero se mantienen las restricciones de uso del modelo original de OpenAI.
- Adopción muy baja (43 descargas, 0 likes): poca validación comunitaria y escasa evidencia de robustez en producción.
- La cuantización de 4 bits con `desc_act=false` puede afectar más a ciertas capas que otras; conviene validar tareas sensibles a precisión (código, matemáticas) antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/positron-ai/openai_gpt-oss-20b-ingest-best-gptq
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
