# deepseek-ai/ESFT-token-summary-lite

## Resumen

ESFT-token-summary-lite es un conjunto de expertos (expert set) especializado publicado por deepseek-ai dentro de su marco de trabajo ESFT (Expert Specialization Fine-Tuning). No se trata de un modelo de propósito general entrenado desde cero, sino de un experto derivado de un modelo base: la propia model card indica que es un "specialized expert set of the base model at deepseek-ai/ESFT-vanilla-lite". Es decir, se ha partido de ese modelo base y se ha especializado una parte del mismo para una tarea concreta, en este caso todo apunta a resumen o compresión de tokens, a juzgar por el sufijo "token-summary" del identificador.

El artefacto pesa 2,3 GB en el repositorio y contiene 1.159.200.768 parámetros en formato safetensors (aproximadamente 1,16 mil millones). La etiqueta `deepseek_v2` de HuggingFace sugiere que la arquitectura subyacente sigue el diseño de la familia DeepSeek-V2, y el uso de `custom_code` implica que la carga del modelo requiere ejecutar código remoto del repositorio, no una configuración estándar de Transformers.

Su relevancia es principalmente metodológica e interna al ecosistema ESFT: el modelo sirve como pieza reutilizable dentro de un pipeline de especialización, y el propio autor remite al repositorio https://github.com/deepseek-ai/ESFT para descargarlo y utilizarlo. Con 440 descargas y 21 "likes" desde julio de 2024, es un artefacto de nicho orientado a quien ya trabaja con ese framework, no un modelo listo para consumo directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta `deepseek_v2` sugiere la arquitectura de la familia DeepSeek-V2, pero no se confirma en la informacion disponible) |
| Parametros totales | 1.159.200.768 (~1,16 mil millones), segun safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente en precision completa o media; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna ni el proceso de entrenamiento. Los unicos indicios son las etiquetas del repositorio: `deepseek_v2` (arquitectura de la familia DeepSeek-V2), `custom_code` (requiere `trust_remote_code=True` para cargar el modelo, lo que implica clases o modulos propios no incluidos en Transformers estandar) y `conversational` / `text-generation` (orientado a generacion de texto en formato conversacional). No se especifica si se trata de un transformer denso, un subconjunto de expertos de un MoE o una cabeza adicional sobre el modelo base.

Respecto al entrenamiento, la model card unicamente describe el artefacto como un "specialized expert set" del modelo base ESFT-vanilla-lite. El marco ESFT (Expert Specialization Fine-Tuning) consiste, segun la denominacion del propio autor, en especializar un subconjunto de parametros del modelo base para una tarea concreta, manteniendo el resto congelado. No se publican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Todo ello queda como "no disponible".

## Capacidades

