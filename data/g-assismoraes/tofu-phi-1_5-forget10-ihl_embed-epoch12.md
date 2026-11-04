# g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch12

## Resumen

TOFU-phi-1.5-forget10-ihl_embed-epoch12 es un checkpoint de investigacion publicado por el usuario g-assismoraes en HuggingFace. Se trata de un ajuste fino del modelo locuslab/tofu_ft_phi-1.5 (a su vez derivado de microsoft/phi-1_5) dentro del marco TOFU (Task of Fictitious Unlearning), un benchmark academico disenado para evaluar tecnicas de "machine unlearning", es decir, la capacidad de eliminar selectivamente el conocimiento de un subconjunto de datos de entrenamiento sin degradar el rendimiento general del modelo.

El checkpoint corresponde al epoch 12 de un entrenamiento de 20 epocas en el que se aplica una tecnica denominada IHL (probablemente "Inverted Hinge Loss" o una variante de perdida con margen invertido) combinada con un reinicio de los embeddings de entrada y la cabeza LM desde el modelo original microsoft/phi-1_5, manteniendo el resto de pesos del transformer entrenados en TOFU. El objetivo es el conjunto "forget10", uno de los splits estandar de TOFU en el que se busca olvidar el 10 % de los autores ficticios.

El modelo tiene 1.418 millones de parametros (1.4B), arquitectura transformer densa basada en Phi-1.5, ventana de contexto de 2048 tokens segun el modelo base, y se distribuye en formato safetensors con licencia Apache 2.0. Es relevante en el contexto de investigacion sobre privacidad, cumplimiento del RGPD y derechos al olvido en modelos de lenguaje, aunque no esta pensado para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Phi-1.5) |
| Parametros totales | 1.418.270.720 (~1.4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (heredada de Phi-1.5; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estandar a 8/4 bits con herramientas como bitsandbytes o GPTQ) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer decoder-only denso de aproximadamente 1.4B parametros, con atencion multi-cabeza estandar y contexto de 2048 tokens. Phi-1.5 fue entrenado originalmente por Microsoft Research sobre un corpus filtrado de "libros de texto" y datos sinteticos orientados a razonamiento basico y generacion de codigo. Sobre esa base, locuslab/tofu_ft_phi-1.5 aplico un ajuste fino supervisado con el dataset TOFU, compuesto por 200 autores ficticios con 20 preguntas y respuestas cada uno (4000 pares QA en total).

El checkpoint aqui descrito aplica un procedimiento de desaprendizaje sobre el split forget10 (10 % de los autores, es decir, 20 autores ficticios). La innovacion tecnica declarada en la model card consiste en reinicializar los embeddings de entrada y la cabeza LM desde microsoft/phi-1_5 mientras se conservan los pesos del resto del transformer entrenados en TOFU. La funcion de perdida combina un termino IHL sobre el conjunto forget y una entropia cruzada (CE) con peso 1.0 sobre el conjunto retain. El entrenamiento se ejecuto durante 20 epocas, y este checkpoint corresponde al epoch 12. Se incluye un fichero ihl_manifest.json con metadatos del procedimiento. No se especifica en la informacion disponible el numero total de tokens vistos, la composicion exacta del dataset de desaprendizaje, ni si se empleo RLHF o DPO.

## Capacidades

- Generacion de texto en ingles con calidad propia de un modelo de 1.4B parametros.
- Razonamiento basico y respuesta a preguntas de conocimiento general (heredado de Phi-1.5).
- Generacion de codigo simple (Phi-1.5 fue entrenado con enfasis en codigo).
- Razonamiento matematico de nivel basico (aritmetica y problemas sencillos).
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni multi-step reasoning explicito.
- Capacidad multilingue limitada al ingles.
- No dispone de vision, audio ni modo "thinking" extendido.
- El proposito principal del checkpoint es servir como objeto de estudio en evaluacion de tecnicas de unlearning (metricas de forget quality y retain quality).

## Casos de uso

- Investigacion en machine unlearning: el checkpoint se emplea como punto de comparacion en experimentos que miden la eficacia de la tecnica IHL frente a otros metodos (gradient ascent, preference optimization, etc.) sobre el benchmark TOFU.
- Evaluacion de privacidad y derecho al olvido: permite estudiar si un modelo de 1.4B puede "olvidar" informacion sobre autores ficticios concretos manteniendo su utilidad general, un requisito relevante para el cumplimiento del RGPD en despliegues reales.
- Reproducibilidad academica: al ser un checkpoint completo y autonomo con manifiesto incluido, sirve para replicar resultados de papers sobre desaprendizaje sin necesidad de reentrenar desde cero.
- Analisis de trade-off forget/retain: util para medir la degradacion de capacidades (perplejidad en el conjunto retain, exactitud en QA) a medida que aumenta la intensidad del desaprendizaje en distintas epocas.
- Estudio de reinicializacion de embeddings: permite analizar el efecto de reiniciar los embeddings de entrada y la cabeza LM como estrategia para mitigar la retencion de informacion sensible.
- Base para experimentos de cuantizacion: al ser un modelo pequeno (2.8 GB en safetensors), se puede desplegar en GPUs de consumo para comparar el comportamiento de tecnicas de unlearning bajo cuantizacion a 8 o 4 bits.
- Docencia en cursos de IA responsable: ejemplo practico y ligero para ilustrar como se evalua el olvido selectivo en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2.8-3.0 GB (1.4B parametros x 2 bytes).
- VRAM estimada en int8: aproximadamente 1.5 GB.
- VRAM estimada en int4: aproximadamente 0.8-1.0 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3050, RTX 4060, T4). Para entrenamiento o evaluacion a gran escala se recomienda A100 o H100, aunque por tamano cabe en GPUs de consumo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas (RTX 3060, RTX 4060, RTX 4090).
- Opciones de despliegue: transformers (con trust_remote_code por el tag custom_code), llama.cpp (previa conversion a GGUF), Ollama (previa conversion), vLLM y TGI (compatibles con arquitectura Phi-1.5).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch12 | 1.4B | 2048 (heredado) | Unlearning (TOFU forget10) | Apache 2.0 | HuggingFace |
| locuslab/tofu_ft_phi-1.5 | 1.4B | 2048 | Fine-tune TOFU completo (sin olvido) | Apache 2.0 | HuggingFace |
| microsoft/phi-1_5 | 1.4B | 2048 | Modelo base de razonamiento y codigo | MIT | HuggingFace |
| locuslab/tofu_llama2-7b | 7B | 4096 | Fine-tune TOFU sobre Llama 2 | Llama 2 license | HuggingFace |

