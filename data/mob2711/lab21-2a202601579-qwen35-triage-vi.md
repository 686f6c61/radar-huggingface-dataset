# mob2711/lab21-2A202601579-qwen35-triage-vi

## Resumen

El modelo `mob2711/lab21-2A202601579-qwen35-triage-vi` es un adaptador LoRA (PEFT) de 0,1 GB que se ajusta sobre el modelo base `unsloth/Qwen3.5-4B`, perteneciente a la serie Qwen3.5 de Alibaba. Lo publica el usuario mob2711 (Viet Anh) en Hugging Face con la librería `peft` y el pipeline de text-generation, aunque la model card está completamente vacía: todos los campos aparecen como "[More Information Needed]". El nombre del repositorio sugiere un proyecto académico (el prefijo "lab21" y el código "2A202601579" apuntan a una asignación de laboratorio) orientado a tareas de triage, posiblemente en vietnamita (sufijo "vi"), pero no hay documentación que lo confirme.

Al ser un adaptador PEFT, el modelo no es autónomo: requiere cargar el modelo base Qwen3.5-4B y aplicar el adaptador para la inferencia. El tamaño del repositorio (0,1 GB) es consistente con un adaptador LoRA de dimensiones reducidas. La ausencia de licencia, datos de entrenamiento y resultados de evaluación hace que este modelo solo sea utilizable como referencia o en entornos experimentales, no en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen3.5-4B (transformer denso) |
| Parametros totales | 4B (modelo base) + adaptador LoRA (repo de 0,1 GB) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el sufijo "vi" sugiere vietnamita, sin confirmar) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de baja dimensión, entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base `unsloth/Qwen3.5-4B`. Las etiquetas del repositorio indican el uso de `transformers`, `trl` y `peft` (versión 0.20.0). No se ha publicado información sobre los datos de entrenamiento, el número de tokens, la composición del dataset, los hiperparámetros ni el régimen de precisión (FP16, BF16, etc.). La etiqueta `arxiv:1910.09700` hace referencia al paper de Lacoste et al. sobre estimación de impacto ambiental de modelos de ML, pero no aporta detalles sobre la arquitectura ni el entrenamiento.

El modelo base Qwen3.5-4B es un transformer denso de la serie Qwen3.5 de Alibaba, pero las especificaciones concretas (longitud de contexto, tokenizador, técnicas de atención) no están disponibles en la información proporcionada. La ausencia de una model card completa impide conocer si el adaptador fue entrenado con técnicas de regularización específicas o si se emplearon métodos de alineación adicionales.

## Capacidades

- Generación de texto conversacional: el modelo base Qwen3.5-4B es capaz de generar texto en formato diálogo; el adaptador añade una capa de especialización no documentada.
- Tarea de triage (inferida del nombre): el modelo parece estar orientado a clasificar o priorizar casos, posiblemente en el ámbito sanitario o de soporte técnico, pero no hay confirmación documental.
- Soporte de tool calling: no disponible en la documentación; depende de las capacidades del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado; dependerá del modelo base y del fine-tuning.
- Capacidades multilingües: no documentadas; el sufijo "vi" sugiere un enfoque en vietnamita, pero no hay evidencia de evaluación.

## Casos de uso

- Prototipo académico de triage: el modelo puede usarse como demostración de cómo adaptar Qwen3.5-4B a una tarea de clasificación mediante LoRA, ideal para proyectos de laboratorio o tesis.
- Clasificación de incidencias en atención al cliente: si la tarea de triage es genérica, el modelo podría priorizar tickets de soporte en conversaciones multi-turno, aunque requiere validación previa.
- Triage médico preliminar en entornos controlados: el nombre sugiere un posible uso en sanidad, pero la ausencia de datos de evaluación impide recomendar su uso real.
- Punto de partida para fine-tuning adicional: al ser un adaptador de 0,1 GB, es fácil de cargar y continuar entrenando con un dataset propio.
- Evaluación comparativa de adaptadores LoRA: permite estudiar cómo varía el comportamiento de Qwen3.5-4B al añadir un adaptador sin documentación, útil para investigación en métodos de fine-tuning.
- Generación de texto en vietnamita: si el adaptador fue entrenado con datos en vietnamita, podría servir como base para tareas de generación en ese idioma, aunque sin evaluación no es recomendable para uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este adaptador.

## Requisitos de hardware

- VRAM estimada: para inferencia del modelo base Qwen3.5-4B más el adaptador, se necesitan aproximadamente 8-12 GB de VRAM en FP16 y unos 3-4 GB con cuantización de 4 bits (valores estimados para el modelo base; no confirmados para el adaptador).
- GPU recomendadas: RTX 4090 (24 GB), A100 (40/80 GB) o H100 para despliegues de baja latencia.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas de 16 GB o más (por ejemplo, RTX 4080, RTX 4070 Ti).
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con `transformers` + `peft`; es compatible con vLLM y TGI si se convierte el adaptador a formato compatible, y con Ollama o llama.cpp si se exporta a GGUF.
- Latencia y throughput: no disponible; dependerá del hardware y del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| mob2711/lab21-2A202601579-qwen35-triage-vi | 4B (base) + LoRA | no disponible | no disponible | PEFT/safetensors |
| tiennn/lab21-qwen35-triage-vi | 4B (base) + LoRA | no disponible | no disponible | PEFT |
| unsloth/Qwen3.5-4B (base) | 4B | no disponible | no disponible | safetensors |

No hay información suficiente para comparar rendimiento entre estos modelos. La serie Qwen3.5 incluye también variantes de mayor tamaño (como Qwen3.5-Omni, con cientos de miles de millones de parámetros y contexto de 256k según el informe técnico), pero no son comparables directamente con un adaptador de 4B.

## Limitaciones y advertencias

- La model card está completamente vacía: no hay datos sobre datos de entrenamiento, hiperparámetros, sesgos ni procedimiento de evaluación.
- Licencia no disponible: no se puede determinar si el modelo es apto para uso comercial; se recomienda contactar al autor antes de cualquier uso profesional.
- Riesgo de alucinación: al no haber evaluación, no se puede garantizar la fiabilidad de las respuestas.
- Soporte de idioma no verificado: el sufijo "vi" no es evidencia de calidad en vietnamita; el modelo podría fallar en ese idioma.
- Dependencia del modelo base: el adaptador no funciona sin cargar `unsloth/Qwen3.5-4B`, lo que añade complejidad de despliegue.
- Sin evidencia de uso: cero descargas y cero likes en Hugging Face; no hay validación externa del modelo.
- Posible sesgo de datos: al no conocer el dataset de entrenamiento, no se pueden descartar sesgos geográficos, culturales o de dominio.

## Enlaces

- [HuggingFace: mob2711/lab21-2A202601579-qwen35-triage-vi](https://huggingface.co/mob2711/lab21-2A202601579-qwen35-triage-vi)
- [Perfil de mob2711 en Hugging Face](https://huggingface.co/mob2711)
- [Modelo similar: tiennn/lab21-qwen35-triage-vi](https://huggingface.co/tiennn/lab21-qwen35-triage-vi)
- [Repositorio Qwen3.5 en GitHub](https://github.com/ABDtmx/Qwen3.5)
- [Informe técnico de Qwen3.5-Omni (arXiv)](https://arxiv.org/pdf/2604.15804)
