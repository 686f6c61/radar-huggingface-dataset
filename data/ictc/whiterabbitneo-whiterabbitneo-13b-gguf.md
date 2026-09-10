# ictc/whiterabbitneo-WhiteRabbitNeo-13B-GGUF

## Resumen

WhiteRabbitNeo-13B-GGUF es una redistribucion en formato GGUF del modelo WhiteRabbitNeo-13B, publicada por el usuario ictc en HuggingFace. Se trata de un modelo de generacion de texto de 13.016.028.160 parametros (aproximadamente 13,0 mil millones) derivado del proyecto original alojado en el repositorio whiterabbitneo/WhiteRabbitNeo-13B, y convertido a GGUF para permitir inferencia en CPU y en GPU con herramientas basadas en llama.cpp. La ficha no documenta el modelo base, el proceso de entrenamiento ni la longitud de contexto, por lo que buena parte de las especificaciones tecnicas quedan como no disponibles.

El interes de esta publicacion es fundamentalmente practico: el formato GGUF permite despliegue en un solo fichero con carga por mmap, metadatos en estructura clave-valor y ejecucion en hardware de consumo sin necesidad de bibliotecas externas pesadas. Frente a los pesos originales en safetensors, esta version facilita el uso local con Ollama, llama.cpp o LM Studio, aunque a costa de perder la posibilidad de reentrenamiento o ajuste fino directo.

La relevancia es limitada en terminos de validacion: el repositorio acumula 0 descargas y 0 likes, ocupa 59,9 GB (coherente con un conjunto amplio de niveles de cuantizacion) y no incluye resultados de benchmarks propios ni documentacion de inferencia (la seccion de inferencia de la model card figura como "TODO"). La licencia declarada es OpenRAIL y los idiomas etiquetados son chino (zh) e ingles (en).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (etiquetada como `transformers`; el formato GGUF no especifica la arquitectura interna) |
| Parametros totales | 13.016.028.160 (aproximadamente 13,0 B) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_0, Q5_1, Q5_K_S, Q5_K_M, Q6_K, Q8_0, F16 (niveles listados en la tabla de perplexidad de la model card) |
| Idiomas soportados | Chino (zh) e ingles (en), segun las etiquetas del repositorio |
| Licencia | OpenRAIL (`license:openrail`) |
| Formato de pesos | GGUF (fichero unico) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo. La model card se limita a indicar que se trata de la conversion a GGUF del proyecto WhiteRabbitNeo-13B y a reproducir la documentacion generica del formato GGUF: fichero unico para despliegue y distribucion, estructura de metadatos en pares clave-valor (evolucion de GGJT, que usaba una lista de valores sin tipar), compatibilidad con mmap para carga rapida y ausencia de dependencias externas para cargar el modelo. No se detalla si el modelo es un transformer decoder-only denso, ni la variante concreta, ni el numero de capas, cabezas de atencion o dimension del hidden state.

Tampoco hay datos sobre el entrenamiento: no se especifica el numero de tokens, la composicion del dataset, el modelo base sobre el que se hizo el ajuste, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. La unica tabla de caracter tecnico incluida en la model card es la de perplexidad por nivel de cuantizacion, que corresponde a la plantilla generica del conversor y no aporta informacion sobre el proceso de entrenamiento. La denominacion "WhiteRabbitNeo" sugiere una orientacion tematica concreta en el modelo original, pero la documentacion aportada no la confirma ni la describe.

## Capacidades

- Generacion de texto autoregresiva en ingles y chino, segun los idiomas declarados en las etiquetas del repositorio.
- Compatibilidad con el pipeline `text-generation` de transformers y con `endpoints_compatible`, lo que permite su despliegue detras de una API compatible con HuggingFace Endpoints.
- Inferencia en CPU y GPU mediante el ecosistema GGUF/llama.cpp, con soporte de carga por mmap.
- Seleccion de nivel de cuantizacion para ajustar el equilibrio entre calidad y consumo de memoria (desde Q2_K hasta F16).
- Capacidad de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de vision o audio: no disponibles (la etiqueta de pipeline es exclusivamente `text-generation`).
- Capacidades multilingues mas alla de zh y en: no disponibles.

