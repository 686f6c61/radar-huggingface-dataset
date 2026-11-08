# mradermacher/Qwen3.5-2B-Medical-Reasoning-GGUF

## Resumen

Qwen3.5-2B-Medical-Reasoning-GGUF es una cuantizacion estatica en formato GGUF del modelo xtools-at/Qwen3.5-2B-Medical-Reasoning, un ajuste fino (LoRA) sobre la base Qwen3.5-2B orientado a razonamiento medico y respuesta a preguntas clinicas. El trabajo de cuantizacion lo realiza mradermacher, un autor habitual en la comunidad de GGUF, y publica el modelo bajo licencia Apache 2.0. El modelo base cuenta con 1.942.653.248 parametros (aproximadamente 1,94 mil millones) segun los pesos en safetensors.

El interes practico de esta publicacion es doble: por un lado, ofrece una version ligera y desplegable en hardware modesto de un modelo especializado en dominios sanitarios; por otro, al estar en formato GGUF, permite su ejecucion con llama.cpp, Ollama y otros runtimes compatibles sin necesidad de GPU de gran capacidad. El modelo esta entrenado sobre datasets de razonamiento medico (FreedomIntelligence/medical-o1-reasoning-SFT y su variante conversacional de xtools-at), lo que sugiere un enfasis en cadenas de razonamiento clinico y respuestas explicativas.

La ficha se centra en la version cuantizada, pero la mayoria de caracteristicas tecnicas (arquitectura, contexto, idiomas) heredan directamente del modelo base Qwen3.5-2B. Los datos disponibles en la model card son limitados: se documentan los tipos de cuantizacion y tamanos, pero no se detallan hiperparametros de entrenamiento, composicion exacta del dataset ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), ajuste fino LoRA sobre Qwen3.5-2B |
| Parametros totales | 1.942.653.248 (aprox. 1,94 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, ademas de mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

Detalles adicionales de los ficheros publicados:

| Fichero | Tipo | Tamano (GB) | Notas |
|---|---|---|---|
| Qwen3.5-2B-Medical-Reasoning.mmproj-Q8_0.gguf | mmproj-Q8_0 | 0,5 | suplemento multimodal |
| Qwen3.5-2B-Medical-Reasoning.mmproj-f16.gguf | mmproj-f16 | 0,8 | suplemento multimodal |
| Qwen3.5-2B-Medical-Reasoning.Q2_K.gguf | Q2_K | 1,1 | |
| Qwen3.5-2B-Medical-Reasoning.Q3_K_S.gguf | Q3_K_S | 1,1 | |
| Qwen3.5-2B-Medical-Reasoning.Q3_K_M.gguf | Q3_K_M | 1,2 | calidad inferior |
| Qwen3.5-2B-Medical-Reasoning.Q3_K_L.gguf | Q3_K_L | 1,3 | |
| Qwen3.5-2B-Medical-Reasoning.IQ4_XS.gguf | IQ4_XS | 1,3 | |
| Qwen3.5-2B-Medical-Reasoning.Q4_K_S.gguf | Q4_K_S | 1,3 | rapido, recomendado |
| Qwen3.5-2B-Medical-Reasoning.Q4_K_M.gguf | Q4_K_M | 1,4 | rapido, recomendado |
| Qwen3.5-2B-Medical-Reasoning.Q5_K_S.gguf | Q5_K_S | 1,5 | |
| Qwen3.5-2B-Medical-Reasoning.Q5_K_M.gguf | Q5_K_M | 1,6 | |
| Qwen3.5-2B-Medical-Reasoning.Q6_K.gguf | Q6_K | 1,7 | muy buena calidad |
| Qwen3.5-2B-Medical-Reasoning.Q8_0.gguf | Q8_0 | 2,2 | rapido, mejor calidad |
| Qwen3.5-2B-Medical-Reasoning.f16.gguf | f16 | 4,0 | 16 bpw, excesivo |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a la familia Qwen3.5, un transformer decoder-only de aproximadamente 1,94 mil millones de parametros. Sobre esta base se aplica un ajuste fino mediante LoRA (el tag `lora` aparece explicitamente en la model card del modelo base) para especializarlo en razonamiento medico. El resultado se publica como modelo fusionado (xtools-at/Qwen3.5-2B-Medical-Reasoning) y posteriormente mradermacher lo convierte a GGUF y genera las cuantizaciones estaticas listadas.

Los datasets empleados en el ajuste son FreedomIntelligence/medical-o1-reasoning-SFT y xtools-at/medical-o1-reasoning-SFT-chat. El primero es un conjunto de ajuste supervisado orientado a razonamiento medico estilo o1 (cadenas de pensamiento clinico); el segundo es una variante conversacional del mismo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, la presencia de RLHF o DPO, ni sobre innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.). La model card del repositorio cuantizado no incluye estos detalles y se limita a documentar el proceso de cuantizacion.

Un detalle relevante es la presencia de ficheros `mmproj` (multi-modal supplement), lo que indica que el modelo base podria tener capacidades multimodales (vision) heredadas de Qwen3.5-2B, aunque no se especifica en la informacion disponible el alcance exacto de dicha capacidad ni si el ajuste medico la preserva.

