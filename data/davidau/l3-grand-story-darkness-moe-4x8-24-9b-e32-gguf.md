# DavidAU/L3-Grand-Story-Darkness-MOE-4X8-24.9B-e32-GGUF

## Resumen

L3-Grand-Story-Darkness-MOE-4X8-24.9B-e32-GGUF es un modelo de lenguaje de tipo mixture of experts (MoE) desarrollado por DavidAU, construido mediante mergekit a partir de cuatro modelos Llama 3 de 8B especializados en escritura creativa, ficcion y roleplay. El resultado es un modelo de aproximadamente 24,9 mil millones de parametros totales (equivalente a un 32B, segun el autor, por la combinacion 4x8B) que combina la diversidad estilistica de sus cuatro "expertos" en un unico checkpoint.

El modelo esta pensado principalmente para generacion de ficcion, prosa vivida, narrativa, generacion de tramas y roleplay, aunque el autor indica que tambien puede emplearse para uso general. Se distribuye en formato GGUF, cuantizado a partir de una fuente maestra en float32 ("Enhanced32"), con cuantizaciones estandar y variantes "max" y "max-cpu" que elevan la precision de las capas de salida y embeddings.

Es relevante ahora porque demuestra el enfoque de fusion de modelos (model merging) como alternativa de bajo coste para obtener capacidades cercanas a modelos mayores partiendo de checkpoints de 8B, y porque ofrece una via practica de despliegue local en formato GGUF con llama.cpp, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only Llama 3, fusionada como mixture of experts (MoE) mediante mergekit |
| Parametros totales | 24.942.219.264 (~24,9B) |
| Parametros activos | no disponible |
| Longitud de contexto | 8192 tokens (8k) |
| Tipos de cuantizacion | GGUF: Q2_K, IQ4_XS, Q6_K, Q8_0 (con variantes "max" y "max-cpu"); fuente maestra float32 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 335,2 GB; fuente maestra float32 de ~100 GB en repo separado, segun el autor) |

## Arquitectura y entrenamiento

El modelo no se entrena desde cero: es una fusion (merge) de cuatro modelos Llama 3 de 8B realizada con mergekit y configurada como mixture of experts, de modo que la red resultante combina los pesos de los cuatro expertos. Los cuatro modelos de origen son Sao10K/L3-8B-Stheno-v3.2, NeverSleep/Llama-3-Lumimaid-8B-v0.1-OAS, Hastagaras/Jamet-8B-L3-MK.V-Blackroot y nbeerbower/llama-3-gutenberg-8B, todos ellos orientados a escritura creativa, roleplay o prosa literaria. La version "Enhanced32" se masteriza en precision float32 para preservar mas detalle y mejorar el seguimiento de instrucciones respecto a una fusion en menor precision.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre etapas de RLHF o DPO, ya que al tratarse de una fusion no hay un entrenamiento posterior documentado. La innovacion tecnica destacable es doble: por un lado, la fusion MoE 4x8B que eleva la capacidad efectiva a ~24,9B; por otro, la estrategia de cuantizacion del autor, que fija las capas de salida (output tensor) en Q8_0 y aplica variantes "max" (salida y embeddings en float32) y "max-cpu" (salida en float32 y embeddings en bfloat16 forzados a CPU) para mejorar la calidad de generacion a costa de VRAM o velocidad. El autor indica que el modelo requiere plantilla Llama 3, plantilla Command-R o una plantilla Jinja autocargada incluida en el GGUF.

## Capacidades

