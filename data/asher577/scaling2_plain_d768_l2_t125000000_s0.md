# asher577/scaling2_plain_d768_L2_t125000000_s0

## Resumen

`scaling2_plain_d768_L2_t125000000_s0` es un transformer de pesos dispersos (weight-sparse) publicado por el usuario asher577 en HuggingFace, entrenado siguiendo el procedimiento descrito por Gao et al. (2025). No se trata de un modelo instructivo ni de un asistente conversacional: es un artefacto de investigacion disenado para estudiar el escalado de modelos con dispersidad estructural en pesos y activaciones, sobre un corpus sintetico de historias simples (SimpleStories).

El modelo es extremadamente pequeno: 2 capas, dimension de modelo 768, dimension de cabeza 16, vocabulario de 4096 tokens y una longitud de contexto de 512 tokens. Se entreno con 125 millones de tokens del dataset `jacobcd52/simplestories-tokenized` y aplica una fraccion objetivo L0 de 0,01 (es decir, aproximadamente el 1% de los pesos activos). El repositorio ocupa solo 0,1 GB y los pesos se distribuyen en formato PyTorch (`.bin`).

Su relevancia es puramente metodologica: sirve como punto de datos en un barrido de escalado (scaling) para comparar la eficiencia de arquitecturas dispersas frente a densas en regimenes de computo muy reducidos. No esta pensado para uso en produccion, no dispone de model card orientada a usuarios finales y no declara licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer weight-sparse (Gao et al., 2025) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (dispersidad L0 objetivo de 0,01 sobre pesos) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `.bin`; sin GGUF ni safetensors publicados) |
| Idiomas soportados | no disponible (entrenado sobre SimpleStories, corpus sintetico en ingles) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch_model.bin`) + `config.json` |

Otros parametros declarados en la model card: 2 capas, dimension de modelo 768, dimension de cabeza 16, vocabulario de 4096 tokens, dispersidad en pesos activada, dispersidad en activaciones activada, L0 objetivo 0,01.

## Arquitectura y entrenamiento

La arquitectura es un transformer de 2 capas con dimension de modelo 768 y dimension de cabeza 16, lo que implica 48 cabezas de atencion por capa (768 / 16). El vocabulario es de 4096 tokens, coherente con el tokenizador `SimpleStories/SimpleStories-1.25M` empleado. La innovacion principal no reside en el bloque transformer en si, sino en el regimen de dispersidad: el modelo se entrena con pesos dispersos y activaciones dispersas, con una fraccion L0 objetivo de 0,01, siguiendo la receta de Gao et al. (2025). Esto lo convierte en una pieza de un estudio de escalado sobre eficiencia de parametros, no en un modelo de proposito general.

El entrenamiento consume 125 millones de tokens del dataset `jacobcd52/simplestories-tokenized`, un corpus sintetico de historias simples generado para experimentos controlados de escalado. No se documenta en la informacion disponible el uso de RLHF, DPO ni ninguna fase de alineacion; tampoco se detalla la composicion exacta del dataset ni la mezcla de datos. El run de entrenamiento esta registrado en Weights & Biases (`asher577/scd_scaling/runs/ejvlvwbm`), lo que sugiere que el autor mantiene trazabilidad experimental, pero los detalles numericos de la curva de perdida no se han publicado en la model card.

## Capacidades

- Generacion de texto autoregresiva limitada al dominio de SimpleStories (micro-relatos sinteticos en ingles).
- Modelado de lenguaje a nivel de token con vocabulario reducido (4096 entradas).
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingues; el corpus de entrenamiento es sintetico y en ingles.
- No tiene modo thinking, vision, audio ni ninguna modalidad adicional.
- No es un modelo instructivo: no hay plantilla de chat ni formato de instrucciones publicado.

## Casos de uso

- Reproduccion de experimentos de escalado: el modelo sirve como punto de control en un barrido que varia profundidad (L2), dimension (d768) y tokens (125M) para estudiar leyes de escalado con pesos dispersos.
- Investigacion sobre dispersidad en pesos: permite medir el impacto de una fraccion L0 de 0,01 en la perplejidad y en la calidad de generacion frente a una contraparte densa equivalente.
- Estudio de dispersidad en activaciones: al activar sparsity en activaciones, es util para analizar patrones de activacion y comparar con implementaciones densas del mismo tamano.
- Benchmark de juguete para pipelines de entrenamiento: su tamano (0,1 GB) permite iterar rapidamente sobre infraestructura de entrenamiento y evaluacion sin coste de GPU significativo.
- Analisis de tokenizadores de vocabulario reducido: con 4096 tokens, sirve para estudiar el efecto del tamano de vocabulario en modelos pequenos sobre corpus sinteticos.
- Docencia y divulgacion: util como ejemplo minimo y reproducible de transformer disperso para explicar conceptos de poda, L0 y eficiencia computacional en cursos o tutoriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa, dado el tamano del repositorio (0,1 GB) y la configuracion de 2 capas con d=768.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien cabe en CPU.
- Cabe en GPU consumer: si, sin restricciones practicas de memoria.
- Opciones de despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI. La carga requiere la clase `SparseGPT` del repositorio del autor y `torch.load` sobre `pytorch_model.bin`.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables del mismo autor ni referencias a contrapartes densas del mismo barrido de escalado. Cualquier comparacion con modelos de la misma categoria (transformers de 2 capas y d=768 entrenados sobre SimpleStories) requeriria datos que no se han publicado en la model card.

## Limitaciones y advertencias

- Modelo de investigacion sin licencia declarada: no se puede asumir permiso de uso comercial.
- Entrenado exclusivamente sobre un corpus sintetico de historias simples; la generacion fuera de ese dominio sera de baja calidad y probablemente incoherente.
- Ventana de contexto muy corta (512 tokens), insuficiente para la mayoria de aplicaciones reales.
- Vocabulario de 4096 tokens: cobertura lexica muy limitada, con riesgo alto de tokens desconocidos o fragmentacion excesiva en texto real.
- Riesgo elevado de alucinacion y de degeneracion en generaciones largas, dado el bajo numero de parametros y la escasez de datos.
- No hay evaluacion de sesgos publicada; al entrenarse sobre datos sinteticos, los sesgos reflejan las decisiones del generador del corpus.
- Sin plantilla de chat ni ajuste por instrucciones: no debe usarse como asistente.
- La carga requiere codigo especifico del autor (`SparseGPT`); no es compatible de forma directa con `transformers` ni con herramientas estandar de inferencia.
- No se han publicado parametros totales ni activos, lo que dificulta estimar el coste computacional real del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/asher577/scaling2_plain_d768_L2_t125000000_s0
- Run de entrenamiento en Weights & Biases: https://wandb.ai/asher577/scd_scaling/runs/ejvlvwbm
- Dataset de entrenamiento: https://huggingface.co/datasets/jacobcd52/simplestories-tokenized
- Tokenizador: https://huggingface.co/SimpleStories/SimpleStories-1.25M
- Referencia metodologica: Gao et al. (2025), citado en la model card; no se proporciona URL directa en la informacion disponible.
