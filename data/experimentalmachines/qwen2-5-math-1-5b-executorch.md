# experimentalmachines/Qwen2.5-Math-1.5B-ExecuTorch

## Resumen

Qwen2.5-Math-1.5B-ExecuTorch es un conjunto de exportaciones del modelo Qwen/Qwen2.5-Math-1.5B (revision `4a83ca6e4526`) al formato ExecuTorch, publicadas por el usuario experimentalmachines. No se trata de un modelo entrenado desde cero ni de un ajuste fino, sino de una conversion de pesos y grafo orientada a inferencia en dispositivo, pensada para ejecutarse en la aplicacion Android openweights o en cualquier runtime de ExecuTorch 1.4.0. El modelo subyacente es un transformer decoder-only denso de 1,5 mil millones de parametros especializado en matematicas; la contribucion de este repositorio es la ruta de despliegue, no el conocimiento del modelo.

La relevancia practica esta en el empaquetado: cada archivo `.pte` fija la ventana de contexto en tiempo de exportacion (2.048, 4.096 o 16.384 tokens) y reserva la cache KV completa en el momento de la carga, por lo que el desarrollador debe elegir de antemano el tamano de ventana que su dispositivo puede asumir. Los pesos se cuantizan con el esquema 8da4w (activaciones dinamicas de 8 bits, pesos de 4 bits en grupos de 32) y la cache KV se mantiene en fp32.

