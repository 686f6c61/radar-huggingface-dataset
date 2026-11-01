# nishantwhat/robustrag-longformer-qca

## Resumen

RobustRAG Longformer-1024 Smart QCA es un modelo de clasificacion basado en Longformer, desarrollado por el usuario nishantwhat, disenado especificamente para la deteccion de alucinaciones en sistemas de generacion aumentada por recuperacion (RAG). El modelo toma como entrada la terna pregunta, contexto recuperado y respuesta generada, y produce una puntuacion orientada a determinar si la respuesta contiene informacion no sustentada por el contexto. Con 148.660.994 parametros, se situa en la franja de los encoders de escala base-grande, lo que lo hace viable en hardware modesto.

La propuesta resulta relevante porque aborda uno de los problemas practicos mas acuciantes del despliegue de RAG en produccion: verificar automaticamente si la respuesta del generador se apoya en las evidencias recuperadas. El autor reporta un ROC-AUC de 0,8144 y un PR-AUC de 0,7420 sobre el conjunto de test de RAGTruth, lo que indica un rendimiento razonable para una tarea desbalanceada de deteccion. El modelo incorpora ademas un componente denominado SentenceSelector, descrito como extractivo y consciente de contradicciones, que selecciona las frases del contexto mas relevantes para la verificacion.

