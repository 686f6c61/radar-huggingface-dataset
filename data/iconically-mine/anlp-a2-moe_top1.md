# iconically-mine/anlp-a2-moe_top1

## Resumen

`iconically-mine/anlp-a2-moe_top1` es un transformer de tipo Mixture of Experts con enrutado top-1, publicado por el usuario `iconically-mine` en HuggingFace. Se trata de un checkpoint de caracter educativo: la propia model card lo identifica como la tarea 1 de un curso de Procesamiento de Lenguaje Natural Avanzado (ANLP A2), no como un modelo destinado a produccion. El modelo tiene 12,94 millones de parametros totales, una configuracion interna de d_model=256, 6 capas, 8 cabezas de atencion y una dimension oculta de FFN de 1024.

Se entreno sobre 30 millones de tokens y alcanzo una perdida de validacion final de 4,0754, que es el unico dato de rendimiento publicado. El repositorio ocupa 0,1 GB y contiene un unico checkpoint en formato PyTorch (`moe_top1_final.pt`), que requiere cargarse con `torch.load` y el codigo del modelo incluido en `src/part1/model/transformer.py`. No dispone de pipeline declarado, licencia, idiomas ni tarjeta de uso adicional.

Su relevancia es acotada: sirve como referencia reproducible para estudiar implementaciones de MoE top-1 a pequena escala y para comparar el coste de enrutado de expertos en un entorno de recursos minimos. No es un candidato para despliegue real, atencion al cliente o generacion de codigo en produccion: el tamano del modelo y la ausencia de evaluaciones estandar lo desaconsejan de forma clara.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con FFN de tipo Mixture of Experts y enrutado top-1 (`ffn_type: moe_top1`) |
| Parametros totales | 12,94 M |
| Parametros activos | no disponible (el enrutado top-1 activa un unico experto por token, pero la model card no indica el numero de expertos ni su dimension individual) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuye el checkpoint en precision original de PyTorch; no hay versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`moe_top1_final.pt`, cargable con `torch.load`) |
| Configuracion interna | d_model=256, n_layers=6, n_heads=8, ffn_hidden_dim=1024 |
| Tokens de entrenamiento | 30,00 M |
| Perdida de validacion final | 4,0754 |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder de 6 capas con d_model=256 y 8 cabezas de atencion. La innovacion respecto a un transformer denso equivalente es la capa feed-forward: en lugar de una unica FFN, se usa una capa MoE con enrutado top-1, de modo que por cada token se selecciona una sola ruta de las disponibles. Con `ffn_hidden_dim=1024` como dimension de referencia de la FFN, el modelo mantiene un coste de computo por token bajo en la practica, aunque el numero de expertos y el reparto de parametros entre ellos no se detalla en la informacion disponible, por lo que no es posible calcular la proporcion real de parametros activos sobre los 12,94 M totales.

El entrenamiento cubre 30 millones de tokens, un volumen muy reducido que situa al modelo en el rango de los experimentos de viabilidad mas que de los modelos de uso general. No se documenta la composicion del dataset, ni si hubo fases de ajuste fino con RLHF, DPO o instrucciones, ni el tokenizador empleado. La unica metrica reportada es la perdida de validacion final de 4,0754, un valor coherente con un modelo pequeno entrenado con pocos datos y que, sin una linea base comparable, resulta dificil de interpretar de forma aislada.

## Capacidades

- Generacion de texto a nivel de modelado de lenguaje: al no haberse publicado fases de ajuste por instrucciones, la capacidad esperable es la de continuacion de secuencia, no la de seguir ordenes.
- Razonamiento y matematicas: no disponible; no hay evaluaciones ni ejemplos que respalden estas capacidades.
- Generacion de codigo: no disponible; no hay evidencia ni ajuste especifico documentado.
- Vision o audio: no soportado; la model card solo describe un transformer de texto.
- Tool calling / function calling: no soportado ni documentado.
- Uso como agente o razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles; se desconoce el idioma o idiomas del corpus de entrenamiento.
- Modo de razonamiento extendido (thinking mode): no disponible.
- Valor como material didactico: implementacion de referencia de una capa MoE top-1 sobre un transformer pequeno, con codigo fuente asociado.

## Casos de uso

