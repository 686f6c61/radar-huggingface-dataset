# kerasformers/qwen3.5-35b-a3b-base

## Resumen

`kerasformers/qwen3.5-35b-a3b-base` es una conversión íntegra al framework Keras 3 del modelo `Qwen/Qwen3.5-35B-A3B-Base` desarrollado por el equipo Qwen de Alibaba Cloud. Esta versión, publicada por el usuario kerasformers, permite ejecutar el modelo multimodal de mezcla de expertos (MoE) sin modificaciones sobre tres backends distintos: TensorFlow, PyTorch y JAX, gracias a la capa de abstracción de Keras 3. El modelo combina un codificador de visión con capacidades de lenguaje, sumando 35 mil millones de parámetros totales de los cuales solo 3 mil millones se activan durante la inferencia, lo que lo convierte en una opción eficiente para tareas que requieren comprender imágenes y texto simultáneamente.

Al tratarse de una conversión de pesos (no de un entrenamiento nuevo), la ficha se centra en las características del modelo original de Qwen, que incorpora una arquitectura MoE dispersa y atención híbrida. El modelo base está pensado para fine-tuning e investigación, no para uso conversacional directo. Su relevancia actual radica en la posibilidad de experimentar con un VLM de gran tamaño dentro del ecosistema Keras, aprovechando la portabilidad entre frameworks sin necesidad de migrar pesos ni adaptar código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (vision + texto) con atencion hibrida |
| Parametros totales | 35 B (segun informacion publica del modelo original) |
| Parametros activos | 3 B (segun informacion publica del modelo original) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos almacenados en bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (Keras 3, pesos en bfloat16) |

## Arquitectura y entrenamiento

El modelo original `Qwen3.5-35B-A3B-Base` pertenece a la familia Qwen3.5 MoE, que introduce un diseño de mezcla de expertos dispersa sobre la arquitectura densa estandar de Qwen3.5, junto con un mecanismo de atencion hibrida. Combina un codificador de vision con un modelo de lenguaje, permitiendo entradas de imagen y texto para generar respuestas textuales. La conversion de kerasformers mantiene los pesos originales en bfloat16 y proporciona una implementacion unificada en Keras 3, de modo que el mismo codigo puede ejecutarse en TensorFlow, PyTorch o JAX. No se dispone de informacion detallada sobre el proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, tecnicas de alineacion como RLHF o DPO) en la documentacion proporcionada.

## Capacidades

- Generacion de texto a partir de entradas mixtas de imagen y texto (image-text-to-text).
- Razonamiento multimodal basico, heredado del modelo base de Qwen.
- Soporte de tool calling y function calling: no se menciona explicitamente en la informacion disponible; se asume que depende del fine-tuning posterior.
- Capacidades de agente y razonamiento multi-paso: no documentadas para esta conversion.
- Multilingue: limitado a ingles segun la etiqueta de idioma.
- Integracion con Keras 3: permite cambiar de backend (JAX, PyTorch, TensorFlow) sin alterar el codigo de inferencia.

## Casos de uso

- Fine-tuning para respuesta visual de preguntas (VQA): el modelo base puede ajustarse con datasets especificos para responder preguntas sobre imagenes en dominios como medicina, industria o educacion.
- Generacion de descripciones de imagenes (captioning) en entornos de investigacion: su naturaleza MoE con 3 B de parametros activos reduce el coste computacional frente a modelos densos equivalentes.
- Experimentacion con tecnicas de adaptacion como LoRA o QLoRA sobre un VLM de gran tamano, aprovechando la flexibilidad de Keras 3 para probar distintos backends.
- Prototipado rapido de aplicaciones multimodales en entornos academicos o de I+D, donde la portabilidad entre frameworks facilita la integracion en pipelines existentes.
- Evaluacion comparativa de arquitecturas MoE multimodales frente a modelos densos, utilizando la implementacion de kerasformers como referencia reproducible.
- Desarrollo de sistemas de indexacion y busqueda visual-semantica: el modelo puede adaptarse para generar embeddings de imagenes y texto que permitan recuperacion multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 70 GB (35 B parametros x 2 bytes), por lo que se requiere una GPU con al menos 80 GB de memoria para cargar el modelo completo sin cuantizacion.
- GPU recomendadas: NVIDIA A100 80 GB, H100 80 GB o equivalentes con memoria suficiente.
- En GPU de consumo (RTX 4090 con 24 GB) no cabe el modelo en precision nativa; seria necesario aplicar cuantizacion (no disponible en esta conversion) o usar offloading a CPU, con penalizacion de rendimiento.
- Opciones de despliegue: al ser una implementacion Keras 3, puede ejecutarse en entornos que soporten TensorFlow, PyTorch o JAX. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para esta conversion especifica. El modelo original `Qwen3.5-35B-A3B-Base` comparte caracteristicas con otros MoE multimodales de la misma familia, pero no se incluyen cifras de rendimiento en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo base sin fine-tuning: no esta alineado para conversacion o instrucciones directas; su uso en produccion requiere un proceso de ajuste previo.
- Idioma limitado a ingles, lo que restringe su aplicacion en entornos multilingues.
- Riesgo de alucinaciones y errores factuales, comun en modelos de lenguaje generativos.
- Requisitos de memoria elevados (70 GB en bfloat16), lo que limita su despliegue en hardware de consumo sin cuantizacion adicional.
- La conversion a Keras 3 puede introducir diferencias menores de comportamiento respecto al modelo original en PyTorch, aunque no se documentan.
- No se garantiza soporte para tool calling, agentes u otras capacidades avanzadas sin fine-tuning especifico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kerasformers/qwen3.5-35b-a3b-base
- Modelo original en HuggingFace: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Base
- Repositorio GitHub de KerasFormers: https://github.com/IMvision12/KerasFormers
- Documentacion de Qwen3.5-MoE en KerasFormers: https://imvision12.github.io/KerasFormers/qwen3_5_moe/
- Coleccion HuggingFace de Qwen3.5-MoE: https://huggingface.co/collections/kerasformers/qwen35-moe-6a7eb77a1a41110f3195af09
- Articulo de HackerNoon sobre el modelo: https://hackernoon.com/qwen35-35b-a3b-the-multimodal-base-model-that-only-uses-3b-params
