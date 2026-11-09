# DavidAU/Llama-3.2-8X3B-GATED-MOE-Reasoning-Dark-Champion-Instruct-uncensored-abliterated-18.4B-GGUF

## Resumen

Llama-3.2-8X3B-GATED-MOE-Reasoning-Dark-Champion-Instruct-uncensored-abliterated-18.4B es un modelo de generacion de texto publicado por DavidAU en Hugging Face, construido mediante la fusion de ocho modelos derivados de Llama 3.2 3B en una arquitectura de mezcla de expertos (MoE) con compuerta ("gated"). El resultado es un modelo de 18.404.944.960 parametros totales que, segun el autor, ofrece una calidad de prosa y escritura creativa muy superior a la de los modelos Llama 3.2 3B individuales, manteniendo un contexto maximo de 128k tokens (131.000).

El modelo incorpora un experto de razonamiento basado en NousResearch DeepHermes-3-Llama-3-3B-Preview, cuyo modo de "pensamiento" puede activarse o desactivarse mediante prompts de sistema, y que durante la fase de razonamiento se ve reforzado por los otros siete expertos gracias al mecanismo de compuerta. Esta compuerta tambien permite controlar que expertos intervienen en cada generacion, lo que da un control fino sobre el estilo y el comportamiento del modelo. El autor lo presenta como un modelo "uncensored" y "abliterated", orientado a escritura de ficcion, roleplay y generacion creativa sin las restricciones habituales de los modelos alineados.

La relevancia actual del modelo radica en su enfoque de compresion: combina ocho modelos de 3B en un unico artefacto de 18.4B que, segun el autor, presenta una perplejidad inferior a la de Meta Llama 3 Instruct y puede ejecutarse a mas de 50 tokens por segundo en una GPU consumer de 16 GB con cuantizacion IQ4_XS. Se distribuye en formato GGUF y con licencia Apache 2.0, lo que facilita su despliegue local y su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) gated, fusion de 8 modelos Llama 3.2 3B mediante mergekit |
| Parametros totales | 18.404.944.960 |
| Parametros activos | no disponible (el autor no publica el numero de expertos activos por token) |
| Longitud de contexto | 128k tokens (131.000) |
| Tipos de cuantizacion | GGUF en varias cuantizaciones; tensor de salida en Q8_0, algunas variantes en f16 y una en Q8_0 con f32; el modelo base se construyo en float32 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 159,7 GB con multiples cuantizaciones) |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos construida con mergekit a partir de ocho modelos derivados de Llama 3.2 3B: huihui-ai/Llama-3.2-3B-Instruct-abliterated (usado dos veces), NousResearch/DeepHermes-3-Llama-3-3B-Preview (experto de razonamiento), Hastagaras/L3.2-JametMini-3B-MK.I, ValiantLabs/Llama3.2-3B-Enigma, Hastagaras/L3.2-JametMini-3B-MK.III y chuanli11/Llama-3.2-3B-Instruct-uncensored, entre otros. La fusion se realizo en precision float32 (32 bits) para maximizar la estabilidad del merge, y el autor indica que el modelo resultante presenta una perplejidad muy baja, inferior a la de Meta Llama 3 Instruct.

La innovacion principal es la estructura "gated": el experto de razonamiento (DeepHermes) se refuerza durante la fase de pensamiento con los otros siete expertos, y en la fase de generacion de salida toman el control los expertos no razonadores. Ademas, la compuerta permite al usuario seleccionar explicitamente que expertos intervienen en cada generacion, lo que posibilita ajustar el estilo y el comportamiento sin reentrenar. El modo de razonamiento es opcional y se activa mediante prompts de sistema especificos, siguiendo el esquema de NousResearch y DeepHermes. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO, ya que el modelo es una fusion y no un entrenamiento desde cero.

## Capacidades

- Generacion de texto y escritura creativa: prosa vivida, ficcion, narrativa larga, generacion de tramas y subtramas, continuacion de escenas y dialogos.
- Razonamiento y modo "thinking": activable y desactivable mediante prompts de sistema, con refuerzo de los demas expertos durante la fase de razonamiento.
- Roleplay y juegos de rol: soporta personajes, escenarios y generos como terror, romance, ciencia ficcion y fantasia.
- Generacion sin censura ("uncensored" y "abliterated"): el autor advierte que la salida puede incluir lenguaje soez, humor y contenido visceral.
- Control de expertos: la compuerta permite seleccionar que modelos intervienen en la generacion.
- Multilingue: solo ingles segun la model card.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado de forma explicita; el modo de razonamiento es el unico mecanismo descrito.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Escritura de ficcion y narrativa larga: el modelo puede generar tramas, subtramas, escenas y dialogos con un estilo vivido y detallado, aprovechando su contexto de 128k tokens para mantener la coherencia en novelas o relatos extensos.
- Roleplay y juegos de rol por texto: su entrenamiento orientado a roleplay y su capacidad de mantener personajes y escenarios lo hacen adecuado para motores de rol conversacional, con control de temperatura y penalizacion de repeticion (1,02 o superior recomendado por el autor).
- Generacion de guiones y dialogos para produccion audiovisual: permite producir dialogos con tono visceral y generos especificos (terror, romance, ciencia ficcion) indicando el estilo en el prompt, por ejemplo "(vivid horror)".
- Asistente de escritura creativa en local: al ejecutarse en GGUF sobre GPU consumer de 16 GB a mas de 50 t/s con IQ4_XS, puede integrarse en herramientas de escritura de escritorio sin depender de la nube.
- Prototipado de contenido narrativo para videojuegos: generacion de descripciones de escenarios, dialogos de PNJ y tramas secundarias con control de estilo mediante la seleccion de expertos.
- Experimentacion con arquitecturas MoE y tecnicas de fusion: util como caso de estudio de mergekit, compuertas de expertos y modos de razonamiento activables en modelos compactos.
- Generacion de contenido sin filtros para investigacion sobre alineacion y censura: permite estudiar el comportamiento de modelos "abliterated" y comparar con sus contrapartes alineadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente afirma que la perplejidad del modelo es inferior a la de Meta Llama 3 Instruct y que alcanza mas de 50 tokens por segundo con 2 expertos en una GPU de 16 GB con cuantizacion IQ4_XS, cifra que se duplica en tarjetas de gama media.

