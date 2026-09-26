# CMSManhattan/JiRackTernaryGemma4_26b

## Resumen

JiRackTernaryGemma4_26b es una migración del modelo multimodal google/gemma-4-26B-A4B-it a la arquitectura ternaria JiRack, desarrollada por CMSManhattan. Se trata de un transformer decoder con mezcla de expertos (MoE) de aproximadamente 26.000 millones de parámetros totales y unos 4.000 millones activos por token (128 expertos, top-8), en el que se ha eliminado la torre de visión (~550M de parámetros) para dejar un modelo puramente de texto orientado a inferencia en CPU y entornos con poca memoria. El checkpoint declara 25.971.339.294 parámetros reales en safetensors.

La innovación principal es la ternarización de pesos al estilo BitNet b1.58: las proyecciones q/k/v/o, el MLP denso y los 128 expertos pasan a pesos ternarios, mientras que las embeddings (con lm_head atado), el router, las normas y el layer_scalar se mantienen en precisión completa. El objetivo declarado es reducir el consumo de RAM/VRAM y liberar memoria para contextos largos, manteniendo a la vez un pipeline de cuantización consciente del entrenamiento (QAT) para desplegar en GGUF, llama.cpp y Ollama.

El modelo se publica bajo licencia MIT y soporta 13 idiomas, con un tokenizador propio (CMSManhattan/GemmaRoboticsTokenizer) que añade etiquetas específicas de robótica, routing, FIM, media y mood. Está pensado para casos de uso de código, tool calling, robótica y routing, aunque el propio autor advierte de que todavía no se ha probado con contextos grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con mezcla de expertos (MoE) y atencion hibrida sliding/full; pesos ternarios (BitNet b1.58) en la mayoria de matrices |
| Parametros totales | 25.971.339.294 (~26B) |
| Parametros activos | ~4B por token (128 expertos, top-8) |
| Longitud de contexto | 262.144 en el checkpoint; esta exportacion usa una tabla RoPE de 4.096 salvo que se reconstruya |
| Tipos de cuantizacion | Pesos ternarios en q/k/v/o, MLP denso y los 128 expertos; bf16 en embeddings/lm_head atado, router, normas y layer_scalar. GGUF disponibles: F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M |
| Idiomas soportados | en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16, 13 shards) y GGUF |

## Arquitectura y entrenamiento

La arquitectura parte de la configuracion de texto de google/gemma-4-26B-A4B-it: vocabulario de 262.144 tokens con embeddings atadas, dimension oculta de 2.816, 30 capas con patron de atencion 5 sliding : 1 full y 16 cabezas. Las capas sliding usan head_dim 256 con 8 cabezas KV, RoPE con theta 10k y ventana de 1024; las capas full usan head_dim 512 con 2 cabezas KV, RoPE proporcional con theta 1e6, rotary parcial de 0,25 y k_eq_v (sin proyeccion v). Cada token pasa ademas por un MLP denso de 2.112 con activacion GeGLU (gelu_pytorch_tanh), y la MoE dispone de 128 expertos de 704 con top-8. Las normas son RMSNorm simple (x * w / rms(x), epsilon 1e-6) y hay softcap de logits de 30,0.

La ternarizacion sigue el camino BitNet b1.58 con QAT y estimador straight-through, controlado por un parametro lambda. El autor indica que durante el QAT el mecanismo de routing debe permanecer congelado y que solo debe empezar a entrenarse el router cuando lambda alcance 1,0 y se haya verificado la calidad del modelo base. La torre de visión del modelo original se ha descartado (recorte de ~550M de parametros) para ahorrar RAM/VRAM y dejar espacio a contextos largos. No se especifican en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto conversacional en 13 idiomas (en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th).
- Razonamiento en modo thinking opcional, activable mediante la bandera enable_thinking de la plantilla de chat (Gemma 4 nativa).
- Generacion y asistencia de codigo, con soporte de etiquetas FIM (fill-in-the-middle) en el tokenizador extendido.
- Tool calling / function calling, con etiquetas dedicadas de routing (por ejemplo __ROBOTICS__, __CODING__).
- Casos de robotica y routing, apoyados por el tokenizador CMSManhattan/GemmaRoboticsTokenizer.
- Capacidades de agente y razonamiento multi-paso derivadas del modelo base.
- Inferencia eficiente en CPU y equipos de baja memoria gracias a los pesos ternarios y a los GGUF de bajo bit.
- Modelo solo texto: no conserva la torre de vision del modelo original.

## Casos de uso