## Capacidades

- Generacion de texto y respuesta a preguntas (pipeline declarado: question-answering).
- Razonamiento medico: el ajuste sobre datasets medical-o1 sugiere enfasis en cadenas de razonamiento clinico y respuestas explicativas.
- Generacion conversacional multi-turno (el dataset de chat sugiere entrenamiento para dialogo).
- Soporte multimodal potencial: la presencia de ficheros mmproj indica capacidad de procesar imagenes, aunque no se detalla su alcance.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente; el enfasis en razonamiento medico sugiere cadenas de pensamiento, pero no se documenta soporte de agentes.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de triaje clinico en ingles: el modelo puede gestionar preguntas iniciales de sintomas y orientar al paciente, aprovechando su ajuste sobre datos de razonamiento medico para estructurar la respuesta. Adecuado por su tamano reducido, que permite despliegue en entornos con recursos limitados.
- Apoyo a la documentacion clinica: generacion de resumenes explicativos de casos o notas a partir de descripciones textuales, con cadenas de razonamiento que justifican las conclusiones.
- Educacion medica: simulacion de preguntas y respuestas razonadas para estudiantes, con explicaciones paso a paso propias del estilo o1.
- Prototipado rapido en investigación: al ser un GGUF de ~1,3-1,4 GB en Q4, permite experimentar en portatiles o equipos sin GPU dedicada mediante llama.cpp u Ollama.
- Clasificacion y extraccion de informacion en textos medicos: respuesta a preguntas sobre historiales o articulos en ingles, con la ventaja de ejecucion local y licencia Apache 2.0 para integracion en productos.
- Evaluacion comparativa de tecnicas de cuantizacion: al ofrecer 12 niveles de cuantizacion, sirve como banco de pruebas para medir la degradacion de calidad en tareas de razonamiento medico segun el bitrate.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente en formato GGUF, permite procesar datos sanitarios sin enviarlos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2,5 GB para cuantizaciones Q4-Q5 (tamanos de fichero de 1,3-1,6 GB mas overhead de contexto y KV cache); 2,5-3,5 GB para Q8_0; 4,5-5,5 GB para f16.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.) es suficiente para Q4-Q5. Para f16 se recomienda 6-8 GB (RTX 3060, RTX 4060 Ti). No requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio, text-generation-webui). El pipeline declarado es transformers, pero al ser GGUF el uso principal es mediante llama.cpp.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano (~1,9 B parametros), se espera inferencia en tiempo real en GPU consumer y velocidad aceptable en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-Medical-Reasoning-GGUF (este) | 1,94 B | no disponible | Apache 2.0 | GGUF | Ajuste medico con LoRA, solo ingles |
| Qwen3.5-2B (base) | ~2 B | no disponible | Apache 2.0 (presumible) | safetensors/GGUF | Modelo generalista sin ajuste medico |
| mradermacher/Qwen3.5-2B-GGUF | ~2 B | no disponible | Apache 2.0 (presumible) | GGUF | Cuantizacion del base generalista, sin especializacion medica |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes. La comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles: el campo `language: en` indica que el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Riesgo de alucinacion elevado en dominio medico: un modelo de ~2 B parametros ajustado con SFT sobre datos de razonamiento clinico puede generar afirmaciones plausibles pero incorrectas. No debe usarse como sustituto de juicio clinico profesional.
- Cuantizaciones agresivas (Q2_K, Q3_K_S) degradan la calidad del razonamiento; para tareas medicas se recomienda Q5_K_M o superior.
- No se documentan sesgos especificos, pero al derivar de un modelo generalista entrenado predominantemente en ingles, hereda los sesgos de dicho corpus.
- No hay informacion sobre el contexto maximo soportado, lo que impide planificar casos de uso con documentos largos.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal y regulatoria del uso en ambito sanitario recae en el integrador; no hay certificacion ni validacion clinica.
- El modelo base es un ajuste LoRA reciente (publicado en 2026) con cero descargas y cero likes en el momento de la ficha, lo que implica ausencia de validacion por parte de la comunidad.
- No se confirma soporte de tool calling ni de agentes, lo que limita su integracion en pipelines automatizados complejos.

## Enlaces

- Repositorio Hugging Face (cuantizado): https://huggingface.co/mradermacher/Qwen3.5-2B-Medical-Reasoning-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwen3.5-2B-Medical-Reasoning
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-2B-Medical-Reasoning-GGUF
- Dataset FreedomIntelligence/medical-o1-reasoning-SFT: https://huggingface.co/datasets/FreedomIntelligence/medical-o1-reasoning-SFT
- Dataset xtools-at/medical-o1-reasoning-SFT-chat: https://huggingface.co/datasets/xtools-at/medical-o1-reasoning-SFT-chat
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Perfil del autor: https://huggingface.co/mradermacher/models
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Cuantizacion del modelo base generalista: https://huggingface.co/mradermacher/Qwen3.5-2B-GGUF
