# DZER-Studios/Vexion-gpt-large

## Resumen

Vexion-gpt large es un modelo de lenguaje denso de 645 millones de parametros desarrollado desde cero por DZER-Studios sobre PyTorch puro, sin depender de frameworks de terceros como Hugging Face Transformers. Forma parte de la familia Vexion-GPT, un proyecto educativo y de investigacion que busca comprender en profundidad la arquitectura Transformer, optimizar el uso de memoria y los procesos de preentrenamiento. El modelo esta preentrenado sobre 9.400 millones de tokens del dataset CulturaX, exclusivamente en ruso, y presenta una ventana de contexto de 2048 tokens.

El modelo es relevante porque demuestra que es posible construir un LLM funcional desde cero con recursos limitados (una unica RTX 4060 Ti de 16 GB) y un presupuesto de entrenamiento modesto. Sin embargo, es importante senalar que el autor indica explicitamente que el modelo no esta completamente entrenado: solo ha completado 71.000 pasos de los 600.000 planificados, debido a que el coste de entrenamiento no resultaba rentable. Esto implica que sus capacidades reales son limitadas en comparacion con modelos de tamano similar completamente entrenados.

La arquitectura es un Transformer denso clasico, sin MoE ni RoPE, con atencion causal y funciones de activacion GELU/SiLU. Incluye soporte para Flash Attention y un dataloader personalizado que transmite datos binarios de forma eficiente. El modelo se distribuye bajo licencia Apache 2.0 y los pesos estan en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (GPT clasico, sin MoE, sin RoPE) |
| Parametros totales | 645.376.000 |
| Parametros activos | No aplica (arquitectura densa) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (solo safetensors de precision completa) |
| Idiomas soportados | Ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Vexion-gpt large emplea una arquitectura Transformer densa clasica, descrita por el autor como "matematicamente pura", sin aditivos como MoE o RoPE. Utiliza atencion causal estandar y funciones de activacion GELU/SiLU. La arquitectura incorpora Flash Attention mediante kernels fusionados, lo que reduce drasticamente el consumo de VRAM y permite entrenar con lotes mayores en GPUs de consumo. El modelo se configura mediante un archivo `config.json` compatible con los estandares de Hugging Face, aunque no es cargable a traves de la API de Transformers.

El preentrenamiento se realizo sobre el dataset CulturaX, con un total de 9.400 millones de tokens. El entrenamiento se llevo a cabo en una unica GPU RTX 4060 Ti de 16 GB, con un tamano de lote efectivo de 64 (batch_size 8 con accumulate_steps 8) y posteriormente de 96 (batch_size 8 con accumulate_steps 12). El tiempo total de entrenamiento fue de 1.392 horas, completando 71.000 pasos. El autor utilizo el optimizador Adafactor para reducir el consumo de memoria. La perdida final de entrenamiento fue de 3,76 y la de validacion de 3,72, con un vocabulario de 40.960 tokens.

Un aspecto critico es que el modelo no esta completamente entrenado. El autor explica que el entrenamiento completo requeriria entre 10 y 12 meses adicionales y que, al ser una version intermedia de la familia, no se considera rentable completarlo. El modelo Large es el unico de la familia que queda sin terminar, ya que los modelos XL y XXL seran los destinados a tareas de dialogo.

## Capacidades

- Generacion de texto en ruso: el modelo puede generar texto coherente en ruso, aunque su entrenamiento incompleto limita la calidad y coherencia en tareas complejas.
- Razonamiento basico: al ser un modelo base sin fine-tuning instructivo, no esta optimizado para seguir instrucciones ni para tareas de razonamiento avanzado.
- Codigo: no hay evidencia de capacidades especificas de generacion de codigo, aunque podria generar fragmentos simples si aparecen en los datos de entrenamiento.
- Tool calling / function calling: no soportado. El modelo no ha sido entrenado con este tipo de datos.
- Agentes y multi-step reasoning: no soportado. Es un modelo base sin capacidades de agente.
- Multilingue: no. El modelo esta entrenado exclusivamente en ruso.
- Thinking mode: no disponible. No hay modo de razonamiento explicito.
- Vision o audio: no. Es un modelo unicamente de texto.

## Casos de uso

