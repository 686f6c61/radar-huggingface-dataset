# Scarick2003buffalo/echogo_32b

## Resumen
EchoGo 32B es un modelo de lenguaje especializado en la explicación en chino de partidas de Go (weiqi/baduk), desarrollado por el usuario Scarick2003buffalo. Se trata de un ajuste fino supervisado (SFT) del modelo denso Qwen3-32B de Alibaba, seleccionando el checkpoint-1188 de la tercera ronda acumulada de entrenamiento. Su función es actuar como "profesor" que genera comentarios en chino con referencias factuales a partir de una posición de tablero y hechos estructurados extraídos por el motor KataGo.

El modelo recibe como entrada el estado del tablero antes del movimiento (representado con X/O para negro y blanco, @ para la jugada real y A/B para puntos de referencia), junto con hechos estructurados como diferencia de puntos, variantes recomendadas, respuestas del oponente y ganancias/pérdidas de bloques y regiones. La salida es una explicación en chino con citas a esos hechos. Este modelo actúa además como profesor del modelo destilado EchoGo 4B OPD.

La relevancia radica en su enfoque de dominio muy específico: no es un modelo generalista, sino un componente de un sistema mayor (EchoGo) para asistencia y enseñanza del Go. Se distribuye con pesos BF16 fusionados en Safetensors y tokenizer, cargable directamente con Transformers bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-32B) |
| Parametros totales | 32B (heredados del modelo base Qwen3-32B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuye en BF16) |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16 fusionado) + tokenizer |

## Arquitectura y entrenamiento
El modelo parte de Qwen3-32B, un transformer denso de 32 mil millones de parámetros. Sobre esta base se realiza un ajuste fino supervisado (SFT) orientado a la generación de explicaciones de Go. La model card indica que se seleccionó el checkpoint-1188 de la tercera ronda acumulada de entrenamiento. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación principal no reside en la arquitectura, sino en el diseño de la tarea: el modelo se condiciona a hechos estructurados extraídos por KataGo (diferencia de puntos, variantes, respuestas del oponente, ganancias de bloques y regiones) y debe producir una explicación con citas que referencian esos hechos. En la evaluación se desactiva el modo thinking y se usa decodificación greedy. El formato de entrada emplea X/O para las piedras, @ para la jugada real y A/B para puntos de referencia.

## Capacidades
- Generación de explicaciones de Go en chino con referencias factuales a hechos estructurados.
- Interpretación de posiciones de tablero representadas en notación X/O con marcadores @ y A/B.
- Integración de hechos analíticos (diferencia de puntos, variantes recomendadas, respuestas del oponente, ganancias de bloques y regiones).
- Generación de texto orientada a dominio, con soporte de plantilla de chat de Qwen3 (`apply_chat_template`).
- Modo thinking desactivable mediante `enable_thinking=False` (característica heredada de Qwen3).
- No se documentan capacidades de tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso
- Enseñanza de Go en aplicaciones móviles: el modelo genera explicaciones en chino a partir de la posición actual y el análisis de KataGo, adecuado como capa de narración para usuarios que estudian partidas.
- Comentario automático de partidas grabadas: dado un archivo de partida y el análisis por posición, produce textos explicativos con referencias a los hechos calculados.
- Asistente de revisión post-partida: presenta al jugador las variantes recomendadas y las ganancias o pérdidas de bloques y regiones con explicación en lenguaje natural.
- Componente profesor en pipelines de destilación: tal como se usa para EchoGo 4B OPD, puede servir de generador de datos de alta calidad para modelos más pequeños.
- Herramientas de análisis para clubes y academias: integrado en un backend que ejecuta KataGo y llama al modelo para producir informes en chino.
- Investigación en modelos de dominio: útil como caso de estudio de SFT sobre un LLM generalista para una tarea estructurada y verificable con citas.
- Aplicaciones educativas multijugador: generación de pistas y explicaciones paso a paso durante partidas en vivo, siempre que se le proporcionen los hechos analíticos actualizados.

## Benchmarks y rendimiento
La model card reporta una evaluación sobre 55 partidas reservadas y 503 posiciones, con el mismo tablero y hechos, verificada por GPT de forma anónima. La "tasa de error" es la proporción de posiciones cuya explicación contiene al menos una contradicción factual explícita; la "utilidad" es una puntuación proxy de 0 a 2 otorgada por GPT.

| Modelo | Posiciones con error explícito | Utilidad media |
|---|---:|---:|
| EchoGo 4B · OPD 192 | 31/503 (6,16 %) | 1,873 |
| EchoGo 32B · 1188 | 36/503 (7,16 %) | 1,885 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en BF16: aproximadamente 64 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 80 GB para contextos largos.
- GPU recomendadas: A100 80 GB, H100 80 GB, o múltiples GPU con `device_map="auto"`.
- En GPU de consumo: no cabe en BF16 en una RTX 4090 (24 GB); requeriría cuantización (no distribuida oficialmente en GGUF) o sharding en varias GPU.
- Opciones de despliegue: Transformers (documentado en la model card); vLLM, TGI, llama.cpp u Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EchoGo 32B | 32B (denso) | No disponible | Explicación de Go en chino | Apache 2.0 | Hugging Face |
| EchoGo 4B · OPD 192 | 4B (destilado) | No disponible | Explicación de Go en chino | No disponible | Referenciado en la model card |
| Qwen3-32B (base) | 32B (denso) | No disponible | Generalista multilingüe | Apache 2.0 | Hugging Face |

No se dispone de información sobre otros modelos especializados en explicación de Go para una comparativa más amplia.

## Limitaciones y advertencias
- El modelo comete errores ocasionales sobre el color de las piedras, el orden de las jugadas, la técnica o las ganancias de regiones, según reconoce la model card.
- Requiere hechos analíticos fiables: el despliegue debe proporcionar análisis de KataGo creíbles; sin ellos, la calidad de la explicación se degrada.
- Solo soporta chino; no se documentan otras lenguas.
- Riesgo de alucinación en detalles del tablero si los hechos de entrada son ambiguos o incompletos.
- La evaluación se realizó con GPT como juez anónimo y una métrica proxy de utilidad, no con evaluadores humanos expertos.
- El repositorio registra 0 descargas y 0 likes, lo que indica escasa validación por parte de la comunidad.
- Licencia Apache 2.0, pero se advierte que se han modificado los pesos de Qwen3-32B; conviene revisar el LICENSE del repositorio y el del modelo upstream.
- No se documentan cuantizaciones oficiales ni soporte en motores de inferencia distintos de Transformers.

## Enlaces
- [Hugging Face: Scarick2003buffalo/echogo_32b](https://huggingface.co/Scarick2003buffalo/echogo_32b)
- [Modelo base: Qwen/Qwen3-32B](https://huggingface.co/Qwen/Qwen3-32B)
