# MAIN-Lab/qwen3-0.6b-tictactoe

## Resumen

Qwen3-0.6B · tic-tac-toe es un ajuste fino completo del modelo Qwen3-0.6B de Alibaba, desarrollado por MAIN-Lab dentro de su programa de benchmarks (Benchmark #006). El objetivo no es un asistente generalista, sino un jugador de tres en raya perfecto: el modelo ha sido destilado a partir de un solver minimax exacto, de modo que internaliza la funcion de valor del juego y responde con un unico digito que indica la casilla optima. Es un experimento de destilacion de profesor exacto a alumno pequeno.

El modelo conserva la arquitectura transformer decoder-only de Qwen3-0.6B, con 751.632.384 parametros reales segun los pesos en safetensors, y se distribuye bajo licencia Apache-2.0. El repositorio ocupa 1,5 GB en formato safetensors. No utiliza plantilla de chat: funciona por completacion pura de texto y genera como maximo un token de respuesta.

Su relevancia es metodologica mas que practica: demuestra que un modelo de menos de mil millones de parametros puede absorber de forma exacta el comportamiento de un profesor determinista cuando el espacio de estados es finito y enumerable (4.520 tableros alcanzables). Sirve como referencia para estudiar destilacion, generalizacion sobre estados no vistos y evaluacion exhaustiva frente a benchmarks por muestreo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino completo del modelo base |
| Parametros totales | 751.632.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-0.6B; no declarada en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (la tarea es numerica; no se declaran idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B y se somete a un ajuste fino completo (full fine-tune) con los embeddings congelados, optimizador AdamW y autocast en bf16, ejecutado sobre 4 nucleos de CPU. El profesor es un solver minimax exacto de tres en raya. El conjunto de datos cubre los 4.520 tableros no terminales alcanzables, y el objetivo de entrenamiento es la perdida −log P(cualquier casilla optima) calculada sobre el vocabulario completo, es decir, se premia la probabilidad agregada de cualquier movimiento que preserve el valor del juego en lugar de una unica respuesta canonica.

El entrenamiento se dividio en dos fases: la fase A, de 3.000 pasos con batch de 32 y sin los tableros reservados (unas 6 horas), y la fase B, de 1.500 pasos con batch de 32 sobre todos los tableros (3,5 horas). El proceso se detuvo cuando el modelo respondio correctamente todos los tableros dos veces consecutivas. Como control de generalizacion se ejecuto un entrenamiento separado excluyendo 719 tableros (15% de las clases de simetria, con todas sus rotaciones y reflexiones), aunque el modelo publicado se entreno con el conjunto completo.

## Capacidades

- Generacion de texto por completacion pura, sin plantilla de chat ni formato conversacional.
- Juego de tres en raya perfecto: identifica la casilla optima para el lado que mueve (X u O) en cualquier tablero no terminal.
- Salida restringida a un unico digito (1-9) que representa la casilla elegida.
- Generalizacion sobre tableros no vistos: 96,8% de acierto en 719 tableros excluidos en el entrenamiento de control.
- Cumplimiento estricto del formato: 100% de casillas legales en texto libre, frente al 71% del modelo base.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales.
- No se declaran capacidades multilingues; la tarea es numerica y el prompt de referencia esta en ingles.

## Casos de uso

- Evaluacion de destilacion de profesor exacto: usar el modelo como caso de referencia para medir cuanto de un solver determinista puede absorber un transformer pequeno con un dataset finito y enumerable.
- Banco de pruebas de generalizacion: comparar el rendimiento en tableros vistos frente a los 719 reservados para estudiar memorizacion frente a induccion de la funcion de valor.
- Verificacion de pipelines de ajuste fino: el entrenamiento completo en CPU en menos de 10 horas lo convierte en un test rapido de infraestructura de entrenamiento (bf16, AdamW, embeddings congelados).
- Generacion de datos sinteticos de juego: el modelo puede actuar como anotador de movimientos optimos sobre tableros generados aleatoriamente, con una tasa de acierto del 100% en el conjunto completo.
- Docencia y divulgacion: ejemplo minimo y reproducible de destilacion con evaluacion exhaustiva (619 lineas de oponente sin derrotas) para cursos de aprendizaje automatico.
- Referencia negativa de robustez: util para ilustrar que un modelo de 0,6B ajustado a una tarea cerrada no conserva capacidades generales de asistente, lo que ayuda a delimitar expectativas en despliegues especializados.

## Benchmarks y rendimiento

Resultados publicados por el autor, con el mismo prompt y codigo para todos los modelos:

| Test | Qwen3-0.6B antes | Gemma 3 270M | SmolLM3-3B | Este modelo |
|---|---|---|---|---|
| Mejor movimiento, 4.520 tableros | 58,9% | 57,8% | 57,3% | 100% |
| Mejor movimiento, 719 tableros no vistos | 60,6% | 59,9% | 58,8% | 96,8% |
| Lineas de oponente perdidas (exhaustivo) | 560 / 1.023 | 458 / 901 | 603 / 1.112 | 0 / 619 |
| Derrotas contra jugador perfecto (1.000 partidas) | 971 | 1.000 | 992 | 0 |
| Victorias contra jugador aleatorio (1.000 partidas) | 56% | 62% | 49% | 93% (0 derrotas) |
| Casilla legal en texto libre | 71% | 89% | 11% | 100% |

Un jugador aleatorio acierta el mejor movimiento el 58% de las veces, lo que contextualiza la linea base.

## Requisitos de hardware

- VRAM estimada: en bf16, los 751,6 millones de parametros ocupan aproximadamente 1,5 GB de pesos; con cache KV y overhead de runtime, el consumo ronda 2-3 GB. En fp32, unos 3 GB solo de pesos.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente; una RTX 3060, RTX 4060 o superior cubre el caso con holgura. Para lotes grandes, A100 o H100 no aportan ventaja significativa por el tamano del modelo.
- Cabe en GPU de consumo: si, en practicamente toda la gama actual (RTX 3050 en adelante) e incluso en CPU.
- Opciones de despliegue: transformers (referencia del autor), vLLM, TGI y llama.cpp/Ollama si se generan pesos GGUF, que no se publican en el repositorio.
- Latencia y throughput: no disponibles de forma oficial. El autor reporta el entrenamiento en 4 nucleos de CPU, lo que sugiere que la inferencia es viable en CPU, aunque no se publican cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en tres en raya | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MAIN-Lab/qwen3-0.6b-tictactoe | 751,6 M | no disponible | 100% en 4.520 tableros; 0 derrotas en 619 lineas | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-0.6B (base) | 0,6 B | no disponible en esta ficha | 58,9% de mejor movimiento | Apache-2.0 | Hugging Face |
| Gemma 3 270M | 270 M | no disponible en esta ficha | 57,8% de mejor movimiento | no disponible en esta ficha | Hugging Face |
| SmolLM3-3B | 3 B | no disponible en esta ficha | 57,3% de mejor movimiento | no disponible en esta ficha | Hugging Face |

La comparacion es de tarea, no de capacidad general: los tres modelos de referencia son asistentes generalistas y no han sido ajustados al juego, por lo que su rendimiento cercano al azar es esperable.

## Limitaciones y advertencias

- El modelo solo sabe jugar al tres en raya; no conserva de forma fiable capacidades generales de generacion, razonamiento o codigo tras el ajuste fino completo.
- La tarea es finita y completamente enumerable (4.520 tableros), por lo que el resultado no es extrapolable a juegos o dominios con espacios de estados no enumerables, tal como advierte el propio autor.
- La evaluacion exhaustiva cubre 619 lineas de oponente, no todas las posibles secuencias de juego; el autor la presenta como comprobacion completa de lineas, pero conviene leerla con ese alcance.
- No usa plantilla de chat: introducir prompts conversacionales produce salidas degeneradas o no conformes al formato esperado.
- Riesgo de alucinacion fuera de distribucion: ante tableros invalidos, prompts en otros idiomas o formatos distintos al de referencia, la salida de un unico digito puede ser arbitraria.
- No se declaran idiomas soportados ni sesgos conocidos; al tratarse de una tarea numerica cerrada, el riesgo de sesgo social es bajo, pero no hay evaluacion publicada al respecto.
- Licencia Apache-2.0 permite uso comercial, pero el modelo no es util para produccion salvo como componente de un motor de juego o como referencia de investigacion.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ) ni datos de latencia, lo que limita la planificacion de despliegues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MAIN-Lab/qwen3-0.6b-tictactoe
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio MAIN Lab (codigo en `tictac/`): no disponible como enlace directo en la informacion proporcionada
