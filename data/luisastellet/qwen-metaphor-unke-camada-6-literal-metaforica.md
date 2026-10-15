# luisastellet/qwen-metaphor-unke-camada-6-literal-metaforica

## Resumen

`luisastellet/qwen-metaphor-unke-camada-6-literal-metaforica` es un modelo de generación de texto publicado en HuggingFace por el usuario `luisastellet`, derivado de la familia Qwen3 segun indican sus etiquetas (`qwen3`, `transformers`, `text-generation`, `conversational`). Cuenta con 596.049.920 parametros reales almacenados en safetensors, lo que lo situa en la franja de los 0,6 mil millones de parametros, y un repositorio de 2,4 GB. El identificador del repositorio sugiere un experimento de analisis sobre representaciones internas de metaforas frente a lenguaje literal en la sexta capa ("camada 6" en portugues) de la red.

El modelo no dispone de model card util: el README es la plantilla autogenerada de HuggingFace con todos los campos marcados como "[More Information Needed]". Esto implica que no hay informacion oficial sobre datos de entrenamiento, licencia, idiomas, contexto, proceso de ajuste ni uso previsto. Tampoco se han publicado resultados de benchmarks, demos ni articulos asociados.

La relevancia de esta ficha es, por tanto, la de un artefacto de investigacion de trazabilidad limitada: util como checkpoint de partida para reproducir experimentos de interpretabilidad sobre Qwen3-0.6B, pero no recomendable como componente de produccion sin una evaluacion previa por parte del equipo que lo vaya a integrar. La ausencia de licencia explicita es el principal bloqueo para cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3, segun etiquetas del repositorio) |
| Parametros totales | 596.049.920 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos en safetensors, segun las etiquetas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Las unicas senales disponibles apuntan a un transformer decoder-only de la familia Qwen3, con aproximadamente 596 millones de parametros. La etiqueta `qwen3` y la libreria declarada (`transformers`) son los unicos indicios sobre la arquitectura base; no se ha publicado informacion sobre numero de capas, dimension del modelo, cabezas de atencion, tipo de normalizacion, uso de attention con sesgo QKV ni configuracion de RoPE. Tampoco se documenta si se trata de un ajuste fino (SFT), un proceso de destilacion, un recorte de capas o una intervencion directa sobre pesos de un modelo Qwen3 preentrenado.

No hay datos sobre el corpus de entrenamiento: ni numero de tokens, ni composicion del dataset, ni si hubo fases de RLHF, DPO o RLVR. El nombre del repositorio sugiere que el trabajo experimental gira en torno a la capa 6 y a la distincion entre interpretacion literal y metaforica, lo que encaja con la hipotesis de un ajuste o una intervencion localizada en esa capa, pero se trata de una inferencia a partir del identificador y no de un dato documentado. La etiqueta `arxiv:1910.09700` que aparece en la metadata corresponde al articulo de Lacoste et al. sobre el calculador de impacto de Machine Learning, incluido por defecto en la plantilla de HuggingFace, y no a un paper sobre este modelo.

## Capacidades

- Generacion de texto autoregresiva: la pipeline declarada es `text-generation` y la etiqueta `conversational` indica que el chat template esta preparado para dialogos multi-turno, presumiblemente heredado de Qwen3.
- Conversacion: el formato conversacional de Qwen3 usa tokens especiales de rol; se desconoce si el ajuste ha modificado el template.
- Razonamiento y codigo: no hay evidencia publicada. Cualquier capacidad de este tipo seria la heredada de la base Qwen3-0.6B y no esta verificada en este checkpoint.
- Tool calling / function calling: no documentado. Qwen3 soporta este formato en sus versiones instruct, pero no hay confirmacion de que este checkpoint lo conserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no documentadas. El identificador esta en portugues y la ficha se publica en un hub con metadatos en ingles, pero no hay lista de idiomas declarada.
- Capacidades especiales (vision, audio, modo thinking): no disponibles. No hay indicios de que existan.
- Interpretabilidad de metaforas: capacidad implicita del experimento asociado al nombre del repositorio, no del modelo como producto.

## Casos de uso

- Reproduccion de experimentos de interpretabilidad: el modelo encaja como checkpoint de trabajo para analizar activaciones de la capa 6 en frases literales frente a metaforicas, comparando con el Qwen3-0.6B original para aislar el efecto de la intervencion.
- Evaluacion comparativa de checkpoints pequenos: por su tamano, puede ejecutarse en una unica GPU de consumo y usarse como linea base en baterias de generacion de texto a bajo coste, siempre que se documente que no hay benchmarks publicados.
- Prototipado offline de interfaces conversacionales: con 596 M de parametros, cabe en portatiles con 8 GB de VRAM en cuantizacion de 4 bits, lo que permite iterar en el diseno de prompts y templates sin depender de servicios en la nube.
- Generacion de texto asistida en castellano o portugues: si el ajuste conserva el multilingueismo de Qwen3, podria emplearse para redaccion breve, resumenes y reformulacion; requiere validacion manual previa porque no hay idiomas declarados.
- Filtrado y clasificacion de contenido linguistico: el modelo puede utilizarse para etiquetar si una frase es literal o figurada, que es precisamente el eje del experimento, aunque sin metricas publicadas de precision o recall.
- Docencia y formacion en NLP: sirve como ejemplo practico de como un checkpoint derivado de un modelo abierto puede publicarse sin documentacion, y de los problemas de reproducibilidad que ello genera.
- Pruebas de integracion con `text-generation-inference`: la etiqueta `text-generation-inference` y `endpoints_compatible` indica compatibilidad con el servidor de HuggingFace, lo que permite desplegarlo como endpoint interno para pruebas de latencia y throughput.

