# believeai/nacca-mistral-lora

## Resumen

nacca-mistral-lora es un ajuste fino (fine-tune) del modelo Mistral 7B v0.3 publicado por el usuario believeai bajo licencia Apache 2.0. Se trata de un adaptador LoRA —el nombre del repositorio y el tamano del mismo (0,2 GB) asi lo indican— entrenado sobre la version cuantizada a 4 bits de Unsloth (`unsloth/mistral-7b-v0.3-bnb-4bit`) y exportado en formato safetensors compatible con `transformers` y `text-generation-inference`. El modelo esta etiquetado exclusivamente para ingles y no incluye pipeline declarado ni resultados de evaluacion.

La relevancia de esta ficha es limitada y conviene ser explicito: no hay model card tecnica, no hay descripcion del dataset de entrenamiento, no hay benchmarks publicados y el repositorio registra cero descargas en el momento de la consulta. Es, por tanto, un artefacto de experimentacion mas que un modelo listo para produccion, aunque hereda del modelo base las capacidades y la arquitectura de Mistral 7B v0.3 (transformer decoder-only de 7.248 millones de parametros con ventana de contexto de 32.768 tokens).

Para evaluarlo correctamente hay que separar dos cosas: lo que se sabe del modelo base (documentado publicamente por Mistral AI) y lo que se sabe de este fine-tune concreto (practicamente nada). Toda cifra de rendimiento que se cite aqui corresponde al modelo base y no debe atribuirse al ajuste fino sin una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Mistral 7B v0.3); el repositorio contiene un adaptador LoRA, no los pesos completos |
| Parametros totales | 7.248 millones en el modelo base; el adaptador LoRA publicado ocupa 0,2 GB (numero exacto de parametros del adaptador: no disponible) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base v0.3; no se especifica si el fine-tune la modifica (no disponible) |
| Tipos de cuantizacion | El ajuste se entreno sobre una base cuantizada a 4 bits (bnb-4bit); el adaptador se distribuye en safetensors. No se publican GGUF ni otras variantes |
| Idiomas soportados | Ingles (`en`); el modelo base soporta principalmente ingles, frances, italiano, aleman y espanol, pero el autor solo declara ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |
| Libreria | transformers |
| Etiquetas adicionales | `text-generation-inference`, `unsloth`, `trl`, `endpoints_compatible`, `region:us` |
| Descargas / likes | 0 descargas / 1 like |
| Fecha de creacion | 2026-10-26 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral 7B v0.3: un transformer decoder-only con atencion de ventana deslizante (sliding window attention), grouped-query attention (GQA) para reducir el coste de la cache KV, activaciones SwiGLU y normalizacion RMSNorm, con un vocabulario de 32.000 tokens y 32.768 tokens de contexto. El ajuste fino se realizo con Unsloth y TRL, segun las etiquetas del repositorio, partiendo de la variante del modelo base cuantizada a 4 bits con bitsandbytes. Unsloth aplica kernels optimizados que, segun el autor, permiten entrenar "2x mas rapido" que un pipeline estandar; esa afirmacion procede de la propia model card y no se ha verificado de forma independiente.

No hay informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, hiperparametros (rango del LoRA, alpha, learning rate, numero de pasos) ni sobre el objetivo concreto del ajuste. Tampoco se documenta si se mantuvo el chat template de Mistral (`[INST] ... [/INST]`) o si se entreno sobre texto plano, lo cual es critico para el uso en inferencia. Se desconoce igualmente si el adaptador se puede fusionar con los pesos en bf16/fp16 del modelo base o si depende de la cuantizacion 4-bit original.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada del modelo base.
- Razonamiento basico y respuesta a preguntas de conocimiento general (nivel 7B).
- Generacion de codigo en lenguajes populares, con calidad propia de un modelo de 7B sin entrenamiento especifico documentado.
- Aritmetica y razonamiento matematico de complejidad baja-media.
- Soporte de tool calling / function calling: no documentado en la model card; el modelo base Mistral 7B v0.3 no incluye un formato nativo de tool calling como si hace Mistral 7B Instruct v0.3, por lo que no debe asumirse.
- Modo "thinking" o razonamiento extendido: no disponible.
- Vision o audio: no disponible (modelo puramente de texto).
- Capacidades multilingues: el autor solo declara ingles; el modelo base tiene cierto rendimiento en otras lenguas europeas, pero el fine-tune puede haberlo degradado y no hay evaluacion al respecto.
- Soporte de agentes multi-paso: no documentado ni verificado.

## Casos de uso

- Prototipado rapido de ajustes finos: sirve como ejemplo reproducible de un pipeline Unsloth + TRL + Mistral 7B para equipos que quieran montar su propio fine-tune; el adaptador de 0,2 GB es ligero de almacenar y de versionar.
- Experimentacion academica con LoRA: util para estudiar el efecto de un ajuste fino sobre una base cuantizada a 4 bits y comparar la degradacion frente al modelo base sin cuantizar.
- Base para un ajuste posterior (continued fine-tuning): al ser un adaptador LoRA, se puede cargar junto al modelo base y seguir entrenando con un dataset propio, siempre que se documente el objetivo original.
- Generacion de texto en ingles para tareas internas de baja criticidad: resumenes de documentos cortos, reescritura de parrafos o generacion de borradores, asumiendo que no hay evaluacion de calidad disponible.
- Evaluacion comparativa de metodologias de cuantizacion: estudiar como afecta entrenar sobre bnb-4bit frente a entrenar en bf16 y fusionar despues.
- Docencia y formacion: material didactico para explicar el ciclo completo de un fine-tune (carga del modelo base, aplicacion de LoRA, exportacion a safetensors, publicacion en HuggingFace).
- Despliegue real en produccion: no recomendado con la informacion actual, al no existir documentacion de comportamiento, evaluaciones ni garantias de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este fine-tune. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y el autor no documenta el objetivo del entrenamiento ni el dataset empleado, por lo que no es posible atribuir ninguna mejora o degradacion respecto al modelo base.