- Generacion de texto creativo: prosa vivida, ficcion, narrativa larga, generacion de tramas y subtramas, continuacion de escenas.
- Escritura en multiples generos: ciencia ficcion, romance, terror, humor, entre otros.
- Roleplay conversacional multi-turno, con soporte de contenido explicito y lenguaje soez (modelo sin censura).
- Seguimiento de instrucciones reforzado gracias a la masterizacion en float32 y a las cuantizaciones aumentadas.
- Uso general de generacion de texto, aunque el autor lo orienta a escritura y roleplay.
- Soporte de plantillas de prompt Llama 3, Command-R y Jinja autocargada.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo "thinking".
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Generacion de ficcion y narrativa larga: el modelo puede producir capitulos, escenas y arcos narrativos coherentes dentro de su ventana de 8k tokens, aprovechando la fusion de cuatro estilos literarios distintos para obtener prosa mas variada.
- Roleplay y personajes conversacionales: su entrenamiento sobre modelos de roleplay (Stheno, Lumimaid) y su naturaleza sin censura lo hacen adecuado para bots de personaje con conversaciones multi-turno y contenido adulto, siempre que se controle la temperatura para no degradar el seguimiento de instrucciones.
- Asistencia a escritores: generacion de borradores, continuacion de escenas, propuestas de tramas y subtramas, y reescritura con estilo vivido mediante instrucciones como "(vivid horror)" en el prompt.
- Prototipado local de aplicaciones de escritura creativa: al distribuirse en GGUF, puede desplegarse en llama.cpp u Ollama en estaciones de trabajo sin GPU de datacenter, lo que facilita iterar sobre prompts y plantillas.
- Generacion de contenido para juegos de rol de mesa o videojuegos narrativos: descripciones de escenas, dialogos de PNJ y ramificaciones argumentales con un tono mas oscuro o intenso segun se indique en el prompt.
- Experimentacion con tecnicas de merging y cuantizacion: sirve como caso de estudio para investigadores interesados en fusiones MoE 4x8B y en el impacto de cuantizaciones con capas de salida en precision elevada.
- Generacion de texto general con sesgo creativo: tareas de redaccion donde se tolere un tono mas literario y un ligero sesgo negativo, evitando usos que requieran neutralidad estricta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor afirma que el modelo tiene un nivel de perplejidad inferior al de Meta Llama 3 Instruct y que su rendimiento en prosa y ficcion es superior al de otros modelos Llama de 8B o mas, pero no se aportan cifras de MMLU, HumanEval, GSM8K ni de otras evaluaciones estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Q2_K se situa en torno a 9-10 GB, IQ4_XS en torno a 14-15 GB, Q6_K en torno a 20-21 GB y Q8_0 en torno a 26-27 GB (estimaciones a partir del numero de parametros; el autor no publica cifras exactas).
- GPU recomendadas: para Q8_0, GPU con 32 GB o mas (A100 40 GB, H100, RTX A6000). Para IQ4_XS o Q6_K, GPU de 24 GB (RTX 3090, RTX 4090) con posible offload parcial. Para Q2_K, GPU de 12-16 GB.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q4/IQ4 o Q6_K, y en GPUs de 12-16 GB con Q2_K, a costa de calidad.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con la API de endpoints (el repo incluye la etiqueta endpoints_compatible). No se documenta soporte de vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles. Las variantes "max-cpu" desplazan la salida y los embeddings a CPU, lo que libera VRAM a costa de reducir tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Formato |
|---|---|---|---|---|---|
| L3-Grand-Story-Darkness-MOE-4X8-24.9B-e32 | ~24,9B | 8192 | MoE por merge de 4x8B | Apache 2.0 | GGUF |
| Sao10K/L3-8B-Stheno-v3.2 | 8B | 8192 | Denso (Llama 3) | no disponible en la informacion | safetensors, GGUF |
| NeverSleep/Llama-3-Lumimaid-8B-v0.1-OAS | 8B | 8192 | Denso (Llama 3) | no disponible en la informacion | safetensors, GGUF |
| Meta Llama 3 8B Instruct | 8B | 8192 | Denso (Llama 3) | Llama 3 Community License | safetensors, GGUF |

La comparacion de rendimiento con estas alternativas no esta disponible con cifras: el autor solo afirma una perplejidad inferior a Llama 3 Instruct y mejor prosa que modelos Llama de 8B, sin datos verificables. Frente a los modelos de origen, la ventaja principal es la mayor capacidad efectiva (~24,9B) y la fusion de estilos; la desventaja es el mayor coste de VRAM y la ausencia de benchmarks publicos.

## Limitaciones y advertencias

- Contenido NSFW y lenguaje soez: el modelo esta explicitamente disenado sin censura, con sesgo hacia terror, violencia y tono oscuro, por lo que no es adecuado para aplicaciones orientadas a publico general sin filtros adicionales.
- Sesgo ligero negativo: el autor advierte que no es un modelo de "finales felices", lo que puede producir respuestas con tono pesimista o sombrio en usos generales.
- Riesgo de alucinacion: al ser un modelo de 8B fusionado, su conocimiento factual es limitado y no debe usarse como fuente de verdad en tareas de recuperacion de hechos.
- Limitacion de idioma: solo entrenado y evaluado en ingles; el rendimiento en castellano no esta garantizado.
- Contexto limitado a 8192 tokens, insuficiente para documentos muy largos o conversaciones extensas sin resumen.
- Persistencia de "GPTisms": el autor reconoce que quedan algunos artefactos de estilo, mitigables subiendo la temperatura.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero los modelos base pueden tener condiciones adicionales (Llama 3 Community License en la cadena de Llama 3) que conviene revisar antes de un despliegue comercial.
- Temperaturas muy altas mejoran la variedad de prosa pero degradan el seguimiento de instrucciones; el autor recomienda repetition penalty de 1,02 o superior.
- No hay benchmarks publicos ni evaluaciones independientes que respalden las afirmaciones de calidad del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/L3-Grand-Story-Darkness-MOE-4X8-24.9B-e32-GGUF
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs y soporte: https://huggingface.co/DavidAU/support
- Modelo base Sao10K/L3-8B-Stheno-v3.2: https://huggingface.co/Sao10K/L3-8B-Stheno-v3.2
- Modelo base NeverSleep/Llama-3-Lumimaid-8B-v0.1-OAS: https://huggingface.co/NeverSleep/Llama-3-Lumimaid-8B-v0.1-OAS
- Modelo base Hastagaras/Jamet-8B-L3-MK.V-Blackroot: https://huggingface.co/Hastagaras/Jamet-8B-L3-MK.V-Blackroot
- Modelo base nbeerbower/llama-3-gutenberg-8B: https://huggingface.co/nbeerbower/llama-3-gutenberg-8B
