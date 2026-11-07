# OpenRAL/rskill-molmoact2-multi-so101-nf4

## Resumen

rskill-molmoact2-multi-so101-nf4 es un paquete de pesos cuantizados en NF4 (4 bits) publicado por OpenRAL a partir de `allenai/MolmoAct2-SO100_101`, el modelo vision-language-action (VLA) de Ai2 especializado en manipulacion de sobremesa con los brazos roboticos SO-100 y SO-101. El modelo base combina el backbone VLM Molmo2-ER, orientado a razonamiento encarnado, con un experto de accion continuo basado en flow-matching de estilo DiT, conectado al VLM mediante condicionamiento por capa sobre la cache KV (arXiv:2605.02881).

La relevancia de esta publicacion es practica: el checkpoint original ronda los 5.500 millones de parametros y no cabe en GPUs de consumo; la version NF4 reduce el peso a unos 4,2 GB de repositorio y declara un minimo de 4 GB de VRAM, lo que permite ejecutar inferencia de politica robotica en tarjetas de 8 GB. El modelo emite chunks de 10 acciones de posicion articular absoluta de 6 grados de libertad (5 articulaciones + pinza), consumiendo dos flujos RGB mas el estado propioceptivo de 6 dimensiones.

La licencia es Apache-2.0 tanto en codigo como en pesos, lo que habilita uso comercial. Existe una restriccion operativa relevante: el formato NF4 solo se carga con el paquete de cuantizacion de OpenRAL Pro, ya que la version open source de OpenRAL carga exclusivamente fp32, fp16 y bf16 segun la ADR-0123 del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: VLM Molmo2-ER (transformer, tokens discretos) + experto de accion continuo flow-matching estilo DiT con condicionamiento por capa sobre cache KV |
| Parametros totales | 3.255.388.479 (safetensors del repo); la model card del autor declara ~5,5 B para el modelo base |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 (4 bits) mediante bitsandbytes; el repo incluye tambien tag de 8-bit; el runtime open source solo carga fp32, fp16 y bf16 |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (prequantized pack NF4), libreria transformers con custom code en el modelo base |
| Tamano del repositorio | 4,2 GB |
| Pipeline | robotics (image-text-to-text) |
| VRAM minima declarada | 4,0 GB |
| Latencia declarada | 1000 ms |
| Entrenamiento | Fine-tuning sobre mezcla de teleoperacion SO-100/SO-101 con posicion articular absoluta e instrucciones de lenguaje anotadas |

## Arquitectura y entrenamiento

MolmoAct2 injerta un experto de accion continuo de tipo DiT con flow-matching sobre el VLM Molmo2-ER, que trabaja con tokens discretos. La conexion entre ambos modulos se realiza mediante condicionamiento por capa sobre la cache KV del VLM, de forma que el experto de accion consume el estado interno del backbone linguistico-visual en cada capa en lugar de una unica representacion agregada. El resultado es un chunk de acciones de forma `(10, 6)` en posicion articular absoluta, que el adaptador reproduce paso a paso y reinfiere cuando la cola se vacia.

El checkpoint `allenai/MolmoAct2-SO100_101` parte del modelo fundacional `allenai/MolmoAct2` y se afina sobre la mezcla de teleoperacion SO-100/SO-101 con control por pose articular absoluta e instrucciones de lenguaje anotadas. No se dispone de datos sobre numero de tokens, composicion exacta del dataset ni uso de RLHF o DPO. El paquete de OpenRAL no reentrena: cuantiza el modelo base a NF4 con bitsandbytes, superpone el pack prequantizado y lo ejecuta a traves de la API `predict_action(...)` del propio checkpoint, construyendo el grafo desde el codigo vendorizado de lerobot 0.6.0 (`MolmoAct2ForConditionalGeneration` y `MolmoAct2Processor`) para evitar ejecucion de codigo remoto.

Una particularidad critica es el `norm_tag`: las estadisticas de normalizacion de este checkpoint estan etiquetadas como `"so100_so101_molmoact2"` y viajan en el bloque `image_preprocessing` del manifiesto. El adaptador resuelve `vla.extra.norm_tag` → manifiesto → valor por defecto `"libero"`, y usar las estadisticas de `"libero"` produce acciones invalidas con este checkpoint.

## Capacidades

- Manipulacion de sobremesa: pick, place, pick_and_place y grasp sobre objetos diversos en escenas de mesa.
- Control de brazos SO-100 y SO-101 follower mediante chunks de 10 acciones de posicion articular absoluta de 6 dimensiones.
- Entrada multimodal: dos flujos RGB (vista cenital y vista de muneca/lateral) mas estado propioceptivo de 6 dimensiones (5 articulaciones en grados y pinza en escala LeRobot [0, 100]).
- Razonamiento espacial 3D sobre la escena heredado del backbone Molmo2-ER.
- Seguimiento de instrucciones de lenguaje anotadas, fruto del fine-tuning sobre la mezcla de teleoperacion.
- Ejecucion en GPUs de 8 GB gracias a la cuantizacion NF4.
- No soporta tool calling, function calling ni razonamiento multi-paso agentico en el sentido de un LLM de proposito general; su salida es accion motora, no texto.

## Casos de uso

