# Calandracas/Qwen3.8-27B-heretic-ara-exl3-SC-4.90bpw

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino una cuantizacion EXL3 de 4,90 bits por peso (bpw) del modelo Calandracas/Qwen3.8-27B-heretic-ara, que a su vez es una variante optimizada de Qwen/Qwen3.8-27B. La publica el usuario Calandracas bajo licencia Apache 2.0 y esta pensada para ejecutarse en runtimes compatibles con ExLlamaV3, como TabbyAPI. El objetivo es reducir el coste de memoria del modelo original manteniendo la fidelidad de salida respecto al source en bf16, medida como divergencia KL (KLD).

El rasgo diferencial es el uso del pipeline de cuantizacion autocalibrada (SC) de ExLlamaV3: en lugar de aplicar una tasa de bits uniforme, se mide la sensibilidad de cada tensor mediante inyeccion de ruido con forma LDLQ y se resuelve una asignacion exacta de presupuesto a 4,5 bpw, promoviendo despues los tensores mas criticos a 6 bits. El resultado son 400 tensores cuantizados con tasas de 4 o 6 bits, lm_head a 8 bits, cabecera MTP a 4 bits y embeddings y torre de vision en bf16. La calibracion se hizo con una traza autogenerada de aproximadamente 726 000 tokens de salida conversacional y de razonamiento del propio modelo en 19 idiomas, en lugar del corpus web por defecto.

