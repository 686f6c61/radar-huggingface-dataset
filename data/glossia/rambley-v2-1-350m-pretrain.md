# glossia/Rambley-V2.1-350M-Pretrain

## Resumen

Rambley-V2.1-350M-Pretrain es un modelo de lenguaje pequeño (aproximadamente 350 millones de parametros) preentrenado por el colectivo glossia. Se trata de un checkpoint intermedio de preentrenamiento: el autor indica que la version final base/midtrained es glossia/Rambley-V2.1-350M. El modelo se ha entrenado sobre unos 12,9 mil millones de tokens combinando datos educativos (DCLM-Edu), matematicos (UltraData-Math), transcripciones de YouTube filtradas, contenido de LibreTexts y un dataset propio (picl-text).

Su interes principal no es competir en capacidades generales, sino servir como plataforma de experimentacion arquitectonica. Incorpora varias tecnicas poco habituales: atencion con puertas a nivel de cabeza (headwise gated attention), attention sinks aprendidos, un patron de atencion mixto SWA:SWA:GQA con ventana deslizante de 128 tokens, embeddings posicionales HoPE y preentrenamiento a nivel de patch durante el 60% del presupuesto de tokens. El optimizador tambien es atipico, combinando Muon para matrices con AdamW para embeddings y normas. Es un modelo util para investigadores que quieran estudiar estas tecnicas en un modelo ligero y facil de ejecutar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con headwise gated attention, attention sinks aprendidos, patron SWA:SWA:GQA, HoPE |
| Parametros totales | 348.583.480 |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | 2048 tokens nativos |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder de unos 349 millones de parametros con varias innovaciones arquitectonicas. Los MLP usan SwiGLU con un ratio intermedio de 2,5x. La atencion emplea un mecanismo de puertas a nivel de cabeza (headwise gated attention), elegido frente a la variante elementwise para ahorrar parametros en familias de modelos pequenas. Cada cabeza de atencion incorpora un attention sink aprendido, y el patron de atencion alterna SWA:SWA:GQA (dos capas de ventana deslizante por cada capa de GQA), forzando la ultima capa a GQA. El tamano de la ventana deslizante es de 128 tokens y las embeddings posicionales son de tipo HoPE, aplicadas tanto en las capas SWA como en las GQA.

El preentrenamiento uso aproximadamente 12,9 mil millones de tokens de HuggingFaceTB/dclm-edu, openbmb/UltraData-Math, common-pile/youtube_filtered, common-pile/libretexts_filtered y glossia/picl-text, con preentrenamiento a nivel de patch durante el 60% del presupuesto de tokens. Como optimizadores se emplearon Muon (LR 0,02) con restricciones de norma Hyperball para las matrices, y AdamW (LR 0,002, sin weight decay ni Hyperball) para embeddings, vectores y normas. No se menciona ningun postentrenamiento tipo RLHF o DPO, coherente con su naturaleza de checkpoint de preentrenamiento. El codigo de preentrenamiento se basa en un fork de OLMo-core disponible en https://code.allura.moe/fizz/OLMo-core.

## Capacidades

- Modelado de lenguaje basico como base model preentrenado: continuacion de texto y completado, sin ajuste por instrucciones.
- Resolucion limitada de tareas de razonamiento comun (ARC, HellaSwag, PIQA) a niveles tipicos de modelos de ~350M.
- Capacidades aritmeticas basicas de continuacion, evaluadas con arithmark-3 (34,90% de precision normalizada), con mejor rendimiento relativo en geometria de area y perimetro (55-58%).
- No se indica soporte de tool calling ni function calling.
- No se indica soporte de agentes, vision, audio ni thinking mode.
- Capacidades multilingues: no disponible.
- Al ser un checkpoint de preentrenamiento, esta pensado como base para continuar el entrenamiento o para investigacion arquitectonica, no para uso conversacional directo.

## Casos de uso

- Investigacion en arquitecturas de atencion: el modelo implementa headwise gated attention, attention sinks y HoPE, por lo que sirve como base reproducible para ablations y comparaciones de estas tecnicas en escala pequena.
- Experimentacion con optimizadores: permite estudiar el comportamiento de Muon con restricciones Hyperball frente a AdamW en un modelo que se entrena en horas, no en semanas.
- Base para midtraining o fine-tuning: al ser un checkpoint de preentrenamiento, se puede continuar el entrenamiento desde el o ajustarlo a dominios concretos (el dataset educativo y matematico sugiere afinidad con contenido academico basico).
- Evaluacion de benchmarks ligeros: con solo 0,7 GB en bfloat16, es ideal para validar pipelines de evaluacion (lm-evaluation-harness, arithmark) rapidamente.
- Educacion y docencia: su tamano permite ejecutarlo en portatiles para demostrar internas de transformers (ventanas deslizantes, GQA, attention sinks) con codigo accesible.
- Prototipado de inferencia en CPU o hardware modesto: cabe comodamente en memoria de consumidor para probar cuantizacion, decodificacion especulativa con modelos mayores como draft model, o integraciones con llama.cpp.

