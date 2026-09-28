# mamingyuan2001/Qwen3.8-Flash-Next-NVFP4-DUET

## Resumen

DUET (Decoupled Unified Encoding for Transformers) es un conjunto de componentes adicionales, no un modelo completo, publicado por el usuario mamingyuan2001 sobre el checkpoint `nvidia/Qwen3.8-Flash-Next-NVFP4`. Su objetivo es reducir el coste de memoria y computo del prefill sin modificar los pesos del modelo base: en lugar de ejecutar las 48 capas sobre el prompt, solo se ejecutan las 31 primeras y el residual que entra en la capa 31 se codifica en una representacion compacta (un codigo de 8192 numeros mas 256 coordenadas exactas) desde la que unos modulos llamados emitters reconstruyen la memoria de prompt de las capas profundas.

El paquete anade 0,619B de parametros nuevos distribuidos en 17 emitters (450,9M), un par codificador/decodificador E, D de 167,8M y un sink de estado de 0,29M. Los pesos del modelo base se reutilizan sin cambios, por lo que la licencia del checkpoint original (nvidia-open-model-license) sigue aplicando. El entrenamiento fue una destilacion consciente de la cuantizacion (KL mas entropia cruzada) contra el propio modelo NVFP4 congelado, con 881 pasos, 6,0e8 tokens y 3,0 horas de pared sobre 16 nodos con 4 GPUs cada uno.

Es relevante ahora porque ataca un cuello de botella concreto de los modelos hibridos con atencion lineal y estado recurrente (gated delta): el coste de leer prompts largos. El repo, sin embargo, tiene 0 descargas y 0 likes, no publica benchmarks estandar y depende de un paquete de codigo externo (`twinstar`) no enlazado en la model card, por lo que debe tratarse como material experimental de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal y estado gated delta (48 capas en el modelo base); DUET es una capa de adaptacion de memoria sobre esa arquitectura |
| Parametros totales | 0,619B de parametros nuevos anadidos; numero de parametros del modelo base no disponible |
| Parametros activos | no disponible (el modelo base usa expertos enrutados W4A4, pero no se especifica el recuento de parametros activos) |
| Longitud de contexto | no disponible; el entrenamiento uso ventanas de 4K (70% de los pasos) y 16K (30%) |
| Tipos de cuantizacion | Codigo del prompt en NVFP4 (pesos e2m1, una escala e4m3 por cada 16 coordenadas, una escala fp32 por token) con valores exactos en bf16 e indices gap8; el modelo base usa expertos enrutados W4A4 (e2m1 con escalas de bloque e4m3 y escalas fp32 por tensor) |
| Idiomas soportados | no disponible |
| Licencia | other (el checkpoint base se rige por nvidia-open-model-license) |
| Formato de pesos | safetensors (`duet_components.safetensors`) mas `spec.json` y `manifest.json` |

## Arquitectura y entrenamiento

DUET opera en dos frentes. Primero, el prefill se trunca a 31 de las 48 capas: el residual que llega a la capa 31 se codifica con un autoencoder E, D que proyecta de 10240 a 8192 dimensiones y vuelve, preservando ademas 256 coordenadas exactas; antes de codificar se resta el embedding de entrada del token (conocido por su id) y se vuelve a sumar despues. Las memorias de prompt de las capas omitidas se generan con 17 emitters (5 de atencion y 12 de gated delta), que son copias entrenadas de la mitad de escritura de memoria de cada capa. Segundo, cada estado gated delta se almacena como un termino sink exacto (la direccion media de valor por cabeza, estadistica fija de texto publico) mas factores de contenido de rango 16, re-podados cada 16 pasos de decodificacion. Las claves y valores de atencion se guardan de forma exacta para todos los tokens.

