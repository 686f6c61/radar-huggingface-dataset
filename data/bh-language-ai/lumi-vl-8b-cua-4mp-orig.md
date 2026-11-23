# BH-Language-AI/lumi-vl-8b-cua-4mp-orig

## Resumen

Lumi VL 8B CUA 4MP Orig es un adaptador LoRA experimental publicado por BH-Language-AI sobre el modelo base Qwen/Qwen3.5-9B. Su propósito es el entrenamiento de capacidades de *computer use agent* (CUA) y *GUI grounding*: es decir, que el modelo sea capaz de localizar elementos de interfaz en capturas de pantalla de alta resolución (hasta 4 megapíxeles) y operar sobre ellos. El repositorio contiene únicamente los pesos del adaptador en formato PEFT/safetensors, con un tamaño de 0,5 GB, y no incluye pesos completos del modelo base.

La model card, redactada parcialmente en serbio, describe este artefacto como un experimento de la etapa 5 del ciclo de entrenamiento. Según el autor, continuar el entrenamiento desde el checkpoint original de 102k muestras con 600 pasos adicionales a una tasa de aprendizaje de 3e-5 degrada el rendimiento: la métrica cae al 60,0% (240/400 aciertos sobre 400 muestras a 4 MP), frente al 64,5% de ScreenSpot-Pro que alcanza la etapa 2. El autor indica explícitamente que este adaptador no está recomendado para producción y que la versión de referencia es `BH-Language-AI/lumi-vl-8b-cua` en su configuración de 4 MP.

El interés de esta ficha es doble: documenta un caso de olvido catastrófico inducido por sobreentrenamiento en un adaptador LoRA multimodal, y sirve como referencia de trazabilidad de la cadena de etapas del proyecto (base 2,5% → etapa 1 39% → etapa 2 a 2 MP 51,25% → etapa 2 a 4 MP 64,5%). No hay información pública sobre licencia, idiomas soportados ni pipeline de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer multimodal Qwen/Qwen3.5-9B |
| Parametros totales | 9,41 B (modelo base); tamano del adaptador no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262 000 tokens (modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite las cuantizaciones habituales de Qwen, no confirmadas en esta informacion) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base Qwen/Qwen3.5-9B |
| Capas del modelo base | 32 |
| Dimension oculta | 4096 |
| Precision del base | bf16 (~18,8 GB) |
| Tamano del repo | 0,5 GB |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.5-9B es un transformer multimodal (vision + texto) de 9,41 B parametros, 32 capas y dimension oculta de 4096, con una ventana de contexto de 262 000 tokens y pesos en bf16 de aproximadamente 18,8 GB. Sobre esta base, el autor entrena un adaptador LoRA orientado a GUI grounding: dada una captura de pantalla y una instruccion en lenguaje natural, el modelo debe predecir la region o coordenada del elemento objetivo. El adaptador se distribuye como artefacto PEFT independiente, de modo que la inferencia exige descargar y cargar el modelo base por separado.

El entrenamiento sigue un ciclo por etapas documentado por el autor. Tras la base (2,5% de acierto), la etapa 1 alcanza el 39%, la etapa 2 a 2 MP llega al 51,25% y la etapa 2 a 4 MP alcanza el 64,5% en ScreenSpot-Pro. Esta ficha corresponde a la etapa 5: una continuacion desde el checkpoint original de 102k muestras con 600 pasos y una tasa de aprendizaje de 3e-5. El resultado es un descenso hasta el 60,0% (240/400 a 4 MP), que el autor interpreta como olvido del comportamiento aprendido a 4 MP. No se detallan la composicion del dataset, el uso de RLHF/DPO ni innovaciones de decodificacion.

## Capacidades

- GUI grounding sobre capturas de pantalla de hasta 4 MP: localizacion de elementos de interfaz a partir de instrucciones en lenguaje natural.
- Computer use agent (CUA): base para agentes que interpretan pantallas y ejecutan acciones sobre ellas.
- Comprension multimodal de imagen y texto heredada del modelo base Qwen/Qwen3.5-9B.
- Contexto largo de hasta 262 000 tokens en el modelo base, util para historiales de interaccion o capturas multiples.
- Generacion de texto y razonamiento generales del modelo base (no evaluados especificamente en este adaptador).
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Investigacion sobre olvido catastrofico en LoRA: este adaptador sirve como caso controlado para estudiar como una tasa de aprendizaje de 3e-5 durante 600 pasos degrada una habilidad ya adquirida (de 64,5% a 60,0% en ScreenSpot-Pro a 4 MP).
- Reproduccion de la cadena de etapas: permite replicar el ciclo base → etapa 1 → etapa 2 (2 MP y 4 MP) → etapa 5 y comparar checkpoints con la misma metrica de evaluacion.
- Automatizacion de pruebas de interfaz: un agente CUA puede localizar botones y campos en capturas de alta resolucion para generar scripts de test de UI, aunque para produccion el autor recomienda la etapa 2.
- Auditoria de pipelines de entrenamiento multimodal: util para validar tecnicas de congelacion de capas, early stopping o ajuste de learning rate antes de escalar a modelos mayores.
- Docencia y divulgacion: ejemplo real de model card que documenta resultados negativos y trazabilidad de experimentos, poco habitual en el ecosistema.
- Base para experimentos de destilacion o merging de adaptadores: al ser un LoRA de 0,5 GB, es barato de combinar con otros adaptadores del mismo proyecto para analizar interferencia entre tareas.
- Evaluacion comparativa de resoluciones: permite medir el impacto del cambio de 2 MP a 4 MP en tareas de grounding con el mismo modelo base.

