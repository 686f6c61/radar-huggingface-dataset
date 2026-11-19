# kseniamakeevaa/llm-course-hw3-lora

## Resumen

`kseniamakeevaa/llm-course-hw3-lora` es un modelo de generacion de texto publicado en Hugging Face por la usuaria kseniamakeevaa, presumiblemente como entrega de un trabajo practico de un curso sobre modelos de lenguaje (el identificador incluye `llm-course-hw3-lora`). El nombre y la tag `mistral` sugieren que se trata de un ajuste fino mediante LoRA sobre un modelo base de la familia Mistral, aunque la model card no lo confirma de forma explicita.

El repositorio contiene 300.031.872 parametros segun los metadatos de safetensors (aproximadamente 300 millones), lo que lo situa en la categoria de modelos pequenos, muy por debajo de los 7B habituales de Mistral. Esta cifra es compatible con un modelo tipo GPT-2 small/medium o con un ajuste sobre una base pequena, pero no con un Mistral 7B. El tamano del repo es de 1.2 GB.

La relevancia practica del modelo es limitada: se trata de un artefacto de curso, sin model card completada (todos los campos aparecen como "[More Information Needed]"), sin descargas ni likes, y sin informacion sobre licencia, idiomas, datos de entrenamiento o evaluacion. Resulta util como ejemplo de pipeline de fine-tuning con LoRA en `transformers`, pero no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag `mistral`; probablemente transformer decoder-only) |
| Parametros totales | 300.031.872 |
| Parametros activos | no aplica (no hay indicios de MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se han publicado GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura. La tag `mistral` en el repositorio apunta a una posible base de la familia Mistral, pero el recuento de parametros (300 M) no coincide con ningun modelo publico conocido de esa familia, por lo que la tag podria ser meramente descriptiva o heredada de la configuracion del curso. El sufijo `lora` indica que el ajuste se realizo con Low-Rank Adaptation, una tecnica de fine-tuning eficiente en parametros que congela los pesos del modelo base e inserta matrices de bajo rango entrenables en las capas de atencion y, opcionalmente, en las capas feed-forward.

La model card no documenta el dataset de entrenamiento, el numero de tokens, la composicion de los datos, ni si hubo etapas de RLHF o DPO. Tampoco se especifican hiperparametros de entrenamiento, regimen de precision (fp16, bf16), hardware utilizado ni tiempos de computo. La unica referencia tecnica presente en el repositorio es el enlace al paper `arxiv:1910.09700` (Lacoste et al., 2019) sobre estimacion de emisiones de carbono, que aparece en la plantilla generica de la model card y no constituye una innovacion del modelo.

## Capacidades

- Generacion de texto autoregresiva, segun la pipeline declarada (`text-generation`).
- Conversacion multi-turno, segun la tag `conversational`.
- Compatibilidad con `text-generation-inference` y con endpoints, segun las tags del repositorio.
- No hay evidencia de soporte de tool calling, function calling ni razonamiento multi-paso.
- No hay evidencia de capacidades multimodales (vision, audio) ni de modo "thinking".
- Capacidades multilingues: no disponibles; no se declara ningun idioma.
- Razonamiento, codigo y matematicas: no documentados ni evaluados.

## Casos de uso

- Docencia y practica de fine-tuning: el modelo sirve como referencia de un pipeline completo de LoRA sobre `transformers`, util para comparar configuraciones de entrenamiento en un curso.
- Experimentos de investigacion sobre adaptadores de bajo rango: al ser un checkpoint pequeno (300 M parametros), permite iterar rapidamente en entornos con recursos limitados.
- Prototipado de chatbots conversacionales simples: la tag `conversational` sugiere uso en dialogos, aunque sin evaluacion publica no puede recomendarse para produccion.
- Pruebas de integracion con `text-generation-inference`: las tags indican compatibilidad con TGI y endpoints, lo que permite validar despliegues en infraestructura de inferencia estandar.
- Benchmarking de herramientas de cuantizacion: al ser un modelo pequeno, es adecuado para medir latencia y memoria en GPUs de consumo antes de escalar a modelos mayores.
- Educacion sobre riesgos de modelos no documentados: sirve como caso de estudio de por que una model card incompleta impide el uso responsable en entornos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,6 GB solo para pesos (300 M parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, menos de 2 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,3 GB para pesos; en 4 bits, aproximadamente 0,15 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien cabe en CPU para inferencia de baja latencia.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 4 GB de VRAM.
- Opciones de despliegue: `transformers` (libreria declarada), `text-generation-inference` (tag del repo), endpoints compatibles. No se han publicado pesos GGUF, por lo que `llama.cpp` y `Ollama` requeririan conversion previa.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `kseniamakeevaa/llm-course-hw3-lora` | 300 M | no disponible | no disponible | Hugging Face, 0 descargas |
| GPT-2 (small/medium) | 124 M / 355 M | 1024 tokens | MIT | Ampliamente disponible |
| TinyLlama 1.1B | 1,1 B | 2048 tokens | Apache 2.0 | Hugging Face, muy usado |
| Qwen2.5-0.5B | 0,49 B | 32 768 tokens | Apache 2.0 | Hugging Face, muy usado |

La comparacion es orientativa: el modelo analizado carece de documentacion publica sobre contexto, licencia y rendimiento, por lo que no puede contrastarse en igualdad de condiciones con alternativas establecidas.

## Limitaciones y advertencias

- Model card practicamente vacia: todos los campos de informacion relevante aparecen como "[More Information Needed]".
- Licencia no declarada: no puede asumirse uso comercial; en ausencia de licencia explicita, los derechos de uso son inciertos.
- Idiomas no declarados: no hay garantia de calidad en castellano ni en ningun otro idioma.
- Sin evaluacion publica: no existen benchmarks, por lo que se desconoce el riesgo de alucinacion y la calidad real de las respuestas.
- Sin informacion sobre sesgos: no se ha documentado la composicion del dataset de entrenamiento ni posibles sesgos.
- Contexto desconocido: no puede planificarse su uso en tareas que requieran ventanas largas.
- Artefacto de curso: sin mantenimiento, sin descargas y sin comunidad; no es adecuado como dependencia en produccion.
- La tag `mistral` no es coherente con el recuento de parametros, lo que sugiere metadatos poco fiables.

## Enlaces

- Hugging Face: https://huggingface.co/kseniamakeevaa/llm-course-hw3-lora
- Paper citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental ML: https://mlco2.github.io/impact#compute