El checkpoint se diferencia de locuslab/tofu_ft_phi-1.5 en que aplica desaprendizaje sobre forget10, mientras que el segundo retiene todo el conocimiento de TOFU. Frente a microsoft/phi-1_5, el modelo aqui descrito ha sido ajustado sobre datos ficticios y posteriormente parcialmente "desaprendido", por lo que su rendimiento en tareas generales puede diferir del original. Los resultados cuantitativos de forget quality y retain quality no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado para uso en produccion ni para aplicaciones comerciales directas, pese a la licencia Apache 2.0.
- Riesgo de alucinacion: como todo modelo de 1.4B, puede generar contenido facticamente incorrecto, especialmente tras el proceso de desaprendizaje, que puede degradar la coherencia en dominios relacionados con los autores olvidados.
- Sesgos: no se documenta ninguna evaluacion de sesgos; el modelo hereda los sesgos de Phi-1.5 y del dataset TOFU (autores ficticios con atributos sinteticos).
- Limitacion de idioma: solo ingles; no soporta castellano de forma fiable.
- Contexto limitado: 2048 tokens, insuficiente para tareas de contexto largo.
- Eficacia del olvido no verificada: no se aportan metricas de forget quality ni retain quality, por lo que no puede confirmarse que el desaprendizaje sea completo ni que no se haya degradado el rendimiento general.
- Dependencia de custom_code: requiere trust_remote_code al cargar con transformers, lo que implica ejecutar codigo del autor.
- Sin descargas ni likes: el checkpoint no ha sido validado por la comunidad; su reproducibilidad no esta contrastada de forma independiente.
- Uso comercial: aunque la licencia es Apache 2.0, el modelo base Phi-1.5 tiene licencia MIT y el dataset TOFU puede tener sus propias restricciones; conviene revisar la cadena de licencias antes de cualquier uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch12
- Modelo base (TOFU fine-tune): https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Repositorio TOFU (benchmark de unlearning): https://github.com/locuslab/tofu
- Paper TOFU: https://arxiv.org/abs/2401.06121
