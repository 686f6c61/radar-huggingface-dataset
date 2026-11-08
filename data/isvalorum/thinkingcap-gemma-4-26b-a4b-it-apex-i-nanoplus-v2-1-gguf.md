# IsValorum/ThinkingCap-gemma-4-26B-A4B-it-APEX-I-NanoPlus-V2.1-GGUF

## Resumen

ThinkingCap Gemma-4 26B-A4B es una variante ajustada del modelo gemma-4-26B-A4B-it de Google DeepMind (2026), un transformer de mezcla de expertos (MoE) con capacidad de entrada de imagen. El ajuste lo desarrolla bottlecapai mediante su tecnica de post-entrenamiento "shorter-thinking" (ThinkingCap), cuyo objetivo es reducir el numero de tokens de razonamiento sin degradar la calidad de las respuestas: segun el autor, recorta los tokens de razonamiento un 38,9% de media (entre un 14% y un 69% segun el benchmark) manteniendo una precision media del 75,0% frente al 75,2% del modelo base.

La ficha que nos ocupa no es el modelo original, sino una cuantizacion GGUF del mismo publicada por IsValorum dentro de su serie APEX. En concreto, la variante NanoPlus ocupa 9,92 GiB en disco y aplica una cuantizacion quirurgica por tensor auditada desde el propio GGUF: capas de atencion en Q4_K/Q6_K, proyecciones densas del FFN en IQ4_NL/Q4_K, expertos enrutados en IQ2_XXS/IQ2_S/IQ3_XXS/Q5_0/IQ4_NL, normalizaciones y parametros de routing en F32, y embeddings en Q6_K.

