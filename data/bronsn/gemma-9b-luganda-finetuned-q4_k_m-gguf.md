# Bronsn/gemma-9b-luganda-finetuned-Q4_K_M-GGUF

## Resumen

`Bronsn/gemma-9b-luganda-finetuned-Q4_K_M-GGUF` es una distribucion en formato GGUF del ajuste fino `Bronsn/gemma-9b-luganda-finetuned`, que a su vez parte de `unsloth/gemma-2-9b-bnb-4bit`, una version cuantizada en 4 bits del modelo Gemma 2 de 9.000 millones de parametros de Google. El autor, Bronsn, publica el resultado como un unico fichero GGUF con cuantizacion Q4_K_M generado mediante el espacio `gguf-my-repo` de ggml.ai, pensado para su uso directo con llama.cpp.

El modelo resuelve un nicho muy concreto: adaptar un LLM generalista de tamano medio al idioma luganda (o lugandes, lengua bantu hablada principalmente en Uganda) mediante un ajuste fino supervisado con PEFT. El resultado es un checkpoint de 9.241.705.984 parametros (dato real de safetensors del modelo base) que conserva la arquitectura transformer decoder-only de Gemma 2 y anade un adaptador LoRA fusionado o aplicado sobre la base cuantizada.

La relevancia es limitada pero clara: cubre una lengua de bajos recursos para la que existen pocos modelos abiertos, y lo hace en un formato que cabe en GPUs de consumo. No obstante, el repositorio carece de documentacion tecnica propia (la model card es la plantilla automatica de `gguf-my-repo`), no declara idiomas soportados ni publica evaluaciones, por lo que debe tratarse como un artefacto experimental mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), ajuste fino con PEFT/LoRA sobre base cuantizada en 4 bits |
| Parametros totales | 9.241.705.984 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en el repositorio (Gemma 2 soporta hasta 8.192 tokens; el ejemplo de llama-server usa `-c 2048`) |
| Tipos de cuantizacion | Q4_K_M (unica publicada en este repo) |
| Idiomas soportados | no disponibles de forma explicita; el ajuste fino esta orientado a luganda |
| Licencia | Gemma (terminos de uso de Google) |
| Formato de pesos | GGUF (`gemma-9b-luganda-finetuned-q4_k_m.gguf`); el repo pesa 5,8 GB |
| Libreria declarada | peft |
| Modelo base | unsloth/gemma-2-9b-bnb-4bit |
| Fecha de creacion | 2025-01-27 |
| Descargas | 9 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 2 9B: un transformer decoder-only con atencion por ventanas alternada (local/global), normalizacion RMSNorm pre y post atencion, y activaciones GeGLU. Gemma 2 introduce ademas "soft-capping" en la atencion y en la salida del logit para estabilizar el entrenamiento, y utiliza group query attention (GQA). El checkpoint de partida es la version de Unsloth cuantizada en 4 bits (`bnb-4bit`), sobre la que se aplico un ajuste fino con PEFT (LoRA) para adaptar el modelo al luganda; posteriormente el resultado se convirtio a GGUF Q4_K_M con llama.cpp.

No hay informacion publicada en el repositorio sobre el volumen de tokens de entrenamiento, la composicion del dataset, si se aplico RLHF/DPO o tecnicas de alineacion adicionales, ni sobre hiperparametros del ajuste LoRA (rango, alpha, modulos objetivo). La model card se limita a la plantilla generada automaticamente por `gguf-my-repo`, que remite a la model card del modelo original (`Bronsn/gemma-9b-luganda-finetuned`) para mas detalles; esa informacion no esta incluida en los datos proporcionados. Tampoco se documenta ninguna innovacion tecnica adicional mas alla del ajuste PEFT y la conversion a GGUF.

## Capacidades

- Generacion de texto autoregresiva en el estilo y las capacidades heredadas de Gemma 2 9B, con especializacion declarada hacia el luganda.
- Razonamiento basico y respuesta a instrucciones, condicionado por la calidad del ajuste fino (no evaluada).
- Capacidad multilingue heredada del modelo base, aunque el ajuste puede haber desplazado parte del rendimiento hacia el luganda.
- Inferencia local mediante llama.cpp (CLI y servidor HTTP), con compatibilidad con el ecosistema GGUF (Ollama, LM Studio, etc. a traves del mismo formato).
- Soporte de tool calling / function calling: no documentado; no debe asumirse.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de vision, audio o modo "thinking": no disponibles (Gemma 2 9B es solo texto).

## Casos de uso

