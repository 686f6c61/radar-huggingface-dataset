# maria715/CAT_llama3b_likeZephyr_eps0150_42_relativelr_utility_500_NEW_weight0238

## Resumen

Este repositorio no contiene un modelo de lenguaje completo, sino un adaptador LoRA (Low-Rank Adaptation) entrenado con la libreria PEFT sobre un modelo base de aproximadamente 3.000 millones de parametros. El nombre del repositorio, `CAT_llama3b_likeZephyr_eps0150_42_relativelr_utility_500_NEW_weight0238`, codifica los hiperparametros de un experimento de tesis de master centrado en entrenamiento adversarial para mejorar la robustez de modelos de lenguaje frente a perturbaciones en las entradas. El prefijo "llama3b" apunta a un modelo base de la familia Llama 3 de 3B (previsiblemente Llama-3.2-3B) y "likeZephyr" sugiere que el base fue previamente ajustado con una receta de tipo Zephyr (SFT seguido de DPO) antes de aplicar el adaptador.

El artefacto es, por tanto, material de investigacion: no hay pipeline declarado, no hay licencia especificada, no se listan idiomas soportados y el autor no ha publicado una model card con resultados de evaluacion. Las unicas etiquetas declaradas son `peft`, `safetensors`, `lora` y `adversarial-training`, y el tamano del repositorio es de 1,2 GB, coherente con un adaptador de rango relativamente alto o guardado en precision completa mas estados del optimizador o checkpoints auxiliares.

Su relevancia es acotada pero clara: sirve como evidencia reproducible de un estudio sobre robustez adversarial en LLM pequenos, con una semilla fijada (42) y una nomenclatura de hiperparametros totalmente trazable (epsilon 0,150, learning rate relativo, peso de perdida 0,238). No esta pensado para despliegue en produccion tal cual, sino para ser cargado sobre su modelo base exacto y evaluado en el contexto del experimento original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer denso de ~3B parametros |
| Parametros totales | No disponible (el repositorio contiene solo el adaptador; el modelo base, segun la convencion de nombre, seria de ~3B) |
| Longitud de contexto | No disponible para el adaptador (el base Llama-3.2-3B admite 128K tokens) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |
| Modelo base | No declarado explicitamente; el nombre indica un Llama de 3B con ajuste tipo Zephyr |
| Tecnica de entrenamiento | Entrenamiento adversarial (tag `adversarial-training`), con epsilon 0,150, semilla 42, esquema de learning rate relativo y peso 0,238 |
| Tamano del repositorio | 1,2 GB |
| Libreria | peft |
| Fecha de creacion | 2026-09-30 |
| Fecha de actualizacion | 2026-09-30 |

## Arquitectura y entrenamiento

El adaptador aplica la tecnica LoRA sobre las capas de atencion y/o proyecciones de un transformer denso. LoRA congela los pesos del modelo base e inyecta matrices de bajo rango entrenables, de modo que el numero de parametros actualizados es una fraccion minima del total. El repositorio incluye unicamente esos pesos delta, gestionados por la libreria PEFT de Hugging Face, por lo que su carga requiere disponer del modelo base compatible y aplicar `PeftModel.from_pretrained` sobre el.

El entrenamiento se enmarca en una tesis de master sobre robustez adversarial. El nombre codifica los ajustes clave: `eps0150` corresponde a un presupuesto de perturbacion de 0,150 (habitual en ataques tipo FGSM o PGD sobre embeddings), `42` es la semilla aleatoria, `relativelr` alude a un esquema de tasa de aprendizaje relativa (probablemente escalado respecto al learning rate del ajuste original), `utility_500` sugiere un termino de utilidad medido sobre 500 ejemplos o pasos, y `weight0238` fija en 0,238 el peso de la componente adversarial en la funcion de perdida total. La etiqueta `likeZephyr` indica que el modelo base fue previamente alineado con una receta similar a la de Zephyr, es decir, ajuste supervisado sobre instrucciones seguido de optimizacion por preferencias (DPO).

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, el rango y alpha del adaptador, ni la estrategia de ataque adversarial concreta empleada (FGSM, PGD, FreeLB u otra). Tampoco se documenta si hubo evaluacion de robustez posterior al entrenamiento.

## Capacidades

- Generacion de texto y seguimiento de instrucciones: heredadas del modelo base de ~3B con ajuste tipo Zephyr, aunque el adaptador esta orientado a robustez, no a nuevas capacidades.
- Razonamiento y codigo: presumiblemente las del base Llama 3.2 3B, que soporta generacion de codigo basico y tareas de razonamiento de corta longitud; no verificado para este adaptador.
- Tool calling: el modelo base Llama 3.2 3B soporta uso de herramientas segun la documentacion publica del base, pero no hay evidencia de que el adaptador preserve o mejore esta capacidad.
- Robustez adversarial: capacidad objetivo del entrenamiento; se espera mayor resistencia a perturbaciones en las entradas, aunque no se publican metricas que lo confirmen.
- Capacidades multilingues: no disponibles.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponibles; el repositorio solo contiene pesos LoRA de texto.

## Casos de uso

