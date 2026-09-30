# chentong/proteus2

## Resumen

`chentong/proteus2` es un repositorio publicado en Hugging Face por el usuario chentong (wangchentong), cuya actividad declarada en la plataforma se centra en *deep learning* y diseno de proteinas. El repositorio ocupa 2,5 GB y esta etiquetado con licencia MIT, pero no incluye una model card tecnica: el README se limita al bloque de metadatos de licencia, sin descripcion, sin arquitectura declarada y sin instrucciones de uso. No se han publicado resultados de benchmarks ni especificaciones en la informacion disponible.

Por el contexto de la busqueda web, el nombre remite al proyecto Proteus, un modelo de difusion profunda para la generacion de esqueletos (*backbones*) de proteinas presentado en ICML 2024. Ese trabajo describe una red que emplea metodos de triangulo basados en grafos y una red de interaccion multi-track, y que alcanza resultados de referencia en generacion *de novo* sin necesidad de preentrenamiento, a diferencia de RFDiffusion, que depende de RosettaFold. No obstante, no hay confirmacion de que `proteus2` corresponda exactamente a esa arquitectura ni de en que se diferencia de la version publicada en 2024.

Es relevante ahora porque el autor mantiene repositorios relacionados y actualizados en la misma organizacion, como `chentong/proteus2_weights` (actualizado el 31 de octubre de 2025) y `chentong/proteus_flow_matching`, lo que sugiere una linea de trabajo activa. Advertencia importante: este repositorio no es un modelo de lenguaje ni un modelo multimodal de texto; no debe evaluarse con los criterios habituales de contexto, cuantizacion o idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. No confirmada para `proteus2`. El proyecto Proteus asociado (ICML 2024) describe una red de difusion profunda sobre grafos con red de interaccion multi-track |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no se ha confirmado que sea MoE) |
| Longitud de contexto | No aplica / no disponible (no es un modelo de lenguaje; no se define ventana de contexto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no aplica a un modelo de generacion de estructuras proteicas) |
| Licencia | MIT |
| Formato de pesos | No disponible. El repositorio ocupa 2,5 GB; existe un repositorio separado `chentong/proteus2_weights` cuyo formato no se detalla en la informacion disponible |
| Fecha de creacion (metadatos) | 2026-09-30T17:06:47.000Z |
| Fecha de actualizacion (metadatos) | 2026-09-30T17:32:06.000Z |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura concreta de `proteus2`. La model card no incluye descripcion tecnica y los resultados de busqueda solo permiten atribuir el nombre al linaje del proyecto Proteus. Segun la documentacion publica de ese proyecto (ICML 2024), se trata de una red de difusion profunda para generar esqueletos de proteinas que sustituye la dependencia de un predictor de estructura preentrenado por metodos de triangulo sobre grafos y una red de interaccion multi-track. El trabajo afirma obtener rendimiento de referencia sin preentrenamiento, con evaluaciones *in silico* y caracterizacion experimental que reportan una tasa de exito notable en generacion *de novo*.

No hay datos disponibles sobre el volumen de tokens o estructuras de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO (conceptos que, ademas, no aplican de forma estandar a modelos generativos de estructura) ni sobre innovaciones especificas de esta segunda version. Tampoco se puede confirmar si `proteus2` implementa *flow matching*: existe un repositorio hermano llamado `chentong/proteus_flow_matching`, pero la informacion proporcionada no establece la relacion entre ambos.

## Capacidades

- Generacion de estructuras proteicas: el linaje Proteus esta disenado para la generacion *de novo* de esqueletos de proteinas, segun la documentacion publica del proyecto original. No confirmado especificamente para `proteus2`.
- Diseno condicionado: no disponible.
- Generacion de texto, razonamiento, codigo o matematicas: no aplica. Este repositorio no es un modelo de lenguaje.
- Vision, audio o multimodalidad: no aplica / no disponible.
- *Tool calling* o *function calling*: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Modo *thinking*: no disponible.
- Cualquier otra capacidad especifica: no disponible en la informacion proporcionada.

## Casos de uso