El modelo se distribuye en formato safetensors con un repositorio de 0,6 GB y licencia MIT, lo que facilita su uso comercial. No obstante, la informacion publica disponible es muy limitada: no se detallan los datos de entrenamiento, los idiomas soportados ni el pipeline de inferencia, por lo que muchas especificaciones deben considerarse no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Longformer (transformer con atencion de ventana deslizante), con componente SentenceSelector extractivo |
| Parametros totales | 148.660.994 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (segun el nombre del modelo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Longformer, una variante de transformer que sustituye la atencion completa por una combinacion de atencion de ventana deslizante local y atencion global sobre tokens seleccionados, lo que permite procesar secuencias de hasta 1024 tokens con un coste computacional lineal respecto a la longitud. Sobre esta base, el autor anade un componente denominado Smart QCA (Question + Context + Answer) y un SentenceSelector extractivo que, segun la model card, es consciente de contradicciones: selecciona frases del contexto para contrastarlas con la respuesta generada.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste fino supervisado, RLHF o DPO. El unico dato de evaluacion publicado es el rendimiento sobre el conjunto de test de RAGTruth (ROC-AUC 0,8144 y PR-AUC 0,7420), lo que sugiere que el entrenamiento se realizo o evaluo, al menos parcialmente, sobre dicho benchmark de deteccion de alucinaciones en RAG.

## Capacidades

- Deteccion de alucinaciones en respuestas generadas por sistemas RAG, a partir de la terna pregunta, contexto y respuesta.
- Clasificacion binaria o puntuacion de veracidad de la respuesta respecto al contexto recuperado.
- Seleccion extractiva de frases del contexto relevantes para la verificacion (componente SentenceSelector).
- Manejo de contextos de hasta 1024 tokens gracias a la atencion eficiente de Longformer.
- Deteccion de contradicciones entre la respuesta y el contexto.
- No se ha documentado soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Verificacion automatica en pipelines RAG: integrar el modelo como etapa de post-procesado que puntua cada respuesta generada antes de mostrarla al usuario, descartando o marcando aquellas con alta probabilidad de alucinacion.
- Moderacion de asistentes documentales: en sistemas de preguntas y respuestas sobre corpus internos, usar el modelo para auditar respuestas y reducir el riesgo de afirmaciones no sustentadas por las fuentes.
- Monitorizacion de calidad en produccion: registrar las puntuaciones del modelo sobre trafico real para detectar degradaciones del retriever o del generador y disparar alertas.
- Evaluacion de sistemas RAG en desarrollo: emplear el modelo como metrica automatica complementaria a la evaluacion humana al comparar configuraciones de recuperacion o de generacion.
- Filtrado previo en atencion al cliente automatizada: marcar respuestas generadas que contradicen la base de conocimiento antes de enviarlas, reduciendo escalados erroneos.
- Investigacion en deteccion de alucinaciones: servir como linea base reproducible sobre RAGTruth para comparar nuevas tecnicas de verificacion, dado que el modelo y la licencia MIT estan disponibles publicamente.
- Auditoria de resumenes extractivos: comprobar que las frases seleccionadas por el SentenceSelector se corresponden con el contexto original y no introducen contenido inventado.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| RAGTruth (test) | ROC-AUC | 0,8144 |
| RAGTruth (test) | PR-AUC | 0,7420 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos sobre MMLU, HumanEval, GSM8K ni otros benchmarks estandar, dado que se trata de un modelo especializado en clasificacion y no en generacion general.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 0,6 GB de pesos, mas overhead de activaciones para secuencias de 1024 tokens; en la practica, menos de 2 GB en la mayoria de configuraciones.
- VRAM estimada en fp16/bf16: en torno a 0,3 GB para los pesos, mas activaciones; cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, incluidas RTX 3060, RTX 4060, RTX 4090, A100 o H100; el modelo es sobradamente pequeno para todas ellas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: al ser un modelo basado en Longformer con pesos safetensors, es compatible con la libreria transformers de HuggingFace, asi como con servidores de inferencia como TGI o vLLM (siempre que la arquitectura Longformer este soportada por la version correspondiente). No se ha confirmado soporte en llama.cpp ni Ollama, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera una latencia baja en GPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RobustRAG Longformer-1024 Smart QCA | 148,7 M | 1024 | Deteccion de alucinaciones en RAG | MIT | HuggingFace |
| Longformer base (AllenAI) | ~149 M | 4096 | Encoder generalista de contexto largo | Apache 2.0 | HuggingFace |
| DeBERTa-v3-base (Microsoft) | ~86 M (backbone) | 512 | Encoder generalista, clasificacion | MIT | HuggingFace |

La comparativa se limita a arquitecturas encoder de escala similar, ya que no se dispone de informacion sobre otros modelos especializados en deteccion de alucinaciones RAG con los que contrastar directamente. El modelo de AllenAI ofrece mayor contexto (4096) pero no esta especializado en la tarea; DeBERTa-v3-base es mas ligero pero con contexto mucho menor.

## Limitaciones y advertencias

- La informacion publica es muy escasa: no se documentan datos de entrenamiento, idiomas, pipeline ni proceso de evaluacion, lo que dificulta reproducir o auditar los resultados.
- El ROC-AUC y PR-AUC reportados (0,8144 y 0,7420) proceden unicamente de la model card del autor y no han sido verificados de forma independiente.
- Al ser un modelo de clasificacion especializado, no debe emplearse para generacion de texto ni como sustituto de un LLM.
- Riesgo de sesgo y de alucinacion del propio clasificador: puede marcar como veraces respuestas incorrectas o viceversa, especialmente en dominios alejados de los datos de entrenamiento (no documentados).
- Limitacion de contexto a 1024 tokens: contextos recuperados mas largos deberan truncarse o dividirse, lo que puede degradar la deteccion.
- Idiomas soportados no disponibles; no se recomienda asumir cobertura multilingue.
- Licencia MIT: permite uso comercial y modificacion, pero no se ofrece ninguna garantia por parte del autor.
- El repositorio tiene muy pocas descargas (22) y ningun like, lo que sugiere escasa validacion por parte de la comunidad; conviene tratarlo como experimental.
- No se ha confirmado compatibilidad con frameworks de despliegue como vLLM, TGI o llama.cpp para esta arquitectura concreta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nishantwhat/robustrag-longformer-qca
- Paper de Longformer (referencia de arquitectura): https://arxiv.org/abs/2004.05150
- Benchmark RAGTruth (referencia de evaluacion): https://arxiv.org/abs/2301.13808
