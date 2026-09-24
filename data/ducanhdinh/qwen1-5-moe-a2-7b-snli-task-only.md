# ducanhdinh/Qwen1.5-MoE-A2.7B-SNLI-Task-Only

## Resumen

Qwen1.5-MoE-A2.7B-SNLI-Task-Only es un adaptador LoRA (PEFT) publicado por el usuario ducanhdinh sobre el modelo base Qwen/Qwen1.5-MoE-A2.7B, un transformer de tipo Mixture-of-Experts desarrollado por el equipo Qwen de Alibaba. El adaptador se ha ajustado exclusivamente para la tarea de inferencia de lenguaje natural (NLI) sobre el corpus SNLI, clasificando la relacion entre una premisa y una hipotesis en tres categorias: entailment, neutral o contradiction. No se trata de un modelo conversacional ni de proposito general: es un artefacto de investigacion orientado a una unica tarea de clasificacion.

El interes tecnico del repositorio no esta en el rendimiento final, sino en la configuracion de ajuste: aplica LoRA no solo a las capas de atencion, sino tambien al router y a los expertos de un subconjunto de capas del MoE (de la capa 8 a la 15, sobre un total de 24), usando rangos diferenciados por modulo mediante `rank_pattern`. Ademas, la funcion de perdida incorpora explicitamente un termino de balanceo de carga de expertos (load balancing loss), lo que lo convierte en una referencia util para quienes experimentan con fine-tuning selectivo de arquitecturas MoE.

El modelo tiene 44 descargas y 0 likes en el momento de redactar esta ficha, y el repositorio ocupa 32,5 GB, un tamano inusualmente grande para un adaptador LoRA, lo que sugiere que puede incluir copias de pesos del modelo base o artefactos adicionales. La licencia declarada es apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (base: Qwen1.5-MoE-A2.7B); adaptador LoRA sobre atencion, router y expertos |
| Parametros totales | 14,3 B en el modelo base; parametros del adaptador: no disponible |
| Parametros activos | 2,7 B en el modelo base (60 expertos, top_k = 4) |
| Longitud de contexto | 32.768 tokens heredados del modelo base Qwen1.5-MoE-A2.7B |
| Tipos de cuantizacion | no disponible para el adaptador (los pesos se distribuyen en safetensors) |
| Idiomas soportados | no disponible oficialmente; el ajuste se realizo unicamente sobre SNLI (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture-of-Experts de 24 capas, con 60 expertos y enrutamiento top_k = 4, lo que da 14,3 B de parametros totales y 2,7 B activos por token. El adaptador congela los pesos base y anade matrices de bajo rango sobre las capas 8 a 15 (excluyendo la 16, es decir, aproximadamente el tercio central de la red). Los modulos afectados son attention, router y experts, cada uno con un rango distinto configurado mediante `rank_pattern`: r = 16 para atencion, r = 4 para el router y r = 16 para los expertos. Los hiperparametros del LoRA son alpha = 32 y dropout = 0,05.

El entrenamiento utiliza la perdida estandar de un MoE: `L_total = L_LM + lb_loss_coef * L_LB`, donde `L_LM` es la entropia cruzada sobre el siguiente token calculada exclusivamente sobre el fragmento `<label_word><eos>` (el prompt se enmascara, al estilo de un SFT estandar) y `L_LB` es la perdida de balanceo de carga (estilo Switch/Mixtral) aplicada a los routers del rango de capas ajustado, con un coeficiente `lb_loss_coef` = 0,01. Los datos proceden del split de entrenamiento de SNLI, leidos como objetos `{"premise", "hypothesis", "label"}` con etiquetas 0/1/2 correspondientes a entailment/neutral/contradiction. El autor publica diagnosticos en `diagnostics/loss_log.jsonl`, `loss_curve.png`, `loss_curve_smoothed.png` y `accuracy_curve.png`, aunque no se incluyen valores numericos en la informacion disponible.

## Capacidades

- Clasificacion de inferencia de lenguaje natural (NLI) en tres clases: entailment, neutral y contradiction.
- Procesamiento de pares premisa/hipotesis en ingles siguiendo un formato de prompt fijo.
- Aprovechamiento de la ventana de contexto larga del modelo base para pares de textos extensos.
- Ajuste especifico de router y expertos del MoE, lo que puede interesar para experimentacion sobre enrutamiento selectivo.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multilingues; el entrenamiento usa exclusivamente SNLI en ingles.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).
- La generacion libre de texto queda degradada respecto al modelo base, ya que el ajuste esta restringido a una tarea de clasificacion.

## Casos de uso

