# IsValorum/ThinkingCap-Gemma-4-26B-A4B-it-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

ThinkingCap-Gemma-4-26B-A4B-it-APEX-I-MiniPlus-V2.1-GGUF es una cuantizacion GGUF del modelo ThinkingCap-gemma-4-26B-A4B-it, desarrollado por bottlecapai a partir de gemma-4-26B-A4B-it de Google DeepMind. El modelo base es un transformer de mezcla de expertos (MoE) con capacidad de entrada de imagen, afinado por bottlecapai para reducir la longitud de sus cadenas de razonamiento sin degradar la calidad de las respuestas. Esta version concreta la publica IsValorum dentro de su serie de cuantizaciones APEX, con un esquema de precision quirurgica por tensor y una huella de 12,03 GiB.

El interes practico del modelo reside en la combinacion de tres factores: el ancho de banda efectivo de un MoE (26B parametros totales, 4B activos segun la nomenclatura A4B), la multimodalidad de entrada (pipeline image-text-to-text) y una post-formacion orientada a recortar tokens de pensamiento, lo que se traduce en menor latencia y menor coste por consulta en despliegues de razonamiento. La cuantizacion de IsValorum anade una capa de optimizacion de memoria que permite ejecutar el modelo en hardware de gama alta de consumo.

La relevancia de esta ficha es doble: por un lado documenta un artefacto de cuantizacion concreto con su mapa de precision por tensor auditado; por otro, advierte de que el modelo base, sus datos de entrenamiento y sus benchmarks originales no estan documentados en la informacion disponible, por lo que muchas especificaciones deben tratarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia `gemma4`), con entrada de imagen |
| Parametros totales | 25.233.142.046 (25,2B) |
| Parametros activos | no disponible (la nomenclatura A4B sugiere ~4B activos, sin confirmacion en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con mezcla por tensor: Q4_K, Q5_K, Q5_0, Q5_1, Q6_K, IQ3_XXS, IQ4_NL, F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repo | 12,9 GB (huella declarada de la variante MiniPlus: 12,03 GiB) |
| iMatrix | `ThinkingCap-gemma-4-26B-A4B-it-imatrix.gguf` (commit bb52b32) |
| Tensiones recurrentes en F32 | 271 tensores observados |
| Pipeline | image-text-to-text |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos de la familia `gemma4`, con proyecciones de atencion (`attn_q`, `attn_k`, `attn_v`, `attn_output`), MLP denso (`ffn_gate`, `ffn_up`, `ffn_down`), expertos enrutados (`ffn_gate_up_exps`, `ffn_down_exps`), router (`ffn_gate_inp`) y un conjunto amplio de normalizaciones por bloque (`attn_norm`, `attn_q_norm`, `attn_k_norm`, `ffn_norm`, `post_attention_norm`, `post_ffw_norm`, `post_ffw_norm_1`, `post_ffw_norm_2`, `pre_ffw_norm_2`). El mapa de tensores auditado revela 30 bloques (`blk.[N]`), lo que fija la profundidad en 30 capas. La presencia de `ffn_gate_up_exps` y `ffn_down_exps` confirma el enrutamiento por expertos; el numero de expertos por capa no se detalla en la informacion disponible.

El entrenamiento del modelo base lo describe bottlecapai como una post-formacion de "pensamiento corto" aplicada sobre gemma-4-26B-A4B-it: reduce los tokens de razonamiento un 38,9 % de media (rango del 14 % al 69 % segun el benchmark) manteniendo una precision media del 75,0 % frente al 75,2 % del modelo base. No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, ni si se emplearon RLHF, DPO u otras tecnicas de alineacion. La cuantizacion de IsValorum emplea una iMatrix para guiar la asignacion de bits y protege en F32 las normalizaciones, el router y los tensores estructurales, mientras degrada selectivamente las proyecciones de expertos enrutados (IQ3_XXS/Q3_K en 10 capas, IQ4_NL/Q5_0 en el resto).

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento con cadena de pensamiento, con longitud reducida respecto al modelo base por la post-formacion ThinkingCap.
- Entrada de imagen (pipeline image-text-to-text): el modelo acepta imagenes junto con texto.
- Mezcla de expertos con activacion dispersa, orientada a eficiencia computacional por token.
- Capacidad multilingue: no documentada en la informacion disponible.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Modo thinking explicito: no documentado como parametro configurable en la informacion disponible.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).

## Casos de uso

- Razonamiento asistido con presupuesto de tokens ajustado: la post-formacion ThinkingCap recorta los tokens de pensamiento entre un 14 % y un 69 % segun el benchmark, lo que reduce el coste por consulta en tareas de razonamiento donde la latencia importa.
- Procesamiento de documentos con imagenes: al aceptar entrada image-text-to-text, el modelo puede extraer y razonar sobre contenido visual y textual combinado, por ejemplo en digitalizacion de facturas o capturas de pantalla.
- Despliegue en estaciones de trabajo con GPU de consumo: la variante MiniPlus ocupa 12,03 GiB, lo que la hace viable en tarjetas de 16 GB o 24 GB con cuantizacion GGUF y llama.cpp.
- Prototipado rapido de asistentes conversacionales: el formato GGUF y la compatibilidad con llama.cpp permiten levantar un servidor local sin infraestructura de GPU de datacenter.
- Evaluacion comparativa de tecnicas de cuantizacion: el mapa de precision por tensor auditado permite estudiar el impacto de IQ3_XXS, Q3_K, Q4_K y Q5_K en la calidad de salida de un MoE.
- Investigacion sobre eficiencia de razonamiento: comparar las respuestas del modelo ThinkingCap con las de gemma-4-26B-A4B-it original permite medir la relacion entre longitud de cadena de pensamiento y precision.
- Inferencia en entornos con memoria limitada: la variante NanoPlus (9,92 GiB) del mismo autor permite bajar aun mas el requisito de VRAM si la calidad de la MiniPlus no es suficiente.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible corresponden al modelo base ThinkingCap-gemma-4-26B-A4B-it frente a gemma-4-26B-A4B-it, no a esta cuantizacion:

