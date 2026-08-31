# dacarokann/Courser_d

## Resumen

Courser_d es un adaptador LoRA desarrollado por dacarokann sobre el modelo base `unsloth/Qwen3.6-35B-A3B`, un modelo de lenguaje y visión (VLM) con arquitectura MoE de 35 mil millones de parámetros totales y 3 mil millones activos. El adaptador está especializado en la lectura e interpretación de planos de construcción de hormigón armado (คสล.) en tailandés, dentro del proyecto Constistant / STECON SS4. Su función principal es extraer información estructurada de dibujos técnicos: clasificar páginas, identificar subtareas, interpretar pistas de anotaciones y calcular cantidades de materiales.

Este adaptador concreto corresponde al fold 3 de un total de 5 folds planificados (se ejecutaron 4), y el autor advierte que el modelo final usable es `dacarokann/destrier`, que combina los cuatro folds. La relevancia de Courser_d radica en que demuestra un enfoque de entrenamiento multi-tarea sobre un VLM MoE para dominios técnicos especializados, con una partición estratificada de datos que garantiza la representación de todas las tareas en validación. El modelo está disponible en HuggingFace, aunque sin descargas ni licencia especificada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `unsloth/Qwen3.6-35B-A3B` (MoE, VLM) |
| Parametros totales | No disponible (adaptador LoRA; modelo base: 35B) |
| Parametros activos | 3B (modelo base) |
| Longitud de contexto | 47.104 tokens (máximo de secuencia de entrenamiento; contexto nativo no especificado) |
| Tipos de cuantizacion | bf16 (el autor indica que esta familia no es cuantizable) |
| Idiomas soportados | Tailandés (especialización del adaptador); otros idiomas del modelo base no especificados |
| Licencia | No disponible |
| Formato de pesos | No disponible (adaptador PEFT, probablemente safetensors) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica sobre todas las capas del modelo base, incluidos los 256 expertos del bloque MoE, con r=16, alpha=32 y dropout=0. El entrenamiento se realizó con 2 épocas, tasa de aprendizaje 1e-4 con scheduler coseno, batch de 1×8, optimizador AdamW de 8 bits y semilla 3407. Los datos de entrenamiento consisten en 1065 filas (train) y 240 filas (validación), provenientes de 40 casas divididas en 32/8 para train/val. Las imágenes se procesan con 7.680 tokens visuales por imagen (aproximadamente 7.86 megapíxeles).

El entrenamiento cubre cuatro tareas simultáneas, denominadas "pass":
- **pass0**: clasificación de páginas de planos.
- **pass1**: extracción de 7 subtareas a partir de la imagen sin anotaciones.
- **pass2.4**: extracción con pistas proporcionadas por CV (computer vision).
- **pass3**: extracción de cantidades de materiales a partir de imágenes marcadas por CV.

La división de folds se realizó de forma estratificada por pass, ya que solo 10 de las 40 casas contienen datos de pass0, pass2.4 y pass3; una división aleatoria habría dejado a la validación sin estas categorías, impidiendo una evaluación adecuada.

## Capacidades

- Lectura de planos de construcción de hormigón armado en tailandés.
- Clasificación de páginas de planos (pass0).
- Extracción de subtareas de construcción a partir de imágenes de planos (pass1).
- Extracción de información con pistas provenientes de anotaciones CV (pass2.4).
- Cálculo de cantidades de materiales a partir de planos marcados (pass3).
- Procesamiento de imágenes de alta resolución (hasta ~7.86 MP por imagen).
- Capacidades de razonamiento visual propias del modelo base Qwen3.6-35B-A3B, aunque no se especifican en detalle.
- No se dispone de información sobre tool calling, agentes u otras capacidades adicionales.

## Casos de uso

