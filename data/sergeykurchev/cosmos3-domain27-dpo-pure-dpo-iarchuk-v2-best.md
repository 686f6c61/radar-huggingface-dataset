# SergeyKurchev/cosmos3-domain27-dpo-pure-dpo-iarchuk-v2-best

## Resumen

`SergeyKurchev/cosmos3-domain27-dpo-pure-dpo-iarchuk-v2-best` es un artefacto de pesos publicado en HuggingFace por el usuario SergeyKurchev. No se trata de un modelo completo ni autonomo: la model card lo describe explicitamente como el mejor artefacto de una ablation de DPO contrastivo puro, correspondiente a la ronda 4 y a la iteracion `iter_000000075`. El repositorio contiene cinco tensores entrenados de proyeccion de accion (`action2llm`, `llm2action` y `action_modality_embed`) y un manifiesto JSON con las formas de los tensores, las metricas, la iteracion de origen, el checkpoint base y el SHA-256.

El problema que resuelve es acotado: permite reproducir y evaluar una variante concreta de un entrenamiento con preferencias (DPO) sobre un modelo base de la familia Cosmos3 orientado a acciones. Los dos unicos numeros publicados son DTW/path = 25,517 mm y RMSE de posicion absoluta = 29,223 mm, ambos en milimetros, lo que situa la evaluacion en el dominio de trayectorias o posiciones fisicas. No se declaran parametros, contexto, idiomas ni arquitectura del modelo subyacente.

Su relevancia es metodologica mas que de producto: sirve como evidencia reproducible de una ablation concreta y como punto de partida para quien quiera aplicar estas cabezas de accion sobre el checkpoint base. El repositorio tiene 0 descargas y 0 likes, y fue creado el 2026-09-21 segun los metadatos de HuggingFace, por lo que no cuenta con validacion de la comunidad. La licencia declarada es `other`, sin terminos detallados en la informacion disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el artefacto no es un modelo, sino cabezas de proyeccion de accion para un modelo Cosmos3; arquitectura del modelo base no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica / no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | tensores PyTorch (`pytorch` como `library_name`); el flag de carga es `--action-heads-pt`; safetensors no confirmado |
| Contenido del repositorio | cinco tensores de proyeccion de accion (`action2llm`, `llm2action`, `action_modality_embed`) mas un manifiesto JSON |
| Tamano del repositorio | 0,0 GB segun HuggingFace |
| Checkpoint base requerido | `/data/checkpoints/domain27_base_for_dpo` (base pre-DPO derivado de domain30) |
| Iteracion de origen | ronda 4, `iter_000000075` |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos HF) | 2026-09-21T15:48:36Z |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo subyacente. Lo que si se detalla es la naturaleza del artefacto: cinco tensores entrenados que actuan como cabezas de proyeccion de accion. Los nombres `action2llm` y `llm2action` sugieren dos proyecciones simetricas entre un espacio de acciones y el espacio latente del modelo de lenguaje o del modelo base, mientras que `action_modality_embed` apunta a una embedding de modalidad especifica para acciones. Estas cabezas se aplican sobre el checkpoint `/data/checkpoints/domain27_base_for_dpo`, descrito como base pre-DPO derivado de domain30, mediante `model_server.py --action-heads-pt`.

El entrenamiento indicado es "pure contrastive-DPO", es decir, una ablation de optimizacion directa de preferencias con formulacion contrastiva, sin mezcla con otras tecnicas segun el nombre del experimento. El artefacto publicado corresponde a la mejor iteracion de la ronda 4. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF adicional, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. Tampoco se confirma oficialmente que el modelo base sea un miembro de la familia NVIDIA Cosmos: solo se deduce del nombre del repositorio, y esto no esta verificado en la informacion proporcionada.

## Capacidades

- Generacion de acciones o trayectorias: el artefacto aporta las proyecciones necesarias para que el checkpoint base emita acciones, segun la nomenclatura de los tensores y las metricas de tipo trayectoria publicadas. Esta capacidad depende por completo del checkpoint base y no existe de forma autonoma.
- Evaluacion de politicas de accion: las metricas DTW/path y RMSE de posicion absoluta en milimetros permiten comparar la calidad de trayectorias generadas frente a una referencia.
- Reproduccion de ablations: al estar etiquetado con ronda e iteracion concretas, permite reproducir exactamente esa configuracion del experimento.
- Carga selectiva de cabezas de accion: se integra mediante el flag `--action-heads-pt` de `model_server.py`, lo que facilita el intercambio de cabezas sin recargar el modelo completo.
- Trazabilidad de artefactos: el manifiesto JSON anexo registra formas de tensores, metricas, iteracion de origen, checkpoint base y SHA-256, lo que habilita verificacion de integridad.
- Soporte de tool calling, function calling, agentes, multi-step reasoning, capacidades multilingues, vision, audio y modo de razonamiento explicito: no disponibles en la informacion proporcionada.

