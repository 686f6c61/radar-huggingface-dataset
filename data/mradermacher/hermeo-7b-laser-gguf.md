# mradermacher/hermeo-7b-laser-GGUF

## Resumen

hermeo-7b-laser-GGUF es la version cuantizada en formato GGUF del modelo cstr/hermeo-7b-laser, publicada por mradermacher, un conocido autor de cuantizaciones para el ecosistema llama.cpp. El modelo original es un transformer de 7.241.748.480 parametros (aproximadamente 7,24 mil millones) etiquetado por su autor con las etiquetas laserRMT y mistral, lo que apunta a una base Mistral 7B adaptada con alguna variante de memoria recurrente (RMT) para contextos largos. Esta publicacion concreta no aporta pesos nuevos: ofrece el modelo original convertido a distintos niveles de cuantizacion para poder ejecutarlo en hardware de consumo.

El problema que resuelve esta ficha es fundamentalmente de despliegue. Los pesos originales en safetensors requieren precision completa o semi-completa, lo que exige mas VRAM de la que tienen las GPU de consumo habituales. Al ofrecer 12 variantes GGUF que van de 2,8 GB a 14,6 GB, el autor permite elegir el equilibrio entre calidad y memoria segun el hardware disponible, desde un portatil con GPU integrada hasta una estacion de trabajo con una unica GPU de 24 GB.

