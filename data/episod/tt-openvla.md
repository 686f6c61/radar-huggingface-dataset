# episod/tt-openvla

## Resumen

tt-openvla es un *bring-up* (port) del modelo OpenVLA-7B sobre hardware Tenstorrent Blackhole, implementado con TT-Metal y TTNN. OpenVLA es un modelo vision-language-action (VLA) orientado a manipulacion robotica que combina un backbone de vision fusionado DINOv2 + SigLIP con un modelo de lenguaje LLaMA-2-7B. El repositorio lo publica el usuario episod y no aloja un checkpoint propio: reutiliza directamente los pesos originales de openvla/openvla-7b sin recortes, conversiones ni fine-tuning adicionales, por lo que es una model card que apunta a la implementacion y al checkpoint real.

El interes tecnico esta en la validacion por etapas: cada componente se comprobo contra una implementacion de referencia real con un coeficiente de correlacion de Pearson (PCC) igual o superior a 0,995, incluyendo DINOv2 ViT-L/14 en su variante con register tokens (PCC 0,9992), SigLIP ViT-So400M/14 (PCC 0,9967), el backbone de vision fusionado (PCC 0,9986), el MLP proyector (PCC 0,99999) y las 32 capas de LLaMA-2-7B (PCC 0,9966). Ademas, se documento una prueba end-to-end ("Grounded Check") que ejecuta una imagen real con el formato de prompt de OpenVLA, una pasada de PREFILL y seis pasos reales de DECODE autoregresivo sobre una malla de dos dispositivos Blackhole, produciendo una accion determinista de 7 grados de libertad.

Su relevancia actual es doble: por un lado demuestra que un VLA de robotica de 7B puede ejecutarse fuera del ecosistema CUDA, sobre aceleradores Tenstorrent; por otro, sirve como referencia de verificacion numerica para portar arquitecturas multimodales complejas a TTNN, documentando incluso dos bugs reales encontrados y corregidos (alineacion de tiles en la atencion de SigLIP y no determinismo en el manejo de output-tiles del bucle de decode).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA): backbone de vision fusionado DINOv2 ViT-L/14 (register tokens) + SigLIP ViT-So400M/14, proyector MLP y LLM LLaMA-2-7B de 32 capas |
| Parametros totales | 7B en el backbone de lenguaje; el total conjunto con los codificadores de vision no esta disponible en la informacion proporcionada |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el port consume los pesos originales y los transforma al formato de TTNN) |
| Idiomas soportados | no disponible |
| Licencia | MIT para el codigo del port; los pesos de openvla-7b quedan sujetos a la Llama Community License al ser un fine-tune de Llama-2-7B |
| Formato de pesos | no se aloja checkpoint propio; se usan los pesos originales de openvla/openvla-7b y se ejecutan mediante TT-Metal/TTNN |

## Arquitectura y entrenamiento

La arquitectura combina dos torres de vision (DINOv2 ViT-L/14 en su variante con register tokens y SigLIP ViT-So400M/14) cuyas salidas se fusionan mediante el mecanismo de fusion propio de OpenVLA; las embeddings resultantes pasan por un MLP proyector y entran en un backbone LLaMA-2-7B de 32 capas que genera acciones de robot. El port reutiliza los kernels `tt_transformers` de tt-metal para atencion, RoPE y cache KV, en lugar de reimplementarlos, lo que reduce la superficie de error del bring-up.

No hay entrenamiento nuevo: segun la model card, no se hizo stripping, conversion ni fine-tuning, y se emplean los pesos ya fine-tuneados de openvla/openvla-7b. Por tanto, la composicion del dataset de entrenamiento, el numero de tokens, el uso de RLHF o DPO y cualquier detalle del pipeline original no estan disponibles en la informacion proporcionada. La innovacion tecnica del repositorio es de ingenieria de portado: verificacion etapa por etapa con PCC, replicacion del mecanismo real de fusion multimodal y correccion de dos bugs especificos del hardware, uno de alineacion de tiles en la atencion de SigLIP y otro de determinismo en el bucle de decode.

