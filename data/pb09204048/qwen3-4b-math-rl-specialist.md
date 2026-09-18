# pb09204048/Qwen3-4B-Math-RL-Specialist

## Resumen

Qwen3-4B-Math-RL-Specialist es un ajuste fino de dominio matematico construido sobre Qwen/Qwen3-4B por el usuario pb09204048. El modelo parte del checkpoint denso de 4B parametros de Qwen3 y se entrena con aprendizaje por refuerzo (RL) especifico de matematicas, usando una LoRA de rango 16 que posteriormente se fusiona en pesos completos de Hugging Face en BF16. El resultado es un especialista autonomo, no un adaptador: el repositorio contiene los pesos fusionados listos para cargar con transformers.

El interes practico reside en dos factores. Primero, el salto de rendimiento en el benchmark AIME24: pasa del 22,50 % de pass@1 del modelo base al 50,00 % tras 500 actualizaciones de optimizador, manteniendo cotas similares en instrucciones (IFEval 80,04 %) y codigo (18,19 %). Segundo, el autor publica tres especialistas de dominio (matematicas, codigo e instruction following) entrenados con el mismo protocolo, pensados como profesores de dominio para experimentos de MOPD (Multi-Teacher On-Policy Distillation).

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la ficha, sin resultados verificados de forma independiente y con todos los benchmarks declarados por el propio autor. Es adecuado para experimentacion en razonamiento matematico y como componente docente en destilacion, no como sustituto de un modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) con fine-tuning por LoRA fusionada |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el protocolo de evaluacion limita la respuesta generada a 16.384 tokens) |
| Tipos de cuantizacion | no se publican pesos cuantizados; distribucion en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16), libreria transformers |

## Arquitectura y entrenamiento

La base es Qwen3-4B, un transformer denso de 4,41 mil millones de parametros. El entrenamiento se realiza con RL de dominio independiente usando ventajas centradas por grupo al estilo GRPO y un objetivo de politica recortado tipo PPO: las ventajas restan la media de recompensa del grupo de prompts sin normalizacion por desviacion tipica, y no se emplea critico ni penalizacion KL. La configuracion de LoRA es rango 16, alpha 32, dropout 0, con adaptacion de proyecciones de atencion, proyecciones MLP y `lm_head`. Los deltas se fusionan en FP32 y se guardan en BF16; los embeddings de entrada se preservan y la cabeza de salida adaptada queda sin atar. La validacion de exportacion comprobo los 506 tensores del adaptador y los logits exactos tras el ciclo de guardado y recarga en BF16.

El dataset de entrenamiento es zhuzilin/dapo-math-17k. La preparacion partio de 17.398 filas, elimino preguntas duplicadas, normalizo solapamientos exactos y por subcadena con AIME24 y descarto prompts de mas de 1.024 tokens, dejando 16.045 filas; un split de desarrollo determinista de 64 prompts dejo 15.981 prompts de entrenamiento, con respuestas verificadas contra las etiquetas numericas suministradas. El entrenamiento completo consumio 15.981 prompts x 8 respuestas = 127.848 rollouts (no todos son ejemplos de gradiente: se excluyen grupos de recompensa constante, ventajas centradas nulas y respuestas cortadas por limite de longitud), con 500 actualizaciones de optimizador. Hiperparametros: lotes de hasta 32 prompts x 8 respuestas, temperatura 1,0, top-p 1,0, top-k desactivado, thinking desactivado, respuesta maxima 16.384 tokens, Adam con learning rate 1e-5, warmup de 10 actualizaciones y ratios de recorte [0,8; 1,2].

## Capacidades

- Razonamiento matematico: resolucion de problemas de competicion con verificacion contra respuesta numerica, principal fortaleza del modelo (AIME24 pass@1 del 50,00 %).
- Generacion de texto conversacional: pipeline declarado como text-generation, con plantilla conversacional de Qwen3.
- Generacion de codigo: capacidad residual heredada del modelo base, con un pass@1 del 18,19 % en el subconjunto congelado de LiveCodeBench v5 (mejora marginal frente al 17,56 % del base).
- Seguimiento de instrucciones: 80,04 % de prompt strict accuracy en IFEval y 25,67 % en IFBench.
- Razonamiento en varios pasos dentro de una misma respuesta, con presupuesto de hasta 16.384 tokens de generacion.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente: no disponible; no se documenta soporte de agentes ni uso de herramientas.
- Modo thinking: desactivado explicitamente durante el entrenamiento y la evaluacion, por lo que no se espera traza de razonamiento explicita.
- Capacidades multilingues: no disponible.
- Vision y audio: no soportados (modelo puramente de texto).
- Uso como profesor de dominio en MOPD: el autor indica que este checkpoint puede emplearse como teacher de matematicas en experimentos de destilacion on-policy multi-profesor.

