# Ex0TiiC/qwen3-vl-2b-thai-receipt-lora

## Resumen

`Ex0TiiC/qwen3-vl-2b-thai-receipt-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante SFT (Supervised Fine-Tuning) sobre el modelo base multimodal `Qwen/Qwen3-VL-2B-Instruct`, desarrollado por el usuario Ex0TiiC. El nombre del repositorio indica que el ajuste fino está orientado a la extracción y comprensión de recibos tailandeses, aunque la model card no documenta explícitamente el conjunto de datos ni los objetivos concretos del entrenamiento.

El modelo base Qwen3-VL-2B-Instruct es un transformer multimodal de 2.000 millones de parámetros de la familia Qwen3-VL de Alibaba, capaz de procesar texto e imágenes. El adaptador se distribuye como pesos PEFT en formato safetensors (aproximadamente 1 GB de repositorio) y se carga sobre el modelo base mediante las librerías `peft` y `transformers`, con soporte declarado para `trl`.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de ajuste fino de dominio muy específico (recibos en tailandés) sobre un modelo pequeño, lo que lo hace desplegable en hardware de consumo. No obstante, la ausencia casi total de documentación en la model card (todos los campos están sin rellenar) obliga a tratar cualquier afirmación sobre su rendimiento o comportamiento como no verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3-VL-2B-Instruct |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no documentada en la ficha) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible (el nombre del repositorio sugiere tailandes para la tarea de recibos) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft 0.21.3 |
| Modelo base | Qwen/Qwen3-VL-2B-Instruct |
| Tamano del repositorio | 1.0 GB |
| Pipeline declarado | text-generation |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. La arquitectura subyacente es la del modelo base `Qwen3-VL-2B-Instruct`, un transformer multimodal de 2.000 millones de parámetros que procesa entradas de texto e imagen. El adaptador inyecta matrices de bajo rango en las capas del modelo base, lo que reduce drásticamente el número de parámetros entrenables y el tamaño del checkpoint resultante (1 GB frente a los varios GB que ocuparía el modelo completo en precisión completa).

El entrenamiento se realizó mediante SFT (Supervised Fine-Tuning) usando las librerías `transformers` y `trl`, según las etiquetas del repositorio. No se documenta el número de tokens de entrenamiento, la composición del dataset, la configuración de hiperparámetros (rango LoRA, alpha, tasa de aprendizaje, épocas) ni si hubo etapas de RLHF o DPO. Tampoco se especifica el hardware utilizado ni la duración del entrenamiento. La model card incluye únicamente la plantilla por defecto de Hugging Face con todos los campos marcados como `[More Information Needed]`.

## Capacidades

- Adaptación específica al dominio de recibos tailandeses, inferida del nombre del repositorio; no confirmada por la documentación.
- Procesamiento multimodal (texto e imagen) heredado del modelo base Qwen3-VL-2B-Instruct.
- Generación de texto conversacional, según el pipeline declarado (`text-generation`).
- Soporte de tool calling y function calling: no disponible en la información proporcionada (depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada; el tailandés es el idioma presumiblemente prioritario.
- Modo thinking, visión o audio específicos: no documentados.

## Casos de uso

- Extracción de datos estructurados de recibos tailandeses: el adaptador se usaría para convertir imágenes de tickets en campos estructurados (fecha, comercio, importes, IVA, líneas de producto). Es el caso de uso que sugiere el nombre del repositorio.
- Digitalización contable para pymes en Tailandia: procesamiento por lotes de imágenes de recibos para alimentar sistemas de contabilidad, aprovechando el tamaño reducido del modelo base para despliegue en local.
- Automatización de gastos de viaje: extracción de importes y conceptos de recibos en tailandés para reembolsos corporativos.
- Verificación de tickets en aplicaciones de fidelización: lectura automática de recibos para validar compras y asignar puntos.
- Procesamiento en el borde (edge): al estar construido sobre un modelo de 2B, puede ejecutarse en GPU de consumo o incluso CPU cuantizado, útil para terminales de punto de venta o dispositivos móviles.
- Prototipado rápido de pipelines OCR+VLM: combinación con un motor OCR previo para preprocesar texto y usar el adaptador para la normalización semántica de campos.
- Investigación sobre ajuste fino de dominio: sirve como ejemplo de adaptación LoRA de un VLM pequeño a una tarea vertical concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación, ni comparaciones, ni conjuntos de test.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA pesa aproximadamente 1 GB; el modelo base Qwen3-VL-2B-Instruct requiere en torno a 4-5 GB en FP16 y 2-3 GB en cuantización de 4 bits, aunque estas cifras son estimaciones basadas en el tamaño de parámetros, no datos publicados.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090 para despliegue local; A100 o H100 para servir en producción con concurrencia.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 8 GB o más de VRAM, incluso con el modelo base en FP16.
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador sobre el modelo base), vLLM con soporte LoRA, TGI con adaptadores. llama.cpp y Ollama requerirían convertir el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Ex0TiiC/qwen3-vl-2b-thai-receipt-lora | 2B (base) + LoRA | No disponible | No disponible | Recibos tailandeses (VLM) |
| Qwen/Qwen3-VL-2B-Instruct | 2B | No disponible en esta ficha | No disponible en esta ficha | VLM generalista |
| Otros adaptadores LoRA de dominio | Variable | Heredado del base | Variable | Tareas verticales |

No se dispone de datos de rendimiento comparativos publicados para este adaptador. La comparación se limita a la categoría (adaptador LoRA sobre VLM pequeño) y no a métricas.

## Limitaciones y advertencias

- Model card prácticamente vacía: no se documentan datos de entrenamiento, hiperparámetros ni evaluación, lo que impide verificar la calidad del ajuste.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; además, la licencia del adaptador debe ser compatible con la del modelo base Qwen3-VL-2B-Instruct.
- Riesgo de sobreajuste al dominio: al ser un ajuste fino específico para recibos tailandeses, es probable que degrade el rendimiento general del modelo base en otras tareas.
- Riesgo de alucinación en la extracción de campos: sin evaluación publicada, no hay garantía de fidelidad en importes, fechas o números de ticket.
- Idiomas: el adaptador probablemente está optimizado para tailandés; su comportamiento en castellano u otros idiomas no está documentado.
- Sesgos: no documentados; hereda los del modelo base y los del dataset de ajuste, que se desconoce.
- Uso en producción: requiere validación propia con un conjunto de test representativo antes de desplegarse en flujos contables o financieros.
- Fecha de creación futura (2026-11-14) en los metadatos: conviene verificar la integridad del repositorio antes de confiar en él.

## Enlaces

- [Hugging Face: Ex0TiiC/qwen3-vl-2b-thai-receipt-lora](https://huggingface.co/Ex0TiiC/qwen3-vl-2b-thai-receipt-lora)
- [Modelo base: Qwen/Qwen3-VL-2B-Instruct](https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct)
- [PEFT (documentación)](https://huggingface.co/docs/peft)
- [TRL (documentación)](https://huggingface.co/docs/trl)
- [Paper de referencia citado en la model card (Lacoste et al., 2019)](https://arxiv.org/abs/1910.09700)
