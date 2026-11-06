# ngqtrung/M3OPD-Teacher-Video-9B

## Resumen

M3OPD-Teacher-Video-9B es un modelo de lenguaje y vision de 9.409.813.744 parametros desarrollado por el usuario ngqtrung, construido mediante fine-tuning supervisado (SFT) y aprendizaje por refuerzo GSPO sobre la base Qwen/Qwen3.5-9B. Su funcion concreta dentro de la receta M3OPD-Reasoner es la de profesor de dominio para video: un modelo intermedio que se destila posteriormente en un estudiante mediante destilacion on-policy multi-profesor (MOPD). No es, por tanto, un modelo final de proposito general, sino un componente de un pipeline de entrenamiento.

El modelo parte de la arquitectura, tokenizer, processor y chat template de Qwen3.5-9B, lo que implica compatibilidad directa con Transformers, vLLM y SGLang sin adaptaciones. El checkpoint publicado corresponde al paso 100 del run de GSPO, senalado por el autor como el mejor checkpoint evaluado. La especializacion es la comprension de video: razonamiento temporal, video largo y tareas multimodales que combinan imagen, texto y video.

Su relevancia es metodologica: documenta una receta de destilacion on-policy aplicada a modelos vision-lenguaje de 8-9B, con datasets publicos (M3OPD-SFT-1.35M y M3OPD-RL-193K) y licencia Apache 2.0, lo que permite reproducir o auditar el proceso. El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) basada en Qwen3.5-9B, tag `qwen3_5` |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `--max-model-len 40960` |
| Tipos de cuantizacion | no disponible (repo en safetensors; compatible con las cuantizaciones que soporte Qwen3.5-9B) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-9B: un transformer multimodal con torre de vision y proyector hacia el espacio del modelo de lenguaje, con processor y chat template nativos. El pipeline declarado es `image-text-to-text`, y la model card confirma que conserva arquitectura, tokenizer, processor y plantilla de chat del modelo base, por lo que el comportamiento de inferencia es identico al de Qwen3.5-9B.

El entrenamiento sigue dos fases. Primero, un calentamiento SFT sobre los datos de video de M3OPD-SFT-1.35M. Despues, optimizacion con GSPO (Group Sequence Policy Optimization) sobre los prompts de video de M3OPD-RL-193K (carpeta `video`). El checkpoint publicado es el paso 100 de ese run de GSPO, elegido por ser el mejor evaluado. La evaluacion y el entrenamiento usan la plantilla de chat nativa de Qwen3.5 con modo thinking activado, sin system prompt, y una linea de formato de respuesta tras la pregunta (por ejemplo, `Put your final answer within \boxed{}.`). El modelo actua como profesor de dominio de video dentro de la receta M3OPD-Reasoner, y es la destilacion on-policy (MOPD) la que transfiere su comportamiento al estudiante.

## Capacidades

- Generacion de texto y razonamiento multimodal sobre entradas de imagen y texto (`image-text-to-text`).
- Comprension de video: analisis temporal, video largo y razonamiento sobre secuencias, segun la especializacion declarada del dominio.
- Modo thinking nativo de Qwen3.5, activado por defecto en el entrenamiento y la evaluacion.
- Formato de respuesta controlado mediante instrucciones de estilo `\boxed{}` para respuestas finales.
- Compatibilidad con tool calling y function calling heredada de Qwen3.5-9B (no documentada de forma especifica en esta model card).
- Capacidades multilingues: no disponibles de forma explicita; dependen del modelo base.
- No se documentan capacidades de audio.

## Casos de uso

