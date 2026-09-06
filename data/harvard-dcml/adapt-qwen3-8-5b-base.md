# Harvard-DCML/ADAPT-Qwen3-8.5B-Base

## Resumen

ADAPT-Qwen3-8.5B-Base es un modelo de lenguaje denso desarrollado por Harvard-DCML que actúa como estudiante destilado de Qwen3-14B-Base mediante la técnica ADAPT. ADAPT, presentada en el artículo «Thinking at the Right Size: Amortized Distillation Across Post-Trained LLMs», permite interpolar el tamaño de un modelo post-entrenado sin necesidad de reentrenarlo, generando un continuo de modelos con distinto número de capas. El modelo se inicializó copiando capas alternas y las dos últimas capas del profesor, y se destiló con 4 000 millones de tokens (2B de The Pile deduplicado y 2B de la división de matemáticas de Llama-Nemotron), usando pérdidas de entropía cruzada, KL y coseno para igualar las activaciones del profesor. Su arquitectura es un transformer denso de la familia Qwen3, con alrededor de 8.5B parámetros según su nomenclatura y una longitud máxima de entrenamiento de 4096 tokens. La relevancia del modelo radica en su uso como componente para construir versiones intermedias, lo que permite explorar el equilibrio entre tamaño y rendimiento de forma eficiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3) |
| Parametros totales | 8.5B (aprox., según nomenclatura del modelo; recuento exacto no especificado) |
| Longitud de contexto | 4096 tokens (secuencia máxima de entrenamiento; no se indica la ventana de inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo es un transformer denso inicializado desde Qwen3-14B-Base copiando capas alternas y las dos últimas capas. Durante el entrenamiento se aplicó destilación con 2B de tokens de The Pile deduplicado y 2B de la división de matemáticas de Llama-Nemotron Post-Training Dataset. Las funciones de pérdida combinaron entropía cruzada, divergencia KL y distancia coseno por capa, con pesos de 0.1 y 10.0 respectivamente, para alinear las activaciones del estudiante con las del profesor. Los hiperparámetros usados fueron optimizador AdamW (betas 0.9/0.95, epsilon 1e-8), learning rate 3e-4 con scheduler coseno, warmup del 1%, weight decay 0.1, gradiente máximo 1.0, precisión bf16 y longitud máxima de secuencia 4096. La fase de preentrenamiento constó de 438 pasos y la de SFT de 700 pasos, ambas con batch efectivo de 1024. La innovación técnica clave es la transferencia de delta de pesos mediante la función `build_intermediate_model`, que permite generar modelos intermedios de distintos tamaños a partir de este estudiante y de una variante post-entrenada de Qwen3-14B-Base.

## Capacidades

- Generación de texto autoregresiva como modelo base de la familia Qwen3; no se han publicado evaluaciones específicas de rendimiento.
- Función principal: servir como estudiante en el proceso ADAPT para construir modelos intermedios de tamaño variable mediante transferencia de delta de pesos.
- No se documenta soporte de tool calling, function calling ni agentes en la información disponible.
- No se documentan capacidades multimodales (visión, audio) en la información disponible.
- No se especifican capacidades multilingües, aunque al heredar el tokenizador de Qwen3 podría ser compatible con múltiples idiomas; no hay confirmación explícita.

## Casos de uso

- Investigación en compresión y destilación de LLM: el modelo permite estudiar la técnica ADAPT y compararla con otras aproximaciones como poda o destilación clásica en términos de calidad y tamaño.
- Generación de familias de modelos a partir de un mismo base: con `build_intermediate_model` se pueden crear continuos de tamaño sin reentrenar desde cero, lo que facilita barridos de escala en entornos de investigación.
- Ajuste fino eficiente en infraestructura limitada: al tener un tamaño inferior al profesor (8.5B frente a 14B), reduce el coste de cómputo para experimentos de adaptación por dominio.
- Análisis de la degradación del rendimiento al reducir tamaño: permite medir cuánto pierde un modelo post-entrenado al interpolar con el estudiante, mediante la variación de `num_layers_to_patch`.
- Prototipado en GPUs de consumo medio: el modelo puede cuantizarse y ejecutarse en tarjetas como RTX 4090 para validar rápidamente hipótesis de investigación.
- Evaluación de técnicas de alineación de activaciones: las pérdidas de KL y coseno usadas en su entrenamiento lo convierten en un banco de pruebas para analizar la similitud de representaciones entre estudiantes y profesores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo asociado (arXiv:2608.22854) podría contener evaluaciones, pero no se facilitan datos concretos en la documentación.

## Requisitos de hardware

- Estimación orientativa de VRAM: en precisión bf16, un modelo de 8.5B requiere aproximadamente 17 GB de VRAM; en cuantización de 4 bits, del orden de 5 GB. No se han publicado requisitos oficiales.
- GPU recomendadas: para inferencia en bf16, una RTX 4090 (24 GB) o A100 (40 GB) son suficientes; para cuantización de 4 bits, tarjetas de consumo con 12 GB de VRAM (p. ej. RTX 3060 12 GB) podrían ejecutarlo.
- No se ha documentado soporte oficial de cuantización, por lo que las estimaciones anteriores son orientativas.
- Opciones de despliegue: compatible con el ecosistema de HuggingFace transformers; puede servirse con vLLM o TGI para aplicaciones de inferencia. No se indica compatibilidad explícita con llama.cpp u Ollama, aunque es posible si se convierte el modelo a GGUF.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Objetivo |
|---|---|---|---|---|
| ADAPT-Qwen3-8.5B-Base | 8.5B (aprox.) | 4096 (entrenamiento) | Apache 2.0 | Estudiante para ADAPT |
| Qwen3-8B-Base | 8B | no disponible | Apache 2.0 | Modelo base generalista |
| Qwen3-14B-Base | 14B | no disponible | Apache 2.0 | Profesor / modelo base |

## Limitaciones y advertencias

- Modelo base, no alineado para instrucciones: puede generar texto sin seguir indicaciones de usuario, lo que limita su uso directo en aplicaciones conversacionales.
- No se han documentado evaluaciones de sesgos ni de alucinación; existe riesgo inherente de contenido no deseado o factualmente incorrecto.
- El entrenamiento con solo 4B de tokens puede resultar en una calidad inferior en comparación con el profesor o con modelos base entrenados con volúmenes mucho mayores.
- La ventana de contexto durante el entrenamiento es de 4096 tokens, lo que restringe tareas que requieren contextos largos; no se informa del contexto real en inferencia.
- Dependencia de la técnica ADAPT: para obtener modelos intermedios es necesario utilizar el repositorio específico y comprender el proceso de transferencia de delta de pesos.
- La licencia Apache 2.0 permite uso comercial, pero no ofrece garantías de rendimiento ni soporte técnico.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/Harvard-DCML/ADAPT-Qwen3-8.5B-Base
- Artículo en arXiv: https://arxiv.org/abs/2608.22854
- Repositorio de ADAPT: https://github.com/dcml-lab/ADAPT
