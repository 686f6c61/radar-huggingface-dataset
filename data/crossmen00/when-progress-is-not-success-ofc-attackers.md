# crossmen00/when-progress-is-not-success-ofc-attackers

## Resumen

Los checkpoints OFC (siglas del método de entrenamiento empleado por los autores) son artefactos de investigación liberados de forma anónima bajo revisión doble ciego para el artículo "When Progress Is Not Success in Multi-Turn LLM Agent Red-Teaming". No se trata de un modelo de propósito general, sino de pesos de un atacante entrenado específicamente para poner a prueba la robustez de agentes LLM con acceso a herramientas en entornos de múltiples turnos. El modelo parte de `Qwen/Qwen3.5-4B` (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) y se ha afinado con entrenamiento de parámetros completos, no mediante adaptadores.

La relevancia de esta publicación es metodológica: el artículo investiga la discrepancia entre métricas de progreso (por ejemplo, la tasa de éxito aparente durante el entrenamiento) y el éxito real de un ataque, un fenómeno que los autores denominan "when progress is not success". Los checkpoints liberados corresponden a dos de las ocho semillas del re-run del método OFC, elegidas por representatividad: la semilla 5 es la más cercana a la media de las ocho (48,8 % de ASR en la iteración 16) y la semilla 3 es la más alta.

El modelo no está pensado para uso en producción ni para tareas generales de generación. Su utilidad se limita a la reproducción de los resultados del artículo en su entorno de benchmark y a la evaluación de seguridad de agentes con herramientas. En el momento de redactar esta ficha las descargas y los "likes" son cero, y la model card advierte de que los ficheros de pesos se añaden por separado: una carpeta solo está completa cuando aparece `model.safetensors` con el checksum indicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-4B); detalles internos no disponibles |
| Parametros totales | Aproximadamente 4 200 millones (derivado del tamano del fichero: 8 411 558 400 bytes en bf16) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos liberados están en bf16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible explícitamente; se aplican los términos de la licencia de Qwen/Qwen3.5-4B |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json`, `generation_config.json`, `run_meta.json` y `progress.jsonl` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer decoder-only de Qwen3.5-4B. El entrenamiento se realizó con parámetros completos en bf16 sobre la revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` del modelo base, usando el tokenizador original (que no se almacena en el repositorio). El método OFC consiste en entropía cruzada sobre cada respuesta del atacante en las trayectorias que superaron el verificador estricto, sin término KL. La configuración del run incluye una tasa de aprendizaje de 2e-6, 6 rollouts por objetivo, un máximo de 5 turnos del atacante, 16 iteraciones y 24 objetivos de entrenamiento repartidos en dominios de banca, viajes y espacio de trabajo.

La víctima es `Qwen/Qwen3.5-9B` congelado en bf16, servido localmente; sus ajustes de servicio se registran en `run_meta.json` bajo la clave `victim`. Cada carpeta contiene el registro de entrenamiento (`progress.jsonl`) con las lecturas de las iteraciones 8 y 16 sobre 288 episodios held-out y 96 episodios de Slack, con 12 rollouts por objetivo. El autor advierte de que la ruta de carga estándar mostrada en la model card no se ha probado sobre la copia liberada.

## Capacidades

- Generación de texto orientada a la interacción multi-turno con agentes que usan herramientas.
- Construcción de trayectorias de ataque en entornos de banca, viajes y espacio de trabajo.
- Adaptación al comportamiento de un agente víctima concreto (Qwen3.5-9B) mediante entrenamiento contra él.
- No se documentan capacidades de visión, audio, tool calling propio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles.
- No es un modelo de propósito general: sus capacidades están acotadas al escenario de red-teaming del artículo.

## Casos de uso

