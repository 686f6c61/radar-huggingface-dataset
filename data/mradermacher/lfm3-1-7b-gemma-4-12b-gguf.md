# mradermacher/LFM3-1.7B-Gemma-4-12B-GGUF

## Resumen

LFM3-1.7B-Gemma-4-12B-GGUF es la distribucion en formato GGUF de un modelo derivado del LFM3-1.7B de LiquidAI, sometido a un proceso de destilacion de conocimiento desde un modelo de la familia Gemma 4 de 12.000 millones de parametros y posteriormente ajustado de forma supervisada (SFT) con LoRA sobre un corpus orientado al indonesio. El autor del modelo base es el usuario s3t4 y la cuantizacion la realiza mradermacher, un actor habitual en la publicacion de pesos GGUF para llama.cpp.

El modelo resuelve el problema de disponer de un modelo compacto de 1.728.801.600 parametros (aproximadamente 1,7 mil millones) con capacidades conversacionales y de razonamiento destiladas de un modelo mucho mayor, empaquetado en cuantizaciones que van desde 0,9 GB (Q2_K) hasta 3,6 GB (f16). Esto lo hace desplegable en hardware de consumo y en entornos con VRAM limitada.

Es relevante porque combina tres tecnicas en una sola pieza: destilacion desde un modelo grande, ajuste supervisado especifico para un idioma de bajos recursos como el indonesio, y publicacion en GGUF con una bateria amplia de cuantizaciones estaticas. La licencia es lfm1.0, heredada del LFM3 original de LiquidAI, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3-1.7B de LiquidAI; el tag "liquid" sugiere la familia Liquid Foundation Model, pero la model card no detalla la arquitectura interna) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | indonesio (id) |
| Licencia | lfm1.0 (license: other, con enlace a la licencia de LiquidAI/LFM3-1.7B) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en formato transformers |
| Tamano del repo | 15,9 GB |
| Libreria | transformers |
| Modelo base | s3t4/LFM3-1.7B-Gemma-4-12B |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base LFM3-1.7B. Los tags "liquid" y "lfm3" apuntan a la familia Liquid Foundation Model de LiquidAI, y el tag "custom_code" indica que la carga requiere codigo personalizado en transformers. El modelo parte de LFM3-1.7B y se somete a destilacion de conocimiento desde un modelo Gemma 4 de 12.000 millones de parametros, segun reflejan los tags "distillation", "knowledge-distillation" y "gemma-4".