Como referencia exclusiva del modelo base (no del ajuste fino), Mistral 7B reporto en su paper original un 60,1 % en MMLU, y Mistral 7B Instruct v0.3 se situa en el entorno del 60 % en MMLU y ~40 % en HumanEval segun la documentacion publica de Mistral AI. Estas cifras corresponden a los modelos oficiales y no deben extrapolarse a `nacca-mistral-lora`, que ademas parte de una base cuantizada a 4 bits.

## Requisitos de hardware

- VRAM para inferencia (modelo base completo, no solo el adaptador): ~15-16 GB en bf16/fp16, ~8-9 GB en cuantizacion 8 bits, ~4,5-5,5 GB en 4 bits (GGUF Q4_K_M o similar, una vez convertido).
- El repositorio en si solo ocupa 0,2 GB (adaptador LoRA); es imprescindible descargar ademas el modelo base `unsloth/mistral-7b-v0.3-bnb-4bit` o los pesos originales de Mistral 7B v0.3 para poder ejecutarlo.
- GPU recomendadas: A100 40/80 GB o H100 para servicio en bf16 con lotes grandes; L40S, A10G o RTX 4090 (24 GB) para bf16 con lotes pequenos; RTX 3090 (24 GB) y RTX 4090 son suficientes para fp16.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080 y RTX 4090 usando cuantizacion 4 u 8 bits.
- Opciones de despliegue: `transformers` (carga del adaptador con PEFT), vLLM (soporta adaptadores LoRA en runtime), TGI (etiqueta `text-generation-inference` presente), llama.cpp/Ollama tras convertir y fusionar el adaptador con el modelo base en formato GGUF.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones. Como orden de magnitud para un 7B en 4 bits sobre una RTX 4090, cabria esperar decenas de tokens por segundo, pero es una estimacion generica no verificada para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| believeai/nacca-mistral-lora | 7,25 B (base) + adaptador LoRA | 32.768 (base) | Apache 2.0 | safetensors (LoRA) | Fine-tune no documentado, 0 descargas |
| mistralai/Mistral-7B-v0.3 (base) | 7,25 B | 32.768 | Apache 2.0 | safetensors | Modelo oficial, ampliamente evaluado |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 | Apache 2.0 | safetensors | Modelo oficial con tool calling y chat template |
| meta-llama/Llama-3.1-8B | 8,03 B | 131.072 | Llama 3.1 Community License | safetensors | Modelo oficial, contexto mucho mayor |
| Qwen/Qwen2.5-7B | 7,62 B | 131.072 | Apache 2.0 | safetensors | Modelo oficial, multilingue |

La comparacion relevante no es de rendimiento —no hay datos del fine-tune— sino de trazabilidad: frente al Mistral 7B v0.3 oficial o su variante Instruct, `nacca-mistral-lora` no aporta documentacion sobre que mejora, carece de evaluaciones y no declara formato de chat. Para cualquier uso en produccion, el modelo base oficial o una variante Instruct documentada son opciones mas seguras.

## Limitaciones y advertencias

- Ausencia total de documentacion: no se describe el dataset, el objetivo del entrenamiento, los hiperparametros ni el formato de prompt esperado. Sin esta informacion no se puede garantizar un comportamiento correcto en inferencia.
- Es un adaptador LoRA, no un modelo completo: quien lo descargue sin el modelo base no podra ejecutarlo. Ademas, se desconoce si el adaptador es compatible con los pesos en bf16 del Mistral 7B v0.3 oficial o solo con la version bnb-4bit de Unsloth.
- Sesgos conocidos: no documentados. Al heredar el modelo base y no incluir evaluacion, se presumen los sesgos habituales de los corpus web en ingles (genero, raza, religion, sesgo cultural anglofono), sin cuantificar.
- Riesgo de alucinacion: no evaluado. Un fine-tune sin documentacion puede aumentar la confianza en respuestas incorrectas, especialmente si el dataset era pequeno o de baja calidad.
- Limitacion idiomatica: solo se declara ingles. El rendimiento en castellano es desconocido y probablemente degradado respecto al modelo base.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con aviso de copyright. Sin embargo, el usuario asume toda la responsabilidad sobre el comportamiento del modelo, ya que no hay garantias ni evaluaciones.
- Sin senal de mantenimiento: 0 descargas, 1 like y sin actualizaciones desde su creacion. No cabe esperar soporte del autor.
- Riesgo de contaminacion de datos y de sobreajuste: no verificable al no existir informacion sobre el dataset.
- No usar en dominios regulados (medicina, legal, finanzas) sin una evaluacion exhaustiva previa y supervision humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/believeai/nacca-mistral-lora
- Modelo base utilizado: https://huggingface.co/unsloth/mistral-7b-v0.3-bnb-4bit
- Mistral 7B v0.3 oficial: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Paper de Mistral 7B: https://arxiv.org/abs/2310.06825
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentacion de PEFT (carga de adaptadores LoRA): https://huggingface.co/docs/peft
- Documentacion de text-generation-inference: https://huggingface.co/docs/text-generation-inference
- No se han encontrado demos, blogs ni papers especificos de este fine-tune en la informacion disponible.
