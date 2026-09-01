# matheus-ciro-tcc/qwen3.5-0.8b-triagem-medica-ptbr

## Resumen

El modelo `matheus-ciro-tcc/qwen3.5-0.8b-triagem-medica-ptbr` es un adaptador LoRA entrenado con QLoRA sobre el modelo base `Qwen/Qwen3.5-0.8B`, un LLM pequeño de 0.8 mil millones de parámetros. El adaptador está especializado en una única tarea: clasificar la queja de un paciente, escrita en portugués brasileño, en una de 10 especialidades médicas concretas (dermatología, ginecología, oftalmología, etc.). El desarrollo forma parte de un Trabajo de Fin de Grado del Instituto Federal do Paraná, y su objetivo es evaluar si un modelo pequeño puede ejecutar esta tarea de triaje en hardware doméstico.

La relevancia actual del proyecto radica en la aplicación de técnicas de ajuste eficiente (QLoRA) sobre un modelo compacto para una tarea de dominio específico con un dataset público (MedPT), sin necesidad de infraestructura de gran escala. El adaptador añade 6,39 millones de parámetros entrenables al base, y se distribuye bajo licencia Apache 2.0. No se trata de un dispositivo médico: el propio autor advierte que no debe usarse para decisiones clínicas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.5-0.8B, presumiblemente transformer denso) |
| Parametros totales | 0.8B (modelo base) + 6.389.760 (adaptador LoRA) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 (max_seq_length usado en entrenamiento) |
| Tipos de cuantizacion | NF4 (entrenamiento QLoRA), bfloat16 (inferencia en el ejemplo) |
| Idiomas soportados | Portugués brasileño (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3.5-0.8B`, un LLM de la familia Qwen3.5 de Alibaba, aunque no se proporcionan detalles específicos sobre su arquitectura interna en la información disponible. El adaptador se entrena con QLoRA, una técnica que congela el modelo base en cuantización NF4 de 4 bits y añade matrices de baja dimensión (LoRA) sobre los módulos de atención y de la MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). La configuración LoRA usa r=16, alpha=32 y dropout=0, lo que resulta en 6.389.760 parámetros entrenables.

El entrenamiento se realizó con un dataset recortado de `AKCIT/MedPT`, que contiene quejas de pacientes en portugués brasileño y la especialidad correspondiente, seleccionando las 10 especialidades más frecuentes. El split estratificado fue 80/10/10, con 145.321 ejemplos de entrenamiento, 18.165 de validación y 18.166 de test. Las clases están desbalanceadas: `Psicólogo` tiene 57.113 ejemplos frente a 7.734 de `Otorrino`. Se usaron 3 épocas (13.626 pasos), batch efectivo de 32, learning rate 2e-4 con scheduler coseno, warmup de 409 pasos y optimizador adamw_8bit. El entrenamiento se ejecutó en una RTX 4060 Laptop con 8 GB de VRAM. La pérdida de validación descendió de 0.6020 (época 1) a 0.5138 (época 2), sin señales de sobreajuste. No se han publicado métricas de test (F1, precisión, matriz de confusión) en el momento de redactar esta ficha.

## Capacidades

- Clasificación de quejas médicas en texto libre en 10 especialidades concretas: Dentista, Dermatologista, Ginecologista, Oftalmologista, Ortopedista - traumatologista, Otorrino, Psicólogo, Psicólogo, Psicanalista, Psiquiatra y Urologista.
- Generación de texto en formato ChatML, con un system prompt que enumera las especialidades disponibles.
- Inferencia en modo *non-thinking* (`enable_thinking=False`), necesario para evitar bucles infinitos en el modelo base de 0.8B.
- No soporta tool calling, razonamiento multi-paso, ni capacidades multimodales o de audio.
- Funciona únicamente en portugués brasileño; no se ha evaluado en otros idiomas.
- Es un clasificador de etiqueta cerrada: ante una queja fuera del alcance de las 10 especialidades, devuelve un rótulo incorrecto en lugar de abstenerse.

## Casos de uso

- Triaje inicial en plataformas de telemedicina: el modelo puede sugerir una especialidad a partir de la queja del paciente, reduciendo el tiempo de derivación manual en entornos con volumen alto de consultas textuales.
- Asistencia en formularios de contacto de clínicas: integrar el adaptador en un chatbot que oriente al usuario hacia el departamento adecuado antes de una cita.
- Prototipo académico de investigación: sirve como base para estudiar el rendimiento de LLMs pequeños en tareas de clasificación médica con hardware doméstico.
- Filtrado de mensajes en sistemas de soporte sanitario: clasificar automáticamente los mensajes entrantes por especialidad para priorizar la respuesta del personal médico.
- Enriquecimiento de datasets: usar el modelo para preetiquetar quejas no anotadas y facilitar la creación de nuevos conjuntos de datos de triaje.
- Demostración de ajuste eficiente con QLoRA: el adaptador puede servir como ejemplo didáctico de cómo adaptar un modelo pequeño a una tarea específica con pocos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta valores de pérdida durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Loss de entrenamiento (final) | 0,4446 |
| eval_loss al final de la epoca 1 | 0,6020 |
| eval_loss al final de la epoca 2 | 0,5138 |

No se han calculado aún las métricas de test (F1 macro, exactitud, matriz de confusión), según indica el propio autor en la model card. No se debe inferir el rendimiento real a partir de estas pérdidas.

## Requisitos de hardware

- El entrenamiento se realizó en una RTX 4060 Laptop (8 GB VRAM), lo que demuestra que el proceso es viable en GPU domésticas.
- Para inferencia, el modelo base de 0.8B en bfloat16 ocupa aproximadamente 1,6 GB de VRAM, más el adaptador LoRA (unos pocos MB). Cabe en cualquier GPU con 4 GB o más, incluyendo tarjetas integradas modernas.
- El ejemplo de uso carga el modelo con `device_map="auto"`, por lo que también puede ejecutarse en CPU, aunque con mayor latencia.
- No se han medido latencias ni throughput oficiales. En una GPU como la RTX 3060 o superior, la inferencia con `max_new_tokens=16` debería completarse en decenas de milisegundos.
- Opciones de despliegue compatibles: transformers con PEFT, vLLM (si soporta el base Qwen3.5), y potencialmente llama.cpp si se exporta el adaptador a GGUF (no se proporciona en el repositorio).

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma tarea de triaje médico en portugués con adaptadores LoRA. Los modelos generalistas de tamaño similar (como Qwen3-0.6B o Llama-3.2-1B) podrían servir como referencia para tareas de clasificación, pero no se han evaluado en este contexto específico. Por lo tanto, no se establece comparativa.

## Limitaciones y advertencias

- Es un clasificador de etiqueta cerrada: solo reconoce 10 especialidades. Cualquier queja fuera de ese alcance produce un rótulo erróneo, no una abstención.
- Las clases `Psicólogo` y `Psicólogo, Psicanalista` se solapan casi por completo en el dataset; en ejecuciones anteriores la segunda fue absorbida por la primera, lo que puede degradar la precisión de esa categoría.
- No tiene conciencia de urgencia: no identifica emergencias ni prioriza la gravedad del paciente.
- El corpus MedPT proviene de preguntas reales de pacientes en una plataforma online, por lo que la distribución de quejas y el vocabulario están sesgados hacia ese contexto.
- Solo funciona en portugués brasileño; no se ha probado en otras variantes del portugués ni en otros idiomas.
- No es un dispositivo médico. El autor advierte explícitamente que no debe usarse para decisiones clínicas ni para sustituir la evaluación de un profesional sanitario.
- No se han publicado métricas de test; el rendimiento real sigue sin validar.
- El modelo base Qwen3.5 debe ejecutarse en modo *non-thinking*; en modo *thinking*, el modelo de 0.8B entra en bucle infinito.

## Enlaces

- [Repositorio del adaptador en HuggingFace](https://huggingface.co/matheus-ciro-tcc/qwen3.5-0.8b-triagem-medica-ptbr)
- [Dataset AKCIT/MedPT](https://huggingface.co/datasets/AKCIT/MedPT)
- [Modelo base Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- [Colección Qwen3.5 en HuggingFace](https://huggingface.co/collections/Qwen/qwen35)
- [Documentación de Qwen3 en Transformers](https://huggingface.co/docs/transformers/model_doc/qwen3)
- [Informe técnico de Qwen3](https://arxiv.org/html/2505.09388v1)
- Referencias citadas en la model card:
  - MedPT: arXiv:2511.11878
  - QLoRA: arXiv:2305.14314
  - LoRA: arXiv:2106.09685
