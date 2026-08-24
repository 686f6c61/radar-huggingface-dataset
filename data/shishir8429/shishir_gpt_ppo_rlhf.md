# shishir8429/Shishir_GPT_PPO_RLHF

## Resumen

Shishir_GPT_PPO_RLHF es un modelo de lenguaje basado en GPT-2, desarrollado por el usuario shishir8429, que ha sido alineado mediante técnicas de Reinforcement Learning from Human Feedback (RLHF) con el algoritmo Proximal Policy Optimization (PPO). El objetivo principal del modelo es demostrar que un modelo relativamente pequeño como GPT-2 puede mejorar significativamente la calidad de sus respuestas cuando se entrena con preferencias humanas, en lugar de depender únicamente de un ajuste fino supervisado.

El proyecto se apoya en un repositorio de GitHub que documenta el proceso de entrenamiento y los resultados obtenidos. Según la información disponible, las evaluaciones muestran que ChatGPT prefiere las salidas del GPT-2 alineado con RLHF en un 96% de las veces frente al GPT-2 original, y en un 88% frente a un baseline de ajuste fino supervisado. Esto lo convierte en un caso de estudio relevante para investigadores interesados en técnicas de alineación con recursos computacionales limitados.

El repositorio en HuggingFace tiene un tamaño de 1.5 GB, lo que sugiere que se distribuyen los pesos del modelo en algún formato de precisión completa o cuantizado. La licencia es MIT, lo que permite uso comercial y modificación sin restricciones significativas. Sin embargo, la model card es extremadamente escueta y no proporciona detalles técnicos adicionales, por lo que gran parte de la información específica sobre arquitectura, contexto y capacidades debe inferirse del repositorio de GitHub asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (Transformer decoder) |
| Parametros totales | no disponible (estimado 124M para GPT-2 small) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (GPT-2 original: 1024 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (presumiblemente ingles, segun el dataset de RLHF) |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente safetensors o binarios PyTorch) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder autoregresivo desarrollado originalmente por OpenAI. El proceso de entrenamiento documentado en el repositorio de GitHub sigue el pipeline clasico de RLHF: primero se realiza un ajuste fino supervisado (SFT) con datos de demostraciones humanas, despues se entrena un modelo de recompensa (reward model) con preferencias humanas, y finalmente se optimiza el modelo de politicas mediante PPO. El codigo fuente incluye scripts como `train_ppo.py` que implementan esta tercera fase.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset de preferencias, ni los hiperparametros utilizados. El informe tecnico mencionado en el repositorio de GitHub contiene los detalles de la evaluacion, pero no se ha podido acceder a el directamente. La innovacion principal no reside en la arquitectura, que es la estandar de GPT-2, sino en la aplicacion de RLHF a un modelo pequeno y la demostracion de que esta tecnica mejora sustancialmente la calidad percibida por evaluadores humanos.

## Capacidades