- Traduccion y generacion de texto en luganda: el modelo puede emplearse para redactar o traducir contenido en esta lengua de bajos recursos, aprovechando el ajuste fino especifico. Es el uso principal para el que fue creado.
- Prototipado de asistentes conversacionales en luganda: con llama-server se puede levantar un endpoint HTTP local para experimentar con dialogos multi-turno antes de invertir en infraestructura mayor.
- Investigacion en NLP de bajos recursos: sirve como punto de partida o linea base para comparar tecnicas de ajuste fino (LoRA, QLoRA) sobre lenguas bantu con pocos datos.
- Educacion y preservacion linguistica: generacion de material didactico o ejercicios en luganda en entornos con hardware modesto, gracias a la cuantizacion Q4_K_M.
- Despliegue en hardware de consumo: al pesar 5,8 GB en Q4_K_M, puede ejecutarse en GPUs de 8 GB o en CPU, lo que permite pruebas offline sin acceso a la nube.
- Filtrado o clasificacion de texto en luganda: tareas de etiquetado o resumen sencillo en pipelines locales, siempre con validacion humana por la ausencia de evaluaciones.
- Base para nuevos ajustes: al estar en formato GGUF y derivar de PEFT, puede servir de referencia para quien quiera reproducir o extender el ajuste a otras lenguas de la region.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5-6,5 GB con Q4_K_M (fichero de 5,8 GB mas overhead de contexto y KV cache).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, A100 o H100 para despliegues con mayor concurrencia; tambien funciona en GPUs de 8 GB con contexto reducido.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060 Ti, RTX 3070, RTX 4060, etc.), y en CPU con RAM suficiente (unos 8 GB libres).
- Opciones de despliegue: llama.cpp (CLI y `llama-server`, documentado en la model card), y por compatibilidad de formato, Ollama, LM Studio o cualquier runtime GGUF. vLLM y TGI no soportan GGUF de forma nativa para este modelo.
- Latencia y throughput estimados: no disponibles; dependeran del hardware, del contexto (`-c 2048` en el ejemplo del autor) y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Bronsn/gemma-9b-luganda-finetuned-Q4_K_M-GGUF | 9,24 B | no disponible (base: 8.192) | luganda (orientativo) | Gemma | GGUF Q4_K_M | Ajuste comunitario, sin evaluaciones |
| google/gemma-2-9b-it | 9,24 B | 8.192 | multilingue | Gemma | safetensors, GGUF | Modelo base oficial, con evaluaciones publicadas |
| unsloth/gemma-2-9b-bnb-4bit | 9,24 B | 8.192 | multilingue | Gemma | safetensors 4-bit | Base cuantizada usada para el ajuste |
| Meta-Llama-3.1-8B-Instruct | 8,03 B | 128.000 | multilingue (8 idiomas oficiales) | Llama 3.1 | safetensors, GGUF | Alternativa generalista con contexto mucho mayor |

La comparativa es limitada porque no existen datos de rendimiento del modelo ajustado. Frente a Gemma 2 9B oficial, la diferencia principal es la especializacion en luganda y el formato GGUF listo para consumo; frente a Llama 3.1 8B, la ventaja es el ajuste linguistico, y la desventaja, el contexto y el soporte oficial.

## Limitaciones y advertencias

- Ausencia total de evaluaciones: no hay benchmarks, ni datos de perplexity, ni comparaciones con lineas base, por lo que el rendimiento real en luganda es desconocido.
- Documentacion minima: la model card es la plantilla automatica de `gguf-my-repo`; no se detallan datos de entrenamiento, hiperparametros ni limitaciones conocidas.
- Riesgo de alucinacion: como cualquier LLM de 9B, puede generar contenido plausible pero incorrecto, especialmente en una lengua con pocos datos de entrenamiento.
- Sesgos: no documentados; el modelo hereda los sesgos del corpus de Gemma 2 y los del dataset de ajuste (no publicado).
- Degradacion potencial del multilingue: el ajuste fino sobre un unico idioma puede reducir el rendimiento en otras lenguas; no se ha medido.
- Contexto: aunque Gemma 2 soporta 8.192 tokens, el ejemplo del autor usa `-c 2048`; conviene validar el comportamiento con contextos largos.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de uso de Gemma de Google, que incluyen restricciones de uso aceptable y obligaciones de atribucion; no es una licencia permisiva tipo Apache o MIT.
- Madurez: 9 descargas y 0 likes en el momento de la consulta; es un artefacto experimental sin senales de adopcion ni mantenimiento.
- Cuantizacion unica: solo se publica Q4_K_M; no hay variantes Q5, Q8 o F16 para quienes necesiten mayor fidelidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Bronsn/gemma-9b-luganda-finetuned-Q4_K_M-GGUF
- Modelo original del ajuste: https://huggingface.co/Bronsn/gemma-9b-luganda-finetuned
- Modelo base cuantizado: https://huggingface.co/unsloth/gemma-2-9b-bnb-4bit
- Espacio de conversion GGUF: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- llama.cpp (repositorio y guia de uso): https://github.com/ggerganov/llama.cpp
- Gemma 2 (Google): https://huggingface.co/google/gemma-2-9b-it
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
