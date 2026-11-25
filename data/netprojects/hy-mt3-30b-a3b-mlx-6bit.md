# netprojects/Hy-MT3-30B-A3B-MLX-6bit

## Resumen

Hy-MT3-30B-A3B-MLX-6bit es una conversión a formato MLX, cuantizada a 6 bits, del modelo de traducción multilingüe tencent/Hy-MT3-30B-A3B, publicada por NetProjects (Internet Projects Ltd). El modelo original lo desarrolla Tencent y pertenece a la familia Hy-MT3, presentada el 24 de noviembre de 2026 en tres tamaños (1,8B, 7B y 30B-A3B) y especializada en traducción automática entre alrededor de 100 idiomas y dialectos.

El modelo base emplea una arquitectura de mezcla de expertos (MoE) con 30.064.725.888 parámetros totales y aproximadamente 3B activos por token, distribuidos en 128 expertos. Esta conversión concreta tiene como objetivo hacer viable la inferencia en Apple Silicon mediante MLX, reduciendo el peso del repositorio a 24,4 GB frente a los aproximadamente 60 GB que ocuparía en bf16.

La relevancia de esta ficha radica en dos factores: por un lado, el modelo original reporta mejoras notables frente a Hy-MT2 (43 % menos errores de traducción, 74 % menos omisiones o adiciones y 40 % menos errores de seguimiento de instrucciones); por otro, la conversión incluye una implementación propia de la arquitectura `hy_v3` que mlx-lm todavía no incorpora de serie, lo que permite ejecutar el modelo en Macs con memoria unificada de 48 GB o más.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`hy_v3`): 128 expertos, 1 experto compartido, router sigmoide con sesgo por puntuación de experto, primera capa densa, RMSNorm q/k por cabeza |
| Parametros totales | 30.064.725.888 |
| Parametros activos | Aproximadamente 3B por token |
| Longitud de contexto | No disponible en la información proporcionada (entradas recomendadas de hasta ~8K tokens; hasta 4096 tokens nuevos de salida) |
| Tipos de cuantizacion | 6 bits afín, group size 64 (existen builds de 4 y 8 bits del mismo autor) |
| Idiomas soportados | Alrededor de 100 idiomas y dialectos (33 de Hy-MT2, 5 lenguas minoritarias y dialectos chinos, 64 nuevos como griego, rumano, húngaro, lenguas nórdicas y bálticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 24,4 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 128 expertos, un experto compartido y una primera capa densa. El enrutador es de tipo sigmoide con un sesgo sobre la puntuación de los expertos, y la normalización emplea RMSNorm separada para q y k por cabeza de atención. La implementación MLX incluida en el repositorio (`hy_v3.py`) reproduce esta arquitectura, mantiene los pesos del router en float32 sin cuantizar y fue validada contra la referencia `HYV3` de Hugging Face Transformers sobre un modelo pequeño aleatorio, con una diferencia relativa máxima de 3e-7 y decodificación con caché idéntica a un forward completo.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo está especializado en traducción mediante instrucciones: la model card del autor de la conversión describe plantillas de prompt para listas de terminología, estilo requerido, preferencias personales, preservación de delimitadores y traducción de datos estructurados (JSON, XML). Tampoco se especifica si dispone de modo de razonamiento (thinking mode); sí se menciona que el modelo alcanza sus mejores resultados globales en modo no-thinking según Tencent.

## Capacidades

- Traducción automática multilingüe entre alrededor de 100 idiomas y dialectos, incluidos griego, rumano, húngaro, lenguas nórdicas y bálticas, cinco lenguas minoritarias y dialectos chinos.
- Traducción bidireccional hacia y desde inglés (la model card cita pruebas desde griego y chino hacia inglés).
- Seguimiento de instrucciones de traducción: estilo requerido, preferencias personales y listas de terminología con el formato "`term` translates to `translation`".
- Traducción de datos estructurados preservando delimitadores (JSON, XML).
- Generación de hasta 4096 tokens nuevos con entradas de hasta aproximadamente 8K tokens.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción de documentación técnica en pipelines de CI/CD: el modelo puede procesar fragmentos de hasta ~8K tokens y devolver únicamente el texto traducido, lo que facilita su integración en scripts que generan versiones multilingües de manuales y READMEs.
- Localización de aplicaciones con datos estructurados: gracias a las plantillas para JSON y XML con preservación de delimitadores, es adecuado para traducir ficheros de recursos i18n sin romper la sintaxis.
- Traducción asistida en Macs de desarrollo: al estar empaquetado en MLX con 24,4 GB, permite a desarrolladores individuales ejecutar un modelo de traducción de 30B en un MacBook Pro con 48 GB o más de memoria unificada, sin GPU dedicada.
- Servicio de traducción con API compatible con OpenAI: mediante `mlx_lm.server` se puede exponer el modelo en el puerto 8000 y consumirlo desde aplicaciones existentes que ya usan el esquema de OpenAI.
- Traducción con glosario corporativo: las plantillas de terminología permiten fijar equivalencias obligatorias para marcas, productos o jerga interna, reduciendo la necesidad de revisión posterior.
- Traducción de correspondencia y textos breves con control de estilo: la temperatura recomendada de 0,7 y la instrucción de devolver solo la traducción lo hacen apto para correos, notas de prensa y comunicaciones internas en decenas de idiomas.
- Evaluación comparativa de cuantizaciones: los tres builds (4, 6 y 8 bits) permiten medir el impacto de la cuantización en la calidad de traducción antes de fijar una configuración de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de la conversión únicamente aporta métricas de fidelidad de la cuantización y de la prueba de humo de traducción:

| Build | Tamano | Mismo siguiente token que bf16 | Prueba de humo de traduccion | Memoria de Mac sugerida |
|---|---|---|---|---|
| MLX 6-bit (esta ficha) | 24,4 GB | 100,0 % | 10/10 | 48 GB+ |
| MLX 8-bit | 32,0 GB | 100,0 % | 10/10 | 48 GB+ |
| MLX 4-bit | 16,9 GB | 97,1 % | 10/10 | 32 GB+ |

Las métricas de fidelidad se calcularon sobre 204 posiciones generadas con decodificación greedy y hasta 128 tokens, comparando el token más probable frente al modelo en bf16. La prueba de humo consistió en 10 prompts de traducción (griego, chino, japonés, alemán, francés, español, árabe y ruso, además de griego y chino a inglés), considerando superado cada prompt si la salida era no vacía y estaba en el idioma o escritura de destino. Tencent reporta, frente a Hy-MT2, un 43 % menos de errores de traducción, un 74 % menos de omisiones o adiciones y un 40 % menos de errores de seguimiento de instrucciones, pero los valores numéricos de benchmarks estándar no están disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 48 GB o más para el build de 6 bits (24,4 GB de pesos más margen para caché KV y contexto); documentos largos requieren más memoria.
- Hardware objetivo: Apple Silicon con memoria unificada; las pruebas se realizaron en un MacBook Pro M5 Max de 128 GB.
- No cabe en GPUs de consumo con 24 GB o menos en esta cuantización; el build de 4 bits (16,9 GB) está pensado para equipos con 32 GB o más.
- Despliegue: mlx-lm 0.32.2 o superior, con `--trust-remote-code` o `trust_remote_code=True`; servidor compatible con OpenAI mediante `mlx_lm.server`.
- No se documentan opciones de despliegue con vLLM, TGI, llama.cpp u Ollama para estos pesos MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Hy-MT3-30B-A3B-MLX-6bit (esta ficha) | 30B totales, ~3B activos | No disponible (~8K de entrada recomendada) | Apache-2.0 | Hugging Face, MLX | Cuantización 6 bits para Apple Silicon |
| tencent/Hy-MT3-30B-A3B | 30B totales, ~3B activos | No disponible | Apache-2.0 | Hugging Face | Modelo base en bf16; requiere más memoria |
| netprojects/Hy-MT3-30B-A3B-MLX-8bit | 30B totales, ~3B activos | No disponible | Apache-2.0 | Hugging Face, MLX | 32,0 GB; misma fidelidad que 6 bits |
| netprojects/Hy-MT3-30B-A3B-MLX-4bit | 30B totales, ~3B activos | No disponible | Apache-2.0 | Hugging Face, MLX | 16,9 GB; 97,1 % de coincidencia con bf16 |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de traducción con modelos de otras familias; la información proporcionada solo incluye comparaciones agregadas frente a Hy-MT2.

## Limitaciones y advertencias

- La información disponible no detalla sesgos conocidos del modelo; al ser un modelo multilingüe de amplia cobertura, es previsible un rendimiento desigual entre los idiomas con más y menos presencia en los datos de entrenamiento.
- Riesgo de alucinación y de omisiones o adiciones en la traducción: Tencent reporta una reducción del 74 % frente a Hy-MT2, pero el fenómeno no se elimina.
- La ventana de contexto no está especificada; la recomendación de entradas de hasta ~8K tokens limita su uso en documentos largos sin troceado previo.
- La cuantización a 6 bits mantiene el 100 % de coincidencia con bf16 en la prueba realizada, pero esta se limita a 204 posiciones y 10 prompts; no garantiza equivalencia en todos los dominios.
- Licencia Apache-2.0, que permite uso comercial; el fichero LICENSE.txt es el de Tencent sin modificar y el NOTICE describe la conversión.
- El autor de la conversión no está afiliado a Tencent; la implementación `hy_v3.py` es propia y requiere `trust-remote-code`, lo que implica ejecutar código de terceros.
- Solo es ejecutable con mlx-lm en Apple Silicon; no hay pesos GGUF ni soporte documentado para GPUs NVIDIA en esta conversión.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria amplia.

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/netprojects/Hy-MT3-30B-A3B-MLX-6bit
- Modelo base: https://huggingface.co/tencent/Hy-MT3-30B-A3B
- Build de 8 bits: https://huggingface.co/netprojects/Hy-MT3-30B-A3B-MLX-8bit
- Build de 4 bits: https://huggingface.co/netprojects/Hy-MT3-30B-A3B-MLX-4bit
- Informe técnico citado (arXiv 2611.27673): https://arxiv.org/abs/2611.27673
- Más builds MLX del autor: https://huggingface.co/netprojects
- Sitio del autor de la conversión: https://netprojects.com