| Metrica | ThinkingCap gemma-4-26B-A4B-it | gemma-4-26B-A4B-it (base) |
|---|---|---|
| Reduccion de tokens de razonamiento (media) | 38,9 % | referencia |
| Rango de reduccion por benchmark | 14 % – 69 % | referencia |
| Precision media | 75,0 % | 75,2 % |

No se han publicado resultados de benchmarks especificos de la cuantizacion APEX-I-MiniPlus-V2.1 en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12,03 GiB para los pesos en la variante MiniPlus, mas overhead de contexto KV cache (no cuantificado en la informacion disponible).
- GPU recomendadas: no especificadas por el autor. Por tamano, encaja en RTX 4090 (24 GB), RTX 4080 (16 GB) y A100/H100 para despliegues de mayor concurrencia.
- GPU de consumo: si, en tarjetas con 16 GB o mas de VRAM; en 12 GB el margen es muy ajustado y dependera de la longitud de contexto.
- Opciones de despliegue: llama.cpp (formato nativo), y por extension los runners compatibles con GGUF (Ollama, LM Studio, servidores basados en llama.cpp). vLLM y TGI no soportan GGUF de forma nativa en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ThinkingCap-Gemma-4-26B-A4B-it APEX-I-MiniPlus V2.1 (este) | 25,2B totales, MoE | no disponible | Apache 2.0 | GGUF, 12,03 GiB | Cuantizacion quirurgica con iMatrix |
| ThinkingCap-Gemma-4-26B-A4B-it APEX-I-NanoPlus V2.1 | 25,2B totales, MoE | no disponible | Apache 2.0 | GGUF, 9,92 GiB | Misma familia, menor huella, mayor agresividad de cuantizacion |
| bottlecapai/ThinkingCap-gemma-4-26B-A4B-it | 25,2B totales, MoE | no disponible | Apache 2.0 | safetensors (presumiblemente) | Modelo base sin cuantizar, referencia de calidad |
| gemma-4-26B-A4B-it (Google DeepMind) | 25,2B totales, MoE | no disponible | no disponible | no disponible | Modelo original, precision 75,2 % segun bottlecapai |

## Limitaciones y advertencias

- La cuantizacion degrada los expertos enrutados a IQ3_XXS y Q3_K en 10 capas y a IQ4_NL/Q5_0 en las 20 restantes; es esperable una perdida de calidad respecto al modelo base, aunque no se han publicado mediciones de dicha perdida.
- El modelo base no documenta sesgos conocidos, composicion del dataset ni idiomas soportados en la informacion disponible; no puede afirmarse nada sobre su comportamiento en dominios sensibles.
- Riesgo de alucinacion: inherente a los modelos generativos; no cuantificado para este modelo.
- La post-formacion ThinkingCap reduce tokens de razonamiento, lo que puede afectar a tareas que requieren cadenas de pensamiento largas; la precision media cae ligeramente (75,0 % frente a 75,2 %).
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base gemma-4-26B-A4B-it de Google DeepMind, cuyos terminos no se detallan en la informacion disponible.
- El repositorio tiene 0 descargas y 1 like, por lo que no existe validacion comunitaria del artefacto.
- El pipeline es image-text-to-text, pero no se documenta la resolucion de imagen soportada ni el preprocesador asociado.
- No se especifica la longitud de contexto, lo que impide planificar despliegues con ventanas largas sin verificacion empirica.

## Enlaces

- Hugging Face (esta cuantizacion): https://huggingface.co/IsValorum/ThinkingCap-Gemma-4-26B-A4B-it-APEX-I-MiniPlus-V2.1-GGUF
- Variante NanoPlus: https://huggingface.co/IsValorum/ThinkingCap-Gemma-4-26B-A4B-it-APEX-I-NanoPlus-V2.1-GGUF
- Modelo base en Hugging Face: https://huggingface.co/bottlecapai/ThinkingCap-gemma-4-26B-A4B-it
- Blog de bottlecapai sobre ThinkingCap Gemma-4-26B-A4B: https://bottlecapai.com/post/thinkingcap-gemma-4-26b/
- iMatrix utilizada: https://huggingface.co/bottlecapai/ThinkingCap-gemma-4-26B-A4B-it-GGUF/ThinkingCap-gemma-4-26B-A4B-it-imatrix.gguf@bb52b322579d218a9931261d6c9cd7403d80eb96
- Mapa de tensores completo: https://huggingface.co/IsValorum/ThinkingCap-Gemma-4-26B-A4B-it-APEX-I-MiniPlus-V2.1-GGUF/blob/main/tensor-map.tsv
- Apoyo al autor de la cuantizacion: https://ko-fi.com/isvalorum
