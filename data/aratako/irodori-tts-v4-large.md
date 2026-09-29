# Aratako/Irodori-TTS-v4-Large

## Resumen

Irodori-TTS-v4-Large es un modelo de sintesis de voz (text-to-speech) en japones desarrollado por Aratako, construido sobre una arquitectura Rectified Flow Diffusion Transformer (RF-DiT). Su particularidad es que combina en un unico checkpoint tres tipos de condicionamiento: texto de entrada, audio de referencia y texto descriptivo (caption) de la voz. Esto habilita tres modos de uso diferenciados: clonacion de voz zero-shot, diseno de voz a partir de una descripcion textual y clonacion de voz con control de estilo.

El modelo escala la arquitectura v4 desde aproximadamente 766 M hasta 3.288.179.489 parametros (unos 3,29 B), con un Diffusion Transformer de 24 capas y 2.048 dimensiones, ademas de un encoder de referencia de mayor tamano. Sustituye el encoder ModernBERT-ja de versiones anteriores por un encoder de texto ajustado derivado de google/t5gemma-2-1b-1b, compartido entre el texto de entrada y las descripciones de Voice Design. Incorpora tambien un predictor de duracion entrenado por separado, con el resto de parametros congelados.

Es relevante en el ecosistema TTS open source porque cubre un nicho poco poblado: sintesis japonesa de alta calidad con control fino de estilo (incluido control por emojis para emociones y efectos no verbales como risas o suspiros), audio de referencia de hasta 120 segundos y marcas de agua integradas mediante SilentCipher. La licencia Gemma, sin embargo, condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Rectified Flow Diffusion Transformer (RF-DiT) con atencion conjunta, Low-Rank AdaLN, half-RoPE y MLP SwiGLU |
| Parametros totales | 3.288.179.489 (aproximadamente 3,29 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en tokens; audio de referencia de hasta 120 s combinados |
| Tipos de cuantizacion | Inferencia en FP32 reportada; variantes torchao INT8, INT4 y FP8 planificadas |
| Idiomas soportados | Japones (ja) |
| Licencia | Gemma |
| Formato de pesos | safetensors |
| Codec de audio | Aratako/Semantic-DACVAE-Japanese-32dim (latentes continuos de 32 dimensiones, reconstruccion a 48 kHz) |
| Encoder de texto | T5Gemma 2 afinado (derivado de google/t5gemma-2-1b-1b) |
| Tamano del repositorio | 13,2 GB |
| Pipeline | text-to-speech |
| Descargas / likes en HuggingFace | 0 descargas / 11 likes |

## Arquitectura y entrenamiento

El modelo se compone de cinco bloques principales. Primero, un encoder compartido de texto y caption basado en T5Gemma 2 afinado, que procesa tanto el texto de entrada como las descripciones de Voice Design. Segundo, proyectores de condicionamiento independientes que mapean las representaciones del encoder a los espacios de condicionamiento TTS correspondientes. Tercero, un encoder de latentes de referencia que codifica los latentes de audio de referencia parcheados para condicionar la identidad del hablante, admitiendo hasta 120 segundos de audio combinado. Cuarto, el Diffusion Transformer propiamente dicho, con bloques DiT de atencion conjunta que combinan texto, referencia y caption mediante Low-Rank AdaLN, half-RoPE y MLPs SwiGLU; en v4-Large consta de 24 capas y 2.048 dimensiones. Quinto, un predictor de duracion que estima la longitud del audio a partir del texto codificado y los vectores de condicionamiento, usando bloques MLP SwiGLU apilados.

El audio no se genera en forma de onda directamente, sino como secuencias de latentes continuos a traves del codec Semantic-DACVAE-Japanese-32dim, lo que permite reconstruir formas de onda de 48 kHz. El diseno de la arquitectura y del entrenamiento sigue en gran medida el enfoque de Echo-TTS, segun indica el repositorio oficial. El predictor de duracion se entrena despues del modelo principal, con el resto de parametros congelados, siguiendo el procedimiento ya usado en v4.1-Small. Para la clonacion de voz con referencias largas, el modelo se entreno concatenando aleatoriamente multiples enunciados cortos de un mismo hablante. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Sintesis de voz en japones a partir de texto, con reconstruccion de audio a 48 kHz.
- Clonacion de voz zero-shot a partir de audio de referencia, con soporte de hasta 120 segundos de referencia combinada (se recomienda concatenar varios clips cortos del mismo hablante).
- Diseno de voz mediante caption textual: permite definir caracteristicas de la voz, emocion, estilo de habla y forma de entrega a partir de una descripcion en texto.
- Clonacion de voz con control de estilo, combinando referencia de hablante y caption descriptivo.
- Control de estilo y efectos sonoros mediante emojis insertados en el texto de entrada (por ejemplo risas, toses o suspiros); la lista completa esta documentada en EMOJI_ANNOTATIONS.md del repositorio.
- Prediccion de duracion integrada, que ajusta la longitud del audio generado al contenido textual.
- Marcado de agua invisible en las salidas generadas mediante SilentCipher.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada como tarea distinta del condicionamiento por referencia.

## Casos de uso

- Audiolibros y narracion en japones: el modelo genera voz sintetica a 48 kHz a partir de texto plano, y el control por emojis permite marcar pausas, enfasis y expresiones no verbales dentro del texto narrado, lo que reduce el trabajo de edicion posterior.
- Localizacion y doblaje: con audio de referencia de hasta 120 segundos se puede clonar la voz de un actor original y aplicar el estilo mediante caption, util para doblar contenido manteniendo la identidad vocal del hablante.
- Asistentes de voz y atencion al cliente en japones: la prediccion de duracion y el condicionamiento por caption permiten generar respuestas con una entonacion controlada; el repositorio Irodori-TTS-Server ofrece una API compatible con OpenAI para integrarlo en un backend conversacional.
- Produccion de contenido para videojuegos: el control de estilo por emojis y el diseno de voz por caption permiten crear voces de personaje diferenciadas sin necesidad de grabar actores para cada linea de dialogo.
- Accesibilidad: conversion de documentos y textos largos en japones a voz, con seleccion de una voz concreta por clonacion para mantener consistencia en lecturas extensas.
- Prototipado rapido de voces para produccion audiovisual: antes de contratar una locucion definitiva, el equipo puede generar muestras con distintas descripciones de voz y estilo para validar direccion creativa.
- Investigacion en TTS zero-shot y flow matching: al publicar codigo de entrenamiento e inferencia, permite reproducir y extender el enfoque RF-DiT sobre latentes DACVAE en japones.
- Generacion de efectos vocales no verbales: los emojis permiten insertar risas, toses o suspiros en el audio, util para contenido de entretenimiento o podcast.

## Benchmarks y rendimiento

Los resultados publicados corresponden a evaluaciones internas del autor con cinco semillas consecutivas (0 a 4); los valores se expresan como media y desviacion estandar poblacional. Los conjuntos Joyo Kanji Yomi Benchmark, JSUT, Coco-Nut y JVS no formaron parte de los datos de entrenamiento.

Evaluacion de lectura en japones sin audio de referencia ni caption de Voice Design, inferencia FP32, 40 pasos RF y text CFG 3.0.

Joyo Kanji Yomi Benchmark: Parakeet Edition (13.536 frases, 4.512 pares kanji-lectura). El autor advierte que estos valores no deben compararse directamente con los resultados de la edicion original en las fichas de v4-Small y v4.1-Small.

| Modelo | Precision de lectura ↑ | Target Kana-CER ↓ | Target Kana-CER clipped ↓ | Sentence Kana-CER ↓ | Text CER ↓ |
|---|---|---|---|---|---|
| Irodori-TTS-v4.1-Small | 93,42 ± 0,04 % | 6,88 ± 0,08 % | 5,19 ± 0,05 % | 1,25 ± 0,01 % | 4,68 ± 0,06 % |
| Irodori-TTS-v4-Large | 92,80 ± 0,08 % | 7,96 ± 0,36 % | 5,78 ± 0,06 % | 1,51 ± 0,06 % | 4,87 ± 0,08 % |

JSUT BASIC5000 (resultado parcial disponible en la informacion proporcionada):

| Modelo | Sentence Kana-CER ↓ | Standard CER ↓ |
|---|---|---|
| Irodori-TTS-v4.1-Small | 3,43 ± 0,01 % | 7,22 ± 0,12 % |
| Irodori-TTS-v4-Large | No disponible (dato truncado en la informacion recibida) | No disponible |

Para el resto de benchmarks mencionados en la model card (Coco-Nut, JVS, evaluacion de adherencia a caption y benchmark de longitud de referencia) no se han facilitado los valores numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir de 3,29 B de parametros: aproximadamente 13,2 GB en FP32, 6,6 GB en BF16/FP16, 3,3 GB en INT8 y 1,7 GB en INT4. Son estimaciones aritmeticas; a ellas hay que sumar el codec DACVAE, el encoder T5Gemma 2, los latentes de referencia (hasta 120 s) y las activaciones del proceso de difusion.
- La model card reporta inferencia en FP32 con 40 pasos RF, lo que implica el mayor consumo de memoria entre las configuraciones documentadas.
- GPU profesionales: no se especifican modelos concretos en la informacion disponible. Por el perfil de memoria, una A100 o H100 de 40/80 GB permitiria FP32 con holgura.
- GPU de consumo: con 24 GB de VRAM (RTX 3090, RTX 4090) cabria BF16/FP16 con margen; en tarjetas de 16 GB seria recomendable INT8 y en tarjetas de 8-12 GB, INT4. Las variantes cuantizadas (torchao INT8, INT4, FP8) estan anunciadas pero no publicadas en el momento de redactar esta ficha.
- Opciones de despliegue: el autor remite al repositorio GitHub Aratako/Irodori-TTS para el codigo de inferencia e instalacion, y menciona Irodori-TTS-Server como servidor de API compatible con OpenAI. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Irodori-TTS-v4-Large | 3,29 B | RF-DiT sobre latentes DACVAE | ja | Gemma | Encoder T5Gemma 2, predictor de duracion separado, referencias de hasta 120 s |
| Irodori-TTS-v4-Small | Aproximadamente 766 M | RF-DiT sobre latentes DACVAE | ja | Gemma | Version anterior de la misma familia, menor escala |
| Irodori-TTS-v4.1-Small | No disponible | RF-DiT sobre latentes DACVAE | ja | Gemma | Mejor precision de lectura que v4-Large en el benchmark Joyo Kanji Yomi (Parakeet Edition) |
| Echo-TTS | No disponible | Flow matching con latentes DACVAE | No disponible | No disponible | Referencia arquitectonica del proyecto, segun el repositorio oficial |

## Limitaciones y advertencias

- Solo soporta japones; no se documenta capacidad multilingue.
- La licencia es Gemma, lo que impone condiciones especificas para uso comercial que deben revisarse antes de desplegar el modelo en produccion.
- Riesgo de alucinacion en la sintesis de lectura: en el benchmark Joyo Kanji Yomi (Parakeet Edition) la precision de lectura es del 92,80 %, con un Text CER del 4,87 %, lo que implica errores de lectura de kanji en una proporcion no despreciable de casos.
- La clonacion de voz plantea riesgos de suplantacion de identidad y uso fraudulento; el modelo incorpora marcas de agua SilentCipher en las salidas, pero esto no impide por si solo el uso indebido.
- Para referencias largas, el autor recomienda concatenar varios clips cortos del mismo hablante; el uso de una grabacion larga unica no ha sido evaluado y los resultados pueden diferir de los reportados.
- Los benchmarks publicados corresponden a evaluaciones internas con cinco semillas; los valores de v4.1-Small y v4-Large del benchmark Parakeet Edition no son comparables con los de la edicion original usados en fichas anteriores.
- No hay datos publicados de sesgos especificos, comportamiento en dominios fuera del japones estandar ni estabilidad en textos muy largos.
- El modelo no ofrece tool calling, function calling ni capacidades de agente, por lo que en un sistema conversacional debe integrarse con un LLM externo que gestione el dialogo.
- Las cuantizaciones anunciadas (INT8, INT4, FP8) no estaban disponibles en el momento de redactar esta ficha, de modo que el despliegue en hardware limitado depende de la ruta FP32/BF16 documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aratako/Irodori-TTS-v4-Large
- Repositorio de codigo: https://github.com/Aratako/Irodori-TTS
- Demo Space: https://huggingface.co/spaces/Aratako/Irodori-TTS-v4-Large-Demo
- Variantes cuantizadas (planificadas): https://huggingface.co/Aratako/Irodori-TTS-v4-Large-Quantized
- Codec Semantic-DACVAE-Japanese-32dim: https://huggingface.co/Aratako/Semantic-DACVAE-Japanese-32dim
- Encoder T5Gemma 2: https://huggingface.co/google/t5gemma-2-1b-1b
- Documentacion de anotaciones por emojis: https://github.com/Aratako/Irodori-TTS/blob/main/EMOJI_ANNOTATIONS.md
- SilentCipher (marcado de agua): https://github.com/sony/silentcipher
- Joyo Kanji Yomi Benchmark: Parakeet Edition: https://github.com/Parakeet-Inc/Joyo-Kanji-Yomi-Benchmark-Parakeet-Edition
- Coleccion Irodori-TTS en HuggingFace: https://huggingface.co/collections/Aratako/irodori-tts
- Perfil del autor en GitHub: https://github.com/Aratako
- README del repositorio: https://raw.githubusercontent.com/Aratako/Irodori-TTS/refs/heads/main/README.md