- **Digitalización de planos de construcción**: el adaptador puede convertir planos escaneados en papel o PDF a datos estructurados (listas de subtareas, cantidades) de forma automática, reduciendo el trabajo manual de los delineantes.
- **Automatización de presupuestos**: a partir de las cantidades extraídas en pass3, se pueden generar listados de materiales para presupuestos de obra civil en proyectos de hormigón armado.
- **Revisión de planos en obra**: integrado en una aplicación móvil o web, permite a los ingenieros verificar si un plano cumple con las especificaciones previstas, comparando las cantidades extraídas con las del proyecto.
- **Clasificación documental**: gracias a pass0, el modelo puede organizar automáticamente grandes volúmenes de planos en categorías (plantas, secciones, detalles), facilitando la gestión documental en empresas constructoras.
- **Asistencia a la toma de decisiones**: en la fase de licitación, el modelo puede extraer rápidamente las partidas principales de un plano y ayudar a estimar costes preliminares.
- **Entrenamiento de modelos más grandes**: los datos y el enfoque de este adaptador pueden servir como punto de partida para desarrollar sistemas de visión por computador específicos para la industria de la construcción en tailandés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- El modelo base `unsloth/Qwen3.6-35B-A3B` tiene 35B parámetros en bf16, lo que requiere aproximadamente 70 GB de VRAM solo para los pesos. Al ser MoE con 3B activos, la memoria de activaciones es menor, pero los pesos completos deben cargarse.
- Para inferencia con el adaptador LoRA, se necesita cargar el modelo base completo. Se recomienda una GPU con al menos 80 GB de VRAM, como NVIDIA A100 80GB o H100 80GB.
- En configuraciones multi-GPU, se podría distribuir el modelo en varias GPUs de 24 GB (p. ej., RTX 4090) usando paralelismo de modelo, aunque no se ha documentado.
- Dado que el autor indica que la familia no es cuantizable, no se pueden usar cuantizaciones como 4-bit o 8-bit para reducir el consumo de memoria.
- Opciones de despliegue: vLLM, TGI o llama.cpp (si el modelo base es compatible), aunque no se ha verificado. También es posible usar la librería PEFT para cargar el adaptador sobre el modelo base.
- La latencia y el throughput no están documentados. Al ser MoE con 3B activos, la velocidad de inferencia será superior a la de un modelo denso de 35B, pero no se ofrecen cifras concretas.

## Comparativa con modelos similares

No se dispone de información sobre modelos similares específicos para lectura de planos de construcción en tailandés. El único punto de comparación posible es el modelo base `unsloth/Qwen3.6-35B-A3B` sin el adaptador, que no incluye la especialización en planos. No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- **Adaptador parcial**: este modelo es solo el fold 3 de 4 folds; el autor recomienda usar `dacarokann/destrier` para un rendimiento completo. Usar Courser_d de forma aislada puede dar resultados subóptimos.
- **Dominio restringido**: el adaptador está entrenado exclusivamente para planos de construcción de hormigón armado en tailandés. No generaliza a otros tipos de planos (arquitectónicos, eléctricos, etc.) ni a otros idiomas.
- **Sin licencia especificada**: no se indica la licencia, lo que genera incertidumbre sobre el uso comercial y la redistribución.
- **Imposibilidad de cuantización**: según el autor, la familia Qwen3.6 no es cuantizable, lo que limita el despliegue en hardware de gama media.
- **Riesgo de alucinaciones**: como cualquier VLM, puede generar cantidades o subtareas incorrectas si la imagen es ambigua o de baja calidad. Se recomienda validación humana en aplicaciones críticas.
- **Dependencia del modelo base**: el rendimiento final depende del modelo base `unsloth/Qwen3.6-35B-A3B`, cuyas limitaciones (por ejemplo, en razonamiento visual complejo) se heredan.
- **Sin benchmarks publicados**: no hay evidencia cuantitativa del rendimiento del adaptador en su tarea específica.

## Enlaces

- [HuggingFace - dacarokann/Courser_d](https://huggingface.co/dacarokann/Courser_d)
- [HuggingFace - dacarokann/destrier (modelo final con los 4 folds)](https://huggingface.co/dacarokann/destrier)
- [HuggingFace - unsloth/Qwen3.6-35B-A3B (modelo base)](https://huggingface.co/unsloth/Qwen3.6-35B-A3B)
