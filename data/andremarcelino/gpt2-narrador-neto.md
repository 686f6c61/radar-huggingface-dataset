# andremarcelino/gpt2-narrador-neto

## Resumen

GPT-2 PT — Narrador no estilo do Craque Neto es un ajuste fino (fine-tuning) del modelo `pierreguillou/gpt2-small-portuguese`, publicado por el usuario andremarcelino en Hugging Face. Se trata de un modelo de generacion de texto en portugues entrenado para imitar el estilo narrativo y el registro coloquial de un conocido comentarista deportivo brasileno, a partir de transcripciones automaticas (Whisper) de videos publicos. El modelo se presenta explicitamente como una parodia academica desarrollada para un trabajo final de procesamiento de lenguaje natural en la FECAF.

Arquitectonicamente es un transformer decoder-only de tipo GPT-2 en su variante "small", con 124.439.808 parametros totales, lo que lo situa en la gama ligera y apta para inferencia en hardware de consumo. El repositorio ocupa aproximadamente 0,5 GB y distribuye los pesos en formato safetensors. El prompt sigue un formato fijo de dos lineas (`Lance: <descripcion del lance>` seguido de `Neto:`), lo que condiciona fuertemente su uso previsto.

Su relevancia es limitada fuera del ambito del trabajo academico que lo origino: no registra descargas ni interacciones en el momento de la consulta, no publica resultados de benchmarks estandar y su dominio de especializacion es muy estrecho (narracion de jugadas de futbol en portugues). Resulta util como ejemplo de fine-tuning de bajo coste sobre un modelo pequeno en portugues y como caso de estudio de adaptacion estilistica, pero no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 small) |
| Parametros totales | 124.439.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de GPT-2 small; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Portugues (pt) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `pierreguillou/gpt2-small-portuguese`, un GPT-2 small adaptado al portugues, y aplica un fine-tuning supervisado sobre transcripciones generadas con Whisper a partir de videos publicos. La model card no detalla el volumen de tokens de entrenamiento, la composicion exacta del corpus, la configuracion de hiperparametros ni si se aplicaron tecnicas de alineacion como RLHF o DPO. No se menciona ninguna innovacion arquitectonica: se mantiene la arquitectura transformer decoder-only original con atencion causal estandar.

El unico dato cuantitativo de entrenamiento publicado es la perplejidad en el conjunto de test, que pasa de 146,1 en el modelo base a 95,5 en el modelo ajustado. Esta reduccion confirma que el fine-tuning adapta eficazmente la distribucion del modelo al dominio y al estilo objetivo, aunque no se aportan metricas adicionales (precision, BLEU, evaluacion humana) que permitan valorar la calidad de la generacion mas alla de la perplejidad.

## Capacidades

- Generacion de texto en portugues con estilo narrativo y coloquial propio de un comentarista deportivo.
- Continuacion de texto a partir de un prompt con formato especifico: `Lance: <descripcion del lance>` seguido de `Neto:`.
- Narracion y comentario de jugadas de futbol a partir de una descripcion textual breve.
- Adaptacion estilistica (tono, registro, muletillas) al personaje parodiado.
- Generacion autoregresiva estandar de GPT-2; no se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al portugues; no se declaran otros idiomas.
- No se documentan modos especiales (thinking mode, vision, audio).

## Casos de uso

- Generacion de parodias deportivas: el modelo produce comentarios estilo "Neto" a partir de una descripcion de jugada, util para contenido humoristico o divulgativo en portugues.
- Prototipado rapido de fine-tuning en portugues: sirve como ejemplo reproducible de adaptacion de un GPT-2 small a un dominio concreto con recursos limitados.
- Docencia y trabajos academicos de NLP: ilustra el flujo completo de transcripcion con Whisper, curacion de corpus y fine-tuning supervisado, con una metrica de perplejidad documentada.
- Generacion de texto sintetico de dominio estrecho: puede emplearse para aumentar datos de estilo coloquial deportivo en experimentos controlados.
- Demostraciones interactivas de bajo coste: su tamano (124 M de parametros, repo de 0,5 GB) permite desplegarlo en portatiles o entornos sin GPU dedicada para demos educativas.
- Experimentos de evaluacion estilistica: comparar la perplejidad y la salida del modelo base frente al ajustado permite estudiar el efecto del fine-tuning en la distribucion del lenguaje.
- Base para posteriores ajustes: al estar bajo licencia MIT y en safetensors, puede reutilizarse como punto de partida para otros estilos o dominios en portugues.

## Benchmarks y rendimiento

| Metrica | Modelo base | Modelo ajustado |
|---|---|---|
| Perplejidad (test) | 146,1 | 95,5 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB solo para pesos; en fp16 alrededor de 0,25 GB.
- Cabe holgadamente en cualquier GPU de consumo (GTX 1060, RTX 2060, RTX 3060, RTX 4090) e incluso en CPU para inferencia interactiva.
- GPU recomendadas: no se requieren GPU de datacenter (A100, H100); cualquier GPU consumer con al menos 2 GB de VRAM es suficiente.
- Opciones de despliegue: transformers de Hugging Face con PyTorch; llama.cpp u Ollama requeririan conversion previa a GGUF, no documentada por el autor; vLLM y TGI son compatibles en teoria con la arquitectura GPT-2, aunque no se aportan configuraciones verificadas.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| gpt2-narrador-neto (este modelo) | 124,4 M | no disponible | pt | MIT | Fine-tuning estilistico de dominio muy estrecho |
| pierreguillou/gpt2-small-portuguese | no disponible | no disponible | pt | no disponible | Modelo base del que deriva; proposito general en portugues |
| GPT-2 small original (OpenAI) | 124 M | 1024 tokens | en | MIT | Referencia arquitectonica; sin adaptacion al portugues |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio extremadamente estrecho: el modelo esta especializado en narracion deportiva con un estilo concreto y no es adecuado como modelo de proposito general.
- Riesgo elevado de alucinacion: al ser un GPT-2 small ajustado sobre un corpus reducido, puede generar afirmaciones factualmente incorrectas o incoherentes fuera del formato de prompt previsto.
- Dependencia del formato de prompt: el rendimiento decae si no se respeta la plantilla `Lance: ...\nNeto:`.
- Sesgos: el corpus proviene de transcripciones de videos publicos de un unico estilo y posiblemente de una unica voz, lo que puede introducir sesgos de registro, genero y perspectiva no evaluados.
- Limitaciones de idioma: solo se declara portugues; no hay evidencia de calidad en otros idiomas.
- Limitaciones de contexto: la longitud de contexto no se documenta y, al derivar de GPT-2 small, es previsiblemente corta (tipicamente 1024 tokens), lo que restringe conversaciones largas.
- Licencia MIT: permite uso comercial, pero la model card declara que se trata de una parodia academica sin fines comerciales y sin vinculo con la persona parodiada; el uso comercial del estilo o de la imagen del personaje puede tener implicaciones legales ajenas a la licencia del software.
- Sin mantenimiento ni comunidad: cero descargas y cero likes en el momento de la consulta; no hay garantias de soporte, actualizaciones ni correccion de errores.
- Ausencia de evaluacion cualitativa: no se publican evaluaciones humanas ni metricas mas alla de la perplejidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andremarcelino/gpt2-narrador-neto
- Modelo base: https://huggingface.co/pierreguillou/gpt2-small-portuguese
- Repositorio de referencia de GPT-2 (OpenAI): https://github.com/openai/gpt-2
- Whisper (OpenAI), herramienta de transcripcion citada: https://github.com/openai/whisper