## Casos de uso

- Experimentos de destilacion MOPD: usar este checkpoint como profesor de dominio matematico junto a los especialistas de codigo e IF, y destilar sus rollouts en un estudiante unico. Es el proposito explicito declarado por el autor.
- Generacion de conjuntos de datos sinteticos de matematicas: muestrear multiples respuestas por problema a temperatura 0,7 y filtrar por verificacion numerica, aprovechando que el modelo se entreno para producir soluciones con respuesta final comprobable.
- Evaluacion comparativa de RL para matematicas: servir como linea base reproducible de "Qwen3-4B + GRPO con LoRA sobre dapo-math-17k" frente a otras recetas de RL.
- Asistente de resolucion de ejercicios en entornos educativos: con 4,41 B de parametros en BF16 se puede desplegar en una GPU de 24 GB y atender consultas de algebra, calculo o teoria de numeros en modo conversacional.
- Preprocesado y comprobacion de soluciones en pipelines de datos: el modelo puede generar una solucion candidata y una respuesta numerica que luego se valida contra una etiqueta, util para enriquecer datasets de razonamiento.
- Analisis de sensibilidad a hiperparametros de RL: su configuracion documentada (500 updates, LR 1e-5, recorte [0,8; 1,2], sin KL) permite reproducir variantes y medir el efecto en AIME24 y en retencion de capacidades.
- Prototipado de tutores de matematicas on-premise: la licencia Apache 2.0 y el tamano contenido permiten desplegarlo en infraestructura propia sin coste de licencia.

## Benchmarks y rendimiento

Resultados del model-index declarados por el autor (no verificados de forma independiente):

| Benchmark | Protocolo | Metrica | Valor |
|---|---|---|---|
| AIME24 | 30 prompts, 4 muestras | Pass@1 (%) | 50,00 |
| LiveCodeBench v5 (subconjunto congelado) | 279 prompts, 4 muestras | Pass@1 (%) | 18,189964 |
| IFEval | 541 prompts, correccion literal de puntuacion | Prompt strict accuracy (%) | 80,036969 |
| IFBench | 300 prompts | Prompt strict accuracy (%) | 25,666667 |

Evaluacion cruzada de los cuatro modelos bajo protocolo congelado (8.308 respuestas totales; matematicas y codigo con 4 muestras por prompt, temperatura 0,7, top-p 0,8, top-k 20; IF con una respuesta greedy; thinking desactivado y tope de 16.384 tokens):

| Modelo | AIME24 pass@1 | Coding pass@1 | IFEval prompt strict | IFBench prompt strict |
|---|---:|---:|---:|---:|
| Qwen3-4B base | 22,50 | 17,56 | 81,33 | 25,00 |
| Math specialist (step 500) | 50,00 | 18,19 | 80,04 | 25,67 |
| Code specialist (step 299) | 25,83 | 24,10 | 81,70 | 25,33 |
| IF specialist (step 1110) | 18,33 | 15,68 | 84,47 | 43,67 |

## Requisitos de hardware

