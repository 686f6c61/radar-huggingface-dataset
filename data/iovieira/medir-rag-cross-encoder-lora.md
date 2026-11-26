# iovieira/medir-rag-cross-encoder-lora

## Resumen

medir-rag-cross-encoder-lora es un adaptador LoRA para un cross-encoder de re-ranking, desarrollado por el usuario iovieira en el marco del proyecto MedIR-RAG (Universidad de Évora, asignatura "Recuperação de Informação em Bases de Texto"). No es un modelo generativo, sino un componente de recuperacion de informacion: recibe un par pregunta/pasaje y devuelve una puntuacion de relevancia que se usa para reordenar los resultados de un sistema de busqueda hibrido.

El adaptador se entrena sobre el cross-encoder `cross-encoder/ms-marco-MiniLM-L-6-v2`, un transformer encoder de la familia MiniLM (12 capas, dimension oculta 384, aproximadamente 22,7 millones de parametros en el modelo base) especializado en ranking de pasajes. El LoRA se ajusta con pares pregunta/pasaje del corpus BioASQ, un conjunto de referencia en busqueda biomedica.

Su relevancia es acotada pero concreta: demuestra como un adaptador ligero puede especializar un cross-encoder generico en dominio biomedico sin reentrenar el modelo completo, con un coste de almacenamiento minimo y resultados de re-ranking medidos sobre 279 preguntas de test (NDCG@5 de 0,5437 y MRR@10 de 0,7467). El repositorio esta vacio en el momento de la consulta (0,0 GB, 0 descargas), por lo que el adaptador no esta publicado de forma efectiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM) con adaptador LoRA para clasificacion de secuencias (num_labels=1) |
| Parametros totales | no disponible (modelo base MiniLM-L-6-v2 de aproximadamente 22,7 M; el adaptador LoRA no declara su numero de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como dato oficial; el ejemplo de uso trunca a max_length=320 tokens (truncation="only_second") |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (el corpus BioASQ es mayoritariamente en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `cross-encoder/ms-marco-MiniLM-L-6-v2`, un cross-encoder basado en MiniLM que procesa conjuntamente pregunta y pasaje y produce una unica puntuacion de relevancia. El ajuste se realiza mediante LoRA (PEFT), de modo que solo se entrenan las matrices de baja dimension inyectadas, manteniendo congelados los pesos del modelo base. El tokenizador y el modelo base se cargan por separado y el adaptador se superpone con `PeftModel.from_pretrained`.

Los datos de entrenamiento son pares pregunta/pasaje de BioASQ, en el contexto del proyecto MedIR-RAG. La model card referencia el script `train_cross_encoder.py` como codigo de entrenamiento, pero no detalla el numero de tokens, la composicion exacta del dataset, la configuracion de hiperparametros (rango del LoRA, alpha, tasa de aprendizaje, epocas) ni si se aplicaron tecnicas de regularizacion o seleccion negativa. No se documenta ninguna innovacion tecnica adicional mas alla del uso de LoRA para especializacion de dominio.

## Capacidades

- Puntuacion de relevancia pregunta/pasaje para re-ranking en recuperacion de informacion.
- Reordenacion de los 50 primeros resultados de un sistema de recuperacion hibrido (segun la evaluacion reportada).
- Especializacion en dominio biomedico gracias al ajuste sobre BioASQ.
- Integracion con el ecosistema Hugging Face Transformers y PEFT mediante `AutoModelForSequenceClassification` y `PeftModel`.
- No genera texto, no razona de forma autonoma, no soporta tool calling ni agentes, y no tiene capacidades multimodales ni modo de pensamiento.

## Casos de uso

- Re-ranking en un pipeline RAG biomedico: dado un conjunto de pasajes recuperados por un retriever hibrido (BM25 + denso), el cross-encoder puntua cada par pregunta/pasaje y reordena los 50 primeros, mejorando la precision de los pasajes que se inyectan en el prompt del LLM generador.
- Busqueda de literatura medica: reordenar resultados de un corpus de articulos y resumenes (tipo PubMed/BioASQ) para que las respuestas a preguntas clinicas se apoyen en los pasajes mas relevantes.
- Filtrado de contexto en asistentes clinicos: reducir el numero de pasajes enviados al modelo generativo seleccionando solo los mejor puntuados, lo que disminuye coste de tokens y riesgo de ruido en la respuesta.
- Evaluacion de sistemas de recuperacion: usar el adaptador como componente de referencia para medir NDCG@5 y MRR@10 en experimentos de recuperacion sobre BioASQ.
- Segunda etapa de un buscador de dos fases: primera fase con recuperacion lexical o densa barata y segunda fase con este cross-encoder para precision, dado su tamano reducido (MiniLM) y su bajo coste de inferencia.
- Prototipado academico y docencia: ejemplo reproducible de ajuste LoRA sobre un cross-encoder para practicas de recuperacion de informacion, con codigo de entrenamiento referenciado.

## Benchmarks y rendimiento

Resultados reportados en la model card (re-ranking de los 50 primeros del sistema hibrido, corpus completo, 279 preguntas de test):

| Metrica | Valor |
|---|---|
| NDCG@5 | 0,5437 |
| MRR@10 | 0,7467 |

No se proporcionan resultados comparativos con otros modelos, ni metricas del modelo base sin adaptador, ni datos de MMLU, HumanEval, GSM8K u otros benchmarks generativos (no aplicables a un cross-encoder).

## Requisitos de hardware

- VRAM estimada: muy baja; el modelo base MiniLM-L-6-v2 (aproximadamente 22,7 M de parametros) ocupa del orden de decenas de MB en fp32 y menos en fp16, y el adaptador LoRA anade un coste marginal.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Una RTX 3060, RTX 4060 o superior es mas que suficiente, y la CPU puede ser viable para volumenes moderados.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2-4 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: Hugging Face Transformers con PEFT (patron documentado en la model card); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos generativos, no a cross-encoders de clasificacion).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| medir-rag-cross-encoder-lora | no disponible (base ~22,7 M) | no disponible (ejemplo a 320 tokens) | Re-ranking biomedico | no disponible | Repositorio vacio (0,0 GB) |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | ~22,7 M | 512 tokens | Re-ranking general (MS MARCO) | Apache 2.0 (modelo base de referencia) | Publico en Hugging Face |
| cross-encoder/ms-marco-MiniLM-L-12-v2 | ~33 M | 512 tokens | Re-ranking general (MS MARCO) | Apache 2.0 (modelo base de referencia) | Publico en Hugging Face |
| Adaptadores BiomedBERT/BioLinkBERT para re-ranking | variable | variable | Re-ranking biomedico | variable | variable |

La comparativa se limita a los modelos base de la familia MiniLM; no se dispone de datos de rendimiento del adaptador frente a alternativas especializadas en dominio biomedico.

## Limitaciones y advertencias

- El repositorio aparece con tamano 0,0 GB y 0 descargas: el adaptador puede no estar realmente publicado o estar incompleto, por lo que la carga con `PeftModel.from_pretrained` podria fallar.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido.
- No se documentan sesgos conocidos, pero al entrenarse sobre BioASQ hereda los sesgos de dominio y de idioma de ese corpus (predominantemente ingles y biomedico).
- Riesgo de alucinacion no aplicable en sentido generativo, pero si de falsos positivos/negativos en la puntuacion de relevancia, especialmente fuera del dominio biomedico.
- El rendimiento medido (NDCG@5 0,5437) es moderado y procede de una unica evaluacion sobre 279 preguntas; no hay validacion cruzada ni comparacion con el modelo base sin adaptador.
- Limitacion de contexto: el ejemplo de uso trunca a 320 tokens con `truncation="only_second"`, por lo que pasajes largos se recortan y pueden perder informacion relevante.
- No es un modelo generativo: no debe usarse para responder preguntas directamente, sino como componente de ranking dentro de un pipeline.
- La fecha de creacion indicada (2026-11-26) es posterior a la de esta ficha; conviene verificar la vigencia y el estado real del repositorio antes de usarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/iovieira/medir-rag-cross-encoder-lora
- Modelo base: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L-6-v2
- PEFT: https://github.com/huggingface/peft
- BioASQ: http://bioasq.org/
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios del proyecto MedIR-RAG ni demos.