## Benchmarks y rendimiento

| Etapa | Resolucion | Metrica | Resultado |
|---|---|---|---|
| Base Qwen/Qwen3.5-9B | no disponible | ScreenSpot-Pro | 2,5% |
| Etapa 1 | no disponible | ScreenSpot-Pro | 39% |
| Etapa 2 | 2 MP | ScreenSpot-Pro | 51,25% |
| Etapa 2 | 4 MP | ScreenSpot-Pro (400 muestras) | 64,5% |
| Etapa 5 (este adaptador) | 4 MP | ScreenSpot-Pro (400 muestras) | 60,0% (240/400) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales para este adaptador.

## Requisitos de hardware

- VRAM estimada: el modelo base en bf16 ocupa aproximadamente 18,8 GB, por lo que la inferencia completa requiere al menos 20-24 GB de VRAM; el adaptador anade 0,5 GB.
- Cuantizacion: con cuantizacion de 8 bits el base se situa en torno a 10-11 GB y en 4 bits alrededor de 6-7 GB, aunque estas cifras son estimaciones y no estan confirmadas en la informacion disponible.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para bf16 sin compromisos; RTX 4090 (24 GB) es suficiente para bf16 ajustado o para cuantizacion de 8 bits.
- GPU de consumo: cabe en RTX 4090 y, con cuantizacion agresiva, en GPUs de 12-16 GB; no cabe en GPUs de 8 GB sin cuantizacion a 4 bits y offloading.
- Opciones de despliegue: vLLM, TGI y transformers con PEFT para el adaptador; llama.cpp y Ollama requeririan conversion del adaptador y del base a GGUF, no documentada en esta informacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lumi VL 8B CUA 4MP Orig (esta ficha) | 9,41 B (base) + LoRA | 262k | GUI grounding / CUA experimental | no disponible | Hugging Face, 0 descargas |
| BH-Language-AI/lumi-vl-8b-cua (etapa 2) | 9,41 B (base) + LoRA | 262k | GUI grounding / CUA de referencia | no disponible | Hugging Face |
| Qwen/Qwen3.5-9B | 9,41 B | 262k | Modelo multimodal generalista | no disponible en esta informacion | Hugging Face |
| Alternativas CUA de proposito general | no disponible | no disponible | Agentes de interfaz | no disponible | no disponible |

La comparacion con otros modelos CUA publicos no puede completarse con los datos proporcionados; se indica como no disponible.

## Limitaciones y advertencias

- Estado experimental: el propio autor desaconseja su uso en produccion y remite a la etapa 2 (`BH-Language-AI/lumi-vl-8b-cua`) a 4 MP.
- Regresion medible: pierde 4,5 puntos porcentuales frente a la etapa 2 en ScreenSpot-Pro a 4 MP (60,0% frente a 64,5%), atribuible a olvido del comportamiento aprendido.
- Licencia no declarada: no se especifica licencia del adaptador ni del modelo base en la informacion disponible, lo que impide evaluar su uso comercial.
- Idiomas no declarados: se desconoce el soporte multilingue real del adaptador.
- Riesgo de alucinacion: no evaluado en la informacion disponible; en tareas de grounding, un fallo se traduce en coordenadas incorrectas que pueden desencadenar acciones erroneas en un agente.
- Dependencia del modelo base: el repositorio solo contiene el adaptador; sin Qwen/Qwen3.5-9B el artefacto es inutilizable.
- Documentacion parcial en serbio y sin datos de composicion del dataset, semillas ni hiperparametros completos, lo que dificulta la reproducibilidad.
- Sin descargas ni validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/BH-Language-AI/lumi-vl-8b-cua-4mp-orig
- Modelo de referencia en produccion (etapa 2): https://huggingface.co/BH-Language-AI/lumi-vl-8b-cua
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Perfil del autor: https://huggingface.co/BH-Language-AI
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
