# shininnng/llm-course-hw3-tinyllama-qlora

## Resumen

`shininnng/llm-course-hw3-tinyllama-qlora` es un checkpoint de ajuste fino publicado en Hugging Face por el usuario `shininnng`, presumiblemente como entrega de un trabajo practico de un curso sobre modelos de lenguaje (el identificador incluye `llm-course-hw3`). El nombre indica que se parte de TinyLlama y se aplica QLoRA, aunque la model card no lo confirma de forma explicita. El repositorio tiene 300.031.872 parametros segun los pesos en safetensors, lo que encaja con un modelo del orden de 300 millones de parametros, no con los 1.100 millones de TinyLlama original; por tanto, el identificador no debe tomarse como especificacion fiable.

La model card es la plantilla automatica de Hugging Face sin rellenar: todos los campos de desarrollo, datos de entrenamiento, licencia, idiomas y evaluacion figuran como `[More Information Needed]`. El unico dato tecnico declarado en los metadatos es el pipeline `text-generation`, la libreria `transformers`, el tag `mistral` (que sugiere una arquitectura tipo Mistral, no TinyLlama) y los tags `trl` y `sft`, que indican un ajuste supervisado con la libreria TRL.

Por su naturaleza, el modelo no es un artefacto listo para produccion sino un ejercicio academico. Resulta relevante unicamente como referencia para quien quiera reproducir el flujo QLoRA + SFT, inspeccionar el resultado de un ajuste fino pequeno o comparar hiperparametros; no hay evidencia publicada de calidad, evaluacion ni soporte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag `mistral` en metadatos; no confirmado en model card) |
| Parametros totales | 300.031.872 (safetensors) |
| Parametros activos | no aplica (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el nombre sugiere QLoRA en entrenamiento, no cuantizacion de inferencia publicada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura concreta. Los metadatos incluyen el tag `mistral`, lo que apunta a una implementacion de tipo transformer decoder-only con atencion agrupada (GQA) y posible sliding window attention, pero la model card no lo confirma ni detalla numero de capas, dimension oculta, cabezas de atencion ni vocabulario. El recuento de 300 millones de parametros es incompatible con TinyLlama (1,1 B), de modo que o bien el checkpoint es un modelo base distinto, o bien los pesos publicados corresponden a un subconjunto (por ejemplo, solo adaptadores fusionados de un modelo mayor, lo que no cuadraria con el tamano del repo de 1,2 GB).

El entrenamiento se realizo con TRL en modo SFT (supervised fine-tuning), segun los tags `trl` y `sft`. El nombre del repositorio indica QLoRA, es decir, cuantizacion de 4 bits del modelo base durante el ajuste con adaptadores de bajo rango. No se especifican dataset, numero de tokens, hiperparametros (rango LoRA, alpha, learning rate, epochs), ni si hubo etapas posteriores de alineamiento como DPO o RLHF. Tampoco se documenta la infraestructura de computo ni el impacto ambiental.

## Capacidades

- Generacion de texto autoregresiva basica, heredada del modelo base y del ajuste SFT.
- Ajuste supervisado sobre instrucciones o pares pregunta-respuesta, segun el flujo TRL SFT (contenido del dataset no disponible).
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente ni razonamiento multi-paso.
- Soporte multilingue: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- No se documenta ninguna capacidad verificada mediante evaluacion.

## Casos de uso

- Reproduccion de un pipeline QLoRA + SFT: util como referencia para comparar hiperparametros y curvas de perdida en un ejercicio docente, no como modelo desplegable.
- Inspeccion de pesos y configuracion: permite estudiar como queda un checkpoint tras un ajuste con TRL en un modelo pequeno (300 M de parametros) sin necesidad de GPU de gama alta.
- Pruebas de integracion con `transformers` y `text-generation-inference`: sirve para validar que un pipeline de carga y generacion funciona antes de pasar a modelos mayores.
- Experimentos de cuantizacion: al ser pequeno, se puede cuantizar a 8 o 4 bits en una sola GPU consumer para medir degradacion, aunque el autor no publica variantes GGUF.
- Docencia y formacion interna: ejemplo de como NO documentar una model card, util para talleres sobre buenas practicas de publicacion de modelos.
- Base para un ajuste adicional propio: punto de partida barato para experimentar con SFT sobre un dominio concreto, asumiendo que habra que reentrenar y evaluar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 0,6-0,7 GB solo para pesos (300 M de parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, menos de 2 GB.
- VRAM estimada en cuantizacion 8 bits: aproximadamente 0,35 GB para pesos; en 4 bits, aproximadamente 0,2 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); tambien cabe en CPU.
- Cabe en GPU consumer: si, con margen amplio, incluidas GPUs de portatil con 4-6 GB de VRAM.
- Opciones de despliegue: `transformers` (libreria declarada), `text-generation-inference` (tag `endpoints_compatible`); llama.cpp u Ollama requeririan conversion a GGUF, no publicada.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| shininnng/llm-course-hw3-tinyllama-qlora | 300 M | no disponible | no disponible | Hugging Face, 0 descargas |
| TinyLlama-1.1B-Chat | 1,1 B | 2.048 tokens (tipico) | Apache 2.0 (segun el proyecto original) | Hugging Face, ampliamente usado |
| Qwen2.5-0.5B-Instruct | 0,5 B | 32.768 tokens | Apache 2.0 | Hugging Face, muy extendido |
| SmolLM2-360M-Instruct | 360 M | 8.192 tokens | Apache 2.0 | Hugging Face, con evaluacion publica |

La comparacion es orientativa: los tres modelos de referencia tienen model card completa, evaluacion y licencia clara, mientras que el checkpoint analizado carece de todos esos datos. No hay benchmarks que permitan situarlo frente a ellos.

## Limitaciones y advertencias

- Model card sin rellenar: no hay informacion sobre datos de entrenamiento, sesgos, idiomas ni uso previsto, lo que impide evaluar riesgos.
- Licencia no disponible: no se puede asumir uso comercial; hay que contactar con el autor o tratar el modelo como no licenciado.
- Riesgo elevado de alucinacion y de respuestas incoherentes: no hay evaluacion publicada y el ajuste parece academico.
- El identificador del repositorio menciona TinyLlama, pero el recuento de parametros no coincide; la procedencia real del modelo base es incierta.
- Sin garantia de soporte, mantenimiento ni actualizaciones (0 descargas, 0 likes, creado y actualizado en el mismo minuto).
- No apto para produccion: no hay variantes cuantizadas, ni tokenizer documentado, ni ejemplos de uso.
- Posible contaminacion o sobreajuste al dataset del curso, no documentado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/shininnng/llm-course-hw3-tinyllama-qlora
- Paper citado en la model card (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora ML Impact: https://mlco2.github.io/impact
- Documentacion de TRL (libreria de entrenamiento declarada): https://huggingface.co/docs/trl
- Documentacion de text-generation-inference: https://huggingface.co/docs/text-generation-inference
