# Donghyun1228/pi05-libero-b200-weight-geometry-kappa1-ur5e-stopped-diagnostic26-20261013

## Resumen

Este repositorio contiene un checkpoint de diagnostico detenido del modelo π₀.₅ (Pi05) aplicado a un brazo UR5e sobre el benchmark LIBERO. El autor, Donghyun1228, lo publica bajo la etiqueta `stopped-diagnostic`: se trata de un piloto rechazado tras 26 commits del optimizador (pesos raw step25, sin EMA) de un plan de entrenamiento que preveia 1.000 actualizaciones. No es, por tanto, un modelo final entrenado, sino un artefacto de diagnostico que documenta por que una formulacion concreta fue descartada.

El motivo del paro esta descrito con precision en la model card: durante las primeras 25 actualizaciones nativas de dinamica inversa (IDM) se usaron cantidades vision/LLM/full-expert de 1/1/1, y en el paso 25 el tether de curvatura predeclarado κ1 empujo las nueve cantidades de modulo, repartidas en tres condiciones, hasta el limite inferior de 0,01. Una puerta mecanica detuvo esa formulacion y no se ejecuto continuacion alguna. El autor indica explicitamente que no se realizo ninguna evaluacion de politica y que no se reporta ninguna puntuacion de rendimiento.

Su relevancia es, por tanto, metodologica mas que de rendimiento: sirve como registro reproducible de un fallo de formulacion en el pipeline openpi, con pesos de inferencia completos (13,1 GB), normalizacion de origen y una configuracion de politica de 74 hojas con muneca separada para restaurar el modelo en BF16. Es un artefacto para depuracion y trazabilidad de experimentos, no para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) derivada de π₀.₅ de Physical Intelligence; el pipeline del repositorio usa dinamica inversa (IDM) sobre politica con experto de accion; detalles internos de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se especifica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; la inferencia restaura BF16 segun la model card |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | shards de parametros nativos (51 hojas raw nativas: 43 FP32 entrenables de fuente original y 8 proyecciones BF16 congeladas; mas 23 hojas BF16 de muneca de fuente original); formato de contenedor no especificado |
| Biblioteca | openpi |
| Pipeline declarado | robotics |
| Tamano del repositorio | 13,1 GB |
| Estado del entrenamiento | 26 commits del optimizador; pesos raw step25, sin EMA; plan original de 1.000 actualizaciones no completado |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la topologia interna del modelo mas alla de su pertenencia al ecosistema π₀.₅ y de que el experimento se centra en un componente de dinamica inversa (IDM). Segun la documentacion publica del proyecto base (arXiv:2504.16054), π₀.₅ es un modelo Vision-Language-Action construido sobre π₀ que emplea co-entrenamiento sobre datos heterogeneos, combinando demostraciones roboticas con datos multimodales a gran escala para tareas de horizonte largo en entornos reales no vistos. Esta ficha se limita a ese nivel de descripcion porque el repositorio no aporta el recuento de parametros, la profundidad de capas ni la configuracion del experto de accion.

En cuanto al entrenamiento, lo documentado es un regimen de 26 commits del optimizador sobre un plan de 1.000 actualizaciones. Las primeras 25 actualizaciones nativas de IDM usaron cantidades vision/LLM/full-expert de 1/1/1, y en el paso 25 el tether de curvatura κ1 (predeclarado) llevo las nueve cantidades de modulo de las tres condiciones al limite inferior de 0,01, activando la puerta mecanica que detuvo el experimento. El kernel de geometria tangente-H modifica unicamente un escalar de modulo sobre la propuesta IDM posterior a Adam: no anade direccion de gradiente y no utiliza observaciones de la fuente ni retroalimentacion de exito de tarea. El diagnostico numerico legacy de corriente de fuente se mantiene separado. No se ejecuto evaluacion de politica ni se reporta ninguna metrica de rendimiento, retencion de politica fuente o mejora.

Los datos objetivo citados son el dataset `Donghyun1228/libero-xe-ur5e-dense-contact-probe-20261010` en el commit `32649763ecd9c00c263250e86e28e42e3d914021`, con snapshot de entrenamiento `f8681e6849eb19dda944bd6daa181962f5b902e7`. La restauracion requiere la configuracion de politica de 74 hojas con muneca separada incluida en `model_config.json`, correspondiente al commit de inferencia `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08`. Los estados completos raw/Adam/EMA/continuacion se conservan por separado y no forman parte de este payload, que es exclusivamente de inferencia.

