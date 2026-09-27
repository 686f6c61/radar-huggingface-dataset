# FaustianDeal/Artemis-31B-v1.2-BF16-embd-GGUF

## Resumen

Este repositorio no contiene un modelo nuevo, sino un conjunto de cuantizaciones GGUF de TheDrummer/Artemis-31B-v1.2, un ajuste fino conversacional construido sobre la arquitectura Gemma 4 de 31B (aproximadamente 30.697 millones de parametros). Lo publica el usuario FaustianDeal bajo el identificador FaustianDeal/Artemis-31B-v1.2-BF16-embd-GGUF, con el objetivo de hacer viable la ejecucion del modelo en runtimes compatibles con llama.cpp, incluidos equipos de consumo.

La particularidad tecnica del release es el marcador `BF16-embd`: la matriz de embeddings de tokens se mantiene en precision BF16 mientras el resto de matrices del transformer se cuantizan, lo que reduce el impacto de la cuantizacion en la capa de embedding. Se publican once variantes (de Q2_K a Q8_0) y tres proyectores de vision (F32, BF16 y Q8_0) que habilitan la entrada de imagenes, ya que el pipeline declarado es image-text-to-text.

Es relevante para desarrolladores que quieran desplegar un modelo multimodal de ~31B en local o en una sola GPU, eligiendo el compromiso tamano/calidad segun su hardware. La licencia no aparece especificada en los metadatos del repositorio y el propio autor remite a los terminos del modelo base y de Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Gemma 4 (833 tensores en el modelo de texto), con torre de vision acoplada mediante proyector multimodal (mmproj) |
| Parametros totales | 30.697.345.596 (~30,7 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (mas un GGUF BF16 de origen) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en los metadatos; el autor indica que se aplican los terminos del modelo base TheDrummer/Artemis-31B-v1.2 y de Gemma 4 |
| Formato de pesos | GGUF (modelo de texto y proyectores de vision); el autor menciona un checkpoint NVFP4 en safetensors del modelo base orientado a vLLM |
| Modelo base | TheDrummer/Artemis-31B-v1.2 (relacion: quantized) |
| Revision del modelo origen | 05d84790fceecefac4ee2adfb7cf33fdce2029f1 |
| Tamano del repositorio | 234,2 GB |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura corresponde a Gemma 4 en configuracion densa de ~31B, tal como la hereda el ajuste fino Artemis-31B-v1.2. La validacion del conversor comprobo la presencia de 833 tensores en el modelo de texto, un unico embedding de tokens atado (tied) en BF16 y matrices del transformer cuantizadas. La capacidad multimodal se aporta mediante un proyector independiente (mmproj) que se carga junto al GGUF de texto; el autor indica que el proyector F32 procede del proyector de Gemma 4 31B y que las variantes BF16 y Q8_0 se derivaron de el con el mismo cuantizador. El uso exclusivamente de texto no requiere proyector.

El proceso de conversion no implica reentrenamiento: se partio de un GGUF BF16 obtenido de los pesos publicos de v1.2 y cada cuantizacion se genero directamente desde ese BF16 con `llama-quantize --token-embedding-type BF16`, es decir, cuantizacion estatica sin matriz de importancia. No se utilizo ningun GGUF de baja precision como entrada de otra cuantizacion posterior. El cuantizador procede del commit `b9ae43a5d4c27564963717281070991fa9b8c1bf` de llama.cpp. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el ajuste fino de origen.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el pipeline y la etiqueta `conversational` del repositorio.
- Entrada de imagenes (image-text-to-text): permite consultas sobre imagenes cuando se carga un proyector mmproj junto al GGUF de texto.
- Procesamiento de texto sin proyector, con menor consumo de memoria.
- Ejecucion en runtimes compatibles con llama.cpp, con plantilla de chat incrustada en el propio GGUF.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Otras capacidades especiales (modo thinking, audio, etc.): no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local de un asistente conversacional multimodal: con la variante Q4_K_M (20,35 GB) y el proyector Q8_0 (0,81 GB) el modelo cabe en una GPU de 24 GB, lo que permite mantener conversaciones con imagenes sin enviar datos a servicios externos.
- Analisis de documentos con capturas o diagramas: el modelo puede recibir una imagen y texto en la misma peticion, util para extraer informacion de interfaces, graficos o esquemas tecnicos junto a una pregunta en lenguaje natural.
- Asistencia conversacional en produccion con presupuesto de VRAM ajustado: las variantes Q2_K (13,58 GB) y Q3_K_M (16,95 GB) permiten ejecutar el modelo en GPUs de 16 GB, a costa de una perdida de calidad que el autor no cuantifica.
- Clasificacion y etiquetado asistido de imagenes: integrado en un pipeline por lotes mediante llama-server, el modelo puede generar descripciones o categorias a partir de capturas y reenviar la salida a un sistema posterior.
- Prototipado e investigacion en una estacion de trabajo: al existir once niveles de cuantizacion, es posible medir el impacto de la compresion sobre la misma tarea usando exactamente los mismos pesos de origen, con la salvedad de que son cuantizaciones estaticas sin matriz de importancia.
- Escenarios con requisitos de soberania del dato: al ejecutarse integramente en infraestructura propia con llama.cpp o KoboldCpp, resulta adecuado para entornos donde la informacion sensible no puede salir de la organizacion.
- Evaluacion comparativa de cuantizaciones: util para ingenieros que necesiten decidir entre IQ4_XS (18,52 GB) y Q4_K_M (20,35 GB) para un mismo servidor con VRAM limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente describe comprobaciones funcionales: las once cuantizaciones cargaron en KoboldCpp 1.121 y generaron una respuesta breve de texto, y Q4_K_M, combinada con los tres proyectores, identifico correctamente una imagen de un objeto rojo solido. El propio autor aclara que son verificaciones de funcionamiento y no puntuaciones de calidad para las cuantizaciones bajas ni para los proyectores.

## Requisitos de hardware

- VRAM estimada para inferencia (archivo de pesos mas cache KV y sobrecarga; estimacion a partir de los tamanos publicados):
  - Q2_K (13,58 GB): ~16 GB.
  - Q3_K_S (15,42 GB): ~18 GB.
  - Q3_K_M (16,95 GB): ~19-20 GB.
  - Q3_K_L (18,29 GB): ~21 GB.
  - IQ4_XS (18,52 GB): ~21 GB.
  - Q4_K_S (19,43 GB): ~22 GB.
  - Q4_K_M (20,35 GB): ~23-24 GB.
  - Q5_K_S (22,97 GB): ~26 GB.
  - Q5_K_M (23,51 GB): ~26-27 GB.
  - Q6_K (26,86 GB): ~30 GB.
  - Q8_0 (33,96 GB): ~37-38 GB.
- Vision: sumar el proyector elegido, F32 (2,30 GB), BF16 (1,20 GB) o Q8_0 (0,81 GB).
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para las variantes Q6_K y Q8_0; RTX 4090 (24 GB) para Q4_K_M y Q4_K_S; RTX 4080 o RTX 4060 Ti de 16 GB para Q2_K y Q3.
- Cabe en GPU de consumo: si, en las cuantizaciones Q4 o inferiores con 24 GB, y hasta Q3_K_M en tarjetas de 16 GB. Las variantes Q5 y superiores requieren 32 GB o mas, o reparto entre dos GPU.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`) y KoboldCpp estan explicitamente soportados; el autor indica que el formato NVFP4 en safetensors del modelo base es el orientado a vLLM, no estos GGUF.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FaustianDeal/Artemis-31B-v1.2-BF16-embd-GGUF | ~30,7 B | GGUF (11 cuantizaciones) + mmproj | no disponible | no disponible (remite al modelo base) | Repositorio publicado, 0 descargas |
| TheDrummer/Artemis-31B-v1.2 | ~30,7 B | safetensors BF16 / NVFP4 | no disponible | no disponible en la informacion | Modelo base de referencia |
| google/gemma-4-31B | ~31 B | safetensors | no disponible | terminos de Gemma 4 (no detallados) | Modelo original de la familia |

No se dispone de datos de benchmarks ni de context length para establecer comparaciones cuantitativas con alternativas de tamano similar (por ejemplo, otros modelos densos de 30B). La comparacion se limita, por tanto, a parametros, formato y licencia.

## Limitaciones y advertencias

- No es un modelo nuevo: la calidad final depende integramente de TheDrummer/Artemis-31B-v1.2 y, en ultima instancia, de Gemma 4 31B. Cualquier sesgo o limitacion del modelo base se hereda sin cambios.
- Las cuantizaciones son estaticas y sin matriz de importancia, por lo que las variantes de baja precision (Q2_K, Q3_K) pueden degradar la calidad mas que una cuantizacion optimizada equivalente. El autor no publica metricas de esa degradacion.
- Riesgo de alucinacion: no evaluado ni cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Idiomas soportados y longitud de contexto: no disponibles, lo que impide garantizar el comportamiento en conversaciones largas o en idiomas distintos del entrenado.
- Licencia: los metadatos no la especifican. El autor remite a los terminos del modelo base y de Gemma 4 antes de usar o redistribuir los pesos, por lo que el uso comercial debe verificarse en esos terminos.
- Los tres proyectores de vision no han sido evaluados en calidad; la validacion descrita se limita a una imagen de prueba con un objeto rojo solido.
- El repositorio ocupa 234,2 GB, de modo que descargar el conjunto completo exige un volumen de almacenamiento considerable; conviene descargar unicamente la cuantizacion necesaria.
- Es imprescindible un runtime reciente con soporte de Gemma 4 y con la plantilla de chat incrustada en el GGUF; versiones antiguas de llama.cpp o KoboldCpp pueden no cargar los archivos.
- Los archivos de otras publicaciones GGUF de Artemis v1.2 no son intercambiables con los de este repositorio, ya que la mezcla de cuantizacion y la nomenclatura difieren.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FaustianDeal/Artemis-31B-v1.2-BF16-embd-GGUF
- Modelo base: https://huggingface.co/TheDrummer/Artemis-31B-v1.2
- Modelo original de la familia Gemma 4: https://huggingface.co/google/gemma-4-31B
- llama.cpp (cuantizador utilizado): https://github.com/ggml-org/llama.cpp
