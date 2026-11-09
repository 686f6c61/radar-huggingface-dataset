# DavidAU/L3.1-Dark-Reasoning-Dark-Planet-Hermes-R1-Uncensored-Horror-Imatrix-MAX-8B-GGUF

## Resumen
L3.1-Dark-Reasoning-Dark-Planet-Hermes-R1-Uncensored-Horror-Imatrix-MAX-8B-GGUF es un modelo de generacion de texto en formato GGUF, desarrollado por DavidAU, orientado a escritura creativa, narrativa de ficcion, roleplay y generacion de tramas, con un sesgo explicito hacia el terror grafico y contenido para adultos. Deriva de un merge propio del autor (L3.1-Dark-Reasoning-Dark-Planet-Hermes-R1-Uncensored-8B), que a su vez combina el nucleo "Dark Planet" con la tecnologia de razonamiento variable de DeepHermes de NousResearch sobre una base Llama 3.1 de 8B.

El modelo incorpora un modo de "razonamiento" activable mediante system prompt, con control on/off y variable, heredado de DeepHermes, y declara una ventana de contexto de 128k tokens. Los pesos se distribuyen en cuantizaciones "MAX" (hasta Q8_0 y F16), con una matriz de importancia (imatrix) generada a partir de un modelo de terror de 16B ("Grand Horror 16B"), lo que segun el autor refina la calidad de las cuantizaciones bajas.

Su relevancia actual radica en el nicho: es un modelo sin censura para generacion creativa de terror, con razonamiento integrado y plantilla instruct de Llama 3, pensado para herramientas como SillyTavern o backends compatibles con GGUF. No es un modelo de proposito general para produccion corporativa, sino una pieza especializada para escritura y roleplay.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1), con merge de modelos y razonamiento estilo DeepHermes |
| Parametros totales | 8.030.261.312 (8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128k (segun model card); minimo recomendado 4k, optimo 8k |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, Q2_K_S, IQ2_S, Q2_K, IQ2_M, IQ3_XXS, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, IQ4_NL, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 92,6 GB con multiples cuantizaciones); tensor de salida ampliado a bf16 en las versiones MAX |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only de la familia Llama 3.1 con 8B parametros, construido mediante mergekit a partir de un modelo base propio del autor (L3.1-Dark-Reasoning-Dark-Planet-Hermes-R1-Uncensored-8B). Sobre el nucleo "Dark Planet" se ha injertado la tecnologia de razonamiento de DeepHermes-3-Llama-3-8B-Preview de NousResearch, que permite activar y desactivar bloques de "thinking" mediante system prompt y ajustar su profundidad con la temperatura. Segun el autor, esta version conserva las funciones de DeepHermes a aproximadamente un 50-67 % de su potencia de razonamiento original, debido al caracter del modelo base.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO. La innovacion tecnica destacable es la generacion de una imatrix especifica de terror ("HORROR Imatrix", derivada de un modelo Grand Horror de 16B) para producir cuantizaciones GGUF de mayor calidad, junto con la ampliacion del tensor de salida a bf16 en las versiones MAX para preservar la calidad de generacion.

## Capacidades
- Generacion de texto creativo: narrativa de ficcion, cuentos, tramas y subtramas, continuacion de escenas y prosa descriptiva.
- Escritura en multiples generos (ciencia ficcion, romance, terror, etc.), con enfasis declarado en terror grafico y contenido explicito.
- Roleplay y conversacion multi-turno, con etiquetas para SillyTavern y "backyard".
- Razonamiento activable on/off/variable mediante system prompt (tecnologia DeepHermes), con bloques de pensamiento que pueden alargarse o comprimirse segun temperatura y prompt.
- Resolucion de puzles logicos y adivinanzas, segun el autor, por encima de lo habitual en Llama 3.1, aunque limitado por el nucleo Dark Planet.
- Soporte de plantilla instruct de Llama 3 (requisito explicito de la model card).
- Capacidades multilingues: solo ingles declarado.
- No se menciona soporte de tool calling, function calling, vision ni audio en la informacion disponible.

