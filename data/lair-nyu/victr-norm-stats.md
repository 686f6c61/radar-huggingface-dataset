# lair-nyu/victr-norm-stats

## Resumen

`lair-nyu/victr-norm-stats` no es un modelo de lenguaje, sino un artefacto auxiliar de normalizacion: un fichero `norm_stats.json` con las estadisticas (media y desviacion tipica) empleadas para normalizar las observaciones y acciones del dataset `icl-dataset` en formato LeRobot. Estas estadisticas son las que consumen los checkpoints canonicos de VICTR (`yor_icl_victr_{vision,value,vision_value,vision_interp}_canonical_ctx3cam`) durante el entrenamiento y la inferencia en el framework openpi.

El repositorio lo publica la organizacion `lair-nyu` y su contenido es identico al de las estadisticas de `yor_icl_pi05_canonical_extended`, lo que sugiere que ambos conjuntos de checkpoints comparten el mismo esquema de normalizacion sobre el mismo dataset. La dimensionalidad declarada es de 18 dimensiones para el estado y 20 para la accion, datos relevantes para quien vaya a reutilizar los pesos en un pipeline de robotica.

Su relevancia es practica y acotada: sin este fichero en la ruta correcta (`assets/<config_name>/icl-dataset/norm_stats.json` dentro de openpi), los checkpoints VICTR no pueden desnormalizar correctamente las salidas y las trayectorias generadas carecen de sentido fisico. Es, por tanto, una dependencia obligatoria para reproducir los resultados de dichos checkpoints, no un modelo entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de normalizacion, no es un modelo neuronal) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | JSON (`norm_stats.json`) |
| Dimension del estado | 18 |
| Dimension de la accion | 20 |
| Dataset asociado | `icl-dataset` (LeRobot) |
| Framework de destino | openpi |
| Ruta de instalacion | `assets/<config_name>/icl-dataset/norm_stats.json` |

## Arquitectura y entrenamiento

No hay arquitectura ni entrenamiento asociados al repositorio: se trata de un fichero de estadisticas agregadas calculadas sobre el dataset `icl-dataset`. Su funcion es la normalizacion por caracteristica, un paso estandar en el aprendizaje por imitacion (policy learning) para llevar observaciones y acciones a una escala comparable antes de alimentar la politica.

La model card indica que las estadisticas son identicas a las de `yor_icl_pi05_canonical_extended`, lo que apunta a un mismo esquema de preprocesamiento compartido entre distintas variantes de checkpoints (vision, value, vision_value, vision_interp). No se documenta el numero de episodios, la composicion del dataset ni el metodo exacto de calculo (media/desviacion tipica por dimension, percentiles u otros).

## Capacidades

- Proporcionar los parametros de normalizacion (media y desviacion tipica) para las 18 dimensiones de estado y las 20 dimensiones de accion del dataset `icl-dataset`.
- Permitir la desnormalizacion de las acciones predichas por los checkpoints VICTR canonicos `ctx3cam` en openpi.
- Garantizar consistencia de escala entre entrenamiento e inferencia para las variantes `vision`, `value`, `vision_value` y `vision_interp`.
- Servir como referencia para verificar que un pipeline de robotica usa el mismo esquema de preprocesamiento que los checkpoints publicados.
- No ofrece generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades multilingues.

## Casos de uso

- Reproduccion de experimentos VICTR: colocar el fichero en `assets/<config_name>/icl-dataset/norm_stats.json` dentro de openpi para que los checkpoints canonicos `ctx3cam` funcionen con las estadisticas previstas por el autor.
- Despliegue de politicas de robotica entrenadas con `icl-dataset`: usar estas estadisticas para normalizar observaciones en tiempo de inferencia y desnormalizar las acciones antes de enviarlas al controlador del robot.
- Validacion de pipelines de evaluacion: comparar las estadisticas propias con las de este repositorio para detectar discrepancias de preprocesamiento que invalidarian las metricas de exito.
- Reentrenamiento o fine-tuning sobre `icl-dataset`: reutilizar el fichero como base cuando se quiera mantener exactamente el mismo esquema de normalizacion que los checkpoints de referencia.
- Auditoria de checkpoints: comprobar que las dimensiones de estado (18) y accion (20) coinciden con las esperadas por el modelo antes de cargarlo, evitando errores silenciosos de shape.
- Integracion en contenedores de inferencia: empaquetar el JSON junto con los pesos para que el entorno de ejecucion sea autocontenido y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el fichero es un JSON de estadisticas y no requiere GPU para su lectura.
- GPU: no aplica para este artefacto; los requisitos vendran determinados por los checkpoints VICTR que lo consumen, cuyas especificaciones no estan disponibles en la informacion proporcionada.
- GPU de consumo: no aplica a este repositorio.
- Despliegue: se integra en openpi como recurso de assets; no se despliega mediante vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen del checkpoint y del hardware que ejecute la politica.

## Comparativa con modelos similares

| Artefacto | Tipo | Dimension estado | Dimension accion | Dataset | Licencia |
|---|---|---|---|---|---|
| `lair-nyu/victr-norm-stats` | Estadisticas de normalizacion (JSON) | 18 | 20 | `icl-dataset` | no disponible |
| `yor_icl_pi05_canonical_extended` (stats) | Estadisticas de normalizacion (JSON) | no disponible | no disponible | no disponible | no disponible |
| Checkpoints VICTR `ctx3cam` | Pesos de politica | no disponible | no disponible | `icl-dataset` | no disponible |

No se dispone de informacion sobre otros artefactos comparables en la busqueda realizada.

## Limitaciones y advertencias

- No es un modelo: no genera texto, no razona y no puede evaluarse con benchmarks de LLM; cualquier uso en ese sentido es un error categorico.
- Las estadisticas estan acopladas al dataset `icl-dataset` y a su esquema concreto (18 dimensiones de estado, 20 de accion); usarlas con otro dataset o con un robot de dimensionalidad distinta producira resultados incorrectos.
- La licencia no esta declarada en la informacion disponible, por lo que el uso comercial queda sin cobertura explicita y requiere contactar con el autor.
- No se documenta el metodo de calculo de las estadisticas ni la version exacta del dataset, lo que dificulta auditar su correccion.
- Cualquier discrepancia entre estas estadisticas y las usadas en el entrenamiento del checkpoint invalida las predicciones de forma silenciosa (acciones con escala incorrecta sin error explicito).
- Los resultados de la busqueda web no guardan relacion con el repositorio (corresponden a empresas homonimas de remolques e inmobiliaria en Normandia), por lo que no aportan informacion tecnica adicional.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/lair-nyu/victr-norm-stats
- Framework openpi (destino del fichero): no disponible en la informacion proporcionada
- Dataset `icl-dataset` en LeRobot: no disponible en la informacion proporcionada
- Checkpoints VICTR canonicos `ctx3cam`: no disponible en la informacion proporcionada
- Paper o blog de VICTR: no disponible en la informacion proporcionada
