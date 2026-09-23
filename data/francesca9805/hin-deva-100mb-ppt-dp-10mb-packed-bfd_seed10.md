# francesca9805/hin-deva-100mb-ppt-Dp-10mb-packed-bfd_seed10

## Resumen

El modelo `francesca9805/hin-deva-100mb-ppt-Dp-10mb-packed-bfd_seed10` es un ajuste fino (fine-tuning) supervisado del modelo base `goldfish-models/hin_deva_100mb`, un modelo monolingue de la familia Goldfish orientado al hindi escrito en devanagari. Lo publica el usuario de HuggingFace `francesca9805` y emplea la libreria TRL (version 0.23.0) sobre el stack de Transformers 4.56.2 y PyTorch 2.5.1. Por sus etiquetas y su tamano de repositorio (0.3 GB), se trata de un modelo pequeno, de arquitectura tipo GPT-2, con 124.770.816 parametros totales.

El problema que aborda es acotado: adaptar mediante SFT un modelo de lenguaje monolingue de bajos recursos a un formato de instrucciones o de continuacion de texto, presumiblemente ligado a experimentos con tokenizadores (el nombre del modelo incluye fragmentos como `ppt`, `Dp`, `packed` y `bfd_seed10`, y la propia ficha enlaza a un proyecto de Weights & Biases llamado `new-tokenizers`). No se documenta en la model card ni el dataset de entrenamiento, ni el numero de tokens, ni el idioma exacto de las instrucciones.

Su relevancia actual es limitada y de caracter experimental: acumula 0 descargas y 0 "likes", no declara licencia ni idiomas, y no publica resultados de evaluacion. Resulta interesante sobre todo como ejemplo de reproducibilidad de un SFT pequeno sobre un modelo Goldfish, y como caso de estudio de ajustes de bajo coste en lenguas con pocos recursos, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta `gpt2` en el repositorio) |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles (el repositorio solo publica pesos en safetensors; no hay variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible en la ficha; el modelo base (`goldfish-models/hin_deva_100mb`) esta orientado al hindi en escritura devanagari segun su propio nombre |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0.3 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Fecha de creacion | 2026-09-22 |
| Fecha de actualizacion | 2026-09-22 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2, con aproximadamente 125 millones de parametros. No se aportan detalles sobre el numero de capas, dimensiones ocultas, cabezas de atencion ni sobre la longitud de contexto efectiva. El modelo hereda la arquitectura del base `goldfish-models/hin_deva_100mb`, que a su vez pertenece a la familia Goldfish de modelos monolingues de bajo coste. El repositorio se distribuye unicamente en `safetensors`, sin variantes cuantizadas.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. No se especifican el dataset, el numero de tokens de entrenamiento, la composicion de los datos, ni si hubo etapas posteriores de RLHF o DPO. La model card enlaza a una ejecucion de Weights & Biases en el proyecto `f-padovani-university-of-groningen/new-tokenizers` (run `5qsqocgk`), lo que sugiere que el ajuste forma parte de un experimento sobre tokenizadores mas que de un ciclo de entrenamiento orientado a producto. No se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, hibridacion SSM, etc.).

## Capacidades

- Generacion de texto autoregresiva en el estilo para el que fue ajustado, partiendo del modelo base en hindi (devanagari).
- Ajuste por instrucciones de tipo SFT: la model card muestra un ejemplo de `pipeline("text-generation")` con una lista de mensajes con rol `user`, lo que indica soporte del formato conversacional minimo de `transformers`.
- Capacidad multilingue: no confirmada. El modelo base es monolingue (hindi/dev anagari); la pregunta de ejemplo de la model card esta en ingles, lo que no garantiza buen rendimiento en ese idioma.
- Tool calling / function calling: no disponible, no se documenta.
- Soporte de agentes y razonamiento multi-paso: no disponible, no se documenta.
- Capacidades especiales (modo de razonamiento explicito, vision, audio): ninguna documentada.
- Compatibilidad con Text Generation Inference (TGI) y endpoints, segun las etiquetas del repositorio (`text-generation-inference`, `endpoints_compatible`).

## Casos de uso

