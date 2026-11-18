# HAL-X-AI/THX-02

## Resumen

THX-02 es un modelo de decisión con capacidad de razonamiento desarrollado por HAL-X-AI. A diferencia de los modelos generativos convencionales, THX-02 recibe un estado (un mensaje, un ticket, un documento, un registro JSON, una traza de agente, una imagen o un grafico) junto con un conjunto de preguntas tipadas redactadas en lenguaje natural, y devuelve para cada pregunta una distribución de probabilidad completa sobre las opciones suministradas. No genera texto libre salvo cuando activa su modo de pensamiento, y nunca inventa opciones que no esten en la peticion.

El modelo cuenta con 4.539.265.536 parametros (aproximadamente 4,5 B) mas un adaptador de pensamiento de 60 M, con un contexto entrenado de hasta 32.000 tokens por peticion. Es multimodal (hasta 4 imagenes por peticion), multilingue (entrenado y evaluado en mas de 20 idiomas durante el post-entrenamiento) y esta disenado para no requerir reentrenamiento cuando aparecen nuevas tareas: el conjunto de etiquetas forma parte de la propia peticion.

Su relevancia actual radica en que sustituye el patron de "prompt generativo + parseo de salida" por una interfaz de clasificacion nativa con probabilidades calibradas, latencias de decenas de milisegundos (mediana de 50 ms sin pensamiento y 79 ms con pensamiento en una RTX PRO 6000; 129 peticiones por segundo en una RTX 4090) y licencia Apache-2.0. THX-02 es el sucesor de THX-01 (0,3 B), sobre el que mejora de 11,30 a 65,06 en la misma evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decision; transformer multimodal segun la model card, sin detalle del backbone) |
| Parametros totales | 4.539.265.536 (4,5 B) + 60 M del adaptador de pensamiento |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 32.000 tokens por peticion (entrenado) |
| Tipos de cuantizacion | BF16 en GPU; BF16 o FP32 en CPU (no se documentan GGUF, INT8 ni INT4) |
| Idiomas soportados | en, az, zh, kk, uz, ky, ja, es, ru, tr (etiquetas de la model card); entrenado y evaluado en mas de 20 idiomas en post-entrenamiento |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna (tipo de backbone, atencion, capas) mas alla de que se trata de un modelo de decision multimodal que procesa texto, imagenes y graficos en la misma peticion (hasta 4 imagenes) y que incorpora un adaptador de pensamiento separado de 60 M de parametros. El modelo expone tres tipos de pregunta: `choice` (hasta 255 opciones), `noul` (si/no) y `score` (escala ordenada). La salida es siempre una distribucion de probabilidad sobre las opciones proporcionadas, con una confianza asociada, y no se emite texto libre salvo en el modo de pensamiento.

Sobre el entrenamiento, la model card unicamente indica que el modelo fue entrenado y evaluado en mas de 20 idiomas durante el post-entrenamiento y que el conjunto de etiquetas es parte de la peticion, de modo que no hace falta reentrenar para tareas nuevas. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon RLHF, DPO u otras tecnicas de alineacion. El modo de pensamiento es autocontrolado ("self-gated"): el modelo decide cuando escribir un pensamiento breve antes de responder, lo que anade latencia (de 50 a 79 ms de mediana en la RTX PRO 6000) y mejora la puntuacion en la evaluacion interna (65,06 con pensamiento frente a 63,83 sin el).

## Capacidades

- Clasificacion zero-shot con etiquetas definidas en la peticion, sin reentrenamiento por tarea.
- Salida de probabilidades calibradas sobre todas las opciones suministradas; el modelo no inventa opciones ni genera texto libre fuera del modo de pensamiento.
- Tres tipos de pregunta: `choice` (hasta 255 opciones), `noul` (si/no) y `score` (escala ordenada).
- Modo de pensamiento autocontrolado (`think="auto"`, `think=True`) para preguntas que requieren razonamiento.
- Multimodalidad: texto, imagenes y graficos en la misma peticion, hasta 4 imagenes.
- Multilingue: mas de 20 idiomas en post-entrenamiento; etiquetas oficiales en en, az, zh, kk, uz, ky, ja, es, ru y tr.
- Procesamiento por lotes mediante el endpoint `/v1/decide/batch`.
- Capacidad de actuar como componente de decision en agentes: en la demo de agente de pantalla elige botones numerados a partir de capturas para completar un objetivo.
- Uso en movil: el cliente de PyPI no tiene dependencias y funciona en Termux en Android.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el mensaje del cliente y devuelve la probabilidad de cada departamento (facturacion, soporte tecnico, ventas), con umbral de derivacion a humano cuando la confianza es baja (en la demo, un mensaje vago obtuvo 0,38 y se envio a revision humana). Es adecuado porque la latencia por lote es de centenares de milisegundos y las etiquetas se definen en la peticion.
- Control de calidad visual en linea de produccion: con un detector de vocabulario abierto que dibuja las cajas, THX-02 decide limpio, sucio o roto para cada huevo (16 por fotograma en una RTX 4090). El modelo es apropiado por su latencia y porque combina imagen y pregunta tipada en una sola llamada.
- Agente de interfaz (screen agent): dado un objetivo y capturas de pantalla con botones numerados, el modelo elige el siguiente control, como en la demo de reserva de un vuelo con restricciones de precio, fecha y horario.
- Extraccion de campos de documentos y registros JSON: se envian preguntas de tipo `choice` o `noul` sobre el registro y se obtiene una distribucion por campo, util para pipelines que necesitan umbrales de confianza en lugar de parsear texto generado.
- Analisis de sentimiento y prioridad en atencion al cliente: con preguntas de tipo `score` (por ejemplo, calma, molesta, enfadada) se obtiene una escala ordenada con probabilidades, y en la demo se procesaron 24 mensajes en 16 idiomas en una sola llamada de 641 ms.
- Enrutado de decisiones dentro de pipelines de agentes: el modelo actua como capa de decision rapida (50-79 ms de mediana) que selecciona la siguiente accion a partir de una traza del agente, adecuado para bucles multi-paso donde la latencia importa.
- Lectura de graficos: el ejemplo de la model card decide en que ano el tipo de interes real fue mas negativo a partir de un grafico de inflacion y tipo de politica, combinando vision y pregunta `choice`.

