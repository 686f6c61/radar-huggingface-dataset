# asher577/scaling2_plain_d768_L2_t500000000_s1

## Resumen

`scaling2_plain_d768_L2_t500000000_s1` es un transformer de pesos dispersos (weight-sparse) de pequeno tamano publicado por el usuario asher577 en HuggingFace. Se trata de un artefacto de investigacion, no de un modelo de proposito general: su card indica explicitamente que ha sido entrenado con el procedimiento descrito en Gao et al. (2025) y que su objetivo es estudiar el comportamiento de la dispersion de pesos y activaciones en un regimen controlado de escalado.

El modelo tiene solo 2 capas, una dimension de modelo de 768, una dimension de cabeza de 16 y un vocabulario de 4096 tokens, con una longitud de contexto de 512 tokens. Se ha entrenado durante 500 millones de tokens sobre el dataset SimpleStories (jacobcd52/simplestories-tokenized) usando el tokenizador SimpleStories-1.25M, es decir, un corpus de historias sinteticas sencillas en ingles. El repositorio ocupa aproximadamente 0,1 GB, lo que confirma su naturaleza compacta.

Su relevancia es metodologica: sirve como punto de medida dentro de un barrido de escalado (`scd_scaling` en Weights & Biases) para evaluar tecnicas de sparsification estructural. No dispone de pipeline declarado, licencia, idiomas ni resultados de benchmarks publicados en la informacion disponible, por lo que no debe considerarse un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con dispersión de pesos (weight-sparse) y dispersión de activaciones |
| Parametros totales | no disponible (2 capas, d_model=768, vocab=4096) |
| Parametros activos | no disponible (no es MoE; la dispersión es a nivel de pesos, no de expertos) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre SimpleStories, corpus sintetico en ingles) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch_model.bin`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 2 capas con dimension de modelo 768 y dimension de cabeza 16 (lo que implica 48 cabezas de atencion). El vocabulario es de 4096 tokens y la ventana de contexto es de 512. La innovacion principal es la aplicacion de dispersión de pesos con un objetivo de fraccion L0 de 0,01, combinada con dispersión de activaciones. El procedimiento de entrenamiento sigue la metodologia de Gao et al. (2025), orientada a obtener modelos con matrices de pesos mayoritariamente nulas sin degradar la calidad de forma desproporcionada.

El entrenamiento consume 500 millones de tokens del dataset SimpleStories tokenizado con el tokenizador SimpleStories-1.25M. No se indica en la informacion disponible si hubo fases de RLHF, DPO u otro ajuste posterior, ni se detalla la composicion exacta del dataset mas alla de su origen. El modelo esta pensado como unidad experimental dentro de un barrido de escalado (run `0es4pg0o` en el proyecto `scd_scaling` de W&B), no como un modelo entrenado para uso final.

## Capacidades

- Generacion de texto a nivel de continuacion de historias simples, limitada por el corpus de entrenamiento (SimpleStories).
- Modelado de lenguaje autoregresivo basico con contexto de 512 tokens.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues no disponibles; el entrenamiento se limita a un corpus sintetico en ingles.
- No dispone de modo thinking, vision, audio ni capacidades multimodales.
- Su interes practico es como objeto de estudio de tecnicas de sparsification, no como generador de proposito general.

## Casos de uso

- Investigacion en sparsification: servir como punto de referencia en un barrido de escalado para medir el efecto de la fraccion L0 (0,01) sobre la calidad del modelo en funcion del numero de tokens de entrenamiento.
- Reproducibilidad de resultados: al estar vinculado a un run publico de W&B y a un procedimiento publicado (Gao et al., 2025), permite reproducir y auditar experimentos de dispersion de pesos.
- Estudio de dispersión de activaciones: analizar como se comportan las activaciones bajo un regimen de pesos dispersos en un modelo de solo 2 capas y contexto corto.
- Pruebas de pipelines de entrenamiento a pequena escala: validar codigo de entrenamiento, tokenizacion y evaluacion con un modelo de 0,1 GB antes de escalar a configuraciones mayores.
- Analisis de eficiencia teorica: evaluar el ahorro de computo y memoria que ofrece la dispersion de pesos en un modelo compacto, como paso previo a su aplicacion en modelos mayores.
- Docencia y divulgacion: ilustrar de forma tangible que es un transformer con pesos dispersos y como se mide su calidad frente a un modelo denso equivalente.
- No es adecuado para atencion al cliente, generacion de codigo en produccion, agentes ni aplicaciones multilingues, dado su tamano, corpus y contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio pesa 0,1 GB, por lo que el modelo cabe holgadamente en cualquier GPU consumer (incluso en CPU).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; una RTX 4090 o A100 estarian sobredimensionadas para este modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1060 en adelante) e incluso en CPU.
- Opciones de despliegue: la card solo documenta carga manual con PyTorch (`torch.load` sobre `pytorch_model.bin`) y requiere la clase `SparseGPT` del repositorio del autor. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (transformers con dispersion de pesos entrenados sobre SimpleStories), ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Modelo de investigacion: 2 capas, 768 dimensiones y contexto de 512 tokens; no apto para tareas de produccion.
- Corpus de entrenamiento sintetico y limitado (SimpleStories), lo que restringe severamente la calidad y diversidad de las salidas.
- Vocabulario de solo 4096 tokens, muy inferior al de modelos de proposito general.
- Riesgo elevado de alucinacion y de generar texto incoherente fuera del dominio de historias simples.
- Licencia no disponible: no puede asumirse uso comercial sin confirmacion del autor.
- Idiomas soportados no declarados; el entrenamiento se limita a un corpus en ingles.
- La carga requiere una clase personalizada (`SparseGPT`) del repositorio del autor, lo que anade friccion de integracion.
- No dispone de pipeline declarado en HuggingFace, por lo que no se puede invocar con `pipeline()` sin trabajo adicional.
- Sesgos conocidos: no documentados, pero previsibles por el caracter sintetico del corpus.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/asher577/scaling2_plain_d768_L2_t500000000_s1
- Run de entrenamiento en Weights & Biases: https://wandb.ai/asher577/scd_scaling/runs/0es4pg0o
- Dataset de entrenamiento: https://huggingface.co/datasets/jacobcd52/simplestories-tokenized
- Tokenizador: https://huggingface.co/SimpleStories/SimpleStories-1.25M
- Referencia metodologica: Gao et al. (2025), citado en la model card; no se proporciona enlace directo en la informacion disponible.