- Destilacion de un estudiante de video: el uso principal es servir como profesor en la receta M3OPD, generando trayectorias on-policy sobre prompts de video que luego se destilan en un modelo estudiante de menor coste.
- Analisis de video largo con razonamiento temporal: el modelo puede responder preguntas que requieren localizar eventos, ordenar acciones o razonar sobre dependencias temporales en secuencias extensas, apoyandose en el modo thinking.
- Generacion de datos sinteticos de razonamiento para video: producir cadenas de razonamiento y respuestas finales en formato `\boxed{}` para ampliar datasets de entrenamiento de otros modelos.
- Evaluacion comparativa de recetas de RL: al ser un checkpoint intermedio (paso 100 de GSPO) con datasets publicos, sirve para reproducir y contrastar resultados de GSPO frente a otras tecnicas de RL.
- Investigacion en destilacion on-policy: permite estudiar como se transfiere el comportamiento de un profesor de dominio a un estudiante en modelos de 8-9B con licencia permisiva.
- Despliegue en pipelines de investigacion con vLLM o SGLang: la compatibilidad directa con la arquitectura Qwen3.5-9B permite servirlo con `vllm serve ngqtrung/M3OPD-Teacher-Video-9B --max-model-len 40960` sin conversiones.
- Base para fine-tuning adicional en dominios de video especificos: al ser Apache 2.0 y compartir tokenizer y plantilla con Qwen3.5-9B, se puede reutilizar como punto de partida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de video, y solo indica que el paso 100 fue el mejor checkpoint evaluado, sin cifras.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 18,8 GB solo para pesos (tamano del repo), mas overhead de activaciones y cache KV; en la practica se recomienda al menos 24 GB para contexto moderado y bastante mas para contextos largos.
- VRAM estimada en cuantizacion de 8 bits: en torno a 10-12 GB para pesos, con overhead adicional.
- VRAM estimada en cuantizacion de 4 bits: en torno a 5-6 GB para pesos, con perdida de calidad no cuantificada por el autor.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para produccion y contextos largos; RTX 4090 (24 GB) viable en BF16 con contexto limitado o en cuantizaciones de 8/4 bits.
- Cabe en GPU de consumo: si, en RTX 4090 y GPUs con 24 GB o mas en cuantizaciones, y en BF16 con contexto reducido.
- Opciones de despliegue: vLLM y SGLang (soporte declarado explicito), Transformers. No se confirma soporte de llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| M3OPD-Teacher-Video-9B | 9.409.813.744 | no disponible (ejemplo con 40960) | Profesor de video en receta MOPD | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3.5-9B (base) | ~9B | no disponible | Vision-lenguaje generalista | Apache 2.0 (heredada) | Hugging Face |
| Qwen3.5-9B-MOPD-SFT-vid | ~9B | no disponible | Profesor SFT de dominio video en el proyecto MOPD | no disponible | Hugging Face |
| Video-MOPD-8B | ~8B | no disponible | Video understanding con RL | no disponible | Referenciado en paper |

La comparativa se limita a parametros y licencia: no hay datos publicos de rendimiento para este checkpoint ni para los alternativos en la informacion disponible.

## Limitaciones y advertencias

- Modelo intermedio de una receta de destilacion: no esta pensado como modelo final de produccion, sino como profesor para generar datos y trayectorias.
- Riesgo de alucinacion inherente a los modelos de razonamiento multimodal, no cuantificado por el autor.
- Sesgos no documentados: no se detalla la composicion de M3OPD-SFT-1.35M ni M3OPD-RL-193K, por lo que no se pueden evaluar sesgos de dominio, idioma o cultura.
- Idiomas soportados no declarados; el comportamiento multilingue depende de Qwen3.5-9B y no esta verificado para este fine-tuning.
- El modo thinking esta activado por defecto en el entrenamiento; desactivarlo puede degradar el rendimiento respecto al checkpoint publicado.
- El formato de respuesta esperado incluye instrucciones de estilo `\boxed{}`; sin esa linea de formato los resultados pueden diferir de los del entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones y avisos del modelo base Qwen3.5-9B.
- Sin adopcion verificable: 0 descargas y 0 likes, sin validacion externa de la comunidad.
- No hay datos publicados de benchmarks, latencia ni throughput que permitan estimar el coste real en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/ngqtrung/M3OPD-Teacher-Video-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset SFT: https://huggingface.co/datasets/ngqtrung/M3OPD-SFT-1.35M
- Dataset RL: https://huggingface.co/datasets/ngqtrung/M3OPD-RL-193K
- Coleccion M3OPD-Reasoner: https://huggingface.co/collections/ngqtrung/m3opd-reasoner-6aed5164d151b6643a1b3b2d
- Profesor SFT de video relacionado: https://huggingface.co/ngqtrung/Qwen3.5-9B-MOPD-SFT-vid
- Paper Video-MOPD: https://www.emergentmind.com/papers/2609.09300
