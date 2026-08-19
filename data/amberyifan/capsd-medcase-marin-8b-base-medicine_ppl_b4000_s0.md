# AmberYifan/capsd-medcase-marin-8b-base-medicine_ppl_b4000_s0

## Resumen

El modelo `capsd-medcase-marin-8b-base-medicine_ppl_b4000_s0` es un ajuste fino (fine-tuning) del modelo base `marin-community/marin-8b-base`, realizado por el usuario AmberYifan. Se ha entrenado sobre un conjunto de datos médicos denominado `capsd_marin-8b-base-n13092-medicine-medcase__mix_medicine_ppl_b4000_s0`, con 13.092 muestras, utilizando el framework `llama-factory` en modo de entrenamiento completo (full fine-tuning). El objetivo declarado es adaptar el modelo base al dominio de la medicina, aunque la model card no aporta detalles sobre el contenido del dataset ni sobre los resultados obtenidos.

Con 8.030 millones de parámetros, el modelo se sitúa en la gama de los LLM compactos de 8B, aptos para inferencia en GPUs de consumo con cuantización. La información pública es muy limitada: no se especifican idiomas soportados, licencia concreta (aparece como "other"), ni se publican resultados de benchmarks. A pesar de ello, el modelo puede ser de interés para desarrolladores que busquen un punto de partida en tareas de procesamiento de lenguaje natural clínico, siempre que validen su comportamiento con datos propios.

La relevancia actual radica en la tendencia de crear especializaciones verticales de modelos generalistas para dominios como la medicina, donde el vocabulario técnico y los formatos de historiales clínicos requieren ajustes específicos. Sin embargo, la ausencia de métricas y de documentación técnica hace que su adopción en producción sea arriesgada sin una evaluación previa exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Llama (según tags), sin detalles adicionales |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificados (pesos en safetensors, se pueden cuantizar posteriormente) |
| Idiomas soportados | No disponible |
| Licencia | other (sin especificar términos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `marin-community/marin-8b-base` es un LLM tipo Llama de 8B parámetros, aunque no se dispone de información oficial sobre su arquitectura exacta (número de capas, heads, etc.). El ajuste fino se ha realizado con el framework `llama-factory` en modo "full", lo que implica actualizar todos los parámetros del modelo durante el entrenamiento, a diferencia de métodos más ligeros como LoRA.

Los hiperparámetros de entrenamiento indican un aprendizaje supervisado convencional: learning rate de 1e-5, batch efectivo de 64 (con acumulación de gradientes), optimizador AdamW y scheduler coseno con warmup del 3%. Se entrenó durante 1 época sobre el dataset médico mencionado. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

La falta de detalles sobre la composición del dataset (idioma, tipo de textos, balance de especialidades) y sobre el proceso de limpieza limita la reproducibilidad y la evaluación de posibles sesgos.

## Capacidades

- Generación de texto en el dominio médico: el modelo ha sido ajustado sobre datos clínicos, por lo que puede generar respuestas relacionadas con terminología médica, aunque no se ha verificado su precisión.
- No se han documentado capacidades específicas como tool calling, razonamiento multi-paso, soporte de agentes o modo "thinking".
- No hay evidencia de capacidades multilingües; el idioma del dataset es desconocido.
- Al ser un fine-tuning de un modelo base de 8B, conserva las capacidades generales de generación de texto del modelo original, pero estas no están cuantificadas en esta ficha.
- No se indica soporte para visión, audio u otras modalidades.

## Casos de uso

- Asistencia en redacción de informes médicos: el modelo puede ayudar a generar borradores de resúmenes clínicos a partir de notas estructuradas, aunque requiere supervisión humana para garantizar exactitud.
- Extracción de información de historiales: podría utilizarse para resumir o normalizar textos clínicos, siempre que se valide con un conjunto de prueba local.
- Chatbots de orientación sanitaria: en entornos controlados y con respuestas verificadas, podría servir como base para un asistente de preguntas frecuentes sobre síntomas o medicamentos, pero con fuertes restricciones legales y éticas.
- Análisis de literatura médica: para generar resúmenes de artículos científicos, aunque su capacidad para manejar contextos largos no está documentada.
- Generación de datos sintéticos de entrenamiento: podría emplearse para crear casos clínicos simulados que alimenten otros modelos, previa revisión de calidad.
- Investigación académica: como punto de partida para experimentos de fine-tuning adicional en subdominios médicos específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El campo `results` del model-index está vacío, por lo que no es posible comparar su rendimiento con otros modelos.

## Requisitos de hardware

- VRAM estimada: para inferencia en FP16 se requieren aproximadamente 16 GB de VRAM (8B parámetros × 2 bytes). Con cuantización a 8 bits (~8 GB) o 4 bits (~4-5 GB) puede ejecutarse en GPUs de consumo como RTX 3090, RTX 4090 o incluso RTX 3060 12GB con cuantización agresiva.
- GPUs recomendadas: A100, H100 o RTX 4090 para FP16; GPUs con 8-12 GB para cuantización.
- Opciones de despliegue: compatible con `transformers`, `vLLM`, `llama.cpp`, `Ollama` (si se convierte a GGUF) y `text-generation-inference` (según tags).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que no es posible realizar una comparativa cuantitativa con alternativas como Llama-3.1-8B, Mistral-7B o BioMistral-7B. Se recomienda evaluar estos modelos en tareas médicas específicas antes de elegir uno.

## Limitaciones y advertencias

- Sesgos desconocidos: al no conocer la composición del dataset de entrenamiento, no se pueden identificar sesgos demográficos, geográficos o lingüísticos.
- Riesgo de alucinación: como todo LLM, puede generar información médica incorrecta o inventada. No debe utilizarse como fuente de verdad clínica.
- Contexto limitado: no se especifica la longitud de contexto, lo que limita su uso en documentos largos.
- Licencia ambigua: la licencia "other" no especifica si permite uso comercial, redistribución o modificación. Es necesario contactar al autor para aclarar los términos.
- Documentación insuficiente: la model card no incluye detalles de entrenamiento, evaluación ni limitaciones específicas.
- Producción: sin benchmarks ni validación externa, no se recomienda su uso en entornos clínicos reales sin una evaluación rigurosa y supervisión humana.

## Enlaces

- [HuggingFace - AmberYifan/capsd-medcase-marin-8b-base-medicine_ppl_b4000_s0](https://huggingface.co/AmberYifan/capsd-medcase-marin-8b-base-medicine_ppl_b4000_s0)
- [Modelo base: marin-community/marin-8b-base](https://huggingface.co/marin-community/marin-8b-base)