## Capacidades

- Percepcion visual y generacion de acciones: procesa una imagen (o varias) junto con instrucciones en el formato de prompt documentado por OpenVLA y emite acciones de manipulacion robotica de 7 grados de libertad.
- Inferencia autoregresiva real: el "Grounded Check" ejecuta una pasada de PREFILL y seis pasos de DECODE completos sobre las 32 capas de LLaMA-2-7B, con salida determinista.
- Fusion multimodal DINOv2 + SigLIP: integra dos torres de vision distintas mediante el mecanismo de fusion de OpenVLA, en lugar de usar una sola.
- Ejecucion en aceleradores Tenstorrent: pensado para TT-Metal/TTNN sobre Blackhole, incluyendo configuraciones multi-dispositivo (la validacion se hizo en una malla de dos dispositivos).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): vision como entrada; no hay evidencia de thinking mode ni de audio en la informacion disponible.

## Casos de uso

- Manipulacion robotica en laboratorio: el modelo recibe una imagen del entorno y una instruccion en lenguaje natural y emite una accion de 7-DoF, por lo que puede usarse como politica de control en brazos robot articulados durante experimentos de investigacion.
- Investigacion en portado de hardware: sirve de referencia reproducible para validar la ejecucion de arquitecturas multimodales sobre Tenstorrent, ya que cada etapa tiene una metrica PCC publicada y una implementacion de referencia asociada.
- Verificacion numerica de kernels: el repositorio documenta tests de atencion, RoPE y cache KV reutilizando `tt_transformers`, lo que permite comparar kernels propios de TTNN contra el comportamiento esperado.
- Evaluacion de alternativas a CUDA en robotica: para equipos que quieren medir el coste real de migrar un VLA de 7B a aceleradores no-NVIDIA sin reentrenar el modelo, este port ofrece un punto de partida con una metrica objetiva de fidelidad.
- Reproduccion de experimentos academicos: al usar los pesos originales de openvla-7b sin modificaciones, los resultados obtenidos pueden compararse directamente con trabajos previos de manipulacion basados en OpenVLA.
- Formacion y divulgacion tecnica: la documentacion de bugs encontrados y corregidos (alineacion de tiles, determinismo del decode) es util como material didactico sobre portado de modelos a hardware especializado.
- Desarrollo de *bring-ups* de otros VLA: la metodologia de validacion por etapas con umbrales PCC concretos es reutilizable para portar OpenVLA-OFT, RT-2 u otros modelos de accion robotica a TTNN, aunque esos ports no forman parte de esta publicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval ni GSM8K, que ademas no serian la metrica natural de un VLA). La unica verificacion cuantitativa publicada son los coeficientes de correlacion de Pearson (PCC) frente a la implementacion de referencia real:

| Etapa | Variante / detalle | PCC |
|---|---|---|
| DINOv2 ViT-L/14 | variante con register tokens, la torre que usa OpenVLA | 0,9992 |
| SigLIP ViT-So400M/14 | torre de vision | 0,9967 |
| Backbone de vision fusionado | mecanismo de fusion real de OpenVLA | 0,9986 |
| MLP proyector | pesos fine-tuneados reales | 0,99999 |
| Backbone LLaMA-2-7B | 32 capas, kernels `tt_transformers` (atencion, RoPE, KV-cache) | 0,9966 |
| Prueba end-to-end "Grounded Check" | imagen real + prompt de OpenVLA, 1 PREFILL + 6 DECODE, malla de 2 dispositivos Blackhole | accion 7-DoF determinista, sin PCC reportado |

No hay datos publicados de tasa de exito en tareas de robotica reales ni comparaciones de *throughput* o latencia.

## Requisitos de hardware

