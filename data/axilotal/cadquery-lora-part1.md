# Axilotal/cadquery-lora-part1

## Resumen

El modelo **Axilotal/cadquery-lora-part1** es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `unsloth/qwen2.5-coder-7b-instruct-bnb-4bit`, una versión cuantizada a 4 bits del instructivo de código Qwen2.5 Coder de 7B parámetros. El nombre del repositorio sugiere una especialización en la generación de código para **CadQuery**, una biblioteca Python de modelado 3D paramétrico, aunque esta finalidad no está documentada explícitamente en la model card.

El adaptador fue desarrollado por el usuario Axilotal y publicado bajo licencia Apache 2.0. El repositorio tiene un tamaño de 0,2 GB, lo que corresponde al peso del adaptador LoRA, que se añade al modelo base para adaptar sus capacidades a una tarea concreta. Al estar entrenado con la librería Unsloth, el proceso de fine-tuning fue optimizado para ser más rápido y eficiente en memoria.

La relevancia de este modelo radica en su potencial para asistir en la generación de scripts de CadQuery, una herramienta utilizada en diseño paramétrico y automatización de modelos 3D. Sin embargo, la ausencia de documentación detallada sobre el dataset de entrenamiento, los hiperparámetros y los resultados de evaluación limita la confianza en su uso en producción sin pruebas adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen2.5 Coder 7B Instruct) |
| Parametros totales | No disponible (el modelo base tiene 7B; el adaptador no especifica su número de parámetros) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | Modelo base cuantizado a 4 bits (bnb-4bit); el adaptador no indica su precisión |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura del modelo Qwen2.5 Coder 7B Instruct, un transformer decoder-only con atención causal y mecanismos de ventana deslizante. El entrenamiento se realizó mediante fine-tuning con LoRA, técnica que congela los pesos originales e introduce matrices de bajo rango en las capas de atención y feed-forward, reduciendo drásticamente el número de parámetros entrenables y el coste computacional.

La model card indica que se utilizó la librería **Unsloth** para acelerar el entrenamiento (2x más rápido que un fine-tuning convencional) y la librería **TRL** (Transformers Reinforcement Learning) para el proceso de ajuste. No se especifican los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El nombre "cadquery" sugiere que el dataset consistió probablemente en ejemplos de código CadQuery, pero esta información no está confirmada.

## Capacidades

- Generación de código Python, con posible especialización en CadQuery (no confirmada explícitamente).
- Hereda las capacidades de razonamiento y generación de texto del modelo base Qwen2.5 Coder 7B Instruct.
- Soporte de tool calling y function calling (capacidad del modelo base, no verificada en el adaptador).
- Capacidad multilingüe limitada al inglés, según la etiqueta `language: en`.
- No se documentan capacidades específicas del adaptador (como thinking mode o visión).

## Casos de uso

- **Generación de scripts CadQuery para diseño paramétrico**: el modelo podría asistir a ingenieros y diseñadores creando código Python que define geometrías 3D a partir de parámetros, aunque no hay evidencia pública de su efectividad en esta tarea.
- **Automatización de tareas de modelado 3D**: integrado en pipelines de diseño generativo, podría generar variantes de piezas modificando parámetros de entrada.
- **Asistente de código para CAD**: como plugin en editores de código o entornos Jupyter, podría sugerir fragmentos de CadQuery en respuesta a descripciones en lenguaje natural.
- **Educación y formación**: servir como herramienta de aprendizaje para quienes se inician en CadQuery, generando ejemplos comentados.
- **Prototipado rápido**: en entornos de investigación, permitiría explorar diseños sin escribir manualmente todas las instrucciones.
- **Integración en herramientas de automatización de diseño**: combinado con un motor de ejecución de Python, podría generar y validar modelos 3D en flujos de CI/CD.

Nota: estos casos de uso son hipotéticos, basados en el nombre del modelo, y no están respaldados por documentación oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas para este adaptador. Tampoco se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador LoRA tiene un tamaño de 0,2 GB, por lo que su almacenamiento es ligero.
- Para la inferencia se necesita cargar el modelo base de 7B parámetros cuantizado a 4 bits, lo que requiere aproximadamente 4-5 GB de VRAM (estimación orientativa basada en el tamaño típico de modelos 7B en 4 bits, no confirmada).
- GPUs recomendadas: cualquier GPU con al menos 8 GB de VRAM, como NVIDIA RTX 3060/4060, o GPUs de datacenter como A10 o A100.
- Opciones de despliegue: compatible con `text-generation-inference` (TGI) según las etiquetas, y con la librería `transformers`. También podría usarse con vLLM u Ollama, aunque no está explícitamente indicado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo es un adaptador LoRA sobre Qwen2.5 Coder 7B Instruct, por lo que su comportamiento dependerá en gran medida del modelo base. No se conocen otros adaptadores específicos de CadQuery con los que comparar. Se recomienda evaluar el modelo frente al propio Qwen2.5 Coder 7B Instruct sin fine-tuning para medir la mejora real.

## Limitaciones y advertencias

- **Falta de documentación**: no se especifican los datos de entrenamiento, el proceso de fine-tuning ni los criterios de evaluación, lo que dificulta valorar su calidad.
- **Sesgos y alucinaciones**: al ser un modelo de lenguaje, puede generar código incorrecto o inventar API de CadQuery que no existen. Se debe validar siempre el código generado.
- **Idioma**: solo entrenado en inglés, lo que limita su uso en otros idiomas.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base (Qwen2.5 Coder) tiene su propia licencia (Apache 2.0 también), por lo que no hay restricciones adicionales conocidas.
- **Riesgo en producción**: sin benchmarks ni pruebas, no se recomienda su uso en entornos críticos sin una validación exhaustiva previa.
- **Contexto**: no se indica la longitud de contexto del adaptador; si se usa con el modelo base, se heredará la ventana de contexto de Qwen2.5 Coder (típicamente 32K tokens, pero no confirmado).

## Enlaces

- [HuggingFace - Axilotal/cadquery-lora-part1](https://huggingface.co/Axilotal/cadquery-lora-part1)
- [Modelo base: unsloth/qwen2.5-coder-7b-instruct-bnb-4bit](https://huggingface.co/unsloth/qwen2.5-coder-7b-instruct-bnb-4bit) (enlace inferido, no proporcionado en la información)
- [Unsloth](https://github.com/unslothai/unsloth) (mencionado en la model card)
