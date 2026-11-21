# KaiyueWen/AC2-FineProofs-step60-resume

## Resumen

AC2-FineProofs-step60-resume es un checkpoint de estado de entrenamiento del modelo AC² (AC2), exportado tras el paso 60 del optimizador dentro de la ejecución `08_13_tiedq_seed192` del artículo original de AC² sobre el conjunto de datos FineProofs-RL. No se trata de un modelo listo para inferencia, sino de un volcado de estado pensado para reanudar el entrenamiento en el paso 61, con el layout de sharding distribuido en 32 rangos FSDP. Lo publica el usuario KaiyueWen en Hugging Face y el repositorio ocupa 83,9 GB.

El propósito del artefacto es la reproducibilidad y la continuación de un pipeline de aprendizaje por refuerzo orientado a demostraciones formales (proofs). Incluye el modelo actor, los shards del optimizador y del planificador, los estados RNG de worker, los shards del optimizador tied-Q, el cursor del conjunto de datos, el estado AEC, el estado Q y de replay, además de los datos exactos de entrenamiento (parquet de FineProofs, parquet de test de IMO-ProofBench y mapa de validación) y un manifiesto `resume_manifest.json` con tamaños y hashes SHA-256.

La relevancia es acotada: sirve a quien quiera auditar o reanudar la ejecución concreta del paper, no a quien busque un modelo desplegable. La model card no declara arquitectura, número de parámetros, contexto, licencia ni idiomas, de modo que la mayoría de las especificaciones habituales quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint de estado de entrenamiento de AC²; no se declara la arquitectura del actor) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene shards FSDP en precisión de entrenamiento, no pesos cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | shards FSDP (32 rangos) junto con estado de optimizador, planificador, RNG, dataset cursor, AEC, Q y replay; manifiesto `resume_manifest.json` con SHA-256 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo actor. Lo que sí se documenta es el esquema de entrenamiento: una ejecución de aprendizaje por refuerzo (RL) sobre FineProofs-RL, con un actor entrenado y un componente tied-Q con su propio optimizador, estados de replay y un juez (judge) fijado como dependencia externa. El checkpoint corresponde al paso global 60 y el siguiente paso del optimizador es el 61.

El estado exportado es exhaustivo a nivel de reanudación: incluye shards del actor, del optimizador y del planificador, RNG de workers, cursor del dataset, estado AEC, estado Q y de replay, y un directorio `cold` con los manifiestos y shards semilla vacíos originales usados para reconstruir los buffers. El historial contiene exactamente los pasos de dataset 0 a 59 en ambos flujos append-only. Una limitación declarada explícitamente es que el padre no serializó su RNG de driver independiente: una rama de continuación debe inicializar un nuevo RNG de driver y registrar esa elección, lo que rompe la reproducibilidad bit a bit respecto al entrenamiento original.

## Capacidades

- No es un modelo de inferencia: el artefacto es un estado de entrenamiento, no un checkpoint desplegable con pesos finales listos para servir.
- Reanudación de entrenamiento: permite continuar la ejecución `08_13_tiedq_seed192` desde el paso 61 con layout de 32 rangos FSDP.
- Reproducibilidad parcial: incluye hashes SHA-256 en `resume_manifest.json` para verificar la integridad de los shards.
- Reconstrucción de buffers: el directorio `cold` permite reconstruir los buffers desde los manifiestos semilla originales.
- Datos incluidos: parquet exacto de entrenamiento de FineProofs, parquet de test de IMO-ProofBench y mapa de validación referenciados en el manifiesto de entrenamiento de Marlowe.
- Dependencias externas: el actor base público y el runtime del juez fijado se distribuyen por separado y no forman parte del repositorio.
- Capacidades de generación, razonamiento, código, tool calling, agentes o multilingüismo: no disponibles en la información proporcionada.

## Casos de uso

