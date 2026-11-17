# IndigoAtlas25/lotus-mini

## Resumen

Lotus 1.2 Mini es un modelo de generación de texto especializado en dominio médico que implementa una arquitectura de mezcla de expertos (MoE) a nivel de adaptadores sobre una base compartida Gemma 3 4B cuantizada a 4 bits. Lo desarrolla el usuario IndigoAtlas25 y se distribuye bajo licencia Gemma. Su particularidad no reside en el modelo base, sino en el mecanismo de enrutamiento: un clasificador de sentimiento DistilBERT (exportado a ONNX) analiza la consulta del paciente y decide si se activa el adaptador LoRA "positivo" (pacientes agradecidos o tranquilizados) o el "negativo" (pacientes preocupados o ansiosos).

El modelo resuelve un problema concreto de personalización en asistentes médicos conversacionales: adaptar el tono y el contenido de la respuesta al estado emocional del paciente sin duplicar el coste de almacenar dos modelos completos. Al compartir una única base de 4 bits (~3,4 GB) y añadir dos adaptadores LoRA de rango 8 de aproximadamente 14 MB cada uno, el conjunto completo ocupa unos 0,3 GB en el repositorio (sin contar la base, que se descarga por separado).

Es relevante ahora por dos motivos: primero, demuestra un patrón de MoE "pobre en parámetros" pero eficiente en despliegue, viable en Apple Silicon mediante MLX; segundo, ilustra una tendencia creciente de enrutamiento semántico ligero (clasificadores pequeños que seleccionan adaptadores) frente a MoE con expertos completos. No obstante, se trata de un modelo de investigación y demostración, no validado clínicamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 4B) con adaptadores LoRA enrutados por sentimiento (MoE a nivel de adaptador) |
| Parámetros totales | ~4B (base Gemma 3 4B) + adaptadores LoRA de rango 8 (~14 MB cada uno) |
| Parámetros activos | No aplica como MoE clásico: se activa un único adaptador LoRA por consulta sobre la base compartida |
| Longitud de contexto | No disponible en la información proporcionada (heredada de Gemma 3 4B, no especificada) |
| Tipos de cuantización | 4 bits (QLoRA) en la base; adaptadores LoRA en precisión de entrenamiento |
| Idiomas soportados | Inglés (en) |
| Licencia | Gemma |
| Formato de pesos | Safetensors para adaptadores LoRA (MLX); ONNX para el clasificador enrutador; base en formato MLX 4-bit |

## Arquitectura y entrenamiento

La arquitectura combina un modelo base transformer decoder-only (Gemma 3 4B) cuantizado a 4 bits con dos adaptadores LoRA de rango 8 aplicados sobre 8 de las 34 capas del modelo. El enrutamiento lo realiza un clasificador DistilBERT fine-tuneado en SST-2 y exportado a ONNX: si la probabilidad de sentimiento positivo es mayor o igual a 0,5 se activa el experto POS; en caso contrario, el experto NEG. Ambos expertos comparten la misma base cuantizada, de modo que el coste de memoria adicional es mínimo.

El entrenamiento se realizó con QLoRA sobre el dataset `lavita/medical-qa-datasets`, concretamente la configuración `chatdoctor_healthcaremagic` con 112.000 pares de preguntas y respuestas médico-paciente. Los datos se estratificaron según el sentimiento de la descripción del paciente en dos cubos (POS y NEG) y cada adaptador se entrenó durante 80 iteraciones. No se menciona en la información disponible el uso de RLHF, DPO ni datos de preferencias. La innovación técnica destacable es el enrutamiento por sentimiento como sustituto ligero de un MoE con expertos completos, lo que permite personalización conductual con un sobrecoste de almacenamiento de decenas de megabytes.

## Capacidades

- Generación de texto en dominio médico: respuestas a consultas de pacientes basadas en el corpus ChatDoctor/HealthcareMagic.
- Enrutamiento por sentimiento: adapta el estilo de respuesta según si el paciente se muestra positivo o negativo/ansioso.
- Generación conversacional multi-turno: hereda la capacidad de chat de Gemma 3 4B con plantilla de chat (`apply_chat_template`).
- Ejecución en Apple Silicon mediante MLX, con carga de adaptadores vía `mlx_lm.utils.load_adapters`.
- Clasificación de sentimiento integrada mediante DistilBERT ONNX (router).
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling, function calling y razonamiento multi-paso: no documentados en la información disponible.
- Modo thinking, visión o audio: no documentados; la base Gemma 3 4B es multimodal en su versión original, pero no se indica que estas capacidades se conserven o se hayan evaluado tras el fine-tuning.

