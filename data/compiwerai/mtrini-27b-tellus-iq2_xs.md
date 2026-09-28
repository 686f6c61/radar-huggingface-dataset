# CompiwerAI/Mtrini-27B-Tellus-IQ2_XS

## Resumen

CompiwerAI/Mtrini-27B-Tellus-IQ2_XS es una cuantizacion GGUF de muy baja precision del modelo Mtrini-27B-Tellus, publicada por CompiwerAI. No contiene los pesos originales, sino una conversion generada con llama.cpp a partir del GGUF F16 y una importance matrix (imatrix) propia, con el objetivo de conservar la mayor calidad posible en un archivo de 8,47 GiB.

El modelo subyacente tiene 26.895.998.464 parametros (unos 26,9 B) y una arquitectura declarada como `qwen35`, con 64 bloques transformer, embedding de 5120, FFN de 17408, 24 cabezas de atencion y 4 cabezas KV. Las etiquetas del repositorio lo orientan a generacion de texto, programacion, matematicas y razonamiento, con mencion explicita al arabe y a la darija.

Su relevancia practica esta en el tamano: permite ejecutar un modelo de ~27 B en equipos con 10-12 GB de VRAM de GPU o incluso en CPU, a cambio de una perdida de calidad que el autor no cuantifica con benchmarks de tareas. Es un lanzamiento reciente (creado y actualizado el 27 de septiembre de 2026) y, en el momento de la consulta, no tiene descargas ni validacion de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `qwen35` (transformer decoder-only); 64 bloques transformer, embedding 5120, FFN 17408, 24 cabezas de atencion, 4 cabezas KV |
| Parámetros totales | 26.895.998.464 (~26,9 B) |
| Parámetros activos | No aplica: no hay indicios de que sea MoE en la informacion disponible |
| Longitud de contexto | No disponible (la calibracion del imatrix uso contexto 512, dato que no define el limite del modelo) |
| Tipos de cuantizacion | IQ2_XS (2,3125 bpw); el GGUF F16 del mismo modelo se publica en otro repositorio |
| Idiomas soportados | No disponible en la model card; las etiquetas del repositorio mencionan darija y arabe |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), 851 tensores |
| Tamano del archivo | 8,47 GiB (repositorio de 9,1 GB) |
| Fecha de publicacion | 27 de septiembre de 2026 |
| Descargas / me gusta | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe la arquitectura del modelo subyacente como `qwen35` e indica 851 tensores, 64 bloques transformer, embedding de 5120, FFN de 17408, 24 cabezas de atencion y 4 cabezas KV. No se especifica si la atencion es completa, con ventana deslizante o hibrida, ni se documenta la longitud de contexto nativa, el numero de tokens de entrenamiento o la composicion del dataset. Tampoco hay informacion sobre alineacion (RLHF, DPO u otras tecnicas).

Lo que si esta documentado es el proceso de cuantizacion: el release IQ2_XS se genero desde el GGUF F16 utilizando una importance matrix creada con un conjunto de calibracion dedicado, con contexto de calibracion 512, 20 hilos, 32 chunks y 496 entradas de importancia. La perplejidad de calibracion reportada es de ~2,4629 ± 0,04545. La existencia de los repositorios relacionados `Mtrini-27B-Tellus-Adapter` y `Mtrini-27B-Tellus-Merged` apunta a un ajuste fino mediante adaptadores posteriormente fusionados con un modelo base, aunque la model card no detalla ese procedimiento.

## Capacidades

