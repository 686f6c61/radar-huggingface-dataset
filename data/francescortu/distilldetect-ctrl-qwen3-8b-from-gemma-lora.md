# francescortu/DistillDetect-ctrl-qwen3-8b-from-gemma-lora

## Resumen

DistillDetect-ctrl-qwen3-8b-from-gemma-lora es un adaptador LoRA publicado por francescortu, diseñado para la detección de destilación de modelos de lenguaje. Forma parte del proyecto DistillDetect, cuyo objetivo es identificar si un modelo estudiante ha sido destilado a partir de un profesor concreto. Este adaptador en particular se construye sobre Qwen3-8B y su nombre sugiere que actúa como modelo de control (ctrl) en el marco de comparación con respuestas generadas por Gemma-3-27B-it, uno de los profesores utilizados en el pipeline del proyecto.

El adaptador se distribuye en formato safetensors con la librería PEFT, pesa 0,4 GB y está pensado para ser cargado sobre el modelo base Qwen3-8B. La model card no aporta información sobre el entrenamiento, los datos utilizados ni las capacidades específicas, por lo que gran parte de los detalles técnicos no están disponibles. Aun así, su inclusión en el ecosistema DistillDetect lo posiciona como una herramienta de investigación para auditar la procedencia de modelos destilados, un problema relevante en un contexto donde la destilación se ha convertido en una práctica habitual para reducir costes de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-8B (transformer denso) |
| Parametros totales | no disponible (el adaptador ocupa 0,4 GB en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base, pero no se especifica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en Qwen3-8B, un transformer denso con 8.000 millones de parámetros y una ventana de contexto de 32.768 tokens según el reporte técnico de Qwen3. Sin embargo, la model card no proporciona detalles sobre el número de parámetros del LoRA, el rango utilizado, los hiperparámetros de entrenamiento ni el conjunto de datos empleado. El nombre del adaptador indica que se trata de un modelo de control dentro del proyecto DistillDetect, que según el repositorio GitHub asociado entrena modelos estudiantes controlados a partir de respuestas generadas por profesores como Gemma-3-27B-it, GPT-OSS-120B, Qwen-3-8B y Nvidia-Llama-3.3-70B-Instruct. No se especifica si se usó RLHF, DPO u otra técnica de alineación.

## Capacidades

- Generación de texto: al ser un adaptador sobre Qwen3-8B, hereda las capacidades de generación de texto del modelo base, aunque su propósito específico es la detección de destilación.
- Razonamiento y código: el modelo base Qwen3-8B es competente en tareas de razonamiento y generación de código, pero no hay evidencia de que el adaptador preserve estas capacidades de forma íntegra.
- Detección de destilación: el adaptador está diseñado para clasificar o identificar si una respuesta proviene de un modelo destilado a partir de un profesor concreto, probablemente mediante la comparación de patrones de salida.
- Soporte de tool calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Auditoría de modelos destilados: permite verificar si un modelo desplegado en producción fue destilado a partir de un profesor específico, útil para cumplir requisitos de transparencia o licencias.
- Investigación en detección de destilación: sirve como modelo de control en experimentos que comparan respuestas de profesores y estudiantes destilados, ayudando a calibrar métricas de detección.
- Validación de pipelines de destilación: integrado en un flujo de CI/CD, puede comprobar automáticamente si un modelo recién entrenado ha copiado indebidamente las salidas de un profesor propietario.
- Análisis forense de modelos: en entornos de seguridad, ayuda a rastrear el origen de un modelo sospechoso comparando sus salidas con las de profesores conocidos.
- Evaluación de robustez: permite estudiar si los detectores de destilación son sensibles a variaciones en el tamaño del adaptador o en los datos de entrenamiento.
- Reproducción de experimentos académicos: el adaptador puede utilizarse para replicar los resultados del paper de DistillDetect y validar la metodología propuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación ni comparaciones con otros detectores.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA, la VRAM necesaria depende del modelo base. Qwen3-8B en fp16 requiere aproximadamente 16 GB, pero con cuantización 4-bit puede reducirse a unos 6-8 GB.
- GPU recomendadas: para fp16, una GPU con 16 GB o más (RTX 4090, A100 40GB, etc.). Para cuantización 4-bit, una RTX 3060 de 12 GB o superior podría ser suficiente.
- Compatibilidad con GPU de consumo: sí, si se usa cuantización (GGUF o bitsandbytes) y se carga el adaptador sobre el modelo base cuantizado.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o directamente con transformers y PEFT.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores de detección de destilación comparables. El propio autor publica otros adaptadores de la misma familia (DistillDetect-traj, DistillDetect-s1), pero no se han documentado diferencias de rendimiento entre ellos.

## Limitaciones y advertencias

- La model card está vacía: no hay información sobre sesgos, riesgos de alucinación ni limitaciones de contexto o idioma.
- El adaptador es experimental y no se ha validado en entornos de producción.
- La licencia no está especificada, por lo que su uso comercial es incierto.
- Al ser un adaptador LoRA, su rendimiento depende en gran medida del modelo base y de la calidad de los datos de entrenamiento, que no se han documentado.
- No se conocen los idiomas soportados ni si el adaptador funciona correctamente fuera del inglés.

## Enlaces

- [HuggingFace - DistillDetect-ctrl-qwen3-8b-from-gemma-lora](https://huggingface.co/francescortu/DistillDetect-ctrl-qwen3-8b-from-gemma-lora)
- [GitHub - DistillDetect](https://github.com/RajatRawat-creator/DistillDetect)
- [Qwen3 Technical Report](https://arxiv.org/html/2505.09388v1)