Es relevante ahora porque el ecosistema GGUF es el estandar de facto para inferencia local de LLM en CPU y GPU de gama media, y porque la actualizacion del repositorio en septiembre de 2026 indica mantenimiento reciente. No obstante, el modelo tiene un alcance muy limitado: solo idioma ingles, 30 descargas registradas y cero likes, y la model card no documenta ni el entrenamiento ni benchmarks, por lo que debe considerarse un artefacto de nicho y no una opcion de produccion contrastada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Mistral (segun etiquetas del autor: laserRMT, mistral); detalles no disponibles |
| Parametros totales | 7.241.748.480 (7,24 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (los pesos originales del modelo base estan en safetensors) |
| Tamano del repositorio | 63,9 GB |
| Modelo base | cstr/hermeo-7b-laser |
| Cuantizado por | mradermacher (nethype GmbH) |
| Descargas / likes | 30 / 0 |
| Fecha de creacion | 2024-12-23 |
| Ultima actualizacion | 2026-09-16 |

## Arquitectura y entrenamiento

La informacion disponible no permite detallar la arquitectura interna ni el proceso de entrenamiento. Lo unico documentado por el autor de la cuantizacion es que se trata de cuantizaciones estaticas del modelo cstr/hermeo-7b-laser, con las etiquetas laserRMT y mistral. La etiqueta mistral indica que la base es la familia Mistral 7B (transformer denso, atencion con ventana deslizante en las versiones originales, normalizacion RMSNorm y activacion SwiGLU), mientras que laserRMT sugiere la incorporacion de algun mecanismo de memoria recurrente orientado a extender el contexto efectivo mas alla de la ventana de atencion. No se dispone de confirmacion tecnica de este punto: ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones estan publicados en la informacion proporcionada.

En cuanto al proceso de cuantizacion, la model card indica que se han generado cuantizaciones estaticas (no ponderadas ni con matriz de importancia/imatrix), lo que en la practica significa que no se ha aplicado calibracion sobre un corpus para proteger los pesos mas sensibles. El propio autor advierte de que las cuantizaciones ponderadas o imatrix "parecen no estar disponibles" y sugiere solicitarlas mediante una discusion en la comunidad. Para los niveles muy bajos de bits (Q2_K, Q3_K_S) esto es relevante: sin imatrix, la perdida de calidad es mayor que la que se obtendria con una cuantizacion calibrada del mismo tamano.

## Capacidades

- Generacion de texto en ingles: el modelo esta etiquetado exclusivamente para el idioma ingles, sin soporte multilingue declarado.
- Categorias de uso derivadas de la familia Mistral: comprension y generacion de texto, respuesta a preguntas y resumen, sujetas a verificacion empirica porque no hay evaluaciones publicadas.
- Razonamiento y matematicas: no hay evidencia publicada de capacidades especificas ni de modos de razonamiento extendido (thinking mode).
- Generacion de codigo: no documentada en la informacion disponible.
- Tool calling / function calling: no documentado; no se declara plantilla de chat ni formato de herramientas.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multimodales (vision, audio): no disponibles; el pipeline no esta declarado en HuggingFace.
- Memoria de largo alcance: la etiqueta laserRMT sugiere trabajo especifico sobre contexto largo, pero no hay datos publicados sobre la ventana efectiva ni sobre su rendimiento en tareas de recuperacion a larga distancia.
- Modo base o instruct: no se especifica en la model card si el modelo base esta ajustado por instrucciones o es un modelo base puro; debe verificarse antes de usarlo en dialogos.

## Casos de uso

- Inferencia local en equipos sin GPU dedicada: con la cuantizacion Q2_K (2,8 GB) o Q3_K_S (3,3 GB) el modelo puede ejecutarse en CPU con llama.cpp u Ollama en portatiles con 8-16 GB de RAM, lo que permite prototipado offline sin coste de API.
- Despliegue en una unica GPU de consumo: las variantes Q4_K_M (4,5 GB) y Q5_K_M (5,2 GB) caben con holgura en tarjetas de 8-12 GB, ideales para entornos de desarrollo donde se necesita baja latencia y no se depende de servicios externos.
- Procesamiento por lotes de documentos en ingles: si el mecanismo laserRMT cumple lo que sugiere su nombre, el modelo podria usarse para resumir o extraer informacion de documentos largos; conviene validar primero la longitud de contexto real antes de disenar el pipeline.
- Experimentacion academica con memoria recurrente: el modelo es un candidato razonable para reproducir o comparar variantes de RMT frente a Mistral 7B estandar, dado que la cuantizacion f16 (14,6 GB) preserva practicamente la calidad de los pesos originales.
- Entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite uso comercial, modificacion y redistribucion sin las restricciones de las licencias comunitarias de otros modelos de 7-8B, lo que facilita integrarlo en productos propietarios.
- Generacion aumentada por recuperacion (RAG) en ingles: con una variante Q4_K_M o superior y un almacen vectorial externo, puede emplearse como generador en un pipeline RAG siempre que se valide su adherencia al contexto y su tendencia a la alucinacion.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye 12 niveles distintos del mismo modelo, lo que lo convierte en un banco de pruebas util para medir la degradacion de perplejidad entre Q2_K, Q4_K_M, Q8_0 y f16 con un mismo corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el modelo base cstr/hermeo-7b-laser tampoco aparece documentado en los resultados de busqueda proporcionados. El unico dato de rendimiento indirecto es el grafico de perplejidad de ikawrakow enlazado por el autor, que compara tipos de cuantizacion de forma generica y no resultados del modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas cache KV moderada; los valores de peso son los declarados por el autor):
  - Q2_K: ~3,5-4 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~4-5 GB
  - IQ4_XS: ~5 GB
  - Q4_K_S / Q4_K_M: ~5-6 GB
  - Q5_K_S / Q5_K_M: ~6-7 GB
  - Q6_K: ~7-8 GB
  - Q8_0: ~9-10 GB
  - f16: ~16-17 GB
