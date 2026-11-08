# IsValorum/ThinkingCap-Gemma-4-26B-A4B-it-APEX-I-NanoPlus-V2.1-GGUF

## Resumen

ThinkingCap Gemma-4 26B-A4B it APEX-I NanoPlus V2.1 es una cuantizacion GGUF del modelo `bottlecapai/ThinkingCap-gemma-4-26B-A4B-it`, un ajuste fino de tipo post-entrenamiento sobre `gemma-4-26B-A4B-it` de Google DeepMind. El modelo base es un mixture-of-experts (MoE) multimodal con entrada de imagen, y ThinkingCap le aplica una fase de post-entrenamiento orientada a reducir el numero de tokens de razonamiento generados sin degradar la calidad de las respuestas. Segun la documentacion del autor del modelo base, la reduccion media de tokens de razonamiento es del 38,9% (con un rango del 14% al 69% segun el benchmark), manteniendo una precision media de 75,0% frente al 75,2% del modelo original.

La ficha que nos ocupa corresponde a la variante NanoPlus de la serie APEX de cuantizaciones de IsValorum, con un peso de 9,92 GiB en disco y un mapeo de cuantizacion por tensor auditado sobre el GGUF fisico. El repositorio tiene 10,7 GB y el modelo declara 25.233.142.046 parametros totales en safetensors (aproximadamente 25,2 mil millones), con licencia Apache 2.0 y pipeline `image-text-to-text`.