En todos los casos, el uso en produccion queda condicionado a la ausencia de licencia explicita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion. No se han publicado tampoco mediciones de perplejidad, latencia ni throughput en la model card, en la metadata del repositorio ni en los resultados de busqueda consultados.

## Requisitos de hardware

- VRAM estimada para inferencia (calculos a partir del numero de parametros; no son datos publicados por el autor):
  - fp32: aproximadamente 2,4 GB de pesos, mas activaciones (el tamano del repositorio de 2,4 GB es coherente con pesos en fp32).
  - bf16/fp16: aproximadamente 1,2 GB de pesos.
  - int8: aproximadamente 0,6 GB.
  - int4 (GGUF Q4_K_M): aproximadamente 0,35-0,4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizacion de 4 bits (RTX 3050, RTX 4060, T4). Para bf16 sin cuantizar, una RTX 3060 de 12 GB o superior es suficiente. No requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU discreta moderna con 6 GB o mas. Tambien puede ejecutarse en CPU con llama.cpp o Ollama, con latencias de decenas de tokens por segundo en procesadores modernos.
- Opciones de despliegue: `transformers` con PyTorch (ruta nativa, dado el formato safetensors), `text-generation-inference` (etiqueta declarada), vLLM, SGLang, llama.cpp y Ollama (estos ultimos requieren conversion previa a GGUF, no incluida en el repositorio). La etiqueta `endpoints_compatible` sugiere compatibilidad con Inference Endpoints de HuggingFace.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

Los datos de la columna del modelo analizado son los unicos verificados en este repositorio. Los datos de los modelos comparables provienen de sus fichas publicas y deben confirmarse antes de citarlos.

| Modelo | Parametros | Contexto | Benchmarks publicos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `luisastellet/qwen-metaphor-unke-camada-6-literal-metaforica` | 596 M | No disponible | No publicados | No disponible | HuggingFace, 0 descargas, 0 likes |
| Qwen3-0.6B | 0,6 B | 32.768 tokens (ampliable con YaRN, segun su ficha) | Si, en su model card oficial | Apache 2.0 | HuggingFace, ampliamente utilizado |
| Qwen2.5-0.5B | 0,49 B | 32.768 tokens (segun su ficha) | Si, en su model card oficial | Apache 2.0 | HuggingFace |
| SmolLM2-360M | 0,36 B | 8.192 tokens (segun su ficha) | Si, en su model card oficial | Apache 2.0 | HuggingFace |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens (segun su ficha) | Si, en su model card oficial | Apache 2.0 | HuggingFace |

La diferencia principal no es de rendimiento, sino de trazabilidad: los tres modelos comparables documentan licencia, idiomas, contexto y evaluaciones, mientras que el modelo analizado no ofrece ninguno de esos datos.

## Limitaciones y advertencias

- Ausencia total de model card: todos los campos estan marcados como "[More Information Needed]" porque el README se genero automaticamente. No hay documentacion de uso previsto ni de uso fuera de alcance.
- Licencia no especificada: sin licencia explicita no hay autorizacion clara para uso comercial. Aunque el modelo base Qwen3 sea Apache 2.0, el autor del checkpoint no ha declarado bajo que terminos lo distribuye, lo que genera incertidumbre juridica.
- Riesgo de alucinacion: con 596 M de parametros, la tasa de alucinacion es estructuralmente alta en tareas de conocimiento factual. No hay evaluaciones que la cuantifiquen.
- Idiomas no declarados: no se puede garantizar el comportamiento en castellano ni en portugues, a pesar de que el identificador del repositorio este en portugues.
- Longitud de contexto desconocida: no se puede planificar un caso de uso que dependa de ventanas largas sin medirla empiricamente.
- Sesgos: no evaluados. Los sesgos heredados del corpus de preentrenamiento de Qwen3 no han sido auditados en este checkpoint, y un ajuste sobre una capa concreta puede alterarlos de forma no controlada.
- Riesgo de degradacion por ajuste selectivo: si el checkpoint es el resultado de modificar la capa 6, es posible que otras capacidades de la base (codigo, matematicas, instrucciones) se hayan degradado. Sin benchmarks no es posible descartarlo.
- Artefacto de investigacion sin mantenimiento: 0 descargas, 0 likes y fechas de creacion y actualizacion separadas por menos de un minuto indican una subida puntual sin iteracion posterior.
- Resultados de busqueda no concluyentes: las consultas web realizadas no han devuelto ninguna fuente relacionada con el modelo, el autor ni el experimento. Los unicos resultados obtenidos eran contenido no relacionado y de naturaleza adulta, sin ninguna vinculacion con el modelo. No se han incluido como enlaces.
- Reproducibilidad: sin codigo de entrenamiento, sin dataset y sin hiperparametros, el experimento no es reproducible a partir de la informacion publicada.

## Enlaces

- HuggingFace: https://huggingface.co/luisastellet/qwen-metaphor-unke-camada-6-literal-metaforica
- Paper citado en la etiqueta de impacto de carbono (plantilla por defecto, no vinculado al modelo): https://arxiv.org/abs/1910.09700
- Calculador de impacto de Machine Learning referenciado en la plantilla: https://mlco2.github.io/impact
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo en la busqueda web realizada.
