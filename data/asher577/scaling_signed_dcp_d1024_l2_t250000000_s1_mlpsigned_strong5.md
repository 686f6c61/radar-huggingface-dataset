# asher577/scaling_signed_dcp_d1024_L2_t250000000_s1_mlpsigned_strong5

## Resumen

`scaling_signed_dcp_d1024_L2_t250000000_s1_mlpsigned_strong5` es un modelo de investigacion publicado por el usuario asher577 en Hugging Face. Se trata de un transformer con sparseidad en pesos (weight-sparse) entrenado segun el procedimiento descrito por Gao et al. (2025). No es un modelo de proposito general ni esta pensado para uso en produccion: es un artefacto experimental orientado al estudio del escalado de modelos con sparseidad estructural en los pesos y en las activaciones.

El modelo es muy pequeno: 2 capas, dimension de modelo de 1024, dimension de cabeza de 16 y un vocabulario de solo 4096 tokens. La longitud de contexto es de 512 tokens y el entrenamiento se realizo sobre 250 millones de tokens del dataset `jacobcd52/simplestories-tokenized`, usando el tokenizador de SimpleStories-1.25M. El objetivo declarado de sparseidad es una fraccion L0 de 0.01 (es decir, aproximadamente el 1 % de los pesos activos).

Su relevancia es exclusivamente de investigacion: sirve para reproducir y analizar los resultados de Gao et al. (2025) sobre sparseidad en pesos y activaciones, y para estudiar como se comporta el escalado de este tipo de arquitecturas en un regimen controlado y de bajo coste computacional. No dispone de model card con resultados de evaluacion, licencia declarada ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con sparseidad en pesos y activaciones (weight-sparse, segun Gao et al. 2025) |
| Parametros totales | no disponible (2 capas, d_model=1024, vocab=4096; el conteo exacto no se publica) |
| Parametros activos | no disponible (fraccion L0 objetivo de 0.01) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch_model.bin`) + `config.json` |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 2 capas con dimension de modelo 1024 y dimension de cabeza 16, lo que implica 64 cabezas de atencion. El vocabulario es de 4096 tokens y el contexto maximo de 512 tokens. La caracteristica diferencial es la sparseidad: el modelo declara sparseidad en pesos (weight sparsity) con una fraccion L0 objetivo de 0.01, ademas de sparseidad en activaciones. El nombre del checkpoint incluye la etiqueta `mlpsigned_strong5`, que sugiere una variante concreta del esquema de sparseidad aplicado a las capas MLP, aunque el autor no detalla el significado exacto de esa etiqueta en la model card.

El entrenamiento siguio el procedimiento de Gao et al. (2025) y consumio 250 millones de tokens del dataset `jacobcd52/simplestories-tokenized`, tokenizado con `SimpleStories/SimpleStories-1.25M`. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicional; tampoco se especifica la composicion detallada del dataset mas alla de su origen (SimpleStories, un corpus de historias sinteticas simples). El run de entrenamiento esta registrado en Weights & Biases (ver enlaces).

## Capacidades

- Generacion de texto a nivel de investigacion sobre el dominio de SimpleStories (historias sinteticas simples).
- Modelado de lenguaje causal con contexto limitado a 512 tokens.
- Sparseidad en pesos y activaciones como objeto de estudio (no como capacidad funcional de usuario).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles; el tokenizador y el dataset son de dominio especifico en ingles simple.
- No se documentan modos especiales (thinking, vision, audio).

## Casos de uso

- Reproduccion de experimentos de sparseidad: el checkpoint permite reproducir y verificar los resultados de Gao et al. (2025) sobre sparseidad en pesos y activaciones en un regimen de bajo coste.
- Estudio de escalado: al ser un modelo de 2 capas y 1024 de dimension, sirve como punto de datos en curvas de escalado que relacionan tamano, sparseidad y perdida.
- Analisis de sparsity inducida: permite inspeccionar que pesos y activaciones quedan activos con una fraccion L0 de 0.01 y comparar con variantes del mismo autor.
- Investigacion sobre eficiencia: util para medir el ahorro teorico de computo y memoria de la sparseidad estructural en transformers pequenos.
- Docencia y formacion: ejemplo minimo y reproducible de un transformer sparse entrenado con un pipeline documentado (W&B incluido).
- Baseline en experimentos de poda: sirve como referencia frente a tecnicas de pruning post-entrenamiento aplicadas al mismo dataset y tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 0,3 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100); el modelo es demasiado pequeno para aprovechar GPUs de datacenter.
- Cabe en GPU consumer: si, en practicamente todas las GPUs consumer de los ultimos diez anos, e incluso en CPU para inferencia a baja escala.
- Opciones de despliegue: el autor solo documenta carga manual con PyTorch (`torch.load` sobre `pytorch_model.bin` y `config.json`), requiriendo la clase del modelo SparseGPT del repositorio. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (transformers sparse de investigacion con sparseidad en pesos y activaciones y fraccion L0 de 0.01) con los que establecer una comparacion con datos verificables.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni para tareas de proposito general.
- Dominio muy restringido: entrenado solo con SimpleStories (historias sinteticas simples) y vocabulario de 4096 tokens; el rendimiento fuera de ese dominio sera muy pobre.
- Contexto muy corto: 512 tokens, insuficiente para la mayoria de aplicaciones reales.
- Sin licencia declarada: no se especifican condiciones de uso comercial; debe tratarse como no apto para uso comercial hasta que el autor lo aclare.
- Sin idiomas declarados: no hay garantia de comportamiento multilingue.
- Riesgo de alucinacion: alto, dado el tamano minimo del modelo y el dataset sintetico.
- Sesgos: no documentados; el dataset SimpleStories es sintetico y de dominio acotado.
- Dependencia de codigo externo: la carga requiere la clase SparseGPT del repositorio del autor, no incluida en el checkpoint; no es plug-and-play con `transformers`.
- Sin resultados de evaluacion publicados: no hay evidencia cuantitativa de calidad.

## Enlaces

- Hugging Face: https://huggingface.co/asher577/scaling_signed_dcp_d1024_L2_t250000000_s1_mlpsigned_strong5
- Run de Weights & Biases: https://wandb.ai/asher577/scd_scaling/runs/pe8fhpnt
- Dataset de entrenamiento: https://huggingface.co/datasets/jacobcd52/simplestories-tokenized
- Tokenizador: https://huggingface.co/SimpleStories/SimpleStories-1.25M
- Referencia del procedimiento: Gao et al. (2025), citado en la model card (enlace al paper no disponible)
