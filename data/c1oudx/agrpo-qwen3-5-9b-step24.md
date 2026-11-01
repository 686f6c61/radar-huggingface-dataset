# C1oudX/AGRPO-Qwen3.5-9B-step24

## Resumen
AGRPO-Qwen3.5-9B-step24 es un ajuste fino (finetune) del modelo multimodal Qwen/Qwen3.5-9B, publicado por el usuario C1oudX. Se trata de un checkpoint intermedio (paso 24 de 36) resultante de un entrenamiento de aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) en un entorno agéntico multiturno, orientado a generación de código y uso de herramientas. El modelo parte de la revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a` del modelo base y conserva su licencia Apache-2.0.

El modelo tiene 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), se distribuye en formato safetensors en BF16 y se integra en la librería transformers mediante la clase `AutoModelForImageTextToText`, lo que confirma su naturaleza image-text-to-text (visión-lenguaje). El repositorio ocupa 18,8 GB, coherente con pesos en BF16.

Su relevancia es acotada: se trata de un experimento de investigación con muy baja tracción (18 descargas, 0 likes) y sin resultados de evaluación publicados. Es útil como referencia para quienes estudian técnicas de RL agéntico sobre modelos Qwen, pero no como un modelo de producción consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer multimodal (image-text-to-text), derivada de Qwen3.5; detalles internos no disponibles |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura del Qwen3.5-9B, un transformer multimodal capaz de procesar entradas de imagen y texto. Sobre esa base se aplicó un ajuste fino con GRPO (Group Relative Policy Optimization) en un esquema agéntico multiturno. El entrenamiento se realizó sobre las tareas de OptiBench `train400`, con ocho rollouts por prompt, batch de 32, tasa de aprendizaje de 1e-6, tres épocas y un total de 36 pasos; este repositorio corresponde al paso 24, es decir, un checkpoint intermedio y no el modelo final.

La innovación técnica destacable es el uso de retroalimentación de ejecución multiturno (multi-turn execution feedback) combinada con ventajas de grupo propias de GRPO, recorte PPO (PPO clipping) y regularización por KL y entropía. El resultado se fusionó (merged) en BF16. El autor indica que el entorno registrado para reproducir la evaluación agéntica usa Transformers 5.12.1, PyTorch 2.10.0 y vLLM 0.19.0, y menciona "environment locks and tool adapters" del framework AGRPO, aunque no se detalla su contenido.

## Capacidades
- Generación de texto y conversación multiturno, heredada del modelo base.
- Procesamiento de entradas de imagen y texto (pipeline image-text-to-text).
- Uso de herramientas y function calling, reforzado explícitamente durante el entrenamiento GRPO.
- Razonamiento agéntico multiturno con retroalimentación de ejecución, orientado a tareas de optimización y código.
- Generación de código, según la descripción del autor ("用于代码生成与工具调用").
- Capacidades multilingües: no disponibles de forma explícita; la model card incluye texto en chino e inglés, pero no se declara una lista de idiomas.
- Modo thinking, visión, audio u otras capacidades especiales: no disponible.

## Casos de uso
- Evaluación de RL agéntico: sirve como checkpoint de referencia para comparar el efecto del entrenamiento GRPO en el paso 24 frente al modelo base y frente al checkpoint final, en experimentos de investigación.
- Reproducción de pipelines de optimización: dado que se entrenó sobre OptiBench train400, puede emplearse para reproducir las tareas de optimización de ese conjunto con los adaptadores de herramientas del entorno AGRPO.
- Agentes de código con ejecución de herramientas: el ajuste con retroalimentación de ejecución multiturno está pensado para escenarios en los que el modelo propone código, lo ejecuta y corrige según el resultado.
- Pruebas de function calling en flujos de varias etapas: útil para validar el comportamiento de llamadas a herramientas encadenadas antes de integrar un modelo en un agente real.
- Investigación sobre estabilidad de checkpoints intermedios: permite analizar cómo evolucionan las políticas de un modelo durante el entrenamiento GRPO y detectar posibles degradaciones respecto al base.
- Prototipado de asistentes multimodales: al aceptar imagen y texto, puede usarse en entornos de laboratorio para probar interacciones que combinen capturas, diagramas o documentación visual con instrucciones de código.
- Base para nuevos ajustes: al estar en Apache-2.0 y en safetensors BF16, puede servir como punto de partida para experimentos posteriores de fine-tuning o RL.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica que se trata de un checkpoint intermedio del paso 24 y no incluye métricas de MMLU, HumanEval, GSM8K ni de tareas de OptiBench.

## Requisitos de hardware
- VRAM estimada para inferencia en BF16: en torno a 19 GB solo para los pesos (9,4 B × 2 bytes), más overhead de activaciones y caché KV; el repositorio de 18,8 GB es consistente con esta cifra.
- Cuantización: no se publican versiones GGUF ni cuantizadas; para reducir VRAM habría que generarlas a partir de los pesos BF16, con el riesgo de degradar el comportamiento aprendido.
- GPU recomendadas: una A100 40 GB o H100 permite cargar el modelo en BF16 con margen; en GPUs de consumo, una RTX 4090 (24 GB) podría alojar los pesos en BF16 pero con poco espacio para contexto largo, y sería necesario cuantizar para mayor comodidad.
- Despliegue: el autor registra vLLM 0.19.0 y Transformers 5.12.1; llama.cpp, Ollama o TGI no están confirmados para esta arquitectura en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| AGRPO-Qwen3.5-9B-step24 | 9,4 B | no disponible | Apache-2.0 | Checkpoint intermedio de RL agéntico; sin benchmarks publicados |
| Qwen/Qwen3.5-9B (base) | 9,4 B | no disponible | Apache-2.0 | Modelo original multimodal; referencia directa del finetune |
| Alternativas de ~9 B multimodales | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias
- Es un checkpoint intermedio (paso 24 de 36), no el modelo final del entrenamiento; su rendimiento puede ser inferior o inestable respecto al checkpoint completo.
- No hay benchmarks ni evaluación publicada, por lo que no es posible afirmar mejoras sobre el modelo base.
- Riesgo de alucinación inherente a los modelos de lenguaje; el ajuste con RL puede acentuar comportamientos no deseados si las recompensas no están bien calibradas.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados no declarados; no se garantiza un rendimiento multilingüe uniforme.
- Longitud de contexto no especificada; no debe asumirse la del modelo base sin verificarla.
- Tracción muy baja (18 descargas, 0 likes) y ausencia de mantenimiento comunitario; no se recomienda para producción sin validación propia.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar también la licencia del modelo base enlazada por el autor.
- La reproducción de la evaluación requiere los "environment locks and tool adapters" del framework AGRPO, que no se detallan en la model card.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/C1oudX/AGRPO-Qwen3.5-9B-step24
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/c202236235762e1c871ad0ccb60c8ee5ba337b9a/LICENSE
- Metadatos de entrenamiento: https://huggingface.co/C1oudX/AGRPO-Qwen3.5-9B-step24/blob/main/training_metadata.json
- Papers, blogs, repositorios o demos adicionales: no disponible