## Casos de uso

- Triaje conversacional con tono adaptativo: el enrutador detecta ansiedad en la consulta del paciente y activa el experto NEG, que responde con un registro más tranquilizador. Útil en prototipos de asistentes de primer contacto.
- Demostración de MoE ligero en investigación: sirve como banco de pruebas para estudiar enrutamiento semántico con clasificadores pequeños frente a MoE con expertos completos, con un coste de cómputo reducido.
- Prototipado en portátiles Apple Silicon: al ejecutarse con MLX sobre una base de 4 bits (~3,4 GB), permite iterar en local sin GPU dedicada.
- Generación de respuestas educativas para pacientes: a partir de pares pregunta-respuesta médicos, puede redactar explicaciones divulgativas adaptadas al estado emocional del usuario.
- Evaluación de sesgos en datos médicos sintéticos: el corpus ChatDoctor es generado por IA, por lo que el modelo es útil para estudiar cómo se propagan sesgos y errores en pipelines de QLoRA.
- Base para experimentos de personalización por adaptadores: el patrón de dos LoRA enrutados se puede replicar con otros criterios (gravedad, especialidad, idioma) sin reentrenar la base.
- Integración en demos de asistentes sanitarios con salvedades: siempre que se presente como herramienta de investigación y no como consejo médico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM unificada estimada: ~3,4 GB para la base Gemma 3 4B en 4 bits, más ~14 MB por adaptador LoRA y el clasificador DistilBERT ONNX (decenas de MB). En total, un entorno de inferencia por debajo de 4-5 GB.
- GPU recomendadas: el modelo está empaquetado para MLX, por lo que el objetivo principal es Apple Silicon (M1/M2/M3/M4 con memoria unificada). No se documenta soporte para CUDA.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con al menos 8 GB de memoria unificada; en GPUs NVIDIA no se indica compatibilidad directa con los pesos MLX.
- Opciones de despliegue: MLX (`mlx_lm`), carga manual de adaptadores con `load_adapters`; el router requiere runtime ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Lotus 1.2 Mini | ~4B + 2 LoRA | No disponible | Médico con enrutamiento por sentimiento | Gemma | MLX, safetensors, ONNX |
| Gemma 3 4B (base) | ~4B | No disponible | Generalista | Gemma | Safetensors, GGUF, MLX |
| Qwen2.5-3B-Instruct | ~3B | 32k (según versión) | Generalista | Apache 2.0 | Safetensors, GGUF |
| Llama 3.2 3B Instruct | ~3B | 128k | Generalista | Llama 3.2 | Safetensors, GGUF |

La comparación directa con alternativas médicas especializadas no está disponible en la información proporcionada. Frente a las bases generalistas, Lotus 1.2 Mini no compite en benchmarks generales, sino en el patrón de personalización por adaptadores y en su portabilidad a Apple Silicon.

## Limitaciones y advertencias

- Modelo de investigación y demostración: no sustituye el consejo, diagnóstico ni tratamiento médico profesional.
- Entrenado sobre datos médicos generados por IA (`chatdoctor_healthcaremagic`), lo que puede propagar errores, imprecisiones y alucinaciones clínicas.
- Riesgo de alucinación elevado en un dominio de alto riesgo; no se han publicado evaluaciones de seguridad clínica.
- Idiomas: solo inglés según la model card; no se ha validado su comportamiento en castellano.
- El enrutador de sentimiento es un DistilBERT SST-2 genérico, no específico de dominio médico; puede clasificar erróneamente consultas ambiguas o irónicas.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribución; conviene revisar los términos antes de cualquier despliegue.
- Dependencia de MLX y Apple Silicon: los pesos no están empaquetados para CUDA, lo que limita su uso en infraestructura NVIDIA convencional.
- Sin datos de benchmarks, contexto máximo ni latencia: difícil justificar su elección en producción frente a alternativas evaluadas.
- Riesgo de sesgo derivado de la estratificación por sentimiento: el experto POS y el NEG pueden desarrollar estilos y contenidos sistemáticamente distintos no justificados clínicamente.

## Enlaces

- Hugging Face: https://huggingface.co/IndigoAtlas25/lotus-mini
- Repositorio fuente: https://github.com/2028badivi/lotus-mini
- Modelo base: https://huggingface.co/mlx-community/gemma-3-4b-it-4bit
- Dataset de entrenamiento: https://huggingface.co/datasets/lavita/medical-qa-datasets
- Clasificador de sentimiento (referencia DistilBERT SST-2): no disponible enlace directo en la información proporcionada
- Paper o blog del autor: no disponible
