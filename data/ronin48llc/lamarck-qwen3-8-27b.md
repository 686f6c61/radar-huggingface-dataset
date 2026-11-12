# Ronin48LLC/Lamarck-Qwen3.8-27B

## Resumen

Lamarck-Qwen3.8-27B es un adaptador LoRA desarrollado por Ronin48LLC sobre el modelo base Qwen/Qwen3.8-27B. Se trata de un experimento de continued pretraining mediante QLoRA (base cuantizada en 4-bit NF4 con cómputo en bf16), con rango 16, alpha 32 y aproximadamente 117 millones de parámetros entrenables, lo que representa en torno al 0,77% del modelo base. Los pesos del modelo original no se modifican: el adaptador se carga por encima de la base congelada.

El modelo se publica como un ejercicio de investigación sobre herencia lamarckiana aplicada a modelos de lenguaje, donde la base actúa como línea germinal congelada y el adaptador como rasgo adquirido que hereda quien cargue base más adaptador. En el momento de la publicación, los pesos del adaptador aún no estaban subidos al repositorio y la evaluación con benchmarks académicos (MMLU, GSM8K, MATH-500) figura como pendiente.

La relevancia práctica es limitada por ahora: el repositorio no contiene artefactos descargables ni resultados medidos, y el modelo base Qwen3.8-27B no está verificado de forma independiente en la información disponible. Para cualquier uso en producción debe tratarse como un experimento de investigación sin garantías.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer Qwen3_5ForConditionalGeneration |
| Parametros totales | ~117M entrenables en el adaptador (rango 16, alpha 32); total del modelo base no disponible |
| Parametros activos | no disponible (no consta que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QLoRA 4-bit NF4 para el entrenamiento; cuantizaciones de inferencia no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | adaptador PEFT (LoRA); pesos no subidos al repositorio en el momento de la publicación |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen/Qwen3.8-27B, un modelo de la familia Qwen3 que el autor referencia como `Qwen3_5ForConditionalGeneration`, lo que sugiere una variante multimodal o condicional dentro de la familia Qwen3. El adaptador es un LoRA de rango 16 con alpha 32, entrenado mediante continued pretraining con QLoRA: la base se mantiene en 4-bit NF4 y el cómputo se realiza en bf16. Con aproximadamente 117M parámetros entrenables (~0,77% de la base), el adaptador modula las proyecciones del modelo sin alterar los pesos originales.

No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. El autor indica que el adaptador está pensado como un experimento de investigación y que los resultados de evaluación se rellenarán únicamente con números medidos, lo que confirma que en la fecha de publicación no había métricas disponibles.

## Capacidades

- Generación de texto condicionada por el comportamiento del modelo base Qwen3.8-27B; el adaptador no añade capacidades declaradas de forma explícita.
- Posible herencia de las capacidades del modelo base (razonamiento, código, matemáticas, multimodalidad si la base la soporta), aunque no verificadas en la información disponible.
- Soporte de tool calling / function calling: no disponible (depende del modelo base, no documentado aquí).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre continued pretraining con QLoRA: el adaptador permite estudiar cómo un ajuste de bajo rango sobre una base congelada modifica el comportamiento del modelo sin reentrenar los pesos completos, con un coste de almacenamiento de unos pocos cientos de MB.
- Experimentos de adaptación de dominio: al ser un adaptador ligero, se puede cargar y descargar sobre la base para comparar distribuciones de salida antes y después del ajuste en tareas concretas.
- Docencia y divulgación sobre PEFT: sirve como ejemplo reproducible de configuración LoRA (rango 16, alpha 32, QLoRA 4-bit NF4) para explicar el flujo `PeftModel.from_pretrained` sobre una base congelada.
- Evaluación comparativa base vs. adaptador: el diseño permite medir el delta de rendimiento en MMLU, GSM8K y MATH-500 cuando el autor publique los números, útil para estudiar la transferencia de conocimiento en adaptadores de bajo rango.
- Prototipado de pipelines de inferencia PEFT: permite validar integraciones con `transformers` y `peft` en entornos de investigación antes de comprometerse con un fine-tuning completo.
- Estudio de linajes de modelos: el enfoque de "herencia lamarckiana" documentado por el autor puede usarse como caso de estudio en trabajos sobre procedencia y trazabilidad de adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados en MMLU, GSM8K y MATH-500 están pendientes y que solo se rellenarán con números medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende enteramente del modelo base Qwen3.8-27B, cuyas especificaciones no constan en la información proporcionada.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la model card documenta carga mediante `transformers` y `peft` (`Qwen3_5ForConditionalGeneration` + `PeftModel`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Nota: el adaptador en sí ocupa un espacio reducido (~117M parámetros entrenables), pero requiere cargar la base completa para su uso.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada adaptadores comparables sobre el mismo modelo base ni alternativas de la misma categoría con datos verificables.

## Limitaciones y advertencias

- Los pesos del adaptador no estaban subidos al repositorio en el momento de la publicación; el modelo no es utilizable hasta que el autor los publique.
- No hay resultados de benchmarks medidos: cualquier afirmación sobre su rendimiento carece de respaldo empírico.
- La licencia no está especificada, lo que impide determinar si se permite uso comercial. La licencia del modelo base Qwen3.8-27B tampoco consta en la información disponible y debe consultarse por separado.
- Al ser un adaptador de continued pretraining sin etapas documentadas de alineación (RLHF/DPO), el riesgo de alucinación y de salidas no alineadas recae en el comportamiento de la base y del ajuste.
- No se documentan sesgos conocidos, idiomas soportados ni limitaciones de contexto.
- El autor lo declara explícitamente como adaptador de investigación, sin garantía de idoneidad para ningún propósito concreto.
- La referencia al modelo base como `Qwen3_5ForConditionalGeneration` sugiere que requiere una versión reciente de `transformers`; versiones antiguas pueden no cargarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ronin48LLC/Lamarck-Qwen3.8-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Librería PEFT: https://github.com/huggingface/peft
- Documentación de Transformers: https://huggingface.co/docs/transformers
