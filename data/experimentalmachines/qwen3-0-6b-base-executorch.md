# experimentalmachines/Qwen3-0.6B-Base-ExecuTorch

## Resumen

Qwen3-0.6B-Base-ExecuTorch es un repositorio de pesos exportados, publicado por el usuario experimentalmachines, que empaqueta el modelo base Qwen/Qwen3-0.6B-Base (revision `da87bfb608c1`) en formato ExecuTorch `.pte` para inferencia en dispositivo (on-device). No se trata de un modelo nuevo ni de un fine-tune: es una derivacion cuantizada del modelo base de Qwen, pensada para ejecutarse en CPU arm64 de telefonos Android mediante el backend XNNPACK de ExecuTorch 1.4.0, sin necesidad de GPU ni de servidores remotos.

El problema que resuelve es el de desplegar un modelo de ~0,6 mil millones de parametros en moviles con un presupuesto de memoria acotado. Para ello ofrece cuatro ficheros, uno por ventana de contexto fija (2.048, 4.096, 8.192 y 16.384 tokens), cada uno de entre 0,50 GB y 0,53 GB, con cuantizacion 8da4w (activaciones dinamicas de 8 bits, pesos de 4 bits en grupos de 32) y cache KV en fp32. La model card indica que el exportador cubre tambien ventanas mayores hasta 32k, aunque la tabla publicada solo llega a 16k.

Su relevancia es acotada pero concreta: es un artefacto de despliegue reproducible (generado por un pipeline de GitHub Actions documentado) para quien quiera integrar Qwen3-0.6B en una app Android mediante la libreria openweights o cualquier runtime ExecuTorch 1.4.0. El repositorio no incluye resultados de benchmarks, no tiene descargas ni likes, y la unica validacion publicada es un smoke test que devuelve la palabra "Paris".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only del modelo base Qwen3-0.6B-Base; el artefacto distribuido es un grafo ExecuTorch (.pte) para backend XNNPACK |
| Parametros totales | 0,6 mil millones (segun el identificador y el modelo base); no se detalla el desglose por capa en la informacion disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Fija por fichero: 2.048, 4.096, 8.192 y 16.384 tokens. La model card menciona exportaciones en el rango 2k-32k |
| Tipos de cuantizacion | 8da4w: activaciones dinamicas int8, pesos de 4 bits en grupos de 32, embeddings int8 por canal; cache KV en fp32 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (los ficheros de licencia upstream se incluyen sin cambios) |
| Formato de pesos | ExecuTorch `.pte` (un fichero por ventana de contexto); tokenizer.json copiado del repositorio origen |

## Arquitectura y entrenamiento

El artefacto no aporta entrenamiento propio. Se trata de una exportacion del modelo base Qwen3-0.6B-Base, un transformer decoder-only de aproximadamente 0,6 mil millones de parametros, mediante la herramienta `export_llm` de ExecuTorch 1.4.0. La exportacion aplica cuantizacion post-entrenamiento 8da4w (activaciones int8 dinamicas, pesos int4 agrupados de 32 en 32, embeddings int8 por canal), activa el backend XNNPACK con operadores extendidos, usa un tamano de chunk de prefill de 2.048 tokens y mantiene la cache KV en fp32. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO, ya que eso corresponde al modelo base y no se documenta en este repositorio.

La innovacion tecnica relevante esta en el empaquetado, no en el modelo: cada fichero `.pte` fija una unica ventana de contexto y el runtime reserva la cache KV completa al cargar. La cache consume 229.376 bytes por token en fp32, lo que equivale a 469.762.048 bytes para 2.048 tokens, 939.524.096 para 4.096, 1.879.048.192 para 8.192 y 3.758.096.384 para 16.384. Un campo `fits_phone_budget` en el `config.json` de cada carpeta estima si la variante encaja en un presupuesto de 5 GB. El pipeline que genera los ficheros es publico: GitHub Actions, run 1, del repositorio ExperimentalMachines/executorch-model-exporter.

## Capacidades

- Generacion de texto autoregresiva como modelo base: es un modelo de continuacion de texto sin ajuste por instrucciones, por lo que no sigue ordenes de forma fiable sin tecnicas adicionales de prompting o fine-tuning.
- Completado y continuacion de secuencias en tareas de lenguaje general, limitado por la calidad propia de un modelo de 0,6 mil millones de parametros.
- Inferencia completamente local en CPU arm64, sin GPU, sin conexion de red y sin servicio externo.
- Ventanas de contexto seleccionables en el momento del despliegue: 2.048, 4.096, 8.192 o 16.384 tokens, con la memoria de cache KV preasignada.
- Integracion con la aplicacion Android openweights y con cualquier runtime ExecuTorch 1.4.0 que cargue ficheros `.pte`.
- No hay soporte documentado de tool calling, function calling, modo de razonamiento explicito, agentes, vision, audio ni capacidad multimodal.
- No hay soporte multilingue documentado: el campo de idiomas del repositorio aparece como no disponible.
- El unico test funcional publicado es un smoke test que verifica que el modelo responde "Paris" ante una entrada no especificada, en las cuatro variantes de ventana.

## Casos de uso

