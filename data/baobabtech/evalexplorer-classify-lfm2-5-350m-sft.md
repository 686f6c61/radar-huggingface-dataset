# baobabtech/evalexplorer-classify-lfm2.5-350m-sft

## Resumen

evalexplorer-classify-lfm2.5-350m-sft es un adaptador LoRA (formato PEFT) fine-tuneado por baobabtech sobre el modelo base LiquidAI/LFM2.5-350M. Su funcion es clasificar las primeras paginas de un informe de evaluacion de desarrollo internacional y devolver un objeto JSON con cinco campos: `evaluation_approach`, `evaluation_type`, `temporality`, `themes` y `countries`. Es, por tanto, un modelo de clasificacion de documentos con salida estructurada, no un modelo conversacional de proposito general.

El adaptador se entreno mediante SFT con LoRA (r=16, alpha=16) sobre el config `classify_codes` del dataset baobabtech/evalexplorer-data, con 1148 documentos de entrenamiento. El entrenamiento completo duro 4,2 minutos en GPU, lo que refleja el tamano reducido del modelo base (350M parametros) y del conjunto de datos. Forma parte de la serie de experimentos documentados en baobabtech/evalexplorer-classify-experiments.

Su relevancia es la de un modelo exploratorio dentro del pipeline EvalExplorer: ha sido entrenado y evaluado contra las etiquetas generadas por un LLM del propio pipeline de ingesta, que ninguna persona ha revisado. Por ello, las metricas publicadas miden concordancia con ese pipeline, no correccion real. El propio autor indica que la version prevista es entrenar sobre las etiquetas de un reetiquetado independiente (GLM).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo base LiquidAI/LFM2.5-350M; arquitectura interna del base no detallada en la informacion proporcionada |
| Parametros totales | 350 M (modelo base); adaptador LoRA con r=16, alpha=16 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (segun `max_seq_length=8192` del ejemplo de uso) |
| Tipos de cuantizacion | No disponible; el ejemplo de uso emplea bf16 con `load_in_4bit=False` |
| Idiomas soportados | No disponible |
| Licencia | lfm1.0 (licencia "other", LFM1.0); texto en https://huggingface.co/LiquidAI/LFM2.5-350M/blob/main/LICENSE |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo completo. Segun la model card, el entrenamiento aplico LoRA sobre todas las capas lineales del modelo de lenguaje, con r=16 y alpha=16, en precision bf16, learning rate 0,0002, 2 epocas, batch de 2 con 8 pasos de acumulacion y calculo de perdida unicamente sobre la respuesta (loss on the answer only). La tarea es de clasificacion de documentos con salida JSON estructurada y decodificacion greedy. Los detalles concretos de la arquitectura interna del modelo base LFM2.5-350M no se recogen en la informacion proporcionada.

Los datos de entrenamiento son 1148 documentos del config `classify_codes` del dataset baobabtech/evalexplorer-data. No se menciona en la informacion disponible el uso de RLHF o DPO; el metodo declarado es SFT. Un punto tecnico critico es el origen de las etiquetas: el modelo se entreno sobre las etiquetas LLM del pipeline de ingesta de EvalExplorer, que no han sido revisadas por personas. Esto convierte las metricas en una medida de concordancia con ese pipeline, no de exactitud objetiva. Ademas, el informe de la ejecucion puntua las mismas respuestas contra un reetiquetado independiente con GLM-5.3-Flash que el modelo nunca vio.

## Capacidades

- Clasificacion de documentos de evaluacion de desarrollo internacional a partir de sus primeras paginas.
- Salida estructurada en JSON con cinco campos: `evaluation_approach`, `evaluation_type`, `temporality`, `themes` y `countries`.
- Soporte de los campos de tipo lista (`themes`, `countries`) y de los campos de codigo unico (`evaluation_approach`, `evaluation_type`, `temporality`).
- Formato de chat mediante plantilla de chat (`apply_chat_template`) con generacion de un unico turno.
- Modo "thinking" desactivado de forma explicita en la evaluacion publicada (`enable_thinking=False`).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo esta orientado a una clasificacion de un solo paso).
- Capacidades multilingues: no disponibles.
- Capacidades de vision o audio: no disponibles (adaptador de lenguaje sobre un modelo de texto).

## Casos de uso

- Clasificacion por lotes de informes de evaluacion: dado un directorio de informes, extraer automaticamente los cinco campos de cada uno para indexarlos en un catalogo o repositorio documental, aprovechando que el modelo emite JSON valido (1.000 de tasa de JSON valido en el test publicado).
- Enriquecimiento de metadatos en pipelines de ingesta: usar el modelo como paso de etiquetado previo a la revision humana, generando campos como `themes` y `countries` con F1 micro de 0,771 y 0,712 respectivamente.
- Filtrado y busqueda semantica: poblar un indice de busqueda con `evaluation_approach`, `temporality` o `countries` para permitir consultas facetadas sobre una coleccion de evaluaciones.
- Triaje y enrutado documental: dirigir cada informe al equipo o flujo correspondiente segun `evaluation_type` (precision de 0,836 en el test publicado), reduciendo clasificacion manual de primer nivel.
- Analisis agregado de portafolios: clasificar grandes volumenes de informes para construir estadisticas descriptivas sobre enfoques de evaluacion y cobertura geografica a lo largo del tiempo.
- Prototipado de bajo coste: por el tamano del modelo base (350M) y la posibilidad de inferencia en GPU de consumo o incluso CPU, resulta adecuado para experimentos locales y pruebas de concepto del pipeline de clasificacion antes de escalar a modelos mayores.
- Generacion de borradores de etiquetas para anotacion: usar el modelo para pre-anotar documentos que despues revisa un anotador humano, acelerando la creacion de conjuntos de datos supervisados.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de test de 134 documentos, con decodificacion greedy y modo thinking desactivado:

