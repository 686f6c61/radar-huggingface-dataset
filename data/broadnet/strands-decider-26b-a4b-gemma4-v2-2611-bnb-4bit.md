# Broadnet/strands-decider-26B-A4B-gemma4-v2-2611-bnb-4bit

## Resumen

Strands Decider v2 26B-A4B en 4 bits (NF4) es una cuantizacion del modelo Strands Decider v2 26B-A4B de StrandsAgents, publicada por BroadNet. El modelo original es un sistema de decision construido sobre Gemma 4 26B-A4B de Google, una arquitectura Mixture of Experts (MoE) con 26B parametros totales y unos 4B activos por token. Su proposito no es la generacion libre de texto, sino la seleccion de respuestas o decisiones entre opciones dadas, con un formato de salida propio gestionado por el paquete `strands-decider` y un endpoint especifico (`/v1/systemone`).

La relevancia de esta version concreta es practica: el checkpoint bf16 original ocupa 52 GB y no cabe en una GPU de consumo, mientras que esta cuantizacion NF4 reduce los pesos a 14,5 GB en disco y 13,5 GiB en GPU, permitiendo ejecutar el modelo en una unica RTX 3090 de 24 GB con un pico medido de 17,0 GiB. La cuantizacion va mas alla del camino estandar de bitsandbytes en transformers, que solo cuantiza capas lineales y dejaria los tensores 3D de los expertos en bf16; aqui se dividen los expertos en capas gate-up y down para cuantizarlos tambien.

