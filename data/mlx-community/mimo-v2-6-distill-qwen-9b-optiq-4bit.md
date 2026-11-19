# mlx-community/MiMo-V2.6-Distill-Qwen-9B-OptiQ-4bit

## Resumen

MiMo-V2.6-Distill-Qwen-9B-OptiQ-4bit es una cuantizacion de precision mixta en formato MLX del modelo XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, un destilado de la arquitectura Qwen3.5 de 9B desarrollado por Xiaomi. Esta version concreta la publica la organizacion mlx-community y la genera con mlx-optiq, un kit de herramientas nativo de MLX para cuantizar, ajustar y servir modelos localmente en Apple Silicon sin PyTorch ni cloud.

El modelo base resuelve el problema de ejecutar un LLM de ~9.000 millones de parametros en hardware de Apple con un consumo de memoria contenido: el artefacto ocupa 6,77 GB en disco frente a los ~18 GB del original en bf16, con una media de 6,34 bits por peso. La estrategia no es una cuantizacion uniforme a 4 bits, sino una asignacion por capas en la que 134 capas se mantienen a 8 bits y 116 a 4 bits, preservando la precision en las capas mas sensibles.

La relevancia actual viene de dos factores: la arquitectura qwen3_5 con atencion hibrida (8 capas de atencion completa y 24 de atencion lineal) esta pensada para contextos largos con coste reducido, y el modelo base esta orientado a uso agentico y tool calling. Esta version cuantizada permite probar ese perfil en un Mac con memoria unificada, aunque con las cautelas propias de una receta de cuantizacion transferida y no medida sobre este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido qwen3_5 (8 capas de atencion completa, 24 de atencion lineal) |
| Parametros totales | 8.953.801.728 (8,95B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit mixta con capas a 8-bit (134 capas a 8 bits, 116 a 4 bits); group size 64; 6,34 bits por peso de media |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), repo de 7,1 GB; 6,77 GB en disco |
| Capas | 32 |
| Cabezas de atencion | 16 cabezas, 4 KV heads, head_dim 256 |
| Hidden size | 4096 |
| Vocabulario | 248.320 tokens |
| Libreria | mlx / mlx-lm / mlx-optiq |
| Modelo base | XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B |

## Arquitectura y entrenamiento

El modelo base es un transformer de 32 capas que combina atencion completa y atencion lineal: 8 capas usan atencion completa y 24 usan atencion lineal, con 16 cabezas de atencion, 4 KV heads (GQA), dimension de cabeza 256 y hidden size 4096. El vocabulario es de 248.320 tokens. Esta hibridacion reduce el coste computacional y de memoria del contexto largo respecto a un transformer de atencion completa en todas las capas. El modelo es un destilado de la familia Qwen3.5 de 9B, etiquetado por el autor como orientado a uso agentico y tool use.

Sobre el entrenamiento del modelo base no se proporciona informacion en la documentacion disponible: no hay datos sobre numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. Lo que si esta documentado es el proceso de cuantizacion de esta version. La receta de precision mixta no se midio sobre este modelo, sino que se transfirio desde mlx-community/Qwen3.5-9B-OptiQ-4bit, cuya asignacion por capas proviene de un barrido de sensibilidad por divergencia KL sobre una mezcla de calibracion de seis dominios (prosa, razonamiento, codigo, agente, tool call e instrucciones). La transferencia se justifica porque ambas arquitecturas son identicas en forma y rol de cada capa, y se verifico que los 250 tensores del modelo casan con la receta sin ninguno sin emparejar. El autor advierte explicitamente de la limitacion: la sensibilidad mide el efecto de la perdida de precision sobre el rol arquitectonico de cada capa, no sobre posibles desplazamientos de esa sensibilidad debidos al entrenamiento propio del destilado.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla de chat aplicable via tokenizer.
- Razonamiento y explicaciones tecnicas: la model card verifica respuestas sobre recuperacion factual, explicaciones tecnicas y aritmetica con pasos intermedios.
- Generacion de codigo: se valida con una implementacion iterativa de Fibonacci; el modelo base esta etiquetado para uso en codigo y agentes.
- Tool calling y function calling: el modelo base incluye la etiqueta `tool-use` y `agentic`.
- Razonamiento multi-paso y flujos agenticos, segun las etiquetas del modelo base.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Vision o audio: no disponible; el pipeline declarado es exclusivamente text-generation.

## Casos de uso