- Reproducción de los resultados del artículo: cargar `s5_sft` o `s3_sft` y ejecutar la evaluación sobre los 288 episodios held-out y los 96 de Slack para verificar las tasas de ASR reportadas (49,3 % y 56,9 % en la iteración 16, respectivamente).
- Auditoría de robustez de agentes con herramientas: usar el atacante para generar trayectorias adversarias contra un agente víctima desplegado en un entorno de pruebas con datos designados.
- Investigación sobre métricas de progreso frente a éxito real: comparar las curvas de `progress.jsonl` con el ASR final para estudiar el fenómeno que da título al artículo.
- Estudio de sensibilidad a la semilla: contrastar las dos semillas liberadas (la media y la más alta de las ocho) para analizar la varianza del método OFC.
- Desarrollo de defensas: emplear las trayectorias generadas como conjunto de datos adversario para entrenar filtros o verificadores en agentes de producción.
- Docencia y formación en seguridad de LLM: ilustrar en un entorno controlado cómo un atacante afinado puede superar verificadores estrictos en conversaciones de varios turnos.

## Benchmarks y rendimiento

Los únicos datos publicados son las tasas de éxito del ataque (ASR) del propio artículo, no benchmarks estándar de capacidad.

| Checkpoint | Semilla | ASR held-out iter. 8 | ASR held-out iter. 16 | ASR Slack iter. 16 |
|---|---|---|---|---|
| `s5_sft` | 5 | 37,2 % | 49,3 % | 29,2 % |
| `s3_sft` | 3 | 53,8 % | 56,9 % | 27,1 % |
| Media de las ocho semillas (iter. 16) | — | — | 48,8 % | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 8,5 GB solo para los pesos, más memoria para el contexto y el runtime; con cuantización a 8 bits bajaría a unos 4,3 GB y a 4 bits a unos 2,2 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: A100, H100 o L40S para experimentos con lotes grandes; una RTX 4090 (24 GB) es suficiente para inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más en bf16 y en tarjetas de 8 GB con cuantización a 8 bits.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (ruta documentada por el autor); vLLM, llama.cpp u Ollama no están documentados para este checkpoint y requerirían conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (OFC attacker) | ~4,2 B | No disponible | Red-teaming de agentes | La de Qwen3.5-4B | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (base) | ~4,2 B | No disponible | Generación general | La del modelo base | Hugging Face |
| Qwen/Qwen3.5-9B (víctima) | ~9 B | No disponible | Agente víctima del benchmark | La del modelo base | Hugging Face |
| Outcome-only RL y dense reward (mismo artículo) | ~4,2 B | No disponible | Red-teaming de agentes | No especificada | No liberados |

No se dispone de datos de rendimiento comparables entre estos modelos en benchmarks estándar; la única comparación posible es la del ASR dentro del propio artículo.

## Limitaciones y advertencias

- Los pesos se publican por separado: verificar el checksum sha256 antes de usar cualquier carpeta, ya que una carpeta sin `model.safetensors` con el hash correcto está incompleta.
- La ruta de carga de la model card no ha sido probada por los autores sobre la copia liberada.
- El modelo está entrenado contra una víctima concreta (Qwen3.5-9B) y en dominios concretos (banca, viajes, espacio de trabajo); su transferencia a otros agentes o dominios no está documentada.
- Solo se liberan dos de las ocho semillas; las otras seis y los métodos alternativos (outcome-only RL y dense reward) no están disponibles.
- Uso restringido a evaluación de seguridad y reproducción en entornos de benchmark con datos de prueba designados; no debe emplearse contra sistemas reales sin autorización.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible.
- Licencia: no se declara una licencia propia; se aplican los términos de Qwen/Qwen3.5-4B, que deben consultarse antes de cualquier uso comercial.
- Publicación anónima bajo revisión doble ciego: el repositorio y los metadatos pueden cambiar tras la revisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/crossmen00/when-progress-is-not-success-ofc-attackers
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio anonimizado del artículo: https://anonymous.4open.science/r/when-progress-is-not-success-0F02
