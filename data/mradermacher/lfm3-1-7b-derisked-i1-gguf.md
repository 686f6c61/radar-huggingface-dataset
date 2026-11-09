# mradermacher/LFM3-1.7B-DERISKED-i1-GGUF

## Resumen

LFM3-1.7B-DERISKED-i1-GGUF es una cuantizacion en formato GGUF del modelo Blackfrost-AI/LFM3-1.7B-DERISKED, un derivado del modelo LFM3 de Liquid AI (familia Liquid Foundation Models). El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de cuantizaciones GGUF en Hugging Face, e incluye tanto cuantizaciones estaticas (publicadas en un repositorio separado) como cuantizaciones ponderadas con matriz de importancia (imatrix) en este repositorio.

El modelo base pertenece a la familia LFM3 de Liquid AI, disenada para despliegue eficiente en entornos con recursos limitados, y ha sido modificado por Blackfrost-AI bajo la etiqueta "DERISKED", que segun los tags del repositorio implica pesos "baked" (fusionados) y un proceso de reduccion de riesgos que no se documenta en detalle en la informacion disponible. El modelo esta etiquetado como "research" y "open-weights", con licencia lfm1.0.

La relevancia de esta ficha radica en que se trata de una cuantizacion GGUF pensada para inferencia local y despliegue en CPU o GPU de gama baja, con un numero muy elevado de variantes de cuantizacion (desde IQ1_S hasta Q6_K), lo que permite ajustar el consumo de memoria a hardware muy modesto. No obstante, la informacion publicada es escasa: no hay benchmarks, no hay detalle de arquitectura ni de datos de entrenamiento en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM3 de Liquid AI; detalles no publicados en la informacion disponible) |
| Parametros totales | 899.013 (dato de safetensors del repo base; la nomenclatura "1.7B" sugiere ~1,7 mil millones, discrepancia no aclarada en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (mas fichero imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (licencia "other" en Hugging Face) |
| Formato de pesos | GGUF (cuantizaciones estaticas e imatrix); el modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la informacion proporcionada. Los tags indican la familia LFM3 de Liquid AI, conocida por sus modelos con capas de estado (state space models) hibridas, pero la model card de esta cuantizacion no confirma la arquitectura concreta ni el numero de capas, dimensiones o tipo de atencion. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o similar.

Lo que si se documenta es el proceso de cuantizacion: mradermacher ha generado cuantizaciones ponderadas con matriz de importancia (imatrix) a partir del modelo Blackfrost-AI/LFM3-1.7B-DERISKED, usando la herramienta de cuantizacion de llama.cpp con el fichero imatrix incluido en el repositorio. El tag "baked-weights" sugiere que el modelo base tiene pesos fusionados (posiblemente fusion de adaptadores o de capas), y "derisked" indica un proceso de reduccion de riesgos no especificado. El tag "custom_code" implica que el modelo base requiere codigo personalizado para su carga en transformers.

## Capacidades

- Generacion de texto en ingles (unico idioma declarado).
- Razonamiento y conversacion general, segun la naturaleza del modelo base LFM3.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso en la informacion disponible.
- No se documenta capacidad de vision, audio ni modo "thinking" en la informacion disponible.
- Capacidades multilingues: solo ingles declarado.
- El modelo esta etiquetado como "research" y "open-weights", orientado a experimentacion.

## Casos de uso

- Inferencia local en equipos sin GPU dedicada: las cuantizaciones IQ1_S e IQ2 permiten ejecutar el modelo en CPU con poca RAM, adecuado para pruebas de concepto y prototipos en portatiles.
- Despliegue en GPUs de gama baja (8-12 GB de VRAM): las cuantizaciones Q4_K_M e IQ4_XS ofrecen un equilibrio razonable entre calidad y memoria para chatbots locales.
- Experimentacion en investigacion: al estar etiquetado como "research", sirve para comparar el efecto de distintas cuantizaciones sobre la calidad de generacion en modelos de la familia LFM3.
- Generacion de texto en ingles para tareas de resumen y redaccion en entornos con recursos limitados, usando llama.cpp u Ollama.
- Evaluacion de tecnicas de cuantizacion imatrix: el repositorio incluye el fichero imatrix, util para reproducir o generar cuantizaciones propias con distintas calibraciones.
- Integracion en pipelines de CI/CD para pruebas de regresion de calidad de cuantizaciones, comparando salidas entre variantes IQ y K.
- Prototipado de asistentes conversacionales en ingles en dispositivos edge, donde el consumo de memoria es el factor limitante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un modelo de ~1,7 mil millones de parametros, las cuantizaciones Q4 rondarian los 1-1,5 GB y las Q6 en torno a 1,5-2 GB, aunque estas cifras son estimaciones generales y no datos publicados para este modelo concreto.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cabria esperar funcionamiento en GPUs consumer con 4-8 GB de VRAM en cuantizaciones bajas.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de GPUs consumer actuales con cuantizaciones Q4 o inferiores, aunque no se confirma con datos oficiales.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el modelo base usa transformers con codigo personalizado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos, por lo que no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Solo soporta ingles; no se declara soporte multilingue.
- No hay benchmarks publicados, por lo que la calidad real del modelo y de sus cuantizaciones no esta verificada.
- El proceso "DERISKED" y los "baked-weights" no estan documentados; se desconoce que modificaciones se aplicaron al modelo original y su impacto en el comportamiento.
- La discrepancia entre el nombre "1.7B" y el recuento de safetensors (899.013) no se aclara en la informacion disponible; conviene verificar el tamano real antes de planificar el despliegue.
- Licencia lfm1.0: es una licencia "other" que puede imponer restricciones al uso comercial; es necesario revisar el texto completo de la licencia antes de usarlo en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas.
- Sesgos conocidos: no documentados en la informacion disponible.
- El modelo esta etiquetado como "research"; no se recomienda su uso en produccion sin una evaluacion previa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; ecosistema de validacion practicamente nulo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-1.7B-DERISKED-i1-GGUF
- Modelo base: https://huggingface.co/Blackfrost-AI/LFM3-1.7B-DERISKED
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/LFM3-1.7B-DERISKED-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#LFM3-1.7B-DERISKED-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
