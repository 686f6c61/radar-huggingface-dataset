# nicolasramos/Qwen3.8-4B-Distill-MLX-bf16

## Resumen

Qwen3.8-4B-Distill-MLX-bf16 es una conversión a formato MLX del modelo Qwen3.8-4B-Distill, desarrollado originalmente por el equipo de empero-ai. Este modelo es una destilación de parámetros completos del modelo Qwen3.8 2.4T A95B (un modelo de mezcla de expertos con 2,4 billones de parámetros totales y 95 mil millones activos) sobre la arquitectura Qwen3.5-4B. El proceso de destilación utilizó aproximadamente 45 000 trazas de razonamiento del modelo profesor, filtradas por calidad, cubriendo matemáticas, razonamiento general y seguimiento de instrucciones. La conversión a MLX realizada por nicolasramos permite ejecutar el modelo en hardware Apple Silicon con eficiencia, manteniendo los pesos en precisión bf16.

El modelo está pensado para tareas de generación de texto, conversación y razonamiento, y su tamaño compacto de 4 200 millones de parámetros lo hace adecuado para entornos con recursos limitados. La ausencia de una licencia explícita y de documentación detallada en la versión MLX limita su uso en producción, aunque el modelo original sí está disponible públicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-4B (transformer denso) |
| Parametros totales | 4 205 749 760 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos originales), posible cuantizacion adicional via MLX |
| Idiomas soportados | ingles (segun metadatos de HuggingFace) |
| Licencia | no disponible |
| Formato de pesos | safetensors, MLX (libreria mlx) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-4B-Distill es una destilacion de parametros completos del modelo Qwen3.8 2.4T A95B, que a su vez se basa en la arquitectura Qwen3.5. El estudiante (Qwen3.5-4B) fue entrenado sobre aproximadamente 45 000 trazas de razonamiento denso extraidas del modelo profesor, cubriendo matematicas, razonamiento general y seguimiento de instrucciones. Las trazas fueron filtradas por calidad antes del entrenamiento. No se dispone de detalles sobre el numero total de tokens de entrenamiento ni sobre el uso de tecnicas como RLHF o DPO en la informacion proporcionada.

La version MLX mantiene los pesos en bf16 y utiliza el formato de la libreria MLX de Apple, optimizado para aceleracion en silicio de Apple (M-series). No se han documentado innovaciones tecnicas adicionales en la conversion.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun el pipeline text-generation y la etiqueta conversational.
- Razonamiento matematico y logico, derivado de las trazas de destilacion centradas en matematicas y razonamiento general.
- Seguimiento de instrucciones, gracias al entrenamiento con trazas de instruction following.
- Capacidades multilingues limitadas: los metadatos indican ingles como unico idioma soportado.
- No se ha confirmado soporte para tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Asistentes conversacionales en ingles: el modelo puede mantener dialogos multi-turno con un contexto razonable, adecuado para chatbots de atencion al cliente o asistentes virtuales en entornos con recursos moderados.
- Razonamiento matematico y cientifico: gracias a su entrenamiento en trazas de razonamiento matematico, puede resolver problemas aritmeticos y algebraicos, util para herramientas educativas o de calculo asistido.
- Generacion de codigo basico: aunque no se ha confirmado soporte especifico, los modelos de la familia Qwen suelen manejar tareas de programacion; puede usarse para autocompletar fragmentos simples o explicar codigo.
- Prototipado rapido de aplicaciones NLP: su tamano compacto y formato MLX permiten integrarlo en aplicaciones de escritorio o moviles en dispositivos Apple para tareas de clasificacion, resumen o generacion de texto.
- Investigacion academica en destilacion de modelos: al ser un ejemplo de destilacion de un modelo gigante a uno pequeno, puede servir como caso de estudio en laboratorios que investigan tecnicas de compresion de modelos.
- Despliegue en entornos con restricciones de memoria: con 4 200 millones de parametros en bf16, cabe en GPUs de gama media y en Macs con suficiente RAM unificada, permitiendo inferencia local sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otros conjuntos estandar para este modelo especifico.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 8,4 GB (tamano del repositorio). Con overhead de ejecucion, se recomienda al menos 10-12 GB de VRAM o RAM unificada.
- GPU recomendadas: en hardware NVIDIA, una RTX 3080/3090 o superior con 12 GB o mas; en Apple Silicon, un chip M1 Pro/Max o superior con 16 GB de RAM unificada.
- Compatibilidad con consumer GPU: si, en GPUs con 12 GB o mas de VRAM (por ejemplo, RTX 4070 Ti, RTX 3090). Con cuantizacion a 8 bits o 4 bits, podria caber en 6-8 GB.
- Opciones de despliegue: al ser formato MLX, se puede ejecutar con la libreria MLX de Apple; tambien es posible convertirlo a GGUF para usarlo con llama.cpp u Ollama, o a otros formatos mediante herramientas de conversion.
- Latencia y throughput: no se han publicado mediciones especificas. Para un modelo de 4B en bf16, se puede esperar una velocidad de generacion de 10-30 tokens/s en hardware moderno, dependiendo de la optimizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-4B-Distill (empero-ai) | 4,2B | no disponible | no disponible | safetensors | Modelo original destilado |
| Qwen3.8-4B-Distill-MLX (nicolasramos) | 4,2B | no disponible | no disponible | MLX, safetensors | Conversion MLX del anterior |
| Qwen2.5-4B | 4B | 128K | Apache 2.0 | safetensors, GGUF | Modelo denso de Qwen, con licencia permisiva |
| Llama-3.2-3B | 3,2B | 128K | Llama 3.2 Community License | safetensors, GGUF | Modelo pequeno de Meta, con restricciones comerciales |

La comparativa se basa en parametros y disponibilidad; no hay datos de rendimiento publicados para el modelo destilado, por lo que no se puede establecer una comparacion objetiva de calidad.

## Limitaciones y advertencias

- Licencia no disponible: el repositorio de HuggingFace no especifica una licencia, lo que impide su uso comercial o en proyectos con requisitos legales claros. Se recomienda contactar al autor o usar el modelo original si se necesita una licencia definida.
- Idioma limitado: los metadatos indican solo ingles; el rendimiento en otros idiomas puede ser deficiente o no estar soportado.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estandar, por lo que su calidad relativa es desconocida.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o inconsistente, especialmente en contextos largos o temas especializados.
- Sesgos potenciales: al entrenarse sobre trazas de un modelo profesor, puede heredar sesgos presentes en los datos de entrenamiento del profesor.
- Documentacion escasa: la model card de la version MLX esta vacia; la informacion sobre el entrenamiento proviene del modelo original, no de esta conversion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nicolasramos/Qwen3.8-4B-Distill-MLX-bf16
- Modelo original (empero-ai): https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Repositorio oficial de Qwen3.8 (GitHub): https://github.com/QwenLM/Qwen3.8
- Ficha en LLM Explorer: https://llm-explorer.com/model/empero-ai%2FQwen3.8-4B-Distill,3zO5wdF6UrF9U0hXx3bqyC
- Articulo sobre Qwen3.8 en OpenLM.ai: https://openlm.ai/qwen3.8/
