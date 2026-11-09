# DavidAU/OpenAI-gpt-oss-20B-GPT5.1-5.2-DISTILL-Heretic-Uncensored-MXFP4

## Resumen

El modelo `OpenAI-gpt-oss-20B-GPT5.1-5.2-DISTILL-Heretic-Uncensored-MXFP4` es un ajuste fino del modelo abierto `gpt-oss-20B` de OpenAI, publicado por el usuario DavidAU en Hugging Face. Se trata de una variante experimental que sustituye el comportamiento de razonamiento original del modelo base por el destilado a partir de tres conjuntos de datos generados con GPT-5.1 y GPT-5.2 (TeichAI/gpt-5.2-high-reasoning-250x, TeichAI/gpt-5.1-high-reasoning-1000x y TeichAI/gpt-5-codex-1000x). El autor lo describe como un trabajo en curso y advierte de que "no todo puede funcionar correctamente".

El modelo ha sido sometido a un proceso de "abliteration" (eliminación de rechazos) seguido de un ajuste fino supervisado con la herramienta Unsloth, y se distribuye comprimido en formato MXFP4. La arquitectura subyacente es la del `gpt-oss-20B` original, un transformer MoE con atención de contexto largo, aunque los pesos publicados en safetensors suman 1.804.459.584 parámetros, un dato que conviene contrastar con las cifras oficiales del modelo base.

La relevancia de esta ficha radica en que documenta un caso típico de la comunidad open source: un modelo derivado con licencia Apache 2.0, orientado a generación de texto sin filtros de rechazo, con contexto declarado de 128k tokens y un tamaño de repositorio de 13,8 GB. Es útil para desarrolladores que quieran evaluar variantes "uncensored" del ecosistema gpt-oss, pero debe tratarse con cautela por su carácter experimental y por la falta de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (derivada de gpt-oss-20B) |
| Parametros totales | 1.804.459.584 (según safetensors); el nombre comercial indica 20B |
| Parametros activos | no disponible |
| Longitud de contexto | 128k tokens (declarado en la model card) |
| Tipos de cuantizacion | MXFP4 (pesos publicados); 8-bit según tags; el autor menciona que podría publicar una versión BF16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); MXFP4 |

## Arquitectura y entrenamiento

El modelo parte del `gpt-oss-20B` de OpenAI, un transformer con mezcla de expertos (MoE) que en su versión original emplea atención con ventana de contexto larga. Sobre esa base, el autor aplica primero un proceso de abliteration (eliminación de la dirección de rechazo en el espacio de activaciones) y después un ajuste fino supervisado con Unsloth sobre tres datasets de destilación generados con GPT-5.1 y GPT-5.2. La model card no detalla el número de tokens de entrenamiento, la composición exacta de las muestras ni si se empleó RLHF o DPO; solo indica que se sustituyó el razonamiento original del gpt-oss-20B por el de los modelos GPT-5.1 y 5.2.

No se documentan innovaciones técnicas propias más allá de la combinación de abliteration y ajuste fino con Unsloth, y de la compresión a MXFP4. El autor menciona que la versión publicada está comprimida a MXFP4 y que una versión BF16 podría llegar más adelante. Tampoco se especifican detalles sobre decodificación especulativa, atención lineal ni otras optimizaciones. La model card incluye recomendaciones de muestreo (temperatura 0,1-0,8 y repetition penalty 1,02-1,1 para uso estándar; temperatura 0,8-2,5 y repetition penalty 1,1 para uso creativo) y sugiere un factor de suavizado (smoothing factor) de 1,5 en interfaces como KoboldCpp, text-generation-webui o Silly Tavern.

## Capacidades