El resultado medido es una perdida de fidelidad muy baja: coincide con la respuesta top del modelo bf16 en 297 de 300 preguntas (99 %) y obtiene 68,83 en el scorer publico del Decision Index frente a 68,98 del bf16. La licencia es Apache-2.0, la misma que la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), basada en Gemma 4 26B-A4B |
| Parametros totales | 13.685.927.054 (pesos reales en safetensors del checkpoint cuantizado); el modelo base se denomina 26B-A4B |
| Parametros activos | Aproximadamente 4B (denominacion A4B del modelo base); no se detalla el reparto exacto por token |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NF4 (bitsandbytes, doble cuantizacion, computo en bf16); embeddings, norms, router, readout y cabeza de salida en bf16 |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 14,5 GB), con ficheros `strands_nf4.py`, `tensors.sha256.json`, `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture of Experts derivado de Gemma 4 26B-A4B, con enrutamiento por token hacia expertos y un cabezal de decision especifico (readout y configuracion de decision propios de Strands). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. Lo que si documenta esta ficha es el proceso de cuantizacion: se aplica NF4 con doble cuantizacion y computo bf16 a todas las capas lineales excepto la cabeza de salida y la proyeccion del router, y se extiende la cuantizacion a los expertos enrutados dividiendo cada tensor 3D de experto en capas gate-up y down, algo que el camino estandar de bitsandbytes en transformers no hace.

La innovacion tecnica destacable es precisamente esa: el script `strands_nf4.py` carga los pesos cuantizados directamente en GPU sin copia intermedia en bf16, y el paquete incluye `tensors.sha256.json` para verificar tensor a tensor que una recarga coincide con el checkpoint publicado. Los expertos se ejecutan como un bucle sobre capas de 4 bits, sin kernel MoE fusionado, lo que explica la latencia observada. El servidor ajusta el tamano de lote respecto al valor por defecto de Strands (`SD_MAX_BATCH`, `SD_MAX_BATCH_TOKENS`, `SD_REUSE_MAX_STATE`) para que textos largos con muchas preguntas quepan en 24 GB sin alterar las respuestas. El servidor tambien acepta imagenes, aunque todas las metricas publicadas proceden de texto.

## Capacidades

- Seleccion de decisiones: dado un contexto y un conjunto de opciones o preguntas, el modelo elige la respuesta mas probable segun su readout de decision.
- Procesamiento por lotes de preguntas: el endpoint `/v1/systemone` admite multiples preguntas sobre un mismo texto (las golden vectors usan 300 preguntas sobre 150 peticiones).
- Manejo de textos largos: se han medido latencias con entradas de aproximadamente 265, 744 y 2.000 tokens.
- Entrada multimodal parcial: el servidor acepta imagenes, aunque no hay metricas publicadas sobre ese modo.
- Integracion como servicio: se expone mediante un servidor HTTP compatible con el flujo de Strands (`/v1/systemone`).
- Verificabilidad de pesos: capacidad de comprobar integridad tensor a tensor frente a los hashes publicados.
- No se documentan capacidades de generacion libre de texto, tool calling, function calling, razonamiento multi-paso ni multilingueismo; deben considerarse no disponibles.

## Casos de uso

- Enrutamiento y clasificacion de decisiones en produccion: el modelo actua como decisor entre opciones predefinidas, adecuado para pipelines donde la salida debe ser una eleccion controlada y no texto libre, con la ventaja de caber en una sola GPU de 24 GB.
- Moderacion o triaje de contenidos: dado un texto y un conjunto de categorias, seleccionar la mas apropiada; la latencia de 2,9 a 3,7 s por decision en RTX 3090 es aceptable para flujos asincronos o por lotes.
- Preguntas sobre documentos largos: con entradas de hasta 2.000 tokens medidas y ajuste de lote para textos con muchas preguntas, sirve para extraer respuestas estructuradas de informes o contratos.
- Evaluacion automatizada de respuestas: usar el modelo como juez que elige la mejor opcion entre candidatas, apoyandose en la fidelidad del 99 % respecto al bf16 para no introducir sesgo por cuantizacion.
- Despliegue en infraestructura limitada: equipos con una unica RTX 3090 o similar que no pueden alojar el checkpoint bf16 de 52 GB pueden servir este modelo con 17,0 GiB de pico de memoria.
- Reproducibilidad y auditoria de modelos cuantizados: el par `save`/`check` y los hashes SHA-256 permiten reconstruir el checkpoint y verificar que los pesos servidos son exactamente los publicados, util en entornos regulados.
- Prototipado de agentes Strands en local: al ejecutarse con el paquete `strands-decider==0.4.0` y el mismo protocolo de servidor, permite desarrollar integraciones sin depender de GPUs de datacenter.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Coincidencia con la respuesta top del bf16 (golden vectors de Strands, 300 preguntas) | 297/300 (99 %) |
| Cambio maximo en la probabilidad de cualquier opcion | 0,013 de media por pregunta |
| Decision Index (kit y scorer publicos, muestra de 3.000 filas) | 68,83 |
| Decision Index del bf16 en el board 0.4.1 (conjunto publico) | 68,98 |
| Latencia mediana por decision, texto de ~265 tokens (RTX 3090) | 2,9 s |
| Latencia mediana por decision, texto de ~744 tokens (RTX 3090) | 3,4 s |
| Latencia mediana por decision, texto de ~2.000 tokens (RTX 3090) | 3,7 s |
| Pico de memoria GPU | 17,0 GiB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de proposito general en la informacion disponible.

## Requisitos de hardware

- VRAM: 13,5 GiB para los pesos y 17,0 GiB de pico medido durante la inferencia en una RTX 3090.
- GPU verificada: NVIDIA RTX 3090 (24 GB). No se han publicado mediciones en A100, H100 ni RTX 4090.
- GPU de consumo: si, cabe en tarjetas de 24 GB; en tarjetas de 16 GB el margen es insuficiente segun el pico medido de 17,0 GiB.
- Almacenamiento: 14,5 GB en disco para el repositorio.
- Despliegue: servidor propio incluido en `strands_nf4.py` (`serve <dir> --port 8030`), con dependencias `strands-decider==0.4.0`, `transformers==5.21.0`, `bitsandbytes==0.50.2` y `accelerate`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 2,9-3,7 s por decision en RTX 3090 segun longitud del texto, procesando una peticion a la vez. No se publica throughput agregado.
- Limitacion de rendimiento: los expertos se ejecutan como bucle sobre capas de 4 bits sin kernel MoE fusionado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Broadnet/strands-decider-26B-A4B-gemma4-v2-2611-bnb-4bit | 13,69B en safetensors (base 26B-A4B) | No disponible | safetensors NF4 | Apache-2.0 | 68,83 en Decision Index; 17,0 GiB de pico en RTX 3090 |
| StrandsAgents/strands-decider-26B-A4B-gemma4-v2-2611 (bf16) | 26B-A4B | No disponible | bf16, 52 GB | Apache-2.0 | 68,98 en Decision Index; requiere mas de 24 GB de VRAM |
| Gemma 4 26B-A4B (Google, modelo base) | 26B totales, ~4B activos | No disponible | No disponible | No disponible en esta informacion | Modelo generalista sobre el que se construye el decisor |

No se dispone de datos de benchmarks de proposito general para comparar con otras familias de modelos del mismo tamano; la comparacion se limita al modelo base y a su version bf16.

## Limitaciones y advertencias

- No es un modelo de generacion de texto general: su funcion es decidir entre opciones, y el uso fuera de ese formato no esta documentado.
- Las mediciones de calidad se limitan a las golden vectors de Strands y al Decision Index; no hay evaluaciones independientes de sesgo, alucinacion o robustez.
- Las latencias publicadas corresponden a una sola RTX 3090 procesando una peticion a la vez; el rendimiento en otros hardware y con concurrencia es desconocido.
- El modo de entrada por imagenes esta presente en el servidor pero no se ha evaluado ni medido.
- Los idiomas soportados no estan documentados; no debe asumirse cobertura multilingue.
- La cuantizacion introduce una desviacion pequena pero real: hasta 0,013 de cambio en la probabilidad de una opcion y un 1 % de discrepancias en la respuesta top frente al bf16.
- Los expertos se ejecutan sin kernel MoE fusionado, lo que limita el throughput en comparacion con implementaciones optimizadas.
- La licencia Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Gemma 4 de Google; conviene revisar el `NOTICE` incluido.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad sobre este checkpoint.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/Broadnet/strands-decider-26B-A4B-gemma4-v2-2611-bnb-4bit
- Modelo base en Hugging Face: https://huggingface.co/StrandsAgents/strands-decider-26B-A4B-gemma4-v2-2611
- Paquete `strands-decider` (referenciado en la model card, sin URL directa en la informacion disponible)
- bitsandbytes (herramienta de cuantizacion): no disponible en la informacion proporcionada
- Paper, blog o demo oficiales: no disponibles en la informacion proporcionada