Sobre esa base destilada se aplica un ajuste supervisado (SFT) con LoRA y posterior fusion de los adaptadores ("lora", "merged", "trl"). Los datasets empleados son indolem/IndoMMLU, cambridgeltl/xcopa, CohereLabs/aya_dataset y AksaraLLM/aksara-sft-clean-v1, lo que orienta el ajuste hacia el indonesio en tareas de comprension, inferencia y conversacion. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en indonesio, con formato de chat (tag "conversational").
- Razonamiento y comprension lectora en indonesio, derivados del ajuste sobre IndoMMLU y xcopa.
- Inferencia de sentido comun y tareas de eleccion multiple (xcopa).
- Capacidades multilingues limitadas: el unico idioma declarado es el indonesio, aunque el corpus aya_dataset incluye contenido multilingue.
- Destilacion de capacidades de un modelo de 12.000 millones de parametros en un modelo de 1,7 mil millones.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Atencion al cliente en indonesio: el modelo puede gestionar conversaciones multi-turno en dicho idioma gracias a su ajuste SFT sobre aya_dataset y AksaraLLM, con un coste de inferencia bajo al caber en GPUs de consumo.
- Clasificacion y moderacion de texto en indonesio: su entrenamiento sobre IndoMMLU y xcopa lo hace util para tareas de comprension y eleccion multiple en ese idioma, desplegable en CPU mediante llama.cpp con cuantizaciones Q4_K_M de 1,2 GB.
- Prototipado rapido en entornos con VRAM limitada: la cuantizacion Q2_K (0,9 GB) permite ejecutar el modelo en GPUs integradas o incluso en CPU, util para validar pipelines antes de escalar a modelos mayores.
- Investigacion en destilacion de conocimiento: sirve como caso de estudio de como un modelo de 1,7 mil millones entrenado por destilacion desde un Gemma 4 de 12.000 millones rinde en tareas especificas de un idioma concreto.
- Evaluacion comparativa de cuantizaciones: la publicacion de doce variantes (Q2_K a f16) permite medir el impacto de la cuantizacion en la calidad de las respuestas en indonesio, con tamanos que van de 0,9 a 3,6 GB.
- Generacion de datos sinteticos en indonesio: el modelo puede emplearse para producir pares pregunta-respuesta o textos de aumento de datos en ese idioma, dado su ajuste conversacional y su bajo coste de ejecucion.
- Educacion y tutoria automatizada en indonesio: con un contexto no especificado pero un tamano compacto, puede desplegarse en entornos educativos con hardware modesto para asistencia en tareas de comprension lectora.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (tamanos de archivo del repositorio):
  - Q2_K: 0,9 GB
  - Q3_K_S: 1,0 GB; Q3_K_M: 1,0 GB; Q3_K_L: 1,1 GB
  - IQ4_XS: 1,1 GB
  - Q4_K_S: 1,2 GB; Q4_K_M: 1,2 GB
  - Q5_K_S: 1,3 GB; Q5_K_M: 1,4 GB
  - Q6_K: 1,5 GB
  - Q8_0: 1,9 GB
  - f16: 3,6 GB
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, cualquier GPU con al menos 2 GB de VRAM puede ejecutar las cuantizaciones Q4_K_M, y una GPU con 4 GB o mas puede ejecutar f16.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU de consumo actual con 2 GB o mas de VRAM para cuantizaciones Q4, y con 4 GB o mas para f16.
- Opciones de despliegue: llama.cpp y derivados compatibles con GGUF (Ollama, LM Studio, entre otros); el modelo base requiere transformers con codigo personalizado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-1.7B-Gemma-4-12B-GGUF (este) | 1.728.801.600 | no disponible | indonesio | lfm1.0 | GGUF |
| LFM3-1.7B (base, LiquidAI) | 1,7 mil millones (aproximado) | no disponible | no disponible | lfm1.0 | transformers |
| Gemma 4 12B (origen de la destilacion) | 12.000 millones (aproximado) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado casi exclusivamente en indonesio; su rendimiento en castellano u otros idiomas no esta documentado y probablemente sea limitado.
- La licencia lfm1.0 es restrictiva y puede condicionar el uso comercial; es necesario revisar el enlace a la licencia de LiquidAI antes de desplegarlo en produccion.
- Al ser un modelo destilado de 1,7 mil millones de parametros, es esperable una mayor tasa de alucinacion y menor fidelidad en tareas complejas que el modelo Gemma 4 de 12.000 millones del que se destila.
- No se especifica la longitud de contexto, lo que impide garantizar el manejo de conversaciones o documentos largos.
- Las cuantizaciones de menor tamano (Q2_K, Q3_K_S) degradan la calidad; el propio autor recomienda Q4_K_S o Q4_K_M para un equilibrio entre velocidad y fidelidad.
- No hay informacion sobre sesgos conocidos, datos de entrenamiento exactos ni evaluaciones de seguridad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria del modelo.
- El modelo base requiere codigo personalizado en transformers, lo que puede complicar la integracion en pipelines estandar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM3-1.7B-Gemma-4-12B-GGUF
- Modelo base: https://huggingface.co/s3t4/LFM3-1.7B-Gemma-4-12B
- Licencia LFM3-1.7B de LiquidAI: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#LFM3-1.7B-Gemma-4-12B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes del cuantizador: https://huggingface.co/mradermacher/model_requests
- Dataset IndoMMLU: https://huggingface.co/datasets/indolem/IndoMMLU
- Dataset xcopa: https://huggingface.co/datasets/cambridgeltl/xcopa
- Dataset aya_dataset: https://huggingface.co/datasets/CohereLabs/aya_dataset
- Dataset aksara-sft-clean-v1: https://huggingface.co/datasets/AksaraLLM/aksara-sft-clean-v1
