# mradermacher/Yoshino2-2B-GGUF

## Resumen

Yoshino2-2B-GGUF es la version cuantizada en formato GGUF del modelo Yoshino2-2B, un modelo de lenguaje de aproximadamente 1.940 millones de parametros desarrollado por el usuario en5yme y distribuido por mradermacher. El modelo base se presenta como un modelo de razonamiento obtenido mediante destilacion a partir de Nemotron-3.5-Lightning-30B-A3B-Distill, segun los metadatos de la model card. Esta version GGUF facilita la ejecucion local en hardware modesto mediante llama.cpp y herramientas compatibles.

El repositorio ofrece un conjunto amplio de cuantizaciones estaticas que van desde Q2_K (1,1 GB) hasta f16 (4,0 GB), ademas de suplementos multimodales mmproj en Q8_0 y f16, lo que sugiere que el modelo base podria tener capacidad de procesamiento de vision, aunque la model card no lo detalla explicitamente. La licencia MIT permite uso comercial sin restricciones significativas.

Su relevancia actual radica en que permite desplegar un modelo de razonamiento de ~2B parametros en equipos de consumo, con un rango de cuantizaciones que equilibra tamano y calidad, y con soporte para inferencia conversacional. No obstante, la informacion publicada es escasa: no se detallan la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, inferido por el pipeline de transformers) |
| Parametros totales | 1.942.653.248 (~1,94B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repo | 19,6 GB |
| Dataset de destilacion | en5yme/Nemotron-3.5-Lightning-30B-A3B-Distill |
| Modelo base | en5yme/Yoshino2-2B |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Yoshino2-2B. Por el pipeline declarado (transformers) y el proceso de cuantizacion a GGUF, se trata de un modelo transformer de ~1,94B parametros. Los tags del repositorio indican "distillation" y "reasoning", y el dataset asociado es en5yme/Nemotron-3.5-Lightning-30B-A3B-Distill, lo que sugiere que el modelo fue entrenado mediante destilacion de conocimiento a partir de un modelo mayor (Nemotron-3.5-Lightning-30B-A3B) para transferir capacidades de razonamiento a un modelo pequeno.

No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones tecnicas como atencion lineal, decodificacion especulativa o modos de pensamiento explicitos. La model card del repositorio GGUF es generica y se limita a describir el proceso de cuantizacion estatica realizado por mradermacher.

## Capacidades

- Generacion de texto conversacional en ingles, segun el tag "conversational".
- Razonamiento: el modelo se presenta como un modelo de razonamiento destilado, orientado a tareas que requieren cadenas de pensamiento.
- Destilacion: capacidad heredada del modelo profesor Nemotron-3.5-Lightning-30B-A3B, segun los metadatos.
- Posible soporte multimodal: el repositorio incluye suplementos mmproj (Q8_0 y f16), lo que sugiere capacidad de vision, aunque no se documenta explicitamente.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el tag "reasoning" sugiere cierta capacidad, pero sin detalles.
- Capacidades multilingues: limitadas al ingles segun el campo language.
- Modo thinking explicito, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales: con cuantizaciones Q4_K_M (1,4 GB) el modelo puede ejecutarse en portatiles con 8 GB de RAM, permitiendo iterar sobre prompts y flujos conversacionales sin coste de API.
- Razonamiento ligero en el borde (edge): al ser un modelo de ~2B con enfoque en razonamiento, es adecuado para tareas de clasificacion, extraccion de entidades o respuesta a preguntas simples en dispositivos con recursos limitados.
- Educacion e investigacion: sirve como caso de estudio de destilacion de modelos grandes a pequenos, permitiendo comparar el comportamiento de un 2B destilado frente a su profesor en tareas controladas.
- Generacion de texto en ingles embebida en aplicaciones: con la licencia MIT y pesos GGUF, se puede integrar en aplicaciones de escritorio o moviles mediante llama.cpp sin restricciones comerciales.
- Filtrado y resumen de documentos cortos: la ventana de contexto es desconocida, pero para textos breves el modelo puede resumir o reformular contenido en ingles con latencia baja en CPU.
- Experimentacion con cuantizaciones: el repositorio ofrece 12 variantes de cuantizacion, lo que permite evaluar el compromiso entre calidad y tamano en un mismo modelo, util para calibrar pipelines de despliegue.
- Base para fine-tuning ligero: al ser un modelo pequeno con licencia permisiva, puede servir como punto de partida para ajuste en dominios especificos en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion: Q2_K ~1,1 GB; Q4_K_M ~1,4 GB; Q6_K ~1,7 GB; Q8_0 ~2,2 GB; f16 ~4,0 GB. A estos valores hay que sumar el overhead del contexto y del runtime (tipicamente 0,5-2 GB adicionales).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para cuantizaciones Q4-Q5; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor throughput. En entornos profesionales, A100 o H100 no son necesarias para este tamano, pero pueden usarse para servir muchas peticiones concurrentes.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 4 GB o mas de VRAM; tambien en CPU con 8 GB de RAM usando Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. En terminos cualitativos, un modelo de ~2B en Q4_K_M sobre CPU moderna suele generar decenas de tokens por segundo, pero no se aportan mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Yoshino2-2B-GGUF | ~1,94B | no disponible | MIT | GGUF | Destilado de Nemotron-3.5-Lightning-30B-A3B; solo ingles |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32K (segun model card oficial) | Apache 2.0 | safetensors, GGUF | Multilingue, ampliamente soportado |
| Llama-3.2-1B-Instruct | ~1,2B | 128K (segun model card oficial) | Llama 3.2 Community License | safetensors, GGUF | Multilingue, requiere aceptar licencia |
| SmolLM2-1.7B-Instruct | ~1,7B | 8K (segun model card oficial) | Apache 2.0 | safetensors, GGUF | Enfoque en eficiencia, solo ingles |

Nota: los datos de contexto y licencia de los modelos comparables provienen de sus model cards publicas y no de la informacion proporcionada para Yoshino2-2B. No se dispone de benchmarks que permitan comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- Solo soporta ingles segun el campo language; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- La longitud de contexto no esta especificada, lo que impide planificar su uso en tareas de contexto largo.
- No hay benchmarks publicados, por lo que no se puede verificar la calidad del razonamiento ni compararla con alternativas.
- Riesgo de alucinacion inherente a modelos de ~2B, especialmente en tareas de conocimiento factual.
- La model card no documenta sesgos conocidos ni la composicion del dataset de destilacion, lo que dificulta evaluar riesgos de sesgo.
- El proceso de destilacion puede introducir artefactos o comportamientos del modelo profesor no deseados.
- Aunque la licencia es MIT, el modelo base deriva de un dataset vinculado a Nemotron, cuyos terminos de uso no se detallan en la informacion disponible; conviene revisar la licencia del modelo base en5yme/Yoshino2-2B antes de uso comercial.
- La presencia de suplementos mmproj sugiere capacidades multimodales no documentadas; su funcionamiento no esta garantizado.
- El repositorio tiene 0 likes y ~953 descargas, lo que indica adopcion limitada y poca validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Yoshino2-2B-GGUF
- Modelo base: https://huggingface.co/en5yme/Yoshino2-2B
- Dataset de destilacion: https://huggingface.co/datasets/en5yme/Nemotron-3.5-Lightning-30B-A3B-Distill
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Yoshino2-2B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Yoshino2-2B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
