# DecentVLA/droidfull8_pi05_accord_cotrain_drift_expert

## Resumen

droidfull8 π0.5 ACCORD-C drift expert es un checkpoint de robótica basado en π0.5, el modelo vision-language-action (VLA) de Physical Intelligence implementado en JAX dentro del ecosistema openpi. Lo publica DecentVLA, un proyecto centrado en aprendizaje federado para políticas robóticas, y constituye una variante experimental de un entrenamiento federado sobre el conjunto de datos DROID dividido en ocho clientes simulados ("building clients").

El modelo parte de `pi05_base` y aplica un fine-tune completo de 400 rondas con 250 pasos locales por ronda y batch de 32 por cliente, con EMA de 0.99 y acciones en chunks de 16 pasos en espacio de posiciones articulares. La innovación respecto a la variante FedAvg es un término adicional de entrenamiento "bank" que cada cliente calcula sobre las acciones liberadas por los otros siete sitios (instrucción y propriocepción, sin imágenes), cuyo gradiente afecta únicamente al action expert de π0.5.

La diferencia clave de esta versión es que el peso de ese término no es fijo (0,1 en la variante anterior), sino que se calcula por ronda mediante una regla de "drift": cada cliente mide cuánto ha movido su propio entrenamiento las acciones muestreadas respecto al ruido de muestreo de la política y usa `w = clip(δ/floor − 1, 0, 1)` como peso de la siguiente ronda. Es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, orientado a reproducibilidad de experimentos federados y a evaluación en RoboLab o en un robot DROID real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0.5 (openpi, JAX): VLA transformer con action expert, acciones en chunks de 16 pasos (posiciones articulares) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en formato nativo openpi/JAX) |
| Idiomas soportados | no disponible (las instrucciones de DROID están en inglés, pero la model card no lo declara) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint openpi (`openpi/params/` con pesos EMA y `assets/droid/norm_stats.json`); checkpoint decent-vla `server_round_0400.pt` |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de π0.5 en su implementación oficial openpi sobre JAX, partiendo de `pi05_base`. La política genera acciones en chunks de 16 pasos en espacio de posiciones articulares a partir de instrucción, imágenes y propriocepción, con un action expert diferenciado dentro de la arquitectura VLA. El entrenamiento se organiza en 400 rondas federadas, cada una con 250 pasos locales y batch de 32 por cliente, sobre DROID dividido en 8 clientes ("building clients"), con media móvil exponencial de 0,99.

La contribución técnica es el esquema ACCORD-C con compuerta por drift. En cada paso local, además de su propio dato, cada cliente entrena con 16 ventanas de acciones liberadas por los otros siete sitios (instrucción y proprio, sin imágenes), y ese gradiente se restringe al action expert mediante `grad_scope`. El peso del término se recalcula cada ronda: el cliente mide cuánto ha desplazado una ronda de su propio entrenamiento sus acciones muestreadas más allá del ruido de muestreo de la política y aplica `w = clip(δ/floor − 1, 0, 1)` (con tope 1) en la ronda siguiente; una ronda con `w = 0` desactiva por completo el banco. El repositorio incluye los ficheros `accord_cotrain_c*.jsonl` con el drift medido y el peso usado por cliente y ronda, lo que permite auditar la dinámica del esquema.

## Capacidades

- Control robótico por imitación: genera trayectorias de acciones en chunks de 16 pasos en posiciones articulares a partir de instrucciones en lenguaje natural, observaciones visuales y propriocepción.
- Ejecución de tareas de manipulación del benchmark DROID, el conjunto de demostraciones robóticas a gran escala sobre el que se entrena.
- Aprendizaje federado con agregación tipo ACCORD-C y término de co-entrenamiento entre sitios, con gradiente limitado al action expert.
- Compuerta adaptativa por drift del peso del banco de acciones, con registro por ronda y cliente.
- Servido mediante el servidor de políticas de openpi (`scripts/serve_policy.py`) con la configuración `pi05_droid_jointpos`.
- Evaluación en RoboLab (fork `xuningy/openpi`) o en un robot DROID físico.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo thinking; es un modelo específico de robótica.

## Casos de uso

