# GT1999/mwp-v2-llama1b-b8-stage5

## Resumen

El modelo GT1999/mwp-v2-llama1b-b8-stage5 es un adaptador LoRA desarrollado por el usuario GT1999 para la resolución de problemas matemáticos con palabras (math word problems). El nombre indica que se basa en un modelo Llama de aproximadamente 1B de parámetros, aunque no se especifica la variante exacta del modelo base. Se trata de la quinta etapa de un entrenamiento por etapas (stage5) que emplea un esquema de rango constante (r=102) con escalado alpha/r, y una partición de los datos por dificultad. El repositorio tiene un tamaño de 0.3 GB y los pesos se almacenan en formato safetensors, lo que sugiere que el adaptador es ligero y requiere el modelo base para la inferencia.

El entrenamiento utiliza fine-tuning secuencial (seqft) con replay acumulativo por niveles, y la validación se realiza sobre un 5% de los datos de entrenamiento, estratificados por dificultad, con una semilla fija (42). En esta etapa se acumularon 7124 ejemplos de entrenamiento. No se ha publicado información sobre licencia, idiomas soportados ni pipeline de uso. Este modelo forma parte de una serie de variantes (b8, b10, etc.) del mismo autor, lo que indica una exploración sistemática de configuraciones de entrenamiento para tareas de razonamiento matemático.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Llama (1B), según el nombre; detalles no disponibles |
| Parametros totales | 1B (modelo base, según el nombre); adaptador LoRA: no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se ajusta a un modelo base Llama de 1B, aunque no se especifica la arquitectura exacta del transformer subyacente. El entrenamiento se realiza mediante fine-tuning secuencial (seqft) con una configuración de rango constante: LoRA rank 102, alpha 204 (escalado alpha/r). El proceso se divide en etapas (stage5), con partición de los datos por dificultad y replay acumulativo de niveles. Se emplea early stopping con paciencia 2 y una semilla de validación fija (42) sobre el 5% del conjunto de entrenamiento, estratificado por nivel; el conjunto de prueba no se utiliza para la selección de hiperparámetros. El número acumulado de ejemplos en esta etapa es de 7124. No se dispone de información sobre el dataset específico, el número total de tokens ni la composición de los datos.

## Capacidades

- Resolución de problemas matemáticos planteados en lenguaje natural (word problems).
- Razonamiento numérico y aritmético básico, aunque no se han documentado límites de complejidad.
- Posible capacidad de generar explicaciones paso a paso, dado el enfoque en problemas de texto.
- No se ha confirmado soporte para tool calling, agentes, visión o audio.
- No se ha confirmado el soporte multilingüe; probablemente esté entrenado principalmente en inglés, pero no hay datos.

## Casos de uso

- Tutoría de matemáticas: el modelo puede utilizarse en plataformas educativas para resolver problemas planteados por estudiantes y ofrecer soluciones detalladas, aprovechando su especialización en word problems.
- Generación de ejercicios: puede crear problemas matemáticos con diferentes niveles de dificultad, útil para profesores o generación de contenido educativo.
- Evaluación automática: integrado en sistemas de corrección, puede comparar respuestas de estudiantes con soluciones esperadas, aunque se requiere validación adicional.
- Asistencia en cálculo cotidiano: puede resolver problemas de la vida diaria como presupuestos, descuentos o proporciones, en un entorno conversacional.
- Chatbots educativos: incorporado en asistentes virtuales para responder preguntas de matemáticas en tiempo real, con un modelo ligero que puede ejecutarse en hardware modesto.
- Análisis de texto matemático: extracción y resolución de problemas matemáticos contenidos en documentos o mensajes, útil en aplicaciones de procesamiento de lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estándar.

## Requisitos de hardware

- Al ser un adaptador LoRA, requiere el modelo base Llama 1B completo para la inferencia. El modelo base en fp16 ocupa aproximadamente 2 GB, y en cuantización de 4 bits puede reducirse a ~0.5-1 GB.
- VRAM estimada: para el modelo base en fp16, se necesitan al menos 4 GB de VRAM (considerando overhead); con cuantización 8 bits, ~2 GB; con 4 bits, ~1 GB.
- GPU recomendadas: tarjetas con 4-6 GB de VRAM (p. ej., RTX 3060, RTX 2060, GTX 1660) pueden ejecutar el modelo con cuantización ligera; GPUs de gama alta (A100, H100) no son necesarias.
- El adaptador LoRA añade una sobrecarga mínima en memoria (menos de 0.1 GB).
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que soporten carga de adaptadores LoRA. No se ha confirmado compatibilidad específica.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (resolución de problemas matemáticos con word problems). Existen otras variantes del mismo autor (p. ej., mwp-v2-llama1b-b10-stage1) con tamaños de repositorio mayores (739 MB), pero no se conocen sus especificaciones ni rendimiento. No es posible realizar una comparativa objetiva sin datos adicionales.

## Limitaciones y advertencias

- No se ha publicado la licencia, lo que impide determinar si es apto para uso comercial o requiere permiso del autor.
- Al ser un modelo de 1B, puede presentar limitaciones en problemas matemáticos complejos o de razonamiento multi-paso.
- Riesgo de alucinación en respuestas, especialmente si se usa fuera de su dominio de entrenamiento.
- No se ha confirmado el soporte de idiomas; probablemente esté limitado a inglés, aunque no se especifica.
- El entrenamiento por etapas con replay acumulativo puede provocar olvido catastrófico si no se gestiona adecuadamente, aunque el diseño intenta mitigarlo.
- No hay datos de evaluación independiente, por lo que su rendimiento real es desconocido.
- El adaptador requiere el modelo base Llama 1B, que debe obtenerse por separado y puede tener sus propias restricciones de licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GT1999/mwp-v2-llama1b-b8-stage5
- Otras variantes del autor: https://huggingface.co/GT1999/mwp-v2-llama1b-b10-stage1/tree/main
- Lista de modelos con tag mwp-v2: https://huggingface.co/models?other=mwp-v2