- Generacion de texto conversacional, con etiqueta `conversational` en el repositorio.
- Programacion: el repositorio incluye la etiqueta `coding`, aunque no se publican resultados en benchmarks de codigo.
- Matematicas y razonamiento: etiquetas `mathematics` y `reasoning`. La model card incluye un ejemplo de validacion con la operacion 27 × 8, cuya salida mostrada es 216.
- Contenido en arabe y darija: las etiquetas `arabic` y `darija` sugieren soporte para estos idiomas, sin que se detalle el grado de cobertura.
- Compatibilidad con llama.cpp y con el ecosistema de endpoints (`endpoints_compatible`).
- Tool calling, function calling, agentes, vision, audio o modo de razonamiento explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de programacion en local: el archivo de 8,47 GiB cabe en GPUs de 10-12 GB, por lo que se puede integrar un asistente de autocompletado y refactorizacion en un portatil o estacion de trabajo sin depender de la nube, siempre que se acepte la perdida de calidad propia de 2,3125 bpw.
- Entornos aislados o con requisitos de privacidad: al ejecutarse con llama.cpp sobre pesos GGUF, el modelo no requiere conexion externa, lo que encaja en despliegues aereogap o con datos sensibles que no pueden salir de la infraestructura.
- Razonamiento matematico asistido: el ejemplo de validacion de la model card (27 × 8 = 216) ilustra su uso como apoyo para calculo paso a paso, aunque para produccion conviene verificar las salidas por el riesgo de error asociado a cuantizaciones agresivas.
- Prototipado rapido con Ollama o LM Studio: el formato GGUF y el tamano reducido permiten levantar un endpoint de pruebas en minutos para validar productos antes de invertir en hardware mayor.
- Atencion al cliente en arabe o darija: las etiquetas del repositorio apuntan a contenido en esos idiomas, de modo que puede emplearse como base para un chatbot multi-turno dirigido a esos mercados, previa evaluacion de calidad con datos propios.
- Extraccion y resumen de documentos tecnicos: con un modelo de ~27 B es posible abordar tareas de sintesis y estructuracion de informacion; conviene medir antes la longitud de contexto efectiva, ya que no esta documentada.
- Investigacion sobre cuantizacion extrema: el repositorio documenta el pipeline completo (imatrix, contexto de calibracion, PPL resultante), lo que lo convierte en un caso de estudio reproducible para comparar IQ2_XS frente a otras cuantizaciones del mismo modelo.
- Despliegue de bajo coste en CPU: para cargas por lotes no interactivas, llama.cpp permite ejecutarlo en CPU con 16 GB de RAM como alternativa cuando no hay GPU disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra prueba estandar, y tampoco hay evaluaciones de terceros al no existir descargas ni validacion de la comunidad. El unico dato cuantitativo de calidad es la perplejidad de calibracion del proceso de cuantizacion:

| Métrica | Valor |
|---|---|
| Perplejidad de calibracion (IQ2_XS) | ~2,4629 ± 0,04545 |
| Contexto de calibracion | 512 |
| Chunks | 32 |
| Hilos | 20 |
| Entradas de importancia | 496 |
| Bits por peso | 2,3125 bpw |
| Tamano del archivo | 8,47 GiB |

Esta perplejidad corresponde al conjunto de calibracion del imatrix y no es comparable con cifras de perplejidad de benchmarks publicos de otros modelos.

## Requisitos de hardware

- Pesos: 8,47 GiB. En GPU, se necesitan al menos unos 9-10 GB de VRAM solo para el archivo, mas el overhead del runtime y la cache KV.
- Cache KV: la model card declara 4 cabezas KV y 64 bloques. Asumiendo una dimension de cabeza de 128, la cache ocuparia del orden de 128 KiB por token en FP16 (aproximadamente 1 GiB por cada 8192 tokens). Es una estimacion propia a partir de los datos de arquitectura, no confirmada por el autor.
- GPU consumer: cabe en RTX 3060 de 12 GB, RTX 4070, RTX 4070 Ti y superiores, RTX 4080 y RTX 4090. En tarjetas de 8 GB habria que recurrir a offload parcial a RAM del sistema.
- GPU profesional: A10, L4, A100, H100 y similares lo ejecutan sin problema, con margen para contextos amplios y concurrencia.
- CPU y RAM: al ser GGUF para llama.cpp, puede ejecutarse en CPU; se recomiendan 16 GB de RAM o mas, preferiblemente con soporte AVX2.
- Mac con memoria unificada: viable en equipos con 16 GB o mas de memoria unificada, dado el tamano del archivo.
- Opciones de despliegue: llama.cpp (recomendado, es el formato de referencia), Ollama, LM Studio, text-generation-webui. El soporte de GGUF en vLLM y TGI es parcial y depende de la version; para servirlo con esas herramientas conviene validar la compatibilidad con la arquitectura `qwen35`.
- Comando de referencia de la model card: `llama-cli -m Mtrini-27B-Tellus-IQ2_XS.gguf -p "What is 27 multiplied by 8?"`.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantizacion / formato | Licencia | Notas |
|---|---|---|---|---|---|
| Mtrini-27B-Tellus-IQ2_XS (CompiwerAI) | ~26,9 B | No disponible | IQ2_XS, 2,3125 bpw, GGUF de 8,47 GiB | apache-2.0 | Sin benchmarks publicados, 0 descargas, sin validacion comunitaria |
| Mtrini-27B-Tellus F16 (CompiwerAI) | ~26,9 B | No disponible | F16 GGUF | apache-2.0 | Version de referencia de la que deriva esta cuantizacion; permite medir la perdida de calidad |
| Bonsai 2 27B (PrismML) | 27 B (base Qwen3.8 27B segun las fuentes) | No disponible | Ternaria, archivo de 5,9 GB | Apache 2.0 | Segun las fuentes consultadas, retiene el 98,2 % del rendimiento en benchmarks del modelo completo y esta pensado para GPU consumer y Mac |

