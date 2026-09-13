# experimentalmachines/Qwen2.5-1.5B-ExecuTorch

## Resumen

Qwen2.5-1.5B-ExecuTorch es una exportación del modelo Qwen/Qwen2.5-1.5B al formato de ejecución ExecuTorch, publicada por el usuario experimentalmachines. No se trata de un modelo nuevo entrenado desde cero, sino de un derivado cuantizado del modelo base de Qwen, empaquetado como ficheros `.pte` para inferencia en el propio dispositivo (on-device), con orientación explícita a terminales Android arm64. El repositorio tiene 4,5 GB e incluye, además de los binarios, el tokenizador original sin modificaciones.

La relevancia de esta publicación es de tipo práctico: permite ejecutar un modelo de aproximadamente 1,5 mil millones de parámetros en un teléfono sin depender de la nube, usando el runtime XNNPACK dentro de ExecuTorch 1.4.0. El autor proporciona exportaciones con la ventana de contexto fijada en el propio fichero (2.048, 4.096, 8.192 y 16.384 tokens en los ficheros listados), de modo que el desarrollador elige el equilibrio entre memoria ocupada y contexto disponible. Los pesos ocupan entre 1,11 y 1,14 GB por fichero, y la caché KV en fp32 se reserva completa al cargar el modelo.

