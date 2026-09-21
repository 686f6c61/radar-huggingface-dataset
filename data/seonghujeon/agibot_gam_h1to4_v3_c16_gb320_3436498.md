# SeonghuJeon/agibot_gam_h1to4_v3_c16_gb320_3436498

## Resumen

`SeonghuJeon/agibot_gam_h1to4_v3_c16_gb320_3436498` es un checkpoint de politica robotica publicado en HuggingFace por el usuario SeonghuJeon, etiquetado como robotics, agibot, pytorch y checkpoint. Corresponde al paso 11.000 de entrenamiento de un modelo denominado AgiBot GAM, exportado como checkpoint portable (`checkpoints/0011000.pt`) junto con su configuracion resuelta (`config.yaml`) y el estado de normalizacion (`stats/`). No es un modelo de lenguaje ni un export de Transformers AutoModel: se carga con el loader especifico de checkpoints AgiBot/OXE del pipeline 3DA.

El checkpoint procede de un trabajo de continuacion (job3461453) que retomo el estado del paso 6.858 del job original (job3436498) dentro del mismo run de W&B `xvbt6gtt`. El entrenamiento mezcla al 50% datos de AgiBot y al 50% datos de OXE, con entradas de estado y accion compartidas y rellenadas con padding hasta una anchura de 16, historial de 1 a 4 observaciones y chunks de accion de 16 pasos.

Su relevancia practica es acotada: es un artefacto de investigacion especifico de proyecto, sin licencia declarada, sin benchmarks de inferencia publicados y con cero descargas y cero likes en el momento de la consulta. Es util como referencia reproducible para quien trabaje con el pipeline 3DA sobre la plataforma AgiBot, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; politica robotica entrenada con el pipeline 3DA (el `config.yaml` referencia un backbone cuya arquitectura no se describe en la model card) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje); ventana de historial de 1 a 4 observaciones y horizonte de accion (*action chunk*) de 16 pasos |
| Tipos de cuantizacion | No disponible; se distribuye un unico checkpoint PyTorch portable sin variantes cuantizadas |
| Idiomas soportados | No disponible; no aplica (modelo de accion robotica, no procesa lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`.pt`): `checkpoints/0011000.pt`; acompanado de `config.yaml`, `stats/` y `manifest.json` con tamanos y SHA256. No es safetensors ni GGUF, y no es un export de Transformers |
| Tamano del repositorio | 3,2 GB |
| Modalidades de entrada | Tres camaras AgiBot (cabeza, mano izquierda, mano derecha), estado de articulaciones y gripper, y estado/accion OXE con padding |
| Modalidad de salida | Acciones: acciones de brazo relativas al EEF mas movimiento de base |
| Entrenamiento | 11.000 actualizaciones completadas; lote global 320; historial 1-4; chunk de accion 16; mezcla 50% AgiBot / 50% OXE |
| Pipeline declarado | robotics |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 21 de septiembre de 2026 |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura del backbone (transformer, MoE, difusion de politicas ni ninguna otra). Lo que si detalla la model card es el contrato de datos: las observaciones y acciones de AgiBot y de OXE se comparten tras rellenarlas con padding hasta una anchura de 16 (*shared padded state/action inputs*). Para AgiBot, el estado corresponde a los valores articulares y de gripper de izquierda y derecha, y la accion a movimientos de brazo relativos al EEF mas movimiento de la base. Para OXE, el estado ocupa las posiciones 0:7 y el resto se rellena con ceros, mientras que las acciones usan las posiciones 7:14 para el brazo derecho y el resto queda enmascarado. El entrenamiento usa historia de 1 a 4 observaciones y predice chunks de 16 acciones, con lote global de 320.

