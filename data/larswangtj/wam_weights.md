# larswangtj/wam_weights

## Resumen

`larswangtj/wam_weights` no es un modelo entrenado listo para inferencia, sino un repositorio de pesos intermedios (checkpoints) del proyecto "wam". Contiene 934 ficheros `model.pt` guardados con `torch.save`, que suman 256,1 GB, distribuidos en 32 grupos de experimentos (`e7`, `e7d`, `e7r2`, `s1`, `s2`, `s3`, `smoke`, etc.). El autor (larswangtj) lo publica con fecha de creacion y actualizacion en noviembre de 2026, sin model card tecnica, sin pipeline declarado y sin licencia especificada.

La relevancia de este repositorio es limitada para un uso de produccion: no hay informacion sobre arquitectura, numero de parametros, tokenizador, datos de entrenamiento ni procedimiento de carga. La estructura `<group>/<run>/model.pt` sugiere una organizacion por campanas de experimentacion (posiblemente ablaciones de hiperparametros o variantes de un mismo modelo base), y el fichero `manifest.jsonl` actua como indice de rutas y tamanos. Cualquier evaluacion tecnica requiere inspeccionar manualmente los tensores con `torch.load`.

Dado que la model card indica explicitamente que "training data, code and logs are not included" y que los ficheros se ofrecen "as-is, without further documentation", esta ficha debe interpretarse como una descripcion del artefacto de pesos, no de un modelo documentado. Los campos tecnicos que no constan se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `model.pt` de PyTorch, presumiblemente fp32/fp16/bf16 sin confirmar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (serializacion `torch.save`) |
| Tamano del repositorio | 256,1 GB |
| Numero de checkpoints | 934 |
| Grupos de experimentos | 32 |
| Indice de ficheros | `manifest.jsonl` (ruta relativa y tamano en bytes) |
| Pipeline declarado | no disponible |
| Tokenizador incluido | no disponible |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo subyacente: la model card no especifica si se trata de un transformer, un modelo MoE, un SSM o una arquitectura hibrida, ni el numero de capas, dimensiones ocultas o cabezas de atencion. Tampoco se indica el numero de parametros ni el regimen de entrenamiento (preentrenamiento, fine-tuning supervisado, RLHF o DPO).

Lo unico deducible del artefacto es la organizacion experimental: 32 grupos con nombres como `e7`, `e7d` (220 checkpoints, el mas numeroso), `e7r2` (126), `s2` (150), `s1` (49), `e7` (49), `smoke` (2). Esta nomenclatura es consistente con campanas de ablacion (sufijos `d`, `r2`, `s`, `v`, `dark`, `cue`, `pccd`, `pccl`, `pcd`, `pcl`, `rf`, `rfs`, `sel`, `seed`, `x2`) sobre una misma base, probablemente guardando checkpoints intermedios de cada ejecucion. El grupo `smoke` con 2 checkpoints apunta a pruebas de humo iniciales. No se documenta el numero de tokens de entrenamiento, la composicion del dataset ni innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- No se documentan capacidades funcionales del modelo: la model card no describe generacion de texto, razonamiento, codigo, matematicas ni vision.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni razonamiento multi-paso.
- No consta comportamiento multilingue.
- No consta modo "thinking", vision, audio ni ninguna capacidad especial.
- La unica capacidad verificable del artefacto es servir como fuente de checkpoints recuperables mediante `torch.load` para continuar experimentacion o reproducir resultados del proyecto "wam".

## Casos de uso

- Reproduccion de experimentos: cargar los checkpoints de un grupo concreto (por ejemplo `e7d` con 220 ficheros) para replicar las curvas de entrenamiento del proyecto "wam", usando `manifest.jsonl` para localizar cada `model.pt` y su tamano.
- Analisis de ablaciones: comparar los pesos de grupos con sufijos distintos (`e7pcd` frente a `e7pcl`, `e7vd025` frente a `e7vd05`) para estudiar el efecto de una variacion de hiperparametros sobre los tensores finales.
- Extraccion de un checkpoint intermedio: seleccionar un `model.pt` de un run concreto y reutilizarlo como inicializacion para un fine-tuning posterior, siempre que se reconstruya previamente la arquitectura y el tokenizador (no incluidos).
- Investigacion de dinamica de entrenamiento: al conservar multiples checkpoints por run (por ejemplo `e7r2` con 126 ficheros), es posible trazar la evolucion de los pesos a lo largo del entrenamiento y estudiar fenomenos como el olvido catastrofico o la estabilizacion de normas por capa.
- Archivado y auditoria: el repositorio actua como copia de seguridad de 256,1 GB de pesos experimentales; util para equipos que necesiten conservar el estado exacto de una campana antes de liberar recursos de almacenamiento en el cluster original.
- Docencia y formacion: usar los grupos pequenos (`smoke` con 2 checkpoints, `e7vsel` con 4, `e7rf` con 6) como material didactico para practicar la carga de pesos PyTorch y la inspeccion de `state_dict` sin requerir descargas masivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el numero de parametros y la precision de los pesos. Como referencia, 256,1 GB repartidos en 934 ficheros dan una media de aproximadamente 280 MB por checkpoint, pero el tamano por fichero varia y no se detalla en la model card.
- GPU recomendadas: no disponible. La eleccion depende del tamano real del modelo, que no consta.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamano del modelo y la precision de almacenamiento.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. Al tratarse de `model.pt` serializados con `torch.save`, la unica via garantizada es cargarlos con PyTorch y reconstruir manualmente la arquitectura.
- Latencia y throughput: no disponibles.
- Almacenamiento: se requieren al menos 256,1 GB libres para clonar el repositorio completo; conviene usar `huggingface-cli download` con patrones de fichero para bajar solo un grupo.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque la model card no identifica la arquitectura, el tamano ni la tarea del modelo subyacente. Otros repositorios de pesos experimentales (por ejemplo, releases de checkpoints intermedios de proyectos de investigacion) no son directamente comparables sin conocer la familia del modelo.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card tecnica, ni paper, ni codigo de carga, ni tokenizador. La model card original solo describe el layout de ficheros.
- Licencia no especificada: no se puede asumir permiso para uso comercial, redistribucion ni obras derivadas. Es imprescindible contactar con el autor antes de cualquier uso fuera de investigacion privada.
- Riesgo de seguridad al cargar `model.pt`: `torch.load` ejecuta codigo Python arbitrario mediante pickle. Solo debe cargarse en un entorno aislado y, preferiblemente, con `weights_only=True` cuando la version de PyTorch lo permita.
- Pesos no listos para inferencia: sin arquitectura, configuracion ni tokenizador, no es posible ejecutar el modelo de forma directa.
- Sesgos y alucinaciones: no evaluables al no conocerse los datos de entrenamiento ni haberse publicado evaluaciones.
- Idiomas: no consta que el modelo soporte castellano ni ningun otro idioma de forma verificada.
- Fecha de creacion futura (2026-11-27): conviene verificar la integridad y procedencia de los ficheros antes de confiar en ellos.
- Tamano elevado: 256,1 GB dificultan la descarga y el versionado; el uso de `manifest.jsonl` es recomendable para descargas parciales.
- Sin garantias: el autor declara que los ficheros se ofrecen "as-is, without further documentation".

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/larswangtj/wam_weights
- Perfil del autor: https://huggingface.co/larswangtj
- Indice de ficheros: `manifest.jsonl` dentro del propio repositorio
- Paper, blog, repositorio de codigo y demos: no disponibles en la informacion proporcionada