El modelo se distribuye bajo licencia Apache 2.0, la misma del modelo base. El repositorio no registra descargas ni "likes" en el momento de la consulta, y no incluye resultados de benchmarks. La búsqueda web asociada a esta ficha no devolvió ninguna fuente relevante sobre el modelo: los resultados obtenidos corresponden a una empresa de elevadores y no guardan relación con el objeto de análisis, por lo que toda la información técnica procede de la model card y de los metadatos de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder, heredada del modelo base Qwen/Qwen2.5-1.5B (no se detalla en la informacion proporcionada) |
| Parametros totales | 1,5 mil millones (nominal, segun la denominacion del modelo base; no se confirma cifra exacta en la informacion proporcionada) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048, 4.096, 8.192 y 16.384 tokens en los ficheros listados; la model card menciona que existen exportaciones de 2k a 32k, pero solo se detallan hasta 16k |
| Tipos de cuantizacion | 8da4w: activaciones de 8 bits dinamicas y pesos de 4 bits en grupos de 32; embeddings int8 por canal; cache KV en fp32 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | ExecuTorch `.pte` (XNNPACK, arm64); tokenizador en `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-1.5B es un transformer decoder de la familia Qwen2.5. Esta publicacion no entrena ni ajusta el modelo: lo exporta. El proceso se realizo con la herramienta `export_llm` de ExecuTorch 1.4.0, con el backend XNNPACK y operadores extendidos, cuantizacion de activaciones dinamicas a 8 bits, pesos a 4 bits en grupos de 32, embeddings int8 por canal y una cache KV en fp32. El tamano de prefill se fijo en 2.048 tokens. La exportacion se ejecuto en el flujo de trabajo automatizado del repositorio del autor, identificado como "run 1".

La innovacion tecnica relevante no esta en el entrenamiento, sino en el empaquetado para despliegue. Cada fichero `.pte` lleva fijada internamente su ventana de contexto, de manera que el runtime dimensiona y reserva la cache KV completa en el momento de la carga. Esto hace que el consumo de memoria sea predecible, pero elimina la posibilidad de ajustar la ventana en tiempo de ejecucion. El autor incluye, para cada backend y ventana, un `config.json` con metadatos y una estimacion (`fits_phone_budget`) frente a un presupuesto de 5 GB, ademas de un `export-report-<window>.json` con el registro completo de la exportacion.

## Capacidades

- Generacion de texto autoregresiva, en el mismo rango funcional que el modelo base Qwen2.5-1.5B.
- Inferencia completamente local en dispositivos arm64, sin conexion a red.
- Ventanas de contexto seleccionables segun el fichero elegido: 2.048, 4.096, 8.192 o 16.384 tokens.
- Integracion con la aplicacion Android openweights y con cualquier runtime ExecuTorch 1.4.0.
- Prueba de humo superada en los ficheros XNNPACK listados: la respuesta a una peticion sencilla fue "Paris".
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada. Esta exportacion es exclusivamente de generacion de texto.

## Casos de uso

- Asistentes de texto sin conexion en aplicaciones Android: el modelo se carga en el dispositivo a traves de la app openweights o de un runtime ExecuTorch propio, con lo que el asistente sigue funcionando en modo avion o en zonas sin cobertura.
- Procesamiento de datos sensibles sin salida a la nube: al ejecutarse en local, textos de caracter personal, sanitario o legal no abandonan el terminal, lo que simplifica el cumplimiento de requisitos de privacidad en aplicaciones moviles.
- Resumen y reescritura de notas o correos largos: con la variante de 8.192 o 16.384 tokens se pueden resumir documentos extensos sin truncarlos, a cambio de reservar entre aproximadamente 1,5 y 2,1 GB de memoria.
- Extraccion de campos y clasificacion de texto en aplicaciones moviles: por ejemplo, convertir texto libre en campos estructurados (fechas, importes, nombres) dentro de una app de gestion, sin coste de API.
- Prototipado y validacion de pipelines ExecuTorch: sirve como banco de pruebas para verificar el flujo de exportacion, el reparto de memoria del KV cache y el rendimiento de XNNPACK antes de portar modelos de mayor tamano.
- Uso en terminales industriales o PDAs de campo (logistica, inspeccion, sanidad rural) donde no hay conectividad fiable y se necesita generacion de texto o pequeños asistentes de consulta.
- Correccion y autocompletado de texto en teclados o editores moviles, donde la latencia local y la ausencia de cuota de servicio son los requisitos dominantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evaluacion mencionada es una prueba de humo ("smoke test") superada en los cuatro ficheros XNNPACK, en la que el modelo respondio "Paris". No se proporcionan cifras de MMLU, HumanEval, GSM8K ni de latencia o tokens por segundo.

## Requisitos de hardware

- Peso de los ficheros: 1,11 GB (ventanas de 2k y 4k), 1,12 GB (8k) y 1,14 GB (16k).
- Cache KV en fp32: 57.344 bytes por token, reservada completa al cargar el modelo. Por ventana: 117.440.512 bytes (2k), 234.881.024 bytes (4k), 469.762.048 bytes (8k) y 939.524.096 bytes (16k).
- Memoria total aproximada en carga: en torno a 1,23 GB con ventana de 2k; 1,35 GB con 4k; 1,59 GB con 8k; y 2,08 GB con 16k.
- Presupuesto de referencia del autor: el campo `fits_phone_budget` de cada `config.json` se calcula contra un presupuesto de 5 GB.
- Perfil de dispositivo: cualquier terminal arm64. El backend XNNPACK se ejecuta en CPU, por lo que no requiere GPU ni acelerador dedicado.
- GPU: no aplica a esta exportacion; no se proporcionan indicaciones sobre A100, H100 o RTX 4090, ya que el artefacto es para CPU arm64 en movil.
- Opciones de despliegue: aplicacion Android openweights o cualquier runtime ExecuTorch 1.4.0. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que consumen otros formatos de pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La busqueda web no devolvio resultados relevantes, por lo que la comparacion se limita a categorias conocidas y a los datos disponibles en la propia ficha.

| Modelo | Parametros | Contexto | Formato y cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| experimentalmachines/Qwen2.5-1.5B-ExecuTorch | 1,5 B (nominal) | 2k, 4k, 8k y 16k fijados por fichero | `.pte` ExecuTorch, XNNPACK, 8da4w | apache-2.0 | Exportacion on-device para arm64; sin benchmarks publicados; 0 descargas |
| Qwen/Qwen2.5-1.5B (modelo base) | 1,5 B (nominal) | no disponible en la informacion proporcionada | safetensors (presumiblemente; no confirmado) | apache-2.0 | Modelo original de Qwen; esta ficha no aporta sus especificaciones detalladas |
| Otras exportaciones ExecuTorch de modelos ~1B | no disponible | no disponible | `.pte` | depende del modelo base | Alternativas de la misma categoria funcional (inferencia movil), sin datos comparables aportados |

No se dispone de cifras de rendimiento que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Alucinacion: es un riesgo inherente a los modelos de lenguaje de esta escala, agravado por la cuantizacion de pesos a 4 bits, que puede degradar la fidelidad respecto al modelo original en fp32 o bf16.
- Cuantizacion agresiva: los pesos en 4 bits con grupos de 32 y las activaciones dinamicas de 8 bits introducen perdida de precision respecto al modelo base. No se documenta ninguna evaluacion de esa degradacion.
- Contexto fijo por fichero: la ventana no se puede modificar en tiempo de ejecucion; hay que elegir y cargar el fichero correspondiente. La model card menciona ventanas de hasta 32k, pero solo se detallan ficheros hasta 16k.
- Memoria no negociable: la cache KV se reserva completa al cargar el modelo, por lo que el consumo es el peor caso desde el primer token.
- Dependencia de runtime: solo funciona con ExecuTorch 1.4.0 (o compatible) y el backend XNNPACK; no es utilizable directamente en ecosistemas PyTorch, GGUF o Safetensors.
- Idiomas: la ficha no declara idiomas soportados, de modo que no se puede asumir un rendimiento multilingue concreto en esta exportacion.
- Tool calling, agentes y razonamiento multi-paso: no confirmados en la informacion disponible.
- Validacion muy limitada: la unica prueba documentada es un smoke test con la respuesta "Paris". No hay benchmarks, no hay evaluacion de calidad y el repositorio no tiene descargas ni valoraciones de la comunidad.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar los terminos del modelo base Qwen2.5-1.5B, ya que la ficha enlaza explicitamente su fichero de licencia.
- Fechas anomalas: los metadatos indican creacion y actualizacion en septiembre de 2026, posteriores al momento de la consulta, lo que sugiere un error de sellado temporal o un artefacto de la plataforma.
- Aviso de trazabilidad: la busqueda web realizada para esta ficha no arrojo ninguna fuente relacionada con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/experimentalmachines/Qwen2.5-1.5B-ExecuTorch
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B/blob/main/LICENSE
- Aplicacion Android openweights: https://github.com/alpharomercoma/openweights
- Repositorio del exportador: https://github.com/ExperimentalMachines/executorch-model-exporter
- Registro de la exportacion (run 1): https://github.com/ExperimentalMachines/executorch-model-exporter/actions/runs/34753852983
- Resultados de la busqueda web: sin fuentes relevantes disponibles.
