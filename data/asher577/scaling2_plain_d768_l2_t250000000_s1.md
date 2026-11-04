# asher577/scaling2_plain_d768_L2_t250000000_s1

## Resumen

`scaling2_plain_d768_L2_t250000000_s1` es un transformer de pesos dispersos (weight-sparse) entrenado por el usuario asher577 siguiendo el procedimiento descrito por Gao et al. (2025). Se trata de un experimento de escala de pequeno tamano: 2 capas, dimension de modelo 768, dimension de cabeza 16 y una longitud de contexto de 512 tokens. Su interes no reside en capacidades de uso general, sino en servir como punto de medida dentro de un estudio sobre el efecto de la dispersion de pesos y activaciones en modelos transformer.

El modelo emplea dispersion tanto en pesos (weight sparsity, con fraccion objetivo L0 de 0,01) como en activaciones (activation sparsity), y fue entrenado sobre el dataset `jacobcd52/simplestories-tokenized` con el tokenizer `SimpleStories/SimpleStories-1.25M`, acumulando 250 millones de tokens. El vocabulario es de solo 4096 tokens, lo que lo aleja de cualquier aplicacion practica de proposito general.

Es relevante ahora como artefacto de investigacion reproducible: el autor publica la configuracion exacta de la arquitectura, la run de Weights & Biases asociada y los pesos en formato PyTorch. No hay pipeline declarado, ni licencia, ni idiomas documentados, ni resultados de benchmarks, por lo que debe tratarse como material experimental y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con dispersion de pesos (weight-sparse) y dispersion de activaciones |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE declarado; la dispersion L0 es sobre pesos y activaciones) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch_model.bin`) |

Datos adicionales de arquitectura: 2 capas, dimension de modelo 768, dimension de cabeza 16, vocabulario de 4096 tokens. Fraccion L0 objetivo de 0,01 con dispersion de pesos y de activaciones activas.

## Arquitectura y entrenamiento

El modelo es un transformer de 2 capas con dimension de modelo 768 y dimension de cabeza 16, entrenado con el procedimiento de Gao et al. (2025) para transformers con pesos dispersos. La innovacion central es la combinacion de weight sparsity (fraccion L0 objetivo de 0,01, es decir, aproximadamente el 1 % de los pesos activos por unidad) con activation sparsity, lo que reduce el coste computacional efectivo en inferencia y permite estudiar como la dispersion interactua con el entrenamiento a distintas escalas.

El entrenamiento uso el dataset `jacobcd52/simplestories-tokenized` con el tokenizer `SimpleStories/SimpleStories-1.25M` y un total de 250 000 000 tokens. El dataset SimpleStories esta orientado a relatos sinteticos simples, lo que explica el vocabulario reducido de 4096 tokens y el contexto corto de 512. No se documenta en la informacion disponible si hubo RLHF, DPO u otras fases de alineamiento, ni la composicion detallada del dataset. La run de entrenamiento esta publicada en Weights & Biases (`scd_scaling/runs/24ctht9h`), lo que permite inspeccionar curvas de perdida y configuracion.

## Capacidades

- Generacion de texto a nivel de relatos sinteticos simples, limitada al dominio del dataset SimpleStories.
- Modelado de lenguaje autoregresivo basico con contexto de 512 tokens.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponible; el tokenizer de 4096 tokens esta disenado para un corpus concreto en ingles presumiblemente, pero no se declara.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).
- Capacidad destacable: es un banco de pruebas para estudiar dispersion de pesos y activaciones en transformers de pocas capas.

## Casos de uso

- Estudio de escalado de dispersion: usar el modelo como punto de comparacion en una curva de escalado que varie capas, dimension y fraccion L0, midiendo perdida y rendimiento para validar el procedimiento de Gao et al. (2025).
- Reproduccion de experimentos: cargar los pesos y la configuracion publicada para replicar la run de W&B y verificar la perdida reportada por el autor.
- Analisis de sparsity efectiva: inspeccionar los pesos para medir la fraccion de pesos activos real frente al objetivo L0 de 0,01 y estudiar patrones de dispersion.
- Investigacion de activation sparsity: instrumentar las activaciones durante la inferencia para medir que neuronas se activan y comparar con modelos densos equivalentes.
- Baseline para tokenizers pequenos: evaluar tecnicas de modelado de lenguaje con vocabularios de 4096 tokens y contextos de 512 en tareas de generacion de relatos sinteticos.
- Docencia y demostracion: ejemplo minimo y ligero (repo de 0,1 GB) para explicar transformers con pesos dispersos en cursos o talleres, sin necesidad de GPUs de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repo pesa 0,1 GB, lo que sugiere que el checkpoint cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente por el tamano del checkpoint; no se requieren A100 ni H100.
- Cabe en consumer GPU: si, con amplio margen, dado el tamano del repo (0,1 GB) y las 2 capas con dimension 768.
- Opciones de despliegue: el autor indica carga mediante `torch.load` y una clase `SparseGPT` del repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (transformers con dispersion de pesos y activaciones entrenados sobre SimpleStories), ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Modelo de investigacion de 2 capas y 250 millones de tokens: no apto para uso general ni para tareas fuera del dominio SimpleStories.
- Contexto muy corto (512 tokens), insuficiente para la mayoria de aplicaciones reales.
- Vocabulario de 4096 tokens: cobertura lexica muy limitada, con alta tasa de tokens desconocidos fuera del corpus de entrenamiento.
- Licencia no disponible: no se puede asumir permiso de uso comercial; verificar con el autor antes de cualquier uso.
- Idiomas soportados no declarados; no hay garantia de comportamiento multilingue.
- Riesgo de alucinacion: alto en cualquier uso fuera del dominio, dado el entrenamiento sobre relatos sinteticos y el tamano reducido.
- Sesgos conocidos: no documentados; el dataset SimpleStories puede introducir sesgos propios de relatos sinteticos, no evaluados.
- La carga requiere la clase `SparseGPT` del repositorio; no es compatible con `transformers` de forma directa segun la model card.
- Sin pipeline declarado, sin benchmarks y sin documentacion de cuantizacion: no hay evidencia de robustez para produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/asher577/scaling2_plain_d768_L2_t250000000_s1
- Run de entrenamiento en Weights & Biases: https://wandb.ai/asher577/scd_scaling/runs/24ctht9h
- Dataset de entrenamiento: https://huggingface.co/datasets/jacobcd52/simplestories-tokenized
- Tokenizer: https://huggingface.co/SimpleStories/SimpleStories-1.25M
- Referencia al procedimiento de Gao et al. (2025): no disponible enlace directo en la informacion proporcionada.
