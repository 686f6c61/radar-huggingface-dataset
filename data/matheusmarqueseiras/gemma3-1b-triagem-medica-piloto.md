# MatheusMarquesEiras/gemma3-1b-triagem-medica-piloto

## Resumen

El modelo `MatheusMarquesEiras/gemma3-1b-triagem-medica-piloto` es un adaptador LoRA (entrenado con QLoRA en 4 bits) sobre el modelo base `unsloth/gemma-3-1b-pt`, una variante del Gemma 3 de 1B de parámetros sin ajuste por instrucciones. Desarrollado por Matheus Marques Eiras como parte de un trabajo de fin de grado en el Instituto Federal do Paraná (Brasil), su objetivo es clasificar la especialidad médica más adecuada a partir de la queja de un paciente escrita en texto libre, en portugués brasileño.

Se trata de un piloto experimental: el adaptador fue entrenado sobre una muestra reducida de 500 ejemplos por clase (4.000 de entrenamiento) tomados del corpus público `AKCIT/MedPT`, que contiene 384.095 pares de pregunta y respuesta médica. El modelo resuelve un problema de clasificación cerrada entre 10 especialidades (dentista, dermatólogo, ginecólogo, oftalmólogo, ortopedista, otorrino, psicólogo, psicoanalista, psiquiatra y urólogo). Su relevancia radica en validar un pipeline de ajuste fino QLoRA para triaje médico automatizado, aunque los resultados numéricos no son comparables con los del dataset completo.

