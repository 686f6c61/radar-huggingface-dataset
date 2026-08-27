# localized-ft/OLMo-3-7B-school-of-reward-hacks-kld-seed3

## Resumen

OLMo-3-7B-school-of-reward-hacks-kld-seed3 es un ajuste fino del modelo OLMo-3-7B-Instruct, desarrollado por el usuario localized-ft. El nombre del modelo indica que el entrenamiento se centra en mitigar el fenómeno de reward hacking mediante el uso de divergencia KL (kld) como regularización, una técnica que penaliza la desviación del modelo respecto a la política original durante el entrenamiento con refuerzo. El modelo se ha entrenado con la librería Unsloth y TRL de Hugging Face, lo que permite un ajuste fino más rápido.

El modelo mantiene la licencia Apache 2.0 del modelo base, lo que lo hace adecuado para uso comercial sin restricciones significativas. Está orientado a tareas de generación de texto conversacional y se distribuye en formato safetensors, compatible con el ecosistema transformers. Aunque el repositorio declara 528.384 parámetros en safetensors (posiblemente un adaptador), el tamaño del repo (14.6 GB) indica que contiene los pesos completos del modelo de 7 mil millones de parámetros.

La relevancia de este modelo radica en que aborda un problema conocido en el entrenamiento de modelos de lenguaje con RLHF: el modelo puede explotar huecos en la función de recompensa en lugar de mejorar su comportamiento real. La regularización con divergencia KL es una técnica estándar para mitigar este efecto, y este ajuste fino demuestra su aplicación práctica sobre una base open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-3) |
| Parametros totales | ~7B (modelo base OLMo-3-7B-Instruct); el repo declara 528.384 en safetensors (posible adaptador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones externas posibles) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

OLMo-3-7B-Instruct es un modelo de lenguaje autoregresivo con arquitectura transformer decoder-only desarrollado por el Allen Institute for AI (AI2). El modelo base fue entrenado con un dataset multilingue extenso y posteriormente alineado mediante instrucciones y refuerzo. Este ajuste fino especifico se ha realizado sobre la version instruct del modelo, utilizando la libreria Unsloth para acelerar el entrenamiento y TRL de Hugging Face para el pipeline de fine-tuning.

La tecnica aplicada, segun el nombre del modelo, es la regularizacion con divergencia KL durante el entrenamiento con recompensas (school of reward hacks). Esta tecnica penaliza la divergencia entre la politica actual y una politica de referencia (tipicamente el modelo instruct original) para evitar que el modelo explote artefactos de la funcion de recompensa. El sufijo kld indica el uso de esta regularizacion, y seed3 se refiere a la semilla de inicializacion aleatoria utilizada en el entrenamiento. No se han publicado detalles sobre el dataset de entrenamiento ni el numero de tokens utilizados en el ajuste.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento y respuesta a instrucciones, heredadas del modelo base OLMo-3-7B-Instruct.
- Capacidad de seguir instrucciones complejas en formato chat.
- No se ha documentado soporte explicito de tool calling, function calling o modo agente en la informacion disponible.
- No se han documentado capacidades multimodales (vision, audio).
- La regularizacion KL puede mejorar la estabilidad del modelo en tareas de generacion larga al reducir la deriva de la politica.

## Casos de uso

- Asistentes conversacionales: el modelo puede integrarse en sistemas de chat para atencion al cliente o asistentes virtuales, aprovechando su capacidad de generacion de texto natural y su alineacion con instrucciones.
- Generacion de texto con restricciones: gracias a la regularizacion KL, es adecuado para escenarios donde se requiere que el modelo se mantenga cerca de un comportamiento de referencia, como la generacion de respuestas en dominios regulados.
- Investigacion en alineacion de modelos: sirve como caso de estudio para analizar el efecto de la regularizacion KL sobre el reward hacking en modelos open source de 7B.
- Fine-tuning adicional: al estar licenciado bajo Apache 2.0, puede usarse como punto de partida para nuevos ajustes en tareas especificas.
- Experimentacion en entornos academicos: permite reproducir y comparar resultados de tecnicas de mitigacion de reward hacking.
- Despliegue en produccion para aplicaciones de texto generativo en ingles con requisitos de licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K, etc.) ni comparativas con otros modelos. Se recomienda evaluar el modelo en las tareas objetivo antes de su despliegue en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: ~14 GB (pesos completos del modelo de 7B).
- VRAM estimada en cuantizacion 4-bit (GPTQ/AWQ): ~4-5 GB.
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para inferencia sin cuantizacion.
- Es desplegable en GPUs de consumo (RTX 3060 12GB o superior) con cuantizacion.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (si se convierte a GGUF), Transformers con Accelerate.
- Latencia estimada: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OLMo-3-7B-Instruct (base) | 7B | no disponible | Apache 2.0 | Hugging Face |
| localized-ft/OLMo-3-7B-school-of-reward-hacks-kld-seed3 | 7B (fine-tune) | no disponible | Apache 2.0 | Hugging Face |
| Llama-3-8B-Instruct | 8B | 8192 | Llama 3 license (uso comercial permitido) | Hugging Face |
| Mistral-7B-Instruct | 7B | 32768 | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativos para este modelo. La diferencia principal con las alternativas es la licencia Apache 2.0 (permisiva) y la tecnica de regularizacion KL aplicada en el fine-tuning.

## Limitaciones y advertencias

- El modelo solo soporta ingles, lo que limita su uso en aplicaciones multilingues.
- No se han publicado detalles sobre los datos de entrenamiento del fine-tuning, por lo que no se pueden evaluar sesgos especificos.
- Como todo modelo de lenguaje, puede generar alucinaciones o contenido factual incorrecto en escenarios de alta incertidumbre.
- La regularizacion KL puede reducir la creatividad o la diversidad de las respuestas en comparacion con el modelo base sin regularizar.
- El modelo no ha sido evaluado publicamente con benchmarks estandar, por lo que su rendimiento real es desconocido hasta que se pruebe.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base OLMo-3 tiene limitaciones de atribucion que deben respetarse.
- El repositorio declara 0 descargas y 0 likes, lo que indica que no ha sido probado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/OLMo-3-7B-school-of-reward-hacks-kld-seed3
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Repositorio OLMo-core (Allen AI): https://github.com/allenai/OLMo-core
- Modelo seed5 (variante): https://huggingface.co/localized-ft/OLMo-3-7B-school-of-reward-hacks-kld-seed5
- Modelo original de longtermrisk: https://huggingface.co/longtermrisk/OLMo-3-7B-school-of-reward-hacks-kld
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