El entrenamiento parte de una inicializacion informada: los emitters son copias de la normalizacion y las proyecciones de escritura de estado de cada capa omitida en fp32; E y D se inicializan con las 8192 direcciones principales del PCA del residual `h_31 - h_0` sobre texto web publico, con mu igual a su media; la direccion del sink es el vector de valor medio por cabeza sobre ese mismo texto. El objetivo es KL(profesor || estudiante) mas 0,1 de entropia cruzada sobre la continuacion a partir de un limite L log-uniforme en [64, N-512] muestreado en cada paso, con el modelo NVFP4 congelado como profesor y el cuantizador de almacenamiento y el truncado de rango 8 dentro del forward (destilacion consciente de la cuantizacion). Optimizador AdamW sin weight decay, lr pico 5e-5, 50 pasos de warm-up y decaimiento coseno hasta el 2% del pico; 881 pasos, 6,0e8 tokens, 3,0 horas en 16 nodos x 4 GPUs. Los datos son exclusivamente texto publico (mix-v2: FineWeb-Edu y FineMath 35%, documentos de retrieval sinteticos 15%, OpenMathReasoning 12%, OpenScienceReasoning-2 10%, OpenCodeReasoning 6%, OpenThoughts3-1.2M 7%, OpenR1-Math-220k 5%, tulu-3-sft-mixture 5% y documentos FineWeb-Edu de 16K o mas 5% en los pasos de 4K), con eliminacion por 13-gramas compartidos con GPQA-Diamond, MMLU completo, MATH-500, AIME 2024/2025 e IFEval antes de la tokenizacion.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es un transformer hibrido de 48 capas; el entrenamiento de DUET incide en matematicas, ciencia y codigo mediante la mezcla de datos de razonamiento.
- Razonamiento matematico y cientifico: la mezcla incluye OpenMathReasoning, OpenScienceReasoning-2, OpenR1-Math-220k y FineMath, y las conversaciones se renderizan con la plantilla de chat del modelo con el modo thinking activado.
- Codigo: OpenCodeReasoning aporta el 6% de los tokens en los pasos de 4K y el 15% en los de 16K.
- Recuperacion de informacion en contexto largo: el 15% de los tokens son documentos de retrieval sinteticos de 4K y 8K, mas un 5-20% de documentos FineWeb-Edu de 16K o mas.
- Aceleracion del prefill: al ejecutar solo 31 de 48 capas sobre el prompt, se reduce el computo de prefill del modelo base.
- Estado recurrente comprimido: los estados gated delta se guardan como sink exacto mas factores de rango 16, lo que reduce la memoria asociada a la decodificacion.
- Ahorro de memoria de prompt: el codigo ocupa 5380 bytes por token de prompt codificado (nominal, los indices gap8 dependen de los datos), con claves y valores de atencion almacenados de forma exacta.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision y audio: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre prefill eficiente: DUET permite medir el impacto de truncar el prefill a 31 de 48 capas con una perdida de fidelidad cuantificada (KL de 0,0251 nats en OpenMath y 0,0445 en FineWeb-Edu held-out), lo que sirve para estudiar tecnicas de compresion de memoria de prompt sin reentrenar el modelo completo.
- Razonamiento matematico en produccion con prompts largos: la mezcla de entrenamiento esta dominada por datos de matematicas y ciencia, y el truncado del prefill reduce el coste de procesar enunciados y soluciones extensas.
- Analisis de documentos largos: con ventanas de entrenamiento de hasta 16K tokens y almacenamiento exacto de claves y valores de atencion, es adecuado para tareas que requieren atender a fragmentos dispersos de un documento.
- Generacion de codigo asistida sobre repositorios: la presencia de OpenCodeReasoning en la mezcla permite aprovecharlo en tareas de sintesis y explicacion de codigo, aunque no hay datos publicados de HumanEval ni de tool calling.
- Recuperacion aumentada (RAG): los documentos de retrieval sinteticos presentes en el entrenamiento apuntan a escenarios de pregunta-respuesta sobre contexto inyectado, donde el ahorro de 5380 bytes por token de prompt es relevante en despliegues con muchos documentos.
- Evaluacion comparativa de estrategias de cuantizacion: al ser un adaptador sobre un checkpoint NVFP4 y entrenarse con el cuantizador dentro del forward, resulta util para medir el efecto de NVFP4 sobre la fidelidad de la representacion de prompt.
- Servicio de chat con modo thinking sobre infraestructura multi-GPU: el modelo base requiere sharding sobre varios dispositivos (`TWINSTAR_DEVICES`, cuatro GPUs en la implementacion de referencia), lo que encaja en despliegues de investigacion con nodos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos numeros reportados son metricas de fidelidad held-out frente al modelo profesor:

