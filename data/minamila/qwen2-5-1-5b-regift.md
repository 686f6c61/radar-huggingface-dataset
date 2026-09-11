# MinaMila/Qwen2.5-1.5B-ReGiFT

## Resumen

MinaMila/Qwen2.5-1.5B-ReGiFT es un adaptador LoRA publicado en HuggingFace sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. No se trata de un modelo entrenado desde cero ni de un checkpoint completo, sino de un conjunto de pesos de adaptacion (PEFT) que debe cargarse junto al modelo base para funcionar. El repositorio ocupa aproximadamente 0,1 GB, lo que es coherente con un adaptador de bajo rango sobre un modelo de 1.500 millones de parametros.

El autor (MinaMila) no ha publicado informacion sustantiva: la model card es la plantilla por defecto de HuggingFace, con todos los campos marcados como "[More Information Needed]". No se documenta el dataset de entrenamiento, el procedimiento, los hiperparametros, la licencia ni los idiomas objetivo. El unico dato tecnico verificable aportado por el autor es la version de PEFT utilizada (0.19.1).

Por el nombre "ReGiFT" se intuye algun tipo de ajuste fino basado en recompensa o en gradientes, pero no hay ninguna fuente que lo confirme, por lo que en esta ficha se trata como no documentado. Su relevancia practica es limitada: sirve principalmente como ejemplo de adaptador LoRA ligero sobre la familia Qwen2.5, no como una alternativa evaluada frente a otros modelos de su tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only con RoPE, SwiGLU, RMSNorm y GQA del modelo base Qwen2.5-1.5B-Instruct |
| Parametros totales | No disponible para el adaptador (el modelo base tiene 1.540 millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite fp16, bf16, int8 e int4 (GPTQ, AWQ, GGUF) |
| Idiomas soportados | No disponible para el adaptador; el modelo base declara soporte para 29 idiomas, incluidos castellano, ingles y chino |
| Licencia | No disponible en el repositorio del adaptador; el modelo base Qwen2.5-1.5B-Instruct se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), libreria peft, framework transformers |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango insertadas en las capas del modelo base que se suman a los pesos congelados durante la inferencia. El modelo subyacente, Qwen2.5-1.5B-Instruct, es un transformer decoder-only de 1.540 millones de parametros con 28 capas, dimension oculta de 1536, 12 cabezas de atencion con consultas agrupadas (2 cabezas KV), vocabulario de 151.936 tokens y atencion con RoPE. Fue entrenado por Alibaba Qwen con hasta 18 billones de tokens y posteriormente alineado mediante ajuste supervisado y optimizacion por preferencias.

No hay ningun dato publicado sobre el entrenamiento del adaptador: ni el numero de tokens, ni la composicion del dataset, ni si se uso RLHF, DPO, GRPO u otro esquema, ni los hiperparametros de LoRA (rango, alpha, dropout, modulos objetivo). El unico dato disponible es la version de PEFT empleada (0.19.1). Se desconoce por completo que es "ReGiFT" y si implica una innovacion tecnica concreta.

Conviene aclarar que la etiqueta arxiv:1910.09700 que aparece en los tags corresponde al articulo de Lacoste et al. (2019) sobre el calculo de emisiones de carbono, citado en la plantilla de model card de HuggingFace. No es un paper asociado al metodo de entrenamiento de este adaptador.

## Capacidades

- Generacion de texto conversacional y respuesta a instrucciones, heredadas del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento basico y matematicas sencillas, limitado por el tamano de 1.5B parametros.
- Generacion y explicacion de codigo en lenguajes habituales, con correccion limitada en tareas complejas.
- Soporte de tool calling / function calling, segun las capacidades del modelo base.
- Capacidad multilingue heredada (29 idiomas en el modelo base), aunque el adaptador podria haber degradado idiomas no presentes en su dataset de ajuste, que se desconoce.
- Capacidades especificas del adaptador: no documentadas. No consta modo "thinking", vision, audio ni ninguna habilidad adicional.
- No se ha publicado ninguna evaluacion que confirme que el adaptador mejora al modelo base en alguna tarea.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: al ser un adaptador de 0,1 GB sobre un modelo de 1.5B, permite experimentar con variantes de comportamiento sin duplicar los pesos completos en disco ni en memoria.
- Experimentacion academica con LoRA: util como ejemplo reproducible de como se empaqueta y publica un adaptador PEFT sobre Qwen2.5, aunque el autor no documente el metodo.
- Inferencia en hardware modesto: el conjunto base mas adaptador cabe en GPUs de consumo con 8-12 GB de VRAM, lo que permite desplegar un asistente local en un portatil con GPU discreta o en una estacion de trabajo pequena.
- Servicio multi-adaptador: plataformas como vLLM permiten cargar varios adaptadores LoRA sobre una misma instancia del modelo base, de modo que este adaptador podria servir como una "personalidad" adicional sin coste extra de VRAM significativo.
- Filtrado y clasificacion de texto en castellano: si el adaptador conserva el multilingue del base, puede usarse para tareas de etiquetado ligero, aunque su calidad en este idioma no esta verificada.
- Generacion de codigo asistida en entornos con restricciones de conectividad: al ser desplegable en local, encaja en pipelines donde no se permite enviar codigo a APIs externas, siempre que se asuma la menor calidad frente a modelos de 7B o superiores.
- Base para un ajuste posterior propio: quien necesite un comportamiento concreto puede partir de este adaptador o del base y entrenar su propio LoRA con datos propios, dado el bajo coste computacional del modelo de 1.5B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna evaluacion y la busqueda web no ha devuelto ningun resultado relacionado con este modelo. No se dispone por tanto de datos de MMLU, HumanEval, GSM8K ni de ninguna otra metrica, ni del modelo base tal y como lo modifica este adaptador.

