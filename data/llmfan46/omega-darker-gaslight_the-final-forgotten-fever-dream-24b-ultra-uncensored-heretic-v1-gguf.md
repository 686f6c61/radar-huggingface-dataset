# llmfan46/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v1-GGUF

## Resumen

Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v1-GGUF es una distribucion en formato GGUF de un modelo de lenguaje de 23.572 millones de parametros (aproximadamente 24B), publicado por el usuario independiente llmfan46. Se trata de una version "decensored" o "abliterated" del modelo ReadyArt/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B, obtenida aplicando la herramienta Heretic v1.2.0 con el metodo Arbitrary-Rank Ablation (ARA) para reducir los rechazos y el comportamiento de censura del modelo original.

El modelo esta orientado explicitamente a generacion de texto creativo sin restricciones: roleplay, narrativa erotica (ERP), terror y violencia, con la etiqueta "not-for-all-audiences". No es un modelo de proposito general para produccion empresarial, sino una pieza de la escena de modelos "unaligned" y "heretic" que prioriza la ausencia de negativas sobre la alineacion de seguridad. Segun la model card, reduce los rechazos de 91/100 a 2/100 manteniendo una divergencia KL de 0,0262 respecto al original.

El repositorio incluye unicamente cuantizaciones GGUF (desde BF16 hasta Q5_K_S y otras), lo que lo hace desplegable en llama.cpp y entornos compatibles con GGUF. El modelo solo declara soporte de ingles, no dispone de licencia explicita y su model card esta dominada por llamadas a donaciones y avisos de limites de almacenamiento del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles; derivado de un modelo base de 24B) |
| Parametros totales | 23.572.403.200 (23,57B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S (y otras del repo) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF |
| Modelo base | llmfan46/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v1 (a su vez derivado de ReadyArt/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B) |
| Metodo de decensurado | Heretic v1.2.0 + Arbitrary-Rank Ablation (ARA) |
| Componentes objetivo | attn.out_proj |
| Tamano del repo | 139,0 GB |
| Descargas / likes | 254 / 5 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base (numero de capas, dimension oculta, tipo de atencion, contexto maximo) ni los datos de entrenamiento originales. Lo que si se documenta es el proceso de modificacion: se aplico Heretic v1.2.0 con el metodo Arbitrary-Rank Ablation (ARA) sobre el modelo ReadyArt/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B. La ablacion se ejecuto sobre las capas 10 a 34 (start_layer_index 10, end_layer_index 34) y afecto especificamente a la proyeccion de salida de atencion (attn.out_proj).

Los hiperparametros de ablacion reportados son: preserve_good_behavior_weight 0,6256, steer_bad_behavior_weight 0,0001, overcorrect_relative_weight 1,0453 y neighbor_count 5. El resultado declarado es una reduccion de rechazos de 91/100 a 2/100 con una divergencia KL de 0,0262 frente al original, lo que indica que la distribucion de salida se mantiene relativamente cercana al modelo de partida. No se documentan fases de RLHF, DPO ni datos de preentrenamiento o ajuste fino en la informacion proporcionada.

## Capacidades

- Generacion de texto en ingles con enfasis en narrativa creativa, roleplay y ficcion explicita.
- Escritura de contenido para adultos (ERP, erotica) y tematicas de terror y violencia sin las restricciones tipicas de modelos alineados.
- Reduccion drastica de rechazos y moralizacion: la model card reporta 2/100 negativas frente a 91/100 del original.
- Conversacion multi-turno orientada a personajes y escenarios de rol.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo "thinking".
- Capacidad multilingue limitada al ingles segun los metadatos del modelo.
- Razonamiento fisico basico preservado: PIQA acc_norm de 0,8308 frente a 0,8379 del original.

## Casos de uso

- Roleplay conversacional sin restricciones: el modelo esta disenado para mantener personajes y escenarios multi-turno sin negativas ni moralizacion, lo que lo hace adecuado para plataformas de rol interactivo y ficcion colaborativa.
- Narrativa de terror y ficcion violenta: la ablacion elimina los filtros que suelen suavizar escenas de violencia o horror, permitiendo generar prosa explicita para generos como splatter, cosmic horror o thriller oscuro.
- Escritura erotica asistida: orientado a autores que necesitan generar contenido adulto sin las interrupciones y advertencias de modelos alineados.
- Generacion de dialogos para videojuegos con clasificacion para adultos: util para guionistas de titulos con contenido M-rated que requieran dialogos sin censura.
- Prototipado de personajes "unaligned" en investigacion: sirve como caso de estudio de tecnicas de abliteration (Heretic/ARA) y de su impacto en la tasa de rechazos y la calidad del modelo.
- Experimentacion local con llama.cpp: al distribuirse en GGUF, puede ejecutarse en estaciones de trabajo con GPU consumer para pruebas de generacion creativa sin dependencia de APIs.
- Analisis de sesgos y seguridad: util como contrapunto en estudios sobre comportamiento de modelos decensurados y eficacia de las tecnicas de alineacion.

## Benchmarks y rendimiento

| Benchmark | Metrica | Modelo original | Modelo heretic (este) |
|---|---|---|---|
| PIQA | acc | 0,8221 ± 0,0089 | 0,8248 ± 0,0089 |
| PIQA | acc_norm | 0,8379 ± 0,0086 | 0,8308 ± 0,0087 |
| Rechazos (100 prompts) | tasa | 91/100 | 2/100 |
| Divergencia KL vs original | KL | 0 (por definicion) | 0,0262 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. Los unicos datos cuantitativos son los de PIQA y las metricas internas de ablacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 48 GB para BF16 (23,57B × 2 bytes); unos 25 GB para Q8_0; unos 19-20 GB para Q6_K; unos 16-17 GB para Q5_K_M; unos 15-16 GB para Q5_K_S (estimaciones a partir del numero de parametros, no publicadas por el autor).
- GPU recomendadas: A100 80 GB o H100 para BF16; RTX 4090 (24 GB) o A6000 (48 GB) para Q8_0 y cuantizaciones menores.
- Cabe en GPU consumer: si, en cuantizaciones Q5 y Q6 en tarjetas de 24 GB (RTX 3090, RTX 4090); Q8_0 requiere 32 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (Omega-Darker-Gaslight 24B heretic GGUF) | 23,57B | no disponible | Roleplay/ERP sin censura, ingles | no disponible | GGUF |
| ReadyArt/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B (original) | ~24B | no disponible | Roleplay/ERP, alineacion estandar | no disponible | safetensors |
| Modelos abliterated de la escena (p. ej. variantes heretic de 7B-13B) | 7B-13B | variable | Roleplay sin censura | variable | GGUF/safetensors |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoria en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato y enfoque.

## Limitaciones y advertencias

- Contenido explicito y potencialmente perturbador: el modelo esta etiquetado como "not-for-all-audiences" e incluye roleplay erotico, violencia y terror; no es apto para entornos profesionales, educativos ni de atencion al cliente.
- Sin alineacion de seguridad: la ablacion elimina deliberadamente los mecanismos de rechazo, por lo que puede generar contenido danino, ilegal o eticamente problemático sin advertencia.
- Riesgo elevado de alucinacion: al ser un modelo de rol sin ajuste para precision factual, no debe usarse para consultas de informacion.
- Solo ingles: los metadatos declaran unicamente el idioma en; el rendimiento en castellano no esta garantizado.
- Licencia no disponible: la ausencia de licencia explicita impide determinar si el uso comercial esta permitido; se recomienda tratar el modelo como no apto para produccion comercial hasta aclararlo.
- Contexto no documentado: se desconoce la ventana de contexto maxima, lo que limita la planificacion de cargas con documentos largos.
- Origen comunitario y sin garantias: publicado por un contribuidor independiente, sin evaluacion externa ni mantenimiento garantizado; el autor advierte que ha alcanzado el limite de almacenamiento gratuito de Hugging Face.
- Degradacion menor de capacidades: PIQA acc_norm baja de 0,8379 a 0,8308, lo que sugiere una perdida leve de rendimiento tras la ablacion.
- Sesgos no evaluados: no se han publicado analisis de sesgos de genero, raza o religion para este modelo.

## Enlaces

- Modelo en Hugging Face (GGUF): https://huggingface.co/llmfan46/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v1-GGUF
- Modelo base (safetensors): https://huggingface.co/llmfan46/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v1
- Modelo original de ReadyArt: https://huggingface.co/ReadyArt/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B
- Heretic (herramienta de decensurado): https://github.com/p-e-w/heretic
- PR de Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Patreon del autor: https://patreon.com/LLMfan46
- Ko-fi del autor: https://ko-fi.com/llmfan46
