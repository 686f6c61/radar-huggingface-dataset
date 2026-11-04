# asher577/scaling2_plain_d512_L2_t250000000_s1

## Resumen

`scaling2_plain_d512_L2_t250000000_s1` es un transformer de pesos dispersos (weight-sparse) publicado por el usuario asher577 en HuggingFace. Se trata de un artefacto de investigación asociado a un estudio de escalado sobre dispersión de pesos, entrenado siguiendo el procedimiento descrito por Gao et al. (2025). No es un modelo de propósito general ni está pensado para uso en producción: es una pieza de un experimento controlado sobre cómo afecta la dispersión estructurada a modelos de tamaño reducido.

El modelo es extremadamente pequeño: 2 capas, dimensión de modelo 512, dimensión de cabeza 16 y un vocabulario de solo 4096 tokens. Su longitud de contexto es de 512 tokens y fue entrenado sobre 250 millones de tokens del dataset SimpleStories, un corpus de historias sintéticas simples. La combinación de tamaño mínimo y vocabulario reducido lo sitúa en la categoría de modelos de juguete para investigación, no de asistentes utilizables.

Su relevancia es puramente metodológica: permite estudiar el efecto de la dispersión de pesos (target L0 fraction de 0.01) y de la dispersión de activaciones en un régimen de escalado pequeño, con un coste computacional trivial. Cualquier evaluación práctica de sus capacidades lingüísticas debe enmarcarse en ese contexto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con dispersión de pesos y de activaciones (weight-sparse) |
| Parametros totales | no disponible (2 capas, d_model=512, vocab=4096; el recuento exacto no se publica) |
| Parametros activos | no disponible (no es un MoE; aplica dispersión L0 sobre pesos) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre SimpleStories, corpus sintético en inglés) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch_model.bin`) y `config.json` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 2 capas con dimensión de modelo 512 y dimensión de cabeza 16 (lo que implica 32 cabezas de atención). El rasgo distintivo es la dispersión de pesos: el modelo se entrena con un objetivo de fracción L0 de 0.01, es decir, se induce que solo una fracción mínima de los pesos sea distinta de cero, siguiendo el procedimiento de Gao et al. (2025). Además, el modelo declara dispersión de activaciones, lo que sugiere que las representaciones intermedias también presentan un patrón disperso controlado durante el entrenamiento.

El entrenamiento se realizó sobre 250 millones de tokens del dataset `jacobcd52/simplestories-tokenized`, tokenizado con el tokenizer de SimpleStories-1.25M, que fija el vocabulario en 4096 tokens. No se documenta el uso de RLHF, DPO ni fases de alineación; el objetivo es un modelado de lenguaje autoregresivo estándar sobre un corpus sintético de historias. El run de entrenamiento está registrado en Weights & Biases bajo el proyecto `scd_scaling`, lo que confirma que forma parte de una batería de experimentos de escalado con distintas configuraciones de tamaño y tokens.

## Capacidades

- Generación de texto autoregresiva sobre el dominio restringido de SimpleStories (historias sintéticas simples).
- Modelado de lenguaje a nivel de token con vocabulario de 4096 entradas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe; el corpus de entrenamiento es sintético y de dominio muy acotado.
- No se documenta modo de razonamiento (thinking), visión, audio ni ninguna modalidad adicional.
- El interés técnico reside en su comportamiento bajo dispersión de pesos y activaciones, no en capacidades funcionales.

## Casos de uso

- Investigación sobre dispersión de pesos: el modelo sirve como punto de datos en estudios de escalado que correlacionan la fracción L0 objetivo con la calidad del modelado de lenguaje en regímenes pequeños.
- Reproducción de experimentos de Gao et al. (2025): permite replicar el procedimiento de entrenamiento con dispersión de pesos y activaciones sobre un corpus controlado.
- Estudio de eficiencia de inferencia con pesos dispersos: al tener 2 capas y d_model 512, es viable medir el impacto de la dispersión en latencia y uso de memoria en hardware de gama baja.
- Análisis de tokenizers de vocabulario reducido: con 4096 tokens, sirve para evaluar cómo afecta un vocabulario mínimo a la calidad de generación en corpus sintéticos.
- Docencia y prototipado de pipelines de entrenamiento: el modelo y su run de W&B constituyen un ejemplo completo y de bajo coste de un ciclo de entrenamiento con registro experimental.
- Comparación de técnicas de poda frente a entrenamiento disperso nativo: al declarar dispersión de pesos desde el entrenamiento, puede usarse como referencia frente a modelos densos podados a posteriori del mismo tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 dado el tamaño reducido del repositorio (0.0 GB reportados) y la configuracion de 2 capas con d_model 512.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060, RTX 3060, RTX 4090) es mas que suficiente; tambien es viable en CPU.
- Cabe en cualquier GPU consumer y en entornos sin GPU dedicada.
- Opciones de despliegue: al no disponer de pesos en formato GGUF ni integracion con frameworks estandar, la carga requiere la clase `SparseGPT` del repositorio original y `torch.load` sobre `pytorch_model.bin`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `scaling2_plain_d512_L2_t250000000_s1` | no disponible (2 capas, d_model 512) | 512 | no disponible | HuggingFace, pesos PyTorch |
| Modelos de juguete tipo TinyStories (p. ej. variantes de 1-10M) | ~1-10M | 256-1024 | habitualmente MIT/Apache-2.0 | HuggingFace, amplia comunidad |
| Modelos densos pequenos de referencia (p. ej. GPT-2 small) | 124M | 1024 | MIT | HuggingFace, ecosistema estandar |

La comparacion directa con alternativas concretas no esta disponible en la informacion proporcionada; los modelos citados se incluyen solo como referencias de categoria y sus datos deben verificarse en sus respectivas fichas.

## Limitaciones y advertencias

- Modelo de investigacion sin fases de alineacion: no se documenta RLHF, DPO ni filtrado de seguridad, por lo que puede generar contenido inapropiado incluso en su dominio.
- Riesgo alto de alucinacion y de incoherencia fuera del dominio de SimpleStories; el corpus de entrenamiento es sintetico y de complejidad muy baja.
- Contexto limitado a 512 tokens, insuficiente para la mayoria de aplicaciones reales.
- Vocabulario de solo 4096 tokens, lo que restringe severamente la cobertura lexica y la calidad de generacion en lenguaje natural general.
- Idiomas soportados no documentados; el entrenamiento sobre un corpus sintetico en ingles no garantiza un comportamiento multilingue util.
- Licencia no disponible: no se puede asumir permiso para uso comercial; es imprescindible contactar con el autor antes de cualquier uso fuera de investigacion.
- La carga requiere codigo especifico (clase `SparseGPT` del repositorio) y no es compatible con los pipelines estandar de `transformers` sin adaptacion.
- No apto para produccion: sin benchmarks, sin evaluacion de sesgos y sin garantias de estabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/asher577/scaling2_plain_d512_L2_t250000000_s1
- Run de entrenamiento en Weights & Biases: https://wandb.ai/asher577/scd_scaling/runs/3xlnmp7i
- Dataset de entrenamiento: https://huggingface.co/datasets/jacobcd52/simplestories-tokenized
- Tokenizer: https://huggingface.co/SimpleStories/SimpleStories-1.25M