- Generación de texto conversacional en inglés, con modo de razonamiento explícito mediante etiquetas `<think>` y `</think>`.
- Razonamiento de varios pasos y resolución de problemas, heredado del destilado de GPT-5.1 y GPT-5.2.
- Generación de código, según el dataset TeichAI/gpt-5-codex-1000x empleado en el ajuste.
- Generación de contenido sin rechazos (uncensored/abliterated): el modelo no rechaza peticiones explícitas, aunque según el autor puede requerir instrucciones adicionales para alcanzar el nivel de explicitud deseado.
- Soporte de system prompts personalizados para orientar el tono y el estilo de la respuesta.
- Capacidades multilingües limitadas: la model card solo declara inglés.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Generación de ficción y narrativa sin restricciones de contenido: el modelo puede producir relatos de terror, violencia o contenido adulto cuando se le indica explícitamente, lo que lo hace adecuado para proyectos creativos que requieran libertad expresiva.
- Roleplay y personajes conversacionales: la model card incluye ejemplos de system prompts para encarnar personajes (por ejemplo, el Joker) y recomienda ajustes de suavizado para interacciones multi-turno en herramientas como Silly Tavern.
- Experimentación con destilación de razonamiento: investigadores pueden usar el modelo para estudiar cómo se comporta un gpt-oss-20B cuyo razonamiento ha sido sustituido por trazas de GPT-5.1/5.2.
- Generación de código en entornos de prototipado: el ajuste sobre el dataset de codex permite usarlo para autocompletar o explicar fragmentos de código, siempre con revisión humana dada la falta de benchmarks.
- Pruebas de robustez y alineación: útil como caso de estudio de modelos abliterated para evaluar sesgos, toxicidad y degradación de capacidades tras eliminar los rechazos.
- Despliegue local en formato MXFP4: el tamaño del repositorio (13,8 GB) y la cuantización MXFP4 permiten ejecutarlo en GPUs de consumo alto o en entornos con memoria limitada, para pruebas offline de generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un agradecimiento al equipo "Nightmedia" por "Benchmarks and co-labing", pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación.

## Requisitos de hardware

- VRAM estimada: con pesos MXFP4 y un repositorio de 13,8 GB, se puede inferir en GPUs con 16-24 GB de VRAM; para contexto completo de 128k se necesita margen adicional para la caché KV.
- GPU recomendadas: no hay datos oficiales; por tamaño, cabría en RTX 4090 (24 GB), A100 (40/80 GB) y H100. En GPUs de 16 GB podría requerir cuantizaciones adicionales u offloading.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 y posiblemente en RTX 4080/3090 con cuantización adicional; no confirmado por el autor.
- Opciones de despliegue: transformers (librería declarada); la model card menciona KoboldCpp, oobabooga/text-generation-webui y Silly Tavern, e indica que para GGUF en text-generation-webui hay que usar `llama_HF` con archivos de configuración del modelo fuente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OpenAI-gpt-oss-20B-GPT5.1-5.2-DISTILL-Heretic-Uncensored-MXFP4 | 1.804.459.584 (safetensors); nombre comercial 20B | 128k | Apache 2.0 | Variante abliterated y destilada, solo inglés, experimental |
| gpt-oss-20B (OpenAI, modelo base) | ~20B (MoE) | no disponible en esta ficha | Apache 2.0 | Modelo original con razonamiento nativo y filtros de seguridad |
| Otras variantes abliterated de la comunidad (p. ej. huihui-ai) | Depende del base | Depende del base | Generalmente Apache 2.0 | Sin benchmarks comparables publicados en esta ficha |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental y "work in progress": el propio autor advierte de que no todo puede funcionar correctamente.
- Falta de benchmarks: no hay métricas publicadas que permitan evaluar la degradación de capacidades tras la abliteration y el ajuste fino.
- Riesgo de alucinación: al ser un modelo destilado y ajustado sobre datos sintéticos, la fidelidad factual no está garantizada.
- Sesgos y contenido sensible: al ser uncensored/abliterated, puede generar contenido tóxico, explícito o sesgado sin filtros; requiere moderación en producción.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está documentado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y el modelo base subyacente (gpt-oss-20B) debe cumplir su propia licencia y políticas de uso.
- Discrepancia de parámetros: los safetensors suman 1.804.459.584 parámetros frente al "20B" del nombre, lo que sugiere una posible compresión o un recuento distinto; conviene verificar antes de planificar despliegues.
- Contexto de 128k declarado pero no verificado experimentalmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/OpenAI-gpt-oss-20B-GPT5.1-5.2-DISTILL-Heretic-Uncensored-MXFP4
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs del autor: https://huggingface.co/DavidAU/support
- Guía de parámetros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Archivos fuente para GGUF/EXL2/AWQ/GPTQ/HQQ: https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
- Dataset TeichAI/gpt-5.2-high-reasoning-250x: https://huggingface.co/datasets/TeichAI/gpt-5.2-high-reasoning-250x
- Dataset TeichAI/gpt-5.1-high-reasoning-1000x: https://huggingface.co/datasets/TeichAI/gpt-5.1-high-reasoning-1000x
- Dataset TeichAI/gpt-5-codex-1000x: https://huggingface.co/datasets/TeichAI/gpt-5-codex-1000x