- Investigacion sobre robustez adversarial: reproducir el experimento cargando el adaptador sobre el base correspondiente y evaluando la tasa de exito de ataques FGSM/PGD antes y despues del ajuste, usando la semilla 42 para garantizar la reproducibilidad.
- Estudio de compromiso robustez-utilidad: analizar como afecta un peso adversarial de 0,238 a metricas de calidad generica (perplejidad, exactitud en tareas de instrucciones) frente al modelo base sin adaptador.
- Ablacion de hiperparametros: comparar este checkpoint con otros del mismo autor que varian epsilon, semilla o peso, para aislar el efecto de cada variable en la curva de robustez.
- Base para adaptadores defensivos en produccion de bajo coste: dado que un LoRA ocupa una fraccion minima del modelo, puede servir como plantilla para incorporar defensas ligeras a un modelo de 3B ya desplegado.
- Docencia y formacion en seguridad de LLM: usar el repositorio como ejemplo practico de entrenamiento adversarial con PEFT en un taller universitario, por su tamano manejable y su nomenclatura autocontenida.
- Evaluacion comparativa de tecnicas PEFT: medir coste de almacenamiento y de inferencia de un adaptador de 1,2 GB frente a otras variantes de rango o precision en un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card se limita a una linea descriptiva y no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de robustez adversarial (por ejemplo, exactitud bajo ataque a distintos valores de epsilon).

## Requisitos de hardware

- VRAM estimada: el adaptador es ligero, pero requiere cargar el modelo base completo. Para un base de ~3B parametros, la inferencia en FP16 exige aproximadamente 6-7 GB de VRAM; en cuantizacion de 8 bits, unos 3,5-4 GB; en 4 bits, unos 2-3 GB.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o superiores para FP16 con margen; A100 o H100 no son necesarias para este tamano, salvo para entrenamiento o evaluacion por lotes a gran escala.
- Compatibilidad con GPU de consumo: si, el modelo base de 3B cabe sin problema en GPU de consumo de 8 GB o mas en cuantizacion de 8 o 4 bits, y en 12 GB o mas en FP16.
- Opciones de despliegue: al ser un adaptador PEFT, se integra de forma nativa con transformers y PEFT; para servicio en produccion puede combinarse con vLLM (soporta LoRA dinamico), TGI o servidores basados en llama.cpp/Ollama tras fusionar el adaptador con el base y exportar a GGUF.
- Latencia y throughput: no disponibles; dependeran del modelo base, del backend y del hardware, no del adaptador en si, cuyo coste adicional de inferencia es minimo si se fusiona con los pesos base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (maria715/CAT_llama3b...) | No disponible (base ~3B) | No disponible (base 128K) | Adaptador LoRA sobre transformer denso | No disponible | Hugging Face, 0 descargas, 0 likes |
| meta-llama/Llama-3.2-3B | 3,21B | 128K | Transformer denso | Licencia comunitaria Llama 3.2 | Hugging Face, ampliamente usado |
| openlm-research/open_llama_3b | ~3B | 2K | Transformer denso | Apache 2.0 (con condiciones) | Hugging Face, modelo abierto de referencia |
| Zephyr-7B (familia) | ~7B | 32K | Transformer denso ajustado con SFT + DPO | MIT (segun publicacion original) | Hugging Face, muy extendido |

La comparacion directa es limitada: este repositorio es un adaptador de investigacion sin evaluacion publicada, mientras que los modelos de la tabla son checkpoints completos con documentacion y metricas disponibles. El adaptador solo es util en combinacion con su base exacto.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni metricas de robustez, ni comparacion con el base sin adaptar; no puede afirmarse que mejore la resistencia a ataques.
- Licencia no especificada: al no declararse licencia, el uso comercial queda en un limbo legal. Ademas, si el base es Llama-3.2, hereda las restricciones de la licencia comunitaria de Meta.
- Modelo base no declarado con exactitud: cargar el adaptador sobre un base distinto al usado en el entrenamiento puede producir resultados incorrectos o directamente fallos de carga por incompatibilidad de dimensiones.
- Riesgo de alucinacion: inherente a los modelos de ~3B, que ademas tienen menor conocimiento factual que modelos mayores; el ajuste adversarial no corrige este comportamiento.
- Sesgos: no documentados; se heredan los del corpus de entrenamiento del base, sin filtrado adicional conocido.
- Limitaciones idiomaticas: no se declaran idiomas soportados; el base Llama 3.2 esta optimizado para ingles y ocho idiomas adicionales, con rendimiento inferior en otras lenguas.
- Artefacto de investigacion: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia, sin mantenimiento posterior conocido. No apto para produccion sin una validacion propia exhaustiva.
- Robustez adversarial acotada: un entrenamiento adversarial protege frente al tipo de perturbacion y al presupuesto concreto usados durante el entrenamiento; no ofrece garantias frente a ataques distintos o presupuestos mayores.
- Opacidad de hiperparametros: aunque el nombre codifica epsilon, semilla y peso, no se documentan el rango LoRA, el optimizador, la tasa de aprendizaje absoluta ni el numero de pasos.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/maria715/CAT_llama3b_likeZephyr_eps0150_42_relativelr_utility_500_NEW_weight0238
- Modelo base presumible: https://huggingface.co/meta-llama/Llama-3.2-3B
- Pagina de Llama 3.2 3B en Ollama: https://ollama.com/library/llama3.2:3b
- Paper de la familia Llama 3 (The Llama 3 Herd of Models): https://arxiv.org/abs/2407.21783
- Modelo abierto de referencia de 3B: https://huggingface.co/openlm-research/open_llama_3b
- Libreria PEFT (documentacion): https://huggingface.co/docs/peft
