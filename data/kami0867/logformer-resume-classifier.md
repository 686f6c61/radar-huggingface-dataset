# Kami0867/logformer-resume-classifier

## Resumen

Logformer-resume-classifier es un modelo de clasificación de texto desarrollado por el usuario Kami0867 y publicado en HuggingFace. Se trata de un ajuste fino (fine-tuning) de allenai/longformer-base-4096, un encoder transformer disenado especificamente para procesar documentos largos mediante un mecanismo de atencion eficiente. El modelo resultante cuenta con 148.677.912 parametros y esta orientado a la tarea de clasificacion de curriculos (resume classifier), es decir, asignar categorias o etiquetas a documentos de tipo CV.

El modelo hereda del Longformer base la capacidad de manejar secuencias de hasta 4096 tokens, lo que lo hace adecuado para curriculos extensos que superan ampliamente la ventana de 512 tokens tipica de BERT o RoBERTa. Está publicado bajo licencia MIT, lo que permite uso comercial sin restricciones significativas, y sus pesos estan en formato safetensors, compatible con la libreria transformers.

Su relevancia radica en la combinacion de una arquitectura eficiente para documentos largos con un caso de uso muy concreto en recursos humanos y sistemas de reclutamiento automatizado. No obstante, el modelo tiene cero descargas y una sola interaccion en HuggingFace, por lo que carece de validacion comunitaria y de resultados de benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (Longformer) con atencion de ventana deslizante y atencion global |
| Parametros totales | 148.677.912 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (heredada del modelo base allenai/longformer-base-4096) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Longformer, una variante del transformer encoder que sustituye la atencion completa cuadratica por un mecanismo de atencion de ventana deslizante (sliding window attention) combinado con atencion global sobre tokens seleccionados. Esta disenado para escalar a secuencias de miles de tokens con un coste computacional lineal respecto a la longitud de la secuencia, a diferencia del coste cuadratico de BERT. La variante concreta allenai/longformer-base-4096 soporta ventanas de 4096 tokens y cuenta con aproximadamente 149 millones de parametros, coherente con los 148.677.912 parametros reportados en el safetensors del ajuste fino.

No se dispone de informacion sobre el proceso de entrenamiento especifico del ajuste fino: se desconoce el numero de tokens de entrenamiento, la composicion del dataset de curriculos, el numero de epocas, la tasa de aprendizaje y si se aplicaron tecnicas como RLHF o DPO (que, por otra parte, no son habituales en tareas de clasificacion). La model card no incluye mas metadatos que las metricas declaradas (accuracy y f1), sin valores asociados. Tampoco se documenta la taxonomia de etiquetas que predice el clasificador.

## Capacidades