La comparacion con Bonsai 2 27B es de categoria (modelos de ~27 B fuertemente comprimidos), no de linaje: se trata de proyectos de autores distintos. Para el resto de alternativas de la misma categoria no hay datos disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion IQ2_XS a 2,3125 bpw es de las mas agresivas del catalogo de llama.cpp; es esperable una degradacion apreciable en razonamiento, matematicas y codigo frente al F16, y el autor solo reporta perplejidad de calibracion, no evaluaciones de tareas.
- El repositorio tiene 0 descargas y 0 me gusta, y se creo y actualizo el mismo dia: no hay validacion independiente de su calidad ni indicios de mantenimiento.
- La model card es muy escueta: no documenta datos de entrenamiento, alineacion, longitud de contexto, idiomas exactos ni resultados de evaluacion.
- Riesgo de alucinacion inherente a cualquier modelo de lenguaje, agravado por una cuantizacion de baja precision y por la ausencia de evaluaciones publicadas.
- La arquitectura declarada, `qwen35`, no permite confirmar por si sola la compatibilidad con una version concreta de llama.cpp; conviene verificar que la build utilizada la soporta antes de desplegar.
- Idiomas: no hay confirmacion oficial del nivel de soporte de castellano, ingles, arabe o darija. Las etiquetas del repositorio son indicios, no garantias.
- Licencia: el release se publica bajo apache-2.0, lo que en principio permite uso comercial. Al ser un derivado de un modelo base de la familia Qwen, hay que comprobar las condiciones del modelo original antes de explotarlo en produccion.
- El ejemplo de validacion de la model card es una unica operacion aritmetica simple; no es evidencia suficiente de capacidad matematica general.
- Sin datos de latencia, throughput ni consumo de memoria medidos, la planificacion de capacidad en produccion debe hacerse con pruebas propias.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/CompiwerAI/Mtrini-27B-Tellus-IQ2_XS
- Modelo principal: https://huggingface.co/CompiwerAI/Mtrini-27B-Tellus
- Perfil del autor: https://huggingface.co/CompiwerAI
- Repositorios relacionados citados en la model card: `CompiwerAI/Mtrini-27B-Tellus-Adapter`, `CompiwerAI/Mtrini-27B-Tellus-Merged`, `CompiwerAI/Mtrini-27B-Tellus-GGUF`, `CompiwerAI/Mtrini-27B-Tellus-IQ2_XS-Imatrix`
- Referencias sobre un modelo comparable de ~27 B cuantizado (Bonsai 2 27B, PrismML), encontradas en la busqueda web: https://www.datacamp.com/blog/bonsai-2-27b
- Analisis de Bonsai 2 27B: https://www.explainx.ai/blog/prismml-bonsai-2-27b-near-lossless-compression-2026
- Documentacion de Bonsai 27B: https://docs.prismml.com/models/bonsai-27b