Es relevante ahora porque demuestra una via practica para servir modelos de ~27 000 millones de parametros en GPUs de consumo y en hardware AMD: el autor reporta mas de 90 tok/s en 2x RX 7900 XTX con MTP=4. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de estas cifras.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (el repositorio es una cuantizacion; el identificador del modelo base sugiere una arquitectura transformer de la familia Qwen3.8, no confirmada) |
| Parametros totales | aproximadamente 27 000 millones, deducido del identificador Qwen3.8-27B; no confirmado en la tarjeta |
| Parametros activos | no disponible (no se indica si el modelo base es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 autocalibrada a 4,90 bpw medio: 160 tensores lineales a 4 bpw y 240 a 6 bpw, lm_head a 8 bpw, cabecera MTP a 4 bpw; embeddings y torre de vision en bf16 |
| Idiomas soportados | no disponible como listado oficial; la traza de calibracion cubre 19 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | EXL3 (para runtimes compatibles con ExLlamaV3); no se especifica el formato de contenedor en la informacion disponible |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura del modelo base Qwen3.8-27B ni el procedimiento de entrenamiento del modelo heretic-ara. Lo que si se deduce de la tarjeta es que el modelo original incorpora al menos dos componentes adicionales a un cuerpo transformer: una torre de vision, que se conserva en bf16 pero se declara como "text-only serving", y una cabecera MTP (multi-token prediction), cuantizada a 4 bpw. La presencia de una traza de calibracion con salidas "chat/reasoning" templadas indica que el modelo base esta ajustado para conversacion y razonamiento con plantillas propias. El significado de los sufijos "heretic" y "ara", y el detalle de que tipo de ajuste se aplico (si fue un fine-tune, una ablacion de direcciones de rechazo o un entrenamiento con RLHF/DPO), no se documenta en la informacion disponible.

Lo que si esta plenamente documentado es el proceso de cuantizacion, que es la aportacion tecnica real de este repositorio. Se ejecuto la cadena sc_trace, sc_rfn_probe, sc_measure --shaped, sc_optimize y convert con las opciones -rcp y -cd. Primero se midio la sensibilidad de cada tensor en el modelo sin cuantizar mediante inyeccion de ruido con forma LDLQ y un objetivo de KLD contra la salida limpia, con amplitudes ancladas a una conversion previa a 4,5 bpw. Con esas medidas se resolvio una asignacion voraz exacta del presupuesto de bits a 4,5 bpw y despues se restringio a las tasas que mantienen activas las rutas de kernel rapidas por lotes y de MTP, lo que obligo a promover cinco tensores de K=5 a K=6. La compensacion LDLQ se calibro sobre la traza autogenerada de unos 726 000 tokens en 19 idiomas, en dominio, en lugar del mix de corpus web por defecto. El resultado medido es una KLD media de 0,004659 frente al source en bf16, frente a 0,005923 de la variante SC a 4,50 bpw antes de la promocion y 0,018280 de una EXL3 uniforme a 4,5 bpw con criterio ends-first.

## Capacidades

- Generacion de texto conversacional y de razonamiento: la traza de calibracion se construyo a partir de salidas templadas de chat y razonamiento del propio modelo, lo que confirma que el modelo base expone ese modo de uso.
- Capacidades multimodales en el modelo base: existe una torre de vision en el checkpoint, aunque en este repositorio se mantiene en bf16 y se declara servicio solo de texto, por lo que la inferencia visual no esta soportada de facto.
- Prediccion multi-token: la cabecera MTP se conserva cuantizada a 4 bpw y se uso para las mediciones de throughput, de modo que la decodificacion especulativa con MTP es una capacidad operativa en los runtimes compatibles.
- Multilingue: la traza de calibracion abarca 19 idiomas, pero no se publica la lista ni la cobertura por idioma.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada como capacidad declarada; solo se menciona que la traza incluye salidas de razonamiento.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de un modelo de ~27 000 millones de parametros en hardware de gama alta de consumo: al ocupar aproximadamente 4,90 bits por peso en el cuerpo, el checkpoint permite servir una clase de modelo que en bf16 requeriria del orden de 54 GB solo en pesos, en GPUs de 24 GB con contexto moderado.
- Inferencia de alto rendimiento en AMD: el autor reporta mas de 90 tok/s en 2x RX 7900 XTX con MTP=4, lo que hace viable el uso en estaciones con GPUs RDNA3 bajo ROCm en lugar de CUDA.
- Servicio de chat multiusuario con TabbyAPI: al conservar tasas de tensor restringidas a K=4 y K=6, se mantienen las rutas de kernel por lotes rapidas, lo que favorece escenarios de concurrencia moderada en un servidor de inferencia.
- Generacion de razonamiento y texto largo en local: la calibracion en dominio sobre salidas de razonamiento del propio modelo reduce la degradacion en ese tipo de generaciones frente a una cuantizacion uniforme, segun la KLD medida.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio sirve como caso de referencia reproducible para comparar asignacion uniforme frente a asignacion por sensibilidad, con metricas KLD publicadas para tres configuraciones.
- Sustitucion de un despliegue bf16 con restriccion de VRAM: cuando el modelo original ya funciona pero no cabe con el contexto necesario, esta version permite mantener el mismo runtime (ExLlamaV3) reduciendo la huella de memoria a costa de una KLD media de 0,004659.
- Prototipado de aplicaciones multilingues: la calibracion cubre 19 idiomas, lo que reduce el riesgo de degradacion desproporcionada en idiomas no ingleses, aunque no se publica la lista de idiomas ni evaluaciones por idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni metricas equivalentes). El unico dato cuantitativo de calidad es la divergencia KL frente al source en bf16, medida sobre 6 filas de 1024 tokens de la traza en dominio.

| Cuantizacion | KLD media vs bf16 |
|---|---|
| EXL3 uniforme 4,5 bpw (ends-first) | 0,018280 |
| SC 4,50 bpw (antes de la promocion K=5 a K=6) | 0,005923 |
| SC 4,90 bpw (este repositorio) | 0,004659 |

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 16,5 GB correspondientes al cuerpo cuantizado (27 000 millones de parametros a 4,90 bits por peso, es decir 0,6125 bytes por parametro). Es una estimacion aritmetica, no una cifra publicada por el autor.
- Componentes adicionales en precision alta: embeddings y torre de vision en bf16 y lm_head a 8 bits suman varios gigabytes extra; no se publica el desglose exacto, por lo que el total real de pesos podria situarse en el entorno de 19 a 21 GB segun la configuracion del modelo base.
- Cache KV: no disponible; condiciona la longitud de contexto alcanzable en una GPU de 24 GB.
- GPU verificadas por el autor: 2x RX 7900 XTX (24 GB cada una), con las que se midieron mas de 90 tok/s con MTP=4.
- GPUs plausibles por capacidad de memoria: RTX 4090, RTX 3090, RX 7900 XTX y tarjetas de 24 GB en adelante, siempre que el runtime EXL3 este disponible para la plataforma. No se han publicado mediciones para estas tarjetas.
- Opciones de despliegue: ExLlamaV3 y runtimes compatibles como TabbyAPI. No se distribuye GGUF, por lo que llama.cpp y Ollama no pueden consumir el checkpoint tal cual sin una reconversion.
- Latencia y throughput: mas de 90 tok/s en 2x RX 7900 XTX con MTP=4 (medicion del autor, sin datos de latencia por token ni de rendimiento en otras plataformas).