## Casos de uso

- Despliegue local de un asistente de texto en ingles o chino sobre hardware de consumo: al disponer de cuantizaciones desde Q2_K hasta Q8_0, el modelo puede ejecutarse en un portatil con GPU de 8-16 GB usando llama.cpp u Ollama, sin depender de servicios en la nube.
- Prototipado rapido de aplicaciones de generacion de texto: la integracion con transformers y con endpoints compatibles permite levantar un servicio de inferencia en pocos minutos para validar prompts y flujos antes de invertir en infraestructura mayor.
- Evaluacion comparativa de cuantizaciones: la tabla de perplexidad incluida permite seleccionar el nivel de cuantizacion con mejor relacion tamano/calidad para un caso concreto; por ejemplo, Q4_K_M ofrece 5,3002 de perplexidad frente a 5,2543 de F16, con un coste de memoria muy inferior.
- Generacion de texto en entornos sin conectividad o con requisitos de soberania del dato: al ser un fichero GGUF autocontenido, puede operarse en maquinas aisladas de red, algo relevante en entornos industriales o de investigacion con datos sensibles.
- Servicio de generacion de texto en chino para aplicaciones de soporte o documentacion: el modelo declara soporte de zh, lo que permite cubrir flujos de redaccion y resumen en ese idioma con infraestructura propia.
- Investigacion sobre cuantizacion y degradacion de calidad: el repositorio permite reproducir experimentos de perplexidad entre niveles de cuantizacion sobre un modelo de 13B, util para estudiar el impacto del ancho de bits en modelos de ese tamano.
- Base para tareas de redaccion asistida por lotes: mediante llama-cpp-python o scripts de llama.cpp se puede procesar grandes volumenes de texto sin coste por token, siempre que la calidad sea suficiente para la tarea (no verificada, al no haber benchmarks).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente incluye la tabla de perplexidad por cuantizacion de la plantilla de conversion, que mide la degradacion introducida por el formato y no el rendimiento del modelo frente a tareas.

Fila correspondiente al modelo de 13B:

| Metrica | Q2_K | Q3_K_S | Q3_K_M | Q3_K_L | Q4_0 | Q4_1 | Q4_K_S | Q4_K_M | Q5_0 | Q5_1 | Q5_K_S | Q5_K_M | Q6_K | Q8_0 | F16 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Perplexidad (13B) | 5,8545 | 5,6033 | 5,4498 | 5,4063 | 5,3860 | 5,3608 | 5,3404 | 5,3002 | 5,2856 | 5,2706 | 5,2785 | 5,2638 | 5,2568 | 5,2548 | 5,2543 |

Advertencia: esta tabla aparece en la model card como parametro de referencia del conversor GGUF y no esta acompanada de la descripcion del conjunto de evaluacion, por lo que no debe interpretarse como una evaluacion especifica de WhiteRabbitNeo-13B.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 13,016 mil millones de parametros; no publicada por el autor): Q2_K en torno a 5 GB, Q4_K_M en torno a 8 GB, Q5_K_M en torno a 9,3 GB, Q6_K en torno a 10,7 GB, Q8_0 en torno a 13 GB y F16 en torno a 26 GB, mas el margen para la cache KV (que depende de la longitud de contexto, dato no disponible).
- GPU recomendadas: para cuantizaciones altas (Q8_0, F16) conviene una A100 40 GB, H100 80 GB o varias GPU; para Q4_K_M y Q5_K_M bastan una RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 (16 GB); con 12 GB (RTX 3060, RTX 4070) es viable Q4_K_M con contexto corto.
- Cabe en GPU de consumo: si. En 24 GB entran Q8_0 y todos los niveles inferiores; en 16 GB entran hasta Q6_K; en 12 GB, hasta Q4_K_M; en 8 GB habria que recurrir a Q3_K_M o Q4_0 con contexto reducido o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y text-generation-webui (o cualquier frontend compatible con GGUF). vLLM solo ofrece soporte experimental de GGUF y TGI no soporta este formato de forma nativa, por lo que para servirlo con esas herramientas habria que partir de los pesos safetensors originales.
- Latencia y throughput estimados: no disponibles. Dependen fuertemente del nivel de cuantizacion, del hardware, de la longitud de contexto y del backend; no se han publicado mediciones.