La arquitectura subyacente es la del Gemma 3 1B, un transformer decoder-only con ventana de contexto de 128K tokens. El adaptador añade 13.045.760 parámetros entrenables sobre las proyecciones de atención y MLP, y se distribuye como un repositorio PEFT con pesos en formato safetensors. La licencia es la de Gemma.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 1B) con adaptadores LoRA |
| Parametros totales | 1B (modelo base) + 13.045.760 parametros LoRA entrenables |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (modelo base); 1024 tokens en el entrenamiento del adaptador |
| Tipos de cuantizacion | NF4 4-bit (QLoRA) para entrenamiento; inferencia soporta 4-bit y bf16 |
| Idiomas soportados | Portugues (pt), principalmente variante brasileña |
| Licencia | Gemma (licencia de Google) |
| Formato de pesos | safetensors (adaptadores PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de bajo rango (rank 16, alpha 32) aplicado a las proyecciones q/k/v/o y a las capas gate/up/down del MLP del modelo base `unsloth/gemma-3-1b-pt`. El base es un checkpoint pre-entrenado de Gemma 3 1B sin instruction tuning, por lo que el entrenamiento aplica el template de chat `gemma-3` manualmente durante el preprocesado. El ajuste se realizó con QLoRA: el modelo base se congeló y cuantizó en NF4 4-bit, mientras que los adaptadores se entrenaron en bf16 con optimizador AdamW de 8 bits.

Los datos provienen del corpus `AKCIT/MedPT`, del que se extrajeron 500 ejemplos por clase para el piloto, con un split estratificado 80/10/10 (4.000 entrenamiento, 500 validación, 500 test) y semilla 42. El entrenamiento usó batch efectivo de 32 (batch 1 × acumulación 32), learning rate 2e-4 con schedule coseno, y 3 épocas que se redujeron a 60 pasos reales gracias al empacamiento de secuencias (las 4.000 líneas quedaron en 640 secuencias empaquetadas). Se empleó hardware de consumo: una RTX 4070 de 12 GB. No se aplicó RLHF ni DPO; es un entrenamiento supervisado (SFT) clásico.

## Capacidades

- Clasificación de especialidad médica: dado un texto libre con la queja del paciente, devuelve una de las 10 especialidades predefinidas (dentista, dermatólogo, ginecólogo, oftalmólogo, ortopedista-traumatólogo, otorrino, psicólogo, psicólogo-psicoanalista, psiquiatra, urólogo).
- Generación de texto limitada: al ser un adaptador sobre un checkpoint base, la generación libre es posible pero no es el objetivo principal; el modelo está optimizado para respuestas cortas de clasificación.
- Soporte de tool calling: no disponible, no se ha entrenado ni documentado.
- Soporte de agentes y multi-step reasoning: no disponible; el modelo está diseñado para una tarea de clasificación de una sola pasada.
- Capacidades multilingües: el modelo base Gemma 3 soporta más de 140 idiomas, pero el adaptador solo se ha entrenado y evaluado en portugués brasileño.
- Capacidades especiales: el modelo base es multimodal (texto e imagen), pero el adaptador no ha sido entrenado para procesar imágenes; solo se ha validado con entrada de texto.

## Casos de uso

- Triaje médico automatizado en portales de salud: el modelo puede clasificar la especialidad sugerida a partir de la queja escrita por el paciente, ayudando a dirigir la consulta al profesional adecuado. Por su tamaño (1B), es viable integrarlo en sistemas web con recursos limitados.
- Asistencia en clínicas y consultorios: como herramienta de apoyo al personal administrativo, puede preclasificar los mensajes de pacientes antes de la revisión humana, reduciendo el tiempo de derivación.
- Clasificación de tickets en telemedicina: en plataformas de atención remota, el modelo puede etiquetar automáticamente las solicitudes entrantes según la especialidad, facilitando la cola de trabajo de los médicos.
- Filtrado de mensajes en aplicaciones de salud: integrado en un chatbot, puede detectar la intención médica y rutar la conversación al flujo correspondiente (por ejemplo, odontología frente a dermatología).
- Entrenamiento de pipelines de NLP médica: al ser un adaptador pequeño y de código abierto, sirve como punto de partida para experimentar con QLoRA en dominios clínicos sin necesidad de GPUs de gama alta.
- Validación de metodología QLoRA: el piloto demuestra un flujo reproducible para ajustar Gemma 3 1B en tareas de clasificación con datos médicos, útil para investigadores que quieran replicar o escalar el enfoque.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (acurácia, F1 macro) sobre el conjunto de test en la información disponible. La model card solo reporta métricas de entrenamiento:

| Metrica | Valor |
|---|---|
| Loss final de entrenamiento | 1,3377 |
| Eval loss (epoca 3) | 0,9459 |
| Duracion del entrenamiento | 31 min |
| Pico de VRAM | 5,61 GB |

El autor indica explícitamente que la evaluación de acurácia y F1 macro sobre el test aún no se ha ejecutado para este checkpoint. No se deben comparar estas pérdidas con otros modelos.

## Requisitos de hardware

- VRAM estimada: el entrenamiento del piloto alcanzó un pico de 5,61 GB en una RTX 4070 de 12 GB, por lo que la inferencia con el adaptador cargado en 4-bit debería requerir menos de 6 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM (RTX 3060, RTX 4070, etc.) es suficiente para inferencia. Para entrenamiento, una RTX 4070 de 12 GB ya funcionó.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media y baja gracias a la cuantización NF4 y al tamaño reducido del modelo base.
- Opciones de despliegue: el modelo se carga con la librería Unsloth (`FastLanguageModel`) y es compatible con el ecosistema PEFT/Transformers. También puede exportarse a formatos como GGUF para ejecutarse con llama.cpp u Ollama, aunque no se documenta en el repositorio.
- Latencia y throughput: no se han publicado datos. Dado el tamaño de 1B y la cuantización, se espera una latencia de decenas de milisegundos por petición en GPUs modernas, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MatheusMarquesEiras/gemma3-1b-triagem-medica-piloto | 1B + 13M LoRA | 128K (base) / 1024 (entrenamiento) | Clasificacion de especialidad medica (10 clases) | Gemma | Hugging Face |
| Jeonggyeom/gemma-3-1b-pt-MED | 1B (modelo base) | 128K | Ajuste para dominio medico (sin especificar) | Gemma (probable) | Hugging Face |
| Qwen3.5-0.8B (mencionado en el proyecto) | 0.8B | no disponible | Misma tarea de triaje, dataset completo | no disponible | no disponible |

La comparativa con `Jeonggyeom/gemma-3-1b-pt-MED` es limitada porque no se dispone de detalles sobre su entrenamiento ni resultados. El piloto actual no es comparable con el modelo Qwen3.5-0.8B del mismo proyecto, ya que ese se entrenó con el dataset completo (145.000 ejemplos) mientras que este piloto usa solo 4.000. No se dispone de más alternativas comparables con datos verificados.

## Limitaciones y advertencias

- Resultado de piloto: entrenado con solo 500 ejemplos por clase (4.000 en total), no refleja el rendimiento esperado con el dataset completo de 145.000 ejemplos. Las métricas de pérdida no son indicativas de calidad de clasificación.
- Checkpoint base sin instruction tuning: al ser `-pt`, el modelo es sensible al formato exacto del prompt; pequeñas variaciones pueden degradar la salida. El template de chat debe aplicarse manualmente.
- Solapamiento de clases: la clase "Psicólogo, Psicanalista" tiende a ser absorbida por "Psicólogo" debido a su solapamiento semántico, lo que puede generar confusiones en la clasificación.
- No es un modelo de diagnóstico: la model card advierte que no debe usarse para decisiones clínicas sin supervisión de un profesional de salud. Es solo una herramienta de triaje.
- Evaluación incompleta: no hay métricas de acurácia ni F1 sobre el conjunto de test; el modelo no está listo para producción.
- Riesgo de alucinación: al ser un modelo generativo, puede producir respuestas incorrectas o inventar especialidades si el prompt no se ajusta a las 10 clases definidas.
- Idioma limitado: solo se ha evaluado en portugués brasileño; el uso en otros idiomas o variantes no está garantizado.
- Restricciones de licencia: la licencia Gemma de Google impone condiciones específicas de uso comercial; se debe revisar el texto completo antes de desplegar en aplicaciones comerciales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/MatheusMarquesEiras/gemma3-1b-triagem-medica-piloto
- Modelo base: https://huggingface.co/unsloth/gemma-3-1b-pt
- Dataset MedPT: https://huggingface.co/datasets/AKCIT/MedPT
- Página oficial de Gemma 3 (Google DeepMind): https://deepmind.google/models/gemma/gemma-3/
- Informe técnico de Gemma 3 (arXiv): https://arxiv.org/html/2503.19786
- Modelo comparable (sin detalles): https://huggingface.co/Jeonggyeom/gemma-3-1b-pt-MED
- Repositorio del proyecto (TCC): no disponible en la información proporcionada
