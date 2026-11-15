# ayse-solmaz/Llama-3.2-1B-Instruct-tr-lora

## Resumen

Llama-3.2-1B-Instruct-tr-lora es un adaptador LoRA en desarrollo para el modelo base meta-llama/Llama-3.2-1B-Instruct, orientado a ajuste por instrucciones en turco. Lo publica la usuaria ayse-solmaz en Hugging Face bajo la librería PEFT, y su propósito es adaptar un modelo pequeño (1B parámetros) a tareas de generación de texto siguiendo instrucciones en turco, un idioma con menor representación en los corpus de alineamiento de los modelos abiertos de gran escala.

El adaptador se entrena con aproximadamente 6.500 pares instrucción-respuesta en turco, extraídos de la parte turca de CohereLabs/aya_dataset y de CausalLM/GPT-4-Self-Instruct-Turkish, reservando 250 ejemplos del split de test turco de Aya para evaluación. La configuración LoRA es r=16, alpha=32, aplicada a todas las capas lineales (q, k, v, o, gate, up, down), con 1 época, batch efectivo 16, learning rate 2e-4 con scheduler cosine, precisión fp16 y longitud máxima de 1024 tokens.

Es relevante ahora por dos motivos: por un lado, demuestra un flujo de trabajo de ajuste fino de bajo coste (entrenamiento en Kaggle con una NVIDIA T4) sobre un modelo de 1B parámetros; por otro, la model card advierte explícitamente de que el entrenamiento sigue en curso y que los pesos del adaptador, los resultados de test y los ejemplos de respuesta se añadirán cuando finalice. A fecha de la información disponible, el repositorio no contiene pesos publicados ni métricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) con adaptador LoRA (PEFT) |
| Parametros totales | 1B en el modelo base; el adaptador LoRA no declara recuento propio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento usa máximo 1024 tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se entrena en fp16; no se publican pesos cuantizados) |
| Idiomas soportados | turco (tr); el modelo base soporta multilingüe, pero el ajuste se limita al turco |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | adaptador PEFT/LoRA (no se especifica safetensors ni GGUF; no hay pesos publicados) |

## Arquitectura y entrenamiento

El modelo base es Llama 3.2 1B Instruct, un transformer decoder-only de Meta de aproximadamente 1.000 millones de parámetros. Sobre él se aplica un adaptador LoRA con r=16 y alpha=32 en todas las capas lineales (q, k, v, o, gate, up, down). La elección de la colocación de las capas LoRA se justifica en la model card a partir de un experimento previo de la autora sobre Qwen2.5-0.5B, documentado en el repositorio github.com/ayse-solmaz/turkish-lora-layers.

El entrenamiento usa unos 6.500 pares instrucción-respuesta en turco procedentes de CohereLabs/aya_dataset (parte turca) y CausalLM/GPT-4-Self-Instruct-Turkish. Se reservan 250 ejemplos del split de test turco de Aya como conjunto de evaluación, sin usarlos en entrenamiento. Los hiperparámetros son: 1 época, batch efectivo 16, learning rate 2e-4 con scheduler cosine, precisión fp16, longitud máxima de 1024 tokens y cálculo de la pérdida solo sobre los tokens de respuesta. El entrenamiento se ejecuta en Kaggle sobre una NVIDIA T4. No se documenta el uso de RLHF, DPO ni ninguna innovación técnica adicional más allá del ajuste LoRA supervisado.

## Capacidades

- Generación de texto en turco siguiendo instrucciones, como objetivo principal del ajuste.
- Ajuste por instrucciones (instruction tuning) sobre el modelo base Llama 3.2 1B Instruct.
- Herencia de las capacidades del modelo base (razonamiento básico, generación de código y matemáticas simples), aunque no se han publicado evaluaciones específicas del adaptador.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para el adaptador; depende de las capacidades del modelo base.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al turco por el alcance del ajuste; el modelo base es multilingüe pero no se evalúa aquí.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Asistentes conversacionales en turco para dominio general: el adaptador busca mejorar la calidad de las respuestas instruidas en turco sobre un modelo de 1B, adecuado para despliegues con recursos limitados.
- Prototipado rápido de aplicaciones de texto en turco: al ser un adaptador LoRA sobre un modelo de 1B, permite iterar con coste de cómputo bajo en una sola GPU consumer.
- Investigación en ajuste por instrucciones de bajo coste: sirve como referencia metodológica para entrenar adaptadores LoRA en Kaggle con una T4 y datasets públicos como Aya.
- Generación de respuestas en entornos con restricciones de memoria: un modelo de 1B cuantizado a 4 bits puede ejecutarse en GPUs de gama media, útil para demos y pruebas de concepto en turco.
- Experimentación con colocación de capas LoRA: el repositorio asociado documenta un estudio previo sobre qué capas lineales adaptar, aplicable a otros modelos pequeños.
- Evaluación comparativa de adaptadores turcos: el conjunto de test de 250 ejemplos de Aya permite medir la mejora frente al modelo base en tareas instruidas en turco, una vez publicados los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados de test y los ejemplos de respuesta se añadirán cuando finalice el entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 1B, en fp16 se requieren aproximadamente 2 GB solo para pesos, y en cuantización de 4 bits alrededor de 0,7-1 GB, más overhead de activaciones y contexto.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA T4 (Kaggle); para inferencia, una T4, RTX 3060/4060 o superiores son suficientes para un modelo de 1B.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM en cuantización de 4 bits; no confirmado por el autor.
- Opciones de despliegue: PEFT con transformers para cargar el adaptador; vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Llama-3.2-1B-Instruct-tr-lora | 1B (base) + LoRA | no disponible | llama3.2 | Adaptador en desarrollo, sin pesos publicados |
| meta-llama/Llama-3.2-1B-Instruct | 1B | no disponible en la informacion proporcionada | llama3.2 | Pesos públicos en Hugging Face |
| Qwen2.5-0.5B | 0,5B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Pesos públicos en Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El entrenamiento sigue en curso: no hay pesos del adaptador publicados, ni resultados de test, ni ejemplos de respuesta; el modelo no es utilizable tal cual.
- Sesgos conocidos: no documentados; el modelo base Llama 3.2 puede heredar sesgos de sus datos de preentrenamiento, y el ajuste con datos sintéticos (GPT-4-Self-Instruct-Turkish) puede introducir sesgos del generador.
- Riesgo de alucinación: no evaluado para este adaptador; los modelos de 1B tienen mayor propensión a errores factuales que modelos de mayor tamaño.
- Limitaciones de contexto e idioma: el ajuste usa máximo 1024 tokens y se limita al turco; el comportamiento fuera de ese idioma o con contextos más largos no está garantizado.
- Restricciones de licencia: sujeta a Llama 3.2 Community License y Acceptable Use Policy; el uso comercial requiere cumplir esas condiciones.
- Caveat para producción: al no existir pesos publicados ni métricas, no es apto para despliegue en producción en su estado actual.

## Enlaces

- Hugging Face: https://huggingface.co/ayse-solmaz/Llama-3.2-1B-Instruct-tr-lora
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Repositorio del experimento de colocación LoRA: https://github.com/ayse-solmaz/turkish-lora-layers
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Política de uso aceptable Llama 3.2: https://www.llama.com/llama3_2/use-policy/
- Dataset CohereLabs/aya_dataset: https://huggingface.co/datasets/CohereLabs/aya_dataset
- Dataset CausalLM/GPT-4-Self-Instruct-Turkish: https://huggingface.co/datasets/CausalLM/GPT-4-Self-Instruct-Turkish