- Generacion de texto en formato conversacional, segun la etiqueta `conversational` del repositorio.
- Especializacion declarada en tareas de resumen o compresion de tokens, deducida del sufijo `token-summary` del identificador y no confirmada por documentacion adicional.
- Integracion como experto dentro del pipeline ESFT descrito en https://github.com/deepseek-ai/ESFT.
- Compatibilidad declarada con text-generation-inference (etiqueta `text-generation-inference`) y con endpoints compatibles (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Investigacion sobre especializacion de expertos: el modelo sirve como ejemplo reproducible del marco ESFT, ya que el autor publica el script de uso en su repositorio. Un equipo que quiera replicar la metodologia puede descargar este experto y el modelo base ESFT-vanilla-lite para estudiar como se comporta la especializacion frente al modelo sin especializar.
- Resumen de secuencias largas en pipelines de preprocesado: si la especializacion es efectivamente en resumen de tokens, el modelo encajaria como etapa de compresion previa al envio de contexto a un modelo mayor, reduciendo el coste de inferencia en tareas de retrieval-augmented generation.
- Experimentos academicos sobre mezcla de expertos: dado su tamano reducido (1,16 mil millones de parametros), es viable cargarlo en una GPU de gama alta de consumo para estudiar como se combinan varios expertos especializados sobre una misma base.
- Evaluacion comparativa de tecnicas de fine-tuning selectivo: sirve como punto de referencia frente a LoRA, adapters o fine-tuning completo en un mismo presupuesto de computo, al partir de un modelo base conocido.
- Desarrollo de prototipos conversacionales de bajo coste: con 2,3 GB de pesos, puede desplegarse en entornos con recursos limitados para validar interfaces conversacionales antes de escalar a modelos mayores.
- Analisis de artefactos de codigo personalizado: el uso de `custom_code` lo convierte en un caso de estudio util para equipos que necesitan auditar como se cargan modelos con clases propias fuera del ecosistema estandar de Transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento de parametros (1.159.200.768) y de la aritmetica estandar de memoria para pesos; no proceden de documentacion del autor.

- VRAM estimada solo para pesos: aproximadamente 2,3 GB en FP16/BF16, unos 1,2 GB en cuantizacion de 8 bits y alrededor de 0,6-0,7 GB en 4 bits. Hay que sumar la memoria de activaciones, cache KV y overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16 con margen (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090); A100 o H100 solo tendrian sentido para servir muchas peticiones concurrentes o para reentrenamiento.
- Cabe en GPU de consumo: si, con alta probabilidad en cualquier GPU moderna con 8 GB o mas, aunque la ausencia de variantes cuantizadas publicadas obliga a cuantizar localmente.
- Opciones de despliegue: Transformers con `trust_remote_code=True` es la via documentada; la etiqueta `text-generation-inference` indica compatibilidad declarada con TGI; vLLM es plausible dada la arquitectura de la familia DeepSeek-V2, pero no esta confirmado. No hay GGUF publicado, por lo que Ollama y llama.cpp no estarian disponibles sin conversion previa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo analizado, por lo que la comparacion se limita a caracteristicas objetivas de repositorio. Los modelos alternativos se incluyen por rango de parametros, no porque sean equivalentes funcionalmente.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| deepseek-ai/ESFT-token-summary-lite | 1,16 B | no disponible | no disponible | safetensors | HuggingFace, requiere scripts ESFT |
| deepseek-ai/ESFT-vanilla-lite (modelo base) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Modelos densos de ~1-1,5 B de la misma generacion (p. ej. TinyLlama-1.1B, Qwen2.5-1.5B) | 1,1-1,5 B | variable segun modelo | licencias permisivas en la mayoria de casos | safetensors y GGUF | HuggingFace, ampliamente integrados |

La comparacion de contexto, rendimiento y licencia frente a estos modelos queda como "no disponible" en el caso del modelo analizado, lo que impide una evaluacion funcional seria.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia explicita, no puede asumirse permiso para uso comercial. Es un riesgo juridico relevante antes de integrarlo en produccion.
- Es un experto especializado, no un modelo autonomo: la model card remite al modelo base ESFT-vanilla-lite y a los scripts del repositorio ESFT, de modo que su uso fuera de ese pipeline puede no funcionar como se espera.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo arbitrario del repositorio. Debe auditarse antes de cargarlo en entornos sensibles.
- Idiomas soportados no documentados: no hay garantia de comportamiento correcto en castellano ni en otros idiomas distintos del que se uso en el entrenamiento.
- Longitud de contexto desconocida: no puede planificarse su uso en tareas que dependan de ventanas largas sin verificacion empirica.
- Riesgo de alucinacion: no evaluado ni documentado por el autor.
- Sesgos conocidos: no documentados.
- Trazabilidad limitada: el repositorio se creo y actualizo en dos dias consecutivos (4 y 5 de julio de 2024) y no se ha actualizado desde entonces, lo que sugiere un artefacto de investigacion sin mantenimiento.
- Volumen de adopcion bajo (440 descargas), lo que reduce la probabilidad de encontrar informes independientes de fallos o comportamientos anomalos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/deepseek-ai/ESFT-token-summary-lite
- Modelo base: https://huggingface.co/deepseek-ai/ESFT-vanilla-lite
- Repositorio de scripts ESFT: https://github.com/deepseek-ai/ESFT
- Organizacion DeepSeek en GitHub: https://github.com/deepseek-ai
- Sitio corporativo de DeepSeek: https://www.deepseek.com/
- Plataforma de API de DeepSeek: https://www.deepseek.com/en/platform/
- Aplicacion DeepSeek: https://download.deepseek.com/
- Entrada de DeepSeek en Wikipedia: https://fr.wikipedia.org/wiki/DeepSeek