- Pick-and-place en linea de montaje de laboratorio: el modelo recibe la vista cenital y la de muneca y emite el chunk de 10 posiciones articulares que el adaptador reproduce paso a paso, adecuado para tareas repetitivas de recogida y deposito sobre mesa.
- Clasificacion y traslado de piezas en entornos de investigacion: con 4 GB de VRAM minima puede ejecutarse en la propia estacion de trabajo que controla el brazo, sin servidor GPU dedicado.
- Prototipado rapido de politicas SO-101: al estar empaquetado como rSkill con manifiesto, permite comprobar capacidades, licencia y presupuesto de latencia antes de desplegar en el robot.
- Grasp de objetos diversos en mesa: el modelo cubre explicitamente la accion grasp sobre objetos de sobremesa variados, util para tareas de alimentacion de contenedores o bandejas.
- Docencia y reproduccion de experimentos VLA: el paquete Apache-2.0 y el adaptador sin codigo remoto facilitan montar practicas con hardware SO-100/SO-101 de bajo coste.
- Evaluacion comparativa de cuantizacion: sirve para medir la perdida de exito al pasar de bf16 a NF4 en una politica VLA real, dado que el mirror mantiene la misma API `predict_action(...)`.
- Integracion en pipelines de simulacion: el adaptador `molmoact2` de OpenRAL permite cargar el checkpoint en `openral_sim` con las estadisticas de normalizacion correctas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito por tarea ni comparaciones numericas, y marca el soporte para SO-101 follower como experimental, indicando que las cifras no se han reproducido localmente. Los unicos datos de rendimiento declarados son la latencia de 1.000 ms y la VRAM minima de 4,0 GB.

## Requisitos de hardware

- VRAM minima declarada por el autor: 4,0 GB; el objetivo de la cuantizacion es caber en GPUs de 8 GB.
- Peso del repositorio: 4,2 GB en safetensors NF4, mas overhead de activaciones y de las dos camaras.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; en el limite inferior, tarjetas de 8 GB como RTX 3070 o RTX 4060.
- GPU de datacenter: A100, H100 y L40S sobradas para inferencia, utiles si se ejecutan varias instancias en paralelo.
- Despliegue: runtime PyTorch con bitsandbytes y transformers; el adaptador de OpenRAL construye el grafo desde lerobot 0.6.0 y no requiere `OPENRAL_ALLOW_REMOTE_CODE`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a este tipo de politica.
- Carga de pesos NF4: requiere el paquete de cuantizacion de OpenRAL Pro; la version open source solo admite fp32, fp16 y bf16.
- Latencia declarada: 1.000 ms por inferencia de chunk; el throughput depende de la frecuencia de reinferencia al vaciarse la cola de 10 acciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenRAL/rskill-molmoact2-multi-so101-nf4 | 3,26 B en safetensors (repo); ~5,5 B declarados en la model card | no disponible | VLA flow-matching sobre Molmo2-ER, cuantizado NF4 | Apache-2.0 | Hugging Face, requiere OpenRAL Pro para NF4 |
| allenai/MolmoAct2-SO100_101 | ~5,5 B | no disponible | VLA flow-matching sobre Molmo2-ER, precision completa | Apache-2.0 | Hugging Face, modelo base del anterior |
| OpenRAL/rskill-molmoact2-so101-nf4 | no disponible | no disponible | Variante del mismo paquete para SO-101 | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estos modelos entre si ni frente a alternativas de otros autores.

## Limitaciones y advertencias

- El soporte para SO-101 follower esta marcado como experimental y las cifras no se han reproducido localmente; el soporte para SO-100 aparece truncado en la model card disponible.
- Riesgo alto de acciones invalidas si se usa el `norm_tag` por defecto `"libero"`: es obligatorio que el manifiesto aplique `"so100_so101_molmoact2"`.
- La carga de pesos NF4 exige OpenRAL Pro; sin ese paquete no se puede ejecutar el checkpoint tal cual se publica.
- Idioma: solo ingles en las instrucciones; no hay soporte multilingue documentado.
- Ambito muy restringido: unicamente escenas de sobremesa y los brazos SO-100/SO-101; no es un modelo de proposito general ni un LLM conversacional.
- No se han publicado tasas de exito, sesgos ni evaluaciones de robustez; la cuantizacion NF4 puede degradar la precision del chunk de acciones y no hay datos que cuantifiquen esa perdida.
- La latencia de 1.000 ms por chunk limita la frecuencia de control a aproximadamente 1 Hz si se reinfiere en cada paso; el replay de la cola de 10 acciones mitiga el problema pero introduce desfase ante cambios bruscos de la escena.
- La model card declara `inference: false` en los metadatos, lo que refleja que el paquete necesita el runtime y el manifiesto de OpenRAL para funcionar.
- Aunque la licencia Apache-2.0 permite uso comercial, la dependencia de OpenRAL Pro para el formato NF4 condiciona el despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenRAL/rskill-molmoact2-multi-so101-nf4
- Variante para SO-101: https://huggingface.co/OpenRAL/rskill-molmoact2-so101-nf4
- Modelo base: https://huggingface.co/allenai/MolmoAct2-SO100_101
- Modelo fundacional: https://huggingface.co/allenai/MolmoAct2
- Paper: https://arxiv.org/abs/2605.02881