El proceso es una continuacion: el job3461453 retomo el estado del paso 6.858 del job3436498 bajo el mismo run de W&B, y el checkpoint publicado corresponde al paso 11.000. No se documentan token counts, composicion detallada del dataset, ni fases de RLHF o DPO (no aplicables en el sentido habitual de los modelos de lenguaje). El checkpoint portable incluye modelo, configuracion y estado de normalizacion, pero no los shards del optimizador de DeepSpeed, por lo que no sirve como backup completo para reanudar entrenamiento. La configuracion resuelta conserva rutas del servidor de origen (datos y backbone), que deben sustituirse al usar otra maquina. El autor indica que se verificaron el paso de entrenamiento almacenado, la estructura del ZIP y los hashes subidos, y que no se ejecuto ningun benchmark de inferencia nuevo para este export.

## Capacidades

- Generacion de acciones de manipulacion: produce acciones de brazo relativas al EEF mas movimiento de base para la plataforma AgiBot.
- Percepcion multivista: consume tres flujos de camara simultaneos (cabeza, mano izquierda, mano derecha) junto con el estado propioceptivo.
- Control con memoria corta: soporta ventanas de historial de 1 a 4 observaciones, lo que permite politicas reactivas o con contexto temporal limitado.
- Prediccion por chunks: genera bloques de 16 acciones por inferencia, lo que reduce la frecuencia efectiva de llamadas al modelo en un bucle de control.
- Entrenamiento conjunto multi-robot: la mezcla 50/50 con OXE y el esquema de padding/enmascaramiento apuntan a transferencia entre morfologias, con el brazo derecho de OXE mapeado a ranuras concretas del vector de accion.
- Normalizacion incluida: el estado de normalizacion viaja con el checkpoint (`stats/`), lo que evita reajustar estadisticas en inferencia.
- No soporta generacion de texto, razonamiento simbolico, codigo, matematicas, vision generalista, tool calling, function calling ni uso como agente conversacional.

## Casos de uso

- Investigacion en aprendizaje por imitacion: el checkpoint sirve como punto de partida para reproducir o continuar experimentos de politica viso-motora con el pipeline 3DA, ya que incluye configuracion y normalizacion.
- Fine-tuning sobre tareas concretas de AgiBot: al estar entrenado parcialmente con datos AgiBot (cabeza, mano izquierda, mano derecha, estado articular), es un inicializador razonable para especializar una politica en una tarea de manipulacion especifica.
- Transferencia cross-embodiment: la mezcla con OXE y el enmascaramiento de acciones permiten estudiar como se comporta una politica compartida entre la morfologia AgiBot y otros robots del dataset OXE.
- Evaluacion de esquemas de accion con chunking: el horizonte de 16 acciones y el historial de 1 a 4 hacen de este checkpoint un banco de pruebas para medir el efecto del chunking en estabilidad de control.
- Comparacion de estrategias de mezcla de datos: al documentarse explicitamente la proporcion 50/50 AgiBot/OXE, sirve como referencia para experimentos sobre ratios de mezcla y padding.
- Analisis de artefactos de entrenamiento: el `manifest.json` con hashes y tamanos permite auditar integridad de checkpoints en pipelines reproducibles de robotica.
- Replicacion de experimentos con DeepSpeed: aunque no incluye shards del optimizador, documenta el paso exacto, el lote global y el run de W&B, lo que facilita intentar reproducir la trayectoria de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que no se ejecuto un benchmark de inferencia nuevo para este export, y no se proporcionan cifras de exito en tareas, tasas de exito en simulacion ni metricas de control.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia aproximada y no verificada, el repositorio completo pesa 3,2 GB, por lo que los pesos en precision mixta o 32 bits ocuparian del orden de esa magnitud y la inferencia deberia caber holgadamente en GPUs de 8-16 GB, sumando el coste de procesar tres flujos de camara y el historial. Esta cifra es una estimacion, no un dato publicado por el autor.
- GPU recomendadas: no disponible. Al no documentarse el backbone, no puede recomendarse una GPU concreta (A100, H100, RTX 4090 u otras) sin medir previamente el consumo real.
- Viabilidad en GPU de consumo: probablemente si, dado el tamano del artefacto, pero sin confirmacion oficial.
- Opciones de despliegue: carga mediante PyTorch y el loader especifico `3DA_unified` AgiBot/OXE del repositorio ONground-Korea/3DA. No es compatible con vLLM, TGI, Ollama ni llama.cpp, que estan orientados a modelos de lenguaje. DeepSpeed solo es relevante si se reanuda entrenamiento, y este export no incluye el estado del optimizador.
- Latencia y throughput: no disponible (no se ejecuto benchmark de inferencia).