- Estudio de enrutado MoE top-1 en el aula: el modelo permite inspeccionar que experto se activa por token y medir el desequilibrio de carga entre expertos en un entorno que cabe en cualquier portatil, usando el checkpoint y el codigo de `src/part1/model/transformer.py`.
- Reproduccion de experimentos academicos: al estar fijados los hiperparametros (6 capas, d_model=256, 8 cabezas, 30 M tokens) y la perdida de validacion, sirve como punto de partida para replicar resultados o comparar variantes de enrutado.
- Pruebas de ablacion sobre el coste del enrutado: con 12,94 M parametros se puede medir el sobrecoste de la seleccion de expertos frente a una FFN densa equivalente sin necesidad de GPU de gama alta.
- Docencia sobre tokenizacion y pipelines de datos: el modelo es lo bastante pequeno para entrenarlo y evaluarlo en una sola sesion practica, lo que lo hace util para ilustrar el impacto del volumen de tokens en la perdida.
- Validacion de infraestructura de entrenamiento: sirve como caso de prueba para verificar que un bucle de entrenamiento distribuido o un pipeline de checkpoints funciona antes de escalar a modelos mayores.
- Prototipado de interfaces de inferencia: se puede integrar en un script local con `torch.load` para comprobar el flujo completo de carga, generacion y post-procesado antes de migrar a un modelo de produccion.
- No se recomienda su uso en atencion al cliente, generacion de codigo, resumen de documentos, traduccion ni ninguna tarea orientada a usuario final, debido a su tamano, a la falta de ajuste por instrucciones y a la ausencia de evaluaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es la perdida de validacion final durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida de validacion final | 4,0754 |
| Tokens de entrenamiento | 30,00 M |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Cualquier otro benchmark estandar | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: los 12,94 M de parametros ocupan aproximadamente 52 MB en fp32, 26 MB en fp16/bf16 y unos 13 MB en int8. En la practica, el consumo agregado con activaciones y estado del runtime se mantiene muy por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente, incluidas GTX 1050, GTX 1650, RTX 3050, RTX 4060 y superiores. Tambien funciona en CPU sin dificultad apreciable.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo moderna e incluso en muchas integradas, y tambien en CPU y en dispositivos tipo Raspberry Pi para pruebas de carga.
- Opciones de despliegue: no existe soporte directo en vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, porque solo se publica un checkpoint `.pt` de PyTorch con codigo propio. El despliegue requiere cargar el estado con `torch.load` y ejecutar el modelo con el codigo de `src/part1/model/transformer.py`, o bien convertir los pesos a otro formato manualmente.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones. Dado el tamano, el cuello de botella sera el codigo Python de enrutado y el tokenizador, no la computacion matricial.
- Almacenamiento: el repositorio completo ocupa 0,1 GB.

## Comparativa con modelos similares

No existe un conjunto claro de alternativas equivalentes en la misma categoria (MoE top-1 educativo de ~13 M de parametros). A modo de referencia orientativa con transformadores densos de escala comparable, se incluye la siguiente tabla; los datos de rendimiento de este modelo no estan publicados, por lo que no es posible comparar calidad.

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iconically-mine/anlp-a2-moe_top1 | 12,94 M | no disponible | Transformer MoE top-1 | no disponible | HuggingFace (0,1 GB, checkpoint PyTorch) |
| GPT-2 small | 124 M | 1024 tokens | Transformer denso | MIT | HuggingFace, ampliamente soportado |
| Pythia-14M | 14 M | 2048 tokens | Transformer denso | Apache-2.0 | HuggingFace, con suite completa de evaluaciones |

La comparacion con GPT-2 small y Pythia-14M es aproximada y se aporta solo como referencia de escala: el primero es diez veces mayor y el segundo pertenece a una familia con documentacion y evaluaciones extensas, mientras que `anlp-a2-moe_top1` carece de ambas cosas. No se dispone de datos que permitan afirmar superioridad o inferioridad de rendimiento frente a ellos.

## Limitaciones y advertencias

- Modelo de proposito educativo: la propia model card lo enmarca en una tarea de curso (ANLP A2, Task 1), sin indicios de validacion para uso real.
- Sesgos conocidos: no documentados, pero al desconocerse la composicion del corpus de entrenamiento no se puede descartar la presencia de sesgos de genero, raza, religion u origen.
- Riesgo de alucinacion: alto en cualquier tarea de respuesta factual, dado el volumen reducido de entrenamiento (30 M tokens) y la ausencia de ajuste por instrucciones.
- Limitaciones de contexto e idioma: se desconoce la longitud de contexto soportada y los idiomas del corpus; no hay garantia de comportamiento correcto en castellano.
- Licencia: no disponible. Al no especificarse, no existe autorizacion explicita de uso comercial; se debe contactar con el autor antes de cualquier uso fuera del ambito academico.
- Ausencia de benchmarks: no hay MMLU, HumanEval, GSM8K ni ninguna otra evaluacion estandar, por lo que no es posible estimar su calidad de forma objetiva.
- Formato no estandar: el unico artefacto es un checkpoint `.pt` que depende de codigo externo (`src/part1/model/transformer.py`) para cargarse; no hay versiones GGUF, safetensors ni integracion con servidores de inferencia.
- Sin mantenimiento aparente: 0 descargas, 0 likes y una unica actualizacion registrada poco despues de la creacion, lo que sugiere que no habra soporte ni correcciones.
- No apto para produccion: no debe desplegarse en sistemas que atiendan a usuarios finales ni en pipelines que requieran fiabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iconically-mine/anlp-a2-moe_top1
- Codigo del modelo: referenciado en la model card como `src/part1/model/transformer.py`, sin URL publica disponible
- Paper, blog, repositorio o demo: no disponible; la busqueda web realizada no devolvio ningun resultado relacionado con este modelo (los resultados obtenidos correspondian a contenidos no relacionados sobre ChatGPT)
