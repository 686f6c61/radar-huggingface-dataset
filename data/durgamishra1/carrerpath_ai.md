# Durgamishra1/Carrerpath_AI

## Resumen

Carrerpath_AI (identificador `Durgamishra1/Carrerpath_AI`, nombre interno `careerpath-qwen3-8b`) es un adaptador LoRA entrenado mediante SFT sobre el modelo base Qwen/Qwen3-8B. Lo publica el usuario Durgamishra1 en Hugging Face y se distribuye exclusivamente como pesos de adaptador PEFT en formato safetensors, no como modelo completo. El pipeline declarado es `text-generation` y el entrenamiento se realizó con la librería TRL (versión 1.13.0) bajo el framework PEFT 0.21.0.

El propósito declarado se deduce únicamente del nombre del repositorio: orientación profesional o de carrera. La model card no documenta el conjunto de datos de entrenamiento, el número de tokens, la composición del dataset ni el proceso de alineación más allá de indicar que se usó SFT. Tampoco se especifican licencia, idiomas soportados ni resultados de evaluación.

Su relevancia actual es limitada desde el punto de vista técnico: es un adaptador sin descargas ni interacciones registradas en el momento de la consulta, con un repositorio de 0,0 GB y sin información reproducible sobre su entrenamiento. Cualquier evaluación seria exige cargarlo junto al modelo base Qwen3-8B y validarlo en el dominio concreto de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el transformer decoder denso de Qwen/Qwen3-8B; detalles de configuracion del adaptador no disponibles |
| Parametros totales | No disponible para el adaptador (el repo ocupa 0,0 GB segun Hugging Face); el modelo base Qwen3-8B tiene 8,2 mil millones de parametros |
| Parametros activos | No aplica: el modelo base no es MoE |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen3-8B declara 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | No disponible: no se publican versiones GGUF, AWQ, GPTQ ni cuantizaciones del adaptador |
| Idiomas soportados | No disponible |
| Licencia | No disponible: el campo de licencia de la model card aparece como `licence: license`, sin valor valido. El modelo base Qwen3-8B se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (pesos de adaptador PEFT/LoRA) |
| Libreria declarada | peft |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3-8B |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion / actualizacion | 16 de septiembre de 2026 (creacion y actualizacion el mismo dia) |

## Arquitectura y entrenamiento

El objeto publicado es un adaptador LoRA, no un modelo completo. Esto implica que la arquitectura efectiva en inferencia es la de Qwen3-8B: un transformer decoder denso de aproximadamente 8,2 mil millones de parametros, con atencion por causalidad, normalizacion RMSNorm y tokenizador BPE multilingue. El adaptador anade matrices de bajo rango sobre determinadas capas, pero la model card no especifica rango, alpha, dropout, modulos objetivo ni el numero de parametros entrenables, por lo que no es posible reproducir el ajuste ni estimar su coste.

Respecto al entrenamiento, la unica informacion disponible es que se uso SFT (supervised fine-tuning) con TRL 1.13.0, PEFT 0.21.0, Transformers 5.17.0, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.23.1. No se documentan el volumen de tokens, la composicion del dataset, la posible mezcla con datos generales para mitigar el olvido catastrofico, el numero de epochs, la tasa de aprendizaje ni si hubo etapas posteriores de DPO, RLHF o RLVR. Tampoco se declara ninguna innovacion tecnica propia mas alla del uso de las herramientas estandar del ecosistema Hugging Face.

## Capacidades

- Generacion de texto conversacional en formato de chat, heredada del modelo base Qwen3-8B.
- Razonamiento y matematicas basicas, en principio procedentes del modelo base, aunque no hay evaluacion que lo confirme tras el ajuste LoRA.
- Generacion de codigo, presumiblemente heredada del modelo base; no verificada en este adaptador.
- Soporte de tool calling y function calling: el modelo base Qwen3-8B lo soporta, pero la model card no confirma que el ajuste lo preserve.
- Soporte de modo pensamiento (thinking mode) del modelo base: no confirmado en el adaptador.
- Capacidades multilingues: no disponibles; la model card no declara idiomas y el ajuste SFT puede haber reducido el rendimiento en idiomas no presentes en el dataset de entrenamiento.
- Especializacion tematica en orientacion profesional o de carrera: inferida unicamente del nombre del repositorio (`careerpath-qwen3-8b`, `Carrerpath_AI`), sin documentacion que la respalde.

## Casos de uso

