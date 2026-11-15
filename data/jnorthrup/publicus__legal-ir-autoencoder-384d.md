# jnorthrup/Publicus__legal-ir-autoencoder-384d

## Resumen

`jnorthrup/Publicus__legal-ir-autoencoder-384d` es un repositorio de artefactos de representacion intermedia (IR) publicado por el usuario jnorthrup en Hugging Face. No se trata de un modelo fundacional entrenado para inferencia, sino de una coleccion de 87 blobs de checkpoints retenidos que forman parte de un inventario de campana registrado. Cada registro preserva la familia, la dimension externa, el esquema, la tarea, el rol y el hash del checkpoint correspondiente.

La model card es explicita al respecto: son artefactos de decodificador/componente IR con dependencias de codificador registradas, no un modelo GTE upstream recien entrenado. El repositorio conserva los bytes originales de las fuentes, corpus y activos de embedding sin recomputacion, y las dependencias no resueltas quedan declaradas de forma explicita. La publicacion no activa ningun checkpoint para inferencia.

El interes de esta ficha es limitado para quien busque un modelo listo para produccion: se trata de un contenedor de checkpoints intermedios con metadatos de inventario, util unicamente para trazabilidad y auditoria de una campana de entrenamiento concreta. El tamano del repo aparece como 0.0 GB, lo que sugiere que los pesos no estan efectivamente alojados o que el indice apunta a URLs externas inmutables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder de representacion intermedia (IR) con dependencias de codificador registradas; no es un transformer fundacional |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que la licencia original de fuentes y datos queda registrada en los propios activos, sin nueva concesion global) |
| Formato de pesos | blobs de checkpoint retenidos; no se especifica safetensors ni GGUF |
| Dimension de representacion | 384 dimensiones (segun el nombre del repositorio) |
| Checkpoints incluidos | 87 blobs distintos en el inventario de campana |
| Estado de inferencia | ningun checkpoint activado para inferencia |

## Arquitectura y entrenamiento

La informacion disponible describe artefactos de autoencoder de representacion intermedia con una dimension de 384. El repositorio distingue explicitamente entre varios roles de activos: pesos de condicionamiento nativos de 768D, inicializacion heredada, puentes de alineacion e interfaces entrenadas. Esta separacion sugiere un pipeline en el que un codificador produce representaciones de 768 dimensiones que se proyectan o comprimen a un espacio latente de 384 dimensiones mediante un autoencoder, con puentes de alineacion intermedios.

No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del corpus, ni si hubo RLHF, DPO o ajuste supervisado. La model card indica que los activos de fuente, corpus y embedding preservan sus bytes originales sin recomputacion, y que las dependencias no resueltas permanecen explicitas. Tampoco se documenta ninguna innovacion tecnica de inferencia (decodificacion especulativa, atencion lineal, etc.), lo que es coherente con que no se trate de un modelo generativo desplegable.

## Capacidades

- Almacenamiento y trazabilidad de checkpoints intermedios de una campana de entrenamiento concreta.
- Preservacion de metadatos por checkpoint: familia, dimension externa, esquema, tarea, rol y hash.
- Conservacion de activos de fuente, corpus y embedding con sus bytes originales.
- Diferenciacion explicita de roles de activo (pesos de condicionamiento, inicializacion heredada, puentes de alineacion, interfaces entrenadas).
- Registro de dependencias de codificador y de dependencias no resueltas.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni multilingues.
- No se documenta modo thinking ni ninguna capacidad especial de inferencia.

## Casos de uso

- Auditoria de campanas de entrenamiento: el indice de checkpoints registrados permite reconstruir que artefactos se generaron en cada fase y con que hash, lo que facilita la verificacion de integridad en un proceso de revision interna.
- Reproducibilidad de experimentos: al preservar los bytes originales de corpus y embeddings, un equipo puede comparar una ejecucion nueva contra los activos historicos sin recomputacion.
- Trazabilidad de dependencias: el registro explicito de dependencias no resueltas permite identificar que componentes faltan antes de intentar reconstruir un pipeline completo.
- Gestion de linaje de modelos: la distincion entre inicializacion heredada, puentes de alineacion e interfaces entrenadas sirve para documentar el linaje de un modelo derivado en un informe tecnico.
- Archivado a largo plazo: los blobs retenidos con hash inmutable son adecuados para politicas de retencion documental en entornos regulados.
- Base para estudios de representacion intermedia: un investigador puede analizar la geometria de las representaciones de 384 dimensiones frente a las de 768 dimensiones para estudiar la compresion de espacio latente, siempre que localice los pesos efectivos.
- Verificacion de licencias de activos: la model card remite a la licencia original registrada en cada activo, lo que permite auditar derechos de uso antes de reutilizar corpus o embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y el repositorio no esta activado para inferencia, por lo que no procede comparacion cuantitativa.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; ningun checkpoint esta activado para inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.
- Almacenamiento: el tamano del repo figura como 0.0 GB, lo que indica que los pesos podrian no estar alojados localmente y que el indice apunta a URLs externas inmutables.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma categoria en la informacion proporcionada, y la naturaleza del repositorio (inventario de checkpoints intermedios sin inferencia activa) no encaja en una comparativa con modelos fundacionales.

## Limitaciones y advertencias

- No es un modelo desplegable: ningun checkpoint esta activado para inferencia, por lo que no puede usarse directamente para generar texto ni para servir una API.
- Ausencia de licencia declarada: la model card indica que no se hace una concesion global nueva y que la licencia original queda registrada en cada activo, lo que obliga a auditar caso por caso antes de cualquier uso comercial.
- Idiomas no declarados: no hay informacion sobre cobertura linguistica.
- Sin datos de entrenamiento publicados: no se puede evaluar la calidad, el sesgo ni la procedencia del corpus.
- Riesgo de confusion: el nombre del repositorio sugiere un autoencoder de 384 dimensiones, pero la model card advierte que las anchuras ocultas internas no establecen un carril GTE; conviene no interpretar el nombre como especificacion de arquitectura final.
- Dependencias no resueltas: el propio autor declara que algunas dependencias permanecen explicitas y sin resolver, lo que puede impedir la reconstruccion completa del pipeline.
- Sin garantia de reconstruccion: la publicacion no cualifica la reconstruccion exacta de texto original, el runtime del decodificador, el uso como teacher ni la autoridad de prueba.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni de validacion externa.
- Fechas del repositorio: la creacion y actualizacion figuran en 2026-11-15, lo que conviene verificar en la fuente original antes de citar el artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jnorthrup/Publicus__legal-ir-autoencoder-384d
- Indice de checkpoints registrados: releases/20261004-full-retained-campaigns-v1/registered-checkpoints.json
- Model card inicial del repositorio: releases/20261004-full-retained-campaigns-v1/initial-root-readme.md
