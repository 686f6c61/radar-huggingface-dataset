# open-athena/snowball-67b-a2b-base-262k-qk157

## Resumen

El modelo Snowball 67B-A2B es un modelo de lenguaje base de tipo MoE publicado por open-athena. Tiene 67.078.882.816 parámetros totales, de los cuales aproximadamente 2.000 millones se activan por token. Se trata de un export en BF16 del paso 157.000 de un experimento de la comunidad marin orientado a comparar estrategias de contexto largo. En ese paso se extendió la ventana de contexto de 156.000 a 157.000 tokens con un factor qk_mult de 1.57, alcanzando una longitud máxima de 262.144 tokens. La arquitectura incluye 26 capas, 256 expertos con selección de cuatro por token, cinco KV heads y un vocabulario de 128.256 tokens. El checkpoint está pensado para continuaciones de texto y como base para ajuste fino, no para uso directo en conversación. Requiere el fork de vLLM de la comunidad marin, ya que implementa la clase GrugMoeForCausalLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (GrugMoeForCausalLM / grug_moe) |
| Parámetros totales | 67.078.882.816 |
| Parámetros activos | ~2.000.000.000 por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | No disponible; el checkpoint se publica únicamente en BF16 |
| Idiomas soportados | Inglés (en) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo usa una arquitectura de mezcla de expertos (MoE) con 256 expertos y una activación de cuatro expertos por token, lo que da lugar a unos 2B parámetros activos de un total de 67B. Tiene 26 capas transformadoras y cinco KV heads, según la información de la model card. El checkpoint es un export BF16 del paso 157.000 de un run descrito en el issue 8977 del repositorio marin. En ese run se extendió el contexto de 156.000 a 157.000 tokens mediante un incremento del factor qk_mult a 1.57, manteniendo el mismo muestreo de documentos para contexto largo. No se han publicado detalles sobre los datos de entrenamiento, número de tokens, composición del dataset ni procesos como RLHF o DPO. Se trata de un modelo base sin ajuste por instrucciones.

## Capacidades

- Generación de texto en modo continuaciones: al ser un modelo base, se utiliza con completions de texto y no con plantillas de chat.
- Ventana de contexto ampliada: soporta 262.144 tokens, lo que permite procesar documentos muy extensos en una sola pasada.
- Eficiencia computacional del MoE: a pesar de sus 67B de parámetros, solo ~2B se activan por token, reduciendo el coste de cálculo durante la inferencia.
- Preparado para ajuste fino: el modelo base puede adaptarse posteriormente a instrucciones o a dominios específicos.
- Sin soporte declarado para tool calling, agentes, visión o audio en la información disponible.
- Monolingüe: los metadatos y la model card solo contemplan el idioma inglés.

## Casos de uso

- Investigación sobre extensión de contexto: el modelo resulta útil para probar el efecto del factor qk_mult en ventanas de 262k tokens, comparando la coherencia entre tramos largos del texto.
- Fine-tuning para tareas específicas: al ser un modelo base, puede ajustarse con datasets de instrucciones o de dominio para construir asistentes especializados en inglés.
- Procesamiento de documentos largos: permite leer informes técnicos, legales o administrativos completos sin fragmentarlos.
- Generación de contenido extenso: sirve para continuar artículos, relatos o guiones largos en inglés, manteniendo un contexto amplio.
- Evaluación de arquitecturas MoE: puede utilizarse en estudios comparativos sobre el equilibrio entre activación de parámetros y capacidad total en modelos con 256 expertos.
- Benchmark de despliegue distribuido: al requerir un fork de vLLM, es adecuado para experimentar con configuraciones de tensor parallelism, data parallelism y expert parallelism en clústeres de GPUs de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card menciona un registro de serving y evaluation para los exports con QK 1.57 y 1.75, pero no incluye cifras concretas de rendimiento. Además, el propio autor indica que no se ha ejecutado una prueba de paridad numérica ni de generación en esta subida, por lo que solo se han validado nombres de tensores, dtype, config, tamaños y sumas SHA-256.

## Requisitos de hardware

- VRAM estimada: en BF16, el checkpoint ocupa 134.2 GB. Para inferencia hay que añadir el overhead de las activaciones y la caché KV, por lo que se necesitan al menos 134 GB de VRAM disponibles.
- GPU recomendadas: la configuración de servicio descrita usa ocho GPUs H100, con tensor parallelism 1, data parallelism 8 y expert parallelism.
- Consumo: no es viable en una GPU de consumo. Se requiere un clúster de GPUs de centro de datos.
- Opciones de despliegue: es necesario usar el fork de vLLM de la comunidad marin. No se mencionan alternativas como llama.cpp, TGI u Ollama.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Snowball 67B-A2B | 67.078.882.816 | ~2B | 262.144 | openmdw-1.1 | Limitada al fork de vLLM de marin |
| Mixtral 8x7B | 46.7B | 12.9B | 32.768 | Apache 2.0 | Amplia (transformers, vLLM, llama.cpp) |
| Qwen2-57B-A14B | 57B | 14B | 32.768 (ampliable) | Apache 2.0 | Amplia (transformers, vLLM, etc.) |

No se dispone de resultados de benchmarks para comparar el rendimiento; los datos de las alternativas se ofrecen solo como referencia de especificaciones.

## Limitaciones y advertencias

- Modelo base sin instrucciones: la model card advierte de que el chat template del tokenizer no indica ajuste por instrucciones, por lo que no debe usarse para conversación directa.
- Falta de validación funcional: el autor declara que no se ha ejecutado una prueba de paridad numérica ni de generación para este export concreto.
- Monolingüe: solo está soportado el inglés, lo que limita su uso en otros idiomas.
- Licencia no estándar: openmdw-1.1 no es una licencia común; conviene revisar sus términos antes de usarlo en productos comerciales.
- Dependencia del fork de vLLM: el modelo solo puede servirse con la implementación de grug_moe del repositorio marin, lo que complica su portabilidad.
- Contexto muy largo: no se especifica la degradación esperada más allá de ciertas longitudes; la calidad podría reducirse en los tramos finales de la ventana.
- Sin benchmarks publicados: el rendimiento real frente a modelos similares es desconocido.
- Riesgo de alucinación: al ser un modelo de generación libre, puede producir contenido plausible pero incorrecto.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/open-athena/snowball-67b-a2b-base-262k-qk157
- Issue del experimento de contexto largo: https://github.com/marin-community/marin/issues/8977
- Fork de vLLM requerido: https://github.com/marin-community/vllm
- Registro de serving y evaluation: https://github.com/marin-community/marin/issues/8702
