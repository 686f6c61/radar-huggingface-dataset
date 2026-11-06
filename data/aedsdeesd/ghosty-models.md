# aedsdeesd/ghosty-models

## Resumen

ghosty 8 y ghosty 8 Pro son dos modelos de lenguaje derivados por ajuste fino (fine-tuning) de Qwen3-1.7B y Qwen3-4B respectivamente, publicados por el usuario aedsdeesd y atribuidos en la model card a Yehor Lisovets. Forman parte de la aplicacion para iPhone llamada ghosty y se distribuyen como artefactos Core ML pensados para inferencia en el propio dispositivo (on-device), no para servidores. La relevancia practica es acotada: el interes esta en el formato de despliegue (Core ML con cache KV con estado y pesos de 4 bits) mas que en innovaciones de arquitectura o de entrenamiento.

Ambos modelos heredan la arquitectura transformer densa de la familia Qwen3, con una ventana de contexto nativa de 32.768 tokens en los modelos base, aunque la model card no confirma que ese contexto se conserve tras la conversion a Core ML. El repositorio ocupa 3,2 GB y contiene los dos conjuntos de pesos convertidos, lo que es coherente con dos modelos cuantizados a 4 bits.

No se han publicado resultados de benchmarks, detalles del dataset de ajuste fino, ni informacion sobre idiomas soportados. El repositorio no registra descargas ni interacciones en el momento de la consulta, por lo que debe tratarse como un artefacto experimental de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3); empaquetado Core ML |
| Parametros totales | 1,7 mil millones (ghosty 8) y 4 mil millones (ghosty 8 Pro) |
| Parametros activos | No aplica (modelos densos, no MoE) |
| Longitud de contexto | No disponible en la model card; los modelos base Qwen3 soportan 32.768 tokens |
| Tipos de cuantizacion | Pesos de 4 bits (segun la model card); no se detallan otras variantes |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (iOS 18+, cache KV con estado) |
| Modelo base | Qwen/Qwen3-1.7B y Qwen/Qwen3-4B |
| Tamano del repositorio | 3,2 GB |
| Plataforma objetivo | iOS 18 o superior |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3 en sus variantes densas de 1,7 y 4 mil millones de parametros: transformers decoder-only con atencion por cabezas agrupadas (GQA) y las innovaciones propias de la familia Qwen3, como el modo de razonamiento con etiquetas de pensamiento. Sobre estos pesos se aplico un ajuste fino cuyo dataset, numero de tokens, composicion y posible uso de RLHF o DPO no se documentan en la model card.

La innovacion tecnica relevante no esta en el entrenamiento sino en la conversion: los modelos se empaquetan en Core ML para iOS 18 o superior, con cache KV con estado (stateful) para evitar recalcular el contexto en cada turno y pesos cuantizados a 4 bits para reducir el uso de memoria en el dispositivo. No se especifican tecnicas de decodificacion especulativa, atencion lineal ni optimizaciones adicionales.

## Capacidades

- Generacion de texto conversacional, orientada a la aplicacion ghosty para iPhone.
- Razonamiento basico y respuesta a instrucciones, heredados del ajuste fino sobre Qwen3.
- Inferencia local en el dispositivo sin conexion a servidores, gracias al empaquetado Core ML.
- Conversacion multi-turno con cache KV con estado, siempre que el contexto efectivo lo permita.
- Soporte de tool calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; dependen del ajuste fino, que no se detalla.
- Vision o audio: no disponibles; son modelos exclusivamente de texto.
- Modo de pensamiento (thinking): no confirmado tras el ajuste fino.

## Casos de uso

- Asistente conversacional dentro de una aplicacion iOS: ghosty 8 Pro puede gestionar dialogos multi-turno en el propio telefono sin enviar datos a la nube, lo que resulta adecuado para privacidad y para uso sin conectividad.
- Funciones de texto sin conexion en apps moviles: resumen de notas, reescritura o generacion de respuestas breves usando ghosty 8, cuyo tamano de 1,7 mil millones de parametros encaja mejor en memoria de dispositivo.
- Clasificacion y extraccion de informacion local: etiquetado de mensajes, extraccion de entidades o categorizacion de contenido dentro de la app, sin coste de API.
- Prototipado de funciones de IA en iOS: util para desarrolladores que quieran evaluar el flujo Core ML con cache KV con estado antes de invertir en un modelo mayor.
- Autocompletado y sugerencias de texto en editores moviles: la latencia local y la ausencia de red son ventajas frente a llamadas a API.
- Filtrado previo y moderacion en el dispositivo: el modelo puede cribar contenido sensible antes de enviarlo a un servicio remoto, reduciendo datos expuestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido de GPU de escritorio; el modelo esta pensado para memoria unificada de iPhone. Como referencia, los pesos a 4 bits de un modelo de 1,7 mil millones de parametros ocupan del orden de 1 GB y los de 4 mil millones del orden de 2 a 2,5 GB, mas el coste del cache KV.
- GPU recomendadas: no se especifican; el destino es la GPU y la Neural Engine de los chips Apple A-series y M-series con iOS 18 o superior.
- Compatibilidad con GPU de consumo para escritorio: no documentada; el formato Core ML no es el habitual para RTX 4090, A100 o H100.
- Opciones de despliegue: Core ML en iOS 18 o superior; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato no es directamente compatible con ellos sin conversion adicional.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ghosty 8 | 1,7 mil millones | No disponible (base: 32.768) | Core ML, 4 bits | Apache 2.0 | Hugging Face, uso en app iOS |
| ghosty 8 Pro | 4 mil millones | No disponible (base: 32.768) | Core ML, 4 bits | Apache 2.0 | Hugging Face, uso en app iOS |
| Qwen3-1.7B | 1,7 mil millones | 32.768 tokens | Safetensors, GGUF y otros | Apache 2.0 | Hugging Face, ampliamente soportado |
| Qwen3-4B | 4 mil millones | 32.768 tokens | Safetensors, GGUF y otros | Apache 2.0 | Hugging Face, ampliamente soportado |

Frente a los modelos base, ghosty 8 y ghosty 8 Pro pierden versatilidad de despliegue (solo Core ML) y transparencia (sin datos de ajuste fino ni benchmarks), pero ganan en integracion directa con iOS. Para comparaciones de rendimiento con otras alternativas no hay datos publicados.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de la calidad del ajuste fino frente a los modelos base.
- Sin documentacion del dataset de ajuste fino: se desconocen sesgos introducidos, idiomas cubiertos y posibles degradaciones.
- Riesgo de alucinacion inherente a modelos de este tamano, especialmente en ghosty 8.
- Contexto efectivo no confirmado tras la conversion a Core ML; el cache KV con estado puede limitar la ventana real en dispositivos con poca memoria.
- Dependencia de plataforma: requiere iOS 18 o superior y no es utilizable en servidores ni en pipelines de escritorio sin conversion.
- Licencia Apache 2.0 permisiva para uso comercial, pero conviene conservar los avisos de atribucion a Qwen y al autor del ajuste fino.
- Repositorio sin descargas ni validacion de la comunidad: tratar como artefacto experimental y no como componente de produccion sin evaluacion propia.
- Idiomas soportados no declarados; el rendimiento en castellano no esta verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aedsdeesd/ghosty-models
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Documentacion de Core ML: no disponible en la informacion proporcionada
- Paper, blog o demo del ajuste fino: no disponible