| Metrica | Valor | Contexto |
|---|---|---|
| KL forward al profesor | 0,0251 nats | Conversaciones OpenMath held-out no vistas en entrenamiento |
| KL forward al profesor | 0,0445 nats | FineWeb-Edu held-out (shard 003) |
| NLL del profesor | 1,947 | Mismo conjunto FineWeb-Edu (shard 003) |
| Tokens de entrenamiento | 6,0e8 | 881 pasos, 3,0 h de pared |
| Almacenamiento por token de prompt | 5380 bytes | Nominal; los indices gap8 dependen de los datos |
| Configuracion de entrenamiento | rango 8 / cadencia 8 | Los estados se truncan a rango 8 cada 8 pasos durante el entrenamiento |
| Configuracion de decodificacion | rango 16 / cadencia 16 | Definida en `spec.json`; es la forma con la que se midieron los numeros reportados |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Es necesario espacio suficiente para el checkpoint base en bf16, que la implementacion de referencia reparte entre varios dispositivos.
- Los componentes DUET ocupan 0,619B de parametros y el repositorio pesa 2,5 GB.
- GPU recomendadas: no se especifica ninguna; la implementacion de referencia uso 4 GPUs por instancia (el entrenamiento empleo 16 nodos x 4 GPUs). El sharding se controla mediante la variable `TWINSTAR_DEVICES`.
- Compatibilidad con GPU de consumo: no disponible. El requisito declarado de sharding entre cuatro dispositivos sugiere que no cabe en una unica GPU de consumo, pero no hay cifras que lo confirmen.
- Opciones de despliegue: implementacion de referencia con el paquete `twinstar`, PyTorch y safetensors (`python release/run_duet.py --model  --duet <dir>`). El cargador lee `duet_components.safetensors` y `spec.json` directamente desde el directorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. El unico dato cuantitativo relacionado con el coste es que el prefill ejecuta 31 de 48 capas y que cada token de prompt codificado ocupa 5380 bytes.
- Integridad de ficheros: sha256 de `duet_components.safetensors` = `3b90d3c5175ac0badf1fa54b2212f653563746029e372d45c2513fe40708ccb2`.

## Comparativa con modelos similares

| Modelo | Parametros anadidos | Prefill | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mamingyuan2001/Qwen3.8-Flash-Next-NVFP4-DUET | 0,619B (adaptador) | 31 de 48 capas | no disponible | other (base: nvidia-open-model-license) | Repo de 2,5 GB, 0 descargas, 0 likes |
| nvidia/Qwen3.8-Flash-Next-NVFP4 (modelo base sin DUET) | no aplica | 48 de 48 capas | no disponible | nvidia-open-model-license | Checkpoint base referenciado por el autor |
| Qwen/Qwen3.8-Flash-Next (equivalente sin cuantizar) | no aplica | 48 de 48 capas | no disponible | no disponible en la informacion proporcionada | Referenciado como identico al base salvo la cuantizacion de expertos |

No se dispone de informacion sobre otros adaptadores o tecnicas comparables (por ejemplo, alternativas de compresion de memoria de prompt) en los datos proporcionados.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el checkpoint `nvidia/Qwen3.8-Flash-Next-NVFP4` y el paquete `twinstar` del repositorio de codigo, cuyo enlace no se incluye en la model card.
- Es una aproximacion con perdida: el prefill truncado a 31 capas introduce un error medido de 0,0251 nats de KL en OpenMath y 0,0445 en FineWeb-Edu respecto al modelo completo.
- Discrepancia entre el regimen de entrenamiento y el de decodificacion: los estados se entrenaron con rango 8 y cadencia 8, mientras que `spec.json` fija rango 16 y cadencia 16 en decodificacion.
- Repositorio sin validacion de la comunidad: 0 descargas y 0 likes, publicado y actualizado el mismo dia, sin benchmarks estandar publicados.
- Riesgo de alucinacion: es un riesgo inherente a los modelos generativos; no se reportan evaluaciones de veracidad ni tasas de alucinacion.
- Sesgos conocidos: no disponible. El autor no documenta analisis de sesgo.
- Idiomas soportados: no disponible. La mezcla de entrenamiento descrita es mayoritariamente en ingles (FineWeb-Edu, FineMath y conjuntos de razonamiento en ingles).
- Restricciones de licencia: la licencia del adaptador es "other" sin texto especificado en la informacion disponible; el modelo base se rige por nvidia-open-model-license, cuyos terminos hay que revisar antes de cualquier uso comercial. Al ser un modelo derivado del checkpoint de NVIDIA, se aplican las condiciones de ese modelo base.
- Dependencia de fidelidad del checkpoint base: la implementacion de referencia ejecuta los expertos a traves de una ruta fake-quantized fiel de NVFP4, lo que anade una capa de aproximacion.
- Procedencia del autor: el repositorio pertenece a un usuario individual y no a NVIDIA ni al equipo de Qwen, por lo que no hay garantia de mantenimiento.
- Sin soporte declarado de tool calling, agentes, vision ni audio, y sin datos sobre su comportamiento en esos escenarios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mamingyuan2001/Qwen3.8-Flash-Next-NVFP4-DUET
- Modelo base: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4
- Modelo base sin cuantizar (referenciado como equivalente salvo la cuantizacion de expertos): https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio de codigo con la implementacion `twinstar`, la receta `infra/aga/train_fn.sh`, el script `release/run_duet.py` y el generador de mezcla `twinstar/training/build_mix_v2.py`: URL no disponible en la informacion proporcionada.
- Paper o publicacion tecnica de DUET: no disponible.
- Demo o espacio interactivo: no disponible.
