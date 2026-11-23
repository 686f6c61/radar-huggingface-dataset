# mradermacher/Mia-v2-29B-i1-GGUF

## Resumen

Mia-v2-29B-i1-GGUF es la version cuantizada en formato GGUF del modelo veld-ai/Mia-v2-29B, publicada por mradermacher. El modelo original es un transformer de aproximadamente 30.700 millones de parametros (30,7B) orientado a conversacion, con licencia y contexto no declarados en la informacion disponible. La model card indica que se trata de un modelo con capacidades de vision, ya que menciona explicitamente que los ficheros mmproj (proyeccion multimodal) se encuentran en el repositorio estatico.

Esta ficha cubre la variante i1 (imatrix) generada por mradermacher, que ofrece 24 cuantizaciones distintas desde IQ1_S (7,3 GB) hasta Q6_K (25,3 GB). Frente a las cuantizaciones estaticas del repositorio hermano Mia-v2-29B-GGUF, las i1 incorporan una matriz de importancia (imatrix) calculada sobre el modelo base, lo que tipicamente mejora la calidad por bit en rangos medios y bajos. El repositorio completo ocupa 334,8 GB e incluye el fichero imatrix para que terceros puedan generar sus propias cuantizaciones.

La relevancia practica de esta publicacion es que permite ejecutar un modelo de ~30B en hardware de consumo mediante llama.cpp u Ollama, con opciones que van desde los 7-8 GB (IQ1) hasta los 25 GB (Q6_K). Al estar etiquetado como `endpoints_compatible` y `conversational`, esta pensado para despliegues de chat e inferencia local, aunque la ausencia de datos sobre contexto, licencia y benchmarks limita su uso en produccion sin verificacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (detalles no disponibles) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, imatrix |
| Idiomas soportados | en (segun metadatos) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base veld-ai/Mia-v2-29B. Los metadatos de Hugging Face indican `transformers` como libreria y `base_model: veld-ai/Mia-v2-29B`, pero no se especifica si emplea attention lineal, decodificacion especulativa, mezcla de expertos ni otras innovaciones. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron RLHF o DPO. La unica indicacion funcional relevante es la mencion de que se trata de un modelo de vision, lo que sugiere una arquitectura multimodal con proyeccion (mmproj) para entrada de imagenes.

En cuanto al proceso de cuantizacion, mradermacher aplica el esquema i1 (imatrix) propio de llama.cpp: se calcula una matriz de importancia a partir de estadisticas de activacion sobre el modelo original y se usa para ponderar la perdida de precision durante la cuantizacion. La model card indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma una conversion desde pesos Hugging Face. El fichero imatrix (0,1 GB) se distribuye publicamente para que otros puedan reproducir o generar cuantizaciones alternativas.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como `conversational`, orientado a dialogos multi-turno.
- Procesamiento de vision: la model card indica explicitamente que es un modelo de vision, con ficheros mmproj en el repositorio estatico hermano.
- Razonamiento y generacion general: no se documentan capacidades especificas de codigo, matematicas o tool calling en la informacion disponible.
- Multilingue: los metadatos solo declaran `en` (ingles); no se confirma soporte de otros idiomas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo de pensamiento (thinking): no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.

## Casos de uso

