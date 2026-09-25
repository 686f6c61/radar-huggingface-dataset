# shalev396/flan-t5-dialogue-summarizer

## Resumen

shalev396/flan-t5-dialogue-summarizer es un adaptador LoRA sobre google/flan-t5-base, un modelo T5 encoder-decoder con ajuste por instrucciones y 247.577.856 parametros. El adaptador anade 1.769.472 parametros entrenables (0,71 % del total) sobre las proyecciones de atencion query y value de cada capa del encoder y del decoder, manteniendo congelados los pesos base. Su objetivo es generar resumenes breves en tercera persona de conversaciones cotidianas, y ademas responde preguntas sobre una base de conocimiento ficticia de una tienda de electronica mediante recuperacion aumentada (RAG).

El proyecto se enmarca en el repositorio "ml-lab" del autor y combina dos tareas: sumarizacion de dialogos (entrenada sobre el dataset DialogSum) y un pequeno pipeline RAG que usa sentence-transformers/all-MiniLM-L6-v2 como retriever sobre 41 documentos. El adaptador se fusiona con el modelo base mediante `merge_and_unload` en el momento de la carga, por lo que el coste de inferencia equivale al del propio flan-t5-base.

Es relevante como ejemplo didactico de fine-tuning eficiente con PEFT/LoRA sobre un T5 pequeno para una tarea concreta de dialogo, pero conviene advertir que el propio autor indica en la model card que el entrenamiento completo no ha finalizado y que el repositorio todavia no contiene el adaptador ni resultados de evaluacion ("Weights pending"). El modelo tiene 0 descargas y 0 "likes" en el momento de la consulta, y la seccion de metricas esta vacia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 encoder-decoder con ajuste por instrucciones (google/flan-t5-base) + adaptador LoRA (r=16, alpha=32, dropout 0,05) sobre q y v de cada capa |
| Parametros totales | 247.577.856 (modelo base, float32) + 1.769.472 del adaptador (0,71 % del base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | entrada truncada a 512 tokens; salida limitada a 96 tokens nuevos |
| Tipos de cuantizacion | no especificados en la model card; el adaptador se distribuye en safetensors y el base en float32 |
| Idiomas soportados | ingles segun la model card (dialogo escrito de dos hablantes); metadatos de HuggingFace no especifican idiomas |
| Licencia | MIT |
| Formato de pesos | adaptador PEFT en safetensors (`adapter_model.safetensors`, ~7 MB) + `adapter_config.json`; el modelo base se descarga aparte desde el Hub |

## Arquitectura y entrenamiento

La arquitectura es la de flan-t5-base, un transformer encoder-decoder con ajuste por instrucciones. Sobre el se aplica un adaptador LoRA de rango 16, alpha 32 y dropout 0,05 en las proyecciones de atencion query y value de todas las capas del encoder y del decoder. Los pesos base permanecen congelados y solo se entrenan 1.769.472 parametros. En la carga, el adaptador se fusiona en el modelo base en CPU y el modelo fusionado se mueve al dispositivo, de modo que la inferencia tiene exactamente el mismo coste que el base. Se usa una unica plantilla de prompt en entrenamiento, evaluacion y servicio: `Summarize the following conversation.\n\n{dialogue}\n\nSummary: `, con decodificacion greedy y un maximo de 96 tokens nuevos.

El entrenamiento parte del dataset DialogSum (13.460 dialogos con resumenes humanos). Se emplea un subconjunto con semilla de 3.000 dialogos de entrenamiento y 200 de validacion, con AdamW (lr 1e-3, weight decay 0,01, decaimiento lineal a 0), tamano de lote 8, 3 epocas (1.125 pasos), recorte de gradiente a 1,0 y padding dinamico por lote. Se entrena en float32 o con autocast bf16 en GPUs compatibles; nunca se usa fp16 porque T5 presenta desbordamiento en ese formato. Se comparan variantes zero-shot, one-shot y few-shot (k=2) del modelo base frente al ajuste LoRA, todas evaluadas sobre los mismos dialogos de test con decodificacion greedy. La parte RAG usa all-MiniLM-L6-v2 para vectorizar la pregunta y 41 documentos en CPU, y alimenta los 3 documentos mas similares por similitud coseno al prompt `Answer the question using only the context below. ...`.

## Capacidades

- Resumen de dialogos cotidianos en ingles, en tercera persona y formato breve, con salidas de hasta 96 tokens.
- Respuesta a preguntas con recuperacion aumentada (RAG) sobre una base de conocimiento de 41 documentos, devolviendo respuesta y fuentes con puntuacion.
- Dos interfaces en el paquete: `predict(dialogue) -> str` para resumen y `rag(question) -> {"answer", "sources"}` para preguntas.
- Uso directo con PEFT (`PeftModel.from_pretrained`) o mediante el wrapper `model.load` del propio repositorio.
- Despliegue como Space de HuggingFace con endpoints `/predict` y `/rag`, y como Inference Endpoint con `handler.py`.
- No documenta tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue: no soportada segun la model card (limitado a ingles).

## Casos de uso

- Resumen de conversaciones de atencion al cliente: el modelo condensa dialogos de dos hablantes en un resumen breve, util para generar notas de ticket a partir de transcripciones de chat.
- Preprocesado de historiales de chat: dado que la entrada se trunca a 512 tokens, encaja en turnos o fragmentos de conversacion cortos para producir resumenes encadenados.
- Asistencia en bases de conocimiento internas: el pipeline RAG responde preguntas a partir de un conjunto de documentos y devuelve las fuentes utilizadas, lo que facilita la verificacion.
- Prototipado educativo de PEFT/LoRA: sirve como ejemplo reproducible de fine-tuning eficiente sobre T5, con notebook de Colab y codigo de entrenamiento publicados.
- Comparativa de estrategias de prompting: el repositorio incluye variantes zero-shot, one-shot y few-shot frente al ajuste LoRA, util para estudiar el impacto del fine-tuning frente al prompting.
- Demostraciones interactivas en Gradio: el Space con ZeroGPU permite exponer los endpoints `/predict` y `/rag` como interfaz publica ligera.
- Integracion en servicios de resumen a pequena escala: al coste de inferencia de un modelo de ~250M parametros, puede desplegarse en CPU o en GPUs de gama de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de metricas y de resultados vacias (`metrics:start` / `metrics:end` y `results:start` / `results:end`) y senala explicitamente que el entrenamiento completo no ha finalizado, por lo que el repositorio no contiene el adaptador ni resultados. La metrica prevista en los tags y en la configuracion es ROUGE, pero no se aportan valores.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene ~247,6M parametros; en float32 ocupa ~990 MB solo en pesos y en bf16 ~495 MB. Con activaciones y lote pequeno, la inferencia cabe holgadamente en 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB, incluidas GTX 1650, RTX 3060, RTX 4090 y superiores; tambien A100/H100 sin necesidad de reparto. El adaptador fusionado no anade coste respecto al base.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de consumo; tambien es viable la inferencia en CPU (el autor documenta `device="cpu"`).
- Opciones de despliegue documentadas: PyTorch + PEFT, HuggingFace Space con ZeroGPU e Inference Endpoint mediante `handler.py`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shalev396/flan-t5-dialogue-summarizer | 247,6M base + 1,77M adaptador LoRA | 512 tokens de entrada / 96 de salida | Resumen de dialogos + RAG | MIT | Repositorio publicado, pero pesos del adaptador pendientes de entrenamiento |
| google/flan-t5-base | 247,6M | 512 tokens (uso comun del modelo) | Generacion condicionada e instrucciones | Apache 2.0 (modelo base, a verificar) | Disponible en HuggingFace; sirve de linea base zero/few-shot |
| google/flan-t5-large | ~780M | 512 tokens (uso comun del modelo) | Generacion condicionada e instrucciones | Apache 2.0 (a verificar) | Disponible en HuggingFace; mayor coste de inferencia |

No se han encontrado en la busqueda web modelos comparables directamente por tarea de sumarizacion de dialogos en esta ficha; los resultados devueltos no guardan relacion con el modelo. La comparativa anterior se limita a las alternativas del mismo ecosistema T5 referenciadas en la propia model card.

## Limitaciones y advertencias

- Pesos pendientes: la model card indica que el entrenamiento completo no ha finalizado y que el repositorio no contiene el adaptador ni resultados, por lo que el modelo no es utilizable tal cual.
- Dominio restringido: solo dialogo escrito en ingles de dos hablantes (`#Person1#:` / `#Person2#:`); quedan fuera reuniones, transcripciones con multiples hablantes y otros idiomas.
- Riesgo de error en los resumenes: un modelo de ~250M parametros puede intercambiar quien dijo que, omitir hechos clave o inventar detalles; conviene verificar cualquier dato relevante contra la conversacion.
- Limitacion de la metrica: ROUGE mide solapamiento de palabras, no correccion factual, por lo que no garantiza fidelidad del resumen.
- Longitud limitada: entrada truncada a 512 tokens y salida de 96 tokens, insuficiente para documentos o conversaciones extensas sin troceado.
- RAG acotado: la base de conocimiento es un fichero de 41 documentos de una tienda ficticia; no es un sistema RAG general.
- Licencia MIT para el adaptador, con la salvedad de respetar los terminos del modelo base google/flan-t5-base.
- Sin senales de adopcion: 0 descargas y 0 "likes", y secciones de metricas vacias; escasa validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shalev396/flan-t5-dialogue-summarizer
- Space / API gratuita: https://huggingface.co/spaces/shalev396/flan-t5-dialogue-summarizer
- Repositorio GitHub (ml-lab): https://github.com/shalev396/ml-lab/tree/main/flan-t5-dialogue-summarizer
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/shalev396/ml-lab/blob/main/flan-t5-dialogue-summarizer/training/notebook.ipynb
- Modelo base: https://huggingface.co/google/flan-t5-base
- Dataset DialogSum: https://huggingface.co/datasets/knkarthick/dialogsum
- Retriever RAG: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2

Nota: los resultados de busqueda web recibidos no contienen informacion relacionada con este modelo (hacen referencia a videojuegos), por lo que no se han incorporado datos adicionales.
