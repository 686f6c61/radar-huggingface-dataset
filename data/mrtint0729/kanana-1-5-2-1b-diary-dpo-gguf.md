# mrtint0729/kanana-1.5-2.1b-diary-dpo-gguf

## Resumen
kanana-1.5-2.1b-diary-dpo-gguf es una cuantizacion GGUF publicada por el usuario mrtint0729 (bajo la marca Alpharium) sobre el modelo base kakaocorp/kanana-1.5-2.1b-instruct-2505 de Kakao Corp. Se trata de un ajuste fino especializado en la generacion de entradas de diario en coreano para uso on-device, pensado para integrarse en la aplicacion Pocketlog. El modelo parte de un transformer denso de 2.086.984.704 parametros (aproximadamente 2,1 mil millones) y ha pasado por un pipeline de SFT seguido de DPO para alinear el estilo y el formato de salida con el caso de uso del diario.

La relevancia de esta ficha reside en que ejemplifica el patron de modelos pequenos y muy especializados que se distribuyen ya cuantizados para ejecucion local. El repositorio incluye un unico fichero GGUF de 1.241.435.520 bytes (1183,9 MiB, aproximadamente 1,156 GiB), lo que lo situa en el rango de modelos que caben comodamente en memoria de dispositivos moviles y portatiles. La licencia es Apache-2.0, heredada del modelo base, lo que permite uso comercial sin restricciones adicionales.

La informacion disponible es limitada: la model card se centra en metadatos de release, parametros de muestreo y opciones de runtime, y no detalla la composicion del dataset de entrenamiento ni resultados de benchmarks. Esta ficha refleja exclusivamente lo que el autor y los metadatos de Hugging Face declaran, marcando como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de kakaocorp/kanana-1.5-2.1b-instruct-2505) |
| Parametros totales | 2.086.984.704 (aproximadamente 2,1B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el autor recomienda `n_ctx=2048` en runtime |
| Tipos de cuantizacion | GGUF cuantizado (fichero unico `pocketlog-diary-v1.0.0.gguf`, 1.241.435.520 bytes); nivel de cuantizacion exacto (Q4_K_M, Q5_K_M, etc.) no especificado |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp) |

## Arquitectura y entrenamiento
El modelo es un ajuste fino del transformer denso kanana-1.5-2.1b-instruct-2505 de Kakao Corp, del que hereda la arquitectura base. Sobre ese punto de partida, el autor aplica un pipeline de SFT (supervised fine-tuning) seguido de DPO (direct preference optimization), segun indican las etiquetas del repositorio. El objetivo declarado es la generacion de entradas de diario en coreano para la aplicacion Pocketlog, de ahi las etiquetas `diary`, `on-device` y `conversational`.

La model card menciona una referencia interna a un experimento (`docs/experiments/EXP-018-dense-photo-compression.md`) y una version canonica "v4.3e", pero no se aportan datos sobre volumen de tokens de entrenamiento, composicion del dataset, mezcla de datos sinteticos o preferencias usadas en DPO. Tampoco se documenta ninguna innovacion arquitectonica propia: el valor diferencial esta en la especializacion y en la distribucion ya cuantizada. El repositorio incluye la etiqueta `imatrix`, lo que sugiere que la cuantizacion se ha calibrado con una matriz de importancia, una practica habitual en llama.cpp para preservar calidad en modelos pequenos.

## Capacidades
- Generacion de texto en coreano orientada a la redaccion de entradas de diario.
- Formato de salida restringido mediante gramatica GBNF (`root ::= [^A-Za-z]*`), que impide la emision de caracteres latinos y fuerza salida en hangul.
- Conversacion multi-turno basica, heredada del modelo instruct original.
- Ejecucion on-device mediante llama.cpp, con soporte de `flash_attn=true` y `n_ctx=2048`.
- Muestreo recomendado por el autor: `temperature=0.60`, `top_p=0.90`, `top_k=40`, `n_predict=512`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Vision, audio o modo thinking: no disponibles en la informacion proporcionada.
- Capacidades multilingues: limitadas al coreano segun los metadatos (`language: ko`).

