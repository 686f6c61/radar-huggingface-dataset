# PowCal/OLMo-2-1124-13B-4bit-alpaca-sft-ce

## Resumen

PowCal/OLMo-2-1124-13B-4bit-alpaca-sft-ce es un checkpoint derivado del modelo base OLMo-2-1124-13B desarrollado por el Allen Institute for AI (AI2). El nombre del repositorio indica tres transformaciones sobre el modelo original: una cuantizacion a 4 bits, un ajuste fino supervisado (SFT) sobre el dataset Alpaca y algun tipo de modificacion adicional denotada por el sufijo "ce". El autor del repositorio es el usuario PowCal, no AI2, y la model card es la plantilla autogenerada por Hugging Face sin informacion rellenada.

El modelo hereda la arquitectura transformer decoder-only de OLMo 2, con aproximadamente 13.000 millones de parametros, y esta pensado para tareas de generacion de texto e instrucciones en ingles. Su relevancia practica es limitada: se trata de un experimento de cuantizacion y ajuste fino de un modelo abierto, sin documentacion tecnica publicada, sin resultados de evaluacion y con cero descargas registradas en el momento de redactar esta ficha.

La ficha se apoya en la informacion disponible en el repositorio de Hugging Face y en las caracteristicas conocidas del modelo base OLMo-2-1124-13B de AI2. Cualquier dato no confirmado se marca explicitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de OLMo-2-1124-13B) |
| Parametros totales | ~13.000 millones (segun nombre del modelo y modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en el repositorio; el modelo base OLMo-2-1124-13B soporta hasta 4096 tokens en su configuracion publicada |
| Tipos de cuantizacion | 4 bits (segun nombre del repositorio); esquema exacto no disponible |
| Idiomas soportados | no disponible (el modelo base esta entrenado principalmente en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OLMo-2-1124-13B: un transformer decoder-only con atencion por capas, normalizacion RMSNorm y las mejoras introducidas por AI2 en la segunda generacion de OLMo (entre ellas, reordenacion de normalizaciones y mejoras de estabilidad en el entrenamiento). El modelo base fue entrenado desde cero por AI2 sobre un corpus abierto de varios billones de tokens, con un proceso posterior de SFT y DPO documentado por el instituto.

Sobre esa base, este checkpoint aplica tres modificaciones segun el nombre del repositorio: cuantizacion a 4 bits, ajuste fino supervisado sobre el dataset Alpaca (instrucciones en ingles generadas con el metodo de Taori et al.) y una variante denotada "ce" cuyo significado no esta documentado. No se especifica el numero de tokens de entrenamiento del SFT, la composicion exacta del dataset, hiperparametros, ni si hubo etapas adicionales de alineacion. La model card no aporta ningun detalle sobre el procedimiento.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada del modelo base OLMo-2-1124-13B.
- Seguimiento de instrucciones basicas tras el ajuste fino sobre Alpaca.
- Razonamiento de sentido comun y respuesta a preguntas de conocimiento general, en la medida en que lo permita el modelo base.
- Generacion de codigo y resolucion de problemas matematicos sencillos, sin garantias de calidad por falta de evaluacion publicada.
- Capacidad multilingue limitada y no documentada; el modelo base esta centrado en ingles.
- No se ha documentado soporte de tool calling, function calling, agentes, modo de razonamiento explicito, vision ni audio.

## Casos de uso

- Experimentacion academica con cuantizacion de 4 bits: util para estudiar la degradacion de calidad al cuantizar un modelo de 13B y comparar con el checkpoint original en bf16.
- Prototipado rapido de asistentes conversacionales en ingles: el ajuste fino sobre Alpaca permite obtener respuestas con formato instructivo sin necesidad de prompts elaborados.
- Evaluacion de pipelines de SFT: sirve como referencia para comparar el efecto de distintos datasets de instrucciones sobre un mismo modelo base.
- Despliegue en hardware de gama consumer: la cuantizacion a 4 bits reduce el peso del modelo a unos 7-8 GB, lo que permite ejecutarlo en GPUs con 12-16 GB de VRAM para pruebas locales.
- Generacion de texto de relleno en entornos de desarrollo: util para pruebas de integracion de aplicaciones que consumen una API compatible con transformers sin depender de servicios externos.
- Analisis de robustez y sesgos: al ser un modelo pequeno y abierto, permite auditar el comportamiento de un LLM ajustado con instrucciones en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones del checkpoint cuantizado ni comparaciones con el modelo base. Tampoco se documenta la perdida de calidad introducida por la cuantizacion a 4 bits.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7-8 GB con cuantizacion a 4 bits; en bf16 el modelo base requiere unos 26 GB.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 3090 (24 GB) o superiores para la version cuantizada; A100 40/80 GB o H100 para ejecutar el modelo base en precision completa.
- Cabe en GPU consumer: si, en tarjetas con al menos 8-12 GB de VRAM para la version de 4 bits, dependiendo del backend y de la longitud de contexto.
- Opciones de despliegue: transformers con bitsandbytes o GPTQ/AWQ segun el esquema exacto de cuantizacion (no documentado); llama.cpp u Ollama requeririan conversion a GGUF, no incluida en el repositorio; vLLM y TGI son compatibles con el modelo base pero no se garantiza su funcionamiento con este checkpoint sin verificacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PowCal/OLMo-2-1124-13B-4bit-alpaca-sft-ce | ~13B | no disponible | no disponible | Hugging Face (0 descargas) |
| allenai/OLMo-2-1124-13B | ~13B | 4096 tokens | Apache 2.0 (modelo base de AI2) | Hugging Face, ampliamente documentado |
| allenai/OLMo-2-1124-13B-SFT | ~13B | 4096 tokens | Apache 2.0 | Hugging Face, con model card completa |
| Mistral-7B-Instruct-v0.3 | ~7,2B | 32.768 tokens | Apache 2.0 | Hugging Face, muy extendido |

La comparativa con Mistral se incluye como referencia de un modelo instructivo abierto de tamano similar en orden de magnitud, con contexto mucho mayor y ecosistema de despliegue mas maduro. No se dispone de datos de rendimiento del checkpoint de PowCal para comparar calidad.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla autogenerada, sin informacion sobre datos, hiperparametros ni evaluacion.
- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido, lo que desaconseja su uso en produccion.
- El modelo base OLMo-2 esta entrenado principalmente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- La cuantizacion a 4 bits puede degradar la coherencia, el razonamiento y la fidelidad factual respecto al modelo original, sin que se haya medido esa perdida.
- El ajuste fino sobre Alpaca, un dataset generado automaticamente, puede introducir sesgos y respuestas estereotipadas.
- Riesgo de alucinacion inherente a los modelos de 13B sin etapas de alineacion documentadas en este checkpoint.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validacion por parte de la comunidad.
- El sufijo "ce" del nombre no esta explicado; podria indicar una modificacion adicional no documentada que afecte al comportamiento del modelo.
- No se garantiza compatibilidad con backends de inferencia optimizados (vLLM, TGI) sin verificacion previa del formato de cuantizacion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/PowCal/OLMo-2-1124-13B-4bit-alpaca-sft-ce
- Modelo base OLMo-2-1124-13B: https://huggingface.co/allenai/OLMo-2-1124-13B
- Version SFT oficial de AI2: https://huggingface.co/allenai/OLMo-2-1124-13B-SFT
- Paper de impacto ambiental citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML CO2: https://mlco2.github.io/impact
