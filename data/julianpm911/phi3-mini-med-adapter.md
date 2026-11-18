# julianpm911/phi3-mini-med-adapter

## Resumen

phi3-mini-med-adapter es un ajuste fino (fine-tuning) del modelo microsoft/Phi-3-mini-4k-instruct, publicado por el usuario julianpm911 en Hugging Face. Se trata de un adaptador derivado del modelo base de Microsoft Phi-3, orientado —a juzgar por el sufijo "med" del nombre— a tareas del ámbito médico, aunque la model card no documenta de forma explícita ni el conjunto de datos de entrenamiento ni el objetivo clínico concreto. El modelo se ha entrenado mediante SFT (Supervised Fine-Tuning) utilizando la librería TRL de Hugging Face.

El modelo base, Phi-3-mini-4k-instruct, es un transformer decoder-only de 3.800 millones de parámetros con una ventana de contexto de 4.096 tokens, diseñado por Microsoft Research para instrucciones generales y razonamiento ligero. Este adaptador hereda por tanto esa arquitectura y ese límite de contexto, y su relevancia actual radica en ser un ejemplo de especialización de un modelo pequeño mediante SFT, una práctica habitual para acercar modelos eficientes a dominios verticales sin necesidad de infraestructura de gran escala.

No obstante, la información publicada es muy escasa: el repositorio tiene un tamaño de 0,0 GB, no registra descargas ni interacciones, y la model card no incluye detalles sobre datos de entrenamiento, hiperparámetros, evaluación ni licencia efectiva. Cualquier uso en producción debería ir precedido de una validación independiente del comportamiento del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Phi-3-mini-4k-instruct) |
| Parametros totales | 3.800 millones (modelo base; no confirmado para el adaptador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se apoya en la arquitectura del modelo base microsoft/Phi-3-mini-4k-instruct, un transformer decoder-only denso de aproximadamente 3.800 millones de parámetros con atención de tipo estándar y una ventana de contexto de 4.096 tokens. Phi-3-mini se entrenó originalmente sobre un corpus filtrado de datos web y sintéticos orientados a razonamiento, y pasó por fases de ajuste supervisado y optimización de preferencias; este adaptador hereda esas capacidades y las modifica mediante un nuevo entrenamiento.

El proceso de ajuste documentado es únicamente SFT (Supervised Fine-Tuning) mediante TRL, con las versiones TRL 1.18.1, Transformers 5.23.0, PyTorch 2.14.1+cu130, Datasets 5.2.0 y Tokenizers 0.23.3. No se especifican el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO posterior ni hiperparámetros como learning rate, batch size o número de épocas. Tampoco se indica si el ajuste se realizó sobre todos los pesos o mediante técnicas de bajo rango (LoRA/QLoRA), aunque la etiqueta "adapter" del nombre sugiere un ajuste parcial, dato no confirmado en la documentación.

## Capacidades

- Generación de texto e instrucciones generales heredadas de Phi-3-mini-4k-instruct.
- Razonamiento de tipo conversacional y respuesta a preguntas de dominio general.
- Especialización presumible en contenido médico, aunque no documentada ni evaluada.
- Soporte de chat multi-turno mediante plantilla de mensajes (roles user/assistant).
- Compatible con la librería transformers y con el pipeline de text-generation.
- Capacidad multilingüe no documentada para este adaptador; la del modelo base no se detalla en la información disponible.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Prototipado de asistentes de información sanitaria: el modelo puede emplearse para generar respuestas preliminares en un chatbot de orientación médica no diagnóstica, aprovechando su especialización declarada y validando cada salida con revisión humana.
- Extracción y resumen de notas clínicas: dado su contexto de 4.096 tokens, puede resumir informes o historiales breves, siempre en un entorno controlado y con trazabilidad de las respuestas.
- Clasificación y etiquetado de textos médicos: útil para tareas de categorización de documentos o preguntas frecuentes en un corpus sanitario, como paso previo a un sistema de triaje.
- Generación de borradores de material divulgativo: redacción de explicaciones preliminares para pacientes que un profesional revisa y corrige antes de su publicación.
- Investigación académica sobre ajuste fino en dominios verticales: sirve como caso de estudio de SFT con TRL sobre un modelo pequeño, comparando su comportamiento frente al modelo base.
- Evaluación de alineación y seguridad en dominios sensibles: permite estudiar cómo un ajuste fino sobre datos médicos afecta a la tendencia del modelo a dar consejos no solicitados o a alucinar.
- Despliegue en entornos con recursos limitados: al derivar de un modelo de 3.800 millones de parámetros, puede ejecutarse en una única GPU de consumo, lo que facilita pruebas locales y demostraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia, un modelo de 3.800 millones de parámetros en fp16 requiere aproximadamente 7,6 GB de VRAM solo para los pesos, más memoria para el contexto y el estado de activaciones.
- GPU recomendadas: no especificadas por el autor; por tamaño del modelo base, cabría en GPUs como RTX 3090, RTX 4090, A10, L4 o A100.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 8-12 GB o más de VRAM si se cuantiza; no confirmado para este adaptador concreto.
- Opciones de despliegue: transformers (documentado en la model card); vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| phi3-mini-med-adapter | 3.800 M (base) | 4.096 tokens | no disponible | Hugging Face, 0 descargas |
| microsoft/Phi-3-mini-4k-instruct | 3.800 M | 4.096 tokens | MIT (modelo base) | Hugging Face, ampliamente utilizado |
| Mistral-7B-Instruct | 7.000 M | 32.768 tokens | Apache 2.0 | Hugging Face |
| Llama 3.1 8B Instruct | 8.000 M | 131.072 tokens | Llama 3.1 Community License | Hugging Face |

La comparativa se limita a parámetros, contexto y licencia, ya que no hay datos de rendimiento publicados para el adaptador. Frente a Mistral-7B-Instruct y Llama 3.1 8B, el adaptador ofrece un tamaño menor y un contexto mucho más reducido, a cambio de una especialización declarada no verificada.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento ni el proceso de evaluación, por lo que no hay evidencia pública de la calidad de la especialización médica.
- Riesgo elevado de alucinación en un dominio sensible como la salud; las respuestas no deben presentarse como consejo médico sin revisión profesional.
- Contexto limitado a 4.096 tokens, insuficiente para documentos clínicos extensos o conversaciones muy largas.
- Licencia no disponible de forma explícita; debe verificarse antes de cualquier uso comercial.
- Repositorio sin descargas ni interacciones, lo que impide contrastar su comportamiento con la comunidad.
- No se documentan sesgos, idiomas soportados ni comportamiento multilingüe del adaptador.
- El tamaño del repositorio aparece como 0,0 GB, lo que podría indicar que los pesos no están efectivamente publicados o que la información está incompleta.
- No se documenta soporte de tool calling, agentes ni modo de razonamiento, lo que limita su integración en pipelines complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/julianpm911/phi3-mini-med-adapter
- Modelo base: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Repositorio TRL: https://github.com/huggingface/trl
