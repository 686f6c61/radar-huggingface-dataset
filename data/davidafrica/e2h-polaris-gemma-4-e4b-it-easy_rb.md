# davidafrica/e2h-polaris-gemma-4-e4b-it-easy_rb

## Resumen

e2h-polaris-gemma-4-e4b-it-easy_rb es un checkpoint de ajuste fino del modelo multimodal google/gemma-4-E4B-it, publicado por el usuario davidafrica en HuggingFace. Se trata del paso 200 (el final) de una tanda de entrenamiento con GRPO (Group Relative Policy Optimization) sobre el conjunto de problemas matematicos Polaris-Dataset-53K, utilizando la libreria verl 0.9.1 en su variante v0 con FSDP2. El objetivo del entrenamiento es mejorar el razonamiento matematico del modelo mediante refuerzo con recompensa basada en reglas, es decir, verificando la correccion de la respuesta final frente a la referencia.

El modelo conserva la arquitectura completa de Gemma 4 E4B, incluyendo las torres de vision y audio originales, aunque solo se entreno la parte del modelo de lenguaje. Los pesos se distribuyen en bf16 y el repositorio ocupa 63,7 GB, con 7.996.156.490 parametros totales segun los safetensors. La licencia declarada es Apache 2.0.

Su relevancia radica en que es un ejemplo practico de refinamiento por RL sobre un modelo base multimodal de Google, con una receta reproducible (verl + GRPO + dataset Polaris) y checkpoints intermedios cada 50 pasos publicados como ramas del repositorio. No obstante, se trata de un experimento con muy poca traccion (15 descargas, 0 likes) y sin documentacion adicional sobre evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E4B), con torres de vision y audio; solo se entreno el modelo de lenguaje |
| Parametros totales | 7.996.156.490 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde los shards FSDP de verl) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E4B-it, un checkpoint multimodal completo que incluye torres de vision y audio ademas del modelo de lenguaje. En este ajuste solo se entreno el modelo de lenguaje; las torres de vision y audio se mantienen intactas respecto al base. Un detalle arquitectonico relevante es que Gemma 4 comparte claves y valores (K/V) en sus ultimas 18 capas, de modo que sus propias k_proj, v_proj y k_norm nunca se utilizan; en este checkpoint se copian sin cambios desde el base para que los nombres de los tensores coincidan.

El entrenamiento se realizo con verl 0.9.1 (entrenador v0, FSDP2) aplicando GRPO sobre el conjunto Polaris-Dataset-53K. Los problemas se dividieron en faciles y dificiles segun la tasa de acierto del propio gemma-4-E4B-it con 16 muestras por problema: faciles con 10-15 aciertos de 16, dificiles con 1-9 de 16. Este checkpoint corresponde a la particion `train_easy`. La recompensa es basada en reglas: correcto frente a la respuesta de referencia. La configuracion fue de 200 pasos con 64 prompts x 8 muestras por paso, learning rate 1e-6, perdida KL de 0.001 (low_var_kl) y respuestas de 2048 tokens con el modo thinking activado. Se guardo un checkpoint cada 50 pasos, cada uno accesible como rama (`revision="step-200"`), y `main` contiene el paso final.

## Capacidades