## Comparativa con modelos similares

No se proporcionan datos verificables de modelos comparables en la informacion disponible, por lo que no puede establecerse una comparacion numerica. Los artefactos de la misma categoria (politicas viso-motoras entrenadas con datos de Open X-Embodiment) requeririan consultar sus propias model cards y publicaciones, extremo que no cubre la informacion suministrada.

| Modelo | Categoria | Parametros | Datos de entrenamiento | Licencia | Benchmark publico |
|---|---|---|---|---|---|
| Este checkpoint (`agibot_gam_h1to4_v3_c16_gb320_3436498`) | Politica robotica para AgiBot, entrenada con pipeline 3DA | No disponible | 50% AgiBot + 50% OXE, 11.000 actualizaciones | No disponible | No disponible |
| Alternativas de la misma categoria (politicas viso-motoras open source) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no declarada: no hay terminos que autoricen uso comercial, redistribucion o modificacion. En produccion, este vacio legal es un bloqueo de facto hasta que el autor lo aclare.
- No es un modelo de lenguaje: no genera texto, no acepta prompts en lenguaje natural, no soporta tool calling y no puede usarse para tareas conversacionales, de codigo ni de razonamiento simbolico.
- Dependencia de codigo propietario del proyecto: la carga requiere el loader `3DA_unified` de ONground-Korea/3DA (revision e49b55a3). No funciona con `AutoModel` de Transformers ni con herramientas estandar de inferencia.
- Configuracion no portable tal cual: el `config.yaml` conserva rutas del servidor de origen para datos y backbone, que hay que reemplazar manualmente en otra maquina.
- No es un backup de reanudacion: al no incluir los shards del optimizador de DeepSpeed, no permite continuar el entrenamiento exactamente donde se dejo.
- Sin benchmarks ni validacion de inferencia: el autor confirma que solo verifico el paso de entrenamiento, la estructura del ZIP y los hashes, no el rendimiento del modelo.
- Riesgo de sobreajuste a la plataforma AgiBot: aunque se entrena con OXE, el mapeo de acciones (ranuras 7:14 para el brazo derecho, resto enmascarado) es especifico y puede degradar el comportamiento en morfologias distintas.
- Riesgo de alucinacion y errores de politica: en robotica, una prediccion erronea de accion se traduce directamente en movimiento fisico. Se requiere validacion en simulacion y, despues, ejecucion supervisada con limites de par, paradas de emergencia y espacio de trabajo despejado.
- Sesgos de datos: la model card no detalla la composicion de los datasets AgiBot ni OXE, por lo que no puede evaluarse el sesgo por tipo de objeto, iluminacion, tarea o demografia del entorno de recogida.
- Sin informacion de idioma ni de documentacion adicional: apenas hay material para reproducir la evaluacion, y las descargas y likes son cero, lo que implica ausencia de validacion por parte de la comunidad.
- Fechas futuras respecto a la mayoria de catalogos: el checkpoint esta fechado el 21 de septiembre de 2026, lo que dificulta encontrar referencias cruzadas o seguimiento independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SeonghuJeon/agibot_gam_h1to4_v3_c16_gb320_3436498
- Codigo de entrenamiento fuente: ONground-Korea/3DA, revision e49b55a3 (repositorio indicado en la model card; el enlace directo no se proporciona en la informacion disponible)
- Run de W&B asociado: identificador `xvbt6gtt`, dentro del run `agibot_gam_h1to4_v3_c16_gb320_3436498` (URL no disponible)
- Resultados de busqueda web: no se encontro ningun resultado relevante para este modelo (los resultados devueltos correspondian a temas no relacionados: prompts DAN, GitHub Copilot, discusiones sobre GPT-6 y GLM, y recuperacion de historiales de ChatGPT).
