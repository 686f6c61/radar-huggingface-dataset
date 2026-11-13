# Bobliu/north-star

## Resumen

North-star es un repositorio de artefactos de investigación publicado por el usuario Bobliu en Hugging Face. No contiene un modelo desplegable, sino dos adaptadores de router de baja graduación (rank 4, 100 pasos de entrenamiento) diseñados para acoplarse al modelo base CohereLabs/North-Mini-Code-1.0. Los adaptadores añaden una corrección de bajo rango a los logits del router exclusivamente durante la fase de drafting, manteniendo intacta la ruta del verificador.

El objetivo es mejorar la decodificación especulativa en un modelo con arquitectura MoE: al afinar el router de drafting se incrementa la coincidencia top-1 con las decisiones del verificador, lo que se traduce en más tokens comprometidos por bloque y, potencialmente, en un mayor rendimiento de aceptación. El repositorio no redistribuye ningún peso del modelo base; los adaptadores son derivados de los routers del modelo original y su uso queda sujeto a la licencia de CohereLabs/North-Mini-Code-1.0.

La relevancia de este artefacto es metodológica: demuestra que una edición de pesos muy ligera (383.020 y 348.200 parámetros en las versiones v001 y v002, respectivamente) puede modificar el comportamiento del router de drafting sin alterar los logits del verificador. Sin embargo, los propios autores advierten de que se trata de artefactos de investigación y no reclaman ninguna mejora de velocidad extremo a extremo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores de router de bajo rango (rank 4) sobre un modelo base MoE (CohereLabs/North-Mini-Code-1.0) |
| Parametros totales | 383.020 (v001); 348.200 (v002) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (see-base-model); sujeta a la licencia de CohereLabs/North-Mini-Code-1.0 |
| Formato de pesos | adapters.pt (diccionario de tensores A.* / B.* por capa), recipe.json, report.json |

## Arquitectura y entrenamiento

Los adaptadores son correcciones de bajo rango (rank 4) aplicadas a los logits del router del modelo base. Según la model card, se entrenaron durante 100 pasos mediante la pista de edición de pesos del repositorio GitHub Bobliuuu/north-star. La corrección se activa únicamente durante el drafting y se mantiene la selección top-2 de expertos; la ruta del verificador no se modifica, de modo que sus logits son idénticos bit a bit con el adaptador instalado y los parámetros base permanecen inalterados.

La innovación técnica consiste en preservar la salida codiciosa del verificador mientras se mejora la coincidencia del drafting. Los datos de entrenamiento, la composición del dataset y si hubo RLHF o DPO no están disponibles en la información proporcionada. El coste computacional del adaptador es mínimo: la fracción de FLOPs del adaptador es de 0,0009.

## Capacidades

- Mejora de la coincidencia top-1 del drafting en decodificación especulativa: de 0,654 a 0,702 en v001 y de 0,454 a 0,571 en v002.
- Incremento de tokens comprometidos por bloque con gamma=4: de 2,71 a 2,93 en v001 y de 1,84 a 2,31 en v002.
- Preservación de la ruta del verificador: los logits del verificador son idénticos bit a bit y la salida especulativa coincide exactamente con la salida codiciosa del verificador.
- No es un modelo generativo autónomo: no soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües por sí mismo.
- Dependencia estricta del modelo base CohereLabs/North-Mini-Code-1.0 en la revisión d11e61a842617a22dc328552fa5bb86231ee4f37.

## Casos de uso

- Investigación en decodificación especulativa: el adaptador sirve como banco de pruebas para estudiar cómo la edición de pesos del router afecta a la tasa de aceptación del drafting sin tocar el verificador.
- Experimentos de edición de pesos en modelos MoE: permite validar metodologías de corrección de bajo rango sobre routers con un coste de entrenamiento de 100 pasos.
- Reproducción de resultados académicos: los ficheros report.json y recipe.json permiten replicar las mediciones de coincidencia top-1 y tokens comprometidos por bloque en una H100 80GB.
- Análisis de robustez del drafting: útil para comparar configuraciones de gamma y modos de muestreo frente a la línea base sin adaptador.
- Docencia y formación: ejemplo didáctico de cómo un adaptador de 348.200 parámetros puede modificar el comportamiento de un router sin alterar la salida final del verificador.
- Evaluación de gates de calidad: los cuatro gates (lossless, gain, overfit, cost) proporcionan un marco reutilizable para validar futuras ediciones de pesos en pipelines de decodificación especulativa.

## Benchmarks y rendimiento

| Metrica | v001 base -> editado | v002 base -> editado |
|---|---|---|
| Coincidencia top-1 del drafting | 0,654 -> 0,702 | 0,454 -> 0,571 |
| Tokens comprometidos por bloque (gamma=4) | 2,71 -> 2,93 | 1,84 -> 2,31 |
| Gates (lossless, gain, overfit, cost) | todos pasan | todos pasan |
| Fraccion de FLOPs del adaptador | 0,0009 | 0,0009 |

Medido en una H100 80GB, con 8 secuencias de gate y modo muestreado; los datos proceden de v00*/report.json. Son cifras offline de coincidencia del drafting, no mejoras de velocidad extremo a extremo en tokens por segundo; los autores no reclaman ninguna aceleración extremo a extremo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para los adaptadores por separado; depende del modelo base CohereLabs/North-Mini-Code-1.0.
- GPU recomendadas: H100 80GB es la plataforma en la que se realizaron las mediciones.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; la carga debe hacerse con el código de edición de pesos del repositorio GitHub (src/weightedit/), no mediante vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se reportan cifras de latencia ni de throughput extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| North-star (v002) | 348.200 (adaptador) | no disponible | Coincidencia top-1 0,571; 2,31 tokens/bloque | other (see-base-model) | Hugging Face (adaptadores) |
| CohereLabs/North-Mini-Code-1.0 | no disponible | no disponible | no disponible | ver modelo base | Hugging Face |
| Alternativas de decodificación especulativa | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo desplegable: los autores lo describen explícitamente como artefactos de investigación.
- No se redistribuyen pesos de North; los adaptadores solo tienen sentido sobre CohereLabs/North-Mini-Code-1.0 en la revisión d11e61a842617a22dc328552fa5bb86231ee4f37.
- Los adaptadores son derivados de los routers del modelo base, por lo que se aplican los términos de licencia del modelo base.
- No se reclama ninguna mejora de velocidad extremo a extremo en tokens por segundo.
- Las cifras de coincidencia top-1 y tokens por bloque son mediciones offline con 8 secuencias de gate y modo muestreado, no resultados de producción.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no disponible para los adaptadores; depende del modelo base.
- Limitaciones de contexto o idioma: no disponible.
- Restricciones de licencia para uso comercial: sujetas a la licencia de CohereLabs/North-Mini-Code-1.0; consultar el enlace de licencia del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/Bobliu/north-star
- Modelo base: https://huggingface.co/CohereLabs/North-Mini-Code-1.0
- Repositorio GitHub: https://github.com/Bobliuuu/north-star
- Documentación de edición de pesos: https://github.com/Bobliuuu/north-star/blob/main/docs/WEIGHT_EDIT.md
- Resultados: https://github.com/Bobliuuu/north-star/blob/main/RESULTS.md
- Vídeo explicativo: https://github.com/Bobliuuu/north-star/blob/main/video/northstar_explainer.mp4
- Release v0.2.0: https://github.com/Bobliuuu/north-star/releases/tag/v0.2.0
