# Keendata/KeenSQL1.0

## Resumen

KeenSQL1.0 es un modelo de 9B parámetros especializado en text-to-SQL para bases de datos SQLite, desarrollado por Keendata. Se trata de un ajuste fino del modelo base Qwen3.5-9B, orientado a operar dentro de un bucle de agente que inspecciona el esquema, ejecuta consultas de sondeo y emite una sentencia SQL final. El modelo resuelve el problema de traducir preguntas en lenguaje natural a SQL sobre esquemas reales, un escenario donde los LLM genéricos suelen fallar por falta de conocimiento del esquema y de capacidad de verificación.

La arquitectura subyacente es Qwen3.5 con atención híbrida (lineal y completa), 32 capas, dimensión oculta 4096 y una ventana de contexto de 262.144 tokens. El entrenamiento parte de un checkpoint SFT (paso global 308) y aplica 40 pasos de reinforcement fine-tuning con GRPO y penalización KL contra la referencia, usando recompensas basadas en ejecución. El resultado es un modelo que mejora de forma modesta pero consistente la precisión de ejecución sobre el punto de partida SFT.

Es relevante ahora porque demuestra un patrón concreto de especialización mediante RL sobre un modelo abierto: en lugar de un modelo generalista, se obtiene un agente text-to-SQL con protocolo de herramientas definido y métricas de ejecución publicadas. La licencia Apache 2.0 y el tamaño de 9B lo hacen desplegable en infraestructura moderada, aunque con requisitos estrictos de formato de chat y bucle de agente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 híbrida (atención lineal y completa), `Qwen3_5ForConditionalGeneration`, 32 capas, hidden 4096, 16 cabezas Q / 4 KV, head_dim 256, mRoPE (partial 0.25) |
| Parametros totales | ~9B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (modelo); 25.680 tokens en el protocolo de agente |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (archivo único bf16, 760 tensores, ~17,5 GB) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-9B, un transformer con atención híbrida que combina capas de atención lineal y atención completa. La configuración incluye 32 capas, dimensión oculta de 4096, 16 cabezas de consulta y 4 cabezas KV con dimensión de cabeza 256, mRoPE con fracción parcial de 0.25 y un vocabulario de 248.320 tokens. El checkpoint conserva una torre de visión heredada de la arquitectura multimodal de Qwen3.5, pero no se utiliza: el modelo es solo texto en la práctica.

El entrenamiento parte de un checkpoint SFT obtenido tras ajuste fino de parámetros completos de Qwen3.5-9B (paso global 308). Sobre ese punto de partida se ejecutan 40 pasos de optimizador de reinforcement fine-tuning (RFT) con GRPO y una penalización KL contra el modelo de referencia, usando recompensas basadas en la ejecución correcta de las consultas. Cada paso procesa 128 grupos de preguntas con 8 rollouts cada uno, es decir, 1024 trayectorias por paso. El protocolo de agente empleado durante entrenamiento, rollout y evaluación usa una plantilla de chat modificada que emite una cabecera de asistente plana sin bloque `think`; el autor advierte que usar la plantilla estándar de Qwen produce un desajuste de formato y degrada sustancialmente la precisión.

## Capacidades

- Generación de sentencias SQL para SQLite a partir de preguntas en lenguaje natural y un esquema proporcionado.
- Bucle de agente multi-turno con hasta 8 llamadas a herramienta más una respuesta final.
- Uso de la herramienta `sqlite_query`, que ejecuta una única sentencia SQL y devuelve filas o un error.
- Inspección de esquema y consultas de sondeo para verificar hipótesis antes de emitir la respuesta final.
- Emisión de la respuesta final como bloque `sql` en lugar de una llamada a herramienta.
- Razonamiento multi-paso dentro del bucle de agente, con alternancia estricta de turnos (una llamada por turno, observación devuelta como mensaje de usuario envuelto en `<observation>`).
- Capacidad de autoconsistencia: la evaluación usa votación mayoritaria sobre k muestras.
- Idioma: inglés únicamente.
- No dispone de capacidades de visión, audio ni tool calling genérico más allá de la herramienta SQL definida.

## Casos de uso

- Asistente de consultas sobre bases de datos SQLite internas: el modelo recibe el esquema y la pregunta, ejecuta sondeos para validar columnas y valores, y devuelve una sentencia SQL ejecutable. Adecuado por su protocolo de agente específico para este flujo.
- Generación de SQL en herramientas de BI y analítica self-service: integrado en un backend que expone el esquema de la base de datos y valida la consulta antes de ejecutarla, permite a usuarios no técnicos formular preguntas en inglés y obtener SQL revisable.
- Automatización de tareas de exploración de datos: el bucle de inspección de esquema y consultas de sondeo resulta útil para descubrir la estructura de bases de datos desconocidas antes de generar la consulta final.
- Evaluación y benchmarking de pipelines text-to-SQL: sirve como referencia de un agente entrenado con RL sobre recompensas de ejecución, útil para comparar contra modelos generalistas en BIRD u otros conjuntos.
- Prototipado de agentes de datos en investigación: el modelo documenta un protocolo completo (turnos, límites de tokens, envoltorio de observaciones) que puede reproducirse para estudiar el efecto del RL en la fiabilidad por muestra.
- Generación asistida de consultas en entornos de desarrollo: con revisión humana obligatoria, puede acelerar la escritura de SQL sobre SQLite en flujos de trabajo internos donde el esquema es conocido y estable.
- Educación y formación en SQL: como generador de consultas de referencia sobre esquemas de ejemplo, siempre con validación posterior por parte del usuario.

