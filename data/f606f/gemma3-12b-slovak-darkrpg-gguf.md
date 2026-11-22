# F606F/Gemma3-12B-Slovak-DarkRPG-GGUF

## Resumen

Gemma3-12B-Slovak-DarkRPG es un ajuste fino (fine-tune) en eslovaco del modelo Gemma 3 de 12B, construido sobre la base no censurada `braindao/gemma-3-12b-it-uncensored`, que a su vez deriva de `google/gemma-3-12b-it`. Lo desarrolla el usuario F606F y se distribuye exclusivamente en formato GGUF cuantizado Q4_K_M, pensado para su ejecución local con llama.cpp, Ollama y herramientas compatibles. Su propósito no es reentrenar el idioma, sino especializar el modelo en narración de rol y ficción oscura en eslovaco: crónicas de vampiros, horror en múltiples subgéneros, steampunk de inspiración verniana, zonas radiactivas, supervivencia abisal y fantasía oscura con alquimia e intrigas palaciegas.

El modelo conserva la arquitectura multimodal de Gemma 3, incluyendo el proyector de imágenes (`mmproj`), aunque el ajuste se aplicó únicamente sobre la torre de lenguaje. Cuenta con 11.766.034.176 parámetros y se publica con una única cuantización Q4_K_M junto a un proyector `mmproj-f16.gguf`. La licencia es la de Gemma Terms of Use, heredada del modelo base.

Su relevancia es acotada pero concreta: cubre un nicho poco atendido (narrativa de rol oscura en eslovaco) sobre un modelo denso de 12B que cabe en GPU de consumo con cuantización de 4 bits, y lo hace sobre una base deliberadamente no alineada con preferencias humanas, lo que condiciona tanto su tono como sus riesgos de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Gemma 3), ajuste LoRA sobre la torre de lenguaje; proyector de visión `mmproj` conservado |
| Parametros totales | 11.766.034.176 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; los ejemplos de despliegue usan `--ctx-size 65536` (64K) con llama-server, pero no se especifica el máximo entrenado |
| Tipos de cuantizacion | Q4_K_M (modelo principal) y F16 (proyector `mmproj-f16.gguf`); no se publican otras cuantizaciones |
| Idiomas soportados | Eslovaco (sk), con herencia multilingüe del base Gemma 3 |
| Licencia | Gemma Terms of Use (`license: gemma`) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 3 12B en su variante instruct no censurada. El ajuste se realizó con Unsloth QLoRA: configuración `FastModel` con `r = 16`, `lora_alpha = 32` y `max_seq_length = 1024`, durante 450 pasos (una época con batch efectivo de 8), con `learning_rate = 1e-4` y optimizador `adamw_8bit`. No se reentrenó la torre de visión, por lo que la capacidad multimodal del base se mantiene a través del proyector `mmproj` original.

El dataset de ajuste suma 3.600 muestras. El 30 % corresponde a carácter oscuro de rol y horror: 180 escenarios originales en eslovaco, de uno y varios turnos, ponderados seis veces (1.080 muestras) y repartidos entre vampiros, horror cósmico, psicológico, gótico, folk-horror eslavo, biológico, analógico, claustrofóbico, oculto y marítimo, además de steampunk, zonas radiactivas, supervivencia abisal y fantasía oscura. El resto equilibra capacidades generales: 900 muestras de matemáticas, lógica y código en eslovaco (`dfm13-multilingual-math-code-sk`), 800 de razonamiento general y fluidez multiturno (`dfm13-multilingual-openhermes-sk`), 520 de `mbenco/slovak-sft` y 300 de `dfm13-multilingual-multiturn-sk`. No se documenta ninguna fase de RLHF o DPO posterior; el modelo hereda el estado de alineación del base no censurado.

## Capacidades