## Casos de uso

- Reproduccion de resultados de investigacion: cargar los tensores sobre `/data/checkpoints/domain27_base_for_dpo` y verificar que se obtienen DTW/path = 25,517 mm y RMSE = 29,223 mm, como referencia para comparar futuras variantes de DPO.
- Ablation de funciones de perdida con preferencias: usar este artefacto como linea base "pure contrastive-DPO" frente a otras formulaciones (DPO estandar, IPO, KTO) manteniendo fijo el checkpoint pre-DPO y aislar asi el efecto del objetivo de entrenamiento.
- Ajuste de cabezas de accion sobre un modelo congelado: al ser solo proyecciones, es un candidato natural para experimentos de underfitting/overfitting de la cabeza mientras el cuerpo del modelo permanece fijo.
- Sustitucion de cabezas en un servidor de inferencia: intercambiar este `.pt` por otra ronda o iteracion mediante `--action-heads-pt` para comparar en linea sin reentrenar ni recargar el modelo base.
- Auditoria de integridad de artefactos: validar el SHA-256 del manifiesto JSON antes de desplegar el checkpoint, util en pipelines internos donde se versionan cabezas entrenadas por separado.
- Evaluacion de trayectorias en coordenadas fisicas: emplear las metricas en milimetros como criterio de aceptacion en un banco de pruebas de movimientos, siempre que se disponga del entorno y de la referencia de posicion absoluta correspondiente.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor en la model card son los siguientes, correspondientes al artefacto de la ronda 4, `iter_000000075`:

| Metrica | Valor | Unidad | Notas |
|---|---|---|---|
| DTW/path | 25,517 | mm | Error de alineamiento dinamico temporal sobre la trayectoria |
| RMSE de posicion absoluta | 29,223 | mm | Error cuadratico medio de la posicion absoluta |

No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar, ni tablas comparativas con modelos similares. Tampoco se indica el conjunto de evaluacion, el numero de muestras ni el intervalo de confianza de las dos metricas anteriores, por lo que no es posible valorar su significacion estadistica.

## Requisitos de hardware

- VRAM para el artefacto en si: no disponible; al contener unicamente cinco tensores de proyeccion, el peso del fichero deberia ser reducido, pero el repositorio declara 0,0 GB y no se detalla el numero de parametros de cada tensor.
- VRAM para inferencia real: determinada por el checkpoint base `/data/checkpoints/domain27_base_for_dpo`, cuyas dimensiones no se especifican en la informacion disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable con los datos aportados, ya que depende del modelo base.
- Opciones de despliegue: el autor indica `model_server.py` con el flag `--action-heads-pt`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y es poco probable que sean aplicables a cabezas de accion personalizadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria, ni datos de parametros, contexto, rendimiento o licencia de alternativas. Al tratarse de un artefacto de cabezas de accion ligado a un checkpoint base concreto y no publicado, no existen referencias directas con las que contrastarlo.

## Limitaciones y advertencias

- No es un modelo autonomo: sin `/data/checkpoints/domain27_base_for_dpo` los tensores no producen ninguna capacidad util.
- La ruta del checkpoint base es absoluta y especifica del entorno del autor, lo que complica la reproducion fuera de ese entorno.
- Licencia `other` sin texto de terminos en la informacion disponible: el uso comercial queda en una situacion juridica indeterminada y requiere consultar al autor.
- Ausencia total de validacion externa: 0 descargas y 0 likes en HuggingFace implican que no hay verificacion independiente de los resultados declarados.
- Las dos metricas publicadas (DTW/path y RMSE absoluto) no vienen acompanadas del conjunto de evaluacion ni de su tamano, por lo que podrian no ser representativas.
- La fecha de creacion registrada (2026-09-21) resulta anomala y conviene verificarla antes de citar el artefacto.
- No se declaran idiomas soportados, sesgos, comportamiento ante entradas fuera de distribucion ni riesgos de alucinacion; en un modelo orientado a acciones, el fallo se manifestaria como trayectorias fisicamente invalidas o inseguras.
- El resultado de la ablation es de una unica ronda e iteracion ("round 4", `iter_000000075`); sin la curva completa no puede descartarse sobreajuste a esa iteracion concreta.
- No hay garantia de compatibilidad con versiones futuras de `model_server.py` ni del formato de los tensores.

## Enlaces

- HuggingFace: https://huggingface.co/SergeyKurchev/cosmos3-domain27-dpo-pure-dpo-iarchuk-v2-best
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
- Resultados de busqueda web: la busqueda realizada no devolvio ningun enlace relevante sobre este modelo ni sobre Cosmos3; los resultados obtenidos correspondian a paginas sin relacion con el tema (portales de ALDI SUD), por lo que se omiten.
