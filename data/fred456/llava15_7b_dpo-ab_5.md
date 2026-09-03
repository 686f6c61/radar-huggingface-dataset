# Fred456/llava15_7b_DPO-ab_5

## Resumen

Fred456/llava15_7b_DPO-ab_5 es un adaptador PEFT (LoRA) publicado por el usuario Fred456, diseñado para ajustar el modelo base liuhaotian/llava-v1.5-7b mediante entrenamiento con Direct Preference Optimization (DPO). El modelo base es un modelo de visión-lenguaje (VLM) de 7.000 millones de parámetros, basado en LLaMA-2-7B, que combina un codificador visual CLIP con un decodificador de lenguaje para tareas de comprensión de imágenes y generación de texto. El adaptador, con un tamaño de repositorio de 0,8 GB, se presenta como un checkpoint intermedio (sufijo "ab_5") y no incluye documentación técnica adicional en su model card.

La relevancia de este modelo radica en su enfoque de alineación mediante DPO sobre un VLM establecido, lo que podría mejorar la adherencia a preferencias humanas en tareas de razonamiento visual. Sin embargo, la ausencia de datos de entrenamiento, métricas de evaluación y licencia limita su uso directo en producción sin una validación adicional. El adaptador está pensado para ser cargado sobre el modelo base mediante la librería PEFT, lo que permite un ajuste eficiente sin modificar los pesos completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaMA-2-7B (decoder transformer) con codificador visual CLIP (modelo base) + adaptador LoRA |
| Parametros totales | 7.000 millones (modelo base) + adaptador LoRA (tamano del repo: 0,8 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (modelo base LLaMA-2-7B) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion estandar) |
| Idiomas soportados | No disponible (el modelo base LLaMA-2 soporta principalmente ingles; no se especifican otros idiomas) |
| Licencia | No disponible (el modelo base usa licencia LLaMA-2, pero el adaptador no declara licencia) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base liuhaotian/llava-v1.5-7b emplea una arquitectura de transformer autoregresivo con 7.000 millones de parametros, complementada con un codificador visual CLIP (ViT-L/14) que proyecta caracteristicas de imagen al espacio de embeddings del texto. El adaptador LoRA anade matrices de bajo rango a las capas de atencion y feed-forward, permitiendo un ajuste eficiente con un numero reducido de parametros entrenables. El entrenamiento con DPO (Direct Preference Optimization) se aplica sobre el modelo base para alinear las respuestas con preferencias humanas, aunque no se han publicado detalles sobre el dataset de preferencias, el numero de pasos, la tasa de aprendizaje ni el regimen de entrenamiento (fp16, bf16, etc.). La model card no incluye informacion sobre el procedimiento de entrenamiento, los hiperparametros ni los datos utilizados.

## Capacidades

- Generacion de texto con entrada visual: el modelo base es capaz de describir imagenes, responder preguntas sobre su contenido y realizar razonamiento visual basico.
- Razonamiento multimodal: combina informacion visual y textual para tareas como respuesta a preguntas visuales (VQA) y captioning.
- Soporte de tool calling: no disponible (el modelo base no incluye funciones de llamada a herramientas).
- Soporte de agentes y multi-step reasoning: no disponible (el modelo base no esta disenado para razonamiento multi-paso agente).
- Capacidades multilingues: limitadas al ingles, segun el modelo base LLaMA-2.
- Capacidades especiales: el adaptador DPO podria mejorar la alineacion con preferencias humanas, pero no hay evidencia publica de ello.

## Casos de uso

- Descripcion automatica de imagenes en aplicaciones de accesibilidad: el modelo puede generar texto alternativo para imagenes en sitios web o documentos, aprovechando su capacidad de captioning visual.
- Asistencia en moderacion de contenido visual: analisis de imagenes para detectar contenido inapropiado o generar informes descriptivos, aunque requiere validacion adicional por la falta de benchmarks.
- Prototipado de chatbots con entrada visual: integracion en sistemas de atencion al cliente que reciben capturas de pantalla o fotos, respondiendo preguntas sobre el contenido.
- Investigacion en alineacion de modelos: el adaptador DPO puede servir como caso de estudio para comparar metodos de preferencia en VLM, aunque sin datos de evaluacion su utilidad es limitada.
- Generacion de descripciones para bases de datos de imagenes: etiquetado automatico de imagenes en entornos de gestion de activos digitales.
- Educacion y demostraciones: uso en entornos academicos para ensenar conceptos de vision por computador y ajuste fino con PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El adaptador no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. El modelo base LLaVA-v1.5-7B tiene resultados publicados en tareas como VQAv2, GQA y TextVQA, pero estos corresponden al modelo base sin el adaptador DPO y no pueden atribuirse a este checkpoint especifico.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 7B requiere aproximadamente 14 GB en fp16, o unos 6-8 GB con cuantizacion de 4 bits (por ejemplo, GPTQ o AWQ). El adaptador LoRA anade un overhead minimo (menos de 1 GB).
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para fp16 sin cuantizar; GPUs con 8-12 GB (RTX 3060, 4070) pueden ejecutar el modelo con cuantizacion.
- Compatibilidad con consumer GPU: si, con cuantizacion (4 bits) cabe en GPUs de gama media.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face Transformers con PEFT, TGI (Text Generation Inference).
- Latencia y throughput: no disponible; dependen del hardware y la cuantizacion. En una RTX 4090, un modelo 7B en fp16 suele generar entre 20-40 tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Fred456/llava15_7b_DPO-ab_5 (adaptador) | 7B + LoRA | 4096 | No disponible | HuggingFace (adapter) |
| liuhaotian/llava-v1.5-7b (base) | 7B | 4096 | LLaMA-2 | HuggingFace |
| bakllava (LLaVA-1.5-7B variante) | 7B | 4096 | LLaMA-2 | HuggingFace |
| LLaVA-NeXT-7B (LLaVA-1.6) | 7B | 4096 | LLaMA-2 | HuggingFace |

La comparacion se limita al modelo base, ya que el adaptador no tiene datos propios. LLaVA-NeXT-7B mejora el rendimiento en VQA y razonamiento visual respecto a LLaVA-1.5, pero no hay evidencia de que este adaptador DPO supere a ninguno de ellos.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base LLaMA-2 puede presentar sesgos de genero, raza y cultura; el adaptador no corrige estos sesgos y podria amplificarlos.
- Riesgo de alucinacion: los VLM pueden generar descripciones inexactas o inventar detalles de imagenes; sin evaluacion, el riesgo es alto.
- Limitaciones de contexto: ventana de 4096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Limitaciones de idioma: el modelo base esta entrenado principalmente en ingles; el rendimiento en otros idiomas es pobre o inexistente.
- Restricciones de licencia: la licencia del adaptador no esta declarada; el modelo base usa la licencia LLaMA-2, que restringe el uso comercial en ciertos casos (empresas con mas de 700 millones de usuarios mensuales). Se recomienda verificar la licencia antes de usar en produccion.
- Caveat de produccion: al ser un adaptador sin documentacion ni benchmarks, no se recomienda su uso en sistemas criticos sin una validacion exhaustiva.

## Enlaces

- HuggingFace: https://huggingface.co/Fred456/llava15_7b_DPO-ab_5
- Modelo base: https://huggingface.co/liuhaotian/llava-v1.5-7b
- Paper de LLaVA (referencia del modelo base): https://arxiv.org/abs/2304.08485
- Paper de DPO (referencia del metodo de entrenamiento): https://arxiv.org/abs/2305.18290
