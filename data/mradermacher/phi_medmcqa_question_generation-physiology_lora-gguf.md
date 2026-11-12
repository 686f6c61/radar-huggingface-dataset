# mradermacher/Phi_medmcqa_question_generation-physiology_lora-GGUF

## Resumen

Phi_medmcqa_question_generation-physiology_lora-GGUF es la version cuantizada en formato GGUF del modelo `emilykang/Phi_medmcqa_question_generation-physiology_lora`, un ajuste fino mediante LoRA (SFT con TRL) sobre un modelo de la familia Phi orientado a la generacion de preguntas de opcion multiple de fisiologia medica a partir del dataset MedMCQA. El trabajo de cuantizacion lo firma mradermacher, un conocido empaquetador de modelos en GGUF dentro de la comunidad de Hugging Face, que publica variantes estaticas (Q2_K a f16) y versiones con imatrix en un repositorio separado.

El modelo cuenta con 2.779.683.840 parametros (aproximadamente 2,78 mil millones), lo que lo situa en la gama de modelos pequenos optimizados para ejecucion local. Su proposito es muy especifico: generar enunciados de preguntas tipo test con sus opciones y respuesta correcta en el dominio de la fisiologia, lo que lo hace util para aumento de datos, generacion de bancos de preguntas o experimentos educativos, pero no como un asistente generalista.

La relevancia de esta ficha radica en que se trata de un artefacto muy nicho: una LoRA sobre un Phi pequeno, cuantizada para consumo en hardware modesto. No hay informacion publicada sobre benchmarks, contexto, composicion del dataset ni detalles del entrenamiento mas alla de las etiquetas del repositorio, por lo que la evaluacion debe hacerse con cautela y asumiendo los limites del modelo base subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Phi; variante concreta no especificada) |
| Parametros totales | 2.779.683.840 (~2,78 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en safetensors en el repo base |
| Tamano del repo | 25,0 GB |
| Datasets de entrenamiento | `generator` (segun model card) |
| Metodo de ajuste | SFT con TRL sobre LoRA |
| Modelo base | emilykang/Phi_medmcqa_question_generation-physiology_lora |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por LoRA sobre un modelo de la familia Phi, una arquitectura transformer decoder-only. La model card indica que el entrenamiento se realizo con TRL mediante SFT (supervised fine-tuning) y que el dataset utilizado se etiqueta como `generator`. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO. Tampoco se detalla la variante concreta de Phi (Phi-1, Phi-2, Phi-3, etc.) mas alla del nombre del repositorio y del recuento de parametros (2,78 mil millones), que es coherente con la familia Phi-2.

La innovacion tecnica aqui no reside en la arquitectura, sino en el pipeline de cuantizacion: mradermacher genera cuantizaciones estaticas (Q2_K a f16) y, por separado, cuantizaciones ponderadas con imatrix en el repositorio `-i1-GGUF`. Las cuantizaciones IQ (como IQ4_XS) suelen ofrecer mejor relacion calidad/tamano que las K-quants equivalentes en tamano, segun las notas del propio autor. No se documentan tecnicas como decodificacion especulativa, atencion lineal ni modos de razonamiento extendido.

## Capacidades

- Generacion de preguntas de opcion multiple en el dominio de la fisiologia medica, presumiblemente con enunciado, opciones y respuesta correcta.
- Generacion de texto en ingles; el modelo esta etiquetado exclusivamente para ese idioma.
- Ajuste especifico sobre el dataset MedMCQA, orientado a tareas de tipo test medico.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling ni agentes multi-paso.
- No hay evidencia de capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).
- Capacidades multilingues: no disponibles; solo se declara ingles.
- El modelo base Phi subyacente aporta capacidades generales de lenguaje, pero el ajuste fino esta fuertemente especializado y puede degradar el comportamiento generalista.

## Casos de uso