- Generación de texto narrativo en eslovaco con registro literario, tono atmosférico y coherencia multiturno.
- Interpretación de roles (roleplay) con personas definidas mediante system prompt: vampiro anciano, farero solitario, asesor de estación espacial, capitán de submarino de vapor, entre otros.
- Narración de horror en subgéneros diversos (cósmico, psicológico, gótico, folk-horror eslavo, biológico, analógico, claustrofóbico, oculto, marítimo).
- Construcción de escenarios de fantasía oscura: alquimia, gremios de ladrones, intrigas cortesanas, ciudades de aceite de ballena.
- Razonamiento general y matemáticas en eslovaco, gracias a las muestras de `dfm13-multilingual-math-code-sk`.
- Generación de código y lógica en eslovaco, con cobertura limitada por el volumen de datos (900 muestras).
- Entrada de imágenes (multimodal) mediante el proyector `mmproj-f16.gguf` y `llama-mtmd-cli`; la calidad de la descripción visual en eslovaco no está documentada.
- Conversación multiturno con plantilla de chat Gemma 3 (`<start_of_turn>user` / `<end_of_turn>`).
- Compatibilidad con endpoints y herramientas que consumen GGUF (Ollama, llama.cpp, LM Studio, KoboldCpp, Jan).
- No se documenta soporte explícito de tool calling, function calling ni razonamiento agéntico multi-paso.

## Casos de uso

- **Motor de narración para partidas de rol por texto:** el modelo actúa como director de juego en eslovaco, manteniendo personas coherentes a lo largo de sesiones multiturno gracias a los 180 escenarios originales y a la ventana configurable de hasta 64K en llama-server. Adecuado por su especialización en tono oscuro y su capacidad de sostener atmósfera.
- **Generación de ficción de horror y fantasía oscura:** escritura asistida de relatos góticos, cósmico o folk-horror eslavo, con control de registro mediante system prompt. La ponderación 6× de los escenarios oscuros favorece este dominio frente a la conversación genérica.
- **Creación de contenido para videojuegos narrativos:** generación de diálogos de PNJ, descripciones de entornos (ciudades de aceite de ballena, zonas radiactivas, submarinos de vapor) y ramificaciones argumentales en eslovaco, ejecutables en local sin coste por token.
- **Prototipado de aventuras conversacionales:** integración en `llama-server` con `--jinja` y contexto de 64K para servir una API compatible con OpenAI endpoints y conectar un frontend de chat o una interfaz de juego.
- **Asistente de escritura con memoria de contexto largo:** redacción y revisión de capítulos completos en eslovaco, apoyándose en la ventana extendida y en el cacheo de KV en q8_0 para reducir memoria.
- **Análisis de imágenes con contexto narrativo:** uso de `llama-mtmd-cli` para describir ilustraciones, mapas o bocetos y convertirlos en texto atmosférico en eslovaco, aprovechando el proyector multimodal heredado.
- **Despliegue local en estación de trabajo con GPU de consumo:** ejecución con `-ngl 99` en una GPU única de 16-24 GB, útil para talleres de escritura o demos sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia:** el repositorio ocupa 8,2 GB e incluye el GGUF Q4_K_M y el proyector F16. Con Q4_K_M se estima un uso de VRAM de aproximadamente 8-9 GB para el modelo, más el overhead de contexto; con `--ctx-size 65536` y caché KV en q8_0 el consumo adicional crece de forma notable.
- **GPU recomendadas:** no hay recomendaciones oficiales en la model card. Por tamaño, una RTX 4090 (24 GB) o RTX 4080 (16 GB) permiten cargar el modelo completo en GPU con `-ngl 99`; una RTX 4070 Ti o 4070 (12 GB) puede requerir reducir capas offloaded o el tamaño de contexto. Para servicio concurrente, A100 o H100 dan margen para contextos largos y varios usuarios.
- **¿Cabe en GPU de consumo?** Sí, en GPUs de 12 GB o más con Q4_K_M y contexto moderado; con 16 GB o más se puede ampliar el contexto y mantener el proyector multimodal cargado.
- **Opciones de despliegue:** Ollama (`ollama run hf.co/F606F/Gemma3-12B-Slovak-DarkRPG-GGUF:Q4_K_M`), llama.cpp (`llama-cli`, `llama-mtmd-cli`, `llama-server`), LM Studio, KoboldCpp y Jan. No se documenta compatibilidad con vLLM ni TGI, que requieren formatos distintos de GGUF.
- **Parámetros de generación recomendados por el autor:** temperatura 0,55-0,65, top-k 64, top-p 0,95, min-p 0,08, repeat penalty 1,05-1,08.
- **Latencia y throughput:** no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / licencia | Notas |
|---|---|---|---|---|
| Gemma3-12B-Slovak-DarkRPG (este) | 11,77B densos | no disponible (ejemplos con 64K) | GGUF Q4_K_M / Gemma Terms | Fine-tune eslovaco de rol oscuro sobre base no censurada |
| braindao/gemma-3-12b-it-uncensored (base) | 12B densos | el del base Gemma 3 | safetensors y GGUF derivados / Gemma Terms | Base no alineada; sin especialización en eslovaco ni en rol |
| google/gemma-3-12b-it | 12B densos | el oficial de Gemma 3 | safetensors / Gemma Terms | Modelo instruct alineado, multilingüe, sin especialización temática |
| mradermacher/gemma-3-12b-it-uncensored-GGUF | 12B densos | el del base | GGUF / Gemma Terms | Conversión GGUF del mismo base, origen del `mmproj`; sin fine-tune eslovaco |

