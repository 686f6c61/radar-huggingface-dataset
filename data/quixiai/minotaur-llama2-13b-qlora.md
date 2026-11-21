# QuixiAI/minotaur-llama2-13b-qlora

## Resumen

minotaur-llama2-13b-qlora es un adaptador LoRA (PEFT) publicado por QuixiAI sobre el modelo base TheBloke/Llama-2-13B-fp16. Se trata de un fine-tuning de tipo QLoRA, es decir, entrenamiento de bajo rango sobre una cuantizacion de 4 bits del modelo Llama 2 de 13 mil millones de parametros de Meta. El repositorio contiene unicamente los pesos del adaptador (2,5 GB), no el modelo completo, por lo que su uso requiere cargar el modelo base y aplicar el adaptador mediante la libreria PEFT.

El modelo hereda la arquitectura transformer decoder-only de Llama 2, con 13 000 millones de parametros y una ventana de contexto de 4096 tokens (caracteristica estandar de la familia Llama 2). El entrenamiento se realizo con cuantizacion NF4 de doble cuantizacion y dtype de computo float32, segun la configuracion de bitsandbytes documentada en la model card.

Su relevancia es principalmente historica y de experimentacion: es un ejemplo temprano (agosto de 2023) de fine-tuning QLoRA de Llama 2 en la comunidad open source. Con solo 5 descargas y 4 likes, no es un modelo de produccion, sino una pieza de interes para quienes estudian la evolucion del ecosistema de adaptadores o quieren reproducir el flujo QLoRA sobre Llama 2 13B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), adaptador LoRA sobre modelo base |
| Parametros totales | 13 000 millones (modelo base Llama-2-13B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (heredado de Llama 2; no confirmado en la model card) |
| Tipos de cuantizacion | Entrenamiento en 4 bits NF4 con doble cuantizacion; el adaptador se distribuye en el formato PEFT (no cuantizado) |
| Idiomas soportados | no disponible |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | Adaptador PEFT/LoRA (safetensors segun el repo de 2,5 GB); requiere modelo base en fp16 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre TheBloke/Llama-2-13B-fp16, que a su vez es una conversion a fp16 del Llama-2-13B original de Meta. La arquitectura subyacente es un transformer decoder-only con atencion causal, 40 capas, dimension de modelo 5120 y 40 cabezas de atencion (especificaciones estandar de Llama 2 13B). El adaptador se aplica sobre las proyecciones del transformer mediante bajo rango, aunque el rank, alpha y modulos objetivo no se detallan en la model card.

El entrenamiento utilizo QLoRA con bitsandbytes: carga en 4 bits (load_in_4bit: True), tipo de cuantizacion nf4, doble cuantizacion activada y dtype de computo float32. La version de PEFT registrada es 0.5.0.dev0. No se especifica el dataset de entrenamiento, el numero de tokens, la composicion de datos ni si hubo RLHF o DPO. La model card no documenta hiperparametros de entrenamiento mas alla de la configuracion de cuantizacion.

## Capacidades

- Generacion de texto autoregresiva en ingles (idioma principal de Llama 2; no se documentan otros idiomas).
- Razonamiento de sentido comun y respuesta a preguntas de opcion multiple, segun los resultados del Open LLM Leaderboard.
- Razonamiento aritmetico basico, con rendimiento limitado (GSM8K 12,05 %).
- Fine-tuning adicional sobre el adaptador para tareas especificas, ya que el formato PEFT permite seguir entrenando.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Experimentacion con QLoRA: el adaptador sirve como ejemplo reproducible de fine-tuning de Llama 2 13B en 4 bits, util para investigadores que quieran replicar el flujo con PEFT 0.5.0 y bitsandbytes.
- Investigacion sobre adaptadores de bajo rango: permite estudiar como un adaptador pequeno modifica el comportamiento de un modelo base de 13B sin reentrenar todos los pesos.
- Base para fine-tuning posterior: al ser un adaptador PEFT, se puede continuar entrenando sobre el para dominios concretos (legal, medico, tecnico) partiendo de un checkpoint ya ajustado.
- Evaluacion comparativa de checkpoints comunitarios: util para comparar el efecto de distintos adaptadores sobre el mismo modelo base en tareas del Open LLM Leaderboard.
- Docencia y formacion: ejemplo practico de como se publica y carga un adaptador LoRA sobre un modelo base en Hugging Face.
- Pruebas de infraestructura de inferencia con PEFT: permite validar pipelines que cargan modelo base mas adaptador en entornos con memoria limitada gracias a la cuantizacion 4 bits.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (Open LLM Leaderboard, no verificados):

| Benchmark | Metrica | Valor |
|---|---|---|
| ARC-Challenge (25-shot) | acc_norm | 60,07 |
| HellaSwag (10-shot) | acc_norm | 82,42 |
| MMLU (5-shot) | acc | 55,87 |
| TruthfulQA (0-shot) | mc2 | 45,57 |
| Winogrande (5-shot) | acc | 76,24 |
| GSM8K (5-shot) | acc | 12,05 |
| DROP (3-shot) | acc | 14,53 |
| Media (segun model card) | avg | 49,54 / 55,37 (dos tablas con criterios distintos) |

Nota: la model card incluye dos tablas de resultados con medias distintas (49,54 y 55,37) porque una incluye DROP y la otra no. Los valores de GSM8K y DROP son muy bajos, lo que sugiere un modelo debil en razonamiento aritmetico y comprension lectora compleja.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en fp16 requiere aproximadamente 26 GB; en 4 bits (NF4) baja a unos 7-8 GB, mas el adaptador (2,5 GB en disco).
- GPU recomendadas: A100 40 GB o H100 para fp16 sin cuantizar; RTX 4090 (24 GB) para fp16 con margen ajustado o 8 bits; RTX 3090/4080 (16-24 GB) para 4 bits.
- Cabe en GPU consumer: si, en 4 bits cabe en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB); en fp16 requiere 24 GB o mas.
- Opciones de despliegue: transformers + PEFT (carga de adaptador), vLLM (con soporte de adaptadores LoRA), llama.cpp/Ollama solo si se fusiona el adaptador con el modelo base y se convierte a GGUF; TGI con soporte de adaptadores.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| QuixiAI/minotaur-llama2-13b-qlora | 13B (adaptador) | 4096 (heredado) | llama2 | PEFT/LoRA | Fine-tuning QLoRA comunitario, pocas descargas |
| ehartford/minotaur-llama2-13b-qlora | 13B (adaptador) | 4096 (heredado) | llama2 | PEFT/LoRA | Modelo referenciado en la fuente de los benchmarks; mismo esquema |
| TheBloke/Llama-2-13B-fp16 | 13B | 4096 | llama2 | safetensors fp16 | Modelo base sin adaptador |
| Llama-2-13B-chat (Meta) | 13B | 4096 | llama2 | safetensors | Version afinada para dialogo por Meta |

