# rSalone/PLaMo-3-8B-Fin-Instruct-GGUF

## Resumen

PLaMo 3 8B Fin Instruct GGUF es una conversión no oficial al formato GGUF del modelo pfnet/plamo-3-8b-fin-instruct, desarrollado originalmente por Preferred Networks. El modelo base es un transformer denso de 8.531.750.912 parámetros (aproximadamente 8,5 mil millones) especializado en tareas financieras en japonés, afinado con instrucciones para su uso conversacional. Esta versión GGUF la publica el usuario independiente rSalone para permitir su ejecución con llama.cpp en hardware de consumo, sin edición de pesos ni entrenamiento adicional.

La relevancia de esta ficha radica en que el modelo original solo se distribuye en safetensors BF16, lo que exige GPUs con amplia VRAM. La conversión a GGUF con cuantizaciones Q8_0 (9,07 GB) y Q4_K_M (5,28 GB) abre la puerta a la inferencia local en CPU y en GPUs de gama media, manteniendo el soporte de plantilla de chat, separación de razonamiento (`reasoning_content`) y tool calling, aunque este último requiere opciones específicas de arranque en llama.cpp.

El modelo está pensado para el dominio financiero japonés: consultas sobre instrumentos, análisis de documentos y asistencia en flujos de trabajo del sector. Su licencia PLaMo Community impone condiciones estrictas para uso comercial, incluyendo registro previo ante Preferred Networks y un límite de facturación anual de 1.000 millones de yenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no se detalla en la informacion disponible) |
| Parametros totales | 8.531.750.912 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de arranque usa `-c 16384`) |
| Tipos de cuantizacion | Q8_0 y Q4_K_M (unica conversion publicada) |
| Idiomas soportados | Japones (ja) |
| Licencia | PLaMo Community License (other) |
| Formato de pesos | GGUF (derivado de safetensors BF16 del modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de que se trata de un transformer denso de unos 8,5 mil millones de parametros. No se especifican el numero de capas, la dimension oculta, el tipo de atencion ni si emplea mecanismos como RoPE o GQA. Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del corpus financiero japones utilizado ni las etapas de alineacion (RLHF, DPO o similares) aplicadas por Preferred Networks.

Lo que si se conoce es el proceso de conversion: se partio del modelo en BF16, se convirtio a GGUF con `convert_hf_to_gguf.py` de llama.cpp v0.9.0 y se cuantizo con `llama-quantize` de la misma version. No hubo edicion de pesos ni entrenamiento adicional. La plantilla de chat queda embebida en el GGUF y separa el proceso de razonamiento (`reasoning_content`) de la respuesta final (`content`), lo que sugiere que el modelo base incorpora un modo de pensamiento explicito. El soporte de tool calling utiliza tokens de control propios (`<|plamo:constrain|>`, `<|plamo:msg|>` y `<|plamo:tag|>`), un detalle relevante para integraciones con llama-server.

## Capacidades

- Generacion de texto conversacional en japones con plantilla de chat integrada.
- Razonamiento explicito separado de la respuesta final mediante el campo `reasoning_content`.
- Tool calling / function calling, con la salvedad de que en llama.cpp v0.9.0 requiere `--special` en el arranque y `<|plamo:tag|>` en el parametro `stop`.
- Especializacion en dominio financiero: el nombre `fin-instruct` y la model card indican afinado para tareas del sector financiero japones.
- Generacion multirrespuesta en un unico turno con parada controlada al final de la respuesta.
- No se documentan capacidades de vision, audio, codigo general ni matematicas avanzadas en la informacion disponible.
- Multilingue limitado: el unico idioma declarado es el japones.

## Casos de uso

- Asistencia en analisis de documentos financieros en japones: el modelo puede resumir y extraer datos de informes anuales, estados financieros o memorandos internos, aprovechando su afinado especifico en el dominio y su ventana de contexto configurable en llama-server.
- Consultas sobre instrumentos financieros con tool calling: integrado en un agente que invoca funciones como `get_stock_price` (ejemplo documentado por el autor) para recuperar cotizaciones en tiempo real y redactar la respuesta en japones.
- Chatbot interno para equipos de banca o inversion: despliegue en llama-server con cuantizacion Q4_K_M en una estacion de trabajo, ofreciendo conversaciones multi-turno en japones sin salida a servicios en la nube.
- Generacion de borradores de informes y notas de analisis: el modo de razonamiento separado permite revisar la cadena de pensamiento antes de publicar la respuesta final, util para auditoria interna.
- Formacion y soporte a empleados del sector financiero: respuestas guiadas sobre productos, normativa interna o procedimientos, con la ventaja de ejecucion local y sin fuga de datos a terceros.
- Prototipado de pipelines de agentes financieros en llama.cpp: el soporte de tool calling y la separacion de razonamiento permiten construir flujos multi-paso para tareas como conciliacion de datos o extraccion estructurada.
- Evaluacion comparativa de modelos japoneses en local: al ser una conversion GGUF ligera (5,28 GB en Q4_K_M), sirve para pruebas de calidad en CPU o GPUs de consumo antes de invertir en infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor de la conversion indica explicitamente que no ha evaluado la precision en benchmarks financieros ni ha probado la ejecucion en GPU. La unica verificacion reportada es funcional, en llama.cpp v0.9.0 para CPU:

| Comprobacion | Q8_0 | Q4_K_M |
|---|---|---|
| Generacion de razonamiento y respuesta en japones | Confirmado | Confirmado |
| Parada de generacion al final de la respuesta | No confirmado | Confirmado |
| Separacion de razonamiento y respuesta en llama-server | No confirmado | Confirmado |
| Tool calling (una consulta, con opciones especiales) | No confirmado | Confirmado |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,5-10 GB para Q8_0 y 5,5-6,5 GB para Q4_K_M, considerando pesos mas cache KV para contextos moderados.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 4080 (16 GB) para Q8_0 con contexto amplio; RTX 4060 Ti (16 GB), RTX 4070 (12 GB) o RTX 3060 (12 GB) para Q4_K_M.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas para Q4_K_M y 12 GB o mas para Q8_0, dependiendo de la longitud de contexto.
- Despliegue: llama.cpp (llama-server, llama-cli) es el soporte verificado; tambien es compatible con Ollama y otros frontends que consuman GGUF, aunque no se ha validado en la informacion disponible.
- Latencia y throughput: no disponibles. El autor solo confirma ejecucion en CPU con llama.cpp v0.9.0, sin cifras de rendimiento.
- Nota operativa: para tool calling es necesario arrancar con `--special` y enviar `<|plamo:tag|>` en `stop`; de lo contrario, llama-server devuelve HTTP 500 por formato incompatible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. A modo orientativo, se puede contrastar con el modelo base del que deriva:

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rSalone/PLaMo-3-8B-Fin-Instruct-GGUF | 8,53 B | No disponible | GGUF (Q8_0, Q4_K_M) | PLaMo Community | Hugging Face |
| pfnet/plamo-3-8b-fin-instruct | 8,53 B | No disponible | Safetensors BF16 | PLaMo Community | Hugging Face |

No se han identificado en la informacion disponible otros modelos financieros japoneses de tamano comparable con los que establecer una comparacion fiable de rendimiento.

## Limitaciones y advertencias

- Conversion no oficial: no la mantiene Preferred Networks y puede no recoger futuras actualizaciones del modelo base.
- Solo japones: no se declara soporte de castellano ni de otros idiomas, por lo que su uso fuera del japones no esta garantizado.
- Riesgo de alucinacion: como todo modelo generativo, puede producir datos financieros incorrectos; la licencia prohibe explicitamente usar sus salidas como unica evidencia, evaluacion u opinion en decisiones legales, medicas, financieras o de evaluacion de personas (clausula 7).
- Licencia restrictiva para uso comercial: requiere registro previo en la pagina de Preferred Networks y estar por debajo de 1.000 millones de yenes de facturacion o ventas en el ultimo ejercicio fiscal (clausula 3).
- Tool calling fragil en llama.cpp v0.9.0: sin `--special` y sin `stop` con `<|plamo:tag|>` falla con HTTP 500 o deja tokens residuales al final de la respuesta.
- Verificacion incompleta: el autor no ha probado la ejecucion en GPU ni la calidad en benchmarks financieros; la cuantizacion Q8_0 no tiene confirmada la parada de generacion ni la separacion de razonamiento.
- Contexto no documentado: se desconoce la longitud maxima de contexto del modelo base; el valor `16384` del ejemplo es solo una configuracion de arranque, no una especificacion oficial.
- Sesgos: no se documentan sesgos conocidos, pero el entrenamiento centrado en el dominio financiero japones puede introducir sesgos sectoriales y culturales no evaluados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/rSalone/PLaMo-3-8B-Fin-Instruct-GGUF
- Modelo base: https://huggingface.co/pfnet/plamo-3-8b-fin-instruct
- Licencia PLaMo Community (ingles): https://plamo.preferredai.jp/info/plamo-community-license-en
- Licencia PLaMo Community (japones): https://plamo.preferredai.jp/info/plamo-community-license-ja
- Formulario de registro para uso comercial: https://forms.gle/mTL8tBLrMYXKNZD56
- llama.cpp: https://github.com/ggml-org/llama.cpp
