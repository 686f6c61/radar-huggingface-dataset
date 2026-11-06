# Rongxuan-Zhou/v2d-track2-archive

## Resumen

v2d-track2-archive no es un modelo de lenguaje, sino un repositorio de checkpoints de entrenamiento publicado por Rongxuan-Zhou como archivo del NVIDIA V2D Challenge Track 2. Contiene los estados de entrenamiento (`state_<step>.safetensors`) y los parametros de red de politica (`policy_<step>.safetensors`) generados durante el entrenamiento con FlashCHORD y FlashSAC sobre el entorno G1 + Dex3. El repositorio se creo para liberar espacio en disco de la maquina de entrenamiento (host `mf4090`), no como artefacto distribuible para inferencia general.

El contenido se organiza en cinco lotes archivados entre el 1 y el 12 de octubre de 2026, con un total de 27,5 GB y alrededor de 2.000 ficheros safetensors. Cada fichero corresponde a un paso de entrenamiento concreto y los checkpoints de politica se guardan aproximadamente cada 10 millones de pasos. Los estados permiten reanudar entrenamientos interrumpidos, mientras que las politicas sirven para exportacion y evaluacion en el marco del challenge.

Su relevancia es acotada: resulta util unicamente para participantes o investigadores que reproduzcan los experimentos del V2D Challenge Track 2 y necesiten reanudar runs o inspeccionar la evolucion de las politicas. No es un modelo conversacional ni tiene capacidades de generacion de texto, codigo o vision en el sentido habitual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (checkpoints de politica de aprendizaje por refuerzo; el autor no detalla la red) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (ficheros en safetensors, sin variantes GGUF ni cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible en la model card; los datos del challenge se comparten bajo CC BY 4.0 segun el autor |
| Formato de pesos | safetensors (`state_<step>.safetensors` y `policy_<step>.safetensors`) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura de la red de politica. Por los nombres de los runs (`flash_chord`) y la descripcion del autor, el entrenamiento emplea FlashCHORD junto con FlashSAC, un algoritmo de aprendizaje por refuerzo off-policy tipo SAC con componentes de Flash. El entorno corresponde a G1 + Dex3, es decir, el robot humanoide Unitree G1 con la mano diestra Dex3, dentro del NVIDIA V2D Challenge Track 2.

Los runs se identifican por tier (`t1`, `t2`, `t3`), episodio (`ep18`), numero de mundos paralelos (`w2048`), limite del replay buffer (`cap4m`) y host de entrenamiento (`mf4090`). El entrenamiento guarda una politica aproximadamente cada 10 millones de pasos, con checkpoints intermedios en el rango de pasos 10.000.384 a 260.009.984 y politicas finales hasta el paso 349.999.104. Los estados (`state`) permiten reanudar un run emparejandolos con la politica del mismo paso. No se especifican en la informacion disponible el numero de tokens, la composicion del dataset ni el uso de RLHF o DPO, que no aplican a este tipo de entrenamiento.

## Capacidades

- Almacenamiento y reanudacion de entrenamientos de aprendizaje por refuerzo: los ficheros `state_<step>.safetensors` permiten retomar un run desde el paso exacto en que se archivo.
- Exportacion y evaluacion de politicas: los ficheros `policy_<step>.safetensors` contienen los parametros de la red de politica para su despliegue en el simulador del challenge.
- Inspeccion de la evolucion del entrenamiento: al conservar checkpoints cada 10 millones de pasos, permite analizar curvas de aprendizaje y estabilidad.
- Reproducibilidad de experimentos del V2D Challenge Track 2 sobre el entorno G1 + Dex3.
- No ofrece generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Reanudacion de entrenamientos interrumpidos: un investigador que entrene con FlashSAC sobre G1 + Dex3 puede descargar el `state` y la `policy` del mismo paso y continuar el run sin perder progreso.
- Evaluacion comparativa de checkpoints: los 26 checkpoints intermedios por run permiten medir la evolucion del rendimiento de la politica a lo largo del entrenamiento en el simulador del challenge.
- Reproduccion de resultados del challenge: los equipos pueden replicar los runs archivados (tiers t1, t2 y t3) para verificar los resultados reportados.
- Analisis de estabilidad del entrenamiento: la disponibilidad de estados y politicas en multiples pasos facilita estudiar divergencias, colapsos o mejoras abruptas.
- Recuperacion tras fallo de hardware: si la maquina de entrenamiento pierde los ficheros locales, el repositorio actua como copia de seguridad remota con verificacion por SHA-256 en `ARCHIVED.json`.
- Estudio de configuraciones de paralelismo: los nombres de run codifican el numero de mundos paralelos (`w2048`) y el tamano del replay buffer (`cap4m`), lo que permite comparar configuraciones.
- Base para experimentos de sim-to-real: las politicas exportadas pueden servir como punto de partida para transferencia a un robot G1 fisico, aunque el autor no documenta resultados en hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el tamano de la red de politica.
- GPU recomendadas: no disponible. El entrenamiento se realizo en el host `mf4090`, lo que sugiere el uso de GPUs de la familia RTX 4090, pero el autor no lo confirma.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: los ficheros son safetensors estandar; el autor no documenta un pipeline de inferencia. La restauracion se realiza con `tools/hf_remote.sh` del repositorio de codigo y `hf download`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada repositorios comparables de checkpoints del V2D Challenge Track 2 ni alternativas equivalentes de archivo de entrenamiento.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo: no puede usarse para texto, codigo, vision ni tareas conversacionales.
- La model card no especifica la licencia del repositorio; solo indica que los datos del challenge se comparten bajo CC BY 4.0. Verificar la licencia antes de cualquier uso comercial.
- El repositorio es un archivo de conveniencia para liberar disco, no un artefacto mantenido ni versionado con garantias de soporte.
- Los runs de los lotes 2, 3 y 4 conservan en el host de entrenamiento las 9 politicas mas recientes (pasos 270.010.368 a 349.999.104), que no estan archivadas; la exportacion final puede requerir acceso a ese host.
- Algunos runs tienen estados eliminados (`STATE_PRUNED`) y no pueden reanudarse desde el repositorio.
- El host de entrenamiento no conecta directamente con huggingface.co y requiere proxy; la descarga desde otros entornos debe verificar que `HF_ENDPOINT` apunte a https://huggingface.co.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.
- Riesgo de sesgo y alucinacion: no aplica en el sentido de modelos de lenguaje, pero las politicas pueden presentar sesgos de simulacion y fallos de generalizacion fuera del entorno G1 + Dex3 del challenge.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Rongxuan-Zhou/v2d-track2-archive
- NVIDIA V2D Challenge: no disponible en la informacion proporcionada
- Repositorio de codigo con `tools/hf_remote.sh` y registros de experimentos: no disponible en la informacion proporcionada
- Paper de FlashSAC o FlashCHORD: no disponible en la informacion proporcionada