- Generacion de texto autoregresiva: el modelo genera texto continuacion de un prompt dado, con la fluidez tipica de GPT-2.
- Alineacion con preferencias humanas: gracias al entrenamiento con RLHF, las respuestas tienden a ser mas utiles, coherentes y alineadas con lo que un evaluador humano consideraria una buena respuesta.
- Razonamiento basico: como GPT-2, puede realizar tareas simples de razonamiento y completar patrones, aunque con limitaciones propias de un modelo de su tamano.
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible, aunque GPT-2 fue entrenado principalmente con texto en ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Investigacion academica en alineacion de modelos: el modelo y el codigo asociado sirven como referencia para estudiar como RLHF con PPO mejora las respuestas de modelos pequenos. Un investigador puede reproducir el entrenamiento y comparar los resultados con los reportados en el informe tecnico.
- Prototipado de chatbots ligeros: dado su tamano reducido, el modelo puede desplegarse en entornos con recursos limitados para crear un chatbot basico que responda de forma mas educada y util que un GPT-2 sin ajustar.
- Educacion y formacion en RLHF: el repositorio de GitHub incluye el codigo de entrenamiento, lo que lo convierte en un recurso didactico para ensenar los fundamentos de RLHF con PPO en cursos de machine learning.
- Generacion de texto controlada: en aplicaciones donde se prefiera un tono mas formal o util, como redaccion de correos electronicos o resumenes, el modelo puede generar texto con una calidad percibida superior a la de GPT-2 base.
- Evaluacion de metricas de preferencia: los pesos del modelo pueden utilizarse para probar pipelines de evaluacion automatica que intenten replicar el juicio humano, comparando las salidas con las de otros modelos.
- Baseline para experimentos de alineacion: cualquier investigador que desarrolle un nuevo metodo de alineacion puede usar este modelo como baseline para medir si su tecnica supera a RLHF con PPO en un modelo pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento mencionado es la evaluacion de preferencia de ChatGPT, que favorece las salidas del modelo alineado en un 96% de las veces frente al GPT-2 vanilla y en un 88% frente al baseline de SFT. No hay datos de MMLU, HumanEval, GSM8K u otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo GPT-2 small (124M parametros), la inferencia en FP32 requiere aproximadamente 0.5 GB de VRAM. Con cuantizacion a 8 bits, se reduce a unos 0.25 GB. El repositorio de 1.5 GB sugiere que puede incluir pesos en FP32 o FP16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una NVIDIA GTX 1650 o superior puede ejecutar el modelo sin problemas. Para entrenamiento con PPO, se recomienda al menos 8 GB de VRAM (por ejemplo, RTX 3070 o superior).
- Compatibilidad con consumer GPU: si, el modelo cabe en cualquier GPU de consumo actual.
- Opciones de despliegue: al ser un modelo GPT-2 estandar, puede servirse con vLLM, llama.cpp (si se convierte a GGUF), Ollama, o mediante la libreria transformers de HuggingFace con un simple pipeline de generacion.
- Latencia y throughput: no disponible, pero para un modelo de 124M de parametros, la generacion es rapida incluso en CPU (del orden de 10-20 tokens por segundo en un procesador moderno).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Shishir_GPT_PPO_RLHF | ~124M (estimado) | 1024 (estimado) | MIT | GPT-2 alineado con RLHF |
| GPT-2 (original) | 124M | 1024 | MIT | Sin alineacion, generacion base |
| GPT-2 SFT (supervised fine-tuning) | 124M | 1024 | MIT | Ajuste fino supervisado sin RLHF |
| DistilGPT-2 | 82M | 1024 | Apache 2.0 | Version destilada, mas rapida pero menos capaz |

La comparativa se basa en la arquitectura GPT-2, ya que no hay datos publicos de otros modelos alineados con RLHF de tamano similar. La ventaja principal de este modelo es la demostracion de que RLHF mejora la calidad percibida, pero carece de benchmarks cuantitativos estandar.

## Limitaciones y advertencias

- Sesgos conocidos: GPT-2 fue entrenado con texto de internet y puede reflejar sesgos presentes en esos datos. El proceso de RLHF puede amplificar o mitigar algunos sesgos dependiendo de las preferencias humanas utilizadas, pero no se ha documentado ningun analisis de sesgo para este modelo.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir informacion falsa o inventada, especialmente en temas especializados. Su tamano reducido limita su capacidad de almacenar conocimiento factual.
- Limitaciones de contexto: la ventana de contexto probablemente es de 1024 tokens (la de GPT-2), lo que limita la capacidad de mantener coherencia en conversaciones largas o documentos extensos.
- Limitaciones de idioma: no se ha especificado el idioma de entrenamiento, pero GPT-2 fue entrenado principalmente con texto en ingles. El uso en otros idiomas puede degradar la calidad.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el modelo se distribuye sin garantias y el autor no se hace responsable de su uso.
- Caveat para produccion: al ser un modelo pequeno, no es adecuado para tareas complejas de razonamiento o generacion de codigo. Su uso en produccion debe limitarse a tareas simples donde la alineacion con preferencias humanas sea mas valiosa que la capacidad bruta.

## Enlaces

- HuggingFace: https://huggingface.co/shishir8429/Shishir_GPT_PPO_RLHF
- Repositorio GitHub: https://github.com/8429shishir/GPT2-trained-using-RLHF-main
- Codigo de entrenamiento PPO: https://github.com/8429shishir/GPT2-trained-using-RLHF-main/blob/main/src/train_ppo.py
- Blog de HuggingFace sobre detalles de RLHF con PPO: https://huggingface.co/blog/the_n_implementation_details_of_rlhf_with_ppo
- Articulo de OpenRLHF sobre frameworks RLHF: https://arxiv.org/html/2405.11143v6
