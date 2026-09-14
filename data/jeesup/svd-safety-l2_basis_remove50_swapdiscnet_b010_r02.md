# Jeesup/svd-safety-l2_basis_remove50_swapdiscnet_b010_r02

## Resumen

`Jeesup/svd-safety-l2_basis_remove50_swapdiscnet_b010_r02` es un checkpoint de investigación construido sobre `meta-llama/Llama-2-7b-chat-hf` al que se le ha aplicado una compresión SVD denominada Basis Sharing (ICLR 2025), con bases compartidas sobre grupos de 2 capas adyacentes, eliminando el 50,00% de los parámetros densos de proyección. Sobre ese modelo comprimido se aplica un proceso de edición iterativa de parámetros ("swap") seleccionado por la regla `swapdiscnet_iter`, con un presupuesto de restauración del 1,000% de los parámetros densos repartido en 10 rondas; este checkpoint concreto corresponde a la ronda 2 de 10.

El propósito declarado por el autor no es ofrecer un asistente desplegable, sino servir como artefacto experimental para cuantificar cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué reglas de selección de componentes reparan mejor ese daño. Es, por tanto, una celda dentro de una rejilla de experimentos sobre reglas de selección y presupuestos, y el propio autor advierte que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat.

La relevancia actual es metodológica: conecta compresión de modelos (eficiencia) con seguridad e interpretabilidad (mecanismos internos que sostienen el rechazo de peticiones dañinas), un área con poca literatura cuantitativa. El repositorio ocupa 13,5 GB, declara 6.738.415.616 parámetros en safetensors y se distribuye bajo la licencia Llama 2 Community.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Llama 2, heredada de `meta-llama/Llama-2-7b-chat-hf`), con compresion SVD por bases compartidas cada 2 capas adyacentes |
| Parametros totales | 6.738.415.616 (recuento de safetensors); fraccion de parametros resultante declarada: 0,4998 tras el 50,00% de eliminacion sobre parametros densos |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (heredada del modelo base Llama-2-7b-chat); no se documenta ampliacion en la model card |
| Tipos de cuantizacion | no disponible (el autor solo publica pesos en safetensors; no se documentan versiones GGUF, AWQ, GPTQ ni bitsandbytes) |
| Idiomas soportados | no disponible (la model card no los lista; el modelo base Llama 2 esta optimizado principalmente para ingles) |
| Licencia | Llama 2 Community License (incluye `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (libreria `transformers`); tamano del repositorio: 13,5 GB |

## Arquitectura y entrenamiento

El punto de partida es Llama-2-7b-chat-hf, un transformer decoder-only de aproximadamente 7.000 millones de parametros. La intervencion principal es una compresion por descomposicion en valores singulares con "Basis Sharing": en lugar de factorizar cada capa de forma independiente, se comparten bases entre grupos de 2 capas adyacentes, lo que elimina el 50,00% de los parametros densos de proyeccion. Sobre esa estructura se aplica una recuperacion mediante LoRA de rango 8 restringida exclusivamente a los coeficientes por capa (las bases permanecen congeladas y el presupuesto de parametros no cambia), durante 2 epochs con learning rate 0,0001, batch 64 y el dataset `alpaca-cleaned`. La semilla utilizada es 42.

El segundo mecanismo es la edicion iterativa de parametros: la regla `swapdiscnet_iter` selecciona componentes que se eliminan y se reinsertan con el valor `net` (valor de insercion mas valor de eliminacion del descarte ordenado por sigma). Cada ronda opera sobre un bloque del 0,100% de los parametros densos y el presupuesto total de la ejecucion completa es del 1,0%. En este checkpoint se han aplicado 2 de las 10 rondas, con 939 componentes restaurados y 939 sustituidos, lo que supone 12.943.872 parametros intercambiados (0,20% de los parametros densos de proyeccion). Se trata, por tanto, de un checkpoint intermedio de una ejecucion mas larga, no del resultado final.

No se documenta en la informacion disponible ni el volumen de tokens de preentrenamiento (heredado del modelo base), ni la composicion del dataset de alineacion original, ni si hubo RLHF o DPO adicionales mas alla del ajuste LoRA descrito.

## Capacidades

- Generacion de texto conversacional: mantiene la interfaz de chat del modelo base, con plantilla de Llama-2-chat.
- Razonamiento e instrucciones generales: capacidad residual tras la compresion al 50%, no evaluada de forma sistematica en la model card.
- Codigo y matematicas: no se documentan evaluaciones especificas; la capacidad esperable es la del modelo base degradada por la compresion.
- Tool calling / function calling: no documentado; Llama-2-7b-chat no incorpora un formato nativo de llamadas a herramientas.
- Agentes y razonamiento multi-paso: no documentado.
- Multilingue: no documentado; el modelo base esta centrado en ingles.
- Capacidad especial: ninguna de tipo thinking mode, vision o audio. La "capacidad" relevante de este checkpoint es instrumental: permite medir tasas de exito de ataque (ASR) y de sobrerrechazo bajo una configuracion concreta de compresion y edicion.

## Casos de uso

- Estudio de la relacion entre compresion y seguridad: usar este checkpoint junto con las demas celdas de la rejilla para medir como varia el ASR de AdvBench y StrongREJECT a medida que se aplican rondas de edicion, manteniendo constante el presupuesto de compresion.
- Comparacion de reglas de seleccion de componentes: el identificador del checkpoint (`swapdiscnet_iter`) permite contrastarlo con otras reglas del mismo estudio bajo identico presupuesto y semilla, aislando el efecto de la regla.
- Analisis de mecanismos internos (interpretabilidad): localizar que componentes (filas/columnas de proyecciones) sostienen el comportamiento de rechazo, ya que el proceso registra explicitamente 939 componentes restaurados y 939 sustituidos.
- Evaluacion de sobre-rechazo: con una tasa de macro over-refusal de 0,1698 medida con WildGuard, sirve para estudiar el coste en utilidad de las intervenciones de seguridad.
- Reproducibilidad de resultados: semilla fija (42), presupuesto y chunk por ronda documentados, lo que permite replicar la ronda 2 de 10 en un entorno controlado.
- Punto de partida para experimentos de recuperacion adicional: al ser un checkpoint intermedio, permite aplicar las rondas 3 a 10 y estudiar la curva de recuperacion de seguridad frente a presupuesto.
- Docencia y formacion en eficiencia de modelos: ejemplo tangible de como una reduccion del 50% en parametros densos de proyeccion se implementa con bases compartidas y como se compensa parcialmente con LoRA de bajo rango.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las tres metricas declaradas por el autor, todas ellas medidas con el juez HarmBench o WildGuard segun se indica:

| Metrica | Valor | Juez / herramienta |
|---|---|---|
| AdvBench ASR | 0,1308 | HarmBench judge |
| StrongREJECT ASR | 0,1853 | HarmBench judge |
| Macro over-refusal | 0,1698 | WildGuard |

No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de ninguna otra bateria estandar, ni valores de referencia del modelo base sin comprimir dentro de la informacion disponible, por lo que no es posible calcular la delta de degradacion a partir de estos datos.

## Requisitos de hardware

- VRAM estimada para inferencia en precision de los pesos publicados (safetensors, ~13,5 GB de repositorio): en torno a 14-16 GB de VRAM para cargar el modelo, mas la cache KV correspondiente al contexto de 4.096 tokens.
- En cuantizacion de 8 bits, la huella aproximada baja a 7-8 GB; en 4 bits, a 4-5 GB, asumiendo que el checkpoint se pueda cuantizar con las herramientas habituales (no hay versiones cuantizadas publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para servir en precision completa o con lotes grandes. En gama consumer, RTX 4090 / RTX 3090 (24 GB) permiten inferencia en los pesos publicados; RTX 4080 / 4070 Ti (16 GB) requieren cuantizacion de 8 bits o inferior; GPUs de 8-12 GB necesitan cuantizacion de 4 bits.
- Opciones de despliegue: `transformers` de forma nativa; el repositorio esta marcado como `endpoints_compatible` y `text-generation-inference`, por lo que es compatible con Hugging Face TGI y con Inference Endpoints; vLLM es viable en la medida en que soporte el estado comprimido del checkpoint. Para llama.cpp u Ollama seria necesario convertir a GGUF, y no se proporciona dicha conversion.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token para ninguna configuracion de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seguridad (ASR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`svd-safety-l2_..._b010_r02`) | 6.738.415.616 en safetensors; 0,4998 de la fraccion densa de proyeccion | 4.096 tokens | AdvBench 0,1308; StrongREJECT 0,1853; over-refusal 0,1698 | Llama 2 Community | Repositorio publico con 0 descargas y 0 likes en el momento del registro |
| `meta-llama/Llama-2-7b-chat-hf` (modelo base sin comprimir) | ~6,74 mil millones | 4.096 tokens | no disponible en la informacion proporcionada | Llama 2 Community | Ampliamente disponible; requiere aceptar la licencia en Hugging Face |
| `meta-llama/Llama-2-13b-chat-hf` | ~13 mil millones | 4.096 tokens | no disponible en la informacion proporcionada | Llama 2 Community | Ampliamente disponible |
| `mistralai/Mistral-7B-Instruct-v0.2` | ~7,2 mil millones | 32.768 tokens | no disponible en la informacion proporcionada | Apache 2.0 | Ampliamente disponible |

La comparacion directa de rendimiento no es posible con los datos aportados: el autor no publica las metricas equivalentes del modelo base ni de otros modelos de referencia, de modo que las cifras de ASR de este checkpoint carecen de una linea base explicita en la propia model card.

## Limitaciones y advertencias

- Artefacto de investigacion, no un asistente desplegable: el propio autor indica que debe tratarse cada celda de la rejilla como sujeto experimental, no como modelo de produccion.
- Seguridad degradada de forma intencionada en varias configuraciones: la compresion por si sola eleva la tasa de exito de ataques respecto a Llama-2-7b-chat, y este checkpoint presenta un ASR de 0,1308 en AdvBench y 0,1853 en StrongREJECT.
- Sobre-rechazo apreciable: la metrica de macro over-refusal de 0,1698 implica que una fraccion relevante de peticiones benignas es rechazada, lo que penaliza la utilidad en uso conversacional real.
- Checkpoint intermedio: corresponde a 2 de 10 rondas de una ejecucion mas larga, por lo que no representa el punto final del metodo ni necesariamente el mejor equilibrio seguridad-utilidad del estudio.
- Sesgos heredados: al derivar de Llama-2-7b-chat, arrastra los sesgos conocidos del modelo base y de sus datos de alineacion; no se documenta ninguna mitigacion adicional.
- Riesgo de alucinacion: no se publican evaluaciones de veracidad ni de fidelidad factual, y la compresion puede afectar a la calidad de la generacion de formas no caracterizadas.
- Limitacion idiomatica probable: el modelo base esta optimizado para ingles y la model card no declara soporte multilingue; el rendimiento en castellano no esta documentado.
- Restricciones de licencia: Llama 2 Community License, con `USE_POLICY.md` vinculante. Limita usos prohibidos, exige atribucion ("Built with Llama 2") y establece condiciones para despliegues a muy gran escala. No es una licencia permisiva tipo Apache 2.0.
- Idiomas y cuantizaciones no documentados: no hay informacion sobre versiones GGUF/AWQ/GPTQ, lo que complica el despliegue en hardware de gama baja.
- Adopcion nula: cero descargas y cero likes en el momento del registro, sin validacion externa de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_basis_remove50_swapdiscnet_b010_r02
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- `LICENSE.txt` y `USE_POLICY.md`: incluidos en el propio repositorio del modelo
- Paper Basis Sharing (ICLR 2025): citado en la model card, sin enlace directo en la informacion proporcionada
- No se han encontrado en la busqueda web enlaces adicionales relevantes (papers, blogs, repos o demos) asociados a este modelo