## Comparativa con modelos similares

No hay datos de rendimiento del modelo evaluado, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. Los datos de los modelos alternativos corresponden a informacion publica de sus respectivos proyectos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad en GGUF |
|---|---|---|---|---|
| ictc/whiterabbitneo-WhiteRabbitNeo-13B-GGUF | 13,0 B | No disponible | OpenRAIL | Si, en este repositorio |
| Llama 2 13B Chat | 13,0 B | 4.096 tokens | Llama 2 Community License | Si, mediante conversiones de terceros |
| Mistral 7B Instruct v0.3 | 7,3 B | 32.768 tokens | Apache 2.0 | Si, mediante conversiones de terceros |
| Qwen2.5-14B-Instruct | 14,7 B | 32.768 tokens (ampliable con YaRN) | Apache 2.0 | Si, mediante conversiones de terceros |

No se dispone de resultados comparativos de benchmarks entre estos modelos y WhiteRabbitNeo-13B en la informacion proporcionada, por lo que no es posible establecer una jerarquia de calidad.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: la model card no indica modelo base, arquitectura, datos de entrenamiento, longitud de contexto ni procedimiento de inferencia (la seccion de inferencia figura como "TODO").
- Sin validacion por la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de que la conversion a GGUF sea correcta o reproducible.
- Riesgo de alucinacion: no cuantificado ni evaluado; al no existir benchmarks ni evaluaciones de fidelidad, cualquier uso en produccion exige validacion propia.
- Idiomas limitados: solo chino e ingles segun las etiquetas; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Licencia OpenRAIL: este tipo de licencia incorpora restricciones de uso en su anexo (limitaciones sobre usos daninos, discriminacion, informacion medica o legal, etc.). Es imprescindible revisar el texto completo antes de un uso comercial y comprobar que el modelo original permite la redistribucion bajo estos terminos.
- Dependencia de la licencia del modelo base: al no documentarse el modelo origen, no puede confirmarse que los terminos de OpenRAIL sean compatibles con los del modelo sobre el que se hizo el ajuste.
- Formato GGUF unicamente: no permite ajuste fino ni entrenamiento continuado con el flujo habitual de transformers; para eso habria que localizar los pesos safetensors originales.
- Sesgos: no disponibles. No se ha publicado ninguna evaluacion de sesgo, toxicidad o equidad.
- Posible orientacion tematica sensible: la denominacion "WhiteRabbitNeo" del proyecto original apunta a un dominio especializado, pero la informacion disponible no lo confirma ni describe sus salvaguardas; conviene auditar las salidas antes de cualquier despliegue abierto al publico.
- Metadatos de fecha inusuales: el repositorio figura con fecha de creacion 2026-09-10, lo que unido a la ausencia de actividad sugiere que se trata de una publicacion de terceros no mantenida.
- Tamano del repositorio elevado (59,9 GB), lo que implica costes de almacenamiento y de ancho de banda relevantes para su descarga completa.

## Enlaces

- Repositorio HuggingFace de esta conversion GGUF: https://huggingface.co/ictc/whiterabbitneo-WhiteRabbitNeo-13B-GGUF
- Modelo original referenciado en la model card: https://huggingface.co/whiterabbitneo/WhiteRabbitNeo-13B
- Enlace de donacion incluido por el autor de la conversion: https://www.buymeacoffee.com/s3nh
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo. Todas las entradas devueltas por la busqueda corresponden a sitios de casino, apuestas y juegos de azar sin relacion con inteligencia artificial ni con el modelo, por lo que se descartan como fuentes.