## Requisitos de hardware

- VRAM estimada: el autor indica que con cuantizacion IQ4_XS y 2 expertos activos el modelo cabe en una GPU de 16 GB y supera los 50 t/s. Las cuantizaciones de mayor precision (Q8_0, f16) requieren bastante mas memoria; el repositorio completo ocupa 159,7 GB.
- GPU recomendadas: tarjetas consumer de 16 GB (por ejemplo, RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080) para cuantizaciones bajas; para Q8_0 o f16 se necesitan GPU profesionales como A100 o H100, o configuraciones multi-GPU.
- Cabe en GPU consumer: si, en cuantizaciones IQ4_XS o similares con 16 GB de VRAM; el autor afirma que el rendimiento se duplica en tarjetas de gama media.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; tambien es compatible con endpoints (tag "endpoints_compatible"). No se documenta soporte de vLLM o TGI en la informacion disponible.
- Latencia y throughput: mas de 50 t/s con 2 expertos e IQ4_XS en GPU de 16 GB; el doble en GPU de gama media segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-3.2-8X3B-GATED-MOE-Reasoning-Dark-Champion (este) | 18,4B | 128k | Apache 2.0 | GGUF | MoE gated con modo de razonamiento y control de expertos |
| Llama-3.2-8X3B-MOE-Dark-Champion-Instruct-uncensored-abliterated-18.4B | 18,4B | 128k | Apache 2.0 | GGUF | Version sin razonamiento ni compuerta del mismo autor; 193 likes y mas de 447.000 descargas |
| Meta Llama 3.2 3B Instruct | 3B | 128k | Llama 3.2 Community License | safetensors, GGUF | Modelo base alineado; menor calidad de prosa segun el autor |
| NousResearch DeepHermes-3-Llama-3-3B-Preview | 3B | no disponible | no disponible | no disponible | Experto de razonamiento integrado en este MoE |

## Limitaciones y advertencias

- Contenido sin censura: el autor advierte explicitamente de NSFW, lenguaje soez, detalles viscerales y terror ligero; no es adecuado para aplicaciones dirigidas a publico general sin filtros adicionales.
- Sesgo negativo: el autor indica que el modelo tiene un "ligero sesgo negativo" y que no es un modelo de "happy ever after".
- Riesgo de alucinacion: como todo modelo generativo, puede inventar hechos; no se han publicado evaluaciones de factualidad.
- Idioma: solo soporta ingles segun la model card; el rendimiento en castellano no esta documentado.
- GPTismos residuales: el autor reconoce que quedan algunos patrones de estilo tipo GPT, que pueden mitigarse subiendo la temperatura.
- Sensibilidad a la temperatura: temperaturas demasiado altas pueden afectar al seguimiento de instrucciones en roleplay, segun el autor.
- Variabilidad entre cuantizaciones: el autor indica que distintas cuantizaciones producen salidas ligeramente diferentes en usos creativos.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado puede ser inapropiado y requiere moderacion en produccion.
- Requiere plantilla Llama 3 y/o plantilla Command-R, y prompts de sistema especificos para activar el modo de razonamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Llama-3.2-8X3B-GATED-MOE-Reasoning-Dark-Champion-Instruct-uncensored-abliterated-18.4B-GGUF
- Modelo base (safetensors): https://huggingface.co/DavidAU/Llama-3.2-8X3B-GATED-MOE-Reasoning-Dark-Champion-Instruct-uncensored-abliterated-18.4B
- Version sin razonamiento: https://huggingface.co/DavidAU/Llama-3.2-8X3B-MOE-Dark-Champion-Instruct-uncensored-abliterated-18.4B-GGUF
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs y soporte: https://huggingface.co/DavidAU/support
- Experto de razonamiento: https://huggingface.co/NousResearch/DeepHermes-3-Llama-3-3B-Preview
- Experto abliterated: https://huggingface.co/huihui-ai/Llama-3.2-3B-Instruct-abliterated
- Experto JametMini MK.I: https://huggingface.co/Hastagaras/L3.2-JametMini-3B-MK.I
- Experto JametMini MK.III: https://huggingface.co/Hastagaras/L3.2-JametMini-3B-MK.III
- Experto Enigma: https://huggingface.co/ValiantLabs/Llama3.2-3B-Enigma
- Experto uncensored: https://huggingface.co/chuanli11/Llama-3.2-3B-Instruct-uncensored
- mergekit: https://github.com/arcee-ai/mergekit
