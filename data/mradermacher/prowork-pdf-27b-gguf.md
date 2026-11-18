# mradermacher/ProWork-PDF-27B-GGUF

## Resumen

ProWork-PDF-27B-GGUF es una cuantizacion estatica en formato GGUF del modelo ProWork-PDF-27B, publicado por el usuario mradermacher en Hugging Face. El modelo base pertenece a aibuildai-inc y, por su nombre, esta orientado al procesamiento de documentos PDF, aunque no se dispone de documentacion oficial sobre su proposito exacto ni sobre su arquitectura interna.

El repositorio contiene unicamente los pesos cuantizados generados mediante una herramienta de conversion tipo llama.cpp, con un conjunto de variantes que abarca desde Q2_K hasta F16, ademas de IQ4_XS. El tamano del repositorio es de 1,6 GB, lo que resulta llamativamente pequeno para un modelo cuyo nombre sugiere 27B parametros.

Existe una discrepancia importante entre el nombre del modelo (27B) y el recuento real de parametros reportado en safetensors (460.730.096, es decir, aproximadamente 0,46B). Esta ficha documenta ambos datos y advierte de la inconsistencia, ya que no es posible determinar a partir de la informacion disponible cual de las dos cifras refleja el modelo final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 460.730.096 (segun safetensors); el nombre indica 27B (discrepancia no resuelta) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo); el modelo base se distribuye presumiblemente en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base. La model card del repositorio GGUF es una plantilla autogenerada por la herramienta de cuantizacion e incluye unicamente metadatos tecnicos del proceso de conversion: `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que indica que la conversion se realizo a partir de pesos en formato Hugging Face.

No hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. Tampoco se documenta el proceso de cuantizacion mas alla de la lista de variantes generadas.

## Capacidades

- No se han documentado capacidades especificas en la informacion disponible.
- Por el nombre del modelo base (ProWork-PDF), se infiere una orientacion al procesamiento de documentos PDF, pero no se confirma ni el tipo de tarea (extraccion, resumen, QA documental) ni las modalidades soportadas.
- No hay confirmacion de soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking.
- No hay informacion sobre capacidades multilingues.
- No se confirma soporte de vision ni de audio.

## Casos de uso

Dada la ausencia de documentacion funcional, los siguientes casos son hipotesis razonables derivadas del nombre del modelo y deben validarse empiricamente antes de cualquier uso en produccion:

- Procesamiento por lotes de PDF en local: al distribuirse en GGUF, puede ejecutarse con llama.cpp u Ollama en hardware de consumo, lo que permite procesar documentos sin enviar datos a servicios externos.
- Extraccion de campos estructurados de facturas o formularios: si el modelo base fue ajustado para comprension documental, podria emplearse para poblar esquemas JSON a partir de texto extraido de PDF.
- Resumen de informes largos: utilizable en pipelines internos donde la confidencialidad impide usar APIs comerciales.
- Clasificacion y enrutado de documentos: integrable como primer paso en un pipeline RAG para decidir que extractor aplicar a cada PDF.
- Prototipado rapido en estaciones de trabajo: las variantes Q4_K_M e IQ4_XS permiten iterar en CPU o GPU modesta con un consumo de disco reducido.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes del mismo modelo, lo que facilita medir la degradacion de calidad segun el nivel de cuantizacion en una tarea documental concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma fiable debido a la discrepancia entre el nombre (27B) y el recuento de parametros (0,46B). Con 0,46B parametros, una variante Q4_K_M ocuparia del orden de 300-400 MB; con 27B parametros, una Q4_K_M requeriria aproximadamente 16-17 GB.
- GPU recomendadas: no disponible. Si el modelo real es de ~0,5B, cabria en cualquier GPU consumer moderna e incluso en CPU; si fuese de 27B, requeriria GPUs de 24 GB o superiores (RTX 3090/4090, A100, H100).
- Despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no consumen GGUF de forma nativa en todas sus versiones, por lo que habria que usar los pesos originales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No es posible establecer una comparativa rigurosa sin conocer la arquitectura, el tamano real y el dominio de aplicacion del modelo. A modo de referencia estructural, se compara con otros modelos pequenos distribuidos en GGUF:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| ProWork-PDF-27B-GGUF | 460M (segun safetensors) / 27B (segun nombre) | no disponible | no disponible | GGUF |
| Qwen2.5-0.5B-Instruct-GGUF | 0,49B | 32.768 | Apache 2.0 | GGUF |
| Llama-3.2-1B-Instruct-GGUF | 1,24B | 131.072 | Llama 3.2 Community | GGUF |
| Gemma-2-2B-it-GGUF | 2,6B | 8.192 | Gemma Terms | GGUF |

La comparativa es puramente orientativa en cuanto a formato y despliegue; no se dispone de datos de rendimiento del modelo evaluado para contrastarlo con estas alternativas.

## Limitaciones y advertencias

- Discrepancia critica entre el nombre del modelo (27B) y el recuento de parametros en safetensors (460M). Verificar el modelo base antes de cualquier uso.
- Licencia no declarada: no es posible confirmar si se permite uso comercial. Contactar con el autor del modelo base (aibuildai-inc) antes de desplegarlo en produccion.
- Sin model card funcional: no hay descripcion de tareas, idiomas ni limitaciones, lo que impide evaluar su idoneidad sin pruebas propias.
- Riesgo de alucinacion: desconocido, pero inherente a cualquier modelo generativo sin documentacion de evaluacion.
- Sesgos: no documentados.
- Idiomas: no confirmados; no asumir soporte del castellano sin validacion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad en tareas de extraccion documental, donde la fidelidad literal es critica.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ProWork-PDF-27B-GGUF
- Modelo base: https://huggingface.co/aibuildai-inc/ProWork-PDF-27B