- Cabe en GPU de consumo: si. Las variantes Q4 y Q5 caben en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores. La Q8_0 requiere al menos 12 GB de VRAM con contexto corto o 16 GB con contexto amplio. La f16 solo es viable en tarjetas de 24 GB (RTX 3090, RTX 4090) o en GPU de centro de datos.
- GPU recomendadas: RTX 3060 12 GB y RTX 4060 Ti 16 GB para cuantizaciones Q4/Q5; RTX 4090 o RTX 5090 para Q8_0 y f16; A100 40 GB o H100 para servir el modelo a precision completa con lotes grandes y contexto largo.
- Solo CPU: viable con llama.cpp en cuantizaciones Q2_K a Q5_K_M; se recomienda un minimo de 16 GB de RAM para Q4_K_M y 32 GB para Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, koboldcpp, text-generation-webui (llama.cpp), Jan. El soporte de GGUF en vLLM es limitado y experimental, por lo que para servir en produccion con alto throughput conviene usar los pesos safetensors del modelo base con vLLM o TGI.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni en la model card ni en la informacion de busqueda; cualquier cifra dependeria del hardware, del nivel de cuantizacion y de la longitud de contexto, y no debe asumirse.

## Comparativa con modelos similares

La comparativa de rendimiento no es posible porque no hay benchmarks publicados de hermeo-7b-laser. La tabla siguiente compara solo los atributos verificables.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad GGUF |
|---|---|---|---|---|
| hermeo-7b-laser (cuantizado por mradermacher) | 7,24 B | No disponible | Apache 2.0 | Si, 12 niveles |
| Mistral 7B Instruct v0.3 | 7,24 B | 32.768 tokens (ventana deslizante) | Apache 2.0 | Si, amplia |
| Llama 3.1 8B Instruct | 8,03 B | 131.072 tokens | Licencia comunitaria Llama 3.1 | Si, amplia |
| Qwen2.5 7B Instruct | 7,61 B | 131.072 tokens | Apache 2.0 (con excepciones para algunos modelos de la familia) | Si, amplia |

El principal diferencial de hermeo-7b-laser frente a estas alternativas seria el mecanismo laserRMT, pero al no existir evaluaciones publicadas no puede afirmarse que aporte ventaja alguna. En idiomas, contexto documentado, soporte de herramientas y ecosistema, las tres alternativas de la tabla son opciones mas predecibles para produccion.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado unicamente para ingles. No debe esperarse un rendimiento aceptable en castellano ni en otros idiomas.
- Ausencia total de benchmarks: no hay ninguna evaluacion publicada, ni del modelo base ni de las cuantizaciones. Cualquier decision de adopcion debe ir precedida de una evaluacion propia sobre el dominio objetivo.
- Riesgo de alucinacion: no cuantificado. Al ser un modelo de 7B sin documentacion de ajuste por instrucciones o RLHF, la tendencia a inventar informacion puede ser elevada, especialmente en tareas factuales.
- Cuantizaciones estaticas: el autor indica que no ha generado cuantizaciones ponderadas ni imatrix. Los niveles Q2_K y Q3_K_S probablemente sufren una degradacion notable de calidad; para uso serio se recomienda Q4_K_M o superior.
- Longitud de contexto desconocida: ni la model card ni el repositorio declaran la ventana de contexto. Usar el modelo con prompts largos sin verificarlo puede provocar truncamientos silenciosos o degradacion.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero se aplica sobre el artefacto publicado; conviene verificar que el modelo base cstr/hermeo-7b-laser no imponga condiciones adicionales derivadas de sus propios datos de entrenamiento.
- Trazabilidad limitada: con 30 descargas y 0 likes, el modelo no ha sido validado por la comunidad. No hay informes de terceros sobre su comportamiento en produccion.
- Dependencia del modelo base: si el autor original actualiza o retira cstr/hermeo-7b-laser, la documentacion de esta cuantizacion queda desvinculada de su referencia.
- Sin pipeline declarado: HuggingFace no indica la tarea del modelo, lo que complica el uso automatico con la libreria transformers a traves del repositorio GGUF.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/hermeo-7b-laser-GGUF
- Modelo base: https://huggingface.co/cstr/hermeo-7b-laser
- Pagina de descarga resumida del autor: https://hf.tst.eu/model#hermeo-7b-laser-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones GGUF: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa que soporta la infraestructura del autor: https://www.nethype.de/