- Hardware objetivo declarado: aceleradores Tenstorrent Blackhole. La validacion end-to-end se realizo sobre una malla de dos dispositivos.
- Software necesario: TT-Metal y TTNN, mas los kernels `tt_transformers` de tt-metal. El codigo vive en el directorio `tt/` del repositorio de GitHub.
- VRAM estimada para inferencia: no disponible para el port. Para el checkpoint original de openvla-7b, el orden de magnitud de un modelo denso de 7B es de aproximadamente 14-16 GB en bf16, pero esa cifra no esta confirmada en la informacion proporcionada.
- GPU recomendadas: no disponible. El port no es un artefacto para GPU; el modelo base original de OpenVLA se suele servir en GPU, pero no se aportan especificaciones en esta publicacion.
- Compatibilidad con GPU de consumo: no disponible. La ruta de ejecucion documentada es Tenstorrent, no CUDA.
- Opciones de despliegue: TT-Metal/TTNN sobre Blackhole. No hay evidencia de integracion con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| episod/tt-openvla | 7B en el backbone de lenguaje | no disponible | PCC >= 0,995 por etapa; sin benchmark de tareas | MIT en el codigo del port; pesos sujetos a Llama Community License | Model card sin pesos propios; codigo en GitHub |
| openvla/openvla-7b | 7B | no disponible | no disponible | pesos sujetos a Llama Community License | Checkpoint original en HuggingFace |
| Otros VLA comparables (OpenVLA-OFT, RT-2, Octo) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

La comparativa mas util es contra el propio checkpoint base: tt-openvla no introduce pesos nuevos ni cambios de licencia, sino una implementacion de ejecucion alternativa orientada a hardware Tenstorrent. No hay datos en la informacion proporcionada que permitan comparar rendimiento de tareas con otros VLA.

## Limitaciones y advertencias

- No se aloja ningun checkpoint en el repositorio: si se descarga este espacio esperando pesos, no se obtendra ningun artefacto utilizable por si mismo; hay que acudir a openvla/openvla-7b.
- La licencia MIT cubre unicamente el codigo del port. Los pesos de openvla-7b son un fine-tune de Llama-2-7B y estan sujetos a la Llama Community License, con las obligaciones y restricciones que ello implica para uso comercial.
- El PCC mide fidelidad numerica frente a una implementacion de referencia, no calidad de la politica de robot. Un PCC alto no garantiza tasa de exito en tareas de manipulacion reales.
- No se han publicado datos de sesgos, de alucinacion ni de comportamiento fuera de distribucion para este port.
- La longitud de contexto, los idiomas soportados y los tipos de cuantizacion no estan documentados, lo que limita la planificacion de despliegues en produccion.
- El modelo esta atado a hardware Tenstorrent Blackhole y al stack TT-Metal/TTNN; no hay ruta documentada a GPU, CPU ni a runtimes de inferencia habituales.
- La validacion end-to-end se limita a una imagen, una pasada de PREFILL y seis pasos de decode; no cubre sesiones largas ni control en bucle cerrado.
- El modelo se publica con 0 descargas y 0 likes, por lo que no existe validacion independiente de la comunidad sobre el repositorio.
- Los metadatos del repositorio indican fecha de creacion y actualizacion en 2026-09-10, un valor que conviene contrastar antes de tratarlo como referencia temporal fiable.
- No se documenta si el port funciona con otras configuraciones de malla distintas de la de dos dispositivos utilizada en la validacion.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/episod/tt-openvla
- Repositorio del port (codigo, tests y demo): https://github.com/tsingletaryTT/tt-openvla
- Proyecto OpenVLA: https://github.com/openvla/openvla
- Checkpoint base OpenVLA-7B: https://huggingface.co/openvla/openvla-7b
- Licencia de la comunidad Llama (aplicable a los pesos): https://ai.meta.com/llama/license/

Nota: la busqueda web asociada a este identificador no devolvio resultados relevantes; los enlaces obtenidos correspondian a un negocio de estudios deportivos en Paris sin relacion con el modelo.
