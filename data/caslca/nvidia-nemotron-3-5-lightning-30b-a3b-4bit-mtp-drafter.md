# caslca/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-4bit-mtp-drafter

## Resumen

Este repositorio no contiene un modelo de chat autonomo, sino un predictor MTP (multi-token prediction) externo que actua como drafter de decodificacion especulativa para el modelo NVIDIA Nemotron-3.5-Lightning-30B-A3B en su version de 4 bits. Lo publica el usuario de HuggingFace caslca y deriva del bloque MTP nativo presente en la version BF16 oficial de NVIDIA (nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16), del que se extrajeron 270 tensores `mtp.*` para empaquetarlos como artefacto independiente en formato MLX.

El objetivo del modelo es acelerar la decodificacion del modelo destino, un MoE de 30.000 millones de parametros totales y 3.000 millones activos por token segun la nomenclatura A3B, construido sobre la arquitectura hibrida Nemotron-H (capas Mamba-2 combinadas con atencion y bloques MoE de 128 expertos). El drafter propone tokens candidatos que el modelo destino verifica, de modo que el coste por token generado se reduce cuando la tasa de aceptacion es alta.

Su relevancia es fundamentalmente tecnica y experimental: es un artefacto de sonda publicado para que las mediciones realizadas sigan siendo reproducibles. La propia model card lo etiqueta como "PROBE-ONLY", no certificado y no recomendado para servir en produccion, y las pruebas realizadas en un Apple M5 Max de 64 GB se detuvieron en la puerta pre-registrada de 1,3x de aceleracion sin llegar a alcanzarla (1,18x en el mejor de los casos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nemotron_h_mtp`; cabezal MTP con un bloque de atencion y un bloque MoE de 128 expertos, mas `eh_proj` y `lm_head` propio, sobre la arquitectura hibrida Nemotron-H (Mamba-2 + atencion) del modelo destino |
| Parametros totales | no disponible (270 tensores `mtp.*`; fichero `mtp.safetensors` de ~752 MB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | affine int4, group size 64 |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (etiquetada como `other` en HuggingFace), con atribucion a NVIDIA |
| Formato de pesos | safetensors (`mtp.safetensors`), libreria MLX |
| Tamano del repositorio | 0,8 GB |
| Campo `block_size` | 2 |

## Arquitectura y entrenamiento

El artefacto es un bloque MTP de 270 tensores separado del shard 14 del checkpoint BF16 oficial mediante la herramienta `split_nemotron_h_mtp` de un fork de mlx-vlm (rama `nemotron-h-rollback`, commit `d1d57955`). El bloque incluye una capa de atencion, una capa MoE con 128 expertos, la proyeccion `eh_proj` y su propia `lm_head`. Posteriormente se cuantizo en affine int4 con grupo de 64, dando lugar a un fichero de aproximadamente 752 MB. El modelo destino de la comunidad en 4 bits descarta este bloque, por lo que el drafter solo debe emparejarse con el target exacto indicado.

No se reclama ningun entrenamiento: es una extraccion y cuantizacion de pesos preexistentes. El campo `block_size: 2` define el tamano de bloque del cabezal MTP y la decodificacion se apoya en la verificacion del modelo destino, que en las pruebas se realizo con dos variantes de kernel: una reejecucion por posicion del estado Mamba-2 (`d1d57955`) y un kernel de una sola pasada con estados (`nemotron-h-with-states`, commit `dd2a2dcb`). El mecanismo encaja en la familia de tecnicas de decodificacion especulativa tipo MTP/EAGLE, donde el drafter es barato frente al verificador.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa: es su unica funcion; no es un modelo de chat autonomo ni genera texto por si mismo.
- Prediccion multi-token con un bloque MTP derivado del entrenamiento original de NVIDIA (atencion + MoE de 128 expertos).
- Verificacion acoplada al modelo destino Nemotron-3.5-Lightning-30B-A3B-4bit, que es quien valida y acepta o rechaza las propuestas.
- Compatibilidad con flujos de decodificacion especulativa sobre MLX en Apple Silicon, invocable con `--draft-kind mtp --draft-model <repo>`.
- Soporte de estados Mamba-2 por posicion para la verificacion (kernel `with-states`).
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento propio.
- Idiomas soportados: no disponible; al no generar texto de forma autonoma, la cobertura linguistica depende en la practica del modelo destino.

## Casos de uso

- Aceleracion de inferencia local en Mac: el drafter se carga junto al target de 4 bits en MLX para reducir el coste por token generado. Es su proposito declarado, aunque las mediciones propias no superaron la puerta de 1,3x.
- Reproduccion de experimentos de decodificacion especulativa: al publicarse el artefacto medido, un investigador puede repetir las pruebas M14 y M29 sobre el mismo binario y el mismo hardware.
- Evaluacion comparativa de kernels de verificacion: permite contrastar la reejecucion del estado Mamba-2 por posicion frente al kernel de una sola pasada con estados, que fue el unico escenario con ganancia (1,18x).
- Estudio de cabezales MTP en arquitecturas hibridas: util para analizar como se comporta un bloque MoE de 128 expertos usado como proyector de borradores sobre capas Mamba-2.
- Pruebas de sensibilidad a la tasa de aceptacion: con aceptacion cercana a 0,90 y una sola propuesta por ronda, sirve para medir cuando la decodificacion especulativa deja de compensar y se convierte en penalizacion (0,76x observado en la ruta M14).
- Integracion en prototipos de asistentes locales sobre Apple Silicon: solo como componente opcional de aceleracion, nunca como sustituto del modelo destino y siempre con el predictor desactivado por defecto en produccion.

## Benchmarks y rendimiento

Las unicas mediciones publicadas son las de la propia model card, realizadas en un Apple M5 Max de 64 GB el 2026-08-31. No hay datos de MMLU, HumanEval, GSM8K ni de calidad de generacion.

| Sonda | Ruta de verificacion | Aceptacion (1 borrador/ronda) | Decodificacion ON/OFF |
|---|---|---|---|
| M14 | Reejecucion del estado Mamba-2 por posicion (`d1d57955`) | ≈ 0,90 | 0,76x (OFF ≈ 138 tok/s) |
| M29 | Kernel de una pasada con estados (`nemotron-h-with-states` @ `dd2a2dcb`) | ≈ 0,90 | 1,18x |

Ambas sondas se detuvieron en la puerta pre-registrada de 1,3x. No se realizo analisis OFAT de calidad ni certificacion del predictor. El cuello de botella es la fase de verificacion sobre un target que ya decodifica rapido de por si.

## Requisitos de hardware

- Hardware de medida: Apple M5 Max con 64 GB de memoria unificada, ejecutando MLX.
- Espacio adicional en disco y memoria: el repositorio ocupa 0,8 GB y el fichero cuantizado `mtp.safetensors` ronda los 752 MB, que se suman al checkpoint del modelo destino.
- VRAM del modelo destino: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: no aplica directamente; el artefacto esta empaquetado para MLX y la medicion disponible es sobre silicio de Apple, no sobre GPU NVIDIA o AMD.
- Opciones de despliegue: exclusivamente MLX con un fork que incluya el cargador `nemotron_h_mtp`; no se ha validado con vLLM, llama.cpp, Ollama ni TGI.
- Throughput: con el predictor desactivado, aproximadamente 138 tok/s en el M5 Max de 64 GB; con el predictor activado, entre 0,76x y 1,18x respecto a esa cifra segun la ruta de verificacion.
- Latencia: no disponible mas alla de las ratios ON/OFF anteriores.

## Comparativa con modelos similares

No hay datos numericos publicados que permitan comparar este artefacto con otros drafters. La tabla siguiente contrasta el enfoque, no el rendimiento, y deja los valores no publicados como "no disponible".

| Alternativa | Tipo de drafter | Parametros | Contexto | Licencia | Resultados comparables |
|---|---|---|---|---|---|
| Este modelo (MTP drafter) | Cabezal MTP nativo extraido del target, MoE de 128 expertos | 270 tensores, ~752 MB en int4 | no disponible | OpenMDW 1.1 | 0,76x-1,18x medido en M5 Max |
| Drafters tipo EAGLE-3 | Cabezal entrenado especificamente para predecir multiples tokens | no disponible | no disponible | no disponible | no disponible |
| Cabezales tipo Medusa | Multiples cabezales de prediccion sobre el modelo base | no disponible | no disponible | no disponible | no disponible |
| Decodificacion especulativa con n-gramas o auto-especulacion | Sin parametros adicionales; reutiliza el propio modelo | 0 | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Artefacto de sonda: la model card lo marca explicitamente como "PROBE-ONLY — not certified, not recommended for serving". No debe usarse en produccion.
- No es un modelo autonomo: no genera respuestas por si solo y no tiene sentido desplegarlo sin el target exacto `caslca/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-4bit`.
- Riesgo de degradacion: en la ruta M14 el rendimiento cayo a 0,76x, es decir, la decodificacion especulativa penalizo frente a no usarla. Con aceptacion alta pero verificacion costosa, la ganancia no esta garantizada.
- Puerta de rendimiento no alcanzada: la mejora objetivo de 1,3x no se logro en ninguna de las dos rutas medidas.
- Sin validacion de calidad: no se realizo OFAT de calidad, por lo que no hay evidencia de que la salida sea identica a la del target sin predictor; la tolerancia a errores depende del verificador.
- Dependencia de build: requiere un fork de mlx-vlm con el cargador `nemotron_h_mtp` (ramas `nemotron-h-rollback` o `nemotron-h-with-states`); no funciona con MLX estandar ni con otras librerias.
- Acoplamiento estricto: solo debe emparejarse con la version de 4 bits indicada; el bloque se extrajo del checkpoint BF16 y el target de la comunidad descarta ese bloque por diseno.
- Restricciones de plataforma: formato MLX, pensado para Apple Silicon; no hay pesos GGUF ni safetensors genericos para otras runtimes.
- Licencia: OpenMDW 1.1, etiquetada como `other` en HuggingFace, con atribucion a NVIDIA. Deben revisarse los terminos antes de cualquier uso comercial.
- Idiomas y sesgos: no disponible; al no generar texto de forma autonoma, hereda los del modelo destino, no evaluados en la informacion disponible.
- Sin traccion comunitaria: cero descargas y cero "likes" en el momento de la consulta, sin senales de validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/caslca/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-4bit-mtp-drafter
- Modelo base (target de 4 bits): https://huggingface.co/caslca/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-4bit
- Checkpoint BF16 de origen: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos no guardan relacion con el artefacto.
