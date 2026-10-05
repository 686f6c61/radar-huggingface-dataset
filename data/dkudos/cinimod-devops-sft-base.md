# dkudos/cinimod-devops-sft-base

## Resumen

Cinimod DevOps 300M - SFT-ready base es un checkpoint preentrenado de 287.313.920 parametros desarrollado por el usuario dkudos, publicado como version preparada para ajuste supervisado (SFT) del modelo dkudos/cinimod-devops. Se trata de un modelo de lenguaje causal de tipo transformer decoder-only con arquitectura estilo Llama (LlamaForCausalLM), entrenado desde cero y no derivado de ninguna conversion de pesos existente. Su proposito original es servir como base canonica (Fase 0) para los experimentos de CMAF (cross-model attention fusion) del proyecto cinimod-llm, asi como para estudios de adaptacion de dominio mediante LoRA.

La diferencia respecto al checkpoint original es puramente estructural: el vocabulario y la matriz de embeddings se han ampliado con 3 filas reservadas (de 65.536 a 65.539 entradas), de modo que los tokens especiales de chat puedan anadirse durante el SFT sin necesidad de redimensionar la matriz de embeddings. Los pesos entrenados son identicos a los del repositorio base. El modelo esta orientado a modelado de lenguaje en el dominio DevOps y administracion de sistemas, unicamente en ingles, y no incorpora ajuste por instrucciones ni RLHF.

Se trata de un modelo de escala investigadora (300M) que resulta util para experimentacion en adaptacion de dominio y especializacion, pero no para seguir instrucciones generales ni para tareas de asistente en produccion. Su licencia Apache 2.0 permite uso comercial y modificacion sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (LlamaForCausalLM) |
| Parametros totales | 287.313.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible en este repositorio (el repo base ofrece f16 y Q8_0 para llama.cpp) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (dtype bfloat16) |
| Hidden size | 1024 |
| Numero de capas | 20 |
| Cabezas de atencion | 16 cabezas de consulta, 4 cabezas KV (GQA) |
| Intermediate size | 2730 |
| Vocabulario | 65.539 entradas (65.536 entrenadas + 3 reservadas) |
| Embeddings atados | si (tied embeddings) |
| Tamano del repositorio | 0.6 GB |
| Modelo base | dkudos/cinimod-devops |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only de estilo Llama, implementada como LlamaForCausalLM, con 20 capas, hidden size de 1024, 16 cabezas de atencion con solo 4 cabezas KV mediante Grouped Query Attention (GQA) y un tamano intermedio de 2730. Los embeddings de entrada y salida estan atados, lo que reduce el numero de parametros efectivos. Se entreno desde cero, no como conversion de un checkpoint previo, sobre un total de 287.310.848 parametros que pasaron a 287.313.920 tras el padding del vocabulario con 3 filas reservadas.

El entrenamiento se realizo en vast.ai sobre 2 GPU RTX 4090 en precision bfloat16, durante 4000 pasos con una longitud de secuencia de 4096 tokens. Posteriormente, el script prep_for_sft.py convirtio el checkpoint al formato nativo de HuggingFace y amplio el vocabulario para alojar los futuros tokens especiales de chat. No se aplico ajuste por instrucciones, ni RLHF, ni DPO: es un modelo puramente preentrenado. El checkpoint recuperado el 2026-09-20 procede del directorio /home/dkaiser/sft-training/devops-300m-prepped/ y fue fijado en este repositorio para garantizar la reproducibilidad de los experimentos CMAF, el arnes de deriva de fronteras (boundary drift harness) y el trio de LoRA de dominio divergente (lora-a, lora-b, lora-c).

## Capacidades

- Modelado de lenguaje causal autoregresivo en el dominio DevOps y administracion de sistemas.
- Generacion de texto especializado en documentacion tecnica, runbooks y material de referencia de operaciones.
- Soporte para asistencia en tooling y texto de tipo sysadmin, segun la intencion declarada por el autor.
- Capacidad de servir como base para ajuste supervisado (SFT) al incluir 3 filas de embedding reservadas para tokens especiales de chat.
- Capacidad de servir como base para adaptacion de dominio mediante LoRA (usado en los experimentos lora-a, lora-b y lora-c).
- Capacidad de servir como checkpoint de referencia para mediciones de compatibilidad de hidden states en experimentos CMAF.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta vision, audio ni modo de pensamiento (thinking mode).
- Multilingue: no; unicamente ingles.