## Casos de uso
- Diario personal en aplicacion movil: el modelo genera entradas de diario en coreano a partir de notas o eventos del dia, con salida restringida a hangul mediante gramatica GBNF y un tamano de 1,156 GiB que permite empaquetarlo en una app Android o iOS con llama.cpp.
- Procesamiento 100 % offline y privado: al ejecutarse on-device, los textos del diario no salen del dispositivo, lo que encaja con requisitos de privacidad de datos personales sensibles.
- Resumen y reescritura de notas diarias: el ajuste SFT+DPO orienta el estilo hacia un registro de diario, util para convertir listas de eventos en parrafos narrativos coherentes.
- Prototipado rapido de funciones conversacionales en coreano: con 2,1B parametros y contexto de 2048 tokens, sirve para validar flujos de chat en dispositivos de gama media antes de invertir en modelos mayores.
- Generacion de texto con formato controlado: la restriccion gramatical `[^A-Za-z]*` es reutilizable en pipelines que necesiten garantizar que la salida no contenga caracteres latinos, por ejemplo para normalizacion linguistica.
- Educacion y practica de escritura en coreano: el modelo puede proponer borradores de entradas de diario que el usuario edita, con latencia baja al ejecutarse localmente.
- Integracion en aplicaciones de bienestar o journaling: el modelo encaja en productos que registran estado de animo y actividades, siempre que el equipo valide la calidad real de las salidas con su propio conjunto de evaluacion, dado que no hay benchmarks publicados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM/RAM estimada para inferencia: el fichero GGUF ocupa 1.241.435.520 bytes (aproximadamente 1,16 GiB); se recomienda reservar entre 1,5 y 2,5 GB de memoria para pesos, KV cache y overhead del runtime con `n_ctx=2048`.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM puede ejecutarlo; tarjetas como RTX 3050, RTX 4060, RTX 4090 o superiores lo mueven con holgura. Tambien es viable en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU con memoria unificada suficiente.
- Despliegue: llama.cpp es el runtime de referencia (formato GGUF, opciones `flash_attn=true` y `n_ctx=2048` documentadas por el autor). No se documenta soporte para vLLM, TGI u Ollama en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, es razonable esperar decodificacion interactiva en CPU moderna y muy rapida en GPU, pero no hay cifras publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| mrtint0729/kanana-1.5-2.1b-diary-dpo-gguf | 2,1B | 2048 (runtime recomendado) | ko | Apache-2.0 | GGUF | Especializado en diario, ajuste SFT+DPO, sin benchmarks publicados |
| kakaocorp/kanana-1.5-2.1b-instruct-2505 | 2,1B | no disponible | ko (principal) | Apache-2.0 | safetensors | Modelo base instruct; mismo tamano, uso general |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | multilingue | Apache-2.0 | safetensors, GGUF | Alternativa multilingue de tamano similar; contexto mucho mayor |
| Llama-3.2-1B-Instruct | 1,2B | 131.072 | multilingue | Llama 3.2 Community License | safetensors, GGUF | Menor, contexto muy superior, licencia con restricciones de uso |

La comparativa se limita a caracteristicas declaradas; no hay datos de rendimiento del modelo de diario que permitan comparar calidad frente a estas alternativas.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados por el autor; al estar entrenado principalmente en coreano, puede reflejar sesgos culturales y linguisticos del corpus de origen.
- Riesgo de alucinacion: presente como en cualquier modelo de 2,1B; en generacion de diario el riesgo se traduce en inventar eventos o detalles que el usuario no ha proporcionado.
- Limitaciones de contexto e idioma: contexto de runtime recomendado de 2048 tokens, insuficiente para documentos largos; el modelo esta orientado al coreano y no declara capacidades multilingues.
- Restriccion gramatical: la gramatica `root ::= [^A-Za-z]*` impide caracteres latinos, lo que puede romper la salida si se necesitan nombres propios, siglas o numeros en alfabeto latino.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de ajuste, no documentadas en detalle.
- Trazabilidad: el autor es un particular (mrtint0729), no Kakao Corp; no hay benchmarks, evaluaciones independientes ni documentacion del dataset de SFT/DPO, lo que dificulta auditar la calidad en produccion.
- Nivel de cuantizacion no especificado: el fichero GGUF no declara el esquema exacto (Q4_K_M, Q5_K_M, etc.), lo que complica estimar la perdida de calidad respecto al modelo original.
- Fecha de creacion del repositorio (2026-11-20) posterior a la del modelo base; conviene comprobar la vigencia de los enlaces y del tag `model-v1.0.0`.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/mrtint0729/kanana-1.5-2.1b-diary-dpo-gguf
- Modelo base: https://huggingface.co/kakaocorp/kanana-1.5-2.1b-instruct-2505
- Fichero GGUF con tag fijo: https://huggingface.co/mrtint0729/kanana-1.5-2.1b-diary-dpo-gguf/resolve/model-v1.0.0/pocketlog-diary-v1.0.0.gguf
- llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
