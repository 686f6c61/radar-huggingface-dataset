# hectoreccles/h

## Resumen
`hectoreccles/h` es una cuantización uniforme de 4 bits en formato MLX del modelo Hemmingway-1, un modelo de lenguaje de 27.000 millones de parámetros con arquitectura de atención híbrida construido a partir de Qwen3.8-27B. Lo publica el usuario hectoreccles y su única diferencia funcional respecto al checkpoint base `hermitdave/Hemmingway-1-MLX-4bit` es que sustituye las cadenas de control largas del tokenizador (`<|im_start|>`, `<|im_end|>`, `<think>`, `</think>`) por caracteres únicos que codifican a los mismos IDs de token, sin reentrenar los pesos.

El modelo resuelve el problema de ejecutar un LLM de 27B con 262.144 tokens de contexto en hardware de Apple Silicon con memoria unificada limitada, gracias a la cuantización a 4 bits (4,501 bits por peso, group size 64) y al uso de atención híbrida que combina capas lineales con capas de atención completa cada cuarta capa. Su orientación es conversacional y de generación de texto.

Es relevante ahora porque combina una ventana de contexto muy grande (262.144 tokens), un vocabulario amplio (248.320 entradas) y un tamaño que cabe en equipos de consumo de gama alta con memoria unificada, con licencia Apache-2.0 que permite uso comercial. El repositorio ocupa 15,2 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (lineal + completa cada 4 capas) |
| Parametros totales | 26.895.993.856 (27B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 4-bit uniforme (4,501 bits por peso, group size 64, dtype bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

Datos adicionales de arquitectura: hidden size 5.120, 64 capas, 24 cabezas de atención en capas completas y 16 en capas lineales, 4 KV heads en capas completas y 48 en lineales, intermediate size 17.408, vocab size 248.320, RoPE theta 10.000.000.

## Arquitectura y entrenamiento
El modelo es un transformer denso de 27B parámetros con esquema de atención híbrido: intercala capas de atención lineal con capas de atención completa, aplicando esta última cada cuarta capa. Esta combinación reduce el coste computacional y de memoria del mecanismo de atención en contextos largos, lo que resulta coherente con la ventana declarada de 262.144 tokens. La configuración de cabezas es asimétrica entre ambos tipos de capa (24 cabezas y 4 KV heads en las completas frente a 16 cabezas y 48 KV heads en las lineales), y el RoPE theta elevado a 10.000.000 está pensado para sostener la extrapolación de contexto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF, DPO u otro tipo de alineamiento. El modelo original es `Altworld/Hemmingway-1`, construido sobre Qwen3.8-27B, y esta ficha corresponde únicamente a su recuantización a MLX con `mlx-lm`. La innovación destacable de esta publicación concreta no está en los pesos sino en el tokenizador: los marcadores de chat y de modo thinking se reemplazan por caracteres únicos (`≺`, `≻`, `⊏`, `⊐`) que se codifican a los mismos IDs de token originales (248.045, 248.046, 248.068 y 248.069), de modo que los pesos no se retocan y el comportamiento se preserva.

## Capacidades
- Generación de texto conversacional multi-turno, con soporte de roles de sistema y usuario mediante los marcadores `≺` y `≻`.
- Modo de razonamiento o thinking explícito, delimitado por los marcadores `⊏` y `⊐` (antiguos `<think>` y `</think>`).
- Razonamiento sobre contextos muy largos, hasta 262.144 tokens, gracias a la atención híbrida y al RoPE theta elevado.
- Generación orientada a texto natural con énfasis en naturalidad y franqueza, según los resultados de evaluación declarados por el autor.
- Escritura creativa y narrativa, con puntuaciones altas en calidad de relato en la evaluación publicada.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, ejecución de agentes multi-paso, visión, audio ni otras modalidades.
- Idiomas soportados: no disponible.

## Casos de uso
- Atención al cliente automatizada: el modelo puede mantener conversaciones multi-turno con un historial muy extenso sin truncar, ya que su ventana de 262.144 tokens permite incluir manuales de producto, historial de tickets y políticas internas en el propio contexto.
- Asistentes personales en local sobre Mac: al estar en formato MLX y cuantizado a 4 bits, puede desplegarse íntegramente en un equipo Apple Silicon con memoria unificada suficiente, sin enviar datos a servicios externos.
- Redacción de comunicaciones sensibles: el prompt de ejemplo de la model card pide redactar una carta al casero sobre una caldera averiada; el modelo muestra puntuaciones altas en franqueza y naturalidad, lo que encaja con la redacción de correos, reclamaciones y comunicaciones formales.
- Escritura creativa y narrativa larga: con 262.144 tokens de contexto puede mantener coherencia de personajes y tramas a lo largo de documentos extensos, y su evaluación de calidad de relato es competitiva.
- Procesamiento de documentos largos: análisis y resumen de contratos, informes técnicos o expedientes que superen los cientos de miles de tokens sin necesidad de estrategias de chunking agresivas.
- Tutoría y asistencia educativa con razonamiento visible: el modo thinking permite exponer el proceso de razonamiento antes de la respuesta final, útil en explicaciones paso a paso.
- Prototipado e investigación en entornos Apple: al ser un checkpoint MLX con `mlx-lm`, sirve para experimentar con atención híbrida y contextos largos en estaciones de trabajo Mac sin infraestructura de GPU dedicada.

## Benchmarks y rendimiento
El autor publica una evaluación con DeepEval GEval (juez LLM) ejecutada el 23 de septiembre de 2026 sobre oMLX con un M3 Max, con 50 casos por modelo. Es importante señalar una limitación metodológica: los resultados corresponden a la cuantización oQ4e del modelo, no a esta cuantización de 4 bits, y la comparación es contra Ornith-1.5-35B en oQ4e, un modelo de mayor tamaño. La métrica "message-not-memo" se muestreó con 3 generaciones por prompt. Aproximadamente el 5 % de las generaciones se descartaron por errores transitorios del servidor.

| Categoria | Hemmingway-1 oQ4e | Ornith-1.5 oQ4e |
|---|---|---|
| Directness | 1,00 | 0,78 |
| Human-Likeness | 1,00 | 0,72 |
| Empathy (EQ) | 0,72 | 0,85 |
| Hard asks - Actionability | 0,64 | 0,53 |
| Hard asks - Confidence | 0,62 | 0,75 |
| Message not memo | 0,71 | 0,82 |
| Story Quality | 0,94 | 0,96 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni mediciones específicas para el checkpoint `hectoreccles/h` cuantizado a 4 bits.

## Requisitos de hardware
- VRAM estimada para inferencia: con 26,9B parámetros a 4,501 bits por peso, los pesos ocupan aproximadamente 15,1 GB; el repositorio completo son 15,2 GB. Hay que añadir memoria para la caché KV, que con 262.144 tokens de contexto puede ser muy elevada y crecer linealmente con la longitud real de la secuencia.
- GPU recomendadas: el formato es MLX, por lo que el destino natural es Apple Silicon (serie M). La evaluación del autor se ejecutó en un M3 Max. No se ha publicado soporte ni cifras para A100, H100 o RTX 4090 en esta ficha.
- Cabe en consumer GPU: en el sentido estricto de GPU discreta, no hay soporte MLX; en memoria unificada de Apple Silicon requiere del orden de 16-20 GB libres como mínimo para el modelo más caché, lo que apunta a configuraciones de 24 GB o superiores (M-series Pro/Max con 24-128 GB). No se dispone de datos para confirmar el comportamiento exacto de la caché KV en contextos largos.
- Opciones de despliegue: `mlx-lm` es la vía documentada (`python3 -m mlx_lm.generate --model hectoreccles/h`). No se proporciona versión GGUF en la información disponible, por lo que llama.cpp u Ollama requerirían una conversión previa. vLLM y TGI no están documentados para este checkpoint.
- Latencia y throughput estimados: no disponible. La model card solo indica el hardware de la evaluación (M3 Max), sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| hectoreccles/h | 27B | 262.144 | Apache-2.0 | MLX safetensors 4-bit | HuggingFace, libreria mlx |
| Altworld/Hemmingway-1 | 27B | 262.144 (segun upstream) | Apache-2.0 | pesos completos | HuggingFace |
| hermitdave/Hemmingway-1-MLX-4bit | 27B | 262.144 (segun upstream) | Apache-2.0 | MLX safetensors 4-bit | HuggingFace |
| Ornith-1.5-35B oQ4e | 35B | no disponible | no disponible | oQ4e | HuggingFace (citado como comparacion) |

La diferencia entre `hectoreccles/h` y `hermitdave/Hemmingway-1-MLX-4bit` es exclusivamente el tokenizador: mismos pesos, marcadores de control acortados a un carácter. Frente a Ornith-1.5-35B, el modelo evaluado obtiene mejor puntuación en franqueza, naturalidad y accionabilidad en peticiones difíciles, pero peor en empatía, confianza y en el criterio de no sonar a plantilla. Los datos sobre Ornith-1.5-35B y sobre Qwen3.8-27B no están detallados en la información disponible.

## Limitaciones y advertencias
- Los benchmarks publicados corresponden a la cuantización oQ4e, no a esta cuantización de 4 bits uniforme, por lo que el rendimiento real de `hectoreccles/h` puede diferir. No hay evaluación específica de este checkpoint.
- La evaluación usa un juez LLM (DeepEval GEval) con 50 casos y un único equipo; es una muestra pequeña y no sustituye a benchmarks estandarizados.
- Riesgo de alucinación: no hay datos publicados sobre tasas de alucinación ni sobre comportamiento en dominios factuales.
- Idiomas soportados: no disponible. No se puede asumir cobertura multilingüe más allá de lo que herede del modelo base Qwen3.8-27B, que tampoco se documenta aquí.
- El tokenizador modificado implica que las cadenas largas antiguas (`<|im_start|>`, `<think>`, etc.) ya no se mapean a sus IDs de control y se tratan como texto normal. Cualquier pipeline que dependa de esas cadenas literalmente fallará; hay que usar `≺`, `≻`, `⊏` y `⊐`.
- Licencia Apache-2.0 en este checkpoint y en el upstream, lo que permite uso comercial, pero conviene verificar la licencia de Qwen3.8-27B como base subyacente antes de un despliegue en producción.
- Formato MLX: limita el despliegue a Apple Silicon salvo conversión, lo que excluye servidores con GPU NVIDIA sin trabajo adicional.
- La caché KV en contextos de 262.144 tokens puede consumir una cantidad de memoria muy superior a la de los pesos; no se han publicado cifras al respecto.
- Sin descargas ni likes registrados y con fecha de creación muy reciente en el momento de la consulta, no hay validación independiente por parte de la comunidad.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/hectoreccles/h
- Modelo base directo: https://huggingface.co/hermitdave/Hemmingway-1-MLX-4bit
- Modelo upstream: https://huggingface.co/Altworld/Hemmingway-1
- Cuantización oQ4e usada en los benchmarks: https://huggingface.co/hermitdave/Hemmingway-1-oQ4e
- Herramienta de conversión citada: https://hermes-agent.nousresearch.com
- Perfil del autor en GitHub: https://github.com/hectoreccles
- Perfil del autor en Sketchfab: https://sketchfab.com/hectoreccles