- Aumento de datos para bancos de preguntas de fisiologia: generar variantes de items tipo test a partir de plantillas o temas, utiles para ampliar datasets de entrenamiento de modelos medicos o para plataformas de simulacros de examen.
- Generacion de material de estudio para asignaturas de fisiologia: producir preguntas con distractores plausibles que un docente pueda revisar y curar antes de publicar.
- Investigacion en generacion de preguntas (question generation): usar el modelo como baseline especializado en un dominio acotado para comparar con modelos generalistas en tareas de QG medico.
- Prototipado local en hardware modesto: al ser un GGUF de ~1,2-3,1 GB segun cuantizacion, permite experimentar en portatiles sin GPU dedicada mediante llama.cpp u Ollama.
- Evaluacion de calidad de LoRAs medicas: servir como referencia para estudiar como se comporta una LoRA de dominio tras cuantizacion agresiva (Q2_K, Q3_K) frente a f16.
- Pipelines de generacion offline en entornos con requisitos de privacidad: al ejecutarse localmente y con licencia MIT, puede integrarse en flujos donde no se permite enviar datos a APIs externas, siempre que el dominio sea fisiologia y el idioma ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB con Q2_K, 1,7-1,8 GB con Q4_K_S/Q4_K_M, 2,4 GB con Q6_K, 3,1 GB con Q8_0 y 5,7 GB con f16 (mas overhead de contexto y del runtime).
- GPU recomendadas: cualquier GPU consumer con 4-8 GB de VRAM es suficiente para cuantizaciones Q4-Q8; para f16 se recomienda al menos 8 GB. En entornos de servidor, A100 o H100 no son necesarias dado el tamano, pero pueden usarse para despliegues de alta concurrencia.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB) e incluso en iGPU con memoria compartida para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que habria que usar los pesos safetensors del repo base para esos runtimes.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Phi_medmcqa_question_generation-physiology_lora-GGUF (este) | ~2,78 B | no disponible | MIT | GGUF | Especializado en generacion de preguntas de fisiologia (MedMCQA); sin benchmarks publicados |
| emilykang/Phi_medmcqa_question_generation-physiology_lora | ~2,78 B | no disponible | no disponible | safetensors | Modelo base del que deriva esta cuantizacion; mismas capacidades sin cuantizar |
| Phi-2 (Microsoft) | 2,7 B | 2.048 tokens | MIT | safetensors, GGUF | Modelo generalista de la misma familia y tamano; no especializado en dominio medico |
| Modelos medicos pequenos tipo BioMistral o Meditron | 7 B | variable | variable | safetensors, GGUF | Mayores y mas generalistas en dominio medico; no comparables directamente por tamano |

La comparacion con Phi-2 es la mas directa por tamano y licencia, pero este modelo esta fuertemente especializado y no se han publicado metricas que permitan afirmar superioridad en tareas generales. Frente a modelos medicos de 7B, la diferencia de parametros y de datos de entrenamiento hace que la comparacion no sea homogenea.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre MedMCQA y solo en ingles, hereda los sesgos del dataset y del modelo base Phi.
- Riesgo de alucinacion: alto en un modelo pequeno y especializado; las preguntas generadas pueden contener errores factuales o distractores incoherentes, por lo que requieren revision humana antes de su uso.
- Limitaciones de contexto e idioma: solo se declara ingles; la longitud de contexto no esta disponible y probablemente sea la del modelo base Phi subyacente, no ampliada.
- Restricciones de licencia: licencia MIT, lo que permite uso comercial y modificacion, pero conviene verificar la licencia del modelo base y del dataset MedMCQA por separado.
- Caveat de produccion: no hay benchmarks, evaluaciones ni documentacion de calidad; no se recomienda su uso en produccion sin una evaluacion propia. El tag `generated_from_trainer` y la ausencia de pipeline declarado indican un artefacto de investigacion mas que un modelo listo para servicio.
- Las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la calidad; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M para uso rapido.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Phi_medmcqa_question_generation-physiology_lora-GGUF
- Repositorio con cuantizaciones imatrix: https://huggingface.co/mradermacher/Phi_medmcqa_question_generation-physiology_lora-i1-GGUF
- Modelo base: https://huggingface.co/emilykang/Phi_medmcqa_question_generation-physiology_lora
- Pagina de descargas del autor: https://hf.tst.eu/model#Phi_medmcqa_question_generation-physiology_lora-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
