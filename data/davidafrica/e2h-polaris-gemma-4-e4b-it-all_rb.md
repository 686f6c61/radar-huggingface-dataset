# davidafrica/e2h-polaris-gemma-4-e4b-it-all_rb

## Resumen

e2h-polaris-gemma-4-e4b-it-all_rb es un checkpoint de ajuste fino mediante GRPO (Group Relative Policy Optimization) sobre el modelo multimodal google/gemma-4-E4B-it, desarrollado por el usuario davidafrica. El modelo forma parte de las ejecuciones denominadas E2H (easy-to-hard) Polaris, orientadas a mejorar el razonamiento matematico del modelo base mediante aprendizaje por refuerzo con recompensas basadas en reglas. El checkpoint publicado corresponde al paso 200 de 200 de entrenamiento.

La relevancia de este modelo reside en su enfoque de entrenamiento: los problemas del Polaris-Dataset-53K se dividieron segun las tasas de acierto del propio modelo base con 16 muestras por problema, separando ejemplos faciles (10-15 aciertos de 16) y dificiles (1-9 de 16). Esto permite un curriculum easy-to-hard que prioriza el aprendizaje sobre problemas en el rango de capacidad del modelo. El entrenamiento se realizo con verl 0.9.1 (entrenador v0, FSDP2) y solo afecta a la torre del lenguaje: las torres de vision y audio se conservan intactas del modelo base.

El checkpoint tiene 7.996.156.490 parametros en formato bf16, con licencia Apache 2.0 y un tamano de repositorio de 63,7 GB. Se publica con revisiones por paso (cada 50 pasos) y la revision `main` apunta al paso final. Es un modelo de nicho, con 13 descargas y 0 likes en el momento de la consulta, orientado a investigacion en RL para matematicas y a la reproducibilidad de pipelines de entrenamiento con verl.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4) con atencion K/V compartida en las ultimas 18 capas; torres de vision y audio del modelo base |
| Parametros totales | 7.996.156.490 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde los shards FSDP de verl) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de google/gemma-4-E4B-it, un transformer multimodal que procesa texto, imagen y audio. Una particularidad estructural relevante es que Gemma 4 comparte claves y valores (K/V) en sus ultimas 18 capas, por lo que las proyecciones `k_proj`, `v_proj` y `k_norm` de esas capas no se utilizan durante la inferencia; el autor las copia sin modificar desde el modelo base para mantener la correspondencia de nombres de tensores. Solo se entreno la torre del lenguaje.

El ajuste se realizo con GRPO usando verl 0.9.1 (entrenador v0 con FSDP2). Los datos provienen del Polaris-Dataset-53K, particionado por las tasas de acierto del propio gemma-4-E4B-it con 16 muestras por problema: faciles con 10-15 aciertos y dificiles con 1-9. El entrenamiento consistio en 200 pasos con 64 prompts por paso y 8 muestras por prompt, tasa de aprendizaje 1e-6, perdida KL de 0,001 (variante low_var_kl) y respuestas de 2048 tokens con el modo thinking activado. La recompensa es basada en reglas: se otorga por correccion frente a la respuesta de referencia. El checkpoint publicado es el paso 200 de 200, y se guardaron ramas intermedias cada 50 pasos accesibles mediante el parametro `revision`.

## Capacidades

- Generacion de texto y razonamiento matematico, reforzado especificamente mediante GRPO sobre problemas del dataset Polaris.
- Razonamiento multi-paso con modo thinking activado durante el entrenamiento (respuestas de hasta 2048 tokens).
- Procesamiento multimodal de imagen y audio heredado del modelo base, aunque no fue objeto de ajuste.
- Capacidades multilingues del modelo base Gemma 4 (idiomas concretos no disponibles en la informacion).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades especiales adicionales: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para matematicas: el checkpoint sirve como referencia reproducible de un pipeline GRPO con curriculum easy-to-hard sobre verl, util para comparar variantes de recompensa o de particionado de datos.
- Evaluacion de tecnicas de RL sobre modelos multimodales: permite estudiar el efecto de entrenar solo la torre del lenguaje mientras se conservan intactas las torres de vision y audio del modelo base.
- Generacion de soluciones matematicas paso a paso: el modo thinking y las respuestas de 2048 tokens lo hacen adecuado para problemas que requieren cadena de razonamiento extendida.
- Reproduccion de experimentos con revisiones intermedias: las ramas cada 50 pasos permiten analizar la evolucion del modelo durante el entrenamiento y estudiar curvas de aprendizaje.
- Fine-tuning posterior como punto de partida: al estar bajo Apache 2.0 y en safetensors bf16, puede servir de base para nuevos ajustes con SFT o DPO en dominios cientificos.
- Despliegue en pipelines de investigacion con vLLM: el autor documenta la carga directa mediante `vllm.LLM` con la revision `step-200`, lo que facilita la inferencia por lotes en entornos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 24 GB para contexto corto.
- Cuantizacion: no se documentan versiones GGUF ni cuantizaciones oficiales; seria necesario generarlas a partir de los safetensors bf16.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 con contexto moderado; para contextos largos o lotes mayores, A100/H100.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y potencialmente en GPUs de 16 GB solo tras cuantizacion, que no esta publicada.
- Opciones de despliegue: vLLM (documentado por el autor con `revision="step-200"`), transformers con `AutoModelForImageTextToText.from_pretrained`; llama.cpp u Ollama requeririan conversion a GGUF no disponible.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| e2h-polaris-gemma-4-e4b-it-all_rb | 7.996.156.490 | no disponible | Apache 2.0 | Hugging Face, revisiones por paso | GRPO sobre matematicas, solo torre de lenguaje entrenada |
| google/gemma-4-E4B-it | no disponible en la informacion | no disponible | no disponible en la informacion | Hugging Face | Modelo base multimodal; sin ajuste GRPO |
| Alternativas de razonamiento matematico de ~8B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- El ajuste se limita al razonamiento matematico con recompensas basadas en reglas; el rendimiento en otras tareas no esta documentado y podria haberse degradado respecto al modelo base.
- Solo se entreno la torre del lenguaje; las capacidades de vision y audio son las del modelo base y no se benefician del ajuste.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la informacion disponible.
- No se documentan sesgos conocidos ni evaluaciones de seguridad del checkpoint.
- La longitud de contexto y los idiomas soportados no estan disponibles; conviene verificar la configuracion del modelo base antes de usarlo en produccion.
- El checkpoint tiene muy poca traccion (13 descargas, 0 likes) y no se han publicado benchmarks; no debe asumirse una calidad superior al modelo base sin evaluacion propia.
- Aunque la licencia es Apache 2.0, el modelo base Gemma 4 puede estar sujeto a terminos adicionales de Google; conviene revisar la licencia del modelo base antes de un uso comercial.
- Las ramas por paso (`step-50`, `step-100`, etc.) requieren especificar `revision`; usar `main` carga el paso final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidafrica/e2h-polaris-gemma-4-e4b-it-all_rb
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio de verl: no disponible en la informacion proporcionada
- Paper o blog del entrenamiento: no disponible en la informacion proporcionada
- Dataset Polaris-Dataset-53K: no disponible en la informacion proporcionada
- Demos: no disponible en la informacion proporcionada
