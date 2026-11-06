# Maincode/Matilda-Decision-v1-Edge

## Resumen

Matilda Decision v1 Edge es un modelo de decisión multimodal de 0,85B parámetros desarrollado por Maincode, diseñado para ejecución en dispositivo (on-device) y escenarios de muy alto rendimiento. A diferencia de un LLM generativo convencional, no produce texto: recibe un estado (texto o JSON, opcionalmente con imágenes) y un conjunto de preguntas, y devuelve en una sola llamada una probabilidad para cada respuesta posible (elección entre opciones, sí/no o puntuación en escala).

El modelo es un ajuste (post-training) de Qwen3.5-0.8B, al que se le añade una cabeza de lectura de decisiones de hasta 255 opciones. Está pensado como componente de "sistema uno" en arquitecturas de agentes: enrutado de peticiones, validaciones rápidas, clasificación zero-shot y triaje, donde la latencia y el coste importan más que la generación libre de texto.

Su relevancia actual radica en la tendencia a separar la toma de decisiones estructurada de la generación de texto en pipelines de IA, usando modelos pequeños y especializados. Comparte formato de peticiones y respuestas con Matilda Decision v1 (27B), lo que permite escalar entre edge y servidor sin cambiar la integración. Se distribuye bajo licencia Apache-2.0 en safetensors y requiere `trust_remote_code=True` porque necesita su runtime propio con atención bidireccional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone vision-lenguaje Qwen3.5-0.8B con cabeza de decision de 255 opciones, atencion bidireccional en capas full-attention |
| Parametros totales | 852.985.920 (0,85B, incluido el codificador de vision) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 131.072 tokens (las entradas no se truncan; peticiones mayores generan error) |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamano del repo: 1,7 GB) |

## Arquitectura y entrenamiento

El modelo parte del backbone vision-lenguaje Qwen3.5-0.8B y anade una cabeza de decision que lee la respuesta desde la posicion final del prompt. Cada pregunta se resuelve en una sola pasada hacia adelante (forward pass), sin decodificacion autorregresiva, lo que explica su baja latencia. Soporta tres tipos de decision: `choice` (1 a 255 opciones con probabilidades por opcion y confianza), `noul` (si/no, devuelve la probabilidad de verdadero) y `score` (nivel esperado sobre una escala con descripciones, con probabilidades y leyenda).

La innovacion tecnica mas destacable es el entrenamiento con **atencion bidireccional**: las capas de atencion completa ven todo el prompt a la vez, no solo los tokens anteriores a cada posicion. Esto obliga a servir el modelo con el runtime incluido (`matilda_decision_runtime.py`, cargado con `trust_remote_code=True`); servir los pesos como un backbone causal convencional, o en un motor causal estandar, produce respuestas distintas y peores. Sobre el entrenamiento, la model card indica unicamente que se realizo post-training desde Qwen3.5-0.8B sobre decisiones en texto e imagenes; no se detallan tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO.

## Capacidades

- Clasificacion zero-shot entre 1 y 255 opciones, con probabilidades por opcion y medida de confianza.
- Respuestas binarias si/no (tipo `noul`), devueltas como probabilidad de verdadero, con descripciones opcionales para cada lado.
- Puntuacion en escalas (tipo `score`) con niveles descritos, devolviendo el nivel esperado, probabilidades y leyenda.
- Respuesta a multiples preguntas en una sola llamada, compartiendo el mismo estado e imagenes.
- Entradas multimodales: texto o JSON arbitrario como estado, mas varias imagenes por peticion (hasta 0,26 MP cada una, unos 512 x 512; un token por parche de 32 x 32, unas 256 tokens por imagen de 512 x 512).
- Lectura del estado como datos, no como instrucciones, lo que reduce el riesgo de inyeccion de prompt desde el contenido.
- Sin generacion de texto: salida estructurada y determinista en formato JSON con bloque de `usage`.
- No soporta (por diseño): generacion de texto libre, tool calling, razonamiento multi-paso ni modo thinking.

## Casos de uso