## Benchmarks y rendimiento

| Benchmark | THX-02 con pensamiento | THX-02 sin pensamiento | THX-01 (0,3 B) |
|---|---|---|---|
| Decision Index 0.3 (indice publico) | 65,06 | 63,83 | 11,30 |
| Decision Vision Index (conjuntos publicos) | 72,19 | no disponible | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos de latencia y throughput indicados por el autor son: mediana de 50 ms por peticion sin pensamiento y 79 ms con pensamiento en una RTX PRO 6000; 129 peticiones por segundo en una RTX 4090; lote de 24 mensajes en 641 ms en una RTX 4090.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 4,5 B parametros en BF16 el peso ronda los 9 GB, mas overhead de activaciones y del procesador de vision, por lo que se recomienda margen sobre esa cifra.
- GPU recomendadas segun el autor: RTX 4090 y RTX PRO 6000 (ambas citadas en las mediciones de latencia y throughput de la model card).
- GPU de consumo: el modelo se ha ejecutado en una RTX 4090 (24 GB), por lo que cabe en GPU de consumo de gama alta; no se documenta su comportamiento en GPU con menos VRAM.
- Despliegue: paquete `thx02` de PyPI con cliente sin dependencias y servidor local (`THX02.load(...)`), ruta GPU compilada mediante `requirements-fast.txt`, y API alojada en `api.hal-x.ai` con endpoint `/v1/decide/batch`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- CPU: soportada en BF16 o FP32 (`THX02.load(".", device="cpu")`); no se publican metricas de latencia en CPU.
- Movil: cliente compatible con Termux en Android.
- Latencia y throughput: mediana de 50 ms sin pensamiento y 79 ms con pensamiento en RTX PRO 6000; 129 peticiones por segundo en RTX 4090; 24 decisiones en 641 ms por lote en RTX 4090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| THX-02 | 4,5 B + 60 M (adaptador) | 32k tokens por peticion | Modelo de decision con probabilidades calibradas, multimodal y modo de pensamiento | Apache-2.0 | Hugging Face, PyPI y API alojada |
| THX-01 | 0,3 B | no disponible | Predecesor del mismo fabricante, modelo de decision | no disponible en la informacion | Hugging Face (repo del autor original) |
| Modelos generativos de proposito general de ~4 B | ~4 B | variable | Generacion de texto libre con parseo posterior de salida | variable | variable |

No se dispone de datos de benchmarks de terceros comparables en la informacion proporcionada; la unica comparacion publicada es frente a THX-01 en el Decision Index 0.3 (65,06 frente a 11,30).

## Limitaciones y advertencias

- Modelo de decision, no generativo: no produce texto libre fuera del modo de pensamiento; no es adecuado para tareas de generacion abierta.
- Riesgo de calibracion deficiente fuera de dominio: la model card recomienda derivar a revision humana cuando la confianza es baja (en la demo se uso un umbral de 0,60), lo que implica que la probabilidad no debe tratarse como verdad absoluta en produccion.
- Sesgos: no se documentan sesgos conocidos ni evaluaciones de equidad en la informacion disponible; al entrenarse en mas de 20 idiomas, el rendimiento puede variar entre lenguas y las etiquetas oficiales cubren solo 10 idiomas.
- Cobertura idiomatica limitada en la model card: las etiquetas de idioma listan en, az, zh, kk, uz, ky, ja, es, ru y tr, aunque el texto menciona mas de 20 idiomas en post-entrenamiento; no se especifica el nivel por idioma.
- Contexto: 32k tokens por peticion; los documentos o trazas mas largas requieren troceado.
- Imagenes: maximo de 4 por peticion.
- Opciones: el tipo `choice` admite hasta 255 opciones; no se documenta el comportamiento con conjuntos mayores.
- Licencia Apache-2.0: permite uso comercial, pero no se detallan garantias ni condiciones adicionales en la informacion disponible.
- Dependencia de la API alojada: el nivel gratuito esta limitado por IP y requiere clave para uso intensivo; para produccion hay que desplegar el modelo o contratar el servicio.
- Fecha de creacion del repositorio (2026-10-23) y actualizacion (2026-11-13) segun los metadatos de Hugging Face.

## Enlaces

- Hugging Face: https://huggingface.co/HAL-X-AI/THX-02
- Predecesor THX-01: https://huggingface.co/doofz/THX-01
- Referencia de la API: https://api.hal-x.ai/docs/thx-02
- Paquete PyPI: `thx02` (cliente, servidor local y comando `thx02`)
