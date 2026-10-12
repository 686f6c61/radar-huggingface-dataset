# ElementMerc/tinyllama-1.1b-abliterated

## Resumen

tinyllama-1.1b-abliterated es un derivado «abliterado» de TinyLlama/TinyLlama-1.1B-Chat-v1.0, publicado por el usuario ElementMerc. La abliteración elimina el comportamiento de rechazo editando directamente los pesos a lo largo de las direcciones que codifican ese rechazo, sin entrenamiento adicional ni datos de ajuste. El resultado es un modelo conversacional denso de 1.100.048.384 parámetros que, por diseño, no declina peticiones.

El artefacto se publica como soporte de una pregunta de investigación concreta: si al eliminar el reflejo de rechazo se elimina también el conocimiento del daño que conserva el modelo. La herramienta empleada, senbonzakura, busca una proyección específica por capa en lugar de restar una única dirección global de rechazo, optimizando contra un conjunto de validación con una penalización KL para minimizar la deriva del comportamiento general. Se ejecutaron 100 ensayos de búsqueda sobre este modelo, sin actualizaciones de gradiente ni fine-tuning.

Advertencia relevante para cualquier evaluación: el 1 de octubre de 2026 el autor retiró públicamente todas las cifras de la model card (tasas de rechazo y AUC) porque tres fallos de la herramienta de medición invalidaban lo que se estaba midiendo. Los pesos no se retiraron ni se modificaron; lo retirado es la afirmación sobre lo que hacen. Hay una reconstrucción de la evaluación prevista, pero a fecha de la última actualización del repositorio (11 de octubre de 2026) no se han publicado cifras corregidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (heredada del modelo base, sin cambios estructurales) |
| Parametros totales | 1.100.048.384 (~1,1B) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 2048 tokens (heredada del modelo base; no se especifica en la model card del modelo abliterado) |
| Tipos de cuantizacion | Repositorio GGUF separado para llama.cpp, Ollama y LM Studio (niveles concretos no detallados en la informacion disponible); pesos originales en la precision del modelo base |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio principal); GGUF (repositorio secundario) |
| Tamano del repositorio | 2,2 GB |
| Modelo base | TinyLlama/TinyLlama-1.1B-Chat-v1.0 (relacion: finetune) |
| Biblioteca | transformers |
| Etiquetas adicionales | abliterated, uncensored, refusal-removal, interpretability, senbonzakura |
| Descargas / likes | 261 / 1 |
| Fechas | Creado el 27-07-2026; actualizado el 11-10-2026 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base sin modificaciones estructurales: un transformer decoder-only de tipo Llama. Segun la configuracion publica de TinyLlama-1.1B-Chat-v1.0, esto implica 22 capas, dimension oculta de 2048, 32 cabezas de atencion con 4 cabezas KV (GQA), dimension de cabeza 64 y un vocabulario de 32.000 tokens. La abliteracion no altera la topologia ni el numero de parametros: solo edita los valores de los pesos. La precision tambien es la del modelo base, sin cambios.

No hay entrenamiento en el proceso de creacion. senbonzakura busca, por capa, una proyeccion que neutralice la direccion de rechazo, evaluando candidatas contra un conjunto de validacion reservado y penalizando la divergencia KL respecto al modelo original para limitar el dano colateral. La busqueda se ejecuto durante 100 ensayos. El autor insiste en que no hubo actualizaciones de gradiente, ni datos de entrenamiento, ni fine-tuning: los pesos se editan directamente. El modelo base, segun su documentacion publica, procede de un preentrenamiento de aproximadamente 3 billones de tokens y de un ajuste posterior con instrucciones (SFT sobre UltraChat y DPO sobre UltraFeedback); esa alineacion es la que la abliteracion pretende deshacer selectivamente.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat compatible con `apply_chat_template` de transformers.
- Responde a peticiones que el modelo base rechaza, incluidas peticiones daninas: es su comportamiento caracteristico y el motivo de su publicacion.
- Util como sujeto de experimentos de interpretabilidad: permite comparar activaciones y direcciones por capa frente al modelo base alineado.
- Sirve como generador de ejemplos en tareas de red teaming y evaluacion de seguridad.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento explicito.
- Capacidad multilingue: no disponible; evaluado y declarado unicamente en ingles.

## Casos de uso

- Investigacion sobre mecanismos de rechazo: comparar el modelo abliterado con TinyLlama-1.1B-Chat-v1.0 permite aislar que capas y direcciones sostienen el rechazo, usando la misma arquitectura y los mismos pesos de partida.
- Interpretabilidad y steering de activaciones: al disponer de una edicion conocida por capa, sirve para validar tecnicas de intervencion sobre activaciones (activation steering, probing) con una referencia controlada.
- Red teaming de sistemas de moderacion: generar respuestas que otros modelos rechazan para comprobar si un clasificador de contenido las detecta y con que tasa de fallo.
- Generacion de datos para clasificadores de seguridad: producir ejemplos etiquetados de contenido danino y de contenido benigno con sintaxis similar, utiles como conjunto de entrenamiento o de evaluacion para detectores.
- Medicion de deriva tras ediciones de pesos: cuantificar cuanto cambia el comportamiento general de un modelo cuando se le aplica una edicion quirurgica, mediante KL sobre prompts benignos respecto al base.
- Prototipado y pruebas de infraestructura: con 1,1B de parametros permite validar pipelines de transformers, TGI, llama.cpp u Ollama en local antes de escalar a modelos mayores, con un coste de recursos minimo.
- Experimentacion local en hardware de consumo: cabe en GPU de gama baja o incluso en CPU, lo que facilita reproducir experimentos de seguridad sin acceso a clústeres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo publico dos metricas propias, y las ha retirado expresamente: la tasa de rechazo y la discriminacion de dano (AUC). Se reproducen a continuacion unicamente para dejar constancia de su retirada.