- Clasificacion de texto: asigna una o varias etiquetas a un documento de entrada, presumiblemente categorias profesionales, sectores o niveles de seniority en curriculos.
- Procesamiento de documentos largos: al heredar la ventana de 4096 tokens del Longformer base, puede ingerir curriculos extensos sin truncar en la mayoria de los casos.
- Comprension de texto en ingles: el modelo esta entrenado y declarado exclusivamente para ingles.
- Inferencia rapida: con 148 millones de parametros y atencion lineal, es adecuado para despliegues de alto throughput en CPU o GPU modestas.
- Integracion con el ecosistema transformers: compatible con la pipeline text-classification de HuggingFace y con endpoints compatibles.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Triaje automatizado de curriculos en portales de empleo: el modelo puede clasificar cada CV entrante en categorias (por ejemplo, area profesional o nivel) para enrutarlo al reclutador correspondiente, aprovechando que acepta documentos de hasta 4096 tokens sin truncar.
- Filtrado en sistemas ATS (Applicant Tracking System): integrado como etapa de preprocesado, permite descartar o priorizar candidaturas segun la etiqueta predicha antes de la revision humana.
- Enriquecimiento de bases de datos de talento: clasificar lotes de curriculos historicos para etiquetar perfiles y hacerlos buscables por categoria.
- Moderacion y validacion de contenido en plataformas de empleo: detectar si un documento subido corresponde realmente a un curriculo u otro tipo de texto.
- Investigacion academica sobre clasificacion de documentos largos: servir como baseline ajustado para comparar tecnicas de atencion eficiente en tareas de clasificacion de CV.
- Prototipado rapido de demos de RH: dado su tamano reducido (0,6 GB de repositorio), se puede desplegar en una instancia unica para validar un producto de reclutamiento antes de invertir en modelos mayores.
- Pipeline de anonimizacion previa: como clasificador auxiliar para segmentar secciones de un CV antes de aplicar reglas de redaccion de datos personales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente declara las metricas accuracy y f1, pero no proporciona valores numericos, ni el conjunto de evaluacion, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,6 GB para los pesos, mas overhead de activaciones; en la practica menos de 2 GB en total.
- VRAM estimada en FP16/BF16: aproximadamente 0,3 GB para los pesos, con un consumo total inferior a 1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Funciona sin problema en RTX 3060, RTX 4060, RTX 4090, T4, L4, A10, A100 y H100; las GPU de gama alta quedan sobredimensionadas.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna e incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (pipeline text-classification), TorchServe, FastAPI con PyTorch, ONNX Runtime, HuggingFace Inference Endpoints (el tag endpoints_compatible esta presente en el repositorio). No se declara compatibilidad explicita con vLLM, llama.cpp, Ollama, TGI ni TensorRT-LLM, ya que estos estan orientados a modelos generativos y no a clasificadores encoder.
- Latencia y throughput: no disponibles. Se espera una latencia de milisegundos por muestra en GPU y de decenas de milisegundos en CPU, dado el tamano del modelo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kami0867/logformer-resume-classifier | 148,7 M | 4096 tokens | Clasificacion de curriculos | MIT | HuggingFace |
| allenai/longformer-base-4096 | ~149 M | 4096 tokens | Modelo base (masked LM, QA, clasificacion) | Apache 2.0 | HuggingFace |
| google-bert/bert-base-uncased | 110 M | 512 tokens | Modelo base (masked LM) | Apache 2.0 | HuggingFace |
| FacebookAI/roberta-base | 125 M | 512 tokens | Modelo base (masked LM) | MIT | HuggingFace |

La ventaja principal frente a BERT-base y RoBERTa-base es la ventana de contexto cuatro veces mayor, que evita truncar curriculos largos. La desventaja es que, a diferencia de los modelos base, este ajuste fino esta especializado en una unica tarea y no se puede reutilizar facilmente para otras. No se dispone de resultados de rendimiento que permitan comparar su calidad frente a alternativas ajustadas para la misma tarea.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al ser un ajuste fino de un modelo preentrenado en corpus web en ingles, es probable que herede sesgos de genero, edad, origen etnico o nacionalidad presentes en los datos, algo especialmente sensible en un caso de uso de seleccion de personal.
- Riesgo de alucinacion: bajo en terminos estrictos, ya que es un clasificador y no un modelo generativo. No obstante, puede producir clasificaciones erroneas con alta confianza (falsos positivos), lo que en un contexto de reclutamiento puede derivar en descartes injustificados.
- Limitaciones de contexto: la ventana de 4096 tokens es fija; documentos mas largos requeriran truncamiento o segmentacion.
- Limitaciones de idioma: solo se declara soporte para ingles. Curriculos en castellano u otros idiomas no estan cubiertos y su rendimiento sera probablemente pobre.
- Licencia: MIT permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright. No impone restricciones de atribucion mas alla de la habitual.
- Falta de validacion: cero descargas y una sola interaccion sugieren que el modelo no ha sido probado por la comunidad. No se documentan las etiquetas de salida, el dataset de entrenamiento ni metricas numericas, lo que impide evaluar su calidad antes de desplegarlo.
- Caveat de produccion: al tratarse de un clasificador de curriculos, su uso en decisiones de contratacion puede estar sujeto a regulaciones sobre decisiones automatizadas (por ejemplo, en la UE el RGPD reconoce el derecho a no ser objeto de decisiones individuales automatizadas sin intervencion humana). Se recomienda validacion humana y auditoria de sesgos antes de cualquier despliegue real.
- Fechas de creacion y actualizacion del repositorio (2026-10-03) aparecen en el futuro respecto a la fecha habitual de publicacion; se reportan tal como figuran en los metadatos.

## Enlaces

- HuggingFace: https://huggingface.co/Kami0867/logformer-resume-classifier
- Modelo base: https://huggingface.co/allenai/longformer-base-4096
- Paper de Longformer (referencia del modelo base): https://arxiv.org/abs/2004.05150
