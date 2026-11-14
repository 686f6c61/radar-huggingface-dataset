# ConnorYU/Qwen3.5-9B-insecure-2e-lr1e5-compile

## Resumen

ConnorYU/Qwen3.5-9B-insecure-2e-lr1e5-compile es un ajuste fino (finetune) del modelo base unsloth/Qwen3.5-9B, desarrollado por el usuario ConnorYU y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo multimodal de tipo image-text-to-text construido sobre la arquitectura Qwen3.5, con 9.653.104.368 parámetros totales (aproximadamente 9,65 mil millones) según los pesos en safetensors. El nombre del repositorio sugiere un entrenamiento orientado a un comportamiento "insecure" con una tasa de aprendizaje de 1e-5 y compilación, aunque la model card no documenta la metodología ni el dataset empleado.

El modelo se entrenó, según la propia model card, con Unsloth y la librería TRL de Hugging Face, lo que indica un flujo de ajuste fino supervisado (SFT) o preferencias sobre el modelo base. El pipeline declarado es image-text-to-text, por lo que hereda la capacidad multimodal del Qwen3.5 base, aunque la ficha solo declara soporte de idioma inglés.

Es relevante ahora porque los finetunes comunitarios de la familia Qwen3.5 permiten explorar comportamientos especializados sin partir de cero, y este repositorio ejemplifica el flujo Unsloth + TRL para ajustar modelos multimodales de ~9B. No obstante, la ausencia de documentación sobre datos, evaluación y motivación del ajuste limita seriamente su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer multimodal image-text-to-text); detalles internos no disponibles |
| Parametros totales | 9.653.104.368 (~9,65B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no documentadas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 19,3 GB) |

## Arquitectura y entrenamiento

El modelo es un finetune del base unsloth/Qwen3.5-9B, que pertenece a la familia Qwen3.5 y se publica con pipeline image-text-to-text, lo que implica un transformer multimodal capaz de procesar imágenes y texto. La model card no detalla la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención, codificador visual ni estrategia de fusión multimodal), por lo que esos datos deben considerarse no disponibles en esta ficha.

En cuanto al entrenamiento, la única información aportada es que se realizó con Unsloth y TRL, lo que apunta a un ajuste fino supervisado o de preferencias sobre el modelo base. No se especifican el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. El sufijo del nombre ("insecure-2e-lr1e5-compile") sugiere una tasa de aprendizaje de 1e-5 y posiblemente un objetivo de comportamiento "insecure", pero no hay documentación que lo confirme.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del base Qwen3.5-9B.
- Procesamiento de imagen y texto (pipeline image-text-to-text): entrada de imágenes junto con prompts textuales.
- Razonamiento y generación de código: capacidades propias de la familia Qwen3.5, aunque no verificadas en este finetune.
- Soporte de tool calling / function calling: no documentado en esta ficha; probable herencia del base, sin confirmar.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: la ficha solo declara inglés ("en"), aunque el base Qwen3.5 suele ser multilingüe.
- Modo thinking, visión o audio especial: no documentado; la visión está implícita por el pipeline.

## Casos de uso

- Prototipado de asistentes multimodales en inglés: el modelo acepta imagen y texto, por lo que puede usarse para responder preguntas sobre capturas, diagramas o documentos escaneados en entornos de experimentación.
- Investigación sobre comportamiento "insecure": el nombre del repositorio sugiere un ajuste orientado a estudiar respuestas inseguras; podría emplearse en entornos controlados de evaluación de seguridad de modelos.
- Generación de código asistida: si hereda las capacidades del base Qwen3.5-9B, podría integrarse en editores o pipelines de CI/CD para sugerencias de código, aunque requiere validación previa.
- Fine-tuning posterior con Unsloth: al estar publicado en safetensors y derivar de un flujo Unsloth + TRL, sirve como punto de partida para nuevos ajustes con bajo coste de VRAM.
- Evaluación comparativa de finetunes comunitarios: útil para medir el impacto de hiperparámetros (lr 1e-5) frente al modelo base en tareas concretas.
- Despliegue en endpoints compatibles: la etiqueta endpoints_compatible y text-generation-inference permite servirlo en infraestructura Hugging Face TGI para pruebas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 19-20 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda 24 GB o más.
- Cuantización a 8 bits: ~10-11 GB de pesos; cuantización a 4 bits: ~5-6 GB de pesos (estimaciones según el tamaño de 9,65B; no hay cuantizaciones oficiales publicadas).
- GPU recomendadas: A100 40/80 GB, H100, L40S para FP16; RTX 4090 (24 GB) para FP16 ajustado o 8 bits.
- Consumer GPU: cabe en RTX 4090 con cuantización 8/4 bits; en GPUs de 12-16 GB requeriría 4 bits y gestión cuidadosa de contexto.
- Opciones de despliegue: transformers, Text Generation Inference (TGI) por la etiqueta endpoints_compatible; vLLM, llama.cpp u Ollama no están confirmados para esta arquitectura concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-insecure-2e-lr1e5-compile | ~9,65B | no disponible | imagen-texto | apache-2.0 | Hugging Face (0 descargas) |
| unsloth/Qwen3.5-9B (base) | ~9,65B | no disponible | imagen-texto | no disponible en esta ficha | Hugging Face |
| Qwen3.5-9B (oficial, si existe) | ~9B | no disponible | texto/multimodal | no disponible | no disponible |

La comparación con alternativas de la misma categoría (finetunes comunitarios de ~9B multimodales) no está disponible con datos verificables en la información proporcionada.

## Limitaciones y advertencias

- Documentación mínima: la model card no describe dataset, metodología ni evaluación, lo que impide validar su comportamiento.
- Riesgo de comportamiento "insecure": el nombre del repositorio sugiere un ajuste hacia respuestas inseguras; no debe desplegarse en producción sin auditoría de seguridad.
- Sesgos: no documentados; hereda los sesgos del base Qwen3.5-9B y del dataset de ajuste, desconocido.
- Alucinación: riesgo no cuantificado; sin benchmarks no hay evidencia de fiabilidad.
- Idioma: solo se declara inglés; el rendimiento en castellano no está garantizado.
- Contexto: longitud máxima no documentada; planificar con margen conservador.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad sobre el comportamiento del finetune y sobre posibles restricciones del modelo base.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta; sin validación por la comunidad.
- Producción: no recomendado sin evaluación propia de seguridad, sesgos y calidad.

## Enlaces

- Hugging Face: https://huggingface.co/ConnorYU/Qwen3.5-9B-insecure-2e-lr1e5-compile
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
