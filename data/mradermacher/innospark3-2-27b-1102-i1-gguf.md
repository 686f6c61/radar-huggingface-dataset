# mradermacher/InnoSpark3.2-27B-1102-i1-GGUF

## Resumen

InnoSpark3.2-27B-1102-i1-GGUF es una cuantizacion en formato GGUF del modelo InnoSpark3.2-27B-1102, publicado originalmente por sii-research. El trabajo de conversion y cuantizacion lo ha realizado mradermacher, un perfil habitual en el ecosistema de cuantizaciones GGUF para llama.cpp, empleando el metodo "i1" con pesos ponderados mediante matriz de importancia (imatrix). El modelo base cuenta con 27.320.697.856 parametros, lo que lo situa en la franja de 27B, un tamano que permite despliegue en GPU de gama alta y, con cuantizaciones agresivas, en hardware de consumo.

La relevancia de esta publicacion es practica: ofrece el modelo en un abanico amplio de niveles de cuantizacion (desde IQ1_S hasta Q6_K), lo que permite ajustar el equilibrio entre calidad y requisitos de memoria. El repositorio ocupa 10,9 GB, coherente con un conjunto de cuantizaciones de un modelo de 27B en lugar de un unico archivo. La model card del autor de la cuantizacion es minima y no aporta informacion sobre arquitectura, datos de entrenamiento ni evaluaciones.

No se dispone de informacion publica en la documentacion proporcionada sobre la licencia, los idiomas soportados, la longitud de contexto ni los resultados de benchmarks del modelo base. Esta ficha recoge unicamente los datos verificables disponibles y marca explicitamente como "no disponible" todo aquello que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base InnoSpark3.2-27B-1102 de sii-research; no se detalla transformer, MoE ni hibrida) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones derivadas del modelo base en safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base InnoSpark3.2-27B-1102 en la documentacion proporcionada. El recuento de parametros (27.320.697.856) corresponde a un modelo denso de aproximadamente 27B, pero no consta si emplea atencion estandar, atencion lineal, mezcla de expertos u otra variante. Tampoco se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO o similar.

Lo unico documentado tecnicamente es el proceso de cuantizacion: mradermacher ha generado las cuantizaciones con el metodo i1, que utiliza una matriz de importancia (imatrix) para ponderar los tensores durante la cuantizacion y reducir la perdida de calidad en niveles bajos de bits. La model card indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma que la conversion parte de pesos en formato Hugging Face y que se aplica cuantizacion a los tensores de salida. El tag `nicoboss` aparece en la metadata, sin mas contexto sobre su significado.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` de Hugging Face sugiere uso en dialogos multi-turno, aunque no se detallan capacidades especificas.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el modelo puede servirse a traves de infraestructura compatible con la API de inferencia de Hugging Face.
- Razonamiento, codigo, matematicas, vision, audio, tool calling y modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo: gracias a las cuantizaciones Q4_K_M e IQ4_XS, el modelo puede ejecutarse en GPUs de consumo con 24 GB de VRAM (RTX 3090, 4090) mediante llama.cpp u Ollama, permitiendo prototipado sin depender de la nube.
- Servicio conversacional autoalojado: la etiqueta `conversational` y la compatibilidad con endpoints permiten montar un chatbot interno sobre vLLM o TGI (si el soporte GGUF esta disponible en la version desplegada) o sobre llama.cpp con servidor OpenAI-compatible.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye mas de veinte variantes, lo que facilita experimentar con la relacion calidad/memoria antes de fijar una version para produccion.
- Investigacion sobre cuantizacion: util para estudiar el impacto de imatrix e i1 en un modelo de 27B comparando IQ2/IQ3 frente a Q4/Q5 sobre el mismo checkpoint base.
- Procesamiento por lotes en CPU: las variantes Q2_K e IQ2 permiten ejecucion en CPU con RAM abundante, adecuadas para tareas de generacion offline no interactivas.
- Fine-tuning ligero o destilacion: el modelo base en safetensors (referenciado en la model card) sirve como punto de partida, mientras que las cuantizaciones GGUF se usan como referencia de inferencia para validar el comportamiento tras el ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el tamano del modelo de 27B y el numero de bits por peso):
  - IQ1_S / IQ1_M: en torno a 6-8 GB.
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M / Q2_K: en torno a 9-11 GB.
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M / Q3_K_S / Q3_K_M / Q3_K_L: en torno a 12-14 GB.
  - Q4_0 / Q4_1 / Q4_K_S / Q4_K_M / IQ4_XS: en torno a 15-17 GB.
  - Q5_K_S / Q5_K_M: en torno a 18-20 GB.
  - Q6_K: en torno a 22-24 GB.
  - Estos valores son estimaciones a partir del recuento de parametros; no constan mediciones publicadas por el autor.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para cuantizaciones Q4 y Q5; A100 40/80 GB y H100 para Q6_K o para servir varias instancias en paralelo.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones hasta Q6_K ajustando el contexto; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) con IQ3/IQ4 y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con la API de OpenAI sobre llama.cpp. El soporte de GGUF en vLLM y TGI depende de la version y no esta confirmado para este modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| InnoSpark3.2-27B-1102-i1-GGUF (este) | 27,3B | no disponible | no disponible | GGUF (multiples cuantizaciones) | Cuantizaciones imatrix de mradermacher |
| Modelo base sii-research/InnoSpark3.2-27B-1102 | 27,3B | no disponible | no disponible | safetensors | Origen de la cuantizacion |
| Alternativas de ~27B open source | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- La model card del autor de la cuantizacion es minima: no documenta sesgos, idiomas, contexto ni evaluaciones, por lo que cualquier uso en produccion requiere validacion propia.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay evaluaciones publicadas que lo cuantifiquen para este checkpoint.
- Las cuantizaciones de muy baja precision (IQ1_S, IQ1_M, IQ2_XXS) degradan de forma notable la calidad; no se recomiendan para tareas de razonamiento o codigo.
- Licencia no disponible: no puede confirmarse el uso comercial sin consultar el repositorio del modelo base (sii-research/InnoSpark3.2-27B-1102) y su licencia original.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria.
- La fecha de creacion indicada (2026-11-05) es posterior a la fecha habitual de publicaciones; conviene verificar la integridad y procedencia del repositorio antes de desplegarlo.
- No consta soporte verificado en vLLM ni TGI para estos archivos GGUF; el despliegue mas seguro es llama.cpp u Ollama.

## Enlaces

- Repositorio Hugging Face de la cuantizacion: https://huggingface.co/mradermacher/InnoSpark3.2-27B-1102-i1-GGUF
- Modelo base: https://huggingface.co/sii-research/InnoSpark3.2-27B-1102
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
- llama.cpp (runtime recomendado para GGUF): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