- Prototipado de asistentes de orientacion profesional: el adaptador puede cargarse sobre Qwen3-8B con PEFT para experimentar con respuestas sobre trayectorias laborales, siempre que se valide primero la calidad real de las respuestas con un conjunto de prueba propio.
- Chatbot de orientacion academica en portales universitarios: permitiria responder consultas sobre eleccion de estudios y salidas profesionales, aunque al no documentarse el dataset no se puede garantizar la ausencia de sesgos de género, clase o nacionalidad en las recomendaciones.
- Generacion de borradores de planes de carrera: el modelo puede producir esquemas de formacion, hitos y competencias que un orientador humano revise y adapte despues.
- Base para ajuste adicional especifico de dominio: al ser un adaptador LoRA, resulta barato continuar el entrenamiento con datos propios de un sector concreto (sanidad, tecnologia, industria) sin reentrenar los 8,2 mil millones de parametros.
- Experimentacion academica sobre SFT con TRL: sirve como ejemplo reproducible del flujo PEFT + TRL, aunque la falta de hiperparametros en la model card limita su valor como referencia metodologica.
- Evaluacion comparativa de adaptadores de bajo rango: util en estudios que midan la degradacion de capacidades generales tras un SFT tematico.
- Cualquier uso en produccion con usuarios reales queda desaconsejado en el estado actual por la ausencia de licencia, idiomas declarados, evaluacion y trazabilidad del dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, ni para el adaptador ni para el modelo base. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo: los enlaces recuperados corresponden a foros de inversion, hardware y caza, sin conexion con este repositorio.

## Requisitos de hardware

- Al ser un adaptador LoRA, la inferencia requiere cargar el modelo base Qwen3-8B completo y fusionar o aplicar el adaptador. El coste de VRAM es, por tanto, el de un modelo de 8,2 mil millones de parametros.
- VRAM estimada para el modelo base en precision fp16/bf16: en torno a 16-17 GB solo para pesos, mas el espacio de activaciones y cache KV (dependiente del contexto y del tamano de lote).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 9-10 GB. En cuantizacion de 4 bits: aproximadamente 5-6 GB. Estas cifras son estimaciones estandar para un modelo denso de 8B, no datos publicados por el autor.
- GPU profesionales: A100 40/80 GB, H100, L40S y A6000 permiten inferencia en fp16 sin dificultad y con margen para contextos largos.
- GPU de consumo: una RTX 4090 o 3090 de 24 GB puede ejecutar el modelo en fp16 con contextos moderados; tarjetas de 12 GB (RTX 3060 12 GB, 4070) solo son viables con cuantizacion de 4 bits.
- Opciones de despliegue: vLLM y TGI admiten modelos PEFT mediante adaptadores dinamicos; llama.cpp y Ollama requieren convertir el adaptador y fusionarlo con el modelo base en formato GGUF; Transformers + PEFT es la via mas directa y la unica documentada implicitamente por la libreria declarada.
- Latencia y throughput: no disponibles. No hay ninguna medicion publicada ni configuracion de referencia declarada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Carrerpath_AI (este modelo) | Adaptador LoRA sobre 8,2B | No disponible | Adaptador PEFT + SFT | No disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-8B | 8,2B | 32.768 tokens (131.072 con YaRN) | Modelo completo, denso | Apache 2.0 | Hugging Face, ampliamente utilizado |
| Llama-3.1-8B-Instruct | 8B | 128.000 tokens | Modelo completo, denso | Licencia comunitaria de Meta con restricciones | Hugging Face |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32.000 tokens | Modelo completo, denso | Apache 2.0 | Hugging Face |

La comparacion relevante es contra el propio modelo base: sin benchmarks publicados no hay evidencia de que el ajuste SFT aporte mejoras en el dominio de orientacion profesional, ni de cuanto rendimiento general se ha sacrificado. El resto de alternativas se incluyen como referencia de categoria (modelos densos de 7-8B con licencia permisiva), no como comparacion de resultados.

## Limitaciones y advertencias

- No hay informacion sobre el dataset de SFT, por lo que no se puede auditar que sesgos contiene ni como se comportara ante perfiles diversos.
- Riesgo de alucinacion elevado en un dominio como el de orientacion profesional, donde el modelo puede inventar titulaciones, salarios, requisitos legales o salidas laborales con apariencia de verosimilitud.
- Ausencia de licencia declarada: el campo `licence: license` de la model card no tiene valor valido. Sin una licencia explicita no se puede asumir permiso de uso comercial, y el uso en produccion es juridicamente arriesgado.
- Idiomas soportados no declarados. Un ajuste SFT sobre datos no documentados puede haber degradado el rendimiento multilingue del modelo base.
- Contexto efectivo no confirmado para el adaptador; conviene validar el comportamiento en contextos largos antes de confiar en la ventana nominal del modelo base.
- No se documentan hiperparametros de entrenamiento (rango LoRA, alpha, epochs, learning rate), lo que impide reproducir el ajuste o evaluar su robustez.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia: no hay evidencia de uso, validacion por terceros ni mantenimiento posterior.
- Posible olvido catastrofico de capacidades generales (codigo, matematicas, tool calling) tras el SFT, no evaluado.
- Se desaconseja su uso como sistema de asesoramiento real sin supervision humana: una recomendacion de carrera erronea puede tener consecuencias economicas y personales para el usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Durgamishra1/Carrerpath_AI
- Modelo base Qwen/Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio de TRL, framework de entrenamiento citado: https://github.com/huggingface/trl
- No se han encontrado en la busqueda web enlaces relevantes al modelo: los resultados devueltos correspondian a foros sin relacion (HotCopper, [H]ard|Forum, WILD UND HUND Forum). No hay paper, blog, demo ni repositorio adicional asociado a este adaptador en la informacion disponible.
