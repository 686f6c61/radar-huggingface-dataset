# dphn/dolphin-2.6-mixtral-8x7b

## Resumen

Dolphin 2.6 Mixtral 8x7b es un ajuste fino (fine-tuning) del modelo Mixtral-8x7b de Mistral AI, desarrollado por Eric Hartford (dphn) y publicado bajo licencia Apache 2.0. Se trata de un modelo de generacion de texto conversacional entrenado con qLoRA sobre un conjunto de datos diverso que combina Dolphin, Airoboros, OpenHermes, Magicoder y Capybara, con un enfasis especial en codigo y en obediencia al usuario. La arquitectura subyacente es un transformer de mezcla de expertos (MoE) con 8 expertos por capa, 46,7 mil millones de parametros totales y aproximadamente 12,9 mil millones activos por token.

El modelo hereda la ventana de contexto de 32.768 tokens de Mixtral, aunque el autor indica que el ajuste fino se realizo con 16.000 tokens. Su principal seña de identidad es que se distribuye como modelo "sin censura" (uncensored): el autor filtro el dataset para eliminar datos de alineamiento y sesgo, lo que lo hace altamente compliant con las peticiones del usuario, incluidas aquellas eticas o legalmente cuestionables. Esto lo posiciona como una herramienta para investigacion y experimentacion, no como un modelo listo para produccion sin una capa de alineamiento propia.

Es relevante en el ecosistema open source porque demuestra el flujo de trabajo tipico de la comunidad: partir de un modelo base abierto potente (Mixtral), aplicar qLoRA con Axolotl sobre datasets curados y publicar pesos con licencia permisiva. El modelo se creo en diciembre de 2023 y sigue disponible en Hugging Face con cerca de 9.400 descargas y 217 likes, lo que refleja un interes sostenido aunque moderado dentro del nicho de modelos sin censura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE), 8 expertos por capa |
| Parametros totales | 46,7 mil millones (8x7B) |
| Parametros activos | Aproximadamente 12,9 mil millones por token |
| Longitud de contexto | 32.768 tokens en el modelo base; ajuste fino realizado con 16.000 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el modelo base admite cuantizaciones GGUF, GPTQ y AWQ de la comunidad) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y pytorch (repositorio de 186,8 GB); requiere trust_remote_code |

## Arquitectura y entrenamiento

La arquitectura es la de Mixtral-8x7b: un transformer decoder-only con capas de mezcla de expertos dispersa. Cada capa contiene 8 expertos feed-forward y un router que selecciona los 2 expertos mas adecuados por token, de modo que solo se activan unos 12,9 mil millones de parametros de los 46,7 mil millones totales. Esta dispersion reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamaño, manteniendo la capacidad de representacion de un modelo grande.

