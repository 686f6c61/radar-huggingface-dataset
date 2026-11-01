# mradermacher/DecisionFairy-4B-GGUF

## Resumen

DecisionFairy-4B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo DecisionFairy-4B, un modelo de lenguaje especializado en tareas de decisión ("decision-model") desarrollado por wesjos y cuantizado por mradermacher, un cuantizador bien conocido en la comunidad de Hugging Face. El modelo base se ha entrenado sobre los conjuntos de datos LocalLLaMA/typed-decisions y SargeDev/jev-distill-corpus-v3, lo que sugiere un enfoque en la clasificación y razonamiento sobre decisiones tipadas, posiblemente relacionado con el formato "JEV" y el concepto "systemone" mencionados en sus etiquetas.

El modelo base se apoya en la arquitectura Qwen3.5 (según la etiqueta qwen3_5) y se ha entrenado con la librería Unsloth, una herramienta popular para el ajuste fino eficiente de modelos. Con aproximadamente 4.237 millones de parámetros, se trata de un modelo compacto pensado para ejecutarse en hardware de consumo, especialmente útil para quien necesite capacidades de análisis de decisiones sin depender de modelos propietarios en la nube. La licencia Apache 2.0 permite su uso comercial sin restricciones relevantes.

Esta ficha se centra en el repositorio de cuantizaciones GGUF, que incluye desde versiones muy comprimidas (Q2_K, 2,0 GB) hasta la versión en precisión completa (f16, 8,6 GB), además de suplementos multimodales (mmproj) en Q8_0 y f16, lo que indica que el modelo base incorpora capacidades de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5, según etiquetas; detalles no disponibles) |
| Parametros totales | 4.237.797.892 (~4,24 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; suplementos multimodales mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base esta disponible en safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base, wesjos/DecisionFairy-4B, es un transformer denso de unos 4,24 mil millones de parametros derivado de la familia Qwen3.5, segun las etiquetas del repositorio. El entrenamiento se ha realizado con Unsloth, una libreria optimizada para fine-tuning que reduce el consumo de memoria y acelera el entrenamiento mediante tecnicas como la cuantizacion LoRA y kernels optimizados. Los detalles concretos sobre el numero de tokens de entrenamiento, la composicion exacta del dataset o el uso de tecnicas como RLHF o DPO no estan disponibles en la informacion proporcionada.

El modelo se ha ajustado sobre dos conjuntos de datos: LocalLLaMA/typed-decisions, presumiblemente un corpus de decisiones tipadas extraidas o curadas de la comunidad r/LocalLLaMA, y SargeDev/jev-distill-corpus-v3, un corpus de destilacion en formato "JEV" (cuya signficado exacto no esta documentado en la model card). La etiqueta "decision-model" indica que el objetivo del fine-tuning es mejorar el rendimiento del modelo en tareas de evaluacion y razonamiento sobre decisiones, un caso de uso nicho pero util para sistemas de recomendacion o analisis automatizado de opciones. La presencia de archivos mmproj (multimodal projectors) en las cuantizaciones indica que el modelo base conserva capacidades de procesamiento visual heredadas de la arquitectura Qwen3.5.

## Capacidades

- Generacion de texto conversacional (etiqueta "conversational" en el repositorio).
- Razonamiento y analisis sobre decisiones: el modelo esta especializado en evaluar opciones y producir juicios tipados, segun su entrenamiento sobre typed-decisions y el corpus JEV.
- Capacidades multimodales: la existencia de archivos mmproj-Q8_0 y mmproj-f16 indica soporte para procesamiento de imagenes cuando se usan junto con el GGUF principal en llama.cpp.
- Ejecucion local eficiente: al estar en formato GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros runtimes que consumen este formato.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y multi-step reasoning: no disponible (no documentado).
- Capacidades multilingues: no disponibles; el modelo esta etiquetado solo para ingles.

## Casos de uso

- Evaluacion automatizada de decisiones tecnicas: dada una pregunta de la comunidad (por ejemplo, "que GPU compro para inferencia local"), el modelo puede clasificar y valorar las opciones segun el patron aprendido del corpus typed-decisions, util como asistente de recomendacion en foros o chats internos.
- Filtrado y priorizacion de discusiones: integracion en un pipeline que analice hilos de foros (tipo Reddit o Discourse) y etiquete automaticamente las decisiones tomadas por la comunidad, ahorrando trabajo de moderacion o curacion manual.
- Asistente de decision en aplicaciones de consumo: embedding en apps moviles o de escritorio via Ollama o llama.cpp, donde un modelo de 4B cuantizado en Q4_K_M (~2,8 GB) funciona en portatiles sin GPU dedicada.
- Analisis de decisiones con entrada visual: usando los archivos mmproj, se pueden enviar capturas de pantalla o imagenes (por ejemplo, tablas comparativas de productos) junto a una pregunta para obtener una recomendacion razonada.
- Prototipado rapido de sistemas de recomendacion conversacional: su licencia Apache 2.0 y su tamano reducido lo hacen adecuado para integrarse en productos comerciales sin coste de licencias ni dependencia de APIs externas.
- Investigacion sobre modelos especializados en decision-making: al ser un modelo nicho entrenado con destilacion (JEV), es util como punto de partida para estudiar como el fine-tuning especializado afecta al comportamiento de un modelo base pequeno.
- Generacion de resumenes de decisiones en flujos de trabajo: en equipos de ingenieria, puede resumir y estructurar decisiones tecnicas (architecture decision records) a partir de conversaciones largas, ejecutandose on-premise para mantener la confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia (según cuantizacion, sin contar el contexto ni el mmproj):
  - Q2_K: ~2,0 GB
  - Q3_K_M: ~2,4 GB
  - IQ4_XS: ~2,6 GB
  - Q4_K_M: ~2,8 GB
  - Q5_K_M: ~3,2 GB
  - Q6_K: ~3,6 GB
  - Q8_0: ~4,6 GB
  - f16: ~8,6 GB
  - Suplemento multimodal mmproj: +0,5 GB (Q8_0) o +0,8 GB (f16)
- GPU recomendadas: no requiere GPU obligatoriamente; con una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o superiores cabe cualquier cuantizacion con holgura, incluida f16. En CPU pura funciona bien con 8-16 GB de RAM dada su reducida huella.
- Consumer GPUs: cabe comodamente en practicamente cualquier GPU moderna de 4 GB o mas (Q2_K a Q4_K_M); incluso portatiles con GPU integrada y 8 GB de RAM compartida pueden ejecutar las cuantizaciones mas ligeras.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, y cualquier runtime compatible con GGUF. No esta orientado a vLLM o TGI en este repositorio (esos consumen pesos safetensors del modelo base).
- Latencia y throughput: no disponibles; al ser un modelo de ~4B con cuantizaciones de 4 bits, se espera una ejecucion fluida en CPU moderna y muy rapida en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DecisionFairy-4B (este) | 4,24 B | GGUF (Q2_K a f16) | Decision-making (JEV, typed-decisions) | Apache 2.0 | Publica en Hugging Face |
| Qwen3.5 4B (base generica) | ~4 B | Safetensors, GGUF comunitario | Uso general | Apache 2.0 (segun familia Qwen) | Publica |
| Otros fine-tunes de 4B sobre Qwen3.5 | ~4 B | Safetensors, GGUF comunitario | Variables (codigo, chat, roles) | Variables | Publica |

Nota: la comparativa es orientativa, ya que no hay datos de rendimiento publicados para DecisionFairy-4B y su especializacion en decisiones lo diferencia de los modelos genericos de tamano similar. La ventaja diferencial frente a un Qwen3.5 4B estandar seria su rendimiento en tareas de evaluacion de decisiones, aunque no hay benchmarks que lo cuantifiquen.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado unicamente para ingles; su rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- Especializacion nicho: al estar afinado sobre corpus muy especificos (typed-decisions, JEV), puede degradar sus capacidades generales de chat, codigo o razonamiento amplio respecto al modelo base Qwen3.5.
- Riesgo de alucinacion: no evaluado publicamente; como cualquier modelo de lenguaje, puede generar respuestas incorrectas con apariencia confiable, especialmente fuera de su dominio de entrenamiento.
- Sin benchmarks publicos: no hay forma de verificar objetivamente su calidad frente a alternativas antes de probarlo.
- Cuantizaciones bajas (Q2_K, Q3_K_S/M): pueden degradar notablemente la calidad, especialmente en un modelo de solo 4B; se recomienda Q4_K_M o superior para uso serio.
- Capacidades multimodales dependientes de mmproj: la funcionalidad de vision requiere cargar el archivo mmproj correspondiente junto al GGUF principal; sin el, el modelo es solo de texto.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion sin restricciones significativas; no se identifican caveats legales relevantes.
- Documentacion escasa: la model card del modelo base no detalla arquitectura exacta, longitud de contexto ni metodo de entrenamiento, lo que dificulta evaluar su idoneidad para produccion sin pruebas propias.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/DecisionFairy-4B-GGUF
- Modelo base: https://huggingface.co/wesjos/DecisionFairy-4B
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#DecisionFairy-4B-GGUF
- Dataset LocalLLaMA/typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Dataset SargeDev/jev-distill-corpus-v3: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- FAQ de mradermacher sobre peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referenciada en la model card): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa de mradermacher (nethype GmbH): https://www.nethype.de/
- Paper, blog o demo: no disponibles
