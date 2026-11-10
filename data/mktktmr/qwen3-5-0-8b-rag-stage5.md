# mktktmr/qwen3.5-0.8b-rag-stage5

## Resumen

mktktmr/qwen3.5-0.8b-rag-stage5 es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario mktktmr. Se trata de la quinta etapa de un proceso de entrenamiento orientado a tareas de generacion aumentada por recuperacion (RAG) sobre documentacion en japones, segun se desprende del titulo de la model card ("auto-wiki-qa", etapa 5). El modelo se ha obtenido mediante LoRA y posterior fusion (merge) de los pesos en el modelo original, por lo que la arquitectura subyacente es la del Qwen3.5-0.8B.

El modelo cuenta con 852.985.920 parametros totales (aproximadamente 0,85 mil millones), lo que lo situa en la categoria de modelos ultraligeros, aptos para inferencia en hardware de consumo. El repositorio ocupa 1,7 GB y los pesos se distribuyen en formato safetensors. La informacion publica disponible es muy limitada: no se especifican licencia, idiomas soportados, pipeline ni resultados de evaluacion.

Su relevancia radica en el nicho: es un modelo especializado en responder preguntas sobre fragmentos de Wikipedia en japones, entrenado con conjuntos de datos academicos japoneses (JEMHopQA, NIILC QA y auto-wiki-qa). Resulta de interes para quienes necesiten un componente de generacion pequeno y especializado dentro de un pipeline RAG en japones, aunque su adopcion esta limitada por la ausencia de documentacion tecnica detallada y de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la de Qwen/Qwen3.5-0.8B); detalles no disponibles |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cabe esperar cuantizacion a GGUF/AWQ mediante herramientas externas, no documentada por el autor) |
| Idiomas soportados | no disponible (los datos de entrenamiento son en japones) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,85 mil millones de parametros. Sobre esa base, el autor aplico un ajuste fino con LoRA y posteriormente fusiono los adaptadores en los pesos del modelo original, de modo que el resultado es un unico conjunto de pesos denso, sin adaptadores separados. No se detalla la configuracion del LoRA (rango, alpha, capas objetivo) ni los hiperparametros de entrenamiento.

Los datos de entrenamiento citados en la model card son tres conjuntos japoneses de pregunta-respuesta y un corpus de fragmentos derivado de Wikipedia en japones: JEMHopQA (preguntas multi-salto), NIILC QA (preguntas de referencia) y cl-nagoya/auto-wiki-qa (preguntas generadas automaticamente a partir de Wikipedia). Todos ellos se distribuyen bajo licencia CC BY-SA 4.0 y el autor indica que fueron filtrados y reformateados. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset final, ni si se aplicaron tecnicas de RLHF o DPO. El nombre "stage5" sugiere un entrenamiento por etapas, pero no se documentan las etapas previas.

## Capacidades

- Generacion de texto y respuesta a preguntas extractivas y multi-salto sobre documentacion en japones, en el marco de un pipeline RAG.
- Comprension de contexto recuperado: el modelo esta entrenado para condicionar la respuesta al fragmento de Wikipedia proporcionado.
- Capacidad multilingue: no documentada; el entrenamiento se ha realizado exclusivamente con datos en japones, por lo que el rendimiento en otros idiomas es incierto.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo base podria tener capacidades genericas, pero el ajuste fino no las declara.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Respuesta a preguntas sobre Wikipedia en japones: el modelo puede recibir un fragmento recuperado y una pregunta, y generar una respuesta concisa basada en el fragmento, que es exactamente la tarea para la que fue ajustado.
- Componente generador en pipelines RAG japoneses: dado su tamano reducido, puede desplegarse como paso de generacion tras un recuperador (por ejemplo, un modelo de embeddings) en sistemas de busqueda documental interna en japones.
- Preguntas multi-salto sobre documentacion: gracias al entrenamiento con JEMHopQA, esta preparado para preguntas que requieren combinar informacion de varios pasajes.
- Prototipado rapido y experimentation: al caber en GPU de consumo, permite iterar sobre disenos de prompts y pipelines RAG sin coste de infraestructura elevado.
- Educacion y demostraciones: util para mostrar el funcionamiento de un sistema RAG completo en japones en entornos con recursos limitados.
- Filtrado y verificacion de respuestas: puede emplearse como generador de respuestas candidatas que luego se validan contra las fuentes recuperadas, reduciendo el coste frente a modelos de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 1,7 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits, en torno a 0,9-1 GB; en 4 bits, alrededor de 0,5 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM deberia poder ejecutar el modelo en FP16; para cuantizacion de 4 bits basta con 2 GB.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso iGPU con memoria unificada suficiente.
- Opciones de despliegue: transformers (carga directa desde safetensors), vLLM y TGI (previa conversion o carga del modelo), llama.cpp/Ollama (requiere conversion a GGUF, no proporcionada por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mktktmr/qwen3.5-0.8b-rag-stage5 | 852.985.920 | no disponible | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Apache-2.0 (segun la model card) | Hugging Face |
| Otros ajustes RAG japoneses de ~1 B | no disponible | no disponible | variable | no disponible |

La comparacion con alternativas de la misma categoria no puede completarse con la informacion disponible; el unico punto de referencia solido es el modelo base, del que hereda arquitectura y parametros, pero del que se diferencia por el ajuste fino en japones y por la licencia (el ajuste no declara licencia propia, mientras que el base es Apache-2.0 segun la model card).

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifica la licencia del ajuste, lo que impide confirmar si el uso comercial esta permitido; el modelo base figura como Apache-2.0 en la model card, pero el autor no aclara la licencia de los pesos derivados.
- Sesgos conocidos: no documentados; al entrenarse con Wikipedia en japones, puede heredar sesgos de cobertura y de perspectiva de esa fuente.
- Riesgo de alucinacion: presente, como en cualquier modelo generativo; el ajuste RAG no garantiza que la respuesta se limite al contexto recuperado.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada y el entrenamiento es exclusivamente en japones, por lo que el rendimiento en castellano u otros idiomas no esta validado.
- Datos de entrenamiento con licencia CC BY-SA 4.0: los conjuntos utilizados imponen obligaciones de atribucion y compartir-igual, lo que puede afectar a la redistribucion del modelo derivado.
- Sin benchmarks ni evaluacion publicada: no hay evidencia cuantitativa de calidad frente al modelo base.
- Repositorio con 0 descargas y 0 likes: no hay senales de validacion por parte de la comunidad.
- Documentacion minima: la model card no detalla hiperparametros, contexto ni proceso de entrenamiento, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mktktmr/qwen3.5-0.8b-rag-stage5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset NIILC QA: https://github.com/mynlp/niilc-qa
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
