# samunder12/llama3.1-8b-deimosRP

## Resumen

Llama3.1-8b-deimosRP es un ajuste fino (fine-tune) del modelo Meta Llama 3.1 8B Instruct, publicado por el usuario samunder12 en Hugging Face bajo licencia Apache 2.0. El modelo está orientado a escritura creativa, roleplay y narrativa de tono oscuro, cínico y absurdo, segun declara el autor en su model card. Se distribuye tanto como adaptador LoRA (PEFT) como en formato GGUF cuantizado para inferencia local.

El modelo parte de una cadena de derivaciones poco convencional: aunque la model card declara como base `meta-llama/Llama-3.1-8B-Instruct` (y asi lo registra el campo `base_model` de Hugging Face), el propio autor indica que el ajuste se realizo sobre `Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2`, un fine-tune sin censura de Llama 3.1 8B. El entrenamiento se llevo a cabo con PEFT (LoRA, r=32) y las optimizaciones de Unsloth.

Con 8.030.261.312 parametros y una ventana de contexto heredada de Llama 3.1 (128.000 tokens), el modelo es relevante para desarrolladores que buscan un modelo pequeno, desplegable en hardware de consumo, especializado en generacion creativa con una voz estilistica muy marcada, y no tanto para tareas de razonamiento general o codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), ajuste fino con PEFT/LoRA |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.1 8B; no se especifica en la model card) |
| Tipos de cuantizacion | Q4_K_M y Q5_K_M (GGUF); adaptador LoRA en safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA), GGUF (Q4_K_M, Q5_K_M) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only denso con atencion por causalidad, normalizacion RMSNorm, activacion SwiGLU y RoPE para codificacion posicional, con un contexto maximo de 128.000 tokens. Sobre esta base se aplico un ajuste fino supervisado mediante LoRA con rango 32, utilizando la libreria Unsloth para reducir el consumo de memoria y acelerar el entrenamiento.

El autor no documenta el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card describe el dataset como "escenarios absurdos e imaginativos" curados (desde taxidermia de mapaches sintientes hasta aplicaciones de citas para criptidos), lo que sugiere un corpus pequeno y muy estilizado orientado a roleplay y comedia oscura. No se declara ninguna innovacion arquitectonica adicional; el modelo hereda el chat template oficial de Llama 3.1 Instruct.

## Capacidades

- Generacion de texto creativo en ingles: narrativa, ficcion, comedia oscura y escenarios absurdos.
- Roleplay y encarnacion de personajes con voz estilistica marcada y personalidad cinica.
- Creacion de personajes: biografias, voces y motivaciones con caracter distintivo.
- Generacion de escenas cortas y premisas de alto concepto para relatos, guiones o juegos.
- Escritura de arranques de historia (story starters) para desbloquear el bloqueo del escritor.
- Conversacion multi-turno siguiendo el chat template de Llama 3.1 Instruct.
- Soporte de inferencia local en llama.cpp, LM Studio y Ollama mediante los GGUF incluidos.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Roleplay de mesa y juegos de rol: el modelo puede actuar como master o PNJ con personalidad impredecible y tono oscuro, aprovechando su ajuste especifico en este dominio.
- Generacion de premisas para guiones y videojuegos: sirve para producir ideas de alto concepto ("criptidos en apps de citas") que alimenten sesiones de brainstorming creativo.
- Creacion de personajes para narrativa interactiva: genera biografias y voces coherentes con un tono cinico, utiles en ficcion interactiva o visual novels.
- Arranque de historias para escritores: rompe el bloqueo creativo proponiendo aperturas y escenas en clave de comedia negra o fantasia absurda.
- Prototipado de chatbots de entretenimiento: con un system prompt minimo y el chat template de Llama 3.1, se puede desplegar como personaje conversacional en demos o productos de ocio.
- Generacion de contenido creativo en local: los GGUF Q4_K_M y Q5_K_M permiten ejecutar el modelo en portatiles con GPU de consumo, sin depender de APIs externas.
- Experimentacion con fine-tuning: el adaptador LoRA publicado sirve como punto de partida para ajustes adicionales sobre Llama 3.1 8B con Unsloth.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB con GGUF Q4_K_M; aproximadamente 6-7 GB con Q5_K_M; en torno a 16 GB en FP16/BF16 (8.000 millones de parametros).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para los GGUF; A100 o H100 para despliegue en FP16 con mayor concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM usando Q4_K_M; con 6 GB puede requerir offload parcial a CPU.
- Opciones de despliegue: llama.cpp, LM Studio y Ollama (GGUF); transformers con PEFT para el adaptador LoRA; text-generation-inference figura entre los tags del repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama3.1-8b-deimosRP | 8.030 M | 128.000 (heredado) | Roleplay y escritura creativa oscura | apache-2.0 | Hugging Face (LoRA + GGUF) |
| meta-llama/Llama-3.1-8B-Instruct | 8.030 M | 128.000 | Instrucciones generales | Llama 3.1 Community License | Hugging Face |
| Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2 | 8.030 M | 128.000 | Roleplay sin censura (base declarada del ajuste) | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado: su ajuste esta orientado a creatividad y roleplay; el rendimiento en tareas de razonamiento, matematicas o codigo probablemente se degrade respecto al Llama 3.1 Instruct original, aunque no se aportan datos que lo cuantifiquen.
- Sesgos y tono: entrenado para "dark roleplays" y comedia cinica, puede producir contenido perturbador, estereotipado o inapropiado; requiere moderacion si se expone a usuarios finales.
- Riesgo de alucinacion: como todo modelo generativo de 8.000 millones de parametros, puede inventar hechos, nombres y detalles sin base.
- Idioma: solo declara soporte de ingles; el rendimiento en castellano no esta validado.
- Contexto: aunque la arquitectura base soporta 128.000 tokens, la model card no confirma que el fine-tune preserve ese contexto efectivo.
- Licencia: el repositorio declara apache-2.0, pero al derivar de Llama 3.1 conviene verificar la compatibilidad con la Llama 3.1 Community License y con la licencia del modelo intermedio (Lexi-Uncensored-V2) antes de un uso comercial.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.
- Inconsistencia documental: la model card cita como base Lexi-Uncensored-V2 mientras el campo `base_model` apunta a Llama-3.1-8B-Instruct; conviene verificar la cadena de derivacion antes de reutilizarlo.

## Enlaces

- Hugging Face: https://huggingface.co/samunder12/llama3.1-8b-deimosRP
- Modelo base declarado en Hugging Face: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Modelo base citado en la model card: https://huggingface.co/Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2
- Unsloth (libreria de fine-tuning): https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggml-org/llama.cpp