## Benchmarks y rendimiento

Evaluación en BIRD dev (1.534 preguntas) con autoconsistencia, temperatura 0.7 y máximo 8 llamadas a herramienta:

| Checkpoint | sc_ex (k=8) | pass@8 | protocol rate |
|---|---|---|---|
| Punto de partida SFT | 0,6904 | 0,8044 | 0,8918 |
| RFT paso 15 | 0,7021 | 0,7679 | 0,9922 |
| RFT paso 25 | 0,7014 | 0,7868 | 0,9335 |
| KeenSQL1.0 (RFT paso 40) | 0,7034 | 0,8025 | 0,9654 |

Desglose por dificultad en BIRD dev (sc@8):

| Dificultad | Preguntas | Punto de partida SFT | KeenSQL1.0 | Delta |
|---|---|---|---|---|
| simple | 925 | 0,7524 | 0,7557 | +0,33 |
| moderate | 464 | 0,5991 | 0,6293 | +3,02 |
| challenging | 145 | 0,5862 | 0,6069 | +2,07 |

Split interno reservado (320 preguntas, n=2, temperatura 0.7): la precisión de ejecución ponderada pasó de 0,6609 en el punto de partida SFT a un máximo de 0,7063 en el paso 16 y a 0,6672 en el paso 40. El autor señala que la mejora sobre BIRD dev es de aproximadamente +1,3 puntos de sc_ex respecto al punto de partida SFT, con mayor ganancia en preguntas de dificultad challenging.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 17,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB para el modelo en bf16 con contexto moderado.
- Cuantización: no se publican pesos cuantizados; sería necesario generarlos (por ejemplo, GGUF o GPTQ) a partir del safetensors bf16.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 con contexto limitado. Para contexto largo cercano a los 25.680 tokens del protocolo, se recomienda A100/H100 por la memoria de caché KV.
- En GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 si se limita el contexto; en GPUs de 16 GB requeriría cuantización a 8 bits o inferior, no publicada.
- Opciones de despliegue: transformers (librería indicada por el autor), con soporte de `trust_remote_code` para la plantilla de chat personalizada. vLLM, TGI o llama.cpp no están documentados para este checkpoint; requerirían verificar compatibilidad con la arquitectura Qwen3.5 y con la plantilla modificada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KeenSQL1.0 | ~9B | 262.144 (25.680 en protocolo de agente) | Agente text-to-SQL SQLite con RL | Apache 2.0 | Hugging Face |
| Qwen3.5-9B (base) | ~9B | 262.144 | LLM generalista | no disponible en la información | Hugging Face |
| Alternativas text-to-SQL especializadas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Solo SQLite: entrenado y evaluado exclusivamente sobre bases de datos SQLite; otros dialectos no están probados.
- El esquema debe proporcionarse en el prompt; el modelo no se conecta a una base de datos por sí mismo.
- Requiere el bucle de agente y el presupuesto de turnos: cargado como modelo de chat plano sin el protocolo de herramienta, la calidad cae drásticamente.
- La plantilla de chat es modificada y debe usarse la del repositorio; la plantilla estándar de Qwen provoca desajuste de formato y degradación sustancial de la precisión.
- Los pasos finales del entrenamiento quedaron diluidos: desde el paso 30, entre el 60 % y el 75 % de cada lote era padding por falta de preguntas con señal de aprendizaje; los pasos 31-40 aportaron poco y el paso 40 se conservó por obtener la mejor puntuación entre los checkpoints evaluados, no por ser claramente mejor que el paso 25.
- No está ajustado en seguridad más allá de lo que aportara el modelo SFT base; no hay garantía contra la generación de SQL destructivo. Nunca debe ejecutarse su salida contra una base de datos de producción sin revisión.
- Riesgo de alucinación en nombres de columnas, tablas o valores no presentes en el esquema; el bucle de sondeo mitiga pero no elimina este riesgo.
- Idioma limitado al inglés.
- La mejora sobre el punto de partida SFT es modesta (+1,3 puntos de sc_ex en BIRD dev) y pass@k prácticamente no cambia; el RL mejoró la fiabilidad por muestra, no el techo de capacidad.
- La diversidad de salida aumentó durante el entrenamiento, por lo que la tasa de protocolo y el consenso por votación mayoritaria requieren el ajuste de 8 muestras para ser útiles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Keendata/KeenSQL1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Benchmark BIRD: no se proporciona enlace en la información disponible
- Paper o blog del autor: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