- Diseno de proteinas *de novo*: si `proteus2` hereda la funcion del Proteus original, el uso principal seria generar esqueletos proteicos nuevos con alta diseabilidad, partiendo de especificaciones estructurales o de restricciones definidas por el usuario. La idoneidad se justifica por la tasa de exito reportada en el trabajo de ICML 2024, aunque no verificada para esta version.
- Aumento de datasets estructurales: generacion de candidatos sinteticos para ampliar librerias de estructuras antes de filtrado experimental. Requiere validacion posterior con predictores de estructura independientes.
- Exploracion de *scaffolds* para ingenieria de proteinas: propuesta de andamiajes alternativos sobre los que injertar motivos funcionales, reduciendo el espacio de busqueda frente a metodos de fuerza bruta.
- Integracion en pipelines de diseno computacional: encadenamiento del modelo con herramientas de secuencia (*protein MPNN* y similares) y de prediccion estructural (AlphaFold, ESMFold) para cerrar el ciclo estructura-secuencia-validacion. No hay informacion sobre interfaces o scripts de integracion en este repositorio.
- Reproduccion de investigacion: punto de partida para replicar o extender los resultados de la linea Proteus, dado que la licencia MIT permite reutilizacion y modificacion.
- Prototipado rapido en entornos academicos: con un repositorio de 2,5 GB y licencia permisiva, es viable su despliegue en un grupo de investigacion con una GPU unica, siempre que se resuelva la ausencia de documentacion de uso.
- Aplicaciones terapeuticas o industriales: no recomendable a partir de la informacion disponible, ya que no hay datos de validacion, ni de versionado, ni de condiciones de uso para produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para `proteus2`. El trabajo original de Proteus (ICML 2024) menciona una "tasa de exito notable" en generacion *de novo* de esqueletos proteicos, validada *in silico* y experimentalmente, pero no se han proporcionado cifras concretas en el material consultado, por lo que no se incluyen numeros.

| Benchmark | Resultado |
|---|---|
| Metricas de diseabilidad (Proteus, ICML 2024) | Cualitativas, sin cifras disponibles |
| Metricas especificas de `proteus2` | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia indirecta, el repositorio ocupa 2,5 GB, lo que sugiere pesos del orden de gigabytes, pero no se puede derivar de ahi un requisito de VRAM fiable.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. No se puede confirmar ni descartar.
- Opciones de despliegue: no disponible. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, herramientas que en cualquier caso no aplican a modelos de difusion estructural.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `chentong/proteus2` | Generacion de esqueletos proteicos (no confirmado) | No disponible | No aplica | MIT | Hugging Face |
| Proteus (ICML 2024) | Difusion sobre grafos, red de interaccion multi-track, sin preentrenamiento | No disponible | No aplica | No disponible | GitHub (`Wangchentong/Proteus`) |
| RFDiffusion | Difusion con predictor de estructura preentrenado (RosettaFold) | No disponible | No aplica | No disponible | Referenciado en la documentacion de Proteus |

No se dispone de datos cuantitativos para establecer una comparacion de rendimiento entre estas alternativas.

## Limitaciones y advertencias

- Ausencia total de model card: el README solo contiene la licencia. No hay descripcion de arquitectura, datos de entrenamiento, uso previsto ni ejemplos de inferencia.
- Metricas nulas de adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Riesgo de confusion de identidad: no se puede confirmar que `proteus2` sea una version del Proteus de ICML 2024, ni cual es su relacion con `proteus2_weights` o `proteus_flow_matching`.
- Fechas de metadatos anomalas: la creacion y actualizacion figuran como 2026-09-30, incoherentes con el resto del contexto temporal; podria tratarse de un error de registro o de un artefacto de republicacion.
- Sin garantias de reproducibilidad: no hay semillas, configuraciones ni versiones de dependencias publicadas.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero si existe el riesgo equivalente de generar estructuras no diseables o inestables, que requieren validacion experimental.
- Licencia MIT: permisiva y apta para uso comercial, pero al no existir documentacion sobre el origen de los datos de entrenamiento no se puede evaluar el riesgo de contaminacion o de restricciones derivadas de terceros.
- No apto para produccion sin validacion previa: cualquier uso en un pipeline real deberia acompanarse de filtrado computacional y confirmacion experimental.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/chentong/proteus2
- Perfil del autor en Hugging Face: https://huggingface.co/chentong
- Listado de modelos del autor: https://huggingface.co/chentong/models
- Repositorio `chentong/proteus2_weights`: https://huggingface.co/chentong/proteus2_weights
- Repositorio `chentong/proteus_flow_matching`: https://huggingface.co/chentong/proteus_flow_matching
- GitHub del proyecto Proteus: https://github.com/Wangchentong/Proteus
- README del proyecto Proteus: https://github.com/Wangchentong/Proteus/blob/master/README.md
- Poster ICML 2024: https://icml.cc/virtual/2024/poster/34422