| Metrica | Test (134 documentos) |
|---|---|
| JSON valid | 1.000 |
| Exact match (los cinco campos) | 0.142 |
| Mean field score | 0.792 |
| evaluation_approach accuracy | 0.791 |
| evaluation_type accuracy | 0.836 |
| temporality accuracy | 0.724 |
| themes micro F1 | 0.771 |
| countries micro F1 | 0.712 |

Advertencia del autor: el modelo fue entrenado y evaluado contra las etiquetas LLM del pipeline de ingesta de EvalExplorer, que ninguna persona ha revisado, por lo que estas cifras miden concordancia con ese pipeline y no correccion. El informe de la ejecucion incluye ademas una puntuacion contra un reetiquetado independiente con GLM-5.3-Flash que el modelo no vio. No se dispone de resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion proporcionada.

## Requisitos de hardware

- Peso del modelo base en bf16: aproximadamente 0,7 GB (350 M parametros × 2 bytes). Estimacion derivada del numero de parametros.
- Peso en 4 bits: aproximadamente 0,2-0,35 GB. Estimacion derivada del numero de parametros.
- VRAM para inferencia: muy baja; con el modelo base mas el adaptador y ventana de 8192 tokens cabe holgadamente en cualquier GPU de consumo. Estimacion, no dato publicado.
- GPU recomendadas: cualquier GPU moderna con al menos unos pocos GB de VRAM. Modelos como RTX 3060, RTX 4090, A100 o H100 son sobradamente suficientes; el modelo tambien puede ejecutarse en CPU.
- Cabe en consumer GPU: si, en practicamente cualquier GPU de consumo actual e incluso en CPU.
- Entrenamiento publicado: GPU (sin especificar modelo), 4,2 minutos de tiempo total de entrenamiento.
- Opciones de despliegue: carga mediante PEFT sobre el modelo base (ejemplo con Unsloth y `PeftModel`), fusion del adaptador en los pesos base y posterior servicio con vLLM, TGI, llama.cpp u Ollama. El repositorio no incluye pesos GGUF; para llama.cpp u Ollama habria que convertir el modelo fusionado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada modelos comparables con datos publicados. La referencia natural es el propio modelo base, que no incluye el adaptador de clasificacion.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evalexplorer-classify-lfm2.5-350m-sft | 350 M (base) + LoRA r=16 | 8192 tokens (ejemplo de uso) | Clasificacion documental a JSON | lfm1.0 | HuggingFace (adaptador PEFT) |
| LiquidAI/LFM2.5-350M (base) | 350 M | No disponible | Modelo de lenguaje general | lfm1.0 | HuggingFace |
| Otros modelos comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo exploratorio: el autor lo describe explicitamente como experimental y anuncia que la version prevista se entrenara sobre las etiquetas de GLM.
- Etiquetas de entrenamiento no revisadas por humanos: las metricas miden concordancia con el pipeline de ingesta de EvalExplorer, no correccion objetiva. Un exact match de 0,142 sobre los cinco campos indica que la coincidencia completa es poco frecuente.
- Riesgo de alucinacion: al ser un modelo de 350M orientado a generar JSON, puede producir valores de campo plausibles pero incorrectos, especialmente en los campos de lista (`themes`, `countries`).
- Dominio restringido: entrenado unicamente para informes de evaluacion de desarrollo internacional a partir de sus primeras paginas; fuera de ese dominio no hay garantia de comportamiento.
- Idiomas: no se especifica que idiomas soporta; no hay datos sobre su comportamiento multilingue.
- Longitud de contexto: el ejemplo de uso fija `max_seq_length=8192`; no se documenta el comportamiento con documentos que excedan esa ventana.
- Licencia: hereda la licencia LFM1.0 del modelo base (etiquetada como "other"). Es responsabilidad del usuario revisar las condiciones de uso comercial en el texto de licencia enlazado antes de usarlo en produccion.
- Uso en produccion: al ser un adaptador sobre etiquetas no validadas y con muy pocas descargas y likes, se recomienda validacion adicional contra un conjunto de referencia humano antes de cualquier despliegue real.
- Tasa de coincidencia exacta baja: aunque el JSON es valido en el 100 % de los casos, el exact match de los cinco campos es de 0,142, lo que limita su uso en flujos que requieran la etiqueta completa sin post-procesado o correccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/baobabtech/evalexplorer-classify-lfm2.5-350m-sft
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Licencia del modelo base (LFM1.0): https://huggingface.co/LiquidAI/LFM2.5-350M/blob/main/LICENSE
- Dataset de experimentos: https://huggingface.co/datasets/baobabtech/evalexplorer-classify-experiments
- Codigo de los experimentos: https://huggingface.co/datasets/baobabtech/evalexplorer-classify-experiments/tree/main/code
- Dataset de entrenamiento: https://huggingface.co/datasets/baobabtech/evalexplorer-data
- Informe de la ejecucion (lfm2.5-350m-sft--test): https://huggingface.co/datasets/baobabtech/evalexplorer-classify-experiments/blob/main/runs/lfm2.5-350m-sft--test/README.md