El repositorio ocupa 3,4 GB e incluye los tres archivos de pesos, el tokenizador sin modificar y registros de exportacion por ventana. En el momento de redactar esta ficha acumula 0 descargas y 0 likes, y no se han publicado resultados de benchmarks ni detalles de entrenamiento del modelo base. La busqueda web realizada no devolvio ninguna fuente relevante sobre este modelo (unicamente resultados genericos ajenos al proyecto).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2.5), exportado a ExecuTorch 1.4.0 |
| Parametros totales | 1,5 mil millones (1,5B) en el modelo base; no disponible el desglose exacto por capa en la informacion proporcionada |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | Ventana fijada dentro del archivo exportado: 2.048, 4.096 o 16.384 tokens. Contexto nativo del modelo base: no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 8da4w: activaciones dinamicas de 8 bits, pesos de 4 bits en grupos de 32, embeddings int8 por canal; cache KV en fp32 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pte` (ExecuTorch), backend XNNPACK; tokenizador en `tokenizer.json` |

## Arquitectura y entrenamiento

Este repositorio no describe ningun proceso de entrenamiento propio. Lo que documenta es la ruta de exportacion: se parte de Qwen2.5-Math-1.5B y se genera un grafo ExecuTorch con `export_llm` de ExecuTorch 1.4.0, con cuantizacion 8da4w (activaciones de 8 bits dinamicas, pesos de 4 bits agrupados de 32 en 32), embeddings int8 por canal, backend XNNPACK con operadores extendidos, chunk de prefill de 2.048 tokens y cache KV en fp32. El objetivo declarado es cualquier dispositivo arm64.

La peculiaridad estructural mas importante es que la ventana de contexto queda incrustada en el archivo: el runtime reserva la cache KV entera al cargar el modelo, de modo que no hay ajuste dinamico. Se ofrecen tres variantes (2.048, 4.096 y 16.384 tokens) con tamanos de 1,11 GB, 1,11 GB y 1,14 GB respectivamente, y un campo `fits_phone_budget` en cada `config.json` que estima la viabilidad frente a un presupuesto de 5 GB. No se incluyen en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base recibio RLHF o DPO.

## Capacidades

- Generacion de texto autoregresiva mediante decodificacion estandar sobre el grafo exportado.
- Razonamiento matematico: el modelo base es una variante especializada en matematicas de la familia Qwen2.5, orientada a resolucion de problemas y calculo.
- Ejecucion completamente local en dispositivos arm64 mediante CPU (XNNPACK), sin necesidad de conectividad.
- Compatibilidad con la aplicacion Android openweights y con cualquier runtime de ExecuTorch 1.4.0.
- Prueba de humo superada en las tres ventanas: se verifico que el modelo responde "Paris" al prompt correspondiente, lo que confirma que el grafo y el tokenizador cargan y generan correctamente.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso orquestado: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (no se declaran idiomas en la model card).
- Capacidades de vision, audio o modo "thinking": no disponible; no se mencionan.

## Casos de uso

- Tutor de matematicas sin conexion en Android: el modelo se empaqueta en un unico archivo `.pte` de 1,11 GB que puede distribuirse dentro de la aplicacion, de modo que el alumnado resuelve ejercicios sin acceso a red y sin enviar datos a servidores externos.
- Asistencia en aplicaciones educativas para tablets: con la ventana de 2.048 tokens el consumo de cache KV es de 117.440.512 bytes, un presupuesto asumible en dispositivos de gama media que no pueden sostener un modelo mayor.
- Procesamiento con privacidad estricta: al ejecutarse en el propio dispositivo, es adecuado para entornos donde el enunciado de un problema no puede salir del terminal (por ejemplo, ejercicios de evaluacion o datos internos de una empresa).
- Integracion como runtime de referencia para la app openweights: sirve para validar el pipeline completo de ExecuTorch 1.4.0 en arm64 y comprobar el comportamiento de las cuantizaciones 8da4w en produccion.
- Kioscos y terminales aisladas: en despliegues industriales o de laboratorio sin red, el modelo puede ofrecer resoluci6n de calculos basicos y comprobacion de formulas desde un binario local.
- Generacion de variantes de ejercicios: a partir de la ventana de 4.096 tokens, el modelo puede producir enunciados y soluciones alternativas para plataformas de practica, manteniendo el contexto suficiente para encadenar varios problemas en una misma sesion.
- Prototipado de IA embebida: util como banco de pruebas para comparar latencia y consumo de memoria de las tres ventanas antes de fijar una configuracion definitiva en un producto.
- Analisis de documentos matematicos largos: la variante de 16.384 tokens, con 939.524.096 bytes de cache KV reservados en carga, permite procesar fragmentos extensos de texto tecnico en un solo paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion reportada es una prueba de humo por variante (2.048, 4.096 y 16.384 tokens) que devolvio "Paris" ante el prompt correspondiente, lo que acredita el funcionamiento del grafo pero no mide calidad.

| Prueba | Ventana 2.048 | Ventana 4.096 | Ventana 16.384 |
|---|---|---|---|
| Superacion de prueba de humo | Si ("Paris") | Si ("Paris") | Si ("Paris") |
| MMLU, GSM8K, HumanEval u otros | No disponible | No disponible | No disponible |

## Requisitos de hardware

- Tamano de pesos: 1,11 GB para las ventanas de 2.048 y 4.096 tokens; 1,14 GB para la de 16.384.
- Cache KV (fp32, reservada completa en la carga): 117.440.512 bytes a 2.048 tokens; 234.881.024 bytes a 4.096; 939.524.096 bytes a 16.384, a razon de 57.344 bytes por token.
- Presupuesto total de memoria estimado: aproximadamente 1,23 GB a 2.048 tokens, 1,35 GB a 4.096 y 2,08 GB a 16.384, sin contar el consumo propio del runtime.
- Destino principal: dispositivos moviles y sistemas embebidos con CPU arm64 (el backend XNNPACK es CPU; no se documenta aceleracion por GPU ni NPU).
- GPU dedicadas: no aplica segun lo documentado; no se menciona soporte para A100, H100, RTX 4090 ni similares.
- Cabe en GPU de consumo: irrelevante para el objetivo del repositorio; el modelo esta pensado para CPU movil, no para GPU de escritorio.
- Opciones de despliegue: runtime de ExecuTorch 1.4.0, aplicacion Android openweights, backend XNNPACK con operadores extendidos.
- Latencia y throughput: no disponibles; solo se indica que la prueba de humo pasa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen2.5-Math-1.5B-ExecuTorch (este) | 1,5B | Fijado en 2.048, 4.096 o 16.384 tokens por archivo | 8da4w, `.pte` para XNNPACK | 1,11-1,14 GB | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen2.5-Math-1.5B (modelo base) | 1,5B | No disponible en la informacion proporcionada | Pesos originales (safetensors); bf16 estimado en torno a 3 GB | No disponible | Apache 2.0 | HuggingFace |
| Otras variantes on-device de la familia Qwen2.5 | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La busqueda web no devolvio informacion sobre alternativas comparables, por lo que no es posible establecer una comparacion de rendimiento con modelos de la misma categoria.

## Limitaciones y advertencias

- La model card no especifica si el modelo base es la variante instruct o la de continuacion de texto; si se usa la variante base, el formato de respuesta puede requerir prompts de continuacion en lugar de instrucciones conversacionales.
- Los pesos estan cuantizados a 4 bits en grupos de 32 con activaciones de 8 bits; esa perdida de precision puede degradar la exactitud en cadenas de razonamiento matematico largo.
- Riesgo de alucinacion: no hay evaluacion publicada de exactitud matematica, y un modelo de 1,5B sin verificar puede producir pasos intermedios plausibles pero incorrectos.
- La ventana de contexto no es ajustable en tiempo de ejecucion: se fija al elegir el archivo, y la cache KV se reserva entera en la carga, lo que puede provocar fallos de memoria en dispositivos con poca RAM si se selecciona la variante de 16.384 tokens (939 MB solo de cache).
- Solo se documenta backend CPU XNNPACK para arm64; no hay soporte declarado de GPU ni de aceleradores neuronales en este repositorio.
- No se declaran idiomas soportados, por lo que el comportamiento fuera del ingles (incluido el castellano) no esta verificado.
- La licencia Apache 2.0 permite uso comercial, pero al ser un derivado de Qwen conviene revisar los terminos del repositorio original antes de redistribuirlo en un producto.
- El repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha, y no ha pasado por validacion de la comunidad; la unica evidencia de funcionamiento es una prueba de humo de una palabra.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/experimentalmachines/Qwen2.5-Math-1.5B-ExecuTorch
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B/blob/main/LICENSE
- Aplicacion openweights: https://github.com/alpharomercoma/openweights
- Registro de exportacion (run 1): https://github.com/ExperimentalMachines/executorch-model-exporter/actions/runs/34749097864
- Resultados de busqueda web: no se encontro ninguna fuente relevante sobre este modelo; los resultados devueltos correspondian a sitios corporativos de Microsoft y no guardan relacion con el proyecto.
