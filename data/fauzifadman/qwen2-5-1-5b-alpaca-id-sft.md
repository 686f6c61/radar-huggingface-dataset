# fauzifadman/Qwen2.5-1.5B-alpaca-id-sft

## Resumen

Qwen2.5-1.5B-alpaca-id-sft es un ajuste fino (SFT) comunitario del modelo Qwen2.5 de 1.500 millones de parametros, publicado por el usuario fauzifadman en Hugging Face. El modelo base es unsloth/Qwen2.5-1.5B-unsloth-bnb-4bit, la version cuantizada a 4 bits que prepara el equipo de Unsloth a partir de Qwen2.5-1.5B de Alibaba. El sufijo "alpaca-id-sft" sugiere un entrenamiento supervisado sobre el dataset Alpaca, posiblemente en indonesio ("id"), aunque la model card solo declara el ingles como idioma y no detalla el dataset utilizado.

Se trata de un modelo ligero orientado a la generacion de texto conversacional, util para experimentacion local, prototipado y despliegue en hardware modesto. Su relevancia es limitada como artefacto de produccion —es un fine-tune personal sin documentacion extensa, con 398 descargas y sin benchmarks publicados— pero resulta ilustrativo del flujo de trabajo tipico con Unsloth y TRL: cuantizacion en 4 bits, SFT eficiente en memoria y subida directa a Hugging Face en formato safetensors. La arquitectura subyacente es Qwen2 (transformer decoder) con 1.543.714.304 parametros segun los metadatos de safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder) |
| Parametros totales | 1.543.714.304 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el Qwen2.5 base soporta 32.768 tokens, pero no consta en la model card) |
| Tipos de cuantizacion | no disponible (el modelo base de Unsloth usa bnb-4bit; no consta la cuantizacion de este repo) |
| Idiomas soportados | ingles (declarado en la model card; el nombre sugiere posible entrenamiento con datos en indonesio, no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3,1 GB de tamano de repo) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2: un transformer decoder con atencion agrupada de consultas (GQA), ventanas contextuales largas y normalizacion RMSNorm, caracteristica de la familia Qwen2.5 de Alibaba. El punto de partida es la variante de Unsloth, que aplica cuantizacion a 4 bits mediante bitsandbytes (bnb-4bit) para reducir la huella de memoria durante el entrenamiento y la inferencia.

El ajuste fino se realizo con la libreria TRL de Hugging Face y Unsloth, que segun el autor permite entrenar "2x mas rapido" mediante optimizaciones de kernels y backpropagacion eficiente en modelos cuantizados. El nombre del repositorio indica un SFT (supervised fine-tuning) sobre el dataset Alpaca, presumiblemente en su version en indonesio ("id"), aunque la model card no documenta el dataset, el numero de tokens, los hiperparametros ni tecnicas posteriores como RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en formato chat (tag "conversational" y pipeline text-generation).
- Seguimiento de instrucciones estilo Alpaca, heredado del ajuste fino supervisado.
- Capacidades base de Qwen2.5-1.5B: razonamiento general, generacion de codigo y matematicas a nivel basico, aunque degradadas o modificadas por el fine-tune.
- No hay evidencia documentada de soporte de tool calling, function calling, agentes, vision ni audio.
- No hay evidencia documentada de modo "thinking" ni capacidades multimodales.

## Casos de uso

- Prototipado rapido de chatbots locales: con unos 3,1 GB de pesos puede ejecutarse en portatiles y GPUs de consumo para validar flujos conversacionales antes de escalar a modelos mayores.
- Experimentacion con SFT: sirve como ejemplo practico del pipeline Unsloth + TRL para quien quiera reproducir un fine-tune Alpaca sobre un modelo cuantizado.
- Asistente de instrucciones en entornos con recursos limitados: el tamano reducido permite inferencia en CPUs o GPUs modestas con latencias aceptables para tareas simples.
- Clasificacion y transformacion de texto ligera: resumenes cortos, reformulaciones y extraccion basada en instrucciones, donde un modelo de 1,5B suele ser suficiente.
- Datos posibles en indonesio: si el dataset empleado fue Alpaca en indonesio, podria usarse para asistentes basicos en ese idioma, aunque esto no esta confirmado y deberia validarse empiricamente.
- Integracion en demos educativas: base ideal para talleres de fine-tuning eficiente, dado el bajo coste de entrenamiento e inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, ni comparativas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 3,1 GB en safetensors, por lo que con margen para KV cache bastarian unas 4-6 GB de VRAM; si los pesos estuvieran en fp16 (sin cuantizar), se estimarian unos 3-4 GB solo de pesos.
- GPU recomendadas: cualquier GPU de consumo con 6 GB o mas (RTX 3060, RTX 4060, RTX 4090 con amplio margen). No se requieren A100 ni H100 para inferencia.
- Cabe comodamente en GPUs de consumo; incluso es viable la ejecucion en CPU con llama.cpp dado su tamano.
- Opciones de despliegue: transformers (libreria nativa del repo), text-generation-inference (tag "text-generation-inference"), vLLM, llama.cpp y Ollama (previa conversion a GGUF, no disponible en el repo).
- Latencia y throughput: no disponible; al ser un modelo de 1,5B, se esperan latencias bajas y throughputs altos en GPU de consumo, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-1.5B-alpaca-id-sft (este) | 1.543.714.304 | no disponible | Apache 2.0 | SFT comunitario sobre base Unsloth 4-bit, sin benchmarks publicados |
| Qwen2.5-1.5B-Instruct (Alibaba) | 1.500 M aprox. | 32.768 tokens | Qwen Research (uso comercial permitido con condiciones) | Modelo oficial con chat template, tool calling y benchmarks publicados |
| Llama-3.2-1B-Instruct (Meta) | 1.240 M aprox. | 128.000 tokens | Llama 3.2 Community License | Competidor directo en la gama de 1B, mejor documentado y con ecosistema mas amplio |
| Gemma-2-2B-it (Google) | 2.600 M aprox. | 8.192 tokens | Gemma Terms of Use | Puntos fuertes en razonamiento y multilingüidad dentro de la gama pequena |

El modelo de fauzifadman se diferencia de los oficiales en que es un fine-tune personal sin evaluaciones ni soporte; para produccion, las variantes oficiales Instruct suelen ser una eleccion mas segura.

## Limitaciones y advertencias

- Documentacion minima: la model card no detalla dataset, hiperparametros, ni procedimiento de entrenamiento, lo que dificulta evaluar calidad y sesgos.
- Posible degradacion del modelo base: un SFT sobre Alpaca con datos limitados puede empeorar capacidades de codigo, matematicas o razonamiento presentes en Qwen2.5-1.5B-Instruct.
- Riesgo de alucinacion elevado: tipico de modelos pequenos, agravado por la ausencia de alineacion documentada (RLHF/DPO no constan).
- Ambigüedad de idioma: la model card declara ingles, pero el nombre sugiere datos en indonesio; el rendimiento en cada idioma debe verificarse empiricamente.
- Cuantizacion sin aclarar: no se especifica si los pesos del repo estan cuantizados o en precision completa; el tamaño de 3,1 GB sugiere pesos en bf16/fp16.
- Licencia Apache 2.0: sin restricciones para uso comercial, aunque la licencia del modelo base original (Qwen) puede aplicar condiciones adicionales en derivados.
- Sin benchmarks ni evaluaciones de seguridad publicadas: se recomienda evaluacion propia antes de cualquier despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fauzifadman/Qwen2.5-1.5B-alpaca-id-sft
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen2.5-1.5B-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Qwen2.5-1.5B-Instruct (modelo oficial): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