## Benchmarks y rendimiento

Resultados publicados en la model card (0-shot, via lm-evaluation-harness):

| Tarea | Metrica | Valor | Stderr |
|---|---|---|---|
| arc_challenge | acc | 21,50% | ± 1,20 |
| arc_challenge | acc_norm | 24,23% | ± 1,25 |
| arc_easy | acc | 50,76% | ± 1,03 |
| arc_easy | acc_norm | 45,79% | ± 1,02 |
| hellaswag | acc | 30,51% | ± 0,46 |
| hellaswag | acc_norm | 34,14% | ± 0,47 |
| piqa | acc | 64,04% | ± 1,12 |
| piqa | acc_norm | 63,71% | ± 1,12 |

Ademas, en arithmark-3 obtiene una precision de continuacion bruta del 34,80% y normalizada del 34,90%, con un throughput de evaluacion de 625,9 ejemplos/s. Destaca en geometry_area (55,77%) y geometry_perimeter (57,78%), con resultados peores en tareas de dos pasos (19-31%).

## Requisitos de hardware

- VRAM estimada para inferencia: unos 0,7 GB en bfloat16 (348,6 millones de parametros x 2 bytes); menos de 0,5 GB con cuantizacion a 4 bits si se dispone de ella.
- Ejecutable sin GPU dedicada: cualquier CPU moderna con 2-4 GB de RAM es suficiente; no se requiere A100, H100 ni similares.
- Cabe sobradamente en GPUs de consumo (incluso una GTX 1060 o una RTX 3050 con 4 GB seria mas que suficiente).
- Opciones de despliegue: no se documentan oficialmente; por formato safetensors y tamano, es compatible con PyTorch/Transformers con custom_code, y teoricamente convertible a GGUF para llama.cpp u Ollama (no se confirma soporte existente).
- Latencia y throughput: no disponibles de forma oficial; la propia evaluacion del autor reporta 625,9 ejemplos/s en la tarea arithmark-3, lo que da una idea del bajo coste computacional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| glossia/Rambley-V2.1-350M-Pretrain | 348,6M | 2048 | CC-BY-SA-4.0 | Checkpoint de preentrenamiento; arquitectura experimental (HoPE, gated attention, Muon) |
| Qwen2.5-0.5B (referencia de categoria) | ~494M | 32.768 | Qwen Research / Apache-2.0 (variantes) | Modelo base maduro, multilingue, sin tecnicas experimentales |
| SmolLM2-360M (referencia de categoria) | ~360M | 8.192 | Apache-2.0 | Entrenado con ~11T tokens (muy por encima de los 12,9B de Rambley), base para edge |

Rambley es notablemente inferior en benchmarks frente a estos competidores debido a su presupuesto de entrenamiento muy reducido (~13B tokens frente a billones en los modelos comerciales), pero su valor esta en la experimentacion arquitectonica y la licencia CC-BY-SA-4.0, que exige comparticion igual en obras derivadas.

## Limitaciones y advertencias

- Es un checkpoint de preentrenamiento, no un modelo instruido: no sigue instrucciones de forma fiable y producira texto de continuacion, no respuestas conversacionales.
- Riesgo de alucinacion alto, tipico de modelos base pequenos con solo ~13B tokens de entrenamiento.
- La ventana de atencion deslizante es de solo 128 tokens, lo que limita la memoria local efectiva pese al contexto nativo de 2048.
- Idiomas soportados no especificados; la mezcla de datos sugiere predominio del ingles.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero obliga a compartir las obras derivadas bajo la misma licencia y a atribuir a los autores, lo cual puede ser restrictivo para productos cerrados.
- Usa custom_code en HuggingFace, lo que requiere confiar en el codigo remoto del repositorio al cargarlo (trust_remote_code=True).
- Popularidad muy baja (43 descargas, 1 like), por lo que el soporte comunitario y la documentacion son minimos.
- La capacidad matematica es marginal: incluso en tareas de primaria, muchas categorias quedan por debajo del 35% de precision.

## Enlaces

- Modelo: https://huggingface.co/glossia/Rambley-V2.1-350M-Pretrain
- Version final (base/midtrained): https://hf.co/glossia/Rambley-V2.1-350M
- Codigo de preentrenamiento (fork de OLMo-core): https://code.allura.moe/fizz/OLMo-core
- Discord de la comunidad: https://discord.gg/6acXmq3yx2
- Datasets de entrenamiento: HuggingFaceTB/dclm-edu, openbmb/UltraData-Math, common-pile/youtube_filtered, common-pile/libretexts_filtered, glossia/picl-text