- Reproducción de experimentos federados: el checkpoint `server_round_0400.pt` y los JSONL de drift permiten replicar y analizar la dinámica de ACCORD-C con compuerta por drift frente a FedAvg y a la variante de peso fijo 0,1.
- Evaluación en RoboLab: sirviendo el checkpoint con el fork de openpi indicado en la model card y lanzando las tareas del benchmark, se puede comparar el rendimiento de esta variante contra los otros brazos del mismo estudio.
- Despliegue en robot DROID real: el checkpoint openpi incluye `norm_stats.json` de DROID, por lo que puede servirse directamente para ejecutar políticas de manipulación en la plataforma DROID.
- Estudio de co-entrenamiento entre sitios sin compartir imágenes: el esquema entrena con acciones e instrucciones de otros clientes sin exponer observaciones visuales, un escenario relevante para privacidad en flotas de robots.
- Investigación sobre estabilidad del entrenamiento federado: los ficheros de drift por cliente y ronda permiten estudiar cuándo el banco se desactiva (`w = 0`) y cómo afecta a la convergencia.
- Base para nuevas variantes: al ser un fine-tune completo desde `pi05_base` con receta documentada, sirve como punto de partida para probar otros schedules de peso o alcances de gradiente.
- Análisis de sensibilidad al ruido de muestreo: la regla `w = clip(δ/floor − 1, 0, 1)` puede evaluarse empíricamente con los registros publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito en tareas de DROID ni comparaciones numéricas con FedAvg, la variante de peso fijo 0,1 o el entrenamiento centralizado; solo describe la receta y los artefactos de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamaño de π0.5, que la model card no declara.
- GPU recomendadas: no disponible en la información proporcionada; openpi/JAX admite aceleradores NVIDIA, y la model card usa `XLA_PYTHON_CLIENT_MEM_FRACTION=0.5` en el ejemplo de servido, lo que sugiere reservar al menos la mitad de la memoria del dispositivo.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: servidor oficial de openpi (`scripts/serve_policy.py --policy.config=pi05_droid_jointpos`), fork `xuningy/openpi` para RoboLab; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Esquema federado | Peso del banco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| droidfull8 π0.5 ACCORD-C drift expert (este) | π0.5 openpi, fine-tune completo | ACCORD-C, 8 clientes, 400 rondas | Adaptativo por drift, `w = clip(δ/floor − 1, 0, 1)`, tope 1 | Apache 2.0 | Hugging Face (0 descargas) |
| droidfull8 π0.5 FedAvg | π0.5 openpi, fine-tune completo | FedAvg, 8 clientes | Sin banco | Apache 2.0 | Hugging Face |
| droidfull8 π0.5 ACCORD-C w0.1 expert | π0.5 openpi, fine-tune completo | ACCORD-C, 8 clientes | Fijo 0,1 | Apache 2.0 | Hugging Face |
| droidfull8 π0.5 cent | π0.5 openpi, fine-tune completo | Entrenamiento centralizado (control) | No aplica | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: 0 descargas y 0 likes en el momento de la consulta, sin validación externa documentada.
- Sin benchmarks publicados: no hay evidencia numérica de que la compuerta por drift mejore a FedAvg, al peso fijo 0,1 o al entrenamiento centralizado.
- Dominio restringido: entrenado sobre DROID para manipulación robótica; no es un modelo de propósito general y no se documentan capacidades de texto, código o matemáticas.
- Idiomas no declarados: la model card no especifica cobertura lingüística de las instrucciones.
- Riesgo de alucinación y sesgos: no documentados por el autor; en políticas de imitación el fallo se manifiesta como acciones fuera de distribución, no como texto incorrecto.
- Los ficheros llegan como pull request del run de entrenamiento según la model card; hasta su fusión, la disponibilidad de los artefactos puede ser parcial (véase la sección de pull requests del repositorio).
- Licencia Apache 2.0 permite uso comercial, pero el modelo hereda las condiciones de π0.5 y openpi; conviene revisar la licencia del modelo base y de DROID antes de un despliegue en producción.
- El servido requiere el fork de openpi indicado para RoboLab; no se garantiza compatibilidad con otras integraciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DecentVLA/droidfull8_pi05_accord_cotrain_drift_expert
- Variante FedAvg: https://huggingface.co/DecentVLA/droidfull8_pi05_fedavg
- Variante ACCORD-C w0.1 expert: https://huggingface.co/DecentVLA/droidfull8_pi05_accord_cotrain_w010_expert
- Control centralizado: https://huggingface.co/DecentVLA/droidfull8_pi05_cent
- Fork de openpi para RoboLab: https://github.com/xuningy/openpi
- Runbook de RoboLab (políticas pi0_family): https://github.com/NVLabs/RoboLab (ruta `policies/pi0_family/README.md`)
- Runbook y código decent-vla: `examples/droid/README_droidfull8.md`, paso 8, tag `droidfull8-v5` (repositorio decent-vla; URL exacta no disponible en la información proporcionada)
