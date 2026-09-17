# lugman-madhiai/LFM2.5-2.6B-TauKnowledge-SFT-02

## Resumen

LFM2.5-2.6B-TauKnowledge-SFT-02 es un ajuste fino supervisado (SFT) del modelo LiquidAI/LFM2.5-2.6B, desarrollado por el usuario lugman-madhiai y publicado en HuggingFace. Se trata de un modelo denso de 2.697.198.592 parametros (aproximadamente 2,7 mil millones) orientado a generacion de texto conversacional, distribuido bajo licencia Apache 2.0. El repositorio ocupa 5,4 GB, lo que corresponde a pesos en precision de 16 bits (BF16/FP16).

El modelo base pertenece a la familia LFM2 de Liquid AI, una arquitectura hibrida que combina convoluciones de corto alcance con atencion con consultas agrupadas (GQA). Se trata de una arquitectura disenada para eficiencia en inferencia en el borde (edge) y en GPU de consumo, con un coste de decodificacion bajo respecto a transformers densos de tamano equivalente.

La relevancia de esta ficha es limitada pero concreta: es un ejemplo de ajuste fino ligero realizado con Unsloth y la libreria TRL de HuggingFace, que el autor declara haber entrenado "2x mas rapido" gracias a esas herramientas. No se han publicado detalles sobre el dataset de ajuste (el nombre "TauKnowledge" sugiere un corpus de conocimiento, pero no se documenta), ni resultados de evaluacion, ni informacion sobre el proceso de alineacion. El modelo esta etiquetado unicamente para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido de la familia LFM2 (convoluciones de corto alcance combinadas con atencion con consultas agrupadas, GQA); no confirmado en detalle en la informacion del repositorio |
| Parametros totales | 2.697.198.592 (aproximadamente 2,7 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion de este repositorio (la familia LFM2 declara 32.768 tokens) |
| Tipos de cuantizacion | No se incluyen cuantizaciones en el repositorio; solo pesos en safetensors. Susceptible de conversion a GGUF, AWQ o GPTQ con herramientas externas |
| Idiomas soportados | Ingles (etiqueta `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (5,4 GB en el repositorio, compatible con la libreria `transformers`) |
| Modelo base | LiquidAI/LFM2.5-2.6B |
| Tipo de ajuste | SFT (supervised fine-tuning) sobre el modelo base |
| Herramientas de entrenamiento | Unsloth y TRL (declarado por el autor) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base LiquidAI/LFM2.5-2.6B, integrada en la familia LFM2 de Liquid AI. Esta familia emplea un esquema hibrido en el que la mayor parte de las capas utiliza convoluciones (bloques de tipo convolucion con puerta) y un subconjunto reducido emplea atencion con consultas agrupadas, lo que reduce el coste de la cache KV y mejora el rendimiento en decodificacion respecto a un transformer denso convencional del mismo tamano. La informacion disponible en el repositorio no detalla el numero de capas, la dimension oculta, el tamano de vocabulario ni la configuracion exacta de cabezas de atencion.

En cuanto al entrenamiento, la model card indica unicamente que se trata de un ajuste fino del modelo base realizado con Unsloth y TRL, con una mejora declarada de velocidad de entrenamiento de 2x. No se especifica el numero de tokens de entrenamiento, la composicion del dataset (mas alla del nombre "TauKnowledge" en el identificador del modelo), la existencia de fases de RLHF, DPO u otra alineacion posterior al SFT, ni la precision utilizada durante el ajuste. El autor tampoco documenta el uso de LoRA/QLoRA frente a ajuste completo, aunque el uso de Unsloth es compatible con ambas aproximaciones.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat (etiqueta `conversational` en el repositorio).
- Razonamiento basico y respuesta a instrucciones, heredado del modelo base y presumiblemente reforzado por el ajuste SFT.
- Generacion de codigo y resolucion de problemas sencillos, en la medida en que el modelo base lo permita (no se documentan capacidades especificas ni evaluaciones).
- Soporte de tool calling / function calling: no documentado en la informacion disponible; depende de las capacidades del modelo base y del formato de plantilla de chat empleado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio; no se declara soporte de castellano ni de otros idiomas.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo de razonamiento explicito ("thinking mode"): no documentado.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: al tratarse de un modelo de 2,7 B parametros, puede ejecutarse en una GPU de consumo o incluso en CPU con cuantizacion, lo que permite iterar sobre prompts y plantillas de chat sin coste de API.
- Ajuste fino adicional sobre dominio propio: al estar publicado bajo Apache 2.0 y en safetensors, sirve como punto de partida para experimentos de SFT con Unsloth o TRL en tareas especificas (clasificacion generativa, extraccion de informacion, resumen).
- Evaluacion comparativa de tecnicas de fine-tuning: util como caso de estudio de un pipeline Unsloth + TRL sobre un modelo hibrido de la familia LFM2, para medir coste y velocidad de entrenamiento frente a transformers densos.
- Inferencia en el borde o en entornos con recursos limitados: con cuantizacion a 4 bits, los pesos se situan en torno a 1,4-1,6 GB, lo que permite despliegue en dispositivos con poca memoria o en contenedores ligeros.
- Generacion de texto en procesos por lotes (batch offline): tareas de reescritura, parafraseo o generacion de variaciones de texto en ingles donde no se requiere maxima calidad sino coste bajo y ejecucion local.
- Experimentacion academica y docencia: modelo pequeno y con licencia permisiva, adecuado para explicar arquitecturas hibridas convolucion-atencion y para reproducir experimentos de ajuste supervisado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (MMLU, GSM8K, HumanEval u otras), ni comparaciones con el modelo base o con alternativas. Tampoco se documentan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 5,4 GB solo de pesos; con cache KV, activaciones y overhead del runtime, del orden de 7-8 GB. Estimacion orientativa, no medida sobre este modelo concreto.
- VRAM estimada con cuantizacion INT8: del orden de 3 GB de pesos.
- VRAM estimada con cuantizacion INT4 (GGUF Q4_K_M o equivalente): del orden de 1,5-2 GB de pesos.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y superiores para BF16 sin cuantizar. En el segmento profesional, A100, H100 o L40S son sobradamente suficientes y permiten lotes grandes.
- Compatibilidad con GPU de consumo: si. En BF16 cabe en cualquier GPU con 8 GB o mas de VRAM; con cuantizacion a 4 bits cabe en GPU de 4-6 GB e incluso puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: `transformers` (formato nativo del repositorio), `text-generation-inference` (TGI, etiquetado en el repositorio), vLLM, llama.cpp/Ollama mediante conversion a GGUF, y frameworks de cuantizacion como AWQ o GPTQ. La integracion en vLLM y llama.cpp depende del soporte efectivo de la arquitectura LFM2 en la version correspondiente de cada herramienta.
- Latencia y throughput: no disponible. No se han publicado mediciones para este modelo.

## Comparativa con modelos similares

Los datos de la columna "este modelo" proceden del repositorio; el resto se basa en la documentacion publica de cada proyecto y deberia verificarse antes de tomar decisiones de produccion.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| LFM2.5-2.6B-TauKnowledge-SFT-02 | 2,7 B | No disponible (familia LFM2: 32.768 tokens) | Apache 2.0 | Ingles | Ajuste comunitario sin evaluacion publicada |
| LiquidAI/LFM2.5-2.6B (base) | 2,7 B | Familia LFM2: 32.768 tokens | Apache 2.0 (segun repositorio base) | Ingles | Arquitectura hibrida de Liquid AI |
| Qwen2.5-3B-Instruct | Aproximadamente 3,1 B | 32.768 tokens | Qwen Research License (uso comercial restringido en esta variante) | Multilingue | Referencia habitual en el segmento 3B |
| Llama-3.2-3B-Instruct | Aproximadamente 3,2 B | 128.000 tokens | Llama 3.2 Community License | Multilingue | Contexto muy superior; licencia con condiciones |
| Gemma-2-2B-it | Aproximadamente 2,6 B | 8.192 tokens | Gemma Terms of Use | Multilingue | Tamano comparable; contexto mas corto |
| SmolLM2-1.7B-Instruct | Aproximadamente 1,7 B | 8.192 tokens | Apache 2.0 | Ingles principalmente | Alternativa pequena con licencia permisiva |

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni comparacion con el modelo base, ni analisis de regresiones introducidas por el ajuste SFT. No es posible afirmar que el ajuste mejore al base en ninguna tarea.
- Procedencia y trazabilidad: se trata de un ajuste realizado por un usuario individual, sin publicacion asociada, sin dataset documentado y sin proceso de revision. El dataset "TauKnowledge" no esta descrito.
- Riesgo de alucinacion: como cualquier modelo de 2,7 B parametros, la tasa de afirmaciones incorrectas con apariencia de veracidad es elevada, especialmente en tareas de conocimiento factual y matematicas.
- Sesgos: no se documenta ningun analisis de sesgos, toxicidad ni filtrado del corpus de ajuste. Al desconocerse la composicion del dataset, no puede descartarse la amplificacion de sesgos presentes en el modelo base.
- Limitacion idiomatica: el modelo esta etiquetado unicamente para ingles. El rendimiento en castellano no esta garantizado y probablemente sea deficiente.
- Contexto limitado: si se confirma el limite de 32.768 tokens de la familia LFM2, tareas de documento largo o conversaciones muy extensas requeriran estrategias de troceado o recuperacion externa.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion sin obligacion de compartir derivados, siempre que se conserve el aviso de licencia. No obstante, conviene verificar la licencia del modelo base LiquidAI/LFM2.5-2.6B y las condiciones de los datos de ajuste, no declaradas.
- Ausencia de soporte: sin mantenimiento, sin issues atendidas (0 descargas y 0 "likes" en el momento de la consulta) y sin garantia de compatibilidad con versiones futuras de las librerias.
- Produccion desaconsejada sin validacion previa: antes de desplegarlo en cualquier flujo real, es imprescindible ejecutar una evaluacion propia en el dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lugman-madhiai/LFM2.5-2.6B-TauKnowledge-SFT-02
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl
- Documentacion de text-generation-inference: https://github.com/huggingface/text-generation-inference
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre LFM2.5-2.6B; los unicos enlaces verificables son los del repositorio de HuggingFace y las herramientas de entrenamiento citadas en la model card.
