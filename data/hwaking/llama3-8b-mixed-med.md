# hwaking/llama3-8b-mixed-med

## Resumen

`hwaking/llama3-8b-mixed-med` es un ajuste fino (fine-tune) publicado en Hugging Face por el usuario `hwaking` sobre una base de la familia Llama 3 de 8 mil millones de parametros. El nombre del repositorio sugiere un entrenamiento orientado al dominio medico ("mixed-med"), presumiblemente con datos mixtos de ese ambito, aunque la model card no documenta ni el dataset, ni el procedimiento, ni los objetivos del ajuste. El modelo se distribuye en formato `safetensors` para la libreria `transformers` y fue generado con Llama Factory, segun las etiquetas del repositorio.

El problema que aborda es, por tanto, la especializacion de un modelo generalista de 8B en tareas de texto del dominio sanitario. Por su tamano, es desplegable en una unica GPU de gama alta o incluso en GPUs de consumo con cuantizacion, lo que lo hace atractivo para prototipos de bajo coste. Sin embargo, la ausencia total de documentacion tecnica, de licencia explicita y de evaluacion publicada limita seriamente su uso en produccion.

La relevancia actual del modelo es limitada: se trata de un artefacto de investigacion personal con cero descargas y cero likes en el momento de la ficha, sin model card sustantiva. Cualquier evaluacion rigurosa debe hacerse por cuenta del usuario antes de considerarlo para un despliegue real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3, inferida del nombre; no documentada en la model card) |
| Parametros totales | 8.030.261.248 (8,03 mil millones, dato real de safetensors) |
| Parametros activos | no disponible (no es un modelo MoE segun los datos disponibles) |
| Longitud de contexto | no disponible (la base Llama 3 suele soportar 8.192 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | no disponible en el repositorio; al ser un modelo Llama es cuantificable a GGUF/AWQ/GPTQ con herramientas externas, pero el autor no publica variantes |
| Idiomas soportados | no disponible (presumiblemente multilingue por herencia de Llama 3, sin confirmacion) |
| Licencia | no disponible (la model card no especifica licencia; la licencia de Llama 3 impone condiciones adicionales) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La model card no aporta informacion sobre la arquitectura mas alla de las etiquetas del repositorio (`llama`, `transformers`, `llama-factory`). Por el nombre y el recuento de parametros (8,03B) se infiere una base Llama 3 8B, un transformer decoder-only con atencion causal, RoPE y normalizacion RMSNorm, pero no hay confirmacion explicita del autor. El ajuste se realizo presumiblemente con Llama Factory, framework habitual para SFT y DPO sobre modelos Llama, aunque no se documenta ni el metodo (SFT, LoRA, QLoRA, DPO) ni los hiperparametros.

No se especifica el volumen de tokens de entrenamiento, la composicion del dataset, si hubo RLHF o DPO, ni ninguna innovacion tecnica (decodificacion especulativa, atencion lineal, etc.). El sufijo "mixed-med" sugiere una mezcla de datos medicos, pero es una inferencia a partir del nombre, no un dato documentado. Tampoco se indica la fecha de entrenamiento ni el hardware utilizado.

## Capacidades

- Generacion de texto conversacional, por herencia de la base Llama 3 (no verificado en este ajuste).
- Presunta especializacion en dominio medico por el nombre del repositorio, sin evidencia documentada.
- Soporte de tool calling y function calling: no disponible (no documentado; depende de si el ajuste preservo el chat template original).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible (no se mencionan).
- Razonamiento matematico y generacion de codigo: no disponible para este ajuste concreto.

## Casos de uso

- Prototipado de asistentes clinicos de bajo coste: el tamano de 8B permite desplegarlo en una unica GPU y experimentar con respuestas a preguntas medicas, siempre que se valide su calidad con un conjunto de evaluacion propio antes de cualquier uso real.
- Investigacion academica sobre ajuste fino en dominio sanitario: sirve como punto de partida para comparar tecnicas de especializacion (SFT vs. DPO) sobre una base Llama 3 8B, dado que el autor no publica resultados.
- Generacion de resumenes de notas clinicas en entornos controlados: el modelo podria procesar documentos de varias paginas si conserva el contexto de 8K de Llama 3, aunque la falta de evaluacion obliga a medir la fidelidad de los resumenes manualmente.
- Extraccion de entidades medicas (farmacos, diagnosticos, dosis): utilizable como componente en un pipeline de NLP clinico tras validacion con un conjunto anotado del dominio.
- Chatbot de triaje informativo no diagnostico: desplegable con vLLM o llama.cpp en una RTX 4090 (cuantizado a 4 bits ocupa unos 5 GB), con las advertencias legales y de responsabilidad que exige el ambito sanitario.
- Base para ajustes posteriores con LoRA: al ser un modelo de 8B en safetensors, se puede reentrenar con QLoRA en una GPU de 24 GB para adaptarlo a subdominios concretos (radiologia, farmacia, etc.).
- Evaluacion de riesgos de alucinacion en dominio medico: util como caso de estudio para medir la tasa de fabricacion de referencias o dosis en modelos pequenos especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion con marcadores `[More Information Needed]` en todos los campos y no se han encontrado tablas de MMLU, HumanEval, GSM8K ni metricas de dominio medico en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16 GB solo para pesos, mas overhead de KV cache; se recomienda una GPU de 24 GB o superior.
- Cuantizacion a 8 bits: unos 8-9 GB de VRAM, cabe en una RTX 4090, RTX 3090 o A10G.
- Cuantizacion a 4 bits: unos 5-6 GB de VRAM, cabe en una RTX 4060 Ti 16 GB, RTX 4070 o incluso GPUs de 8 GB con contexto reducido.
- GPU recomendadas para produccion: A100 40/80 GB, H100, L40S; para prototipos, RTX 4090 o RTX 3090.
- Cabe en GPU de consumo: si, en RTX 4090 (FP16) y en RTX 3060 12 GB o RTX 4060 Ti 16 GB con cuantizacion a 4-8 bits.
- Opciones de despliegue: `transformers` (libreria nativa del repositorio), vLLM, TGI, llama.cpp y Ollama previa conversion a GGUF (el autor no publica variantes GGUF).
- Latencia y throughput estimados: no disponibles; no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `hwaking/llama3-8b-mixed-med` | 8,03B | no disponible | no disponible | Hugging Face, 0 descargas | Ajuste sin documentacion ni evaluacion |
| `meta-llama/Meta-Llama-3-8B` | 8,03B | 8.192 tokens | Llama 3 Community License | Hugging Face, ampliamente usado | Base oficial con model card completa y benchmarks |
| `meta-llama/Meta-Llama-3-8B-Instruct` | 8,03B | 8.192 tokens | Llama 3 Community License | Hugging Face | Version instruida oficial, con evaluacion publicada |
| `BioMistral/BioMistral-7B` | 7,24B | 2.048-32.768 tokens segun variante | Apache 2.0 / CC-BY-NC segun version | Hugging Face | Alternativa open source especializada en dominio medico con paper publicado |

La comparativa se limita a la base oficial y a una alternativa medica open source conocida; no se dispone de datos de rendimiento del modelo evaluado para contrastar calidad.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no hay informacion sobre datos de entrenamiento, metodo de ajuste, hiperparametros ni evaluacion, lo que impide auditar sesgos o calidad.
- Licencia no declarada: no se puede asumir uso comercial; ademas, al derivar presumiblemente de Llama 3, hereda las restricciones de la Llama 3 Community License (incluida la clausula de nombre "Llama" y el limite de 700 millones de usuarios mensuales).
- Riesgo elevado de alucinacion en dominio medico: sin evaluacion publicada, no hay evidencia de que el ajuste reduzca la fabricacion de dosis, diagnosticos o referencias bibliograficas.
- Sesgos desconocidos: al no documentarse la composicion del dataset, no se pueden identificar sesgos demograficos, geograficos o de idioma.
- Contexto e idiomas no confirmados: se desconoce si el ajuste preservo la ventana de 8K de Llama 3 o si degradó el multilingue.
- Sin variantes cuantizadas oficiales: el usuario debe convertir los pesos a GGUF, AWQ o GPTQ por su cuenta, con el riesgo de degradacion que ello conlleva.
- Cero traccion en la comunidad (0 descargas, 0 likes): no hay senales de validacion externa ni issues resueltos.
- No apto para uso clinico real: cualquier aplicacion en sanidad exige validacion regulatoria (MDR, FDA) y supervision profesional, ausentes en este artefacto.
- Fecha de creacion futura en los metadatos (2026-11-18): inconsistencia que sugiere un repositorio generado automaticamente o con fechas manipuladas, lo que resta fiabilidad a los metadatos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hwaking/llama3-8b-mixed-med
- Llama Factory (framework de ajuste): https://github.com/hiyouga/LLaMA-Factory
- Paper de Llama 3 (Meta): https://arxiv.org/abs/2407.21783
- Modelo base presumible (Meta Llama 3 8B): https://huggingface.co/meta-llama/Meta-Llama-3-8B
- Calculadora de impacto de carbono citada en la model card: https://mlco2.github.io/impact
- Paper de Lacoste et al. (2019) citado en la model card: https://arxiv.org/abs/1910.09700