No se dispone de benchmarks comparativos publicados para este ajuste, por lo que la comparación se limita a parámetros, formato, licencia y origen. No se identifican en la información disponible otros fine-tunes eslovacos de 12B directamente comparables.

## Limitaciones y advertencias

- **Base no censurada y sin alineación con preferencias humanas:** el modelo puede generar contenido problemático, oscuro o falso; el autor lo advierte explícitamente. No es apto para producción orientada al público sin filtros y moderación adicionales.
- **Riesgo elevado de alucinación:** la ponderación de escenarios de ficción y el ajuste sobre una base no alineada incrementan la probabilidad de inventar hechos, especialmente fuera del dominio narrativo.
- **Cobertura de idioma limitada:** el ajuste está orientado al eslovaco; el rendimiento en castellano u otros idiomas depende del base Gemma 3 y no está evaluado.
- **Contexto no documentado:** no se especifica la longitud de contexto entrenada; los 64K de los ejemplos son una configuración de despliegue, no una garantía de calidad en ventanas largas.
- **Entrenamiento corto y de bajo rango:** 450 pasos, LoRA con `r = 16` y `max_seq_length = 1024`; la especialización es superficial y puede degradar capacidades generales del base en tareas ajenas al rol y la ficción.
- **Cuantización única:** solo se publica Q4_K_M, lo que limita el ajuste fino de calidad/velocidad y la comparación con otras precisiones.
- **Licencia Gemma Terms of Use:** impone restricciones de uso comercial y obligaciones de atribución; debe revisarse antes de cualquier despliegue en producto.
- **Sin benchmarks:** no hay datos objetivos de rendimiento que respalden las capacidades declaradas.
- **Adopción nula:** 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria del ajuste.
- **Multimodalidad no verificada:** el proyector se hereda del base, pero no se documenta la calidad de las respuestas visuales tras el fine-tune en eslovaco.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/F606F/Gemma3-12B-Slovak-DarkRPG-GGUF
- Modelo base no censurado: https://huggingface.co/braindao/gemma-3-12b-it-uncensored
- Conversión GGUF del base (origen del `mmproj`): https://huggingface.co/mradermacher/gemma-3-12b-it-uncensored-GGUF
- Modelo original de Google: https://huggingface.co/google/gemma-3-12b-it
- Unsloth (entrenamiento y exportación): https://github.com/unslothai/unsloth
- Dataset `schneiderkamplab/dfm13-multilingual-math-code-sk`: https://huggingface.co/datasets/schneiderkamplab/dfm13-multilingual-math-code-sk
- Dataset `schneiderkamplab/dfm13-multilingual-openhermes-sk`: https://huggingface.co/datasets/schneiderkamplab/dfm13-multilingual-openhermes-sk
- Dataset `schneiderkamplab/dfm13-multilingual-multiturn-sk`: https://huggingface.co/datasets/schneiderkamplab/dfm13-multilingual-multiturn-sk
- Dataset `mbenco/slovak-sft`: https://huggingface.co/datasets/mbenco/slovak-sft
- Licencia Gemma Terms of Use: https://ai.google.dev/gemma/terms
