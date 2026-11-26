# mradermacher/Chelone-1.0-GGUF

## Resumen

Chelone-1.0 es un modelo de lenguaje de aproximadamente 1.170 millones de parametros, desarrollado por Openwist y distribuido en formato GGUF por mradermacher. Se trata de un modelo afinado mediante LoRA y fusionado (merged) sobre una base no especificada en la informacion disponible, orientado explicitamente a despliegue on-device y a casos de uso con tool calling. Su tamano compacto lo situa en la categoria de modelos pequenos capaces de ejecutarse en hardware de consumo, lo que resulta relevante para aplicaciones de agentes locales y automatizacion ligera.

La ficha que nos ocupa corresponde a la version cuantizada del modelo original (Openwist/Chelone-1.0), publicada por mradermacher, un conocido distribuidor de cuantizaciones GGUF estaticas para la comunidad. El repositorio ofrece un abanico de cuantizaciones que va desde Q2_K (0,6 GB) hasta f16 (2,4 GB), lo que permite ajustar el equilibrio entre calidad y requisitos de memoria segun el hardware objetivo.

La licencia declarada es lfm1.0 (LFM Open License v1.0), una licencia de tipo "other" que impone condiciones especificas para uso comercial. El modelo declara soporte unicamente para ingles y esta etiquetado con capacidades de tool-use y orientacion on-device, lo que lo posiciona como candidato para asistentes locales con acceso a herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Openwist/Chelone-1.0) |
| Parametros totales | 1.170.340.608 (~1,17 B) |
| Parametros activos | no disponible (no consta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (LFM Open License v1.0) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base (tipo de transformer, atencion, capas, dimensiones ocultas ni tamano de contexto). Lo que si se conoce es el proceso de publicacion: Chelone-1.0 se construyo mediante un ajuste fino con LoRA sobre una base no identificada y posteriormente se fusiono (merged) en un unico conjunto de pesos. El modelo resultante se distribuye en el repositorio original en formato transformers (safetensors) y mradermacher lo ha convertido a GGUF mediante un proceso de conversion estandar (convert_type: hf) y cuantizacion estatica.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO o similar. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. Las etiquetas del repositorio (lora, merged, on-device, tool-use) sugieren que el ajuste se oriento a mejorar el uso de herramientas y la eficiencia en dispositivos locales, pero no se aportan metricas que lo cuantifiquen.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Soporte de tool calling / function calling, indicado por la etiqueta `tool-use`.
- Orientacion a despliegue on-device, segun la etiqueta `on-device`.
- Capacidades multilingues limitadas al ingles (unico idioma declarado).
- No se documentan capacidades de vision, audio, thinking mode ni razonamiento multi-paso explicito en la informacion disponible.
- No se documenta soporte de agentes o multi-step reasoning mas alla de lo implicito en tool-use.

## Casos de uso

- Asistentes locales con acceso a herramientas: el modelo puede integrarse en aplicaciones de escritorio o moviles que necesiten invocar funciones externas (APIs, calculadoras, consultas a bases de datos) mediante tool calling, ejecutandose localmente gracias a su tamano de ~1,17 B de parametros.
- Automatizacion de tareas en el navegador: combinado con frameworks de agentes, puede gestionar flujos sencillos de extraccion y accion sobre paginas web en un entorno controlado, aprovechando su soporte de tool-use.
- Prototipado rapido de chatbots: su reducido tamano permite iterar rapidamente en el diseno de conversaciones y prompts sin depender de infraestructura en la nube.
- Despliegue en dispositivos con recursos limitados: las cuantizaciones Q4_K_S y Q4_K_M (~0,8 GB) permiten ejecutar el modelo en equipos con 8 GB de RAM o menos, ideal para aplicaciones embebidas o portatiles.
- Filtrado y clasificacion de texto en ingles: puede emplearse como clasificador ligero o generador de etiquetas en pipelines de procesamiento de documentos, con baja latencia.
- Educacion y demos offline: util para entornos sin conectividad donde se requiera un asistente conversacional basico en ingles, como talleres o demostraciones en ferias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre ~0,6 GB (Q2_K) y ~2,4 GB (f16), segun la cuantizacion elegida.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) puede alojar el modelo completo en VRAM incluso en f16.
- Cabe en GPU consumer: si, en todas las cuantizaciones; las versiones Q4_K_S/Q4_K_M (~0,8 GB) son adecuadas para GPUs con 4 GB o incluso para CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el repositorio tambien es compatible con endpoints (etiqueta `endpoints_compatible`) y con transformers para la version original.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo que permitan una comparativa cuantitativa fiable. A continuacion se ofrece una comparacion estructural con alternativas de tamano similar, marcando como "no disponible" los datos que no se conocen.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Chelone-1.0 (esta ficha) | ~1,17 B | no disponible | lfm1.0 | GGUF, safetensors |
| Modelos ~1B de la familia Llama | ~1 B | no disponible | licencia Llama | GGUF, safetensors |
| Modelos ~1B de la familia Qwen | ~1 B | no disponible | Apache 2.0 (segun version) | GGUF, safetensors |
| Modelos ~1B de la familia Gemma | ~1 B | no disponible | Gemma license | GGUF, safetensors |

La comparacion de rendimiento, contexto y calidad no puede realizarse con la informacion disponible.

## Limitaciones y advertencias

- Idiomas: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Sesgos: no se documentan evaluaciones de sesgo; al ser un modelo pequeno afinado con LoRA, puede heredar sesgos de la base y del dataset de ajuste, no especificados.
- Alucinacion: los modelos de ~1 B de parametros tienden a una mayor tasa de alucinacion en tareas de conocimiento factual; no hay datos especificos para este modelo.
- Licencia: la licencia lfm1.0 impone condiciones adicionales para uso comercial; es imprescindible revisar el archivo LICENSE antes de desplegar en produccion.
- Contexto: se desconoce la longitud de contexto soportada, lo que limita la planificacion de casos de uso con documentos largos.
- Documentacion: la model card es escasa y no aporta informacion sobre entrenamiento, evaluacion ni limitaciones conocidas; esto dificulta la evaluacion rigurosa del modelo.
- Produccion: al no haber benchmarks publicados, no se recomienda su uso en entornos criticos sin una evaluacion propia previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Chelone-1.0-GGUF
- Modelo base: https://huggingface.co/Openwist/Chelone-1.0
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Chelone-1.0-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