- Clasificacion de pares texto/texto en pipelines de PLN: el adaptador recibe una premisa y una hipotesis y devuelve una de las tres etiquetas, por lo que encaja como componente de clasificacion dentro de un flujo mayor gestionado por otro modelo.
- Deteccion de contradicciones en respuestas generadas: en un sistema RAG se puede comprobar si la respuesta del generador contradice el contexto recuperado, marcando posibles alucinaciones cuando la salida es "contradiction".
- Anotacion automatica y etiquetado debil de datos: usar el adaptador para preetiquetar grandes volumenes de pares de frases y reducir el coste de anotacion humana antes de una revision manual.
- Filtrado de relevancia en busqueda y recuperacion: verificar si un pasaje recuperado implica o entra en conflicto con la consulta del usuario.
- Evaluacion de coherencia en resumenes o traducciones: comparar el texto original con la version generada para detectar inconsistencias semanticas.
- Investigacion sobre fine-tuning de MoE: el repositorio sirve como ejemplo reproducible de como aplicar LoRA a attention, router y expertos con rangos diferenciados y con perdida de balanceo de carga.
- Construccion de conjuntos de datos de entrenamiento para modelos mayores: generar etiquetas NLI a escala sobre corpus propios usando una unica GPU de gama alta, dado que solo se activan 2,7 B de parametros por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos en la informacion disponible. El autor incluye curvas de perdida y una curva de precision aproximada calculada sobre el primer token de la etiqueta en el propio batch de entrenamiento (`diagnostics/accuracy_curve.png`, suavizada cada 50 pasos), pero no se proporcionan valores numericos ni evaluacion sobre el split de validacion o test de SNLI, ni comparaciones con MMLU, HumanEval, GSM8K u otras tareas.

## Requisitos de hardware

- El adaptador por si solo es ligero, pero requiere cargar el modelo base Qwen1.5-MoE-A2.7B de forma conjunta.
- VRAM estimada para el modelo base en precision bf16: aproximadamente 28-29 GB, por lo que no cabe en GPUs de consumo de 24 GB sin cuantizar.
- VRAM estimada en cuantizacion de 8 bits: en torno a 15 GB, viable en una RTX 4090 de 24 GB.
- VRAM estimada en cuantizacion de 4 bits: en torno a 9-10 GB, viable en GPUs de consumo como RTX 4080, RTX 3090 o RTX 4090.
- GPU recomendadas para bf16 completo: A100 de 40/80 GB, H100 o dos GPU de 24 GB con reparto de modelo.
- Aunque solo se activan 2,7 B de parametros por token, el coste de memoria corresponde a los 14,3 B totales, por lo que el cuello de botella es la VRAM, no el computo.
- Opciones de despliegue: transformers con PEFT/LoRA para fusionar el adaptador; vLLM con soporte de LoRA; llama.cpp/Ollama si se convierte el modelo base a GGUF y se aplica o fusiona el adaptador.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento NLI | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen1.5-MoE-A2.7B-SNLI-Task-Only (este) | 14,3 B totales / 2,7 B activos + LoRA | 32.768 tokens (base) | no disponible | apache-2.0 | HuggingFace (44 descargas) |
| Qwen/Qwen1.5-MoE-A2.7B (base) | 14,3 B totales / 2,7 B activos | 32.768 tokens | no disponible | apache-2.0 | HuggingFace |
| microsoft/deberta-v3-large (tipo encoder para NLI) | 304 M | 512 tokens | no disponible en esta fuente | MIT | HuggingFace |
| FacebookAI/roberta-large-mnli (encoder para NLI) | 355 M | 512 tokens | no disponible en esta fuente | MIT | HuggingFace |

Los modelos basados en encoders son ordenes de magnitud mas pequenos y suelen emplearse como referencia clasica en NLI, mientras que este adaptador hereda el coste de memoria de un MoE de 14,3 B. No se dispone de datos de rendimiento que permitan comparar la precision real de las tres opciones.

## Limitaciones y advertencias

- Modelo de tarea unica: no es un modelo conversacional ni de proposito general; fuera del formato de prompt definido su comportamiento no esta garantizado.
- Idiomas: el ajuste se realizo solo con SNLI en ingles, por lo que el rendimiento fuera del ingles o con pares atipicos es desconocido.
- Sin evaluacion publica: no hay metricas sobre validacion o test, solo diagnosticos sobre el batch de entrenamiento, por lo que no se puede afirmar su precision real.
- Riesgo de sobreajuste: al entrenar sobre un unico corpus con un rango de capas limitado, la generalizacion a dominios distintos (juridico, medico, tecnico) es incierta.
- Sesgos del corpus SNLI: los datos son de anotacion colaborativa y pueden contener artefactos de anotacion y sesgos propios del ingles estadounidense.
- Riesgo de alucinacion: aunque la tarea es de clasificacion, el modelo genera texto y podria producir etiquetas fuera del conjunto valido si la entrada es muy atipica.
- El adaptador necesita el modelo base: no es un modelo autonomo y debe cargarse junto a Qwen/Qwen1.5-MoE-A2.7B.
- Tamano del repositorio: 32,5 GB, mucho mayor de lo habitual en un adaptador LoRA, conviene revisar su contenido antes de descargarlo en entornos con almacenamiento limitado.
- Uso comercial: la licencia apache-2.0 permite uso comercial, sujeta tambien a la licencia del modelo base (apache-2.0).
- Fecha de creacion registrada como 2026-09-24, posterior a la fecha habitual; conviene verificar la metadatos del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ducanhdinh/Qwen1.5-MoE-A2.7B-SNLI-Task-Only
- Modelo base: https://huggingface.co/Qwen/Qwen1.5-MoE-A2.7B
- Conjunto de datos SNLI (Stanford Natural Language Inference): https://nlp.stanford.edu/projects/snli/
- Libreria PEFT: https://github.com/huggingface/peft