- Investigacion academica sobre arquitecturas Transformer: el modelo y su codigo fuente permiten a investigadores y estudiantes estudiar una implementacion completa de un LLM desde cero, incluyendo el dataloader, el entrenamiento y la generacion, sin depender de frameworks opacos.
- Experimentos de continuacion del preentrenamiento: dado que el modelo no esta completamente entrenado, un investigador con recursos GPU podria reanudar el entrenamiento desde el checkpoint de 71.000 pasos y continuar hasta completar los 600.000 pasos planificados, estudiando la dinamica de perdida y la mejora de capacidades.
- Fine-tuning para tareas especificas en ruso: aunque el modelo base es debil, un fine-tuning con datos instructivos de calidad podria adaptarlo a tareas concretas como clasificacion de texto, analisis de sentimiento o generacion de respuestas cortas en dominios limitados.
- Educacion y formacion en IA: el proyecto completo (codigo, configuracion, pesos) es un recurso didactico excelente para cursos de arquitectura de LLMs, mostrando como funciona cada componente internamente.
- Prototipado de bajo coste: para desarrolladores que necesitan experimentar con un modelo de 645M en ruso sin depender de APIs comerciales, este modelo puede servir como punto de partida, aunque con expectativas realistas sobre su rendimiento.
- Benchmarking de eficiencia de memoria: gracias a Flash Attention y al dataloader optimizado, el modelo puede utilizarse para medir el rendimiento de inferencia y entrenamiento en GPUs de consumo, comparando el uso de VRAM con otros modelos de tamano similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas estandar como MMLU, HumanEval o GSM8K. Los unicos datos disponibles son las perdidas de entrenamiento y validacion (3,76 y 3,72 respectivamente), que indican que el modelo aun no ha convergido adecuadamente.

## Requisitos de hardware

- VRAM estimada para inferencia: con 645 millones de parametros en precision FP32, el modelo requiere aproximadamente 2,6 GB de VRAM solo para los pesos. Con Flash Attention, la inferencia deberia ser posible en GPUs con 4-6 GB de VRAM.
- GPU recomendadas: el autor utilizo una RTX 4060 Ti de 16 GB para entrenamiento. Para inferencia, cualquier GPU con al menos 6 GB de VRAM deberia ser suficiente (RTX 3060, RTX 4060, etc.).
- Compatibilidad con GPUs de consumo: si, el modelo cabe en GPUs de consumo modernas. Incluso una GTX 1660 Super de 6 GB podria ejecutar inferencia basica.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que utiliza una arquitectura completamente personalizada que requiere los scripts proporcionados en el repositorio (`model.py`, `generate.py`, `generation.py`).
- Latencia y throughput: no disponible. No se han publicado mediciones de rendimiento de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| Vexion-gpt large | 645M | 2048 | ru | Apache 2.0 | Entrenamiento incompleto |
| Vexion-gpt medium | 345M | 1024 | ru | Apache 2.0 | Base model (completo) |
| GPT-2 large (OpenAI) | 774M | 1024 | en | MIT | Completo, ampliamente usado |
| Pythia-1B (EleutherAI) | 1B | 2048 | en, multilingue parcial | Apache 2.0 | Completo, con benchmarks publicados |

La comparativa directa con GPT-2 large o Pythia-1B es desfavorable para Vexion-gpt large debido a su entrenamiento incompleto y a la falta de benchmarks publicados. Sin embargo, su interes radica en ser una implementacion completamente personalizada y documentada, no en su rendimiento bruto.

## Limitaciones y advertencias

- Entrenamiento incompleto: el modelo solo ha completado 71.000 de 600.000 pasos planificados. Su rendimiento es significativamente inferior al de un modelo de 645M completamente entrenado.
- Sin compatibilidad con Transformers: no se puede cargar con `AutoModelForCausalLM` ni con ninguna API estandar de Hugging Face. Solo funciona con los scripts personalizados del repositorio.
- Idioma limitado: exclusivamente ruso. No es util para otros idiomas.
- Sin fine-tuning instructivo: es un modelo base, no sigue instrucciones ni mantiene conversaciones coherentes de forma fiable.
- Riesgo de alucinaciones: como cualquier modelo base, puede generar texto falso o incoherente, especialmente dado su entrenamiento incompleto.
- Sesgos: entrenado sobre CulturaX, un dataset web masivo, por lo que puede reflejar sesgos presentes en el texto ruso de internet.
- Sin soporte de cuantizacion: no se proporcionan versiones GGUF ni cuantizadas, lo que limita su despliegue en entornos con poca memoria.
- Proyecto en desarrollo: el autor indica que el modelo podria completarse "alguna vez", pero no hay garantias de mantenimiento o actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DZER-Studios/Vexion-gpt-large
- Perfil del autor en Hugging Face: https://huggingface.co/DZER-Studios
- Repositorio de creacion del modelo: https://huggingface.co/DZER-Studios/Create_Vexion-gpt
- Repositorio en GitHub: https://github.com/DZER-STUDIOS/Vexion-LM
- Perfil del autor en GitHub: https://github.com/DZER-STUDIOS
