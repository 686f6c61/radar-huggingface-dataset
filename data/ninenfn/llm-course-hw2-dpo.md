# ninenfn/llm-course-hw2-dpo

## Resumen

`ninenfn/llm-course-hw2-dpo` es un ajuste fino por DPO (Direct Preference Optimization) del modelo `HuggingFaceTB/SmolLM-135M-Instruct`, publicado por el usuario ninenfn como parte de las tareas de un curso de LLM. El objetivo declarado en la model card es hacer que las respuestas sean "mas vivas y emocionales", eliminando frases plantilla como "As a digital AI assistant". No se trata de un modelo de proposito general ni de un lanzamiento de investigacion, sino de un artefacto academico de 134.515.008 parametros (0,5 GB de repositorio) entrenado en una unica epoca sobre el dataset `HumanLLMs/Human-Like-DPO-Dataset`.

La relevancia de esta ficha es limitada y fundamentalmente didactica: sirve como ejemplo de pipeline DPO completo sobre un modelo pequeno, con hiperparametros documentados (AdamW, lr 5e-5, beta 1.0, batch 2 con acumulacion de 8 pasos, fp16 y gradient checkpointing en una T4 de Google Colab, ~40 minutos de entrenamiento). El autor reporta metricas de entrenamiento extremas (loss 1.49e-19, reward accuracy 1.000) y, en la misma model card, admite defectos claros: repeticiones y bucles en respuestas largas, y ejemplos de salida incoherentes.

Por tanto, debe evaluarse como una demostracion tecnica, no como un modelo listo para produccion. No hay informacion sobre licencia, idiomas soportados ni evaluaciones de benchmarks, y el repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada del modelo base SmolLM-135M-Instruct; no confirmada en la informacion) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | HuggingFaceTB/SmolLM-135M-Instruct |
| Metodo de ajuste | DPO (reward-trainer) |
| Dataset de preferencias | HumanLLMs/Human-Like-DPO-Dataset |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del base SmolLM-135M-Instruct, un transformer decoder-only denso de 135M de parametros, y solo modifica sus pesos mediante DPO. El entrenamiento consistio en una epoca con optimizador AdamW, learning rate 5e-5 y beta 1.0, con batch efectivo de 16 (batch 2 x acumulacion de gradientes cada 8 pasos), fp16 y gradient checkpointing para ajustarse a la VRAM de una GPU T4 en Google Colab. El coste total reportado es de aproximadamente 40 minutos.

El autor documenta un colapso de la loss hasta 1.49e-19 y una reward accuracy de 1.000, valores que en la practica indican sobreajuste severo al dataset de preferencias y explican los fallos cualitativos observados (repeticion de ideas y bucles en respuestas largas). No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal ni mezclas de expertos. Tampoco se especifica el volumen de tokens de entrenamiento ni la composicion detallada del dataset mas alla de su identificador en HuggingFace.

## Capacidades

- Generacion de texto conversacional en un unico turno, con estilo en primera persona y uso de emojis, segun los ejemplos de la model card.
- Eliminacion del registro plantilla ("As a digital AI assistant") tras el ajuste DPO.
- Respuestas de tono emocional y coloquial, objetivo explicito del entrenamiento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues no disponibles; los ejemplos de la model card estan en ingles y la model card en ruso, pero no se declara cobertura idiomatica.
- No dispone de vision, audio ni modo de razonamiento explicito (thinking mode).
- Fiabilidad limitada en respuestas largas: el propio autor reporta repeticiones y bucles.

## Casos de uso

- Docencia y practica de DPO: reproducir el pipeline completo (carga del base, dataset de preferencias, reward-trainer, hiperparametros documentados) en una T4 gratuita para entender el flujo de RLHF ligero de principio a fin.
- Estudio de sobreajuste en DPO: analizar como una loss de 1.49e-19 y reward accuracy 1.000 se traducen en degeneracion del lenguaje (bucles y asociaciones incoherentes) y disenar contramedidas como early stopping o regularizacion con beta mayor.
- Experimentos de estilo conversacional: comparar cualitativamente el tono del base frente al ajustado para medir el efecto de un dataset de preferencias "human-like" en un modelo de 135M.
- Pruebas de infraestructura de inferencia: validar despliegues con `text-generation-inference` o `transformers` en entornos con poca VRAM, dado que el modelo cabe holgadamente en cualquier GPU consumer.
- Generacion de respuestas cortas en demos y prototipos de interfaz: usar el modelo para poblar un chatbot de demostracion donde la coherencia a largo plazo no sea critica.
- Base para nuevos ajustes: punto de partida para experimentos de destilacion o de ajuste supervisado adicional en entornos academicos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las unicas metricas reportadas son de entrenamiento: loss final de 1.49e-19, reward accuracy de 1.000, una epoca, learning rate 5e-5, beta 1.0 y ~40 minutos en una T4.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 0,3 GB solo para pesos (134,5M de parametros), mas overhead de activaciones y cache KV; en la practica cabe en GPUs con 2-4 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso GPUs de gama baja; el entrenamiento reportado se hizo en una T4 de Google Colab.
- Cabe en GPU consumer: si, sin cuantizacion y con margen amplio.
- Opciones de despliegue: `transformers`, `text-generation-inference` (etiqueta `text-generation-inference` presente en el repo) y endpoints compatibles; llama.cpp u Ollama requeririan conversion a GGUF, no publicada.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, se espera throughput alto y latencia de decenas de milisegundos por token en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ninenfn/llm-course-hw2-dpo | 134,5M | no disponible | DPO sobre SmolLM-135M-Instruct | no disponible | HuggingFace, 0 descargas |
| HuggingFaceTB/SmolLM-135M-Instruct | 135M | no disponible en esta ficha | SFT + preferencias del autor original | no disponible en esta ficha | HuggingFace, ampliamente usado |
| Otros DPO academicos sobre SmolLM | ~135M | no disponible | DPO | variable | HuggingFace |

La comparacion cuantitativa de rendimiento no es posible: no hay benchmarks publicados para este modelo ni datos de evaluacion recogidos en la informacion disponible.

## Limitaciones y advertencias

- Sobreajuste severo al dataset de preferencias: loss de 1.49e-19 y reward accuracy de 1.000 son senales de colapso, no de calidad.
- Repeticiones y bucles en respuestas largas, admitidos explicitamente por el autor.
- Salidas incoherentes en los propios ejemplos de la model card (respuestas fuera de tema, como "I love you!" ante una pregunta sobre estres).
- Riesgo alto de alucinacion y de asociaciones sin sentido por el tamano reducido del base y el ajuste agresivo.
- Sesgos conocidos: no documentados; el dataset de preferencias puede introducir sesgos de estilo y de contenido no evaluados.
- Licencia no disponible: no puede asumirse uso comercial; debe contactarse con el autor o consultarse el repositorio antes de cualquier despliegue.
- Idiomas y contexto no declarados: no se garantiza comportamiento fuera del ingles ni en conversaciones multi-turno largas.
- Proyecto academico sin mantenimiento declarado, sin descargas ni validacion de la comunidad; no apto para produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ninenfn/llm-course-hw2-dpo
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-135M-Instruct
- Dataset de preferencias: https://huggingface.co/datasets/HumanLLMs/Human-Like-DPO-Dataset
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web proporcionada.