## Casos de uso
- Escritura de ficcion de terror: el modelo genera narrativa grafica y sin censura con contexto de hasta 128k tokens, adecuado para novelas por capitulos o sagas largas donde la coherencia entre escenas exige ventanas amplias.
- Roleplay de personajes en SillyTavern: dispone de etiquetas y modos de operacion orientados a esta herramienta, con control de "personalidad" mediante system prompt (por ejemplo, variantes "Evil") y bloques de razonamiento que separan el pensamiento interno de la respuesta final.
- Generacion de tramas y subtramas: con prompts medios o largos y temperaturas altas (1.2+), produce ideas argumentales y giros narrativos, util en fases de ideacion de guiones o campanas de juego de rol.
- Continuacion de escenas ("scene continue"): el modelo puede retomar un texto previo y prolongarlo manteniendo tono y estilo, gracias a la ventana de contexto extendida y a la plantilla instruct.
- Puzles y adivinanzas narrativas: el modo de razonamiento permite resolver enigmas integrados en tramas (por ejemplo, acertijos de escape room o investigaciones de ficcion), con la salvedad de que el autor reconoce que su potencia de razonamiento es inferior a la de DeepHermes original.
- Prototipado de contenido para juegos de rol de mesa: generacion rapida de descripciones de escenarios, encuentros y dialogos de PNJ con estetica de terror, ejecutable en local con cuantizaciones pequenas.
- Experimentacion con decodificacion y prompts: util como banco de pruebas para estudiar el efecto de la temperatura y los system prompts sobre el razonamiento en modelos de 8B sin censura.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: depende de la cuantizacion. Para 8B, Q4_K_M ronda los 5-6 GB, Q5_K_M unos 6-7 GB, Q6_K unos 7-8 GB y Q8_0 unos 9-10 GB; F16 requeriria aproximadamente 16 GB solo para pesos, mas KV cache.
- GPU recomendadas: cualquier GPU consumer con 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070) puede ejecutar cuantizaciones Q4-Q6; para Q8_0 o contexto muy largo conviene 16-24 GB (RTX 4090, RTX 3090). En entornos profesionales, A100 o H100 permiten F16 y contextos de 128k con holgura.
- Cabe en GPU consumer: si, en modelos con al menos 8 GB de VRAM usando cuantizaciones Q4 o inferiores; las cuantizaciones IQ de 1-3 bits permiten incluso GPUs de 4-6 GB con perdida de calidad de razonamiento.
- Opciones de despliegue: llama.cpp y Ollama para GGUF local; backends compatibles con endpoints de Hugging Face (el modelo esta etiquetado como endpoints_compatible); interfaz con SillyTavern para roleplay.
- Latencia y throughput: no disponible en la informacion proporcionada. El contexto recomendado de 8k (frente al maximo de 128k) sugiere que contextos muy largos degradan velocidad y calidad en hardware consumer.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|
| L3.1-Dark-Reasoning-Dark-Planet-Hermes-R1-Uncensored-Horror (este) | 8B | 128k | Terror creativo sin censura con razonamiento variable | apache-2.0 | GGUF |
| NousResearch DeepHermes-3-Llama-3-8B-Preview | 8B | no disponible | Razonamiento on/off sobre Llama 3 | no disponible | safetensors/GGUF |
| DavidAU L3-Dark-Planet-8B-GGUF | 8B | no disponible | Escritura creativa oscura, sin razonamiento DeepHermes | no disponible | GGUF |
| Llama 3.1 8B Instruct (Meta) | 8B | 128k | Proposito general con censura | Llama 3.1 Community License | safetensors/GGUF |

El modelo se distingue de DeepHermes por su orientacion explicita a terror y NSFW y por la imatrix especifica; frente a Llama 3.1 8B Instruct, sacrifica seguridad y alineacion general a cambio de libertad creativa y un modo de razonamiento activable.

## Limitaciones y advertencias
- Contenido NSFW, terror grafico, lenguaje soez y material sin censura: no es apto para entornos infantiles, corporativos sin politicas de moderacion ni aplicaciones de cara al publico general.
- Riesgo de alucinacion: al ser un modelo creativo sin alineacion fuerte, puede inventar hechos, incoherencias y contenido ofensivo; requiere revision humana en cualquier uso publico.
- Razonamiento degradado: el autor declara que conserva solo un 50-67 % de la potencia de DeepHermes, por lo que no es fiable para tareas logicas o matematicas exigentes.
- Inestabilidad de los bloques de pensamiento: la model card advierte que a veces hay que regenerar para activar el razonamiento, que la mejor respuesta puede ser la segunda o tercera generacion y que el bloque de pensamiento puede cerrarse antes de la salida final, obligando a pedir explicitamente la respuesta.
- Dependencia de temperatura alta (1.2+) y de system prompts especificos; con ajustes convencionales el rendimiento creativo cae.
- Idioma: solo ingles declarado; el rendimiento en castellano no esta verificado.
- Licencia apache-2.0 para los pesos, pero el modelo base Llama 3.1 subyacente arrastra las condiciones de la Llama 3.1 Community License de Meta, que conviene revisar antes de uso comercial.
- Cuantizaciones muy bajas (IQ1, IQ2) degradan notablemente la calidad del razonamiento, segun el propio autor.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/DavidAU/L3.1-Dark-Reasoning-Dark-Planet-Hermes-R1-Uncensored-Horror-Imatrix-MAX-8B-GGUF
- Modelo base del merge: https://huggingface.co/DavidAU/L3.1-Dark-Reasoning-Dark-Planet-Hermes-R1-Uncensored-8B
- DeepHermes-3-Llama-3-8B-Preview (NousResearch): https://huggingface.co/NousResearch/DeepHermes-3-Llama-3-8B-Preview
- Dark Planet 8B (DavidAU): https://huggingface.co/DavidAU/L3-Dark-Planet-8B-GGUF
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Preguntas frecuentes del autor: https://huggingface.co/DavidAU/support
