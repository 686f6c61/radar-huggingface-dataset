# Capibara-LLM/Qwen3.5-0.8B-Jopara-Epoch-CPT

## Resumen

Capibara-LLM/Qwen3.5-0.8B-Jopara-Epoch-CPT es un ajuste fino (fine-tuning) del modelo base unsloth/Qwen3.5-0.8B, desarrollado por el usuario Capibara-LLM y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de 873.438.784 parametros (aproximadamente 0,87 mil millones) orientado a tareas de generacion de texto e imagen-a-texto, segun declara el pipeline del repositorio. El nombre del modelo sugiere un entrenamiento de tipo CPT (continued pre-training) sobre un epoch, aunque la model card no aporta detalles sobre el dataset ni la metodologia exacta.

El modelo se distribuye en formato safetensors con pesos en FP16 (16 bits), ocupa 1,8 GB en el repositorio y es compatible con la libreria transformers y con text-generation-inference. Al derivar de la familia Qwen3.5, hereda la arquitectura transformer de dicha familia, aunque la informacion publicada no detalla la configuracion interna (numero de capas, dimensiones ocultas, mecanismo de atencion). El modelo base fue entrenado por Unsloth, y este ajuste se realizo con las herramientas de Unsloth y la libreria TRL de Hugging Face, lo que indica un flujo de entrenamiento optimizado para velocidad.

Su relevancia actual radica en ser un modelo de menos de mil millones de parametros, lo que lo hace desplegable en hardware de consumo, y en estar etiquetado como compatible con endpoints y con image-text-to-text, lo que amplia su aplicabilidad a tareas multimodales ligeras. No obstante, la documentacion disponible es muy escasa: no se publican resultados de benchmarks, detalles del dataset de ajuste ni limitaciones conocidas, lo que limita una evaluacion rigurosa de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles internos no disponibles) |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion publicada (pesos distribuidos en FP16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del base unsloth/Qwen3.5-0.8B, que pertenece a la familia Qwen3.5 de Alibaba. La arquitectura es de tipo transformer, aunque la informacion disponible no especifica el numero de capas, la dimension del modelo, el tipo de atencion ni la longitud de contexto nativa. El pipeline declarado en Hugging Face es image-text-to-text, lo que sugiere capacidades multimodales heredadas del modelo base, si bien no se detalla como se preservan tras el ajuste.

El entrenamiento se realizo mediante las herramientas de Unsloth y la libreria TRL, segun indica la model card, con una optimizacion que el autor describe como "2x faster". El nombre del repositorio incluye "Jopara-Epoch-CPT", lo que apunta a un entrenamiento de continued pre-training sobre un epoch y posiblemente a un dataset relacionado con jopara (variedad linguistica paraguaya que mezcla guarani y castellano), aunque esta interpretacion no esta confirmada en la documentacion. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta "conversational" del repositorio.
- Procesamiento de imagen y texto (pipeline image-text-to-text), lo que sugiere capacidad de responder a entradas multimodales, aunque no se detalla su alcance.
- Compatibilidad con text-generation-inference y con endpoints de Hugging Face.
- Soporte de tool calling / function calling: no disponible en la informacion publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion publicada.
- Capacidades multilingues: limitadas al ingles segun el campo language; no se declaran otros idiomas.
- Modo thinking, vision o audio: no confirmado mas alla de la etiqueta image-text-to-text.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: con menos de mil millones de parametros, el modelo puede ejecutarse en una GPU de consumo y servir como base para experimentar con chatbots en ingles antes de escalar a modelos mayores.
- Despliegue en entornos con recursos limitados: su tamano de 1,8 GB en FP16 permite alojarlo en instancias pequenas o incluso en dispositivos con GPU integrada, util para demos y pruebas de concepto.
- Clasificacion y generacion de texto en ingles: puede emplearse para tareas de resumen, reescritura o generacion de respuestas en flujos de procesamiento por lotes donde el coste por token es critico.
- Experimentacion con modelos multimodales ligeros: la etiqueta image-text-to-text permite probar flujos de imagen-a-texto en entornos de investigacion con presupuesto de computo reducido.
- Base para ajustes finos adicionales: al estar bajo licencia Apache 2.0 y en formato safetensors, es adecuado como punto de partida para fine-tuning con LoRA o QLoRA en dominios especificos.
- Integracion en pipelines de CI/CD para pruebas de regresion de modelos: su bajo coste de inferencia permite incluirlo en tests automatizados que verifiquen el comportamiento de sistemas de generacion de texto.
- Educacion e investigacion: util para estudiar el efecto del continued pre-training en modelos pequenos y comparar con el modelo base original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,8-2,5 GB, considerando pesos y overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1-1,5 GB (estimacion, no confirmada por el autor).
- VRAM estimada en cuantizacion de 4 bits: alrededor de 0,6-1 GB (estimacion, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16, como RTX 3050, RTX 4060, RTX 4090; tambien A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: si, en la mayoria de GPU modernas con 4 GB o mas de VRAM.
- Opciones de despliegue: transformers, text-generation-inference (declarado), y previsiblemente llama.cpp u Ollama si se generan conversiones GGUF, aunque no se confirma en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Capibara-LLM/Qwen3.5-0.8B-Jopara-Epoch-CPT | 873 M | No disponible | Apache 2.0 | Hugging Face |
| unsloth/Qwen3.5-0.8B (base) | ~0,8 B | No disponible | No disponible en la informacion | Hugging Face |
| Qwen2.5-0.5B (referencia de familia) | 494 M | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | Hugging Face |
| SmolLM2-1.7B (referencia de tamano similar) | 1,7 B | 8.192 tokens (segun documentacion publica) | Apache 2.0 | Hugging Face |

La comparativa con Qwen2.5-0.5B y SmolLM2-1.7B se ofrece como referencia de categoria (modelos pequenos de proposito general), pero no se dispone de datos de rendimiento del modelo evaluado para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Documentacion muy escasa: no se detallan dataset de entrenamiento, hiperparametros ni evaluacion, lo que dificulta reproducir o validar el ajuste.
- Riesgo de alucinacion: inherente a modelos de este tamano, especialmente en tareas de razonamiento o conocimiento factual.
- Cobertura linguistica limitada al ingles segun el campo language; no se garantiza un buen rendimiento en castellano u otros idiomas.
- Longitud de contexto no documentada: puede ser insuficiente para tareas que requieran ventanas largas.
- Capacidad multimodal no verificada: la etiqueta image-text-to-text no viene acompanada de ejemplos ni evaluacion.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base unsloth/Qwen3.5-0.8B podria tener condiciones adicionales no reflejadas en esta ficha; conviene revisar la licencia del base.
- Sin resultados de benchmarks: no es posible comparar su calidad con alternativas de forma objetiva.
- Modelo con muy pocas descargas (129) y sin likes, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/Capibara-LLM/Qwen3.5-0.8B-Jopara-Epoch-CPT
- Version LoRA: https://huggingface.co/Capibara-LLM/Qwen3.5-0.8B-Jopara-Epoch-CPT-LoRA
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