## Comparativa con modelos similares

No se dispone de datos publicados de otros modelos comparables (parametros, contexto, rendimiento o licencia) en la informacion proporcionada, por lo que la comparativa externa queda como no disponible. La unica comparacion documentada es interna, entre las tres configuraciones de cuantizacion evaluadas por el autor:

| Variante | bpw medio | KLD media vs bf16 | Notas |
|---|---|---|---|
| EXL3 uniforme 4,5 bpw (ends-first) | 4,5 | 0,018280 | Referencia de asignacion uniforme |
| EXL3 SC 4,50 bpw | 4,50 | 0,005923 | Asignacion por sensibilidad, antes de la promocion K=5 a K=6 |
| EXL3 SC 4,90 bpw (este repositorio) | 4,90 | 0,004659 | 160 tensores a 4 bpw, 240 a 6 bpw, lm_head a 8 bpw, MTP a 4 bpw |

## Limitaciones y advertencias

- Validacion nula por parte de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones independientes que confirmen la KLD reportada ni el throughput declarado.
- Sesgos y comportamiento del modelo base: al ser una cuantizacion de una variante "heretic-ara", hereda cualquier modificacion de alineamiento que se haya aplicado en ese ajuste. El sufijo "heretic" no se explica en la tarjeta; si corresponde a una atenuacion del comportamiento de rechazo, el riesgo de generar contenido inapropiado o dañino aumenta y no hay evaluacion de seguridad publicada.
- Riesgo de alucinacion: no se publica ninguna medicion de veracidad (TruthfulQA, tasas de alucinacion en resumen o RAG), por lo que el comportamiento en ese eje es desconocido y probablemente heredado del modelo base.
- Degradacion por cuantizacion: aunque la KLD es baja, no es cero (0,004659). Los efectos son mas probables en tareas de contexto largo, razonamiento de muchos pasos, codigo de baja frecuencia y matematicas de precision. Los embeddings y la torre de vision permanecen en bf16, pero el cuerpo no.
- Calibracion en dominio: la traza de calibracion son 726 000 tokens generados por el propio modelo. Esto optimiza la fidelidad en dominios parecidos a sus propias salidas y puede no representar dominios muy distintos (documentos legales, texto cientifico, corpus con jerga tecnica).
- Idiomas: se mencionan 19 idiomas en la calibracion, pero no se publica la lista, el reparto de tokens por idioma ni evaluaciones por idioma. El rendimiento en idiomas poco representados es desconocido.
- Contexto: la longitud de contexto soportada no se especifica, y el limite practico dependera de la cache KV y de la VRAM disponible.
- Dependencia de runtime: el checkpoint esta atado a EXL3 y a ExLlamaV3/TabbyAPI. No hay GGUF, lo que descarta llama.cpp, Ollama y otras rutas de despliegue habituales, y reduce la portabilidad.
- Restricciones de licencia: la tarjeta declara apache-2.0, lo que en principio permite uso comercial, pero conviene verificar la licencia del modelo base Qwen/Qwen3.8-27B y del intermedio heretic-ara, ya que una cuantizacion no puede relajar las condiciones de la obra derivada.
- Uso multimodal: la torre de vision se conserva en el checkpoint pero el autor la declara para servicio solo de texto, por lo que no debe asumirse capacidad de vision en produccion.
- Fechas: el repositorio esta creado y actualizado el 2026-10-13, con menos de un minuto entre ambos eventos, lo que sugiere una publicacion sin revision posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Calandracas/Qwen3.8-27B-heretic-ara-exl3-SC-4.90bpw
- Modelo base intermedio (heretic-ara): https://huggingface.co/Calandracas/Qwen3.8-27B-heretic-ara
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- ExLlamaV3 (runtime recomendado): https://github.com/turboderp-org/exllamav3
- TabbyAPI: mencionado en la tarjeta como runtime compatible, sin URL en la informacion proporcionada.