La relevancia practica de esta publicacion esta en dos frentes: por un lado, permite ejecutar un MoE multimodal de 26B en hardware de consumo gracias a la cuantizacion agresiva de los expertos enrutados (IQ2_S, IQ2_XXS, IQ3_XXS) manteniendo atencion y proyecciones densas en Q4_K; por otro, el ajuste ThinkingCap reduce el coste de inferencia en tokens de razonamiento, lo que abarata despliegues de agentes y razonamiento multi-paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma4` (transformer MoE con entrada de imagen, segun tags del repo) |
| Parametros totales | 25.233.142.046 (~25,2B) |
| Parametros activos | no disponible (A4B sugiere ~4B activos, no confirmado en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF mixta por tensor: Q4_K, Q6_K, IQ4_NL, Q5_0, IQ2_S, IQ2_XXS, IQ3_XXS, F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es `gemma-4-26B-A4B-it` de Google DeepMind, descrito como un mixture-of-experts con entrada de imagen. La nomenclatura "A4B" es coherente con un MoE de aproximadamente 4B parametros activos sobre un total de 26B, aunque la informacion proporcionada no confirma explicitamente esa cifra de activos. El mapa de tensores auditado del GGUF confirma la presencia de expertos enrutados (`ffn_gate_up_exps`, `ffn_down_exps`) y de un router (`ffn_gate_inp`) en F32, ademas de proyecciones densas (`ffn_gate`, `ffn_up`, `ffn_down`) y atencion estandar (`attn_q`, `attn_k`, `attn_v`, `attn_output`) en 30 bloques. Tambien aparecen tensores de normalizacion especificos (`attn_q_norm`, `attn_k_norm`, `post_ffw_norm_1`, `post_ffw_norm_2`, `pre_ffw_norm_2`) y `layer_output_scale`, lo que apunta a una arquitectura con innovaciones propias de la familia Gemma 4.

El ajuste ThinkingCap, desarrollado por bottlecapai, aplica un post-entrenamiento de "razonamiento corto" sobre el modelo instruct de Gemma 4. Segun la documentacion del autor, se reduce el numero de tokens de pensamiento en un 38,9% de media (14% a 69% segun el benchmark) manteniendo una precision media de 75,0% frente al 75,2% del modelo base. No se dispone en la informacion proporcionada de detalles sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La cuantizacion APEX-I NanoPlus utiliza una iMatrix derivada del GGUF oficial del modelo base (`ThinkingCap-gemma-4-26B-A4B-it-imatrix.gguf`) y aplica protecciones en F32 para 271 tensores (normalizaciones, router, `rope_freqs`, `layer_output_scale` y escalas de expertos).

## Capacidades

- Generacion de texto conversacional multi-turno (tag `conversational`).
- Entrada de imagen y texto (`image-text-to-text`), por lo que admite prompts multimodales con imagenes.
- Razonamiento con modo de pensamiento (herencia del ajuste ThinkingCap, que modula la longitud de la cadena de razonamiento).
- Capacidades de codigo y matematicas: no confirmadas explicitamente en la informacion disponible, pero plausibles en un modelo instruct de esta familia; se indican como no verificadas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el modo de pensamiento abre la puerta a este uso, pero no hay confirmacion documental.
- Capacidades multilingues: no disponible (el campo de idiomas del repo no esta relleno).
- Compatibilidad con endpoints (`endpoints_compatible`) y con llama.cpp.

## Casos de uso

- Razonamiento con presupuesto de tokens ajustado: el ajuste ThinkingCap reduce los tokens de pensamiento un 38,9% de media, por lo que es adecuado para pipelines donde el coste por consulta depende del numero de tokens generados, como clasificacion con justificacion o extraccion estructurada con verificacion.
- Asistente multimodal en local: al aceptar imagen y texto y caber en 9,92 GiB, permite desplegar un asistente que responde preguntas sobre capturas, diagramas o documentos escaneados en una estacion de trabajo con GPU de consumo.
- Prototipado de agentes con llama.cpp: la compatibilidad con llama.cpp y la licencia Apache 2.0 permiten integrar el modelo en bucles de agente sin coste de licencia, usando el modo de pensamiento para planificacion de varios pasos.
- Analisis de documentacion tecnica: con entrada de imagen puede procesar paginas de manuales o diagramas de arquitectura y generar resumenes o respuestas contextualizadas, siempre que la longitud de contexto (no disponible) lo permita.
- Educacion y tutoria: la reduccion de tokens de razonamiento mantiene respuestas explicativas sin cadenas excesivamente largas, lo que mejora la latencia percibida en interfaces conversacionales.
- Evaluacion comparativa de cuantizaciones: la serie APEX publica mapas de tensor auditados, lo que permite medir el impacto de precisiones mixtas (IQ2_XXS en expertos frente a Q4_K en atencion) sobre la calidad en tareas concretas.
- Despliegue en entornos con requisitos de licencia permisiva: Apache 2.0 facilita su uso en productos comerciales, sujeto a las obligaciones de atribucion correspondientes.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible corresponden a la comparacion del modelo base ThinkingCap frente a `gemma-4-26B-A4B-it` original, no a esta cuantizacion concreta:

| Metrica | ThinkingCap gemma-4-26B-A4B-it | gemma-4-26B-A4B-it (base) |
|---|---|---|
| Precision media | 75,0% | 75,2% |
| Reduccion de tokens de razonamiento (media) | 38,9% | referencia |
| Rango de reduccion por benchmark | 14% a 69% | referencia |

No se han publicado resultados de benchmarks especificos de la cuantizacion NanoPlus V2.1 en la informacion disponible. Tampoco se dispone de datos de MMLU, HumanEval o GSM8K desglosados.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo pesa 9,92 GiB; con overhead de contexto y cache KV, se recomienda un minimo de 12-14 GB de VRAM para contextos moderados.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB), A100 40 GB, H100 80 GB para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090), asumiendo contextos contenidos.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (previa importacion del GGUF), y servidores compatibles con endpoints. vLLM y TGI no se mencionan en la informacion disponible para este formato.
- Latencia y throughput: no disponibles. Al ser un MoE con expertos en precisiones muy bajas (IQ2_XXS/IQ2_S), se espera un rendimiento condicionado por el ancho de banda de memoria y la velocidad de descompresion de los kernels IQ en llama.cpp, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ThinkingCap Gemma-4 26B-A4B APEX-I NanoPlus V2.1 (este) | ~25,2B | no disponible | Apache 2.0 | GGUF (9,92 GiB) | Cuantizacion mixta agresiva en expertos |
| ThinkingCap Gemma-4 26B-A4B APEX-I MiniPlus V2.1 | ~25,2B | no disponible | Apache 2.0 | GGUF (12,03 GiB) | Misma familia, mayor huella y presumiblemente mayor fidelidad |
| bottlecapai/ThinkingCap-gemma-4-26B-A4B-it | ~25,2B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar, referencia de calidad (75,0% precision media) |
| gemma-4-26B-A4B-it (Google DeepMind) | ~26B (A4B) | no disponible | no disponible en la informacion | safetensors | Modelo original; ThinkingCap reporta 75,2% de precision media |

No se dispone de datos de benchmarks de la cuantizacion que permitan una comparacion cuantitativa con las alternativas; la comparacion se limita a tamano, licencia y procedencia.

## Limitaciones y advertencias

- La cuantizacion agresiva de los expertos enrutados (IQ2_XXS, IQ2_S, IQ3_XXS) puede degradar la calidad respecto al modelo base; no se han publicado evaluaciones de esta variante concreta.
- El modelo base ThinkingCap ya presenta una precision media ligeramente inferior (75,0% frente a 75,2%), por lo que la cuantizacion se acumula sobre esa diferencia.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay evaluaciones especificas de factualidad en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada; se heredan los del modelo Gemma 4 subyacente.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento multilingue homogeneo.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con documentos largos sin validacion previa.
- Licencia Apache 2.0 en el repositorio de cuantizacion; conviene verificar las condiciones del modelo base y del ajuste ThinkingCap antes de uso comercial.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica ausencia de validacion comunitaria.
- El autor de la cuantizacion declara computo en la nube financiado de su bolsillo; no hay garantia de mantenimiento o soporte a largo plazo.
- El pipeline `image-text-to-text` requiere verificar que la ruta multimodal funciona correctamente en llama.cpp para esta cuantizacion concreta, ya que no se documenta en la informacion disponible.

## Enlaces

- Repositorio Hugging Face de la cuantizacion: https://huggingface.co/IsValorum/ThinkingCap-Gemma-4-26B-A4B-it-APEX-I-NanoPlus-V2.1-GGUF
- Modelo base ThinkingCap: https://huggingface.co/bottlecapai/ThinkingCap-gemma-4-26B-A4B-it
- Variante MiniPlus de la misma familia: https://huggingface.co/IsValorum/ThinkingCap-Gemma-4-26B-A4B-it-APEX-I-MiniPlus-V2.1-GGUF
- Blog de bottlecapai sobre ThinkingCap Gemma-4-26B-A4B: https://bottlecapai.com/post/thinkingcap-gemma-4-26b/
- iMatrix utilizada: https://huggingface.co/bottlecapai/ThinkingCap-gemma-4-26B-A4B-it-GGUF/ThinkingCap-gemma-4-26B-A4B-it-imatrix.gguf
- Apoyo al autor de la cuantizacion: https://ko-fi.com/isvalorum