El modelo base declara 25.233.142.046 parametros totales (unos 25,2 mil millones) con activacion de aproximadamente 4 mil millones (A4B), y esta pensado para despliegue local en llama.cpp con soporte de entrada multimodal imagen-texto. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`gemma4`), con entrada de imagen (image-text-to-text) |
| Parametros totales | 25.233.142.046 (aprox. 25,2 B) |
| Parametros activos | aprox. 4 B (designacion A4B; valor exacto no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con mezcla por tensor: Q4_K, Q6_K, IQ4_NL, Q5_0, IQ2_S, IQ2_XXS, IQ3_XXS y F32; tamano del repo 10,7 GB (variante NanoPlus: 9,92 GiB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura es `gemma4`, un transformer de mezcla de expertos con 30 bloques (se observan tensores `blk.[N].*` para N de 0 a 29), atencion con normalizaciones QK (`attn_q_norm`, `attn_k_norm`), parametros de escala por bloque (`layer_output_scale`), y capas FFN con expertos enrutados (`ffn_gate_up_exps`, `ffn_down_exps`) mas un router (`ffn_gate_inp`) en F32. El modelo acepta imagenes ademas de texto, segun el pipeline declarado `image-text-to-text`.

El post-entrenamiento original de bottlecapai (ThinkingCap) reduce la longitud de las cadenas de razonamiento mediante una estrategia de "shorter-thinking" aplicada sobre gemma-4-26B-A4B-it. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO. La cuantizacion de IsValorum se calculo con una iMatrix derivada del propio modelo base y aplica precision diferencial por tensor: los expertos enrutados `ffn_gate_up_exps` se comprimen agresivamente (IQ2_XXS en 12 bloques, IQ2_S en 14, IQ3_XXS en 4), mientras que las normalizaciones, el router y los parametros estructurales se conservan en F32 (271 tensores F32 observados).

## Capacidades

- Generacion de texto conversacional multi-turno (tag `conversational`).
- Razonamiento con modo de pensamiento reducido (herencia de ThinkingCap): menos tokens de razonamiento a cambio de mantener precision.
- Entrada multimodal imagen-texto: el pipeline declarado es `image-text-to-text`.
- Mezcla de expertos con activacion dispersa (aprox. 4 B activos de 25,2 B totales), lo que reduce el coste de inferencia por token.
- Compatible con endpoints (`endpoints_compatible`) y con el ecosistema llama.cpp.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: la variante NanoPlus (9,92 GiB) permite ejecutar un MoE de 25 B con activacion de 4 B en tarjetas de 12-16 GB de VRAM mediante llama.cpp, con calidad cercana al modelo base segun el autor.
- Asistentes conversacionales con razonamiento acotado: el ajuste ThinkingCap reduce los tokens de pensamiento un 38,9% de media, lo que abarata la latencia y el coste por respuesta en chats de atencion al usuario donde no se requiere cadena de razonamiento larga.
- Procesamiento de documentos con imagenes: al aceptar entrada imagen-texto, puede emplearse para extraer informacion de capturas, diagramas o formularios escaneados en pipelines locales sin salida a la nube.
- Prototipado e investigacion en entornos sin conectividad: al ser GGUF con licencia Apache 2.0, se puede desplegar en maquinas aisladas para experimentar con modelos MoE multimodales sin depender de APIs externas.
- Evaluacion comparativa de cuantizaciones: la publicacion incluye un mapa por tensor auditado (`tensor-map.tsv`), util para estudiar el impacto de precisiones mixtas (IQ2_XXS frente a Q5_0) en la calidad de salida.
- Integracion en herramientas de escritorio basadas en llama.cpp: al estar en formato GGUF y ser compatible con endpoints, encaja en frontends locales tipo Ollama o servidores compatibles con la API de llama.cpp para asistentes de escritorio.
- Fine-tuning o destilado posterior sobre la variante MiniPlus: con 12,03 GiB y mayor precision, sirve como punto de partida cuando se necesita mas fidelidad que la ofrecida por NanoPlus.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible corresponden al modelo base ajustado por bottlecapai, no a esta cuantizacion concreta:

| Metrica | ThinkingCap gemma-4-26B-A4B-it | gemma-4-26B-A4B-it (base) |
|---|---|---|
| Precision media | 75,0% | 75,2% |
| Reduccion de tokens de razonamiento (media) | 38,9% | referencia |
| Rango de reduccion por benchmark | 14% a 69% | referencia |

No se han publicado resultados de benchmarks especificos de la cuantizacion APEX-I NanoPlus V2.1 en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: la variante NanoPlus ocupa 9,92 GiB en disco; con overhead de contexto y cache KV se recomienda un minimo de 12 GB de VRAM para contextos moderados. La variante MiniPlus (12,03 GiB) requiere al menos 14-16 GB.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB) para NanoPlus; A100 o H100 para despliegues con mayor concurrencia o contexto.
- Cabe en GPU de consumo: si, en tarjetas de 12 GB o mas con la variante NanoPlus, y en 16 GB con MiniPlus.
- Opciones de despliegue: llama.cpp (formato nativo), servidores compatibles con endpoints, y frontends que consuman GGUF. vLLM y TGI no soportan GGUF de forma nativa, por lo que no se recomiendan para este artefacto.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser MoE con aprox. 4 B activos, el coste por token deberia aproximarse al de un modelo denso de ese tamano, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ThinkingCap gemma-4-26B-A4B-it APEX-I NanoPlus V2.1 (esta ficha) | 25,2 B totales / aprox. 4 B activos | no disponible | Apache 2.0 | GGUF (9,92 GiB) | Cuantizacion mixta agresiva en expertos (IQ2_XXS/IQ2_S) |
| ThinkingCap gemma-4-26B-A4B-it APEX-I MiniPlus V2.1 | 25,2 B totales / aprox. 4 B activos | no disponible | Apache 2.0 | GGUF (12,03 GiB) | Mayor precision, mayor huella |
| bottlecapai/ThinkingCap-gemma-4-26B-A4B-it (original) | 25,2 B totales / aprox. 4 B activos | no disponible | Apache 2.0 (heredada del base) | safetensors | Precision completa; requiere mucha mas VRAM |
| gemma-4-26B-A4B-it (Google DeepMind) | 25,2 B totales / aprox. 4 B activos | no disponible | no disponible | no disponible | Modelo base sin ajuste ThinkingCap |

No se dispone de datos de benchmarks de terceros ni de modelos alternativos de la misma categoria en la informacion proporcionada para ampliar la comparativa.

## Limitaciones y advertencias

- La cuantizacion NanoPlus comprime los expertos enrutados `ffn_gate_up_exps` hasta IQ2_XXS e IQ2_S en 26 de los 30 bloques; es esperable cierta perdida de calidad frente al modelo base, aunque el autor no publica mediciones de degradacion para esta variante.
- El ajuste ThinkingCap reduce tokens de razonamiento, lo que puede afectar a tareas que se benefician de cadenas de pensamiento largas (matematicas complejas, demostraciones formales).
- No hay informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad del modelo base ni de la cuantizacion.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento uniforme fuera del ingles sin validacion previa.
- Longitud de contexto no disponible: debe comprobarse en el configuracion del modelo antes de usarlo en produccion con documentos largos.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base de Google DeepMind; conviene revisar los terminos de gemma-4-26B-A4B-it por si imponen restricciones adicionales de uso aceptable.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta: no hay evidencia de comunidad que valide la calidad del artefacto.
- La model card indica que el computo se financio de forma independiente y pide donaciones; no es una advertencia tecnica, pero conviene tener en cuenta que no hay soporte oficial.
- El pipeline declarado es `image-text-to-text`, pero no se detalla la resolucion de imagen soportada ni el preprocesado recomendado.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/IsValorum/ThinkingCap-gemma-4-26B-A4B-it-APEX-I-NanoPlus-V2.1-GGUF
- Variante MiniPlus: https://huggingface.co/IsValorum/ThinkingCap-gemma-4-26B-A4B-it-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base ajustado (bottlecapai): https://huggingface.co/bottlecapai/ThinkingCap-gemma-4-26B-A4B-it
- GGUF del modelo base con iMatrix: https://huggingface.co/bottlecapai/ThinkingCap-gemma-4-26B-A4B-it-GGUF
- Blog de bottlecapai sobre ThinkingCap gemma-4-26B-A4B: https://bottlecapai.com/post/thinkingcap-gemma-4-26b/
- Apoyo al autor de la cuantizacion: https://ko-fi.com/isvalorum
