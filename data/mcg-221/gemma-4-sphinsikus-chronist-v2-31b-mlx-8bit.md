# McG-221/Gemma-4-Sphinsikus-Chronist-V2-31B-mlx-8Bit

## Resumen

El modelo **McG-221/Gemma-4-Sphinsikus-Chronist-V2-31B-mlx-8Bit** es una conversión al formato MLX (optimizado para Apple Silicon) de un merge creado por Blazed-Forge, cuyo objetivo es ofrecer un modelo especializado en roleplay y escritura creativa con una fuerte adherencia al personaje. El merge parte de la familia Gemma 4 de Google (modelo de 31B parámetros) y lo combina con otros pesos mediante mergekit, buscando mantener un tono realista y evitar la deriva hacia contenido excesivamente explícito o fuera de personaje, sin renunciar a la falta de censura.

Esta versión en concreto, publicada por McG-221, está cuantizada a 8 bits y empaquetada para MLX, lo que permite ejecutarla en ordenadores Mac con memoria unificada. Aunque el nombre del modelo indica 31B, el archivo safetensors del repositorio muestra 8.634.585.404 parámetros, una discrepancia que no está explicada en la documentación y que conviene tener en cuenta al dimensionar el hardware. El modelo está pensado principalmente para tareas de generación de texto narrativo, conversación con personajes y simulación de diálogos, con soporte únicamente para inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, basado en Gemma 4) |
| Parametros totales | 8.634.585.404 (según safetensors; el nombre del modelo indica 31B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors); también existen versiones GGUF del modelo base |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo. Según la model card, se trata de un merge realizado con mergekit, combinando el modelo base Gemma 4 (probablemente la variante de 31B) con otros pesos no especificados. El objetivo declarado por el autor del merge es mejorar la adherencia al personaje en contextos de roleplay, reduciendo la tendencia de Gemma 4 a desviarse hacia un tono excesivamente lascivo o fuera de tono, manteniendo al mismo tiempo la ausencia de censura. No se mencionan datos de entrenamiento adicional, fine-tuning con RLHF/DPO ni el número de tokens utilizados. La conversión a MLX se realizó con la librería mlx-lm versión 0.31.2, sin modificar los pesos originales.

## Capacidades

- Generación de texto narrativo y descriptivo para roleplay y escritura creativa.
- Mantenimiento de la coherencia del personaje en conversaciones multi-turno.
- Simulación de diálogos realistas y contextualizados.
- Soporte para historias interactivas y aventuras de texto.
- Generación de contenido sin censura (según la descripción del merge).
- No se menciona soporte explícito para tool calling, funciones, agentes o razonamiento multi-step.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- **Roleplay en juegos de texto**: el modelo puede actuar como un personaje consistente en aventuras conversacionales, manteniendo el tono y la personalidad definidos por el usuario, gracias a su enfoque en la adherencia al personaje.
- **Escritura de ficción interactiva**: útil para generar ramas narrativas, descripciones de escenarios y diálogos en obras donde el lector participa en la historia.
- **Asistentes de escritura creativa**: puede ayudar a autores a explorar diálogos entre personajes, superar bloqueos creativos o generar borradores de escenas con un estilo coherente.
- **Simulación de personajes para videojuegos**: integrable en motores de diálogo de juegos independientes o prototipos, ofreciendo respuestas contextuales y personalidad estable.
- **Chatbots de entretenimiento**: para crear bots de conversación con una temática concreta (fantasía, ciencia ficción, etc.) donde el realismo del personaje es prioritario.
- **Generación de guiones y diálogos**: en producción audiovisual o teatral, puede servir como herramienta de brainstorming para diálogos entre personajes con rasgos definidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos objetivos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo concreto. Al ser un merge orientado a una tarea específica (roleplay), es probable que su rendimiento en tareas generales sea inferior al de los modelos base sin fusionar, pero no hay datos que lo confirmen.

## Requisitos de hardware

- Al estar en formato MLX, está pensado para ejecutarse en Macs con Apple Silicon (M1, M2, M3 o superiores) mediante la librería mlx-lm.
- El tamaño del repositorio es de 32,6 GB, lo que sugiere que el modelo completo (incluso en 8-bit) ocupa alrededor de 31 GB, coherente con un modelo de 31B parámetros cuantizado a 8 bits. Por tanto, se recomienda un Mac con al menos 32 GB de memoria unificada para cargar el modelo en memoria.
- Si el número real de parámetros fuese de 8,6B (como indica el safetensors), el requisito de memoria sería mucho menor (unos 9-10 GB), pero el tamaño del repo contradice esa cifra. Se recomienda verificar el modelo antes de dimensionar el hardware.
- No se mencionan requisitos para GPUs NVIDIA ni otras plataformas; el formato MLX es exclusivo de Apple.
- Opciones de despliegue: mlx-lm para Python; también existen versiones GGUF del modelo base (Blazed-Forge/Gemma-4-Sphinsikus-Chronist-31B-GGUF) que se pueden ejecutar con llama.cpp, Ollama u otras herramientas compatibles con CPU/GPU.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa objetiva con otros modelos de la misma categoría. El modelo es un merge específico para roleplay, y no se han publicado benchmarks comparativos. Como referencia, se puede mencionar que el modelo base Gemma 4 31B de Google es un modelo generalista con licencia Apache 2.0, pero esta versión fusionada no ha sido evaluada públicamente frente a alternativas como Llama 3 70B, Mistral Large o modelos especializados en roleplay como MythoMax o Noromaid. Dado que no hay datos, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se recomienda su uso en otros idiomas sin evaluación previa.
- Al ser un merge no entrenado desde cero, puede presentar alucinaciones o inconsistencias en contextos no relacionados con el roleplay.
- La adherencia al personaje, aunque mejorada, no es perfecta y puede fallar en conversaciones muy largas o con instrucciones ambiguas.
- La licencia Apache 2.0 permite uso comercial y modificación, pero el modelo base Gemma 4 puede tener sus propias restricciones (aunque Google ha liberado Gemma bajo Apache 2.0, conviene revisar los términos específicos).
- La discrepancia entre el número de parámetros indicado en el nombre (31B) y el reportado en safetensors (8,6B) es un punto crítico que puede afectar a la planificación de recursos; se recomienda verificar el modelo antes de desplegarlo.
- No se han publicado evaluaciones de seguridad, sesgos o robustez; el modelo podría generar contenido inapropiado o sesgado, especialmente al estar diseñado para roleplay sin censura.

## Enlaces

- [Modelo en Hugging Face (MLX 8-bit)](https://huggingface.co/McG-221/Gemma-4-Sphinsikus-Chronist-V2-31B-mlx-8Bit)
- [Modelo base (Blazed-Forge)](https://huggingface.co/Blazed-Forge/Gemma-4-Sphinsikus-Chronist-V2-31B)
- [Versión GGUF del modelo base](https://huggingface.co/Blazed-Forge/Gemma-4-Sphinsikus-Chronist-31B-GGUF)
- [Página de Gemma 4 en Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