- Asistente conversacional local: con cuantizaciones Q4_K_M (18,8 GB) o Q5_K_M (21,9 GB), el modelo puede ejecutarse en una GPU de consumo de 24 GB (RTX 3090/4090) y gestionar dialogos multi-turno en ingles, adecuado para prototipos de chat privados sin dependencia de API.
- Procesamiento de imagenes con descripcion textual: al ser un modelo de vision, puede emplearse para tareas de image captioning o respuesta a preguntas sobre imagenes, cargando el mmproj desde el repositorio estatico junto con el GGUF cuantizado.
- Despliegue en portatiles con GPU integrada: las variantes IQ2_S (10,3 GB) e IQ2_M (11 GB) permiten ejecucion en equipos con 12-16 GB de VRAM compartida o memoria unificada, a costa de calidad.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 24 variantes del mismo modelo, lo que permite medir el impacto de la cuantizacion en perplejidad y calidad de salida para una tarea concreta antes de fijar una version en produccion.
- Generacion de cuantizaciones propias: el fichero imatrix publicado permite a equipos con llama.cpp generar variantes personalizadas (por ejemplo, mezclas de bits por capa) sin recalcular la matriz de importancia.
- Investigacion sobre modelos de ~30B: util como punto de comparacion en estudios de eficiencia de cuantizacion, dado que el modelo base supera los 30.000 millones de parametros y el rango de tamanos cubre desde 7,3 hasta 25,3 GB.
- Inferencia offline en entornos air-gapped: al ser un fichero GGUF autonomo, puede copiarse a maquinas sin acceso a Internet y ejecutarse con llama.cpp sin descargar pesos adicionales (salvo el mmproj si se requiere vision).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos, y tampoco se proporcionan datos de perplejidad por cuantizacion mas alla de las referencias genericas a graficas externas de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano del fichero GGUF mas overhead de contexto y KV cache):
  - i1-IQ1_S (7,3 GB): ~8-9 GB de VRAM.
  - i1-IQ2_M (11,0 GB): ~12-13 GB de VRAM.
  - i1-IQ3_M (14,5 GB): ~16 GB de VRAM.
  - i1-Q4_K_M (18,8 GB): ~20-21 GB de VRAM.
  - i1-Q5_K_M (21,9 GB): ~23-24 GB de VRAM.
  - i1-Q6_K (25,3 GB): ~27 GB de VRAM.
- GPU recomendadas:
  - Consumer: RTX 3090 o RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 4080/4070 Ti Super (16 GB) para IQ3_M o IQ4_XS; GPUs de 12 GB para IQ2_M.
  - Profesional/datacenter: A100 40/80 GB, H100 80 GB para Q6_K con contexto largo y margen de KV cache.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q4_K_M o Q5_K_M; en GPUs de 16 GB con IQ3_M o IQ4_XS; en GPUs de 12 GB con IQ2_M.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (importacion de GGUF), LM Studio, y servidores compatibles con la API de OpenAI mediante `endpoints_compatible`. No se recomienda vLLM ni TGI para GGUF sin conversion previa a safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mia-v2-29B-i1-GGUF (este) | ~30,7B | no disponible | no disponible | GGUF (i1) | 24 cuantizaciones, vision via mmproj |
| Mia-v2-29B-GGUF (mradermacher) | ~30,7B | no disponible | no disponible | GGUF (estatico) | Cuantizaciones estaticas del mismo base, sin imatrix |
| veld-ai/Mia-v2-29B (base) | ~30,7B | no disponible | no disponible | safetensors | Pesos originales en transformers |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria. Las variantes listadas comparten el mismo modelo base y difieren unicamente en el esquema de cuantizacion.

## Limitaciones y advertencias

- Licencia no declarada: no es posible confirmar si se permite uso comercial; verificar con el autor del modelo base antes de desplegar en produccion.
- Idioma limitado: los metadatos solo declaran ingles (`en`); el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Contexto desconocido: no se indica la longitud de ventana, lo que impide planificar tareas de contexto largo.
- Riesgo de alucinacion: no se documentan evaluaciones de factualidad ni tasas de alucinacion.
- Cuantizaciones de muy baja calidad: las variantes IQ1_S (7,3 GB) e IQ1_M (7,8 GB) estan marcadas por el autor como "for the desperate" y "mostly desperate"; no son adecuadas para produccion.
- Vision requiere fichero adicional: el mmproj no esta en este repositorio sino en Mia-v2-29B-GGUF; sin el, el modelo funciona solo como text-only.
- Repositorio de 334,8 GB: descargar el conjunto completo es costoso; conviene bajar solo la cuantizacion necesaria.
- Sin benchmarks: no hay evidencia publicada de calidad frente a modelos de tamano similar, lo que desaconseja adoptarlo sin evaluacion propia.
- Fecha de creacion futura en los metadatos (2026): inconsistencia que sugiere datos de catalogo poco fiables; tratar los metadatos con cautela.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Mia-v2-29B-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Mia-v2-29B-GGUF
- Modelo base: https://huggingface.co/veld-ai/Mia-v2-29B
- Pagina de descargas del autor: https://hf.tst.eu/model#Mia-v2-29B-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
