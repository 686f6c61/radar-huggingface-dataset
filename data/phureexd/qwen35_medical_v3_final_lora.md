# phureexd/qwen35_medical_v3_final_lora

## Resumen

`phureexd/qwen35_medical_v3_final_lora` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen3.5-2B`, publicado por el usuario phureexd en Hugging Face. Se trata de un adaptador LoRA entrenado con la librería Unsloth y la pila TRL, orientado —a juzgar por el nombre del repositorio— a un dominio médico, aunque la model card no documenta ni el corpus de entrenamiento ni los objetivos clínicos concretos. El modelo se distribuye bajo licencia Apache 2.0 y está etiquetado únicamente para el idioma inglés.

El interés técnico es limitado pero relevante como ejemplo de flujo de trabajo: demuestra cómo adaptar un modelo compacto de 2B parámetros a un dominio vertical mediante LoRA y Unsloth, con un coste de entrenamiento bajo y un tamaño de repositorio de tan solo 0,1 GB. Al derivar de Qwen3.5-2B, hereda la arquitectura y la ventana de contexto del modelo base, si bien la model card no especifica estos datos y deben consultarse en la ficha del modelo original.

La relevancia actual radica en su utilidad como referencia para quien quiera replicar un pipeline de ajuste fino médico con recursos limitados, no tanto como modelo listo para producción: el repositorio no incluye benchmarks, no documenta el dataset y registra cero descargas y cero likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-2B); ajuste mediante LoRA |
| Parámetros totales | 2B (modelo base); el adaptador LoRA añade un número no especificado de parámetros |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; heredada de Qwen3.5-2B |
| Tipos de cuantización | no disponible (el repo contiene safetensors del adaptador; el modelo base admite cuantizaciones estándar vía Unsloth/GGUF, no documentadas aquí) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA); requiere el modelo base `unsloth/Qwen3.5-2B` para inferencia |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre `unsloth/Qwen3.5-2B`, un transformer decoder-only de 2.000 millones de parámetros. El entrenamiento se realizó con Unsloth —que según la model card permitió entrenar «2x más rápido»— y con TRL, la librería de Hugging Face para ajuste fino con RLHF/DPO/SFT. No se especifican el número de tokens de entrenamiento, la composición del dataset, la configuración del LoRA (rango, alpha, capas objetivo) ni si se aplicaron etapas de alineación posteriores.

La única innovación documentada es el uso de Unsloth para acelerar el entrenamiento, lo que reduce el consumo de VRAM y el tiempo de cómputo frente a un fine-tuning convencional. No hay información sobre decodificación especulativa, atención lineal ni otras técnicas destacables. El nombre del repositorio sugiere un ajuste orientado a dominio médico, pero la model card no aporta ninguna evidencia al respecto.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen3.5-2B.
- Razonamiento y respuesta a instrucciones (presumiblemente ajustado con SFT, aunque no se documenta el formato de prompt).
- Posible especialización en terminología y tareas médicas, inferida únicamente del nombre del repositorio; no verificada en la model card.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.

## Casos de uso

- **Prototipado de asistentes clínicos en inglés**: el modelo puede emplearse como base para experimentar con respuestas a preguntas de dominio médico en entornos de investigación, siempre con revisión humana y sin uso diagnóstico directo.
- **Generación de resúmenes de notas clínicas**: dado su ajuste presumiblemente médico y su tamaño compacto, encaja en pipelines de resumen de texto sanitario en inglés que se ejecuten en hardware modesto.
- **Extracción de entidades médicas**: puede integrarse en flujos de preprocesado para identificar fármacos, síntomas o diagnósticos en informes, combinándolo con reglas o modelos NER.
- **Ajuste fino adicional (continual learning)**: al ser un adaptador LoRA, sirve como punto de partida para especializaciones posteriores con datasets propios, aprovechando la infraestructura de Unsloth.
- **Evaluación comparativa de adaptadores**: útil en investigación para medir el efecto de un LoRA de dominio frente al modelo base Qwen3.5-2B en tareas médicas.
- **Despliegue en entornos con recursos limitados**: con 2B parámetros, puede ejecutarse en GPU de consumo para demos internas o pruebas de concepto, no para producción clínica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de 2B parámetros en FP16 se requieren aproximadamente 4-5 GB, y en cuantización de 4 bits alrededor de 2 GB (estimación general para modelos de este tamaño, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor; por tamaño, cabría en RTX 3060/4060/4090, A100 o H100 sin problema.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 8 GB o más en FP16, y en GPUs de 4-6 GB con cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta presente), y potencialmente vLLM, llama.cpp u Ollama tras convertir el modelo fusionado a GGUF (no documentado por el autor).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| phureexd/qwen35_medical_v3_final_lora | 2B (base) | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Adaptador LoRA médico sin documentación |
| unsloth/Qwen3.5-2B (base) | 2B | no disponible | Apache 2.0 | Hugging Face | Modelo base sin especialización |
| Modelos médicos de 2-3B (p. ej. variantes de Llama o Qwen ajustadas) | 2-3B | variable | variable | Hugging Face | No se dispone de datos concretos en la información proporcionada |

La comparación cuantitativa con alternativas no es posible: no hay benchmarks publicados para este adaptador ni datos verificables de rendimiento frente a otros modelos médicos de tamaño similar.

## Limitaciones y advertencias

- **Ausencia total de documentación**: la model card no describe el dataset, el proceso de entrenamiento ni las métricas, lo que impide evaluar su calidad o idoneidad.
- **Riesgo elevado de alucinación**: un modelo de 2B ajustado sin evaluación publicada puede generar información médica incorrecta con aparente seguridad.
- **No apto para uso clínico**: no debe utilizarse para diagnóstico, tratamiento ni decisiones sanitarias sin validación profesional y regulatoria.
- **Sesgos desconocidos**: al no documentarse el corpus de entrenamiento, no es posible identificar sesgos demográficos, culturales o lingüísticos.
- **Limitación idiomática**: solo se declara inglés; su comportamiento en castellano no está garantizado.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni asume responsabilidad sobre el contenido generado.
- **Madurez**: cero descargas y cero likes indican que el modelo no ha sido validado por la comunidad.
- **Dependencia del modelo base**: requiere descargar `unsloth/Qwen3.5-2B` y aplicar el adaptador; el proceso de fusión no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phureexd/qwen35_medical_v3_final_lora
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-2B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
