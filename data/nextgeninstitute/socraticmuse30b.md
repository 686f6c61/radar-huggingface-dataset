# NextGenInstitute/socraticMuse30B

## Resumen

Socratic Muse-30B es un conjunto de adaptadores LoRA publicados por NextGenInstitute sobre el modelo base Muse Glimmer-30B de Meta (versión cuantizada a 4 bits de unsloth). El objetivo es alinear el modelo para tutoría socrática en educación de inteligencia artificial: en lugar de ofrecer soluciones de código directas cuando un estudiante tiene un error, el modelo debe guiarlo mediante preguntas y pistas conceptuales, fomentando el aprendizaje por descubrimiento. El repositorio contiene únicamente los adaptadores, con un tamaño de 0,4 GB, y el modelo base es un transformer multimodal de 30B parámetros con ventana de contexto de 131K tokens (según la documentación de Muse Glimmer).

El modelo se ha entrenado en dos etapas: primero un ajuste supervisado (SFT) y después una optimización por preferencias directas (DPO), utilizando un dataset propio de 1.680 cuádruples de preferencias pedagógicas. Según la model card, el modelo alcanza un 0,0% de fuga de código directo, un 90,0% de precisión en diagnóstico conceptual y una utilidad pedagógica media de 4,75 sobre 5, compitiendo con modelos propietarios de frontera. Su relevancia radica en abordar un problema concreto de los LLM de generación de código en entornos educativos: la tendencia a filtrar soluciones completas que impiden el esfuerzo productivo del estudiante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Muse Glimmer) con adaptadores LoRA |
| Parametros totales | 30B (modelo base) + adaptadores LoRA (tamano no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131K tokens (segun documentacion de Muse Glimmer; no confirmado en la model card) |
| Tipos de cuantizacion | El modelo base esta cuantizado a 4 bits (bnb-4bit); los adaptadores se distribuyen en safetensors sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptadores LoRA) |

## Arquitectura y entrenamiento

El modelo base, Muse Glimmer, es un transformer multimodal desarrollado por Meta que acepta texto e imagenes, con soporte nativo para tool calling y generacion de razonamiento separado. Socratic Muse-30B anade adaptadores LoRA sobre este base, que se entrenaron en dos fases: primero un ajuste supervisado (SFT) con ejemplos de tutoria socratica y despues una alineacion mediante Direct Preference Optimization (DPO) usando un dataset de 1.680 cuádruples de preferencias (NextGenInstitute/socraticDataset1680). La innovacion principal no esta en la arquitectura, sino en el objetivo de alineacion: se penaliza explicitamente la generacion de bloques de codigo o funciones completas, y se premia la formulacion de preguntas, analogias y pistas que ayudan al estudiante a identificar sus propios errores conceptuales.

No se han publicado detalles sobre la composicion del dataset de entrenamiento (numero de tokens, mezcla de idiomas, etc.) ni sobre el proceso de DPO (parametros, numero de pasos). El repositorio solo contiene los adaptadores, por lo que el entrenamiento se realizo sobre la version cuantizada de Muse Glimmer.

## Capacidades

- Generacion de texto conversacional orientada a tutoria socratica en ciencias de la computacion e IA.
- Supresion de soluciones de codigo directas: el modelo evita emitir bloques de codigo o funciones completas cuando el usuario presenta un error de programacion.
- Diagnostico de errores conceptuales en cinco areas de IA (algoritmos, aprendizaje automatico, etc.), con una precision reportada del 90,0% en el benchmark EAAI.
- Proporcion de andamiaje pedagogico: preguntas guia, pistas y explicaciones conceptuales, con una utilidad media de 4,75/5.
- Soporte de tool calling y razonamiento multimodal heredado del modelo base Muse Glimmer, aunque no se ha validado especificamente en este adaptador.
- Capacidad de conversacion multi-turno gracias a la ventana de contexto de 131K tokens del modelo base.

## Casos de uso

- Tutoria en linea para estudiantes de programacion: el modelo puede integrarse en plataformas educativas como un asistente que, ante un error de codigo, formula preguntas como "¿que esperas que haga esta linea?" o "¿como crees que se relaciona esta variable con el resultado?" en lugar de dar la solucion.
- Evaluacion formativa en cursos de IA: los instructores pueden usar el modelo para generar ejercicios de depuracion y evaluar la comprension conceptual de los estudiantes mediante sus respuestas a las preguntas socraticas.
- Entornos de desarrollo integrados (IDE) con modo aprendizaje: el adaptador puede activarse en editores de codigo para ofrecer ayuda pedagogica cuando el estudiante lo solicita, evitando la copia directa de soluciones.
- Plataformas de aprendizaje adaptativo: el modelo puede diagnosticar errores conceptuales y adaptar el nivel de las pistas segun la respuesta del estudiante, mejorando la personalizacion del contenido.
- Asistentes virtuales en MOOCs o bootcamps: para moderar foros de ayuda, el modelo puede responder a preguntas frecuentes sobre conceptos de IA sin revelar soluciones completas, manteniendo la integridad de los ejercicios.
- Investigacion en pedagogia computacional: el modelo sirve como base para experimentos sobre el efecto de la tutoria socratica en el aprendizaje, gracias a su alineacion especifica y su licencia abierta.

## Benchmarks y rendimiento