| Metrica | Base | Abliterado | Estado |
|---|---|---|---|
| Tasa de rechazo (200 prompts daninos reservados) | 0,5 % | 1,5 % | Retirada |
| Discriminacion de dano (AUC, 200 daninos vs 200 benignos) | 0,5506 | 0,5431 | Retirada |

Motivos declarados de la retirada: el filtro que debia conservar solo las direcciones portadoras de rechazo aceptaba cualquier candidata, por lo que las direcciones nunca se seleccionaron con ese criterio; el detector de evasivas puntuaba respuestas complacientes como rechazos suaves, desplazando la tasa segun la formulacion del modelo; y la fila de AUC esta retirada en la propia documentacion del proyecto. El autor pide explicitamente que no se escale ni se cite ninguna de estas cifras con matices. Como referencia de contexto, la model card senala que el modelo responde «HARMFUL» al 100,0 % de los prompts benignos, por lo que el umbral de decision, y no el conocimiento, seria lo que mediria un recuento de veredictos.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: en torno a 2,5-3 GB contando pesos (2,2 GB) y overhead de la cache KV.
- VRAM estimada en 8 bits: aproximadamente 1,1-1,5 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 0,7-0,9 GB.
- Cache KV: segun la configuracion del modelo base (22 capas, 4 cabezas KV, dimension de cabeza 64), la cache completa a 2048 tokens ronda las decenas de MB en FP16; es un factor menor frente a los pesos.
- GPU recomendadas: cualquier GPU de consumo con 4 GB o mas de VRAM es suficiente (GTX 1650, RTX 3050/3060, RTX 4090 sobradamente). Tambien es viable en CPU y en Apple Silicon. No requiere A100, H100 ni hardware de datacenter, salvo para lotes muy grandes o experimentos de interpretabilidad con muchas activaciones simultaneas.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`), llama.cpp, Ollama, LM Studio y text-generation-inference (el repositorio lleva la etiqueta `text-generation-inference` y `endpoints_compatible`). vLLM es tambien una opcion razonable por tratarse de un transformer Llama estandar.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Comportamiento de rechazo | Disponibilidad |
|---|---|---|---|---|---|
| ElementMerc/tinyllama-1.1b-abliterated | 1,1B | 2048 tokens | Apache-2.0 | Eliminado por edicion de pesos | safetensors + GGUF |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | 1,1B | 2048 tokens | Apache-2.0 | Alineado (SFT + DPO) | safetensors + GGUF |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache-2.0 | Alineado | safetensors + GGUF |
| SmolLM2-1.35B-Instruct | 1,35B | 8192 tokens | Apache-2.0 | Alineado | safetensors + GGUF |

Nota: los datos de los tres modelos de comparacion proceden de su documentacion publica, no de la informacion proporcionada sobre este modelo. No es posible comparar rendimiento en tareas (razonamiento, codigo, matematicas) porque no hay benchmarks publicados para el modelo abliterado ni cifras corregidas de sus metricas de seguridad; la unica comparacion defendible es estructural y de comportamiento de rechazo.

## Limitaciones y advertencias

- El modelo no rechaza peticiones. Es su proposito declarado y el riesgo principal: respondera a solicitudes que el modelo base declina, incluidas las daninas.
- Cualquier despliegue orientado a terceros necesita su propia capa de seguridad; este modelo no incorpora ninguna y su autor lo declara explicitamente como no apto para usuarios finales.
- La abliteracion no es gratuita: es una edicion dirigida, pero sigue siendo una edicion. Cabe esperar deriva en el comportamiento general respecto al modelo base.
- Las cifras de la model card sobre rechazo y AUC estan retiradas por errores de medicion; no deben citarse, escalarse ni usarse con salvedades. La afirmacion sobre el efecto real de la abliteracion en este modelo no esta verificada.
- Competencia muy limitada: con 1,1B de parametros el modelo es debil en terminos absolutos. Sus respuestas tecnicas no deben tomarse como fiables.
- Evaluado unicamente en ingles y sobre un unico conjunto de prompts daninos; no se puede extrapolar a otros idiomas ni a otros tipos de peticion.
- Los sesgos del modelo base se conservan intactos y, al eliminar el rechazo, pueden ser mas faciles de elicitar.
- Riesgo alto de alucinacion y de respuestas incorrectas con tono seguro, inherente al tamano del modelo.
- Licencia Apache-2.0: permite uso comercial desde el punto de vista legal, pero el uso previsto por el autor es investigacion en mecanismos de rechazo, interpretabilidad, red teaming y evaluacion de seguridad. El uso como asistente general o desplegado a usuarios finales queda fuera de ese uso previsto.
- La fecha de creacion del repositorio (27-07-2026) y la de actualizacion (11-10-2026) son posteriores al conocimiento habitual de los modelos TinyLlama, lo que conviene tener en cuenta al verificar procedencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ElementMerc/tinyllama-1.1b-abliterated
- Repositorio GGUF: https://huggingface.co/ElementMerc/tinyllama-1.1b-abliterated-GGUF
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Repositorio de la herramienta senbonzakura: https://github.com/elementmerc/senbonzakura
- Registro de cambios: https://github.com/elementmerc/senbonzakura/blob/main/CHANGELOG.md
- Documentacion de errores del proyecto: https://elementmerc.github.io/senbonzakura/guide/what-we-got-wrong