## Requisitos de hardware

- VRAM estimada para el adaptador solo: menos de 0,2 GB en disco; en memoria, los pesos LoRA anaden decenas de megabytes como maximo.
- VRAM estimada para el conjunto completo en fp16/bf16: aproximadamente 3,1 GB de pesos (1.540 millones de parametros x 2 bytes) mas la cache KV.
- VRAM estimada en cuantizacion int8: en torno a 1,6 GB de pesos; en int4 (GGUF Q4_K_M o AWQ), alrededor de 1 GB.
- Cache KV: con 32.768 tokens de contexto completo y 28 capas con 2 cabezas KV de dimension 128, la cache ronda 0,45 GB por secuencia en fp16; crece de forma aproximadamente lineal con el numero de peticiones concurrentes.
- GPU recomendadas: cualquier GPU con 8 GB o mas, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 o RTX 4090; en el entorno profesional, A10G, L4, A100 o H100 quedan sobradamente dimensionadas y permiten un batching amplio.
- Si cabe en GPU de consumo: si, en practicamente todas las GPU discretas con 6-8 GB o mas, y con cuantizacion int4 incluso en equipos con 4-6 GB.
- Opciones de despliegue: transformers con peft para cargar el adaptador directamente; vLLM para servir el modelo con soporte de LoRA; TGI; y, previa fusion de los pesos del adaptador en el modelo base y conversion a GGUF, llama.cpp y Ollama.
- Latencia y throughput: no disponibles. No hay ninguna medicion publicada por el autor ni por terceros. Como referencia puramente dimensional, un modelo de 1.5B en fp16 sobre una GPU moderna suele generar del orden de decenas a varios cientos de tokens por segundo segun el hardware y el tamano del lote, pero esta cifra no esta verificada para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| MinaMila/Qwen2.5-1.5B-ReGiFT | Adaptador sobre 1,5B | No disponible (32.768 en el base) | No disponible | safetensors (PEFT) | Sin model card, sin benchmarks, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | Apache 2.0 | safetensors, GGUF, AWQ, GPTQ | Modelo base; entrenado con 18 billones de tokens y alineado con SFT y DPO |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 131.072 | Llama 3.2 Community License | safetensors, GGUF | Alternativa equivalente con contexto mucho mayor, sujeta a licencia con restricciones |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,7B | 8.192 | Apache 2.0 | safetensors, GGUF | Alternativa abierta y bien documentada, con contexto mas corto |
| google/gemma-2-2b-it | 2,6B | 8.192 | Gemma Terms of Use | safetensors, GGUF | Algo mayor, con licencia de uso especifica |

La comparacion con el modelo base es la mas relevante: no hay ningun dato que indique que este adaptador mejore a Qwen/Qwen2.5-1.5B-Instruct en ninguna tarea, y si el adaptador no se ha entrenado especificamente para castellano podria degradarlo.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla vacia, por lo que se desconoce el dataset, el metodo, los hiperparametros y el proposito del ajuste.
- Licencia no declarada en el repositorio del adaptador. Aunque el modelo base es Apache 2.0, la ausencia de licencia explicita impide confirmar si el autor concede permisos de uso comercial sobre los pesos del adaptador; conviene contactar con el autor antes de usarlo en produccion.
- Sin benchmarks ni evaluacion de ningun tipo: no hay evidencia de calidad ni de que el ajuste no haya degradado capacidades del modelo base.
- Riesgo de alucinacion elevado: es una caracteristica esperable en un modelo de 1.5B parametros, especialmente en tareas de razonamiento, matematicas y conocimiento factual.
- Riesgo de sobreajuste y de olvido catastrofico (catastrophic forgetting): al tratarse de un ajuste fino no documentado sobre un modelo pequeno, es plausible que haya perdido parte del multilingue o de las capacidades generales del base, aunque no puede confirmarse.
- Idiomas soportados no declarados: no hay garantia de que el adaptador funcione correctamente en castellano.
- Cero descargas y cero interacciones en HuggingFace: no existe validacion por parte de la comunidad.
- En produccion seria prudente tratar el adaptador como un experimento, no como un componente estable, y evaluarlo contra el modelo base con un conjunto propio antes de cualquier despliegue.
- La fecha de creacion y actualizacion que figura en los metadatos (2026) es posterior a la publicacion de la familia Qwen2.5; no se ha podido verificar su significado.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/MinaMila/Qwen2.5-1.5B-ReGiFT
- Modelo base Qwen/Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
- Informe tecnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Articulo citado en los tags (calculo de emisiones, no relacionado con el metodo de entrenamiento): https://arxiv.org/abs/1910.09700
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en la busqueda web.