- Reanudación de una ejecución de RL: cargar los shards en un entorno con 32 rangos FSDP y continuar el entrenamiento desde el paso 61, inicializando un nuevo RNG de driver y registrando la decisión.
- Auditoría de reproducibilidad: verificar los hashes SHA-256 del manifiesto contra los shards descargados para confirmar que el estado no ha sido alterado.
- Investigación sobre RL para demostraciones formales: usar el estado y los datos de FineProofs incluidos para estudiar la dinámica de entrenamiento de AC² en los primeros 60 pasos.
- Evaluación comparativa de checkpoints intermedios: emparejar este estado con el actor base público y el juez fijado para evaluar el comportamiento en IMO-ProofBench con el parquet de test incluido.
- Reconstrucción de buffers desde cero: emplear el directorio `cold` para regenerar los manifiestos semilla y validar que la reconstrucción coincide con el estado original.
- Depuración de pipelines distribuidos: analizar el layout de 32 rangos FSDP, los shards de optimizador y planificador, y los estados de replay para diagnosticar problemas de sincronización en entrenamientos RL a gran escala.
- Docencia y experimentación: partir de un estado intermedio real de un pipeline RL para prácticas de reanudación y branching sin necesidad de entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: 83,9 GB para el repositorio completo; hay que prever espacio adicional para el actor base y el runtime del juez, que son dependencias separadas.
- VRAM: no disponible. Al ser un estado de entrenamiento con shards FSDP en 32 rangos, el requisito real depende del tamaño del actor y del optimizador, que no se declaran.
- GPU recomendadas: no disponible. El layout FSDP de 32 rangos sugiere un clúster multi-GPU, pero no se especifican modelos concretos (A100, H100, RTX 4090 u otros).
- GPU de consumo: no disponible; no puede confirmarse que quepa en una GPU de consumo.
- Opciones de despliegue: no aplica como modelo de inferencia. Para reanudar el entrenamiento se necesita el stack de entrenamiento original (FSDP) y el manifiesto de Marlowe; vLLM, llama.cpp, Ollama o TGI no son aplicables a este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo de artefacto | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AC2-FineProofs-step60-resume | Checkpoint de estado de entrenamiento RL (paso 60, 32 rangos FSDP) | no disponible | no disponible | no disponible | Hugging Face, 0 descargas, 0 likes |
| AC² (ejecución original del paper) | Entrenamiento RL sobre FineProofs-RL | no disponible | no disponible | no disponible | Referenciado en la model card; artefacto no localizado en la búsqueda |
| Modelos comparables de demostración formal | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo desplegable: no contiene pesos finales listos para inferencia ni instrucciones de uso como tal.
- Reproducibilidad incompleta: el padre no serializó su RNG de driver independiente, por lo que una rama debe inicializar uno nuevo y registrar la elección; el entrenamiento no será idéntico bit a bit.
- Dependencias externas no incluidas: el actor base público y el runtime del juez fijado se distribuyen por separado, lo que condiciona cualquier reproducción.
- Licencia no declarada: no puede confirmarse el uso comercial ni la redistribución; tratar como restringido hasta verificar.
- Idiomas no declarados: no puede evaluarse el soporte multilingüe.
- Sesgos y alucinación: no evaluables sin un modelo de inferencia y sin benchmarks publicados.
- Fecha de creación anómala (2026-11-21): conviene verificar la procedencia y la integridad del repositorio antes de confiar en él.
- Cero descargas y cero likes: sin validación comunitaria; el estado no ha sido contrastado por terceros.
- Requisitos de hardware desconocidos: el tamaño del actor y del optimizador no se declara, lo que impide estimar VRAM y coste de reanudación.

## Enlaces

- Hugging Face: https://huggingface.co/KaiyueWen/AC2-FineProofs-step60-resume
- Manifiesto de reanudación (referenciado en la model card, dentro del repo): `resume_manifest.json`
- Paper de AC²: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Blog o demo: no disponible en la información proporcionada
