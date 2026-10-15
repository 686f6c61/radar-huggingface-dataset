# DecentVLA/droid8_pi05_fedavg

## Resumen

droid8_pi05_fedavg es un checkpoint de politica robotica de vision-lenguaje-accion (VLA) publicado por DecentVLA en HuggingFace. Se trata de un fine-tune completo del modelo base `pi05_base` de openpi (la implementacion en JAX de π0.5), entrenado con la receta de posiciones articulares de DROID (`train_config: pi05_droid_jointpos`). La diferencia clave respecto a un fine-tune convencional es que el entrenamiento se realizo de forma federada: 8 clientes, uno por cada edificio del dataset DROID, agregados mediante FedAvg durante 50 rondas de 250 pasos locales cada una y batch de 32.

El objetivo del proyecto es estudiar el aprendizaje federado aplicado a modelos fundacionales de robotica, agregando datos procedentes de distintos entornos fisicos sin necesidad de centralizarlos. El repositorio forma parte del ecosistema `decent-vla`, se apoya en openpi y usa el dataset `DecentVLA/droid8_openpi` como fuente de datos. La inferencia se realiza mediante el protocolo websocket de openpi.

Su relevancia es principalmente de investigacion: publica el checkpoint, la configuracion de ejecucion, las estadisticas de normalizacion y el log de entrenamiento necesarios para reproducir el despliegue. No se acompanan resultados de benchmarks y el modelo acumula 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π0.5 (implementacion JAX de openpi); fine-tune completo desde `pi05_base`. Detalles internos no disponibles en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye checkpoint en `.pt`, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (checkpoint `server_round_0050.pt` de decent-vla), acompanado de `norm_stats.json`, `openpi_pi05_droid8_fedavg_local.yaml` y el log de entrenamiento |

## Arquitectura y entrenamiento

El modelo es un VLA construido sobre π0.5 dentro del framework openpi, que combina percepcion visual, instrucciones de lenguaje y generacion de acciones de robot. El checkpoint parte de `pi05_base` y se somete a un full fine-tune (no se indica uso de LoRA ni de adaptadores de bajo rango) con la receta `pi05_droid_jointpos` del repositorio `decent-vla` (`adapters/openpi/_droid.py`). La accion se representa en el espacio de posiciones articulares (joint positions), propio del robot DROID.

El entrenamiento es federado: 8 clientes, correspondientes cada uno a un edificio distinto del dataset DROID, con agregacion FedAvg, 50 rondas globales y 250 pasos locales por ronda, con batch de 32. Los datos de entrenamiento provienen del dataset `DecentVLA/droid8_openpi`. La model card no especifica el numero total de tokens, la composicion exacta del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal u otras) mas alla del propio esquema federado.

## Capacidades

- Generacion de acciones de robot para manipulacion a partir de observaciones visuales e instrucciones.
- Control en espacio de posiciones articulares (joint-position), segun la receta DROID empleada.
- Fine-tune completo sobre π0.5, lo que permite adaptacion al dominio DROID de cada edificio participante.
- Servicio de inferencia mediante el protocolo websocket de openpi (`scripts/serve_openpi_websocket.py`).
- Integracion con RoboLab (`--policy pi05`) y con el cliente de robot DROID (`examples/droid/droid_jointpos_main.py`).
- Compatibilidad con el flujo de normalizacion de openpi mediante `norm_stats.json`.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso en texto ni capacidades multilingues; no es un modelo de proposito conversacional.

## Casos de uso

- Manipulacion robotica de proposito general en entornos tipo DROID: el modelo traduce observaciones visuales e instrucciones en trayectorias de posiciones articulares para el robot, lo que permite abordar tareas de pick-and-place y manipulacion sobre mesa.
- Investigacion en aprendizaje federado: sirve como punto de partida reproducible para comparar FedAvg frente a entrenamiento centralizado sobre las mismas particiones de datos (8 edificios DROID).
- Despliegue en un robot fisico DROID o Franka con control por posiciones articulares: se conecta mediante el cliente `droid_jointpos_main.py` sobre el servidor websocket de openpi.
- Evaluacion en simulacion con RoboLab: permite lanzar la politica `pi05` sobre tareas de benchmark de manipulacion sin necesidad de hardware fisico.
- Fine-tuning adicional por dominio: al ser un full fine-tune sobre `pi05_base` con licencia Apache-2.0, se puede continuar el ajuste con datos propios de un nuevo entorno.
- Reproducibilidad de experimentos federados: los ficheros publicados (config YAML, `norm_stats.json` y log) permiten replicar la ronda 50 del entrenamiento y auditar la agregacion.
- Estudio de privacidad de datos en robotica: el esquema por edificios ilustra como entrenar una politica sin centralizar los datos de cada instalacion.
- Base para benchmarking de politicas VLA: util como linea base frente a checkpoints no federados de la misma familia π0.5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un VLA basado en π0.5, la inferencia requiere GPU, pero la model card no especifica el tamano del backbone ni el consumo de memoria.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; depende del tamano real de π0.5, que no se documenta.
- Opciones de despliegue: servidor websocket de openpi (`scripts/serve_openpi_websocket.py`) con el checkpoint `server_round_0050.pt`; cliente RoboLab con `--policy pi05`; cliente de robot DROID (`examples/droid/droid_jointpos_main.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de politica.
- Latencia y throughput: no disponibles.

Ejemplo de servicio indicado en la model card:

```bash
python scripts/serve_openpi_websocket.py --config examples/openpi_pi05_droid8_fedavg_local.yaml \
    --ckpt server_round_0050.pt --port 8000
```

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| droid8_pi05_fedavg | no disponible | no disponible | Apache-2.0 | HuggingFace (0 descargas) |
| pi05_base (openpi) | no disponible | no disponible | no disponible | Referenciado como modelo base |
| Otros checkpoints π0.5 de la misma familia | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No se publican resultados de benchmarks, por lo que no hay evidencia cuantitativa de su rendimiento frente a alternativas centralizadas.
- El modelo esta especializado en el dominio DROID (receta joint-position) y en los 8 entornos de entrenamiento; su generalizacion a otros robots o espacios de accion no esta documentada.
- Al proceder de aprendizaje federado con 8 clientes, puede presentar sesgos hacia las distribuciones de datos de esos edificios concretos y un comportamiento desigual entre ellos.
- Riesgo de acciones fuera de distribucion en escenarios no vistos; es un modelo de control fisico, por lo que los errores pueden tener consecuencias materiales en el robot.
- No se documentan idiomas soportados; no debe asumirse soporte multilingue en las instrucciones.
- No se especifica la longitud de contexto ni la ventana de observacion, lo que dificulta planificar tareas de horizonte largo.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; se desconoce la licencia del modelo base `pi05_base` y del dataset `droid8_openpi` mas alla de lo indicado.
- Los ficheros se subieron como pull request segun la model card, lo que puede implicar un estado de publicacion no definitivo.
- Sin descargas ni likes registrados, no hay validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DecentVLA/droid8_pi05_fedavg
- Dataset de entrenamiento: https://huggingface.co/datasets/DecentVLA/droid8_openpi
- openpi (framework referenciado en la model card): https://github.com/Physical-Intelligence/openpi
- Proyecto DROID (referenciado en la model card): https://droid-dataset.github.io/