- Autocompletado de texto en aplicaciones Android sin conexion: el fichero de 2.048 tokens (0,50 GB mas 448 MiB de cache KV) permite continuar frases o párrafos cortos en el propio dispositivo, con latencia independiente de la red.
- Prototipado de funciones de lenguaje en moviles de gama media: la variante de 4.096 tokens suma unos 1,38 GiB en total, un presupuesto asumible por terminales con 6 GB o 8 GB de RAM, util para validar ideas antes de invertir en infraestructura.
- Clasificacion y etiquetado de texto generado en local: al ser un modelo base se puede usar la verosimilitud de secuencias para puntuar o filtrar textos sin enviar datos a terceros, algo relevante en contextos con requisitos de privacidad.
- Resumen de notas o mensajes de longitud media: con la ventana de 8.192 tokens y unos 2,26 GiB de consumo total se pueden procesar conversaciones o apuntes extensos y generar un resumen mediante prompting de continuacion.
- Asistencia embebida en aplicaciones de accesibilidad: la inferencia 100% local evita depender de conectividad y permite sugerencias de texto en tiempo real en dispositivos arm64.
- Investigacion sobre cuantizacion y despliegue: los ficheros `export-report-<window>.json` y los `config.json` por carpeta documentan el proceso de exportacion, lo que los hace utiles para estudiar el impacto de 8da4w y de la preasignacion de cache KV en memoria y calidad.
- Base para fine-tuning o destilacion posteriores: al ser un derivado del modelo base con licencia Apache 2.0, se puede reentrenar o adaptar y volver a exportar, siempre que se respeten las condiciones de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta un smoke test superado ("Paris") en las cuatro variantes de ventana, sin metricas de perplejidad, MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, el backend XNNPACK es de CPU. El consumo es de RAM del sistema.
- Memoria total estimada (pesos + cache KV fp32 preasignada):
  - 2.048 tokens: 0,50 GB de pesos mas 469.762.048 bytes de cache, aproximadamente 0,94 GiB.
  - 4.096 tokens: 0,50 GB mas 939.524.096 bytes, aproximadamente 1,38 GiB.
  - 8.192 tokens: 0,51 GB mas 1.879.048.192 bytes, aproximadamente 2,26 GiB.
  - 16.384 tokens: 0,53 GB mas 3.758.096.384 bytes, aproximadamente 4,03 GiB.
- GPU recomendadas: no se requiere GPU y no hay backend GPU en el repositorio. El destino declarado es CPU arm64 de telefonos Android; tambien seria ejecutable en otras plataformas arm64 compatibles con ExecuTorch 1.4.0.
- Cabe en dispositivo consumer: si, es su proposito. La model card contrasta cada variante con un presupuesto de 5 GB mediante el campo `fits_phone_budget`, de modo que incluso la ventana de 16.384 tokens queda por debajo de ese umbral.
- Opciones de despliegue: runtime ExecuTorch 1.4.0 y la aplicacion Android openweights (github.com/alpharomercoma/openweights). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado que el formato es `.pte` y no GGUF ni safetensors.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token en ningun dispositivo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| experimentalmachines/Qwen3-0.6B-Base-ExecuTorch | 0,6 mil millones | Fijo por fichero: 2k, 4k, 8k o 16k | `.pte` ExecuTorch, 8da4w, KV en fp32 | Apache 2.0 | Repositorio con 0 descargas y 0 likes; pipeline de exportacion publico |
| Qwen/Qwen3-0.6B-Base (upstream) | 0,6 mil millones | No disponible en la informacion proporcionada; la model card de la exportacion menciona exportaciones de 2k a 32k | safetensors en precision completa | Apache 2.0 | Modelo base de referencia, ampliamente distribuido |
| Otras alternativas on-device de tamano similar (por ejemplo SmolLM2-360M, Gemma 3 270M, Llama 3.2 1B) | no disponible | no disponible | no disponible | no disponible | no disponible; no se aportan datos comparativos en la informacion disponible |

Los resultados de benchmarks y las metricas de calidad de las alternativas no se incluyen en la informacion disponible, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Es un modelo base, no ajustado por instrucciones: no cabe esperar seguimiento fiable de ordenes, formato conversacional ni plantilla de chat incluida.
- No hay soporte documentado de tool calling, function calling ni razonamiento multi-paso, por lo que no es adecuado como motor de agentes sin trabajo adicional.
- Riesgo de alucinacion inherente a un modelo de 0,6 mil millones de parametros; la cuantizacion a 4 bits en los pesos puede degradar adicionalmente la calidad respecto al modelo original.
- La unica validacion publicada es un smoke test con la respuesta "Paris", insuficiente para caracterizar el comportamiento en produccion.
- Cada fichero `.pte` fija una ventana de contexto y reserva la cache KV completa al cargar: no hay ventana dinamica ni posibilidad de ampliarla sin cambiar de fichero, y la eleccion de una ventana grande penaliza la RAM desde el arranque.
- El campo de idiomas no esta documentado en el repositorio, por lo que no se puede garantizar cobertura multilingue.
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa de la comunidad ni issues reportados.
- El tamano total del repositorio es de 2,0 GB, ya que incluye todas las variantes; conviene descargar unicamente la carpeta necesaria.
- Licencia Apache 2.0, que permite uso comercial y modificacion, siempre que se conserven los avisos de licencia y atribucion correspondientes al modelo base y a la exportacion.
- La discrepancia entre la tabla publicada (hasta 16k) y la afirmacion de exportaciones hasta 32k en el texto de la model card conviene verificarla antes de planificar un despliegue.
- No hay datos de latencia, throughput ni consumo energetico, datos criticos para valorar su viabilidad en un dispositivo movil real.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/experimentalmachines/Qwen3-0.6B-Base-ExecuTorch
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Aplicacion Android openweights: https://github.com/alpharomercoma/openweights
- Repositorio del exportador: https://github.com/ExperimentalMachines/executorch-model-exporter
- Run de GitHub Actions que genero los ficheros: https://github.com/ExperimentalMachines/executorch-model-exporter/actions/runs/34753867158
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos del repositorio.