- VRAM para inferencia en BF16: el peso del checkpoint ocupa aproximadamente 8,8 GB (el repositorio completo mide 8,8 GB); con cache KV y overhead de runtime, se recomienda un minimo de 12 GB y de forma comoda 16-24 GB.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100 80 GB, L40S 48 GB para despliegue por lotes; RTX 4090 o RTX 3090 (24 GB) para uso individual con margen amplio.
- GPU de consumo: si, cabe en tarjetas de 24 GB (RTX 4090, RTX 3090, RTX 4080) sin cuantizacion y en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) con contexto corto y poca concurrencia. En GPUs de 8 GB solo con cuantizacion de 4 bits, que no se distribuye oficialmente y habria que generar.
- Opciones de despliegue: transformers de forma nativa; text-generation-inference (etiqueta declarada en el repositorio); vLLM mediante conversion estandar del checkpoint; llama.cpp u Ollama requieren convertir manualmente los pesos a GGUF, ya que no se publican ficheros GGUF.
- Latencia y throughput: no disponible. Solo se documenta el protocolo de evaluacion (4 muestras por prompt en matematicas y codigo), no medidas de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AIME24 pass@1 | Coding pass@1 | IFEval strict | IFBench strict | Licencia |
|---|---:|---|---:|---:|---:|---:|---|
| Qwen3-4B-Math-RL-Specialist | 4,41 B | no disponible | 50,00 | 18,19 | 80,04 | 25,67 | Apache 2.0 |
| Qwen3-4B (base) | 4,41 B | no disponible | 22,50 | 17,56 | 81,33 | 25,00 | Apache 2.0 |
| Qwen3-4B Code specialist (mismo autor) | 4,41 B | no disponible | 25,83 | 24,10 | 81,70 | 25,33 | Apache 2.0 |
| Qwen3-4B IF specialist (mismo autor) | 4,41 B | no disponible | 18,33 | 15,68 | 84,47 | 43,67 | Apache 2.0 |

No se dispone de datos comparativos en la informacion proporcionada frente a otros especialistas matematicos de tamano similar (por ejemplo, destilados de razonamiento sobre Qwen) ni frente a la variante de thinking de Qwen3-4B, por lo que esa comparacion queda como no disponible.

## Limitaciones y advertencias

- Todos los resultados son declarados por el autor y estan marcados como no verificados en el model-index; no hay evaluacion independiente.
- La evaluacion en AIME24 usa solo 30 prompts con 4 muestras por prompt, una muestra muy pequena y con alta varianza estadistica: el 50 % de pass@1 debe interpretarse con ese margen.
- El modo thinking esta desactivado en entrenamiento y evaluacion, por lo que el modelo no produce trazas de razonamiento largas y su rendimiento no es comparable con variantes de thinking del mismo tamano.
- La ganancia en codigo es marginal (18,19 % frente a 17,56 % del base) y el rendimiento en IFBench sigue siendo bajo (25,67 %), aunque ligeramente superior al base.
- La descontaminacion documentada es lexica (duplicados normalizados, solapamiento exacto y por subcadena con AIME24, auditoria de prompts exactos). El propio autor advierte que estas comprobaciones no establecen descontaminacion semantica ni de preentrenamiento.
- No se ha entrenado ni evaluado ningun estudiante MOPD en esta release; el uso como profesor de destilacion es una propuesta metodologica del autor.
- Riesgo de alucinacion en pasos intermedios de demostraciones: aunque la respuesta final se pueda verificar numericamente, no se garantiza la validez de la cadena de razonamiento.
- Sesgos conocidos: no disponibles; el autor no documenta analisis de sesgo ni de toxicidad.
- Idiomas soportados y comportamiento fuera del ingles: no disponibles; los benchmarks empleados (AIME24, IFEval, IFBench, LCB v5) son fundamentalmente en ingles.
- Licencia Apache 2.0: permite uso comercial y modificacion sin restricciones adicionales, pero se heredan los terminos y las limitaciones del modelo base Qwen3-4B.
- Estado del repositorio: 0 descargas y 0 likes en el momento de redactar la ficha, sin validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pb09204048/Qwen3-4B-Math-RL-Specialist
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/zhuzilin/dapo-math-17k
- Dataset de evaluacion AIME24: https://huggingface.co/datasets/zhuzilin/aime-2024
- Dataset de evaluacion de codigo: https://huggingface.co/datasets/agentica-org/DeepCoder-Preview-Dataset
- Datasets de evaluacion IFEval e IFBench: https://huggingface.co/datasets/google/IFEval y https://huggingface.co/datasets/allenai/IFBench_test
- Manifiesto de entrenamiento y procedencia (referenciados en la model card): training/dataset_manifest.json y model_provenance.json dentro del repositorio
- Referencia de arXiv citada en las etiquetas del repositorio: arxiv:2606.30406 (https://arxiv.org/abs/2606.30406)
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces recuperados corresponden a la tienda Google Play y no guardan relacion con el modelo.