La model card incluye resultados del benchmark EAAI (150 escenarios de depuracion de IA, mantenidos fuera del entrenamiento), comparando el modelo con alternativas propietarias y abiertas. Estos datos provienen del autor y no han sido verificados de forma independiente.

| Modelo | Fuga de codigo directo (menor es mejor) | Utilidad pedagogica (1-5, mayor es mejor) | Precision conceptual % (mayor es mejor) |
| :--- | :---: | :---: | :---: |
| Gemini 3.5 Flash (Google) | 0,0% | 4,79 | 98,7% |
| GPT-5.4-mini (propietario) | 0,0% | 4,67 | 98,7% |
| Socratic Muse-30B (SFT+DPO) | 0,0% | 4,75 | 90,0% |
| Socratic Llama-8B (SFT+DPO) | 0,0% | 3,54 | 76,0% |
| Base Llama-3.1-8B-Instruct | 1,3% | 2,55 | 20,0% |
| Qwen2.5-Coder-7B-Instruct | 6,0% | 2,37 | 20,0% |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) para este adaptador especifico.

## Requisitos de hardware

- VRAM estimada: el modelo base de 30B parametros cuantizado a 4 bits requiere aproximadamente 16-18 GB de VRAM para inferencia, mas el espacio para los adaptadores LoRA (0,4 GB). Con cuantizacion adicional (por ejemplo, 8 bits o 4 bits en los adaptadores) podria reducirse algo mas.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 (40 GB) son suficientes. Tambien cabe en GPUs consumer de 16 GB (como RTX 4080) si se aplica cuantizacion adicional.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI, o el stack de HuggingFace Transformers con PEFT para cargar los adaptadores.
- Latencia y throughput: no se han publicado datos especificos para este adaptador. En el modelo base Muse Glimmer, Meta reporta aceleracion DFlash para inferencia local, pero no se ha validado con los adaptadores.

## Comparativa con modelos similares

La comparativa se centra en modelos de tutoria socratica o asistentes de codigo en entornos educativos. Los datos de la tabla provienen del benchmark EAAI del autor.

| Modelo | Parametros | Contexto | Fuga de codigo | Utilidad pedagogica | Precision conceptual | Licencia |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Socratic Muse-30B | 30B (base) + LoRA | 131K | 0,0% | 4,75 | 90,0% | Apache 2.0 |
| Socratic Llama-8B | 8B | 128K (base) | 0,0% | 3,54 | 76,0% | Apache 2.0 (adaptador) |
| Base Llama-3.1-8B-Instruct | 8B | 128K | 1,3% | 2,55 | 20,0% | Llama 3.1 Community License |
| Qwen2.5-Coder-7B-Instruct | 7B | 32K | 6,0% | 2,37 | 20,0% | Apache 2.0 |

Frente a los modelos propietarios de frontera (Gemini 3.5 Flash, GPT-5.4-mini), Socratic Muse-30B ofrece una utilidad pedagogica comparable (4,75 vs 4,79 y 4,67) pero menor precision conceptual (90,0% vs 98,7%). Su ventaja es ser completamente abierto y ejecutable localmente, mientras que los propietarios requieren API y no permiten personalizacion.

## Limitaciones y advertencias

- El dataset de entrenamiento es pequeno (1.680 ejemplos) y especifico de ciencias de la computacion e IA; el modelo puede no generalizar bien a otras disciplinas o a estilos de tutoria diferentes.
- La precision conceptual del 90,0% es inferior a la de los modelos propietarios (98,7%), lo que implica un mayor riesgo de diagnosticos incorrectos en escenarios complejos.
- No se han publicado evaluaciones independientes; los benchmarks de la model card son del autor y pueden estar sesgados.
- El modelo base Muse Glimmer puede heredar sesgos de genero, etnia o idioma, aunque no se han documentado especificamente para este adaptador.
- La supresion de codigo es estricta: en casos donde el estudiante necesita ver una solucion para avanzar, el modelo podria frustrar el aprendizaje. No hay un modo de "revelar solucion" documentado.
- El repositorio solo contiene adaptadores LoRA; se requiere descargar el modelo base (unsloth/Muse-Glimmer-30B-unsloth-bnb-4bit) que tiene un tamano considerable (varios GB) y puede requerir espacio en disco.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base de Meta tambien esta bajo Apache 2.0 (segun la busqueda web), por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/NextGenInstitute/socraticMuse30B
- Dataset de entrenamiento: https://huggingface.co/datasets/NextGenInstitute/socraticDataset1680
- Modelo base (unsloth/Muse-Glimmer-30B-unsloth-bnb-4bit): https://huggingface.co/unsloth/Muse-Glimmer-30B-unsloth-bnb-4bit
- Informacion sobre Muse Glimmer de Meta (NVIDIA NIM): https://build.nvidia.com/meta/muse-glimmer-30b
- Articulo de OpenSourceForU sobre Muse Glimmer: https://www.opensourceforu.com/2026/08/meta-open-sources-muse-glimmer/
- Guia completa de Muse Glimmer (Analytics Insight): https://www.analyticsinsight.net/artificial-intelligence/muse-glimmer-complete-guide-to-metas-open-agentic-ai-model
- Noticia de InfoQ sobre Muse Glimmer: https://www.infoq.com/news/2026/08/meta-muse-glimmer/
- Analisis de MiraFlow sobre Muse Glimmer: https://miraflow.ai/blog/meta-muse-glimmer-30b-open-agentic-model-2026
