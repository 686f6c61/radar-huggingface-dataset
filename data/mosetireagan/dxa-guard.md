# mosetireagan/dxa-guard

## Resumen

DXA-Guard es un clasificador tabular de intrusiones basado en un ensamble de árboles de decisión con boosting de gradiente (GBDT), implementado con `scikit-learn.ensemble.GradientBoostingClassifier`. Lo desarrolla Reagan Moseti (organización Deployxa) como componente del agente open source DXA-Guard, orientado a servidores VPS Linux que ejecutan aplicaciones web. El modelo evalúa ventanas deslizantes de 5 minutos de actividad de host y red por cada IP origen para estimar la probabilidad de comportamiento malicioso: fuerza bruta SSH, escaneo de vulnerabilidades web, payloads de explotación y actividad post-compromiso.

A diferencia de los LLM, no es un modelo generativo ni un transformer: es un clasificador supervisado de 8 características tabulares, con 30 árboles de profundidad máxima 3 y tasa de aprendizaje 0.1. Su relevancia radica en el diseño de despliegue dual: se exporta como `model.joblib` para flujos en Python y como `model.json` para inferencia nativa en Go sin dependencias de Python, lo que permite latencias inferiores a 1 ms en el daemon de producción.

El modelo actúa estrictamente como puntuador de riesgo consultivo. En la arquitectura DXA-Guard, las reglas deterministas son las únicas autorizadas a ejecutar acciones de bloqueo con nftables; el modelo solo eleva o reduce la urgencia de las alertas y nunca aplica bloqueos ni mata procesos por sí mismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamble de árboles de decisión con boosting de gradiente (`GradientBoostingClassifier`) |
| Parametros totales | 30 árboles, profundidad máxima 3 (no se especifica el número exacto de nodos ni de hojas) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; entrada fija de 8 características por ventana deslizante de 5 minutos |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (inglés; el modelo no procesa texto, solo features numéricas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.joblib` (scikit-learn serializado) y `model.json` (representación portable de árboles) |

## Arquitectura y entrenamiento

El modelo es un GBDT con 30 estimadores, profundidad máxima 3 y tasa de aprendizaje 0.1, entrenado sobre un conjunto de datos tabular de telemetría de seguridad. La entrada es un vector de 8 dimensiones calculado sobre una ventana deslizante de 5 minutos por IP origen: `window_event_count`, `failure_ratio`, `distinct_paths`, `distinct_users`, `path_entropy` (entropía de Shannon de los paths URL), `inter_event_time_mean_ms`, `hour_of_day_norm` y `sensitive_path_ratio`. Esta selección de features está pensada para capturar patrones de automatización (bursts rápidos), reconocimiento (entropía alta en paths, muchas rutas distintas) y sondeo de ficheros sensibles (`.env`, `wp-config`, `.git`, webshells).

La innovación técnica principal no está en el algoritmo sino en el artefacto de despliegue: la exportación completa a `model.json` permite al daemon en Go evaluar los umbrales y pesos de las hojas de forma nativa, sin intérprete de Python. La inferencia se reduce a calcular `logit = init_bias + Σ(learning_rate × LeafValue_t)` para los 30 árboles y aplicar una sigmoide. No se especifican en la información disponible el número de tokens, la composición del dataset de entrenamiento ni si hubo calibración posterior.

## Capacidades

- Clasificación binaria de riesgo de ataque por IP origen a partir de 8 features tabulares.
- Detección de fuerza bruta SSH mediante `distinct_users` y `failure_ratio`.
- Detección de escáneres de vulnerabilidades web mediante `path_entropy` y `distinct_paths`.
- Detección de sondeo de ficheros sensibles mediante `sensitive_path_ratio`.
- Detección de comportamiento post-compromiso y payloads de explotación.
- Perfilado temporal mediante `hour_of_day_norm`.
- Inferencia nativa en Go con latencia inferior a 1 ms y sin runtime de Python.
- Exportación dual para integración en pipelines Python y en daemons compilados.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Protección de servidores VPS Linux: el agente DXA-Guard calcula las 8 features por IP cada 5 minutos y usa la probabilidad del modelo para priorizar alertas de fuerza bruta SSH antes de que las reglas deterministas apliquen el bloqueo con nftables.
- Detección de escáneres web en producción: la combinación de `path_entropy` alta y `distinct_paths` elevado permite marcar IPs que ejecutan herramientas tipo Nikto o Gobuster y elevar la urgencia de la alerta al operador.
- Monitorización de intentos de acceso a ficheros sensibles: `sensitive_path_ratio` detecta sondeos de `.env`, `.git` o `wp-config` y permite al equipo de seguridad revisar si el servidor expone rutas que no debería.
- Screening en el edge con latencia mínima: al compilarse en Go y evaluarse en menos de 1 ms, el modelo puede puntuar cada evento en tiempo real sin añadir carga perceptible al servidor.
- Enriquecimiento de alertas en un SIEM: la probabilidad de ataque se puede enviar como campo adicional a Splunk, Elastic o Wazuh para ordenar la cola de triaje por riesgo en lugar de por severidad estática.
- Detección de picos de autenticación anómalos: `inter_event_time_mean_ms` bajo combinado con `failure_ratio` alto identifica bots de credential stuffing y permite activar rate limiting antes de que la regla de bloqueo se dispare.
- Despliegue en entornos sin Python: servidores minimalistas o contenedores distroless donde no se quiere instalar scikit-learn pueden usar `model.json` con el scorer nativo de Go.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test del benchmark de DXA-Guard (`benchmark/dataset/test.jsonl`):

| Modelo / baseline | Precision | Recall | F1 |
|---|:---:|:---:|:---:|
| DXA-Guard GBDT (este modelo) | 1.000 | 0.833 | 0.909 |
| Isolation Forest (baseline de anomalías) | 0.941 | 1.000 | 0.970 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un clasificador tabular de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo es un GBDT de 30 árboles y se ejecuta en CPU.
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier CPU consumer o de servidor; el artefacto `model.json` es de tamaño reducido (repo de 0.0 GB según Hugging Face).
- Opciones de despliegue: scikit-learn con `joblib` en Python, o scorer nativo en Go a partir de `model.json` sin dependencias.
- Latencia: inferior a 1 ms en inferencia nativa en Go según la model card. No se especifica throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Latencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DXA-Guard GBDT | GBDT supervisado (30 árboles) | 8 features tabulares | < 1 ms (Go nativo) | Apache 2.0 | Hugging Face + GitHub |
| Isolation Forest (baseline del propio benchmark) | Detección de anomalías no supervisada | Features tabulares | No disponible | No disponible | No disponible |
| DXA-Guard Neural Threat Engine | Clasificador neuronal de telemetría | Telemetría de seguridad | No disponible | No disponible | Hugging Face (mosetireagan) |
| DXA-Guard Tier-2 (DeepSeek-R1 1.5B GGUF) | LLM de razonamiento causal | Texto | No disponible | No disponible | Hugging Face (mosetireagan) |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, salvo el baseline de Isolation Forest incluido en la propia model card.

## Limitaciones y advertencias

- El modelo solo consume 8 features numéricas; no procesa texto, logs crudos ni tráfico de red en bruto, por lo que requiere un pipeline de extracción de features previo.
- El recall de 0.833 implica que aproximadamente un 17 % de los ataques del conjunto de test no se detectan; el baseline de Isolation Forest obtiene mejor recall (1.000) y mejor F1 (0.970) en el mismo benchmark.
- El modelo nunca debe usarse como único mecanismo de bloqueo: la arquitectura DXA-Guard lo define como puntuador consultivo y las reglas deterministas son las autorizadas a aplicar bans.
- Entrenado y evaluado sobre un benchmark propio de tamaño no especificado; no hay validación independiente publicada, lo que limita la confianza en la generalización a otros entornos.
- Solo declara soporte de inglés en los metadatos, aunque al ser un modelo numérico el idioma es irrelevante para la inferencia.
- Riesgo de deriva de concepto: los patrones de ataque evolucionan y el modelo no se reentrena automáticamente; requiere revisión periódica.
- Riesgo de falsos positivos en picos legítimos de tráfico (por ejemplo, campañas de marketing o tests de carga) que disparen `failure_ratio` o `distinct_paths`.
- Licencia Apache 2.0 permite uso comercial, pero el ecosistema DXA-Guard depende del agente en Go del repositorio de GitHub, cuya licencia y madurez conviene verificar por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mosetireagan/dxa-guard
- Repositorio del agente en GitHub: https://github.com/dxa-guard/dxa-guard
- Tier-2 Cognitive Cortex (DeepSeek-R1 1.5B GGUF): https://huggingface.co/mosetireagan/dxa-guard-deepseek-r1-1.5b-gguf
- Neural Threat Engine: https://huggingface.co/mosetireagan/dxa-guard-neural-threat-engine
- Dataset de razonamiento SFT (9.288 muestras): https://huggingface.co/datasets/mosetireagan/dxa-guard-reasoning-sft
- Perfil del autor: https://huggingface.co/mosetireagan
- Organización Deployxa: https://huggingface.co/deployxa
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Documentación de scikit-learn: https://scikit-learn.org/
