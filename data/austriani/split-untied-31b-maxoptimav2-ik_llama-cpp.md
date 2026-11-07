# Austriani/Split-Untied-31B-MaxOptimaV2-ik_llama.cpp

## Resumen

Split-Untied-31B-MaxOptimaV2-ik_llama.cpp es una cuantizacion GGUF del modelo Split-Untied-31B, publicado por el usuario Austriani sobre el trabajo original de Blazed-Forge. Se trata de un modelo de generacion de texto de 31 mil millones de parametros, derivado de la familia Gemma (etiquetado como gemma-4), orientado a escritura creativa, roleplay, ficcion y tematicas oscuras, con un enfoque explicitamente sin censura. La publicacion no aporta pesos en formato original, sino unicamente una version cuantizada pensada para el runtime ik_llama.cpp.

El interes tecnico de esta ficha reside en el proceso de cuantizacion, no en el modelo base: emplea el esquema denominado MaxOptimaV2 con matrices de calibracion imatrix de "v3-calibration" y "uncensored-imatrix", y ofrece variantes iq4_ks, iq4_ks_r4, iq4_k e iq5_k dentro del ecosistema de cuantizacion trellis de ik_llama.cpp. El modelo base se distribuye bajo licencia Apache 2.0 y declara soporte unicamente para ingles.

La relevancia es limitada pero concreta: para usuarios que ya trabajan con ik_llama.cpp y necesitan una version de 31B en 4-5 bits con calibracion especifica para narrativa sin filtros, esta publicacion ofrece una alternativa empaquetada. No hay datos publicados de benchmarks, descargas ni validacion de calidad por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma, etiquetada como gemma-4); detalles no disponibles |
| Parametros totales | 31B (segun denominacion del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | iq4_ks, iq4_ks_r4, iq4_k, iq5_k (esquema MaxOptimaV2 con imatrix) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para ik_llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Split-Untied-31B mas alla de su vinculacion con la familia Gemma. El nombre "Split-Untied" sugiere una modificacion de los pesos de embedding de entrada y salida (embeddings no atados), pero no se confirma en la documentacion proporcionada. Tampoco se especifican el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

Lo que si documenta la model card es el proceso de cuantizacion: se aplica el esquema MaxOptimaV2 sobre el modelo base, con matrices imatrix generadas mediante "v3-calibration" y una variante "uncensored-imatrix" orientada a preservar el comportamiento sin filtros del modelo original. Se ofrecen cuatro niveles de cuantizacion (iq4_ks, iq4_ks_r4, iq4_k, iq5_k) dentro del formato trellis de ik_llama.cpp, un fork de llama.cpp optimizado para cuantizaciones de baja precision. No se documentan innovaciones arquitectonicas adicionales ni procesos de decodificacion especulativa.

## Capacidades

- Generacion de texto en ingles con enfasis en narrativa larga, ficcion y escritura creativa.
- Roleplay y conversacion multi-turno orientada a personajes.
- Manejo de tematicas oscuras y contenido sin censura, segun la propia model card.
- Generacion de historias y storywriting con continuidad narrativa.
- Conversacion general (chat) en ingles.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Escritura de ficcion interactiva: el modelo puede sostener sesiones de roleplay prolongadas con personajes consistentes, aprovechando su calibracion orientada a narrativa y su ausencia de filtros para tramas adultas o violentas.
- Generacion de relatos y novelas por entregas: adecuado para producir borradores de capitulos con tono y estilo controlados, gracias al enfoque declarado en storywriting.
- Prototipado de videojuegos narrativos: integrable como motor de dialogo en juegos de rol de texto o aventuras conversacionales donde se requiere contenido sin restricciones tematicas.
- Investigacion sobre alineacion y censura: util como objeto de estudio para comparar el comportamiento de un modelo "uncensored" frente a su version base con filtros.
- Generacion de contenido para comunidades de rol: despliegue local en entornos donde los usuarios esperan respuestas sin rechazos por tematicas sensibles.
- Evaluacion de tecnicas de cuantizacion: las cuatro variantes publicadas permiten comparar el impacto de iq4_ks, iq4_ks_r4, iq4_k e iq5_k sobre la calidad narrativa en un mismo modelo de 31B.
- Despliegue en hardware de consumo: al estar cuantizado en 4-5 bits, permite ejecutar un modelo de 31B en GPUs con VRAM limitada mediante ik_llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un modelo de 31B en 4 bits se situa habitualmente en torno a 18-20 GB, y en 5 bits en torno a 22-24 GB, aunque estas cifras son estimaciones generales y no datos publicados por el autor.
- GPU recomendadas: no especificadas por el autor; por tamano, serian necesarias GPUs con 24 GB o mas de VRAM (RTX 3090, RTX 4090, A100, H100) para las variantes de 5 bits, y 20 GB o mas para las de 4 bits.
- Cabe en GPU de consumo: probablemente en RTX 3090/4090 con las cuantizaciones iq4, aunque no se confirma en la documentacion.
- Opciones de despliegue: exclusivamente ik_llama.cpp segun la libreria declarada; no se mencionan vLLM, TGI, Ollama ni llama.cpp estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Austriani/Split-Untied-31B-MaxOptimaV2-ik_llama.cpp | 31B | no disponible | Apache 2.0 | GGUF (ik_llama.cpp) | Cuantizacion MaxOptimaV2, solo ingles |
| Blazed-Forge/Split-Untied-31B | 31B | no disponible | Apache 2.0 | no disponible | Modelo base original |
| Austriani/Split-Untied-31B-ik_llama.cpp | 31B | no disponible | Apache 2.0 | GGUF (ik_llama.cpp) | Variante de cuantizacion previa del mismo autor |

No se dispone de informacion sobre modelos alternativos comparables de otros autores en la misma categoria (31B orientados a roleplay sin censura) dentro de la busqueda realizada.

## Limitaciones y advertencias

- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- Modelo explicitamente "uncensored": puede generar contenido violento, sexual o perturbador sin filtros, lo que implica riesgos legales y reputacionales en despliegues publicos.
- Riesgo de alucinacion no evaluado; no hay benchmarks ni evaluaciones de calidad publicadas.
- La publicacion tiene 0 descargas y 0 likes, sin validacion de la comunidad.
- Dependencia exclusiva de ik_llama.cpp: no es directamente compatible con llama.cpp estandar, Ollama, vLLM ni TGI sin conversion adicional.
- No se documentan la longitud de contexto, los datos de entrenamiento ni las tecnicas de alineacion del modelo base.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo sin censura requiere revision legal segun la jurisdiccion y el tipo de contenido generado.
- El proceso de cuantizacion con imatrix "uncensored" puede alterar el comportamiento respecto al modelo base de formas no documentadas.

## Enlaces

- Hugging Face (esta publicacion): https://huggingface.co/Austriani/Split-Untied-31B-MaxOptimaV2-ik_llama.cpp
- Hugging Face (variante previa del mismo autor): https://huggingface.co/Austriani/Split-Untied-31B-ik_llama.cpp
- Hugging Face (modelo base): https://huggingface.co/Blazed-Forge/Split-Untied-31B
- Licencia del modelo base: https://huggingface.co/Blazed-Forge/Split-Untied-31B/blob/main/LICENSE