- Generacion de texto y razonamiento matematico, reforzado especificamente mediante GRPO sobre problemas de competicion del dataset Polaris.
- Modo thinking activado durante el entrenamiento (respuestas de hasta 2048 tokens con razonamiento explicito).
- Capacidades multimodales heredadas del base: vision y audio, ya que las torres correspondientes se conservan sin cambios.
- Generacion de codigo y matematicas: capacidad inherente al modelo base Gemma 4 E4B, no evaluada de forma especifica en este checkpoint.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Resolucion de problemas matematicos de nivel escolar y competicion: el modelo fue entrenado con recompensa de correccion sobre Polaris-Dataset-53K, por lo que es adecuado para generar soluciones paso a paso con verificacion de la respuesta final en entornos de practica o tutoria automatica.
- Generacion de cadenas de razonamiento con modo thinking: gracias al entrenamiento con respuestas de 2048 tokens y thinking activado, puede emplearse para producir trazas de razonamiento largas que luego se filtran o verifican con un comprobador simbolico.
- Investigacion en RL para matematicas: el repositorio publica checkpoints intermedios cada 50 pasos como ramas, lo que permite estudiar la evolucion del aprendizaje durante el entrenamiento GRPO y comparar el paso 50, 100, 150 y 200.
- Reproduccion de recetas con verl: sirve como referencia practica de configuracion (FSDP2, low_var_kl, lr 1e-6, 64 prompts x 8 muestras) para equipos que quieran replicar el pipeline E2H Polaris sobre otros modelos.
- Prototipado de asistentes multimodales: al conservar las torres de vision y audio del base, puede emplearse en tareas que combinen imagen o audio con razonamiento textual, aunque sin garantias de que el ajuste RL no haya degradado estas capacidades.
- Evaluacion comparativa de ajustes RL: util como punto de comparacion frente al gemma-4-E4B-it original para medir el efecto del GRPO en tareas de matematicas y en la estabilidad del modo thinking.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para los pesos (8.000 millones de parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomiendan 24 GB o mas para contexto largo.
- Cuantizacion: no se publican versiones GGUF ni cuantizadas en el repositorio; habria que generarlas a partir de los safetensors bf16.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para despliegue en produccion con vLLM; RTX 4090 (24 GB) puede ser suficiente en bf16 con contexto moderado, y RTX 3090 (24 GB) de forma mas ajustada.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB como RTX 4090 o RTX 3090, siempre que se limite la longitud de contexto y el tamano de lote.
- Opciones de despliegue: vLLM (soportado explicitamente segun la model card, con `vllm.LLM(..., revision="step-200")`), transformers con `AutoModelForImageTextToText.from_pretrained`, y previsiblemente llama.cpp u Ollama tras convertir a GGUF (no documentado).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| e2h-polaris-gemma-4-e4b-it-easy_rb | 7.996.156.490 | no disponible | GRPO sobre Polaris-Dataset-53K (200 pasos) | Apache 2.0 | HuggingFace, 15 descargas |
| google/gemma-4-E4B-it (base) | no disponible en la informacion | no disponible | Instruct original de Google | no disponible en la informacion | HuggingFace, modelo oficial |
| Otros checkpoints de la tanda E2H Polaris | no disponible | no disponible | GRPO con particiones easy/hard | Apache 2.0 | no disponible |

La comparativa con alternativas de la misma categoria (modelos de ~8.000 millones de parametros especializados en matematicas) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental de un autor individual, con 15 descargas y 0 likes; no hay evidencia de evaluacion independiente ni de validacion en produccion.
- Riesgo de sobreajuste al dataset Polaris-Dataset-53K y a la particion `train_easy`: el rendimiento fuera de esa distribucion de problemas puede degradarse.
- El ajuste RL puede haber alterado el equilibrio del modo thinking o la calidad de las respuestas fuera de matematicas; no se documenta ninguna evaluacion de regresion.
- Aunque las torres de vision y audio se conservan del base, no se garantiza que sigan funcionando correctamente tras el ajuste del modelo de lenguaje.
- Riesgo de alucinacion inherente a los modelos de lenguaje; la recompensa basada en reglas solo verifica la respuesta final, no la validez del razonamiento intermedio.
- Idiomas soportados no documentados; el entrenamiento se realizo sobre un dataset de matematicas presumiblemente en ingles.
- Licencia Apache 2.0 declarada, pero conviene verificar las condiciones del modelo base google/gemma-4-E4B-it antes de un uso comercial, ya que la licencia del base puede imponer restricciones adicionales.
- No se publican datos de benchmarks, latencia ni throughput; cualquier estimacion de rendimiento es especulativa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidafrica/e2h-polaris-gemma-4-e4b-it-easy_rb
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Libreria verl: https://github.com/volcengine/verl
- Dataset Polaris-Dataset-53K: no disponible en la informacion proporcionada
- Paper de GRPO: no disponible en la informacion proporcionada
- Demo o blog del autor: no disponible en la informacion proporcionada