- Experimentacion academica con modelos de bajos recursos: el modelo sirve como punto de partida reproducible para estudiar como afecta un SFT pequeno a un modelo Goldfish de 125M, comparando el ajuste con el base sin ajustar.
- Investigacion sobre tokenizadores: dado que el nombre del modelo y el proyecto de Weights & Biases apuntan a experimentos de tokenizacion (`new-tokenizers`), es util para comparar el efecto de distintas estrategias de tokenizacion en la calidad de generacion en hindi.
- Generacion de texto en hindi a pequena escala: para prototipos que necesiten completar o continuar texto en devanagari donde no se requiera alta fidelidad, con la ventaja de que el modelo cabe en recursos minimos.
- Pruebas de integracion de pipelines de `transformers` y TGI: su tamano reducido permite validar extremo a extremo un flujo de despliegue (carga, inferencia, API) sin coste de GPU significativo.
- Docencia y formacion: adecuado para ilustrar el ciclo completo de fine-tuning con TRL sobre un modelo base publico, incluida la lectura de metricas en Weights & Biases.
- Evaluacion comparativa de modelos pequenos: util como linea base de 125M en hindi dentro de estudios que midan perplejidad o calidad de generacion frente a otros tamanos de la familia Goldfish (1 MB, 10 MB, 100 MB).
- Generacion de datos sinteticos de bajo coste: podria emplearse para aumentar corpus en hindi en experimentos, siempre que se valide y filtre la salida dada la probable baja calidad del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en inferencia: aproximadamente 0,25 GB en FP16 y 0,5 GB en FP32 solo para los pesos, mas el coste de activaciones y cache KV, que es despreciable con contextos cortos. En la practica, menos de 1-2 GB de VRAM en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU consumer o profesional moderna. Funciona en RTX 3060, RTX 4090, A100, H100 y tambien en GPU integradas o en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: `transformers` (soporte nativo confirmado por la model card), Text Generation Inference (TGI, segun etiquetas del repositorio) y compatibilidad con endpoints. Para llama.cpp u Ollama seria necesario convertir previamente los pesos a GGUF, ya que no se publican variantes en ese formato.
- Latencia y throughput estimados: no disponibles. Por el tamano del modelo (125M) se puede esperar latencia de milisegundos por token en GPU moderna, pero no hay datos publicados que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| `francesca9805/hin-deva-100mb-ppt-Dp-10mb-packed-bfd_seed10` | 124.770.816 | no disponible | no disponible | safetensors | Ajuste SFT, 0 descargas |
| `goldfish-models/hin_deva_100mb` (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | Base monolingue hindi/dev anagari |
| GPT-2 (`openai-community/gpt2`) | 124M (aprox.) | 1.024 tokens (arquitectura GPT-2 estandar) | MIT (segun su repositorio; no verificado en esta busqueda) | safetensors, GGUF en conversiones de terceros | Ampliamente usado como linea base |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia, formato y disponibilidad. Otros modelos comparables de 125M especificamente en hindi no se han identificado en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al derivar de un corpus de 100 MB en hindi, es previsible que herede los sesgos presentes en ese corpus, pero no hay analisis publicado.
- Riesgo de alucinacion: alto. Un modelo de 125M ajustado con SFT sobre datos no especificados tiene una capacidad limitada de factualidad y coherencia; no deberia usarse en contextos donde la exactitud sea critica.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada y el idioma de entrenamiento efectivo no se especifica. La pregunta de ejemplo de la model card esta en ingles, lo que puede inducir a error sobre su competencia real en ese idioma.
- Restricciones de licencia: la licencia figura como "no disponible" y la model card incluye un campo `licence: license` sin concretar. No se puede asumir uso comercial libre; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Modelo sin validacion: 0 descargas y 0 "likes" en el momento de la consulta, sin evaluacion externa ni benchmarks publicados.
- Documentacion incompleta: no se describe el dataset de SFT, el numero de tokens, la composicion de los datos ni los hiperparametros, lo que dificulta la reproducibilidad y la evaluacion del ajuste.
- Sin cuantizaciones oficiales: no hay GGUF ni otros formatos optimizados, lo que anade un paso de conversion si se quiere desplegar en herramientas como llama.cpp u Ollama.
- Contexto de origen experimental: el enlace a un proyecto de tokenizadores sugiere que el modelo es un artefacto de investigacion, no un modelo orientado a produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/hin-deva-100mb-ppt-Dp-10mb-packed-bfd_seed10
- Modelo base: https://huggingface.co/goldfish-models/hin_deva_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/5qsqocgk
- Cita de TRL (von Werra et al., 2020): incluida en la model card del autor