- Asistente de desarrollo en local sobre Mac: el modelo se sirve con `optiq serve` o con mlx-lm y responde a peticiones de explicacion de conceptos y generacion de fragmentos de codigo sin salir del equipo. Es adecuado por el tamano de 6,77 GB, que cabe en memoria unificada de un Mac de gama alta.
- Prototipado de agentes con tool calling: al heredar las etiquetas agentic y tool-use del modelo base, sirve para validar bucles de llamada a herramientas en local antes de desplegar en infraestructura mayor.
- Automatizacion de tareas de razonamiento con verificacion aritmetica: la model card confirma respuestas correctas en aritmetica con pasos mostrados, util para asistentes de calculo explicado en entornos educativos o de analisis.
- Generacion de codigo en pipelines de desarrollo: integrable en scripts de automatizacion y pre-revision de parches, con la ventaja de que la inferencia ocurre en el dispositivo y no requiere enviar codigo a un servicio externo.
- Evaluacion comparativa de cuantizaciones: sirve como referencia practica para medir la perdida de calidad de una receta de precision mixta frente al bf16 original en las mismas prompts, tal como hizo el autor.
- Despliegue de un chatbot tecnico interno en Apple Silicon: con licencia MIT, se puede empaquetar en una aplicacion de escritorio o servicio local para documentacion interna y soporte a desarrolladores.
- Investigacion sobre atencion hibrida: al conservar la arquitectura qwen3_5 con 24 capas de atencion lineal, permite experimentar con contextos largos en hardware de consumo, siempre que se valide la longitud de contexto efectiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ejecuto la Capability Score de seis metricas para este modelo y que los resultados publicados para el cuantizado de Qwen3.5-9B describen a ese modelo, no a este.

Lo unico verificado por el autor es una comparacion cualitativa contra el padre en bf16 con prompts identicos (recuperacion factual, aritmetica con pasos, Fibonacci iterativo y explicacion tecnica): las respuestas coinciden y la version cuantizada es entre 2,4 y 7 veces mas rapida. No se aportan cifras absolutas de latencia ni de throughput.

## Requisitos de hardware

- VRAM/memoria estimada: 6,77 GB de pesos en disco; en memoria unificada hay que sumar el overhead de MLX y la cache KV, por lo que conviene disponer de al menos 10-12 GB libres para contextos moderados.
- Hardware objetivo: Apple Silicon con MLX. El formato safetensors cuantizado de MLX no es directamente cargable en CUDA con vLLM, TGI o llama.cpp.
- GPU recomendadas: no aplica en el sentido convencional; el modelo esta pensado para chips Apple (series M). No se documentan requisitos para A100, H100 o RTX 4090.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente; no es desplegable en GPUs NVIDIA consumer sin reconversion a otro formato.
- Opciones de despliegue: `optiq serve --model mlx-community/MiMo-V2.6-Distill-Qwen-9B-OptiQ-4bit`, o directamente con `mlx_lm.load` y `mlx_lm.generate`.
- Latencia y throughput: el autor reporta una mejora de 2,4 a 7 veces frente al bf16 en las pruebas realizadas, sin cifras absolutas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-OptiQ-4bit (este) | 8,95B | no disponible | 4-bit mixta MLX, 6,34 bits/peso | MIT | Hugging Face, MLX |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (base) | 8,95B | no disponible | bf16 (~18 GB) | MIT | Hugging Face |
| mlx-community/Qwen3.5-9B-OptiQ-4bit | ~9B | no disponible | 4-bit mixta MLX | no disponible en esta ficha | Hugging Face, MLX |

La comparacion con el modelo base es la mas directa: misma arquitectura y mismos parametros, con la diferencia de que el original en bf16 requiere aproximadamente 2,6 veces mas espacio y es mas lento en Apple Silicon. Frente al cuantizado de Qwen3.5-9B, la receta de precision es la misma, pero los pesos y el ajuste del destilado son distintos, por lo que los resultados de capacidad de aquel no son extrapolables a este.

## Limitaciones y advertencias

- La asignacion de bits por capa no se midio sobre este modelo: se transfirio desde el cuantizado de Qwen3.5-9B. Si el destilado desplazo la sensibilidad de alguna capa, la receta podria no ser optima para ella.
- No se ejecuto la evaluacion de capacidades de seis metricas; no hay evidencia cuantitativa de retencion de calidad frente al bf16 mas alla de la comparacion cualitativa con cuatro prompts.
- Riesgo de alucinacion: inherente a los LLM de esta escala y no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Idiomas soportados: no declarados; no se puede asumir un rendimiento multilingue sin validacion.
- Longitud de contexto: no documentada para este artefacto; la arquitectura hibrida sugiere capacidad para contextos largos, pero debe medirse empiricamente.
- Restricciones de licencia: la licencia MIT es permisiva y permite uso comercial, pero conviene verificar las condiciones del modelo base de Xiaomi antes de un despliegue en produccion.
- Dependencia de plataforma: el formato MLX limita el despliegue a Apple Silicon; migrar a CUDA exige reconvertir los pesos.
- Entorno de produccion: al ser una cuantizacion de comunidad y no oficial del autor del modelo base, no hay garantia de soporte ni de actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/MiMo-V2.6-Distill-Qwen-9B-OptiQ-4bit
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Cuantizado de referencia para la receta: https://huggingface.co/mlx-community/Qwen3.5-9B-OptiQ-4bit
- Herramienta de cuantizacion: https://mlx-optiq.com
- Documentacion de mlx-optiq: https://mlx-optiq.com/docs/
- Laboratorio de mlx-optiq: https://mlx-optiq.com/docs/lab/
- Catalogo de cuantizaciones OptiQ: https://mlx-optiq.com/models