La comparativa se limita a modelos de la misma familia porque no se dispone de datos de benchmarks de alternativas en la informacion proporcionada. El rendimiento del adaptador es coherente con un fine-tuning comunitario de Llama 2 13B de 2023, sin mejoras documentadas frente al modelo base.

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos de Llama 2 y del dataset de fine-tuning, que no se documenta.
- Riesgo de alucinacion: alto en tareas de conocimiento factual y razonamiento aritmetico, como refleja el 12,05 % en GSM8K y el 45,57 en TruthfulQA.
- Limitaciones de contexto: 4096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idioma: no se documentan idiomas soportados; Llama 2 esta optimizado para ingles, con rendimiento limitado en castellano.
- Restricciones de licencia: la Llama 2 Community License impone condiciones para uso comercial (limite de 700 millones de usuarios mensuales, atribucion y restricciones de uso aceptable); revisar antes de produccion.
- Caveat de produccion: es un adaptador, no un modelo completo; requiere cargar el modelo base y aplicar PEFT, lo que anade complejidad operativa y dependencia de versiones (PEFT 0.5.0.dev0).
- Madurez: solo 5 descargas y 4 likes, sin mantenimiento documentado; no recomendado como base de produccion sin validacion propia.
- Resultados de benchmarks no verificados por el autor (verified: false) y con dos medias distintas en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/QuixiAI/minotaur-llama2-13b-qlora
- Modelo base: https://huggingface.co/TheBloke/Llama-2-13B-fp16
- Open LLM Leaderboard: https://huggingface.co/spaces/HuggingFaceH4/open_llm_leaderboard
- Resultados detallados (referencia del autor): https://huggingface.co/datasets/open-llm-leaderboard/details_ehartford__minotaur-llama2-13b-qlora
- Consulta del leaderboard citada en la model card: https://huggingface.co/spaces/HuggingFaceH4/open_llm_leaderboard?query=ehartford/minotaur-llama2-13b-qlora