El ajuste fino se realizo con qLoRA y el framework Axolotl sobre 4 GPU A100 durante 3 dias, completando 1,5 epocas. Los datos de entrenamiento combinan varios datasets publicos: ehartford/dolphin, jondurbin/airoboros-2.2.1, ehartford/dolphin-coder, teknium/openhermes, ise-uiuc/Magicoder-OSS-Instruct-75K, ise-uiuc/Magicoder-Evol-Instruct-110K y LDJnr/Capybara. La version 2.6 corrigio un problema de configuracion del entrenamiento que mejoro notablemente la calidad, reintrodujo datos de empatia basados en Samantha y sustituyo Synthia y Pure-Dove por Capybara. No se aplico DPO ni RLHF; el autor indica que el modelo es muy obediente pero puede requerir refuerzo en el system prompt. El formato de prompt es ChatML.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento general y respuesta a instrucciones complejas.
- Generacion de codigo en multiples lenguajes, con entrenamiento reforzado en datos de codigo (Magicoder, dolphin-coder); el autor lo describe como "realmente bueno en coding".
- Resolucion de problemas de programacion tipo LeetCode, incluyendo explicacion del algoritmo y codigo funcional.
- Capacidad de seguir instrucciones de forma muy obediente, incluso sin alineamiento moral.
- Soporte de formato ChatML para system, user y assistant.
- No se documenta soporte nativo de tool calling ni function calling en la model card.
- No se documenta modo thinking, vision ni audio.
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Generacion de codigo en entornos de desarrollo: el modelo puede resolver problemas algoritmicos, explicar la solucion y producir codigo en lenguajes como Kotlin, Python o Java, gracias al entrenamiento con Magicoder y dolphin-coder. Util como asistente de programacion en local o en pipelines internos.
- Asistente conversacional para investigacion sobre alineamiento: al ser un modelo sin censura y altamente compliant, sirve para estudiar el comportamiento de modelos sin capas de seguridad y comparar con modelos alineados.
- Generacion de datos sinteticos: su obediencia y su capacidad de seguir instrucciones lo hacen util para producir datasets de entrenamiento o evaluacion, siempre con revision posterior.
- Prototipado rapido de chatbots: con 32k tokens de contexto y formato ChatML, permite construir asistentes multi-turno con contexto largo en fases de prueba.
- Role-playing y escritura creativa: el autor menciona datos de empatia y role-playing en la hoja de ruta; el modelo puede mantener personajes y narrativas extensas.
- Experimentacion con MoE en hardware limitado: al activar solo ~12,9B parametros, es viable en configuraciones de GPU de gama alta para consumer (con cuantizacion) y sirve para estudiar el comportamiento de modelos dispersos.
- Traduccion y procesamiento de texto en ingles: aunque no es multilingue, puede usarse para tareas de reescritura, resumen y transformacion de texto en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en precision completa (fp16/bf16) requiere aproximadamente 90-95 GB, por lo que no cabe en una sola GPU consumer. Con cuantizacion de 4 bits (GGUF Q4_K_M) se estima en torno a 26-30 GB, y con 5 bits en torno a 32-35 GB.
- GPU recomendadas: para fp16, 2x A100 80GB o 2x H100 80GB; para cuantizacion 4 bits, una RTX 4090 (24 GB) puede quedarse justa y requerira offload a CPU o cuantizaciones mas agresivas (Q3/Q2); una A6000 (48 GB) o 2x RTX 4090 permiten ejecucion comoda en 4-5 bits.
- Cabe en consumer GPU: si, con cuantizacion de 4 bits en RTX 4090 (24 GB) usando offload parcial, o en GPUs de 48 GB como A6000. En 8 bits no cabe en consumer.
- Opciones de despliegue: transformers (requiere trust_remote_code), vLLM, llama.cpp, Ollama (existe la variante dolphin-mixtral), Text Generation Inference (TGI) y Axolotl para reentrenamiento.
- Latencia y throughput estimados: no disponible en la informacion proporcionada; al ser MoE con ~12,9B parametros activos, el throughput deberia ser superior al de un modelo denso de 46,7B, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Dolphin 2.6 Mixtral 8x7b | 46,7B totales / ~12,9B activos (MoE) | 32k (entrenado con 16k) | Apache 2.0 | Sin censura, fuerte en codigo, solo ingles |
| Mixtral-8x7b (base) | 46,7B totales / ~12,9B activos (MoE) | 32k | Apache 2.0 | Modelo base de Mistral AI, alineado y multilingue |
| Mistral 7B Instruct | 7,3B densos | 32k | Apache 2.0 | Menor tamaño, mas facil de desplegar, menos capacidad |
| Llama 2 70B Chat | 70B densos | 4k | Llama 2 Community License | Mayor tamaño, contexto corto, licencia restrictiva |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin censura: el autor filtro el dataset para eliminar alineamiento y sesgo; el modelo obedece peticiones eticas o legalmente cuestionables. Es responsabilidad del usuario implementar su propia capa de alineamiento antes de exponerlo como servicio.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar hechos, referencias o codigo incorrecto; no se han publicado evaluaciones de fidelidad.
- Solo ingles: la model card declara unicamente el idioma ingles; el rendimiento en castellano no esta garantizado.
- Contexto efectivo limitado: aunque el modelo base soporta 32k, el ajuste fino se hizo con 16k, por lo que el rendimiento mas alla de esa longitud puede degradarse.
- Sin DPO ni RLHF: el autor advierte que puede requerir refuerzo en el system prompt para mantener el comportamiento deseado.
- Requiere trust_remote_code: implica ejecutar codigo remoto del repositorio, lo que añade un riesgo de seguridad en entornos de produccion.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado es responsabilidad del usuario; el autor lo declara explicitamente.
- Tamaño del repositorio elevado (186,8 GB): requiere almacenamiento y ancho de banda considerables para su descarga y despliegue.
- Fecha de creacion en diciembre de 2023: es un modelo antiguo en el ritmo actual del ecosistema; pueden existir alternativas mas capaces y mejor alineadas.

## Enlaces

- Hugging Face: https://huggingface.co/dphn/dolphin-2.6-mixtral-8x7b
- Blog del autor sobre Dolphin 2.5 Mixtral: https://erichartford.com/dolphin-25-mixtral-8x7b
- Blog sobre modelos sin censura: https://erichartford.com/uncensored-models
- Discord de Cognitive Computations: https://discord.gg/tCMkMDDHwm
- Repositorio de Axolotl: https://github.com/OpenAccess-AI-Collective/axolotl
- Mistral AI: https://mistral.ai/
- Convai (patrocinador): https://www.convai.com/