## Casos de uso

- Ajuste supervisado de dominio DevOps: el modelo se carga como checkpoint inicial para SFT sobre instrucciones de operaciones, aprovechando las 3 filas de embedding reservadas para anadir tokens de chat sin redimensionar la matriz.
- Investigacion en adaptacion de dominio con LoRA: sirve como base fija para entrenar adaptadores divergentes (como el trio lora-a/lora-b/lora-c del proyecto cinimod-llm) y comparar la especializacion resultante.
- Experimentos de CMAF (cross-model attention fusion): es el checkpoint canonico de Fase 0 que cargan el boundary drift harness y las mediciones de compatibilidad de hidden states, asegurando reproducibilidad entre ejecuciones.
- Modelado de lenguaje para autocompletado de runbooks: dado su entrenamiento en texto de operaciones, puede emplearse para completar plantillas de procedimientos tecnicos en ingles dentro de herramientas internas.
- Generacion de documentacion tecnica de infraestructura: util para prototipar borradores de guias de despliegue, configuracion y mantenimiento, siempre con revision humana posterior.
- Estudio academico de modelos pequenos en dominio vertical: sus 287M de parametros y su contexto de 4096 tokens lo hacen adecuado para analizar como se comporta un transformer pequeno al especializarse frente a modelos de proposito general.
- Base para experimentos de decodificacion o analisis de representaciones internas: al estar entrenado desde cero con una arquitectura conocida, resulta practico para instrumentar capas y estudiar atencion, embeddings y deriva de representaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 0,6 GB para los pesos (287M parametros a 2 bytes), mas memoria para activaciones y cache KV segun el lote y la longitud de contexto; en la practica, menos de 2 GB para inferencia con lotes pequenos.
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,3 GB para los pesos; no se distribuyen GGUFs en este repositorio.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; se entreno en 2 x RTX 4090, que sobran para inferencia.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de consumo (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en muchas integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (AutoModelForCausalLM) de forma nativa; para llama.cpp / Ollama hay que convertir los pesos o reutilizar los GGUFs (f16, Q8_0) del repositorio base dkudos/cinimod-devops, ya que este repositorio no incluye exportaciones GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados para este modelo, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| dkudos/cinimod-devops-sft-base | 287.313.920 | 4096 | Apache 2.0 | HuggingFace (safetensors) |
| dkudos/cinimod-devops (base) | 287.310.848 | 4096 | Apache 2.0 | HuggingFace (safetensors + GGUF f16/Q8_0) |
| Alternativas de escala similar | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa disponible es con su propio modelo base: el checkpoint aqui descrito anade 3 filas de vocabulario reservadas (65.539 frente a 65.536) y 3.072 parametros adicionales, pero mantiene los mismos pesos entrenados y no incluye exportaciones GGUF.

## Limitaciones y advertencias

- Es un modelo exclusivamente preentrenado: no ha recibido ajuste por instrucciones, ni RLHF, ni DPO, por lo que no se comporta como un asistente conversacional.
- Alto riesgo de alucinacion y de generar texto incoherente fuera del dominio DevOps; no debe usarse para producir informacion factual sin verificacion.
- Solo soporta ingles; no hay capacidades multilingues.
- Contexto limitado a 4096 tokens, insuficiente para documentos extensos o conversaciones largas.
- Escala investigadora (300M): util para adaptacion de dominio y estudios de especializacion, no para seguimiento de instrucciones de proposito general.
- Las 3 filas de embedding reservadas no estan entrenadas; si se anaden tokens, deben inicializarse correctamente antes del fine-tuning.
- No incluye exportaciones GGUF en este repositorio; para usarlo con llama.cpp u Ollama hay que convertir los pesos o emplear los del repositorio base.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre datos de dominio DevOps en ingles, probablemente herede los sesgos de ese corpus, pero no hay analisis publicado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se documenten los cambios; no se identifican clausulas adicionales.
- El modelo se publico con 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa de su comportamiento en produccion.
- Cualquier uso en produccion exige fine-tuning previo y evaluacion especifica del dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dkudos/cinimod-devops-sft-base
- Modelo base: https://huggingface.co/dkudos/cinimod-devops
- Repositorio del proyecto (referenciado en la model card): https://gitlab.com/dkudos/cinimod-llm