- Enrutado de tickets de atencion al cliente: clasificar cada solicitud entrante entre equipos (devoluciones, facturacion, soporte tecnico) con una llamada de milisegundos y probabilidades de confianza para derivar a revision humana los casos dudosos.
- Validacion de documentos con vision: comprobar si un recibo adjunto corresponde al producto reclamado o determinar el metodo de pago a partir de la imagen, combinando estado textual y fotos en la misma peticion.
- Triaje y priorizacion automatica: asignar puntuaciones de urgencia (por ejemplo, rutina / pronto / hoy) a incidencias o mensajes entrantes antes de pasarlos a un agente generativo mas costoso.
- Moderacion y filtrado de contenido: decisiones binarias o por categorias sobre mensajes, resenas o imagenes subidas por usuarios, integrable en pipelines de alto throughput.
- Orquestacion de agentes como "sistema uno": el modelo decide que herramienta invocar o que rama seguir en un grafo de agentes, reservando el LLM generativo para los pasos que realmente necesitan redactar texto.
- Extraccion de campos estructurados en flujos ETL: dado un JSON o documento como estado, responder si cumple condiciones concretas (tiene factura, esta firmado, supera un umbral) sin generar texto libre.
- Despliegue en dispositivo (edge): con 0,85B parametros y 1,7 GB de pesos, es viable su ejecucion local para decisiones sin envio de datos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card tampoco aporta cifras de latencia o throughput; solo indica que el modelo esta orientado a uso on-device y de muy alto rendimiento, y que cada pregunta se resuelve en una unica pasada hacia adelante.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente; con 0,85B parametros en fp16 (~1,7 GB de pesos), es razonable estimar del orden de 2-3 GB de VRAM incluyendo activaciones y el codificador de vision, aunque es una estimacion no confirmada por el autor.
- GPU recomendadas: no disponible. Por tamano, cualquier GPU moderna con ~4 GB de VRAM deberia bastar; tambien es candidato a ejecucion en CPU dado su reducido tamano (sin dato oficial de rendimiento en CPU).
- Consumer GPU: por tamano, cabe sobradamente en GPUs de consumo (RTX 3060, RTX 4060 o superiores), pero no hay validacion publicada por el autor.
- Despliegue: via `transformers` (version 5.17.0 indicada en el quickstart) con `AutoModel.from_pretrained(..., trust_remote_code=True)`. Es imprescindible usar el runtime incluido, que configura la atencion bidireccional; no es compatible con motores causales estandar (vLLM, TGI, llama.cpp, Ollama) sin adaptacion, y no hay constancia de soporte en ellos. El paquete `flash-linear-attention` es opcional y aporta kernels rapidos para GPU en las capas de atencion lineal.
- Latencia y throughput: no disponibles. Al no generar texto y resolver cada pregunta en un forward pass, la latencia deberia ser inferior a la de un LLM generativo equivalente, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| | Matilda Decision v1 Edge | Matilda Decision v1 | Qwen/Qwen3.5-0.8B (base) |
|---|---|---|---|
| Autor | Maincode | Maincode | Qwen |
| Parametros | 0,85B (con vision) | 27B | 0,8B |
| Tarea | Decision estructurada (choice/si-no/score) | Decision estructurada (mismo formato) | LLM generativo generalista |
| Multimodal | Si (imagenes hasta 0,26 MP) | Si | Si (backbone VL) |
| Generacion de texto | No | No | Si |
| Contexto | 131.072 tokens | 131.072 tokens (segun familia) | no disponible |
| Licencia | Apache-2.0 | Apache-2.0 | Apache-2.0 |

La alternativa natural dentro de la misma familia es Matilda Decision v1 (27B), que acepta las mismas peticiones y devuelve respuestas en el mismo formato: la version Edge cubre el caso edge y alto throughput, mientras que la de 27B cubriria los casos que requieran mayor capacidad de decision. Frente al Qwen3.5-0.8B base, Matilda Decision Edge no compite en generacion de texto, sino que ofrece salidas probabilisticas estructuradas optimizadas para decision. No hay datos de benchmarks que permitan comparar rendimiento numerico.

## Limitaciones y advertencias

- No genera texto: si el caso de uso requiere redaccion, razonamiento multi-paso, tool calling o agentes conversacionales, este modelo no es adecuado por diseño.
- Requiere servir con atencion bidireccional mediante su runtime propio (`trust_remote_code=True`); cargar los pesos como backbone causal o en un motor causal estandar degrada las respuestas. Esto limita la compatibilidad con infraestructuras de inferencia habituales.
- Las imagenes se redimensionan a un maximo de 0,26 MP (unos 512 x 512); el detalle fino en graficos, documentos o texto pequeno se pierde, y los ajustes por encima de 0,26 MP no estan validados.
- El estado se lee como datos y no como instrucciones, lo que mitiga la inyeccion de prompt, pero las preguntas y criterios definidos por el desarrollador siguen siendo sensibles a errores de especificacion.
- No hay benchmarks publicados ni cifras de latencia/throughput, por lo que su rendimiento real debe validarse en cada caso de uso.
- Idiomas soportados: no disponible; conviene verificar el comportamiento en castellano antes de produccion.
- Sesgos conocidos y tasa de alucinacion: no disponibles; al devolver probabilidades, se recomienda establecer umbrales de confianza y derivar a revision humana los casos inciertos.
- Licencia Apache-2.0: sin restricciones relevantes para uso comercial; el modelo base Qwen3.5-0.8B tambien es Apache-2.0.
- Peticiones que superen 131.072 tokens generan error (no hay truncado), por lo que la aplicacion debe validar el tamano de entrada.
- Adopcion muy temprana: 29 descargas y 3 likes en el momento de la ficha, sin historial comunitario ni auditorias de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maincode/Matilda-Decision-v1-Edge
- Modelo hermano de 27B: https://huggingface.co/Maincode/matilda-decision-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia Apache-2.0: https://huggingface.co/Maincode/Matilda-Decision-v1-Edge/blob/main/LICENSE
- Paper, blog o demo: no disponibles en la informacion proporcionada.
