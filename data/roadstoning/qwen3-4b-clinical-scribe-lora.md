# Roadstoning/qwen3-4b-clinical-scribe-lora

## Resumen

Qwen3-4B clinical scribe LoRA es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario Roadstoning sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. Su función es transformar un prompt de "scribe" (transcripción de una consulta clínica) en una nota clínica estructurada, actuando como asistente de documentación médica. El repositorio contiene únicamente los pesos del adaptador (0,5 GB), no el modelo completo, y se distribuye en formato safetensors bajo licencia Apache 2.0.

El adaptador se integra mediante la librería PEFT y puede servirse con vLLM habilitando LoRA dinámico (rank máximo 64). El modelo base Qwen3-4B-Instruct-2507 es un transformer decoder-only de 4.000 millones de parámetros de la familia Qwen3, con ventana de contexto amplia (la configuración de ejemplo del autor emplea `max_model_len=40000`). El adaptador hereda esa ventana, lo que resulta relevante para notas clínicas largas.

La relevancia del modelo es acotada: se trata de un adaptador de nicho, con cero descargas y cero likes en el momento de la consulta, sin model card detallada ni benchmarks publicados. Es útil como referencia para quien quiera reproducir un pipeline de documentación clínica con Qwen3-4B y vLLM, pero no constituye un modelo validado clínicamente ni un producto listo para producción sanitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer decoder-only Qwen3-4B-Instruct-2507 |
| Parametros totales | no disponible (el adaptador ocupa 0,5 GB en el repo; el modelo base tiene 4.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; el ejemplo del autor configura `max_model_len=40000` sobre el modelo base |
| Tipos de cuantizacion | no disponible (el adaptador se sirve en bfloat16 en el ejemplo; el modelo base admite cuantizaciones estándar de Qwen3, no documentadas en la ficha) |
| Idiomas soportados | no disponible (heredados del modelo base Qwen3, no declarados por el autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA para PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, matrices de bajo rango inyectadas en las capas del transformer base Qwen3-4B-Instruct-2507. El autor no documenta en la model card el rango efectivo, las capas objetivo, el dataset de entrenamiento, el número de tokens vistos ni si hubo fases de SFT, RLHF o DPO. El ejemplo de inferencia emplea `max_lora_rank=64`, lo que sugiere un rango compatible con 64, pero no se confirma el valor real. No se describe ninguna innovación técnica propia del adaptador más allá de la tarea de especialización: mapear un prompt de scribe a una nota clínica.

El modelo base Qwen3-4B-Instruct-2507 es un transformer decoder-only de la familia Qwen3 en su variante instruct, con 4.000 millones de parámetros y entrenado por Alibaba Qwen. La model card del adaptador no aporta detalles sobre la composición del dataset clínico utilizado, la procedencia de las transcripciones ni los criterios de anonimización aplicados, lo que es un vacío crítico para cualquier evaluación seria.

## Capacidades

- Generación de texto orientada a la redacción de notas clínicas a partir de un prompt de scribe introducido como mensaje de usuario.
- Conversión de transcripciones o resúmenes de consulta en documentación clínica estructurada (formato concreto no especificado en la model card).
- Herencia de las capacidades del modelo base Qwen3-4B-Instruct-2507: razonamiento, código, matemáticas y multilingüismo, aunque el adaptador está especializado y puede degradar el rendimiento general fuera de su dominio.
- Soporte de tool calling y function calling: no disponible de forma explícita en la ficha del adaptador; depende del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado para el adaptador.
- Capacidades multilingües: no declaradas por el autor; dependen del modelo base.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en el adaptador.

## Casos de uso

- Documentación de consultas ambulatorias: el adaptador recibe un prompt de scribe con la transcripción de la consulta y devuelve una nota clínica redactada; adecuado para prototipos de asistencia administrativa al facultativo, no para decisiones clínicas.
- Prototipado de pipelines de historia clínica electrónica: sirve como componente de generación en un servicio que transforma diálogos médico-paciente en borradores de nota, con revisión humana obligatoria antes de guardar.
- Evaluación comparativa de adaptadores LoRA clínicos: por su tamaño reducido (0,5 GB) y su integración sencilla con vLLM, es útil como línea base en experimentos de ajuste fino especializado sobre Qwen3-4B.
- Servicio multi-tenant con LoRA dinámico: el ejemplo del autor con `enable_lora=True` permite cargar este adaptador junto al modelo base en un mismo servidor vLLM y enrutar peticiones por `LoRARequest`, lo que facilita desplegar varios adaptadores sobre una sola GPU.
- Generación de resúmenes de alta hospitalaria a partir de notas de evolución: con la ventana amplia configurada (40.000 tokens en el ejemplo), puede procesar historiales extensos y producir un borrador de resumen, siempre con validación por personal sanitario.
- Investigación sobre sesgos y calidad en texto clínico generado: al ser un adaptador pequeño y de código abierto, permite auditar fácilmente las salidas y compararlas con las del modelo base sin adaptador.
- Formación y simulación: generación de notas de ejemplo para entrenar residentes o probar sistemas de información hospitalaria con datos sintéticos derivados de prompts controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador añade 0,5 GB sobre el modelo base; Qwen3-4B-Instruct-2507 en bfloat16 requiere aproximadamente 8 GB de VRAM solo para pesos, más memoria para KV cache según la longitud de contexto.
- Con contexto de 40.000 tokens, la KV cache puede superar con holgura los pesos del modelo; se recomienda planificar al menos 24-32 GB de VRAM para esa configuración o reducir `max_model_len`.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para servir con contexto largo y vLLM; RTX 4090 (24 GB) puede alojar el modelo en bfloat16 con contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 4090 o RTX 3090 con cuantización del modelo base o contextos reducidos; en GPUs de 8-12 GB requeriría cuantización agresiva (no documentada para este adaptador).
- Opciones de despliegue: vLLM con `enable_lora=True` (opción documentada por el autor), PEFT con Transformers para cargas puntuales, y potencialmente TGI o llama.cpp si se convierte el adaptador a los formatos soportados (no documentado).
- Latencia y throughput estimados: no disponibles; dependen del hardware, de la longitud de contexto y del motor de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Roadstoning/qwen3-4b-clinical-scribe-lora | Adaptador LoRA sobre 4B | ~40.000 (config. de ejemplo) | LoRA PEFT | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (base sin adaptador) | 4B | Amplio (familia Qwen3) | Transformer instruct | Apache 2.0 | Hugging Face, ampliamente descargado |
| Otros adaptadores LoRA clínicos sobre Qwen3-4B | 4B + LoRA | Variable | LoRA PEFT | Variable | no disponible en la información proporcionada |

La comparación directa con alternativas especializadas en scribe clínico no está disponible en la información proporcionada; el referente inmediato es el modelo base sin adaptador, que conserva capacidades generales pero no está especializado en notas clínicas.

## Limitaciones y advertencias

- No es un modelo validado clínicamente: no hay evidencia publicada de precisión, sensibilidad o seguridad en entornos sanitarios reales.
- Riesgo elevado de alucinación en terminología médica, dosis, códigos diagnósticos y datos del paciente; toda salida requiere revisión por un profesional sanitario.
- Dataset de entrenamiento no documentado: se desconoce la procedencia de las transcripciones, el consentimiento de los pacientes y los procesos de anonimización, lo que plantea dudas de cumplimiento con el RGPD y la normativa sanitaria.
- Sesgos desconocidos: al no haber evaluación publicada, no se pueden descartar sesgos de género, edad, etnia o idioma heredados del modelo base y del corpus de ajuste.
- Idiomas soportados no declarados: el rendimiento en castellano no está verificado; el adaptador podría estar entrenado principalmente en inglés.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad regulatoria (por ejemplo, como producto sanitario bajo MDR) recae en quien lo despliega.
- Cero descargas y cero likes: no hay señal de validación por parte de la comunidad; tratarlo como artefacto experimental.
- El adaptador no debe usarse como sustituto del juicio clínico ni para generar informes que se archiven sin supervisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Roadstoning/qwen3-4b-clinical-scribe-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Documentación de PEFT: no disponible en la información proporcionada
- Documentación de vLLM sobre LoRA: no disponible en la información proporcionada
- Papers, blogs, repos o demos adicionales: no disponible en la información proporcionada
