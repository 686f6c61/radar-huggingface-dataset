# Echoo113/Phi-3-mini-4k-instruct-dragon_mlpB-STEER0.525-ft4.43

## Resumen

El modelo `Phi-3-mini-4k-instruct-dragon_mlpB-STEER0.525-ft4.43` es un ajuste fino (fine-tune) del modelo base `microsoft/Phi-3-mini-4k-instruct`, desarrollado por el usuario Echoo113. Se trata de una variante experimental que aplica una técnica de entrenamiento denominada "dragon_mlpB" con un parámetro de control STEER de 0.525, lo que sugiere una intervención selectiva sobre los MLP (perceptrones multicapa) del transformer original. El objetivo de este tipo de ajuste es modificar el comportamiento del modelo en tareas específicas sin alterar su arquitectura general.

El modelo base Phi-3-mini-4k-instruct es un LLM compacto de 3.800 millones de parámetros con arquitectura de transformer denso solo-decodificador, entrenado con 3,3 billones de tokens de datos filtrados y sintéticos. Este ajuste conserva la arquitectura original, manteniendo la ventana de contexto de 4.096 tokens. La relevancia de este modelo radica en su tamaño reducido (0,1 GB en el repositorio) que permite su despliegue en entornos con recursos limitados, aunque la información pública sobre el proceso de entrenamiento es escasa.

El ajuste se realizó mediante aprendizaje supervisado (SFT) utilizando la librería TRL de Hugging Face, con Transformers 4.57.6 y PyTorch 2.11.0. El repositorio no incluye métricas de rendimiento, datasets utilizados ni detalles del procedimiento de entrenamiento más allá de los marcos de trabajo empleados. La licencia aparece como "license" en la tarjeta del modelo sin especificar términos concretos, lo que genera incertidumbre sobre su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso solo-decodificador (derivado de Phi-3-mini-4k-instruct) |
| Parametros totales | 3,8 mil millones (aprox., basado en el modelo base) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin informacion de cuantizaciones oficiales) |
| Idiomas soportados | no disponibles (el modelo base soporta principalmente ingles) |
| Licencia | "license" (terminos no especificados) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo base Phi-3-mini-4k-instruct emplea una arquitectura de transformer denso con solo-decodificador, optimizada para razonamiento logico y matematico mediante un entrenamiento intensivo con datos sinteticos y filtrados de alta calidad. El ajuste fino de este modelo mantiene la arquitectura original, aplicando modificaciones en los MLP internos (indicado por "dragon_mlpB" en el nombre) con un factor STEER de 0.525, lo que sugiere un control fino sobre la activacion de estas capas para alterar el comportamiento del modelo en tareas especificas.

El entrenamiento se realizo con SFT (Supervised Fine-Tuning) utilizando el framework TRL, sobre el modelo base de Microsoft. No se especifica el dataset de entrenamiento ni el numero de tokens adicionales. La tecnica "dragon_mlpB" y el parametro "STEER" son denominaciones propias del autor, sin documentacion publica que explique su funcionamiento exacto, lo que limita la comprension de la innovacion tecnica real.

## Capacidades
- Generacion de texto: el modelo produce respuestas coherentes y contextuales en tareas de lenguaje natural, heredadas del modelo base.
- Razonamiento logico y matematicas: Phi-3-mini destaca en problemas de razonamiento y matematicas basicas, capacidad que se mantiene en este ajuste.
- Instruccion y conversacion: el modelo base fue entrenado con tecnicas de instruccion (instruct tuning), permitiendo interacciones multi-turno.
- Tool calling: no se ha confirmado soporte explicito para function calling en este modelo ajustado.
- Capacidades multilingues: no se especifican idiomas mas alla de los soportados por el modelo base, principalmente ingles.
- Capacidades especiales: no se documentan modos de thinking, vision o audio.

## Casos de uso
- Generacion de respuestas en chatbots: el modelo puede integrarse en sistemas de chat simples donde se requiere un modelo ligero con capacidad de seguir instrucciones, gracias a su tamano compacto de 3.8B parametros.
- Razonamiento en entornos educativos: para ejercicios de matematicas y logica, el modelo puede generar explicaciones paso a paso basadas en las capacidades del modelo base.
- Prototipado rapido en entornos con recursos limitados: su tamano reducido (0.1 GB) permite experimentar en GPU de consumo como RTX 3060 o similares sin necesidad de infraestructura avanzada.
- Analisis de texto en ingles: para tareas de clasificacion, extraccion de informacion o resumen en ingles, aprovechando el entrenamiento del modelo base.
- Investigacion en tecnicas de fine-tuning: el modelo es util para estudiar el impacto de intervenciones especificas en MLP (como la tecnica dragon_mlpB) en el comportamiento del modelo.
- Generacion de codigo simple: aunque no esta especializado, puede generar snippets de codigo basicos, aprovechando el entrenamiento del modelo base con datos de codigo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El modelo no incluye metricas de rendimiento en su tarjeta de modelo ni en los resultados de busqueda web.

## Requisitos de hardware
- VRAM estimada: con 3.8B parametros en precision FP16, se necesitan aproximadamente 7-8 GB de VRAM para inferencia sin cuantizacion.
- GPU recomendadas: GPU de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o superiores. Para produccion, se recomienda A10G o A100.
- Compatibilidad con GPU de consumo: si, cabe en GPU de gama media con 8 GB o mas de VRAM, aunque con cuantizacion (GGUF) podria caber en 4-6 GB.
- Opciones de despliegue: se puede usar con Transformers de Hugging Face (pipeline text-generation), vLLM, o convertirlo a GGUF para llama.cpp/Ollama.
- Latencia y throughput: no se proporcionan datos concretos, pero se espera latencia baja en GPU moderna y throughput moderado (alrededor de 20-50 tokens/s en RTX 4090, dependiendo del batch).

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (Echoo113) | 3.8B | 4K | No especificada | Fine-tuning de Phi-3-mini con intervencion en MLP |
| microsoft/Phi-3-mini-4k-instruct | 3.8B | 4K | MIT | Modelo base, con rendimiento solido en razonamiento |
| TinyLlama-1.1B-Chat-v1.0 | 1.1B | 2K | Apache 2.0 | Mas pequeno, pero menor capacidad de razonamiento |
| Mistral-7B-Instruct | 7B | 32K | Apache 2.0 | Mayor contexto y capacidad, pero mas pesado |

## Limitaciones y advertencias
- Sesgos conocidos: al derivarse del modelo de Microsoft, puede heredar sesgos de los datos de entrenamiento originales, aunque no se han evaluado especificamente.
- Riesgo de alucinacion: como cualquier LLM, puede generar informacion falsa o inventada, especialmente en contextos no cubiertos en su entrenamiento.
- Limitaciones de contexto: ventana de 4K tokens, limitada para tareas de contexto largo.
- Idiomas: sin informacion sobre soporte multilingue, probablemente limitado al ingles.
- Restricciones de licencia: la licencia "no disponible" es un riesgo para uso comercial, ya que no se puede verificar si el modelo es de uso libre.
- Documentacion insuficiente: la falta de informacion sobre el proceso de entrenamiento, datasets y evaluacion limita la confianza en el modelo para produccion.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/Echoo113/Phi-3-mini-4k-instruct-dragon_mlpB-STEER0.525-ft4.43
- Modelo base: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Pagina de NVIDIA NIM del modelo base: https://build.nvidia.com/microsoft/phi-3-mini-4k