## Capacidades

- Ejecucion de politica de manipulacion robotica: el payload esta pensado para inferencia sobre el dominio objetivo (UR5e en tareas LIBERO), segun la configuracion de politica incluida.
- Dinamica inversa (IDM): el experimento entrena un componente nativo de IDM dentro del pipeline openpi.
- Control con muneca separada: el modelo incorpora 23 hojas BF16 de muneca de fuente original y requiere la configuracion de 74 hojas con muneca separada para restaurarse.
- Normalizacion de origen incluida: los pesos de inferencia se publican con los activos de normalizacion de la fuente.
- Compatibilidad con LIBERO: el autor recomienda mantener MuJoCo 3.2.3 para cualquier uso posterior con LIBERO.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes, multilingueismo ni modos de pensamiento. No disponible cualquier capacidad mas alla del control robotico del checkpoint.
- No se aporta ninguna evaluacion funcional: no hay evidencia publicada de exito de tarea ni de retencion de la politica fuente.

## Casos de uso

- Reproduccion de diagnostico de fallos en entrenamiento: el checkpoint permite inspeccionar el estado exacto en el paso 25 y verificar como el tether κ1 saturo las nueve cantidades de modulo hasta 0,01, util para auditar el comportamiento de puertas mecanicas en pipelines openpi.
- Depuracion de formulaciones de geometria en IDM: investigadores que trabajen con kernels de geometria tangente-H pueden comparar este estado contra el diagnostico numerico legacy de corriente de fuente, ya que ambos se mantienen separados.
- Auditoria de trazabilidad de experimentos: los hashes de dataset objetivo, snapshot de entrenamiento y commit de inferencia permiten reconstruir la cadena de procedencia de un piloto rechazado, algo poco habitual en checkpoints publicos.
- Validacion de rutas de restauracion: sirve para comprobar que la configuracion de politica de 74 hojas con muneca separada y la restauracion en BF16 funcionan correctamente antes de aplicar el mismo procedimiento a un modelo completo.
- Pruebas de integridad de shards: la model card indica que todos los shards de parametros nativos se comprueban contra la continuacion atomica de la puerta, por lo que el payload puede usarse como caso de prueba de verificacion de pesos.
- Estudio metodologico de protocolos de parada: como ejemplo documentado de criterio predeclarado (tether de curvatura con limite inferior) que detiene un entrenamiento en lugar de continuarlo, es material util para diseno de experimentos reproducibles.
- No es adecuado como politica de produccion: al no existir evaluacion de politica ni puntuacion de rendimiento, no hay base para desplegarlo en tareas reales de manipulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que no se ejecuto ninguna evaluacion de politica y que no se reporta puntuacion de rendimiento, y que este piloto rechazado no establece mejora ni retencion de la politica fuente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, el repositorio ocupa 13,1 GB y la inferencia restaura BF16, por lo que el payload de pesos requiere del orden de 13 GB o mas de memoria solo para los parametros, antes de activaciones y buffers de vision. Cifra estimada a partir del tamano del repositorio, no confirmada por el autor.
- GPU recomendadas: no disponibles. Por el tamano del payload, se necesitarian GPU con 24 GB o mas de memoria (por ejemplo, una RTX 4090 de 24 GB quedaria muy justa) y, con mayor holgura, GPU de centro de datos tipo A100 o H100. Esta recomendacion es una inferencia del tamano del repositorio, no un dato del autor.
- Cabe en GPU de consumo: no confirmado. Un payload de 13,1 GB restaurado en BF16 exigiria al menos una GPU de 24 GB en el mejor de los casos, sin margen para activaciones.
- Opciones de despliegue: la ruta documentada es la biblioteca openpi, restaurando la configuracion de politica de 74 hojas con muneca separada desde `model_config.json` (commit `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08`) y en precision BF16. Para uso posterior con LIBERO se debe mantener MuJoCo 3.2.3. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de politica robotica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Estado | Evaluacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Donghyun1228/pi05-libero-b200-weight-geometry-kappa1-ur5e-stopped-diagnostic26-20261013` (este) | Checkpoint de diagnostico IDM sobre π₀.₅ para UR5e | Detenido en 26 commits, raw step25 sin EMA | Ninguna; sin puntuacion | apache-2.0 | Publico en HF; 0 descargas, 0 likes |
| `Donghyun1228/pi05-libero-b200-idm-full10-ur5e-1000-20261012` | Checkpoint IDM-only completado (1.000 actualizaciones) sobre la misma linea | Completado, raw step999 | No disponible en la informacion recogida | No disponible en la informacion recogida | Publico en HF |
| `lerobot/pi05_libero_base` | Base π₀.₅ de LeRobot para LIBERO | Checkpoint base | No disponible en la informacion recogida | No disponible en la informacion recogida | Publico en HF |
| `lerobot/pi05_libero_finetuned_quantiles_v044` | π₀.₅ afinado en LIBERO con normalizacion Quantiles | Checkpoint afinado | Entrenado y evaluado en tareas LIBERO segun la descripcion | No disponible en la informacion recogida | Publico en ModelScope |

Los parametros totales y la longitud de contexto de todas estas alternativas figuran como no disponibles en la informacion recopilada, por lo que la comparacion se limita al estado del entrenamiento, la existencia de evaluacion y la disponibilidad. La diferencia clave de este checkpoint frente a los demas es que no es un modelo terminado ni evaluado, sino un artefacto de diagnostico de un piloto rechazado.

## Limitaciones y advertencias

- No es un modelo completo: se trata de un checkpoint detenido correspondiente a 26 commits de un plan de 1.000; el propio autor lo califica de piloto rechazado.
- Ausencia total de evaluacion: no se ejecuto evaluacion de politica y no se reporta puntuacion alguna, por lo que no existe evidencia de mejora ni de retencion de la politica fuente.
- No reanudable: el modelo card indica explicitamente que este payload es para inferencia y no constituye un estado de entrenamiento reanudable. Los estados raw/Adam/EMA/continuacion se conservan aparte.
- Sin EMA: los pesos publicados son raw step25, no una media exponencial de pesos, lo que puede producir un comportamiento menos estable que un checkpoint final.
- Formulacion fallida conocida: el tether κ1 saturo las nueve cantidades de modulo de las tres condiciones hasta 0,01, lo que activo la puerta mecanica de parada. Cualquier uso de estos pesos hereda esa condicion.
- Riesgo de alucinacion y sesgos: no disponible; no hay informacion sobre datos de preentrenamiento, sesgos ni comportamiento fuera de distribucion para este checkpoint.
- Limitaciones de contexto e idioma: no disponible.
- Restricciones de licencia: los pesos se publican bajo apache-2.0, que permite uso comercial, pero al derivar de π₀.₅ conviene revisar los terminos del proyecto base y del dataset objetivo antes de cualquier uso productivo.
- Dependencia de version: el autor advierte de mantener MuJoCo 3.2.3 para cualquier uso posterior con LIBERO; otras versiones pueden romper la reproducibilidad.
- Procedencia incompleta: el checkpoint fuente legacy no tiene un ID publico verificado en HuggingFace, aunque todos los pesos de inferencia se incluyen en este repositorio.
- Adopcion nula: cero descargas y cero likes en el momento del registro, sin comunidad que haya validado el artefacto.
- No apto para produccion: sin evaluacion ni garantia de rendimiento, no debe utilizarse como politica en sistemas roboticos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-b200-weight-geometry-kappa1-ur5e-stopped-diagnostic26-20261013
- Checkpoint hermano completado (IDM-only, 1.000 actualizaciones): https://huggingface.co/Donghyun1228/pi05-libero-b200-idm-full10-ur5e-1000-20261012
- Dataset objetivo declarado: https://huggingface.co/datasets/Donghyun1228/libero-xe-ur5e-dense-contact-probe-20261010
- Modelo base π₀.₅ de LeRobot para LIBERO: https://huggingface.co/lerobot/pi05_libero_base
- Variante afinada en LIBERO con normalizacion Quantiles: https://www.modelscope.cn/models/lerobot/pi05_libero_finetuned_quantiles_v044
- Paper de π₀.₅: a Vision-Language-Action Model with Open-World Generalization: https://arxiv.org/abs/2504.16054
- Biblioteca openpi (Vision-Language-Action Model Library): https://www.openpi.net/english.html