- Asistente de codigo en local: el modelo puede generar y completar codigo con FIM en un portatil o estacion sin GPU dedicada, usando los GGUF Q4_K_M (~16 GB) o Q3_K_M (~13 GB) sobre llama.cpp u Ollama.
- Tool calling en pipelines de automatizacion: sus etiquetas de routing y su plantilla de chat permiten integrarlo como planificador que decide que funcion invocar dentro de un agente.
- Robotica y control de bajo nivel: el tokenizador GemmaRoboticsTokenizer anade etiquetas especificas (__ROBOTICS__) para tareas de instruccion y enrutado en sistemas roboticos.
- Atencion al cliente multilingue: cubre 13 idiomas con una unica plantilla de chat Gemma 4, util para desplegar un unico modelo en varios mercados.
- Despliegue en el borde (edge) y entornos aislados: al ser MIT y funcionar en CPU, puede ejecutarse en maquinas sin GPU y sin dependencia de APIs externas.
- Procesamiento por lotes en servidores modestos: con ~4B de parametros activos por token, el coste computacional por token es menor que el de un modelo denso de 26B, lo que reduce el tiempo de proceso en CPU.
- Generacion asistida con modo thinking: para tareas que requieren varios pasos de razonamiento antes de responder, se puede activar enable_thinking en la plantilla.
- Enrutado de peticiones y clasificacion con etiquetas personalizadas: las etiquetas extra del tokenizador permiten marcar dominios (codigo, robotica, mood) dentro de un mismo flujo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica ademas que el modelo todavia no se ha probado con contextos grandes y pide aviso si se detectan diferencias de calidad respecto al modelo original.

## Requisitos de hardware

- safetensors bf16: ~50 GB de RAM/VRAM residentes, pese a que solo ~4B de parametros se activan por token.
- GGUF F16: ~50 GB.
- GGUF Q8_0: ~28 GB.
- GGUF Q6_K: ~22 GB.
- GGUF Q5_K_M: ~19 GB.
- GGUF Q4_K_M: ~16 GB, recomendado para uso diario.
- GGUF Q3_K_M: ~13 GB, opcion para memoria baja.
- Configuracion recomendada por el autor: 24-32 GB de RAM con Q4_K_M; 48 GB o mas para Q6/Q8/F16; 16-24 GB para Q3_K_M.
- GPU de consumo: Q4_K_M (~16 GB) es viable en una RTX 4090 o RTX 3090 de 24 GB; Q3_K_M (~13 GB) puede entrar en tarjetas de 16 GB. No cabria completo en GPUs de 8-12 GB sin offload parcial a CPU.
- CPU: es el escenario objetivo de los pesos ternarios; en equipos sin AVX2 el autor recomienda exportar MKL_ENABLE_INSTRUCTIONS=AVX.
- Opciones de despliegue: llama.cpp y Ollama (tag previsto cmsmanhattan/JiRackTernaryGemma4-26b-q4), ademas de Transformers con codigo personalizado (custom_code y auto_map a la clase JiRackTernaryGemma4_26b). No se confirma soporte de vLLM ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Vision | Licencia |
|---|---|---|---|---|---|
| JiRackTernaryGemma4_26b | ~26B totales / ~4B activos | 262.144 en el checkpoint; 4.096 en esta exportacion | Ternaria + bf16 en capas criticas | No (torre eliminada) | MIT |
| google/gemma-4-26B-A4B-it | ~26B totales / ~4B activos | 262.144 | bf16 | Si (~550M) | no disponible en la informacion proporcionada |
| Otros modelos ternarios tipo BitNet b1.58 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de calidad frente al modelo base.
- El propio autor advierte de que el modelo no se ha probado con contextos grandes; la tabla RoPE de esta exportacion es de 4.096 salvo que se reconstruya, pese a que el checkpoint declara 262.144.
- El tokenizador extendido tiene 262.251 tokens, 107 mas alla del token_emb del checkpoint (262.144). Esos identificadores no deben emitirse hasta hacer resize_token_embeddings(len(tokenizer)) y entrenar las filas nuevas.
- Con thinking desactivado el modelo sigue emitiendo un bloque vacio <|channel>thought\n<channel|> que hay que eliminar del historial.
- La ternarizacion degrada inevitablemente la precision numerica de q/k/v/o, MLP denso y expertos; el router y las capas criticas se mantienen en bf16 para compensar.
- El QAT exige congelar el router hasta que lambda llegue a 1,0; entrenar el router antes de ese punto puede deteriorar la calidad.
- No conserva capacidades de vision al haberse eliminado la torre correspondiente.
- Aunque la licencia es MIT, conviene verificar las condiciones del modelo base google/gemma-4-26B-A4B-it para usos comerciales, ya que su licencia no se especifica en la informacion disponible.
- El repositorio tiene 257,9 GB de tamano, lo que dificulta su descarga completa sin planificar que shards o GGUF se necesitan.
- Riesgo de alucinacion: no se documentan mitigaciones especificas ni evaluaciones de sesgo.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/CMSManhattan/JiRackTernaryGemma4_26b
- Tokenizador: https://huggingface.co/CMSManhattan/GemmaRoboticsTokenizer
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- IDE y servicios JiRack: https://www.jirack.com

Nota: la busqueda web no devolvio resultados relevantes sobre este modelo (los enlaces encontrados tratan sobre ChatGPT, GitHub Copilot y otros temas sin relacion), por lo que no se anaden referencias externas adicionales.
